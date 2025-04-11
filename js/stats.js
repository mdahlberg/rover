window.Stats = {
  currentStats: {
    body: 0,
    mind: 0,
    spirit: 0,
  },

  startingStats: {
    body: 0,
    mind: 0,
    spirit: 0,
  },
  currentLayerStats: {
    body: 0,
    mind: 0,
    spirit: 0,
  },
  
  lockedStats: {
    body: false,
    mind: false,
    spirit: false
  },

  /**
   * Returns total value of a core stat (locked + current).
   */
  getTotal(statName) {
    return (this.startingStats[statName] || 0) + (this.currentStats[statName] || 0);
  },

  /**
   * Locks a stat bonus (from race selection).
   */
  lockStat(statName, value) {
    this.startingStats[statName] = (this.startingStats[statName] || 0) + value;
  },

  resetLayerStats() {
    this.currentLayerStats = { body: 0, mind: 0, spirit: 0 };
    this.lockedStats.body = false;
    this.lockedStats.mind = false;
    this.lockedStats.spirit = false;
  },

  /**
   * Get cost to increase a stat based on current value and level.
   */
  getStatCost(statName, statCountOffset=0) {
    const current = this.getTotal(statName) + statCountOffset;
    const level = Layers.getCurrentLevel();

    if (level <= 2) {
      if (current < 6) return 2;
      if (current <= 20) return 3;
      return 5;
    } else if (level <= 6) {
      if (current < 6) return 3;
      if (current <= 20) return 5;
      return 6;
    } else if (level <= 12) {
      if (current < 6) return 5;
      if (current <= 20) return 6;
      return 8;
    } else if (level <= 18) {
      if (current < 6) return 6;
      if (current <= 20) return 8;
      return 10;
    } else {
      if (current < 6) return 8;
      if (current <= 20) return 10;
      return 12;
    }
  },

  canIncrease(statName) {
    const cost = this.getStatCost(statName);
    if (Layers.getRemainingPoints() < cost) {
      return {allowed: false, reason: "Not enough BP"};
    }

    if (this.lockedStats[statName]) {
      return {allowed: false, reason: "You cannot alter Mind after purchasing Essence Slots. Refund essence slots first"};
    }

    return {allowed: true, reason: ""};
  },

  canDecrease(statName) {
    const current = this.getTotal(statName);

    if (current <= 0 || this.currentStats[statName] <= 0) {
      return {allowed: false, reason: "Cannot decrease this stat below starting value"};
    }

    // If nothing purchased this layer, don't allow refund
    if (!this.currentLayerStats[statName] || this.currentLayerStats[statName] <= 0) {
      return { allowed: false, reason: "Cannot refund stats gained in previous levels" };
    }

    // TODO - this only applies to mind and is not dynamic across stats!
    // Locked stat logic (e.g., Mind after Essence)
    if (this.lockedStats[statName]) {
      return {allowed: false, reason: "You cannot alter Mind after purchasing Essence Slots. Refund essence slots first"};
    }

    // 🧠 Mind → Lore check
    if (statName === "mind") {
      const nextMind = current - 1;
      const maxLores = Math.floor(nextMind / 3);
      const spent = Object.values(Lores.getSelectedLores()).reduce((sum, v) => sum + v, 0);
      if (spent > maxLores) {
        return {allowed: false, reason: "Spent Lores must be refunded prior to decreasing Mind"};
      }
    }

    return {allowed: true, reason: ""};
  },

  increaseStat(statName) {
    const status = this.canIncrease(statName);

    if (!status.allowed) {
      console.log("Unable to increase. ", status.reason);
      return false;
    }

    const cost = this.getStatCost(statName);
    if (!Layers.spendPoints("stats", statName, cost)) return false;

    this.currentStats[statName] = (this.currentStats[statName] || 0) + 1;
    this.currentLayerStats[statName] = (this.currentLayerStats[statName] || 0) + 1;

    // Derived ability update (Spirit → Gather Essence)
    if (statName === "spirit") {
      const derived = Math.floor(this.getTotal("spirit") / 3);
      Abilities.setDerivedAbility("gather_essence", derived);
    }

    UI.updateStatsUI();
    UI.updateDerivedAbilities();
    UI.updateLayerPreview();
    return true;
  },

  decreaseStat(statName) {
    const status = this.canDecrease(statName);
    if (!status.allowed) {
      console.log("Unable to decrease. ", status.reason);
      return false;
    }

    const cost = this.getStatCost(statName, -1);
    if (!Layers.refundPoints("stats", statName, cost)) {
      console.warn("Unable to refund points for stat '", statName, "'");
      return false;
    }

    this.currentStats[statName]--;
    this.currentLayerStats[statName]--;

    if (statName === "spirit") {
      const derived = Math.floor(this.getTotal("spirit") / 3);
      Abilities.setDerivedAbility("gather_essence", derived);
    }

    UI.updateStatsUI();
    UI.updateDerivedAbilities();
    UI.updateLayerPreview();
    return true;
  },

};
