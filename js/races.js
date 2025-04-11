window.Races = {
  humans: {
    name: "Humans",
    description: "+1 to all core stats.",
    bpCost: 0,
    startingStats: { body: 1, mind: 1, spirit: 1 },
    abilities: [],
  },

  espers: {
    name: "Espers",
    description: "+2 Mind, +1 Spirit. Starts with Bows & Short Blades.",
    bpCost: 5,
    startingStats: { mind: 2, spirit: 1 },
    proficiencies: ["bows_crossbows", "short_weapons"],
  },

  grunt: {
    name: "Grunt",
    description: "+2 Body, +1 Spirit. Starts with Two-Handed Blades.",
    bpCost: 5,
    startingStats: { body: 2, spirit: 1 },
    proficiencies: ["two_handed_blades"],
    bonuses: { strength: 1 },
  },

  duskers: {
    name: "Duskers",
    description: "+1 Mind, +1 Spirit, +1 of choice. Discount on Dual Wielder / Strike from Behind.",
    bpCost: 10,
    startingStats: { mind: 1, spirit: 1, body: 1 }, // TODO: make one of choice
    proficiencies: ["short_weapons"],
    abilities: ["dual_wielder", "strike_from_behind"],
    discounts: {
      dual_wielder: 0.5,
      strike_from_behind: 0.5,
    },
  },

  harrowed: {
    name: "Harrowed",
    description: "+2 Body, +2 Spirit. Starts with Shields and Double Weapons.",
    bpCost: 15,
    startingStats: { body: 2, spirit: 2 },
    proficiencies: ["shields", "double_weapons"],
  },

  morphs: {
    name: "Morphs",
    description: "+1 to two of choice. Free Weapon Proficiency. Custom traits.",
    bpCost: 10,
    startingStats: { body: 1, mind: 1 }, // TODO: Make two selectable
    abilities: ["Free Weapon Proficiency"],
    traits: [],
  },
};

// Apply race effects based on the selected race key
window.applyRaceEffects = function (raceKey) {
  const race = window.Races?.[raceKey];
  if (!race) {
    console.warn("Invalid race selected:", raceKey);
    return;
  }

  localStorage.setItem("selectedRace", raceKey);
  localStorage.setItem("racialBPSpent", race.bpCost); // e.g., 5 for Espers

  Object.entries(race.startingStats || {}).forEach(([stat, value]) => {
    Stats.startingStats[stat] = (Stats.startingStats[stat] || 0) + value;
  });

  if (race.proficiencies) {
    localStorage.setItem("racialProficiencies", JSON.stringify(race.proficiencies));
  }

  if (race.abilities) {
    localStorage.setItem("racialAbilities", JSON.stringify(race.abilities));
  }

  if (race.discounts) {
    localStorage.setItem("racialDiscounts", JSON.stringify(race.discounts));
  }

  if (race.bonuses) {
    localStorage.setItem("racialBonuses", JSON.stringify(race.bonuses));
  }

  if (race.traits) {
    localStorage.setItem("morphTraits", JSON.stringify(race.traits));
  }
};
