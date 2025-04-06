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

  purchased: {},

  purchaseProficiency: function (id) {
    const prof = this.availableProficiencies[id];
    if (!prof || this.purchased[id]) return false;

    if (!Layers.spendPoints("proficiencies", id, prof.cost)) return false;
    if (!Layers.currentLayer.proficiencies) {
      Layers.currentLayer.proficiencies = {}
    }
    Layers.currentLayer.proficiencies[id] = 1;
    this.purchased[id] = true;

    UI.updateProficiencyUI();
    return true;
  },

  removeProficiency: function (id) {
    if (!this.purchased[id]) return false;

    const prof = this.availableProficiencies[id];
    Layers.refundPoints("proficiencies", id, prof.cost);
    delete Layers.currentLayer.proficiencies?.[id];
    delete this.purchased[id];

    UI.updateProficiencyUI();
    return true;
  },

  isPurchased: function (id) {
    return !!this.purchased[id];
  },

  getProficiencyById: function (id) {
    return this.availableProficiencies?.[id] || null;
  },

};

