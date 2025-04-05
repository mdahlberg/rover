window.Stats = {
  currentStats: {
    body: 0,
    mind: 0,
    spirit: 0,
  },

  lockedStats: {
    body: 0,
    mind: 0,
    spirit: 0,
  },

  /**
   * Returns total value of a core stat (locked + current).
   */
  getTotal(statName) {
    return (this.lockedStats[statName] || 0) + (this.currentStats[statName] || 0);
  },

  /**
   * Locks a stat bonus (from race selection).
   */
  lockStat(statName, value) {
    this.lockedStats[statName] = (this.lockedStats[statName] || 0) + value;
  },

  resetStats() {
    this.currentStats = { body: 0, mind: 0, spirit: 0 };
    this.lockedStats = { body: 0, mind: 0, spirit: 0 };
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

  increaseStat(statName) {
    console.log("debug: Increasing Stat: ", statName);
    const cost = this.getStatCost(statName);
    console.log("debug: It will cost: ", cost, " BP");
    if (!Layers.spendPoints("stats", statName, cost)) return false;

    this.currentStats[statName] = (this.currentStats[statName] || 0) + 1;

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
    if (!this.canDecrease(statName)) {
      console.log("Unable to decrease stat '", statName, "'");
      return false;
    }

    const cost = this.getStatCost(statName, -1);
    if (!Layers.refundPoints("stats", statName, cost)) {
      console.warn("Unable to refund points for stat '", statName, "'");
      return false;
    }

    console.log("Stat '", statName, "' current value = '", this.currentStats[statName], "'");
    this.currentStats[statName]--;
    console.log("After refund Stat '", statName, "' current value = '", this.currentStats[statName], "'");

    if (statName === "spirit") {
      const derived = Math.floor(this.getTotal("spirit") / 3);
      Abilities.setDerivedAbility("gather_essence", derived);
    }

    UI.updateStatsUI();
    UI.updateDerivedAbilities();
    UI.updateLayerPreview();
    return true;
  },

  canDecrease(statName) {
    const current = this.getTotal(statName);

    if (current <= 0 || this.currentStats[statName] <= 0) {
      alert("Cannot decrease this stat below zero.");
      return false;
    }

    if (statName === "mind") {
      const nextMind = current - 1;
      const maxLores = Math.floor(nextMind / 3);
      const spent = Object.values(Lores.getSelectedLores()).reduce((sum, v) => sum + v, 0);
      if (spent > maxLores) {
        alert("Unassign lores before decreasing Mind.");
        return false;
      }
    }

    if (statName === "spirit") {
      const nextSpirit = current - 1;
      const newUses = Math.floor(nextSpirit / 3);
      const activeUses = Abilities.getDerivedUses("gather_essence");
      if (newUses < activeUses) {
        alert("Decrease would remove Gather Essence uses already granted.");
        return false;
      }
    }

    return true;
  },
};
