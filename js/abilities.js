window.Abilities = {
  availableAbilities: {
    dual_wielder: {
      name: "Dual Wielder",
      cost: 10,
      description: "Allows you to wield a melee weapon in one hand and a short/small weapon in the other.",
      weaponProperties: [],
    },
    weapon_mastery: {
      name: "Weapon Mastery",
      cost: 12,
      description: "Choose a weapon type you are proficient in. Deal 1 extra damage with that weapon type.",
      weaponProperties: [],
    },
    strike_from_behind: {
      name: "Strike from Behind",
      cost: 8,
      description: "Striking from behind with small/short melee or thrown weapons deals 1 extra damage.",
      weaponProperties: [],
    },
    parry: {
      name: "Parry",
      cost: 3,
      description: "When hit with any melee attack, call parry to cancel damage and effects.",
      weaponProperties: [],
    },
    evade: {
      name: "Evade",
      cost: 5,
      description: "When struck with an attack or packet, call 'Evade!' to negate the attack.",
      weaponProperties: [],
    },
    medical_training: {
      name: "Medical Training",
      cost: 5,
      description: "Gives access to First Aid and Diagnose to heal and assess conditions.",
      weaponProperties: [],
    },
    healthy_body: {
      name: "Healthy Body",
      cost: 5,
      description: "Increases total health by 3 points. Can be purchased multiple times.",
      weaponProperties: [],
    },
    combat_refit: {
      name: "Combat Refit",
      cost: 2,
      description: "Allows you to repair armor on the battlefield after a 60-second roleplay.",
      weaponProperties: [],
    },
    gather_essence: {
      name: "Gather Essence",
      cost: 0,
      description: "Grants 1 use of Gather Essence for every 3 Spirit points. Cannot be purchased manually.",
      derived: true,
      weaponProperties: [],
    },
    tripping_strike: {
      name: "Tripping Strike",
      cost: 5,
      description: "When you strike a target and are not blocked, call damage as normal, then add 'Immediate Collapse!'",
      weaponProperties: ["tricky"],
    },
    massive_swings: {
      name: "Massive Swings",
      cost: 8,
      description: "Concentrate 3 count. Next 5 swings are Massive. Missing counts. Lasts 1 min.",
      weaponProperties: ["unstoppable"],
    },
    strike_the_throat: {
      name: "Strike the Throat",
      cost: 10,
      description: "Concentrate 3 count. On hit, add 'Long Silence'. Lost on active defense. Lasts 1 min.",
      weaponProperties: ["weighty_blows", "tricky"],
    },
    pressure_points: {
      name: "Pressure Points",
      cost: 15,
      description: "Say 'Pressure Points targeted!'. On hit, add 'Long Weakness 2'. Lost on active defense. Lasts 1 min.",
      weaponProperties: ["tricky", "piercing"],
    },
    body_blow: {
      name: "Body Blow",
      cost: 10,
      description: "Activate and say 'Body Blow active!'. On hit, add 'Short Nauseate'. Lost on active defense.",
      weaponProperties: ["weighty_blows"],
    },
    stone_flesh: {
      name: "Stone Flesh",
      cost: 8,
      description: "Concentrate and count 'My flesh is stone!'. For every 2 counts (max 10), gain Guard 5.",
      weaponProperties: ["defender"],
    },
    sword_breaker: {
      name: "Sword Breaker",
      cost: 10,
      description: "Concentrate 3 count. Strike to call 'I Crack your [item]'. Use within 3 attacks.",
      weaponProperties: ["unstoppable", "armor_destroyer"],
    },
    deep_wound: {
      name: "Deep Wound",
      cost: 20,
      description: "Concentrate 3 count. Next damage is Piercing + Long Bleeding. Lost on active defense.",
      weaponProperties: ["cutting_edge", "piercing"],
    },
    smite: {
      name: "Smite",
      cost: 15,
      description: "Say 'Smite Active!'. Next melee attack deals +5 Power damage. Lost on active defense.",
      weaponProperties: ["weighty_blows"],
    },
    weak_points: {
      name: "Weak Points",
      cost: 12,
      description: "Concentrate 3 count. Next attack on target is Piercing +3. Lost if attacking another.",
      weaponProperties: ["piercing"],
    },
    disarming_strike: {
      name: "Disarming Strike",
      cost: 5,
      description: "If blocked by boffer or shield, call 'Disarm [item]'.",
      weaponProperties: ["duelist", "tricky"],
    },
    rapid_riposte: {
      name: "Rapid Riposte",
      cost: 5,
      description: "If struck in melee, call 'Riposte' to strike back. Still take original damage.",
      weaponProperties: ["duelist", "tricky"],
    },
    total_defense: {
      name: "Total Defense",
      cost: 10,
      description: "Activate. Next 3 melee hits are treated as blocked. Must hold weapon/shield.",
      weaponProperties: ["duelist"],
    },
    iron_flesh: {
      name: "Iron Flesh",
      cost: 5,
      description: "Concentrate 'Turning to Iron!'. Next 3 attacks reduce damage by 5. Unsteady during.",
      weaponProperties: ["defender"],
    },
    mountain_stance: {
      name: "Mountain Stance",
      cost: 15,
      description: "Concentrate 3 count. Until moving or 1 min, reduce all damage by 5, immune to push.",
      weaponProperties: ["defender"],
    },
    challenging_call: {
      name: "Challenging Call",
      cost: 5,
      description: "Call 'Face me!'. Enemy focuses you unless harmed by others. Mind-affecting.",
      weaponProperties: ["defender"],
    },
    opportunist: {
      name: "Opportunist",
      cost: 5,
      description: "Attack a distracted enemy from behind. Call 'Sneak attack [weapon+10]'.",
      weaponProperties: ["assassins_tools", "trick_shot"],
    },
    assassins_strike: {
      name: "Assassin's Strike",
      cost: 12,
      description: "Strike an unaware enemy from behind. Call 'Assassinate [weapon+20]'.",
      weaponProperties: ["assassins_tools"],
    },
    stunning_strike: {
      name: "Stunning Strike",
      cost: 8,
      description: "If strike not blocked, call 'Stunning Strike, Short Nauseate!'.",
      weaponProperties: ["unstoppable"],
    },
    helm_crusher: {
      name: "Helm Crusher",
      cost: 12,
      description: "Activate 'Helm Crusher active!'. On hit, add 'Short Concussion'. Lost after 1 min.",
      weaponProperties: ["armor_destroyer", "weighty_blows"],
    },
    staggering_blow: {
      name: "Staggering Blow",
      cost: 10,
      description: "Activate 'Staggering Blows active!'. Next 3 attacks add Smash. Use in 1 min.",
      weaponProperties: ["armor_destroyer", "unstoppable"],
    },
    clear_the_way: {
      name: "Clear the Way!",
      cost: 15,
      description: "Concentrate 3 count. For 1 min or 5 strikes, +1 damage + Massive + Smash.",
      weaponProperties: ["armor_destroyer"],
    },
    lacerate: {
      name: "Lacerate",
      cost: 10,
      description: "Activate 'One to Remember'. Must hit from behind. Double damage + Long Bleed.",
      weaponProperties: ["cutting_edge"],
    },
    binding_blade: {
      name: "Binding Blade",
      cost: 10,
      description: "A Valiant who purchases this skill gains the ability to cast their Bindings through their weapon, rather than deliver it through a thrown packet. Any Binding with a range of touch or thrown can instead be delivered through a melee weapon that the Binder is holding. The caster must loudly state “Binding Blade!” then state the binding’s incant as normal. A Binding Blade will deliver the effect even if blocked. If the attack is not blocked, it will also deal the weapons normal damage. The binding fades and is lost if another binding is cast, or if 1 minute passes.",
      weaponProperties: ["essence_slot"],
    },
    combat_focus: {
      name: "Combat Focus",
      cost: 5,
      description: "This ability may be used at will. If a Binder is stating an incant and is interrupted or flubs the binding, normally the binding would be lost. Binders with this skill may instead loudly state “Focus!” and repeat their binding incant from the beginning. If they are interrupted or flub it again, the binding slot is lost as normal. This ability may be used at will.",
      weaponProperties: ["essence_slot"],
    },
    lesser_calamity: {
      name: "Lesser Calamity",
      cost: 5,
      description: "A War Caster of the Path of Calamity who wishes to use a secondary element must purchase this skill in order to use another element. After this skill is purchased, the Binder gains access to a secondary element of their choice and can cast any binding up to their binding slot level, as long as that binding is listed as a secondary or tertiary.",
      weaponProperties: ["essence_slot"],
    },
    minor_calamity: {
      name: "Minor Calamity",
      cost: 10,
      description: "A War Caster who wishes to use a third element must purchase this skill in order to do so. After this skill is purchased, the Binder gains access to a third element and can cast any binding up to their binding slot level, as long as that binding is listed as tertiary.",
      weaponProperties: ["essence_slot"],
    }
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
    this.currentLayerPurchasedAbilities = {};
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
   * Boolean check if the ability is able to be purchased
   * User must have sufficient build points and all necessary weapon properties owned
   */
  canPurchase: function(abilityId) {
    const ability = Abilities.availableAbilities[abilityId];
    const requiredProps = ability.weaponProperties || [];

    // Morph abilities can only be purchased at character creation time
    if ((ability?.isMorph || false) && Layers.getCurrentLevel() > 1) {
      console.warn("Can't purchase morph abilities after level one");
      return false;
    }

    // If the ability has a max limit
    maxPurchases = (ability?.maxPurchases || 0)

    // If we have already purchased the max then we cannot purchase again
    // TODO - return reason to display on disabled purchase button
    if (maxPurchases > 0 && this.getPurchaseCount(abilityId) >= maxPurchases) {
      return false;
    }

    if (requiredProps.length === 0) return true; // no property restriction

    const playerProps = WeaponProperties.getPlayerProperties(); // returns a Set

    // Return True if the user has at least one of the required trainings (weapon properties)
    req_met = requiredProps.some(prop => playerProps.has(prop));
    return requiredProps.some(prop => playerProps.has(prop));
  },

  getCost(ability) {
    const baseCost = ability?.cost || 0;

    // Factor defaults to 1 for safety
    const discountFactor = ability?.discount?.factor || 1;

    // -1 means infinite, greater than 1 means we have it, so anything but zero
    const discountUses = ability?.discount?.uses || 0;

    hasDiscount = discountUses !== 0;

    return Math.floor(baseCost * (hasDiscount ? discountFactor : 1));
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

    if (cost < ability.cost && ability?.discount?.uses > 0) {
      ability.discount.uses--;
      ability.discount.used++;
    }

    this.purchasedAbilities[id] = (this.purchasedAbilities[id] || 0) + 1;
    this.currentLayerPurchasedAbilities[id] = (this.currentLayerPurchasedAbilities[id] || 0) + 1;
    return true;
  },

  /**
   *
   */
  canRefund: function(id) {
    const purchased = this.currentLayerPurchasedAbilities?.[id] || 0;

    // This is a little sticky, don't want refunding of racially provided
    // abilities. Probably should be tracked different from the currentLayer but oh well.
    if (Layers.getCurrentLevel() === 1) {
      const racial = window.RacialLocks?.abilities?.has(id) ? 1 : 0;
      const morph = window.MorphLocks?.has(id) ? 1 : 0;

      // Can only refund if you have purchased at least one this round
      return purchased > racial + morph;
    }

    return purchased > 0;
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

    // Restore spent points
    cost = this.getRefund(id);

    // Remove one usage from total and current
    this.purchasedAbilities[id] -= 1;
    this.currentLayerPurchasedAbilities[id] -= 1;

    // If this was the last one then delete it from our tracking (better preview and layer history)
    if (this.purchasedAbilities[id] <= 0) {
      delete this.purchasedAbilities[id];
      delete this.currentLayerPurchasedAbilities[id];
    }

    Layers.refundPoints("abilities", id, cost);
    return true;
  },

  getRefund(id) {
    const ability = this.availableAbilities[id];

    // If you have discount uses then this was purchased at a discount
    if ((ability?.discount?.uses || 0) > 0) {
      ability.discount.used--;
      ability.discount.uses++;
      // Return cost with factor applied
      console.log("Refunding discounted ability purchase and restoring discount use");
      return ability.cost * ability.discount.factor;
    }

    // Unlimited
    if ((ability?.discount?.uses || 0) < 0) {
      // Return cost with factor applied
      console.log("Refunding discounted ability purchase and restoring discount use");
      return Math,floor(ability.cost * ability.discount.factor);
    }

    // if totalPurchased <= used then restore a discount and refund a factored cost
    if (this.purchasedAbilities[id] <= (ability?.discount?.used || 0)) {
      ability.discount.used--;
      ability.discount.uses++;
      //Return cost with factor applied
      console.log("Refunding discounted ability purchase and restoring discount use");
      return Math.floor(ability.cost * ability.discount.factor);
    }

    // This was not purchased at a discount, refund full amount
    return ability.cost;
  },

  isAbilityPurchased(id) {
    return !!this.purchasedAbilities[id];
  },

  getAbilityById: function (id) {
    return this.availableAbilities?.[id] || null;
  },

  applyDiscounts: function(discounts) {
    for (const discount of discounts) {
      name = discount.name;
      uses = discount.uses;
      factor = discount.factor;

      ability = this.availableAbilities[name];

      // Track uses. -1 means unlimited
      // Factor is discount factor such as 0.5
      // Used is to track how many have been used - for refund tracking
      this.availableAbilities[name].discount = {uses: uses, factor: factor, used: 0};
    }
  },

  /**
   * We keep a global number of purhcased abilities to avoid recalculating it from all
   * layers each time we refresh.
   * When reverting to a previous layer, we do need to iterate through all
   * prior layers though.
   */
  recalcFromLayers: function () {
    console.log("Recalculating Abilities from all locked layers + current layer");

    this.purchasedAbilities = {};
    this.currentLayerPurchasedAbilities = {};

    // Rebuild purchasedAbilities from all finalized layers
    for (const layer of Layers.layers) {
      for (const id in layer.abilities || {}) {
        this.purchasedAbilities[id] = (this.purchasedAbilities[id] || 0) + layer.abilities[id];
      }
    }

    // Restore current layer abilities
    const current = Layers.currentLayer.abilities || {};
    for (const id in current) {
      this.currentLayerPurchasedAbilities[id] = current[id];
      this.purchasedAbilities[id] = (this.purchasedAbilities[id] || 0) + current[id];
    }
  },

  meetFilters: function (filterAfford, filterPrereq, filterRefundable, id, ability) {
    // 1) Compute our three booleans
    const cost      = Abilities.getCost(ability);
    const hasPoints = Layers.getRemainingPoints() >= cost;
    const prereqMet = Abilities.canPurchase(id);
    const canRefund = Abilities.canRefund(id);

    // 2) If none are checked, show everything
    if (!filterAfford && !filterPrereq && !filterRefundable) {
      return true;
    }

    // 3) If all three are checked, require all three
    if (filterAfford && filterPrereq && filterRefundable) {
      return hasPoints && prereqMet && canRefund;
    }

    // 4) If any two are checked, require those two
    if (filterAfford && filterPrereq) {
      return hasPoints && prereqMet;
    }
    if (filterAfford && filterRefundable) {
      return hasPoints && canRefund;
    }
    if (filterPrereq && filterRefundable) {
      return prereqMet && canRefund;
    }

    // 5) Otherwise exactly one is checked—require it
    if (filterAfford)       return hasPoints;
    if (filterPrereq)       return prereqMet;
    if (filterRefundable)   return canRefund;

    // (fallback)
    return true;
  },

};
