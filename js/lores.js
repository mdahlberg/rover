// lores.js - Manages lore data, selection, and state management.

window.Lores = {
  // All available lores categorized by type and with parent relationships
  availableLores: [
    { id: "tracking", name: "Tracking", description: "Read trail signs to track creatures or humanoids.", category: "General" },
    { id: "appraisal", name: "Appraisal", description: "Evaluate the worth of materials and identify essence in objects.", category: "General" },
    { id: "worldbreaker_historian", name: "Worldbreaker Historian", description: "Foobar.", category: "General" },
    { id: "new_world_historian", name: "New World Historian", description: "Foobar.", category: "General" },
    { id: "smooth_talker", name: "Smooth Talker", description: "Foobar.", category: "General" },
    { id: "survivalist", name: "Survivalist", description: "Foobar.", category: "General" },
    { id: "cartographer", name: "Cartographer", description: "Foobar.", category: "General" },

    // Knowledge Sub-lores (Under General -> Knowledge)
    { id: "arcanist", name: "Arcanist Knowledge", description: "Foobar.", category: "Knowledge" },
    { id: "theology", name: "Theology Knowledge", description: "Foobar.", category: "Knowledge" },
    { id: "underworld", name: "Underworld Knowledge", description: "Knowledge of criminal networks and communication methods.", category: "Knowledge" },
    { id: "military", name: "Military Knowledge", description: "Understanding military tactics and army behavior.", category: "Knowledge" },

    // Biology header
    { id: "biology", name: "Biology", description: "Parent lore for specialized monster knowledge.", category: "Knowledge", isParent: true },
    // Biology Sub-lores (Under Knowledge -> Biology)
    { id: "necrologist", name: "Necrologist", description: "Expert on undead monsters.", category: "Knowledge", parent: "biology" },
    { id: "macrologist", name: "Macrologist", description: "Expert on Earthshakers.", category: "Knowledge", parent: "biology" },
    { id: "pelagist", name: "Pelagist", description: "Expert on ocean monsters.", category: "Knowledge", parent: "biology" },
    { id: "toxicologist", name: "Toxicologist", description: "Recognizes poisons and poisonous creatures.", category: "Knowledge", parent: "biology" },
    { id: "umbralogist", name: "Umbralogist", description: "Expert on tainted living creatures.", category: "Knowledge", parent: "biology" },
    { id: "aetherologist", name: "Aetherologist", description: "Expert on elemental creatures.", category: "Knowledge", parent: "biology" },
    { id: "naturologist", name: "Naturologist", description: "Expert on unmutated natural creatures.", category: "Knowledge", parent: "biology" },
    { id: "mutologist", name: "Mutologist", description: "Expert on unnaturally mutated creatures.", category: "Knowledge", parent: "biology" }
  ],

  // Stores the selected lore points as a mapping: { loreId: points }
  selectedLores: {},

  /**
   * Calculate how many lores the user has earned based on the Mind stat.
   * Every 3 points in Mind grants 1 lore.
   * @returns {number} Number of earned lore points.
   */
  getEarnedLores: function () {
    return Math.floor(Stats.getTotal("mind") / 3);
  },

  /**
   * Returns the selected lore levels (global, not per-level).
   * @returns {object} An object mapping loreId to allocated points.
   */
  getSelectedLores: function () {
    return this.selectedLores;
  },

  /**
   * Calculates how many lore points remain unspent.
   * @returns {number} Unspent lore points.
   */
  getUnspentLores: function () {
    const selected = this.getSelectedLores();
    const totalSpent = Object.values(selected).reduce((sum, pts) => sum + pts, 0);
    return this.getEarnedLores() - totalSpent;
  },

  /**
   * Returns all child lores belonging to a specific parent lore.
   * @param {string} parentId - The ID of the parent lore.
   * @returns {array} Array of child lores.
   */
  getChildLores: function (parentId) {
    return this.availableLores.filter(lore => lore.parent === parentId);
  },

  /**
   * Checks if a lore is a child of another lore.
   * @param {string} loreId - ID of the lore to check.
   * @returns {boolean} True if the lore is a child, false otherwise.
   */
  isChildLore: function (loreId) {
    const lore = this.availableLores.find(l => l.id === loreId);
    return lore && lore.parent;
  },

  /**
   * Increases the allocated level for a given lore if unspent lore points are available.
   * Each lore can be increased up to a maximum of 5.
   * @param {string} loreId - The ID of the lore to increase.
   * @returns {boolean} True if increased, false otherwise.
   */
  increaseLore: function (loreId) {
    if (this.getUnspentLores() <= 0) return false;

    if (!this.selectedLores[loreId]) {
      this.selectedLores[loreId] = 0;
    }

    if (this.selectedLores[loreId] < 5) {
      this.selectedLores[loreId]++;
      UI.updateLoreUI();
      return true;
    }
    return false;
  },

  /**
   * Decreases the allocated level for a given lore if it is above 0.
   * @param {string} loreId - The ID of the lore to decrease.
   * @returns {boolean} True if decreased, false otherwise.
   */
  decreaseLore: function (loreId) {
    if (!this.selectedLores[loreId] || this.selectedLores[loreId] <= 0) return false;
    this.selectedLores[loreId]--;
    UI.updateLoreUI();
    return true;
  }
};
