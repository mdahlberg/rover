
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
        Stats.decreaseStat(statName);
        UI.refreshAll();
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
      const listItem = document.createElement("li");
      listItem.innerHTML = `
        <strong title="${ability.description}">${ability.name}</strong>
        ${
          Abilities.isAbilityPurchased(abilityId)
            ? '<button onclick="Abilities.removeAbility(\'' + abilityId + '\')">Remove</button>'
            : '<button onclick="Abilities.purchaseAbility(\'' + abilityId + '\', ' + ability.cost + ')">Purchase (' + ability.cost + ' BP)</button>'
        }
      `;

      abilityContainer.appendChild(listItem);
    });
    this.updateBuildPoints();
  },

  /**
   * Update the proficiency shop UI.
   */
  updateProficiencyUI: function () {
    const proficiencyContainer = document.getElementById("proficiency-content");
    const selectedContainer = document.getElementById("selected-proficiencies");
    proficiencyContainer.innerHTML = "";
    selectedContainer.innerHTML = "";

    Object.keys(Proficiencies.availableProficiencies).forEach((profId) => {
      const prof = Proficiencies.availableProficiencies[profId];
      const listItem = document.createElement("li");
      listItem.innerHTML = `
        <strong title="${prof.description}">${prof.name}</strong>
        ${
          Proficiencies.isProficiencyPurchased(profId)
            ? '<button onclick="Proficiencies.removeProficiency(\'' + profId + '\')">Remove</button>'
            : '<button onclick="Proficiencies.purchaseProficiency(\'' + profId + '\', ' + prof.cost + ')">Purchase (' + prof.cost + ' BP)</button>'
        }
      `;
      proficiencyContainer.appendChild(listItem);
    });

    // Display selected proficiencies
    Object.keys(Proficiencies.purchasedProficiencies).forEach((profId) => {
      const prof = Proficiencies.availableProficiencies[profId];
      const listItem = document.createElement("li");
      listItem.innerHTML = `<strong>${prof.name}</strong>`;
      selectedContainer.appendChild(listItem);
    });

    this.updateBuildPoints();
  },

  /**
   * Update the lore system UI.
   */
  updateLoreUI: function () {
    const loreContainer = document.getElementById("lore-content");
    if (!loreContainer) return;
    loreContainer.innerHTML = "";
  
    Object.keys(Lores.availableLores).forEach((loreId) => {
      const lore = Lores.availableLores[loreId];
      if (lore.isParent) {
        // Create parent category
        const parentContainer = document.createElement("div");
        parentContainer.className = "lore-category";
        parentContainer.innerHTML = `<h3>${lore.name}</h3>`;
        
        // Get child lores and add them below the parent
        const childLores = Lores.getChildLores(loreId);
        childLores.forEach((childLore) => {
          const childItem = UI.createLoreItem(childLore, loreId);
          parentContainer.appendChild(childItem);
        });
        loreContainer.appendChild(parentContainer);
      } else if (!lore.parent) {
        // Render regular lore not part of a parent
        const listItem = UI.createLoreItem(lore);
        loreContainer.appendChild(listItem);
      }
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
    listItem.innerHTML = `
      <strong title="${lore.description}">${lore.name}</strong>
      ${
        Lores.isSelected(lore.id)
          ? '<button onclick="Lores.removeLore(\'' +
            lore.id +
            '\')">-</button>'
          : Lores.getUnspentLores() > 0
          ? '<button onclick="Lores.purchaseLore(\'' +
            lore.id +
            '\')">+</button>'
          : ""
      }
      ${
        Lores.isSelected(lore.id)
          ? `<span>Level ${Lores.selectedLores[lore.id] || 0}</span>`
          : ""
      }
    `;
    return listItem;
  },
};
