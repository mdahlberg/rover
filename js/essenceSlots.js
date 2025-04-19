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

  purchasedEssences: {},
  currentLayerPurchasedEssences: {},

  initialize: function () {
    this.purchasedEssences = {};
    this.currentLayerPurchasedEssences = {};
    this.levels.forEach(level => {
      this.purchasedEssences[level] = 0;
      this.currentLayerPurchasedEssences[level] = 0;
    });
  },

  recalcFromLayers: function () {
    this.initialize();

    Layers.layers.forEach(layer => {
      const essences = layer.essenceSlots || {};
      for (const level in essences) {
        this.purchasedEssences[level] += essences[level];
      }
    });

    const current = Layers.currentLayer.essenceSlots || {};
    for (const level in current) {
      this.purchasedEssences[level] += current[level];
      this.currentLayerPurchasedEssences[level] = current[level];
    }
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
    return this.currentLayerPurchasedEssences[level] || 0;
  },

  getTotalSlotsForLevel: function (level) {
    return this.purchasedEssences[level] || 0;
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

    // Slot 1 is always allowed
    if (level === "1") return true;

    const prevLevelCount = this.getTotalSlotsForLevel(String(Number(level) - 1));
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
    const levelKey = String(level);
    const cost = this.getCost(levelKey);
    if (!this.canPurchase(levelKey)) return false;

    if (!Layers.spendPoints("essenceSlots", levelKey, cost)) return false;

    this.currentLayerPurchasedEssences[levelKey] = (this.currentLayerPurchasedEssences[levelKey] || 0) + 1;
    this.purchasedEssences[levelKey] = (this.purchasedEssences[levelKey] || 0) + 1;

    Stats.lockedStats.mind = true;

    UI.updateEssenceSlotUI();
    UI.updateGlobalBuildPoints();
    UI.updateLayerPreview();
    UI.updateStatsUI();
    return true;
  },

  refundSlot: function (level) {
    const levelIndex = this.levels.indexOf(level);
    if (levelIndex === -1) return;

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

    this.currentLayerPurchasedEssences[level] -= 1;
    this.purchasedEssences[level] -= 1;

    if (this.currentLayerPurchasedEssences[level] <= 0) {
      delete this.currentLayerPurchasedEssences[level];
    }

    hasPurchases = false;
    for (slot in this.currentLayerPurchasesEssences) {
      if (this.currentLayerPurchasedEssences[slot] !== 0) {
        hasPurchases = true;
        break;
      }
    }
    if (!hasPurchases) {
      Stats.lockedStats.mind = false;
    }

    UI.updateEssenceSlotUI();
    UI.updateGlobalBuildPoints();
    UI.updateLayerPreview();
    UI.updateStatsUI();
  },

  resetCurrentLayer: function() {
    this.levels.forEach(level => {
      this.currentLayerPurchasedEssences[level] = 0;
    });
  },
};

// Initialize on first load
EssenceSlots.initialize();
