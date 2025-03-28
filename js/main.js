/* 
  main.js - Sets up event handlers and initializes the application.
  It dynamically updates button labels for stat increases/decreases and ensures
  that the current level layer (stat purchases) is updated in real time.
*/

// Updates button labels to reflect the true cost for stat changes.
function updateStatButtonLabels() {
  const currentLevel = Layers.currentLevel;
  document.querySelectorAll('.stat-line').forEach(statLine => {
    const statName = statLine.querySelector('.stat-increase').getAttribute('data-stat');
    const totalValue = Stats.getTotal(statName);
    const incCost = Stats.getIncrementCost(currentLevel, totalValue + 1);
    const decCost = Stats.getIncrementCost(currentLevel, totalValue);
    const incBtn = statLine.querySelector('.stat-increase');
    const decBtn = statLine.querySelector('.stat-decrease');
    incBtn.textContent = `Increase (+${incCost} pts)`;
    decBtn.textContent = `Decrease (+${decCost} pts)`;
  });
}

// Set up event listeners after DOM content is loaded.
window.addEventListener('DOMContentLoaded', function () {
  UI.init();
  UI.updateLevelDisplay(Layers.currentLevel);
  UI.updateRemainingPoints(Layers.getRemainingPoints());
  Abilities.renderShop();
  UI.updatePurchasedAbilities();
  updateStatButtonLabels();
  UI.updateCurrentLayerDisplay();

  // Stat increase handler.
  document.querySelectorAll('.stat-increase').forEach(button => {
    button.addEventListener('click', () => {
      const statName = button.getAttribute('data-stat');
      const cost = Stats.getIncrementCost(Layers.currentLevel, Stats.getTotal(statName) + 1);
      if (cost <= Layers.getRemainingPoints() && Stats.canIncrease(statName)) {
        Stats.increaseStat(statName, Layers.currentLevel);
        document.getElementById(`${statName}-value`).textContent = Stats.getTotal(statName);
        Layers.updateCurrentLayer();
        UI.updateRemainingPoints(Layers.getRemainingPoints());
        updateStatButtonLabels();
        UI.updateCurrentLayerDisplay();
      } else {
        alert("Not enough build points or stat maxed out.");
      }
    });
  });

  // Stat decrease handler.
  document.querySelectorAll('.stat-decrease').forEach(button => {
    button.addEventListener('click', () => {
      const statName = button.getAttribute('data-stat');
      if (Stats.canDecrease(statName)) {
        Stats.decreaseStat(statName, Layers.currentLevel);
        document.getElementById(`${statName}-value`).textContent = Stats.getTotal(statName);
        Layers.updateCurrentLayer();
        UI.updateRemainingPoints(Layers.getRemainingPoints());
        updateStatButtonLabels();
        UI.updateCurrentLayerDisplay();
      }
    });
  });

  // Level Up button handler.
  document.getElementById('level-up-btn').addEventListener('click', () => {
    Layers.levelUp();
    // Update displayed stat values to show new locked totals.
    for (let stat in Stats.lockedStats) {
      document.getElementById(`${stat}-value`).textContent = Stats.getTotal(stat);
    }
    updateStatButtonLabels();
    UI.updateRemainingPoints(Layers.getRemainingPoints());
    // Clear current layer display since current level purchases are now locked.
    UI.updateCurrentLayerDisplay();
    // Re-render purchased abilities so that remove buttons disappear for previous levels.
    UI.updatePurchasedAbilities();
  });

  // Ability Shop: Handle ability purchases via event delegation.
  const abilityShopEl = document.getElementById('ability-shop');
  if (abilityShopEl) {
    abilityShopEl.addEventListener('click', (event) => {
      if (event.target.classList.contains('buy-ability-btn')) {
        const abilityId = event.target.getAttribute('data-ability');
        Abilities.purchaseAbility(abilityId);
      }
    });
  }

  // Purchased Abilities: Handle ability removals via event delegation.
  const purchasedListEl = document.getElementById('purchased-abilities');
  if (purchasedListEl) {
    purchasedListEl.addEventListener('click', (event) => {
      if (event.target.classList.contains('remove-ability-btn')) {
        const abilityName = event.target.getAttribute('data-ability');
        Abilities.removeAbility(abilityName);
      }
    });
  }
});
