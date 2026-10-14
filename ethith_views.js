/**
 * ETHITH Extended View Renderers:
 * - Ask AI Teacher (ChatGPT UI with image/pdf upload)
 * - 40 Topics per Level (A1..C2) with Dynamic AI Quiz Solver
 * - Classes & Telegram Web Chat (Double-click reply, Long-press menu, Reactions with dynamic order, Pin & Delete)
 * - Exam System (PDF to Quiz, 6-digit code, Countdown timer, Live Leaderboard)
 * - 70-question Language Hub Placement Test
 * - Mistakes Notebook (Xatolar Daftari)
 */

(function(window) {
  'use strict';

  var App = window.EthithApp;
  var S = App.state;
  var ic = App.ic;
  var esc = App.esc;

  var currentReplyingMessage = null;
  var activeContextMenu = null;

  // Dismiss context menu on click outside
  document.addEventListener('click', function(e) {
    if (activeContextMenu && !activeContextMenu.contains(e.target)) {
      activeContextMenu.remove();
      activeContextMenu = null;
    }
  });

  // ==========================================
  // VIEW 1: ASK AI TEACHER (ChatGPT-like UI)
  // ==========================================
  function renderAskAITeacher(container) {
    var history = S.aiHistory || [];

    var html = '' +
      '<div class="ask-ai-container">' +
      '  <div class="ask-ai-sidebar">' +
      '    <button class="eth-btn-primary" id="aiNewChatBtn" style="margin-bottom:14px;padding:10px 14px;font-size:13.5px">' + ic('plus') + ' Yangi Suhbat</button>' +
      '    <div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em">Tavsiya So\'rovlar</div>' +
      '    <div style="display:flex;flex-direction:column;gap:6px;overflow-y:auto;flex:1">' +
      '      <button class="ap-item ai-prompt-pill" data-p="IELTS Speaking 7.0+ uchun namunaviy javob va foydali iboralar ber">' + ic('sparkles') + ' IELTS Speaking shablon</button>' +
      '      <button class="ap-item ai-prompt-pill" data-p="Present Perfect va Past Simple farqini 5 ta misol bilan tushuntir">' + ic('book') + ' Grammatika farqlari</button>' +
      '      <button class="ap-item ai-prompt-pill" data-p="Ingliz tilida 10 ta eng ko\'p ishlatiladigan phrasal verblar">' + ic('layers') + ' Phrasal Verblar</button>' +
      '      <button class="ap-item ai-prompt-pill" data-p="Ingliz tili darajamni qanday qilib tezroq oshirsam bo\'ladi?">' + ic('trophy') + ' O\'rganish maslahatlari</button>' +
      '    </div>' +
      '    <div style="padding-top:12px;border-top:1px solid var(--border);font-size:11.5px;color:var(--muted);text-align:center">' +
      '      <b>ETHITH AI Ustoz</b><br>Yaratuvchi: Muhammadyusuf Jo\'raboyev' +
      '    </div>' +
      '  </div>' +
      '  <div class="ask-ai-main">' +
      '    <div class="ask-ai-messages" id="aiMsgBox">' +
      (history.length === 0 ?
        '<div style="text-align:center;margin:auto;max-width:520px;padding:20px">' +
        '  <div style="font-size:44px;margin-bottom:10px">🤖</div>' +
        '  <h2 style="font-size:24px;font-weight:800;color:#1e293b;margin-bottom:8px">ETHITH AI Ustoz</h2>' +
        '  <p style="color:#64748b;font-size:14.5px;line-height:1.6">Ingliz tili grammatikasi, testlar, so\'zlar yoki boshqa fanlar bo\'yicha istalgan savolingizni bering. Rasm yoki hujjat (PDF) yuklashingiz ham mumkin!</p>' +
        '</div>' :
        history.map(function(m) {
          return '<div class="ask-ai-msg ' + m.role + '">' +
            '  <div class="ask-ai-avatar">' + (m.role === 'user' ? (S.user ? S.user.name.charAt(0).toUpperCase() : 'U') : 'AI') + '</div>' +
            '  <div class="ask-ai-bubble">' +
            (m.fileName ? '<div style="font-size:12px;background:rgba(0,0,0,0.06);padding:3px 8px;border-radius:6px;margin-bottom:6px">📎 ' + esc(m.fileName) + '</div>' : '') +
            (m.fileImg ? '<img src="' + m.fileImg + '" style="max-width:240px;border-radius:8px;margin-bottom:8px;display:block">' : '') +
            formatMarkdown(m.text) +
            '  </div>' +
            '</div>';
        }).join('')
      ) +
      '    </div>' +
      '    <div id="aiFilePreview" style="display:none;padding:6px 24px;background:var(--bg2);font-size:12.5px;border-top:1px solid var(--border);align-items:center;justify-content:space-between"></div>' +
      '    <div class="ask-ai-input-bar">' +
      '      <form id="aiChatForm" class="ask-ai-input-wrap">' +
      '        <label for="aiFileInput" class="ask-ai-btn" title="Rasm yoki hujjat biriktirish" style="cursor:pointer">' + ic('paperclip') + '</label>' +
      '        <input type="file" id="aiFileInput" style="display:none" accept="image/*,.pdf,.txt,.doc,.docx">' +
      '        <textarea id="aiPromptInput" rows="1" placeholder="ETHITH AI ga savol bering..." required></textarea>' +
      '        <button type="submit" class="ask-ai-btn ask-ai-send" title="Yuborish">' + ic('send') + '</button>' +
      '      </form>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    container.innerHTML = html;

    var msgBox = document.getElementById('aiMsgBox');
    msgBox.scrollTop = msgBox.scrollHeight;

    var fileInput = document.getElementById('aiFileInput');
    var filePreview = document.getElementById('aiFilePreview');
    var currentAttachment = null;

    fileInput.onchange = function(e) {
      var file = e.target.files[0];
      if (!file) return;

      var reader = new FileReader();
      if (file.type.startsWith('image/')) {
        reader.onload = function(ev) {
          var base64 = ev.target.result.split(',')[1];
          currentAttachment = {
            name: file.name,
            mimeType: file.type,
            base64: base64,
            previewUrl: ev.target.result
          };
          filePreview.style.display = 'flex';
          filePreview.innerHTML = '<span>🖼️ Rasm tanlandi: <b>' + esc(file.name) + '</b></span><button id="aiRemoveFile" style="background:none;border:none;cursor:pointer;color:red">✕</button>';
          document.getElementById('aiRemoveFile').onclick = function() {
            currentAttachment = null;
            filePreview.style.display = 'none';
            fileInput.value = '';
          };
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = function(ev) {
          currentAttachment = {
            name: file.name,
            mimeType: file.type || 'text/plain',
            textData: ev.target.result
          };
          filePreview.style.display = 'flex';
          filePreview.innerHTML = '<span>📄 Hujjat tanlandi: <b>' + esc(file.name) + '</b></span><button id="aiRemoveFile" style="background:none;border:none;cursor:pointer;color:red">✕</button>';
          document.getElementById('aiRemoveFile').onclick = function() {
            currentAttachment = null;
            filePreview.style.display = 'none';
            fileInput.value = '';
          };
        };
        reader.readAsText(file);
      }
    };

    document.getElementById('aiNewChatBtn').onclick = function() {
      S.aiHistory = [];
      App.saveState();
      renderAskAITeacher(container);
    };

    container.querySelectorAll('.ai-prompt-pill').forEach(function(btn) {
      btn.onclick = function() {
        document.getElementById('aiPromptInput').value = btn.dataset.p;
        document.getElementById('aiChatForm').dispatchEvent(new Event('submit'));
      };
    });

    document.getElementById('aiChatForm').onsubmit = async function(e) {
      e.preventDefault();
      var input = document.getElementById('aiPromptInput');
      var promptText = input.value.trim();
      if (!promptText && !currentAttachment) return;

      var userMsg = {
        role: 'user',
        text: promptText,
        fileName: currentAttachment ? currentAttachment.name : null,
        fileImg: currentAttachment ? currentAttachment.previewUrl : null
      };

      S.aiHistory.push(userMsg);
      input.value = '';
      var sentAttach = currentAttachment;
      currentAttachment = null;
      filePreview.style.display = 'none';
      fileInput.value = '';

      renderAskAITeacher(container);

      // Loading bubble
      var loadingBubble = document.createElement('div');
      loadingBubble.className = 'ask-ai-msg ai';
      loadingBubble.innerHTML = '<div class="ask-ai-avatar">AI</div><div class="ask-ai-bubble" style="opacity:0.7">ETHITH AI javob tayyorlamoqda...</div>';
      document.getElementById('aiMsgBox').appendChild(loadingBubble);
      document.getElementById('aiMsgBox').scrollTop = document.getElementById('aiMsgBox').scrollHeight;

      try {
        var replyText = await window.EthithAI.askAITeacher(promptText, S.aiHistory, sentAttach);
        loadingBubble.remove();
        S.aiHistory.push({
          role: 'ai',
          text: replyText
        });
        App.saveState();
        renderAskAITeacher(container);
      } catch (err) {
        loadingBubble.remove();
        alert("Xatolik yuz berdi: " + err.message);
      }
    };
  }

  function formatMarkdown(text) {
    if (!text) return '';
    var safe = esc(text);
    // Code blocks
    safe = safe.replace(/```([\s\S]*?)```/g, function(m, p1) {
      return '<pre style="background:#1e293b;color:#f8fafc;padding:12px;border-radius:10px;overflow-x:auto;margin:8px 0;font-size:13px"><code>' + p1 + '</code></pre>';
    });
    // Inline code
    safe = safe.replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.06);padding:2px 6px;border-radius:4px">$1</code>');
    // Bold
    safe = safe.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
    // Italics
    safe = safe.replace(/\*([^*]+)\*/g, '<i>$1</i>');
    // Newlines
    safe = safe.replace(/\n/g, '<br>');
    return safe;
  }

  // ==========================================
  // VIEW 2: LEVELS (A1 - C2) & 40 TOPICS
  // ==========================================
  function renderLevelsView(container, levelKey) {
    var curLevel = levelKey || S.level || 'A1';
    S.level = curLevel;
    var levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    var curriculum = window.ETHITH_CURRICULUM || {};
    var topics = curriculum[curLevel] || [];
    var unlockedCount = S.unlocked[curLevel] || 1;
    var isTeacher = S.user && S.user.role === 'teacher';

    var html = '' +
      '<div class="ap-sec" style="margin-top:0">' +
      '  <div>' +
      '    <h2>' + ic('layers') + ' CEFR Ingliz Tili Darajalari (40 ta Mavzu)</h2>' +
      '    <p>Har bir mavzuni 70% dan yuqori ball bilan tamomlang va keyingi bosqichni oching.</p>' +
      '  </div>' +
      (isTeacher ? '  <button class="ap-btn solid" id="tcAddTestBtn">' + ic('plus') + ' Yangi Test Qo\'shish</button>' : '') +
      '</div>' +
      '<div class="eth-tabs" style="margin:0 0 20px 0">' +
      levels.map(function(lv) {
        return '<button class="eth-tab ' + (lv === curLevel ? 'active' : '') + '" data-lvl="' + lv + '">' + lv + ' Daraja</button>';
      }).join('') +
      '</div>' +
      '<div style="font-size:14px;color:var(--muted);margin-bottom:12px">' +
      (isTeacher ? '<b>O\'qituvchi holati:</b> Barcha 40 ta mavzu ochiq.' : '<b>Ochilgan mavzular:</b> ' + unlockedCount + ' / 40') +
      '</div>' +
      '<div class="eth-topics-grid">';

    topics.forEach(function(t) {
      var isUnlocked = isTeacher || (t.num <= unlockedCount);
      html += '' +
        '<div class="eth-topic-card ' + (isUnlocked ? '' : 'locked') + '" data-topic-num="' + t.num + '" data-topic-title="' + esc(t.title) + '">' +
        '  <div class="eth-topic-top">' +
        '    <span class="eth-topic-badge">' + curLevel + ' · Mavzu ' + t.num + '</span>' +
        '    <span>' + (isUnlocked ? ic('unlock', 'text-success') : ic('lock', 'text-muted')) + '</span>' +
        '  </div>' +
        '  <h4>' + esc(t.title) + '</h4>' +
        '  <p>' + esc(t.desc) + '</p>' +
        '  <div style="margin-top:14px">' +
        (isUnlocked ?
          '<button class="ap-btn solid" style="width:100%;padding:8px 12px;font-size:13px">Testni Boshlash ' + ic('right') + '</button>' :
          '<span style="font-size:12px;color:var(--muted)">Oldingi mavzuni 70%+ bajaring</span>') +
        '  </div>' +
        '</div>';
    });

    html += '</div>';
    container.innerHTML = html;

    container.querySelectorAll('.eth-tab').forEach(function(tab) {
      tab.onclick = function() {
        renderLevelsView(container, tab.dataset.lvl);
      };
    });

    container.querySelectorAll('.eth-topic-card').forEach(function(card) {
      card.onclick = function() {
        if (card.classList.contains('locked')) {
          alert("Ushbu mavzu hali qulflangan! Oldingi mavzuni kamida 70% ball bilan bajaring.");
          return;
        }
        var topicNum = parseInt(card.dataset.topicNum, 10);
        var topicTitle = card.dataset.topicTitle;
        showQuizPromptModal(curLevel, topicNum, topicTitle, container);
      };
    });

    if (isTeacher) {
      var tcAddBtn = document.getElementById('tcAddTestBtn');
      if (tcAddBtn) {
        tcAddBtn.onclick = function() {
          showTeacherCustomTestModal(curLevel, container);
        };
      }
    }
  }

  // Quiz count prompt modal (25 to 50 questions)
  function showQuizPromptModal(level, topicNum, topicTitle, mainContainer) {
    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';
    overlay.innerHTML = '' +
      '<div class="eth-modal">' +
      '  <div class="eth-modal-header">' +
      '    <h2>' + level + ' · Mavzu ' + topicNum + '</h2>' +
      '    <p>' + esc(topicTitle) + '</p>' +
      '  </div>' +
      '  <div class="eth-modal-body">' +
      '    <div class="eth-form-group">' +
      '      <label>Nechta test yechmoqchisiz? (25 dan 50 tagacha):</label>' +
      '      <div style="display:flex;align-items:center;gap:14px;margin-top:8px">' +
      '        <input type="range" id="quizCountSlider" min="25" max="50" value="25" step="5" style="flex:1">' +
      '        <b id="quizCountVal" style="font-size:18px;color:#2563eb;min-width:36px;text-align:right">25</b>' +
      '      </div>' +
      '    </div>' +
      '    <div style="background:var(--bg2);padding:12px;border-radius:12px;font-size:13px;color:var(--muted);margin-bottom:20px">' +
      '      💡 ETHITH AI siz tanlagan hajmda avtomatik ravishda original viktorina testlarini tuzib beradi. O\'tish bali: <b>70%</b>.' +
      '    </div>' +
      '    <div style="display:flex;gap:10px">' +
      '      <button class="ap-btn out" id="quizPromptCancel" style="flex:1">Bekor qilish</button>' +
      '      <button class="eth-btn-primary" id="quizPromptStart" style="flex:2">Testni Boshlash ' + ic('right') + '</button>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    document.body.appendChild(overlay);

    var slider = overlay.querySelector('#quizCountSlider');
    var valDisplay = overlay.querySelector('#quizCountVal');
    slider.oninput = function() {
      valDisplay.textContent = slider.value;
    };

    overlay.querySelector('#quizPromptCancel').onclick = function() {
      overlay.remove();
    };

    overlay.querySelector('#quizPromptStart').onclick = async function() {
      var count = parseInt(slider.value, 10) || 25;
      overlay.innerHTML = '' +
        '<div class="eth-modal" style="text-align:center;padding:40px 24px">' +
        '  <div style="font-size:42px;margin-bottom:14px">⚙️</div>' +
        '  <h3 style="font-size:20px;color:var(--eth-primary)">ETHITH AI test tuzmoqda...</h3>' +
        '  <p style="color:var(--muted);font-size:14px">' + level + ' · ' + esc(topicTitle) + ' bo\'yicha ' + count + ' ta original test savollari tayyorlanmoqda. Biroz kuting...</p>' +
        '</div>';

      try {
        var questions = await window.EthithAI.generateTopicQuiz(level, topicNum, topicTitle, count);
        overlay.remove();
        startTopicQuizRunner(level, topicNum, topicTitle, questions, mainContainer);
      } catch (err) {
        overlay.remove();
        alert("Xatolik yuz berdi: " + err.message + "\nIltimos, qaytadan urinib ko'ring.");
      }
    };
  }

  // Quiz runner for generated questions
  function startTopicQuizRunner(level, topicNum, topicTitle, questions, mainContainer) {
    var state = {
      i: 0,
      score: 0,
      answered: false,
      answers: []
    };

    function renderQuestion() {
      if (state.i >= questions.length) {
        renderQuizResult();
        return;
      }

      var q = questions[state.i];
      state.answered = false;

      var html = '' +
        '<div class="ap-quiz">' +
        '  <div class="ap-qtop">' +
        '    <button class="ap-ib" id="quizExitBtn">' + ic('x') + '</button>' +
        '    <div class="ap-bar"><i style="width:' + ((state.i / questions.length) * 100) + '%"></i></div>' +
        '    <b>' + (state.i + 1) + ' / ' + questions.length + '</b>' +
        '  </div>' +
        '  <div class="ap-qbox">' +
        '    <div class="qn">' + level + ' · Mavzu ' + topicNum + ' · Savol ' + (state.i + 1) + '</div>' +
        '    <h2>' + esc(q.question) + '</h2>' +
        '    <div id="quizOptionsBox">' +
        q.options.map(function(opt, idx) {
          return '<button class="ap-opt" data-opt="' + esc(opt) + '"><span class="l">' + 'ABCD'[idx] + '</span>' + esc(opt) + '</button>';
        }).join('') +
        '    </div>' +
        '    <div id="quizFeedbackBox" style="margin-top:14px"></div>' +
        '  </div>' +
        '</div>';

      mainContainer.innerHTML = html;

      document.getElementById('quizExitBtn').onclick = function() {
        if (confirm("Testni to'xtatmoqchimisiz? Natijalar saqlanmaydi.")) {
          renderLevelsView(mainContainer, level);
        }
      };

      var optionBtns = mainContainer.querySelectorAll('.ap-opt');
      optionBtns.forEach(function(btn) {
        btn.onclick = function() {
          if (state.answered) return;
          state.answered = true;
          var selected = btn.dataset.opt;
          var isCorrect = (selected === q.answer);

          optionBtns.forEach(function(b) {
            b.disabled = true;
            if (b.dataset.opt === q.answer) b.classList.add('ok');
          });

          if (isCorrect) {
            state.score++;
          } else {
            btn.classList.add('no');
            // Log to mistakes notebook
            S.mistakes.push({
              level: level,
              topic: topicTitle,
              question: q.question,
              yourAnswer: selected,
              correctAnswer: q.answer,
              explanation: q.explanation,
              date: new Date().toLocaleDateString()
            });
            App.saveState();
          }

          var feedbackBox = document.getElementById('quizFeedbackBox');
          feedbackBox.innerHTML = '' +
            '<div style="background:' + (isCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)') + ';padding:12px 16px;border-radius:12px;margin-bottom:14px;border:1px solid ' + (isCorrect ? '#22c55e' : '#ef4444') + '">' +
            '  <b style="color:' + (isCorrect ? '#16a34a' : '#ef4444') + '">' + (isCorrect ? '✓ To\'g\'ri!' : '✗ Noto\'g\'ri') + '</b>' +
            '  <p style="margin:6px 0 0;font-size:13.5px;color:var(--text)">' + esc(q.explanation) + '</p>' +
            '</div>' +
            '<button class="ap-btn solid" id="quizNextBtn">' + (state.i === questions.length - 1 ? 'Natijani ko\'rish' : 'Keyingi savol') + ' ' + ic('right') + '</button>';

          document.getElementById('quizNextBtn').onclick = function() {
            state.i++;
            renderQuestion();
          };
        };
      });
    }

    function renderQuizResult() {
      var pct = Math.round((state.score / questions.length) * 100);
      var passed = pct >= 70;

      if (passed) {
        S.unlocked[level] = Math.max(S.unlocked[level] || 1, topicNum + 1);
        App.saveState();
      }

      var html = '' +
        '<div class="ap-res">' +
        '  <div class="ap-ring">' +
        '    <svg viewBox="0 0 104 104">' +
        '      <circle class="bg" cx="52" cy="52" r="46"/>' +
        '      <circle class="fg" cx="52" cy="52" r="46" style="stroke-dashoffset:' + (289 - (289 * pct) / 100) + '"/>' +
        '    </svg>' +
        '    <div class="c"><b>' + pct + '%</b><span>' + state.score + '/' + questions.length + '</span></div>' +
        '  </div>' +
        '  <h2>' + (passed ? 'Tabriklaymiz! Siz o\'tdingiz!' : 'Deyarli erishdingiz!') + '</h2>' +
        '  <p>' + (passed ?
          'Siz ' + level + ' darajasidagi ' + topicNum + '-mavzuni muvaffaqiyatli topshirdingiz va keyingi mavzu ochildi!' :
          'Keyingi mavzuni ochish uchun kamida 70% to\'plashingiz kerak. Xatolar daftarini ko\'rib chiqib, qaytadan urinib ko\'ring.') + '</p>' +
        '  <div class="acts">' +
        '    <button class="ap-btn out" id="resBackLevelsBtn">Mavzular ro\'yxati</button>' +
        (passed && topicNum < 40 ? '<button class="ap-btn solid" id="resNextTopicBtn">Keyingi mavzu ' + ic('right') + '</button>' : '') +
        '    <button class="ap-btn solid" id="resRetryBtn">' + ic('clip') + ' Qaytadan topshirish</button>' +
        '  </div>' +
        '</div>';

      mainContainer.innerHTML = html;

      document.getElementById('resBackLevelsBtn').onclick = function() {
        renderLevelsView(mainContainer, level);
      };
      document.getElementById('resRetryBtn').onclick = function() {
        showQuizPromptModal(level, topicNum, topicTitle, mainContainer);
      };
      var nextBtn = document.getElementById('resNextTopicBtn');
      if (nextBtn) {
        nextBtn.onclick = function() {
          var curriculum = window.ETHITH_CURRICULUM || {};
          var topics = curriculum[level] || [];
          var nextTopic = topics.find(function(x) { return x.num === topicNum + 1; });
          if (nextTopic) {
            showQuizPromptModal(level, nextTopic.num, nextTopic.title, mainContainer);
          } else {
            renderLevelsView(mainContainer, level);
          }
        };
      }
    }

    renderQuestion();
  }

  // Teacher custom test creator modal
  function showTeacherCustomTestModal(level, mainContainer) {
    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';
    overlay.innerHTML = '' +
      '<div class="eth-modal">' +
      '  <div class="eth-modal-header">' +
      '    <h2>Yangi Test / Viktorina Yaratish</h2>' +
      '    <p>O\'qituvchi yozma savollari yoki matnidan AI orqali test tuzish</p>' +
      '  </div>' +
      '  <div class="eth-modal-body">' +
      '    <form id="tcCustomTestForm">' +
      '      <div class="eth-form-group">' +
      '        <label>Mavzu Nomi</label>' +
      '        <input type="text" id="tcTestTitle" placeholder="Masalan: Passive Voice Special Rules" required>' +
      '      </div>' +
      '      <div class="eth-form-group">' +
      '        <label>Savollar Matni / Qo\'llanma</label>' +
      '        <textarea id="tcTestContent" rows="5" placeholder="Savollar, gaplar yoki konspekt matnini bu yerga joylang..." required></textarea>' +
      '      </div>' +
      '      <div class="eth-form-group">' +
      '        <label>Savollar Soni</label>' +
      '        <input type="number" id="tcTestCount" value="25" min="10" max="50">' +
      '      </div>' +
      '      <div style="display:flex;gap:10px">' +
      '        <button type="button" class="ap-btn out" id="tcCancelBtn" style="flex:1">Bekor qilish</button>' +
      '        <button type="submit" class="eth-btn-primary" style="flex:2">AI Bilan Yaratish ' + ic('right') + '</button>' +
      '      </div>' +
      '    </form>' +
      '  </div>' +
      '</div>';

    document.body.appendChild(overlay);

    overlay.querySelector('#tcCancelBtn').onclick = function() {
      overlay.remove();
    };

    overlay.querySelector('#tcCustomTestForm').onsubmit = async function(e) {
      e.preventDefault();
      var title = document.getElementById('tcTestTitle').value.trim();
      var content = document.getElementById('tcTestContent').value.trim();
      var count = parseInt(document.getElementById('tcTestCount').value, 10) || 25;

      overlay.innerHTML = '' +
        '<div class="eth-modal" style="text-align:center;padding:40px 24px">' +
        '  <div style="font-size:42px;margin-bottom:14px">⚙️</div>' +
        '  <h3 style="font-size:20px;color:var(--eth-primary)">ETHITH AI viktorinaga aylantirmoqda...</h3>' +
        '  <p style="color:var(--muted);font-size:14px">Kiritilgan matndan viktorina testlari tuzilmoqda. Biroz kuting...</p>' +
        '</div>';

      try {
        var questions = await window.EthithAI.generateExamFromContent(content, count);
        overlay.remove();
        alert("Viktorina muvaffaqiyatli yaratildi! " + questions.length + " ta savol tayyor.");
        startTopicQuizRunner(level, 99, title, questions, mainContainer);
      } catch (err) {
        overlay.remove();
        alert("Xatolik yuz berdi: " + err.message);
      }
    };
  }

  // ==========================================
  // VIEW 3: CLASSES (SINFLAR) & TELEGRAM CHAT
  // ==========================================
  function renderClassesView(container) {
    var isTeacher = S.user && S.user.role === 'teacher';
    var userClasses = S.classes.filter(function(c) {
      if (isTeacher) return c.teacherId === S.user.id || c.teacherEmail === S.user.email;
      return c.students && c.students.some(function(s) { return s.id === S.user.id || s.email === S.user.email; });
    });

    if (S.activeClassId) {
      var activeCls = S.classes.find(function(c) { return c.id === S.activeClassId; });
      if (activeCls) {
        renderClassDetail(container, activeCls);
        return;
      }
    }

    var html = '' +
      '<div class="ap-sec" style="margin-top:0">' +
      '  <div>' +
      '    <h2>' + ic('users') + ' Sinflar Tizimi</h2>' +
      '    <p>' + (isTeacher ? 'O\'z sinflaringizni yarating, o\'quvchilar natijalarini kuzating va Telegram chat orqali bog\'laning.' : 'O\'qituvchingiz bergan 10 xonali kod orqali sinfga qo\'shiling.') + '</p>' +
      '  </div>' +
      (isTeacher ?
        '  <button class="eth-btn-primary" id="btnCreateClass" style="width:auto;padding:10px 18px">' + ic('plus') + ' Yangi Sinf Yaratish</button>' :
        '  <button class="eth-btn-primary" id="btnJoinClass" style="width:auto;padding:10px 18px">' + ic('right') + ' Sinfga Qo\'shilish</button>') +
      '</div>';

    if (userClasses.length === 0) {
      html += '<div class="ap-card ap-empty">' + ic('users') + '<h2>Siz hali hech qaysi sinfga a\'zo emassiz</h2><p>' + (isTeacher ? 'Yangi sinf yarating va kodini o\'quvchilarga bering.' : 'Ustozingiz bergan kod bilan sinfga qo\'shiling.') + '</p></div>';
    } else {
      html += '<div class="ap-grid g2">';
      userClasses.forEach(function(c) {
        html += '' +
          '<div class="ap-card" style="cursor:pointer;transition:transform 0.2s" data-cls-id="' + c.id + '">' +
          '  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">' +
          '    <span class="ap-tag">' + (c.students ? c.students.length : 0) + ' ta o\'quvchi</span>' +
          '    <span style="font-family:monospace;font-weight:700;color:#2563eb;background:rgba(37,99,235,0.08);padding:4px 8px;border-radius:6px">Kod: ' + c.code + '</span>' +
          '  </div>' +
          '  <h3 style="font-size:18px;margin-bottom:6px">' + esc(c.name) + '</h3>' +
          '  <p style="color:var(--muted);font-size:13px;margin:0 0 14px">Ustoz: ' + esc(c.teacherName || 'Ustoz') + '</p>' +
          '  <button class="ap-btn solid" style="width:100%">' + ic('msg') + ' Sinf Chatiga Kirish ' + ic('right') + '</button>' +
          '</div>';
      });
      html += '</div>';
    }

    container.innerHTML = html;

    container.querySelectorAll('[data-cls-id]').forEach(function(card) {
      card.onclick = function() {
        S.activeClassId = card.dataset.clsId;
        App.saveState();
        renderClassesView(container);
      };
    });

    if (isTeacher) {
      var createBtn = document.getElementById('btnCreateClass');
      if (createBtn) {
        createBtn.onclick = function() {
          showCreateClassModal(container);
        };
      }
    } else {
      var joinBtn = document.getElementById('btnJoinClass');
      if (joinBtn) {
        joinBtn.onclick = function() {
          showJoinClassModal(container);
        };
      }
    }
  }

  function showCreateClassModal(container) {
    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';
    overlay.innerHTML = '' +
      '<div class="eth-modal">' +
      '  <div class="eth-modal-header">' +
      '    <h2>Yangi Sinf Yaratish</h2>' +
      '    <p>O\'quvchilar uchun 10 xonali kod bilan yangi sinf oching</p>' +
      '  </div>' +
      '  <div class="eth-modal-body">' +
      '    <form id="createClassForm">' +
      '      <div class="eth-form-group">' +
      '        <label>Sinf Nomi</label>' +
      '        <input type="text" id="clsName" placeholder="Masalan: IELTS 7.5 Intensive" required>' +
      '      </div>' +
      '      <button type="submit" class="eth-btn-primary">Sinfni Faollashtirish ' + ic('right') + '</button>' +
      '    </form>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.querySelector('#createClassForm').onsubmit = function(e) {
      e.preventDefault();
      var name = document.getElementById('clsName').value.trim();
      var code = 'ETH-' + Math.random().toString(36).substr(2, 6).toUpperCase();

      var newCls = {
        id: 'cls_' + Date.now(),
        name: name,
        code: code,
        teacherId: S.user.id,
        teacherName: S.user.name,
        teacherEmail: S.user.email,
        students: [],
        messages: [
          {
            id: 'msg_init',
            senderId: S.user.id,
            senderName: S.user.name,
            text: 'Assalomu alaykum! Sinfimizga xush kelibsiz. Bu yerda bir-birimiz bilan fikr almashamiz va savollarni muhokama qilamiz.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            reactions: {}
          }
        ],
        pinnedId: null
      };

      S.classes.push(newCls);
      S.activeClassId = newCls.id;
      App.saveState();
      overlay.remove();
      renderClassesView(container);
    };
  }

  function showJoinClassModal(container) {
    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';
    overlay.innerHTML = '' +
      '<div class="eth-modal">' +
      '  <div class="eth-modal-header">' +
      '    <h2>Sinfga Qo\'shilish</h2>' +
      '    <p>O\'qituvchingiz taqdim etgan 10 xonali kodni kiriting</p>' +
      '  </div>' +
      '  <div class="eth-modal-body">' +
      '    <form id="joinClassForm">' +
      '      <div class="eth-form-group">' +
      '        <label>10 xonali Sinf Kodi</label>' +
      '        <input type="text" id="joinClsCode" placeholder="Masalan: ETH-A7K92P" style="text-transform:uppercase" required>' +
      '      </div>' +
      '      <button type="submit" class="eth-btn-primary">Qo\'shilish ' + ic('right') + '</button>' +
      '    </form>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.querySelector('#joinClassForm').onsubmit = function(e) {
      e.preventDefault();
      var code = document.getElementById('joinClsCode').value.trim().toUpperCase();
      var found = S.classes.find(function(c) { return c.code === code; });

      if (!found) {
        alert("Bunday kodli sinf topilmadi. Iltimos, kodni tekshirib qayta kiriting.");
        return;
      }

      if (!found.students) found.students = [];
      var already = found.students.some(function(s) { return s.id === S.user.id || s.email === S.user.email; });

      if (!already) {
        found.students.push({
          id: S.user.id,
          name: S.user.name,
          email: S.user.email,
          dailyMinutes: S.user.dailyMinutes || 0,
          mistakes: S.mistakes.length
        });
      }

      S.activeClassId = found.id;
      App.saveState();
      overlay.remove();
      renderClassesView(container);
    };
  }

  // Telegram Style Chat inside Class
  function renderClassDetail(container, cls) {
    var isTeacher = S.user && S.user.role === 'teacher';
    var pinnedMsg = cls.messages.find(function(m) { return m.id === cls.pinnedId; });

    var html = '' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
      '  <button class="ap-back" id="backClassesListBtn" style="margin:0">' + ic('left') + ' Sinflar ro\'yxati</button>' +
      (isTeacher ? '  <button class="ap-btn out" id="clsMonitoringBtn">' + ic('user') + ' O\'quvchilar monitoringi (' + (cls.students ? cls.students.length : 0) + ')</button>' : '') +
      '</div>' +
      '<div class="tg-chat-wrap">' +
      '  <div class="tg-header">' +
      '    <div class="tg-header-info">' +
      '      <div class="tg-header-avatar">' + cls.name.charAt(0).toUpperCase() + '</div>' +
      '      <div class="tg-header-title">' +
      '        <h3>' + esc(cls.name) + '</h3>' +
      '        <span>' + (cls.students ? cls.students.length : 0) + ' a\'zo · Kod: <b style="color:#2563eb;user-select:all">' + cls.code + '</b></span>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      (pinnedMsg ?
        '<div class="tg-pinned-bar" id="tgPinnedBar">' +
        '  <div>' + ic('pin') + ' <b>Qadalgan xabar:</b> ' + esc(pinnedMsg.senderName) + ': "' + esc(pinnedMsg.text.slice(0, 50)) + '..."</div>' +
        (isTeacher ? '  <button id="tgUnpinBtn" style="background:none;border:none;cursor:pointer;color:var(--muted)">✕</button>' : '') +
        '</div>' : '') +
      '  <div class="tg-messages-scroll" id="tgMsgBox">' +
      cls.messages.map(function(m) {
        var isOwn = (m.senderId === S.user.id || m.senderEmail === S.user.email);
        var reactionsList = [];
        if (m.reactions) {
          for (var em in m.reactions) {
            if (m.reactions[em] && m.reactions[em].length > 0) {
              reactionsList.push({ emoji: em, count: m.reactions[em].length });
            }
          }
        }

        return '' +
          '<div class="tg-msg-row ' + (isOwn ? 'out' : 'in') + '" data-msg-id="' + m.id + '">' +
          '  <div class="tg-bubble" data-msg-id="' + m.id + '">' +
          (m.replyTo ?
            '<div class="tg-reply-quote">' +
            '  <b>' + esc(m.replyTo.senderName) + '</b>' +
            '  <span>' + esc(m.replyTo.text.slice(0, 60)) + '</span>' +
            '</div>' : '') +
          (!isOwn ? '<div class="tg-msg-sender">' + esc(m.senderName) + '</div>' : '') +
          '    <div class="tg-msg-text">' + esc(m.text) + '</div>' +
          '    <div class="tg-msg-meta">' + m.time + (isOwn ? ' ✓✓' : '') + '</div>' +
          (reactionsList.length > 0 ?
            '<div class="tg-reactions-badge">' +
            reactionsList.map(function(r) {
              return '<span class="tg-reaction-pill">' + r.emoji + ' ' + r.count + '</span>';
            }).join('') +
            '</div>' : '') +
          '  </div>' +
          '</div>';
      }).join('') +
      '  </div>' +
      '  <div class="tg-reply-bar" id="tgReplyBar" style="display:none">' +
      '    <div id="tgReplyBarText"></div>' +
      '    <button id="tgReplyCancelBtn" style="background:none;border:none;cursor:pointer;color:red">✕</button>' +
      '  </div>' +
      '  <div class="tg-input-area">' +
      '    <input type="text" id="tgInputText" placeholder="Xabar yozing..." autocomplete="off">' +
      '    <button class="eth-btn-primary" id="tgSendBtn" style="width:40px;height:40px;border-radius:50%;padding:0">' + ic('send') + '</button>' +
      '  </div>' +
      '</div>';

    container.innerHTML = html;

    var msgBox = document.getElementById('tgMsgBox');
    msgBox.scrollTop = msgBox.scrollHeight;

    document.getElementById('backClassesListBtn').onclick = function() {
      S.activeClassId = null;
      App.saveState();
      renderClassesView(container);
    };

    var monitorBtn = document.getElementById('clsMonitoringBtn');
    if (monitorBtn) {
      monitorBtn.onclick = function() {
        showClassMonitoringModal(cls);
      };
    }

    var unpinBtn = document.getElementById('tgUnpinBtn');
    if (unpinBtn) {
      unpinBtn.onclick = function(e) {
        e.stopPropagation();
        cls.pinnedId = null;
        App.saveState();
        renderClassDetail(container, cls);
      };
    }

    // Double-click to Reply
    container.querySelectorAll('.tg-bubble').forEach(function(bubble) {
      bubble.ondblclick = function(e) {
        e.stopPropagation();
        var msgId = bubble.dataset.msgId;
        var msg = cls.messages.find(function(m) { return m.id === msgId; });
        if (!msg) return;

        currentReplyingMessage = msg;
        var replyBar = document.getElementById('tgReplyBar');
        var replyText = document.getElementById('tgReplyBarText');
        replyBar.style.display = 'flex';
        replyText.innerHTML = ic('reply') + ' <b>Javob berilmoqda: ' + esc(msg.senderName) + '</b>: "' + esc(msg.text.slice(0, 45)) + '..."';
        document.getElementById('tgInputText').focus();
      };

      // Long press (touch) & Right click (context menu)
      var touchTimer = null;
      bubble.addEventListener('touchstart', function(e) {
        touchTimer = setTimeout(function() {
          showContextMenu(e.touches[0].clientX, e.touches[0].clientY, bubble.dataset.msgId, cls, container);
        }, 550);
      }, { passive: true });

      bubble.addEventListener('touchend', function() {
        clearTimeout(touchTimer);
      });

      bubble.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showContextMenu(e.clientX, e.clientY, bubble.dataset.msgId, cls, container);
      });
    });

    document.getElementById('tgReplyCancelBtn').onclick = function() {
      currentReplyingMessage = null;
      document.getElementById('tgReplyBar').style.display = 'none';
    };

    // Send Message
    function sendMessage() {
      var input = document.getElementById('tgInputText');
      var text = input.value.trim();
      if (!text) return;

      var newMsg = {
        id: 'msg_' + Date.now(),
        senderId: S.user.id,
        senderName: S.user.name,
        senderEmail: S.user.email,
        text: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        replyTo: currentReplyingMessage ? {
          id: currentReplyingMessage.id,
          senderName: currentReplyingMessage.senderName,
          text: currentReplyingMessage.text
        } : null,
        reactions: {}
      };

      cls.messages.push(newMsg);
      currentReplyingMessage = null;
      input.value = '';
      App.saveState();
      renderClassDetail(container, cls);
    }

    document.getElementById('tgSendBtn').onclick = sendMessage;
    document.getElementById('tgInputText').onkeydown = function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    };
  }

  // Telegram Context Menu: Reactions, Reply, Pin, Delete
  function showContextMenu(x, y, msgId, cls, mainContainer) {
    if (activeContextMenu) activeContextMenu.remove();

    var msg = cls.messages.find(function(m) { return m.id === msgId; });
    if (!msg) return;

    var menu = document.createElement('div');
    menu.className = 'tg-context-menu';

    // Position menu within viewport
    var posX = Math.min(x, window.innerWidth - 220);
    var posY = Math.min(y, window.innerHeight - 250);
    menu.style.left = posX + 'px';
    menu.style.top = posY + 'px';

    var quickEmojis = S.quickReactions || ['👍', '❤️', '🔥', '👏', '🎉', '🤩', '🚀', '💯'];

    var html = '' +
      '<div class="tg-context-reactions">' +
      quickEmojis.slice(0, 6).map(function(em) {
        return '<button class="tg-context-reaction-btn" data-em="' + em + '">' + em + '</button>';
      }).join('') +
      '  <button class="tg-context-reaction-btn" id="tgMoreEmojisBtn" title="Barcha emojilar">➕</button>' +
      '</div>' +
      '<button class="tg-context-item" id="ctxReplyBtn">' + ic('reply') + ' Javob yozish (Reply)</button>' +
      '<button class="tg-context-item" id="ctxPinBtn">' + ic('pin') + ' Xabarni qadash (Pin)</button>' +
      '<button class="tg-context-item danger" id="ctxDeleteBtn">' + ic('trash') + ' Tubdan o\'chirish (Delete)</button>';

    menu.innerHTML = html;
    document.body.appendChild(menu);
    activeContextMenu = menu;

    // Apply Reaction
    menu.querySelectorAll('[data-em]').forEach(function(btn) {
      btn.onclick = function() {
        applyReaction(btn.dataset.em, msg, cls, mainContainer);
        menu.remove();
        activeContextMenu = null;
      };
    });

    menu.querySelector('#tgMoreEmojisBtn').onclick = function() {
      showAllEmojisPicker(posX, posY, msg, cls, mainContainer);
    };

    menu.querySelector('#ctxReplyBtn').onclick = function() {
      currentReplyingMessage = msg;
      var replyBar = document.getElementById('tgReplyBar');
      var replyText = document.getElementById('tgReplyBarText');
      if (replyBar && replyText) {
        replyBar.style.display = 'flex';
        replyText.innerHTML = ic('reply') + ' <b>Javob berilmoqda: ' + esc(msg.senderName) + '</b>: "' + esc(msg.text.slice(0, 45)) + '..."';
        document.getElementById('tgInputText').focus();
      }
      menu.remove();
      activeContextMenu = null;
    };

    menu.querySelector('#ctxPinBtn').onclick = function() {
      cls.pinnedId = msg.id;
      App.saveState();
      menu.remove();
      activeContextMenu = null;
      renderClassDetail(mainContainer, cls);
    };

    menu.querySelector('#ctxDeleteBtn').onclick = function() {
      if (confirm("Ushbu xabarni tubdan o'chirib tashlamoqchimisiz?")) {
        cls.messages = cls.messages.filter(function(m) { return m.id !== msg.id; });
        if (cls.pinnedId === msg.id) cls.pinnedId = null;
        App.saveState();
        menu.remove();
        activeContextMenu = null;
        renderClassDetail(mainContainer, cls);
      }
    };
  }

  // Apply Reaction & Reorder Emojis
  function applyReaction(emoji, msg, cls, mainContainer) {
    if (!msg.reactions) msg.reactions = {};
    if (!msg.reactions[emoji]) msg.reactions[emoji] = [];

    var userId = S.user.id;
    var idx = msg.reactions[emoji].indexOf(userId);
    if (idx > -1) {
      msg.reactions[emoji].splice(idx, 1);
    } else {
      msg.reactions[emoji].push(userId);
    }

    // Requirement: "ohirgi martta qaysibiri reaksiya bosilgan bo'lsa o'sha reaksiya tartibda birinchiga o'tib qoladi"
    var qr = S.quickReactions || [];
    var qIdx = qr.indexOf(emoji);
    if (qIdx > -1) qr.splice(qIdx, 1);
    qr.unshift(emoji);
    S.quickReactions = qr;

    App.saveState();
    renderClassDetail(mainContainer, cls);
  }

  // Full Emoji Picker Modal
  function showAllEmojisPicker(x, y, msg, cls, mainContainer) {
    if (activeContextMenu) activeContextMenu.remove();

    var picker = document.createElement('div');
    picker.className = 'tg-context-menu';
    picker.style.left = Math.min(x, window.innerWidth - 260) + 'px';
    picker.style.top = Math.min(y, window.innerHeight - 280) + 'px';
    picker.style.maxWidth = '250px';

    var allEmojis = ['👍', '❤️', '🔥', '👏', '🎉', '🤩', '🚀', '💯', '🤝', '💡', '😂', '🥳', '🤔', '😢', '🙏', '🎯', '✨', '🧠', '📚', '✍️', '🙌', '💪', '🏆', '⭐'];

    picker.innerHTML = '' +
      '<div style="font-size:12px;font-weight:700;color:var(--muted);padding:4px 6px">Barcha emojilar:</div>' +
      '<div style="display:grid;grid-template-columns:repeat(6, 1fr);gap:6px;padding:6px">' +
      allEmojis.map(function(em) {
        return '<button class="tg-context-reaction-btn" data-full-em="' + em + '">' + em + '</button>';
      }).join('') +
      '</div>';

    document.body.appendChild(picker);
    activeContextMenu = picker;

    picker.querySelectorAll('[data-full-em]').forEach(function(btn) {
      btn.onclick = function() {
        applyReaction(btn.dataset.fullEm, msg, cls, mainContainer);
        picker.remove();
        activeContextMenu = null;
      };
    });
  }

  // Teacher Class Monitoring Modal
  function showClassMonitoringModal(cls) {
    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';
    var students = cls.students || [];

    overlay.innerHTML = '' +
      '<div class="eth-modal" style="max-width:600px">' +
      '  <div class="eth-modal-header">' +
      '    <h2>' + esc(cls.name) + ' · O\'quvchilar Monitoringi</h2>' +
      '    <p>O\'quvchilarning platformadagi kunlik vaqti va xatoliklar statistikasi</p>' +
      '  </div>' +
      '  <div class="eth-modal-body" style="max-height:60vh;overflow-y:auto">' +
      (students.length === 0 ?
        '<p style="color:var(--muted);text-align:center">Hozircha hech qaysi o\'quvchi qo\'shilmagan.</p>' :
        '<table class="eth-leaderboard-table">' +
        '  <thead><tr><th>O\'quvchi</th><th>Kunlik Vaqti</th><th>Xatolar</th></tr></thead>' +
        '  <tbody>' +
        students.map(function(s) {
          return '<tr>' +
            '  <td><b>' + esc(s.name) + '</b><br><small style="color:var(--muted)">' + esc(s.email) + '</small></td>' +
            '  <td><b>' + (s.dailyMinutes || 0) + ' daqiqa</b></td>' +
            '  <td><span style="color:#ef4444;font-weight:700">' + (s.mistakes || 0) + ' ta xato</span></td>' +
            '</tr>';
        }).join('') +
        '  </tbody>' +
        '</table>'
      ) +
      '    <button class="eth-btn-primary" id="monCloseBtn" style="margin-top:20px">Yopish</button>' +
      '  </div>' +
      '</div>';

    document.body.appendChild(overlay);
    overlay.querySelector('#monCloseBtn').onclick = function() {
      overlay.remove();
    };
  }

  // ==========================================
  // VIEW 4: EXAMS (IMTIHONLAR) & LEADERBOARD
  // ==========================================
  function renderExamsView(container) {
    var isTeacher = S.user && S.user.role === 'teacher';

    var html = '' +
      '<div class="ap-sec" style="margin-top:0">' +
      '  <div>' +
      '    <h2>' + ic('trophy') + ' Imtihonlar Tizimi (Exams & Leaderboard)</h2>' +
      '    <p>' + (isTeacher ? 'PDF material yuklab imtihon tuzing, 6 xonali kod bilan boshqaring va jonli reytingni kuzating.' : 'O\'qituvchingiz bergan 6 xonali imtihon kodi bilan imtihonga kiring.') + '</p>' +
      '  </div>' +
      (isTeacher ?
        '  <button class="eth-btn-primary" id="btnCreateExam" style="width:auto;padding:10px 18px">' + ic('plus') + ' Yangi Imtihon Tuzish</button>' :
        '  <button class="eth-btn-primary" id="btnJoinExam" style="width:auto;padding:10px 18px">' + ic('clip') + ' Imtihonga Kirish (Exam Join)</button>') +
      '</div>';

    if (S.exams.length === 0) {
      html += '<div class="ap-card ap-empty">' + ic('trophy') + '<h2>Hozirda faol imtihonlar mavjud emas</h2><p>' + (isTeacher ? 'Yangi imtihon tuzing va kodini o\'quvchilarga bering.' : 'O\'qituvchingizdan 6 xonali imtihon kodini oling.') + '</p></div>';
    } else {
      html += '<div class="ap-grid g2">';
      S.exams.forEach(function(ex) {
        var subCount = ex.submissions ? ex.submissions.length : 0;
        html += '' +
          '<div class="ap-card" style="border:1.5px solid var(--border)">' +
          '  <div style="display:flex;justify-content:space-between;margin-bottom:8px">' +
          '    <span class="ap-tag">' + ex.duration + ' daqiqa</span>' +
          '    <span style="font-family:monospace;font-weight:700;color:#2563eb;background:rgba(37,99,235,0.08);padding:3px 8px;border-radius:6px">Kod: ' + ex.code + '</span>' +
          '  </div>' +
          '  <h3 style="font-size:18px;margin-bottom:6px">' + esc(ex.title) + '</h3>' +
          '  <p style="color:var(--muted);font-size:13px;margin:0 0 14px">' + (ex.questions ? ex.questions.length : 0) + ' ta savol · ' + subCount + ' ta topshirilgan natija</p>' +
          '  <div style="display:flex;gap:10px">' +
          '    <button class="ap-btn solid" data-exam-lb="' + ex.id + '" style="flex:1">' + ic('trophy') + ' Reyting (Leaderboard)</button>' +
          (!isTeacher ? '<button class="eth-btn-primary" data-exam-take="' + ex.id + '" style="flex:1">Topshirish ' + ic('right') + '</button>' : '') +
          '  </div>' +
          '</div>';
      });
      html += '</div>';
    }

    container.innerHTML = html;

    container.querySelectorAll('[data-exam-lb]').forEach(function(btn) {
      btn.onclick = function() {
        var ex = S.exams.find(function(x) { return x.id === btn.dataset.examLb; });
        if (ex) showExamLeaderboardModal(ex);
      };
    });

    container.querySelectorAll('[data-exam-take]').forEach(function(btn) {
      btn.onclick = function() {
        var ex = S.exams.find(function(x) { return x.id === btn.dataset.examTake; });
        if (ex) startExamRunner(ex, container);
      };
    });

    if (isTeacher) {
      var createBtn = document.getElementById('btnCreateExam');
      if (createBtn) {
        createBtn.onclick = function() {
          showCreateExamModal(container);
        };
      }
    } else {
      var joinBtn = document.getElementById('btnJoinExam');
      if (joinBtn) {
        joinBtn.onclick = function() {
          showJoinExamModal(container);
        };
      }
    }
  }

  function showCreateExamModal(container) {
    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';
    overlay.innerHTML = '' +
      '<div class="eth-modal" style="max-width:540px">' +
      '  <div class="eth-modal-header">' +
      '    <h2>Yangi Imtihon Yaratish</h2>' +
      '    <p>PDF yoki matn asosida 6 xonali kodli imtihon shakllantirish</p>' +
      '  </div>' +
      '  <div class="eth-modal-body">' +
      '    <form id="createExamForm">' +
      '      <div class="eth-form-group">' +
      '        <label>Imtihon Nomi</label>' +
      '        <input type="text" id="exTitle" placeholder="Masalan: Midterm Exam 2026" required>' +
      '      </div>' +
      '      <div style="display:flex;gap:12px">' +
      '        <div class="eth-form-group" style="flex:1">' +
      '          <label>Vaqti (Daqiqa)</label>' +
      '          <input type="number" id="exDuration" value="30" min="5" max="180" required>' +
      '        </div>' +
      '        <div class="eth-form-group" style="flex:1">' +
      '          <label>Har bir savol bali</label>' +
      '          <input type="number" id="exPoints" value="2" min="1" max="10" required>' +
      '        </div>' +
      '      </div>' +
      '      <div class="eth-form-group">' +
      '        <label>PDF / Hujjat Fayli yuklang (yoki quyida matn kiriting):</label>' +
      '        <input type="file" id="exPdfFile" accept=".pdf,.txt,.doc,.docx">' +
      '      </div>' +
      '      <div class="eth-form-group">' +
      '        <label>Imtihon Matni / Savollar:</label>' +
      '        <textarea id="exContent" rows="4" placeholder="Fayl yuklamasangiz, savollar matnini bu yerga nusxalang..."></textarea>' +
      '      </div>' +
      '      <div style="display:flex;gap:10px">' +
      '        <button type="button" class="ap-btn out" id="exCancelBtn" style="flex:1">Bekor qilish</button>' +
      '        <button type="submit" class="eth-btn-primary" style="flex:2">AI Bilan Imtihon Tuzish ' + ic('right') + '</button>' +
      '      </div>' +
      '    </form>' +
      '  </div>' +
      '</div>';

    document.body.appendChild(overlay);

    overlay.querySelector('#exCancelBtn').onclick = function() {
      overlay.remove();
    };

    overlay.querySelector('#createExamForm').onsubmit = async function(e) {
      e.preventDefault();
      var title = document.getElementById('exTitle').value.trim();
      var duration = parseInt(document.getElementById('exDuration').value, 10) || 30;
      var points = parseInt(document.getElementById('exPoints').value, 10) || 2;
      var textContent = document.getElementById('exContent').value.trim();
      var pdfInput = document.getElementById('exPdfFile');

      var contentToParse = textContent;

      if (pdfInput.files && pdfInput.files[0]) {
        var file = pdfInput.files[0];
        contentToParse += '\n[Fayl nomi: ' + file.name + ']\n';
      }

      if (!contentToParse) {
        alert("Iltimos, PDF fayl yuklang yoki imtihon matnini kiriting!");
        return;
      }

      overlay.innerHTML = '' +
        '<div class="eth-modal" style="text-align:center;padding:40px 24px">' +
        '  <div style="font-size:42px;margin-bottom:14px">⚙️</div>' +
        '  <h3 style="font-size:20px;color:var(--eth-primary)">ETHITH AI Imtihon tuzmoqda...</h3>' +
        '  <p style="color:var(--muted);font-size:14px">Materiallar tahlil qilinmoqda va tayyor imtihon savollariga aylantirilmoqda...</p>' +
        '</div>';

      try {
        var questions = await window.EthithAI.generateExamFromContent(contentToParse, 20);
        var code = Math.floor(100000 + Math.random() * 900000).toString();

        var newExam = {
          id: 'exam_' + Date.now(),
          code: code,
          title: title,
          duration: duration,
          pointsPerQ: points,
          questions: questions,
          submissions: []
        };

        S.exams.push(newExam);
        App.saveState();
        overlay.remove();
        alert("Imtihon tayyor! O'quvchilar uchun 6 xonali kod: " + code);
        renderExamsView(container);
      } catch (err) {
        overlay.remove();
        alert("Xatolik: " + err.message);
      }
    };
  }

  function showJoinExamModal(container) {
    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';
    overlay.innerHTML = '' +
      '<div class="eth-modal">' +
      '  <div class="eth-modal-header">' +
      '    <h2>Imtihonga Kirish</h2>' +
      '    <p>O\'qituvchingiz bergan 6 xonali maxsus kodni kiriting</p>' +
      '  </div>' +
      '  <div class="eth-modal-body">' +
      '    <form id="joinExamForm">' +
      '      <div class="eth-form-group">' +
      '        <label>6 xonali Imtihon Kodi</label>' +
      '        <input type="text" id="joinExCode" placeholder="Masalan: 849201" maxlength="6" required style="font-size:20px;letter-spacing:4px;text-align:center">' +
      '      </div>' +
      '      <button type="submit" class="eth-btn-primary">Imtihonni Boshlash ' + ic('right') + '</button>' +
      '    </form>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.querySelector('#joinExamForm').onsubmit = function(e) {
      e.preventDefault();
      var code = document.getElementById('joinExCode').value.trim();
      var exam = S.exams.find(function(x) { return x.code === code; });

      if (!exam) {
        alert("Ushbu 6 xonali kodli imtihon topilmadi!");
        return;
      }

      overlay.remove();
      startExamRunner(exam, container);
    };
  }

  function startExamRunner(exam, mainContainer) {
    var timeLeftSeconds = exam.duration * 60;
    var state = {
      i: 0,
      score: 0,
      answered: false,
      answers: {}
    };

    var timerInterval = setInterval(function() {
      timeLeftSeconds--;
      var badge = document.getElementById('examTimerDisplay');
      if (badge) {
        var m = Math.floor(timeLeftSeconds / 60);
        var s = timeLeftSeconds % 60;
        badge.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
      }
      if (timeLeftSeconds <= 0) {
        clearInterval(timerInterval);
        alert("Vaqt tugadi! Imtihon avtomatik ravishda yakunlandi.");
        finishExam();
      }
    }, 1000);

    function renderExamQuestion() {
      if (state.i >= exam.questions.length) {
        clearInterval(timerInterval);
        finishExam();
        return;
      }

      var q = exam.questions[state.i];
      var html = '' +
        '<div class="ap-quiz">' +
        '  <div class="ap-qtop">' +
        '    <div class="eth-timer-badge">' + ic('clock') + ' <span id="examTimerDisplay">--:--</span></div>' +
        '    <div class="ap-bar"><i style="width:' + ((state.i / exam.questions.length) * 100) + '%"></i></div>' +
        '    <b>' + (state.i + 1) + ' / ' + exam.questions.length + '</b>' +
        '  </div>' +
        '  <div class="ap-qbox">' +
        '    <div class="qn">' + esc(exam.title) + ' · Savol ' + (state.i + 1) + ' (' + exam.pointsPerQ + ' ball)</div>' +
        '    <h2>' + esc(q.question) + '</h2>' +
        '    <div>' +
        q.options.map(function(opt, idx) {
          return '<button class="ap-opt" data-opt="' + esc(opt) + '"><span class="l">' + 'ABCD'[idx] + '</span>' + esc(opt) + '</button>';
        }).join('') +
        '    </div>' +
        '  </div>' +
        '</div>';

      mainContainer.innerHTML = html;

      mainContainer.querySelectorAll('.ap-opt').forEach(function(btn) {
        btn.onclick = function() {
          var sel = btn.dataset.opt;
          if (sel === q.answer) state.score += exam.pointsPerQ;
          state.answers[state.i] = sel;
          state.i++;
          renderExamQuestion();
        };
      });
    }

    function finishExam() {
      var totalPossible = exam.questions.length * exam.pointsPerQ;
      var pct = Math.round((state.score / totalPossible) * 100);
      var timeSpentMin = Math.round((exam.duration * 60 - Math.max(0, timeLeftSeconds)) / 60);

      var sub = {
        studentId: S.user.id,
        studentName: S.user.name,
        studentEmail: S.user.email,
        score: state.score,
        totalPossible: totalPossible,
        percent: pct,
        timeSpent: timeSpentMin + ' daqiqa',
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      if (!exam.submissions) exam.submissions = [];
      exam.submissions.push(sub);
      App.saveState();

      // Show Result
      var html = '' +
        '<div class="ap-res">' +
        '  <h2>Imtihon Yakunlandi!</h2>' +
        '  <p>Sizning natijangiz: <b>' + state.score + ' / ' + totalPossible + ' ball (' + pct + '%)</b></p>' +
        '  <button class="eth-btn-primary" id="viewLbAfterExam" style="margin-top:20px">' + ic('trophy') + ' Jonli Reytingni Ko\'rish</button>' +
        '</div>';

      mainContainer.innerHTML = html;
      document.getElementById('viewLbAfterExam').onclick = function() {
        showExamLeaderboardModal(exam);
        renderExamsView(mainContainer);
      };
    }

    renderExamQuestion();
  }

  function showExamLeaderboardModal(exam) {
    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';
    var subs = (exam.submissions || []).slice().sort(function(a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return parseInt(a.timeSpent, 10) - parseInt(b.timeSpent, 10);
    });

    overlay.innerHTML = '' +
      '<div class="eth-modal" style="max-width:640px">' +
      '  <div class="eth-modal-header">' +
      '    <h2>' + ic('trophy') + ' ' + esc(exam.title) + ' · Jonli Reyting</h2>' +
      '    <p>Eng yuqori ball va sarflangan vaqt bo\'yicha tartiblangan</p>' +
      '  </div>' +
      '  <div class="eth-modal-body" style="max-height:60vh;overflow-y:auto">' +
      (subs.length === 0 ?
        '<p style="color:var(--muted);text-align:center">Hozircha hech kim imtihon topshirmadi.</p>' :
        '<table class="eth-leaderboard-table">' +
        '  <thead><tr><th>O\'rin</th><th>O\'quvchi</th><th>Ball</th><th>Sarflangan Vaqt</th></tr></thead>' +
        '  <tbody>' +
        subs.map(function(s, idx) {
          var rankCls = (idx === 0 ? 'eth-rank-1' : (idx === 1 ? 'eth-rank-2' : (idx === 2 ? 'eth-rank-3' : '')));
          return '<tr>' +
            '  <td><span class="eth-rank-badge ' + rankCls + '">' + (idx + 1) + '</span></td>' +
            '  <td><b>' + esc(s.studentName) + '</b></td>' +
            '  <td><b style="color:#2563eb">' + s.score + ' ball (' + s.percent + '%)</b></td>' +
            '  <td>' + esc(s.timeSpent) + '</td>' +
            '</tr>';
        }).join('') +
        '  </tbody>' +
        '</table>'
      ) +
      '    <button class="eth-btn-primary" id="lbCloseBtn" style="margin-top:20px">Yopish</button>' +
      '  </div>' +
      '</div>';

    document.body.appendChild(overlay);
    overlay.querySelector('#lbCloseBtn').onclick = function() {
      overlay.remove();
    };
  }

  // ==========================================
  // VIEW 5: PLACEMENT TEST (70 QUESTIONS)
  // ==========================================
  function renderPlacementView(container) {
    var questions = window.ETHITH_PLACEMENT || [];

    var html = '' +
      '<div class="ap-sec" style="margin-top:0">' +
      '  <div>' +
      '    <h2>' + ic('clip') + ' Language Hub Rasmiy Placement Test (70 ta Savol)</h2>' +
      '    <p>Ingliz tili darajangizni (A1 dan C2 gacha) rasmiy xalqaro nizom asosida aniqlang. Ajratilgan vaqt: 30 daqiqa.</p>' +
      '  </div>' +
      '</div>' +
      '<div class="ap-intro">' +
      '  <div class="ap-lhero">' +
      '    <h1>Darajani Aniqlash Testi</h1>' +
      '    <p>Beginner (A1) dan Advanced (C2) gacha 70 ta grammatik va leksik savol.</p>' +
      '  </div>' +
      '  <ul>' +
      '    <li>' + ic('list') + ' 70 ta ko\'p tanlovli (multiple choice) savollar</li>' +
      '    <li>' + ic('clock') + ' Maksimal 30 daqiqa vaqt beriladi</li>' +
      '    <li>' + ic('trophy') + ' Rasmiy baholash mezoni bo\'yicha aniq CEFR darajangiz chiqadi</li>' +
      '  </ul>' +
      '  <button class="eth-btn-primary" id="startPlacementTestBtn" style="font-size:16px;padding:14px 28px">Testni Boshlash ' + ic('right') + '</button>' +
      '</div>';

    container.innerHTML = html;

    document.getElementById('startPlacementTestBtn').onclick = function() {
      runPlacementTest(container, questions);
    };
  }

  function runPlacementTest(mainContainer, questions) {
    var timeLeft = 30 * 60;
    var state = {
      i: 0,
      score: 0,
      answers: {}
    };

    var interval = setInterval(function() {
      timeLeft--;
      var badge = document.getElementById('plcTimer');
      if (badge) {
        var m = Math.floor(timeLeft / 60);
        var s = timeLeft % 60;
        badge.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
      }
      if (timeLeft <= 0) {
        clearInterval(interval);
        finishPlacement();
      }
    }, 1000);

    function renderQ() {
      if (state.i >= questions.length) {
        clearInterval(interval);
        finishPlacement();
        return;
      }

      var q = questions[state.i];
      var opts = q.options || { A: 'A', B: 'B', C: 'C', D: 'D' };

      var html = '' +
        '<div class="ap-quiz">' +
        '  <div class="ap-qtop">' +
        '    <div class="eth-timer-badge">' + ic('clock') + ' <span id="plcTimer">30:00</span></div>' +
        '    <div class="ap-bar"><i style="width:' + ((state.i / questions.length) * 100) + '%"></i></div>' +
        '    <b>' + (state.i + 1) + ' / ' + questions.length + '</b>' +
        '  </div>' +
        '  <div class="ap-qbox">' +
        '    <div class="qn">Placement Test · Savol ' + (state.i + 1) + '</div>' +
        '    <h2>' + esc(q.prompt) + '</h2>' +
        '    <div>' +
        ['A', 'B', 'C', 'D'].map(function(key) {
          return '<button class="ap-opt" data-k="' + key + '"><span class="l">' + key + '</span>' + esc(opts[key]) + '</button>';
        }).join('') +
        '    </div>' +
        '  </div>' +
        '</div>';

      mainContainer.innerHTML = html;

      mainContainer.querySelectorAll('.ap-opt').forEach(function(btn) {
        btn.onclick = function() {
          var k = btn.dataset.k;
          if (k === q.answer) state.score++;
          state.answers[state.i] = k;
          state.i++;
          renderQ();
        };
      });
    }

    function finishPlacement() {
      var score = state.score;
      var level = 'A1';
      var levelDesc = 'Beginner';

      if (score <= 6) { level = 'A1'; levelDesc = 'Beginner'; }
      else if (score <= 20) { level = 'A2'; levelDesc = 'Elementary'; }
      else if (score <= 34) { level = 'B1'; levelDesc = 'Pre-Intermediate'; }
      else if (score <= 48) { level = 'B2'; levelDesc = 'Intermediate'; }
      else if (score <= 62) { level = 'B2+'; levelDesc = 'Upper Intermediate'; }
      else { level = 'C1/C2'; levelDesc = 'Advanced'; }

      S.level = level.slice(0, 2);
      App.saveState();

      var html = '' +
        '<div class="ap-res">' +
        '  <div style="font-size:56px;margin-bottom:10px">🎓</div>' +
        '  <h2>Sizning Darajangiz: <span style="color:#2563eb">' + level + ' (' + levelDesc + ')</span></h2>' +
        '  <p>To\'plangan ball: <b>' + score + ' / ' + questions.length + '</b></p>' +
        '  <p style="color:var(--muted);font-size:14px;max-width:540px;margin:0 auto 20px">Language Hub xalqaro nizomiga muvofiq, sizning hozirgi bilim darajangiz aniqlandi va profilingizga biriktirildi.</p>' +
        '  <button class="eth-btn-primary" id="plcDoneBtn" style="margin:0 auto;width:auto;padding:12px 24px">O\'rganishni davom ettirish ' + ic('right') + '</button>' +
        '</div>';

      mainContainer.innerHTML = html;
      document.getElementById('plcDoneBtn').onclick = function() {
        window.ethithOpenApp('level', S.level);
      };
    }

    renderQ();
  }

  // ==========================================
  // VIEW 6: MISTAKES NOTEBOOK (XATOLAR DAFTARI)
  // ==========================================
  function renderMistakesNotebook(container) {
    var mistakes = S.mistakes || [];

    var html = '' +
      '<div class="ap-sec" style="margin-top:0">' +
      '  <div>' +
      '    <h2>' + ic('clip') + ' Xatolar Daftari (' + mistakes.length + ' ta xato)</h2>' +
      '    <p>Testlar davomida xato belgilangan barcha savollar va ularning tushuntirishlari</p>' +
      '  </div>' +
      (mistakes.length > 0 ? '  <button class="ap-btn out" id="clrMistakesBtn">Daftarni tozalash</button>' : '') +
      '</div>';

    if (mistakes.length === 0) {
      html += '<div class="ap-card ap-empty">' + ic('check') + '<h2>Xatolar daftari bo\'sh</h2><p>Siz testlarda adashganingizda barcha xatolar izohi bilan bu yerda saqlanadi.</p></div>';
    } else {
      html += '<div class="ap-grid g2">';
      mistakes.slice().reverse().forEach(function(m) {
        html += '' +
          '<div class="ap-card" style="border-left:4px solid #ef4444">' +
          '  <span class="ap-tag">' + esc(m.level || 'Test') + ' · ' + esc(m.topic || 'Mavzu') + '</span>' +
          '  <h4 style="margin:10px 0 8px;font-size:15px">' + esc(m.question) + '</h4>' +
          '  <div style="font-size:13px;margin-bottom:6px"><b style="color:#ef4444">Sizning javobingiz:</b> ' + esc(m.yourAnswer) + '</div>' +
          '  <div style="font-size:13px;margin-bottom:8px"><b style="color:#16a34a">To\'g\'ri javob:</b> ' + esc(m.correctAnswer) + '</div>' +
          '  <div style="background:var(--bg2);padding:8px 12px;border-radius:8px;font-size:12.5px;color:var(--text)">💡 ' + esc(m.explanation) + '</div>' +
          '</div>';
      });
      html += '</div>';
    }

    container.innerHTML = html;

    var clrBtn = document.getElementById('clrMistakesBtn');
    if (clrBtn) {
      clrBtn.onclick = function() {
        if (confirm("Haqiqatan ham xatolar daftarini tozalamoqchimisiz?")) {
          S.mistakes = [];
          App.saveState();
          renderMistakesNotebook(container);
        }
      };
    }
  }

  window.EthithViews = {
    renderAskAITeacher: renderAskAITeacher,
    renderLevelsView: renderLevelsView,
    renderClassesView: renderClassesView,
    renderExamsView: renderExamsView,
    renderPlacementView: renderPlacementView,
    renderMistakesNotebook: renderMistakesNotebook
  };

})(window);
