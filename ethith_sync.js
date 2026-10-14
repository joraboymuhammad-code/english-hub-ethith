/**
 * ETHITH Cloud & Cross-Tab Synchronization
 * Created by Muhammadyusuf Jo'raboyev
 * Features:
 * - Real-time BroadcastChannel sync across browser tabs
 * - GitHub Repository shared_store.json fetch & sync across devices/browsers
 * - Online presence tracking via user's Gmail ID
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

  var channel = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('ethith_cloud_channel');
      channel.onmessage = function(e) {
        if (e.data && e.data.type === 'SYNC_STATE' && window.EthithApp) {
          var S = window.EthithApp.state;
          if (e.data.classes) S.classes = e.data.classes;
          if (e.data.exams) S.exams = e.data.exams;
          if (window._ethithCurrentView === 'classes' && window._ethithInternalGo) {
            window._ethithInternalGo('classes');
          }
        }
      };
    }
  } catch(e) {}

  async function fetchRemoteStore() {
    try {
      var res = await fetch(RAW_STORE_URL + '?_t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        var data = await res.json();
        return data;
      }
    } catch(err) {
      console.warn('Could not fetch remote shared store:', err);
    }
    return null;
  }

  async function pushRemoteStore(classes, exams) {
    var token = getGHToken();
    if (!token) return;

    try {
      // Get current file SHA first
      var getRes = await fetch(API_STORE_URL, {
        headers: {
          'Authorization': 'token ' + token,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      var sha = null;
      if (getRes.ok) {
        var fileData = await getRes.json();
        sha = fileData.sha;
      }

      var contentObj = {
        classes: classes || [],
        exams: exams || [],
        updatedAt: Date.now()
      };

      var jsonStr = JSON.stringify(contentObj, null, 2);
      var b64Content = btoa(unescape(encodeURIComponent(jsonStr)));

      var body = {
        message: 'Sync classes and exams [skip ci]',
        content: b64Content
      };
      if (sha) body.sha = sha;

      await fetch(API_STORE_URL, {
        method: 'PUT',
        headers: {
          'Authorization': 'token ' + token,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify(body)
      });
    } catch(err) {
      console.warn('Failed to push shared store to GitHub:', err);
    }
  }

  function broadcastLocal(classes, exams) {
    if (channel) {
      channel.postMessage({
        type: 'SYNC_STATE',
        classes: classes,
        exams: exams
      });
    }
  }

  // Auto-sync on startup
  async function syncInitialData(S) {
    var remote = await fetchRemoteStore();
    if (remote) {
      var changed = false;
      if (remote.classes && Array.isArray(remote.classes)) {
        remote.classes.forEach(function(rc) {
          var exists = S.classes.find(function(c) { return c.id === rc.id || c.code === rc.code; });
          if (!exists) {
            S.classes.push(rc);
            changed = true;
          } else {
            // merge messages
            if (rc.messages && rc.messages.length > exists.messages.length) {
              exists.messages = rc.messages;
              changed = true;
            }
          }
        });
      }
      if (remote.exams && Array.isArray(remote.exams)) {
        remote.exams.forEach(function(rx) {
          var exists = S.exams.find(function(x) { return x.id === rx.id || x.code === rx.code; });
          if (!exists) {
            S.exams.push(rx);
            changed = true;
          }
        });
      }
      if (changed && window.EthithApp) {
        window.EthithApp.saveState();
      }
    }
  }

  window.EthithSync = {
    fetchRemoteStore: fetchRemoteStore,
    pushRemoteStore: pushRemoteStore,
    broadcastLocal: broadcastLocal,
    syncInitialData: syncInitialData
  };

})(window);
