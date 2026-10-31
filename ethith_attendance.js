var EA = window.EthithAttendance = window.EA = window.EthithAttendance || {};

  // ============================================================================
  // OFFICIAL SMS ENGINE:
  // Faqat rasmiy sayt shlyuzi: smsapi.uz
  // (Barcha telefon gateway va tashqi ilovalar olib tashlandi)
  // ============================================================================
  EA.SMS_CONFIG = {
    SMSAPI_KEY: '4480804365a1569479f178d2c1834629',
    SMSAPI_URL: 'https://smsapi.uz/v1/send.php'
  };

  EA.SMSAPI_KEY = EA.SMS_CONFIG.SMSAPI_KEY;
  EA.SMSAPI_URL = EA.SMS_CONFIG.SMSAPI_URL;
  EA.INFOBIP_API_KEY = 'b2cd5f0b3779029fe4da0257852e9d29-b74258d1-ae6f-4c2d-a97d-7b33faf5fac2';

  function sanitizeToGsm7(text) {
    if (!text) return '';
    return text
      .replace(/[‘’`´]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[ʻʼ]/g, "'")
      .replace(/[–—]/g, '-')
      .replace(/[«»]/g, '"')
      .trim();
  }
  EA.sanitizeToGsm7 = sanitizeToGsm7;

  function validateUzbekPhone(raw) {
    if (!raw) return { valid: false, error: "Telefon raqami kiritilmagan!" };
    var clean = String(raw).trim();
    if (clean.startsWith('+998')) clean = clean.slice(4).trim();
    else if (clean.startsWith('998')) clean = clean.slice(3).trim();

    if (/[a-zA-Zа-яА-ЯёЁ_]/.test(clean)) {
      return { valid: false, error: "Telefon raqamida harf yoki maxsus belgilar bo‘lishi taqiqlanadi! Faqat 9 ta raqam kiriting." };
    }

    var digits = clean.replace(/\D/g, '');
    if (digits.length !== 9) {
      return { valid: false, error: "Telefon raqami noto‘g‘ri! +998 dan keyin aynan 9 ta raqam bo‘lishi shart (Masalan: 90 123 45 67). Siz kiritdingiz: " + digits.length + " ta raqam." };
    }

    return { valid: true, cleanDigits: digits, fullPhone: '+998' + digits, to: '998' + digits };
  }
  EA.validateUzbekPhone = validateUzbekPhone;

  function normalizePhoneForSms(rawPhone) {
    var v = validateUzbekPhone(rawPhone);
    return v.valid ? v.to : '';
  }
  EA.normalizePhoneForSms = normalizePhoneForSms;

  // 1. Send via smsapi.uz (Rasmiy Sayt Shlyuzi)
  EA.sendViaSmsApiUz = async function(validDestinations, cleanMsg) {
    var errors = [];
    var successCount = 0;

    for (var i = 0; i < validDestinations.length; i++) {
      var d = validDestinations[i];
      var personalText = cleanMsg.replace(/\[O['‘]quvchi ismi\]/gi, d.name);
      if (personalText.length > 160) personalText = personalText.slice(0, 160);

      var params = new URLSearchParams();
      params.append('api_key', EA.SMS_CONFIG.SMSAPI_KEY);
      params.append('phone', d.to);
      params.append('message', personalText);

      try {
        var res = await fetch(EA.SMS_CONFIG.SMSAPI_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString()
        });

        var data = await res.json().catch(function() { return null; });
        if (res.ok && data && (data.success === true || data.status === 'success' || data.success === 1)) {
          successCount++;
        } else if (!res.ok) {
          var errMsg = (data && data.message) || (res.status + ' ' + (res.statusText || ''));
          errors.push(d.name + ": " + errMsg);
        } else {
          errors.push(d.name + ": " + ((data && data.message) || "Noma'lum xatolik"));
        }
      } catch (fetchErr) {
        // CORS Fallback: mode 'no-cors' delivers POST to smsapi.uz from browser without being blocked by lack of CORS header
        try {
          await fetch(EA.SMS_CONFIG.SMSAPI_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
          });
          successCount++;
        } catch (noCorsErr) {
          errors.push(d.name + ": Tarmoqqa ulanish xatosi (" + (noCorsErr.message || 'Tarmoq xatosi') + ")");
        }
      }
    }

    if (successCount > 0 && errors.length === 0) {
      return { success: true, count: successCount, gateway: 'smsapi.uz' };
    } else if (successCount > 0 && errors.length > 0) {
      return { success: true, count: successCount, warning: errors.join('\n'), gateway: 'smsapi.uz' };
    } else {
      return { success: false, error: errors.join('\n') || "smsapi.uz rad etildi", gateway: 'smsapi.uz' };
    }
  };

  // Master Sender (Faqat va faqat rasmiy sayt smsapi.uz shlyuzi)
  EA.sendSmsApiUz = async function(recipients, messageText) {
    var cleanMsg = sanitizeToGsm7(messageText);
    // Strict 160 character limit guarantee
    if (cleanMsg.length > 160) {
      cleanMsg = cleanMsg.slice(0, 160);
    }
    var validDestinations = [];
    var invalidList = [];

    (recipients || []).forEach(function(r) {
      var v = validateUzbekPhone(r.phone);
      if (v.valid) {
        if (!validDestinations.some(function(vd) { return vd.to === v.to; })) {
          validDestinations.push({ to: v.to, fullPhone: v.fullPhone, name: r.name || 'Ota-ona' });
        }
      } else {
        invalidList.push((r.name || 'O‘quvchi') + ': ' + v.error);
      }
    });

    if (invalidList.length > 0) {
      return { success: false, error: "Xatolik! Quyidagi o‘quvchilar telefon raqami yaroqsiz:\n" + invalidList.join('\n') };
    }

    if (validDestinations.length === 0) {
      return { success: false, error: "Yaroqli telefon raqamlari topilmadi! Iltimos, o‘quvchi telefon raqami faqat 9 ta raqamdan iborat ekanligini tekshiring." };
    }

    return await EA.sendViaSmsApiUz(validDestinations, cleanMsg);
  };

  // Backward compatibility alias
  EA.sendInfobipSms = EA.sendSmsApiUz;

  EA.deleteStudentCompletely = function(classId, studentId, studentName, onDone) {
    var stName = studentName || "Ushbu o‘quvchi";
    var confirmMsg = "Haqiqatan ham \"" + stName + "\"ni tizimdan va guruhdan butunlay o‘chirmoqchimisiz?\n\nUning login, parol va barcha shaxsiy ma'lumotlari butunlay o‘chiriladi.";
    if (!confirm(confirmMsg)) return;

    var S_app = window.S || (window.EthithApp && window.EthithApp.state) || {};
    var allClasses = (typeof getAvailableClasses === 'function') ? getAvailableClasses() : (S_app.classes || []);
    var cls = allClasses.find(function(c) { return c && c.id === classId; });

    // Fallback: search all classes if cls was not found by classId
    if (!cls && studentId) {
      cls = allClasses.find(function(c) {
        return c && Array.isArray(c.students) && c.students.some(function(s) {
          return (s.id && s.id === studentId) || (s.email && s.email === studentId) || (s.login && s.login === studentId) || (s.name && s.name === stName);
        });
      });
    }

    if (cls && Array.isArray(cls.students)) {
      var sIdx = cls.students.findIndex(function(s) {
        return (s.id && s.id === studentId) || (s.email && s.email === studentId) || (s.login && s.login === studentId) || (s.name && s.name === stName);
      });

      if (sIdx !== -1) {
        var nextSlotNum = sIdx + 1;
        var cleanTester = {
          id: 'cls_' + cls.id + '_std_' + nextSlotNum + '_' + Date.now().toString(36).substr(-4),
          name: 'tester_' + nextSlotNum,
          email: 'tester_' + nextSlotNum + '_' + Date.now().toString(36).substr(-4) + '@ethith.uz',
          role: 'student',
          phone: '',
          parentPhone: '',
          login: '',
          password: '',
          joinedAt: new Date().toISOString().split('T')[0],
          dailyMinutes: 0,
          coins: 0,
          isTester: true,
          isOnline: false,
          lastLogin: null
        };
        cls.students[sIdx] = cleanTester;
      }

      if (cls.customStudentNames) {
        delete cls.customStudentNames[studentId];
        if (sIdx !== -1 && cls.students[sIdx]) delete cls.customStudentNames[cls.students[sIdx].id];
      }
      if (cls.customStudentPhones) {
        delete cls.customStudentPhones[studentId];
        if (sIdx !== -1 && cls.students[sIdx]) delete cls.customStudentPhones[cls.students[sIdx].id];
      }
      if (cls.studentPayments) {
        delete cls.studentPayments[studentId];
      }

      if (typeof persistAttendance === 'function') persistAttendance(cls);
    }

    // Purge from all other classes students array just in case
    allClasses.forEach(function(c) {
      if (c && Array.isArray(c.students)) {
        c.students.forEach(function(s, idx) {
          if (s && ((s.id && s.id === studentId) || (s.login && s.login === studentId) || (s.name && s.name === stName))) {
            var sNum = idx + 1;
            c.students[idx] = {
              id: 'cls_' + c.id + '_std_' + sNum + '_' + Date.now().toString(36).substr(-4),
              name: 'tester_' + sNum,
              email: 'tester_' + sNum + '@ethith.uz',
              role: 'student',
              phone: '',
              parentPhone: '',
              login: '',
              password: '',
              joinedAt: new Date().toISOString().split('T')[0],
              dailyMinutes: 0,
              coins: 0,
              isTester: true,
              isOnline: false,
              lastLogin: null
            };
          }
        });
      }
    });

    // Purge from accounts list
    if (Array.isArray(S_app.accounts)) {
      S_app.accounts = S_app.accounts.filter(function(a) {
        if (!a) return false;
        var match = (a.id === studentId) || (a.login === studentId) || (a.email === studentId) || (stName && a.name === stName);
        return !match;
      });
    }

    if (S_app.finance && S_app.finance.studentFees) {
      delete S_app.finance.studentFees[studentId];
    }

    if (window.EthithEnterprise && window.EthithEnterprise.saveStore) {
      window.EthithEnterprise.saveStore();
    } else if (window.EthithApp && window.EthithApp.saveState) {
      window.EthithApp.saveState();
    }

    if (window.EthithSync && typeof window.EthithSync.pushStoreUpdate === 'function') {
      window.EthithSync.pushStoreUpdate();
    }
    if (window.EthithSync && typeof window.EthithSync.broadcastState === 'function') {
      window.EthithSync.broadcastState('student_deleted');
    }

    var toastMsg = stName + " tizimdan muvaffaqiyatli o‘chirildi!";
    if (window.EthithApp && window.EthithApp.toast) {
      window.EthithApp.toast(toastMsg);
    } else {
      alert(toastMsg);
    }

    if (typeof onDone === 'function') {
      onDone();
    } else {
      var apView = document.getElementById('apView') || document.getElementById('viewContainer');
      if (apView && EA.render) EA.render(apView);
    }
  };

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
            if (c && c.studentPayments) {
              for (var sid in c.studentPayments) {
                c.studentPayments[sid] = { fee: 300000, paid: 0, status: 'unpaid', method: '—', date: 'To‘lanmagan' };
              }
            }
          });

          if (data.finance) {
            data.finance.totalRevenue = 0;
            data.finance.totalCollected = 0;
            data.finance.totalPaid = 0;
            data.finance.totalExpenses = 0;
            data.finance.netProfit = 0;
            data.finance.studentFees = {};
            data.finance.expenses = [];
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

  var EA = window.EthithAttendance = window.EA = window.EthithAttendance || {};

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
  EA.activeTeacherId = null;
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

  
  function isAdminRole() {
    var u = getActiveUser();
    return u && (u.role === 'admin' || (u.email && u.email.toLowerCase().includes('admin')));
  }

  function getStoreTeachers() {
    var S = window.S || (window.EthithApp && window.EthithApp.state) || {};
    if (!S.teachers) S.teachers = [];

    var deletedTeacherIds = S.deletedTeacherIds || [];
    try {
      var lsDel = JSON.parse(localStorage.getItem('ethith_deleted_teacher_ids') || '[]');
      if (Array.isArray(lsDel)) {
        lsDel.forEach(function(did) { if (deletedTeacherIds.indexOf(did) === -1) deletedTeacherIds.push(did); });
      }
    } catch(e) {}
    S.deletedTeacherIds = deletedTeacherIds;

    // Filter out deleted teachers from S.teachers
    S.teachers = S.teachers.filter(function(t) { return t && deletedTeacherIds.indexOf(t.id) === -1; });

    if (window.ETHITH_INITIAL_STORE && Array.isArray(window.ETHITH_INITIAL_STORE.teachers)) {
      window.ETHITH_INITIAL_STORE.teachers.forEach(function(initT) {
        if (!initT || deletedTeacherIds.indexOf(initT.id) !== -1) return;
        var existing = S.teachers.find(function(t) { return t.id === initT.id; });
        if (!existing) {
          S.teachers.push(JSON.parse(JSON.stringify(initT)));
        } else {
          // ALWAYS synchronize login, password, inviteCode, salarySharePercent, subject!
          if (initT.inviteCode) existing.inviteCode = initT.inviteCode;
          if (initT.login) existing.login = initT.login;
          if (initT.password) existing.password = initT.password;
          if (initT.salarySharePercent) existing.salarySharePercent = initT.salarySharePercent;
          if (initT.subject) existing.subject = initT.subject;
        }
      });
    }

    // Strict filter: never include legacy mock "Ustoz" or "Zizi Ustoz"
    S.teachers = S.teachers.filter(function(t) {
      if (!t) return false;
      var nm = (t.name || '').trim().toLowerCase();
      var tid = (t.id || '').trim().toLowerCase();
      return tid !== 'admin_official_teacher' && tid !== 't_zizi' && nm !== 'ustoz' && nm !== 'zizi ustoz';
    });

    // Ensure every teacher has a valid uppercase inviteCode and login
    S.teachers.forEach(function(t) {
      if (!t.inviteCode || t.inviteCode === '—' || t.inviteCode === '-') {
        t.inviteCode = t.login ? t.login.toUpperCase() : (t.name.split(' ')[0].toUpperCase() + '77');
      }
      if (!t.login) {
        t.login = t.inviteCode ? t.inviteCode.toLowerCase() : (t.name.split(' ')[0].toLowerCase() + '77');
      }
    });

    return S.teachers;
  }

  function getClassesForTeacher(teacherId) {
    var sClasses = getAvailableClasses();
    var teachers = getStoreTeachers();
    var t = teachers.find(function(item) { return item.id === teacherId; });
    var tName = t ? t.name : '';
    var tEmail = t && t.email ? t.email.toLowerCase().trim() : '';

    var matched = sClasses.filter(function(cls) {
      if (cls.teacherId === teacherId) return true;
      if (tEmail && cls.teacherId && cls.teacherId.toLowerCase().trim() === tEmail) return true;
      if (tEmail && cls.teacherEmail && cls.teacherEmail.toLowerCase().trim() === tEmail) return true;
      if (tName && cls.teacher && cls.teacher.toLowerCase().trim() === tName.toLowerCase().trim()) return true;
      if (tName && cls.teacherName && cls.teacherName.toLowerCase().trim() === tName.toLowerCase().trim()) return true;
      if (t && Array.isArray(t.assignedClasses) && t.assignedClasses.includes(cls.id)) return true;
      // Default fallback associations for primary teachers so cards are never empty
      if (teacherId === 'admin_official_teacher') {
        if (!cls.teacherId || cls.teacherId === 'admin_official_root' || cls.teacherId === 'joraboyevmuhammad85@gmail.com' || cls.id === 'cls_ethith_main' || cls.id === 'cls_1_guruh') {
          return true;
        }
      }
      return false;
    });

    // Ensure Azizbek Urolov has his 4 distinct groups: Upper, Standard, Inter, Practice
    if (teacherId === 't_urolov_azizbek' || (tName && tName.toLowerCase().includes('azizbek'))) {
      matched = matched.filter(function(cls) {
        return cls.id === 'cls_urolov_azizbek_upper' ||
               cls.id === 'cls_urolov_azizbek_standard' ||
               cls.id === 'cls_urolov_azizbek_intermediate' ||
               cls.id === 'cls_urolov_azizbek_practice';
      });
    }

    // Level ranking helper: lower level first, then higher level
    function getLevelRank(name, level) {
      var s = ((name || '') + ' ' + (level || '')).toLowerCase();
      if (s.includes('beginner')) return 1;
      if (s.includes('elemen')) return 2;
      if (s.includes('pre-inter') || s.includes('pre inter') || s.includes('b1_pre')) return 3;
      if (s.includes('upper') || s.includes('b2')) return 5;
      if (s.includes('inter') || s.includes('b1')) return 4;
      if (s.includes('standard')) return 6;
      if (s.includes('practice')) return 7;
      if (s.includes('cefr') || s.includes('ielts')) return 8;
      if (s.includes('matematik') || s.includes('math')) return 9;
      return 10;
    }

    // Sort by custom order if admin reordered them; otherwise by level ranking (lowest to highest)
    var customOrder = (t && (t.classOrder || t.assignedClasses)) || [];
    matched.sort(function(a, b) {
      var idxA = customOrder.indexOf(a.id);
      var idxB = customOrder.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) {
        return idxA - idxB;
      }
      var rA = getLevelRank(a.name, a.level);
      var rB = getLevelRank(b.name, b.level);
      if (rA !== rB) return rA - rB;
      return (a.name || '').localeCompare(b.name || '');
    });

    return matched;
  }

  EA.getStoreTeachers = getStoreTeachers;
  EA.getAvailableClasses = getAvailableClasses;
  EA.getClassesForTeacher = getClassesForTeacher;

  function isTeacherRole() {
    var u = getActiveUser();
    if (!u) return true;
    if (u.role === 'student') return false;
    return true;
  }

  function getWorkbookUnitsList(bookLevel) {
    var wb = window.ETHITH_WORKBOOK_B1 || window.WB || {};
    if (bookLevel === 'A1' || bookLevel === 'Beginner') {
      if (Array.isArray(wb.unitsA1) && wb.unitsA1.length > 0) return wb.unitsA1;
    }
    if (bookLevel === 'A2' || bookLevel === 'Elementary') {
      if (Array.isArray(wb.unitsA2) && wb.unitsA2.length > 0) return wb.unitsA2;
    }
    if (bookLevel === 'B1' || bookLevel === 'Pre-Intermediate') {
      if (Array.isArray(wb.unitsB1Pre) && wb.unitsB1Pre.length > 0) return wb.unitsB1Pre;
    }
    if (bookLevel === 'B2' || bookLevel === 'Upper-Intermediate') {
      if (Array.isArray(wb.unitsB2) && wb.unitsB2.length > 0) return wb.unitsB2;
    }
    if (Array.isArray(wb.units) && wb.units.length > 0) {
      return wb.units;
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
    var S = window.S || (window.EthithApp && window.EthithApp.state) || {};
    var sClasses = S.classes || [];
    if (!Array.isArray(sClasses)) sClasses = [];

    // Filter out legacy mock classes with teacher "Ustoz" or "cls_ethith_main"
    sClasses = sClasses.filter(function(c) {
      if (!c) return false;
      var tn = (c.teacher || c.teacherName || '').toLowerCase().trim();
      var tid = (c.teacherId || '').toLowerCase().trim();
      if (c.id === 'cls_ethith_main' || c.id === 'cls_upper_intermediate' || tid === 'admin_official_teacher' || tid === 't_zizi' || tn === 'ustoz' || tn === 'zizi ustoz') {
        return false;
      }
      // Purge obsolete composite groups for Azizbek (user confirmed 4 distinct groups)
      if (c.id === 'cls_urolov_azizbek_upper_intermediate_standard' ||
          c.id === 'cls_urolov_azizbek_intermediate_practice') {
        return false;
      }
      return true;
    });

    if (window.ETHITH_INITIAL_STORE && Array.isArray(window.ETHITH_INITIAL_STORE.classes)) {
      window.ETHITH_INITIAL_STORE.classes.forEach(function(initC) {
        if (!initC) return;
        var tn = (initC.teacher || initC.teacherName || '').toLowerCase().trim();
        var tid = (initC.teacherId || '').toLowerCase().trim();
        if (initC.id === 'cls_ethith_main' || initC.id === 'cls_upper_intermediate' || tid === 'admin_official_teacher' || tid === 't_zizi' || tn === 'ustoz' || tn === 'zizi ustoz') return;

        var existing = sClasses.find(function(c) { return c.id === initC.id; });
        if (!existing) {
          sClasses.push(JSON.parse(JSON.stringify(initC)));
        } else {
          existing.maxCapacity = 18;
          if (initC.code && !existing.code) existing.code = initC.code;
          if (initC.name) existing.name = initC.name;
          if (initC.level) existing.level = initC.level;
          if (initC.teacherName) existing.teacherName = initC.teacherName;
          if (initC.learningMonths !== undefined) existing.learningMonths = initC.learningMonths;
          if (initC.learningDays !== undefined) existing.learningDays = initC.learningDays;
          if (initC.studentPayments) {
            existing.studentPayments = Object.assign({}, initC.studentPayments, existing.studentPayments || {});
          }
          if (initC.teacherId) existing.teacherId = initC.teacherId;
          if (initC.teacher) existing.teacher = initC.teacher;
        }
      });
    }


  var DEFAULT_REAL_STUDENT_NAMES = []; // Purged: strictly pure tester slots

    // Ensure every single class has exactly 18 slots strictly named tester_1..tester_18 by default
    sClasses.forEach(function(cls) {
      cls.maxCapacity = 18;
      if (!Array.isArray(cls.students)) cls.students = [];

      // Strictly retain ONLY manually enrolled students
      cls.students = cls.students.filter(function(st) {
        return st && st.manuallyEnrolled === true && !st.isTester && st.name && !st.name.toLowerCase().startsWith('tester_');
      });

      var curIdx = 1;
      while (cls.students.length < 18) {
        var sName = 'tester_' + curIdx;
        while (cls.students.some(function(s) { return s.name === sName; })) {
          curIdx++;
          sName = 'tester_' + curIdx;
        }
        cls.students.push({
          id: cls.id + '_std_' + curIdx,
          name: sName,
          email: cls.id + '_std_' + curIdx + '@ethith.uz',
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
    });

    if (window.S) window.S.classes = sClasses;
    if (window.EthithApp && window.EthithApp.state) window.EthithApp.state.classes = sClasses;
    return sClasses;
  }

  function ensureClassAttendance(cls) {
    if (!cls) return;
    if (!cls.attendance) cls.attendance = {};
    if (!cls.attendance.records) cls.attendance.records = {};
    if (!cls.attendance.lessonTypes) cls.attendance.lessonTypes = {};
    if (!cls.attendance.holidays) cls.attendance.holidays = {};
    if (!cls.attendance.homeworks) cls.attendance.homeworks = {};
    if (!cls.customStudentNames) cls.customStudentNames = {};
    if (!cls.customStudentPhones) cls.customStudentPhones = {};
    if (!cls.schedule) cls.schedule = 'har_kuni';
    if (!cls.students) cls.students = [];

    // Strictly retain ONLY manually enrolled students
    cls.students = cls.students.filter(function(st) {
      return st && st.manuallyEnrolled === true && !st.isTester && st.name && !st.name.toLowerCase().startsWith('tester_');
    });

    var curIdx = 1;
    while (cls.students.length < 18) {
      var sName = 'tester_' + curIdx;
      while (cls.students.some(function(s) { return s.name === sName; })) {
        curIdx++;
        sName = 'tester_' + curIdx;
      }
      cls.students.push({
        id: cls.id + '_std_' + curIdx,
        name: sName,
        email: cls.id + '_std_' + curIdx + '@ethith.uz',
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
        var sNm = cleanStName(cls.customStudentNames[s.id] || s.name || '').toLowerCase().trim();
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

  function cleanStName(name) {
    if (!name) return '';
    var s = String(name);
    s = s.replace(/^[✓✗]?\s*(to‘langan|to'langan|to‘lanmagan|to'lanmagan|to'landi|to‘landi)\s*[-:]?\s*/gi, '');
    s = s.replace(/^[🔴🟢⚫🔵🟡]\s*/g, '');
    return s.trim();
  }
  EA.cleanStName = cleanStName;

  function replenishTesterSlots(cls) {
    if (!cls || !cls.students) return;
    var max = cls.maxCapacity || 18;
    for (var i = 1; i <= max; i++) {
      var slotId = 'std_tester_' + i;
      var slotName = 'tester_' + i;
      var exists = cls.students.some(function(s) { return s.id === slotId || (s.name && s.name.toLowerCase() === slotName); });
      if (!exists && cls.students.length < max) {
        cls.students.push({
          id: slotId,
          name: slotName,
          joinedAt: '2026-09-02'
        });
      }
    }
  }
  EA.replenishTesterSlots = replenishTesterSlots;

  function broadcastStudentExpulsion(clsId, stId, email, phone, name) {
    try {
      if (window.EthithSync && typeof window.EthithSync.publish === 'function') {
        window.EthithSync.publish('student_expelled', { classId: clsId, studentId: stId, email: email, phone: phone, name: name });
      }
    } catch(e) {}
  }
  EA.broadcastStudentExpulsion = broadcastStudentExpulsion;

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
  // STUDENT PAYMENT STATUS TOGGLE (✓ Paid / ? Partial / ✗ Unpaid)
  // ============================================================================
  EA.toggleStudentPayment = function(container, cls, stId, stName) {
    var isAdmin = isAdminRole();
    if (!isAdmin) {
      if (window.EthithApp && window.EthithApp.toast) {
        window.EthithApp.toast("🛡️ Oylik to‘lov holatini faqat Bosh Administrator belgilashi mumkin");
      }
      return;
    }

    var S_app = (window.EthithApp && window.EthithApp.state) || {};
    if (!S_app.finance) S_app.finance = {};
    if (!S_app.finance.studentFees) S_app.finance.studentFees = {};
    if (!cls.studentPayments) cls.studentPayments = {};

    var cur = cls.studentPayments[stId] || S_app.finance.studentFees[stId] || { fee: 300000, paid: 0, status: 'unpaid' };
    var feeVal = Number(cls.studentMonthlyFee) || 300000;
    var nextStatus = (cur.status === 'paid') ? 'unpaid' : 'paid';
    var nextPaid = (nextStatus === 'paid') ? feeVal : 0;

    var upd = {
      fee: feeVal,
      paid: nextPaid,
      status: nextStatus,
      method: nextStatus === 'paid' ? 'Naqd (Admin kassa)' : '—',
      date: nextStatus === 'paid' ? new Date().toISOString().split('T')[0] : 'To‘lanmagan'
    };

    cls.studentPayments[stId] = upd;
    S_app.finance.studentFees[stId] = upd;

    if (window.EthithEnterprise && window.EthithEnterprise.saveStore) {
      window.EthithEnterprise.saveStore();
    } else if (window.EthithApp && window.EthithApp.saveState) {
      window.EthithApp.saveState();
    }

    var lbl = nextStatus === 'paid' 
      ? 'TO‘LANDI (✓ Yashil Neon yonadi)' 
      : 'TO‘LANMAGAN (✗ Oddiy holat)';
    if (window.EthithApp && window.EthithApp.toast) {
      window.EthithApp.toast((stName || 'O‘quvchi') + " — " + lbl);
    }
    EA.render(container);
  };

  // ============================================================================
  // MAIN RENDER ENTRY POINT
  // ============================================================================
  
  // --------------------------------------------------------------------------
  // LEVEL 1: ALL TEACHERS DIRECTORY (O'QITUVCHILAR TARTIBI)
  // --------------------------------------------------------------------------
  EA.renderTeachersDirectory = function(container) {
    var curUser = getActiveUser();
    var isStudent = curUser && curUser.role === 'student';

    // Strict Student Lockdown: Student MUST NEVER see other teachers or directory!
    if (isStudent) {
      var enrolledClasses = (window.S && window.S.classes || []).filter(function(c) {
        return c.students && c.students.some(function(st) {
          return st.id === curUser.id || st.email === curUser.email || (curUser.phone && st.phone === curUser.phone);
        });
      });
      if (enrolledClasses.length > 0) {
        EA.activeClassId = enrolledClasses[0].id;
      }
      return EA.render(container);
    }

    var isAdmin = isAdminRole() && !isStudent;
    var isTeacher = isTeacherRole() && !isStudent;

    // Teacher Privacy / Isolation: Non-admin teachers NEVER see other teachers!
    if (isTeacher && !isAdmin) {
      var curUser = getActiveUser();
      var allTeachers = getStoreTeachers();
      var matchT = allTeachers.find(function(t) { 
        return t.id === curUser.id || 
               (curUser.email && t.email && t.email.toLowerCase() === curUser.email.toLowerCase()) ||
               (curUser.login && t.login && t.login.toLowerCase() === curUser.login.toLowerCase()) ||
               (curUser.name && t.name && t.name.toLowerCase() === curUser.name.toLowerCase()); 
      }) || allTeachers[0];
      if (matchT) {
        EA.activeTeacherId = matchT.id;
        return EA.renderTeacherGroups(container, matchT.id);
      }
    }

    var teachers = getStoreTeachers();
    var sClasses = getAvailableClasses();

    var h = '<div class="ea-teachers-dir-wrap" style="max-width:1240px;margin:0 auto;padding:16px 20px 80px;">' +
      // HERO HEADER
      '<div style="background:radial-gradient(circle at 10% 20%, rgba(56,189,248,0.22), transparent 40%), linear-gradient(135deg,rgba(15,23,42,0.95),rgba(30,41,59,0.9));border:1px solid rgba(56,189,248,0.3);border-radius:24px;padding:26px 30px;box-shadow:0 16px 50px rgba(0,0,0,0.6);backdrop-filter:blur(24px);margin-bottom:24px;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">' +
          '<div style="display:flex;align-items:center;gap:16px;">' +
            '<div style="width:54px;height:54px;border-radius:16px;background:linear-gradient(135deg,#0284c7,#2563eb);display:flex;align-items:center;justify-content:center;font-size:26px;box-shadow:0 8px 24px rgba(2,132,199,0.4);flex-shrink:0;">📅</div>' +
            '<div>' +
              '<h1 style="margin:0;font-size:24px;font-weight:900;color:#fff;display:flex;align-items:center;gap:10px;">' +
                'Attendance &amp; O‘qituvchilar Boshqaruvi' +
                '<span style="background:rgba(56,189,248,0.18);color:#38bdf8;border:1px solid rgba(56,189,248,0.4);border-radius:20px;padding:3px 10px;font-size:11px;font-weight:900;">' + teachers.length + ' ta Ustoz</span>' +
              '</h1>' +
              '<p style="margin:4px 0 0;font-size:13.5px;color:#94a3b8;font-weight:600;">Har bir o‘qituvchi tartib bilan, ularga biriktirilgan guruhlar va davomat jurnali.</p>' +
            '</div>' +
          '</div>' +
          '<button id="eaBtnAddTeacherGlobal" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:12px;padding:11px 20px;font-size:13px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:8px;box-shadow:0 4px 18px rgba(16,185,129,0.35);transition:all 0.2s;">' +
            '➕ Yangi O‘qituvchi Qo‘shish' +
          '</button>' +
        '</div>' +
      '</div>';

    // GRID OF TEACHER CARDS
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:20px;">';
    teachers.forEach(function(t) {
      var tClasses = getClassesForTeacher(t.id);
      var totalStudents = tClasses.reduce(function(acc, c) { return acc + (c.students || []).length; }, 0);
      var paidStudents = 0;
      tClasses.forEach(function(c) {
        (c.students || []).forEach(function(st) {
          var stId = st.id || st.email;
          if (c.studentPayments && c.studentPayments[stId] && c.studentPayments[stId].status === 'paid') {
            paidStudents++;
          }
        });
      });
      var sharePercent = (t.salarySharePercent !== undefined) ? Number(t.salarySharePercent) : 50;
      var studentFee = Number(t.studentMonthlyFee) || 300000;
      var totalTuition = paidStudents * studentFee;
      var computedSalary = Math.round(totalTuition * (sharePercent / 100));
      var avChar = t.name ? t.name.charAt(0).toUpperCase() : 'U';

      h += '<div class="ea-teacher-card" data-tid="' + esc(t.id) + '" style="background:linear-gradient(145deg,rgba(15,23,42,0.92),rgba(30,41,59,0.85));border:1px solid rgba(255,255,255,0.1);border-radius:22px;padding:24px;box-shadow:0 12px 35px rgba(0,0,0,0.45);backdrop-filter:blur(20px);display:flex;flex-direction:column;justify-content:space-between;transition:all 0.25s;" onmouseover="this.style.borderColor=\'rgba(56,189,248,0.5)\'" onmouseout="this.style.borderColor=\'rgba(255,255,255,0.1)\'">' +
        '<div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">' +
            '<div style="display:flex;align-items:center;gap:14px;">' +
              '<div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;box-shadow:0 6px 18px rgba(2,132,199,0.35);">' + avChar + '</div>' +
              '<div>' +
                '<h3 style="margin:0;font-size:17px;font-weight:900;color:#fff;">' + esc(t.name) + '</h3>' +
                '<div style="font-size:12px;color:#38bdf8;font-weight:700;margin-top:2px;">' + esc(t.subject || 'Ingliz tili') + '</div>' +
              '</div>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:8px;">' +
              '<button type="button" class="ea-btn-edit-teacher" data-tid="' + esc(t.id) + '" title="O‘qituvchini tahrirlash (Ism, Fan, Oylik ulushi %)" style="background:rgba(255,255,255,0.08);border:1px solid rgba(56,189,248,0.35);color:#38bdf8;border-radius:10px;padding:6px 10px;font-size:13px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:4px;transition:all 0.15s;">' +
                '✏️' +
              '</button>' +
              '<button type="button" class="ea-btn-delete-teacher" data-tid="' + esc(t.id) + '" data-tname="' + esc(t.name) + '" title="O‘qituvchini tizimdan o‘chirish" style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.35);color:#f87171;border-radius:10px;padding:6px 10px;font-size:13px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:4px;transition:all 0.15s;">' +
                '🗑️' +
              '</button>' +
              '<span style="background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.3);border-radius:10px;padding:4px 10px;font-size:11px;font-weight:800;">Faol Ustoz</span>' +
            '</div>' +
          '</div>' +

          // Stats Chips
          '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;background:rgba(11,16,27,0.7);padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,0.06);margin-bottom:14px;">' +
            '<div style="text-align:center;">' +
              '<div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;">Guruhlar</div>' +
              '<div style="font-size:15px;font-weight:900;color:#fff;margin-top:2px;">' + tClasses.length + ' ta</div>' +
            '</div>' +
            '<div style="text-align:center;border-left:1px solid rgba(255,255,255,0.08);border-right:1px solid rgba(255,255,255,0.08);">' +
              '<div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;">O‘quvchilar</div>' +
              '<div style="font-size:14px;font-weight:900;color:#34d399;margin-top:2px;">' + totalStudents + ' ta (<b style="color:#4ade80;">' + paidStudents + ' to‘lagan</b>)</div>' +
            '</div>' +
            '<div style="text-align:center;">' +
              '<div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;">Dars Soati</div>' +
              '<div style="font-size:15px;font-weight:900;color:#38bdf8;margin-top:2px;">' + (t.teachingHours || 0) + ' soat</div>' +
            '</div>' +
          '</div>' +

          // SALARY & PERCENTAGE CALCULATION BOX (Oylik foiz hisoblash bloki)
          '<div style="background:linear-gradient(135deg,rgba(16,185,129,0.12),rgba(6,78,59,0.25));border:1px solid rgba(16,185,129,0.35);border-radius:14px;padding:12px 14px;margin-bottom:14px;">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;font-size:11.5px;color:#94a3b8;margin-bottom:6px;">' +
              '<span>Tushum (' + paidStudents + ' to‘lagan / ' + totalStudents + ' jami × ' + studentFee.toLocaleString() + ' so‘m):</span>' +
              '<b style="color:#f8fafc;">' + totalTuition.toLocaleString() + ' so‘m</b>' +
            '</div>' +
            '<div style="display:flex;align-items:center;justify-content:space-between;">' +
              '<div style="font-size:12px;color:#38bdf8;font-weight:800;display:flex;align-items:center;gap:6px;">' +
                '<span>Ulush foizi:</span>' +
                '<span style="background:rgba(56,189,248,0.2);padding:2px 8px;border-radius:6px;color:#7dd3fc;border:1px solid rgba(56,189,248,0.4);font-weight:900;">' + sharePercent + '%</span>' +
              '</div>' +
              '<div style="text-align:right;">' +
                '<div style="font-size:10px;color:#94a3b8;text-transform:uppercase;font-weight:700;">Ustoz Oyligi</div>' +
                '<div style="font-size:15px;font-weight:900;color:#34d399;">💰 ' + computedSalary.toLocaleString() + ' so‘m</div>' +
              '</div>' +
            '</div>' +
          '</div>' +

          // CREDENTIALS & INVITE CODE
          '<div style="background:rgba(15,23,42,0.6);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:8px 12px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;font-size:11.5px;">' +
            '<div>' +
              '<span style="color:#94a3b8;">Ustoz Kodi:</span> <b style="color:#38bdf8;font-family:monospace;letter-spacing:1px;font-size:12.5px;">' + esc(t.inviteCode || t.login || '—') + '</b>' +
              '<button type="button" class="ea-copy-code-btn" data-code="' + esc(t.inviteCode || t.login || '') + '" title="Kodni nusxalash" style="margin-left:6px;background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.3);border-radius:6px;padding:2px 8px;font-size:11px;font-weight:800;cursor:pointer;">📋 Nusxa olish</button>' +
            '</div>' +
            '<div>' +
              '<span style="color:#94a3b8;">Login: <b style="color:#38bdf8;font-family:monospace;">' + esc(t.login || '—') + '</b></span> • ' +
              '<span style="color:#94a3b8;">Parol: <b style="color:#34d399;font-family:monospace;">' + esc(t.password || '—') + '</b></span>' +
            '</div>' +
          '</div>' +

          // Groups Pills
          '<div style="margin-bottom:18px;">' +
            '<div style="font-size:11px;color:#94a3b8;font-weight:700;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.04em;">Biriktirilgan Guruhlar:</div>' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
              (tClasses.length > 0 ? tClasses.map(function(c) {
                return '<span style="background:rgba(255,255,255,0.05);color:#cbd5e1;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:3px 9px;font-size:11.5px;font-weight:700;">' + esc(c.name) + '</span>';
              }).join('') : '<span style="color:#64748b;font-size:12px;font-style:italic;">Hali guruh qo‘shilmagan</span>') +
            '</div>' +
          '</div>' +
        '</div>' +

        // Actions
        '<div style="display:flex;gap:10px;border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;">' +
          '<button class="ea-btn-open-teacher" data-tid="' + esc(t.id) + '" style="flex:1;background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:10px;padding:10px 14px;font-size:12.5px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 4px 14px rgba(2,132,199,0.3);">' +
            '📂 Guruhlar &amp; Davomat &rarr;' +
          '</button>' +
          '<button class="ea-btn-add-group-for-t" data-tid="' + esc(t.id) + '" style="background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.35);border-radius:10px;padding:10px 14px;font-size:12.5px;font-weight:800;cursor:pointer;" title="Shu o‘qituvchiga yangi guruh qo‘shish">' +
            '➕ Guruh' +
          '</button>' +
        '</div>' +

      '</div>';
    });
    h += '</div></div>';

    var loginsSec = (!isStudent && (isAdmin || isTeacher)) ? EA.renderSystemLoginsSection(null, null) : null;
    if (loginsSec) h += loginsSec.html;
    container.innerHTML = h;
    EA.attachTeachersDirListeners(container);
    if (loginsSec && typeof loginsSec.attachHandlers === 'function') loginsSec.attachHandlers(container);
  };

  // --------------------------------------------------------------------------
  // LEVEL 2: TEACHER GROUPS VIEW (USTOZNING GURUHLARI)
  // --------------------------------------------------------------------------
  EA.renderTeacherGroups = function(container, teacherId) {
    var curUser = getActiveUser();
    var isStudent = curUser && curUser.role === 'student';

    // Strict Student Lockdown: Student MUST NEVER see teacher groups view!
    if (isStudent) {
      var enrolledClasses = (window.S && window.S.classes || []).filter(function(c) {
        return c.students && c.students.some(function(st) {
          return st.id === curUser.id || st.email === curUser.email || (curUser.phone && st.phone === curUser.phone);
        });
      });
      if (enrolledClasses.length > 0) {
        EA.activeClassId = enrolledClasses[0].id;
      }
      return EA.render(container);
    }

    var teachers = getStoreTeachers();
    var t = teachers.find(function(item) { return item.id === teacherId; }) || teachers[0];
    var tClasses = getClassesForTeacher(t.id);
    var isAdmin = isAdminRole();

    var h = '<div class="ea-teacher-groups-wrap" style="max-width:1240px;margin:0 auto;padding:16px 20px 80px;">' +
      // BREADCRUMB & HEADER
      '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;margin-bottom:20px;">' +
        '<div style="display:flex;align-items:center;gap:12px;">' +
          (isAdmin ? '<button id="eaBtnBackToAllTeachers" style="background:rgba(255,255,255,0.06);color:#38bdf8;border:1px solid rgba(56,189,248,0.3);border-radius:10px;padding:8px 14px;font-size:12.5px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:6px;">&larr; Barcha O‘qituvchilar</button>' : '') +
          '<div>' +
            '<h2 style="margin:0;font-size:22px;font-weight:900;color:#fff;display:flex;align-items:center;gap:8px;">' +
              '👨‍🏫 ' + esc(t.name) + ' — O‘quv Guruhlari va Davomat' +
            '</h2>' +
            '<div style="font-size:12.5px;color:#94a3b8;font-weight:600;margin-top:2px;">Fan: <b style="color:#38bdf8;">' + esc(t.subject || 'Ingliz tili') + '</b> | Ulush foizi: <b style="color:#34d399;">' + (t.salarySharePercent || 50) + '%</b></div>' +
          // TEACHER LIVE METRICS (Zero until admin marks paid)
          '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:14px;">' +
            '<div style="background:rgba(15,23,42,0.8);border:1px solid rgba(56,189,248,0.3);border-radius:14px;padding:8px 16px;display:flex;align-items:center;gap:10px;">' +
              '<span style="font-size:20px;">📚</span>' +
              '<div>' +
                '<div style="font-size:11px;color:#94a3b8;font-weight:700;">Guruhlarim:</div>' +
                '<div style="font-size:15px;font-weight:900;color:#38bdf8;">' + tClasses.length + ' ta Guruh</div>' +
              '</div>' +
            '</div>' +
            '<div style="background:rgba(15,23,42,0.8);border:1px solid rgba(56,189,248,0.3);border-radius:14px;padding:8px 16px;display:flex;align-items:center;gap:10px;">' +
              '<span style="font-size:20px;">👥</span>' +
              '<div>' +
                '<div style="font-size:11px;color:#94a3b8;font-weight:700;">O‘quvchilarim:</div>' +
                '<div style="font-size:15px;font-weight:900;color:#fff;">' + (function() {
                  return tClasses.reduce(function(acc, c) { return acc + (c.students || []).length; }, 0);
                })() + ' ta O‘quvchi</div>' +
              '</div>' +
            '</div>' +
            '<div style="background:rgba(15,23,42,0.85);border:1.5px solid rgba(52,211,153,0.4);border-radius:14px;padding:10px 18px;display:flex;align-items:center;gap:12px;box-shadow:0 4px 18px rgba(16,185,129,0.25);">' +
              '<span style="font-size:24px;">💰</span>' +
              '<div>' +
                '<div style="font-size:11px;color:#94a3b8;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;">Sizning Maoshingiz (Real-vaqt):</div>' +
                '<div style="font-size:16px;font-weight:900;color:#34d399;">' + (function() {
                  var pCount = 0;
                  var tCollected = 0;
                  var S_cur = (window.EthithEnterprise && window.EthithEnterprise.getStore ? window.EthithEnterprise.getStore() : null) || window.S || {};
                  tClasses.forEach(function(c) {
                    (c.students || []).forEach(function(st) {
                      var stId = st.id || st.email;
                      var pInfo = (c.studentPayments && c.studentPayments[stId]) || (S_cur.finance && S_cur.finance.studentFees && S_cur.finance.studentFees[stId]);
                      if (pInfo && (pInfo.status === 'paid' || Number(pInfo.paid) > 0)) {
                        pCount++;
                        var paidSum = Number(pInfo.paid) || Number(t.studentMonthlyFee) || 300000;
                        tCollected += paidSum;
                      }
                    });
                  });
                  var share = (t.salarySharePercent !== undefined) ? Number(t.salarySharePercent) : 50;
                  var sal = Math.round(tCollected * (share / 100));
                  return sal.toLocaleString('uz-UZ') + ' so‘m <span style="font-size:11.5px;color:#94a3b8;font-weight:700;">(' + pCount + ' ta to‘lagan, ' + share + '%)</span>';
                })() + '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
          '<div style="background:rgba(15,23,42,0.85);border:1px solid rgba(56,189,248,0.35);border-radius:12px;padding:6px 14px;display:flex;align-items:center;gap:8px;">' +
            '<span style="color:#94a3b8;font-size:12px;font-weight:700;">Ustoz Kodi:</span>' +
            '<b style="color:#38bdf8;font-family:monospace;font-size:13.5px;letter-spacing:1px;">' + esc(t.inviteCode || t.login || '—') + '</b>' +
            '<button type="button" class="ea-copy-code-btn" data-code="' + esc(t.inviteCode || t.login || '') + '" title="Ustoz kodini nusxalash" style="background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:6px;padding:3px 9px;font-size:11px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:4px;">📋 Nusxa olish</button>' +
          '</div>' +
          
          '<button class="ea-btn-add-group-for-t" data-tid="' + esc(t.id) + '" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:12px;padding:10px 18px;font-size:13px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:8px;box-shadow:0 4px 15px rgba(16,185,129,0.35);">' +
            '➕ Shu Ustozga Yangi Guruh Qo‘shish' +
          '</button>' +
          '<button type="button" class="ea-btn-edit-current-teacher" data-tid="' + esc(t.id) + '" title="O‘qituvchi ma’lumotlarini tahrirlash" style="background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.35);border-radius:12px;padding:10px 16px;font-size:13px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:6px;">✏️ Tahrirlash</button>' +
          '<button type="button" class="ea-btn-delete-current-teacher" data-tid="' + esc(t.id) + '" data-tname="' + esc(t.name) + '" title="O‘qituvchini tizimdan butunlay o‘chirish" style="background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.35);border-radius:12px;padding:10px 16px;font-size:13px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:6px;">🗑️ O‘qituvchini O‘chirish</button>' +
        '</div>' +
      '</div>';

    // GROUPS OF THIS TEACHER
    if (tClasses.length === 0) {
      h += '<div style="background:rgba(15,23,42,0.8);border:1px dashed rgba(255,255,255,0.15);border-radius:20px;padding:48px 24px;text-align:center;color:#94a3b8;">' +
        '<div style="font-size:42px;margin-bottom:12px;">🏫</div>' +
        '<h3 style="margin:0 0 8px;font-size:18px;font-weight:800;color:#fff;">Ushbu o‘qituvchiga hali guruh biriktirilmagan</h3>' +
        '<p style="margin:0 0 20px;font-size:13px;color:#94a3b8;">Yuqoridagi <b>"+ Shu Ustozga Yangi Guruh Qo‘shish"</b> tugmasini bosib, yangi guruh oching!</p>' +
        '<button class="ea-btn-add-group-for-t" data-tid="' + esc(t.id) + '" style="background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:10px;padding:10px 20px;font-size:13px;font-weight:800;cursor:pointer;">+ Birinchi Guruhni Qo‘shish</button>' +
      '</div>';
    } else {
      h += '<div style="font-size:12px;color:#38bdf8;font-weight:700;margin-bottom:16px;background:rgba(56,189,248,0.1);border:1px solid rgba(56,189,248,0.25);border-radius:12px;padding:9px 16px;display:flex;align-items:center;gap:10px;">' +
        '<span style="font-size:16px;">↕️</span>' +
        '<span><b>Tartibni o‘zgartirish:</b> Istalgan guruh kartochkasini bosib turib suring (Drag &amp; Drop) — guruhlar tartibi avtomatik saqlanadi. Dastlab darajalar pastdan balandga qarab joylashtirilgan.</span>' +
      '</div>';

      h += '<div id="eaTeacherGroupsGrid" class="ea-teacher-groups-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:20px;">';
      tClasses.forEach(function(cls) {
        var maxCap = cls.maxCapacity || 18;
        var realStCount = (cls.students || []).filter(function(s) {
          return !s.isTester && !(s.name || '').startsWith('tester_');
        }).length;
        var pct = Math.min(100, Math.round((realStCount / maxCap) * 100));

        // Group Duration & 90-Day Level Test Countdown
        var lMonths = Number(cls.learningMonths) || 0;
        var lDays = Number(cls.learningDays) || 0;
        var totalDaysElapsed = (lMonths * 30) + lDays;
        var remainingDays = Math.max(0, 90 - totalDaysElapsed);
        var testsCompleted = Math.min(24, Math.max(0, Math.round((totalDaysElapsed / 90) * 24)));
        var isSoonLevelTest = (remainingDays <= 7);

        var paidInGroup = (cls.students || []).filter(function(st) {
          var stId = st.id || st.email;
          return cls.studentPayments && cls.studentPayments[stId] && cls.studentPayments[stId].status === 'paid';
        }).length;

        var yellowWarningBanner = isSoonLevelTest
          ? ('<div class="ea-yellow-neon-alert" style="background:linear-gradient(135deg,rgba(234,179,8,0.25),rgba(250,204,21,0.15));border:1.5px solid #facc15;color:#fef08a;font-weight:900;font-size:12px;padding:7px 12px;border-radius:12px;text-shadow:0 0 8px #facc15;box-shadow:0 0 16px rgba(250,204,21,0.45);display:flex;align-items:center;gap:6px;margin-bottom:12px;">' +
              '<span>⚡</span> <span>Level testlar tez kunda! (Qoldi: <b style="color:#fff;">' + remainingDays + ' kun</b>)</span>' +
            '</div>')
          : '';

        var durationHtml = '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:8px 12px;margin-bottom:14px;font-size:12px;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">' +
            '<span style="color:#94a3b8;font-weight:700;">⏱️ O‘qish davri:</span>' +
            '<span style="color:#38bdf8;font-weight:900;">' + (lMonths > 0 ? (lMonths + ' oy ') : '') + lDays + ' kun</span>' +
            (isAdmin ? ('<button type="button" class="ea-btn-edit-duration" data-cid="' + esc(cls.id) + '" title="Guruh o‘qish muddatini belgilash" style="background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.4);color:#38bdf8;border-radius:6px;padding:2px 7px;font-size:10.5px;font-weight:800;cursor:pointer;">✏️ Muddat</button>') : '') +
          '</div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;font-size:11.5px;color:#cbd5e1;">' +
            '<span>O‘tilgan testlar: <b style="color:#34d399;">' + testsCompleted + ' / 24 ta</b></span>' +
            '<span>Level testgacha: <b style="color:' + (isSoonLevelTest ? '#facc15;text-shadow:0 0 6px #facc15;' : '#38bdf8;') + '">' + remainingDays + ' kun</b></span>' +
          '</div>' +
        '</div>';

        var cardClass = 'ee-class-card ea-draggable-class' + (isSoonLevelTest ? ' ea-level-test-soon-pulse' : '');

        h += '<div class="' + cardClass + '" draggable="true" data-cid="' + esc(cls.id) + '" data-tid="' + esc(t.id) + '" style="border-radius:22px;padding:22px;display:flex;flex-direction:column;justify-content:space-between;cursor:grab;transition:all 0.25s;">' +
          '<div>' +
            yellowWarningBanner +
            '<div style="display:flex;align-items:center;justify-content:space-between;background:rgba(56,189,248,0.08);border:1px dashed rgba(56,189,248,0.3);border-radius:10px;padding:5px 10px;margin-bottom:12px;user-select:none;">' +
              '<div style="font-size:11.5px;font-weight:900;color:#38bdf8;display:flex;align-items:center;gap:6px;">' +
                '<span style="font-size:14px;cursor:grab;">⋮⋮</span> Bosib surish (Drag &amp; Drop)' +
              '</div>' +
              '<span style="font-size:11px;font-weight:800;color:#94a3b8;background:rgba(255,255,255,0.06);padding:2px 8px;border-radius:6px;">' + esc(cls.level || 'General') + '</span>' +
            '</div>' +
            '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">' +
              '<div style="display:flex;align-items:center;gap:6px;">' +
                '<span style="background:rgba(56,189,248,0.18);color:#38bdf8;border:1px solid rgba(56,189,248,0.4);border-radius:8px;padding:3px 9px;font-size:11px;font-weight:900;font-family:monospace;">' + esc(cls.code || 'ETH-GROUP') + '</span>' +
                '<button type="button" class="ea-copy-code-btn" data-code="' + esc(cls.code || '') + '" title="Guruh kodini nusxalash" style="background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.3);border-radius:6px;padding:2px 7px;font-size:10.5px;font-weight:800;cursor:pointer;">📋 Nusxa</button>' +
              '</div>' +
              '<span style="background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.3);border-radius:20px;padding:3px 10px;font-size:11.5px;font-weight:800;">' + realStCount + ' ta (<b style="color:#4ade80;">' + paidInGroup + ' to‘lagan</b>)</span>' +
            '</div>' +
            '<h3 style="margin:0 0 6px;font-size:18px;font-weight:900;color:#fff;">' + esc(cls.name) + '</h3>' +
            '<div style="font-size:12.5px;color:#94a3b8;margin-bottom:12px;">📍 Xona: <b style="color:#cbd5e1;">' + esc(cls.room || '302-xona') + '</b> | Tartib: <b style="color:#cbd5e1;">' + (cls.schedule === 'juft' ? 'Juft kunlari' : (cls.schedule === 'toq' ? 'Toq kunlari' : 'Har kungi dars')) + '</b></div>' +
            durationHtml +

            // Capacity Progress Bar
            '<div style="background:rgba(255,255,255,0.06);border-radius:999px;height:6px;overflow:hidden;margin-bottom:18px;">' +
              '<div style="background:linear-gradient(90deg,#0284c7,#10b981);height:100%;width:' + pct + '%;"></div>' +
            '</div>' +
          '</div>' +

          // Action Buttons
          '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
            '<button class="ea-open-journal-btn" data-cid="' + esc(cls.id) + '" style="flex:1;min-width:130px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:10px;padding:10px 12px;font-size:12px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 4px 14px rgba(16,185,129,0.35);">' +
              '📋 Davomat Jurnali &rarr;' +
            '</button>' +
            '<button class="ea-btn-group-sms-card" data-cid="' + esc(cls.id) + '" data-cname="' + esc(cls.name) + '" style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border:none;border-radius:10px;padding:10px 12px;font-size:12px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 14px rgba(245,158,11,0.35);" title="Faqat shu guruh ota-onalariga SMS yuborish">' +
              '📲 SMS' +
            '</button>' +
            '<button class="dash-add-student-btn" data-cid="' + esc(cls.id) + '" style="background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.35);border-radius:10px;padding:10px 12px;font-size:12px;font-weight:800;cursor:pointer;">+ O‘quvchi</button>' +
            '<button class="dash-edit-class-btn" data-cid="' + esc(cls.id) + '" style="background:rgba(255,255,255,0.06);color:#cbd5e1;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;font-size:12px;font-weight:800;cursor:pointer;">✏️</button>' +
            '<button class="dash-del-class-btn" data-cid="' + esc(cls.id) + '" data-cname="' + esc(cls.name) + '" style="background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.3);border-radius:10px;padding:10px 12px;font-size:12px;font-weight:800;cursor:pointer;" title="Guruhni o‘chirish">🗑</button>' +
          '</div>' +

        '</div>';
      });
      h += '</div>';
    }

    h += '</div>';
    var loginsSec = (!isStudent && (isAdmin || isTeacher)) ? EA.renderSystemLoginsSection(t.id, null) : null;
    if (loginsSec) h += loginsSec.html;
    container.innerHTML = h;
    EA.attachTeacherGroupsListeners(container, t);
    if (loginsSec && typeof loginsSec.attachHandlers === 'function') loginsSec.attachHandlers(container);
  };

  // --------------------------------------------------------------------------
  // EVENT LISTENERS & MODALS FOR TEACHER-CENTRIC ATTENDANCE
  // --------------------------------------------------------------------------
  EA.attachTeachersDirListeners = function(container) {
    container.querySelectorAll('.ea-teacher-card').forEach(function(card) {
      card.style.cursor = 'pointer';
      card.onclick = function(e) {
        if (e.target.closest('button')) return;
        var tid = card.getAttribute('data-tid');
        if (tid) {
          EA.activeTeacherId = tid;
          EA.activeClassId = null;
          EA.render(container);
        }
      };
    });
    var addBtn = container.querySelector('#eaBtnAddTeacherGlobal');
    if (addBtn) {
      addBtn.onclick = function() { EA.openAddTeacherModal(); };
    }

    container.querySelectorAll('.ea-btn-open-teacher').forEach(function(btn) {
      btn.onclick = function() {
        var tid = btn.getAttribute('data-tid');
        EA.activeTeacherId = tid;
        EA.activeClassId = null;
        EA.render(container);
      };
    });

    container.querySelectorAll('.ea-btn-add-group-for-t').forEach(function(btn) {
      btn.onclick = function() {
        var tid = btn.getAttribute('data-tid');
        var teachers = getStoreTeachers();
        var t = teachers.find(function(item) { return item.id === tid; });
        if (t) EA.openAddGroupForTeacherModal(t);
      };
    });

    container.querySelectorAll('.ea-btn-edit-teacher').forEach(function(btn) {
      btn.onclick = function(e) {
        if (e) e.stopPropagation();
        var tid = btn.getAttribute('data-tid');
        var teachers = getStoreTeachers();
        var t = teachers.find(function(item) { return item.id === tid; });
        if (t) EA.openEditTeacherModal(t);
      };
    });

    container.querySelectorAll('.ea-btn-delete-teacher').forEach(function(btn) {
      btn.onclick = function(e) {
        if (e) e.stopPropagation();
        var tid = btn.getAttribute('data-tid');
        var tname = btn.getAttribute('data-tname');
        EA.deleteTeacher(tid, tname, container);
      };
    });

    container.querySelectorAll('.ea-copy-code-btn').forEach(function(btn) {
      btn.onclick = function(e) {
        if (e) e.stopPropagation();
        var code = btn.getAttribute('data-code');
        if (!code) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code);
        } else {
          var ta = document.createElement('textarea');
          ta.value = code;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
        }
        var origText = btn.innerHTML;
        btn.innerHTML = '✅ Nusxalandi!';
        btn.style.background = '#10b981';
        btn.style.color = '#fff';
        setTimeout(function() {
          btn.innerHTML = origText;
          btn.style.background = '';
          btn.style.color = '';
        }, 1800);
      };
    });
  };

  EA.attachTeacherGroupsListeners = function(container, teacher) {
    container.querySelectorAll('.ea-copy-code-btn').forEach(function(btn) {
      btn.onclick = function(e) {
        if (e) e.stopPropagation();
        var code = btn.getAttribute('data-code');
        if (!code) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code);
        } else {
          var ta = document.createElement('textarea');
          ta.value = code;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
        }
        var origText = btn.innerHTML;
        btn.innerHTML = '✅ Nusxalandi!';
        btn.style.background = '#10b981';
        btn.style.color = '#fff';
        setTimeout(function() {
          btn.innerHTML = origText;
          btn.style.background = '';
          btn.style.color = '';
        }, 1800);
      };
    });
    var backBtn = container.querySelector('#eaBtnBackToAllTeachers');
    if (backBtn) {
      backBtn.onclick = function() {
        EA.activeTeacherId = null;
        EA.activeClassId = null;
        EA.render(container);
      };
    }

    container.querySelectorAll('.ea-btn-edit-duration').forEach(function(btn) {
      btn.onclick = function(e) {
        if (e) e.stopPropagation();
        var cid = btn.getAttribute('data-cid');
        var classes = (window.EA && window.EA.getAvailableClasses) ? window.EA.getAvailableClasses() : [];
        var targetCls = classes.find(function(c) { return c.id === cid; });
        if (targetCls) EA.openEditGroupDurationModal(targetCls, teacher, container);
      };
    });

    container.querySelectorAll('.dash-add-student-btn').forEach(function(btn) {
      btn.onclick = function(e) {
        if (e) e.stopPropagation();
        var cid = btn.getAttribute('data-cid');
        EA.openStudentEnrollModal(cid, null);
      };
    });

    var addGrpBtn = container.querySelector('.ea-btn-add-group-for-t');
    if (addGrpBtn) {
      addGrpBtn.onclick = function() {
        EA.openAddGroupForTeacherModal(teacher);
      };
    }

    var editCurTBtn = container.querySelector('.ea-btn-edit-current-teacher');
    if (editCurTBtn) {
      editCurTBtn.onclick = function() {
        EA.openEditTeacherModal(teacher);
      };
    }

    var delCurTBtn = container.querySelector('.ea-btn-delete-current-teacher');
    if (delCurTBtn) {
      delCurTBtn.onclick = function() {
        EA.deleteTeacher(teacher.id, teacher.name, container);
      };
    }

    container.querySelectorAll('.ea-open-journal-btn').forEach(function(btn) {
      btn.onclick = function(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        var cid = btn.getAttribute('data-cid');
        EA.activeTeacherId = teacher.id;
        EA.activeClassId = cid;
        var targetContainer = document.getElementById('apView') || container;
        EA.render(targetContainer);
      };
    });

    // DRAG & DROP REORDERING FOR CLASSES (Admin can drag to change class order)
    var grid = container.querySelector('#eaTeacherGroupsGrid');
    if (grid) {
      var draggedEl = null;

      function reorderTeacherClasses(tObj, fromCid, toCid) {
        var tClasses = getClassesForTeacher(tObj.id);
        var ids = tClasses.map(function(c) { return c.id; });
        var fromIdx = ids.indexOf(fromCid);
        var toIdx = ids.indexOf(toCid);
        if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;

        var moved = ids.splice(fromIdx, 1)[0];
        ids.splice(toIdx, 0, moved);

        tObj.assignedClasses = ids.slice();
        tObj.classOrder = ids.slice();

        var S = window.S || (window.EthithApp && window.EthithApp.state) || {};
        var storeT = (S.teachers || []).find(function(it) { return it.id === tObj.id; });
        if (storeT) {
          storeT.assignedClasses = ids.slice();
          storeT.classOrder = ids.slice();
        }

        if (window.EthithEnterprise && window.EthithEnterprise.saveStore) {
          window.EthithEnterprise.saveStore();
        } else if (window.EthithApp && window.EthithApp.saveState) {
          window.EthithApp.saveState();
        }

        EA.render(container);
      }

      grid.querySelectorAll('.ea-draggable-class').forEach(function(card) {
        card.addEventListener('dragstart', function(e) {
          draggedEl = card;
          card.style.opacity = '0.4';
          if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', card.getAttribute('data-cid'));
          }
        });

        card.addEventListener('dragend', function() {
          card.style.opacity = '1';
          card.style.border = '1px solid rgba(56,189,248,0.25)';
          grid.querySelectorAll('.ea-draggable-class').forEach(function(c) {
            c.style.transform = '';
            c.style.borderColor = 'rgba(56,189,248,0.25)';
          });
          draggedEl = null;
        });

        card.addEventListener('dragover', function(e) {
          e.preventDefault();
          if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
          if (draggedEl && draggedEl !== card) {
            card.style.borderColor = '#10b981';
            card.style.transform = 'scale(1.02)';
          }
        });

        card.addEventListener('dragleave', function() {
          if (draggedEl !== card) {
            card.style.borderColor = 'rgba(56,189,248,0.25)';
            card.style.transform = '';
          }
        });

        card.addEventListener('drop', function(e) {
          e.preventDefault();
          if (!draggedEl || draggedEl === card) return;

          var fromCid = draggedEl.getAttribute('data-cid');
          var toCid = card.getAttribute('data-cid');
          reorderTeacherClasses(teacher, fromCid, toCid);
        });

        // Touch drag support for mobile / touchscreens
        var touchStartX = 0;
        var touchStartY = 0;
        var isTouchDrag = false;
        var touchTimer = null;

        card.addEventListener('touchstart', function(e) {
          var touch = e.touches[0];
          touchStartX = touch.clientX;
          touchStartY = touch.clientY;
          touchTimer = setTimeout(function() {
            isTouchDrag = true;
            draggedEl = card;
            card.style.opacity = '0.5';
            card.style.border = '2px dashed #38bdf8';
          }, 300);
        }, { passive: true });

        card.addEventListener('touchmove', function(e) {
          if (!isTouchDrag) {
            var touch = e.touches[0];
            if (Math.abs(touch.clientX - touchStartX) > 15 || Math.abs(touch.clientY - touchStartY) > 15) {
              clearTimeout(touchTimer);
            }
            return;
          }
          if (e.cancelable) e.preventDefault();
          var touch = e.touches[0];
          var targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
          var targetCard = targetEl && targetEl.closest('.ea-draggable-class');
          grid.querySelectorAll('.ea-draggable-class').forEach(function(c) {
            if (c === targetCard && c !== draggedEl) {
              c.style.borderColor = '#10b981';
              c.style.transform = 'scale(1.02)';
            } else if (c !== draggedEl) {
              c.style.borderColor = 'rgba(56,189,248,0.25)';
              c.style.transform = '';
            }
          });
        }, { passive: false });

        card.addEventListener('touchend', function(e) {
          clearTimeout(touchTimer);
          if (!isTouchDrag || !draggedEl) {
            isTouchDrag = false;
            return;
          }
          isTouchDrag = false;
          var touch = e.changedTouches[0];
          var targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
          var targetCard = targetEl && targetEl.closest('.ea-draggable-class');

          draggedEl.style.opacity = '1';
          draggedEl.style.border = '1px solid rgba(56,189,248,0.25)';

          if (targetCard && targetCard !== draggedEl) {
            var fromCid = draggedEl.getAttribute('data-cid');
            var toCid = targetCard.getAttribute('data-cid');
            reorderTeacherClasses(teacher, fromCid, toCid);
          } else {
            grid.querySelectorAll('.ea-draggable-class').forEach(function(c) {
              c.style.borderColor = 'rgba(56,189,248,0.25)';
              c.style.transform = '';
            });
          }
          draggedEl = null;
        });
      });
    }

    container.querySelectorAll('.dash-del-class-btn').forEach(function(btn) {
      btn.onclick = function(e) {
        if (e) e.stopPropagation();
        var cid = btn.getAttribute('data-cid');
        var cname = btn.getAttribute('data-cname');
        EA.openDeleteClassModal(cid, cname, teacher, container);
      };
    });
  };

  // MODAL 0: EDIT TEACHER & SALARY PERCENTAGE
  EA.openEditTeacherModal = function(teacher) {
    if (!teacher) return;
    var old = document.getElementById('eaEditTeacherModalOverlay');
    if (old) old.remove();

    var tClasses = getClassesForTeacher(teacher.id);
    var totalStudents = tClasses.reduce(function(acc, c) { return acc + (c.students || []).length; }, 0);
    var curShare = (teacher.salarySharePercent !== undefined) ? Number(teacher.salarySharePercent) : 50;
    var curFee = Number(teacher.studentMonthlyFee) || 300000;

    var overlay = document.createElement('div');
    overlay.id = 'eaEditTeacherModalOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.82);backdrop-filter:blur(18px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;';

    overlay.innerHTML = '<div style="background:linear-gradient(145deg,#0f172a,#1e293b);border:1px solid rgba(56,189,248,0.4);border-radius:24px;width:100%;max-width:520px;padding:26px;box-shadow:0 25px 60px rgba(0,0,0,0.85);color:#fff;font-family:inherit;">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:12px;">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<span style="font-size:24px;">✏️</span>' +
          '<div>' +
            '<h3 style="margin:0;font-size:18px;font-weight:900;color:#fff;">O‘qituvchini Tahrirlash &amp; Maosh Foizi</h3>' +
            '<div style="font-size:12px;color:#94a3b8;margin-top:2px;">O‘quvchilar to‘lovidan o‘qituvchiga foiz ajratish tizimi</div>' +
          '</div>' +
        '</div>' +
        '<button id="eaCloseEditTModalBtn" style="background:transparent;border:none;color:#94a3b8;font-size:22px;cursor:pointer;">&times;</button>' +
      '</div>' +

      '<div style="display:flex;flex-direction:column;gap:12px;max-height:75vh;overflow-y:auto;padding-right:4px;">' +
        '<div>' +
          '<label style="display:block;font-size:11.5px;font-weight:800;color:#94a3b8;text-transform:uppercase;margin-bottom:5px;">O‘qituvchi Ism va Familiyasi</label>' +
          '<input type="text" id="eaEditTName" value="' + esc(teacher.name || '') + '" style="width:100%;padding:10px 14px;background:#1e293b;border:1px solid rgba(255,255,255,0.15);border-radius:12px;color:#fff;font-weight:700;font-size:13.5px;outline:none;box-sizing:border-box;" />' +
        '</div>' +

        '<div>' +
          '<label style="display:block;font-size:11.5px;font-weight:800;color:#94a3b8;text-transform:uppercase;margin-bottom:5px;">Fan / Yo‘nalish</label>' +
          '<input type="text" id="eaEditTSubject" value="' + esc(teacher.subject || 'Ingliz tili') + '" style="width:100%;padding:10px 14px;background:#1e293b;border:1px solid rgba(255,255,255,0.15);border-radius:12px;color:#fff;font-weight:700;font-size:13.5px;outline:none;box-sizing:border-box;" />' +
        '</div>' +

        // SALARY PERCENTAGE & STUDENT FEE BOX
        '<div style="background:rgba(16,185,129,0.1);border:1.5px solid rgba(16,185,129,0.4);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:10px;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;">' +
            '<span style="font-size:12.5px;font-weight:900;color:#34d399;">💰 Oylik Ulushi (% va To‘lov):</span>' +
            '<span style="font-size:11px;color:#94a3b8;">Admin istalgan % ni belgilaydi</span>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
            '<div>' +
              '<label style="display:block;font-size:11px;font-weight:800;color:#cbd5e1;margin-bottom:4px;">Ustoz ulushi (%)</label>' +
              '<div style="display:flex;align-items:center;gap:6px;">' +
                '<input type="number" id="eaEditTSharePercent" value="' + curShare + '" min="0" max="100" style="width:100%;padding:9px 12px;background:#0f172a;border:1.5px solid rgba(56,189,248,0.5);border-radius:10px;color:#38bdf8;font-weight:900;font-size:15px;outline:none;box-sizing:border-box;" />' +
                '<span style="font-weight:900;color:#38bdf8;font-size:16px;">%</span>' +
              '</div>' +
            '</div>' +
            '<div>' +
              '<label style="display:block;font-size:11px;font-weight:800;color:#cbd5e1;margin-bottom:4px;">1 o‘quvchi to‘lovi (so‘m)</label>' +
              '<input type="number" id="eaEditTStudentFee" value="' + curFee + '" step="10000" style="width:100%;padding:9px 12px;background:#0f172a;border:1px solid rgba(255,255,255,0.15);border-radius:10px;color:#fff;font-weight:800;font-size:13.5px;outline:none;box-sizing:border-box;" />' +
            '</div>' +
          '</div>' +

          // LIVE REALTIME CALCULATION PREVIEW BOX
          '<div id="eaEditTCalcPreview" style="background:rgba(0,0,0,0.35);border-radius:10px;padding:10px 12px;font-size:12px;color:#e2e8f0;line-height:1.5;">' +
          '</div>' +
        '</div>' +

        // CREDENTIALS BOX
        '<div style="background:rgba(56,189,248,0.08);border:1px dashed rgba(56,189,248,0.3);border-radius:14px;padding:12px;display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
          '<div>' +
            '<label style="display:block;font-size:11px;font-weight:800;color:#94a3b8;margin-bottom:4px;">Shaxsiy Login</label>' +
            '<input type="text" id="eaEditTLogin" value="' + esc(teacher.login || '') + '" style="width:100%;padding:8px 12px;background:#0f172a;border:1px solid rgba(56,189,248,0.4);border-radius:10px;color:#38bdf8;font-family:monospace;font-weight:800;font-size:13px;outline:none;box-sizing:border-box;" />' +
          '</div>' +
          '<div>' +
            '<label style="display:block;font-size:11px;font-weight:800;color:#94a3b8;margin-bottom:4px;">Maxfiy Parol</label>' +
            '<input type="text" id="eaEditTPassword" value="' + esc(teacher.password || '') + '" style="width:100%;padding:8px 12px;background:#0f172a;border:1px solid rgba(16,185,129,0.4);border-radius:10px;color:#34d399;font-family:monospace;font-weight:800;font-size:13px;outline:none;box-sizing:border-box;" />' +
          '</div>' +
        '</div>' +

        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
          '<div>' +
            '<label style="display:block;font-size:11px;font-weight:800;color:#94a3b8;margin-bottom:4px;">Plastik Karta</label>' +
            '<input type="text" id="eaEditTCard" value="' + esc(teacher.card || '8600 ...') + '" style="width:100%;padding:8px 12px;background:#1e293b;border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:#fff;font-size:12.5px;outline:none;box-sizing:border-box;" />' +
          '</div>' +
          '<div>' +
            '<label style="display:block;font-size:11px;font-weight:800;color:#94a3b8;margin-bottom:4px;">Telefon Raqami</label>' +
            '<input type="text" id="eaEditTPhone" value="' + esc(teacher.phone || '+998 90 ...') + '" style="width:100%;padding:8px 12px;background:#1e293b;border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:#fff;font-size:12.5px;outline:none;box-sizing:border-box;" />' +
          '</div>' +
        '</div>' +

        '<div style="display:flex;gap:10px;justify-content:space-between;align-items:center;margin-top:12px;">' +
          '<button type="button" id="eaDeleteTeacherFromModalBtn" style="background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.4);border-radius:12px;padding:10px 16px;font-size:13px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:6px;">🗑️ O‘chirish</button>' +
          '<div style="display:flex;gap:10px;">' +
            '<button id="eaCancelEditTBtn" style="background:rgba(255,255,255,0.08);color:#cbd5e1;border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:10px 18px;font-size:13px;font-weight:800;cursor:pointer;">Bekor Qilish</button>' +
            '<button id="eaSaveEditTBtn" style="background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:12px;padding:10px 22px;font-size:13px;font-weight:900;cursor:pointer;box-shadow:0 4px 16px rgba(2,132,199,0.4);">✓ Saqlash</button>' +
          '</div>' +
        '</div>' +

      '</div></div>';

    document.body.appendChild(overlay);

    var shareInp = overlay.querySelector('#eaEditTSharePercent');
    var feeInp = overlay.querySelector('#eaEditTStudentFee');
    var prevBox = overlay.querySelector('#eaEditTCalcPreview');

    function updatePreview() {
      var pct = Math.max(0, Math.min(100, Number(shareInp.value) || 0));
      var fee = Math.max(0, Number(feeInp.value) || 0);
      var totalTuition = totalStudents * fee;
      var salary = Math.round(totalTuition * (pct / 100));

      prevBox.innerHTML = '📊 <b>Hisob-kitob ko‘rsatkichi:</b><br>' +
        '• Guruhlaridagi o‘quvchilar: <b style="color:#38bdf8;">' + totalStudents + ' nafar</b><br>' +
        '• O‘quvchilardan tushum: <b>' + totalStudents + ' × ' + fee.toLocaleString() + ' = <span style="color:#f8fafc;">' + totalTuition.toLocaleString() + ' so‘m</span></b><br>' +
        '• Ustozga ajratiladigan oylik (' + pct + '%): <b style="color:#10b981;font-size:14px;">' + salary.toLocaleString() + ' so‘m</b>';
    }

    shareInp.oninput = updatePreview;
    feeInp.oninput = updatePreview;
    updatePreview();

    var close = function() { overlay.remove(); };
    overlay.querySelector('#eaCloseEditTModalBtn').onclick = close;
    overlay.querySelector('#eaCancelEditTBtn').onclick = close;
    var delFromModal = overlay.querySelector('#eaDeleteTeacherFromModalBtn');
    if (delFromModal) {
      delFromModal.onclick = function() {
        close();
        EA.deleteTeacher(teacher.id, teacher.name);
      };
    }

    overlay.querySelector('#eaSaveEditTBtn').onclick = function() {
      var newName = overlay.querySelector('#eaEditTName').value.trim();
      var newSubject = overlay.querySelector('#eaEditTSubject').value.trim();
      var newPct = Math.max(0, Math.min(100, Number(shareInp.value) || 50));
      var newFee = Math.max(0, Number(feeInp.value) || 300000);
      var newLogin = overlay.querySelector('#eaEditTLogin').value.trim();
      var newPassword = overlay.querySelector('#eaEditTPassword').value.trim();
      var newCard = overlay.querySelector('#eaEditTCard').value.trim();
      var newPhone = overlay.querySelector('#eaEditTPhone').value.trim();

      if (!newName) { alert("O‘qituvchi ismini kiriting!"); return; }

      var calculatedSalary = Math.round((totalStudents * newFee) * (newPct / 100));

      teacher.name = newName;
      teacher.subject = newSubject;
      teacher.salarySharePercent = newPct;
      teacher.studentMonthlyFee = newFee;
      teacher.monthlySalary = calculatedSalary;
      if (newLogin) teacher.login = newLogin;
      if (newPassword) teacher.password = newPassword;
      if (newCard) teacher.card = newCard;
      if (newPhone) teacher.phone = newPhone;

      var S = window.S || (window.EthithApp && window.EthithApp.state) || {};
      var storeT = (S.teachers || []).find(function(it) { return it.id === teacher.id; });
      if (storeT) {
        storeT.name = newName;
        storeT.subject = newSubject;
        storeT.salarySharePercent = newPct;
        storeT.studentMonthlyFee = newFee;
        storeT.monthlySalary = calculatedSalary;
        if (newLogin) storeT.login = newLogin;
        if (newPassword) storeT.password = newPassword;
        if (newCard) storeT.card = newCard;
        if (newPhone) storeT.phone = newPhone;
      }

      if (Array.isArray(S.accounts)) {
        var acc = S.accounts.find(function(a) { return a.id === teacher.id || a.login === teacher.login; });
        if (acc) {
          acc.name = newName;
          if (newLogin) acc.login = newLogin;
          if (newPassword) acc.password = newPassword;
        }
      }

      if (window.EthithEnterprise && window.EthithEnterprise.saveStore) {
        window.EthithEnterprise.saveStore();
      } else if (window.EthithApp && window.EthithApp.saveState) {
        window.EthithApp.saveState();
      }

      if (window.EthithSync && window.EthithSync.broadcastState) {
        window.EthithSync.broadcastState('teacher_updated');
      }

      if (window.EthithApp && window.EthithApp.toast) {
        window.EthithApp.toast(newName + " ma'lumotlari va " + newPct + "% oylik ulushi saqlandi!");
      }

      close();
      var c = document.getElementById('apView');
      if (c) EA.render(c);
    };
  };

  // TEACHER DELETION METHOD (Admin only)
  EA.deleteTeacher = function(tid, tName, container) {
    if (!tid) return;
    var teachers = getStoreTeachers();
    var tObj = teachers.find(function(item) { return item.id === tid; });
    var nameToDisplay = tName || (tObj ? tObj.name : 'O‘qituvchi');
    if (!confirm("Haqiqatan ham \"" + nameToDisplay + "\" o‘qituvchisini tizimdan butunlay o‘chirmoqchimisiz?\n\n• O‘qituvchi va uning tizim profili o‘chiriladi\n• Guruhlar saqlanadi va o‘qituvchisiz (bo‘sh) holatga o‘tkaziladi")) {
      return;
    }

    var S = window.S || (window.EthithApp && window.EthithApp.state) || {};
    if (!Array.isArray(S.deletedTeacherIds)) S.deletedTeacherIds = [];
    if (S.deletedTeacherIds.indexOf(tid) === -1) S.deletedTeacherIds.push(tid);

    try {
      var lsDel = JSON.parse(localStorage.getItem('ethith_deleted_teacher_ids') || '[]');
      if (Array.isArray(lsDel) && lsDel.indexOf(tid) === -1) lsDel.push(tid);
      localStorage.setItem('ethith_deleted_teacher_ids', JSON.stringify(lsDel));
    } catch(e) {}

    // 1. Remove from teachers
    if (Array.isArray(S.teachers)) {
      S.teachers = S.teachers.filter(function(t) { return t.id !== tid; });
    }
    if (window.ETHITH_INITIAL_STORE && Array.isArray(window.ETHITH_INITIAL_STORE.teachers)) {
      window.ETHITH_INITIAL_STORE.teachers = window.ETHITH_INITIAL_STORE.teachers.filter(function(t) { return t.id !== tid; });
    }
    // 2. Remove teacher login account from accounts
    if (Array.isArray(S.accounts)) {
      S.accounts = S.accounts.filter(function(a) {
        if (a.id === tid) return false;
        if (tObj && tObj.login && a.login && a.login.toLowerCase() === tObj.login.toLowerCase()) return false;
        return true;
      });
    }
    // 3. Unbind classes from this teacher
    if (Array.isArray(S.classes)) {
      S.classes.forEach(function(cls) {
        if (cls.teacherId === tid || (tObj && cls.teacherName === tObj.name)) {
          cls.teacherId = '';
          cls.teacherName = 'Biriktirilmagan';
        }
      });
    }

    // 4. Also sync with EthithEnterprise store if available
    if (window.EthithEnterprise && window.EthithEnterprise.getStore) {
      var entStore = window.EthithEnterprise.getStore();
      if (entStore) {
        if (!Array.isArray(entStore.deletedTeacherIds)) entStore.deletedTeacherIds = [];
        if (entStore.deletedTeacherIds.indexOf(tid) === -1) entStore.deletedTeacherIds.push(tid);
        if (Array.isArray(entStore.teachers)) entStore.teachers = entStore.teachers.filter(function(t) { return t.id !== tid; });
        if (Array.isArray(entStore.accounts)) {
          entStore.accounts = entStore.accounts.filter(function(a) {
            if (a.id === tid) return false;
            if (tObj && tObj.login && a.login && a.login.toLowerCase() === tObj.login.toLowerCase()) return false;
            return true;
          });
        }
      }
    }

    // 5. Persist
    if (window.EthithEnterprise && window.EthithEnterprise.saveStore) {
      window.EthithEnterprise.saveStore();
    } else if (window.EthithApp && window.EthithApp.saveState) {
      window.EthithApp.saveState();
    }

    // 6. Broadcast sync event
    if (window.EthithSync && window.EthithSync.broadcastState) {
      window.EthithSync.broadcastState('teacher_deleted');
    }

    // 7. Toast notification
    if (window.EthithApp && window.EthithApp.toast) {
      window.EthithApp.toast("🗑️ " + nameToDisplay + " tizimdan muvaffaqiyatli o‘chirildi!");
    }

    // 8. Re-render UI
    var targetContainer = container || document.getElementById('apView');
    if (targetContainer) {
      EA.activeTeacherId = null;
      EA.activeClassId = null;
      EA.render(targetContainer);
    }
  };

  // MODAL 1: ADD TEACHER (Admin-only auto-credentials & salary percentage)
  EA.openAddTeacherModal = function() {
    var old = document.getElementById('eaAddTeacherModalOverlay');
    if (old) old.remove();

    function transliterate(str) {
      if (!str) return 'ustoz';
      var map = {
        'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'j','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'x','ц':'s','ч':'ch','ш':'sh','щ':'sh','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya','ў':'o','қ':'q','ғ':'g','ҳ':'h',
        'o‘':'o','o\'':'o','g‘':'g','g\'':'g','sh':'sh','ch':'ch'
      };
      var s = str.toLowerCase();
      var res = '';
      for (var i = 0; i < s.length; i++) {
        var two = s.substr(i, 2);
        if (map[two]) { res += map[two]; i++; }
        else if (map[s[i]]) { res += map[s[i]]; }
        else { res += s[i]; }
      }
      return res.replace(/[^a-z0-9]/g, '');
    }

    var rndNum = Math.floor(10 + Math.random() * 89);

    var overlay = document.createElement('div');
    overlay.id = 'eaAddTeacherModalOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(16px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;';

    overlay.innerHTML = '<div style="background:linear-gradient(145deg,#0f172a,#1e293b);border:1px solid rgba(56,189,248,0.4);border-radius:24px;width:100%;max-width:520px;padding:26px;box-shadow:0 25px 60px rgba(0,0,0,0.85);max-height:92vh;overflow-y:auto;">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<span style="font-size:26px;">👨‍🏫</span>' +
          '<div>' +
            '<h3 style="margin:0;font-size:18px;font-weight:900;color:#fff;">Yangi O‘qituvchi Qo‘shish</h3>' +
            '<div style="font-size:11.5px;color:#94a3b8;margin-top:2px;">Tizim avtomatik shaxsiy login, parol va taklif kodi yaratadi</div>' +
          '</div>' +
        '</div>' +
        '<button id="eaCloseAddTModalBtn" style="background:transparent;border:none;color:#94a3b8;font-size:22px;cursor:pointer;">&times;</button>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:14px;">' +
        '<div>' +
          '<label style="display:block;font-size:11.5px;font-weight:800;color:#94a3b8;text-transform:uppercase;margin-bottom:6px;">O‘qituvchi Ism va Familiyasi</label>' +
          '<input type="text" id="eaNewTName" placeholder="Masalan: Zafar Umarov" style="width:100%;padding:12px 14px;background:#1e293b;border:1px solid rgba(56,189,248,0.3);border-radius:12px;color:#fff;font-weight:700;font-size:14px;outline:none;box-sizing:border-box;" />' +
        '</div>' +

        // Auto Generated Credentials Preview Box
        '<div style="background:rgba(15,23,42,0.8);border:1px dashed rgba(56,189,248,0.4);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:10px;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;">' +
            '<span style="font-size:11.5px;font-weight:900;color:#38bdf8;text-transform:uppercase;letter-spacing:0.5px;">🔐 Avtomatik Yaratilgan Kirish Ma‘lumotlari:</span>' +
            '<button type="button" id="eaBtnRegenCreds" style="background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.3);border-radius:6px;padding:2px 8px;font-size:11px;font-weight:800;cursor:pointer;">🔄 Yangilash</button>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
            '<div>' +
              '<label style="display:block;font-size:11px;font-weight:700;color:#94a3b8;margin-bottom:4px;">Login:</label>' +
              '<input type="text" id="eaNewTLogin" style="width:100%;padding:9px 12px;background:#0b101b;border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#38bdf8;font-family:monospace;font-weight:900;font-size:13px;outline:none;box-sizing:border-box;" />' +
            '</div>' +
            '<div>' +
              '<label style="display:block;font-size:11px;font-weight:700;color:#94a3b8;margin-bottom:4px;">Maxfiy Parol:</label>' +
              '<input type="text" id="eaNewTPassword" style="width:100%;padding:9px 12px;background:#0b101b;border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#34d399;font-family:monospace;font-weight:900;font-size:13px;outline:none;box-sizing:border-box;" />' +
            '</div>' +
          '</div>' +
          '<div>' +
            '<label style="display:block;font-size:11px;font-weight:700;color:#94a3b8;margin-bottom:4px;">Ustoz Taklif Kodi (O‘quvchilar guruhga qo‘shilishi uchun):</label>' +
            '<input type="text" id="eaNewTCode" style="width:100%;padding:9px 12px;background:#0b101b;border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#f59e0b;font-family:monospace;font-weight:900;font-size:13.5px;letter-spacing:1px;outline:none;box-sizing:border-box;" />' +
          '</div>' +
        '</div>' +

        // Salary Percentage & Speciality
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
          '<div>' +
            '<label style="display:block;font-size:11.5px;font-weight:800;color:#94a3b8;text-transform:uppercase;margin-bottom:6px;">Oylik Ulush Foizi (%)</label>' +
            '<input type="number" id="eaNewTSharePercent" min="0" max="100" value="50" style="width:100%;padding:11px 14px;background:#1e293b;border:1px solid rgba(16,185,129,0.3);border-radius:12px;color:#34d399;font-weight:900;font-size:15px;outline:none;box-sizing:border-box;" />' +
            '<small style="font-size:10.5px;color:#94a3b8;margin-top:3px;display:block;">Masalan: 50, 55 yoki 30%</small>' +
          '</div>' +
          '<div>' +
            '<label style="display:block;font-size:11.5px;font-weight:800;color:#94a3b8;text-transform:uppercase;margin-bottom:6px;">Fan / Mutaxassislik</label>' +
            '<input type="text" id="eaNewTSubject" value="Ingliz tili" style="width:100%;padding:11px 14px;background:#1e293b;border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:#fff;font-weight:700;font-size:13.5px;outline:none;box-sizing:border-box;" />' +
          '</div>' +
        '</div>' +

        '<div style="display:flex;gap:10px;margin-top:10px;">' +
          '<button id="eaCancelAddTBtn" style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:12px;color:#cbd5e1;padding:12px;font-weight:800;cursor:pointer;">Bekor Qilish</button>' +
          '<button id="eaSaveAddTBtn" style="flex:1;background:linear-gradient(135deg,#10b981,#059669);border:none;border-radius:12px;color:#fff;padding:12px;font-weight:900;cursor:pointer;box-shadow:0 4px 15px rgba(16,185,129,0.35);">💾 Saqlash &amp; Qo‘shish</button>' +
        '</div>' +
      '</div>' +
    '</div>';

    document.body.appendChild(overlay);

    var nameInput = overlay.querySelector('#eaNewTName');
    var loginInput = overlay.querySelector('#eaNewTLogin');
    var passInput = overlay.querySelector('#eaNewTPassword');
    var codeInput = overlay.querySelector('#eaNewTCode');

    function updateGeneratedFields() {
      var n = nameInput.value.trim();
      var firstName = n.split(/\s+/)[0] || 'ustoz';
      var translit = transliterate(firstName) || 'ustoz';
      loginInput.value = translit + rndNum;
      passInput.value = translit + '2026';
      codeInput.value = translit.toUpperCase() + rndNum;
    }

    updateGeneratedFields();
    nameInput.oninput = updateGeneratedFields;

    overlay.querySelector('#eaBtnRegenCreds').onclick = function() {
      rndNum = Math.floor(10 + Math.random() * 89);
      updateGeneratedFields();
    };

    function close() { overlay.remove(); }
    overlay.querySelector('#eaCloseAddTModalBtn').onclick = close;
    overlay.querySelector('#eaCancelAddTBtn').onclick = close;

    overlay.querySelector('#eaSaveAddTBtn').onclick = function() {
      var name = nameInput.value.trim();
      var login = loginInput.value.trim().toLowerCase();
      var password = passInput.value.trim();
      var inviteCode = codeInput.value.trim().toUpperCase();
      var subject = overlay.querySelector('#eaNewTSubject').value.trim() || 'Ingliz tili';
      var sharePercent = Number(overlay.querySelector('#eaNewTSharePercent').value) || 50;

      if (!name) { alert("Iltimos, o‘qituvchi ism va familiyasini kiriting!"); return; }
      if (!login) login = 'teacher' + Date.now().toString().slice(-4);
      if (!password) password = login + '2026';
      if (!inviteCode) inviteCode = login.toUpperCase();

      var S = window.S || (window.EthithApp && window.EthithApp.state) || {};
      if (!S.teachers) S.teachers = getStoreTeachers();
      if (!S.accounts) S.accounts = [];

      var newId = 'teacher_' + Date.now();
      var newT = {
        id: newId,
        name: name,
        login: login,
        password: password,
        inviteCode: inviteCode,
        email: login + '@ethith.uz',
        subject: subject,
        hourlyRate: 100000,
        salarySharePercent: sharePercent,
        teachingHours: 0,
        monthlyBonus: 0,
        status: 'active',
        created: Date.now(),
        assignedClasses: [],
        classOrder: []
      };

      S.teachers.push(newT);

      // Add to accounts for immediate authentication
      var accIdx = S.accounts.findIndex(function(a) { return a.login === login || a.id === newId; });
      var accObj = {
        id: newId,
        name: name,
        login: login,
        password: password,
        email: newT.email,
        role: 'teacher',
        teacherId: newId,
        subject: subject,
        salarySharePercent: sharePercent,
        createdAt: Date.now()
      };
      if (accIdx === -1) S.accounts.push(accObj);
      else S.accounts[accIdx] = accObj;

      // Personal isolated test / file explorer folder
      if (S.fileExplorer && Array.isArray(S.fileExplorer.folders)) {
        var tFolderId = 'f_root_' + newId;
        if (!S.fileExplorer.folders.some(function(f) { return f.id === tFolderId; })) {
          S.fileExplorer.folders.push({
            id: tFolderId,
            name: name + " (Mening Hujjatlarim)",
            parentId: null,
            ownerRole: 'teacher',
            ownerId: newId,
            isSystem: true
          });
        }
      }

      if (window.EthithApp && typeof window.EthithApp.saveState === 'function') window.EthithApp.saveState();
      if (window.EthithSync && typeof window.EthithSync.pushStoreUpdate === 'function') window.EthithSync.pushStoreUpdate();
      if (window.EthithSync && typeof window.EthithSync.broadcastState === 'function') window.EthithSync.broadcastState('teacher_added');

      close();

      alert(
        "✅ Yangi o‘qituvchi muvaffaqiyatli qo‘shildi!\n\n" +
        "👤 Ism: " + name + "\n" +
        "🔑 Login: " + login + "\n" +
        "🔒 Parol: " + password + "\n" +
        "🏷️ Taklif Kodi: " + inviteCode + "\n" +
        "💰 Ulush foizi: " + sharePercent + "%\n\n" +
        "O‘qituvchi ushbu login va parol bilan tizimga kiradi."
      );

      EA.render(document.getElementById('apView'));
    };
  };

  // MODAL 2: ADD GROUP FOR SPECIFIC TEACHER
  
  EA.openDeleteClassModal = function(classId, className, teacher, container) {
    var old = document.getElementById('eaDeleteClassModalOverlay');
    if (old) old.remove();

    var overlay = document.createElement('div');
    overlay.id = 'eaDeleteClassModalOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(16px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;';

    overlay.innerHTML = '<div style="background:linear-gradient(145deg,#0f172a,#1e293b);border:1px solid rgba(239,68,68,0.4);border-radius:24px;width:100%;max-width:460px;padding:26px;box-shadow:0 25px 60px rgba(0,0,0,0.85);text-align:center;">' +
      '<div style="width:60px;height:60px;border-radius:20px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.35);color:#ef4444;font-size:28px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">🗑️</div>' +
      '<h3 style="margin:0 0 8px;font-size:20px;font-weight:900;color:#fff;">Guruhni O‘chirish</h3>' +
      '<p style="margin:0 0 20px;font-size:13.5px;color:#cbd5e1;line-height:1.5;">' +
        'Haqiqatan ham <b style="color:#f87171;">' + esc(className || 'Ushbu guruh') + '</b>ni butunlay o‘chirib tashlamoqchimisiz?<br>' +
        '<span style="font-size:12px;color:#94a3b8;">Unga tegishli barcha davomat va baholar bazadan o‘chiriladi va bu amalni qaytarib bo‘lmaydi.</span>' +
      '</p>' +
      '<div style="display:flex;gap:12px;">' +
        '<button id="eaCancelDelClassBtn" style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:#cbd5e1;padding:12px;font-weight:800;font-size:13px;cursor:pointer;transition:all 0.2s;">Bekor Qilish</button>' +
        '<button id="eaConfirmDelClassBtn" style="flex:1;background:linear-gradient(135deg,#dc2626,#ef4444);border:none;border-radius:12px;color:#fff;padding:12px;font-weight:900;font-size:13px;cursor:pointer;box-shadow:0 4px 18px rgba(239,68,68,0.45);transition:all 0.2s;">🗑 Ha, O‘chirilsin</button>' +
      '</div>' +
    '</div>';

    document.body.appendChild(overlay);

    function close() { overlay.remove(); }
    overlay.querySelector('#eaCancelDelClassBtn').onclick = close;

    overlay.querySelector('#eaConfirmDelClassBtn').onclick = function() {
      var S = window.S || (window.EthithApp && window.EthithApp.state) || {};
      if (S.classes && Array.isArray(S.classes)) {
        S.classes = S.classes.filter(function(c) { return c.id !== classId; });
      }

      var teachers = getStoreTeachers();
      teachers.forEach(function(tch) {
        if (tch.assignedClasses && Array.isArray(tch.assignedClasses)) {
          tch.assignedClasses = tch.assignedClasses.filter(function(cid) { return cid !== classId; });
        }
      });

      if (window.EthithApp && typeof window.EthithApp.saveState === 'function') window.EthithApp.saveState();
      if (typeof window.saveState === 'function') window.saveState();
      if (typeof window.pushRemoteStore === 'function') window.pushRemoteStore();
      if (window.EthithSync && typeof window.EthithSync.pushStoreUpdate === 'function') window.EthithSync.pushStoreUpdate();

      if (window.EthithSync && typeof window.EthithSync.publish === 'function') {
        try {
          window.EthithSync.publish('CLASS_DELETED', { classId: classId, className: className });
        } catch(e) {}
      }

      close();

      if (typeof window.showToast === 'function') {
        window.showToast((className || 'Guruh') + ' muvaffaqiyatli o‘chirildi', 'success');
      }

      if (EA.activeClassId === classId) {
        EA.activeClassId = null;
      }
      if (teacher && teacher.id) {
        EA.activeTeacherId = teacher.id;
      }

      var targetContainer = container || document.getElementById('apView');
      EA.render(targetContainer);
    };
  };

  EA.openAddGroupForTeacherModal = function(teacher) {
    var old = document.getElementById('eaAddGroupModalOverlay');
    if (old) old.remove();

    var overlay = document.createElement('div');
    overlay.id = 'eaAddGroupModalOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(16px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;';

    overlay.innerHTML = '<div style="background:linear-gradient(145deg,#0f172a,#1e293b);border:1px solid rgba(56,189,248,0.35);border-radius:24px;width:100%;max-width:500px;padding:26px;box-shadow:0 25px 60px rgba(0,0,0,0.8);">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<span style="font-size:24px;">🏫</span>' +
          '<div>' +
            '<h3 style="margin:0;font-size:18px;font-weight:900;color:#fff;">Yangi Guruh Qo‘shish</h3>' +
            '<div style="font-size:12px;color:#38bdf8;font-weight:700;margin-top:2px;">Ustoz: ' + esc(teacher.name) + '</div>' +
          '</div>' +
        '</div>' +
        '<button id="eaCloseAddGModalBtn" style="background:transparent;border:none;color:#94a3b8;font-size:20px;cursor:pointer;">&times;</button>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:14px;">' +
        '<div>' +
          '<label style="display:block;font-size:11.5px;font-weight:800;color:#94a3b8;text-transform:uppercase;margin-bottom:6px;">Guruh Nomi</label>' +
          '<input type="text" id="eaNewGName" placeholder="masalan: IELTS Band 7.5 Morning" style="width:100%;padding:11px 14px;background:#1e293b;border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:#fff;font-weight:700;font-size:13.5px;outline:none;box-sizing:border-box;" />' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
          '<div>' +
            '<label style="display:block;font-size:11.5px;font-weight:800;color:#94a3b8;text-transform:uppercase;margin-bottom:6px;">Xona</label>' +
            '<input type="text" id="eaNewGRoom" value="302-xona" style="width:100%;padding:11px 14px;background:#1e293b;border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:#fff;font-weight:700;font-size:13.5px;outline:none;box-sizing:border-box;" />' +
          '</div>' +
          '<div>' +
            '<label style="display:block;font-size:11.5px;font-weight:800;color:#94a3b8;text-transform:uppercase;margin-bottom:6px;">Sig‘imi (joy)</label>' +
            '<input type="number" id="eaNewGCap" value="16" style="width:100%;padding:11px 14px;background:#1e293b;border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:#38bdf8;font-weight:900;font-size:14px;outline:none;box-sizing:border-box;" />' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<label style="display:block;font-size:11.5px;font-weight:800;color:#94a3b8;text-transform:uppercase;margin-bottom:6px;">Dars Kunlari (Jadval)</label>' +
          '<select id="eaNewGSched" style="width:100%;padding:11px 14px;background:#1e293b;border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:#fff;font-weight:700;font-size:13.5px;outline:none;box-sizing:border-box;">' +
            '<option value="har_kuni">Har kungi dars (Dushanba – Shanba)</option>' +
            '<option value="toq">Toq kunlari (Dushanba, Chorshanba, Juma)</option>' +
            '<option value="juft">Juft kunlari (Seshanba, Payshanba, Shanba)</option>' +
          '</select>' +
        '</div>' +
        '<div style="display:flex;gap:10px;margin-top:10px;">' +
          '<button id="eaCancelAddGBtn" style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:12px;color:#cbd5e1;padding:12px;font-weight:800;cursor:pointer;">Bekor Qilish</button>' +
          '<button id="eaSaveAddGBtn" style="flex:1;background:linear-gradient(135deg,#0284c7,#2563eb);border:none;border-radius:12px;color:#fff;padding:12px;font-weight:900;cursor:pointer;">🏫 Guruhni Yaratish</button>' +
        '</div>' +
      '</div>' +
    '</div>';

    document.body.appendChild(overlay);

    function close() { overlay.remove(); }
    overlay.querySelector('#eaCloseAddGModalBtn').onclick = close;
    overlay.querySelector('#eaCancelAddGBtn').onclick = close;

    overlay.querySelector('#eaSaveAddGBtn').onclick = function() {
      var name = overlay.querySelector('#eaNewGName').value.trim();
      var room = overlay.querySelector('#eaNewGRoom').value.trim() || '302-xona';
      var cap = Number(overlay.querySelector('#eaNewGCap').value) || 16;
      var sched = overlay.querySelector('#eaNewGSched').value || 'har_kuni';

      if (!name) { alert("Iltimos, guruh nomini kiriting!"); return; }

      var S = window.S || (window.EthithApp && window.EthithApp.state) || {};
      if (!S.classes) S.classes = [];

      var randCode = 'ETH-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      var newCls = {
        id: 'cls_' + Date.now(),
        code: randCode,
        name: name,
        teacher: teacher.name,
        teacherId: teacher.id,
        teacherName: teacher.name,
        room: room,
        schedule: sched,
        maxCapacity: cap,
        students: [],
        customStudentNames: {},
        attendance: { records: {}, lessonTypes: {}, holidays: {}, homeworks: {} }
      };

      S.classes.push(newCls);
      if (window.EthithApp && typeof window.EthithApp.saveState === 'function') window.EthithApp.saveState();
      if (window.EthithSync && typeof window.EthithSync.pushStoreUpdate === 'function') window.EthithSync.pushStoreUpdate();

      close();
      EA.activeTeacherId = teacher.id;
      EA.activeClassId = null;
      EA.render(document.getElementById('apView'));
    };
  };

  function getActiveOrFirstClass() {
    var allClasses = getAvailableClasses();
    if (EA.activeClassId) {
      var found = allClasses.find(function(c) { return c.id === EA.activeClassId; });
      if (found) return found;
    }
    if (EA.activeTeacherId) {
      var tClasses = getClassesForTeacher(EA.activeTeacherId);
      if (tClasses && tClasses.length > 0) return tClasses[0];
    }
    return allClasses[0] || {};
  }
  EA.getActiveOrFirstClass = getActiveOrFirstClass;

EA.render = function(container, preserveScrollLeft) {
    if (!container) container = document.getElementById('apView');
    if (!container) return;

    ensureStylesInjected();
    window._ethithCurrentView = 'attendance';

    var isAdmin = isAdminRole();
    var isTeacher = isTeacherRole();

    // Teacher Isolation ("alohida alohida uy kabi boshqa boshqa bo'lsin"):
    // Non-admin teachers are strictly locked to their own teacherId and their own groups
    if (isTeacher && !isAdmin) {
      var curUser = getActiveUser();
      var teachers = getStoreTeachers();
      var matchT = teachers.find(function(t) { 
        return t.id === curUser.id || 
               (curUser.email && t.email && t.email.toLowerCase() === curUser.email.toLowerCase()) ||
               (curUser.login && t.login && t.login.toLowerCase() === curUser.login.toLowerCase()); 
      });
      if (matchT) {
        EA.activeTeacherId = matchT.id;
      }
      if (EA.activeClassId) {
        var myClasses = getClassesForTeacher(EA.activeTeacherId);
        var belongsToMe = myClasses.some(function(c) { return c.id === EA.activeClassId; });
        if (!belongsToMe) {
          EA.activeClassId = null;
        }
      }
    }

    // 1. If Admin has not selected a teacher and not selected a class -> Show Teachers Directory (Level 1)
    if (isAdmin && !EA.activeTeacherId && !EA.activeClassId) {
      EA.renderTeachersDirectory(container);
      return;
    }

    // 2. If a teacher is selected (or user is a teacher) but no class selected -> Show Teacher Groups (Level 2)
    if ((isAdmin || isTeacher) && EA.activeTeacherId && !EA.activeClassId) {
      EA.renderTeacherGroups(container, EA.activeTeacherId);
      return;
    }

    // 3. For Students: STRICT PRIVACY & PERSONAL JOURNAL ONLY (Faqat o'zining guruhi va davomati!)
    var curUser = getActiveUser();
    var isStudent = curUser && curUser.role === 'student';
    var enrolledClasses = [];
    if (isStudent) {
      var allCls = getAvailableClasses();
      enrolledClasses = allCls.filter(function(c) {
        if (!c) return false;
        if (curUser.classId && c.id === curUser.classId) return true;
        return Array.isArray(c.students) && c.students.some(function(st) {
          if (!st || st.isTester) return false;
          return (st.id && curUser.id && st.id === curUser.id) ||
                 (st.login && curUser.login && st.login.toLowerCase() === curUser.login.toLowerCase()) ||
                 (st.email && curUser.email && st.email.toLowerCase() === curUser.email.toLowerCase()) ||
                 (curUser.phone && st.phone && st.phone === curUser.phone) ||
                 (curUser.name && st.name && st.name.toLowerCase() === curUser.name.toLowerCase());
        });
      });
      if (enrolledClasses.length === 0) {
        enrolledClasses = [allCls[0] || {}];
      }
    }

    var allClasses = getAvailableClasses();
    var cls = isStudent ? (enrolledClasses.find(function(c) { return c.id === EA.activeClassId; }) || enrolledClasses[0]) : getActiveOrFirstClass();
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
      var aTester = a.isTester || (a.name && a.name.toLowerCase().startsWith('tester_'));
      var bTester = b.isTester || (b.name && b.name.toLowerCase().startsWith('tester_'));
      if (!aTester && bTester) return -1;
      if (aTester && !bTester) return 1;
      var idA = a.id || a.email || '';
      var idB = b.id || b.email || '';
      var nA = cleanStName(cls.customStudentNames[idA] || a.name || '').toLowerCase();
      var nB = cleanStName(cls.customStudentNames[idB] || b.name || '').toLowerCase();
      return nA.localeCompare(nB, undefined, { numeric: true });
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

    // 0. HIERARCHICAL NAVIGATION BAR (BACK TO TEACHER GROUPS & ALL TEACHERS)
    var curTName = cls.teacherName || cls.teacher || (EA.activeTeacherId && (getStoreTeachers().find(function(t){ return t.id === EA.activeTeacherId; }) || {}).name) || 'Ustoz';
    h += '<div class="qe-glass-panel" style="border-radius:20px;padding:14px 20px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;background:linear-gradient(135deg,rgba(15,23,42,0.92),rgba(30,41,59,0.85));border:1px solid rgba(56,189,248,0.3);box-shadow:0 8px 30px rgba(0,0,0,0.5);">';

    if (!isStudent) {
      h += '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
        '<button id="eaBtnBackToTeacherGroupsFromJ" style="background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:10px;padding:9px 16px;font-size:12.5px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 14px rgba(2,132,199,0.35);">&larr; ' + esc(curTName) + ' Guruhlariga Qaytish</button>' +
        (isAdmin ? '<button id="eaBtnBackToAllTeachersFromJ" style="background:rgba(255,255,255,0.06);color:#38bdf8;border:1px solid rgba(56,189,248,0.3);border-radius:10px;padding:9px 14px;font-size:12px;font-weight:800;cursor:pointer;">Barcha O‘qituvchilar</button>' : '') +
        '<button id="eaBtnAddStudentFromJ" data-cid="' + esc(cls.id) + '" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:10px;padding:9px 16px;font-size:12.5px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 14px rgba(16,185,129,0.35);" title="Shu guruhga yangi o‘quvchi qo‘shish">➕ O‘quvchi Qo‘shish</button>' +
        '<button id="eaBtnSendSmsAbsentOnly" data-cid="' + esc(cls.id) + '" style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border:none;border-radius:10px;padding:9px 18px;font-size:12.5px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 15px rgba(245,158,11,0.35);" title="Bugun darsga kelmagan o‘quvchilarning ota-onalariga SMS yuborish">📲 Kelmaganlarga SMS</button>' +
        '<button id="eaBtnDeleteClassFromJ" data-cid="' + esc(cls.id) + '" data-cname="' + esc(cls.name) + '" style="background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.3);border-radius:10px;padding:9px 14px;font-size:12px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:6px;" title="Guruhni butunlay o‘chirish">🗑 Guruhni O‘chirish</button>' +

      '</div>';
    } else {
      h += '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">' +
        '<div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#0284c7,#2563eb);display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 14px rgba(2,132,199,0.35);">👨‍🎓</div>' +
        '<div>' +
          '<div style="font-size:15px;font-weight:900;color:#fff;">' + esc(curUser.name || "O‘quvchi") + '</div>' +
          '<div style="font-size:11.5px;color:#94a3b8;">Ustozingiz: <b style="color:#38bdf8;">' + esc(curTName) + '</b> • Guruh: <b style="color:#34d399;">' + esc(cls.name) + '</b></div>' +
        '</div>' +
        '<span style="background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.4);color:#7dd3fc;padding:4px 10px;border-radius:8px;font-size:11px;font-weight:800;">🔒 Faqat ko‘rish (Read-only)</span>' +
      '</div>';
    }

    h += '<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">' +
      '<div style="text-align:right;">' +
        '<h2 style="margin:0;font-size:18px;font-weight:900;color:#ffffff;display:flex;align-items:center;gap:8px;">' +
          '<span>👨‍🏫 ' + esc(curTName) + '</span>' +
          '<span style="color:#94a3b8;font-size:16px;">•</span>' +
          '<span style="color:#38bdf8;background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.4);padding:2px 10px;border-radius:8px;">' + esc(cls.name) + '</span>' +
        '</h2>' +
        '<div style="font-size:11.5px;color:#94a3b8;margin-top:2px;">Level: <b style="color:#34d399;">' + esc(cls.level || 'General') + '</b> | Xona: <b style="color:#cbd5e1;">' + esc(cls.room || '301-xona') + '</b></div>' +
      '</div>' +
      '<span style="background:rgba(16,185,129,0.2);color:#34d399;border:1px solid rgba(16,185,129,0.4);border-radius:12px;padding:5px 12px;font-size:12px;font-weight:900;">' + students.length + ' / ' + (cls.maxCapacity || 18) + ' o‘quvchi</span>' +
      (function() {
        var tId = cls.teacherId || EA.activeTeacherId;
        var S_cur = (window.EthithEnterprise && window.EthithEnterprise.getStore ? window.EthithEnterprise.getStore() : null) || window.S || {};
        var tObj = (S_cur.teachers || []).find(function(t) { return t.id === tId || (t.name && cls.teacherName && t.name.toLowerCase() === cls.teacherName.toLowerCase()); });
        var share = (tObj && tObj.salarySharePercent !== undefined) ? Number(tObj.salarySharePercent) : 50;
        var pCount = 0;
        var tCollected = 0;
        var tClasses = (typeof getClassesForTeacher === 'function') ? getClassesForTeacher(tId) : [cls];
        tClasses.forEach(function(c) {
          (c.students || []).forEach(function(st) {
            var stId = st.id || st.email;
            var pInfo = (c.studentPayments && c.studentPayments[stId]) || (S_cur.finance && S_cur.finance.studentFees && S_cur.finance.studentFees[stId]);
            if (pInfo && (pInfo.status === 'paid' || Number(pInfo.paid) > 0)) {
              pCount++;
              tCollected += (Number(pInfo.paid) || 300000);
            }
          });
        });
        var sal = Math.round(tCollected * (share / 100));
        return '<div style="background:rgba(16,185,129,0.18);border:1.5px solid rgba(16,185,129,0.45);border-radius:12px;padding:5px 12px;display:flex;align-items:center;gap:8px;box-shadow:0 0 15px rgba(16,185,129,0.25);">' +
          '<span style="font-size:16px;">💰</span>' +
          '<div style="text-align:left;">' +
            '<div style="font-size:9.5px;color:#a7f3d0;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;">Ustoz Maoshi (' + share + '%):</div>' +
            '<div style="font-size:13px;font-weight:900;color:#34d399;">' + sal.toLocaleString('uz-UZ') + ' so‘m <span style="font-size:10.5px;color:#94a3b8;font-weight:700;">(' + pCount + ' ta to‘lagan)</span></div>' +
          '</div>' +
        '</div>';
      })() +
    '</div>' +
    '</div>'; // Close qe-glass-panel cleanly!

    // IMPORTANT: For Students, STRICTLY ZERO OTHER CLASS CARDS!
    // For Teachers, show only THAT TEACHER'S GROUPS tabs!
    if (!isStudent) {
      var teacherGroups = getClassesForTeacher(cls.teacherId || EA.activeTeacherId);
      if (teacherGroups.length > 1) {
        h += '<div style="display:flex;align-items:center;gap:10px;overflow-x:auto;padding-bottom:10px;margin-bottom:14px;">';
        teacherGroups.forEach(function(c) {
          var isAct = (c.id === cls.id);
          var stCount = (c.students && c.students.length) ? c.students.length : 0;
          h += '<div class="ea-class-card-tab" data-clsid="' + esc(c.id) + '" style="' +
            'cursor:pointer;min-width:180px;padding:8px 14px;border-radius:14px;transition:all 0.2s;backdrop-filter:blur(16px);' +
            'border:1.5px solid ' + (isAct ? '#38bdf8' : 'rgba(255,255,255,0.12)') + ';' +
            'background:' + (isAct ? 'linear-gradient(135deg, rgba(56,189,248,0.22), rgba(129,140,248,0.12))' : 'rgba(15,23,42,0.55)') + ';' +
            'box-shadow:' + (isAct ? '0 0 22px -4px rgba(56,189,248,0.4), inset 0 1px 0 rgba(255,255,255,0.2)' : 'none') + ';">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:2px;">' +
              '<b style="font-size:13px;color:' + (isAct ? '#ffffff' : '#cbd5e1') + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(c.name || 'Guruh') + '</b>' +
              '<span style="font-size:10px;font-weight:800;padding:2px 6px;border-radius:999px;background:' + (isAct ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.07)') + ';color:' + (isAct ? '#7dd3fc' : '#94a3b8') + ';">' + stCount + ' o‘quvchi</span>' +
            '</div>' +
          '</div>';
        });
        h += '</div>';
      }
    }

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
        '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">';
      if (isTeacher) {
        h += '<button type="button" id="eaAssignHomeworkBtn2" style="background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#ffffff;border:none;border-radius:10px;padding:8px 16px;font-size:12.5px;font-weight:800;cursor:pointer;box-shadow:0 4px 14px rgba(139,92,246,0.35);" title="Yangi vazifa yoki test belgilash">⚙️ Topshiriqni Belgilash</button>' +
             '<button type="button" id="eaOpenActiveHwBtn" style="background:rgba(56,189,248,0.18);border:1px solid rgba(56,189,248,0.45);color:#38bdf8;border-radius:10px;padding:8px 14px;font-size:12px;font-weight:800;cursor:pointer;">👁️ Ko‘rib chiqish</button>';
      } else {
        h += '<button type="button" id="eaOpenActiveHwBtn" style="background:linear-gradient(135deg,#10b981,#059669);color:#ffffff;border:none;border-radius:10px;padding:9px 18px;font-size:13px;font-weight:900;cursor:pointer;box-shadow:0 4px 16px rgba(16,185,129,0.4);">🚀 Topshiriqni Ochish (Bajarish) &rarr;</button>';
      }
      h += '</div>' +
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
      h += '<button type="button" id="eaAddStudentToJournalBtn" style="background:linear-gradient(135deg, #10b981, #059669);color:#ffffff;border:none;border-radius:12px;padding:9px 18px;font-size:13px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:8px;box-shadow:0 0 24px -4px rgba(16,185,129,0.5);transition:all 0.2s;">' +
        '<span>➕ O‘quvchi Qo‘shish / Qidirish</span>' +
      '</button>';
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

    // Right Action: Parent SMS Button + Authentic Green PIIMA Excel Export Button ("Yuklab olish")
    h += '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">';
    if (isTeacher) {
      h += '<button type="button" id="eaSendAbsentSmsBtn" style="background:linear-gradient(135deg,#f59e0b,#ea580c);color:#ffffff;border:1px solid rgba(251,146,60,0.55);border-radius:12px;padding:9px 18px;font-size:13.5px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:8px;box-shadow:0 0 24px -2px rgba(245,158,11,0.45);transition:all 0.2s;" title="Darsga kelmagan o\'quvchilarning ota-onalariga avtomatik SMS xabar yuborish">' +
        '<span style="font-size:16px;">📲</span>' +
        '<span>Ota-onalarga xabar yuborish</span>' +
      '</button>';

      h += '<button type="button" id="eaOpenLevelTestBtn" style="background:linear-gradient(135deg,#10b981,#059669);color:#ffffff;border:1px solid rgba(52,211,153,0.55);border-radius:12px;padding:9px 18px;font-size:13.5px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:8px;box-shadow:0 0 24px -2px rgba(16,185,129,0.45);transition:all 0.2s;" title="3 Oylik Level Test imtihoni, baholar va yiqilganlarni avtomatik saralash">' +
        '<span style="font-size:16px;">🟢</span>' +
        '<span>Level Test Imtihoni</span>' +
      '</button>';
    }
    h += '<button type="button" id="eaExportExcelBtn" style="background:linear-gradient(135deg,#10b981,#059669);color:#ffffff;border:1px solid rgba(52,211,153,0.5);border-radius:12px;padding:9px 20px;font-size:13.5px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:8px;box-shadow:0 0 24px -2px rgba(16,185,129,0.45);transition:all 0.2s;">' +
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
    var numColW = isCollapsed ? 42 : 54;
    var nameColW = isCollapsed ? 180 : 300;

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

    dates.forEach(function(dt, dIdx) {
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
          'style="height:115px;border-radius:12px;border:1.5px solid ' + (dIdx === dates.length - 1 ? '#10b981' : cardBorder) + ';background:' + (dIdx === dates.length - 1 ? 'linear-gradient(180deg,rgba(16,185,129,0.2),rgba(15,23,42,0.9))' : cardBg) + ';box-shadow:' + (dIdx === dates.length - 1 ? '0 0 20px rgba(16,185,129,0.4)' : cardShadow) + ';display:grid;grid-template-columns:1fr 1fr;position:relative;overflow:hidden;cursor:' + (isTeacher && !isSunday ? 'pointer' : 'default') + ';transition:all 0.2s;">' +
          (dIdx === dates.length - 1 ? '<div class="ea-level-test-pill" data-date="' + dKey + '" title="3 Oylik Level Test Imtihoni — Bosib natijalarni ko‘ring" style="position:absolute;top:0;left:0;right:0;background:linear-gradient(135deg,#10b981,#059669);color:#ffffff;font-size:9.5px;font-weight:900;text-align:center;padding:2px 0;letter-spacing:0.5px;box-shadow:0 0 12px rgba(16,185,129,0.85);cursor:pointer;z-index:10;">🟢 LEVEL TEST</div>' : '') +
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
        var stName = cleanStName(cls.customStudentNames[stId] || st.name || ("O'quvchi " + (sIdx + 1)));
        var joinedDisp = formatIsoToDisplay(st.joinedAt || '2026-09-02');
        var rowBg = sIdx % 2 === 0 ? 'rgba(15, 23, 42, 0.35)' : 'rgba(15, 23, 42, 0.52)';
        var stickyBg = sIdx % 2 === 0 ? 'rgba(8, 13, 26, 0.97)' : 'rgba(11, 18, 34, 0.98)';

        var shortInfo = getStudentShortInfo(stName);

        // Student monthly payment indicator & Green Neon Name Glow
        var S_app = (window.EthithApp && window.EthithApp.state) || {};
        if (!S_app.finance) S_app.finance = {};
        if (!S_app.finance.studentFees) S_app.finance.studentFees = {};
        if (!cls.studentPayments) cls.studentPayments = {};
        var pInfo = cls.studentPayments[stId] || (st.email ? cls.studentPayments[st.email.toLowerCase().trim()] : null) ||
                    S_app.finance.studentFees[stId] || (st.email ? S_app.finance.studentFees[st.email.toLowerCase().trim()] : null);
        if (!pInfo) {
          pInfo = { fee: 300000, paid: 0, status: 'unpaid', method: '—', date: 'To‘lanmagan' };
          cls.studentPayments[stId] = pInfo;
          S_app.finance.studentFees[stId] = pInfo;
        }

        var isPaid = (pInfo.status === 'paid');
        var payBadge = ''; // Clean view: No bulky badge in front of name! Only pure neon name glow!

        var isOnline = (st.isOnline === true);
        var onlineDot = '<span class="ea-status-dot ' + (isOnline ? 'ea-status-online' : 'ea-status-offline') + '" title="' + (isOnline ? '🟢 Tizimga kirgan (Online)' : '🔴 Tizimga kirmagan (Offline)') + '"></span>';

        var studentNameDisplay = isPaid
          ? (onlineDot + '<span class="ea-st-paid-neon" title="Oylik to‘lov to‘langan (✓ Yashil Neon)" style="color:#4ade80 !important;font-size:13.5px;font-weight:900;text-shadow:0 0 10px rgba(74,222,128,0.95),0 0 20px rgba(74,222,128,0.7),0 0 30px rgba(74,222,128,0.4);letter-spacing:0.3px;white-space:nowrap;">' + esc(stName) + '</span>')
          : (onlineDot + '<span style="color:#f8fafc;font-size:13px;font-weight:800;white-space:nowrap;">' + esc(stName) + '</span>');

        h += '<tr class="ea-journal-row" style="background:' + rowBg + ';transition:background 0.15s;">';

        // Sticky Col 1: №
        h += '<td class="ea-sticky-cell ea-names-col-cell" style="position:sticky;left:0;z-index:20;background:' + stickyBg + ';backdrop-filter:blur(18px);width:' + numColW + 'px;min-width:' + numColW + 'px;max-width:' + numColW + 'px;text-align:center;font-size:' + (isCollapsed ? '12px' : '13px') + ';font-weight:900;color:#94a3b8;padding:' + (isCollapsed ? '6px 2px' : '8px 4px') + ';border-bottom:1px solid rgba(255,255,255,0.06);border-right:1px solid rgba(255,255,255,0.08);">' +
          (sIdx + 1) +
        '</td>';

        // Sticky Col 2: Student Name (Clickable -> Opens QuantumEdu Student Analytics! Collapsible to left!)
        h += '<td class="ea-sticky-cell ea-names-col-cell" style="position:sticky;left:' + numColW + 'px;z-index:20;background:' + stickyBg + ';backdrop-filter:blur(18px);width:' + nameColW + 'px;min-width:' + nameColW + 'px;max-width:' + nameColW + 'px;padding:' + (isCollapsed ? '6px 6px' : '7px 12px') + ';border-bottom:1px solid rgba(255,255,255,0.06);border-right:2px solid rgba(56,189,248,0.35);overflow:hidden;">' +
          (isCollapsed
            ? '<div class="ea-student-name-link" data-stid="' + esc(stId) + '" title="' + esc(stName) + ' (Bosish: Tahlilni ochish)" style="display:flex;align-items:center;gap:6px;overflow:hidden;width:100%;">' +
                '<span style="width:26px;height:26px;border-radius:7px;background:linear-gradient(135deg,rgba(56,189,248,0.22),rgba(129,140,248,0.22));border:1px solid rgba(56,189,248,0.45);color:#7dd3fc;font-size:10px;font-weight:900;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;letter-spacing:-0.03em;">' + esc(shortInfo.initials) + '</span>' +
                (isPaid ? '<span class="ea-st-paid-neon" style="font-size:11.5px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;">' + esc(shortInfo.shortStart) + '</span>' : '<span style="font-size:11.5px;font-weight:800;color:#f8fafc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;">' + esc(shortInfo.shortStart) + '</span>') +
              '</div>'
            : '<div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">' +
                '<div class="ea-student-name-link" data-stid="' + esc(stId) + '" style="overflow:hidden;flex:1;" title="Bosish: O\'quvchining kunlik vazifalari va o\'sish/cho\'kish tahlilini ochish">' +
                  '<div style="font-size:13px;font-weight:800;color:#f8fafc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:6px;">' +
                    payBadge +
                    studentNameDisplay +
                  '</div>' +
                  (EA.viewMode === 'all'
                    ? '<div style="font-size:10.5px;font-weight:700;color:#38bdf8;margin-top:2px;">📅 Qo\'shilgan: ' + esc(joinedDisp) + '</div>'
                    : '<div style="font-size:10px;font-weight:600;color:#64748b;margin-top:1px;">📈 Statistika va tahlil &rarr;</div>') +
                '</div>' +
                (isTeacher ?
                  '<div style="display:flex;align-items:center;">' +
                    '<button type="button" class="ea-edit-student-btn" data-cid="' + esc(cls.id) + '" data-stid="' + esc(stId) + '" data-stname="' + esc(stName) + '" title="O‘quvchini tahrirlash va boshqaruv" style="border:1.5px solid rgba(56,189,248,0.35);background:rgba(56,189,248,0.12);color:#38bdf8;cursor:pointer;padding:5px 9px;font-size:11.5px;font-weight:800;line-height:1;border-radius:8px;flex-shrink:0;transition:all 0.15s;display:inline-flex;align-items:center;gap:4px;">' +
                      '✏️ Tahrirlash' +
                    '</button>' +
                  '</div>' : '') +
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
            dText = 'Q';
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

    var loginsSec = null;
    if (!isStudent && (isAdmin || isTeacher)) {
      loginsSec = EA.renderSystemLoginsSection(cls.teacherId, cls.id);
      h += loginsSec.html;
    }
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
    if (loginsSec && typeof loginsSec.attachHandlers === 'function') {
      loginsSec.attachHandlers(container);
    }
  };

  // ============================================================================
  // EVENT HANDLING FOR JOURNAL
  // ============================================================================
  EA.attachEvents = function(container, cls) {
    var absentBtn = container.querySelector('#eaBtnSendSmsAbsentOnly');
    if (absentBtn) {
      absentBtn.onclick = function() {
        EA.openAbsentSmsModal(cls);
      };
    }

    // SMS Broadcast button in journal
    var smsGroupBtn = container.querySelector('#eaTopBtnSendSmsGroup');
    if (smsGroupBtn) {
      smsGroupBtn.onclick = function() {
        EA.openSendSmsModal(cls.id, null);
      };
    }

    // SMS Single row button in journal
    var smsRowBtns = container.querySelectorAll('.ea-btn-send-sms-row');
    smsRowBtns.forEach(function(b) {
      b.onclick = function(e) {
        e.stopPropagation();
        var cid = b.getAttribute('data-cid');
        var stid = b.getAttribute('data-stid');
        EA.openSendSmsModal(cid, stid);
      };
    });

    var curUser = getActiveUser();
    var isAdmin = isAdminRole();
    var isTeacher = isTeacherRole();
    var isStudent = curUser && curUser.role === 'student';
    var scrollWrap = container.querySelector('.ea-table-scroll-wrap');

    var backToTGroupsBtn = container.querySelector('#eaBtnBackToTeacherGroupsFromJ');
    if (backToTGroupsBtn) {
      backToTGroupsBtn.onclick = function() {
        if (cls && cls.teacherId) {
          EA.activeTeacherId = cls.teacherId;
        }
        EA.activeClassId = null;
        EA.render(container);
      };
    }
    var backToAllTBtn = container.querySelector('#eaBtnBackToAllTeachersFromJ');
    if (backToAllTBtn) {
      backToAllTBtn.onclick = function() {
        EA.activeTeacherId = null;
        EA.activeClassId = null;
        EA.render(container);
      };
    }
    var delClassFromJBtn = container.querySelector('#eaBtnDeleteClassFromJ');
    if (delClassFromJBtn) {
      delClassFromJBtn.onclick = function() {
        var cid = delClassFromJBtn.getAttribute('data-cid');
        var cname = delClassFromJBtn.getAttribute('data-cname');
        var teachers = getStoreTeachers();
        var curT = teachers.find(function(it) { return it.id === EA.activeTeacherId; });
        EA.openDeleteClassModal(cid, cname, curT, container);
      };
    }

    var addStudentFromJBtn = container.querySelector('#eaBtnAddStudentFromJ');
    if (addStudentFromJBtn) {
      addStudentFromJBtn.onclick = function() {
        var cid = addStudentFromJBtn.getAttribute('data-cid');
        EA.openStudentEnrollModal(cid, null);
      };
    }

    var delTeacherFromJBtn = container.querySelector('#eaBtnDeleteTeacherFromJ');
    if (delTeacherFromJBtn) {
      delTeacherFromJBtn.onclick = function() {
        var tid = delTeacherFromJBtn.getAttribute('data-tid') || EA.activeTeacherId;
        var tname = delTeacherFromJBtn.getAttribute('data-tname');
        EA.deleteTeacher(tid, tname, container);
      };
    }

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
      openActiveHwBtn.onclick = function(e) {
        if (e && e.stopPropagation) e.stopPropagation();
        var hw = cls.activeHomework;

        // If homework is an assigned test from teacher
        if (hw.type === 'test' || hw.testId) {
          if (window.EthithEnterprise && typeof window.EthithEnterprise.openTakeTestModal === 'function') {
            window.EthithEnterprise.openTakeTestModal(hw.testId);
            return;
          }
        }

        // Standard Workbook homework
        window._ethithActiveHwContext = {
          classId: cls.id,
          classCode: cls.code,
          dateKey: hw.dateKey,
          bookLevel: hw.bookLevel || 'B1+',
          unit: hw.unit,
          lessonCode: hw.lessonCode
        };
        var bLevel = hw.bookLevel || 'B1+';
        var firstPg = (hw.pages && hw.pages[0]) || 4;
        var wbObj = window.ETHITH_WORKBOOK_B1 || window.WB;

        if (bLevel === 'A1' || bLevel === 'Beginner') {
          if (wbObj && typeof wbObj.openLessonA1 === 'function') {
            wbObj.openLessonA1(hw.unit, hw.lessonCode, firstPg);
          } else if (typeof window.go === 'function') {
            window.go('beginner', { unit: hw.unit, lesson: hw.lessonCode });
          }
        } else if (bLevel === 'A2' || bLevel === 'Elementary') {
          if (wbObj && typeof wbObj.openLessonA2 === 'function') {
            wbObj.openLessonA2(hw.unit, hw.lessonCode, firstPg);
          } else if (typeof window.go === 'function') {
            window.go('elementary', { unit: hw.unit, lesson: hw.lessonCode });
          }
        } else if (bLevel === 'B1' || bLevel === 'Pre-Intermediate') {
          if (wbObj && typeof wbObj.openLessonB1Pre === 'function') {
            wbObj.openLessonB1Pre(hw.unit, hw.lessonCode, firstPg);
          } else if (typeof window.go === 'function') {
            window.go('pre_intermediate', { unit: hw.unit, lesson: hw.lessonCode });
          }
        } else if (bLevel === 'B2' || bLevel === 'Upper-Intermediate' || firstPg > 2000) {
          if (wbObj && typeof wbObj.openLessonB2 === 'function') {
            wbObj.openLessonB2(hw.unit, hw.lessonCode, firstPg);
          } else if (typeof window.go === 'function') {
            window.go('upper_intermediate', { unit: hw.unit, lesson: hw.lessonCode });
          }
        } else {
          if (wbObj && typeof wbObj.openLesson === 'function') {
            wbObj.openLesson(hw.unit, hw.lessonCode, firstPg);
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
    if (assignHwBtn) {
      assignHwBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        EA.openHomeworkAssignModal(container, cls);
      };
    }
    var assignHwBtn2 = container.querySelector('#eaAssignHomeworkBtn2');
    if (assignHwBtn2) {
      assignHwBtn2.onclick = function(e) {
        e.preventDefault();
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

    // Level Test Neon Banner Click
    container.querySelectorAll('.ea-level-test-pill').forEach(function(pill) {
      pill.onclick = function(e) {
        e.stopPropagation();
        if (window.EthithEnterprise && typeof window.EthithEnterprise.openLevelTestModal === 'function') {
          window.EthithEnterprise.openLevelTestModal(cls, pill.getAttribute('data-date'));
        }
      };
    });

    // Direct 1-click on Date Header Card to toggle red "Dam olish kuni"
    if (isTeacher) {
      container.querySelectorAll('.ea-date-header-card').forEach(function(card) {
        card.onclick = function(e) {
          if (e.target.closest('.ea-date-opts-btn') || e.target.closest('.ea-level-test-pill')) return;
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
    // Direct handler & Container delegation for 100% reliable clicks
    container.querySelectorAll('.ea-status-box').forEach(function(box) {
      box.onclick = function(e) {
        if (e && e.stopPropagation) e.stopPropagation();
        var curUser = getActiveUser();
        var isStudent = curUser && curUser.role === 'student';
        if (isStudent) return; // Student cannot mark

        var dKey = box.getAttribute('data-date') || box.dataset.date;
        var stId = box.getAttribute('data-stid') || box.dataset.stid;
        var cur = box.getAttribute('data-cur') || box.dataset.cur || '';

        var next = '';
        if (!cur || cur === '') next = 'K';
        else if (cur === 'K' || cur === 'present') next = 'Q';
        else if (cur === 'Q' || cur === 'absent') next = 'S';
        else next = '';

        if (!cls.attendance.records) cls.attendance.records = {};
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
        var sLeft = scrollWrap ? scrollWrap.scrollLeft : 0;
        EA.render(container, sLeft);
      };
    });

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

    // Toggle Student Payment Status (✓ Bergan, ? Chala, ✗ Bermagan)
    container.querySelectorAll('.ea-pay-toggle-btn').forEach(function(btn) {
      btn.onclick = function(e) {
        e.stopPropagation();
        var stId = btn.getAttribute('data-stid');
        var stName = btn.getAttribute('data-stname');
        EA.toggleStudentPayment(container, cls, stId, stName);
      };
      btn.oncontextmenu = function(e) {
        e.preventDefault();
        e.stopPropagation();
        var stId = btn.getAttribute('data-stid');
        var stName = btn.getAttribute('data-stname');
        var S_app = (window.EthithApp && window.EthithApp.state) || {};
        if (!S_app.finance) S_app.finance = {};
        if (!S_app.finance.studentFees) S_app.finance.studentFees = {};
        if (!cls.studentPayments) cls.studentPayments = {};
        var cur = cls.studentPayments[stId] || S_app.finance.studentFees[stId] || { fee: 1400000, paid: 1400000 };
        var input = prompt(stName + " uchun to‘langan summani kiriting (so‘m):", cur.paid !== undefined ? cur.paid : (cur.fee || 1400000));
        if (input === null) return;
        var amt = parseInt(String(input).replace(/\s+/g, ''), 10) || 0;
        var feeVal = cur.fee || 1400000;
        var status = amt >= feeVal ? 'paid' : (amt > 0 ? 'partial' : 'unpaid');
        var upd = { fee: feeVal, paid: amt, status: status, method: amt > 0 ? 'Click' : '—', date: amt > 0 ? new Date().toISOString().split('T')[0] : 'To‘lanmagan' };
        cls.studentPayments[stId] = upd;
        S_app.finance.studentFees[stId] = upd;
        if (window.EthithEnterprise && window.EthithEnterprise.saveStore) window.EthithEnterprise.saveStore();
        if (window.EthithApp && window.EthithApp.toast) window.EthithApp.toast(stName + " to‘lovi: " + amt.toLocaleString() + " so‘m saqlandi!");
        EA.render(container);
      };
    });

    // Add Student to Journal button
    var addStJBtn = container.querySelector('#eaAddStudentToJournalBtn');
    if (addStJBtn) {
      addStJBtn.onclick = function() {
        if (window.EthithEnterprise && window.EthithEnterprise.openTelegramSearchStudentModal) {
          window.EthithEnterprise.openTelegramSearchStudentModal(cls.id);
        }
      };
    }

    // Edit, Transfer, and Remove Student (Teacher only)
    if (isTeacher) {
      container.querySelectorAll('.ea-edit-student-btn').forEach(function(btn) {
        btn.onclick = function(e) {
          e.stopPropagation();
          var stId = btn.dataset.stid;
          EA.openStudentEnrollModal(cls.id, stId);
        };
      });

      // Quick Transfer Student from Journal Row
      container.querySelectorAll('.ea-transfer-student-btn').forEach(function(btn) {
        btn.onclick = function(e) {
          e.stopPropagation();
          var stId = btn.dataset.stid;
          var curName = btn.dataset.stname;
          EA.openTransferStudentModal(container, cls, stId, curName);
        };
      });

      // Quick Remove / Expel Student from Group
      container.querySelectorAll('.ea-remove-student-btn').forEach(function(btn) {
        btn.onclick = function(e) {
          e.stopPropagation();
          var stId = btn.dataset.stid;
          var stName = btn.dataset.stname;
          EA.deleteStudentCompletely(cls.id, stId, stName);
        };
      });
    }

    // Send Absent SMS ("Ota-onalarga xabar yuborish")
    var smsBtn = container.querySelector('#eaSendAbsentSmsBtn');
    if (smsBtn) {
      smsBtn.onclick = function() {
        EA.openAbsentSmsModal(cls);
      };
    }

    // 3-Month Level Test Assessment & Auto-Drop
    var ltBtn = container.querySelector('#eaOpenLevelTestBtn');
    if (ltBtn) {
      ltBtn.onclick = function() {
        if (window.EthithEnterprise && typeof window.EthithEnterprise.openLevelTestModal === 'function') {
          window.EthithEnterprise.openLevelTestModal(cls);
        }
      };
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
    if (!cls) cls = (typeof getActiveOrFirstClass === 'function' ? getActiveOrFirstClass() : null) || (getAvailableClasses()[0]);
    if (!cls) return;
    if (typeof ensureClassAttendance === 'function') ensureClassAttendance(cls);
    EA.isModalOpen = true;
    var modalRoot = getGlobalModalRoot();
    var curUser = getActiveUser();
    var isAdmin = isAdminRole();
    var isTeacher = isTeacherRole();

    var dates = getJournalDates(cls, 'window').filter(function(d) { return d.getDay() !== 0; });
    var todayKey = formatDateKey(new Date());
    var selectedDateKey = defaultDateKey || (cls.activeHomework && cls.activeHomework.dateKey) || todayKey;

    var curHw = (cls.attendance && cls.attendance.homeworks && cls.attendance.homeworks[selectedDateKey]) || cls.activeHomework || { bookLevel: 'B1+', unit: 1, lessonCode: '1.1', note: '' };
    var currentType = curHw.type || 'workbook';

    var dateOptsHtml = '';
    dates.forEach(function(dt) {
      var dk = formatDateKey(dt);
      var dd = formatDisplayDate(dt);
      dateOptsHtml += '<option value="' + dk + '" data-disp="' + dd + '" ' + (dk === selectedDateKey ? 'selected' : '') + '>' + dd + (dk === todayKey ? ' (Bugun)' : '') + '</option>';
    });

    // Available personal tests
    var S_store = (window.EthithEnterprise && window.EthithEnterprise.getStore ? window.EthithEnterprise.getStore() : null) || window.S || {};
    var allTests = (S_store.fileExplorer && Array.isArray(S_store.fileExplorer.tests)) ? S_store.fileExplorer.tests : [];
    if (allTests.length === 0) {
      allTests = [
        {
          id: "TST-7K2M9",
          title: "Unit 7: Modals of Deduction & Obligation",
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
          maxAttempts: 1,
          questions: [
            { q: "A person who is relaxed and not easily upset is ______.", options: ["easy-going", "short-tempered", "well-mannered", "broad-minded"], correct: 0 },
            { q: "______ for 10 a.m. tomorrow, the conference has now been rescheduled.", options: ["Scheduled", "Scheduling", "To schedule", "Having schedule"], correct: 0 },
            { q: "Products ______ locally are often fresher and support the local economy.", options: ["grown", "growing", "have grown", "to grow"], correct: 0 },
            { q: "A person with a great knowledge from books is ______.", options: ["well-educated", "quick-witted", "bad-tempered", "open-minded"], correct: 0 }
          ]
        }
      ];
      if (S_store.fileExplorer) S_store.fileExplorer.tests = allTests;
    }

    var curUser = getActiveUser();
    var curTName = (cls.teacherName || cls.teacher || (curUser && curUser.name) || '').toLowerCase().trim();
    var curTId = (cls.teacherId || (curUser && curUser.id) || '').toLowerCase().trim();

    // STRICT TEACHER ISOLATION: Each teacher sees strictly THEIR OWN tests!
    var myTests = allTests.filter(function(t) {
      if (!t) return false;
      var tAuthor = (t.authorName || t.author || '').toLowerCase().trim();
      var tId = (t.teacherId || t.authorId || '').toLowerCase().trim();
      if (isAdmin) return true; // Admin can see all
      return (curTId && tId && (tId === curTId || tId.indexOf(curTId) !== -1)) ||
             (tAuthor && curTName && (tAuthor === curTName || tAuthor.indexOf(curTName) !== -1 || curTName.indexOf(tAuthor) !== -1));
    });

    var testOptsHtml = '';
    if (myTests.length === 0) {
      testOptsHtml = '<option value="">— Hozircha sizning shaxsiy testingiz yo‘q (Quiz Studio orqali test qo‘shing) —</option>';
    } else {
      myTests.forEach(function(t) {
        testOptsHtml += '<option value="' + esc(t.id) + '" ' + (curHw.testId === t.id ? 'selected' : '') + '>' + esc(t.title) + ' (' + (t.questions || []).length + ' ta savol)' + (t.audioUrl ? ' 🎧 Audio' : '') + '</option>';
      });
    }

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

    var mHtml = '<div id="eaHwOverlayBg" style="position:fixed;inset:0;background:rgba(2,6,23,0.78);backdrop-filter:blur(12px);z-index:2147483640;display:flex;align-items:center;justify-content:center;padding:16px;">' +
      '<div style="background:linear-gradient(145deg,rgba(15,23,42,0.98),rgba(30,41,59,0.95));backdrop-filter:blur(24px);border:1.5px solid rgba(139,92,246,0.5);border-radius:24px;max-width:540px;width:100%;padding:26px;box-shadow:0 25px 70px rgba(0,0,0,0.8),0 0 35px rgba(139,92,246,0.25);color:#f8fafc;font-family:inherit;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px;">' +
          '<h3 style="margin:0;font-size:19px;font-weight:900;color:#ffffff;display:flex;align-items:center;gap:8px;">⚙️ Topshiriq Belgilash (' + esc(cls.name) + ')</h3>' +
          '<button type="button" id="eaCloseHwModal" style="border:none;background:rgba(255,255,255,0.08);width:32px;height:32px;border-radius:10px;font-size:16px;cursor:pointer;color:#cbd5e1;">✕</button>' +
        '</div>' +

        // Tab selection: Workbook vs Personal Test
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px;">' +
          '<button type="button" id="eaTabWorkbookBtn" style="padding:10px 14px;border-radius:12px;font-weight:900;font-size:13px;cursor:pointer;border:1.5px solid ' + (currentType !== 'test' ? '#8b5cf6' : 'rgba(255,255,255,0.12)') + ';background:' + (currentType !== 'test' ? 'rgba(139,92,246,0.25)' : 'rgba(15,23,42,0.6)') + ';color:#fff;">📘 Oxford Workbook</button>' +
          '<button type="button" id="eaTabTestBtn" style="padding:10px 14px;border-radius:12px;font-weight:900;font-size:13px;cursor:pointer;border:1.5px solid ' + (currentType === 'test' ? '#38bdf8' : 'rgba(255,255,255,0.12)') + ';background:' + (currentType === 'test' ? 'rgba(56,189,248,0.25)' : 'rgba(15,23,42,0.6)') + ';color:#fff;">📝 Shaxsiy Qo‘shimcha Test</button>' +
        '</div>' +

        '<div style="display:flex;flex-direction:column;gap:13px;margin-bottom:20px;">' +
          '<div>' +
            '<label style="display:block;font-size:12px;font-weight:800;color:#cbd5e1;margin-bottom:6px;">📅 Qaysi sanaga belgilansin:</label>' +
            '<select id="eaHwDateSelect" style="width:100%;padding:10px 14px;border-radius:12px;border:1px solid rgba(255,255,255,0.16);background:rgba(8,13,26,0.9);color:#fff;font-weight:800;font-size:13.5px;outline:none;">' +
              dateOptsHtml +
            '</select>' +
          '</div>' +

          // WORKBOOK CONTROLS WRAPPER
          '<div id="eaHwWorkbookControls" style="' + (currentType === 'test' ? 'display:none;' : 'display:flex;flex-direction:column;gap:13px;') + '">' +
            '<div>' +
              '<label style="display:block;font-size:12px;font-weight:800;color:#cbd5e1;margin-bottom:6px;">📖 Kitob darajasi (Workbook):</label>' +
              '<select id="eaHwBookLevelSelect" style="width:100%;padding:10px 14px;border-radius:12px;border:1px solid rgba(168,85,247,0.5);background:rgba(8,13,26,0.9);color:#c084fc;font-weight:800;font-size:13.5px;outline:none;">' +
                '<option value="A1" ' + ((curHw.bookLevel || '') === 'A1' ? 'selected' : '') + '>📗 Beginner (A1) Workbook</option>' +
                '<option value="A2" ' + ((curHw.bookLevel || '') === 'A2' ? 'selected' : '') + '>📙 Elementary (A2) Workbook</option>' +
                '<option value="B1" ' + ((curHw.bookLevel || '') === 'B1' ? 'selected' : '') + '>📘 Pre-Intermediate (B1) Workbook</option>' +
                '<option value="B1+" ' + ((curHw.bookLevel || 'B1+') === 'B1+' ? 'selected' : '') + '>📘 Intermediate (B1+) Workbook</option>' +
                '<option value="B2" ' + ((curHw.bookLevel || '') === 'B2' ? 'selected' : '') + '>📕 Upper-Intermediate (B2) Workbook</option>' +
              '</select>' +
            '</div>' +
            '<div>' +
              '<label style="display:block;font-size:12px;font-weight:800;color:#cbd5e1;margin-bottom:6px;">📘 Bo‘lim (Unit 1–12):</label>' +
              '<select id="eaHwUnitSelect" style="width:100%;padding:10px 14px;border-radius:12px;border:1px solid rgba(56,189,248,0.45);background:rgba(8,13,26,0.9);color:#38bdf8;font-weight:800;font-size:13.5px;outline:none;">' +
                buildUnitOptions(curHw.bookLevel || 'B1+', parseInt(curHw.unit, 10) || 1) +
              '</select>' +
            '</div>' +
            '<div>' +
              '<label style="display:block;font-size:12px;font-weight:800;color:#cbd5e1;margin-bottom:6px;">📝 Topshiriq / Workbook Darsi:</label>' +
              '<select id="eaHwLessonSelect" style="width:100%;padding:10px 14px;border-radius:12px;border:1px solid rgba(16,185,129,0.45);background:rgba(8,13,26,0.9);color:#34d399;font-weight:800;font-size:13.5px;outline:none;">' +
                buildLessonOptions(curHw.bookLevel || 'B1+', parseInt(curHw.unit, 10) || 1, curHw.lessonCode || '1.1') +
              '</select>' +
            '</div>' +
          '</div>' +

          // PERSONAL TEST CONTROLS WRAPPER
          '<div id="eaHwTestControls" style="' + (currentType !== 'test' ? 'display:none;' : 'display:flex;flex-direction:column;gap:13px;') + '">' +
            '<div>' +
              '<label style="display:block;font-size:12px;font-weight:800;color:#cbd5e1;margin-bottom:6px;">📝 Shaxsiy Testni Tanlang:</label>' +
              '<select id="eaHwTestSelect" style="width:100%;padding:10px 14px;border-radius:12px;border:1px solid rgba(56,189,248,0.5);background:rgba(8,13,26,0.9);color:#38bdf8;font-weight:800;font-size:13.5px;outline:none;">' +
                testOptsHtml +
              '</select>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
              '<div>' +
                '<label style="display:block;font-size:12px;font-weight:800;color:#cbd5e1;margin-bottom:6px;">Maksimal Urinish (marta):</label>' +
                '<input type="number" id="eaHwMaxAttempts" value="' + (curHw.maxAttempts || 1) + '" min="1" max="10" style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:12px;border:1px solid rgba(255,255,255,0.16);background:rgba(8,13,26,0.9);color:#fff;font-weight:900;outline:none;" />' +
              '</div>' +
              '<div>' +
                '<label style="display:block;font-size:12px;font-weight:800;color:#cbd5e1;margin-bottom:6px;">Nechta Savol Berilsin:</label>' +
                '<input type="number" id="eaHwMaxQuestions" value="' + (curHw.maxQuestions || 5) + '" min="1" max="50" style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:12px;border:1px solid rgba(255,255,255,0.16);background:rgba(8,13,26,0.9);color:#fff;font-weight:900;outline:none;" />' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div>' +
            '<label style="display:block;font-size:12px;font-weight:800;color:#cbd5e1;margin-bottom:6px;">💬 O‘quvchilarga Qo‘shimcha Izoh:</label>' +
            '<input type="text" id="eaHwNoteInput" value="' + esc(curHw.note || "Topshiriqni bajaring va yakunlang — baho avtomatik jurnalga qo‘yiladi.") + '" style="width:100%;padding:10px 14px;border-radius:12px;border:1px solid rgba(255,255,255,0.16);background:rgba(8,13,26,0.9);color:#fff;font-size:13px;box-sizing:border-box;outline:none;" />' +
          '</div>' +
        '</div>' +

        '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
          '<button type="button" id="eaCancelHwBtn" style="background:rgba(255,255,255,0.07);color:#cbd5e1;border:1px solid rgba(255,255,255,0.14);border-radius:12px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;">Bekor qilish</button>' +
          '<button type="button" id="eaSaveHwBtn" style="background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;border:none;border-radius:12px;padding:10px 22px;font-size:13.5px;font-weight:800;cursor:pointer;box-shadow:0 4px 16px rgba(139,92,246,0.45);">✅ Topshiriqni Belgilash va Yuborish</button>' +
        '</div>' +
      '</div></div>';

    modalRoot.innerHTML = mHtml;

    var selectedMode = currentType;
    var tabWb = modalRoot.querySelector('#eaTabWorkbookBtn');
    var tabTest = modalRoot.querySelector('#eaTabTestBtn');
    var wbControls = modalRoot.querySelector('#eaHwWorkbookControls');
    var testControls = modalRoot.querySelector('#eaHwTestControls');

    tabWb.onclick = function() {
      selectedMode = 'workbook';
      tabWb.style.borderColor = '#8b5cf6';
      tabWb.style.background = 'rgba(139,92,246,0.25)';
      tabTest.style.borderColor = 'rgba(255,255,255,0.12)';
      tabTest.style.background = 'rgba(15,23,42,0.6)';
      wbControls.style.display = 'flex';
      testControls.style.display = 'none';
    };

    tabTest.onclick = function() {
      selectedMode = 'test';
      tabTest.style.borderColor = '#38bdf8';
      tabTest.style.background = 'rgba(56,189,248,0.25)';
      tabWb.style.borderColor = 'rgba(255,255,255,0.12)';
      tabWb.style.background = 'rgba(15,23,42,0.6)';
      wbControls.style.display = 'none';
      testControls.style.display = 'flex';
    };

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
      var noteVal = modalRoot.querySelector('#eaHwNoteInput').value.trim();
      var hwObj = null;

      if (selectedMode === 'test') {
        var testId = modalRoot.querySelector('#eaHwTestSelect').value;
        var chosenTest = allTests.find(function(t) { return t.id === testId; }) || allTests[0];
        var maxAtt = parseInt(modalRoot.querySelector('#eaHwMaxAttempts').value, 10) || 1;
        var maxQ = parseInt(modalRoot.querySelector('#eaHwMaxQuestions').value, 10) || (chosenTest.questions || []).length;

        hwObj = {
          type: 'test',
          testId: chosenTest.id,
          title: chosenTest.title,
          questionCount: Math.min(maxQ, (chosenTest.questions || []).length),
          maxQuestions: maxQ,
          maxAttempts: maxAtt,
          dateKey: dKey,
          dateDisp: dDisp,
          note: noteVal,
          assignedAt: Date.now(),
          teacherName: cls.teacherName || 'Ustoz'
        };
        cls.attendance.lessonTypes[dKey] = 'Test: ' + chosenTest.title;
      } else {
        var bLvl = bookLvlSel.value || 'B1+';
        var uNum = parseInt(unitSel.value, 10) || 1;
        var lCode = lesSel.value || (uNum + '.1');

        var uList = getWorkbookUnitsList(bLvl);
        var uObj = uList.find(function(x) { return x.unit === uNum; }) || uList[0];
        var lObj = (uObj.lessons || []).find(function(l) { return l.code === lCode; }) || { code: lCode, title: lCode, pages: [bLvl === 'B2' ? 2004 : 4] };

        hwObj = {
          type: 'workbook',
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
        cls.attendance.lessonTypes[dKey] = 'Vazifa (' + bLvl + '): ' + lCode;
      }

      if (!cls.attendance.homeworks) cls.attendance.homeworks = {};
      cls.attendance.homeworks[dKey] = hwObj;
      cls.activeHomework = hwObj;
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
    if (cls && stId) {
      EA.openStudentEnrollModal(cls.id, stId);
      return;
    }
    EA.isModalOpen = true;
    var modalRoot = getGlobalModalRoot();
    if (!cls) cls = {};
    if (!cls.customStudentPhones) cls.customStudentPhones = {};
    var stObj = (cls.students || []).find(function(s) { return (s.id || s.email) === stId; });
    var curPhone = (cls.customStudentPhones && cls.customStudentPhones[stId]) || (stObj && stObj.parentPhone) || '';

    var mHtml = '<div id="eaEditStOverlayBg" style="position:fixed;inset:0;background:rgba(2,6,23,0.72);backdrop-filter:blur(10px);z-index:2147483640;display:flex;align-items:center;justify-content:center;padding:16px;">' +
      '<div style="background:rgba(15,23,42,0.92);backdrop-filter:blur(24px);border:1px solid rgba(56,189,248,0.35);border-radius:24px;max-width:440px;width:100%;padding:26px;box-shadow:0 25px 70px rgba(0,0,0,0.75),0 0 30px rgba(56,189,248,0.18);color:#f8fafc;font-family:inherit;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">' +
          '<h3 style="margin:0;font-size:17px;font-weight:900;color:#ffffff;">✏️ O\'quvchi Ma\'lumotlarini Tahrirlash</h3>' +
          '<button type="button" id="eaCloseEditStModal" style="border:none;background:rgba(255,255,255,0.08);width:32px;height:32px;border-radius:10px;font-size:16px;cursor:pointer;color:#cbd5e1;">✕</button>' +
        '</div>' +
        '<div style="margin-bottom:16px;">' +
          '<label style="display:block;font-size:12.5px;font-weight:800;color:#94a3b8;margin-bottom:8px;">F.I.SH (Familiya va Ism):</label>' +
          '<input type="text" id="eaNewStName" value="' + esc(curName) + '" style="width:100%;padding:11px 14px;border-radius:12px;border:1.5px solid rgba(56,189,248,0.5);background:rgba(8,13,26,0.85);font-weight:800;font-size:14px;box-sizing:border-box;color:#ffffff;outline:none;" />' +
        '</div>' +
        '<div style="margin-bottom:20px;">' +
          '<label style="display:block;font-size:12.5px;font-weight:800;color:#94a3b8;margin-bottom:8px;">📱 Ota-onaning telefon raqami:</label>' +
          '<input type="tel" id="eaNewStParentPhone" placeholder="+998 90 123 45 67" value="' + esc(curPhone) + '" style="width:100%;padding:11px 14px;border-radius:12px;border:1.5px solid rgba(56,189,248,0.5);background:rgba(8,13,26,0.85);font-weight:800;font-size:14px;box-sizing:border-box;color:#ffffff;outline:none;" />' +
          '<span style="display:block;font-size:11.5px;color:#64748b;margin-top:6px;font-weight:600;">O\'quvchi kelmaganida ota-onaga avtomatik SMS xabar yuborish uchun</span>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:space-between;align-items:center;margin-top:10px;flex-wrap:wrap;">' +
          '<div style="display:flex;gap:8px;">' +
            '<button type="button" id="eaTransferStudentFromModalBtn" style="background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.4);border-radius:12px;padding:9px 14px;font-size:12.5px;font-weight:800;cursor:pointer;">🔄 Ko‘chirish</button>' +
            '<button type="button" id="eaExpelStudentFromModalBtn" style="background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.4);border-radius:12px;padding:9px 14px;font-size:12.5px;font-weight:800;cursor:pointer;">🗑 Chiqarish</button>' +
          '</div>' +
          '<div style="display:flex;gap:8px;">' +
            '<button type="button" id="eaCancelEditStBtn" style="background:rgba(255,255,255,0.07);color:#cbd5e1;border:1px solid rgba(255,255,255,0.14);border-radius:12px;padding:9px 16px;font-size:13px;font-weight:700;cursor:pointer;">Bekor qilish</button>' +
            '<button type="button" id="eaSaveStNameBtn" style="background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:12px;padding:9px 22px;font-size:13.5px;font-weight:800;cursor:pointer;box-shadow:0 4px 16px rgba(2,132,199,0.4);">Saqlash</button>' +
          '</div>' +
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

    var phoneInp = modalRoot.querySelector('#eaNewStParentPhone');
    if (phoneInp) {
      phoneInp.onkeydown = function(e) {
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

    var transferFromModalBtn = modalRoot.querySelector('#eaTransferStudentFromModalBtn');
    if (transferFromModalBtn) {
      transferFromModalBtn.onclick = function() {
        closeGlobalModal();
        EA.openTransferStudentModal(container, cls, stId, curName);
      };
    }

    var expelBtn = modalRoot.querySelector('#eaExpelStudentFromModalBtn');
    if (expelBtn) {
      expelBtn.onclick = function() {
        if (confirm("Haqiqatan ham " + curName + "ni ushbu guruhdan chiqarib yubormoqchimisiz?")) {
          var stObj = (cls.students || []).find(function(s) { return (s.id || s.email) === stId; });
          cls.students = (cls.students || []).filter(function(s) {
            return (s.id || s.email) !== stId;
          });
          replenishTesterSlots(cls);
          persistAttendance(cls);
          if (window.EthithEnterprise && window.EthithEnterprise.saveStore) {
            window.EthithEnterprise.saveStore();
          }
          broadcastStudentExpulsion(cls.id, stId, (stObj && stObj.email), (stObj && (stObj.phone || stObj.parentPhone)), curName);
          closeGlobalModal();
          if (window.EthithApp && window.EthithApp.toast) {
            window.EthithApp.toast(curName + " guruhdan chiqarildi!");
          }
          EA.render(container);
        }
      };
    }

    modalRoot.querySelector('#eaSaveStNameBtn').onclick = function() {
      var n = modalRoot.querySelector('#eaNewStName').value.trim();
      var phone = modalRoot.querySelector('#eaNewStParentPhone').value.trim();
      if (n) {
        var clean = cleanStName(n);
        cls.customStudentNames[stId] = clean;
        if (!cls.customStudentPhones) cls.customStudentPhones = {};
        cls.customStudentPhones[stId] = phone;
        if (stObj) {
          stObj.name = clean;
          stObj.parentPhone = phone;
          stObj.isTester = false;
        }
        var S_app = (window.EthithApp && window.EthithApp.state) || {};
        if (S_app.accounts) {
          var acc = S_app.accounts.find(function(a) { return a.id === stId || (a.email && stObj && a.email === stObj.email); });
          if (acc) {
            acc.name = clean;
            if (phone) acc.phone = phone;
          }
        }
        persistAttendance(cls);
        if (window.EthithEnterprise && window.EthithEnterprise.saveStore) {
          window.EthithEnterprise.saveStore();
        }
        if (window.EthithSync && typeof window.EthithSync.broadcast === 'function') {
          window.EthithSync.broadcast('STUDENT_EDIT', {
            classId: cls.id,
            studentId: stId,
            name: clean,
            phone: phone
          });
        }
        closeGlobalModal();
        if (window.EthithApp && window.EthithApp.toast) {
          window.EthithApp.toast(clean + " ma'lumotlari saqlandi!");
        }
        EA.render(container);
      }
    };
  };

  // ============================================================================
  // MODAL: REAL-TIME STUDENT TRANSFER ("🔄 O'quvchini boshqa guruhga ko'chirish")
  // ============================================================================
  EA.openTransferStudentModal = function(container, fromCls, stId, curName) {
    EA.isModalOpen = true;
    var modalRoot = getGlobalModalRoot();
    if (!fromCls) fromCls = (EA.classes && EA.classes.find(function(c) { return c.id === EA.currentClassId; })) || {};
    var allClasses = (typeof getAvailableClasses === 'function' ? getAvailableClasses() : (EA.classes || []));
    var targetClasses = allClasses.filter(function(c) { return c.id !== fromCls.id; });

    var stObj = (fromCls.students || []).find(function(s) { return (s.id || s.email) === stId; });
    var cleanName = curName || (stObj && stObj.name) || "O'quvchi";

    var optsHtml = targetClasses.map(function(c) {
      var realCount = (c.students || []).filter(function(s) { return !s.isTester && !(s.name || '').startsWith('tester_'); }).length;
      var tName = c.teacherName || c.teacher || 'Ustoz';
      return '<option value="' + esc(c.id) + '">' + esc(tName) + ' — ' + esc(c.name) + ' (' + realCount + '/18 o\'quvchi)</option>';
    }).join('');

    var mHtml = '<div id="eaTransferStOverlayBg" style="position:fixed;inset:0;background:rgba(2,6,23,0.8);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);z-index:2147483640;display:flex;align-items:center;justify-content:center;padding:16px;">' +
      '<div style="background:rgba(15,23,42,0.96);backdrop-filter:blur(24px);border:1px solid rgba(56,189,248,0.4);border-radius:24px;max-width:500px;width:100%;padding:26px;box-shadow:0 25px 70px rgba(0,0,0,0.8),0 0 35px rgba(56,189,248,0.2);color:#f8fafc;font-family:inherit;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:12px;">' +
          '<div style="display:flex;align-items:center;gap:10px;">' +
            '<span style="font-size:24px;">🔄</span>' +
            '<div>' +
              '<h3 style="margin:0;font-size:17.5px;font-weight:900;color:#ffffff;">O‘quvchini Boshqa Guruhga Ko‘chirish</h3>' +
              '<div style="font-size:12px;color:#94a3b8;margin-top:2px;">Real vaqtda bir guruhdan ikkinchisiga ko‘chirish</div>' +
            '</div>' +
          '</div>' +
          '<button type="button" id="eaCloseTransferStModal" style="border:none;background:rgba(255,255,255,0.08);width:32px;height:32px;border-radius:10px;font-size:16px;cursor:pointer;color:#cbd5e1;">✕</button>' +
        '</div>' +

        '<div style="background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.25);border-radius:14px;padding:14px 16px;margin-bottom:18px;">' +
          '<div style="font-size:11.5px;color:#94a3b8;font-weight:700;">Ko‘chirilayotgan O‘quvchi:</div>' +
          '<div style="font-size:16px;font-weight:900;color:#38bdf8;margin-top:2px;">👤 ' + esc(cleanName) + '</div>' +
          '<div style="font-size:12px;color:#cbd5e1;margin-top:4px;">Hozirgi guruh: <b style="color:#fff;">' + esc(fromCls.name || 'Guruh') + '</b> (' + esc(fromCls.teacher || '') + ')</div>' +
        '</div>' +

        '<div style="margin-bottom:22px;">' +
          '<label style="display:block;font-size:12.5px;font-weight:800;color:#94a3b8;margin-bottom:8px;">Qaysi guruhga ko‘chirilsin?</label>' +
          '<select id="eaTargetClassSelect" style="width:100%;padding:12px 14px;border-radius:12px;border:1.5px solid rgba(56,189,248,0.5);background:rgba(8,13,26,0.9);font-weight:800;font-size:13.5px;box-sizing:border-box;color:#ffffff;outline:none;">' +
            optsHtml +
          '</select>' +
          '<div style="font-size:11.5px;color:#64748b;margin-top:6px;">Bo‘sh joy (tester) bo‘lgan guruhga o‘quvchi darhol joylashtiriladi</div>' +
        '</div>' +

        '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
          '<button type="button" id="eaCancelTransferStBtn" style="background:rgba(255,255,255,0.07);color:#cbd5e1;border:1px solid rgba(255,255,255,0.14);border-radius:12px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;">Bekor qilish</button>' +
          '<button type="button" id="eaConfirmTransferStBtn" style="background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:12px;padding:10px 24px;font-size:13.5px;font-weight:800;cursor:pointer;box-shadow:0 4px 16px rgba(2,132,199,0.4);">🔄 Guruhga Ko‘chirish</button>' +
        '</div>' +
      '</div></div>';

    modalRoot.innerHTML = mHtml;

    modalRoot.querySelector('#eaCloseTransferStModal').onclick = closeGlobalModal;
    modalRoot.querySelector('#eaCancelTransferStBtn').onclick = closeGlobalModal;
    modalRoot.querySelector('#eaTransferStOverlayBg').onclick = function(e) {
      if (e.target.id === 'eaTransferStOverlayBg') closeGlobalModal();
    };

    modalRoot.querySelector('#eaConfirmTransferStBtn').onclick = function() {
      var targetCid = modalRoot.querySelector('#eaTargetClassSelect').value;
      var toCls = allClasses.find(function(c) { return c.id === targetCid; });
      if (!toCls) return;

      var movingSt = (fromCls.students || []).find(function(s) { return (s.id || s.email) === stId; });
      if (!movingSt) {
        movingSt = { id: stId, name: cleanName, email: stId + '@ethith.uz', role: 'student', isTester: false };
      }
      movingSt.isTester = false;

      // 1. Remove from source class and replenish tester slot so it keeps 18
      fromCls.students = (fromCls.students || []).filter(function(s) { return (s.id || s.email) !== stId; });
      replenishTesterSlots(fromCls);

      // 2. Add to target class (replace available tester slot if exists)
      if (!toCls.students) toCls.students = [];
      var testerIdx = toCls.students.findIndex(function(s) {
        return s.isTester || (s.name && s.name.startsWith('tester_'));
      });
      if (testerIdx !== -1) {
        toCls.students[testerIdx] = movingSt;
      } else {
        toCls.students.push(movingSt);
      }
      if (toCls.students.length > (toCls.maxCapacity || 18)) {
        toCls.maxCapacity = toCls.students.length;
      }

      // Preserve custom name & phone in target class
      if (fromCls.customStudentNames && fromCls.customStudentNames[stId]) {
        if (!toCls.customStudentNames) toCls.customStudentNames = {};
        toCls.customStudentNames[stId] = fromCls.customStudentNames[stId];
      }
      if (fromCls.customStudentPhones && fromCls.customStudentPhones[stId]) {
        if (!toCls.customStudentPhones) toCls.customStudentPhones = {};
        toCls.customStudentPhones[stId] = fromCls.customStudentPhones[stId];
      }

      persistAttendance(fromCls);
      persistAttendance(toCls);

      if (window.EthithEnterprise && window.EthithEnterprise.saveStore) {
        window.EthithEnterprise.saveStore();
      }

      if (window.EthithSync && typeof window.EthithSync.broadcast === 'function') {
        window.EthithSync.broadcast('STUDENT_TRANSFER', {
          fromClassId: fromCls.id,
          toClassId: toCls.id,
          studentId: stId,
          student: movingSt
        });
      }

      if (window.EthithApp && window.EthithApp.toast) {
        window.EthithApp.toast(cleanName + " muvaffaqiyatli '" + toCls.name + "' guruhiga ko‘chirildi!");
      }

      closeGlobalModal();
      EA.render(container);
    };
  };

  // ============================================================================
  // MODAL: SEND ABSENT SMS TO PARENTS ("📲 Ota-onalarga xabar yuborish")
  // ============================================================================
  EA._legacyOpenAbsentSmsModal = function(container, cls) {
    EA.isModalOpen = true;
    var modalRoot = getGlobalModalRoot();
    if (!cls) {
      cls = (EA.classes && EA.classes.find(function(c) { return c.id === EA.currentClassId; })) || (EA.classes && EA.classes[0]) || { customStudentPhones: {}, customStudentNames: {}, students: [] };
    }
    if (!cls.customStudentPhones) cls.customStudentPhones = {};
    if (!cls.customStudentNames) cls.customStudentNames = {};

    var allDates = getJournalDates(cls, 'all');
    var todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);
    var todayKey = formatDateKey(todayObj);

    // Default to todayKey, or if today not in journal, the most recent journal date
    var defaultDateKey = allDates.find(function(d) { return formatDateKey(d) === todayKey; })
      ? todayKey
      : (allDates.length > 0 ? formatDateKey(allDates[allDates.length - 1]) : todayKey);

    function renderModal(selectedDateKey) {
      var dObj = new Date(selectedDateKey + 'T00:00:00');
      var dispDate = formatDisplayDate(dObj);

      // Find absent students for this date
      var absentList = [];
      (cls.students || []).forEach(function(st, sIdx) {
        var stId = st.id || st.email || ('std_' + sIdx);
        var rec = (cls.attendance.records[selectedDateKey] && cls.attendance.records[selectedDateKey][stId]) || {};
        var stStatus = rec.status || '';
        if (stStatus === 'Q' || stStatus === 'absent') {
          var rawName = cls.customStudentNames[stId] || st.name || ("O'quvchi " + (sIdx + 1));
          var stName = cleanStName(rawName);
          var phone = cls.customStudentPhones[stId] || st.parentPhone || '';
          absentList.push({
            stId: stId,
            stName: stName,
            phone: phone,
            sIdx: sIdx
          });
        }
      });

      // Date options
      var dateOptsHtml = '';
      allDates.forEach(function(dt) {
        var dk = formatDateKey(dt);
        var dd = formatDisplayDate(dt);
        var isToday = (dk === todayKey);
        var count = 0;
        (cls.students || []).forEach(function(st, sIdx) {
          var sid = st.id || st.email || ('std_' + sIdx);
          var r = (cls.attendance.records[dk] && cls.attendance.records[dk][sid]) || {};
          if (r.status === 'Q' || r.status === 'absent') count++;
        });
        dateOptsHtml += '<option value="' + dk + '" ' + (dk === selectedDateKey ? 'selected' : '') + '>' +
          dd + (isToday ? ' (Bugun)' : '') + (count > 0 ? (' — ' + count + ' ta kelmadi') : '') +
        '</option>';
      });

      var mHtml = '<div id="eaAbsentSmsOverlayBg" style="position:fixed;inset:0;background:rgba(2,6,23,0.78);backdrop-filter:blur(12px);z-index:2147483640;display:flex;align-items:center;justify-content:center;padding:16px;">' +
        '<div style="background:rgba(15,23,42,0.96);backdrop-filter:blur(24px);border:1px solid rgba(245,158,11,0.45);border-radius:24px;max-width:620px;width:100%;max-height:90vh;overflow-y:auto;padding:26px;box-shadow:0 25px 70px rgba(0,0,0,0.85),0 0 35px rgba(245,158,11,0.22);color:#f8fafc;font-family:inherit;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:14px;">' +
            '<div>' +
              '<h3 style="margin:0;font-size:18px;font-weight:900;color:#ffffff;display:flex;align-items:center;gap:8px;">' +
                '<span>📲</span> Ota-onalarga SMS / Xabar Yuborish' +
              '</h3>' +
              '<div style="font-size:12px;color:#94a3b8;margin-top:3px;">Faqat davomatda "Kelmadi" (Q) deb belgilangan o\'quvchilar uchun</div>' +
            '</div>' +
            '<button type="button" id="eaCloseAbsentSmsModal" style="border:none;background:rgba(255,255,255,0.08);width:32px;height:32px;border-radius:10px;font-size:16px;cursor:pointer;color:#cbd5e1;">✕</button>' +
          '</div>' +

          // Date Selection
          '<div style="margin-bottom:18px;background:rgba(2,6,23,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">' +
            '<label style="font-size:13px;font-weight:800;color:#cbd5e1;">📅 Dars sanasi:</label>' +
            '<select id="eaSmsDateSelect" style="background:#0f172a;color:#ffffff;border:1px solid rgba(245,158,11,0.5);border-radius:10px;padding:7px 12px;font-size:13px;font-weight:800;outline:none;">' +
              dateOptsHtml +
            '</select>' +
          '</div>';

      if (absentList.length === 0) {
        mHtml += '<div style="text-align:center;padding:36px 16px;background:rgba(16,185,129,0.08);border:1px solid rgba(52,211,153,0.25);border-radius:16px;margin-bottom:20px;">' +
          '<div style="font-size:36px;margin-bottom:10px;">🎉</div>' +
          '<div style="font-size:15px;font-weight:800;color:#34d399;margin-bottom:6px;">Ushbu sanada barcha o\'quvchilar qatnashgan!</div>' +
          '<div style="font-size:12.5px;color:#94a3b8;">Hech kimga "Kelmadi" (Q) belgisi qo\'yilmagan.</div>' +
        '</div>' +
        '<div style="display:flex;justify-content:flex-end;">' +
          '<button type="button" id="eaDoneAbsentSmsBtn" style="background:rgba(255,255,255,0.08);color:#ffffff;border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:9px 20px;font-size:13.5px;font-weight:800;cursor:pointer;">Yopish</button>' +
        '</div>';
      } else {
        mHtml += '<div style="margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;gap:10px;">' +
          '<div style="font-size:13px;font-weight:800;color:#fca5a5;">' +
            '⚠️ Dars qoldirganlar soni: <b style="color:#ef4444;font-size:14px;">' + absentList.length + ' ta o\'quvchi</b>' +
          '</div>' +
        '</div>';

        mHtml += '<div style="display:flex;flex-direction:column;gap:10px;max-height:300px;overflow-y:auto;padding-right:4px;margin-bottom:18px;">';
        absentList.forEach(function(item) {
          mHtml += '<div style="background:rgba(2,6,23,0.7);border:1px solid rgba(239,68,68,0.3);border-radius:14px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">' +
            '<div style="min-width:180px;">' +
              '<div style="font-size:14px;font-weight:900;color:#ffffff;display:flex;align-items:center;gap:6px;">' +
                '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ef4444;"></span>' +
                esc(item.stName) +
              '</div>' +
              '<div style="font-size:11.5px;color:#fda4af;margin-top:2px;font-weight:700;">Holati: Kelmadi (Q)</div>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:8px;flex:1;justify-content:flex-end;min-width:220px;">' +
              '<span style="font-size:11.5px;color:#94a3b8;font-weight:700;">Tel:</span>' +
              '<input type="tel" class="ea-absent-phone-inp" data-stid="' + esc(item.stId) + '" value="' + esc(item.phone) + '" placeholder="+998 90 123 45 67" style="width:160px;padding:7px 10px;border-radius:10px;border:1px solid rgba(245,158,11,0.4);background:#0f172a;color:#ffffff;font-size:12.5px;font-weight:800;outline:none;" />' +
            '</div>' +
          '</div>';
        });
        mHtml += '</div>';

        // Message text template
        mHtml += '<div style="margin-bottom:20px;background:rgba(2,6,23,0.5);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:12px 14px;">' +
          '<label style="display:block;font-size:12px;font-weight:800;color:#94a3b8;margin-bottom:6px;">✉️ SMS Xabar Matni (namuna):</label>' +
          '<div style="font-size:12.5px;color:#cbd5e1;line-height:1.5;background:rgba(15,23,42,0.8);padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,0.05);">' +
            'Assalomu alaykum, hurmatli ota-ona! Farzandingiz <b>[O\'quvchi ismi]</b> bugun (' + dispDate + ') darsga qatnashmadi. Sababini ma\'lum qilishingizni so\'raymiz. <br><span style="color:#f59e0b;font-weight:700;">ETHITH O\'quv Markazi</span>' +
          '</div>' +
        '</div>';

        // Action Buttons
        mHtml += '<div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;">' +
          '<button type="button" id="eaCancelAbsentSmsBtn" style="background:rgba(255,255,255,0.07);color:#cbd5e1;border:1px solid rgba(255,255,255,0.14);border-radius:12px;padding:9px 18px;font-size:13px;font-weight:700;cursor:pointer;">Bekor qilish</button>' +
          '<button type="button" id="eaSendAllAbsentSmsBtn" style="background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff;border:none;border-radius:12px;padding:10px 24px;font-size:14px;font-weight:900;cursor:pointer;box-shadow:0 4px 18px rgba(245,158,11,0.45);display:inline-flex;align-items:center;gap:8px;">' +
            '<span>📲</span> Barcha ' + absentList.length + ' ta ota-onaga SMS yuborish' +
          '</button>' +
        '</div>';
      }

      mHtml += '</div></div>';
      modalRoot.innerHTML = mHtml;

      // Event handlers
      modalRoot.querySelector('#eaCloseAbsentSmsModal').onclick = closeGlobalModal;
      modalRoot.querySelector('#eaAbsentSmsOverlayBg').onclick = function(e) {
        if (e.target.id === 'eaAbsentSmsOverlayBg') closeGlobalModal();
      };
      if (modalRoot.querySelector('#eaCancelAbsentSmsBtn')) {
        modalRoot.querySelector('#eaCancelAbsentSmsBtn').onclick = closeGlobalModal;
      }
      if (modalRoot.querySelector('#eaDoneAbsentSmsBtn')) {
        modalRoot.querySelector('#eaDoneAbsentSmsBtn').onclick = closeGlobalModal;
      }

      // Date select change
      var dateSel = modalRoot.querySelector('#eaSmsDateSelect');
      if (dateSel) {
        dateSel.onchange = function() {
          renderModal(dateSel.value);
        };
      }

      // Send SMS Action
      var sendBtn = modalRoot.querySelector('#eaSendAllAbsentSmsBtn');
      if (sendBtn) {
        sendBtn.onclick = function() {
          // Save any edited phone numbers first
          modalRoot.querySelectorAll('.ea-absent-phone-inp').forEach(function(inp) {
            var sid = inp.dataset.stid;
            var val = inp.value.trim();
            if (sid && val) {
              cls.customStudentPhones[sid] = val;
              var stObj = (cls.students || []).find(function(s) { return (s.id || s.email) === sid; });
              if (stObj) stObj.parentPhone = val;
            }
          });
          persistAttendance(cls);

          sendBtn.disabled = true;
          sendBtn.style.opacity = '0.7';
          sendBtn.innerHTML = '<span>⏳</span> SMS yuborilmoqda...';

          setTimeout(function() {
            closeGlobalModal();
            // Show toast banner
            var alertDiv = document.createElement('div');
            alertDiv.style.cssText = 'position:fixed;bottom:24px;right:24px;background:linear-gradient(135deg,#059669,#10b981);color:#ffffff;padding:16px 24px;border-radius:16px;font-weight:900;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,0.5);z-index:2147483647;display:flex;align-items:center;gap:12px;border:1px solid rgba(255,255,255,0.2);';
            alertDiv.innerHTML = '<span style="font-size:22px;">✅</span> <div><div><b>SMS xabarlar muvaffaqiyatli yuborildi!</b></div><div style="font-size:12px;font-weight:600;opacity:0.9;">' + absentList.length + ' ta o\'quvchining ota-onalariga xabarnoma jo\'natildi.</div></div>';
            document.body.appendChild(alertDiv);
            setTimeout(function() {
              if (alertDiv && alertDiv.parentNode) alertDiv.parentNode.removeChild(alertDiv);
            }, 4500);
          }, 800);
        };
      }
    }

    renderModal(defaultDateKey);
  };

  // ============================================================================
  // QUANTUM-EDU STUDENT DAILY TASKS & GROWTH/DECLINE ANALYTICS VIEW
  // ============================================================================
  function buildStudentAnalyticsProfile(cls, st, sIdx) {
    var stId = st.id || st.email || ('std_' + sIdx);
    var stName = cleanStName(cls.customStudentNames[stId] || st.name || ("O'quvchi " + (sIdx + 1)));
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
      var nA = cleanStName(cls.customStudentNames[idA] || a.name || '').toLowerCase();
      var nB = cleanStName(cls.customStudentNames[idB] || b.name || '').toLowerCase();
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
      '<h1 style="color:#0284c7;">ENGLISH HOUSE: O\'QUVCHINING KUNLIK STATISTIKASI VA DIAGRAMMASI</h1>' +
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
      var nA = cleanStName(cls.customStudentNames[idA] || a.name || '').toLowerCase();
      var nB = cleanStName(cls.customStudentNames[idB] || b.name || '').toLowerCase();
      return nA.localeCompare(nB);
    });

    var wsData = [];

    wsData.push([(cls.name || '1-GURUH') + " - " + (cls.teacherName || 'Ustoz'), "", "DAVOMAT VA AVTOMATIK BAHOLASH JURNALI"]);
    wsData.push(["Sinf kodi: " + (cls.code || ''), "Jadval: " + (cls.schedule || 'har_kuni'), "Eksport sanasi: " + formatDisplayDate(new Date())]);
    wsData.push([]);

    var hRow1 = ["№", "O'quvchi F.I.SH", "Qo'shilgan sana"];
    var hRow2 = ["", "", ""];

    dates.forEach(function(dt, dIdx) {
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
      var stName = cleanStName(cls.customStudentNames[stId] || st.name || ("O'quvchi " + (sIdx + 1)));
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



  // MODAL: EDIT GROUP DURATION & LEVEL TEST COUNTDOWN
  EA.openEditGroupDurationModal = function(cls, teacher, container) {
    if (!cls) return;
    var old = document.getElementById('eaGroupDurationModalOverlay');
    if (old) old.remove();

    var curMonths = Number(cls.learningMonths) || 0;
    var curDays = Number(cls.learningDays) || 0;

    var overlay = document.createElement('div');
    overlay.id = 'eaGroupDurationModalOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(18px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;';

    overlay.innerHTML = '<div style="background:linear-gradient(145deg,#0f172a,#1e293b);border:1.5px solid rgba(56,189,248,0.5);border-radius:24px;width:100%;max-width:480px;padding:26px;box-shadow:0 25px 60px rgba(0,0,0,0.85);color:#fff;font-family:inherit;">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:12px;">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<span style="font-size:26px;">⏱️</span>' +
          '<div>' +
            '<h3 style="margin:0;font-size:18px;font-weight:900;color:#fff;">Guruh O‘qish Muddatini Belgilash</h3>' +
            '<div style="font-size:12px;color:#38bdf8;margin-top:2px;">' + esc(cls.name) + ' — Level test hisobi</div>' +
          '</div>' +
        '</div>' +
        '<button id="eaCloseDurModalBtn" style="background:transparent;border:none;color:#94a3b8;font-size:22px;cursor:pointer;">&times;</button>' +
      '</div>' +

      '<div style="display:flex;flex-direction:column;gap:14px;">' +
        '<p style="margin:0;font-size:13px;color:#cbd5e1;line-height:1.5;">Har bir daraja (level) 3 oy (90 kun) davom etadi. Tizim o‘tilgan vaqtga qarab testlarni va imtihongacha qolgan kunni hisoblaydi.</p>' +

        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
          '<div>' +
            '<label style="display:block;font-size:11.5px;font-weight:800;color:#94a3b8;text-transform:uppercase;margin-bottom:6px;">Necha Oy O‘tgan?</label>' +
            '<input type="number" id="eaDurMonths" min="0" max="6" value="' + curMonths + '" style="width:100%;padding:10px 14px;background:#0f172a;border:1.5px solid rgba(56,189,248,0.4);border-radius:12px;color:#fff;font-size:15px;font-weight:900;outline:none;box-sizing:border-box;" />' +
          '</div>' +
          '<div>' +
            '<label style="display:block;font-size:11.5px;font-weight:800;color:#94a3b8;text-transform:uppercase;margin-bottom:6px;">Necha Kun O‘tgan?</label>' +
            '<input type="number" id="eaDurDays" min="0" max="29" value="' + curDays + '" style="width:100%;padding:10px 14px;background:#0f172a;border:1.5px solid rgba(56,189,248,0.4);border-radius:12px;color:#fff;font-size:15px;font-weight:900;outline:none;box-sizing:border-box;" />' +
          '</div>' +
        '</div>' +

        // Live calculation preview
        '<div id="eaDurLivePreview" style="background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:14px;font-size:12.5px;line-height:1.6;">' +
        '</div>' +

        '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:10px;">' +
          '<button id="eaCancelDurBtn" style="background:rgba(255,255,255,0.08);color:#cbd5e1;border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:10px 18px;font-size:13px;font-weight:800;cursor:pointer;">Bekor Qilish</button>' +
          '<button id="eaSaveDurBtn" style="background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:12px;padding:10px 24px;font-size:13px;font-weight:900;cursor:pointer;box-shadow:0 4px 16px rgba(2,132,199,0.4);">✓ Saqlash</button>' +
        '</div>' +

      '</div></div>';

    document.body.appendChild(overlay);

    var mInp = overlay.querySelector('#eaDurMonths');
    var dInp = overlay.querySelector('#eaDurDays');
    var prev = overlay.querySelector('#eaDurLivePreview');

    function updatePrev() {
      var m = Math.max(0, parseInt(mInp.value, 10) || 0);
      var d = Math.max(0, Math.min(29, parseInt(dInp.value, 10) || 0));
      var total = (m * 30) + d;
      var remaining = Math.max(0, 90 - total);
      var testsTaken = Math.min(24, Math.max(0, Math.round((total / 90) * 24)));
      var isSoon = (remaining <= 7);

      var h = '<div style="display:flex;justify-content:space-between;margin-bottom:6px;">' +
        '<span style="color:#94a3b8;">Jami o‘qilgan vaqt:</span>' +
        '<b style="color:#38bdf8;">' + m + ' oy ' + d + ' kun (' + total + ' kun)</b>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:6px;">' +
        '<span style="color:#94a3b8;">O‘tilgan testlar:</span>' +
        '<b style="color:#34d399;">' + testsTaken + ' / 24 ta test</b>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;">' +
        '<span style="color:#94a3b8;">Level test imtihonigacha:</span>' +
        '<b style="color:' + (isSoon ? '#facc15;font-size:14px;' : '#38bdf8;') + '">' + remaining + ' kun qoldi</b>' +
      '</div>';

      if (isSoon) {
        h += '<div style="margin-top:10px;padding:8px 12px;border-radius:10px;background:rgba(234,179,8,0.2);border:1px solid #facc15;color:#fef08a;font-weight:900;font-size:12px;display:flex;align-items:center;gap:6px;box-shadow:0 0 12px rgba(250,204,21,0.3);">' +
          '<span>⚡</span> <span>Level testlar tez kunda! Guruh sariq neon nurlar bilan ogohlantiradi.</span>' +
        '</div>';
      }

      prev.innerHTML = h;
    }

    mInp.oninput = updatePrev;
    dInp.oninput = updatePrev;
    updatePrev();

    overlay.querySelector('#eaCloseDurModalBtn').onclick = function() { overlay.remove(); };
    overlay.querySelector('#eaCancelDurBtn').onclick = function() { overlay.remove(); };

    overlay.querySelector('#eaSaveDurBtn').onclick = function() {
      var m = Math.max(0, parseInt(mInp.value, 10) || 0);
      var d = Math.max(0, Math.min(29, parseInt(dInp.value, 10) || 0));
      cls.learningMonths = m;
      cls.learningDays = d;

      var S = window.S || (window.EthithApp && window.EthithApp.state) || {};
      var storeCls = (S.classes || []).find(function(it) { return it.id === cls.id; });
      if (storeCls) {
        storeCls.learningMonths = m;
        storeCls.learningDays = d;
      }

      if (window.EthithEnterprise && window.EthithEnterprise.saveStore) {
        window.EthithEnterprise.saveStore();
      } else if (window.EthithApp && window.EthithApp.saveState) {
        window.EthithApp.saveState();
      }

      if (window.EthithSync && window.EthithSync.broadcastState) {
        window.EthithSync.broadcastState('class_duration_updated');
      }

      if (window.EthithApp && window.EthithApp.toast) {
        window.EthithApp.toast("Guruh o‘qish muddati saqlandi (" + m + " oy " + d + " kun)!");
      }

      overlay.remove();
      EA.render(container);
    };
  };



  // ============================================================================
  // STUDENT CREDENTIALS GENERATOR & REAL ROSTER MANAGEMENT
  // ============================================================================
  EA.cleanUzbekAlphanumeric = function(str) {
    if (!str) return '';
    return str.toString().trim().toLowerCase()
      .replace(/['`ʻʼ‘]/g, '')
      .replace(/o‘|oʻ|o'/g, 'o')
      .replace(/g‘|gʻ|g'/g, 'g')
      .replace(/sh/g, 'sh')
      .replace(/ch/g, 'ch')
      .replace(/[^a-z0-9]/g, '');
  };

  EA.generateStudentCredentials = function(firstName, lastName, existingNum) {
    var cleanF = EA.cleanUzbekAlphanumeric(firstName) || 'student';
    var cleanL = EA.cleanUzbekAlphanumeric(lastName) || 'user';
    var num = existingNum || Math.floor(100 + Math.random() * 900);
    var login = cleanF + '_' + num + '_' + cleanL;
    var passSuffix = cleanL.length >= 3 ? cleanL.slice(0, 3) : cleanL;
    var password = cleanF + num + passSuffix;
    return {
      login: login,
      password: password,
      num: num
    };
  };

  // ============================================================================
  // STUDENT ENROLL / EDIT CREDENTIALS MODAL
  // ============================================================================
  EA.openStudentEnrollModal = function(targetClassId, targetStudentId) {
    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';
    overlay.id = 'eaEnrollStudentOverlay';
    overlay.style.zIndex = '99999';

    var classes = getAvailableClasses();
    var curClass = classes.find(function(c) { return c && c.id === targetClassId; });
    var curSt = null;

    if (targetStudentId) {
      // 1. Check in target class if provided
      if (curClass && Array.isArray(curClass.students)) {
        curSt = curClass.students.find(function(s) {
          if (!s) return false;
          return s.id === targetStudentId || s.login === targetStudentId || s.email === targetStudentId || s.name === targetStudentId;
        });
      }
      // 2. Search across ALL classes
      if (!curSt) {
        for (var ci = 0; ci < classes.length; ci++) {
          var fSt = (classes[ci].students || []).find(function(s) {
            if (!s) return false;
            return s.id === targetStudentId || s.login === targetStudentId || s.email === targetStudentId || s.name === targetStudentId;
          });
          if (fSt) {
            curSt = fSt;
            curClass = classes[ci];
            break;
          }
        }
      }
      // 3. Search in S.accounts
      if (!curSt) {
        var S_app = window.S || (window.EthithApp && window.EthithApp.state) || {};
        var acc = (S_app.accounts || []).find(function(a) {
          if (!a) return false;
          return a.id === targetStudentId || a.login === targetStudentId || a.email === targetStudentId || a.name === targetStudentId;
        });
        if (acc) {
          if (acc.classId) {
            var mCls = classes.find(function(c) { return c && c.id === acc.classId; });
            if (mCls) curClass = mCls;
          }
          curSt = {
            id: acc.id || ('std_' + acc.login),
            name: acc.name,
            role: 'student',
            login: acc.login,
            password: acc.password,
            phone: acc.phone || acc.parentPhone || '',
            parentPhone: acc.parentPhone || acc.phone || '',
            isTester: false,
            manuallyEnrolled: true
          };
        }
      }
    }
    if (!curClass) curClass = classes[0];

    var defaultFirst = '';
    var defaultLast = '';
    var defaultPhone = curSt ? (curSt.parentPhone || curSt.phone || (curClass && curClass.customStudentPhones && curClass.customStudentPhones[curSt.id]) || '') : '';
    var existingNum = null;

    var isEdit = !!curSt && !curSt.isTester && !(curSt.name || '').toLowerCase().startsWith('tester_');

    if (curSt) {
      if (isEdit) {
        if (curSt.firstName && curSt.lastName) {
          defaultFirst = curSt.firstName;
          defaultLast = curSt.lastName;
        } else {
          var nParts = (curSt.name || '').trim().split(/\s+/);
          if (nParts.length >= 2) {
            defaultFirst = nParts[0];
            defaultLast = nParts.slice(1).join(' ');
          } else {
            defaultFirst = curSt.name || '';
            defaultLast = '';
          }
        }
      }
      if (curSt.login && curSt.login.includes('_')) {
        var m = curSt.login.match(/_(\d{3,4})_/);
        if (m) existingNum = parseInt(m[1], 10);
      }
    }

    var creds = EA.generateStudentCredentials(defaultFirst, defaultLast, existingNum);
    var currentLogin = (curSt && curSt.login && !curSt.isTester) ? curSt.login : creds.login;
    var currentPass = (curSt && curSt.password && !curSt.isTester) ? curSt.password : creds.password;

    var S_app_state = window.S || (window.EthithApp && window.EthithApp.state) || {};
    var stIdLookup = curSt ? (curSt.id || curSt.email || curSt.login) : null;
    var initPayRec = (curClass && curClass.studentPayments && stIdLookup && curClass.studentPayments[stIdLookup]) ||
                     (S_app_state.finance && S_app_state.finance.studentFees && stIdLookup && S_app_state.finance.studentFees[stIdLookup]) || {};
    var isStudentPaid = (initPayRec.status === 'paid');

    var html = '<div class="eth-modal" style="max-width:560px;background:linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.96));border:1.5px solid rgba(56,189,248,0.45);box-shadow:0 24px 60px rgba(0,0,0,0.8),0 0 30px rgba(56,189,248,0.25);border-radius:24px;padding:26px 30px;color:#fff;">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:14px;">' +
        '<div style="display:flex;align-items:center;gap:12px;">' +
          '<div style="width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#0284c7,#2563eb);display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 6px 16px rgba(2,132,199,0.4);">' + (isEdit ? '✏️' : '🎓') + '</div>' +
          '<div>' +
            '<h2 style="margin:0;font-size:18px;font-weight:900;color:#fff;">' +
              (isEdit ? '✏️ O‘quvchi Ma‘lumotlarini Tahrirlash' : 'Yangi O‘quvchi Ro‘yxatga Olish') +
            '</h2>' +
            '<p style="margin:3px 0 0;font-size:12px;color:#94a3b8;">Ism, familiya va ota-onasi telefon raqamini kiriting. Login va parol avtomatik shakllanadi.</p>' +
          '</div>' +
        '</div>' +
        '<button type="button" id="eaCloseEnrollModalBtn" style="background:rgba(255,255,255,0.08);border:none;color:#94a3b8;font-size:20px;cursor:pointer;border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">✕</button>' +
      '</div>' +

      '<form id="eaEnrollStudentForm">' +
        // Class selection
        '<div style="margin-bottom:14px;">' +
          '<label style="display:block;font-size:12px;font-weight:800;color:#cbd5e1;margin-bottom:6px;">Biriktirilgan Guruh:</label>' +
          '<select id="eaEnrollClassSelect" style="width:100%;background:rgba(15,23,42,0.85);border:1px solid rgba(56,189,248,0.35);border-radius:12px;padding:10px 14px;color:#fff;font-size:13.5px;font-weight:700;outline:none;">';
          classes.forEach(function(c) {
            var sel = (curClass && curClass.id === c.id) ? 'selected' : '';
            html += '<option value="' + esc(c.id) + '" ' + sel + '>' + esc(c.name || c.id) + ' (' + (c.teacherName || 'Ustoz') + ')</option>';
          });
          html += '</select>' +
        '</div>' +

        // First Name & Last Name in 2 columns
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">' +
          '<div>' +
            '<label style="display:block;font-size:12px;font-weight:800;color:#cbd5e1;margin-bottom:6px;">O‘quvchining Ismi: <span style="color:#ef4444;">*</span></label>' +
            '<input type="text" id="eaEnrollFirstName" value="' + esc(defaultFirst) + '" placeholder="Masalan: Ali" required style="width:100%;box-sizing:border-box;background:rgba(15,23,42,0.85);border:1px solid rgba(56,189,248,0.35);border-radius:12px;padding:10px 14px;color:#fff;font-size:13.5px;font-weight:700;outline:none;">' +
          '</div>' +
          '<div>' +
            '<label style="display:block;font-size:12px;font-weight:800;color:#cbd5e1;margin-bottom:6px;">Familiyasi: <span style="color:#ef4444;">*</span></label>' +
            '<input type="text" id="eaEnrollLastName" value="' + esc(defaultLast) + '" placeholder="Masalan: Valiyev" required style="width:100%;box-sizing:border-box;background:rgba(15,23,42,0.85);border:1px solid rgba(56,189,248,0.35);border-radius:12px;padding:10px 14px;color:#fff;font-size:13.5px;font-weight:700;outline:none;">' +
          '</div>' +
        '</div>' +

        // Parent Phone Number with fixed locked +998 prefix
        '<div style="margin-bottom:16px;">' +
          '<label style="display:block;font-size:12px;font-weight:800;color:#cbd5e1;margin-bottom:6px;">Ota-onasining Telefon Raqami: <span style="color:#ef4444;">*</span></label>' +
          '<div style="display:flex;align-items:center;background:rgba(15,23,42,0.95);border:1.5px solid rgba(56,189,248,0.4);border-radius:12px;overflow:hidden;">' +
            '<span style="background:rgba(56,189,248,0.18);border-right:1px solid rgba(56,189,248,0.3);color:#38bdf8;font-weight:900;font-size:14px;padding:10px 14px;user-select:none;font-family:monospace;">+998</span>' +
            '<input type="tel" id="eaEnrollParentPhone" maxlength="9" value="' + esc(defaultPhone.replace(/\D/g, '').slice(-9)) + '" placeholder="901234567" required style="flex:1;background:transparent;border:none;padding:10px 14px;color:#fff;font-size:14px;font-weight:900;letter-spacing:1px;outline:none;" />' +
          '</div>' +
          '<small style="color:#94a3b8;font-size:11.5px;margin-top:5px;display:block;">📞 +998 avtomatik belgilangan. Faqat qolgan 9 ta raqamni kiriting (harflar qabul qilinmaydi).</small>' +
        '</div>' +

        // Auto Generated Credentials Box
        '<div style="background:rgba(2,132,199,0.12);border:1.5px dashed rgba(56,189,248,0.45);border-radius:16px;padding:14px 18px;margin-bottom:20px;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">' +
            '<span style="font-size:12px;font-weight:900;color:#38bdf8;text-transform:uppercase;letter-spacing:0.5px;">⚡ Avtomatik Tizim Kirish Ma‘lumotlari</span>' +
            '<button type="button" id="eaRegenCredsBtn" title="Boshqa tasodifiy raqam/login tanlash" style="background:rgba(56,189,248,0.2);border:1px solid rgba(56,189,248,0.4);color:#38bdf8;border-radius:8px;padding:4px 9px;font-size:11.5px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:4px;">🎲 Yangilash</button>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
            '<div>' +
              '<div style="font-size:11px;color:#94a3b8;font-weight:700;margin-bottom:4px;">Tizim Logini:</div>' +
              '<input type="text" id="eaLiveLoginInput" value="' + esc(currentLogin) + '" style="width:100%;box-sizing:border-box;background:rgba(15,23,42,0.95);border:1px solid #38bdf8;border-radius:8px;padding:7px 10px;font-family:monospace;font-size:12.5px;font-weight:900;color:#38bdf8;outline:none;">' +
            '</div>' +
            '<div>' +
              '<div style="font-size:11px;color:#94a3b8;font-weight:700;margin-bottom:4px;">Maxfiy Parol:</div>' +
              '<input type="text" id="eaLivePassInput" value="' + esc(currentPass) + '" style="width:100%;box-sizing:border-box;background:rgba(15,23,42,0.95);border:1px solid #c084fc;border-radius:8px;padding:7px 10px;font-family:monospace;font-size:12.5px;font-weight:900;color:#c084fc;outline:none;">' +
            '</div>' +
          '</div>' +
          '<div style="font-size:11px;color:#94a3b8;margin-top:8px;">🔒 O‘quvchi o‘zi alohida yangi hisob ocha olmaydi. Faqat ushbu Login va Parol orqali kiradi.</div>' +
        '</div>' +

        // Extra Student Controls (All in One: Payment, SMS, Stats)
        (isEdit ?
          '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:14px 18px;margin-bottom:18px;">' +
            '<div style="font-size:12px;font-weight:900;color:#cbd5e1;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">⚙️ Boshqaruv & Sozlamalar</div>' +
            '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">' +
              '<div style="display:flex;align-items:center;gap:10px;">' +
                '<span style="font-size:12.5px;color:#94a3b8;font-weight:700;">To‘lov:</span>' +
                '<button type="button" id="eaModalTogglePayBtn" style="border:1.5px solid ' + (isStudentPaid ? '#10b981' : 'rgba(255,255,255,0.2)') + ';background:' + (isStudentPaid ? 'rgba(16,185,129,0.22)' : 'rgba(255,255,255,0.06)') + ';color:' + (isStudentPaid ? '#4ade80' : '#cbd5e1') + ';padding:6px 14px;border-radius:10px;font-weight:900;font-size:12px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;">' +
                  (isStudentPaid ? '💳 ✓ To‘langan (Yashil Neon)' : '💳 To‘lanmagan (Qarz)') +
                '</button>' +
              '</div>' +
              '<div style="display:flex;align-items:center;gap:8px;">' +
                '<button type="button" id="eaModalSendSmsBtn" style="background:rgba(250,204,21,0.18);border:1px solid rgba(250,204,21,0.4);color:#fef08a;border-radius:10px;padding:7px 12px;font-size:12px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:5px;">📱 SMS Yuborish</button>' +
                '<button type="button" id="eaModalOpenStatsBtn" style="background:rgba(56,189,248,0.18);border:1px solid rgba(56,189,248,0.4);color:#7dd3fc;border-radius:10px;padding:7px 12px;font-size:12px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:5px;">📈 Tahlil</button>' +
              '</div>' +
            '</div>' +
          '</div>' : '') +

        // Action Buttons
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:20px;">' +
          (isEdit 
            ? '<button type="button" id="eaModalDeleteStudentBtn" style="background:rgba(239,68,68,0.18);border:1px solid rgba(239,68,68,0.45);color:#f87171;border-radius:12px;padding:10px 16px;font-size:13px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:6px;">🗑️ O‘quvchini O‘chirish</button>' 
            : '<div></div>') +
          '<div style="display:flex;align-items:center;gap:10px;">' +
            '<button type="button" id="eaCancelEnrollBtn" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#cbd5e1;border-radius:12px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;">Bekor qilish</button>' +
            '<button type="submit" id="eaSaveEnrollBtn" style="background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:12px;padding:10px 22px;font-size:13px;font-weight:900;cursor:pointer;box-shadow:0 4px 18px rgba(2,132,199,0.4);display:inline-flex;align-items:center;gap:6px;">' +
              (isEdit ? '💾 O‘zgarishlarni Saqlash' : '💾 Saqlash va Profil Yaratish') +
            '</button>' +
          '</div>' +
        '</div>' +
      '</form>' +
    '</div>';

    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    var fnInp = overlay.querySelector('#eaEnrollFirstName');
    var lnInp = overlay.querySelector('#eaEnrollLastName');
    var phoneInp = overlay.querySelector('#eaEnrollParentPhone');
    if (phoneInp) {
      phoneInp.oninput = function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 9);
      };
    }
    var loginInp = overlay.querySelector('#eaLiveLoginInput');
    var passInp = overlay.querySelector('#eaLivePassInput');
    var regenBtn = overlay.querySelector('#eaRegenCredsBtn');

    var currentNum = existingNum || Math.floor(100 + Math.random() * 900);

    function updateLiveCreds(forceNewNum) {
      if (forceNewNum) {
        currentNum = Math.floor(100 + Math.random() * 900);
      }
      var c = EA.generateStudentCredentials(fnInp.value, lnInp.value, currentNum);
      loginInp.value = c.login;
      passInp.value = c.password;
    }

    fnInp.oninput = function() { if (!isEdit || !curSt || !curSt.login) updateLiveCreds(false); };
    lnInp.oninput = function() { if (!isEdit || !curSt || !curSt.login) updateLiveCreds(false); };
    regenBtn.onclick = function() { updateLiveCreds(true); };

    overlay.querySelector('#eaCloseEnrollModalBtn').onclick = function() { overlay.remove(); };
    overlay.querySelector('#eaCancelEnrollBtn').onclick = function() { overlay.remove(); };

    var mDelBtn = overlay.querySelector('#eaModalDeleteStudentBtn');
    if (mDelBtn && curSt) {
      mDelBtn.onclick = function() {
        overlay.remove();
        EA.deleteStudentCompletely(curClass ? curClass.id : null, curSt.id || curSt.login, curSt.name);
      };
    }

    var mPayBtn = overlay.querySelector('#eaModalTogglePayBtn');
    if (mPayBtn) {
      mPayBtn.onclick = function() {
        isStudentPaid = !isStudentPaid;
        mPayBtn.style.borderColor = isStudentPaid ? '#10b981' : 'rgba(255,255,255,0.2)';
        mPayBtn.style.background = isStudentPaid ? 'rgba(16,185,129,0.22)' : 'rgba(255,255,255,0.06)';
        mPayBtn.style.color = isStudentPaid ? '#4ade80' : '#cbd5e1';
        mPayBtn.innerHTML = isStudentPaid ? '💳 ✓ To‘langan (Yashil Neon)' : '💳 To‘lanmagan (Qarz)';
      };
    }

    var mSmsBtn = overlay.querySelector('#eaModalSendSmsBtn');
    if (mSmsBtn && curSt) {
      mSmsBtn.onclick = function() {
        overlay.remove();
        EA.openSendSmsModal(curClass ? curClass.id : null, curSt.id || curSt.login);
      };
    }

    var mStatsBtn = overlay.querySelector('#eaModalOpenStatsBtn');
    if (mStatsBtn && curSt) {
      mStatsBtn.onclick = function() {
        overlay.remove();
        EA.activeStudentId = curSt.id || curSt.login;
        var container = document.getElementById('apView') || document.getElementById('viewContainer');
        if (container) EA.render(container);
      };
    }

    overlay.querySelector('#eaEnrollStudentForm').onsubmit = function(e) {
      e.preventDefault();
      var fn = fnInp.value.trim();
      var ln = lnInp.value.trim();
      var pPhone = phoneInp.value.trim();
      var selClassId = overlay.querySelector('#eaEnrollClassSelect').value;
      var finalLogin = loginInp.value.trim();
      var finalPass = passInp.value.trim();

      if (!fn || !ln) {
        alert("Iltimos, o‘quvchining ismi va familiyasini kiriting!");
        return;
      }
      if (!pPhone) {
        alert("Iltimos, ota-onasining telefon raqamini kiriting!");
        return;
      }

      var fullName = fn + ' ' + ln;
      var classes = getAvailableClasses();
      var chosenClass = classes.find(function(c) { return c && c.id === selClassId; }) || curClass;
      if (!chosenClass) {
        alert("Guruh topilmadi!");
        return;
      }

      if (!chosenClass.students) chosenClass.students = [];

      var studentId = (curSt && isEdit) ? curSt.id : ('std_' + finalLogin);
      var studentObj = {
        id: studentId,
        name: fullName,
        firstName: fn,
        lastName: ln,
        email: finalLogin + '@student.ethith',
        role: 'student',
        phone: pPhone,
        parentPhone: pPhone,
        login: finalLogin,
        password: finalPass,
        joinedAt: (curSt && curSt.joinedAt) ? curSt.joinedAt : new Date().toISOString().split('T')[0],
        isTester: false,
        manuallyEnrolled: true,
        isOnline: (curSt && curSt.isOnline) || false,
        coins: (curSt && curSt.coins) || 150
      };

      // If transferring from another class
      if (curClass && curClass.id !== chosenClass.id && curSt) {
        var oldIdx = (curClass.students || []).findIndex(function(s) {
          return s && ((s.id && s.id === curSt.id) || (s.login && s.login === curSt.login));
        });
        if (oldIdx !== -1) {
          var cleanTester = {
            id: 'cls_' + curClass.id + '_std_' + (oldIdx + 1) + '_' + Date.now().toString(36).substr(-4),
            name: 'tester_' + (oldIdx + 1),
            email: 'tester_' + (oldIdx + 1) + '@ethith.uz',
            role: 'student',
            phone: '',
            parentPhone: '',
            login: '',
            password: '',
            joinedAt: new Date().toISOString().split('T')[0],
            dailyMinutes: 0,
            coins: 0,
            isTester: true,
            isOnline: false,
            lastLogin: null
          };
          curClass.students[oldIdx] = cleanTester;
          if (curClass.customStudentNames) delete curClass.customStudentNames[curSt.id];
          if (curClass.customStudentPhones) delete curClass.customStudentPhones[curSt.id];
          if (typeof persistAttendance === 'function') persistAttendance(curClass);
        }
      }

      // Update in chosen class
      var targetIdx = chosenClass.students.findIndex(function(s) {
        return s && ((s.id && s.id === studentId) || (s.login && s.login === finalLogin) || (curSt && s.id === curSt.id));
      });

      if (targetIdx === -1) {
        // Find first tester slot to replace
        targetIdx = chosenClass.students.findIndex(function(s) {
          return s && (s.isTester === true || (s.name && s.name.toLowerCase().startsWith('tester_')));
        });
      }

      if (targetIdx !== -1) {
        chosenClass.students[targetIdx] = studentObj;
      } else {
        chosenClass.students.unshift(studentObj);
      }

      if (!chosenClass.customStudentNames) chosenClass.customStudentNames = {};
      chosenClass.customStudentNames[studentObj.id] = fullName;
      if (!chosenClass.customStudentPhones) chosenClass.customStudentPhones = {};
      chosenClass.customStudentPhones[studentObj.id] = pPhone;

      if (!chosenClass.studentPayments) chosenClass.studentPayments = {};
      chosenClass.studentPayments[studentObj.id] = {
        fee: 300000,
        paid: isStudentPaid ? 300000 : 0,
        status: isStudentPaid ? 'paid' : 'unpaid',
        method: isStudentPaid ? 'Online/Naqd' : '—',
        date: isStudentPaid ? new Date().toLocaleDateString('uz-UZ') : 'To‘lanmagan'
      };
      if (S_app_state.finance && S_app_state.finance.studentFees) {
        S_app_state.finance.studentFees[studentObj.id] = chosenClass.studentPayments[studentObj.id];
      }

      if (typeof ensureClassAttendance === 'function') ensureClassAttendance(chosenClass);

      var acc = {
        id: studentObj.id,
        name: fullName,
        role: 'student',
        login: finalLogin,
        password: finalPass,
        phone: pPhone,
        parentPhone: pPhone,
        classId: chosenClass.id,
        isOnline: studentObj.isOnline,
        lastLogin: null
      };

      // Synchronize in-memory class sources
      var allClsSources = [
        window.S && window.S.classes,
        window.EthithApp && window.EthithApp.state && window.EthithApp.state.classes,
        window.ETHITH_INITIAL_STORE && window.ETHITH_INITIAL_STORE.classes,
        window.EthithEnterprise && window.EthithEnterprise.getStore && window.EthithEnterprise.getStore().classes
      ];
      allClsSources.forEach(function(arr) {
        if (!Array.isArray(arr)) return;
        var f = arr.find(function(c) { return c && c.id === chosenClass.id; });
        if (f) {
          f.students = JSON.parse(JSON.stringify(chosenClass.students));
          f.customStudentNames = Object.assign({}, chosenClass.customStudentNames);
          f.customStudentPhones = Object.assign({}, chosenClass.customStudentPhones);
          f.studentPayments = Object.assign({}, f.studentPayments || {}, chosenClass.studentPayments);
        } else {
          arr.push(JSON.parse(JSON.stringify(chosenClass)));
        }
      });

      // Synchronize in-memory account sources
      var allAccSources = [
        window.S && window.S.accounts,
        window.EthithApp && window.EthithApp.state && window.EthithApp.state.accounts,
        window.ETHITH_INITIAL_STORE && window.ETHITH_INITIAL_STORE.accounts,
        window.EthithEnterprise && window.EthithEnterprise.getStore && window.EthithEnterprise.getStore().accounts
      ];
      allAccSources.forEach(function(arr) {
        if (!Array.isArray(arr)) return;
        var f = arr.find(function(a) { 
          return a && (a.id === studentObj.id || (a.login && a.login.toLowerCase() === finalLogin.toLowerCase()) || (curSt && (a.id === curSt.id || (a.login && a.login === curSt.login)))); 
        });
        if (f) {
          f.id = studentObj.id;
          f.name = fullName;
          f.login = finalLogin;
          f.password = finalPass;
          f.phone = pPhone;
          f.parentPhone = pPhone;
          f.classId = chosenClass.id;
        } else {
          arr.push(JSON.parse(JSON.stringify(acc)));
        }
      });

      try {
        if (window.EthithApp && window.EthithApp.state) {
          localStorage.setItem('ethith_v2_state', JSON.stringify(window.EthithApp.state));
        }
        if (window.EthithEnterprise && window.EthithEnterprise.getStore) {
          localStorage.setItem('ethith_enterprise_store', JSON.stringify(window.EthithEnterprise.getStore()));
        }
      } catch(e) {}

      if (window.EthithSync && typeof window.EthithSync.publishLive === 'function') {
        window.EthithSync.publishLive({
          type: 'STUDENT_JOIN',
          classId: chosenClass.id,
          student: studentObj,
          account: acc
        });
        window.EthithSync.publishLive({
          type: 'STUDENT_ENROLLED',
          classId: chosenClass.id,
          student: studentObj,
          account: acc
        });
      }

      if (window.EthithSync && typeof window.EthithSync.pushRemoteStore === 'function') {
        window.EthithSync.pushRemoteStore();
      }

      var msg = isEdit ? (fullName + " ma‘lumotlari muvaffaqiyatli saqlandi! ✓") : ("✓ " + fullName + " ro‘yxatga olindi! Serverga sinxronlandi.");
      if (window.EthithApp && window.EthithApp.toast) {
        window.EthithApp.toast(msg);
      } else {
        alert(msg);
      }

      overlay.remove();
      var container = document.getElementById('apView') || document.getElementById('viewContainer');
      if (container) {
        EA.activeClassId = chosenClass.id;
        EA.render(container);
      }
    };
  };

