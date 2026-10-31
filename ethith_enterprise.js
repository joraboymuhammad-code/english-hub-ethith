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
// ============================================================================
// GLOBAL STRICT ZERO-FINANCE ENFORCEMENT ON SCRIPT LOAD
// (Eradicates any leftover paid cache from previous sessions until admin starts live)
// ============================================================================
(function globalZeroFinanceEnforceImmediate() {
  try {
    var storageKeys = ['ethith_state', 'ETHITH_SHARED_STORE', 'ETHITH_ENTERPRISE_STORE_V4', 'ethith_attendance_store'];
    storageKeys.forEach(function(k) {
      try {
        var str = localStorage.getItem(k);
        if (str) {
          var data = JSON.parse(str);
          var clsArr = [];
          if (Array.isArray(data.classes)) clsArr = data.classes;
          else if (data.classes && typeof data.classes === 'object') clsArr = Object.values(data.classes);

          clsArr.forEach(function(c) {
            if (c) {
              if (c.studentPayments) {
                for (var sid in c.studentPayments) {
                  c.studentPayments[sid] = { fee: 300000, paid: 0, status: 'unpaid', method: '—', date: 'To‘lanmagan' };
                }
              }
              // Reset any seeded fake students back to tester_1..tester_18
              if (Array.isArray(c.students)) {
                c.students = c.students.filter(function(st) {
                  return st && st.manuallyEnrolled === true && !st.isTester && st.name && !st.name.toLowerCase().startsWith('tester_');
                });
                var curIdx = 1;
                while (c.students.length < 18) {
                  var slotName = 'tester_' + curIdx;
                  while (c.students.some(function(s) { return s.name === slotName; })) {
                    curIdx++;
                    slotName = 'tester_' + curIdx;
                  }
                  c.students.push({
                    id: c.id + '_std_' + curIdx,
                    name: slotName,
                    email: c.id + '_std_' + curIdx + '@ethith.uz',
                    role: 'student',
                    phone: '',
                    parentPhone: '',
                    login: '',
                    password: '',
                    joinedAt: '2026-10-28',
                    dailyMinutes: 0,
                    coins: 0,
                    isTester: true,
                    isOnline: false,
                    lastLogin: null
                  });
                  curIdx++;
                }
              }
            }
          });

          if (data.finance) {
            data.finance.totalRevenue = 0;
            data.finance.totalCollected = 0;
            data.finance.totalPaid = 0;
            data.finance.totalExpenses = 0;
            data.finance.totalReceivables = 0;
            data.finance.netProfit = 0;
            data.finance.studentFees = {};
            data.finance.expenses = [];
          }
          if (Array.isArray(data.accounts)) {
            data.accounts = data.accounts.filter(function(a) {
              return a.role === 'admin' || a.role === 'teacher' || a.role === 'superadmin';
            });
          }
          localStorage.setItem(k, JSON.stringify(data));
        }
      } catch(e) {}
    });

    // Also reset in active memory objects
    var memStores = [window.S, window.ETHITH_INITIAL_STORE, (window.EthithApp && window.EthithApp.state)];
    memStores.forEach(function(st) {
      if (!st) return;
      var cArr = [];
      if (Array.isArray(st.classes)) cArr = st.classes;
      else if (st.classes && typeof st.classes === 'object') cArr = Object.values(st.classes);

      cArr.forEach(function(c) {
        if (c && c.studentPayments) {
          for (var sid in c.studentPayments) {
            c.studentPayments[sid] = { fee: 300000, paid: 0, status: 'unpaid', method: '—', date: 'To‘lanmagan' };
          }
        }
      });

      if (st.finance) {
        st.finance.totalRevenue = 0;
        st.finance.totalCollected = 0;
        st.finance.totalPaid = 0;
        st.finance.totalExpenses = 0;
        st.finance.netProfit = 0;
        st.finance.studentFees = {};
        st.finance.expenses = [];
      }
    });
  } catch(err) {
    console.error('Zero finance enforce error:', err);
  }
})();

  'use strict';

  var EE = {};
  window.EthithEnterprise = EE;

  // Local Cache & Store Pointer
  var _store = null;

  function getStore() {
    var appState = (window.EthithApp && window.EthithApp.state) || {};
    if (window.ETHITH_INITIAL_STORE) {
      if ((!appState.teachers || appState.teachers.length === 0) && Array.isArray(window.ETHITH_INITIAL_STORE.teachers)) {
        appState.teachers = JSON.parse(JSON.stringify(window.ETHITH_INITIAL_STORE.teachers));
      }
      if ((!appState.classes || appState.classes.length === 0) && Array.isArray(window.ETHITH_INITIAL_STORE.classes)) {
        appState.classes = JSON.parse(JSON.stringify(window.ETHITH_INITIAL_STORE.classes));
      }
    }
    if (!appState.centerSettings) {
      appState.centerSettings = { card: "8600 4912 7731 9024", cardHolder: "ETHITH LEARNING CENTER", baseTuition: 200000, currency: "UZS" };
    }
    if (!appState.teachers || appState.teachers.length === 0) {
      appState.teachers = (window.EA && window.EA.getStoreTeachers ? window.EA.getStoreTeachers() : []);
    }
    // Overlay permanent teacher settings (salarySharePercent, unpaidMonths, paidThisMonth)
    try {
      var tSavedMap = JSON.parse(localStorage.getItem('ethith_teacher_settings') || '{}');
      if (Array.isArray(appState.teachers)) {
        appState.teachers.forEach(function(t) {
          if (tSavedMap[t.id]) {
            if (tSavedMap[t.id].salarySharePercent !== undefined) t.salarySharePercent = tSavedMap[t.id].salarySharePercent;
            if (tSavedMap[t.id].teachingHours !== undefined) t.teachingHours = tSavedMap[t.id].teachingHours;
            if (tSavedMap[t.id].hourlyRate !== undefined) t.hourlyRate = tSavedMap[t.id].hourlyRate;
            if (tSavedMap[t.id].unpaidMonths !== undefined) t.unpaidMonths = tSavedMap[t.id].unpaidMonths;
            if (tSavedMap[t.id].paidThisMonth !== undefined) t.paidThisMonth = tSavedMap[t.id].paidThisMonth;
          } else {
            if (t.paidThisMonth === undefined) t.paidThisMonth = false;
            if (t.unpaidMonths === undefined) t.unpaidMonths = 0;
            if (t.salarySharePercent === undefined) t.salarySharePercent = 50;
          }
        });
      }
    } catch(e) {}
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
        { id: "tt_1", time: "08:00 - 09:30", days: "Du-Chor-Jum", teacherId: "t_urolov_azizbek", teacherName: "Azizbek Urolov", classId: "cls_urolov_azizbek_upper", className: "Upper-Intermediate", room: "Room 101 (Green Room)" },
        { id: "tt_2", time: "10:00 - 11:30", days: "Du-Chor-Jum", teacherId: "t_ravshanov_doniyor", teacherName: "Ravshanov Doniyor", classId: "cls_ravshanov_doniyor_cefr_1", className: "CEFR_1", room: "Room 102 (Blue Room)" },
        { id: "tt_3", time: "14:00 - 15:30", days: "Se-Pay-Shan", teacherId: "t_urolov_azizbek", teacherName: "Azizbek Urolov", classId: "cls_urolov_azizbek_standard", className: "Standard", room: "Room 101 (Green Room)" },
        { id: "tt_4", time: "16:00 - 17:30", days: "Se-Pay-Shan", teacherId: "t_ravshanov_doniyor", teacherName: "Ravshanov Doniyor", classId: "cls_ravshanov_doniyor_cefr_2", className: "CEFR_2", room: "Room 102 (Blue Room)" }
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
    if (!appState.customCurriculumTests) {
      appState.customCurriculumTests = {};
      try {
        var localC = localStorage.getItem('ethith_custom_curriculum_tests');
        if (localC) appState.customCurriculumTests = JSON.parse(localC);
      } catch(e) {}
      if (window.ETHITH_INITIAL_STORE && window.ETHITH_INITIAL_STORE.customCurriculumTests) {
        Object.assign(appState.customCurriculumTests, window.ETHITH_INITIAL_STORE.customCurriculumTests);
      }
    }
    return appState;
  }

  function saveStore() {
    var st = getStore();
    try {
      localStorage.setItem('ethith_enterprise_store', JSON.stringify(st));
      if (st.customCurriculumTests) {
        localStorage.setItem('ethith_custom_curriculum_tests', JSON.stringify(st.customCurriculumTests));
      }
    } catch(e) {}

    // 1. In-memory & LocalStorage instant update (0.01ms - 0.05ms)
    if (window.EthithApp && window.EthithApp.state) {
      if (st.finance) window.EthithApp.state.finance = st.finance;
      if (st.teachers) window.EthithApp.state.teachers = st.teachers;
      if (st.classes) window.EthithApp.state.classes = st.classes;
      if (st.customCurriculumTests) window.EthithApp.state.customCurriculumTests = st.customCurriculumTests;
      if (typeof window.EthithApp.saveState === 'function') {
        window.EthithApp.saveState();
      }
    }
    // 2. Cross-tab real-time BroadcastChannel relay (0.1ms)
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        if (!window._eeChannel) window._eeChannel = new BroadcastChannel('ethith_cloud_channel');
        window._eeChannel.postMessage({ type: 'ENTERPRISE_SYNC', state: st });
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
    if (window.S && window.S.user) {
      return window.S.user;
    }
    return null;
  }

  function isAdminOrTeacher() {
    var u = getCurrentUser();
    return u && (u.role === 'teacher' || u.role === 'admin');
  }

  function isTeacher() {
    var u = getCurrentUser();
    return u && (u.role === 'teacher');
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
    var curUser = getCurrentUser();
    var isAdmin = curUser && (curUser.role === 'admin' || (curUser.email && curUser.email.toLowerCase().includes('admin')));
    var selectedFolderId = null;

    // Ensure system root folder exists
    if (!fe.folders.find(function(f) { return f.id === 'f_root'; })) {
      fe.folders.unshift({ id: 'f_root', name: 'Bosh Papka', parentId: null, createdAt: Date.now() });
      saveStore();
    }

    // Teacher Workspace Isolation ("alohida alohida uy kabi boshqa boshqa bo'lsin"):
    var userRootId = 'f_root';
    if (!isAdmin && curUser && curUser.role === 'teacher') {
      userRootId = 'f_root_' + curUser.id;
      var tRoot = fe.folders.find(function(f) { return f.id === userRootId; });
      if (!tRoot) {
        tRoot = {
          id: userRootId,
          name: (curUser.name || 'Ustoz') + ' (Shaxsiy Papka)',
          ownerId: curUser.id,
          parentId: null,
          createdAt: Date.now()
        };
        fe.folders.push(tRoot);
        saveStore();
      }
      if (currentFolderId === 'f_root') {
        currentFolderId = userRootId;
      } else {
        var curFCheck = fe.folders.find(function(f) { return f.id === currentFolderId; });
        if (!curFCheck || (curFCheck.ownerId && curFCheck.ownerId !== curUser.id)) {
          currentFolderId = userRootId;
        }
      }
    }

    var curFolder = fe.folders.find(function(f) { return f.id === currentFolderId; }) || fe.folders.find(function(f) { return f.id === userRootId; }) || fe.folders[0];

    // Compute breadcrumb path
    var breadcrumbs = [];
    var fIter = curFolder;
    while (fIter) {
      breadcrumbs.unshift(fIter);
      if (!isAdmin && fIter.id === userRootId) break;
      if (!fIter.parentId) break;
      fIter = fe.folders.find(function(f) { return f.id === fIter.parentId; });
    }

    // Student's Teachers Identification
    var myTeacherIds = [];
    if (curUser && curUser.role === 'student') {
      (S.classes || []).forEach(function(cls) {
        var inClass = (cls.students || []).some(function(s) {
          return s.id === curUser.id || s.email === curUser.email || (curUser.phone && s.phone === curUser.phone);
        });
        if (inClass && cls.teacherId) {
          myTeacherIds.push(cls.teacherId);
        }
      });
    }

    // Filter contents by current folder and search
    var subFolders = fe.folders.filter(function(f) {
      if (f.id === 'f_root' || f.id === userRootId || (f.id.indexOf('f_root_') === 0 && !isAdmin)) return false;
      if (!isAdmin && curUser && curUser.role === 'teacher') {
        if (f.ownerId && f.ownerId !== curUser.id) return false;
      }
      if (curUser && curUser.role === 'student') {
        if (myTeacherIds.length === 0) return false;
        if (f.ownerId && !myTeacherIds.includes(f.ownerId)) return false;
      }
      return f.parentId === curFolder.id;
    });
    var subTests = fe.tests.filter(function(t) {
      if (!isAdmin && curUser && curUser.role === 'teacher') {
        var isOwner = (t.authorId === curUser.id || t.teacherId === curUser.id || t.creatorId === curUser.id);
        if (!isOwner) return false;
      }
      if (curUser && curUser.role === 'student') {
        if (myTeacherIds.length === 0) return false;
        var belongsToMyTeacher = myTeacherIds.includes(t.authorId) || myTeacherIds.includes(t.teacherId) || myTeacherIds.includes(t.creatorId);
        if (!belongsToMyTeacher) return false;
      }
      return (t.folderId || userRootId) === curFolder.id;
    });

    if (explorerSearchQuery.trim()) {
      var q = explorerSearchQuery.toLowerCase().trim();
      subFolders = fe.folders.filter(function(f) {
        if (f.id === 'f_root' || f.id === userRootId || (f.id.indexOf('f_root_') === 0 && !isAdmin)) return false;
        if (!isAdmin && curUser && curUser.role === 'teacher') {
          if (f.ownerId !== curUser.id) return false;
        }
        if (curUser && curUser.role === 'student') {
          if (myTeacherIds.length === 0) return false;
          if (f.ownerId && !myTeacherIds.includes(f.ownerId)) return false;
        }
        return f.name.toLowerCase().includes(q);
      });
      subTests = fe.tests.filter(function(t) {
        if (!isAdmin && curUser && curUser.role === 'teacher') {
          var isOwner = (t.authorId === curUser.id || t.teacherId === curUser.id || t.creatorId === curUser.id);
          if (!isOwner) return false;
        }
        if (curUser && curUser.role === 'student') {
          if (myTeacherIds.length === 0) return false;
          var belongsToMyTeacher = myTeacherIds.includes(t.authorId) || myTeacherIds.includes(t.teacherId) || myTeacherIds.includes(t.creatorId);
          if (!belongsToMyTeacher) return false;
        }
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
        var curU = getCurrentUser();
        fe.folders.push({
          id: newFid,
          name: "Yangi Papka",
          parentId: currentFolderId,
          ownerId: curU.id,
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
        var curU = getCurrentUser();
        S.fileExplorer.folders.push({
          id: 'f_' + Date.now(),
          name: n.trim(),
          parentId: folderId,
          ownerId: curU.id,
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
  EE.openVisualTestBuilderModal = function(container, folderId, prefillTest, curriculumContext) {
    var modalRoot = document.getElementById('eaGlobalModalRoot') || document.body;
    var randCode = (prefillTest && prefillTest.id) ? prefillTest.id : ('TST-' + Math.random().toString(36).substring(2, 6).toUpperCase() + Math.floor(Math.random() * 9 + 1));

    var m = document.createElement('div');
    m.id = 'eeVisualBuilderOverlay';
    m.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;background:#070b14;z-index:2147483640;display:flex;flex-direction:column;overflow:hidden;margin:0;padding:0;box-sizing:border-box;color:#f8fafc;font-family:system-ui,-apple-system,sans-serif;';

    var defaultSvg = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200"><rect width="100%" height="100%" fill="#ffffff"/><rect x="40" y="40" width="820" height="1120" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/><text x="70" y="100" font-family="sans-serif" font-weight="900" font-size="28" fill="#0f172a">ETHITH ENGLISH TEST SHEET</text><text x="70" y="135" font-family="sans-serif" font-weight="600" font-size="16" fill="#64748b">Exercise 1: Read the sentences and fill in the missing grammar forms</text><line x1="70" y1="155" x2="830" y2="155" stroke="#cbd5e1" stroke-width="1.5"/><text x="70" y="210" font-family="sans-serif" font-size="17" fill="#334155">1. By the time Sarah arrived, the train _________________ (already / leave).</text><text x="70" y="270" font-family="sans-serif" font-size="17" fill="#334155">2. If you study diligently every day, you _________________ (pass) the IELTS exam.</text><text x="70" y="330" font-family="sans-serif" font-size="17" fill="#334155">3. Neither John nor his friends _________________ (be) aware of the changes.</text><text x="70" y="390" font-family="sans-serif" font-size="17" fill="#334155">4. The CEO demanded that the report _________________ (submit) before noon.</text><text x="70" y="450" font-family="sans-serif" font-size="17" fill="#334155">5. I wish I _________________ (know) the truth earlier!</text><text x="70" y="520" font-family="sans-serif" font-weight="700" font-size="18" fill="#0f172a">Exercise 2: Choose the correct preposition or connector</text><line x1="70" y1="540" x2="830" y2="540" stroke="#cbd5e1" stroke-width="1.5"/><text x="70" y="590" font-family="sans-serif" font-size="17" fill="#334155">6. She is extremely passionate [ about / with / for ] environmental protection.</text><text x="70" y="650" font-family="sans-serif" font-size="17" fill="#334155">7. Despite [ of the rain / the heavy rain / it was raining ], the match continued.</text><text x="70" y="710" font-family="sans-serif" font-size="17" fill="#334155">8. We arrived at the venue just [ in / on / at ] time for the opening speech.</text></svg>');

    // Array of pages: [ { pageNum: 1, imageUrl: '...', elements: [] }, ... ]
    var pagesData = (prefillTest && prefillTest.pages && prefillTest.pages.length > 0) ?
      JSON.parse(JSON.stringify(prefillTest.pages)) :
      [ { pageNum: 1, imageUrl: defaultSvg, elements: [] } ];

    var currentWidthPx = Math.min(1000, Math.max(760, Math.floor((window.innerWidth || 1000) * 0.94)));
    var activeTool = 'draw'; // 'draw' | 'lasso'
    var selectedPinKeys = new Set(); // set of "pIndex_elIndex"
    var uploadedAudio = (prefillTest && prefillTest.audioUrl) ?
      { url: prefillTest.audioUrl, name: prefillTest.audioName || 'audio.mp3', size: 0, limit: prefillTest.audioLimit || 2 } :
      null;

    var prefillTitle = (curriculumContext && curriculumContext.title) || (prefillTest ? prefillTest.title : '');
    var prefillAttempts = (prefillTest && prefillTest.maxAttempts) || 1;

    m.innerHTML = '' +
      // Topbar
      '<div style="height:64px;padding:0 16px;background:#0f172a;border-bottom:1px solid rgba(56,189,248,0.25);display:flex;align-items:center;justify-content:space-between;gap:10px;box-shadow:0 4px 20px rgba(0,0,0,0.5);flex-shrink:0;z-index:50;flex-wrap:wrap;">' +
        '<div style="display:flex;align-items:center;gap:10px;max-width:380px;flex:1;">' +
          '<div style="font-size:22px;line-height:1;">🎨</div>' +
          '<input type="text" id="eeVisualTitle" placeholder="Test Nomi (masalan: Unit 1 Test B2)" value="' + esc(prefillTitle) + '" style="width:100%;padding:7px 12px;background:#1e293b;border:1.5px solid rgba(56,189,248,0.3);border-radius:10px;color:#fff;font-weight:800;font-size:13px;outline:none;" />' +
          (curriculumContext ? '<span style="background:rgba(56,189,248,0.18);border:1px solid #38bdf8;padding:4px 8px;border-radius:8px;font-size:10.5px;font-weight:900;color:#38bdf8;white-space:nowrap;">Oxford</span>' : '') +
          '<div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">' +
            '<span style="font-size:11px;color:#94a3b8;font-weight:700;">Urinish:</span>' +
            '<input type="number" id="eeVisualAttempts" min="1" max="50" value="' + prefillAttempts + '" style="width:46px;padding:5px;background:#1e293b;border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;font-weight:900;font-size:12px;text-align:center;outline:none;" title="O‘quvchi necha marta ishlay oladi" />' +
          '</div>' +
        '</div>' +

        // Center Tools & Audio
        '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
          // Tool Toggle: Draw vs Lasso Selection
          '<div style="display:flex;align-items:center;gap:2px;background:#1e293b;padding:3px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);">' +
            '<button id="eeToolDrawBtn" style="background:#0284c7;border:none;color:#fff;padding:5px 10px;border-radius:7px;font-size:11.5px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Katakcha chizish rejimi">✏️ Chizish</button>' +
            '<button id="eeToolLassoBtn" style="background:transparent;border:none;color:#94a3b8;padding:5px 10px;border-radius:7px;font-size:11.5px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:4px;" title="Sichqoncha bilan to‘rtburchak tortib belgilash (Lasso)">📐 Lasso Tanlash</button>' +
          '</div>' +

          // Audio Upload (Max 25MB)
          '<label id="eeAudioUploadBtn" style="background:linear-gradient(135deg,rgba(168,85,247,0.2),rgba(147,51,234,0.2));color:#c084fc;border:1.5px solid #a855f7;padding:6px 12px;border-radius:10px;font-size:12px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 0 10px rgba(168,85,247,0.2);" title="Maksimal 25 MB audio fayl">' +
            '🎧 Listening Yuklash (Maks 25MB) <input type="file" id="eeAudioFileInput" accept="audio/*" style="display:none;" />' +
          '</label>' +

          // Audio Limit (Necha marta eshita oladi)
          '<div style="display:flex;align-items:center;gap:4px;background:#1e293b;padding:4px 8px;border-radius:10px;border:1px solid rgba(168,85,247,0.4);" title="O‘quvchi ushbu audioni necha marta eshita olishini belgilash">' +
            '<span style="font-size:11px;color:#c084fc;font-weight:800;">Limit:</span>' +
            '<input type="number" id="eeAudioLimitInp" min="1" max="10" value="2" style="width:42px;padding:3px;background:#0f172a;border:1px solid rgba(168,85,247,0.5);border-radius:6px;color:#fff;font-weight:900;font-size:12px;text-align:center;outline:none;" />' +
            '<span style="font-size:10.5px;color:#94a3b8;">marta</span>' +
          '</div>' +

          // Audio status pill
          '<div id="eeAudioStatusPill" style="display:none;align-items:center;gap:6px;background:rgba(16,185,129,0.18);border:1px solid #10b981;color:#10b981;padding:4px 10px;border-radius:8px;font-size:11.5px;font-weight:800;">' +
            '<span id="eeAudioStatusText">Audio yuklandi</span>' +
            '<button id="eeRemoveAudioBtn" style="background:none;border:none;color:#ef4444;font-size:14px;cursor:pointer;line-height:1;font-weight:900;" title="Audioni o‘chirish">✕</button>' +
          '</div>' +

          '<label style="background:linear-gradient(135deg,rgba(56,189,248,0.2),rgba(37,99,235,0.2));color:#38bdf8;border:1.5px solid #38bdf8;padding:6px 12px;border-radius:10px;font-size:12px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:6px;">' +
            '📁 PDF / Rasm Yuklash <input type="file" id="eeVisualFileInput" accept="image/*,application/pdf,.pdf" style="display:none;" />' +
          '</label>' +

          // Zoom Controls
          '<div style="display:flex;align-items:center;gap:3px;background:#1e293b;padding:3px 6px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);">' +
            '<button id="eeZoomOutBtn" style="background:#334155;border:none;color:#cbd5e1;padding:4px 8px;border-radius:6px;font-size:11.5px;font-weight:900;cursor:pointer;">🔍−</button>' +
            '<button id="eeZoom100Btn" style="background:none;border:none;color:#38bdf8;padding:4px 6px;font-size:11px;font-weight:800;cursor:pointer;">100%</button>' +
            '<button id="eeZoomInBtn" style="background:#334155;border:none;color:#cbd5e1;padding:4px 8px;border-radius:6px;font-size:11.5px;font-weight:900;cursor:pointer;">🔍+</button>' +
            '<button id="eeFitWidthBtn" style="background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.3);color:#38bdf8;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:800;cursor:pointer;">↔️ Moslash</button>' +
          '</div>' +
        '</div>' +

        // Right Action Buttons
        '<div style="display:flex;align-items:center;gap:8px;">' +
          '<button id="eeDelSelectedBtn" style="display:none;background:rgba(239,68,68,0.2);border:1px solid #ef4444;color:#ef4444;padding:7px 12px;border-radius:10px;font-weight:800;font-size:12px;cursor:pointer;">🗑️ Tanlanganlarni o‘chirish (0)</button>' +
          '<div id="eeVisualCounter" style="font-size:12px;font-weight:800;color:#10b981;background:rgba(16,185,129,0.12);padding:5px 10px;border-radius:8px;border:1px solid rgba(16,185,129,0.25);">0 ta katakcha</div>' +
          '<button id="eeSaveVisualBtn" style="background:linear-gradient(135deg,#0284c7,#2563eb);border:none;color:#fff;padding:8px 20px;border-radius:10px;font-weight:900;font-size:13px;cursor:pointer;box-shadow:0 4px 18px rgba(2,132,199,0.5);">💾 Testni Saqlash</button>' +
          '<button id="eeCloseVisualModal" style="background:rgba(255,255,255,0.08);border:none;color:#94a3b8;font-size:18px;font-weight:900;cursor:pointer;padding:6px 10px;border-radius:10px;">✕</button>' +
        '</div>' +
      '</div>' +

      // Continuous Multi-Page Workspace
      '<div id="eeVisualWorkspace" style="flex:1;overflow-y:scroll;overflow-x:auto;padding:24px 20px 140px 20px;display:flex;flex-direction:column;align-items:center;background:#070b14;position:relative;">' +
        '<div id="eePagesStreamWrap" style="display:flex;flex-direction:column;align-items:center;gap:32px;width:100%;"></div>' +
        '<div style="margin-top:20px;font-size:12.5px;color:#94a3b8;text-align:center;">' +
          '💡 <b>Katakcha Chizish:</b> Sichqoncha chap tugmasini bosib to‘rtburchak chizing. | <b>Lasso Tanlash:</b> Yuqoridagi "Lasso Tanlash"ni bosing yoki <b>Shift</b> / <b>O‘ng tugma</b> bilan tortib bir nechta katakchani birga belgilang va baravar suring!' +
        '</div>' +
      '</div>';

    modalRoot.appendChild(m);

    var streamWrap = m.querySelector('#eePagesStreamWrap');
    var fileInp = m.querySelector('#eeVisualFileInput');
    var counterEl = m.querySelector('#eeVisualCounter');
    var delSelectedBtn = m.querySelector('#eeDelSelectedBtn');
    var toolDrawBtn = m.querySelector('#eeToolDrawBtn');
    var toolLassoBtn = m.querySelector('#eeToolLassoBtn');
    var audioInp = m.querySelector('#eeAudioFileInput');
    var audioLimitInp = m.querySelector('#eeAudioLimitInp');
    var audioStatusPill = m.querySelector('#eeAudioStatusPill');
    var audioStatusText = m.querySelector('#eeAudioStatusText');
    var removeAudioBtn = m.querySelector('#eeRemoveAudioBtn');

    // Tool toggle logic
    function setTool(t) {
      activeTool = t;
      if (t === 'draw') {
        toolDrawBtn.style.background = '#0284c7';
        toolDrawBtn.style.color = '#fff';
        toolLassoBtn.style.background = 'transparent';
        toolLassoBtn.style.color = '#94a3b8';
      } else {
        toolLassoBtn.style.background = '#0284c7';
        toolLassoBtn.style.color = '#fff';
        toolDrawBtn.style.background = 'transparent';
        toolDrawBtn.style.color = '#94a3b8';
      }
    }
    toolDrawBtn.onclick = function() { setTool('draw'); };
    toolLassoBtn.onclick = function() { setTool('lasso'); };

    // Audio Upload Handler (Strict max 25MB validation)
    audioInp.onchange = function(e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      var maxBytes = 25 * 1024 * 1024; // 25 MB
      if (f.size > maxBytes) {
        alert("⚠️ Audio fayl hajmi 25 MB dan oshmasligi kerak! \nSiz yuklamoqchi bo‘lgan fayl: " + (f.size / (1024 * 1024)).toFixed(1) + " MB.");
        audioInp.value = '';
        return;
      }
      var r = new FileReader();
      r.onload = function(ev) {
        uploadedAudio = {
          url: ev.target.result,
          name: f.name,
          size: f.size,
          limit: parseInt(audioLimitInp.value, 10) || 2
        };
        audioStatusText.textContent = "🎧 " + f.name.substring(0, 16) + "... (" + (f.size / (1024*1024)).toFixed(1) + "MB) ✓";
        audioStatusPill.style.display = 'inline-flex';
        showToast("✓ Listening audio yuklandi (Maks 25MB qabul qilindi)");
      };
      r.readAsDataURL(f);
    };

    removeAudioBtn.onclick = function() {
      uploadedAudio = null;
      audioInp.value = '';
      audioStatusPill.style.display = 'none';
      showToast("Audio o‘chirildi");
    };

    function updateSelectionVisuals() {
      m.querySelectorAll('.ee-visual-pin').forEach(function(pin) {
        var key = pin.getAttribute('data-pin-key');
        if (key && selectedPinKeys.has(key)) {
          pin.style.outline = '3px solid #38bdf8';
          pin.style.boxShadow = '0 0 16px rgba(56,189,248,0.95), inset 0 0 10px rgba(56,189,248,0.5)';
          pin.style.background = 'rgba(56,189,248,0.35)';
        } else {
          pin.style.outline = 'none';
          pin.style.boxShadow = '0 0 10px rgba(0,192,255,0.45)';
          pin.style.background = 'rgba(0,192,255,0.22)';
        }
      });
      if (selectedPinKeys.size > 0) {
        delSelectedBtn.style.display = 'inline-block';
        delSelectedBtn.textContent = '🗑️ Tanlanganlarni o‘chirish (' + selectedPinKeys.size + ')';
      } else {
        delSelectedBtn.style.display = 'none';
      }
    }

    delSelectedBtn.onclick = function() {
      if (selectedPinKeys.size === 0) return;
      if (confirm(selectedPinKeys.size + " ta tanlangan katakchani o‘chirishni tasdiqlaysizmi?")) {
        pagesData.forEach(function(p, pIdx) {
          p.elements = (p.elements || []).filter(function(el, elIdx) {
            var k = pIdx + '_' + elIdx;
            return !selectedPinKeys.has(k);
          });
        });
        selectedPinKeys.clear();
        renderAllPages();
        updateCounter();
        showToast("Tanlangan katakchalar o‘chirildi");
      }
    };

    function getTotalElementsCount() {
      var total = 0;
      pagesData.forEach(function(p) { total += (p.elements || []).length; });
      return total;
    }

    function updateCounter() {
      counterEl.textContent = getTotalElementsCount() + " ta katakcha";
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

    function renderAllPages() {
      streamWrap.innerHTML = '';
      pagesData.forEach(function(p, pIdx) {
        var pageBox = document.createElement('div');
        pageBox.className = 'ee-page-box';
        pageBox.setAttribute('data-page-idx', pIdx);
        pageBox.style.cssText = 'position:relative;width:' + currentWidthPx + 'px;background:#ffffff;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,0.7);overflow:hidden;border:1px solid rgba(255,255,255,0.15);user-select:none;';

        var pageHead = document.createElement('div');
        pageHead.style.cssText = 'background:#1e293b;padding:8px 16px;border-bottom:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:space-between;color:#94a3b8;font-size:12px;font-weight:800;';
        pageHead.innerHTML = '<div style="display:flex;align-items:center;gap:8px;">' +
            '<span style="background:#0284c7;color:#fff;padding:2px 8px;border-radius:6px;">Sahifa ' + p.pageNum + '</span>' +
            '<span class="ee-page-subcounter">' + (p.elements || []).length + ' ta topshiriq</span>' +
          '</div>' +
          (pagesData.length > 1 ? '<button class="ee-del-page-btn" data-idx="' + pIdx + '" style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.4);color:#ef4444;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:800;cursor:pointer;">Sahifani o‘chirish</button>' : '');

        var pageBody = document.createElement('div');
        pageBody.style.cssText = 'position:relative;width:100%;line-height:0;';

        var img = document.createElement('img');
        img.src = p.imageUrl;
        img.style.cssText = 'width:100%;display:block;pointer-events:none;';

        var overlay = document.createElement('div');
        overlay.className = 'ee-page-overlay';
        overlay.setAttribute('data-page-idx', pIdx);
        overlay.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;cursor:crosshair;touch-action:none;';

        // Marquee selection rectangle element
        var marqueeBox = document.createElement('div');
        marqueeBox.className = 'ee-marquee-box';
        marqueeBox.style.cssText = 'position:absolute;display:none;border:2px solid #38bdf8;background:rgba(56,189,248,0.25);box-shadow:0 0 16px rgba(56,189,248,0.5);pointer-events:none;z-index:100;border-radius:4px;';
        overlay.appendChild(marqueeBox);

        // Drawing creation rectangle element
        var drawBox = document.createElement('div');
        drawBox.className = 'ee-draw-box';
        drawBox.style.cssText = 'position:absolute;display:none;border:2px dashed #00c0ff;background:rgba(0,192,255,0.25);box-shadow:0 0 16px rgba(0,192,255,0.5);pointer-events:none;z-index:90;border-radius:4px;';
        overlay.appendChild(drawBox);

        pageBody.appendChild(img);
        pageBody.appendChild(overlay);
        pageBox.appendChild(pageHead);
        pageBox.appendChild(pageBody);
        streamWrap.appendChild(pageBox);

        renderPagePins(overlay, p, pIdx);
        attachPageOverlayEvents(overlay, p, pIdx, marqueeBox, drawBox);
      });

      streamWrap.querySelectorAll('.ee-del-page-btn').forEach(function(btn) {
        btn.onclick = function() {
          var idx = parseInt(btn.getAttribute('data-idx'), 10);
          if (confirm((idx + 1) + "-sahifani o‘chirmoqchimisiz?")) {
            pagesData.splice(idx, 1);
            pagesData.forEach(function(pg, i) { pg.pageNum = i + 1; });
            selectedPinKeys.clear();
            renderAllPages();
            updateCounter();
          }
        };
      });

      updateSelectionVisuals();
    }

    function renderPagePins(overlay, p, pIdx) {
      overlay.querySelectorAll('.ee-visual-pin').forEach(function(el) { el.remove(); });
      (p.elements || []).forEach(function(el, idx) {
        var pinKey = pIdx + '_' + idx;
        var pin = document.createElement('div');
        pin.className = 'ee-visual-pin';
        pin.setAttribute('data-pin-key', pinKey);
        pin.setAttribute('data-idx', idx);
        pin.style.cssText = 'position:absolute;top:' + el.top + '%;left:' + el.left + '%;width:' + el.width + '%;height:' + el.height + '%;border:2px solid #00c0ff;background:rgba(0,192,255,0.22);border-radius:6px;display:flex;align-items:center;justify-content:center;box-sizing:border-box;pointer-events:auto;cursor:move;box-shadow:0 0 10px rgba(0,192,255,0.45);transition:outline 0.15s ease;z-index:20;';
        pin.title = 'Tahrirlash yoki surish: ' + (el.label || idx + 1);

        var badgeLabel = (el.label ? el.label : (idx + 1)) + ': ' + esc(el.correct || (el.options ? (Array.isArray(el.options) ? el.options.join('/') : el.options) : el.type));
        pin.innerHTML = '<span style="background:rgba(2,132,199,0.92);color:#fff;font-size:11px;font-weight:900;padding:2px 7px;border-radius:4px;pointer-events:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:92%;">' + badgeLabel + '</span>' +
          '<button class="ee-quick-del-pin" data-idx="' + idx + '" style="position:absolute;top:-8px;right:-8px;background:#ef4444;color:#fff;border:none;border-radius:50%;width:18px;height:18px;font-size:11px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.5);">✕</button>';

        // Dragging & Moving Pins (Individual OR Multi-Drag if part of selected pins!)
        attachPinDrag(pin, el, idx, p, pIdx, overlay);

        // Click to edit (if not dragged)
        pin.onclick = function(e) {
          if (e.target.closest('.ee-quick-del-pin')) return;
          if (pin._wasDragged) { pin._wasDragged = false; return; }
          e.stopPropagation();
          if (e.shiftKey || activeTool === 'lasso') {
            if (selectedPinKeys.has(pinKey)) selectedPinKeys.delete(pinKey);
            else selectedPinKeys.add(pinKey);
            updateSelectionVisuals();
            return;
          }
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
          selectedPinKeys.delete(pIdx + '_' + i);
          renderPagePins(overlay, p, pIdx);
          updateCounter();
        };
      });
    }

    // Drag pin handler supporting UNISON GROUP DRAG of all selected pins
    function attachPinDrag(pin, el, idx, p, pIdx, overlay) {
      var pinKey = pIdx + '_' + idx;

      pin.addEventListener('mousedown', function(e) {
        if (e.target.closest('.ee-quick-del-pin')) return;
        if (e.button === 2) return; // Right click reserved
        var isTouch = !!e.touches;
        var pt = isTouch ? e.touches[0] : e;
        e.stopPropagation();

        if (!selectedPinKeys.has(pinKey) && !e.shiftKey) {
          selectedPinKeys.clear();
          selectedPinKeys.add(pinKey);
          updateSelectionVisuals();
        }

        var startX = pt.clientX;
        var startY = pt.clientY;
        var rect = overlay.getBoundingClientRect();
        var moved = false;

        // Record start positions of all currently selected pins on this page
        var draggedGroup = [];
        selectedPinKeys.forEach(function(k) {
          var parts = k.split('_');
          var pgI = parseInt(parts[0], 10);
          var elI = parseInt(parts[1], 10);
          if (pgI === pIdx && p.elements[elI]) {
            var itemEl = p.elements[elI];
            var domPin = overlay.querySelector('.ee-visual-pin[data-pin-key="' + k + '"]');
            if (domPin) {
              draggedGroup.push({
                element: itemEl,
                dom: domPin,
                startLeft: itemEl.left,
                startTop: itemEl.top
              });
            }
          }
        });

        function onPinMove(ev) {
          var pPt = ev.touches ? ev.touches[0] : ev;
          var dx = pPt.clientX - startX;
          var dy = pPt.clientY - startY;
          if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            moved = true;
            pin._wasDragged = true;
          }

          var dxPct = (dx / rect.width) * 100;
          var dyPct = (dy / rect.height) * 100;

          draggedGroup.forEach(function(item) {
            var nL = Math.max(0, Math.min(95, item.startLeft + dxPct));
            var nT = Math.max(0, Math.min(98, item.startTop + dyPct));
            item.dom.style.left = nL.toFixed(2) + '%';
            item.dom.style.top = nT.toFixed(2) + '%';
          });
        }

        function onPinUp(ev) {
          window.removeEventListener('mousemove', onPinMove);
          window.removeEventListener('mouseup', onPinUp);
          window.removeEventListener('touchmove', onPinMove);
          window.removeEventListener('touchend', onPinUp);

          if (moved) {
            var pPt = (ev.changedTouches && ev.changedTouches[0]) ? ev.changedTouches[0] : ev;
            var dx = pPt.clientX - startX;
            var dy = pPt.clientY - startY;
            var dxPct = (dx / rect.width) * 100;
            var dyPct = (dy / rect.height) * 100;

            draggedGroup.forEach(function(item) {
              item.element.left = parseFloat(Math.max(0, Math.min(95, item.startLeft + dxPct)).toFixed(2));
              item.element.top = parseFloat(Math.max(0, Math.min(98, item.startTop + dyPct)).toFixed(2));
            });
            showToast("✓ " + draggedGroup.length + " ta katakcha yangi joyga ko‘chirildi");
          }
        }

        window.addEventListener('mousemove', onPinMove);
        window.addEventListener('mouseup', onPinUp);
        window.addEventListener('touchmove', onPinMove);
        window.addEventListener('touchend', onPinUp);
      });
    }

    // Overlay Drawing & Lasso Marquee Handlers
    function attachPageOverlayEvents(overlay, p, pIdx, marqueeBox, drawBox) {
      var isOperating = false;
      var isLassoMode = false;
      var startX = 0, startY = 0;

      overlay.addEventListener('contextmenu', function(e) {
        if (!e.target.closest('.ee-visual-pin')) {
          e.preventDefault(); // allow right-click drag lasso
        }
      });

      function onStart(e) {
        if (e.target.closest('.ee-visual-pin')) return;
        var isTouch = !!e.touches;
        if (isTouch && e.touches.length > 1) return;
        var pt = isTouch ? e.touches[0] : e;
        if (e.cancelable) e.preventDefault();

        var rect = overlay.getBoundingClientRect();
        startX = pt.clientX - rect.left;
        startY = pt.clientY - rect.top;
        isOperating = true;

        // Lasso triggered if: tool is 'lasso', or e.button === 2 (right-click), or e.shiftKey
        isLassoMode = (activeTool === 'lasso' || e.button === 2 || e.shiftKey);

        if (isLassoMode) {
          if (!e.ctrlKey && !e.shiftKey) {
            selectedPinKeys.clear();
            updateSelectionVisuals();
          }
          marqueeBox.style.left = startX + 'px';
          marqueeBox.style.top = startY + 'px';
          marqueeBox.style.width = '0px';
          marqueeBox.style.height = '0px';
          marqueeBox.style.display = 'block';
        } else {
          drawBox.style.left = startX + 'px';
          drawBox.style.top = startY + 'px';
          drawBox.style.width = '0px';
          drawBox.style.height = '0px';
          drawBox.style.display = 'block';
        }
      }

      function onMove(e) {
        if (!isOperating) return;
        var isTouch = !!e.touches;
        if (isTouch && e.touches.length > 1) return;
        if (e.cancelable) e.preventDefault();
        var pt = isTouch ? e.touches[0] : e;
        var rect = overlay.getBoundingClientRect();
        var curX = Math.max(0, Math.min(rect.width, pt.clientX - rect.left));
        var curY = Math.max(0, Math.min(rect.height, pt.clientY - rect.top));
        var left = Math.min(startX, curX);
        var top = Math.min(startY, curY);
        var width = Math.abs(curX - startX);
        var height = Math.abs(curY - startY);

        if (isLassoMode) {
          marqueeBox.style.left = left + 'px';
          marqueeBox.style.top = top + 'px';
          marqueeBox.style.width = width + 'px';
          marqueeBox.style.height = height + 'px';

          // Real-time highlight pins whose center is within marquee rectangle
          var mLeftPct = (left / rect.width) * 100;
          var mTopPct = (top / rect.height) * 100;
          var mRightPct = ((left + width) / rect.width) * 100;
          var mBottomPct = ((top + height) / rect.height) * 100;

          (p.elements || []).forEach(function(el, elIdx) {
            var cX = el.left + (el.width / 2);
            var cY = el.top + (el.height / 2);
            var k = pIdx + '_' + elIdx;
            if (cX >= mLeftPct && cX <= mRightPct && cY >= mTopPct && cY <= mBottomPct) {
              selectedPinKeys.add(k);
            } else if (!e.ctrlKey) {
              selectedPinKeys.delete(k);
            }
          });
          updateSelectionVisuals();
        } else {
          drawBox.style.left = left + 'px';
          drawBox.style.top = top + 'px';
          drawBox.style.width = width + 'px';
          drawBox.style.height = height + 'px';
        }
      }

      function onEnd(e) {
        if (!isOperating) return;
        isOperating = false;
        var wasLasso = isLassoMode;
        marqueeBox.style.display = 'none';
        drawBox.style.display = 'none';

        if (wasLasso) {
          updateSelectionVisuals();
          if (selectedPinKeys.size > 0) {
            showToast("✓ " + selectedPinKeys.size + " ta katakcha belgilandi. Istalgan birini sudrab hammasini ko‘chirishingiz mumkin!");
          }
          return;
        }

        var pt = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0] : e;
        var rect = overlay.getBoundingClientRect();
        var endX = Math.max(0, Math.min(rect.width, pt.clientX - rect.left));
        var endY = Math.max(0, Math.min(rect.height, pt.clientY - rect.top));
        var wPx = Math.abs(endX - startX);
        var hPx = Math.abs(endY - startY);

        if (wPx > 10 && hPx > 8) {
          var topPct = parseFloat(((Math.min(startY, endY) / rect.height) * 100).toFixed(2));
          var leftPct = parseFloat(((Math.min(startX, endX) / rect.width) * 100).toFixed(2));
          var widthPct = parseFloat(((wPx / rect.width) * 100).toFixed(2));
          var heightPct = parseFloat(((hPx / rect.height) * 100).toFixed(2));

          openKatakchaModal(true, {
            id: 'inp_' + Date.now() + '_' + Math.floor(Math.random() * 999),
            type: 'fill',
            top: topPct,
            left: leftPct,
            width: widthPct,
            height: heightPct,
            correct: '',
            label: '' + ((p.elements || []).length + 1)
          }, null, p, overlay, pIdx);
        }
      }

      overlay.addEventListener('mousedown', onStart);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);
      overlay.addEventListener('touchstart', onStart, { passive: false });
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onEnd);
    }

    // Modal to define Katakcha type and answer
    function openKatakchaModal(isNew, elData, editIdx, p, overlay, pIdx) {
      var om = document.createElement('div');
      om.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.85);backdrop-filter:blur(10px);z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,-apple-system,sans-serif;';

      om.innerHTML = '<div style="background:#0f172a;border:1px solid rgba(56,189,248,0.35);border-radius:20px;max-width:540px;width:100%;padding:26px;box-shadow:0 24px 60px rgba(0,0,0,0.8);color:#f8fafc;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:12px;">' +
          '<div style="display:flex;align-items:center;gap:10px;">' +
            '<span style="font-size:22px;">🎯</span>' +
            '<h3 style="margin:0;font-size:17px;font-weight:900;">' + (isNew ? 'Yangi Katakcha Qo‘shish' : 'Katakchani Tahrirlash') + '</h3>' +
          '</div>' +
          '<button id="eeCloseKatakchaModal" style="background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer;">✕</button>' +
        '</div>' +

        '<div style="display:flex;flex-direction:column;gap:14px;">' +
          '<div>' +
            '<label style="display:block;font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:6px;">Topshiriq Turi:</label>' +
            '<select id="eeKatakchaType" style="width:100%;padding:10px;background:#1e293b;border:1px solid rgba(255,255,255,0.15);border-radius:10px;color:#fff;font-weight:800;outline:none;">' +
              '<option value="fill"' + (elData.type === 'fill' ? ' selected' : '') + '>✍️ O‘qib yoziladigan (Fill in blanks / Text Input)</option>' +
              '<option value="choose"' + (elData.type === 'choose' ? ' selected' : '') + '>🔘 Tanlanadigan (Variantni bosish)</option>' +
              '<option value="cross"' + (elData.type === 'cross' ? ' selected' : '') + '>❌ O‘chiriladigan (Strikethrough / Chiqitga chiqarish)</option>' +
              '<option value="match"' + (elData.type === 'match' ? ' selected' : '') + '>🔗 Bog‘lanadigan (Letter match badge A-H)</option>' +
            '</select>' +
          '</div>' +

          '<div style="display:flex;gap:10px;">' +
            '<div style="flex:1;">' +
              '<label style="display:block;font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:6px;">Savol Raqami / Label:</label>' +
              '<input type="text" id="eeKatakchaLabel" value="' + esc(elData.label || '') + '" placeholder="1, 2, 3a..." style="width:100%;padding:10px;background:#1e293b;border:1px solid rgba(255,255,255,0.15);border-radius:10px;color:#fff;font-weight:800;outline:none;box-sizing:border-box;" />' +
            '</div>' +
            '<div style="flex:2;">' +
              '<label style="display:block;font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:6px;">To‘g‘ri Javob (Key):</label>' +
              '<input type="text" id="eeKatakchaCorrect" value="' + esc(elData.correct || '') + '" placeholder="Masalan: is watching / ' + esc("has seen") + '" style="width:100%;padding:10px;background:#1e293b;border:1px solid #10b981;border-radius:10px;color:#10b981;font-weight:900;outline:none;box-sizing:border-box;" />' +
            '</div>' +
          '</div>' +

          '<div id="eeKatakchaOptionsWrap" style="' + (elData.type === 'choose' ? 'display:block;' : 'display:none;') + '">' +
            '<label style="display:block;font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:6px;">Variantlar (slash / bilan ajrating):</label>' +
            '<input type="text" id="eeKatakchaOptions" value="' + esc(Array.isArray(elData.options) ? elData.options.join('/') : (elData.options || '')) + '" placeholder="Masalan: at / on / in" style="width:100%;padding:10px;background:#1e293b;border:1px solid rgba(255,255,255,0.15);border-radius:10px;color:#fff;font-weight:800;outline:none;box-sizing:border-box;" />' +
          '</div>' +
        '</div>' +

        '<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:24px;">' +
          '<button id="eeCancelKatakcha" style="background:rgba(255,255,255,0.08);border:none;color:#94a3b8;padding:9px 18px;border-radius:10px;font-weight:700;cursor:pointer;">Bekor qilish</button>' +
          '<button id="eeSaveKatakcha" style="background:linear-gradient(135deg,#0284c7,#2563eb);border:none;color:#fff;padding:9px 24px;border-radius:10px;font-weight:900;cursor:pointer;">Katakchani Saqlash</button>' +
        '</div>' +
      '</div>';

      modalRoot.appendChild(om);

      var typeSel = om.querySelector('#eeKatakchaType');
      var optWrap = om.querySelector('#eeKatakchaOptionsWrap');
      typeSel.onchange = function() {
        optWrap.style.display = (typeSel.value === 'choose') ? 'block' : 'none';
      };

      om.querySelector('#eeCloseKatakchaModal').onclick = om.querySelector('#eeCancelKatakcha').onclick = function() {
        om.remove();
      };

      om.querySelector('#eeSaveKatakcha').onclick = function() {
        var correctVal = om.querySelector('#eeKatakchaCorrect').value.trim();
        var labelVal = om.querySelector('#eeKatakchaLabel').value.trim() || ((p.elements || []).length + 1);
        var tVal = typeSel.value;
        var opts = [];
        if (tVal === 'choose') {
          opts = om.querySelector('#eeKatakchaOptions').value.split('/').map(function(s) { return s.trim(); }).filter(Boolean);
        }

        elData.type = tVal;
        elData.correct = correctVal;
        elData.label = labelVal;
        if (opts.length > 0) elData.options = opts;

        if (isNew) {
          p.elements.push(elData);
        } else {
          p.elements[editIdx] = elData;
        }

        om.remove();
        renderPagePins(overlay, p, pIdx);
        updateCounter();
      };
    }

    // PDF / Image Upload Handler
    fileInp.onchange = function(e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;

      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        var fr = new FileReader();
        fr.onload = function(ev) {
          var typedarray = new Uint8Array(ev.target.result);
          if (window.pdfjsLib) {
            window.pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
              pagesData = [];
              var numPages = pdf.numPages;
              var loaded = 0;
              for (var i = 1; i <= numPages; i++) {
                (function(pageNumber) {
                  pdf.getPage(pageNumber).then(function(page) {
                    var viewport = page.getViewport({ scale: 2 });
                    var canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    var ctx = canvas.getContext('2d');
                    page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function() {
                      var dataUrl = canvas.toDataURL('image/jpeg', 0.92);
                      pagesData[pageNumber - 1] = { pageNum: pageNumber, imageUrl: dataUrl, elements: [] };
                      loaded++;
                      if (loaded === numPages) {
                        renderAllPages();
                        updateCounter();
                        showToast("PDF yuklandi: " + numPages + " ta sahifa tayyor!");
                      }
                    });
                  });
                })(i);
              }
            }).catch(function(err) {
              alert("PDF faylni yuklashda xatolik: " + err.message);
            });
          } else {
            alert("PDF kutubxonasi topilmadi. Iltimos rasm shaklida yuklang.");
          }
        };
        fr.readAsArrayBuffer(file);
      } else {
        var frImg = new FileReader();
        frImg.onload = function(ev) {
          pagesData = [{ pageNum: 1, imageUrl: ev.target.result, elements: [] }];
          renderAllPages();
          updateCounter();
          showToast("Rasm muvaffaqiyatli yuklandi!");
        };
        frImg.readAsDataURL(file);
      }
    };

    function closeAll() {
      m.remove();
    }
    m.querySelector('#eeCloseVisualModal').onclick = closeAll;

    renderAllPages();
    updateCounter();

    // Save Test Handler
    m.querySelector('#eeSaveVisualBtn').onclick = function() {
      var title = m.querySelector('#eeVisualTitle').value.trim();
      var attempts = parseInt(m.querySelector('#eeVisualAttempts').value, 10) || 1;
      var audioLimit = parseInt(m.querySelector('#eeAudioLimitInp').value, 10) || 2;
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
      var curU = getCurrentUser();

      if (curriculumContext) {
        var newCurTest = {
          id: curriculumContext.testKey,
          title: title,
          type: 'visual_overlay',
          isCurriculum: true,
          isPublic: true,
          level: curriculumContext.level,
          testType: curriculumContext.testType,
          unitOrProgressNum: curriculumContext.num,
          createdAt: Date.now(),
          authorId: curU ? curU.id : 'admin',
          teacherId: curU ? curU.id : 'admin',
          creatorId: curU ? curU.id : 'admin',
          authorName: curU ? (curU.name || 'Ustoz') : 'Ustoz',
          maxAttempts: attempts,
          pages: pagesData,
          imageUrl: (pagesData[0] && pagesData[0].imageUrl) ? pagesData[0].imageUrl : null,
          elements: allElements,
          audioUrl: uploadedAudio ? uploadedAudio.url : null,
          audioName: uploadedAudio ? uploadedAudio.name : null,
          audioLimit: audioLimit,
          questions: allElements.map(function(el, i) {
            return { id: el.id, q: (el.label || (i + 1)) + "-savol", correct: el.correct, points: 1 };
          })
        };

        S.customCurriculumTests = S.customCurriculumTests || {};
        S.customCurriculumTests[curriculumContext.testKey] = newCurTest;
        try {
          localStorage.setItem('ethith_custom_curriculum_tests', JSON.stringify(S.customCurriculumTests));
        } catch(e) {}
        saveStore();
        closeAll();
        showToast("✓ " + title + " muvaffaqiyatli saqlandi!");
        if (typeof curriculumContext.onSaved === 'function') {
          curriculumContext.onSaved(newCurTest);
        }
        return;
      }

      var defaultFid = (curU.role === 'teacher' && !isAdminOrTeacher() ? ('f_root_' + curU.id) : (curU.role === 'teacher' ? ('f_root_' + curU.id) : 'f_root'));
      
      var newTest = {
        id: randCode,
        title: title,
        type: 'visual_overlay',
        folderId: folderId || defaultFid,
        createdAt: Date.now(),
        authorId: curU.id,
        teacherId: curU.id,
        creatorId: curU.id,
        authorName: curU.name || 'Ustoz',
        maxAttempts: attempts,
        pages: pagesData,
        imageUrl: pagesData[0].imageUrl,
        elements: allElements,
        audioUrl: uploadedAudio ? uploadedAudio.url : null,
        audioName: uploadedAudio ? uploadedAudio.name : null,
        audioLimit: audioLimit,
        questions: allElements.map(function(el, i) {
          return { id: el.id, q: (el.label || (i + 1)) + "-savol", correct: el.correct, points: 1 };
        })
      };

      S.fileExplorer.tests.push(newTest);
      saveStore();
      closeAll();
      showToast("✓ Interaktiv listening test saqlandi! Test ID: " + randCode);
      if (container) EE.renderExplorerView(container);
    };
  };

  // Dedicated Oxford Navigate Unit Test & Progress Test Visual PDF Builder
  EE.openCurriculumVisualTestBuilder = function(level, testType, num, onSaved) {
    var S = getStore();
    var testKey = level + '_' + testType + '_' + num;
    var existingTest = (S.customCurriculumTests && S.customCurriculumTests[testKey]) || null;
    var levelLabel = (level === 'intermediate') ? 'B1+ Intermediate' : 'B2 Upper-Intermediate';
    var defTitle = (testType === 'unit') ?
      ('Unit ' + num + ' Test (' + levelLabel + ')') :
      ('Progress Test ' + num + ': Units ' + (num === 1 ? '1–3' : num === 2 ? '4–6' : num === 3 ? '7–9' : '10–12') + ' (' + levelLabel + ')');

    var curriculumContext = {
      level: level,
      testType: testType,
      num: num,
      testKey: testKey,
      title: defTitle,
      onSaved: onSaved
    };

    EE.openVisualTestBuilderModal(null, null, existingTest, curriculumContext);
  };

  EE.openCreateTestModal = function(container, folderId) {
    var modalRoot = document.getElementById('eaGlobalModalRoot') || document.body;
    var randCode = 'TST-' + Math.random().toString(36).substring(2, 6).toUpperCase() + Math.floor(Math.random() * 9 + 1);

    var m = document.createElement('div');
    m.id = 'eeCreateTestOverlay';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.85);backdrop-filter:blur(10px);z-index:2147483640;display:flex;align-items:center;justify-content:center;padding:16px;';
    
    var uploadedAudio = null;

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

      '<div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;">' +
        '<div style="flex:1;min-width:140px;">' +
          '<label style="display:block;font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:6px;">Test ID:</label>' +
          '<input type="text" id="eeNewTestId" value="' + randCode + '" readonly style="width:100%;padding:10px 14px;background:#1e293b;border:1px solid rgba(56,189,248,0.3);border-radius:10px;color:#38bdf8;font-weight:900;box-sizing:border-box;outline:none;" />' +
        '</div>' +
        '<div style="flex:1;min-width:140px;">' +
          '<label style="display:block;font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:6px;">🎧 Tinglash Limiti:</label>' +
          '<input type="number" id="eeStandardAudioLimit" min="1" max="10" value="2" style="width:100%;padding:10px 14px;background:#1e293b;border:1px solid rgba(168,85,247,0.4);border-radius:10px;color:#c084fc;font-weight:900;box-sizing:border-box;outline:none;" />' +
        '</div>' +
      '</div>' +

      // Audio Upload Bar
      '<div style="background:#1e293b;border:1px dashed rgba(168,85,247,0.4);border-radius:12px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
          '<span style="font-size:20px;">🎧</span>' +
          '<div>' +
            '<div style="font-size:12.5px;font-weight:800;color:#f8fafc;">Listening Audio Biriktirish (Ixtiyoriy)</div>' +
            '<div style="font-size:11px;color:#94a3b8;">Maksimal hajm: 25 MB</div>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
          '<span id="eeStdAudioLabel" style="display:none;font-size:11px;color:#10b981;font-weight:800;">Audio yuklandi ✓</span>' +
          '<label style="background:linear-gradient(135deg,rgba(168,85,247,0.2),rgba(147,51,234,0.2));color:#c084fc;border:1.5px solid #a855f7;padding:6px 14px;border-radius:8px;font-size:11.5px;font-weight:800;cursor:pointer;">' +
            'Audio Tanlash <input type="file" id="eeStdAudioInput" accept="audio/*" style="display:none;" />' +
          '</label>' +
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

    var stdAudioInp = m.querySelector('#eeStdAudioInput');
    var stdAudioLabel = m.querySelector('#eeStdAudioLabel');
    stdAudioInp.onchange = function(e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      if (f.size > 25 * 1024 * 1024) {
        alert("Audio fayl hajmi 25 MB dan oshmasligi kerak!");
        stdAudioInp.value = '';
        return;
      }
      var fr = new FileReader();
      fr.onload = function(ev) {
        uploadedAudio = { url: ev.target.result, name: f.name, size: f.size };
        stdAudioLabel.textContent = "🎧 " + f.name.substring(0, 15) + "... (" + (f.size/(1024*1024)).toFixed(1) + "MB) ✓";
        stdAudioLabel.style.display = 'inline';
      };
      fr.readAsDataURL(f);
    };

    var qList = [];
    var qContainer = m.querySelector('#eeQuestionsContainer');

    function renderQuestions() {
      qContainer.innerHTML = '';
      if (qList.length === 0) {
        qContainer.innerHTML = '<div style="font-size:12.5px;color:#64748b;text-align:center;padding:20px;background:#1e293b;border-radius:10px;">Hali savol qo‘shilmadi. "+ Savol qo‘shish" tugmasini bosing.</div>';
        return;
      }
      qList.forEach(function(q, idx) {
        var card = document.createElement('div');
        card.style.cssText = 'background:#1e293b;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:10px;';
        card.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;">' +
            '<span style="font-size:12.5px;font-weight:900;color:#38bdf8;">' + (idx + 1) + '-Savol</span>' +
            '<button type="button" class="ee-del-q-btn" data-idx="' + idx + '" style="background:none;border:none;color:#ef4444;font-size:14px;font-weight:900;cursor:pointer;">✕</button>' +
          '</div>' +
          '<input type="text" class="ee-q-text" data-idx="' + idx + '" value="' + esc(q.q || '') + '" placeholder="Savol matni..." style="width:100%;padding:8px 12px;background:#0f172a;border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#fff;font-weight:700;box-sizing:border-box;outline:none;" />' +
          '<div style="display:flex;gap:8px;">' +
            '<input type="text" class="ee-q-opt" data-idx="' + idx + '" data-opt="0" value="' + esc(q.options[0] || '') + '" placeholder="A varianti" style="flex:1;padding:6px 10px;background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:12px;box-sizing:border-box;" />' +
            '<input type="text" class="ee-q-opt" data-idx="' + idx + '" data-opt="1" value="' + esc(q.options[1] || '') + '" placeholder="B varianti" style="flex:1;padding:6px 10px;background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:12px;box-sizing:border-box;" />' +
            '<input type="text" class="ee-q-opt" data-idx="' + idx + '" data-opt="2" value="' + esc(q.options[2] || '') + '" placeholder="C varianti" style="flex:1;padding:6px 10px;background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:12px;box-sizing:border-box;" />' +
            '<input type="text" class="ee-q-opt" data-idx="' + idx + '" data-opt="3" value="' + esc(q.options[3] || '') + '" placeholder="D varianti" style="flex:1;padding:6px 10px;background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:12px;box-sizing:border-box;" />' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:10px;">' +
            '<span style="font-size:11.5px;color:#94a3b8;font-weight:700;">To‘g‘ri javob indeksi (0=A, 1=B, 2=C, 3=D):</span>' +
            '<input type="number" class="ee-q-correct" data-idx="' + idx + '" min="0" max="3" value="' + (q.correct !== undefined ? q.correct : 0) + '" style="width:48px;padding:4px 8px;background:#0f172a;border:1px solid #10b981;border-radius:6px;color:#10b981;font-weight:900;text-align:center;" />' +
          '</div>';
        qContainer.appendChild(card);
      });

      qContainer.querySelectorAll('.ee-del-q-btn').forEach(function(b) {
        b.onclick = function() {
          var i = parseInt(b.getAttribute('data-idx'), 10);
          qList.splice(i, 1);
          renderQuestions();
        };
      });

      qContainer.querySelectorAll('.ee-q-text').forEach(function(inp) {
        inp.oninput = function() {
          var i = parseInt(inp.getAttribute('data-idx'), 10);
          qList[i].q = inp.value;
        };
      });

      qContainer.querySelectorAll('.ee-q-opt').forEach(function(inp) {
        inp.oninput = function() {
          var i = parseInt(inp.getAttribute('data-idx'), 10);
          var o = parseInt(inp.getAttribute('data-opt'), 10);
          qList[i].options[o] = inp.value;
        };
      });

      qContainer.querySelectorAll('.ee-q-correct').forEach(function(inp) {
        inp.oninput = function() {
          var i = parseInt(inp.getAttribute('data-idx'), 10);
          qList[i].correct = parseInt(inp.value, 10) || 0;
        };
      });
    }

    m.querySelector('#eeAddQBtn').onclick = function() {
      qList.push({
        id: 'q_' + Date.now() + '_' + Math.floor(Math.random() * 999),
        q: '',
        options: ['', '', '', ''],
        correct: 0,
        points: 1
      });
      renderQuestions();
    };

    m.querySelector('#eeCloseTestModal').onclick = m.querySelector('#eeCancelTestBtn').onclick = function() {
      m.remove();
    };

    m.querySelector('#eeSaveTestBtn').onclick = function() {
      var title = m.querySelector('#eeNewTestTitle').value.trim();
      var audioLimit = parseInt(m.querySelector('#eeStandardAudioLimit').value, 10) || 2;
      if (!title) { alert("Iltimos, test nomini kiriting!"); return; }
      if (qList.length === 0) { alert("Iltimos, kamida 1 ta savol qo‘shing!"); return; }

      var S = getStore();
      var curU = getCurrentUser();
      var defaultFid = (curU.role === 'teacher' && !isAdminOrTeacher() ? ('f_root_' + curU.id) : (curU.role === 'teacher' ? ('f_root_' + curU.id) : 'f_root'));

      S.fileExplorer.tests.push({
        id: randCode,
        title: title,
        type: 'standard_quiz',
        folderId: folderId || defaultFid,
        createdAt: Date.now(),
        authorId: curU.id,
        teacherId: curU.id,
        creatorId: curU.id,
        authorName: curU.name || 'Ustoz',
        maxAttempts: 1,
        questions: qList,
        audioUrl: uploadedAudio ? uploadedAudio.url : null,
        audioName: uploadedAudio ? uploadedAudio.name : null,
        audioLimit: audioLimit
      });

      saveStore();
      m.remove();
      showToast("✓ Test muvaffaqiyatli saqlandi! Test ID: " + randCode);
      if (container) EE.renderExplorerView(container);
    };

    renderQuestions();
  };

  EE.openTakeTestModal = function(testIdOrObj) {
    var S = getStore();
    var test = null;
    if (typeof testIdOrObj === 'object' && testIdOrObj !== null) {
      test = testIdOrObj;
    } else {
      test = (S.fileExplorer.tests || []).find(function(t) { return t.id === testIdOrObj; }) ||
             ((S.customCurriculumTests || {})[testIdOrObj]);
    }
    if (!test) { alert("Test topilmadi!"); return; }

    var user = getCurrentUser();
    var isStaff = (user && (user.role === 'teacher' || user.role === 'admin'));

    if (user && user.role === 'student' && !test.isCurriculum && !test.isPublic) {
      var myTeacherIds = [];
      (S.classes || []).forEach(function(cls) {
        var inClass = (cls.students || []).some(function(s) {
          return s.id === user.id || s.email === user.email || (user.phone && s.phone === user.phone);
        });
        if (inClass && cls.teacherId) myTeacherIds.push(cls.teacherId);
      });
      var isMyTeacher = myTeacherIds.includes(test.authorId) || myTeacherIds.includes(test.teacherId) || myTeacherIds.includes(test.creatorId);
      if (!isMyTeacher) {
        alert("🔒 Ushbu test sizning o‘qituvchingiz tomonidan biriktirilmagan. Siz faqat o‘z ustozingiz yaratgan testlarni yechishingiz mumkin!");
        return;
      }
    }

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

    if (attemptsDone >= maxAttempts && !isStaff) {
      alert("⚠️ Ushbu topshiriq uchun berilgan barcha " + maxAttempts + " ta urinishdan foydalangansiz! \nEng yuqori natijangiz: " + (pastSub.bestScore || pastSub.score) + "%.");
      return;
    }

    // Audio Listening Tracker: per-user per-test listen count stored in localStorage
    var audioListenStorageKey = 'ethith_listen_' + test.id + '_' + (user ? user.id : 'anon');
    var audioListenCount = parseInt(localStorage.getItem(audioListenStorageKey) || '0', 10);
    var audioLimit = test.audioLimit || 2;

    // Helper to generate Listening Audio Player HTML bar
    function createListeningBannerHtml() {
      if (!test.audioUrl) return '';
      var remListens = Math.max(0, audioLimit - audioListenCount);
      var trackName = test.audioName || 'IELTS / Oxford Listening Audio';

      return '<div id="eeAudioPlayerBanner" style="background:linear-gradient(135deg,#1e1b4b,#0f172a);border-bottom:1.5px solid #818cf8;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;box-shadow:0 6px 20px rgba(0,0,0,0.5);position:sticky;top:0;z-index:45;">' +
        '<div style="display:flex;align-items:center;gap:12px;">' +
          '<div style="font-size:26px;">🎧</div>' +
          '<div>' +
            '<div style="display:flex;align-items:center;gap:8px;">' +
              '<span style="background:rgba(129,140,248,0.2);color:#c7d2fe;font-size:11px;font-weight:900;padding:2px 8px;border-radius:6px;border:1px solid rgba(129,140,248,0.4);text-transform:uppercase;">LISTENING AUDIO</span>' +
              '<h4 style="margin:0;font-size:14.5px;font-weight:900;color:#fff;">' + esc(trackName) + '</h4>' +
            '</div>' +
            '<div style="font-size:11.5px;color:#94a3b8;margin-top:2px;">' +
              (isStaff ? '👑 Ustoz rejimi: to‘liq audio boshqaruvi va erkin pauza' : '⚠️ Qat‘iy qoida: audio boshlangach to‘xtatib (pauza) bo‘lmaydi. Oxirigacha tinglang!') +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div style="display:flex;align-items:center;gap:14px;">' +
          '<div style="background:rgba(0,0,0,0.4);padding:6px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);text-align:center;">' +
            '<span style="font-size:11px;color:#94a3b8;font-weight:700;">Tinglash Limiti: </span>' +
            '<span id="eeAudioCountBadge" style="font-size:13px;font-weight:900;color:#38bdf8;">' + (isStaff ? 'Cheksiz' : (audioListenCount + ' / ' + audioLimit + ' marta')) + '</span>' +
          '</div>' +

          (isStaff ? 
            // Teacher gets standard audio player with play/pause/seek controls
            '<audio id="eeTakeAudioEl" src="' + test.audioUrl + '" controls style="height:36px;outline:none;border-radius:8px;"></audio>' :
            // Student gets strict continuous non-stop audio with NO pause button!
            '<div style="display:flex;align-items:center;gap:10px;">' +
              '<audio id="eeTakeAudioEl" src="' + test.audioUrl + '" preload="auto" style="display:none;"></audio>' +
              '<button id="eeStudentAudioPlayBtn" ' + (remListens <= 0 ? 'disabled style="background:#334155;color:#64748b;border:none;padding:10px 20px;border-radius:10px;font-weight:900;font-size:13px;cursor:not-allowed;"' : 'style="background:linear-gradient(135deg,#6366f1,#4f46e5);border:none;color:#fff;padding:10px 22px;border-radius:10px;font-weight:900;font-size:13px;cursor:pointer;box-shadow:0 4px 16px rgba(99,102,241,0.5);display:flex;align-items:center;gap:6px;"') + '>' +
                (remListens <= 0 ? '🔒 Tinglash limiti tugadi (' + audioLimit + ' marta)' : '▶️ Tinglashni Boshlash (Qoldi: ' + remListens + ' ta)') +
              '</button>' +
              '<div id="eeAudioProgressBox" style="display:none;align-items:center;gap:8px;background:rgba(0,0,0,0.3);padding:6px 12px;border-radius:8px;">' +
                '<span style="font-size:11.5px;color:#a5b4fc;font-weight:800;" id="eeAudioCurTime">00:00</span>' +
                '<div style="width:120px;height:6px;background:#334155;border-radius:3px;overflow:hidden;pointer-events:none;">' +
                  '<div id="eeAudioProgressBar" style="width:0%;height:100%;background:linear-gradient(90deg,#6366f1,#38bdf8);transition:width 0.2s ease;"></div>' +
                '</div>' +
                '<span style="font-size:11.5px;color:#94a3b8;font-weight:800;" id="eeAudioDuration">00:00</span>' +
              '</div>' +
            '</div>'
          ) +
        '</div>' +
      '</div>';
    }

    function setupListeningAudioEvents(parentModal) {
      if (!test.audioUrl) return;
      var audio = parentModal.querySelector('#eeTakeAudioEl');
      if (!audio) return;

      if (!isStaff) {
        var playBtn = parentModal.querySelector('#eeStudentAudioPlayBtn');
        var progressBox = parentModal.querySelector('#eeAudioProgressBox');
        var bar = parentModal.querySelector('#eeAudioProgressBar');
        var curTimeEl = parentModal.querySelector('#eeAudioCurTime');
        var durEl = parentModal.querySelector('#eeAudioDuration');
        var badge = parentModal.querySelector('#eeAudioCountBadge');

        function fmt(s) {
          s = Math.floor(s || 0);
          var m = Math.floor(s / 60);
          var sec = s % 60;
          return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
        }

        audio.addEventListener('loadedmetadata', function() {
          if (durEl) durEl.textContent = fmt(audio.duration);
        });

        audio.addEventListener('timeupdate', function() {
          if (audio.duration) {
            var pct = (audio.currentTime / audio.duration) * 100;
            if (bar) bar.style.width = pct + '%';
            if (curTimeEl) curTimeEl.textContent = fmt(audio.currentTime);
          }
        });

        // Strict non-stop playback: intercept pause attempt from students!
        audio.addEventListener('pause', function() {
          if (!audio.ended && audio.currentTime > 0) {
            audio.play(); // immediately resume, NO pause allowed for students!
          }
        });

        playBtn.onclick = function() {
          var rem = Math.max(0, audioLimit - audioListenCount);
          if (rem <= 0) {
            alert("⚠️ Siz ushbu audioni eshitish uchun berilgan barcha " + audioLimit + " ta imkoniyatdan to‘liq foydalangansiz!");
            return;
          }

          // Start playing
          audio.play().then(function() {
            playBtn.disabled = true;
            playBtn.style.background = '#334155';
            playBtn.style.cursor = 'not-allowed';
            playBtn.style.boxShadow = 'none';
            playBtn.innerHTML = '🔊 Audio tinglanmoqda... (Pauza taqiqlangan)';
            if (progressBox) progressBox.style.display = 'flex';
          }).catch(function(err) {
            alert("Audioni qo‘yishda xatolik yuz berdi: " + err.message);
          });
        };

        // When audio ends: increment listen counter
        audio.addEventListener('ended', function() {
          audioListenCount++;
          localStorage.setItem(audioListenStorageKey, audioListenCount.toString());
          var rem = Math.max(0, audioLimit - audioListenCount);
          if (badge) badge.textContent = audioListenCount + ' / ' + audioLimit + ' marta';

          if (rem > 0) {
            playBtn.disabled = false;
            playBtn.style.background = 'linear-gradient(135deg,#6366f1,#4f46e5)';
            playBtn.style.cursor = 'pointer';
            playBtn.style.boxShadow = '0 4px 16px rgba(99,102,241,0.5)';
            playBtn.innerHTML = '▶️ Qayta tinglash (Qoldi: ' + rem + ' ta)';
            showToast("✓ Audio yakunlandi. Sizda yana " + rem + " ta tinglash imkoniyati qoldi.");
          } else {
            playBtn.disabled = true;
            playBtn.style.background = '#334155';
            playBtn.style.cursor = 'not-allowed';
            playBtn.style.boxShadow = 'none';
            playBtn.innerHTML = '🔒 Barcha tinglash imkoniyatlari tugadi (' + audioLimit + ' marta)';
            showToast("⚠️ Barcha tinglash imkoniyatlaringiz tugadi!");
          }
        });
      }
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
            '<button id="eeSubmitTakeVisual" style="background:linear-gradient(135deg,#10b981,#059669);border:none;color:#fff;padding:9px 24px;border-radius:10px;font-weight:900;font-size:13.5px;cursor:pointer;box-shadow:0 4px 18px rgba(16,185,129,0.45);display:flex;align-items:center;gap:6px;">✓ Testni Yakunlash</button>' +
            '<button id="eeCloseTakeVisualTest" style="background:rgba(255,255,255,0.08);border:none;color:#94a3b8;font-size:18px;font-weight:900;cursor:pointer;padding:8px 12px;border-radius:10px;">✕</button>' +
          '</div>' +
        '</div>' +

        // Listening Audio Player Banner
        createListeningBannerHtml() +

        // Multi-Page Viewer
        '<div id="eeTakeWorkspace" style="flex:1;overflow-y:scroll;overflow-x:auto;padding:24px 20px 140px 20px;display:flex;flex-direction:column;align-items:center;background:#070b14;">' +
          '<div id="eeTakePagesWrap" style="display:flex;flex-direction:column;align-items:center;gap:36px;width:100%;"></div>' +
        '</div>';

      vm.innerHTML = vh;
      modalRoot.appendChild(vm);

      setupListeningAudioEvents(vm);

      var takePagesWrap = vm.querySelector('#eeTakePagesWrap');

      pagesList.forEach(function(p) {
        var pBox = document.createElement('div');
        pBox.className = 'ee-take-page-box';
        pBox.style.cssText = 'position:relative;width:' + currentWidthPx + 'px;max-width:98%;margin:0 auto;background:#ffffff;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,0.8);overflow:hidden;border:1px solid rgba(255,255,255,0.12);line-height:0;';

        var pImg = document.createElement('img');
        pImg.src = p.imageUrl;
        pImg.style.cssText = 'width:100%;display:block;pointer-events:none;';

        var pOverlay = document.createElement('div');
        pOverlay.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:auto;';

        (p.elements || []).forEach(function(el, i) {
          var w = document.createElement('div');
          w.style.cssText = 'position:absolute;top:' + el.top + '%;left:' + el.left + '%;width:' + el.width + '%;height:' + el.height + '%;display:flex;align-items:center;justify-content:center;box-sizing:border-box;z-index:20;';

          if (el.type === 'choose') {
            w.innerHTML = '<span class="ee-chip-choose" data-id="' + el.id + '" data-correct="' + esc(el.correct) + '" data-selected="false" style="cursor:pointer;padding:2px 8px;border-radius:6px;font-size:13px;font-weight:800;color:#0284c7;user-select:none;transition:all 0.15s ease;">' + esc(el.label || el.correct || 'Tanlash') + '</span>';
          } else if (el.type === 'cross') {
            w.innerHTML = '<span class="ee-chip-cross" data-id="' + el.id + '" data-correct="' + esc(el.correct) + '" data-selected="false" style="cursor:pointer;padding:2px 6px;border-radius:4px;font-size:13px;font-weight:800;color:#ef4444;user-select:none;transition:all 0.15s ease;">' + esc(el.label || el.correct || 'O‘chirish') + '</span>';
          } else if (Array.isArray(el.options) && el.options.length > 0) {
            var optHtml = '<option value="">-- Tanlang --</option>';
            el.options.forEach(function(o) { optHtml += '<option value="' + esc(o) + '">' + esc(o) + '</option>'; });
            w.innerHTML = '<select class="ee-take-input ee-take-select" data-id="' + el.id + '" data-correct="' + esc(el.correct) + '" style="width:100%;height:100%;background:rgba(255,255,255,0.95);border:1.5px solid #0284c7;border-radius:5px;padding:1px 4px;font-size:12px;font-weight:800;color:#0f172a;outline:none;box-sizing:border-box;cursor:pointer;">' + optHtml + '</select>';
          } else {
            w.innerHTML = '<input type="text" class="ee-take-input" data-id="' + el.id + '" data-correct="' + esc(el.correct) + '" placeholder="' + esc(el.label || '') + '" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" style="width:100%;height:100%;background:rgba(255,255,255,0.92);border:1.5px solid #0284c7;border-radius:5px;padding:2px 6px;font-size:13.5px;font-weight:700;color:#0f172a;outline:none;box-sizing:border-box;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,0.15);" />';
          }

          pOverlay.appendChild(w);
        });

        pBox.appendChild(pImg);
        pBox.appendChild(pOverlay);
        takePagesWrap.appendChild(pBox);
      });

      function applyTakeWidth(w) {
        currentWidthPx = Math.max(500, Math.min(2200, w));
        takePagesWrap.querySelectorAll('.ee-take-page-box').forEach(function(b) {
          b.style.width = currentWidthPx + 'px';
        });
      }

      var initFitW = Math.min(1000, Math.max(680, Math.floor((window.innerWidth || 1000) * 0.94)));
      applyTakeWidth(initFitW);

      vm.querySelector('#eeTakeZoomIn').onclick = function() { applyTakeWidth(currentWidthPx + 150); };
      vm.querySelector('#eeTakeZoomOut').onclick = function() { applyTakeWidth(currentWidthPx - 150); };
      vm.querySelector('#eeTakeZoom100').onclick = function() { applyTakeWidth(1000); };
      vm.querySelector('#eeTakeFitWidth').onclick = function() {
        var wsW = vm.querySelector('#eeTakeWorkspace').clientWidth;
        applyTakeWidth(Math.floor(wsW * 0.94));
      };

      // Interactivity for choose and cross chips
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
            inp.title = 'To‘g‘ri javob: ' + rawCorrect;
          }
        });

        // Check choose chips
        vm.querySelectorAll('.ee-chip-choose').forEach(function(chip) {
          var isChosen = chip.getAttribute('data-selected') === 'true';
          var rawCorrect = (chip.getAttribute('data-correct') || '').trim().toLowerCase();
          if (isChosen && (rawCorrect === 'true' || rawCorrect === '1' || rawCorrect === 'correct')) {
            correctCount++;
            chip.style.background = 'rgba(16,185,129,0.3)';
            chip.style.border = '2px solid #10b981';
          } else if (isChosen) {
            chip.style.background = 'rgba(239,68,68,0.3)';
            chip.style.border = '2px solid #ef4444';
          }
        });

        // Check cross chips
        vm.querySelectorAll('.ee-chip-cross').forEach(function(chip) {
          var isCrossed = chip.getAttribute('data-selected') === 'true';
          var rawCorrect = (chip.getAttribute('data-correct') || '').trim().toLowerCase();
          if (isCrossed && (rawCorrect === 'true' || rawCorrect === 'cross' || rawCorrect === 'incorrect')) {
            correctCount++;
            chip.style.background = 'rgba(16,185,129,0.3)';
            chip.style.border = '2px solid #10b981';
          }
        });

        var pct = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
        var band = (pct >= 90) ? 9.0 : (pct >= 80) ? 8.0 : (pct >= 70) ? 7.0 : (pct >= 60) ? 6.0 : (pct >= 50) ? 5.5 : 4.5;

        // Save submission
        if (hwMatch && user) {
          hwMatch.submissions = hwMatch.submissions || {};
          var prev = hwMatch.submissions[user.id];
          var newCount = (prev ? (prev.attemptsCount || 1) : 0) + 1;
          var best = prev ? Math.max(prev.bestScore || prev.score || 0, pct) : pct;
          hwMatch.submissions[user.id] = {
            userId: user.id,
            userName: user.name,
            score: pct,
            bestScore: best,
            band: band,
            submittedAt: Date.now(),
            attemptsCount: newCount
          };
          saveStore();
        }

        // Save Curriculum Test Result for student / user
        if (user && (test.isCurriculum || test.id.includes('unit') || test.id.includes('progress'))) {
          user.curriculumTestResults = user.curriculumTestResults || {};
          user.curriculumTestResults[test.id] = {
            scorePct: pct,
            correctCount: correctCount,
            total: totalCount,
            band: band,
            date: Date.now()
          };
          if (window.EthithApp && window.EthithApp.state && window.EthithApp.state.user) {
            window.EthithApp.state.user.curriculumTestResults = user.curriculumTestResults;
            if (typeof window.EthithApp.saveState === 'function') window.EthithApp.saveState();
          }
          saveStore();
        }

        // Result Dialog
        var resModal = document.createElement('div');
        resModal.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.85);backdrop-filter:blur(10px);z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,-apple-system,sans-serif;';
        resModal.innerHTML = '<div style="background:#0f172a;border:1.5px solid #10b981;border-radius:22px;max-width:440px;width:100%;padding:28px;text-align:center;color:#fff;box-shadow:0 20px 60px rgba(0,0,0,0.8);">' +
          '<div style="font-size:44px;margin-bottom:12px;">🎉</div>' +
          '<h3 style="margin:0 0 8px;font-size:20px;font-weight:900;">Test Yakunlandi!</h3>' +
          '<p style="color:#94a3b8;font-size:13px;margin:0 0 20px;">Natijalaringiz tizimga qayd etildi.</p>' +
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
    var maxQ = (hwMatch && hwMatch.maxQuestions) || test.maxQuestions || (test.questions || []).length;
    var totalQ = Math.min(maxQ, (test.questions || []).length);

    var m = document.createElement('div');
    m.id = 'eeTakeTestModal';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.9);backdrop-filter:blur(14px);z-index:2147483640;display:flex;align-items:center;justify-content:center;padding:16px;flex-direction:column;';

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

        createListeningBannerHtml() +

        '<div style="margin:20px 0 22px;font-size:16px;font-weight:800;color:#fff;line-height:1.5;">' +
          esc(q.q) +
        '</div>' +

        '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:24px;">';
        (q.options || []).forEach(function(opt, oIdx) {
          var isSel = (userAnswers[curQIdx] === oIdx);
          qh += '<button class="ee-opt-btn" data-opt="' + oIdx + '" style="background:' + (isSel ? 'rgba(56,189,248,0.2)' : '#1e293b') + ';border:1.5px solid ' + (isSel ? '#38bdf8' : 'rgba(255,255,255,0.1)') + ';color:#fff;padding:12px 18px;border-radius:12px;font-size:14px;font-weight:700;text-align:left;cursor:pointer;display:flex;align-items:center;gap:12px;transition:all 0.15s ease;">' +
            '<span style="width:24px;height:24px;border-radius:50%;background:' + (isSel ? '#38bdf8' : 'rgba(255,255,255,0.1)') + ';color:' + (isSel ? '#0f172a' : '#94a3b8') + ';font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center;">' + String.fromCharCode(65 + oIdx) + '</span>' +
            '<span>' + esc(opt) + '</span>' +
          '</button>';
        });
      qh += '</div>' +

        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
          (curQIdx > 0 ? '<button id="eePrevQBtn" style="background:rgba(255,255,255,0.08);border:none;color:#94a3b8;padding:10px 18px;border-radius:10px;font-weight:700;cursor:pointer;">← Oldingi</button>' : '<div></div>') +
          '<button id="eeNextQBtn" style="background:linear-gradient(135deg,#0284c7,#2563eb);border:none;color:#fff;padding:10px 24px;border-radius:10px;font-weight:800;font-size:14px;cursor:pointer;box-shadow:0 4px 14px rgba(2,132,199,0.4);">' +
            (isLast ? 'Testni Yakunlash ✓' : 'Keyingi →') +
          '</button>' +
        '</div>' +
      '</div>';

      m.innerHTML = qh;

      setupListeningAudioEvents(m);

      m.querySelector('#eeCloseTakeTest').onclick = function() {
        if (confirm("Testni to‘xtatmoqchimisiz? Natijangiz saqlanmaydi.")) m.remove();
      };

      m.querySelectorAll('.ee-opt-btn').forEach(function(btn) {
        btn.onclick = function() {
          var o = parseInt(btn.getAttribute('data-opt'), 10);
          userAnswers[curQIdx] = o;
          renderQuestionModal();
        };
      });

      var prevBtn = m.querySelector('#eePrevQBtn');
      if (prevBtn) {
        prevBtn.onclick = function() {
          if (curQIdx > 0) {
            curQIdx--;
            renderQuestionModal();
          }
        };
      }

      m.querySelector('#eeNextQBtn').onclick = function() {
        if (userAnswers[curQIdx] === undefined) {
          alert("Iltimos, avval variantlardan birini tanlang!");
          return;
        }
        if (!isLast) {
          curQIdx++;
          renderQuestionModal();
        } else {
          // Submit
          var correct = 0;
          test.questions.forEach(function(quest, qi) {
            if (userAnswers[qi] === quest.correct) correct++;
          });
          var pct = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;
          var band = (pct >= 90) ? 9.0 : (pct >= 80) ? 8.0 : (pct >= 70) ? 7.0 : (pct >= 60) ? 6.0 : (pct >= 50) ? 5.5 : 4.5;
          var autoGrade = (pct >= 85) ? 5 : (pct >= 70) ? 4 : (pct >= 55) ? 3 : 2;

          // Record per-user attempt in localStorage to strictly enforce attempt limit
          var userAttemptKey = 'ethith_test_att_' + test.id + '_' + (user ? user.id : 'anon');
          var userDoneCount = parseInt(localStorage.getItem(userAttemptKey) || '0', 10) + 1;
          localStorage.setItem(userAttemptKey, String(userDoneCount));

          if (hwMatch && user) {
            hwMatch.submissions = hwMatch.submissions || {};
            var prev = hwMatch.submissions[user.id];
            var newCount = (prev ? (prev.attemptsCount || 1) : 0) + 1;
            var best = prev ? Math.max(prev.bestScore || prev.score || 0, pct) : pct;
            hwMatch.submissions[user.id] = {
              userId: user.id,
              userName: user.name,
              score: pct,
              bestScore: best,
              band: band,
              grade: autoGrade,
              submittedAt: Date.now(),
              attemptsCount: newCount,
              userAnswers: userAnswers
            };
            saveStore();
          }

          // Real-time record into class attendance records!
          if (window.EA && typeof window.EA.recordStudentHomeworkCompletion === 'function') {
            window.EA.recordStudentHomeworkCompletion({
              pct: pct,
              autoGrade: autoGrade,
              lessonCode: test.title || 'Shaxsiy Test',
              correctCount: correct,
              totalQuestions: totalQ
            });
          }

          m.remove();

          // Open Detailed Question Analysis & Review Modal
          var reviewOverlay = document.createElement('div');
          reviewOverlay.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.85);backdrop-filter:blur(14px);z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:20px;';

          var revHtml = '<div style="background:linear-gradient(145deg,#0f172a,#1e293b);border:1.5px solid rgba(56,189,248,0.4);border-radius:24px;width:100%;max-width:680px;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 25px 70px rgba(0,0,0,0.8);color:#fff;">' +
            '<div style="padding:22px 26px;border-bottom:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:space-between;">' +
              '<div>' +
                '<h3 style="margin:0;font-size:20px;font-weight:900;color:#fff;">📊 Test Natijasi va Savollar Tahlili</h3>' +
                '<div style="font-size:12.5px;color:#94a3b8;margin-top:3px;">' + esc(test.title) + ' • Natija: <b style="color:' + (pct >= 70 ? '#34d399' : '#fb7185') + ';">' + pct + '% (Baho: ' + autoGrade + ')</b></div>' +
              '</div>' +
              '<button id="eeCloseReviewBtn" style="background:rgba(255,255,255,0.08);border:none;color:#94a3b8;font-size:20px;width:34px;height:34px;border-radius:10px;cursor:pointer;">✕</button>' +
            '</div>' +

            '<div style="padding:20px 26px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:14px;">';

          test.questions.forEach(function(quest, qi) {
            var userChoice = userAnswers[qi];
            var isCorrect = userChoice === quest.correct;
            revHtml += '<div style="background:rgba(15,23,42,0.8);border:1px solid ' + (isCorrect ? 'rgba(52,211,153,0.4)' : 'rgba(244,63,94,0.4)') + ';border-radius:16px;padding:16px;">' +
              '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">' +
                '<span style="font-size:12px;font-weight:900;color:#38bdf8;">' + (qi + 1) + '-savol:</span>' +
                '<span style="font-size:12px;font-weight:800;padding:2px 8px;border-radius:6px;background:' + (isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)') + ';color:' + (isCorrect ? '#34d399' : '#fb7185') + ';">' + (isCorrect ? '✓ To‘g‘ri' : '✗ Noto‘g‘ri') + '</span>' +
              '</div>' +
              '<div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:10px;">' + esc(quest.q) + '</div>' +
              '<div style="display:flex;flex-direction:column;gap:6px;">';

            (quest.options || []).forEach(function(opt, oi) {
              var optBorder = 'rgba(255,255,255,0.08)';
              var optBg = 'rgba(255,255,255,0.03)';
              var optColor = '#cbd5e1';
              if (oi === quest.correct) {
                optBorder = 'rgba(52,211,153,0.6)';
                optBg = 'rgba(16,185,129,0.18)';
                optColor = '#34d399';
              } else if (oi === userChoice && !isCorrect) {
                optBorder = 'rgba(244,63,94,0.6)';
                optBg = 'rgba(244,63,94,0.18)';
                optColor = '#fb7185';
              }
              revHtml += '<div style="padding:8px 12px;border-radius:10px;font-size:13px;font-weight:700;border:1px solid ' + optBorder + ';background:' + optBg + ';color:' + optColor + ';">' +
                (oi === quest.correct ? '✅ ' : (oi === userChoice ? '❌ ' : '⚪ ')) + esc(opt) +
              '</div>';
            });

            revHtml += '</div></div>';
          });

          revHtml += '</div>' +
            '<div style="padding:16px 26px;border-top:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:space-between;">' +
              '<div style="font-size:12px;color:#94a3b8;">Urinish: <b style="color:#38bdf8;">' + userDoneCount + ' / ' + maxAttempts + ' ta</b>' + (userDoneCount >= maxAttempts ? ' <span style="color:#f87171;">(Maksimal urinishlar tugadi)</span>' : '') + '</div>' +
              '<button id="eeDoneReviewBtn" style="background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:12px;padding:10px 22px;font-size:13px;font-weight:900;cursor:pointer;">Tushunarli / Yopish</button>' +
            '</div>' +
          '</div>';

          reviewOverlay.innerHTML = revHtml;
          document.body.appendChild(reviewOverlay);

          function closeRev() { reviewOverlay.remove(); }
          reviewOverlay.querySelector('#eeCloseReviewBtn').onclick = closeRev;
          reviewOverlay.querySelector('#eeDoneReviewBtn').onclick = closeRev;
        }
      };
    }

    renderQuestionModal();
    modalRoot.appendChild(m);
  };

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
    var num = Number(n) || 0;
    var val = Math.abs(num);
    var sign = num < 0 ? '-' : '';
    if (val >= 1000000000) return sign + (val / 1000000000).toFixed(2) + " mlrd so‘m";
    if (val >= 1000000) return sign + (val / 1000000).toFixed(1) + " mln so‘m";
    if (val >= 1000) return sign + (val / 1000).toFixed(0) + " ming so‘m";
    return sign + val.toLocaleString('uz-UZ') + " so‘m";
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
        expenses: []
      };
    }
    if (!S.finance.expenses) S.finance.expenses = [];
    if (!S.finance.studentFees) S.finance.studentFees = {};
    if (!S.teachers || S.teachers.length === 0) {
      S.teachers = (window.EA && window.EA.getStoreTeachers ? window.EA.getStoreTeachers() : []);
    }
    if (Array.isArray(S.teachers)) {
      S.teachers = S.teachers.filter(function(t) {
        if (!t) return false;
        var nm = (t.name || '').trim().toLowerCase();
        var id = (t.id || '').trim();
        return id !== 'admin_official_teacher' && id !== 't_zizi' && nm !== 'ustoz' && nm !== 'zizi ustoz';
      });
    }

    // 2. Compute live financials in 100% Real-Time
    var studentList = [];
    (S.classes || []).forEach(function(cls) {
      (cls.students || []).forEach(function(st) {
        var stId = st.id || st.email || ('st_' + Math.random().toString(36).substr(2, 6));
        var feeInfo = (cls.studentPayments && cls.studentPayments[stId]) ||
                      S.finance.studentFees[stId] ||
                      { fee: 300000, paid: 0, status: 'unpaid', method: '—', date: 'To‘lanmagan' };
        studentList.push({
          id: stId,
          name: st.name || ("O'quvchi " + (studentList.length + 1)),
          email: st.email || (stId + '@ethith.uz'),
          classId: cls.id,
          className: cls.name,
          fee: Number(feeInfo.fee) || 300000,
          paid: Number(feeInfo.paid) || 0,
          status: feeInfo.status || (feeInfo.paid >= feeInfo.fee ? 'paid' : (feeInfo.paid > 0 ? 'partial' : 'unpaid')),
          method: feeInfo.method || 'Click',
          date: feeInfo.date || '2026-10-05'
        });
      });
    });

    var totalRevenue = studentList.reduce(function(acc, s) { return acc + (Number(s.paid) || 0); }, 0);
    var totalExpected = studentList.reduce(function(acc, s) { return acc + (Number(s.fee) || 0); }, 0);
    var totalReceivables = Math.max(0, totalExpected - totalRevenue);

    // Realtime Teacher Payroll: Derived directly from students who paid in each teacher's groups!
    var totalTeacherPayout = 0;
    (S.teachers || []).forEach(function(t) {
      var tPaidCount = 0;
      var tCollectedSum = 0;
      var tShare = (t.salarySharePercent !== undefined) ? Number(t.salarySharePercent) : 50;
      var tFee = Number(t.studentMonthlyFee) || 300000;
      (S.classes || []).forEach(function(cls) {
        if (cls.teacherId === t.id || (t.name && cls.teacherName && cls.teacherName.toLowerCase() === t.name.toLowerCase())) {
          (cls.students || []).forEach(function(st) {
            var stId = st.id || st.email;
            var p = (cls.studentPayments && cls.studentPayments[stId]) || (S.finance.studentFees && S.finance.studentFees[stId]);
            if (p && (p.status === 'paid' || Number(p.paid) > 0)) {
              tPaidCount++;
              var actualPaid = Number(p.paid) || tFee;
              tCollectedSum += actualPaid;
            }
          });
        }
      });
      t.livePaidStudents = tPaidCount;
      t.computedLiveSalary = Math.round(tCollectedSum * (tShare / 100));
      totalTeacherPayout += t.computedLiveSalary;
    });

    var totalTeachingHours = (S.teachers || []).reduce(function(acc, t) {
      return acc + (Number(t.teachingHours) || 0);
    }, 0);

    var totalExpenses = (S.finance.expenses || []).reduce(function(acc, e) {
      return acc + (Number(e.amount) || 0);
    }, 0);

    // Harajatlar avtomatik markaz sof foydasidan olib tashlanadi
    var totalOutflow = totalTeacherPayout + totalExpenses;
    var netProfit = totalRevenue - totalOutflow;
    var profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';
    // Qarzdorlik faqat xarajat va chiqim tushumdan ortiq bo'lganda (kamomad) minusda chiqadi
    var centerDebt = (netProfit < 0) ? netProfit : 0;

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
        totalExpected: totalExpected,
        centerDebt: centerDebt,
        totalReceivables: centerDebt,
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
    // Dynamic Algorithm for New Platform Live Metrics (Platforma yangi bo'lgani uchun 0 dan boshlanadi)
    var totalOutflow = (Number(data.totalTeacherPayout) || 0) + (Number(data.totalExpenses) || 0);
    var liveNet = (Number(data.totalRevenue) || 0) - totalOutflow;
    var isDeficit = (Number(data.centerDebt) < 0 || liveNet < 0);
    var debtVal = isDeficit ? (Number(data.centerDebt) || liveNet) : 0;

    var payIntizom = (data.totalExpected > 0 && data.totalRevenue > 0) ? Math.min(100, Math.round((data.totalRevenue / data.totalExpected) * 100)) : 0;
    var teacherKpiScore = (data.totalRevenue > 0) ? Math.min(100, Math.round(50 + (data.totalTeacherPayout / (data.totalRevenue || 1)) * 50)) : 0;
    var davomatFoizi = (data.totalRevenue > 0) ? Math.min(100, Math.round(payIntizom > 0 ? (payIntizom * 0.95 + 5) : 0)) : 0;
    var rentabellikScore = (data.totalRevenue > 0 && liveNet > 0) ? Math.min(100, Math.round((liveNet / data.totalRevenue) * 100)) : 0;
    var radarScore = (data.totalRevenue > 0) ? Math.round((payIntizom + teacherKpiScore + davomatFoizi + rentabellikScore) / 4) : 0;

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

      // KPI 4: Center Debt (Faqat pul ortiqcha olinganda/kamomad bo'lganda minusda chiqadi va salbiy cho'kishda deb turadi)
      '<div style="background:rgba(15,23,42,0.85);border:1px solid ' + (isDeficit ? 'rgba(239,68,68,0.45)' : 'rgba(56,189,248,0.35)') + ';border-radius:18px;padding:18px;box-shadow:0 8px 30px rgba(0,0,0,0.4);backdrop-filter:blur(16px);position:relative;overflow:hidden;">' +
        '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:' + (isDeficit ? 'linear-gradient(90deg,#ef4444,#f87171)' : 'linear-gradient(90deg,#0284c7,#38bdf8)') + ';"></div>' +
        '<div style="font-size:11px;font-weight:800;color:' + (isDeficit ? '#f87171' : '#38bdf8') + ';text-transform:uppercase;letter-spacing:0.04em;">Qarzdorlik (Kamomad)</div>' +
        '<div style="font-size:25px;font-weight:900;color:' + (isDeficit ? '#f87171' : '#fff') + ';margin:8px 0 4px;letter-spacing:-0.5px;">' + (isDeficit ? fmtShortUZS(debtVal) : '0 so‘m') + '</div>' +
        '<div style="font-size:11.5px;color:' + (isDeficit ? '#fca5a5' : '#94a3b8') + ';font-weight:' + (isDeficit ? '800' : '600') + ';">' + (isDeficit ? '⚠️ Salbiy cho‘kishda' : 'Qarzdorlik mavjud emas (Barqaror)') + '</div>' +
      '</div>' +

      // KPI 5: Net Profit (Harajatlar avtomatik markaz foydasidan olingan)
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
            '<div style="font-size:10.5px;color:#94a3b8;font-weight:700;">Joriy Tushum</div>' +
            '<div style="font-size:13.5px;font-weight:900;color:#10b981;margin-top:2px;">' + fmtShortUZS(data.totalRevenue) + '</div>' +
          '</div>' +
          '<div style="background:rgba(11,16,27,0.7);border:1px solid rgba(239,68,68,0.25);border-radius:12px;padding:10px 12px;">' +
            '<div style="font-size:10.5px;color:#94a3b8;font-weight:700;">Joriy Chiqim</div>' +
            '<div style="font-size:13.5px;font-weight:900;color:#f87171;margin-top:2px;">' + fmtShortUZS(totalOutflow) + '</div>' +
          '</div>' +
          '<div style="background:rgba(11,16,27,0.7);border:1px solid rgba(56,189,248,0.25);border-radius:12px;padding:10px 12px;">' +
            '<div style="font-size:10.5px;color:#94a3b8;font-weight:700;">Markaz Sof Foydasi</div>' +
            '<div style="font-size:13.5px;font-weight:900;color:#38bdf8;margin-top:2px;">' + fmtShortUZS(data.netProfit) + '</div>' +
          '</div>' +
          '<div style="background:rgba(11,16,27,0.7);border:1px solid rgba(168,85,247,0.25);border-radius:12px;padding:10px 12px;">' +
            '<div style="font-size:10.5px;color:#94a3b8;font-weight:700;">Rentabellik</div>' +
            '<div style="font-size:13.5px;font-weight:900;color:#c084fc;margin-top:2px;">' + data.profitMargin + '%</div>' +
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
          '<span style="background:rgba(16,185,129,0.18);color:#34d399;border:1px solid rgba(16,185,129,0.4);border-radius:20px;padding:4px 10px;font-size:11.5px;font-weight:900;">' + radarScore + ' / 100</span>' +
        '</div>' +

        '<div style="position:relative;height:250px;width:100%;">' +
          '<canvas id="eeCenterRadarChart"></canvas>' +
        '</div>' +

        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.08);">' +
          '<div style="display:flex;justify-content:space-between;padding:8px 10px;background:rgba(11,16,27,0.7);border-radius:8px;font-size:11.5px;">' +
            '<span style="color:#94a3b8;">To‘lov Intizomi:</span><strong style="color:#10b981;">' + payIntizom + '%</strong>' +
          '</div>' +
          '<div style="display:flex;justify-content:space-between;padding:8px 10px;background:rgba(11,16,27,0.7);border-radius:8px;font-size:11.5px;">' +
            '<span style="color:#94a3b8;">O‘qituvchi KPI:</span><strong style="color:#fbbf24;">' + teacherKpiScore + '%</strong>' +
          '</div>' +
          '<div style="display:flex;justify-content:space-between;padding:8px 10px;background:rgba(11,16,27,0.7);border-radius:8px;font-size:11.5px;">' +
            '<span style="color:#94a3b8;">Davomat Foizi:</span><strong style="color:#38bdf8;">' + davomatFoizi + '%</strong>' +
          '</div>' +
          '<div style="display:flex;justify-content:space-between;padding:8px 10px;background:rgba(11,16,27,0.7);border-radius:8px;font-size:11.5px;">' +
            '<span style="color:#94a3b8;">Sof Rentabellik:</span><strong style="color:#c084fc;">' + rentabellikScore + '%</strong>' +
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
    var currentRevMln = totalRev > 0 ? Number((totalRev / 1000000).toFixed(2)) : 0;
    var currentTeachMln = totalTeacher > 0 ? Number((totalTeacher / 1000000).toFixed(2)) : 0;
    var currentExpMln = totalExp > 0 ? Number((totalExp / 1000000).toFixed(2)) : 0;
    var currentNetMln = Number(((totalRev - totalTeacher - totalExp) / 1000000).toFixed(2));

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
        // Platforma yangi bo'lgani uchun oldingi oylar 0 dan boshlanadi, joriy oy (Oktabr) real vaqtda chiziladi
        var revData = [0, 0, 0, 0, 0, 0, 0, 0, 0, currentRevMln, 0, 0];
        var teacherData = [0, 0, 0, 0, 0, 0, 0, 0, 0, currentTeachMln, 0, 0];
        var utilAndExpData = [0, 0, 0, 0, 0, 0, 0, 0, 0, currentExpMln, 0, 0];
        var netData = [0, 0, 0, 0, 0, 0, 0, 0, 0, currentNetMln, 0, 0];

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
            labels: ['2022 yil', '2023 yil', '2024 yil', '2025 yil', '2026 yil (Joriy)'],
            datasets: [
              { label: 'Yillik Tushum (mln so‘m)', data: [0, 0, 0, 0, currentRevMln], backgroundColor: '#10B981', borderRadius: 6 },
              { label: 'O‘qituvchilar Maoshi (mln so‘m)', data: [0, 0, 0, 0, currentTeachMln], backgroundColor: '#F59E0B', borderRadius: 6 },
              { label: 'Chiqimlar (mln so‘m)', data: [0, 0, 0, 0, currentExpMln], backgroundColor: '#64748B', borderRadius: 6 },
              { label: 'Yillik Sof Foyda (mln so‘m)', data: [0, 0, 0, 0, currentNetMln], backgroundColor: '#38BDF8', borderRadius: 6 }
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
        var deltaVal = totalRev > 0 ? 100 : 0;
        var deltas = [0, 0, 0, 0, 0, 0, 0, 0, 0, deltaVal, 0, 0];
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

    // 2. 360° Radar Chart (Real vaqt dinamik aqlli hisobi)
    var radarCanvas = document.getElementById('eeCenterRadarChart');
    if (radarCanvas) {
      var rCtx = radarCanvas.getContext('2d');
      if (_radarChartInstance) _radarChartInstance.destroy();

      var rPay = totalRev > 0 ? Math.min(100, Math.round((totalRev / 30000000) * 100)) : 0;
      var rTeach = totalRev > 0 ? Math.min(100, Math.round(50 + (totalTeacher / (totalRev || 1)) * 50)) : 0;
      var rDavomat = totalRev > 0 ? Math.min(100, Math.round(rPay > 0 ? (rPay * 0.95 + 5) : 0)) : 0;
      var rRent = (totalRev > 0 && currentNetMln > 0) ? Math.min(100, Math.round((currentNetMln / currentRevMln) * 100)) : 0;
      var rTejamkorlik = totalRev > 0 ? Math.max(0, Math.min(100, Math.round(100 - (totalExp / totalRev) * 100))) : (totalExp > 0 ? 0 : 100);
      var rOsish = totalRev > 0 ? Math.min(100, Math.round((totalRev / 10000000) * 100)) : 0;

      _radarChartInstance = new window.Chart(rCtx, {
        type: 'radar',
        data: {
          labels: ['To‘lov Intizomi', 'O‘qituvchi KPI', 'O‘quvchi Davomati', 'Sof Rentabellik', 'Xarajat Nazorati', 'Yillik O‘sish'],
          datasets: [
            {
              label: '2026 Oktabr (Real Live)',
              data: [rPay, rTeach, rDavomat, rRent, rTejamkorlik, rOsish],
              backgroundColor: 'rgba(16, 185, 129, 0.25)',
              borderColor: '#10B981',
              borderWidth: 2.5,
              pointBackgroundColor: '#10B981',
              pointRadius: 4
            },
            {
              label: 'Oldingi Ko‘rsatkich (Boshlang‘ich)',
              data: [0, 0, 0, 0, 0, 0],
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              borderColor: 'rgba(245, 158, 11, 0.4)',
              borderWidth: 1.5,
              borderDash: [4, 4],
              pointBackgroundColor: '#F59E0B',
              pointRadius: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top', labels: { color: '#E2E8F0', font: { size: 10.5 } } } },
          scales: {
            r: {
              grid: { color: 'rgba(255,255,255,0.08)' },
              angleLines: { color: 'rgba(255,255,255,0.08)' },
              pointLabels: { color: '#94A3B8', font: { size: 10, weight: '700' } },
              ticks: { display: false, min: 0, max: 100 }
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

      var S = getStore();
      var cleanTeachers = (teachers || S.teachers || []).filter(function(t) {
        if (!t) return false;
        var nm = (t.name || '').trim().toLowerCase();
        var id = (t.id || '').trim().toLowerCase();
        return id !== 'admin_official_teacher' && id !== 't_zizi' && nm !== 'ustoz' && nm !== 'zizi ustoz';
      });

      var tNames = cleanTeachers.map(function(t) { return t.name; });
      var isLiveStarted = (S.config && S.config.liveSystemStarted === true);
      var tHours = cleanTeachers.map(function(t) { return isLiveStarted ? (Number(t.teachingHours) || 0) : 0; });
      var tEarnings = cleanTeachers.map(function(t) {
        if (!isLiveStarted) return 0;
        var paidCount = 0;
        var share = (t.salarySharePercent !== undefined) ? Number(t.salarySharePercent) : 50;
        var fee = Number(t.studentMonthlyFee) || 300000;
        (S.classes || []).forEach(function(cls) {
          if (cls.teacherId === t.id || (t.name && cls.teacherName && cls.teacherName.toLowerCase() === t.name.toLowerCase())) {
            (cls.students || []).forEach(function(st) {
              var stId = st.id || st.email;
              if (cls.studentPayments && cls.studentPayments[stId] && cls.studentPayments[stId].status === 'paid') {
                paidCount++;
              }
            });
          }
        });
        return +((paidCount * fee * (share / 100)) / 1000000).toFixed(2);
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
            x: { 
              grid: { color: 'rgba(255,255,255,0.05)' }, 
              ticks: { 
                color: '#fff', 
                font: { weight: '800', size: 10 },
                autoSkip: false,
                maxRotation: 45,
                minRotation: 35
              } 
            },
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
      // Toolbar with Search, Filters and Cyber-Neon Global Tariff Button
      '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:18px;">' +
        '<div style="display:flex;align-items:center;gap:10px;flex:1;min-width:240px;">' +
          '<input type="text" id="eeFinStudentSearchInp" placeholder="Ism, Gmail yoki guruh bo‘yicha qidiring..." style="width:100%;padding:11px 16px;background:#1e293b;border:1px solid rgba(56,189,248,0.3);border-radius:12px;color:#fff;font-weight:700;font-size:13.5px;outline:none;" />' +
        '</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">' +
          '<button class="ee-fin-st-filter-btn active" data-filter="all" style="background:#0284c7;color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:12px;font-weight:800;cursor:pointer;">Barchasi</button>' +
          '<button class="ee-fin-st-filter-btn" data-filter="paid" style="background:rgba(16,185,129,0.18);color:#34d399;border:1px solid rgba(16,185,129,0.4);border-radius:8px;padding:7px 14px;font-size:12px;font-weight:800;cursor:pointer;">✓ To‘laganlar</button>' +
          '<button class="ee-fin-st-filter-btn" data-filter="partial" style="background:rgba(245,158,11,0.18);color:#fbbf24;border:1px solid rgba(245,158,11,0.4);border-radius:8px;padding:7px 14px;font-size:12px;font-weight:800;cursor:pointer;">? Chala to‘laganlar</button>' +
          '<button class="ee-fin-st-filter-btn" data-filter="unpaid" style="background:rgba(239,68,68,0.18);color:#f87171;border:1px solid rgba(239,68,68,0.4);border-radius:8px;padding:7px 14px;font-size:12px;font-weight:800;cursor:pointer;">✗ Qarzdorlar</button>' +
          '<button id="eeBtnSetGlobalTariff" title="Barcha o‘quvchilar uchun bir xil narx belgilash" style="background:linear-gradient(135deg,rgba(56,189,248,0.22),rgba(14,165,233,0.35));color:#38bdf8;border:1.5px solid #38bdf8;border-radius:8px;padding:7px 14px;font-size:12px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 0 15px rgba(56,189,248,0.3);margin-left:6px;">⚡ Hamma Uchun Tarif Belgilash</button>' +
        '</div>' +
      '</div>' +

      // Table Container
      '<div style="overflow-x:auto;">' +
        '<table style="width:100%;border-collapse:collapse;font-size:13px;text-align:left;">' +
          '<thead>' +
            '<tr style="background:rgba(30,41,59,0.85);color:#94a3b8;font-size:11.5px;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,0.08);white-space:nowrap;">' +
              '<th style="padding:12px 14px;white-space:nowrap;">O‘quvchi</th>' +
              '<th style="padding:12px 14px;white-space:nowrap;">Guruh</th>' +
              '<th style="padding:12px 14px;white-space:nowrap;">Oylik Tarif</th>' +
              '<th style="padding:12px 14px;white-space:nowrap;">To‘langan</th>' +
              '<th style="padding:12px 14px;white-space:nowrap;">Qoldiq</th>' +
              '<th style="padding:12px 14px;text-align:center;white-space:nowrap;">Holat</th>' +
              '<th style="padding:12px 14px;white-space:nowrap;">Usul / Sana</th>' +
              '<th style="padding:12px 14px;text-align:right;white-space:nowrap;">Amallar</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody id="eeFinStudentTableBody">';

          studentList.forEach(function(s, idx) {
            var fee = s.fee || 300000;
            var paid = s.paid || 0;
            var debt = Math.max(0, fee - paid);
            var isPaid = s.status === 'paid' || paid >= fee;
            var isPartial = !isPaid && paid > 0;

            var statusBadge = '';
            if (isPaid) {
              statusBadge = '<span style="display:inline-flex;align-items:center;justify-content:center;gap:4px;white-space:nowrap;background:rgba(16,185,129,0.2);color:#34d399;border:1px solid rgba(16,185,129,0.5);padding:4px 12px;border-radius:10px;font-size:12px;font-weight:900;">✓ To‘langan</span>';
            } else if (isPartial) {
              statusBadge = '<span style="display:inline-flex;align-items:center;justify-content:center;gap:4px;white-space:nowrap;background:rgba(245,158,11,0.2);color:#fbbf24;border:1px solid rgba(245,158,11,0.5);padding:4px 12px;border-radius:10px;font-size:12px;font-weight:900;">? Qisman</span>';
            } else {
              statusBadge = '<span style="display:inline-flex;align-items:center;justify-content:center;gap:5px;white-space:nowrap;background:rgba(239,68,68,0.2);color:#f87171;border:1px solid rgba(239,68,68,0.5);padding:4px 12px;border-radius:10px;font-size:12px;font-weight:900;"><span>✗</span> <span>Bermagan</span></span>';
            }

            h += '<tr class="ee-fin-st-row" data-status="' + s.status + '" style="border-bottom:1px solid rgba(255,255,255,0.06);background:' + (idx % 2 === 0 ? 'rgba(15,23,42,0.3)' : 'rgba(30,41,59,0.3)') + ';white-space:nowrap;">' +
              '<td style="padding:12px 14px;white-space:nowrap;">' +
                '<div style="display:flex;align-items:center;gap:10px;">' +
                  '<span style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;font-weight:900;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;">' + esc((s.name || 'O').charAt(0).toUpperCase()) + '</span>' +
                  '<div>' +
                    '<div style="font-weight:800;color:#f8fafc;white-space:nowrap;">' + esc(s.name) + '</div>' +
                    '<div style="font-size:11px;color:#94a3b8;white-space:nowrap;">' + esc(s.email || s.phone) + '</div>' +
                  '</div>' +
                '</div>' +
              '</td>' +
              '<td style="padding:12px 14px;white-space:nowrap;"><span style="background:rgba(56,189,248,0.12);color:#38bdf8;padding:3px 8px;border-radius:6px;font-size:11.5px;font-weight:700;white-space:nowrap;">' + esc(s.className) + '</span></td>' +
              '<td style="padding:12px 14px;font-weight:800;color:#e2e8f0;font-family:monospace;white-space:nowrap;">' + fmtUZS(fee) + '</td>' +
              '<td style="padding:12px 14px;font-weight:900;color:#34d399;font-family:monospace;white-space:nowrap;">' + fmtUZS(paid) + '</td>' +
              '<td style="padding:12px 14px;font-weight:900;color:' + (debt > 0 ? '#ff4d4d' : '#94a3b8') + ';font-family:monospace;white-space:nowrap;">' + (debt > 0 ? fmtUZS(debt) : '—') + '</td>' +
              '<td style="padding:12px 14px;text-align:center;white-space:nowrap;">' + statusBadge + '</td>' +
              '<td style="padding:12px 14px;white-space:nowrap;"><div style="font-weight:700;color:#cbd5e1;white-space:nowrap;">' + esc(s.method) + '</div><div style="font-size:11px;color:#94a3b8;white-space:nowrap;">' + esc(s.date) + '</div></td>' +
              '<td style="padding:12px 14px;text-align:right;white-space:nowrap;">' +
                '<div style="display:inline-flex;gap:6px;white-space:nowrap;">' +
                  '<button class="ee-fin-st-pay-btn" data-stid="' + esc(s.id) + '" data-stname="' + esc(s.name) + '" data-stfee="' + fee + '" data-stpaid="' + paid + '" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:8px;padding:6px 12px;font-size:11.5px;font-weight:800;cursor:pointer;white-space:nowrap;">💵 To‘lov</button>' +
                  '<button class="ee-fin-st-edit-fee-btn" data-stid="' + esc(s.id) + '" data-stname="' + esc(s.name) + '" data-stclassname="' + esc(s.className) + '" data-stfee="' + fee + '" title="Oylik tarifni o‘zgartirish" style="background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.3);border-radius:8px;padding:6px 12px;font-size:11.5px;font-weight:800;cursor:pointer;white-space:nowrap;">✏️ Tarif</button>' +
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
    var S = getStore();

    // Sort teachers: whoever has unpaid months appears first (#1 ga chiqadi!)
    var sortedTeachers = (teachers || []).slice().sort(function(a, b) {
      var aUnpaid = Number(a.unpaidMonths) || 0;
      var bUnpaid = Number(b.unpaidMonths) || 0;
      if (bUnpaid !== aUnpaid) {
        return bUnpaid - aUnpaid; // highest unpaid first!
      }
      return (b.computedLiveSalary || 0) - (a.computedLiveSalary || 0);
    });

    var h = '<div style="display:flex;flex-direction:column;gap:20px;">' +
      
      // CHARTS SECTION (2 Columns: Hourly Rate Distribution + Subject Specialties)
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">' +
        '<div style="background:rgba(15,23,42,0.85);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:22px;backdrop-filter:blur(20px);box-shadow:0 10px 30px rgba(0,0,0,0.4);">' +
          '<h3 style="margin:0 0 14px;font-size:16px;font-weight:900;color:#fff;">📊 Ustozlar O‘tilgan Dars Soatlari va Maosh Solishtiruvi</h3>' +
          '<div style="position:relative;height:240px;width:100%;">' +
            '<canvas id="eeTeacherPayrollBarChart"></canvas>' +
          '</div>' +
        '</div>' +
        '<div style="background:rgba(15,23,42,0.85);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:22px;backdrop-filter:blur(20px);box-shadow:0 10px 30px rgba(0,0,0,0.4);">' +
          '<h3 style="margin:0 0 14px;font-size:16px;font-weight:900;color:#fff;">🎯 Pedagogik Intizom va Davomat Radari</h3>' +
          '<div style="position:relative;height:240px;width:100%;">' +
            '<canvas id="eeTeacherRadarChart"></canvas>' +
          '</div>' +
        '</div>' +
      '</div>' +

      // TEACHERS TABLE
      '<div style="background:rgba(15,23,42,0.85);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:24px;backdrop-filter:blur(20px);box-shadow:0 10px 30px rgba(0,0,0,0.4);">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px;">' +
          '<div>' +
            '<h3 style="margin:0;font-size:18px;font-weight:900;color:#fff;">O‘qituvchilar Shtati va Ulush Maoshi (Payroll)</h3>' +
            '<p style="margin:4px 0 0;font-size:12.5px;color:#94a3b8;">Haqiqiy to‘lovlar asosida: har bir o‘quvchining to‘lagan pulidan ustoz ulushi ajratiladi.</p>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
            '<button id="eeBtnAdvanceMonth" title="Keyingi oyga o‘tish (To‘lanmagan o‘qituvchilar qarzdorligi 1 oyga oshadi va 1-o‘ringa chiqadi)" style="background:rgba(255,255,255,0.06);color:#cbd5e1;border:1px solid rgba(255,255,255,0.18);border-radius:10px;padding:9px 15px;font-size:12.5px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all 0.2s;">⏭️ Keyingi Oyga O‘tish</button>' +
            '<button id="eeBtnPayAllSalaries" title="Barcha o‘qituvchilarga oylik berish va joriy oyni yopish" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:10px;padding:10px 18px;font-size:13px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:8px;box-shadow:0 0 20px rgba(16,185,129,0.45);transition:all 0.2s;">💰 Oyliklar Berildi (Oylikni Yopish)</button>' +
          '</div>' +
        '</div>' +

        '<div style="overflow-x:auto;">' +
          '<table style="width:100%;border-collapse:collapse;text-align:left;">' +
            '<thead>' +
              '<tr style="border-bottom:1px solid rgba(255,255,255,0.1);font-size:11px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.04em;white-space:nowrap;">' +
                '<th style="padding:12px 14px;white-space:nowrap;">№</th>' +
                '<th style="padding:12px 14px;white-space:nowrap;">O‘qituvchi</th>' +
                '<th style="padding:12px 14px;white-space:nowrap;">Mutaxassislik</th>' +
                '<th style="padding:12px 14px;white-space:nowrap;">O‘tilgan Dars Soati</th>' +
                '<th style="padding:12px 14px;white-space:nowrap;">Soatlik Dars Haqi</th>' +
                '<th style="padding:12px 14px;white-space:nowrap;">Ulush Foizi</th>' +
                '<th style="padding:12px 14px;white-space:nowrap;">Joriy Oyda Hisoblangan Maosh</th>' +
                '<th style="padding:12px 14px;white-space:nowrap;">Holat</th>' +
                '<th style="padding:12px 14px;text-align:right;white-space:nowrap;">Amal</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              sortedTeachers.map(function(t, idx) {
                var hours = Number(t.teachingHours) || 0;
                var rate = Number(t.hourlyRate) || 100000;
                var share = (t.salarySharePercent !== undefined) ? Number(t.salarySharePercent) : 50;
                var unpaidCount = Number(t.unpaidMonths) || 0;
                var isPaid = (t.paidThisMonth === true);

                // Real-time calculation strictly based on students marked paid by admin
                var paidStudentsCount = 0;
                var tCollectedSum = 0;
                var tFee = Number(t.studentMonthlyFee) || 300000;
                (S.classes || []).forEach(function(cls) {
                  if (cls.teacherId === t.id || (t.name && cls.teacherName && cls.teacherName.toLowerCase() === t.name.toLowerCase())) {
                    (cls.students || []).forEach(function(st) {
                      var stId = st.id || st.email;
                      var p = (cls.studentPayments && cls.studentPayments[stId]) || (S.finance.studentFees && S.finance.studentFees[stId]);
                      if (p && (p.status === 'paid' || Number(p.paid) > 0)) {
                        paidStudentsCount++;
                        var actualPaid = Number(p.paid) || tFee;
                        tCollectedSum += actualPaid;
                      }
                    });
                  }
                });
                var total = Math.round(tCollectedSum * (share / 100));

                var statusBadge = '';
                if (unpaidCount >= 2) {
                  statusBadge = '<span style="display:inline-flex;align-items:center;gap:4px;background:rgba(239,68,68,0.25);color:#f87171;border:1.5px solid #ef4444;padding:4px 10px;border-radius:8px;font-size:11.5px;font-weight:900;white-space:nowrap;box-shadow:0 0 12px rgba(239,68,68,0.35);">⚠️ ' + unpaidCount + ' oylik berilmagan</span>';
                } else if (unpaidCount === 1) {
                  statusBadge = '<span style="display:inline-flex;align-items:center;gap:4px;background:rgba(245,158,11,0.2);color:#fbbf24;border:1.5px solid #f59e0b;padding:4px 10px;border-radius:8px;font-size:11.5px;font-weight:900;white-space:nowrap;">⚠️ 1 oylik berilmagan</span>';
                } else if (isPaid) {
                  statusBadge = '<span style="display:inline-flex;align-items:center;gap:4px;background:rgba(16,185,129,0.2);color:#34d399;border:1.5px solid #10b981;padding:4px 10px;border-radius:8px;font-size:11.5px;font-weight:900;white-space:nowrap;">✓ Oylik To‘landi</span>';
                } else {
                  statusBadge = '<span style="display:inline-flex;align-items:center;gap:4px;background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.4);padding:4px 10px;border-radius:8px;font-size:11.5px;font-weight:900;white-space:nowrap;">⏳ Hisoblanmoqda (Kutilmoqda)</span>';
                }

                var rankBadge = (unpaidCount >= 1) 
                  ? ('<span style="background:#ef4444;color:#fff;font-size:10.5px;font-weight:900;padding:2px 6px;border-radius:6px;box-shadow:0 0 8px rgba(239,68,68,0.5);">#' + (idx + 1) + '</span>')
                  : ('<span style="color:#64748b;font-weight:700;font-size:12px;">#' + (idx + 1) + '</span>');

                return '<tr style="border-bottom:1px solid rgba(255,255,255,0.06);white-space:nowrap;transition:background 0.15s;' + (unpaidCount >= 1 ? 'background:rgba(239,68,68,0.04);' : '') + '" onmouseover="this.style.background=\'rgba(255,255,255,0.02)\'" onmouseout="this.style.background=\'transparent\'">' +
                  '<td style="padding:14px;white-space:nowrap;">' + rankBadge + '</td>' +
                  '<td style="padding:14px;white-space:nowrap;">' +
                    '<div style="display:flex;align-items:center;gap:12px;">' +
                      '<span style="width:36px;height:36px;border-radius:10px;background:#0284c7;color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;flex-shrink:0;">' + (t.name ? t.name.charAt(0).toUpperCase() : 'U') + '</span>' +
                      '<div><div style="font-size:13.5px;font-weight:800;color:#fff;white-space:nowrap;">' + esc(t.name) + '</div>' +
                      '<div style="font-size:11px;color:#94a3b8;white-space:nowrap;">' + esc(t.email || '') + '</div></div>' +
                    '</div>' +
                  '</td>' +
                  '<td style="padding:14px;font-size:13px;color:#cbd5e1;font-weight:700;white-space:nowrap;">' + esc(t.subject || 'Ingliz tili') + '</td>' +
                  '<td style="padding:14px;white-space:nowrap;"><span style="background:rgba(56,189,248,0.15);color:#38bdf8;padding:4px 10px;border-radius:8px;font-size:12.5px;font-weight:900;white-space:nowrap;">' + hours + ' soat</span></td>' +
                  '<td style="padding:14px;font-size:13px;color:#fff;font-weight:800;white-space:nowrap;">' + fmtUZS(rate) + ' <span style="font-size:11px;color:#94a3b8;">/ soat</span></td>' +
                  '<td style="padding:14px;font-size:13px;color:#c084fc;font-weight:900;white-space:nowrap;">' + share + '%</td>' +
                  '<td style="padding:14px;font-size:14px;color:#34d399;font-weight:900;white-space:nowrap;">' + (total > 0 ? (fmtUZS(total) + ' <span style="font-size:11px;color:#94a3b8;">(' + paidStudentsCount + ' ta to‘lagan)</span>') : '0 so‘m') + '</td>' +
                  '<td style="padding:14px;white-space:nowrap;">' + statusBadge + '</td>' +
                  '<td style="padding:14px;text-align:right;white-space:nowrap;">' +
                    '<button class="ee-fin-edit-teacher-btn" data-tid="' + esc(t.id) + '" data-tname="' + esc(t.name) + '" data-thours="' + hours + '" data-trate="' + rate + '" data-tshare="' + share + '" data-tunpaid="' + unpaidCount + '" data-tpaid="' + (isPaid ? '1' : '0') + '" style="background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.35);border-radius:8px;padding:6px 12px;font-size:11.5px;font-weight:800;cursor:pointer;white-space:nowrap;">⚙️ Tahrir</button>' +
                    '<button class="ee-fin-del-teacher-btn" data-tid="' + esc(t.id) + '" data-tname="' + esc(t.name) + '" style="background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.35);border-radius:8px;padding:6px 12px;font-size:11.5px;font-weight:800;cursor:pointer;margin-left:6px;white-space:nowrap;" title="O‘qituvchini o‘chirish">🗑️ O‘chirish</button>' +
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
    if (!Array.isArray(expenses)) expenses = [];
    var totalExp = expenses.reduce(function(acc, x) { return acc + (Number(x.amount) || 0); }, 0);

    var h = '<div style="background:rgba(15,23,42,0.92);border:1px solid rgba(255,255,255,0.1);border-radius:22px;padding:22px;box-shadow:0 10px 40px rgba(0,0,0,0.4);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px;">' +
        '<div>' +
          '<h3 style="margin:0;font-size:19px;font-weight:900;color:#fff;display:flex;align-items:center;gap:10px;">' +
            '<span>💸 Markaz Xarajatlari Boshqaruvi</span>' +
            '<span style="background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.4);color:#fca5a5;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:800;">Jami: ' + fmtUZS(totalExp) + '</span>' +
          '</h3>' +
          '<div style="font-size:12.5px;color:#94a3b8;margin-top:4px;">Tok, ijara, kommunal, internet va boshqa moddiy xarajatlar real vaqtda saqlanadi.</div>' +
        '</div>' +
        '<button id="eeBtnAddExpenseInner" style="background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;border:none;border-radius:12px;padding:10px 20px;font-size:13px;font-weight:900;cursor:pointer;box-shadow:0 4px 16px rgba(239,68,68,0.4);display:inline-flex;align-items:center;gap:6px;">+ Yangi Xarajat Kiritish</button>' +
      '</div>';

    if (expenses.length === 0) {
      h += '<div style="background:rgba(15,23,42,0.6);border:1.5px dashed rgba(255,255,255,0.12);border-radius:18px;padding:40px 20px;text-align:center;color:#94a3b8;">' +
        '<div style="font-size:36px;margin-bottom:10px;">🧾</div>' +
        '<div style="font-size:15px;font-weight:800;color:#fff;">Hozircha xarajatlar kiritilmagan</div>' +
        '<div style="font-size:12px;margin-top:4px;">Yuqoridagi "+ Yangi Xarajat Kiritish" tugmasini bosib birinchi xarajatni kiriting.</div>' +
      '</div>';
    } else {
      h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;">';
      expenses.forEach(function(e) {
        var eDate = e.date || 'Bugun';
        var eTime = e.time || '17:00';
        var catName = e.category || 'Operatsion';
        h += '<div style="background:linear-gradient(145deg,rgba(30,41,59,0.9),rgba(15,23,42,0.95));border:1.5px solid rgba(239,68,68,0.3);border-radius:16px;padding:16px 18px;box-shadow:0 8px 24px rgba(0,0,0,0.5);display:flex;flex-direction:column;justify-content:space-between;gap:12px;transition:all 0.2s;">' +
          '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;">' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
              '<span style="font-size:24px;width:42px;height:42px;background:rgba(239,68,68,0.14);border:1px solid rgba(239,68,68,0.3);border-radius:12px;display:flex;align-items:center;justify-content:center;">' + (e.icon || '💸') + '</span>' +
              '<div>' +
                '<div style="font-size:14px;font-weight:900;color:#fff;line-height:1.2;">' + esc(e.title) + '</div>' +
                '<div style="font-size:11px;color:#94a3b8;font-weight:700;margin-top:3px;text-transform:uppercase;letter-spacing:0.5px;">' + esc(catName) + '</div>' +
              '</div>' +
            '</div>' +
            '<button class="ee-fin-del-exp-btn" data-eid="' + esc(e.id) + '" title="Xarajatni o‘chirish" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);color:#f87171;border-radius:8px;padding:4px 8px;font-size:11px;cursor:pointer;font-weight:800;">🗑️</button>' +
          '</div>' +
          '<div style="display:flex;align-items:flex-end;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.08);padding-top:10px;margin-top:2px;">' +
            '<div>' +
              '<div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;">Xarajat Summasi:</div>' +
              '<div style="font-size:18px;font-weight:900;color:#f87171;font-family:monospace;letter-spacing:-0.5px;">' + fmtUZS(e.amount) + '</div>' +
            '</div>' +
            '<div style="text-align:right;font-size:11px;color:#cbd5e1;font-weight:700;font-family:monospace;background:rgba(0,0,0,0.3);padding:4px 8px;border-radius:6px;border:1px solid rgba(255,255,255,0.06);">' +
              '📅 ' + esc(eDate) + '<br>⏰ ' + esc(eTime) +
            '</div>' +
          '</div>' +
        '</div>';
      });
      h += '</div>';
    }

    h += '</div>';
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
        EE.openRecordPaymentModal(container, S, studentList, stId, stName, fee, paid, activeTab);
      };
    });

    // Student Edit Fee Button (✏️ Tarif) - Opens Cyber-Neon Modal
    container.querySelectorAll('.ee-fin-st-edit-fee-btn').forEach(function(btn) {
      btn.onclick = function() {
        var stId = btn.getAttribute('data-stid');
        var stName = btn.getAttribute('data-stname');
        var stClassName = btn.getAttribute('data-stclassname');
        var fee = parseInt(btn.getAttribute('data-stfee'), 10) || 300000;
        EE.openCyberNeonTariffModal(container, S, {
          id: stId,
          name: stName,
          className: stClassName,
          fee: fee
        });
      };
    });

    // Global Tariff Button (Toolbar)
    var globalTariffBtn = container.querySelector('#eeBtnSetGlobalTariff');
    if (globalTariffBtn) {
      globalTariffBtn.onclick = function() {
        EE.openCyberNeonTariffModal(container, S, null);
      };
    }

    // Pay All Salaries & Close Month Button (💰 Oyliklar Berildi)
    var payAllBtn = container.querySelector('#eeBtnPayAllSalaries');
    if (payAllBtn) {
      payAllBtn.onclick = function() {
        var teachers = S.teachers || [];
        var totalPayout = 0;
        teachers.forEach(function(t) {
          totalPayout += (Number(t.computedLiveSalary) || 0);
        });

        if (!confirm("Barcha o‘qituvchilarga jami " + fmtUZS(totalPayout) + " miqdoridagi oylik maoshlar to‘liq berildimi va joriy oy yopilsinmi?\n\n• Barcha o‘qituvchilarga '✓ Oylik To‘landi' belgilanadi\n• Qarzdorlik oylari 0 ga tushiriladi\n• Joriy oy to‘liq yopilib, keyingi oydan yangittan 0 so‘mdan hisoblash boshlanadi\n• Markaz xarajatlariga o‘qituvchi maoshlari sifatida saqlanadi")) {
          return;
        }

        var tMap = {};
        try { tMap = JSON.parse(localStorage.getItem('ethith_teacher_settings') || '{}'); } catch(e) {}

        teachers.forEach(function(t) {
          t.paidThisMonth = true;
          t.unpaidMonths = 0;
          if (!tMap[t.id]) tMap[t.id] = {};
          tMap[t.id].paidThisMonth = true;
          tMap[t.id].unpaidMonths = 0;
        });
        try { localStorage.setItem('ethith_teacher_settings', JSON.stringify(tMap)); } catch(e) {}

        // Add expense record
        if (!S.finance.expenses) S.finance.expenses = [];
        var now = new Date();
        var curDateStr = now.toISOString().split('T')[0];
        var curTimeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

        if (totalPayout > 0) {
          S.finance.expenses.unshift({
            id: 'exp_sal_' + Date.now(),
            title: "O‘qituvchilar Shtati Oylik Maoshlari To‘lovi",
            amount: totalPayout,
            category: 'payroll',
            icon: '👨‍🏫',
            date: curDateStr,
            time: curTimeStr
          });
        }

        // Reset student payments for the fresh next month cycle:
        (S.classes || []).forEach(function(cls) {
          if (cls.studentPayments) {
            Object.keys(cls.studentPayments).forEach(function(sid) {
              cls.studentPayments[sid].paid = 0;
              cls.studentPayments[sid].status = 'unpaid';
            });
          }
        });
        if (S.finance.studentFees) {
          Object.keys(S.finance.studentFees).forEach(function(sid) {
            S.finance.studentFees[sid].paid = 0;
            S.finance.studentFees[sid].status = 'unpaid';
          });
        }

        saveStore();
        showToast("✅ Barcha o‘qituvchilarga oyliklar to‘landi! Oy to‘liq yopildi va yangi davr 0 so‘mdan boshlandi.");
        EE.renderFinanceUnifiedView(container, 'teachers');
      };
    }

    // Advance Month Button (⏭️ Keyingi Oyga O‘tish)
    var advMonthBtn = container.querySelector('#eeBtnAdvanceMonth');
    if (advMonthBtn) {
      advMonthBtn.onclick = function() {
        if (!confirm("Keyingi oyga o‘tilsinmi?\n\n• Agar o‘qituvchiga oylik to‘lanmagan bo‘lsa, uning qarzdor oylari soni 1 taga oshadi (masalan: 2 oylik berilmagan)\n• Oyligi berilmagan o‘qituvchilar avtomatik tarzda ro‘yxatda 1-o‘ringa chiqadi\n• Oyligi to‘langan o‘qituvchilar esa yangi oy uchun 0 so‘mdan yangitdan hisoblanadi")) {
          return;
        }

        var tMap = {};
        try { tMap = JSON.parse(localStorage.getItem('ethith_teacher_settings') || '{}'); } catch(e) {}

        (S.teachers || []).forEach(function(t) {
          if (t.paidThisMonth !== true) {
            t.unpaidMonths = (Number(t.unpaidMonths) || 0) + 1;
          } else {
            t.paidThisMonth = false;
            t.unpaidMonths = 0;
          }
          if (!tMap[t.id]) tMap[t.id] = {};
          tMap[t.id].paidThisMonth = t.paidThisMonth;
          tMap[t.id].unpaidMonths = t.unpaidMonths;
        });
        try { localStorage.setItem('ethith_teacher_settings', JSON.stringify(tMap)); } catch(e) {}

        saveStore();
        showToast("⏭️ Yangi oyga o‘tildi! Oyligi berilmagan o‘qituvchilar 1-o‘ringa chiqdi.");
        EE.renderFinanceUnifiedView(container, 'teachers');
      };
    }

    // Teacher Edit Button (⚙️ Tahrir)
    container.querySelectorAll('.ee-fin-edit-teacher-btn').forEach(function(btn) {
      btn.onclick = function() {
        var tid = btn.getAttribute('data-tid');
        EE.openEditTeacherPayrollModal(container, S, tid);
      };
    });

    // Teacher Delete Button (🗑️ O‘chirish)
    container.querySelectorAll('.ee-fin-del-teacher-btn').forEach(function(btn) {
      btn.onclick = function(e) {
        if (e) e.stopPropagation();
        var tid = btn.getAttribute('data-tid');
        var tname = btn.getAttribute('data-tname');
        EE.deleteTeacher(container, S, tid, tname);
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
        EE.openAddExpenseModal(container, S, activeTab);
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
  // --------------------------------------------------------------------------
  // MODAL: RECORD STUDENT PAYMENT (USTOZ BO'YICHA SARALASH VA QIDIRUV BILAN)
  // --------------------------------------------------------------------------
  EE.openRecordPaymentModal = function(container, S, studentList, selStId, selStName, fee, paid, activeTab) {
    var modalRoot = document.getElementById('eaGlobalModalRoot') || document.body;
    var existing = document.getElementById('eeFinPayModalOverlay');
    if (existing) existing.remove();

    var m = document.createElement('div');
    m.id = 'eeFinPayModalOverlay';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.85);backdrop-filter:blur(24px);z-index:2147483645;display:flex;align-items:center;justify-content:center;padding:16px;';

    // Enrich each student with teacher info from classes
    studentList.forEach(function(st) {
      var cls = (S.classes || []).find(function(c) { return c && (c.id === st.classId || c.name === st.className); });
      if (cls) {
        st.teacherId = cls.teacherId || '';
        st.teacherName = cls.teacherName || '';
      }
    });

    var teachersList = (S.teachers || []).filter(function(t) { return t && t.name; });

    var teacherOptionsHtml = '<option value="">-- Barcha Ustozlar (' + teachersList.length + ' ta) --</option>';
    teachersList.forEach(function(t) {
      teacherOptionsHtml += '<option value="' + esc(t.id) + '">👨‍🏫 ' + esc(t.name) + ' (' + esc(t.subject || 'Ingliz tili') + ')</option>';
    });

    m.innerHTML = '<div style="background:rgba(15,23,42,0.96);border:1px solid rgba(16,185,129,0.4);border-radius:24px;max-width:500px;width:100%;padding:26px 28px;color:#f8fafc;box-shadow:0 25px 60px rgba(0,0,0,0.7),0 0 40px rgba(16,185,129,0.2);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:14px;">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<span style="font-size:22px;">💵</span>' +
          '<h3 style="margin:0;font-size:18px;font-weight:900;color:#fff;">O‘quvchi To‘lovini Qabul Qilish</h3>' +
        '</div>' +
        '<button id="eeClosePayModal" style="background:none;border:none;color:#94a3b8;font-size:22px;cursor:pointer;">✕</button>' +
      '</div>' +

      '<div style="display:flex;flex-direction:column;gap:14px;">' +
        // 1. Ustozni tanlash
        '<div>' +
          '<label style="display:block;font-size:11.5px;font-weight:800;color:#38bdf8;text-transform:uppercase;margin-bottom:6px;">👨‍🏫 1. Qaysi Ustozning O‘quvchisi?</label>' +
          '<select id="eePayTeacherSelect" style="width:100%;padding:11px 12px;background:#1e293b;border:1.5px solid rgba(56,189,248,0.4);border-radius:12px;color:#fff;font-weight:700;font-size:13.5px;outline:none;">' +
            teacherOptionsHtml +
          '</select>' +
        '</div>' +

        // 2. Qidiruv qatori
        '<div>' +
          '<label style="display:block;font-size:11.5px;font-weight:800;color:#94a3b8;text-transform:uppercase;margin-bottom:6px;">🔍 2. O‘quvchini Qidirish</label>' +
          '<input type="text" id="eePaySearchInput" placeholder="Ism yoki guruh bo‘yicha tezkor qidirish..." style="width:100%;padding:10px 14px;background:#0f172a;border:1px solid rgba(255,255,255,0.15);border-radius:10px;color:#fff;font-size:13px;outline:none;box-sizing:border-box;" />' +
        '</div>' +

        // 3. O'quvchini tanlash
        '<div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">' +
            '<label style="font-size:11.5px;font-weight:800;color:#cbd5e1;text-transform:uppercase;">👤 3. O‘quvchini Tanlang:</label>' +
            '<span id="eePayStCountBadge" style="font-size:11px;color:#38bdf8;font-weight:700;">' + studentList.length + ' ta o‘quvchi</span>' +
          '</div>' +
          '<select id="eePayStSelect" style="width:100%;padding:12px;background:#1e293b;border:1px solid rgba(56,189,248,0.3);border-radius:12px;color:#fff;font-weight:700;font-size:13.5px;outline:none;">' +
          '</select>' +
        '</div>' +

        // 4. To'langan summa
        '<div>' +
          '<label style="display:block;font-size:11.5px;font-weight:800;color:#10b981;text-transform:uppercase;margin-bottom:6px;">To‘langan Summa (so‘m)</label>' +
          '<input type="number" id="eePayAmountInp" value="' + (paid || fee || 300000) + '" style="width:100%;padding:12px 14px;background:#1e293b;border:1.5px solid #10b981;border-radius:12px;color:#34d399;font-weight:900;font-size:18px;outline:none;box-sizing:border-box;" />' +
        '</div>' +

        // 5. To'lov usuli
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

    var tSelect = m.querySelector('#eePayTeacherSelect');
    var sInput = m.querySelector('#eePaySearchInput');
    var stSelect = m.querySelector('#eePayStSelect');
    var stBadge = m.querySelector('#eePayStCountBadge');
    var amtInput = m.querySelector('#eePayAmountInp');

    // Dynamic Filter Function
    function renderFilteredStudents() {
      var selTid = tSelect.value;
      var q = sInput.value.trim().toLowerCase();

      var filtered = studentList.filter(function(st) {
        if (selTid) {
          var matchT = (st.teacherId === selTid);
          if (!matchT) {
            var tObj = teachersList.find(function(t) { return t.id === selTid; });
            if (tObj && tObj.name && st.teacherName && tObj.name.toLowerCase() === st.teacherName.toLowerCase()) {
              matchT = true;
            }
          }
          if (!matchT) return false;
        }
        if (q) {
          var sStr = (st.name + ' ' + (st.className || '') + ' ' + (st.teacherName || '')).toLowerCase();
          if (!sStr.includes(q)) return false;
        }
        return true;
      });

      stBadge.innerText = filtered.length + ' ta o‘quvchi';

      if (filtered.length === 0) {
        stSelect.innerHTML = '<option value="">Mos keluvchi o‘quvchi topilmadi</option>';
        return;
      }

      var optHtml = '';
      filtered.forEach(function(s) {
        var isSel = (s.id === selStId);
        optHtml += '<option value="' + esc(s.id) + '" ' + (isSel ? 'selected' : '') + '>' + esc(s.name) + ' (' + esc(s.className || 'Guruh') + (s.teacherName ? ' • ' + esc(s.teacherName) : '') + ')</option>';
      });
      stSelect.innerHTML = optHtml;

      var currentChosen = filtered.find(function(x) { return x.id === stSelect.value; }) || filtered[0];
      if (currentChosen) {
        amtInput.value = currentChosen.fee || 300000;
      }
    }

    tSelect.onchange = renderFilteredStudents;
    sInput.oninput = renderFilteredStudents;

    stSelect.onchange = function() {
      var currentChosen = studentList.find(function(x) { return x.id === stSelect.value; });
      if (currentChosen) {
        amtInput.value = currentChosen.fee || 300000;
      }
    };

    renderFilteredStudents();

    m.querySelector('#eeSavePayModal').onclick = function() {
      var sId = stSelect.value;
      if (!sId) {
        alert("Iltimos, o‘quvchini tanlang!");
        return;
      }
      var amt = parseInt(amtInput.value, 10) || 0;
      var method = m.querySelector('#eePayMethodSelect').value;

      var st = studentList.find(function(x) { return x.id === sId; });
      var feeVal = (st && st.fee) || 300000;
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
      EE.renderFinanceUnifiedView(container, activeTab || 'overview');
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

    var hours = Number(t.teachingHours) || 0;
    var rate = Number(t.hourlyRate) || 100000;
    var share = (t.salarySharePercent !== undefined) ? Number(t.salarySharePercent) : 50;
    var unpaid = Number(t.unpaidMonths) || 0;
    var isPaid = (t.paidThisMonth === true);

    var m = document.createElement('div');
    m.id = 'eeFinTeacherModalOverlay';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.85);backdrop-filter:blur(24px);z-index:2147483645;display:flex;align-items:center;justify-content:center;padding:16px;';

    m.innerHTML = '<div style="background:rgba(15,23,42,0.96);border:1.5px solid rgba(56,189,248,0.4);border-radius:24px;max-width:500px;width:100%;padding:26px 28px;color:#f8fafc;box-shadow:0 25px 60px rgba(0,0,0,0.7),0 0 40px rgba(56,189,248,0.2);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:14px;">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<span style="font-size:22px;">⚙️</span>' +
          '<h3 style="margin:0;font-size:18px;font-weight:900;color:#fff;">O‘qituvchi Maosh Ulushi va Parametrlari</h3>' +
        '</div>' +
        '<button id="eeCloseTeacherModal" style="background:none;border:none;color:#94a3b8;font-size:22px;cursor:pointer;">✕</button>' +
      '</div>' +

      '<div style="display:flex;flex-direction:column;gap:14px;">' +
        '<div>' +
          '<label style="display:block;font-size:11.5px;font-weight:800;color:#94a3b8;text-transform:uppercase;margin-bottom:6px;">O‘qituvchi Ismi</label>' +
          '<input type="text" id="eeEditTName" value="' + esc(t.name) + '" style="width:100%;padding:11px 14px;background:#1e293b;border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:#fff;font-weight:700;font-size:13.5px;outline:none;box-sizing:border-box;" />' +
        '</div>' +

        '<div>' +
          '<label style="display:block;font-size:11.5px;font-weight:800;color:#c084fc;text-transform:uppercase;margin-bottom:6px;">O‘quvchi To‘lovidan Ustoz Ulushi Foizi (%)</label>' +
          '<input type="number" id="eeEditTShare" min="0" max="100" value="' + share + '" style="width:100%;padding:12px 14px;background:#1e293b;border:1.5px solid #a855f7;border-radius:12px;color:#c084fc;font-weight:900;font-size:18px;outline:none;box-sizing:border-box;" />' +
          '<small style="color:#94a3b8;font-size:11px;margin-top:4px;display:block;">Masalan: 50% kiritilsa, har bir to‘langan o‘quvchi pulining 50 foizi ushbu ustoz maoshiga real vaqtda qo‘shiladi.</small>' +
        '</div>' +

        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
          '<div>' +
            '<label style="display:block;font-size:11.5px;font-weight:800;color:#38bdf8;text-transform:uppercase;margin-bottom:6px;">O‘tilgan Dars Soati</label>' +
            '<input type="number" id="eeEditTHours" value="' + hours + '" style="width:100%;padding:11px 14px;background:#1e293b;border:1.5px solid #38bdf8;border-radius:12px;color:#38bdf8;font-weight:900;font-size:16px;outline:none;box-sizing:border-box;" />' +
          '</div>' +
          '<div>' +
            '<label style="display:block;font-size:11.5px;font-weight:800;color:#10b981;text-transform:uppercase;margin-bottom:6px;">Soatlik Stavka (so‘m)</label>' +
            '<input type="number" id="eeEditTRate" value="' + rate + '" style="width:100%;padding:11px 14px;background:#1e293b;border:1.5px solid #10b981;border-radius:12px;color:#34d399;font-weight:900;font-size:16px;outline:none;box-sizing:border-box;" />' +
          '</div>' +
        '</div>' +

        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
          '<div>' +
            '<label style="display:block;font-size:11.5px;font-weight:800;color:#fbbf24;text-transform:uppercase;margin-bottom:6px;">Berilmagan Oylar Soni</label>' +
            '<select id="eeEditTUnpaidMonths" style="width:100%;padding:11px 12px;background:#1e293b;border:1px solid rgba(245,158,11,0.4);border-radius:12px;color:#fbbf24;font-weight:800;font-size:13px;outline:none;">' +
              '<option value="0"' + (unpaid === 0 ? ' selected' : '') + '>0 oy (Qarzdorlik yo‘q)</option>' +
              '<option value="1"' + (unpaid === 1 ? ' selected' : '') + '>⚠️ 1 oylik berilmagan</option>' +
              '<option value="2"' + (unpaid === 2 ? ' selected' : '') + '>⚠️ 2 oylik berilmagan</option>' +
              '<option value="3"' + (unpaid === 3 ? ' selected' : '') + '>⚠️ 3 oylik berilmagan</option>' +
            '</select>' +
          '</div>' +
          '<div>' +
            '<label style="display:block;font-size:11.5px;font-weight:800;color:#cbd5e1;text-transform:uppercase;margin-bottom:6px;">Oylik Holati</label>' +
            '<select id="eeEditTPaidStatus" style="width:100%;padding:11px 12px;background:#1e293b;border:1px solid rgba(255,255,255,0.15);border-radius:12px;color:#fff;font-weight:800;font-size:13px;outline:none;">' +
              '<option value="unpaid"' + (!isPaid ? ' selected' : '') + '>⏳ Hisoblanmoqda (Kutilmoqda)</option>' +
              '<option value="paid"' + (isPaid ? ' selected' : '') + '>✓ Oylik To‘landi</option>' +
            '</select>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div style="display:flex;gap:12px;margin-top:24px;">' +
        '<button id="eeDeleteTeacherModalBtn" style="background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.4);border-radius:12px;padding:12px 16px;font-weight:900;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;">🗑️ O‘chirish</button>' +
        '<button id="eeCancelTeacherModal" style="flex:1;background:rgba(255,255,255,0.08);color:#94a3b8;border:none;border-radius:12px;padding:12px;font-weight:800;cursor:pointer;">Bekor Qilish</button>' +
        '<button id="eeSaveTeacherModal" style="flex:1;background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:12px;padding:12px;font-weight:900;font-size:14px;cursor:pointer;box-shadow:0 4px 15px rgba(2,132,199,0.4);">💾 Saqlash</button>' +
      '</div>' +
    '</div>';

    modalRoot.appendChild(m);
    var close = function() { m.remove(); };
    m.querySelector('#eeCloseTeacherModal').onclick = close;
    m.querySelector('#eeCancelTeacherModal').onclick = close;

    var delBtn = m.querySelector('#eeDeleteTeacherModalBtn');
    if (delBtn) {
      delBtn.onclick = function() {
        close();
        EE.deleteTeacher(container, S, t.id, t.name);
      };
    }

    m.querySelector('#eeSaveTeacherModal').onclick = function() {
      var nName = m.querySelector('#eeEditTName').value.trim();
      var nHours = parseInt(m.querySelector('#eeEditTHours').value, 10) || 0;
      var nRate = parseInt(m.querySelector('#eeEditTRate').value, 10) || 0;
      var nShare = parseInt(m.querySelector('#eeEditTShare').value, 10);
      if (isNaN(nShare)) nShare = 50;
      nShare = Math.max(0, Math.min(100, nShare));

      var nUnpaid = parseInt(m.querySelector('#eeEditTUnpaidMonths').value, 10) || 0;
      var statusVal = m.querySelector('#eeEditTPaidStatus').value;

      t.name = nName || t.name;
      t.teachingHours = nHours;
      t.hourlyRate = nRate;
      t.salarySharePercent = nShare;
      t.unpaidMonths = nUnpaid;
      t.paidThisMonth = (statusVal === 'paid');

      // Save to permanent teacher settings map in localStorage
      try {
        var tMap = JSON.parse(localStorage.getItem('ethith_teacher_settings') || '{}');
        tMap[t.id] = {
          salarySharePercent: t.salarySharePercent,
          teachingHours: t.teachingHours,
          hourlyRate: t.hourlyRate,
          unpaidMonths: t.unpaidMonths,
          paidThisMonth: t.paidThisMonth
        };
        localStorage.setItem('ethith_teacher_settings', JSON.stringify(tMap));
      } catch(e) {}

      saveStore();
      showToast("✓ " + t.name + " maosh ulushi (" + nShare + "%) va parametrlari saqlandi!");
      close();
      EE.renderFinanceUnifiedView(container, 'teachers');
    };
  };


  // DELETE TEACHER METHOD
  EE.deleteTeacher = function(container, S, tid, tName) {
    if (!tid) return;
    var tObj = (S.teachers || []).find(function(x) { return x.id === tid; });
    var nameToDisplay = tName || (tObj ? tObj.name : 'O‘qituvchi');
    if (!confirm("Haqiqatan ham \"" + nameToDisplay + "\" o‘qituvchisini tizimdan butunlay o‘chirmoqchimisiz?\n\n• O‘qituvchi va uning tizim profili o‘chiriladi\n• Guruhlar saqlanadi va o‘qituvchisiz (bo‘sh) holatga o‘tkaziladi")) {
      return;
    }

    if (!Array.isArray(S.deletedTeacherIds)) S.deletedTeacherIds = [];
    if (S.deletedTeacherIds.indexOf(tid) === -1) S.deletedTeacherIds.push(tid);

    // 1. Remove from teachers
    S.teachers = (S.teachers || []).filter(function(x) { return x.id !== tid; });

    // 2. Remove teacher login from accounts
    if (Array.isArray(S.accounts)) {
      S.accounts = S.accounts.filter(function(a) {
        if (a.id === tid) return false;
        if (tObj && tObj.login && a.login && a.login.toLowerCase() === tObj.login.toLowerCase()) return false;
        return true;
      });
    }

    // 3. Unbind classes
    if (Array.isArray(S.classes)) {
      S.classes.forEach(function(cls) {
        if (cls.teacherId === tid || (tObj && cls.teacherName === tObj.name)) {
          cls.teacherId = '';
          cls.teacherName = 'Biriktirilmagan';
        }
      });
    }

    // 4. Save and broadcast
    saveStore();
    if (window.EthithSync && window.EthithSync.broadcastState) {
      window.EthithSync.broadcastState('teacher_deleted');
    }

    showToast("🗑️ " + nameToDisplay + " tizimdan o‘chirildi!");
    EE.renderFinanceUnifiedView(container, 'teachers');
  };

  // --------------------------------------------------------------------------
  // MODAL: CYBER-NEON OYLIK TARIF BELGILASH
  // (Yakka o'quvchi yoki barcha o'quvchilar uchun bir marta bosish bilan o'rnatish)
  // --------------------------------------------------------------------------
  EE.openCyberNeonTariffModal = function(container, S, targetStudent) {
    var modalRoot = document.getElementById('eaGlobalModalRoot') || document.body;
    var existing = document.getElementById('eeCyberNeonTariffOverlay');
    if (existing) existing.remove();

    var currentFee = targetStudent ? (targetStudent.fee || 300000) : (S.finance.defaultFee || 300000);

    var m = document.createElement('div');
    m.id = 'eeCyberNeonTariffOverlay';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.85);backdrop-filter:blur(24px);z-index:2147483645;display:flex;align-items:center;justify-content:center;padding:16px;';

    m.innerHTML = '<div style="background:radial-gradient(circle at 10% 20%, rgba(56,189,248,0.2), transparent 45%), radial-gradient(circle at 90% 80%, rgba(16,185,129,0.18), transparent 45%), linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.94));border:1.5px solid rgba(56,189,248,0.55);box-shadow:0 0 45px rgba(56,189,248,0.35), 0 25px 70px rgba(0,0,0,0.85);border-radius:24px;max-width:480px;width:100%;padding:26px 28px;color:#f8fafc;position:relative;overflow:hidden;">' +
      // Glowing accent line
      '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#0284c7,#38bdf8,#10b981,#34d399);box-shadow:0 0 14px rgba(56,189,248,0.8);"></div>' +
      
      // Header
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:14px;">' +
        '<div style="display:flex;align-items:center;gap:12px;">' +
          '<div style="width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,#0284c7,#10b981);display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 0 22px rgba(56,189,248,0.45);flex-shrink:0;">⚡</div>' +
          '<div>' +
            '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
              '<h3 style="margin:0;font-size:18px;font-weight:900;color:#fff;letter-spacing:-0.3px;">Oylik Tarifni Belgilash</h3>' +
              '</div>' +
            '<div style="font-size:12px;color:#94a3b8;margin-top:2px;">' +
              (targetStudent ? ('O‘quvchi: <b style="color:#38bdf8;">' + esc(targetStudent.name) + '</b>' + (targetStudent.className ? (' (' + esc(targetStudent.className) + ')') : '')) : 'Butun markaz o‘quvchilari uchun umumiy oylik tarif') +
            '</div>' +
          '</div>' +
        '</div>' +
        '<button id="eeCloseTariffModal" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#94a3b8;font-size:18px;cursor:pointer;border-radius:10px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;">✕</button>' +
      '</div>' +

      // Form body
      '<div style="display:flex;flex-direction:column;gap:16px;">' +
        '<div>' +
          '<label style="display:block;font-size:11.5px;font-weight:800;color:#38bdf8;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Oylik To‘lov Miqdori (so‘mda):</label>' +
          '<div style="position:relative;">' +
            '<input type="number" id="eeCyberTariffInput" value="' + currentFee + '" step="10000" style="width:100%;padding:14px 16px;background:#0f172a;border:2px solid #38bdf8;border-radius:14px;color:#38bdf8;font-weight:900;font-size:22px;outline:none;box-sizing:border-box;box-shadow:0 0 20px rgba(56,189,248,0.25);font-family:monospace;" />' +
            '<span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:11.5px;font-weight:900;color:#94a3b8;pointer-events:none;background:rgba(15,23,42,0.85);padding:3px 8px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);">SO‘M / OY</span>' +
          '</div>' +
          '<div id="eeCyberTariffFormatted" style="font-size:13.5px;font-weight:800;color:#34d399;margin-top:6px;font-family:monospace;">' + fmtUZS(currentFee) + '</div>' +
        '</div>' +

        // Quick Preset Chips
        '<div>' +
          '<div style="font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;margin-bottom:6px;">Tezkor Tanlov (Ommabop narxlar):</div>' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
            [200000, 250000, 300000, 350000, 400000, 500000].map(function(amt) {
              return '<button type="button" class="ee-cyber-chip" data-amt="' + amt + '" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#cbd5e1;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;font-family:monospace;transition:all 0.15s;">' + (amt / 1000) + ' ming</button>';
            }).join('') +
          '</div>' +
        '</div>' +

        // Action Buttons
        '<div style="display:flex;flex-direction:column;gap:10px;margin-top:6px;">' +
          (targetStudent ? (
            '<button id="eeSaveSingleTariffBtn" style="background:linear-gradient(135deg,#0284c7,#0369a1);color:#fff;border:none;border-radius:12px;padding:12px 18px;font-size:13.5px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 18px rgba(2,132,199,0.35);transition:all 0.2s;">' +
              '<span>💾</span> Faqat "' + esc(targetStudent.name) + '" Uchun Saqlash' +
            '</button>'
          ) : '') +
          '<button id="eeSaveGlobalTariffBtn" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:12px;padding:13px 18px;font-size:14px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 0 25px rgba(16,185,129,0.45);transition:all 0.2s;">' +
            '<span>⚡</span> Hamma Uchun Belgilash (Barcha O‘quvchilarga)' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>';

    modalRoot.appendChild(m);
    var close = function() { m.remove(); };
    m.querySelector('#eeCloseTariffModal').onclick = close;

    var inp = m.querySelector('#eeCyberTariffInput');
    var fmtLabel = m.querySelector('#eeCyberTariffFormatted');

    inp.oninput = function() {
      var val = parseInt(inp.value, 10) || 0;
      fmtLabel.innerText = fmtUZS(val);
    };

    m.querySelectorAll('.ee-cyber-chip').forEach(function(chip) {
      chip.onclick = function() {
        inp.value = chip.getAttribute('data-amt');
        inp.dispatchEvent(new Event('input'));
      };
    });

    var singleBtn = m.querySelector('#eeSaveSingleTariffBtn');
    if (singleBtn && targetStudent) {
      singleBtn.onclick = function() {
        var val = parseInt(inp.value, 10);
        if (!val || val <= 0) { alert("Iltimos, haqiqiy summa kiriting!"); return; }

        if (!S.finance.studentFees) S.finance.studentFees = {};
        if (!S.finance.studentFees[targetStudent.id]) S.finance.studentFees[targetStudent.id] = {};
        S.finance.studentFees[targetStudent.id].fee = val;

        (S.classes || []).forEach(function(cls) {
          if (!cls.studentPayments) cls.studentPayments = {};
          if (cls.studentPayments[targetStudent.id]) {
            cls.studentPayments[targetStudent.id].fee = val;
          }
        });

        saveStore();
        close();
        showToast(targetStudent.name + " uchun oylik tarif " + fmtUZS(val) + " qilib belgilandi!");
        EE.renderFinanceUnifiedView(container, 'students');
      };
    }

    m.querySelector('#eeSaveGlobalTariffBtn').onclick = function() {
      var val = parseInt(inp.value, 10);
      if (!val || val <= 0) { alert("Iltimos, haqiqiy summa kiriting!"); return; }

      if (!S.finance.studentFees) S.finance.studentFees = {};
      S.finance.defaultFee = val;
      var count = 0;

      (S.classes || []).forEach(function(cls) {
        if (!cls.studentPayments) cls.studentPayments = {};
        (cls.students || []).forEach(function(st) {
          var sid = st.id || st.email;
          if (sid) {
            count++;
            if (!cls.studentPayments[sid]) {
              cls.studentPayments[sid] = { fee: val, paid: 0, status: 'unpaid' };
            } else {
              cls.studentPayments[sid].fee = val;
            }

            if (!S.finance.studentFees[sid]) {
              S.finance.studentFees[sid] = { fee: val, paid: 0, status: 'unpaid' };
            } else {
              S.finance.studentFees[sid].fee = val;
            }
          }
        });
      });

      saveStore();
      close();
      showToast("⚡ Barcha (" + count + " ta) o‘quvchilar uchun oylik tarif " + fmtUZS(val) + " qilib belgilandi!");
      EE.renderFinanceUnifiedView(container, 'students');
    };
  };


  // --------------------------------------------------------------------------
  // MODAL: ADD EXPENSE
  // --------------------------------------------------------------------------
  EE.openAddExpenseModal = function(container, S, activeTab) {
    var modalRoot = document.getElementById('eaGlobalModalRoot') || document.body;
    var existing = document.getElementById('eeFinExpModalOverlay');
    if (existing) existing.remove();

    var now = new Date();
    var curDateStr = now.toISOString().split('T')[0];
    var curTimeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

    var m = document.createElement('div');
    m.id = 'eeFinExpModalOverlay';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.85);backdrop-filter:blur(24px);z-index:2147483645;display:flex;align-items:center;justify-content:center;padding:16px;';

    m.innerHTML = '<div style="background:rgba(15,23,42,0.96);border:1.5px solid rgba(239,68,68,0.4);border-radius:24px;max-width:480px;width:100%;padding:26px 28px;color:#f8fafc;box-shadow:0 25px 60px rgba(0,0,0,0.7),0 0 40px rgba(239,68,68,0.25);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:14px;">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<span style="font-size:24px;">💸</span>' +
          '<h3 style="margin:0;font-size:18px;font-weight:900;color:#fff;">Yangi Operatsion Xarajat Kiritish</h3>' +
        '</div>' +
        '<button id="eeCloseExpModal" style="background:none;border:none;color:#94a3b8;font-size:22px;cursor:pointer;">✕</button>' +
      '</div>' +

      '<div style="display:flex;flex-direction:column;gap:14px;">' +
        '<div>' +
          '<label style="display:block;font-size:11.5px;font-weight:800;color:#94a3b8;text-transform:uppercase;margin-bottom:6px;">Nega Qilingan? (Xarajat sababi / nomi)</label>' +
          '<input type="text" id="eeExpTitleInp" placeholder="masalan: 3-bino oylik ijarasi yoki proyektor lampasi" style="width:100%;padding:11px 14px;background:#1e293b;border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:#fff;font-weight:700;font-size:13.5px;outline:none;box-sizing:border-box;" />' +
        '</div>' +

        '<div>' +
          '<label style="display:block;font-size:11.5px;font-weight:800;color:#ef4444;text-transform:uppercase;margin-bottom:6px;">Qancha? (Xarajat summasi - so‘mda)</label>' +
          '<input type="number" id="eeExpAmountInp" placeholder="1500000" style="width:100%;padding:12px 14px;background:#1e293b;border:1.5px solid #ef4444;border-radius:12px;color:#fca5a5;font-weight:900;font-size:17px;outline:none;box-sizing:border-box;" />' +
        '</div>' +

        '<div>' +
          '<label style="display:block;font-size:11.5px;font-weight:800;color:#94a3b8;text-transform:uppercase;margin-bottom:6px;">Kategoriya</label>' +
          '<select id="eeExpCatSelect" style="width:100%;padding:12px;background:#1e293b;border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:#fff;font-weight:700;font-size:13.5px;outline:none;">' +
            '<option value="rent">🏢 Bino Ijarasi</option>' +
            '<option value="electricity">⚡ Elektr Energiyasi (Tok)</option>' +
            '<option value="utilities">💧 Kommunal (Suv, isitish, chiqindi)</option>' +
            '<option value="internet">🌐 Internet &amp; LMS Server</option>' +
            '<option value="equipment">💻 Jihozlar va Tamir</option>' +
            '<option value="marketing">📣 Marketing &amp; Reklama</option>' +
            '<option value="other">🛠️ Xo‘jalik va Boshqalar</option>' +
          '</select>' +
        '</div>' +

        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
          '<div>' +
            '<label style="display:block;font-size:11.5px;font-weight:800;color:#38bdf8;text-transform:uppercase;margin-bottom:6px;">📅 Qachon? (Sana)</label>' +
            '<input type="date" id="eeExpDateInp" value="' + curDateStr + '" style="width:100%;padding:10px 12px;background:#1e293b;border:1px solid rgba(56,189,248,0.35);border-radius:12px;color:#fff;font-weight:700;font-size:13px;outline:none;box-sizing:border-box;" />' +
          '</div>' +
          '<div>' +
            '<label style="display:block;font-size:11.5px;font-weight:800;color:#c084fc;text-transform:uppercase;margin-bottom:6px;">⏰ Qaysi soatda?</label>' +
            '<input type="time" id="eeExpTimeInp" value="' + curTimeStr + '" style="width:100%;padding:10px 12px;background:#1e293b;border:1px solid rgba(168,85,247,0.35);border-radius:12px;color:#fff;font-weight:700;font-size:13px;outline:none;box-sizing:border-box;" />' +
          '</div>' +
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
      var dVal = m.querySelector('#eeExpDateInp').value || curDateStr;
      var tVal = m.querySelector('#eeExpTimeInp').value || curTimeStr;

      if (!title || amt <= 0) { alert("Iltimos, xarajat sababi (nomi) va summasini to‘g‘ri kiriting!"); return; }

      var icons = { rent: '🏢', electricity: '⚡', utilities: '💧', internet: '🌐', equipment: '💻', marketing: '📣', other: '🛠️' };

      S.finance.expenses.unshift({
        id: 'e_' + Date.now(),
        category: cat,
        title: title,
        amount: amt,
        icon: icons[cat] || '💸',
        date: dVal,
        time: tVal,
        createdAt: Date.now()
      });

      saveStore();
      showToast("Xarajat (" + fmtUZS(amt) + ") muvaffaqiyatli saqlandi!");
      close();
      EE.renderFinanceUnifiedView(container, activeTab || 'expenses');
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
      var maxCap = cls ? (cls.maxCapacity || 18) : 18;
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
      var maxCap = cls.maxCapacity || 18;
      var realCount = (cls.students || []).filter(function(s) {
        return !s.isTester && !(s.name || '').startsWith('tester_');
      }).length;
      var isFull = (realCount >= maxCap);
      var pct = Math.min(100, Math.round((realCount / maxCap) * 100));
      var barColor = isFull ? 'linear-gradient(90deg,#ef4444,#dc2626)' : (pct > 75 ? 'linear-gradient(90deg,#f59e0b,#eab308)' : 'linear-gradient(90deg,#10b981,#06b6d4)');

      h += '<div class="ee-class-card" style="background:rgba(15,23,42,0.88);border:1px solid ' + (isFull ? 'rgba(239,68,68,0.4)' : 'rgba(56,189,248,0.3)') + ';border-radius:20px;padding:22px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 10px 30px rgba(0,0,0,0.45);backdrop-filter:blur(20px);position:relative;">' +
        '<div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">' +
            '<span style="background:rgba(14,165,233,0.15);color:#38bdf8;font-size:11.5px;font-weight:900;padding:3px 10px;border-radius:8px;border:1px solid rgba(14,165,233,0.35);font-family:monospace;letter-spacing:0.04em;">' + esc(cls.code || 'ETH-CLASS') + '</span>' +
            '<button class="ee-quick-edit-cap-btn" data-cid="' + cls.id + '" title="Sig‘imni o‘zgartirish uchun bosing" style="background:' + (isFull ? 'rgba(239,68,68,0.18)' : 'rgba(16,185,129,0.18)') + ';color:' + (isFull ? '#f87171' : '#34d399') + ';font-size:12px;font-weight:900;padding:4px 12px;border-radius:8px;border:1px solid ' + (isFull ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)') + ';cursor:pointer;display:inline-flex;align-items:center;gap:4px;">' +
              '<span>' + realCount + ' / ' + maxCap + ' ta joy</span>' +
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

        var testerSlotIdx = (cls.students || []).findIndex(function(s) {
          return s.isTester || (s.name && s.name.startsWith('tester_'));
        });
        if (testerSlotIdx === -1 && (cls.students || []).length >= (cls.maxCapacity || 18)) {
          alert("Kechirasiz, ushbu guruh to‘lgan! Maksimal sig‘im: " + (cls.maxCapacity || 18) + " ta.");
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
            var beforeLen = c.students.length;
            c.students = c.students.filter(function(s) {
              return (s.id && s.id !== curU.id) && (!s.email || !curU.email || s.email.toLowerCase().trim() !== curU.email.toLowerCase().trim());
            });
            if (c.students.length !== beforeLen && window.ethithReplenishTesterSlots) {
              window.ethithReplenishTesterSlots(c);
            }
          }
        });

        if (!cls.students) cls.students = [];
        var stRec = { id: curU.id, name: curU.name, email: curU.email, isTester: false, joinedAt: new Date().toISOString().split('T')[0] };
        if (testerSlotIdx !== -1) {
          cls.students[testerSlotIdx] = stRec;
        } else {
          cls.students.push(stRec);
        }
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

    var curCap = cls.maxCapacity || 18;
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

    var curCap = cls.maxCapacity || 18;
    var realCount = (cls.students || []).filter(function(s) {
      return !s.isTester && !(s.name || '').startsWith('tester_');
    }).length;
    var isFull = realCount >= curCap;

    m.innerHTML = '<div style="background:rgba(15,23,42,0.96);border:1px solid rgba(56,189,248,0.35);border-radius:24px;max-width:560px;width:100%;padding:24px 26px;color:#f8fafc;box-shadow:0 25px 60px rgba(0,0,0,0.7),0 0 40px rgba(56,189,248,0.15);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:12px;">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<span style="font-size:22px;">🔍</span>' +
          '<div>' +
            '<h3 style="margin:0;font-size:17.5px;font-weight:900;color:#fff;">Guruhga O‘quvchi Qo‘shish & Boshqarish</h3>' +
            '<div style="font-size:12px;color:#94a3b8;margin-top:2px;">Guruh: <b style="color:#38bdf8;">' + esc(cls.name) + '</b> • O‘quvchilar: <b id="eeTgModalCapText" style="color:' + (isFull ? '#f87171' : '#34d399') + ';">' + realCount + ' / ' + curCap + ' ta joy</b></div>' +
          '</div>' +
        '</div>' +
        '<button id="eeCloseTgSearch" style="background:none;border:none;color:#94a3b8;font-size:22px;cursor:pointer;line-height:1;">✕</button>' +
      '</div>' +

      // Capacity Notice if full
      '<div id="eeTgCapAlert" style="' + (isFull ? 'display:flex;' : 'display:none;') + 'align-items:center;justify-content:space-between;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.4);border-radius:12px;padding:10px 14px;margin-bottom:14px;font-size:12.5px;color:#fca5a5;">' +
        '<span>⚠️ Guruh sig‘imi to‘lgan (' + realCount + ' / ' + curCap + ').</span>' +
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
      if (window.EthithAttendance && window.EthithAttendance.render) {
        var apV = document.getElementById('apView');
        if (apV && (window._ethithCurrentView === 'classes' || window._ethithCurrentView === 'attendance')) {
          window.EthithAttendance.render(apV);
        }
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
          var beforeLen = other.students.length;
          other.students = other.students.filter(function(s) {
            return (s.id && s.id !== stId) && (!s.email || s.email.toLowerCase().trim() !== nEmail);
          });
          if (other.students.length !== beforeLen && window.ethithReplenishTesterSlots) {
            window.ethithReplenishTesterSlots(other);
          }
        }
      });

      // Add to this class (replace tester slot if available)
      if (!cls.students) cls.students = [];
      var alreadyIn = cls.students.some(function(s) {
        return (s.id && s.id === stId) || (s.email && s.email.toLowerCase().trim() === nEmail);
      });

      if (!alreadyIn) {
        var newSt = {
          id: stId,
          name: nName,
          email: nEmail,
          role: 'student',
          joinedAt: new Date().toISOString().split('T')[0],
          isTester: false
        };
        var testerIdx = cls.students.findIndex(function(s) {
          return s.isTester || (s.name && s.name.startsWith('tester_'));
        });
        if (testerIdx !== -1) {
          cls.students[testerIdx] = newSt;
        } else {
          cls.students.push(newSt);
        }
        if (cls.students.length > (cls.maxCapacity || 18)) {
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
              var beforeLen = other.students.length;
              other.students = other.students.filter(function(s) {
                return (s.id && s.id !== acc.id) && (!s.email || !acc.email || s.email.toLowerCase().trim() !== acc.email.toLowerCase().trim());
              });
              if (other.students.length !== beforeLen && window.ethithReplenishTesterSlots) {
                window.ethithReplenishTesterSlots(other);
              }
            }
          });

          if (!cls.students) cls.students = [];
          var newSt = {
            id: acc.id,
            name: acc.name,
            email: acc.email,
            role: 'student',
            joinedAt: new Date().toISOString().split('T')[0],
            isTester: false
          };
          var testerIdx = cls.students.findIndex(function(s) {
            return s.isTester || (s.name && s.name.startsWith('tester_'));
          });
          if (testerIdx !== -1) {
            cls.students[testerIdx] = newSt;
          } else {
            cls.students.push(newSt);
          }

          if (cls.students.length > (cls.maxCapacity || 18)) {
            cls.maxCapacity = cls.students.length;
          }

          saveStore();
          showToast(acc.name + " '" + cls.name + "' guruhiga qo‘shildi!");
          var realCount = cls.students.filter(function(s) { return !s.isTester && !(s.name || '').startsWith('tester_'); }).length;
          m.querySelector('#eeTgModalCapText').textContent = realCount + ' / ' + (cls.maxCapacity || 18) + ' ta joy';
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

          // Remove from old class and replenish tester slot so it keeps 18
          if (oldCls && Array.isArray(oldCls.students)) {
            oldCls.students = oldCls.students.filter(function(s) {
              return (s.id && s.id !== acc.id) && (!s.email || !acc.email || s.email.toLowerCase().trim() !== acc.email.toLowerCase().trim());
            });
            if (window.ethithReplenishTesterSlots) window.ethithReplenishTesterSlots(oldCls);
          }

          // Strict Single Group Rule: remove from any other class too
          S.classes.forEach(function(other) {
            if (other.id !== cls.id && other.id !== oldClsId && Array.isArray(other.students)) {
              var beforeLen = other.students.length;
              other.students = other.students.filter(function(s) {
                return (s.id && s.id !== acc.id) && (!s.email || !acc.email || s.email.toLowerCase().trim() !== acc.email.toLowerCase().trim());
              });
              if (other.students.length !== beforeLen && window.ethithReplenishTesterSlots) {
                window.ethithReplenishTesterSlots(other);
              }
            }
          });

          if (!cls.students) cls.students = [];
          var movingSt = {
            id: acc.id,
            name: acc.name,
            email: acc.email,
            role: 'student',
            joinedAt: new Date().toISOString().split('T')[0],
            isTester: false
          };
          var testerIdx = cls.students.findIndex(function(s) {
            return s.isTester || (s.name && s.name.startsWith('tester_'));
          });
          if (testerIdx !== -1) {
            cls.students[testerIdx] = movingSt;
          } else {
            cls.students.push(movingSt);
          }

          if (cls.students.length > (cls.maxCapacity || 18)) {
            cls.maxCapacity = cls.students.length;
          }

          saveStore();
          showToast(acc.name + " '" + (oldCls ? oldCls.name : 'avvalgi') + "' guruhidan ushbu guruhga ko‘chirildi!");
          var realCount = cls.students.filter(function(s) { return !s.isTester && !(s.name || '').startsWith('tester_'); }).length;
          m.querySelector('#eeTgModalCapText').textContent = realCount + ' / ' + (cls.maxCapacity || 18) + ' ta joy';
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
          if (window.ethithReplenishTesterSlots) window.ethithReplenishTesterSlots(cls);

          saveStore();
          if (window.ethithBroadcastStudentExpulsion) {
            window.ethithBroadcastStudentExpulsion(cls.id, accId, accEmail, (acc && acc.phone), stName);
          }
          showToast(stName + " guruhdan chiqarildi!");
          var realCount = cls.students.filter(function(s) { return !s.isTester && !(s.name || '').startsWith('tester_'); }).length;
          m.querySelector('#eeTgModalCapText').textContent = realCount + ' / ' + (cls.maxCapacity || 18) + ' ta joy';
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
    if (!cls) {
      if (window.EthithAttendance && typeof window.EthithAttendance.getActiveOrFirstClass === 'function') {
        cls = window.EthithAttendance.getActiveOrFirstClass();
      }
      if (!cls && window.S && Array.isArray(window.S.classes)) {
        cls = window.S.classes[0];
      }
    }
    if (!cls) return;
    var S = getStore();
    var modalRoot = document.getElementById('eaGlobalModalRoot') || document.body;

    var S_app = window.S || (window.EthithApp && window.EthithApp.state) || {};
    var curUser = S_app.user || {};
    var isAdmin = curUser.role === 'admin' || (curUser.email && curUser.email.toLowerCase().includes('admin'));
    var isTeacher = true; // Admin va o'qituvchilar doim balni kiritishi va qarorni belgilashi mumkin!

    if (!cls.levelTestResults) cls.levelTestResults = {};

    var students = cls.students || [];

    // Ensure all students have a record without fake defaults
    students.forEach(function(st) {
      var stId = st.id || st.email;
      if (!cls.levelTestResults[stId]) {
        cls.levelTestResults[stId] = {
          score: null,
          passed: null,
          updatedAt: Date.now()
        };
      }
    });

    function getStats() {
      var passedCount = 0;
      var failedCount = 0;
      var totalScore = 0;
      var scoredCount = 0;

      students.forEach(function(st) {
        var stId = st.id || st.email;
        var r = cls.levelTestResults[stId];
        if (r) {
          if (r.passed === true) {
            passedCount++;
          } else if (r.passed === false) {
            failedCount++;
          }
          if (r.score !== null && r.score !== undefined && r.score !== '' && !isNaN(r.score)) {
            totalScore += Number(r.score);
            scoredCount++;
          }
        }
      });

      var avgScore = scoredCount > 0 ? Math.round(totalScore / scoredCount) : 0;
      return { passedCount: passedCount, failedCount: failedCount, avgScore: avgScore };
    }

    var stats = getStats();

    var m = document.createElement('div');
    m.id = 'eeLevelTestOverlay';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.85);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);z-index:2147483640;display:flex;align-items:center;justify-content:center;padding:16px;';

    var mHtml = '<div style="background:linear-gradient(145deg,rgba(15,23,42,0.98),rgba(30,41,59,0.96));border:2px solid #10b981;border-radius:24px;max-width:800px;width:100%;max-height:92vh;overflow-y:auto;padding:28px 30px;color:#f8fafc;box-shadow:0 24px 60px rgba(0,0,0,0.8),0 0 30px rgba(16,185,129,0.25);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:14px;">' +
        '<div style="display:flex;align-items:center;gap:12px;">' +
          '<div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#10b981,#059669);display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 6px 16px rgba(16,185,129,0.4);">🎯</div>' +
          '<div>' +
            '<h3 style="margin:0;font-size:20px;font-weight:900;color:#34d399;">3 Oylik Level Test Imtihoni & Saralash</h3>' +
            '<div style="font-size:12.5px;color:#94a3b8;margin-top:2px;">Guruh: <b style="color:#fff;">' + esc(cls.name) + '</b> • O‘tish bali: <b style="color:#38bdf8;">70%</b>' +
              (isTeacher ? ' <span style="background:rgba(56,189,248,0.18);color:#38bdf8;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:800;margin-left:6px;">⚡ Tahrirlash Faol (Real-vaqt)</span>' : '') +
            '</div>' +
          '</div>' +
        '</div>' +
        '<button id="eeCloseLevelTestModal" style="background:rgba(255,255,255,0.08);border:none;color:#94a3b8;font-size:20px;cursor:pointer;border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">✕</button>' +
      '</div>' +

      // Top Stats Cards
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:20px;">' +
        '<div style="background:rgba(16,185,129,0.12);border:1.5px solid rgba(16,185,129,0.35);border-radius:16px;padding:14px;text-align:center;">' +
          '<div style="font-size:11px;font-weight:800;color:#6ee7b7;text-transform:uppercase;letter-spacing:0.5px;">Keyingi Levelga O‘tganlar</div>' +
          '<div id="eeLevelPassedCount" style="font-size:26px;font-weight:900;color:#34d399;margin-top:4px;">' + stats.passedCount + ' ta</div>' +
        '</div>' +
        '<div style="background:rgba(239,68,68,0.12);border:1.5px solid rgba(239,68,68,0.35);border-radius:16px;padding:14px;text-align:center;">' +
          '<div style="font-size:11px;font-weight:800;color:#fca5a5;text-transform:uppercase;letter-spacing:0.5px;">Yiqilganlar (Qoladi)</div>' +
          '<div id="eeLevelFailedCount" style="font-size:26px;font-weight:900;color:#f87171;margin-top:4px;">' + stats.failedCount + ' ta</div>' +
        '</div>' +
        '<div style="background:rgba(56,189,248,0.12);border:1.5px solid rgba(56,189,248,0.35);border-radius:16px;padding:14px;text-align:center;">' +
          '<div style="font-size:11px;font-weight:800;color:#7dd3fc;text-transform:uppercase;letter-spacing:0.5px;">O‘rtacha Natija</div>' +
          '<div id="eeLevelAvgScore" style="font-size:26px;font-weight:900;color:#38bdf8;margin-top:4px;">' + stats.avgScore + '%</div>' +
        '</div>' +
      '</div>' +

      // Action toolbar
      '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:18px;">' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
          '<button id="eeExportLevelXlsx" style="background:#059669;color:#fff;border:none;border-radius:10px;padding:8px 16px;font-size:12.5px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:6px;">📊 Excel (.xlsx)</button>' +
          '<button id="eeExportLevelDoc" style="background:#0284c7;color:#fff;border:none;border-radius:10px;padding:8px 16px;font-size:12.5px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:6px;">📄 Word (.doc)</button>' +
        '</div>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
          (isTeacher ? '<button id="eeSendFailedSmsBtn" style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border:none;border-radius:10px;padding:9px 18px;font-size:12.5px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 15px rgba(245,158,11,0.35);" title="Imtihondan yiqilgan o‘quvchilarning ota-onalariga smsapi.uz orqali avtomatik SMS yuborish">📱 Yiqilganlarga SMS Yuborish</button>' : '') +
          (isTeacher ? '<button id="eeDropFailedStudentsBtn" style="background:linear-gradient(135deg,#dc2626,#ef4444);color:#fff;border:none;border-radius:10px;padding:9px 18px;font-size:12.5px;font-weight:900;cursor:pointer;box-shadow:0 4px 16px rgba(239,68,68,0.4);">⚠️ Yiqilgan o‘quvchilarni guruhdan chiqarish</button>' : '') +
        '</div>' +
      '</div>' +

      // Table Container
      '<div style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">' +
        '<table style="width:100%;border-collapse:collapse;font-size:13px;text-align:left;">' +
          '<thead>' +
            '<tr style="background:rgba(15,23,42,0.85);color:#94a3b8;font-size:11.5px;font-weight:900;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid rgba(255,255,255,0.08);">' +
              '<th style="padding:12px 14px;width:40px;text-align:center;">#</th>' +
              '<th style="padding:12px 14px;">O‘quvchi</th>' +
              '<th style="padding:12px 14px;width:150px;text-align:center;">Imtihon Bali</th>' +
              '<th style="padding:12px 14px;width:210px;text-align:center;">Qaror</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>';

          students.forEach(function(st, idx) {
            var stId = st.id || st.email;
            var r = cls.levelTestResults[stId] || { score: null, passed: false };
            var stName = (cls.customStudentNames && cls.customStudentNames[stId]) || st.name || stId;

            mHtml += '<tr class="ee-level-row" data-stid="' + esc(stId) + '" style="border-top:1px solid rgba(255,255,255,0.05);background:' + (r.passed ? 'transparent' : 'rgba(239,68,68,0.04)') + ';">' +
              '<td style="padding:11px 14px;color:#94a3b8;font-weight:800;text-align:center;">' + (idx + 1) + '</td>' +
              '<td style="padding:11px 14px;font-weight:800;color:#fff;">' + esc(stName) + '</td>' +
              '<td style="padding:11px 14px;text-align:center;">';
                if (isTeacher) {
                  mHtml += '<div style="display:inline-flex;align-items:center;gap:6px;">' +
                    '<input type="number" min="0" max="100" class="ee-level-score-input" data-stid="' + esc(stId) + '" value="' + (r.score !== null && r.score !== undefined ? esc(r.score) : '') + '" placeholder="0-100" style="width:70px;padding:6px 8px;background:rgba(8,13,26,0.95);border:1.5px solid ' + (r.passed ? '#10b981' : (r.score !== null ? '#ef4444' : 'rgba(255,255,255,0.2)')) + ';border-radius:8px;color:#fff;font-weight:900;font-size:14px;text-align:center;outline:none;" />' +
                    '<span style="font-weight:900;color:#94a3b8;font-size:13px;">%</span>' +
                  '</div>';
                } else {
                  mHtml += '<span style="font-weight:900;font-size:14px;color:' + (r.passed ? '#34d399' : (r.score !== null ? '#f87171' : '#94a3b8')) + ';">' + (r.score !== null && r.score !== undefined ? (r.score + '%') : '—') + '</span>';
                }
              mHtml += '</td>' +
              '<td style="padding:11px 14px;text-align:center;">';
                if (isTeacher) {
                  mHtml += '<button type="button" class="ee-level-toggle-decision-btn" data-stid="' + esc(stId) + '" style="background:' + (r.passed ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.18)') + ';border:1.5px solid ' + (r.passed ? '#10b981' : '#ef4444') + ';color:' + (r.passed ? '#4ade80' : '#fca5a5') + ';padding:5px 14px;border-radius:10px;font-weight:900;font-size:12px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all 0.15s;" title="Bosish: Qarorni o\'zgartirish">' +
                    (r.passed ? '✓ Keyingi Levelga O‘tdi' : '✕ Yiqildi (Qoladi)') +
                  '</button>';
                } else {
                  mHtml += '<span style="background:' + (r.passed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)') + ';color:' + (r.passed ? '#34d399' : '#f87171') + ';padding:4px 10px;border-radius:8px;font-weight:800;font-size:11.5px;">' +
                    (r.passed ? '✓ Keyingi Levelga O‘tdi' : '✕ Yiqildi') +
                  '</span>';
                }
              mHtml += '</td>' +
            '</tr>';
          });

    mHtml += '</tbody></table></div></div>';
    m.innerHTML = mHtml;
    modalRoot.appendChild(m);

    m.querySelector('#eeCloseLevelTestModal').onclick = function() { m.remove(); };

    function persistLevelTestResults() {
      if (typeof saveStore === 'function') saveStore();
      if (window.EthithApp && typeof window.EthithApp.saveState === 'function') window.EthithApp.saveState();
      try {
        localStorage.setItem('ethith_enterprise_store', JSON.stringify(getStore()));
      } catch(e) {}
      if (window.EthithSync && typeof window.EthithSync.publishLive === 'function') {
        window.EthithSync.publishLive({
          type: 'LEVEL_TEST_UPDATE',
          classId: cls.id,
          results: cls.levelTestResults
        });
      }
      if (window.EthithSync && typeof window.EthithSync.pushStoreUpdate === 'function') {
        window.EthithSync.pushStoreUpdate();
      }
    }

    function refreshStatsUI() {
      var s = getStats();
      var pEl = m.querySelector('#eeLevelPassedCount');
      var fEl = m.querySelector('#eeLevelFailedCount');
      var aEl = m.querySelector('#eeLevelAvgScore');
      if (pEl) pEl.textContent = s.passedCount + ' ta';
      if (fEl) fEl.textContent = s.failedCount + ' ta';
      if (aEl) aEl.textContent = s.avgScore + '%';
    }

    // Attach Score Input listeners
    m.querySelectorAll('.ee-level-score-input').forEach(function(inp) {
      function updateScore() {
        var stId = inp.dataset.stid;
        var val = inp.value.trim();
        var num = val === '' ? null : Math.max(0, Math.min(100, parseInt(val, 10)));
        if (!cls.levelTestResults[stId]) cls.levelTestResults[stId] = {};
        cls.levelTestResults[stId].score = num;

        // Auto determine pass if score entered
        if (num !== null) {
          cls.levelTestResults[stId].passed = (num >= 70);
        } else {
          cls.levelTestResults[stId].passed = false;
        }
        cls.levelTestResults[stId].updatedAt = Date.now();

        // Update UI of matching row
        inp.style.borderColor = cls.levelTestResults[stId].passed ? '#10b981' : (num !== null ? '#ef4444' : 'rgba(255,255,255,0.2)');
        var row = inp.closest('.ee-level-row');
        if (row) {
          row.style.background = cls.levelTestResults[stId].passed ? 'transparent' : 'rgba(239,68,68,0.04)';
          var btn = row.querySelector('.ee-level-toggle-decision-btn');
          if (btn) {
            var p = cls.levelTestResults[stId].passed;
            btn.style.background = p ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.18)';
            btn.style.borderColor = p ? '#10b981' : '#ef4444';
            btn.style.color = p ? '#4ade80' : '#fca5a5';
            btn.innerHTML = p ? '✓ Keyingi Levelga O‘tdi' : '✕ Yiqildi (Qoladi)';
          }
        }

        refreshStatsUI();
        persistLevelTestResults();
      }

      inp.oninput = updateScore;
      inp.onchange = updateScore;
    });

    // Attach Decision Toggle listeners
    m.querySelectorAll('.ee-level-toggle-decision-btn').forEach(function(btn) {
      btn.onclick = function() {
        var stId = btn.dataset.stid;
        if (!cls.levelTestResults[stId]) cls.levelTestResults[stId] = { score: null, passed: false };
        cls.levelTestResults[stId].passed = !cls.levelTestResults[stId].passed;
        cls.levelTestResults[stId].updatedAt = Date.now();

        var p = cls.levelTestResults[stId].passed;
        btn.style.background = p ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.18)';
        btn.style.borderColor = p ? '#10b981' : '#ef4444';
        btn.style.color = p ? '#4ade80' : '#fca5a5';
        btn.innerHTML = p ? '✓ Keyingi Levelga O‘tdi' : '✕ Yiqildi (Qoladi)';

        var row = btn.closest('.ee-level-row');
        if (row) {
          row.style.background = p ? 'transparent' : 'rgba(239,68,68,0.04)';
          var inp = row.querySelector('.ee-level-score-input');
          if (inp) {
            inp.style.borderColor = p ? '#10b981' : (inp.value ? '#ef4444' : 'rgba(255,255,255,0.2)');
          }
        }

        refreshStatsUI();
        persistLevelTestResults();
      };
    });

    // Automatic SMS to Failed Students via smsapi.uz API
    var sendFailedSmsBtn = m.querySelector('#eeSendFailedSmsBtn');
    if (sendFailedSmsBtn) {
      sendFailedSmsBtn.onclick = async function() {
        var failedList = [];
        students.forEach(function(st) {
          var stId = st.id || st.email;
          var r = cls.levelTestResults[stId];
          if (r && !r.passed) {
            var phone = (cls.customStudentPhones && cls.customStudentPhones[stId]) || st.parentPhone || st.phone || '';
            var name = (cls.customStudentNames && cls.customStudentNames[stId]) || st.name || stId;
            var sc = (r.score !== null && r.score !== undefined) ? (r.score + '%') : 'yetarli bo‘lmagan';
            if (phone) {
              failedList.push({ phone: phone, name: name, score: sc, id: stId });
            }
          }
        });

        if (failedList.length === 0) {
          alert("Guruhda yiqilgan o‘quvchilar yo‘q yoki ularning telefon raqami kiritilmagan!");
          return;
        }

        var defaultMsg = "Hurmatli ota-ona! Farzandingiz level test imtihonidan o'ta olmadi. Sababini bilish uchun ustoz bilan bog'laning. English House o'quv markazi.";
        var confirmText = "Jami " + failedList.length + " nafar yiqilgan o‘quvchining ota-onalariga rasmiy smsapi.uz shlyuzi orqali SMS xabar yuborilsinmi?\n\n" +
          "Xabar matni (" + defaultMsg.length + " belgi, 1 SMS):\n" +
          "\"" + defaultMsg + "\"";

        if (!confirm(confirmText)) return;

        sendFailedSmsBtn.disabled = true;
        sendFailedSmsBtn.innerHTML = '⏳ SMS yuborilmoqda (3 ta shlyuz)...';

        var sendFn = (window.EA && window.EA.sendSmsApiUz) || (window.EthithAttendance && window.EthithAttendance.sendSmsApiUz);
        if (typeof sendFn !== 'function') {
          alert("SMS yuborish moduli yuklanmagan!");
          sendFailedSmsBtn.disabled = false;
          sendFailedSmsBtn.innerHTML = '📱 Yiqilganlarga SMS Yuborish';
          return;
        }

        try {
          var res = await sendFn(failedList, defaultMsg);
          if (res && res.success) {
            alert("✓ Muvaffaqiyatli! " + res.count + " nafar yiqilgan o‘quvchining ota-onasiga SMS (" + (res.gateway || 'SMS Shlyuz') + ") orqali yuborildi!");
          } else {
            alert("SMS yuborishda xatolik: " + ((res && res.error) || 'Noma‘lum xato'));
          }
        } catch(err) {
          alert("SMS yuborishda xatolik yuz berdi: " + err.message);
        }

        sendFailedSmsBtn.disabled = false;
        sendFailedSmsBtn.innerHTML = '📱 Yiqilganlarga SMS Yuborish';
      };
    }

    // Drop failed students
    var dropBtn = m.querySelector('#eeDropFailedStudentsBtn');
    if (dropBtn) {
      dropBtn.onclick = function() {
        var curStats = getStats();
        if (confirm("Rostdan ham imtihondan o'ta olmagan " + curStats.failedCount + " ta o‘quvchini ushbu guruhdan chiqarib yubormoqchimisiz?")) {
          cls.students = cls.students.filter(function(st) {
            var stId = st.id || st.email;
            var r = cls.levelTestResults[stId];
            return r && r.passed;
          });
          persistLevelTestResults();
          showToast("Yiqilgan o‘quvchilar guruhdan chiqarildi!");
          m.remove();
          if (window.EthithAttendance && typeof window.EthithAttendance.render === 'function') {
            window.EthithAttendance.render();
          }
        }
      };
    }

    // Excel Export
    m.querySelector('#eeExportLevelXlsx').onclick = function() {
      if (!window.XLSX) return;
      var data = [["#", "O'quvchi", "Level Test Bali", "Qaror"]];
      students.forEach(function(st, idx) {
        var stId = st.id || st.email;
        var r = cls.levelTestResults[stId] || { score: null, passed: false };
        var stName = (cls.customStudentNames && cls.customStudentNames[stId]) || st.name || stId;
        data.push([idx + 1, stName, (r.score !== null ? (r.score + "%") : "Kiritilmagan"), r.passed ? "Keyingi Levelga o'tdi" : "Yiqildi"]);
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
        var r = cls.levelTestResults[stId] || { score: null, passed: false };
        var stName = (cls.customStudentNames && cls.customStudentNames[stId]) || st.name || stId;
        docHtml += '<tr><td>' + (idx + 1) + '</td><td>' + esc(stName) + '</td><td>' + (r.score !== null ? (r.score + '%') : '—') + '</td><td>' + (r.passed ? "Keyingi Levelga o'tdi" : "Yiqildi") + '</td></tr>';
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
