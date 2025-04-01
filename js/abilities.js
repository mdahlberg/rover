window.Abilities = {
  availableAbilities: {
    dual_wielder: {
      name: "Dual Wielder",
      cost: 10,
      description:
        "Allows you to wield a melee weapon in one hand and a short/small weapon in the other.",
    },
    weapon_mastery: {
      name: "Weapon Mastery",
      cost: 12,
      description:
        "Choose a weapon type you are proficient in. Deal 1 extra damage with that weapon type.",
    },
    strike_from_behind: {
      name: "Strike from Behind",
      cost: 8,
      description:
        "Striking from behind with small/short melee or thrown weapons deals 1 extra damage.",
    },
    parry: {
      name: "Parry",
      cost: 3,
      description:
        "When hit with any melee attack, call parry to cancel damage and effects.",
    },
    evade: {
      name: "Evade",
      cost: 5,
      description:
        "When struck with an attack or packet, call 'Evade!' to negate the attack.",
    },
    medical_training: {
      name: "Medical Training",
      cost: 5,
      description:
        "Gives access to First Aid and Diagnose to heal and assess conditions.",
    },
    healthy_body: {
      name: "Healthy Body",
      cost: 5,
      description:
        "Increases total health by 3 points. Can be purchased multiple times.",
    },
    combat_refit: {
      name: "Combat Refit",
      cost: 2,
      description:
        "Allows you to repair armor on the battlefield after a 60-second roleplay.",
    },
    gather_essence: {
      name: "Gather Essence",
      cost: 0,
      description:
        "Grants 1 use of Gather Essence for every 3 Spirit points. Cannot be purchased manually.",
    },
  },

  // Keeps track of purchased abilities
  purchasedAbilities: {},

  /**
   * Purchase an ability if enough points are available.
   * @param {string} abilityId - ID of the ability
   * @returns {boolean} Success or failure
   */
  purchaseAbility: function (abilityId) {
    const ability = this.availableAbilities[abilityId];
    if (!ability || Layers.getRemainingPoints() < ability.cost) {
      console.warn("Not enough points or invalid ability.");
      return false;
    }
    if (!this.purchasedAbilities[abilityId]) {
      this.purchasedAbilities[abilityId] = 1;
    } else {
      this.purchasedAbilities[abilityId]++;
    }
    Layers.spendPoints("abilities", abilityId, ability.cost);
    UI.updateAbilityUI();
    return true;
  },

  /**
   * Refund and remove an ability purchased at the current level.
   * @param {string} abilityId - ID of the ability to remove
   */
  removeAbility: function (abilityId) {
    if (!this.purchasedAbilities[abilityId]) return;
    const ability = this.availableAbilities[abilityId];
    delete this.purchasedAbilities[abilityId];
    Layers.refundPoints("abilities", abilityId, ability.cost);
    UI.updateAbilityUI();
  },

  /**
   * Check if an ability is purchased.
   * @param {string} abilityId
   * @returns {boolean}
   */
  isAbilityPurchased: function (abilityId) {
    return !!this.purchasedAbilities[abilityId];
  },
};

