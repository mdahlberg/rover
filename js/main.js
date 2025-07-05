// main.js - Initializes Layers and UI on Page Load
console.log("main.js loaded");

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded. Checking race selection...");

  /*const header      = document.getElementById('main-header');
  const hdrToggle   = document.getElementById('toggle-header');

  hdrToggle.addEventListener('click', () => {
    const isCollapsed = header.classList.toggle('collapsed');
    // Flip the chevron
    hdrToggle.textContent = isCollapsed ? '▸' : '▾';
    hdrToggle.setAttribute('aria-expanded', !isCollapsed);
  });
  */

  const footer       = document.getElementById('main-footer');
  const ftrToggle    = document.getElementById('toggle-footer');

  ftrToggle.addEventListener('click', () => {
    const isCollapsed = footer.classList.toggle('collapsed');
    ftrToggle.textContent = isCollapsed ? '▸' : '▾';
    ftrToggle.setAttribute('aria-expanded', !isCollapsed);
  });

  // Setup start over button
  const startOverButton = document.getElementById("start-over-btn");
  if (startOverButton) {
    startOverButton.addEventListener("click", () => {
      const ok = window.confirm("Are you sure you want to start over? This will clear all your progress.");
      if (ok) {
        startOver();
      }
    });
  }

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

  // ── Sidebar Collapse Toggle ──
  document.querySelector('.toggle-sidebar').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
  });

  const affBox = document.getElementById("filter-affordable");
  const preBox = document.getElementById("filter-prereqs");
  const refBox = document.getElementById("filter-refundable");

  // apply when toggles change
  affBox.addEventListener("change", () => {
    UI.updateAbilityUI(true);
  });
  preBox.addEventListener("change", () => {
    UI.updateAbilityUI(true);
  });
  refBox.addEventListener("change", () => {
    UI.updateAbilityUI(true);
  });



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
  //
  // Inject into your abilities pool as “free” abilities
  // race = _selected_race;
  // for each race ability in race.abilities
  // add race ability to list of available
  isEsper = sessionStorage.getItem(Constants.SELECTED_RACE) === "espers";
  if (isEsper && !Abilities.availableAbilities.peace) {
    console.log("Adding 'Peace' ability unique to Espers");
    Abilities.availableAbilities["peace"] = {
      name: "Peace",
      cost: 5,
      description: "An Esper can cleanse a mental effect on themselves or others once per rest by a Holding a hand over a character’s head and announcing 'Be at peace!' If used on another character or 'I am at peace' if used on oneself and beginning a silent 10 count while maintaining focus on the act. The mental effect being removed is suppressed as soon as the count begins, however, the effect resumes again immediately if the player is interrupted and the use of the ability is lost once it begins, even if interrupted. As long as at least one use of this ability is available you are always aware when you are under some sort of mental influence, but you will not automatically know the type of effect or how it was placed on you.",
      isEsper: true,
      weaponProperties: []
    };
  }

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
  const racialProfs = JSON.parse(sessionStorage.getItem(Constants.RACIAL_PROFS) || "[]");
  const racialAbilities = JSON.parse(sessionStorage.getItem(Constants.RACIAL_ABILITITES) || "[]");
  const racialLores = JSON.parse(sessionStorage.getItem(Constants.RACIAL_LORES) || "[]");
  const racialDiscounts = JSON.parse(sessionStorage.getItem(Constants.RACIAL_DISCOUNTS) || "[]");

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
  UI._showTip(`Level Up!`, 'success', 3000);
}

function startOver() {
  sessionStorage.clear();
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

// ── Section‐Swap Logic ──
const navItems = document.querySelectorAll('#sidebar li');
const sections = document.querySelectorAll('.content-section');

navItems.forEach(item => {
  item.addEventListener('click', () => {
    // 1) Highlight active nav button
    navItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    // 2) Show matching section, hide the rest
    const target = item.dataset.target;
    sections.forEach(sec => {
      if (sec.id === target) sec.classList.remove('hidden');
      else sec.classList.add('hidden');
    });

    // Refresh abilities?
    if (target === 'abilities') UI.updateAbilityUI();
  });
});

// ── Hook into your splash→planner transition ──
// If you already have UI.showCharacterPlanner, override it here:
if (window.UI && typeof UI.showCharacterPlanner === 'function') {
  const originalShow = UI.showCharacterPlanner.bind(UI);
  UI.showCharacterPlanner = () => {
    // hide splash
    document.getElementById('splash-container').classList.add('hidden');
    // show planner
    document.getElementById('planner-wrapper').classList.remove('hidden');
    // then do any existing logic
    originalShow();
  };
}

// ── On load, default to “Stats” tab ──
window.addEventListener('DOMContentLoaded', () => {
  // Ensure planner-wrapper is hidden until you click “Begin”
  // Then, when you call UI.showCharacterPlanner(), this will fire:
  const statsBtn = document.querySelector('#sidebar li[data-target="stats"]');
  if (statsBtn) statsBtn.click();
});

