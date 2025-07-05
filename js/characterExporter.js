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
      startingBonuses: structuredClone(Stats.startingBonuses),
      lockedStats: structuredClone(Stats.lockedStats),

      abilities: structuredClone(Abilities.purchasedAbilities),
      currentLayerAbilities: structuredClone(Abilities.currentLayerPurchasedAbilities),

      proficiencies: structuredClone(Proficiencies.purchasedProficiencies),
      currentLayerProficiencies: structuredClone(Proficiencies.currentLayerPurchasedProficiencies),

      lores: structuredClone(Lores.purchasedLores),
      currentLayerLores: structuredClone(Lores.currentLayerPurchasedLores),
      customLores: structuredClone(Lores.getCustomLores()),

      essenceSlots: structuredClone(EssenceSlots.purchasedEssences),
      currentLayerEssences: structuredClone(EssenceSlots.currentLayerPurchasedEssences),

      bp: {
        earned: BPLeveling.earnedBP,
        spent: Layers.getTotalPointsSpent(),
        remaining: Layers.getRemainingPoints(),
      },

      currentLevel: Layers.getCurrentLevel(),
      layers: structuredClone(Layers.layers),
      currentLayer: structuredClone(Layers.currentLayer),

      race: sessionStorage.getItem(Constants.SELECTED_RACE),
      raceDetails: window.Races?.[sessionStorage.getItem(Constants.SELECTED_RACE)] || null,
      racialLocks: {
        proficiencies: Array.from(window.RacialLocks?.proficiencies || []),
        abilities: Array.from(window.RacialLocks?.abilities || []),
        lores: Array.from(window.RacialLocks?.lores || []),
      },

      essencePath: sessionStorage.getItem(Constants.ESSENCE_PATH),
      essenceElement: sessionStorage.getItem(Constants.ESSENCE_ELEMENT),

      discountedAbilities: Object.entries(Abilities.availableAbilities)
        .filter(([_, a]) => a?.discount != null)
        .map(([id, a]) => ({ id, discount: a.discount })),

      morphAbilities: Object.entries(Abilities.availableAbilities)
        .filter(([_, a]) => a?.isMorph === true)
        .map(([id, a]) => id),

      esperAbilities: Object.entries(Abilities.availableAbilities)
        .filter(([_, a]) => a?.isEsper === true)
        .map(([id, a]) => id),

      characterInfo: {
        name: sessionStorage.getItem(Constants.CHAR_NAME),
        description: sessionStorage.getItem(Constants.CHAR_DESC),
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
    exportCharacterPDF(snapshot);
  },

  importSnapshot(snapshot) {
    console.log("Importing snapshot");

    if (!snapshot || snapshot.schema !== "v1") {
      alert("Invalid or incompatible snapshot file.");
      return;
    }

    // Clear existing data
    console.log("Clearing local storage and in-memory locks...");
    sessionStorage.clear();
    window.RacialLocks = {};

    // ✅ Restore character identity
    sessionStorage.setItem(Constants.SELECTED_RACE, snapshot.race || "");
    sessionStorage.setItem(Constants.CHAR_NAME, snapshot.characterInfo?.name || "");
    sessionStorage.setItem(Constants.CHAR_DESC, snapshot.characterInfo?.description || "");

    sessionStorage.setItem(Constants.ESSENCE_PATH, snapshot.essencePath || "");
    sessionStorage.setItem(Constants.ESSENCE_ELEMENT, snapshot.essenceElement || "");

    // ✅ Restore racial locks
    const racial = snapshot.racialLocks || {};
    sessionStorage.setItem(Constants.RACIAL_ABILITIES, JSON.stringify(racial.abilities || []));
    sessionStorage.setItem(Constants.RACIAL_PROFS, JSON.stringify(racial.proficiencies || []));
    sessionStorage.setItem(Constants.RACIAL_LORES, JSON.stringify(racial.lores || []));
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
    Stats.startingBonuses = structuredClone(snapshot.startingBonuses || {});
    Stats.currentStats = structuredClone(snapshot.stats || {});
    Stats.currentLayerStats = structuredClone(snapshot.currentLayerStats || {});
    Stats.lockedStats = structuredClone(snapshot.lockedStats || {});

    if (!window.MorphLocks) {
      window.MorphLocks = new Set();
    }

    // Morph abilities
    if (snapshot.morphAbilities && Array.isArray(snapshot.morphAbilities)) {
      for (let id of snapshot.morphAbilities) {
        // Strip "morph_" prefix if present
        if (id.startsWith("morph_")) {
          id = id.slice(6); // remove first 6 characters
        }

        const morphAbility = window.MorphAbilities[id];
        if (morphAbility) {
          abilityKey = `morph_${id}`;
          // Re-add to available abilities with isMorph tag
          window.Abilities.availableAbilities[abilityKey] = { ...morphAbility, isMorph: true };
          // ✅ Add to MorphLocks to prevent refunding
          window.MorphLocks.add(abilityKey);
        } else {
          console.warn(`Skipped morph ability ${id} during import: not found in MorphAbilities.`);
        }
      }
    }

    // Esper abilities
    // TODO make extendable
    if (snapshot.esperAbilities && Array.isArray(snapshot.esperAbilities)) {
      for (let id of snapshot.esperAbilities) {
        // Strip "eper_" prefix if present
        const esperAbility = window.esperAbilities[id];
        if (esperAbility) {
          abilityKey = `${id}`;
          // Re-add to available abilities
          window.Abilities.availableAbilities[abilityKey] = { ...esperAbility, isEsper: true };
        } else {
          console.warn(`Skipped esper ability ${id} during import: not found in Esper Abilities.`);
        }
      }
    }

    // ✅ Abilities
    Abilities.purchasedAbilities = structuredClone(snapshot.abilities || {});
    Abilities.currentLayerPurchasedAbilities = structuredClone(snapshot.currentLayerAbilities || {});

    // ✅ Proficiencies
    Proficiencies.purchasedProficiencies = structuredClone(snapshot.proficiencies || {});
    Proficiencies.currentLayerPurchasedProficiencies = structuredClone(snapshot.currentLayerProficiencies || {});

    // ✅ Lores
    Lores.purchasedLores = structuredClone(snapshot.lores || {});
    Lores.currentLayerPurchasedLores = structuredClone(snapshot.currentLayerLores || {});

    const customLores = structuredClone(snapshot.customLores);
    for (const customLore of customLores) {
      console.log("Adding custom lore to list of available lores: ", customLore.id);
      Lores.availableLores.push(customLore);
    }

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
};
