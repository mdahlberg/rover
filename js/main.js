// main.js - Initializes Layers and UI on Page Load
console.log("main.js loaded");

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded. Checking race selection...");

  const selectedRace = localStorage.getItem("selectedRace");
  const startingBP = localStorage.getItem("startingBP");
  const plannerContainer = document.getElementById("planner-container");

  // ✅ Setup earned BP listener
  const earnedInput = document.getElementById("earned-bp");
  if (earnedInput) {
    earnedInput.addEventListener("change", (e) => {
      const bp = parseInt(e.target.value, 10);
      if (!isNaN(bp)) {
        BPLeveling.setEarnedBP(bp); // Will auto-check and prompt level-up if needed
      }
    });

    // Optional: Load from storage
    const saved = parseInt(localStorage.getItem("earnedBP") || "0", 10);
    if (!isNaN(saved)) {
      earnedInput.value = saved;
      BPLeveling.setEarnedBP(saved);
    }
  }

  // ✅ Setup level up button
  const levelUpButton = document.getElementById("level-up-btn");
  if (levelUpButton) {
    levelUpButton.addEventListener("click", () => {
      levelUp();
      UI.refreshAll();
    });
  }

  // ✅ If race is already chosen, load the planner
  if (selectedRace && startingBP) {
    console.log("Detected existing race selection:", selectedRace);

    applyRaceEffects(selectedRace);
    applyRacialProficienciesAndAbilities();

    UI.showCharacterPlanner();

    Layers.loadFromStorage();
    Stats.loadFromStorage();
    UI.refreshAll();
    UI.updateGlobalBuildPoints();
    return;
  }

  // 🕹️ If race not selected yet, wait for splash confirmation
  console.log("No race selected yet. Waiting for splash confirmation...");
  document.getElementById("start-btn").addEventListener("click", function () {
    console.log("Race confirmed! Initializing planner...");
    applyRacialProficienciesAndAbilities();
    UI.refreshAll();
  });
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
      Abilities.purchaseAbility(abilityId, 0);
    }
  });
}

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

  // Clear window-level globals
  delete window.RacialLocks;

  // Redirect to splash
  window.location.href = "index.html";
}
