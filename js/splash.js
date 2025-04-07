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
  // Save the selected race in localStorage.
  localStorage.setItem('selectedRace', selectedRace);
  console.log("Race confirmed:", selectedRace); // Debug

  // Apply race effects (e.g., deduct build points, modify locked stats, add racial abilities).
  applyRaceEffects(selectedRace);

  UI.showCharacterPlanner()
}

