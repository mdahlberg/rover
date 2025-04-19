window.CharacterExporter = {
  exportSnapshot: function () {
    const snapshot = {
      schema: "v1",
      timestamp: new Date().toISOString(),

      // Global Stats
      stats: structuredClone(Stats.currentStats),
      // Current Stats
      currentLayerStats: structuredClone(Stats.currentLayerStats),
      startingStats: structuredClone(Stats.startingStats),
      lockedStats: structuredClone(Stats.lockedStats),

      abilities: structuredClone(Abilities.purchasedAbilities),
      currentLayerAbilities: structuredClone(Abilities.currentLayerPurchasedAbilities),

      proficiencies: structuredClone(Proficiencies.purchasedProficiencies),
      currentLayerProficiencies: structuredClone(Proficiencies.currentLayerPurchasedProficiencies),

      lores: structuredClone(Lores.purchasedLores),
      currentLayerLores: structuredClone(Lores.currentLayerPurchasedLores),

      essenceSlots: structuredClone(EssenceSlots.purchasedEssences),
      currentLayerEssences: structuredClone(EssenceSlots.currentLayerPurchasedEssences),

      bp: {
        earned: BPLeveling.earnedBP,
        spent: Layers.getTotalPointsSpent(),
        remaining: Layers.getRemainingPoints(),
      },

      layers: structuredClone(Layers.layers),
      currentLayer: structuredClone(Layers.currentLayer),

      race: localStorage.getItem(Constants.SELECTED_RACE),
      raceDetails: window.Races?.[localStorage.getItem(Constants.SELECTED_RACE)] || null,
      racialLocks: {
        proficiencies: Array.from(window.RacialLocks?.proficiencies || []),
        abilities: Array.from(window.RacialLocks?.abilities || []),
        lores: Array.from(window.RacialLocks?.lores || []),
      },

      discountedAbilities: Object.entries(Abilities.availableAbilities)
        .filter(([_, a]) => a?.discount != null)
        .map(([id, a]) => ({ id, discount: a.discount })),

      characterInfo: {
        name: localStorage.getItem(Constants.CHAR_NAME),
        description: localStorage.getItem(Constants.CHAR_DESC),
      },
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "");
    a.href = url;
    a.download = `character_snapshot_${timestamp}.json`;
    a.click();
    URL.revokeObjectURL(url);

    // 💾 Also generate PDF report
    this.exportAsPDF(snapshot);
  },

  importSnapshot(snapshot) {
    console.log("Importing snapshot");
  
    if (!snapshot || snapshot.schema !== "v1") {
      alert("Invalid or incompatible snapshot file.");
      return;
    }
  
    // Clear existing data
    console.log("Clearing local storage and in-memory locks...");
    localStorage.clear();
    window.RacialLocks = {};
  
    // ✅ Restore character identity
    localStorage.setItem(Constants.SELECTED_RACE, snapshot.race || "");
    localStorage.setItem(Constants.CHAR_NAME, snapshot.characterInfo?.name || "");
    localStorage.setItem(Constants.CHAR_DESC, snapshot.characterInfo?.description || "");
  
    // ✅ Restore racial locks
    const racial = snapshot.racialLocks || {};
    localStorage.setItem(Constants.RACIAL_ABILITIES, JSON.stringify(racial.abilities || []));
    localStorage.setItem(Constants.RACIAL_PROFS, JSON.stringify(racial.proficiencies || []));
    localStorage.setItem(Constants.RACIAL_LORES, JSON.stringify(racial.lores || []));
    // Discount handling is optional — if present
    (snapshot.discountedAbilities || []).forEach(({ id, discount }) => {
      if (Abilities.availableAbilities[id]) {
        Abilities.availableAbilities[id].discount = discount;
      }
    });

    // ✅ BP
    if (snapshot.bp?.earned != null) {
      BPLeveling.earnedBP = snapshot.bp.earned;
    }
  
    // ✅ Stats
    Stats.startingStats = structuredClone(snapshot.startingStats || {});
    Stats.currentStats = structuredClone(snapshot.stats || {});
    Stats.currentLayerStats = structuredClone(snapshot.currentLayerStats || {});
    Stats.lockedStats = structuredClone(snapshot.lockedStats || {});
  
    // ✅ Abilities
    Abilities.purchasedAbilities = structuredClone(snapshot.abilities || {});
    Abilities.currentLayerPurchasedAbilities = structuredClone(snapshot.currentLayerAbilities || {});
  
    // ✅ Proficiencies
    Proficiencies.purchasedProficiencies = structuredClone(snapshot.proficiencies || {});
    Proficiencies.currentLayerPurchasedProficiencies = structuredClone(snapshot.currentLayerProficiencies || {});
  
    // ✅ Lores
    Lores.purchasedLores = structuredClone(snapshot.lores || {});
    Lores.currentLayerPurchasedLores = structuredClone(snapshot.currentLayerLores || {});
  
    // ✅ Essence Slots
    EssenceSlots.purchasedEssences = structuredClone(snapshot.essenceSlots || {});
    EssenceSlots.currentLayerPurchasedEssences = structuredClone(snapshot.currentLayerEssences || {});
  
    // ✅ Layers
    Layers.layers = structuredClone(snapshot.layers || []);
    Layers.currentLayer = structuredClone(snapshot.currentLayer || Layers.createNewLayer());
  
    // ✅ Reapply racial bonuses
    initializeRacialLocksFromStorage();
  
    // ✅ UI update
    alert("Snapshot imported successfully!");
    UI.showCharacterPlanner();
  },

  exportAsPDF: function(snapshot) {
    const doc = new jspdf.jsPDF();
    let y = 10;

    const addLine = (text) => {
      doc.text(text, 10, y);
      y += 10;
    };

    // Title
    doc.setFontSize(16);
    addLine("Character Report");
    doc.setFontSize(12);
    addLine("-------------------------");

    // Basic Info
    addLine("Name: " + (snapshot.characterInfo?.name || "Unnamed"));
    addLine("Description: " + (snapshot.characterInfo?.description || ""));
    addLine("Race: " + (snapshot.raceDetails?.name || snapshot.race || "Unknown"));

    addLine("");
    addLine("Stats:");
    for (const [stat, value] of Object.entries(snapshot.stats || {})) {
      addLine("  " + stat.toUpperCase() + ": " + value);
    }

    addLine("");
    addLine("Abilities:");
    for (const [id, count] of Object.entries(snapshot.abilities || {})) {
      if (count > 0) {
        const name = snapshot.availableAbilities?.[id]?.name || id;
        addLine("  " + name + " x" + count);
      }
    }

    addLine("");
    addLine("Proficiencies:");
    for (const [id, owned] of Object.entries(snapshot.proficiencies || {})) {
      if (owned) {
        addLine("  " + id.replace(/_/g, ' '));
      }
    }

    addLine("");
    addLine("Lores:");
    for (const [id, count] of Object.entries(snapshot.lores || {})) {
      if (count > 0) {
        addLine("  " + id.replace(/_/g, ' ') + " x" + count);
      }
    }

    // Download
    doc.save("character_report.pdf");
  }
};

