/* 
  abilities.js - Manages abilities, including purchasing, displaying, 
  and rendering derived abilities like "Gather Essence".
*/

window.Abilities = {
  list: [
    {
      id: "dual_wielder",
      name: "Dual Wielder",
      cost: 10,
      maxPurchases: 1,
      description: "Allows dual wielding: one main-hand proficient weapon and one short/small off-hand melee weapon."
    },
    {
      id: "weapon_mastery",
      name: "Weapon Mastery",
      cost: 12,
      stackable: true,
      description: "Choose a proficient weapon type. Deal +1 damage with that type. May be purchased multiple times for different types."
    },
    {
      id: "strike_from_behind",
      name: "Strike from Behind",
      cost: 8,
      maxPurchases: 1,
      description: "Deal +1 damage from behind with a short/small melee or thrown weapon. Stacks with Weapon Mastery."
    },
    {
      id: "parry",
      name: "Parry",
      cost: 3,
      maxPurchases: 1,
      description: "Cancel damage from melee attacks. May also defend nearby allies if holding an appropriate weapon or shield."
    },
    {
      id: "evade",
      name: "Evade",
      cost: 5,
      maxPurchases: 1,
      description: "Avoid an attack by calling 'Evade!'. Cannot be used if movement is impaired (pinned, entangled, etc)."
    },
    {
      id: "medical_training",
      name: "Medical Training",
      cost: 5,
      maxPurchases: 1,
      description: "Grants First Aid and Diagnose abilities. Use RP and 60s timer to stabilize or get truthful info from incapacitated characters."
    },
    {
      id: "healthy_body",
      name: "Healthy Body",
      cost: 5,
      stackable: true,
      description: "Increase max health by 3 (up to 50). Does not affect Body stat. May be bought multiple times."
    },
    {
      id: "combat_refit",
      name: "Combat Refit",
      cost: 2,
      stackable: true,
      description: "Refit armor in combat using a 60s count and RP. Cannot move, act, or defend while doing so."
    },
    // Derived ability: Gather Essence.
    {
      id: "gather_essence",
      name: "Gather Essence",
      cost: 0,
      nonPurchasable: true,
      description: "This ability is derived: You gain one use of 'Gather Essence' for every 3 Spirit stat points purchased. It cannot be purchased directly."
    }
  ],

  purchased: [],
  purchasedMap: {},

  /**
   * Returns the total build points spent on purchased abilities.
   * @returns {number}
   */
  pointsSpentOnAbilities: function() {
    return this.purchased.reduce((sum, a) => sum + a.cost, 0);
  },

  /**
   * Renders the ability shop.
   * For non-purchasable abilities (like Gather Essence), it shows the derived count.
   */
  renderShop: function() {
    const shopContainer = document.getElementById("ability-shop");
    shopContainer.innerHTML = "";
    const allPurchased = this.purchasedMap;

    this.list.forEach(ability => {
      if (ability.nonPurchasable) {
        const card = document.createElement("div");
        card.className = "ability-item";
        const derivedUses = this._getDerivedUsesForGather();
        const label = document.createElement("span");
        label.textContent = `${ability.name}: ${derivedUses} use${derivedUses === 1 ? "" : "s"}`;
        label.title = ability.description;
        card.appendChild(label);
        shopContainer.appendChild(card);
      } else {
        const count = allPurchased[ability.id] || 0;
        const isMaxed = ability.maxPurchases && count >= ability.maxPurchases;
        const card = document.createElement("div");
        card.className = "ability-item";
        const label = document.createElement("span");
        label.textContent = `${ability.name}${count > 0 ? ` (x${count})` : ""}`;
        label.title = ability.description;
        const btn = document.createElement("button");
        btn.textContent = isMaxed ? "Maxed" : `Buy (${ability.cost} BP)`;
        btn.disabled = isMaxed;
        btn.className = "buy-ability-btn";
        btn.setAttribute("data-ability", ability.id);
        card.appendChild(label);
        card.appendChild(btn);
        shopContainer.appendChild(card);
      }
    });
  },

  /**
   * Private helper: Returns the total derived Gather Essence uses based on the entire Spirit stat.
   * @returns {number}
   */
  _getDerivedUsesForGather: function () {
    const totalSpirit = Stats.lockedStats['spirit'] + Stats.currentStats['spirit'];
    return Math.floor(totalSpirit / 3);
  },

  /**
   * Updates the derived "Gather Essence" ability for the current level.
   * It calculates the total derived uses from the entire Spirit stat,
   * subtracts the uses already locked from previous levels,
   * and then adds the difference for the current level.
   */
  updateGatherEssenceDerived: function () {
    // Total derived uses from the entire Spirit stat.
    const totalDerived = this._getDerivedUsesForGather();
    // Derived uses already locked from previous levels.
    const previousDerived = Math.floor(Stats.lockedStats['spirit'] / 3);
    // New derived uses for the current level.
    const newDerived = totalDerived - previousDerived;

    // Remove any existing Gather Essence entries for the current level.
    this.purchased = this.purchased.filter(item => {
      return !(item.id === 'gather_essence' && item.level === Layers.currentLevel);
    });
    this.purchasedMap['gather_essence'] = 0;

    // Add new derived uses for the current level.
    for (let i = 0; i < newDerived; i++) {
      this.purchased.push({
        id: "gather_essence",
        name: "Gather Essence",
        cost: 0,
        level: Layers.currentLevel
      });
    }
    this.purchasedMap['gather_essence'] = newDerived;

    // Re-render the shop and update UI.
    this.renderShop();
    UI.updatePurchasedAbilities();
    UI.updateRemainingPoints(Layers.getRemainingPoints());
  },

  /**
   * Retrieves an ability by its ID.
   * @param {string} id
   * @returns {object}
   */
  getAbilityById: function(id) {
    return this.list.find(a => a.id === id);
  },

  /**
   * Handles purchasing a standard ability.
   * @param {string} id - The ability ID.
   */
  purchaseAbility: function(id) {
    const ability = this.getAbilityById(id);
    if (!ability) return;

    if (ability.nonPurchasable) {
      alert("This ability is derived from your Spirit stat and cannot be purchased directly.");
      return;
    }

    const currentCount = this.purchasedMap[id] || 0;
    const isMaxed = ability.maxPurchases && currentCount >= ability.maxPurchases;

    if (isMaxed) {
      alert("You’ve already purchased the maximum allowed.");
      return;
    }
    if (ability.cost > Layers.getRemainingPoints()) {
      alert("Not enough build points!");
      return;
    }

    const newPurchase = {
      id: ability.id,
      name: ability.name,
      cost: ability.cost,
      level: Layers.currentLevel
    };

    this.purchased.push(newPurchase);
    this.purchasedMap[id] = currentCount + 1;

    const layer = Layers.layersData[Layers.currentLevel - 1];
    if (layer) {
      layer.abilities.push(ability.name + (ability.stackable ? ` (x${this.purchasedMap[id]})` : ""));
    }

    this.renderShop();
    UI.updatePurchasedAbilities();
    UI.updateRemainingPoints(Layers.getRemainingPoints());
  },

  /**
   * Removes one instance of an ability purchased at the current level.
   * @param {string} abilityName - The ability name.
   * @returns {boolean} True if removal succeeded.
   */
  removeAbility: function(abilityName) {
    const index = this.purchased.findIndex(ab => ab.name === abilityName && ab.level === Layers.currentLevel);
    if (index === -1) {
      alert("You can only remove abilities purchased at your current level.");
      return false;
    }
    const ability = this.purchased.splice(index, 1)[0];
    this.purchasedMap = {};
    this.purchased.forEach(ab => {
      this.purchasedMap[ab.id] = (this.purchasedMap[ab.id] || 0) + 1;
    });
    const layer = Layers.layersData[ability.level - 1];
    if (layer) {
      let removed = false;
      layer.abilities = layer.abilities.filter(a => {
        if (!removed && a.startsWith(ability.name)) {
          removed = true;
          return false;
        }
        return true;
      });
    }
    this.renderShop();
    UI.updatePurchasedAbilities();
    UI.updateRemainingPoints(Layers.getRemainingPoints());
    return true;
  }
};
