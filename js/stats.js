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
   * Get the total value of a stat including locked and current.
   * @param {string} statName
   * @returns {number} Total value.
   */
  getTotal: function (statName) {
    return (this.lockedStats[statName] || 0) + (this.currentStats[statName] || 0);
  },

  /**
   * Modify a core stat. Applies to currentStats only.
   * @param {string} statName
   * @param {number} value
   */
  modifyStat: function (statName, value) {
    if (this.currentStats[statName] !== undefined) {
      this.currentStats[statName] += value;
    }
  },

  /**
   * Lock a core stat bonus (typically from race selection).
   * @param {string} statName
   * @param {number} value
   */
  lockStat: function (statName, value) {
    if (this.lockedStats[statName] !== undefined) {
      this.lockedStats[statName] += value;
    }
  },

  /**
   * Reset all stats, used when starting over.
   */
  resetStats: function () {
    this.currentStats = {
      body: 0,
      mind: 0,
      spirit: 0,
    };
    this.lockedStats = {
      body: 0,
      mind: 0,
      spirit: 0,
    };
  },

  /**
   * Increases a core stat if build points are available.
   * @param {string} statName - The name of the stat to increase.
   */
  increaseStat: function (statName) {
    const cost = this.getStatCost(statName);
    // Check if enough points are available
    if (Layers.getRemainingPoints() < cost) {
      alert("Not enough build points to increase this stat.");
      return;
    }

    Layers.spendPoints("stats", statName, cost);
    this.currentStats[statName]++;
  
    // Update UI after increasing stat
    console.log(`${statName} increased! New value: ${this.currentStats[statName]}`);
    UI.refreshAll();

  },

  /**
   * Decreases a core stat and refunds build points.
   * @param {string} statName - The name of the stat to decrease.
   */
  decreaseStat: function (statName) {
    // Check if stat can be decreased
    if (this.currentStats[statName] <= 0) {
      console.warn(`${statName} cannot be decreased below 0.`);
      return;
    }
  
    // Get the cost to decrease the stat
    const cost = this.getStatCost(statName);
  
    Layers.refundPoints("stats", statName, cost);
    this.currentStats[statName]--;
  
    // Update UI after decreasing stat
    console.log(`${statName} decreased! New value: ${this.currentStats[statName]}`);
    UI.refreshAll();
  },

  /**
   * Returns the cost to increase a stat based on the current level.
   * @param {string} statName - The stat name (body, mind, spirit).
   * @returns {number} Build points required to increase the stat.
   */
  getStatCost: function (statName) {
    const currentStat = this.getTotal(statName);
    const currentLevel = Layers.getCurrentLevel(); // Check this line
  
    if (currentLevel <= 2) {
      if (currentStat < 6) return 2;
      if (currentStat <= 20) return 3;
      return 5;
    } else if (currentLevel <= 6) {
      if (currentStat < 6) return 3;
      if (currentStat <= 20) return 5;
      return 6;
    } else if (currentLevel <= 12) {
      if (currentStat < 6) return 5;
      if (currentStat <= 20) return 6;
      return 8;
    } else if (currentLevel <= 18) {
      if (currentStat < 6) return 6;
      if (currentStat <= 20) return 8;
      return 10;
    } else {
      if (currentStat < 6) return 8;
      if (currentStat <= 20) return 10;
      return 12;
    }
  },

};

