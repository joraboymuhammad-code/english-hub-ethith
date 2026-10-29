/**
 * ETHITH Platform Main Application Logic
 * Created by Muhammadyusuf Jo'raboyev
 */

(function(window) {
  'use strict';

  var DEFAULT_TEACHER_KEY = 'jds8d738hjsdhd8w9dhsihd89wydhshd';
  var QUICK_EMOJIS_DEFAULT = ['👍', '❤️', '🔥', '👏', '🎉', '🤩', '🚀', '💯', '🤝', '💡'];
  var ALL_EMOJIS = ['👍', '❤️', '🔥', '👏', '🎉', '🤩', '🚀', '💯', '🤝', '💡', '😂', '🥳', '🤔', '😢', '🙏', '🎯', '✨', '🧠', '📚', '✍️', '🙌', '💪', '🏆', '⭐'];

  var DEFAULT_CLASSES = [];

  var PURGED_EMAILS = [
    'muhammedjoraboyev1@gmail.com', 'strikeruzb52@gmail.com', 'alisher@gmail.com',
    'nasibaorazaliyev@gmail.com', 'joraboymuhammad@gmail.com', 'aleksandermike37@gmail.com',
    'sarvartovboyev09@gmail.com', 'azizbekurolov24@gmail.com', 'shodiyorovinch030@gmail.com',
    'nursulton@ethith.uz', 'john.doe@ethith.uz', 'yangi o\'quvchi', 'alisher oquvchi',
    'shamshod', 'nursulton', 'azizbek', 'urolov', 'sarvar tovboyev', 'aleksander mike'
  ];

  function isPurgedAccount(acc) {
    if (!acc) return true;
    if (acc.telegramId || (acc.id && (String(acc.id).startsWith('tg_') || String(acc.id).startsWith('usr_')))) {
      return false;
    }
    var email = (acc.email || '').toLowerCase().trim();
    var name = (acc.name || '').toLowerCase().trim();
    var id = (acc.id || '').toLowerCase().trim();
    if (!name && !email) return true;
    if (id === 'admin_official_teacher' || email === 'admin_12038f1aq8syash@ethith.uz' || (name === 'ustoz muhammadyusuf' && acc.role === 'teacher')) {
      return false;
    }
    for (var i = 0; i < PURGED_EMAILS.length; i++) {
      var p = PURGED_EMAILS[i];
      if (email === p || email.indexOf(p) !== -1 || name === p) return true;
    }
    return false;
  }

  // Mandatory fresh accounts reset per user directive: wipe all previous accounts
  try {
    if (localStorage.getItem('ethith_wipe_v6_accounts') !== 'done') {
      localStorage.removeItem('ethith_all_registered_users');
      localStorage.removeItem('ethith_v2_state');
      localStorage.removeItem('ethith_user');
      localStorage.removeItem('ethith_accounts');
      localStorage.removeItem('ethith_p2p_listings');
      localStorage.removeItem('ethith_active_tg_codes');
      localStorage.setItem('ethith_wipe_v6_accounts', 'done');
    }
  } catch(e) {}

  // Application State
  var S = {
    user: null, // { role: 'student'|'teacher', name: '', email: '', id: '', dailyMinutes: 0 }
    level: 'A1',
    unlocked: { A1: 1, A2: 1, B1: 1, B2: 1, C1: 1, C2: 1 },
    mistakes: [],
    theme: 'dark',
    classes: [],
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
    activePlacementQuiz: null,
    accounts: [],
    p2pListings: []
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

  if (Array.isArray(S.accounts)) {
    S.accounts = S.accounts.filter(function(a) { return !isPurgedAccount(a); });
  }
  if (S.user && isPurgedAccount(S.user)) {
    S.user = null;
  }
  try {
    if (localStorage.getItem('ethith_explicit_logout') === '1' || sessionStorage.getItem('ethith_explicit_logout') === '1') {
      S.user = null;
    }
  } catch(e) {}

  if (!localStorage.getItem('ethith_explicit_theme')) {
    S.theme = 'dark';
  }

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
    if (S.user.role === 'admin' || curEmail === 'admin_12038f1aq8syash@ethith.uz') {
      S.user.id = 'admin_official_root';
      S.user.role = 'admin';
      S.user.name = 'Bosh Admin';
      S.user.email = 'ADMIN_12038F1aq8syash@ethith.uz';
      curEmail = 'admin_12038f1aq8syash@ethith.uz';
      curName = 'Bosh Admin';
    } else if (S.user.role === 'teacher') {
      S.user.role = 'teacher';
      if (!S.user.name) S.user.name = 'Ustoz';
    }
    var isMuhammadUser = (curEmail === 'muhammedjoraboyev1@gmail.com' || curName.toLowerCase().indexOf('muhammadyusuf') !== -1) && S.user.role !== 'teacher';
    
    // Standard user initialization: bonus is 150 coins for all students
    if (S.user.coins === undefined || S.user.coins === null) {
      S.user.coins = 150;
    }
    if (!Array.isArray(S.user.gifts)) S.user.gifts = [];

    // Ensure user is present in S.accounts strictly by clean email
    if (!Array.isArray(S.accounts)) S.accounts = [];
    var exAcc = S.accounts.find(function(a) {
      return curEmail && a.email && a.email.toLowerCase().trim() === curEmail;
    });

    if (!exAcc) {
      S.accounts.push({
        id: curEmail || S.user.id || ('st_' + Date.now()),
        role: S.user.role || 'student',
        name: S.user.name || 'Foydalanuvchi',
        email: curEmail || ((S.user.name || 'user').toLowerCase().replace(/\s+/g, '.') + '@ethith.uz'),
        coins: S.user.coins,
        gifts: S.user.gifts,
        avatar: S.user.avatar || null,
        title: S.user.title || null,
        nameStyle: S.user.nameStyle || null,
        createdAt: Date.now()
      });
    } else {
      exAcc.name = S.user.name;
      exAcc.coins = S.user.coins;
      exAcc.avatar = S.user.avatar;
      exAcc.title = S.user.title;
      exAcc.gifts = S.user.gifts;
    }

    // Deduplicate S.accounts so each Gmail has strictly 1 account
    var dedupedAccounts = [];
    var seenMap = {};
    S.accounts.forEach(function(acc) {
      if (!acc) return;
      var em = (acc.email || '').toLowerCase().trim();
      if (!em) {
        dedupedAccounts.push(acc);
        return;
      }
      if (seenMap[em]) return;
      seenMap[em] = true;
      if (em === 'muhammedjoraboyev1@gmail.com') {
        if (!acc.name) acc.name = 'Muhammadyusuf';
      }
      dedupedAccounts.push(acc);
    });
    S.accounts = dedupedAccounts;
  }

  if (!Array.isArray(S.classes)) {
    S.classes = [];
  }

  // Ensure aiConversations exists
  if (!Array.isArray(S.aiConversations)) {
    S.aiConversations = [];
  }
  // AI Conversations Management:
  // 1. Filter out duplicate empty conversations
  var nonEmptyConversations = S.aiConversations.filter(function(c) {
    return c && Array.isArray(c.messages) && c.messages.length > 0;
  });

  // 2. Check if there is already an existing empty conversation
  var existingEmpty = S.aiConversations.find(function(c) {
    return c && (!c.messages || c.messages.length === 0);
  });

  if (existingEmpty) {
    // Reuse existing empty chat - do NOT create duplicate empty chats on refresh
    S.currentAiChatId = existingEmpty.id;
    S.aiConversations = [existingEmpty].concat(nonEmptyConversations.filter(function(c) {
      return c.id !== existingEmpty.id;
    }));
  } else if (nonEmptyConversations.length > 0) {
    // Previous conversation had messages, prepare a fresh conversation
    var freshChatId = 'conv_' + Date.now();
    var freshChat = {
      id: freshChatId,
      title: 'Yangi Suhbat',
      messages: [],
      updatedAt: Date.now()
    };
    S.aiConversations = [freshChat].concat(nonEmptyConversations);
    S.currentAiChatId = freshChatId;
  } else {
    // Initial empty state
    var initChatId = 'conv_' + Date.now();
    var initChat = {
      id: initChatId,
      title: 'Yangi Suhbat',
      messages: [],
      updatedAt: Date.now()
    };
    S.aiConversations = [initChat];
    S.currentAiChatId = initChatId;
  }
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

  // Helper to reliably get Telegram WebApp user
  function getTelegramUser() {
    try {
      if (window.Telegram && window.Telegram.WebApp) {
        try { window.Telegram.WebApp.ready(); } catch(e) {}
        try { window.Telegram.WebApp.expand(); } catch(e) {}
        if (window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
          return window.Telegram.WebApp.initDataUnsafe.user;
        }
      }
    } catch(e) {}

    try {
      var raw = (window.location.hash || window.location.search || '').replace(/^[#?]/, '');
      if (raw) {
        var params = new URLSearchParams(raw);
        var tgWebAppData = params.get('tgWebAppData');
        if (tgWebAppData) {
          var subParams = new URLSearchParams(tgWebAppData);
          var userStr = subParams.get('user');
          if (userStr) return JSON.parse(userStr);
        }
        var directUser = params.get('user');
        if (directUser) return JSON.parse(directUser);
      }
    } catch(e) {}

    return null;
  }

  // Automatic Telegram Mini App User Authorization & Session Persistence
  function initTelegramOrSavedUser() {
    try {
      if (localStorage.getItem('ethith_explicit_logout') === '1' || sessionStorage.getItem('ethith_explicit_logout') === '1') {
        S.user = null;
        return false;
      }
    } catch(e) {}

    // Check if user is saved in localStorage first (respects teacher login even inside Telegram)
    if (!S.user) {
      try {
        var savedAct = localStorage.getItem('ethith_active_user');
        if (savedAct) {
          var parsedAct = JSON.parse(savedAct);
          if (parsedAct && (parsedAct.id || parsedAct.email)) {
            S.user = parsedAct;
          }
        }
      } catch(e) {}
    }

    if (S.user) {
      var uEm = (S.user.email || '').toLowerCase().trim();
      if (S.user.role === 'admin' || uEm === 'admin_12038f1aq8syash@ethith.uz') {
        S.user.id = 'admin_official_root';
        S.user.role = 'admin';
        S.user.name = 'Bosh Admin';
        S.user.email = 'ADMIN_12038F1aq8syash@ethith.uz';
      } else if (S.user.role === 'teacher') {
        S.user.role = 'teacher';
        if (!S.user.name) S.user.name = 'Ustoz';
      }
      try {
        localStorage.setItem('ethith_active_user', JSON.stringify(S.user));
      } catch(e) {}
      saveState();
      return true;
    }

    var tgUser = getTelegramUser();
    if (tgUser && tgUser.id) {
      var savedKey = 'ethith_tg_user_' + tgUser.id;
      var existingTgUser = null;
      try {
        var raw = localStorage.getItem(savedKey);
        if (raw) existingTgUser = JSON.parse(raw);
      } catch(e) {}

      if (!existingTgUser) {
        try {
          var reg = JSON.parse(localStorage.getItem('ethith_all_registered_users') || '[]');
          existingTgUser = reg.find(function(u) {
            return u && (u.telegramId == tgUser.id || u.id == 'tg_' + tgUser.id);
          });
        } catch(e) {}
      }

      if (existingTgUser) {
        S.user = existingTgUser;
      } else {
        var fullName = ((tgUser.first_name || '') + ' ' + (tgUser.last_name || '')).trim();
        var newAccount = {
          id: 'tg_' + tgUser.id,
          telegramId: tgUser.id,
          name: fullName || (tgUser.username ? '@' + tgUser.username : 'Telegram O\'quvchi'),
          username: tgUser.username || '',
          email: (tgUser.username ? tgUser.username + '@telegram.org' : 'tg_' + tgUser.id + '@ethith.uz'),
          role: 'student',
          coins: 150,
          dailyMinutes: 0,
          created: Date.now()
        };
        try {
          localStorage.setItem(savedKey, JSON.stringify(newAccount));
          var regUsers = JSON.parse(localStorage.getItem('ethith_all_registered_users') || '[]');
          regUsers.push(newAccount);
          localStorage.setItem('ethith_all_registered_users', JSON.stringify(regUsers));
        } catch(e) {}
        S.user = newAccount;
      }

      try {
        localStorage.setItem('ethith_active_user', JSON.stringify(S.user));
      } catch(e) {}
      saveState();
      return true;
    }

    return false;
  }

  // Universal Instant Logout Function
  function logoutUser() {
    if (S.user && S.user.role === 'student') {
      var curLog = (S.user.login || '').toLowerCase();
      if (Array.isArray(S.accounts)) {
        var acc = S.accounts.find(function(a) { return (a.login || '').toLowerCase() === curLog; });
        if (acc) acc.isOnline = false;
      }
      (S.classes || []).forEach(function(cls) {
        (cls.students || []).forEach(function(st) {
          if ((st.login || '').toLowerCase() === curLog) st.isOnline = false;
        });
      });
      if (window.EthithSync && window.EthithSync.broadcastState) {
        window.EthithSync.broadcastState('student_offline');
      }
    }
    S.user = null;
    try {
      localStorage.removeItem('ethith_active_user');
      localStorage.removeItem('ethith_user');
      localStorage.setItem('ethith_explicit_logout', '1');
      sessionStorage.setItem('ethith_explicit_logout', '1');
    } catch(e) {}
    saveState();
    document.documentElement.classList.remove('eth-logged-in');
    var ap = document.getElementById('app');
    if (ap) ap.style.display = 'none';
    var landing = document.getElementById('landing');
    if (landing) landing.style.display = '';
    showAuthModal(true);
  }
  window.ethithLogout = logoutUser;

  // 1. Auth Modal (Instant Student Login/Registration + Super Admin Ustoz Login)
  function showAuthModal(forceOpen) {
    if (!forceOpen && initTelegramOrSavedUser()) {
      var ex = document.getElementById('ethAuthOverlay');
      if (ex) ex.remove();
      if (window.ethithOpenApp) window.ethithOpenApp('dash');
      return;
    }

    var existing = document.getElementById('ethAuthOverlay');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';
    overlay.id = 'ethAuthOverlay';

    var tgUser = getTelegramUser();
    var defaultName = tgUser ? (tgUser.first_name + (tgUser.last_name ? (' ' + tgUser.last_name) : '')) : '';

    var html = '' +
      '<div class="eth-modal eth-auth-modal">' +
      '  <div class="eth-auth-brand">' +
      '    <div style="display:flex;align-items:center;justify-content:center;margin-bottom:12px;">' +
      '      <svg class="logo" viewBox="88 255 480 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="English House - Lifetime learning" style="width:230px;max-width:85vw;height:auto;display:block;">' +
      '        <g fill="none" stroke="#ffd91a" stroke-width="12" stroke-linejoin="miter" stroke-linecap="butt">' +
      '          <polyline points="100,328 161,270 222,328"/>' +
      '          <path d="M119 322 V372 H204 V322"/>' +
      '          <path d="M150 372 V342 H172 V372"/>' +
      '        </g>' +
      '        <line x1="236" y1="262" x2="236" y2="380" stroke="#ffffff" stroke-width="2"/>' +
      '        <text class="eh-title" x="246" y="300" font-size="58" textLength="310" lengthAdjust="spacingAndGlyphs" fill="#ffffff" font-family="\'Saira\', \'Arial Black\', sans-serif" font-weight="800">ENGLISH</text>' +
      '        <text class="eh-title" x="246" y="348" font-size="58" textLength="245" lengthAdjust="spacingAndGlyphs" fill="#ffffff" font-family="\'Saira\', \'Arial Black\', sans-serif" font-weight="800">HOUSE</text>' +
      '        <text class="eh-tagline" x="246" y="375" font-size="22" textLength="183" lengthAdjust="spacingAndGlyphs" fill="#ffd91a" font-family="\'Nunito\', Arial, sans-serif" font-weight="700">Lifetime learning</text>' +
      '      </svg>' +
      '    </div>' +
      '    <h2 class="eth-auth-title">Platformaga Kirish</h2>' +
      '    <p class="eth-auth-subtitle">Tizimga kirish uchun rolingizni tanlang</p>' +
      '  </div>' +
      '  <div id="authTabsRow" class="eth-auth-tabs">' +
      '    <button type="button" class="eth-auth-tab active" id="tabStudentBtn">O‘quvchi</button>' +
      '    <button type="button" class="eth-auth-tab" id="tabTeacherBtn">O‘qituvchi</button>' +
      '    <button type="button" class="eth-auth-tab" id="tabAdminToggleBtn">Admin</button>' +
      '  </div>' +
      '  <div class="eth-auth-body">' +
      '    <div id="studentFormBox">' +
      '      <form id="studentAuthForm">' +
      '        <div style="background:rgba(2,132,199,0.12);border:1px solid rgba(56,189,248,0.35);border-radius:12px;padding:10px 14px;font-size:12px;color:#7dd3fc;margin-bottom:14px;line-height:1.4">' +
      '          🔒 <b>O‘quvchilar uchun:</b> O‘quvchilar mustaqil yangi hisob ochmaydi. Faqat ustozingiz yoki Administrator bergan shaxsiy <b>Login</b> va <b>Parol</b> orqali kiring.' +
      '        </div>' +
      '        <div class="eth-auth-field">' +
      '          <label class="eth-auth-label">O‘quvchi Tizim Logini</label>' +
      '          <input type="text" id="stLogin" class="eth-auth-input" placeholder="Masalan: ali_492_valiyev yoki tester_1" required autocomplete="username" style="font-family:monospace;font-weight:700;">' +
      '        </div>' +
      '        <div class="eth-auth-field">' +
      '          <label class="eth-auth-label">Maxfiy Parol</label>' +
      '          <input type="password" id="stPassword" class="eth-auth-input" placeholder="Parolingizni kiriting" required autocomplete="current-password">' +
      '        </div>' +
      '        <div id="stAccountNotice" style="margin:6px 0 12px;padding:9px 13px;border-radius:12px;font-size:12.5px;display:none"></div>' +
      '        <button type="submit" id="btnStudentSubmit" class="eth-auth-btn">🔐 O‘quvchi Kabinetiga Kirish</button>' +
      '      </form>' +
      '    </div>' +
      '    <div id="teacherFormBox" style="display:none">' +
      '      <form id="teacherAuthForm">' +
      '        <div class="eth-auth-field">' +
      '          <label class="eth-auth-label">O‘qituvchi Logini yoki Gmaili</label>' +
      '          <input type="text" id="tcLogin" class="eth-auth-input" placeholder="Masalan: azizbek77 yoki ustoz@gmail.com" required autocomplete="username">' +
      '        </div>' +
      '        <div class="eth-auth-field">' +
      '          <label class="eth-auth-label">Maxfiy Parol</label>' +
      '          <input type="password" id="tcPassword" class="eth-auth-input" placeholder="Parolingizni kiriting" required autocomplete="current-password">' +
      '          <small style="color:#94a3b8;font-size:11.5px;margin-top:5px;display:block">🔒 Har bir o‘qituvchining shaxsiy logini va maxfiy paroli.</small>' +
      '        </div>' +
      '        <button type="submit" class="eth-auth-btn teacher">O‘qituvchi Kabinetiga Kirish</button>' +
      '      </form>' +
      '    </div>' +
      '    <div id="adminFormBox" style="display:none">' +
      '      <form id="adminAuthForm">' +
      '        <div style="background:rgba(220,38,38,0.12);border:1px solid rgba(220,38,38,0.25);border-radius:12px;padding:10px 14px;font-size:12px;color:#fca5a5;margin-bottom:14px;line-height:1.4">' +
      '          🛡️ <b>Bosh Admin Tizimi:</b> Faqat markaz rahbari maxfiy logini va paroli orqali kiriladi.' +
      '        </div>' +
      '        <div class="eth-auth-field">' +
      '          <label class="eth-auth-label">Admin Logini</label>' +
      '          <input type="text" id="admLogin" class="eth-auth-input" placeholder="ADMIN_..." style="font-family:monospace;font-weight:700;letter-spacing:1px" required autocomplete="username">' +
      '        </div>' +
      '        <div class="eth-auth-field">' +
      '          <label class="eth-auth-label">Admin Maxfiy Paroli</label>' +
      '          <input type="password" id="admPassword" class="eth-auth-input" placeholder="Admin parolini kiriting" required autocomplete="current-password">' +
      '        </div>' +
      '        <button type="submit" class="eth-auth-btn admin">Bosh Admin Kirish</button>' +
      '      </form>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    var tabStudentBtn = overlay.querySelector('#tabStudentBtn');
    var tabTeacherBtn = overlay.querySelector('#tabTeacherBtn');
    var tabAdminToggleBtn = overlay.querySelector('#tabAdminToggleBtn');
    var studentFormBox = overlay.querySelector('#studentFormBox');
    var teacherFormBox = overlay.querySelector('#teacherFormBox');
    var adminFormBox = overlay.querySelector('#adminFormBox');

    function showMode(mode) {
      if (mode === 'admin') {
        studentFormBox.style.display = 'none';
        teacherFormBox.style.display = 'none';
        adminFormBox.style.display = 'block';
        if (tabAdminToggleBtn) tabAdminToggleBtn.classList.add('active');
        if (tabStudentBtn) tabStudentBtn.classList.remove('active');
        if (tabTeacherBtn) tabTeacherBtn.classList.remove('active');
      } else if (mode === 'teacher') {
        studentFormBox.style.display = 'none';
        teacherFormBox.style.display = 'block';
        adminFormBox.style.display = 'none';
        if (tabTeacherBtn) tabTeacherBtn.classList.add('active');
        if (tabStudentBtn) tabStudentBtn.classList.remove('active');
        if (tabAdminToggleBtn) tabAdminToggleBtn.classList.remove('active');
      } else {
        studentFormBox.style.display = 'block';
        teacherFormBox.style.display = 'none';
        adminFormBox.style.display = 'none';
        if (tabStudentBtn) tabStudentBtn.classList.add('active');
        if (tabTeacherBtn) tabTeacherBtn.classList.remove('active');
        if (tabAdminToggleBtn) tabAdminToggleBtn.classList.remove('active');
      }
    }

    if (tabStudentBtn) tabStudentBtn.onclick = function() { showMode('student'); };
    if (tabTeacherBtn) tabTeacherBtn.onclick = function() { showMode('teacher'); };
    if (tabAdminToggleBtn) tabAdminToggleBtn.onclick = function() { showMode('admin'); };

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

    async function validateAuthCode(userCode, expectedCode) {
      if (!userCode) return false;
      var clean = userCode.replace(/[\s\r\n\t\-]+/g, '').toUpperCase();
      if (!clean) return false;

      // 1. Matches in-memory session code
      if (expectedCode) {
        var cleanExp = expectedCode.replace(/[\s\r\n\t\-]+/g, '').toUpperCase();
        if (clean === cleanExp) return true;
      }

      // 2. Matches active MQTT received codes
      if (window._ethithActiveVerificationCodes && window._ethithActiveVerificationCodes[clean]) {
        if (window._ethithActiveVerificationCodes[clean] > Date.now()) return true;
      }

      // 3. Matches local cache
      try {
        var localCodes = JSON.parse(localStorage.getItem('ethith_active_tg_codes') || '{}');
        if (localCodes[clean] && localCodes[clean] > Date.now()) return true;
      } catch(e) {}

      // 4. Matches shared_store active verification codes in S
      if (S && S.activeVerificationCodes && S.activeVerificationCodes[clean]) {
        if (S.activeVerificationCodes[clean] > Date.now()) return true;
      }

      // 5. Live fetch shared_store.json with fresh cache buster
      try {
        var sRes = await fetch('shared_store.json?t=' + Date.now());
        if (sRes.ok) {
          var sData = await sRes.json();
          if (sData && sData.activeVerificationCodes && sData.activeVerificationCodes[clean]) {
            if (sData.activeVerificationCodes[clean] > Date.now()) return true;
          }
        }
      } catch(e) {}

      // 6. Verification codes file if accessible
      try {
        var vRes = await fetch('verification_codes.json?t=' + Date.now());
        if (vRes.ok) {
          var vData = await vRes.json();
          if (vData && vData.codes && vData.codes[clean]) {
            if (vData.codes[clean].expiresAt > Date.now()) return true;
          }
        }
      } catch(e) {}

      // 7. Remote check via bot daemon
      try {
        var chkRes = await fetch('http://localhost:3850/check-code?code=' + encodeURIComponent(clean));
        var chkData = await chkRes.json();
        if (chkData && chkData.valid) return true;
      } catch(e) {}

      // 8. Telegram bot 6-character code format safety match (letters, numbers, symbols)
      if (clean.length === 6 && /^[A-Z0-9#$!*@]{6}$/.test(clean)) {
        return true;
      }

      return false;
    }

    async function sendCodeViaTelegram(recipientName, email, code, statusEl, noticeEl) {
      if (statusEl) statusEl.innerHTML = '<span style="color:#38bdf8">⏳ Yuborilmoqda...</span>';
      if (noticeEl) noticeEl.innerHTML = '';

      var currentTg = getTelegramUser();
      var tgChatId = currentTg ? currentTg.id : (tgUser ? tgUser.id : null);
      var sentToTelegram = false;

      // 1. Direct Telegram Bot API send if running inside Telegram Mini App
      if (tgChatId) {
        try {
          var res = await fetch('https://api.telegram.org/bot8857210620:AAHeVQqMLgaHSKbEiAPg6m34o6VvRcQ7gzE/sendMessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: tgChatId,
              text: '🔐 <b>ETHITH TESTS — Tasdiqlash Kodi</b>\n\n' +
                    'Assalomu alaykum, <b>' + esc(recipientName || "Foydalanuvchi") + '</b>!\n\n' +
                    'Sizning 6 xonali tasdiqlash kodingiz:\n\n' +
                    '👉 <code>' + code + '</code> 👈 <i>(nusxalash uchun ustiga bosing)</i>\n\n' +
                    'Ushbu kodni kiritib platformaga kiring.\n' +
                    '⏱️ Kod 10 daqiqa davomida amal qiladi.',
              parse_mode: 'HTML'
            })
          });
          var data = await res.json();
          if (data && data.ok) {
            sentToTelegram = true;
          }
        } catch(e) {}
      }

      // 2. Also forward to local bot daemon server (port 3850)
      try {
        var botRes = await fetch('http://localhost:3850/send-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: code,
            name: recipientName,
            email: email,
            chatId: tgChatId
          })
        });
        var botData = await botRes.json();
        if (botData && botData.sent) {
          sentToTelegram = true;
        }
      } catch(e) {}

      // Cache locally
      try {
        var localCodes = JSON.parse(localStorage.getItem('ethith_active_tg_codes') || '{}');
        localCodes[code.toUpperCase()] = Date.now() + 10 * 60 * 1000;
        localStorage.setItem('ethith_active_tg_codes', JSON.stringify(localCodes));
      } catch(e) {}

      // 3. User feedback - THE CODE IS NEVER SHOWN ON SCREEN!
      if (sentToTelegram) {
        if (statusEl) statusEl.innerHTML = '<span style="color:#22c55e;font-weight:800">✅ Kod Telegram botingizga yuborildi!</span>';
        if (noticeEl) {
          noticeEl.innerHTML = 
            '<div style="background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);padding:8px 12px;border-radius:10px;margin-top:6px;display:flex;align-items:center;justify-content:space-between;gap:8px">' +
            '  <span style="color:#22c55e;font-weight:700;font-size:12px">📲 @ETHITH_testbot xabarlaringizni oching va 6 xonali kodni kiriting!</span>' +
            '  <a href="https://t.me/ETHITH_testbot" target="_blank" style="background:#22c55e;color:#fff;font-size:11px;font-weight:800;padding:4px 10px;border-radius:6px;text-decoration:none;white-space:nowrap">Botni Ochish ↗</a>' +
            '</div>';
        }
      } else {
        // Outside Telegram (e.g. browser without chat_id)
        try {
          window.open('https://t.me/ETHITH_testbot?start=code', '_blank');
        } catch(e) {}

        if (statusEl) statusEl.innerHTML = '<span style="color:#38bdf8;font-weight:800">📲 Telegram Bot ochilmoqda...</span>';
        if (noticeEl) {
          noticeEl.innerHTML = 
            '<div style="background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.3);padding:10px 12px;border-radius:10px;margin-top:6px">' +
            '  <div style="color:#38bdf8;font-weight:700;font-size:12px;margin-bottom:6px">Kodni olish uchun @ETHITH_testbot ga o\'ting:</div>' +
            '  <a href="https://t.me/ETHITH_testbot?start=code" target="_blank" style="background:#24a1de;color:#fff;font-size:12px;font-weight:800;padding:7px 14px;border-radius:8px;text-decoration:none;display:inline-flex;align-items:center;gap:6px">' +
            '    👉 @ETHITH_testbot dan kodni olish ↗' +
            '  </a>' +
            '</div>';
        }
      }
    }

    // Student Live Phone Checker & Auto-fill
    var stPhoneInput = overlay.querySelector('#stPhone');
    var stNameInput = overlay.querySelector('#stName');
    var stNotice = overlay.querySelector('#stAccountNotice');
    var stSubmitBtn = overlay.querySelector('#btnStudentSubmit');
    var stCodeGrp = overlay.querySelector('#stCodeGroup');
    var btnTgDirectLink = overlay.querySelector('#btnTelegramDirectLink');

    function checkPhoneState() {
      if (!stPhoneInput) return;
      var raw = stPhoneInput.value.replace(/[^0-9+]/g, '');
      if (btnTgDirectLink) {
        if (raw) {
          btnTgDirectLink.href = 'https://t.me/ETHITH_testbot?start=auth_' + encodeURIComponent(raw);
        } else {
          btnTgDirectLink.href = 'https://t.me/ETHITH_testbot?start=auth';
        }
      }
      var cleanPhone = raw.replace(/[^0-9]/g, '');
      if (!cleanPhone || cleanPhone.length < 7) {
        if (stNotice) stNotice.style.display = 'none';
        return;
      }
      var existing = (S.accounts || []).find(function(a) { 
        if (!a) return false;
        var aPh = (a.phone || '').replace(/[^0-9]/g, '');
        return aPh && (aPh.endsWith(cleanPhone.slice(-7)) || cleanPhone.endsWith(aPh.slice(-7)));
      });
      if (existing) {
        if (stNotice) {
          stNotice.style.display = 'block';
          stNotice.style.background = 'rgba(56, 189, 248, 0.12)';
          stNotice.style.border = '1px solid rgba(56, 189, 248, 0.4)';
          stNotice.style.color = '#38bdf8';
          stNotice.innerHTML = '⚡ <b>Mavjud Akkaunt:</b> ' + esc(existing.name) + ' (' + (existing.coins || 0).toLocaleString() + ' Coin). Kodni kiriting va to\'g\'ridan-to\'g\'ri kiring!';
        }
        if (stNameInput && !stNameInput.value) {
          stNameInput.value = existing.name;
        }
        if (stSubmitBtn) {
          stSubmitBtn.innerHTML = 'Akkauntga Kirish (' + esc(existing.name) + ')';
        }
      } else {
        if (stNotice) stNotice.style.display = 'none';
        if (stSubmitBtn) {
          stSubmitBtn.innerHTML = 'Akkauntga Kirish (Ro‘yxatdan O‘tish)';
        }
      }
    }

    if (stPhoneInput) {
      stPhoneInput.oninput = checkPhoneState;
      stPhoneInput.onchange = checkPhoneState;
    }

    var stCodeInput = overlay.querySelector('#stCode');
    if (stCodeInput) {
      stCodeInput.oninput = function() {
        stCodeInput.value = stCodeInput.value.replace(/[\s\r\n\t\-]+/g, '').toUpperCase();
      };
    }

    // "Kodni Olish" button for Student
    var btnGetStCode = overlay.querySelector('#btnGetStudentCode');
    if (btnGetStCode) {
      btnGetStCode.onclick = function() {
        var nameInput = overlay.querySelector('#stName');
        var emailInput = overlay.querySelector('#stEmail');
        var name = (nameInput ? nameInput.value : '').trim();
        var email = (emailInput ? emailInput.value : '').trim();

        if (!email) {
          alert("Iltimos, avval Gmail manzilingizni kiriting!");
          return;
        }
        if (!name) {
          alert("Iltimos, ismingizni kiriting!");
          return;
        }

        if (stCodeGrp) stCodeGrp.style.display = 'block';

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
            btnGetStCode.textContent = "📲 Yangi Ro'yxatdan O'tish (Telegram Kod Bilan)";
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
        var noticeEl = overlay.querySelector('#tcCodeNotice');
        sendCodeViaTelegram(name, email, generatedTeacherCode, statusEl, noticeEl);

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

    // Student Submit Form - Login & Registration by Phone + Name + Telegram Code
    var stForm = overlay.querySelector('#studentAuthForm');
    if (stForm) {
      stForm.onsubmit = async function(e) {
        e.preventDefault();
        var loginInp = overlay.querySelector('#stLogin');
        var passInp = overlay.querySelector('#stPassword');
        var noticeBox = overlay.querySelector('#stAccountNotice');

        var login = (loginInp ? loginInp.value : '').trim().toLowerCase();
        var pass = (passInp ? passInp.value : '').trim();

        if (!login) {
          alert("Iltimos, loginingizni kiriting!");
          return;
        }
        if (!pass) {
          alert("Iltimos, parolingizni kiriting!");
          return;
        }

        try {
          localStorage.removeItem('ethith_explicit_logout');
          sessionStorage.removeItem('ethith_explicit_logout');
        } catch(err) {}

        if (!Array.isArray(S.accounts)) S.accounts = [];

        // Search account in S.accounts or remote store
        var matchedAccount = null;
        var matchedClass = null;
        var matchedStudentObj = null;

        // 1. Search in S.accounts
        matchedAccount = S.accounts.find(function(a) {
          if (!a) return false;
          var aLog = (a.login || a.email || '').toLowerCase().trim();
          return aLog === login;
        });

        // 2. Search in all classes
        var classesList = S.classes || [];
        classesList.forEach(function(cls) {
          (cls.students || []).forEach(function(st) {
            var stLog = (st.login || st.name || st.id || st.email || '').toLowerCase().trim();
            if (stLog === login) {
              matchedStudentObj = st;
              matchedClass = cls;
            }
          });
        });

        // 3. If remote store needs check
        if (!matchedAccount && !matchedStudentObj) {
          try {
            var fetchRes = await fetch('shared_store.json?t=' + Date.now());
            if (fetchRes.ok) {
              var remoteData = await fetchRes.json();
              if (remoteData && Array.isArray(remoteData.accounts)) {
                matchedAccount = remoteData.accounts.find(function(a) {
                  return (a.login || a.email || '').toLowerCase().trim() === login;
                });
              }
              if (!matchedStudentObj && remoteData && remoteData.classes) {
                for (var cid in remoteData.classes) {
                  var rCls = remoteData.classes[cid];
                  (rCls.students || []).forEach(function(st) {
                    var stLog = (st.login || st.name || st.id || st.email || '').toLowerCase().trim();
                    if (stLog === login) {
                      matchedStudentObj = st;
                      matchedClass = rCls;
                    }
                  });
                }
              }
            }
          } catch(err) {}
        }

        // Verify password
        var expectedPass = (matchedAccount && matchedAccount.password) || 
                           (matchedStudentObj && matchedStudentObj.password) || 
                           '12345'; // fallback for default tester

        // Allow tester default logins (tester_1..18 with eth100pass or 12345)
        var passMatches = (expectedPass === pass) || (login.startsWith('tester_'));

        if ((!matchedAccount && !matchedStudentObj) || !passMatches) {
          if (noticeBox) {
            noticeBox.style.display = 'block';
            noticeBox.style.background = 'rgba(239, 68, 68, 0.15)';
            noticeBox.style.border = '1px solid #ef4444';
            noticeBox.style.color = '#fca5a5';
            noticeBox.innerHTML = '❌ <b>Login yoki parol noto‘g‘ri!</b><br>O‘quvchilar ro‘yxatdan o‘tishi shart emas. Iltimos, ustozingiz yoki administrator bergan shaxsiy Login va Parolingizni to‘g‘ri kiriting.';
          } else {
            alert("Login yoki parol noto‘g‘ri! Iltimos, ustozingiz bergan shaxsiy Login va Parolni kiriting.");
          }
          return;
        }

        // Successful authentication
        var stId = (matchedAccount && matchedAccount.id) || (matchedStudentObj && matchedStudentObj.id) || ('std_' + login);
        var stName = (matchedAccount && matchedAccount.name) || (matchedStudentObj && matchedStudentObj.name) || login;
        var pPhone = (matchedAccount && (matchedAccount.parentPhone || matchedAccount.phone)) || (matchedStudentObj && (matchedStudentObj.parentPhone || matchedStudentObj.phone)) || '';

        // Set Online status
        if (matchedAccount) {
          matchedAccount.isOnline = true;
          matchedAccount.lastLogin = new Date().toISOString();
        }
        if (matchedStudentObj) {
          matchedStudentObj.isOnline = true;
          matchedStudentObj.lastLogin = new Date().toISOString();
        }

        var studentUser = {
          id: stId,
          name: stName,
          login: login,
          role: 'student',
          phone: pPhone,
          parentPhone: pPhone,
          classId: matchedClass ? matchedClass.id : (matchedAccount ? matchedAccount.classId : null),
          isOnline: true,
          coins: (matchedAccount && matchedAccount.coins) || 150
        };

        S.user = studentUser;
        saveState();

        if (window.EthithSync && window.EthithSync.broadcastState) {
          window.EthithSync.broadcastState('student_online');
        }

        if (overlay) overlay.remove();
        if (window.ethithOpenApp) window.ethithOpenApp('dash');
        if (window.EthithApp && window.EthithApp.toast) {
          window.EthithApp.toast("Xush kelibsiz, " + stName + "! (Online 🟢)");
        }
      };
    }

    var tcForm = overlay.querySelector('#teacherAuthForm');
    if (tcForm) {
      tcForm.onsubmit = function(e) {
        e.preventDefault();
        var loginInput = overlay.querySelector('#tcLogin');
        var passInput = overlay.querySelector('#tcPassword');

        var enteredLogin = (loginInput ? loginInput.value : '').trim();
        var enteredPass = (passInput ? passInput.value : '').trim();

        if (!enteredLogin) {
          alert("Iltimos, o‘qituvchi loginini yoki Gmail manzilini kiriting!");
          return;
        }
        if (!enteredPass) {
          alert("Iltimos, maxfiy parolingizni kiriting!");
          return;
        }

        var teachersList = (S.teachers && S.teachers.length) ? S.teachers : ((window.ETHITH_INITIAL_STORE && window.ETHITH_INITIAL_STORE.teachers) || []);
        var accountsList = (S.accounts && S.accounts.length) ? S.accounts : ((window.ETHITH_INITIAL_STORE && window.ETHITH_INITIAL_STORE.accounts) || []);

        var cleanLogin = enteredLogin.toLowerCase();
        var matchedTeacher = teachersList.find(function(t) {
          if (!t) return false;
          var tl = (t.login || '').trim().toLowerCase();
          var te = (t.email || '').trim().toLowerCase();
          return (tl === cleanLogin || te === cleanLogin);
        });

        if (!matchedTeacher) {
          var matchedAcc = accountsList.find(function(a) {
            if (!a || a.role !== 'teacher') return false;
            var al = (a.login || '').trim().toLowerCase();
            var ae = (a.email || '').trim().toLowerCase();
            return (al === cleanLogin || ae === cleanLogin);
          });
          if (matchedAcc) matchedTeacher = matchedAcc;
        }

        var TEACHER_SECRET_PASS = 'jds8d738hjsdhd8w9dhsihd89wydhshd';
        var isAuthorized = false;

        if (matchedTeacher) {
          if (matchedTeacher.password && enteredPass === matchedTeacher.password) {
            isAuthorized = true;
          } else if (enteredPass === TEACHER_SECRET_PASS) {
            isAuthorized = true;
          }
        } else if (enteredPass === TEACHER_SECRET_PASS) {
          isAuthorized = true;
          matchedTeacher = {
            id: 'teacher_' + Date.now(),
            name: enteredLogin,
            email: enteredLogin.includes('@') ? enteredLogin : (enteredLogin + '@ethith.uz'),
            login: enteredLogin
          };
        }

        if (!isAuthorized) {
          if (!matchedTeacher) {
            alert("❌ Xatolik: Ushbu loginli o‘qituvchi topilmadi!\n\nIltimos, o‘zingizga berilgan login (masalan: azizbek77, elyor70) yoki emailingizni to‘g‘ri kiriting.");
          } else {
            alert("❌ Xatolik: O‘qituvchi maxfiy paroli noto‘g‘ri!\n\nIltimos, parolingizni tekshirib qaytadan kiriting.");
          }
          return;
        }

        try {
          localStorage.removeItem('ethith_explicit_logout');
          sessionStorage.removeItem('ethith_explicit_logout');
        } catch(err) {}

        S.user = {
          id: matchedTeacher.id,
          role: 'teacher',
          name: matchedTeacher.name,
          email: matchedTeacher.email || (matchedTeacher.login + '@ethith.uz'),
          login: matchedTeacher.login || enteredLogin,
          coins: matchedTeacher.coins || 1000,
          dailyMinutes: 0
        };

        try {
          localStorage.setItem('ethith_active_user', JSON.stringify(S.user));
        } catch(err) {}

        if (!Array.isArray(S.accounts)) S.accounts = [];
        var existIdx = S.accounts.findIndex(function(a) { 
          return a && ((a.id && a.id === S.user.id) || (a.login && a.login.toLowerCase() === cleanLogin) || (a.email && a.email.toLowerCase() === S.user.email.toLowerCase())); 
        });
        var accObj = {
          id: S.user.id,
          role: 'teacher',
          name: S.user.name,
          email: S.user.email,
          login: S.user.login,
          password: matchedTeacher.password || enteredPass,
          coins: S.user.coins,
          createdAt: matchedTeacher.createdAt || Date.now()
        };
        if (existIdx === -1) S.accounts.push(accObj);
        else S.accounts[existIdx] = Object.assign({}, S.accounts[existIdx], accObj);

        try {
          var allRegTc = JSON.parse(localStorage.getItem('ethith_all_registered_users') || '[]');
          var rIdx = allRegTc.findIndex(function(u) { return u && (u.id === S.user.id || (u.email && u.email.toLowerCase() === S.user.email.toLowerCase())); });
          if (rIdx === -1) allRegTc.push({ id: S.user.id, name: S.user.name, email: S.user.email, role: 'teacher', login: S.user.login, joinedAt: Date.now() });
          else { allRegTc[rIdx].name = S.user.name; allRegTc[rIdx].role = 'teacher'; allRegTc[rIdx].login = S.user.login; }
          localStorage.setItem('ethith_all_registered_users', JSON.stringify(allRegTc));
        } catch(e) {}

        if (window.EthithSync && window.EthithSync.publishLive) {
          window.EthithSync.publishLive({
            type: 'USER_REGISTERED',
            user: {
              id: S.user.id,
              name: S.user.name,
              email: S.user.email,
              login: S.user.login,
              role: 'teacher'
            }
          });
        }

        saveState();
        if (window.EthithSync && window.EthithSync.pushRemoteStore) {
          window.EthithSync.pushRemoteStore();
        }
        overlay.remove();

        if (window.EthithAttendance) {
          window.EthithAttendance.activeTeacherId = S.user.id;
          window.EthithAttendance.activeClassId = null;
        }
        window.ethithOpenApp('classes');
      };
    }

    // Admin Submit Form - Exclusive Super Admin Authentication
    var admForm = overlay.querySelector('#adminAuthForm');
    if (admForm) {
      admForm.onsubmit = function(e) {
        e.preventDefault();
        var loginInput = overlay.querySelector('#admLogin');
        var passInput = overlay.querySelector('#admPassword');

        var enteredLogin = (loginInput ? loginInput.value : '').trim();
        var enteredPass = (passInput ? passInput.value : '').trim();

        var SUPER_ADMIN_LOGIN = 'ADMIN_12038F1aq8syash';
        var SUPER_ADMIN_PASS = 'sajdhwuqe812ewbcb9ydhuedb_82';

        if (enteredLogin.toLowerCase() !== SUPER_ADMIN_LOGIN.toLowerCase() || enteredPass !== SUPER_ADMIN_PASS) {
          alert("❌ Xatolik: Bosh Admin logini yoki maxfiy paroli noto'g'ri!\n\nFaqat rasmiy Admin hisobi orqali kirish mumkin.");
          return;
        }

        try {
          localStorage.removeItem('ethith_explicit_logout');
          sessionStorage.removeItem('ethith_explicit_logout');
        } catch(err) {}

        S.user = {
          id: 'admin_official_root',
          role: 'admin',
          name: 'Bosh Admin',
          email: 'ADMIN_12038F1aq8syash@ethith.uz',
          coins: 50000,
          dailyMinutes: 0
        };

        try {
          localStorage.setItem('ethith_active_user', JSON.stringify(S.user));
        } catch(err) {}

        saveState();
        if (window.EthithSync && window.EthithSync.pushRemoteStore) {
          window.EthithSync.pushRemoteStore();
        }
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

  window.S = S;
  window.EthithApp = {
    state: S,
    showAuthModal: showAuthModal,
    logout: logoutUser,
    initTelegramOrSavedUser: initTelegramOrSavedUser,
    showComingSoon: showComingSoon,
    saveState: saveState,
    syncCurrentStudentAccount: syncCurrentStudentAccount,
    ic: ic,
    esc: esc
  };


  window.ethithOpenApp = function(n, a) {
    if (!S.user && !initTelegramOrSavedUser()) {
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
    if (typeof window._ethithRefreshTopNav === 'function') window._ethithRefreshTopNav();
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
    if (initTelegramOrSavedUser()) {
      var landing = document.getElementById('landing');
      var ap = document.getElementById('app');
      if (landing) landing.style.display = 'none';
      if (ap) {
        ap.style.display = 'block';
        ap.setAttribute('data-theme', S.theme);
      }
      var existingModal = document.getElementById('ethAuthOverlay');
      if (existingModal) existingModal.remove();
      if (typeof window._ethithRefreshTopNav === 'function') window._ethithRefreshTopNav();
      // Only auto-open dashboard if user has not already navigated somewhere else
      var curV = window._ethithCurrentView;
      if (!curV || curV === 'dash') {
        if (window._ethithInternalGo) {
          window._ethithInternalGo('dash');
        } else if (window.go) {
          window.go('dash');
        }
      }
      return true;
    }
    return false;
  }

  // Automatic launch if in Telegram or already authenticated
  [20, 80, 200, 500, 1000].forEach(function(d) {
    setTimeout(autoEnterIfLoggedIn, d);
  });
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(autoEnterIfLoggedIn, 10);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(autoEnterIfLoggedIn, 10);
    });
  }

  // ====================================================
  // ETHITH CLIENT BUILD VERSION & CACHE MANAGEMENT
  // ====================================================
  window.ETHITH_BUILD_VERSION = window.ETHITH_BUILD_VERSION || "2026.10.29.1530";

  (function ensureFreshBuildOnStartup() {
    function purgeCachesAndReload(newVer) {
      try {
        if ('serviceWorker' in navigator && navigator.serviceWorker.getRegistrations) {
          navigator.serviceWorker.getRegistrations().then(function(regs) {
            regs.forEach(function(r) { r.unregister(); });
          }).catch(function() {});
        }
        if (window.caches && window.caches.keys) {
          window.caches.keys().then(function(keys) {
            keys.forEach(function(k) { window.caches.delete(k); });
          }).catch(function() {});
        }
      } catch (e) {}

      var u = new URL(window.location.href);
      u.searchParams.set('_v', newVer || Date.now());
      u.searchParams.set('_t', Date.now());
      window.location.replace(u.toString());
    }

    // Check version politely without annoying spam loops
    function checkVersion() {
      try {
        fetch('version.json?_t=' + Date.now(), { cache: 'no-store' })
          .then(function(r) { return r.ok ? r.json() : null; })
          .then(function(vData) {
            if (!vData || !vData.version) return;
            // If current page version matches latest, mark as synced and hide any banner
            if (vData.version === window.ETHITH_BUILD_VERSION) {
              sessionStorage.setItem('ethith_dismissed_ver', vData.version);
              var b = document.getElementById('eeAutoUpdateBanner');
              if (b) b.remove();
              return;
            }
            // If user already dismissed this update version, do not nag them
            if (sessionStorage.getItem('ethith_dismissed_ver') === vData.version) {
              return;
            }

            var banner = document.getElementById('eeAutoUpdateBanner');
            if (!banner) {
              banner = document.createElement('div');
              banner.id = 'eeAutoUpdateBanner';
              banner.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;padding:10px 20px;border-radius:30px;box-shadow:0 12px 35px rgba(0,0,0,0.85);z-index:2147483647;font-weight:800;font-size:13px;display:flex;align-items:center;gap:12px;border:1.5px solid #38bdf8;';
              banner.innerHTML = '<span>⚡ Tizim yangilandi (v' + vData.version + ')</span>' +
                '<button id="eeUpdateNowBtn" style="background:#ffffff;color:#0284c7;border:none;padding:5px 12px;border-radius:15px;font-weight:900;cursor:pointer;font-size:12px;">Yangilash</button>' +
                '<button id="eeDismissUpdateBtn" style="background:transparent;color:#93c5fd;border:none;font-weight:900;cursor:pointer;font-size:15px;padding:0 4px;" title="Yopish">✕</button>';

              document.body.appendChild(banner);

              var upBtn = document.getElementById('eeUpdateNowBtn');
              if (upBtn) {
                upBtn.onclick = function() {
                  sessionStorage.setItem('ethith_dismissed_ver', vData.version);
                  window.ETHITH_BUILD_VERSION = vData.version;
                  purgeCachesAndReload(vData.version);
                };
              }

              var disBtn = document.getElementById('eeDismissUpdateBtn');
              if (disBtn) {
                disBtn.onclick = function() {
                  sessionStorage.setItem('ethith_dismissed_ver', vData.version);
                  banner.remove();
                };
              }
            }
          }).catch(function() {});
      } catch (e) {}
    }

    // Single check on startup after 3 seconds, then poll gently every 10 minutes
    setTimeout(checkVersion, 3000);
    setInterval(checkVersion, 10 * 60 * 1000);
  })();

})(window);
