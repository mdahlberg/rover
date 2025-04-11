
// ui.js - Updates the DOM based on Layer and Point Changes

window.UI = {
  refreshAll: function () {
    // Not on the character planner page yet
    if (!document.getElementById("planner-container") || document.getElementById("planner-container").classList.contains("hidden")) {
      console.warn("UI.refreshAll() skipped — planner not visible yet.");
      return;
    }

    UI.updateStatsUI();
    UI.updateDerivedStats();
    UI.updateAbilityUI();
    UI.updateProficiencyUI();
    UI.updateLoreUI();
    UI.updateLayerPreview();
    UI.updateLayerHistory();
    UI.updateEssenceSlotUI();
    UI.updateGlobalBuildPoints();
  },

  // Special handling for Gather Essence

  updateDerivedAbilities: function () {
    const count = Abilities.getDerivedUses("gather_essence");
    Abilities.derivedAbilities = { gather_essence: count };

    const derivedId = "gather_essence";

    // Remove old derived (in case we lost a spirit point)
    Abilities.derivedAbilities = Abilities.derivedAbilities || {};
    Abilities.derivedAbilities[derivedId] = count;

    UI.updateAbilityUI(); // re-render entire list with new values
  },

  flashWarning: function(message, duration = 3000) {
    console.warn("call flash warning")
    const warningEl = document.getElementById('global-warning');
    if (!warningEl) return;
  
    warningEl.textContent = message;
    warningEl.classList.remove('hidden');
  
    // Optional: Add a fade-in effect
    warningEl.style.opacity = '1';
  
    setTimeout(() => {
      warningEl.style.opacity = '0';
      setTimeout(() => {
        warningEl.classList.add('hidden');
        warningEl.textContent = '';
      }, 300); // wait for fade-out to finish
    }, duration);
  },

  updateLayerPreview: function () {
    const list = document.getElementById("current-layer-display");
    if (!list) return;

    list.innerHTML = "";

    const layer = Layers.currentLayer;
    const points = layer.points || {};

    // Defer to each system's own renderer
    const fragments = [];

    // Stats preview
    if (points.stats && Object.keys(points.stats).length > 0) {
      const header = document.createElement("li");
      header.innerHTML = `<strong>Stats</strong>`;
      fragments.push(header);

      for (const stat in points.stats) {
        const li = document.createElement("li");

        const totalBP = points.stats[stat]; // This is the total cost already stored
        const purchaseCount = Stats.currentLayerStats?.[stat] || 0; // How many times it was bought this layer

        li.textContent = `• ${stat} x${purchaseCount} (${totalBP} BP)`;
        fragments.push(li);
      }
    }

    // Abilities preview
    if (points.abilities && Object.keys(points.abilities).length > 0) {
      const header = document.createElement("li");
      header.innerHTML = `<strong>Abilities</strong>`;
      fragments.push(header);
      for (const id in points.abilities) {
        let count = Abilities.currentLayerPurchasedAbilities?.[id] || 0;
        const ability = Abilities.getAbilityById?.(id);
        const name = ability?.name || id;
        const cost = ability?.cost || 0;
        const isRacial = window.RacialLocks?.abilities?.has(id);
        const tag = isRacial ? " - Race Bonus" : "";
        let totalCost = 0;

        if (count > 0 && isRacial && Layers.getCurrentLevel() === 1) {
          // Take one off for the race
          totalCost = (count - 1) * cost;
        } else {
          totalCost = count * cost;
        }

        const li = document.createElement("li");
        li.textContent = `• ${name} x${count} (${totalCost} BP)${tag}`;
        fragments.push(li);
      }
    }

    // Proficiencies preview
    if (points.proficiencies && Object.keys(points.proficiencies).length > 0) {
      const header = document.createElement("li");
      header.innerHTML = `<strong>Proficiencies</strong>`;
      fragments.push(header);
      for (const id in points.proficiencies) {
        const prof = Proficiencies.getProficiencyById?.(id);
        const name = prof?.name || id;
        const cost = points.proficiencies[id];
        isRacial = window.RacialLocks?.proficiencies?.has(id);
        const badge = isRacial ? ' - Race Bonus' : "";

        const li = document.createElement("li");
        li.textContent = `• ${name} (${cost} BP)${badge}`;
        fragments.push(li);
      }
    }

    // Lores preview
    if (points.lores && Object.keys(points.lores).length > 0) {
      const header = document.createElement("li");
      header.innerHTML = `<strong>Lores</strong>`;
      fragments.push(header);
      for (const id in points.lores) {
        const count = points.lores[id];
        const lore = Lores.availableLores.find(l => l.id === id);
        const name = lore?.name || id;
        const li = document.createElement("li");
        li.textContent = `• ${name} x${count}`;
        fragments.push(li);
      }
    }

    // Essence slots preview
    if (points.essenceSlots && Object.keys(points.essenceSlots).length > 0) {
      const header = document.createElement("li");
      header.innerHTML = `<strong>EssenceSlots</strong>`;
      fragments.push(header);
      for (const id in points.essenceSlots) {
        const count = EssenceSlots.getSlotCount?.(id) || 0;
        const cost = EssenceSlots.getCost(id) || 0;
        const li = document.createElement("li");
        li.textContent = `• Essence Slot Lvl ${id} x${count} (${count * cost} BP)`;
        fragments.push(li);
      }
    }

    // Append all items to the DOM
    fragments.forEach(el => list.appendChild(el));
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
      const isRefundable = EssenceSlots.isRefundable(level);

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
    console.log("Updating layer history");
    const historyList = document.getElementById("layer-history");
    if (!historyList) return;

    historyList.innerHTML = "";

    Layers.layers.forEach((layer, index) => {
      const points = layer.points || {};
      const item = document.createElement("li");
      item.className = "layer-history-item";

      const stats = Object.entries(layer.stats || {})
        .map(([k, v]) => `${k}: +${v}`)
        .join(", ") || "None";

      const abilities = Object.keys(layer.abilities || {})
        .map((k) => {
          const name = Abilities.availableAbilities[k]?.name || k;
          const count = layer.abilities[k];
          return `${name} x${count}`;
        })
        .join(", ") || "None";

      const proficiencies = Object.keys(layer.proficiencies || {})
        .map((k) => Proficiencies.availableProficiencies[k]?.name || k)
        .join(", ") || "None";

      const lores = Object.entries(layer.lores || {})
        .map(([k, v]) => {
          const name = Lores.availableLores.find(l => l.id === k)?.name || k;
          return `${name} x${v}`;
        })
        .join(", ") || "None";

      const essence = Object.entries(layer.essenceSlots || {})
        .map(([k, v]) => `Lvl ${k} x${v}`)
        .join(", ") || "None";

      item.innerHTML = `
        <strong>Level ${index + 1}</strong><br>
        <em>Stats:</em> ${stats}<br>
        <em>Abilities:</em> ${abilities}<br>
        <em>Proficiencies:</em> ${proficiencies}<br>
        <em>Lores:</em> ${lores}<br>
        <em>Essence Slots:</em> ${essence}
      `;

      historyList.appendChild(item);
    });
  },

  showCharacterPlanner: function () {
    document.getElementById("splash-container").classList.add("hidden");
    document.getElementById("planner-container").classList.remove("hidden");

    this.setupEarnedBPButton();

    // Initialize buttons and update UI
    UI.refreshAll();
    UI.setupStatButtons();
  },

  /**
   * Set up listener for earned BP button
   */
  setupEarnedBPButton: function () {
    const input = document.getElementById('earned-bp-input');
    const feedback = document.getElementById('bp-add-feedback');
    const warning = document.getElementById('bp-warning');
  
    // On input, set max allowed based on level threshold logic
    input.addEventListener('input', () => {
      const value = parseInt(input.value, 10) || 0;
      const maxSafe = BPLeveling.getMaxSafeEarnedBP();
  
      input.max = maxSafe;
  
      if (value > maxSafe) {
        warning.classList.remove('hidden');
        warning.textContent = `⚠️ Max allowed is ${maxSafe} to avoid leveling up more than once. Add more BP after leveling.`;
      } else {
        warning.classList.add('hidden');
        warning.textContent = '';
      }
    });
  
    // On Add BP button click
    document.getElementById('add-earned-bp').addEventListener('click', () => {
      let amount = parseInt(input.value, 10);
  
      if (isNaN(amount) || amount <= 0) {
        feedback.textContent = 'Enter a valid number!';
        feedback.style.color = 'red';
        feedback.classList.add('show');
        setTimeout(() => feedback.classList.remove('show'), 2000);
        return;
      }
  
      const maxSafe = BPLeveling.getMaxSafeEarnedBP();
  
      if (amount > maxSafe) {
        // We already have a warning displayed, just cancel the op
        amount = maxSafe;
        return ;
      }

      // Apply BP and update state
      const applied = BPLeveling.addEarnedBP(amount);
  
      if (!applied) return;

      feedback.textContent = `+${amount} BP added!`;
      feedback.style.color = 'green';
      feedback.classList.add('show');
      setTimeout(() => feedback.classList.remove('show'), 2000);
  
      // Clear input + warning
      input.value = '';
      warning.classList.add('hidden');
      warning.textContent = '';
    });
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
        // Get the cost of the next level up
        const statCost = Stats.getStatCost(statName);
        increaseButton.innerHTML = `Increase (+${statCost} pts)`;

        const status = Stats.canIncrease(statName);
        if (!status.allowed) {
          increaseButton.disabled = true;
          increaseButton.title = status.reason;
        } else {
          increaseButton.disabled = false;
          increaseButton.title = "";
        }
      }

      if (decreaseButton) {
        // Refund the cost of the next level down
        const statCost = Stats.getStatCost(statName, -1);
        decreaseButton.innerHTML = `Decrease (-${statCost} pts)`;

        const status = Stats.canDecrease(statName);
        if (!status.allowed) {
          decreaseButton.disabled = true;
          decreaseButton.title = status.reason;
        } else {
          decreaseButton.disabled = false;
          decreaseButton.title = "";
        }
      }

      const currentStatValue = Stats.getTotal(statName)
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
    this.updateGlobalBuildPoints();
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

    const allAbilities = Abilities.availableAbilities;

    // ===== Render Derived Abilities First =====
    Object.entries(Abilities.derivedAbilities || {}).forEach(([id, count]) => {
      const ability = allAbilities[id];
      if (!ability) return;

      const item = document.createElement("div");
      item.className = "ability-item derived";

      // Header
      const header = document.createElement("div");
      header.className = "ability-header";

      const name = document.createElement("strong");
      name.className = "ability-name";
      name.textContent = ability.name;
      name.title = ability.description;

      const badge = document.createElement("span");
      badge.className = "ability-badge";
      badge.textContent = `x${count}`;

      header.appendChild(badge);
      header.appendChild(name);

      // Description
      const description = document.createElement("div");
      description.className = "ability-description";
      description.textContent = ability.description;

      item.appendChild(header);
      item.appendChild(description);

      abilityContainer.appendChild(item);
    });

    // ===== Render Regular Abilities =====
    Object.keys(allAbilities).forEach((abilityId) => {
      const ability = allAbilities[abilityId];
      const isRacial = window.RacialLocks?.abilities?.has(abilityId);

      // Skip derived abilities in the main shop list
      if (ability.derived === true) return;

      const item = document.createElement("div");
      item.className = "ability-item";

      if (ability.weaponProperties && ability.weaponProperties.length > 0) {
        const badgeContainer = document.createElement("div");
        badgeContainer.className = "property-badges";

        ability.weaponProperties.forEach((propId) => {
          const prop = WeaponProperties.availableProperties[propId];
          const playerHas = WeaponProperties.getPlayerProperties().has(propId);

          const badge = document.createElement("span");
          badge.className = "property-badge " + (playerHas ? "owned" : "missing");
          badge.textContent = prop?.name || propId;
          badge.title = prop?.description || "";

          badgeContainer.appendChild(badge);
        });

        item.appendChild(badgeContainer);
      }


      // Header with name and cost
      const header = document.createElement("div");
      header.className = "ability-header";

      const name = document.createElement("strong");
      name.className = "ability-name";
      name.textContent = ability.name;
      name.title = ability.description;

      if (isRacial) {
        item.classList.add("racial-ability");
        const racialTag = document.createElement("span");
        racialTag.className = "racial-tag";

        // TODO - I don't love this but oh well
        racialTag.textContent = "(Racial)";
        name.appendChild(racialTag);
      }

      const badge = document.createElement("span");
      badge.className = "ability-badge";

      const count = Abilities.getPurchaseCount(abilityId);
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

      // Actions
      const canPurchase = Abilities.canPurchase(abilityId);
      const actions = document.createElement("div");
      actions.className = "ability-actions";

      const plus = document.createElement("button");
      plus.textContent = "+";
      plus.disabled = Layers.getRemainingPoints() < ability.cost || !canPurchase;
      plus.onclick = () => {
        Abilities.purchaseAbility(abilityId, ability.cost);
        UI.refreshAll();
      };

      const minus = document.createElement("button");
      minus.textContent = "-";
      minus.disabled = count === 0 || !Abilities.canRefund(abilityId);
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

    this.updateGlobalBuildPoints();
  },

  /**
   * Update the proficiency shop UI.
   */
  updateProficiencyUI: function () {
    const container = document.getElementById("proficiency-shop");
    container.innerHTML = "";

    Object.entries(Proficiencies.availableProficiencies).forEach(([id, prof]) => {
      const isRacial = window.RacialLocks?.proficiencies?.has(id);

      // Add property badges
      const grantedProps = [];
      for (const [propId, prop] of Object.entries(WeaponProperties.availableProperties)) {
        if (prop.grantedBy?.includes(id)) {
          grantedProps.push({ id: propId, name: prop.name });
        }
      }

      const item = document.createElement("div");
      const label = document.createElement("strong");

      label.title = prof.description;

      item.className = "ability-item";

      if (isRacial) {
        item.classList.add("racial-proficiency");
        label.innerHTML += ' <span class="racial-tag">(Racial)</span>';
        item.appendChild(label);
      }

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

      let owned = false;
      if (Proficiencies.isPurchased(id)) {
        owned = true;
        button.textContent = "Remove";
        button.disabled = !Proficiencies.canRefund(id);
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

      if (grantedProps.length > 0) {
        const badgeContainer = document.createElement("div");
        badgeContainer.className = "property-badges";

        grantedProps.forEach((prop) => {
          const badge = document.createElement("span");
          badge.className = "property-badge " + (owned ? "owned" : "missing")
          badge.textContent = prop.name;
          badge.title = WeaponProperties.availableProperties[prop.id]?.description || prop.id;
          badgeContainer.appendChild(badge);
        });

        item.appendChild(badgeContainer);
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

  updateGlobalBuildPoints: function () {
    const total = BPLeveling.earnedBP;
    const spent = Layers.getTotalPointsSpent();
    const remaining = total - spent;
    const toLevel = BPLeveling.getBPToLevel();

    document.getElementById("total-bp").textContent = total;
    document.getElementById("spent-bp").textContent = spent;
    document.getElementById("remaining-bp").textContent = remaining;
    document.getElementById("to-level-bp").textContent = toLevel;
  },
};

