const allAbilities = [
  { id: "pinning_shot", name: "Pinning Shot", cost: 4, description: "Pin an enemy in place, reducing movement by 50% for 1 round." },
  { id: "disarming_shot", name: "Disarming Shot", cost: 4, description: "Chance to disarm the enemy, removing their weapon." },
  { id: "vital_shot", name: "Vital Shot", cost: 6, description: "A powerful attack targeting weak points for double damage." },
  { id: "pressure_points", name: "Pressure Points", cost: 5, description: "Disable an enemy's limbs to reduce attack and defense." },
  { id: "combat_refit", name: "Combat Refit", cost: 3, description: "Regain a used ability during combat (2x uses)." },
  { id: "proficient_bows", name: "Proficient in Bows", cost: 2, description: "Gain proficiency bonus when using bows." }
];

window.addEventListener("DOMContentLoaded", () => {
  characterData.currentLevel = 1;
  characterData.layers.push({
    level: 1,
    buildPoints: 50,
    stats: {},
    abilities: [],
  });
  document.getElementById("build-points").value = 50;
  updateLevelDisplay();
  updateRemainingPoints();
  renderAbilityShop();
  renderPurchasedAbilities();
});


function renderAbilityShop() {
  const container = document.getElementById("ability-shop");
  container.innerHTML = "";

  const alreadyPurchased = getAllPurchasedAbilities();

  allAbilities.forEach(ability => {
    const card = document.createElement("div");
    card.className = "ability-card";

    const purchased = alreadyPurchased.has(ability.id);

    card.innerHTML = `
      <h4>${ability.name}</h4>
      <p title="${ability.description}">${ability.description}</p>
      <strong>Cost:</strong> ${ability.cost} pts<br/>
      <button ${purchased ? "disabled" : ""} data-id="${ability.id}">Purchase</button>
    `;

    const button = card.querySelector("button");
    if (!purchased) {
      button.addEventListener("click", () => purchaseAbility(ability));
    }

    container.appendChild(card);
  });
}

function getAllPurchasedAbilities() {
  const all = new Set();
  characterData.layers.forEach(layer => {
    (layer.abilities || []).forEach(id => all.add(id));
  });
  return all;
}

function getCurrentLayerAbilities() {
  const layer = characterData.layers.find(l => l.level === characterData.currentLevel);
  return layer?.abilities || [];
}

function purchaseAbility(ability) {
  const currentLayer = characterData.layers.find(l => l.level === characterData.currentLevel);
  if (!currentLayer) return;

  const remainingEl = document.getElementById("remaining-points");
  const currentRemaining = parseInt(remainingEl.textContent.split(":")[1]) || 0;

  if (currentRemaining < ability.cost) {
    alert("Not enough build points!");
    return;
  }

  currentLayer.abilities.push(ability.id);
  updateRemainingPoints();
  renderAbilityShop();
  renderPurchasedAbilities();
}

function renderPurchasedAbilities() {
  const container = document.getElementById("purchased-abilities");
  container.innerHTML = "";

  characterData.layers.forEach(layer => {
    if (!layer.abilities || layer.abilities.length === 0) return;

    const div = document.createElement("div");
    div.className = "purchased-level-block";

    const list = layer.abilities.map(id => {
      const ability = allAbilities.find(a => a.id === id);
      return ability ? `• ${ability.name}` : `• ${id}`;
    }).join("<br>");

    div.innerHTML = `<h4>Level ${layer.level}</h4>${list}`;
    container.appendChild(div);
  });
}




const statCostTable = [
  { levelMin: 1, levelMax: 2, costs: [2, 3, 5] },
  { levelMin: 3, levelMax: 6, costs: [3, 5, 6] },
  { levelMin: 7, levelMax: 12, costs: [5, 6, 8] },
  { levelMin: 13, levelMax: 18, costs: [6, 8, 10] },
  { levelMin: 19, levelMax: 20, costs: [8, 10, 12] },
];

function getPointCost(level, value) {
  const bracket = statCostTable.find(row => level >= row.levelMin && level <= row.levelMax);
  if (!bracket) return 99; // failsafe

  if (value <= 5) return bracket.costs[0];
  if (value <= 20) return bracket.costs[1];
  return bracket.costs[2];
}


const characterData = {
  currentLevel: 1,
  layers: [], // Each layer = { level, buildPoints, stats, abilities }
  buildPointsPerLevel: 10, // After level 1
};

document.getElementById("abilities").addEventListener("change", () => {
  const locked = getLockedAbilities();
  Array.from(document.getElementById("abilities").options).forEach(opt => {
    if (locked.has(opt.value)) {
      opt.selected = true; // reselect it
      opt.disabled = true; // prevent future deselection
    } else {
      opt.disabled = false;
    }
  });
});

