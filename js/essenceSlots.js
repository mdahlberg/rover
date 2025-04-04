// essenceSlots.js - Manages purchasing and tracking of Essence Slots by level

window.EssenceSlots = {
  // Slot levels from 1 to 9 and 'master'
  levels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', 'master'],

  // Cost table by Mind tier: index = slot level, column = tier 0–5
  costTable: [
    [3, 2, 1, 1, 1, 1],        // Slot 1
    [4, 2, 2, 1, 1, 1],        // Slot 2
    [5, 4, 3, 2, 1, 1],        // Slot 3
    [6, 5, 4, 2, 2, 1],        // Slot 4
    [8, 6, 4, 3, 2, 1],        // Slot 5
    [null, 8, 6, 4, 4, 2],     // Slot 6
    [null, 10, 9, 7, 6, 3],    // Slot 7
    [null, null, 10, 9, 8, 4], // Slot 8
    [null, null, null, 12, 10, 5], // Slot 9
    [null, null, null, 6, 4, 2]    // Master
  ],

  getBlankEssenceSlot: function () {
    const initEssenceSlots = {}
    EssenceSlots.levels.forEach(lvl => initEssenceSlots[lvl] = 0);
    return initEssenceSlots;
  },

  getCurrentSlots() {
    return Layers.currentLayer.essenceSlots || {};
  },

  getTotalSlotsForLevel(level) {
    let total = 0;
    // Iterate through all layers (level ups)
    // 
    Layers.layers.forEach((layer) => {
      num_slots = (layer.essenceSlots?.[level] || 0);
      total += (layer.essenceSlots?.[level] || 0);
    });
    total += (Layers.currentLayer.essenceSlots?.[level] || 0);
    return total;
  },

  getMindTier() {
    const mind = Stats.getTotal('mind');
    if (mind >= 30) return 5;
    if (mind >= 21 && mind <= 29) return 4;
    if (mind >= 15 && mind <=20) return 3;
    if (mind >= 10 && mind <=14) return 2;
    if (mind >= 5 && mind <= 9) return 1;
    if (mind > 0 && mind <= 4) return 0;
    return -1;
  },

  getCost(level) {
    const tier = this.getMindTier();
    const index = this.levels.indexOf(level);
    return this.costTable[index]?.[tier] ?? null;
  },

  canPurchase(level) {
    const index = this.levels.indexOf(level);
    if (index === -1) return false;
    const cost = this.getCost(level);
    if (cost === null) return false;

    if (index > 0) {
      const prev = this.levels[index - 1];
      if (this.getTotalSlotsForLevel(level) >= this.getTotalSlotsForLevel(prev)) {
        return false;
      }
    }

    return Layers.getRemainingPoints() >= cost;
  },

  purchaseSlot(level) {
    const cost = this.getCost(level);
    if (cost === null) {
      console.warn("This slot level cannot be purchased.");
      return false;
    }
  
    if (!this.canPurchase(level)) {
      console.warn("Slot purchase not allowed due to dependency or points.");
      return false;
    }
  
    // Spend build points
    const spent = Layers.spendPoints("essenceSlots", level, cost);
    if (!spent) {
      console.warn("Unable to spend build points.");
      return false;
    }
  
    // Track the actual quantity of slots purchased at this level
    if (!Layers.currentLayer.essenceSlots[level]) {
      Layers.currentLayer.essenceSlots[level] = 0;
    }
    Layers.currentLayer.essenceSlots[level] += 1;
  
    // Update UI
    UI.updateEssenceSlotUI();
    UI.updateBuildPoints();
  
    return true;
  },

  /**
   * Check whether refunding a slot would leave an illegal slot progression.
   * @param {string} level - The level being refunded (e.g. "1", "2", ..., "master")
   * @returns {boolean} True if refund is allowed, false if it breaks slot progression
   */
  canRefundSlot(level) {
    const levels = this.levels;
    const index = levels.indexOf(level);
    if (index === -1) return false;
  
    const currentCount = Layers.currentLayer.essenceSlots[level] || 0;
    const countAfterRefund = currentCount - 1;
  
    // Check all higher levels
    for (let i = index + 1; i < levels.length; i++) {
      const higher = levels[i];
      const higherCount = Layers.currentLayer.essenceSlots[higher] || 0;
  
      // After refund, we must still have at least as many of this level
      // as any higher level
      if (higherCount > countAfterRefund) {
        return false;
      }
    }
  
    return true;
  },

  refundSlot(level) {
    if (!Layers.currentLayer.essenceSlots[level] || Layers.currentLayer.essenceSlots[level] <= 0) {
      console.warn("No essence slot to refund at level:", level);
      return false;
    }

    if (!this.canRefundSlot(level)) {
      alert("Cannot refund this slot because it would make your higher-level slots invalid.");
      return false;
    }
  
    const cost = this.getCost(level);
    if (cost === null) {
      console.warn("This slot level cannot be refunded.");
      return false;
    }
  
    // Reduce the count
    Layers.currentLayer.essenceSlots[level]--;
  
    // Refund the build points
    Layers.currentLayer.pointsSpent -= cost;
  
    // Clean up empty slot entry
    if (Layers.currentLayer.essenceSlots[level] === 0) {
      delete Layers.currentLayer.essenceSlots[level];
    }
  
    // Update UI
    UI.updateEssenceSlotUI();
    UI.updateBuildPoints();
    return true;
  },

  getDisplayLabel(level) {
    return level === 'master' ? 'Master Slot' : `Slot ${parseInt(level, 10) + 1}`;
  }
};
