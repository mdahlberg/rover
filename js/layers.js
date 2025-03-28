/* 
  layers.js - Manages level progression and locking in stat purchases.
  When leveling up, the current level's stat purchases are added to lockedStats and reset.
*/

window.Layers = {
  currentLevel: 1,
  buildPoints: 50,
  layersData: [],

  /**
   * Updates the current level's layer record to match the latest Stats.currentStats.
   */
  updateCurrentLayer: function () {
    if (!this.layersData[this.currentLevel - 1]) {
      this.layersData[this.currentLevel - 1] = { stats: { ...Stats.currentStats }, abilities: [] };
    } else {
      this.layersData[this.currentLevel - 1].stats = { ...Stats.currentStats };
    }
  },

  /**
   * Computes remaining build points for the current level.
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
    // Ensure current layer is updated.
    this.updateCurrentLayer();
    const newLayer = {
      stats: { ...Stats.currentStats },
      abilities: Abilities.purchased
        .filter(ab => ab.level === this.currentLevel)
        .map(ab => ab.name)
    };
    this.layersData[this.currentLevel - 1] = newLayer;
    // Lock in current stat purchases.
    for (let stat in Stats.currentStats) {
      Stats.lockedStats[stat] += Stats.currentStats[stat];
      Stats.currentStats[stat] = 0;
    }
    this.currentLevel++;
    this.buildPoints += 50;
    UI.updateLevelDisplay(this.currentLevel);
    UI.addHistoryEntry(this.currentLevel, newLayer);
    UI.updateRemainingPoints(this.getRemainingPoints());
  }
};
