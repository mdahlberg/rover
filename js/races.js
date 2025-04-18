window.Races = {
  humans: {
    name: "Humans",
    description: "1 all core stats, one free Lore, one free weapon proficiency, first combat skill for half price",
    bpCost: 0,
    startingStats: { body: 1, mind: 1, spirit: 1 },
    abilities: [],
    selectProficiency: 1, // Choose 1 free proficiency
    selectAbilityDiscount: 1, // Choose 1 ability to get a 1st time .5 discount
    proficiencies: ["small_weapons"],
  },

  espers: {
    name: "Espers",
    description: "+2 mind, +1 spirit, Gain an additional free use of the Gather Essence skill. Free Proficiency in Bows and Short blades",
    bpCost: 5,
    startingStats: { mind: 2, spirit: 1 },
    proficiencies: ["bows_crossbows", "short_weapons", "small_weapons"],
  },

  grunt: {
    name: "Grunt",
    description: "+2 Body, +1 Spirit. +1 Passive Strenght. Starts with Two-Handed Blades.",
    bpCost: 5,
    startingStats: { body: 2, spirit: 1 },
    proficiencies: ["small_weapons", "two_handed_blades"],
    bonuses: { strength: 1 },
  },

  duskers: {
    name: "Duskers",
    description: "+1 Mind, +1 Spirit, +1 of choice. Proficient in short blades. Discount on Dual Wielder / Strike from Behind.",
    bpCost: 10,
    startingStats: { mind: 1, spirit: 1 },
    proficiencies: ["small_weapons", "short_weapons"],
    selectStat: 1, // Choose 1 stat to boost
    discounts: {
        abilities: [
          {name: "dual_wielder", uses: 1, factor: 0.5},
          {name: "strike_from_behind", uses: 1, factor: 0.5}
        ]
    }
  },

  harrowed: {
    name: "Harrowed",
    description: "+2 Body, +2 Spirit. Starts with Shields and Double Weapons.",
    bpCost: 15,
    startingStats: { body: 2, spirit: 2 },
    proficiencies: ["small_weapons", "shields", "double_weapons"],
  },

  morphs: {
    name: "Morph",
    description: "+1 to two of choice. Free Weapon Proficiency. Custom traits.",
    bpCost: 10,
    startingStats: {},
    selectStat: 2, // Choose 2 stats to boost
    traits: [],
    selectProficiency: 1, // Choose 1 proficiency
    proficiencies: ["small_weapons"],
  },
};