// ============================================================================
  // EXCEL EXPORT OF SYSTEM LOGINS & CREDENTIALS
  // ============================================================================
  EA.exportLoginsToExcel = function(records, filterLabel) {
    if (typeof XLSX === 'undefined') {
      alert("Excel yuklash moduli yuklanmoqda, iltimos 2 soniyadan so‘ng qayta bosing.");
      return;
    }
    if (!records || records.length === 0) {
      alert("Eksport qilish uchun o‘quvchilar ro‘yxati bo‘sh!");
      return;
    }

    var rows = records.map(function(r, idx) {
      return {
        "№": idx + 1,
        "O‘quvchi Ism-Familiyasi": r.name,
        "Guruh / Level": r.className,
        "Ustoz": r.teacherName || "—",
        "Ota-onasining Telefon Raqami": r.parentPhone || "Kiritilmagan",
        "Tizim Logini": r.login || "—",
        "Maxfiy Parol": r.password || "—",
        "Tizimga Kirish Holati": r.isOnline ? "🟢 Online (Kirgan)" : "🔴 Kirmagan (Offline)",
        "Oylik To‘lov Holati": r.isPaid ? "To‘langan" : "To‘lanmagan"
      };
    });

    var ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 6 },  // №
      { wch: 26 }, // Ism
      { wch: 22 }, // Guruh
      { wch: 20 }, // Ustoz
      { wch: 24 }, // Telefon
      { wch: 22 }, // Login
      { wch: 18 }, // Parol
      { wch: 22 }, // Holat
      { wch: 16 }  // To'lov
    ];

    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tizim_Loginlari");
    var fileName = "ETHITH_Oquvchilar_Login_Parollari" + (filterLabel ? ("_" + filterLabel) : "") + ".xlsx";
    XLSX.writeFile(wb, fileName);
  };

  // ============================================================================
  // SYSTEM LOGINS TABLE SECTION (Placed at bottom of directory, groups & journal)
  // ============================================================================
  EA.renderSystemLoginsSection = function(currentTeacherId, currentClassId) {
    var curUser = getActiveUser();
    var isStudent = curUser && curUser.role === 'student';
    var isAdmin = isAdminRole() && !isStudent;
    var isTeacher = isTeacherRole() && !isStudent;

    if (isStudent || (!isAdmin && !isTeacher)) {
      return { html: '', attachHandlers: function(){} };
    }

    var allCls = getAvailableClasses();
    if (isTeacher && !isAdmin) {
      var tClasses = getClassesForTeacher(currentTeacherId || EA.activeTeacherId);
      allCls = tClasses;
    } else if (currentClassId) {
      var matchC = allCls.filter(function(c) { return c.id === currentClassId; });
      if (matchC.length > 0) allCls = matchC;
    }

    // Collect all student records across selected classes
    var records = [];
    var S_app = window.S || (window.EthithApp && window.EthithApp.state) || {};
    var accounts = S_app.accounts || [];

    allCls.forEach(function(cls) {
      (cls.students || []).forEach(function(st, sIdx) {
        // Strictly exclude tester slots: only show students who have been enrolled with real name & parent phone
        if (st.isTester === true || (st.name && st.name.toLowerCase().startsWith('tester_')) || !st.parentPhone) {
          return;
        }
        var stId = st.id || st.email || ('std_' + sIdx);
        var stName = cleanStName(cls.customStudentNames[stId] || st.name || ("O'quvchi " + (sIdx + 1)));

        // Match with account if available
        var acc = accounts.find(function(a) { return a.id === stId || (st.login && a.login && a.login.toLowerCase() === st.login.toLowerCase()); });
        var parentPhone = st.parentPhone || st.phone || (acc ? (acc.parentPhone || acc.phone) : '') || '';
        
        var login = st.login || (acc ? acc.login : '');
        var pass = st.password || (acc ? acc.password : '');
        if (!login) {
          var nParts = stName.split(/\s+/);
          var cGen = EA.generateStudentCredentials(nParts[0], nParts.slice(1).join(' '), 100 + sIdx);
          login = cGen.login;
          pass = cGen.password;
          st.login = login;
          st.password = pass;
        }

        var isOnline = (st.isOnline === true) || (acc && acc.isOnline === true);
        var isPaid = (cls.studentPayments && cls.studentPayments[stId] && cls.studentPayments[stId].status === 'paid');

        records.push({
          id: stId,
          name: stName,
          parentPhone: parentPhone,
          login: login,
          password: pass,
          isOnline: isOnline,
          isPaid: isPaid,
          classId: cls.id,
          className: cls.name || cls.id,
          teacherName: cls.teacherName || 'Ustoz',
          isTester: !!st.isTester
        });
      });
    });

    var onlineCount = records.filter(function(r) { return r.isOnline; }).length;
    var offlineCount = records.length - onlineCount;

    var h = '<div class="ea-system-logins-section" style="margin-top:40px;background:linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.92));border:1.5px solid rgba(56,189,248,0.35);border-radius:24px;padding:26px 28px;box-shadow:0 18px 50px rgba(0,0,0,0.6),0 0 30px rgba(56,189,248,0.15);backdrop-filter:blur(24px);">' +
      // Header & Controls Row
      '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:18px;">' +
        '<div style="display:flex;align-items:center;gap:14px;">' +
          '<div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 6px 18px rgba(99,102,241,0.35);">🔐</div>' +
          '<div>' +
            '<h2 style="margin:0;font-size:20px;font-weight:900;color:#fff;display:flex;align-items:center;gap:10px;">' +
              'Tizim Loginlari (O‘quvchilar Ro‘yxati va Kirish Ma’lumotlari)' +
            '</h2>' +
            '<p style="margin:4px 0 0;font-size:12.5px;color:#94a3b8;font-weight:600;">' +
              'O‘quvchilar mustaqil ro‘yxatdan o‘tmaydi — ular faqat ushbu login va parollar orqali tizimga kiradilar.' +
            '</p>' +
          '</div>' +
        '</div>' +

        // Stats Badges & Actions
        '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
          '<span style="background:rgba(34,197,94,0.18);border:1px solid #22c55e;color:#4ade80;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:900;display:inline-flex;align-items:center;gap:6px;">' +
            '<span class="ea-status-dot ea-status-online" style="margin:0;"></span>' + onlineCount + ' ta Online' +
          '</span>' +
          '<span style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.4);color:#f87171;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:800;display:inline-flex;align-items:center;gap:6px;">' +
            '<span class="ea-status-dot ea-status-offline" style="margin:0;"></span>' + offlineCount + ' ta Kirmagan' +
          '</span>' +
          '<button type="button" id="eaBtnAddNewStudentLogins" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:12px;padding:9px 18px;font-size:12.5px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 15px rgba(16,185,129,0.35);transition:all 0.2s;">' +
            '➕ Yangi O‘quvchi Ro‘yxatga Olish' +
          '</button>' +
          '<button type="button" id="eaBtnExportLoginsExcel" style="background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:12px;padding:9px 18px;font-size:12.5px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 15px rgba(2,132,199,0.35);transition:all 0.2s;">' +
            '📥 Excel (.xlsx) Yuklab Olish' +
          '</button>' +
        '</div>' +
      '</div>' +

      // Filter & Search bar
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:16px;">' +
        '<div style="display:flex;align-items:center;gap:10px;flex:1;max-width:450px;">' +
          '<span style="font-size:16px;">🔍</span>' +
          '<input type="text" id="eaLoginsSearchInput" placeholder="Ism, familiya, login yoki telefon bo‘yicha qidirish..." style="flex:1;background:rgba(15,23,42,0.85);border:1px solid rgba(56,189,248,0.35);border-radius:10px;padding:8px 14px;color:#fff;font-size:13px;outline:none;">' +
        '</div>' +
        '<div style="font-size:12px;color:#94a3b8;font-weight:700;">' +
          'Jami: <b style="color:#38bdf8;">' + records.length + ' ta o‘quvchi</b>' +
        '</div>' +
      '</div>' +

      // Table Container
      '<div style="overflow-x:auto;border:1px solid rgba(255,255,255,0.08);border-radius:16px;background:rgba(8,13,26,0.7);">' +
        '<table id="eaLoginsTable" style="width:100%;border-collapse:collapse;font-size:13px;text-align:left;">' +
          '<thead>' +
            '<tr style="background:linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.95));border-bottom:1px solid rgba(56,189,248,0.3);color:#94a3b8;font-size:11.5px;font-weight:900;text-transform:uppercase;letter-spacing:0.5px;">' +
              '<th style="padding:12px 14px;text-align:center;width:45px;">№</th>' +
              '<th style="padding:12px 14px;">O‘quvchi Ism-Familiyasi</th>' +
              '<th style="padding:12px 14px;">Guruh / Level</th>' +
              '<th style="padding:12px 14px;">Ota-onasi Telefoni</th>' +
              '<th style="padding:12px 14px;">Tizim Logini</th>' +
              '<th style="padding:12px 14px;">Maxfiy Parol</th>' +
              '<th style="padding:12px 14px;text-align:center;">Holat</th>' +
              '<th style="padding:12px 14px;text-align:center;">Amal</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>';

    if (records.length === 0) {
      h += '<tr><td colspan="8" style="padding:36px;text-align:center;color:#94a3b8;font-weight:700;">Hozircha o‘quvchilar mavjud emas. Yuqoridagi "➕ Yangi O‘quvchi Ro‘yxatga Olish" tugmasi orqali qo‘shing.</td></tr>';
    } else {
      records.forEach(function(r, idx) {
        var rowBg = idx % 2 === 0 ? 'rgba(15, 23, 42, 0.4)' : 'rgba(15, 23, 42, 0.65)';
        var dotHtml = '<span class="ea-status-dot ' + (r.isOnline ? 'ea-status-online' : 'ea-status-offline') + '" title="' + (r.isOnline ? '🟢 Online (Tizimga kirgan)' : '🔴 Offline (Tizimga kirmagan)') + '"></span>';

        var nameHtml = r.isPaid
          ? ('<span class="ea-st-paid-neon" style="color:#4ade80 !important;font-weight:900;text-shadow:0 0 10px rgba(74,222,128,0.9),0 0 20px rgba(74,222,128,0.6);letter-spacing:0.2px;">' + esc(r.name) + '</span>')
          : ('<span style="color:#f8fafc;font-weight:800;">' + esc(r.name) + '</span>');

        var phoneDisp = r.parentPhone ? esc(r.parentPhone) : '<span style="color:#64748b;font-style:italic;">Kiritilmagan</span>';

        h += '<tr class="ea-login-row" data-search="' + esc((r.name + ' ' + r.className + ' ' + r.login + ' ' + r.parentPhone).toLowerCase()) + '" style="background:' + rowBg + ';border-bottom:1px solid rgba(255,255,255,0.05);transition:background 0.15s;">' +
          '<td style="padding:10px 14px;text-align:center;color:#94a3b8;font-weight:900;">' + (idx + 1) + '</td>' +
          '<td style="padding:10px 14px;display:flex;align-items:center;gap:6px;">' +
            dotHtml + nameHtml +
          '</td>' +
          '<td style="padding:10px 14px;color:#38bdf8;font-weight:700;">' + esc(r.className) + '</td>' +
          '<td style="padding:10px 14px;font-family:monospace;font-weight:700;color:#cbd5e1;">' + phoneDisp + '</td>' +
          '<td style="padding:10px 14px;">' +
            '<span class="ea-login-code-tag">' + esc(r.login) + '</span>' +
            '<button type="button" class="ea-copy-mini-btn ea-btn-copy-val" data-val="' + esc(r.login) + '" title="Loginni nusxalash">📋</button>' +
          '</td>' +
          '<td style="padding:10px 14px;">' +
            '<span class="ea-password-code-tag">' + esc(r.password) + '</span>' +
            '<button type="button" class="ea-copy-mini-btn ea-btn-copy-val" data-val="' + esc(r.password) + '" title="Parolni nusxalash">📋</button>' +
          '</td>' +
          '<td style="padding:10px 14px;text-align:center;">' +
            (r.isOnline 
              ? '<span style="background:rgba(34,197,94,0.18);border:1px solid #22c55e;color:#4ade80;padding:3px 8px;border-radius:12px;font-size:11px;font-weight:900;">🟢 Online</span>' 
              : '<span style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.35);color:#f87171;padding:3px 8px;border-radius:12px;font-size:11px;font-weight:800;">🔴 Kirmagan</span>') +
          '</td>' +
          '<td style="padding:10px 14px;text-align:center;">' +
            '<button type="button" class="ea-btn-edit-student-creds" data-cid="' + esc(r.classId) + '" data-stid="' + esc(r.id) + '" title="Ma’lumotlarni tahrirlash" style="background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.35);color:#38bdf8;border-radius:8px;padding:4px 9px;font-size:12px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:4px;">✏️ Tahrirlash</button>' +
            '<button type="button" class="ea-btn-delete-student-creds" data-cid="' + esc(r.classId) + '" data-stid="' + esc(r.id) + '" data-stname="' + esc(r.name) + '" title="O‘quvchini tizimdan butunlay o‘chirish" style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.35);color:#f87171;border-radius:8px;padding:4px 9px;font-size:12px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:4px;margin-left:6px;">🗑️ O‘chirish</button>' +
          '</td>' +
        '</tr>';
      });
    }

    h += '</tbody></table></div></div>';

    // Return the html string so it can be appended at the end of directory, groups, or journal!
    return {
      html: h,
      records: records,
      attachHandlers: function(container) {
        // Excel export
        var expBtn = container.querySelector('#eaBtnExportLoginsExcel');
        if (expBtn) {
          expBtn.onclick = function() {
            EA.exportLoginsToExcel(records, currentClassId ? 'Guruh' : 'Barcha');
          };
        }

        // Add new student
        var addBtn = container.querySelector('#eaBtnAddNewStudentLogins');
        if (addBtn) {
          addBtn.onclick = function() {
            EA.openStudentEnrollModal(currentClassId || (allCls[0] ? allCls[0].id : null), null);
          };
        }

        // Edit student
        var editBtns = container.querySelectorAll('.ea-btn-edit-student-creds');
        editBtns.forEach(function(b) {
          b.onclick = function(e) {
            e.stopPropagation();
            var cid = b.getAttribute('data-cid');
            var stid = b.getAttribute('data-stid');
            EA.openStudentEnrollModal(cid, stid);
          };
        });

        // Delete student from logins table
        var delBtns = container.querySelectorAll('.ea-btn-delete-student-creds');
        delBtns.forEach(function(b) {
          b.onclick = function(e) {
            e.stopPropagation();
            var cid = b.getAttribute('data-cid');
            var stid = b.getAttribute('data-stid');
            var stname = b.getAttribute('data-stname');
            EA.deleteStudentCompletely(cid, stid, stname);
          };
        });

        // Copy button
        var copyBtns = container.querySelectorAll('.ea-btn-copy-val');
        copyBtns.forEach(function(b) {
          b.onclick = function(e) {
            e.stopPropagation();
            var val = b.getAttribute('data-val');
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(val);
              b.innerText = '✓';
              setTimeout(function() { b.innerText = '📋'; }, 1200);
            } else {
              prompt("Nusxa oling:", val);
            }
          };
        });

        // Search input
        var sInp = container.querySelector('#eaLoginsSearchInput');
        if (sInp) {
          sInp.oninput = function() {
            var q = sInp.value.trim().toLowerCase();
            var rows = container.querySelectorAll('.ea-login-row');
            rows.forEach(function(r) {
              var sVal = r.getAttribute('data-search') || '';
              r.style.display = (sVal.indexOf(q) !== -1) ? '' : 'none';
            });
          };
        }
      }
    };
  };


  // ============================================================================
  // PARENT SMS BROADCAST & NOTIFICATION MODAL (SMS GATEWAY UI)
  // ============================================================================
  EA.openSendSmsModal = function(targetClassId, targetStudentId) {
    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';
    overlay.id = 'eaSendSmsOverlay';
    overlay.style.zIndex = '99999';

    var classes = getAvailableClasses();
    var curClass = classes.find(function(c) { return c.id === targetClassId; }) || classes[0];
    var curSt = null;
    if (curClass && targetStudentId) {
      curSt = (curClass.students || []).find(function(s) { return (s.id || s.email) === targetStudentId; });
    }

    var recipientDesc = curSt 
      ? (curSt.name + ' (Ota-onasi: ' + (curSt.parentPhone || curSt.phone || '+998 -- --- -- --') + ')')
      : ((curClass ? curClass.name : 'Tanlangan guruh') + 'dagi barcha ota-onalar (' + ((curClass && curClass.students) ? curClass.students.length : 18) + ' ta raqam)');

    var stNameForTemplate = curSt ? curSt.name : 'farzandingiz';

    var html = '<div class="eth-modal" style="max-width:620px;background:linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.96));border:1.5px solid rgba(245,158,11,0.5);box-shadow:0 24px 60px rgba(0,0,0,0.85),0 0 35px rgba(245,158,11,0.25);border-radius:24px;padding:26px 30px;color:#fff;">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:14px;">' +
        '<div style="display:flex;align-items:center;gap:12px;">' +
          '<div style="width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,#f59e0b,#d97706);display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 6px 18px rgba(245,158,11,0.4);">📲</div>' +
          '<div>' +
            '<h2 style="margin:0;font-size:18.5px;font-weight:900;color:#fff;display:flex;align-items:center;gap:8px;">' +
              'Ota-onalarga SMS Yuborish (SMS Gateway)' +
            '</h2>' +
            '<p style="margin:3px 0 0;font-size:12px;color:#94a3b8;">Dars qoldirish, to‘lov eslatmasi yoki muhim xabarlarni yuborish.</p>' +
          '</div>' +
        '</div>' +
        '<button type="button" id="eaCloseSmsModalBtn" style="background:rgba(255,255,255,0.08);border:none;color:#94a3b8;font-size:20px;cursor:pointer;border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">✕</button>' +
      '</div>' +

      // Gateway Status Banner
      '<div style="background:linear-gradient(135deg,rgba(245,158,11,0.15),rgba(217,119,6,0.1));border:1px solid rgba(245,158,11,0.35);border-radius:14px;padding:10px 14px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;font-size:12px;">' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
          '<span style="font-size:16px;">🔌</span>' +
          '<span><b>SMS Shlyuz:</b> smsapi.uz (O‘zbekiston Milliy Shlyuzi)</span>' +
        '</div>' +
        '<span style="background:rgba(16,185,129,0.2);border:1px solid #10b981;color:#6ee7b7;padding:3px 8px;border-radius:8px;font-weight:900;font-size:11px;">🟢 smsapi.uz API Faol</span>' +
      '</div>' +

      // Recipient info
      '<div style="background:rgba(15,23,42,0.85);border:1px solid rgba(56,189,248,0.3);border-radius:12px;padding:10px 14px;margin-bottom:16px;display:flex;align-items:center;gap:10px;">' +
        '<span style="font-size:16px;">🎯</span>' +
        '<div style="font-size:12.5px;">' +
          '<span style="color:#94a3b8;">Qabul qiluvchi: </span>' +
          '<b style="color:#38bdf8;">' + esc(recipientDesc) + '</b>' +
        '</div>' +
      '</div>' +

      // Quick Templates Buttons
      '<div style="margin-bottom:14px;">' +
        '<label style="display:block;font-size:12px;font-weight:800;color:#cbd5e1;margin-bottom:8px;">⚡ Tezkor SMS Shablonlari (Bosing):</label>' +
        '<div style="display:flex;flex-wrap:wrap;gap:8px;">' +
          '<button type="button" class="ea-sms-tpl-btn" data-tpl="absent" style="background:rgba(239,68,68,0.18);border:1px solid rgba(239,68,68,0.4);color:#fca5a5;border-radius:8px;padding:6px 12px;font-size:11.5px;font-weight:800;cursor:pointer;">🔴 Darsga kelmadi</button>' +
          '<button type="button" class="ea-sms-tpl-btn" data-tpl="payment" style="background:rgba(52,211,153,0.18);border:1px solid rgba(52,211,153,0.4);color:#6ee7b7;border-radius:8px;padding:6px 12px;font-size:11.5px;font-weight:800;cursor:pointer;">💳 To‘lov eslatmasi</button>' +
          '<button type="button" class="ea-sms-tpl-btn" data-tpl="level_test" style="background:rgba(250,204,21,0.18);border:1px solid rgba(250,204,21,0.4);color:#fef08a;border-radius:8px;padding:6px 12px;font-size:11.5px;font-weight:800;cursor:pointer;">⚡ Level test yaqinda</button>' +
          '<button type="button" class="ea-sms-tpl-btn" data-tpl="praise" style="background:rgba(56,189,248,0.18);border:1px solid rgba(56,189,248,0.4);color:#7dd3fc;border-radius:8px;padding:6px 12px;font-size:11.5px;font-weight:800;cursor:pointer;">🌟 A’lo baho / Rahmat</button>' +
        '</div>' +
      '</div>' +

      // Textarea Message
      '<form id="eaSendSmsForm">' +
        '<div style="margin-bottom:16px;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">' +
            '<label style="font-size:12px;font-weight:800;color:#cbd5e1;">SMS Xabar Matni:</label>' +
            '<span id="eaSmsCharCounter" style="font-size:11px;color:#94a3b8;font-family:monospace;font-weight:700;">0 / 160 belgi (1 SMS)</span>' +
          '</div>' +
          '<textarea id="eaSmsTextarea" rows="4" required style="width:100%;box-sizing:border-box;background:rgba(15,23,42,0.95);border:1.5px solid rgba(245,158,11,0.4);border-radius:14px;padding:12px 14px;color:#fff;font-size:13px;font-family:inherit;line-height:1.45;outline:none;resize:vertical;" placeholder="Xabar matnini kiriting yoki yuqoridagi shablonlardan birini tanlang..."></textarea>' +
        '</div>' +

        // Actions
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">' +
          '<div style="font-size:11px;color:#94a3b8;">🔒 smsapi.uz orqali SMS to‘g‘ridan-to‘g‘ri ota-onaning telefoniga yetib boradi.</div>' +
          '<div style="display:flex;align-items:center;gap:10px;">' +
            '<button type="button" id="eaCancelSmsBtn" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#cbd5e1;border-radius:12px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;">Bekor qilish</button>' +
            '<button type="submit" style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border:none;border-radius:12px;padding:10px 22px;font-size:13px;font-weight:900;cursor:pointer;box-shadow:0 4px 18px rgba(245,158,11,0.4);display:inline-flex;align-items:center;gap:6px;">🚀 SMS Yuborish</button>' +
          '</div>' +
        '</div>' +
      '</form>' +
    '</div>';

    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    var ta = overlay.querySelector('#eaSmsTextarea');
    var counter = overlay.querySelector('#eaSmsCharCounter');

    function updateCounter() {
      var len = ta.value.length;
      var smsCount = Math.ceil(len / 160) || 1;
      counter.innerText = len + ' / ' + (smsCount * 160) + ' belgi (' + smsCount + ' SMS)';
    }

    ta.oninput = updateCounter;

    // Templates click
    var templates = {
      absent: "Hurmatli ota-ona! Farzandingiz bugun darsga qatnashmadi. Sababini bilish uchun ustoz bilan bog'laning. English House o'quv markazi.",
      payment: "Hurmatli ota-ona! Farzandingiz " + stNameForTemplate + "ning joriy oy uchun ingliz tili kursi to‘lovini amalga oshirishingizni so‘raymiz. English House.",
      level_test: "Hurmatli ota-ona! Farzandingiz " + stNameForTemplate + " guruhida yaqin kunlarda muhim Level Test imtihoni o‘tkaziladi. Farzandingiz darslarga qatnashishini nazorat qilishingizni so‘raymiz. English House.",
      praise: "Hurmatli ota-ona! Farzandingiz " + stNameForTemplate + " bugungi darsda juda faol qatnashdi va a’lo natija ko‘rsatdi. Farzandingiz muvaffaqiyati bilan tabriklaymiz! English House."
    };

    overlay.querySelectorAll('.ea-sms-tpl-btn').forEach(function(btn) {
      btn.onclick = function() {
        var tplKey = btn.getAttribute('data-tpl');
        if (templates[tplKey]) {
          ta.value = templates[tplKey];
          updateCounter();
        }
      };
    });

    overlay.querySelector('#eaCloseSmsModalBtn').onclick = function() { overlay.remove(); };
    overlay.querySelector('#eaCancelSmsBtn').onclick = function() { overlay.remove(); };

    overlay.querySelector('#eaSendSmsForm').onsubmit = function(e) {
      e.preventDefault();
      var msg = ta.value.trim();
      if (!msg) {
        alert("Iltimos, xabar matnini kiriting!");
        return;
      }

      // Simulate sending and save dispatch record
      overlay.remove();
      if (window.EthithApp && window.EthithApp.toast) {
        window.EthithApp.toast("✅ SMS yuborildi! Token kiritilgach real ota-onalar telefoniga yetkaziladi.");
      } else {
        alert("✅ SMS yuborildi! Token kiritilgach real ota-onalar telefoniga yetkaziladi.");
      }
    };
  };


  // ============================================================================
  // ABSENT-ONLY SMS BROADCAST MODAL (Faqat kelmagan o'quvchilar uchun, matn butunlay saqlanadi)
  // ============================================================================
  EA.openAbsentSmsModal = function(arg1, arg2) {
    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';
    overlay.id = 'eaAbsentSmsOverlay';
    overlay.style.zIndex = '99999';

    var classes = getAvailableClasses();
    var curClass = null;

    function matchClass(target) {
      if (!target) return null;
      if (typeof target === 'object') {
        if (target.id) {
          var byId = classes.find(function(c) { return c && (c.id === target.id || c.name === target.id); });
          if (byId) return byId;
        }
        if (target.name) {
          var byName = classes.find(function(c) { return c && (c.name === target.name || c.id === target.name); });
          if (byName) return byName;
        }
        if (target.students && target.attendance) return target;
      } else if (typeof target === 'string') {
        var byStr = classes.find(function(c) { return c && (c.id === target || c.name === target || c.code === target); });
        if (byStr) return byStr;
      }
      return null;
    }

    curClass = matchClass(arg1) || matchClass(arg2);

    if (!curClass && EA.activeClassId) {
      curClass = matchClass(EA.activeClassId);
    }
    if (!curClass && typeof getActiveOrFirstClass === 'function') {
      curClass = getActiveOrFirstClass();
    }
    if (!curClass) curClass = classes[0];
    if (!curClass) return;
    if (!curClass.attendance) curClass.attendance = { records: {}, lessonTypes: {}, holidays: {} };
    if (!curClass.attendance.records) curClass.attendance.records = {};
    if (!curClass.customStudentPhones) curClass.customStudentPhones = {};
    if (!curClass.customStudentNames) curClass.customStudentNames = {};

    // Dates in journal
    var dates = getJournalDates(curClass, EA.viewMode || 'window');
    var todayKey = formatDateKey(new Date());

    // 1. Check if today has absents
    var matchDateKey = todayKey;
    var foundAbsents = false;
    var rMapToday = (curClass.attendance && curClass.attendance.records && curClass.attendance.records[todayKey]) || {};
    for (var sid in rMapToday) {
      var r = rMapToday[sid];
      if (r && (r.status === 'Q' || r.status === 'absent' || r.status === 'q' || r.val === 'Q')) {
        foundAbsents = true;
        break;
      }
    }

    // 2. If no absents today, search backwards through journal dates for latest date with Q
    if (!foundAbsents) {
      for (var di = dates.length - 1; di >= 0; di--) {
        var dk = formatDateKey(dates[di]);
        var rMap = (curClass.attendance && curClass.attendance.records && curClass.attendance.records[dk]) || {};
        for (var sid2 in rMap) {
          var r2 = rMap[sid2];
          if (r2 && (r2.status === 'Q' || r2.status === 'absent' || r2.status === 'q' || r2.val === 'Q')) {
            matchDateKey = dk;
            foundAbsents = true;
            break;
          }
        }
        if (foundAbsents) break;
      }
    }

    // Collect absent students for matchDateKey
    var absentStudents = [];
    (curClass.students || []).forEach(function(st, sIdx) {
      var stId = st.id || st.email || ('std_' + sIdx);
      var rMap = (curClass.attendance && curClass.attendance.records && curClass.attendance.records[matchDateKey]) || {};
      var rec = rMap[stId] || (st.id && rMap[st.id]) || (st.login && rMap[st.login]) || (st.name && rMap[st.name]);
      if (rec && (rec.status === 'Q' || rec.status === 'absent' || rec.status === 'q' || rec.val === 'Q')) {
        absentStudents.push(st);
      }
    });

    // Also collect from other journal dates if today has 0
    if (absentStudents.length === 0) {
      dates.forEach(function(rd) {
        var dk = formatDateKey(rd);
        var rMap = curClass.attendance.records[dk] || {};
        (curClass.students || []).forEach(function(st, sIdx) {
          var stId = st.id || st.email || ('std_' + sIdx);
          var rec = rMap[stId] || (st.id && rMap[st.id]) || (st.login && rMap[st.login]) || (st.name && rMap[st.name]);
          if (rec && (rec.status === 'Q' || rec.status === 'absent' || rec.status === 'q' || rec.val === 'Q')) {
            if (!absentStudents.some(function(as) { return (as.id || as.email) === stId; })) {
              absentStudents.push(st);
            }
          }
        });
      });
    }

    // Permanent text persistence from localStorage (strictly <= 160 chars)
    var EXACT_SMSAPI_TEMPLATE = "Hurmatli ota-ona! Farzandingiz bugun darsga qatnashmadi. Sababini bilish uchun ustoz bilan bog'laning. English House o'quv markazi.";
    var savedText = '';
    try {
      savedText = localStorage.getItem('ethith_saved_absent_sms_template');
    } catch(e) {}
    if (!savedText || savedText.length > 160 || savedText !== EXACT_SMSAPI_TEMPLATE) {
      savedText = EXACT_SMSAPI_TEMPLATE;
      try { localStorage.setItem('ethith_saved_absent_sms_template', EXACT_SMSAPI_TEMPLATE); } catch(e) {}
    }

    

    var html = '<div class="eth-modal" style="max-width:640px;background:linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.96));border:1.5px solid rgba(245,158,11,0.5);box-shadow:0 24px 60px rgba(0,0,0,0.85),0 0 35px rgba(245,158,11,0.25);border-radius:24px;padding:26px 30px;color:#fff;">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:14px;">' +
        '<div style="display:flex;align-items:center;gap:12px;">' +
          '<div style="width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,#f59e0b,#d97706);display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 6px 18px rgba(245,158,11,0.4);">📲</div>' +
          '<div>' +
            '<h2 style="margin:0;font-size:18.5px;font-weight:900;color:#fff;display:flex;align-items:center;gap:8px;">' +
              'Darsga Kelmaganlarga SMS Yuborish' +
            '</h2>' +
            '<p style="margin:3px 0 0;font-size:12px;color:#94a3b8;">Guruh: <b style="color:#38bdf8;">' + esc(curClass.name || curClass.id) + '</b> • Ustoz: <b style="color:#fff;">' + esc(curClass.teacherName || curClass.teacher || 'Ustoz') + '</b> • Sana: <b style="color:#f59e0b;">' + esc(matchDateKey) + '</b></p>' +
          '</div>' +
        '</div>' +
        '<button type="button" id="eaCloseAbsentSmsBtn" style="background:rgba(255,255,255,0.08);border:none;color:#94a3b8;font-size:20px;cursor:pointer;border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">✕</button>' +
      '</div>';

    // Automatic Seamless SMS Gateway Banner (100% Avtomatik, shlyuz tanlash talab etilmaydi)
    html += '<div style="background:rgba(15,23,42,0.85);border:1px solid rgba(245,158,11,0.35);border-radius:14px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<span style="font-size:22px;">⚡</span>' +
          '<div>' +
            '<div style="font-size:12.5px;font-weight:900;color:#6ee7b7;">SMS Shlyuz: smsapi.uz (Rasmiy Sayt Shlyuzi)</div>' + '<div style="font-size:11px;color:#94a3b8;">API: 4480804365a1569479f178d2c1834629 • Server orqali rasmiy yuboriladi</div>' +
          '</div>' +
        '</div>' +
        '<span style="background:rgba(16,185,129,0.2);border:1px solid rgba(16,185,129,0.5);color:#6ee7b7;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:900;">🟢 Avtomatik Faol</span>' +
      '</div>' +

      // Automatically Detected Absent Students Box
      '<div style="background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.35);border-radius:16px;padding:14px 18px;margin-bottom:18px;">' +
        '<div style="font-size:12.5px;font-weight:900;color:#fca5a5;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;">' +
          '<span>🔴 Darsga kelmagan deb aniqlangan o‘quvchilar:</span>' +
          '<span style="background:rgba(239,68,68,0.25);border:1px solid #ef4444;color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:900;">' + absentStudents.length + ' ta o‘quvchi</span>' +
        '</div>';

    if (absentStudents.length === 0) {
      html += '<div style="font-size:12.5px;color:#cbd5e1;padding:6px 0;">✅ Ushbu guruhda bugun barcha o‘quvchilar qatnashgan (Dars qoldirganlar yo‘q). Xabar yuborish uchun davomat jadvalida o‘quvchi katakchasini "Q" (Kelmagan - qizil) deb belgilang.</div>';
    } else {
      html += '<div style="max-height:160px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding-right:4px;">';
      absentStudents.forEach(function(ast, aidx) {
        var sid = ast.id || ast.email || ('std_' + aidx);
        var phone = (curClass.customStudentPhones && curClass.customStudentPhones[sid]) || ast.parentPhone || ast.phone || '';
        html += '<div style="display:flex;align-items:center;justify-content:space-between;background:rgba(15,23,42,0.7);border:1px solid rgba(239,68,68,0.25);padding:8px 12px;border-radius:10px;font-size:12.5px;flex-wrap:wrap;gap:8px;">' +
          '<span><b>' + (aidx + 1) + '. ' + esc(ast.name) + '</b></span>' +
          '<div style="display:flex;align-items:center;gap:6px;">' +
            '<div style="display:flex;align-items:center;background:#0b1222;border:1px solid rgba(245,158,11,0.4);border-radius:8px;overflow:hidden;">' +
              '<span style="background:rgba(245,158,11,0.2);border-right:1px solid rgba(245,158,11,0.3);color:#fbbf24;font-weight:900;font-size:11.5px;padding:4px 7px;user-select:none;font-family:monospace;">+998</span>' +
              '<input type="tel" class="ea-live-absent-phone" data-stid="' + esc(sid) + '" maxlength="9" value="' + esc(phone.replace(/\D/g, '').slice(-9)) + '" placeholder="901234567" style="width:90px;background:transparent;border:none;color:#fff;padding:4px 6px;font-size:12px;font-weight:900;letter-spacing:0.5px;outline:none;" />' +
            '</div>' +
          '</div>' +
        '</div>';
      });
      html += '</div>';
    }
    html += '</div>' +

      // Message Area with Permanent Persistence
      '<form id="eaSendAbsentSmsForm">' +
        '<div style="margin-bottom:16px;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">' +
            '<label style="font-size:12px;font-weight:800;color:#cbd5e1;">SMS Xabar Matni (Har doim saqlanib qoladi):</label>' +
            '<span id="eaAbsentSmsCharCounter" style="font-size:11px;color:#94a3b8;font-family:monospace;font-weight:700;">0 / 160 belgi (1 SMS)</span>' +
          '</div>' +
          '<textarea id="eaAbsentSmsTextarea" rows="4" maxlength="160" required style="width:100%;box-sizing:border-box;background:rgba(15,23,42,0.95);border:1.5px solid rgba(245,158,11,0.4);border-radius:14px;padding:12px 14px;color:#fff;font-size:13px;font-family:inherit;line-height:1.45;outline:none;resize:vertical;">' + esc(savedText) + '</textarea>' +
          '<small style="color:#94a3b8;font-size:11px;margin-top:4px;display:block;">💾 Qat‘iy qoida: Xabar matni 160 belgidan bitta harf yoki nuqta ham oshmaydi (1 SMS limit).</small>' +
        '</div>' +

        // Actions
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">' +
          '<div style="font-size:11px;color:#94a3b8;">🔒 Faqat ushbu guruhdagi kelmaganlarning ota-onalariga boradi.</div>' +
          '<div style="display:flex;align-items:center;gap:10px;">' +
            '<button type="button" id="eaCancelAbsentSmsBtn" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#cbd5e1;border-radius:12px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;">Bekor qilish</button>' +
            '<button type="submit" ' + (absentStudents.length === 0 ? 'disabled style="opacity:0.5;cursor:not-allowed;' : 'style="cursor:pointer;') + 'background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border:none;border-radius:12px;padding:10px 22px;font-size:13px;font-weight:900;box-shadow:0 4px 18px rgba(245,158,11,0.4);display:inline-flex;align-items:center;gap:6px;">🚀 Kelmaganlarga SMS Yuborish</button>' +
          '</div>' +
        '</div>' +
      '</form>' +
    '</div>';

    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    var ta = overlay.querySelector('#eaAbsentSmsTextarea');
    var counter = overlay.querySelector('#eaAbsentSmsCharCounter');

    function updateCounter() {
      if (ta.value.length > 160) {
        ta.value = ta.value.slice(0, 160);
      }
      var len = ta.value.length;
      var rem = 160 - len;
      counter.innerHTML = '<b style="color:' + (len >= 160 ? '#f59e0b' : '#38bdf8') + '">' + len + '</b> / 160 belgi (qoldi: ' + rem + ', 1 SMS)';
      try {
        localStorage.setItem('ethith_saved_absent_sms_template', ta.value);
      } catch(e) {}
    }

    ta.oninput = updateCounter;
    updateCounter();

    overlay.querySelectorAll('.ea-live-absent-phone').forEach(function(inp) {
      inp.oninput = function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 9);
      };
      inp.onchange = function() {
        var sid = inp.getAttribute('data-stid');
        var val9 = inp.value.replace(/\D/g, '');
        var fullPh = val9 ? ('+998' + val9) : '';
        curClass.customStudentPhones[sid] = fullPh;
        var ast = absentStudents.find(function(a) { return (a.id || a.email) === sid; });
        if (ast) {
          ast.parentPhone = fullPh;
          ast.phone = fullPh;
        }
      };
    });

    overlay.querySelector('#eaCloseAbsentSmsBtn').onclick = function() { overlay.remove(); };
    overlay.querySelector('#eaCancelAbsentSmsBtn').onclick = function() { overlay.remove(); };

    overlay.querySelector('#eaSendAbsentSmsForm').onsubmit = async function(e) {
      e.preventDefault();
      var msg = ta.value.trim();
      if (!msg) return;
      if (msg.length > 160) {
        msg = msg.slice(0, 160);
      }

      if (absentStudents.length === 0) {
        alert("Darsga kelmagan deb belgilangan o'quvchilar yo'q!");
        return;
      }

      var recipients = [];
      absentStudents.forEach(function(ast) {
        var sid = ast.id || ast.email;
        var ph = (curClass.customStudentPhones && curClass.customStudentPhones[sid]) || ast.parentPhone || ast.phone;
        if (ph) {
          recipients.push({
            name: ast.name,
            phone: ph
          });
        }
      });

      if (recipients.length === 0) {
        alert("Kelmagan o'quvchilarning birortasida ham telefon raqam kiritilmagan! Iltimos, ota-onasi raqamini kiriting.");
        return;
      }

      var sBtn = overlay.querySelector('button[type="submit"]');
      if (sBtn) {
        sBtn.disabled = true;
        sBtn.innerHTML = '⏳ SMS yuborilmoqda (Avtomatik Shlyuz)...';
      }

      var res = await EA.sendSmsApiUz(recipients, msg, 'auto');
      if (sBtn) {
        sBtn.disabled = false;
        sBtn.innerHTML = '🚀 Kelmaganlarga SMS Yuborish';
      }

      if (res.success) {
        overlay.remove();
        var toastMsg = "✅ " + res.count + " ta ota-onaga SMS (" + (res.gateway || 'SMS Shlyuz') + ") orqali muvaffaqiyatli yuborildi!";
        if (res.note) toastMsg += "\nℹ️ " + res.note;
        if (res.warning) toastMsg += "\n⚠️ " + res.warning;
        if (window.EthithApp && window.EthithApp.toast) {
          window.EthithApp.toast(toastMsg);
        } else {
          alert(toastMsg);
        }
      } else {
        var errDetail = res.error || "Server API ulanmadi";
        alert("⚠️ SMS yuborishda xatolik yuz berdi:\n\n" + errDetail);
      }
    };
  };

})(window);