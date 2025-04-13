// splash.js - Handles race selection and transition to the planner.
console.log("splash.js loaded");

let selectedRace = {};

/**
 * Called when a race card is clicked.
 * Highlights the selected race and shows the confirm button.
 * @param {string} race - The identifier of the race.
 */
function selectRace(race) {
  // Remove selection from all race cards.
  const allCards = document.querySelectorAll('.race-card');
  allCards.forEach(card => card.classList.remove('selected'));

  // Set the selected race.
  selectedRace = race;
  const selectedCard = document.querySelector(`[onclick="selectRace('${race}')"]`);
  if (selectedCard) {
    selectedCard.classList.add('selected');
  }

  if (selectedRace === "morphs") {
    MorphSelector.open();
  }
  
  // Show the confirm button.
  document.getElementById('start-button-container').classList.remove('hidden');
}

/**
 * Confirms the race selection, applies race effects, and redirects to the planner.
 */
function confirmRace() {
  if (!selectedRace) {
    alert('Please select a race before proceeding!');
    return;
  }

  // 🌟 Save and apply race
  console.log("Race confirmed:", selectedRace);
  localStorage.setItem('selectedRace', selectedRace);

  Stats.applyRaceEffects(selectedRace);
  applyRacialProficienciesAndAbilities();

  // 🎯 Setup Build Point totals
  //const startingBP = parseInt(localStorage.getItem("startingBP") || "50", 10);
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

