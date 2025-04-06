window.Abilities = {
  availableAbilities: {
    dual_wielder: {
      name: "Dual Wielder",
      cost: 10,
      description: "Allows you to wield a melee weapon in one hand and a short/small weapon in the other.",
    },
    weapon_mastery: {
      name: "Weapon Mastery",
      cost: 12,
      description: "Choose a weapon type you are proficient in. Deal 1 extra damage with that weapon type.",
    },
    strike_from_behind: {
      name: "Strike from Behind",
      cost: 8,
      description: "Striking from behind with small/short melee or thrown weapons deals 1 extra damage.",
    },
    parry: {
      name: "Parry",
      cost: 3,
      description: "When hit with any melee attack, call parry to cancel damage and effects.",
    },
    evade: {
      name: "Evade",
      cost: 5,
      description: "When struck with an attack or packet, call 'Evade!' to negate the attack.",
    },
    medical_training: {
      name: "Medical Training",
      cost: 5,
      description: "Gives access to First Aid and Diagnose to heal and assess conditions.",
    },
    healthy_body: {
      name: "Healthy Body",
      cost: 5,
      description: "Increases total health by 3 points. Can be purchased multiple times.",
    },
    combat_refit: {
      name: "Combat Refit",
      cost: 2,
      description: "Allows you to repair armor on the battlefield after a 60-second roleplay.",
    },
    gather_essence: {
      name: "Gather Essence",
      cost: 0,
      description: "Grants 1 use of Gather Essence for every 3 Spirit points. Cannot be purchased manually.",
      derived: true
    },
  },

  currentLayerPurchasedAbilities: {}, // Tracks purchases for this layer only
  purchasedAbilities: {},  // Tracks normal purchases
  derivedAbilities: {"gather_essence": 0},    // Tracks derived ones like Gather Essence

  getCurrentLayerPurchaseCount(id) {
    return this.currentLayerPurchasedAbilities[id] || 0;
  },

  getPurchaseCount(id) {
    return this.purchasedAbilities[id] || 0;
  },

  getDerivedUses(id) {
    return this.derivedAbilities[id] || 0;
  },

  resetCurrentLayerPurchasedAbilities: function() {
    currentLayerPurchasedAbilities = {};
  },

  /**
   * Set derived ability uses (like gather essence).
   * @param {string} id
   * @param {number} count
   */
  setDerivedAbility(id, count) {
    if (count <= 0) {
      delete this.derivedAbilities[id];
    } else {
      this.derivedAbilities[id] = count;
    }
  },

  /**
   * Purchase a standard ability (not derived).
   */
  purchaseAbility(id, cost) {
    const ability = this.availableAbilities[id];
    if (!ability || ability.derived) {
      console.warn("Cannot purchase derived ability:", id);
      return false;
    }

    if (!Layers.spendPoints("abilities", id, cost)) return false;

    this.purchasedAbilities[id] = (this.purchasedAbilities[id] || 0) + 1;
    this.currentLayerPurchasedAbilities[id] = (this.currentLayerPurchasedAbilities[id] || 0) + 1;
    return true;
  },

  /**
   *
   */
  canRefund: function(id) {
    if (!this.currentLayerPurchasedAbilities?.[id]) {
      return false;
    }

    return true;
  },

  /**
   * Remove/refund a purchased ability.
   */
  removeAbility(id) {
    if (!this.currentLayerPurchasedAbilities?.[id]) {
      console.warn("This ability was not purchased this level and cannot be refunded.");
      return false;
    }

    const ability = this.availableAbilities[id];
    if (!ability || ability.derived) {
      console.warn("Cannot remove derived ability:", id);
      return false;
    }

    if (!this.purchasedAbilities[id]) return false;

    this.purchasedAbilities[id] -= 1;
    this.currentLayerPurchasedAbilities[id] -= 1;
    if (this.purchasedAbilities[id] <= 0) {
      delete this.purchasedAbilities[id];
      delete this.currentLayerPurchasedAbilities[id];
    }

    Layers.refundPoints("abilities", id, ability.cost);
    return true;
  },

  isAbilityPurchased(id) {
    return !!this.purchasedAbilities[id];
  },

  getAbilityById: function (id) {
    return this.availableAbilities?.[id] || null;
  },

};
