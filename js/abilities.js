
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
      description: "Refit armor in combat using 60s count and RP. Cannot move, act, or defend while doing so."
    }
  ],

  purchased: [],
  purchasedMap: {},

  renderShop: function () {
    const shopContainer = document.getElementById("ability-shop");
    shopContainer.innerHTML = "";
    const allPurchased = this.purchasedMap;

    this.list.forEach(ability => {
      const count = allPurchased[ability.id] || 0;
      const isMaxed = ability.maxPurchases && count >= ability.maxPurchases;

      const card = document.createElement("div");
      card.className = "ability-item";

      const label = document.createElement("span");
      label.textContent = ability.name + (count > 0 ? ` (x${count})` : "");
      label.title = ability.description;

      const btn = document.createElement("button");
      btn.textContent = isMaxed ? "Maxed" : `Buy (${ability.cost} BP)`;
      btn.disabled = isMaxed;
      btn.className = "buy-ability-btn";
      btn.setAttribute("data-ability", ability.id);

      card.appendChild(label);
      card.appendChild(btn);
      shopContainer.appendChild(card);
    });
  },

  pointsSpentOnAbilities: function () {
    return this.purchased.reduce((sum, a) => sum + a.cost, 0);
  },

  getAbilityById: function (id) {
    return this.list.find(a => a.id === id);
  },

  purchaseAbility: function (id) {
    const ability = this.getAbilityById(id);
    if (!ability) return;

    const currentCount = this.purchasedMap[id] || 0;
    const maxed = ability.maxPurchases && currentCount >= ability.maxPurchases;

    if (maxed) return alert("You’ve already purchased the maximum allowed.");
    if (ability.cost > Layers.getRemainingPoints()) return alert("Not enough build points!");

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
   * Only abilities purchased at the current level can be removed.
   * @param {string} abilityName - The name of the ability to remove.
   * @returns {boolean} True if removal succeeded, false otherwise.
   */
  removeAbility: function (abilityName) {
    // Find an ability instance with the given name that was purchased in the current level.
    const index = this.purchased.findIndex(ab => ab.name === abilityName && ab.level === Layers.currentLevel);
    if (index === -1) {
      alert("You can only remove abilities purchased at your current level.");
      return false;
    }
    
    // Remove the ability instance from the purchased array.
    const ability = this.purchased.splice(index, 1)[0];
  
    // Recalculate purchasedMap based on remaining purchased abilities.
    this.purchasedMap = {};
    this.purchased.forEach(ab => {
      this.purchasedMap[ab.id] = (this.purchasedMap[ab.id] || 0) + 1;
    });
  
    // Remove from the current layer record.
    const layer = Layers.layersData[ability.level - 1];
    if (layer) {
      // Remove only one instance for the given ability name.
      let removed = false;
      layer.abilities = layer.abilities.filter(a => {
        if (!removed && a.startsWith(ability.name)) {
          removed = true;
          return false;
        }
        return true;
      });
    }
  
    // Re-render the shop, purchased abilities list, and update remaining points.
    this.renderShop();
    UI.updatePurchasedAbilities();
    UI.updateRemainingPoints(Layers.getRemainingPoints());
    return true;
  }

};
