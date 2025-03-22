// Update build point display
function updateRemainingPoints() {
  const total = parseInt(document.getElementById("build-points").value) || 0;
  const spent = ["body", "mind", "spirit"]
    .map(id => parseInt(document.getElementById(id).value) || 0)
    .reduce((a, b) => a + b, 0);
  document.getElementById("remaining-points").textContent = `Remaining Points: ${total - spent}`;
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
document.getElementById("load-character").addEventListener("click", () => {
  const fileInput = document.getElementById("import-character");
  if (fileInput.files.length === 0) return alert("Please select a file.");

  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const c = JSON.parse(event.target.result);

      // Top-level fields
      document.getElementById("player-name").value = c.playerName || "";
      document.getElementById("character-name").value = c.characterName || "";
      document.getElementById("race").value = c.race || "grunt";
      document.getElementById("build-points").value = c.buildPoints || 0;

      // Stats
      const s = c.stats || {};
      [
        "body", "mind", "spirit",
        "strength", "health", "armor",
        "lores", "tracking", "gather"
      ].forEach(id => {
        if (s[id] !== undefined) document.getElementById(id).value = s[id];
      });

      // Proficiencies
      document.getElementById("weapon-prof1").value = c.proficiencies?.[0] || "";
      document.getElementById("weapon-prof2").value = c.proficiencies?.[1] || "";

      // Abilities
      const abilities = c.abilities || [];
      Array.from(document.getElementById("abilities").options).forEach(opt => {
        opt.selected = abilities.includes(opt.value);
      });

      updateRemainingPoints();
      alert("Character imported!");
    } catch (e) {
      console.error("Import failed:", e);
      alert("Invalid character file.");
    }
  };

  reader.readAsText(fileInput.files[0]);
});
