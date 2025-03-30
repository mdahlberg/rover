/* 
  ui.js - Updates the DOM based on current state.
  Handles:
    - Level display.
    - Remaining build points.
    - Level history (summary entries).
    - Purchased abilities list.
    - Current level stat purchases display.
*/

window.UI = {
  remainingPointsEl: null,
  levelDisplayEl: null,
  historyContainer: null,
  purchasedListEl: null,
  currentLayerEl: null,

  /**
   * Initializes DOM element references.
   */
  init: function () {
    this.remainingPointsEl = document.getElementById('remaining-points');
    this.levelDisplayEl = document.getElementById('level-display');
    this.historyContainer = document.getElementById('layer-history');
    this.purchasedListEl = document.getElementById('purchased-abilities');
    this.currentLayerEl = document.getElementById('current-layer-display');
  },

  /**
   * Updates the remaining build points display.
   * @param {number} points 
   */
  updateRemainingPoints: function (points) {
    if (this.remainingPointsEl) {
      this.remainingPointsEl.textContent = points;
    }
  },

  /**
   * Updates the level display.
   * @param {number} level 
   */
  updateLevelDisplay: function (level) {
    if (this.levelDisplayEl) {
      this.levelDisplayEl.textContent = level;
    }
  },

  /**
   * Adds a new history entry when leveling up.
   * @param {number} levelNumber 
   * @param {object} levelData 
   */
  addHistoryEntry: function (levelNumber, levelData) {
    if (!this.historyContainer) return;
    let entryText = `Level ${levelNumber} reached.`;
    const statEntries = [];
    for (let stat in levelData.stats) {
      if (levelData.stats[stat] > 0) {
        statEntries.push(`${stat}: +${levelData.stats[stat]}`);
      }
    }
    entryText += ` | Stats: ${statEntries.length > 0 ? statEntries.join(', ') : '(None)'}`;
    if (levelData.abilities && levelData.abilities.length > 0) {
      entryText += ` | Abilities: ${levelData.abilities.join(', ')}`;
    } else {
      entryText += ` | Abilities: (None)`;
    }
    const entryDiv = document.createElement('div');
    entryDiv.textContent = entryText;
    this.historyContainer.appendChild(entryDiv);
  },

  /**
   * Updates the purchased abilities list.
   * Only shows a "Remove" button for abilities purchased at the current level.
   */
  updatePurchasedAbilities: function () {
    if (!this.purchasedListEl) return;
    this.purchasedListEl.innerHTML = '';
    if (Abilities.purchased.length === 0) {
      this.purchasedListEl.textContent = '(None)';
      return;
    }
    for (let ability of Abilities.purchased) {
      const item = document.createElement('div');
      item.className = 'purchased-ability-item';
      item.textContent = `${ability.name} (Level ${ability.level})`;
      if (ability.level === Layers.currentLevel && ability.id !== "gather_essence") {
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.className = 'remove-ability-btn';
        removeBtn.setAttribute('data-ability', ability.name);
        item.appendChild(removeBtn);
      }
      this.purchasedListEl.appendChild(item);
    }
  },

  /**
   * Updates the display of current level stat purchases.
   */
  updateCurrentLayerDisplay: function () {
    if (!this.currentLayerEl) return;
    const entries = [];
    for (let stat in Stats.currentStats) {
      if (Stats.currentStats[stat] > 0) {
        entries.push(`${stat}: +${Stats.currentStats[stat]}`);
      }
    }
    this.currentLayerEl.textContent = entries.length > 0 ? entries.join(', ') : '(None)';
  }
};

// ui.js - Updates the DOM based on current state, including lore UI updates.

UI.updateLoreUI = function () {
  const loreContainer = document.getElementById("lore-content");
  const unspentLores = Lores.getUnspentLores();
  const unspentBadge = document.getElementById("unspent-lores");

  // Update unspent lores badge.
  unspentBadge.textContent = `${unspentLores} Unspent`;
  unspentBadge.style.display = "inline-block";

  // Clear previous lore display.
  loreContainer.innerHTML = "";

  // Group available lores by category.
  const loresByCategory = {};
  Lores.availableLores.forEach((lore) => {
    if (!loresByCategory[lore.category]) {
      loresByCategory[lore.category] = [];
    }
    loresByCategory[lore.category].push(lore);
  });

  // Render each category and its lores.
  Object.keys(loresByCategory).forEach((category) => {
    const categoryDiv = document.createElement("div");
    categoryDiv.className = "lore-category";
    categoryDiv.innerHTML = `<h3>${category}</h3>`;

    const loreList = document.createElement("ul");
    loreList.style.listStyleType = "none";
    loreList.style.paddingLeft = "20px";

    loresByCategory[category].forEach((lore) => {
      // Check if the lore is a parent lore (like Biology).
      const childLores = Lores.getChildLores(lore.id);
      if (childLores.length > 0) {
        // Render the parent as a non-clickable header.
        const parentItem = document.createElement("li");
        parentItem.innerHTML = `<strong>${lore.name}</strong>`;
        parentItem.style.marginTop = "10px";
	parentItem.className = "lore-parent"; //Add this for better styling
        loreList.appendChild(parentItem);

        // Render all child lores under the parent.
        const childList = document.createElement("ul");
        childList.style.listStyleType = "none";
        childList.style.paddingLeft = "20px"; // Indentation for child lores.

        childLores.forEach((childLore) => {
          childList.appendChild(UI.createLoreListItem(childLore));
        });

        loreList.appendChild(childList);
      } else if (!lore.parent) {
        // Render regular lores (non-child lores).
        loreList.appendChild(UI.createLoreListItem(lore));
      }
    });

    categoryDiv.appendChild(loreList);
    loreContainer.appendChild(categoryDiv);
  });
};

/**
 * Creates a list item for a given lore with plus and minus buttons.
 * @param {object} lore - The lore object.
 * @returns {HTMLElement} The list item element.
 */
UI.createLoreListItem = function (lore) {
  const listItem = document.createElement("li");
  const selectedLores = Lores.getSelectedLores();
  const loreLevel = selectedLores[lore.id] || 0;

  // Display lore name and current level.
  listItem.innerHTML = `<span title="${lore.description}">${lore.name} (Level: ${loreLevel})</span>`;

  // Create a container for the buttons.
  const buttonContainer = document.createElement("span");
  buttonContainer.className = "lore-buttoncontainer";

  // Add minus button if the lore has points assigned.
  if (loreLevel > 0) {
    const minusButton = document.createElement("button");
    minusButton.textContent = "−";
    minusButton.className = "lore-button";
    minusButton.onclick = () => Lores.decreaseLore(lore.id);
    buttonContainer.appendChild(minusButton);
  }

  // Add plus button to increase lore level.
  const plusButton = document.createElement("button");
  plusButton.className = "lore-button";
  plusButton.textContent = "+";
  plusButton.onclick = () => Lores.increaseLore(lore.id);
  plusButton.disabled = loreLevel >= 5 || Lores.getUnspentLores() === 0;
  buttonContainer.appendChild(plusButton);

  // Append button container to the list item.
  listItem.appendChild(buttonContainer);
  return listItem;
};

