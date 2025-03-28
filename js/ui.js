/* 
  ui.js - Handles DOM manipulation and rendering based on the current state.
  Updates include:
    - Level display.
    - Remaining build points.
    - Level history (collapsible entries).
    - Purchased abilities list.
    - Current level stat purchases display.
*/

window.UI = {
  remainingPointsEl: null,
  levelDisplayEl: null,
  historyContainer: null,
  purchasedListEl: null,
  currentLayerEl: null,

  // Initialize and cache DOM element references.
  init: function () {
    this.remainingPointsEl = document.getElementById('remaining-points');
    this.levelDisplayEl = document.getElementById('level-display');
    this.historyContainer = document.getElementById('layer-history');
    this.purchasedListEl = document.getElementById('purchased-abilities');
    this.currentLayerEl = document.getElementById('current-layer-display');
  },

  // Update remaining build points display.
  updateRemainingPoints: function (points) {
    if (this.remainingPointsEl) {
      this.remainingPointsEl.textContent = points;
    }
  },

  // Update level display.
  updateLevelDisplay: function (level) {
    if (this.levelDisplayEl) {
      this.levelDisplayEl.textContent = level;
    }
  },

  /**
   * Adds a new entry to the level history log.
   * This is called when leveling up.
   * @param {number} levelNumber
   * @param {object} levelData - Contains stat purchases and abilities from that level.
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

  // Update the purchased abilities list.
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

      // Only show the Remove button if purchased at the current level.
      if (ability.level === Layers.currentLevel) {
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
   * Updates the display of the current level's stat purchases.
   * It reads the current Stats.currentStats and displays non-zero entries.
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
