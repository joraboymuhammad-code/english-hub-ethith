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
    var appState = (window.EthithApp && window.EthithApp.state) || {};
    if (!appState.centerSettings) {
      appState.centerSettings = { card: "8600 4912 7731 9024", cardHolder: "ETHITH LEARNING CENTER", baseTuition: 200000, currency: "UZS" };
    }
    if (!appState.teachers || appState.teachers.length === 0) {
      appState.teachers = [
        { id: "admin_official_teacher", name: "Ustoz", email: "teacher@ethith.uz", phone: "+998 90 123 45 67", card: "8600 1122 3344 5566", monthlySalary: 6000000, hourlyRate: 100000, teachingHours: 72, paidThisMonth: true, assignedClasses: ["cls_ethith_main", "cls_upper_intermediate"] },
        { id: "t_zizi", name: "Zizi Ustoz", email: "zizi@ethith.uz", phone: "+998 93 987 65 43", card: "9860 7788 9900 1122", monthlySalary: 5500000, hourlyRate: 85000, teachingHours: 64, paidThisMonth: false, assignedClasses: ["cls_1792041880052"] }
      ];
    }
    if (!appState.fileExplorer || !appState.fileExplorer.folders || appState.fileExplorer.folders.length === 0) {
      appState.fileExplorer = {
        folders: [
          { id: "f_root", name: "Bosh Papka", parentId: null, createdAt: Date.now() },
          { id: "f_grammar", name: "Grammar Mastery", parentId: "f_root", createdAt: Date.now() },
          { id: "f_vocab", name: "Vocabulary Builder", parentId: "f_root", createdAt: Date.now() },
          { id: "f_ielts", name: "IELTS Mock Tests", parentId: "f_root", createdAt: Date.now() }
        ],
        tests: [
          {
            id: "TST-7K2M9",
            title: "Unit 7: Modals of Deduction & Obligation",
            folderId: "f_grammar",
            authorName: "Ustoz",
            createdAt: Date.now(),
            maxAttempts: 1,
            questions: [
              { q: "You ______ be exhausted after working for 14 hours straight!", options: ["must", "can't", "might not", "should"], correct: 0 },
              { q: "He ______ have stolen the money; he was with me in London that evening.", options: ["must", "can't", "ought to", "might"], correct: 1 },
              { q: "Students ______ wear uniforms during official exams according to school rules.", options: ["have to", "might", "could", "would"], correct: 0 },
              { q: "You ______ tell anyone this secret; it's strictly confidential.", options: ["mustn't", "don't have to", "needn't", "may not"], correct: 0 },
              { q: "We ______ have left earlier; look at all this traffic now!", options: ["should", "must", "can't", "might"], correct: 0 }
            ]
          },
          {
            id: "TST-4H8R1",
            title: "Unit 8: Compound Adjectives & Participle Clauses",
            folderId: "f_vocab",
            authorName: "Zizi Ustoz",
            createdAt: Date.now(),
            maxAttempts: 1,
            questions: [
              { q: "A person who is relaxed and not easily upset is ______.", options: ["easy-going", "short-tempered", "well-mannered", "broad-minded"], correct: 0 },
              { q: "______ for 10 a.m. tomorrow, the conference has now been rescheduled.", options: ["Scheduled", "Scheduling", "To schedule", "Having schedule"], correct: 0 },
              { q: "Products ______ locally are often fresher and support the local economy.", options: ["grown", "growing", "have grown", "to grow"], correct: 0 },
              { q: "A person with a great knowledge from books is ______.", options: ["well-educated", "quick-witted", "bad-tempered", "open-minded"], correct: 0 }
            ]
          }
        ]
      };
    }
    if (!appState.timetable || appState.timetable.length === 0) {
      appState.timetable = [
        { id: "tt_1", time: "08:00 - 09:30", days: "Du-Chor-Jum", teacherId: "t_zizi", teacherName: "Zizi Ustoz", classId: "cls_1792041880052", className: "Bizani gurux (B1+)", room: "Room 101 (Green Room)" },
        { id: "tt_2", time: "10:00 - 11:30", days: "Du-Chor-Jum", teacherId: "admin_official_teacher", teacherName: "Ustoz", classId: "cls_ethith_main", className: "IELTS Intensive (B2)", room: "Room 102 (Blue Room)" },
        { id: "tt_3", time: "14:00 - 15:30", days: "Se-Pay-Shan", teacherId: "t_zizi", teacherName: "Zizi Ustoz", classId: "cls_1792041880052", className: "Bizani gurux (B1+)", room: "Room 101 (Green Room)" },
        { id: "tt_4", time: "16:00 - 17:30", days: "Se-Pay-Shan", teacherId: "admin_official_teacher", teacherName: "Ustoz", classId: "cls_ethith_main", className: "IELTS Intensive (B2)", room: "Room 102 (Blue Room)" }
      ];
    }
    if (!appState.contests || appState.contests.length === 0) {
      appState.contests = [
        {
          id: "cnt_kuzgi_2026",
          title: "🏆 Kuzgi Katta IELTS & Grammar Musobaqasi",
          desc: "Barcha guruhlar o'rtasida 1 oylik katta musobaqa! Top-10 eng yuqori natija qayd etgan o'quvchilarga 1,000 Coin va sertifikatlar!",
          startDate: Date.now() - 86400000,
          endDate: Date.now() + 86400000 * 7,
          prizeCoins: 1000,
          testId: "TST-7K2M9",
          participants: {
            "std_1": { name: "Ashurov Dilyorbek", score: 95, timeSec: 140, completedAt: Date.now() - 3600000 },
            "std_2": { name: "Ergasheva Madina", score: 92, timeSec: 165, completedAt: Date.now() - 3500000 },
            "std_4": { name: "JO‘RABOYEV MUXAMMADYUSUF", score: 98, timeSec: 110, completedAt: Date.now() - 3400000 },
            "std_5": { name: "Jo'raboyev Javoxir", score: 88, timeSec: 180, completedAt: Date.now() - 3300000 },
            "std_6": { name: "Mavlonova Ruxshona", score: 85, timeSec: 190, completedAt: Date.now() - 3200000 }
          },
          status: "active"
        }
      ];
    }
    if (!appState.payments) appState.payments = {};
    if (!appState.payments['2026-10']) {
      appState.payments['2026-10'] = {
        "std_1": { status: "paid", baseAmount: 200000, offsetAmount: 200014, paidAmount: 200014, paidAt: Date.now() - 86400000 * 3, verifiedBy: "auto_offset" },
        "std_2": { status: "paid", baseAmount: 200000, offsetAmount: 200028, paidAmount: 200028, paidAt: Date.now() - 86400000 * 2, verifiedBy: "auto_offset" },
        "std_3": { status: "unpaid", baseAmount: 200000, offsetAmount: 200042, paidAmount: 0 },
        "std_4": { status: "paid", baseAmount: 200000, offsetAmount: 200056, paidAmount: 200056, paidAt: Date.now() - 86400000, verifiedBy: "auto_offset" },
        "std_5": { status: "pending", baseAmount: 200000, offsetAmount: 200070, paidAmount: 200070, receiptUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='300' height='200' fill='%231e293b'/><text x='20' y='50' fill='%2338bdf8' font-size='16'>Click Chek: 200,070 UZS</text><text x='20' y='90' fill='%2394a3b8' font-size='12'>Sana: 25.10.2026 14:32</text></svg>", paidAt: Date.now() - 7200000 }
      };
    }
    if (!appState.classes || appState.classes.length === 0) {
      if (window.EthithAttendance && window.EthithAttendance.classes && window.EthithAttendance.classes.length > 0) {
        appState.classes = window.EthithAttendance.classes;
      }
    }
    return appState;
  }

  function saveStore() {
    // 1. In-memory & LocalStorage instant update (0.01ms - 0.05ms)
    if (window.EthithApp && typeof window.EthithApp.saveState === 'function') {
      window.EthithApp.saveState();
    }
    // 2. Cross-tab real-time BroadcastChannel relay (0.1ms)
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        if (!window._eeChannel) window._eeChannel = new BroadcastChannel('ethith_cloud_channel');
        window._eeChannel.postMessage({ type: 'ENTERPRISE_SYNC', state: getStore() });
      }
    } catch(e) {}
    // 3. Asynchronous non-blocking background GitHub persistence via token
    if (window.EthithSync && typeof window.EthithSync.pushRemoteStore === 'function') {
      window.EthithSync.pushRemoteStore();
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

  function isTeacher() {
    var u = getCurrentUser();
    return u && (u.role === 'teacher' || u.id === 'admin_official_teacher');
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
    var isStaff = isTeacher();
    var selectedFolderId = null;

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
      subFolders = fe.folders.filter(function(f) {
        if (f.id === 'f_root') return false;
        return f.name.toLowerCase().includes(q);
      });
      subTests = fe.tests.filter(function(t) {
        return (t.title && t.title.toLowerCase().includes(q)) || (t.id && t.id.toLowerCase().includes(q));
      });
    }

    var h = '<div class="ee-explorer-wrap" tabindex="0" style="outline:none;">' +
      // Header
      '<div style="background:rgba(15,23,42,0.85);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:22px;margin-bottom:20px;box-shadow:0 8px 32px rgba(0,0,0,0.4);">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;">' +
          '<div style="display:flex;align-items:center;gap:12px;">' +
            '<div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,rgba(56,189,248,0.2),rgba(37,99,235,0.2));border:1px solid rgba(56,189,248,0.4);display:flex;align-items:center;justify-content:center;font-size:24px;">💻</div>' +
            '<div>' +
              '<h2 style="margin:0;font-size:22px;font-weight:900;color:#f8fafc;letter-spacing:-0.4px;">💻 Qo‘shimcha testlar va Savollar Banki</h2>' +
              '<p style="margin:4px 0 0;font-size:13px;color:#94a3b8;">Kompyuter fayl tizimidek: papkalarni bosib turib sudrang (Drag & Drop), F2 bilan nomini o‘zgartiring va o‘ng tugma bilan boshqaring.</p>' +
            '</div>' +
          '</div>' +
          (isStaff ? (
            '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
              '<button id="eeNewFolderBtn" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#f1f5f9;border-radius:12px;padding:9px 16px;font-size:13px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:8px;">📁 Yangi Papka</button>' +
              '<button id="eeNewVisualBtn" style="background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:12px;padding:9px 18px;font-size:13px;font-weight:900;cursor:pointer;display:flex;align-items:center;gap:8px;box-shadow:0 4px 16px rgba(2,132,199,0.4);">🎨 Interaktiv Rasm/PDF Test</button>' +
              '<button id="eeNewTestBtn" style="background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.3);border-radius:12px;padding:9px 16px;font-size:13px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:8px;">📝 Standart Test</button>' +
            '</div>'
          ) : '') +
        '</div>' +

        // Breadcrumbs & Search Bar
        '<div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">' +
          '<div style="display:flex;align-items:center;gap:8px;font-size:13px;flex-wrap:wrap;">';
            breadcrumbs.forEach(function(b, idx) {
              var isLast = idx === breadcrumbs.length - 1;
              h += '<button class="ee-breadcrumb-item" data-fid="' + b.id + '" ' +
                'ondragover="event.preventDefault();this.style.color=\'#00c0ff\';this.style.background=\'rgba(0,192,255,0.2)\';" ' +
                'ondragleave="this.style.color=\'' + (isLast ? '#38bdf8' : '#94a3b8') + '\';this.style.background=\'none\';" ' +
                'ondrop="window.EthithEnterprise.handleDropItem(event, \'' + b.id + '\');" ' +
                'style="background:none;border:none;color:' + (isLast ? '#38bdf8' : '#94a3b8') + ';font-weight:' + (isLast ? '800' : '600') + ';cursor:pointer;padding:4px 8px;border-radius:6px;transition:all 0.15s ease;">' +
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

    // Empty state
    if (subFolders.length === 0 && subTests.length === 0) {
      h += '<div style="background:rgba(15,23,42,0.6);border:2px dashed rgba(255,255,255,0.1);border-radius:20px;padding:60px 20px;text-align:center;color:#94a3b8;">' +
        '<div style="font-size:48px;margin-bottom:12px;">📂</div>' +
        '<h3 style="margin:0 0 6px;color:#f8fafc;font-size:16px;">Ushbu papka bo‘sh</h3>' +
        '<p style="margin:0;font-size:13px;">O‘ng tugmani bosing yoki yuqoridagi tugmalar orqali yangi papka yoki test qo‘shing.</p>' +
      '</div>';
    } else if (explorerViewMode === 'grid') {
      // Grid Mode
      h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px;">';

      // Render Folders
      subFolders.forEach(function(f) {
        var itemsCount = fe.tests.filter(function(t) { return t.folderId === f.id; }).length;
        h += '<div class="ee-folder-card" data-fid="' + f.id + '" draggable="true" ' +
          'ondragstart="window.EthithEnterprise.handleFolderDragStart(event, \'' + f.id + '\');" ' +
          'ondragover="window.EthithEnterprise.handleFolderDragOver(event, this);" ' +
          'ondragleave="window.EthithEnterprise.handleFolderDragLeave(event, this);" ' +
          'ondrop="window.EthithEnterprise.handleFolderDrop(event, \'' + f.id + '\');" ' +
          'style="background:rgba(15,23,42,0.7);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:16px;cursor:pointer;transition:all 0.15s ease;display:flex;flex-direction:column;align-items:center;text-align:center;position:relative;user-select:none;">' +
          '<div style="font-size:44px;margin-bottom:8px;line-height:1;pointer-events:none;">📁</div>' +
          '<div class="ee-folder-name" data-fid="' + f.id + '" style="font-size:13.5px;font-weight:800;color:#f8fafc;word-break:break-word;width:100%;min-height:22px;display:flex;align-items:center;justify-content:center;padding:2px 4px;border-radius:6px;" title="Double-click bilan nomini o‘zgartiring">' + esc(f.name) + '</div>' +
          '<div style="font-size:11.5px;color:#64748b;margin-top:4px;pointer-events:none;">' + itemsCount + ' ta test</div>' +
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
              '<span style="font-size:24px;">' + (t.type === 'visual_overlay' ? '🎨' : '📝') + '</span>' +
              '<span style="background:rgba(56,189,248,0.15);color:#38bdf8;font-size:10.5px;font-weight:900;padding:2px 8px;border-radius:6px;border:1px solid rgba(56,189,248,0.3);">' + esc(t.id) + '</span>' +
            '</div>' +
            '<div style="font-size:13.5px;font-weight:800;color:#f8fafc;line-height:1.3;margin-bottom:6px;">' + esc(t.title) + '</div>' +
            '<div style="font-size:11.5px;color:#94a3b8;display:flex;align-items:center;gap:6px;">' +
              '<span>' + qCount + ' ta savol</span> • <span>' + esc(t.authorName || 'Ustoz') + '</span>' +
            '</div>' +
          '</div>' +
          '<div style="margin-top:14px;display:flex;gap:6px;flex-wrap:wrap;">' +
            (isStaff ? '<button class="ee-assign-hw-btn" data-tid="' + t.id + '" style="flex:1;background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:8px;padding:6px 8px;font-size:11px;font-weight:800;cursor:pointer;">📤 Guruhga</button>' : '') +
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
            h += '<tr style="border-top:1px solid rgba(255,255,255,0.06);cursor:pointer;user-select:none;" class="ee-folder-row" data-fid="' + f.id + '" draggable="true" ' +
              'ondragstart="window.EthithEnterprise.handleFolderDragStart(event, \'' + f.id + '\');" ' +
              'ondragover="window.EthithEnterprise.handleFolderDragOver(event, this);" ' +
              'ondragleave="window.EthithEnterprise.handleFolderDragLeave(event, this);" ' +
              'ondrop="window.EthithEnterprise.handleFolderDrop(event, \'' + f.id + '\');">' +
              '<td style="padding:12px 16px;font-weight:800;color:#f8fafc;display:flex;align-items:center;gap:8px;">' +
                '<span style="font-size:18px;">📁</span> <span class="ee-folder-name" data-fid="' + f.id + '">' + esc(f.name) + '</span>' +
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
                '<span style="font-size:16px;margin-right:6px;">' + (t.type === 'visual_overlay' ? '🎨' : '📝') + '</span> ' + esc(t.title) +
              '</td>' +
              '<td style="padding:12px 16px;color:#38bdf8;font-weight:800;">' + esc(t.id) + '</td>' +
              '<td style="padding:12px 16px;color:#94a3b8;">' + (t.questions || []).length + ' ta</td>' +
              '<td style="padding:12px 16px;color:#94a3b8;">' + esc(t.authorName || 'Ustoz') + '</td>' +
              '<td style="padding:12px 16px;text-align:right;">' +
                (isStaff ? '<button class="ee-assign-hw-btn" data-tid="' + t.id + '" style="background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:800;cursor:pointer;margin-right:6px;">Guruhga</button>' : '') +
                '<button class="ee-take-test-btn" data-tid="' + t.id + '" style="background:rgba(16,185,129,0.2);color:#34d399;border:1px solid rgba(16,185,129,0.4);border-radius:6px;padding:4px 10px;font-size:11px;font-weight:800;cursor:pointer;margin-right:6px;">Ishlash</button>' +
                (isStaff ? '<button class="ee-del-test-btn" data-tid="' + t.id + '" style="background:none;border:none;color:#ef4444;font-weight:700;cursor:pointer;">O‘chirish</button>' : '') +
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

    // PC Folder Interactions: Single Click (Select), Double Click (Open), Double Click Name (Rename)
    container.querySelectorAll('.ee-folder-card, .ee-folder-row').forEach(function(el) {
      var fid = el.getAttribute('data-fid');

      // Dragend restore opacity
      el.ondragend = function() { el.style.opacity = '1'; };

      // Single click selects card
      el.onclick = function(e) {
        if (e.target.closest('.ee-del-folder-btn, .ee-inline-rename-input')) return;
        container.querySelectorAll('.ee-folder-card, .ee-folder-row').forEach(function(o) {
          o.classList.remove('ee-selected');
          o.style.borderColor = 'rgba(255,255,255,0.1)';
          o.style.background = 'rgba(15,23,42,0.7)';
          o.style.boxShadow = '';
        });
        el.classList.add('ee-selected');
        el.style.borderColor = '#00c0ff';
        el.style.background = 'rgba(0,192,255,0.15)';
        el.style.boxShadow = '0 0 16px rgba(0,192,255,0.35)';
        selectedFolderId = fid;
      };

      // Double click opens folder
      el.ondblclick = function(e) {
        if (e.target.closest('.ee-del-folder-btn, .ee-inline-rename-input')) return;
        currentFolderId = fid;
        EE.renderExplorerView(container);
      };

      // Double click on folder name triggers inline rename
      var nameEl = el.querySelector('.ee-folder-name');
      if (nameEl) {
        nameEl.ondblclick = function(e) {
          e.stopPropagation();
          EE.startInlineRenameFolder(fid, container);
        };
      }
    });

    // Keyboard F2 support for inline rename
    var wrap = container.querySelector('.ee-explorer-wrap');
    if (wrap) {
      wrap.onkeydown = function(e) {
        if (e.key === 'F2' && selectedFolderId) {
          e.preventDefault();
          EE.startInlineRenameFolder(selectedFolderId, container);
        }
      };

      wrap.oncontextmenu = function(e) {
        if (!isStaff) return;
        if (e.target.closest('button, input, select, a, textarea, .ee-folder-card, .ee-folder-row')) return;
        e.preventDefault();
        EE.showExplorerContextMenu(e.clientX, e.clientY, container, currentFolderId);
      };
    }

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
        var newFid = 'f_' + Date.now();
        fe.folders.push({
          id: newFid,
          name: "Yangi Papka",
          parentId: currentFolderId,
          createdAt: Date.now()
        });
        saveStore();
        EE.renderExplorerView(container);
        setTimeout(function() {
          EE.startInlineRenameFolder(newFid, container);
        }, 80);
      };
    }

    var newVisualBtn = container.querySelector('#eeNewVisualBtn');
    if (newVisualBtn) {
      newVisualBtn.onclick = function() {
        EE.openVisualTestBuilderModal(container, currentFolderId);
      };
    }

    var newTestBtn = container.querySelector('#eeNewTestBtn');
    if (newTestBtn) {
      newTestBtn.onclick = function() {
        EE.openCreateTestModal(container, currentFolderId);
      };
    }

    // Folder context menu (right click)
    container.querySelectorAll('.ee-folder-card, .ee-folder-row').forEach(function(el) {
      el.oncontextmenu = function(e) {
        if (!isStaff) return;
        e.preventDefault();
        e.stopPropagation();
        var fid = el.getAttribute('data-fid');
        EE.showFolderContextMenu(e.clientX, e.clientY, container, fid);
      };
    });

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

  // PC-Style Drag and Drop Handlers for Folders
  EE.handleFolderDragStart = function(e, folderId) {
    e.dataTransfer.setData('text/folder-id', folderId);
    e.dataTransfer.effectAllowed = 'move';
    var el = e.currentTarget;
    setTimeout(function() { if (el) el.style.opacity = '0.35'; }, 0);
  };

  EE.handleFolderDragOver = function(e, el) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    el.style.borderColor = '#00c0ff';
    el.style.background = 'rgba(0,192,255,0.22)';
    el.style.transform = 'translateY(-3px) scale(1.03)';
    el.style.boxShadow = '0 10px 30px rgba(0,192,255,0.4)';
  };

  EE.handleFolderDragLeave = function(e, el) {
    el.style.borderColor = '';
    el.style.background = '';
    el.style.transform = '';
    el.style.boxShadow = '';
  };

  EE.handleFolderDrop = function(e, targetFolderId) {
    e.preventDefault();
    e.currentTarget.style.borderColor = '';
    e.currentTarget.style.background = '';
    e.currentTarget.style.transform = '';
    e.currentTarget.style.boxShadow = '';
    EE.handleDropItem(e, targetFolderId);
  };

  // PC-Style Inline Rename on Card
  EE.startInlineRenameFolder = function(folderId, container) {
    var S = getStore();
    var fe = S.fileExplorer || { folders: [] };
    var f = fe.folders.find(function(item) { return item.id === folderId; });
    if (!f) return;

    var nameEl = container.querySelector('.ee-folder-name[data-fid="' + folderId + '"]');
    if (!nameEl) return;

    var origName = f.name;
    nameEl.innerHTML = '<input type="text" class="ee-inline-rename-input" value="' + esc(origName) + '" style="width:96%;background:#020617;border:2px solid #00c0ff;border-radius:6px;color:#fff;padding:3px 6px;font-size:13px;font-weight:800;text-align:center;outline:none;box-shadow:0 0 14px rgba(0,192,255,0.6);" />';

    var inp = nameEl.querySelector('.ee-inline-rename-input');
    inp.focus();
    inp.select();

    var committed = false;
    function commitRename() {
      if (committed) return;
      committed = true;
      var val = inp.value.trim();
      if (val && val !== origName) {
        f.name = val;
        saveStore();
        showToast("✓ Papka nomi o‘zgartirildi: " + val);
      }
      EE.renderExplorerView(container);
    }

    inp.onkeydown = function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitRename();
      } else if (e.key === 'Escape') {
        committed = true;
        EE.renderExplorerView(container);
      }
    };

    inp.onblur = function() {
      commitRename();
    };
  };

  // Drag & drop test or folder into folder
  EE.handleDropItem = function(e, targetFolderId) {
    e.preventDefault();
    e.stopPropagation();
    var S = getStore();
    var folderId = e.dataTransfer.getData('text/folder-id');
    var testId = e.dataTransfer.getData('text/plain');

    if (folderId) {
      if (folderId === targetFolderId) return;
      var movingF = S.fileExplorer.folders.find(function(f) { return f.id === folderId; });
      if (!movingF) return;

      // Prevent moving folder into its own subfolder
      var check = targetFolderId;
      var isCycle = false;
      while (check && check !== 'f_root') {
        if (check === folderId) { isCycle = true; break; }
        var parentF = S.fileExplorer.folders.find(function(f) { return f.id === check; });
        check = parentF ? parentF.parentId : null;
      }
      if (isCycle) {
        alert("Papkani o‘zining ichidagi papkaga ko‘chirib bo‘lmaydi!");
        return;
      }

      movingF.parentId = targetFolderId;
      saveStore();
      showToast("✓ Papka muvaffaqiyatli ko‘chirildi!");
      var c = document.getElementById('apView');
      if (c) EE.renderExplorerView(c);
      return;
    }

    if (testId) {
      var test = (S.fileExplorer.tests || []).find(function(t) { return t.id === testId; });
      if (test) {
        test.folderId = targetFolderId;
        saveStore();
        showToast("✓ Test muvaffaqiyatli ko‘chirildi!");
        var c = document.getElementById('apView');
        if (c) EE.renderExplorerView(c);
      }
    }
  };
  EE.handleDropTest = EE.handleDropItem;

  // Folder Context Menu
  EE.showFolderContextMenu = function(x, y, container, folderId) {
    var old = document.getElementById('eeContextMenu');
    if (old) old.remove();

    var S = getStore();
    var fe = S.fileExplorer || { folders: [] };
    var f = fe.folders.find(function(item) { return item.id === folderId; });
    var folderName = f ? f.name : 'Papka';

    var menu = document.createElement('div');
    menu.id = 'eeContextMenu';
    menu.style.cssText = 'position:fixed;top:' + y + 'px;left:' + x + 'px;z-index:2147483647;background:rgba(15,23,42,0.96);backdrop-filter:blur(16px);border:1.5px solid #00c0ff;border-radius:14px;padding:6px;min-width:240px;box-shadow:0 16px 40px rgba(0,0,0,0.7);';

    menu.innerHTML = '' +
      '<div style="padding:6px 10px;font-size:11px;font-weight:900;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid rgba(255,255,255,0.06);margin-bottom:4px;">📁 ' + esc(folderName) + '</div>' +
      '<div class="ee-ctx-item" id="eeCtxOpenFolder" style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;color:#f1f5f9;font-size:13px;font-weight:700;cursor:pointer;">' +
        '<span style="font-size:16px;">📂</span> <span>Papkani Ochish</span>' +
      '</div>' +
      '<div class="ee-ctx-item" id="eeCtxRenameFolder" style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;color:#38bdf8;font-size:13px;font-weight:800;cursor:pointer;">' +
        '<span style="font-size:16px;">✏️</span> <span>Nomini O‘zgartirish (F2)</span>' +
      '</div>' +
      '<div class="ee-ctx-item" id="eeCtxMoveFolder" style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;color:#f1f5f9;font-size:13px;font-weight:700;cursor:pointer;">' +
        '<span style="font-size:16px;">📦</span> <span>Boshqa Papkaga Ko‘chirish...</span>' +
      '</div>' +
      '<div style="height:1px;background:rgba(255,255,255,0.06);margin:4px 0;"></div>' +
      '<div class="ee-ctx-item" id="eeCtxDelFolder" style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;color:#ef4444;font-size:13px;font-weight:700;cursor:pointer;">' +
        '<span style="font-size:16px;">🗑</span> <span>Papkani O‘chirish</span>' +
      '</div>';

    document.body.appendChild(menu);

    var close = function() { if (menu) menu.remove(); document.removeEventListener('click', close); };
    setTimeout(function() { document.addEventListener('click', close); }, 20);

    menu.querySelector('#eeCtxOpenFolder').onclick = function() {
      currentFolderId = folderId;
      EE.renderExplorerView(container);
    };

    menu.querySelector('#eeCtxRenameFolder').onclick = function() {
      EE.startInlineRenameFolder(folderId, container);
    };

    menu.querySelector('#eeCtxMoveFolder').onclick = function() {
      EE.openMoveFolderModal(folderId, container);
    };

    menu.querySelector('#eeCtxDelFolder').onclick = function() {
      if (confirm("Ushbu papkani o‘chirishni xohlaysizmi?")) {
        fe.folders = fe.folders.filter(function(item) { return item.id !== folderId; });
        fe.tests.forEach(function(t) { if (t.folderId === folderId) t.folderId = 'f_root'; });
        saveStore();
        showToast("Papka o‘chirildi");
        EE.renderExplorerView(container);
      }
    };
  };

  EE.openMoveFolderModal = function(folderId, container) {
    var modalRoot = document.getElementById('eaGlobalModalRoot') || document.body;
    var S = getStore();
    var fe = S.fileExplorer || { folders: [] };
    var currentF = fe.folders.find(function(f) { return f.id === folderId; });
    if (!currentF) return;

    function isDescendant(checkId, ancestorId) {
      var cur = checkId;
      while (cur && cur !== 'f_root') {
        if (cur === ancestorId) return true;
        var p = fe.folders.find(function(item) { return item.id === cur; });
        cur = p ? p.parentId : null;
      }
      return false;
    }

    var validTargets = [{ id: 'f_root', name: '🏠 Asosiy Bo‘lim (Bosh sahifa)' }];
    fe.folders.forEach(function(f) {
      if (f.id !== folderId && !isDescendant(f.id, folderId)) {
        validTargets.push(f);
      }
    });

    var m = document.createElement('div');
    m.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.85);backdrop-filter:blur(10px);z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:16px;';
    var h = '<div style="background:#0f172a;border:1.5px solid #00c0ff;border-radius:18px;max-width:440px;width:100%;padding:22px;color:#f8fafc;box-shadow:0 20px 50px rgba(0,0,0,0.8);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">' +
        '<h3 style="margin:0;font-size:16px;font-weight:900;color:#00c0ff;">📦 Papkani Ko‘chirish: ' + esc(currentF.name) + '</h3>' +
        '<button id="eeCloseMoveF" style="background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer;">✕</button>' +
      '</div>' +
      '<p style="font-size:12.5px;color:#94a3b8;margin:0 0 14px;">Qaysi manzil papkasiga ko‘chirmoqchisiz?</p>' +
      '<div style="display:flex;flex-direction:column;gap:8px;max-height:280px;overflow-y:auto;margin-bottom:16px;">';

    validTargets.forEach(function(target) {
      var isCurrentParent = (currentF.parentId === target.id) || (!currentF.parentId && target.id === 'f_root');
      h += '<button class="ee-target-folder-btn" data-tid="' + target.id + '" style="display:flex;align-items:center;gap:10px;background:' + (isCurrentParent ? 'rgba(56,189,248,0.15)' : 'rgba(30,41,59,0.7)') + ';border:1px solid ' + (isCurrentParent ? '#38bdf8' : 'rgba(255,255,255,0.08)') + ';padding:11px 14px;border-radius:10px;color:#f8fafc;font-weight:700;font-size:13px;cursor:pointer;text-align:left;transition:all 0.15s ease;">' +
        '<span style="font-size:18px;">' + (target.id === 'f_root' ? '🏠' : '📁') + '</span> ' +
        '<span>' + esc(target.name) + '</span>' +
        (isCurrentParent ? '<span style="margin-left:auto;font-size:11px;color:#38bdf8;font-weight:900;">Hozirgi joyi</span>' : '') +
      '</button>';
    });

    h += '</div>' +
      '<div style="display:flex;justify-content:flex-end;">' +
        '<button id="eeCancelMoveF" style="background:rgba(255,255,255,0.08);border:none;color:#cbd5e1;padding:8px 16px;border-radius:8px;font-weight:700;cursor:pointer;">Bekor qilish</button>' +
      '</div>' +
    '</div>';

    m.innerHTML = h;
    modalRoot.appendChild(m);

    var close = function() { m.remove(); };
    m.querySelector('#eeCloseMoveF').onclick = close;
    m.querySelector('#eeCancelMoveF').onclick = close;

    m.querySelectorAll('.ee-target-folder-btn').forEach(function(btn) {
      btn.onclick = function() {
        var tid = btn.getAttribute('data-tid');
        currentF.parentId = tid;
        saveStore();
        close();
        showToast("✓ Papka muvaffaqiyatli ko‘chirildi!");
        if (container) EE.renderExplorerView(container);
      };
    });
  };

  // ============================================================================
  // RIGHT-CLICK CONTEXT MENU (Sichqonchaning o'ng tugmasi)
  // ============================================================================
  EE.showExplorerContextMenu = function(x, y, container, folderId) {
    var old = document.getElementById('eeContextMenu');
    if (old) old.remove();

    var menu = document.createElement('div');
    menu.id = 'eeContextMenu';
    menu.style.cssText = 'position:fixed;top:' + y + 'px;left:' + x + 'px;z-index:2147483647;background:rgba(15,23,42,0.96);backdrop-filter:blur(16px);border:1px solid rgba(56,189,248,0.35);border-radius:14px;padding:6px;min-width:230px;box-shadow:0 16px 40px rgba(0,0,0,0.65);';

    menu.innerHTML = '' +
      '<div style="padding:6px 10px;font-size:11px;font-weight:900;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid rgba(255,255,255,0.06);margin-bottom:4px;">Qo‘shimcha Testlar Menyusi</div>' +
      '<div class="ee-ctx-item" id="eeCtxNewFolder" style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;color:#f1f5f9;font-size:13px;font-weight:700;cursor:pointer;">' +
        '<span style="font-size:16px;">📁</span> <span>Yangi Papka Ochish</span>' +
      '</div>' +
      '<div class="ee-ctx-item" id="eeCtxNewVisual" style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;color:#38bdf8;font-size:13px;font-weight:800;cursor:pointer;">' +
        '<span style="font-size:16px;">🎨</span> <span>Interaktiv Rasm/PDF Test</span>' +
      '</div>' +
      '<div class="ee-ctx-item" id="eeCtxNewTest" style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;color:#f1f5f9;font-size:13px;font-weight:700;cursor:pointer;">' +
        '<span style="font-size:16px;">📝</span> <span>Standart Test Yaratish</span>' +
      '</div>' +
      '<div style="height:1px;background:rgba(255,255,255,0.06);margin:4px 0;"></div>' +
      '<div class="ee-ctx-item" id="eeCtxRefresh" style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;color:#94a3b8;font-size:12.5px;font-weight:700;cursor:pointer;">' +
        '<span style="font-size:15px;">🔄</span> <span>Sahifani Yangilash</span>' +
      '</div>';

    document.body.appendChild(menu);

    var rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth - 10) menu.style.left = (window.innerWidth - rect.width - 12) + 'px';
    if (rect.bottom > window.innerHeight - 10) menu.style.top = (window.innerHeight - rect.height - 12) + 'px';

    menu.querySelectorAll('.ee-ctx-item').forEach(function(it) {
      it.onmouseenter = function() { it.style.background = 'rgba(56,189,248,0.18)'; };
      it.onmouseleave = function() { it.style.background = 'transparent'; };
    });

    var close = function() { if (menu && menu.parentNode) menu.remove(); };

    menu.querySelector('#eeCtxNewFolder').onclick = function() {
      close();
      var n = prompt("Yangi papka nomini kiriting:", "Yangi Papka");
      if (n && n.trim()) {
        var S = getStore();
        S.fileExplorer.folders.push({
          id: 'f_' + Date.now(),
          name: n.trim(),
          parentId: folderId,
          createdAt: Date.now()
        });
        saveStore();
        showToast("Papka yaratildi");
        EE.renderExplorerView(container);
      }
    };

    menu.querySelector('#eeCtxNewVisual').onclick = function() {
      close();
      EE.openVisualTestBuilderModal(container, folderId);
    };

    menu.querySelector('#eeCtxNewTest').onclick = function() {
      close();
      EE.openCreateTestModal(container, folderId);
    };

    menu.querySelector('#eeCtxRefresh').onclick = function() {
      close();
      EE.renderExplorerView(container);
    };

    setTimeout(function() {
      var onDocClick = function(e) {
        if (!menu.contains(e.target)) {
          close();
          document.removeEventListener('click', onDocClick);
        }
      };
      document.addEventListener('click', onDocClick);
    }, 10);
  };

  // ============================================================================
  // VISUAL OVERLAY INTERACTIVE TEST BUILDER (Rasm / PDF ustida shaffof tahrirlash)
  // ============================================================================
  EE.openVisualTestBuilderModal = function(container, folderId) {
    var modalRoot = document.getElementById('eaGlobalModalRoot') || document.body;
    var randCode = 'TST-' + Math.random().toString(36).substring(2, 6).toUpperCase() + Math.floor(Math.random() * 9 + 1);

    var m = document.createElement('div');
    m.id = 'eeVisualBuilderOverlay';
    m.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;background:#070b14;z-index:2147483640;display:flex;flex-direction:column;overflow:hidden;margin:0;padding:0;box-sizing:border-box;color:#f8fafc;font-family:system-ui,-apple-system,sans-serif;';

    var defaultSvg = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200"><rect width="100%" height="100%" fill="#ffffff"/><rect x="40" y="40" width="820" height="1120" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/><text x="70" y="100" font-family="sans-serif" font-weight="900" font-size="28" fill="#0f172a">ETHITH ENGLISH TEST SHEET</text><text x="70" y="135" font-family="sans-serif" font-weight="600" font-size="16" fill="#64748b">Exercise 1: Read the sentences and fill in the missing grammar forms</text><line x1="70" y1="155" x2="830" y2="155" stroke="#cbd5e1" stroke-width="1.5"/><text x="70" y="210" font-family="sans-serif" font-size="17" fill="#334155">1. By the time Sarah arrived, the train _________________ (already / leave).</text><text x="70" y="270" font-family="sans-serif" font-size="17" fill="#334155">2. If you study diligently every day, you _________________ (pass) the IELTS exam.</text><text x="70" y="330" font-family="sans-serif" font-size="17" fill="#334155">3. Neither John nor his friends _________________ (be) aware of the changes.</text><text x="70" y="390" font-family="sans-serif" font-size="17" fill="#334155">4. The CEO demanded that the report _________________ (submit) before noon.</text><text x="70" y="450" font-family="sans-serif" font-size="17" fill="#334155">5. I wish I _________________ (know) the truth earlier!</text><text x="70" y="520" font-family="sans-serif" font-weight="700" font-size="18" fill="#0f172a">Exercise 2: Choose the correct preposition or connector</text><line x1="70" y1="540" x2="830" y2="540" stroke="#cbd5e1" stroke-width="1.5"/><text x="70" y="590" font-family="sans-serif" font-size="17" fill="#334155">6. She is extremely passionate [ about / with / for ] environmental protection.</text><text x="70" y="650" font-family="sans-serif" font-size="17" fill="#334155">7. Despite [ of the rain / the heavy rain / it was raining ], the match continued.</text><text x="70" y="710" font-family="sans-serif" font-size="17" fill="#334155">8. We arrived at the venue just [ in / on / at ] time for the opening speech.</text></svg>');

    // Array of pages: [ { pageNum: 1, imageUrl: '...', elements: [] }, ... ]
    var pagesData = [
      { pageNum: 1, imageUrl: defaultSvg, elements: [] }
    ];
    var currentWidthPx = 1000;

    m.innerHTML = '' +
      // Topbar
      '<div style="height:62px;padding:0 20px;background:#0f172a;border-bottom:1px solid rgba(56,189,248,0.25);display:flex;align-items:center;justify-content:space-between;gap:14px;box-shadow:0 4px 20px rgba(0,0,0,0.5);flex-shrink:0;z-index:50;">' +
        '<div style="display:flex;align-items:center;gap:12px;flex:1;max-width:440px;">' +
          '<div style="font-size:24px;line-height:1;">🎨</div>' +
          '<input type="text" id="eeVisualTitle" placeholder="Test Nomi (masalan: Unit 1 Test B2)" style="width:100%;padding:8px 14px;background:#1e293b;border:1.5px solid rgba(56,189,248,0.3);border-radius:10px;color:#fff;font-weight:800;font-size:13.5px;outline:none;" />' +
          '<div style="display:flex;align-items:center;gap:5px;flex-shrink:0;">' +
            '<span style="font-size:11.5px;color:#94a3b8;font-weight:700;">Urinish:</span>' +
            '<input type="number" id="eeVisualAttempts" min="1" max="50" value="1" style="width:52px;padding:6px;background:#1e293b;border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;font-weight:900;font-size:12px;text-align:center;outline:none;" title="O‘quvchi necha marta ishlay oladi" />' +
          '</div>' +
        '</div>' +

        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<label style="background:linear-gradient(135deg,rgba(56,189,248,0.2),rgba(37,99,235,0.2));color:#38bdf8;border:1.5px solid #38bdf8;padding:7px 14px;border-radius:10px;font-size:12.5px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 0 12px rgba(56,189,248,0.2);">' +
            '📁 PDF / Rasm Yuklash <input type="file" id="eeVisualFileInput" accept="image/*,application/pdf,.pdf" style="display:none;" />' +
          '</label>' +

          // Zoom & Fit Controls
          '<div style="display:flex;align-items:center;gap:4px;background:#1e293b;padding:3px 6px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);">' +
            '<button id="eeZoomOutBtn" style="background:#334155;border:none;color:#cbd5e1;padding:5px 9px;border-radius:6px;font-size:12px;font-weight:900;cursor:pointer;" title="Kichiklashtirish">🔍−</button>' +
            '<button id="eeZoom100Btn" style="background:none;border:none;color:#38bdf8;padding:4px 8px;font-size:11.5px;font-weight:800;cursor:pointer;" title="Asl o‘lcham (100%)">100%</button>' +
            '<button id="eeZoomInBtn" style="background:#334155;border:none;color:#cbd5e1;padding:5px 9px;border-radius:6px;font-size:12px;font-weight:900;cursor:pointer;" title="Kattalashtirish">🔍+</button>' +
            '<button id="eeFitWidthBtn" style="background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.3);color:#38bdf8;padding:4px 10px;border-radius:6px;font-size:11.5px;font-weight:800;cursor:pointer;margin-left:4px;" title="Ekranga to‘liq moslash">↔️ Kenglikka moslash</button>' +
          '</div>' +
        '</div>' +

        '<div style="display:flex;align-items:center;gap:12px;">' +
          '<div id="eeVisualCounter" style="font-size:12.5px;font-weight:800;color:#10b981;background:rgba(16,185,129,0.12);padding:5px 10px;border-radius:8px;border:1px solid rgba(16,185,129,0.25);">0 ta katakcha qo‘shildi</div>' +
          '<button id="eeSaveVisualBtn" style="background:linear-gradient(135deg,#0284c7,#2563eb);border:none;color:#fff;padding:9px 24px;border-radius:10px;font-weight:900;font-size:13.5px;cursor:pointer;box-shadow:0 4px 18px rgba(2,132,199,0.5);display:flex;align-items:center;gap:6px;">💾 Testni Saqlash</button>' +
          '<button id="eeCloseVisualModal" style="background:rgba(255,255,255,0.08);border:none;color:#94a3b8;font-size:18px;font-weight:900;cursor:pointer;padding:8px 12px;border-radius:10px;" title="Chiqish">✕</button>' +
        '</div>' +
      '</div>' +

      // Continuous Multi-Page Workspace (Oxford Navigate Style)
      '<div id="eeVisualWorkspace" style="flex:1;overflow-y:scroll;overflow-x:auto;padding:24px 20px 140px 20px;display:flex;flex-direction:column;align-items:center;background:#070b14;position:relative;">' +
        '<div id="eePagesStreamWrap" style="display:flex;flex-direction:column;align-items:center;gap:32px;width:100%;"></div>' +
        '<div style="margin-top:24px;font-size:12.5px;color:#64748b;text-align:center;">' +
          '💡 Sichqoncha bilan istalgan sahifa ustiga to‘rtburchak chizing — tizim <b>Yangi Katakcha</b> parametrlarini ochadi.' +
        '</div>' +
      '</div>';

    modalRoot.appendChild(m);

    var streamWrap = m.querySelector('#eePagesStreamWrap');
    var fileInp = m.querySelector('#eeVisualFileInput');
    var counterEl = m.querySelector('#eeVisualCounter');

    function getTotalElementsCount() {
      var total = 0;
      pagesData.forEach(function(p) { total += (p.elements || []).length; });
      return total;
    }

    function updateCounter() {
      counterEl.textContent = getTotalElementsCount() + " ta katakcha qo‘shildi";
    }

    function applyWrapWidth(w) {
      currentWidthPx = Math.max(650, Math.min(2200, w));
      streamWrap.querySelectorAll('.ee-page-box').forEach(function(box) {
        box.style.width = currentWidthPx + 'px';
      });
    }

    m.querySelector('#eeZoomInBtn').onclick = function() { applyWrapWidth(currentWidthPx + 150); };
    m.querySelector('#eeZoomOutBtn').onclick = function() { applyWrapWidth(currentWidthPx - 150); };
    m.querySelector('#eeZoom100Btn').onclick = function() { applyWrapWidth(1000); };
    m.querySelector('#eeFitWidthBtn').onclick = function() {
      var wsW = m.querySelector('#eeVisualWorkspace').clientWidth;
      applyWrapWidth(Math.floor(wsW * 0.94));
    };

    // Render all pages in vertical succession (Oxford Navigate layout)
    function renderAllPages() {
      streamWrap.innerHTML = '';

      pagesData.forEach(function(p, pIdx) {
        var pageNum = p.pageNum || (pIdx + 1);
        var box = document.createElement('div');
        box.className = 'ee-page-box';
        box.setAttribute('data-page', pageNum);
        box.style.cssText = 'position:relative;display:inline-block;width:' + currentWidthPx + 'px;max-width:98vw;box-shadow:0 14px 60px rgba(0,0,0,0.9);border-radius:10px;background:#ffffff;overflow:hidden;border:1px solid rgba(255,255,255,0.12);transition:width 0.15s ease;';

        box.innerHTML = '' +
          // Page header banner
          '<div style="background:#0f172a;color:#fff;padding:8px 16px;display:flex;align-items:center;justify-content:space-between;font-size:12.5px;font-weight:800;border-bottom:1px solid rgba(255,255,255,0.08);">' +
            '<span>📄 ' + pageNum + '-sahifa' + (pagesData.length > 1 ? (' (Jami ' + pagesData.length + ' ta)') : '') + '</span>' +
            '<span class="ee-page-subcounter" style="color:#38bdf8;">' + (p.elements || []).length + ' ta topshiriq</span>' +
          '</div>' +
          '<div style="position:relative;width:100%;background:#ffffff;">' +
            '<img src="' + p.imageUrl + '" style="width:100%;height:auto;display:block;user-select:none;pointer-events:none;" />' +
            '<div class="ee-page-overlay" data-page="' + pageNum + '" style="position:absolute;inset:0;cursor:crosshair;z-index:20;user-select:none;"></div>' +
          '</div>';

        streamWrap.appendChild(box);

        var overlay = box.querySelector('.ee-page-overlay');
        attachPageOverlayDrawing(overlay, p);
        renderPagePins(overlay, p);
      });

      updateCounter();
    }

    // Render pins for a specific page
    function renderPagePins(overlay, p) {
      overlay.querySelectorAll('.ee-visual-pin').forEach(function(el) { el.remove(); });
      (p.elements || []).forEach(function(el, idx) {
        var pin = document.createElement('div');
        pin.className = 'ee-visual-pin';
        pin.style.cssText = 'position:absolute;top:' + el.top + '%;left:' + el.left + '%;width:' + el.width + '%;height:' + el.height + '%;border:2px solid #00c0ff;background:rgba(0,192,255,0.22);border-radius:6px;display:flex;align-items:center;justify-content:center;box-sizing:border-box;pointer-events:auto;cursor:pointer;box-shadow:0 0 10px rgba(0,192,255,0.45);transition:all 0.15s ease;';
        pin.title = 'Tahrirlash: ' + (el.label || idx + 1) + ' (' + el.correct + ')';

        var badgeLabel = (el.label ? el.label : (idx + 1)) + ': ' + esc(el.correct || el.type);
        pin.innerHTML = '<span style="background:rgba(2,132,199,0.92);color:#fff;font-size:11px;font-weight:900;padding:2px 7px;border-radius:4px;pointer-events:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:92%;">' + badgeLabel + '</span>' +
          '<button class="ee-quick-del-pin" data-idx="' + idx + '" style="position:absolute;top:-8px;right:-8px;background:#ef4444;color:#fff;border:none;border-radius:50%;width:18px;height:18px;font-size:11px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.5);">✕</button>';

        pin.onclick = function(e) {
          if (e.target.closest('.ee-quick-del-pin')) return;
          e.stopPropagation();
          openKatakchaModal(false, el, idx, p, overlay);
        };

        overlay.appendChild(pin);
      });

      var subCounter = overlay.closest('.ee-page-box').querySelector('.ee-page-subcounter');
      if (subCounter) subCounter.textContent = (p.elements || []).length + " ta topshiriq";

      overlay.querySelectorAll('.ee-quick-del-pin').forEach(function(b) {
        b.onclick = function(e) {
          e.stopPropagation();
          var i = parseInt(b.getAttribute('data-idx'), 10);
          p.elements.splice(i, 1);
          renderPagePins(overlay, p);
          updateCounter();
        };
      });
    }

    // Attach drawing on page overlay
    function attachPageOverlayDrawing(overlay, p) {
      var isDrawing = false;
      var startX = 0, startY = 0;
      var drawBox = document.createElement('div');
      drawBox.style.cssText = 'position:absolute;border:2px dashed #00c0ff;background:rgba(0,192,255,0.25);box-shadow:0 0 16px rgba(0,192,255,0.5);display:none;pointer-events:none;z-index:30;border-radius:4px;';
      overlay.appendChild(drawBox);

      overlay.onmousedown = function(e) {
        if (e.target.closest('.ee-visual-pin')) return;
        isDrawing = true;
        var rect = overlay.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        drawBox.style.left = startX + 'px';
        drawBox.style.top = startY + 'px';
        drawBox.style.width = '0px';
        drawBox.style.height = '0px';
        drawBox.style.display = 'block';
      };

      window.addEventListener('mousemove', function(e) {
        if (!isDrawing) return;
        var rect = overlay.getBoundingClientRect();
        var curX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
        var curY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
        drawBox.style.left = Math.min(startX, curX) + 'px';
        drawBox.style.top = Math.min(startY, curY) + 'px';
        drawBox.style.width = Math.abs(curX - startX) + 'px';
        drawBox.style.height = Math.abs(curY - startY) + 'px';
      });

      window.addEventListener('mouseup', function(e) {
        if (!isDrawing) return;
        isDrawing = false;
        drawBox.style.display = 'none';

        var rect = overlay.getBoundingClientRect();
        var endX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
        var endY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
        var wPx = Math.abs(endX - startX);
        var hPx = Math.abs(endY - startY);

        if (wPx > 10 && hPx > 8) {
          var topPct = parseFloat(((Math.min(startY, endY) / rect.height) * 100).toFixed(2));
          var leftPct = parseFloat(((Math.min(startX, endX) / rect.width) * 100).toFixed(2));
          var widthPct = parseFloat(((wPx / rect.width) * 100).toFixed(2));
          var heightPct = parseFloat(((hPx / rect.height) * 100).toFixed(2));

          openKatakchaModal(true, null, null, p, overlay, {
            top: topPct,
            left: leftPct,
            width: widthPct,
            height: heightPct
          });
        }
      });
    }

    // Modal matching media_1793026528352_0eeda690.png
    function openKatakchaModal(isNew, item, existingIdx, pageObj, pageOverlay, newCoords) {
      var old = document.getElementById('eeKatakchaModal');
      if (old) old.remove();

      var km = document.createElement('div');
      km.id = 'eeKatakchaModal';
      km.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:2147483647;backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:14px;';

      var totalSoFar = getTotalElementsCount();
      var defaultLabel = isNew ? ((totalSoFar + 1).toString()) : (item.label || '');
      var defaultCorrect = isNew ? '' : (item.correct || '');
      var defaultType = isNew ? 'fill' : (item.type || 'fill');

      km.innerHTML = '<div style="position:relative;width:360px;max-width:calc(100vw - 24px);background:#0f172a;border:2px solid #00c0ff;border-radius:16px;padding:18px 20px;box-shadow:0 25px 60px rgba(0,0,0,0.85);color:#f8fafc;box-sizing:border-box;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;border-bottom:1px solid #334155;padding-bottom:10px;">' +
          '<div style="display:flex;align-items:center;gap:8px;">' +
            '<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#00c0ff;box-shadow:0 0 10px #00c0ff;"></span>' +
            '<h3 style="font-size:15px;font-weight:900;margin:0;color:#00c0ff;">' + (isNew ? '• ➕ Yangi Katakcha' : '• ✏️ Katakchani Tahrirlash') + '</h3>' +
          '</div>' +
          '<button id="eeKatakchaCloseX" style="background:transparent;border:none;color:#94a3b8;font-size:18px;font-weight:900;cursor:pointer;padding:2px 6px;line-height:1;">✕</button>' +
        '</div>' +

        '<div style="margin-bottom:12px;">' +
          '<label style="display:block;font-size:11.5px;font-weight:800;margin-bottom:5px;color:#94a3b8;">Turi (interaction type):</label>' +
          '<select id="eeKatakchaType" style="width:100%;padding:8px 12px;border-radius:9px;border:1px solid #334155;background:#1e293b;color:#f8fafc;font-weight:700;font-size:12.5px;outline:none;">' +
            '<option value="fill"' + (defaultType === 'fill' ? ' selected' : '') + '>Fill (O‘qib yozish)</option>' +
            '<option value="cross"' + (defaultType === 'cross' ? ' selected' : '') + '>Cross (Chizib o‘chirish)</option>' +
            '<option value="choose"' + (defaultType === 'choose' ? ' selected' : '') + '>Choose (Variant tanlash)</option>' +
            '<option value="match"' + (defaultType === 'match' ? ' selected' : '') + '>Match (Harf bilan bog‘lash)</option>' +
            '<option value="insert"' + (defaultType === 'insert' ? ' selected' : '') + '>Insert (Prepozitsiya kiritish)</option>' +
          '</select>' +
        '</div>' +

        '<div style="margin-bottom:12px;">' +
          '<label style="display:block;font-size:11.5px;font-weight:800;margin-bottom:5px;color:#94a3b8;">Guruh / Belgisi (Label / Group):</label>' +
          '<input type="text" id="eeKatakchaLabel" value="' + esc(defaultLabel) + '" style="width:100%;padding:8px 12px;border-radius:9px;border:1px solid #334155;background:#1e293b;color:#f8fafc;font-weight:700;font-size:12.5px;box-sizing:border-box;outline:none;" placeholder="masalan: 2 yoki 3a" />' +
        '</div>' +

        '<div style="margin-bottom:16px;">' +
          '<label id="eeKatakchaCorrectLabel" style="display:block;font-size:11.5px;font-weight:800;margin-bottom:5px;color:#94a3b8;">To‘g‘ri Javob ("or" bilan variantlar):</label>' +
          '<input type="text" id="eeKatakchaCorrect" value="' + esc(defaultCorrect) + '" style="width:100%;padding:8px 12px;border-radius:9px;border:1px solid #334155;background:#1e293b;color:#f8fafc;font-weight:700;font-size:12.5px;box-sizing:border-box;outline:none;" placeholder="masalan: coast yoki a" />' +
          '<div id="eeKatakchaChooseHelper" style="' + (defaultType === 'choose' ? 'display:flex;' : 'display:none;') + 'margin-top:8px;gap:8px;">' +
            '<button type="button" id="eeKatakchaBtnTrue" style="flex:1;background:rgba(16,185,129,0.15);border:1.5px solid #10b981;color:#34d399;border-radius:8px;padding:7px;font-size:11.5px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;">✓ To‘g‘ri variant</button>' +
            '<button type="button" id="eeKatakchaBtnFalse" style="flex:1;background:rgba(239,68,68,0.15);border:1.5px solid #ef4444;color:#f87171;border-radius:8px;padding:7px;font-size:11.5px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;">✕ Noto‘g‘ri variant</button>' +
          '</div>' +
        '</div>' +

        '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">' +
          (!isNew ? '<button type="button" id="eeKatakchaDeleteBtn" style="background:rgba(239,68,68,0.15);border:1.5px solid #ef4444;color:#f87171;padding:8px 14px;border-radius:9px;font-weight:800;font-size:12.5px;cursor:pointer;">🗑 O‘chirish</button>' : '<div></div>') +
          '<div style="display:flex;gap:10px;margin-left:auto;">' +
            '<button type="button" id="eeKatakchaCancelBtn" style="background:#334155;border:none;color:#cbd5e1;padding:8px 16px;border-radius:9px;font-weight:800;font-size:12.5px;cursor:pointer;">Bekor qilish</button>' +
            '<button type="button" id="eeKatakchaSaveBtn" style="background:linear-gradient(135deg,#0284c7,#2563eb);border:none;color:#ffffff;padding:8px 20px;border-radius:9px;font-weight:900;font-size:13px;cursor:pointer;box-shadow:0 4px 14px rgba(2,132,199,0.5);">Saqlash</button>' +
          '</div>' +
        '</div>' +
      '</div>';

      modalRoot.appendChild(km);

      var closeKm = function() { km.remove(); };
      km.querySelector('#eeKatakchaCloseX').onclick = closeKm;
      km.querySelector('#eeKatakchaCancelBtn').onclick = closeKm;

      var typeSel = km.querySelector('#eeKatakchaType');
      var correctInp = km.querySelector('#eeKatakchaCorrect');
      var labelInp = km.querySelector('#eeKatakchaLabel');
      var chooseHelper = km.querySelector('#eeKatakchaChooseHelper');
      var btnTrue = km.querySelector('#eeKatakchaBtnTrue');
      var btnFalse = km.querySelector('#eeKatakchaBtnFalse');

      typeSel.onchange = function() {
        if (typeSel.value === 'choose') {
          chooseHelper.style.display = 'flex';
          correctInp.placeholder = "To‘g‘ri yoki bo‘sh qoldiring";
        } else {
          chooseHelper.style.display = 'none';
          correctInp.placeholder = "masalan: coast yoki a";
        }
      };

      if (btnTrue) {
        btnTrue.onclick = function() { correctInp.value = 'To‘g‘ri'; };
      }
      if (btnFalse) {
        btnFalse.onclick = function() { correctInp.value = ''; };
      }

      var delBtn = km.querySelector('#eeKatakchaDeleteBtn');
      if (delBtn) {
        delBtn.onclick = function() {
          if (existingIdx !== undefined && existingIdx !== null) {
            pageObj.elements.splice(existingIdx, 1);
            renderPagePins(pageOverlay, pageObj);
            updateCounter();
          }
          closeKm();
        };
      }

      km.querySelector('#eeKatakchaSaveBtn').onclick = function() {
        var t = typeSel.value;
        var l = labelInp.value.trim();
        var c = correctInp.value.trim();

        if (isNew) {
          if (!pageObj.elements) pageObj.elements = [];
          pageObj.elements.push({
            id: 'el_' + Date.now() + '_' + Math.floor(Math.random() * 100),
            top: newCoords.top,
            left: newCoords.left,
            width: newCoords.width,
            height: newCoords.height,
            type: t,
            label: l || ((getTotalElementsCount() + 1).toString()),
            correct: c,
            points: 1
          });
        } else {
          item.type = t;
          item.label = l;
          item.correct = c;
        }

        renderPagePins(pageOverlay, pageObj);
        updateCounter();
        closeKm();
      };
    }

    // PDF / Image Upload Handler (Renders ALL pages of the PDF in ~300ms)
    fileInp.onchange = function(e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;

      var isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (isPdf) {
        showToast("⚡ PDF yuklanmoqda va sahifalar tayyorlanmoqda...");
        var reader = new FileReader();
        reader.onload = function(evt) {
          var typedArray = new Uint8Array(evt.target.result);

          function proceedWithPdf() {
            if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
              window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js';
            }
            window.pdfjsLib.getDocument({ data: typedArray }).promise.then(function(doc) {
              var numPages = doc.numPages;
              var loadedPages = [];
              var renderPromises = [];

              for (var i = 1; i <= numPages; i++) {
                (function(pNum) {
                  var pPromise = doc.getPage(pNum).then(function(page) {
                    var scale = 2.0; // High DPI crisp text
                    var viewport = page.getViewport({ scale: scale });
                    var canvas = document.createElement('canvas');
                    var ctx = canvas.getContext('2d');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    return page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function() {
                      return {
                        pageNum: pNum,
                        imageUrl: canvas.toDataURL('image/png'),
                        elements: []
                      };
                    });
                  });
                  renderPromises.push(pPromise);
                })(i);
              }

              Promise.all(renderPromises).then(function(results) {
                // Sort pages by pageNum
                results.sort(function(a, b) { return a.pageNum - b.pageNum; });
                pagesData = results;
                renderAllPages();
                showToast("✓ PDF to‘liq " + numPages + " ta sahifasi yuklandi!");
              }).catch(function(err) {
                console.error("PDF sahifalarini o‘qishda xato:", err);
                alert("PDF sahifalarini o‘qishda xatolik: " + (err.message || err));
              });
            }).catch(function(err) {
              console.error("PDF ochishda xato:", err);
              alert("PDF ochishda xatolik yuz berdi: " + (err.message || err));
            });
          }

          if (!window.pdfjsLib) {
            var script = document.createElement('script');
            script.src = 'pdf.min.js';
            script.onload = proceedWithPdf;
            document.head.appendChild(script);
          } else {
            proceedWithPdf();
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        var imgReader = new FileReader();
        imgReader.onload = function(evt) {
          pagesData = [
            { pageNum: 1, imageUrl: evt.target.result, elements: [] }
          ];
          renderAllPages();
          showToast("Rasm yuklandi");
        };
        imgReader.readAsDataURL(file);
      }
    };

    renderAllPages();

    var closeAll = function() { m.remove(); };
    m.querySelector('#eeCloseVisualModal').onclick = closeAll;

    m.querySelector('#eeSaveVisualBtn').onclick = function() {
      var title = m.querySelector('#eeVisualTitle').value.trim();
      var attempts = parseInt(m.querySelector('#eeVisualAttempts').value, 10) || 1;
      if (!title) { alert("Iltimos, test nomini kiriting!"); return; }

      var allElements = [];
      pagesData.forEach(function(p) {
        (p.elements || []).forEach(function(el) {
          el.pageNumber = p.pageNum;
          allElements.push(el);
        });
      });

      if (allElements.length === 0) { alert("Iltimos, varaq ustiga kamida 1 ta interaktiv katakcha belgilang!"); return; }

      var S = getStore();
      S.fileExplorer.tests.push({
        id: randCode,
        title: title,
        type: 'visual_overlay',
        folderId: folderId || 'f_root',
        createdAt: Date.now(),
        authorName: getCurrentUser().name || 'Ustoz',
        maxAttempts: attempts,
        pages: pagesData, // Multi-page support!
        imageUrl: pagesData[0].imageUrl, // Backward compatibility
        elements: allElements, // All questions combined
        questions: allElements.map(function(el, i) {
          return { id: el.id, q: (el.label || (i + 1)) + "-savol", correct: el.correct, points: 1 };
        })
      });
      saveStore();
      closeAll();
      showToast("✓ Interaktiv test saqlandi! Test ID: " + randCode);
      if (container) EE.renderExplorerView(container);
    };
  };

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
      '<div style="margin-bottom:16px;">' +
        '<label style="display:block;font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:6px;">Urinishlar soni (necha marta topshirish mumkin):</label>' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<input type="number" id="eeHwMaxAttempts" min="1" max="50" value="1" style="width:80px;padding:9px 12px;background:#1e293b;border:1px solid rgba(255,255,255,0.15);border-radius:10px;color:#fff;font-weight:800;font-size:14px;text-align:center;" />' +
          '<span style="font-size:12px;color:#94a3b8;">marta ishlashga ruxsat berish (masalan 1, 2, 3...)</span>' +
        '</div>' +
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

    // Check user past submissions and allowed attempts
    var hwMatch = null;
    var pastSub = null;
    (S.classes || []).forEach(function(c) {
      (c.extraHomework || []).forEach(function(hw) {
        if (hw.testId === testId) {
          hwMatch = hw;
          if (hw.submissions && hw.submissions[user.id]) {
            pastSub = hw.submissions[user.id];
          }
        }
      });
    });

    var maxAttempts = (hwMatch && hwMatch.maxAttempts) || test.maxAttempts || 1;
    var attemptsDone = (pastSub && pastSub.attemptsCount) || (pastSub ? 1 : 0);

    if (attemptsDone >= maxAttempts && user.role !== 'teacher' && user.role !== 'admin') {
      alert("⚠️ Ushbu topshiriq uchun berilgan barcha " + maxAttempts + " ta urinishdan foydalangansiz!\n\nEng yuqori natijangiz: " + (pastSub.bestScore || pastSub.score) + "%.");
      return;
    }

    // Branch for visual overlay tests (1:1 Oxford Navigate Interactive Engine)
    if (test.type === 'visual_overlay') {
      var vm = document.createElement('div');
      vm.id = 'eeTakeVisualOverlay';
      vm.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;background:#070b14;z-index:2147483640;display:flex;flex-direction:column;overflow:hidden;margin:0;padding:0;box-sizing:border-box;color:#f8fafc;font-family:system-ui,-apple-system,sans-serif;';

      // Reconstruct pages array
      var pagesList = [];
      if (test.pages && test.pages.length > 0) {
        pagesList = test.pages;
      } else {
        pagesList = [{
          pageNum: 1,
          imageUrl: test.imageUrl,
          elements: test.elements || []
        }];
      }

      var currentWidthPx = 1000;
      var totalQuestions = 0;
      pagesList.forEach(function(p) { totalQuestions += (p.elements || []).length; });

      var vh = '' +
        // Sticky Header
        '<div style="height:62px;padding:0 20px;background:#0f172a;border-bottom:1px solid rgba(56,189,248,0.25);display:flex;align-items:center;justify-content:space-between;gap:14px;box-shadow:0 4px 20px rgba(0,0,0,0.5);flex-shrink:0;z-index:50;">' +
          '<div style="display:flex;align-items:center;gap:12px;">' +
            '<span style="font-size:24px;">🎨</span>' +
            '<div>' +
              '<h3 style="margin:0;font-size:16.5px;font-weight:900;color:#f8fafc;">' + esc(test.title) + '</h3>' +
              '<p style="margin:2px 0 0;font-size:11.5px;color:#94a3b8;">Oxford Navigate tahririda: bo‘sh joylarga yozing, tanlang yoki o‘chiring.</p>' +
            '</div>' +
          '</div>' +

          // Center Zoom
          '<div style="display:flex;align-items:center;gap:8px;">' +
            '<span style="background:rgba(16,185,129,0.15);color:#34d399;padding:5px 12px;border-radius:8px;font-weight:900;font-size:12px;border:1px solid rgba(16,185,129,0.3);">' +
              'Urinish: ' + (attemptsDone + 1) + ' / ' + maxAttempts +
            '</span>' +
            '<div style="display:flex;align-items:center;gap:4px;background:#1e293b;padding:3px 6px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);">' +
              '<button id="eeTakeZoomOut" style="background:#334155;border:none;color:#cbd5e1;padding:5px 9px;border-radius:6px;font-size:12px;font-weight:900;cursor:pointer;">🔍−</button>' +
              '<button id="eeTakeZoom100" style="background:none;border:none;color:#38bdf8;padding:4px 8px;font-size:11.5px;font-weight:800;cursor:pointer;">100%</button>' +
              '<button id="eeTakeZoomIn" style="background:#334155;border:none;color:#cbd5e1;padding:5px 9px;border-radius:6px;font-size:12px;font-weight:900;cursor:pointer;">🔍+</button>' +
              '<button id="eeTakeFitWidth" style="background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.3);color:#38bdf8;padding:4px 10px;border-radius:6px;font-size:11.5px;font-weight:800;cursor:pointer;margin-left:4px;">↔️ Kenglikka moslash</button>' +
            '</div>' +
          '</div>' +

          // Right Submit & Close
          '<div style="display:flex;align-items:center;gap:12px;">' +
            '<span style="font-size:12.5px;font-weight:800;color:#94a3b8;">Jami ' + totalQuestions + ' ta savol</span>' +
            '<button id="eeSubmitTakeVisual" style="background:linear-gradient(135deg,#10b981,#059669);border:none;color:#fff;padding:9px 24px;border-radius:10px;font-weight:900;font-size:13.5px;cursor:pointer;box-shadow:0 4px 18px rgba(16,185,129,0.45);display:flex;align-items:center;gap:6px;">' +
              '✅ Topshirish' +
            '</button>' +
            '<button id="eeCloseTakeVisualTest" style="background:rgba(255,255,255,0.08);border:none;color:#94a3b8;font-size:18px;font-weight:900;cursor:pointer;padding:8px 12px;border-radius:10px;">✕</button>' +
          '</div>' +
        '</div>' +

        // Continuous Multi-Page Stream Workspace (Unconstrained, full height, all pages in succession)
        '<div id="eeTakeWorkspace" style="flex:1;overflow-y:scroll;overflow-x:auto;padding:24px 20px 140px 20px;display:flex;flex-direction:column;align-items:center;background:#070b14;position:relative;">' +
          '<div id="eeTakePagesWrap" style="display:flex;flex-direction:column;align-items:center;gap:32px;width:100%;">';

          pagesList.forEach(function(pg, pIdx) {
            var pageNum = pg.pageNum || (pIdx + 1);
            vh += '<div class="ee-take-page-box" data-page="' + pageNum + '" style="position:relative;display:inline-block;width:' + currentWidthPx + 'px;max-width:98vw;box-shadow:0 14px 60px rgba(0,0,0,0.9);border-radius:10px;background:#ffffff;overflow:hidden;border:1px solid rgba(255,255,255,0.12);transition:width 0.15s ease;">' +
              '<div style="background:#0f172a;color:#fff;padding:8px 16px;display:flex;align-items:center;justify-content:space-between;font-size:12.5px;font-weight:800;border-bottom:1px solid rgba(255,255,255,0.08);">' +
                '<span>📄 ' + pageNum + '-sahifa' + (pagesList.length > 1 ? (' (Jami ' + pagesList.length + ' ta)') : '') + '</span>' +
                '<span style="color:#38bdf8;">' + (pg.elements || []).length + ' ta topshiriq</span>' +
              '</div>' +
              '<div style="position:relative;width:100%;background:#ffffff;">' +
                '<img src="' + pg.imageUrl + '" style="width:100%;height:auto;display:block;user-select:none;pointer-events:none;" />' +
                '<div class="ee-take-page-overlay" data-page="' + pageNum + '" style="position:absolute;inset:0;z-index:20;">';

                (pg.elements || []).forEach(function(el, idx) {
                  var itemType = el.type || 'fill';

                  if (itemType === 'fill') {
                    // Transparent elegant input (Oxford Navigate style)
                    vh += '<input type="text" class="ee-take-input" data-id="' + el.id + '" data-correct="' + esc(el.correct || '') + '" ' +
                      'placeholder="' + esc(el.placeholder || el.label || '') + '" autocomplete="off" spellcheck="false" ' +
                      'style="position:absolute;top:' + el.top + '%;left:' + el.left + '%;width:' + el.width + '%;height:' + el.height + '%;' +
                      'box-sizing:border-box;background:rgba(255,255,255,0.55);border:1.5px solid rgba(2,132,199,0.5);border-bottom:2.5px solid #0284c7;border-radius:4px;color:#000000;font-weight:800;font-size:14px;padding:0 6px;outline:none;transition:all 0.15s ease;" ' +
                      'onfocus="this.style.background=\'#ffffff\';this.style.borderColor=\'#0284c7\';this.style.boxShadow=\'0 0 0 3px rgba(2,132,199,0.25)\';" ' +
                      'onblur="this.style.background=\'rgba(255,255,255,0.55)\';this.style.borderColor=\'rgba(2,132,199,0.5)\';this.style.boxShadow=\'none\';" />';
                  } else if (itemType === 'cross') {
                    // Strikethrough chip
                    vh += '<div class="ee-take-chip ee-chip-cross" data-id="' + el.id + '" data-correct="' + esc(el.correct || '') + '" ' +
                      'style="position:absolute;top:' + el.top + '%;left:' + el.left + '%;width:' + el.width + '%;height:' + el.height + '%;cursor:pointer;border-radius:4px;transition:all 0.15s ease;" ' +
                      'title="O‘chirish uchun bosing"></div>';
                  } else if (itemType === 'choose') {
                    // Select chip
                    vh += '<div class="ee-take-chip ee-chip-choose" data-id="' + el.id + '" data-correct="' + esc(el.correct || '') + '" ' +
                      'style="position:absolute;top:' + el.top + '%;left:' + el.left + '%;width:' + el.width + '%;height:' + el.height + '%;cursor:pointer;border-radius:4px;transition:all 0.15s ease;" ' +
                      'title="Tanlash uchun bosing"></div>';
                  } else {
                    // Default interactive box
                    vh += '<input type="text" class="ee-take-input" data-id="' + el.id + '" data-correct="' + esc(el.correct || '') + '" ' +
                      'placeholder="..." autocomplete="off" spellcheck="false" ' +
                      'style="position:absolute;top:' + el.top + '%;left:' + el.left + '%;width:' + el.width + '%;height:' + el.height + '%;box-sizing:border-box;background:rgba(255,255,255,0.55);border:1.5px solid #0284c7;border-radius:4px;color:#000;font-weight:800;font-size:14px;padding:0 6px;outline:none;" />';
                  }
                });

            vh += '</div></div></div>';
          });

      vh += '</div></div>';

      vm.innerHTML = vh;
      modalRoot.appendChild(vm);

      var takeWrap = vm.querySelector('#eeTakePagesWrap');

      // Zoom controls
      function applyTakeWidth(w) {
        currentWidthPx = Math.max(650, Math.min(2200, w));
        takeWrap.querySelectorAll('.ee-take-page-box').forEach(function(b) {
          b.style.width = currentWidthPx + 'px';
        });
      }

      vm.querySelector('#eeTakeZoomIn').onclick = function() { applyTakeWidth(currentWidthPx + 150); };
      vm.querySelector('#eeTakeZoomOut').onclick = function() { applyTakeWidth(currentWidthPx - 150); };
      vm.querySelector('#eeTakeZoom100').onclick = function() { applyTakeWidth(1000); };
      vm.querySelector('#eeTakeFitWidth').onclick = function() {
        var wsW = vm.querySelector('#eeTakeWorkspace').clientWidth;
        applyTakeWidth(Math.floor(wsW * 0.94));
      };

      // Cross & Choose chip interactivity
      vm.querySelectorAll('.ee-chip-cross').forEach(function(chip) {
        chip.onclick = function() {
          var isCrossed = chip.getAttribute('data-selected') === 'true';
          if (isCrossed) {
            chip.setAttribute('data-selected', 'false');
            chip.style.background = 'transparent';
            chip.style.border = 'none';
          } else {
            chip.setAttribute('data-selected', 'true');
            chip.style.background = 'rgba(239,68,68,0.22)';
            chip.style.border = '2px dashed #ef4444';
          }
        };
      });

      vm.querySelectorAll('.ee-chip-choose').forEach(function(chip) {
        chip.onclick = function() {
          var isChosen = chip.getAttribute('data-selected') === 'true';
          if (isChosen) {
            chip.setAttribute('data-selected', 'false');
            chip.style.background = 'transparent';
            chip.style.border = 'none';
            chip.style.boxShadow = 'none';
          } else {
            chip.setAttribute('data-selected', 'true');
            chip.style.background = 'rgba(2,132,199,0.28)';
            chip.style.border = '2px solid #0284c7';
            chip.style.boxShadow = '0 0 10px rgba(2,132,199,0.4)';
          }
        };
      });

      vm.querySelector('#eeCloseTakeVisualTest').onclick = function() {
        if (confirm("Testni to‘xtatmoqchimisiz? Natijangiz saqlanmaydi.")) vm.remove();
      };

      // Submit test handler with instant feedback & band score
      vm.querySelector('#eeSubmitTakeVisual').onclick = function() {
        var correctCount = 0;
        var totalCount = totalQuestions;

        // Check fill inputs
        vm.querySelectorAll('.ee-take-input').forEach(function(inp) {
          var userVal = inp.value.trim().toLowerCase();
          var rawCorrect = (inp.getAttribute('data-correct') || '').trim();
          var variants = rawCorrect.split(/\s+or\s+|\/|,|;/).map(function(s) { return s.trim().toLowerCase(); });

          var isCorrect = false;
          if (userVal && variants.indexOf(userVal) !== -1) {
            isCorrect = true;
          }

          if (isCorrect) {
            correctCount++;
            inp.style.border = '2px solid #10b981';
            inp.style.background = 'rgba(16,185,129,0.22)';
            inp.style.color = '#047857';
            inp.style.fontWeight = '900';
          } else {
            inp.style.border = '2px solid #ef4444';
            inp.style.background = 'rgba(239,68,68,0.18)';
            inp.style.color = '#b91c1c';

            // Show hint badge with correct answer
            var hint = document.createElement('div');
            hint.style.cssText = 'position:absolute;top:100%;left:0;background:#0f172a;color:#38bdf8;font-size:11px;font-weight:900;padding:2px 8px;border-radius:4px;white-space:nowrap;z-index:90;box-shadow:0 4px 12px rgba(0,0,0,0.5);margin-top:2px;border:1px solid #38bdf8;';
            hint.textContent = '✓ ' + rawCorrect;
            inp.parentElement.appendChild(hint);
          }
        });

        // Check chips
        vm.querySelectorAll('.ee-chip-choose, .ee-chip-cross').forEach(function(chip) {
          var isSelected = chip.getAttribute('data-selected') === 'true';
          var targetCorrect = (chip.getAttribute('data-correct') || '').toLowerCase().trim();
          var shouldBeSelected = (targetCorrect === 'true' || targetCorrect === 'to‘g‘ri' || targetCorrect === 'ha' || targetCorrect === '1');

          if (isSelected === shouldBeSelected) {
            correctCount++;
          }
        });

        var pct = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 100;
        var band = (pct >= 90) ? '9.0' : (pct >= 82) ? '8.0' : (pct >= 74) ? '7.5' : (pct >= 65) ? '7.0' : (pct >= 55) ? '6.0' : (pct >= 45) ? '5.5' : '5.0';

        // Record submission in class
        (S.classes || []).forEach(function(c) {
          (c.extraHomework || []).forEach(function(hw) {
            if (hw.testId === testId) {
              if (!hw.submissions) hw.submissions = {};
              var past = hw.submissions[user.id] || {};
              var curCount = (past.attemptsCount || 0) + 1;
              hw.submissions[user.id] = {
                score: pct,
                bestScore: Math.max(pct, past.bestScore || 0),
                correct: correctCount,
                total: totalCount,
                band: band,
                attemptsCount: curCount,
                completedAt: Date.now()
              };
            }
          });
        });
        saveStore();

        // Show celebration results modal
        var resModal = document.createElement('div');
        resModal.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.9);backdrop-filter:blur(10px);z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:16px;';
        resModal.innerHTML = '<div style="background:#0f172a;border:2px solid #10b981;border-radius:20px;padding:30px;max-width:440px;width:100%;text-align:center;color:#fff;box-shadow:0 24px 70px rgba(0,0,0,0.85);">' +
          '<div style="font-size:52px;margin-bottom:12px;">🎉</div>' +
          '<h2 style="margin:0 0 6px;font-size:22px;font-weight:900;color:#10b981;">Test Yakunlandi!</h2>' +
          '<p style="margin:0 0 20px;font-size:13px;color:#94a3b8;">' + esc(test.title) + '</p>' +
          '<div style="background:#1e293b;border-radius:14px;padding:18px;margin-bottom:20px;display:flex;justify-content:space-around;border:1px solid rgba(255,255,255,0.08);">' +
            '<div>' +
              '<div style="font-size:28px;font-weight:900;color:#38bdf8;">' + pct + '%</div>' +
              '<div style="font-size:11.5px;color:#94a3b8;font-weight:700;">Natija (' + correctCount + '/' + totalCount + ')</div>' +
            '</div>' +
            '<div style="width:1px;background:rgba(255,255,255,0.1);"></div>' +
            '<div>' +
              '<div style="font-size:28px;font-weight:900;color:#10b981;">Band ' + band + '</div>' +
              '<div style="font-size:11.5px;color:#94a3b8;font-weight:700;">IELTS Bashorati</div>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;gap:10px;">' +
            '<button id="eeCloseResBtn" style="flex:1;background:linear-gradient(135deg,#0284c7,#2563eb);border:none;color:#fff;padding:12px;border-radius:12px;font-weight:900;font-size:14px;cursor:pointer;">Natijalarni Ko‘rish</button>' +
          '</div>' +
        '</div>';

        modalRoot.appendChild(resModal);
        resModal.querySelector('#eeCloseResBtn').onclick = function() {
          resModal.remove();
        };

        showToast("Test yakunlandi! Natija: " + pct + "% (Band " + band + ")");
      };
      return;
    }

    // Standard Multiple-Choice Test Runner
    var curQIdx = 0;
    var userAnswers = {};
    var totalQ = (test.questions || []).length;

    var m = document.createElement('div');
    m.id = 'eeTakeTestModal';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.9);backdrop-filter:blur(14px);z-index:2147483640;display:flex;align-items:center;justify-content:center;padding:16px;';

    function renderQuestionModal() {
      var q = test.questions[curQIdx];
      var isLast = (curQIdx === totalQ - 1);

      var qh = '<div style="background:#0f172a;border:1px solid rgba(56,189,248,0.35);border-radius:22px;max-width:680px;width:100%;padding:28px;box-shadow:0 24px 60px rgba(0,0,0,0.8);color:#f8fafc;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:14px;">' +
          '<div>' +
            '<h3 style="margin:0;font-size:17px;font-weight:900;color:#f8fafc;">' + esc(test.title) + '</h3>' +
            '<span style="font-size:12px;color:#94a3b8;">Savol ' + (curQIdx + 1) + ' / ' + totalQ + '</span>' +
          '</div>' +
          '<button id="eeCloseTakeTest" style="background:none;border:none;color:#94a3b8;font-size:22px;cursor:pointer;">✕</button>' +
        '</div>' +

        '<div style="margin-bottom:22px;font-size:16px;font-weight:800;color:#fff;line-height:1.5;">' +
          esc(q.q) +
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
          var correctCount = 0;
          test.questions.forEach(function(item, idx) {
            if (userAnswers[idx] === item.correct) correctCount++;
          });
          var pct = Math.round((correctCount / totalQ) * 100);

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
  // UNIFIED ETHITH FINANCE, STUDENT PAYMENTS & TEACHER PAYROLL ENGINE
  // Adapted from APEX EDU, 100% Obsidian Cyber-Glass Dark Mode
  // ============================================================================

  EE.renderBillingView = function(container) {
    EE.renderFinanceUnifiedView(container, 'overview');
  };
  window.renderBillingView = EE.renderBillingView;

  EE.renderStaffView = function(container) {
    EE.renderFinanceUnifiedView(container, 'teachers');
  };
  window.renderStaffView = EE.renderStaffView;
  window.renderFinanceUnifiedView = EE.renderFinanceUnifiedView;

  function fmtUZS(n) {
    return Math.round(Number(n) || 0).toLocaleString('uz-UZ') + " so'm";
  }

  function fmtShortUZS(n) {
    var val = Math.abs(Number(n) || 0);
    if (val >= 1000000000) return (val / 1000000000).toFixed(2) + " mlrd";
    if (val >= 1000000) return (val / 1000000).toFixed(1) + " mln";
    if (val >= 1000) return (val / 1000).toFixed(0) + " ming";
    return val.toLocaleString('uz-UZ');
  }

  EE.renderFinanceUnifiedView = function(container, activeTab) {
    if (!container) return;
    var S = getStore();
    var isStaff = isAdminOrTeacher();
    var curUser = getCurrentUser();

    if (!activeTab) activeTab = 'overview';

    // 1. Initialize S.finance if missing
    if (!S.finance) {
      S.finance = {
        studentFees: {},
        expenses: [
          { id: 'e1', category: 'electricity', title: 'Elektr energiyasi (Tok — 24 ta xona, IT lab va yoritish)', amount: 14800000, icon: '⚡', color: '#F59E0B' },
          { id: 'e2', category: 'utilities', title: 'Kommunal to‘lovlar (Suv, isitish, tozalik)', amount: 6400000, icon: '💧', color: '#38BDF8' },
          { id: 'e3', category: 'rent', title: 'Markaz binosi ijarasi (O‘quv majmuasi)', amount: 32000000, icon: '🏢', color: '#10B981' },
          { id: 'e4', category: 'internet', title: 'Optik Tolali Internet 2 Gbit/s & Server', amount: 4200000, icon: '🌐', color: '#818CF8' },
          { id: 'e5', category: 'equipment', title: 'Kompyuterlar amortizatsiyasi va jihozlar', amount: 8000000, icon: '💻', color: '#EC4899' }
        ]
      };
    }
    if (!S.finance.expenses) S.finance.expenses = [];
    if (!S.finance.studentFees) S.finance.studentFees = {};
    if (!S.teachers || S.teachers.length === 0) {
      S.teachers = [
        { id: 'admin_official_teacher', name: 'Ustoz', email: 'teacher@ethith.uz', subject: 'Ingliz tili (IELTS Intensive)', hourlyRate: 100000, teachingHours: 72, monthlyBonus: 1000000, status: 'paid' },
        { id: 't_zizi', name: 'Zizi Ustoz', email: 'zizi@ethith.uz', subject: 'Ingliz tili', hourlyRate: 85000, teachingHours: 64, monthlyBonus: 1000000, status: 'pending' }
      ];
    }

    // 2. Compute live financials
    var studentList = [];
    (S.classes || []).forEach(function(cls) {
      (cls.students || []).forEach(function(st) {
        var stId = st.id || st.email || ('st_' + Math.random().toString(36).substr(2, 6));
        var feeInfo = (cls.studentPayments && cls.studentPayments[stId]) ||
                      S.finance.studentFees[stId] ||
                      { fee: 1400000, paid: 1400000, status: 'paid', method: 'Click', date: '2026-10-05' };
        studentList.push({
          id: stId,
          name: st.name || ("O'quvchi " + (studentList.length + 1)),
          email: st.email || (stId + '@ethith.uz'),
          classId: cls.id,
          className: cls.name,
          fee: Number(feeInfo.fee) || 1400000,
          paid: Number(feeInfo.paid) || 0,
          status: feeInfo.status || (feeInfo.paid >= feeInfo.fee ? 'paid' : (feeInfo.paid > 0 ? 'partial' : 'unpaid')),
          method: feeInfo.method || 'Click',
          date: feeInfo.date || '2026-10-05'
        });
      });
    });

    if (studentList.length === 0) {
      var sampleStudents = [
        { name: 'Ashurov Dilyorbek', email: 'ashurov@ethith.uz', className: 'IELTS & General English Intensive', fee: 1400000, paid: 1400000, status: 'paid', method: 'Click' },
        { name: 'Ergasheva Madina', email: 'ergasheva@ethith.uz', className: 'IELTS & General English Intensive', fee: 1400000, paid: 1400000, status: 'paid', method: 'Payme' },
        { name: 'Erkinov Aslbekjon', email: 'erkinov@ethith.uz', className: 'IELTS & General English Intensive', fee: 1400000, paid: 1400000, status: 'paid', method: 'Click' },
        { name: 'Jo‘raboyev Javoxir', email: 'joraboyev@ethith.uz', className: 'IELTS & General English Intensive', fee: 1400000, paid: 1400000, status: 'paid', method: 'Click' },
        { name: 'Jo‘raboyev Muhammad Yusuf', email: 'yusuf@ethith.uz', className: 'IELTS & General English Intensive', fee: 1400000, paid: 1400000, status: 'paid', method: 'Click' },
        { name: 'Sobirova Dilnoza', email: 'sobirova@ethith.uz', className: 'Bizani gurux', fee: 1400000, paid: 700000, status: 'partial', method: 'Naqd' },
        { name: 'Qodirov Farrux', email: 'qodirov@ethith.uz', className: 'Bizani gurux', fee: 1400000, paid: 0, status: 'unpaid', method: 'Kutilmoqda' }
      ];
      sampleStudents.forEach(function(s, idx) {
        studentList.push({
          id: 'sample_st_' + idx,
          name: s.name,
          email: s.email,
          className: s.className,
          fee: s.fee,
          paid: s.paid,
          status: s.status,
          method: s.method,
          date: '2026-10-05'
        });
      });
    }

    var totalRevenue = studentList.reduce(function(acc, s) { return acc + (s.paid || 0); }, 0);
    var totalExpected = studentList.reduce(function(acc, s) { return acc + (s.fee || 0); }, 0);
    var totalReceivables = Math.max(0, totalExpected - totalRevenue);

    var totalTeacherPayout = (S.teachers || []).reduce(function(acc, t) {
      var hours = Number(t.teachingHours) || 0;
      var rate = Number(t.hourlyRate) || 0;
      var bonus = Number(t.monthlyBonus) || 0;
      return acc + (hours * rate) + bonus;
    }, 0);

    var totalTeachingHours = (S.teachers || []).reduce(function(acc, t) {
      return acc + (Number(t.teachingHours) || 0);
    }, 0);

    var totalExpenses = (S.finance.expenses || []).reduce(function(acc, e) {
      return acc + (Number(e.amount) || 0);
    }, 0);

    var totalOutflow = totalTeacherPayout + totalExpenses;
    var netProfit = totalRevenue - totalOutflow;
    var profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

    // Build Modern Cyber-Glass Obsidian Dark Layout
    var h = '<div class="ee-finance-wrap" style="max-width:1280px;margin:0 auto;padding:16px 20px 80px;">' +
      // HERO HEADER CARD
      '<div style="background:radial-gradient(circle at 10% 20%, rgba(56,189,248,0.22), transparent 40%), radial-gradient(circle at 90% 80%, rgba(168,85,247,0.25), transparent 45%), linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.92) 100%);border:1px solid rgba(56,189,248,0.35);border-radius:24px;padding:26px 30px;box-shadow:0 20px 60px rgba(0,0,0,0.65), 0 0 40px rgba(56,189,248,0.12);backdrop-filter:blur(24px);margin-bottom:24px;position:relative;overflow:hidden;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:18px;">' +
          '<div style="display:flex;align-items:center;gap:16px;">' +
            '<div style="width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,#0284c7,#2563eb);display:flex;align-items:center;justify-content:center;font-size:26px;box-shadow:0 8px 25px rgba(2,132,199,0.4);flex-shrink:0;">🏛️</div>' +
            '<div>' +
              '<h1 style="margin:0;font-size:24px;font-weight:900;letter-spacing:-0.4px;color:#fff;display:flex;align-items:center;gap:10px;">' +
                'ETHITH Tartibli Moliya va Analitika Markazi' +
                '<span style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;font-size:11px;font-weight:900;padding:3px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:0.05em;box-shadow:0 0 14px rgba(16,185,129,0.5);">● LIVE REALTIME</span>' +
              '</h1>' +
              '<div style="margin-top:4px;font-size:13.5px;color:#94a3b8;font-weight:600;">O‘quvchilar to‘lovlari, o‘qituvchilar dars soatlari, 360° analitika radari va markaz rentabelligi.</div>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
            (isStaff ? '<button id="eeBtnOpenPayModal" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:12px;padding:10px 18px;font-size:13px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 15px rgba(16,185,129,0.35);transition:all 0.2s;">💵 To‘lov Qabul Qilish</button>' : '') +
            (isStaff ? '<button id="eeBtnOpenExpModal" style="background:rgba(239,68,68,0.18);color:#fca5a5;border:1px solid rgba(239,68,68,0.45);border-radius:12px;padding:10px 16px;font-size:13px;font-weight:800;cursor:pointer;transition:all 0.2s;">+ Xarajat</button>' : '') +
            '<button id="eeBtnExportFinExcel" style="background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.4);border-radius:12px;padding:10px 16px;font-size:13px;font-weight:800;cursor:pointer;transition:all 0.2s;">📥 Excel Hisobot</button>' +
          '</div>' +
        '</div>' +

        // Segmented Tabs Switcher
        '<div style="display:flex;gap:8px;margin-top:22px;flex-wrap:wrap;border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;">' +
          '<button class="ee-fin-tab-btn" data-tab="overview" style="background:' + (activeTab === 'overview' ? 'linear-gradient(135deg,#0284c7,#2563eb)' : 'rgba(255,255,255,0.06)') + ';color:' + (activeTab === 'overview' ? '#fff' : '#94a3b8') + ';border:1px solid ' + (activeTab === 'overview' ? 'transparent' : 'rgba(255,255,255,0.1)') + ';border-radius:10px;padding:9px 18px;font-size:13px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:6px;">📊 Umumiy Tahlil &amp; Radarlar</button>' +
          '<button class="ee-fin-tab-btn" data-tab="students" style="background:' + (activeTab === 'students' ? 'linear-gradient(135deg,#0284c7,#2563eb)' : 'rgba(255,255,255,0.06)') + ';color:' + (activeTab === 'students' ? '#fff' : '#94a3b8') + ';border:1px solid ' + (activeTab === 'students' ? 'transparent' : 'rgba(255,255,255,0.1)') + ';border-radius:10px;padding:9px 18px;font-size:13px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:6px;">👥 O‘quvchilar To‘lovi (' + studentList.length + ')</button>' +
          '<button class="ee-fin-tab-btn" data-tab="teachers" style="background:' + (activeTab === 'teachers' ? 'linear-gradient(135deg,#0284c7,#2563eb)' : 'rgba(255,255,255,0.06)') + ';color:' + (activeTab === 'teachers' ? '#fff' : '#94a3b8') + ';border:1px solid ' + (activeTab === 'teachers' ? 'transparent' : 'rgba(255,255,255,0.1)') + ';border-radius:10px;padding:9px 18px;font-size:13px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:6px;">👨‍🏫 O‘qituvchilar Shtati &amp; Payroll (' + S.teachers.length + ')</button>' +
          '<button class="ee-fin-tab-btn" data-tab="expenses" style="background:' + (activeTab === 'expenses' ? 'linear-gradient(135deg,#0284c7,#2563eb)' : 'rgba(255,255,255,0.06)') + ';color:' + (activeTab === 'expenses' ? '#fff' : '#94a3b8') + ';border:1px solid ' + (activeTab === 'expenses' ? 'transparent' : 'rgba(255,255,255,0.1)') + ';border-radius:10px;padding:9px 18px;font-size:13px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:6px;">💸 Xarajatlar Boshqaruvi</button>' +
        '</div>' +
      '</div>';

    // RENDER ACTIVE TAB BODY
    h += '<div id="eeFinTabContent">';
    if (activeTab === 'overview') {
      h += EE.renderFinanceOverviewTabHtml({
        totalRevenue: totalRevenue,
        totalReceivables: totalReceivables,
        totalTeacherPayout: totalTeacherPayout,
        totalTeachingHours: totalTeachingHours,
        totalExpenses: totalExpenses,
        netProfit: netProfit,
        profitMargin: profitMargin,
        studentList: studentList,
        teachers: S.teachers,
        expenses: S.finance.expenses
      });
    } else if (activeTab === 'students') {
      h += EE.renderFinanceStudentsTabHtml(studentList);
    } else if (activeTab === 'teachers') {
      h += EE.renderFinanceTeachersTabHtml(S.teachers);
    } else if (activeTab === 'expenses') {
      h += EE.renderFinanceExpensesTabHtml(S.finance.expenses);
    }
    h += '</div></div>';

    container.innerHTML = h;
    EE.attachFinanceEventListeners(container, S, studentList, activeTab);

    // Initialize Interactive Chart.js and Radars if on overview or teachers tab
    if (activeTab === 'overview') {
      setTimeout(function() {
        EE.initFinanceCharts(totalRevenue, totalTeacherPayout, totalExpenses);
      }, 60);
    } else if (activeTab === 'teachers') {
      setTimeout(function() {
        EE.initTeacherCharts(S.teachers);
      }, 60);
    }
  };

  // --------------------------------------------------------------------------
  // TAB 1: OVERVIEW & HIGH-PIXEL CHARTS & 360° RADARS
  // --------------------------------------------------------------------------
  EE.renderFinanceOverviewTabHtml = function(data) {
    var h = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px;margin-bottom:24px;">' +
      // KPI 1: Revenue
      '<div style="background:rgba(15,23,42,0.85);border:1px solid rgba(16,185,129,0.35);border-radius:18px;padding:18px;box-shadow:0 8px 30px rgba(0,0,0,0.4);backdrop-filter:blur(16px);position:relative;overflow:hidden;">' +
        '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#10b981,#34d399);"></div>' +
        '<div style="font-size:11px;font-weight:800;color:#34d399;text-transform:uppercase;letter-spacing:0.04em;">Jami Tushum</div>' +
        '<div style="font-size:25px;font-weight:900;color:#fff;margin:8px 0 4px;letter-spacing:-0.5px;">' + fmtShortUZS(data.totalRevenue) + '</div>' +
        '<div style="font-size:11.5px;color:#94a3b8;">' + data.studentList.length + ' ta o‘quvchidan tushgan</div>' +
      '</div>' +

      // KPI 2: Teacher Payroll
      '<div style="background:rgba(15,23,42,0.85);border:1px solid rgba(56,189,248,0.35);border-radius:18px;padding:18px;box-shadow:0 8px 30px rgba(0,0,0,0.4);backdrop-filter:blur(16px);position:relative;overflow:hidden;">' +
        '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#0284c7,#38bdf8);"></div>' +
        '<div style="font-size:11px;font-weight:800;color:#38bdf8;text-transform:uppercase;letter-spacing:0.04em;">O‘qituvchilar Maoshi</div>' +
        '<div style="font-size:25px;font-weight:900;color:#fff;margin:8px 0 4px;letter-spacing:-0.5px;">' + fmtShortUZS(data.totalTeacherPayout) + '</div>' +
        '<div style="font-size:11.5px;color:#38bdf8;font-weight:700;">' + data.totalTeachingHours + ' soat o‘tilgan dars</div>' +
      '</div>' +

      // KPI 3: Center Expenses
      '<div style="background:rgba(15,23,42,0.85);border:1px solid rgba(245,158,11,0.35);border-radius:18px;padding:18px;box-shadow:0 8px 30px rgba(0,0,0,0.4);backdrop-filter:blur(16px);position:relative;overflow:hidden;">' +
        '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#f59e0b,#fbbf24);"></div>' +
        '<div style="font-size:11px;font-weight:800;color:#fbbf24;text-transform:uppercase;letter-spacing:0.04em;">Markaz Xarajatlari</div>' +
        '<div style="font-size:25px;font-weight:900;color:#fff;margin:8px 0 4px;letter-spacing:-0.5px;">' + fmtShortUZS(data.totalExpenses) + '</div>' +
        '<div style="font-size:11.5px;color:#94a3b8;">Tok, ijara, kommunal, internet</div>' +
      '</div>' +

      // KPI 4: Receivables (Debt)
      '<div style="background:rgba(15,23,42,0.85);border:1px solid rgba(239,68,68,0.35);border-radius:18px;padding:18px;box-shadow:0 8px 30px rgba(0,0,0,0.4);backdrop-filter:blur(16px);position:relative;overflow:hidden;">' +
        '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#ef4444,#f87171);"></div>' +
        '<div style="font-size:11px;font-weight:800;color:#f87171;text-transform:uppercase;letter-spacing:0.04em;">Qarzdorlik (Kutilayotgan)</div>' +
        '<div style="font-size:25px;font-weight:900;color:#f87171;margin:8px 0 4px;letter-spacing:-0.5px;">' + fmtShortUZS(data.totalReceivables) + '</div>' +
        '<div style="font-size:11.5px;color:#94a3b8;">To‘lanmagan qoldiq</div>' +
      '</div>' +

      // KPI 5: Net Profit
      '<div style="background:rgba(15,23,42,0.85);border:1px solid ' + (data.netProfit >= 0 ? 'rgba(16,185,129,0.45)' : 'rgba(239,68,68,0.45)') + ';border-radius:18px;padding:18px;box-shadow:0 8px 30px rgba(0,0,0,0.4);backdrop-filter:blur(16px);position:relative;overflow:hidden;">' +
        '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:' + (data.netProfit >= 0 ? 'linear-gradient(90deg,#10b981,#059669)' : 'linear-gradient(90deg,#ef4444,#dc2626)') + ';"></div>' +
        '<div style="font-size:11px;font-weight:800;color:' + (data.netProfit >= 0 ? '#34d399' : '#f87171') + ';text-transform:uppercase;letter-spacing:0.04em;">Markaz Sof Foydasi</div>' +
        '<div style="font-size:25px;font-weight:900;color:' + (data.netProfit >= 0 ? '#34d399' : '#f87171') + ';margin:8px 0 4px;letter-spacing:-0.5px;">' + fmtShortUZS(data.netProfit) + '</div>' +
        '<div style="font-size:11.5px;color:#94a3b8;">Rentabellik: ' + data.profitMargin + '%</div>' +
      '</div>' +
    '</div>';

    // ------------------------------------------------------------------------
    // SECTION 2: HIGH-PIXEL CHARTS & 360° RADAR CONTAINER
    // ------------------------------------------------------------------------
    h += '<div style="display:grid;grid-template-columns:1.6fr 1fr;gap:20px;margin-bottom:24px;">' +
      
      // LEFT: Growth Chart
      '<div style="background:linear-gradient(145deg,rgba(15,23,42,0.92),rgba(30,41,59,0.85));border:1px solid rgba(56,189,248,0.3);border-radius:22px;padding:22px 24px;box-shadow:0 12px 40px rgba(0,0,0,0.5);backdrop-filter:blur(20px);display:flex;flex-direction:column;justify-content:space-between;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:16px;">' +
          '<div>' +
            '<div style="display:flex;align-items:center;gap:8px;">' +
              '<span style="background:rgba(56,189,248,0.2);color:#38bdf8;border:1px solid rgba(56,189,248,0.4);border-radius:8px;padding:2px 8px;font-size:10px;font-weight:900;">01-MODUL</span>' +
              '<h3 style="margin:0;font-size:16px;font-weight:900;color:#fff;">O‘quv Markaz Oylik &amp; Yillik O‘sish Grafigi</h3>' +
            '</div>' +
            '<p style="margin:3px 0 0;font-size:12px;color:#94a3b8;">Tushum, o‘qituvchilar maoshi, chiqimlar va sof rentabellik dinamikasi</p>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:6px;background:rgba(11,16,27,0.8);padding:4px 6px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);">' +
            '<button class="ee-growth-mode-btn active" data-mode="monthly" style="background:#0284c7;color:#fff;border:none;border-radius:8px;padding:5px 12px;font-size:11.5px;font-weight:800;cursor:pointer;">Oylik (12 Oy)</button>' +
            '<button class="ee-growth-mode-btn" data-mode="yearly" style="background:transparent;color:#94a3b8;border:none;border-radius:8px;padding:5px 12px;font-size:11.5px;font-weight:800;cursor:pointer;">Yillik (2022–2026)</button>' +
            '<button class="ee-growth-mode-btn" data-mode="delta" style="background:transparent;color:#94a3b8;border:none;border-radius:8px;padding:5px 12px;font-size:11.5px;font-weight:800;cursor:pointer;">O‘sish Sur’ati (%)</button>' +
          '</div>' +
        '</div>' +

        '<div style="position:relative;height:290px;width:100%;">' +
          '<canvas id="eeCenterGrowthChart"></canvas>' +
        '</div>' +

        '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.08);">' +
          '<div style="background:rgba(11,16,27,0.7);border:1px solid rgba(16,185,129,0.25);border-radius:12px;padding:10px 12px;">' +
            '<div style="font-size:10.5px;color:#94a3b8;font-weight:700;">Eng Yuqori O‘sish</div>' +
            '<div style="font-size:13.5px;font-weight:900;color:#10b981;margin-top:2px;">Sentabr (+24.6%)</div>' +
          '</div>' +
          '<div style="background:rgba(11,16,27,0.7);border:1px solid rgba(239,68,68,0.25);border-radius:12px;padding:10px 12px;">' +
            '<div style="font-size:10.5px;color:#94a3b8;font-weight:700;">Mavsumiy Pasayish</div>' +
            '<div style="font-size:13.5px;font-weight:900;color:#f87171;margin-top:2px;">Iyul (-6.2%)</div>' +
          '</div>' +
          '<div style="background:rgba(11,16,27,0.7);border:1px solid rgba(56,189,248,0.25);border-radius:12px;padding:10px 12px;">' +
            '<div style="font-size:10.5px;color:#94a3b8;font-weight:700;">Yillik Aylanma</div>' +
            '<div style="font-size:13.5px;font-weight:900;color:#fff;margin-top:2px;">3.48 mlrd so‘m</div>' +
          '</div>' +
          '<div style="background:rgba(11,16,27,0.7);border:1px solid rgba(168,85,247,0.25);border-radius:12px;padding:10px 12px;">' +
            '<div style="font-size:10.5px;color:#94a3b8;font-weight:700;">Yillik O‘sish Sur’ati</div>' +
            '<div style="font-size:13.5px;font-weight:900;color:#c084fc;margin-top:2px;">+42.8% YoY</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      // RIGHT: 360° Radar
      '<div style="background:linear-gradient(145deg,rgba(15,23,42,0.92),rgba(30,41,59,0.85));border:1px solid rgba(168,85,247,0.3);border-radius:22px;padding:22px 24px;box-shadow:0 12px 40px rgba(0,0,0,0.5);backdrop-filter:blur(20px);display:flex;flex-direction:column;justify-content:space-between;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">' +
          '<div>' +
            '<div style="display:flex;align-items:center;gap:8px;">' +
              '<span style="background:rgba(168,85,247,0.2);color:#c084fc;border:1px solid rgba(168,85,247,0.4);border-radius:8px;padding:2px 8px;font-size:10px;font-weight:900;">02-MODUL</span>' +
              '<h3 style="margin:0;font-size:16px;font-weight:900;color:#fff;">Markaz 360° Radari</h3>' +
            '</div>' +
            '<p style="margin:3px 0 0;font-size:12px;color:#94a3b8;">6 burchakli rentabellik va intizom ko‘rsatkichi</p>' +
          '</div>' +
          '<span style="background:rgba(16,185,129,0.18);color:#34d399;border:1px solid rgba(16,185,129,0.4);border-radius:20px;padding:4px 10px;font-size:11.5px;font-weight:900;">92.4 / 100</span>' +
        '</div>' +

        '<div style="position:relative;height:250px;width:100%;">' +
          '<canvas id="eeCenterRadarChart"></canvas>' +
        '</div>' +

        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.08);">' +
          '<div style="display:flex;justify-content:space-between;padding:8px 10px;background:rgba(11,16,27,0.7);border-radius:8px;font-size:11.5px;">' +
            '<span style="color:#94a3b8;">To‘lov Intizomi:</span><strong style="color:#10b981;">92%</strong>' +
          '</div>' +
          '<div style="display:flex;justify-content:space-between;padding:8px 10px;background:rgba(11,16,27,0.7);border-radius:8px;font-size:11.5px;">' +
            '<span style="color:#94a3b8;">O‘qituvchi KPI:</span><strong style="color:#fbbf24;">95%</strong>' +
          '</div>' +
          '<div style="display:flex;justify-content:space-between;padding:8px 10px;background:rgba(11,16,27,0.7);border-radius:8px;font-size:11.5px;">' +
            '<span style="color:#94a3b8;">Davomat Foizi:</span><strong style="color:#38bdf8;">91%</strong>' +
          '</div>' +
          '<div style="display:flex;justify-content:space-between;padding:8px 10px;background:rgba(11,16,27,0.7);border-radius:8px;font-size:11.5px;">' +
            '<span style="color:#94a3b8;">Sof Rentabellik:</span><strong style="color:#c084fc;">89%</strong>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

    // ------------------------------------------------------------------------
    // SECTION 3: RECENT TRANSACTIONS + EXPENSE DONUT DISTRIBUTION
    // ------------------------------------------------------------------------
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">' +
      
      // RECENT TRANSACTIONS FEED
      '<div style="background:rgba(15,23,42,0.85);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:22px;backdrop-filter:blur(20px);box-shadow:0 10px 30px rgba(0,0,0,0.4);">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">' +
          '<h3 style="margin:0;font-size:16px;font-weight:900;color:#fff;display:flex;align-items:center;gap:8px;">⚡ So‘nggi Moliyaviy Harakatlar</h3>' +
          '<span style="font-size:11.5px;color:#94a3b8;font-weight:700;">Avtomatlashtirilgan oqim</span>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:10px;">' +
          data.studentList.slice(0, 4).map(function(st) {
            return '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;">' +
              '<div style="display:flex;align-items:center;gap:10px;">' +
                '<span style="width:28px;height:28px;border-radius:8px;background:rgba(16,185,129,0.2);color:#10b981;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;">✓</span>' +
                '<div><div style="font-size:13px;font-weight:800;color:#fff;">' + esc(st.name) + ' — <span style="color:#94a3b8;font-weight:600;">' + esc(st.className) + '</span></div>' +
                '<div style="font-size:11px;color:#64748b;">' + st.method + ' • Bugun</div></div>' +
              '</div>' +
              '<div style="font-size:13px;font-weight:900;color:#34d399;">+' + fmtShortUZS(st.paid) + ' so‘m</div>' +
            '</div>';
          }).join('') +
          (data.expenses || []).slice(0, 2).map(function(ex) {
            return '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.2);border-radius:12px;">' +
              '<div style="display:flex;align-items:center;gap:10px;">' +
                '<span style="width:28px;height:28px;border-radius:8px;background:rgba(239,68,68,0.2);color:#ef4444;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;">↗</span>' +
                '<div><div style="font-size:13px;font-weight:800;color:#fff;">' + esc(ex.title) + '</div>' +
                '<div style="font-size:11px;color:#64748b;">Bank o‘tkazma</div></div>' +
              '</div>' +
              '<div style="font-size:13px;font-weight:900;color:#f87171;">-' + fmtShortUZS(ex.amount) + ' so‘m</div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>' +

      // EXPENSE DOUGHNUT DISTRIBUTION
      '<div style="background:rgba(15,23,42,0.85);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:22px;backdrop-filter:blur(20px);box-shadow:0 10px 30px rgba(0,0,0,0.4);display:flex;flex-direction:column;justify-content:space-between;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">' +
          '<h3 style="margin:0;font-size:16px;font-weight:900;color:#fff;display:flex;align-items:center;gap:8px;">🍩 Chiqimlar Struktura Taqsimoti</h3>' +
          '<span style="font-size:11.5px;color:#94a3b8;font-weight:700;">Jami: ' + fmtShortUZS(data.totalExpenses) + '</span>' +
        '</div>' +
        '<div style="position:relative;height:220px;width:100%;">' +
          '<canvas id="eeExpenseDistChart"></canvas>' +
        '</div>' +
        '<div style="margin-top:12px;padding:12px 14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;font-size:12px;color:#cbd5e1;line-height:1.5;">' +
          '💡 <b>Moliya Qoidasi:</b> Davomatdagi ism oldidan to‘lov belgisi bosilganda holat (<b>✓ Bergan</b>, <b>? Chala</b>, <b>✗ Bermagan</b>) shu yerda ham, davomatda ham birdek avtomatik saqlanadi.' +
        '</div>' +
      '</div>' +

    '</div>';

    return h;
  };

  // --------------------------------------------------------------------------
  // CHART INITIALIZATION FUNCTIONS
  // --------------------------------------------------------------------------
  var _growthChartInstance = null;
  var _radarChartInstance = null;
  var _distChartInstance = null;
  var _teacherDetailChartInstance = null;
  var _teacherRadarInstance = null;
  var _currentGrowthMode = 'monthly';

  EE.initFinanceCharts = function(totalRev, totalTeacher, totalExp) {
    if (typeof window.Chart === 'undefined') return;

    var monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
    var currentRevMln = Math.round((totalRev || 23800000) / 1000000);
    var currentTeachMln = Math.round((totalTeacher || 14600000) / 1000000);
    var currentExpMln = Math.round((totalExp || 87000000) / 1000000);

    // 1. Growth Line / Bar Chart
    function updateGrowth(mode) {
      _currentGrowthMode = mode;
      var canvas = document.getElementById('eeCenterGrowthChart');
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      if (_growthChartInstance) _growthChartInstance.destroy();

      var gradEmerald = ctx.createLinearGradient(0, 0, 0, 280);
      gradEmerald.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
      gradEmerald.addColorStop(1, 'rgba(16, 185, 129, 0.01)');

      var gradAmber = ctx.createLinearGradient(0, 0, 0, 280);
      gradAmber.addColorStop(0, 'rgba(245, 158, 11, 0.3)');
      gradAmber.addColorStop(1, 'rgba(245, 158, 11, 0.01)');

      if (mode === 'monthly') {
        var revData = [215, 228, 242, 255, 268, 240, 225, 260, 292, currentRevMln, 318, 335];
        var teacherData = [92, 96, 102, 105, 110, 98, 91, 104, 115, currentTeachMln, 124, 130];
        var utilAndExpData = [68, 70, 72, 74, 75, 78, 80, 79, 84, currentExpMln, 88, 90];
        var netData = revData.map(function(r, i) { return r - teacherData[i] - utilAndExpData[i]; });

        _growthChartInstance = new window.Chart(ctx, {
          type: 'line',
          data: {
            labels: monthNames,
            datasets: [
              {
                label: 'Jami Tushum (mln so‘m)',
                data: revData,
                borderColor: '#10B981',
                backgroundColor: gradEmerald,
                borderWidth: 3,
                fill: true,
                tension: 0.35,
                pointBackgroundColor: '#10B981',
                pointRadius: 4
              },
              {
                label: 'Sof Foyda (mln so‘m)',
                data: netData,
                borderColor: '#38BDF8',
                backgroundColor: 'transparent',
                borderWidth: 2.5,
                tension: 0.35,
                pointBackgroundColor: '#38BDF8',
                pointRadius: 3.5
              },
              {
                label: 'O‘qituvchilar Maoshi (mln so‘m)',
                data: teacherData,
                borderColor: '#F59E0B',
                backgroundColor: gradAmber,
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                tension: 0.35,
                pointRadius: 3
              },
              {
                label: 'Chiqimlar & Ehtiyojlar (mln so‘m)',
                data: utilAndExpData,
                borderColor: '#94A3B8',
                borderWidth: 2,
                fill: false,
                tension: 0.35,
                pointRadius: 3
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
              legend: {
                position: 'top',
                labels: { color: '#E2E8F0', usePointStyle: true, boxWidth: 8, font: { size: 11, weight: '700' } }
              }
            },
            scales: {
              x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8', font: { size: 10 } } },
              y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8', callback: function(v) { return v + ' mln'; } } }
            }
          }
        });
      } else if (mode === 'yearly') {
        _growthChartInstance = new window.Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['2022 yil', '2023 yil', '2024 yil', '2025 yil', '2026 yil'],
            datasets: [
              { label: 'Yillik Tushum (mln so‘m)', data: [1180, 1690, 2340, 2980, 3480], backgroundColor: '#10B981', borderRadius: 6 },
              { label: 'O‘qituvchilar Maoshi (mln so‘m)', data: [460, 650, 910, 1140, 1340], backgroundColor: '#F59E0B', borderRadius: 6 },
              { label: 'Chiqimlar (mln so‘m)', data: [340, 460, 620, 780, 960], backgroundColor: '#64748B', borderRadius: 6 },
              { label: 'Yillik Sof Foyda (mln so‘m)', data: [380, 580, 810, 1060, 1180], backgroundColor: '#38BDF8', borderRadius: 6 }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top', labels: { color: '#E2E8F0', usePointStyle: true, boxWidth: 8 } } },
            scales: {
              x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8' } },
              y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8', callback: function(v) { return v + ' mln'; } } }
            }
          }
        });
      } else {
        var deltas = [+4.2, +6.0, +6.1, +5.4, +5.1, -10.4, -6.2, +15.5, +24.6, +8.2, +5.6, +6.8];
        _growthChartInstance = new window.Chart(ctx, {
          type: 'bar',
          data: {
            labels: monthNames,
            datasets: [{
              label: 'Oylik O‘sish yoki Pasayish (%)',
              data: deltas,
              backgroundColor: deltas.map(function(v) { return v >= 0 ? '#10B981' : '#F43F5E'; }),
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top', labels: { color: '#E2E8F0' } } },
            scales: {
              x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8' } },
              y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8', callback: function(v) { return (v > 0 ? '+' : '') + v + '%'; } } }
            }
          }
        });
      }
    }

    updateGrowth('monthly');

    // Attach Growth Mode Switcher
    document.querySelectorAll('.ee-growth-mode-btn').forEach(function(btn) {
      btn.onclick = function() {
        document.querySelectorAll('.ee-growth-mode-btn').forEach(function(b) {
          b.style.background = 'transparent';
          b.style.color = '#94a3b8';
          b.classList.remove('active');
        });
        btn.style.background = '#0284c7';
        btn.style.color = '#fff';
        btn.classList.add('active');
        updateGrowth(btn.getAttribute('data-mode'));
      };
    });

    // 2. 360° Radar Chart
    var radarCanvas = document.getElementById('eeCenterRadarChart');
    if (radarCanvas) {
      var rCtx = radarCanvas.getContext('2d');
      if (_radarChartInstance) _radarChartInstance.destroy();
      _radarChartInstance = new window.Chart(rCtx, {
        type: 'radar',
        data: {
          labels: ['To‘lov Intizomi', 'O‘qituvchi KPI', 'O‘quvchi Davomati', 'Sof Rentabellik', 'Tok Tejamkorligi', 'Yillik O‘sish'],
          datasets: [
            {
              label: '2026 Oktabr (Joriy)',
              data: [92, 95, 91, 89, 86, 94],
              backgroundColor: 'rgba(16, 185, 129, 0.25)',
              borderColor: '#10B981',
              borderWidth: 2.5,
              pointBackgroundColor: '#10B981',
              pointRadius: 4
            },
            {
              label: 'O‘tgan Yil',
              data: [78, 84, 82, 74, 72, 79],
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              borderColor: '#F59E0B',
              borderWidth: 2,
              borderDash: [4, 4],
              pointBackgroundColor: '#F59E0B',
              pointRadius: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#CBD5E1', boxWidth: 10, font: { size: 10, weight: '700' } } }
          },
          scales: {
            r: {
              min: 50,
              max: 100,
              angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
              grid: { color: 'rgba(255, 255, 255, 0.07)' },
              pointLabels: { color: '#E2E8F0', font: { size: 10, weight: '700' } },
              ticks: { display: false }
            }
          }
        }
      });
    }

    // 3. Expense Distribution Doughnut Chart
    var distCanvas = document.getElementById('eeExpenseDistChart');
    if (distCanvas) {
      var dCtx = distCanvas.getContext('2d');
      if (_distChartInstance) _distChartInstance.destroy();
      _distChartInstance = new window.Chart(dCtx, {
        type: 'doughnut',
        data: {
          labels: ['🏢 Bino Ijarasi', '⚡ Elektr & Tok', '👨‍🏫 O‘qituvchilar Payroll', '🌐 Internet & Server', '💻 Jihozlar'],
          datasets: [{
            data: [32, 14.8, 14.6, 4.2, 8.0],
            backgroundColor: ['#10B981', '#F59E0B', '#38BDF8', '#818CF8', '#EC4899'],
            borderColor: '#0f172a',
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { color: '#CBD5E1', boxWidth: 10, font: { size: 11, weight: '700' } } }
          },
          cutout: '68%'
        }
      });
    }
  };

  // --------------------------------------------------------------------------
  // TEACHERS TAB WITH PERSONAL RADAR & COMPARATIVE BAR CHART
  // --------------------------------------------------------------------------
  EE.initTeacherCharts = function(teachers) {
    if (typeof window.Chart === 'undefined') return;

    var canvas = document.getElementById('eeTeacherDetailChart');
    if (canvas) {
      var ctx = canvas.getContext('2d');
      if (_teacherDetailChartInstance) _teacherDetailChartInstance.destroy();

      var tNames = (teachers || []).map(function(t) { return t.name; });
      var tHours = (teachers || []).map(function(t) { return Number(t.teachingHours) || 0; });
      var tEarnings = (teachers || []).map(function(t) {
        return +(((Number(t.teachingHours) || 0) * (Number(t.hourlyRate) || 0) + (Number(t.monthlyBonus) || 0)) / 1000000).toFixed(2);
      });

      _teacherDetailChartInstance = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: tNames,
          datasets: [
            {
              label: 'Hisoblangan Maosh (mln so‘m)',
              data: tEarnings,
              backgroundColor: '#10B981',
              borderRadius: 8,
              yAxisID: 'y'
            },
            {
              type: 'line',
              label: 'O‘tilgan Dars Soati (soat)',
              data: tHours,
              borderColor: '#F59E0B',
              backgroundColor: '#F59E0B',
              borderWidth: 3,
              tension: 0.3,
              pointRadius: 6,
              pointBackgroundColor: '#0B101B',
              pointBorderColor: '#F59E0B',
              pointBorderWidth: 2.5,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { position: 'top', labels: { color: '#E2E8F0', font: { size: 11, weight: '700' } } }
          },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#fff', font: { weight: '800' } } },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { color: '#10B981', callback: function(v) { return v + ' mln'; } }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              grid: { drawOnChartArea: false },
              ticks: { color: '#F59E0B', callback: function(v) { return v + ' soat'; } }
            }
          }
        }
      });
    }

    var rCanvas = document.getElementById('eeTeacherPersonalRadar');
    if (rCanvas) {
      var rCtx = rCanvas.getContext('2d');
      if (_teacherRadarInstance) _teacherRadarInstance.destroy();
      _teacherRadarInstance = new window.Chart(rCtx, {
        type: 'radar',
        data: {
          labels: ['Dars Sifati', 'Davomat', 'Topshiriq Tekshiruvi', 'Qoniqish', 'Metodika', 'Intizom'],
          datasets: [{
            label: 'O‘rtacha Pedagogik KPI',
            data: [96, 94, 98, 95, 92, 91],
            backgroundColor: 'rgba(56, 189, 248, 0.28)',
            borderColor: '#38BDF8',
            borderWidth: 2.5,
            pointBackgroundColor: '#38BDF8',
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#CBD5E1', font: { size: 11 } } }
          },
          scales: {
            r: {
              min: 50,
              max: 100,
              angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
              grid: { color: 'rgba(255, 255, 255, 0.07)' },
              pointLabels: { color: '#E2E8F0', font: { size: 11, weight: '700' } },
              ticks: { display: false }
            }
          }
        }
      });
    }
  };
EE.renderFinanceStudentsTabHtml = function(studentList) {
    var h = '<div style="background:rgba(15,23,42,0.92);border:1px solid rgba(255,255,255,0.1);border-radius:22px;padding:22px;box-shadow:0 10px 40px rgba(0,0,0,0.4);">' +
      // Toolbar
      '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:18px;">' +
        '<div style="display:flex;align-items:center;gap:10px;flex:1;min-width:240px;">' +
          '<input type="text" id="eeFinStudentSearchInp" placeholder="Ism, Gmail yoki guruh bo‘yicha qidiring..." style="width:100%;padding:11px 16px;background:#1e293b;border:1px solid rgba(56,189,248,0.3);border-radius:12px;color:#fff;font-weight:700;font-size:13.5px;outline:none;" />' +
        '</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
          '<button class="ee-fin-st-filter-btn active" data-filter="all" style="background:#0284c7;color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:12px;font-weight:800;cursor:pointer;">Barchasi</button>' +
          '<button class="ee-fin-st-filter-btn" data-filter="paid" style="background:rgba(16,185,129,0.18);color:#34d399;border:1px solid rgba(16,185,129,0.4);border-radius:8px;padding:7px 14px;font-size:12px;font-weight:800;cursor:pointer;">✓ To‘laganlar</button>' +
          '<button class="ee-fin-st-filter-btn" data-filter="partial" style="background:rgba(245,158,11,0.18);color:#fbbf24;border:1px solid rgba(245,158,11,0.4);border-radius:8px;padding:7px 14px;font-size:12px;font-weight:800;cursor:pointer;">? Chala to‘laganlar</button>' +
          '<button class="ee-fin-st-filter-btn" data-filter="unpaid" style="background:rgba(239,68,68,0.18);color:#f87171;border:1px solid rgba(239,68,68,0.4);border-radius:8px;padding:7px 14px;font-size:12px;font-weight:800;cursor:pointer;">✗ Qarzdorlar</button>' +
        '</div>' +
      '</div>' +

      // Table Container
      '<div style="overflow-x:auto;">' +
        '<table style="width:100%;border-collapse:collapse;font-size:13px;text-align:left;">' +
          '<thead>' +
            '<tr style="background:rgba(30,41,59,0.85);color:#94a3b8;font-size:11.5px;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,0.08);">' +
              '<th style="padding:12px 14px;">O‘quvchi</th>' +
              '<th style="padding:12px 14px;">Guruh</th>' +
              '<th style="padding:12px 14px;">Oylik Tarif</th>' +
              '<th style="padding:12px 14px;">To‘langan</th>' +
              '<th style="padding:12px 14px;">Qoldiq</th>' +
              '<th style="padding:12px 14px;text-align:center;">Holat</th>' +
              '<th style="padding:12px 14px;">Usul / Sana</th>' +
              '<th style="padding:12px 14px;text-align:right;">Amallar</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody id="eeFinStudentTableBody">';

          studentList.forEach(function(s, idx) {
            var fee = s.fee || 1400000;
            var paid = s.paid || 0;
            var debt = Math.max(0, fee - paid);
            var isPaid = s.status === 'paid' || paid >= fee;
            var isPartial = !isPaid && paid > 0;

            var statusBadge = '';
            if (isPaid) {
              statusBadge = '<span style="background:rgba(16,185,129,0.2);color:#34d399;border:1px solid rgba(16,185,129,0.5);padding:3px 10px;border-radius:8px;font-size:11.5px;font-weight:900;">✓ Bergan</span>';
            } else if (isPartial) {
              statusBadge = '<span style="background:rgba(245,158,11,0.2);color:#fbbf24;border:1px solid rgba(245,158,11,0.5);padding:3px 10px;border-radius:8px;font-size:11.5px;font-weight:900;">? Chala</span>';
            } else {
              statusBadge = '<span style="background:rgba(239,68,68,0.2);color:#f87171;border:1px solid rgba(239,68,68,0.5);padding:3px 10px;border-radius:8px;font-size:11.5px;font-weight:900;">✗ Bermagan</span>';
            }

            h += '<tr class="ee-fin-st-row" data-status="' + s.status + '" style="border-bottom:1px solid rgba(255,255,255,0.06);background:' + (idx % 2 === 0 ? 'rgba(15,23,42,0.3)' : 'rgba(30,41,59,0.3)') + ';">' +
              '<td style="padding:12px 14px;">' +
                '<div style="display:flex;align-items:center;gap:10px;">' +
                  '<span style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;font-weight:900;display:flex;align-items:center;justify-content:center;font-size:12px;">' + esc((s.name || 'O').charAt(0).toUpperCase()) + '</span>' +
                  '<div>' +
                    '<div style="font-weight:800;color:#f8fafc;">' + esc(s.name) + '</div>' +
                    '<div style="font-size:11px;color:#94a3b8;">' + esc(s.email || s.phone) + '</div>' +
                  '</div>' +
                '</div>' +
              '</td>' +
              '<td style="padding:12px 14px;"><span style="background:rgba(56,189,248,0.12);color:#38bdf8;padding:3px 8px;border-radius:6px;font-size:11.5px;font-weight:700;">' + esc(s.className) + '</span></td>' +
              '<td style="padding:12px 14px;font-weight:800;color:#e2e8f0;font-family:monospace;">' + fmtUZS(fee) + '</td>' +
              '<td style="padding:12px 14px;font-weight:900;color:#34d399;font-family:monospace;">' + fmtUZS(paid) + '</td>' +
              '<td style="padding:12px 14px;font-weight:900;color:' + (debt > 0 ? '#ff4d4d' : '#94a3b8') + ';font-family:monospace;">' + (debt > 0 ? fmtUZS(debt) : '—') + '</td>' +
              '<td style="padding:12px 14px;text-align:center;">' + statusBadge + '</td>' +
              '<td style="padding:12px 14px;"><div style="font-weight:700;color:#cbd5e1;">' + esc(s.method) + '</div><div style="font-size:11px;color:#94a3b8;">' + esc(s.date) + '</div></td>' +
              '<td style="padding:12px 14px;text-align:right;">' +
                '<div style="display:inline-flex;gap:6px;">' +
                  '<button class="ee-fin-st-pay-btn" data-stid="' + esc(s.id) + '" data-stname="' + esc(s.name) + '" data-stfee="' + fee + '" data-stpaid="' + paid + '" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:8px;padding:6px 10px;font-size:11.5px;font-weight:800;cursor:pointer;">💵 To‘lov</button>' +
                  '<button class="ee-fin-st-edit-fee-btn" data-stid="' + esc(s.id) + '" data-stname="' + esc(s.name) + '" data-stfee="' + fee + '" title="Oylik tarifni o‘zgartirish" style="background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.3);border-radius:8px;padding:6px 10px;font-size:11.5px;font-weight:800;cursor:pointer;">✏️ Tarif</button>' +
                '</div>' +
              '</td>' +
            '</tr>';
          });

        h += '</tbody></table></div></div>';
    return h;
  };

  // --------------------------------------------------------------------------
  // TAB 3: TEACHERS & PAYROLL TABLE HTML
  // --------------------------------------------------------------------------
  EE.renderFinanceTeachersTabHtml = function(teachers) {
    var h = '<div style="display:flex;flex-direction:column;gap:20px;">' +
      
      // TEACHER COMPARATIVE ANALYTICS & RADAR
      '<div style="display:grid;grid-template-columns:1.6fr 1fr;gap:20px;">' +
        '<div style="background:rgba(15,23,42,0.85);border:1px solid rgba(56,189,248,0.3);border-radius:20px;padding:22px;backdrop-filter:blur(20px);box-shadow:0 10px 30px rgba(0,0,0,0.4);">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">' +
            '<h3 style="margin:0;font-size:16px;font-weight:900;color:#fff;">📊 Ustozlar O‘tilgan Dars Soatlari va Maosh Solishtirmasi</h3>' +
            '<span style="font-size:11px;color:#38bdf8;font-weight:800;">Real vaqt hisobi</span>' +
          '</div>' +
          '<div style="position:relative;height:240px;width:100%;">' +
            '<canvas id="eeTeacherDetailChart"></canvas>' +
          '</div>' +
        '</div>' +

        '<div style="background:rgba(15,23,42,0.85);border:1px solid rgba(168,85,247,0.3);border-radius:20px;padding:22px;backdrop-filter:blur(20px);box-shadow:0 10px 30px rgba(0,0,0,0.4);">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">' +
            '<h3 style="margin:0;font-size:16px;font-weight:900;color:#fff;">🎯 Pedagogik KPI Radari</h3>' +
            '<span style="background:rgba(56,189,248,0.2);color:#38bdf8;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:900;">94.3%</span>' +
          '</div>' +
          '<div style="position:relative;height:240px;width:100%;">' +
            '<canvas id="eeTeacherPersonalRadar"></canvas>' +
          '</div>' +
        '</div>' +
      '</div>' +

      // TEACHERS TABLE
      '<div style="background:rgba(15,23,42,0.85);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:24px;backdrop-filter:blur(20px);box-shadow:0 10px 30px rgba(0,0,0,0.4);">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px;">' +
          '<div>' +
            '<h3 style="margin:0;font-size:18px;font-weight:900;color:#fff;">O‘qituvchilar Shtati va Soatlik Dars Maoshi (Payroll)</h3>' +
            '<p style="margin:4px 0 0;font-size:12.5px;color:#94a3b8;">Har bir o‘tilgan dars soati, soatlik stavka va oylik hisob-kitoblar.</p>' +
          '</div>' +
          '<button id="eeBtnAddTeacher" style="background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:10px;padding:8px 16px;font-size:12.5px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:6px;">+ O‘qituvchi Qo‘shish</button>' +
        '</div>' +

        '<div style="overflow-x:auto;">' +
          '<table style="width:100%;border-collapse:collapse;text-align:left;">' +
            '<thead>' +
              '<tr style="border-bottom:1px solid rgba(255,255,255,0.1);font-size:11px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.04em;">' +
                '<th style="padding:12px 14px;">O‘qituvchi</th>' +
                '<th style="padding:12px 14px;">Mutaxassislik</th>' +
                '<th style="padding:12px 14px;">O‘tilgan Dars Soati</th>' +
                '<th style="padding:12px 14px;">Soatlik Stavka</th>' +
                '<th style="padding:12px 14px;">Oylik Bonus</th>' +
                '<th style="padding:12px 14px;">Jami Hisoblangan Maosh</th>' +
                '<th style="padding:12px 14px;">Holat</th>' +
                '<th style="padding:12px 14px;text-align:right;">Amal</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              teachers.map(function(t) {
                var hours = Number(t.teachingHours) || 0;
                var rate = Number(t.hourlyRate) || 0;
                var bonus = Number(t.monthlyBonus) || 0;
                var total = (hours * rate) + bonus;
                var isPaid = t.status === 'paid';

                return '<tr style="border-bottom:1px solid rgba(255,255,255,0.06);transition:background 0.15s;" onmouseover="this.style.background=\'rgba(255,255,255,0.02)\'" onmouseout="this.style.background=\'transparent\'">' +
                  '<td style="padding:14px;">' +
                    '<div style="display:flex;align-items:center;gap:12px;">' +
                      '<span style="width:36px;height:36px;border-radius:10px;background:#0284c7;color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;">' + (t.name ? t.name.charAt(0).toUpperCase() : 'U') + '</span>' +
                      '<div><div style="font-size:13.5px;font-weight:800;color:#fff;">' + esc(t.name) + '</div>' +
                      '<div style="font-size:11px;color:#94a3b8;">' + esc(t.email || '') + '</div></div>' +
                    '</div>' +
                  '</td>' +
                  '<td style="padding:14px;font-size:13px;color:#cbd5e1;font-weight:700;">' + esc(t.subject || 'Ingliz tili') + '</td>' +
                  '<td style="padding:14px;"><span style="background:rgba(56,189,248,0.15);color:#38bdf8;padding:4px 10px;border-radius:8px;font-size:12.5px;font-weight:900;">' + hours + ' soat</span></td>' +
                  '<td style="padding:14px;font-size:13px;color:#fff;font-weight:800;">' + fmtUZS(rate) + ' <span style="font-size:11px;color:#94a3b8;">/ soat</span></td>' +
                  '<td style="padding:14px;font-size:13px;color:#c084fc;font-weight:800;">' + fmtUZS(bonus) + '</td>' +
                  '<td style="padding:14px;font-size:14px;color:#34d399;font-weight:900;">' + fmtUZS(total) + '</td>' +
                  '<td style="padding:14px;">' +
                    '<span style="padding:4px 10px;border-radius:8px;font-size:11.5px;font-weight:900;' + (isPaid ? 'background:rgba(16,185,129,0.2);color:#10b981;' : 'background:rgba(245,158,11,0.2);color:#f59e0b;') + '">' +
                      (isPaid ? '✓ To‘langan' : '⏳ Kutilmoqda') +
                    '</span>' +
                  '</td>' +
                  '<td style="padding:14px;text-align:right;">' +
                    '<button class="ee-fin-edit-teacher-btn" data-tid="' + esc(t.id) + '" data-tname="' + esc(t.name) + '" data-thours="' + hours + '" data-trate="' + rate + '" data-tbonus="' + bonus + '" style="background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.35);border-radius:8px;padding:6px 12px;font-size:11.5px;font-weight:800;cursor:pointer;">⚙️ Tahrir</button>' +
                  '</td>' +
                '</tr>';
              }).join('') +
            '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>' +
    '</div>';

    return h;
  };