const spendableStatIDs = [
  "strength", "health", "armor",
  "lores", "tracking", "gather"
];

spendableStatIDs.forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("input", updateRemainingPoints);
  }
});



function getCurrentLayerData() {
  const stats = {};
  ["body", "mind", "spirit", "strength", "health", "armor", "lores", "tracking", "gather"].forEach(id => {
    stats[id] = parseInt(document.getElementById(id).value) || 0;
  });

  const abilities = Array.from(document.getElementById("abilities").selectedOptions).map(opt => opt.value);

  return {
    level: characterData.currentLevel,
    buildPoints: parseInt(document.getElementById("build-points").value) || 0,
    stats,
    abilities,
  };
}

function updateLevelDisplay() {
  document.getElementById("level-display").textContent = `Level: ${characterData.currentLevel}`;
}

document.getElementById("level-up-button").addEventListener("click", levelUp);

function levelUp() {
  // Lock current layer
  const currentStats = {};
  const statFields = ["strength", "health", "armor", "lores", "tracking", "gather"];
  statFields.forEach(id => {
    currentStats[id] = parseInt(document.getElementById(id).value) || 0;
  });

  const currentAbilities = getCurrentLayerAbilities();

  const lockedLayer = {
    level: characterData.currentLevel,
    buildPoints: parseInt(document.getElementById("build-points").value) || 0,
    stats: currentStats,
    abilities: currentAbilities.slice(), // clone
  };

  // Replace current layer with locked one
  const currentIndex = characterData.layers.findIndex(l => l.level === characterData.currentLevel);
  if (currentIndex !== -1) {
    characterData.layers[currentIndex] = lockedLayer;
  } else {
    characterData.layers.push(lockedLayer);
  }

  // Advance to next level
  characterData.currentLevel++;

  // Add new editable layer
  characterData.layers.push({
    level: characterData.currentLevel,
    buildPoints: characterData.buildPointsPerLevel,
    stats: {},
    abilities: [],
  });

  // Reset form fields
  statFields.forEach(id => {
    document.getElementById(id).value = 0;
  });

  // Update build points field
  document.getElementById("build-points").value = characterData.buildPointsPerLevel;

  // Rerender UI
  updateLevelDisplay();
  updateRemainingPoints();
  renderLayerHistory();
  renderAbilityShop();
  renderPurchasedAbilities();
}

function enforceLockedAbilities() {
  const locked = getLockedAbilities();
  Array.from(document.getElementById("abilities").options).forEach(opt => {
    opt.disabled = locked.has(opt.value);
    if (opt.disabled) opt.selected = true;
  });
}


function getMinimumStatsFromPreviousLayers() {
  const minStats = {};
  characterData.layers.forEach(layer => {
    for (const stat in layer.stats) {
      const val = layer.stats[stat] || 0;
      minStats[stat] = Math.max(minStats[stat] || 0, val);
    }
  });
  return minStats;
}


function getMinimumStatsFromPreviousLayers() {
  const minStats = {};
  characterData.layers.forEach(layer => {
    for (const stat in layer.stats) {
      const val = layer.stats[stat] || 0;
      minStats[stat] = Math.max(minStats[stat] || 0, val);
    }
  });
  return minStats;
}


// Update build point display
function updateRemainingPoints() {
  const currentLevel = characterData.currentLevel;
  const total = parseInt(document.getElementById("build-points").value) || 0;
  const minStats = getMinimumStatsFromPreviousLayers();

  const spendableStatIDs = [
    "strength", "health", "armor",
    "lores", "tracking", "gather"
  ];

  let spent = 0;

  spendableStatIDs.forEach(id => {
    const currentVal = parseInt(document.getElementById(id).value) || 0;
    const lockedVal = minStats[id] || 0;

    if (currentVal < lockedVal) {
      document.getElementById(id).value = lockedVal;
      return;
    }

    for (let val = lockedVal + 1; val <= currentVal; val++) {
      spent += getPointCost(currentLevel, val);
    }
  });

  const remaining = total - spent;
  document.getElementById("remaining-points").textContent = `Remaining Points: ${remaining}`;
}


function getLockedAbilities() {
  const locked = new Set();
  characterData.layers.forEach(layer => {
    layer.abilities.forEach(a => locked.add(a));
  });
  return locked;
}


// Race bonus logic (can be expanded per race)
const racialBonuses = {
  grunt: { body: 2, spirit: 1, strength: 1 },
  elf: { mind: 2, spirit: 1 },
  human: { body: 1, mind: 1, spirit: 1 },
  halfling: { spirit: 2, mind: 1 },
  orc: { body: 3 },
};

