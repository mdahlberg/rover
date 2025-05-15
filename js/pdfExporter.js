/* PdfExporter.js
 * Generates a Roles of the Valiant character sheet PDF using pdfmake
 * in a pure JS/HTML environment (no npm required).
 * Prerequisite: Include pdfmake & vfs_fonts via CDN before this script:
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.72/pdfmake.min.js"></script>
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.72/vfs_fonts.js"></script>
 */
(function(global) {
  'use strict';

  /**
   * Converts snake_case to Title Case with spaces
   * @param {string} str
   * @returns {string}
   */
  function snakeToTitleCase(str) {
    return str
      .split('_')
      .map(function(seg) {
        if (!seg) return '';
        return seg.charAt(0).toUpperCase() + seg.slice(1).toLowerCase();
      })
      .filter(Boolean)
      .join(' ');
  }

  /**
   * Returns rows for the Essence Slots table (Master & Levels)
   * @param {Object} slotCounts  Mapping of levels 1–10 → counts
   * @returns {Array}            Array of [key, value] rows
   */
  function buildEssenceSlotsContent(slotCounts) {
    var rows = [];
    // Master Binding (level 10)
    rows.push([ 'Master Binding', 'O'.repeat(slotCounts[10] || 0) ]);
    // Levels 9 → 1
    for (var lvl = 9; lvl >= 1; lvl--) {
      rows.push([ 'Level ' + lvl, 'O'.repeat(slotCounts[lvl] || 0) ]);
    }
    return rows;
  }

  /**
   * Main export function
   * @param {Object} snapshot
   */
  function exportCharacterPDF(snapshot) {
    var name          = (snapshot.characterInfo && snapshot.characterInfo.name) || 'Unnamed';
    var desc          = (snapshot.characterInfo && snapshot.characterInfo.description) || '';
    var race          = snapshot.race || '';
    var level         = snapshot.currentLevel || '';
    var essenceSchool = snakeToTitleCase(snapshot.essencePath || '');
    var essenceElem   = snakeToTitleCase(snapshot.essenceElement || '');

    // Prepare data arrays
    var statsEntries = Object.entries(snapshot.stats || {}).map(function(e) {
      return [ snakeToTitleCase(e[0]), e[1] ];
    });
    var bp           = snapshot.bp || {};
    var profNames    = Object.keys(snapshot.proficiencies || {}).map(snakeToTitleCase);
    var abilityItems = Object.entries(snapshot.abilities || {}).map(function(e) {
      return snakeToTitleCase(e[0]) + ' ' + e[1] + '×';
    });
    var loreRows     = Object.entries(snapshot.lores || {}).map(function(e) {
      return [ snakeToTitleCase(e[0]), String(e[1]) ];
    });
    var essRows      = buildEssenceSlotsContent(snapshot.essenceSlots || {});
    var layers       = snapshot.layers || [];

    // Zebra striping layout
    var zebra = {
      fillColor: function(i) { return i % 2 === 0 ? '#F5F5F5' : null; },
      hLineWidth: function() { return 0.5; },
      vLineWidth: function() { return 0.5; }
    };

    // Document definition
    var docDef = {
      pageSize: 'LETTER',
      pageMargins: [40, 40, 40, 60],
      footer: function(currentPage, pageCount) {
        return { text: 'Page ' + currentPage + ' of ' + pageCount, alignment: 'right', style: 'footer' };
      },
      styles: {
        header:        { fontSize: 18, bold: true },
        title:         { fontSize: 16, bold: true },
        sectionHeader: { fontSize: 14, bold: true },
        label:         { fontSize: 12 }
      },
      content: []
    };

    // Header & Name
    docDef.content.push({
      stack: [
        { text: 'Roles of the Valiant', style: 'header', alignment: 'center', margin: [0, 0, 0, 6] },
        { text: name,                    style: 'title',  alignment: 'center', margin: [0, 0, 0, 12] }
      ]
    });

    // Race & Level
    docDef.content.push({
      columns: [
        {
          width: '*',
          text: [ { text: 'Race: ',  bold: true }, snakeToTitleCase(race) ],
          style: 'label'
        },
        {
          width: 'auto',
          text: [ { text: 'Level: ', bold: true }, level ],
          style: 'label', alignment: 'right'
        }
      ], columnGap: 10, margin: [0, 0, 0, 4]
    });

    // Description
    docDef.content.push({
      text: [ { text: 'Description: ', bold: true }, desc || '—' ],
      style: 'label', margin: [0, 0, 0, 15]
    });

    // Build Points
    docDef.content.push({ text: 'Build Points', style: 'sectionHeader' });
    docDef.content.push({
      columns: [
        { text: [ { text: 'Earned: ',    bold: true }, String(bp.earned || 0) ] },
        { text: [ { text: 'Spent: ',     bold: true }, String(bp.spent  || 0) ] },
        { text: [ { text: 'Remaining: ', bold: true }, String(bp.remaining || 0) ] }
      ], columnGap: 20, margin: [0, 0, 0, 15]
    });

    // Core Stats
    docDef.content.push({ text: 'Core Stats', style: 'sectionHeader' });
    docDef.content.push(buildKeyValueTable(statsEntries, zebra));
    docDef.content.push({ text: '', margin: [0, 0, 0, 15] });

    // Proficiencies
    docDef.content.push({ text: 'Proficiencies', style: 'sectionHeader' });
    docDef.content.push(buildMultiColList(profNames, 2));
    docDef.content.push({ text: '', margin: [0, 0, 0, 15] });

    // Abilities
    docDef.content.push({ text: 'Abilities', style: 'sectionHeader' });
    docDef.content.push(buildMultiColList(abilityItems, 2));
    docDef.content.push({ text: '', margin: [0, 0, 0, 15] });

    // Lores
    docDef.content.push({ text: 'Lores', style: 'sectionHeader' });
    docDef.content.push(buildTwoColTable(loreRows, zebra));
    docDef.content.push({ text: '', margin: [0, 0, 0, 15] });

    // Essence Path & Element
    var isCalamity   = snapshot.essencePath?.toLowerCase() === 'calamity';
    var schoolPrefix = isCalamity ? 'The Path of ' : 'The Path of the ';
    docDef.content.push({
      text: [ { text: 'Essence School: ', bold: true }, schoolPrefix + essenceSchool ],
      style: 'label', margin: [0, 0, 0, 4]
    });
    if (isCalamity) {
      docDef.content.push({
        text: [ { text: 'Element: ', bold: true }, essenceElem ],
        style: 'label', margin: [0, 0, 0, 10]
      });
    }

    // Essence Slots (reverted to table format)
    docDef.content.push({ text: 'Essence Slots', style: 'sectionHeader' });
    docDef.content.push(buildTwoColTable(essRows, zebra));
    docDef.content.push({ text: '', margin: [0, 0, 0, 15] });

    // Level History
    docDef.content.push({ text: 'Level History', style: 'sectionHeader' });
    var historyRows = layers.map(function(layer, idx) {
      var statsLine = Object.entries(layer.stats||{}).map(function(p){ return snakeToTitleCase(p[0]) + ':' + p[1]; }).join(', ');
      var abilLine  = Object.keys(layer.abilities||{}).length
        ? Object.entries(layer.abilities).map(function(p){ return snakeToTitleCase(p[0]) + ' (' + p[1] + ')'; }).join(', ')
        : 'None';
      var loreLine  = Object.keys(layer.lores||{}).length
        ? Object.entries(layer.lores).map(function(p){ return snakeToTitleCase(p[0]) + ' (' + p[1] + ')'; }).join(', ')
        : 'None';
      var slotLine  = Object.entries(layer.essenceSlots||{}).filter(function(p){return p[1]>0;}).map(function(p){ return snakeToTitleCase('Level_' + p[0]) + ':' + p[1]; }).join(', ') || 'None';
      var changes   = [
        'Stats: ' + statsLine,
        'Abilities: ' + abilLine,
        'Lores: ' + loreLine,
        'Essence Slots: ' + slotLine
      ].join('\n');
      return [ 'Level ' + (idx + 1), { text: changes } ];
    });
    docDef.content.push(buildTwoColTable(historyRows, zebra));

    // Generate PDF
    pdfMake.createPdf(docDef).download((name.replace(/[^a-z0-9]/gi,'_')||'char') + '-CHAR.pdf');
  }

  // Helper: key/value table
  function buildKeyValueTable(entries, layout) {
    var body = entries.map(function(pair) {
      return [ { text: pair[0] + ':', bold: true }, String(pair[1]) ];
    });
    return { table: { widths: ['auto','*'], body: body }, layout: layout };
  }

  // Helper: two-column table
  function buildTwoColTable(rows, layout) {
    if (!rows || !rows.length) return { text: 'None', italics: true };
    var body = rows.map(function(r) {
      return [ { text: r[0] + ':', bold: true }, r[1] ];
    });
    return { table: { widths: ['auto','*'], body: body }, layout: layout };
  }

  // Helper: multi-col list
  function buildMultiColList(items, colCount) {
    if (!items || !items.length) return { text: 'None', italics: true };
    var rows = [], row = [];
    items.forEach(function(it, i) {
      row.push({ text: '- ' + it });
      if ((i + 1) % colCount === 0) { rows.push(row); row = []; }
    });
    if (row.length) { while (row.length < colCount) row.push(''); rows.push(row); }
    return { table: { widths: Array(colCount).fill('*'), body: rows }, layout: { hLineWidth: () => 0, vLineWidth: () => 0 } };
  }

  // Expose
  global.exportCharacterPDF = exportCharacterPDF;
})(window);
