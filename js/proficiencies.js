// proficiencies.js - Manages proficiency selection and build point tracking

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

  /**
   * Purchase a proficiency if enough points are available.
   * @param {string} profId - ID of the proficiency
   * @returns {boolean} Success or failure
   */
  purchaseProficiency: function (profId) {
    const proficiency = this.availableProficiencies[profId];
    if (!proficiency) return false;

    const cost = proficiency.cost;
    if (this.isProficiencyPurchased(profId)) return false;

    const success = Layers.spendPoints("proficiencies", profId, cost);
    if (!success) return false;

    UI.updateProficiencyUI();
    return true;
  },

  /**
   * Refund and remove a proficiency purchased at the current level.
   * @param {string} profId - ID of the proficiency to remove
   */
  removeProficiency: function (profId) {
    const wasPurchasedInLayer = Layers.currentLayer.proficiencies?.[profId];
    if (!wasPurchasedInLayer) {
      alert("This proficiency is locked in and cannot be removed.");
      return;
    }

    const cost = this.availableProficiencies[profId].cost;
    Layers.refundPoints("proficiencies", profId, cost);
    UI.updateProficiencyUI();
  },

  /**
   * Check if a proficiency is purchased across all levels.
   * @param {string} profId
   * @returns {boolean}
   */
  isProficiencyPurchased: function (profId) {
    // Check current layer and locked layers
    return (
      !!Layers.currentLayer.proficiencies?.[profId] ||
      Layers.layers.some((layer) => layer.proficiencies?.[profId])
    );
  },
};
