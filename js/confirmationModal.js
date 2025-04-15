window.ConfirmationModal = {
  open: function () {
    const modal = document.getElementById("confirmation-modal");
    const summary = document.getElementById("confirmation-summary");

    const raceKey = localStorage.getItem("selectedRace");
    const race = window.Races?.[raceKey];

    const name = localStorage.getItem("characterName") || "(Unnamed)";
    const desc = localStorage.getItem("characterDescription") || "";
    const stat = localStorage.getItem("racialStatChoice");
    const traits = JSON.parse(localStorage.getItem("morphTraits") || "[]");
    const profs = JSON.parse(localStorage.getItem("racialProficiencies") || "[]");

    let html = `<p><strong>Name:</strong> ${name}</p>`;
    if (desc) html += `<p><strong>Description:</strong> ${desc}</p>`;
    html += `<p><strong>Race:</strong> ${race?.name || raceKey}</p>`;
    if (stat) html += `<p><strong>Stat Bonus:</strong> ${stat.charAt(0).toUpperCase() + stat.slice(1)}</p>`;
    if (traits.length) html += `<p><strong>Morph Traits:</strong> ${traits.join(", ")}</p>`;
    if (profs.length) html += `<p><strong>Free Proficiency:</strong> ${profs.join(", ")}</p>`;

    summary.innerHTML = html;

    modal.classList.remove("hidden");
    setTimeout(() => modal.classList.add("show"), 10);
  },

  confirm: function () {
    const modal = document.getElementById("confirmation-modal");
    modal.classList.remove("show");
    setTimeout(() => modal.classList.add("hidden"), 300);

    confirmRace();
    // UI.showCharacterPlanner(); // Your existing function
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
    localStorage.removeItem("characterName");
    localStorage.removeItem("characterDescription");
    localStorage.removeItem("selectedRace");
    localStorage.removeItem("racialStatChoice");
    localStorage.removeItem("morphTraits");
    localStorage.removeItem("racialProficiencies");
    // Clear anything else relevant
  }
};

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("confirm-character").onclick = () => ConfirmationModal.confirm();
});

document.getElementById("confirmation-cancel").onclick = () => {
  if (!confirm("Cancel character creation?")) return;
  ConfirmationModal.cancelModal("confirmation-modal", true);
};

/**
 * Confirms the race selection, applies race effects, and redirects to the planner.
 */
function confirmRace() {
  selectedRace = localStorage.getItem("selectedRace");
  if (!selectedRace) {
    alert('Please select a race before proceeding!');
    return;
  }

  // 🌟 Save and apply race
  console.log("Race confirmed:", selectedRace);

  Stats.applyRaceEffects(selectedRace);
  applyRacialProficienciesAndAbilities();

  // 🎯 Setup Build Point totals
  const racialCost = parseInt(localStorage.getItem("racialBPSpent") || "0", 10);

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
