// abilities.js - Handles ability shop rendering, purchasing, and tracking by level
window.Abilities = {
    // Available abilities list (name, cost, and level requirement)
    list: [
        { name: "Sword Mastery", cost: 2, requiredLevel: 1 },
        { name: "Fireball",     cost: 5, requiredLevel: 2 },
        { name: "Heal",         cost: 3, requiredLevel: 2 },
        { name: "Dragon Slayer",cost: 10, requiredLevel: 5 }
    ],
    // Track purchased abilities
    purchased: [],
    purchasedNames: new Set(),
    // Render the ability shop list based on current level and purchased abilities
    renderShop: function() {
        const shopContainer = document.getElementById('ability-shop');
        shopContainer.innerHTML = ''; // clear current list
        // Show each ability that is not yet purchased
        for (let ability of this.list) {
            if (this.purchasedNames.has(ability.name)) continue;
            const isUnlocked = (ability.requiredLevel <= Layers.currentLevel);
            // Build ability entry
            const abilityDiv = document.createElement('div');
            abilityDiv.className = 'ability-item';
            // Ability text
            const abilityText = document.createElement('span');
            abilityText.textContent = `${ability.name} (cost ${ability.cost})`;
            abilityDiv.appendChild(abilityText);
            // Buy/Locked button
            const buyBtn = document.createElement('button');
            buyBtn.textContent = isUnlocked ? 'Buy' : 'Locked';
            buyBtn.disabled = !isUnlocked;
            buyBtn.className = 'buy-ability-btn';
            buyBtn.setAttribute('data-ability', ability.name);
            abilityDiv.appendChild(buyBtn);
            shopContainer.appendChild(abilityDiv);
        }
    },
    // Calculate total points spent on purchased abilities
    pointsSpentOnAbilities: function() {
        return this.purchased.reduce((sum, ability) => sum + ability.cost, 0);
    },
    // Purchase an ability by name (if requirements and points are met)
    purchaseAbility: function(abilityName) {
        const ability = this.list.find(ab => ab.name === abilityName);
        if (!ability) return false;
        // Check requirements and avoid duplicates
        if (this.purchasedNames.has(ability.name) || Layers.currentLevel < ability.requiredLevel) {
            return false;
        }
        // Check if enough points remain for this purchase
        if (Layers.getRemainingPoints() < ability.cost) {
            alert('Not enough build points to purchase this ability.');
            return false;
        }
        // Purchase: add to purchased list
        this.purchased.push({ name: ability.name, cost: ability.cost, levelAcquired: Layers.currentLevel });
        this.purchasedNames.add(ability.name);
        // Track ability in the current layer data for history
        const currentLayer = Layers.layersData[Layers.currentLevel - 1];
        if (currentLayer) {
            currentLayer.abilities.push(ability.name);
        }
        // Update UI after purchase
        this.renderShop();
        UI.updatePurchasedAbilities();
        UI.updateRemainingPoints(Layers.getRemainingPoints());
        return true;
    },
    // Remove (refund) a purchased ability by name
    removeAbility: function(abilityName) {
        const index = this.purchased.findIndex(ab => ab.name === abilityName);
        if (index === -1) return false;
        const ability = this.purchased[index];
        // Remove from purchased lists
        this.purchased.splice(index, 1);
        this.purchasedNames.delete(abilityName);
        // Remove from the layer data where it was acquired
        const levelAcquired = ability.levelAcquired;
        const layerData = Layers.layersData[levelAcquired - 1];
        if (layerData) {
            const idx = layerData.abilities.indexOf(abilityName);
            if (idx !== -1) layerData.abilities.splice(idx, 1);
        }
        // Update UI after removal
        this.renderShop();
        UI.updatePurchasedAbilities();
        UI.updateRemainingPoints(Layers.getRemainingPoints());
        return true;
    }
};

