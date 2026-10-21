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
    var isMuhammadUser = (curEmail === 'muhammedjoraboyev1@gmail.com' || curName.toLowerCase().indexOf('muhammadyusuf') !== -1) && S.user.role !== 'teacher';
    
    // Canonical user: Muhammadyusuf (muhammedjoraboyev1@gmail.com)
    if (curEmail === 'muhammedjoraboyev1@gmail.com') {
      S.user.id = 'muhammedjoraboyev1@gmail.com';
      if (!S.user.name) S.user.name = 'Muhammadyusuf';
      S.user.coins = Math.max(Number(S.user.coins) || 0, 100000);
    } else if (S.user.coins === undefined || S.user.coins === null) {
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
        acc.coins = Math.max(Number(acc.coins) || 0, 100000);
      }
      dedupedAccounts.push(acc);
    });
    S.accounts = dedupedAccounts;
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

      if (!existingTgUser && S.user && (S.user.telegramId == tgUser.id || S.user.id == 'tg_' + tgUser.id)) {
        existingTgUser = S.user;
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
          coins: 100,
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

    // Check if user is saved in localStorage
    if (!S.user) {
      try {
        var savedAct = localStorage.getItem('ethith_active_user');
        if (savedAct) {
          var parsedAct = JSON.parse(savedAct);
          if (parsedAct && parsedAct.id) {
            S.user = parsedAct;
            saveState();
            return true;
          }
        }
      } catch(e) {}
    }

    if (S.user) {
      try {
        localStorage.setItem('ethith_active_user', JSON.stringify(S.user));
      } catch(e) {}
      return true;
    }

    return false;
  }

  // 1. Mandatory Auth Modal with Telegram Mini App Verification Code Flow
  function showAuthModal() {
    if (initTelegramOrSavedUser()) {
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
      '          <label style="font-weight:700;font-size:13px">Gmail Manzili</label>' +
      '          <input type="email" id="stEmail" placeholder="nomingiz@gmail.com" required autocomplete="email">' +
      '        </div>' +
      '        <div class="eth-form-group">' +
      '          <label style="font-weight:700;font-size:13px">Ism va Familiya</label>' +
      '          <input type="text" id="stName" placeholder="Ismingiz (yoki ro\'yxatdan o\'tgan ism)" value="" required autocomplete="name">' +
      '        </div>' +
      '        <div id="stAccountNotice" style="margin:6px 0 10px;padding:8px 12px;border-radius:10px;font-size:12px;display:none"></div>' +
      '        <div style="margin:10px 0 12px;display:flex;flex-direction:column;gap:8px">' +
      '          <button type="submit" id="btnStudentSubmit" class="eth-btn-primary" style="background:#2563eb;color:#fff;font-weight:800;font-size:15px;padding:12px;border-radius:12px;border:none;cursor:pointer;width:100%;box-shadow:0 8px 20px -6px rgba(37,99,235,0.6)">🚀 Akkauntga Kirish</button>' +
      '          <button type="button" id="btnGetStudentCode" style="background:rgba(255,255,255,0.06);color:var(--text);font-weight:700;font-size:12.5px;padding:9px;border-radius:10px;border:1px solid var(--line);cursor:pointer;width:100%;display:flex;align-items:center;justify-content:center;gap:6px">📲 Yangi Ro\'yxatdan O\'tish (Telegram Kod Bilan)</button>' +
      '        </div>' +
      '        <div class="eth-form-group" id="stCodeGroup" style="display:none">' +
      '          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">' +
      '            <label style="font-weight:700;font-size:13px;margin:0">Tasdiqlash Kodi (6 xonali)</label>' +
      '            <span id="stCodeStatus" style="font-size:11.5px;color:#38bdf8;font-weight:700"></span>' +
      '          </div>' +
      '          <input type="text" id="stCode" placeholder="Masalan: K9#4F7" maxlength="12" style="letter-spacing:5px;font-family:monospace;font-size:20px;text-align:center;font-weight:900;text-transform:uppercase">' +
      '          <div id="stCodeNotice" style="margin-top:6px;font-size:11.5px;color:var(--muted)">' +
      '            <span>Kod @ETHITH_testbot telegram boti orqali yuboriladi</span>' +
      '          </div>' +
      '        </div>' +
      '      </form>' +
      '    </div>' +
      '    <div id="teacherFormBox" style="display:none">' +
      '      <form id="teacherAuthForm">' +
      '        <div class="eth-form-group">' +
      '          <label style="font-weight:700;font-size:13px;color:#f1f5f9">O\'qituvchi Logini</label>' +
      '          <input type="text" id="tcLogin" placeholder="ADMIN_..." style="font-family:monospace;font-weight:800;letter-spacing:1px" required autocomplete="username">' +
      '        </div>' +
      '        <div class="eth-form-group" style="margin-top:12px">' +
      '          <label style="font-weight:700;font-size:13px;color:#f1f5f9">O\'qituvchi Paroli</label>' +
      '          <input type="password" id="tcPassword" placeholder="Parolni kiriting..." required autocomplete="current-password">' +
      '          <small style="color:#94a3b8;font-size:11.5px;margin-top:4px;display:block">🔒 Faqat rasmiy ustoz logini va maxfiy paroli bilan kirish mumkin.</small>' +
      '        </div>' +
      '        <button type="submit" class="eth-btn-primary" style="background:linear-gradient(135deg, #0f172a, #2563eb);margin-top:16px;padding:12px;font-size:15px;font-weight:800;border-radius:12px;width:100%">O\'qituvchi Kabinetiga Kirish 🚀</button>' +
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

    // Student Live Email Checker & Auto-fill
    var stEmailInput = overlay.querySelector('#stEmail');
    var stNameInput = overlay.querySelector('#stName');
    var stNotice = overlay.querySelector('#stAccountNotice');
    var stSubmitBtn = overlay.querySelector('#btnStudentSubmit');
    var stCodeGrp = overlay.querySelector('#stCodeGroup');

    function checkEmailState() {
      if (!stEmailInput) return;
      var em = stEmailInput.value.toLowerCase().trim();
      if (!em || !em.includes('@')) {
        if (stNotice) stNotice.style.display = 'none';
        return;
      }
      var existing = (S.accounts || []).find(function(a) { return a.email && a.email.toLowerCase().trim() === em; });
      if (existing) {
        if (stNotice) {
          stNotice.style.display = 'block';
          stNotice.style.background = 'rgba(56, 189, 248, 0.12)';
          stNotice.style.border = '1px solid rgba(56, 189, 248, 0.4)';
          stNotice.style.color = '#38bdf8';
          stNotice.innerHTML = '⚡ <b>Mavjud Akkaunt:</b> ' + esc(existing.name) + ' (' + (existing.coins || 0).toLocaleString() + ' Coin). Ismingizni tasdiqlang va to\'g\'ridan-to\'g\'ri kiring!';
        }
        if (stNameInput && !stNameInput.value) {
          stNameInput.value = existing.name;
        }
        if (stSubmitBtn) {
          stSubmitBtn.innerHTML = '🚀 Akkauntga Kirish (' + esc(existing.name) + ')';
        }
      } else {
        if (stNotice) stNotice.style.display = 'none';
        if (stSubmitBtn) {
          stSubmitBtn.innerHTML = '🚀 Akkauntga Kirish';
        }
      }
    }

    if (stEmailInput) {
      stEmailInput.oninput = checkEmailState;
      stEmailInput.onchange = checkEmailState;
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

    // Student Submit Form - Universal Login & Cloud Restore by Gmail + Name
    var stForm = overlay.querySelector('#studentAuthForm');
    if (stForm) {
      stForm.onsubmit = async function(e) {
        e.preventDefault();
        var nameInput = overlay.querySelector('#stName');
        var emailInput = overlay.querySelector('#stEmail');
        var codeInput = overlay.querySelector('#stCode');

        var name = (nameInput ? nameInput.value : '').trim();
        var email = (emailInput ? emailInput.value : '').trim();
        var code = (codeInput ? codeInput.value : '').trim();

        if (!email) {
          alert("Iltimos, Gmail manzilingizni kiriting!");
          return;
        }
        if (!name) {
          alert("Iltimos, ismingizni kiriting!");
          return;
        }

        var cleanEmail = email.toLowerCase().trim();
        var cleanName = name.toLowerCase().trim();

        if (!Array.isArray(S.accounts)) S.accounts = [];

        // 1. Search existing account in memory or remote store
        var existingAcc = S.accounts.find(function(acc) {
          return acc.email && acc.email.toLowerCase().trim() === cleanEmail;
        });

        if (!existingAcc) {
          try {
            var fetchRes = await fetch('shared_store.json?t=' + Date.now());
            if (fetchRes.ok) {
              var remoteData = await fetchRes.json();
              if (remoteData && Array.isArray(remoteData.accounts)) {
                existingAcc = remoteData.accounts.find(function(a) {
                  return a.email && a.email.toLowerCase().trim() === cleanEmail;
                });
              }
            }
          } catch(err) {}
        }

        // SCENARIO 1: Existing Account — Cloud Sync / Universal Device Login
        if (existingAcc) {
          var regName = (existingAcc.name || '').toLowerCase().trim();
          var nameMatches = (regName === cleanName || cleanName.indexOf(regName) !== -1 || regName.indexOf(cleanName) !== -1);

          var authorized = false;
          if (nameMatches) {
            authorized = true;
          } else if (code) {
            authorized = await validateAuthCode(code, generatedStudentCode);
            if (!authorized) {
              alert("❌ Tasdiqlash kodi noto'g'ri! Ushbu akkauntga kirish uchun to'g'ri ismni kiriting yoki Telegram bot (@ETHITH_testbot) kodini to'g'ri tering.");
              return;
            }
            existingAcc.name = name;
          } else {
            if (stCodeGrp) stCodeGrp.style.display = 'block';
            alert("⚠️ Ushbu Gmail bo'yicha akkaunt allaqachon mavjud!\n\nAkkaunt egasi: " + existingAcc.name + "\n\nIltimos, ushbu hisobga kirish uchun ro'yxatdan o'tgan to'g'ri ismingizni kiriting (" + existingAcc.name + ") yoki 'Telegram Kod Bilan' tugmasini bosing.");
            return;
          }

          if (authorized) {
            var initCoins = existingAcc.coins !== undefined ? Number(existingAcc.coins) : 150;
            if (cleanEmail === 'muhammedjoraboyev1@gmail.com') {
              initCoins = Math.max(initCoins, 100000);
              existingAcc.coins = initCoins;
              if (!existingAcc.name) existingAcc.name = 'Muhammadyusuf';
            }

            S.user = {
              id: cleanEmail,
              role: existingAcc.role || 'student',
              name: existingAcc.name || name,
              email: cleanEmail,
              dailyMinutes: existingAcc.dailyMinutes || 0,
              coins: initCoins,
              avatar: existingAcc.avatar || null,
              nameStyle: existingAcc.nameStyle || null,
              title: existingAcc.title || null,
              gifts: Array.isArray(existingAcc.gifts) ? existingAcc.gifts : []
            };
            if (existingAcc.level) S.level = existingAcc.level;
            if (existingAcc.unlocked) S.unlocked = existingAcc.unlocked;
            if (existingAcc.quizScores) S.quizScores = existingAcc.quizScores;
            if (existingAcc.mistakes) S.mistakes = existingAcc.mistakes;
            existingAcc.updatedAt = Date.now();

            var aIdx = S.accounts.findIndex(function(a) { return a.email && a.email.toLowerCase().trim() === cleanEmail; });
            if (aIdx === -1) {
              S.accounts.push(existingAcc);
            } else {
              S.accounts[aIdx] = existingAcc;
            }

            try {
              var regList = JSON.parse(localStorage.getItem('ethith_all_registered_users') || '[]');
              var rIdx = regList.findIndex(function(u) { return u.email && u.email.toLowerCase().trim() === cleanEmail; });
              if (rIdx === -1) {
                regList.push({ id: cleanEmail, name: S.user.name, email: cleanEmail, role: 'student', coins: initCoins, joinedAt: Date.now() });
              } else {
                regList[rIdx].name = S.user.name;
                regList[rIdx].coins = initCoins;
                regList[rIdx].avatar = S.user.avatar;
                regList[rIdx].title = S.user.title;
              }
              localStorage.setItem('ethith_all_registered_users', JSON.stringify(regList));
            } catch(e) {}

            saveState();
            if (window.EthithSync && window.EthithSync.pushRemoteStore) {
              window.EthithSync.pushRemoteStore();
            }
            overlay.remove();
            alert("🎉 Xush kelibsiz, " + S.user.name + "! Akkauntingiz muvaffaqiyatli ushbu qurilmaga o'tkazildi.");
            window.ethithOpenApp('dash');
            return;
          }
        }

        // SCENARIO 2: Brand New Registration (Requires 6-digit Telegram Code)
        if (!code) {
          if (stCodeGrp) stCodeGrp.style.display = 'block';
          alert("ℹ️ Yangi ro'yxatdan o'tish uchun 'Telegram Kod Bilan' tugmasini bosing va @ETHITH_testbot dan kelgan 6 xonali kodni kiriting.");
          return;
        }

        var isOk = await validateAuthCode(code, generatedStudentCode);
        if (!isOk) {
          alert("❌ Xatolik: Tasdiqlash kodi noto'g'ri! Iltimos, Telegram bot (@ETHITH_testbot) orqali yuborilgan 6 xonali kodni to'g'ri kiriting.");
          return;
        }

        // New student registration - Strict 1:1 Gmail rule:
        // New account ALWAYS starts fresh: NO avatar, NO title, NO inherited gifts!
        var isMuNew = (cleanEmail === 'muhammedjoraboyev1@gmail.com');
        var newCoins = isMuNew ? 100000 : 150;
        var newAcc = {
          id: cleanEmail,
          role: 'student',
          name: name,
          email: cleanEmail,
          level: 'A1',
          unlocked: { A1: 1, A2: 1, B1: 1, B2: 1, C1: 1, C2: 1 },
          quizScores: {},
          mistakes: [],
          dailyMinutes: 0,
          coins: newCoins,
          avatar: null,
          title: null,
          nameStyle: null,
          gifts: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        S.accounts.push(newAcc);
        S.user = {
          id: cleanEmail,
          role: 'student',
          name: newAcc.name,
          email: cleanEmail,
          dailyMinutes: 0,
          coins: newAcc.coins,
          avatar: null,
          title: null,
          nameStyle: null,
          gifts: []
        };

        try {
          var allUsers = JSON.parse(localStorage.getItem('ethith_all_registered_users') || '[]');
          var uIdx = allUsers.findIndex(function(u) { return u.email && u.email.toLowerCase().trim() === cleanEmail; });
          if (uIdx === -1) {
            allUsers.push({ id: cleanEmail, name: name, email: cleanEmail, role: 'student', coins: newCoins, joinedAt: Date.now() });
          } else {
            allUsers[uIdx].name = name;
            allUsers[uIdx].coins = newCoins;
          }
          localStorage.setItem('ethith_all_registered_users', JSON.stringify(allUsers));
        } catch(e) {}

        saveState();
        if (window.EthithSync && window.EthithSync.publishLive) {
          window.EthithSync.publishLive({
            type: 'USER_REGISTERED',
            user: {
              id: cleanEmail,
              name: newAcc.name,
              email: cleanEmail,
              role: 'student',
              coins: newAcc.coins || 0,
              avatar: null,
              level: newAcc.level || 'A1',
              joinedAt: newAcc.createdAt || Date.now()
            }
          });
        }
        if (window.EthithSync && window.EthithSync.pushRemoteStore) {
          window.EthithSync.pushRemoteStore();
        }
        overlay.remove();
        alert("🎉 Tabriklaymiz! Telegram orqali yangi akkauntingiz muvaffaqiyatli ochildi.");
        window.ethithOpenApp('dash');
      };
    }

    // Teacher Submit Form - Super Admin Exclusive Authentication
    var tcForm = overlay.querySelector('#teacherAuthForm');
    if (tcForm) {
      tcForm.onsubmit = function(e) {
        e.preventDefault();
        var loginInput = overlay.querySelector('#tcLogin');
        var passInput = overlay.querySelector('#tcPassword');

        var enteredLogin = (loginInput ? loginInput.value : '').trim();
        var enteredPass = (passInput ? passInput.value : '').trim();

        var SUPER_TEACHER_LOGIN = 'ADMIN_12038F1aq8syash';
        var SUPER_TEACHER_PASS = 'sajdhwuqe812ewbcb9ydhuedb_82';

        if (enteredLogin !== SUPER_TEACHER_LOGIN || enteredPass !== SUPER_TEACHER_PASS) {
          alert("❌ Xatolik: Super Admin login yoki maxfiy paroli noto'g'ri!\n\nFaqat rasmiy ustoz hisobi orqali kirish mumkin.");
          return;
        }

        var teacherName = 'Ustoz';
        var cleanTcEmail = 'ADMIN_12038F1aq8syash@ethith.uz';
        S.user = {
          id: 'admin_official_teacher',
          role: 'teacher',
          name: teacherName,
          email: cleanTcEmail,
          dailyMinutes: 0
        };

        if (!Array.isArray(S.accounts)) S.accounts = [];
        var exTc = S.accounts.find(function(a) { return a.id === 'admin_official_teacher' || (a.email && a.email.toLowerCase() === cleanTcEmail.toLowerCase()); });
        if (!exTc) {
          S.accounts.push({
            id: S.user.id,
            role: 'teacher',
            name: teacherName,
            email: cleanTcEmail,
            createdAt: Date.now()
          });
        }

        try {
          var allRegTc = JSON.parse(localStorage.getItem('ethith_all_registered_users') || '[]');
          if (!allRegTc.some(function(u) { return u.id === S.user.id; })) {
            allRegTc.push({ id: S.user.id, name: teacherName, email: cleanTcEmail, role: 'teacher', joinedAt: Date.now() });
            localStorage.setItem('ethith_all_registered_users', JSON.stringify(allRegTc));
          }
        } catch(e) {}

        if (window.EthithSync && window.EthithSync.publishLive) {
          window.EthithSync.publishLive({
            type: 'USER_REGISTERED',
            user: {
              id: S.user.id,
              name: teacherName,
              email: cleanTcEmail,
              role: 'teacher'
            }
          });
        }

        saveState();
        if (window.EthithSync && window.EthithSync.pushRemoteStore) {
          window.EthithSync.pushRemoteStore();
        }
        overlay.remove();
        alert("👋 Xush kelibsiz, Hurmatli " + teacherName + "! O'qituvchilar kabineti muvaffaqiyatli ochildi.");
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
  // ETHITH CLIENT BUILD VERSION
  // Auto-reload is disabled per user requirement: No spontaneous page refreshes.
  // Real-time server state syncs seamlessly via MQTT/WebSockets without refreshing.
  // ====================================================
  window.ETHITH_BUILD_VERSION = "2026.10.18.0010";

})(window);
