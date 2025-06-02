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

  purchasedProficiencies: {},
  currentLayerPurchasedProficiencies: {},

  purchaseProficiency: function (id, overrideCost) {
    const prof = this.availableProficiencies[id];
    const cost = overrideCost ?? prof.cost;

    if (!prof || this.purchasedProficiencies[id]) return false;
    if (!Layers.spendPoints("proficiencies", id, cost)) return false;

    this.purchasedProficiencies[id] = true;
    this.currentLayerPurchasedProficiencies[id] = true;

    UI.updateProficiencyUI();
    return true;
  },

  canRefund: function (id) {
    if (!this.currentLayerPurchasedProficiencies[id]) return false;
    if (window.RacialLocks?.proficiencies?.has(id)) return false;

    const propertiesRemoved = new Set();
    for (const [propId, prop] of Object.entries(WeaponProperties.availableProperties)) {
      if (prop.grantedBy?.includes(id)) propertiesRemoved.add(propId);
    }

    // Get the set of properties *after* refunding this proficiency
    const stillOwnedProps = WeaponProperties.getPlayerProperties();
    propertiesRemoved.forEach(p => stillOwnedProps.delete(p));

    for (const [abilityId, count] of Object.entries(Abilities.purchasedAbilities)) {
      if (count <= 0) continue;
      const ability = Abilities.availableAbilities[abilityId];
      const requiredProps = ability.weaponProperties || [];
      if (requiredProps.length && !requiredProps.some(p => stillOwnedProps.has(p))) {
        return false;
      }
    }

    return true;
  },

  removeProficiency: function (id) {
    if (!this.purchasedProficiencies[id] || !this.currentLayerPurchasedProficiencies[id]) return false;
    if (window.RacialLocks?.proficiencies?.has(id)) return false;

    const prof = this.availableProficiencies[id];
    Layers.refundPoints("proficiencies", id, prof.cost);

    delete this.purchasedProficiencies[id];
    delete this.currentLayerPurchasedProficiencies[id];

    UI.updateProficiencyUI();
    return true;
  },

  isPurchased: function (id) {
    return !!this.purchasedProficiencies[id];
  },

  getProficiencyById: function (id) {
    return this.availableProficiencies?.[id] || null;
  },

  initializeRacialProficiencies: function () {
    const racial = JSON.parse(sessionStorage.getItem(Constants.RACIAL_PROFS) || "[]");
    racial.forEach(id => this.purchasedProficiencies[id] = "racial");
  },

  resetCurrentLayer: function () {
    this.currentLayerPurchasedProficiencies = {};
  },

  recalcFromLayers: function() {
    console.log("Restoring Proficiencies from all locked layers");

    // 1) clear out everything
    this.purchasedProficiencies = {};
    this.currentLayerPurchasedProficiencies = {};

    // 2) re‑apply every finalized (locked) layer
    for (const layer of Layers.layers) {
      if (!layer?.proficiencies) continue;
      for (const id of Object.keys(layer.proficiencies)) {
        this.purchasedProficiencies[id] = true;
      }
    }

    // 3) restore the current layer’s own purchases
    const restored = Layers.currentLayer.proficiencies || {};
    for (const id of Object.keys(restored)) {
      this.purchasedProficiencies[id]             = true;
      this.currentLayerPurchasedProficiencies[id] = true;
    }

    // 4) tell the UI to catch up
    UI.updateProficiencyUI();
  },

};
