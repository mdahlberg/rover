// bpLeveling.js - Manages earned BP and level advancement based on total points

window.BPLeveling = {
  earnedBP: 0,

  // Reference table for level thresholds
  thresholds: [
    { level: 1, points: 50 },
    { level: 2, points: 60 },
    { level: 3, points: 75 },
    { level: 4, points: 90 },
    { level: 5, points: 105 },
    { level: 6, points: 120 },
    { level: 7, points: 140 },
    { level: 8, points: 160 },
    { level: 9, points: 180 },
    { level: 10, points: 200 },
    { level: 11, points: 220 },
    { level: 12, points: 240 },
    { level: 13, points: 260 },
    { level: 14, points: 280 },
    { level: 15, points: 300 },
    { level: 16, points: 320 },
    { level: 17, points: 340 },
    { level: 18, points: 360 },
    { level: 19, points: 380 },
    { level: 20, points: 400 },
  ],

  getLevelFromBP(totalBP) {
    let level = 1;
    for (const threshold of this.thresholds) {
      if (totalBP >= threshold.points) {
        level = threshold.level;
      } else {
        break;
      }
    }
    return level;
  },

  addEarnedBP: function(bp) {
    this.earnedBP += parseInt(bp) || 0;
    UI.updateGlobalBuildPoints();

    this.checkForLevelUp();
  },

  getNextLevelThreshold() {
    const currentLevel = Layers.getCurrentLevel();
    const next = this.thresholds.find(t => t.level === currentLevel + 1);
    return next ? next.points : null;
  },

  checkForLevelUp() {
    const nextThreshold = this.getNextLevelThreshold();
    if (nextThreshold !== null && Layers.totalPoints >= nextThreshold) {
      if (confirm(`You've reached the threshold for the next level. Proceed to level ${Layers.getCurrentLevel() + 1}?`)) {
        levelUp();
      }
    }
  },
};
