/**
 * ETHITH ATTENDANCE (DAVOMAT) & JOURNAL SYSTEM
 * Real-time PIIMA / Modme Style Attendance & Grading Portal
 * Fully synced with Classes & Chats, automatic student enrollment,
 * schedule settings (Juft / Toq / Har kuni), 10 past days + 2 future days,
 * full history view ("Umumiy davomat"), 1-click holiday toggling,
 * Sunday red highlight, and 100% genuine Excel (.xlsx) export.
 */

(function(window) {
  'use strict';

  var EA = window.EthithAttendance = window.EthithAttendance || {};

  // Authentic PIIMA demo students if a class has no students yet
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
  EA.viewMode = 'window'; // 'window' (10 past + 2 future) or 'all' (Umumiy davomat - full history)
  EA.editMode = false; // Teacher top "Tahrirlash" mode toggle

  function getActiveUser() {
    return (window.S && window.S.user) || (window.EthithApp && window.EthithApp.state && window.EthithApp.state.user) || {};
  }

  function isTeacherRole() {
    var u = getActiveUser();
    return u && (u.role === 'teacher' || u.role === 'admin' || u.isTeacher === true);
  }

  // Get visible classes for current user (teachers see all their classes / all classes; students see classes they joined or all available)
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
          updatedAt: Date.now()
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

  // Ensure class attendance structure is ready & seed realistic initial records if empty on demo class
  function ensureClassAttendance(cls) {
    if (!cls.attendance) cls.attendance = {};
    if (!cls.attendance.records) cls.attendance.records = {};
    if (!cls.attendance.lessonTypes) cls.attendance.lessonTypes = {};
    if (!cls.attendance.holidays) cls.attendance.holidays = {};
    if (!cls.customStudentNames) cls.customStudentNames = {};
    if (!cls.schedule) cls.schedule = 'har_kuni';
    if (!cls.students) cls.students = [];

    // If this is the default 1-GURUH and has no students, populate demo students
    if ((cls.id === 'cls_1_guruh' || cls.id === 'cls_ethith_main' || cls.name === '1-GURUH') && cls.students.length === 0) {
      cls.students = EA.DEMO_STUDENTS.slice();
    }

    // Ensure every student has a joinedAt date string (YYYY-MM-DD)
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

  // Seed initial PIIMA demo records for past dates relative to device clock (runs once if not yet seeded)
  function seedDemoWindowIfNeeded(cls, dates) {
    if (!cls || !cls.attendance || cls.attendance.seededWindowV2) return;
    if (cls.id !== 'cls_1_guruh' && cls.id !== 'cls_ethith_main' && cls.name !== '1-GURUH') return;

    var todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);

    var stList = cls.students || [];
    if (stList.length === 0) return;

    dates.forEach(function(dt, dIdx) {
      if (dt > todayObj) return; // Leave future 2 days empty
      if (dt.getDay() === 0) return; // Sunday is holiday
      var dKey = formatDateKey(dt);
      if (cls.attendance.holidays && cls.attendance.holidays[dKey]) return;

      // Only seed if this date has no records yet
      if (cls.attendance.records[dKey] && Object.keys(cls.attendance.records[dKey]).length > 0) return;
      cls.attendance.records[dKey] = {};

      // Make one past date a "BSB - Y1" exam day like the PIIMA screenshot
      if (dIdx === dates.length - 5 && !cls.attendance.lessonTypes[dKey]) {
        cls.attendance.lessonTypes[dKey] = 'BSB - Y1';
      }

      var isBsb = (cls.attendance.lessonTypes[dKey] === 'BSB - Y1');

      stList.forEach(function(st, sIdx) {
        var stId = st.id || st.email || ('std_' + sIdx);
        var hash = (dIdx * 7 + sIdx * 13) % 19;
        var status = 'K'; // Present (Green K)
        var score = '';

        if (hash === 3 || hash === 11) {
          status = 'Q'; // Absent (Red K)
        } else if (hash === 7) {
          status = 'S'; // Excused (Yellow S)
        } else {
          if (isBsb) {
            var bsbScores = ['30', '28', '32', '25', '29', '13', '23', '35', '31', '26', '27', '19'];
            score = bsbScores[sIdx % bsbScores.length];
          } else if (hash % 3 === 0) {
            score = '5';
          } else if (hash % 5 === 0) {
            score = '4';
          }
        }

        cls.attendance.records[dKey][stId] = { status: status, score: score };
      });
    });

    cls.attendance.seededWindowV2 = true;
  }

  // Helper: Format Date to DD.MM.YYYY
  function formatDisplayDate(d) {
    var day = String(d.getDate()).padStart(2, '0');
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var year = d.getFullYear();
    return day + '.' + month + '.' + year;
  }

  // Helper: Format YYYY-MM-DD string to DD.MM.YYYY
  function formatIsoToDisplay(isoStr) {
    if (!isoStr) return '02.09.2026';
    var parts = String(isoStr).split('-');
    if (parts.length === 3) {
      return parts[2].slice(0, 2) + '.' + parts[1] + '.' + parts[0];
    }
    return isoStr;
  }

  // Helper: Format Date to YYYY-MM-DD
  function formatDateKey(d) {
    var day = String(d.getDate()).padStart(2, '0');
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var year = d.getFullYear();
    return year + '-' + month + '-' + day;
  }

  // Check if day is lesson day according to class schedule
  // schedule: 'juft' (Tue=2, Thu=4, Sat=6), 'toq' (Mon=1, Wed=3, Fri=5), 'har_kuni' (Mon-Sat: 1..6)
  // Sunday (0) is NEVER a regular lesson day, but is shown as red Sunday column
  function isScheduledLessonDay(dateObj, schedule) {
    var dow = dateObj.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    if (dow === 0) return false; // Sunday is always off/holiday
    if (schedule === 'juft') {
      return dow === 2 || dow === 4 || dow === 6; // Seshanba, Payshanba, Shanba
    } else if (schedule === 'toq') {
      return dow === 1 || dow === 3 || dow === 5; // Dushanba, Chorshanba, Juma
    }
    return true; // har_kuni: Mon through Sat
  }

  // Generate date list:
  // In 'window' mode: past 10 lesson days + today + next 2 lesson days (plus Sundays in between highlighted in red)
  // In 'all' mode ("Umumiy davomat"): all historical dates from class start / earliest record up to next 2 lesson days
  function getJournalDates(cls, viewMode) {
    var schedule = cls.schedule || 'har_kuni';
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find 10 lesson days before today
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
      // Go back at least 30 lesson days or earliest recorded date in cls.attendance.records
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

    // Find 2 lesson days after today
    var futureCount = 0;
    var fCur = new Date(today);
    while (futureCount < 2) {
      fCur.setDate(fCur.getDate() + 1);
      if (isScheduledLessonDay(fCur, schedule)) {
        futureCount++;
      }
    }
    var endDate = new Date(fCur);

    // Collect scheduled lesson days AND Sundays (since user requested: "faqat yakshanba har doim qizil bo'lib boradi")
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

  // Real-time save & broadcast to all connected devices and GitHub store
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

  // Global hook for real-time incoming sync refresh
  window._ethithRefreshAttendance = function() {
    if (window._ethithCurrentView === 'attendance') {
      var container = document.getElementById('apView');
      if (container) {
        var scrollWrap = container.querySelector('.ea-table-scroll-wrap');
        var prevLeft = scrollWrap ? scrollWrap.scrollLeft : null;
        EA.render(container, prevLeft);
      }
    }
  };

  // Main Render Entry Point
  EA.render = function(container, preserveScrollLeft) {
    if (!container) container = document.getElementById('apView');
    if (!container) return;

    window._ethithCurrentView = 'attendance';
    var allClasses = getAvailableClasses();
    var cls = getActiveOrFirstClass();
    ensureClassAttendance(cls);

    if (window.EthithSync && typeof window.EthithSync.subscribeClass === 'function') {
      window.EthithSync.subscribeClass(cls.code || cls.id);
    }

    var isTeacher = isTeacherRole();
    var dates = getJournalDates(cls, EA.viewMode);
    seedDemoWindowIfNeeded(cls, dates);
    var students = (cls.students || []).slice();

    // Sort students alphabetically by display name
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

    var h = '<div class="eth-attendance-wrap" style="max-width:100%;margin:0 auto;padding:8px 12px 80px;font-family:inherit;">';

    // 0. CLASSES & CHATS SYNCED CLASS SELECTOR BAR ("u yerga kirishgand o'sha nomlab ochgan sinflari nomi chiqadi va istalgan sinfga kirsa...")
    h += '<div style="margin-bottom:16px;">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:8px;">' +
        '<div style="font-size:12.5px;font-weight:900;color:var(--muted);text-transform:uppercase;letter-spacing:0.04em;display:flex;align-items:center;gap:6px;">' +
          '<span>🏫 Classes &amp; Chats Sinflari (' + allClasses.length + ' ta):</span>' +
        '</div>' +
        '<button id="eaGoClassesBtn" style="border:1px solid var(--line);background:var(--card);color:#0284c7;border-radius:8px;padding:5px 12px;font-size:12px;font-weight:800;cursor:pointer;">+ Yangi sinf ochish / Guruhga qo\'shilish &rarr;</button>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:10px;overflow-x:auto;padding-bottom:4px;">';

    allClasses.forEach(function(c) {
      var isAct = (c.id === cls.id);
      var stCount = (c.students && c.students.length) ? c.students.length : (c.id === 'cls_1_guruh' ? EA.DEMO_STUDENTS.length : 0);
      h += '<div class="ea-class-card-tab" data-clsid="' + esc(c.id) + '" style="' +
        'cursor:pointer;min-width:200px;padding:10px 14px;border-radius:12px;transition:all 0.15s;' +
        'border:2px solid ' + (isAct ? '#0284c7' : 'var(--line)') + ';' +
        'background:' + (isAct ? 'rgba(2,132,199,0.08)' : 'var(--card)') + ';' +
        'box-shadow:' + (isAct ? '0 4px 12px rgba(2,132,199,0.15)' : '0 2px 6px rgba(0,0,0,0.03)') + ';">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:3px;">' +
          '<b style="font-size:14px;color:' + (isAct ? '#0284c7' : 'var(--text)') + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(c.name || 'Sinf') + '</b>' +
          '<span style="font-size:11px;font-weight:800;padding:2px 6px;border-radius:6px;background:' + (isAct ? '#0284c7' : 'var(--soft)') + ';color:' + (isAct ? '#fff' : 'var(--muted)') + ';">' + stCount + ' o\'quvchi</span>' +
        '</div>' +
        '<div style="font-size:11.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Kod: <b>' + esc(c.code || '') + '</b></div>' +
      '</div>';
    });

    h += '</div></div>';

    // 1. Top Yellow Notification Banner (exact PIIMA style)
    h += '<div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;padding:9px 16px;display:flex;align-items:center;gap:10px;margin-bottom:14px;font-size:12.5px;color:#B45309;font-weight:600;max-width:680px;margin-left:auto;margin-right:auto;box-shadow:0 2px 6px rgba(245,158,11,0.08);">' +
      '<span style="font-size:16px;">ⓘ</span>' +
      '<span>Choraklik baholar chorak yakunidan keyin 5 kun o\'tib hisoblanadi.</span>' +
    '</div>';

    // 2. Class Header & Title (exact PIIMA style)
    h += '<div style="text-align:center;margin-bottom:16px;">' +
      '<h2 style="font-size:23px;font-weight:900;margin:0 0 4px;color:var(--text);letter-spacing:-0.02em;">' +
        '<span style="color:#0284c7;">' + esc(cls.name || '1-GURUH') + '</span> - ' +
        '<span>' + esc(cls.teacherName || 'MAMADIYOROV KARIMJON RABBIMQUL O‘G‘LI') + '</span>' +
      '</h2>' +
      '<div style="font-size:12.5px;color:var(--muted);display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;margin-top:4px;">' +
        '<span>Sinf Kodi: <b style="font-family:monospace;color:#0284c7;background:rgba(2,132,199,0.08);padding:2px 6px;border-radius:4px;">' + esc(cls.code || 'ETH-10GURUH') + '</b></span>' +
        '<span>•</span>' +
        '<span>Tartib: <b style="color:var(--text);">' + currentSchedLabel + '</b></span>' +
        '<span>•</span>' +
        '<span>O\'quvchilar: <b style="color:#10b981;">' + students.length + ' nafar</b></span>' +
      '</div>' +
    '</div>';

    // 3. Top Toolbar: Teacher "Tahrirlash" (Edit Schedule & Student Names) + Excel "Yuklab olish" button
    h += '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:14px;">' +
      '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">';

    if (isTeacher) {
      h += '<button id="eaScheduleBtn" style="background:linear-gradient(135deg,#0284c7,#2563eb);color:#ffffff;border:none;border-radius:10px;padding:8px 16px;font-size:13px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 12px rgba(2,132,199,0.25);">' +
        '✏️ Tahrirlash (' + (cls.schedule === 'juft' ? 'Juft kunlari' : (cls.schedule === 'toq' ? 'Toq kunlari' : 'Har kungi dars')) + ')' +
      '</button>';
    } else {
      h += '<span style="background:var(--soft);color:var(--muted);border:1px solid var(--line);border-radius:10px;padding:7px 14px;font-size:12.5px;font-weight:800;">👁 O\'quvchi rejimi (Faqat ko\'rish)</span>';
    }

    h += '</div>';

    // Right Action: Authentic Green PIIMA Excel Export Button ("Yuklab olish")
    h += '<div style="display:flex;align-items:center;gap:10px;">' +
      '<button id="eaExportExcelBtn" style="background:#40A772;color:#ffffff;border:none;border-radius:10px;padding:9px 20px;font-size:13.5px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:8px;box-shadow:0 4px 14px rgba(64,167,114,0.35);transition:all 0.2s;">' +
        '<span>Yuklab olish</span>' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">' +
          '<path d="M12 3.5H23.5V20.5H12V3.5Z" fill="white"></path>' +
          '<path d="M23.5 21H13.5C13.2236 21 13 20.7764 13 20.5C13 20.2236 13.2236 20 13.5 20H23V4H13.5C13.2236 4 13 3.77637 13 3.5C13 3.22363 13.2236 3 13.5 3H23.5C23.7764 3 24 3.22363 24 3.5V20.5C24 20.7764 23.7764 21 23.5 21Z" fill="white"></path>' +
          '<path opacity="0.2" d="M0 2.6087V2.8587L14 0.25V0L0 2.6087Z" fill="white"></path>' +
          '<path d="M13 5H17V7H13V5Z" fill="#40A772"></path>' +
          '<path d="M18 5H22V7H18V5Z" fill="#40A772"></path>' +
          '<path d="M13 8H17V10H13V8Z" fill="#40A772"></path>' +
          '<path d="M18 8H22V10H18V8Z" fill="#40A772"></path>' +
          '<path d="M13 11H17V13H13V11Z" fill="#40A772"></path>' +
          '<path d="M18 11H22V13H18V11Z" fill="#40A772"></path>' +
          '<path d="M13 14H17V16H13V14Z" fill="#40A772"></path>' +
          '<path d="M18 14H22V16H18V14Z" fill="#40A772"></path>' +
          '<path d="M13 17H17V19H13V17Z" fill="#40A772"></path>' +
          '<path d="M18 17H22V19H18V17Z" fill="#40A772"></path>' +
          '<path d="M14 0L0 2.6087V21.3913L14 24V0Z" fill="white"></path>' +
          '<path opacity="0.1" d="M0 21.3914L14 24.0001V23.7501L0 21.1414V21.3914Z" fill="black"></path>' +
          '<path d="M7.35 12.5L9.65 8.36L7.87 8.47L6.5 10.95L5.22 8.66L3.57 8.78L5.64 12.5L3.57 16.21L5.22 16.33L6.5 14.04L7.87 16.52L9.65 16.63L7.35 12.5Z" fill="#40A772"></path>' +
        '</svg>' +
      '</button>' +
    '</div></div>';

    // 4. THE JOURNAL TABLE CONTAINER (Exact PIIMA Continuous Horizontal Scroll with Sticky Left Cols)
    h += '<div class="ea-table-scroll-wrap" style="position:relative;width:100%;overflow-x:auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,0.05);">';
    h += '<table class="my-table" style="border-collapse:separate;border-spacing:0;width:max-content;min-width:100%;">';

    // TABLE HEADER
    h += '<thead><tr style="background:#f8fafc;">';

    // Sticky Col 1: №
    h += '<th style="position:sticky;left:0;z-index:30;background:#ffffff;width:50px;min-width:50px;padding:8px;border-bottom:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">' +
      '<div style="height:115px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;color:#64748b;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc;">' +
        '№' +
      '</div>' +
    '</th>';

    // Sticky Col 2: O'quvchi F.I.SH
    h += '<th style="position:sticky;left:50px;z-index:30;background:#ffffff;width:250px;min-width:250px;padding:8px;border-bottom:1px solid #e2e8f0;border-right:2px solid #cbd5e1;">' +
      '<div style="height:115px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:14px;font-weight:900;color:#0f172a;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc;padding:0 12px;text-align:center;">' +
        '<span>O’quvchi F.I.SH</span>' +
        (EA.viewMode === 'all' ? '<span style="font-size:10.5px;font-weight:700;color:#0284c7;margin-top:4px;">(Qo\'shilgan sanasi bilan)</span>' : '') +
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
      var lessonType = isSunday ? 'Yakshanba' : (cls.attendance.lessonTypes[dKey] || (isHoliday ? 'Dam olish' : 'Oddiy'));
      var isToday = (dKey === todayKey);

      var cardBg = isHoliday ? '#FFF1F2' : (isToday ? 'rgba(2,132,199,0.08)' : (isFuture ? '#f0fdf4' : '#f8fafc'));
      var cardBorder = isHoliday ? '#FCA5A5' : (isToday ? '#0284c7' : (isFuture ? '#86efac' : '#e2e8f0'));
      var typeColor = isHoliday ? '#DC2626' : (lessonType === 'BSB - Y1' ? '#0284c7' : '#475569');

      h += '<th style="width:136px;min-width:136px;padding:8px 6px;border-bottom:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">' +
        '<div class="ea-date-header-card" data-date="' + dKey + '" data-sunday="' + (isSunday ? '1' : '0') + '" ' +
          'title="' + (isSunday ? 'Yakshanba - Dam olish kuni' : (isTeacher ? '1 marta bosish: Qizil Dam olish kuni qilish / qaytarish' : dDisp)) + '" ' +
          'style="height:115px;border-radius:10px;border:1.5px solid ' + cardBorder + ';background:' + cardBg + ';display:grid;grid-template-columns:1fr 1fr;position:relative;overflow:hidden;cursor:' + (isTeacher && !isSunday ? 'pointer' : 'default') + ';">' +
          // 3 dots / menu button (Teacher only)
          (isTeacher && !isSunday ?
            '<div class="ea-date-opts-btn" data-date="' + dKey + '" data-disp="' + dDisp + '" title="Dars turini tanlash (Oddiy / BSB / CHSB / Dam olish)" style="position:absolute;top:4px;right:5px;cursor:pointer;color:#64748b;font-size:15px;font-weight:900;line-height:1;z-index:5;padding:2px 4px;border-radius:4px;">' +
              '⋮' +
            '</div>' : '') +
          // Top Part (Lesson Type & Date)
          '<div style="grid-column:span 2;padding:6px 8px 4px;border-bottom:1px solid ' + cardBorder + ';text-align:center;">' +
            '<div style="font-size:11px;font-weight:900;color:' + typeColor + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="' + esc(lessonType) + '">' +
              esc(lessonType) +
            '</div>' +
            '<div style="border-top:1px dashed ' + cardBorder + ';margin:4px 0 3px;"></div>' +
            '<div style="font-size:11.5px;font-weight:800;color:' + (isHoliday ? '#DC2626' : (isToday ? '#0284c7' : '#0f172a')) + ';">' +
              dDisp +
            '</div>' +
          '</div>' +
          // Sub-columns: D and B
          '<div style="display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:' + (isHoliday ? '#DC2626' : '#64748b') + ';padding:4px 0;">D</div>' +
          '<div style="display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:' + (isHoliday ? '#DC2626' : '#64748b') + ';padding:4px 0;border-left:1px solid ' + cardBorder + ';">B</div>' +
        '</div>' +
      '</th>';
    });

    h += '</tr></thead>';

    // TABLE BODY
    h += '<tbody>';

    if (students.length === 0) {
      h += '<tr><td colspan="' + (dates.length + 2) + '" style="padding:40px;text-align:center;color:#64748b;font-weight:700;">Bu sinfga hali o\'quvchilar qo\'shilmagan. O\'quvchilar Classes &amp; Chats orqali sinf kodini terib qo\'shilishi bilan shu jadvalda avtomatik paydo bo\'ladi!</td></tr>';
    } else {
      students.forEach(function(st, sIdx) {
        var stId = st.id || st.email || ('std_' + sIdx);
        var stName = cls.customStudentNames[stId] || st.name || ("O'quvchi " + (sIdx + 1));
        var joinedDisp = formatIsoToDisplay(st.joinedAt || '2026-09-02');
        var rowBg = sIdx % 2 === 0 ? '#ffffff' : '#fcfcfd';

        h += '<tr style="background:' + rowBg + ';">';

        // Sticky Col 1: №
        h += '<td style="position:sticky;left:0;z-index:20;background:' + rowBg + ';width:50px;min-width:50px;text-align:center;font-size:13px;font-weight:900;color:#64748b;padding:8px 4px;border-bottom:1px solid #f1f5f9;border-right:1px solid #e2e8f0;">' +
          (sIdx + 1) +
        '</td>';

        // Sticky Col 2: Student Name (+ Join Date in Umumiy Davomat mode or subtitle)
        h += '<td style="position:sticky;left:50px;z-index:20;background:' + rowBg + ';width:250px;min-width:250px;padding:7px 12px;border-bottom:1px solid #f1f5f9;border-right:2px solid #cbd5e1;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">' +
            '<div style="overflow:hidden;">' +
              '<div style="font-size:13px;font-weight:800;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="' + esc(stName) + '">' +
                esc(stName) +
              '</div>' +
              (EA.viewMode === 'all' ?
                '<div style="font-size:10.5px;font-weight:700;color:#0284c7;margin-top:2px;">📅 Qo\'shilgan: ' + esc(joinedDisp) + '</div>' : '') +
            '</div>' +
            (isTeacher ?
              '<button class="ea-edit-student-btn" data-stid="' + esc(stId) + '" data-stname="' + esc(stName) + '" title="O\'quvchi ismini tahrirlash" style="border:none;background:transparent;color:#94a3b8;cursor:pointer;padding:2px 4px;font-size:12px;line-height:1;border-radius:4px;flex-shrink:0;">' +
                '✏️' +
              '</button>' : '') +
          '</div>' +
        '</td>';

        // Date Cells for this Student
        dates.forEach(function(dt) {
          var dKey = formatDateKey(dt);
          var isSunday = (dt.getDay() === 0);
          var isHoliday = isSunday || (cls.attendance.holidays && cls.attendance.holidays[dKey] === true);

          var rec = (cls.attendance.records[dKey] && cls.attendance.records[dKey][stId]) || {};
          var status = rec.status || '';
          var score = (rec.score !== undefined && rec.score !== null) ? rec.score : '';

          // Box Styles for D
          var dBoxStyle = 'height:38px;width:60px;min-width:60px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;border:1px solid #e2e8f0;transition:all 0.15s;user-select:none;';
          var dText = '';

          if (isHoliday) {
            dBoxStyle += 'background:#FFF1F2;color:#DC2626;border-color:#FCA5A5;cursor:not-allowed;';
            dText = '🔒';
          } else if (status === 'K' || status === 'present') {
            dBoxStyle += 'background:#F2FFF3;color:#40A772;border-color:rgba(64,167,114,0.45);cursor:' + (isTeacher ? 'pointer' : 'default') + ';box-shadow:0 1px 3px rgba(64,167,114,0.15);';
            dText = 'K';
          } else if (status === 'Q' || status === 'absent') {
            dBoxStyle += 'background:#FFF1F2;color:#E11D48;border-color:rgba(225,29,72,0.45);cursor:' + (isTeacher ? 'pointer' : 'default') + ';box-shadow:0 1px 3px rgba(225,29,72,0.15);';
            dText = 'K'; // Red K = Kelmagan
          } else if (status === 'S' || status === 'excused') {
            dBoxStyle += 'background:#FFFBEB;color:#D97706;border-color:rgba(217,119,6,0.45);cursor:' + (isTeacher ? 'pointer' : 'default') + ';box-shadow:0 1px 3px rgba(217,119,6,0.15);';
            dText = 'S'; // Yellow S = Sababli
          } else {
            dBoxStyle += 'background:#ffffff;color:#94a3b8;cursor:' + (isTeacher ? 'pointer' : 'default') + ';';
            dText = '';
          }

          // Box Styles for B (Baho / Score)
          var bBoxStyle = 'height:38px;width:60px;min-width:60px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;border:1px solid ' + (isHoliday ? '#FCA5A5' : '#e2e8f0') + ';background:' + (isHoliday ? '#FFF1F2' : '#ffffff') + ';';

          h += '<td style="width:136px;min-width:136px;padding:6px;border-bottom:1px solid #f1f5f9;border-right:1px solid #e2e8f0;">' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;align-items:center;">' +
              // Davomat Box (D)
              '<div class="ea-status-box' + (isTeacher && !isHoliday ? ' is-clickable' : '') + '" ' +
                'data-date="' + dKey + '" data-stid="' + esc(stId) + '" data-cur="' + status + '" ' +
                'style="' + dBoxStyle + '" ' +
                'title="' + (isHoliday ? 'Dam olish kuni' : (isTeacher ? 'Bosish: Yashil K (Kelgan) -> Qizil K (Kelmagan) -> Sariq S (Sababli) -> Bo\'sh' : 'Davomat holati')) + '">' +
                dText +
              '</div>' +
              // Baho Box (B)
              '<div style="' + bBoxStyle + '">' +
                (isTeacher && !isHoliday ?
                  '<input type="text" class="ea-score-input" data-date="' + dKey + '" data-stid="' + esc(stId) + '" ' +
                    'value="' + esc(score) + '" maxlength="3" ' +
                    'placeholder="" ' +
                    'style="width:100%;height:100%;border:none;background:transparent;text-align:center;font-weight:900;font-size:13px;color:#0f172a;outline:none;" />' :
                  '<span style="color:' + (isHoliday ? '#DC2626' : '#0f172a') + ';">' + (isHoliday ? '🔒' : esc(score)) + '</span>') +
              '</div>' +
            '</div>' +
          '</td>';
        });

        h += '</tr>';
      });
    }

    h += '</tbody></table></div>';

    // 5. BOTTOM "UMUMIY DAVOMAT" BUTTON & LEGEND ("pastdan umumiy davomat degan tugma bosilgach qaysi o'quvchi qaysi kuni qo'shildi qo'shilmadi va to'liq ko'satiladi")
    h += '<div style="margin-top:18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 18px;">' +
      '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">' +
        '<button id="eaBottomToggleAllBtn" style="background:' + (EA.viewMode === 'all' ? '#0f172a' : 'linear-gradient(135deg,#0284c7,#2563eb)') + ';color:#ffffff;border:none;border-radius:10px;padding:10px 20px;font-size:13.5px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:8px;box-shadow:0 4px 14px rgba(2,132,199,0.3);">' +
          (EA.viewMode === 'all' ? '🔙 10 Kunlik + Kelasi 2 Kunlik rejimga qaytish' : '📋 Umumiy davomat (Barcha sanalar va qo\'shilgan vaqtlar)') +
        '</button>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;font-size:12.5px;color:var(--muted);">' +
        '<div style="display:inline-flex;align-items:center;gap:6px;"><span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:6px;background:#F2FFF3;border:1px solid #40A772;color:#40A772;font-weight:900;font-size:11px;">K</span> <b>Kelgan</b></div>' +
        '<div style="display:inline-flex;align-items:center;gap:6px;"><span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:6px;background:#FFF1F2;border:1px solid #E11D48;color:#E11D48;font-weight:900;font-size:11px;">K</span> <b>Kelmagan</b></div>' +
        '<div style="display:inline-flex;align-items:center;gap:6px;"><span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:6px;background:#FFFBEB;border:1px solid #D97706;color:#D97706;font-weight:900;font-size:11px;">S</span> <b>Sababli (Javob so\'ragan)</b></div>' +
        '<div style="display:inline-flex;align-items:center;gap:6px;"><span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:6px;background:#FFF1F2;border:1px solid #FCA5A5;color:#DC2626;font-weight:900;font-size:11px;">🔒</span> <b>Dam olish / Yakshanba</b></div>' +
      '</div>' +
    '</div>';

    // Modal container
    h += '<div id="eaModalContainer"></div>';
    h += '</div>';

    container.innerHTML = h;

    // Restore horizontal scroll position (or scroll to latest dates on initial load)
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

  // Event Handling
  EA.attachEvents = function(container, cls) {
    var isTeacher = isTeacherRole();
    var scrollWrap = container.querySelector('.ea-table-scroll-wrap');

    // 0. Switch class via class cards
    container.querySelectorAll('.ea-class-card-tab').forEach(function(tab) {
      tab.onclick = function() {
        EA.activeClassId = tab.dataset.clsid;
        EA.render(container);
      };
    });

    // Go to Classes & Chats button
    var goClsBtn = container.querySelector('#eaGoClassesBtn');
    if (goClsBtn) {
      goClsBtn.onclick = function() {
        if (typeof window.go === 'function') window.go('classes');
      };
    }

    // 1. Bottom "Umumiy davomat" toggle button
    var bottomAllBtn = container.querySelector('#eaBottomToggleAllBtn');
    if (bottomAllBtn) {
      bottomAllBtn.onclick = function() {
        EA.viewMode = (EA.viewMode === 'all' ? 'window' : 'all');
        EA.render(container, 0);
      };
    }

    // 2. Top "Tahrirlash" (Schedule & Settings) Modal (Teacher only)
    var schedBtn = container.querySelector('#eaScheduleBtn');
    if (schedBtn && isTeacher) {
      schedBtn.onclick = function() {
        EA.openScheduleModal(container, cls);
      };
    }

    // 3. Date Options (⋮ button) Modal
    container.querySelectorAll('.ea-date-opts-btn').forEach(function(btn) {
      btn.onclick = function(e) {
        e.stopPropagation();
        var dKey = btn.dataset.date;
        var dDisp = btn.dataset.disp;
        EA.openDateOptsModal(container, cls, dKey, dDisp);
      };
    });

    // 4. Direct 1-click on Date Header Card to toggle red "Dam olish kuni" (Teacher only, non-Sunday)
    if (isTeacher) {
      container.querySelectorAll('.ea-date-header-card').forEach(function(card) {
        card.onclick = function(e) {
          if (e.target.closest('.ea-date-opts-btn')) return;
          if (card.dataset.sunday === '1') return; // Sunday is always red
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

    // 5. Davomat Box (D) Click - Cycle through Yashil K -> Qizil K -> Sariq S -> Empty
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

          persistAttendance(cls);
          EA.render(container, scrollWrap ? scrollWrap.scrollLeft : 0);
        };
      });
    }

    // 6. Score Input (B) change
    if (isTeacher) {
      container.querySelectorAll('.ea-score-input').forEach(function(inp) {
        inp.onchange = function() {
          var dKey = inp.dataset.date;
          var stId = inp.dataset.stid;
          var val = inp.value.trim();

          if (!cls.attendance.records[dKey]) cls.attendance.records[dKey] = {};
          if (!cls.attendance.records[dKey][stId]) cls.attendance.records[dKey][stId] = {};
          cls.attendance.records[dKey][stId].score = val;

          persistAttendance(cls);
        };
      });
    }

    // 7. Edit Student Name (Teacher only)
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

    // 8. Excel Export ("Yuklab olish")
    var exportBtn = container.querySelector('#eaExportExcelBtn');
    if (exportBtn) {
      exportBtn.onclick = function() {
        EA.exportToExcel(cls);
      };
    }
  };

  // Modal: Schedule settings ("Tahrirlash")
  EA.openScheduleModal = function(container, cls) {
    var modalDiv = container.querySelector('#eaModalContainer');
    if (!modalDiv) return;

    var cur = cls.schedule || 'har_kuni';

    var mHtml = '<div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;">' +
      '<div style="background:#fff;border-radius:20px;max-width:450px;width:100%;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.3);">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">' +
          '<h3 style="margin:0;font-size:18px;font-weight:900;color:#0f172a;">✏️ Dars Jadvali Tahrirlash</h3>' +
          '<button id="eaCloseSchedModal" style="border:none;background:transparent;font-size:20px;cursor:pointer;color:#94a3b8;">✕</button>' +
        '</div>' +
        '<p style="font-size:13px;color:#64748b;margin:0 0 16px;line-height:1.5;">' +
          'Guruhingiz dars o\'tadigan kunlarni tanlang. Yakshanba kuni har doim avtomatik qizil dam olish kuni bo\'lib turadi.' +
        '</p>' +
        '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">' +
          '<label style="display:flex;align-items:center;gap:10px;padding:12px;border:1.5px solid ' + (cur === 'har_kuni' ? '#0284c7' : '#e2e8f0') + ';border-radius:12px;cursor:pointer;background:' + (cur === 'har_kuni' ? 'rgba(2,132,199,0.06)' : '#fff') + ';color:#0f172a;">' +
            '<input type="radio" name="eaSchedChoice" value="har_kuni" ' + (cur === 'har_kuni' ? 'checked' : '') + ' />' +
            '<div><b>Har kungi dars</b> (Dushanba – Shanba)</div>' +
          '</label>' +
          '<label style="display:flex;align-items:center;gap:10px;padding:12px;border:1.5px solid ' + (cur === 'juft' ? '#0284c7' : '#e2e8f0') + ';border-radius:12px;cursor:pointer;background:' + (cur === 'juft' ? 'rgba(2,132,199,0.06)' : '#fff') + ';color:#0f172a;">' +
            '<input type="radio" name="eaSchedChoice" value="juft" ' + (cur === 'juft' ? 'checked' : '') + ' />' +
            '<div><b>Juft kunlari</b> (Seshanba, Payshanba, Shanba)</div>' +
          '</label>' +
          '<label style="display:flex;align-items:center;gap:10px;padding:12px;border:1.5px solid ' + (cur === 'toq' ? '#0284c7' : '#e2e8f0') + ';border-radius:12px;cursor:pointer;background:' + (cur === 'toq' ? 'rgba(2,132,199,0.06)' : '#fff') + ';color:#0f172a;">' +
            '<input type="radio" name="eaSchedChoice" value="toq" ' + (cur === 'toq' ? 'checked' : '') + ' />' +
            '<div><b>Toq kunlari</b> (Dushanba, Chorshanba, Juma)</div>' +
          '</label>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
          '<button id="eaSaveSchedBtn" style="background:#0284c7;color:#fff;border:none;border-radius:10px;padding:10px 22px;font-size:13.5px;font-weight:800;cursor:pointer;">Saqlash</button>' +
        '</div>' +
      '</div></div>';

    modalDiv.innerHTML = mHtml;

    modalDiv.querySelector('#eaCloseSchedModal').onclick = function() {
      modalDiv.innerHTML = '';
    };

    modalDiv.querySelector('#eaSaveSchedBtn').onclick = function() {
      var selected = modalDiv.querySelector('input[name="eaSchedChoice"]:checked');
      if (selected) {
        cls.schedule = selected.value;
        persistAttendance(cls);
        modalDiv.innerHTML = '';
        EA.render(container);
      }
    };
  };

  // Modal: Date Options (Lesson Type / Holiday Toggle)
  EA.openDateOptsModal = function(container, cls, dKey, dDisp) {
    var modalDiv = container.querySelector('#eaModalContainer');
    if (!modalDiv) return;

    var isHol = cls.attendance.holidays && cls.attendance.holidays[dKey] === true;
    var curType = cls.attendance.lessonTypes[dKey] || (isHol ? 'Dam olish' : 'Oddiy');

    var mHtml = '<div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;">' +
      '<div style="background:#fff;border-radius:20px;max-width:400px;width:100%;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.3);">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">' +
          '<h3 style="margin:0;font-size:17px;font-weight:900;color:#0f172a;">📅 Sana Sozlamasi: ' + dDisp + '</h3>' +
          '<button id="eaCloseDateModal" style="border:none;background:transparent;font-size:20px;cursor:pointer;color:#94a3b8;">✕</button>' +
        '</div>' +
        '<div style="margin-bottom:16px;">' +
          '<label style="display:block;font-size:12px;font-weight:800;color:#64748b;margin-bottom:6px;">Dars Turi (yoki Dam olish kuni):</label>' +
          '<select id="eaDateTypeSelect" style="width:100%;padding:9px 12px;border-radius:10px;border:1px solid #cbd5e1;font-weight:800;font-size:13px;box-sizing:border-box;color:#0f172a;">' +
            '<option value="Oddiy" ' + (curType === 'Oddiy' ? 'selected' : '') + '>Oddiy dars</option>' +
            '<option value="Dam olish" ' + (curType === 'Dam olish' || isHol ? 'selected' : '') + '>Dam olish kuni (Qizil / Qulf)</option>' +
            '<option value="BSB - Y1" ' + (curType === 'BSB - Y1' ? 'selected' : '') + '>BSB - Y1 (Nazorat ishi)</option>' +
            '<option value="CHSB" ' + (curType === 'CHSB' ? 'selected' : '') + '>CHSB (Choraklik baholash)</option>' +
          '</select>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
          '<button id="eaSaveDateBtn" style="background:#0284c7;color:#fff;border:none;border-radius:10px;padding:9px 18px;font-size:13px;font-weight:800;cursor:pointer;">Tasdiqlash</button>' +
        '</div>' +
      '</div></div>';

    modalDiv.innerHTML = mHtml;

    modalDiv.querySelector('#eaCloseDateModal').onclick = function() {
      modalDiv.innerHTML = '';
    };

    modalDiv.querySelector('#eaSaveDateBtn').onclick = function() {
      var val = modalDiv.querySelector('#eaDateTypeSelect').value;
      cls.attendance.lessonTypes[dKey] = val;
      if (val === 'Dam olish') {
        cls.attendance.holidays[dKey] = true;
      } else {
        delete cls.attendance.holidays[dKey];
      }
      persistAttendance(cls);
      modalDiv.innerHTML = '';
      EA.render(container);
    };
  };

  // Modal: Edit Student Name
  EA.openEditStudentModal = function(container, cls, stId, curName) {
    var modalDiv = container.querySelector('#eaModalContainer');
    if (!modalDiv) return;

    var mHtml = '<div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;">' +
      '<div style="background:#fff;border-radius:20px;max-width:400px;width:100%;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.3);">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">' +
          '<h3 style="margin:0;font-size:17px;font-weight:900;color:#0f172a;">✏️ O\'quvchi Ismini Tahrirlash</h3>' +
          '<button id="eaCloseEditStModal" style="border:none;background:transparent;font-size:20px;cursor:pointer;color:#94a3b8;">✕</button>' +
        '</div>' +
        '<div style="margin-bottom:16px;">' +
          '<label style="display:block;font-size:12px;font-weight:800;color:#64748b;margin-bottom:6px;">F.I.SH (Familiya Ism):</label>' +
          '<input type="text" id="eaNewStName" value="' + esc(curName) + '" style="width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid #cbd5e1;font-weight:800;font-size:13px;box-sizing:border-box;color:#0f172a;" />' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
          '<button id="eaSaveStNameBtn" style="background:#0284c7;color:#fff;border:none;border-radius:10px;padding:9px 18px;font-size:13px;font-weight:800;cursor:pointer;">Saqlash</button>' +
        '</div>' +
      '</div></div>';

    modalDiv.innerHTML = mHtml;

    modalDiv.querySelector('#eaCloseEditStModal').onclick = function() {
      modalDiv.innerHTML = '';
    };

    modalDiv.querySelector('#eaSaveStNameBtn').onclick = function() {
      var n = modalDiv.querySelector('#eaNewStName').value.trim();
      if (n) {
        cls.customStudentNames[stId] = n;
        persistAttendance(cls);
        modalDiv.innerHTML = '';
        EA.render(container);
      }
    };
  };

  // 100% Genuine Excel Export (.xlsx) via SheetJS
  EA.exportToExcel = function(cls) {
    if (typeof window.XLSX === 'undefined') {
      alert('Excel kutubxonasi yuklanmoqda... Iltimos bir soniya kuting.');
      return;
    }

    var dates = getJournalDates(cls, EA.viewMode); // Export active view dates (or all if in Umumiy davomat)
    var students = (cls.students || []).slice();

    students.sort(function(a, b) {
      var idA = a.id || a.email || '';
      var idB = b.id || b.email || '';
      var nA = (cls.customStudentNames[idA] || a.name || '').toLowerCase();
      var nB = (cls.customStudentNames[idB] || b.name || '').toLowerCase();
      return nA.localeCompare(nB);
    });

    var wsData = [];

    // Title Rows
    wsData.push([(cls.name || '1-GURUH') + " - " + (cls.teacherName || 'Ustoz'), "", "DAVOMAT VA BAHOLASH JURNALI"]);
    wsData.push(["Sinf kodi: " + (cls.code || ''), "Jadval: " + (cls.schedule || 'har_kuni'), "Eksport sanasi: " + formatDisplayDate(new Date())]);
    wsData.push([]);

    // Header 1 & Header 2
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

    // Student Rows
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
      colWidths.push({ wch: 13 });
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
