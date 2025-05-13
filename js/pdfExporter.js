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
   * exportCharacterPDF
   * @param {Object} snapshot - full character snapshot from CharacterExporter.exportSnapshot
   */
  function exportCharacterPDF(snapshot) {
    var timestamp      = new Date().toLocaleString();
    var name           = (snapshot.characterInfo && snapshot.characterInfo.name) || 'Unnamed';
    var desc           = snapshot.characterInfo && snapshot.characterInfo.description;
    var race           = snapshot.race || '';
    var essenceSchool  = snapshot.essencePath || '';
    var essenceElement = snapshot.essenceElement || '';
    var statsEntries   = Object.entries(snapshot.stats || {});
    var clsEntries     = Object.entries(snapshot.currentLayerStats || {});
    var abilityRows    = Object.entries(snapshot.abilities || {}).map(function(e) { return [e[0], String(e[1])]; });
    var loreRows       = Object.entries(snapshot.lores || {}).map(function(e) { return [e[0], String(e[1])]; });
    var profRows       = Object.entries(snapshot.proficiencies || {}).map(function(e) { return [e[0], String(e[1])]; });
    var essRows        = Object.entries(snapshot.essenceSlots || {}).map(function(e) { return ['Level ' + e[0], String(e[1])]; });
    var bp             = snapshot.bp || {};
    var layers         = snapshot.layers || [];

    // Zebra striping and thin lines for all tables
    var zebraLayout = {
      fillColor: function(rowIndex) {
        return (rowIndex % 2 === 0) ? '#F5F5F5' : null;
      },
      hLineWidth: function() { return 0.5; },
      vLineWidth: function() { return 0.5; }
    };

    // Build the PDF document definition
    var docDefinition = {
      pageSize: 'LETTER',
      pageMargins: [40, 60, 40, 60],
      footer: function(currentPage, pageCount) {
        return {
          text: 'Page ' + currentPage + ' of ' + pageCount,
          alignment: 'right',
          style: 'footer',
          margin: [0, 0, 20, 0]
        };
      },
      content: []
    };

    // Header: name, race, timestamp in columns
    docDefinition.content.push({
      columns: [
        [
          { text: name, style: 'title' },
          { text: 'Race: ' + race, style: 'subtitle' }
        ],
        { text: 'Generated: ' + timestamp, style: 'timestamp', alignment: 'right' }
      ]
    });

    // Description block
    if (desc) {
      docDefinition.content.push({ text: 'Description', style: 'sectionHeader' });
      docDefinition.content.push({ text: desc, margin: [0, 0, 0, 15] });
    }

    // Essence School & Element
    docDefinition.content.push({ text: 'Essence School: ' + essenceSchool, style: 'sectionHeader', margin: [0, 0, 0, 5] });
    docDefinition.content.push({ text: 'Element: ' + essenceElement, margin: [0, 0, 0, 15] });

    // Core Stats
    docDefinition.content.push({ text: 'Core Stats', style: 'sectionHeader' });
    docDefinition.content.push(buildKeyValueTable(statsEntries, 3, zebraLayout));
    docDefinition.content.push({ text: '', margin: [0, 0, 0, 10] });

    // Current Layer Stats
    docDefinition.content.push({ text: 'Current Layer Stats', style: 'sectionHeader' });
    docDefinition.content.push(buildKeyValueTable(clsEntries, 3, zebraLayout));
    docDefinition.content.push({ text: '', margin: [0, 0, 0, 10] });

    // Abilities
    docDefinition.content.push({ text: 'Abilities', style: 'sectionHeader' });
    docDefinition.content.push(buildTwoColumnTable(abilityRows, zebraLayout));
    docDefinition.content.push({ text: '', margin: [0, 0, 0, 10] });

    // Lores
    docDefinition.content.push({ text: 'Lores', style: 'sectionHeader' });
    docDefinition.content.push(buildTwoColumnTable(loreRows, zebraLayout));
    docDefinition.content.push({ text: '', margin: [0, 0, 0, 10] });

    // Proficiencies
    docDefinition.content.push({ text: 'Proficiencies', style: 'sectionHeader' });
    docDefinition.content.push(buildTwoColumnTable(profRows, zebraLayout));
    docDefinition.content.push({ text: '', margin: [0, 0, 0, 10] });

    // Essence Slots
    docDefinition.content.push({ text: 'Essence Slots', style: 'sectionHeader' });
    docDefinition.content.push(buildTwoColumnTable(essRows, zebraLayout));
    docDefinition.content.push({ text: '', margin: [0, 0, 0, 10] });

    // Build Points Summary
    docDefinition.content.push({ text: 'Build Points', style: 'sectionHeader' });
    docDefinition.content.push({
      table: {
        widths: ['*', '*', '*'],
        body: [
          ['Earned', 'Spent', 'Remaining'],
          [bp.earned || 0, bp.spent || 0, bp.remaining || 0]
        ]
      },
      layout: zebraLayout,
      margin: [0, 0, 0, 15]
    });

    // Level History
    docDefinition.content.push({ text: 'Level History', style: 'sectionHeader' });

    var historyRows = layers.map(function(layer, idx) {
      // 1) Stats summary
      var statsLine = 'Stats: ' +
        Object.entries(layer.stats || {}).map(function(p) {
          // Capitalize stat name
          return p[0].charAt(0).toUpperCase() + p[0].slice(1) + ':' + p[1];
        }).join(', ');
    
      // 2) Abilities summary
      var abilitiesLine = 'Abilities: ' +
        (Object.keys(layer.abilities || {}).length
          ? Object.entries(layer.abilities).map(function(p) {
              return p[0].replace(/_/g, ' ') + ' (' + p[1] + ')';
            }).join(', ')
          : 'None');
    
      // 3) Lores summary
      var loresLine = 'Lores: ' +
        (Object.keys(layer.lores || {}).length
          ? Object.entries(layer.lores).map(function(p) {
              return p[0].replace(/_/g, ' ') + ' (' + p[1] + ')';
            }).join(', ')
          : 'None');
    
      // 4) Essence Slots summary
      var essLine = 'Essence Slots: ' +
        (Object.entries(layer.essenceSlots || {})
          .filter(function(p) { return p[1] > 0; })
          .map(function(p) {
            var lvl = p[0] === 'master' ? 'Master' : p[0];
            return lvl + ':' + p[1];
          }).join(', ') || 'None');
    
      // Combine into one multi‐line cell
      var changesText = [statsLine, abilitiesLine, loresLine, essLine].join('\n');
    
      return [
        'Level ' + (idx + 1),
        { text: changesText }
      ];
    });
    
    docDefinition.content.push(buildTwoColumnTable(historyRows, zebraLayout));

    // Styles
    docDefinition.styles = {
      title:         { fontSize: 18, bold: true, margin: [0, 0, 0, 5] },
      subtitle:      { fontSize: 14, italics: true, margin: [0, 0, 0, 5] },
      timestamp:     { fontSize: 8, italics: true, color: '#555' },
      sectionHeader: { fontSize: 12, bold: true, margin: [0, 10, 0, 5] },
      footer:        { fontSize: 8, italics: true, color: '#555' },
      defaultStyle:  { fontSize: 10 }
    };

    // Generate and download
    var filename = (name.replace(/[^a-z0-9]/gi, '_') || 'character') + '-CHAR.pdf';
    pdfMake.createPdf(docDefinition).download(filename);
  }

  /**
   * buildKeyValueTable
   * Creates a table with `columns` key/value pairs per row, padding incomplete rows.
   */
  function buildKeyValueTable(entries, columns, layout) {
    var body = [], row = [];
    entries.forEach(function(pair, idx) {
      row.push({ text: pair[0], bold: true }, String(pair[1]));
      if ((idx + 1) % columns === 0) {
        body.push(row);
        row = [];
      }
    });
    if (row.length) {
      while (row.length < columns * 2) {
        row.push('');
      }
      body.push(row);
    }
    var header = [];
    for (var i = 0; i < columns; i++) {
      header.push('Key', 'Value');
    }
    body.unshift(header);
    return { table: { widths: Array(columns * 2).fill('*'), body: body }, layout: layout };
  }

  /**
   * buildTwoColumnTable
   * Creates a simple two-column table with a header row.
   */
  function buildTwoColumnTable(rows, layout) {
    var body = [['Name', 'Value']].concat(rows);
    return { table: { widths: ['auto', '*'], body: body }, layout: layout };
  }

  // Expose the API
  global.exportCharacterPDF = exportCharacterPDF;
})(window);
