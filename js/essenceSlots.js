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
    return `Level ${levelNum + 1}`;
  },

  canPurchase: function (level) {
    const cost = this.getCost(level);
    if (cost === null) return false;

    const levelIndex = this.levels.indexOf(level);
    if (levelIndex === -1) return false;
    if (levelIndex === 0) return true; // Slot 1 has no requirement

    const previous = this.levels[levelIndex - 1];
    return this.getTotalSlotsForLevel(previous) >= this.getTotalSlotsForLevel(level);
  },

  purchaseSlot: function (level) {
    const cost = this.getCost(level);
    if (!this.canPurchase(level)) return false;
    if (!Layers.spendPoints("essenceSlots", level, cost)) return false;
    UI.updateEssenceSlotUI();
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
    Layers.refundPoints("essenceSlots", level, cost);
    UI.updateEssenceSlotUI();
  },
};
