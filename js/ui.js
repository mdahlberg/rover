// ui.js - Handles updating DOM elements for points, level display, history, and purchased abilities
window.UI = {
    // Cached DOM elements (to be set in init)
    remainingPointsEl: null,
    levelDisplayEl: null,
    historyContainer: null,
    purchasedListEl: null,
    init: function() {
        // Get references to DOM elements by their IDs
        this.remainingPointsEl = document.getElementById('remaining-points');
        this.levelDisplayEl = document.getElementById('level-display');
        this.historyContainer = document.getElementById('layer-history');
        this.purchasedListEl = document.getElementById('purchased-abilities');
    },
    // Update remaining build points display
    updateRemainingPoints: function(points) {
        if (this.remainingPointsEl) {
            this.remainingPointsEl.textContent = points;
        }
    },
    // Update current level display
    updateLevelDisplay: function(level) {
        if (this.levelDisplayEl) {
            this.levelDisplayEl.textContent = level;
        }
    },
    // Add an entry to the layer history log for a completed level
    addHistoryEntry: function(levelNumber, levelData) {
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
    // Update the list of purchased abilities displayed in the UI
    updatePurchasedAbilities: function() {
        if (!this.purchasedListEl) return;
        this.purchasedListEl.innerHTML = '';
        if (Abilities.purchased.length === 0) {
            this.purchasedListEl.textContent = '(None)';
            return;
        }
        for (let ability of Abilities.purchased) {
            const item = document.createElement('div');
            item.className = 'purchased-ability-item';
            item.textContent = `${ability.name} (Level ${ability.levelAcquired})`;
            // Add a remove button for the ability
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.className = 'remove-ability-btn';
            removeBtn.setAttribute('data-ability', ability.name);
            item.appendChild(removeBtn);
            this.purchasedListEl.appendChild(item);
        }
    }
};

