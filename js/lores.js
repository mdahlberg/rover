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

  selectedLores: {}, // Tracks the levels of lores for each level { level: { loreId: points } }

  /**
   * Calculate how many lores the user has earned based on Mind stat.
   * @returns {number} Number of earned lores.
   */
  getEarnedLores: function() {
    return Math.floor(Stats.getTotal('mind') / 3);
  },

  /**
   * Get the selected lores for the current level.
   * @returns {object} Selected lores with their current level.
   */
  getSelectedLores: function() {
    return this.selectedLores[Layers.currentLevel] || {};
  },

  /**
   * Calculate how many lores remain unspent.
   * @returns {number} Number of unspent lores.
   */
  getUnspentLores: function() {
    const selectedLores = this.getSelectedLores();
    const totalSpentLores = Object.values(selectedLores).reduce((sum, level) => sum + level, 0);
    return this.getEarnedLores() - totalSpentLores;
  },

  /**
   * Increase the level of a specific lore if unspent lores are available.
   * @param {string} loreId - ID of the lore to increase.
   */
  increaseLore: function(loreId) {
    if (this.getUnspentLores() <= 0) return false; // No unspent lores available
    if (!this.selectedLores[Layers.currentLevel]) {
      this.selectedLores[Layers.currentLevel] = {};
    }
    if (!this.selectedLores[Layers.currentLevel][loreId]) {
      this.selectedLores[Layers.currentLevel][loreId] = 0;
    }
    if (this.selectedLores[Layers.currentLevel][loreId] < 5) {
      this.selectedLores[Layers.currentLevel][loreId]++;
      UI.updateLoreUI();
      return true;
    }
    return false;
  },

  /**
   * Reset lores for a new level up (locking in previous selections).
   */
  lockLores: function() {
    if (!this.selectedLores[Layers.currentLevel]) return;
    Layers.updateCurrentLayer();
  }
};

