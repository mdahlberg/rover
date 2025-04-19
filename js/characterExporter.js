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
    console.warn("Now to export the PDF");
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
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    const W = doc.internal.pageSize.width;
    const H = doc.internal.pageSize.height;
    let y = 50;
  
    // 1) PARCHMENT BACKGROUND
    doc.setFillColor(245, 222, 179);   // wheat‑like
    doc.rect(0, 0, W, H, 'F');
  
    // 2) SET SERIF “OLD” FONT
    doc.setFont('times', 'normal');
    doc.setTextColor(60, 30, 0);       // dark brown
  
    // 3) TITLE WITH ROMAN NUMERAL FRAME
    doc.setFontSize(24);
    doc.setFont('times', 'bolditalic');
    doc.text('~ Roles of the Valiant ~', W/2, y, { align: 'center' });
    y += 30;
  
    // Decorative rule
    doc.setLineWidth(1);
    doc.setDrawColor(150, 75, 0);
    doc.line(40, y, W-40, y);
    y += 20;
  
    // helper: section header
    function section(num, title) {
      doc.setFontSize(14);
      doc.setFont('times', 'bold');
      doc.text(`${num}. ${title}`,  Fifty(), y);
      y += 18;
      doc.setFont('times', 'normal');
    }
    function Fifty() { return 50; }
  
    // helper: key/value list
    function kvList(obj) {
      doc.setFontSize(11);
      for (const [k, v] of Object.entries(obj)) {
        doc.text(`• ${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`, 70, y);
        y += 14;
      }
      y += 10;
    }
  
    // 4) CHARACTER INFO
    section('I', 'Character Info');
    kvList(snapshot.characterInfo || {});
  
    // 5) STATS
    section('II', 'Attributes');
    doc.autoTable({
      startY: y,
      margin: { left: 60, right: 40 },
      head: [['Attribute','Value']],
      body: Object.entries(snapshot.stats || {}),
      headStyles: {
        fillColor: [222, 184, 135],    // burlywood
        textColor: [60,30,0],
        fontStyle: 'bold'
      },
      styles: {
        font: 'times',
        textColor: [60,30,0],
        cellPadding: 4,
        fontSize: 10,
        lineColor: [150,75,0],
        lineWidth: 0.5
      },
      theme: 'grid'
    });
    y = doc.lastAutoTable.finalY + 20;
  
    // 6) ABILITIES
    section('III', 'Abilities & Proficiencies');
    // Abilities table
    doc.autoTable({
      startY: y,
      margin: { left: 60, right: 40 },
      head: [['Ability','Rank']],
      body: Object.entries(snapshot.abilities || {}),
      headStyles: { fillColor: [222,184,135], textColor: [60,30,0], fontStyle: 'bold' },
      styles: { font: 'times', textColor: [60,30,0], cellPadding: 4, fontSize: 10, lineColor: [150,75,0], lineWidth: 0.5 },
      theme: 'grid'
    });
    y = doc.lastAutoTable.finalY + 10;
  
    // Inline proficiencies
    const profs = Object.keys(snapshot.proficiencies||{}).filter(k=>snapshot.proficiencies[k]);
    if (profs.length) {
      doc.setFontSize(11);
      doc.text('Proficiencies: ' + profs.map(w=>w.replace('_',' ')).join(', '), 70, y);
      y += 24;
    } else {
      y += 10;
    }
  
    // 7) LORES
    section('IV', 'Lores');
    doc.autoTable({
      startY: y,
      margin: { left: 60, right: 40 },
      head: [['Lore','Rank']],
      body: Object.entries(snapshot.lores || {}),
      headStyles: { fillColor: [222,184,135], textColor: [60,30,0], fontStyle: 'bold' },
      styles: { font: 'times', textColor: [60,30,0], cellPadding: 4, fontSize: 10, lineColor: [150,75,0], lineWidth: 0.5 },
      theme: 'grid'
    });
    y = doc.lastAutoTable.finalY + 20;
  
    // 8) ESSENCE SLOTS
    section('V', 'Essence Slots');
    doc.autoTable({
      startY: y,
      margin: { left: 60, right: 40 },
      head: [['Slot','Used']],
      body: Object.entries(snapshot.essenceSlots || {}),
      headStyles: { fillColor: [222,184,135], textColor: [60,30,0], fontStyle: 'bold' },
      styles: { font: 'times', textColor: [60,30,0], cellPadding: 4, fontSize: 10, lineColor: [150,75,0], lineWidth: 0.5 },
      theme: 'grid'
    });
    y = doc.lastAutoTable.finalY + 20;
  
    // 9) BUILD POINTS
    section('VI', 'Build Points');
    kvList(snapshot.bp || {});
  
    // 10) FOOTER
    doc.setFontSize(8);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 50, H - 30);
    doc.text(`Page 1`, W - 60, H - 30);
  
    // 11) SAVE
    const fname = (snapshot.characterInfo?.name || 'character') + '_chronicle.pdf';
    doc.save(fname);
  }
};