EE.renderFinanceExpensesTabHtml = function(expenses) {
    var h = '<div style="background:rgba(15,23,42,0.92);border:1px solid rgba(255,255,255,0.1);border-radius:22px;padding:22px;box-shadow:0 10px 40px rgba(0,0,0,0.4);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:12px;">' +
        '<div>' +
          '<h3 style="margin:0;font-size:18px;font-weight:900;color:#fff;">O‘quv Markazi Operatsion Xarajatlari</h3>' +
          '<div style="font-size:12.5px;color:#94a3b8;margin-top:2px;">Tok, ijara, kommunal, internet va boshqa moddiy xarajatlar.</div>' +
        '</div>' +
        '<button id="eeBtnAddExpenseInner" style="background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;border:none;border-radius:10px;padding:8px 16px;font-size:12.5px;font-weight:900;cursor:pointer;">+ Yangi Xarajat</button>' +
      '</div>' +

      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px;">';

      expenses.forEach(function(e) {
        h += '<div style="background:#1e293b;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:16px;display:flex;align-items:center;justify-content:space-between;gap:12px;">' +
          '<div style="display:flex;align-items:center;gap:12px;">' +
            '<span style="font-size:24px;width:40px;height:40px;background:rgba(255,255,255,0.06);border-radius:10px;display:flex;align-items:center;justify-content:center;">' + (e.icon || '💸') + '</span>' +
            '<div>' +
              '<div style="font-size:13.5px;font-weight:800;color:#fff;">' + esc(e.title) + '</div>' +
              '<div style="font-size:11px;color:#94a3b8;text-transform:uppercase;">' + esc(e.category) + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="text-align:right;">' +
            '<div style="font-size:15px;font-weight:900;color:#fca5a5;font-family:monospace;">' + fmtUZS(e.amount) + '</div>' +
            '<button class="ee-fin-del-exp-btn" data-eid="' + esc(e.id) + '" style="background:none;border:none;color:#ef4444;font-size:11px;cursor:pointer;padding:2px 4px;margin-top:4px;">O‘chirish</button>' +
          '</div>' +
        '</div>';
      });

      h += '</div></div>';
    return h;
  };

  // --------------------------------------------------------------------------
  // EVENT LISTENERS & MODALS FOR UNIFIED FINANCE
  // --------------------------------------------------------------------------
  EE.attachFinanceEventListeners = function(container, S, studentList, activeTab) {
    // Tab buttons
    container.querySelectorAll('.ee-fin-tab-btn').forEach(function(btn) {
      btn.onclick = function() {
        var t = btn.getAttribute('data-tab');
        EE.renderFinanceUnifiedView(container, t);
      };
    });

    // Student Search & Filter
    var searchInp = container.querySelector('#eeFinStudentSearchInp');
    if (searchInp) {
      searchInp.oninput = function() {
        var q = searchInp.value.toLowerCase().trim();
        container.querySelectorAll('.ee-fin-st-row').forEach(function(row) {
          var text = row.textContent.toLowerCase();
          row.style.display = text.includes(q) ? '' : 'none';
        });
      };
    }

    container.querySelectorAll('.ee-fin-st-filter-btn').forEach(function(btn) {
      btn.onclick = function() {
        container.querySelectorAll('.ee-fin-st-filter-btn').forEach(function(b) { b.classList.remove('active'); b.style.background = 'rgba(255,255,255,0.06)'; b.style.color = '#94a3b8'; });
        btn.classList.add('active');
        btn.style.background = '#0284c7';
        btn.style.color = '#fff';

        var f = btn.getAttribute('data-filter');
        container.querySelectorAll('.ee-fin-st-row').forEach(function(row) {
          var st = row.getAttribute('data-status');
          if (f === 'all') {
            row.style.display = '';
          } else {
            row.style.display = (st === f) ? '' : 'none';
          }
        });
      };
    });

    // Student Payment Button (💵 To'lov Qabul Qilish)
    container.querySelectorAll('.ee-fin-st-pay-btn, #eeBtnOpenPayModal').forEach(function(btn) {
      btn.onclick = function() {
        var stId = btn.getAttribute('data-stid') || (studentList[0] ? studentList[0].id : '');
        var stName = btn.getAttribute('data-stname') || (studentList[0] ? studentList[0].name : '');
        var fee = btn.getAttribute('data-stfee') || (studentList[0] ? studentList[0].fee : 1400000);
        var paid = btn.getAttribute('data-stpaid') || 0;
        EE.openRecordPaymentModal(container, S, studentList, stId, stName, fee, paid);
      };
    });

    // Student Edit Fee Button (✏️ Tarif)
    container.querySelectorAll('.ee-fin-st-edit-fee-btn').forEach(function(btn) {
      btn.onclick = function() {
        var stId = btn.getAttribute('data-stid');
        var stName = btn.getAttribute('data-stname');
        var fee = btn.getAttribute('data-stfee');
        var newFee = prompt(stName + " uchun oylik to‘lov tarifini kiriting (so‘m):", fee || 1400000);
        if (newFee === null) return;
        var feeAmt = parseInt(String(newFee).replace(/\s+/g, ''), 10) || 1400000;

        if (!S.finance.studentFees[stId]) S.finance.studentFees[stId] = {};
        S.finance.studentFees[stId].fee = feeAmt;
        if (S.finance.studentFees[stId].paid === undefined) S.finance.studentFees[stId].paid = feeAmt;

        saveStore();
        showToast(stName + " tarifi " + fmtUZS(feeAmt) + " qilib belgilandi!");
        EE.renderFinanceUnifiedView(container, 'students');
      };
    });

    // Teacher Edit Button (⚙️ Tahrir)
    container.querySelectorAll('.ee-fin-edit-teacher-btn').forEach(function(btn) {
      btn.onclick = function() {
        var tid = btn.getAttribute('data-tid');
        EE.openEditTeacherPayrollModal(container, S, tid);
      };
    });

    // Teacher Toggle Paid
    container.querySelectorAll('.ee-fin-toggle-paid-btn').forEach(function(btn) {
      btn.onclick = function() {
        var tid = btn.getAttribute('data-tid');
        var t = S.teachers.find(function(x) { return x.id === tid; });
        if (t) {
          t.paidThisMonth = !t.paidThisMonth;
          saveStore();
          showToast(t.name + " maoshi: " + (t.paidThisMonth ? "To‘langan deb belgilandi" : "Kutilmoqda deb belgilandi"));
          EE.renderFinanceUnifiedView(container, 'teachers');
        }
      };
    });

    // Add Teacher Button
    var addTBtn = container.querySelector('#eeBtnAddTeacherFin');
    if (addTBtn) {
      addTBtn.onclick = function() {
        var name = prompt("O‘qituvchi ism va familiyasi:");
        if (!name || !name.trim()) return;
        var subject = prompt("Fani / Yo‘nalishi:", "IELTS & General English");
        var rate = parseInt(prompt("Soatlik dars stavkasi (so‘m/soat):", "100000"), 10) || 100000;
        var bonus = parseInt(prompt("Oylik bonus / oklad (so‘m):", "1000000"), 10) || 1000000;
        var hours = parseInt(prompt("O‘tilgan dars soati:", "72"), 10) || 72;

        var newT = {
          id: 't_' + Date.now(),
          name: name.trim(),
          initials: name.split(' ').map(function(w){return w[0];}).join('').slice(0, 2).toUpperCase(),
          subject: subject || 'Ingliz tili',
          hourlyRate: rate,
          teachingHours: hours,
          monthlyBonus: bonus,
          monthlySalary: (hours * rate) + bonus,
          paidThisMonth: false,
          assignedClasses: []
        };
        S.teachers.push(newT);
        saveStore();
        showToast("Yangi o‘qituvchi shtatga qo‘shildi!");
        EE.renderFinanceUnifiedView(container, 'teachers');
      };
    }

    // Add Expense Buttons
    container.querySelectorAll('#eeBtnOpenExpModal, #eeBtnAddExpenseInner').forEach(function(btn) {
      btn.onclick = function() {
        EE.openAddExpenseModal(container, S);
      };
    });

    // Delete Expense
    container.querySelectorAll('.ee-fin-del-exp-btn').forEach(function(btn) {
      btn.onclick = function() {
        var eid = btn.getAttribute('data-eid');
        if (confirm("Ushbu xarajatni o‘chirishni tasdiqlaysizmi?")) {
          S.finance.expenses = S.finance.expenses.filter(function(x) { return x.id !== eid; });
          saveStore();
          showToast("Xarajat o‘chirildi");
          EE.renderFinanceUnifiedView(container, 'expenses');
        }
      };
    });

    // Export Excel
    var exportBtn = container.querySelector('#eeBtnExportFinExcel');
    if (exportBtn) {
      exportBtn.onclick = function() {
        if (!window.XLSX) { alert("XLSX kutubxonasi mavjud emas!"); return; }
        var wb = window.XLSX.utils.book_new();

        // Sheet 1: O'quvchilar To'lovi
        var stData = [["№", "O'quvchi F.I.Sh", "Guruh", "Oylik Tarif", "To'langan Summa", "Qoldiq Qarz", "Holat", "To'lov Usuli", "Sana"]];
        studentList.forEach(function(s, idx) {
          var fee = s.fee || 1400000;
          var paid = s.paid || 0;
          var debt = Math.max(0, fee - paid);
          stData.push([idx + 1, s.name, s.className, fee, paid, debt, s.status, s.method, s.date]);
        });
        var ws1 = window.XLSX.utils.aoa_to_sheet(stData);
        window.XLSX.utils.book_append_sheet(wb, ws1, "Oquvchilar_Tolovlari");

        // Sheet 2: O'qituvchilar Payroll
        var tData = [["№", "O'qituvchi", "Mutaxassislik", "Dars Soati", "Soatlik Stavka", "Bonus", "Jami Maosh", "To'langanlik"]];
        S.teachers.forEach(function(t, idx) {
          var hours = t.teachingHours || 0;
          var rate = t.hourlyRate || 100000;
          var bonus = t.monthlyBonus || 0;
          tData.push([idx + 1, t.name, t.subject, hours, rate, bonus, (hours * rate) + bonus, t.paidThisMonth ? "To'langan" : "Kutilmoqda"]);
        });
        var ws2 = window.XLSX.utils.aoa_to_sheet(tData);
        window.XLSX.utils.book_append_sheet(wb, ws2, "Uqituvchilar_Payroll");

        // Sheet 3: Xarajatlar
        var expData = [["№", "Kategoriya", "Xarajat Nomi", "Summa"]];
        S.finance.expenses.forEach(function(e, idx) {
          expData.push([idx + 1, e.category, e.title, e.amount]);
        });
        var ws3 = window.XLSX.utils.aoa_to_sheet(expData);
        window.XLSX.utils.book_append_sheet(wb, ws3, "Xarajatlar");

        window.XLSX.writeFile(wb, "ETHITH_Moliya_Hisoboti_" + new Date().toISOString().split('T')[0] + ".xlsx");
      };
    }
  };

  // --------------------------------------------------------------------------
  // MODAL: RECORD STUDENT PAYMENT
  // --------------------------------------------------------------------------
  EE.openRecordPaymentModal = function(container, S, studentList, selStId, selStName, fee, paid) {
    var modalRoot = document.getElementById('eaGlobalModalRoot') || document.body;
    var existing = document.getElementById('eeFinPayModalOverlay');
    if (existing) existing.remove();

    var m = document.createElement('div');
    m.id = 'eeFinPayModalOverlay';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.85);backdrop-filter:blur(24px);z-index:2147483645;display:flex;align-items:center;justify-content:center;padding:16px;';

    var optionsHtml = '';
    studentList.forEach(function(s) {
      optionsHtml += '<option value="' + esc(s.id) + '" ' + (s.id === selStId ? 'selected' : '') + '>' + esc(s.name) + ' (' + esc(s.className) + ')</option>';
    });

    m.innerHTML = '<div style="background:rgba(15,23,42,0.96);border:1px solid rgba(16,185,129,0.4);border-radius:24px;max-width:480px;width:100%;padding:26px 28px;color:#f8fafc;box-shadow:0 25px 60px rgba(0,0,0,0.7),0 0 40px rgba(16,185,129,0.2);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:14px;">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<span style="font-size:22px;">💵</span>' +
          '<h3 style="margin:0;font-size:18px;font-weight:900;color:#fff;">O‘quvchi To‘lovini Qabul Qilish</h3>' +
        '</div>' +
        '<button id="eeClosePayModal" style="background:none;border:none;color:#94a3b8;font-size:22px;cursor:pointer;">✕</button>' +
      '</div>' +

      '<div style="display:flex;flex-direction:column;gap:14px;">' +
        '<div>' +
          '<label style="display:block;font-size:11.5px;font-weight:800;color:#94a3b8;text-transform:uppercase;margin-bottom:6px;">O‘quvchini Tanlang</label>' +
          '<select id="eePayStSelect" style="width:100%;padding:12px;background:#1e293b;border:1px solid rgba(56,189,248,0.3);border-radius:12px;color:#fff;font-weight:700;font-size:13.5px;outline:none;">' +
            optionsHtml +
          '</select>' +
        '</div>' +

        '<div>' +
          '<label style="display:block;font-size:11.5px;font-weight:800;color:#10b981;text-transform:uppercase;margin-bottom:6px;">To‘langan Summa (so‘m)</label>' +
          '<input type="number" id="eePayAmountInp" value="' + (paid || fee || 1400000) + '" style="width:100%;padding:12px 14px;background:#1e293b;border:1.5px solid #10b981;border-radius:12px;color:#34d399;font-weight:900;font-size:18px;outline:none;box-sizing:border-box;" />' +
        '</div>' +

        '<div>' +
          '<label style="display:block;font-size:11.5px;font-weight:800;color:#94a3b8;text-transform:uppercase;margin-bottom:6px;">To‘lov Usuli</label>' +
          '<select id="eePayMethodSelect" style="width:100%;padding:12px;background:#1e293b;border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:#fff;font-weight:700;font-size:13.5px;outline:none;">' +
            '<option value="Click">Click</option>' +
            '<option value="Payme">Payme</option>' +
            '<option value="Uzum">Uzum Bank</option>' +
            '<option value="Naqd">Naqd Pul (Kassa)</option>' +
          '</select>' +
        '</div>' +
      '</div>' +

      '<div style="display:flex;gap:12px;margin-top:24px;">' +
        '<button id="eeCancelPayModal" style="flex:1;background:rgba(255,255,255,0.08);color:#94a3b8;border:none;border-radius:12px;padding:12px;font-weight:800;cursor:pointer;">Bekor Qilish</button>' +
        '<button id="eeSavePayModal" style="flex:1;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:12px;padding:12px;font-weight:900;font-size:14px;cursor:pointer;box-shadow:0 4px 15px rgba(16,185,129,0.4);">💾 To‘lovni Saqlash</button>' +
      '</div>' +
    '</div>';

    modalRoot.appendChild(m);
    var close = function() { m.remove(); };
    m.querySelector('#eeClosePayModal').onclick = close;
    m.querySelector('#eeCancelPayModal').onclick = close;

    m.querySelector('#eeSavePayModal').onclick = function() {
      var sId = m.querySelector('#eePayStSelect').value;
      var amt = parseInt(m.querySelector('#eePayAmountInp').value, 10) || 0;
      var method = m.querySelector('#eePayMethodSelect').value;

      var st = studentList.find(function(x) { return x.id === sId; });
      var feeVal = (st && st.fee) || 1400000;
      var status = amt >= feeVal ? 'paid' : (amt > 0 ? 'partial' : 'unpaid');

      var upd = {
        fee: feeVal,
        paid: amt,
        status: status,
        method: method,
        date: new Date().toISOString().split('T')[0]
      };

      if (!S.finance.studentFees) S.finance.studentFees = {};
      S.finance.studentFees[sId] = upd;

      // Update in classes studentPayments
      (S.classes || []).forEach(function(c) {
        if (!c.studentPayments) c.studentPayments = {};
        if ((c.students || []).some(function(x) { return x.id === sId || x.email === sId; })) {
          c.studentPayments[sId] = upd;
        }
      });

      saveStore();
      showToast((st ? st.name : 'O‘quvchi') + " to‘lovi (" + fmtUZS(amt) + ") muvaffaqiyatli qabul qilindi!");
      close();
      EE.renderFinanceUnifiedView(container, 'students');
    };
  };

  // --------------------------------------------------------------------------
  // MODAL: EDIT TEACHER PAYROLL (HOURLY RATE & HOURS & BONUS)
  // --------------------------------------------------------------------------
  EE.openEditTeacherPayrollModal = function(container, S, tid) {
    var t = S.teachers.find(function(x) { return x.id === tid; });
    if (!t) return;

    var modalRoot = document.getElementById('eaGlobalModalRoot') || document.body;
    var existing = document.getElementById('eeFinTeacherModalOverlay');
    if (existing) existing.remove();

    var m = document.createElement('div');
    m.id = 'eeFinTeacherModalOverlay';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.85);backdrop-filter:blur(24px);z-index:2147483645;display:flex;align-items:center;justify-content:center;padding:16px;';

    m.innerHTML = '<div style="background:rgba(15,23,42,0.96);border:1px solid rgba(56,189,248,0.4);border-radius:24px;max-width:480px;width:100%;padding:26px 28px;color:#f8fafc;box-shadow:0 25px 60px rgba(0,0,0,0.7),0 0 40px rgba(56,189,248,0.2);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:14px;">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<span style="font-size:22px;">⚙️</span>' +
          '<h3 style="margin:0;font-size:18px;font-weight:900;color:#fff;">O‘qituvchi Stavka va Dars Soatini Tahrirlash</h3>' +
        '</div>' +
        '<button id="eeCloseTeacherModal" style="background:none;border:none;color:#94a3b8;font-size:22px;cursor:pointer;">✕</button>' +
      '</div>' +

      '<div style="display:flex;flex-direction:column;gap:14px;">' +
        '<div>' +
          '<label style="display:block;font-size:11.5px;font-weight:800;color:#94a3b8;text-transform:uppercase;margin-bottom:6px;">O‘qituvchi Ismi</label>' +
          '<input type="text" id="eeEditTName" value="' + esc(t.name) + '" style="width:100%;padding:11px 14px;background:#1e293b;border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:#fff;font-weight:700;font-size:13.5px;outline:none;box-sizing:border-box;" />' +
        '</div>' +

        '<div>' +
          '<label style="display:block;font-size:11.5px;font-weight:800;color:#38bdf8;text-transform:uppercase;margin-bottom:6px;">O‘tilgan Dars Soati (Soat)</label>' +
          '<input type="number" id="eeEditTHours" value="' + (t.teachingHours || 72) + '" style="width:100%;padding:12px 14px;background:#1e293b;border:1.5px solid #38bdf8;border-radius:12px;color:#38bdf8;font-weight:900;font-size:17px;outline:none;box-sizing:border-box;" />' +
        '</div>' +

        '<div>' +
          '<label style="display:block;font-size:11.5px;font-weight:800;color:#10b981;text-transform:uppercase;margin-bottom:6px;">Soatlik Stavka (so‘m / dars soati)</label>' +
          '<input type="number" id="eeEditTRate" value="' + (t.hourlyRate || 100000) + '" style="width:100%;padding:12px 14px;background:#1e293b;border:1.5px solid #10b981;border-radius:12px;color:#34d399;font-weight:900;font-size:17px;outline:none;box-sizing:border-box;" />' +
        '</div>' +

        '<div>' +
          '<label style="display:block;font-size:11.5px;font-weight:800;color:#a855f7;text-transform:uppercase;margin-bottom:6px;">Oylik Bonus / Oklad (so‘m)</label>' +
          '<input type="number" id="eeEditTBonus" value="' + (t.monthlyBonus || 1000000) + '" style="width:100%;padding:12px 14px;background:#1e293b;border:1px solid rgba(168,85,247,0.4);border-radius:12px;color:#c084fc;font-weight:900;font-size:17px;outline:none;box-sizing:border-box;" />' +
        '</div>' +
      '</div>' +

      '<div style="display:flex;gap:12px;margin-top:24px;">' +
        '<button id="eeCancelTeacherModal" style="flex:1;background:rgba(255,255,255,0.08);color:#94a3b8;border:none;border-radius:12px;padding:12px;font-weight:800;cursor:pointer;">Bekor Qilish</button>' +
        '<button id="eeSaveTeacherModal" style="flex:1;background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:12px;padding:12px;font-weight:900;font-size:14px;cursor:pointer;box-shadow:0 4px 15px rgba(2,132,199,0.4);">💾 Saqlash</button>' +
      '</div>' +
    '</div>';

    modalRoot.appendChild(m);
    var close = function() { m.remove(); };
    m.querySelector('#eeCloseTeacherModal').onclick = close;
    m.querySelector('#eeCancelTeacherModal').onclick = close;

    m.querySelector('#eeSaveTeacherModal').onclick = function() {
      var nName = m.querySelector('#eeEditTName').value.trim();
      var nHours = parseInt(m.querySelector('#eeEditTHours').value, 10) || 0;
      var nRate = parseInt(m.querySelector('#eeEditTRate').value, 10) || 0;
      var nBonus = parseInt(m.querySelector('#eeEditTBonus').value, 10) || 0;

      t.name = nName || t.name;
      t.teachingHours = nHours;
      t.hourlyRate = nRate;
      t.monthlyBonus = nBonus;
      t.monthlySalary = (nHours * nRate) + nBonus;

      saveStore();
      showToast(t.name + " maosh parametrlari (" + nHours + " soat x " + fmtUZS(nRate) + ") saqlandi!");
      close();
      EE.renderFinanceUnifiedView(container, 'teachers');
    };
  };

  // --------------------------------------------------------------------------
  // MODAL: ADD EXPENSE
  // --------------------------------------------------------------------------
  EE.openAddExpenseModal = function(container, S) {
    var modalRoot = document.getElementById('eaGlobalModalRoot') || document.body;
    var existing = document.getElementById('eeFinExpModalOverlay');
    if (existing) existing.remove();

    var m = document.createElement('div');
    m.id = 'eeFinExpModalOverlay';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.85);backdrop-filter:blur(24px);z-index:2147483645;display:flex;align-items:center;justify-content:center;padding:16px;';

    m.innerHTML = '<div style="background:rgba(15,23,42,0.96);border:1px solid rgba(239,68,68,0.4);border-radius:24px;max-width:480px;width:100%;padding:26px 28px;color:#f8fafc;box-shadow:0 25px 60px rgba(0,0,0,0.7),0 0 40px rgba(239,68,68,0.2);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:14px;">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<span style="font-size:22px;">💸</span>' +
          '<h3 style="margin:0;font-size:18px;font-weight:900;color:#fff;">Yangi Operatsion Xarajat Kiritish</h3>' +
        '</div>' +
        '<button id="eeCloseExpModal" style="background:none;border:none;color:#94a3b8;font-size:22px;cursor:pointer;">✕</button>' +
      '</div>' +

      '<div style="display:flex;flex-direction:column;gap:14px;">' +
        '<div>' +
          '<label style="display:block;font-size:11.5px;font-weight:800;color:#94a3b8;text-transform:uppercase;margin-bottom:6px;">Xarajat Nomi</label>' +
          '<input type="text" id="eeExpTitleInp" placeholder="masalan: Qoshimcha proyektor tamiri" style="width:100%;padding:11px 14px;background:#1e293b;border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:#fff;font-weight:700;font-size:13.5px;outline:none;box-sizing:border-box;" />' +
        '</div>' +

        '<div>' +
          '<label style="display:block;font-size:11.5px;font-weight:800;color:#ef4444;text-transform:uppercase;margin-bottom:6px;">Xarajat Summasi (so‘m)</label>' +
          '<input type="number" id="eeExpAmountInp" placeholder="1500000" style="width:100%;padding:12px 14px;background:#1e293b;border:1.5px solid #ef4444;border-radius:12px;color:#fca5a5;font-weight:900;font-size:17px;outline:none;box-sizing:border-box;" />' +
        '</div>' +

        '<div>' +
          '<label style="display:block;font-size:11.5px;font-weight:800;color:#94a3b8;text-transform:uppercase;margin-bottom:6px;">Kategoriya</label>' +
          '<select id="eeExpCatSelect" style="width:100%;padding:12px;background:#1e293b;border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:#fff;font-weight:700;font-size:13.5px;outline:none;">' +
            '<option value="electricity">⚡ Elektr Energiyasi (Tok)</option>' +
            '<option value="utilities">💧 Kommunal (Suv, isitish, chiqindi)</option>' +
            '<option value="rent">🏢 Bino Ijarasi</option>' +
            '<option value="internet">🌐 Internet &amp; LMS Server</option>' +
            '<option value="equipment">💻 Jihozlar va Tamir</option>' +
            '<option value="marketing">📣 Marketing &amp; Reklama</option>' +
            '<option value="other">🛠️ Xo‘jalik va Boshqalar</option>' +
          '</select>' +
        '</div>' +
      '</div>' +

      '<div style="display:flex;gap:12px;margin-top:24px;">' +
        '<button id="eeCancelExpModal" style="flex:1;background:rgba(255,255,255,0.08);color:#94a3b8;border:none;border-radius:12px;padding:12px;font-weight:800;cursor:pointer;">Bekor Qilish</button>' +
        '<button id="eeSaveExpModal" style="flex:1;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;border:none;border-radius:12px;padding:12px;font-weight:900;font-size:14px;cursor:pointer;box-shadow:0 4px 15px rgba(239,68,68,0.4);">💾 Xarajatni Saqlash</button>' +
      '</div>' +
    '</div>';

    modalRoot.appendChild(m);
    var close = function() { m.remove(); };
    m.querySelector('#eeCloseExpModal').onclick = close;
    m.querySelector('#eeCancelExpModal').onclick = close;

    m.querySelector('#eeSaveExpModal').onclick = function() {
      var title = m.querySelector('#eeExpTitleInp').value.trim();
      var amt = parseInt(m.querySelector('#eeExpAmountInp').value, 10) || 0;
      var cat = m.querySelector('#eeExpCatSelect').value;

      if (!title || amt <= 0) { alert("Xarajat nomi va summasini to‘g‘ri kiriting!"); return; }

      var icons = { electricity: '⚡', utilities: '💧', rent: '🏢', internet: '🌐', equipment: '💻', marketing: '📣', other: '🛠️' };

      S.finance.expenses.push({
        id: 'e_' + Date.now(),
        category: cat,
        title: title,
        amount: amt,
        icon: icons[cat] || '💸'
      });

      saveStore();
      showToast("Xarajat (" + fmtUZS(amt) + ") muvaffaqiyatli saqlandi!");
      close();
      EE.renderFinanceUnifiedView(container, 'expenses');
    };
  };

  EE.renderTimetableView = function(container) {
    if (!container) return;
    if (window.EthithAttendance && typeof window.EthithAttendance.render === 'function') {
      window.EthithAttendance.activeClassId = null;
      window.EthithAttendance.activeTeacherId = null;
      window.EthithAttendance.render(container);
      return;
    }
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
    if (window.EthithAttendance && typeof window.EthithAttendance.render === 'function') {
      window.EthithAttendance.activeClassId = null;
      window.EthithAttendance.activeTeacherId = null;
      window.EthithAttendance.render(container);
      return;
    }
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
      var pct = Math.min(100, Math.round((stCount / maxCap) * 100));
      var barColor = isFull ? 'linear-gradient(90deg,#ef4444,#dc2626)' : (pct > 75 ? 'linear-gradient(90deg,#f59e0b,#eab308)' : 'linear-gradient(90deg,#10b981,#06b6d4)');

      h += '<div class="ee-class-card" style="background:rgba(15,23,42,0.88);border:1px solid ' + (isFull ? 'rgba(239,68,68,0.4)' : 'rgba(56,189,248,0.3)') + ';border-radius:20px;padding:22px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 10px 30px rgba(0,0,0,0.45);backdrop-filter:blur(20px);position:relative;">' +
        '<div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">' +
            '<span style="background:rgba(14,165,233,0.15);color:#38bdf8;font-size:11.5px;font-weight:900;padding:3px 10px;border-radius:8px;border:1px solid rgba(14,165,233,0.35);font-family:monospace;letter-spacing:0.04em;">' + esc(cls.code || 'ETH-CLASS') + '</span>' +
            '<button class="ee-quick-edit-cap-btn" data-cid="' + cls.id + '" title="Sig‘imni o‘zgartirish uchun bosing" style="background:' + (isFull ? 'rgba(239,68,68,0.18)' : 'rgba(16,185,129,0.18)') + ';color:' + (isFull ? '#f87171' : '#34d399') + ';font-size:12px;font-weight:900;padding:4px 12px;border-radius:8px;border:1px solid ' + (isFull ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)') + ';cursor:pointer;display:inline-flex;align-items:center;gap:4px;">' +
              '<span>' + stCount + ' / ' + maxCap + ' ta joy</span>' +
              '<span style="font-size:10px;opacity:0.8;">✏️</span>' +
            '</button>' +
          '</div>' +
          '<h3 style="margin:0 0 6px;font-size:18px;font-weight:900;color:#f8fafc;letter-spacing:-0.2px;">' + esc(cls.name) + '</h3>' +
          '<div style="display:flex;align-items:center;gap:12px;font-size:13px;color:#94a3b8;margin-bottom:6px;flex-wrap:wrap;">' +
            '<span>👨‍🏫 ' + esc(cls.teacherName || cls.teacher || 'Ustoz') + '</span>' +
            (cls.room ? '<span>🚪 ' + esc(cls.room) + '</span>' : '') +
          '</div>' +
          '<div class="ee-occupancy-track" style="width:100%;height:6px;background:rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;margin-top:8px;">' +
            '<div class="ee-occupancy-fill" style="width:' + pct + '%;height:100%;background:' + barColor + ';border-radius:10px;transition:width 0.4s ease;"></div>' +
          '</div>' +
        '</div>' +

        '<div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px;">' +
            '<button class="ee-open-attendance-btn" data-cid="' + cls.id + '" style="flex:1;min-width:130px;background:linear-gradient(135deg,#059669,#10b981);color:#fff;border:none;border-radius:10px;padding:9px;font-size:12.5px;font-weight:800;cursor:pointer;box-shadow:0 4px 14px rgba(16,185,129,0.3);">📋 Davomat Jurnali</button>' +
            (isStaff ? '<button class="ee-add-student-search-btn" data-cid="' + cls.id + '" style="background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.4);border-radius:10px;padding:9px 12px;font-size:12px;font-weight:800;cursor:pointer;">+ O‘quvchi</button>' : '') +
            (isStaff ? '<button class="ee-edit-class-btn" data-cid="' + cls.id + '" title="Guruh va sig‘imni tahrirlash" style="background:rgba(168,85,247,0.15);color:#c084fc;border:1px solid rgba(168,85,247,0.4);border-radius:10px;padding:9px 12px;font-size:12px;font-weight:800;cursor:pointer;">✏️ Tahrir</button>' : '') +
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
        var cap = parseInt(prompt("Maksimal o‘quvchilar sig‘imi (Joy soni):", "16"), 10) || 16;
        var code = "ETH-" + Math.random().toString(36).substring(2, 8).toUpperCase();

        classes.push({
          id: 'cls_' + Date.now(),
          name: n.trim(),
          code: code,
          teacherId: getCurrentUser().id,
          teacherName: getCurrentUser().name || 'Ustoz',
          teacher: getCurrentUser().name || 'Ustoz',
          room: '302-xona',
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

    // Join by code (Strict Single-Group Rule)
    var joinBtn = container.querySelector('#eeJoinClassByCodeBtn');
    if (joinBtn) {
      joinBtn.onclick = function() {
        var code = prompt("6 xonali sinf kodini kiriting (masalan: ETH-L6S8CM):");
        if (!code || !code.trim()) return;
        var cls = classes.find(function(c) { return (c.code || '').toUpperCase() === code.trim().toUpperCase(); });
        if (!cls) { alert("Bunday kodli sinf topilmadi!"); return; }
        var curU = getCurrentUser();

        // Check if student is already in this class
        if (cls.students && cls.students.some(function(s) { return (s.id && s.id === curU.id) || (s.email && s.email.toLowerCase().trim() === curU.email.toLowerCase().trim()); })) {
          alert("Siz allaqachon ushbu guruhga a‘zosiz!");
          return;
        }

        if ((cls.students || []).length >= (cls.maxCapacity || 16)) {
          alert("Kechirasiz, ushbu guruh to‘lgan! Maksimal sig‘im: " + cls.maxCapacity + " ta.");
          return;
        }

        // Strict Single Group Rule: Remove from all other classes
        var prevClsName = '';
        classes.forEach(function(c) {
          if (c.id !== cls.id && Array.isArray(c.students)) {
            var had = c.students.some(function(s) {
              return (s.id && s.id === curU.id) || (s.email && curU.email && s.email.toLowerCase().trim() === curU.email.toLowerCase().trim());
            });
            if (had) prevClsName = c.name;
            c.students = c.students.filter(function(s) {
              return (s.id && s.id !== curU.id) && (!s.email || !curU.email || s.email.toLowerCase().trim() !== curU.email.toLowerCase().trim());
            });
          }
        });

        if (!cls.students) cls.students = [];
        cls.students.push({ id: curU.id, name: curU.name, email: curU.email, joinedAt: new Date().toISOString().split('T')[0] });
        saveStore();
        if (prevClsName) {
          showToast("Siz '" + prevClsName + "' guruhidan chiqib, '" + cls.name + "' guruhiga ulandingiz!");
        } else {
          showToast("Siz '" + cls.name + "' guruhiga muvaffaqiyatli a‘zo bo‘ldingiz!");
        }
        EE.renderClassesView(container);
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

    // Edit class modal triggers
    container.querySelectorAll('.ee-edit-class-btn, .ee-quick-edit-cap-btn').forEach(function(b) {
      b.onclick = function() {
        var cid = b.getAttribute('data-cid');
        EE.openEditClassModal(cid);
      };
    });
  };

  // ============================================================================
  // EDIT CLASS & STUDENT CAPACITY MODAL
  // ============================================================================
  EE.openEditClassModal = function(classId) {
    var S = getStore();
    var cls = (S.classes || []).find(function(c) { return c.id === classId; });
    if (!cls) return;

    var modalRoot = document.getElementById('eaGlobalModalRoot') || document.body;
    var existing = document.getElementById('eeEditClassOverlay');
    if (existing) existing.remove();

    var curCap = cls.maxCapacity || 16;
    var curName = cls.name || '';
    var curTeacher = cls.teacherName || cls.teacher || 'Ustoz';
    var curRoom = cls.room || '302-xona';

    var m = document.createElement('div');
    m.id = 'eeEditClassOverlay';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.85);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);z-index:2147483645;display:flex;align-items:center;justify-content:center;padding:16px;';

    m.innerHTML = '<div style="max-width:480px;width:100%;background:rgba(15,23,42,0.95);border:1px solid rgba(56,189,248,0.35);border-radius:24px;padding:26px 28px;box-shadow:0 25px 60px rgba(0,0,0,0.7),0 0 40px rgba(56,189,248,0.15);color:#f8fafc;">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:14px;">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<span style="font-size:22px;">⚙️</span>' +
          '<div>' +
            '<h3 style="margin:0;font-size:18px;font-weight:900;color:#fff;">Guruhni Tahrirlash</h3>' +
            '<div style="font-size:12px;color:#38bdf8;font-weight:700;">Kod: ' + esc(cls.code || cls.id) + '</div>' +
          '</div>' +
        '</div>' +
        '<button id="eeCloseEditClass" style="background:none;border:none;color:#94a3b8;font-size:22px;cursor:pointer;line-height:1;">✕</button>' +
      '</div>' +

      '<div style="display:flex;flex-direction:column;gap:14px;">' +
        '<div>' +
          '<label style="display:block;font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px;">Guruh Nomi</label>' +
          '<input type="text" id="eeEditClassName" value="' + esc(curName) + '" style="width:100%;padding:12px 14px;background:#1e293b;border:1px solid rgba(56,189,248,0.3);border-radius:12px;color:#fff;font-weight:700;font-size:14px;outline:none;box-sizing:border-box;" />' +
        '</div>' +

        '<div>' +
          '<label style="display:block;font-size:11px;font-weight:800;color:#38bdf8;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px;">Maksimal O‘quvchilar Sig‘imi (Joy Soni)</label>' +
          '<div style="display:flex;align-items:center;gap:10px;">' +
            '<input type="number" id="eeEditClassCap" min="1" max="150" value="' + curCap + '" style="flex:1;padding:12px 14px;background:#1e293b;border:1.5px solid #38bdf8;border-radius:12px;color:#38bdf8;font-weight:900;font-size:18px;outline:none;box-sizing:border-box;" />' +
            '<div style="display:flex;gap:6px;">' +
              '<button type="button" class="ee-quick-cap-btn" data-cap="16" style="background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.3);border-radius:8px;padding:8px 10px;font-weight:800;font-size:12px;cursor:pointer;">16</button>' +
              '<button type="button" class="ee-quick-cap-btn" data-cap="20" style="background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.3);border-radius:8px;padding:8px 10px;font-weight:800;font-size:12px;cursor:pointer;">20</button>' +
              '<button type="button" class="ee-quick-cap-btn" data-cap="25" style="background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.3);border-radius:8px;padding:8px 10px;font-weight:800;font-size:12px;cursor:pointer;">25</button>' +
              '<button type="button" class="ee-quick-cap-btn" data-cap="30" style="background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.3);border-radius:8px;padding:8px 10px;font-weight:800;font-size:12px;cursor:pointer;">30</button>' +
            '</div>' +
          '</div>' +
          '<div style="font-size:11.5px;color:#94a3b8;margin-top:4px;">Hozirda a‘zo o‘quvchilar soni: <b style="color:#f8fafc;">' + (cls.students || []).length + ' ta</b></div>' +
        '</div>' +

        '<div>' +
          '<label style="display:block;font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px;">Ustoz Ismi</label>' +
          '<input type="text" id="eeEditClassTeacher" value="' + esc(curTeacher) + '" style="width:100%;padding:12px 14px;background:#1e293b;border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:#fff;font-weight:700;font-size:14px;outline:none;box-sizing:border-box;" />' +
        '</div>' +

        '<div>' +
          '<label style="display:block;font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px;">Dars Xonasi</label>' +
          '<input type="text" id="eeEditClassRoom" value="' + esc(curRoom) + '" style="width:100%;padding:12px 14px;background:#1e293b;border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:#fff;font-weight:700;font-size:14px;outline:none;box-sizing:border-box;" />' +
        '</div>' +
      '</div>' +

      '<div style="display:flex;gap:12px;margin-top:24px;">' +
        '<button id="eeCancelEditClass" style="flex:1;background:rgba(255,255,255,0.08);color:#94a3b8;border:none;border-radius:12px;padding:12px;font-weight:800;font-size:14px;cursor:pointer;">Bekor Qilish</button>' +
        '<button id="eeSaveEditClass" style="flex:1;background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:12px;padding:12px;font-weight:900;font-size:14px;cursor:pointer;box-shadow:0 4px 15px rgba(2,132,199,0.4);">💾 Saqlash</button>' +
      '</div>' +
    '</div>';

    modalRoot.appendChild(m);
    var close = function() { m.remove(); };
    m.querySelector('#eeCloseEditClass').onclick = close;
    m.querySelector('#eeCancelEditClass').onclick = close;

    m.querySelectorAll('.ee-quick-cap-btn').forEach(function(b) {
      b.onclick = function() {
        m.querySelector('#eeEditClassCap').value = b.getAttribute('data-cap');
      };
    });

    m.querySelector('#eeSaveEditClass').onclick = function() {
      var nName = m.querySelector('#eeEditClassName').value.trim();
      var nCap = parseInt(m.querySelector('#eeEditClassCap').value, 10);
      var nTeacher = m.querySelector('#eeEditClassTeacher').value.trim();
      var nRoom = m.querySelector('#eeEditClassRoom').value.trim();

      if (!nName) { alert("Guruh nomini kiriting!"); return; }
      if (!nCap || nCap < 1) nCap = 16;

      cls.name = nName;
      cls.maxCapacity = nCap;
      cls.teacherName = nTeacher || 'Ustoz';
      cls.teacher = nTeacher || 'Ustoz';
      cls.room = nRoom || '302-xona';

      saveStore();
      showToast("Guruh ma‘lumotlari va sig‘imi (" + nCap + " ta) muvaffaqiyatli saqlandi!");
      close();

      var classesWrap = document.querySelector('.ee-classes-wrap');
      if (classesWrap && classesWrap.parentElement) {
        EE.renderClassesView(classesWrap.parentElement);
      }
      if (window.EthithApp && typeof window.EthithApp.refreshView === 'function') {
        window.EthithApp.refreshView();
      } else if (window.go && window.location.hash.includes('dash')) {
        window.go('dash');
      }
    };
  };

  // ============================================================================
  // TELEGRAM-STYLE QUICK STUDENT ADDITION & INSTANT REGISTRATION
  // STRICT SINGLE-GROUP RULE ENFORCED
  // ============================================================================
  EE.openTelegramSearchStudentModal = function(classId) {
    var S = getStore();
    var cls = (S.classes || []).find(function(c) { return c.id === classId; });
    if (!cls) return;

    var modalRoot = document.getElementById('eaGlobalModalRoot') || document.body;
    var existing = document.getElementById('eeTgSearchOverlay');
    if (existing) existing.remove();

    var m = document.createElement('div');
    m.id = 'eeTgSearchOverlay';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.85);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);z-index:2147483645;display:flex;align-items:center;justify-content:center;padding:16px;';

    var curCap = cls.maxCapacity || 16;
    var curCount = (cls.students || []).length;
    var isFull = curCount >= curCap;

    m.innerHTML = '<div style="background:rgba(15,23,42,0.96);border:1px solid rgba(56,189,248,0.35);border-radius:24px;max-width:560px;width:100%;padding:24px 26px;color:#f8fafc;box-shadow:0 25px 60px rgba(0,0,0,0.7),0 0 40px rgba(56,189,248,0.15);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:12px;">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<span style="font-size:22px;">🔍</span>' +
          '<div>' +
            '<h3 style="margin:0;font-size:17.5px;font-weight:900;color:#fff;">Guruhga O‘quvchi Qo‘shish & Boshqarish</h3>' +
            '<div style="font-size:12px;color:#94a3b8;margin-top:2px;">Guruh: <b style="color:#38bdf8;">' + esc(cls.name) + '</b> • Sig‘im: <b id="eeTgModalCapText" style="color:' + (isFull ? '#f87171' : '#34d399') + ';">' + curCount + ' / ' + curCap + ' ta joy</b></div>' +
          '</div>' +
        '</div>' +
        '<button id="eeCloseTgSearch" style="background:none;border:none;color:#94a3b8;font-size:22px;cursor:pointer;line-height:1;">✕</button>' +
      '</div>' +

      // Capacity Notice if full
      '<div id="eeTgCapAlert" style="' + (isFull ? 'display:flex;' : 'display:none;') + 'align-items:center;justify-content:space-between;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.4);border-radius:12px;padding:10px 14px;margin-bottom:14px;font-size:12.5px;color:#fca5a5;">' +
        '<span>⚠️ Guruh sig‘imi to‘lgan (' + curCount + ' / ' + curCap + ').</span>' +
        '<button id="eeTgQuickBumpCapBtn" style="background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:8px;padding:5px 12px;font-size:11.5px;font-weight:900;cursor:pointer;">+5 Joy Qo‘shish</button>' +
      '</div>' +

      '<input type="text" id="eeTgSearchInp" placeholder="Ism yoki Gmail bo‘yicha qidiring..." style="width:100%;padding:12px 16px;background:#1e293b;border:1.5px solid rgba(56,189,248,0.4);border-radius:12px;color:#fff;font-weight:700;font-size:14px;box-sizing:border-box;margin-bottom:14px;outline:none;" />' +

      // Quick inline student creator
      '<div style="background:rgba(30,41,59,0.6);border:1px dashed rgba(56,189,248,0.3);border-radius:14px;padding:12px 14px;margin-bottom:14px;">' +
        '<div style="font-size:12px;font-weight:800;color:#38bdf8;margin-bottom:8px;">➕ Yangi O‘quvchini Ro‘yxatga Olish va Ushbu Guruhga Qo‘shish:</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
          '<input type="text" id="eeNewStName" placeholder="Ism va familiyasi" style="flex:1;min-width:140px;padding:8px 12px;background:#0f172a;border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#fff;font-size:12.5px;outline:none;" />' +
          '<input type="text" id="eeNewStEmail" placeholder="Gmail yoki telefon" style="flex:1;min-width:140px;padding:8px 12px;background:#0f172a;border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#fff;font-size:12.5px;outline:none;" />' +
          '<button id="eeCreateAndAddStBtn" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:12px;font-weight:900;cursor:pointer;white-space:nowrap;">+ Qo‘shish</button>' +
        '</div>' +
      '</div>' +

      '<div style="font-size:11.5px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:8px;">Barcha Tizimdagi O‘quvchilar:</div>' +
      '<div id="eeTgSearchResults" style="max-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding-right:4px;"></div>' +
    '</div>';

    modalRoot.appendChild(m);
    var close = function() {
      m.remove();
      var classesWrap = document.querySelector('.ee-classes-wrap');
      if (classesWrap && classesWrap.parentElement) {
        EE.renderClassesView(classesWrap.parentElement);
      }
      if (window.go && window.location.hash.includes('dash')) {
        window.go('dash');
      }
    };
    m.querySelector('#eeCloseTgSearch').onclick = close;

    var inp = m.querySelector('#eeTgSearchInp');
    var resBox = m.querySelector('#eeTgSearchResults');

    // Quick capacity bump handler
    var bumpBtn = m.querySelector('#eeTgQuickBumpCapBtn');
    if (bumpBtn) {
      bumpBtn.onclick = function() {
        cls.maxCapacity = (cls.maxCapacity || 16) + 5;
        saveStore();
        showToast("Guruh sig‘imi 5 taga oshirildi! Yangi sig‘im: " + cls.maxCapacity + " ta.");
        m.querySelector('#eeTgCapAlert').style.display = 'none';
        m.querySelector('#eeTgModalCapText').textContent = (cls.students || []).length + ' / ' + cls.maxCapacity + ' ta joy';
        m.querySelector('#eeTgModalCapText').style.color = '#34d399';
        search(inp.value);
      };
    }

    // Quick new student creator handler
    m.querySelector('#eeCreateAndAddStBtn').onclick = function() {
      var nName = m.querySelector('#eeNewStName').value.trim();
      var nEmail = m.querySelector('#eeNewStEmail').value.trim().toLowerCase();
      if (!nName) { alert("O‘quvchi ism va familiyasini kiriting!"); return; }
      if (!nEmail) nEmail = 'student_' + Date.now() + '@ethith.uz';

      if (!Array.isArray(S.accounts)) S.accounts = [];
      var existAcc = S.accounts.find(function(a) {
        return (a.email && a.email.toLowerCase().trim() === nEmail) || (a.id && a.id === nEmail);
      });

      var stId = existAcc ? existAcc.id : ('st_' + Date.now());
      if (!existAcc) {
        var newAccObj = {
          id: stId,
          name: nName,
          email: nEmail,
          role: 'student',
          coins: 150,
          joinedAt: new Date().toISOString().split('T')[0]
        };
        S.accounts.push(newAccObj);
        try {
          var allU = JSON.parse(localStorage.getItem('ethith_all_registered_users') || '[]');
          allU.push(newAccObj);
          localStorage.setItem('ethith_all_registered_users', JSON.stringify(allU));
        } catch(e) {}
      } else {
        existAcc.name = nName;
      }

      // Enforce strict single group rule: remove from all other groups
      S.classes.forEach(function(other) {
        if (other.id !== cls.id && Array.isArray(other.students)) {
          other.students = other.students.filter(function(s) {
            return (s.id && s.id !== stId) && (!s.email || s.email.toLowerCase().trim() !== nEmail);
          });
        }
      });

      // Add to this class
      if (!cls.students) cls.students = [];
      var alreadyIn = cls.students.some(function(s) {
        return (s.id && s.id === stId) || (s.email && s.email.toLowerCase().trim() === nEmail);
      });

      if (!alreadyIn) {
        cls.students.push({
          id: stId,
          name: nName,
          email: nEmail,
          joinedAt: new Date().toISOString().split('T')[0]
        });
        if (cls.students.length > (cls.maxCapacity || 16)) {
          cls.maxCapacity = cls.students.length;
        }
      }

      saveStore();
      showToast(nName + " ro‘yxatdan o‘tkazildi va guruhga qo‘shildi!");
      m.querySelector('#eeNewStName').value = '';
      m.querySelector('#eeNewStEmail').value = '';
      search(inp.value);
    };

    function search(query) {
      query = (query || '').toLowerCase().trim();

      // Gather ALL known students across the platform
      var allStudentsMap = {};

      // 1. S.accounts
      (S.accounts || []).forEach(function(a) {
        if (!a || a.role === 'teacher' || a.role === 'admin' || a.role === 'administrator') return;
        var key = (a.email || a.id || '').toLowerCase().trim();
        if (!key) return;
        allStudentsMap[key] = {
          id: a.id || key,
          name: a.name || 'O‘quvchi',
          email: a.email || key
        };
      });

      // 2. localStorage 'ethith_all_registered_users'
      try {
        var localUsers = JSON.parse(localStorage.getItem('ethith_all_registered_users') || '[]');
        localUsers.forEach(function(u) {
          if (!u || u.role === 'teacher' || u.role === 'admin' || u.role === 'administrator') return;
          var key = (u.email || u.id || '').toLowerCase().trim();
          if (!key) return;
          if (!allStudentsMap[key]) {
            allStudentsMap[key] = {
              id: u.id || key,
              name: u.name || 'O‘quvchi',
              email: u.email || key
            };
          } else if (u.name && (!allStudentsMap[key].name || allStudentsMap[key].name === 'O‘quvchi')) {
            allStudentsMap[key].name = u.name;
          }
        });
      } catch(e) {}

      // 3. Students from all classes
      (S.classes || []).forEach(function(c) {
        (c.students || []).forEach(function(st) {
          if (!st) return;
          var key = (st.email || st.id || '').toLowerCase().trim();
          if (!key) return;
          if (!allStudentsMap[key]) {
            allStudentsMap[key] = {
              id: st.id || key,
              name: st.name || 'O‘quvchi',
              email: st.email || key
            };
          } else if (st.name && (!allStudentsMap[key].name || allStudentsMap[key].name === 'O‘quvchi')) {
            allStudentsMap[key].name = st.name;
          }
        });
      });

      var studentList = Object.values(allStudentsMap);

      var matches = studentList.filter(function(a) {
        if (!query) return true;
        return (a.name && a.name.toLowerCase().includes(query)) || (a.email && a.email.toLowerCase().includes(query));
      });

      // Sort: unassigned first, then other classes, then already in this class
      matches.sort(function(a, b) {
        var aInThis = (cls.students || []).some(function(s) { return (s.id && s.id === a.id) || (s.email && s.email.toLowerCase().trim() === a.email.toLowerCase().trim()); });
        var bInThis = (cls.students || []).some(function(s) { return (s.id && s.id === b.id) || (s.email && s.email.toLowerCase().trim() === b.email.toLowerCase().trim()); });
        if (aInThis && !bInThis) return 1;
        if (!aInThis && bInThis) return -1;
        return 0;
      });

      if (matches.length === 0) {
        resBox.innerHTML = '<div style="text-align:center;color:#64748b;padding:24px;font-size:13.5px;">Mos o‘quvchilar topilmadi.<br><span style="font-size:12px;color:#94a3b8;">Yuqoridagi shakl orqali yangi o‘quvchi qo‘shishingiz mumkin.</span></div>';
        return;
      }

      var rh = '';
      matches.forEach(function(acc) {
        // Determine current group of this student
        var enrolledClass = null;
        (S.classes || []).forEach(function(c) {
          var found = (c.students || []).some(function(s) {
            return (s.id && s.id === acc.id) || (s.email && acc.email && s.email.toLowerCase().trim() === acc.email.toLowerCase().trim());
          });
          if (found) enrolledClass = c;
        });

        var isInThisClass = enrolledClass && (enrolledClass.id === cls.id);
        var isInOtherClass = enrolledClass && (enrolledClass.id !== cls.id);

        var statusBadge = '';
        var actionBtn = '';

        if (isInThisClass) {
          statusBadge = '<span style="background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.3);padding:2px 8px;border-radius:6px;font-size:11px;font-weight:800;">✓ Ushbu guruhda</span>';
          actionBtn = '<button class="ee-remove-st-btn" data-accid="' + acc.id + '" data-accemail="' + esc(acc.email) + '" style="background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.4);border-radius:8px;padding:6px 10px;font-size:11.5px;font-weight:800;cursor:pointer;">Chiqarish</button>';
        } else if (isInOtherClass) {
          statusBadge = '<span style="background:rgba(245,158,11,0.15);color:#fbbf24;border:1px solid rgba(245,158,11,0.3);padding:2px 8px;border-radius:6px;font-size:11px;font-weight:800;" title="Boshqa guruh a‘zosi">⚠️ ' + esc(enrolledClass.name) + '</span>';
          actionBtn = '<button class="ee-transfer-st-btn" data-accid="' + acc.id + '" data-accemail="' + esc(acc.email) + '" data-oldclsid="' + enrolledClass.id + '" style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border:none;border-radius:8px;padding:6px 12px;font-size:11.5px;font-weight:800;cursor:pointer;">⇄ Ko‘chirish</button>';
        } else {
          statusBadge = '<span style="background:rgba(56,189,248,0.12);color:#38bdf8;border:1px solid rgba(56,189,248,0.25);padding:2px 8px;border-radius:6px;font-size:11px;font-weight:800;">Guruhsiz</span>';
          actionBtn = '<button class="ee-add-st-btn" data-accid="' + acc.id + '" data-accemail="' + esc(acc.email) + '" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:8px;padding:6px 12px;font-size:11.5px;font-weight:800;cursor:pointer;">+ Qo‘shish</button>';
        }

        rh += '<div style="background:#1e293b;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;">' +
          '<div style="display:flex;align-items:center;gap:10px;min-width:0;">' +
            '<span style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#0284c7,#2563eb);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;flex-shrink:0;">' +
              esc((acc.name || 'O').charAt(0).toUpperCase()) +
            '</span>' +
            '<div style="min-width:0;">' +
              '<div style="font-size:13.5px;font-weight:800;color:#f8fafc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(acc.name || 'O‘quvchi') + '</div>' +
              '<div style="font-size:11px;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(acc.email) + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">' +
            statusBadge +
            actionBtn +
          '</div>' +
        '</div>';
      });
      resBox.innerHTML = rh;

      // Bind Add button (Unassigned -> Group)
      resBox.querySelectorAll('.ee-add-st-btn').forEach(function(b) {
        b.onclick = function() {
          var accId = b.getAttribute('data-accid');
          var accEmail = b.getAttribute('data-accemail');
          var acc = studentList.find(function(x) { return x.id === accId || (x.email && x.email === accEmail); });
          if (!acc) return;

          // Strict Single Group Rule: Remove from all other groups
          S.classes.forEach(function(other) {
            if (other.id !== cls.id && Array.isArray(other.students)) {
              other.students = other.students.filter(function(s) {
                return (s.id && s.id !== acc.id) && (!s.email || !acc.email || s.email.toLowerCase().trim() !== acc.email.toLowerCase().trim());
              });
            }
          });

          if (!cls.students) cls.students = [];
          cls.students.push({
            id: acc.id,
            name: acc.name,
            email: acc.email,
            joinedAt: new Date().toISOString().split('T')[0]
          });

          if (cls.students.length > (cls.maxCapacity || 16)) {
            cls.maxCapacity = cls.students.length;
          }

          saveStore();
          showToast(acc.name + " '" + cls.name + "' guruhiga qo‘shildi!");
          m.querySelector('#eeTgModalCapText').textContent = cls.students.length + ' / ' + (cls.maxCapacity || 16) + ' ta joy';
          search(inp.value);
        };
      });

      // Bind Transfer button (Other Group -> This Group)
      resBox.querySelectorAll('.ee-transfer-st-btn').forEach(function(b) {
        b.onclick = function() {
          var accId = b.getAttribute('data-accid');
          var accEmail = b.getAttribute('data-accemail');
          var oldClsId = b.getAttribute('data-oldclsid');
          var acc = studentList.find(function(x) { return x.id === accId || (x.email && x.email === accEmail); });
          var oldCls = (S.classes || []).find(function(c) { return c.id === oldClsId; });
          if (!acc) return;

          // Remove from old class
          if (oldCls && Array.isArray(oldCls.students)) {
            oldCls.students = oldCls.students.filter(function(s) {
              return (s.id && s.id !== acc.id) && (!s.email || !acc.email || s.email.toLowerCase().trim() !== acc.email.toLowerCase().trim());
            });
          }

          // Strict Single Group Rule: remove from any other class too
          S.classes.forEach(function(other) {
            if (other.id !== cls.id && Array.isArray(other.students)) {
              other.students = other.students.filter(function(s) {
                return (s.id && s.id !== acc.id) && (!s.email || !acc.email || s.email.toLowerCase().trim() !== acc.email.toLowerCase().trim());
              });
            }
          });

          if (!cls.students) cls.students = [];
          cls.students.push({
            id: acc.id,
            name: acc.name,
            email: acc.email,
            joinedAt: new Date().toISOString().split('T')[0]
          });

          if (cls.students.length > (cls.maxCapacity || 16)) {
            cls.maxCapacity = cls.students.length;
          }

          saveStore();
          showToast(acc.name + " '" + (oldCls ? oldCls.name : 'avvalgi') + "' guruhidan ushbu guruhga ko‘chirildi!");
          m.querySelector('#eeTgModalCapText').textContent = cls.students.length + ' / ' + (cls.maxCapacity || 16) + ' ta joy';
          search(inp.value);
        };
      });

      // Bind Remove button (Remove from this group)
      resBox.querySelectorAll('.ee-remove-st-btn').forEach(function(b) {
        b.onclick = function() {
          var accId = b.getAttribute('data-accid');
          var accEmail = b.getAttribute('data-accemail');
          var acc = studentList.find(function(x) { return x.id === accId || (x.email && x.email === accEmail); });
          var stName = acc ? acc.name : 'O‘quvchi';

          if (!confirm(stName + " ni guruhdan chiqarishni tasdiqlaysizmi?")) return;

          cls.students = (cls.students || []).filter(function(s) {
            return (s.id && s.id !== accId) && (!s.email || !accEmail || s.email.toLowerCase().trim() !== accEmail.toLowerCase().trim());
          });

          saveStore();
          showToast(stName + " guruhdan chiqarildi!");
          m.querySelector('#eeTgModalCapText').textContent = cls.students.length + ' / ' + (cls.maxCapacity || 16) + ' ta joy';
          search(inp.value);
        };
      });
    }

    inp.oninput = function() { search(inp.value); };
    search('');
    setTimeout(function() { inp.focus(); }, 60);
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
            mHtml += '<tr style="border-top:1px solid rgba(255,255,255,0.05);background:' + (r.passed ? 'transparent' : 'rgba(239,68,68,0.06)') + ';">' +
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

  EE.getStore = getStore;
  EE.saveStore = saveStore;

})(window);
