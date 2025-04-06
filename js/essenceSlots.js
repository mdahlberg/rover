// essenceSlots.js - Manages Essence Slot logic and interactions

window.EssenceSlots = {
  levels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "master"],

  costTable: {
    "1":    [3, 2, 1, 1, 1, 1],
    "2":    [4, 2, 2, 1, 1, 1],
    "3":    [5, 4, 3, 2, 1, 1],
    "4":    [6, 5, 4, 2, 2, 1],
    "5":    [8, 6, 4, 3, 2, 1],
    "6":    [null, 8, 6, 4, 4, 2],
    "7":    [null, 10, 9, 7, 6, 3],
    "8":    [null, null, 10, 9, 8, 4],
    "9":    [null, null, null, 12, 10, 5],
    "master": [null, null, null, 6, 4, 2]
  },

  getMindBracket: function () {
    const mind = Stats.getTotal("mind");
    if (mind >= 30) return 5;
    if (mind >= 21) return 4;
    if (mind >= 15) return 3;
    if (mind >= 10) return 2;
    if (mind >= 5) return 1;
    return 0;
  },

  getCost: function (level) {
    const bracket = this.getMindBracket();
    return this.costTable[level][bracket] ?? null;
  },

  getSlotCount: function (level) {
    return Layers.getCurrentLayerCount("essenceSlots", level);
  },

  getTotalSlotsForLevel: function (level) {
    return Layers.getTotalCount("essenceSlots", level);
  },

  getDisplayLabel: function (levelId) {
    if (levelId === "master") return "Master Slot";
    const levelNum = parseInt(levelId.replace("slot_", ""));
    return `Level ${levelNum}`;
  },

  canPurchase: function (level) {
    const cost = this.getCost(level);
    if (cost === null || Layers.getRemainingPoints() < cost) {
      return false;
    }

    if (level === "1") return true; // Slot 1 is always allowed

    const prevLevelCount = this.getTotalSlotsForLevel(level - 1);
    const thisLevelCount = this.getTotalSlotsForLevel(level);

    return prevLevelCount > thisLevelCount;
  },

  isRefundable: function (level) {
    const levelIndex = this.levels.indexOf(level);
    if (levelIndex === -1) return false;
  
    // You must have at least one slot to refund
    if (this.getSlotCount(level) <= 0) return false;
  
    // You can't refund if doing so would break pyramid structure
    for (let i = levelIndex + 1; i < this.levels.length; i++) {
      const higher = this.levels[i];
      const higherCount = this.getTotalSlotsForLevel(higher);
      const thisCount = this.getTotalSlotsForLevel(level);
      if (higherCount > thisCount - 1) return false;
    }
  
    return true;
  },

  purchaseSlot: function (level) {
    levelKey = String(level)
    const cost = this.getCost(levelKey);
    if (!this.canPurchase(levelKey)) return false;
  
    if (!Layers.spendPoints("essenceSlots", levelKey, cost)) return false;
  
    // ✅ Increment the number of slots purchased for this level
    if (!Layers.currentLayer.essenceSlots) {
      Layers.currentLayer.essenceSlots = {};
      if (!Layers.currentLayer.essenceSlots[levelKey]) {
        Layers.currentLayer.essenceSlots[levelKey] = 0
      }
    }
  
    Layers.currentLayer.essenceSlots[levelKey] = (Layers.currentLayer.essenceSlots[levelKey] || 0) + 1;
  
    UI.updateEssenceSlotUI();
    UI.updateBuildPoints();
    UI.updateLayerPreview();
    return true;
  },

  refundSlot: function (level) {
    const levelIndex = this.levels.indexOf(level);
    if (levelIndex === -1) {
      return;
    }

    const current = this.getSlotCount(level);
    if (current <= 0) return;

    const next = this.levels[levelIndex + 1];
    if (next && this.getTotalSlotsForLevel(next) > this.getTotalSlotsForLevel(level)) {
      alert("You must remove higher-level essence slots first.");
      return;
    }

    const cost = this.getCost(level);

    // Refund BP
    Layers.refundPoints("essenceSlots", level, cost);

    // Decrement the local display/purchase tracker
    if (Layers.currentLayer.essenceSlots?.[level]) {
      Layers.currentLayer.essenceSlots[level]--;
      if (Layers.currentLayer.essenceSlots[level] <= 0) {
        delete Layers.currentLayer.essenceSlots[level];
      }
    }

    // Re-render
    UI.updateEssenceSlotUI();
    UI.updateBuildPoints();
    UI.updateLayerPreview();
  },
};
