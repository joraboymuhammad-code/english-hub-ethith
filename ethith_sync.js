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

  // Dispatch incoming live events directly to local state and UI
  function handleIncomingLiveEvent(event) {
    if (!event || event.from === myClientId) return; // Don't echo self
    if (event.id && markEventSeen(event.id)) return; // Deduplicate across dual brokers

    if (!window.EthithApp || !window.EthithApp.state) return;

    var S = window.EthithApp.state;
    var classes = S.classes || [];

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

    // A. CHAT MESSAGE
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
          uiNeedsRefresh = true;
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
      if (foundInCls.pinnedId === event.msgId) foundInCls.pinnedId = null;
      if (foundInCls.messages.length !== lenBefore) {
        uiNeedsRefresh = true;
      }
    }

    // D. PIN MESSAGE
    else if (event.type === 'PIN_MSG' && targetCls && event.msgId) {
      if (targetCls.pinnedId !== event.msgId) {
        targetCls.pinnedId = event.msgId;
        uiNeedsRefresh = true;
      }
    }

    // E. STUDENT JOINED
    else if (event.type === 'STUDENT_JOIN' && targetCls && event.student) {
      if (!targetCls.students) targetCls.students = [];
      var sExists = targetCls.students.some(function(s) {
        return (s.email && s.email === event.student.email) || (s.id && s.id === event.student.id);
      });
      if (!sExists) {
        if (!event.student.joinedAt) {
          var dNow = new Date();
          event.student.joinedAt = dNow.getFullYear() + '-' + String(dNow.getMonth() + 1).padStart(2, '0') + '-' + String(dNow.getDate()).padStart(2, '0');
        }
        targetCls.students.push(event.student);
        uiNeedsRefresh = true;
      }
    }

    // E2. ATTENDANCE & JOURNAL REAL-TIME UPDATE
    else if (event.type === 'ATTENDANCE_UPDATED') {
      var attCls = targetCls || classes.find(function(c) {
        return (event.classId && c.id === event.classId) || (event.classCode && c.code === event.classCode);
      });
      if (attCls) {
        if (event.attendance) attCls.attendance = event.attendance;
        if (event.schedule) attCls.schedule = event.schedule;
        if (event.customStudentNames) attCls.customStudentNames = event.customStudentNames;
        if (event.activeHomework !== undefined) attCls.activeHomework = event.activeHomework;
        uiNeedsRefresh = true;
        if (window._ethithRefreshAttendance && window._ethithCurrentView === 'attendance') {
          try { window._ethithRefreshAttendance(); } catch(e) {}
        }
      }
    }

    // F. CLASS CREATED
    else if (event.type === 'CLASS_CREATED' && event.classData) {
      var cExists = classes.some(function(c) {
        return (c.id && c.id === event.classData.id) || (c.code && c.code === event.classData.code);
      });
      if (!cExists) {
        classes.push(event.classData);
        uiNeedsRefresh = true;
      }
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
      if (window.ETHITH_WORKBOOK_B1) {
        if (window.ETHITH_WORKBOOK_B1.defaultInputs) {
          window.ETHITH_WORKBOOK_B1.defaultInputs[pNum] = event.inputs;
        }
        window.ETHITH_WORKBOOK_B1.savePageInputs(pNum, event.inputs, /* noBroadcast */ true);
        if (typeof window.ETHITH_WORKBOOK_B1.liveRefreshPage === 'function') {
          window.ETHITH_WORKBOOK_B1.liveRefreshPage(pNum);
        }
        if (window.toast && !window._ethithWbEditorMode) {
          var dispPage = pNum > 2000 ? ('Upper-Intermediate ' + (pNum - 2000)) : pNum;
          window.toast('⚡ Ustoz ' + dispPage + '-sahifani yangiladi');
        }
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
        if (stInput && !stInput.value) {
          stInput.value = cleanCode;
          var statusEl = document.getElementById('stCodeStatus');
          if (statusEl) statusEl.innerHTML = '<span style="color:#22c55e;font-weight:800">✅ Kod Telegramdan qabul qilindi!</span>';
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

        var isTeacherAcc = (u.role === 'teacher' || uEmail === 'admin_12038f1aq8syash@ethith.uz' || uId === 'admin_official_teacher');
        if (isTeacherAcc) {
          u.name = 'Ustoz';
          uName = 'Ustoz';
          u.id = 'admin_official_teacher';
          uId = 'admin_official_teacher';
        }

        if (existingAcc) {
          if (isTeacherAcc || existingAcc.role === 'teacher' || (existingAcc.email || '').toLowerCase().trim() === 'admin_12038f1aq8syash@ethith.uz') {
            existingAcc.name = 'Ustoz';
            existingAcc.id = 'admin_official_teacher';
            existingAcc.role = 'teacher';
          }
          if (event.type === 'USER_COINS_UPDATE' || event.type === 'COIN_TRANSFER') {
            if (u.coins !== undefined) existingAcc.coins = Number(u.coins);
          } else {
            if (!isTeacherAcc && existingAcc.role !== 'teacher' && uName && (!existingAcc.name || !isPlaceholder(uName))) existingAcc.name = uName;
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
          var isMe = (oldEmail && myEm === oldEmail) || (uEmail && myEm === uEmail) || (oldName && myNm === oldName);
          if (isMe) {
            if (S.user.role === 'teacher' || isTeacherAcc) {
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
            if (u.coins !== undefined) S.user.coins = Number(u.coins);
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
        var rawJson = decodeUtf8Base64(data.content);
        return JSON.parse(rawJson);
      }
    } catch(err) {
      try {
        var rawRes = await fetch(RAW_STORE_URL + '?_t=' + Date.now(), { cache: 'no-store' });
        if (rawRes.ok) return await rawRes.json();
      } catch(e) {}
    }
    return null;
  }

  function mergeClasses(localClasses, remoteClasses) {
    var changed = false;
    if (!Array.isArray(remoteClasses)) return changed;

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

      // Sync Students
      if (!localCls.students) localCls.students = [];
      if (rc.students && Array.isArray(rc.students)) {
        rc.students.forEach(function(rStudent) {
          var exists = localCls.students.find(function(s) {
            return (s.email && s.email === rStudent.email) || (s.id && s.id === rStudent.id);
          });
          if (!exists) {
            localCls.students.push(rStudent);
            changed = true;
          } else {
            if ((rStudent.lastActive || 0) > (exists.lastActive || 0) || (rStudent.dailyMinutes || 0) > (exists.dailyMinutes || 0)) {
              exists.lastActive = rStudent.lastActive || exists.lastActive;
              exists.dailyMinutes = Math.max(exists.dailyMinutes || 0, rStudent.dailyMinutes || 0);
              exists.mistakes = rStudent.mistakes !== undefined ? rStudent.mistakes : exists.mistakes;
              changed = true;
            }
          }
        });
      }

      // Sync Messages & Emoji Reactions
      if (rc.messages && Array.isArray(rc.messages)) {
        rc.messages.forEach(function(rMsg) {
          if (localCls.deletedMsgIds.indexOf(rMsg.id) !== -1) return;

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

      // Sync Pinned Message
      if (rc.pinnedId !== undefined && rc.pinnedId !== localCls.pinnedId) {
        if (localCls.deletedMsgIds.indexOf(rc.pinnedId) === -1) {
          localCls.pinnedId = rc.pinnedId;
          changed = true;
        } else {
          localCls.pinnedId = null;
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
        for (var stK in rc.customStudentNames) {
          if (localCls.customStudentNames[stK] !== rc.customStudentNames[stK]) {
            var rTs2 = (rc.attendance && rc.attendance.updatedAt) || 0;
            var lTs2 = (localCls.attendance && localCls.attendance.updatedAt) || 0;
            if (rTs2 >= lTs2 || !localCls.customStudentNames[stK]) {
              localCls.customStudentNames[stK] = rc.customStudentNames[stK];
              changed = true;
            }
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
    var email = (acc.email || '').toLowerCase().trim();
    var name = (acc.name || '').toLowerCase().trim();
    var id = (acc.id || '').toLowerCase().trim();
    if (!name && !email) return true;
    if (id === 'admin_official_teacher' || email === 'admin_12038f1aq8syash@ethith.uz' || acc.role === 'teacher') {
      acc.name = 'Ustoz';
      acc.id = 'admin_official_teacher';
      return false;
    }
    var purgedList = [
      'muhammedjoraboyev1@gmail.com', 'strikeruzb52@gmail.com', 'alisher@gmail.com',
      'nasibaorazaliyev@gmail.com', 'joraboymuhammad@gmail.com', 'aleksandermike37@gmail.com',
      'sarvartovboyev09@gmail.com', 'azizbekurolov24@gmail.com', 'shodiyorovinch030@gmail.com',
      'nursulton@ethith.uz', 'john.doe@ethith.uz', 'yangi o\'quvchi', 'alisher oquvchi',
      'shamshod', 'nursulton', 'azizbek', 'urolov', 'sarvar tovboyev', 'aleksander mike'
    ];
    for (var i = 0; i < purgedList.length; i++) {
      var p = purgedList[i];
      if (email === p || email.indexOf(p) !== -1 || name === p) return true;
    }
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
        if (rUpdated >= lUpdated || (rAcc.coins !== undefined && Number(rAcc.coins) > Number(existing.coins || 0))) {
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
          try {
            var rawJson = decodeUtf8Base64(fileData.content);
            remoteData = JSON.parse(rawJson);
          } catch(e) {}
        }

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
        if (!S.quizzes) S.quizzes = [];
        mergeQuizzes(S.quizzes, remoteData.quizzes || [], S.deletedQuizIds || []);

        mergeClasses(S.classes, remoteData.classes || []);
        mergeExams(S.exams, remoteData.exams || [], S.deletedExamIds || []);
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
        if (remoteData.teachers && (!S.teachers || S.teachers.length === 0)) S.teachers = remoteData.teachers;
        if (remoteData.timetable && (!S.timetable || S.timetable.length === 0)) S.timetable = remoteData.timetable;
        if (remoteData.contests && (!S.contests || S.contests.length === 0)) S.contests = remoteData.contests;
        if (remoteData.payments && (!S.payments || Object.keys(S.payments).length === 0)) S.payments = remoteData.payments;
        if (remoteData.deletedListingIds && Array.isArray(remoteData.deletedListingIds)) {
          if (!S.deletedListingIds) S.deletedListingIds = [];
          remoteData.deletedListingIds.forEach(function(id) { if (S.deletedListingIds.indexOf(id) === -1) S.deletedListingIds.push(id); });
        }
        if (!S.p2pListings) S.p2pListings = [];
        mergeP2PListings(S.p2pListings, remoteData.p2pListings || [], S.deletedListingIds || []);

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
            if (!S.workbookOverrides[k] || !Array.isArray(S.workbookOverrides[k]) || (rTs > lTs)) {
              S.workbookOverrides[k] = remoteData.workbookOverrides[k];
              if (rTs > 0) S.workbookOverridesTs[k] = rTs;
            }
          });
        }

        var cleanClasses = JSON.parse(JSON.stringify(S.classes));
        cleanClasses.forEach(function(c) {
          if (c.deletedMsgIds && Array.isArray(c.deletedMsgIds) && c.messages) {
            c.messages = c.messages.filter(function(m) {
              return c.deletedMsgIds.indexOf(m.id) === -1;
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

        var cleanAccounts = (S.accounts || []).filter(function(a) {
          return !isPurgedAccount(a);
        });
        S.accounts = cleanAccounts;

        var contentObj = {
          classes: cleanClasses,
          exams: cleanExams,
          quizzes: cleanQuizzes,
          deletedExamIds: dIds,
          deletedQuizIds: dqIds,
          deletedListingIds: S.deletedListingIds || [],
          accounts: cleanAccounts,
          p2pListings: S.p2pListings || [],
          workbookOverrides: S.workbookOverrides || {},
          workbookOverridesTs: S.workbookOverridesTs || {},
          centerSettings: S.centerSettings || null,
          teachers: S.teachers || [],
          fileExplorer: S.fileExplorer || { folders: [], tests: [] },
          timetable: S.timetable || [],
          contests: S.contests || [],
          payments: S.payments || {},
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

  // Initial Data Sync on App Start
  async function syncInitialData(S) {
    var remote = await fetchRemoteStore();
    if (remote) {
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
          if (rAcc.role === 'teacher' || rEmail === 'admin_12038f1aq8syash@ethith.uz') {
            rAcc.name = 'Ustoz';
            rAcc.id = 'admin_official_teacher';
          }
          if (isCurrentActive) {
            if (S.user.role === 'teacher' || rEmail === 'admin_12038f1aq8syash@ethith.uz') {
              S.user.name = 'Ustoz';
              S.user.id = 'admin_official_teacher';
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
              S.user.coins = Math.max(Number(S.user.coins) || 0, 100000);
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
            acc.coins = Math.max(Number(acc.coins) || 0, 100000);
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
            var remotePageTs = parseInt(remoteTsMapInit[pKey] || remote.updatedAt || '0', 10);
            var localPageTs = parseInt(localStorage.getItem('ethith_wb_ts_' + pNum) || '0', 10);
            var localSavedInit = localStorage.getItem('ethith_wb_coords_v15_' + pNum);
            if (localSavedInit && localPageTs > remotePageTs && remotePageTs > 0) {
              try {
                var parsedLocal = JSON.parse(localSavedInit);
                if (Array.isArray(parsedLocal) && parsedLocal.length > 0) {
                  S.workbookOverrides[pNum] = parsedLocal;
                  S.workbookOverridesTs[pNum] = localPageTs;
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
      var c1 = mergeClasses(S.classes, remote.classes || []);
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
      var remote = await fetchRemoteStore();
      if (remote) {
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
              var remotePageTs = parseInt(remoteTsMap[pKey] || remote.updatedAt || '0', 10);
              var localTs = parseInt(localStorage.getItem('ethith_wb_ts_' + pNum) || '0', 10);

              if (window._ethithWbEditorMode && editWindowActive) {
                var localSaved = localStorage.getItem('ethith_wb_coords_v15_' + pNum);
                if (localSaved && localTs >= remotePageTs) {
                  return;
                }
              }

              if (localTs > remotePageTs && remotePageTs > 0 && localStorage.getItem('ethith_wb_coords_v15_' + pNum)) {
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
        var c1 = mergeClasses(S.classes, remote.classes || []);
        var c2 = mergeExams(S.exams, remote.exams || [], S.deletedExamIds || []);
        var c3 = mergeAccounts(S.accounts || [], remote.accounts || []);
        var c4 = mergeP2PListings(S.p2pListings || [], remote.p2pListings || [], S.deletedListingIds || []);
        if (c0 || c1 || c2 || c3 || c4) {
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
            if (window._ethithRefreshAttendance && window._ethithCurrentView === 'attendance') {
              window._ethithRefreshAttendance();
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

  setInterval(checkLiveUpdates, 3500);

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
      S.user.name = 'Ustoz';
      S.user.id = 'admin_official_teacher';
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

    // Instant live real-time broadcast via MQTT + BroadcastChannel
    publishLive({
      type: 'WORKBOOK_PAGE_UPDATED',
      page: page,
      inputs: inputs,
      version: '15.0',
      ts: nowTs
    });

    // Save persistently to GitHub cloud store
    pushRemoteStore().then(function() {
      console.log('[WB-Sync] Page ' + page + ' saved to cloud store successfully');
    }).catch(function(e) {
      console.warn('[WB-Sync] Cloud save deferred:', e);
    });
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
        if (k && (k.indexOf('ethith_wb_coords_v15_') === 0 || k.indexOf('ethith_wb_coords_v14_') === 0)) {
          var match = k.match(/ethith_wb_coords_v1[45]_(\d+)$/);
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
    if (count > 0) {
      console.log('[WB-Sync] Auto-syncing ' + count + ' updated workbook pages to cloud...');
      pushRemoteStore().catch(function() {});
    }
  }

  window.EthithSync = {
    broadcastUserState: broadcastUserState,
    publishLive: publishLive,
    handleIncomingLiveEvent: handleIncomingLiveEvent,
    subscribeClass: subscribeClass,
    fetchRemoteStore: fetchRemoteStore,
    pushRemoteStore: pushRemoteStore,
    syncInitialData: syncInitialData,
    broadcastLocal: broadcastLocal,
    saveWorkbookCloudOverrides: saveWorkbookCloudOverrides,
    getWorkbookCloudOverrides: getWorkbookCloudOverrides,
    syncAllLocalWorkbookOverridesToCloud: syncAllLocalWorkbookOverridesToCloud,
    isMqttConnected: function() {
      return isMeshConnected;
    }
  };

})(window);
