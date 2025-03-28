
window.Stats = {
    baseStats: {
        strength: 0,
        health: 0,
        armor: 0,
        lores: 0,
        tracking: 0,
        gather: 0
    },
    stats: {},
    getIncrementCost: function(level, value) {
        if (level <= 2) {
            if (value <= 5) return 2;
            if (value <= 20) return 3;
            return 5;
        } else if (level <= 6) {
            if (value <= 5) return 3;
            if (value <= 20) return 5;
            return 6;
        } else if (level <= 12) {
            if (value <= 5) return 5;
            if (value <= 20) return 6;
            return 8;
        } else if (level <= 18) {
            if (value <= 5) return 6;
            if (value <= 20) return 8;
            return 10;
        } else {
            if (value <= 5) return 8;
            if (value <= 20) return 10;
            return 12;
        }
    },
    canIncrease: function(statName) {
        return this.stats[statName] < 30;
    },
    canDecrease: function(statName) {
        return this.stats[statName] > this.baseStats[statName];
    },
    increaseStat: function(statName, currentLevel) {
        if (!this.canIncrease(statName)) return 0;
        const nextVal = this.stats[statName] + 1;
        const cost = this.getIncrementCost(currentLevel, nextVal);
        this.stats[statName] = nextVal;
        return cost;
    },
    decreaseStat: function(statName, currentLevel) {
        if (!this.canDecrease(statName)) return 0;
        const cost = this.getIncrementCost(currentLevel, this.stats[statName]);
        this.stats[statName] -= 1;
        return cost; // Refund amount
    },
    pointsSpentOnStats: function() {
        let total = 0;
        const level = Layers.currentLevel;
        for (let stat in this.stats) {
            let base = this.baseStats[stat];
            let val = this.stats[stat];
            for (let i = base + 1; i <= val; i++) {
                total += this.getIncrementCost(level, i);
            }
        }
        return total;
    }
};

// Initialize
for (let stat in Stats.baseStats) {
    Stats.stats[stat] = 0;
}
