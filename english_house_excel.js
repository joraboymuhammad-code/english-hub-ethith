// =========================================================================
// ENGLISH HOUSE EXCEL 365 NATIVE ENGINE
// 1-to-1 Excel functionality: 100% Offline, Zero CDN dependency, Ultra-fast
// =========================================================================
(function(window) {
  'use strict';

  function colToLetter(c) {
    var s = '';
    c += 1;
    while (c > 0) {
      var m = (c - 1) % 26;
      s = String.fromCharCode(65 + m) + s;
      c = Math.floor((c - m) / 26);
    }
    return s;
  }

  function letterToCol(s) {
    if (!s) return 0;
    s = s.toUpperCase();
    var c = 0;
    for (var i = 0; i < s.length; i++) {
      c = c * 26 + (s.charCodeAt(i) - 64);
    }
    return c - 1;
  }

  function parseCellRef(ref) {
    var m = (ref || '').trim().toUpperCase().match(/^([A-Z]+)(\d+)$/);
    if (!m) return null;
    return { c: letterToCol(m[1]), r: parseInt(m[2], 10) - 1 };
  }

  var STORAGE_KEY = 'eh_saved_spreadsheets_v2';
  var ACTIVE_ID_KEY = 'eh_active_sheet_id';

  function createBlankWorkbook(title) {
    return {
      id: 'doc_' + Date.now(),
      name: title || 'Asosiy Jadval',
      updatedAt: new Date().toLocaleDateString('uz-UZ') + ' ' + new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      sheets: [
        {
          name: 'Sheet1',
          rows: 100,
          cols: 52,
          cells: {}
        }
      ]
    };
  }

  function loadSavedDocs() {
    var list = [];
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) list = JSON.parse(raw);
    } catch(e) {}
    if (!Array.isArray(list) || list.length === 0) {
      list = [createBlankWorkbook('Asosiy Jadval')];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
    return list;
  }

  function saveDocList(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch(e) {}
    if (window.EthithApp && window.EthithApp.state) {
      window.EthithApp.state.savedSpreadsheets = list;
    }
    if (window.EthithSync && window.EthithSync.pushRemoteStore) {
      window.EthithSync.pushRemoteStore();
    }
  }

  // Formula calculation engine
  function evalFormula(formulaStr, sheet) {
    if (!formulaStr || !String(formulaStr).startsWith('=')) return formulaStr;
    var expr = String(formulaStr).substring(1).trim();

    // Range functions: SUM, AVERAGE, COUNT, MIN, MAX
    var fnMatch = expr.match(/^(SUM|AVERAGE|COUNT|MIN|MAX)\(([A-Z0-9:]+)\)$/i);
    if (fnMatch) {
      var fn = fnMatch[1].toUpperCase();
      var range = fnMatch[2].split(':');
      var p1 = parseCellRef(range[0]);
      var p2 = range[1] ? parseCellRef(range[1]) : p1;
      if (!p1 || !p2) return '#REF!';

      var rStart = Math.min(p1.r, p2.r);
      var rEnd = Math.max(p1.r, p2.r);
      var cStart = Math.min(p1.c, p2.c);
      var cEnd = Math.max(p1.c, p2.c);

      var nums = [];
      for (var r = rStart; r <= rEnd; r++) {
        for (var c = cStart; c <= cEnd; c++) {
          var k = r + '_' + c;
          var cell = sheet.cells[k];
          if (cell && cell.v !== undefined && cell.v !== null && cell.v !== '') {
            var raw = String(cell.v).replace(/,/g, '').trim();
            var n = parseFloat(raw);
            if (!isNaN(n)) nums.push(n);
          }
        }
      }

      if (fn === 'SUM') {
        var s = 0;
        for (var i = 0; i < nums.length; i++) s += nums[i];
        return s;
      }
      if (fn === 'AVERAGE') {
        if (!nums.length) return 0;
        var s2 = 0;
        for (var j = 0; j < nums.length; j++) s2 += nums[j];
        return Math.round((s2 / nums.length) * 100) / 100;
      }
      if (fn === 'COUNT') {
        return nums.length;
      }
      if (fn === 'MIN') {
        return nums.length ? Math.min.apply(null, nums) : 0;
      }
      if (fn === 'MAX') {
        return nums.length ? Math.max.apply(null, nums) : 0;
      }
    }

    // Arithmetic formula with cell coordinates: e.g. =A1+B1 or =A1*0.5
    try {
      var safeExpr = expr.replace(/[A-Z]+[0-9]+/gi, function(match) {
        var p = parseCellRef(match);
        if (!p) return '0';
        var c = sheet.cells[p.r + '_' + p.c];
        if (!c || c.v === undefined || c.v === null || c.v === '') return '0';
        var val = parseFloat(String(c.v).replace(/,/g, ''));
        return isNaN(val) ? '0' : String(val);
      });
      if (/^[0-9+\-*/().\s]+$/.test(safeExpr)) {
        var res = Function('"use strict";return (' + safeExpr + ')')();
        return typeof res === 'number' ? (Math.round(res * 1000) / 1000) : res;
      }
    } catch(e) {
      return '#VALUE!';
    }

    return formulaStr;
  }

  function mount(containerId) {
    var container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if (!container) return;

    var docs = loadSavedDocs();
    var activeDocId = localStorage.getItem(ACTIVE_ID_KEY) || (docs[0] && docs[0].id);
    var curDoc = docs.find(function(d) { return d.id === activeDocId; }) || docs[0];
    if (!curDoc) {
      curDoc = createBlankWorkbook('Asosiy Jadval');
      docs = [curDoc];
    }
    if (!curDoc.sheets || !curDoc.sheets.length) {
      curDoc.sheets = [{ name: 'Sheet1', rows: 100, cols: 52, cells: {} }];
    }
    var activeSheetIdx = 0;
    var activeR = 0;
    var activeC = 0;
    var isEditing = false;

    function getSheet() {
      if (!curDoc.sheets[activeSheetIdx]) curDoc.sheets[activeSheetIdx] = { name: 'Sheet1', rows: 100, cols: 52, cells: {} };
      if (!curDoc.sheets[activeSheetIdx].cells) curDoc.sheets[activeSheetIdx].cells = {};
      if (!curDoc.sheets[activeSheetIdx].rows || curDoc.sheets[activeSheetIdx].rows < 100) curDoc.sheets[activeSheetIdx].rows = 100;
      if (!curDoc.sheets[activeSheetIdx].cols || curDoc.sheets[activeSheetIdx].cols < 52) curDoc.sheets[activeSheetIdx].cols = 52;
      return curDoc.sheets[activeSheetIdx];
    }

    function renderApp() {
      var sheet = getSheet();
      var isAdmin = window.S && window.S.user && window.S.user.role === 'admin';
      var roleBadge = isAdmin 
        ? '<span style="background:rgba(16,185,129,0.2);border:1px solid #10b981;color:#34d399;font-size:11px;font-weight:800;padding:2px 8px;border-radius:20px;">🛡️ Administrator</span>'
        : '<span style="background:rgba(56,189,248,0.2);border:1px solid #38bdf8;color:#38bdf8;font-size:11px;font-weight:800;padding:2px 8px;border-radius:20px;">👨‍🏫 O‘qituvchi Kabineti</span>';

      var h = '<div class="eh-excel-root" style="display:flex;flex-direction:column;gap:10px;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;color:#0f172a;">' +
        // 1. Top Ribbon Header
        '<div style="background:linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.94));border:1.5px solid rgba(56,189,248,0.35);border-radius:16px;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;box-shadow:0 12px 35px rgba(0,0,0,0.5);color:#fff;">' +
          '<div style="display:flex;align-items:center;gap:12px;">' +
            '<div style="width:42px;height:42px;border-radius:10px;background:linear-gradient(135deg,#107c41,#0b5c30);border:1.5px solid #22c55e;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 0 14px rgba(34,197,94,0.4);">' +
              '📊' +
            '</div>' +
            '<div>' +
              '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
                '<h1 style="font-size:18px;font-weight:900;margin:0;color:#f8fafc;letter-spacing:-0.3px;">English House Excel 365</h1>' +
                roleBadge +
              '</div>' +
              '<p style="font-size:12px;color:#94a3b8;margin:2px 0 0;">Kataklarni bo‘yash, Excel formulalari (=SUM, =AVERAGE), toza bo‘m-bo‘sh varaq va .xlsx eksport</p>' +
            '</div>' +
          '</div>' +

          // Saved Spreadsheets Control Bar
          '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
            '<div style="display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);padding:4px 8px;border-radius:10px;">' +
              '<span style="font-size:12px;color:#94a3b8;font-weight:700;">📁 Saqlangan:</span>' +
              '<select id="ehExcelDocSelect" style="background:#0f172a;color:#f8fafc;border:1px solid #38bdf8;padding:5px 10px;border-radius:6px;font-size:12.5px;font-weight:800;outline:none;cursor:pointer;max-width:180px;">' +
                docs.map(function(d) {
                  return '<option value="' + d.id + '"' + (d.id === curDoc.id ? ' selected' : '') + '>📁 ' + d.name + '</option>';
                }).join('') +
              '</select>' +
            '</div>' +
            '<input id="ehExcelDocName" type="text" value="' + (curDoc.name || 'Asosiy Jadval') + '" placeholder="Jadval nomi..." style="background:#0f172a;color:#f8fafc;border:1.5px solid #475569;padding:6px 10px;border-radius:8px;font-size:13px;font-weight:700;width:140px;outline:none;" />' +
            '<button id="ehExcelSaveBtn" style="background:linear-gradient(135deg,#0284c7,#0369a1);color:#fff;border:none;padding:8px 14px;border-radius:8px;font-size:12.5px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:5px;box-shadow:0 4px 12px rgba(2,132,199,0.35);">' +
              '<span>💾</span> Saqlash' +
            '</button>' +
            '<button id="ehExcelNewBtn" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.22);color:#f8fafc;padding:8px 12px;border-radius:8px;font-size:12.5px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:5px;">' +
              '<span>➕</span> Yangi Bo‘sh' +
            '</button>' +
            '<button id="ehExcelDeleteBtn" style="background:rgba(239,68,68,0.15);border:1px solid #ef4444;color:#f87171;padding:8px 10px;border-radius:8px;font-size:12.5px;font-weight:800;cursor:pointer;">' +
              '<span>🗑️</span>' +
            '</button>' +
          '</div>' +
        '</div>' +

        // 2. Excel Ribbon Toolbar (Fonts, Colors, Alignment, Formulas)
        '<div style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:12px;padding:8px 14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">' +
          // Left: Tool buttons
          '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">' +
            // Font Style
            '<button id="ehToolBold" class="eh-tb-btn" title="Qalin (Bold)" style="font-weight:900;width:32px;height:32px;border-radius:6px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;">B</button>' +
            '<button id="ehToolItalic" class="eh-tb-btn" title="Yotiq (Italic)" style="font-style:italic;width:32px;height:32px;border-radius:6px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;font-weight:700;">I</button>' +
            '<button id="ehToolUnderline" class="eh-tb-btn" title="Tagiga chizilgan (Underline)" style="text-decoration:underline;width:32px;height:32px;border-radius:6px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;font-weight:700;">U</button>' +
            '<span style="height:20px;width:1px;background:#cbd5e1;margin:0 4px;"></span>' +

            // Cell Background Fill Color Chips
            '<span style="font-size:12px;font-weight:800;color:#334155;margin-right:2px;">🎨 Katakni bo‘yash:</span>' +
            '<button class="eh-chip" data-color="#fef08a" title="Sariq (Yellow)" style="width:24px;height:24px;border-radius:6px;background:#fef08a;border:1.5px solid #ca8a04;cursor:pointer;"></button>' +
            '<button class="eh-chip" data-color="#bbf7d0" title="Yashil (Green)" style="width:24px;height:24px;border-radius:6px;background:#bbf7d0;border:1.5px solid #16a34a;cursor:pointer;"></button>' +
            '<button class="eh-chip" data-color="#bfdbfe" title="Moviy (Blue)" style="width:24px;height:24px;border-radius:6px;background:#bfdbfe;border:1.5px solid #2563eb;cursor:pointer;"></button>' +
            '<button class="eh-chip" data-color="#fed7aa" title="To‘q Sariq (Orange)" style="width:24px;height:24px;border-radius:6px;background:#fed7aa;border:1.5px solid #ea580c;cursor:pointer;"></button>' +
            '<button class="eh-chip" data-color="#fecaca" title="Qizil (Red)" style="width:24px;height:24px;border-radius:6px;background:#fecaca;border:1.5px solid #dc2626;cursor:pointer;"></button>' +
            '<button class="eh-chip" data-color="#e9d5ff" title="Siyohrang (Purple)" style="width:24px;height:24px;border-radius:6px;background:#e9d5ff;border:1.5px solid #9333ea;cursor:pointer;"></button>' +
            '<button class="eh-chip" data-color="#ffffff" title="Oq / Tozalash" style="width:24px;height:24px;border-radius:6px;background:#ffffff;border:1.5px solid #94a3b8;cursor:pointer;"></button>' +
            '<label title="Boshqa rang tanlash" style="display:inline-flex;align-items:center;cursor:pointer;margin-left:2px;">' +
              '<input type="color" id="ehToolCustomBg" value="#fef08a" style="width:24px;height:24px;border:none;border-radius:6px;cursor:pointer;padding:0;background:transparent;" />' +
            '</label>' +
            '<span style="height:20px;width:1px;background:#cbd5e1;margin:0 4px;"></span>' +

            // Alignments
            '<button id="ehToolAlignLeft" class="eh-tb-btn" title="Chapga" style="width:30px;height:30px;border-radius:6px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;">⫷</button>' +
            '<button id="ehToolAlignCenter" class="eh-tb-btn" title="O‘rtaga" style="width:30px;height:30px;border-radius:6px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;">≣</button>' +
            '<button id="ehToolAlignRight" class="eh-tb-btn" title="O‘ngga" style="width:30px;height:30px;border-radius:6px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;">⫸</button>' +
            '<span style="height:20px;width:1px;background:#cbd5e1;margin:0 4px;"></span>' +

            // Quick AutoSum
            '<button id="ehToolAutoSum" style="background:#e0f2fe;border:1px solid #38bdf8;color:#0284c7;padding:5px 10px;border-radius:6px;font-weight:900;font-size:12px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;">' +
              '∑ Yig‘indi (=SUM)' +
            '</button>' +
            '<button id="ehToolAddRow" style="background:#fff;border:1px solid #cbd5e1;color:#334155;padding:5px 10px;border-radius:6px;font-weight:800;font-size:12px;cursor:pointer;">' +
              '+ 50 Qator' +
            '</button>' +
            '<button id="ehToolAddCol" style="background:#fff;border:1px solid #cbd5e1;color:#334155;padding:5px 10px;border-radius:6px;font-weight:800;font-size:12px;cursor:pointer;">' +
              '+ 26 Ustun' +
            '</button>' +
          '</div>' +

          // Right: Export & Import Excel
          '<div style="display:flex;align-items:center;gap:8px;">' +
            '<label for="ehExcelFileInput" style="background:#ffffff;border:1.5px solid #cbd5e1;color:#334155;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:6px;">' +
              '<span>📂</span> Excel Ochish (.xlsx)' +
              '<input type="file" id="ehExcelFileInput" accept=".xlsx,.xls,.csv" style="display:none;" />' +
            '</label>' +
            '<button id="ehExcelExportBtn" style="background:linear-gradient(135deg,#107c41,#15803d);color:#fff;border:none;padding:7px 16px;border-radius:8px;font-size:12.5px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 3px 12px rgba(16,124,65,0.4);">' +
              '<span>📥</span> Excel Yuklash (.xlsx)' +
            '</button>' +
          '</div>' +
        '</div>' +

        // 3. Formula Bar
        '<div style="display:flex;align-items:center;background:#ffffff;border:1.5px solid #cbd5e1;border-radius:8px;padding:5px 12px;gap:8px;box-shadow:inset 0 1px 3px rgba(0,0,0,0.06);">' +
          '<div id="ehCellCoordBox" style="font-weight:900;font-size:13px;color:#0284c7;background:#e0f2fe;padding:4px 10px;border-radius:5px;border:1px solid #bae6fd;min-width:44px;text-align:center;">' +
            colToLetter(activeC) + (activeR + 1) +
          '</div>' +
          '<span style="font-weight:900;color:#64748b;font-size:15px;font-style:italic;">fx</span>' +
          '<input id="ehFormulaInput" type="text" placeholder="Qiymat yoki formula kiriting (=SUM(A1:A5), matn, son...)" style="flex:1;border:none;outline:none;font-size:13.5px;color:#000000;font-weight:500;padding:4px;background:transparent;" />' +
        '</div>' +

        // 4. Excel Grid Viewport (Scrollable Table)
        '<div id="ehGridWrapper" tabindex="0" style="position:relative;width:100%;height:600px;background:#ffffff;border-radius:10px;overflow:auto;border:1.5px solid #cbd5e1;box-shadow:0 8px 24px rgba(0,0,0,0.08);outline:none;">' +
          '<table id="ehExcelTable" style="table-layout:fixed;border-collapse:collapse;width:max-content;background:#fff;user-select:none;">' +
            // Header Row (Column Letters)
            '<thead>' +
              '<tr style="background:#f8fafc;position:sticky;top:0;z-index:20;">' +
                '<th style="width:48px;min-width:48px;height:26px;border:1px solid #cbd5e1;background:#e2e8f0;font-size:11px;font-weight:800;color:#475569;text-align:center;position:sticky;left:0;z-index:30;">◢</th>' +
                (function() {
                  var ths = '';
                  for (var c = 0; c < sheet.cols; c++) {
                    var ltr = colToLetter(c);
                    var isColActive = (c === activeC);
                    ths += '<th style="width:110px;min-width:110px;height:26px;border:1px solid #cbd5e1;background:' + (isColActive ? '#bae6fd' : '#f1f5f9') + ';font-size:12px;font-weight:800;color:' + (isColActive ? '#0284c7' : '#475569') + ';text-align:center;">' + ltr + '</th>';
                  }
                  return ths;
                })() +
              '</tr>' +
            '</thead>' +

            // Rows & Cells
            '<tbody>' +
              (function() {
                var trs = '';
                for (var r = 0; r < sheet.rows; r++) {
                  var isRowActive = (r === activeR);
                  trs += '<tr>' +
                    // Row Header Number
                    '<th style="width:48px;height:24px;border:1px solid #cbd5e1;background:' + (isRowActive ? '#bae6fd' : '#f8fafc') + ';font-size:11.5px;font-weight:800;color:' + (isRowActive ? '#0284c7' : '#64748b') + ';text-align:center;position:sticky;left:0;z-index:10;">' +
                      (r + 1) +
                    '</th>';

                  for (var c = 0; c < sheet.cols; c++) {
                    var k = r + '_' + c;
                    var cell = sheet.cells[k] || {};
                    var isSelected = (r === activeR && c === activeC);
                    var displayVal = cell.f ? evalFormula(cell.f, sheet) : (cell.v !== undefined ? cell.v : '');

                    var cellStyle = 'width:110px;height:24px;border:1px solid #cbd5e1;padding:2px 6px;font-size:13px;line-height:22px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-sizing:border-box;cursor:cell;';
                    cellStyle += 'color:' + (cell.fc || '#000000') + ';';
                    cellStyle += 'background-color:' + (cell.bg || '#ffffff') + ';';
                    if (cell.bl) cellStyle += 'font-weight:bold;';
                    if (cell.it) cellStyle += 'font-style:italic;';
                    if (cell.ul) cellStyle += 'text-decoration:underline;';
                    if (cell.al) cellStyle += 'text-align:' + cell.al + ';';

                    if (isSelected) {
                      cellStyle += 'outline:2.5px solid #107c41;outline-offset:-1px;z-index:5;position:relative;';
                    }

                    trs += '<td class="eh-cell" data-r="' + r + '" data-c="' + c + '" style="' + cellStyle + '">' +
                      (displayVal !== null && displayVal !== undefined ? String(displayVal) : '') +
                    '</td>';
                  }
                  trs += '</tr>';
                }
                return trs;
              })() +
            '</tbody>' +
          '</table>' +
        '</div>' +

        // 5. Bottom Tabs & Status Bar
        '<div style="background:#f8fafc;border:1.5px solid #cbd5e1;border-radius:10px;padding:6px 14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;font-size:12px;color:#475569;">' +
          '<div style="display:flex;align-items:center;gap:6px;">' +
            curDoc.sheets.map(function(sh, sIdx) {
              var isAct = sIdx === activeSheetIdx;
              return '<button class="eh-sheet-tab" data-sidx="' + sIdx + '" style="background:' + (isAct ? '#ffffff' : '#e2e8f0') + ';color:' + (isAct ? '#107c41' : '#475569') + ';border:1px solid ' + (isAct ? '#107c41' : '#cbd5e1') + ';border-bottom:none;padding:5px 14px;border-radius:6px 6px 0 0;font-weight:800;cursor:pointer;">' +
                sh.name +
              '</button>';
            }).join('') +
            '<button id="ehAddSheetBtn" title="Yangi varaq qo‘shish" style="background:#ffffff;border:1px solid #cbd5e1;color:#0284c7;width:26px;height:26px;border-radius:6px;font-weight:900;cursor:pointer;">+</button>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:14px;font-weight:700;">' +
            '<span>Katak: <b style="color:#0284c7;">' + colToLetter(activeC) + (activeR + 1) + '</b></span>' +
            '<span>Qatorlar: ' + sheet.rows + '</span>' +
            '<span>Ustunlar: ' + sheet.cols + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';

      container.innerHTML = h;
      bindEvents();
    }

    function syncFormulaBar() {
      var sheet = getSheet();
      var k = activeR + '_' + activeC;
      var cell = sheet.cells[k] || {};
      var fInput = document.getElementById('ehFormulaInput');
      var coordBox = document.getElementById('ehCellCoordBox');
      if (coordBox) coordBox.innerText = colToLetter(activeC) + (activeR + 1);
      if (fInput) {
        fInput.value = cell.f || (cell.v !== undefined ? cell.v : '');
      }
    }

    function setActiveCell(r, c) {
      var sheet = getSheet();
      // Infinite extension on reach boundary
      if (r >= sheet.rows) {
        sheet.rows = Math.max(sheet.rows + 30, r + 10);
      }
      if (c >= sheet.cols) {
        sheet.cols = Math.max(sheet.cols + 20, c + 5);
      }
      activeR = Math.max(0, r);
      activeC = Math.max(0, c);
      renderApp();
      syncFormulaBar();

      // Ensure active cell is scrolled into view smoothly
      var td = container.querySelector('.eh-cell[data-r="' + activeR + '"][data-c="' + activeC + '"]');
      if (td) {
        td.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    }

    function applyFormatToActive(prop, val) {
      var sheet = getSheet();
      var k = activeR + '_' + activeC;
      if (!sheet.cells[k]) sheet.cells[k] = {};
      sheet.cells[k][prop] = val;
      renderApp();
      syncFormulaBar();
    }

    function activateInCellEdit(td, r, c) {
      if (isEditing) return;
      isEditing = true;
      var sheet = getSheet();
      var k = r + '_' + c;
      var cell = sheet.cells[k] || {};
      var rawVal = cell.f || (cell.v !== undefined ? cell.v : '');

      td.innerHTML = '';
      var input = document.createElement('input');
      input.type = 'text';
      input.value = rawVal;
      // High contrast deep black font so typing is 100% visible
      input.style.cssText = 'width:100%;height:100%;border:none;outline:none;background:transparent;font-size:13px;font-family:inherit;font-weight:inherit;color:#000000 !important;padding:0;margin:0;';
      td.appendChild(input);
      input.focus();
      input.select();

      function commit() {
        if (!isEditing) return;
        isEditing = false;
        var val = input.value.trim();
        if (!sheet.cells[k]) sheet.cells[k] = {};
        if (val.startsWith('=')) {
          sheet.cells[k].f = val;
          sheet.cells[k].v = evalFormula(val, sheet);
        } else {
          delete sheet.cells[k].f;
          sheet.cells[k].v = val;
        }
        renderApp();
        syncFormulaBar();
      }

      input.onblur = commit;
      input.onkeydown = function(e) {
        if (e.key === 'Enter') {
          commit();
          setActiveCell(r + 1, c);
        } else if (e.key === 'Tab') {
          e.preventDefault();
          commit();
          setActiveCell(r, c + 1);
        } else if (e.key === 'Escape') {
          isEditing = false;
          renderApp();
          syncFormulaBar();
        }
      };
    }

    function bindEvents() {
      var sheet = getSheet();

      // Keyboard navigation for active cell
      container.onkeydown = function(e) {
        if (isEditing) return;
        var tag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : '';
        if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveCell(activeR - 1, activeC);
        } else if (e.key === 'ArrowDown' || e.key === 'Enter') {
          e.preventDefault();
          setActiveCell(activeR + 1, activeC);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setActiveCell(activeR, activeC - 1);
        } else if (e.key === 'ArrowRight' || e.key === 'Tab') {
          e.preventDefault();
          setActiveCell(activeR, activeC + 1);
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          var k = activeR + '_' + activeC;
          if (sheet.cells[k]) {
            delete sheet.cells[k].v;
            delete sheet.cells[k].f;
            renderApp();
            syncFormulaBar();
          }
        } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          // Direct typing into selected cell like Excel!
          var targetTd = container.querySelector('.eh-cell[data-r="' + activeR + '"][data-c="' + activeC + '"]');
          if (targetTd) {
            activateInCellEdit(targetTd, activeR, activeC);
            var inInput = targetTd.querySelector('input');
            if (inInput) {
              inInput.value = e.key;
            }
          }
        }
      };

      // Document Switcher
      var docSelect = document.getElementById('ehExcelDocSelect');
      if (docSelect) {
        docSelect.onchange = function() {
          var targetId = docSelect.value;
          var found = docs.find(function(d) { return d.id === targetId; });
          if (found) {
            curDoc = found;
            localStorage.setItem(ACTIVE_ID_KEY, curDoc.id);
            activeSheetIdx = 0;
            activeR = 0;
            activeC = 0;
            renderApp();
            syncFormulaBar();
          }
        };
      }

      // Save Button
      var saveBtn = document.getElementById('ehExcelSaveBtn');
      if (saveBtn) {
        saveBtn.onclick = function() {
          var nameInput = document.getElementById('ehExcelDocName');
          curDoc.name = (nameInput ? nameInput.value : curDoc.name).trim() || 'Mening Jadvalim';
          curDoc.updatedAt = new Date().toLocaleDateString('uz-UZ') + ' ' + new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
          saveDocList(docs);
          if (window.toast) window.toast('💾 "' + curDoc.name + '" jadvali saqlandi!');
        };
      }

      // New Button
      var newBtn = document.getElementById('ehExcelNewBtn');
      if (newBtn) {
        newBtn.onclick = function() {
          var newTitle = 'Yangi Jadval ' + (docs.length + 1);
          var newDoc = createBlankWorkbook(newTitle);
          docs.unshift(newDoc);
          saveDocList(docs);
          curDoc = newDoc;
          localStorage.setItem(ACTIVE_ID_KEY, curDoc.id);
          activeSheetIdx = 0;
          activeR = 0;
          activeC = 0;
          renderApp();
          syncFormulaBar();
          if (window.toast) window.toast('✨ Yangi toza bo‘sh jadval ochildi');
        };
      }

      // Delete Button
      var delBtn = document.getElementById('ehExcelDeleteBtn');
      if (delBtn) {
        delBtn.onclick = function() {
          if (docs.length <= 1) {
            if (window.toast) window.toast('⚠️ Oxirgi jadvalni o‘chirib bo‘lmaydi');
            return;
          }
          if (!confirm('"' + curDoc.name + '" jadvalini o‘chirmoqchimisiz?')) return;
          docs = docs.filter(function(d) { return d.id !== curDoc.id; });
          saveDocList(docs);
          curDoc = docs[0];
          localStorage.setItem(ACTIVE_ID_KEY, curDoc.id);
          activeSheetIdx = 0;
          renderApp();
          syncFormulaBar();
          if (window.toast) window.toast('🗑️ Jadval o‘chirildi');
        };
      }

      // Formula Bar Input
      var fInput = document.getElementById('ehFormulaInput');
      if (fInput) {
        fInput.onkeydown = function(e) {
          if (e.key === 'Enter') {
            var val = fInput.value.trim();
            var k = activeR + '_' + activeC;
            if (!sheet.cells[k]) sheet.cells[k] = {};
            if (val.startsWith('=')) {
              sheet.cells[k].f = val;
              sheet.cells[k].v = evalFormula(val, sheet);
            } else {
              delete sheet.cells[k].f;
              sheet.cells[k].v = val;
            }
            renderApp();
            syncFormulaBar();
          }
        };
      }

      // Cell Clicks & Double Clicks
      var tds = container.querySelectorAll('.eh-cell');
      tds.forEach(function(td) {
        td.onclick = function(e) {
          var r = parseInt(td.getAttribute('data-r'), 10);
          var c = parseInt(td.getAttribute('data-c'), 10);
          setActiveCell(r, c);
        };
        td.ondblclick = function(e) {
          var r = parseInt(td.getAttribute('data-r'), 10);
          var c = parseInt(td.getAttribute('data-c'), 10);
          activateInCellEdit(td, r, c);
        };
      });

      // Quick Color Chips
      var chips = container.querySelectorAll('.eh-chip');
      chips.forEach(function(chip) {
        chip.onclick = function() {
          var col = chip.getAttribute('data-color');
          applyFormatToActive('bg', col);
          if (window.toast) window.toast('🎨 Katak rangi: ' + (col === '#ffffff' ? 'Oq (Tozalangan)' : col));
        };
      });

      // Custom Color Input
      var customColor = document.getElementById('ehToolCustomBg');
      if (customColor) {
        customColor.onchange = function() {
          applyFormatToActive('bg', customColor.value);
        };
      }

      // Toolbar Bold
      var tBold = document.getElementById('ehToolBold');
      if (tBold) {
        tBold.onclick = function() {
          var k = activeR + '_' + activeC;
          var cur = sheet.cells[k] && sheet.cells[k].bl;
          applyFormatToActive('bl', !cur);
        };
      }

      // Toolbar Italic
      var tItalic = document.getElementById('ehToolItalic');
      if (tItalic) {
        tItalic.onclick = function() {
          var k = activeR + '_' + activeC;
          var cur = sheet.cells[k] && sheet.cells[k].it;
          applyFormatToActive('it', !cur);
        };
      }

      // Toolbar Underline
      var tUnderline = document.getElementById('ehToolUnderline');
      if (tUnderline) {
        tUnderline.onclick = function() {
          var k = activeR + '_' + activeC;
          var cur = sheet.cells[k] && sheet.cells[k].ul;
          applyFormatToActive('ul', !cur);
        };
      }

      // Alignment Buttons
      var aLeft = document.getElementById('ehToolAlignLeft');
      if (aLeft) aLeft.onclick = function() { applyFormatToActive('al', 'left'); };
      var aCenter = document.getElementById('ehToolAlignCenter');
      if (aCenter) aCenter.onclick = function() { applyFormatToActive('al', 'center'); };
      var aRight = document.getElementById('ehToolAlignRight');
      if (aRight) aRight.onclick = function() { applyFormatToActive('al', 'right'); };

      // AutoSum Button
      var btnAutoSum = document.getElementById('ehToolAutoSum');
      if (btnAutoSum) {
        btnAutoSum.onclick = function() {
          var colLtr = colToLetter(activeC);
          var formula = '=SUM(' + colLtr + '1:' + colLtr + activeR + ')';
          var fIn = document.getElementById('ehFormulaInput');
          if (fIn) {
            fIn.value = formula;
            var e = new KeyboardEvent('keydown', { key: 'Enter' });
            fIn.dispatchEvent(e);
          }
        };
      }

      // Add Row Button
      var btnAddRow = document.getElementById('ehToolAddRow');
      if (btnAddRow) {
        btnAddRow.onclick = function() {
          sheet.rows += 50;
          renderApp();
          syncFormulaBar();
        };
      }

      // Add Column Button
      var btnAddCol = document.getElementById('ehToolAddCol');
      if (btnAddCol) {
        btnAddCol.onclick = function() {
          sheet.cols += 26;
          renderApp();
          syncFormulaBar();
        };
      }

      // Sheet Tabs
      var tabs = container.querySelectorAll('.eh-sheet-tab');
      tabs.forEach(function(tab) {
        tab.onclick = function() {
          activeSheetIdx = parseInt(tab.getAttribute('data-sidx'), 10);
          activeR = 0;
          activeC = 0;
          renderApp();
          syncFormulaBar();
        };
      });

      // Add Sheet Tab Button
      var btnAddSheet = document.getElementById('ehAddSheetBtn');
      if (btnAddSheet) {
        btnAddSheet.onclick = function() {
          var newName = 'Sheet' + (curDoc.sheets.length + 1);
          curDoc.sheets.push({ name: newName, rows: 100, cols: 52, cells: {} });
          activeSheetIdx = curDoc.sheets.length - 1;
          renderApp();
          syncFormulaBar();
        };
      }

      // Export XLSX File using SheetJS
      var exportBtn = document.getElementById('ehExcelExportBtn');
      if (exportBtn) {
        exportBtn.onclick = function() {
          try {
            if (typeof window.XLSX === 'undefined') {
              if (window.toast) window.toast('XLSX kutubxonasi mavjud emas');
              return;
            }
            var wb = window.XLSX.utils.book_new();

            curDoc.sheets.forEach(function(sh, sIdx) {
              var wsData = [];
              for (var r = 0; r < sh.rows; r++) {
                var row = [];
                for (var c = 0; c < sh.cols; c++) {
                  var cell = sh.cells[r + '_' + c];
                  var val = '';
                  if (cell) {
                    val = cell.f ? evalFormula(cell.f, sh) : (cell.v !== undefined ? cell.v : '');
                  }
                  row.push(val);
                }
                wsData.push(row);
              }
              // Trim empty rows from end
              while (wsData.length > 0 && wsData[wsData.length - 1].every(function(x) { return x === ''; })) {
                wsData.pop();
              }
              var ws = window.XLSX.utils.aoa_to_sheet(wsData);
              window.XLSX.utils.book_append_sheet(wb, ws, sh.name || ('Sheet' + (sIdx + 1)));
            });

            var docName = (curDoc.name || 'English_House_Jadval').replace(/[^a-zA-Z0-9_\-]/g, '_');
            var fileName = docName + '.xlsx';

            var wbout = window.XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
            var buf = new ArrayBuffer(wbout.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i < wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xFF;
            var blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            setTimeout(function() { a.remove(); URL.revokeObjectURL(url); }, 500);
            if (window.toast) window.toast('✅ Excel fayli (' + fileName + ') yuklandi!');
          } catch(err) {
            console.error('Export error:', err);
            if (window.toast) window.toast('Eksportda xatolik: ' + err.message);
          }
        };
      }

      // Import XLSX File
      var fileInput = document.getElementById('ehExcelFileInput');
      if (fileInput) {
        fileInput.onchange = function(e) {
          var f = e.target.files && e.target.files[0];
          if (!f) return;
          var reader = new FileReader();
          reader.onload = function(ev) {
            try {
              var data = new Uint8Array(ev.target.result);
              var workbook = window.XLSX.read(data, { type: 'array' });
              var newSheets = [];

              workbook.SheetNames.forEach(function(name) {
                var ws = workbook.Sheets[name];
                var json = window.XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
                var cells = {};
                var maxR = Math.max(json.length + 30, 100);
                var maxC = 52;

                for (var r = 0; r < json.length; r++) {
                  var row = json[r];
                  if (row.length > maxC) maxC = row.length + 10;
                  for (var c = 0; c < row.length; c++) {
                    if (row[c] !== '' && row[c] !== null && row[c] !== undefined) {
                      cells[r + '_' + c] = { v: row[c] };
                    }
                  }
                }

                newSheets.push({
                  name: name,
                  rows: maxR,
                  cols: maxC,
                  cells: cells
                });
              });

              if (newSheets.length > 0) {
                var importTitle = f.name.replace(/\.[^/.]+$/, "");
                var importedDoc = {
                  id: 'doc_' + Date.now(),
                  name: importTitle,
                  updatedAt: new Date().toLocaleDateString('uz-UZ'),
                  sheets: newSheets
                };
                docs.unshift(importedDoc);
                saveDocList(docs);
                curDoc = importedDoc;
                localStorage.setItem(ACTIVE_ID_KEY, curDoc.id);
                activeSheetIdx = 0;
                renderApp();
                syncFormulaBar();
                if (window.toast) window.toast('✅ Excel fayli (' + f.name + ') ochildi!');
              }
            } catch(err) {
              console.error('Import error:', err);
              if (window.toast) window.toast('Faylni ochishda xatolik: ' + err.message);
            }
          };
          reader.readAsArrayBuffer(f);
        };
      }
    }

    renderApp();
    syncFormulaBar();
  }

  window.EthithExcel = {
    mount: mount
  };

})(window);
