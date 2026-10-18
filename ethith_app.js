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
    quizzes: [],
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
  if (!S.deletedQuizIds) S.deletedQuizIds = [];
  if (S.deletedQuizIds.indexOf('quiz_main_blitz') === -1) {
    S.deletedQuizIds.push('quiz_main_blitz');
  }
  if (!S.notifications) S.notifications = [];
  if (!Array.isArray(S.accounts)) S.accounts = [];
  if (!Array.isArray(S.p2pListings) || S.p2pListings.length === 0) {
    try {
      var savedP2P = JSON.parse(localStorage.getItem('ethith_p2p_listings') || '[]');
      if (Array.isArray(savedP2P) && savedP2P.length > 0) S.p2pListings = savedP2P;
    } catch(e) {}
  }
  if (!Array.isArray(S.deletedListingIds)) {
    try {
      var savedDelP2P = JSON.parse(localStorage.getItem('ethith_deleted_listing_ids') || '[]');
      if (Array.isArray(savedDelP2P)) S.deletedListingIds = savedDelP2P;
    } catch(e) {}
  }
  if (!Array.isArray(S.p2pListings)) S.p2pListings = [];
  if (!Array.isArray(S.deletedListingIds)) S.deletedListingIds = [];
  if (S.user) {
    if (!S.user.boosters) S.user.boosters = { '50_50': 0, 'time_freeze': 0, 'shield': 0, 'booster_2x': 0 };
    if (S.user.booster2xUntil === undefined) S.user.booster2xUntil = 0;
  }

  if (S.user) {
    var curEmail = (S.user.email || '').toLowerCase().trim();
    var curName = (S.user.name || '').trim();
    var isMuhammadUser = (curName.toLowerCase().indexOf('muhammad') !== -1 || curEmail.indexOf('muhammad') !== -1) && S.user.role !== 'teacher';
    
    var bonusGivenKey = 'ethith_bonus_100k_' + (curEmail || curName).toLowerCase().replace(/\s+/g, '_');
    var alreadyGiven = false;
    try {
      alreadyGiven = (localStorage.getItem(bonusGivenKey) === 'true') || S.user.initial100kBonusGiven;
    } catch(e) {}

    if (isMuhammadUser && !alreadyGiven) {
      S.user.coins = 100000;
      S.user.initial100kBonusGiven = true;
      try { localStorage.setItem(bonusGivenKey, 'true'); } catch(e) {}
    } else if (S.user.coins === undefined || S.user.coins === null) {
      S.user.coins = 150;
    }
    if (!Array.isArray(S.user.gifts)) S.user.gifts = [];

    // Ensure user is present in S.accounts
    var exAcc = S.accounts.find(function(a) {
      return (curEmail && a.email && a.email.toLowerCase() === curEmail) ||
             (curName && a.name && a.name.toLowerCase() === curName.toLowerCase());
    });
    if (!exAcc) {
      S.accounts.push({
        id: S.user.id || ('st_' + Date.now()),
        role: S.user.role || 'student',
        name: curName || 'Foydalanuvchi',
        email: curEmail || (curName.toLowerCase().replace(/\s+/g, '.') + '@ethith.uz'),
        coins: S.user.coins,
        gifts: S.user.gifts,
        initial100kBonusGiven: S.user.initial100kBonusGiven,
        createdAt: Date.now()
      });
    } else {
      if (isMuhammadUser && !alreadyGiven) {
        exAcc.coins = 100000;
        exAcc.initial100kBonusGiven = true;
        S.user.coins = 100000;
      } else {
        if (S.user.coins !== undefined && S.user.coins !== null) {
          exAcc.coins = S.user.coins;
        } else if (exAcc.coins !== undefined && exAcc.coins !== null) {
          S.user.coins = exAcc.coins;
        } else {
          S.user.coins = 150;
          exAcc.coins = 150;
        }
      }
      if (Array.isArray(exAcc.gifts) && exAcc.gifts.length > 0 && S.user.gifts.length === 0) {
        S.user.gifts = exAcc.gifts.slice();
      }
    }

    // Restore from dedicated localStorage backup if needed
    var myKey = (curEmail || curName).toLowerCase().trim();
    if (myKey && S.user.gifts.length === 0) {
      try {
        var backupGifts = JSON.parse(localStorage.getItem('ethith_student_gifts_' + myKey) || '[]');
        if (Array.isArray(backupGifts) && backupGifts.length > 0) {
          S.user.gifts = backupGifts.slice();
        }
      } catch(e) {}
    }
  }

  if (!S.classes || S.classes.length === 0) {
    S.classes = DEFAULT_CLASSES.slice();
  } else if (!S.classes.some(function(c) { return c.code === 'ETH-L6S8CM'; })) {
    S.classes.unshift(DEFAULT_CLASSES[0]);
  }

  // Ensure aiConversations exists
  if (!Array.isArray(S.aiConversations)) {
    S.aiConversations = [];
  }
  // User Requirement: When the site is reloaded/refreshed, always start with a fresh new chat session
  var freshChatId = 'conv_' + Date.now();
  var freshChat = {
    id: freshChatId,
    title: 'Yangi Suhbat',
    messages: [],
    updatedAt: Date.now()
  };
  S.aiConversations.unshift(freshChat);
  S.currentAiChatId = freshChatId;
  S.aiHistory = [];

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
            S.quizzes = updated.quizzes || S.quizzes;
            if (Array.isArray(updated.accounts)) S.accounts = updated.accounts;
            if (updated.user && S.user && (updated.user.email === S.user.email || updated.user.id === S.user.id)) {
              if (Array.isArray(updated.user.gifts)) S.user.gifts = updated.user.gifts;
            }
            if (window._ethithCurrentView === 'classes' && S.activeClassId) {
              renderClassChat();
            }
            if (window._ethithRefreshGifts && window._ethithCurrentView === 'quiz' && !window._ethithIsTestInProgress) {
              window._ethithRefreshGifts();
            }
            if (window._ethithRefreshFriendsList && !window._ethithIsTestInProgress) {
              window._ethithRefreshFriendsList();
            }
            if (window._ethithRefreshLeaderboard && window._ethithCurrentView === 'leaderboard' && !window._ethithIsTestInProgress) {
              window._ethithRefreshLeaderboard();
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

  // 1. Mandatory Auth Modal with Telegram Mini App Verification Code Flow
  function showAuthModal() {
    var existing = document.getElementById('ethAuthOverlay');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';
    overlay.id = 'ethAuthOverlay';

    var tgUser = null;
    try {
      if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
        tgUser = window.Telegram.WebApp.initDataUnsafe.user;
      }
    } catch(e) {}

    var defaultName = tgUser ? (tgUser.first_name + (tgUser.last_name ? (' ' + tgUser.last_name) : '')) : '';

    var html = '' +
      '<div class="eth-modal" style="max-width:440px">' +
      '  <div class="eth-modal-header">' +
      '    <div style="display:flex;justify-content:center;margin-bottom:8px">' +
      '      <svg width="150" height="48" viewBox="0 0 160 56"><defs><linearGradient id="mlg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4e93e4"/><stop offset="1" stop-color="#154b89"/></linearGradient></defs><rect x="0" y="4" width="48" height="48" rx="13" fill="url(#mlg)"/><path d="M13 29l8 8 15-17" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><text x="58" y="25" font-family="sans-serif" font-weight="800" font-size="24" fill="#0e325c">ETHITH</text><text x="58" y="50" font-family="sans-serif" font-weight="800" font-size="21" fill="#4e93e4">TESTS</text></svg>' +
      '    </div>' +
      '    <h2>Platformaga Kirish</h2>' +
      '    <p style="color:var(--muted);font-size:13px">Telegram Bot orqali tasdiqlash kodi bilan xavfsiz ro\'yxatdan o\'ting</p>' +
      '  </div>' +
      '  <div class="eth-tabs" style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:16px">' +
      '    <button type="button" class="eth-tab active" id="tabStudentBtn" style="padding:10px;font-weight:800;border-radius:10px">🎓 O\'quvchi</button>' +
      '    <button type="button" class="eth-tab" id="tabTeacherBtn" style="padding:10px;font-weight:800;border-radius:10px">👨‍🏫 O\'qituvchi</button>' +
      '  </div>' +
      '  <div class="eth-modal-body">' +
      '    <div id="studentFormBox">' +
      '      <form id="studentAuthForm">' +
      '        <div class="eth-form-group">' +
      '          <label style="font-weight:700;font-size:13px">Ism va Familiya</label>' +
      '          <input type="text" id="stName" placeholder="Ismingizni kiriting" value="' + esc(defaultName) + '" required>' +
      '        </div>' +
      '        <div class="eth-form-group">' +
      '          <label style="font-weight:700;font-size:13px">Gmail Manzili</label>' +
      '          <input type="email" id="stEmail" placeholder="nomingiz@gmail.com" required>' +
      '        </div>' +
      '        <div style="margin:10px 0 14px">' +
      '          <button type="button" id="btnGetStudentCode" style="background:#2563eb;color:#fff;font-weight:800;font-size:14px;padding:12px;border-radius:12px;border:none;cursor:pointer;width:100%;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 8px 20px -6px rgba(37,99,235,0.6);transition:all 0.2s">' +
      '            📲 Kodni Olish' +
      '          </button>' +
      '        </div>' +
      '        <div class="eth-form-group" id="stCodeGroup">' +
      '          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">' +
      '            <label style="font-weight:700;font-size:13px;margin:0">Tasdiqlash Kodi (6 xonali)</label>' +
      '            <span id="stCodeStatus" style="font-size:11.5px;color:#38bdf8;font-weight:700"></span>' +
      '          </div>' +
      '          <input type="text" id="stCode" placeholder="Masalan: K9#4F7" maxlength="6" style="letter-spacing:5px;font-family:monospace;font-size:20px;text-align:center;font-weight:900;text-transform:uppercase" required>' +
      '          <div id="stCodeNotice" style="margin-top:6px;display:flex;align-items:center;justify-content:space-between;font-size:11.5px;color:var(--muted)">' +
      '            <span>Kod @ETHITH_testbot orqali yuboriladi</span>' +
      '            <a href="https://t.me/ETHITH_testbot" target="_blank" style="color:#38bdf8;font-weight:800;text-decoration:none">Botni Ochish ↗</a>' +
      '          </div>' +
      '        </div>' +
      '        <button type="submit" class="eth-btn-primary" style="margin-top:10px;padding:12px;font-size:15px;font-weight:800;border-radius:12px;width:100%">Tasdiqlash va Kirish 🚀</button>' +
      '      </form>' +
      '    </div>' +
      '    <div id="teacherFormBox" style="display:none">' +
      '      <form id="teacherAuthForm">' +
      '        <div class="eth-form-group">' +
      '          <label style="font-weight:700;font-size:13px">O\'qituvchi Ismi</label>' +
      '          <input type="text" id="tcName" placeholder="Instructor name" value="' + esc(defaultName) + '" required>' +
      '        </div>' +
      '        <div class="eth-form-group">' +
      '          <label style="font-weight:700;font-size:13px">Gmail Manzili</label>' +
      '          <input type="email" id="tcEmail" placeholder="teacher@gmail.com" required>' +
      '        </div>' +
      '        <div style="margin:10px 0 14px">' +
      '          <button type="button" id="btnGetTeacherCode" style="background:#2563eb;color:#fff;font-weight:800;font-size:14px;padding:12px;border-radius:12px;border:none;cursor:pointer;width:100%;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 8px 20px -6px rgba(37,99,235,0.6)">' +
      '            📲 Kodni Olish' +
      '          </button>' +
      '        </div>' +
      '        <div class="eth-form-group">' +
      '          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">' +
      '            <label style="font-weight:700;font-size:13px;margin:0">Tasdiqlash Kodi (6 xonali)</label>' +
      '            <span id="tcCodeStatus" style="font-size:11.5px;color:#38bdf8;font-weight:700"></span>' +
      '          </div>' +
      '          <input type="text" id="tcCode" placeholder="Masalan: K9#4F7" maxlength="6" style="letter-spacing:5px;font-family:monospace;font-size:20px;text-align:center;font-weight:900;text-transform:uppercase" required>' +
      '        </div>' +
      '        <div class="eth-form-group" style="margin-top:10px">' +
      '          <label style="font-weight:700;font-size:13px">O\'qituvchilar Maxsus Paroli</label>' +
      '          <input type="password" id="tcMasterKey" placeholder="Maxfiy parolni kiriting..." required>' +
      '          <small style="color:var(--muted);font-size:11.5px;margin-top:4px;display:block">O\'qituvchilar maxsus paroli: jds8d738hjsdhd8w9dhsihd89wydhshd</small>' +
      '        </div>' +
      '        <button type="submit" class="eth-btn-primary" style="background:linear-gradient(135deg, #0f172a, #2563eb);margin-top:10px;padding:12px;font-size:15px;font-weight:800;border-radius:12px;width:100%">Tasdiqlash va Kirish 🚀</button>' +
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

    // 6-Character Verification Code Generator (Letters, Numbers, Symbols)
    function generate6Code() {
      var letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
      var digits = '23456789';
      var symbols = '#$!*@';
      var parts = [
        letters[Math.floor(Math.random() * letters.length)],
        digits[Math.floor(Math.random() * digits.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        letters[Math.floor(Math.random() * letters.length)],
        digits[Math.floor(Math.random() * digits.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ];
      return parts.sort(function() { return 0.5 - Math.random(); }).join('');
    }

    var generatedStudentCode = null;
    var generatedTeacherCode = null;

    async function sendCodeViaTelegram(recipientName, email, code, statusEl, noticeEl) {
      statusEl.textContent = 'Kod yuborilmoqda...';

      var sentToTelegram = false;
      var tgChatId = tgUser ? tgUser.id : null;

      // 1. Direct Telegram Bot API send if running inside Telegram Mini App
      if (tgChatId) {
        try {
          var res = await fetch('https://api.telegram.org/bot8857210620:AAHeVQqMLgaHSKbEiAPg6m34o6VvRcQ7gzE/sendMessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: tgChatId,
              text: '🔐 <b>ETHITH TESTS — Tasdiqlash Kodi</b>\n\nSalom, <b>' + (recipientName || "O'quvchi") + '</b>!\nSizning 6 xonali tasdiqlash kodingiz:\n\n👉 <code>' + code + '</code> 👈 <i>(nusxalash uchun bosing)</i>\n\nUshbu kodni Mini App darchasiga kiriting.\n⏱️ Kod 10 daqiqa amal qiladi.',
              parse_mode: 'HTML'
            })
          });
          var data = await res.json();
          if (data && data.ok) {
            sentToTelegram = true;
          }
        } catch(e) {}
      }

      // 2. Also register in local bot daemon server if running
      try {
        await fetch('http://localhost:3850/send-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: recipientName, email: email, chatId: tgChatId })
        });
      } catch(e) {}

      // 3. User feedback
      if (sentToTelegram) {
        statusEl.innerHTML = '<span style="color:#22c55e">✅ Telegramga yuborildi!</span>';
        if (noticeEl) {
          noticeEl.innerHTML = '<span style="color:#22c55e;font-weight:700">@ETHITH_testbot xabarlaringizni tekshiring!</span>';
        }
      } else {
        statusEl.innerHTML = '<span style="color:#22c55e">✅ Kod tayyor!</span>';
        if (noticeEl) {
          noticeEl.innerHTML = 
            '<span>Kod: <b style="color:#fde047;letter-spacing:2px;font-size:13px;background:rgba(255,255,255,0.1);padding:2px 8px;border-radius:6px;cursor:pointer" id="fastCopyCodeBtn" title="Nusxalash">' + code + '</b> (Bosing)</span>' +
            '<a href="https://t.me/ETHITH_testbot" target="_blank" style="color:#38bdf8;font-weight:800;text-decoration:none">Bot: @ETHITH_testbot ↗</a>';
          
          var copyBtn = noticeEl.querySelector('#fastCopyCodeBtn');
          if (copyBtn) {
            copyBtn.onclick = function() {
              var inputEl = overlay.querySelector('#stCode') || overlay.querySelector('#tcCode');
              if (inputEl) inputEl.value = code;
              try { navigator.clipboard.writeText(code); } catch(e) {}
              alert("Kod nusxalandi: " + code);
            };
          }
        }
      }
    }

    // "Kodni Olish" button for Student
    var btnGetStCode = overlay.querySelector('#btnGetStudentCode');
    if (btnGetStCode) {
      btnGetStCode.onclick = function() {
        var nameInput = overlay.querySelector('#stName');
        var emailInput = overlay.querySelector('#stEmail');
        var name = (nameInput ? nameInput.value : '').trim();
        var email = (emailInput ? emailInput.value : '').trim();

        if (!name || !email) {
          alert("Iltimos, avval Ism va Gmail manzilingizni kiriting!");
          return;
        }

        generatedStudentCode = generate6Code();
        var statusEl = overlay.querySelector('#stCodeStatus');
        var noticeEl = overlay.querySelector('#stCodeNotice');
        sendCodeViaTelegram(name, email, generatedStudentCode, statusEl, noticeEl);

        // Cooldown timer (60s)
        var cooldown = 60;
        btnGetStCode.disabled = true;
        btnGetStCode.style.opacity = '0.6';
        btnGetStCode.textContent = "Qayta yuborish (" + cooldown + "s)";
        var timer = setInterval(function() {
          cooldown--;
          if (cooldown <= 0) {
            clearInterval(timer);
            btnGetStCode.disabled = false;
            btnGetStCode.style.opacity = '1';
            btnGetStCode.textContent = "📲 Kodni Olish";
          } else {
            btnGetStCode.textContent = "Qayta yuborish (" + cooldown + "s)";
          }
        }, 1000);
      };
    }

    // "Kodni Olish" button for Teacher
    var btnGetTcCode = overlay.querySelector('#btnGetTeacherCode');
    if (btnGetTcCode) {
      btnGetTcCode.onclick = function() {
        var nameInput = overlay.querySelector('#tcName');
        var emailInput = overlay.querySelector('#tcEmail');
        var name = (nameInput ? nameInput.value : '').trim();
        var email = (emailInput ? emailInput.value : '').trim();

        if (!name || !email) {
          alert("Iltimos, avval O'qituvchi ismi va Gmail manzilini kiriting!");
          return;
        }

        generatedTeacherCode = generate6Code();
        var statusEl = overlay.querySelector('#tcCodeStatus');
        sendCodeViaTelegram(name, email, generatedTeacherCode, statusEl, null);

        var cooldown = 60;
        btnGetTcCode.disabled = true;
        btnGetTcCode.style.opacity = '0.6';
        btnGetTcCode.textContent = "Qayta yuborish (" + cooldown + "s)";
        var timer = setInterval(function() {
          cooldown--;
          if (cooldown <= 0) {
            clearInterval(timer);
            btnGetTcCode.disabled = false;
            btnGetTcCode.style.opacity = '1';
            btnGetTcCode.textContent = "📲 Kodni Olish";
          } else {
            btnGetTcCode.textContent = "Qayta yuborish (" + cooldown + "s)";
          }
        }, 1000);
      };
    }

    // Student Submit Form
    var stForm = overlay.querySelector('#studentAuthForm');
    if (stForm) {
      stForm.onsubmit = function(e) {
        e.preventDefault();
        var nameInput = overlay.querySelector('#stName');
        var emailInput = overlay.querySelector('#stEmail');
        var codeInput = overlay.querySelector('#stCode');

        var name = (nameInput ? nameInput.value : '').trim();
        var email = (emailInput ? emailInput.value : '').trim();
        var code = (codeInput ? codeInput.value : '').trim();

        if (!name || !email) {
          alert("Iltimos, ism va Gmail manzilingizni to'liq kiriting!");
          return;
        }

        if (!generatedStudentCode) {
          alert("Iltimos, avval ko'k 'Kodni Olish' tugmasini bosing!");
          return;
        }

        if (code !== generatedStudentCode) {
          alert("❌ Xatolik: Tasdiqlash kodi noto'g'ri! Iltimos, Telegram bot orqali yuborilgan 6 xonali kodni to'g'ri kiriting.");
          return;
        }

        var cleanEmail = email.toLowerCase().trim();
        if (!Array.isArray(S.accounts)) S.accounts = [];

        var existingAcc = S.accounts.find(function(acc) {
          return acc.email && acc.email.toLowerCase() === cleanEmail;
        });

        if (existingAcc) {
          var isMuUser = (cleanEmail.indexOf('muhammad') !== -1 || (existingAcc.name && existingAcc.name.toLowerCase().indexOf('muhammad') !== -1) || name.toLowerCase().indexOf('muhammad') !== -1);
          var initCoins = existingAcc.coins !== undefined ? existingAcc.coins : (S.user && S.user.coins !== undefined ? S.user.coins : 150);
          if (isMuUser) {
            initCoins = Math.max(initCoins, 100000);
            existingAcc.coins = initCoins;
          }

          S.user = {
            id: existingAcc.id,
            role: 'student',
            name: existingAcc.name || name,
            email: cleanEmail,
            dailyMinutes: existingAcc.dailyMinutes || 0,
            coins: initCoins,
            nameStyle: existingAcc.nameStyle || null,
            title: existingAcc.title || null,
            gifts: Array.isArray(existingAcc.gifts) ? existingAcc.gifts : (Array.isArray(S.user && S.user.gifts) ? S.user.gifts : [])
          };
          if (existingAcc.level) S.level = existingAcc.level;
          if (existingAcc.unlocked) S.unlocked = existingAcc.unlocked;
          if (existingAcc.quizScores) S.quizScores = existingAcc.quizScores;
          if (existingAcc.mistakes) S.mistakes = existingAcc.mistakes;
          existingAcc.updatedAt = Date.now();

          try {
            var regList = JSON.parse(localStorage.getItem('ethith_all_registered_users') || '[]');
            if (!regList.some(function(u) { return (u.email && u.email.toLowerCase() === cleanEmail) || u.name.toLowerCase() === name.toLowerCase(); })) {
              regList.push({ id: existingAcc.id, name: existingAcc.name || name, email: cleanEmail, role: 'student', coins: initCoins, joinedAt: Date.now() });
              localStorage.setItem('ethith_all_registered_users', JSON.stringify(regList));
            }
          } catch(e) {}

          saveState();
          if (window.EthithSync) {
            window.EthithSync.pushRemoteStore();
          }
          overlay.remove();
          alert("Xush kelibsiz, " + S.user.name + "! Telegram orqali akkauntingiz muvaffaqiyatli tasdiqlandi.");
          window.ethithOpenApp('dash');
        } else {
          // New student registration
          var isMuNew = (cleanEmail.indexOf('muhammad') !== -1 || name.toLowerCase().indexOf('muhammad') !== -1);
          var newCoins = isMuNew ? 100000 : 150;
          var newAcc = {
            id: 'st_' + Math.random().toString(36).substr(2, 9),
            role: 'student',
            name: name,
            email: cleanEmail,
            level: 'A1',
            unlocked: { A1: 1, A2: 1, B1: 1, B2: 1, C1: 1, C2: 1 },
            quizScores: {},
            mistakes: [],
            dailyMinutes: 0,
            coins: newCoins,
            gifts: (S.user && Array.isArray(S.user.gifts)) ? S.user.gifts : [],
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          S.accounts.push(newAcc);
          S.user = {
            id: newAcc.id,
            role: 'student',
            name: newAcc.name,
            email: newAcc.email,
            dailyMinutes: 0,
            coins: newAcc.coins,
            gifts: newAcc.gifts
          };

          try {
            var allUsers = JSON.parse(localStorage.getItem('ethith_all_registered_users') || '[]');
            if (!allUsers.some(function(u) { return (u.email && u.email.toLowerCase() === cleanEmail) || u.name.toLowerCase() === name.toLowerCase(); })) {
              allUsers.push({ id: newAcc.id, name: name, email: cleanEmail, role: 'student', joinedAt: Date.now() });
              localStorage.setItem('ethith_all_registered_users', JSON.stringify(allUsers));
            }
          } catch(e) {}

          if (window.EthithSync && window.EthithSync.publishLive) {
            window.EthithSync.publishLive({
              type: 'USER_REGISTERED',
              user: {
                id: newAcc.id,
                name: newAcc.name,
                email: newAcc.email,
                role: 'student',
                coins: newAcc.coins || 0,
                avatar: newAcc.avatar || null,
                level: newAcc.level || 'A1',
                joinedAt: newAcc.createdAt || Date.now()
              }
            });
          }

          saveState();
          if (window.EthithSync && window.EthithSync.broadcastUserState) {
            window.EthithSync.broadcastUserState();
          } else if (window.EthithSync) {
            window.EthithSync.pushRemoteStore();
          }
          overlay.remove();
          alert("🎉 Tabriklaymiz! Telegram orqali yangi akkauntingiz muvaffaqiyatli ochildi.");
          window.ethithOpenApp('dash');
        }
      };
    }

    // Teacher Submit Form
    var tcForm = overlay.querySelector('#teacherAuthForm');
    if (tcForm) {
      tcForm.onsubmit = function(e) {
        e.preventDefault();
        var nameInput = overlay.querySelector('#tcName');
        var emailInput = overlay.querySelector('#tcEmail');
        var codeInput = overlay.querySelector('#tcCode');
        var masterInput = overlay.querySelector('#tcMasterKey');

        var name = (nameInput ? nameInput.value : '').trim();
        var email = (emailInput ? emailInput.value : '').trim();
        var code = (codeInput ? codeInput.value : '').trim();
        var masterKey = (masterInput ? masterInput.value : '').trim();

        if (!name || !email) {
          alert("Iltimos, o'qituvchi ismi va Gmail manzilini kiriting!");
          return;
        }

        if (!generatedTeacherCode) {
          alert("Iltimos, avval ko'k 'Kodni Olish' tugmasini bosing!");
          return;
        }

        if (code !== generatedTeacherCode) {
          alert("❌ Xatolik: Tasdiqlash kodi noto'g'ri! Iltimos, Telegram bot orqali yuborilgan 6 xonali kodni to'g'ri kiriting.");
          return;
        }

        var currentMaster = localStorage.getItem('ethith_teacher_master') || DEFAULT_TEACHER_KEY;

        if (masterKey !== currentMaster) {
          alert("❌ Xatolik: O'qituvchilar maxsus paroli noto'g'ri! Iltimos, to'g'ri maxfiy parolni kiriting: " + DEFAULT_TEACHER_KEY);
          return;
        }

        var cleanTcEmail = email.toLowerCase().trim();
        S.user = {
          id: 'tc_' + Math.random().toString(36).substr(2, 9),
          role: 'teacher',
          name: name,
          email: cleanTcEmail,
          dailyMinutes: 0
        };

        if (!Array.isArray(S.accounts)) S.accounts = [];
        var exTc = S.accounts.find(function(a) { return a.email && a.email.toLowerCase() === cleanTcEmail; });
        if (!exTc) {
          S.accounts.push({
            id: S.user.id,
            role: 'teacher',
            name: name,
            email: cleanTcEmail,
            createdAt: Date.now()
          });
        }

        try {
          var allRegTc = JSON.parse(localStorage.getItem('ethith_all_registered_users') || '[]');
          if (!allRegTc.some(function(u) { return (u.email && u.email.toLowerCase() === cleanTcEmail) || u.name.toLowerCase() === name.toLowerCase(); })) {
            allRegTc.push({ id: S.user.id, name: name, email: cleanTcEmail, role: 'teacher', joinedAt: Date.now() });
            localStorage.setItem('ethith_all_registered_users', JSON.stringify(allRegTc));
          }
        } catch(e) {}

        if (window.EthithSync && window.EthithSync.publishLive) {
          window.EthithSync.publishLive({
            type: 'USER_REGISTERED',
            user: {
              id: S.user.id,
              name: name,
              email: cleanTcEmail,
              role: 'teacher'
            }
          });
        }

        saveState();
        if (window.EthithSync) {
          window.EthithSync.pushRemoteStore();
        }
        overlay.remove();
        alert("Xush kelibsiz, Hurmatli Ustoz " + name + "! O'qituvchilar kabineti ochildi.");
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


  function syncCurrentStudentAccount() {
    if (S.user && S.user.role === 'student' && S.user.email && Array.isArray(S.accounts)) {
      var myEmail = S.user.email.toLowerCase();
      var acc = S.accounts.find(function(a) { return a.email && a.email.toLowerCase() === myEmail; });
      if (acc) {
        acc.level = S.level;
        acc.unlocked = S.unlocked;
        acc.quizScores = S.quizScores;
        acc.mistakes = S.mistakes;
        acc.dailyMinutes = S.user.dailyMinutes || 0;
        acc.name = S.user.name;
        acc.gifts = S.user.gifts || [];
        acc.coins = S.user.coins !== undefined ? S.user.coins : 150;
        acc.updatedAt = Date.now();
        saveState();
        if (window.EthithSync && window.EthithSync.broadcastUserState) {
          window.EthithSync.broadcastUserState();
        } else if (window.EthithSync && window.EthithSync.pushRemoteStore) {
          window.EthithSync.pushRemoteStore();
        }
      }
    }
  }

  window.EthithApp = {
    state: S,
    showAuthModal: showAuthModal,
    showComingSoon: showComingSoon,
    saveState: saveState,
    syncCurrentStudentAccount: syncCurrentStudentAccount,
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

  // ====================================================
  // ETHITH CLIENT BUILD VERSION
  // Auto-reload is disabled per user requirement: No spontaneous page refreshes.
  // Real-time server state syncs seamlessly via MQTT/WebSockets without refreshing.
  // ====================================================
  window.ETHITH_BUILD_VERSION = "2026.10.18.0010";

})(window);
