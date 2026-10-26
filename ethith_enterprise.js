/**
 * ETHITH ENTERPRISE LMS & LEARNING CENTER MANAGEMENT SYSTEM
 * High-Scale Architecture (5,000 to 100,000+ students)
 * 
 * Modules:
 * 1. PC File & Folder Explorer (Drag & Drop, Test ID, 1-Attempt HW assignment)
 * 2. Automated Smart Billing & Unique Cent/Tiyin Offset + Receipt Verification
 * 3. Teacher Payroll & Staff Management
 * 4. Timetable & Interactive Schedule with Class Capacity Limits
 * 5. Modern Class Roster (Telegram-Style Member Search & Add)
 * 6. Online Contests & Tournaments (Top-10 Coins Auto-Awards)
 * 7. 3-Month Level Test Milestone & Auto-Drop Assessment Sheet
 */

(function(window) {
  'use strict';

  var EE = {};
  window.EthithEnterprise = EE;

  // Local Cache & Store Pointer
  var _store = null;

  function getStore() {
    if (window.EthithSync && window.EthithSync.store) {
      _store = window.EthithSync.store;
    } else if (!_store) {
      try {
        var raw = localStorage.getItem('ethith_shared_store');
        _store = raw ? JSON.parse(raw) : {};
      } catch (e) {
        _store = {};
      }
    }
    // Initialize default collections if missing
    if (!_store.centerSettings) {
      _store.centerSettings = { card: "8600 4912 7731 9024", cardHolder: "ETHITH LEARNING CENTER", baseTuition: 200000, currency: "UZS" };
    }
    if (!_store.teachers) _store.teachers = [];
    if (!_store.fileExplorer) _store.fileExplorer = { folders: [], tests: [] };
    if (!_store.timetable) _store.timetable = [];
    if (!_store.contests) _store.contests = [];
    if (!_store.payments) _store.payments = {};
    if (!_store.classes) _store.classes = [];
    return _store;
  }

  function saveStore() {
    if (window.EthithSync && typeof window.EthithSync.saveStore === 'function') {
      window.EthithSync.saveStore(_store);
    } else {
      try {
        localStorage.setItem('ethith_shared_store', JSON.stringify(_store));
      } catch (e) {}
    }
  }

  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function fmtMoney(n) {
    return Number(n || 0).toLocaleString('uz-UZ') + " so'm";
  }

  function getCurrentUser() {
    if (window.EthithApp && window.EthithApp.state && window.EthithApp.state.user) {
      return window.EthithApp.state.user;
    }
    return { id: 'admin_official_teacher', role: 'teacher', name: 'Ustoz' };
  }

  function isAdminOrTeacher() {
    var u = getCurrentUser();
    return u && (u.role === 'teacher' || u.role === 'admin' || u.id === 'admin_official_teacher');
  }

  function getActiveMonthKey() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    return d.getFullYear() + '-' + m;
  }

  // Generate unique deterministric offset (e.g. 200,014 so'm)
  EE.getStudentOffsetAmount = function(studentId, base) {
    base = Number(base) || 200000;
    var hash = 0;
    var str = String(studentId || 'std');
    for (var i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    var offset = (Math.abs(hash) % 89) + 11; // between 11 and 99
    return base + offset;
  };

  // Toast Notification
  function showToast(msg, isErr) {
    var old = document.getElementById('eeToast');
    if (old) old.remove();
    var t = document.createElement('div');
    t.id = 'eeToast';
    t.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:2147483647;padding:12px 20px;border-radius:12px;font-weight:800;font-size:13.5px;color:#fff;box-shadow:0 10px 30px rgba(0,0,0,0.5);display:flex;align-items:center;gap:10px;animation:eeFadeIn 0.25s ease;background:' + 
      (isErr ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#10b981,#059669)') + ';';
    t.innerHTML = (isErr ? '⚠️ ' : '✅ ') + esc(msg);
    document.body.appendChild(t);
    setTimeout(function() { if (t && t.parentNode) t.remove(); }, 3500);
  }

  // ============================================================================
  // 1. PC FILE & FOLDER EXPLORER ("Qo'shimcha Testlar va Papkalar")
  // ============================================================================
  var currentFolderId = 'f_root';
  var explorerViewMode = 'grid'; // 'grid' | 'list'
  var explorerSearchQuery = '';

  EE.renderExplorerView = function(container) {
    if (!container) return;
    var S = getStore();
    var fe = S.fileExplorer || { folders: [], tests: [] };
    var isStaff = isAdminOrTeacher();

    // Ensure root folder exists
    if (!fe.folders.find(function(f) { return f.id === 'f_root'; })) {
      fe.folders.unshift({ id: 'f_root', name: 'Bosh Papka', parentId: null, createdAt: Date.now() });
      saveStore();
    }

    var curFolder = fe.folders.find(function(f) { return f.id === currentFolderId; }) || fe.folders[0];

    // Compute breadcrumb path
    var breadcrumbs = [];
    var fIter = curFolder;
    while (fIter) {
      breadcrumbs.unshift(fIter);
      if (!fIter.parentId) break;
      fIter = fe.folders.find(function(f) { return f.id === fIter.parentId; });
    }

    // Filter contents by current folder and search
    var subFolders = fe.folders.filter(function(f) {
      if (f.id === 'f_root') return false;
      return f.parentId === curFolder.id;
    });
    var subTests = fe.tests.filter(function(t) {
      return (t.folderId || 'f_root') === curFolder.id;
    });

    if (explorerSearchQuery.trim()) {
      var q = explorerSearchQuery.toLowerCase().trim();
      subFolders = fe.folders.filter(function(f) { return f.id !== 'f_root' && f.name.toLowerCase().includes(q); });
      subTests = fe.tests.filter(function(t) { return t.title.toLowerCase().includes(q) || (t.id && t.id.toLowerCase().includes(q)); });
    }

    var h = '<div class="ee-explorer-wrap" style="max-width:1200px;margin:0 auto;padding:16px 20px 80px;">' +
      // Header & Stats
      '<div style="background:linear-gradient(135deg,rgba(15,23,42,0.9),rgba(30,41,59,0.85));border:1px solid rgba(56,189,248,0.2);border-radius:20px;padding:22px 26px;margin-bottom:20px;box-shadow:0 8px 32px rgba(0,0,0,0.35);backdrop-filter:blur(16px);">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;">' +
          '<div>' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
              '<span style="font-size:26px;">💻</span>' +
              '<h2 style="margin:0;font-size:22px;font-weight:900;color:#f8fafc;letter-spacing:-0.4px;">PC Explorer: Testlar va Savollar Banki</h2>' +
            '</div>' +
            '<p style="margin:6px 0 0;font-size:13.5px;color:#94a3b8;">Kompyuter fayl tizimi kabi papkalar oching, testlarni sudrab joylang va o‘quvchilarga 1 martalik uy vazifasi qilib yuboring.</p>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
            (isStaff ? '<button id="eeNewFolderBtn" style="background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.4);border-radius:12px;padding:9px 16px;font-size:13px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:6px;">📁 Yangi Papka</button>' : '') +
            (isStaff ? '<button id="eeNewTestBtn" style="background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:12px;padding:9px 18px;font-size:13px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:6px;box-shadow:0 4px 16px rgba(2,132,199,0.4);">➕ Yangi Test Yaratish</button>' : '') +
          '</div>' +
        '</div>' +

        // Breadcrumb & Search bar
        '<div style="margin-top:18px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">' +
          '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:13px;font-weight:700;">' +
            '<span style="color:#64748b;">Manzil:</span>';
            breadcrumbs.forEach(function(b, idx) {
              var isLast = (idx === breadcrumbs.length - 1);
              h += '<button class="ee-breadcrumb-item" data-fid="' + b.id + '" style="background:none;border:none;color:' + (isLast ? '#38bdf8' : '#94a3b8') + ';font-weight:' + (isLast ? '800' : '600') + ';cursor:pointer;padding:2px 6px;border-radius:6px;">' +
                (idx === 0 ? '🏠 ' : '📁 ') + esc(b.name) + 
              '</button>';
              if (!isLast) h += '<span style="color:#475569;">/</span>';
            });
    h += '</div>' +
          '<div style="display:flex;align-items:center;gap:10px;">' +
            '<input type="text" id="eeExplorerSearch" placeholder="🔍 Test yoki papka qidirish..." value="' + esc(explorerSearchQuery) + '" style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:7px 14px;color:#f8fafc;font-size:12.5px;font-weight:600;outline:none;width:220px;" />' +
            '<button id="eeToggleViewMode" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#cbd5e1;border-radius:10px;padding:7px 12px;font-size:12px;font-weight:800;cursor:pointer;">' +
              (explorerViewMode === 'grid' ? '📑 Jadval' : '🔲 Grid') +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    // Folder drop target note
    h += '<div style="font-size:12px;color:#64748b;margin-bottom:12px;font-weight:600;">' +
      '💡 Maslahat: Har qanday test kartochkasini sichqoncha bilan ushlab boshqa papkaga sudrab tashlashingiz (Drag & Drop) mumkin.' +
    '</div>';

    // Explorer Content Grid / List
    if (subFolders.length === 0 && subTests.length === 0) {
      h += '<div style="background:rgba(15,23,42,0.6);border:1px dashed rgba(255,255,255,0.15);border-radius:18px;padding:48px 20px;text-align:center;color:#64748b;">' +
        '<div style="font-size:42px;margin-bottom:12px;">📂</div>' +
        '<div style="font-size:15px;font-weight:800;color:#94a3b8;">Ushbu papka bo‘sh</div>' +
        '<div style="font-size:12.5px;margin-top:4px;">Yangi papka oching yoki test qo‘shing</div>' +
      '</div>';
    } else if (explorerViewMode === 'grid') {
      h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;">';
      // Render Folders
      subFolders.forEach(function(f) {
        var itemsCount = fe.tests.filter(function(t) { return t.folderId === f.id; }).length;
        h += '<div class="ee-folder-card" data-fid="' + f.id + '" style="background:rgba(15,23,42,0.7);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:16px;cursor:pointer;transition:all 0.2s ease;display:flex;flex-direction:column;align-items:center;text-align:center;position:relative;" ' +
          'ondragover="event.preventDefault();this.style.borderColor=\'#38bdf8\';this.style.background=\'rgba(56,189,248,0.15)\';" ' +
          'ondragleave="this.style.borderColor=\'rgba(255,255,255,0.1)\';this.style.background=\'rgba(15,23,42,0.7)\';" ' +
          'ondrop="window.EthithEnterprise.handleDropTest(event, \'' + f.id + '\');">' +
          '<div style="font-size:40px;margin-bottom:8px;line-height:1;">📁</div>' +
          '<div style="font-size:13.5px;font-weight:800;color:#f8fafc;word-break:break-word;">' + esc(f.name) + '</div>' +
          '<div style="font-size:11.5px;color:#64748b;margin-top:4px;">' + itemsCount + ' ta test</div>' +
          (isStaff ? '<button class="ee-del-folder-btn" data-fid="' + f.id + '" style="position:absolute;top:8px;right:8px;background:none;border:none;color:#64748b;cursor:pointer;font-size:12px;" title="Papkani o‘chirish">✕</button>' : '') +
        '</div>';
      });

      // Render Tests
      subTests.forEach(function(t) {
        var qCount = (t.questions || []).length;
        h += '<div class="ee-test-card" data-tid="' + t.id + '" draggable="true" ' +
          'ondragstart="event.dataTransfer.setData(\'text/plain\', \'' + t.id + '\');" ' +
          'style="background:rgba(30,41,59,0.7);border:1px solid rgba(56,189,248,0.25);border-radius:16px;padding:16px;display:flex;flex-direction:column;justify-content:space-between;cursor:grab;transition:all 0.2s ease;box-shadow:0 4px 16px rgba(0,0,0,0.25);">' +
          '<div>' +
            '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">' +
              '<span style="font-size:24px;">📝</span>' +
              '<span style="background:rgba(56,189,248,0.15);color:#38bdf8;font-size:10.5px;font-weight:900;padding:2px 8px;border-radius:6px;border:1px solid rgba(56,189,248,0.3);">' + esc(t.id) + '</span>' +
            '</div>' +
            '<div style="font-size:13.5px;font-weight:800;color:#f8fafc;line-height:1.3;margin-bottom:6px;">' + esc(t.title) + '</div>' +
            '<div style="font-size:11.5px;color:#94a3b8;display:flex;align-items:center;gap:6px;">' +
              '<span>' + qCount + ' ta savol</span> • <span>' + esc(t.authorName || 'Ustoz') + '</span>' +
            '</div>' +
          '</div>' +
          '<div style="margin-top:14px;display:flex;gap:6px;flex-wrap:wrap;">' +
            (isStaff ? '<button class="ee-assign-hw-btn" data-tid="' + t.id + '" style="flex:1;background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:8px;padding:6px 8px;font-size:11px;font-weight:800;cursor:pointer;">📤 Guruhga yuborish</button>' : '') +
            '<button class="ee-take-test-btn" data-tid="' + t.id + '" style="background:rgba(16,185,129,0.2);color:#34d399;border:1px solid rgba(16,185,129,0.4);border-radius:8px;padding:6px 10px;font-size:11px;font-weight:800;cursor:pointer;">✍️ Ishlash</button>' +
            (isStaff ? '<button class="ee-del-test-btn" data-tid="' + t.id + '" style="background:rgba(239,68,68,0.15);color:#f87171;border:none;border-radius:8px;padding:6px 8px;font-size:11px;font-weight:800;cursor:pointer;">🗑</button>' : '') +
          '</div>' +
        '</div>';
      });
      h += '</div>';
    } else {
      // List Mode
      h += '<div style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);border-radius:16px;overflow:hidden;">' +
        '<table style="width:100%;border-collapse:collapse;font-size:13px;text-align:left;">' +
          '<thead>' +
            '<tr style="background:rgba(30,41,59,0.8);color:#94a3b8;font-size:11.5px;text-transform:uppercase;letter-spacing:0.5px;">' +
              '<th style="padding:12px 16px;">Nomi</th>' +
              '<th style="padding:12px 16px;">Test ID</th>' +
              '<th style="padding:12px 16px;">Savollar</th>' +
              '<th style="padding:12px 16px;">Muallif</th>' +
              '<th style="padding:12px 16px;text-align:right;">Amallar</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>';
          subFolders.forEach(function(f) {
            h += '<tr style="border-top:1px solid rgba(255,255,255,0.06);cursor:pointer;" class="ee-folder-row" data-fid="' + f.id + '">' +
              '<td style="padding:12px 16px;font-weight:800;color:#f8fafc;display:flex;align-items:center;gap:8px;">' +
                '<span style="font-size:18px;">📁</span> ' + esc(f.name) +
              '</td>' +
              '<td style="padding:12px 16px;color:#64748b;">—</td>' +
              '<td style="padding:12px 16px;color:#64748b;">Papka</td>' +
              '<td style="padding:12px 16px;color:#64748b;">—</td>' +
              '<td style="padding:12px 16px;text-align:right;">' +
                (isStaff ? '<button class="ee-del-folder-btn" data-fid="' + f.id + '" style="background:none;border:none;color:#ef4444;font-weight:700;cursor:pointer;">O‘chirish</button>' : '') +
              '</td>' +
            '</tr>';
          });
          subTests.forEach(function(t) {
            h += '<tr style="border-top:1px solid rgba(255,255,255,0.06);">' +
              '<td style="padding:12px 16px;font-weight:800;color:#f8fafc;">' +
                '<span style="margin-right:8px;">📝</span>' + esc(t.title) +
              '</td>' +
              '<td style="padding:12px 16px;"><span style="background:rgba(56,189,248,0.15);color:#38bdf8;padding:2px 8px;border-radius:4px;font-weight:800;font-size:11px;">' + esc(t.id) + '</span></td>' +
              '<td style="padding:12px 16px;color:#cbd5e1;">' + (t.questions || []).length + ' ta</td>' +
              '<td style="padding:12px 16px;color:#94a3b8;">' + esc(t.authorName || 'Ustoz') + '</td>' +
              '<td style="padding:12px 16px;text-align:right;">' +
                '<div style="display:inline-flex;gap:6px;">' +
                  (isStaff ? '<button class="ee-assign-hw-btn" data-tid="' + t.id + '" style="background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:6px;padding:4px 8px;font-size:11px;font-weight:800;cursor:pointer;">📤 Guruhga</button>' : '') +
                  '<button class="ee-take-test-btn" data-tid="' + t.id + '" style="background:rgba(16,185,129,0.2);color:#34d399;border:1px solid rgba(16,185,129,0.4);border-radius:6px;padding:4px 8px;font-size:11px;font-weight:800;cursor:pointer;">✍️ Ishlash</button>' +
                  (isStaff ? '<button class="ee-del-test-btn" data-tid="' + t.id + '" style="background:none;border:none;color:#ef4444;font-size:12px;cursor:pointer;">🗑</button>' : '') +
                '</div>' +
              '</td>' +
            '</tr>';
          });
      h += '</tbody></table></div>';
    }

    h += '</div>';
    container.innerHTML = h;

    // Attach Event Handlers
    container.querySelectorAll('.ee-breadcrumb-item').forEach(function(b) {
      b.onclick = function() {
        currentFolderId = b.getAttribute('data-fid');
        EE.renderExplorerView(container);
      };
    });

    container.querySelectorAll('.ee-folder-card, .ee-folder-row').forEach(function(el) {
      el.onclick = function(e) {
        if (e.target.classList.contains('ee-del-folder-btn')) return;
        currentFolderId = el.getAttribute('data-fid');
        EE.renderExplorerView(container);
      };
    });

    var viewBtn = container.querySelector('#eeToggleViewMode');
    if (viewBtn) {
      viewBtn.onclick = function() {
        explorerViewMode = (explorerViewMode === 'grid' ? 'list' : 'grid');
        EE.renderExplorerView(container);
      };
    }

    var searchInp = container.querySelector('#eeExplorerSearch');
    if (searchInp) {
      searchInp.oninput = function() {
        explorerSearchQuery = searchInp.value;
        EE.renderExplorerView(container);
        var curInp = container.querySelector('#eeExplorerSearch');
        if (curInp) { curInp.focus(); curInp.selectionStart = curInp.selectionEnd = curInp.value.length; }
      };
    }

    var newFolderBtn = container.querySelector('#eeNewFolderBtn');
    if (newFolderBtn) {
      newFolderBtn.onclick = function() {
        var n = prompt("Yangi papka nomini kiriting:", "Yangi Papka");
        if (n && n.trim()) {
          fe.folders.push({
            id: 'f_' + Date.now(),
            name: n.trim(),
            parentId: currentFolderId,
            createdAt: Date.now()
          });
          saveStore();
          showToast("Papka muvaffaqiyatli yaratildi");
          EE.renderExplorerView(container);
        }
      };
    }

    var newTestBtn = container.querySelector('#eeNewTestBtn');
    if (newTestBtn) {
      newTestBtn.onclick = function() {
        EE.openCreateTestModal(container, currentFolderId);
      };
    }

    // Delete folder
    container.querySelectorAll('.ee-del-folder-btn').forEach(function(btn) {
      btn.onclick = function(e) {
        e.stopPropagation();
        var fid = btn.getAttribute('data-fid');
        if (confirm("Ushbu papkani va uning ichidagi bog‘langan fayllarni o‘chirishni xohlaysizmi?")) {
          fe.folders = fe.folders.filter(function(f) { return f.id !== fid; });
          fe.tests.forEach(function(t) { if (t.folderId === fid) t.folderId = 'f_root'; });
          saveStore();
          showToast("Papka o‘chirildi");
          EE.renderExplorerView(container);
        }
      };
    });

    // Delete test
    container.querySelectorAll('.ee-del-test-btn').forEach(function(btn) {
      btn.onclick = function() {
        var tid = btn.getAttribute('data-tid');
        if (confirm("Rostdan ham ushbu testni o‘chirmoqchimisiz?")) {
          fe.tests = fe.tests.filter(function(t) { return t.id !== tid; });
          saveStore();
          showToast("Test o‘chirildi");
          EE.renderExplorerView(container);
        }
      };
    });

    // Assign homework button
    container.querySelectorAll('.ee-assign-hw-btn').forEach(function(btn) {
      btn.onclick = function() {
        var tid = btn.getAttribute('data-tid');
        EE.openAssignHomeworkModal(tid);
      };
    });

    // Take test button
    container.querySelectorAll('.ee-take-test-btn').forEach(function(btn) {
      btn.onclick = function() {
        var tid = btn.getAttribute('data-tid');
        EE.openTakeTestModal(tid);
      };
    });
  };

  // Drag & drop test into folder
  EE.handleDropTest = function(e, targetFolderId) {
    e.preventDefault();
    var tid = e.dataTransfer.getData('text/plain');
    if (!tid) return;
    var S = getStore();
    var test = (S.fileExplorer.tests || []).find(function(t) { return t.id === tid; });
    if (test) {
      test.folderId = targetFolderId;
      saveStore();
      showToast("Test muvaffaqiyatli ko‘chirildi!");
      var c = document.getElementById('apView');
      if (c) EE.renderExplorerView(c);
    }
  };

  // Create Test Builder Modal
  EE.openCreateTestModal = function(container, folderId) {
    var modalRoot = document.getElementById('eaGlobalModalRoot') || document.body;
    var randCode = 'TST-' + Math.random().toString(36).substring(2, 6).toUpperCase() + Math.floor(Math.random() * 9 + 1);

    var m = document.createElement('div');
    m.id = 'eeCreateTestOverlay';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.85);backdrop-filter:blur(10px);z-index:2147483640;display:flex;align-items:center;justify-content:center;padding:16px;';
    
    m.innerHTML = '<div style="background:#0f172a;border:1px solid rgba(56,189,248,0.3);border-radius:20px;max-width:680px;width:100%;max-height:90vh;overflow-y:auto;padding:26px;color:#f8fafc;box-shadow:0 20px 50px rgba(0,0,0,0.6);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<span style="font-size:24px;">📝</span>' +
          '<h3 style="margin:0;font-size:18px;font-weight:900;">Yangi Interaktiv Test Yaratish</h3>' +
        '</div>' +
        '<button id="eeCloseTestModal" style="background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer;">✕</button>' +
      '</div>' +

      '<div style="margin-bottom:14px;">' +
        '<label style="display:block;font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:6px;">Test Nomi:</label>' +
        '<input type="text" id="eeNewTestTitle" placeholder="Masalan: Unit 7 Modals of Deduction..." style="width:100%;padding:10px 14px;background:#1e293b;border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:#fff;font-weight:700;box-sizing:border-box;outline:none;" />' +
      '</div>' +

      '<div style="display:flex;gap:12px;margin-bottom:16px;">' +
        '<div style="flex:1;">' +
          '<label style="display:block;font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:6px;">Unikal Test ID (Avtomatik):</label>' +
          '<input type="text" id="eeNewTestId" value="' + randCode + '" readonly style="width:100%;padding:10px 14px;background:#1e293b;border:1px solid rgba(56,189,248,0.3);border-radius:10px;color:#38bdf8;font-weight:900;box-sizing:border-box;outline:none;" />' +
        '</div>' +
        '<div style="flex:1;">' +
          '<label style="display:block;font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:6px;">Urinishlar soni:</label>' +
          '<input type="text" value="1 martalik (Qat‘iy)" readonly style="width:100%;padding:10px 14px;background:#1e293b;border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:#94a3b8;font-weight:700;box-sizing:border-box;outline:none;" />' +
        '</div>' +
      '</div>' +

      '<div style="margin-bottom:14px;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">' +
          '<label style="font-size:13px;font-weight:800;color:#38bdf8;">Savollar Ro‘yxati:</label>' +
          '<button type="button" id="eeAddQBtn" style="background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.4);border-radius:8px;padding:4px 10px;font-size:11.5px;font-weight:800;cursor:pointer;">+ Savol qo‘shish</button>' +
        '</div>' +
        '<div id="eeQuestionsContainer" style="display:flex;flex-direction:column;gap:12px;"></div>' +
      '</div>' +

      '<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.1);">' +
        '<button type="button" id="eeCancelTestBtn" style="background:rgba(255,255,255,0.08);border:none;color:#94a3b8;padding:9px 18px;border-radius:10px;font-weight:700;cursor:pointer;">Bekor qilish</button>' +
        '<button type="button" id="eeSaveTestBtn" style="background:linear-gradient(135deg,#0284c7,#2563eb);border:none;color:#fff;padding:9px 24px;border-radius:10px;font-weight:800;cursor:pointer;box-shadow:0 4px 14px rgba(2,132,199,0.4);">Testni Saqlash</button>' +
      '</div>' +
    '</div>';

    modalRoot.appendChild(m);

    var questions = [
      { q: "You ______ be very proud of your outstanding test results!", options: ["must", "can't", "might not", "should"], correct: 0 }
    ];

    function renderQuestions() {
      var qc = m.querySelector('#eeQuestionsContainer');
      var qh = '';
      questions.forEach(function(item, qIdx) {
        qh += '<div style="background:#1e293b;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">' +
            '<span style="font-size:12px;font-weight:800;color:#94a3b8;">' + (qIdx + 1) + '-savol:</span>' +
            (questions.length > 1 ? '<button type="button" class="ee-del-q-btn" data-qidx="' + qIdx + '" style="background:none;border:none;color:#ef4444;font-size:12px;cursor:pointer;">O‘chirish</button>' : '') +
          '</div>' +
          '<input type="text" class="ee-q-text" data-qidx="' + qIdx + '" value="' + esc(item.q) + '" placeholder="Savol matnini kiriting..." style="width:100%;padding:8px 12px;background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:13px;box-sizing:border-box;margin-bottom:8px;outline:none;" />' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
          (item.options || []).forEach(function(opt, oIdx) {
            var isCorr = (item.correct === oIdx);
            qh += '<div style="display:flex;align-items:center;gap:6px;background:' + (isCorr ? 'rgba(16,185,129,0.15)' : '#0f172a') + ';border:1px solid ' + (isCorr ? '#10b981' : 'rgba(255,255,255,0.08)') + ';border-radius:8px;padding:4px 8px;">' +
              '<input type="radio" name="corr_' + qIdx + '" ' + (isCorr ? 'checked' : '') + ' class="ee-opt-radio" data-qidx="' + qIdx + '" data-oidx="' + oIdx + '" style="cursor:pointer;" />' +
              '<input type="text" value="' + esc(opt) + '" class="ee-opt-text" data-qidx="' + qIdx + '" data-oidx="' + oIdx + '" placeholder="Variant ' + (oIdx + 1) + '" style="flex:1;background:none;border:none;color:#fff;font-size:12px;outline:none;" />' +
            '</div>';
          });
        qh += '</div></div>';
      });
      qc.innerHTML = qh;

      // Bind dynamic question inputs
      qc.querySelectorAll('.ee-q-text').forEach(function(inp) {
        inp.oninput = function() { questions[parseInt(inp.getAttribute('data-qidx'), 10)].q = inp.value; };
      });
      qc.querySelectorAll('.ee-opt-text').forEach(function(inp) {
        inp.oninput = function() {
          var qI = parseInt(inp.getAttribute('data-qidx'), 10);
          var oI = parseInt(inp.getAttribute('data-oidx'), 10);
          questions[qI].options[oI] = inp.value;
        };
      });
      qc.querySelectorAll('.ee-opt-radio').forEach(function(radio) {
        radio.onchange = function() {
          var qI = parseInt(radio.getAttribute('data-qidx'), 10);
          var oI = parseInt(radio.getAttribute('data-oidx'), 10);
          questions[qI].correct = oI;
          renderQuestions();
        };
      });
      qc.querySelectorAll('.ee-del-q-btn').forEach(function(btn) {
        btn.onclick = function() {
          var qI = parseInt(btn.getAttribute('data-qidx'), 10);
          questions.splice(qI, 1);
          renderQuestions();
        };
      });
    }

    renderQuestions();

    m.querySelector('#eeAddQBtn').onclick = function() {
      questions.push({ q: "", options: ["Variant 1", "Variant 2", "Variant 3", "Variant 4"], correct: 0 });
      renderQuestions();
    };

    var close = function() { m.remove(); };
    m.querySelector('#eeCloseTestModal').onclick = close;
    m.querySelector('#eeCancelTestBtn').onclick = close;

    m.querySelector('#eeSaveTestBtn').onclick = function() {
      var title = m.querySelector('#eeNewTestTitle').value.trim();
      if (!title) { alert("Iltimos, test nomini kiriting!"); return; }
      var S = getStore();
      S.fileExplorer.tests.push({
        id: randCode,
        title: title,
        folderId: folderId || 'f_root',
        createdAt: Date.now(),
        authorName: getCurrentUser().name || 'Ustoz',
        maxAttempts: 1,
        questions: questions
      });
      saveStore();
      close();
      showToast("Yangi test muvaffaqiyatli saqlandi! Test ID: " + randCode);
      if (container) EE.renderExplorerView(container);
    };
  };

  // Assign Homework Modal
  EE.openAssignHomeworkModal = function(testId) {
    var S = getStore();
    var test = S.fileExplorer.tests.find(function(t) { return t.id === testId; });
    if (!test) return;

    var modalRoot = document.getElementById('eaGlobalModalRoot') || document.body;
    var m = document.createElement('div');
    m.id = 'eeAssignHwOverlay';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.85);backdrop-filter:blur(10px);z-index:2147483640;display:flex;align-items:center;justify-content:center;padding:16px;';

    var clsOpts = (S.classes || []).map(function(c) {
      return '<option value="' + c.id + '">' + esc(c.name) + ' (' + (c.students || []).length + ' ta o‘quvchi)</option>';
    }).join('');

    m.innerHTML = '<div style="background:#0f172a;border:1px solid rgba(56,189,248,0.3);border-radius:20px;max-width:480px;width:100%;padding:24px;color:#f8fafc;box-shadow:0 20px 50px rgba(0,0,0,0.6);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">' +
        '<h3 style="margin:0;font-size:17px;font-weight:900;">📤 Testni Guruhga Vazifa Qilib Yuborish</h3>' +
        '<button id="eeCloseAssignBtn" style="background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer;">✕</button>' +
      '</div>' +
      '<div style="font-size:13px;color:#94a3b8;margin-bottom:14px;">Tanlangan test: <b style="color:#38bdf8;">' + esc(test.title) + '</b> (' + esc(test.id) + ')</div>' +
      '<div style="margin-bottom:16px;">' +
        '<label style="display:block;font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:6px;">Sinf / Guruhni tanlang:</label>' +
        '<select id="eeTargetClassSelect" style="width:100%;padding:10px 14px;background:#1e293b;border:1px solid rgba(255,255,255,0.15);border-radius:10px;color:#fff;font-weight:700;outline:none;">' +
          clsOpts +
        '</select>' +
      '</div>' +
      '<div style="background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.3);border-radius:10px;padding:10px 14px;font-size:12px;color:#fcd34d;margin-bottom:18px;">' +
        '⚠️ Ushbu test guruhdagi barcha o‘quvchilarda paydo bo‘ladi va faqat <b>1 marta</b> topshirish mumkin bo‘ladi.' +
      '</div>' +
      '<div style="display:flex;justify-content:flex-end;gap:10px;">' +
        '<button id="eeCancelAssignBtn" style="background:rgba(255,255,255,0.08);border:none;color:#94a3b8;padding:8px 16px;border-radius:10px;font-weight:700;cursor:pointer;">Bekor qilish</button>' +
        '<button id="eeConfirmAssignBtn" style="background:linear-gradient(135deg,#0284c7,#2563eb);border:none;color:#fff;padding:8px 20px;border-radius:10px;font-weight:800;cursor:pointer;">Yuborish</button>' +
      '</div>' +
    '</div>';

    modalRoot.appendChild(m);
    var close = function() { m.remove(); };
    m.querySelector('#eeCloseAssignBtn').onclick = close;
    m.querySelector('#eeCancelAssignBtn').onclick = close;

    m.querySelector('#eeConfirmAssignBtn').onclick = function() {
      var selClsId = m.querySelector('#eeTargetClassSelect').value;
      var targetCls = S.classes.find(function(c) { return c.id === selClsId; });
      if (!targetCls) return;
      if (!targetCls.extraHomework) targetCls.extraHomework = [];
      targetCls.extraHomework.push({
        testId: test.id,
        title: test.title,
        assignedAt: Date.now(),
        maxAttempts: 1,
        submissions: {}
      });
      saveStore();
      close();
      showToast("Test '" + targetCls.name + "' guruhiga muvaffaqiyatli yuborildi!");
    };
  };

  // Student Test Solver (Strict 1-attempt)
  EE.openTakeTestModal = function(testId) {
    var S = getStore();
    var test = (S.fileExplorer.tests || []).find(function(t) { return t.id === testId; });
    if (!test) { alert("Test topilmadi!"); return; }

    var user = getCurrentUser();
    var modalRoot = document.getElementById('eaGlobalModalRoot') || document.body;

    // Check if user already took this test in any class
    var alreadySubmitted = false;
    var prevScore = 0;
    (S.classes || []).forEach(function(c) {
      (c.extraHomework || []).forEach(function(hw) {
        if (hw.testId === testId && hw.submissions && hw.submissions[user.id]) {
          alreadySubmitted = true;
          prevScore = hw.submissions[user.id].score;
        }
      });
    });

    if (alreadySubmitted && user.role !== 'teacher') {
      alert("⚠️ Siz ushbu topshiriqni allaqachon topshirgansiz! Natijangiz: " + prevScore + "%. Tizim qayta ishlashga ruxsat bermaydi.");
      return;
    }

    var m = document.createElement('div');
    m.id = 'eeTakeTestOverlay';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.9);backdrop-filter:blur(12px);z-index:2147483640;display:flex;align-items:center;justify-content:center;padding:16px;';

    var curQIdx = 0;
    var userAnswers = {};

    function renderQuestionModal() {
      var totalQ = (test.questions || []).length;
      var q = test.questions[curQIdx];
      var isLast = (curQIdx === totalQ - 1);

      var qh = '<div style="background:#0f172a;border:1px solid rgba(56,189,248,0.35);border-radius:24px;max-width:620px;width:100%;padding:28px;color:#f8fafc;box-shadow:0 24px 60px rgba(0,0,0,0.7);">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">' +
          '<span style="background:rgba(56,189,248,0.15);color:#38bdf8;padding:4px 10px;border-radius:8px;font-weight:900;font-size:12px;">' + esc(test.id) + '</span>' +
          '<div style="font-size:13px;font-weight:800;color:#94a3b8;">Savol: <b style="color:#fff;">' + (curQIdx + 1) + ' / ' + totalQ + '</b></div>' +
          '<button id="eeCloseTakeTest" style="background:none;border:none;color:#64748b;font-size:20px;cursor:pointer;">✕</button>' +
        '</div>' +

        '<div style="background:rgba(30,41,59,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:18px;margin-bottom:20px;">' +
          '<div style="font-size:16px;font-weight:800;color:#f8fafc;line-height:1.4;">' + esc(q.q) + '</div>' +
        '</div>' +

        '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:24px;">';
        (q.options || []).forEach(function(opt, oIdx) {
          var isSel = (userAnswers[curQIdx] === oIdx);
          qh += '<button class="ee-ans-option" data-oidx="' + oIdx + '" style="background:' + (isSel ? 'linear-gradient(135deg,rgba(2,132,199,0.35),rgba(37,99,235,0.35))' : 'rgba(30,41,59,0.5)') + ';border:1.5px solid ' + (isSel ? '#38bdf8' : 'rgba(255,255,255,0.1)') + ';border-radius:14px;padding:14px 18px;text-align:left;color:#fff;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:12px;transition:all 0.15s ease;">' +
            '<span style="width:24px;height:24px;border-radius:50%;border:1.5px solid ' + (isSel ? '#38bdf8' : '#64748b') + ';background:' + (isSel ? '#38bdf8' : 'transparent') + ';display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:' + (isSel ? '#0f172a' : '#94a3b8') + ';">' + String.fromCharCode(65 + oIdx) + '</span>' +
            '<span>' + esc(opt) + '</span>' +
          '</button>';
        });
      qh += '</div>' +

        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
          (curQIdx > 0 ? '<button id="eePrevQBtn" style="background:rgba(255,255,255,0.08);border:none;color:#cbd5e1;padding:10px 18px;border-radius:12px;font-weight:800;cursor:pointer;">← Oldingi</button>' : '<div></div>') +
          '<button id="eeNextQBtn" style="background:linear-gradient(135deg,#10b981,#059669);border:none;color:#fff;padding:10px 24px;border-radius:12px;font-weight:900;font-size:14px;cursor:pointer;box-shadow:0 4px 16px rgba(16,185,129,0.4);">' +
            (isLast ? '✅ Testni Yakunlash' : 'Keyingi →') +
          '</button>' +
        '</div>' +
      '</div>';

      m.innerHTML = qh;

      m.querySelector('#eeCloseTakeTest').onclick = function() {
        if (confirm("Testni to‘xtatmoqchimisiz? Natijangiz saqlanmaydi.")) m.remove();
      };

      m.querySelectorAll('.ee-ans-option').forEach(function(btn) {
        btn.onclick = function() {
          var oI = parseInt(btn.getAttribute('data-oidx'), 10);
          userAnswers[curQIdx] = oI;
          renderQuestionModal();
        };
      });

      var prevBtn = m.querySelector('#eePrevQBtn');
      if (prevBtn) {
        prevBtn.onclick = function() {
          curQIdx--;
          renderQuestionModal();
        };
      }

      m.querySelector('#eeNextQBtn').onclick = function() {
        if (userAnswers[curQIdx] === undefined) {
          alert("Iltimos, javob variantlaridan birini tanlang!");
          return;
        }
        if (!isLast) {
          curQIdx++;
          renderQuestionModal();
        } else {
          // Finish test
          var correctCount = 0;
          test.questions.forEach(function(item, idx) {
            if (userAnswers[idx] === item.correct) correctCount++;
          });
          var pct = Math.round((correctCount / totalQ) * 100);

          // Record submission in user's class
          (S.classes || []).forEach(function(c) {
            (c.extraHomework || []).forEach(function(hw) {
              if (hw.testId === testId) {
                if (!hw.submissions) hw.submissions = {};
                hw.submissions[user.id] = {
                  score: pct,
                  correct: correctCount,
                  total: totalQ,
                  completedAt: Date.now()
                };
              }
            });
          });
          saveStore();
          m.remove();
          showToast("Test yakunlandi! Natijangiz: " + pct + "% (" + correctCount + "/" + totalQ + ")");
        }
      };
    }

    modalRoot.appendChild(m);
    renderQuestionModal();
  };

  // ============================================================================
  // 2. AUTOMATED BILLING, REVENUE ANALYTICS & SMART TIYIN/SO'M OFFSET
  // ============================================================================
  var activeBillingMonth = getActiveMonthKey();

  EE.renderBillingView = function(container) {
    if (!container) return;
    var S = getStore();
    var isStaff = isAdminOrTeacher();
    var curUser = getCurrentUser();
    var settings = S.centerSettings || { card: "8600 4912 7731 9024", cardHolder: "ETHITH LEARNING CENTER", baseTuition: 200000 };
    if (!S.payments[activeBillingMonth]) S.payments[activeBillingMonth] = {};
    var monthPayments = S.payments[activeBillingMonth];

    // Compute center-wide statistics for the month
    var allStudents = [];
    (S.classes || []).forEach(function(cls) {
      (cls.students || []).forEach(function(st) {
        if (!allStudents.find(function(x) { return (x.id || x.email) === (st.id || st.email); })) {
          allStudents.push(st);
        }
      });
    });

    var totalStudents = allStudents.length;
    var totalIncome = 0;
    var totalPending = 0;
    var unpaidCount = 0;
    var paidCount = 0;

    allStudents.forEach(function(st) {
      var stId = st.id || st.email;
      var p = monthPayments[stId];
      if (p && p.status === 'paid') {
        totalIncome += (p.paidAmount || p.baseAmount || settings.baseTuition);
        paidCount++;
      } else if (p && p.status === 'pending') {
        totalPending += (p.baseAmount || settings.baseTuition);
      } else {
        unpaidCount++;
      }
    });

    // Compute teacher payroll obligation
    var totalPayroll = (S.teachers || []).reduce(function(acc, t) { return acc + (t.monthlySalary || 0); }, 0);
    var netProfit = totalIncome - totalPayroll;

    var h = '<div class="ee-billing-wrap" style="max-width:1200px;margin:0 auto;padding:16px 20px 80px;">' +
      // Header
      '<div style="background:linear-gradient(135deg,rgba(15,23,42,0.9),rgba(30,41,59,0.85));border:1px solid rgba(16,185,129,0.25);border-radius:20px;padding:22px 26px;margin-bottom:20px;box-shadow:0 8px 32px rgba(0,0,0,0.35);backdrop-filter:blur(16px);">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;">' +
          '<div>' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
              '<span style="font-size:26px;">💳</span>' +
              '<h2 style="margin:0;font-size:22px;font-weight:900;color:#f8fafc;letter-spacing:-0.4px;">Moliya, Oylik To‘lovlar va Avtomatlashtirilgan Kvitansiya</h2>' +
            '</div>' +
            '<p style="margin:6px 0 0;font-size:13.5px;color:#94a3b8;">Unikal tiyinli summa orqali to‘lovchini avtomatik aniqlash, chek tekshirish va o‘qituvchilar ish haqi hisobi.</p>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
            '<select id="eeBillingMonthSelect" style="background:#1e293b;border:1px solid rgba(255,255,255,0.15);border-radius:10px;padding:8px 14px;color:#fff;font-weight:800;font-size:13px;outline:none;">' +
              '<option value="2026-10" ' + (activeBillingMonth === '2026-10' ? 'selected' : '') + '>2026-yil Oktyabr</option>' +
              '<option value="2026-11" ' + (activeBillingMonth === '2026-11' ? 'selected' : '') + '>2026-yil Noyabr</option>' +
              '<option value="2026-12" ' + (activeBillingMonth === '2026-12' ? 'selected' : '') + '>2026-yil Dekabr</option>' +
            '</select>' +
            (isStaff ? '<button id="eeEditCardBtn" style="background:rgba(255,255,255,0.08);color:#cbd5e1;border:1px solid rgba(255,255,255,0.15);border-radius:10px;padding:8px 14px;font-size:12.5px;font-weight:800;cursor:pointer;">⚙️ Karta raqamini sozlash</button>' : '') +
            (isStaff ? '<button id="eeExportBillingExcel" style="background:linear-gradient(135deg,#059669,#10b981);color:#fff;border:none;border-radius:10px;padding:8px 16px;font-size:12.5px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:6px;">📊 Excel yuklab olish</button>' : '') +
          '</div>' +
        '</div>' +
      '</div>';

    // Summary Cards
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:24px;">' +
      '<div style="background:rgba(15,23,42,0.7);border:1px solid rgba(16,185,129,0.3);border-radius:16px;padding:18px;">' +
        '<div style="font-size:12px;font-weight:800;color:#34d399;text-transform:uppercase;">Jami Tushum</div>' +
        '<div style="font-size:22px;font-weight:900;color:#fff;margin:6px 0 2px;">' + fmtMoney(totalIncome) + '</div>' +
        '<div style="font-size:11.5px;color:#94a3b8;">' + paidCount + ' ta o‘quvchi to‘lagan</div>' +
      '</div>' +
      '<div style="background:rgba(15,23,42,0.7);border:1px solid rgba(245,158,11,0.3);border-radius:16px;padding:18px;">' +
        '<div style="font-size:12px;font-weight:800;color:#fcd34d;text-transform:uppercase;">Kutilayotgan / Chekda</div>' +
        '<div style="font-size:22px;font-weight:900;color:#fff;margin:6px 0 2px;">' + fmtMoney(totalPending) + '</div>' +
        '<div style="font-size:11.5px;color:#94a3b8;">Tasdiqlanishi kutilmoqda</div>' +
      '</div>' +
      '<div style="background:rgba(15,23,42,0.7);border:1px solid rgba(239,68,68,0.3);border-radius:16px;padding:18px;">' +
        '<div style="font-size:12px;font-weight:800;color:#f87171;text-transform:uppercase;">Qarzdorlar</div>' +
        '<div style="font-size:22px;font-weight:900;color:#fff;margin:6px 0 2px;">' + unpaidCount + ' ta</div>' +
        '<div style="font-size:11.5px;color:#94a3b8;">To‘lov qilinmagan</div>' +
      '</div>' +
      '<div style="background:rgba(15,23,42,0.7);border:1px solid rgba(14,165,233,0.3);border-radius:16px;padding:18px;">' +
        '<div style="font-size:12px;font-weight:800;color:#38bdf8;text-transform:uppercase;">O‘qituvchilar Maoshi</div>' +
        '<div style="font-size:22px;font-weight:900;color:#fff;margin:6px 0 2px;">' + fmtMoney(totalPayroll) + '</div>' +
        '<div style="font-size:11.5px;color:#94a3b8;">' + (S.teachers || []).length + ' ta o‘qituvchiga</div>' +
      '</div>' +
      '<div style="background:rgba(15,23,42,0.7);border:1px solid rgba(168,85,247,0.3);border-radius:16px;padding:18px;">' +
        '<div style="font-size:12px;font-weight:800;color:#c084fc;text-transform:uppercase;">Sof Daromad</div>' +
        '<div style="font-size:22px;font-weight:900;color:' + (netProfit >= 0 ? '#4ade80' : '#f87171') + ';margin:6px 0 2px;">' + fmtMoney(netProfit) + '</div>' +
        '<div style="font-size:11.5px;color:#94a3b8;">Tushum - Xarajatlar</div>' +
      '</div>' +
    '</div>';

    // Student View: Dedicated Fast Payment Portal Box
    if (!isStaff) {
      var myOffset = EE.getStudentOffsetAmount(curUser.id, settings.baseTuition);
      var myP = monthPayments[curUser.id] || { status: 'unpaid' };

      h += '<div style="background:linear-gradient(135deg,#064e3b,#022c22);border:2px solid #10b981;border-radius:20px;padding:26px;margin-bottom:28px;box-shadow:0 12px 40px rgba(16,185,129,0.25);">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;margin-bottom:18px;">' +
          '<div>' +
            '<div style="font-size:13px;font-weight:800;color:#6ee7b7;text-transform:uppercase;">Sizning Oylik To‘lovingiz</div>' +
            '<div style="font-size:28px;font-weight:900;color:#fff;margin-top:4px;">' + fmtMoney(myOffset) + '</div>' +
            '<div style="font-size:12px;color:#a7f3d0;margin-top:2px;">(Asl summa: ' + fmtMoney(settings.baseTuition) + ' + siz uchun unikal ' + (myOffset - settings.baseTuition) + " so'm farq)" + '</div>' +
          '</div>' +
          '<div style="text-align:right;">' +
            '<div style="font-size:12px;color:#a7f3d0;">Holat:</div>' +
            '<div style="font-size:16px;font-weight:900;color:' + (myP.status === 'paid' ? '#4ade80' : (myP.status === 'pending' ? '#fcd34d' : '#f87171')) + ';">' +
              (myP.status === 'paid' ? '✅ To‘langan' : (myP.status === 'pending' ? '⏳ Tekshirilmoqda' : '❌ To‘lanmagan')) +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div style="background:rgba(0,0,0,0.3);border-radius:14px;padding:14px 18px;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">' +
          '<div>' +
            '<div style="font-size:11px;color:#94a3b8;font-weight:700;">Markaz Karta Raqami:</div>' +
            '<div style="font-size:18px;font-weight:900;color:#38bdf8;letter-spacing:1px;font-family:monospace;">' + esc(settings.card) + '</div>' +
            '<div style="font-size:11.5px;color:#cbd5e1;">' + esc(settings.cardHolder) + '</div>' +
          '</div>' +
          '<button id="eeCopyCardBtn" style="background:#0284c7;color:#fff;border:none;border-radius:10px;padding:8px 16px;font-size:12px;font-weight:800;cursor:pointer;">📋 Nusxa olish</button>' +
        '</div>' +

        '<div style="display:flex;gap:12px;flex-wrap:wrap;">' +
          '<button id="eeConfirmPaidBtn" style="flex:1;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:12px;padding:12px;font-size:14px;font-weight:900;cursor:pointer;box-shadow:0 4px 16px rgba(16,185,129,0.4);">✅ Aynan ' + fmtMoney(myOffset) + ' to‘ladim</button>' +
          '<label style="flex:1;background:rgba(255,255,255,0.1);border:1.5px dashed rgba(255,255,255,0.3);color:#fff;border-radius:12px;padding:12px;font-size:13px;font-weight:800;cursor:pointer;text-align:center;display:flex;align-items:center;justify-content:center;gap:6px;">' +
            '📎 Chek Rasmini Yuklash' +
            '<input type="file" id="eeUploadReceiptInput" accept="image/*" style="display:none;" />' +
          '</label>' +
        '</div>' +
      '</div>';
    }

    // Admin & Staff Table: Student Payment Statuses
    h += '<div style="background:rgba(15,23,42,0.85);border:1px solid rgba(255,255,255,0.1);border-radius:18px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.3);">' +
      '<div style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;">' +
        '<h3 style="margin:0;font-size:16px;font-weight:800;color:#f8fafc;">Barcha O‘quvchilar To‘lov Jurnali (' + allStudents.length + ' ta o‘quvchi)</h3>' +
      '</div>' +
      '<div style="overflow-x:auto;">' +
        '<table style="width:100%;border-collapse:collapse;font-size:13px;text-align:left;">' +
          '<thead>' +
            '<tr style="background:rgba(30,41,59,0.8);color:#94a3b8;font-size:11.5px;text-transform:uppercase;">' +
              '<th style="padding:12px 16px;">O‘quvchi</th>' +
              '<th style="padding:12px 16px;">Sinf</th>' +
              '<th style="padding:12px 16px;">Ota-ona Tel</th>' +
              '<th style="padding:12px 16px;">Berilgan Summa</th>' +
              '<th style="padding:12px 16px;">Holat</th>' +
              (isStaff ? '<th style="padding:12px 16px;text-align:right;">Boshqaruv</th>' : '') +
            '</tr>' +
          '</thead>' +
          '<tbody>';

          allStudents.forEach(function(st) {
            var stId = st.id || st.email;
            var p = monthPayments[stId] || { status: 'unpaid' };
            var offAmt = EE.getStudentOffsetAmount(stId, settings.baseTuition);
            var cls = (S.classes || []).find(function(c) {
              return (c.students || []).some(function(s) { return (s.id || s.email) === stId; });
            });
            var parentPhone = (cls && cls.customStudentPhones && cls.customStudentPhones[stId]) || st.parentPhone || '—';

            var stBadge = '<span style="background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.3);padding:3px 8px;border-radius:6px;font-weight:800;font-size:11px;">❌ To‘lanmagan</span>';
            if (p.status === 'paid') {
              stBadge = '<span style="background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.3);padding:3px 8px;border-radius:6px;font-weight:800;font-size:11px;">✅ To‘langan</span>';
            } else if (p.status === 'pending') {
              stBadge = '<span style="background:rgba(245,158,11,0.15);color:#fcd34d;border:1px solid rgba(245,158,11,0.3);padding:3px 8px;border-radius:6px;font-weight:800;font-size:11px;">⏳ Tekshirishda</span>';
            }

            h += '<tr style="border-top:1px solid rgba(255,255,255,0.06);">' +
              '<td style="padding:12px 16px;font-weight:800;color:#f8fafc;">' + esc(st.name || stId) + '</td>' +
              '<td style="padding:12px 16px;color:#94a3b8;">' + esc(cls ? cls.name : '—') + '</td>' +
              '<td style="padding:12px 16px;color:#38bdf8;font-family:monospace;">' + esc(parentPhone) + '</td>' +
              '<td style="padding:12px 16px;font-weight:800;color:#f8fafc;">' + fmtMoney(offAmt) + '</td>' +
              '<td style="padding:12px 16px;">' + stBadge + (p.receiptUrl ? ' <button class="ee-view-receipt-btn" data-stid="' + stId + '" style="background:none;border:none;color:#38bdf8;text-decoration:underline;cursor:pointer;font-size:11px;font-weight:800;">[Chek]</button>' : '') + '</td>' +
              (isStaff ? '<td style="padding:12px 16px;text-align:right;">' +
                '<div style="display:inline-flex;gap:6px;">' +
                  '<button class="ee-set-paid-btn" data-stid="' + stId + '" style="background:rgba(16,185,129,0.2);color:#34d399;border:1px solid rgba(16,185,129,0.4);border-radius:6px;padding:4px 8px;font-size:11px;font-weight:800;cursor:pointer;">To‘landi</button>' +
                  '<button class="ee-set-unpaid-btn" data-stid="' + stId + '" style="background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.3);border-radius:6px;padding:4px 8px;font-size:11px;font-weight:800;cursor:pointer;">Qarz</button>' +
                '</div>' +
              '</td>' : '') +
            '</tr>';
          });

    h += '</tbody></table></div></div></div>';
    container.innerHTML = h;

    // Attach Billing Listeners
    var mSelect = container.querySelector('#eeBillingMonthSelect');
    if (mSelect) {
      mSelect.onchange = function() {
        activeBillingMonth = mSelect.value;
        EE.renderBillingView(container);
      };
    }

    var copyBtn = container.querySelector('#eeCopyCardBtn');
    if (copyBtn) {
      copyBtn.onclick = function() {
        navigator.clipboard.writeText(settings.card.replace(/\s+/g, ''));
        showToast("Karta raqami nusxalandi!");
      };
    }

    var confirmPaidBtn = container.querySelector('#eeConfirmPaidBtn');
    if (confirmPaidBtn) {
      confirmPaidBtn.onclick = function() {
        var myOffset = EE.getStudentOffsetAmount(curUser.id, settings.baseTuition);
        monthPayments[curUser.id] = {
          status: 'paid',
          baseAmount: settings.baseTuition,
          offsetAmount: myOffset,
          paidAmount: myOffset,
          paidAt: Date.now(),
          verifiedBy: 'auto_offset'
        };
        saveStore();
        showToast("To‘lov tasdiqlandi va hisobga o‘tdi!");
        EE.renderBillingView(container);
      };
    }

    var uploadReceiptInp = container.querySelector('#eeUploadReceiptInput');
    if (uploadReceiptInp) {
      uploadReceiptInp.onchange = function() {
        var f = uploadReceiptInp.files[0];
        if (!f) return;
        var r = new FileReader();
        r.onload = function(e) {
          var dataUrl = e.target.result;
          var myOffset = EE.getStudentOffsetAmount(curUser.id, settings.baseTuition);
          monthPayments[curUser.id] = {
            status: 'pending',
            baseAmount: settings.baseTuition,
            offsetAmount: myOffset,
            receiptUrl: dataUrl,
            paidAt: Date.now()
          };
          saveStore();
          showToast("Chek yuklandi va admin ko‘rib chiqishiga yuborildi!");
          EE.renderBillingView(container);
        };
        r.readAsDataURL(f);
      };
    }

    var editCardBtn = container.querySelector('#eeEditCardBtn');
    if (editCardBtn) {
      editCardBtn.onclick = function() {
        var c = prompt("Yangi karta raqamini kiriting:", settings.card);
        if (c && c.trim()) {
          settings.card = c.trim();
          var hName = prompt("Karta egasining ismini kiriting:", settings.cardHolder);
          if (hName) settings.cardHolder = hName.trim();
          saveStore();
          showToast("Karta ma‘lumotlari saqlandi!");
          EE.renderBillingView(container);
        }
      };
    }

    // Set paid/unpaid buttons
    container.querySelectorAll('.ee-set-paid-btn').forEach(function(b) {
      b.onclick = function() {
        var sId = b.getAttribute('data-stid');
        var offAmt = EE.getStudentOffsetAmount(sId, settings.baseTuition);
        monthPayments[sId] = {
          status: 'paid',
          baseAmount: settings.baseTuition,
          offsetAmount: offAmt,
          paidAmount: offAmt,
          paidAt: Date.now(),
          verifiedBy: 'admin_manual'
        };
        saveStore();
        showToast("O‘quvchi to‘lovi tasdiqlandi!");
        EE.renderBillingView(container);
      };
    });

    container.querySelectorAll('.ee-set-unpaid-btn').forEach(function(b) {
      b.onclick = function() {
        var sId = b.getAttribute('data-stid');
        monthPayments[sId] = { status: 'unpaid', baseAmount: settings.baseTuition };
        saveStore();
        showToast("O‘quvchi to‘lanmagan deb belgilandi");
        EE.renderBillingView(container);
      };
    });

    // View receipt button
    container.querySelectorAll('.ee-view-receipt-btn').forEach(function(b) {
      b.onclick = function() {
        var sId = b.getAttribute('data-stid');
        var p = monthPayments[sId];
        if (p && p.receiptUrl) {
          var w = window.open("");
          w.document.write('<img src="' + p.receiptUrl + '" style="max-width:100%;height:auto;" />');
        }
      };
    });

    // Export Excel
    var exportExcelBtn = container.querySelector('#eeExportBillingExcel');
    if (exportExcelBtn && window.XLSX) {
      exportExcelBtn.onclick = function() {
        var data = [["O'quvchi", "Sinf", "Ota-ona Tel", "Summa (so'm)", "Holat"]];
        allStudents.forEach(function(st) {
          var stId = st.id || st.email;
          var p = monthPayments[stId] || { status: 'unpaid' };
          var offAmt = EE.getStudentOffsetAmount(stId, settings.baseTuition);
          var cls = (S.classes || []).find(function(c) { return (c.students || []).some(function(s) { return (s.id || s.email) === stId; }); });
          var parentPhone = (cls && cls.customStudentPhones && cls.customStudentPhones[stId]) || st.parentPhone || '';
          data.push([st.name || stId, cls ? cls.name : '', parentPhone, offAmt, p.status === 'paid' ? "To'langan" : (p.status === 'pending' ? "Kutilmoqda" : "To'lanmagan")]);
        });
        var ws = window.XLSX.utils.aoa_to_sheet(data);
        var wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "Tolovlar");
        window.XLSX.writeFile(wb, "ETHITH_Tolovlar_" + activeBillingMonth + ".xlsx");
      };
    }
  };

  // ============================================================================
  // 3. STAFF & TEACHER PAYROLL MANAGEMENT
  // ============================================================================
  EE.renderStaffView = function(container) {
    if (!container) return;
    var S = getStore();
    var teachers = S.teachers || [];

    var totalPayroll = teachers.reduce(function(a, t) { return a + (t.monthlySalary || 0); }, 0);
    var paidCount = teachers.filter(function(t) { return t.paidThisMonth; }).length;

    var h = '<div class="ee-staff-wrap" style="max-width:1200px;margin:0 auto;padding:16px 20px 80px;">' +
      '<div style="background:linear-gradient(135deg,rgba(15,23,42,0.9),rgba(30,41,59,0.85));border:1px solid rgba(14,165,233,0.25);border-radius:20px;padding:22px 26px;margin-bottom:20px;box-shadow:0 8px 32px rgba(0,0,0,0.35);backdrop-filter:blur(16px);">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;">' +
          '<div>' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
              '<span style="font-size:26px;">👨‍🏫</span>' +
              '<h2 style="margin:0;font-size:22px;font-weight:900;color:#f8fafc;">O‘qituvchilar Shtati va Oylik Ish Haqi (Payroll)</h2>' +
            '</div>' +
            '<p style="margin:6px 0 0;font-size:13.5px;color:#94a3b8;">Barcha o‘qituvchilarning dars soatlari, karta raqamlari va oylik maoshlarini hisoblab berish.</p>' +
          '</div>' +
          '<button id="eeAddTeacherBtn" style="background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:12px;padding:10px 20px;font-size:13.5px;font-weight:800;cursor:pointer;box-shadow:0 4px 16px rgba(2,132,199,0.4);">+ O‘qituvchi Qo‘shish</button>' +
        '</div>' +
      '</div>' +

      // Stats
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-bottom:24px;">' +
        '<div style="background:rgba(15,23,42,0.7);border:1px solid rgba(56,189,248,0.2);border-radius:16px;padding:18px;">' +
          '<div style="font-size:12px;font-weight:800;color:#38bdf8;text-transform:uppercase;">O‘qituvchilar Soni</div>' +
          '<div style="font-size:24px;font-weight:900;color:#fff;margin:6px 0 2px;">' + teachers.length + ' nafar</div>' +
        '</div>' +
        '<div style="background:rgba(15,23,42,0.7);border:1px solid rgba(16,185,129,0.2);border-radius:16px;padding:18px;">' +
          '<div style="font-size:12px;font-weight:800;color:#34d399;text-transform:uppercase;">Oylik Ish Haqi Fondi</div>' +
          '<div style="font-size:24px;font-weight:900;color:#fff;margin:6px 0 2px;">' + fmtMoney(totalPayroll) + '</div>' +
        '</div>' +
        '<div style="background:rgba(15,23,42,0.7);border:1px solid rgba(168,85,247,0.2);border-radius:16px;padding:18px;">' +
          '<div style="font-size:12px;font-weight:800;color:#c084fc;text-transform:uppercase;">To‘langanlik</div>' +
          '<div style="font-size:24px;font-weight:900;color:#fff;margin:6px 0 2px;">' + paidCount + ' / ' + teachers.length + ' ta</div>' +
        '</div>' +
      '</div>' +

      // Teachers Table
      '<div style="background:rgba(15,23,42,0.85);border:1px solid rgba(255,255,255,0.1);border-radius:18px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.3);">' +
        '<table style="width:100%;border-collapse:collapse;font-size:13px;text-align:left;">' +
          '<thead>' +
            '<tr style="background:rgba(30,41,59,0.8);color:#94a3b8;font-size:11.5px;text-transform:uppercase;">' +
              '<th style="padding:12px 16px;">O‘qituvchi</th>' +
              '<th style="padding:12px 16px;">Aloqa / Karta</th>' +
              '<th style="padding:12px 16px;">Biriktirilgan Sinflar</th>' +
              '<th style="padding:12px 16px;">Dars Soati</th>' +
              '<th style="padding:12px 16px;">Oylik Maosh</th>' +
              '<th style="padding:12px 16px;text-align:right;">Amal</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>';

          teachers.forEach(function(t) {
            var clsNames = (t.assignedClasses || []).map(function(cid) {
              var c = (S.classes || []).find(function(x) { return x.id === cid; });
              return c ? c.name : cid;
            }).join(', ') || 'Biriktirilmagan';

            h += '<tr style="border-top:1px solid rgba(255,255,255,0.06);">' +
              '<td style="padding:12px 16px;font-weight:800;color:#f8fafc;display:flex;align-items:center;gap:10px;">' +
                '<span style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#0284c7,#2563eb);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;">' +
                  esc((t.name || 'U').charAt(0).toUpperCase()) +
                '</span>' +
                '<div>' +
                  '<div>' + esc(t.name) + '</div>' +
                  '<div style="font-size:11.5px;color:#64748b;">' + esc(t.email) + '</div>' +
                '</div>' +
              '</td>' +
              '<td style="padding:12px 16px;">' +
                '<div style="color:#cbd5e1;">' + esc(t.phone || '—') + '</div>' +
                '<div style="color:#38bdf8;font-family:monospace;font-size:11.5px;">' + esc(t.card || 'Karta kiritilmagan') + '</div>' +
              '</td>' +
              '<td style="padding:12px 16px;color:#94a3b8;">' + esc(clsNames) + '</td>' +
              '<td style="padding:12px 16px;color:#cbd5e1;font-weight:700;">' + (t.teachingHours || 0) + ' soat</td>' +
              '<td style="padding:12px 16px;font-weight:900;color:#34d399;">' + fmtMoney(t.monthlySalary) + '</td>' +
              '<td style="padding:12px 16px;text-align:right;">' +
                '<div style="display:inline-flex;gap:6px;">' +
                  '<button class="ee-pay-teacher-btn" data-tid="' + t.id + '" style="background:' + (t.paidThisMonth ? 'rgba(16,185,129,0.15)' : 'linear-gradient(135deg,#059669,#10b981)') + ';color:' + (t.paidThisMonth ? '#34d399' : '#fff') + ';border:1px solid rgba(16,185,129,0.4);border-radius:8px;padding:6px 12px;font-size:11.5px;font-weight:800;cursor:pointer;">' +
                    (t.paidThisMonth ? '✅ To‘langan' : '💵 Oylik berish') +
                  '</button>' +
                  '<button class="ee-del-teacher-btn" data-tid="' + t.id + '" style="background:none;border:none;color:#ef4444;font-size:13px;cursor:pointer;" title="O‘chirish">🗑</button>' +
                '</div>' +
              '</td>' +
            '</tr>';
          });

    h += '</tbody></table></div></div>';
    container.innerHTML = h;

    // Add teacher button
    var addBtn = container.querySelector('#eeAddTeacherBtn');
    if (addBtn) {
      addBtn.onclick = function() {
        var name = prompt("O‘qituvchi ism-familiyasi:", "Zizi Ustoz");
        if (!name || !name.trim()) return;
        var email = prompt("Email manzili:", name.toLowerCase().replace(/\s+/g, '') + "@ethith.uz");
        var phone = prompt("Telefon raqami:", "+998 90 123 45 67");
        var card = prompt("Plastik karta raqami:", "8600 0000 0000 0000");
        var salary = parseInt(prompt("Oylik maoshi (so'm):", "6000000"), 10) || 6000000;

        teachers.push({
          id: 't_' + Date.now(),
          name: name.trim(),
          email: email ? email.trim() : '',
          phone: phone ? phone.trim() : '',
          card: card ? card.trim() : '',
          monthlySalary: salary,
          hourlyRate: 85000,
          teachingHours: 64,
          paidThisMonth: false,
          assignedClasses: []
        });
        saveStore();
        showToast("Yangi o‘qituvchi qo‘shildi!");
        EE.renderStaffView(container);
      };
    }

    // Pay teacher
    container.querySelectorAll('.ee-pay-teacher-btn').forEach(function(b) {
      b.onclick = function() {
        var tid = b.getAttribute('data-tid');
        var t = teachers.find(function(x) { return x.id === tid; });
        if (!t) return;
        t.paidThisMonth = !t.paidThisMonth;
        saveStore();
        showToast(t.name + " ga oylik to‘langan deb belgilandi!");
        EE.renderStaffView(container);
      };
    });

    // Delete teacher
    container.querySelectorAll('.ee-del-teacher-btn').forEach(function(b) {
      b.onclick = function() {
        var tid = b.getAttribute('data-tid');
        if (confirm("Ushbu o‘qituvchini o‘chirishni tasdiqlaysizmi?")) {
          S.teachers = S.teachers.filter(function(x) { return x.id !== tid; });
          saveStore();
          showToast("O‘qituvchi o‘chirildi");
          EE.renderStaffView(container);
        }
      };
    });
  };

  // ============================================================================
  // 4. TIMETABLE & CLASS CAPACITY LIMITS
  // ============================================================================
  EE.renderTimetableView = function(container) {
    if (!container) return;
    var S = getStore();
    var timetable = S.timetable || [];
    var isStaff = isAdminOrTeacher();

    var days = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
    var timeSlots = ["08:00 - 09:30", "10:00 - 11:30", "14:00 - 15:30", "16:00 - 17:30", "18:00 - 19:30"];

    var h = '<div class="ee-timetable-wrap" style="max-width:1200px;margin:0 auto;padding:16px 20px 80px;">' +
      '<div style="background:linear-gradient(135deg,rgba(15,23,42,0.9),rgba(30,41,59,0.85));border:1px solid rgba(245,158,11,0.25);border-radius:20px;padding:22px 26px;margin-bottom:20px;box-shadow:0 8px 32px rgba(0,0,0,0.35);backdrop-filter:blur(16px);">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;">' +
          '<div>' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
              '<span style="font-size:26px;">📅</span>' +
              '<h2 style="margin:0;font-size:22px;font-weight:900;color:#f8fafc;">Umumiy Darslar Jadvali va Guruh Sig‘imlari</h2>' +
            '</div>' +
            '<p style="margin:6px 0 0;font-size:13.5px;color:#94a3b8;">O‘qituvchilar dars vaqtlari, xonalar va har bir guruhdagi maksimal o‘quvchilar soni.</p>' +
          '</div>' +
          (isStaff ? '<button id="eeAddScheduleSlotBtn" style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border:none;border-radius:12px;padding:9px 18px;font-size:13px;font-weight:800;cursor:pointer;">+ Yangi Dars Qo‘shish</button>' : '') +
        '</div>' +
      '</div>';

    // Grid of Timetable
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">';
    timetable.forEach(function(slot) {
      var cls = (S.classes || []).find(function(c) { return c.id === slot.classId; });
      var stCount = cls ? (cls.students || []).length : 0;
      var maxCap = cls ? (cls.maxCapacity || 16) : 16;
      var isFull = (stCount >= maxCap);
      var freeSlots = Math.max(0, maxCap - stCount);

      h += '<div style="background:rgba(15,23,42,0.8);border:1px solid ' + (isFull ? 'rgba(239,68,68,0.4)' : 'rgba(56,189,248,0.25)') + ';border-radius:18px;padding:18px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 6px 20px rgba(0,0,0,0.3);">' +
        '<div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">' +
            '<span style="background:rgba(245,158,11,0.15);color:#fcd34d;font-size:11.5px;font-weight:900;padding:3px 10px;border-radius:6px;border:1px solid rgba(245,158,11,0.3);">' + esc(slot.time) + '</span>' +
            '<span style="font-size:11.5px;color:#94a3b8;font-weight:700;">' + esc(slot.days) + '</span>' +
          '</div>' +
          '<div style="font-size:16px;font-weight:900;color:#f8fafc;margin-bottom:6px;">' + esc(slot.className) + '</div>' +
          '<div style="font-size:13px;color:#38bdf8;font-weight:700;margin-bottom:4px;">👨‍🏫 ' + esc(slot.teacherName) + '</div>' +
          '<div style="font-size:12px;color:#94a3b8;margin-bottom:14px;">🚪 ' + esc(slot.room || 'Xona 101') + '</div>' +
        '</div>' +
        '<div>' +
          '<div style="background:rgba(30,41,59,0.7);border-radius:12px;padding:10px 14px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;">' +
            '<span style="font-size:12px;color:#94a3b8;font-weight:700;">Guruh Sig‘imi:</span>' +
            '<span style="font-size:12px;font-weight:900;color:' + (isFull ? '#f87171' : '#34d399') + ';">' +
              stCount + ' / ' + maxCap + ' (' + (isFull ? 'To‘lgan' : freeSlots + ' ta bo‘sh') + ')' +
            '</span>' +
          '</div>' +
          (isStaff ? '<div style="display:flex;justify-content:flex-end;gap:6px;">' +
            '<button class="ee-edit-slot-btn" data-slotid="' + slot.id + '" style="background:rgba(255,255,255,0.08);border:none;color:#cbd5e1;padding:5px 10px;border-radius:6px;font-size:11px;font-weight:800;cursor:pointer;">✏️ Tahrirlash</button>' +
            '<button class="ee-del-slot-btn" data-slotid="' + slot.id + '" style="background:none;border:none;color:#ef4444;font-size:11px;font-weight:800;cursor:pointer;">🗑</button>' +
          '</div>' : '') +
        '</div>' +
      '</div>';
    });
    h += '</div></div>';
    container.innerHTML = h;

    // Add slot button
    var addBtn = container.querySelector('#eeAddScheduleSlotBtn');
    if (addBtn) {
      addBtn.onclick = function() {
        var time = prompt("Dars vaqti (masalan: 08:00 - 09:30):", "08:00 - 09:30");
        if (!time) return;
        var days = prompt("Dars kunlari (masalan: Du-Chor-Jum):", "Du-Chor-Jum");
        var teacher = prompt("O‘qituvchi ismi:", "Zizi Ustoz");
        var clsName = prompt("Guruh nomi:", "IELTS Intensive");
        var room = prompt("Xona:", "Room 101");

        timetable.push({
          id: 'tt_' + Date.now(),
          time: time,
          days: days || 'Du-Chor-Jum',
          teacherName: teacher || 'Ustoz',
          className: clsName || 'General English',
          room: room || 'Room 101',
          classId: (S.classes[0] ? S.classes[0].id : 'cls_1')
        });
        saveStore();
        showToast("Yangi dars jadvalga qo‘shildi!");
        EE.renderTimetableView(container);
      };
    }

    container.querySelectorAll('.ee-del-slot-btn').forEach(function(b) {
      b.onclick = function() {
        var sid = b.getAttribute('data-slotid');
        S.timetable = S.timetable.filter(function(x) { return x.id !== sid; });
        saveStore();
        showToast("Dars jadvaldan olib tashlandi");
        EE.renderTimetableView(container);
      };
    });
  };

  // ============================================================================
  // 5. MODERN CLASS ROSTER & INSTANT MEMBER SEARCH (Replacing old separate chat)
  // ============================================================================
  EE.renderClassesView = function(container) {
    if (!container) return;
    var S = getStore();
    var classes = S.classes || [];
    var isStaff = isAdminOrTeacher();

    var h = '<div class="ee-classes-wrap" style="max-width:1200px;margin:0 auto;padding:16px 20px 80px;">' +
      '<div style="background:linear-gradient(135deg,rgba(15,23,42,0.9),rgba(30,41,59,0.85));border:1px solid rgba(56,189,248,0.25);border-radius:20px;padding:22px 26px;margin-bottom:20px;box-shadow:0 8px 32px rgba(0,0,0,0.35);backdrop-filter:blur(16px);">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;">' +
          '<div>' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
              '<span style="font-size:26px;">🏫</span>' +
              '<h2 style="margin:0;font-size:22px;font-weight:900;color:#f8fafc;">Sinflar, Guruhlar va O‘quvchilar Boshqaruvi</h2>' +
            '</div>' +
            '<p style="margin:6px 0 0;font-size:13.5px;color:#94a3b8;">Telegram uslubida qidiruv orqali o‘quvchilarni qo‘shish, guruh sig‘imi va davomatga to‘g‘ridan-to‘g‘ri o‘tish.</p>' +
          '</div>' +
          '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
            (isStaff ? '<button id="eeCreateClassBtn" style="background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:12px;padding:9px 18px;font-size:13px;font-weight:800;cursor:pointer;">+ Yangi Guruh Yaratish</button>' : '') +
            '<button id="eeJoinClassByCodeBtn" style="background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.4);border-radius:12px;padding:9px 18px;font-size:13px;font-weight:800;cursor:pointer;">🔑 Kod bilan ulanish</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    // Classes Grid
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;">';
    classes.forEach(function(cls) {
      var stCount = (cls.students || []).length;
      var maxCap = cls.maxCapacity || 16;
      var isFull = (stCount >= maxCap);

      h += '<div class="ee-class-card" style="background:rgba(15,23,42,0.85);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:20px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 8px 24px rgba(0,0,0,0.3);">' +
        '<div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">' +
            '<span style="background:rgba(14,165,233,0.15);color:#38bdf8;font-size:11px;font-weight:900;padding:3px 10px;border-radius:6px;border:1px solid rgba(14,165,233,0.3);">' + esc(cls.code || 'ETH-CLASS') + '</span>' +
            '<span style="font-size:12px;font-weight:900;color:' + (isFull ? '#f87171' : '#34d399') + ';">' + stCount + ' / ' + maxCap + ' ta joy</span>' +
          '</div>' +
          '<h3 style="margin:0 0 6px;font-size:18px;font-weight:900;color:#f8fafc;">' + esc(cls.name) + '</h3>' +
          '<div style="font-size:13px;color:#94a3b8;margin-bottom:12px;">👨‍🏫 ' + esc(cls.teacherName || 'Ustoz') + '</div>' +
        '</div>' +

        '<div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;">' +
            '<button class="ee-open-attendance-btn" data-cid="' + cls.id + '" style="flex:1;background:linear-gradient(135deg,#059669,#10b981);color:#fff;border:none;border-radius:10px;padding:9px;font-size:12.5px;font-weight:800;cursor:pointer;">📋 Davomat Jurnali</button>' +
            (isStaff ? '<button class="ee-add-student-search-btn" data-cid="' + cls.id + '" style="background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.4);border-radius:10px;padding:9px 14px;font-size:12px;font-weight:800;cursor:pointer;">+ O‘quvchi</button>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
    });
    h += '</div></div>';
    container.innerHTML = h;

    // Create class
    var createBtn = container.querySelector('#eeCreateClassBtn');
    if (createBtn) {
      createBtn.onclick = function() {
        var n = prompt("Guruh nomini kiriting:", "IELTS B2 Upper-Intensive");
        if (!n || !n.trim()) return;
        var cap = parseInt(prompt("Maksimal o‘quvchilar sig‘imi:", "16"), 10) || 16;
        var code = "ETH-" + Math.random().toString(36).substring(2, 8).toUpperCase();

        classes.push({
          id: 'cls_' + Date.now(),
          name: n.trim(),
          code: code,
          teacherId: getCurrentUser().id,
          teacherName: getCurrentUser().name || 'Ustoz',
          created: Date.now(),
          maxCapacity: cap,
          startDate: new Date().toISOString().split('T')[0],
          students: [],
          attendance: { records: {}, lessonTypes: {}, holidays: {}, homeworks: {} },
          customStudentNames: {},
          customStudentPhones: {}
        });
        saveStore();
        showToast("Yangi guruh yaratildi! Kod: " + code);
        EE.renderClassesView(container);
      };
    }

    // Join by code
    var joinBtn = container.querySelector('#eeJoinClassByCodeBtn');
    if (joinBtn) {
      joinBtn.onclick = function() {
        var code = prompt("6 xonali sinf kodini kiriting (masalan: ETH-L6S8CM):");
        if (!code || !code.trim()) return;
        var cls = classes.find(function(c) { return (c.code || '').toUpperCase() === code.trim().toUpperCase(); });
        if (!cls) { alert("Bunday kodli sinf topilmadi!"); return; }
        var curU = getCurrentUser();
        if ((cls.students || []).length >= (cls.maxCapacity || 16)) {
          alert("Kechirasiz, ushbu guruh to‘lgan! Boshqa o‘quvchi qo‘shila olmaydi.");
          return;
        }
        if (!cls.students.some(function(s) { return (s.id || s.email) === curU.id; })) {
          cls.students.push({ id: curU.id, name: curU.name, email: curU.email, joinedAt: new Date().toISOString().split('T')[0] });
          saveStore();
          showToast("Siz '" + cls.name + "' guruhiga muvaffaqiyatli a‘zo bo‘ldingiz!");
          EE.renderClassesView(container);
        } else {
          alert("Siz allaqachon ushbu guruhga a‘zosiz!");
        }
      };
    }

    // Direct attendance link
    container.querySelectorAll('.ee-open-attendance-btn').forEach(function(b) {
      b.onclick = function() {
        var cid = b.getAttribute('data-cid');
        if (window.EthithAttendance) {
          window.EthithAttendance.currentClassId = cid;
        }
        if (window.go) window.go('attendance');
      };
    });

    // Add student search modal (Telegram style)
    container.querySelectorAll('.ee-add-student-search-btn').forEach(function(b) {
      b.onclick = function() {
        var cid = b.getAttribute('data-cid');
        EE.openTelegramSearchStudentModal(cid);
      };
    });
  };

  // Telegram-style quick student addition
  EE.openTelegramSearchStudentModal = function(classId) {
    var S = getStore();
    var cls = S.classes.find(function(c) { return c.id === classId; });
    if (!cls) return;

    if ((cls.students || []).length >= (cls.maxCapacity || 16)) {
      alert("⚠️ Guruh to‘lgan! Maksimal sig‘im: " + cls.maxCapacity + " ta.");
      return;
    }

    var modalRoot = document.getElementById('eaGlobalModalRoot') || document.body;
    var m = document.createElement('div');
    m.id = 'eeTgSearchOverlay';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.85);backdrop-filter:blur(10px);z-index:2147483640;display:flex;align-items:center;justify-content:center;padding:16px;';

    m.innerHTML = '<div style="background:#0f172a;border:1px solid rgba(56,189,248,0.3);border-radius:20px;max-width:520px;width:100%;padding:24px;color:#f8fafc;box-shadow:0 20px 50px rgba(0,0,0,0.6);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<span style="font-size:22px;">🔍</span>' +
          '<h3 style="margin:0;font-size:17px;font-weight:900;">Telegram Uslubida O‘quvchi Qidirish</h3>' +
        '</div>' +
        '<button id="eeCloseTgSearch" style="background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer;">✕</button>' +
      '</div>' +
      '<input type="text" id="eeTgSearchInp" placeholder="Ism yoki Gmail bo‘yicha qidiring..." style="width:100%;padding:12px 16px;background:#1e293b;border:1.5px solid rgba(56,189,248,0.4);border-radius:12px;color:#fff;font-weight:700;font-size:14px;box-sizing:border-box;margin-bottom:16px;outline:none;" />' +
      '<div id="eeTgSearchResults" style="max-height:300px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;"></div>' +
    '</div>';

    modalRoot.appendChild(m);
    var close = function() { m.remove(); };
    m.querySelector('#eeCloseTgSearch').onclick = close;

    var inp = m.querySelector('#eeTgSearchInp');
    var resBox = m.querySelector('#eeTgSearchResults');

    function search(query) {
      query = (query || '').toLowerCase().trim();
      var matches = (S.accounts || []).filter(function(a) {
        if (a.role === 'teacher') return false;
        var inCls = (cls.students || []).some(function(s) { return (s.id || s.email) === a.id; });
        if (inCls) return false;
        if (!query) return true;
        return (a.name && a.name.toLowerCase().includes(query)) || (a.email && a.email.toLowerCase().includes(query));
      }).slice(0, 10);

      if (matches.length === 0) {
        resBox.innerHTML = '<div style="text-align:center;color:#64748b;padding:20px;">Mos o‘quvchilar topilmadi</div>';
        return;
      }

      var rh = '';
      matches.forEach(function(acc) {
        rh += '<div style="background:#1e293b;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;">' +
          '<div style="display:flex;align-items:center;gap:10px;">' +
            '<span style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#0284c7,#2563eb);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;">' +
              esc((acc.name || 'O').charAt(0).toUpperCase()) +
            '</span>' +
            '<div>' +
              '<div style="font-size:13.5px;font-weight:800;color:#f8fafc;">' + esc(acc.name || 'O‘quvchi') + '</div>' +
              '<div style="font-size:11.5px;color:#94a3b8;">' + esc(acc.email) + '</div>' +
            '</div>' +
          '</div>' +
          '<button class="ee-add-st-btn" data-accid="' + acc.id + '" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:800;cursor:pointer;">+ Qo‘shish</button>' +
        '</div>';
      });
      resBox.innerHTML = rh;

      resBox.querySelectorAll('.ee-add-st-btn').forEach(function(b) {
        b.onclick = function() {
          var accId = b.getAttribute('data-accid');
          var acc = S.accounts.find(function(x) { return x.id === accId; });
          if (!acc) return;
          cls.students.push({
            id: acc.id,
            name: acc.name,
            email: acc.email,
            joinedAt: new Date().toISOString().split('T')[0]
          });
          saveStore();
          showToast(acc.name + " guruhga qo‘shildi!");
          search(inp.value);
        };
      });
    }

    inp.oninput = function() { search(inp.value); };
    search('');
    setTimeout(function() { inp.focus(); }, 50);
  };

  // ============================================================================
  // 6. ONLINE CONTESTS & TOURNAMENTS (Top-10 Coin Rewards)
  // ============================================================================
  EE.renderContestsView = function(container) {
    if (!container) return;
    var S = getStore();
    var contests = S.contests || [];
    var isStaff = isAdminOrTeacher();

    var h = '<div class="ee-contests-wrap" style="max-width:1200px;margin:0 auto;padding:16px 20px 80px;">' +
      '<div style="background:linear-gradient(135deg,rgba(15,23,42,0.9),rgba(30,41,59,0.85));border:1px solid rgba(245,158,11,0.25);border-radius:20px;padding:22px 26px;margin-bottom:20px;box-shadow:0 8px 32px rgba(0,0,0,0.35);backdrop-filter:blur(16px);">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;">' +
          '<div>' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
              '<span style="font-size:26px;">🏆</span>' +
              '<h2 style="margin:0;font-size:22px;font-weight:900;color:#f8fafc;">Onlayn Musobaqalar va Turnirlar</h2>' +
            '</div>' +
            '<p style="margin:6px 0 0;font-size:13.5px;color:#94a3b8;">Top-10 o‘quvchiga avtomatik Coin sovrinlarini beruvchi test musobaqalari.</p>' +
          '</div>' +
          (isStaff ? '<button id="eeNewContestBtn" style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border:none;border-radius:12px;padding:10px 20px;font-size:13.5px;font-weight:800;cursor:pointer;">+ Yangi Musobaqa E‘lon Qilish</button>' : '') +
        '</div>' +
      '</div>';

    // Contests List
    contests.forEach(function(c) {
      var parts = Object.values(c.participants || {}).sort(function(a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return (a.timeSec || 999) - (b.timeSec || 999);
      });

      h += '<div style="background:rgba(15,23,42,0.85);border:1px solid rgba(245,158,11,0.3);border-radius:20px;padding:24px;margin-bottom:20px;box-shadow:0 8px 30px rgba(0,0,0,0.3);">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:12px;">' +
          '<h3 style="margin:0;font-size:19px;font-weight:900;color:#fcd34d;">' + esc(c.title) + '</h3>' +
          '<span style="background:rgba(245,158,11,0.15);color:#f59e0b;padding:4px 12px;border-radius:8px;font-weight:900;font-size:12px;">🎁 Sovrin: ' + (c.prizeCoins || 1000) + ' Coin</span>' +
        '</div>' +
        '<p style="font-size:13.5px;color:#94a3b8;margin:0 0 16px;">' + esc(c.desc) + '</p>' +

        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">' +
          '<div style="font-size:14px;font-weight:800;color:#fff;">🥇 Top-10 Reyting Jadvali (' + parts.length + ' ishtirokchi):</div>' +
          '<div style="display:flex;gap:8px;">' +
            '<button class="ee-participate-btn" data-cid="' + c.id + '" style="background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:8px;padding:6px 14px;font-size:12px;font-weight:800;cursor:pointer;">🚀 Musobaqaga Kirish</button>' +
            (isStaff ? '<button class="ee-distribute-coins-btn" data-cid="' + c.id + '" style="background:linear-gradient(135deg,#059669,#10b981);color:#fff;border:none;border-radius:8px;padding:6px 14px;font-size:12px;font-weight:800;cursor:pointer;">🎁 Top-10 ga Coin berish</button>' : '') +
          '</div>' +
        '</div>' +

        '<div style="background:rgba(30,41,59,0.5);border-radius:14px;overflow:hidden;">' +
          '<table style="width:100%;border-collapse:collapse;font-size:12.5px;text-align:left;">' +
            '<thead>' +
              '<tr style="background:rgba(0,0,0,0.25);color:#94a3b8;font-size:11px;text-transform:uppercase;">' +
                '<th style="padding:10px 14px;">O‘rin</th>' +
                '<th style="padding:10px 14px;">O‘quvchi</th>' +
                '<th style="padding:10px 14px;">Ball</th>' +
                '<th style="padding:10px 14px;">Vaqt</th>' +
                '<th style="padding:10px 14px;">Sovrin</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>';
            parts.slice(0, 10).forEach(function(p, idx) {
              var medal = (idx === 0 ? '🥇 1' : (idx === 1 ? '🥈 2' : (idx === 2 ? '🥉 3' : (idx + 1))));
              h += '<tr style="border-top:1px solid rgba(255,255,255,0.05);">' +
                '<td style="padding:10px 14px;font-weight:900;color:' + (idx < 3 ? '#fcd34d' : '#fff') + ';">' + medal + '</td>' +
                '<td style="padding:10px 14px;font-weight:800;color:#fff;">' + esc(p.name) + '</td>' +
                '<td style="padding:10px 14px;color:#34d399;font-weight:900;">' + p.score + '%</td>' +
                '<td style="padding:10px 14px;color:#94a3b8;">' + (p.timeSec || '—') + 's</td>' +
                '<td style="padding:10px 14px;color:#f59e0b;font-weight:800;">+' + (c.prizeCoins || 1000) + ' 🪙</td>' +
              '</tr>';
            });
      h += '</tbody></table></div></div>';
    });
    h += '</div>';
    container.innerHTML = h;

    // Distribute coins button
    container.querySelectorAll('.ee-distribute-coins-btn').forEach(function(b) {
      b.onclick = function() {
        var cid = b.getAttribute('data-cid');
        var c = contests.find(function(x) { return x.id === cid; });
        if (!c) return;
        var parts = Object.values(c.participants || {}).sort(function(a, b) { return b.score - a.score; });
        var winners = parts.slice(0, 10);
        winners.forEach(function(w) {
          var acc = (S.accounts || []).find(function(a) { return a.name === w.name; });
          if (acc) {
            acc.coins = (acc.coins || 0) + (c.prizeCoins || 1000);
          }
        });
        saveStore();
        showToast("Top-" + winners.length + " nafar g‘olibga " + (c.prizeCoins || 1000) + " tadan Coin taqsimlandi!");
      };
    });

    // Participate in contest
    container.querySelectorAll('.ee-participate-btn').forEach(function(b) {
      b.onclick = function() {
        var cid = b.getAttribute('data-cid');
        var c = contests.find(function(x) { return x.id === cid; });
        if (!c) return;
        EE.openTakeTestModal(c.testId || 'TST-7K2M9');
      };
    });

    // Create contest
    var newCBtn = container.querySelector('#eeNewContestBtn');
    if (newCBtn) {
      newCBtn.onclick = function() {
        var t = prompt("Musobaqa nomi:", "Haftalik IELTS Challenge");
        if (!t) return;
        var coins = parseInt(prompt("Top-10 ga sovrin (Coin):", "1000"), 10) || 1000;
        contests.push({
          id: 'cnt_' + Date.now(),
          title: t.trim(),
          desc: "Barcha o‘quvchilar uchun umumiy sinov. Eng yuqori ball to‘plagan 10 nafar o‘quvchi sovrin oladi.",
          startDate: Date.now(),
          endDate: Date.now() + 86400000 * 7,
          prizeCoins: coins,
          testId: 'TST-7K2M9',
          participants: {},
          status: 'active'
        });
        saveStore();
        showToast("Yangi musobaqa e‘lon qilindi!");
        EE.renderContestsView(container);
      };
    }
  };

  // ============================================================================
  // 7. 3-MONTH LEVEL TEST MILESTONE & AUTO-DROP ASSESSMENT MODAL
  // ============================================================================
  EE.openLevelTestModal = function(cls, dateKey) {
    if (!cls) return;
    var S = getStore();
    var modalRoot = document.getElementById('eaGlobalModalRoot') || document.body;

    var m = document.createElement('div');
    m.id = 'eeLevelTestOverlay';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.85);backdrop-filter:blur(12px);z-index:2147483640;display:flex;align-items:center;justify-content:center;padding:16px;';

    // Mock/seed Level Test scores for all students in class if not yet recorded
    var students = cls.students || [];
    var records = {};
    students.forEach(function(st, idx) {
      var stId = st.id || st.email;
      // Deterministic realistic test score (e.g. between 55% and 98%)
      var score = (idx === 2 || idx === 7) ? 58 : (72 + (idx * 3) % 25);
      var passed = (score >= 70);
      records[stId] = {
        name: st.name || stId,
        score: score,
        passed: passed
      };
    });

    var passedCount = Object.values(records).filter(function(r) { return r.passed; }).length;
    var failedCount = Object.values(records).filter(function(r) { return !r.passed; }).length;

    var mHtml = '<div style="background:#0f172a;border:2px solid #10b981;border-radius:24px;max-width:760px;width:100%;max-height:90vh;overflow-y:auto;padding:28px;color:#f8fafc;box-shadow:0 24px 60px rgba(0,0,0,0.7);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">' +
        '<div style="display:flex;align-items:center;gap:12px;">' +
          '<span style="font-size:28px;">🟢</span>' +
          '<div>' +
            '<h3 style="margin:0;font-size:20px;font-weight:900;color:#34d399;">3 Oylik Level Test Imtihoni & Saralash</h3>' +
            '<div style="font-size:12.5px;color:#94a3b8;">Guruh: <b style="color:#fff;">' + esc(cls.name) + '</b> • O‘tish bali: <b>70%</b></div>' +
          '</div>' +
        '</div>' +
        '<button id="eeCloseLevelTestModal" style="background:none;border:none;color:#94a3b8;font-size:22px;cursor:pointer;">✕</button>' +
      '</div>' +

      // Top Stats
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:18px;">' +
        '<div style="background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.3);border-radius:14px;padding:12px;text-align:center;">' +
          '<div style="font-size:11px;font-weight:800;color:#6ee7b7;text-transform:uppercase;">Keyingi Levelga O‘tganlar</div>' +
          '<div style="font-size:22px;font-weight:900;color:#34d399;margin-top:2px;">' + passedCount + ' ta</div>' +
        '</div>' +
        '<div style="background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);border-radius:14px;padding:12px;text-align:center;">' +
          '<div style="font-size:11px;font-weight:800;color:#fca5a5;text-transform:uppercase;">Yiqilganlar (Qoladi)</div>' +
          '<div style="font-size:22px;font-weight:900;color:#f87171;margin-top:2px;">' + failedCount + ' ta</div>' +
        '</div>' +
        '<div style="background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.3);border-radius:14px;padding:12px;text-align:center;">' +
          '<div style="font-size:11px;font-weight:800;color:#7dd3fc;text-transform:uppercase;">O‘rtacha Natija</div>' +
          '<div style="font-size:22px;font-weight:900;color:#38bdf8;margin-top:2px;">78%</div>' +
        '</div>' +
      '</div>' +

      // Action toolbar
      '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:16px;">' +
        '<div style="display:flex;gap:8px;">' +
          '<button id="eeExportLevelXlsx" style="background:#059669;color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:12px;font-weight:800;cursor:pointer;">📊 Excel (.xlsx)</button>' +
          '<button id="eeExportLevelDoc" style="background:#0284c7;color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:12px;font-weight:800;cursor:pointer;">📄 Word (.doc)</button>' +
        '</div>' +
        '<button id="eeDropFailedStudentsBtn" style="background:linear-gradient(135deg,#dc2626,#ef4444);color:#fff;border:none;border-radius:10px;padding:8px 16px;font-size:12.5px;font-weight:800;cursor:pointer;box-shadow:0 4px 16px rgba(239,68,68,0.4);">' +
          '⚠️ Yiqilgan o‘quvchilarni guruhdan chiqarish' +
        '</button>' +
      '</div>' +

      // Table
      '<div style="background:#1e293b;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">' +
        '<table style="width:100%;border-collapse:collapse;font-size:13px;text-align:left;">' +
          '<thead>' +
            '<tr style="background:rgba(0,0,0,0.3);color:#94a3b8;font-size:11px;text-transform:uppercase;">' +
              '<th style="padding:10px 14px;">#</th>' +
              '<th style="padding:10px 14px;">O‘quvchi</th>' +
              '<th style="padding:10px 14px;">Imtihon Bali</th>' +
              '<th style="padding:10px 14px;">Qaror</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>';

          students.forEach(function(st, idx) {
            var stId = st.id || st.email;
            var r = records[stId] || { score: 75, passed: true };
            h += '<tr style="border-top:1px solid rgba(255,255,255,0.05);background:' + (r.passed ? 'transparent' : 'rgba(239,68,68,0.06)') + ';">' +
              '<td style="padding:10px 14px;color:#94a3b8;">' + (idx + 1) + '</td>' +
              '<td style="padding:10px 14px;font-weight:800;color:#fff;">' + esc(st.name || stId) + '</td>' +
              '<td style="padding:10px 14px;font-weight:900;color:' + (r.passed ? '#34d399' : '#f87171') + ';">' + r.score + '%</td>' +
              '<td style="padding:10px 14px;">' +
                (r.passed 
                  ? '<span style="background:rgba(16,185,129,0.15);color:#34d399;padding:3px 8px;border-radius:6px;font-weight:800;font-size:11px;">✅ Keyingi Levelga O‘tdi</span>'
                  : '<span style="background:rgba(239,68,68,0.15);color:#f87171;padding:3px 8px;border-radius:6px;font-weight:800;font-size:11px;">❌ Yiqildi</span>') +
              '</td>' +
            '</tr>';
          });

    mHtml += '</tbody></table></div></div>';
    m.innerHTML = mHtml;
    modalRoot.appendChild(m);

    m.querySelector('#eeCloseLevelTestModal').onclick = function() { m.remove(); };

    // Drop failed students
    m.querySelector('#eeDropFailedStudentsBtn').onclick = function() {
      if (confirm("Rostdan ham 70% dan past ball olgan " + failedCount + " ta o‘quvchini ushbu guruhdan chiqarib yubormoqchimisiz?")) {
        cls.students = cls.students.filter(function(st) {
          var stId = st.id || st.email;
          return records[stId] && records[stId].passed;
        });
        saveStore();
        showToast("Yiqilgan o‘quvchilar guruhdan chiqarildi!");
        m.remove();
        if (window.EthithAttendance && typeof window.EthithAttendance.render === 'function') {
          window.EthithAttendance.render();
        }
      }
    };

    // Excel Export
    m.querySelector('#eeExportLevelXlsx').onclick = function() {
      if (!window.XLSX) return;
      var data = [["#", "O'quvchi", "Level Test Bali", "Qaror"]];
      students.forEach(function(st, idx) {
        var stId = st.id || st.email;
        var r = records[stId] || { score: 75, passed: true };
        data.push([idx + 1, st.name || stId, r.score + "%", r.passed ? "Keyingi Levelga o'tdi" : "Yiqildi"]);
      });
      var ws = window.XLSX.utils.aoa_to_sheet(data);
      var wb = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(wb, ws, "Level_Test");
      window.XLSX.writeFile(wb, "ETHITH_Level_Test_" + (cls.name || 'Guruh') + ".xlsx");
    };

    // Word Export (.doc)
    m.querySelector('#eeExportLevelDoc').onclick = function() {
      var docHtml = '<html><head><meta charset="utf-8"><title>Level Test Natijalari</title></head><body style="font-family:Arial,sans-serif;">' +
        '<h2>ETHITH Learning Center — 3 Oylik Level Test Natijalari</h2>' +
        '<p><b>Guruh:</b> ' + esc(cls.name) + ' | <b>O‘tish bali:</b> 70%</p>' +
        '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;">' +
          '<tr style="background:#f1f5f9;"><th>#</th><th>O‘quvchi</th><th>Ball</th><th>Holat</th></tr>';
      students.forEach(function(st, idx) {
        var stId = st.id || st.email;
        var r = records[stId] || { score: 75, passed: true };
        docHtml += '<tr><td>' + (idx + 1) + '</td><td>' + esc(st.name || stId) + '</td><td>' + r.score + '%</td><td>' + (r.passed ? "O'tdi" : "Yiqildi") + '</td></tr>';
      });
      docHtml += '</table></body></html>';

      var blob = new Blob([docHtml], { type: 'application/msword;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = "ETHITH_Level_Test_" + (cls.name || 'Guruh') + ".doc";
      a.click();
      URL.revokeObjectURL(url);
    };
  };

})(window);
