/* 
  layers.js - Manages level progression and locking in stat purchases.
  When you level up, the current level's stat purchases are added to lockedStats
  and then reset for the new level.
*/

window.Layers = {
  // Current character level and build points available for this level.
  currentLevel: 1,
  buildPoints: 50,

  // Array to hold history for each level (includes stat and ability snapshots).
  layersData: [],

  /**
   * Ensures there is a current layer object for the current level.
   * Updates the current layer's stat purchases to reflect the latest Stats.currentStats.
   */
  updateCurrentLayer: function () {
    // Create current layer entry if it doesn't exist.
    if (!this.layersData[this.currentLevel - 1]) {
      this.layersData[this.currentLevel - 1] = { stats: { ...Stats.currentStats }, abilities: [] };
    } else {
      // Update the stats in the current layer.
      this.layersData[this.currentLevel - 1].stats = { ...Stats.currentStats };
    }
  },

  /**
   * Computes remaining build points for the current level by subtracting points spent on:
   * - Stat purchases (from currentStats)
   * - Ability purchases (via Abilities.pointsSpentOnAbilities)
   * from the total build points.
   * @returns {number} Remaining build points.
   */
  getRemainingPoints: function () {
    const spentOnStats = Stats.pointsSpentOnCurrent();
    const spentOnAbilities = Abilities.pointsSpentOnAbilities();
    return this.buildPoints - spentOnStats - spentOnAbilities;
  },

  /**
   * Locks in current level stat purchases and abilities, then levels up.
   * The current level's stat purchases are added to lockedStats and reset.
   */
  levelUp: function () {
    // Ensure current layer is updated before locking in.
    this.updateCurrentLayer();
    
    // Create a snapshot of the current level's purchases.
    const newLayer = {
      stats: { ...Stats.currentStats },
      abilities: Abilities.purchased
        .filter(ab => ab.level === this.currentLevel)
        .map(ab => ab.name)
    };
    this.layersData[this.currentLevel - 1] = newLayer;

    // Lock in stat purchases: add currentStats to lockedStats, then reset currentStats.
    for (let stat in Stats.currentStats) {
      Stats.lockedStats[stat] += Stats.currentStats[stat];
      Stats.currentStats[stat] = 0;
    }

    // Increment level and add additional build points (e.g., 50 per level-up).
    this.currentLevel++;
    this.buildPoints += 50;

    // Update UI with new level and remaining build points.
    UI.updateLevelDisplay(this.currentLevel);
    UI.addHistoryEntry(this.currentLevel, newLayer);
    UI.updateRemainingPoints(this.getRemainingPoints());
  }
};
