// lores.js - Manages lore data, selection, and state management.

window.Lores = {
  // Lores are now in an array format for easier tree traversal and UI rendering.
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
    { id: "mutologist", name: "Mutologist", description: "Unnaturally mutated creatures.", category: "Knowledge", parent: "biology" },
  ],

  selectedLores: {},

  getChildLores: function(parentId) {
    return this.availableLores.filter(lore => lore.parent === parentId);
  },

  getEarnedLores: function () {
    return Math.floor(Stats.getTotal("mind") / 3);
  },

  getSelectedLores: function () {
    return this.selectedLores;
  },

  getUnspentLores: function () {
    const totalSpent = Object.values(this.selectedLores).reduce((sum, val) => sum + val, 0);
    return this.getEarnedLores() - totalSpent;
  },

  canIncreaseLore: function (loreId) {
    if (this.getUnspentLores() <= 0) return false;
    if (!this.selectedLores[loreId]) return true;
    return this.selectedLores[loreId] < 5;
  },

  canDecreaseLore: function (loreId) {
    return this.selectedLores[loreId] > 0;
  },

  isSelected: function (loreId) {
    return !!this.selectedLores[loreId];
  },

  getLoreLevel: function (loreId) {
    return this.selectedLores[loreId] || 0;
  },

  purchaseLore: function (loreId) {
    if (!this.canIncreaseLore(loreId)) return false;
    if (!this.selectedLores[loreId]) this.selectedLores[loreId] = 0;
    this.selectedLores[loreId]++;
    UI.updateLoreUI();
    return true;
  },

  removeLore: function (loreId) {
    if (!this.canDecreaseLore(loreId)) return false;
    this.selectedLores[loreId]--;
    if (this.selectedLores[loreId] <= 0) delete this.selectedLores[loreId];
    UI.updateLoreUI();
    return true;
  },

  getLoresByCategory: function (category) {
    return this.availableLores.filter(l => l.category === category && !l.parent);
  },

  getChildrenOf: function (parentId) {
    return this.availableLores.filter(l => l.parent === parentId);
  }
};
