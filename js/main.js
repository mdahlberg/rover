
window.addEventListener('DOMContentLoaded', function() {
    UI.init();
    UI.updateLevelDisplay(Layers.currentLevel);
    UI.updateRemainingPoints(Layers.getRemainingPoints());
    Abilities.renderShop();
    UI.updatePurchasedAbilities();

    for (let stat in Stats.stats) {
        const valueEl = document.getElementById(stat + '-value');
        if (valueEl) valueEl.textContent = Stats.stats[stat];
    }

    document.querySelectorAll('.stat-increase').forEach(button => {
        button.addEventListener('click', () => {
            const statName = button.getAttribute('data-stat');
            const cost = Stats.getIncrementCost(Layers.currentLevel, Stats.stats[statName] + 1);
            if (cost <= Layers.getRemainingPoints() && Stats.canIncrease(statName)) {
                Stats.increaseStat(statName, Layers.currentLevel);
                const valueEl = document.getElementById(statName + '-value');
                if (valueEl) {
                    valueEl.textContent = Stats.stats[statName];
                    valueEl.classList.add('updated');
                    setTimeout(() => valueEl.classList.remove('updated'), 200);
                }
                UI.updateRemainingPoints(Layers.getRemainingPoints());
            } else {
                alert("Not enough build points or stat maxed out.");
            }
        });
    });

    document.querySelectorAll('.stat-decrease').forEach(button => {
        button.addEventListener('click', () => {
            const statName = button.getAttribute('data-stat');
            if (Stats.canDecrease(statName)) {
                Stats.decreaseStat(statName, Layers.currentLevel);
                const valueEl = document.getElementById(statName + '-value');
                if (valueEl) {
                    valueEl.textContent = Stats.stats[statName];
                    valueEl.classList.add('updated');
                    setTimeout(() => valueEl.classList.remove('updated'), 200);
                }
                UI.updateRemainingPoints(Layers.getRemainingPoints());
            }
        });
    });

    const abilityShopEl = document.getElementById('ability-shop');
    if (abilityShopEl) {
        abilityShopEl.addEventListener('click', (event) => {
            if (event.target.classList.contains('buy-ability-btn')) {
                const abilityName = event.target.getAttribute('data-ability');
                Abilities.purchaseAbility(abilityName);
            }
        });
    }

    const purchasedListEl = document.getElementById('purchased-abilities');
    if (purchasedListEl) {
        purchasedListEl.addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-ability-btn')) {
                const abilityName = event.target.getAttribute('data-ability');
                Abilities.removeAbility(abilityName);
            }
        });
    }

    const levelUpBtn = document.getElementById('level-up-btn');
    if (levelUpBtn) {
        levelUpBtn.addEventListener('click', () => {
            Layers.levelUp();
            updateStatButtonLabels();
            UI.updatePurchasedAbilities();
        });
    }
});

function updateStatButtonLabels() {
  const currentLevel = Layers.currentLevel;

  document.querySelectorAll('.stat-line').forEach(statLine => {
    const statName = statLine.querySelector('.stat-increase').getAttribute('data-stat');
    const currentValue = Stats.stats[statName];

    const nextValue = currentValue + 1;
    const incCost = Stats.getIncrementCost(currentLevel, nextValue);
    const decCost = Stats.getIncrementCost(currentLevel, currentValue); // refund is based on current

    const incBtn = statLine.querySelector('.stat-increase');
    const decBtn = statLine.querySelector('.stat-decrease');

    incBtn.textContent = `Increase (+${incCost} pts)`;
    decBtn.textContent = `Decrease (+${decCost} pts)`;
  });
}

