
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
    if (typeof points !== "number" || isNaN(points)) {
      console.error("Invalid point value passed to spendPoints:", points);
      return false;
    }

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
   * Refund build points for an item in a specific domain.
   * @param {string} domain - The domain (e.g. "stats", "abilities", etc.)
   * @param {string} id - The identifier of the item
   * @param {number} cost - The amount of points to refund
   */
  refundPoints(domain, id, cost) {
    const spent = this.currentLayer[domain]?.[id];
  
    if (typeof spent === "undefined") {
      console.warn(`Nothing to refund for ${id}`);
      return;
    }
  
    if (this.currentLayer.pointsSpent < cost) {
      console.warn(`Attempted to refund more points than were spent on ${id}`);
      return;
    }
  
    this.currentLayer.pointsSpent -= cost;
  
    // Decrease or delete the entry
    if (spent === 1) {
      delete this.currentLayer[domain][id];
    } else {
      this.currentLayer[domain][id] -= 1;
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
