/* 
  layers.js - Manages level progression and locking in stat purchases.
  Now using three core stats: body, mind, and spirit.
  When leveling up, the current level's stat purchases are added to lockedStats and reset.
*/

window.Layers = {
  currentLevel: 1,
  buildPoints: 50,
  layersData: [],

  /**
   * Updates the current level's layer record to match the latest Stats.currentStats.
   * This stores the stat purchases made during the current level.
   */
  updateCurrentLayer: function () {
    if (!this.layersData[this.currentLevel - 1]) {
      this.layersData[this.currentLevel - 1] = { 
        stats: { ...Stats.currentStats }, 
        abilities: [] 
      };
    } else {
      this.layersData[this.currentLevel - 1].stats = { ...Stats.currentStats };
    }
  },

  /**
   * Computes the remaining build points for the current level.
   * It subtracts the points spent on current stat purchases and abilities from the total build points.
   * @returns {number} Remaining build points.
   */
  getRemainingPoints: function () {
    const spentOnStats = Stats.pointsSpentOnCurrent();
    const spentOnAbilities = Abilities.pointsSpentOnAbilities();
    return this.buildPoints - spentOnStats - spentOnAbilities;
  },

  /**
   * Locks in current level stat purchases and abilities, then levels up.
   * Current level stat purchases (from Stats.currentStats) are added to Stats.lockedStats
   * and then reset. The level is incremented and additional build points are added.
   */
  levelUp: function () {
    // Ensure the current layer record is up-to-date.
    this.updateCurrentLayer();

    // Create a snapshot for the current level.
    const newLayer = {
      stats: { ...Stats.currentStats },
      abilities: Abilities.purchased
        .filter(ab => ab.level === this.currentLevel)
        .map(ab => ab.name)
    };
    this.layersData[this.currentLevel - 1] = newLayer;

    // Lock in the current level's stat purchases.
    for (let stat in Stats.currentStats) {
      Stats.lockedStats[stat] += Stats.currentStats[stat];
      Stats.currentStats[stat] = 0;
    }

    // Increment the level and add additional build points.
    this.currentLevel++;
    this.buildPoints += 50;

    // Update the UI.
    UI.updateLevelDisplay(this.currentLevel);
    UI.addHistoryEntry(this.currentLevel, newLayer);
    UI.updateRemainingPoints(this.getRemainingPoints());
  }
};
