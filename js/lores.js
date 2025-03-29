// lores.js - Manages lore data, selection, and state management.

window.Lores = {
  // All available lores categorized by type
  availableLores: [
    { id: "tracking", name: "Tracking", description: "Read trail signs to track creatures or humanoids.", category: "General" },
    { id: "appraisal", name: "Appraisal", description: "Evaluate the worth of materials and identify essence in objects.", category: "General" },
    { id: "underworld", name: "Underworld Knowledge", description: "Knowledge of criminal networks and communication methods.", category: "Knowledge" },
    { id: "military", name: "Military Knowledge", description: "Understanding military tactics and army behavior.", category: "Knowledge" },
    { id: "arcanist", name: "Arcanist Knowledge", description: "Foobar.", category: "Knowledge" },
    { id: "theology", name: "Theology Knowledge", description: "Foobar.", category: "Knowledge" },
    { id: "biology", name: "Biology Knowledge", description: "Foobar.", category: "Knowledge" },
    { id: "worldbreaker_historian", name: "Worldbreaker Historian", description: "Foobar.", category: "General" },,
    { id: "new_world_historian", name: "New World Historian", description: "Foobar.", category: "General" },
    { id: "smooth_talker", name: "Smooth Talker", description: "Foobar.", category: "General" },
    { id: "survivalist", name: "Survivalist", description: "Foobar.", category: "General" },
    { id: "cartographer", name: "Cartographer", description: "Foobar.", category: "General" },
    // Add more lores as needed
  ],

  // Tracks the levels of lores for each level in the format:
  // { level: { loreId: points } }
  // Stores the selected lore points as a mapping: { loreId: points }
  selectedLores: {},

  /**
   * Calculate how many lores the user has earned based on the Mind stat.
   * Every 3 points in Mind stat grants 1 lore.
   * @returns {number} Number of earned lore points.
   */
  getEarnedLores: function() {
    return Math.floor(Stats.getTotal('mind') / 3);
  },

  /**
   * Returns the selected lore levels (global, not per-level).
   * @returns {object} An object mapping loreId to allocated points.
   */
  getSelectedLores: function() {
    return this.selectedLores;
  },

  /**
   * Calculates how many lore points remain unspent.
   * @returns {number} Unspent lore points.
   */
  getUnspentLores: function() {
    const selected = this.getSelectedLores();
    const totalSpent = Object.values(selected).reduce((sum, pts) => sum + pts, 0);
    return this.getEarnedLores() - totalSpent;
  },

  /**
   * Increases the allocated level for a given lore if unspent lore points are available.
   * Each lore can be increased up to a maximum of 5.
   * @param {string} loreId - The ID of the lore to increase.
   * @returns {boolean} True if increased, false otherwise.
   */
  increaseLore: function(loreId) {
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
  decreaseLore: function(loreId) {
    if (!this.selectedLores[loreId] || this.selectedLores[loreId] <= 0) return false;
    this.selectedLores[loreId]--;
    UI.updateLoreUI();
    return true;
  }
};

