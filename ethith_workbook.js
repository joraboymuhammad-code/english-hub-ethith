/**
 * ETHITH OXFORD NAVIGATE INTERMEDIATE (B1+) DIGITAL WORKBOOK
 * Authentic OUP Navigate Intermediate (B1+) Material
 * High-performance, lightweight image-overlay system with zero PDF lag.
 * Omits all listening exercises strictly per requirements.
 *
 * Rich Authentic Interaction Types:
 * 1. fill   - O'qib yoziladigan (Text inputs on printed lines)
 * 2. cross  - O'chiriladigan (Realistic pen strikethrough for incorrect words)
 * 3. choose - Belgilanadigan (Highlighting correct option in pairs)
 * 4. match  - Bog'lanadigan (Letter selector badges for matching questions to answers)
 * 5. insert - Chiziladigan / Joylashtiriladigan (Slash caret insertion between words)
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

  // 100% Calibrated Coordinates & Multi-Type Data for Unit 1.1 (Pages 4 and 5)
  // Listening exercises (4b, 7a, 7c, 7d) omitted strictly per requirements.
  WB.defaultInputs = {
    4: [
      // EXERCISE 1: Grammar · present simple, continuous & perfect (Lines 2 to 9) - TYPE: fill
      { id: "p4_ex1_2", type: "fill", page: 4, exercise: "1", label: "2", top: 61.2, left: 20.8, width: 22.0, height: 1.9, correct: "access or ACCESS" },
      { id: "p4_ex1_3", type: "fill", page: 4, exercise: "1", label: "3", top: 65.6, left: 12.0, width: 22.0, height: 1.9, correct: "is still changing or 's still changing" },
      { id: "p4_ex1_4", type: "fill", page: 4, exercise: "1", label: "4", top: 67.2, left: 28.5, width: 17.0, height: 1.9, correct: "check or CHECK" },
      { id: "p4_ex1_5", type: "fill", page: 4, exercise: "1", label: "5", top: 74.0, left: 13.5, width: 22.0, height: 1.9, correct: "is increasing or 's increasing" },
      { id: "p4_ex1_6", type: "fill", page: 4, exercise: "1", label: "6", top: 76.2, left: 24.5, width: 17.0, height: 1.9, correct: "have already uploaded or 've already uploaded" },
      { id: "p4_ex1_7", type: "fill", page: 4, exercise: "1", label: "7", top: 80.8, left: 19.5, width: 17.0, height: 1.9, correct: "is currently growing or 's currently growing" },
      { id: "p4_ex1_8", type: "fill", page: 4, exercise: "1", label: "8", top: 85.4, left: 19.5, width: 17.0, height: 1.9, correct: "has or HAS" },
      { id: "p4_ex1_9", type: "fill", page: 4, exercise: "1", label: "9", top: 91.5, left: 12.0, width: 17.0, height: 1.9, correct: "have just checked or 've just checked" },

      // EXERCISE 2: Cross out the incorrect word or phrase (Sentences 2 to 6) - TYPE: cross
      // Sentence 2: incorrect is "all the time"
      { id: "p4_ex2_2_a", type: "cross", page: 4, exercise: "2", group: "2.2", text: "this week", top: 31.6, left: 69.5, width: 6.8, height: 1.6, incorrect: false },
      { id: "p4_ex2_2_b", type: "cross", page: 4, exercise: "2", group: "2.2", text: "at the moment", top: 31.6, left: 78.0, width: 9.8, height: 1.6, incorrect: false },
      { id: "p4_ex2_2_c", type: "cross", page: 4, exercise: "2", group: "2.2", text: "all the time", top: 33.4, left: 56.4, width: 9.2, height: 1.6, incorrect: true },

      // Sentence 3: incorrect is "already"
      { id: "p4_ex2_3_a", type: "cross", page: 4, exercise: "2", group: "2.3", text: "already", top: 35.4, left: 59.8, width: 5.6, height: 1.6, incorrect: true },
      { id: "p4_ex2_3_b", type: "cross", page: 4, exercise: "2", group: "2.3", text: "always", top: 35.4, left: 66.2, width: 5.4, height: 1.6, incorrect: false },
      { id: "p4_ex2_3_c", type: "cross", page: 4, exercise: "2", group: "2.3", text: "usually", top: 35.4, left: 72.8, width: 5.6, height: 1.6, incorrect: false },

      // Sentence 4: incorrect is "at the moment"
      { id: "p4_ex2_4_a", type: "cross", page: 4, exercise: "2", group: "2.4", text: "for a long time", top: 39.2, left: 51.5, width: 11.2, height: 1.6, incorrect: false },
      { id: "p4_ex2_4_b", type: "cross", page: 4, exercise: "2", group: "2.4", text: "lately", top: 39.2, left: 64.5, width: 5.0, height: 1.6, incorrect: false },
      { id: "p4_ex2_4_c", type: "cross", page: 4, exercise: "2", group: "2.4", text: "at the moment", top: 41.0, left: 54.0, width: 6.8, height: 1.6, incorrect: true },

      // Sentence 5: incorrect is "now"
      { id: "p4_ex2_5_a", type: "cross", page: 4, exercise: "2", group: "2.5", text: "every week", top: 44.8, left: 54.0, width: 5.0, height: 1.6, incorrect: false },
      { id: "p4_ex2_5_b", type: "cross", page: 4, exercise: "2", group: "2.5", text: "now", top: 44.8, left: 60.5, width: 4.2, height: 1.6, incorrect: true },
      { id: "p4_ex2_5_c", type: "cross", page: 4, exercise: "2", group: "2.5", text: "all the time", top: 44.8, left: 66.0, width: 9.0, height: 1.6, incorrect: false },

      // Sentence 6: incorrect is "every time"
      { id: "p4_ex2_6_a", type: "cross", page: 4, exercise: "2", group: "2.6", text: "every time", top: 48.0, left: 54.0, width: 8.4, height: 1.6, incorrect: true },
      { id: "p4_ex2_6_b", type: "cross", page: 4, exercise: "2", group: "2.6", text: "these days", top: 48.0, left: 63.5, width: 8.4, height: 1.6, incorrect: false },
      { id: "p4_ex2_6_c", type: "cross", page: 4, exercise: "2", group: "2.6", text: "nowadays", top: 48.0, left: 72.8, width: 8.4, height: 1.6, incorrect: false },

      // EXERCISE 3: Choose correct options (LinkedIn card) - TYPE: choose
      // 2: is increasing / increases
      { id: "p4_ex3_2_a", type: "choose", page: 4, exercise: "3", group: "3.2", text: "is increasing", top: 68.6, left: 70.8, width: 9.6, height: 1.6, correct: true },
      { id: "p4_ex3_2_b", type: "choose", page: 4, exercise: "3", group: "3.2", text: "increases", top: 70.5, left: 54.2, width: 7.2, height: 1.6, correct: false },

      // 3: is having / has
      { id: "p4_ex3_3_a", type: "choose", page: 4, exercise: "3", group: "3.3", text: "is having", top: 72.3, left: 69.8, width: 7.2, height: 1.6, correct: false },
      { id: "p4_ex3_3_b", type: "choose", page: 4, exercise: "3", group: "3.3", text: "has", top: 72.3, left: 78.4, width: 3.8, height: 1.6, correct: true },

      // 4: have checked / check
      { id: "p4_ex3_4_a", type: "choose", page: 4, exercise: "3", group: "3.4", text: "have checked", top: 74.2, left: 76.5, width: 10.8, height: 1.6, correct: false },
      { id: "p4_ex3_4_b", type: "choose", page: 4, exercise: "3", group: "3.4", text: "check", top: 76.1, left: 54.2, width: 5.0, height: 1.6, correct: true },

      // 5: use / have used
      { id: "p4_ex3_5_a", type: "choose", page: 4, exercise: "3", group: "3.5", text: "use", top: 78.0, left: 74.2, width: 3.6, height: 1.6, correct: true },
      { id: "p4_ex3_5_b", type: "choose", page: 4, exercise: "3", group: "3.5", text: "have used", top: 78.0, left: 79.2, width: 8.8, height: 1.6, correct: false },

      // 6: already visited / has already visited
      { id: "p4_ex3_6_a", type: "choose", page: 4, exercise: "3", group: "3.6", text: "already visited", top: 85.4, left: 54.2, width: 6.8, height: 1.6, correct: false },
      { id: "p4_ex3_6_b", type: "choose", page: 4, exercise: "3", group: "3.6", text: "has already visited", top: 85.4, left: 63.8, width: 14.8, height: 1.6, correct: true },

      // 7: include / are including
      { id: "p4_ex3_7_a", type: "choose", page: 4, exercise: "3", group: "3.7", text: "include", top: 87.3, left: 67.2, width: 6.2, height: 1.6, correct: true },
      { id: "p4_ex3_7_b", type: "choose", page: 4, exercise: "3", group: "3.7", text: "are including", top: 87.3, left: 75.0, width: 10.2, height: 1.6, correct: false },

      // 8: are taking place / have taken place
      { id: "p4_ex3_8_a", type: "choose", page: 4, exercise: "3", group: "3.8", text: "are taking place", top: 91.0, left: 65.5, width: 13.5, height: 1.6, correct: true },
      { id: "p4_ex3_8_b", type: "choose", page: 4, exercise: "3", group: "3.8", text: "have taken place", top: 91.0, left: 80.5, width: 14.0, height: 1.6, correct: false }
    ],
    5: [
      // EXERCISE 4a: Match questions 1-6 to answers a-f - TYPE: match
      { id: "p5_ex4_1", type: "match", page: 5, exercise: "4a", label: "1", top: 13.5, left: 5.5, width: 2.4, height: 1.5, correct: "c", prompt: "Do you get on well with your neighbours?" },
      { id: "p5_ex4_2", type: "match", page: 5, exercise: "4a", label: "2", top: 15.3, left: 5.5, width: 2.4, height: 1.5, correct: "f", prompt: "Do you have a lot in common with your partner?" },
      { id: "p5_ex4_3", type: "match", page: 5, exercise: "4a", label: "3", top: 17.2, left: 5.5, width: 2.4, height: 1.5, correct: "a", prompt: "When was the last time you had an argument with your best friend?" },
      { id: "p5_ex4_4", type: "match", page: 5, exercise: "4a", label: "4", top: 19.0, left: 5.5, width: 2.4, height: 1.5, correct: "d", prompt: "How often do you meet up with your friends?" },
      { id: "p5_ex4_5", type: "match", page: 5, exercise: "4a", label: "5", top: 20.8, left: 5.5, width: 2.4, height: 1.5, correct: "e", prompt: "Do you make new friends easily?" },
      { id: "p5_ex4_6", type: "match", page: 5, exercise: "4a", label: "6", top: 22.7, left: 5.5, width: 2.4, height: 1.5, correct: "b", prompt: "How many old classmates do you keep in touch with?" },

      // EXERCISE 5: Slash Caret Insertion (Put word in brackets in correct place) - TYPE: insert
      // Sentence 2: helped me [out /] when
      { id: "p5_ex5_2", type: "insert", page: 5, exercise: "5", group: "5.2", word: "out", top: 46.5, left: 23.5, width: 2.0, height: 1.6, correct: true },
      // Sentence 3: get [on /] well
      { id: "p5_ex5_3", type: "insert", page: 5, exercise: "5", group: "5.3", word: "on", top: 48.6, left: 11.2, width: 2.0, height: 1.6, correct: true },
      // Sentence 4: getting [in /] touch
      { id: "p5_ex5_4", type: "insert", page: 5, exercise: "5", group: "5.4", word: "in", top: 50.8, left: 23.5, width: 2.0, height: 1.6, correct: true },
      // Sentence 5: met up [with /] people
      { id: "p5_ex5_5", type: "insert", page: 5, exercise: "5", group: "5.5", word: "with", top: 53.0, left: 14.5, width: 2.0, height: 1.6, correct: true },

      // EXERCISE 6: Complete opinions with have, help, keep, make, trust - TYPE: fill
      { id: "p5_ex6_2", type: "fill", page: 5, exercise: "6", label: "2", top: 64.6, left: 21.0, width: 10.0, height: 1.9, correct: "help or HELP" },
      { id: "p5_ex6_3", type: "fill", page: 5, exercise: "6", label: "3", top: 66.8, left: 13.0, width: 10.0, height: 1.9, correct: "trust or TRUST" },
      { id: "p5_ex6_4", type: "fill", page: 5, exercise: "6", label: "4", top: 73.5, left: 8.0, width: 10.0, height: 1.9, correct: "have or HAVE" },
      { id: "p5_ex6_5", type: "fill", page: 5, exercise: "6", label: "5", top: 74.5, left: 40.0, width: 10.0, height: 1.9, correct: "make or MAKE" },

      // EXERCISE 7b: Pronunciation rule (consonant / vowel) - TYPE: choose
      // Choice 1:
      { id: "p5_ex7_1_a", type: "choose", page: 5, exercise: "7b", group: "7.1", text: "consonant", top: 57.0, left: 63.8, width: 7.2, height: 1.6, correct: true },
      { id: "p5_ex7_1_b", type: "choose", page: 5, exercise: "7b", group: "7.1", text: "vowel", top: 57.0, left: 72.0, width: 5.4, height: 1.6, correct: false },
      // Choice 2:
      { id: "p5_ex7_2_a", type: "choose", page: 5, exercise: "7b", group: "7.2", text: "consonant", top: 59.0, left: 77.2, width: 7.2, height: 1.6, correct: false },
      { id: "p5_ex7_2_b", type: "choose", page: 5, exercise: "7b", group: "7.2", text: "vowel", top: 60.8, left: 53.6, width: 5.4, height: 1.6, correct: true }
    ]
  };

  // Get active inputs for a page (with custom saved overrides)
  WB.getPageInputs = function(page) {
    try {
      var saved = localStorage.getItem('ethith_wb_coords_v2_' + page);
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return WB.defaultInputs[page] || [];
  };

  WB.savePageInputs = function(page, inputs) {
    try {
      localStorage.setItem('ethith_wb_coords_v2_' + page, JSON.stringify(inputs));
    } catch(e) {}
  };

  WB.resetPageInputs = function(page) {
    try {
      localStorage.removeItem('ethith_wb_coords_v2_' + page);
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
      var pageNum = (arg && arg.page !== undefined) ? parseInt(arg.page, 10) : 4;
      renderLesson1_1(container, pageNum);
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
            '12 ta rasmiy Unitlar. Haqiqiy kitobdagi kabi turli xil interaktiv mashqlar: <b>o‘qib yozish</b>, <b>chizib o‘chirish</b>, <b>variant tanlash</b>, <b>bog‘lash</b> va <b>prepozitsiya kiritish</b>. <b style="color:#38bdf8;">(Listening mashqlari butunlay chiqarib tashlangan).</b>' +
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

    container.querySelectorAll('.eth-wb-lesson-row').forEach(function(row) {
      row.addEventListener('click', function() {
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
    if (activePage === undefined || activePage === null) {
      activePage = 4;
    } else {
      activePage = parseInt(activePage, 10);
      if (isNaN(activePage)) activePage = 4;
    }
    var isEditor = (window._ethithWbEditorMode === true);

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
            '<div style="font-size:11.5px;color:var(--muted);">Grammar (Present tenses) · Vocabulary (Friendship) · Pronunciation (Listening chiqarilgan)</div>' +
          '</div>' +
        '</div>' +

        // Controls
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
          '<span style="color:#38bdf8;">Visual Editor Faol:</span> Katakchalar ustiga bosib tahrirlang yoki rasm ustida to‘rtburchak tortib yangisini chizing.' +
        '</div>' +
        '<div style="display:flex;gap:8px;">' +
          '<button id="ethWbExportBtn" style="background:#0284c7;color:#fff;border:none;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;">📋 JSON Nusxa Olish</button>' +
          '<button id="ethWbSaveAllBtn" style="background:#10b981;color:#fff;border:none;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;">💾 Saqlash</button>' +
          '<button id="ethWbResetCoordsBtn" style="background:#64748b;color:#fff;border:none;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;">↺ Asliga qaytarish</button>' +
        '</div>' +
      '</div>';
    }

    // Interactive Instruction Badge
    h += '<div style="margin-bottom:14px;background:rgba(14,165,233,0.1);border:1px solid rgba(56,189,248,0.3);border-radius:12px;padding:10px 16px;display:flex;align-items:center;gap:12px;font-size:12.5px;color:var(--text);flex-wrap:wrap;">' +
      '<span style="font-weight:800;color:#0284c7;">🎯 Mashq usullari:</span>' +
      '<span>✍️ <b>Yozish:</b> bo‘sh chiziqqa bosing</span>' +
      '<span>✂️ <b>O‘chirish:</b> noto‘g‘ri so‘z ustiga bosing</span>' +
      '<span>🔘 <b>Tanlash:</b> to‘g‘ri variant ustiga bosing</span>' +
      '<span>🔗 <b>Bog‘lash:</b> harf katagiga bosing</span>' +
      '<span>📍 <b>Joylashtirish:</b> so‘zlar orasiga bosing</span>' +
    '</div>';

    // Pages Display Container
    h += '<div id="ethWbPagesWrap" style="display:flex;flex-direction:column;gap:24px;align-items:center;">';

    if (activePage === 4 || activePage === 0) {
      h += renderSinglePageBlock(4, p4Img, p4Inputs, isEditor);
    }
    if (activePage === 5 || activePage === 0) {
      h += renderSinglePageBlock(5, p5Img, p5Inputs, isEditor);
    }

    h += '</div>';

    // Bottom Sticky Action Bar
    h += '<div style="position:sticky;bottom:16px;z-index:90;margin-top:20px;background:rgba(15,23,42,0.92);backdrop-filter:blur(12px);border:1px solid rgba(56,189,248,0.4);border-radius:18px;padding:12px 22px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;box-shadow:0 14px 40px rgba(0,0,0,0.5);color:#fff;">' +
      '<div style="display:flex;align-items:center;gap:14px;">' +
        '<div id="ethWbScoreDisplay" style="font-size:14px;font-weight:800;display:inline-flex;align-items:center;gap:6px;">' +
          '<span>Bajarildi: <b id="ethWbAnsweredCount" style="color:#38bdf8;">0</b> / <span id="ethWbTotalCount">0</span></span>' +
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

    // Interactive Edit Modal for Teachers
    h += '<div id="ethWbInputModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;align-items:center;justify-content:center;backdrop-filter:blur(4px);">' +
      '<div style="background:var(--card);border:2px solid #38bdf8;border-radius:18px;padding:22px;max-width:440px;width:90%;color:var(--text);box-shadow:0 20px 50px rgba(0,0,0,0.5);">' +
        '<h3 id="ethWbModalTitle" style="font-size:17px;font-weight:900;margin:0 0 14px;color:#0284c7;">Katakcha Sozlamalari</h3>' +
        '<div style="margin-bottom:12px;">' +
          '<label style="display:block;font-size:12px;font-weight:800;margin-bottom:4px;color:var(--muted);">Turi (type):</label>' +
          '<select id="ethWbModalType" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--line);background:var(--soft);color:var(--text);font-weight:700;">' +
            '<option value="fill">Fill (O‘qib yozish)</option>' +
            '<option value="cross">Cross (Chizib o‘chirish)</option>' +
            '<option value="choose">Choose (Variant tanlash)</option>' +
            '<option value="match">Match (Harf bilan bog‘lash)</option>' +
            '<option value="insert">Insert (Prepozitsiya kiritish)</option>' +
          '</select>' +
        '</div>' +
        '<div style="margin-bottom:12px;">' +
          '<label style="display:block;font-size:12px;font-weight:800;margin-bottom:4px;color:var(--muted);">Guruh / Belgisi:</label>' +
          '<input type="text" id="ethWbModalLabel" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--line);background:var(--soft);color:var(--text);font-weight:700;" placeholder="masalan: 2 yoki 3.1" />' +
        '</div>' +
        '<div style="margin-bottom:14px;">' +
          '<label style="display:block;font-size:12px;font-weight:800;margin-bottom:4px;color:var(--muted);">To‘g‘ri Javob ("or" bilan ajrating):</label>' +
          '<input type="text" id="ethWbModalCorrect" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--line);background:var(--soft);color:var(--text);font-weight:700;" placeholder="masalan: access yoki time or TIME" />' +
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

    attachViewerHandlers(container, activePage, isEditor);
  }

  // Render a single page with multi-type interactive elements
  function renderSinglePageBlock(pageNum, imgSrc, inputs, isEditor) {
    var h = '<div class="eth-wb-page-box" data-page="' + pageNum + '" style="position:relative;width:100%;max-width:920px;margin:0 auto;box-shadow:0 10px 40px rgba(0,0,0,0.2);border-radius:14px;overflow:hidden;background:#fff;border:1px solid var(--line);">' +
      '<img src="' + imgSrc + '" class="eth-wb-img" data-page="' + pageNum + '" style="width:100%;height:auto;display:block;user-select:none;pointer-events:' + (isEditor ? 'none' : 'auto') + ';" alt="Oxford Navigate B1+ Page ' + pageNum + '" />' +
      '<div class="eth-wb-overlay-layer" data-page="' + pageNum + '" style="position:absolute;inset:0;width:100%;height:100%;' + (isEditor ? 'cursor:crosshair;' : '') + '">';

    inputs.forEach(function(item) {
      var itemType = item.type || 'fill';
      var zIndex = isEditor ? '50' : '10';

      h += '<div class="eth-wb-item-wrap" data-id="' + item.id + '" data-page="' + pageNum + '" data-type="' + itemType + '" data-group="' + (item.group || '') + '" ' +
        'style="position:absolute;top:' + item.top + '%;left:' + item.left + '%;width:' + item.width + '%;height:' + item.height + '%;z-index:' + zIndex + ';">';

      if (itemType === 'fill') {
        h += '<input type="text" ' +
          'class="eth-wb-input wb-fill-input" ' +
          'data-id="' + item.id + '" ' +
          'data-page="' + pageNum + '" ' +
          'data-type="fill" ' +
          'data-correct="' + (item.correct || '').replace(/"/g, '&quot;') + '" ' +
          (isEditor ? 'disabled ' : '') +
          'style="width:100%;height:100%;' + (isEditor ? 'pointer-events:none;' : '') + '" ' +
          'placeholder="' + (item.label ? item.label : '...') + '" autocomplete="off" spellcheck="false" />' +
          '<div class="eth-wb-hint-badge" style="display:none;position:absolute;top:100%;left:0;background:#1e293b;color:#38bdf8;font-size:11px;font-weight:800;padding:2px 8px;border-radius:4px;white-space:nowrap;z-index:90;box-shadow:0 4px 12px rgba(0,0,0,0.3);margin-top:3px;pointer-events:none;"></div>';
      } else if (itemType === 'cross') {
        h += '<div class="wb-cross-chip" ' +
          'data-id="' + item.id + '" ' +
          'data-page="' + pageNum + '" ' +
          'data-type="cross" ' +
          'data-group="' + (item.group || '') + '" ' +
          'data-incorrect="' + (item.incorrect === true ? 'true' : 'false') + '" ' +
          'data-text="' + (item.text || '').replace(/"/g, '&quot;') + '" ' +
          'style="width:100%;height:100%;' + (isEditor ? 'pointer-events:none;' : '') + '" ' +
          'title="O‘chirish uchun bosing: ' + (item.text || '') + '"></div>' +
          '<div class="eth-wb-hint-badge" style="display:none;position:absolute;top:100%;left:0;background:#1e293b;color:#38bdf8;font-size:11px;font-weight:800;padding:2px 8px;border-radius:4px;white-space:nowrap;z-index:90;box-shadow:0 4px 12px rgba(0,0,0,0.3);margin-top:3px;pointer-events:none;"></div>';
      } else if (itemType === 'choose') {
        h += '<div class="wb-choose-chip" ' +
          'data-id="' + item.id + '" ' +
          'data-page="' + pageNum + '" ' +
          'data-type="choose" ' +
          'data-group="' + (item.group || '') + '" ' +
          'data-correct="' + (item.correct === true ? 'true' : 'false') + '" ' +
          'data-text="' + (item.text || '').replace(/"/g, '&quot;') + '" ' +
          'style="width:100%;height:100%;' + (isEditor ? 'pointer-events:none;' : '') + '" ' +
          'title="Tanlash uchun bosing: ' + (item.text || '') + '"></div>' +
          '<div class="eth-wb-hint-badge" style="display:none;position:absolute;top:100%;left:0;background:#1e293b;color:#38bdf8;font-size:11px;font-weight:800;padding:2px 8px;border-radius:4px;white-space:nowrap;z-index:90;box-shadow:0 4px 12px rgba(0,0,0,0.3);margin-top:3px;pointer-events:none;"></div>';
      } else if (itemType === 'match') {
        h += '<div class="wb-match-slot" ' +
          'data-id="' + item.id + '" ' +
          'data-page="' + pageNum + '" ' +
          'data-type="match" ' +
          'data-correct="' + (item.correct || '') + '" ' +
          'style="width:100%;height:100%;' + (isEditor ? 'pointer-events:none;' : '') + '" ' +
          'title="Javob harfini tanlang (a-f)">?</div>' +
          '<div class="eth-wb-hint-badge" style="display:none;position:absolute;top:100%;left:0;background:#1e293b;color:#38bdf8;font-size:11px;font-weight:800;padding:2px 8px;border-radius:4px;white-space:nowrap;z-index:90;box-shadow:0 4px 12px rgba(0,0,0,0.3);margin-top:3px;pointer-events:none;"></div>';
      } else if (itemType === 'insert') {
        h += '<div class="wb-insert-slot" ' +
          'data-id="' + item.id + '" ' +
          'data-page="' + pageNum + '" ' +
          'data-type="insert" ' +
          'data-group="' + (item.group || '') + '" ' +
          'data-word="' + (item.word || '') + '" ' +
          'data-correct="' + (item.correct === true ? 'true' : 'false') + '" ' +
          'style="width:100%;height:100%;' + (isEditor ? 'pointer-events:none;' : '') + '" ' +
          'title="So‘zni shu yerga joylashtirish">' +
            '<span class="wb-insert-text">' + (item.word || '') + '</span>' +
          '</div>' +
          '<div class="eth-wb-hint-badge" style="display:none;position:absolute;top:100%;left:0;background:#1e293b;color:#38bdf8;font-size:11px;font-weight:800;padding:2px 8px;border-radius:4px;white-space:nowrap;z-index:90;box-shadow:0 4px 12px rgba(0,0,0,0.3);margin-top:3px;pointer-events:none;"></div>';
      }

      if (isEditor) {
        h += '<div class="eth-wb-edit-handle" data-id="' + item.id + '" style="position:absolute;inset:0;background:rgba(2,132,199,0.2);border:1.5px solid #0284c7;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#0284c7;font-size:10px;font-weight:900;">' +
          (item.label || item.id) +
        '</div>';
      }

      h += '</div>';
    });

    if (isEditor) {
      h += '<div class="eth-wb-drag-box" style="display:none;position:absolute;border:2px dashed #ef4444;background:rgba(239,68,68,0.2);pointer-events:none;z-index:100;"></div>';
    }

    h += '</div></div>';
    return h;
  }

  // Attach All Multi-Type Event Handlers
  function attachViewerHandlers(container, activePage, isEditor) {
    var backBtn = container.querySelector('#ethWbBackBtn');
    if (backBtn) {
      backBtn.addEventListener('click', function() {
        if (window.go) window.go('intermediate');
      });
    }

    container.querySelectorAll('.eth-wb-page-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        var p = parseInt(this.getAttribute('data-page'), 10);
        renderLesson1_1(container, p);
      });
    });

    var toggleBtn = container.querySelector('#ethWbToggleEditor');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function() {
        window._ethithWbEditorMode = !window._ethithWbEditorMode;
        renderLesson1_1(container, activePage);
      });
    }

    // Dynamic Counter for Answered Questions
    function updateCount() {
      // Distinct questions:
      // Fill inputs: 12
      // Cross groups: 5
      // Choose groups: 9
      // Match slots: 6
      // Insert slots: 4
      var total = 36;
      var filled = 0;

      // 1. Fill inputs with text
      container.querySelectorAll('.wb-fill-input').forEach(function(inp) {
        if (inp.value && inp.value.trim().length > 0) filled++;
      });

      // 2. Cross groups with at least one crossed
      var crossGroups = {};
      container.querySelectorAll('.wb-cross-chip.crossed').forEach(function(chip) {
        var grp = chip.getAttribute('data-group');
        if (grp) crossGroups[grp] = true;
      });
      filled += Object.keys(crossGroups).length;

      // 3. Choose groups with a selected chip
      var chooseGroups = {};
      container.querySelectorAll('.wb-choose-chip.selected').forEach(function(chip) {
        var grp = chip.getAttribute('data-group');
        if (grp) chooseGroups[grp] = true;
      });
      filled += Object.keys(chooseGroups).length;

      // 4. Match slots with an answered letter
      container.querySelectorAll('.wb-match-slot').forEach(function(slot) {
        if (slot.textContent && slot.textContent !== '?') filled++;
      });

      // 5. Insert slots with inserted active
      container.querySelectorAll('.wb-insert-slot.inserted').forEach(function() {
        filled++;
      });

      var aEl = container.querySelector('#ethWbAnsweredCount');
      var tEl = container.querySelector('#ethWbTotalCount');
      if (aEl) aEl.textContent = filled;
      if (tEl) tEl.textContent = total;
    }
    updateCount();

    // 1. Fill Inputs Interaction
    container.querySelectorAll('.wb-fill-input').forEach(function(inp) {
      inp.addEventListener('input', function() {
        this.classList.remove('correct', 'incorrect');
        var wrap = this.closest('.eth-wb-item-wrap');
        if (wrap) {
          var hint = wrap.querySelector('.eth-wb-hint-badge');
          if (hint) hint.style.display = 'none';
        }
        updateCount();
      });
    });

    // 2. Cross-out Chips Interaction (Click to strike through)
    container.querySelectorAll('.wb-cross-chip').forEach(function(chip) {
      chip.addEventListener('click', function(e) {
        if (isEditor) return;
        e.stopPropagation();
        this.classList.toggle('crossed');
        this.classList.remove('correct', 'incorrect', 'should-cross');
        var wrap = this.closest('.eth-wb-item-wrap');
        if (wrap) {
          var hint = wrap.querySelector('.eth-wb-hint-badge');
          if (hint) hint.style.display = 'none';
        }
        updateCount();
      });
    });

    // 3. Choose Chips Interaction (Click to select option in pair)
    container.querySelectorAll('.wb-choose-chip').forEach(function(chip) {
      chip.addEventListener('click', function(e) {
        if (isEditor) return;
        e.stopPropagation();
        var grp = this.getAttribute('data-group');
        var wasSelected = this.classList.contains('selected');

        // Deselect sibling chips in same group
        if (grp) {
          container.querySelectorAll('.wb-choose-chip[data-group="' + grp + '"]').forEach(function(c) {
            c.classList.remove('selected', 'correct', 'incorrect', 'should-choose');
            var wrap = c.closest('.eth-wb-item-wrap');
            if (wrap) {
              var hint = wrap.querySelector('.eth-wb-hint-badge');
              if (hint) hint.style.display = 'none';
            }
          });
        }

        if (!wasSelected) {
          this.classList.add('selected');
        }
        updateCount();
      });
    });

    // 4. Match Slot Interaction (Click to open letter picker)
    var activePopover = null;
    function closePopover() {
      if (activePopover && activePopover.parentNode) {
        activePopover.parentNode.removeChild(activePopover);
      }
      activePopover = null;
    }
    document.addEventListener('click', closePopover);

    container.querySelectorAll('.wb-match-slot').forEach(function(slot) {
      slot.addEventListener('click', function(e) {
        if (isEditor) return;
        e.stopPropagation();
        closePopover();

        var pop = document.createElement('div');
        pop.className = 'wb-letter-popover';
        var letters = ['a', 'b', 'c', 'd', 'e', 'f'];

        letters.forEach(function(l) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'wb-letter-btn';
          btn.textContent = l;
          btn.addEventListener('click', function(ev) {
            ev.stopPropagation();
            slot.textContent = l;
            slot.classList.remove('correct', 'incorrect');
            closePopover();
            updateCount();
          });
          pop.appendChild(btn);
        });

        // Clear option
        var clr = document.createElement('button');
        clr.type = 'button';
        clr.className = 'wb-letter-btn';
        clr.textContent = '✕';
        clr.style.color = '#ef4444';
        clr.addEventListener('click', function(ev) {
          ev.stopPropagation();
          slot.textContent = '?';
          slot.classList.remove('correct', 'incorrect');
          closePopover();
          updateCount();
        });
        pop.appendChild(clr);

        slot.parentNode.appendChild(pop);
        activePopover = pop;
      });
    });

    // 5. Insert Slot Interaction (Click to place slash and insert bracketed word)
    container.querySelectorAll('.wb-insert-slot').forEach(function(slot) {
      slot.addEventListener('click', function(e) {
        if (isEditor) return;
        e.stopPropagation();
        this.classList.toggle('inserted');
        this.classList.remove('correct', 'incorrect');
        updateCount();
      });
    });

    // Check Answers Button Logic
    var checkBtn = container.querySelector('#ethWbCheckBtn');
    if (checkBtn) {
      checkBtn.addEventListener('click', function() {
        var correctCount = 0;
        var totalQuestions = 36;

        // 1. Check Fill Inputs (12 items)
        container.querySelectorAll('.wb-fill-input').forEach(function(inp) {
          var userVal = inp.value || '';
          var correctRaw = inp.getAttribute('data-correct') || '';
          var isCorrect = WB.checkAnswer(userVal, correctRaw);
          var wrap = inp.closest('.eth-wb-item-wrap');
          var hint = wrap ? wrap.querySelector('.eth-wb-hint-badge') : null;

          if (isCorrect) {
            correctCount++;
            inp.classList.add('correct');
            inp.classList.remove('incorrect');
            if (hint) hint.style.display = 'none';
          } else {
            inp.classList.add('incorrect');
            inp.classList.remove('correct');
            if (hint) {
              var displayAns = correctRaw.split(/\s+or\s+/i)[0] || correctRaw;
              hint.textContent = '✓ ' + displayAns;
              hint.style.display = 'block';
            }
          }
        });

        // 2. Check Cross-out Groups (5 groups: 2.2, 2.3, 2.4, 2.5, 2.6)
        ['2.2', '2.3', '2.4', '2.5', '2.6'].forEach(function(grp) {
          var chips = container.querySelectorAll('.wb-cross-chip[data-group="' + grp + '"]');
          var correctChip = null;
          var userWrongCrossed = false;
          var userCrossedTarget = false;

          chips.forEach(function(c) {
            var isTarget = (c.getAttribute('data-incorrect') === 'true');
            var isCrossed = c.classList.contains('crossed');
            if (isTarget) correctChip = c;
            if (isCrossed && isTarget) userCrossedTarget = true;
            if (isCrossed && !isTarget) userWrongCrossed = true;
          });

          if (userCrossedTarget && !userWrongCrossed) {
            correctCount++;
            if (correctChip) {
              correctChip.classList.add('correct');
              correctChip.classList.remove('should-cross');
            }
          } else {
            chips.forEach(function(c) {
              if (c.classList.contains('crossed') && c.getAttribute('data-incorrect') !== 'true') {
                c.classList.add('incorrect');
              }
            });
            if (correctChip) {
              correctChip.classList.add('should-cross');
            }
          }
        });

        // 3. Check Choose Groups (9 groups: 3.2 to 3.8 and 7.1, 7.2)
        ['3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8', '7.1', '7.2'].forEach(function(grp) {
          var chips = container.querySelectorAll('.wb-choose-chip[data-group="' + grp + '"]');
          var selectedChip = null;
          var correctChip = null;

          chips.forEach(function(c) {
            if (c.classList.contains('selected')) selectedChip = c;
            if (c.getAttribute('data-correct') === 'true') correctChip = c;
          });

          if (selectedChip && selectedChip.getAttribute('data-correct') === 'true') {
            correctCount++;
            selectedChip.classList.add('correct');
            selectedChip.classList.remove('incorrect');
          } else {
            if (selectedChip) {
              selectedChip.classList.add('incorrect');
              selectedChip.classList.remove('correct');
            }
            if (correctChip) {
              correctChip.classList.add('should-choose');
            }
          }
        });

        // 4. Check Match Slots (6 slots: p5_ex4_1 to p5_ex4_6)
        container.querySelectorAll('.wb-match-slot').forEach(function(slot) {
          var userLetter = (slot.textContent || '').trim().toLowerCase();
          var correctLetter = (slot.getAttribute('data-correct') || '').trim().toLowerCase();
          var wrap = slot.closest('.eth-wb-item-wrap');
          var hint = wrap ? wrap.querySelector('.eth-wb-hint-badge') : null;

          if (userLetter === correctLetter && userLetter !== '?') {
            correctCount++;
            slot.classList.add('correct');
            slot.classList.remove('incorrect');
            if (hint) hint.style.display = 'none';
          } else {
            slot.classList.add('incorrect');
            slot.classList.remove('correct');
            if (hint) {
              hint.textContent = '✓ ' + correctLetter.toUpperCase();
              hint.style.display = 'block';
            }
          }
        });

        // 5. Check Insert Slots (4 slots: 5.2, 5.3, 5.4, 5.5)
        container.querySelectorAll('.wb-insert-slot').forEach(function(slot) {
          var isInserted = slot.classList.contains('inserted');
          var isCorrect = (slot.getAttribute('data-correct') === 'true');

          if (isInserted && isCorrect) {
            correctCount++;
            slot.classList.add('correct');
            slot.classList.remove('incorrect');
          } else if (isInserted && !isCorrect) {
            slot.classList.add('incorrect');
            slot.classList.remove('correct');
          } else {
            slot.classList.add('incorrect');
          }
        });

        // Show Score Pill
        var pct = Math.round((correctCount / totalQuestions) * 100);
        var pill = container.querySelector('#ethWbResultPill');
        if (pill) {
          pill.style.display = 'inline-block';
          pill.innerHTML = 'Natija: <b>' + correctCount + ' / ' + totalQuestions + ' (' + pct + '%)</b>';
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

        // Award Coins
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
        // Clear fill inputs
        container.querySelectorAll('.wb-fill-input').forEach(function(inp) {
          inp.value = '';
          inp.classList.remove('correct', 'incorrect');
        });
        // Clear cross chips
        container.querySelectorAll('.wb-cross-chip').forEach(function(chip) {
          chip.classList.remove('crossed', 'correct', 'incorrect', 'should-cross');
        });
        // Clear choose chips
        container.querySelectorAll('.wb-choose-chip').forEach(function(chip) {
          chip.classList.remove('selected', 'correct', 'incorrect', 'should-choose');
        });
        // Clear match slots
        container.querySelectorAll('.wb-match-slot').forEach(function(slot) {
          slot.textContent = '?';
          slot.classList.remove('correct', 'incorrect');
        });
        // Clear insert slots
        container.querySelectorAll('.wb-insert-slot').forEach(function(slot) {
          slot.classList.remove('inserted', 'correct', 'incorrect');
        });
        // Clear hints
        container.querySelectorAll('.eth-wb-hint-badge').forEach(function(badge) {
          badge.style.display = 'none';
        });

        var pill = container.querySelector('#ethWbResultPill');
        if (pill) pill.style.display = 'none';
        updateCount();
      });
    }

    // Visual Editor Setup for Teachers
    if (isEditor) {
      setupVisualEditor(container, activePage);
    }
  }

  // Teacher Visual Editor Dragging & Editing Setup
  function setupVisualEditor(container, activePage) {
    var modal = container.querySelector('#ethWbInputModal');
    var modalTitle = container.querySelector('#ethWbModalTitle');
    var modalType = container.querySelector('#ethWbModalType');
    var modalLabel = container.querySelector('#ethWbModalLabel');
    var modalCorrect = container.querySelector('#ethWbModalCorrect');
    var modalSave = container.querySelector('#ethWbModalSaveBtn');
    var modalCancel = container.querySelector('#ethWbModalCancelBtn');
    var modalDelete = container.querySelector('#ethWbModalDeleteBtn');

    var currentTarget = null;

    function openModal(isNew, pageNum, item) {
      currentTarget = { isNew: isNew, page: pageNum, item: item };
      modalTitle.textContent = isNew ? 'Yangi Katakcha Qo‘shish' : 'Katakchani Tahrirlash (' + item.id + ')';
      modalType.value = item.type || 'fill';
      modalLabel.value = item.label || item.group || '';
      modalCorrect.value = item.correct || (item.incorrect ? 'incorrect' : '');
      modalDelete.style.display = isNew ? 'none' : 'block';
      modal.style.display = 'flex';
    }

    function closeModal() {
      modal.style.display = 'none';
      currentTarget = null;
    }

    if (modalCancel) modalCancel.addEventListener('click', closeModal);

    if (modalSave) {
      modalSave.addEventListener('click', function() {
        if (!currentTarget) return;
        var page = currentTarget.page;
        var inputs = WB.getPageInputs(page);

        if (currentTarget.isNew) {
          var newItem = currentTarget.item;
          newItem.id = 'p' + page + '_custom_' + Date.now().toString().slice(-5);
          newItem.type = modalType.value;
          newItem.label = modalLabel.value.trim() || 'New';
          newItem.correct = modalCorrect.value.trim() || '';
          inputs.push(newItem);
        } else {
          var exist = inputs.find(function(x) { return x.id === currentTarget.item.id; });
          if (exist) {
            exist.type = modalType.value;
            exist.label = modalLabel.value.trim();
            exist.correct = modalCorrect.value.trim();
          }
        }

        WB.savePageInputs(page, inputs);
        closeModal();
        renderLesson1_1(container, activePage);
      });
    }

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

    container.querySelectorAll('.eth-wb-edit-handle').forEach(function(handle) {
      handle.addEventListener('click', function(e) {
        e.stopPropagation();
        var id = this.getAttribute('data-id');
        var wrap = this.closest('.eth-wb-item-wrap');
        var page = parseInt(wrap.getAttribute('data-page'), 10);
        var inputs = WB.getPageInputs(page);
        var item = inputs.find(function(x) { return x.id === id; });
        if (item) openModal(false, page, item);
      });
    });

    container.querySelectorAll('.eth-wb-overlay-layer').forEach(function(layer) {
      var page = parseInt(layer.getAttribute('data-page'), 10);
      var dragBox = layer.querySelector('.eth-wb-drag-box');
      var isDrawing = false;
      var startX = 0, startY = 0;
      var rect = null;

      layer.addEventListener('mousedown', function(e) {
        if (e.target.classList.contains('eth-wb-edit-handle') || e.target.classList.contains('wb-letter-btn')) return;
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

        if (wPx > 15 && hPx > 10) {
          var topPct = parseFloat(((Math.min(startY, endY) / rect.height) * 100).toFixed(1));
          var leftPct = parseFloat(((Math.min(startX, endX) / rect.width) * 100).toFixed(1));
          var widthPct = parseFloat(((wPx / rect.width) * 100).toFixed(1));
          var heightPct = parseFloat(((hPx / rect.height) * 100).toFixed(1));

          var newItem = {
            page: page,
            type: 'fill',
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

    var exportBtn = container.querySelector('#ethWbExportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', function() {
        var all = {
          page4: WB.getPageInputs(4),
          page5: WB.getPageInputs(5)
        };
        var jsonStr = JSON.stringify(all, null, 2);
        navigator.clipboard.writeText(jsonStr).then(function() {
          alert('Unit 1.1 koordinatalari buferga nusxa olindi!');
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
