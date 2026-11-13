/**
 * ETHITH 19 BOOSTERS SYSTEM (100% Functional Engine)
 * Oxford Workbooks, Online Contests & Enterprise Tests, and Quiz Engine
 */
(function(window) {
  'use strict';

  var BE = {};

  BE.getBoostersList = function() {
    return window.ETHITH_BOOSTERS || [];
  };

  BE.getUserBoosterCount = function(bId) {
    var S = window.S || (window.EthithApp && window.EthithApp.state) || {};
    var user = S.user || {};
    var b = user.boosters || {};
    return Number(b[bId] || 0);
  };

  BE.consumeOrBuyBooster = function(bId, onSuccess) {
    var S = window.S || (window.EthithApp && window.EthithApp.state) || {};
    var user = S.user;
    if (!user) {
      alert("Iltimos, avval tizimga kiring!");
      return false;
    }
    if (!user.boosters) user.boosters = {};

    var list = BE.getBoostersList();
    var bObj = list.find(function(item) { return item.id === bId; });
    if (!bObj) return false;

    var curCount = Number(user.boosters[bId] || 0);
    if (curCount > 0) {
      // Consume 1 owned booster
      user.boosters[bId] = curCount - 1;
      if (typeof window.saveStore === 'function') window.saveStore();
      if (window.App && typeof window.App.saveState === 'function') window.App.saveState();
      if (typeof window.showToast === 'function') {
        window.showToast("⚡ " + bObj.name + " kuchaytirgichi ishlatildi! (Qoldi: " + user.boosters[bId] + " ta)");
      }
      if (typeof onSuccess === 'function') onSuccess(bObj);
      return true;
    }

    // Has 0 boosters, prompt to purchase from market using coins
    var cost = bObj.price || 150;
    var userCoins = Number(user.coins || 0);
    if (userCoins < cost) {
      alert("⚠️ Mablag‘ yetarli emas!\nSizda: " + userCoins + " Coin bor.\n\"" + bObj.name + "\" narxi: " + cost + " Coin.\nVazifalarni yechib yoki botdan coin to‘ldiring!");
      return false;
    }

    if (confirm("🛒 Sizda \"" + bObj.name + "\" qolmagan.\nUni " + cost + " ETHITH Coinga Marketdan sotib olib, darhol ishlatasizmi?")) {
      user.coins = userCoins - cost;
      if (typeof window.saveStore === 'function') window.saveStore();
      if (window.App && typeof window.App.saveState === 'function') window.App.saveState();
      if (window._ethithUpdateTopCoins) window._ethithUpdateTopCoins();
      if (typeof window.showToast === 'function') {
        window.showToast("✓ " + bObj.name + " sotib olindi va ishlatildi! (-" + cost + " coin)");
      }
      if (typeof onSuccess === 'function') onSuccess(bObj);
      return true;
    }
    return false;
  };

  // Renders the interactive drawer modal for Oxford Workbook or Contest
  BE.openBoosterDrawer = function(opts) {
    opts = opts || {};
    var mode = opts.mode || 'workbook'; // 'workbook' | 'test' | 'contest'
    var rootEl = opts.rootEl || document.body;

    var oldModal = document.getElementById('ethBoosterDrawerModal');
    if (oldModal) oldModal.remove();

    var list = BE.getBoostersList();
    var modal = document.createElement('div');
    modal.id = 'ethBoosterDrawerModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.85);backdrop-filter:blur(8px);z-index:2147483647;display:flex;align-items:flex-end;justify-content:center;padding:0;animation:fadeIn 0.2s ease;';

    var S = window.S || (window.EthithApp && window.EthithApp.state) || {};
    var user = S.user || {};
    var userBoosters = user.boosters || {};
    var userCoins = user.coins || 0;

    var h = '<div style="background:#0f172a;border:1.5px solid rgba(56,189,248,0.4);border-top-left-radius:24px;border-top-right-radius:24px;max-width:850px;width:100%;max-height:85vh;display:flex;flex-direction:column;box-shadow:0 -10px 40px rgba(0,0,0,0.8);color:#f8fafc;overflow:hidden;">' +
      // Header
      '<div style="padding:16px 22px;background:linear-gradient(135deg,#1e1b4b,#0f172a);border-bottom:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">' +
        '<div style="display:flex;align-items:center;gap:12px;">' +
          '<span style="font-size:26px;">⚡</span>' +
          '<div>' +
            '<h3 style="margin:0;font-size:17px;font-weight:900;color:#38bdf8;">ETHITH Super Kuchaytirgichlar (19 ta)</h3>' +
            '<p style="margin:2px 0 0;font-size:12px;color:#94a3b8;">' + (mode === 'workbook' ? 'Oxford Navigate Uyga Vazifa Kitobi' : 'Online Test & Musobaqa') + ' uchun jonli yordamchilar</p>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:14px;">' +
          '<div style="background:rgba(245,158,11,0.2);border:1px solid rgba(245,158,11,0.4);padding:4px 12px;border-radius:12px;color:#fde047;font-weight:900;font-size:13px;display:flex;align-items:center;gap:6px;">' +
            '🪙 ' + userCoins + ' Coin' +
          '</div>' +
          '<button id="ethCloseBoosterDrawerBtn" style="background:rgba(255,255,255,0.1);border:none;color:#fff;border-radius:50%;width:32px;height:32px;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;">✕</button>' +
        '</div>' +
      '</div>' +

      // Grid of 19 Boosters
      '<div style="padding:18px 22px;overflow-y:auto;display:grid;grid-template-columns:repeat(auto-fill, minmax(240px, 1fr));gap:12px;">';

    list.forEach(function(b) {
      var count = Number(userBoosters[b.id] || 0);
      h += '<div style="background:rgba(15,23,42,0.85);border:1.5px solid ' + (b.glowColor || 'rgba(56,189,248,0.3)') + ';border-radius:14px;padding:12px 14px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 4px 15px rgba(0,0,0,0.3);position:relative;">' +
        '<div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">' +
            '<span style="font-size:22px;">' + b.icon + '</span>' +
            '<span style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);padding:2px 8px;border-radius:8px;font-size:10px;font-weight:800;color:' + (b.glowColor || '#38bdf8') + ';">' + (b.badge || 'BOOSTER') + '</span>' +
          '</div>' +
          '<div style="font-size:13.5px;font-weight:900;color:#fff;margin-bottom:4px;">' + esc(b.name) + '</div>' +
          '<div style="font-size:11px;color:#94a3b8;line-height:1.4;margin-bottom:10px;">' + esc(b.desc) + '</div>' +
        '</div>' +

        '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:6px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.08);">' +
          '<span style="font-size:11.5px;font-weight:800;color:' + (count > 0 ? '#34d399' : '#94a3b8') + ';">' +
            (count > 0 ? ('Sizda: <b>' + count + ' ta</b>') : ('Narxi: ' + b.price + ' c')) +
          '</span>' +
          '<button class="eth-apply-booster-btn" data-bid="' + b.id + '" style="background:' + (count > 0 ? 'linear-gradient(135deg,#0284c7,#0369a1)' : 'linear-gradient(135deg,#d97706,#b45309)') + ';color:#fff;border:none;border-radius:8px;padding:6px 12px;font-size:11.5px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:4px;box-shadow:0 2px 8px rgba(0,0,0,0.3);">' +
            (count > 0 ? '⚡ Ishlatish' : '🛒 Olish & Ishlatish') +
          '</button>' +
        '</div>' +
      '</div>';
    });

    h += '</div></div>';
    modal.innerHTML = h;
    document.body.appendChild(modal);

    modal.querySelector('#ethCloseBoosterDrawerBtn').onclick = function() {
      modal.remove();
    };

    modal.querySelectorAll('.eth-apply-booster-btn').forEach(function(btn) {
      btn.onclick = function() {
        var bId = btn.getAttribute('data-bid');
        BE.consumeOrBuyBooster(bId, function(bObj) {
          modal.remove();
          if (typeof opts.onUse === 'function') {
            opts.onUse(bId, bObj);
          }
        });
      };
    });
  };

  // Specific Action Handlers for Oxford Workbook
  BE.applyWorkbookBooster = function(bId, bObj, container) {
    if (!container) return;

    if (bId === 'auto_solve') {
      // Find first empty input or select and auto-fill it
      var emptyInp = Array.from(container.querySelectorAll('.wb-fill-input')).find(function(inp) {
        return !inp.value.trim();
      });
      if (emptyInp) {
        var raw = emptyInp.getAttribute('data-correct') || '';
        try {
          var p = JSON.parse(raw);
          if (Array.isArray(p)) raw = p[0] || '';
        } catch(e) {}
        emptyInp.value = raw;
        emptyInp.classList.add('correct');
        emptyInp.style.boxShadow = '0 0 12px #10b981';
        if (typeof window.showToast === 'function') window.showToast("🤖 Avto-AI 1 ta javobni avtomatik to‘ldirdi: " + raw);
        return;
      }

      var emptySel = Array.from(container.querySelectorAll('.wb-select-input')).find(function(sel) {
        return !sel.value.trim();
      });
      if (emptySel) {
        var cVal = emptySel.getAttribute('data-correct') || '';
        emptySel.value = cVal;
        emptySel.classList.add('correct');
        emptySel.style.boxShadow = '0 0 12px #10b981';
        if (typeof window.showToast === 'function') window.showToast("🤖 Avto-AI variantni belgiladi: " + cVal);
        return;
      }
      if (typeof window.showToast === 'function') window.showToast("Barcha savollar to‘ldirilgan!");
    }
    else if (bId === 'hint_master' || bId === 'mind_reader') {
      // Reveal hint for 1 input
      var anyInp = Array.from(container.querySelectorAll('.wb-fill-input')).find(function(inp) {
        return !inp.classList.contains('correct');
      });
      if (anyInp) {
        var rawCorr = anyInp.getAttribute('data-correct') || '';
        try {
          var arr = JSON.parse(rawCorr);
          if (Array.isArray(arr)) rawCorr = arr[0];
        } catch(e) {}
        var firstLetter = (rawCorr || '').charAt(0);
        var hintTip = (rawCorr.length > 2) ? ('Bosh harfi: "' + firstLetter + '...", uzunligi ' + rawCorr.length + ' ta harf') : ('Javob: ' + rawCorr);
        anyInp.setAttribute('placeholder', hintTip);
        anyInp.style.borderColor = '#fbbf24';
        if (typeof window.showToast === 'function') window.showToast("💡 Donishmand maslahati: " + hintTip);
      } else {
        if (typeof window.showToast === 'function') window.showToast("💡 Barcha javoblar allaqachon to‘g‘ri!");
      }
    }
    else if (bId === '50_50') {
      // Narrow down dropdown select options
      var sels = container.querySelectorAll('.wb-select-input');
      var applied = false;
      sels.forEach(function(sel) {
        if (applied) return;
        var corr = (sel.getAttribute('data-correct') || '').trim().toLowerCase();
        var opts = Array.from(sel.querySelectorAll('option')).filter(function(o) {
          return o.value && o.value.trim().toLowerCase() !== corr;
        });
        if (opts.length >= 2) {
          opts[0].remove();
          if (opts[1]) opts[1].remove();
          applied = true;
          sel.style.borderColor = '#38bdf8';
          if (typeof window.showToast === 'function') window.showToast("✂️ 50/50: 2 ta noto‘g‘ri variant o‘chirildi!");
        }
      });
      if (!applied && typeof window.showToast === 'function') window.showToast("✂️ 50/50 qo‘llandi!");
    }
    else if (bId === 'second_chance') {
      // Reset incorrect red markings to neutral so student can re-attempt
      var wrongs = container.querySelectorAll('.incorrect');
      wrongs.forEach(function(el) {
        el.classList.remove('incorrect');
        el.style.borderColor = '#0284c7';
      });
      if (typeof window.showToast === 'function') window.showToast("🔄 Ikkinchi imkoniyat: xatolar bekor qilindi, qayta urinib ko‘ring!");
    }
    else if (bId === 'booster_2x') {
      window._ethithWbBooster2xActive = true;
      if (typeof window.showToast === 'function') window.showToast("⚡ 2X Coin Kuchaytirgich faollashtirildi! Ushbu vazifadan 2 barobar ko‘p tanga olasiz!");
    }
    else if (bId === 'coin_magnet') {
      window._ethithWbCoinMagnetActive = true;
      if (typeof window.showToast === 'function') window.showToast("🧲 Tanga Magniti faol! Vazifa tugagach +50 bonus coin beriladi!");
    }
    else if (bId === 'skip_pass') {
      // Fill all remaining inputs of the first exercise
      var inps = container.querySelectorAll('.wb-fill-input');
      inps.forEach(function(inp) {
        if (!inp.value.trim()) {
          var raw = inp.getAttribute('data-correct') || '';
          try {
            var p = JSON.parse(raw);
            if (Array.isArray(p)) raw = p[0] || '';
          } catch(e) {}
          inp.value = raw;
          inp.classList.add('correct');
        }
      });
      if (typeof window.showToast === 'function') window.showToast("⏭️ Savoldan sakrash: mashq avtomatik yechildi!");
    }
    else if (bId === 'crit_strike' || bId === 'xp_booster') {
      window._ethithWbCritStrikeActive = true;
      if (typeof window.showToast === 'function') window.showToast("💥 Kritik Zarba faol! Natijangizga 2x XP qo‘shiladi!");
    }
    else if (bId === 'shield' || bId === 'ghost_shield') {
      window._ethithWbShieldActive = true;
      if (typeof window.showToast === 'function') window.showToast("🛡️ Qalqon himoyasi faollashtirildi!");
    }
    else if (bId === 'diamond_boost') {
      window._ethithWbDiamondActive = true;
      if (typeof window.showToast === 'function') window.showToast("💎 Olmos ko‘paytirgich faol: reytingingizga +50% bonus qo‘shiladi!");
    }
    else if (bId === 'blessing_luck') {
      var S = window.S || (window.EthithApp && window.EthithApp.state) || {};
      if (S.user) {
        var luckBonus = Math.floor(Math.random() * 80) + 20;
        S.user.coins = (S.user.coins || 0) + luckBonus;
        if (typeof window.saveStore === 'function') window.saveStore();
        if (typeof window.showToast === 'function') window.showToast("🍀 Omad Barakoti: sizga kutilmagan +" + luckBonus + " Coin tushdi!");
      }
    }
    else {
      if (typeof window.showToast === 'function') window.showToast("⚡ " + (bObj ? bObj.name : 'Kuchaytirgich') + " faollashtirildi!");
    }
  };

  // Specific Action Handlers for Online Contests & Enterprise Tests
  BE.applyTestBooster = function(bId, bObj, context) {
    context = context || {};
    var modal = context.modal;
    var q = context.q;
    var curQIdx = context.curQIdx;

    if (bId === '50_50') {
      if (!modal) return;
      var optBtns = Array.from(modal.querySelectorAll('.ee-opt-btn'));
      var correctIdx = (q && q.correct !== undefined) ? Number(q.correct) : 0;
      var wrongBtns = optBtns.filter(function(btn) {
        return Number(btn.getAttribute('data-opt')) !== correctIdx;
      });
      if (wrongBtns.length >= 2) {
        wrongBtns[0].disabled = true;
        wrongBtns[0].style.opacity = '0.25';
        wrongBtns[0].style.pointerEvents = 'none';
        wrongBtns[0].innerHTML = '<s>' + wrongBtns[0].innerHTML + '</s>';

        wrongBtns[1].disabled = true;
        wrongBtns[1].style.opacity = '0.25';
        wrongBtns[1].style.pointerEvents = 'none';
        wrongBtns[1].innerHTML = '<s>' + wrongBtns[1].innerHTML + '</s>';
        if (typeof window.showToast === 'function') window.showToast("✂️ 50/50: 2 ta noto‘g‘ri javob o‘chirildi!");
      }
    }
    else if (bId === 'hint_master' || bId === 'mind_reader') {
      var correctIdx = (q && q.correct !== undefined) ? Number(q.correct) : 0;
      var correctOpt = (q && q.options && q.options[correctIdx]) ? q.options[correctIdx] : '';
      var clue = (correctOpt.length > 3) ? ('Boshlanishi: "' + correctOpt.slice(0, 3) + '..."') : ('Variant: ' + String.fromCharCode(65 + correctIdx));
      if (typeof window.showToast === 'function') window.showToast("💡 Donishmand Maslahati: " + clue);
    }
    else if (bId === 'auto_solve') {
      if (!modal) return;
      var correctIdx = (q && q.correct !== undefined) ? Number(q.correct) : 0;
      var targetBtn = modal.querySelector('.ee-opt-btn[data-opt="' + correctIdx + '"]');
      if (targetBtn) {
        targetBtn.click();
        targetBtn.style.border = '2px solid #10b981';
        targetBtn.style.background = 'rgba(16,185,129,0.3)';
        if (typeof window.showToast === 'function') window.showToast("🤖 Avto-AI to‘g‘ri variantni tanladi!");
      }
    }
    else if (bId === 'time_bonus' || bId === 'time_freeze') {
      window._contestExtraTimeSec = (window._contestExtraTimeSec || 0) + 25;
      if (typeof window.showToast === 'function') window.showToast("⏱️ Vaqtga +25 soniya qo‘shildi!");
    }
    else if (bId === 'skip_pass') {
      if (context.onSkip) context.onSkip();
      if (typeof window.showToast === 'function') window.showToast("⏭️ Savoldan sakrash: savol to‘liq ball bilan o‘tkazildi!");
    }
    else if (bId === 'booster_2x' || bId === 'crit_strike') {
      window._contest2xActive = true;
      if (typeof window.showToast === 'function') window.showToast("⚡ Musobaqa ballari va tangalari 2 barobar ko‘paytiriladi!");
    }
    else if (bId === 'shield' || bId === 'ghost_shield') {
      window._contestShieldActive = true;
      if (typeof window.showToast === 'function') window.showToast("🛡️ Qalqon faol: birinchi xato jarimasi bekor qilinadi!");
    }
    else if (bId === 'diamond_boost') {
      window._contestDiamondActive = true;
      if (typeof window.showToast === 'function') window.showToast("💎 Olmos ko‘paytirgich: umumiy reytingingizga +50% ball beriladi!");
    }
    else {
      if (typeof window.showToast === 'function') window.showToast("⚡ " + (bObj ? bObj.name : 'Kuchaytirgich') + " faol!");
    }
  };

  window.EthithBoosterEngine = BE;
  console.log('✓ EthithBoosterEngine initialized with 19 boosters support!');
})(window);
