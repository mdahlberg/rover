// layers.js - Centralized Build Point Management

window.Layers = {
  layers: [],
  totalPoints: 0,
  earnedBP: 0, // optional if stored separately

  currentLayer: {
    pointsSpent: 0,
    points: {},
  },

  getTotalPointsSpent() {
    return this.layers.reduce((sum, layer) => sum + (layer.pointsSpent || 0), this.currentLayer.pointsSpent);
  },

  getRemainingPoints() {
    return this.totalPoints - this.getTotalPointsSpent();
  },

  setTotalPoints: function(amount) {
    this.totalPoints = parseInt(amount) || 0;
  },

  /**
   * Get the current level (starts at 1, increases with each level up).
   * @returns {number}
   */
  getCurrentLevel() {
    return this.layers.length + 1;
  },

  /**
   * Get how many points were spent in total this layer.
   * @returns {number}
   */
  getCurrentPointsSpent() {
    return this.currentLayer.pointsSpent;
  },

  getCurrentLayerCount: function (domain, id) {
    return this.currentLayer[domain]?.[id] || 0;
  },

  /**
   * Get the total count of a specific item across all layers.
   * @param {string} domain - "stats", "abilities", "proficiencies", "lores", "essenceSlots"
   * @param {string} id - The ID of the item
   * @returns {number} Total count
   */
  getTotalCount: function (domain, id) {
    let total = 0;

    // Include finalized layers
    this.layers.forEach(layer => {
      if (layer[domain] && layer[domain][id]) {
        total += layer[domain][id];
      }
    });

    // Include current layer
    if (this.currentLayer[domain] && this.currentLayer[domain][id]) {
      total += this.currentLayer[domain][id];
    }

    return total;
  },

  /**
   * Spend points on a domain+id pair.
   * @param {string} domain - e.g., "stats", "abilities"
   * @param {string} id - e.g., "body", "strike_from_behind"
   * @param {number} cost
   * @returns {boolean} success
   */
  spendPoints: function(domain, id, cost) {
    remainingPoints = this.getRemainingPoints();
    if (this.getRemainingPoints() < cost) {
      console.warn("Not enough points available.");
      return false;
    }

    if (!this.currentLayer.points[domain]) {
      this.currentLayer.points[domain] = {};
    }

    this.currentLayer.points[domain][id] = (this.currentLayer.points[domain][id] || 0) + cost;
    this.currentLayer.pointsSpent += cost;
    return true;
  },

  /**
   * Refund points from a domain+id pair.
   * @param {string} domain
   * @param {string} id
   * @param {number} cost
   */
  refundPoints(domain, id, cost) {
    current_layer_points = this.currentLayer.points[domain];
    if (!this.currentLayer.points[domain] || typeof this.currentLayer.points[domain][id] === 'undefined') {
      console.warn(`Nothing to refund for ${domain}.${id}`);
      return false;
    }

    if (this.currentLayer.points[domain][id] < cost) {
      // TODO - this is bad, not sure a warning is enough - maybe we should calulate
      // the cost rather than passing it"
      console.warn(`Attempted to refund more points than were spent on ${domain}.${id}`);
      return false;
    }

    this.currentLayer.points[domain][id] -= cost;
    if (this.currentLayer.points[domain][id] === 0) {
      delete this.currentLayer.points[domain][id];
    }

    this.currentLayer.pointsSpent -= cost;

    return true;
  },

  /**
   * Called when the user levels up — freeze the current layer and start fresh.
   */
  resetLayer() {
    // TODO - refactor curentLayer to always hold this info
    this.currentLayer.stats = structuredClone(Stats.currentLayerStats);
    this.currentLayer.abilities = structuredClone(Abilities.currentLayerPurchasedAbilities);
    this.layers.push(structuredClone(this.currentLayer));

    this.currentLayer = {
      pointsSpent: 0,
      points: {},
      stats: {},
      abilities: {},
      lores: {},
      proficiencies: {},
      essenceSlots: {},
    };

    Stats.resetLayerStats();
    Abilities.currentLayerPurchasedAbilities = {};

  },

  /**
   * Get how many points were spent on a given domain/id during this layer.
   * @param {string} domain
   * @param {string} id
   * @returns {number}
   */
  getPointsSpentOn(domain, id) {
    return this.currentLayer.points[domain]?.[id] || 0;
  },

  /**
   * Get all points spent in this layer
   */
  getCurrentPointsSpent: function () {
    return this.currentLayer.pointsSpent || 0;
  },

};
