// layers.js - Handles level data structure, level-ups, build points, and locked layers
window.Layers = {
    currentLevel: 1,
    maxLevel: 1,
    basePoints: 10,        // Build points at level 1
    pointsPerLevel: 5,     // Additional build points gained each subsequent level
    layersData: [],        // Array to track data for each level (e.g., abilities acquired)
    init: function() {
        this.currentLevel = 1;
        this.maxLevel = 1;
        // Initialize layer 1 data
        this.layersData = [ { level: 1, abilities: [] } ];
    },
    // Total build points available at the current level
    getTotalBuildPoints: function() {
        return this.basePoints + (this.currentLevel - 1) * this.pointsPerLevel;
    },
    // Total points spent (stats + abilities)
    getTotalPointsSpent: function() {
        const statPoints = Stats.pointsSpentOnStats();
        const abilityPoints = Abilities.pointsSpentOnAbilities();
        return statPoints + abilityPoints;
    },
    // Remaining (unspent) build points
    getRemainingPoints: function() {
        return this.getTotalBuildPoints() - this.getTotalPointsSpent();
    },
    // Level up to the next level (unlock a new layer)
    levelUp: function() {
        const prevLevel = this.currentLevel;
        // (Optional) finalize or record stats at prevLevel if needed for history
        // Increase level
        this.currentLevel += 1;
        if (this.currentLevel > this.maxLevel) {
            this.maxLevel = this.currentLevel;
        }
        // Prepare new layer data for the new level
        this.layersData.push({ level: this.currentLevel, abilities: [] });
        // Update UI for new level and log history for the level we just completed
        UI.updateLevelDisplay(this.currentLevel);
        UI.updateRemainingPoints(this.getRemainingPoints());
        Abilities.renderShop();
        UI.addHistoryEntry(prevLevel, this.layersData[prevLevel - 1]);
    }
};
// Initialize layers (prepare level 1 data on load)
Layers.init();

