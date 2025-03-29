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

  selectedLores: {}, // Tracks which lores are chosen at each level

  /**
   * Calculate how many lores the user has earned based on Mind stat.
   * @returns {number} Number of earned lores.
   */
  getEarnedLores: function() {
    return Math.floor(Stats.getTotal('mind') / 3);
  },

  /**
   * Get the selected lores for the current level.
   * @returns {array} Selected lore IDs.
   */
  getSelectedLores: function() {
    return this.selectedLores[Layers.currentLevel] || [];
  },

  /**
   * Calculate how many lores remain unspent.
   * @returns {number} Number of unspent lores.
   */
  getUnspentLores: function() {
    return this.getEarnedLores() - this.getSelectedLores().length;
  },

  /**
   * Select a lore for the current level if lores are available.
   * @param {string} loreId - ID of the lore to select.
   */
  selectLore: function(loreId) {
    if (this.getUnspentLores() <= 0) return false;
    if (!this.selectedLores[Layers.currentLevel]) {
      this.selectedLores[Layers.currentLevel] = [];
    }
    this.selectedLores[Layers.currentLevel].push(loreId);
    UI.updateLoreUI();
    return true;
  },

  /**
   * Remove a previously selected lore from the current level.
   * @param {string} loreId - ID of the lore to remove.
   */
  removeLore: function(loreId) {
    if (!this.selectedLores[Layers.currentLevel]) return false;
    const index = this.selectedLores[Layers.currentLevel].indexOf(loreId);
    if (index === -1) return false;
    this.selectedLores[Layers.currentLevel].splice(index, 1);
    UI.updateLoreUI();
    return true;
  },

  /**
   * Reset lores for a new level up (locking in previous selections).
   */
  lockLores: function() {
    if (!this.selectedLores[Layers.currentLevel]) return;
    Layers.updateCurrentLayer();
  }
};
