
// main.js - Initializes Layers and UI on Page Load
console.log("main.js loaded");

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded. Checking race selection...");

  const selectedRace = localStorage.getItem("selectedRace");
  const startingBP = localStorage.getItem("startingBP");
  const plannerContainer = document.getElementById("planner-container");

  if (selectedRace && startingBP) {
    console.log("Detected existing race selection:", selectedRace);

    // Apply race effects and racial bonuses (e.g., abilities, proficiencies)
    applyRaceEffects(selectedRace);
    applyRacialProficienciesAndAbilities();

    // Set starting build points
    Layers.totalPoints = parseInt(startingBP, 10);

    // Show the planner
    UI.showCharacterPlanner();

    // Initialize full state
    Layers.loadFromStorage();
    Stats.loadFromStorage();
    UI.refreshAll();

    return;
  }

  // Fallback: Wait for user to confirm race
  console.log("No race selected yet. Waiting for splash confirmation...");

  document.getElementById("start-btn").addEventListener("click", function () {
    console.log("Race confirmed! Initializing planner...");
    applyRacialProficienciesAndAbilities();
    UI.refreshAll();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const levelUpButton = document.getElementById("level-up-btn");
  if (levelUpButton) {
    levelUpButton.addEventListener("click", () => {
      levelUp();
      UI.refreshAll();
    });
  }
});

function applyRacialProficienciesAndAbilities() {
  const racialProfs = JSON.parse(localStorage.getItem("racialProficiencies") || "[]");
  const racialAbilities = JSON.parse(localStorage.getItem("racialAbilities") || "[]");

  // Include small_weapons as a locked default
  const defaultProfs = ["small_weapons"];
  const allProfs = [...new Set([...racialProfs, ...defaultProfs])]; // avoid duplication

  // 🔐 Store racial locks globally
  window.RacialLocks = {
    proficiencies: new Set(allProfs),
    abilities: new Set(racialAbilities),
  };

  // ✅ Apply racial proficiencies
  allProfs.forEach((profId) => {
    if (!Proficiencies.purchased[profId]) {
      Proficiencies.purchaseProficiency(profId, 0);
    }
  });

  // ✅ Apply racial abilities
  racialAbilities.forEach((abilityId) => {
    if (!Abilities.purchasedAbilities[abilityId]) {
      // Purchased for zero BP
      Abilities.purchaseAbility(abilityId, 0);
    }
  });
}

/**
 * Handles leveling up to create a new layer.
 */
function levelUp() {
  console.log("Leveling up...");

  Layers.resetLayer(); // Lock in the previous layer and start a new one.

  const levelEl = document.getElementById("level-display");

  if (levelEl) {
    levelEl.innerText = Layers.getCurrentLevel();
  }

  UI.refreshAll();
  alert("Level Up! New Layer Started.");
}

function startOver() {
  // Clear stored race, abilities, proficiencies, etc.
  localStorage.clear();

  // Clear window-level globals (optional but good practice)
  if (typeof Window !== "undefined") {
    delete Window.RacialLocks;
  }

  // Redirect to splash or reload page depending on structure
  window.location.href = "index.html";
}

