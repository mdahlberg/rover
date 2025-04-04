
// ui.js - Updates the DOM based on Layer and Point Changes

window.UI = {
  refreshAll: function () {
    // Not on the character planner page yet
    if (!document.getElementById("planner-container") || document.getElementById("planner-container").classList.contains("hidden")) {
      console.warn("UI.refreshAll() skipped — planner not visible yet.");
      return;
    }

    UI.updateBuildPoints();
    UI.updateStatsUI();
    UI.updateDerivedStats();
    UI.updateAbilityUI();
    UI.updateProficiencyUI();
    UI.updateLoreUI();
    UI.updateLayerPreview();
    UI.updateLayerHistory();
    UI.updateEssenceSlotUI();
  },

  updateLayerPreview: function () {
    const list = document.getElementById("current-layer-display");
    if (!list) {
      // Not on the character planner page yet
      console.log("Not on the character planner page yet")
      return;
    }

    console.log("Updating layer preview")

    list.innerHTML = ""; // Clear previous content
  
    const layer = Layers.currentLayer;
  
    const domains = ["stats", "abilities", "proficiencies", "lores"];
    domains.forEach(domain => {
      const entries = layer[domain];
      if (entries && Object.keys(entries).length > 0) {
        const domainHeader = document.createElement("li");
        domainHeader.innerHTML = `<strong>${domain.charAt(0).toUpperCase() + domain.slice(1)}</strong>`;
        list.appendChild(domainHeader);
  
        for (const id in entries) {
          const li = document.createElement("li");
          li.textContent = `• ${id} (${entries[id]} pts)`;
          list.appendChild(li);
        }
      }
    });
  },

  // ui.js - UI rendering and interaction logic
  
  updateEssenceSlotUI: function () {
    const container = document.getElementById("essence-slot-list");
    if (!container) return;
    container.innerHTML = "";
  
    // For each slot, 1-9, master
    EssenceSlots.levels.forEach((level) => {
      const li = document.createElement("li");
      li.classList.add("slot-entry");
  
      const label = document.createElement("span");
      label.textContent = EssenceSlots.getDisplayLabel(level);
  
      const count = document.createElement("span");
      count.textContent = `x${EssenceSlots.getTotalSlotsForLevel(level)}`;
      count.classList.add("slot-count");
  
      const cost = EssenceSlots.getCost(level);
      const canBuy = EssenceSlots.canPurchase(level);
      const isRefundable = Layers.currentLayer.essenceSlots?.[level] > 0;
  
      const addBtn = document.createElement("button");
      addBtn.textContent = cost !== null ? `+ (${cost} BP)` : "+";
      addBtn.disabled = !canBuy;
      addBtn.onclick = () => EssenceSlots.purchaseSlot(level);
  
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "-";
      removeBtn.disabled = !isRefundable;
      removeBtn.onclick = () => EssenceSlots.refundSlot(level);
  
      li.appendChild(label);
      li.appendChild(count);
      li.appendChild(addBtn);
      li.appendChild(removeBtn);
      container.appendChild(li);
    });
  },


  updateLayerHistory: function () {
    console.log("Updating layer history")
    const historyList = document.getElementById("layer-history");
    if (!historyList) return;
  
    historyList.innerHTML = "";
  
    Layers.layers.forEach((layer, index) => {
      const item = document.createElement("li");
      item.className = "layer-history-item";
      item.innerHTML = `
        <strong>Level ${index + 1}</strong><br>
        <em>Stats:</em> ${Object.entries(layer.stats || {})
          .map(([k, v]) => `${k}: +${v}`)
          .join(", ") || "None"}<br>
        <em>Abilities:</em> ${Object.entries(layer.abilities || {})
          .map(([k, v]) => `${Abilities.availableAbilities[k]?.name || k} x${v}`)
          .join(", ") || "None"}<br>
        <em>Proficiencies:</em> ${Object.keys(layer.proficiencies || {})
          .map((k) => Proficiencies.availableProficiencies[k]?.name || k)
          .join(", ") || "None"}<br>
        <em>Lores:</em> ${Object.entries(layer.lores || {})
          .map(([k, v]) => `${Lores.availableLores.find(l => l.id === k)?.name || k} x${v}`)
          .join(", ") || "None"}
      `;
      historyList.appendChild(item);
    });
  },


  /**
   * Update the UI for available build points.
   */
  updateBuildPoints: function () {
    document.getElementById("build-points").innerText = Layers.getRemainingPoints();
  },

  showCharacterPlanner: function () {
    document.getElementById("splash-container").classList.add("hidden");
    document.getElementById("planner-container").classList.remove("hidden");
  
    // Initialize buttons and update UI
    UI.refreshAll();
    UI.setupStatButtons();
  },


  /**
   * Attaches event listeners to the stat increase/decrease buttons.
   */
  setupStatButtons: function () {
    console.log("Setting up stats button")
    document.querySelectorAll(".stat-increase").forEach((button) => {
      button.addEventListener("click", function () {
        const statName = this.dataset.stat;
        Stats.increaseStat(statName);
        UI.refreshAll()
      });
    });
  
    document.querySelectorAll(".stat-decrease").forEach((button) => {
      button.addEventListener("click", function () {
        const statName = this.dataset.stat;
        if (Stats.canDecrease(statName)) {
          Stats.decreaseStat(statName);
          UI.refreshAll();
        }
      });
    });
  },

  /**
   * Updates the UI for core stat buttons to show correct point costs.
   */
  updateStatsUI: function () {
    ["body", "mind", "spirit"].forEach((statName) => {
      const increaseButton = document.querySelector(`.stat-increase[data-stat="${statName}"]`);
      const decreaseButton = document.querySelector(`.stat-decrease[data-stat="${statName}"]`);
  
      if (increaseButton) {
        const statCost = Stats.getStatCost(statName);
        increaseButton.innerHTML = `Increase (+${statCost} pts)`;
      }
      
      if (decreaseButton) {
        const statCost = Stats.getStatCost(statName); // You might not need this, but just in case
        decreaseButton.innerHTML = `Decrease (-${statCost} pts)`;
      }

      document.getElementById(`${statName}-value`).innerText = Stats.getTotal(statName);

    });
  
    console.log("Core stat buttons updated.");
  },

  /**
   * Update the UI for core stats and derived stats.
   */
  updateDerivedStats: function () {
    document.getElementById("strength-value").innerText = Math.floor(Stats.getTotal("body") / 4);
    document.getElementById("health-value").innerText = Stats.getTotal("body") + 5;
    document.getElementById("armor-value").innerText = Stats.getTotal("body") + 10;
    document.getElementById("unspent-lores").innerText = Lores.getUnspentLores();
    this.updateBuildPoints();
  },

  /**
   * Updates the current level purchases card with a summary.
   */
  updateLayerSummary: function () {
    const summaryContainer = document.getElementById("current-layer-summary");
    summaryContainer.innerHTML = "";
  
    const currentLayer = Layers.currentLayer;
    if (!currentLayer) {
      console.warn("No current layer found.");
      return;
    }
  
    let content = "<h3>Current Level Purchases</h3>";
  
    // Stats
    Object.keys(currentLayer.stats).forEach((stat) => {
      if (currentLayer.stats[stat] > 0) {
        content += `<p>${stat.charAt(0).toUpperCase() + stat.slice(1)}: +${currentLayer.stats[stat]}</p>`;
      }
    });
  
    // Abilities
    Object.keys(currentLayer.abilities).forEach((ability) => {
      if (currentLayer.abilities[ability] > 0) {
        content += `<p>Ability: ${ability} (${currentLayer.abilities[ability]}x)</p>`;
      }
    });
  
    // Proficiencies
    Object.keys(currentLayer.proficiencies).forEach((proficiency) => {
      if (currentLayer.proficiencies[proficiency] > 0) {
        content += `<p>Proficiency: ${proficiency}</p>`;
      }
    });
  
    // Lores
    Object.keys(currentLayer.lores).forEach((lore) => {
      if (currentLayer.lores[lore] > 0) {
        content += `<p>Lore: ${lore} (${currentLayer.lores[lore]}x)</p>`;
      }
    });
  
    // Add the content or show a placeholder if nothing was purchased
    summaryContainer.innerHTML = content || "<p>No purchases this level.</p>";
  },

  /**
   * Update the ability shop UI.
   */
  updateAbilityUI: function () {
    const abilityContainer = document.getElementById("ability-shop");
    abilityContainer.innerHTML = "";
  
    Object.keys(Abilities.availableAbilities).forEach((abilityId) => {
      const ability = Abilities.availableAbilities[abilityId];
  
      const item = document.createElement("div");
      item.className = "ability-item";
  
      // Header with name and cost
      const header = document.createElement("div");
      header.className = "ability-header";
  
      const name = document.createElement("strong");
      name.className = "ability-name";
      name.textContent = ability.name;
      name.title = ability.description;

      // Show badge stacking
      const badge = document.createElement("span");
      badge.className = "ability-badge";

      const count = Abilities.getPurchaseCount(abilityId)
      badge.textContent = `x${count}`;
      if (count === 0) badge.classList.add("muted");
      header.appendChild(badge);

      const cost = document.createElement("span");
      cost.className = "ability-cost";
      cost.textContent = `(${ability.cost} BP)`;
  
      header.appendChild(name);
      header.appendChild(cost);
  
      // Description
      const description = document.createElement("div");
      description.className = "ability-description";
      description.textContent = ability.description;
  
      // Action buttons
      const actions = document.createElement("div");
      actions.className = "ability-actions";

      const plus = document.createElement("button");
      plus.textContent = "+";
      plus.disabled = Layers.getRemainingPoints() < ability.cost;
      plus.onclick = () => {
        Abilities.purchaseAbility(abilityId, ability.cost);
        UI.refreshAll();
      };
      
      const minus = document.createElement("button");
      minus.textContent = "-";
      minus.disabled = count === 0;
      minus.onclick = () => {
        Abilities.removeAbility(abilityId);
        UI.refreshAll();
      };
      
      actions.appendChild(minus);
      actions.appendChild(plus);
  
      // Assemble the item
      item.appendChild(header);
      item.appendChild(description);
      item.appendChild(actions);
  
      abilityContainer.appendChild(item);
    });
  
    this.updateBuildPoints();
  },

  /**
   * Update the proficiency shop UI.
   */
  updateProficiencyUI: function () {
    const container = document.getElementById("proficiency-shop");
    container.innerHTML = "";
  
    Object.entries(Proficiencies.availableProficiencies).forEach(([id, prof]) => {
      const item = document.createElement("div");
      item.className = "ability-item";
  
      const header = document.createElement("div");
      header.className = "ability-header";
  
      const name = document.createElement("strong");
      name.className = "ability-name";
      name.textContent = prof.name;
      name.title = prof.description;
  
      const cost = document.createElement("span");
      cost.className = "ability-cost";
      cost.textContent = `(${prof.cost} BP)`;
  
      header.appendChild(name);
      header.appendChild(cost);
  
      const desc = document.createElement("div");
      desc.className = "ability-description";
      desc.textContent = prof.description;
  
      const actions = document.createElement("div");
      actions.className = "ability-actions";
  
      const button = document.createElement("button");
  
      if (Proficiencies.isProficiencyPurchased(id)) {
        button.textContent = "Remove";
        button.onclick = () => {
          Proficiencies.removeProficiency(id);
          UI.refreshAll();
        };
      } else {
        button.textContent = `Purchase (${prof.cost} BP)`;
        button.disabled = Layers.getRemainingPoints() < prof.cost;
        button.onclick = () => {
          Proficiencies.purchaseProficiency(id);
          UI.refreshAll();
        };
      }
  
      actions.appendChild(button);
      item.appendChild(header);
      item.appendChild(desc);
      item.appendChild(actions);
      container.appendChild(item);
    });
  },

  /**
   * Update the lore system UI.
   */
  updateLoreUI: function () {
    const container = document.getElementById("lore-content");
    if (!container) return;
    container.innerHTML = "";
    console.log("updating lores card")
  
    const categories = ["General", "Knowledge"];
  
    categories.forEach(category => {
      // Section Header
      const sectionTitle = document.createElement("div");
      sectionTitle.className = "lore-section";
      sectionTitle.innerText = category;
      container.appendChild(sectionTitle);
  
      // Pull lores from this category that are not Biology children
      const lores = Lores.availableLores.filter(l =>
        l.category === category && !l.parent
      );
  
      lores.forEach(lore => {
        if (lore.id === "biology") {
          // Biology header
          const biologyHeader = document.createElement("div");
          biologyHeader.className = "lore-subgroup";
          biologyHeader.innerText = "Biology";
          container.appendChild(biologyHeader);
  
          // Get children of biology
          const bioChildren = Lores.getChildLores("biology");
          bioChildren.forEach(childLore => {
            container.appendChild(UI.createLoreItem(childLore, true)); // pass true for extra indent
          });
        } else {
          container.appendChild(UI.createLoreItem(lore));
        }
      });
    });
  },

  /**
   * Creates an individual lore item to display in the UI.
   * @param {object} lore - The lore object.
   * @param {string} parentId - Optional parent ID for nested lores.
   * @returns {HTMLElement} The list item for the lore.
   */
  createLoreItem: function (lore, parentId = null) {
    const listItem = document.createElement("div");
    listItem.className = `lore-item ${parentId ? "sub-lore" : ""}`;
  
    // Controls container (left-aligned buttons)
    const controls = document.createElement("span");
    controls.className = "lore-controls";
  
    const minus = document.createElement("button");
    minus.textContent = "-";
    minus.disabled = !Lores.canDecreaseLore(lore.id);
    minus.onclick = () => {
      if (Lores.removeLore(lore.id)) UI.refreshAll();
    };
  
    const plus = document.createElement("button");
    plus.textContent = "+";
    plus.disabled = !Lores.canIncreaseLore(lore.id);
    plus.onclick = () => {
      if (Lores.purchaseLore(lore.id)) UI.refreshAll();
    };
  
    controls.appendChild(minus);
    controls.appendChild(plus);
  
    // Label container (text and level)
    const label = document.createElement("span");
    label.textContent = `${lore.name} ${Lores.isSelected(lore.id) ? `(Level ${Lores.selectedLores[lore.id] || 0})` : ""}`;
    label.title = lore.description;
  
    // Combine and return
    listItem.appendChild(controls);
    listItem.appendChild(label);
    return listItem;
  },
};
