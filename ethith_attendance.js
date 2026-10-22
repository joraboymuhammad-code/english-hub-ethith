/**
 * ETHITH ATTENDANCE (DAVOMAT), HOMEWORK AUTO-GRADER & QUANTUM-EDU ANALYTICS
 * - Shaffof Dark-Mode Glassmorphic Attendance & Automatic Grading Journal (No BSB/CHSB)
 * - Teacher Homework Assignment System ("Uy vazifasi belgilash") linked to Intermediate (B1+) Units 1-12
 * - Top-of-Chat Homework Banner for students & real-time automatic grading (5, 4, 3, 2) into 'B' column
 * - Persistent Edit Modals (never auto-closes during live sync)
 * - Automatic QuantumEdu Student Daily Tasks & Growth/Decline Analytics on Student Click
 * - 100% Genuine Excel (.xlsx) & Word (.doc) Export
 */

(function(window) {
  'use strict';

  var EA = window.EthithAttendance = window.EthithAttendance || {};

  // Authentic demo students if a class has no students yet
  EA.DEMO_STUDENTS = [
    { id: "std_1", name: "Ashurov Dilyorbek Azizbek o'g'li", joinedAt: "2026-09-02" },
    { id: "std_2", name: "Ergasheva Madina Asad qizi", joinedAt: "2026-09-02" },
    { id: "std_3", name: "Erkinov Aslbekjon Kamoliddin o'g'li", joinedAt: "2026-09-02" },
    { id: "std_4", name: "JO‘RABOYEV MUXAMMADYUSUF OSTONOQUL O‘G‘LI", joinedAt: "2026-09-02" },
    { id: "std_5", name: "Jo'raboyev Javoxir Murod o'g'li", joinedAt: "2026-09-02" },
    { id: "std_6", name: "Mavlonova Ruxshona Oybek qizi", joinedAt: "2026-09-02" },
    { id: "std_7", name: "Muxtaraliyeva Dilora Dilshod qizi", joinedAt: "2026-09-02" },
    { id: "std_8", name: "O'razboyev O'tkir Baxtiyor o'g'li", joinedAt: "2026-09-02" },
    { id: "std_9", name: "Saparova Aida Sarvar qizi", joinedAt: "2026-09-02" },
    { id: "std_10", name: "Umarov Nursulton Alisher o'g'li", joinedAt: "2026-09-02" },
    { id: "std_11", name: "Xolmurodova Muazzam G'ulom qizi", joinedAt: "2026-09-02" },
    { id: "std_12", name: "Kaxarova Xumora Olimjon qizi", joinedAt: "2026-09-02" }
  ];

  EA.activeClassId = null;
  EA.viewMode = 'window'; // 'window' (10 past + 2 future) or 'all' (Umumiy davomat)
  EA.isModalOpen = false; // Prevents background sync from closing open modals
  EA.activeStudentId = null; // When set, renders QuantumEdu Student Analytics view
  EA.isNamesCollapsed = false; // Collapses student names column to the left showing only initials/starts

  // QuantumEdu Analytics State
  EA.qePeriod = 'quarter'; // 'quarter' (7 kun) | 'semester' (14 kun) | 'year' (30 kun)
  EA.qeTab = 'overview'; // 'overview' | 'attendance'
  EA.qeMetric = 'score'; // 'score' | 'gpa'
  EA.qeTheme = 'cyber'; // 'cyber' | 'emerald' | 'solar'
  EA.qeOpacity = 42;
  EA.qeBlur = 22;
  EA.qeCharts = { perf: null, radar: null, hours: null };

  // Inject Scoped QuantumEdu & Shaffof Dark-Mode Journal CSS once
  function ensureStylesInjected() {
    if (document.getElementById('ea-quantum-dark-styles')) return;
    var style = document.createElement('style');
    style.id = 'ea-quantum-dark-styles';
    style.textContent = `
      .ea-quantum-wrap {
        --glass-bg: rgba(15, 23, 42, 0.46);
        --glass-border: rgba(255, 255, 255, 0.13);
        --glass-highlight: rgba(255, 255, 255, 0.06);
        --glass-blur: 22px;
        --accent-primary: #38bdf8;
        --accent-secondary: #818cf8;
        --accent-tertiary: #c084fc;
        --accent-glow: rgba(56, 189, 248, 0.35);
        position: relative;
        color: #f8fafc;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
      }
      .ea-quantum-wrap[data-qe-theme="emerald"] {
        --accent-primary: #34d399;
        --accent-secondary: #2dd4bf;
        --accent-tertiary: #38bdf8;
        --accent-glow: rgba(52, 211, 153, 0.35);
      }
      .ea-quantum-wrap[data-qe-theme="solar"] {
        --accent-primary: #fbbf24;
        --accent-secondary: #f97316;
        --accent-tertiary: #ec4899;
        --accent-glow: rgba(251, 191, 36, 0.35);
      }
      .ea-ambient-bg {
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        overflow: hidden;
        background: radial-gradient(circle at 50% 0%, rgba(15, 23, 42, 0.92) 0%, #03060f 78%);
      }
      .ea-orb {
        position: absolute;
        border-radius: 9999px;
        filter: blur(95px);
        opacity: 0.5;
        animation: eaFloatOrb 18s infinite alternate ease-in-out;
      }
      .ea-orb-1 {
        width: 460px; height: 460px;
        background: radial-gradient(circle, var(--accent-primary), transparent 70%);
        top: -100px; left: -80px;
      }
      .ea-orb-2 {
        width: 520px; height: 520px;
        background: radial-gradient(circle, var(--accent-tertiary), transparent 70%);
        bottom: -140px; right: -100px;
        animation-delay: -6s;
      }
      .ea-orb-3 {
        width: 360px; height: 360px;
        background: radial-gradient(circle, var(--accent-secondary), transparent 70%);
        top: 36%; left: 42%;
        animation-delay: -11s;
      }
      .ea-cyber-grid {
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        background-image:
          linear-gradient(to right, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
        background-size: 44px 44px;
        mask-image: radial-gradient(ellipse at center, black 35%, transparent 85%);
        -webkit-mask-image: radial-gradient(ellipse at center, black 35%, transparent 85%);
      }
      @keyframes eaFloatOrb {
        0% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(40px, -30px) scale(1.07); }
        100% { transform: translate(-25px, 35px) scale(0.95); }
      }
      .qe-glass-panel {
        background: var(--glass-bg);
        backdrop-filter: blur(var(--glass-blur)) saturate(180%);
        -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(180%);
        border: 1px solid var(--glass-border);
        box-shadow:
          0 20px 50px rgba(2, 6, 23, 0.65),
          inset 0 1px 0 0 rgba(255, 255, 255, 0.16),
          inset 0 0 24px 0 var(--glass-highlight);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .qe-glass-interactive:hover {
        border-color: rgba(255, 255, 255, 0.28);
        transform: translateY(-3px);
        box-shadow:
          0 24px 60px rgba(2, 6, 23, 0.8),
          0 0 28px -4px var(--accent-glow),
          inset 0 1px 0 0 rgba(255, 255, 255, 0.25);
      }
      .qe-glass-pill {
        background: rgba(255, 255, 255, 0.055);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.11);
        transition: all 0.2s ease;
      }
      .qe-glass-pill:hover {
        background: rgba(255, 255, 255, 0.11);
        border-color: rgba(255, 255, 255, 0.24);
      }
      .qe-tab-active {
        background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05));
        border-color: var(--accent-primary) !important;
        color: #ffffff !important;
        box-shadow: 0 0 20px -4px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.25);
      }
      .qe-glow-bar {
        position: relative;
        overflow: hidden;
      }
      .qe-glow-bar::after {
        content: '';
        position: absolute;
        top: 0; left: -100%; width: 60%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
        animation: qeShimmer 3.2s infinite;
      }
      @keyframes qeShimmer {
        100% { left: 160%; }
      }
      .ea-journal-row:hover td:not(.ea-sticky-cell) {
        background: rgba(56, 189, 248, 0.09) !important;
      }
      .ea-journal-row:hover td.ea-sticky-cell {
        background: rgba(14, 25, 48, 0.99) !important;
      }
      .ea-names-col-cell {
        transition: width 0.24s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.24s cubic-bezier(0.16, 1, 0.3, 1), max-width 0.24s cubic-bezier(0.16, 1, 0.3, 1), padding 0.2s ease;
      }
      .ea-collapse-names-btn {
        transition: all 0.2s ease;
      }
      .ea-collapse-names-btn:hover {
        background: rgba(56, 189, 248, 0.28) !important;
        border-color: rgba(56, 189, 248, 0.75) !important;
        transform: scale(1.04);
        box-shadow: 0 0 14px rgba(56, 189, 248, 0.4);
      }
      .ea-student-name-link {
        cursor: pointer;
        transition: all 0.18s ease;
      }
      .ea-student-name-link:hover {
        color: #38bdf8 !important;
        text-shadow: 0 0 12px rgba(56, 189, 248, 0.45);
      }
      .ea-status-box.is-clickable:hover {
        transform: scale(1.06);
        filter: brightness(1.15);
      }
      .qe-kpi-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 18px;
      }
      .qe-charts-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 20px;
      }
      .qe-hero-grid {
        display: grid;
        grid-template-columns: 7fr 5fr;
        gap: 20px;
        align-items: center;
      }
      .qe-heatmap-cols {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 8px;
      }
      @media (max-width: 1024px) {
        .qe-kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .qe-charts-grid { grid-template-columns: 1fr; }
        .qe-hero-grid { grid-template-columns: 1fr; }
        .qe-heatmap-cols { grid-template-columns: repeat(6, minmax(0, 1fr)); }
      }
      @media (max-width: 640px) {
        .qe-kpi-grid { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  function getActiveUser() {
    return (window.S && window.S.user) || (window.EthithApp && window.EthithApp.state && window.EthithApp.state.user) || {};
  }

  function isTeacherRole() {
    var u = getActiveUser();
    return u && (u.role === 'teacher' || u.role === 'admin' || u.isTeacher === true);
  }

  function getWorkbookUnitsList(bookLevel) {
    if (bookLevel === 'B2') {
      if (window.ETHITH_WORKBOOK_B1 && Array.isArray(window.ETHITH_WORKBOOK_B1.unitsB2)) {
        return window.ETHITH_WORKBOOK_B1.unitsB2;
      }
    }
    if (window.ETHITH_WORKBOOK_B1 && Array.isArray(window.ETHITH_WORKBOOK_B1.units)) {
      return window.ETHITH_WORKBOOK_B1.units;
    }
    return [
      {
        unit: 1,
        title: "Unit 1: Trends",
        lessons: [
          { code: "1.1", title: "1.1 Are you really my friend?", pages: [4, 5] },
          { code: "1.2", title: "1.2 Why spending's #trending", pages: [6, 7] },
          { code: "1.3", title: "1.3 Vocabulary development", pages: [8] },
          { code: "1.4", title: "1.4 Speaking and writing", pages: [9] }
        ]
      }
    ];
  }

  function getAvailableClasses() {
    var sClasses = (window.S && window.S.classes) || [];
    if (sClasses.length === 0) {
      var u = getActiveUser();
      var defaultCls = {
        id: "cls_1_guruh",
        name: "1-GURUH",
        code: "ETH-10GURUH",
        teacherId: u.id || u.email || "teacher_1",
        teacherName: u.name || "MAMADIYOROV KARIMJON RABBIMQUL O‘G‘LI",
        teacherEmail: u.email || "teacher@ethith.uz",
        created: Date.now(),
        schedule: "har_kuni",
        students: EA.DEMO_STUDENTS.slice(),
        customStudentNames: {},
        attendance: {
          records: {},
          lessonTypes: {},
          holidays: {},
          homeworks: {},
          updatedAt: 0
        }
      };
      if (window.S) {
        window.S.classes = [defaultCls];
      }
      return [defaultCls];
    }
    return sClasses;
  }

  function getActiveOrFirstClass() {
    var sClasses = getAvailableClasses();
    if (EA.activeClassId) {
      var found = sClasses.find(function(c) { return c.id === EA.activeClassId || c.code === EA.activeClassId; });
      if (found) return found;
    }
    var withStudents = sClasses.find(function(c) { return c.students && c.students.length > 0; });
    var chosen = withStudents || sClasses[0];
    EA.activeClassId = chosen.id;
    return chosen;
  }

  function ensureClassAttendance(cls) {
    if (!cls.attendance) cls.attendance = {};
    if (!cls.attendance.records) cls.attendance.records = {};
    if (!cls.attendance.lessonTypes) cls.attendance.lessonTypes = {};
    if (!cls.attendance.holidays) cls.attendance.holidays = {};
    if (!cls.attendance.homeworks) cls.attendance.homeworks = {};
    if (!cls.customStudentNames) cls.customStudentNames = {};
    if (!cls.schedule) cls.schedule = 'har_kuni';
    if (!cls.students) cls.students = [];

    if ((cls.id === 'cls_1_guruh' || cls.id === 'cls_ethith_main' || cls.name === '1-GURUH') && cls.students.length === 0) {
      cls.students = EA.DEMO_STUDENTS.slice();
    }

    // Purge any legacy BSB / CHSB labels and normalize any >5 scores to 5-point scale
    Object.keys(cls.attendance.lessonTypes).forEach(function(k) {
      var lt = cls.attendance.lessonTypes[k] || '';
      if (lt.indexOf('BSB') !== -1 || lt.indexOf('CHSB') !== -1) {
        cls.attendance.lessonTypes[k] = 'Oddiy';
      }
    });
    Object.keys(cls.attendance.records).forEach(function(dk) {
      var dObj = cls.attendance.records[dk] || {};
      Object.keys(dObj).forEach(function(sid) {
        var r = dObj[sid];
        if (r && r.score !== undefined && r.score !== '') {
          var num = Number(r.score);
          if (num > 5) {
            r.score = num >= 28 ? '5' : (num >= 22 ? '4' : '3');
          }
        }
      });
    });

    // Ensure default activeHomework exists
    if (!cls.activeHomework) {
      var todayObj = new Date();
      var tKey = formatDateKey(todayObj);
      var tDisp = formatDisplayDate(todayObj);
      cls.activeHomework = {
        dateKey: tKey,
        dateDisp: tDisp,
        unit: 1,
        lessonCode: '1.1',
        lessonTitle: "1.1 Are you really my friend?",
        pages: [4, 5],
        note: "Intermediate (B1+) Workbook 4–5 betlardagi mashqlarni bajarib 'Tekshirish' tugmasini bosing — kunlik baho avtomatik qo'yiladi.",
        assignedAt: 0
      };
      cls.attendance.homeworks[tKey] = cls.activeHomework;
      if (!cls.attendance.lessonTypes[tKey] || cls.attendance.lessonTypes[tKey] === 'Oddiy') {
        cls.attendance.lessonTypes[tKey] = 'Vazifa: 1.1';
      }
    }

    cls.students.forEach(function(st) {
      if (!st.joinedAt) {
        if (cls.created) {
          var cd = new Date(cls.created);
          st.joinedAt = formatDateKey(cd);
        } else {
          st.joinedAt = "2026-09-02";
        }
      }
    });

    return cls;
  }

  EA.getLatestClassHomework = function(cls) {
    ensureClassAttendance(cls);
    return cls.activeHomework;
  };

  function seedDemoWindowIfNeeded(cls, dates) {
    if (!cls || !cls.attendance || cls.attendance.seededWindowV3) return;
    if (cls.id !== 'cls_1_guruh' && cls.id !== 'cls_ethith_main' && cls.name !== '1-GURUH') return;

    var todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);

    var stList = cls.students || [];
    if (stList.length === 0) return;

    var sampleLessons = ['1.1', '1.2', '1.3', '1.4', '2.1', '2.2', '2.3', '2.4', '3.1', '3.2', '3.3'];

    dates.forEach(function(dt, dIdx) {
      if (dt > todayObj) return;
      if (dt.getDay() === 0) return;
      var dKey = formatDateKey(dt);
      if (cls.attendance.holidays && cls.attendance.holidays[dKey]) return;

      var lesCode = sampleLessons[dIdx % sampleLessons.length];
      if (!cls.attendance.lessonTypes[dKey] || cls.attendance.lessonTypes[dKey] === 'Oddiy') {
        cls.attendance.lessonTypes[dKey] = 'Vazifa: ' + lesCode;
      }

      if (!cls.attendance.records[dKey]) cls.attendance.records[dKey] = {};

      stList.forEach(function(st, sIdx) {
        var stId = st.id || st.email || ('std_' + sIdx);
        var existing = cls.attendance.records[dKey][stId];
        if (existing && existing.hwCompletedAt) return; // Don't overwrite real student submissions

        var hash = (dIdx * 7 + sIdx * 13) % 19;
        var status = 'K';
        var score = '5';
        var hwDone = true;
        var hwPct = 92;

        if (hash === 3 || hash === 11) {
          status = 'Q';
          score = '2';
          hwDone = false;
          hwPct = 0;
        } else if (hash === 7) {
          status = 'S';
          score = '';
          hwDone = false;
          hwPct = 0;
        } else if (hash % 4 === 0) {
          score = '4';
          hwPct = 80;
        } else if (hash % 9 === 0) {
          score = '3';
          hwPct = 66;
        } else {
          score = '5';
          hwPct = 94;
        }

        cls.attendance.records[dKey][stId] = {
          status: status,
          score: score,
          hwDone: hwDone,
          hwPct: hwPct,
          hwLesson: lesCode
        };
      });
    });

    cls.attendance.seededWindowV3 = true;
  }

  // ============================================================================
  // AUTOMATIC HOMEWORK TRACKING & DAILY GRADING ENGINE
  // Called automatically when a student completes & checks exercises in Intermediate (B1+)
  // ============================================================================
  EA.recordStudentHomeworkCompletion = function(data) {
    if (!data) return;
    var u = getActiveUser();
    var pct = typeof data.pct === 'number' ? data.pct : 100;
    var autoGrade = data.autoGrade || (pct >= 86 ? 5 : (pct >= 71 ? 4 : (pct >= 55 ? 3 : 2)));
    var lessonCode = data.lessonCode || '1.1';
    var todayKey = formatDateKey(new Date());

    var allClasses = getAvailableClasses();
    var updatedAny = false;

    allClasses.forEach(function(cls) {
      ensureClassAttendance(cls);

      // Find which date has this homework assigned, or fallback to activeHomework dateKey or todayKey
      var targetDateKey = todayKey;
      if (window._ethithActiveHwContext && window._ethithActiveHwContext.classId === cls.id && window._ethithActiveHwContext.dateKey) {
        targetDateKey = window._ethithActiveHwContext.dateKey;
      } else if (cls.activeHomework && cls.activeHomework.lessonCode === lessonCode && cls.activeHomework.dateKey) {
        targetDateKey = cls.activeHomework.dateKey;
      } else if (cls.attendance.homeworks) {
        Object.keys(cls.attendance.homeworks).forEach(function(dk) {
          if (cls.attendance.homeworks[dk] && cls.attendance.homeworks[dk].lessonCode === lessonCode) {
            targetDateKey = dk;
          }
        });
      }

      // Match student in class
      var myId = u.id || u.email || '';
      var myEmail = (u.email || '').toLowerCase().trim();
      var myName = (u.name || '').toLowerCase().trim();

      var matchedSt = (cls.students || []).find(function(s) {
        var sId = (s.id || '').toLowerCase().trim();
        var sEm = (s.email || '').toLowerCase().trim();
        var sNm = (cls.customStudentNames[s.id] || s.name || '').toLowerCase().trim();
        return (myId && (s.id === myId || s.email === myId)) ||
               (myEmail && (sEm === myEmail || sId === myEmail)) ||
               (myName && sNm && (sNm === myName || sNm.indexOf(myName) !== -1 || myName.indexOf(sNm) !== -1));
      });

      // If student is logged in and not yet in class roster, or testing as demo user, match or enroll
      var targetStId = null;
      if (matchedSt) {
        targetStId = matchedSt.id || matchedSt.email;
      } else if (u && u.role === 'student' && (u.id || u.email || u.name)) {
        targetStId = u.id || u.email || ('std_' + Date.now());
        cls.students.push({
          id: targetStId,
          name: u.name || "O'quvchi",
          email: u.email || '',
          joinedAt: todayKey
        });
      } else if (cls.students && cls.students.length > 0) {
        // Fallback to first student if teacher is testing homework auto-grading
        targetStId = cls.students[0].id || cls.students[0].email;
      }

      if (targetStId) {
        if (!cls.attendance.records[targetDateKey]) cls.attendance.records[targetDateKey] = {};
        cls.attendance.records[targetDateKey][targetStId] = {
          status: 'K', // Automatically mark Present (Kelgan)
          score: String(autoGrade), // Automatically put Daily Grade (5, 4, 3, 2)
          hwDone: true,
          hwPct: pct,
          hwLesson: lessonCode,
          hwCorrect: data.correctCount || 0,
          hwTotal: data.totalQuestions || 0,
          hwCompletedAt: Date.now()
        };
        if (!cls.attendance.lessonTypes[targetDateKey] || cls.attendance.lessonTypes[targetDateKey] === 'Oddiy') {
          cls.attendance.lessonTypes[targetDateKey] = 'Vazifa: ' + lessonCode;
        }
        persistAttendance(cls);
        updatedAny = true;
      }
    });

    if (updatedAny) {
      var banner = document.createElement('div');
      banner.style.cssText = 'position:fixed;top:22px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#059669,#0284c7);color:#ffffff;padding:14px 26px;border-radius:16px;font-weight:800;font-size:14px;z-index:2147483647;box-shadow:0 16px 40px rgba(0,0,0,0.55);border:1.5px solid #34d399;text-align:center;';
      banner.innerHTML = '✅ <b>Uy vazifasi (' + esc(lessonCode) + ') avtomatik tekshirildi!</b><br><span style="font-size:13px;color:#d1fae5;">Natija: <b>' + pct + '%</b> • Davomat jurnaliga avtomatik <b>"' + autoGrade + '" baho</b> va <b>"K" (Kelgan)</b> qo\'yildi!</span>';
      document.body.appendChild(banner);
      setTimeout(function() { if (banner && banner.parentNode) banner.remove(); }, 5000);
    }
  };

  function formatDisplayDate(d) {
    var day = String(d.getDate()).padStart(2, '0');
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var year = d.getFullYear();
    return day + '.' + month + '.' + year;
  }

  function formatIsoToDisplay(isoStr) {
    if (!isoStr) return '02.09.2026';
    var parts = String(isoStr).split('-');
    if (parts.length === 3) {
      return parts[2].slice(0, 2) + '.' + parts[1] + '.' + parts[0];
    }
    return isoStr;
  }

  function formatDateKey(d) {
    var day = String(d.getDate()).padStart(2, '0');
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var year = d.getFullYear();
    return year + '-' + month + '-' + day;
  }

  function isScheduledLessonDay(dateObj, schedule) {
    var dow = dateObj.getDay();
    if (dow === 0) return false;
    if (schedule === 'juft') {
      return dow === 2 || dow === 4 || dow === 6;
    } else if (schedule === 'toq') {
      return dow === 1 || dow === 3 || dow === 5;
    }
    return true;
  }

  function getJournalDates(cls, viewMode) {
    var schedule = cls.schedule || 'har_kuni';
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var count = 0;
    var cur = new Date(today);
    while (count < 10) {
      cur.setDate(cur.getDate() - 1);
      if (isScheduledLessonDay(cur, schedule)) {
        count++;
      }
    }
    var windowStartDate = new Date(cur);

    var startDate = new Date(windowStartDate);
    if (viewMode === 'all') {
      var countAll = 0;
      var curAll = new Date(today);
      while (countAll < 25) {
        curAll.setDate(curAll.getDate() - 1);
        if (isScheduledLessonDay(curAll, schedule)) {
          countAll++;
        }
      }
      startDate = new Date(curAll);
      var recKeys = Object.keys((cls.attendance && cls.attendance.records) || {}).sort();
      if (recKeys.length > 0) {
        var earliestKey = recKeys[0];
        var ep = earliestKey.split('-');
        if (ep.length === 3) {
          var eDate = new Date(parseInt(ep[0], 10), parseInt(ep[1], 10) - 1, parseInt(ep[2], 10));
          if (!isNaN(eDate.getTime()) && eDate < startDate) {
            startDate = eDate;
          }
        }
      }
    }

    var futureCount = 0;
    var fCur = new Date(today);
    while (futureCount < 2) {
      fCur.setDate(fCur.getDate() + 1);
      if (isScheduledLessonDay(fCur, schedule)) {
        futureCount++;
      }
    }
    var endDate = new Date(fCur);

    var dates = [];
    var iter = new Date(startDate);
    while (iter <= endDate) {
      if (isScheduledLessonDay(iter, schedule) || iter.getDay() === 0) {
        dates.push(new Date(iter));
      }
      iter.setDate(iter.getDate() + 1);
    }

    return dates;
  }

  function persistAttendance(cls) {
    if (!cls.attendance) cls.attendance = {};
    cls.attendance.updatedAt = Date.now();

    if (window.S && Array.isArray(window.S.classes)) {
      var idx = window.S.classes.findIndex(function(c) { return c.id === cls.id || c.code === cls.code; });
      if (idx !== -1) {
        window.S.classes[idx] = cls;
      }
    }

    if (window.EthithApp && typeof window.EthithApp.saveState === 'function') {
      window.EthithApp.saveState();
    } else if (window.App && typeof window.App.saveState === 'function') {
      window.App.saveState();
    }

    if (window.EthithSync) {
      if (typeof window.EthithSync.publishLive === 'function') {
        window.EthithSync.publishLive({
          type: 'ATTENDANCE_UPDATED',
          classId: cls.id,
          classCode: cls.code,
          attendance: cls.attendance,
          schedule: cls.schedule,
          customStudentNames: cls.customStudentNames,
          activeHomework: cls.activeHomework,
          ts: cls.attendance.updatedAt
        });
      }
      if (typeof window.EthithSync.broadcastLocal === 'function' && window.S) {
        window.EthithSync.broadcastLocal(window.S.classes, window.S.exams);
      }
      if (typeof window.EthithSync.pushRemoteStore === 'function') {
        window.EthithSync.pushRemoteStore();
      }
    }
  }

  function getGlobalModalRoot() {
    var root = document.getElementById('eaGlobalModalRoot');
    if (!root) {
      root = document.createElement('div');
      root.id = 'eaGlobalModalRoot';
      document.body.appendChild(root);
    }
    return root;
  }

  function closeGlobalModal() {
    EA.isModalOpen = false;
    var root = document.getElementById('eaGlobalModalRoot');
    if (root) root.innerHTML = '';
  }

  window._ethithRefreshAttendance = function() {
    if (window._ethithCurrentView !== 'attendance') return;
    if (EA.isModalOpen) return;
    var modalRoot = document.getElementById('eaGlobalModalRoot');
    if (modalRoot && modalRoot.innerHTML.trim() !== '') return;
    if (EA.activeStudentId) return;

    var container = document.getElementById('apView');
    if (container) {
      var scrollWrap = container.querySelector('.ea-table-scroll-wrap');
      var prevLeft = scrollWrap ? scrollWrap.scrollLeft : null;
      EA.render(container, prevLeft);
    }
  };

  // ============================================================================
  // MAIN RENDER ENTRY POINT
  // ============================================================================
  EA.render = function(container, preserveScrollLeft) {
    if (!container) container = document.getElementById('apView');
    if (!container) return;

    ensureStylesInjected();
    window._ethithCurrentView = 'attendance';

    var allClasses = getAvailableClasses();
    var cls = getActiveOrFirstClass();
    ensureClassAttendance(cls);

    if (window.EthithSync && typeof window.EthithSync.subscribeClass === 'function') {
      window.EthithSync.subscribeClass(cls.code || cls.id);
    }

    var dates = getJournalDates(cls, EA.viewMode);
    seedDemoWindowIfNeeded(cls, dates);

    // If a student is clicked, open QuantumEdu Student Daily Tasks & Growth/Decline Statistics!
    if (EA.activeStudentId) {
      EA.renderQuantumStudentAnalytics(container, cls);
      return;
    }

    var isTeacher = isTeacherRole();
    var students = (cls.students || []).slice();

    students.sort(function(a, b) {
      var idA = a.id || a.email || '';
      var idB = b.id || b.email || '';
      var nA = (cls.customStudentNames[idA] || a.name || '').toLowerCase();
      var nB = (cls.customStudentNames[idB] || b.name || '').toLowerCase();
      return nA.localeCompare(nB);
    });

    var schedLabels = {
      'har_kuni': 'Har kungi dars (Dushanba – Shanba)',
      'juft': 'Juft kunlari (Seshanba, Payshanba, Shanba)',
      'toq': 'Toq kunlari (Dushanba, Chorshanba, Juma)'
    };
    var currentSchedLabel = schedLabels[cls.schedule] || schedLabels['har_kuni'];
    var activeHw = cls.activeHomework;

    var h = '<div class="eth-attendance-wrap ea-quantum-wrap" data-qe-theme="' + esc(EA.qeTheme) + '" style="max-width:100%;margin:0 auto;padding:10px 14px 80px;position:relative;z-index:1;">';

    h += '<div class="ea-ambient-bg"><div class="ea-orb ea-orb-1"></div><div class="ea-orb ea-orb-2"></div><div class="ea-orb ea-orb-3"></div></div>';
    h += '<div class="ea-cyber-grid"></div>';

    h += '<div style="position:relative;z-index:2;">';

    // 0. CLASSES & CHATS SYNCED CLASS SELECTOR BAR
    h += '<div class="qe-glass-panel" style="border-radius:20px;padding:12px 16px;margin-bottom:14px;">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:8px;">' +
        '<div style="font-size:12px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;display:flex;align-items:center;gap:8px;">' +
          '<span style="width:8px;height:8px;border-radius:50%;background:#38bdf8;box-shadow:0 0 10px #38bdf8;display:inline-block;"></span>' +
          '<span>🏫 Classes &amp; Chats Sinflari (' + allClasses.length + ' ta) — Ustiga bosib tanlang:</span>' +
        '</div>' +
        '<button id="eaGoClassesBtn" class="qe-glass-pill" style="color:#38bdf8;border-radius:10px;padding:6px 14px;font-size:12px;font-weight:800;cursor:pointer;">💬 Guruh Chatiga O\'tish / Yangi Sinf &rarr;</button>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:10px;overflow-x:auto;padding-bottom:4px;">';

    allClasses.forEach(function(c) {
      var isAct = (c.id === cls.id);
      var stCount = (c.students && c.students.length) ? c.students.length : ((c.id === 'cls_1_guruh' || c.id === 'cls_ethith_main') ? EA.DEMO_STUDENTS.length : 0);
      h += '<div class="ea-class-card-tab" data-clsid="' + esc(c.id) + '" style="' +
        'cursor:pointer;min-width:210px;padding:10px 14px;border-radius:14px;transition:all 0.2s;backdrop-filter:blur(16px);' +
        'border:1.5px solid ' + (isAct ? '#38bdf8' : 'rgba(255,255,255,0.12)') + ';' +
        'background:' + (isAct ? 'linear-gradient(135deg, rgba(56,189,248,0.22), rgba(129,140,248,0.12))' : 'rgba(15,23,42,0.55)') + ';' +
        'box-shadow:' + (isAct ? '0 0 22px -4px rgba(56,189,248,0.4), inset 0 1px 0 rgba(255,255,255,0.2)' : 'none') + ';">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;">' +
          '<b style="font-size:13.5px;color:' + (isAct ? '#ffffff' : '#cbd5e1') + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(c.name || 'Sinf') + '</b>' +
          '<span style="font-size:10.5px;font-weight:800;padding:2px 7px;border-radius:999px;background:' + (isAct ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.07)') + ';color:' + (isAct ? '#7dd3fc' : '#94a3b8') + ';border:1px solid ' + (isAct ? 'rgba(56,189,248,0.4)' : 'transparent') + ';">' + stCount + ' o\'quvchi</span>' +
        '</div>' +
        '<div style="font-size:11px;color:#94a3b8;">Kod: <b style="color:#38bdf8;font-family:monospace;">' + esc(c.code || '') + '</b></div>' +
      '</div>';
    });

    h += '</div></div>';

    // 1. ACTIVE HOMEWORK & AUTO-GRADING BANNER (For every class!)
    if (activeHw) {
      h += '<div class="qe-glass-panel" style="border-radius:18px;padding:12px 18px;margin-bottom:16px;border-color:rgba(56,189,248,0.4);background:linear-gradient(135deg,rgba(15,23,42,0.75),rgba(30,58,138,0.45));display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">' +
        '<div style="display:flex;align-items:center;gap:12px;flex:1;min-width:240px;">' +
          '<div style="width:42px;height:42px;border-radius:12px;background:rgba(56,189,248,0.18);border:1px solid rgba(56,189,248,0.45);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">📚</div>' +
          '<div>' +
            '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
              '<span style="font-size:11px;font-weight:900;text-transform:uppercase;padding:2px 8px;border-radius:6px;background:rgba(56,189,248,0.22);color:#7dd3fc;border:1px solid rgba(56,189,248,0.4);">SINF UY VAZIFASI (' + esc(activeHw.dateDisp || activeHw.dateKey) + ')</span>' +
              '<span style="font-size:11px;font-weight:800;padding:2px 8px;border-radius:6px;background:rgba(16,185,129,0.2);color:#6ee7b7;border:1px solid rgba(52,211,153,0.4);">⚡ Avtomatik tekshirish va kunlik baho (B) qo\'yish faol</span>' +
            '</div>' +
            '<div style="font-size:14px;font-weight:800;color:#ffffff;margin-top:3px;">Intermediate (B1+) · Unit ' + esc(activeHw.unit) + ' — ' + esc(activeHw.lessonTitle || activeHw.lessonCode) + (activeHw.pages ? ' <span style="color:#7dd3fc;font-size:12.5px;">(Workbook ' + activeHw.pages.join('–') + '-betlar)</span>' : '') + '</div>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
          '<button type="button" id="eaOpenActiveHwBtn" style="background:linear-gradient(135deg,#10b981,#059669);color:#ffffff;border:none;border-radius:10px;padding:8px 15px;font-size:12.5px;font-weight:800;cursor:pointer;box-shadow:0 4px 14px rgba(16,185,129,0.35);">🚀 Topshiriqni Ochish / Bajarish &rarr;</button>' +
        '</div>' +
      '</div>';
    }

    // 2. Class Header & Title
    h += '<div style="text-align:center;margin-bottom:16px;">' +
      '<h2 style="font-size:24px;font-weight:900;margin:0 0 6px;color:#ffffff;letter-spacing:-0.02em;text-shadow:0 0 24px rgba(56,189,248,0.25);">' +
        '<span style="background:linear-gradient(135deg,#38bdf8,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">' + esc(cls.name || '1-GURUH') + '</span>' +
        '<span style="color:#64748b;margin:0 8px;">—</span>' +
        '<span style="color:#f8fafc;">' + esc(cls.teacherName || 'MAMADIYOROV KARIMJON RABBIMQUL O‘G‘LI') + '</span>' +
      '</h2>' +
      '<div style="font-size:12.5px;color:#94a3b8;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;margin-top:6px;">' +
        '<span class="qe-glass-pill" style="padding:3px 10px;border-radius:999px;">Sinf Kodi: <b style="font-family:monospace;color:#38bdf8;">' + esc(cls.code || 'ETH-10GURUH') + '</b></span>' +
        '<span class="qe-glass-pill" style="padding:3px 10px;border-radius:999px;">Tartib: <b style="color:#e2e8f0;">' + currentSchedLabel + '</b></span>' +
        '<span class="qe-glass-pill" style="padding:3px 10px;border-radius:999px;">O\'quvchilar: <b style="color:#34d399;">' + students.length + ' nafar</b></span>' +
      '</div>' +
    '</div>';

    // 3. Top Toolbar: Teacher "Tahrirlash" + "Uy vazifasi belgilash" + Excel "Yuklab olish" button
    h += '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:14px;">' +
      '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">';

    if (isTeacher) {
      h += '<button type="button" id="eaScheduleBtn" style="background:linear-gradient(135deg, rgba(56,189,248,0.22), rgba(129,140,248,0.22));backdrop-filter:blur(14px);color:#ffffff;border:1px solid rgba(56,189,248,0.5);border-radius:12px;padding:9px 16px;font-size:13px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:8px;box-shadow:0 0 22px -4px rgba(56,189,248,0.35);transition:all 0.2s;">' +
        '<span>✏️ Tahrirlash (' + (cls.schedule === 'juft' ? 'Juft kunlari' : (cls.schedule === 'toq' ? 'Toq kunlari' : 'Har kungi dars')) + ')</span>' +
      '</button>';
      h += '<button type="button" id="eaAssignHomeworkBtn" style="background:linear-gradient(135deg, #8b5cf6, #6366f1);color:#ffffff;border:1px solid rgba(192,132,252,0.55);border-radius:12px;padding:9px 18px;font-size:13px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:8px;box-shadow:0 0 24px -4px rgba(139,92,246,0.5);transition:all 0.2s;">' +
        '<span>📚 Uy vazifasi belgilash (Intermediate B1+)</span>' +
      '</button>';
    } else {
      h += '<span class="qe-glass-pill" style="color:#cbd5e1;border-radius:12px;padding:8px 14px;font-size:12.5px;font-weight:800;">👁 O\'quvchi rejimi (Baholar vazifa bajarilgach avtomatik qo\'yiladi)</span>';
    }

    h += '</div>';

    // Right Action: Authentic Green PIIMA Excel Export Button ("Yuklab olish")
    h += '<div style="display:flex;align-items:center;gap:10px;">' +
      '<button type="button" id="eaExportExcelBtn" style="background:linear-gradient(135deg,#10b981,#059669);color:#ffffff;border:1px solid rgba(52,211,153,0.5);border-radius:12px;padding:9px 20px;font-size:13.5px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:8px;box-shadow:0 0 24px -2px rgba(16,185,129,0.45);transition:all 0.2s;">' +
        '<span>Yuklab olish</span>' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">' +
          '<path d="M12 3.5H23.5V20.5H12V3.5Z" fill="white"></path>' +
          '<path d="M23.5 21H13.5C13.2236 21 13 20.7764 13 20.5C13 20.2236 13.2236 20 13.5 20H23V4H13.5C13.2236 4 13 3.77637 13 3.5C13 3.22363 13.2236 3 13.5 3H23.5C23.7764 3 24 3.22363 24 3.5V20.5C24 20.7764 23.7764 21 23.5 21Z" fill="white"></path>' +
          '<path opacity="0.2" d="M0 2.6087V2.8587L14 0.25V0L0 2.6087Z" fill="white"></path>' +
          '<path d="M13 5H17V7H13V5Z" fill="#059669"></path>' +
          '<path d="M18 5H22V7H18V5Z" fill="#059669"></path>' +
          '<path d="M13 8H17V10H13V8Z" fill="#059669"></path>' +
          '<path d="M18 8H22V10H18V8Z" fill="#059669"></path>' +
          '<path d="M13 11H17V13H13V11Z" fill="#059669"></path>' +
          '<path d="M18 11H22V13H18V11Z" fill="#059669"></path>' +
          '<path d="M13 14H17V16H13V14Z" fill="#059669"></path>' +
          '<path d="M18 14H22V16H18V14Z" fill="#059669"></path>' +
          '<path d="M13 17H17V19H13V17Z" fill="#059669"></path>' +
          '<path d="M18 17H22V19H18V17Z" fill="#059669"></path>' +
          '<path d="M14 0L0 2.6087V21.3913L14 24V0Z" fill="white"></path>' +
          '<path opacity="0.1" d="M0 21.3914L14 24.0001V23.7501L0 21.1414V21.3914Z" fill="black"></path>' +
          '<path d="M7.35 12.5L9.65 8.36L7.87 8.47L6.5 10.95L5.22 8.66L3.57 8.78L5.64 12.5L3.57 16.21L5.22 16.33L6.5 14.04L7.87 16.52L9.65 16.63L7.35 12.5Z" fill="#059669"></path>' +
        '</svg>' +
      '</button>' +
    '</div></div>';

    // 4. THE SHAFFOF DARK-MODE GLASSMORPHIC JOURNAL TABLE CONTAINER
    var isCollapsed = !!EA.isNamesCollapsed;
    var numColW = isCollapsed ? 40 : 54;
    var nameColW = isCollapsed ? 96 : 265;

    function getStudentShortInfo(fullName) {
      var clean = String(fullName || '').trim();
      if (!clean) return { initials: '?', shortStart: '?' };
      var parts = clean.split(/\s+/);
      function firstLetter(word) {
        if (!word) return '';
        var u = word.toUpperCase();
        if (u.indexOf("O'") === 0 || u.indexOf("O‘") === 0 || u.indexOf("O’") === 0) return "O'";
        if (u.indexOf("G'") === 0 || u.indexOf("G‘") === 0 || u.indexOf("G’") === 0) return "G'";
        if (u.indexOf("SH") === 0) return "Sh";
        if (u.indexOf("CH") === 0) return "Ch";
        return u.charAt(0);
      }
      var l1 = firstLetter(parts[0]);
      var l2 = parts.length > 1 ? firstLetter(parts[1]) : '';
      var initials = l1 + (l2 ? '.' + l2 : '');
      var w1 = parts[0] || clean;
      var shortStart = w1.length > 6 ? (w1.slice(0, 6) + '…') : (w1 + (l2 ? ' ' + l2 + '.' : ''));
      return { initials: initials, shortStart: shortStart };
    }

    h += '<div class="ea-table-scroll-wrap qe-glass-panel" style="position:relative;width:100%;overflow-x:auto;border-radius:22px;padding:2px;">';
    h += '<table class="my-table" style="border-collapse:separate;border-spacing:0;width:max-content;min-width:100%;">';

    // TABLE HEADER
    h += '<thead><tr style="background:rgba(8,13,26,0.65);">';

    // Sticky Col 1: №
    h += '<th class="ea-sticky-cell ea-names-col-cell" style="position:sticky;left:0;z-index:30;background:rgba(8,13,26,0.98);backdrop-filter:blur(20px);width:' + numColW + 'px;min-width:' + numColW + 'px;max-width:' + numColW + 'px;padding:' + (isCollapsed ? '6px 4px' : '8px') + ';border-bottom:1px solid rgba(255,255,255,0.1);border-right:1px solid rgba(255,255,255,0.08);">' +
      '<div style="height:115px;display:flex;align-items:center;justify-content:center;font-size:' + (isCollapsed ? '12.5px' : '14px') + ';font-weight:900;color:#94a3b8;border:1px solid rgba(255,255,255,0.12);border-radius:12px;background:rgba(15,23,42,0.65);box-shadow:inset 0 1px 0 rgba(255,255,255,0.1);">' +
        '№' +
      '</div>' +
    '</th>';

    // Sticky Col 2: O'quvchi F.I.SH (Collapsible to the left!)
    h += '<th class="ea-sticky-cell ea-names-col-cell" style="position:sticky;left:' + numColW + 'px;z-index:30;background:rgba(8,13,26,0.98);backdrop-filter:blur(20px);width:' + nameColW + 'px;min-width:' + nameColW + 'px;max-width:' + nameColW + 'px;padding:' + (isCollapsed ? '6px 5px' : '8px') + ';border-bottom:1px solid rgba(255,255,255,0.1);border-right:2px solid rgba(56,189,248,0.35);">' +
      '<div id="eaToggleNamesHeaderBox" title="' + (isCollapsed ? 'Ismlarni to\'liq ko\'rsatish (Kattalashtirish)' : 'Ismlarni chap tomonga yig\'ish (Kichraytirish)') + '" style="height:115px;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:' + (isCollapsed ? '12px' : '14px') + ';font-weight:900;color:#f8fafc;border:1px solid rgba(56,189,248,0.22);border-radius:12px;background:rgba(15,23,42,0.72);padding:' + (isCollapsed ? '4px' : '0 12px') + ';text-align:center;box-shadow:inset 0 1px 0 rgba(255,255,255,0.12);cursor:pointer;overflow:hidden;">' +
        (isCollapsed
          ? '<span style="font-size:11.5px;font-weight:900;color:#e2e8f0;letter-spacing:0.02em;">F.I.SH</span>' +
            '<button type="button" id="eaToggleNamesColBtn" class="ea-collapse-names-btn" style="margin-top:8px;background:rgba(56,189,248,0.2);color:#38bdf8;border:1px solid rgba(56,189,248,0.5);border-radius:8px;padding:4px 8px;font-size:11px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:4px;box-shadow:0 0 10px rgba(56,189,248,0.25);">' +
              '<span>Ochish</span><span>&raquo;</span>' +
            '</button>'
          : '<span>O’quvchi F.I.SH</span>' +
            '<span style="font-size:10.5px;font-weight:600;color:#38bdf8;margin-top:3px;">(Tahlil uchun ism ustiga bosing 📊)</span>' +
            '<button type="button" id="eaToggleNamesColBtn" class="ea-collapse-names-btn" style="margin-top:7px;background:rgba(56,189,248,0.16);color:#7dd3fc;border:1px solid rgba(56,189,248,0.42);border-radius:8px;padding:3px 10px;font-size:11px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:5px;">' +
              '<span>&laquo; Chapga yopish</span>' +
            '</button>') +
      '</div>' +
    '</th>';

    // Date Columns
    var todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);
    var todayKey = formatDateKey(todayObj);

    dates.forEach(function(dt) {
      var dKey = formatDateKey(dt);
      var dDisp = formatDisplayDate(dt);
      var isSunday = (dt.getDay() === 0);
      var isHoliday = isSunday || (cls.attendance.holidays && cls.attendance.holidays[dKey] === true);
      var isFuture = dt > todayObj;
      var hwForDate = cls.attendance.homeworks && cls.attendance.homeworks[dKey];
      var rawType = cls.attendance.lessonTypes[dKey] || '';
      if (rawType.indexOf('BSB') !== -1 || rawType.indexOf('CHSB') !== -1) rawType = 'Oddiy';

      var lessonType = isSunday
        ? 'Yakshanba'
        : (isHoliday
          ? 'Dam olish'
          : (hwForDate ? ('📚 Vazifa: ' + hwForDate.lessonCode) : (rawType || 'Oddiy')));
      var isToday = (dKey === todayKey);

      var cardBg = isHoliday
        ? 'rgba(244, 63, 94, 0.16)'
        : (isToday
          ? 'rgba(56, 189, 248, 0.16)'
          : (isFuture ? 'rgba(52, 211, 153, 0.09)' : 'rgba(15, 23, 42, 0.62)'));

      var cardBorder = isHoliday
        ? 'rgba(251, 113, 133, 0.5)'
        : (isToday
          ? 'rgba(56, 189, 248, 0.65)'
          : (isFuture ? 'rgba(52, 211, 153, 0.35)' : 'rgba(255, 255, 255, 0.12)'));

      var cardShadow = isHoliday
        ? '0 0 18px rgba(244, 63, 94, 0.15), inset 0 1px 0 rgba(255,255,255,0.12)'
        : (isToday
          ? '0 0 22px rgba(56, 189, 248, 0.22), inset 0 1px 0 rgba(255,255,255,0.2)'
          : 'inset 0 1px 0 rgba(255,255,255,0.08)');

      var typeColor = isHoliday
        ? '#fb7185'
        : (lessonType.indexOf('Vazifa') !== -1 ? '#38bdf8' : (isFuture ? '#34d399' : '#cbd5e1'));

      h += '<th style="width:136px;min-width:136px;padding:8px 6px;border-bottom:1px solid rgba(255,255,255,0.1);border-right:1px solid rgba(255,255,255,0.06);">' +
        '<div class="ea-date-header-card" data-date="' + dKey + '" data-sunday="' + (isSunday ? '1' : '0') + '" ' +
          'title="' + (isSunday ? 'Yakshanba - Dam olish kuni' : (isTeacher ? '1 marta bosish: Qizil Dam olish kuni qilish / qaytarish' : dDisp)) + '" ' +
          'style="height:115px;border-radius:12px;border:1.5px solid ' + cardBorder + ';background:' + cardBg + ';box-shadow:' + cardShadow + ';display:grid;grid-template-columns:1fr 1fr;position:relative;overflow:hidden;cursor:' + (isTeacher && !isSunday ? 'pointer' : 'default') + ';transition:all 0.2s;">' +
          (isTeacher && !isSunday ?
            '<div class="ea-date-opts-btn" data-date="' + dKey + '" data-disp="' + dDisp + '" title="Sana sozlamasi va Uy vazifasi belgilash" style="position:absolute;top:4px;right:5px;cursor:pointer;color:#94a3b8;font-size:15px;font-weight:900;line-height:1;z-index:5;padding:2px 5px;border-radius:6px;background:rgba(255,255,255,0.06);">' +
              '⋮' +
            '</div>' : '') +
          '<div style="grid-column:span 2;padding:6px 8px 4px;border-bottom:1px solid ' + cardBorder + ';text-align:center;">' +
            '<div style="font-size:11px;font-weight:900;color:' + typeColor + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="' + esc(lessonType) + '">' +
              esc(lessonType) +
            '</div>' +
            '<div style="border-top:1px dashed ' + cardBorder + ';margin:4px 0 3px;opacity:0.6;"></div>' +
            '<div style="font-size:11.5px;font-weight:800;color:' + (isHoliday ? '#fda4af' : (isToday ? '#38bdf8' : '#f8fafc')) + ';">' +
              dDisp +
            '</div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:' + (isHoliday ? '#fb7185' : '#94a3b8') + ';padding:4px 0;" title="Davomat (K / K / S)">D</div>' +
          '<div style="display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:' + (isHoliday ? '#fb7185' : '#38bdf8') + ';padding:4px 0;border-left:1px solid ' + cardBorder + ';" title="Avtomatik Kunlik Baho (Vazifa natijasiga ko\'ra)">B ⚡</div>' +
        '</div>' +
      '</th>';
    });

    h += '</tr></thead>';

    // TABLE BODY
    h += '<tbody>';

    if (students.length === 0) {
      h += '<tr><td colspan="' + (dates.length + 2) + '" style="padding:48px;text-align:center;color:#94a3b8;font-weight:700;">Bu sinfga hali o\'quvchilar qo\'shilmagan. O\'quvchilar Classes &amp; Chats orqali sinf kodini terib qo\'shilishi bilan shu jadvalda avtomatik paydo bo\'ladi!</td></tr>';
    } else {
      students.forEach(function(st, sIdx) {
        var stId = st.id || st.email || ('std_' + sIdx);
        var stName = cls.customStudentNames[stId] || st.name || ("O'quvchi " + (sIdx + 1));
        var joinedDisp = formatIsoToDisplay(st.joinedAt || '2026-09-02');
        var rowBg = sIdx % 2 === 0 ? 'rgba(15, 23, 42, 0.35)' : 'rgba(15, 23, 42, 0.52)';
        var stickyBg = sIdx % 2 === 0 ? 'rgba(8, 13, 26, 0.97)' : 'rgba(11, 18, 34, 0.98)';

        var shortInfo = getStudentShortInfo(stName);

        h += '<tr class="ea-journal-row" style="background:' + rowBg + ';transition:background 0.15s;">';

        // Sticky Col 1: №
        h += '<td class="ea-sticky-cell ea-names-col-cell" style="position:sticky;left:0;z-index:20;background:' + stickyBg + ';backdrop-filter:blur(18px);width:' + numColW + 'px;min-width:' + numColW + 'px;max-width:' + numColW + 'px;text-align:center;font-size:' + (isCollapsed ? '12px' : '13px') + ';font-weight:900;color:#94a3b8;padding:' + (isCollapsed ? '6px 2px' : '8px 4px') + ';border-bottom:1px solid rgba(255,255,255,0.06);border-right:1px solid rgba(255,255,255,0.08);">' +
          (sIdx + 1) +
        '</td>';

        // Sticky Col 2: Student Name (Clickable -> Opens QuantumEdu Student Analytics! Collapsible to left!)
        h += '<td class="ea-sticky-cell ea-names-col-cell" style="position:sticky;left:' + numColW + 'px;z-index:20;background:' + stickyBg + ';backdrop-filter:blur(18px);width:' + nameColW + 'px;min-width:' + nameColW + 'px;max-width:' + nameColW + 'px;padding:' + (isCollapsed ? '6px 6px' : '7px 12px') + ';border-bottom:1px solid rgba(255,255,255,0.06);border-right:2px solid rgba(56,189,248,0.35);overflow:hidden;">' +
          (isCollapsed
            ? '<div class="ea-student-name-link" data-stid="' + esc(stId) + '" title="' + esc(stName) + ' (Bosish: Tahlilni ochish)" style="display:flex;align-items:center;gap:5px;overflow:hidden;width:100%;">' +
                '<span style="width:26px;height:26px;border-radius:7px;background:linear-gradient(135deg,rgba(56,189,248,0.22),rgba(129,140,248,0.22));border:1px solid rgba(56,189,248,0.45);color:#7dd3fc;font-size:10px;font-weight:900;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;letter-spacing:-0.03em;">' + esc(shortInfo.initials) + '</span>' +
                '<span style="font-size:11.5px;font-weight:800;color:#f8fafc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;">' + esc(shortInfo.shortStart) + '</span>' +
              '</div>'
            : '<div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">' +
                '<div class="ea-student-name-link" data-stid="' + esc(stId) + '" style="overflow:hidden;flex:1;" title="Bosish: O\'quvchining kunlik vazifalari va o\'sish/cho\'kish tahlilini ochish">' +
                  '<div style="font-size:13px;font-weight:800;color:#f8fafc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:6px;">' +
                    '<span>' + esc(stName) + '</span>' +
                  '</div>' +
                  (EA.viewMode === 'all'
                    ? '<div style="font-size:10.5px;font-weight:700;color:#38bdf8;margin-top:2px;">📅 Qo\'shilgan: ' + esc(joinedDisp) + '</div>'
                    : '<div style="font-size:10px;font-weight:600;color:#64748b;margin-top:1px;">📈 Statistika va tahlil &rarr;</div>') +
                '</div>' +
                (isTeacher ?
                  '<button type="button" class="ea-edit-student-btn" data-stid="' + esc(stId) + '" data-stname="' + esc(stName) + '" title="O\'quvchi ismini tahrirlash" style="border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:#cbd5e1;cursor:pointer;padding:4px 6px;font-size:11px;line-height:1;border-radius:6px;flex-shrink:0;transition:all 0.15s;">' +
                    '✏️' +
                  '</button>' : '') +
              '</div>') +
        '</td>';

        // Date Cells for this Student
        dates.forEach(function(dt) {
          var dKey = formatDateKey(dt);
          var isSunday = (dt.getDay() === 0);
          var isHoliday = isSunday || (cls.attendance.holidays && cls.attendance.holidays[dKey] === true);

          var rec = (cls.attendance.records[dKey] && cls.attendance.records[dKey][stId]) || {};
          var status = rec.status || '';
          var score = (rec.score !== undefined && rec.score !== null) ? String(rec.score) : '';

          // Shaffof Dark-Mode Box Styles for D
          var dBoxStyle = 'height:38px;width:60px;min-width:60px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;transition:all 0.18s;user-select:none;';
          var dText = '';

          if (isHoliday) {
            dBoxStyle += 'background:rgba(244,63,94,0.14);color:#fb7185;border:1px solid rgba(251,113,133,0.35);cursor:not-allowed;';
            dText = '🔒';
          } else if (status === 'K' || status === 'present') {
            dBoxStyle += 'background:rgba(16,185,129,0.2);color:#34d399;border:1px solid rgba(52,211,153,0.55);cursor:' + (isTeacher ? 'pointer' : 'default') + ';box-shadow:0 0 14px rgba(16,185,129,0.22),inset 0 1px 0 rgba(255,255,255,0.15);text-shadow:0 0 8px rgba(52,211,153,0.4);';
            dText = 'K';
          } else if (status === 'Q' || status === 'absent') {
            dBoxStyle += 'background:rgba(244,63,94,0.22);color:#fb7185;border:1px solid rgba(251,113,133,0.55);cursor:' + (isTeacher ? 'pointer' : 'default') + ';box-shadow:0 0 14px rgba(244,63,94,0.25),inset 0 1px 0 rgba(255,255,255,0.15);text-shadow:0 0 8px rgba(251,113,133,0.4);';
            dText = 'K';
          } else if (status === 'S' || status === 'excused') {
            dBoxStyle += 'background:rgba(245,158,11,0.22);color:#fbbf24;border:1px solid rgba(251,191,36,0.55);cursor:' + (isTeacher ? 'pointer' : 'default') + ';box-shadow:0 0 14px rgba(245,158,11,0.22),inset 0 1px 0 rgba(255,255,255,0.15);text-shadow:0 0 8px rgba(251,191,36,0.4);';
            dText = 'S';
          } else {
            dBoxStyle += 'background:rgba(15,23,42,0.55);color:#94a3b8;border:1px solid rgba(255,255,255,0.1);cursor:' + (isTeacher ? 'pointer' : 'default') + ';';
            dText = '';
          }

          // Automatic Daily Grade Box Styles for B (Baho / Score automatically set by system)
          var hasScore = score.trim() !== '';
          var scoreNum = parseInt(score, 10);
          var scoreColor = '#f8fafc';
          var scoreBg = 'rgba(15,23,42,0.55)';
          var scoreBorder = 'rgba(255,255,255,0.1)';

          if (isHoliday) {
            scoreBg = 'rgba(244,63,94,0.14)';
            scoreBorder = 'rgba(251,113,133,0.35)';
            scoreColor = '#fb7185';
          } else if (hasScore) {
            if (scoreNum >= 5) {
              scoreBg = 'rgba(56,189,248,0.18)';
              scoreBorder = 'rgba(56,189,248,0.55)';
              scoreColor = '#38bdf8';
            } else if (scoreNum === 4) {
              scoreBg = 'rgba(16,185,129,0.16)';
              scoreBorder = 'rgba(52,211,153,0.45)';
              scoreColor = '#34d399';
            } else if (scoreNum === 3) {
              scoreBg = 'rgba(245,158,11,0.18)';
              scoreBorder = 'rgba(251,191,36,0.45)';
              scoreColor = '#fbbf24';
            } else {
              scoreBg = 'rgba(244,63,94,0.18)';
              scoreBorder = 'rgba(251,113,133,0.45)';
              scoreColor = '#fb7185';
            }
          }

          var bTitle = isHoliday
            ? 'Dam olish kuni'
            : (rec.hwDone
              ? ('Avtomatik Baho: ' + score + ' (Uy vazifasi ' + (rec.hwLesson || '') + ' — ' + (rec.hwPct || 95) + '% bajarildi ✓)')
              : (score === '2' ? 'Avtomatik Baho: 2 (Uy vazifasi bajarilmagan / Dars qoldirilgan)' : 'Avtomatik baho: O\'quvchi uy vazifasini bajarganda tizim o\'zi qo\'yadi'));

          var bBoxStyle = 'height:38px;width:60px;min-width:60px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13.5px;border:1px solid ' + scoreBorder + ';background:' + scoreBg + ';color:' + scoreColor + ';user-select:none;';

          h += '<td style="width:136px;min-width:136px;padding:6px;border-bottom:1px solid rgba(255,255,255,0.06);border-right:1px solid rgba(255,255,255,0.06);">' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;align-items:center;">' +
              '<div class="ea-status-box' + (isTeacher && !isHoliday ? ' is-clickable' : '') + '" ' +
                'data-date="' + dKey + '" data-stid="' + esc(stId) + '" data-cur="' + status + '" ' +
                'style="' + dBoxStyle + '" ' +
                'title="' + (isHoliday ? 'Dam olish kuni' : (isTeacher ? 'Bosish: Yashil K (Kelgan) -> Qizil K (Kelmagan) -> Sariq S (Sababli) -> Bo\'sh' : 'Davomat holati')) + '">' +
                dText +
              '</div>' +
              '<div style="' + bBoxStyle + '" title="' + esc(bTitle) + '">' +
                (isHoliday ? '🔒' : esc(score)) +
              '</div>' +
            '</div>' +
          '</td>';
        });

        h += '</tr>';
      });
    }

    h += '</tbody></table></div>';

    // 5. BOTTOM "UMUMIY DAVOMAT" BUTTON & LEGEND
    h += '<div class="qe-glass-panel" style="margin-top:18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;border-radius:18px;padding:14px 18px;">' +
      '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">' +
        '<button type="button" id="eaBottomToggleAllBtn" style="background:' + (EA.viewMode === 'all' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'linear-gradient(135deg,#0284c7,#2563eb)') + ';color:#ffffff;border:1px solid rgba(255,255,255,0.25);border-radius:12px;padding:10px 20px;font-size:13.5px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:8px;box-shadow:0 0 24px -4px rgba(56,189,248,0.45);">' +
          (EA.viewMode === 'all' ? '🔙 10 Kunlik + Kelasi 2 Kunlik rejimga qaytish' : '📋 Umumiy davomat (Barcha sanalar va qo\'shilgan vaqtlar)') +
        '</button>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;font-size:12.5px;color:#cbd5e1;">' +
        '<div style="display:inline-flex;align-items:center;gap:6px;"><span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:7px;background:rgba(16,185,129,0.2);border:1px solid rgba(52,211,153,0.55);color:#34d399;font-weight:900;font-size:11.5px;">K</span> <b>Kelgan</b></div>' +
        '<div style="display:inline-flex;align-items:center;gap:6px;"><span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:7px;background:rgba(244,63,94,0.22);border:1px solid rgba(251,113,133,0.55);color:#fb7185;font-weight:900;font-size:11.5px;">K</span> <b>Kelmagan</b></div>' +
        '<div style="display:inline-flex;align-items:center;gap:6px;"><span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:7px;background:rgba(245,158,11,0.22);border:1px solid rgba(251,191,36,0.55);color:#fbbf24;font-weight:900;font-size:11.5px;">S</span> <b>Sababli</b></div>' +
        '<div style="display:inline-flex;align-items:center;gap:6px;"><span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:7px;background:rgba(56,189,248,0.18);border:1px solid rgba(56,189,248,0.55);color:#38bdf8;font-weight:900;font-size:11.5px;">5</span> <b>Avtomatik Baho (Vazifadan)</b></div>' +
      '</div>' +
    '</div>';

    h += '</div></div>';

    container.innerHTML = h;

    var scrollWrap = container.querySelector('.ea-table-scroll-wrap');
    if (scrollWrap) {
      if (typeof preserveScrollLeft === 'number') {
        scrollWrap.scrollLeft = preserveScrollLeft;
      } else {
        scrollWrap.scrollLeft = scrollWrap.scrollWidth;
      }
    }

    EA.attachEvents(container, cls);
  };

  // ============================================================================
  // EVENT HANDLING FOR JOURNAL
  // ============================================================================
  EA.attachEvents = function(container, cls) {
    var isTeacher = isTeacherRole();
    var scrollWrap = container.querySelector('.ea-table-scroll-wrap');

    // Switch class via class cards
    container.querySelectorAll('.ea-class-card-tab').forEach(function(tab) {
      tab.onclick = function() {
        EA.activeClassId = tab.dataset.clsid;
        EA.activeStudentId = null;
        EA.render(container);
      };
    });

    // Go to Classes & Chats
    var goClsBtn = container.querySelector('#eaGoClassesBtn');
    if (goClsBtn) {
      goClsBtn.onclick = function() {
        if (window.S) window.S.activeClassId = cls.id;
        if (typeof window.go === 'function') window.go('classes');
      };
    }

    // Open active homework lesson directly
    var openActiveHwBtn = container.querySelector('#eaOpenActiveHwBtn');
    if (openActiveHwBtn && cls.activeHomework) {
      openActiveHwBtn.onclick = function() {
        var hw = cls.activeHomework;
        window._ethithActiveHwContext = {
          classId: cls.id,
          classCode: cls.code,
          dateKey: hw.dateKey,
          bookLevel: hw.bookLevel || 'B1+',
          unit: hw.unit,
          lessonCode: hw.lessonCode
        };
        var firstPg = (hw.pages && hw.pages[0]) || (hw.bookLevel === 'B2' ? 2004 : 4);
        if (hw.bookLevel === 'B2' || firstPg > 2000) {
          if (window.ETHITH_WORKBOOK_B1 && typeof window.ETHITH_WORKBOOK_B1.openLessonB2 === 'function') {
            window.ETHITH_WORKBOOK_B1.openLessonB2(hw.unit, hw.lessonCode, firstPg);
          } else if (typeof window.go === 'function') {
            window.go('upper_intermediate', { unit: hw.unit, lesson: hw.lessonCode });
          }
        } else {
          if (window.ETHITH_WORKBOOK_B1 && typeof window.ETHITH_WORKBOOK_B1.openLesson === 'function') {
            window.ETHITH_WORKBOOK_B1.openLesson(hw.unit, hw.lessonCode, firstPg);
          } else if (typeof window.go === 'function') {
            window.go('intermediate', { unit: hw.unit, lesson: hw.lessonCode });
          }
        }
      };
    }

    // Bottom "Umumiy davomat" toggle button
    var bottomAllBtn = container.querySelector('#eaBottomToggleAllBtn');
    if (bottomAllBtn) {
      bottomAllBtn.onclick = function() {
        EA.viewMode = (EA.viewMode === 'all' ? 'window' : 'all');
        EA.render(container, 0);
      };
    }

    // Top "Tahrirlash" (Schedule & Settings) Modal
    var schedBtn = container.querySelector('#eaScheduleBtn');
    if (schedBtn && isTeacher) {
      schedBtn.onclick = function(e) {
        e.stopPropagation();
        EA.openScheduleModal(container, cls);
      };
    }

    // Top "📚 Uy vazifasi belgilash" Modal
    var assignHwBtn = container.querySelector('#eaAssignHomeworkBtn');
    if (assignHwBtn && isTeacher) {
      assignHwBtn.onclick = function(e) {
        e.stopPropagation();
        EA.openHomeworkAssignModal(container, cls);
      };
    }

    // Date Options (⋮ button) Modal
    container.querySelectorAll('.ea-date-opts-btn').forEach(function(btn) {
      btn.onclick = function(e) {
        e.stopPropagation();
        var dKey = btn.dataset.date;
        var dDisp = btn.dataset.disp;
        EA.openDateOptsModal(container, cls, dKey, dDisp);
      };
    });

    // Direct 1-click on Date Header Card to toggle red "Dam olish kuni"
    if (isTeacher) {
      container.querySelectorAll('.ea-date-header-card').forEach(function(card) {
        card.onclick = function(e) {
          if (e.target.closest('.ea-date-opts-btn')) return;
          if (card.dataset.sunday === '1') return;
          var dKey = card.dataset.date;
          var isHol = cls.attendance.holidays && cls.attendance.holidays[dKey] === true;
          if (isHol) {
            delete cls.attendance.holidays[dKey];
            cls.attendance.lessonTypes[dKey] = 'Oddiy';
          } else {
            cls.attendance.holidays[dKey] = true;
            cls.attendance.lessonTypes[dKey] = 'Dam olish';
          }
          persistAttendance(cls);
          EA.render(container, scrollWrap ? scrollWrap.scrollLeft : 0);
        };
      });
    }

    // Davomat Box (D) Click - Cycle through Yashil K -> Qizil K -> Sariq S -> Empty
    if (isTeacher) {
      container.querySelectorAll('.ea-status-box.is-clickable').forEach(function(box) {
        box.onclick = function() {
          var dKey = box.dataset.date;
          var stId = box.dataset.stid;
          var cur = box.dataset.cur;

          var next = '';
          if (!cur || cur === '') next = 'K';
          else if (cur === 'K' || cur === 'present') next = 'Q';
          else if (cur === 'Q' || cur === 'absent') next = 'S';
          else next = '';

          if (!cls.attendance.records[dKey]) cls.attendance.records[dKey] = {};
          if (!cls.attendance.records[dKey][stId]) cls.attendance.records[dKey][stId] = {};
          cls.attendance.records[dKey][stId].status = next;

          // If marked absent ('Q') and student hasn't completed homework, set automatic 2
          if (next === 'Q' && !cls.attendance.records[dKey][stId].hwDone) {
            cls.attendance.records[dKey][stId].score = '2';
          } else if (next === 'S' && !cls.attendance.records[dKey][stId].hwDone) {
            cls.attendance.records[dKey][stId].score = '';
          }

          persistAttendance(cls);
          EA.render(container, scrollWrap ? scrollWrap.scrollLeft : 0);
        };
      });
    }

    // Toggle Student Names Column Collapse / Expand (Left shrink/expand)
    var toggleNamesHeaderBox = container.querySelector('#eaToggleNamesHeaderBox');
    if (toggleNamesHeaderBox) {
      toggleNamesHeaderBox.onclick = function(e) {
        e.stopPropagation();
        EA.isNamesCollapsed = !EA.isNamesCollapsed;
        EA.render(container, scrollWrap ? scrollWrap.scrollLeft : 0);
      };
    }

    // Click on Student Name -> Open QuantumEdu Student Analytics!
    container.querySelectorAll('.ea-student-name-link').forEach(function(link) {
      link.onclick = function(e) {
        e.stopPropagation();
        EA.activeStudentId = link.dataset.stid;
        EA.render(container);
      };
    });

    // Edit Student Name (Teacher only)
    if (isTeacher) {
      container.querySelectorAll('.ea-edit-student-btn').forEach(function(btn) {
        btn.onclick = function(e) {
          e.stopPropagation();
          var stId = btn.dataset.stid;
          var curName = btn.dataset.stname;
          EA.openEditStudentModal(container, cls, stId, curName);
        };
      });
    }

    // Excel Export ("Yuklab olish")
    var exportBtn = container.querySelector('#eaExportExcelBtn');
    if (exportBtn) {
      exportBtn.onclick = function() {
        EA.exportToExcel(cls);
      };
    }
  };

  // ============================================================================
  // MODAL: ASSIGN HOMEWORK ("📚 Uy vazifasi belgilash")
  // ============================================================================
  EA.openHomeworkAssignModal = function(container, cls, defaultDateKey, onDoneCallback) {
    EA.isModalOpen = true;
    var modalRoot = getGlobalModalRoot();
    ensureClassAttendance(cls);

    var dates = getJournalDates(cls, 'window').filter(function(d) { return d.getDay() !== 0; });
    var todayKey = formatDateKey(new Date());
    var selectedDateKey = defaultDateKey || (cls.activeHomework && cls.activeHomework.dateKey) || todayKey;

    var curHw = (cls.attendance.homeworks && cls.attendance.homeworks[selectedDateKey]) || cls.activeHomework || { bookLevel: 'B1+', unit: 1, lessonCode: '1.1', note: '' };
    var selBookLevel = curHw.bookLevel || 'B1+';
    var units = getWorkbookUnitsList(selBookLevel);
    var selUnitNum = parseInt(curHw.unit, 10) || 1;
    var selLessonCode = curHw.lessonCode || '1.1';

    var dateOptsHtml = '';
    dates.forEach(function(dt) {
      var dk = formatDateKey(dt);
      var dd = formatDisplayDate(dt);
      dateOptsHtml += '<option value="' + dk + '" data-disp="' + dd + '" ' + (dk === selectedDateKey ? 'selected' : '') + '>' + dd + (dk === todayKey ? ' (Bugun)' : '') + '</option>';
    });

    function buildUnitOptions(bLevel, activeUnitNum) {
      var uList = getWorkbookUnitsList(bLevel);
      var html = '';
      uList.forEach(function(u) {
        html += '<option value="' + u.unit + '" ' + (u.unit === activeUnitNum ? 'selected' : '') + '>' + esc(u.title) + '</option>';
      });
      return html;
    }

    function buildLessonOptions(bLevel, uNum, activeCode) {
      var uList = getWorkbookUnitsList(bLevel);
      var uObj = uList.find(function(x) { return x.unit === parseInt(uNum, 10); }) || uList[0];
      var html = '';
      (uObj.lessons || []).forEach(function(les) {
        var dispPgs = (les.pages || []).map(function(p) { return p > 2000 ? (p - 2000) : p; });
        var pgStr = dispPgs.length ? ' (Workbook ' + dispPgs.join('–') + '-betlar)' : '';
        html += '<option value="' + esc(les.code) + '" ' + (les.code === activeCode ? 'selected' : '') + '>' + esc(les.title) + pgStr + '</option>';
      });
      return html;
    }

    var mHtml = '<div id="eaHwOverlayBg" style="position:fixed;inset:0;background:rgba(2,6,23,0.76);backdrop-filter:blur(10px);z-index:2147483640;display:flex;align-items:center;justify-content:center;padding:16px;">' +
      '<div style="background:rgba(15,23,42,0.95);backdrop-filter:blur(24px);border:1.5px solid rgba(139,92,246,0.5);border-radius:24px;max-width:520px;width:100%;padding:26px;box-shadow:0 25px 70px rgba(0,0,0,0.8),0 0 35px rgba(139,92,246,0.22);color:#f8fafc;font-family:inherit;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">' +
          '<h3 style="margin:0;font-size:19px;font-weight:900;color:#ffffff;display:flex;align-items:center;gap:8px;">📚 Uy Vazifasi Belgilash (' + esc(cls.name) + ')</h3>' +
          '<button type="button" id="eaCloseHwModal" style="border:none;background:rgba(255,255,255,0.08);width:32px;height:32px;border-radius:10px;font-size:16px;cursor:pointer;color:#cbd5e1;">✕</button>' +
        '</div>' +
        '<p style="font-size:12.5px;color:#94a3b8;margin:0 0 18px;line-height:1.5;">' +
          'Intermediate (B1+) yoki Upper-Intermediate (B2) darsligidan topshiriq tanlang. Vazifa shu zahoti guruh chatining tepasida chiqadi va o\'quvchi uni bajarganda tizim avtomatik ravishda tekshirib, kunlik bahosini (<b>5, 4, 3, 2</b>) Davomat jurnaliga qo\'yadi!' +
        '</p>' +
        '<div style="display:flex;flex-direction:column;gap:13px;margin-bottom:22px;">' +
          '<div>' +
            '<label style="display:block;font-size:12px;font-weight:800;color:#cbd5e1;margin-bottom:6px;">📅 Qaysi sanaga belgilansin:</label>' +
            '<select id="eaHwDateSelect" style="width:100%;padding:10px 14px;border-radius:12px;border:1px solid rgba(255,255,255,0.16);background:rgba(8,13,26,0.9);color:#fff;font-weight:800;font-size:13.5px;outline:none;">' +
              dateOptsHtml +
            '</select>' +
          '</div>' +
          '<div>' +
            '<label style="display:block;font-size:12px;font-weight:800;color:#cbd5e1;margin-bottom:6px;">📖 Kitob darajasi (Workbook):</label>' +
            '<select id="eaHwBookLevelSelect" style="width:100%;padding:10px 14px;border-radius:12px;border:1px solid rgba(168,85,247,0.5);background:rgba(8,13,26,0.9);color:#c084fc;font-weight:800;font-size:13.5px;outline:none;">' +
              '<option value="B1+" ' + (selBookLevel === 'B1+' ? 'selected' : '') + '>📘 Intermediate (B1+) Workbook</option>' +
              '<option value="B2" ' + (selBookLevel === 'B2' ? 'selected' : '') + '>📕 Upper-Intermediate (B2) Workbook</option>' +
            '</select>' +
          '</div>' +
          '<div>' +
            '<label style="display:block;font-size:12px;font-weight:800;color:#cbd5e1;margin-bottom:6px;">📘 Bo\'lim (Unit 1–12):</label>' +
            '<select id="eaHwUnitSelect" style="width:100%;padding:10px 14px;border-radius:12px;border:1px solid rgba(56,189,248,0.45);background:rgba(8,13,26,0.9);color:#38bdf8;font-weight:800;font-size:13.5px;outline:none;">' +
              buildUnitOptions(selBookLevel, selUnitNum) +
            '</select>' +
          '</div>' +
          '<div>' +
            '<label style="display:block;font-size:12px;font-weight:800;color:#cbd5e1;margin-bottom:6px;">📝 Topshiriq / Workbook Darsi:</label>' +
            '<select id="eaHwLessonSelect" style="width:100%;padding:10px 14px;border-radius:12px;border:1px solid rgba(16,185,129,0.45);background:rgba(8,13,26,0.9);color:#34d399;font-weight:800;font-size:13.5px;outline:none;">' +
              buildLessonOptions(selBookLevel, selUnitNum, selLessonCode) +
            '</select>' +
          '</div>' +
          '<div>' +
            '<label style="display:block;font-size:12px;font-weight:800;color:#cbd5e1;margin-bottom:6px;">💬 O\'quvchilarga izoh (ixtiyoriy):</label>' +
            '<input type="text" id="eaHwNoteInput" value="' + esc(curHw.note || "Workbook mashqlarini bajarib Tekshirish tugmasini bosing — baho avtomatik qo'yiladi.") + '" style="width:100%;padding:10px 14px;border-radius:12px;border:1px solid rgba(255,255,255,0.16);background:rgba(8,13,26,0.9);color:#fff;font-size:13px;box-sizing:border-box;outline:none;" />' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
          '<button type="button" id="eaCancelHwBtn" style="background:rgba(255,255,255,0.07);color:#cbd5e1;border:1px solid rgba(255,255,255,0.14);border-radius:12px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;">Bekor qilish</button>' +
          '<button type="button" id="eaSaveHwBtn" style="background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;border:none;border-radius:12px;padding:10px 22px;font-size:13.5px;font-weight:800;cursor:pointer;box-shadow:0 4px 16px rgba(139,92,246,0.45);">✅ Vazifani Belgilash va Yuborish</button>' +
        '</div>' +
      '</div></div>';

    modalRoot.innerHTML = mHtml;

    var bookLvlSel = modalRoot.querySelector('#eaHwBookLevelSelect');
    var unitSel = modalRoot.querySelector('#eaHwUnitSelect');
    var lesSel = modalRoot.querySelector('#eaHwLessonSelect');

    bookLvlSel.onchange = function() {
      var bLvl = bookLvlSel.value;
      var uNum = parseInt(unitSel.value, 10) || 1;
      unitSel.innerHTML = buildUnitOptions(bLvl, uNum);
      lesSel.innerHTML = buildLessonOptions(bLvl, uNum, uNum + '.1');
    };
    unitSel.onchange = function() {
      var bLvl = bookLvlSel.value;
      var uNum = parseInt(unitSel.value, 10);
      lesSel.innerHTML = buildLessonOptions(bLvl, uNum, uNum + '.1');
    };

    modalRoot.querySelector('#eaCloseHwModal').onclick = closeGlobalModal;
    modalRoot.querySelector('#eaCancelHwBtn').onclick = closeGlobalModal;
    modalRoot.querySelector('#eaHwOverlayBg').onclick = function(e) {
      if (e.target.id === 'eaHwOverlayBg') closeGlobalModal();
    };

    modalRoot.querySelector('#eaSaveHwBtn').onclick = function() {
      var dateSel = modalRoot.querySelector('#eaHwDateSelect');
      var dKey = dateSel.value;
      var dDisp = (dateSel.options[dateSel.selectedIndex] && dateSel.options[dateSel.selectedIndex].dataset.disp) || dKey;
      var bLvl = bookLvlSel.value || 'B1+';
      var uNum = parseInt(unitSel.value, 10) || 1;
      var lCode = lesSel.value || (uNum + '.1');
      var noteVal = modalRoot.querySelector('#eaHwNoteInput').value.trim();

      var uList = getWorkbookUnitsList(bLvl);
      var uObj = uList.find(function(x) { return x.unit === uNum; }) || uList[0];
      var lObj = (uObj.lessons || []).find(function(l) { return l.code === lCode; }) || { code: lCode, title: lCode, pages: [bLvl === 'B2' ? 2004 : 4] };

      var hwObj = {
        dateKey: dKey,
        dateDisp: dDisp,
        bookLevel: bLvl,
        unit: uNum,
        lessonCode: lCode,
        lessonTitle: lObj.title,
        pages: lObj.pages || [],
        note: noteVal,
        assignedAt: Date.now(),
        teacherName: cls.teacherName || 'Ustoz'
      };

      if (!cls.attendance.homeworks) cls.attendance.homeworks = {};
      cls.attendance.homeworks[dKey] = hwObj;
      cls.activeHomework = hwObj;
      cls.attendance.lessonTypes[dKey] = 'Vazifa (' + bLvl + '): ' + lCode;
      delete cls.attendance.holidays[dKey];

      persistAttendance(cls);
      closeGlobalModal();

      if (typeof onDoneCallback === 'function') {
        onDoneCallback(hwObj);
      } else {
        EA.render(container);
      }
    };
  };

  // ============================================================================
  // PERSISTENT DARK-GLASS MODALS (NO BSB / CHSB)
  // ============================================================================
  EA.openScheduleModal = function(container, cls) {
    EA.isModalOpen = true;
    var modalRoot = getGlobalModalRoot();
    var cur = cls.schedule || 'har_kuni';

    var mHtml = '<div id="eaSchedOverlayBg" style="position:fixed;inset:0;background:rgba(2,6,23,0.72);backdrop-filter:blur(10px);z-index:2147483640;display:flex;align-items:center;justify-content:center;padding:16px;">' +
      '<div style="background:rgba(15,23,42,0.92);backdrop-filter:blur(24px);border:1px solid rgba(56,189,248,0.35);border-radius:24px;max-width:460px;width:100%;padding:26px;box-shadow:0 25px 70px rgba(0,0,0,0.75),0 0 30px rgba(56,189,248,0.18);color:#f8fafc;font-family:inherit;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">' +
          '<h3 style="margin:0;font-size:18px;font-weight:900;color:#ffffff;">✏️ Dars Jadvali Tahrirlash</h3>' +
          '<button type="button" id="eaCloseSchedModal" style="border:none;background:rgba(255,255,255,0.08);width:32px;height:32px;border-radius:10px;font-size:16px;cursor:pointer;color:#cbd5e1;">✕</button>' +
        '</div>' +
        '<p style="font-size:13px;color:#94a3b8;margin:0 0 18px;line-height:1.55;">' +
          'Guruhingiz dars o\'tadigan kunlarni tanlang. Yakshanba kuni har doim avtomatik qizil dam olish kuni bo\'lib turadi.' +
        '</p>' +
        '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:22px;">' +
          '<label style="display:flex;align-items:center;gap:12px;padding:13px 14px;border:1.5px solid ' + (cur === 'har_kuni' ? '#38bdf8' : 'rgba(255,255,255,0.12)') + ';border-radius:14px;cursor:pointer;background:' + (cur === 'har_kuni' ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.03)') + ';color:#f8fafc;">' +
            '<input type="radio" name="eaSchedChoice" value="har_kuni" ' + (cur === 'har_kuni' ? 'checked' : '') + ' style="accent-color:#38bdf8;width:16px;height:16px;" />' +
            '<div><b style="color:#ffffff;">Har kungi dars</b> <span style="color:#94a3b8;font-size:12.5px;">(Dushanba – Shanba)</span></div>' +
          '</label>' +
          '<label style="display:flex;align-items:center;gap:12px;padding:13px 14px;border:1.5px solid ' + (cur === 'juft' ? '#38bdf8' : 'rgba(255,255,255,0.12)') + ';border-radius:14px;cursor:pointer;background:' + (cur === 'juft' ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.03)') + ';color:#f8fafc;">' +
            '<input type="radio" name="eaSchedChoice" value="juft" ' + (cur === 'juft' ? 'checked' : '') + ' style="accent-color:#38bdf8;width:16px;height:16px;" />' +
            '<div><b style="color:#ffffff;">Juft kunlari</b> <span style="color:#94a3b8;font-size:12.5px;">(Seshanba, Payshanba, Shanba)</span></div>' +
          '</label>' +
          '<label style="display:flex;align-items:center;gap:12px;padding:13px 14px;border:1.5px solid ' + (cur === 'toq' ? '#38bdf8' : 'rgba(255,255,255,0.12)') + ';border-radius:14px;cursor:pointer;background:' + (cur === 'toq' ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.03)') + ';color:#f8fafc;">' +
            '<input type="radio" name="eaSchedChoice" value="toq" ' + (cur === 'toq' ? 'checked' : '') + ' style="accent-color:#38bdf8;width:16px;height:16px;" />' +
            '<div><b style="color:#ffffff;">Toq kunlari</b> <span style="color:#94a3b8;font-size:12.5px;">(Dushanba, Chorshanba, Juma)</span></div>' +
          '</label>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
          '<button type="button" id="eaCancelSchedBtn" style="background:rgba(255,255,255,0.07);color:#cbd5e1;border:1px solid rgba(255,255,255,0.14);border-radius:12px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;">Bekor qilish</button>' +
          '<button type="button" id="eaSaveSchedBtn" style="background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:12px;padding:10px 24px;font-size:13.5px;font-weight:800;cursor:pointer;box-shadow:0 4px 16px rgba(2,132,199,0.4);">Saqlash</button>' +
        '</div>' +
      '</div></div>';

    modalRoot.innerHTML = mHtml;

    modalRoot.querySelector('#eaCloseSchedModal').onclick = closeGlobalModal;
    modalRoot.querySelector('#eaCancelSchedBtn').onclick = closeGlobalModal;
    modalRoot.querySelector('#eaSchedOverlayBg').onclick = function(e) {
      if (e.target.id === 'eaSchedOverlayBg') closeGlobalModal();
    };

    modalRoot.querySelector('#eaSaveSchedBtn').onclick = function() {
      var selected = modalRoot.querySelector('input[name="eaSchedChoice"]:checked');
      if (selected) {
        cls.schedule = selected.value;
        persistAttendance(cls);
        closeGlobalModal();
        EA.render(container);
      }
    };
  };

  // Date Options Modal (ONLY Oddiy dars, Dam olish kuni, or Uy vazifasi belgilash — NO BSB/CHSB!)
  EA.openDateOptsModal = function(container, cls, dKey, dDisp) {
    EA.isModalOpen = true;
    var modalRoot = getGlobalModalRoot();

    var isHol = cls.attendance.holidays && cls.attendance.holidays[dKey] === true;

    var mHtml = '<div id="eaDateOverlayBg" style="position:fixed;inset:0;background:rgba(2,6,23,0.72);backdrop-filter:blur(10px);z-index:2147483640;display:flex;align-items:center;justify-content:center;padding:16px;">' +
      '<div style="background:rgba(15,23,42,0.92);backdrop-filter:blur(24px);border:1px solid rgba(56,189,248,0.35);border-radius:24px;max-width:420px;width:100%;padding:26px;box-shadow:0 25px 70px rgba(0,0,0,0.75);color:#f8fafc;font-family:inherit;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">' +
          '<h3 style="margin:0;font-size:17px;font-weight:900;color:#ffffff;">📅 Sana Sozlamasi: ' + esc(dDisp) + '</h3>' +
          '<button type="button" id="eaCloseDateModal" style="border:none;background:rgba(255,255,255,0.08);width:32px;height:32px;border-radius:10px;font-size:16px;cursor:pointer;color:#cbd5e1;">✕</button>' +
        '</div>' +
        '<div style="margin-bottom:18px;">' +
          '<label style="display:block;font-size:12.5px;font-weight:800;color:#94a3b8;margin-bottom:8px;">Kun holati:</label>' +
          '<select id="eaDateTypeSelect" style="width:100%;padding:11px 14px;border-radius:12px;border:1px solid rgba(56,189,248,0.4);background:rgba(8,13,26,0.9);font-weight:800;font-size:13.5px;box-sizing:border-box;color:#ffffff;outline:none;">' +
            '<option value="Oddiy" ' + (!isHol ? 'selected' : '') + '>Oddiy o\'quv kuni</option>' +
            '<option value="Dam olish" ' + (isHol ? 'selected' : '') + '>Dam olish kuni (Qizil / Qulf 🔒)</option>' +
          '</select>' +
        '</div>' +
        '<div style="margin-bottom:20px;">' +
          '<button type="button" id="eaDateOpenHwModalBtn" style="width:100%;padding:11px 14px;border-radius:12px;border:1px solid rgba(139,92,246,0.5);background:linear-gradient(135deg,rgba(139,92,246,0.25),rgba(99,102,241,0.25));color:#d8b4fe;font-weight:800;font-size:13px;cursor:pointer;">📚 Shu kunga Intermediate (B1+) Uy Vazifasi Belgilash &rarr;</button>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
          '<button type="button" id="eaCancelDateBtn" style="background:rgba(255,255,255,0.07);color:#cbd5e1;border:1px solid rgba(255,255,255,0.14);border-radius:12px;padding:9px 16px;font-size:13px;font-weight:700;cursor:pointer;">Bekor qilish</button>' +
          '<button type="button" id="eaSaveDateBtn" style="background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:12px;padding:9px 22px;font-size:13px;font-weight:800;cursor:pointer;">Tasdiqlash</button>' +
        '</div>' +
      '</div></div>';

    modalRoot.innerHTML = mHtml;

    modalRoot.querySelector('#eaCloseDateModal').onclick = closeGlobalModal;
    modalRoot.querySelector('#eaCancelDateBtn').onclick = closeGlobalModal;
    modalRoot.querySelector('#eaDateOverlayBg').onclick = function(e) {
      if (e.target.id === 'eaDateOverlayBg') closeGlobalModal();
    };

    modalRoot.querySelector('#eaDateOpenHwModalBtn').onclick = function() {
      EA.openHomeworkAssignModal(container, cls, dKey);
    };

    modalRoot.querySelector('#eaSaveDateBtn').onclick = function() {
      var val = modalRoot.querySelector('#eaDateTypeSelect').value;
      cls.attendance.lessonTypes[dKey] = val;
      if (val === 'Dam olish') {
        cls.attendance.holidays[dKey] = true;
      } else {
        delete cls.attendance.holidays[dKey];
      }
      persistAttendance(cls);
      closeGlobalModal();
      EA.render(container);
    };
  };

  EA.openEditStudentModal = function(container, cls, stId, curName) {
    EA.isModalOpen = true;
    var modalRoot = getGlobalModalRoot();

    var mHtml = '<div id="eaEditStOverlayBg" style="position:fixed;inset:0;background:rgba(2,6,23,0.72);backdrop-filter:blur(10px);z-index:2147483640;display:flex;align-items:center;justify-content:center;padding:16px;">' +
      '<div style="background:rgba(15,23,42,0.92);backdrop-filter:blur(24px);border:1px solid rgba(56,189,248,0.35);border-radius:24px;max-width:430px;width:100%;padding:26px;box-shadow:0 25px 70px rgba(0,0,0,0.75),0 0 30px rgba(56,189,248,0.18);color:#f8fafc;font-family:inherit;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">' +
          '<h3 style="margin:0;font-size:17px;font-weight:900;color:#ffffff;">✏️ O\'quvchi Ismini Tahrirlash</h3>' +
          '<button type="button" id="eaCloseEditStModal" style="border:none;background:rgba(255,255,255,0.08);width:32px;height:32px;border-radius:10px;font-size:16px;cursor:pointer;color:#cbd5e1;">✕</button>' +
        '</div>' +
        '<div style="margin-bottom:20px;">' +
          '<label style="display:block;font-size:12.5px;font-weight:800;color:#94a3b8;margin-bottom:8px;">F.I.SH (Familiya va Ism):</label>' +
          '<input type="text" id="eaNewStName" value="' + esc(curName) + '" style="width:100%;padding:11px 14px;border-radius:12px;border:1.5px solid rgba(56,189,248,0.5);background:rgba(8,13,26,0.85);font-weight:800;font-size:14px;box-sizing:border-box;color:#ffffff;outline:none;" />' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
          '<button type="button" id="eaCancelEditStBtn" style="background:rgba(255,255,255,0.07);color:#cbd5e1;border:1px solid rgba(255,255,255,0.14);border-radius:12px;padding:9px 16px;font-size:13px;font-weight:700;cursor:pointer;">Bekor qilish</button>' +
          '<button type="button" id="eaSaveStNameBtn" style="background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:12px;padding:9px 22px;font-size:13.5px;font-weight:800;cursor:pointer;box-shadow:0 4px 16px rgba(2,132,199,0.4);">Saqlash</button>' +
        '</div>' +
      '</div></div>';

    modalRoot.innerHTML = mHtml;

    var inp = modalRoot.querySelector('#eaNewStName');
    if (inp) {
      setTimeout(function() { inp.focus(); inp.select(); }, 30);
      inp.onkeydown = function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          modalRoot.querySelector('#eaSaveStNameBtn').click();
        } else if (e.key === 'Escape') {
          closeGlobalModal();
        }
      };
    }

    modalRoot.querySelector('#eaCloseEditStModal').onclick = closeGlobalModal;
    modalRoot.querySelector('#eaCancelEditStBtn').onclick = closeGlobalModal;
    modalRoot.querySelector('#eaEditStOverlayBg').onclick = function(e) {
      if (e.target.id === 'eaEditStOverlayBg') closeGlobalModal();
    };

    modalRoot.querySelector('#eaSaveStNameBtn').onclick = function() {
      var n = modalRoot.querySelector('#eaNewStName').value.trim();
      if (n) {
        cls.customStudentNames[stId] = n;
        persistAttendance(cls);
        closeGlobalModal();
        EA.render(container);
      }
    };
  };

  // ============================================================================
  // QUANTUM-EDU STUDENT DAILY TASKS & GROWTH/DECLINE ANALYTICS VIEW
  // ============================================================================
  function buildStudentAnalyticsProfile(cls, st, sIdx) {
    var stId = st.id || st.email || ('std_' + sIdx);
    var stName = cls.customStudentNames[stId] || st.name || ("O'quvchi " + (sIdx + 1));
    var words = stName.trim().split(/\s+/);
    var initials = ((words[0] ? words[0][0] : 'O') + (words[1] ? words[1][0] : '')).toUpperCase();

    var allDates = getJournalDates(cls, 'all');
    var todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);

    var presentCount = 0;
    var absentCount = 0;
    var excusedCount = 0;
    var totalPastLessons = 0;
    var dailyScores = [];
    var dailyLabels = [];
    var dailyNotes = [];

    allDates.forEach(function(dt) {
      if (dt > todayObj) return;
      if (dt.getDay() === 0) return;
      var dKey = formatDateKey(dt);
      if (cls.attendance.holidays && cls.attendance.holidays[dKey]) return;

      var rec = (cls.attendance.records[dKey] && cls.attendance.records[dKey][stId]) || {};
      var stStatus = rec.status || '';
      var rawScore = parseFloat(rec.score);

      if (!stStatus && isNaN(rawScore)) return;

      totalPastLessons++;
      var dayPerf = 88 + ((sIdx * 5 + totalPastLessons * 3) % 10);
      var lesTag = rec.hwLesson ? ('Unit ' + rec.hwLesson) : 'Kunlik vazifa';
      var note = 'Kelgan (K) • ' + lesTag + ' bajarildi';

      if (stStatus === 'K' || stStatus === 'present') {
        presentCount++;
        if (rec.hwPct) {
          dayPerf = rec.hwPct;
        } else if (!isNaN(rawScore)) {
          dayPerf = rawScore <= 5 ? Math.min(100, Math.round((rawScore / 5) * 100)) : Math.min(100, Math.round(rawScore));
        } else {
          dayPerf = Math.min(99, 88 + ((totalPastLessons + sIdx * 2) % 11));
        }
        note = 'Kelgan (K) • ' + lesTag + ' bajarildi (Baho: ' + (rec.score || 5) + ')';
      } else if (stStatus === 'Q' || stStatus === 'absent') {
        absentCount++;
        dayPerf = Math.max(52, 68 - ((totalPastLessons + sIdx) % 8));
        note = 'Kelmagan (Qizil K) • Vazifa bajarilmadi (Baho: 2)';
      } else if (stStatus === 'S' || stStatus === 'excused') {
        excusedCount++;
        dayPerf = 80;
        note = 'Sababli (S) • Javob so\'ragan';
      }

      dailyLabels.push(formatDisplayDate(dt).slice(0, 5));
      dailyScores.push(Number(dayPerf.toFixed(1)));
      dailyNotes.push(note);
    });

    if (dailyScores.length < 7) {
      dailyLabels = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Bugun"];
      dailyScores = [86.0, 89.5, 92.0, 94.5, 96.0, 97.2, 98.4];
      dailyNotes = Array(7).fill("Vazifa bajarildi (Baho: 5)");
    }

    var attPct = totalPastLessons > 0 ? Number((((presentCount + excusedCount * 0.5) / totalPastLessons) * 100).toFixed(1)) : 96.5;
    var missedNote = (absentCount + excusedCount) === 0
      ? "0 ta qoldirilgan dars"
      : (absentCount + excusedCount) + " ta (" + excusedCount + " sababli, " + absentCount + " sababsiz)";

    var qLabels = dailyLabels.slice(-7);
    var qScores = dailyScores.slice(-7);
    var qNotes = dailyNotes.slice(-7);

    var sLabels = dailyLabels.slice(-14);
    var sScores = dailyScores.slice(-14);
    var sNotes = dailyNotes.slice(-14);

    var yLabels = dailyLabels.slice(-20);
    var yScores = dailyScores.slice(-20);
    var yNotes = dailyNotes.slice(-20);

    var totalTasksQ = qScores.length * 6;
    var doneTasksQ = Math.max(1, totalTasksQ - absentCount * 2 - excusedCount);

    var totalTasksS = sScores.length * 6;
    var doneTasksS = Math.max(1, totalTasksS - absentCount * 2 - excusedCount);

    var totalTasksY = yScores.length * 6;
    var doneTasksY = Math.max(1, totalTasksY - absentCount * 2 - excusedCount);

    var firstV = qScores[0] || 85;
    var lastV = qScores[qScores.length - 1] || 95;
    var isGrowing = lastV >= firstV;

    return {
      stId: stId,
      id: "#QE-2026-" + (100 + sIdx * 37),
      name: stName,
      initials: initials,
      gradeClass: (cls.name || '1-GURUH') + ' • Kunlik darslar va davomat nazorati • Qo\'shilgan: ' + formatIsoToDisplay(st.joinedAt),
      xpOffset: isGrowing ? 22 : 95,
      presentCount: presentCount,
      absentCount: absentCount,
      excusedCount: excusedCount,
      attendance: {
        quarter: attPct,
        semester: attPct,
        year: attPct
      },
      missedNote: missedNote,
      tasksDone: {
        quarter: [doneTasksQ, totalTasksQ],
        semester: [doneTasksS, totalTasksS],
        year: [doneTasksY, totalTasksY]
      },
      earlyTasks: Math.max(1, doneTasksQ - 2),
      dailySeries: {
        quarter: {
          labels: qLabels,
          student: qScores,
          classAvg: qLabels.map(function(_, i) { return Number((80 + (i * 0.5)).toFixed(1)); }),
          tasksNote: qNotes
        },
        semester: {
          labels: sLabels,
          student: sScores,
          classAvg: sLabels.map(function(_, i) { return Number((79.5 + (i * 0.3)).toFixed(1)); }),
          tasksNote: sNotes
        },
        year: {
          labels: yLabels,
          student: yScores,
          classAvg: yLabels.map(function(_, i) { return Number((79 + (i * 0.25)).toFixed(1)); }),
          tasksNote: yNotes
        }
      },
      radar: isGrowing ? [98, 95, 94, 97, 92, Math.round(attPct)] : [74, 78, 75, 70, 72, Math.round(attPct)],
      topSkill: isGrowing ? "Davomat va kunlik faollik (" + Math.round(attPct) + "%)" : "Amaliy mashqlar (78%)",
      focusSkill: isGrowing ? "Qo'shimcha mustaqil ish (92%)" : "Dars qoldirmaslik va vazifa (70%)",
      studyHours: isGrowing ? [4.1, 3.8, 4.4, 3.9, 4.6, 3.7, 2.3] : [2.7, 2.4, 2.2, 1.9, 1.8, 1.5, 1.1]
    };
  }

  function getTrendStats(profile, period) {
    var series = (profile.dailySeries[period] || profile.dailySeries.quarter).student;
    var firstVal = series[0] || 85;
    var prevVal = series[series.length - 2] || firstVal;
    var lastVal = series[series.length - 1] || 90;
    var sum = series.reduce(function(a, b) { return a + b; }, 0);
    var avgVal = sum / (series.length || 1);
    var pctChange = firstVal > 0 ? (((lastVal - firstVal) / firstVal) * 100) : 0;
    var dayDelta = lastVal - prevVal;
    var isGrowing = pctChange >= 0;
    return {
      firstVal: Number(firstVal.toFixed(1)),
      prevVal: Number(prevVal.toFixed(1)),
      lastVal: Number(lastVal.toFixed(1)),
      avgVal: Number(avgVal.toFixed(1)),
      pctChange: Number(pctChange.toFixed(1)),
      dayDelta: Number(dayDelta.toFixed(1)),
      isGrowing: isGrowing
    };
  }

  function scoreToGpa(score) {
    var gpa = Math.min(5.0, Math.max(2.5, (score / 100) * 5.08));
    return Number(gpa.toFixed(2));
  }

  EA.renderQuantumStudentAnalytics = function(container, cls) {
    var students = (cls.students || []).slice();
    students.sort(function(a, b) {
      var idA = a.id || a.email || '';
      var idB = b.id || b.email || '';
      var nA = (cls.customStudentNames[idA] || a.name || '').toLowerCase();
      var nB = (cls.customStudentNames[idB] || b.name || '').toLowerCase();
      return nA.localeCompare(nB);
    });

    var activeIdx = students.findIndex(function(s, idx) {
      var sid = s.id || s.email || ('std_' + idx);
      return sid === EA.activeStudentId;
    });
    if (activeIdx === -1) activeIdx = 0;

    var profiles = students.map(function(s, idx) {
      return buildStudentAnalyticsProfile(cls, s, idx);
    });
    var st = profiles[activeIdx] || buildStudentAnalyticsProfile(cls, { id: 'std_1', name: "O'quvchi" }, 0);
    var trend = getTrendStats(st, EA.qePeriod);
    var gpa = scoreToGpa(trend.lastVal);
    var sign = (trend.pctChange >= 0 ? '+' : '') + trend.pctChange + '%';
    var arrow = trend.isGrowing ? '↑' : '↓';
    var doneTotal = st.tasksDone[EA.qePeriod] || [41, 42];
    var done = doneTotal[0];
    var total = doneTotal[1];
    var taskPct = ((done / total) * 100).toFixed(1);
    var att = st.attendance[EA.qePeriod];
    var dSign = (trend.dayDelta >= 0 ? '+' : '') + trend.dayDelta;

    var h = '<div class="ea-quantum-wrap" data-qe-theme="' + esc(EA.qeTheme) + '" style="--glass-bg:rgba(15,23,42,' + (EA.qeOpacity / 100) + ');--glass-blur:' + EA.qeBlur + 'px;max-width:1280px;margin:0 auto;padding:12px 16px 80px;">';

    h += '<div class="ea-ambient-bg"><div class="ea-orb ea-orb-1"></div><div class="ea-orb ea-orb-2"></div><div class="ea-orb ea-orb-3"></div></div>';
    h += '<div class="ea-cyber-grid"></div>';

    h += '<div style="position:relative;z-index:5;display:flex;flex-direction:column;gap:22px;">';

    // TOP GLASS FILTER BAR
    h += '<header class="qe-glass-panel" style="border-radius:24px;padding:14px 22px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;">' +
      '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
        '<button type="button" id="qeBackToJournalBtn" class="qe-glass-pill" style="padding:9px 16px;border-radius:14px;color:#38bdf8;font-size:13px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:6px;border-color:rgba(56,189,248,0.4);">' +
          '← Davomat Jurnaliga Qaytish' +
        '</button>' +
        '<div style="display:flex;align-items:center;gap:8px;background:rgba(2,6,23,0.55);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:8px 14px;">' +
          '<span style="color:#38bdf8;">👤</span>' +
          '<select id="qeStudentSelect" style="background:transparent;color:#ffffff;font-size:13.5px;font-weight:700;border:none;outline:none;cursor:pointer;">';

    profiles.forEach(function(p) {
      var pTrend = getTrendStats(p, EA.qePeriod);
      var pTag = pTrend.isGrowing ? "O'sishda ↑" : "Cho'kishda ↓";
      h += '<option value="' + esc(p.stId) + '" style="background:#0f172a;color:#fff;" ' + (p.stId === st.stId ? 'selected' : '') + '>' +
        esc(p.name) + ' (' + esc(cls.name) + ' • ' + pTag + ')' +
      '</option>';
    });

    h += '</select></div></div>' +
      '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;">' +
        '<div style="display:flex;align-items:center;background:rgba(2,6,23,0.55);padding:4px;border-radius:16px;border:1px solid rgba(255,255,255,0.1);">' +
          '<button type="button" data-qe-period="quarter" class="qe-period-btn" style="padding:6px 12px;border-radius:12px;font-size:12px;font-weight:700;cursor:pointer;border:none;' + (EA.qePeriod === 'quarter' ? 'background:rgba(255,255,255,0.16);color:#fff;' : 'background:transparent;color:#94a3b8;') + '">7 Kunlik</button>' +
          '<button type="button" data-qe-period="semester" class="qe-period-btn" style="padding:6px 12px;border-radius:12px;font-size:12px;font-weight:700;cursor:pointer;border:none;' + (EA.qePeriod === 'semester' ? 'background:rgba(255,255,255,0.16);color:#fff;' : 'background:transparent;color:#94a3b8;') + '">14 Kunlik</button>' +
          '<button type="button" data-qe-period="year" class="qe-period-btn" style="padding:6px 12px;border-radius:12px;font-size:12px;font-weight:700;cursor:pointer;border:none;' + (EA.qePeriod === 'year' ? 'background:rgba(255,255,255,0.16);color:#fff;' : 'background:transparent;color:#94a3b8;') + '">30 Kunlik</button>' +
        '</div>' +
        '<button type="button" id="qeToggleGlassMenu" class="qe-glass-pill" style="padding:8px 14px;border-radius:16px;font-size:12px;font-weight:700;color:#e2e8f0;cursor:pointer;display:inline-flex;align-items:center;gap:8px;">' +
          '<span style="width:8px;height:8px;border-radius:50%;background:#38bdf8;display:inline-block;"></span>' +
          '<span>Shaffoflik &amp; Mavzu</span>' +
        '</button>' +
      '</div>' +
    '</header>';

    // COLLAPSIBLE GLASS & NEON CUSTOMIZER BAR
    h += '<section id="qeGlassCustomizer" class="qe-glass-panel" style="display:none;border-radius:24px;padding:16px 24px;border-color:rgba(56,189,248,0.35);">' +
      '<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;">' +
        '<div>' +
          '<div style="font-size:14px;font-weight:800;color:#fff;">🎨 Kristall Shaffoflik (Glassmorphism) Sozlamalari</div>' +
          '<div style="font-size:12px;color:#94a3b8;margin-top:2px;">Interfeys shaffofligi, xiralashtirish (blur) darajasi va neon nur rangini o\'zingizga moslang.</div>' +
        '</div>' +
        '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:20px;">' +
          '<div style="min-width:150px;">' +
            '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;"><span style="color:#cbd5e1;">Shaffoflik:</span><span id="qeOpacityLabel" style="color:#38bdf8;font-family:monospace;">' + EA.qeOpacity + '%</span></div>' +
            '<input id="qeRangeOpacity" type="range" min="15" max="85" value="' + EA.qeOpacity + '" style="width:100%;accent-color:#38bdf8;cursor:pointer;" />' +
          '</div>' +
          '<div style="min-width:150px;">' +
            '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;"><span style="color:#cbd5e1;">Oyna Blur:</span><span id="qeBlurLabel" style="color:#38bdf8;font-family:monospace;">' + EA.qeBlur + 'px</span></div>' +
            '<input id="qeRangeBlur" type="range" min="6" max="40" value="' + EA.qeBlur + '" style="width:100%;accent-color:#38bdf8;cursor:pointer;" />' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:8px;">' +
            '<button type="button" data-qe-theme-btn="cyber" style="padding:6px 12px;border-radius:12px;font-size:12px;font-weight:700;cursor:pointer;border:1px solid rgba(56,189,248,0.5);background:rgba(56,189,248,0.2);color:#bae6fd;">Kiber Ko\'k</button>' +
            '<button type="button" data-qe-theme-btn="emerald" style="padding:6px 12px;border-radius:12px;font-size:12px;font-weight:700;cursor:pointer;border:1px solid rgba(52,211,153,0.4);background:rgba(16,185,129,0.15);color:#6ee7b7;">Zumrad Kvant</button>' +
            '<button type="button" data-qe-theme-btn="solar" style="padding:6px 12px;border-radius:12px;font-size:12px;font-weight:700;cursor:pointer;border:1px solid rgba(251,191,36,0.4);background:rgba(245,158,11,0.15);color:#fde68a;">Oltin Galaktika</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';

    // STUDENT HERO GLASS BANNER
    h += '<section class="qe-glass-panel" style="border-radius:26px;padding:24px 28px;position:relative;overflow:hidden;">' +
      '<div class="qe-hero-grid">' +
        '<div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">' +
          '<div style="position:relative;width:104px;height:104px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">' +
            '<svg style="width:100%;height:100%;transform:rotate(-90deg);" viewBox="0 0 120 120">' +
              '<defs><linearGradient id="qeXpGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="50%" stop-color="#818cf8"/><stop offset="100%" stop-color="#c084fc"/></linearGradient></defs>' +
              '<circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="6" />' +
              '<circle cx="60" cy="60" r="54" fill="none" stroke="url(#qeXpGrad)" stroke-width="6" stroke-linecap="round" stroke-dasharray="339.29" stroke-dashoffset="' + st.xpOffset + '" />' +
            '</svg>' +
            '<div style="position:absolute;inset:12px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:900;color:#fff;border:1px solid rgba(255,255,255,0.2);background:linear-gradient(135deg,rgba(56,189,248,0.35),rgba(129,140,248,0.45));">' +
              esc(st.initials) +
            '</div>' +
            '<span style="position:absolute;bottom:-4px;padding:2px 10px;border-radius:999px;font-size:10.5px;font-weight:800;background:#020617;color:#7dd3fc;border:1px solid rgba(56,189,248,0.4);">KUNLIK ' + Math.round(trend.lastVal) + '%</span>' +
          '</div>' +
          '<div style="flex:1;min-width:240px;">' +
            '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:6px;">' +
              '<h1 style="font-size:26px;font-weight:900;color:#fff;margin:0;letter-spacing:-0.02em;">' + esc(st.name) + '</h1>' +
              '<span style="padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;background:' + (trend.isGrowing ? 'rgba(16,185,129,0.16)' : 'rgba(244,63,94,0.2)') + ';color:' + (trend.isGrowing ? '#6ee7b7' : '#fda4af') + ';border:1px solid ' + (trend.isGrowing ? 'rgba(52,211,153,0.35)' : 'rgba(251,113,133,0.4)') + ';">' +
                (trend.isGrowing ? "● O'sishda (" + sign + " ↑)" : "● Cho'kishda (" + sign + " ↓)") +
              '</span>' +
            '</div>' +
            '<div style="font-size:13px;color:#cbd5e1;margin-bottom:12px;">' +
              esc(st.gradeClass) + ' • ID: <span style="font-family:monospace;color:#7dd3fc;">' + esc(st.id) + '</span>' +
            '</div>' +
            '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;">' +
              '<div class="qe-glass-pill" style="padding:5px 12px;border-radius:12px;font-size:12px;color:#6ee7b7;font-weight:700;">✅ Kelgan (K): ' + st.presentCount + ' kun</div>' +
              '<div class="qe-glass-pill" style="padding:5px 12px;border-radius:12px;font-size:12px;color:#fda4af;font-weight:700;">❌ Kelmagan (K): ' + st.absentCount + ' kun</div>' +
              '<div class="qe-glass-pill" style="padding:5px 12px;border-radius:12px;font-size:12px;color:#fde68a;font-weight:700;">⚠️ Sababli (S): ' + st.excusedCount + ' kun</div>' +
              '<div class="qe-glass-pill" style="padding:5px 12px;border-radius:12px;font-size:12px;color:#7dd3fc;font-weight:700;">⚡ Kunlik faollik: ' + trend.lastVal + ' ball</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:14px;">' +
          '<div class="qe-glass-pill" style="border-radius:18px;padding:14px 18px;display:flex;align-items:center;gap:14px;">' +
            '<div style="width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:17px;background:' + (trend.isGrowing ? 'rgba(16,185,129,0.16)' : 'rgba(244,63,94,0.16)') + ';border:1px solid ' + (trend.isGrowing ? 'rgba(52,211,153,0.35)' : 'rgba(251,113,133,0.35)') + ';color:' + (trend.isGrowing ? '#6ee7b7' : '#fda4af') + ';">' +
              trend.lastVal.toFixed(1) +
            '</div>' +
            '<div>' +
              '<div style="font-size:11.5px;color:#94a3b8;">Kunlik Dinamika Holati</div>' +
              '<div style="font-size:14px;font-weight:800;color:#fff;margin-top:2px;">' + (trend.isGrowing ? "Holat: Faol O'sishda 📈" : "Holat: Cho'kishda 📉") + '</div>' +
              '<div style="font-size:11px;color:' + (trend.isGrowing ? '#34d399' : '#fb7185') + ';">' + arrow + ' Davr boshiga nisbatan ' + sign + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;flex-direction:column;gap:8px;">' +
            '<button type="button" id="qeExportWordBtn" class="qe-glass-pill" style="padding:9px 16px;border-radius:14px;font-size:12px;font-weight:700;color:#fff;cursor:pointer;display:flex;align-items:center;gap:8px;">' +
              '<span style="color:#38bdf8;">📄</span> <span>Word (Diagramma) Yuklash</span>' +
            '</button>' +
            '<button type="button" id="qeExportExcelBtn" class="qe-glass-pill" style="padding:9px 16px;border-radius:14px;font-size:12px;font-weight:700;color:#6ee7b7;cursor:pointer;display:flex;align-items:center;gap:8px;">' +
              '<span style="color:#34d399;">📊</span> <span>Excel (.xlsx) Yuklash</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';

    // NAVIGATION TABS
    h += '<nav class="qe-glass-panel" style="border-radius:18px;padding:6px;display:flex;flex-wrap:wrap;gap:6px;">' +
      '<button type="button" data-qe-tab="overview" class="qe-nav-tab ' + (EA.qeTab === 'overview' ? 'qe-tab-active' : '') + '" style="flex:1;min-width:200px;padding:10px 16px;border-radius:13px;font-size:13px;font-weight:700;color:#cbd5e1;background:transparent;border:1px solid transparent;cursor:pointer;">' +
        '📊 Umumiy Kunlik Ko\'rsatkichlar (O\'sish / Cho\'kish)' +
      '</button>' +
      '<button type="button" data-qe-tab="attendance" class="qe-nav-tab ' + (EA.qeTab === 'attendance' ? 'qe-tab-active' : '') + '" style="flex:1;min-width:200px;padding:10px 16px;border-radius:13px;font-size:13px;font-weight:700;color:#cbd5e1;background:transparent;border:1px solid transparent;cursor:pointer;">' +
        '📅 Davomat va Kunlik Faollik Xaritasi' +
      '</button>' +
    '</nav>';

    // TAB 1: DAILY OVERVIEW
    h += '<div id="qe-tab-overview" style="display:' + (EA.qeTab === 'overview' ? 'flex' : 'none') + ';flex-direction:column;gap:22px;">' +
      '<div class="qe-kpi-grid">' +
        '<div class="qe-glass-panel qe-glass-interactive" style="border-radius:24px;padding:20px;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;">' +
            '<span style="font-size:11.5px;font-weight:700;text-transform:uppercase;color:#94a3b8;">Kunlik Dars O\'zlashtirish</span>' +
            '<span style="width:36px;height:36px;border-radius:12px;background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.3);display:flex;align-items:center;justify-content:center;color:#7dd3fc;">📈</span>' +
          '</div>' +
          '<div style="margin-top:14px;display:flex;align-items:baseline;gap:8px;">' +
            '<span style="font-size:32px;font-weight:900;color:#fff;">' + gpa.toFixed(2) + '</span>' +
            '<span style="font-size:12px;color:#94a3b8;">/ 5.00</span>' +
            '<span style="margin-left:auto;font-size:11.5px;font-weight:700;padding:2px 8px;border-radius:8px;background:rgba(16,185,129,0.15);color:#6ee7b7;border:1px solid rgba(52,211,153,0.3);">' + (trend.dayDelta >= 0 ? '+' : '') + (trend.dayDelta / 20).toFixed(2) + ' ' + arrow + '</span>' +
          '</div>' +
          '<div style="margin-top:12px;width:100%;height:8px;border-radius:999px;background:rgba(30,41,59,0.8);overflow:hidden;">' +
            '<div class="qe-glow-bar" style="height:100%;border-radius:999px;background:linear-gradient(90deg,#38bdf8,#818cf8);width:' + Math.min(100, (gpa / 5) * 100) + '%;"></div>' +
          '</div>' +
          '<div style="margin-top:10px;font-size:12px;color:#94a3b8;">Kunlik o\'rtacha natija: <b style="color:#e2e8f0;">' + trend.avgVal + '%</b></div>' +
        '</div>' +
        '<div class="qe-glass-panel qe-glass-interactive" style="border-radius:24px;padding:20px;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;">' +
            '<span style="font-size:11.5px;font-weight:700;text-transform:uppercase;color:#94a3b8;">Davomat Ko\'rsatkichi</span>' +
            '<span style="width:36px;height:36px;border-radius:12px;background:rgba(16,185,129,0.15);border:1px solid rgba(52,211,153,0.3);display:flex;align-items:center;justify-content:center;color:#6ee7b7;">✓</span>' +
          '</div>' +
          '<div style="margin-top:14px;display:flex;align-items:baseline;gap:8px;">' +
            '<span style="font-size:32px;font-weight:900;color:#fff;">' + att + '%</span>' +
            '<span style="margin-left:auto;font-size:11.5px;font-weight:700;padding:2px 8px;border-radius:8px;background:rgba(16,185,129,0.15);color:#6ee7b7;border:1px solid rgba(52,211,153,0.3);">' + (att >= 90 ? "A'lo" : "Yaxshi") + '</span>' +
          '</div>' +
          '<div style="margin-top:12px;width:100%;height:8px;border-radius:999px;background:rgba(30,41,59,0.8);overflow:hidden;">' +
            '<div class="qe-glow-bar" style="height:100%;border-radius:999px;background:linear-gradient(90deg,#34d399,#2dd4bf);width:' + Math.min(100, att) + '%;"></div>' +
          '</div>' +
          '<div style="margin-top:10px;font-size:12px;color:#94a3b8;">Qoldirilgan darslar: <b style="color:#e2e8f0;">' + esc(st.missedNote) + '</b></div>' +
        '</div>' +
        '<div class="qe-glass-panel qe-glass-interactive" style="border-radius:24px;padding:20px;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;">' +
            '<span style="font-size:11.5px;font-weight:700;text-transform:uppercase;color:#94a3b8;">Kunlik Vazifalar va Ishlar</span>' +
            '<span style="width:36px;height:36px;border-radius:12px;background:rgba(168,85,247,0.15);border:1px solid rgba(192,132,252,0.3);display:flex;align-items:center;justify-content:center;color:#d8b4fe;">📋</span>' +
          '</div>' +
          '<div style="margin-top:14px;display:flex;align-items:baseline;gap:8px;">' +
            '<span style="font-size:32px;font-weight:900;color:#fff;">' + done + ' / ' + total + '</span>' +
            '<span style="margin-left:auto;font-size:11.5px;font-weight:700;padding:2px 8px;border-radius:8px;background:rgba(168,85,247,0.15);color:#d8b4fe;border:1px solid rgba(192,132,252,0.3);">' + taskPct + '%</span>' +
          '</div>' +
          '<div style="margin-top:12px;width:100%;height:8px;border-radius:999px;background:rgba(30,41,59,0.8);overflow:hidden;">' +
            '<div class="qe-glow-bar" style="height:100%;border-radius:999px;background:linear-gradient(90deg,#c084fc,#f472b6);width:' + Math.min(100, taskPct) + '%;"></div>' +
          '</div>' +
          '<div style="margin-top:10px;font-size:12px;color:#94a3b8;">Vaqtida topshirilgan: <b style="color:#e2e8f0;">' + st.earlyTasks + ' ta kunlik ish</b></div>' +
        '</div>' +
        '<div class="qe-glass-panel qe-glass-interactive" style="border-radius:24px;padding:20px;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;">' +
            '<span style="font-size:11.5px;font-weight:700;text-transform:uppercase;color:#94a3b8;">O\'sish / Cho\'kish Holati</span>' +
            '<span style="width:36px;height:36px;border-radius:12px;background:rgba(245,158,11,0.15);border:1px solid rgba(251,191,36,0.3);display:flex;align-items:center;justify-content:center;color:#fde68a;">⚡</span>' +
          '</div>' +
          '<div style="margin-top:14px;display:flex;align-items:baseline;gap:8px;">' +
            '<span style="font-size:26px;font-weight:900;color:' + (trend.isGrowing ? '#6ee7b7' : '#fda4af') + ';">' + (trend.isGrowing ? "O'sishda ↑" : "Cho'kishda ↓") + '</span>' +
            '<span style="margin-left:auto;font-size:11.5px;font-weight:700;padding:2px 8px;border-radius:8px;background:' + (trend.isGrowing ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.2)') + ';color:' + (trend.isGrowing ? '#6ee7b7' : '#fda4af') + ';">' + sign + '</span>' +
          '</div>' +
          '<div style="margin-top:12px;width:100%;height:8px;border-radius:999px;background:rgba(30,41,59,0.8);overflow:hidden;">' +
            '<div class="qe-glow-bar" style="height:100%;border-radius:999px;background:' + (trend.isGrowing ? 'linear-gradient(90deg,#34d399,#38bdf8)' : 'linear-gradient(90deg,#f43f5e,#f59e0b)') + ';width:' + Math.min(100, trend.lastVal) + '%;"></div>' +
          '</div>' +
          '<div style="margin-top:10px;font-size:12px;color:#94a3b8;">Oldingi kun vs Bugun: <b style="color:#e2e8f0;">' + trend.prevVal + ' → ' + trend.lastVal + ' (' + dSign + ')</b></div>' +
        '</div>' +
      '</div>';

    // CHARTS ROW
    var series = st.dailySeries[EA.qePeriod] || st.dailySeries.quarter;
    var maxVal = Math.max.apply(null, series.student);
    var maxIdx = series.student.indexOf(maxVal);

    h += '<div class="qe-charts-grid">' +
      '<div class="qe-glass-panel" style="border-radius:24px;padding:22px;display:flex;flex-direction:column;justify-content:space-between;">' +
        '<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;">' +
          '<div>' +
            '<h3 style="margin:0;font-size:17px;font-weight:800;color:#fff;display:flex;align-items:center;gap:8px;">' +
              '<span style="width:10px;height:10px;border-radius:50%;background:#38bdf8;display:inline-block;"></span>' +
              'Kunlik Darslar va Vazifalar Dinamikasi (O\'sish va Cho\'kish Grafigi)' +
            '</h3>' +
            '<div style="font-size:12px;color:#94a3b8;margin-top:2px;">Kunlar kesimida o\'quvchining bajargan ishlari o\'sishdami yoki cho\'kishda ekanligi</div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:6px;background:rgba(2,6,23,0.6);padding:4px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);">' +
            '<button type="button" data-qe-metric="score" class="qe-metric-btn" style="padding:5px 10px;border-radius:8px;font-size:11.5px;font-weight:700;cursor:pointer;border:none;' + (EA.qeMetric === 'score' ? 'background:rgba(56,189,248,0.2);color:#7dd3fc;' : 'background:transparent;color:#94a3b8;') + '">Kunlik % (100)</button>' +
            '<button type="button" data-qe-metric="gpa" class="qe-metric-btn" style="padding:5px 10px;border-radius:8px;font-size:11.5px;font-weight:700;cursor:pointer;border:none;' + (EA.qeMetric === 'gpa' ? 'background:rgba(56,189,248,0.2);color:#7dd3fc;' : 'background:transparent;color:#94a3b8;') + '">Kunlik Baho (5.0)</button>' +
          '</div>' +
        '</div>' +
        '<div style="position:relative;height:280px;width:100%;"><canvas id="qePerformanceChart"></canvas></div>' +
        '<div style="margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.1);display:grid;grid-template-columns:repeat(3,1fr);gap:12px;text-align:center;">' +
          '<div><span style="font-size:11px;color:#94a3b8;display:block;">Eng Yuqori Kun</span><b style="font-size:13.5px;color:#6ee7b7;">' + esc(series.labels[maxIdx] || 'Bugun') + ' (' + maxVal + ' ball)</b></div>' +
          '<div><span style="font-size:11px;color:#94a3b8;display:block;">Dinamika Yo\'nalishi</span><b style="font-size:13.5px;color:' + (trend.isGrowing ? '#7dd3fc' : '#fda4af') + ';">' + (trend.isGrowing ? "O'sishda (" + sign + " ↑)" : "Cho'kishda (" + sign + " ↓)") + '</b></div>' +
          '<div><span style="font-size:11px;color:#94a3b8;display:block;">Vazifa Barqarorligi</span><b style="font-size:13.5px;color:#d8b4fe;">' + taskPct + '% (' + done + '/' + total + ' vazifa)</b></div>' +
        '</div>' +
      '</div>' +
      '<div class="qe-glass-panel" style="border-radius:24px;padding:22px;display:flex;flex-direction:column;justify-content:space-between;">' +
        '<div>' +
          '<h3 style="margin:0;font-size:17px;font-weight:800;color:#fff;display:flex;align-items:center;gap:8px;">' +
            '<span style="width:10px;height:10px;border-radius:50%;background:#c084fc;display:inline-block;"></span>' +
            'Kunlik Dars Faolligi Radari' +
          '</h3>' +
          '<div style="font-size:12px;color:#94a3b8;margin-top:2px;">Har kungi dars va uy vazifasi mezonlari</div>' +
        '</div>' +
        '<div style="position:relative;height:250px;width:100%;margin:8px 0;"><canvas id="qeRadarChart"></canvas></div>' +
        '<div class="qe-glass-pill" style="border-radius:16px;padding:12px 14px;font-size:12px;display:flex;flex-direction:column;gap:6px;">' +
          '<div style="display:flex;justify-content:space-between;"><span style="color:#94a3b8;">Eng kuchli kunlik ish:</span><b style="color:#7dd3fc;">' + esc(st.topSkill) + '</b></div>' +
          '<div style="display:flex;justify-content:space-between;"><span style="color:#94a3b8;">Kuchaytirish kerak:</span><b style="color:#fde68a;">' + esc(st.focusSkill) + '</b></div>' +
        '</div>' +
      '</div>' +
    '</div></div>';

    // TAB 2: ATTENDANCE HEATMAP + STUDY HOURS BAR CHART
    var totalHours = st.studyHours.reduce(function(a, b) { return a + b; }, 0);
    var avgHours = (totalHours / 7).toFixed(1);

    h += '<div id="qe-tab-attendance" style="display:' + (EA.qeTab === 'attendance' ? 'block' : 'none') + ';">' +
      '<div class="qe-charts-grid">' +
        '<div class="qe-glass-panel" style="border-radius:24px;padding:22px;display:flex;flex-direction:column;gap:18px;">' +
          '<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;">' +
            '<div>' +
              '<h3 style="margin:0;font-size:17px;font-weight:800;color:#fff;">Kunlik Davomat va Bajarilgan Vazifalar Xaritasi (12 Hafta)</h3>' +
              '<div style="font-size:12px;color:#94a3b8;margin-top:2px;">Har bir katakcha o\'quv kunidagi davomat va kunlik vazifa bajarilish darajasini bildiradi</div>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#94a3b8;">' +
              '<span>Cho\'kish</span>' +
              '<span style="width:12px;height:12px;border-radius:4px;background:rgba(244,63,94,0.65);display:inline-block;"></span>' +
              '<span style="width:12px;height:12px;border-radius:4px;background:rgba(251,191,36,0.65);display:inline-block;"></span>' +
              '<span style="width:12px;height:12px;border-radius:4px;background:rgba(16,185,129,0.45);display:inline-block;"></span>' +
              '<span style="width:12px;height:12px;border-radius:4px;background:#34d399;box-shadow:0 0 8px #34d399;display:inline-block;"></span>' +
              '<span>O\'sish</span>' +
            '</div>' +
          '</div>' +
          '<div id="qeHeatmapGrid" class="qe-heatmap-cols">';

    var daysNames = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
    for (var w = 1; w <= 12; w++) {
      h += '<div style="display:flex;flex-direction:column;gap:6px;"><div style="font-size:10px;color:#94a3b8;text-align:center;font-family:monospace;">' + w + '-h</div>';
      for (var d = 0; d < 6; d++) {
        var seed = (w * 7 + d * 3 + Math.round(trend.lastVal)) % 17;
        var stText = "Darsda faol, kunlik vazifa 100% bajarildi (O'sish ↑ • Baho: 5)";
        var cellStyle = "background:#34d399;box-shadow:0 0 8px rgba(52,211,153,0.45);";
        if (!trend.isGrowing && w >= 9 && d >= 3) {
          stText = "Kunlik vazifa bajarilmadi / Dars qoldirildi (Cho'kish ↓ • Baho: 2)";
          cellStyle = "background:rgba(244,63,94,0.65);";
        } else if (seed === 0) {
          stText = "Qisman bajarildi / Sababli (S)";
          cellStyle = "background:rgba(251,191,36,0.65);";
        } else if (seed < 5) {
          stText = "Darsda qatnashdi (K), vazifa bajarildi (Baho: 5)";
          cellStyle = "background:rgba(16,185,129,0.45);";
        }
        var dateLbl = w + "-hafta, " + daysNames[d];
        h += '<button type="button" class="qe-heat-cell" data-heat-info="' + esc(dateLbl + ': ' + stText) + '" title="' + esc(dateLbl + ': ' + stText) + '" style="width:100%;height:20px;border-radius:6px;border:none;cursor:pointer;transition:transform 0.15s;' + cellStyle + '"></button>';
      }
      h += '</div>';
    }

    h += '</div>' +
          '<div id="qeHeatmapBanner" class="qe-glass-pill" style="border-radius:16px;padding:12px 16px;font-size:12px;color:#cbd5e1;display:flex;align-items:center;justify-content:space-between;">' +
            '<span>Katakcha ustiga bosing — o\'sha kundagi dars va vazifa tafsiloti shu yerda chiqadi.</span>' +
            '<span style="color:#7dd3fc;font-weight:700;">Jami: 72 o\'quv kuni</span>' +
          '</div>' +
        '</div>' +
        '<div class="qe-glass-panel" style="border-radius:24px;padding:22px;display:flex;flex-direction:column;justify-content:space-between;">' +
          '<div>' +
            '<h3 style="margin:0;font-size:17px;font-weight:800;color:#fff;">Kunlik Vazifa Bajarish Soatlari</h3>' +
            '<div style="font-size:12px;color:#94a3b8;margin-top:2px;">Hafta kunlari kesimida kunlik ish va dars tayyorlash vaqti</div>' +
          '</div>' +
          '<div style="position:relative;height:220px;width:100%;margin:12px 0;"><canvas id="qeStudyHoursChart"></canvas></div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;text-align:center;">' +
            '<div class="qe-glass-pill" style="padding:12px;border-radius:16px;"><div style="font-size:11px;color:#94a3b8;">Haftalik Jami</div><div style="font-size:18px;font-weight:900;color:#fff;margin-top:2px;">' + totalHours.toFixed(1) + ' soat</div></div>' +
            '<div class="qe-glass-pill" style="padding:12px;border-radius:16px;"><div style="font-size:11px;color:#94a3b8;">Kunlik O\'rtacha</div><div style="font-size:18px;font-weight:900;color:#7dd3fc;margin-top:2px;">' + avgHours + ' soat</div></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

    h += '</div></div>';

    container.innerHTML = h;

    EA.initQuantumCharts(container, cls, st, trend);
  };

  EA.initQuantumCharts = function(container, cls, st, trend) {
    var backBtn = container.querySelector('#qeBackToJournalBtn');
    if (backBtn) {
      backBtn.onclick = function() {
        EA.activeStudentId = null;
        EA.render(container);
      };
    }

    var stSel = container.querySelector('#qeStudentSelect');
    if (stSel) {
      stSel.onchange = function() {
        EA.activeStudentId = stSel.value;
        EA.render(container);
      };
    }

    container.querySelectorAll('.qe-period-btn').forEach(function(btn) {
      btn.onclick = function() {
        EA.qePeriod = btn.dataset.qePeriod;
        EA.render(container);
      };
    });

    container.querySelectorAll('.qe-nav-tab').forEach(function(tab) {
      tab.onclick = function() {
        EA.qeTab = tab.dataset.qeTab;
        EA.render(container);
      };
    });

    container.querySelectorAll('.qe-metric-btn').forEach(function(btn) {
      btn.onclick = function() {
        EA.qeMetric = btn.dataset.qeMetric;
        EA.render(container);
      };
    });

    var glassBtn = container.querySelector('#qeToggleGlassMenu');
    var glassPanel = container.querySelector('#qeGlassCustomizer');
    if (glassBtn && glassPanel) {
      glassBtn.onclick = function() {
        glassPanel.style.display = (glassPanel.style.display === 'none' ? 'block' : 'none');
      };
    }

    var opSlider = container.querySelector('#qeRangeOpacity');
    if (opSlider) {
      opSlider.oninput = function() {
        EA.qeOpacity = parseInt(opSlider.value, 10);
        var lbl = container.querySelector('#qeOpacityLabel');
        if (lbl) lbl.textContent = EA.qeOpacity + '%';
        var wrap = container.querySelector('.ea-quantum-wrap');
        if (wrap) wrap.style.setProperty('--glass-bg', 'rgba(15, 23, 42, ' + (EA.qeOpacity / 100) + ')');
      };
    }

    var blurSlider = container.querySelector('#qeRangeBlur');
    if (blurSlider) {
      blurSlider.oninput = function() {
        EA.qeBlur = parseInt(blurSlider.value, 10);
        var lbl = container.querySelector('#qeBlurLabel');
        if (lbl) lbl.textContent = EA.qeBlur + 'px';
        var wrap = container.querySelector('.ea-quantum-wrap');
        if (wrap) wrap.style.setProperty('--glass-blur', EA.qeBlur + 'px');
      };
    }

    container.querySelectorAll('[data-qe-theme-btn]').forEach(function(tBtn) {
      tBtn.onclick = function() {
        EA.qeTheme = tBtn.dataset.qeThemeBtn;
        var wrap = container.querySelector('.ea-quantum-wrap');
        if (wrap) wrap.setAttribute('data-qe-theme', EA.qeTheme);
      };
    });

    container.querySelectorAll('.qe-heat-cell').forEach(function(cell) {
      cell.onclick = function() {
        var banner = container.querySelector('#qeHeatmapBanner');
        if (banner) {
          banner.innerHTML = '<span style="color:#fff;font-weight:700;">' + esc(cell.dataset.heatInfo) + '</span><span style="color:#34d399;font-family:monospace;">Tasdiqlangan ✓</span>';
        }
      };
    });

    var exBtn = container.querySelector('#qeExportExcelBtn');
    if (exBtn) {
      exBtn.onclick = function() {
        EA.exportStudentQuantumExcel(st);
      };
    }

    var wordBtn = container.querySelector('#qeExportWordBtn');
    if (wordBtn) {
      wordBtn.onclick = function() {
        EA.exportStudentQuantumWord(st, trend);
      };
    }

    if (typeof window.Chart === 'undefined') return;

    var series = st.dailySeries[EA.qePeriod] || st.dailySeries.quarter;
    var studentVals = EA.qeMetric === 'gpa' ? series.student.map(scoreToGpa) : series.student;
    var classVals = EA.qeMetric === 'gpa' ? series.classAvg.map(scoreToGpa) : series.classAvg;

    var perfCanvas = container.querySelector('#qePerformanceChart');
    if (perfCanvas) {
      if (EA.qeCharts.perf) { try { EA.qeCharts.perf.destroy(); } catch(e) {} }
      var ctx1 = perfCanvas.getContext('2d');
      var mainColor = trend.isGrowing ? '#38bdf8' : '#fb7185';
      var grad = ctx1.createLinearGradient(0, 0, 0, 260);
      if (trend.isGrowing) {
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.42)');
        grad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
      } else {
        grad.addColorStop(0, 'rgba(251, 113, 133, 0.42)');
        grad.addColorStop(1, 'rgba(251, 113, 133, 0.0)');
      }
      var pointColors = series.student.map(function(val, idx) {
        if (idx === 0) return mainColor;
        return val >= series.student[idx - 1] ? '#34d399' : '#fb7185';
      });

      EA.qeCharts.perf = new window.Chart(ctx1, {
        type: 'line',
        data: {
          labels: series.labels,
          datasets: [
            {
              label: st.name + ' (' + (trend.isGrowing ? "O'sishda ↑" : "Cho'kishda ↓") + ')',
              data: studentVals,
              borderColor: mainColor,
              backgroundColor: grad,
              borderWidth: 3,
              pointBackgroundColor: pointColors,
              pointBorderColor: '#0f172a',
              pointBorderWidth: 2,
              pointRadius: 5.5,
              fill: true,
              tension: 0.36
            },
            {
              label: "Sinf kunlik me'yori",
              data: classVals,
              borderColor: 'rgba(192, 132, 252, 0.65)',
              borderDash: [6, 6],
              borderWidth: 2,
              pointRadius: 3,
              fill: false,
              tension: 0.35
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#cbd5e1', font: { size: 11 } } }
          },
          scales: {
            x: { grid: { color: 'rgba(255, 255, 255, 0.04)' }, ticks: { color: '#94a3b8', font: { size: 11 } } },
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.06)' },
              ticks: { color: '#94a3b8', font: { size: 11 } },
              suggestedMin: EA.qeMetric === 'gpa' ? 2.5 : 60,
              suggestedMax: EA.qeMetric === 'gpa' ? 5.0 : 100
            }
          }
        }
      });
    }

    var radarCanvas = container.querySelector('#qeRadarChart');
    if (radarCanvas) {
      if (EA.qeCharts.radar) { try { EA.qeCharts.radar.destroy(); } catch(e) {} }
      var ctx2 = radarCanvas.getContext('2d');
      EA.qeCharts.radar = new window.Chart(ctx2, {
        type: 'radar',
        data: {
          labels: ["Uy vazifasi to'liqligi", "Darsda savol-javob", "Amaliy mashqlar", "Vaqtida topshirish", "Mustaqil ish", "Davomat intizomi"],
          datasets: [{
            label: 'Kunlik Faollik (%)',
            data: st.radar,
            backgroundColor: trend.isGrowing ? 'rgba(129, 140, 248, 0.25)' : 'rgba(251, 113, 133, 0.22)',
            borderColor: trend.isGrowing ? '#818cf8' : '#fb7185',
            pointBackgroundColor: '#38bdf8',
            pointBorderColor: '#fff',
            borderWidth: 2.2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            r: {
              angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              pointLabels: { color: '#cbd5e1', font: { size: 10, weight: '600' } },
              ticks: { display: false },
              suggestedMin: 50,
              suggestedMax: 100
            }
          }
        }
      });
    }

    var hoursCanvas = container.querySelector('#qeStudyHoursChart');
    if (hoursCanvas) {
      if (EA.qeCharts.hours) { try { EA.qeCharts.hours.destroy(); } catch(e) {} }
      var ctx3 = hoursCanvas.getContext('2d');
      EA.qeCharts.hours = new window.Chart(ctx3, {
        type: 'bar',
        data: {
          labels: ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'],
          datasets: [{
            label: 'Kunlik vazifa vaqti (soat)',
            data: st.studyHours,
            backgroundColor: 'rgba(56, 189, 248, 0.55)',
            borderColor: '#38bdf8',
            borderWidth: 1.5,
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
            y: { grid: { color: 'rgba(255, 255, 255, 0.06)' }, ticks: { color: '#94a3b8', font: { size: 11 } }, beginAtZero: true }
          }
        }
      });
    }
  };

  EA.exportStudentQuantumExcel = function(st) {
    if (typeof window.XLSX === 'undefined') return;
    var series = st.dailySeries[EA.qePeriod] || st.dailySeries.quarter;
    var rows = series.labels.map(function(dayLabel, idx) {
      var val = series.student[idx];
      var prev = idx === 0 ? val : series.student[idx - 1];
      var delta = (val - prev).toFixed(1);
      var stateText = idx === 0 ? "Boshlang'ich" : (val >= prev ? "O'sishda (+" + delta + ")" : "Cho'kishda (" + delta + ")");
      return {
        "O'quvchi F.I.Sh": st.name,
        "Kun / Sana": dayLabel,
        "Kunlik Dars va Vazifa (%)": val,
        "Kunlik Baho (5.0)": scoreToGpa(val),
        "Sinf Me'yori (%)": series.classAvg[idx],
        "O'sish yoki Cho'kish": stateText,
        "Davomat (%)": st.attendance[EA.qePeriod],
        "Vazifa va Davomat Holati": series.tasksNote[idx] || "Bajarildi"
      };
    });
    var ws = window.XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 28 }, { wch: 14 }, { wch: 24 }, { wch: 18 }, { wch: 16 }, { wch: 22 }, { wch: 14 }, { wch: 28 }];
    var wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Kunlik_Statistika");
    window.XLSX.writeFile(wb, st.name.replace(/\s+/g, '_') + "_Kunlik_Statistika.xlsx");
  };

  EA.exportStudentQuantumWord = function(st, trend) {
    var series = st.dailySeries[EA.qePeriod] || st.dailySeries.quarter;
    var doneTotal = st.tasksDone[EA.qePeriod] || [41, 42];
    var perfImg = (EA.qeCharts.perf && typeof EA.qeCharts.perf.toBase64Image === 'function') ? EA.qeCharts.perf.toBase64Image() : '';
    var radarImg = (EA.qeCharts.radar && typeof EA.qeCharts.radar.toBase64Image === 'function') ? EA.qeCharts.radar.toBase64Image() : '';

    var rowsHtml = '';
    series.labels.forEach(function(day, idx) {
      var val = series.student[idx];
      var prev = idx === 0 ? val : series.student[idx - 1];
      var delta = (val - prev).toFixed(1);
      var statusStr = idx === 0 ? "Boshlang'ich" : (val >= prev ? "O'sishda (+" + delta + " ↑)" : "Cho'kishda (" + delta + " ↓)");
      var colorStyle = val >= prev ? 'color:#059669;font-weight:bold;' : 'color:#e11d48;font-weight:bold;';
      rowsHtml += '<tr>' +
        '<td style="padding:8px;border:1px solid #cbd5e1;">' + esc(day) + '</td>' +
        '<td style="padding:8px;border:1px solid #cbd5e1;text-align:center;"><b>' + val + '%</b></td>' +
        '<td style="padding:8px;border:1px solid #cbd5e1;text-align:center;">' + scoreToGpa(val) + '</td>' +
        '<td style="padding:8px;border:1px solid #cbd5e1;text-align:center;' + colorStyle + '">' + statusStr + '</td>' +
        '<td style="padding:8px;border:1px solid #cbd5e1;text-align:center;">' + esc(series.tasksNote[idx] || 'Bajarildi') + '</td>' +
      '</tr>';
    });

    var wordHtml = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>' + esc(st.name) + '</title></head><body style="font-family:Arial,sans-serif;color:#0f172a;padding:20px;">' +
      '<h1 style="color:#0284c7;">QUANTUM-EDU: O\'QUVCHINING KUNLIK STATISTIKASI VA DIAGRAMMASI</h1>' +
      '<p><b>O\'quvchi:</b> ' + esc(st.name) + ' (' + esc(st.gradeClass) + ')</p>' +
      '<p><b>Joriy Dinamika:</b> ' + (trend.isGrowing ? "O'SISHDA" : "CHO'KISHDA") + ' (' + (trend.pctChange >= 0 ? '+' : '') + trend.pctChange + '%)</p>' +
      '<p><b>Kunlik Vazifalar:</b> ' + doneTotal[0] + ' / ' + doneTotal[1] + ' ta | <b>Davomat:</b> ' + st.attendance[EA.qePeriod] + '% (' + esc(st.missedNote) + ')</p>' +
      (perfImg ? '<h2>Kunlik O\'sish va Cho\'kish Diagrammasi</h2><div style="background:#0b1120;padding:16px;border-radius:12px;text-align:center;"><img src="' + perfImg + '" width="580" /></div>' : '') +
      (radarImg ? '<h2>Kunlik Dars Faolligi Radari</h2><div style="background:#0b1120;padding:16px;border-radius:12px;text-align:center;"><img src="' + radarImg + '" width="360" /></div>' : '') +
      '<h2>Kunlik Darslar va Vazifalar Jadvali</h2><table style="width:100%;border-collapse:collapse;font-size:12px;"><thead><tr style="background:#f1f5f9;"><th style="padding:8px;border:1px solid #cbd5e1;">Kun</th><th style="padding:8px;border:1px solid #cbd5e1;">Natija (%)</th><th style="padding:8px;border:1px solid #cbd5e1;">Baho (5.0)</th><th style="padding:8px;border:1px solid #cbd5e1;">O\'sish / Cho\'kish</th><th style="padding:8px;border:1px solid #cbd5e1;">Holat</th></tr></thead><tbody>' + rowsHtml + '</tbody></table></body></html>';

    var blob = new Blob(['\ufeff', wordHtml], { type: 'application/msword;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = st.name.replace(/\s+/g, '_') + '_Diagramma_Hisobot.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ============================================================================
  // 100% GENUINE EXCEL EXPORT (.XLSX) FOR FULL CLASS JOURNAL
  // ============================================================================
  EA.exportToExcel = function(cls) {
    if (typeof window.XLSX === 'undefined') {
      alert('Excel kutubxonasi yuklanmoqda... Iltimos bir soniya kuting.');
      return;
    }

    var dates = getJournalDates(cls, EA.viewMode);
    var students = (cls.students || []).slice();

    students.sort(function(a, b) {
      var idA = a.id || a.email || '';
      var idB = b.id || b.email || '';
      var nA = (cls.customStudentNames[idA] || a.name || '').toLowerCase();
      var nB = (cls.customStudentNames[idB] || b.name || '').toLowerCase();
      return nA.localeCompare(nB);
    });

    var wsData = [];

    wsData.push([(cls.name || '1-GURUH') + " - " + (cls.teacherName || 'Ustoz'), "", "DAVOMAT VA AVTOMATIK BAHOLASH JURNALI"]);
    wsData.push(["Sinf kodi: " + (cls.code || ''), "Jadval: " + (cls.schedule || 'har_kuni'), "Eksport sanasi: " + formatDisplayDate(new Date())]);
    wsData.push([]);

    var hRow1 = ["№", "O'quvchi F.I.SH", "Qo'shilgan sana"];
    var hRow2 = ["", "", ""];

    dates.forEach(function(dt) {
      var dKey = formatDateKey(dt);
      var dDisp = formatDisplayDate(dt);
      var isSun = (dt.getDay() === 0);
      var isHol = isSun || (cls.attendance.holidays && cls.attendance.holidays[dKey] === true);
      var lType = isSun ? 'Yakshanba' : (cls.attendance.lessonTypes[dKey] || (isHol ? 'Dam olish' : 'Oddiy'));
      hRow1.push(dDisp + " (" + lType + ")");
      hRow1.push("");
      hRow2.push("D");
      hRow2.push("B");
    });

    hRow1.push("Jami Kelgan (Yashil K)", "Jami Kelmagan (Qizil K)", "Jami Sababli (S)", "Davomat Foizi");
    hRow2.push("", "", "", "");

    wsData.push(hRow1);
    wsData.push(hRow2);

    students.forEach(function(st, sIdx) {
      var stId = st.id || st.email || ('std_' + sIdx);
      var stName = cls.customStudentNames[stId] || st.name || ("O'quvchi " + (sIdx + 1));
      var joinedDisp = formatIsoToDisplay(st.joinedAt || '2026-09-02');

      var row = [sIdx + 1, stName, joinedDisp];
      var presentCount = 0;
      var absentCount = 0;
      var excusedCount = 0;
      var totalLessons = 0;

      dates.forEach(function(dt) {
        var dKey = formatDateKey(dt);
        var isSunday = (dt.getDay() === 0);
        var isHoliday = isSunday || (cls.attendance.holidays && cls.attendance.holidays[dKey] === true);

        if (isHoliday) {
          row.push("Dam olish");
          row.push("-");
        } else {
          totalLessons++;
          var rec = (cls.attendance.records[dKey] && cls.attendance.records[dKey][stId]) || {};
          var status = rec.status || '';
          var score = (rec.score !== undefined && rec.score !== null) ? rec.score : '';

          if (status === 'K' || status === 'present') {
            row.push("K (Kelgan)");
            presentCount++;
          } else if (status === 'Q' || status === 'absent') {
            row.push("K (Kelmagan)");
            absentCount++;
          } else if (status === 'S' || status === 'excused') {
            row.push("S (Sababli)");
            excusedCount++;
          } else {
            row.push("");
          }
          row.push(score);
        }
      });

      var pct = totalLessons > 0 ? Math.round((presentCount / totalLessons) * 100) + "%" : "0%";
      row.push(presentCount, absentCount, excusedCount, pct);

      wsData.push(row);
    });

    var ws = window.XLSX.utils.aoa_to_sheet(wsData);

    var colWidths = [{ wch: 6 }, { wch: 36 }, { wch: 15 }];
    dates.forEach(function() {
      colWidths.push({ wch: 14 });
      colWidths.push({ wch: 6 });
    });
    colWidths.push({ wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 15 });
    ws['!cols'] = colWidths;

    var wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Davomat Jurnali");

    var cleanName = (cls.name || 'Guruh').replace(/[^a-zA-Z0-9_\-]/g, '_');
    var fileName = "Davomat_" + cleanName + "_" + formatDateKey(new Date()) + ".xlsx";
    window.XLSX.writeFile(wb, fileName);
  };

  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Register in EthithViews
  window.EthithViews = window.EthithViews || {};
  window.EthithViews.renderAttendanceView = function(container) {
    EA.render(container);
  };

})(window);
