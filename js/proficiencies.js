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

  purchaseProficiency: function (id, overrideCost) {
    const prof = this.availableProficiencies[id];

    const cost = overrideCost ?? prof.cost

    if (!prof || this.purchased[id]) return false;

    if (!Layers.spendPoints("proficiencies", id, cost)) return false;

    if (!Layers.currentLayer.proficiencies) {
      Layers.currentLayer.proficiencies = {}
    }

    Layers.currentLayer.proficiencies[id] = 1;
    this.purchased[id] = true;

    UI.updateProficiencyUI();
    return true;
  },

  canRefund: function(id) {
    // Can't return from previous level
    if (!Layers.currentLayer.proficiencies?.[id]) {
      return false;
    }

    // Can't return starting stuff
    if (window.RacialLocks?.proficiencies?.has(id)) {
      return false;
    }

    // Check weapon property dependencies
    const propertiesRemoved = new Set();

    // See what properties this proficiency grants
    for (const [propId, prop] of Object.entries(WeaponProperties.availableProperties)) {
      if (prop.grantedBy?.includes(id)) {
        propertiesRemoved.add(propId);
      }
    }

    // Get the set of properties *after* refunding this proficiency
    const stillOwnedProps = WeaponProperties.getPlayerProperties();
    propertiesRemoved.forEach(p => stillOwnedProps.delete(p));

    // Look through all currently purchased abilities
    for (const [abilityId, count] of Object.entries(Abilities.purchasedAbilities)) {
      if (count <= 0) continue;

      const ability = Abilities.availableAbilities[abilityId];
      const requiredProps = ability.weaponProperties || [];

      const hasRequired = requiredProps.some(prop => stillOwnedProps.has(prop));
      if (!hasRequired && requiredProps.length > 0) {
        console.warn(`Cannot refund ${id} — it would invalidate purchased ability: ${ability.name}`);
        return false;
      }
    }

    return true;
  },

  removeProficiency: function (id) {
    if (!this.purchased[id] || !Layers.currentLayer.proficiencies?.[id]) return false;

    if (window.RacialLocks?.proficiencies?.has(id)) {
      console.warn("Cannot remove starting proficiency: ", id);
      return false;
    }

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

  initializeRacialProficiencies: function () {
    const racial = JSON.parse(localStorage.getItem("racialProficiencies") || "[]");
    racial.forEach((id) => {
      if (!this.purchasedProficiencies[id]) {
        this.purchasedProficiencies[id] = "racial";
      }
    });
  },
  
};

