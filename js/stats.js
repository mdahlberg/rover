/* 
  stats.js - Manages core stat logic with level-based locking.
  Stats are split into two parts:
    - lockedStats: Stat points purchased in previous levels (immutable).
    - currentStats: Stat points purchased in the current level (modifiable).
  The displayed total for a stat = lockedStats + currentStats.
*/

window.Stats = {
  // Stat points locked from previous levels.
  lockedStats: {
    strength: 0,
    health: 0,
    armor: 0,
    lores: 0,
    tracking: 0,
    gather: 0
  },
  // Stat points purchased in the current level.
  currentStats: {
    strength: 0,
    health: 0,
    armor: 0,
    lores: 0,
    tracking: 0,
    gather: 0
  },

  /**
   * Returns the total stat value for a given stat.
   * @param {string} statName - The name of the stat.
   * @returns {number} Total value = locked + current.
   */
  getTotal: function(statName) {
    return this.lockedStats[statName] + this.currentStats[statName];
  },

  /**
   * Calculates the cost for increasing a stat to a new total value,
   * based on the current character level.
   * @param {number} level - The current level.
   * @param {number} newValue - The new total value (locked + current + 1).
   * @returns {number} Build point cost.
   */
  getIncrementCost: function(level, newValue) {
    if (level <= 2) {
      if (newValue <= 5) return 2;
      if (newValue <= 20) return 3;
      return 5;
    } else if (level <= 6) {
      if (newValue <= 5) return 3;
      if (newValue <= 20) return 5;
      return 6;
    } else if (level <= 12) {
      if (newValue <= 5) return 5;
      if (newValue <= 20) return 6;
      return 8;
    } else if (level <= 18) {
      if (newValue <= 5) return 6;
      if (newValue <= 20) return 8;
      return 10;
    } else {
      if (newValue <= 5) return 8;
      if (newValue <= 20) return 10;
      return 12;
    }
  },

  /**
   * Checks if a stat can be increased. (Additional limits can be added here.)
   * @param {string} statName
   * @returns {boolean}
   */
  canIncrease: function(statName) {
    return true;
  },

  /**
   * Checks if a stat can be decreased.
   * Only points purchased in the current level can be removed.
   * @param {string} statName
   * @returns {boolean}
   */
  canDecrease: function(statName) {
    return this.currentStats[statName] > 0;
  },

  /**
   * Increases the current stat purchase for a given stat by 1.
   * Returns the build point cost of the increase.
   * @param {string} statName
   * @param {number} currentLevel
   * @returns {number} Cost spent.
   */
  increaseStat: function(statName, currentLevel) {
    if (!this.canIncrease(statName)) return 0;
    const nextTotal = this.getTotal(statName) + 1;
    const cost = this.getIncrementCost(currentLevel, nextTotal);
    this.currentStats[statName] += 1;
    return cost;
  },

  /**
   * Decreases the current stat purchase for a given stat by 1.
   * Returns the build points refunded.
   * @param {string} statName
   * @param {number} currentLevel
   * @returns {number} Refund amount.
   */
  decreaseStat: function(statName, currentLevel) {
    if (!this.canDecrease(statName)) return 0;
    const currentTotal = this.getTotal(statName);
    const refund = this.getIncrementCost(currentLevel, currentTotal);
    this.currentStats[statName] -= 1;
    return refund;
  },

  /**
   * Calculates total points spent on current level stat purchases.
   * @returns {number} Total points spent.
   */
  pointsSpentOnCurrent: function() {
    let total = 0;
    const level = Layers.currentLevel;
    for (let stat in this.currentStats) {
      let locked = this.lockedStats[stat];
      let purchased = this.currentStats[stat];
      for (let i = 1; i <= purchased; i++) {
        total += this.getIncrementCost(level, locked + i);
      }
    }
    return total;
  }
};

// Initialize current stats to 0 for each stat.
for (let stat in Stats.lockedStats) {
  Stats.currentStats[stat] = 0;
}
