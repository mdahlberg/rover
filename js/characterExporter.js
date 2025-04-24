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
    // 1) Setup container
    const container = document.createElement('div');
    Object.assign(container.style, {
      position: 'fixed',
      top: '5%',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '800px',
      padding: '20px',
      background: '#fff',
      fontFamily: 'Arial, sans-serif',
      color: '#333',
      zIndex: 9999,
      boxShadow: '0 0 10px rgba(0,0,0,0.3)',
      overflow: 'visible'
    });
    document.body.appendChild(container);
  
    // 2) Title
    container.innerHTML = `
      <h1 style="
        text-align:center;
        color:#4A90E2;
        margin:0 0 8px;
        font-size:26px;
      ">Character Chronicle</h1>
      <hr style="border:1px solid #eee; margin-bottom:16px;" />
    `;
  
    // 3) Tiny Radar Chart for Stats
    const statsCanvas = document.createElement('canvas');
    statsCanvas.width  = 300;
    statsCanvas.height = 160;
    container.appendChild(statsCanvas);
  
    const statKeys   = Object.keys(snapshot.stats || {});
    const statValues = statKeys.map(k => snapshot.stats[k] || 0);
  
    new Chart(statsCanvas.getContext('2d'), {
      type: 'radar',
      data: {
        labels: statKeys.map(s => s[0].toUpperCase() + s.slice(1)),
        datasets: [{
          data: statValues,
          backgroundColor: 'rgba(74,144,226,0.2)',
          borderColor: '#4A90E2',
          borderWidth: 2,
          pointBackgroundColor: '#4A90E2'
        }]
      },
      options: {
        animation: false,
        scales: {
          r: {
            beginAtZero: true,
            max: Math.max(...statValues, 1) + 1
          }
        },
        plugins: { legend: { display: false } },
        layout: { padding: { top: 10, bottom: 10 } }
      }
    });
  
    // 4) Compact Bar Chart for Abilities
    const abilCanvas = document.createElement('canvas');
    abilCanvas.width  = 300;
    abilCanvas.height = 120;
    container.appendChild(abilCanvas);
  
    const abilityKeys   = Object.keys(snapshot.abilities || {});
    const abilityRanks  = abilityKeys.map(k => snapshot.abilities[k] || 0);
    const discountedIds = (snapshot.discountedAbilities || []).map(d => d.id);
  
    new Chart(abilCanvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: abilityKeys.map(n =>
          n.replace(/_/g, ' ')
           .replace(/\b\w/g, c => c.toUpperCase())
        ),
        datasets: [{
          data: abilityRanks,
          backgroundColor: abilityKeys.map(k =>
            discountedIds.includes(k)
              ? 'rgba(226,74,74,0.6)'
              : 'rgba(74,144,226,0.6)'
          ),
          borderColor: abilityKeys.map(k =>
            discountedIds.includes(k) ? '#E24A4A' : '#4A90E2'
          ),
          borderWidth: 1
        }]
      },
      options: {
        animation: false,
        indexAxis: 'y',
        scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const id = abilityKeys[ctx.dataIndex];
                const d  = (snapshot.discountedAbilities || [])
                             .find(x => x.id === id);
                return d
                  ? `Rank ${ctx.parsed.x} (${d.discount.factor*100}% off)`
                  : `Rank ${ctx.parsed.x}`;
              }
            }
          }
        },
        layout: { padding: { top: 0, bottom: 0 } }
      }
    });
  
    // 5) Build Points with explicit numbers
    const bp = snapshot.bp || {};
    const bpDiv = document.createElement('div');
    bpDiv.style.margin = '16px 0';
  
    ['earned','spent','remaining'].forEach(metric => {
      const val = bp[metric] || 0;
      const pct = Math.min(val / (bp.earned || 1) * 100, 100);
      const row = document.createElement('div');
      row.style.marginBottom = '6px';
      row.innerHTML = `
        <strong>${metric.charAt(0).toUpperCase() + metric.slice(1)}:</strong>
        <span style="margin:0 8px;">${val}</span>
        <div style="
          display:inline-block;
          width:50%;
          background:#eee;
          vertical-align:middle;
        ">
          <div style="
            width:${pct}%;
            background:#4A90E2;
            color:#fff;
            font-size:10px;
            text-align:center;
            padding:2px 0;
          ">${val}</div>
        </div>
      `;
      bpDiv.appendChild(row);
    });
    container.appendChild(bpDiv);
  
    // 6) Table helper
    function mkTable(title, cols, rows) {
      const sec = document.createElement('div');
      sec.innerHTML = `<h3 style="color:#4A90E2;margin:12px 0 4px;font-size:16px;">
                         ${title}
                       </h3>`;
      const tbl = document.createElement('table');
      Object.assign(tbl.style, {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '16px',
        fontSize: '12px'
      });
      const thead = tbl.createTHead();
      const hr = thead.insertRow();
      cols.forEach(c => {
        const th = document.createElement('th');
        th.textContent = c;
        Object.assign(th.style, {
          border: '1px solid #ddd',
          padding: '6px',
          background: '#f0f8ff',
          textAlign: 'left'
        });
        hr.appendChild(th);
      });
      const tbdy = tbl.createTBody();
      rows.forEach(r => {
        const row = tbdy.insertRow();
        r.forEach(v => {
          const td = row.insertCell();
          td.textContent = v;
          Object.assign(td.style, {
            border: '1px solid #ddd',
            padding: '6px'
          });
        });
      });
      sec.appendChild(tbl);
      container.appendChild(sec);
    }
  
    // 7) Lores w/ origin
    const racialLores = new Set(snapshot.racialLocks?.lores || []);
    mkTable(
      'Lores',
      ['Lore','Rank','Origin'],
      Object.entries(snapshot.lores || {}).map(([l,r]) => [
        l.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),
        r,
        racialLores.has(l) ? 'Racial Bonus' : 'Purchased'
      ])
    );
  
    // 8) Proficiencies w/ racial lock
    mkTable(
      'Proficiencies',
      ['Proficiency','Owned','Racial Lock'],
      Object.entries(snapshot.proficiencies || {}).map(([p,own]) => [
        p.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),
        own ? '✅' : '❌',
        (snapshot.racialLocks?.proficiencies || []).includes(p) ? 'Yes' : 'No'
      ])
    );
  
    // 9) Discounted Abilities
    mkTable(
      'Discounted Abilities',
      ['Ability','Discount','Used'],
      (snapshot.discountedAbilities || []).map(d => [
        d.id.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),
        `${(d.discount.factor*100).toFixed(0)}% off`,
        `${d.discount.used}/${d.discount.uses||'∞'}`
      ])
    );
  
    // 10) Layer History
    if (Array.isArray(snapshot.layers) && snapshot.layers.length) {
      const sec = document.createElement('div');
      sec.innerHTML = `<h3 style="color:#4A90E2;margin:16px 0 4px;font-size:16px;">
                         Layer History
                       </h3>`;
      container.appendChild(sec);
  
      snapshot.layers.forEach((layer, i) => {
        const d = document.createElement('div');
        d.innerHTML = `<h4 style="margin:8px 0 4px;">Layer ${i+1}</h4>`;
        // stats
        const s = layer.stats || {};
        const statsStr = Object.entries(s)
          .map(([k,v]) => `${k.charAt(0).toUpperCase()+k.slice(1)}: ${v}`)
          .join(', ');
        // abilities
        const a = layer.abilities || {};
        const abilsStr = Object.entries(a)
          .map(([k,v]) => `${k.replace(/_/g,' ')} (${v})`)
          .join(', ') || 'None';
        // proficiencies
        const p = layer.proficiencies || {};
        const profsStr = Object.keys(p)
          .filter(k=>p[k])
          .map(k=>k.replace(/_/g,' '))
          .join(', ') || 'None';
        // lores
        const l = layer.lores || {};
        const loresStr = Object.entries(l)
          .map(([k,v])=>`${k.replace(/_/g,' ')} (${v})`)
          .join(', ') || 'None';
        // essenceSlots
        const e = layer.essenceSlots || {};
        const essStr = Object.entries(e)
          .filter(([,v])=>v>0)
          .map(([k,v])=>`${k}: ${v}`)
          .join(', ') || 'None';
        // bpSnapshot
        const b = layer.bpSnapshot || {};
        const bpStr = `Earned: ${b.earned}, Spent: ${b.spent}, Remaining: ${b.remaining}`;
  
        d.innerHTML += `
          <p style="margin:2px 0;"><strong>Stats:</strong> ${statsStr}</p>
          <p style="margin:2px 0;"><strong>Abilities:</strong> ${abilsStr}</p>
          <p style="margin:2px 0;"><strong>Proficiencies:</strong> ${profsStr}</p>
          <p style="margin:2px 0;"><strong>Lores:</strong> ${loresStr}</p>
          <p style="margin:2px 0;"><strong>Essence Slots:</strong> ${essStr}</p>
          <p style="margin:2px 0;"><strong>BP Snapshot:</strong> ${bpStr}</p>
        `;
        container.appendChild(d);
      });
    }
  
    // 11) Snapshot & download
    setTimeout(() => {
      html2canvas(container, { scale: 2 }).then(canvas => {
        const link = document.createElement('a');
        link.download = `${snapshot.characterInfo.name || 'character'}_report.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        document.body.removeChild(container);
      });
    }, 200);
  }
};

