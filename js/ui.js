
window.UI = {
  remainingPointsEl: null,
  levelDisplayEl: null,
  historyContainer: null,
  purchasedListEl: null,
  init: function () {
    this.remainingPointsEl = document.getElementById('remaining-points');
    this.levelDisplayEl = document.getElementById('level-display');
    this.historyContainer = document.getElementById('layer-history');
    this.purchasedListEl = document.getElementById('purchased-abilities');
  },
  updateRemainingPoints: function (points) {
    if (this.remainingPointsEl) {
      this.remainingPointsEl.textContent = points;
    }
  },
  updateLevelDisplay: function (level) {
    if (this.levelDisplayEl) {
      this.levelDisplayEl.textContent = level;
    }
  },
  addHistoryEntry: function (levelNumber, levelData) {
    if (!this.historyContainer) return;
    let entryText = `Level ${levelNumber} reached.`;
    if (levelData.abilities && levelData.abilities.length > 0) {
      entryText += ` Abilities acquired: ${levelData.abilities.join(', ')}`;
    } else {
      entryText += ` No new abilities acquired.`;
    }
    const entryDiv = document.createElement('div');
    entryDiv.textContent = entryText;
    this.historyContainer.appendChild(entryDiv);
  },
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

      if (ability.level === Layers.currentLevel) {
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.className = 'remove-ability-btn';
        removeBtn.setAttribute('data-ability', ability.name);
        item.appendChild(removeBtn);
      }

      this.purchasedListEl.appendChild(item);
    }
  }
};
