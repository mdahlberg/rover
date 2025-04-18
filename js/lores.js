// lores.js - Manages lore data, selection, and state management.

window.Lores = {
  availableLores: [
    { id: "tracking", name: "Tracking", description: "Track creatures or humanoids.", category: "General" },
    { id: "appraisal", name: "Appraisal", description: "Evaluate materials and essence.", category: "General" },
    { id: "worldbreaker_historian", name: "Worldbreaker Historian", description: "Use or identify Worldbreaker tech.", category: "General" },
    { id: "new_world_historian", name: "New World Historian", description: "History and politics post-Unraveling.", category: "General" },
    { id: "smooth_talker", name: "Smooth Talker", description: "Persuade, bargain, and charm.", category: "General" },
    { id: "survivalist", name: "Survivalist", description: "Survive and provide in wilderness.", category: "General" },
    { id: "cartographer", name: "Cartographer", description: "Read and create maps accurately.", category: "General" },
    { id: "arcanist", name: "Arcanist Knowledge", description: "Essence behavior and properties.", category: "Knowledge" },
    { id: "theology", name: "Theology Knowledge", description: "Religious factions and beliefs.", category: "Knowledge" },
    { id: "underworld", name: "Underworld Knowledge", description: "Criminal networks and codes.", category: "Knowledge" },
    { id: "military", name: "Military Knowledge", description: "Strategy and army behavior.", category: "Knowledge" },
    { id: "biology", name: "Biology", description: "Biology Lore Category", category: "Knowledge", isParent: true },
    { id: "necrologist", name: "Necrologist", description: "Undead monsters.", category: "Knowledge", parent: "biology" },
    { id: "macrologist", name: "Macrologist", description: "Earthshakers.", category: "Knowledge", parent: "biology" },
    { id: "pelagist", name: "Pelagist", description: "Ocean monsters.", category: "Knowledge", parent: "biology" },
    { id: "toxicologist", name: "Toxicologist", description: "Poisons and poisonous creatures.", category: "Knowledge", parent: "biology" },
    { id: "umbralogist", name: "Umbralogist", description: "Tainted living creatures.", category: "Knowledge", parent: "biology" },
    { id: "aetherologist", name: "Aetherologist", description: "Elemental creatures.", category: "Knowledge", parent: "biology" },
    { id: "naturologist", name: "Naturologist", description: "Unmutated natural creatures.", category: "Knowledge", parent: "biology" },
    { id: "mutologist", name: "Mutologist", description: "Unnaturally mutated creatures.", category: "Knowledge", parent: "biology" }
  ],

  currentLayerPurchasedLores: {},
  purchasedLores: {},

  isRacial: function (loreId) {
    const stored = JSON.parse(localStorage.getItem(Constants.RACIAL_LORES) || "[]");
    return stored.includes(loreId);
  },

  getChildLores: function (parentId) {
    return this.availableLores.filter(lore => lore.parent === parentId);
  },

  getEarnedLores: function () {
    return Math.floor(Stats.getTotal("mind") / 3);
  },

  getUnspentLores: function () {
    const racialIds = window.RacialLocks?.lores || new Set();

    let totalSpent = 0;

    for (const [id, val] of Object.entries(this.purchasedLores)) {
      const racialOffset = racialIds.has(id) ? 1 : 0;
      totalSpent += Math.max(0, val - racialOffset);
    }

    return this.getEarnedLores() - totalSpent;
  },

  canIncreaseLore: function (loreId) {
    if (this.getUnspentLores() <= 0) return false;
    return (this.getLoreLevel(loreId) < 5);
  },

  canDecreaseLore: function (loreId) {
    const current = this.currentLayerPurchasedLores[loreId] || 0;
    const racial = window.RacialLocks?.lores?.has(loreId) ? 1 : 0;

    return current >= racial;
  },

  isSelected: function (loreId) {
    return this.getLoreLevel(loreId) > 0;
  },

  getLoreLevel: function (loreId) {
    return (this.purchasedLores[loreId] || 0) + (this.currentLayerPurchasedLores[loreId] || 0);
  },

  purchaseLore: function (loreId) {
    if (!this.canIncreaseLore(loreId)) return false;

    this.currentLayerPurchasedLores[loreId] = (this.currentLayerPurchasedLores[loreId] || 0) + 1;
    this.purchasedLores[loreId] = (this.purchasedLores[loreId] || 0) + 1;

    UI.updateLoreUI();
    return true;
  },

  removeLore: function (loreId) {
    console.log("Attempting to remove one from lore Id: ", loreId);
    if (!this.canDecreaseLore(loreId)) return false;

    this.currentLayerPurchasedLores[loreId]--;
    if (this.currentLayerPurchasedLores[loreId] <= 0) delete this.currentLayerPurchasedLores[loreId];

    if (this.purchasedLores[loreId]) {
      this.purchasedLores[loreId]--;
      if (this.purchasedLores[loreId] <= 0) delete this.purchasedLores[loreId];
    }

    UI.updateLoreUI();
    return true;
  },

  recalcFromLayers: function() {
    console.log("Restoring lores from all locked layers");

    this.purchasedLores = {};
    this.currentLayerPurchasedLores = {};

    // Global from past layers
    for (const layer of Layers.layers) {
      if (!layer?.lores) continue;
      for (const id in layer.lores) {
        this.purchasedLores[id] = (this.purchasedLores[id] || 0) + layer.lores[id];
      }
    }

    // Restore current
    const restored = Layers.currentLayer.lores || {};
    for (const id in restored) {
      this.purchasedLores[id] = (this.purchasedLores[id] || 0) + restored[id];
      this.currentLayerPurchasedLores[id] = restored[id];
    }

    // ✅ Re-apply racial lores
    const racial = JSON.parse(localStorage.getItem("racialLores") || "[]");
    for (const id of racial) {
      this.purchasedLores[id] = (this.purchasedLores[id] || 0) + 1;
    }
  },

  resetCurrentLayer: function() {
    this.currentLayerPurchasedLores = {};
  },

  initializeRacialLores: function () {
    const racial = JSON.parse(localStorage.getItem(Constants.RACIAL_LORES) || "[]");
  
    racial.forEach(id => {
      if (!this.purchasedLores[id]) this.purchasedLores[id] = 0;
      this.purchasedLores[id] += 1;
    });
  },

};
