// layers.js - Centralized Build Point Management

window.Layers = {
  layers: [],

  currentLayer: {
    pointsSpent: 0,
    points: {},
  },

  /**
   * Scan across all layers (including current) to sum points spent
   */
  getTotalPointsSpent() {
    return this.layers.reduce((sum, layer) => sum + (layer.pointsSpent || 0), this.currentLayer.pointsSpent);
  },

  /**
   * Total earned minus total spent
   */
  getRemainingPoints() {
    return BPLeveling.earnedBP - this.getTotalPointsSpent();
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

  /**
   * Spend points on a domain+id pair.
   * @param {string} domain - e.g., "stats", "abilities"
   * @param {string} id - e.g., "body", "strike_from_behind"
   * @param {number} cost
   * @returns {boolean} success
   */
  spendPoints: function(domain, id, cost) {
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
      console.warn(`Attempted to refund more points than were spent on ${domain}.${id} - refund: ${cost}"`);
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
    this.currentLayer.stats = structuredClone(Stats.currentLayerStats);
    this.currentLayer.abilities = structuredClone(Abilities.currentLayerPurchasedAbilities);
    this.currentLayer.proficiencies = structuredClone(Proficiencies.currentLayerPurchasedProficiencies);
    this.currentLayer.essenceSlots = structuredClone(EssenceSlots.currentLayerPurchasedEssences);

    // Save snapshot of BP state
    this.currentLayer.bpSnapshot = {
      earned: BPLeveling.earnedBP,
      spent: this.getTotalPointsSpent(),
      remaining: BPLeveling.earnedBP - this.getTotalPointsSpent()
    };

    this.layers.push(structuredClone(this.currentLayer));

    this.currentLayer = this.createNewLayer();

    Stats.resetLayerStats();
    Abilities.resetCurrentLayerPurchasedAbilities?.();
    Proficiencies.resetCurrentLayer?.();
    EssenceSlots.resetCurrentLayer?.();
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

  createNewLayer: function () {
    // We have already trimmed additional layers
    const lastLayer = this.layers[this.layers.length - 1];

    // Restore BP snapshot if available (used during revert)
    if (lastLayer?.bpSnapshot) {
      console.log("BP Snapshot found! Restoring: ", lastLayer.bpSnapshot);
      BPLeveling.earnedBP = lastLayer.bpSnapshot.earned;
    }

    // Return a fresh, empty layer
    return {
      pointsSpent: 0,
      points: {},
      stats: {},
      abilities: {},
      lores: {},
      proficiencies: {},
      essenceSlots: {},
    };
  },

  revertToLevel: function (index) {
    if (!confirm(`Revert to Level ${index + 1}? All progress after this will be lost.`)) return;

    // Grab the layer the user wants to revert to
    const reverted = structuredClone(this.layers[index]);

    // Remove that layer and all above it
    this.layers = this.layers.slice(0, index);

    // Set it as the new current layer
    this.currentLayer = reverted;

    // Reset domain-specific helpers
    // Restore counts so preview shows `x1` correctly
    Stats.currentLayerStats = structuredClone(this.currentLayer.stats || {});

    // Recalculate Globals by iterating through all previous layers
    Stats.recalcFromLayers();
    Abilities.currentLayerPurchasedAbilities = structuredClone(this.currentLayer.abilities || {});
    Abilities.recalcFromLayers();
    Proficiencies.currentLayerPurchasedProficiencies = structuredClone(this.currentLayer.proficiencies || {});
    Proficiencies.recalcFromLayers();
    EssenceSlots.currentLayerPurchasedEssences = structuredClone(this.currentLayer.essenceSlots || {});
    EssenceSlots.recalcFromLayers();

    BPLeveling.restoreFromSnapshot(this.currentLayer.bpSnapshot);

    // Sync UI
    UI.refreshAll();
  }

};
