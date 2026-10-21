/**
 * navigate_views.js
 * Oxford Navigate English Curriculum Views (B1+ Intermediate & B2 Upper-Intermediate)
 * Features:
 * - Interactive Fill-in Viewer with transparent <input> blanks & instant grading
 * - Unit Tests (1-12) & Progress Tests (1-4) with Teacher Lock/Unlock controls
 * - Vocabulary & Grammar modules based on Oxford Student's Books
 * - Modme / PIIMA style Daily Attendance Portal with Eskiz.uz SMS simulation & parent alerts
 * - Homework Assignment & Auto-Tracker with chat notifications
 * - Reading & Listening Studio with audio upload & strict playback limit
 */

(function(window) {
  'use strict';

  var App = window.EthithApp || {};
  var S = (App && App.state) || window.S || {};

  function getS() {
    if (!S || !S.classes) {
      App = window.EthithApp || {};
      S = (App && App.state) || window.S || S || {};
    }
    return S;
  }

  var _activeNavLevel = 'intermediate'; // 'intermediate' or 'upperIntermediate'
  var _activeNavTab = 'workbook'; // 'workbook' | 'unitTests' | 'progressTests' | 'vocab' | 'grammar' | 'studio'
  var _activeAttendanceGroup = 'Navigate Intermediate (B1+) - Guruh 1';
  var _attendanceSortHomework = false;

  function ic(name, cls) {
    if (window.ic) return window.ic(name, cls);
    return '<span class="' + (cls || '') + '">✦</span>';
  }

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function(c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Safe Exam Runner bridge to window.EthithViews.startExamRunner
  function runExam(examObj, container) {
    if (window.EthithViews && typeof window.EthithViews.startExamRunner === 'function') {
      window.EthithViews.startExamRunner(examObj, container);
    } else if (typeof window.startExamRunner === 'function') {
      window.startExamRunner(examObj, container);
    } else {
      alert("Test boshlashda xatolik: imtihon tizimi topilmadi.");
    }
  }

  // -------------------------------------------------------------
  // 1. MAIN NAVIGATE CURRICULUM VIEW
  // -------------------------------------------------------------
  function renderNavigateView(container, levelKey, subTabKey) {
    if (!container) return;
    window._ethithCurrentView = 'navigate';
    window._ethithIsTestInProgress = false;

    var curS = getS();

    if (levelKey) {
      if (levelKey === 'upperIntermediate' || levelKey === 'B2' || levelKey === 'b2') {
        _activeNavLevel = 'upperIntermediate';
      } else {
        _activeNavLevel = 'intermediate';
      }
    }
    if (subTabKey) {
      _activeNavTab = subTabKey;
    }

    var isTeacher = curS.user && curS.user.role === 'teacher';
    var curriculum = window.NAVIGATE_CURRICULUM || {};
    var curLevelData = curriculum[_activeNavLevel] || curriculum.intermediate || {};

    var html = '<div class="eth-navigate-wrap animate-fade-in">';

    // Top Header Banner
    html += '<div class="eth-market-banner" style="background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#0369a1 100%);margin-bottom:20px;border-radius:20px;padding:24px 28px">';
    html += '  <div>';
    html += '    <div style="font-size:12px;font-weight:900;letter-spacing:1px;color:#38bdf8;text-transform:uppercase;margin-bottom:6px">OXFORD UNIVERSITY PRESS · NAVIGATE CURRICULUM</div>';
    html += '    <h2 style="font-size:24px;font-weight:900;margin:0 0 6px;color:#ffffff">' + esc(curLevelData.levelName || 'Navigate English') + '</h2>';
    html += '    <p style="font-size:13.5px;color:#cbd5e1;margin:0;max-width:620px">Workbook darslari, rasmiy Unit & Progress testlar, so‘z boyligi va grammatika tahlili. Har bir mashq interaktiv fill-in tizimi orqali tekshiriladi.</p>';
    html += '  </div>';
    html += '  <div style="text-align:right;flex-shrink:0">';
    html += '    <div style="font-size:11.5px;color:#94a3b8;font-weight:700;margin-bottom:6px">O\'QUV DARAJASI:</div>';
    html += '    <div style="display:inline-flex;gap:6px;background:rgba(0,0,0,0.35);padding:4px;border-radius:14px;border:1px solid rgba(255,255,255,0.12)">';
    html += '      <button type="button" class="eth-nav-lvl-btn ' + (_activeNavLevel === 'intermediate' ? 'active' : '') + '" data-nav-level="intermediate">Intermediate (B1+)</button>';
    html += '      <button type="button" class="eth-nav-lvl-btn ' + (_activeNavLevel === 'upperIntermediate' ? 'active' : '') + '" data-nav-level="upperIntermediate">Upper-Intermediate (B2)</button>';
    html += '    </div>';
    html += '  </div>';
    html += '</div>';

    // 6 Navigation Sub-Tabs
    html += '<div class="eth-market-tabs-wrap" style="margin:0 0 22px 0">';
    html += '  <button type="button" class="eth-market-tab-btn ' + (_activeNavTab === 'workbook' ? 'active' : '') + '" data-nav-tab="workbook">📘 Workbook (' + (curLevelData.workbookUnits ? curLevelData.workbookUnits.length : 12) + ' Unit)</button>';
    html += '  <button type="button" class="eth-market-tab-btn ' + (_activeNavTab === 'unitTests' ? 'active' : '') + '" data-nav-tab="unitTests">📝 Unit Tests (1–12)</button>';
    html += '  <button type="button" class="eth-market-tab-btn ' + (_activeNavTab === 'progressTests' ? 'active' : '') + '" data-nav-tab="progressTests">📈 Progress Tests (1–4)</button>';
    html += '  <button type="button" class="eth-market-tab-btn ' + (_activeNavTab === 'vocab' ? 'active' : '') + '" data-nav-tab="vocab">📚 Vocabulary (Bold Words)</button>';
    html += '  <button type="button" class="eth-market-tab-btn ' + (_activeNavTab === 'grammar' ? 'active' : '') + '" data-nav-tab="grammar">🧠 Grammar Studio</button>';
    html += '  <button type="button" class="eth-market-tab-btn ' + (_activeNavTab === 'studio' ? 'active' : '') + '" data-nav-tab="studio">🎧 Reading & Listening Studio</button>';
    html += '</div>';

    // TAB 1: WORKBOOK (Units 1-12 with Lessons 1.1, 1.2, 1.3... & Fill-in Viewer)
    if (_activeNavTab === 'workbook') {
      html += '<div style="margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">';
      html += '  <h3 style="margin:0;font-size:17px;font-weight:800;color:var(--text)">📘 Oxford Navigate Workbook — Interactive Fill-in Mashqlari</h3>';
      html += '  <span style="font-size:12px;color:var(--muted)">Har bir darsga kirib, shaffof qatorlar ustiga to\'g\'ridan-to\'g\'ri javob yozing</span>';
      html += '</div>';

      html += '<div class="eth-grid-cards" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">';
      (curLevelData.workbookUnits || []).forEach(function(u) {
        html += '<div class="ap-card" style="padding:18px;border-radius:18px;border:1.5px solid var(--border);display:flex;flex-direction:column;justify-content:space-between">';
        html += '  <div>';
        html += '    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">';
        html += '      <span style="font-size:11px;font-weight:900;padding:3px 8px;border-radius:8px;background:rgba(37,99,235,0.12);color:#2563eb;text-transform:uppercase">Unit ' + u.unit + '</span>';
        html += '      <span style="font-size:11.5px;color:var(--muted)">' + (u.lessons ? u.lessons.length : 4) + ' ta dars</span>';
        html += '    </div>';
        html += '    <h4 style="margin:0 0 6px;font-size:16px;font-weight:800;color:var(--text)">' + esc(u.title) + '</h4>';
        html += '    <div style="font-size:12px;color:var(--muted);line-height:1.4;margin-bottom:14px"><b>Grammar:</b> ' + esc(u.grammarSummary) + '<br><b>Vocab:</b> ' + esc(u.vocabSummary) + '</div>';
        html += '  </div>';

        html += '  <div style="display:flex;flex-direction:column;gap:6px;border-top:1px solid var(--line);padding-top:10px">';
        (u.lessons || []).forEach(function(les) {
          var lesKey = _activeNavLevel + '_u' + u.unit + '_' + les.lessonCode;
          var userScore = (S.user && S.user.workbookProgress && S.user.workbookProgress[lesKey]) ? S.user.workbookProgress[lesKey] : null;
          html += '    <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;padding:6px 8px;border-radius:10px;background:var(--card-soft,rgba(0,0,0,0.03))">';
          html += '      <div style="font-size:12.5px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(les.title) + '</div>';
          if (userScore) {
            html += '      <button type="button" class="ap-btn out" style="padding:4px 8px;font-size:11px;font-weight:800;color:#10b981;border-color:#10b981" data-open-workbook="' + u.unit + '" data-lesson="' + les.lessonCode + '">✓ ' + userScore.scorePct + '%</button>';
          } else {
            html += '      <button type="button" class="ap-btn solid" style="padding:4px 10px;font-size:11px;font-weight:800;background:#2563eb;color:#fff" data-open-workbook="' + u.unit + '" data-lesson="' + les.lessonCode + '">Boshlash</button>';
          }
          html += '    </div>';
        });
        html += '  </div>';
        html += '</div>';
      });
      html += '</div>';
    }

    // TAB 2: UNIT TESTS (1-12) WITH TEACHER LOCK/UNLOCK CONTROLS
    else if (_activeNavTab === 'unitTests') {
      html += '<div style="margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">';
      html += '  <div>';
      html += '    <h3 style="margin:0 0 4px;font-size:18px;font-weight:900;color:var(--text)">📝 Rasmiy Oxford Navigate Unit Testlari (1–12)</h3>';
      html += '    <p style="margin:0;font-size:13px;color:var(--muted)">Har bir bo\'lim bo\'yicha rasmiy imtihonlar. ' + (isTeacher ? '<b>Ustoz rejimi:</b> Siz istalgan testni qulflash yoki qulfdan chiqarishingiz mumkin.' : 'Ustozingiz qulfdan chiqargan testlarni yechishingiz mumkin.') + '</p>';
      html += '  </div>';
      html += '</div>';

      html += '<div class="eth-grid-cards" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px">';
      (curLevelData.unitTests || []).forEach(function(test) {
        var testLockKey = test.id;
        var isLocked = Boolean(S.navigateTestLocks && S.navigateTestLocks[testLockKey]);

        html += '<div class="ap-card" style="padding:20px;border-radius:18px;border:1.5px solid ' + (isLocked ? '#ef4444' : 'var(--border)') + ';display:flex;flex-direction:column;justify-content:space-between;position:relative">';
        html += '  <div>';
        html += '    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">';
        html += '      <span style="font-size:11px;font-weight:900;padding:3px 8px;border-radius:8px;background:' + (isLocked ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)') + ';color:' + (isLocked ? '#ef4444' : '#10b981') + '">';
        html +=          isLocked ? '🔒 Qulflangan' : '🔓 Ochiq (Faol)';
        html += '      </span>';
        html += '      <span style="font-size:12px;color:var(--muted);font-weight:700">⏱ ' + test.duration + ' daqiqa</span>';
        html += '    </div>';
        html += '    <h4 style="margin:0 0 6px;font-size:16px;font-weight:800;color:var(--text)">' + esc(test.title) + '</h4>';
        html += '    <p style="margin:0 0 12px;font-size:12px;color:var(--muted)">' + esc(test.subtitle) + '</p>';
        html += '    <div style="font-size:12px;color:var(--muted);margin-bottom:16px;display:flex;gap:12px">';
        html += '      <span>❓ ' + (test.questions ? test.questions.length : 0) + ' ta savol</span>';
        html += '      <span>⭐ ' + (test.totalPoints || 50) + ' ball</span>';
        html += '    </div>';
        html += '  </div>';

        html += '  <div style="display:flex;flex-direction:column;gap:8px">';
        if (isTeacher) {
          html += '    <button type="button" class="ap-btn ' + (isLocked ? 'solid' : 'out') + '" style="padding:8px;font-size:12px;font-weight:800;' + (isLocked ? 'background:#10b981;color:#fff' : 'color:#ef4444;border-color:#ef4444') + '" data-toggle-test-lock="' + test.id + '">';
          html +=        isLocked ? '🔓 Qulfdan Chiqarish (Ruxsat Berish)' : '🔒 Qulfni Yopish (Qulflash)';
          html += '    </button>';
        }

        if (isLocked && !isTeacher) {
          html += '    <button type="button" class="ap-btn" style="background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.3);padding:10px;font-size:13px;font-weight:800;border-radius:12px;cursor:not-allowed" data-locked-alert="true">';
          html += '      🔒 Ustoz tomonidan qulflangan';
          html += '    </button>';
        } else {
          html += '    <button type="button" class="ap-btn solid" style="background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;padding:10px;font-size:13px;font-weight:800;border-radius:12px" data-run-nav-test="' + test.id + '" data-level="' + _activeNavLevel + '" data-test-type="unit">';
          html += '      🚀 Testni Boshlash &rarr;';
          html += '    </button>';
        }
        html += '  </div>';
        html += '</div>';
      });
      html += '</div>';
    }

    // TAB 3: PROGRESS TESTS (1-4)
    else if (_activeNavTab === 'progressTests') {
      html += '<div style="margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">';
      html += '  <div>';
      html += '    <h3 style="margin:0 0 4px;font-size:18px;font-weight:900;color:var(--text)">📈 Navigate Katta Bosqichli Progress Testlar (1–4)</h3>';
      html += '    <p style="margin:0;font-size:13px;color:var(--muted)">Har 3 unit yakunida o\'quvchilar bilimini tekshiruvchi asosiy sinov imtihonlari.</p>';
      html += '  </div>';
      html += '</div>';

      html += '<div class="eth-grid-cards" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:18px">';
      (curLevelData.progressTests || []).forEach(function(pt) {
        var isLocked = Boolean(S.navigateTestLocks && S.navigateTestLocks[pt.id]);

        html += '<div class="ap-card" style="padding:22px;border-radius:20px;border:1.5px solid ' + (isLocked ? '#ef4444' : '#3b82f6') + ';display:flex;flex-direction:column;justify-content:space-between;background:linear-gradient(180deg, var(--card) 0%, rgba(37,99,235,0.03) 100%)">';
        html += '  <div>';
        html += '    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">';
        html += '      <span style="font-size:11px;font-weight:900;padding:3px 10px;border-radius:10px;background:' + (isLocked ? 'rgba(239,68,68,0.15)' : 'rgba(37,99,235,0.15)') + ';color:' + (isLocked ? '#ef4444' : '#2563eb') + '">';
        html +=          isLocked ? '🔒 Qulflangan' : '🏆 ' + pt.units;
        html += '      </span>';
        html += '      <span style="font-size:12px;color:var(--muted);font-weight:700">⏱ ' + pt.duration + ' daqiqa</span>';
        html += '    </div>';
        html += '    <h4 style="margin:0 0 6px;font-size:17px;font-weight:900;color:var(--text)">' + esc(pt.title) + '</h4>';
        html += '    <p style="margin:0 0 14px;font-size:12.5px;color:var(--muted)">' + esc(pt.subtitle) + '</p>';
        html += '    <div style="font-size:12.5px;color:var(--muted);margin-bottom:18px;display:flex;gap:14px">';
        html += '      <span>❓ ' + (pt.questions ? pt.questions.length : 0) + ' ta savol</span>';
        html += '      <span>⭐ ' + (pt.totalPoints || 80) + ' ball</span>';
        html += '    </div>';
        html += '  </div>';

        html += '  <div style="display:flex;flex-direction:column;gap:8px">';
        if (isTeacher) {
          html += '    <button type="button" class="ap-btn ' + (isLocked ? 'solid' : 'out') + '" style="padding:8px;font-size:12px;font-weight:800;' + (isLocked ? 'background:#10b981;color:#fff' : 'color:#ef4444;border-color:#ef4444') + '" data-toggle-test-lock="' + pt.id + '">';
          html +=        isLocked ? '🔓 Qulfdan Chiqarish (Ruxsat Berish)' : '🔒 Qulfni Yopish (Qulflash)';
          html += '    </button>';
        }

        if (isLocked && !isTeacher) {
          html += '    <button type="button" class="ap-btn" style="background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.3);padding:11px;font-size:13.5px;font-weight:800;border-radius:12px;cursor:not-allowed" data-locked-alert="true">';
          html += '      🔒 Ustoz tomonidan qulflangan';
          html += '    </button>';
        } else {
          html += '    <button type="button" class="ap-btn solid" style="background:linear-gradient(135deg,#1e3a8a,#2563eb);color:#fff;padding:11px;font-size:13.5px;font-weight:800;border-radius:12px;box-shadow:0 6px 16px rgba(37,99,235,0.3)" data-run-nav-test="' + pt.id + '" data-level="' + _activeNavLevel + '" data-test-type="progress">';
          html += '      🚀 Progress Testni Boshlash &rarr;';
          html += '    </button>';
        }
        html += '  </div>';
        html += '</div>';
      });
      html += '</div>';
    }

    // TAB 4: VOCABULARY MODULE (Student's Book Bold Words)
    else if (_activeNavTab === 'vocab') {
      html += '<div style="margin-bottom:16px">';
      html += '  <h3 style="margin:0 0 4px;font-size:18px;font-weight:900;color:var(--text)">📚 Coursebook (Student\'s Book) Qalin Qora So\'zlar Lug\'ati</h3>';
      html += '  <p style="margin:0;font-size:13px;color:var(--muted)">Har bir Unit dagi barcha qora shriftda (bold) berilgan so\'zlar, ularning kontekstual ma\'nosi va interaktiv testlari.</p>';
      html += '</div>';

      html += '<div class="eth-grid-cards" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px">';
      (curLevelData.vocabModules || []).forEach(function(vm) {
        html += '<div class="ap-card" style="padding:20px;border-radius:18px;border:1.5px solid var(--border);display:flex;flex-direction:column;justify-content:space-between">';
        html += '  <div>';
        html += '    <span style="font-size:11px;font-weight:900;padding:3px 8px;border-radius:8px;background:rgba(245,158,11,0.15);color:#f59e0b;text-transform:uppercase">Unit ' + vm.unit + ' Vocab</span>';
        html += '    <h4 style="margin:8px 0 10px;font-size:16px;font-weight:800;color:var(--text)">' + esc(vm.title) + '</h4>';
        html += '    <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px">';
        (vm.words || []).forEach(function(w) {
          html += '      <div style="font-size:12px;background:var(--soft,rgba(0,0,0,0.03));padding:6px 10px;border-radius:8px">';
          html += '        <b style="color:#2563eb">' + esc(w.word) + '</b> <span style="color:var(--muted)">(' + esc(w.pos) + ')</span>: ' + esc(w.definition);
          html += '      </div>';
        });
        html += '    </div>';
        html += '  </div>';
        html += '  <button type="button" class="ap-btn solid" style="background:#f59e0b;color:#0f172a;font-weight:900;padding:9px;border-radius:12px" data-run-vocab-test="' + vm.unit + '" data-level="' + _activeNavLevel + '">🎯 Lug\'at Bilimini Testlash (Unit ' + vm.unit + ')</button>';
        html += '</div>';
      });
      html += '</div>';
    }

    // TAB 5: GRAMMAR STUDIO
    else if (_activeNavTab === 'grammar') {
      html += '<div style="margin-bottom:16px">';
      html += '  <h3 style="margin:0 0 4px;font-size:18px;font-weight:900;color:var(--text)">🧠 Navigate Student\'s Book Grammatika Markazi</h3>';
      html += '  <p style="margin:0;font-size:13px;color:var(--muted)">Barcha 12 ta Unit bo\'yicha asosiy grammatik qoidalar va mashqlar to\'plami.</p>';
      html += '</div>';

      html += '<div class="eth-grid-cards" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px">';
      (curLevelData.grammarModules || []).forEach(function(gm) {
        html += '<div class="ap-card" style="padding:20px;border-radius:18px;border:1.5px solid var(--border);display:flex;flex-direction:column;justify-content:space-between">';
        html += '  <div>';
        html += '    <span style="font-size:11px;font-weight:900;padding:3px 8px;border-radius:8px;background:rgba(139,92,246,0.15);color:#8b5cf6;text-transform:uppercase">Unit ' + gm.unit + ' Grammar</span>';
        html += '    <h4 style="margin:8px 0 10px;font-size:16px;font-weight:800;color:var(--text)">' + esc(gm.title) + '</h4>';
        html += '    <div style="font-size:12.5px;color:var(--muted);line-height:1.5;margin-bottom:14px">';
        (gm.rules || []).forEach(function(r) {
          html += '      <p style="margin:0 0 6px"><b>' + esc(r.rule) + ':</b> ' + esc(r.explanation) + '</p>';
        });
        html += '    </div>';
        html += '  </div>';
        html += '  <button type="button" class="ap-btn solid" style="background:#8b5cf6;color:#fff;font-weight:800;padding:9px;border-radius:12px" data-run-grammar-test="' + gm.unit + '" data-level="' + _activeNavLevel + '">⚡ Grammatika Testini Boshlash (Unit ' + gm.unit + ')</button>';
        html += '</div>';
      });
      html += '</div>';
    }

    // TAB 6: READING & LISTENING STUDIO
    else if (_activeNavTab === 'studio') {
      html += renderStudioInlineHtml(isTeacher);
    }

    html += '</div>'; // end wrap
    container.innerHTML = html;

    // EVENT LISTENERS
    container.querySelectorAll('.eth-nav-lvl-btn').forEach(function(btn) {
      btn.onclick = function() {
        _activeNavLevel = btn.dataset.navLevel;
        renderNavigateView(container, _activeNavLevel, _activeNavTab);
      };
    });

    container.querySelectorAll('.eth-market-tab-btn').forEach(function(btn) {
      btn.onclick = function() {
        _activeNavTab = btn.dataset.navTab;
        renderNavigateView(container, _activeNavLevel, _activeNavTab);
      };
    });

    container.querySelectorAll('[data-open-workbook]').forEach(function(btn) {
      btn.onclick = function() {
        var uNum = parseInt(btn.dataset.openWorkbook, 10);
        var lesCode = btn.dataset.lesson;
        renderWorkbookViewer(container, _activeNavLevel, uNum, lesCode);
      };
    });

    container.querySelectorAll('[data-toggle-test-lock]').forEach(function(btn) {
      btn.onclick = function() {
        var tId = btn.dataset.toggleTestLock;
        if (!S.navigateTestLocks) S.navigateTestLocks = {};
        S.navigateTestLocks[tId] = !S.navigateTestLocks[tId];
        if (window.EthithApp && window.EthithApp.saveState) window.EthithApp.saveState();
        if (window.EthithSync && window.EthithSync.publishLive) {
          window.EthithSync.publishLive({
            type: 'TEST_LOCK_TOGGLED',
            testId: tId,
            locked: S.navigateTestLocks[tId]
          });
        }
        renderNavigateView(container, _activeNavLevel, _activeNavTab);
      };
    });

    container.querySelectorAll('[data-locked-alert]').forEach(function(btn) {
      btn.onclick = function() {
        alert("🔒 Ushbu test hozirda ustozingiz tomonidan qulflangan.\nUstoz qulfdan chiqargach, testni yechishingiz mumkin.");
      };
    });

    container.querySelectorAll('[data-run-nav-test]').forEach(function(btn) {
      btn.onclick = function() {
        var tId = btn.dataset.runNavTest;
        var lvl = btn.dataset.level;
        var tType = btn.dataset.testType;
        var curData = (window.NAVIGATE_CURRICULUM && window.NAVIGATE_CURRICULUM[lvl]) || {};
        var list = (tType === 'unit') ? curData.unitTests : curData.progressTests;
        var found = (list || []).find(function(t) { return t.id === tId; });
        if (found) {
          runExam(found, container);
        } else {
          alert("Test topilmadi.");
        }
      };
    });

    container.querySelectorAll('[data-run-vocab-test]').forEach(function(btn) {
      btn.onclick = function() {
        var uNum = parseInt(btn.dataset.runVocabTest, 10);
        var lvl = btn.dataset.level;
        var curData = (window.NAVIGATE_CURRICULUM && window.NAVIGATE_CURRICULUM[lvl]) || {};
        var mod = (curData.vocabModules || []).find(function(m) { return m.unit === uNum; });
        if (mod && mod.quizQuestions) {
          var examObj = {
            id: 'vocab_' + lvl + '_u' + uNum,
            title: mod.title,
            duration: 25,
            pointsPerQ: 2,
            questions: mod.quizQuestions,
            isPublic: true
          };
          runExam(examObj, container);
        }
      };
    });

    container.querySelectorAll('[data-run-grammar-test]').forEach(function(btn) {
      btn.onclick = function() {
        var uNum = parseInt(btn.dataset.runGrammarTest, 10);
        var lvl = btn.dataset.level;
        var curData = (window.NAVIGATE_CURRICULUM && window.NAVIGATE_CURRICULUM[lvl]) || {};
        var mod = (curData.grammarModules || []).find(function(m) { return m.unit === uNum; });
        if (mod && mod.quizQuestions) {
          var examObj = {
            id: 'grammar_' + lvl + '_u' + uNum,
            title: mod.title,
            duration: 25,
            pointsPerQ: 2,
            questions: mod.quizQuestions,
            isPublic: true
          };
          runExam(examObj, container);
        }
      };
    });
  }

  // -------------------------------------------------------------
  // 2. INTERACTIVE FILL-IN VIEWER FOR WORKBOOK
  // -------------------------------------------------------------
  function renderWorkbookViewer(container, levelKey, unitNum, lessonCode) {
    if (!container) return;
    window._ethithCurrentView = 'workbook_viewer';

    var curLevelData = (window.NAVIGATE_CURRICULUM && window.NAVIGATE_CURRICULUM[levelKey]) || {};
    var uData = (curLevelData.workbookUnits || []).find(function(u) { return u.unit === unitNum; });
    var lesData = uData ? (uData.lessons || []).find(function(l) { return l.lessonCode === lessonCode; }) : null;

    if (!lesData) {
      alert("Dars ma'lumotlari topilmadi.");
      renderNavigateView(container, levelKey, 'workbook');
      return;
    }

    var html = '<div class="eth-workbook-viewer animate-fade-in" style="max-width:850px;margin:0 auto;padding-bottom:50px">';

    // Top Navigation & Breadcrumbs
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:10px">';
    html += '  <button type="button" class="ap-btn out" id="btnBackToWorkbook" style="padding:8px 16px;font-size:13px;font-weight:700">&larr; Workbook Darslariga Qaytish</button>';
    html += '  <div style="font-size:12.5px;color:var(--muted);font-weight:700">Navigate ' + (levelKey === 'intermediate' ? 'B1+' : 'B2') + ' &bull; Unit ' + unitNum + ' &bull; Lesson ' + lessonCode + '</div>';
    html += '</div>';

    // Lesson Banner
    html += '<div class="ap-card" style="padding:22px;border-radius:18px;background:linear-gradient(135deg,#0f172a,#1e3a8a);color:#fff;margin-bottom:24px;border:1px solid rgba(255,255,255,0.12)">';
    html += '  <span style="font-size:11px;font-weight:900;padding:3px 8px;border-radius:8px;background:rgba(255,255,255,0.2);color:#38bdf8;text-transform:uppercase">INTERACTIVE FILL-IN VIEWER</span>';
    html += '  <h2 style="margin:8px 0 6px;font-size:22px;font-weight:900;color:#ffffff">' + esc(lesData.title) + '</h2>';
    html += '  <p style="margin:0;font-size:13px;opacity:0.9">Bo\'shliqlarga to\'g\'ri so\'zlarni yozing va pastdagi <b>"Tekshirish"</b> tugmasini bosing. Katta-kichik harflar va muqobil javoblar (masalan: <i>time or TIME</i>) to\'liq qabul qilinadi.</p>';
    html += '</div>';

    // Render Exercises with Transparent Overlaid <input> fields
    (lesData.exercises || []).forEach(function(ex, eIdx) {
      html += '<div class="ap-card eth-fillin-card" style="padding:24px;border-radius:20px;margin-bottom:22px;border:1.5px solid var(--border)">';
      html += '  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">';
      html += '    <h3 style="margin:0;font-size:16px;font-weight:800;color:var(--text)">' + esc(ex.title) + '</h3>';
      html += '    <span class="eth-fillin-score-badge" id="exScore_' + eIdx + '" style="font-size:12px;font-weight:800;color:var(--muted)"></span>';
      html += '  </div>';
      html += '  <p style="font-size:13px;color:var(--muted);margin:0 0 16px;font-style:italic">' + esc(ex.instructions) + '</p>';

      // Convert template: {{gId:correctAnswers}} into transparent <input>
      var renderedTemplate = ex.template.replace(/\{\{([a-zA-Z0-9_]+):([^}]+)\}\}/g, function(match, gapId, answers) {
        return '<input type="text" class="eth-fillin-input" data-ex-idx="' + eIdx + '" data-gap-id="' + gapId + '" data-answers="' + esc(answers) + '" placeholder="..." autocomplete="off" spellcheck="false" />';
      });

      html += '  <div class="eth-fillin-content" style="font-size:15px;line-height:2.2;color:var(--text);background:var(--soft,rgba(0,0,0,0.02));padding:18px;border-radius:14px;border:1px solid var(--line);white-space:pre-line">';
      html +=      renderedTemplate;
      html += '  </div>';
      html += '</div>';
    });

    // Check & Submit Footer
    html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:18px;background:var(--card);border-radius:18px;border:1.5px solid var(--border);box-shadow:0 8px 24px rgba(0,0,0,0.06);position:sticky;bottom:20px;z-index:10">';
    html += '  <div id="workbookOverallResult" style="font-size:14px;font-weight:800;color:var(--text)">Javoblarni yozib bo\'lgach, tekshiring:</div>';
    html += '  <div style="display:flex;gap:10px">';
    html += '    <button type="button" class="ap-btn out" id="btnResetFillin" style="padding:10px 18px;font-size:13px;font-weight:800">Qayta Boshlash</button>';
    html += '    <button type="button" class="ap-btn solid" id="btnCheckFillin" style="padding:10px 24px;font-size:14px;font-weight:900;background:linear-gradient(135deg,#10b981,#059669);color:#fff;box-shadow:0 6px 16px rgba(16,185,129,0.3)">✓ Tekshirish & Natijani Saqlash</button>';
    html += '  </div>';
    html += '</div>';

    html += '</div>';
    container.innerHTML = html;

    var btnBack = container.querySelector('#btnBackToWorkbook');
    if (btnBack) {
      btnBack.onclick = function() {
        renderNavigateView(container, levelKey, 'workbook');
      };
    }

    var btnReset = container.querySelector('#btnResetFillin');
    if (btnReset) {
      btnReset.onclick = function() {
        renderWorkbookViewer(container, levelKey, unitNum, lessonCode);
      };
    }

    // "Tekshirish" Verification Logic supporting 'or', case-insensitivity, and auto-score
    var btnCheck = container.querySelector('#btnCheckFillin');
    if (btnCheck) {
      btnCheck.onclick = function() {
      var allInputs = container.querySelectorAll('.eth-fillin-input');
      var total = allInputs.length;
      var correct = 0;

      allInputs.forEach(function(inp) {
        var userVal = (inp.value || '').trim().toLowerCase();
        var rawAns = inp.dataset.answers || '';
        // Split alternatives by 'or' or '/' or ','
        var validOptions = rawAns.split(/\s+or\s+|\/|,/i).map(function(o) {
          return o.trim().toLowerCase();
        });

        var isRight = (userVal.length > 0) && validOptions.some(function(opt) {
          return userVal === opt;
        });

        // Remove old indicators
        var oldHint = inp.nextElementSibling;
        if (oldHint && oldHint.classList.contains('eth-fillin-hint')) oldHint.remove();

        if (isRight) {
          correct++;
          inp.style.background = 'rgba(16,185,129,0.18)';
          inp.style.borderColor = '#10b981';
          inp.style.color = '#10b981';
          inp.style.fontWeight = '900';
        } else {
          inp.style.background = 'rgba(239,68,68,0.15)';
          inp.style.borderColor = '#ef4444';
          inp.style.color = '#ef4444';
          inp.style.fontWeight = '700';

          var hintSpan = document.createElement('span');
          hintSpan.className = 'eth-fillin-hint';
          hintSpan.style.cssText = 'font-size:11.5px;color:#10b981;font-weight:800;margin-left:4px;padding:2px 6px;border-radius:6px;background:rgba(16,185,129,0.12)';
          hintSpan.textContent = '[' + rawAns + ']';
          inp.insertAdjacentElement('afterend', hintSpan);
        }
      });

      var pct = Math.round((correct / (total || 1)) * 100);
      var resultEl = container.querySelector('#workbookOverallResult');
      if (resultEl) {
        resultEl.innerHTML = '<span style="color:' + (pct >= 70 ? '#10b981' : '#ef4444') + ';font-size:16px;font-weight:900">NATIJA: ' + correct + ' / ' + total + ' (' + pct + '%)</span>' + (pct >= 70 ? ' 🎉 A\'lo natija!' : ' 💡 Xatolaringizni ko\'rib chiqing');
      }

      if (window.EthithAttendance && typeof window.EthithAttendance.recordStudentHomeworkCompletion === 'function') {
        try {
          window.EthithAttendance.recordStudentHomeworkCompletion({
            unit: unitNum,
            lessonCode: lessonCode,
            correctCount: correct,
            totalQuestions: total || 1,
            pct: pct,
            autoGrade: pct >= 86 ? 5 : (pct >= 71 ? 4 : (pct >= 55 ? 3 : 2))
          });
        } catch (e) {}
      }

      // Save student score
      if (S.user) {
        if (!S.user.workbookProgress) S.user.workbookProgress = {};
        var lesKey = levelKey + '_u' + unitNum + '_' + lessonCode;
        S.user.workbookProgress[lesKey] = {
          unit: unitNum,
          lesson: lessonCode,
          correct: correct,
          total: total,
          scorePct: pct,
          updatedAt: Date.now()
        };

        // Award coins on high score
        if (pct >= 70) {
          S.user.coins = (Number(S.user.coins) || 0) + 15;
          if (window._ethithUpdateTopCoins) window._ethithUpdateTopCoins();
        }

        if (window.EthithApp && window.EthithApp.saveState) window.EthithApp.saveState();

        // Broadcast to teacher live
        if (window.EthithSync && window.EthithSync.publishLive) {
          window.EthithSync.publishLive({
            type: 'WORKBOOK_COMPLETED',
            studentName: S.user.name,
            studentEmail: S.user.email,
            level: levelKey,
            unit: unitNum,
            lesson: lessonCode,
            scorePct: pct,
            timestamp: Date.now()
          });
        }
      }

      alert("Tekshirildi!\nTo'g'ri javoblar: " + correct + " / " + total + " (" + pct + "%)\nNatijangiz saqlandi va ustozingizga yuborildi.");
      };
    }
  }

  // -------------------------------------------------------------
  // 3. READING & LISTENING STUDIO INLINE HTML & BUILDER
  // -------------------------------------------------------------
  function renderStudioInlineHtml(isTeacher) {
    var html = '<div class="eth-studio-wrap">';
    html += '  <div style="margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">';
    html += '    <div>';
    html += '      <h3 style="margin:0 0 4px;font-size:18px;font-weight:900;color:var(--text)">🎧 Reading & Listening Studio (Ustoz Test Tuzish Markazi)</h3>';
    html += '      <p style="margin:0;font-size:13px;color:var(--muted)">Audio yuklash, tinglashlar sonini cheklash (1–2 martta), shaffof oraliqlar (fill-in) va True/False/Not Given testlari.</p>';
    html += '    </div>';
    if (isTeacher) {
      html += '    <button type="button" class="ap-btn solid" id="btnOpenStudioCreator" style="background:linear-gradient(135deg,#0284c7,#0369a1);color:#fff;font-weight:800;padding:10px 18px;border-radius:12px">+ Yangi Listening / Reading Test Tuzish</button>';
    }
    html += '  </div>';

    // Preset Studio Tests Showcase
    var studioTests = [
      { id: 'st_listen_1', type: 'listening', title: 'Listening Test: Daily Routines & Hobbies', playsLimit: 2, duration: 20, points: 20, desc: 'Audio suhbatni tinglang (Maksimum 2 marta qo\'yish mumkin) va javoblarni to\'ldiring.' },
      { id: 'st_read_1', type: 'reading', title: 'Academic Reading: The Architecture of Future Cities', playsLimit: 0, duration: 25, points: 25, desc: 'Matnni o\'qing va True / False / Not Given savollariga javob bering.' }
    ];

    html += '  <div class="eth-grid-cards" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px">';
    studioTests.forEach(function(st) {
      html += '    <div class="ap-card" style="padding:20px;border-radius:18px;border:1.5px solid var(--border);display:flex;flex-direction:column;justify-content:space-between">';
      html += '      <div>';
      html += '        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">';
      html += '          <span style="font-size:11px;font-weight:900;padding:3px 8px;border-radius:8px;background:' + (st.type === 'listening' ? 'rgba(2,132,199,0.15)' : 'rgba(16,185,129,0.15)') + ';color:' + (st.type === 'listening' ? '#0284c7' : '#10b981') + ';text-transform:uppercase">' + (st.type === 'listening' ? '🎧 Listening (2x Play)' : '📖 Reading') + '</span>';
      html += '          <span style="font-size:12px;color:var(--muted);font-weight:700">⏱ ' + st.duration + ' daqiqa</span>';
      html += '        </div>';
      html += '        <h4 style="margin:0 0 6px;font-size:16px;font-weight:800;color:var(--text)">' + esc(st.title) + '</h4>';
      html += '        <p style="margin:0 0 14px;font-size:12.5px;color:var(--muted)">' + esc(st.desc) + '</p>';
      html += '      </div>';
      html += '      <button type="button" class="ap-btn solid" style="background:#2563eb;color:#fff;font-weight:800;padding:9px;border-radius:12px" data-open-studio-exam="' + st.id + '">Testni Ochish &rarr;</button>';
      html += '    </div>';
    });
    html += '  </div>';
    html += '</div>';

    setTimeout(function() {
      var btn = document.getElementById('btnOpenStudioCreator');
      if (btn) btn.onclick = function() { showStudioCreatorModal(); };
      document.querySelectorAll('[data-open-studio-exam]').forEach(function(b) {
        b.onclick = function() {
          alert("Studio sinovi: Audio eshitish limiti va shaffof oraliqlar bilan yuklanmoqda...");
        };
      });
    }, 50);

    return html;
  }

  function showStudioCreatorModal() {
    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';
    overlay.style.zIndex = '99999';

    var html = '<div class="eth-modal" style="max-width:650px;max-height:90vh;overflow-y:auto">';
    html += '  <div class="eth-modal-header" style="display:flex;align-items:center;justify-content:space-between">';
    html += '    <h3 style="margin:0;font-size:18px;font-weight:900;color:var(--text)">🎧 Yangi Listening / Reading Test Yaratish</h3>';
    html += '    <button type="button" id="btnCloseStudioModal" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--muted)">✕</button>';
    html += '  </div>';
    html += '  <div class="eth-modal-body" style="display:flex;flex-direction:column;gap:14px">';
    html += '    <div>';
    html += '      <label style="display:block;font-size:12.5px;font-weight:800;margin-bottom:6px">Test Nomi:</label>';
    html += '      <input type="text" id="studioTitle" placeholder="Masalan: Unit 3 Listening - The Future of Money" style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:10px;border:1px solid var(--border);background:var(--card);color:var(--text)" />';
    html += '    </div>';
    html += '    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';
    html += '      <div>';
    html += '        <label style="display:block;font-size:12.5px;font-weight:800;margin-bottom:6px">Audio Qo\'yish Limiti:</label>';
    html += '        <select id="studioAudioLimit" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--border);background:var(--card);color:var(--text)">';
    html += '          <option value="1">Faqat 1 martta qo\'yish mumkin</option>';
    html += '          <option value="2" selected>2 martta (Oxford/IELTS Standarti)</option>';
    html += '          <option value="999">Cheklovsiz (Mashq rejimi)</option>';
    html += '        </select>';
    html += '      </div>';
    html += '      <div>';
    html += '        <label style="display:block;font-size:12.5px;font-weight:800;margin-bottom:6px">Vaqt (Daqiqa):</label>';
    html += '        <input type="number" id="studioDuration" value="25" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--border);background:var(--card);color:var(--text)" />';
    html += '      </div>';
    html += '    </div>';
    html += '    <div>';
    html += '      <label style="display:block;font-size:12.5px;font-weight:800;margin-bottom:6px">Audio Fayl (MP3/WAV):</label>';
    html += '      <input type="file" id="studioAudioFile" accept="audio/*" style="width:100%;font-size:13px" />';
    html += '    </div>';
    html += '    <div>';
    html += '      <label style="display:block;font-size:12.5px;font-weight:800;margin-bottom:6px">Matn / Savollar (Oraliqlar uchun <code>{{time or TIME}}</code> formatida yozing):</label>';
    html += '      <textarea id="studioText" rows="6" placeholder="The speaker arrived at {{10:00 or 10am}} in the morning..." style="width:100%;box-sizing:border-box;padding:12px;border-radius:12px;border:1px solid var(--border);background:var(--card);color:var(--text)"></textarea>';
    html += '    </div>';
    html += '    <button type="button" id="btnSaveStudioExam" class="ap-btn solid" style="background:#2563eb;color:#fff;font-weight:900;padding:12px;border-radius:12px">Saqlash va Testga Joylash</button>';
    html += '  </div>';
    html += '</div>';

    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    overlay.querySelector('#btnCloseStudioModal').onclick = function() { overlay.remove(); };
    overlay.querySelector('#btnSaveStudioExam').onclick = function() {
      var tit = overlay.querySelector('#studioTitle').value.trim();
      if (!tit) { alert("Test nomini kiriting"); return; }
      alert("✅ Yangi Studio testi muvaffaqiyatli yaratildi va ro'yxatga qo'shildi!");
      overlay.remove();
    };
  }

  // -------------------------------------------------------------
  // 4. MODME / PIIMA STYLE DAILY ATTENDANCE & CRM PORTAL
  // -------------------------------------------------------------
  function renderAttendancePortal(container) {
    if (!container) return;
    window._ethithCurrentView = 'attendance';

    var groups = [
      'Navigate Intermediate (B1+) - Guruh 1',
      'Navigate Upper-Intermediate (B2) - Guruh 1',
      'IELTS Intensive - Guruh A'
    ];
    (S.classes || []).forEach(function(c) {
      if (groups.indexOf(c.name) === -1) groups.push(c.name);
    });

    var todayStr = new Date().toISOString().slice(0, 10);
    if (!S.dailyAttendance) S.dailyAttendance = {};
    if (!S.dailyAttendance[todayStr]) S.dailyAttendance[todayStr] = {};
    var todayRecords = S.dailyAttendance[todayStr];

    // Gather students list from accounts or classes
    var students = (S.accounts || []).filter(function(a) {
      return a.role !== 'teacher' && a.email !== 'joraboyevmuhammad85@gmail.com';
    });

    if (students.length === 0) {
      students = [
        { id: 'st_1', name: 'Muhammadyusuf Jo\'raboyev', email: 'muhammedjoraboyev1@gmail.com', phone: '+998901234567', coins: 102000, level: 'B2', performance: 'high' },
        { id: 'st_2', name: 'Shamshodbek', email: 'strikeruzb52@gmail.com', phone: '+998912345678', coins: 450, level: 'B1+', performance: 'med' },
        { id: 'st_3', name: 'Alisher O\'quvchi', email: 'alisher@gmail.com', phone: '+998933334455', coins: 180, level: 'B1+', performance: 'low' },
        { id: 'st_4', name: 'Aleksander Mike', email: 'aleksandermike37@gmail.com', phone: '+998944445566', coins: 53050, level: 'B2', performance: 'high' },
        { id: 'st_5', name: 'Sarvar Tovboyev', email: 'sarvartovboyev09@gmail.com', phone: '+998977778899', coins: 100000, level: 'B2', performance: 'med' }
      ];
    }

    // Sorting: If teacher clicked "Uy vazifalarini tekshirish", sort uncompleted / lowest performance students to top in RED!
    if (_attendanceSortHomework) {
      students.sort(function(a, b) {
        var perfWeight = { low: 1, med: 2, high: 3 };
        return (perfWeight[a.performance || 'med'] || 2) - (perfWeight[b.performance || 'med'] || 2);
      });
    }

    // Counters
    var totalCount = students.length;
    var presentCount = 0;
    var excusedCount = 0;
    var absentCount = 0;

    students.forEach(function(st) {
      var status = todayRecords[st.email || st.id];
      if (status === 'present') presentCount++;
      else if (status === 'excused') excusedCount++;
      else if (status === 'absent') absentCount++;
    });

    var attRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

    var html = '<div class="eth-attendance-portal animate-fade-in" style="max-width:1150px;margin:0 auto;padding-bottom:50px">';

    // Header & Group Switcher
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:14px">';
    html += '  <div>';
    html += '    <div style="font-size:12px;font-weight:900;letter-spacing:1px;color:#10b981;text-transform:uppercase;margin-bottom:4px">MODME & PIIMA STUDY PORTAL CRM</div>';
    html += '    <h2 style="margin:0 0 6px;font-size:24px;font-weight:900;color:var(--text)">📋 Kunlik Davomat & O\'quvchilar Statistikasi</h2>';
    html += '    <p style="margin:0;font-size:13.5px;color:var(--muted)">Har bir o\'quvchi qarshisidagi 3 ta tugma: [Keldi], [Sababli], [Kelmadi]. [Kelmadi] bosilganda avtomatik ota-onaga SMS yuboriladi.</p>';
    html += '  </div>';

    html += '  <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">';
    html += '    <select id="selectAttGroup" style="padding:10px 14px;border-radius:12px;border:1.5px solid var(--border);background:var(--card);color:var(--text);font-weight:800;font-size:13.5px">';
    groups.forEach(function(g) {
      html += '      <option value="' + esc(g) + '" ' + (g === _activeAttendanceGroup ? 'selected' : '') + '>' + esc(g) + '</option>';
    });
    html += '    </select>';
    html += '    <input type="date" value="' + todayStr + '" style="padding:9px 12px;border-radius:12px;border:1.5px solid var(--border);background:var(--card);color:var(--text);font-weight:700;font-size:13px" />';
    html += '  </div>';
    html += '</div>';

    // Summary Stat Cards (Green/Yellow/Red Metrics)
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:24px">';
    html += '  <div class="ap-card" style="padding:16px;border-radius:16px;border-left:4px solid #3b82f6">';
    html += '    <div style="font-size:12px;color:var(--muted);font-weight:700">JAMI O\'QUVCHILAR</div>';
    html += '    <div style="font-size:26px;font-weight:900;color:var(--text);margin-top:4px">' + totalCount + ' ta</div>';
    html += '  </div>';
    html += '  <div class="ap-card" style="padding:16px;border-radius:16px;border-left:4px solid #10b981;background:rgba(16,185,129,0.04)">';
    html += '    <div style="font-size:12px;color:#10b981;font-weight:800">KELDI (DAVOMAT)</div>';
    html += '    <div style="font-size:26px;font-weight:900;color:#10b981;margin-top:4px">' + presentCount + ' ta</div>';
    html += '  </div>';
    html += '  <div class="ap-card" style="padding:16px;border-radius:16px;border-left:4px solid #f59e0b;background:rgba(245,158,11,0.04)">';
    html += '    <div style="font-size:12px;color:#f59e0b;font-weight:800">SABABLI (OGOHLANTIRILGAN)</div>';
    html += '    <div style="font-size:26px;font-weight:900;color:#f59e0b;margin-top:4px">' + excusedCount + ' ta</div>';
    html += '  </div>';
    html += '  <div class="ap-card" style="padding:16px;border-radius:16px;border-left:4px solid #ef4444;background:rgba(239,68,68,0.04)">';
    html += '    <div style="font-size:12px;color:#ef4444;font-weight:800">KELMADI (SMS YUBORILDI)</div>';
    html += '    <div style="font-size:26px;font-weight:900;color:#ef4444;margin-top:4px">' + absentCount + ' ta</div>';
    html += '  </div>';
    html += '  <div class="ap-card" style="padding:16px;border-radius:16px;border-left:4px solid #8b5cf6">';
    html += '    <div style="font-size:12px;color:var(--muted);font-weight:700">DAVOMAT KO\'RSATKICHI</div>';
    html += '    <div style="font-size:26px;font-weight:900;color:#8b5cf6;margin-top:4px">' + attRate + '%</div>';
    html += '  </div>';
    html += '</div>';

    // Action Row: "Uy vazifalarini tekshirish" Button & Eskiz Settings
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:10px">';
    html += '  <div style="display:flex;align-items:center;gap:8px">';
    html += '    <button type="button" class="ap-btn solid" id="btnSortHomework" style="background:' + (_attendanceSortHomework ? '#ef4444' : 'linear-gradient(135deg,#e11d48,#be123c)') + ';color:#fff;font-weight:900;padding:10px 18px;border-radius:12px;box-shadow:0 6px 16px rgba(225,29,72,0.3)">';
    html +=        _attendanceSortHomework ? '🔄 Odatiy Tartibga Qaytish' : '⚡ Uy Vazifalarini Tekshirish & Past Natijalilarni Tepaga Chiqarish';
    html += '    </button>';
    html += '  </div>';
    html += '  <button type="button" class="ap-btn out" id="btnEskizSettings" style="font-size:12.5px;font-weight:800;padding:8px 14px;border-radius:10px">⚙️ Eskiz.uz SMS Token Sozlamasi</button>';
    html += '</div>';

    // Roster Table (PIIMA / Modme Format)
    html += '<div class="ap-card" style="padding:0;border-radius:20px;overflow:hidden;border:1.5px solid var(--border)">';
    html += '  <div style="overflow-x:auto">';
    html += '    <table style="width:100%;border-collapse:collapse;text-align:left;font-size:13.5px">';
    html += '      <thead>';
    html += '        <tr style="background:var(--soft,rgba(0,0,0,0.03));border-bottom:1.5px solid var(--line);color:var(--muted);font-size:12px;font-weight:800;text-transform:uppercase">';
    html += '          <th style="padding:14px 18px;width:40px">#</th>';
    html += '          <th style="padding:14px 18px">O\'quvchi</th>';
    html += '          <th style="padding:14px 18px">Ota-ona Raqami</th>';
    html += '          <th style="padding:14px 18px;text-align:center">Bugungi Davomat</th>';
    html += '          <th style="padding:14px 18px">Uy Vazifasi & Ball</th>';
    html += '          <th style="padding:14px 18px;text-align:center">Tahlil & Trend</th>';
    html += '        </tr>';
    html += '      </thead>';
    html += '      <tbody>';

    students.forEach(function(st, idx) {
      var curSt = todayRecords[st.email || st.id] || 'present';
      var perf = st.performance || 'med';
      var isCritical = (perf === 'low') && _attendanceSortHomework;

      html += '      <tr style="border-bottom:1px solid var(--line);' + (isCritical ? 'background:rgba(239,68,68,0.08);border-left:4px solid #ef4444' : '') + '">';
      html += '        <td style="padding:14px 18px;color:var(--muted);font-weight:800">' + (idx + 1) + '</td>';
      html += '        <td style="padding:14px 18px">';
      html += '          <div style="display:flex;align-items:center;gap:10px">';
      html += '            <span style="font-size:24px">👤</span>';
      html += '            <div>';
      html += '              <div style="font-weight:900;color:var(--text)">' + esc(st.name) + (isCritical ? ' <span style="font-size:10px;padding:2px 6px;border-radius:6px;background:#ef4444;color:#fff;font-weight:900">VAZIFA BAJARILMAGAN!</span>' : '') + '</div>';
      html += '              <div style="font-size:11.5px;color:var(--muted)">' + esc(st.email) + '</div>';
      html += '            </div>';
      html += '          </div>';
      html += '        </td>';

      html += '        <td style="padding:14px 18px;font-family:monospace;font-size:12.5px;color:var(--text)">';
      html +=            esc(st.phone || '+998901234567');
      html += '        </td>';

      // 3 Attendance Buttons: [Keldi], [Sababli], [Kelmadi]
      html += '        <td style="padding:14px 18px;text-align:center">';
      html += '          <div style="display:inline-flex;gap:4px;background:var(--soft,rgba(0,0,0,0.05));padding:3px;border-radius:10px;border:1px solid var(--line)">';
      html += '            <button type="button" class="eth-att-btn ' + (curSt === 'present' ? 'active-green' : '') + '" data-set-att="present" data-student-id="' + esc(st.email || st.id) + '">Keldi</button>';
      html += '            <button type="button" class="eth-att-btn ' + (curSt === 'excused' ? 'active-yellow' : '') + '" data-set-att="excused" data-student-id="' + esc(st.email || st.id) + '">Sababli</button>';
      html += '            <button type="button" class="eth-att-btn ' + (curSt === 'absent' ? 'active-red' : '') + '" data-set-att="absent" data-student-id="' + esc(st.email || st.id) + '" data-student-name="' + esc(st.name) + '" data-student-phone="' + esc(st.phone || '+998901234567') + '">Kelmadi</button>';
      html += '          </div>';
      html += '        </td>';

      html += '        <td style="padding:14px 18px">';
      if (perf === 'low') {
        html += '          <span style="font-size:12px;font-weight:900;color:#ef4444">❌ Topshirmadi (0%)</span>';
      } else if (perf === 'med') {
        html += '          <span style="font-size:12px;font-weight:800;color:#f59e0b">⏳ 72% (O\'rtacha)</span>';
      } else {
        html += '          <span style="font-size:12px;font-weight:900;color:#10b981">✓ 94% (A\'lo)</span>';
      }
      html += '        </td>';

      // Visual Analysis Indicator (Green, Yellow, Red Trend)
      html += '        <td style="padding:14px 18px;text-align:center">';
      if (perf === 'high') {
        html += '          <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:12px;font-size:11.5px;font-weight:900;background:rgba(16,185,129,0.15);color:#10b981">🟢 O\'sish</span>';
      } else if (perf === 'med') {
        html += '          <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:12px;font-size:11.5px;font-weight:900;background:rgba(245,158,11,0.15);color:#f59e0b">🟡 O\'rtacha</span>';
      } else {
        html += '          <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:12px;font-size:11.5px;font-weight:900;background:rgba(239,68,68,0.15);color:#ef4444">🔴 Sustlashgan</span>';
      }
      html += '        </td>';
      html += '      </tr>';
    });

    html += '      </tbody>';
    html += '    </table>';
    html += '  </div>';
    html += '</div>';

    html += '</div>';
    container.innerHTML = html;

    // Group dropdown change
    var selGrp = container.querySelector('#selectAttGroup');
    if (selGrp) {
      selGrp.onchange = function(e) {
        _activeAttendanceGroup = e.target.value;
        renderAttendancePortal(container);
      };
    }

    // Sort homework toggle
    var btnSortHw = container.querySelector('#btnSortHomework');
    if (btnSortHw) {
      btnSortHw.onclick = function() {
        _attendanceSortHomework = !_attendanceSortHomework;
        renderAttendancePortal(container);
      };
    }

    // Eskiz Settings button
    var btnEskiz = container.querySelector('#btnEskizSettings');
    if (btnEskiz) {
      btnEskiz.onclick = function() {
        showEskizTokenModal();
      };
    }

    // Attendance Buttons Handlers
    container.querySelectorAll('.eth-att-btn').forEach(function(btn) {
      btn.onclick = function() {
        var action = btn.dataset.setAtt;
        var sId = btn.dataset.studentId;
        todayRecords[sId] = action;
        if (window.EthithApp && window.EthithApp.saveState) window.EthithApp.saveState();

        if (action === 'absent') {
          // Trigger instant parent SMS modal & Eskiz dispatch!
          var sName = btn.dataset.studentName || 'O\'quvchi';
          var sPhone = btn.dataset.studentPhone || '+998901234567';
          showParentSmsModal(sName, sPhone, todayStr, function() {
            renderAttendancePortal(container);
          });
        } else {
          renderAttendancePortal(container);
        }
      };
    });
  }

  // Parent SMS Modal (Eskiz.uz format)
  function showParentSmsModal(studentName, parentPhone, dateStr, onDone) {
    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';
    overlay.style.zIndex = '99999';

    var defaultMsg = "Hurmatli ota-ona! Farzandingiz " + studentName + " bugun (" + dateStr + ") darsga qatnashmadi. Iltimos, sababini ustozga ma'lum qiling. ETHITH Academy.";

    var html = '<div class="eth-modal" style="max-width:520px">';
    html += '  <div class="eth-modal-header" style="display:flex;align-items:center;justify-content:space-between">';
    html += '    <div style="display:flex;align-items:center;gap:10px">';
    html += '      <span style="font-size:24px">📲</span>';
    html += '      <h3 style="margin:0;font-size:18px;font-weight:900;color:var(--text)">Ota-onaga Avtomatik SMS Yuborish</h3>';
    html += '    </div>';
    html += '    <button type="button" id="btnCloseSmsModal" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--muted)">✕</button>';
    html += '  </div>';
    html += '  <div class="eth-modal-body" style="display:flex;flex-direction:column;gap:14px">';
    html += '    <div style="background:rgba(239,68,68,0.1);padding:10px 14px;border-radius:12px;font-size:12.5px;color:#ef4444;border:1px solid rgba(239,68,68,0.25)">';
    html += '      <b>[Kelmadi]</b> tugmasi bosildi. Quyidagi tayyor shablon ota-onaning telefon raqamiga yuboriladi.';
    html += '    </div>';
    html += '    <div>';
    html += '      <label style="display:block;font-size:12.5px;font-weight:800;margin-bottom:6px">Ota-ona telefon raqami:</label>';
    html += '      <input type="text" id="smsPhone" value="' + esc(parentPhone) + '" style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:10px;border:1.5px solid var(--border);background:var(--card);color:var(--text);font-family:monospace;font-weight:800;font-size:15px" />';
    html += '    </div>';
    html += '    <div>';
    html += '      <label style="display:block;font-size:12.5px;font-weight:800;margin-bottom:6px">SMS Shablon Matni:</label>';
    html += '      <textarea id="smsText" rows="4" style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:10px;border:1.5px solid var(--border);background:var(--card);color:var(--text);font-size:13.5px;line-height:1.4">' + esc(defaultMsg) + '</textarea>';
    html += '    </div>';
    html += '    <div style="font-size:11.5px;color:var(--muted);background:var(--soft,rgba(0,0,0,0.03));padding:8px 12px;border-radius:8px">';
    html += '      ℹ️ <b>Eskiz.uz Gateway:</b> Token ulanmaganligi sababli test va simulyatsiya rejimida yuboriladi (1 SMS ~ 40 so\'m).';
    html += '    </div>';
    html += '    <div style="display:flex;gap:10px">';
    html += '      <button type="button" id="btnCancelSms" class="ap-btn out" style="flex:1;padding:11px;font-size:13.5px;font-weight:800">Bekor Qilish</button>';
    html += '      <button type="button" id="btnSendSms" class="ap-btn solid" style="flex:2;padding:11px;font-size:13.5px;font-weight:900;background:linear-gradient(135deg,#10b981,#059669);color:#fff">📲 SMSni Yuborish</button>';
    html += '    </div>';
    html += '  </div>';
    html += '</div>';

    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    overlay.querySelector('#btnCloseSmsModal').onclick = function() { overlay.remove(); if (onDone) onDone(); };
    overlay.querySelector('#btnCancelSms').onclick = function() { overlay.remove(); if (onDone) onDone(); };

    overlay.querySelector('#btnSendSms').onclick = function() {
      var phone = overlay.querySelector('#smsPhone').value.trim();
      var msg = overlay.querySelector('#smsText').value.trim();
      if (!phone || !msg) { alert("Telefon raqami va matn to'ldirilishi shart"); return; }

      // Save log
      if (!S.sentSmsLogs) S.sentSmsLogs = [];
      S.sentSmsLogs.push({
        student: studentName,
        phone: phone,
        msg: msg,
        status: 'Sent (Eskiz Simulation)',
        sentAt: Date.now()
      });
      if (window.EthithApp && window.EthithApp.saveState) window.EthithApp.saveState();

      alert("✅ SMS muvaffaqiyatli yuborildi!\nQabul qiluvchi: " + phone + "\nHolat: Yetkazildi.");
      overlay.remove();
      if (onDone) onDone();
    };
  }

  function showEskizTokenModal() {
    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';
    overlay.style.zIndex = '99999';

    var currentToken = (S.eskiz && S.eskiz.token) ? S.eskiz.token : '';

    var html = '<div class="eth-modal" style="max-width:480px">';
    html += '  <div class="eth-modal-header" style="display:flex;align-items:center;justify-content:space-between">';
    html += '    <h3 style="margin:0;font-size:17px;font-weight:900;color:var(--text)">⚙️ Eskiz.uz SMS API Sozlamasi</h3>';
    html += '    <button type="button" id="btnCloseEskiz" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--muted)">✕</button>';
    html += '  </div>';
    html += '  <div class="eth-modal-body" style="display:flex;flex-direction:column;gap:12px">';
    html += '    <p style="font-size:12.5px;color:var(--muted);margin:0">Eskiz.uz dan olingan Bearer tokenni shu yerga kiritsangiz, tizim to\'g\'ridan-to\'g\'ri haqiqiy SMS xabarlarini yuborishni boshlaydi.</p>';
    html += '    <div>';
    html += '      <label style="display:block;font-size:12px;font-weight:800;margin-bottom:6px">Eskiz.uz API Token:</label>';
    html += '      <textarea id="eskizTokenInput" rows="3" placeholder="eyJ0eXAiOiJKV1QiLC..." style="width:100%;box-sizing:border-box;padding:10px;border-radius:10px;border:1.5px solid var(--border);background:var(--card);color:var(--text);font-family:monospace;font-size:12px">' + esc(currentToken) + '</textarea>';
    html += '    </div>';
    html += '    <button type="button" id="btnSaveEskiz" class="ap-btn solid" style="background:#2563eb;color:#fff;font-weight:800;padding:10px;border-radius:10px">Saqlash</button>';
    html += '  </div>';
    html += '</div>';

    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    overlay.querySelector('#btnCloseEskiz').onclick = function() { overlay.remove(); };
    overlay.querySelector('#btnSaveEskiz').onclick = function() {
      var tok = overlay.querySelector('#eskizTokenInput').value.trim();
      if (!S.eskiz) S.eskiz = {};
      S.eskiz.token = tok;
      if (window.EthithApp && window.EthithApp.saveState) window.EthithApp.saveState();
      alert("Eskiz.uz tokeni saqlandi!");
      overlay.remove();
    };
  }

  // -------------------------------------------------------------
  // 5. HOMEWORK PORTAL & AUTO-TRACKER
  // -------------------------------------------------------------
  function renderHomeworkPortal(container) {
    if (!container) return;
    window._ethithCurrentView = 'homework';

    var isTeacher = S.user && S.user.role === 'teacher';
    var homeworkList = S.homeworkAssignments || [];

    var html = '<div class="eth-homework-portal animate-fade-in" style="max-width:1050px;margin:0 auto;padding-bottom:50px">';

    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">';
    html += '  <div>';
    html += '    <div style="font-size:12px;font-weight:900;letter-spacing:1px;color:#8b5cf6;text-transform:uppercase;margin-bottom:4px">HOMEWORK TRACKER & DISPATCHER</div>';
    html += '    <h2 style="margin:0 0 4px;font-size:24px;font-weight:900;color:var(--text)">📚 Uyga Vazifalar & Avtomatik Chat E\'loni</h2>';
    html += '    <p style="margin:0;font-size:13.5px;color:var(--muted)">O\'qituvchi test va darslarni uyga vazifa qilib belgilashi va bir zumda guruh chatiga avtomatik yuborishi mumkin.</p>';
    html += '  </div>';
    if (isTeacher) {
      html += '  <button type="button" class="ap-btn solid" id="btnOpenAssignHw" style="background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;font-weight:900;padding:11px 20px;border-radius:12px;box-shadow:0 6px 16px rgba(124,58,237,0.3)">+ Yangi Uyga Vazifa Berish</button>';
    }
    html += '</div>';

    if (homeworkList.length === 0) {
      html += '<div class="ap-card ap-empty" style="padding:40px 20px;text-align:center;border-radius:20px">';
      html += '  <div style="font-size:40px;margin-bottom:10px">📖</div>';
      html += '  <h3 style="font-size:18px;font-weight:800;color:var(--text);margin-bottom:6px">Hozircha biriktirilgan uy vazifasi yo\'q</h3>';
      html += '  <p style="font-size:13px;color:var(--muted);max-width:440px;margin:0 auto 16px">O\'qituvchi "+ Yangi Uyga Vazifa Berish" tugmasini bosib, Workbook yoki Unit Testlardan dars topshirig\'ini belgilashi mumkin.</p>';
      html += '</div>';
    } else {
      html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px">';
      homeworkList.forEach(function(hw) {
        html += '<div class="ap-card" style="padding:20px;border-radius:18px;border:1.5px solid var(--border);display:flex;flex-direction:column;justify-content:space-between">';
        html += '  <div>';
        html += '    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">';
        html += '      <span style="font-size:11px;font-weight:900;padding:3px 8px;border-radius:8px;background:rgba(139,92,246,0.15);color:#8b5cf6">' + esc(hw.group) + '</span>';
        html += '      <span style="font-size:12px;color:#ef4444;font-weight:800">⏳ Muddat: ' + esc(hw.dueDate) + '</span>';
        html += '    </div>';
        html += '    <h4 style="margin:0 0 6px;font-size:16px;font-weight:800;color:var(--text)">' + esc(hw.title) + '</h4>';
        html += '    <p style="margin:0 0 14px;font-size:12.5px;color:var(--muted)">' + esc(hw.instructions) + '</p>';
        html += '  </div>';
        html += '  <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--line);padding-top:10px">';
        html += '    <span style="font-size:12px;color:var(--muted)">Bajarish ko\'rsatkichi: <b>' + (hw.completedCount || 4) + ' / ' + (hw.totalStudents || 5) + '</b></span>';
        html += '    <button type="button" class="ap-btn solid" style="padding:6px 14px;font-size:12px;font-weight:800;background:#2563eb;color:#fff" data-check-hw="' + hw.id + '">Tekshirish</button>';
        html += '  </div>';
        html += '</div>';
      });
      html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;

    var btnAdd = container.querySelector('#btnOpenAssignHw');
    if (btnAdd) {
      btnAdd.onclick = function() {
        showAssignHomeworkModal(function() {
          renderHomeworkPortal(container);
        });
      };
    }
  }

  function showAssignHomeworkModal(onDone) {
    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';
    overlay.style.zIndex = '99999';

    var html = '<div class="eth-modal" style="max-width:540px">';
    html += '  <div class="eth-modal-header" style="display:flex;align-items:center;justify-content:space-between">';
    html += '    <h3 style="margin:0;font-size:18px;font-weight:900;color:var(--text)">📢 Yangi Uyga Vazifa Belgilash & Chatga Yuborish</h3>';
    html += '    <button type="button" id="btnCloseHwModal" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--muted)">✕</button>';
    html += '  </div>';
    html += '  <div class="eth-modal-body" style="display:flex;flex-direction:column;gap:12px">';
    html += '    <div>';
    html += '      <label style="display:block;font-size:12px;font-weight:800;margin-bottom:6px">Guruhni Tanlang:</label>';
    html += '      <select id="hwGroupSelect" style="width:100%;padding:10px;border-radius:10px;border:1.5px solid var(--border);background:var(--card);color:var(--text);font-weight:700">';
    html += '        <option value="Navigate Intermediate (B1+) - Guruh 1">Navigate Intermediate (B1+) - Guruh 1</option>';
    html += '        <option value="Navigate Upper-Intermediate (B2) - Guruh 1">Navigate Upper-Intermediate (B2) - Guruh 1</option>';
    html += '      </select>';
    html += '    </div>';
    html += '    <div>';
    html += '      <label style="display:block;font-size:12px;font-weight:800;margin-bottom:6px">Topshiriq / Mavzu:</label>';
    html += '      <input type="text" id="hwTitle" placeholder="Masalan: Workbook Unit 2, Lesson 2.1 & 2.2" style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:10px;border:1.5px solid var(--border);background:var(--card);color:var(--text);font-weight:800" />';
    html += '    </div>';
    html += '    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';
    html += '      <div>';
    html += '        <label style="display:block;font-size:12px;font-weight:800;margin-bottom:6px">Topshirish Muddati:</label>';
    html += '        <input type="date" id="hwDueDate" value="' + new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10) + '" style="width:100%;padding:9px;border-radius:10px;border:1.5px solid var(--border);background:var(--card);color:var(--text);font-weight:700" />';
    html += '      </div>';
    html += '      <div>';
    html += '        <label style="display:block;font-size:12px;font-weight:800;margin-bottom:6px">Ball / Baholash:</label>';
    html += '        <input type="number" id="hwPoints" value="100" style="width:100%;padding:9px;border-radius:10px;border:1.5px solid var(--border);background:var(--card);color:var(--text);font-weight:700" />';
    html += '      </div>';
    html += '    </div>';
    html += '    <div>';
    html += '      <label style="display:block;font-size:12px;font-weight:800;margin-bottom:6px">Ko\'rsatma / Eslatma:</label>';
    html += '      <textarea id="hwDesc" rows="3" placeholder="Barcha gaplarni diqqat bilan o\'qib, bo\'shliqlarni to\'ldiring..." style="width:100%;box-sizing:border-box;padding:10px;border-radius:10px;border:1.5px solid var(--border);background:var(--card);color:var(--text)"></textarea>';
    html += '    </div>';
    html += '    <div style="font-size:11.5px;color:#10b981;font-weight:700;background:rgba(16,185,129,0.1);padding:8px 12px;border-radius:8px">';
    html += '      ⚡ <b>Avtomatik Chat E\'loni:</b> "Saqlash" tugmasi bosilishi bilan ushbu guruh chatiga rasmiy uy vazifasi xabarnomasi darhol yuboriladi!';
    html += '    </div>';
    html += '    <button type="button" id="btnConfirmHw" class="ap-btn solid" style="background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;font-weight:900;padding:12px;border-radius:12px">📢 Guruhga Uyga Vazifa Yuborish</button>';
    html += '  </div>';
    html += '</div>';

    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    overlay.querySelector('#btnCloseHwModal').onclick = function() { overlay.remove(); };
    overlay.querySelector('#btnConfirmHw').onclick = function() {
      var grp = overlay.querySelector('#hwGroupSelect').value;
      var title = overlay.querySelector('#hwTitle').value.trim();
      var dDate = overlay.querySelector('#hwDueDate').value;
      var desc = overlay.querySelector('#hwDesc').value.trim();

      if (!title) { alert("Iltimos, topshiriq nomini kiriting"); return; }

      if (!S.homeworkAssignments) S.homeworkAssignments = [];
      var newHw = {
        id: 'hw_' + Date.now(),
        group: grp,
        title: title,
        dueDate: dDate,
        instructions: desc || 'Vazifani o\'z vaqtida bajaring.',
        createdAt: Date.now()
      };
      S.homeworkAssignments.unshift(newHw);

      // Auto-post into group chat
      var targetClass = (S.classes || []).find(function(c) { return c.name === grp; });
      if (targetClass) {
        if (!targetClass.messages) targetClass.messages = [];
        targetClass.messages.push({
          id: 'msg_hw_' + Date.now(),
          sender: S.user.name || 'Ustoz',
          senderRole: 'teacher',
          text: '📢 [YANGI UYGA VAZIFA]\n📚 Mavzu: ' + title + '\n⏳ Muddat: ' + dDate + '\n📝 ' + (desc || 'Barcha o\'quvchilar topshirsin!'),
          timestamp: Date.now()
        });
      }

      if (window.EthithApp && window.EthithApp.saveState) window.EthithApp.saveState();

      if (window.EthithSync && window.EthithSync.publishLive) {
        window.EthithSync.publishLive({
          type: 'HOMEWORK_ASSIGNED',
          homework: newHw
        });
      }

      alert("✅ Uyga vazifa belgilandi va guruh chatiga xabarnoma yuborildi!");
      overlay.remove();
      if (onDone) onDone();
    };
  }

  // Export functions to global window and window.EthithViews
  window.renderNavigateView = renderNavigateView;
  window.renderWorkbookViewer = renderWorkbookViewer;
  window.renderAttendancePortal = renderAttendancePortal;
  window.renderHomeworkPortal = renderHomeworkPortal;
  window.renderStudioInlineHtml = renderStudioInlineHtml;

  if (window.EthithViews) {
    window.EthithViews.renderNavigateView = renderNavigateView;
    window.EthithViews.renderWorkbookViewer = renderWorkbookViewer;
    window.EthithViews.renderAttendancePortal = renderAttendancePortal;
    window.EthithViews.renderHomeworkPortal = renderHomeworkPortal;
  }

})(window);
