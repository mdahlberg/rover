
// main.js - Initializes Layers and UI on Page Load
console.log("main.js loaded");

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded. Waiting for planner to load...");

  // Delay initialization until the planner is visible
  const plannerContainer = document.getElementById("planner-container");

  if (plannerContainer && !plannerContainer.classList.contains("hidden")) {
    console.log("Planner is already visible. Initializing...");
    Layers.loadFromStorage();
    Stats.loadFromStorage();

    UI.refreshAll();
  } else {
    console.log("Planner is not visible yet. Waiting for confirmation...");
    document.getElementById("start-btn").addEventListener("click", function () {
      console.log("Race confirmed! Initializing planner now...");
      applyRacialProficienciesAndAbilities();
      UI.refreshAll();
    });
  }
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

  // 🔐 Store racial locks globally
  window.RacialLocks = {
    proficiencies: new Set(racialProfs),
    abilities: new Set(racialAbilities),
  };

  // ✅ Apply racial proficiencies
  racialProfs.forEach((profId) => {
    if (!Proficiencies.purchased[profId]) {
      Proficiencies.purchaseProficiency(profId, 0);
      // Proficiencies.purchased[profId] = 1;
      // Layers.currentLayer.proficiencies ??= {};
      // Layers.currentLayer.proficiencies[profId] = 1;
      // Layers.currentLayer.points ??= {};
      // Layers.currentLayer.points.proficiencies ??= {};
      // Layers.currentLayer.points.proficiencies[profId] = 0; // 0 BP cost
    }
  });

  // ✅ Apply racial abilities
  racialAbilities.forEach((abilityId) => {
    if (!Abilities.purchasedAbilities[abilityId]) {
      // Purchased for zero BP
      Abilities.purchaseAbility(abilityId, 0);
      //Abilities.purchasedAbilities[abilityId] = 1;
      //Layers.currentLayer.abilities ??= {};
      //Layers.currentLayer.abilities[abilityId] = 1;
      //Layers.currentLayer.points ??= {};
      //Layers.currentLayer.points.abilities ??= {};
      //Layers.currentLayer.points.abilities[abilityId] = 0; // 0 BP cost
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

