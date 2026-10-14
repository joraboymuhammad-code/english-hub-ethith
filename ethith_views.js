/**
 * ETHITH Extended View Renderers:
 * - Ask AI Teacher (ChatGPT UI with image/pdf upload)
 * - 40 Topics per Level (A1..C2) with Dynamic AI Quiz Solver
 * - Classes & Telegram Web Chat (Double-click reply, Long-press menu, Reactions with dynamic order, Pin & Delete)
 * - Exam System (PDF to Quiz, 6-digit code, Countdown timer, Live Leaderboard)
 * - 70-question Language Hub Placement Test
 * - Mistakes Notebook
 */

(function(window) {
  'use strict';

  var App = window.EthithApp;
  var S = App.state;
  var ic = App.ic;
  var esc = App.esc;

  var currentReplyingMessage = null;
  var activeContextMenu = null;
  var ETHITH_EMBLEM_IMG = 'data:image/jpeg;base64,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';

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
      '    <button class="eth-btn-primary" id="aiNewChatBtn" style="margin-bottom:14px;padding:10px 14px;font-size:13.5px">' + ic('plus') + ' New Chat</button>' +
      '    <div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em">Recommended Prompts</div>' +
      '    <div style="display:flex;flex-direction:column;gap:6px;overflow-y:auto;flex:1">' +
      '      <button class="ap-item ai-prompt-pill" data-p="Provide a sample Band 7.0+ response and idioms for IELTS Speaking">' + ic('sparkles') + ' IELTS Speaking Template</button>' +
      '      <button class="ap-item ai-prompt-pill" data-p="Explain the difference between Present Perfect and Past Simple with examples">' + ic('book') + ' Grammar Differences</button>' +
      '      <button class="ap-item ai-prompt-pill" data-p="Explain the 10 most essential phrasal verbs in English with examples">' + ic('layers') + ' Phrasal Verbs</button>' +
      '      <button class="ap-item ai-prompt-pill" data-p="How can I quickly improve my English proficiency?">' + ic('trophy') + ' Learning Strategies</button>' +
      '    </div>' +
      '    <div style="padding-top:12px;border-top:1px solid var(--border);font-size:11.5px;color:var(--muted);text-align:center">' +
      '      <b>ETHITH AI Teacher</b><br>Created by: Muhammadyusuf Jo\'raboyev' +
      '    </div>' +
      '  </div>' +
      '  <div class="ask-ai-main">' +
      '    <div class="ask-ai-messages" id="aiMsgBox">' +
      (history.length === 0 ?
        '<div style="text-align:center;margin:auto;max-width:520px;padding:20px">' +
        '  <div style="margin-bottom:16px"><img src="' + ETHITH_EMBLEM_IMG + '" alt="ETHITH AI Emblem" style="width:115px;height:115px;border-radius:24px;box-shadow:0 12px 28px rgba(0,0,0,0.22), 0 0 20px rgba(59,130,246,0.3);border:2px solid rgba(255,255,255,0.2);display:inline-block"></div>' +
        '  <h2 style="font-size:24px;font-weight:800;color:#1e293b;margin-bottom:8px">ETHITH AI Teacher</h2>' +
        '  <p style="color:#64748b;font-size:14.5px;line-height:1.6">Ask any questions regarding English grammar, quizzes, vocabulary, or learning roadmaps. You can also upload images or PDF documents!</p>' +
        '</div>' :
        history.map(function(m) {
          return '<div class="ask-ai-msg ' + m.role + '">' +
            '  <div class="ask-ai-avatar" style="' + (m.role === 'user' ? '' : 'background:transparent;padding:0;overflow:hidden') + '">' + (m.role === 'user' ? (S.user ? S.user.name.charAt(0).toUpperCase() : 'U') : '<img src="' + ETHITH_EMBLEM_IMG + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover">') + '</div>' +
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
      '        <label for="aiFileInput" class="ask-ai-btn" title="Attach image or document" style="cursor:pointer">' + ic('paperclip') + '</label>' +
      '        <input type="file" id="aiFileInput" style="display:none" accept="image/*,.pdf,.txt,.doc,.docx">' +
      '        <textarea id="aiPromptInput" rows="1" placeholder="Ask ETHITH AI any question..." required></textarea>' +
      '        <button type="submit" class="ask-ai-btn ask-ai-send" title="Send message">' + ic('send') + '</button>' +
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
          filePreview.innerHTML = '<span>🖼️ Image attached: <b>' + esc(file.name) + '</b></span><button id="aiRemoveFile" style="background:none;border:none;cursor:pointer;color:red">✕</button>';
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
          filePreview.innerHTML = '<span>📄 Document attached: <b>' + esc(file.name) + '</b></span><button id="aiRemoveFile" style="background:none;border:none;cursor:pointer;color:red">✕</button>';
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
      loadingBubble.innerHTML = '<div class="ask-ai-avatar">AI</div><div class="ask-ai-bubble" style="opacity:0.7">ETHITH AI is thinking...</div>';
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
        alert("Error occurred: " + err.message);
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

    var NEXT_LEVEL = { A1: 'A2', A2: 'B1', B1: 'B2', B2: 'C1', C1: 'C2', C2: 'Master' };
    var nextLv = NEXT_LEVEL[curLevel] || 'Keyingi';

    var html = '' +
      '<div class="ap-sec" style="margin-top:0">' +
      '  <div>' +
      '    <h2>' + ic('layers') + ' CEFR English Levels (40 Topics)</h2>' +
      '    <p>Score 70% or higher on each topic quiz to unlock the next lesson.</p>' +
      '  </div>' +
      (isTeacher ? '  <button class="ap-btn solid" id="tcAddTestBtn">' + ic('plus') + ' Yangi Test Qo\'shish</button>' : '') +
      '</div>' +
      '<div class="eth-tabs" style="margin:0 0 16px 0">' +
      levels.map(function(lv) {
        return '<button class="eth-tab ' + (lv === curLevel ? 'active' : '') + '" data-lvl="' + lv + '">' + lv + ' Level</button>';
      }).join('') +
      '</div>' +
      '<div class="ap-card" id="levelTransitionCard" style="cursor:pointer;background:linear-gradient(135deg, #0f172a, #1e3a8a);color:#ffffff;border-radius:16px;padding:16px 20px;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;border:1px solid rgba(255,255,255,0.1);box-shadow:0 6px 20px rgba(15,23,42,0.15)">' +
      '  <div>' +
      '    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
      '      <span style="background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:12px;font-size:11.5px;font-weight:700">🏆 CEFR Level Exam</span>' +
      '      <span class="eth-coming-soon-badge" style="background:#fef08a;color:#854d0e;font-size:10px">Coming Soon · Tez Kunda</span>' +
      '    </div>' +
      '    <h3 style="font-size:17px;margin:0 0 4px;color:#ffffff">' + curLevel + ' &rarr; ' + nextLv + ' Level Test (' + curLevel + ' to ' + nextLv + ' Transition Exam)</h3>' +
      '    <p style="margin:0;opacity:0.85;font-size:12.5px">Complete all 40 topics to unlock and take the official transition exam to the next level.</p>' +
      '  </div>' +
      '  <button class="ap-btn" style="background:#ffffff;color:#1e3a8a;font-weight:700;border:none;padding:10px 18px;border-radius:10px;cursor:pointer;font-size:13px">Start Test &rarr;</button>' +
      '</div>' +
      '<div style="font-size:14px;color:var(--muted);margin-bottom:12px">' +
      (isTeacher ? '<b>Teacher Mode:</b> All 40 topics unlocked.' : '<b>Unlocked Topics:</b> ' + unlockedCount + ' / 40') +
      '</div>' +
      '<div class="eth-topics-grid">';

    topics.forEach(function(t) {
      var isUnlocked = isTeacher || (t.num <= unlockedCount);
      html += '' +
        '<div class="eth-topic-card ' + (isUnlocked ? '' : 'locked') + '" data-topic-num="' + t.num + '" data-topic-title="' + esc(t.title) + '">' +
        '  <div class="eth-topic-top">' +
        '    <span class="eth-topic-badge">' + curLevel + ' · Topic ' + t.num + '</span>' +
        '    <span>' + (isUnlocked ? ic('unlock', 'text-success') : ic('lock', 'text-muted')) + '</span>' +
        '  </div>' +
        '  <h4>' + esc(t.title) + '</h4>' +
        '  <p>' + esc(t.desc) + '</p>' +
        '  <div style="margin-top:14px">' +
        (isUnlocked ?
          '<button class="ap-btn solid" style="width:100%;padding:8px 12px;font-size:13px">Start Test ' + ic('right') + '</button>' :
          '<span style="font-size:12px;color:var(--muted)">Score 70%+ on previous topic to unlock</span>') +
        '  </div>' +
        '</div>';
    });

    html += '</div>';
    container.innerHTML = html;

    var transCard = container.querySelector('#levelTransitionCard');
    if (transCard) {
      transCard.onclick = function() {
        App.showComingSoon(curLevel + " dan " + nextLv + " Level Transition Exam (CEFR Transition Test)");
      };
    }

    container.querySelectorAll('.eth-tab').forEach(function(tab) {
      tab.onclick = function() {
        renderLevelsView(container, tab.dataset.lvl);
      };
    });

    container.querySelectorAll('.eth-topic-card').forEach(function(card) {
      card.onclick = function() {
        if (card.classList.contains('locked')) {
          alert("This topic is locked! Complete the previous topic with at least 70% score.");
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
      '    <h2>' + level + ' · Topic ' + topicNum + '</h2>' +
      '    <p>' + esc(topicTitle) + '</p>' +
      '  </div>' +
      '  <div class="eth-modal-body">' +
      '    <div class="eth-form-group">' +
      '      <label>Select number of questions (25 to 50):</label>' +
      '      <div style="display:flex;align-items:center;gap:14px;margin-top:8px">' +
      '        <input type="range" id="quizCountSlider" min="25" max="50" value="25" step="5" style="flex:1">' +
      '        <b id="quizCountVal" style="font-size:18px;color:#2563eb;min-width:36px;text-align:right">25</b>' +
      '      </div>' +
      '    </div>' +
      '    <div style="background:var(--bg2);padding:12px;border-radius:12px;font-size:13px;color:var(--muted);margin-bottom:20px">' +
      '      💡 ETHITH AI automatically generates an original quiz with your chosen question count. Passing grade: <b>70%</b>.' +
      '    </div>' +
      '    <div style="display:flex;gap:10px">' +
      '      <button class="ap-btn out" id="quizPromptCancel" style="flex:1">Cancel</button>' +
      '      <button class="eth-btn-primary" id="quizPromptStart" style="flex:2">Start Test ' + ic('right') + '</button>' +
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

    overlay.querySelector('#quizPromptStart').onclick = function() {
      var count = parseInt(slider.value, 10) || 25;
      var questions = (window.EthithQuizEngine && window.EthithQuizEngine.generateQuiz)
        ? window.EthithQuizEngine.generateQuiz(level, topicNum, count)
        : [];
      overlay.remove();
      startTopicQuizRunner(level, topicNum, topicTitle, questions, mainContainer);
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
        '    <div class="qn">' + level + ' · Topic ' + topicNum + ' · Question ' + (state.i + 1) + '</div>' +
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
        if (confirm("Are you sure you want to exit? Quiz progress will not be saved.")) {
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
            '<button class="ap-btn solid" id="quizNextBtn">' + (state.i === questions.length - 1 ? 'View Results' : 'Next Question') + ' ' + ic('right') + '</button>';

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
        '  <h2>' + (passed ? 'Congratulations! You Passed!' : 'Almost There!') + '</h2>' +
        '  <p>' + (passed ?
          'You successfully completed Topic ' + topicNum + ' (' + level + ') and unlocked the next topic!' :
          'You must achieve at least 70% to unlock the next topic. Review your Mistakes Notebook and try again.') + '</p>' +
        '  <div class="acts">' +
        '    <button class="ap-btn out" id="resBackLevelsBtn">Topics List</button>' +
        (passed && topicNum < 40 ? '<button class="ap-btn solid" id="resNextTopicBtn">Next Topic ' + ic('right') + '</button>' : '') +
        '    <button class="ap-btn solid" id="resRetryBtn">' + ic('clip') + ' Retake Quiz</button>' +
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
      '    <h2>Create New Custom Quiz</h2>' +
      '    <p>Generate AI quizzes from teacher notes, written prompts, or syllabus text</p>' +
      '  </div>' +
      '  <div class="eth-modal-body">' +
      '    <form id="tcCustomTestForm">' +
      '      <div class="eth-form-group">' +
      '        <label>Topic Title</label>' +
      '        <input type="text" id="tcTestTitle" placeholder="e.g. Passive Voice Special Rules" required>' +
      '      </div>' +
      '      <div class="eth-form-group">' +
      '        <label>Questions Content / Syllabus Text</label>' +
      '        <textarea id="tcTestContent" rows="5" placeholder="Paste your study notes, questions, or text content here..." required></textarea>' +
      '      </div>' +
      '      <div class="eth-form-group">' +
      '        <label>Number of Questions</label>' +
      '        <input type="number" id="tcTestCount" value="25" min="10" max="50">' +
      '      </div>' +
      '      <div style="display:flex;gap:10px">' +
      '        <button type="button" class="ap-btn out" id="tcCancelBtn" style="flex:1">Cancel</button>' +
      '        <button type="submit" class="eth-btn-primary" style="flex:2">Generate with AI ' + ic('right') + '</button>' +
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
        '  <h3 style="font-size:20px;color:var(--eth-primary)">ETHITH AI is generating your quiz...</h3>' +
        '  <p style="color:var(--muted);font-size:14px">Analyzing lesson content and building questions. Please wait...</p>' +
        '</div>';

      try {
        var questions = await window.EthithAI.generateExamFromContent(content, count);
        overlay.remove();
        alert("Quiz successfully created! " + questions.length + " questions ready.");
        startTopicQuizRunner(level, 99, title, questions, mainContainer);
      } catch (err) {
        overlay.remove();
        alert("Error occurred: " + err.message);
      }
    };
  }

  // ==========================================
  // VIEW 3: CLASSES & TELEGRAM CHAT
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
      '    <h2>' + ic('users') + ' Virtual Classrooms</h2>' +
      '    <p>' + (isTeacher ? 'Create custom classes, monitor student performance in real-time, and collaborate via Telegram-style chat.' : 'Join a class using the 10-character code provided by your teacher.') + '</p>' +
      '  </div>' +
      (isTeacher ?
        '  <button class="eth-btn-primary" id="btnCreateClass" style="width:auto;padding:10px 18px">' + ic('plus') + ' Create New Class</button>' :
        '  <button class="eth-btn-primary" id="btnJoinClass" style="width:auto;padding:10px 18px">' + ic('right') + ' Join Class</button>') +
      '</div>';

    if (userClasses.length === 0) {
      html += '<div class="ap-card ap-empty">' + ic('users') + '<h2>You are not enrolled in any class yet</h2><p>' + (isTeacher ? 'Create a new class and share its 10-character code with your students.' : 'Join a class using the code from your instructor.') + '</p></div>';
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
          '  <p style="color:var(--muted);font-size:13px;margin:0 0 14px">Teacher: ' + esc(c.teacherName || 'Teacher') + '</p>' +
          '  <button class="ap-btn solid" style="width:100%">' + ic('msg') + ' Enter Class Chat ' + ic('right') + '</button>' +
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
      '    <h2>Create New Class</h2>' +
      '    <p>Create a new classroom with a 10-character invitation code for your students</p>' +
      '  </div>' +
      '  <div class="eth-modal-body">' +
      '    <form id="createClassForm">' +
      '      <div class="eth-form-group">' +
      '        <label>Class Name</label>' +
      '        <input type="text" id="clsName" placeholder="e.g. IELTS 7.5 Intensive" required>' +
      '      </div>' +
      '      <button type="submit" class="eth-btn-primary">Activate Class ' + ic('right') + '</button>' +
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
            text: 'Welcome to our class! Here we can discuss grammar topics, collaborate on quizzes, and share answers in real-time.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            reactions: {}
          }
        ],
        pinnedId: null
      };

      S.classes.push(newCls);
      S.activeClassId = newCls.id;
      App.saveState();
      if (window.EthithSync) {
        window.EthithSync.broadcastLocal(S.classes, S.exams);
        window.EthithSync.pushRemoteStore(S.classes, S.exams);
      }
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
      '    <h2>Join a Class</h2>' +
      '    <p>Enter the 10-character code provided by your teacher</p>' +
      '  </div>' +
      '  <div class="eth-modal-body">' +
      '    <form id="joinClassForm">' +
      '      <div class="eth-form-group">' +
      '        <label>10-character Class Code</label>' +
      '        <input type="text" id="joinClsCode" placeholder="e.g. ETH-L6S8CM" style="text-transform:uppercase" required>' +
      '      </div>' +
      '      <button type="submit" class="eth-btn-primary">Join Class ' + ic('right') + '</button>' +
      '    </form>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.querySelector('#joinClassForm').onsubmit = async function(e) {
      e.preventDefault();
      var code = document.getElementById('joinClsCode').value.trim().toUpperCase();
      var found = S.classes.find(function(c) { return c.code === code; });

      if (!found && window.EthithSync) {
        var remote = await window.EthithSync.fetchRemoteStore();
        if (remote && remote.classes) {
          remote.classes.forEach(function(rc) {
            if (!S.classes.some(function(c) { return c.id === rc.id || c.code === rc.code; })) {
              S.classes.push(rc);
            }
          });
          found = S.classes.find(function(c) { return c.code === code; });
        }
      }

      if (!found) {
        alert("No class found with this code. Please check and try again.");
        return;
      }

      if (!found.students) found.students = [];
      var studentId = S.user.email || S.user.id;
      var already = found.students.some(function(s) { return s.id === studentId || s.email === S.user.email; });

      if (!already) {
        found.students.push({
          id: studentId,
          name: S.user.name,
          email: S.user.email,
          lastActive: Date.now(),
          dailyMinutes: S.user.dailyMinutes || 0,
          mistakes: (S.mistakes || []).length
        });
      }

      S.activeClassId = found.id;
      App.saveState();
      if (window.EthithSync) {
        window.EthithSync.broadcastLocal(S.classes, S.exams);
        window.EthithSync.pushRemoteStore(S.classes, S.exams);
      }
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
      '  <button class="ap-back" id="backClassesListBtn" style="margin:0">' + ic('left') + ' Back to Classes</button>' +
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
        '  <div>' + ic('pin') + ' <b>Pinned Message:</b> ' + esc(pinnedMsg.senderName) + ': "' + esc(pinnedMsg.text.slice(0, 50)) + '..."</div>' +
        (isTeacher ? '  <button id="tgUnpinBtn" style="background:none;border:none;cursor:pointer;color:var(--muted)">✕</button>' : '') +
        '</div>' : '') +
      '  <div class="tg-messages-scroll" id="tgMsgBox">' +
      cls.messages.map(function(m) {
        var isOwn = (m.senderId === S.user.id || m.senderEmail === S.user.email);
        var reactionsList = [];
        if (m.reactions) {
          for (var em in m.reactions) {
            var uList = m.reactions[em] || [];
            if (uList.length > 0) {
              var userNames = uList.map(function(u) {
                if (S.user && (u === S.user.id || u === S.user.email)) return 'You';
                var st = cls.students ? cls.students.find(function(s) { return s.id === u || s.email === u; }) : null;
                if (st) return st.name;
                var prior = cls.messages.find(function(pm) { return pm.senderId === u || pm.senderEmail === u; });
                if (prior) return prior.senderName;
                return u.indexOf('@') > -1 ? u.split('@')[0] : u;
              });
              var hasUserReacted = S.user && uList.some(function(u) { return u === S.user.id || u === S.user.email; });
              reactionsList.push({
                emoji: em,
                count: uList.length,
                userNames: userNames,
                hasUserReacted: hasUserReacted
              });
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
              var nameSnippet = r.userNames.slice(0, 2).join(', ') + (r.userNames.length > 2 ? ' +' + (r.userNames.length - 2) : '');
              return '<span class="tg-reaction-pill ' + (r.hasUserReacted ? 'active' : '') + '" data-msg-id="' + m.id + '" data-em="' + r.emoji + '" title="Reacted by: ' + esc(r.userNames.join(', ')) + '">' +
                r.emoji + ' ' + r.count + ' <span class="tg-reaction-names">' + esc(nameSnippet) + '</span>' +
              '</span>';
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
      '    <input type="text" id="tgInputText" placeholder="Write a message..." autocomplete="off">' +
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

    // Direct Click on Reaction Pills to toggle
    container.querySelectorAll('.tg-reaction-pill').forEach(function(pill) {
      pill.onclick = function(e) {
        e.stopPropagation();
        var msgId = pill.dataset.msgId;
        var emoji = pill.dataset.em;
        var targetMsg = cls.messages.find(function(m) { return m.id === msgId; });
        if (targetMsg && emoji) {
          applyReaction(emoji, targetMsg, cls, container);
        }
      };
    });

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
        replyText.innerHTML = ic('reply') + ' <b>Replying to: ' + esc(msg.senderName) + '</b>: "' + esc(msg.text.slice(0, 45)) + '..."';
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
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        timestamp: Date.now(),
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
      if (window.EthithSync) {
        window.EthithSync.broadcastLocal(S.classes, S.exams);
        window.EthithSync.pushRemoteStore(S.classes, S.exams);
      }
      renderClassDetail(container, cls);
    }

    window._ethithRefreshCurrentClass = function() {
      var latestCls = S.classes.find(function(c) { return c.id === cls.id; });
      if (latestCls && document.getElementById('tgMsgBox')) {
        var inputEl = document.getElementById('tgInputText');
        var draftText = inputEl ? inputEl.value : '';
        var wasFocused = (document.activeElement === inputEl);
        var selStart = inputEl ? inputEl.selectionStart : 0;
        var selEnd = inputEl ? inputEl.selectionEnd : 0;

        var msgBox = document.getElementById('tgMsgBox');
        var wasAtBottom = (msgBox.scrollHeight - msgBox.scrollTop <= msgBox.clientHeight + 60);

        renderClassDetail(container, latestCls);

        var newInput = document.getElementById('tgInputText');
        if (newInput) {
          newInput.value = draftText;
          if (wasFocused) {
            newInput.focus();
            try { newInput.setSelectionRange(selStart, selEnd); } catch(e){}
          }
        }

        var newBox = document.getElementById('tgMsgBox');
        if (newBox && wasAtBottom) {
          newBox.scrollTop = newBox.scrollHeight;
        }
      }
    };

    document.getElementById('tgSendBtn').onclick = sendMessage;
    document.getElementById('tgInputText').onkeydown = function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    };
  }

  var EMOJIS_MASTER_LIST = [
    '👍', '❤️', '🔥', '👏', '🎉', '🤩', '😂', '😢', '😡', '🙏',
    '💯', '🚀', '🤔', '👀', '🥳', '⚡', '👎', '❤️‍🔥', '🤝', '🏆',
    '💡', '😍', '✨', '💪', '🎯', '👌', '😎', '😇', '🤫', '🫡',
    '🤯', '😭', '🤮', '😴', '👋', '🎓', '📚', '☕', '🌟', '🥇'
  ];

  // Telegram Context Menu: Reactions, Reply, Pin, Delete
  function showContextMenu(x, y, msgId, cls, mainContainer) {
    if (activeContextMenu) activeContextMenu.remove();

    var msg = cls.messages.find(function(m) { return m.id === msgId; });
    if (!msg) return;

    var menu = document.createElement('div');
    menu.className = 'tg-context-menu';

    // Position menu within viewport
    var posX = Math.max(10, Math.min(x, window.innerWidth - 245));
    var posY = Math.max(10, Math.min(y, window.innerHeight - 280));
    menu.style.left = posX + 'px';
    menu.style.top = posY + 'px';

    var quickEmojis = S.quickReactions && S.quickReactions.length >= 10 ? S.quickReactions : EMOJIS_MASTER_LIST;

    var html = '' +
      '<div class="tg-context-reactions">' +
      quickEmojis.slice(0, 18).map(function(em) {
        return '<button class="tg-context-reaction-btn" data-em="' + em + '">' + em + '</button>';
      }).join('') +
      '  <button class="tg-context-reaction-btn" id="tgMoreEmojisBtn" title="All Emojis">➕</button>' +
      '</div>' +
      '<button class="tg-context-item" id="ctxReplyBtn">' + ic('reply') + ' Reply</button>' +
      '<button class="tg-context-item" id="ctxPinBtn">' + ic('pin') + ' Pin Message</button>' +
      '<button class="tg-context-item danger" id="ctxDeleteBtn">' + ic('trash') + ' Delete Forever</button>';

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
        replyText.innerHTML = ic('reply') + ' <b>Replying to: ' + esc(msg.senderName) + '</b>: "' + esc(msg.text.slice(0, 45)) + '..."';
        document.getElementById('tgInputText').focus();
      }
      menu.remove();
      activeContextMenu = null;
    };

    menu.querySelector('#ctxPinBtn').onclick = function() {
      cls.pinnedId = msg.id;
      App.saveState();
      if (window.EthithSync) {
        window.EthithSync.broadcastLocal(S.classes, S.exams);
        window.EthithSync.pushRemoteStore(S.classes, S.exams);
      }
      menu.remove();
      activeContextMenu = null;
      renderClassDetail(mainContainer, cls);
    };

    menu.querySelector('#ctxDeleteBtn').onclick = function() {
      if (confirm("Are you sure you want to permanently delete this message?")) {
        cls.messages = cls.messages.filter(function(m) { return m.id !== msg.id; });
        if (cls.pinnedId === msg.id) cls.pinnedId = null;
        if (!cls.deletedMsgIds) cls.deletedMsgIds = [];
        if (cls.deletedMsgIds.indexOf(msg.id) === -1) cls.deletedMsgIds.push(msg.id);
        App.saveState();
        if (window.EthithSync) {
          window.EthithSync.broadcastLocal(S.classes, S.exams);
          window.EthithSync.pushRemoteStore(S.classes, S.exams);
        }
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

    var userId = (S.user && (S.user.email || S.user.id)) || 'guest';
    var idx = msg.reactions[emoji].indexOf(userId);
    if (idx > -1) {
      msg.reactions[emoji].splice(idx, 1);
    } else {
      msg.reactions[emoji].push(userId);
    }

    // Dynamic ordering: the most recently clicked emoji moves to the very first position (position 0)!
    var qr = (S.quickReactions && S.quickReactions.length > 0) ? S.quickReactions.slice() : EMOJIS_MASTER_LIST.slice();
    var qIdx = qr.indexOf(emoji);
    if (qIdx > -1) qr.splice(qIdx, 1);
    qr.unshift(emoji);
    S.quickReactions = qr;

    App.saveState();
    if (window.EthithSync) {
      window.EthithSync.broadcastLocal(S.classes, S.exams);
      window.EthithSync.pushRemoteStore(S.classes, S.exams);
    }
    renderClassDetail(mainContainer, cls);
  }

  // Full Emoji Picker Modal
  function showAllEmojisPicker(x, y, msg, cls, mainContainer) {
    if (activeContextMenu) activeContextMenu.remove();

    var picker = document.createElement('div');
    picker.className = 'tg-context-menu';
    picker.style.left = Math.max(10, Math.min(x, window.innerWidth - 270)) + 'px';
    picker.style.top = Math.max(10, Math.min(y, window.innerHeight - 320)) + 'px';
    picker.style.width = '260px';
    picker.style.maxWidth = '280px';

    picker.innerHTML = '' +
      '<div style="font-size:12px;font-weight:700;color:var(--muted);padding:4px 6px">All Emojis:</div>' +
      '<div style="display:grid;grid-template-columns:repeat(6, 1fr);gap:4px;padding:6px;max-height:220px;overflow-y:auto">' +
      EMOJIS_MASTER_LIST.map(function(em) {
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
      '    <p>Real-time analytics: daily study time and mistake frequency per student</p>' +
      '  </div>' +
      '  <div class="eth-modal-body" style="max-height:60vh;overflow-y:auto">' +
      (students.length === 0 ?
        '<p style="color:var(--muted);text-align:center">No students have joined this class yet.</p>' :
        '<table class="eth-leaderboard-table">' +
        '  <thead><tr><th>Student</th><th>Daily Time</th><th>Mistakes</th></tr></thead>' +
        '  <tbody>' +
        students.map(function(s) {
          return '<tr>' +
            '  <td><b>' + esc(s.name) + '</b><br><small style="color:var(--muted)">' + esc(s.email) + '</small></td>' +
            '  <td><b>' + (s.dailyMinutes || 0) + ' mins</b></td>' +
            '  <td><span style="color:#ef4444;font-weight:700">' + (s.mistakes || 0) + ' mistakes</span></td>' +
            '</tr>';
        }).join('') +
        '  </tbody>' +
        '</table>'
      ) +
      '    <button class="eth-btn-primary" id="monCloseBtn" style="margin-top:20px">Close</button>' +
      '  </div>' +
      '</div>';

    document.body.appendChild(overlay);
    overlay.querySelector('#monCloseBtn').onclick = function() {
      overlay.remove();
    };
  }

  // ==========================================
  // VIEW 4: EXAMS & LEADERBOARD
  // ==========================================
  function renderExamsView(container) {
    var isTeacher = S.user && S.user.role === 'teacher';

    var html = '' +
      '<div class="ap-sec" style="margin-top:0">' +
      '  <div>' +
      '    <h2>' + ic('trophy') + ' Exams & Leaderboards</h2>' +
      '    <p>' + (isTeacher ? 'Create custom exams, manage with 6-digit access codes, and monitor live leaderboards.' : 'Enter an exam using the 6-digit access code provided by your teacher.') + '</p>' +
      '  </div>' +
      (isTeacher ?
        '  <button class="eth-btn-primary" id="btnCreateExam" style="width:auto;padding:10px 18px">' + ic('plus') + ' Create New Exam</button>' :
        '  <button class="eth-btn-primary" id="btnJoinExam" style="width:auto;padding:10px 18px">' + ic('clip') + ' Join Exam</button>') +
      '</div>';

    if (S.exams.length === 0) {
      html += '<div class="ap-card ap-empty">' + ic('trophy') + '<h2>No active exams available</h2><p>' + (isTeacher ? 'Create a new exam and share the 6-digit code with your students.' : 'Request the 6-digit exam code from your instructor.') + '</p></div>';
    } else {
      html += '<div class="ap-grid g2">';
      S.exams.forEach(function(ex) {
        var subCount = ex.submissions ? ex.submissions.length : 0;
        html += '' +
          '<div class="ap-card" style="border:1.5px solid var(--border)">' +
          '  <div style="display:flex;justify-content:space-between;margin-bottom:8px">' +
          '    <span class="ap-tag">' + ex.duration + ' mins</span>' +
          '    <span style="font-family:monospace;font-weight:700;color:#2563eb;background:rgba(37,99,235,0.08);padding:3px 8px;border-radius:6px">Kod: ' + ex.code + '</span>' +
          '  </div>' +
          '  <h3 style="font-size:18px;margin-bottom:6px">' + esc(ex.title) + '</h3>' +
          '  <p style="color:var(--muted);font-size:13px;margin:0 0 14px">' + (ex.questions ? ex.questions.length : 0) + ' questions · ' + subCount + ' submissions</p>' +
          '  <div style="display:flex;gap:10px">' +
          '    <button class="ap-btn solid" data-exam-lb="' + ex.id + '" style="flex:1">' + ic('trophy') + ' Leaderboard</button>' +
          (!isTeacher ? '<button class="eth-btn-primary" data-exam-take="' + ex.id + '" style="flex:1">Take Exam ' + ic('right') + '</button>' : '') +
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

    var currentTitle = 'English Examination 2026';
    var currentDuration = 30;
    var currentPoints = 2;
    var currentTab = 'mc';
    var questionsList = [];

    function renderModal() {
      var html = '' +
        '<div class="eth-modal" style="max-width:640px;max-height:90vh;display:flex;flex-direction:column">' +
        '  <div class="eth-modal-header">' +
        '    <h2>Create New Exam</h2>' +
        '    <p>Configure Multiple Choice, Written/Open, or True/False questions</p>' +
        '  </div>' +
        '  <div class="eth-modal-body" style="overflow-y:auto;flex:1">' +
        '    <div class="eth-form-group">' +
        '      <label>Exam Title</label>' +
        '      <input type="text" id="exTitle" placeholder="e.g. Midterm Exam 2026" value="' + esc(currentTitle) + '" required>' +
        '    </div>' +
        '    <div style="display:flex;gap:12px">' +
        '      <div class="eth-form-group" style="flex:1">' +
        '        <label>Time Limit (Minutes)</label>' +
        '        <input type="number" id="exDuration" value="' + currentDuration + '" min="5" max="180">' +
        '      </div>' +
        '      <div class="eth-form-group" style="flex:1">' +
        '        <label>Points Per Question</label>' +
        '        <input type="number" id="exPoints" value="' + currentPoints + '" min="1" max="100">' +
        '      </div>' +
        '    </div>' +
        '    <div style="margin:14px 0 10px">' +
        '      <label style="font-weight:700;font-size:13.5px">Question Format:</label>' +
        '      <div class="eth-tabs" style="margin-top:6px">' +
        '        <button class="eth-tab ' + (currentTab === 'mc' ? 'active' : '') + '" id="tabMcBtn">🔘 Multiple Choice (A,B,C,D)</button>' +
        '        <button class="eth-tab ' + (currentTab === 'written' ? 'active' : '') + '" id="tabWrittenBtn">✍️ Written Answer</button>' +
        '        <button class="eth-tab ' + (currentTab === 'bool' ? 'active' : '') + '" id="tabBoolBtn">☑️ True / False</button>' +
        '        <button class="eth-tab ' + (currentTab === 'bulk' ? 'active' : '') + '" id="tabBulkBtn">📋 Bulk Text Import</button>' +
        '      </div>' +
        '    </div>' +
        '    <div id="qBuilderArea" style="background:var(--bg2);padding:14px;border-radius:12px;margin-bottom:16px">';

      if (currentTab === 'mc') {
        html += '' +
          '<div class="eth-form-group">' +
          '  <label>Question Prompt:</label>' +
          '  <input type="text" id="mcQText" placeholder="e.g. She ___ to school every day.">' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
          '  <div><label style="font-size:12px">Option A:</label><input type="text" id="mcOptA" placeholder="Variant A"></div>' +
          '  <div><label style="font-size:12px">Option B:</label><input type="text" id="mcOptB" placeholder="Variant B"></div>' +
          '  <div><label style="font-size:12px">Option C:</label><input type="text" id="mcOptC" placeholder="Variant C"></div>' +
          '  <div><label style="font-size:12px">Option D:</label><input type="text" id="mcOptD" placeholder="Variant D"></div>' +
          '</div>' +
          '<div class="eth-form-group" style="margin-top:10px">' +
          '  <label>Correct Answer:</label>' +
          '  <select id="mcAnsSelect">' +
          '    <option value="A">Option A</option>' +
          '    <option value="B">Option B</option>' +
          '    <option value="C">Option C</option>' +
          '    <option value="D">Option D</option>' +
          '  </select>' +
          '</div>' +
          '<button type="button" class="eth-btn-primary" id="addMcQBtn" style="padding:10px 14px;margin-top:6px">' + ic('plus') + ' Add Multiple Choice Question</button>';
      } else if (currentTab === 'written') {
        html += '' +
          '<div class="eth-form-group">' +
          '  <label>Written Prompt / Task:</label>' +
          '  <textarea id="wQText" rows="2" placeholder="e.g. What is the past participle form of the verb \'write\'?"></textarea>' +
          '</div>' +
          '<div class="eth-form-group">' +
          '  <label>Expected Answer (Exact/Keyword match):</label>' +
          '  <input type="text" id="wAnsText" placeholder="e.g. written">' +
          '</div>' +
          '<button type="button" class="eth-btn-primary" id="addWQBtn" style="padding:10px 14px;margin-top:6px">' + ic('plus') + ' Add Written Question</button>';
      } else if (currentTab === 'bool') {
        html += '' +
          '<div class="eth-form-group">' +
          '  <label>True / False Statement:</label>' +
          '  <input type="text" id="boolQText" placeholder="e.g. The Earth revolves around the Sun.">' +
          '</div>' +
          '<div class="eth-form-group">' +
          '  <label>Correct Answer:</label>' +
          '  <select id="boolAnsSelect">' +
          '    <option value="True">True (To\'g\'ri)</option>' +
          '    <option value="False">False (Noto\'g\'ri)</option>' +
          '  </select>' +
          '</div>' +
          '<button type="button" class="eth-btn-primary" id="addBoolQBtn" style="padding:10px 14px;margin-top:6px">' + ic('plus') + ' Add True / False Question</button>';
      } else if (currentTab === 'bulk') {
        html += '' +
          '<div class="eth-form-group">' +
          '  <label>Paste questions using the template below:</label>' +
          '  <textarea id="bulkTextInput" rows="6" placeholder="1. The capital of Uzbekistan is ___.\nA) Samarkand\nB) Tashkent\nC) Bukhara\nD) Khiva\nAnswer: B\n\n2. Water boils at 100 degrees Celsius.\nA) True\nB) False\nAnswer: A"></textarea>' +
          '</div>' +
          '<button type="button" class="eth-btn-primary" id="parseBulkBtn" style="padding:10px 14px;margin-top:6px">' + ic('plus') + ' Extract & Add Questions from Text</button>';
      }

      html += '' +
        '    </div>' +
        '    <div>' +
        '      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
        '        <b style="font-size:14px">Added Questions: <span style="color:#2563eb">' + questionsList.length + ' questions</span></b>' +
        (questionsList.length > 0 ? '<button id="clearAllQBtn" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:12.5px">Clear All</button>' : '') +
        '      </div>' +
        (questionsList.length === 0 ?
          '<div style="text-align:center;padding:16px;background:var(--card);border:1px dashed var(--border);border-radius:10px;font-size:13px;color:var(--muted)">No questions added yet. Use the question type tools above to add questions.</div>' :
          '<div style="display:flex;flex-direction:column;gap:8px;max-height:160px;overflow-y:auto">' +
          questionsList.map(function(q, i) {
            return '' +
              '<div style="display:flex;justify-content:space-between;align-items:center;background:var(--card);border:1px solid var(--border);padding:8px 12px;border-radius:8px;font-size:13px">' +
              '  <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-right:8px">' +
              '    <b>#' + (i + 1) + ' [' + (q.type === 'written' ? 'Written' : (q.type === 'bool' ? 'T/F' : 'Multiple Choice')) + ']</b> ' + esc(q.question) + ' · <span style="color:#16a34a">Answer: ' + esc(q.answer) + '</span>' +
              '  </div>' +
              '  <button data-del-q="' + i + '" style="background:none;border:none;color:#ef4444;cursor:pointer;font-weight:700">✕</button>' +
              '</div>';
          }).join('') +
          '</div>') +
        '    </div>' +
        '  </div>' +
        '  <div style="display:flex;gap:10px;padding:16px 24px;border-top:1px solid var(--border)">' +
        '    <button type="button" class="ap-btn out" id="exCancelBtn" style="flex:1">Cancel</button>' +
        '    <button type="button" class="eth-btn-primary" id="saveExamFinalBtn" style="flex:2">Save Exam & Generate Code ' + ic('right') + '</button>' +
        '  </div>' +
        '</div>';

      overlay.innerHTML = html;

      // Event listeners
      overlay.querySelector('#exCancelBtn').onclick = function() { overlay.remove(); };
      
      overlay.querySelector('#exTitle').oninput = function(e) { currentTitle = e.target.value; };
      overlay.querySelector('#exDuration').oninput = function(e) { currentDuration = parseInt(e.target.value, 10) || 30; };
      overlay.querySelector('#exPoints').oninput = function(e) { currentPoints = parseInt(e.target.value, 10) || 2; };

      overlay.querySelector('#tabMcBtn').onclick = function() { currentTab = 'mc'; renderModal(); };
      overlay.querySelector('#tabWrittenBtn').onclick = function() { currentTab = 'written'; renderModal(); };
      overlay.querySelector('#tabBoolBtn').onclick = function() { currentTab = 'bool'; renderModal(); };
      overlay.querySelector('#tabBulkBtn').onclick = function() { currentTab = 'bulk'; renderModal(); };

      // Add MC
      var addMcBtn = overlay.querySelector('#addMcQBtn');
      if (addMcBtn) {
        addMcBtn.onclick = function() {
          var qText = document.getElementById('mcQText').value.trim();
          var a = document.getElementById('mcOptA').value.trim();
          var b = document.getElementById('mcOptB').value.trim();
          var c = document.getElementById('mcOptC').value.trim();
          var d = document.getElementById('mcOptD').value.trim();
          var ansKey = document.getElementById('mcAnsSelect').value;
          if (!qText || !a || !b) {
            alert("Please fill in the question prompt and at least options A and B!");
            return;
          }
          var opts = [a, b, c || "None", d || "None"];
          var ansMap = { 'A': a, 'B': b, 'C': c || "None", 'D': d || "None" };
          questionsList.push({
            id: questionsList.length + 1,
            type: 'choice',
            question: qText,
            options: opts,
            answer: ansMap[ansKey] || a
          });
          renderModal();
        };
      }

      // Add Written
      var addWBtn = overlay.querySelector('#addWQBtn');
      if (addWBtn) {
        addWBtn.onclick = function() {
          var qText = document.getElementById('wQText').value.trim();
          var ans = document.getElementById('wAnsText').value.trim();
          if (!qText || !ans) {
            alert("Please enter the written question prompt and the expected answer!");
            return;
          }
          questionsList.push({
            id: questionsList.length + 1,
            type: 'written',
            question: qText,
            options: [],
            answer: ans
          });
          renderModal();
        };
      }

      // Add Bool
      var addBoolBtn = overlay.querySelector('#addBoolQBtn');
      if (addBoolBtn) {
        addBoolBtn.onclick = function() {
          var qText = document.getElementById('boolQText').value.trim();
          var ans = document.getElementById('boolAnsSelect').value;
          if (!qText) {
            alert("Please enter the question prompt!");
            return;
          }
          questionsList.push({
            id: questionsList.length + 1,
            type: 'bool',
            question: qText,
            options: ['True', 'False'],
            answer: ans
          });
          renderModal();
        };
      }

      // Bulk Parse
      var parseBulkBtn = overlay.querySelector('#parseBulkBtn');
      if (parseBulkBtn) {
        parseBulkBtn.onclick = function() {
          var text = document.getElementById('bulkTextInput').value.trim();
          if (!text) {
            alert("Please enter or paste the text content!");
            return;
          }
          // Parse lines
          var blocks = text.split(/\n\s*\n/);
          var countParsed = 0;
          blocks.forEach(function(blk) {
            var lines = blk.split('\n').map(function(l) { return l.trim(); }).filter(Boolean);
            if (lines.length >= 2) {
              var qLine = lines[0].replace(/^\d+[.)]\s*/, '');
              var optA = '', optB = '', optC = '', optD = '';
              var ans = '';
              lines.slice(1).forEach(function(l) {
                if (/^A[.)]\s*/i.test(l)) optA = l.replace(/^A[.)]\s*/i, '');
                else if (/^B[.)]\s*/i.test(l)) optB = l.replace(/^B[.)]\s*/i, '');
                else if (/^C[.)]\s*/i.test(l)) optC = l.replace(/^C[.)]\s*/i, '');
                else if (/^D[.)]\s*/i.test(l)) optD = l.replace(/^D[.)]\s*/i, '');
                else if (/^(Javob|Answer):?\s*/i.test(l)) {
                  var m = l.replace(/^(Javob|Answer):?\s*/i, '').trim();
                  ans = m;
                }
              });
              if (optA && optB) {
                var opts = [optA, optB, optC || "None", optD || "None"];
                var ansVal = optA;
                if (ans === 'B') ansVal = optB;
                else if (ans === 'C') ansVal = optC || "None";
                else if (ans === 'D') ansVal = optD || "None";
                else if (ans) ansVal = ans;
                questionsList.push({
                  id: questionsList.length + 1,
                  type: 'choice',
                  question: qLine,
                  options: opts,
                  answer: ansVal
                });
                countParsed++;
              }
            }
          });
          alert(countParsed + " questions successfully extracted and added!");
          renderModal();
        };
      }

      // Delete question
      overlay.querySelectorAll('[data-del-q]').forEach(function(btn) {
        btn.onclick = function() {
          var idx = parseInt(btn.dataset.delQ, 10);
          questionsList.splice(idx, 1);
          renderModal();
        };
      });

      var clearAllBtn = overlay.querySelector('#clearAllQBtn');
      if (clearAllBtn) {
        clearAllBtn.onclick = function() {
          if (confirm("Are you sure you want to delete all questions?")) {
            questionsList = [];
            renderModal();
          }
        };
      }

      // Save Exam
      overlay.querySelector('#saveExamFinalBtn').onclick = function() {
        if (!currentTitle) {
          alert("Please enter an exam title!");
          return;
        }
        if (questionsList.length === 0) {
          alert("Please add at least one question!");
          return;
        }

        var code = Math.floor(100000 + Math.random() * 900000).toString();
        var newExam = {
          id: 'exam_' + Date.now(),
          code: code,
          title: currentTitle,
          duration: currentDuration,
          pointsPerQ: currentPoints,
          questions: questionsList,
          submissions: []
        };

        S.exams.push(newExam);
        App.saveState();
        if (window.EthithSync) {
          window.EthithSync.broadcastLocal(S.classes, S.exams);
          window.EthithSync.pushRemoteStore(S.classes, S.exams);
        }

        overlay.remove();
        alert("Exam successfully created!\n6-digit access code for students: " + code);
        renderExamsView(container);
      };
    }

    renderModal();
    document.body.appendChild(overlay);
  }

  function showJoinExamModal(container) {
    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';
    overlay.innerHTML = '' +
      '<div class="eth-modal">' +
      '  <div class="eth-modal-header">' +
      '    <h2>Join Exam</h2>' +
      '    <p>Enter the 6-digit special exam code provided by your teacher</p>' +
      '  </div>' +
      '  <div class="eth-modal-body">' +
      '    <form id="joinExamForm">' +
      '      <div class="eth-form-group">' +
      '        <label>6-digit Exam Access Code</label>' +
      '        <input type="text" id="joinExCode" placeholder="e.g. 849201" maxlength="6" required style="font-size:20px;letter-spacing:4px;text-align:center">' +
      '      </div>' +
      '      <button type="submit" class="eth-btn-primary">Start Exam ' + ic('right') + '</button>' +
      '    </form>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.querySelector('#joinExamForm').onsubmit = async function(e) {
      e.preventDefault();
      var code = document.getElementById('joinExCode').value.trim();
      var exam = S.exams.find(function(x) { return x.code === code; });

      if (!exam && window.EthithSync) {
        var remote = await window.EthithSync.fetchRemoteStore();
        if (remote && remote.exams) {
          remote.exams.forEach(function(rx) {
            if (!S.exams.some(function(x) { return x.id === rx.id || x.code === rx.code; })) {
              S.exams.push(rx);
            }
          });
          exam = S.exams.find(function(x) { return x.code === code; });
        }
      }

      if (!exam) {
        alert("No exam found with this 6-digit access code! Please verify the code and try again.");
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
        alert("Time expired! The exam has concluded automatically.");
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
      var qType = q.type || 'choice';

      var html = '' +
        '<div class="ap-quiz">' +
        '  <div class="ap-qtop">' +
        '    <div class="eth-timer-badge">' + ic('clock') + ' <span id="examTimerDisplay">--:--</span></div>' +
        '    <div class="ap-bar"><i style="width:' + ((state.i / exam.questions.length) * 100) + '%"></i></div>' +
        '    <b>' + (state.i + 1) + ' / ' + exam.questions.length + '</b>' +
        '  </div>' +
        '  <div class="ap-qbox">' +
        '    <div class="qn">' + esc(exam.title) + ' · Question ' + (state.i + 1) + ' (' + exam.pointsPerQ + ' pts)</div>' +
        '    <h2>' + esc(q.question) + '</h2>';

      if (qType === 'written') {
        html += '' +
          '<div style="margin:20px 0">' +
          '  <input type="text" id="writtenInput" placeholder="Type your answer here..." style="width:100%;padding:14px;border:1.5px solid var(--border);border-radius:12px;font-size:16px;outline:none">' +
          '  <button class="eth-btn-primary" id="submitWrittenAnsBtn" style="margin-top:14px">Keyingisi ' + ic('right') + '</button>' +
          '</div>';
      } else if (qType === 'bool') {
        html += '' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0">' +
          '  <button class="ap-opt" data-opt="True" style="justify-content:center;font-size:16px;font-weight:700">✓ True (To\'g\'ri)</button>' +
          '  <button class="ap-opt" data-opt="False" style="justify-content:center;font-size:16px;font-weight:700">✗ False (Noto\'g\'ri)</button>' +
          '</div>';
      } else {
        html += '' +
          '<div>' +
          q.options.map(function(opt, idx) {
            return '<button class="ap-opt" data-opt="' + esc(opt) + '"><span class="l">' + 'ABCD'[idx] + '</span>' + esc(opt) + '</button>';
          }).join('') +
          '</div>';
      }

      html += '  </div></div>';
      mainContainer.innerHTML = html;

      if (qType === 'written') {
        var subBtn = document.getElementById('submitWrittenAnsBtn');
        var inputW = document.getElementById('writtenInput');
        inputW.focus();
        function commitW() {
          var val = inputW.value.trim();
          var isMatch = (val.toLowerCase() === (q.answer || '').trim().toLowerCase());
          if (isMatch) state.score += exam.pointsPerQ;
          state.answers[state.i] = val;
          state.i++;
          renderExamQuestion();
        }
        subBtn.onclick = commitW;
        inputW.onkeydown = function(e) { if (e.key === 'Enter') commitW(); };
      } else {
        mainContainer.querySelectorAll('.ap-opt').forEach(function(btn) {
          btn.onclick = function() {
            var sel = btn.dataset.opt;
            if (sel.toLowerCase() === (q.answer || '').toLowerCase()) state.score += exam.pointsPerQ;
            state.answers[state.i] = sel;
            state.i++;
            renderExamQuestion();
          };
        });
      }
    }

    function finishExam() {
      var totalPossible = exam.questions.length * exam.pointsPerQ;
      var pct = Math.round((state.score / totalPossible) * 100);
      var timeSpentMin = Math.round((exam.duration * 60 - Math.max(0, timeLeftSeconds)) / 60);

      var sub = {
        studentId: (S.user && S.user.email) || S.user.id,
        studentName: S.user.name,
        studentEmail: S.user.email,
        score: state.score,
        totalPossible: totalPossible,
        percent: pct,
        timeSpent: timeSpentMin + ' min',
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      if (!exam.submissions) exam.submissions = [];
      exam.submissions.push(sub);
      App.saveState();
      if (window.EthithSync) {
        window.EthithSync.broadcastLocal(S.classes, S.exams);
        window.EthithSync.pushRemoteStore(S.classes, S.exams);
      }

      // Show Result
      var html = '' +
        '<div class="ap-res">' +
        '  <h2>Exam Completed!</h2>' +
        '  <p>Your Final Score: <b>' + state.score + ' / ' + totalPossible + ' points (' + pct + '%)</b></p>' +
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
      '    <p>Ranked by highest score and completion speed</p>' +
      '  </div>' +
      '  <div class="eth-modal-body" style="max-height:60vh;overflow-y:auto">' +
      (subs.length === 0 ?
        '<p style="color:var(--muted);text-align:center">No students have taken this exam yet.</p>' :
        '<table class="eth-leaderboard-table">' +
        '  <thead><tr><th>Rank</th><th>Student</th><th>Score</th><th>Time Spent</th></tr></thead>' +
        '  <tbody>' +
        subs.map(function(s, idx) {
          var rankCls = (idx === 0 ? 'eth-rank-1' : (idx === 1 ? 'eth-rank-2' : (idx === 2 ? 'eth-rank-3' : '')));
          return '<tr>' +
            '  <td><span class="eth-rank-badge ' + rankCls + '">' + (idx + 1) + '</span></td>' +
            '  <td><b>' + esc(s.studentName) + '</b></td>' +
            '  <td><b style="color:#2563eb">' + s.score + ' pts (' + s.percent + '%)</b></td>' +
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
      '    <h2>' + ic('clip') + ' Language Hub Official Placement Test (70 Questions)</h2>' +
      '    <p>Assess your accurate English proficiency level according to the official CEFR scale. Total time: 1.5 hours (90 minutes).</p>' +
      '  </div>' +
      '</div>' +
      '<div class="ap-intro">' +
      '  <div class="ap-lhero">' +
      '    <h1>CEFR Placement Test</h1>' +
      '    <p>70 diagnostic grammar and vocabulary questions from Beginner (A1) to Advanced (C2).</p>' +
      '  </div>' +
      '  <ul>' +
      '    <li>' + ic('list') + ' 70 comprehensive multiple-choice grammar and vocabulary questions</li>' +
      '    <li>' + ic('clock') + ' 1.5 hours (90 minutes) total continuous time</li>' +
      '    <li>' + ic('trophy') + ' Instant, accurate CEFR level assessment (A1 through C2) based on official standards</li>' +
      '  </ul>' +
      '  <button class="eth-btn-primary" id="startPlacementTestBtn" style="font-size:16px;padding:14px 28px">Start Test ' + ic('right') + '</button>' +
      '</div>';

    container.innerHTML = html;

    document.getElementById('startPlacementTestBtn').onclick = function() {
      runPlacementTest(container, questions);
    };
  }

  function runPlacementTest(mainContainer, questions) {
    var timeLeft = 90 * 60; // Exactly 1.5 hours (90 minutes) total for all 70 questions
    var state = {
      i: 0,
      score: 0,
      answers: {}
    };

    function formatTime(sec) {
      if (sec < 0) sec = 0;
      var hrs = Math.floor(sec / 3600);
      var m = Math.floor((sec % 3600) / 60);
      var s = sec % 60;
      return (hrs < 10 ? '0' : '') + hrs + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }

    var interval = setInterval(function() {
      timeLeft--;
      var badge = document.getElementById('plcTimer');
      if (badge) {
        badge.textContent = formatTime(timeLeft);
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
        '    <div class="eth-timer-badge" title="Total 1.5 hours allocated for all 70 questions">' + ic('clock') + ' <span id="plcTimer">' + formatTime(timeLeft) + '</span></div>' +
        '    <div class="ap-bar"><i style="width:' + ((state.i / questions.length) * 100) + '%"></i></div>' +
        '    <b>' + (state.i + 1) + ' / ' + questions.length + '</b>' +
        '  </div>' +
        '  <div class="ap-qbox">' +
        '    <div class="qn">Placement Test (1.5-hour total exam) · Question ' + (state.i + 1) + ' / 70</div>' +
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
        '  <h2>Your Assessed Level: <span style="color:#2563eb">' + level + ' (' + levelDesc + ')</span></h2>' +
        '  <p>Earned Score: <b>' + score + ' / ' + questions.length + '</b></p>' +
        '  <p style="color:var(--muted);font-size:14px;max-width:540px;margin:0 auto 20px">In accordance with Language Hub official guidelines, your proficiency level has been determined and assigned to your profile.</p>' +
        '  <button class="eth-btn-primary" id="plcDoneBtn" style="margin:0 auto;width:auto;padding:12px 24px">Continue Learning ' + ic('right') + '</button>' +
        '</div>';

      mainContainer.innerHTML = html;
      document.getElementById('plcDoneBtn').onclick = function() {
        window.ethithOpenApp('level', S.level);
      };
    }

    renderQ();
  }

  // ==========================================
  // VIEW 6: MISTAKES NOTEBOOK
  // ==========================================
  function renderMistakesNotebook(container) {
    var mistakes = S.mistakes || [];

    var html = '' +
      '<div class="ap-sec" style="margin-top:0">' +
      '  <div>' +
      '    <h2>' + ic('clip') + ' Mistakes Notebook (' + mistakes.length + ' mistakes)</h2>' +
      '    <p>Review all questions you answered incorrectly along with detailed pedagogical explanations.</p>' +
      '  </div>' +
      (mistakes.length > 0 ? '  <button class="ap-btn out" id="clrMistakesBtn">Clear Notebook</button>' : '') +
      '</div>';

    if (mistakes.length === 0) {
      html += '<div class="ap-card ap-empty">' + ic('check') + '<h2>Mistakes Notebook is empty</h2><p>When you make mistakes in quizzes, they will be saved here automatically for targeted revision.</p></div>';
    } else {
      html += '<div class="ap-grid g2">';
      mistakes.slice().reverse().forEach(function(m) {
        html += '' +
          '<div class="ap-card" style="border-left:4px solid #ef4444">' +
          '  <span class="ap-tag">' + esc(m.level || 'Test') + ' · ' + esc(m.topic || 'Topic') + '</span>' +
          '  <h4 style="margin:10px 0 8px;font-size:15px">' + esc(m.question) + '</h4>' +
          '  <div style="font-size:13px;margin-bottom:6px"><b style="color:#ef4444">Your answer:</b> ' + esc(m.yourAnswer) + '</div>' +
          '  <div style="font-size:13px;margin-bottom:8px"><b style="color:#16a34a">Correct Answer:</b> ' + esc(m.correctAnswer) + '</div>' +
          '  <div style="background:var(--bg2);padding:8px 12px;border-radius:8px;font-size:12.5px;color:var(--text)">💡 ' + esc(m.explanation) + '</div>' +
          '</div>';
      });
      html += '</div>';
    }

    container.innerHTML = html;

    var clrBtn = document.getElementById('clrMistakesBtn');
    if (clrBtn) {
      clrBtn.onclick = function() {
        if (confirm("Are you sure you want to clear your Mistakes Notebook?")) {
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
