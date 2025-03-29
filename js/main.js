/* 
  main.js - Initializes the application, handles event listeners, and updates the UI.
  This version supports the integrated splash/character planner approach.
*/

// --- Utility Functions ---

/**
 * Updates the dynamic text on Increase/Decrease buttons to reflect true costs.
 */
function updateStatButtonLabels() {
  const currentLevel = Layers.currentLevel;
  document.querySelectorAll('.stat-line').forEach(statLine => {
    const statName = statLine.querySelector('.stat-increase').getAttribute('data-stat');
    const totalValue = Stats.getTotal(statName); // locked + current
    const incCost = Stats.getIncrementCost(currentLevel, totalValue + 1);
    const decCost = Stats.getIncrementCost(currentLevel, totalValue);
    const incBtn = statLine.querySelector('.stat-increase');
    const decBtn = statLine.querySelector('.stat-decrease');
    incBtn.textContent = `Increase (+${incCost} pts)`;
    decBtn.textContent = `Decrease (+${decCost} pts)`;
  });
}

/**
 * Updates derived stats based on the "body" stat.
 * Derived Health = body score + 5
 * Derived Strength = floor(body score / 4)
 */
function updateDerivedStats() {
  const bodyTotal = Stats.getTotal('body');
  const derivedHealth = bodyTotal + 5;
  const derivedStrength = Math.floor(bodyTotal / 4);
  const healthElem = document.getElementById('derived-health');
  const strengthElem = document.getElementById('derived-strength');
  if (healthElem) healthElem.textContent = derivedHealth;
  if (strengthElem) strengthElem.textContent = derivedStrength;
}

// --- Initialization: Check for Race Selection and Setup UI ---

window.addEventListener('DOMContentLoaded', function () {
  // Check if a race was previously selected.
  const selectedRace = localStorage.getItem('selectedRace');
  if (selectedRace) {
    // If race is selected, hide the splash screen and show the planner.
    document.getElementById('splash-container').classList.add('hidden');
    document.getElementById('planner-container').classList.remove('hidden');

    // Retrieve starting build points and update Layers.
    const startingBP = parseInt(localStorage.getItem('startingBP')) || 50;
    Layers.buildPoints = startingBP;

    // Update each stat's display using locked stats plus current purchases.
    const stats = ['body', 'mind', 'spirit'];
    stats.forEach(stat => {
      const elem = document.getElementById(`${stat}-value`);
      if (elem) {
        elem.textContent = Stats.getTotal(stat);
      }
    });
  } else {
    // No race selected: show splash, hide planner.
    document.getElementById('splash-container').classList.remove('hidden');
    document.getElementById('planner-container').classList.add('hidden');
    // Exit further initialization since planner won't be active.
    return;
  }

  // Initialize UI components.
  UI.init();
  UI.updateLevelDisplay(Layers.currentLevel);
  UI.updateRemainingPoints(Layers.getRemainingPoints());
  Abilities.renderShop();
  UI.updatePurchasedAbilities();
  updateStatButtonLabels();
  UI.updateCurrentLayerDisplay();
  updateDerivedStats();
  UI.updateLoreUI()

  // --- Event Listeners for Stat Adjustments ---
  // Increase stat button
  document.querySelectorAll('.stat-increase').forEach(button => {
    button.addEventListener('click', () => {
      const statName = button.getAttribute('data-stat');
      const currentLevel = Layers.currentLevel;
      const cost = Stats.getIncrementCost(currentLevel, Stats.getTotal(statName) + 1);
      if (cost <= Layers.getRemainingPoints() && Stats.canIncrease(statName)) {
        // Increase the current stat purchase for this stat.
        Stats.increaseStat(statName, currentLevel);
        // Update the stat display.
        document.getElementById(`${statName}-value`).textContent = Stats.getTotal(statName);
        // Update the current layer record.
        Layers.updateCurrentLayer();
        // Update remaining build points.
        UI.updateRemainingPoints(Layers.getRemainingPoints());
        // Refresh button labels and derived stats if "body" was modified.
        updateStatButtonLabels();
        UI.updateCurrentLayerDisplay();
        if (statName === "body") {
          updateDerivedStats();
        } else if (statName === "spirit") {
	  Abilities.updateGatherEssenceDerived();
        }
      } else {
        alert("Not enough build points or stat maxed out.");
      }
    });
  });

  // Decrease stat button
  document.querySelectorAll('.stat-decrease').forEach(button => {
    button.addEventListener('click', () => {
      const statName = button.getAttribute('data-stat');
      const currentLevel = Layers.currentLevel;
      if (Stats.canDecrease(statName)) {
        Stats.decreaseStat(statName, currentLevel);
        document.getElementById(`${statName}-value`).textContent = Stats.getTotal(statName);
        Layers.updateCurrentLayer();
        UI.updateRemainingPoints(Layers.getRemainingPoints());
        updateStatButtonLabels();
        UI.updateCurrentLayerDisplay();
        if (statName === "body") {
          updateDerivedStats();
        } else if (statName === "spirit") {
          Abilities.updateGatherEssenceDerived();
	}
      }
    });
  });

  // --- Level Up Button ---
  document.getElementById('level-up-btn').addEventListener('click', () => {
    Layers.levelUp();
    // Update all stat displays to show locked totals.
    const stats = ['body', 'mind', 'spirit'];
    stats.forEach(stat => {
      document.getElementById(`${stat}-value`).textContent = Stats.getTotal(stat);
    });
    updateStatButtonLabels();
    UI.updateRemainingPoints(Layers.getRemainingPoints());
    UI.updateCurrentLayerDisplay(); // Now should display "(None)" for current level.
    updateDerivedStats();
    UI.updatePurchasedAbilities();
  });

  // --- Ability Shop Event Delegation ---
  const abilityShopEl = document.getElementById('ability-shop');
  if (abilityShopEl) {
    abilityShopEl.addEventListener('click', (event) => {
      if (event.target.classList.contains('buy-ability-btn')) {
        const abilityId = event.target.getAttribute('data-ability');
        Abilities.purchaseAbility(abilityId);
      }
    });
  }

  // --- Purchased Abilities Removal ---
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
/**
 * Clears all saved data and redirects the user to the splash screen.
 */
function startOver() {
  if (confirm("Are you sure you want to start over? This will clear all progress.")) {
    localStorage.clear();
    // Redirect to the splash screen.
    // If you're using an integrated approach, you can simply reload the page.
    // Alternatively, if the splash is a separate page, change the URL accordingly.
    window.location.href = 'index.html';
  }
}
