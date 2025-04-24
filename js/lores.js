// lores.js - Manages lore data, selection, and state management.

window.Lores = {
  availableLores: [
    // ——— Top-level groups ———
    { id: "general",   name: "General",   description: "General Lore", isParent: true },
    { id: "knowledge", name: "Knowledge", description: "Focused on a particular field of study to grant information based on that topic that is not generally known.", isParent: true },
    
    // ——— General category (children of “general”) ———
    { id: "tracking",     name: "Tracking",     description: "Capable of reading trail signs and marking where creatures or humanoids have passed. The larger a creature is, the easier it usually is to track, but there are exceptions….",       parent: "general" },
    { id: "appraisal",    name: "Appraisal",    description: "Appraisers are capable of evaluating the worth of raw materials, resources, and basically anything that isn’t already coins. They can also try to identify the presence and effects of essence in physical objects.",      parent: "general" },
    { id: "worldbreaker_historian", name: "Worldbreaker Historian", description: "Experts in what little myths and stories have survived before the Great Unraveling. They have a chance of identifying or even attempting to use any functional Worldbreaker technology, though success isn’t guaranteed.", parent: "general" },
    { id: "new_world_historian",    name: "New World Historian",    description: "Experts on various events and politics that have occurred since the great Unraveling. Unlike Worldbreaker historians, their knowledge is usually much more reliable.", parent: "general" },
    { id: "spycraft",    name: "Spycraft",    description: "Knowledge in how to move and act covertly, to deceive and to gain information by secret methods", parent: "general" },
    { id: "smooth_talker", name: "Smooth Talker", description: ".Knowledge in how to make deals, bargains, and bring people around to your point of view. Can potentially defuse combat!",        parent: "general" },
    { id: "survivalist",   name: "Survivalist",   description: "Knowledge on how to survive outside of civilization. You can find food and water much easier and can potentially even help provide for others in those situations as well.",   parent: "general" },
    { id: "cartographer",  name: "Cartographer",  description: "Knowledge on how to read and make maps. Cartographers are rarely lost unless something is directly obscuring their senses and can usually retrace their steps accurately.",     parent: "general" },

    // ——— Knowledge category (children of “knowledge”) ———
    { id: "arcanist",   name: "Arcanist Knowledge",   description: "Knowledge on how Essence works and behaves (this does not grant the ability to identify essence effects that are not obvious, such as traps).",      parent: "knowledge" },
    { id: "theology",   name: "Theology Knowledge",   description: "Knowledge of how various religious factions believe and act. Religion is an important part of everyday life in Valiant.",      parent: "knowledge" },
    { id: "underworld", name: "Underworld Knowledge", description: "Knowledge of how criminals work and communicate.",         parent: "knowledge" },
    { id: "military",   name: "Military Knowledge",   description: "Knowledge on how soldiers and armies think, act, and move.",          parent: "knowledge" },
    
    // ——— Biology sub-group (child of “knowledge”, parent for its own children) ———
    { id: "biology",           name: "Biology",           description: "Knowledge of a specific type of humanoid or monster. This gives you information on how to identify their behaviors and territories, as well as their strengths and weaknesses. High level biologists can even try to communicate basic ideas with monsters in their field of study, as long as they are not already hostile", isParent: true, parent: "knowledge" },
    { id: "necrologist",       name: "Necrologist",       description: "Undead monsters.",       parent: "biology" },
    { id: "macrologist",       name: "Macrologist",       description: "Earthshakers.",          parent: "biology" },
    { id: "pelagist",          name: "Pelagist",          description: "Ocean monsters.",        parent: "biology" },
    { id: "toxicologist",      name: "Toxicologist",      description: "Recognizing poisons and poisonous creatures.", parent: "biology" },
    { id: "umbralogist",       name: "Umbralogist",       description: "Tainted living creatures.",           parent: "biology" },
    { id: "aetherologist",     name: "Aetherologist",     description: "Elemental creatures.",    parent: "biology" },
    { id: "naturologist",      name: "Naturologist",      description: "Unmutated natural creatures.", parent: "biology" },
    { id: "mutologist",        name: "Mutologist",        description: "Unnaturally mutated creatures.", parent: "biology" }
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

  getCustomLores: function() {
    customLores = [];
    this.availableLores.forEach(lore => {
      if (lore?.isCustom || false) {
        customLores.push(lore)
      }
    });

    return customLores;
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
    // 1) Must have at least one purchased *this layer*
    const current = this.currentLayerPurchasedLores[loreId] || 0;
    if (current <= 0) {
      return false;
    }

    // 2) Don't go below racial bonus count
    const racial = window.RacialLocks?.lores?.has(loreId) ? 1 : 0;
    return current >= racial;
  },

  isSelected: function (loreId) {
    return this.getLoreLevel(loreId) > 0;
  },

  getLoreLevel: function (loreId) {
    return (this.purchasedLores[loreId] || 0);
  },

  purchaseLore: function (loreId) {
    if (!this.canIncreaseLore(loreId)) return false;

    this.currentLayerPurchasedLores[loreId] = (this.currentLayerPurchasedLores[loreId] || 0) + 1;
    this.purchasedLores[loreId] = (this.purchasedLores[loreId] || 0) + 1;

    UI.updateLoreUI();
    UI.updateLayerPreview();
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
