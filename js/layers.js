
// layers.js - Centralized Build Point Management

window.Layers = {
  layers: [],

  currentLayer: {
    pointsSpent: 0,
    stats: {},
    abilities: {},
    proficiencies: {},
    lores: {},
    essenceSlots: EssenceSlots.getBlankEssenceSlot(),
  },

  totalPoints: 50, // Initial points for level 1

  /**
   * Get remaining unspent points.
   * @returns {number} Available build points.
   */
  getRemainingPoints: function () {
    return this.totalPoints - this.currentLayer.pointsSpent;
  },

  /**
   * Spend points on a specific domain.
   * @param {string} domain - "stats", "abilities", "proficiencies", "lores"
   * @param {string} id - ID of the item being purchased.
   * @param {number} points - Number of points to spend.
   */
  spendPoints: function(domain, id, points) {
    if (this.getRemainingPoints() < points) {
      console.error("Not enough points.");
      return false;
    }
  
    // Track cost for book-keeping only
    if (!this.currentLayer[domain]) {
      this.currentLayer[domain] = {};
    }
  
    this.currentLayer[domain][id] = (this.currentLayer[domain][id] || 0); // don't increase count
    this.currentLayer.pointsSpent += points;
  
    return true;
  },

  /**
   * Refund points from a specific domain.
   * @param {string} domain - "stats", "abilities", "proficiencies", "lores"
   * @param {string} id - ID of the item being refunded.
   * @param {number} [amount=1] - Number of points to refund.
   */
  refundPoints: function (domain, id, amount = 1) {
    const current = this.currentLayer[domain][id] || 0;
  
    if (current < amount) {
      console.warn(`Attempted to refund more points than were spent on ${id}`);
      return;
    }
  
    this.currentLayer[domain][id] -= amount;
    this.currentLayer.pointsSpent -= amount;
  
    if (this.currentLayer[domain][id] === 0) {
      delete this.currentLayer[domain][id];
    }
  },

  /**
   * Reset current layer on level up.
   */
  resetLayer: function () {
    this.currentLayer = {
      pointsSpent: 0,
      stats: {},
      abilities: {},
      proficiencies: {},
      lores: {},
      essenceSlots: EssenceSlots.getBlankEssenceSlot(),
    };
    UI.updateLayerHistory();
  },

  /**
   * Returns the current character level.
   * Level is based on the number of layers added + 1.
   * @returns {number} Current level.
   */
  getCurrentLevel: function () {
    return this.layers.length + 1; // Level starts at 1, increment with each new layer
  },

};
