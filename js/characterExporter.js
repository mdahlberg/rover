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
      customLores: structuredClone(Lores.getCustomLores()),

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

      essencePath: localStorage.getItem(Constants.ESSENCE_PATH),
      essenceElement: localStorage.getItem(Constants.ESSENCE_ELEMENT),

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

    localStorage.setItem(Constants.ESSENCE_PATH, snapshot.essencePath || "");
    localStorage.setItem(Constants.ESSENCE_ELEMENT, snapshot.essenceElement || "");

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

  exportAsPDF: function(snapshot) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const m = 40;            // margin
    let y = m;

    // — Header Title —
    doc.setFontSize(20).setTextColor('#4A90E2')
       .text('Character Chronicle', W/2, y, { align: 'center' });
    y += 30;

    // — Line 1: Name, Race, Date —
    doc.setFontSize(12).setTextColor('#000');
    const nameY = y;
    doc.text(`Name: ${snapshot.characterInfo.name || '—'}`, m, nameY);
    doc.text(`Race: ${snapshot.race || '—'}`, m+250, nameY);
    doc.text(
      `Date: ${new Date(snapshot.timestamp).toLocaleString()}`,
      W - m, nameY,
      { align: 'right' }
    );

    // — Line 2+: Description (wrapped to page width) —
    y += 20;
    const rawDesc = snapshot.characterInfo.description || '—';
    const descLines = doc.splitTextToSize(
      `Description: ${rawDesc}`,
      W - 2*m           // wrap to within left & right margins
    );
    doc.text(descLines, m, y);
    y += descLines.length * 12 + 10;  // advance y by number of lines × line‑height

    // — Stats —
    doc.autoTable({
      startY: y,
      margin: { left: m, right: m },
      head: [['Stat','Value']],
      body: Object.entries(snapshot.stats||{}).map(([k,v])=>[
        k[0].toUpperCase()+k.slice(1), v
      ]),
      theme: 'grid',
      headStyles: { fillColor:[74,144,226] },
      styles: { fontSize: 10 }
    });
    y = doc.lastAutoTable.finalY + 15;

    // — Abilities —
    doc.autoTable({
      startY: y,
      margin: { left: m, right: m },
      head: [['Ability','Rank']],
      body: Object.entries(snapshot.abilities||{}).map(([id,rank])=>[
        id.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()), rank
      ]),
      theme: 'grid',
      headStyles: { fillColor:[74,144,226] },
      styles: { fontSize: 10 }
    });
    y = doc.lastAutoTable.finalY + 15;

    // — Lores —
    doc.autoTable({
      startY: y,
      margin: { left: m, right: m },
      head: [['Lore','Rank']],
      body: Object.entries(snapshot.lores||{}).map(([id,lvl])=>[
        id.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()), lvl
      ]),
      theme: 'grid',
      headStyles: { fillColor:[74,144,226] },
      styles: { fontSize: 10 }
    });
    y = doc.lastAutoTable.finalY + 15;

    // — Proficiencies —
    doc.autoTable({
      startY: y,
      margin: { left: m, right: m },
      head: [['Proficiency','Owned']],
      body: Object.entries(snapshot.proficiencies||{}).map(([id,own])=>[
        id.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()), own ? 'Yes' : 'No'
      ]),
      theme: 'grid',
      headStyles: { fillColor:[74,144,226] },
      styles: { fontSize: 10 }
    });
    y = doc.lastAutoTable.finalY + 15;

    // — Essence Slots —
    const slotRows = Object.entries(snapshot.essenceSlots||{})
      .filter(([,c])=>c>0)
      .map(([lvl,c])=>[
        lvl==='master' ? 'Master Slot' : `Level ${lvl}`, c
      ]);
    if (slotRows.length) {
      doc.autoTable({
        startY: y,
        margin: { left: m, right: m },
        head: [['Essence Slot','Total']],
        body: slotRows,
        theme: 'grid',
        headStyles: { fillColor:[74,144,226] },
        styles: { fontSize: 10 }
      });
      y = doc.lastAutoTable.finalY + 15;
    }

    // — Build Points —
    doc.setFontSize(12).setTextColor('#000')
       .text('Build Points:', m, y)
       .text(`Earned: ${snapshot.bp.earned}`, m+100, y)
       .text(`Spent: ${snapshot.bp.spent}`, m+200, y)
       .text(`Remaining: ${snapshot.bp.remaining}`, m+320, y);
    y += 25;

    // — Layer History —
    if (snapshot.layers && snapshot.layers.length) {
      doc.setFontSize(14).setTextColor('#4A90E2')
         .text('Layer History', m, y);
      y += 18;
      doc.setFontSize(10).setTextColor('#000');

      snapshot.layers.forEach((layer,i) => {
        // page break if needed
        if (y > H - m - 60) {
          doc.addPage();
          y = m;
        }

        // Layer title
        doc.setFontSize(12).text(`Layer ${i+1}`, m, y);
        y += 14;
        doc.setFontSize(10);

        // bullet-list of properties
        const lines = [
          'Stats: ' + Object.entries(layer.stats||{}).map(([k,v])=>`${k[0].toUpperCase()+k.slice(1)}:${v}`).join(', '),
          'Abilities: ' + (Object.entries(layer.abilities||{}).length
            ? Object.entries(layer.abilities).map(([k,v])=>`${k.replace(/_/g,' ')} (${v})`).join(', ')
            : 'None'),
          'Lores: ' + (Object.entries(layer.lores||{}).length
            ? Object.entries(layer.lores).map(([k,v])=>`${k.replace(/_/g,' ')} (${v})`).join(', ')
            : 'None'),
          'Essence Slots: ' + (Object.entries(layer.essenceSlots||{})
            .filter(([,c])=>c>0)
            .map(([lvl,c])=>`${lvl==='master'?'Master':lvl}:${c}`)
            .join(', ') || 'None')
        ];
        lines.forEach(line => {
          doc.text(`• ${line}`, m + 10, y);
          y += 12;
        });
        y += 8;
      });
    }

    // — Save PDF —
    const fname = (snapshot.characterInfo.name||'character')
      .replace(/\s+/g,'_').toLowerCase() + '_report.pdf';
    doc.save(fname);
  },
};
