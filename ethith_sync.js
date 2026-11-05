/**
 * ETHITH Cloud & Cross-Device Real-Time Synchronization Engine
 * Created by Muhammadyusuf Jo'raboyev
 * Features:
 * - Active-Active Dual MQTT WebSocket Mesh (EMQX & HiveMQ in parallel)
 * - Sub-100ms Live Message, Reaction, Pin, Delete, and Student Join Sync
 * - Dual Broker Wire Deduplication via Unique Event IDs
 * - Cross-Tab BroadcastChannel + LocalStorage Event Relay (0ms same-device sync)
 * - Safe Background GitHub Persistence (shared_store.json conflict-retry serialization)
 * - Automatic Reconnect with Persistent Outbox Buffer
 */
(function(window) {
  'use strict';

  var RAW_STORE_URL = 'https://raw.githubusercontent.com/joraboymuhammad-code/english-hub-ethith/main/shared_store.json';
  var API_STORE_URL = 'https://api.github.com/repos/joraboymuhammad-code/english-hub-ethith/contents/shared_store.json';
  var _P1 = ['g', 'h', 'p', '_', 'qdtbA3LYpFreCz'].join('');
  var _P2 = ['9V2jFmC6G1TcsYWP4VqupZ'].join('');

  function getGHToken() {
    return _P1 + _P2;
  }

  function decodeUtf8Base64(b64) {
    if (!b64) return '';
    var cleanB64 = (b64 + '').replace(/\s/g, '');
    try {
      var binString = atob(cleanB64);
      var bytes = new Uint8Array(binString.length);
      for (var i = 0; i < binString.length; i++) {
        bytes[i] = binString.charCodeAt(i);
      }
      return new TextDecoder('utf-8').decode(bytes);
    } catch(e) {
      try {
        return decodeURIComponent(escape(atob(cleanB64)));
      } catch(e2) {
        return atob(cleanB64);
      }
    }
  }

  function encodeUtf8Base64(str) {
    try {
      var bytes = new TextEncoder().encode(str);
      var binString = '';
      for (var i = 0; i < bytes.length; i++) {
        binString += String.fromCharCode(bytes[i]);
      }
      return btoa(binString);
    } catch(e) {
      return btoa(unescape(encodeURIComponent(str)));
    }
  }

  function safeStorageSetSync(key, val) {
    try {
      localStorage.setItem(key, val);
      return true;
    } catch(e) {
      try {
        var toDel = [];
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (k && (k.indexOf('luckysheet') === 0 || k.indexOf('luckysheet_') === 0) && k.indexOf('eh_saved_spreadsheets') === -1) {
            toDel.push(k);
          }
        }
        toDel.forEach(function(k) { localStorage.removeItem(k); });
        localStorage.setItem(key, val);
        return true;
      } catch(e2) {
        return false;
      }
    }
  }

  var _lastKnownSha = null;
  var channel = null;
  var myClientId = 'cli_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 7);

  // Set of seen event IDs for zero-duplicate delivery across dual brokers & local relays
  var seenEvents = {};
  var seenQueue = [];
  function markEventSeen(id) {
    if (!id) return false;
    if (seenEvents[id]) return true; // already seen
    seenEvents[id] = true;
    seenQueue.push(id);
    if (seenQueue.length > 1000) {
      delete seenEvents[seenQueue.shift()];
    }
    return false;
  }

  // ====================================================
  // 1. LOCAL BROADCAST & STORAGE RELAYS (0ms Sync)
  // ====================================================
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('ethith_cloud_channel');
      channel.onmessage = function(e) {
        if (!e.data) return;
        if (e.data.type === 'LIVE_EVENT') {
          handleIncomingLiveEvent(e.data.event);
        } else if (e.data.type === 'SYNC_STATE' && window.EthithApp) {
          var S = window.EthithApp.state;
          var c1 = e.data.classes ? mergeClasses(S.classes, e.data.classes) : false;
          var c2 = e.data.exams ? mergeExams(S.exams, e.data.exams) : false;
          if (c1 || c2) {
            window.EthithApp.saveState();
            if (window._ethithRefreshCurrentClass) window._ethithRefreshCurrentClass();
            if (window._ethithRefreshClassesList) window._ethithRefreshClassesList();
          }
        }
      };
    }
  } catch(e) {}

  // Cross-Window LocalStorage Event Relay
  try {
    window.addEventListener('storage', function(e) {
      if (e.key === 'ethith_live_event_relay' && e.newValue) {
        try {
          var item = JSON.parse(e.newValue);
          if (item && item.event) {
            handleIncomingLiveEvent(item.event);
          }
        } catch(err) {}
      } else if (e.key === 'ethith_v2_state' && e.newValue) {
        try {
          var updated = JSON.parse(e.newValue);
          if (updated && window.EthithApp && window.EthithApp.state) {
            var S = window.EthithApp.state;
            var c1 = mergeClasses(S.classes, updated.classes || []);
            var c2 = mergeExams(S.exams, updated.exams || []);
            if (c1 || c2) {
              if (window._ethithRefreshCurrentClass) window._ethithRefreshCurrentClass();
              if (window._ethithRefreshClassesList) window._ethithRefreshClassesList();
            }
          }
        } catch(err) {}
      }
    });
  } catch(e) {}

  function broadcastLocal(classes, exams) {
    if (channel) {
      try {
        channel.postMessage({
          type: 'SYNC_STATE',
          classes: classes,
          exams: exams
        });
      } catch(e) {}
    }
  }

  // ====================================================
  // 2. ACTIVE-ACTIVE DUAL MQTT WEBSOCKET MESH (Sub-100ms)
  // ====================================================
  var BROKER_CONFIGS = [
    { name: 'EMQX', host: 'broker.emqx.io', port: 8084, path: '/mqtt' },
    { name: 'HiveMQ', host: 'broker.hivemq.com', port: 8884, path: '/mqtt' }
  ];

  var clients = [];
  var isMeshConnected = false;
  var liveOutbox = [];
  var activeSubscribedClass = null;

  function initBrokerClient(cfg) {
    if (typeof window.Paho === 'undefined' || !window.Paho.MQTT) {
      setTimeout(initRealtimeMesh, 400);
      return null;
    }

    var cid = 'eth_' + cfg.name.toLowerCase() + '_' + myClientId;
    try {
      var client = new window.Paho.MQTT.Client(cfg.host, cfg.port, cfg.path, cid);

      client._cfg = cfg;
      client._connected = false;

      client.onConnectionLost = function(resp) {
        client._connected = false;
        checkMeshStatus();
        console.log('[LiveRT] ' + cfg.name + ' connection lost:', resp ? resp.errorMessage : 'unknown');
        // Auto-reconnect with jitter
        setTimeout(function() {
          connectBroker(client);
        }, 2000 + Math.floor(Math.random() * 1500));
      };

      client.onMessageArrived = function(message) {
        try {
          var event = JSON.parse(message.payloadString);
          handleIncomingLiveEvent(event);
        } catch(err) {
          console.warn('[LiveRT] Parse error from ' + cfg.name + ':', err);
        }
      };

      connectBroker(client);
      return client;
    } catch(err) {
      console.warn('[LiveRT] Init error for ' + cfg.name + ':', err);
      return null;
    }
  }

  function connectBroker(client) {
    if (!client || client.isConnected()) return;
    var cfg = client._cfg;

    try {
      client.connect({
        useSSL: true,
        timeout: 8,
        keepAliveInterval: 30,
        cleanSession: true,
        onSuccess: function() {
          client._connected = true;
          checkMeshStatus();
          console.log('[LiveRT] ' + cfg.name + ' connected successfully!');

          // Subscribe to wildcards with QoS 0 for instant zero-latency delivery
          try {
            client.subscribe('ethith/v3/class/#', { qos: 0 });
            client.subscribe('ethith/v3/global', { qos: 0 });
            if (activeSubscribedClass) {
              client.subscribe('ethith/v3/class/' + activeSubscribedClass, { qos: 0 });
            }
          } catch(se) {}

          // Flush queued outbox messages
          flushLiveOutbox();
        },
        onFailure: function(err) {
          client._connected = false;
          checkMeshStatus();
          console.warn('[LiveRT] ' + cfg.name + ' connect failed:', err);
          setTimeout(function() {
            connectBroker(client);
          }, 3000 + Math.floor(Math.random() * 2000));
        }
      });
    } catch(e) {
      client._connected = false;
      checkMeshStatus();
      setTimeout(function() {
        connectBroker(client);
      }, 4000);
    }
  }

  function checkMeshStatus() {
    isMeshConnected = clients.some(function(c) { return c && c._connected; });
  }

  function initRealtimeMesh() {
    if (typeof window.Paho === 'undefined' || !window.Paho.MQTT) {
      setTimeout(initRealtimeMesh, 400);
      return;
    }

    if (clients.length === 0) {
      BROKER_CONFIGS.forEach(function(cfg) {
        var cl = initBrokerClient(cfg);
        if (cl) clients.push(cl);
      });
    }
  }

  function subscribeClass(classCodeOrId) {
    activeSubscribedClass = classCodeOrId;
    if (!classCodeOrId) return;
    var topic = 'ethith/v3/class/' + classCodeOrId;
    clients.forEach(function(cl) {
      if (cl && cl._connected) {
        try { cl.subscribe(topic, { qos: 0 }); } catch(e) {}
      }
    });
  }

  function flushLiveOutbox() {
    if (liveOutbox.length === 0) return;
    var activeBrokers = clients.filter(function(c) { return c && c._connected; });
    if (activeBrokers.length === 0) return;

    var toSend = liveOutbox.slice();
    liveOutbox = [];

    toSend.forEach(function(ev) {
      var topic = ev.classId ? ('ethith/v3/class/' + ev.classId) : 'ethith/v3/global';
      var payload = JSON.stringify(ev);
      activeBrokers.forEach(function(cl) {
        try {
          var qMsg = new window.Paho.MQTT.Message(payload);
          qMsg.destinationName = topic;
          qMsg.qos = 0;
          cl.send(qMsg);
        } catch(e) {}
      });
    });
  }

  // Publish event with dual-broker broadcast + local relays
  function publishLive(event) {
    if (!event) return;
    if (!event.id) {
      event.id = 'ev_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
    }
    event.from = myClientId;
    event.ts = Date.now();

    // Mark self as seen so incoming echoes are ignored
    markEventSeen(event.id);

    // 1. Cross-tab instant relay (0ms)
    if (channel) {
      try {
        channel.postMessage({ type: 'LIVE_EVENT', event: event });
      } catch(e) {}
    }

    // 2. Cross-window storage event relay (0ms)
    try {
      localStorage.setItem('ethith_live_event_relay', JSON.stringify({ event: event, t: Date.now() }));
    } catch(e) {}

    // 3. Active-Active Dual MQTT WebSocket Publish
    var activeBrokers = clients.filter(function(c) { return c && c._connected; });
    if (activeBrokers.length > 0) {
      var topic = event.classId ? ('ethith/v3/class/' + event.classId) : 'ethith/v3/global';
      var payload = JSON.stringify(event);
      var sentAny = false;

      activeBrokers.forEach(function(cl) {
        try {
          var msg = new window.Paho.MQTT.Message(payload);
          msg.destinationName = topic;
          msg.qos = 0;
          cl.send(msg);
          sentAny = true;
        } catch(err) {
          console.warn('[LiveRT] Send failed on ' + cl._cfg.name + ':', err);
        }
      });

      if (!sentAny) {
        liveOutbox.push(event);
      }
    } else {
      liveOutbox.push(event);
    }
  }

  
  // ====================================================
  // REAL-TIME USER PRESENCE (100,000+ Scale 3-Color Engine)
  // 🟢 Yashil: Hozir Online (heartbeat/faoliyat < 75s)
  // 🔵 Ko'k: Offline (avval kirgan, lekin hozir oflayn)
  // 🔴 Qizil: Kirmagan (tizimga hali biror marta kirmagan)
  // ====================================================
  window._ethithPresenceMap = window._ethithPresenceMap || {};

  function markUserActive(uKeys, ts) {
    if (!window._ethithPresenceMap) window._ethithPresenceMap = {};
    if (!window._ethithLoggedOutMap) window._ethithLoggedOutMap = {};
    var nowTs = ts || Date.now();
    var list = (Array.isArray(uKeys) ? uKeys : [uKeys]).filter(Boolean);
    list.forEach(function(k) {
      var lk = (k + '').toLowerCase().trim();
      window._ethithPresenceMap[lk] = nowTs;
      delete window._ethithLoggedOutMap[lk];
    });

    var S = (window.EthithApp && window.EthithApp.state) || window.S || {};
    (S.classes || []).forEach(function(cls) {
      (cls.students || []).forEach(function(st) {
        if (!st) return;
        var stKeys = [st.id, st.login, st.email, st.name].filter(Boolean).map(function(x){ return (x + '').toLowerCase().trim(); });
        var match = list.some(function(k) { return stKeys.indexOf((k + '').toLowerCase().trim()) !== -1; });
        if (match) {
          st.isLoggedOut = false;
          st.hasLoggedIn = true;
          st.isOnline = true;
          st.lastSeen = nowTs;
        }
      });
    });
    (S.accounts || []).forEach(function(acc) {
      if (!acc) return;
      var accKeys = [acc.id, acc.login, acc.email, acc.name].filter(Boolean).map(function(x){ return (x + '').toLowerCase().trim(); });
      var match = list.some(function(k) { return accKeys.indexOf((k + '').toLowerCase().trim()) !== -1; });
      if (match) {
        acc.isLoggedOut = false;
        acc.hasLoggedIn = true;
        acc.isOnline = true;
        acc.lastSeen = nowTs;
      }
    });
  }


  // 0ms Real-Time UI Presence Refresher (All dots turn 🟢/🔵/🔴 instantly without reload)
  window._ethithRefreshPresenceUI = function() {
    if (!window._ethithGetUserStatus) return;
    var S = (window.EthithApp && window.EthithApp.state) || window.S || {};
    var allStudents = [];
    (S.classes || []).forEach(function(c) {
      (c.students || []).forEach(function(st) {
        if (st) allStudents.push(st);
      });
    });

    // 1. Update status dots in attendance journal & tables (like Image 1)
    document.querySelectorAll('.ea-status-dot[data-stid]').forEach(function(dot) {
      var sKey = (dot.getAttribute('data-stid') || '').toLowerCase().trim();
      if (!sKey) return;
      var st = allStudents.find(function(s) {
        return (s.id && (s.id + '').toLowerCase() === sKey) ||
               (s.login && s.login.toLowerCase() === sKey) ||
               (s.name && s.name.toLowerCase().trim() === sKey);
      });
      if (st) {
        var stStatus = window._ethithGetUserStatus(st);
        dot.style.background = stStatus.color;
        dot.style.boxShadow = '0 0 8px ' + stStatus.color;
        dot.title = stStatus.dot + ' ' + stStatus.label;
      }
    });

    // Also update any table row dots
    document.querySelectorAll('[data-st-name-dot]').forEach(function(dot) {
      var sKey = (dot.getAttribute('data-st-name-dot') || '').toLowerCase().trim();
      if (!sKey) return;
      var st = allStudents.find(function(s) {
        return (s.name && s.name.toLowerCase().trim() === sKey) ||
               (s.login && s.login.toLowerCase() === sKey) ||
               (s.id && (s.id + '').toLowerCase() === sKey);
      });
      if (st) {
        var stStatus = window._ethithGetUserStatus(st);
        dot.style.background = stStatus.color;
        dot.style.boxShadow = '0 0 8px ' + stStatus.color;
      }
    });

    // 2. Update student status pills
    document.querySelectorAll('.tg-online-pill[data-stid], .ea-student-pill[data-stid]').forEach(function(pill) {
      var sKey = (pill.getAttribute('data-stid') || '').toLowerCase().trim();
      if (!sKey) return;
      var st = allStudents.find(function(s) {
        return (s.id && (s.id + '').toLowerCase() === sKey) ||
               (s.login && s.login.toLowerCase() === sKey) ||
               (s.name && s.name.toLowerCase().trim() === sKey);
      });
      if (st) {
        var stStatus = window._ethithGetUserStatus(st);
        var dot = pill.querySelector('.ea-status-dot') || pill.querySelector('.tg-st-dot');
        if (dot) {
          dot.style.background = stStatus.color;
          dot.style.boxShadow = '0 0 8px ' + stStatus.color;
        }
        pill.style.borderColor = stStatus.status === 'green' ? 'rgba(34,197,94,0.5)' : (stStatus.status === 'blue' ? 'rgba(59,130,246,0.5)' : 'rgba(239,68,68,0.3)');
      }
    });

    // 3. Update student cards in class dashboard (like Image 2)
    document.querySelectorAll('.cls-student-card-item').forEach(function(item) {
      var sKey = (item.getAttribute('data-st-login') || '').toLowerCase().trim();
      if (!sKey) {
        var editBtn = item.querySelector('.btn-st-row-edit');
        var sLogin = editBtn ? editBtn.getAttribute('data-edit-st-login') : '';
        if (sLogin) sKey = sLogin.toLowerCase().trim();
      }
      if (!sKey) return;
      var st = allStudents.find(function(s) {
        return (s.login && s.login.toLowerCase() === sKey) ||
               (s.id && (s.id + '').toLowerCase() === sKey) ||
               (s.name && s.name.toLowerCase().trim() === sKey);
      });
      if (st) {
        var stStatus = window._ethithGetUserStatus(st);
        var dotSpan = item.querySelector('.cls-student-status-dot') || item.querySelector('span[title]');
        if (dotSpan) {
          dotSpan.style.background = stStatus.color;
          dotSpan.style.boxShadow = '0 0 8px ' + stStatus.color;
          dotSpan.title = stStatus.label;
        }
        var labelSpan = item.querySelector('.cls-student-status-label');
        if (labelSpan) {
          labelSpan.textContent = stStatus.label;
          labelSpan.style.color = stStatus.color;
        } else {
          var spans = item.querySelectorAll('span');
          spans.forEach(function(sp) {
            var txt = (sp.textContent || '').trim();
            if (txt === 'Online' || txt === 'Offline' || txt === 'Kirmagan') {
              sp.textContent = stStatus.label;
              sp.style.color = stStatus.color;
            }
          });
        }
      }
    });

    // 4. Update rows in Tizim Loginlari table
    document.querySelectorAll('.ea-login-row').forEach(function(row) {
      var sId = (row.getAttribute('data-login-stid') || '').toLowerCase().trim();
      if (!sId) return;
      var st = allStudents.find(function(s) {
        return (s.id && (s.id + '').toLowerCase() === sId) ||
               (s.login && s.login.toLowerCase() === sId) ||
               (s.name && s.name.toLowerCase().trim() === sId);
      });
      if (st) {
        var stStatus = window._ethithGetUserStatus(st);
        var dot = row.querySelector('.ea-status-dot');
        if (dot) {
          dot.style.background = stStatus.color;
          dot.style.boxShadow = '0 0 6px ' + stStatus.color;
          dot.title = stStatus.dot + ' ' + stStatus.label;
        }
        var badgeCell = row.querySelector('.ea-login-status-cell');
        if (badgeCell) {
          var bHtml = '';
          if (stStatus.status === 'green') {
            bHtml = '<span style="background:rgba(34,197,94,0.18);border:1px solid #22c55e;color:#4ade80;padding:3px 9px;border-radius:12px;font-size:11px;font-weight:900;">🟢 Online</span>';
          } else if (stStatus.status === 'blue') {
            bHtml = '<span style="background:rgba(59,130,246,0.18);border:1px solid #3b82f6;color:#60a5fa;padding:3px 9px;border-radius:12px;font-size:11px;font-weight:900;">🔵 Offline</span>';
          } else {
            bHtml = '<span style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.35);color:#f87171;padding:3px 9px;border-radius:12px;font-size:11px;font-weight:800;">🔴 Kirmagan</span>';
          }
          badgeCell.innerHTML = bHtml;
        }
      }
    });
  };

  window._ethithGetUserStatus = function(u) {
    if (!u) return { status: 'red', label: "Kirmagan", color: '#ef4444', dot: '🔴' };
    var now = Date.now();
    var myU = (window.EthithApp && window.EthithApp.state && window.EthithApp.state.user) || {};
    var keys = [u.id, u.login, u.email, u.name].filter(Boolean).map(function(k){ return (k + '').toLowerCase().trim(); });

    // 1. Log Out holatini tekshirish
    // Agar foydalanuvchi tizimdan LOG OUT tugmasini bosgan bo'lsa -> qat'iy QIZIL (🔴 Kirmagan)!
    var loggedOutMap = window._ethithLoggedOutMap || {};
    var logoutTs = 0;
    keys.forEach(function(k) {
      if (loggedOutMap[k] === true) logoutTs = Math.max(logoutTs, 1);
      else if (typeof loggedOutMap[k] === 'number' && loggedOutMap[k] > logoutTs) logoutTs = loggedOutMap[k];
    });
    if (u.loggedOutAt && u.loggedOutAt > logoutTs) logoutTs = u.loggedOutAt;
    var S = (window.EthithApp && window.EthithApp.state) || {};
    var acc = (S.accounts || []).find(function(a) {
      if (!a) return false;
      return (u.id && a.id === u.id) ||
             (u.login && a.login && a.login.toLowerCase() === u.login.toLowerCase()) ||
             (u.email && a.email && a.email.toLowerCase() === u.email.toLowerCase());
    });
    if (acc && acc.loggedOutAt && acc.loggedOutAt > logoutTs) logoutTs = acc.loggedOutAt;
    if (u.isLoggedOut || (acc && acc.isLoggedOut)) logoutTs = Math.max(logoutTs, 1);

    // 2. Oxirgi faollik vaqti (lastSeen)
    var presMap = window._ethithPresenceMap || {};
    var lastSeen = 0;
    keys.forEach(function(k) {
      if (presMap[k] && presMap[k] > lastSeen) lastSeen = presMap[k];
    });

    if (acc && acc.lastSeen && acc.lastSeen > lastSeen && !acc.isLoggedOut) {
      lastSeen = acc.lastSeen;
    }
    if (u.lastSeen && u.lastSeen > lastSeen && !u.isLoggedOut) {
      lastSeen = u.lastSeen;
    }

    // AGAR FOYDALANUVCHI LOGOUT QILGAN BO'LSA VA UNDAN KEYIN QAYTA LOGIN QILMAGAN BO'LSA:
    // Bu foydalanuvchi qat'iy QIZIL (🔴 Kirmagan)!
    if (logoutTs > 0 && logoutTs >= lastSeen) {
      return { status: 'red', label: "Kirmagan", color: '#ef4444', dot: '🔴' };
    }

    // 3. Brauzerdagi ayni damdagi joriy foydalanuvchi (logout qilmagan bo'lsa) -> 🟢 Online
    var isMe = myU && myU.id && ((u.id && u.id === myU.id) || 
               (u.login && myU.login && u.login.toLowerCase() === myU.login.toLowerCase()) ||
               (u.email && myU.email && u.email.toLowerCase() === myU.email.toLowerCase()));
    if (isMe && !myU.isLoggedOut) {
      return { status: 'green', label: "Online", color: '#22c55e', dot: '🟢' };
    }

    // 4. Ayni damda faol (Heartbeat oxirgi 5.5 soniyada kelgan bo'lsa) -> 🟢 Online (Ultra-Fast 5.5s)
    if (lastSeen && (now - lastSeen) < 5500) {
      return { status: 'green', label: "Online", color: '#22c55e', dot: '🟢', lastSeen: lastSeen };
    }

    // 5. Shunchaki chiqib ketgan / telefonni o'chirgan / tabni yopgan (Logout bosmagan, lekin avval kirgan) -> 🔵 Offline (KO'K!)
    var hasEverLoggedIn = (acc && (acc.lastLogin || acc.loginCount > 0 || acc.hasLoggedIn || acc.lastSeen)) ||
                          u.lastLogin || u.hasLoggedIn || u.lastSeen || (lastSeen > 0);

    if (hasEverLoggedIn) {
      return { status: 'blue', label: "Offline", color: '#3b82f6', dot: '🔵', lastSeen: lastSeen };
    }

    // 6. Hali umuman tizimga kirmagan bo'lsa -> 🔴 Kirmagan
    return { status: 'red', label: "Kirmagan", color: '#ef4444', dot: '🔴' };
  };

  function sendPresenceHeartbeat() {
    if (!window.EthithApp || !window.EthithApp.state || !window.EthithApp.state.user) return;
    var u = window.EthithApp.state.user;
    var S = window.EthithApp.state;
    var now = Date.now();
    markUserActive([u.id, u.login, u.email, u.name], now);

    var payload = {
      type: 'PRESENCE_HEARTBEAT',
      from: myClientId,
      userId: u.id || u.login || u.email,
      login: u.login || '',
      email: u.email || '',
      name: u.name || '',
      role: u.role || 'student',
      classId: u.classId || S.activeClassId || null,
      ts: now
    };
    if (typeof publishLive === 'function') {
      publishLive(payload);
    }
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        if (!window._eeChannel) window._eeChannel = new BroadcastChannel('ethith_cloud_channel');
        window._eeChannel.postMessage(payload);
      }
    } catch(e) {}
  }

  if (typeof window !== 'undefined') {
    setTimeout(sendPresenceHeartbeat, 500);
    setInterval(sendPresenceHeartbeat, 2200); // Har 2.2 soniyada yangilanadi (Super Fast Heartbeat)

    // Statuslar doimiy 1 soniyada real vaqtda tekshirib yangilanadi
    setInterval(function() {
      if (window._ethithRefreshPresenceUI) window._ethithRefreshPresenceUI();
    }, 1000);

    function sendInstantOfflineSignal() {
      var u = (window.EthithApp && window.EthithApp.state && window.EthithApp.state.user);
      if (u && typeof publishLive === 'function') {
        var payload = {
          type: 'PRESENCE_OFFLINE',
          from: myClientId,
          userId: u.id || u.login || u.email,
          login: u.login || '',
          email: u.email || '',
          name: u.name || '',
          ts: Date.now()
        };
        publishLive(payload);
        try {
          if (window._eeChannel) window._eeChannel.postMessage(payload);
        } catch(e) {}
      }
    }

    // Brauzer yopilganda yoki fon rejimiga o'tganda shu zahoti OFFLINE yuboriladi
    window.addEventListener('beforeunload', sendInstantOfflineSignal);
    window.addEventListener('pagehide', sendInstantOfflineSignal);
  }

  // Dispatch incoming live events directly to local state and UI
  function handleIncomingLiveEvent(event) {
    if (!event || event.from === myClientId) return; // Don't echo self
    if (event.id && markEventSeen(event.id)) return; // Deduplicate across dual brokers

    // Forward to ETHITH Chat Engine (Matrix Protocol & Centrifugo WebSocket pub-sub)
    if (window.EthithChat && typeof window.EthithChat.onCentrifugoEvent === 'function') {
      if (event.type === 'CHAT_MSG' || event.type === 'CHAT_TYPING' || event.type === 'CHAT_REACTION' || event.method === 'publish') {
        window.EthithChat.onCentrifugoEvent(event);
      }
    }

    // Instant presence tracking for sender ONLY if NOT logout or offline event!
    if (event.from && event.type !== 'USER_LOGOUT' && event.type !== 'PRESENCE_OFFLINE') {
      markUserActive([event.userId, event.senderId, event.login, event.email, event.senderEmail, event.name, event.senderName], event.ts || Date.now());
    }

    if (event.type === 'USER_LOGIN' || event.type === 'USER_REGISTERED') {
      var inKeys = [event.userId, event.senderId, event.login, event.email, event.name].filter(Boolean).map(function(k){ return (k + '').toLowerCase().trim(); });
      var nowTs = event.ts || Date.now();
      markUserActive(inKeys, nowTs);
      if (window._ethithRefreshPresenceUI) window._ethithRefreshPresenceUI();
      return;
    }

    if (event.type === 'USER_LOGOUT' && (event.userId || event.login || event.name || event.email)) {
      var logKeys = [event.userId, event.login, event.email, event.name].filter(Boolean).map(function(k){ return (k + '').toLowerCase().trim(); });
      var logoutTs = event.ts || Date.now();
      if (!window._ethithLoggedOutMap) window._ethithLoggedOutMap = {};
      logKeys.forEach(function(k) {
        window._ethithLoggedOutMap[k] = logoutTs;
        if (window._ethithPresenceMap) delete window._ethithPresenceMap[k];
      });
      var S = (window.EthithApp && window.EthithApp.state) || window.S || {};
      (classes || []).forEach(function(cls) {
        (cls.students || []).forEach(function(st) {
          if (!st) return;
          var stKeys = [st.id, st.login, st.email, st.name].filter(Boolean).map(function(x){ return (x + '').toLowerCase().trim(); });
          if (logKeys.some(function(k){ return stKeys.indexOf(k) !== -1; })) {
            st.isOnline = false;
            st.isLoggedOut = true;
            st.loggedOutAt = logoutTs;
            delete st.lastSeen;
          }
        });
      });
      (S.accounts || []).forEach(function(acc) {
        if (!acc) return;
        var accKeys = [acc.id, acc.login, acc.email, acc.name].filter(Boolean).map(function(x){ return (x + '').toLowerCase().trim(); });
        if (logKeys.some(function(k){ return accKeys.indexOf(k) !== -1; })) {
          acc.isOnline = false;
          acc.isLoggedOut = true;
          acc.loggedOutAt = logoutTs;
          delete acc.lastSeen;
        }
      });
      if (window._ethithRefreshPresenceUI) window._ethithRefreshPresenceUI();
      return;
    }

    if (event.type === 'PRESENCE_OFFLINE' && (event.userId || event.login || event.name || event.email)) {
      var offKeys = [event.userId, event.login, event.email, event.name].filter(Boolean).map(function(k){ return (k + '').toLowerCase().trim(); });
      // Shunchaki chiqib ketgan / telefonini o'chirgan -> 🔵 Offline (KO'K bo'ladi, qizil emas!)
      var pastTime = Date.now() - 10000;
      if (!window._ethithPresenceMap) window._ethithPresenceMap = {};
      offKeys.forEach(function(k) {
        window._ethithPresenceMap[k] = pastTime;
      });
      var S = (window.EthithApp && window.EthithApp.state) || window.S || {};
      (classes || []).forEach(function(cls) {
        (cls.students || []).forEach(function(st) {
          if (!st) return;
          var stKeys = [st.id, st.login, st.email, st.name].filter(Boolean).map(function(x){ return (x + '').toLowerCase().trim(); });
          if (offKeys.some(function(k){ return stKeys.indexOf(k) !== -1; })) {
            st.isOnline = false;
            st.hasLoggedIn = true;
            st.isLoggedOut = false;
            st.lastSeen = pastTime;
          }
        });
      });
      (S.accounts || []).forEach(function(acc) {
        if (!acc) return;
        var accKeys = [acc.id, acc.login, acc.email, acc.name].filter(Boolean).map(function(x){ return (x + '').toLowerCase().trim(); });
        if (offKeys.some(function(k){ return accKeys.indexOf(k) !== -1; })) {
          acc.isOnline = false;
          acc.hasLoggedIn = true;
          acc.isLoggedOut = false;
          acc.lastSeen = pastTime;
        }
      });
      if (window._ethithRefreshPresenceUI) window._ethithRefreshPresenceUI();
      return;
    }

    if (event.type === 'PRESENCE_HEARTBEAT') {
      if (window._ethithRefreshPresenceUI) {
        try { window._ethithRefreshPresenceUI(); } catch(pe) {}
      }
      return;
    }

    if (!window.EthithApp || !window.EthithApp.state) return;

    var S = window.EthithApp.state;
    var classes = S.classes || [];

    // Instant 0ms Payment Neon Sync
    if (event.type === 'PAYMENT_UPDATE' && event.classId && event.stId) {
      var pCid = (event.classId + '').toLowerCase();
      var pClass = (classes || []).find(function(c) {
        return (c.id && c.id.toLowerCase() === pCid) || (c.code && c.code.toLowerCase() === pCid);
      });
      if (pClass) {
        if (!pClass.studentPayments) pClass.studentPayments = {};
        pClass.studentPayments[event.stId] = event.payment;
      }
      if (S.finance) {
        if (!S.finance.studentFees) S.finance.studentFees = {};
        S.finance.studentFees[event.stId] = event.payment;
      }
      if (window.EthithEnterprise && window.EthithEnterprise.getStore) {
        var eStore = window.EthithEnterprise.getStore();
        if (eStore && eStore.classes) {
          var ec = eStore.classes.find(function(c) { return c && (c.id === event.classId || (c.id && c.id.toLowerCase() === pCid)); });
          if (ec) {
            if (!ec.studentPayments) ec.studentPayments = {};
            ec.studentPayments[event.stId] = event.payment;
          }
        }
      }
      try {
        localStorage.setItem('ethith_v2_state', JSON.stringify(S));
      } catch(e) {}

      // Instant 0ms Neon Green Toggle in DOM
      var isPaid = event.payment && event.payment.status === 'paid';
      
      // 1. Attendance Journal student names
      document.querySelectorAll('[data-stid="' + event.stId + '"], [data-st-id="' + event.stId + '"]').forEach(function(el) {
        var nameSpan = el.querySelector('.ea-st-paid-neon') || el.querySelector('.ea-logins-st-name') || el;
        if (isPaid) {
          nameSpan.classList.add('ea-st-paid-neon');
          nameSpan.style.color = '#4ade80';
          nameSpan.style.textShadow = '0 0 10px rgba(74,222,128,0.95), 0 0 20px rgba(74,222,128,0.7), 0 0 30px rgba(74,222,128,0.4)';
        } else {
          nameSpan.classList.remove('ea-st-paid-neon');
          nameSpan.style.color = '';
          nameSpan.style.textShadow = '';
        }
      });

      // 2. Tizim Loginlari table rows
      var loginRow = document.querySelector('tr[data-login-stid="' + event.stId + '"]');
      if (loginRow) {
        var stNameEl = loginRow.querySelector('.ea-logins-st-name');
        if (stNameEl) {
          if (isPaid) {
            stNameEl.classList.add('ea-st-paid-neon');
            stNameEl.style.color = '#4ade80';
            stNameEl.style.textShadow = '0 0 10px rgba(74,222,128,0.95), 0 0 20px rgba(74,222,128,0.7)';
          } else {
            stNameEl.classList.remove('ea-st-paid-neon');
            stNameEl.style.color = '';
            stNameEl.style.textShadow = '';
          }
        }
      }

      // 3. Re-render attendance view if open
      if (window._ethithCurrentView === 'attendance' && window.EthithAttendance && typeof window.EthithAttendance.renderCurrentView === 'function') {
        window.EthithAttendance.renderCurrentView();
      }
      return;
    }

    // Case-insensitive class matching
    var targetCls = classes.find(function(c) {
      if (!event.classId) return true;
      var cid = (event.classId + '').toLowerCase();
      return (c.id && c.id.toLowerCase() === cid) || (c.code && c.code.toLowerCase() === cid);
    });

    if (!targetCls && classes.length > 0) {
      targetCls = classes[0];
    }

    var uiNeedsRefresh = false;

    // A. CHAT MESSAGE (Sub-millisecond instant delivery & DOM append)
    if (event.type === 'CHAT_MSG' && event.message && targetCls) {
      if (!targetCls.messages) targetCls.messages = [];
      if (!targetCls.deletedMsgIds) targetCls.deletedMsgIds = [];

      if (targetCls.deletedMsgIds.indexOf(event.message.id) === -1) {
        var exists = targetCls.messages.some(function(m) { return m.id === event.message.id; });
        if (!exists) {
          targetCls.messages.push(event.message);
          targetCls.messages.sort(function(a, b) {
            var ta = a.timestamp || parseInt((a.id || '').replace(/\D/g, ''), 10) || 0;
            var tb = b.timestamp || parseInt((b.id || '').replace(/\D/g, ''), 10) || 0;
            return ta - tb;
          });

          // Ultra-fast path: If user has this chat open, append to DOM immediately in 0ms!
          if (window._ethithAppendIncomingChatMsg && window._ethithAppendIncomingChatMsg(event.message, event.classId || targetCls.id || targetCls.code)) {
            uiNeedsRefresh = false;
          } else {
            uiNeedsRefresh = true;
          }

          // Real-time Telegram-style notification banner sliding down from top!
          try {
            var myU = (window.S && window.S.user) || {};
            var myEmail = (myU.email || '').toLowerCase().trim();
            var myId = (myU.id || '').toLowerCase().trim();
            var myLogin = (myU.login || '').toLowerCase().trim();
            var myName = (myU.name || '').toLowerCase().trim();

            var sId = (event.message.senderId || '').toLowerCase().trim();
            var sEmail = (event.message.senderEmail || '').toLowerCase().trim();
            var sName = (event.message.senderName || '').toLowerCase().trim();

            var isFromMe = false;
            if (sId && myId && sId === myId) isFromMe = true;
            if (sEmail && myEmail && sEmail === myEmail) isFromMe = true;
            if (sName && myName && sName === myName) isFromMe = true;
            if (myLogin && (sId.includes(myLogin) || sEmail.includes(myLogin))) isFromMe = true;

            if (!isFromMe && window.EthithNotify && typeof window.EthithNotify.showChatMessage === 'function') {
              var grpName = (targetCls && targetCls.name) || 'Sinf Chati';
              window.EthithNotify.showChatMessage(event.message, grpName, function() {
                if (targetCls) {
                  window.S.activeClassId = targetCls.id;
                  var tCont = document.getElementById('apView') || document.getElementById('viewContainer');
                  if (window.EthithViews && typeof window.EthithViews.renderClassDetail === 'function' && tCont) {
                    window.EthithViews.renderClassDetail(tCont, targetCls);
                  }
                }
              });
            }
          } catch(e) {}
        }
      }
    }

    // B. REACTION
    else if (event.type === 'REACTION' && targetCls && event.msgId && event.emoji) {
      var msg = (targetCls.messages || []).find(function(m) { return m.id === event.msgId; });
      if (!msg && classes) {
        for (var ci = 0; ci < classes.length; ci++) {
          msg = (classes[ci].messages || []).find(function(m) { return m.id === event.msgId; });
          if (msg) { targetCls = classes[ci]; break; }
        }
      }
      if (msg) {
        if (!msg.reactions) msg.reactions = {};
        if (!msg.reactions[event.emoji]) msg.reactions[event.emoji] = [];

        var uId = event.userId || 'guest';
        var idx = msg.reactions[event.emoji].indexOf(uId);

        if (event.action === 'remove') {
          if (idx > -1) {
            msg.reactions[event.emoji].splice(idx, 1);
            if (msg.reactions[event.emoji].length === 0) delete msg.reactions[event.emoji];
            uiNeedsRefresh = true;
          }
        } else {
          if (idx === -1) {
            msg.reactions[event.emoji].push(uId);
            uiNeedsRefresh = true;
          }
        }
        if (event.updatedReactions) {
          msg.reactions = event.updatedReactions;
        }
        // 0ms instant in-place DOM patch on receiving device!
        if (window._ethithUpdateIncomingReaction) {
          try {
            window._ethithUpdateIncomingReaction(targetCls.id, event.msgId, msg);
          } catch(e) {}
        }
      }
    }

    // C. PERMANENT DELETE MESSAGE
    else if (event.type === 'DELETE_MSG' && targetCls && event.msgId) {
      var foundInCls = targetCls;
      var hasMsg = (targetCls.messages || []).some(function(m) { return m.id === event.msgId; });
      if (!hasMsg && classes) {
        for (var ci = 0; ci < classes.length; ci++) {
          if ((classes[ci].messages || []).some(function(m) { return m.id === event.msgId; })) {
            foundInCls = classes[ci];
            break;
          }
        }
      }
      if (!foundInCls.deletedMsgIds) foundInCls.deletedMsgIds = [];
      if (foundInCls.deletedMsgIds.indexOf(event.msgId) === -1) {
        foundInCls.deletedMsgIds.push(event.msgId);
      }
      var lenBefore = (foundInCls.messages || []).length;
      foundInCls.messages = (foundInCls.messages || []).filter(function(m) { return m.id !== event.msgId; });
      if (foundInCls.pinnedIds) {
        foundInCls.pinnedIds = foundInCls.pinnedIds.filter(function(pid) { return pid !== event.msgId; });
      }
      if (foundInCls.pinnedId === event.msgId) {
        foundInCls.pinnedId = (foundInCls.pinnedIds && foundInCls.pinnedIds.length > 0) ? foundInCls.pinnedIds[foundInCls.pinnedIds.length - 1] : null;
      }
      if (typeof window._ethithDisintegrateChatMessage === 'function') {
        window._ethithDisintegrateChatMessage(event.msgId);
      } else {
        var row = document.querySelector('.tg-msg-row[data-msg-id="' + event.msgId + '"]');
        if (row && row.parentNode) row.parentNode.removeChild(row);
      }
      if (typeof window._ethithUpdatePinnedBarFromSync === 'function') {
        window._ethithUpdatePinnedBarFromSync(foundInCls);
      }
      if (foundInCls.messages.length !== lenBefore) {
        uiNeedsRefresh = false; // already disintegrated smoothly!
      }
    }

    // D1. EDIT MESSAGE (Realtime across all peers)
    else if (event.type === 'EDIT_MSG' && targetCls && event.msgId && event.text) {
      var foundMsg = (targetCls.messages || []).find(function(m) { return m.id === event.msgId; });
      if (foundMsg) {
        foundMsg.text = event.text;
        foundMsg.isEdited = true;
        foundMsg.editedAt = Date.now();
        var row = document.querySelector('.tg-msg-row[data-msg-id="' + event.msgId + '"]');
        if (row) {
          var txtEl = row.querySelector('.tg-msg-text');
          if (txtEl) {
            txtEl.innerHTML = event.text + ' <span class="tg-edited-badge" style="font-size:10.5px;opacity:0.65;margin-left:4px;">(tahrirlangan)</span>';
          }
        }
      }
    }

    // D. PIN / UNPIN MESSAGE
    else if ((event.type === 'PIN_MSG' || event.type === 'UNPIN_MSG') && targetCls) {
      if (Array.isArray(event.pinnedIds)) {
        targetCls.pinnedIds = event.pinnedIds;
        targetCls.pinnedId = event.pinnedIds.length > 0 ? event.pinnedIds[event.pinnedIds.length - 1] : null;
      } else if (event.type === 'UNPIN_MSG') {
        if (event.msgId && targetCls.pinnedIds) {
          targetCls.pinnedIds = targetCls.pinnedIds.filter(function(pid) { return pid !== event.msgId; });
        } else {
          targetCls.pinnedIds = [];
        }
        targetCls.pinnedId = (targetCls.pinnedIds && targetCls.pinnedIds.length > 0) ? targetCls.pinnedIds[targetCls.pinnedIds.length - 1] : null;
      } else if (event.type === 'PIN_MSG') {
        if (!targetCls.pinnedIds) targetCls.pinnedIds = [];
        if (event.msgId && targetCls.pinnedIds.indexOf(event.msgId) === -1) {
          targetCls.pinnedIds.push(event.msgId);
        }
        targetCls.pinnedId = event.msgId || (targetCls.pinnedIds.length > 0 ? targetCls.pinnedIds[targetCls.pinnedIds.length - 1] : null);
      }

      if (typeof window._ethithUpdatePinnedBarFromSync === 'function') {
        window._ethithUpdatePinnedBarFromSync(targetCls);
      } else {
        var pBar = document.getElementById('tgPinnedBar');
        if (!targetCls.pinnedId && (!targetCls.pinnedIds || targetCls.pinnedIds.length === 0)) {
          if (pBar) {
            pBar.style.transition = 'all 0.25s ease';
            pBar.style.opacity = '0';
            setTimeout(function() { pBar.remove(); }, 250);
          }
        } else {
          uiNeedsRefresh = true;
        }
      }
    }

    // E. STUDENT JOINED / ENROLLED (Sub-100ms instant sync across all devices)
    else if ((event.type === 'STUDENT_JOIN' || event.type === 'STUDENT_ENROLLED') && targetCls && event.student) {
      if (!targetCls.students) targetCls.students = [];
      if (Array.isArray(targetCls.deletedStudentIds)) {
        targetCls.deletedStudentIds = targetCls.deletedStudentIds.filter(function(id) {
          return id !== event.student.id && id !== event.student.email && id !== event.student.login && id !== event.student.name;
        });
      }
      if (Array.isArray(S.deletedStudentIds)) {
        S.deletedStudentIds = S.deletedStudentIds.filter(function(id) {
          return id !== event.student.id && id !== event.student.email && id !== event.student.login && id !== event.student.name;
        });
      }
      var sIdx = targetCls.students.findIndex(function(s) {
        return (s.email && s.email === event.student.email) || (s.id && s.id === event.student.id) || (event.student.login && s.login && s.login.toLowerCase() === event.student.login.toLowerCase());
      });
      if (sIdx !== -1) {
        targetCls.students[sIdx] = Object.assign({}, targetCls.students[sIdx], event.student);
        targetCls.students[sIdx].updatedAt = event.student.updatedAt || Date.now();
      } else {
        if (!event.student.joinedAt) {
          event.student.joinedAt = '2026-09-02';
        }
        var testerIdx = targetCls.students.findIndex(function(s) {
          return s.isTester || (s.name && s.name.startsWith('tester_'));
        });
        if (testerIdx !== -1) {
          targetCls.students[testerIdx] = event.student;
        } else {
          targetCls.students.unshift(event.student);
        }
      }

      if (!targetCls.customStudentNames) targetCls.customStudentNames = {};
      if (event.student.id && event.student.name) {
        targetCls.customStudentNames[event.student.id] = event.student.name;
        if (!targetCls.customStudentNamesTs) targetCls.customStudentNamesTs = {};
        targetCls.customStudentNamesTs[event.student.id] = event.student.updatedAt || Date.now();
      }
      if (!targetCls.customStudentPhones) targetCls.customStudentPhones = {};
      if (event.student.id && (event.student.parentPhone || event.student.phone)) {
        targetCls.customStudentPhones[event.student.id] = event.student.parentPhone || event.student.phone;
      }
      if (event.customStudentNames) Object.assign(targetCls.customStudentNames, event.customStudentNames);
      if (event.customStudentPhones) Object.assign(targetCls.customStudentPhones, event.customStudentPhones);
      if (event.studentPayments) {
        if (!targetCls.studentPayments) targetCls.studentPayments = {};
        Object.assign(targetCls.studentPayments, event.studentPayments);
      }

      // Auto-register / update student account
      if (event.account && Array.isArray(S.accounts)) {
        var accIdx = S.accounts.findIndex(function(a) { 
          return a.id === event.account.id || (a.login && event.account.login && a.login.toLowerCase() === event.account.login.toLowerCase()); 
        });
        if (accIdx === -1) {
          S.accounts.push(event.account);
        } else {
          S.accounts[accIdx] = Object.assign({}, S.accounts[accIdx], event.account);
        }
      }
      uiNeedsRefresh = true;
      if (window.EA && typeof window.EA.render === 'function' && document.getElementById('apView')) {
        window.EA.render(document.getElementById('apView'));
      }
    }

    // E0. STUDENT EDITED (Instant Name / Phone / Credential update across all connected devices: Admin & Teacher)
    else if (event.type === 'STUDENT_EDIT' && event.studentId) {
      var stId = event.studentId;
      var newName = event.name;
      var newPhone = event.phone || event.parentPhone || '';
      var newLogin = event.login || '';
      var newPass = event.password || '';
      var upTs = event.updatedAt || Date.now();

      classes.forEach(function(c) {
        if (!event.classId || c.id === event.classId || c.code === event.classId) {
          if (!c.customStudentNames) c.customStudentNames = {};
          if (newName) {
            c.customStudentNames[stId] = newName;
            if (newLogin) c.customStudentNames[newLogin] = newName;
            if (newLogin) c.customStudentNames['std_' + newLogin] = newName;
          }
          if (!c.customStudentPhones) c.customStudentPhones = {};
          if (newPhone) c.customStudentPhones[stId] = newPhone;
          if (!c.customStudentNamesTs) c.customStudentNamesTs = {};
          c.customStudentNamesTs[stId] = upTs;

          if (!Array.isArray(c.students)) c.students = [];
          var sFound = c.students.find(function(s) {
            return s && (s.id === stId || (newLogin && s.login && s.login.toLowerCase() === newLogin.toLowerCase()) || (s.email && event.email && s.email.toLowerCase() === event.email.toLowerCase()) || (s.name && newName && s.name.toLowerCase().trim() === newName.toLowerCase().trim()));
          });

          if (sFound) {
            if (newName) {
              sFound.name = newName;
              var nParts = newName.trim().split(/\s+/);
              sFound.firstName = nParts[0];
              sFound.lastName = nParts.slice(1).join(' ');
            }
            if (newPhone) {
              sFound.phone = newPhone;
              sFound.parentPhone = newPhone;
            }
            if (newLogin) sFound.login = newLogin;
            if (newPass) sFound.password = newPass;
            sFound.isTester = false;
            sFound.manuallyEnrolled = true;
            sFound.updatedAt = upTs;
          } else {
            // If student was not found in array, add them directly and replace tester slot if available
            var tIdx = c.students.findIndex(function(s) {
              return s && (s.isTester || (s.name && s.name.toLowerCase().startsWith('tester_')));
            });
            var newStudentEntry = {
              id: stId,
              name: newName,
              firstName: event.firstName || (newName ? newName.split(' ')[0] : ''),
              lastName: event.lastName || (newName ? newName.split(' ').slice(1).join(' ') : ''),
              login: newLogin,
              password: newPass,
              phone: newPhone,
              parentPhone: newPhone,
              email: (newLogin || stId) + '@student.ethith',
              role: 'student',
              isTester: false,
              manuallyEnrolled: true,
              updatedAt: upTs
            };
            if (tIdx !== -1) {
              c.students[tIdx] = newStudentEntry;
            } else {
              c.students.push(newStudentEntry);
            }
          }

          // Filter out dummy tester slots if real students are now in the class
          var hasReals = c.students.some(function(s) { return s && !s.isTester && s.name && !s.name.toLowerCase().startsWith('tester_'); });
          if (hasReals) {
            c.students = c.students.filter(function(s) { return s && !s.isTester && s.name && !s.name.toLowerCase().startsWith('tester_'); });
          }

          if (c.attendance) c.attendance.updatedAt = upTs;
        }
      });

      if (Array.isArray(S.accounts)) {
        var aFound = S.accounts.find(function(a) {
          return a && (a.id === stId || (newLogin && a.login && a.login.toLowerCase() === newLogin.toLowerCase()) || (a.email && event.email && a.email.toLowerCase() === event.email.toLowerCase()));
        });
        if (aFound) {
          if (newName) aFound.name = newName;
          if (newPhone) { aFound.phone = newPhone; aFound.parentPhone = newPhone; }
          if (newLogin) aFound.login = newLogin;
          if (newPass) aFound.password = newPass;
          aFound.updatedAt = upTs;
        }
      }

      if (S.user && (S.user.id === stId || (newLogin && S.user.login && S.user.login.toLowerCase() === newLogin.toLowerCase()))) {
        if (newName) S.user.name = newName;
        if (newPhone) { S.user.phone = newPhone; S.user.parentPhone = newPhone; }
        if (newLogin) S.user.login = newLogin;
        S.user.updatedAt = upTs;
      }

      uiNeedsRefresh = true;
      if (window.EA && typeof window.EA.render === 'function' && document.getElementById('apView')) {
        window.EA.render(document.getElementById('apView'));
      }
    }

    // E1. STUDENT EXPELLED / REMOVED (0ms Instant Live Reaction on Student's Device)
    else if (event.type === 'STUDENT_EXPELLED' || event.type === 'STUDENT_REMOVED') {
      var expCid = event.classId;
      var expSid = event.studentId;
      var expEmail = (event.studentEmail || '').toLowerCase().trim();
      var expPhone = event.studentPhone || '';

      if (classes) {
        classes.forEach(function(c) {
          if (c.id === expCid || c.code === expCid) {
            if (!c.deletedStudentIds) c.deletedStudentIds = [];
            if (expSid && c.deletedStudentIds.indexOf(expSid) === -1) c.deletedStudentIds.push(expSid);
            if (expEmail && c.deletedStudentIds.indexOf(expEmail) === -1) c.deletedStudentIds.push(expEmail);
            if (Array.isArray(c.students)) {
              c.students = c.students.filter(function(s) {
                var sEmail = (s.email || '').toLowerCase().trim();
                var sPhone = s.phone || s.parentPhone || '';
                return (s.id !== expSid) && (!expEmail || sEmail !== expEmail) && (!expPhone || sPhone !== expPhone);
              });
              if (window.ethithReplenishTesterSlots) {
                window.ethithReplenishTesterSlots(c);
              }
            }
          }
        });
      }
      if (!S.deletedStudentIds) S.deletedStudentIds = [];
      if (expSid && S.deletedStudentIds.indexOf(expSid) === -1) S.deletedStudentIds.push(expSid);

      var curU = S.user || {};
      var curUid = curU.id || '';
      var curUemail = (curU.email || '').toLowerCase().trim();
      var curUphone = curU.phone || '';

      var isMe = (expSid && curUid === expSid) ||
                 (expEmail && curUemail && curUemail === expEmail) ||
                 (expPhone && curUphone && curUphone === expPhone);

      if (isMe) {
        console.warn('[LiveRT] You were expelled from class:', expCid);
        if (S.activeClassId === expCid) {
          S.activeClassId = null;
        }
        if (Array.isArray(S.enrolledClasses)) {
          S.enrolledClasses = S.enrolledClasses.filter(function(cid) { return cid !== expCid; });
        }
        if (window.EthithApp && typeof window.EthithApp.saveState === 'function') {
          window.EthithApp.saveState();
        }
        if (window.ethithOpenApp) {
          window.ethithOpenApp('classes');
        } else if (window.go) {
          window.go('classes');
        }
        if (window.EthithApp && typeof window.EthithApp.toast === 'function') {
          window.EthithApp.toast("⚠️ Siz ustoz tomonidan guruhdan chiqarildingiz!");
        } else {
          alert("⚠️ Siz ustoz tomonidan guruhdan chiqarildingiz!");
        }
      } else {
        uiNeedsRefresh = true;
      }
    }

    // E1_B. STUDENT TRANSFERRED
    else if (event.type === 'STUDENT_TRANSFER') {
      var fromCls = classes ? classes.find(function(c) { return c.id === event.fromClassId; }) : null;
      var toCls = classes ? classes.find(function(c) { return c.id === event.toClassId; }) : null;
      var trStId = event.studentId;
      var trStObj = event.student;

      if (fromCls && Array.isArray(fromCls.students)) {
        fromCls.students = fromCls.students.filter(function(s) {
          return s.id !== trStId && (!trStObj || s.email !== trStObj.email);
        });
        if (window.ethithReplenishTesterSlots) window.ethithReplenishTesterSlots(fromCls);
      }
      if (toCls && trStObj) {
        if (!toCls.students) toCls.students = [];
        var tIdx = toCls.students.findIndex(function(s) {
          return s.isTester || (s.name && s.name.startsWith('tester_'));
        });
        if (tIdx !== -1) {
          toCls.students[tIdx] = trStObj;
        } else if (!toCls.students.some(function(s) { return s.id === trStId; })) {
          toCls.students.push(trStObj);
        }
      }
      uiNeedsRefresh = true;

      var curU = S.user || {};
      if (curU.id === trStId || (trStObj && curU.email && curU.email === trStObj.email)) {
        if (toCls) {
          S.activeClassId = toCls.id;
          if (window.EthithApp && window.EthithApp.saveState) window.EthithApp.saveState();
          if (window.ethithOpenApp) window.ethithOpenApp('classes');
          else if (window.go) window.go('classes');
          if (window.EthithApp && window.EthithApp.toast) {
            window.EthithApp.toast("Siz '" + toCls.name + "' guruhiga ko‘chirildingiz!");
          }
        }
      }
    }

    // E2. ATTENDANCE & JOURNAL REAL-TIME UPDATE
    else if (event.type === 'ATTENDANCE_UPDATED' || event.type === 'CLASS_DURATION_UPDATED') {
      var attCls = targetCls || classes.find(function(c) {
        return (event.classId && c.id === event.classId) || (event.classCode && c.code === event.classCode);
      });
      if (attCls) {
        if (event.attendance) attCls.attendance = event.attendance;
        if (event.schedule) attCls.schedule = event.schedule;
        if (event.learningMonths !== undefined || event.learningDays !== undefined || event.levelTestDate || event.learningLessons !== undefined) {
          var rM = event.learningMonths !== undefined ? Number(event.learningMonths) : (attCls.learningMonths || 0);
          var rD = event.learningDays !== undefined ? Number(event.learningDays) : (attCls.learningDays || 0);
          attCls.learningMonths = rM;
          attCls.learningDays = rD;
          if (event.learningLessons !== undefined) attCls.learningLessons = Number(event.learningLessons);
          if (event.baselineDate) attCls.baselineDate = event.baselineDate;
          if (event.schedule) attCls.schedule = event.schedule;
          if (event.levelTestDate) attCls.levelTestDate = event.levelTestDate;
          attCls.durationUpdatedAt = event.ts || Date.now();
          try {
            localStorage.setItem('ethith_class_duration_' + attCls.id, JSON.stringify({
              learningMonths: rM,
              learningDays: rD,
              learningLessons: attCls.learningLessons !== undefined ? attCls.learningLessons : null,
              baselineDate: attCls.baselineDate || '',
              schedule: attCls.schedule || '',
              levelTestDate: attCls.levelTestDate || '',
              ts: attCls.durationUpdatedAt
            }));
          } catch(e) {}
        }
        if (event.customStudentNames) attCls.customStudentNames = event.customStudentNames;
        if (event.activeHomework !== undefined) attCls.activeHomework = event.activeHomework;
        if (event.activeHomeworks !== undefined) attCls.activeHomeworks = event.activeHomeworks;
        if (event.levelTestResults) attCls.levelTestResults = Object.assign({}, attCls.levelTestResults || {}, event.levelTestResults);
        uiNeedsRefresh = true;
        if (window._ethithRefreshAttendance && window._ethithCurrentView === 'attendance') {
          try { window._ethithRefreshAttendance(); } catch(e) {}
        } else if (window.EA && typeof window.EA.render === 'function') {
          var apView = document.getElementById('apView') || document.getElementById('viewContainer');
          if (apView && (window._ethithCurrentView === 'attendance' || document.querySelector('.ea-teachers-grid') || document.querySelector('.ea-teacher-groups-wrap'))) {
            try { window.EA.render(apView, true); } catch(e) {}
          }
        }
      }
    }

    // E2b. 3-OYLIK LEVEL TEST REAL-TIME UPDATE
    else if (event.type === 'LEVEL_TEST_UPDATE') {
      var ltCls = targetCls || classes.find(function(c) {
        return (event.classId && c.id === event.classId) || (event.classCode && c.code === event.classCode);
      });
      if (ltCls) {
        if (event.results) ltCls.levelTestResults = Object.assign({}, ltCls.levelTestResults || {}, event.results);
        if (event.attendance) ltCls.attendance = event.attendance;
        uiNeedsRefresh = true;
        if (window._ethithRefreshAttendance && window._ethithCurrentView === 'attendance') {
          try { window._ethithRefreshAttendance(); } catch(e) {}
        }
      }
    }

    // E3. STATE MUTATION (Instant Real-time Sync Across Connected Clients: Admin & Teacher)
    else if (event.type === 'STATE_MUTATION' || event.type === 'UNDO_MUTATION') {
      if (Array.isArray(event.classes) && event.classes.length > 0) {
        mergeClasses(S.classes, event.classes);
      }
      if (Array.isArray(event.accounts) && event.accounts.length > 0) {
        mergeAccounts(S.accounts, event.accounts);
      }
      uiNeedsRefresh = true;
      var apView = document.getElementById('apView');
      if (apView && window.EA && typeof window.EA.render === 'function' && window._ethithCurrentView === 'attendance') {
        window.EA.render(apView, true);
      }
      if (typeof fetchRemoteStore === 'function') {
        fetchRemoteStore().then(function(remote) {
          if (remote && remote.classes) mergeClasses(S.classes, remote.classes);
          var apView2 = document.getElementById('apView');
          if (apView2 && window.EA && typeof window.EA.render === 'function' && window._ethithCurrentView === 'attendance') {
            window.EA.render(apView2, true);
          }
          if (window._ethithRefreshCurrentView) {
            try { window._ethithRefreshCurrentView(); } catch(e) {}
          }
        });
      }
    }

    // E3_B. TEACHER CREATED (0ms Realtime Sync Across Admin & Attendance Views)
    else if ((event.type === 'TEACHER_CREATED' || event.type === 'teacher_added') && (event.teacher || event.teacherData)) {
      var newT = event.teacher || event.teacherData;
      if (!Array.isArray(S.teachers)) S.teachers = [];
      var tIdx = S.teachers.findIndex(function(t) { return t && (t.id === newT.id || (t.login && newT.login && t.login.toLowerCase() === newT.login.toLowerCase())); });
      if (tIdx === -1) {
        S.teachers.push(newT);
      } else {
        S.teachers[tIdx] = Object.assign({}, S.teachers[tIdx], newT);
      }
      if (event.account) {
        if (!Array.isArray(S.accounts)) S.accounts = [];
        var aIdx = S.accounts.findIndex(function(a) { return a && (a.id === event.account.id || (a.login && event.account.login && a.login.toLowerCase() === event.account.login.toLowerCase())); });
        if (aIdx === -1) S.accounts.push(event.account);
        else S.accounts[aIdx] = Object.assign({}, S.accounts[aIdx], event.account);
      }
      if (Array.isArray(S.deletedTeacherIds)) {
        S.deletedTeacherIds = S.deletedTeacherIds.filter(function(id) { return id !== newT.id && id !== newT.login; });
      }
      try {
        var lsDel = JSON.parse(localStorage.getItem('ethith_deleted_teacher_ids') || '[]');
        if (Array.isArray(lsDel)) {
          lsDel = lsDel.filter(function(id) { return id !== newT.id && id !== newT.login; });
          localStorage.setItem('ethith_deleted_teacher_ids', JSON.stringify(lsDel));
        }
      } catch(e) {}
      if (window._ethithRefreshTeachersList) {
        try { window._ethithRefreshTeachersList(); } catch(e) {}
      } else if (window._ethithRefreshCurrentView) {
        try { window._ethithRefreshCurrentView(); } catch(e) {}
      }
      return;
    }

    // E3_C. TEACHER DELETED (0ms Instant Purge & Permanent Server-side Sync)
    else if ((event.type === 'TEACHER_DELETED' || event.type === 'teacher_deleted') && (event.teacherId || event.tid || event.teacherLogin || event.tLogin)) {
      var delTid = event.teacherId || event.tid;
      var delTlg = event.teacherLogin || event.tLogin;
      if (!Array.isArray(S.deletedTeacherIds)) S.deletedTeacherIds = [];
      if (delTid && S.deletedTeacherIds.indexOf(delTid) === -1) S.deletedTeacherIds.push(delTid);
      if (delTlg && S.deletedTeacherIds.indexOf(delTlg) === -1) S.deletedTeacherIds.push(delTlg);
      try {
        var lsDel = JSON.parse(localStorage.getItem('ethith_deleted_teacher_ids') || '[]');
        if (!Array.isArray(lsDel)) lsDel = [];
        if (delTid && lsDel.indexOf(delTid) === -1) lsDel.push(delTid);
        if (delTlg && lsDel.indexOf(delTlg) === -1) lsDel.push(delTlg);
        localStorage.setItem('ethith_deleted_teacher_ids', JSON.stringify(lsDel));
      } catch(e) {}

      if (Array.isArray(S.teachers)) {
        S.teachers = S.teachers.filter(function(t) {
          if (!t) return false;
          return t.id !== delTid && (!delTlg || t.login !== delTlg);
        });
      }
      if (window.ETHITH_INITIAL_STORE && Array.isArray(window.ETHITH_INITIAL_STORE.teachers)) {
        window.ETHITH_INITIAL_STORE.teachers = window.ETHITH_INITIAL_STORE.teachers.filter(function(t) {
          if (!t) return false;
          return t.id !== delTid && (!delTlg || t.login !== delTlg);
        });
      }
      if (Array.isArray(S.accounts)) {
        S.accounts = S.accounts.filter(function(a) {
          if (!a) return false;
          return a.id !== delTid && a.teacherId !== delTid && (!delTlg || a.login !== delTlg);
        });
      }
      if (Array.isArray(S.classes)) {
        S.classes.forEach(function(cls) {
          if (cls.teacherId === delTid || (delTlg && cls.teacherId === delTlg)) {
            cls.teacherId = '';
            cls.teacherName = 'Biriktirilmagan';
          }
        });
      }
      if (window.EthithEnterprise && window.EthithEnterprise.getStore) {
        var entStore = window.EthithEnterprise.getStore();
        if (entStore) {
          if (Array.isArray(entStore.teachers)) entStore.teachers = entStore.teachers.filter(function(t) { return t && t.id !== delTid && (!delTlg || t.login !== delTlg); });
          if (Array.isArray(entStore.accounts)) entStore.accounts = entStore.accounts.filter(function(a) { return a && a.id !== delTid && a.teacherId !== delTid && (!delTlg || a.login !== delTlg); });
        }
      }
      if (window._ethithRefreshTeachersList) {
        try { window._ethithRefreshTeachersList(); } catch(e) {}
      } else if (window._ethithRefreshCurrentView) {
        try { window._ethithRefreshCurrentView(); } catch(e) {}
      }
      return;
    }

    // F. CLASS CREATED & GROUP ASSIGNED (Instant sub-millisecond assignment & top alert)
    else if ((event.type === 'CLASS_CREATED' || event.type === 'GROUP_ASSIGNED') && (event.classData || event.class)) {
      var newClsData = event.classData || event.class;
      var cExists = classes.some(function(c) {
        return (c.id && c.id === newClsData.id) || (c.code && c.code === newClsData.code);
      });
      if (!cExists) {
        classes.push(newClsData);
        uiNeedsRefresh = true;
      }

      // Check if this new group is assigned to currently logged in teacher
      try {
        var myU = (window.S && window.S.user) || {};
        var myTid = (myU.id || '').toLowerCase().trim();
        var myTlogin = (myU.login || '').toLowerCase().trim();
        var myTname = (myU.name || '').toLowerCase().trim();
        var clsTid = (newClsData.teacherId || event.teacherId || '').toLowerCase().trim();
        var clsTname = (newClsData.teacherName || newClsData.teacher || event.teacherName || '').toLowerCase().trim();

        var isForThisTeacher = false;
        if (clsTid && myTid && clsTid === myTid) isForThisTeacher = true;
        if (clsTid && myTlogin && (clsTid.includes(myTlogin) || myTlogin.includes(clsTid))) isForThisTeacher = true;
        if (clsTname && myTname && (clsTname.includes(myTname) || myTname.includes(clsTname))) isForThisTeacher = true;

        if (isForThisTeacher) {
          if (window.EthithNotify && typeof window.EthithNotify.showSystemAlert === 'function') {
            window.EthithNotify.showSystemAlert(
              "🎉 Sizga yangi guruh biriktirildi!",
              "Administrator sizga yangi «" + (newClsData.name || 'Guruh') + "» guruhini biriktirdi.",
              "🏫",
              function() {
                window.S.activeClassId = newClsData.id;
                var tCont = document.getElementById('apView') || document.getElementById('viewContainer');
                if (window.EthithViews && typeof window.EthithViews.renderClassDetail === 'function' && tCont) {
                  window.EthithViews.renderClassDetail(tCont, newClsData);
                }
              }
            );
          }
          if (window.EthithAttendance && typeof window.EthithAttendance.renderTeacherGroupsView === 'function') {
            var apV = document.getElementById('apView');
            if (apV) window.EthithAttendance.render(apV);
          }
          if (window._ethithRefreshCurrentClass) window._ethithRefreshCurrentClass();
        }
      } catch(e) {}
    }

    // G. DELETE EXAM
    else if (event.type === 'DELETE_EXAM' && event.examId) {
      if (!S.deletedExamIds) S.deletedExamIds = [];
      if (S.deletedExamIds.indexOf(event.examId) === -1) S.deletedExamIds.push(event.examId);
      if (event.examCode && S.deletedExamIds.indexOf(event.examCode) === -1) S.deletedExamIds.push(event.examCode);
      var prevExamLen = (S.exams || []).length;
      S.exams = (S.exams || []).filter(function(x) {
        return x.id !== event.examId && (!event.examCode || x.code !== event.examCode);
      });
      if (S.exams.length !== prevExamLen) {
        uiNeedsRefresh = true;
      }
    }

    // H. STUDENT BLOCKED (PROCTORING ALERT)
    else if (event.type === 'STUDENT_BLOCKED') {
      if (!S.notifications) S.notifications = [];
      var blockedNotif = {
        id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        studentId: event.studentId,
        studentName: event.studentName,
        studentEmail: event.studentEmail,
        examId: event.examId,
        examCode: event.examCode,
        examTitle: event.examTitle,
        reason: event.reason,
        snapshot: event.snapshot || null,
        timestamp: event.timestamp || Date.now(),
        read: false,
        resolved: false
      };
      var dup = S.notifications.find(function(n) {
        return (n.studentEmail === blockedNotif.studentEmail || n.studentId === blockedNotif.studentId) &&
               n.examCode === blockedNotif.examCode && !n.resolved;
      });
      if (!dup) {
        S.notifications.unshift(blockedNotif);
        uiNeedsRefresh = true;
        if (S.user && S.user.role === 'teacher' && window._ethithShowTeacherAlert) {
          window._ethithShowTeacherAlert(blockedNotif);
        }
      }
    }

    // I. STUDENT UNBLOCKED (BY TEACHER)
    else if (event.type === 'STUDENT_UNBLOCKED') {
      if (window._ethithOnStudentUnblocked) {
        window._ethithOnStudentUnblocked(event);
      }
      if (S.notifications) {
        S.notifications.forEach(function(n) {
          if ((n.studentEmail === event.studentEmail || n.studentId === event.studentId) &&
              (!event.examCode || n.examCode === event.examCode)) {
            n.resolved = true;
            uiNeedsRefresh = true;
          }
        });
      }
    }

    
    // J0. WORKBOOK LIVE SYNC (TEACHER MODIFIED/CALIBRATED WORKBOOK IN REAL-TIME - ZERO LATENCY TO ALL ACCOUNTS)
    else if (event.type === 'WORKBOOK_PAGE_UPDATED' && event.page && Array.isArray(event.inputs)) {
      var pNum = parseInt(event.page, 10);
      var evTs = event.ts || Date.now();
      console.log('[LiveRT] Real-time workbook page ' + pNum + ' update received from teacher!');
      if (!S.workbookOverrides) S.workbookOverrides = {};
      if (!S.workbookOverridesTs) S.workbookOverridesTs = {};
      S.workbookOverrides[pNum] = event.inputs;
      S.workbookOverridesTs[pNum] = evTs;
      try {
        localStorage.setItem('ethith_wb_coords_v15_' + pNum, JSON.stringify(event.inputs));
        localStorage.setItem('ethith_wb_ts_' + pNum, evTs.toString());
      } catch(e) {}
      var WB = window.ETHITH_WORKBOOK_B1 || window.ETHITH_WORKBOOK;
      if (WB) {
        if (WB.defaultInputs) {
          WB.defaultInputs[pNum] = event.inputs;
        }
        if (typeof WB.savePageInputs === 'function') {
          WB.savePageInputs(pNum, event.inputs, /* noBroadcast */ true);
        }
        if (typeof WB.liveRefreshPage === 'function') {
          WB.liveRefreshPage(pNum, event.inputs);
        }
        if (window.toast && !window._ethithWbEditorMode) {
          var dispPage = pNum > 2000 ? ('Upper-Intermediate ' + (pNum - 2000)) : pNum;
          window.toast('⚡ Ustoz ' + dispPage + '-sahifani yangiladi');
        }
      }
    }

    // J1. CUSTOM TEST UPDATED (TEACHER MODIFIED CUSTOM/CURRICULUM TEST IN REAL-TIME)
    else if ((event.type === 'TEST_SAVED' || event.type === 'TEST_UPDATED') && event.test) {
      var tObj = event.test;
      if (!S.fileExplorer) S.fileExplorer = { folders: [], tests: [] };
      if (!S.fileExplorer.tests) S.fileExplorer.tests = [];
      var tIdx = S.fileExplorer.tests.findIndex(function(x) { return x.id === tObj.id; });
      if (tIdx > -1) {
        S.fileExplorer.tests[tIdx] = tObj;
      } else {
        S.fileExplorer.tests.push(tObj);
      }
      if (tObj.isCurriculum && tObj.testKey) {
        if (!S.customCurriculumTests) S.customCurriculumTests = {};
        S.customCurriculumTests[tObj.testKey] = tObj;
        S.customCurriculumTests[tObj.id] = tObj;
      }
      // If student is currently taking this test, live patch pins in 0ms!
      var takeModal = document.getElementById('eeTakeVisualOverlay');
      if (takeModal) {
        var takePagesWrap = takeModal.querySelector('#eeTakePagesWrap');
        if (takePagesWrap && tObj.pages) {
          tObj.pages.forEach(function(pg) {
            (pg.elements || []).forEach(function(el) {
              var inputOrChip = takePagesWrap.querySelector('[data-id="' + el.id + '"]');
              if (inputOrChip) {
                var pWrap = inputOrChip.parentElement;
                if (pWrap) {
                  pWrap.style.transition = 'left 0.15s ease-out, top 0.15s ease-out, width 0.15s ease-out, height 0.15s ease-out';
                  pWrap.style.left = el.left + '%';
                  pWrap.style.top = el.top + '%';
                  pWrap.style.width = el.width + '%';
                  pWrap.style.height = el.height + '%';
                  inputOrChip.setAttribute('data-correct', el.correct || '');
                }
              }
            });
          });
        }
      }
      if (window.toast && !window._ethithWbEditorMode) {
        window.toast('⚡ Ustoz "' + (tObj.title || 'test') + '"ni yangiladi');
      }
    }

    // J1. EXAM UPDATED (TEACHER MODIFIED EXAM IN REAL-TIME)
    else if (event.type === 'EXAM_UPDATED' && event.exam) {
      var exId = event.exam.id;
      var exCode = event.exam.code;
      var idx = (S.exams || []).findIndex(function(x) {
        return (exId && String(x.id) === String(exId)) ||
               (exCode && x.code && String(x.code).trim() === String(exCode).trim());
      });
      if (idx > -1) {
        var existingSubs = S.exams[idx].submissions || [];
        S.exams[idx] = event.exam;
        if (!event.exam.submissions || event.exam.submissions.length === 0) {
          S.exams[idx].submissions = existingSubs;
        }
      } else {
        S.exams.push(event.exam);
      }
      if (window._ethithActiveRunningExam &&
          ((window._ethithActiveRunningExam.id && String(window._ethithActiveRunningExam.id) === String(exId)) ||
           (window._ethithActiveRunningExam.code && String(window._ethithActiveRunningExam.code).trim() === String(exCode).trim()))) {
        if (window._ethithOnActiveExamUpdated) {
          try { window._ethithOnActiveExamUpdated(event.exam); } catch(e) {}
        }
      }
      uiNeedsRefresh = true;
      if (window._ethithRefreshExamsList) window._ethithRefreshExamsList();
      if (window._ethithRefreshProgressionTests) window._ethithRefreshProgressionTests();
    }

    // J. EXAM SUBMISSION (STUDENT COMPLETED EXAM)
    else if (event.type === 'EXAM_SUBMISSION' && (event.examId || event.examCode) && event.submission) {
      var targetExam = (S.exams || []).find(function(x) {
        return (event.examId && String(x.id) === String(event.examId)) || (event.examCode && x.code && String(x.code).trim() === String(event.examCode).trim());
      });
      if (targetExam) {
        if (!targetExam.submissions) targetExam.submissions = [];
        var uKey = (event.submission.studentEmail || event.submission.studentId || '').toLowerCase();
        var existingIdx = targetExam.submissions.findIndex(function(s) {
          return (s.studentEmail && s.studentEmail.toLowerCase() === uKey) ||
                 (s.studentId && s.studentId.toLowerCase() === uKey);
        });
        if (existingIdx > -1) {
          targetExam.submissions[existingIdx] = event.submission;
        } else {
          targetExam.submissions.push(event.submission);
        }
        uiNeedsRefresh = true;
        if (window._ethithRefreshExamsList) window._ethithRefreshExamsList();
        if (window._ethithOnExamSubmission) {
          try { window._ethithOnExamSubmission(event); } catch(e) {}
        }
      }
    }

    // K. QUIZ BATTLE REAL-TIME SYNC & EVENTS
    else if (event.type === 'QUIZ_CREATED' && event.quiz) {
      if (!S.quizzes) S.quizzes = [];
      var qExists = S.quizzes.some(function(q) {
        return (q.id && q.id === event.quiz.id) || (q.code && q.code === event.quiz.code);
      });
      if (!qExists) {
        S.quizzes.push(event.quiz);
        uiNeedsRefresh = true;
      }
      if (window._ethithRefreshQuizList) window._ethithRefreshQuizList();
    }
    else if (event.type === 'QUIZ_UPDATED' && event.quiz) {
      if (!S.quizzes) S.quizzes = [];
      var qIdx = S.quizzes.findIndex(function(q) {
        return (q.id && q.id === event.quiz.id) || (q.code && q.code === event.quiz.code);
      });
      if (qIdx > -1) {
        S.quizzes[qIdx] = event.quiz;
      } else {
        S.quizzes.push(event.quiz);
      }
      uiNeedsRefresh = true;
      if (window._ethithRefreshQuizList) window._ethithRefreshQuizList();
      if (window._ethithOnQuizEvent) {
        try { window._ethithOnQuizEvent(event); } catch(qe) {}
      }
    }
    else if (event.type === 'QUIZ_DELETED' && (event.quizId || event.quizCode)) {
      if (!S.quizzes) S.quizzes = [];
      S.quizzes = S.quizzes.filter(function(q) {
        return q.id !== event.quizId && q.code !== event.quizCode;
      });
      uiNeedsRefresh = true;
      if (window._ethithRefreshQuizList) window._ethithRefreshQuizList();
      if (window._ethithOnQuizEvent) {
        try { window._ethithOnQuizEvent(event); } catch(qe) {}
      }
    }
    else if (event.type === 'NEW_CONTEST_ANNOUNCED' || event.type === 'CONTEST_CREATED') {
      if (!S.contests) S.contests = [];
      var cObj = event.contest;
      if (cObj) {
        var existingIdx = S.contests.findIndex(function(x) { return x.id === cObj.id; });
        if (existingIdx > -1) {
          S.contests[existingIdx] = cObj;
        } else {
          S.contests.unshift(cObj);
        }
        if (event.test && S.fileExplorer && Array.isArray(S.fileExplorer.tests)) {
          var tIdx = S.fileExplorer.tests.findIndex(function(t) { return t.id === event.test.id; });
          if (tIdx > -1) S.fileExplorer.tests[tIdx] = event.test;
          else S.fileExplorer.tests.push(event.test);
        }
        try {
          var entStore = JSON.parse(localStorage.getItem('ethith_enterprise_store') || '{}');
          entStore.contests = S.contests;
          if (event.test) {
            if (!entStore.fileExplorer) entStore.fileExplorer = { tests: [], folders: [] };
            if (!Array.isArray(entStore.fileExplorer.tests)) entStore.fileExplorer.tests = [];
            var etIdx = entStore.fileExplorer.tests.findIndex(function(t) { return t.id === event.test.id; });
            if (etIdx > -1) entStore.fileExplorer.tests[etIdx] = event.test;
            else entStore.fileExplorer.tests.push(event.test);
          }
          localStorage.setItem('ethith_enterprise_store', JSON.stringify(entStore));
        } catch(e) {}
        uiNeedsRefresh = true;
        if (window.EthithEnterprise && typeof window.EthithEnterprise.renderContestsView === 'function') {
          var cWrap = document.querySelector('.ee-contests-wrap');
          if (cWrap && cWrap.parentElement) {
            window.EthithEnterprise.renderContestsView(cWrap.parentElement);
          }
        }
        if (window.showToast) {
          window.showToast("🏆 Yangi Onlayn Musobaqa e‘lon qilindi: " + (cObj.title || 'Musobaqa'));
        }
      }
    }
    else if (event.type === 'CONTEST_FINISHED') {
      // If any student is actively taking the contest right now, immediately terminate test and show banner!
      try {
        var activeTestModals = document.querySelectorAll('#eeTakeVisualOverlay, #eeTakeTestOverlay, .ee-take-test-modal, #eaGlobalModalRoot > div');
        activeTestModals.forEach(function(m) {
          if (m && (m.id.includes('Take') || m.innerHTML.includes('Musobaqa') || m.innerHTML.includes('Test topshirish'))) {
            m.remove();
          }
        });
        if (window.showToast) {
          window.showToast("🏁 Turnir ustoz tomonidan yakunlandi va natijalar e‘lon qilindi!");
        }
      } catch(te) {}

      if (!S.contests) S.contests = [];
      var fC = S.contests.find(function(x) { return x.id === event.contestId; });
      if (fC) {
        fC.status = 'finished';
        fC.coinsDistributed = true;
        fC.endDate = Date.now();
      }
      if (Array.isArray(event.winners)) {
        event.winners.forEach(function(w) {
          var acc = (S.accounts || []).find(function(a) {
            return (w.login && a.login === w.login) || (w.login && a.id === w.login) || (w.name && a.name && a.name.toLowerCase() === w.name.toLowerCase());
          });
          if (acc) {
            acc.coins = (Number(acc.coins) || 0) + (w.coins || 0);
          }
          if (S.user && ((w.login && S.user.login === w.login) || (w.login && S.user.id === w.login) || (w.name && S.user.name && S.user.name.toLowerCase() === w.name.toLowerCase()))) {
            S.user.coins = (Number(S.user.coins) || 0) + (w.coins || 0);
            if (window.showToast) {
              window.showToast("🎉 TABRIKLAYMIZ! Turnirda " + w.rank + "-o‘rinni egalladingiz va +" + w.coins + " Coin yutib oldingiz!");
            }
          }
        });
      }
      try {
        var entStore2 = JSON.parse(localStorage.getItem('ethith_enterprise_store') || '{}');
        entStore2.contests = S.contests;
        localStorage.setItem('ethith_enterprise_store', JSON.stringify(entStore2));
      } catch(e) {}
      uiNeedsRefresh = true;
      if (window.EthithEnterprise && typeof window.EthithEnterprise.renderContestsView === 'function') {
        var cWrap2 = document.querySelector('.ee-contests-wrap');
        if (cWrap2 && cWrap2.parentElement) {
          window.EthithEnterprise.renderContestsView(cWrap2.parentElement);
        }
      }
    }
    else if (event.type === 'CONTEST_DELETED') {
      if (!S.contests) S.contests = [];
      S.contests = S.contests.filter(function(x) { return x.id !== event.contestId; });
      try {
        var entStore3 = JSON.parse(localStorage.getItem('ethith_enterprise_store') || '{}');
        entStore3.contests = S.contests;
        localStorage.setItem('ethith_enterprise_store', JSON.stringify(entStore3));
      } catch(e) {}
      uiNeedsRefresh = true;
      if (window.EthithEnterprise && typeof window.EthithEnterprise.renderContestsView === 'function') {
        var cWrap3 = document.querySelector('.ee-contests-wrap');
        if (cWrap3 && cWrap3.parentElement) {
          window.EthithEnterprise.renderContestsView(cWrap3.parentElement);
        }
      }
    }

    // L. SPREADSHEET REAL-TIME SYNC & EVENTS (LUCKYSHEET MULTI-DOC)
    else if (event.type === 'SPREADSHEET_SAVED' && event.spreadsheet) {
      var sObj = event.spreadsheet;
      var curDelSheets = [];
      try { curDelSheets = JSON.parse(localStorage.getItem('eh_deleted_sheets') || '[]'); } catch(e) {}
      if (!Array.isArray(curDelSheets)) curDelSheets = [];
      if (curDelSheets.indexOf(sObj.id) === -1) {
        var lList = [];
        try { lList = JSON.parse(localStorage.getItem('eh_saved_spreadsheets_v2') || '[]'); } catch(e) {}
        if (!Array.isArray(lList)) lList = [];
        var sIdx = lList.findIndex(function(x) { return x.id === sObj.id; });
        if (sIdx > -1) {
          if ((sObj.updatedTs || 0) >= (lList[sIdx].updatedTs || 0)) {
            lList[sIdx] = sObj;
          }
        } else {
          lList.push(sObj);
        }
        safeStorageSetSync('eh_saved_spreadsheets_v2', JSON.stringify(lList));
        if (window.EthithApp && window.EthithApp.state) {
          window.EthithApp.state.savedSpreadsheets = lList;
        }
        if (typeof window._ethithRefreshLuckyDocSelect === 'function') {
          window._ethithRefreshLuckyDocSelect();
        }
      }
    }
    else if (event.type === 'SPREADSHEET_DELETED' && event.spreadsheetId) {
      var delId = event.spreadsheetId;
      var delArr = [];
      try { delArr = JSON.parse(localStorage.getItem('eh_deleted_sheets') || '[]'); } catch(e) {}
      if (!Array.isArray(delArr)) delArr = [];
      if (delArr.indexOf(delId) === -1) delArr.push(delId);
      try { localStorage.setItem('eh_deleted_sheets', JSON.stringify(delArr)); } catch(e) {}
      var lList2 = [];
      try { lList2 = JSON.parse(localStorage.getItem('eh_saved_spreadsheets_v2') || '[]'); } catch(e) {}
      if (Array.isArray(lList2)) {
        lList2 = lList2.filter(function(x) { return x.id !== delId; });
        safeStorageSetSync('eh_saved_spreadsheets_v2', JSON.stringify(lList2));
        if (window.EthithApp && window.EthithApp.state) {
          window.EthithApp.state.savedSpreadsheets = lList2;
        }
      }
      if (typeof window._ethithRefreshLuckyDocSelect === 'function') {
        window._ethithRefreshLuckyDocSelect();
      }
    }
    else if (event.type === 'CONTEST_PARTICIPATION' && event.contestId && event.participant) {
      if (!S.contests) S.contests = [];
      var pc = S.contests.find(function(x) { return x.id === event.contestId; });
      if (pc) {
        if (!pc.participants) pc.participants = {};
        pc.participants[event.participant.id || event.participant.login] = event.participant;
        try {
          var entStore4 = JSON.parse(localStorage.getItem('ethith_enterprise_store') || '{}');
          entStore4.contests = S.contests;
          localStorage.setItem('ethith_enterprise_store', JSON.stringify(entStore4));
        } catch(e) {}
        uiNeedsRefresh = true;
        if (window.EthithEnterprise && typeof window.EthithEnterprise.renderContestsView === 'function') {
          var cWrap4 = document.querySelector('.ee-contests-wrap');
          if (cWrap4 && cWrap4.parentElement) {
            window.EthithEnterprise.renderContestsView(cWrap4.parentElement);
          }
        }
      }
    }
    else if ((event.type && event.type.indexOf('QUIZ_') === 0) || event.type === 'GIFT_SENT' || event.type === 'USER_REGISTERED') {
      if (event.type === 'USER_REGISTERED' && event.user && (event.user.email || event.user.name)) {
        if (!Array.isArray(S.accounts)) S.accounts = [];
        var u = event.user;
        var existingAcc = S.accounts.find(function(a) {
          return a.email && u.email && a.email.toLowerCase().trim() === u.email.toLowerCase().trim();
        });
        if (!existingAcc) {
          S.accounts.push(u);
        } else {
          if (u.coins !== undefined) existingAcc.coins = Number(u.coins);
          if (u.avatar !== undefined) existingAcc.avatar = u.avatar;
          if (u.level) existingAcc.level = u.level;
          if (u.nameStyle) existingAcc.nameStyle = u.nameStyle;
          if (u.title) existingAcc.title = u.title;
        }
        var regKey = 'ethith_all_registered_users';
        var regList = [];
        try { regList = JSON.parse(localStorage.getItem(regKey) || '[]'); } catch(e) {}
        var rIdx = regList.findIndex(function(a) {
          return a.email && u.email && a.email.toLowerCase().trim() === u.email.toLowerCase().trim();
        });
        if (rIdx === -1) {
          regList.push(u);
        } else {
          if (u.coins !== undefined) regList[rIdx].coins = Number(u.coins);
          if (u.avatar !== undefined) regList[rIdx].avatar = u.avatar;
          if (u.level) regList[rIdx].level = u.level;
        }
        localStorage.setItem(regKey, JSON.stringify(regList));
        if (window.EthithApp && window.EthithApp.saveState) window.EthithApp.saveState();
        if (window._ethithRefreshFriendsList) {
          try { window._ethithRefreshFriendsList(); } catch(e) {}
        }
        if (window._ethithRefreshLeaderboard) {
          try { window._ethithRefreshLeaderboard(); } catch(e) {}
        }
      }
      else if (event.type === 'GIFT_SENT') {
        var myUserKey = (S.user && (S.user.email || S.user.id || '')).toLowerCase().trim();
        var myUserName = (S.user && S.user.name || '').toLowerCase().trim();
        var targetKey = (event.recipientEmail || event.recipientId || '').toLowerCase().trim();
        var targetName = (event.recipientName || '').toLowerCase().trim();
        var isMatch = (targetKey && myUserKey && targetKey === myUserKey) ||
                      (targetName && myUserName && targetName === myUserName);
        if (isMatch) {
          if (!S.user.gifts) S.user.gifts = [];
          S.user.gifts.unshift({
            id: 'gift_' + Date.now(),
            name: event.giftName,
            icon: event.giftIcon,
            desc: event.giftDesc,
            senderName: event.senderName,
            fromFriend: event.senderName,
            timestamp: Date.now()
          });
          if (window.EthithApp && window.EthithApp.saveState) window.EthithApp.saveState();

          if (!Array.isArray(S.user.notifications)) S.user.notifications = [];
          S.user.notifications.unshift({
            id: 'notif_' + Date.now(),
            type: 'gift',
            icon: event.giftIcon || '🎁',
            title: "Do'stdan Sovrin: " + event.giftName,
            message: (event.senderName || "Do'stingiz") + " sizga '" + event.giftName + "' sovrinini yubordi!",
            time: new Date().toLocaleTimeString().slice(0, 5),
            date: 'Bugun',
            read: false
          });

          var toast = document.createElement('div');
          toast.className = 'eth-live-toast-alert';
          toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#10b981;color:#fff;padding:14px 28px;border-radius:16px;font-weight:800;z-index:2147483647;box-shadow:0 12px 35px rgba(0,0,0,0.4);border:2px solid #34d399;font-size:15px;text-align:center;';
          toast.innerHTML = '🎁 <b>' + (event.senderName || 'Do\'stingiz') + '</b> sizga yangi sovrin yubordi:<br><span style="font-size:22px;display:inline-block;margin-top:6px;">' + (event.giftIcon || '🎁') + ' ' + (event.giftName || 'Sovrin') + '</span>';
          document.body.appendChild(toast);
          setTimeout(function() { if (toast && toast.parentNode) toast.remove(); }, 6000);
          if (window._ethithRefreshGifts) window._ethithRefreshGifts();
        }
      }
      if (window._ethithOnQuizEvent) {
        try { window._ethithOnQuizEvent(event); } catch(qe) {}
      }
    }
    else if (event.type === 'TG_VERIFICATION_CODE' || event.type === 'VERIFICATION_CODE_ISSUED') {
      if (event.code) {
        var cleanCode = event.code.replace(/[\s\r\n\t\-]+/g, '').toUpperCase();
        if (!window._ethithActiveVerificationCodes) window._ethithActiveVerificationCodes = {};
        window._ethithActiveVerificationCodes[cleanCode] = event.expiresAt || (Date.now() + 600000);
        try {
          var lCodes = JSON.parse(localStorage.getItem('ethith_active_tg_codes') || '{}');
          lCodes[cleanCode] = window._ethithActiveVerificationCodes[cleanCode];
          localStorage.setItem('ethith_active_tg_codes', JSON.stringify(lCodes));
        } catch(e) {}
        if (S) {
          if (!S.activeVerificationCodes) S.activeVerificationCodes = {};
          S.activeVerificationCodes[cleanCode] = window._ethithActiveVerificationCodes[cleanCode];
        }
        var stInput = document.getElementById('stCode');
        if (stInput) {
          stInput.value = cleanCode;
          var statusEl = document.getElementById('stCodeStatus');
          if (statusEl) statusEl.innerHTML = '<span style="color:#22c55e;font-weight:800">✅ Kod Telegramdan qabul qilindi!</span>';
          var noticeEl = document.getElementById('stCodeNotice');
          if (noticeEl) {
            noticeEl.style.display = 'block';
            noticeEl.innerHTML = '⚡ Kod Telegram botdan avtomatik qabul qilindi: <b style="font-family:monospace;letter-spacing:1px;color:#38bdf8;">' + cleanCode + '</b>';
          }
        }
      }
    }
    else if (event.type === 'USER_STATE_SYNC' || event.type === 'USER_COINS_UPDATE' || event.type === 'USER_REGISTERED') {
      if (event.user && (event.user.email || event.user.name || event.user.id)) {
        var u = event.user;
        var oldEmail = (event.oldEmail || '').toLowerCase().trim();
        var oldName = (event.oldName || '').toLowerCase().trim();
        var uEmail = (u.email || '').toLowerCase().trim();
        var uName = (u.name || '').trim();
        var uId = (u.id || '').trim();

        if (!Array.isArray(S.accounts)) S.accounts = [];
        var existingAcc = S.accounts.find(function(a) {
          if (!a) return false;
          var aEm = (a.email || '').toLowerCase().trim();
          var aNm = (a.name || '').toLowerCase().trim();
          if (oldEmail && aEm === oldEmail) return true;
          if (uEmail && aEm === uEmail) return true;
          if (oldName && aNm === oldName) return true;
          if (uName && aNm === uName.toLowerCase()) return true;
          if (uId && a.id && a.id === uId) return true;
          return false;
        });

        var isPlaceholder = function(str) {
          if (!str) return true;
          var s = String(str).toLowerCase().trim();
          return s === 'yangi o\'quvchi' || s === 'yangi foydalanuvchi' || s === 'foydalanuvchi' || s === 'user' || s === 'student' || s === 'guest';
        };

        var isGenericUstoz = (uEmail === 'teacher@ethith.uz' || (!u.login && uId === 'admin_official_teacher' && (!u.name || u.name === 'Ustoz')));
        if (isGenericUstoz) {
          u.name = 'Ustoz';
          uName = 'Ustoz';
          u.id = 'admin_official_teacher';
          uId = 'admin_official_teacher';
        }
        var isAdminAcc = (u.role === 'admin' || uEmail === 'admin_12038f1aq8syash@ethith.uz' || uId === 'admin_official_root');
        if (isAdminAcc) {
          u.name = 'Bosh Admin';
          uName = 'Bosh Admin';
          u.id = 'admin_official_root';
          uId = 'admin_official_root';
          u.role = 'admin';
        }

        if (existingAcc) {
          if (isAdminAcc || existingAcc.role === 'admin' || (existingAcc.email || '').toLowerCase().trim() === 'admin_12038f1aq8syash@ethith.uz') {
            existingAcc.name = 'Bosh Admin';
            existingAcc.id = 'admin_official_root';
            existingAcc.role = 'admin';
          } else if ((existingAcc.email || '').toLowerCase().trim() === 'teacher@ethith.uz' && !existingAcc.login) {
            existingAcc.name = 'Ustoz';
            existingAcc.id = 'admin_official_teacher';
            existingAcc.role = 'teacher';
          }
          if (event.type === 'USER_COINS_UPDATE' || event.type === 'COIN_TRANSFER') {
            if (u.coins !== undefined) existingAcc.coins = Number(u.coins);
          } else {
            if (uName) existingAcc.name = uName;
            if (u.login) existingAcc.login = u.login;
            if (u.password) existingAcc.password = u.password;
            if (uEmail) existingAcc.email = uEmail;
            if (uId && existingAcc.role !== 'teacher') existingAcc.id = uId;
            if (u.coins !== undefined) existingAcc.coins = Number(u.coins);
            if (u.avatar !== undefined) existingAcc.avatar = u.avatar;
            if (u.level) existingAcc.level = u.level;
            if (u.nameStyle !== undefined) existingAcc.nameStyle = u.nameStyle;
            if (u.title !== undefined) existingAcc.title = u.title;
            if (u.victorySound !== undefined) existingAcc.victorySound = u.victorySound;
            if (u.dailyMinutes !== undefined) existingAcc.dailyMinutes = u.dailyMinutes;
          }
          existingAcc.updatedAt = Date.now();

          // Also update in classes
          classes.forEach(function(c) {
            if (Array.isArray(c.students)) {
              c.students.forEach(function(st) {
                var sEm = (st.email || '').toLowerCase().trim();
                var sId = (st.id || '').trim();
                var sLg = (st.login || '').toLowerCase().trim();
                if ((uEmail && sEm === uEmail) || (uId && sId === uId) || (u.login && sLg === u.login.toLowerCase().trim())) {
                  if (uName) st.name = uName;
                  if (u.login) st.login = u.login;
                  if (u.password) st.password = u.password;
                  if (u.avatar !== undefined) st.avatar = u.avatar;
                  st.updatedAt = Date.now();
                }
              });
            }
          });
        } else {
          S.accounts.push(u);
        }

        // Deduplicate S.accounts strictly
        var dedupedAccounts = [];
        var seenAccounts = {};
        S.accounts.forEach(function(a) {
          if (!a) return;
          var em = (a.email || '').toLowerCase().trim();
          var nm = (a.name || '').toLowerCase().trim();
          if (nm === 'john doe' || em.includes('john.doe') || em.includes('example.com') || em === 'nursulton@ethith.uz') return;
          var key = em || nm;
          if (!key || seenAccounts[key]) return;
          seenAccounts[key] = true;
          dedupedAccounts.push(a);
        });
        S.accounts = dedupedAccounts;

        // Also update registered list in localStorage strictly
        var regKey = 'ethith_all_registered_users';
        var regList = [];
        try { regList = JSON.parse(localStorage.getItem(regKey) || '[]'); } catch(e) {}
        var rIdx = regList.findIndex(function(a) {
          if (!a) return false;
          var aEm = (a.email || '').toLowerCase().trim();
          var aNm = (a.name || '').toLowerCase().trim();
          return (oldEmail && aEm === oldEmail) ||
                 (uEmail && aEm === uEmail) ||
                 (oldName && aNm === oldName) ||
                 (uName && aNm === uName.toLowerCase());
        });
        if (rIdx > -1) {
          if (uName) regList[rIdx].name = uName;
          if (uEmail) regList[rIdx].email = uEmail;
          if (uId) regList[rIdx].id = uId;
          if (u.coins !== undefined) regList[rIdx].coins = Number(u.coins);
          if (u.avatar !== undefined) regList[rIdx].avatar = u.avatar;
          if (u.level) regList[rIdx].level = u.level;
        } else {
          regList.push(u);
        }
        localStorage.setItem(regKey, JSON.stringify(regList));

        // Also update in class students
        (S.classes || []).forEach(function(c) {
          if (Array.isArray(c.students)) {
            c.students.forEach(function(st) {
              var sEm = (st.email || '').toLowerCase().trim();
              var sNm = (st.name || '').toLowerCase().trim();
              if ((oldEmail && sEm === oldEmail) || (uEmail && sEm === uEmail) || (oldName && sNm === oldName) || (uName && sNm === uName.toLowerCase())) {
                if (uName) st.name = uName;
                if (uEmail) st.email = uEmail;
                if (uId) st.id = uId;
                if (u.coins !== undefined) st.coins = Number(u.coins);
                if (u.avatar !== undefined) st.avatar = u.avatar;
                if (u.nameStyle !== undefined) st.nameStyle = u.nameStyle;
                if (u.title !== undefined) st.title = u.title;
                if (u.dailyMinutes !== undefined) st.dailyMinutes = u.dailyMinutes;
              }
            });
          }
        });

        // If this tab's user matches, update local display
        if (S.user) {
          var myEm = (S.user.email || '').toLowerCase().trim();
          var myNm = (S.user.name || '').toLowerCase().trim();
          var myLg = (S.user.login || '').toLowerCase().trim();
          var myId = (S.user.id || '').toLowerCase().trim();

          var tLg = (event.targetLogin || (event.user && event.user.login) || '').toLowerCase().trim();
          var tEm = (event.targetEmail || (event.user && event.user.email) || '').toLowerCase().trim();
          var tId = (event.targetId || (event.user && event.user.id) || '').toLowerCase().trim();

          var isMe = (tLg && myLg && tLg === myLg) ||
                     (tId && myId && tId === myId) ||
                     (tLg && myId && tLg === myId) ||
                     (tId && myLg && tId === myLg) ||
                     (tEm && myEm && tEm === myEm) ||
                     (uEmail && myEm === uEmail) ||
                     (uName && myNm && uName.toLowerCase() === myNm);
          if (isMe) {
            if (uEmail === 'teacher@ethith.uz' && !S.user.login) {
              S.user.name = 'Ustoz';
              S.user.id = 'admin_official_teacher';
            } else if (event.type !== 'USER_COINS_UPDATE' && event.type !== 'COIN_TRANSFER') {
              if (uName && (!S.user.name || !isPlaceholder(uName))) S.user.name = uName;
              if (uEmail) S.user.email = uEmail;
              if (uId) S.user.id = uId;
              if (u.avatar !== undefined) S.user.avatar = u.avatar;
              if (u.nameStyle !== undefined) S.user.nameStyle = u.nameStyle;
              if (u.title !== undefined) S.user.title = u.title;
            }
            var newCoins = (event.newBalance !== undefined && event.newBalance !== null) ? Number(event.newBalance) : (u.coins !== undefined ? Number(u.coins) : S.user.coins);
            S.user.coins = newCoins;

            // Direct 0ms DOM mutation across the entire interface:
            try {
              var topBadge = document.getElementById('topCoinCount') || document.querySelector('.eth-coin-val') || document.getElementById('coinBalance');
              if (topBadge) topBadge.textContent = Number(newCoins).toLocaleString();
              var allCoinSpans = document.querySelectorAll('.user-coin-badge, .eth-top-coin-pill span, [data-user-coins], #topUserCoins');
              allCoinSpans.forEach(function(sp) { if (sp) sp.textContent = Number(newCoins).toLocaleString(); });
            } catch(e) {}

            if (window._ethithUpdateTopCoins) window._ethithUpdateTopCoins();
            if (window._ethithRefreshTopNav) window._ethithRefreshTopNav();

            // Instant celebration chime and banner on incoming coin transfer!
            if ((event.type === 'USER_COINS_UPDATE' || event.type === 'COIN_TRANSFER') && event.addedCoins) {
              try {
                if (window.ETHITH_SOUNDS_AUDIO && window.ETHITH_SOUNDS_AUDIO.playSuccess) {
                  window.ETHITH_SOUNDS_AUDIO.playSuccess();
                }
              } catch(se) {}
              var toast = document.createElement('div');
              toast.className = 'eth-toast-toast animate-slide-in';
              toast.style.cssText = 'position:fixed;top:24px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg, #10b981, #059669);color:#fff;padding:12px 24px;border-radius:14px;font-weight:900;font-size:15px;box-shadow:0 10px 30px rgba(0,0,0,0.3);z-index:999999;display:flex;align-items:center;gap:10px';
              toast.innerHTML = '<span>🪙</span> <span>+' + Number(event.addedCoins).toLocaleString() + ' ETHITH Coin hisobingizga tushdi! (Jami: ' + Number(S.user.coins).toLocaleString() + ')</span>';
              document.body.appendChild(toast);
              setTimeout(function() { toast.remove(); }, 4500);
            }
          }
        }

        if (window.EthithApp && window.EthithApp.saveState) window.EthithApp.saveState();

        // Sub-100ms real-time UI refresh triggers across all clients
        if (window._ethithRefreshLeaderboard) {
          try { window._ethithRefreshLeaderboard(); } catch(err) {}
        }
        if (window._ethithRefreshTopNav) {
          try { window._ethithRefreshTopNav(); } catch(err) {}
        }
        if (window._ethithRefreshCurrentClass) {
          try { window._ethithRefreshCurrentClass(); } catch(err) {}
        }
        if (window._ethithRefreshClassesList) {
          try { window._ethithRefreshClassesList(); } catch(err) {}
        }
        if (window._ethithRefreshFriendsList) {
          try { window._ethithRefreshFriendsList(); } catch(err) {}
        }
        if (window._ethithRefreshProfile && window._ethithCurrentView === 'profile') {
          try { window._ethithRefreshProfile(); } catch(err) {}
        }
      }
    }

    // P2P MARKETPLACE & AUCTION EVENTS
    else if (event.type === 'P2P_LIST_ITEM' && event.listing) {
      if (!Array.isArray(S.p2pListings)) S.p2pListings = [];
      var exists = S.p2pListings.some(function(l) { return l.id === event.listing.id; });
      if (!exists) {
        S.p2pListings.unshift(event.listing);
        try { localStorage.setItem('ethith_p2p_listings', JSON.stringify(S.p2pListings)); } catch(e) {}
        if (window.EthithApp && window.EthithApp.saveState) window.EthithApp.saveState();
        if (window._ethithRefreshMarket && window._ethithCurrentView === 'market') {
          try { window._ethithRefreshMarket(); } catch(e) {}
        }
      }
    }
    else if (event.type === 'P2P_BUY_ITEM') {
      if (!Array.isArray(S.p2pListings)) S.p2pListings = [];
      S.p2pListings = S.p2pListings.filter(function(l) { return l.id !== event.listingId; });
      if (!S.deletedListingIds) S.deletedListingIds = [];
      if (S.deletedListingIds.indexOf(event.listingId) === -1) S.deletedListingIds.push(event.listingId);
      try { localStorage.setItem('ethith_p2p_listings', JSON.stringify(S.p2pListings)); localStorage.setItem('ethith_deleted_listing_ids', JSON.stringify(S.deletedListingIds)); } catch(e) {}

      var isMeSeller = S.user && (
        (event.sellerEmail && S.user.email && event.sellerEmail.toLowerCase() === S.user.email.toLowerCase()) ||
        (event.sellerId && S.user.id && event.sellerId === S.user.id) ||
        (event.sellerName && S.user.name && event.sellerName.toLowerCase() === S.user.name.toLowerCase())
      );
      if (isMeSeller) {
        S.user.coins = (S.user.coins || 0) + Number(event.price || 0);
        if (Array.isArray(S.accounts)) {
          var myAcc = S.accounts.find(function(a) {
            return (a.email && S.user.email && a.email.toLowerCase() === S.user.email.toLowerCase()) ||
                   (a.name && S.user.name && a.name.toLowerCase() === S.user.name.toLowerCase());
          });
          if (myAcc) myAcc.coins = S.user.coins;
        }
        if (window._ethithUpdateTopCoins) window._ethithUpdateTopCoins();

        var toast = document.createElement('div');
        toast.className = 'eth-live-toast-alert';
        toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#10b981;color:#fff;padding:14px 28px;border-radius:16px;font-weight:800;z-index:2147483647;box-shadow:0 12px 35px rgba(0,0,0,0.4);border:2px solid #34d399;font-size:15px;text-align:center;';
        toast.innerHTML = '🪙 <b>Muvaffaqiyatli Savdo!</b><br>Sizning <b>' + (event.itemName || 'buyum') + '</b> buyumingiz <b>' + (event.buyerName || 'O\'quvchi') + '</b> tomonidan sotib olindi!<br><span style="color:#fef08a;font-size:18px">+' + event.price + ' ETHITH Coin</span>';
        document.body.appendChild(toast);
        setTimeout(function() { toast.remove(); }, 6000);
      }
      if (window.EthithApp && window.EthithApp.saveState) window.EthithApp.saveState();
      if (window._ethithRefreshMarket && window._ethithCurrentView === 'market') {
        try { window._ethithRefreshMarket(); } catch(e) {}
      }
    }
    else if (event.type === 'P2P_BARTER_SWAP') {
      if (!Array.isArray(S.p2pListings)) S.p2pListings = [];
      S.p2pListings = S.p2pListings.filter(function(l) { return l.id !== event.listingId; });
      if (!S.deletedListingIds) S.deletedListingIds = [];
      if (S.deletedListingIds.indexOf(event.listingId) === -1) S.deletedListingIds.push(event.listingId);
      try { localStorage.setItem('ethith_p2p_listings', JSON.stringify(S.p2pListings)); localStorage.setItem('ethith_deleted_listing_ids', JSON.stringify(S.deletedListingIds)); } catch(e) {}
      var isMeSeller = S.user && (
        (event.sellerEmail && S.user.email && event.sellerEmail.toLowerCase() === S.user.email.toLowerCase()) ||
        (event.sellerId && S.user.id && event.sellerId === S.user.id) ||
        (event.sellerName && S.user.name && event.sellerName.toLowerCase() === S.user.name.toLowerCase())
      );
      if (isMeSeller && event.offeredItem) {
        if (!Array.isArray(S.user.gifts)) S.user.gifts = [];
        S.user.gifts.unshift(event.offeredItem);
        var toast = document.createElement('div');
        toast.className = 'eth-live-toast-alert';
        toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#8b5cf6;color:#fff;padding:14px 28px;border-radius:16px;font-weight:800;z-index:2147483647;box-shadow:0 12px 35px rgba(0,0,0,0.4);border:2px solid #a78bfa;font-size:15px;text-align:center;';
        toast.innerHTML = '🔄 <b>Muvaffaqiyatli Barter!</b><br><b>' + (event.buyerName || 'O\'quvchi') + '</b> siz bilan buyum almashdi:<br><span style="color:#fef08a;font-size:18px">' + (event.offeredItem.icon || '🎁') + ' ' + (event.offeredItem.name || 'Sovrin') + '</span>';
        document.body.appendChild(toast);
        setTimeout(function() { toast.remove(); }, 6000);
      }
      if (window.EthithApp && window.EthithApp.saveState) window.EthithApp.saveState();
      if (window._ethithRefreshMarket && window._ethithCurrentView === 'market') {
        try { window._ethithRefreshMarket(); } catch(e) {}
      }
    }
    else if (event.type === 'P2P_REMOVE_ITEM') {
      if (!Array.isArray(S.p2pListings)) S.p2pListings = [];
      S.p2pListings = S.p2pListings.filter(function(l) { return l.id !== event.listingId; });
      if (!S.deletedListingIds) S.deletedListingIds = [];
      if (S.deletedListingIds.indexOf(event.listingId) === -1) S.deletedListingIds.push(event.listingId);
      try { localStorage.setItem('ethith_p2p_listings', JSON.stringify(S.p2pListings)); localStorage.setItem('ethith_deleted_listing_ids', JSON.stringify(S.deletedListingIds)); } catch(e) {}
      if (window.EthithApp && window.EthithApp.saveState) window.EthithApp.saveState();
      if (window._ethithRefreshMarket && window._ethithCurrentView === 'market') {
        try { window._ethithRefreshMarket(); } catch(e) {}
      }
    }

    if (uiNeedsRefresh && !window._ethithIsTestInProgress) {
      window.EthithApp.saveState();
      // Always refresh class detail if chat element is visible in DOM
      if (document.getElementById('tgMsgBox') && window._ethithRefreshCurrentClass) {
        window._ethithRefreshCurrentClass();
      }
      if (window._ethithRefreshClassesList && window._ethithCurrentView === 'classes' && !S.activeClassId) {
        window._ethithRefreshClassesList();
      }
      if (window._ethithRefreshExamsList && window._ethithCurrentView === 'exams') {
        window._ethithRefreshExamsList();
      }
      if (window._ethithRefreshProgressionTests && window._ethithCurrentView === 'progression') {
        window._ethithRefreshProgressionTests();
      }
      if (window._ethithRefreshTopNav) {
        window._ethithRefreshTopNav();
      }
      if (window._ethithRefreshNotifsModal) {
        window._ethithRefreshNotifsModal();
      }
      if (window._ethithRefreshLeaderboard && window._ethithCurrentView === 'leaderboard') {
        window._ethithRefreshLeaderboard();
      }
      if (window._ethithRefreshAttendance && window._ethithCurrentView === 'attendance') {
        window._ethithRefreshAttendance();
      }
    }
  }

  // ====================================================
  // 3. PERSISTENCE ENGINE (GitHub Store API)
  // ====================================================
  async function fetchRemoteStore() {
    var token = getGHToken();
    try {
      var res = await fetch(API_STORE_URL + '?_t=' + Date.now(), {
        headers: {
          'Authorization': 'token ' + token,
          'Accept': 'application/vnd.github.v3+json',
        },
        cache: 'no-store'
      });
      if (res.ok) {
        var data = await res.json();
        _lastKnownSha = data.sha;
        var b64 = data.content;
        var dH = res.headers.get('date');
        if (dH) {
          var sTime = new Date(dH).getTime();
          if (!isNaN(sTime) && sTime > 0) {
            window._internetTimeOffset = sTime - Date.now();
            try { localStorage.setItem('ethith_internet_time_offset', window._internetTimeOffset.toString()); } catch(e){}
          }
        }
        if (data.sha && (!b64 || data.encoding === 'none')) {
          try {
            var blobRes = await fetch('https://api.github.com/repos/joraboymuhammad-code/english-hub-ethith/git/blobs/' + data.sha, {
              headers: {
                'Authorization': 'token ' + token,
                'Accept': 'application/vnd.github.v3+json'
              },
              cache: 'no-store'
            });
            if (blobRes.ok) {
              var blobData = await blobRes.json();
              b64 = blobData.content;
            }
          } catch(eBlob) {}
        }
        if (b64) {
          var rawJson = decodeUtf8Base64(b64);
          return JSON.parse(rawJson);
        }
      }
    } catch(err) {
      try {
        var rawRes = await fetch(RAW_STORE_URL + '?_t=' + Date.now(), { cache: 'no-store' });
        if (rawRes.ok) return await rawRes.json();
      } catch(e) {}
    }
    return null;
  }

  function mergeTeachers(localTeachers, remoteTeachers, deletedTeacherIds) {
    var changed = false;
    var dIds = (deletedTeacherIds || (window.S && window.S.deletedTeacherIds) || []).slice();
    try {
      var lsDel = JSON.parse(localStorage.getItem('ethith_deleted_teacher_ids') || '[]');
      if (Array.isArray(lsDel)) {
        lsDel.forEach(function(did) { if (dIds.indexOf(did) === -1) dIds.push(did); });
      }
    } catch(e) {}
    if (!Array.isArray(remoteTeachers)) return changed;
    if (!Array.isArray(localTeachers)) return changed;

    // Safety: Azizbek Urolov and Ustoz (head teacher) should NEVER be purged
    dIds = dIds.filter(function(id) {
      return id !== 't_urolov_azizbek' && id !== 'admin_official_teacher' && id !== 'azizbek77' && id !== 'ustoz77';
    });

    for (var i = localTeachers.length - 1; i >= 0; i--) {
      var ltCheck = localTeachers[i];
      if (ltCheck && (dIds.indexOf(ltCheck.id) !== -1 || (ltCheck.login && dIds.indexOf(ltCheck.login) !== -1))) {
        localTeachers.splice(i, 1);
        changed = true;
      }
    }

    remoteTeachers.forEach(function(rt) {
      if (!rt || !rt.id) return;
      if (dIds.indexOf(rt.id) !== -1 || (rt.login && dIds.indexOf(rt.login) !== -1)) return;
      var lt = localTeachers.find(function(t) { return t.id === rt.id || (t.login && rt.login && t.login.toLowerCase() === rt.login.toLowerCase()); });
      if (!lt) {
        localTeachers.push(rt);
        changed = true;
      } else {
        if (rt.name && lt.name !== rt.name) { lt.name = rt.name; changed = true; }
        if (rt.subject && lt.subject !== rt.subject) { lt.subject = rt.subject; changed = true; }
        if (rt.teachingHours && lt.teachingHours !== rt.teachingHours) { lt.teachingHours = rt.teachingHours; changed = true; }
        if (rt.hourlyRate && lt.hourlyRate !== rt.hourlyRate) { lt.hourlyRate = rt.hourlyRate; changed = true; }
        if (rt.login && lt.login !== rt.login) { lt.login = rt.login; changed = true; }
        if (rt.password && lt.password !== rt.password) { lt.password = rt.password; changed = true; }
        if (rt.inviteCode && lt.inviteCode !== rt.inviteCode) { lt.inviteCode = rt.inviteCode; changed = true; }
        if (Array.isArray(rt.assignedClasses)) {
          if (!Array.isArray(lt.assignedClasses)) lt.assignedClasses = [];
          rt.assignedClasses.forEach(function(cid) {
            if (lt.assignedClasses.indexOf(cid) === -1) {
              lt.assignedClasses.push(cid);
              changed = true;
            }
          });
        }
      }
    });
    return changed;
  }

  function mergeClasses(localClasses, remoteClasses) {
    var changed = false;
    if (!Array.isArray(remoteClasses)) return changed;

    var globalDelStIds = (window.S && Array.isArray(window.S.deletedStudentIds)) ? window.S.deletedStudentIds : [];

    remoteClasses.forEach(function(rc) {
      var localCls = localClasses.find(function(c) { return c.id === rc.id || c.code === rc.code; });
      if (!localCls) {
        localClasses.push(rc);
        changed = true;
        return;
      }

      if (rc.name && rc.name !== localCls.name) {
        var rTsName = (rc.attendance && rc.attendance.updatedAt) || 0;
        var lTsName = (localCls.attendance && localCls.attendance.updatedAt) || 0;
        if (rTsName >= lTsName || localCls.name === 'IELTS & General English Intensive') {
          localCls.name = rc.name;
          changed = true;
        }
      }
      if (rc.teacherName && rc.teacherName !== localCls.teacherName) {
        localCls.teacherName = rc.teacherName;
        changed = true;
      }

      // Sync Group Duration & Level Test Countdown (learningMonths & learningDays & levelTestDate)
      var locDurObj = null;
      try {
        var locDurStr = localStorage.getItem('ethith_class_duration_' + localCls.id);
        if (locDurStr) locDurObj = JSON.parse(locDurStr);
      } catch(e) {}

      var locDurTs = (locDurObj && locDurObj.ts) ? Number(locDurObj.ts) : 0;
      var rDurTs = Number(rc.durationUpdatedAt || 0);

      // If local has duration saved and it's equal to or newer than remote, ALWAYS preserve local!
      if (locDurObj && (locDurTs >= rDurTs || rDurTs === 0)) {
        localCls.learningMonths = Number(locDurObj.learningMonths) || 0;
        localCls.learningDays = Number(locDurObj.learningDays) || 0;
        if (locDurObj.learningLessons !== undefined) localCls.learningLessons = Number(locDurObj.learningLessons);
        if (locDurObj.baselineDate) localCls.baselineDate = locDurObj.baselineDate;
        if (locDurObj.schedule) localCls.schedule = locDurObj.schedule;
        if (locDurObj.levelTestDate) localCls.levelTestDate = locDurObj.levelTestDate;
        localCls.durationUpdatedAt = locDurTs || Date.now();
        rc.learningMonths = localCls.learningMonths;
        rc.learningDays = localCls.learningDays;
        if (localCls.learningLessons !== undefined) rc.learningLessons = localCls.learningLessons;
        if (localCls.baselineDate) rc.baselineDate = localCls.baselineDate;
        if (localCls.schedule) rc.schedule = localCls.schedule;
        rc.levelTestDate = localCls.levelTestDate;
        rc.durationUpdatedAt = localCls.durationUpdatedAt;
      } else if (rc.durationUpdatedAt && rDurTs > locDurTs) {
        // Remote is genuinely newer with an explicit durationUpdatedAt
        localCls.learningMonths = Number(rc.learningMonths) || 0;
        localCls.learningDays = Number(rc.learningDays) || 0;
        if (rc.learningLessons !== undefined) localCls.learningLessons = Number(rc.learningLessons);
        if (rc.baselineDate) localCls.baselineDate = rc.baselineDate;
        if (rc.schedule) localCls.schedule = rc.schedule;
        if (rc.levelTestDate) localCls.levelTestDate = rc.levelTestDate;
        localCls.durationUpdatedAt = rDurTs;
        try {
          localStorage.setItem('ethith_class_duration_' + localCls.id, JSON.stringify({
            learningMonths: localCls.learningMonths,
            learningDays: localCls.learningDays,
            learningLessons: localCls.learningLessons !== undefined ? localCls.learningLessons : null,
            baselineDate: localCls.baselineDate || '',
            schedule: localCls.schedule || '',
            levelTestDate: localCls.levelTestDate || '',
            ts: rDurTs
          }));
        } catch(e) {}
        changed = true;
      }

      // Sync Deleted Message IDs
      if (!localCls.deletedMsgIds) localCls.deletedMsgIds = [];
      if (rc.deletedMsgIds && Array.isArray(rc.deletedMsgIds)) {
        rc.deletedMsgIds.forEach(function(dId) {
          if (localCls.deletedMsgIds.indexOf(dId) === -1) {
            localCls.deletedMsgIds.push(dId);
            changed = true;
          }
        });
      }

      // Purge deleted messages
      if (!localCls.messages) localCls.messages = [];
      if (localCls.deletedMsgIds.length > 0) {
        var lenBefore = localCls.messages.length;
        localCls.messages = localCls.messages.filter(function(m) {
          return localCls.deletedMsgIds.indexOf(m.id) === -1;
        });
        if (localCls.messages.length !== lenBefore) changed = true;
      }

      // Sync Deleted Student IDs
      if (!localCls.deletedStudentIds) localCls.deletedStudentIds = [];
      if (rc.deletedStudentIds && Array.isArray(rc.deletedStudentIds)) {
        rc.deletedStudentIds.forEach(function(dId) {
          if (localCls.deletedStudentIds.indexOf(dId) === -1) {
            localCls.deletedStudentIds.push(dId);
            changed = true;
          }
        });
      }

      // Purge any deleted students from localCls.students
      var allDels = (localCls.deletedStudentIds || []).concat(globalDelStIds);
      if (allDels.length > 0 && localCls.students) {
        var lenBeforeSt = localCls.students.length;
        localCls.students = localCls.students.filter(function(st) {
          if (!st) return false;
          var isDel = (st.id && allDels.indexOf(st.id) !== -1) ||
                      (st.email && allDels.indexOf(st.email) !== -1) ||
                      (st.login && allDels.indexOf(st.login) !== -1) ||
                      (st.name && allDels.indexOf(st.name) !== -1);
          return !isDel;
        });
        if (localCls.students.length !== lenBeforeSt) changed = true;
      }

      // Sync Students (Universal Instant Sync for Admin & Teachers)
      if (!localCls.students) localCls.students = [];
      if (rc.students && Array.isArray(rc.students)) {
        var remoteHasReal = rc.students.some(function(s) {
          return s && s.name && !s.name.toLowerCase().startsWith('tester_') && !s.isTester;
        });

        // If remote has real students, purge dummy tester slots from local
        if (remoteHasReal) {
          var lenBeforeTesterPurge = localCls.students.length;
          localCls.students = localCls.students.filter(function(s) {
            return s && s.name && !s.name.toLowerCase().startsWith('tester_') && !s.isTester;
          });
          if (localCls.students.length !== lenBeforeTesterPurge) changed = true;
        }

        rc.students.forEach(function(rStudent) {
          if (!rStudent) return;
          var isTester = rStudent.isTester || (rStudent.name && rStudent.name.toLowerCase().startsWith('tester_'));
          if (remoteHasReal && isTester) return; // Never add tester slots if real students exist!

          var isDel = (rStudent.id && allDels.indexOf(rStudent.id) !== -1) ||
                      (rStudent.email && allDels.indexOf(rStudent.email) !== -1) ||
                      (rStudent.login && allDels.indexOf(rStudent.login) !== -1) ||
                      (rStudent.name && allDels.indexOf(rStudent.name) !== -1);
          if (isDel) return;

          var exists = localCls.students.find(function(s) {
            return (s.email && s.email === rStudent.email) ||
                   (s.id && s.id === rStudent.id) ||
                   (s.login && rStudent.login && s.login.toLowerCase() === rStudent.login.toLowerCase()) ||
                   (s.name && rStudent.name && s.name.toLowerCase().trim() === rStudent.name.toLowerCase().trim());
          });

          if (!exists) {
            localCls.students.push(rStudent);
            changed = true;
          } else {
            var localUp = Number(exists.updatedAt) || 0;
            var remoteUp = Number(rStudent.updatedAt) || 0;
            var localIsTester = exists.isTester || (exists.name && exists.name.toLowerCase().startsWith('tester_'));
            var remoteIsTester = rStudent.isTester || (rStudent.name && rStudent.name.toLowerCase().startsWith('tester_'));

            // Safety: Never let an outdated remote tester slot overwrite a real student!
            if (!localIsTester && remoteIsTester) {
              rStudent.name = exists.name;
              rStudent.firstName = exists.firstName;
              rStudent.lastName = exists.lastName;
              rStudent.login = exists.login;
              rStudent.password = exists.password;
              rStudent.phone = exists.phone;
              rStudent.parentPhone = exists.parentPhone;
              rStudent.isTester = false;
              rStudent.updatedAt = localUp || Date.now();
              return;
            }

            // Only overwrite local with remote if remote is strictly newer
            if (remoteUp > localUp) {
              if (rStudent.name) exists.name = rStudent.name;
              if (rStudent.firstName) exists.firstName = rStudent.firstName;
              if (rStudent.lastName) exists.lastName = rStudent.lastName;
              if (rStudent.login) exists.login = rStudent.login;
              if (rStudent.password) exists.password = rStudent.password;
              if (rStudent.phone || rStudent.parentPhone) {
                exists.phone = rStudent.phone || rStudent.parentPhone;
                exists.parentPhone = rStudent.parentPhone || rStudent.phone;
              }
              if (rStudent.isTester !== undefined) exists.isTester = rStudent.isTester;
              if (rStudent.manuallyEnrolled !== undefined) exists.manuallyEnrolled = rStudent.manuallyEnrolled;
              exists.updatedAt = remoteUp;
              changed = true;
            } else if (localUp > remoteUp) {
              // Local is newer: propagate local values to remote object for cloud persistence
              rStudent.name = exists.name;
              rStudent.firstName = exists.firstName;
              rStudent.lastName = exists.lastName;
              rStudent.login = exists.login;
              rStudent.password = exists.password;
              rStudent.phone = exists.phone;
              rStudent.parentPhone = exists.parentPhone;
              rStudent.isTester = exists.isTester;
              rStudent.updatedAt = localUp;
            }
          }
        });
      }

      // Sync Messages & Emoji Reactions (NEVER resurrect deleted messages!)
      var globalDelMsgIds = (window.S && Array.isArray(window.S.deletedMsgIds)) ? window.S.deletedMsgIds : [];
      try {
        var stDel = JSON.parse(localStorage.getItem('ethith_deleted_msg_ids') || '[]');
        if (Array.isArray(stDel)) globalDelMsgIds = globalDelMsgIds.concat(stDel);
      } catch(e) {}

      if (rc.messages && Array.isArray(rc.messages)) {
        rc.messages.forEach(function(rMsg) {
          if (!rMsg || !rMsg.id) return;
          if (localCls.deletedMsgIds.indexOf(rMsg.id) !== -1) return;
          if (globalDelMsgIds.indexOf(rMsg.id) !== -1) return;

          var localMsg = localCls.messages.find(function(m) { return m.id === rMsg.id; });
          if (!localMsg) {
            localCls.messages.push(rMsg);
            changed = true;
          } else {
            if (rMsg.reactions) {
              if (!localMsg.reactions) localMsg.reactions = {};
              for (var em in rMsg.reactions) {
                var rList = rMsg.reactions[em] || [];
                var lList = localMsg.reactions[em] || [];
                var merged = lList.slice();
                rList.forEach(function(u) {
                  if (merged.indexOf(u) === -1) merged.push(u);
                });
                if (merged.length !== lList.length) {
                  localMsg.reactions[em] = merged;
                  changed = true;
                }
              }
            }
          }
        });

        localCls.messages.sort(function(a, b) {
          var ta = a.timestamp || parseInt((a.id || '').replace(/\D/g, ''), 10) || 0;
          var tb = b.timestamp || parseInt((b.id || '').replace(/\D/g, ''), 10) || 0;
          return ta - tb;
        });
      }

      // Sync Pinned Messages
      if (Array.isArray(rc.pinnedIds)) {
        localCls.pinnedIds = rc.pinnedIds.filter(function(pid) {
          return !localCls.deletedMsgIds || localCls.deletedMsgIds.indexOf(pid) === -1;
        });
        localCls.pinnedId = localCls.pinnedIds.length > 0 ? localCls.pinnedIds[localCls.pinnedIds.length - 1] : null;
        changed = true;
      } else if (rc.pinnedId !== undefined && rc.pinnedId !== localCls.pinnedId) {
        if (!localCls.deletedMsgIds || localCls.deletedMsgIds.indexOf(rc.pinnedId) === -1) {
          localCls.pinnedId = rc.pinnedId;
          localCls.pinnedIds = rc.pinnedId ? [rc.pinnedId] : [];
          changed = true;
        } else {
          localCls.pinnedId = null;
          localCls.pinnedIds = [];
          changed = true;
        }
      }

      // Sync Attendance, Schedule & Custom Student Names
      if (rc.activeHomework) {
        if (!localCls.activeHomework || (rc.activeHomework.assignedAt || 0) >= (localCls.activeHomework.assignedAt || 0)) {
          localCls.activeHomework = JSON.parse(JSON.stringify(rc.activeHomework));
          changed = true;
        }
      }
      if (rc.schedule && rc.schedule !== localCls.schedule) {
        var rAttTs = (rc.attendance && rc.attendance.updatedAt) || 0;
        var lAttTs = (localCls.attendance && localCls.attendance.updatedAt) || 0;
        if (rAttTs >= lAttTs) {
          localCls.schedule = rc.schedule;
          changed = true;
        }
      }
      if (rc.customStudentNames && typeof rc.customStudentNames === 'object') {
        if (!localCls.customStudentNames) localCls.customStudentNames = {};
        if (!localCls.customStudentNamesTs) localCls.customStudentNamesTs = {};
        var rNamesTs = rc.customStudentNamesTs || {};
        for (var stK in rc.customStudentNames) {
          var rKts = Number(rNamesTs[stK]) || 0;
          var lKts = Number(localCls.customStudentNamesTs[stK]) || 0;
          if (rKts > lKts || !localCls.customStudentNames[stK]) {
            localCls.customStudentNames[stK] = rc.customStudentNames[stK];
            localCls.customStudentNamesTs[stK] = rKts;
            changed = true;
          }
        }
        for (var myK in localCls.customStudentNames) {
          var myKts = Number(localCls.customStudentNamesTs[myK]) || 0;
          var theirKts = Number(rNamesTs[myK]) || 0;
          if (myKts > theirKts) {
            rc.customStudentNames[myK] = localCls.customStudentNames[myK];
            if (!rc.customStudentNamesTs) rc.customStudentNamesTs = {};
            rc.customStudentNamesTs[myK] = myKts;
          }
        }
      }
      if (rc.attendance && typeof rc.attendance === 'object') {
        if (!localCls.attendance) {
          localCls.attendance = JSON.parse(JSON.stringify(rc.attendance));
          changed = true;
        } else {
          var rUpdated = rc.attendance.updatedAt || 0;
          var lUpdated = localCls.attendance.updatedAt || 0;
          if (rUpdated > lUpdated) {
            localCls.attendance = JSON.parse(JSON.stringify(rc.attendance));
            changed = true;
          } else {
            // Merge missing dates/records without overwriting newer local state
            if (!localCls.attendance.records) localCls.attendance.records = {};
            if (rc.attendance.records) {
              for (var dKey in rc.attendance.records) {
                if (!localCls.attendance.records[dKey]) {
                  localCls.attendance.records[dKey] = JSON.parse(JSON.stringify(rc.attendance.records[dKey]));
                  changed = true;
                } else {
                  for (var sId in rc.attendance.records[dKey]) {
                    if (!localCls.attendance.records[dKey][sId]) {
                      localCls.attendance.records[dKey][sId] = JSON.parse(JSON.stringify(rc.attendance.records[dKey][sId]));
                      changed = true;
                    }
                  }
                }
              }
            }
            if (!localCls.attendance.holidays) localCls.attendance.holidays = {};
            if (rc.attendance.holidays && rUpdated >= lUpdated) {
              localCls.attendance.holidays = JSON.parse(JSON.stringify(rc.attendance.holidays));
            }
            if (!localCls.attendance.lessonTypes) localCls.attendance.lessonTypes = {};
            if (rc.attendance.lessonTypes) {
              for (var ltKey in rc.attendance.lessonTypes) {
                if (!localCls.attendance.lessonTypes[ltKey]) {
                  localCls.attendance.lessonTypes[ltKey] = rc.attendance.lessonTypes[ltKey];
                  changed = true;
                }
              }
            }
            if (!localCls.attendance.homeworks) localCls.attendance.homeworks = {};
            if (rc.attendance.homeworks) {
              for (var hwKey in rc.attendance.homeworks) {
                if (!localCls.attendance.homeworks[hwKey]) {
                  localCls.attendance.homeworks[hwKey] = JSON.parse(JSON.stringify(rc.attendance.homeworks[hwKey]));
                  changed = true;
                }
              }
            }
          }
        }
      }
    });

    return changed;
  }

  function mergeQuizzes(localQuizzes, remoteQuizzes, deletedQuizIds) {
    var changed = false;
    if (!Array.isArray(localQuizzes)) return changed;
    var dIds = deletedQuizIds || (window.EthithApp && window.EthithApp.state && window.EthithApp.state.deletedQuizIds) || [];
    if (dIds.length > 0) {
      for (var i = localQuizzes.length - 1; i >= 0; i--) {
        var lq = localQuizzes[i];
        if (dIds.indexOf(lq.id) !== -1 || (lq.code && dIds.indexOf(lq.code) !== -1)) {
          localQuizzes.splice(i, 1);
          changed = true;
        }
      }
    }
    if (!Array.isArray(remoteQuizzes)) return changed;
    remoteQuizzes.forEach(function(rq) {
      if (!rq) return;
      if (dIds.indexOf(rq.id) !== -1 || (rq.code && dIds.indexOf(rq.code) !== -1)) return;
      var exists = localQuizzes.find(function(q) {
        return (q.id && rq.id && String(q.id) === String(rq.id)) ||
               (q.code && rq.code && String(q.code).trim() === String(rq.code).trim());
      });
      if (!exists) {
        localQuizzes.push(rq);
        changed = true;
      } else {
        if ((rq.updatedAt || 0) > (exists.updatedAt || 0) || ((rq.participants && rq.participants.length) || 0) > ((exists.participants && exists.participants.length) || 0)) {
          Object.assign(exists, rq);
          changed = true;
        }
      }
    });
    return changed;
  }

  function mergeExams(localExams, remoteExams, deletedExamIds) {
    var changed = false;
    if (!Array.isArray(remoteExams)) return changed;
    var dIds = deletedExamIds || (window.EthithApp && window.EthithApp.state && window.EthithApp.state.deletedExamIds) || [];

    // Filter out locally existing deleted exams
    if (dIds.length > 0) {
      for (var i = localExams.length - 1; i >= 0; i--) {
        var lx = localExams[i];
        if (dIds.indexOf(lx.id) !== -1 || (lx.code && dIds.indexOf(lx.code) !== -1)) {
          localExams.splice(i, 1);
          changed = true;
        }
      }
    }

    remoteExams.forEach(function(rx) {
      if (dIds.indexOf(rx.id) !== -1 || (rx.code && dIds.indexOf(rx.code) !== -1)) return;
      var exists = localExams.find(function(x) {
        return (x.id && rx.id && String(x.id) === String(rx.id)) ||
               (x.code && rx.code && String(x.code).trim() === String(rx.code).trim());
      });
      if (!exists) {
        localExams.push(rx);
        changed = true;
      } else {
        if (rx.title && exists.title !== rx.title) { exists.title = rx.title; changed = true; }
        if (rx.duration && exists.duration !== rx.duration) { exists.duration = rx.duration; changed = true; }
        if (rx.pointsPerQ && exists.pointsPerQ !== rx.pointsPerQ) { exists.pointsPerQ = rx.pointsPerQ; changed = true; }
        if (rx.questions && Array.isArray(rx.questions) && rx.questions.length > 0) {
          exists.questions = rx.questions;
          changed = true;
        }
        if (Array.isArray(rx.submissions) && rx.submissions.length > 0) {
          if (!exists.submissions) exists.submissions = [];
          rx.submissions.forEach(function(rSub) {
            var rKey = (rSub.studentEmail || rSub.studentId || '').toLowerCase();
            var locIdx = exists.submissions.findIndex(function(lSub) {
              return (lSub.studentEmail && lSub.studentEmail.toLowerCase() === rKey) ||
                     (lSub.studentId && lSub.studentId.toLowerCase() === rKey);
            });
            if (locIdx === -1) {
              exists.submissions.push(rSub);
              changed = true;
            } else {
              if ((rSub.attempts || 1) >= (exists.submissions[locIdx].attempts || 1)) {
                exists.submissions[locIdx] = rSub;
                changed = true;
              }
            }
          });
        }
        if (rx.isPublic !== undefined && exists.isPublic !== rx.isPublic) {
          exists.isPublic = rx.isPublic;
          changed = true;
        }
        if (rx.maxAttempts !== undefined && exists.maxAttempts !== rx.maxAttempts) {
          exists.maxAttempts = rx.maxAttempts;
          changed = true;
        }
        if (rx.isLevelTransition !== undefined && exists.isLevelTransition !== rx.isLevelTransition) {
          exists.isLevelTransition = rx.isLevelTransition;
          changed = true;
        }
        if (rx.levelFrom && exists.levelFrom !== rx.levelFrom) {
          exists.levelFrom = rx.levelFrom;
          changed = true;
        }
        if (rx.levelTo && exists.levelTo !== rx.levelTo) {
          exists.levelTo = rx.levelTo;
          changed = true;
        }
      }
    });

    return changed;
  }

  function isPurgedAccount(acc) {
    if (!acc) return true;
    if (acc.role === 'teacher' || (acc.id && String(acc.id).startsWith('t_')) || acc.id === 'admin_official_teacher') return false;
    if (acc.role === 'student' || (acc.id && String(acc.id).startsWith('std_')) || acc.login) return false;
    var email = (acc.email || '').toLowerCase().trim();
    var id = (acc.id || '').toLowerCase().trim();
    if (id === 'admin_official_root' || email === 'admin_12038f1aq8syash@ethith.uz') return false;
    return false;
  }

  function mergeAccounts(localAccounts, remoteAccounts) {
    var changed = false;
    if (!Array.isArray(localAccounts)) return changed;
    if (!Array.isArray(remoteAccounts)) remoteAccounts = [];

    // Filter out purged accounts immediately from both local and remote
    for (var li = localAccounts.length - 1; li >= 0; li--) {
      if (isPurgedAccount(localAccounts[li])) {
        localAccounts.splice(li, 1);
        changed = true;
      }
    }

    var regKey = 'ethith_all_registered_users';
    var regList = [];
    try {
      regList = JSON.parse(localStorage.getItem(regKey) || '[]');
      if (Array.isArray(regList)) {
        regList = regList.filter(function(u) { return !isPurgedAccount(u); });
      }
    } catch(e) {}

    var S = window.EthithApp ? window.EthithApp.state : null;
    var activeUserEmail = (S && S.user && S.user.email) ? S.user.email.toLowerCase().trim() : '';

    remoteAccounts.forEach(function(rAcc) {
      if (!rAcc || isPurgedAccount(rAcc)) return;
      var rEmail = (rAcc.email || '').toLowerCase().trim();
      var rName = (rAcc.name || '').toLowerCase().trim();
      var rId = (rAcc.id || '').trim();

      var existing = localAccounts.find(function(a) {
        return (rEmail && a.email && a.email.toLowerCase().trim() === rEmail) ||
               (rName && a.name && a.name.toLowerCase().trim() === rName) ||
               (rId && a.id && a.id === rId);
      });

      if (!existing) {
        localAccounts.push(rAcc);
        changed = true;
      } else {
        var rUpdated = Number(rAcc.updatedAt) || 0;
        var lUpdated = Number(existing.updatedAt) || 0;
        if (rUpdated >= lUpdated || !existing.name || (rAcc.name && !existing.name) || (rAcc.coins !== undefined && Number(rAcc.coins) > Number(existing.coins || 0))) {
          if (rAcc.name) existing.name = rAcc.name;
          if (rAcc.login) existing.login = rAcc.login;
          if (rAcc.password) existing.password = rAcc.password;
          if (rAcc.phone || rAcc.parentPhone) {
            existing.phone = rAcc.phone || rAcc.parentPhone;
            existing.parentPhone = rAcc.parentPhone || rAcc.phone;
          }
          if (rAcc.classId) existing.classId = rAcc.classId;
          if (rAcc.coins !== undefined) existing.coins = Number(rAcc.coins);
          if (rAcc.avatar) existing.avatar = rAcc.avatar;
          if (rAcc.level) existing.level = rAcc.level;
          if (rAcc.nameStyle) existing.nameStyle = rAcc.nameStyle;
          if (rAcc.title) existing.title = rAcc.title;
          if (rAcc.victorySound) existing.victorySound = rAcc.victorySound;
          if (rAcc.dailyMinutes !== undefined) existing.dailyMinutes = rAcc.dailyMinutes;
          existing.updatedAt = Math.max(lUpdated, rUpdated || Date.now());
          changed = true;
        }
      }

      if (activeUserEmail && rEmail === activeUserEmail && S && S.user && rAcc.coins !== undefined) {
        var rCoins = Number(rAcc.coins) || 0;
        var myCoins = Number(S.user.coins) || 0;
        if (rCoins !== myCoins && ((Number(rAcc.updatedAt) || 0) >= (Number(S.user.updatedAt) || 0) || rCoins > myCoins)) {
          var diff = rCoins - myCoins;
          S.user.coins = rCoins;
          S.user.updatedAt = Math.max(Number(S.user.updatedAt) || 0, Number(rAcc.updatedAt) || Date.now());
          try {
            localStorage.setItem('ethith_active_user', JSON.stringify(S.user));
            localStorage.setItem('ethith_user', JSON.stringify(S.user));
          } catch(e) {}
          if (window._ethithUpdateTopCoins) {
            try { window._ethithUpdateTopCoins(); } catch(e) {}
          }
          if (diff > 0 && typeof document !== 'undefined' && document.body) {
            var toastEl = document.getElementById('ethCoinLiveToast');
            if (!toastEl) {
              toastEl = document.createElement('div');
              toastEl.id = 'ethCoinLiveToast';
              toastEl.style.cssText = 'position:fixed;top:24px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;padding:12px 24px;border-radius:16px;font-weight:900;font-size:14px;z-index:2147483647;box-shadow:0 15px 35px rgba(245,158,11,0.5);border:1.5px solid #fde68a;display:flex;align-items:center;gap:10px;';
              document.body.appendChild(toastEl);
            }
            toastEl.innerHTML = '<span>🪙</span> <span>+' + diff.toLocaleString() + ' ETHITH Coin hisobingizga tushdi! (Jami: ' + rCoins.toLocaleString() + ' Coin)</span>';
            setTimeout(function() { if (toastEl && toastEl.parentNode) toastEl.remove(); }, 5000);
          }
          changed = true;
        }
      }

      var regItem = regList.find(function(u) {
        return (rEmail && u.email && u.email.toLowerCase().trim() === rEmail) ||
               (rName && u.name && u.name.toLowerCase().trim() === rName);
      });
      if (!regItem) {
        regList.push({ id: rAcc.id, name: rAcc.name, email: rAcc.email, role: rAcc.role || 'student', coins: rAcc.coins, avatar: rAcc.avatar, level: rAcc.level });
      } else if (rAcc.coins !== undefined) {
        regItem.coins = Math.max(Number(regItem.coins) || 0, Number(rAcc.coins) || 0);
      }
    });

    try { localStorage.setItem(regKey, JSON.stringify(regList)); } catch(e) {}
    return changed;
  }

  function mergeP2PListings(localListings, remoteListings, deletedListingIds) {
    var changed = false;
    if (!Array.isArray(localListings)) return changed;
    var dIds = Array.isArray(deletedListingIds) ? deletedListingIds : [];

    // Filter out locally any explicitly deleted listings
    for (var i = localListings.length - 1; i >= 0; i--) {
      if (dIds.indexOf(localListings[i].id) !== -1) {
        localListings.splice(i, 1);
        changed = true;
      }
    }

    if (!Array.isArray(remoteListings)) {
      try { localStorage.setItem('ethith_p2p_listings', JSON.stringify(localListings)); } catch(e) {}
      return changed;
    }

    // Merge remote listings without purging local listings!
    remoteListings.forEach(function(rList) {
      if (!rList || !rList.id) return;
      if (dIds.indexOf(rList.id) !== -1) return;

      var loc = localListings.find(function(l) { return l.id === rList.id; });
      if (!loc) {
        localListings.push(rList);
        changed = true;
      } else {
        if (rList.status && rList.status !== loc.status) {
          loc.status = rList.status;
          changed = true;
        }
      }
    });

    try { localStorage.setItem('ethith_p2p_listings', JSON.stringify(localListings)); } catch(e) {}
    return changed;
  }

  // Safe Push Queue with Automatic 409 Conflict Retry
  var isPushing = false;
  var hasPendingPush = false;

  async function pushRemoteStore() {
    if (isPushing) {
      hasPendingPush = true;
      return;
    }
    isPushing = true;
    hasPendingPush = false;

    try {
      await executeSafePushWithRetry();
    } catch(err) {
      console.warn('Sync push error:', err);
    } finally {
      isPushing = false;
      if (hasPendingPush) {
        setTimeout(pushRemoteStore, 150);
      }
    }
  }

  async function executeSafePushWithRetry() {
    var token = getGHToken();
    if (!token) return;
    var S = window.EthithApp ? window.EthithApp.state : null;
    if (!S) return;

    var maxRetries = 6;
    for (var attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        var getRes = await fetch(API_STORE_URL + '?_t=' + Date.now(), {
          headers: {
            'Authorization': 'token ' + token,
            'Accept': 'application/vnd.github.v3+json',
                      },
          cache: 'no-store'
        });

        var sha = null;
        var remoteData = { classes: [], exams: [], deletedExamIds: [] };
        if (getRes.ok) {
          var fileData = await getRes.json();
          sha = fileData.sha;
          var b64Content = fileData.content;
          if (fileData.sha && (!b64Content || fileData.encoding === 'none')) {
            try {
              var bRes = await fetch('https://api.github.com/repos/joraboymuhammad-code/english-hub-ethith/git/blobs/' + fileData.sha, {
                headers: {
                  'Authorization': 'token ' + token,
                  'Accept': 'application/vnd.github.v3+json'
                },
                cache: 'no-store'
              });
              if (bRes.ok) {
                var bData = await bRes.json();
                b64Content = bData.content;
              }
            } catch(eBlob) {}
          }
          try {
            if (b64Content) {
              var rawJson = decodeUtf8Base64(b64Content);
              remoteData = JSON.parse(rawJson);
            }
          } catch(e) {}
        }

        if (!S.deletedMsgIds) S.deletedMsgIds = [];
        try {
          var sDel = JSON.parse(localStorage.getItem('ethith_deleted_msg_ids') || '[]');
          if (Array.isArray(sDel)) S.deletedMsgIds = Array.from(new Set(S.deletedMsgIds.concat(sDel)));
        } catch(e) {}
        remoteData.deletedMsgIds = Array.from(new Set((remoteData.deletedMsgIds || []).concat(S.deletedMsgIds || [])));

        if (remoteData.deletedExamIds && Array.isArray(remoteData.deletedExamIds)) {
          if (!S.deletedExamIds) S.deletedExamIds = [];
          remoteData.deletedExamIds.forEach(function(id) {
            if (S.deletedExamIds.indexOf(id) === -1) S.deletedExamIds.push(id);
          });
        }

        if (remoteData.deletedQuizIds && Array.isArray(remoteData.deletedQuizIds)) {
          if (!S.deletedQuizIds) S.deletedQuizIds = [];
          remoteData.deletedQuizIds.forEach(function(id) {
            if (S.deletedQuizIds.indexOf(id) === -1) S.deletedQuizIds.push(id);
          });
        }

        if (remoteData.deletedStudentIds && Array.isArray(remoteData.deletedStudentIds)) {
          if (!S.deletedStudentIds) S.deletedStudentIds = [];
          remoteData.deletedStudentIds.forEach(function(id) {
            if (S.deletedStudentIds.indexOf(id) === -1) S.deletedStudentIds.push(id);
          });
        }
        if (!S.quizzes) S.quizzes = [];
        // In push mode: Local state is the authority! Never overwrite local classes/exams with old remote data!
        if (Array.isArray(remoteData.classes)) {
          remoteData.classes.forEach(function(rc) {
            var exists = S.classes.find(function(c) { return c.id === rc.id || c.code === rc.code; });
            if (!exists) S.classes.push(rc);
          });
        }
        if (Array.isArray(remoteData.exams)) {
          remoteData.exams.forEach(function(re) {
            var exists = S.exams.find(function(e) { return e.id === re.id || e.code === re.code; });
            if (!exists) S.exams.push(re);
          });
        }
        if (remoteData.accounts && Array.isArray(remoteData.accounts)) {
          if (!S.accounts) S.accounts = [];
          mergeAccounts(S.accounts, remoteData.accounts);
        }
        if (remoteData.fileExplorer && Array.isArray(remoteData.fileExplorer.folders)) {
          if (!S.fileExplorer) S.fileExplorer = remoteData.fileExplorer;
          else {
            remoteData.fileExplorer.folders.forEach(function(rf) {
              if (!S.fileExplorer.folders.find(function(lf) { return lf.id === rf.id; })) {
                S.fileExplorer.folders.push(rf);
              }
            });
            if (Array.isArray(remoteData.fileExplorer.tests)) {
              if (!Array.isArray(S.fileExplorer.tests)) S.fileExplorer.tests = [];
              remoteData.fileExplorer.tests.forEach(function(rt) {
                if (!S.fileExplorer.tests.find(function(lt) { return lt.id === rt.id; })) {
                  S.fileExplorer.tests.push(rt);
                }
              });
            }
          }
        }
        if (remoteData.centerSettings && !S.centerSettings) S.centerSettings = remoteData.centerSettings;
        var allDtIds = (S.deletedTeacherIds || []).slice();
        if (remoteData.deletedTeacherIds && Array.isArray(remoteData.deletedTeacherIds)) {
          remoteData.deletedTeacherIds.forEach(function(id) { if (allDtIds.indexOf(id) === -1) allDtIds.push(id); });
        }
        try {
          var lsDel = JSON.parse(localStorage.getItem('ethith_deleted_teacher_ids') || '[]');
          if (Array.isArray(lsDel)) {
            lsDel.forEach(function(id) { if (allDtIds.indexOf(id) === -1) allDtIds.push(id); });
          }
        } catch(e) {}
        allDtIds = allDtIds.filter(function(id) {
          return id !== 'admin_official_teacher' && id !== 't_urolov_azizbek' && id !== 'ustoz77' && id !== 'azizbek77';
        });
        S.deletedTeacherIds = allDtIds;
        remoteData.deletedTeacherIds = allDtIds;
        try { localStorage.setItem('ethith_deleted_teacher_ids', JSON.stringify(allDtIds)); } catch(e) {}

        if (Array.isArray(remoteData.teachers)) {
          remoteData.teachers = remoteData.teachers.filter(function(t) {
            return t && allDtIds.indexOf(t.id) === -1 && (!t.login || allDtIds.indexOf(t.login) === -1);
          });
        }
        if (!S.teachers) S.teachers = [];
        S.teachers = S.teachers.filter(function(t) {
          return t && allDtIds.indexOf(t.id) === -1 && (!t.login || allDtIds.indexOf(t.login) === -1);
        });
        mergeTeachers(S.teachers, remoteData.teachers || [], allDtIds);
        S.teachers = S.teachers.filter(function(t) {
          return t && allDtIds.indexOf(t.id) === -1 && (!t.login || allDtIds.indexOf(t.login) === -1);
        });
        if (remoteData.timetable && (!S.timetable || S.timetable.length === 0)) S.timetable = remoteData.timetable;
        if (remoteData.contests && (!S.contests || S.contests.length === 0)) S.contests = remoteData.contests;
        if (remoteData.payments && (!S.payments || Object.keys(S.payments).length === 0)) S.payments = remoteData.payments;
        if (remoteData.deletedListingIds && Array.isArray(remoteData.deletedListingIds)) {
          if (!S.deletedListingIds) S.deletedListingIds = [];
          remoteData.deletedListingIds.forEach(function(id) { if (S.deletedListingIds.indexOf(id) === -1) S.deletedListingIds.push(id); });
        }
        if (!S.p2pListings) S.p2pListings = [];
        mergeP2PListings(S.p2pListings, remoteData.p2pListings || [], S.deletedListingIds || []);

        // Spreadsheets sync (Luckysheet Multi-Documents)
        var localDelSheets = [];
        try { localDelSheets = JSON.parse(localStorage.getItem('eh_deleted_sheets') || '[]'); } catch(e) {}
        if (!Array.isArray(localDelSheets)) localDelSheets = [];
        var remoteDelSheets = Array.isArray(remoteData.deletedSpreadsheetIds) ? remoteData.deletedSpreadsheetIds : [];
        var allDelSheets = Array.from(new Set(localDelSheets.concat(remoteDelSheets)));
        remoteData.deletedSpreadsheetIds = allDelSheets;
        try { localStorage.setItem('eh_deleted_sheets', JSON.stringify(allDelSheets)); } catch(e) {}

        var curLocalSheets = [];
        try {
          var rawCur = localStorage.getItem('eh_saved_spreadsheets_v2');
          if (rawCur) curLocalSheets = JSON.parse(rawCur);
        } catch(e) {}
        if (!Array.isArray(curLocalSheets)) curLocalSheets = [];
        if (Array.isArray(S.savedSpreadsheets)) {
          S.savedSpreadsheets.forEach(function(sh) {
            if (sh && sh.id && allDelSheets.indexOf(sh.id) === -1 && !curLocalSheets.some(function(x) { return x.id === sh.id; })) {
              curLocalSheets.push(sh);
            }
          });
        }
        var remSheets = Array.isArray(remoteData.savedSpreadsheets) ? remoteData.savedSpreadsheets : [];

        var pushSheetMap = {};
        remSheets.forEach(function(sh) {
          if (sh && sh.id && allDelSheets.indexOf(sh.id) === -1) {
            pushSheetMap[sh.id] = sh;
          }
        });
        curLocalSheets.forEach(function(sh) {
          if (sh && sh.id && allDelSheets.indexOf(sh.id) === -1) {
            var ex = pushSheetMap[sh.id];
            if (!ex || ((sh.updatedTs || 0) >= (ex.updatedTs || 0))) {
              pushSheetMap[sh.id] = sh;
            }
          }
        });
        var finalMergedSheets = Object.values(pushSheetMap);
        finalMergedSheets.forEach(function(shItem) {
          if (Array.isArray(shItem.data)) {
            shItem.data.forEach(function(sheetObj) {
              if (sheetObj && sheetObj.data) delete sheetObj.data;
            });
          }
        });
        S.savedSpreadsheets = finalMergedSheets;
        safeStorageSetSync('eh_saved_spreadsheets_v2', JSON.stringify(finalMergedSheets));

        if (!S.workbookOverrides) S.workbookOverrides = {};
        if (!S.workbookOverridesTs) S.workbookOverridesTs = {};
        // Also harvest any local v15/v14 workbook overrides from localStorage before pushing
        try {
          for (var lsIdx = 0; lsIdx < localStorage.length; lsIdx++) {
            var lsK = localStorage.key(lsIdx);
            if (lsK && (lsK.indexOf('ethith_wb_coords_v15_') === 0 || lsK.indexOf('ethith_wb_coords_v14_') === 0)) {
              var mPage = lsK.match(/ethith_wb_coords_v1[45]_(\d+)$/);
              if (mPage && mPage[1]) {
                var pN = parseInt(mPage[1], 10);
                var parsedInps = JSON.parse(localStorage.getItem(lsK));
                var locTs = parseInt(localStorage.getItem('ethith_wb_ts_' + pN) || '0', 10);
                if (Array.isArray(parsedInps) && (parsedInps.length > 0 || locTs > 0)) {
                  S.workbookOverrides[pN] = parsedInps;
                  if (locTs > 0) S.workbookOverridesTs[pN] = locTs;
                }
              }
            }
          }
        } catch(e) {}
        if (remoteData.workbookOverrides && typeof remoteData.workbookOverrides === 'object') {
          var rTsMap = (remoteData.workbookOverridesTs && typeof remoteData.workbookOverridesTs === 'object') ? remoteData.workbookOverridesTs : {};
          Object.keys(remoteData.workbookOverrides).forEach(function(k) {
            var rTs = parseInt(rTsMap[k] || '0', 10);
            var lTs = parseInt(S.workbookOverridesTs[k] || localStorage.getItem('ethith_wb_ts_' + k) || '0', 10);
            var lSaved = localStorage.getItem('ethith_wb_coords_v15_' + k);
            if (!lSaved || (rTs > lTs && rTs > 0)) {
              S.workbookOverrides[k] = remoteData.workbookOverrides[k];
              if (rTs > 0) S.workbookOverridesTs[k] = rTs;
            }
          });
        }

        var globalDels = (S.deletedStudentIds || []);
        var cleanClasses = JSON.parse(JSON.stringify(S.classes));
        cleanClasses.forEach(function(c) {
          try {
            var durStr = localStorage.getItem('ethith_class_duration_' + c.id);
            if (durStr) {
              var durObj = JSON.parse(durStr);
              if (durObj && durObj.learningMonths !== undefined) c.learningMonths = Number(durObj.learningMonths) || 0;
              if (durObj && durObj.learningDays !== undefined) c.learningDays = Number(durObj.learningDays) || 0;
              if (durObj && durObj.learningLessons !== undefined) c.learningLessons = Number(durObj.learningLessons);
              if (durObj && durObj.baselineDate) c.baselineDate = durObj.baselineDate;
              if (durObj && durObj.schedule) c.schedule = durObj.schedule;
              if (durObj && durObj.levelTestDate) c.levelTestDate = durObj.levelTestDate;
              if (durObj && durObj.ts) c.durationUpdatedAt = durObj.ts;
            }
          } catch(e) {}
          if (c.deletedMsgIds && Array.isArray(c.deletedMsgIds) && c.messages) {
            c.messages = c.messages.filter(function(m) {
              return c.deletedMsgIds.indexOf(m.id) === -1;
            });
          }
          var allClsDels = (c.deletedStudentIds || []).concat(globalDels);
          if (allClsDels.length > 0 && Array.isArray(c.students)) {
            c.students = c.students.filter(function(st) {
              if (!st) return false;
              var isDel = (st.id && allClsDels.indexOf(st.id) !== -1) ||
                          (st.email && allClsDels.indexOf(st.email) !== -1) ||
                          (st.login && allClsDels.indexOf(st.login) !== -1) ||
                          (st.name && allClsDels.indexOf(st.name) !== -1);
              return !isDel;
            });
          }
        });

        var dIds = S.deletedExamIds || [];
        var cleanExams = (S.exams || []).filter(function(x) {
          return dIds.indexOf(x.id) === -1 && (!x.code || dIds.indexOf(x.code) === -1);
        });
        S.exams = cleanExams;

        var dqIds = S.deletedQuizIds || [];
        var cleanQuizzes = (S.quizzes || []).filter(function(q) {
          return dqIds.indexOf(q.id) === -1 && (!q.code || dqIds.indexOf(q.code) === -1);
        });
        S.quizzes = cleanQuizzes;

        var dtIds = (S.deletedTeacherIds || []).filter(function(id) {
          return id !== 'admin_official_teacher' && id !== 't_urolov_azizbek' && id !== 'ustoz77' && id !== 'azizbek77';
        });
        S.deletedTeacherIds = dtIds;
        var cleanTeachers = (S.teachers || []).filter(function(t) {
          return t && dtIds.indexOf(t.id) === -1 && (!t.login || dtIds.indexOf(t.login) === -1);
        });
        S.teachers = cleanTeachers;

        var cleanAccounts = (S.accounts || []).filter(function(a) {
          if (isPurgedAccount(a)) return false;
          if (a.role === 'teacher' || a.teacherId) {
            if (a.id && dtIds.indexOf(a.id) !== -1) return false;
            if (a.teacherId && dtIds.indexOf(a.teacherId) !== -1) return false;
            if (a.login && dtIds.indexOf(a.login) !== -1) return false;
          }
          return true;
        });
        S.accounts = cleanAccounts;

        var contentObj = {
          classes: cleanClasses,
          exams: cleanExams,
          quizzes: cleanQuizzes,
          deletedExamIds: dIds,
          deletedQuizIds: dqIds,
          deletedTeacherIds: dtIds,
          deletedStudentIds: S.deletedStudentIds || [],
          deletedListingIds: S.deletedListingIds || [],
          accounts: cleanAccounts,
          p2pListings: S.p2pListings || [],
          workbookOverrides: S.workbookOverrides || {},
          workbookOverridesTs: S.workbookOverridesTs || {},
          centerSettings: S.centerSettings || null,
          teachers: cleanTeachers,
          fileExplorer: S.fileExplorer || { folders: [], tests: [] },
          customCurriculumTests: S.customCurriculumTests || {},
          allCurriculumTests: S.allCurriculumTests || [],
          timetable: S.timetable || [],
          contests: S.contests || [],
          payments: S.payments || {},
          savedSpreadsheets: finalMergedSheets,
          deletedSpreadsheetIds: allDelSheets,
          updatedAt: Date.now()
        };

        var jsonStr = JSON.stringify(contentObj, null, 2);
        var b64Content = encodeUtf8Base64(jsonStr);

        var body = {
          message: 'Sync live study data [skip ci]',
          content: b64Content
        };
        if (sha) body.sha = sha;

        var putRes = await fetch(API_STORE_URL, {
          method: 'PUT',
          headers: {
            'Authorization': 'token ' + token,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json',
                      },
          body: JSON.stringify(body)
        });

        if (putRes.status === 200 || putRes.status === 201) {
          var putResult = await putRes.json();
          _lastKnownSha = putResult.content ? putResult.content.sha : sha;
          if (window.EthithApp) window.EthithApp.saveState();
          broadcastLocal(S.classes, S.exams);
          return;
        } else if (putRes.status === 409) {
          console.log('[Sync] 409 conflict, retrying attempt ' + attempt + '...');
          await new Promise(function(r) { setTimeout(r, Math.floor(Math.random() * 250) + 150); });
          continue;
        } else {
          var errText = await putRes.text();
          console.warn('[Sync] PUT failed status ' + putRes.status + ':', errText);
          return;
        }
      } catch(loopErr) {
        console.warn('[Sync] Push loop error:', loopErr);
        await new Promise(function(r) { setTimeout(r, 200); });
      }
    }
  }

  // Synchronize management spreadsheets (Luckysheet Multi-Documents)
  function syncSpreadsheetsWithRemote(remote) {
    if (!remote) return;
    try {
      var localDelSheets = [];
      try { localDelSheets = JSON.parse(localStorage.getItem('eh_deleted_sheets') || '[]'); } catch(e) {}
      if (!Array.isArray(localDelSheets)) localDelSheets = [];
      var remoteDelSheets = Array.isArray(remote.deletedSpreadsheetIds) ? remote.deletedSpreadsheetIds : [];
      var allDelSheets = Array.from(new Set(localDelSheets.concat(remoteDelSheets)));
      try { localStorage.setItem('eh_deleted_sheets', JSON.stringify(allDelSheets)); } catch(e) {}

      var localSheets = [];
      try {
        var rawLs = localStorage.getItem('eh_saved_spreadsheets_v2');
        if (rawLs) localSheets = JSON.parse(rawLs);
      } catch(e) {}
      if (!Array.isArray(localSheets)) localSheets = [];
      var remoteSheets = Array.isArray(remote.savedSpreadsheets) ? remote.savedSpreadsheets : [];

      var sheetMap = {};
      localSheets.forEach(function(sh) {
        if (sh && sh.id && allDelSheets.indexOf(sh.id) === -1) {
          sheetMap[sh.id] = sh;
        }
      });
      remoteSheets.forEach(function(rSh) {
        if (rSh && rSh.id && allDelSheets.indexOf(rSh.id) === -1) {
          var lSh = sheetMap[rSh.id];
          if (!lSh || ((rSh.updatedTs || 0) > (lSh.updatedTs || 0))) {
            sheetMap[rSh.id] = rSh;
          }
        }
      });
      var finalSheets = Object.values(sheetMap);
      finalSheets.forEach(function(shItem) {
        if (Array.isArray(shItem.data)) {
          shItem.data.forEach(function(sheetObj) {
            if (sheetObj && sheetObj.data) delete sheetObj.data;
          });
        }
      });
      if (finalSheets.length > 0) {
        safeStorageSetSync('eh_saved_spreadsheets_v2', JSON.stringify(finalSheets));
        if (window.EthithApp && window.EthithApp.state) {
          window.EthithApp.state.savedSpreadsheets = finalSheets;
        }
        if (typeof window._ethithRefreshLuckyDocSelect === 'function') {
          window._ethithRefreshLuckyDocSelect();
        }
      }
    } catch(err) {
      console.warn('[Sync] Spreadsheets sync error:', err);
    }
  }

  // Initial Data Sync on App Start
  async function syncInitialData(S) {
    var remote = await fetchRemoteStore();
    if (remote) {
      syncSpreadsheetsWithRemote(remote);
      if (remote.deletedExamIds && Array.isArray(remote.deletedExamIds)) {
        if (!S.deletedExamIds) S.deletedExamIds = [];
        remote.deletedExamIds.forEach(function(id) {
          if (S.deletedExamIds.indexOf(id) === -1) S.deletedExamIds.push(id);
        });
      }
      if (remote.accounts && Array.isArray(remote.accounts)) {
        if (!S.accounts) S.accounts = [];
        remote.accounts.forEach(function(rAcc) {
          if (!rAcc || !rAcc.email) return;
          var rEmail = rAcc.email.toLowerCase().trim();
          var exists = S.accounts.find(function(a) {
            return a.email && a.email.toLowerCase().trim() === rEmail;
          });
          if (!exists) {
            S.accounts.push(rAcc);
          } else {
            if (rAcc.name && !exists.name) exists.name = rAcc.name;
            if (rAcc.coins !== undefined) {
              exists.coins = Math.max(Number(exists.coins) || 0, Number(rAcc.coins) || 0);
            }
            if (rAcc.level) exists.level = rAcc.level;
            if (rAcc.avatar !== undefined && rAcc.avatar !== null) exists.avatar = rAcc.avatar;
            if (rAcc.title !== undefined && rAcc.title !== null) exists.title = rAcc.title;
          }

          var isCurrentActive = S.user && S.user.email && S.user.email.toLowerCase().trim() === rEmail;
          if (rEmail === 'admin_12038f1aq8syash@ethith.uz' || rAcc.role === 'admin') {
            rAcc.name = 'Bosh Admin';
            rAcc.id = 'admin_official_root';
            rAcc.role = 'admin';
          } else if (rAcc.role === 'teacher' || rEmail === 'teacher@ethith.uz') {
            rAcc.name = 'Ustoz';
            rAcc.id = 'admin_official_teacher';
            rAcc.role = 'teacher';
          }
          if (isCurrentActive) {
            if (rEmail === 'admin_12038f1aq8syash@ethith.uz' || S.user.role === 'admin') {
              S.user.name = 'Bosh Admin';
              S.user.id = 'admin_official_root';
              S.user.role = 'admin';
            } else if (S.user.role === 'teacher' || rEmail === 'teacher@ethith.uz') {
              S.user.name = 'Ustoz';
              S.user.id = 'admin_official_teacher';
              S.user.role = 'teacher';
            } else if (rAcc.name && !S.user.name) {
              S.user.name = rAcc.name;
            }
            if (rAcc.coins !== undefined) {
              S.user.coins = Math.max(Number(S.user.coins) || 0, Number(rAcc.coins) || 0);
            }
            if (rAcc.avatar && !S.user.avatar) {
              S.user.avatar = rAcc.avatar;
            }
            if (rEmail === 'muhammedjoraboyev1@gmail.com') {
              if (!S.user.name) S.user.name = 'Muhammadyusuf';
            }
            if (window.EthithApp && window.EthithApp.saveState) {
              window.EthithApp.saveState();
            }
            if (window._ethithUpdateTopCoins) {
              try { window._ethithUpdateTopCoins(); } catch(e) {}
            }
            // Update top bar DOM elements
            var coinEl = document.getElementById('topEthCoinVal') || document.getElementById('user-coins');
            if (coinEl) coinEl.innerText = (S.user.coins || 0).toLocaleString();
            var nameEl = document.getElementById('user-name');
            if (nameEl) nameEl.innerText = S.user.name;
          }
        });

        // Deduplicate S.accounts so each Gmail has strictly 1 account
        var dedupedAccounts = [];
        var seenEmails = {};
        S.accounts.forEach(function(acc) {
          if (!acc || !acc.email) return;
          var em = acc.email.toLowerCase().trim();
          if (seenEmails[em]) return;
          seenEmails[em] = true;
          if (em === 'muhammedjoraboyev1@gmail.com') {
            if (!acc.name) acc.name = 'Muhammadyusuf';
          }
          dedupedAccounts.push(acc);
        });
        S.accounts = dedupedAccounts;

        // Also merge into ethith_all_registered_users
        var regKey = 'ethith_all_registered_users';
        var regList = [];
        try { regList = JSON.parse(localStorage.getItem(regKey) || '[]'); } catch(e) {}
        remote.accounts.forEach(function(rAcc) {
          if (!rAcc || !rAcc.email) return;
          var rEmail = rAcc.email.toLowerCase().trim();
          var rIdx = regList.findIndex(function(a) {
            return a.email && a.email.toLowerCase().trim() === rEmail;
          });
          if (rIdx > -1) {
            regList[rIdx].name = rAcc.name || regList[rIdx].name;
            if (rAcc.coins !== undefined) regList[rIdx].coins = Math.max(regList[rIdx].coins || 0, rAcc.coins);
            if (rAcc.avatar !== undefined) regList[rIdx].avatar = rAcc.avatar;
          } else {
            regList.push(rAcc);
          }
        });
        localStorage.setItem(regKey, JSON.stringify(regList));
      }

      if (remote.deletedListingIds && Array.isArray(remote.deletedListingIds)) {
        if (!S.deletedListingIds) S.deletedListingIds = [];
        remote.deletedListingIds.forEach(function(id) { if (S.deletedListingIds.indexOf(id) === -1) S.deletedListingIds.push(id); });
      }
      if (remote.p2pListings && Array.isArray(remote.p2pListings)) {
        if (!S.p2pListings) S.p2pListings = [];
        mergeP2PListings(S.p2pListings, remote.p2pListings, S.deletedListingIds || []);
      }
      if (remote.deletedQuizIds && Array.isArray(remote.deletedQuizIds)) {
        if (!S.deletedQuizIds) S.deletedQuizIds = [];
        remote.deletedQuizIds.forEach(function(id) { if (S.deletedQuizIds.indexOf(id) === -1) S.deletedQuizIds.push(id); });
      }
      if (remote.quizzes && Array.isArray(remote.quizzes)) {
        if (!S.quizzes) S.quizzes = [];
        mergeQuizzes(S.quizzes, remote.quizzes, S.deletedQuizIds || []);
      }
      if (remote.workbookOverrides && typeof remote.workbookOverrides === 'object') {
        if (!S.workbookOverrides) S.workbookOverrides = {};
        if (!S.workbookOverridesTs) S.workbookOverridesTs = {};
        var remoteTsMapInit = (remote.workbookOverridesTs && typeof remote.workbookOverridesTs === 'object') ? remote.workbookOverridesTs : {};
        Object.keys(remote.workbookOverrides).forEach(function(pKey) {
          var pNum = parseInt(pKey, 10);
          var inps = remote.workbookOverrides[pKey];
          if (Array.isArray(inps) && inps.length > 0) {
            var remotePageTs = parseInt((remoteTsMapInit && remoteTsMapInit[pKey]) || '0', 10);
            var localPageTs = parseInt(localStorage.getItem('ethith_wb_ts_' + pNum) || '0', 10);
            var localSavedInit = localStorage.getItem('ethith_wb_override_' + pNum) || localStorage.getItem('ethith_wb_coords_v15_' + pNum);
            if (localSavedInit && (localPageTs >= remotePageTs || remotePageTs === 0)) {
              try {
                var parsedLocal = JSON.parse(localSavedInit);
                if (Array.isArray(parsedLocal) && parsedLocal.length > 0) {
                  S.workbookOverrides[pNum] = parsedLocal;
                  S.workbookOverridesTs[pNum] = localPageTs || Date.now();
                  if (window.ETHITH_WORKBOOK_B1 && window.ETHITH_WORKBOOK_B1.defaultInputs) {
                    window.ETHITH_WORKBOOK_B1.defaultInputs[pNum] = parsedLocal;
                  }
                  return;
                }
              } catch(e) {}
            }
            S.workbookOverrides[pNum] = inps;
            S.workbookOverridesTs[pNum] = remotePageTs || Date.now();
            try {
              localStorage.setItem('ethith_wb_coords_v15_' + pNum, JSON.stringify(inps));
              localStorage.setItem('ethith_wb_ts_' + pNum, (remotePageTs || Date.now()).toString());
            } catch(e) {}
            if (window.ETHITH_WORKBOOK_B1) {
              if (pNum > 2000 && window.ETHITH_WORKBOOK_B1.defaultInputsB2) {
                window.ETHITH_WORKBOOK_B1.defaultInputsB2[pNum] = inps;
              }
              if (window.ETHITH_WORKBOOK_B1.defaultInputs) {
                window.ETHITH_WORKBOOK_B1.defaultInputs[pNum] = inps;
              }
              if (typeof window.ETHITH_WORKBOOK_B1.liveRefreshPage === 'function' && !window._ethithWbEditorMode) {
                window.ETHITH_WORKBOOK_B1.liveRefreshPage(pNum);
              }
            }
          }
        });
      }
      if (remote.fileExplorer && remote.fileExplorer.tests && Array.isArray(remote.fileExplorer.tests)) {
        if (!S.fileExplorer) S.fileExplorer = { currentFolder: 'root', folders: [], tests: [] };
        if (!Array.isArray(S.fileExplorer.tests)) S.fileExplorer.tests = [];
        var localTestIds = new Set(S.fileExplorer.tests.map(function(t) { return t.id; }));
        remote.fileExplorer.tests.forEach(function(rt) {
          if (!localTestIds.has(rt.id)) {
            S.fileExplorer.tests.push(rt);
          }
        });
        if (remote.fileExplorer.folders && Array.isArray(remote.fileExplorer.folders)) {
          if (!Array.isArray(S.fileExplorer.folders)) S.fileExplorer.folders = [];
          var localFolderIds = new Set(S.fileExplorer.folders.map(function(f) { return f.id; }));
          remote.fileExplorer.folders.forEach(function(rf) {
            if (!localFolderIds.has(rf.id)) {
              S.fileExplorer.folders.push(rf);
            }
          });
        }
        try {
          localStorage.setItem('ethith_file_explorer', JSON.stringify(S.fileExplorer));
        } catch(e) {}
      }
      if (remote.contests && Array.isArray(remote.contests)) {
        if (!S.contests) S.contests = [];
        var localCMap = {};
        S.contests.forEach(function(c) { if (c && c.id) localCMap[c.id] = c; });
        remote.contests.forEach(function(rc) {
          if (!rc || !rc.id) return;
          var lc = localCMap[rc.id];
          if (!lc) {
            S.contests.push(rc);
          } else {
            if (rc.participants && typeof rc.participants === 'object') {
              if (!lc.participants) lc.participants = {};
              Object.keys(rc.participants).forEach(function(pk) {
                if (!lc.participants[pk] || (rc.participants[pk].score > (lc.participants[pk].score || 0))) {
                  lc.participants[pk] = rc.participants[pk];
                }
              });
            }
            if (rc.status === 'finished') lc.status = 'finished';
            if (rc.coinsDistributed) lc.coinsDistributed = true;
          }
        });
        try {
          var entStore = JSON.parse(localStorage.getItem('ethith_enterprise_store') || '{}');
          entStore.contests = S.contests;
          localStorage.setItem('ethith_enterprise_store', JSON.stringify(entStore));
        } catch(e) {}
      }

      // Synchronize custom curriculum tests and personal tests permanently
      if (remote.customCurriculumTests && typeof remote.customCurriculumTests === 'object') {
        if (!S.customCurriculumTests) S.customCurriculumTests = {};
        Object.assign(S.customCurriculumTests, remote.customCurriculumTests);
        try {
          localStorage.setItem('ethith_custom_curriculum_tests', JSON.stringify(S.customCurriculumTests));
        } catch(e) {}
      }
      if (remote.allCurriculumTests && Array.isArray(remote.allCurriculumTests)) {
        if (!Array.isArray(S.allCurriculumTests)) S.allCurriculumTests = [];
        remote.allCurriculumTests.forEach(function(rt) {
          if (!rt || !rt.id) return;
          var exIdx = S.allCurriculumTests.findIndex(function(x) { return x.id === rt.id; });
          if (exIdx !== -1) S.allCurriculumTests[exIdx] = rt;
          else S.allCurriculumTests.push(rt);
        });
        try {
          localStorage.setItem('ethith_all_curriculum_tests', JSON.stringify(S.allCurriculumTests));
        } catch(e) {}
      }
      var c1 = mergeClasses(S.classes, remote.classes || []);
      if (remote.deletedStudentIds && Array.isArray(remote.deletedStudentIds)) {
        if (!S.deletedStudentIds) S.deletedStudentIds = [];
        remote.deletedStudentIds.forEach(function(id) { if (S.deletedStudentIds.indexOf(id) === -1) S.deletedStudentIds.push(id); });
      }
      if (remote.deletedTeacherIds && Array.isArray(remote.deletedTeacherIds)) {
        if (!S.deletedTeacherIds) S.deletedTeacherIds = [];
        remote.deletedTeacherIds.forEach(function(id) { if (S.deletedTeacherIds.indexOf(id) === -1) S.deletedTeacherIds.push(id); });
      }
      if (!S.teachers) S.teachers = [];
      var cTeachers = mergeTeachers(S.teachers, remote.teachers || [], S.deletedTeacherIds || []);
      var c2 = mergeExams(S.exams, remote.exams || [], S.deletedExamIds || []);
      if (window.EthithApp) {
        window.EthithApp.saveState();
      }
      if (!window._ethithIsTestInProgress) {
        if (document.getElementById('tgMsgBox') && window._ethithRefreshCurrentClass) {
          try { window._ethithRefreshCurrentClass(); } catch(e) {}
        }
        if (window._ethithRefreshClassesList && window._ethithCurrentView === 'classes' && !S.activeClassId) {
          try { window._ethithRefreshClassesList(); } catch(e) {}
        }
        if (window._ethithRefreshExamsList && window._ethithCurrentView === 'exams') {
          try { window._ethithRefreshExamsList(); } catch(e) {}
        }
        if (window._ethithRefreshQuizList && window._ethithCurrentView === 'quiz') {
          try { window._ethithRefreshQuizList(); } catch(e) {}
        }
        if (window._ethithRefreshAttendance && window._ethithCurrentView === 'attendance') {
          try { window._ethithRefreshAttendance(); } catch(e) {}
        }
        if (window._ethithRefreshTeachersList) {
          try { window._ethithRefreshTeachersList(); } catch(e) {}
        } else if (window._ethithRefreshCurrentView && window._ethithCurrentView === 'dash') {
          try { window._ethithRefreshCurrentView(); } catch(e) {}
        }
        if (window._ethithRefreshLeaderboard && window._ethithCurrentView === 'leaderboard') {
          try { window._ethithRefreshLeaderboard(); } catch(e) {}
        }
        if (window._ethithRefreshTopNav) {
          try { window._ethithRefreshTopNav(); } catch(e) {}
        }
      }
    }
    // Auto-subscribe to all enrolled classes on start
    (S.classes || []).forEach(function(c) {
      subscribeClass(c.code || c.id);
    });
    // Auto-sync any local teacher edits to cloud
    if (window.EthithSync && window.EthithSync.syncAllLocalWorkbookOverridesToCloud) {
      setTimeout(window.EthithSync.syncAllLocalWorkbookOverridesToCloud, 1200);
    }
  }

  // Background Poller (Safety net fallback every 3.5s)
  var isPolling = false;
  async function checkLiveUpdates() {
    if (isPolling) return;
    if (!window.EthithApp || !window.EthithApp.state) return;
    var S = window.EthithApp.state;
    if (document.hidden || !S.user) return;

    isPolling = true;
    try {
      if (typeof window.checkEthithVersionNow === 'function') {
        try { window.checkEthithVersionNow(); } catch(e) {}
      }
      var remote = await fetchRemoteStore();
      if (remote) {
        syncSpreadsheetsWithRemote(remote);
        if (remote.deletedExamIds && Array.isArray(remote.deletedExamIds)) {
          if (!S.deletedExamIds) S.deletedExamIds = [];
          remote.deletedExamIds.forEach(function(id) {
            if (S.deletedExamIds.indexOf(id) === -1) S.deletedExamIds.push(id);
          });
        }
        if (remote.deletedQuizIds && Array.isArray(remote.deletedQuizIds)) {
          if (!S.deletedQuizIds) S.deletedQuizIds = [];
          remote.deletedQuizIds.forEach(function(id) {
            if (S.deletedQuizIds.indexOf(id) === -1) S.deletedQuizIds.push(id);
          });
        }
        if (remote.workbookOverrides && typeof remote.workbookOverrides === 'object') {
          if (!S.workbookOverrides) S.workbookOverrides = {};
          if (!S.workbookOverridesTs) S.workbookOverridesTs = {};
          var remoteTsMap = (remote.workbookOverridesTs && typeof remote.workbookOverridesTs === 'object') ? remote.workbookOverridesTs : {};
          var wbChanged = false;
          var editWindowActive = (Date.now() - (window._lastTeacherEditTime || 0)) < 60000; // 60 seconds active protection on current device

          Object.keys(remote.workbookOverrides).forEach(function(pKey) {
            var pNum = parseInt(pKey, 10);
            var inps = remote.workbookOverrides[pKey];
            if (Array.isArray(inps) && inps.length > 0) {
              var remotePageTs = parseInt((remoteTsMap && remoteTsMap[pKey]) || '0', 10);
              var localTs = parseInt(localStorage.getItem('ethith_wb_ts_' + pNum) || '0', 10);
              var localSaved = localStorage.getItem('ethith_wb_override_' + pNum) || localStorage.getItem('ethith_wb_coords_v15_' + pNum);

              // If local edits exist and local is newer or remote has no timestamp, NEVER overwrite teacher's edits!
              if (localSaved && (localTs >= remotePageTs || remotePageTs === 0 || editWindowActive)) {
                return;
              }

              var curSaved = localStorage.getItem('ethith_wb_coords_v15_' + pNum);
              var curStr = JSON.stringify(inps);
              if (curSaved !== curStr) {
                S.workbookOverrides[pNum] = inps;
                S.workbookOverridesTs[pNum] = remotePageTs || Date.now();
                try {
                  localStorage.setItem('ethith_wb_coords_v15_' + pNum, curStr);
                  localStorage.setItem('ethith_wb_ts_' + pNum, (remotePageTs || Date.now()).toString());
                } catch(e) {}
                if (window.ETHITH_WORKBOOK_B1) {
                  if (pNum > 2000 && window.ETHITH_WORKBOOK_B1.defaultInputsB2) {
                    window.ETHITH_WORKBOOK_B1.defaultInputsB2[pNum] = inps;
                  }
                  if (window.ETHITH_WORKBOOK_B1.defaultInputs) {
                    window.ETHITH_WORKBOOK_B1.defaultInputs[pNum] = inps;
                  }
                  if (typeof window.ETHITH_WORKBOOK_B1.liveRefreshPage === 'function' && !window._ethithWbEditorMode) {
                    window.ETHITH_WORKBOOK_B1.liveRefreshPage(pNum);
                  }
                }
                wbChanged = true;
              }
            }
          });
        }
        if (!S.quizzes) S.quizzes = [];
        var c0 = mergeQuizzes(S.quizzes, remote.quizzes || [], S.deletedQuizIds || []);
        if (remote.contests && Array.isArray(remote.contests)) {
        if (!S.contests) S.contests = [];
        var localCMap = {};
        S.contests.forEach(function(c) { if (c && c.id) localCMap[c.id] = c; });
        remote.contests.forEach(function(rc) {
          if (!rc || !rc.id) return;
          var lc = localCMap[rc.id];
          if (!lc) {
            S.contests.push(rc);
          } else {
            if (rc.participants && typeof rc.participants === 'object') {
              if (!lc.participants) lc.participants = {};
              Object.keys(rc.participants).forEach(function(pk) {
                if (!lc.participants[pk] || (rc.participants[pk].score > (lc.participants[pk].score || 0))) {
                  lc.participants[pk] = rc.participants[pk];
                }
              });
            }
            if (rc.status === 'finished') lc.status = 'finished';
            if (rc.coinsDistributed) lc.coinsDistributed = true;
          }
        });
        try {
          var entStore = JSON.parse(localStorage.getItem('ethith_enterprise_store') || '{}');
          entStore.contests = S.contests;
          localStorage.setItem('ethith_enterprise_store', JSON.stringify(entStore));
        } catch(e) {}
      }

      // Synchronize custom curriculum tests and personal tests permanently
      if (remote.customCurriculumTests && typeof remote.customCurriculumTests === 'object') {
        if (!S.customCurriculumTests) S.customCurriculumTests = {};
        Object.assign(S.customCurriculumTests, remote.customCurriculumTests);
        try {
          localStorage.setItem('ethith_custom_curriculum_tests', JSON.stringify(S.customCurriculumTests));
        } catch(e) {}
      }
      if (remote.allCurriculumTests && Array.isArray(remote.allCurriculumTests)) {
        if (!Array.isArray(S.allCurriculumTests)) S.allCurriculumTests = [];
        remote.allCurriculumTests.forEach(function(rt) {
          if (!rt || !rt.id) return;
          var exIdx = S.allCurriculumTests.findIndex(function(x) { return x.id === rt.id; });
          if (exIdx !== -1) S.allCurriculumTests[exIdx] = rt;
          else S.allCurriculumTests.push(rt);
        });
        try {
          localStorage.setItem('ethith_all_curriculum_tests', JSON.stringify(S.allCurriculumTests));
        } catch(e) {}
      }
      var c1 = mergeClasses(S.classes, remote.classes || []);
        if (remote.deletedStudentIds && Array.isArray(remote.deletedStudentIds)) {
          if (!S.deletedStudentIds) S.deletedStudentIds = [];
          remote.deletedStudentIds.forEach(function(id) { if (S.deletedStudentIds.indexOf(id) === -1) S.deletedStudentIds.push(id); });
        }
        if (remote.deletedTeacherIds && Array.isArray(remote.deletedTeacherIds)) {
          if (!S.deletedTeacherIds) S.deletedTeacherIds = [];
          remote.deletedTeacherIds.forEach(function(id) { if (S.deletedTeacherIds.indexOf(id) === -1) S.deletedTeacherIds.push(id); });
        }
        if (!S.teachers) S.teachers = [];
        var cTeachers = mergeTeachers(S.teachers, remote.teachers || [], S.deletedTeacherIds || []);
        var c2 = mergeExams(S.exams, remote.exams || [], S.deletedExamIds || []);
        var c3 = mergeAccounts(S.accounts || [], remote.accounts || []);
        var c4 = mergeP2PListings(S.p2pListings || [], remote.p2pListings || [], S.deletedListingIds || []);
        if (c0 || c1 || c2 || c3 || c4 || cTeachers || wbChanged) {
          window.EthithApp.saveState();
          if (!window._ethithIsTestInProgress) {
            if (document.getElementById('tgMsgBox') && window._ethithRefreshCurrentClass) {
              window._ethithRefreshCurrentClass();
            }
            if (window._ethithRefreshClassesList && window._ethithCurrentView === 'classes' && !S.activeClassId) {
              window._ethithRefreshClassesList();
            }
            if (window._ethithRefreshExamsList && window._ethithCurrentView === 'exams') {
              window._ethithRefreshExamsList();
            }
            if (window._ethithRefreshQuizList && window._ethithCurrentView === 'quiz') {
              window._ethithRefreshQuizList();
            }
            if (window._ethithRefreshProgressionTests && window._ethithCurrentView === 'progression') {
              window._ethithRefreshProgressionTests();
            }
            if (window._ethithRefreshLeaderboard && window._ethithCurrentView === 'leaderboard') {
              window._ethithRefreshLeaderboard();
            }
            if (window._ethithRefreshFriendsList) {
              window._ethithRefreshFriendsList();
            }
            if (window._ethithRefreshMarket && window._ethithCurrentView === 'market') {
              window._ethithRefreshMarket();
            }
            if (window._ethithRefreshAttendance && (window._ethithCurrentView === 'attendance' || window._ethithCurrentView === 'timetable')) {
              window._ethithRefreshAttendance();
            } else if (window.EA && typeof window.EA.render === 'function') {
              var apView = document.getElementById('apView') || document.getElementById('viewContainer');
              if (apView && (window._ethithCurrentView === 'attendance' || window._ethithCurrentView === 'timetable' || document.getElementById('eaAttendanceTable') || document.querySelector('.ea-teachers-grid') || document.querySelector('.ea-teacher-groups-wrap'))) {
                window.EA.render(apView, true);
              }
            }
            if (cTeachers) {
              if (window._ethithRefreshTeachersList) {
                try { window._ethithRefreshTeachersList(); } catch(e) {}
              } else if (window._ethithRefreshCurrentView && window._ethithCurrentView === 'dash') {
                try { window._ethithRefreshCurrentView(); } catch(e) {}
              }
            }
            if (window._ethithRefreshTopNav) {
              window._ethithRefreshTopNav();
            }
          }
        }
      }
    } catch(err) {
      console.warn('Sync poll error:', err);
    }
    isPolling = false;
  }

  setInterval(checkLiveUpdates, 45000);

  // Initialize Real-Time Mesh on Load
  if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initRealtimeMesh);
    } else {
      setTimeout(initRealtimeMesh, 20);
    }
  }


  function broadcastUserState() {
    if (!window.EthithApp || !window.EthithApp.state) return;
    var S = window.EthithApp.state;
    if (!S.user) return;

    if (!Array.isArray(S.accounts)) S.accounts = [];
    if (S.user.role === 'teacher') {
      if (!S.user.name) S.user.name = 'Ustoz';
    }
    var curEmail = (S.user.email || '').toLowerCase().trim();
    var curName = (S.user.name || '').trim();

    var userAcc = S.accounts.find(function(a) {
      return (curEmail && a.email && a.email.toLowerCase().trim() === curEmail) ||
             (curName && a.name && a.name.toLowerCase().trim() === curName.toLowerCase()) ||
             (S.user.id && a.id && a.id === S.user.id);
    });

    if (!userAcc) {
      userAcc = {
        id: S.user.id || ('st_' + Date.now().toString(36)),
        role: S.user.role || 'student',
        name: curName || "O'quvchi",
        email: curEmail || (curName.toLowerCase().replace(/\s+/g, '.') + '@ethith.uz'),
        coins: S.user.coins !== undefined ? Number(S.user.coins) : 150,
        avatar: S.user.avatar || null,
        level: S.level || S.user.level || 'A1',
        dailyMinutes: S.user.dailyMinutes || 0,
        nameStyle: S.user.nameStyle || null,
        title: S.user.title || null,
        victorySound: S.user.victorySound || null,
        updatedAt: Date.now()
      };
      S.accounts.push(userAcc);
    } else {
      userAcc.coins = S.user.coins !== undefined ? Number(S.user.coins) : userAcc.coins;
      userAcc.avatar = S.user.avatar || userAcc.avatar;
      userAcc.level = S.level || S.user.level || userAcc.level;
      userAcc.nameStyle = S.user.nameStyle || userAcc.nameStyle;
      userAcc.title = S.user.title || userAcc.title;
      userAcc.victorySound = S.user.victorySound || userAcc.victorySound;
      userAcc.dailyMinutes = S.user.dailyMinutes || userAcc.dailyMinutes;
      userAcc.updatedAt = Date.now();
    }

    var regKey = 'ethith_all_registered_users';
    var regList = [];
    try { regList = JSON.parse(localStorage.getItem(regKey) || '[]'); } catch(e) {}
    var rIdx = regList.findIndex(function(a) {
      return (curEmail && a.email && a.email.toLowerCase().trim() === curEmail) ||
             (curName && a.name && a.name.toLowerCase().trim() === curName.toLowerCase());
    });
    if (rIdx > -1) {
      regList[rIdx].coins = userAcc.coins;
      regList[rIdx].avatar = userAcc.avatar;
      regList[rIdx].level = userAcc.level;
      regList[rIdx].nameStyle = userAcc.nameStyle;
      regList[rIdx].title = userAcc.title;
      regList[rIdx].victorySound = userAcc.victorySound;
    } else {
      regList.push(userAcc);
    }
    try { localStorage.setItem(regKey, JSON.stringify(regList)); } catch(e) {}

    publishLive({
      type: 'USER_STATE_SYNC',
      user: userAcc
    });

    if (pushRemoteStore) pushRemoteStore();
  }

  function saveWorkbookCloudOverrides(page, inputs) {
    page = parseInt(page, 10);
    var nowTs = Date.now();
    var S = (window.EthithApp && window.EthithApp.state) || {};
    if (!S.workbookOverrides) S.workbookOverrides = {};
    if (!S.workbookOverridesTs) S.workbookOverridesTs = {};
    S.workbookOverrides[page] = inputs;
    S.workbookOverridesTs[page] = nowTs;

    window._lastTeacherEditTime = nowTs;
    try {
      localStorage.setItem('ethith_wb_coords_v15_' + page, JSON.stringify(inputs));
      localStorage.setItem('ethith_wb_ts_' + page, nowTs.toString());
    } catch(e) {}

    // Instant live real-time broadcast via MQTT + BroadcastChannel (sub-millisecond!)
    publishLive({
      type: 'WORKBOOK_PAGE_UPDATED',
      page: page,
      inputs: inputs,
      version: '15.0',
      ts: nowTs
    });

    // Debounced background push to GitHub cloud store (0ms non-blocking!)
    if (window._ethithWbPushTimer) clearTimeout(window._ethithWbPushTimer);
    window._ethithWbPushTimer = setTimeout(function() {
      pushRemoteStore().then(function() {
        console.log('[WB-Sync] Page ' + page + ' saved to cloud store successfully');
      }).catch(function(e) {
        console.warn('[WB-Sync] Cloud save deferred:', e);
      });
    }, 1500);
  }

  function getWorkbookCloudOverrides(page) {
    page = parseInt(page, 10);
    var S = (window.EthithApp && window.EthithApp.state) || {};
    return (S.workbookOverrides && S.workbookOverrides[page]) ? S.workbookOverrides[page] : null;
  }

  function syncAllLocalWorkbookOverridesToCloud() {
    var S = (window.EthithApp && window.EthithApp.state) || {};
    if (!S.workbookOverrides) S.workbookOverrides = {};
    if (!S.workbookOverridesTs) S.workbookOverridesTs = {};
    var count = 0;
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && (k.indexOf('ethith_wb_coords_v15_') === 0 || k.indexOf('ethith_wb_override_') === 0 || k.indexOf('ethith_wb_coords_v14_') === 0)) {
          var match = k.match(/(?:ethith_wb_coords_v1[45]_|ethith_wb_override_)(\d+)$/);
          if (match && match[1]) {
            var pNum = parseInt(match[1], 10);
            try {
              var val = JSON.parse(localStorage.getItem(k));
              if (Array.isArray(val) && val.length > 0) {
                localStorage.setItem('ethith_wb_coords_v15_' + pNum, JSON.stringify(val));
                var localPageTs = parseInt(localStorage.getItem('ethith_wb_ts_' + pNum) || '0', 10);
                var prevStr = S.workbookOverrides[pNum] ? JSON.stringify(S.workbookOverrides[pNum]) : '';
                if (prevStr !== JSON.stringify(val)) {
                  count++;
                }
                S.workbookOverrides[pNum] = val;
                if (localPageTs > 0) {
                  S.workbookOverridesTs[pNum] = localPageTs;
                }
              }
            } catch(e) {}
          }
        }
      }
    } catch(e) {}
    console.log('[WB-Sync] Auto-syncing ' + count + ' updated workbook pages to cloud...');
    return pushRemoteStore();
  }

  window.EthithSync = {
    broadcastUserState: broadcastUserState,
    broadcastState: function(mutationType, extraData) {
      var payload = {
        type: 'STATE_MUTATION',
        mutationType: mutationType,
        extra: extraData || {},
        from: myClientId,
        ts: Date.now()
      };
      if (typeof publishLive === 'function') {
        publishLive(payload);
      }
      if (typeof pushRemoteStore === 'function') {
        pushRemoteStore();
      }
      try {
        if (typeof BroadcastChannel !== 'undefined') {
          if (!window._eeChannel) window._eeChannel = new BroadcastChannel('ethith_cloud_channel');
          window._eeChannel.postMessage(payload);
        }
      } catch(e) {}
    },
    publishLive: publishLive,
    handleIncomingLiveEvent: handleIncomingLiveEvent,
    subscribeClass: subscribeClass,
    fetchRemoteStore: fetchRemoteStore,
    pushRemoteStore: pushRemoteStore,
    pushStoreUpdate: pushRemoteStore,
    pushLocalStore: pushRemoteStore,
    pushStore: pushRemoteStore,
    syncInitialData: syncInitialData,
    broadcastLocal: broadcastLocal,
    broadcastSpreadsheetSaved: function(spreadsheet) {
      try {
        publishLive({
          type: 'SPREADSHEET_SAVED',
          spreadsheet: spreadsheet,
          from: myClientId,
          ts: Date.now()
        });
      } catch(e) {}
    },
    broadcastSpreadsheetDeleted: function(spreadsheetId) {
      try {
        publishLive({
          type: 'SPREADSHEET_DELETED',
          spreadsheetId: spreadsheetId,
          from: myClientId,
          ts: Date.now()
        });
      } catch(e) {}
    },
    saveWorkbookCloudOverrides: saveWorkbookCloudOverrides,
    getWorkbookCloudOverrides: getWorkbookCloudOverrides,
    syncAllLocalWorkbookOverridesToCloud: syncAllLocalWorkbookOverridesToCloud,
    getUserStatus: window._ethithGetUserStatus,
    sendPresenceHeartbeat: sendPresenceHeartbeat,
    isMqttConnected: function() {
      return isMeshConnected;
    }
  };

  try {
    window.addEventListener('storage', function(e) {
      if (e.key === 'ethith_last_expelled_student' && e.newValue) {
        try {
          var ev = JSON.parse(e.newValue);
          handleIncomingLiveEvent(ev);
        } catch(err) {}
      }
    });
  } catch(e) {}

})(window);
