/* 
  stats.js - Manages core stat logic with level-based locking.
  Now, only the three core stats exist:
    - Body, Mind, and Spirit.
  
  Derived stats:
    - Body: Derived Strength = floor(body / 4), Derived Health = body + 5, Derived Armor = body + 10
    - Mind: Derived Lore = floor(mind / 3)
    - Spirit: Derived Gather Essence Uses = floor(spirit / 3)
*/

window.Stats = {
  // Locked stat values (from previous levels)
  lockedStats: {
    body: 0,
    mind: 0,
    spirit: 0
  },
  // Stat points purchased in the current level
  currentStats: {
    body: 0,
    mind: 0,
    spirit: 0
  },

  /**
   * Returns the total value for a given stat (locked + current).
   * @param {string} statName
   * @returns {number}
   */
  getTotal: function(statName) {
    return this.lockedStats[statName] + this.currentStats[statName];
  },

  /**
   * Calculates the cost for increasing a stat to a new total value.
   * @param {number} level - Current character level.
   * @param {number} newValue - New total value (locked + current + 1).
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
   * Checks if a stat can be increased.
   * @param {string} statName
   * @returns {boolean}
   */
  canIncrease: function(statName) {
    return true;
  },

  /**
   * Checks if a stat can be decreased.
   * Only current level points can be modified.
   * @param {string} statName
   * @returns {boolean}
   */
  canDecrease: function(statName) {

    if (statName === "mind") {
        const currentMind = Stats.getTotal('mind');
        const newMind = currentMind - 1;
	if (newMind < 0) {
	    return false;
	}
        const newEarned = Math.floor(newMind / 3);
        const spentLores = Object.values(Lores.getSelectedLores()).reduce((sum, lvl) => sum + lvl, 0);
        if (newEarned < spentLores) {
          alert("You cannot decrease your Mind stat further because you have already spent lore points. Please unassign a lore first.");
          return false;
        }
    }

    return this.currentStats[statName] > 0;
  },

  /**
   * Increases the current stat purchase for a given stat by 1.
   * Returns the cost spent.
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
   * Returns the refund amount.
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
   * Calculates the total points spent on current level stat purchases.
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

// Initialize currentStats for each stat.
for (let stat in Stats.lockedStats) {
  Stats.currentStats[stat] = 0;
}
