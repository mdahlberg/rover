// main.js - Initializes Layers and UI on Page Load
console.log("main.js loaded");

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded. Checking race selection...");

  // ✅ Setup level up button
  const levelUpButton = document.getElementById("level-up-btn");
  if (levelUpButton) {
    levelUpButton.addEventListener("click", () => {
      levelUp();
      UI.refreshAll();
    });
  }

  const exportButton = document.getElementById("export-character");
  if (exportButton) {
    exportButton.addEventListener("click", () => {
      CharacterExporter.exportSnapshot();
    });
  }

  // Import character button
  const importInput = document.getElementById("import-btn");

  importInput.addEventListener("change", function (e) {
    console.log("Importing char");
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const snapshot = JSON.parse(event.target.result);
        CharacterExporter.importSnapshot(snapshot);
      } catch (err) {
        alert("Failed to read snapshot file.");
        console.error(err);
      }
    };

    reader.readAsText(file);
    console.log("Character uploaded");
  });

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
  this.initializeRacialLocksFromStorage()

  const allProfs = [...new Set([...window.RacialLocks.proficiencies])];

  // ✅ Apply racial proficiencies
  allProfs.forEach((profId) => {
    if (!Proficiencies.purchasedProficiencies[profId]) {
      Proficiencies.purchaseProficiency(profId, 0);
    }
  });

  // ✅ Apply racial abilities
  window.RacialLocks.abilities.forEach((abilityId) => {
    if (!Abilities.purchasedAbilities[abilityId]) {
      Abilities.purchaseAbility(abilityId, 0);
    }
  });

  Lores.initializeRacialLores();

  for (const type in window.RacialLocks.racialDiscounts) {
    if (type === "abilities") {
      Abilities.applyDiscounts(window.RacialLocks.racialDiscounts[type]);
    } else {
      alert("Only Ability Discounts are available");
    }
  }
}

function initializeRacialLocksFromStorage() {
  const racialProfs = JSON.parse(localStorage.getItem(Constants.RACIAL_PROFS) || "[]");
  const racialAbilities = JSON.parse(localStorage.getItem(Constants.RACIAL_ABILITITES) || "[]");
  const racialLores = JSON.parse(localStorage.getItem(Constants.RACIAL_LORES) || "[]");
  const racialDiscounts = JSON.parse(localStorage.getItem(Constants.RACIAL_DISCOUNTS) || "[]");

  window.RacialLocks = {
    proficiencies: new Set(racialProfs),
    abilities: new Set(racialAbilities),
    lores: new Set(racialLores),
    racialDiscounts: racialDiscounts,
  };
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