function applyRaceBonuses(race) {
  const bonuses = racialBonuses[race] || {};
  if ("body" in bonuses) document.getElementById("body").value = bonuses.body;
  if ("spirit" in bonuses) document.getElementById("spirit").value = bonuses.spirit;
  if ("mind" in bonuses) document.getElementById("mind").value = bonuses.mind;
  if ("strength" in bonuses) document.getElementById("strength").value = bonuses.strength || 0;

  ["health", "armor", "lores", "tracking", "gather"].forEach(id => {
    document.getElementById(id).value = 0;
  });

  updateRemainingPoints();
}

// Listen for stat changes
["body", "mind", "spirit", "build-points"].forEach(id =>
  document.getElementById(id).addEventListener("input", updateRemainingPoints)
);

// Reapply bonuses on race change
document.getElementById("race").addEventListener("change", e => {
  applyRaceBonuses(e.target.value);
  updateRemainingPoints();
});

// EXPORT character to JSON
document.getElementById("export-character").addEventListener("click", () => {
  const get = id => document.getElementById(id)?.value || "";

  const character = {
    playerName: get("player-name"),
    characterName: get("character-name"),
    race: get("race"),
    buildPoints: get("build-points"),
    stats: {
      body: get("body"),
      mind: get("mind"),
      spirit: get("spirit"),
      strength: get("strength"),
      health: get("health"),
      armor: get("armor"),
      lores: get("lores"),
      tracking: get("tracking"),
      gather: get("gather"),
    },
    proficiencies: [
      get("weapon-prof1"),
      get("weapon-prof2"),
    ],
    abilities: Array.from(document.getElementById("abilities").selectedOptions).map(opt => opt.value),
    binding: {
      school: "N/A",
      slots: "N/A",
      equipment: "N/A",
    }
  };

  const blob = new Blob([JSON.stringify(character, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = (character.characterName || "character") + "_data.json";
  a.click();
});

// IMPORT character from JSON
// Trigger file input when "Import" button is clicked
document.getElementById("load-character").addEventListener("click", () => {
  document.getElementById("import-character").click();
});

// Handle file selection
document.getElementById("import-character").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) {
    alert("Please select a valid .json character file.");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const c = JSON.parse(e.target.result);

      // Basic Info
      document.getElementById("player-name").value = c.playerName || "";
      document.getElementById("character-name").value = c.characterName || "";
      document.getElementById("race").value = c.race || "grunt";
      document.getElementById("build-points").value = c.buildPoints || 0;

      // Core + Substats
      const s = c.stats || {};
      const statFields = [
        "body", "mind", "spirit",
        "strength", "health", "armor",
        "lores", "tracking", "gather"
      ];
      statFields.forEach(id => {
        if (s[id] !== undefined) {
          document.getElementById(id).value = s[id];
        }
      });

      // Proficiencies
      document.getElementById("weapon-prof1").value = c.proficiencies?.[0] || "";
      document.getElementById("weapon-prof2").value = c.proficiencies?.[1] || "";

      // Abilities (multi-select)
      const abilitySelect = document.getElementById("abilities");
      const selected = new Set(c.abilities || []);
      Array.from(abilitySelect.options).forEach(opt => {
        opt.selected = selected.has(opt.value);
      });

      // Recalculate build points
      updateRemainingPoints();

      alert("Character successfully imported!");
    } catch (err) {
      console.error("Import failed:", err);
      alert("Failed to load character. Please make sure it's a valid .json file.");
    }

    // Clear the file input so the same file can be selected again if needed
    document.getElementById("import-character").value = "";
  };

  reader.readAsText(file);
});

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("build-points").value = 50;
  characterData.currentLevel = 1;
  updateLevelDisplay();
  updateRemainingPoints();
});

function renderLayerHistory() {
  const historyDiv = document.getElementById("layer-history");
  historyDiv.innerHTML = ""; // clear previous render

  characterData.layers.forEach(layer => {
    const layerDiv = document.createElement("div");
    layerDiv.className = "layer-card";

    const stats = Object.entries(layer.stats)
      .filter(([_, val]) => val > 0)
      .map(([key, val]) => `${key}: ${val}`);

    const abilities = layer.abilities.length > 0
      ? layer.abilities
      : ["(none)"];

    layerDiv.innerHTML = `
      <h3>Level ${layer.level}</h3>
      <ul>
        <li><strong>Build Points:</strong> ${layer.buildPoints}</li>
        <li><strong>Stats:</strong> ${stats.join(", ")}</li>
        <li><strong>Abilities:</strong> ${abilities.join(", ")}</li>
      </ul>
    `;

    historyDiv.appendChild(layerDiv);
  });
}

