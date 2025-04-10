// main.js - Initializes Layers and UI on Page Load
console.log("main.js loaded");

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded. Checking race selection...");

  // const selectedRace = localStorage.getItem("selectedRace");
  // const startingBP = localStorage.getItem("startingBP");
  // const plannerContainer = document.getElementById("planner-container");

  // ✅ Setup level up button
  const levelUpButton = document.getElementById("level-up-btn");
  if (levelUpButton) {
    levelUpButton.addEventListener("click", () => {
      levelUp();
      UI.refreshAll();
    });
  }

  // ✅ If race is already chosen, load the planner
  /*if (selectedRace && startingBP) {
    console.log("Detected existing race selection:", selectedRace);

    applyRaceEffects(selectedRace);
    applyRacialProficienciesAndAbilities();

    // Explicitly set starting BP
    Layers.startingPoints = parseInt(startingBP, 10);
    Layers.updateTotalBP(); // Applies earned + starting

    UI.showCharacterPlanner();

    Layers.loadFromStorage();
    Stats.loadFromStorage();
    UI.refreshAll();
    UI.updateGlobalBuildPoints();
    return;
  }
  */

  // 🕹️ If race not selected yet, wait for splash confirmation
  if (!selectedRace) {
    console.log("No race selected yet. Waiting for splash confirmation...");
    document.getElementById("start-btn").addEventListener("click", function () {
      console.log("Race confirmed! Initializing planner...");
      applyRacialProficienciesAndAbilities();
      UI.refreshAll();
    });
  }
});

function applyRacialProficienciesAndAbilities() {
  const racialProfs = JSON.parse(localStorage.getItem("racialProficiencies") || "[]");
  const racialAbilities = JSON.parse(localStorage.getItem("racialAbilities") || "[]");
  const racialDiscounts = JSON.parse(localStorage.getItem("racialDiscounts") || "[]");

  // Include small_weapons as a locked default
  const defaultProfs = ["small_weapons"];
  const allProfs = [...new Set([...racialProfs, ...defaultProfs])];

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

  for (const type in racialDiscounts) {
    if (type === "abilities") {
      // A list of objects {name: str, uses: int, factor: float}
      Abilities.applyDiscounts(racialDiscounts[type]);
    } else {
      alert("Only Ability Discounts are available");
    }
  }
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
  localStorage.clear();
  delete window.RacialLocks;
  window.location.href = "index.html";
}

function adjustTooltipPosition(tooltip) {
  const rect = tooltip.getBoundingClientRect();
  const padding = 8; // give it a little buffer from the edge

  if (rect.right > window.innerWidth - padding) {
    tooltip.style.left = 'auto';
    tooltip.style.right = '0';
    tooltip.style.transform = 'none';
  } else if (rect.left < padding) {
    tooltip.style.left = '0';
    tooltip.style.right = 'auto';
    tooltip.style.transform = 'none';
  } else {
    tooltip.style.left = '50%';
    tooltip.style.right = 'auto';
    tooltip.style.transform = 'translateX(-50%)';
  }
}

// Hook tooltips on hover
// TODO - FIXME: Tooltip rebels when hovered from the East
document.querySelectorAll('.info-wrapper').forEach(wrapper => {
  const tooltip = wrapper.querySelector('.tooltip');
  if (tooltip) {
    wrapper.addEventListener('mouseenter', () => {
      requestAnimationFrame(() => {
        // Make it temporarily visible so we can measure
        tooltip.style.visibility = 'hidden';
        tooltip.style.opacity = '1';
        tooltip.style.display = 'block';

        // Wait a tick for layout engine to settle
        requestAnimationFrame(() => {
          adjustTooltipPosition(tooltip);

          // Reset visibility to normal
          tooltip.style.visibility = '';
          tooltip.style.opacity = '';
          tooltip.style.display = '';
        });
      });
    });
  }
});

