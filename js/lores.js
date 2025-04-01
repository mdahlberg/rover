window.Lores = {
  availableLores: {
    tracking: {
      name: "Tracking",
      description: "Capable of reading trail signs and marking where creatures or humanoids have passed.",
    },
    appraisal: {
      name: "Appraisal",
      description: "Evaluate the worth of raw materials and resources, and identify essence in physical objects.",
    },
    worldbreaker_historian: {
      name: "Worldbreaker Historian",
      description: "Experts in myths and stories of the past. Can attempt to identify or use Worldbreaker technology.",
    },
    new_world_historian: {
      name: "New World Historian",
      description: "Experts in events and politics that have occurred since the Great Unraveling.",
    },
    smooth_talker: {
      name: "Smooth Talker",
      description: "Skilled in making deals, bargains, and bringing people around to your point of view.",
    },
    survivalist: {
      name: "Survivalist",
      description: "Capable of surviving outside of civilization. Able to find food and water more easily.",
    },
    cartographer: {
      name: "Cartographer",
      description: "Able to read and make maps. Rarely lost and can retrace steps accurately.",
    },
    arcanist: {
      name: "Arcanist Knowledge",
      description: "Understanding how Essence works and behaves.",
    },
    theology: {
      name: "Theology Knowledge",
      description: "Expertise on various religious factions, beliefs, and actions.",
    },
    underworld: {
      name: "Underworld Knowledge",
      description: "Knowledge of how criminals work and communicate.",
    },
    military: {
      name: "Military Knowledge",
      description: "Understanding military tactics, behavior, and army movements.",
    },
    biology: {
      name: "Biology Knowledge",
      description: "A parent category representing expertise in various types of creatures.",
      isParent: true, // Indicate it's a parent lore, not selectable
    },
    necrologist: {
      name: "Necrologist",
      description: "Expert on undead monsters, their behaviors, and weaknesses.",
      parent: "biology",
    },
    macrologist: {
      name: "Macrologist",
      description: "Expert on Earthshakers and their behavior.",
      parent: "biology",
    },
    pelagist: {
      name: "Pelagist",
      description: "Expert on ocean monsters and their territories.",
      parent: "biology",
    },
    toxicologist: {
      name: "Toxicologist",
      description: "Recognizes poisons and poisonous creatures.",
      parent: "biology",
    },
    umbralogist: {
      name: "Umbralogist",
      description: "Expert on tainted living creatures and their traits.",
      parent: "biology",
    },
    aetherologist: {
      name: "Aetherologist",
      description: "Expert on elemental creatures and their behavior.",
      parent: "biology",
    },
    naturologist: {
      name: "Naturologist",
      description: "Expert on unmutated natural creatures.",
      parent: "biology",
    },
    mutologist: {
      name: "Mutologist",
      description: "Expert on unnaturally mutated creatures.",
      parent: "biology",
    },
  },

  // Keeps track of selected lores
  selectedLores: {},

  /**
   * Returns child lores belonging to a parent.
   * @param {string} parentId - The ID of the parent lore.
   * @returns {array} Array of child lores.
   */
  getChildLores: function (parentId) {
    return Object.keys(this.availableLores)
      .filter((loreId) => this.availableLores[loreId].parent === parentId)
      .map((loreId) => this.availableLores[loreId]);
  },

  /**
   * Check if a lore is purchased or increased.
   * @param {string} loreId
   * @returns {boolean}
   */
  isLorePurchased: function (loreId) {
    return !!this.selectedLores[loreId];
  },

  /**
   * Purchase or increase lore points.
   * @param {string} loreId
   * @returns {boolean} True if successfully purchased
   */
  purchaseLore: function (loreId) {
    if (!this.availableLores[loreId]) {
      console.warn("Invalid lore selected.");
      return false;
    }

    if (!this.selectedLores[loreId]) {
      this.selectedLores[loreId] = 1;
    } else if (this.selectedLores[loreId] < 5) {
      this.selectedLores[loreId]++;
    } else {
      console.warn("Lore maxed out.");
      return false;
    }

    UI.updateLoreUI();
    return true;
  },

  /**
   * Decrease or remove a lore.
   * @param {string} loreId
   * @returns {boolean} True if successfully decreased
   */
  removeLore: function (loreId) {
    if (!this.selectedLores[loreId] || this.selectedLores[loreId] <= 0) return false;
    this.selectedLores[loreId]--;
    if (this.selectedLores[loreId] === 0) {
      delete this.selectedLores[loreId];
    }
    UI.updateLoreUI();
    return true;
  },

  /**
   * Alias for isSelected to check if a lore is purchased.
   * @param {string} loreId
   * @returns {boolean}
   */
  isSelected: function (loreId) {
    return this.isLorePurchased(loreId);
  },

  /**
   * Calculates how many lore points remain unspent.
   * Lore points are earned at a rate of 1 per 3 Mind stat.
   * @returns {number} Unspent lore points.
   */
  getUnspentLores: function () {
    const earnedLores = Math.floor(Stats.getTotal("mind") / 3);
    const totalSpent = Object.values(this.selectedLores).reduce(
      (sum, lvl) => sum + lvl,
    0
    );
    return earnedLores - totalSpent;
  },
};

