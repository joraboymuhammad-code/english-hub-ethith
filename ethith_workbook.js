/**
 * ETHITH OXFORD NAVIGATE INTERMEDIATE (B1+) DIGITAL WORKBOOK
 * Authentic OUP Navigate Intermediate (B1+) Material
 * High-performance, lightweight image-overlay system with zero PDF lag.
 * Omits all listening exercises strictly per requirements.
 */

(function(window) {
  'use strict';

  var WB = window.ETHITH_WORKBOOK_B1 = window.ETHITH_WORKBOOK_B1 || {};

  // 12 Authentic Units from Oxford Navigate Intermediate B1+
  WB.units = [
    {
      unit: 1,
      title: "Unit 1: Trends",
      subtitle: "Grammar: Present simple, continuous and perfect · Vocabulary: Friendship",
      available: true,
      lessons: [
        { code: "1.1", title: "1.1 Are you really my friend?", desc: "Grammar (Present tenses), Vocabulary (Friendship) & Pronunciation", pages: [4, 5], active: true },
        { code: "1.2", title: "1.2 Why spending's #trending", desc: "Grammar (State verbs), Vocabulary (Spending)", pages: [6, 7], active: false },
        { code: "1.3", title: "1.3 Vocabulary development", desc: "Noun suffixes (-ment, -tion, -ity, -ship)", pages: [8], active: false },
        { code: "1.4", title: "1.4 Speaking and writing", desc: "Asking for and giving opinions, writing social media", pages: [9], active: false },
        { code: "1.5", title: "1.5 Review", desc: "Unit 1 Grammar and vocabulary review test", pages: [10], active: false }
      ]
    },
    { unit: 2, title: "Unit 2: What a story!", subtitle: "Narrative forms & sequencing events · Vocabulary: Describing past experiences", available: false, lessonsCount: 5 },
    { unit: 3, title: "Unit 3: Style and status", subtitle: "Modals of obligation · Vocabulary: Clothes and fashion", available: false, lessonsCount: 5 },
    { unit: 4, title: "Unit 4: Going the distance", subtitle: "Future forms · Vocabulary: Travel & Transport", available: false, lessonsCount: 5 },
    { unit: 5, title: "Unit 5: Rights and responsibilities", subtitle: "Permission and obligation · Vocabulary: Law and order", available: false, lessonsCount: 5 },
    { unit: 6, title: "Unit 6: Living in the past", subtitle: "Habits in the past · Vocabulary: History and memories", available: false, lessonsCount: 5 },
    { unit: 7, title: "Unit 7: Ambitions", subtitle: "used to and would, question forms · Vocabulary: Working conditions", available: false, lessonsCount: 5 },
    { unit: 8, title: "Unit 8: Choices", subtitle: "Real and unreal conditionals · Vocabulary: Happiness factors", available: false, lessonsCount: 5 },
    { unit: 9, title: "Unit 9: Appearances", subtitle: "Comparison and deduction · Vocabulary: Physical appearance", available: false, lessonsCount: 5 },
    { unit: 10, title: "Unit 10: Compete and cooperate", subtitle: "Passives & articles · Vocabulary: Business & competitive sport", available: false, lessonsCount: 5 },
    { unit: 11, title: "Unit 11: Consequences", subtitle: "Unreal past conditionals · Vocabulary: Crime and behavior", available: false, lessonsCount: 5 },
    { unit: 12, title: "Unit 12: Influence", subtitle: "Reported speech & questions · Vocabulary: Advertising and persuasion", available: false, lessonsCount: 5 }
  ];

  // Verified Answer Keys and Overlay Coordinates for Unit 1.1 (Pages 4 and 5)
  // Page 4: Grammar (Ex 1, Ex 2, Ex 3)
  // Page 5: Vocabulary friendship (Ex 4a, Ex 5, Ex 6, Ex 7b)
  WB.defaultInputs = {
    4: [
      // Exercise 1: Present Simple, Continuous & Perfect (Lines 2 to 9)
      { id: "p4_ex1_2", page: 4, exercise: "1", label: "2", top: 63.3, left: 18.0, width: 14.5, height: 2.3, correct: "access or ACCESS" },
      { id: "p4_ex1_3", page: 4, exercise: "1", label: "3", top: 68.6, left: 9.0, width: 17.0, height: 2.3, correct: "is still changing or 's still changing" },
      { id: "p4_ex1_4", page: 4, exercise: "1", label: "4", top: 73.1, left: 24.5, width: 16.0, height: 2.3, correct: "check or CHECK" },
      { id: "p4_ex1_5", page: 4, exercise: "1", label: "5", top: 79.5, left: 9.0, width: 16.5, height: 2.3, correct: "is increasing or 's increasing" },
      { id: "p4_ex1_6", page: 4, exercise: "1", label: "6", top: 83.9, left: 20.0, width: 16.5, height: 2.3, correct: "have already uploaded or 've already uploaded" },
      { id: "p4_ex1_7", page: 4, exercise: "1", label: "7", top: 88.3, left: 17.0, width: 16.5, height: 2.3, correct: "is currently growing or 's currently growing" },
      { id: "p4_ex1_8", page: 4, exercise: "1", label: "8", top: 92.7, left: 17.0, width: 15.5, height: 2.3, correct: "has or HAS" },
      { id: "p4_ex1_9", page: 4, exercise: "1", label: "9", top: 97.2, left: 9.0, width: 16.5, height: 2.3, correct: "have just checked or 've just checked" },

      // Exercise 2: Cross out the incorrect word/phrase (Sentences 1 to 6)
      { id: "p4_ex2_1", page: 4, exercise: "2", label: "2.1", top: 35.6, left: 53.0, width: 38.0, height: 2.3, correct: "yet" },
      { id: "p4_ex2_2", page: 4, exercise: "2", label: "2.2", top: 39.3, left: 53.0, width: 38.0, height: 2.3, correct: "all the time" },
      { id: "p4_ex2_3", page: 4, exercise: "2", label: "2.3", top: 42.9, left: 53.0, width: 38.0, height: 2.3, correct: "already" },
      { id: "p4_ex2_4", page: 4, exercise: "2", label: "2.4", top: 46.5, left: 53.0, width: 38.0, height: 2.3, correct: "at the moment" },
      { id: "p4_ex2_5", page: 4, exercise: "2", label: "2.5", top: 50.1, left: 53.0, width: 38.0, height: 2.3, correct: "now" },
      { id: "p4_ex2_6", page: 4, exercise: "2", label: "2.6", top: 53.7, left: 53.0, width: 38.0, height: 2.3, correct: "every time" },

      // Exercise 3: Work for LinkedIn (Blanks 1 to 8)
      { id: "p4_ex3_1", page: 4, exercise: "3", label: "3.1", top: 65.1, left: 54.0, width: 22.0, height: 2.3, correct: "Have you heard or have you heard" },
      { id: "p4_ex3_2", page: 4, exercise: "3", label: "3.2", top: 73.9, left: 69.0, width: 18.0, height: 2.3, correct: "is increasing or 's increasing" },
      { id: "p4_ex3_3", page: 4, exercise: "3", label: "3.3", top: 77.5, left: 74.0, width: 14.0, height: 2.3, correct: "has or HAS" },
      { id: "p4_ex3_4", page: 4, exercise: "3", label: "3.4", top: 81.1, left: 70.0, width: 18.0, height: 2.3, correct: "check or CHECK" },
      { id: "p4_ex3_5", page: 4, exercise: "3", label: "3.5", top: 84.7, left: 71.0, width: 16.0, height: 2.3, correct: "use or USE" },
      { id: "p4_ex3_6", page: 4, exercise: "3", label: "3.6", top: 90.4, left: 54.0, width: 22.0, height: 2.3, correct: "has already visited or 's already visited" },
      { id: "p4_ex3_7", page: 4, exercise: "3", label: "3.7", top: 94.0, left: 63.0, width: 16.0, height: 2.3, correct: "include or INCLUDE" },
      { id: "p4_ex3_8", page: 4, exercise: "3", label: "3.8", top: 97.1, left: 62.0, width: 20.0, height: 2.3, correct: "are taking place or 're taking place" }
    ],
    5: [
      // Exercise 4a: Match questions 1-6 to answers a-f
      { id: "p5_ex4_1", page: 5, exercise: "4a", label: "4.1", top: 12.9, left: 7.0, width: 5.5, height: 2.3, correct: "c" },
      { id: "p5_ex4_2", page: 5, exercise: "4a", label: "4.2", top: 15.0, left: 7.0, width: 5.5, height: 2.3, correct: "f" },
      { id: "p5_ex4_3", page: 5, exercise: "4a", label: "4.3", top: 17.0, left: 7.0, width: 5.5, height: 2.3, correct: "a" },
      { id: "p5_ex4_4", page: 5, exercise: "4a", label: "4.4", top: 19.1, left: 7.0, width: 5.5, height: 2.3, correct: "d" },
      { id: "p5_ex4_5", page: 5, exercise: "4a", label: "4.5", top: 21.2, left: 7.0, width: 5.5, height: 2.3, correct: "e" },
      { id: "p5_ex4_6", page: 5, exercise: "4a", label: "4.6", top: 23.2, left: 7.0, width: 5.5, height: 2.3, correct: "b" },

      // Exercise 5: Put word in brackets in the correct place
      { id: "p5_ex5_1", page: 5, exercise: "5", label: "5.1", top: 43.4, left: 7.0, width: 9.0, height: 2.3, correct: "out" },
      { id: "p5_ex5_2", page: 5, exercise: "5", label: "5.2", top: 45.5, left: 7.0, width: 9.0, height: 2.3, correct: "out" },
      { id: "p5_ex5_3", page: 5, exercise: "5", label: "5.3", top: 47.5, left: 7.0, width: 9.0, height: 2.3, correct: "on" },
      { id: "p5_ex5_4", page: 5, exercise: "5", label: "5.4", top: 49.6, left: 7.0, width: 9.0, height: 2.3, correct: "in" },
      { id: "p5_ex5_5", page: 5, exercise: "5", label: "5.5", top: 51.7, left: 7.0, width: 9.0, height: 2.3, correct: "with" },

      // Exercise 6: Complete opinions with have, help, keep, make, trust
      { id: "p5_ex6_2", page: 5, exercise: "6", label: "6.2", top: 69.7, left: 23.0, width: 14.0, height: 2.3, correct: "help" },
      { id: "p5_ex6_3", page: 5, exercise: "6", label: "6.3", top: 73.3, left: 13.0, width: 14.0, height: 2.3, correct: "trust" },
      { id: "p5_ex6_4", page: 5, exercise: "6", label: "6.4", top: 79.0, left: 10.0, width: 14.0, height: 2.3, correct: "have" },
      { id: "p5_ex6_5", page: 5, exercise: "6", label: "6.5", top: 82.1, left: 39.0, width: 14.0, height: 2.3, correct: "make" },

      // Exercise 7b: Pronunciation rule (consonant / vowel)
      { id: "p5_ex7_1", page: 5, exercise: "7b", label: "7.1", top: 57.3, left: 66.0, width: 16.0, height: 2.3, correct: "consonant" },
      { id: "p5_ex7_2", page: 5, exercise: "7b", label: "7.2", top: 60.4, left: 78.0, width: 14.0, height: 2.3, correct: "vowel" }
    ]
  };

  // Get active inputs for a page (with custom saved overrides)
  WB.getPageInputs = function(page) {
    try {
      var saved = localStorage.getItem('ethith_wb_coords_' + page);
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return WB.defaultInputs[page] || [];
  };

  WB.savePageInputs = function(page, inputs) {
    try {
      localStorage.setItem('ethith_wb_coords_' + page, JSON.stringify(inputs));
    } catch(e) {}
  };

  WB.resetPageInputs = function(page) {
    try {
      localStorage.removeItem('ethith_wb_coords_' + page);
    } catch(e) {}
  };

  // Check an individual input against correct options
  WB.checkAnswer = function(userVal, correctRaw) {
    var userClean = (userVal || '').trim().toLowerCase();
    if (!userClean) return false;
    var allowed = [];
    if (Array.isArray(correctRaw)) {
      allowed = correctRaw;
    } else if (typeof correctRaw === 'string') {
      allowed = correctRaw.split(/\s+or\s+/i);
    }
    return allowed.some(function(opt) {
      var optClean = opt.trim().toLowerCase();
      var norm1 = userClean.replace(/’/g, "'");
      var norm2 = optClean.replace(/’/g, "'");
      return norm1 === norm2;
    });
  };

  // Open Lesson Helper with robust multi-layer fallback
  WB.openLesson = function(unitNum, lessonCode, pageNum) {
    unitNum = parseInt(unitNum, 10) || 1;
    lessonCode = lessonCode || '1.1';
    pageNum = parseInt(pageNum, 10) || 4;
    var apView = document.getElementById('apView');
    if (window.go) {
      window.go('intermediate', { unit: unitNum, lesson: lessonCode, page: pageNum });
    } else if (window.ethithOpenApp) {
      window.ethithOpenApp('intermediate', { unit: unitNum, lesson: lessonCode, page: pageNum });
    } else if (apView) {
      renderLesson1_1(apView, pageNum);
    }
  };

  // Main Intermediate View Entry Point
  window.EthithViews = window.EthithViews || {};
  window.EthithViews.renderIntermediateView = function(container, arg) {
    if (!arg || !arg.unit) {
      renderUnitsCatalog(container);
    } else if (arg.unit === 1 && (arg.lesson === '1.1' || !arg.lesson)) {
      renderLesson1_1(container, arg.page || 4);
    } else {
      renderUnitsCatalog(container);
    }
  };

  // 1. Units Catalog View (Shows 12 Units in sequence)
  function renderUnitsCatalog(container) {
    var h = '<div class="eth-wb-catalog" style="max-width:1100px;margin:0 auto;padding:16px 20px 60px;">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;margin-bottom:24px;background:linear-gradient(135deg,rgba(14,165,233,0.12),rgba(30,58,138,0.22));border:1px solid rgba(56,189,248,0.3);padding:22px 26px;border-radius:20px;backdrop-filter:blur(10px);">' +
        '<div>' +
          '<div style="display:inline-flex;align-items:center;gap:6px;background:#0284c7;color:#fff;font-size:11px;font-weight:800;padding:4px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">' +
            '📘 Oxford Navigate B1+ Workbook' +
          '</div>' +
          '<h1 style="font-size:26px;font-weight:900;margin:0 0 6px;color:var(--text)">Intermediate (B1+) Darslik Dasturi</h1>' +
          '<p style="font-size:14px;color:var(--muted);margin:0;max-width:650px;line-height:1.5;">' +
            '12 ta rasmiy Unitlar. Kitob sahifalari ustiga shaffof interaktiv kataklar orqali to‘g‘ridan-to‘g‘ri yeching. <b style="color:#38bdf8;">(Listening mashqlari butunlay chiqarib tashlangan).</b>' +
          '</p>' +
        '</div>' +
        '<div style="display:flex;gap:10px;align-items:center;">' +
          '<div style="background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px 18px;text-align:center;">' +
            '<div style="font-size:20px;font-weight:900;color:#0ea5e9;">12</div>' +
            '<div style="font-size:11px;font-weight:700;color:var(--muted);">Jami Unitlar</div>' +
          '</div>' +
          '<div style="background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px 18px;text-align:center;">' +
            '<div style="font-size:20px;font-weight:900;color:#10b981;">1.1</div>' +
            '<div style="font-size:11px;font-weight:700;color:var(--muted);">Faol Mavzu</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    // Unit Grid (12 units)
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));gap:18px;">';

    WB.units.forEach(function(u) {
      var isAvail = u.available;
      h += '<div class="eth-wb-unit-card" style="background:var(--card);border:1.5px solid ' + (isAvail ? '#38bdf8' : 'var(--line)') + ';border-radius:18px;padding:20px;position:relative;display:flex;flex-direction:column;justify-content:space-between;transition:all 0.25s ease;box-shadow:' + (isAvail ? '0 12px 30px -10px rgba(14,165,233,0.3)' : 'none') + ';">' +
        '<div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">' +
            '<span style="font-size:12px;font-weight:800;color:' + (isAvail ? '#0284c7' : 'var(--muted)') + ';text-transform:uppercase;letter-spacing:0.04em;">UNIT ' + u.unit + '</span>' +
            '<span style="font-size:11px;font-weight:700;padding:3px 9px;border-radius:12px;background:' + (isAvail ? 'rgba(16,185,129,0.15)' : 'var(--soft)') + ';color:' + (isAvail ? '#10b981' : 'var(--muted)') + ';">' +
              (isAvail ? '● Ochiq (Tayyor)' : '🔒 Tez kunda') +
            '</span>' +
          '</div>' +
          '<h3 style="font-size:18px;font-weight:800;margin:0 0 6px;color:var(--text);">' + u.title + '</h3>' +
          '<p style="font-size:13px;color:var(--muted);margin:0 0 16px;line-height:1.4;">' + u.subtitle + '</p>';

      if (isAvail && u.lessons) {
        h += '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">';
        u.lessons.forEach(function(les) {
          h += '<div class="eth-wb-lesson-row" data-unit="' + u.unit + '" data-lesson="' + les.code + '" ' +
            (les.active ? 'onclick="if(window.ETHITH_WORKBOOK_B1) window.ETHITH_WORKBOOK_B1.openLesson(' + u.unit + ', \'' + les.code + '\', 4);"' : '') +
            ' style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 12px;border-radius:12px;background:' + (les.active ? 'rgba(14,165,233,0.12)' : 'var(--soft)') + ';border:1.5px solid ' + (les.active ? '#38bdf8' : 'transparent') + ';cursor:' + (les.active ? 'pointer' : 'default') + ';transition:all 0.2s;">' +
            '<div style="min-width:0;flex:1;">' +
              '<div style="font-size:13.5px;font-weight:800;color:' + (les.active ? '#0284c7' : 'var(--text)') + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + les.title + '</div>' +
              '<div style="font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + les.desc + '</div>' +
            '</div>' +
            '<button type="button" ' +
              (les.active ? 'onclick="event.stopPropagation(); if(window.ETHITH_WORKBOOK_B1) window.ETHITH_WORKBOOK_B1.openLesson(' + u.unit + ', \'' + les.code + '\', 4);"' : '') +
              ' style="flex:none;background:' + (les.active ? 'linear-gradient(135deg, #0284c7, #154b89)' : 'var(--line)') + ';color:#fff;border:none;border-radius:10px;padding:7px 16px;font-size:12.5px;font-weight:900;cursor:pointer;box-shadow:' + (les.active ? '0 4px 14px rgba(2,132,199,0.45)' : 'none') + ';">' +
              (les.active ? 'Boshlash ➔' : 'Tez kunda') +
            '</button>' +
          '</div>';
        });
        h += '</div>';
      }

      h += '</div>' +
        '<div style="border-top:1px solid var(--line);padding-top:12px;display:flex;align-items:center;justify-content:space-between;font-size:12px;color:var(--muted);">' +
          '<span>Navigate B1+ Workbook</span>' +
          '<span>' + (isAvail ? '2 Sahifa' : '5 Dars') + '</span>' +
        '</div>' +
      '</div>';
    });

    h += '</div></div>';
    container.innerHTML = h;

    // Attach click events on lesson rows
    container.querySelectorAll('.eth-wb-lesson-row').forEach(function(row) {
      row.addEventListener('click', function(e) {
        var un = this.getAttribute('data-unit');
        var les = this.getAttribute('data-lesson');
        if (les === '1.1') {
          WB.openLesson(un, les, 4);
        }
      });
    });
  }

  WB.renderUnitsCatalog = renderUnitsCatalog;
  WB.renderLesson1_1 = renderLesson1_1;

  // 2. Interactive Digital Workbook Viewer (Unit 1.1)
  function renderLesson1_1(container, activePage) {
    activePage = parseInt(activePage, 10) || 4;
    var isTeacher = (window.EthithApp && window.EthithApp.state && window.EthithApp.state.user && window.EthithApp.state.user.role === 'teacher');
    var isEditor = (window._ethithWbEditorMode === true);

    // Resolve robust image path
    var basePath = window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    var p4Img = basePath + 'workbook_b1_u1_p4.jpg';
    var p5Img = basePath + 'workbook_b1_u1_p5.jpg';

    var p4Inputs = WB.getPageInputs(4);
    var p5Inputs = WB.getPageInputs(5);

    var h = '<div class="eth-wb-viewer" style="max-width:1050px;margin:0 auto;padding:12px 16px 80px;">' +
      // Header & Navigation Strip
      '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:14px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px 18px;">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<button id="ethWbBackBtn" style="background:var(--soft);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:8px 14px;font-size:12.5px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:6px;">' +
            '← Barcha Unitlar' +
          '</button>' +
          '<div>' +
            '<div style="font-size:15px;font-weight:900;color:var(--text);">Unit 1.1: Are you really my friend?</div>' +
            '<div style="font-size:11.5px;color:var(--muted);">Oxford Navigate B1+ Workbook · Unit 1 Trends (Listening chiqarib tashlangan)</div>' +
          '</div>' +
        '</div>' +

        // Controls (Page Tabs & Editor Toggle)
        '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
          '<div style="display:inline-flex;background:var(--soft);border:1px solid var(--line);border-radius:10px;padding:3px;">' +
            '<button class="eth-wb-page-tab ' + (activePage === 4 ? 'active' : '') + '" data-page="4" style="border:none;background:' + (activePage === 4 ? '#0284c7' : 'transparent') + ';color:' + (activePage === 4 ? '#fff' : 'var(--text)') + ';padding:6px 14px;border-radius:8px;font-weight:800;font-size:12px;cursor:pointer;">1-sahifa (Grammar)</button>' +
            '<button class="eth-wb-page-tab ' + (activePage === 5 ? 'active' : '') + '" data-page="5" style="border:none;background:' + (activePage === 5 ? '#0284c7' : 'transparent') + ';color:' + (activePage === 5 ? '#fff' : 'var(--text)') + ';padding:6px 14px;border-radius:8px;font-weight:800;font-size:12px;cursor:pointer;">2-sahifa (Vocabulary)</button>' +
            '<button class="eth-wb-page-tab ' + (activePage === 0 ? 'active' : '') + '" data-page="0" style="border:none;background:' + (activePage === 0 ? '#0284c7' : 'transparent') + ';color:' + (activePage === 0 ? '#fff' : 'var(--text)') + ';padding:6px 14px;border-radius:8px;font-weight:800;font-size:12px;cursor:pointer;">Ikkala sahifa</button>' +
          '</div>' +

          // Visual Editor Mode Toggle
          '<button id="ethWbToggleEditor" style="background:' + (isEditor ? '#ef4444' : '#10b981') + ';color:#fff;border:none;border-radius:10px;padding:8px 14px;font-size:12px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:6px;">' +
            (isEditor ? '✖ Tahrirlashni Yopish' : '✏️ Visual Editor (Ustoz)') +
          '</button>' +
        '</div>' +
      '</div>';

    // Visual Editor Toolbar if active
    if (isEditor) {
      h += '<div id="ethWbEditorToolbar" style="background:rgba(15,23,42,0.95);border:2px solid #38bdf8;border-radius:14px;padding:12px 18px;margin-bottom:14px;color:#fff;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;box-shadow:0 8px 24px rgba(0,0,0,0.4);">' +
        '<div style="font-size:13px;font-weight:700;">' +
          '<span style="color:#38bdf8;">Visual Editor Faol:</span> Rasm ustida sichqoncha bilan to‘rtburchak tortib yangi katakcha chizing yoki mavjud kataklar ustiga bosib tahrirlang/o‘chiring.' +
        '</div>' +
        '<div style="display:flex;gap:8px;">' +
          '<button id="ethWbExportBtn" style="background:#0284c7;color:#fff;border:none;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;">📋 JSON Nusxa Olish</button>' +
          '<button id="ethWbSaveAllBtn" style="background:#10b981;color:#fff;border:none;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;">💾 Saqlash</button>' +
          '<button id="ethWbResetCoordsBtn" style="background:#64748b;color:#fff;border:none;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;">↺ Asliga qaytarish</button>' +
        '</div>' +
      '</div>';
    }

    // Pages Display Container
    h += '<div id="ethWbPagesWrap" style="display:flex;flex-direction:column;gap:24px;align-items:center;">';

    // Page 4 Container
    if (activePage === 4 || activePage === 0) {
      h += renderSinglePageBlock(4, p4Img, p4Inputs, isEditor);
    }

    // Page 5 Container
    if (activePage === 5 || activePage === 0) {
      h += renderSinglePageBlock(5, p5Img, p5Inputs, isEditor);
    }

    h += '</div>';

    // Bottom Sticky Action Bar (Check Answers, Reset, Score)
    h += '<div style="position:sticky;bottom:16px;z-index:90;margin-top:20px;background:rgba(15,23,42,0.92);backdrop-filter:blur(12px);border:1px solid rgba(56,189,248,0.4);border-radius:18px;padding:12px 22px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;box-shadow:0 14px 40px rgba(0,0,0,0.5);color:#fff;">' +
      '<div style="display:flex;align-items:center;gap:14px;">' +
        '<div id="ethWbScoreDisplay" style="font-size:14px;font-weight:800;display:inline-flex;align-items:center;gap:6px;">' +
          '<span>Javoblar: <b id="ethWbAnsweredCount" style="color:#38bdf8;">0</b> / <span id="ethWbTotalCount">0</span></span>' +
        '</div>' +
        '<div id="ethWbResultPill" style="display:none;font-size:13px;font-weight:800;padding:4px 12px;border-radius:20px;background:rgba(16,185,129,0.2);color:#34d399;border:1px solid rgba(52,211,153,0.4);"></div>' +
      '</div>' +

      '<div style="display:flex;align-items:center;gap:10px;">' +
        '<button id="ethWbResetBtn" style="background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.2);padding:9px 18px;border-radius:12px;font-size:13px;font-weight:800;cursor:pointer;">' +
          '↻ Tozalash' +
        '</button>' +
        '<button id="ethWbCheckBtn" style="background:linear-gradient(135deg,#0284c7,#154b89);color:#fff;border:none;padding:10px 24px;border-radius:12px;font-size:14px;font-weight:900;cursor:pointer;box-shadow:0 6px 20px rgba(2,132,199,0.4);">' +
          '✓ Tekshirish (Check Answers)' +
        '</button>' +
      '</div>' +
    '</div>';

    // Interactive Edit/Add Modal Container
    h += '<div id="ethWbInputModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;align-items:center;justify-content:center;backdrop-filter:blur(4px);">' +
      '<div style="background:var(--card);border:2px solid #38bdf8;border-radius:18px;padding:22px;max-width:440px;width:90%;color:var(--text);box-shadow:0 20px 50px rgba(0,0,0,0.5);">' +
        '<h3 id="ethWbModalTitle" style="font-size:17px;font-weight:900;margin:0 0 14px;color:#0284c7;">Katakcha Sozlamalari</h3>' +
        '<div style="margin-bottom:12px;">' +
          '<label style="display:block;font-size:12px;font-weight:800;margin-bottom:4px;color:var(--muted);">Mashq Belgisi / Raqami:</label>' +
          '<input type="text" id="ethWbModalLabel" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--line);background:var(--soft);color:var(--text);font-weight:700;" placeholder="masalan: 2 yoki 3.1" />' +
        '</div>' +
        '<div style="margin-bottom:14px;">' +
          '<label style="display:block;font-size:12px;font-weight:800;margin-bottom:4px;color:var(--muted);">To‘g‘ri Javob(lar) ("or" bilan ajrating):</label>' +
          '<input type="text" id="ethWbModalCorrect" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--line);background:var(--soft);color:var(--text);font-weight:700;" placeholder="masalan: access yoki time or TIME" />' +
          '<small style="font-size:11px;color:var(--muted);display:block;margin-top:4px;">Bir nechta variant bo‘lsa, " or " bilan yozing (masalan: has or HAS or \'s).</small>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;gap:8px;">' +
          '<button id="ethWbModalDeleteBtn" style="background:#ef4444;color:#fff;border:none;padding:8px 14px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;">O‘chirish</button>' +
          '<div style="display:flex;gap:8px;">' +
            '<button id="ethWbModalCancelBtn" style="background:var(--soft);color:var(--text);border:1px solid var(--line);padding:8px 14px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;">Bekor qilish</button>' +
            '<button id="ethWbModalSaveBtn" style="background:#0284c7;color:#fff;border:none;padding:8px 18px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;">Saqlash</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

    h += '</div>';
    container.innerHTML = h;

    // Attach Interactivity & Event Handlers
    attachViewerHandlers(container, activePage, isEditor);
  }

  // Render a single page with its overlay inputs
  function renderSinglePageBlock(pageNum, imgSrc, inputs, isEditor) {
    var h = '<div class="eth-wb-page-box" data-page="' + pageNum + '" style="position:relative;width:100%;max-width:920px;margin:0 auto;box-shadow:0 10px 40px rgba(0,0,0,0.2);border-radius:14px;overflow:hidden;background:#fff;border:1px solid var(--line);">' +
      // Book Image
      '<img src="' + imgSrc + '" class="eth-wb-img" data-page="' + pageNum + '" style="width:100%;height:auto;display:block;user-select:none;pointer-events:' + (isEditor ? 'none' : 'auto') + ';" alt="Oxford Navigate B1+ Page ' + pageNum + '" />' +

      // Overlays Container
      '<div class="eth-wb-overlay-layer" data-page="' + pageNum + '" style="position:absolute;inset:0;width:100%;height:100%;' + (isEditor ? 'cursor:crosshair;' : '') + '">';

    inputs.forEach(function(item) {
      h += '<div class="eth-wb-input-wrap" data-id="' + item.id + '" data-page="' + pageNum + '" style="position:absolute;top:' + item.top + '%;left:' + item.left + '%;width:' + item.width + '%;height:' + item.height + '%;z-index:' + (isEditor ? '50' : '10') + ';">' +
        '<input type="text" ' +
          'class="eth-wb-input" ' +
          'data-id="' + item.id + '" ' +
          'data-page="' + pageNum + '" ' +
          'data-correct="' + (item.correct || '').replace(/"/g, '&quot;') + '" ' +
          (isEditor ? 'disabled ' : '') +
          'style="width:100%;height:100%;box-sizing:border-box;background:transparent;border:1.5px dashed ' + (isEditor ? '#0284c7' : 'rgba(56,189,248,0.55)') + ';border-radius:4px;font-family:inherit;font-size:13.5px;font-weight:700;color:#0f172a;padding:1px 6px;outline:none;' + (isEditor ? 'pointer-events:none;' : '') + '" ' +
          'placeholder="' + (item.label ? item.label : '...') + '" autocomplete="off" spellcheck="false" />' +
        '<div class="eth-wb-hint-badge" style="display:none;position:absolute;top:100%;left:0;background:#1e293b;color:#38bdf8;font-size:11px;font-weight:800;padding:2px 8px;border-radius:4px;white-space:nowrap;z-index:90;box-shadow:0 4px 12px rgba(0,0,0,0.3);margin-top:3px;pointer-events:none;"></div>';

      if (isEditor) {
        h += '<div class="eth-wb-edit-handle" data-id="' + item.id + '" style="position:absolute;inset:0;background:rgba(2,132,199,0.18);border:1.5px solid #0284c7;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#0284c7;font-size:11px;font-weight:900;">' +
          (item.label || item.id) +
        '</div>';
      }

      h += '</div>';
    });

    // Editor Drawing Box
    if (isEditor) {
      h += '<div class="eth-wb-drag-box" style="display:none;position:absolute;border:2px dashed #ef4444;background:rgba(239,68,68,0.2);pointer-events:none;z-index:100;"></div>';
    }

    h += '</div></div>';
    return h;
  }

  // Event Handlers for Page Switching, Answering, Checking, and Visual Editor
  function attachViewerHandlers(container, activePage, isEditor) {
    // Back Button
    var backBtn = container.querySelector('#ethWbBackBtn');
    if (backBtn) {
      backBtn.addEventListener('click', function() {
        if (window.go) window.go('intermediate');
      });
    }

    // Page Tab Buttons
    container.querySelectorAll('.eth-wb-page-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        var p = parseInt(this.getAttribute('data-page'), 10);
        renderLesson1_1(container, p);
      });
    });

    // Toggle Visual Editor
    var toggleBtn = container.querySelector('#ethWbToggleEditor');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function() {
        window._ethithWbEditorMode = !window._ethithWbEditorMode;
        renderLesson1_1(container, activePage);
      });
    }

    // Update Answered Count
    function updateCount() {
      var inputs = container.querySelectorAll('.eth-wb-input');
      var total = inputs.length;
      var filled = 0;
      inputs.forEach(function(inp) {
        if (inp.value && inp.value.trim().length > 0) filled++;
      });
      var aEl = container.querySelector('#ethWbAnsweredCount');
      var tEl = container.querySelector('#ethWbTotalCount');
      if (aEl) aEl.textContent = filled;
      if (tEl) tEl.textContent = total;
    }
    updateCount();

    container.querySelectorAll('.eth-wb-input').forEach(function(inp) {
      inp.addEventListener('input', function() {
        this.classList.remove('correct', 'incorrect');
        this.style.borderColor = '';
        this.style.background = '';
        var wrap = this.closest('.eth-wb-input-wrap');
        if (wrap) {
          var hint = wrap.querySelector('.eth-wb-hint-badge');
          if (hint) hint.style.display = 'none';
        }
        updateCount();
      });

      // Typing Focus Styling
      inp.addEventListener('focus', function() {
        this.style.background = 'rgba(15, 23, 42, 0.92)';
        this.style.color = '#38bdf8';
        this.style.borderColor = '#38bdf8';
      });
      inp.addEventListener('blur', function() {
        if (!this.classList.contains('correct') && !this.classList.contains('incorrect')) {
          this.style.background = 'transparent';
          this.style.color = '#0f172a';
          this.style.borderColor = 'rgba(56,189,248,0.55)';
        }
      });
    });

    // Check Answers Button
    var checkBtn = container.querySelector('#ethWbCheckBtn');
    if (checkBtn) {
      checkBtn.addEventListener('click', function() {
        var inputs = container.querySelectorAll('.eth-wb-input');
        var correctCount = 0;
        var total = inputs.length;

        inputs.forEach(function(inp) {
          var userVal = inp.value || '';
          var correctRaw = inp.getAttribute('data-correct') || '';
          var isCorrect = WB.checkAnswer(userVal, correctRaw);
          var wrap = inp.closest('.eth-wb-input-wrap');
          var hint = wrap ? wrap.querySelector('.eth-wb-hint-badge') : null;

          if (isCorrect) {
            correctCount++;
            inp.classList.add('correct');
            inp.classList.remove('incorrect');
            inp.style.borderColor = '#10b981';
            inp.style.background = 'rgba(16, 185, 129, 0.22)';
            inp.style.color = '#047857';
            if (hint) hint.style.display = 'none';
          } else {
            inp.classList.add('incorrect');
            inp.classList.remove('correct');
            inp.style.borderColor = '#ef4444';
            inp.style.background = 'rgba(239, 68, 68, 0.22)';
            inp.style.color = '#b91c1c';

            // Show correct answer hint
            if (hint) {
              var displayAns = correctRaw.split(/\s+or\s+/i)[0] || correctRaw;
              hint.textContent = '✓ ' + displayAns;
              hint.style.display = 'block';
            }
          }
        });

        // Show Score Pill
        var pct = Math.round((correctCount / (total || 1)) * 100);
        var pill = container.querySelector('#ethWbResultPill');
        if (pill) {
          pill.style.display = 'inline-block';
          pill.innerHTML = 'Natija: <b>' + correctCount + ' / ' + total + ' (' + pct + '%)</b>';
          if (pct >= 80) {
            pill.style.background = 'rgba(16,185,129,0.2)';
            pill.style.color = '#34d399';
            pill.style.borderColor = 'rgba(52,211,153,0.4)';
          } else {
            pill.style.background = 'rgba(245,158,11,0.2)';
            pill.style.color = '#fbbf24';
            pill.style.borderColor = 'rgba(251,191,36,0.4)';
          }
        }

        // Award ETHITH Coins on good performance
        if (pct >= 70 && window.EthithApp && window.EthithApp.state && window.EthithApp.state.user) {
          var coinsToAdd = Math.round(correctCount * 3);
          window.EthithApp.state.user.coins = (window.EthithApp.state.user.coins || 0) + coinsToAdd;
          if (window.EthithSync && window.EthithSync.syncUser) window.EthithSync.syncUser(window.EthithApp.state.user);
          if (window.toast) window.toast('Ajoyib natija! +' + coinsToAdd + ' ETHITH Coins qo‘shildi!');
        }
      });
    }

    // Reset Button
    var resetBtn = container.querySelector('#ethWbResetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        container.querySelectorAll('.eth-wb-input').forEach(function(inp) {
          inp.value = '';
          inp.classList.remove('correct', 'incorrect');
          inp.style.background = 'transparent';
          inp.style.color = '#0f172a';
          inp.style.borderColor = 'rgba(56,189,248,0.55)';
          var wrap = inp.closest('.eth-wb-input-wrap');
          if (wrap) {
            var hint = wrap.querySelector('.eth-wb-hint-badge');
            if (hint) hint.style.display = 'none';
          }
        });
        var pill = container.querySelector('#ethWbResultPill');
        if (pill) pill.style.display = 'none';
        updateCount();
      });
    }

    // Visual Editor Functionality (Click to edit, Drag to create new box)
    if (isEditor) {
      setupVisualEditor(container, activePage);
    }
  }

  // Setup Visual Editor Dragging & Editing
  function setupVisualEditor(container, activePage) {
    var modal = container.querySelector('#ethWbInputModal');
    var modalTitle = container.querySelector('#ethWbModalTitle');
    var modalLabel = container.querySelector('#ethWbModalLabel');
    var modalCorrect = container.querySelector('#ethWbModalCorrect');
    var modalSave = container.querySelector('#ethWbModalSaveBtn');
    var modalCancel = container.querySelector('#ethWbModalCancelBtn');
    var modalDelete = container.querySelector('#ethWbModalDeleteBtn');

    var currentTarget = null; // { isNew: bool, page: num, data: {...} }

    function openModal(isNew, pageNum, item) {
      currentTarget = { isNew: isNew, page: pageNum, item: item };
      modalTitle.textContent = isNew ? 'Yangi Katakcha Qo‘shish' : 'Katakchani Tahrirlash (' + item.id + ')';
      modalLabel.value = item.label || '';
      modalCorrect.value = item.correct || '';
      modalDelete.style.display = isNew ? 'none' : 'block';
      modal.style.display = 'flex';
    }

    function closeModal() {
      modal.style.display = 'none';
      currentTarget = null;
    }

    if (modalCancel) modalCancel.addEventListener('click', closeModal);

    // Save Modal
    if (modalSave) {
      modalSave.addEventListener('click', function() {
        if (!currentTarget) return;
        var page = currentTarget.page;
        var inputs = WB.getPageInputs(page);

        if (currentTarget.isNew) {
          var newItem = currentTarget.item;
          newItem.id = 'p' + page + '_custom_' + Date.now().toString().slice(-5);
          newItem.label = modalLabel.value.trim() || 'New';
          newItem.correct = modalCorrect.value.trim() || '';
          inputs.push(newItem);
        } else {
          var exist = inputs.find(function(x) { return x.id === currentTarget.item.id; });
          if (exist) {
            exist.label = modalLabel.value.trim();
            exist.correct = modalCorrect.value.trim();
          }
        }

        WB.savePageInputs(page, inputs);
        closeModal();
        renderLesson1_1(container, activePage);
      });
    }

    // Delete Modal
    if (modalDelete) {
      modalDelete.addEventListener('click', function() {
        if (!currentTarget || currentTarget.isNew) return;
        var page = currentTarget.page;
        var inputs = WB.getPageInputs(page).filter(function(x) { return x.id !== currentTarget.item.id; });
        WB.savePageInputs(page, inputs);
        closeModal();
        renderLesson1_1(container, activePage);
      });
    }

    // Existing handles click to edit
    container.querySelectorAll('.eth-wb-edit-handle').forEach(function(handle) {
      handle.addEventListener('click', function(e) {
        e.stopPropagation();
        var id = this.getAttribute('data-id');
        var wrap = this.closest('.eth-wb-input-wrap');
        var page = parseInt(wrap.getAttribute('data-page'), 10);
        var inputs = WB.getPageInputs(page);
        var item = inputs.find(function(x) { return x.id === id; });
        if (item) openModal(false, page, item);
      });
    });

    // Drag-to-Draw New Box on Page
    container.querySelectorAll('.eth-wb-overlay-layer').forEach(function(layer) {
      var page = parseInt(layer.getAttribute('data-page'), 10);
      var dragBox = layer.querySelector('.eth-wb-drag-box');
      var isDrawing = false;
      var startX = 0, startY = 0;
      var rect = null;

      layer.addEventListener('mousedown', function(e) {
        if (e.target.classList.contains('eth-wb-edit-handle')) return;
        isDrawing = true;
        rect = layer.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        if (dragBox) {
          dragBox.style.left = startX + 'px';
          dragBox.style.top = startY + 'px';
          dragBox.style.width = '0px';
          dragBox.style.height = '0px';
          dragBox.style.display = 'block';
        }
      });

      window.addEventListener('mousemove', function(e) {
        if (!isDrawing || !rect || !dragBox) return;
        var curX = e.clientX - rect.left;
        var curY = e.clientY - rect.top;
        var left = Math.min(startX, curX);
        var top = Math.min(startY, curY);
        var width = Math.abs(curX - startX);
        var height = Math.abs(curY - startY);

        dragBox.style.left = left + 'px';
        dragBox.style.top = top + 'px';
        dragBox.style.width = width + 'px';
        dragBox.style.height = height + 'px';
      });

      window.addEventListener('mouseup', function(e) {
        if (!isDrawing) return;
        isDrawing = false;
        if (dragBox) dragBox.style.display = 'none';

        if (!rect) return;
        var endX = e.clientX - rect.left;
        var endY = e.clientY - rect.top;
        var wPx = Math.abs(endX - startX);
        var hPx = Math.abs(endY - startY);

        // Only register if box is at least 15px by 10px
        if (wPx > 15 && hPx > 10) {
          var topPct = parseFloat(((Math.min(startY, endY) / rect.height) * 100).toFixed(1));
          var leftPct = parseFloat(((Math.min(startX, endX) / rect.width) * 100).toFixed(1));
          var widthPct = parseFloat(((wPx / rect.width) * 100).toFixed(1));
          var heightPct = parseFloat(((hPx / rect.height) * 100).toFixed(1));

          var newItem = {
            page: page,
            top: topPct,
            left: leftPct,
            width: widthPct,
            height: heightPct,
            correct: '',
            label: ''
          };
          openModal(true, page, newItem);
        }
        rect = null;
      });
    });

    // Toolbar Buttons (Export, Save, Reset)
    var exportBtn = container.querySelector('#ethWbExportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', function() {
        var all = {
          page4: WB.getPageInputs(4),
          page5: WB.getPageInputs(5)
        };
        var jsonStr = JSON.stringify(all, null, 2);
        navigator.clipboard.writeText(jsonStr).then(function() {
          alert('Unit 1.1 koordinatalari buferga (clipboard) nusxa olindi!');
        }).catch(function() {
          prompt('Koordinatalar JSON kodi:', jsonStr);
        });
      });
    }

    var saveBtn = container.querySelector('#ethWbSaveAllBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        alert('Koordinatalar muvaffaqiyatli saqlandi!');
      });
    }

    var resetCoordsBtn = container.querySelector('#ethWbResetCoordsBtn');
    if (resetCoordsBtn) {
      resetCoordsBtn.addEventListener('click', function() {
        if (confirm('Barcha koordinatalarni asl holatiga qaytarishni xohlaysizmi?')) {
          WB.resetPageInputs(4);
          WB.resetPageInputs(5);
          renderLesson1_1(container, activePage);
        }
      });
    }
  }

})(window);
