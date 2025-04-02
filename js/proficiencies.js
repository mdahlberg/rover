window.Proficiencies = {
  availableProficiencies: {
    small_weapons: {
      name: "Small Weapons",
      cost: 0,
      description:
        "All Valiants are automatically proficient with small weapons like daggers and hatchets.",
    },
    short_weapons: {
      name: "Short Weapons",
      cost: 5,
      description:
        "Grants proficiency with short swords, maces, and axes. Max striking surface of 24 inches.",
    },
    long_blades: {
      name: "Long Blades",
      cost: 5,
      description:
        "Grants proficiency with long swords, spears, and other long slashing weapons.",
    },
    long_crushing_weapons: {
      name: "Long Crushing Weapons",
      cost: 5,
      description:
        "Grants proficiency with maces, hammers, and axes that deal crushing damage.",
    },
    two_handed_blades: {
      name: "Two Handed Blades",
      cost: 10,
      description:
        "Proficiency with two-handed weapons such as greatswords and polearms.",
    },
    two_handed_crushing_weapons: {
      name: "Two Handed Crushing Weapons",
      cost: 10,
      description:
        "Proficiency with great hammers and heavy battle axes.",
    },
    double_weapons: {
      name: "Double Weapons",
      cost: 10,
      description:
        "Proficiency with double weapons like staves and dual-bladed swords.",
    },
    shields: {
      name: "Shields",
      cost: 5,
      description:
        "Proficiency with shields, granting the ability to defend against attacks effectively.",
    },
    bows_crossbows: {
      name: "Bows & Crossbows",
      cost: 10,
      description:
        "Proficiency with ranged weapons such as bows and crossbows.",
    },
    thrown_weapons: {
      name: "Thrown Weapons",
      cost: 5,
      description:
        "Proficiency with throwing weapons like daggers, hatchets, and other throwable items.",
    },
  },

  // Keeps track of purchased proficiencies
  purchasedProficiencies: {},

  /**
   * Purchase a proficiency if enough points are available.
   * @param {string} profId - ID of the proficiency
   * @returns {boolean} Success or failure
   */
  purchaseProficiency: function (profId) {
    const proficiency = this.availableProficiencies[profId];
    if (!proficiency || Layers.getRemainingPoints() < proficiency.cost) {
      alert("Not enough build points or invalid proficiency.");
      return false;
    }
    if (!this.purchasedProficiencies[profId]) {
      this.purchasedProficiencies[profId] = true; // Only allow purchase once
    } else {
      console.warn("Proficiency already purchased.");
      return false;
    }
    Layers.spendPoints("proficiencies", profId, proficiency.cost);
    UI.updateProficiencyUI();
    return true;
  },

  /**
   * Refund and remove a proficiency purchased at the current level.
   * @param {string} profId - ID of the proficiency to remove
   */
  removeProficiency: function (profId) {
    if (!this.purchasedProficiencies[profId]) return;
    const proficiency = this.availableProficiencies[profId];
    delete this.purchasedProficiencies[profId];
    Layers.refundPoints("proficiencies", profId, proficiency.cost);
    UI.updateProficiencyUI();
  },

  /**
   * Check if a proficiency is purchased.
   * @param {string} profId
   * @returns {boolean}
   */
  isProficiencyPurchased: function (profId) {
    return !!this.purchasedProficiencies[profId];
  },
};
