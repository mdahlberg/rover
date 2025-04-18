// splash.js - Handles race selection and transition to the planner.
console.log("splash.js loaded");

let selectedRace = {};

/**
 * Called when a race card is clicked.
 * Highlights the selected race and shows the confirm button.
 * @param {string} race - The identifier of the race.
 */
function selectRace(race) {
  raceObject = Races[race];

  // Remove selection from all race cards.
  const allCards = document.querySelectorAll('.race-card');
  allCards.forEach(card => card.classList.remove('selected'));

  // Set the selected race.
  const selectedCard = document.querySelector(`[onclick="selectRace('${race}')"]`);
  if (selectedCard) {
    selectedCard.classList.add('selected');
  }

  // Pop-up modal(s) to choose special abilities
  localStorage.setItem("selectedRace", race);
  runModalFlow(race);
  
  // Show the confirm button.
  document.getElementById('start-button-container').classList.remove('hidden');
}

/**
 * Set up a series of modals to move through during character creation
 */
function runModalFlow(raceKey) {
  const race = window.Races?.[raceKey];
  if (!race) return;

  const modalSteps = [];

  // Character name and description - ALL Races
  modalSteps.push(() => new Promise(resolve => {
    CharacterInfoModal.open();
    CharacterInfoModal.onConfirm = resolve;
  }));

  // Stat Selection - for Races who allow choosing one or more core stats
  if (race.selectStat) {
    modalSteps.push(() => new Promise(resolve => {
      StatSelector.open(race.selectStat);
      StatSelector.onConfirm = resolve;
    }));
  }

  // Morph Attribute selection
  // TODO - remove hard coding
  if (raceKey === "morphs") {
    modalSteps.push(() => new Promise(resolve => {
      MorphSelector.open();
      MorphSelector.onConfirm = resolve;
    }));
  }

  // Proficiency selection - for Races who allowing choosing a starting proficiency
  if (race.selectProficiency) {
    modalSteps.push(() => new Promise(resolve => {
      ProficiencySelector.open();
      ProficiencySelector.onConfirm = resolve;
    }));
  }

  // Ability Discount  selection - for Races who allowing choosing abilities for discount
  if (race.selectAbilityDiscount) {
    modalSteps.push(() => new Promise(resolve => {
      AbilitySelectModal.open("Select for Discount", "Selected abilities  will get a one time, 50% discount", race.selectAbilityDiscount);
      AbilitySelectModal.onConfirm = resolve;
    }));
  }

  // Character confirmation modal
  modalSteps.push(() => new Promise(resolve => {
    ConfirmationModal.open();
    ConfirmationModal.onConfirm = resolve;
  }));


  // Run the sequence in order
  (async () => {
    for (const step of modalSteps) {
      await step();
    }

    // All done – refresh the UI
    //UI.refreshAll();
  })();
}

