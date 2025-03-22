// Auto-apply racial bonuses
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

  // Optional: Clear substats if needed
  ["health", "armor", "lores", "tracking", "gather"].forEach(id => {
    document.getElementById(id).value = 0;
  });

  updateRemainingPoints();
}

// Calculate Remaining Build Points
function updateRemainingPoints() {
  const total = parseInt(document.getElementById("build-points").value) || 0;
  const spent = ["body", "mind", "spirit"]
    .map(id => parseInt(document.getElementById(id).value) || 0)
    .reduce((a, b) => a + b, 0);
  document.getElementById("remaining-points").textContent = `Remaining Points: ${total - spent}`;
}

document.getElementById("race").addEventListener("change", e => {
  applyRaceBonuses(e.target.value);
  console.log(e.target.value)
  updateRemainingPoints();
});

["body", "mind", "spirit", "build-points"].forEach(id =>
  document.getElementById(id).addEventListener("input", updateRemainingPoints)
);

// Export character
document.getElementById("export-character").addEventListener("click", () => {
  const character = {
    playerName: document.getElementById("player-name").value,
    characterName: document.getElementById("character-name").value,
    buildPoints: document.getElementById("build-points").value,
    stats: {
      body: document.getElementById("body").value,
      strength: document.getElementById("strength").value,
      health: document.getElementById("health").value,
      armor: document.getElementById("armor").value,
      mind: document.getElementById("mind").value,
      lores: document.getElementById("lores").value,
      tracking: document.getElementById("tracking").value,
      spirit: document.getElementById("spirit").value,
      gather: document.getElementById("gather").value,
    },
    race: document.getElementById("race").value,
    proficiencies: [
      document.getElementById("weapon-prof1").value,
      document.getElementById("weapon-prof2").value,
    ],
    abilities: Array.from(document.getElementById("abilities").selectedOptions).map(opt => opt.value),
  };

  const blob = new Blob([JSON.stringify(character, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = (character.characterName || "character") + "_data.json";
  a.click();
});

// Import character
document.getElementById("load-character").addEventListener("click", () => {
  const fileInput = document.getElementById("import-character");
  if (fileInput.files.length === 0) return alert("Please select a file.");

  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const c = JSON.parse(event.target.result);
      document.getElementById("player-name").value = c.playerName || "";
      document.getElementById("character-name").value = c.characterName || "";
      document.getElementById("build-points").value = c.buildPoints || 0;

      const s = c.stats || {};
      ["body", "mind", "spirit", "strength", "health", "armor", "lores", "tracking", "gather"].forEach(id => {
        if (s[id] !== undefined) document.getElementById(id).value = s[id];
      });

      document.getElementById("race").value = c.race || "grunt";
      applyRaceBonuses(c.race);

      document.getElementById("weapon-prof1").value = c.proficiencies?.[0] || "";
      document.getElementById("weapon-prof2").value = c.proficiencies?.[1] || "";

      Array.from(document.getElementById("abilities").options).forEach(opt => {
        opt.selected = c.abilities?.includes(opt.value) || false;
      });

      updateRemainingPoints();
      alert("Character imported!");
    } catch {
      alert("Failed to load character file.");
    }
  };
  reader.readAsText(fileInput.files[0]);
});
