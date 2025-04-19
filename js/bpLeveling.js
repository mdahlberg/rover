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

  getMaxSafeEarnedBP: function() {
    const totalEarned = BPLeveling.earnedBP;
    const nextNextThreshold = BPLeveling.getNextLevelThreshold(1); // 2 levels ahead

    if (!nextNextThreshold) return 0;
        
    return Math.max(0, nextNextThreshold - totalEarned -1);
  },

  addEarnedBP: function(bp) {
    // Calculate and check level up before applying
    newTotalBP = this.earnedBP + parseInt(bp, 10) || 0;

    // Check if this amount will cause the user to level up
    if (!this.checkForLevelUp(newTotalBP)) {
      return false;
    }

    this.earnedBP = newTotalBP;
    UI.refreshAll();

    return true;
  },

  getNextLevelThreshold(modifier=0) {
    const currentLevel = Layers.getCurrentLevel() + modifier;
    const next = this.thresholds.find(t => t.level === currentLevel + 1);
    return next ? next.points : null;
  },

  getBPToLevel() {
    threshold = this.getNextLevelThreshold();
    return threshold - this.earnedBP;
  },

  checkForLevelUp(bp) {
    const nextThreshold = this.getNextLevelThreshold();

    if (nextThreshold === null) {
      alert("You have reached the max level, no more build points may be earned");
      return false;
    }

    if (bp >= nextThreshold) {
      if (confirm(`You've reached the threshold for the next level. Proceed to level ${Layers.getCurrentLevel() + 1}?`)) {
        levelUp();
      } else {
        return false;
      }
    }

    return true
  },

  restoreFromSnapshot(snapshot) {
    if (!snapshot || typeof snapshot.earned !== 'number') {
      console.warn("Invalid BP snapshot provided.");
      return;
    }

    this.earnedBP = snapshot.earned;

    // Trigger UI sync
    UI.updateGlobalBuildPoints?.();
  }
};
