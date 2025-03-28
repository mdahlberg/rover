// splash.js - Handles race selection and transition to the planner.

let selectedRace = null;

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
  // Apply race effects (e.g., deduct build points, modify locked stats, add racial abilities).
  applyRaceEffects(selectedRace);
  // Redirect to the main planner page.
  window.location.href = 'index.html';
}

/**
 * Applies race effects by updating locked stats and deducting build points.
 * These effects form layer zero (immutable) for the character.
 * @param {string} race - The selected race.
 */
function applyRaceEffects(race) {
  let startingBP = 50;
  switch (race) {
    case 'humans':
      startingBP -= 0;
      // +1 to all core stats.
      Stats.lockedStats.body += 1;
      Stats.lockedStats.armor += 1;
      Stats.lockedStats.lores += 1;
      Stats.lockedStats.tracking += 1;
      Stats.lockedStats.gather += 1;
      localStorage.setItem('racialAbilities', JSON.stringify(['Racial: +1 all core stats']));
      break;
    case 'espers':
      startingBP -= 5;
      // +2 Mind (lores) and +1 Spirit (gather).
      Stats.lockedStats.lores += 2;
      Stats.lockedStats.gather += 1;
      localStorage.setItem('racialAbilities', JSON.stringify(['Proficiency: Bows', 'Proficiency: Short Blades']));
      break;
    case 'grunt':
      startingBP -= 5;
      // +2 Body and +1 Spirit.
      Stats.lockedStats.body += 2;
      Stats.lockedStats.gather += 1;
      localStorage.setItem('racialAbilities', JSON.stringify(['Proficiency: Two-Handed Blades']));
      localStorage.setItem('racialBonusStrength', 1);
      break;
    case 'duskers':
      startingBP -= 10;
      // +1 Mind, +1 Spirit, +1 Core Stat of Choice (default to body).
      Stats.lockedStats.lores += 1;
      Stats.lockedStats.gather += 1;
      Stats.lockedStats.body += 1;
      localStorage.setItem('racialAbilities', JSON.stringify(['Proficiency: Short Blades']));
      localStorage.setItem('racialDiscounts', JSON.stringify({ 'Dual Wielder': 0.5, 'Strike from Behind': 0.5 }));
      break;
    case 'harrowed':
      startingBP -= 15;
      // +2 Body, +2 Spirit.
      Stats.lockedStats.body += 2;
      Stats.lockedStats.gather += 2;
      localStorage.setItem('racialAbilities', JSON.stringify(['Proficiency: Shields', 'Proficiency: Double Weapons']));
      break;
    case 'morphs':
      startingBP -= 10;
      // +1 to two core stats of choice (default to body and lores).
      Stats.lockedStats.body += 1;
      Stats.lockedStats.lores += 1;
      localStorage.setItem('racialAbilities', JSON.stringify(['Free Weapon Proficiency']));
      // For Morph traits, open a modal later (for now, store empty array).
      localStorage.setItem('morphTraits', JSON.stringify([]));
      break;
    default:
      break;
  }
  localStorage.setItem('startingBP', startingBP);
}
