/**
 * ETHITH Platform Main Application Logic
 * Created by Muhammadyusuf Jo'raboyev
 */

(function(window) {
  'use strict';

  var DEFAULT_TEACHER_KEY = 'jds8d738hjsdhd8w9dhsihd89wydhshd';
  var QUICK_EMOJIS_DEFAULT = ['👍', '❤️', '🔥', '👏', '🎉', '🤩', '🚀', '💯', '🤝', '💡'];
  var ALL_EMOJIS = ['👍', '❤️', '🔥', '👏', '🎉', '🤩', '🚀', '💯', '🤝', '💡', '😂', '🥳', '🤔', '😢', '🙏', '🎯', '✨', '🧠', '📚', '✍️', '🙌', '💪', '🏆', '⭐'];

  var DEFAULT_CLASSES = [
    {
      id: 'cls_ethith_main',
      name: 'IELTS & General English Intensive',
      code: 'ETH-L6S8CM',
      teacherId: 'joraboyevmuhammad85@gmail.com',
      teacherName: 'Instructor Muhammadyusuf',
      teacherEmail: 'joraboyevmuhammad85@gmail.com',
      created: Date.now(),
      students: [],
      messages: [
        {
          id: 'msg_welcome_1',
          senderId: 'joraboyevmuhammad85@gmail.com',
          senderName: 'Instructor Muhammadyusuf',
          text: 'Welcome to the official ETHITH Class! Here you can ask questions, discuss lessons, and collaborate on assignments in real time.',
          time: '12:00',
          reactions: { '👍': ['joraboyevmuhammad85@gmail.com'] }
        }
      ],
      pinnedId: null
    }
  ];

  // Application State
  var S = {
    user: null, // { role: 'student'|'teacher', name: '', email: '', id: '', dailyMinutes: 0 }
    level: 'A1',
    unlocked: { A1: 1, A2: 1, B1: 1, B2: 1, C1: 1, C2: 1 },
    mistakes: [],
    theme: 'light',
    classes: DEFAULT_CLASSES.slice(),
    exams: [],
    deletedExamIds: [],
    notifications: [],
    aiHistory: [],
    aiConversations: [],
    currentAiChatId: null,
    quickReactions: QUICK_EMOJIS_DEFAULT.slice(),
    activeClassId: null,
    activeExamId: null,
    activeTopicQuiz: null,
    activePlacementQuiz: null
  };

  // Load state from localStorage
  try {
    var raw = localStorage.getItem('ethith_v2_state');
    if (raw) {
      var parsed = JSON.parse(raw);
      for (var k in parsed) {
        if (parsed[k] !== undefined) S[k] = parsed[k];
      }
    }
  } catch(e) {}

  if (!S.deletedExamIds) S.deletedExamIds = [];
  if (!S.notifications) S.notifications = [];

  if (!S.classes || S.classes.length === 0) {
    S.classes = DEFAULT_CLASSES.slice();
  } else if (!S.classes.some(function(c) { return c.code === 'ETH-L6S8CM'; })) {
    S.classes.unshift(DEFAULT_CLASSES[0]);
  }

  // Ensure aiConversations exists & migrate legacy aiHistory if needed
  if (!S.aiConversations) {
    S.aiConversations = [];
  }
  if (S.aiConversations.length === 0) {
    if (S.aiHistory && S.aiHistory.length > 0) {
      var firstMsg = S.aiHistory[0].text || 'Conversation 1';
      var title = firstMsg.slice(0, 36).trim() + (firstMsg.length > 36 ? '...' : '');
      var initConv = {
        id: 'conv_' + Date.now(),
        title: title,
        messages: S.aiHistory.slice(),
        updatedAt: Date.now()
      };
      S.aiConversations.push(initConv);
      S.currentAiChatId = initConv.id;
    } else {
      var initConv = {
        id: 'conv_' + Date.now(),
        title: 'New Conversation',
        messages: [],
        updatedAt: Date.now()
      };
      S.aiConversations.push(initConv);
      S.currentAiChatId = initConv.id;
    }
  } else if (!S.currentAiChatId || !S.aiConversations.some(function(c) { return c.id === S.currentAiChatId; })) {
    S.currentAiChatId = S.aiConversations[0].id;
  }

  // Trigger remote sync if available
  if (window.EthithSync && window.EthithSync.syncInitialData) {
    window.EthithSync.syncInitialData(S);
  }

  function saveState() {
    try {
      localStorage.setItem('ethith_v2_state', JSON.stringify(S));
      // Notify other tabs via BroadcastChannel if available
      if (window.BroadcastChannel) {
        if (!window._ethithChannel) window._ethithChannel = new BroadcastChannel('ethith_sync');
        window._ethithChannel.postMessage({ type: 'sync' });
      }
    } catch(e) {}
  }

  // Cross-tab sync listener
  if (window.BroadcastChannel) {
    var ch = new BroadcastChannel('ethith_sync');
    ch.onmessage = function(e) {
      if (e.data && e.data.type === 'sync') {
        try {
          var updated = JSON.parse(localStorage.getItem('ethith_v2_state'));
          if (updated) {
            S.classes = updated.classes || S.classes;
            S.exams = updated.exams || S.exams;
            if (window._ethithCurrentView === 'classes' && S.activeClassId) {
              renderClassChat();
            }
          }
        } catch(err) {}
      }
    };
  }

  // Activity tracking timer
  setInterval(function() {
    if (S.user) {
      S.user.dailyMinutes = (S.user.dailyMinutes || 0) + 1;
      // Also update in class lists if student
      if (S.user.role === 'student') {
        S.classes.forEach(function(c) {
          if (c.students) {
            var st = c.students.find(function(s) { return s.id === S.user.id || s.email === S.user.email; });
            if (st) st.dailyMinutes = S.user.dailyMinutes;
          }
        });
      }
      saveState();
    }
  }, 60000);

  // SVG Helper
  var IC = {
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
    book: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
    clip: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
    msg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    right: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    left: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    unlock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
    pin: '<path d="M12 17v5M9 2h6l1 7 4 3v2H4v-2l4-3 1-7z"/>',
    trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    reply: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v1.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    paperclip: '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.49-8.49a4 4 0 0 1 5.66 5.66l-8.49 8.49a2 2 0 0 1-2.83-2.83l7.78-7.78"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    sparkles: '<path d="m12 3 1.9 4.7L18.6 9l-4.7 1.9L12 15.6l-1.9-4.7L5.4 9l4.7-1.9L12 3z"/><path d="M5 3v4M3 5h4M19 17v4M17 19h4"/>'
  };

  function ic(name, cls) {
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (IC[name] || '') + '</svg>';
  }

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function(c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // 1. Mandatory Auth Modal
  function showAuthModal() {
    var existing = document.getElementById('ethAuthOverlay');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';
    overlay.id = 'ethAuthOverlay';

    var html = '' +
      '<div class="eth-modal">' +
      '  <div class="eth-modal-header">' +
      '    <div style="display:flex;justify-content:center;margin-bottom:8px">' +
      '      <svg width="150" height="48" viewBox="0 0 160 56"><defs><linearGradient id="mlg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4e93e4"/><stop offset="1" stop-color="#154b89"/></linearGradient></defs><rect x="0" y="4" width="48" height="48" rx="13" fill="url(#mlg)"/><path d="M13 29l8 8 15-17" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><text x="58" y="25" font-family="sans-serif" font-weight="800" font-size="24" fill="#0e325c">ETHITH</text><text x="58" y="50" font-family="sans-serif" font-weight="800" font-size="21" fill="#4e93e4">TESTS</text></svg>' +
      '    </div>' +
      '    <h2>Sign In to Platform</h2>' +
      '    <p>Sign in as a Student or Teacher to access your portal</p>' +
      '  </div>' +
      '  <div class="eth-tabs">' +
      '    <button class="eth-tab active" id="tabStudentBtn">Student</button>' +
      '    <button class="eth-tab" id="tabTeacherBtn">Teacher</button>' +
      '  </div>' +
      '  <div class="eth-modal-body">' +
      '    <div id="studentFormBox">' +
      '      <form id="studentAuthForm">' +
      '        <div class="eth-form-group">' +
      '          <label>Full Name</label>' +
      '          <input type="text" id="stName" placeholder="Your full name" required>' +
      '        </div>' +
      '        <div class="eth-form-group">' +
      '          <label>Gmail Address</label>' +
      '          <input type="email" id="stEmail" placeholder="yourname@gmail.com" required>' +
      '        </div>' +
      '        <div class="eth-form-group">' +
      '          <label>Security PIN / Password (6+ chars)</label>' +
      '          <input type="password" id="stPin" placeholder="6-digit security code" minlength="6" maxlength="20" required>' +
      '        </div>' +
      '        <button type="submit" class="eth-btn-primary">Sign in as Student ' + ic('right') + '</button>' +
      '      </form>' +
      '    </div>' +
      '    <div id="teacherFormBox" style="display:none">' +
      '      <form id="teacherAuthForm">' +
      '        <div class="eth-form-group">' +
      '          <label>Teacher Name</label>' +
      '          <input type="text" id="tcName" placeholder="Instructor name" required>' +
      '        </div>' +
      '        <div class="eth-form-group">' +
      '          <label>Email Address</label>' +
      '          <input type="email" id="tcEmail" placeholder="teacher@gmail.com" required>' +
      '        </div>' +
      '        <div class="eth-form-group">' +
      '          <label>Secret Master Key (15+ chars)</label>' +
      '          <input type="password" id="tcMasterKey" placeholder="Enter teacher secret key" required>' +
      '          <small style="color:var(--muted);font-size:12px;margin-top:4px;display:block">Authorized instructors only</small>' +
      '        </div>' +
      '        <button type="submit" class="eth-btn-primary" style="background:linear-gradient(135deg, #0f172a, #2563eb)">Sign in as Teacher ' + ic('right') + '</button>' +
      '      </form>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    var tabStudentBtn = overlay.querySelector('#tabStudentBtn');
    var tabTeacherBtn = overlay.querySelector('#tabTeacherBtn');
    var studentFormBox = overlay.querySelector('#studentFormBox');
    var teacherFormBox = overlay.querySelector('#teacherFormBox');

    if (tabStudentBtn && tabTeacherBtn) {
      tabStudentBtn.onclick = function() {
        tabStudentBtn.classList.add('active');
        tabTeacherBtn.classList.remove('active');
        studentFormBox.style.display = 'block';
        teacherFormBox.style.display = 'none';
      };

      tabTeacherBtn.onclick = function() {
        tabTeacherBtn.classList.add('active');
        tabStudentBtn.classList.remove('active');
        studentFormBox.style.display = 'none';
        teacherFormBox.style.display = 'block';
      };
    }

    var stForm = overlay.querySelector('#studentAuthForm');
    if (stForm) {
      stForm.onsubmit = function(e) {
        e.preventDefault();
        var nameInput = overlay.querySelector('#stName');
        var emailInput = overlay.querySelector('#stEmail');
        var pinInput = overlay.querySelector('#stPin');

        var name = (nameInput ? nameInput.value : '').trim();
        var email = (emailInput ? emailInput.value : '').trim();
        var pin = (pinInput ? pinInput.value : '').trim();

        if (!name || !email || !pin) {
          alert("Please fill in all required fields!");
          return;
        }

        S.user = {
          id: 'st_' + Math.random().toString(36).substr(2, 9),
          role: 'student',
          name: name,
          email: email,
          dailyMinutes: 0
        };
        saveState();
        overlay.remove();
        window.ethithOpenApp('dash');
      };
    }

    var tcForm = overlay.querySelector('#teacherAuthForm');
    if (tcForm) {
      tcForm.onsubmit = function(e) {
        e.preventDefault();
        var nameInput = overlay.querySelector('#tcName');
        var emailInput = overlay.querySelector('#tcEmail');
        var masterInput = overlay.querySelector('#tcMasterKey');

        var name = (nameInput ? nameInput.value : '').trim();
        var email = (emailInput ? emailInput.value : '').trim();
        var masterKey = (masterInput ? masterInput.value : '').trim();

        var currentMaster = localStorage.getItem('ethith_teacher_master') || DEFAULT_TEACHER_KEY;

        if (masterKey !== currentMaster) {
          alert("Authentication Error: Incorrect instructor master key! Please enter the valid code.");
          return;
        }

        S.user = {
          id: 'tc_' + Math.random().toString(36).substr(2, 9),
          role: 'teacher',
          name: name,
          email: email,
          dailyMinutes: 0
        };
        saveState();
        overlay.remove();
        window.ethithOpenApp('dash');
      };
    }
  }

  // 2. Coming Soon Modal
  function showComingSoon(featureName) {
    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';
    overlay.innerHTML = '' +
      '<div class="eth-modal" style="text-align:center;padding:32px 24px">' +
      '  <div style="font-size:48px;margin-bottom:12px">🚀</div>' +
      '  <h2 style="font-size:22px;color:var(--eth-primary);margin-bottom:8px">' + esc(featureName) + '</h2>' +
      '  <div style="display:inline-block;margin-bottom:16px"><span class="eth-coming-soon-badge">Coming Soon</span></div>' +
      '  <p style="color:var(--muted);font-size:14.5px;line-height:1.6;margin-bottom:24px">This section is currently under active development and will be available soon. You can currently practice all A1-C2 topics, Ask AI Teacher, Classrooms, and Exams.</p>' +
      '  <button class="eth-btn-primary" id="csClose">Got It ' + ic('check') + '</button>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.querySelector('#csClose').onclick = function() {
      overlay.remove();
    };
  }

  window.EthithApp = {
    state: S,
    showAuthModal: showAuthModal,
    showComingSoon: showComingSoon,
    saveState: saveState,
    ic: ic,
    esc: esc
  };


  window.ethithOpenApp = function(n, a) {
    if (!S.user) {
      showAuthModal();
      return;
    }
    var landing = document.getElementById('landing');
    var ap = document.getElementById('app');
    if (landing) landing.style.display = 'none';
    if (ap) {
      ap.style.display = 'block';
      ap.setAttribute('data-theme', S.theme);
    }
    if (window._ethithInternalGo) {
      window._ethithInternalGo(n || 'dash', a || null);
    }
  };

  window.ethithShowLanding = function() {
    if (S.user) {
      window.ethithOpenApp('dash');
      return;
    }
    var ap = document.getElementById('app');
    var landing = document.getElementById('landing');
    if (ap) ap.style.display = 'none';
    if (landing) landing.style.display = '';
    window.scrollTo(0, 0);
  };

  function autoEnterIfLoggedIn() {
    if (S.user) {
      var landing = document.getElementById('landing');
      var ap = document.getElementById('app');
      if (landing) landing.style.display = 'none';
      if (ap) {
        ap.style.display = 'block';
        ap.setAttribute('data-theme', S.theme);
      }
      if (window._ethithInternalGo) {
        window._ethithInternalGo('dash');
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoEnterIfLoggedIn);
  } else {
    setTimeout(autoEnterIfLoggedIn, 10);
  }

})(window);
