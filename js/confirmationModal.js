window.ConfirmationModal = {
  open: function () {
    const modal = document.getElementById("confirmation-modal");
    const summary = document.getElementById("confirmation-summary");
    const name = localStorage.getItem(Constants.CHAR_NAME) || "Unnamed";
    const raceKey = localStorage.getItem(Constants.SELECTED_RACE) || "Unknown";
    const race = window.Races?.[raceKey];
    const selectedLore = JSON.parse(localStorage.getItem(Constants.RACIAL_LORES) || "[]")[0];
    const selectedProf = JSON.parse(localStorage.getItem(Constants.RACIAL_PROFS) || "[]")[0];
    const discounts = JSON.parse(localStorage.getItem(Constants.RACIAL_DISCOUNTS) || "{}");
    const discountedAbility = discounts.abilities?.[0]?.name;
    const traitIds = JSON.parse(localStorage.getItem(Constants.MORPH_TRAITS) || "[]");

    summary.innerHTML = `
      <h3>${name}</h3>
      <p><strong>Race:</strong> ${race?.name || raceKey}</p>
      ${selectedLore ? `<p><strong>Starting Lore:</strong> ${Lores.availableLores[selectedLore]?.name || selectedLore}</p>` : ""}
      ${discountedAbility ? `<p><strong>Discounted Ability:</strong> ${Abilities.availableAbilities[discountedAbility]?.name || discountedAbility}</p>` : ""}
    `;

    const parts = [];

    // ✅ Combined and cleaned stat bonuses
    const combinedStats = {};
    Object.entries(race?.startingStats || {}).forEach(([stat, value]) => {
      combinedStats[stat] = (combinedStats[stat] || 0) + value;
    });
    Object.entries(race?.bonuses || {}).forEach(([stat, value]) => {
      combinedStats[stat] = (combinedStats[stat] || 0) + value;
    });
    Object.entries(Stats?.startingStats || {}).forEach(([stat, value]) => {
      combinedStats[stat] = (combinedStats[stat] || 0) + value;
    });
    if (Object.keys(combinedStats).length > 0) {
      const statLine = Object.entries(combinedStats)
        .map(([stat, val]) => `${stat} +${val}`)
        .join(", ");
      parts.push(`<p><strong>Stat Bonuses:</strong> ${statLine}</p>`);
    }

    // ✅ Combine selected prof + racial profs
    const allProfs = new Set(race?.proficiencies || []);
    if (selectedProf) allProfs.add(selectedProf);
    if (allProfs.size > 0) {
      const names = [...allProfs]
        .map(p => Proficiencies.availableProficiencies[p]?.name || p)
        .join(", ");
      parts.push(`<p><strong>Proficiencies:</strong> ${names}</p>`);
    }

    // ✅ Racial abilities (if any)
    if (race?.abilities?.length) {
      const abilities = race.abilities.map(a => Abilities.availableAbilities[a]?.name || a);
      parts.push(`<p><strong>Starting Abilities:</strong> ${abilities.join(", ")}</p>`);
    }

    // ✅ Morph traits (if present)
    if (traitIds.length) {
      const traits = traitIds.map(t => `<code>${t}</code>`).join(", ");
      parts.push(`<p><strong>Morph Traits:</strong> ${traits}</p>`);
    }

    // ✅ Essence slots
    if (race?.essenceSlots && Object.keys(race.essenceSlots).length > 0) {
      const ess = Object.entries(race.essenceSlots)
        .map(([lvl, count]) => `Level ${lvl}: +${count}`)
        .join(", ");
      parts.push(`<p><strong>Bonus Essence Slots:</strong> ${ess}</p>`);
    }

    summary.innerHTML += parts.join("");


    modal.classList.remove("hidden");
    setTimeout(() => modal.classList.add("show"), 10);
  },

  confirm: function () {
    const modal = document.getElementById("confirmation-modal");
    modal.classList.remove("show");
    setTimeout(() => modal.classList.add("hidden"), 300);

    confirmRace();
  },

  cancelModal: function(modalId, reset = false) {
    const modal = document.getElementById(modalId);
    modal.classList.remove("show");
    setTimeout(() => modal.classList.add("hidden"), 300);

    if (reset) {
      this.resetCharacterCreation();
    }
  },

  resetCharacterCreation: function() {
    localStorage.removeItem(Constants.CHAR_NAME);
    localStorage.removeItem(Constants.CHAR_DESC);
    localStorage.removeItem(Constants.SELECTED_RACE);
    localStorage.removeItem("racialStatChoice");
    localStorage.removeItem(Constants.MORPH_TRAITS);
    localStorage.removeItem(Constants.RACIAL_PROFS);
    // Clear anything else relevant
    startOver();
  }
};

window.addEventListener("DOMContentLoaded", () => {
  const confirmBtn = document.getElementById("confirm-character");
  const cancelBtn = document.getElementById("confirmation-cancel");

  if (confirmBtn) confirmBtn.onclick = () => ConfirmationModal.confirm();
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      if (!window.confirm("Cancel character creation?")) return;
      ConfirmationModal.cancelModal("confirmation-modal", true);
    };
  }
});

document.getElementById("confirmation-cancel").onclick = () => {
  if (!confirm("Cancel character creation?")) return;
  ConfirmationModal.cancelModal("confirmation-modal", true);
};

/**
 * Confirms the race selection, applies race effects, and redirects to the planner.
 */
function confirmRace() {
  selectedRace = localStorage.getItem(Constants.SELECTED_RACE);
  if (!selectedRace) {
    alert('Please select a race before proceeding!');
    return;
  }

  // 🌟 Save and apply race
  console.log("Race confirmed:", selectedRace);

  Stats.applyRaceEffects(selectedRace);
  applyRacialProficienciesAndAbilities();

  // 🎯 Setup Build Point totals
  const racialCost = parseInt(localStorage.getItem(Constants.RACIAL_BP_SPENT) || "0", 10);

  BPLeveling.addEarnedBP(50);

  // 🧼 Setup layer cleanly
  Layers.currentLayer = {
    pointsSpent: racialCost,
    points: {},
    stats: {},
    abilities: {},
    lores: {},
    proficiencies: {},
    essenceSlots: {},
  };

  // Show planner and update display
  UI.showCharacterPlanner();
  UI.refreshAll();
  UI.updateGlobalBuildPoints();
}
