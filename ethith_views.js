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

  // Brand Emblem Helper
  function ethEmblemImg(cls, style) {
    var b64 = window.ETHITH_BRAND_EMBLEM || 'ethith_emblem_cropped.png';
    return '<img src="' + b64 + '" class="' + (cls || 'eth-brand-emblem-mini') + '" style="' + (style || '') + '" alt="ETHITH" />';
  }

  // Web Audio Piercing Tit-Tit Alarm (5 to 7 Rapid Beep Pulses)
  function playTitTitAlarm(pulses) {
    pulses = pulses || 6;
    try {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      var ctx = window._ethithAudioCtx || new AudioContext();
      window._ethithAudioCtx = ctx;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(function(){});
      }
      var now = ctx.currentTime;
      var pulseLen = 0.08;
      var gapLen = 0.045;
      for (var i = 0; i < pulses; i++) {
        var start = now + i * (pulseLen + gapLen);
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1300, start);
        osc.frequency.setValueAtTime(1050, start + pulseLen * 0.5);
        gain.gain.setValueAtTime(1.0, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + pulseLen);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + pulseLen);
      }
    } catch(e) {
      console.warn('Tit-tit alarm error:', e);
    }
  }

  // Universal Touch & Mouse Draggable + Collapsible Floating Box
  function makeElementDraggableAndCollapsible(boxEl, handleEl, toggleBtnEl) {
    if (!boxEl || !handleEl) return;
    var isDragging = false;
    var startX = 0, startY = 0;
    var initLeft = 0, initTop = 0;

    function onStart(clientX, clientY) {
      isDragging = true;
      startX = clientX;
      startY = clientY;
      var rect = boxEl.getBoundingClientRect();
      initLeft = rect.left;
      initTop = rect.top;
      boxEl.style.position = 'fixed';
      boxEl.style.bottom = 'auto';
      boxEl.style.right = 'auto';
      boxEl.style.left = initLeft + 'px';
      boxEl.style.top = initTop + 'px';
      boxEl.style.zIndex = '2147483647';
    }

    function onMove(clientX, clientY) {
      if (!isDragging) return;
      var dx = clientX - startX;
      var dy = clientY - startY;
      var maxW = window.innerWidth - boxEl.offsetWidth - 10;
      var maxH = window.innerHeight - boxEl.offsetHeight - 10;
      var newLeft = Math.max(10, Math.min(maxW > 10 ? maxW : 10, initLeft + dx));
      var newTop = Math.max(10, Math.min(maxH > 10 ? maxH : 10, initTop + dy));
      boxEl.style.left = newLeft + 'px';
      boxEl.style.top = newTop + 'px';
    }

    function onEnd() {
      isDragging = false;
    }

    handleEl.addEventListener('mousedown', function(e) {
      if (e.target.closest('button')) return;
      onStart(e.clientX, e.clientY);
      function mm(ev) { onMove(ev.clientX, ev.clientY); }
      function mu() {
        onEnd();
        window.removeEventListener('mousemove', mm);
        window.removeEventListener('mouseup', mu);
      }
      window.addEventListener('mousemove', mm);
      window.addEventListener('mouseup', mu);
    });

    handleEl.addEventListener('touchstart', function(e) {
      if (e.target.closest('button')) return;
      if (e.touches.length === 1) {
        onStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    handleEl.addEventListener('touchmove', function(e) {
      if (isDragging && e.touches.length === 1) {
        e.preventDefault();
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });

    handleEl.addEventListener('touchend', function() { onEnd(); }, { passive: true });

    if (toggleBtnEl) {
      toggleBtnEl.onclick = function(e) {
        e.stopPropagation();
        var isMin = boxEl.classList.toggle('minimized');
        toggleBtnEl.textContent = isMin ? '▢' : '—';
        toggleBtnEl.title = isMin ? 'Kattalashtirish (Expand)' : 'Kichraytirish (Minimize)';
      };
    }
  }

  // Universal Alphanumeric + Symbols Exam & Quiz Code Generator
  // Generates rich codes like: QZ-8K#7X, MCK-5NJ!7WD, QZ-9P$3RT
  function generateRichExamCode(prefix) {
    prefix = prefix || 'MCK';
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var symbols = ['#', '!', '@', '$', '%', '*', '&'];
    var p1 = '';
    for (var i = 0; i < 3; i++) {
      p1 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    var sym = symbols[Math.floor(Math.random() * symbols.length)];
    var p2 = '';
    for (var j = 0; j < 3; j++) {
      p2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix + '-' + p1 + sym + p2;
  }

  var App = window.EthithApp;
  var S = App.state;
  var ic = App.ic;
  var esc = App.esc;

  var currentReplyingMessage = null;
  var activeContextMenu = null;
  var ETHITH_EMBLEM_IMG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAEYARgDASIAAhEBAxEB/8QAHQAAAQQDAQEAAAAAAAAAAAAAAgABAwQFBgcICf/EAF8QAAEDAwIDBAQFDAoPBQkAAAEAAgMEBREGIQcSMRNBUWEIInGBFBUyUpEjQmJygpKhorGy0tMWFyQzQ1SUs8LUCSU0RFNzdHWDhKPB0eHwJ0VHlcM2N0ZWY2SFtPH/xAAcAQABBQEBAQAAAAAAAAAAAAAAAQIDBQYEBwj/xAA5EQACAQMCBAIHBgYCAwAAAAAAAQIDBBEFIQYSMUETURQiMmFxgbEHQlJikaEjJHLB0eEVQ4KS8P/aAAwDAQACEQMRAD8A8UgqQbqMI2roOcIKRp3UYGEbSnZANEEAOUYSgECiahCJoQAbeqLHvTN6JwcoAPOAiCBECnZAIKRpyogjagCQIggG6MIGDp87BDnATg53QA6fZNnP/FJADjcouiAIgdkCjkoUubJ6JslAYCKHokEs580AIkYQlOeibCAQ3RMcp8ISgcNlCU+Ux3QAB7/YnO/sTkZSa05CfBZlgRhxx7pKeFvRJXlOmlEhbZq7UYymAJThZsnDB2RsBz5IQiB7kqAMdUajGykBTgHBRjyQA/8AWUbevkgB27IwPFCOvX3om/8AWEAEOqcHKYdMom+0lKwHAypGoW9ETTulAL6EQ6IAd0WUDBycFIbFMnzhABexLKAHuThwQBIEkIenznogUc7lNjKQO6RPnhAZEeqE+5PnKYIDIgkTsl3JygQEnr7UB3RE4SzkIY8j+j3JsoiUJ79kmQCCka3IUYU8TC/YKen5iMs0kPO5JXaWMMx4pLpdyo7HDKcm/VNFaU/egCNvRVZZBDoiGEI6IglQwNpRA4QeaIdE4AxlGTso2lGOqdkAxuiQA+ScHdIBICiB2UafJ8EoEucogSgacBFlABBOEAITk4QIwwUz3gd62jh9wxv/ABMuT6az07RDFg1FdUEsp4AfnOwdz3NGSe4L1tw19HXSmgxBVSUzdRXpjg8V9ziDmRn/AOlTnLAO/MnOc7+r0HdbWda6eKaKDU9astJhm5nv2Xd/I8o6M4Pa14g07amw6crq6hL+Q1xaIqdp78yPLW/QSV1O1ehfqepY11x1FYbeCN2xSS1TwfuGcv0OXozUnEyxaelLbhcvhM8fq9hB9WczywNmezIWg3H0kYYHkUNk7VoOzquflyPY0f71qqHDU5LM3+m31PPKvGd/dSfoNthecjUaX0IoQz908QBzdwhsTsfhqFVrPQmqWFxotfUU47m1Vqlg+ktkk/Is7Vek1dwcss9qY3wcZT/TVV3pT1zDyz6et0n+JnljP4S4fgXa+GYY7/qhaeva/wBXCJz3UHom68tLHOtrbbqbl27K01rTN1/wcoY76AVynUOn7rpS6SW69W6qtNez5VNWROjePc4L1LQ+kdp65DF0o621PJ6ta2pjHtIw4D2NK3SHUlBrayy0rZrfquy8uJaSoAqo4wfsXevCfNvKfAqtr8N1ILNOXyax+/QvbXiavGSje0OX3rdHhTmx3ogcr0Zrn0brJd2S1mjqn4lrzuLLcZuamf4iGocctPTDZM/b7rz/AHiyV+nrlPb7nRz0FfA7lkp6iMse0+YKyte2q20uSrHDN1QuaV1BTpPKKZOybKbOU/cuY6kCe/dL37pd56+9NnAHcgUR6IeicnzTEZ6b/wC9AEkbeYhZCJoix4obXS88nMfkhDLLmV2AOpUj9VEOXN8qLrJg0bpKiZD/AM0lwT3Z2QjCKwamE4zuhz704cphhK3vTgqMFEClQwkB26o+5RZRg5GE7IEg2CIFBlONggCQHZF16dVECc9EYO6XIBg4Rg7bqNONj0SoCVu5TqNpwiym9wCLsLeuE3C+q4lXd4ke+ks1M4CqqmjLi47iJni8jJ8GgEnuB1fSum6vWOoaK0UQxNUO3kd8mNg3c8+QG/8A/V7R0lY7bonTcVJStNPbaCIuc9w9bcjmefF7zj34HQK+0vTnfVfW9hdf8GV4g1mOk2/qb1JdF/c2K0ssnD/TcEEUMVrtdIOWOFm+XHv8XyHvcdz7FzrWPEq56i7SmoS+hoMElkb+V72jqXv2233Gw8VqnEHXzZ/hNxuM7aK20rSWse7LYWf0nE48yfZt5K4icaLvruWS3210lvsPNjsmn1599nSHv8QOgzt4rbXd9a6LBU4xzPy8vj7zzvStAuNWqu7vHnPn/Y7Fq7jbpTSrnwOmkvVa04MFC7EQPnIQc/cj3rmF09Iy+SzO+J7VQUEJ2HaU7Znj7qTmP0YXOqS0tByWkk9Sd8rKU1ofUSsiiYZZX7MjYMud7ANysHdaxe3csym/kerW2kWtrFKMehm/2++ITn5ZdjD5RsawfQGgK1B6ROuYXfut1HcW94qqOGXP3zCjp+DeuaxodTaF1RVMIyHwWSqe0+wiMgqvdOFmq7FTunuuk79aYG/Klr7XPTtHvewBV/pFyt+Zlh6NQ8kbDZ+OlkuLg3UGnvgkjiAai1vMXL58h5mfQGroliMVeW3TRl7fVzMHMGwOMFYweTQfWHiWErzq+2MlZzDlew943yqcDq6xVLKm3VElLMx3O0xnGD47flVzaa9d27Sm+aPkzlq6dSqdEe19Ncdo6w/BNUhsE5PKLnBHhpPTEsY6ebm+8dSs3rqgoNaW5lvvTA4sZmiusQEk1O09OVw/fIj8zOO9pBXlvTfFKn1k9lBqZzKO8AYjux2bKfCbx7vX+UO/IXStH6tqNIzmx3ztDaC/Id8t1KT/AAkeOrDnJaNj1G621GtZ6xR5ZL5d18DjoafKjPNLY03Ummq/Sd2dQ1zGlxb2kU8RzHPGej2HvB+kHIO4WNzhehNRaepL1azbKt7DC76tR1g9YQucMh7T/g3DHMB1G/ULgd2t1RZbhUUVXEYaiB5Y9h/KPEHYg94IK8/1GwnYVeR7p9H5mhdOUFmSK2U/NsMIAcpc2yqcjAsZKkELnEdwPmoeYhW6F/M/mI2aEqeNxGsmSp/qEODsQFiZJMSEdBlZp07Jh2exJ7wq8ltYM4HMT4pzaksBhw6GO5spKWal5T6pwR3FJQ8iI02akSQUQP0oXdQnHVIdDDbujCjBwja5AwkB6JwUAOESeAeduqNpQNCIbJUAecomuQA4706NgJAclOTkqMHuRNJS7AHnZJzuVuSeiE77IRBPXTw0dKM1VTK2CEeL3HlaPpIR1A9A+jpp1lusU99mYfhVwcY4ucbtgY7GR9s8H3MHiuma/vZhENoj9YQlr58fXzEbM+5Bx7S5NYqalsMzKGLBt9lp+Rp7nMgaGsJ83ENz9sVxHjVrufTukblW9s74zrX/AASF/f2svMXv9zA/3uC9YtYQ0nTlUl1Sy/e30PILinPWdWafsrZfBHFuNGvJNb351poJ+ezUT8F7D6tRL0L/ALXuHl7VqdvtJDQOU48QE1lt4DBtv1JK7pwZ0TTyON+uELZo6eTs6OGQZa+UbmRw7wzIwO9xHzV5klV1K5x1lJnq0I07OiorZIHhzwGjrYILlqh01NTSAOitkB5J5WkbOe7+Cb5YLj4Dqu6WR9PomhPxNFQaao2jBnhcync77aZx5nn2uWm6w1vHZWObGBVXKbLg15yB9k/xz4LleoKuSWJl21NeG0sD2nsn1OXPeN9o4xvj6B5r0q20yy0qmp1knLzf9kVHhXN/LLlyx9x3qfitp6Z5Nbq+KSYHDuaOpmOfthGQfcVkbJxdoo5+xsmuI45T9Z8JlpAfL6qGNPs3XkGXibo+Noaylu9Q7OA8vjiH0Yf+VKi1ppK7zinNVXWuR38JVxNliz4Etw78Upr1exlLG36IsqOlU4dZPPxPU2sbPZNaTO/ZRpykqpJPWFxoGtpKsn5wljHLKPtg4HfdcE4g8DqvTsE10ss7r3YGbyTcgZUUuTsJo8nb7NuWnxHRXrDdr7oynjqbdVx11kkdnka7tqSU+zYtd965dd0rq2l1DRmvthNHVwj90UT3cz4wdic/XxnOOnkR4891pVlqEOe2SjP3dGaWhpzqRxTe/vPHFwsv1wHK4HLSDggroPDvWJ1BTN0zd5GtrYhi21UhwM/4Jx+ae7wPkStt4s8P6WkYb3ZacQ29zg2ro4920sh6OYO6J3dn5J26Fq4fd6CRjhLH6kjDlrgOhWBjOvplxh7NHFOEqM8SW6PS+gtTzPiOnKpzmlhd8CMhwWOyS6HHmckZ6OyPrkHEPT77xavjGJhdW29gEnKMmWDpk+bCfvSfmrSNNXaXV+nqW/Rl0dypZGwVrmnBEo3jlH2wbv5sJ7wu52etgulto7oYBJFUNdHVQEjD3D1ZmEeDgT7nreXEoarZfmW6Ntb6dHUbR8q9ZLKPOzHAhPlZbWVgdpPVNxtZc50UUnPTyOO8kDhzRP8AewtKw3NleavbYwMouEnGXVBE+R9iyDGimpgTt4+OVXooDLMDjIG+6mmeJ5QwbMCchES0xIBkPyjvhWPjBzNsAqq9wbgDooHuwMpHgdkyDqyOYYcPpSWL58pJmBMI1sOyd0+d9kzG5blIJoYDG6IbIAjzlA0MIge9ADlENinASNfhPlR8yfJSgSA5Tg+Kj5kQOEuAJAfBGD7lCHIgcpAJQ4d62fg7SMuXFzTMcjedlLPLcSM9fg0MlQPwxBam4+qtw4DVIg4pOlP8HZboW+00kjPyOK6beHNWhF92vqRVXinJryO/UNf2elry9x5pJHU9NzE7nJc9382PpXmv0h7ia266ctA+TFFLXvHiXv7Nv0CF30ruYrCzSDnc3y7hyn3RZH5y4FxmZ2+v6R3zbTTNHvL3flcV6RxRJ07NRXeX0RjNCtuSvObRrVso3Mibyty92A0eJPRejoXN03bYLecdnboBE/k73NGXn3vLj71xDSELZtVWCncOZsldC1wPeOcZXV7jVuqqCukdu5+M+1zwSqXhainWnWf3Vt8zbSoO5koGm327xW2iuOorkwTsgwWQE/v0rto4/Ztk+TSuHXOtuWrbnJcbtO6oqJD8no1g7gB3ABdI4wOe23adt7ciKeWereM7Et5WN+j1vpWq0VsDgDhVOuXk691Knn1Vsdc0qfqR7GEZam42ZhBLZmOG8YPuW5R21oHRNLbW8uwWbwQZNc05qq66DrDPRP7ejk9Weim9aKVne0j/AKI7sLrNmvEdQyk1Pp2R0dO95aYXO5nU8mPWhf4gjoT1HmFzKutYwdll+EFybYtaMtFVII7Ve8Usxf0ikz9TkHgQ7HuJV3p1/Utqii3sy2sLqVKrHmex6YtU9JeaCKrMHbW2sjdFU0nNnLTtJET4jqD9qVwLiLoeTRmpK+0SSfCGwkOgnDcCaJ7Q6N49rSPfkLtGiZXW2puNrqR2WxkbE7ulYcOH3uc/ahYbjzTG5aX03fA0MNFNJZpjjdwIM8J9wMrfY0eCvtepxr0o3S69GbTiDTVK0jfQXTZ/M5DwiuTLVrc2eoPLR3uM0ZGfVbMcGJ2PJwAz4ZXeeH9RKwXS1PaebAqWNzu1zDyvH3pyftF5cvAmoZoa6mJbUU0rZo3Duc05H5F68t1LHSa3ttdB6sF0jhqBgbBtVEC76DI76FUaXduknBs6eC6niVJUX23/AMmkccbIPgWnL6HEyvMtrqD3fU8SRE/cyOb7IwuZtbkLv3FijbUcJ9RktJlt81FWsHzeWUwv/BPv7B4Lz/TS87A89O5VV1hV5YMtxTZqy1SrCKwnuvmZBj+wp9urhjZBG7Byqpmc8jPVGyTqCVzoyiWCy48wzlRE59iM5EaUUDptgOqRi5IcEnZJZSGhZEMuOHJKJzSDd9DT4h6uyZ4wU0bkfyglBgAosqPGCiBygaGDj3ouZRp2pQJOqLOyjBwU+d8pwEgKc7oA7KfO6ADGUbThR8xT82EAHIfVWb4QT9nxAlcDj+1Nd/MlYFz/AFHeay3Con9ndR5Wiv8A5krrtH/M0/ivqNmsxaOuvq8aNYM9bk/+ZauScVxza2o3fOtdL+aV0QVBOkGNzv8AGLz/ALJq59xZaY9ZW/braKQ/iFeg8VP+WgvzM5LWzduuZ9ypodxdr/TTR1NdGPwrp0LDLaa0/N7P85cw4ctEvFHSUfc+5QtPvdhdZtUXa2i6+TYvz1W8MS5VV+Rr9HoePV+BzDi9B9X0kfGlqT/tgsLR04awbLb+NNMIhol+P3yjq/wThatCeVox4LJXzzd1PiyqvY8lxOPvJgwJiwY6J+dCXZXEcRVqKcPB2Wp3ymfA3toyWyRESNI6gg5H5Fuhweqwl7g545A1vM4jYDfdHTcdF4Z6Ple2u1rT3EN5W1zIKxuf/uKdkh/nXKvxGjZW8INSNcMvoqy31rN+hMroT+LMVsN3tDrDqSmoJsdpa6OhpJHDpzQ0cLH/AI7HD3LTtd3D4Lwg1hM6QN+ES2+jY09S41HafmxOPuWtuqydkoy7pH0DfW7XDEp1e8Uzg1yiEtI/bZeltNTPqeH3Du6OJEhtEcRcN/3meVg/A0fQvNriJKME+C9PaFt5HB7h5EcucbdM/HgH1k5H4FjJ1/R1zGG4CWdWUezizJath+MrFr6kJw19prXY843NlH82vMlG8Op42juXpDUtf8DodcTOdhgtNyBP20T2j8LgvM1lkdJSN79gkhX9IbkT/aFBQ1SOPwoyZHLghOwmbYNx5qSKIEAu2AUvbsiHqgHCmcsdDy/dluhhZ0ldgd2Vc7aJjcM2wsE6peTzDITSZeAeY7qPEpdSRYSL1XVOJw05CSx45h9cknpJBzMwcblMAT0UnbQRfJZlMa4nZo5EReSNtgvp3vbsMHz2QdkWDJI+lKSd7xucqMnKXoIs9w9vHKQdlR4ICW+Qmi4JebYpwVGN+qIZCXIhIDuiUSIOwjIEgKfPeowd04OyUAnk8qzPCjfXNWfCz15/2JWEefVKzvCJhfrqtAGf7S3D+ZK6rV/zFP4r6klNZkkbrTy8+n+zzuKxzvxAtX41x9lrK0nvNioXfSwrYaMn4C9mNhLzfi/8lr3HObn1rZ2tOcaet/5hW74omnRhjzNBqFuqVvCSRjuFTO14xaFZ8+80zR9+F2HTcfPZ7xtuGRfnhcl4LAS8c+Hcfe6+0ox/pAu26Vo+e1XjA+sh/nAqrQKnJGq/gaThC3VWrN/A576QNOIbZw2fjBfRV5PuqWrnrHYaPZ3Lp3pMs7G28MGj+JXDP8pauWRu9QLM3b5rio/ezIaxDw7+tHykywDslnbKiDki/dcxTEhcACVtnBzR8etOIVF8NjcbFav7Z3SUbBkEZBDfa9/JGB3l6wmltI3rXV7gs9hoJbhcJzsxgw1je973HZjANy5xAHeV36h03QaCsX7F7JM24VE8jZbtd4hhtbM3PKyMnB7CPJ5c/KJLj3KehT8SW/RdTXcN6FX1u9jSivUW8n2SA1Ddprm663etPNWV0ryS3p2kji52PIDm/AuV8bK82vhzYLK4g1F4uj7pygbtggYYWE+18kv3pW71c7r3daa2UcjBAxxaJpHYjz1fK49zQBnPg3PeuC8Q9aQ8QdfVdXQl/wAS0bGUFta/Ytp49gfa4lzz5uTbi79IqOMPZR69x/e0bPT4afSe8u3kkYyeYU1uc53RrSV7TtNtbZ7NpegkaIxbrRRQyt7mu7ISSZ+6e/PsXlrhrpM6211YLOY+0p5apj6rwbAw88pP3DXe8heudStdSW+51725fNzNaPOQ4x7gT9CxGv3qounST3Zlvs7tc3NW6a2SwvizkPEiuMHDHV1Y7Z89NHTAec08YP4A5cIs7+ypWgbldI4+Xc23R1qtbHDtLpXdrI3v7OBm340v0t8lzK1/3OFbaSm7dSfcoOObpXOszS+6kv0Mk6dzu9Jp5uvco84TgluVdnn2Sdrt1aZGJm7HBx0VAPU9PPySYzsdk0cmE9rozgjCSnkOdnDKSXINGs425m9EgcpUruZpYfclJHyPxukzh4Y1LIjkJ4wTnyQnZOw4alEYZGULnhvuTk5woZncrclIIdP03wajv9gtV0n1nY7P8YQmeOlrIqt0jW8zmjmMcLm7lp6FZpno70z/APxJ0uP9XuH9XTaPcyp01oqJ+eR9GyM464M8nT6VDcuKtDbrtXUkel+dlPPJC17rm4Fwa4tzjsvJb600K1rW1OtOTy1kgiq05NR6Fxvo50x68TNL/wAnuH9XUrPRtp39OJulf5PcP6ssS3i7Sv3Glmj/APJu/VKxHxbgB/8AZce+5O/VKZ6DY/jf7FtRsqs/aaMqz0ZIXf8AidpT+T3D+rKQei5GRtxO0p/J7h/Vlj4+MEQ6aZbj/OTv1asx8Ymf/LbAf84O/VqJ6HYx/wCyX7F7Q0aNT2pFg+iw1w/952lMf5PcP6srmlvR2rNG6hF2oOJOiqmYwS0zoa2iuT4nskbyuBDYGnp5qk3jAw//AA8wH/LnfoKZnFUP/wC42DPhWE/0FF/xFjB8yqyz8jQUOGLefWobfFw4uQyBqnhc1udwbXd/0VresPR0q9a39l1ruJOiaaVtNFSshoaO5MibHGCGgB0Lj3+KrO4khw2s4af8qJ/oIP2xJM7W5gH+PP6KguLa1msVK0maCPCFtWSU6z/VEdj4EycL+JvDPUH7K7NqGnfqmjo3MtrKlj43HLwT2sTARhh6LP6RrHRWu7Z744vzwsFV60fcrhogGAU/YaqpJW4eXZIjkx3BZ/TsbBQ3IAfKZHt92FU0K9K0lVjB7PBacK6XC0vrmhTeYwcdzHcRdDS8V75oGzx3ahsYprPc6uStuIkMTWsqWZGI2OcSeYYwFQHovxBo/wC03Snt7C4f1ZHqS7TUGuNPOiw4R2K4N5c42M8WQoW61mZ8qkYf9If+CoJXdBTbqt7+RBacI2muXt5Uuajjyza2HPoxxNO/EzS7h9hTV5P/AOuFbtXA7RtlqA69anuWpD/FrJRiki+6mmJdv9jF71C3XL8ZFEz29of+Cc6uq6lvLFBBE53QgFzvy/7lE9QtI9Ms0dL7O9EoSUqtSUl8UvodAhvdJabJUWqxW2k0xYn4+ExUzjz1WPkmomd60pHcDgeDQtQu+oG1gNBbWucyQ8jpeUl0vk0dQPwnyWtXqrfSxCqvVcyjp2jIkrH8ox9iwbn3Bch1fxylfFLbtJtkgbI3klucoxK4dCGDfkB9pPmFy1b2tdrw6UeWJYX2uaNwxb+DZxWV0S8/ezY+MWu47Db59KWWobNdaxnJdKmE5FPHnemafnEgF5G3Ro71zGx0XwWHvGFjbTQknmeS57t3Od1JXXuDvC2r4m6np7bC2RlExwfV1DBuxmeje7nPQD39AVI5QtKTqVHhI+ctRvrnXL11Z7ykzsvomaEkZQXDVFTA5slYDR0Tif4AH6q/A+c9oYCfmP7jv07iNLz1dPa4cuMI7SRje+Rw9Ue0D85dMdZqPh1pNsjKeOKKmjbDBTtGxcBhkY8hjr5E9SvMXGPXx0Jpe43Z0nPeKsuipcnDjO/68eTAeb2ho714z6XU1zU3OHs5wvge0aV4Wg6a5P7qy/fI4DxkvkWpOJVXDSuL6K0sFvjIPquewkyuHkZC/HkAqdCzkg2GPJazYoSWhzyXucclxOST5rao/VaB5L22hTVGlGC7Hgl5cSuq868+sm2TDdPzZBCja7CclT5OMNONx4qPmwiY/lOUg4vQyCZhBPrjx70lWD+V4e35WMJIDcwLJNxvuFl2wGqgDh8obrBB2CMLNWepw7l6+SdJc6yuqG83K89iGSHLSQDsq42CztZThg52j1T9Cw9TFyHI71DCeepK1ndEXMq9W/DD7EZfuq9YcsO/cpBh2zh+7tNP6LyekEf8+9a9NT/BL9rGs7GGV9LTV9REJ4myND2vyDyuBB7+o71n+Hw5dN6Od82nYf8AbPWOu7Ozk1s/HyqCvH4y9I8Tl0mLT6RNLTsf5J18djjzeL+oo+lNbCfH4tp/0E/7cmoyMfBrZ/5dB+rWBioTIMgHdSi1H2rz70ms/vMzW/YzH7cWo+6mtv8A5fB+gkOMGpT/AAFuH+oQfoLEfFZ8PwJ/is+B+hNder+JkqnNdG/1Mt+3BqUHaG3/AMhh/QW1cMdVal4i6rFnkuNHZ4xTS1BqY7VBMQGNzgNw3r7VoIthaNwfoW/cBouw4inHX4tq+n+LSeLUX3jvspVK9zTpOTw2l1fdnVhoa6QRF/7NQ8c3LvpymBz7OZcs4m6x1LoLUwtNNcaW5xGmjqBO+2QRH187coaemPFd2bJ2lIN+knX3BcN480AOvYDjJNspj+ByhlcOVZ04yPVOL9Cp6HZUq1tUlmTw8v3GM4f631BqriLo+iuM0RpW3aGYMigZH6wyMnlaM7Er0XaJDBSVoJ6tZ+cvNfDFhpuJ+ktv+8od/ul6Mt2XtqAcNBa3r37qnv7mVHOO5bfZpUjNXEqst/V6nL+OurrlpS96WrrW9jZ3UNVC4vY14LTK3IIcCO4Lmb+M2qXEkto/5JD+guh+kVQ5rNI9+aap6f40Lkptx8PwLot4RrUYzkt2eba9qFxQ1a5jbzaTm+jMoeMmqj0+CD/VIf0FBPxa1pUxujbdHUzXbZgY2M/iAKj8Wb9FMy17jZTq3pdcFBLVb2fWq/1MNM6vu8naV9XPVyE9ZXl35VkKO1gYAZhZ6z6Wrb1WMpLfRT19U75MNPGXvPuC9IcF/Qr1JrGohq9QsdabaQHdiw/VX+Ic7BDPYMn2Llu7+z02m6leaikc1OlXvJYSbZxbhhwpvnEq+R26z05LWuHb1RYTHTg9CfEnGzRufpI+jvB/gzaODukwwhsIjb2tTVTAcznd73kfXdwx0Gw8950lw80pwX0zEyGGC3UsIIDgN3OPUNG5c4+JyT3lcy4m8RfjuN75ZBQ2enBkbE94bnH8JI7psPcPwrw/W+I7jiCqra0TjRz85HoOkaZG2/iS6rq+y+HvNc4la7hu08tbO9tFaqNjjEJdg1g+VI/zPU+GwHn4A4q8QH8UNZmqh52Wij5oaKJx6tz60h83EZ8th3LYePXHCbiBXTWGySubYo3gTzjY1Th3DwYDnA7+p8Bzy1UIY1oA2XpXDeh+gU1WqL1mtvcVGv60rrFnQ9iP7mXtVP2bBsssCQFWpmBjQFOfwLdmGyPzYKMHIUR9qcOwcIDIed0s4HVCThMSUAiQSuHfhJRgpIH5MP0wpqaZ0Ugc04UJCQOAlzgMJrDNjhuvPGGPAPgVQq6gc5a5uPPKoRzlqsSPFRHnbmHh3qLkWcixfKuUg5suJ8VDVkdnlHnGyhrMmAqQadq0TMI9KaTPU/BWH/bPV+Oipp7peY62F89LVCoppGRydm7D3HcHB8PBY/RVDVTaJ0xNBTTyhtEMPiic4AiV/eB1W1uu17YSfi9xcTku+K2kk+PyFs6N1RdnGlUfY9x0i2tLjTIU60lut9zW4OFOjGMH7luXvrm5/m1ZZwp0g/8AvW4/y1v6tZoXnUDjtQy48rWP1aP431IOlFMPZbB+rVJWnYw9lfuWNLhjQ5e01+pimcINIOH9zXEf640/+mpf2nNI/wAWuHt+Ft/Vq869am2xS1Putw/QUbrpqWTY01Z7qE/oKir3tvH2Y/uW1PhPh1+01/7f7Kv7Tej3bGC4gePwtv6tV7Tw9tGjuItnfaTUBtZaLoZG1EgfgsjZjBAHzyso12oZRk09bv4Ujh/RVmgpq6XXGnvhccrJhZb2/ErCw4EUfcQPBUsr/wASWIr/AOwV2r8P6LYQo1rHHPzx752yW6Oie+zukaM4qMdPsAsDceHVu17xOq6e6moDaayW50Yp5Awkv7XOcg/NC6BpSlfU2F+WggVmPxAqlTR1VLxVvklCx5qIrDaHDso+c9ZwTy4OfoWYpahNyrzg90jRcYU6F27S3r+x4m/bbBjqL0X9MuqYKinqLtSVUDw+OaGrDXscOhB7PZbCPRvkqt2ax1Q0eHxq79BXotSaqpN2PqQPO3j9BZKk4iarix9VqBjvNvb+rVFW1LU5ezLPy/0Uc+H9JpZ8BxX/AJswDvQ5t17qIprnfr5cpIm8kZrK/teQE5IGWbe5Zil9BrTc+P3XWj/Tj9BbJRcRtWvHq1NQD/m5v6tZOLiRrSPBFZUjHcLcP1aqZ6xrsdoTx8jP19B09ttcuf6jXqX0ANMT4Lq2tPf+/D9BbVYPQJ0Hb6mKeoppq2RhyGyzSOafa3m5T7C0hC3izrRgw6urG/a0AH5I1WqOJl6naTX6groI+8VNSadn4xaFwVNS4hrLlVV/JFVLR7OlvmCXxO32bh3oXhrAM0tstY5QeV7WRc2PsABzH3EqrfuMtspIuxsNKamTGBUTtMbG+Yb1PvwvKuq+NejNMulfWX+klqcZPYSfCHOP2zfVz7XLgmuPTHqqkSU+mLeW5BHwqtAd7wweqPfzKO34Z1DU589y3L3yZz1bvTrJe3zvyXQ9R8VeL9NZKaa86juwOQeR0jtiPCJg67/N2HeQvEHFvj9eOKE0tBRmS32Pm3YD68+OhefDy6e/dc/vt9vOtbi6uvdfPcKl310zy7A7sZU1FbuUjb8C9Z0fhu305KUlmX0MnqGt1bteHT9WHkhrZbwwAAYWyUlOIwPFRUlJ2YG3Xu8FeAwFs1t0M1nJINgN1IHbd6gz5pw7ZA0k5u5P1UZdl23TCcFLgCTm2SDvNR+9LOEYFJQcpKNrt+qSXApjCcoeZMXJk0eGDupI5C1wI6qDolzYKAZPLgkPb39faoKol0QUzXbZO+VHLH6ntKBM9jUq51bFIRFVSMZ3NBwAqna1/wDHJfpWzVFGHk7BVH0ODjCR5fclVaoukmYTtq8H+65Pvku3uH8cl++WbFvz3BL4u8vwKNxT6jlcVfxP9TCdtXn++5fvkXa1/wDG5fvlmhb8dwT/ABf5fgSeHHyF9Jrfif6mFbNcB/fkv3y7r6HRlq+LtWyrldMP2PXMND+49iuTCgx3Lr3omt+DcZmDp2tprovpjwuK8jGnbzkl0T+hZabcVJXlFSk8cy+p6+0tp+Ntgl5Gj+7P/TC8fembNWUfGSmjpZ5IP7RUQfyHrvIvfek7IW2SUcpx8Lz+IF4S9MZol43zM/wdspo/oMi804Uq+kX1aMt9v7nqPHF3KdCKT3U39DmPBS1N1dxf0bZL1LNU2q4XSCmqoRIWF8bnYcOYbj3L3VpT0ROHWpHT81hkp+zYHjluFSc5OMfLXivgq34Hxn0PN0LLvTuz92F9ZOGtkLJan1TvA38oU3Gmo3GmRp+jS5cp9PcY7Qo0q9CtKustYxk+cXpn8NrVwY1Lpe36TZUWxtVSzvqR8Jkl53Ne0NPrk42J6LzuL5eu+5Tn7pewP7JCwO4sadp8bxUMuR7XMK8o/F+3QLZ6Hi706hWrLMpRTbMvfy5bmcYbLJjX3i7yjDq+Z3tKrPfcJfVdXT8vgHkfkWbFu8kbbdjuV6qNNdIlfzvzNfitoJy4FxznJV+C39NlmI6DHcrcdJjuUqikMyyhS28DuWWp6YM7kcceMKcbJ41iYAE5Pcm5k2UCCzhLKE7pgUDskrCjDiNvBRxOHPgon+qcJ68gHznyTge9R5TiUNG/XuTdxyHldyjGUlXceYklJKIU8eKXQJufPcm6hNHDlyHKRCZpyUAWIvkqTq3B7lG04CcO9QnzQhvcjkA3yoezBKJz+ZxPd3J2k5QOHEAwl2IRnqkCgAexAS7MIiUh5oAYxgNK6D6NDizjfZmtOOeKZh9hAXPyfVXRfRigNRx606wd/aE/QFW6i8WlV/lf0O2yfLc0370fTbTFpb8Vyt5dvhGfxF81fS3Bfx6vIP1kUbB7A56+rGnraG0EuBj6sD+KvlZ6Xrez9IPUDe4Bv5z141wFU59Rr/0r6mz4luPFhj8z+hoHDh5g4n6Te3q25QY+/C+0+i7VHTNe7G5hb+UL4r8PWGXifpBg6m504/HC+1Wla4ESNz0gb+ULp+0iMv4GPzfQzOm3KoqcG+uD5qf2Rt/Nx/pI+5lEcfiLzYIQV6P/ALIm7n4+0snzqI/0F5zDth7F6Zw8saTbr8qKyvPnqykMIWhEIhlLmCQctHk58BBganyAgzkpFICRLnGyMnZQE7qY5LdkCNbglxTh23VBzb7piUCYCL8JubJQpi7CB2Ai7fZWS7tIw4fKColylhmLDseuxSPzDBK52NlESjlHK4+B3UBcpM5GhOdgJKOU4Ykm5FIwQExO6bGE6QCN5yiibunIynbsUC5Cd4BA+TEYaO/qjY0yOIHyR1coajaYgdEAhh1Uke5yoQ5SxH1SfNApJndC47pc26HKADBwlzIeZNlJkCQnIXVPRFi+EekPp1v2Ex/AFyjqF2P0LohL6R9gDv8AAz4+9CrdU2sa39L+h0WzxWg/ej61W2nbT0Tx0+qf7l8lPTMj5PSLv+Pro2O+lz19Z7xVChpIz0zIR+BfJb0zH83pCXZ/z6SF34z14p9nUX6bWn5xX1LbV7jxKnJ78mgcLW83FvRTT33em/PC+t2h752s9Y3mzy0zfzgvkrwhb2nGjQjT0N4pfzwvpVw5ux7e4ku6UzD+O1bbjGz9LhT26ZMFqN96HUhv1PIP9kFd2nGS0zD6+kk39hYvObXea9AenjVCo4kadk8aWf8APYvPQdsMeC2GkU/C0+jDyii2t5+LSjU80TZyko2nKLJVwdIYOyfO6DmTcyADO42Vhjj2bfYqnNlTQybBpQAbnBxQZARva0jbYqM+qN9x4hAgWcglQl2Sie7EZx1PTZA2N7ugP0IyhMMRclzFTMo3uHrDHmphStjGXHKZzofykbX88eFC/IKsEsb0CF+OuERbGsqyjcbhJRyv5nFJPFCTqCKTGxU46oGgyEDCaNhmfyj3nwQkF8mBufBX4YxEzA6nqUr2WQ7hBojYGtCxsxzO/wBqyZWJl/fXn7IpqFyOrDWBsQz7VWB5iAOpU08m4aO7YpRQSSSllCBlOCgCzbbp8SXGluBpIa9tNK2R1LUM545Wg7tcO8EL6C8I9FcEOJum6C8S6boaWKrZztkjp2OY0g4cxwxlrmnY+WD0K+d0pwFu/AbjPNwt1Q63V9Q5mmrnIBPnJFNJ0EwHh3Ed4J8ll+ILO6urZuzqOM15dyzsq9OlLlqxymfT6l9ELhTXU7JqXT1BUQu+TJFBG5p94Cy2lvRb0Hom/wAF5sthht9yh+TUQQNa4A9RkN6HvWg8KuIEtnnNJNVmO1VxB7RknqxyEerICOrSMZPeCD3Lo2ptTVljo5J3S1cojIDhFIcjz3I2XhE6utTn4E7iTT2JLnUaFB5jBGx8Qp30lupHEFuZn9ftQvlR6Xk4n45Vr85zRQfnSL2BfvSl0bNM+nqtRwvlhcWOjmq48scDgggv2OV4e9IfUVDqnirU3G21UVZSvpYg2WGQPbnLyRkbZ3C9J4N0qrp1SXiRa27/ABM16VO6upVJRwjE8JagQcYdDyfNu9OfxwvoJw2lnndcuRjnk07NmjP14Xzr4f1cFBxJ0pU1M7KanhuUMks8ruVkbQ4ZJPcF7Os/GnSlo/e9UUdLJy8pdFXRtJHtD16LdWqucKRg+LqdzUdL0eDl16HS9R8KLPrGujqr3p2musseRG+sohKYwcZAJHTbKpDgfo6lYXP0ZZmxsGXF9taAB7wsnpXU1RqOkjqaO41U1LIwSRzip5mvaemCHHKDiBep6W3us4q5pKiYB9WTI53Izq2PGep2cfLA8VZ2li8KEeiPKJ61qdGfo6qyi128jUrnpzhdbYah79L6eEVNG6aoqTQM7OGNoy55P12B3DqcDqV4j4h6rtus9YXG52azUlhtD38lJRUkQja2JuzS4D649T7VuXpJ8S+3qTou1zc0bXNkuU0bs5cN2w58urvPA7lyGk2Y0d2FJVSi+WJ7hw3a3lO3Va9qOUpeb6FvmCXOAna0HclG0RjruoTYkQ9bopqeF7345SAi7Zo6NCb4W8OyDhJuGS8yiLgMu2V2C1xHZx5gseyZzyCHbFZGB7mtG6hnldx66ZCmo4IW7NBWMnma0kAY8FfqZct6rESjJyuyFOKhlnJGTk92OZicoOcu7/co3HCcO2wocJdCdIkGU5IEZz3oWjJ3Q1L+UNaOvVJkckVZAGklJIknbqklyJlBOo+Xfm3TAvjGHDIQS1xdnkGPaq7pHOIJJKVDWZOliDRzn5Tt/YrHTvyscyQsI32VxlQ2QeB8Ej3GslBx7FiHnLj7VlSQWrFxxulft0yhDh4xyZeRsOntQZ3z3qWrwAxo+T1x5qulHIkzuiBx1UQO6JADyAO6LE3GmD2OBGQVlhvsq1THzAoaysAegPRo43uqLe3Rt4nLqymaTbpXn99iGSYj5t6t8sjwXsbQ3EQ6ktxs9W8Pr4Iz2Jfv8IhA3b5lo+lufDf5QS/CLdVwVlHK+CqgeJIpWHBY4HIIXrvhBxO/ZpZqa6wTfBL3Qvb8JZGcGOYbtkb9i7GfI5HgsNqmjU5VPGgsZ+pnNZU4UXVga76YPAD4LWyazskBELjmviYMDHdIAOpHR3lg+K862ymEEYAC+o0Nzt/ETTBn7KNjpB2VZSgfvUpG+B8x25Hlkdy8E8aOF0/DTVksUcJbaql5dSkdGd5jyfDu8R7CtHp7qeEoVeqOHQ9ahfZt6j/iR/deZzW4RCWItz1W28B+CkvFbXcMEsbnWehLZq0gkdoM+rED4uwc+DWuPXCwFNbp7vWU9HSxmapneI42AdSV9EfR14XU3DLQ0EVQGQ1EjDUVdS7YdMuefLAwPJo78rR2trK5nhdBOJtcjolm6i3qS2iu+f8ARtb5aPh7pltQ2NmYmiGmp+UBskmMAY+a0bnyAHevNnGrjG7QmnqioE/bX6uc5lMHHLjId3SnybnPm4jwK37ixxGpqiSpuc0pprXRscIA/wCsjHVxHznHf2kBeDNa6tquIWq57nUZbAPqdNBnIjiGcD2nJJ8yVpL1x06gqUfbl+x51wpoUr2t6bd775+LKVJ2lVPJUTPdLPK4ve9xyXOO5JWahbygKlRQhgV8dAsce7JYWESZ22TZ3Q82ybmCBQ84RNKjyiaUqAtQ1IheA4ZaRt5LLMna9gLXAjyWEe3mg26t3UUU74d2HHsUcoZYjbcWjLVMpx1VIv3QfDRIMO9Upid+ufYultcqRFTi0tw3HKFu5TZzsnbsoOhOiZm6qzP55nHu6BWHHkjc7wCqNGT5pmQe+wbGFzklfo6XnIykuedVJ4LCFtlZZgMpx1Qgd6NoJK68lYWGn1UxJ7tvBSRREt32CGadsezRk+KMjseYYq+VvK/fPeOqlh5Gt9TfbcrGcxc/PipWvMZy04KUQnrfrMKqAD3qSabtGjPygoQm5EyGBhPlBnzTgHxThwQdhMdwl3pwgCnVQczUtIaureHepIbpRjtI/kVEBOGzRn5TT/uPccFWHjm2WMrqYPa4EZB2TJRUlhkc4RqRcJLZntXhxxGjo56K+22X4ZbKyMCaLOO0iPVp8HtP0EeBXYOJfDa18VtFPZERUsniMtJUsaOY9cexwPd4gg7Er588GuIx0TePiyvefieqeDzOGRBIdg4eR6H/AJL25wo4jstFQy0VkoFqqn5ilc7LaeU4Gc/Ndtn3HuOdDplrTuYOPdHhev6bdaRdq6s+26/wzQ/Re9H6Wk1LXXq+RMd8BkMMTerS4d4z4/Tj2ldh4060bQRnTtFJhw5X172np3ti/IT58o7itp1xrGHhtp6aqbGxtwmc6OlgLcB0ve9w7w3OT4nA714n4y8UZLDZZeScyXm4ud2b3Oy4En15T7CSB5knuWuo0KOmW7qy6L92cVpSu+K75X1zHEVtFeXmzQePHEmTUVz/AGP0EpNHTvzVOadnvHRvsb+X3LntvpQxoPeqVDTue8vcXOe45cXdSVnIIw1oXnlzcyuqzqy7nvFrbQtKUaNNYSLEYDQj5gg5k65jtCyEuZBzJA5QBJzbpw7BUYKWcpUBkIHgtIPQjCpyt7N5HgUcEmCAirG5DXj2FI+o1MquOU7JHM6HPkhzlMgcWo5A4eamjVAEg7KaKYt69EjFXUtVLxyNb4pUsXM4KJ7g+XboBhX6RoAXLUlhHTRis80jKUcQAGOqSUEgaAfBJVrjKTyOndqMsI1BrC4qzHG2McxwkkrebaWxzJIhmq87A7KsXkpJJyW2RsmPGfX3R5wUkk9DewB6os4CSSGINkJySEkkgD580s470kk4BEjKhmZzApJIF7GFr6TmBXZ+CvEp1fRfsduDy6tp2fuZ7zkzRj6z7ZvUeI27gkkrDTa86F1CUO7K6+t6dxQkqizg6drHX1RNbo6291756e30ojjc8jLIx0aPEknGepXlPUF9qNY3+oudSC0PPLFHnIjjHyWhJJaTiWvN1o0fupdDl023p0oNwRapIeVoV0bBJJYsu0OHJyUkkCiyEuZJJADBycFJJABNdyuCuEiWnLevgkkiXsjH1MeTg4SDt0kkDxwco2AlwHmkkkYsepaAxI7wyrcUvKkkuKSy9x8m0sIssqcd6SSSnjBYK6UU3ln/2Q==';

  // Dismiss context menu on click outside & Global Copy Code Handler
  document.addEventListener('click', function(e) {
    if (activeContextMenu && !activeContextMenu.contains(e.target)) {
      activeContextMenu.remove();
      activeContextMenu = null;
    }
    var copyBtn = e.target.closest('[data-copy-code]');
    if (copyBtn) {
      e.preventDefault();
      e.stopPropagation();
      var codeVal = copyBtn.getAttribute('data-copy-code');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(codeVal).catch(function(){});
      } else {
        var ta = document.createElement('textarea');
        ta.value = codeVal;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch(err){}
        ta.remove();
      }
      var origHtml = copyBtn.innerHTML;
      copyBtn.innerHTML = '✓ Nusxalandi!';
      copyBtn.style.background = '#10b981';
      copyBtn.style.color = '#ffffff';
      setTimeout(function() {
        copyBtn.innerHTML = origHtml;
        copyBtn.style.background = '';
        copyBtn.style.color = '';
      }, 1800);
    }
  });

  // ==========================================
  // VIEW 1: ASK AI TEACHER (ChatGPT-like UI)
  // ==========================================
  function renderAskAITeacher(container) {
    window._ethithCurrentView = 'ask_ai';
    if (!S.aiConversations || S.aiConversations.length === 0) {
      var initConv = {
        id: 'conv_' + Date.now(),
        title: 'Yangi Suhbat',
        messages: S.aiHistory ? S.aiHistory.slice() : [],
        updatedAt: Date.now()
      };
      S.aiConversations = [initConv];
      S.currentAiChatId = initConv.id;
    }

    var activeConv = S.aiConversations.find(function(c) { return c.id === S.currentAiChatId; });
    if (!activeConv) {
      activeConv = S.aiConversations[0];
      S.currentAiChatId = activeConv.id;
    }

    var hasMessagesInActive = activeConv && Array.isArray(activeConv.messages) && activeConv.messages.length > 0;
    var history = activeConv.messages || [];

    var html = '' +
      '<div class="eth-ai-drawer-backdrop" id="aiDrawerBackdrop"></div>' +
      '<div class="ask-ai-container">' +
      // LEFT SIDEBAR: Recommended Prompts & Info
      '  <div class="ask-ai-sidebar">' +
      '    <div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.05em">Recommended Prompts</div>' +
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
      // CENTER: Main Chat
      '  <div class="ask-ai-main">' +
      '    <div class="eth-ai-topbar">' +
      '      <div style="display:flex;align-items:center;gap:8px">' +
      '        ' + ethEmblemImg('eth-brand-emblem-mini', 'width:24px;height:24px;border-radius:6px;object-fit:cover;vertical-align:middle') + ' ' +
      '        <b style="font-size:14px;color:var(--text)">ETHITH AI Teacher</b>' +
      '      </div>' +
      '      <button type="button" class="eth-ai-mobile-history-toggle" id="btnToggleAiMobileHistory">' +
      '        💬 Suhbatlar Tarixi (<span id="aiChatCountPill">' + S.aiConversations.length + '</span>)' +
      '      </button>' +
      '    </div>' +
      '    <div class="ask-ai-messages" id="aiMsgBox">' +
      (history.length === 0 ?
        '<div style="text-align:center;margin:auto;max-width:520px;padding:20px">' +
        '  <div style="margin-bottom:16px"><img src="' + ETHITH_EMBLEM_IMG + '" alt="ETHITH AI Emblem" style="width:115px;height:115px;border-radius:24px;box-shadow:0 12px 28px rgba(0,0,0,0.22), 0 0 20px rgba(59,130,246,0.3);border:2px solid rgba(255,255,255,0.2);display:inline-block"></div>' +
        '  <h2 style="font-size:24px;font-weight:800;color:var(--text, #1e293b);margin-bottom:8px">ETHITH AI Teacher</h2>' +
        '  <p style="color:var(--muted, #64748b);font-size:14.5px;line-height:1.6">Ask any questions regarding English grammar, quizzes, vocabulary, or learning roadmaps. You can also upload images or PDF documents!</p>' +
        '</div>' :
        history.map(function(m) {
          return '<div class="ask-ai-msg ' + m.role + '">' +
            '  <div class="ask-ai-avatar" style="' + (m.role === 'user' ? '' : 'background:transparent;padding:0;overflow:hidden') + '">' + (m.role === 'user' ? (S.user ? S.user.name.charAt(0).toUpperCase() : 'U') : '<img src="' + ETHITH_EMBLEM_IMG + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover">') + '</div>' +
            '  <div class="ask-ai-bubble">' +
            (m.fileName ? '<div style="font-size:12px;background:rgba(0,0,0,0.06);padding:3px 8px;border-radius:6px;margin-bottom:6px">📎 ' + esc(m.fileName) + '</div>' : '') +
            (m.fileImg ? '<img src="' + m.fileImg + '" style="max-width:240px;border-radius:8px;margin-bottom:8px;display:block">' : '') +
            formatAIMarkdown(m.text) +
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
      // RIGHT SIDEBAR: "Suhbatlar" / Conversations History Panel
      '  <div class="ask-ai-history-panel" id="askAiHistoryPanel">' +
      '    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
      '      <b style="font-size:13.5px;color:var(--text);display:flex;align-items:center;gap:6px">' + ic('layers') + ' Conversations</b>' +
      '      <div style="display:flex;align-items:center;gap:6px">' +
      '        <button class="eth-btn-primary" id="aiNewChatBtn" style="padding:6px 12px;font-size:12px;width:auto;border-radius:8px;' + (!hasMessagesInActive ? 'opacity:0.4;cursor:not-allowed;' : '') + '" ' + (!hasMessagesInActive ? 'disabled title="Hozirgi suhbatingiz bo\'sh. Yangi suhbat ochish uchun avval xabar yozing."' : 'title="Yangi suhbat ochish"') + '>' + ic('plus') + ' Yangi</button>' +
      '        <button class="eth-modal-close-btn" id="btnCloseAiDrawer" style="position:static !important;width:30px !important;height:30px !important;font-size:13px !important" title="Yopish">✕</button>' +
      '      </div>' +
      '    </div>' +
      '    <div class="ask-ai-history-list">' +
      S.aiConversations.map(function(conv) {
        var isActive = conv.id === S.currentAiChatId;
        var msgCount = conv.messages ? conv.messages.length : 0;
        return '' +
          '<div class="ask-ai-history-item ' + (isActive ? 'active' : '') + '" data-chat-id="' + conv.id + '">' +
          '  <div class="ask-ai-history-title" title="' + esc(conv.title) + '">' + esc(conv.title) + '</div>' +
          '  <span style="font-size:11px;opacity:0.7">' + msgCount + '</span>' +
          '  <button class="ask-ai-history-del" data-del-chat="' + conv.id + '" title="Delete conversation">✕</button>' +
          '</div>';
      }).join('') +
      '    </div>' +
      '  </div>' +
      '</div>';

    container.innerHTML = html;

    // Mobile drawer toggle handlers
    var historyPanel = document.getElementById('askAiHistoryPanel');
    var drawerBackdrop = document.getElementById('aiDrawerBackdrop');
    var btnToggleMobile = document.getElementById('btnToggleAiMobileHistory');
    var btnCloseDrawer = document.getElementById('btnCloseAiDrawer');

    function closeMobileDrawer() {
      if (historyPanel) historyPanel.classList.remove('mobile-open');
      if (drawerBackdrop) drawerBackdrop.classList.remove('active');
    }

    if (btnToggleMobile) {
      btnToggleMobile.onclick = function() {
        if (historyPanel) historyPanel.classList.toggle('mobile-open');
        if (drawerBackdrop) drawerBackdrop.classList.toggle('active');
      };
    }
    if (btnCloseDrawer) {
      btnCloseDrawer.onclick = closeMobileDrawer;
    }
    if (drawerBackdrop) {
      drawerBackdrop.onclick = closeMobileDrawer;
    }

    var msgBox = document.getElementById('aiMsgBox');
    if (msgBox) msgBox.scrollTop = msgBox.scrollHeight;

    var fileInput = document.getElementById('aiFileInput');
    var filePreview = document.getElementById('aiFilePreview');
    var currentAttachment = null;

    if (fileInput) {
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
    }

    var newChatBtn = document.getElementById('aiNewChatBtn');
    if (newChatBtn) {
      newChatBtn.onclick = function() {
        if (!hasMessagesInActive) {
          alert("⚠️ Hozirgi suhbatingiz hali bo'sh! Yangi suhbat ochish uchun avval unga biror xabar yozing.");
          return;
        }
        var newC = {
          id: 'conv_' + Date.now(),
          title: 'Yangi Suhbat',
          messages: [],
          updatedAt: Date.now()
        };
        S.aiConversations.unshift(newC);
        S.currentAiChatId = newC.id;
        App.saveState();
        renderAskAITeacher(container);
      };
    }

    container.querySelectorAll('[data-chat-id]').forEach(function(item) {
      item.onclick = function(e) {
        if (e.target.closest('[data-del-chat]')) return;
        S.currentAiChatId = item.dataset.chatId;
        App.saveState();
        closeMobileDrawer();
        renderAskAITeacher(container);
      };
    });

    container.querySelectorAll('[data-del-chat]').forEach(function(btn) {
      btn.onclick = function(e) {
        e.stopPropagation();
        var idToDel = btn.dataset.delChat;
        if (confirm("Delete this conversation?")) {
          S.aiConversations = S.aiConversations.filter(function(c) { return c.id !== idToDel; });
          if (S.aiConversations.length === 0) {
            var newC = { id: 'conv_' + Date.now(), title: 'New Conversation', messages: [], updatedAt: Date.now() };
            S.aiConversations = [newC];
            S.currentAiChatId = newC.id;
          } else if (S.currentAiChatId === idToDel) {
            S.currentAiChatId = S.aiConversations[0].id;
          }
          App.saveState();
          renderAskAITeacher(container);
        }
      };
    });

    container.querySelectorAll('.ai-prompt-pill').forEach(function(btn) {
      btn.onclick = function() {
        document.getElementById('aiPromptInput').value = btn.dataset.p;
        document.getElementById('aiChatForm').dispatchEvent(new Event('submit'));
      };
    });

    var chatForm = document.getElementById('aiChatForm');
    if (chatForm) {
      chatForm.onsubmit = async function(e) {
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

        activeConv.messages.push(userMsg);
        if ((activeConv.title === 'New Conversation' || activeConv.title === 'Yangi Suhbat') && promptText) {
          activeConv.title = promptText.slice(0, 32).trim() + (promptText.length > 32 ? '...' : '');
        }
        activeConv.updatedAt = Date.now();
        hasMessagesInActive = true;
        if (newChatBtn) {
          newChatBtn.disabled = false;
          newChatBtn.style.opacity = '1';
          newChatBtn.style.cursor = 'pointer';
          newChatBtn.title = 'Yangi suhbat ochish';
        }
        App.saveState();

        input.value = '';
        var sentAttach = currentAttachment;
        currentAttachment = null;
        if (filePreview) filePreview.style.display = 'none';
        if (fileInput) fileInput.value = '';

        // Append user bubble to DOM immediately
        var userBubble = document.createElement('div');
        userBubble.className = 'ask-ai-msg user';
        userBubble.innerHTML = '<div class="ask-ai-avatar">' + (S.user ? S.user.name.charAt(0).toUpperCase() : 'U') + '</div>' +
          '<div class="ask-ai-bubble">' +
          (userMsg.fileName ? '<div style="font-size:12px;background:rgba(0,0,0,0.06);padding:3px 8px;border-radius:6px;margin-bottom:6px">📎 ' + esc(userMsg.fileName) + '</div>' : '') +
          (userMsg.fileImg ? '<img src="' + userMsg.fileImg + '" style="max-width:240px;border-radius:8px;margin-bottom:8px;display:block">' : '') +
          formatAIMarkdown(userMsg.text) +
          '</div>';
        var currentMsgBox = document.getElementById('aiMsgBox');
        if (currentMsgBox) {
          currentMsgBox.appendChild(userBubble);
        }

        // Live typing AI bubble
        var aiBubble = document.createElement('div');
        aiBubble.className = 'ask-ai-msg ai';
        aiBubble.innerHTML = '<div class="ask-ai-avatar" style="background:transparent;padding:0;overflow:hidden"><img src="' + ETHITH_EMBLEM_IMG + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover"></div>' +
          '<div class="ask-ai-bubble">' +
          '<span id="liveAiStream">ETHITH AI is thinking...</span><span class="ai-cursor" id="liveAiCursor"></span>' +
          '</div>';
        if (currentMsgBox) {
          currentMsgBox.appendChild(aiBubble);
          currentMsgBox.scrollTop = currentMsgBox.scrollHeight;
        }

        try {
          var replyText = await window.EthithAI.askAITeacher(promptText, activeConv.messages, sentAttach);
          var streamSpan = document.getElementById('liveAiStream');
          var cursorSpan = document.getElementById('liveAiCursor');
          if (streamSpan) streamSpan.textContent = '';

          // Smooth Sequential Typewriter Streaming Effect (2-3 words every 18ms)
          var words = replyText.split(/(\s+)/);
          var currentText = '';
          var wordIdx = 0;

          var streamTimer = setInterval(function() {
            if (wordIdx < words.length) {
              var chunk = words.slice(wordIdx, wordIdx + 3).join('');
              currentText += chunk;
              wordIdx += 3;
              if (streamSpan) {
                streamSpan.innerHTML = formatAIMarkdown(currentText);
              }
              if (currentMsgBox) {
                currentMsgBox.scrollTop = currentMsgBox.scrollHeight;
              }
            } else {
              clearInterval(streamTimer);
              if (cursorSpan) cursorSpan.remove();
              activeConv.messages.push({
                role: 'ai',
                text: replyText
              });
              activeConv.updatedAt = Date.now();
              App.saveState();
              renderAskAITeacher(container);
            }
          }, 18);
        } catch (err) {
          if (aiBubble) aiBubble.remove();
          alert("Error occurred: " + err.message);
        }
      };
    }
  }

  function formatAIMarkdown(text) {
    if (!text) return '';
    var safe = esc(text);

    // Code blocks ```lang\ncode\n```
    safe = safe.replace(/```(?:[a-zA-Z0-9_-]+)?\s*([\s\S]*?)```/g, function(m, p1) {
      return '<pre style="background:#0b172a;color:#f8fafc;padding:12px 16px;border-radius:12px;overflow-x:auto;margin:10px 0;font-size:13px;border:1px solid #1b3252"><code>' + p1 + '</code></pre>';
    });

    // Inline code `code`
    safe = safe.replace(/`([^`]+)`/g, '<code style="background:rgba(37,99,235,0.08);color:#2563eb;padding:2px 6px;border-radius:5px;font-family:monospace;font-size:0.92em">$1</code>');

    // Headers: ### Header, ## Header, # Header
    safe = safe.replace(/^###\s+(.+)$/gm, '<h3 class="ai-h3">$1</h3>');
    safe = safe.replace(/^##\s+(.+)$/gm, '<h2 class="ai-h2">$1</h2>');
    safe = safe.replace(/^#\s+(.+)$/gm, '<h1 class="ai-h1">$1</h1>');

    // Horizontal Rule: --- or ***
    safe = safe.replace(/^(\*{3,}|-{3,})$/gm, '<hr class="ai-divider">');

    // Pedagogical Badges & Labels:
    safe = safe.replace(/\*\*(?:Meaning|Ma\'nosi):\*\*/gi, '<span class="ai-badge ai-badge-meaning">Meaning</span>');
    safe = safe.replace(/\*\*(?:Example|Misol):\*\*/gi, '<span class="ai-badge ai-badge-example">Example</span>');
    safe = safe.replace(/\*\*(?:IELTS Tip|Tip|Maslahat):\*\*/gi, '<span class="ai-badge ai-badge-tip">IELTS Tip</span>');
    safe = safe.replace(/\*\*(?:Grammar Alert|Grammar Rule|Note):\*\*/gi, '<span class="ai-badge ai-badge-alert">Grammar Alert</span>');
    safe = safe.replace(/\*\*(?:Collocations|Collocation):\*\*/gi, '<span class="ai-badge ai-badge-colloc">Collocations</span>');
    safe = safe.replace(/\*\*(?:Synonyms|Synonym):\*\*/gi, '<span class="ai-badge ai-badge-syn">Synonyms</span>');

    safe = safe.replace(/^(Meaning|Ma\'nosi):\s*/gmi, '<span class="ai-badge ai-badge-meaning">Meaning</span> ');
    safe = safe.replace(/^(Example|Misol):\s*/gmi, '<span class="ai-badge ai-badge-example">Example</span> ');
    safe = safe.replace(/^(IELTS Tip|Tip|Maslahat):\s*/gmi, '<span class="ai-badge ai-badge-tip">IELTS Tip</span> ');
    safe = safe.replace(/^(Grammar Alert|Grammar Rule|Note):\s*/gmi, '<span class="ai-badge ai-badge-alert">Grammar Alert</span> ');
    safe = safe.replace(/^(Collocations|Collocation):\s*/gmi, '<span class="ai-badge ai-badge-colloc">Collocations</span> ');
    safe = safe.replace(/^(Synonyms|Synonym):\s*/gmi, '<span class="ai-badge ai-badge-syn">Synonyms</span> ');

    // Standard Bold: **text**
    safe = safe.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');

    // Italics: *text*
    safe = safe.replace(/(^|[^*])\*([^*]+)\*([^*]|$)/g, '$1<i>$2</i>$3');

    // Numbered List: 1. item
    safe = safe.replace(/^(\d+)\.\s+(.+)$/gm, '<div class="ai-list-item"><span class="ai-list-num">$1.</span><span>$2</span></div>');

    // Bulleted List: - item or * item
    safe = safe.replace(/^[-*]\s+(.+)$/gm, '<div class="ai-list-item"><span class="ai-list-bullet">•</span><span>$1</span></div>');

    // Paragraph breaks & newlines
    safe = safe.replace(/\n\n+/g, '<div style="height:8px"></div>');
    safe = safe.replace(/\n/g, '<br>');

    return safe;
  }

  var formatMarkdown = formatAIMarkdown;

  // ==========================================
  // VIEW 2: LEVELS (A1 - C2) & 40 TOPICS
  // ==========================================
  function showCreateLevelTransitionExamModal(currentLevel, container) {
    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';

    var transitions = [
      { from: 'A1', to: 'A2', title: 'A1 ➔ A2 (Elementary → Pre-Intermediate)', desc: 'A1 darajasini yakunlab, A2 darajaga o\'tish uchun rasmiy imtihon' },
      { from: 'A2', to: 'B1', title: 'A2 ➔ B1 (Pre-Intermediate → Intermediate)', desc: 'A2 darajasini yakunlab, B1 mustaqil darajaga o\'tish testi' },
      { from: 'B1', to: 'B2', title: 'B1 ➔ B2 (Intermediate → Upper-Intermediate)', desc: 'B1 dan B2 professional darajaga o\'tish imtihoni' },
      { from: 'B2', to: 'C1', title: 'B2 ➔ C1 (Upper-Intermediate → Advanced)', desc: 'B2 dan C1 oliy akademik darajaga o\'tish imtihoni' },
      { from: 'C1', to: 'C2', title: 'C1 ➔ C2 (Advanced → Master / Native-level)', desc: 'C1 dan C2 mukammal darajaga o\'tish imtihoni' }
    ];

    var defaultIdx = 0;
    if (currentLevel === 'A2') defaultIdx = 1;
    else if (currentLevel === 'B1') defaultIdx = 2;
    else if (currentLevel === 'B2') defaultIdx = 3;
    else if (currentLevel === 'C1') defaultIdx = 4;

    overlay.innerHTML = '' +
      '<div class="eth-modal" style="max-width:620px;padding:26px 28px">' +
      '  <button type="button" class="eth-modal-close-btn" id="btnCloseLevelTransPrompt" title="Yopish">✕</button>' +
      '  <div class="eth-modal-header" style="margin-bottom:18px">' +
      '    <div style="font-size:32px;margin-bottom:6px">🎓</div>' +
      '    <h2 style="font-size:20px;font-weight:800;color:var(--text);margin:0 0 6px">Daraja O\'tish Testi Yaratish</h2>' +
      '    <p style="margin:0;font-size:13.5px;color:var(--muted)">Qaysi darajadan qaysi darajaga o\'tadigan test ekanini tanlang, so\'ngra test tuzish paneliga o\'tasiz:</p>' +
      '  </div>' +
      '  <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px">' +
      transitions.map(function(t, idx) {
        var isSel = (idx === defaultIdx);
        return '' +
          '<div class="eth-level-trans-opt ' + (isSel ? 'selected' : '') + '" data-from="' + t.from + '" data-to="' + t.to + '" style="padding:14px 18px;border-radius:12px;border:1.5px solid ' + (isSel ? '#2563eb' : 'var(--border)') + ';background:' + (isSel ? 'rgba(37,99,235,0.06)' : 'var(--card)') + ';cursor:pointer;transition:all 0.15s ease">' +
          '  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px">' +
          '    <b class="trans-opt-title" style="font-size:15px;color:' + (isSel ? '#2563eb' : 'var(--text)') + '">🏆 ' + t.title + '</b>' +
          '    <span class="trans-opt-badge" style="font-size:12px;font-weight:700;color:' + (isSel ? '#2563eb' : 'var(--muted)') + '">' + (isSel ? 'Tanlangan ✓' : 'Tanlash') + '</span>' +
          '  </div>' +
          '  <div style="font-size:12.5px;color:var(--muted)">' + t.desc + '</div>' +
          '</div>';
      }).join('') +
      '  </div>' +
      '  <div style="display:flex;gap:10px;flex-wrap:wrap">' +
      '    <button type="button" class="ap-btn out" id="btnCancelLevelTransPrompt" style="flex:1">Bekor qilish</button>' +
      '    <button type="button" class="eth-btn-primary" id="btnAiLevelTransPrompt" style="flex:2;background:linear-gradient(135deg,#7c3aed 0%,#2563eb 100%);border:none;box-shadow:0 4px 14px rgba(124,58,237,0.35);font-weight:800;display:flex;align-items:center;justify-content:center;gap:8px">' + ethEmblemImg('eth-brand-emblem-mini', 'width:20px;height:20px;border-radius:4px;object-fit:cover') + ' 5 Soniyada AI Bilan Tuzish &rarr;</button>' +
      '    <button type="button" class="ap-btn out" id="btnProceedLevelTransPrompt" style="flex:1.5">Qo\'lda Tuzish &rarr;</button>' +
      '  </div>' +
      '</div>';

    document.body.appendChild(overlay);

    var selFrom = transitions[defaultIdx].from;
    var selTo = transitions[defaultIdx].to;

    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
    var closeBtn = overlay.querySelector('#btnCloseLevelTransPrompt');
    if (closeBtn) closeBtn.onclick = function() { overlay.remove(); };
    overlay.querySelector('#btnCancelLevelTransPrompt').onclick = function() { overlay.remove(); };

    overlay.querySelectorAll('.eth-level-trans-opt').forEach(function(opt) {
      opt.onclick = function() {
        overlay.querySelectorAll('.eth-level-trans-opt').forEach(function(o) {
          o.style.borderColor = 'var(--border)';
          o.style.background = 'var(--card)';
          var badge = o.querySelector('.trans-opt-badge');
          if (badge) { badge.textContent = 'Tanlash'; badge.style.color = 'var(--muted)'; }
          var title = o.querySelector('.trans-opt-title');
          if (title) { title.style.color = 'var(--text)'; }
        });
        opt.style.borderColor = '#2563eb';
        opt.style.background = 'rgba(37,99,235,0.06)';
        var b = opt.querySelector('.trans-opt-badge');
        if (b) { b.textContent = 'Tanlangan ✓'; b.style.color = '#2563eb'; }
        var t = opt.querySelector('.trans-opt-title');
        if (t) { t.style.color = '#2563eb'; }
        selFrom = opt.dataset.from;
        selTo = opt.dataset.to;
      };
    });

    var openTransModal = function() {
      overlay.remove();
      showCreateExamModal(container, {
        isLevelTransition: true,
        levelFrom: selFrom,
        levelTo: selTo,
        title: selFrom + ' ➔ ' + selTo + ' Rasmiy Daraja O\'tish Imtihoni',
        duration: 90,
        audioMaxPlays: 2
      });
    };

    var aiBtn = overlay.querySelector('#btnAiLevelTransPrompt');
    if (aiBtn) aiBtn.onclick = openTransModal;
    overlay.querySelector('#btnProceedLevelTransPrompt').onclick = openTransModal;
  }

  function renderLevelsView(container, levelKey) {
    if (window.renderNavigateView) {
      var navKey = (levelKey === 'upperIntermediate' || levelKey === 'B2') ? 'upperIntermediate' : 'intermediate';
      window.renderNavigateView(container, navKey);
      return;
    }
    window._ethithCurrentView = 'levels';
    window._ethithIsTestInProgress = false;
    window._ethithRefreshQuizList = null;
    window._ethithRefreshGifts = null;
    var curLevel = levelKey || S.level || 'A1';
    S.level = curLevel;
    var levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    var curriculum = window.ETHITH_CURRICULUM || {};
    var topics = curriculum[curLevel] || [];
    var unlockedCount = S.unlocked[curLevel] || 1;
    var isTeacher = S.user && S.user.role === 'teacher';

    var NEXT_LEVEL = { A1: 'A2', A2: 'B1', B1: 'B2', B2: 'C1', C1: 'C2', C2: 'Master' };
    var nextLv = NEXT_LEVEL[curLevel] || 'Keyingi';

    var customTrans = (S.exams || []).filter(function(e) {
      return e.isLevelTransition && (e.levelFrom === curLevel || (!e.levelFrom && curLevel === 'A1'));
    });

    var levelReward = window.ETHITH_GET_TOPIC_QUESTION_COIN ? window.ETHITH_GET_TOPIC_QUESTION_COIN(curLevel) : 4;
    var html = '' +
      '<div class="ap-sec" style="margin-top:0">' +
      '  <div>' +
      '    <h2>' + ic('layers') + ' CEFR English Levels (40 Topics)</h2>' +
      '    <p>Score 70% or higher on each topic quiz to unlock the next lesson.</p>' +
      '  </div>' +
      '  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">' +
      '    <div class="eth-top-coin-pill" style="margin:0;cursor:default" title="' + curLevel + ' darajasida har bir to\'g\'ri javob uchun beriladigan coin">' +
             (window.ETHITH_COIN_SVG ? window.ETHITH_COIN_SVG(20) : '🪙') +
      '      <span style="font-size:12px;font-weight:900;color:#fbbf24">+' + levelReward + ' Coin / to\'g\'ri javob</span>' +
      '    </div>' +
      (isTeacher ?
        '    <button class="ap-btn solid" id="btnCreateLevelExam" style="background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;font-weight:700">🎓 Daraja O\'tish Testi Yaratish</button>' +
        '    <button class="ap-btn out" id="tcAddTestBtn">' + ic('plus') + ' AI Mavzu Testi</button>' : '') +
      '  </div>' +
      '</div>' +
      '<div class="eth-tabs" style="margin:0 0 16px 0">' +
      levels.map(function(lv) {
        return '<button class="eth-tab ' + (lv === curLevel ? 'active' : '') + '" data-lvl="' + lv + '">' + lv + ' Level</button>';
      }).join('') +
      '</div>' +
      '<div class="ap-card" id="levelTransitionCard" style="cursor:pointer;background:linear-gradient(135deg, #0f172a, #1e3a8a);color:#ffffff;border-radius:16px;padding:16px 20px;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;border:1px solid rgba(255,255,255,0.1);box-shadow:0 6px 20px rgba(15,23,42,0.15)">' +
      '  <div>' +
      '    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
      '      <span style="background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:12px;font-size:11.5px;font-weight:700">🏆 Standart CEFR Imtihoni</span>' +
      '      <span class="eth-badge-open" style="font-size:11px;font-weight:700">✅ Faol · 30 Savol (90 daqiqa)</span>' +
      '    </div>' +
      '    <h3 style="font-size:17px;margin:0 0 4px;color:#ffffff">' + curLevel + ' &rarr; ' + nextLv + ' Level Test (' + curLevel + ' to ' + nextLv + ' Transition Exam)</h3>' +
      '    <p style="margin:0;opacity:0.85;font-size:12.5px">Complete all 40 topics to unlock and take the official transition exam to the next level.</p>' +
      '  </div>' +
      '  <button class="ap-btn" style="background:#ffffff;color:#1e3a8a;font-weight:700;border:none;padding:10px 18px;border-radius:10px;cursor:pointer;font-size:13px">Start Test &rarr;</button>' +
      '</div>';

    if (customTrans.length > 0) {
      html += '' +
        '<div style="margin:0 0 20px">' +
        '  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
        '    <h3 style="font-size:15px;margin:0;display:flex;align-items:center;gap:6px">' +
        '      <span>🎓</span> <b>O\'qituvchilar yaratgan ' + curLevel + ' Daraja O\'tish Testlari (' + customTrans.length + ' ta):</b>' +
        '    </h3>' +
        '  </div>' +
        '  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px">' +
        customTrans.map(function(ex) {
          return '' +
            '<div class="ap-card" style="padding:16px;border-radius:14px;background:var(--card);border:1.5px solid var(--border);display:flex;flex-direction:column;justify-content:space-between;gap:12px">' +
            '  <div>' +
            '    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
            '      <span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;background:rgba(37,99,235,0.1);color:#2563eb">🏆 ' + esc(ex.levelFrom || curLevel) + ' ➔ ' + esc(ex.levelTo || nextLv) + '</span>' +
            '      <span style="font-size:12px;color:var(--muted);display:inline-flex;align-items:center;gap:4px">Kod: <b style="color:var(--text)">' + esc(ex.code) + '</b> <button type="button" class="eth-copy-btn-mini" data-copy-code="' + ex.code + '" title="Kodni nusxalash">📋 Nusxalash</button></span>' +
            '    </div>' +
            '    <h4 style="margin:0 0 4px;font-size:15px">' + esc(ex.title) + '</h4>' +
            '    <div style="font-size:12px;color:var(--muted);display:flex;gap:10px;flex-wrap:wrap">' +
            '      <span>⏱ ' + ex.duration + ' daqiqa</span>' +
            '      <span>❓ ' + ex.questions.length + ' ta savol</span>' +
            (ex.audioData ? '<span style="color:#16a34a;font-weight:700">🎧 Audio bor</span>' : '') +
            (ex.pdfData ? '<span style="color:#2563eb;font-weight:700">📄 PDF Worksheet</span>' : '') +
            '    </div>' +
            '  </div>' +
            '  <button class="eth-btn-primary" data-run-trans-exam="' + ex.id + '" style="width:100%;padding:9px;font-size:13px;font-weight:700">Testni Boshlash ' + ic('right') + '</button>' +
            '</div>';
        }).join('') +
        '  </div>' +
        '</div>';
    }

    html += '' +
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
        var examQuestions = (window.EthithQuizEngine && window.EthithQuizEngine.generateQuiz)
          ? window.EthithQuizEngine.generateQuiz(curLevel, 1, 30)
          : [];
        if (!examQuestions || examQuestions.length === 0) {
          examQuestions = [
            { question: "Choose the correct " + curLevel + " sentence structure.", options: ["She works every day", "She work every day", "She working every day", "She be working"], answer: "She works every day", points: 2 },
            { question: "Which connector best completes the passage?", options: ["however", "although", "despite", "furthermore"], answer: "however", points: 2 }
          ];
        }
        var transExam = {
          id: 'trans_exam_' + curLevel + '_' + nextLv,
          code: curLevel + '-' + nextLv,
          title: curLevel + ' → ' + nextLv + ' Level Transition Exam',
          duration: 90,
          pointsPerQ: 2,
          questions: examQuestions,
          isPublic: true,
          maxAttempts: 5,
          submissions: []
        };
        startExamRunner(transExam, container);
      };
    }

    container.querySelectorAll('[data-run-trans-exam]').forEach(function(btn) {
      btn.onclick = function() {
        var exId = btn.dataset.runTransExam;
        var exObj = (S.exams || []).find(function(e) { return e.id === exId; });
        if (exObj) {
          startExamRunner(exObj, container);
        }
      };
    });

    container.querySelectorAll('.eth-tab').forEach(function(tab) {
      tab.onclick = function() {
        if (window._ethithInternalGo) {
          window._ethithInternalGo('levels', tab.dataset.lvl);
        } else {
          renderLevelsView(container, tab.dataset.lvl);
        }
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
      var createLvlBtn = document.getElementById('btnCreateLevelExam');
      if (createLvlBtn) {
        createLvlBtn.onclick = function() {
          showCreateLevelTransitionExamModal(curLevel, container);
        };
      }
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
    var qCoinReward = window.ETHITH_GET_TOPIC_QUESTION_COIN ? window.ETHITH_GET_TOPIC_QUESTION_COIN(level) : 4;
    var coinIconModal = window.ETHITH_COIN_SVG ? window.ETHITH_COIN_SVG(22) : '🪙';
    overlay.innerHTML = '' +
      '<div class="eth-modal">' +
      '  <button type="button" class="eth-modal-close-btn" id="btnTopCloseQuizPrompt" title="Yopish">✕</button>' +
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
      '    <div style="background:var(--bg2);padding:12px 14px;border-radius:14px;font-size:13px;color:var(--text);margin-bottom:14px;border:1.5px solid rgba(245,158,11,0.35);display:flex;align-items:center;gap:10px">' +
      '      ' + coinIconModal +
      '      <div><b>Coin Mukofoti:</b> Har bir to\'g\'ri javob uchun <b>+' + qCoinReward + ' ETHITH Coin</b> olasiz! O\'tish bali: <b>70%</b>.</div>' +
      '    </div>' +
      '    <div style="display:flex;gap:10px">' +
      '      <button class="ap-btn out" id="quizPromptCancel" style="flex:1">Cancel</button>' +
      '      <button class="eth-btn-primary" id="quizPromptStart" style="flex:2">Start Test ' + ic('right') + '</button>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    document.body.appendChild(overlay);

    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
    var topClose = overlay.querySelector('#btnTopCloseQuizPrompt');
    if (topClose) topClose.onclick = function() { overlay.remove(); };

    var onEsc = function(e) {
      if (e.key === 'Escape') {
        overlay.remove();
        window.removeEventListener('keydown', onEsc);
      }
    };
    window.addEventListener('keydown', onEsc);

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

  // Audio feedback synthesizer for quiz answers
  function playQuizAnswerSound(isCorrect) {
    try {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!window._ethAudioCtx) window._ethAudioCtx = new AudioCtx();
      var ctx = window._ethAudioCtx;
      if (ctx.state === 'suspended') ctx.resume();

      var now = ctx.currentTime;

      if (isCorrect) {
        // Joyful, sparkling major arpeggio chime (C5, E5, G5, C6)
        var notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach(function(freq, idx) {
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.065);

          gain.gain.setValueAtTime(0.001, now + idx * 0.065);
          gain.gain.exponentialRampToValueAtTime(0.24, now + idx * 0.065 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.065 + 0.45);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.065);
          osc.stop(now + idx * 0.065 + 0.46);
        });
      } else {
        // Distinct, soft descending error tones (D3 -> Bb2)
        var errNotes = [293.66, 233.08];
        errNotes.forEach(function(freq, idx) {
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.13);

          gain.gain.setValueAtTime(0.001, now + idx * 0.13);
          gain.gain.exponentialRampToValueAtTime(0.25, now + idx * 0.13 + 0.025);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.13 + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.13);
          osc.stop(now + idx * 0.13 + 0.36);
        });
      }
    } catch(e) {}
  }
  window.playQuizAnswerSound = playQuizAnswerSound;

  // Quiz runner for generated questions
  function startTopicQuizRunner(level, topicNum, topicTitle, questions, mainContainer) {
    window._ethithIsTestInProgress = true;
    window._ethithRefreshQuizList = null;
    window._ethithRefreshGifts = null;

    var has2xBooster = Boolean(S.user && S.user.booster2xUntil && Number(S.user.booster2xUntil) > Date.now());
    var baseCoinsPerQ = window.ETHITH_GET_TOPIC_QUESTION_COIN ? window.ETHITH_GET_TOPIC_QUESTION_COIN(level) : 4;
    var coinsPerQ = baseCoinsPerQ * (has2xBooster ? 2 : 1);
    var booster50UsedForThisQ = false;
    var state = {
      i: 0,
      score: 0,
      earnedCoins: 0,
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

      var coinIcon = window.ETHITH_COIN_SVG ? window.ETHITH_COIN_SVG(18) : '🪙';

      var html = '' +
        '<div class="ap-quiz">' +
        '  <div class="ap-qtop">' +
        '    <button class="ap-ib" id="quizExitBtn">' + ic('x') + '</button>' +
        '    <div class="ap-bar"><i style="width:' + ((state.i / questions.length) * 100) + '%"></i></div>' +
        '    <b>' + (state.i + 1) + ' / ' + questions.length + '</b>' +
        '  </div>' +
        '  <div class="ap-qbox">' +
        '    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;flex-wrap:wrap">' +
        '      <div class="qn" style="margin-bottom:0">' + level + ' · Topic ' + topicNum + ' · Question ' + (state.i + 1) + '</div>' +
        '      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">' +
        (has2xBooster ? '<div style="font-size:11.5px;font-weight:900;color:#fde047;background:rgba(245,158,11,0.25);border:1px solid #f59e0b;padding:3px 8px;border-radius:8px;animation:pulse 1.5s infinite">🔥 2X COIN FAOL</div>' : '') +
        (S.user && S.user.boosters && S.user.boosters['50_50'] > 0 ? '<button id="btnTopicBooster50" type="button" class="eth-booster-action-btn" style="padding:4px 10px;font-size:12px">✂️ 50/50 (' + S.user.boosters['50_50'] + ')</button>' : '') +
        (S.user && S.user.boosters && S.user.boosters['hint_master'] > 0 ? '<button id="btnTopicBoosterHint" type="button" class="eth-booster-action-btn" style="padding:4px 10px;font-size:12px">💡 Yordam (' + S.user.boosters['hint_master'] + ')</button>' : '') +
        (S.user && S.user.boosters && S.user.boosters['auto_solve'] > 0 ? '<button id="btnTopicBoosterAuto" type="button" class="eth-booster-action-btn" style="padding:4px 10px;font-size:12px">🤖 Avto-AI (' + S.user.boosters['auto_solve'] + ')</button>' : '') +
        (S.user && S.user.boosters && S.user.boosters['skip_pass'] > 0 ? '<button id="btnTopicBoosterSkip" type="button" class="eth-booster-action-btn" style="padding:4px 10px;font-size:12px">⏭️ Sakrash (' + S.user.boosters['skip_pass'] + ')</button>' : '') +
        '<div style="font-size:12px;font-weight:800;color:#f59e0b;display:inline-flex;align-items:center;gap:5px;background:rgba(245,158,11,0.15);padding:3px 10px;border-radius:10px;border:1px solid rgba(245,158,11,0.3)">' +
        coinIcon + ' To\'g\'ri javob: +' + coinsPerQ + ' Coin' +
        '      </div>' +
        '    </div>' +
        '    </div>' +
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

      var btnBoosterHint = document.getElementById('btnTopicBoosterHint');
      if (btnBoosterHint) {
        btnBoosterHint.onclick = function(e) {
          if (e) { e.stopPropagation(); e.preventDefault(); }
          if (state.answered) return;
          if (!S.user || !S.user.boosters || (S.user.boosters['hint_master'] || 0) <= 0) return;
          S.user.boosters['hint_master']--;
          App.saveState();
          btnBoosterHint.disabled = true;
          var ans = q.answer || '';
          alert('💡 Donishmand Maslahati:\nTo\'g\'ri javob: "' + ans.slice(0, Math.ceil(ans.length / 2)) + '..." bilan bog\'liq!');
        };
      }

      var btnBoosterAuto = document.getElementById('btnTopicBoosterAuto');
      if (btnBoosterAuto) {
        btnBoosterAuto.onclick = function(e) {
          if (e) { e.stopPropagation(); e.preventDefault(); }
          if (state.answered) return;
          if (!S.user || !S.user.boosters || (S.user.boosters['auto_solve'] || 0) <= 0) return;
          S.user.boosters['auto_solve']--;
          App.saveState();
          btnBoosterAuto.disabled = true;
          optionBtns.forEach(function(b) {
            if (b.dataset.opt === q.answer) b.click();
          });
        };
      }

      var btnBoosterSkip = document.getElementById('btnTopicBoosterSkip');
      if (btnBoosterSkip) {
        btnBoosterSkip.onclick = function(e) {
          if (e) { e.stopPropagation(); e.preventDefault(); }
          if (state.answered) return;
          if (!S.user || !S.user.boosters || (S.user.boosters['skip_pass'] || 0) <= 0) return;
          S.user.boosters['skip_pass']--;
          App.saveState();
          btnBoosterSkip.disabled = true;
          optionBtns.forEach(function(b) {
            if (b.dataset.opt === q.answer) b.click();
          });
        };
      }

      var btnBooster50 = document.getElementById('btnTopicBooster50');
      if (btnBooster50) {
        btnBooster50.onclick = function(e) {
          if (e) { e.stopPropagation(); e.preventDefault(); }
          if (state.answered || booster50UsedForThisQ) return;
          if (!S.user || !S.user.boosters || (S.user.boosters['50_50'] || 0) <= 0) return;
          
          booster50UsedForThisQ = true;
          S.user.boosters['50_50']--;
          App.saveState();
          btnBooster50.disabled = true;
          btnBooster50.innerHTML = '✂️ 50/50 (Qo\'llanildi)';
          
          // Disable 2 wrong options
          var wrongBtns = [];
          optionBtns.forEach(function(b) {
            if (b.dataset.opt !== q.answer) wrongBtns.push(b);
          });
          // Shuffle and pick 2
          wrongBtns.sort(function() { return 0.5 - Math.random(); });
          for (var wi = 0; wi < Math.min(2, wrongBtns.length); wi++) {
            wrongBtns[wi].style.opacity = '0.2';
            wrongBtns[wi].style.pointerEvents = 'none';
          }
        };
      }

      document.getElementById('quizExitBtn').onclick = function(e) {
        if (e) { e.stopPropagation(); e.preventDefault(); }
        if (confirm("Are you sure you want to exit? Quiz progress will not be saved.")) {
          window._ethithIsTestInProgress = false;
          renderLevelsView(mainContainer, level);
        }
      };

      var optionBtns = mainContainer.querySelectorAll('.ap-opt');
      optionBtns.forEach(function(btn) {
        btn.onclick = function(e) {
          if (e) { e.stopPropagation(); e.preventDefault(); }
          if (state.answered) return;
          state.answered = true;
          var selected = btn.dataset.opt;
          var isCorrect = (selected === q.answer);

          // Audio feedback
          playQuizAnswerSound(isCorrect);

          optionBtns.forEach(function(b) {
            b.disabled = true;
            if (b.dataset.opt === q.answer) b.classList.add('ok');
          });

          if (isCorrect) {
            state.score++;
            state.earnedCoins += coinsPerQ;
            if (S.user) {
              S.user.coins = (S.user.coins || 0) + coinsPerQ;
              if (Array.isArray(S.accounts)) {
                var myAcc = S.accounts.find(function(a) {
                  return (a.email && S.user.email && a.email.toLowerCase() === S.user.email.toLowerCase()) ||
                         (a.name && S.user.name && a.name.toLowerCase() === S.user.name.toLowerCase());
                });
                if (myAcc) myAcc.coins = S.user.coins;
              }
              App.saveState();
              if (window._ethithUpdateTopCoins) {
                window._ethithUpdateTopCoins();
              }
              if (window.EthithSync && window.EthithSync.broadcastUserState) {
                window.EthithSync.broadcastUserState();
              } else if (window.EthithSync && window.EthithSync.publishLive) {
                window.EthithSync.publishLive({
                  type: 'USER_STATE_SYNC',
                  user: {
                    id: S.user.id,
                    name: S.user.name,
                    email: S.user.email,
                    role: S.user.role,
                    coins: S.user.coins,
                    avatar: S.user.avatar,
                    level: S.level || S.user.level,
                    dailyMinutes: S.user.dailyMinutes
                  }
                });
              }
            }
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
          var coinSvgSmall = window.ETHITH_COIN_SVG ? window.ETHITH_COIN_SVG(20) : '🪙';
          var coinBadgeHtml = isCorrect ? (
            '<div class="eth-coin-earn-badge">' +
              coinSvgSmall + ' <span>+' + coinsPerQ + ' Coin</span>' +
            '</div>'
          ) : '';

          feedbackBox.innerHTML = '' +
            '<div style="background:' + (isCorrect ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)') + ';padding:14px 18px;border-radius:14px;margin-bottom:14px;border:1.5px solid ' + (isCorrect ? '#22c55e' : '#ef4444') + ';display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap">' +
            '  <div>' +
            '    <b style="color:' + (isCorrect ? '#16a34a' : '#ef4444') + ';font-size:14px">' + (isCorrect ? '✓ To\'g\'ri javob!' : '✗ Noto\'g\'ri javob') + '</b>' +
            '    <p style="margin:5px 0 0;font-size:13.5px;color:var(--text)">' + esc(q.explanation) + '</p>' +
            '  </div>' +
            coinBadgeHtml +
            '</div>' +
            '<button class="ap-btn solid" id="quizNextBtn">' + (state.i === questions.length - 1 ? 'View Results' : 'Next Question') + ' ' + ic('right') + '</button>';

          document.getElementById('quizNextBtn').onclick = function(e) {
            if (e) { e.stopPropagation(); e.preventDefault(); }
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

      var coinSvgLarge = window.ETHITH_COIN_SVG ? window.ETHITH_COIN_SVG(28) : '🪙';

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
        '  <div style="margin:16px auto;max-width:380px;padding:12px 20px;background:linear-gradient(135deg,rgba(245,158,11,0.2),rgba(217,119,6,0.12));border:1.5px solid #f59e0b;border-radius:16px;display:flex;align-items:center;justify-content:center;gap:12px;box-shadow:0 4px 15px rgba(245,158,11,0.2)">' +
             coinSvgLarge +
        '    <div style="text-align:left">' +
        '      <div style="font-size:11px;font-weight:800;color:#f59e0b;text-transform:uppercase;letter-spacing:0.04em">Ushbu darsdan ishlangan:</div>' +
        '      <div style="font-size:20px;font-weight:900;color:#ffffff;font-family:monospace">+' + (state.earnedCoins || 0) + ' <span style="font-size:12.5px;color:#fbbf24">ETHITH Coin</span></div>' +
        '    </div>' +
        '  </div>' +
        '  <div class="acts">' +
        '    <button class="ap-btn out" id="resBackLevelsBtn">Topics List</button>' +
        (passed && topicNum < 40 ? '<button class="ap-btn solid" id="resNextTopicBtn">Next Topic ' + ic('right') + '</button>' : '') +
        '    <button class="ap-btn solid" id="resRetryBtn">' + ic('clip') + ' Retake Quiz</button>' +
        '  </div>' +
        '</div>';

      mainContainer.innerHTML = html;

      document.getElementById('resBackLevelsBtn').onclick = function(e) {
        if (e) { e.stopPropagation(); e.preventDefault(); }
        window._ethithIsTestInProgress = false;
        renderLevelsView(mainContainer, level);
      };
      document.getElementById('resRetryBtn').onclick = function(e) {
        if (e) { e.stopPropagation(); e.preventDefault(); }
        window._ethithIsTestInProgress = false;
        showQuizPromptModal(level, topicNum, topicTitle, mainContainer);
      };
      var nextBtn = document.getElementById('resNextTopicBtn');
      if (nextBtn) {
        nextBtn.onclick = function(e) {
          if (e) { e.stopPropagation(); e.preventDefault(); }
          window._ethithIsTestInProgress = false;
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
      '  <button type="button" class="eth-modal-close-btn" id="btnTopCloseCustomTest" title="Yopish">✕</button>' +
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

    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
    var topClose = overlay.querySelector('#btnTopCloseCustomTest');
    if (topClose) topClose.onclick = function() { overlay.remove(); };
    overlay.querySelector('#tcCancelBtn').onclick = function() {
      overlay.remove();
    };

    var onEsc = function(e) {
      if (e.key === 'Escape') {
        overlay.remove();
        window.removeEventListener('keydown', onEsc);
      }
    };
    window.addEventListener('keydown', onEsc);

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
    window._ethithCurrentView = 'classes';
    var isTeacher = S.user && S.user.role === 'teacher';
    var userClasses = S.classes.filter(function(c) {
      if (isTeacher) return c.teacherId === S.user.id || c.teacherEmail === S.user.email;
      return c.students && c.students.some(function(s) { return s.id === S.user.id || s.email === S.user.email; });
    });

    window._ethithRefreshClassesList = function() {
      if (!S.activeClassId && window._ethithCurrentView === 'classes') {
        var c = (container && container.parentElement) ? container : (document.getElementById('apView') || document.getElementById('viewContainer'));
        if (c) renderClassesView(c);
      }
    };

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
          '    <span class="ap-tag">' + (c.students ? c.students.length : 0) + ' students</span>' +
          '    <span style="font-family:monospace;font-weight:700;color:#2563eb;background:rgba(37,99,235,0.08);padding:4px 8px;border-radius:6px">Code: ' + c.code + '</span>' +
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
      '  <button type="button" class="eth-modal-close-btn" id="btnTopCloseCreateCls" title="Yopish">✕</button>' +
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
      '      <div style="display:flex;gap:10px;margin-top:14px">' +
      '        <button type="button" class="ap-btn out" id="btnCancelCreateCls" style="flex:1">Bekor qilish</button>' +
      '        <button type="submit" class="eth-btn-primary" style="flex:2">Activate Class ' + ic('right') + '</button>' +
      '      </div>' +
      '    </form>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
    var closeBtn = overlay.querySelector('#btnTopCloseCreateCls');
    if (closeBtn) closeBtn.onclick = function() { overlay.remove(); };
    var cancelBtn = overlay.querySelector('#btnCancelCreateCls');
    if (cancelBtn) cancelBtn.onclick = function() { overlay.remove(); };

    var onEsc = function(e) {
      if (e.key === 'Escape') {
        overlay.remove();
        window.removeEventListener('keydown', onEsc);
      }
    };
    window.addEventListener('keydown', onEsc);

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
        window.EthithSync.publishLive({
          type: 'CLASS_CREATED',
          classData: newCls
        });
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
      '  <button type="button" class="eth-modal-close-btn" id="btnTopCloseJoinCls" title="Yopish">✕</button>' +
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
      '      <div style="display:flex;gap:10px;margin-top:14px">' +
      '        <button type="button" class="ap-btn out" id="btnCancelJoinCls" style="flex:1">Bekor qilish</button>' +
      '        <button type="submit" class="eth-btn-primary" style="flex:2">Join Class ' + ic('right') + '</button>' +
      '      </div>' +
      '    </form>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
    var closeBtn = overlay.querySelector('#btnTopCloseJoinCls');
    if (closeBtn) closeBtn.onclick = function() { overlay.remove(); };
    var cancelBtn = overlay.querySelector('#btnCancelJoinCls');
    if (cancelBtn) cancelBtn.onclick = function() { overlay.remove(); };

    var onEsc = function(e) {
      if (e.key === 'Escape') {
        overlay.remove();
        window.removeEventListener('keydown', onEsc);
      }
    };
    window.addEventListener('keydown', onEsc);

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
        window.EthithSync.publishLive({
          type: 'STUDENT_JOIN',
          classId: found.code || found.id,
          student: {
            id: studentId,
            name: S.user.name,
            email: S.user.email,
            lastActive: Date.now(),
            dailyMinutes: S.user.dailyMinutes || 0,
            mistakes: (S.mistakes || []).length
          }
        });
        window.EthithSync.broadcastLocal(S.classes, S.exams);
        window.EthithSync.pushRemoteStore(S.classes, S.exams);
      }
      overlay.remove();
      renderClassesView(container);
    };
  }

  // Telegram Style Chat inside Class
  function renderClassDetail(container, clsParam) {
    var cls = (S.classes && S.classes.find(function(c) {
      return (clsParam && c.id === clsParam.id) || (clsParam && c.code === clsParam.code) || (c.id === S.activeClassId);
    })) || clsParam;
    if (window.EthithSync) {
      window.EthithSync.subscribeClass(cls.code || cls.id);
    }
    var isTeacher = S.user && S.user.role === 'teacher';
    var pinnedMsg = cls.messages.find(function(m) { return m.id === cls.pinnedId; });

    var html = '' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
      '  <button class="ap-back" id="backClassesListBtn" style="margin:0">' + ic('left') + ' Back to Classes</button>' +
      (isTeacher ? '  <button class="ap-btn out" id="clsMonitoringBtn">' + ic('user') + ' Student Roster (' + (cls.students ? cls.students.length : 0) + ')</button>' : '') +
      '</div>' +
      '<div class="tg-chat-wrap">' +
      '  <div class="tg-header">' +
      '    <div class="tg-header-info">' +
      '      <div class="tg-header-avatar">' + cls.name.charAt(0).toUpperCase() + '</div>' +
      '      <div class="tg-header-title">' +
      '        <h3>' + esc(cls.name) + '</h3>' +
      '        <span>' + (cls.students ? cls.students.length : 0) + ' members · Code: <b style="color:#2563eb;user-select:all">' + cls.code + '</b></span>' +
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
              var myEmail = (S.user && S.user.email ? S.user.email : '').toLowerCase();
              var myId = (S.user && S.user.id ? S.user.id : '').toLowerCase();
              var myName = (S.user && S.user.name ? S.user.name : '').toLowerCase();

              var userNames = uList.map(function(u) {
                var uClean = (u + '').toLowerCase();
                if ((myEmail && uClean === myEmail) || (myId && uClean === myId) || (myName && uClean === myName)) return 'You';
                var st = cls.students ? cls.students.find(function(s) {
                  return (s.id && s.id.toLowerCase() === uClean) || (s.email && s.email.toLowerCase() === uClean);
                }) : null;
                if (st) return st.name;
                var prior = cls.messages.find(function(pm) {
                  return (pm.senderId && pm.senderId.toLowerCase() === uClean) || (pm.senderEmail && pm.senderEmail.toLowerCase() === uClean);
                });
                if (prior) return prior.senderName;
                return u.indexOf('@') > -1 ? u.split('@')[0] : u;
              });

              var hasUserReacted = S.user && uList.some(function(u) {
                var uClean = (u + '').toLowerCase();
                return (myEmail && uClean === myEmail) || (myId && uClean === myId) || (myName && uClean === myName);
              });

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
          ((!isOwn ? '<div class="tg-msg-sender" style="display:flex;align-items:center;gap:6px">' + (window.ETHITH_RENDER_USER_AVATAR ? window.ETHITH_RENDER_USER_AVATAR({ name: m.senderName, avatar: m.senderAvatar }, 22) : '') + '<span>' + esc(m.senderName) + '</span></div>' : '')) +
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
          '  <button class="tg-hover-react-btn" data-msg-id="' + m.id + '" title="Add reaction">😄</button>' +
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
      '  <div class="tg-chat-emoji-tray" id="tgChatEmojiTray">' +
      '    <span style="font-size:11.5px;color:var(--muted);font-weight:700;margin-right:2px">Emojis:</span>' +
      (function() {
        var myUnlocked = (S.user && S.user.unlockedEmojis) || window.ETHITH_DEFAULT_FREE_EMOJIS || ['👍','😊','❤️'];
        return (window.ETHITH_CHAT_EMOJIS || []).map(function(item) {
          var isUnlocked = item.isDefault || (myUnlocked.indexOf(item.emoji) !== -1);
          if (isUnlocked) {
            return '<button type="button" class="tg-emoji-pill" data-insert-em="' + item.emoji + '" title="' + esc(item.name) + '">' + item.emoji + '</button>';
          } else {
            return '<button type="button" class="tg-emoji-pill is-locked" data-locked-em="' + item.emoji + '" title="' + esc(item.name) + ' (Qulflangan: Marketdan oching)">' + item.emoji + '</button>';
          }
        }).join('');
      })() +
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

    // Insert Emoji into Message Text
    container.querySelectorAll('[data-insert-em]').forEach(function(pill) {
      pill.onclick = function() {
        var em = pill.dataset.insertEm;
        var inp = document.getElementById('tgInputText');
        if (inp) {
          inp.value = (inp.value || '') + em;
          inp.focus();
        }
      };
    });

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

    // Hover Reaction Button click -> Show quick Telegram emoji capsule
    container.querySelectorAll('.tg-hover-react-btn').forEach(function(btn) {
      btn.onclick = function(e) {
        e.stopPropagation();
        var msgId = btn.dataset.msgId;
        var rect = btn.getBoundingClientRect();
        showQuickReactionPopup(rect.left, rect.top - 46, msgId, cls, container);
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

      var liveCls = (S.classes && S.classes.find(function(c) {
        return (c.id && c.id === cls.id) || (c.code && c.code === cls.code);
      })) || cls;

      if (!liveCls.messages) liveCls.messages = [];
      liveCls.messages.push(newMsg);
      if (cls !== liveCls) {
        if (!cls.messages) cls.messages = [];
        cls.messages.push(newMsg);
      }

      currentReplyingMessage = null;
      input.value = '';
      App.saveState();
      if (window.EthithSync) {
        window.EthithSync.publishLive({
          type: 'CHAT_MSG',
          classId: liveCls.code || liveCls.id || cls.code || cls.id,
          message: newMsg
        });
        window.EthithSync.broadcastLocal(S.classes, S.exams);
        window.EthithSync.pushRemoteStore(S.classes, S.exams);
      }
      renderClassDetail(container, liveCls);
    }

    window._ethithRefreshCurrentClass = function() {
      var targetContainer = (container && container.parentElement) ? container : (document.getElementById('apView') || document.getElementById('viewContainer'));
      var currentId = S.activeClassId || (cls && cls.id);
      var latestCls = S.classes.find(function(c) {
        return (c.id && c.id === currentId) || (cls && c.code === cls.code) || (cls && c.id === cls.id);
      });
      if (latestCls && targetContainer && document.getElementById('tgMsgBox')) {
        var inputEl = document.getElementById('tgInputText');
        var draftText = inputEl ? inputEl.value : '';
        var wasFocused = (document.activeElement === inputEl);
        var selStart = inputEl ? inputEl.selectionStart : 0;
        var selEnd = inputEl ? inputEl.selectionEnd : 0;

        var msgBox = document.getElementById('tgMsgBox');
        var wasAtBottom = (msgBox.scrollHeight - msgBox.scrollTop <= msgBox.clientHeight + 60);

        renderClassDetail(targetContainer, latestCls);

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
    '🤯', '😭', '🤮', '😴', '👋', '🎓', '📚', '☕', '🌟', '🥇',
    '🥰', '😘', '😜', '🤓', '🥺', '😤', '😱', '🤗', '🤭', '🤤',
    '💀', '🤡', '👻', '👽', '🤖', '👾', '🙈', '🙉', '🙊', '✌️',
    '💎', '🔑', '⭐', '🎈', '🎁', '🎂', '🍕', '🍻', '🍀', '🌈',
    '☀️', '🌙'
  ];

  // Modal shown when clicking a locked emoji
  function showLockedEmojiModal(emoji) {
    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay animate-fade-in';
    overlay.innerHTML = '' +
      '<div class="eth-modal" style="max-width:390px;text-align:center;padding:24px;border-radius:24px;border:1.5px solid rgba(245,158,11,0.4)">' +
      '  <div style="font-size:56px;margin:8px 0 12px;filter:drop-shadow(0 0 16px rgba(245,158,11,0.6))">' + emoji + '</div>' +
      '  <div style="font-size:18px;font-weight:900;color:var(--text);margin-bottom:8px">🔒 Ushbu Emoji Qulflangan!</div>' +
      '  <p style="font-size:13px;color:var(--muted);line-height:1.5;margin-bottom:20px">' +
      '    Reaksiya bildirish va chatda foydalanish uchun ushbu emojini Marketdagi <b>Chat Emojilar Packi</b> (80 Coin) yoki <b>Universal Mega Pack</b> (250 Coin) orqali ochishingiz mumkin.' +
      '  </p>' +
      '  <div style="display:flex;gap:10px">' +
      '    <button type="button" class="ap-btn out" id="btnCloseLockedEmojiModal" style="flex:1">Yopish</button>' +
      '    <button type="button" class="eth-btn-primary" id="btnGoMarketFromEmoji" style="flex:1.4">Marketga O\'tish 🛍️</button>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
    overlay.querySelector('#btnCloseLockedEmojiModal').onclick = function() { overlay.remove(); };
    overlay.querySelector('#btnGoMarketFromEmoji').onclick = function() {
      overlay.remove();
      if (activeContextMenu) { activeContextMenu.remove(); activeContextMenu = null; }
      if (window._ethithInternalGo) window._ethithInternalGo('market');
      else if (window.go) window.go('market');
    };
  }

  // Telegram Quick Reaction Bar Capsule (Floating bubble on hover)
  function showQuickReactionPopup(x, y, msgId, cls, mainContainer) {
    if (activeContextMenu) {
      activeContextMenu.remove();
      activeContextMenu = null;
    }

    var msg = cls.messages.find(function(m) { return m.id === msgId; });
    if (!msg) return;

    var bar = document.createElement('div');
    bar.className = 'tg-quick-reaction-bar';

    // Position capsule
    var posX = Math.max(10, Math.min(x - 90, window.innerWidth - 280));
    var posY = Math.max(10, Math.min(y, window.innerHeight - 60));
    bar.style.left = posX + 'px';
    bar.style.top = posY + 'px';

    var myUnlocked = (S.user && S.user.unlockedEmojis) || window.ETHITH_DEFAULT_FREE_EMOJIS || ['👍', '😊', '❤️'];
    var quickEmojis = (S.quickReactions && S.quickReactions.length >= 6) ? S.quickReactions : EMOJIS_MASTER_LIST;
    var top6 = quickEmojis.slice(0, 6);

    var currentUserId = (S.user && (S.user.email || S.user.id)) || 'guest';

    var html = top6.map(function(em) {
      var isActive = msg.reactions && msg.reactions[em] && msg.reactions[em].indexOf(currentUserId) > -1;
      var isUnlocked = (myUnlocked.indexOf(em) !== -1);
      if (isUnlocked) {
        return '<button class="tg-quick-bar-em ' + (isActive ? 'active' : '') + '" data-quick-em="' + em + '">' + em + '</button>';
      } else {
        return '<button class="tg-quick-bar-em is-locked" data-locked-em="' + em + '" title="🔒 Qulflangan (Marketdan oching)"><span style="filter:grayscale(0.7) opacity(0.35)">' + em + '</span><span class="eth-emoji-lock-badge">🔒</span></button>';
      }
    }).join('') +
    '<button class="tg-quick-bar-em tg-quick-bar-more" id="tgQuickMoreBtn" title="More emojis">➕</button>';

    bar.innerHTML = html;
    document.body.appendChild(bar);
    activeContextMenu = bar;

    bar.querySelectorAll('[data-quick-em]').forEach(function(btn) {
      btn.onclick = function(e) {
        e.stopPropagation();
        applyReaction(btn.dataset.quickEm, msg, cls, mainContainer);
        bar.remove();
        activeContextMenu = null;
      };
    });

    bar.querySelectorAll('[data-locked-em]').forEach(function(btn) {
      btn.onclick = function(e) {
        e.stopPropagation();
        showLockedEmojiModal(btn.dataset.lockedEm);
      };
    });

    var moreBtn = bar.querySelector('#tgQuickMoreBtn');
    if (moreBtn) {
      moreBtn.onclick = function(e) {
        e.stopPropagation();
        showAllEmojisPicker(posX, posY - 180, msg, cls, mainContainer);
      };
    }
  }

  // Telegram Context Menu: Compact Reactions Row, Reply, Pin, Delete
  function showContextMenu(x, y, msgId, cls, mainContainer) {
    if (activeContextMenu) activeContextMenu.remove();

    var msg = cls.messages.find(function(m) { return m.id === msgId; });
    if (!msg) return;

    var menu = document.createElement('div');
    menu.className = 'tg-context-menu';

    // Position menu within viewport
    var posX = Math.max(10, Math.min(x, window.innerWidth - 225));
    var posY = Math.max(10, Math.min(y, window.innerHeight - 240));
    menu.style.left = posX + 'px';
    menu.style.top = posY + 'px';

    var myUnlocked = (S.user && S.user.unlockedEmojis) || window.ETHITH_DEFAULT_FREE_EMOJIS || ['👍', '😊', '❤️'];
    var quickEmojis = (S.quickReactions && S.quickReactions.length >= 7) ? S.quickReactions : EMOJIS_MASTER_LIST;

    var html = '' +
      '<div class="tg-context-reactions">' +
      quickEmojis.slice(0, 7).map(function(em) {
        var isUnlocked = (myUnlocked.indexOf(em) !== -1);
        if (isUnlocked) {
          return '<button class="tg-context-reaction-btn" data-em="' + em + '">' + em + '</button>';
        } else {
          return '<button class="tg-context-reaction-btn is-locked" data-locked-em="' + em + '" title="🔒 Qulflangan"><span style="filter:grayscale(0.7) opacity(0.35)">' + em + '</span><span class="eth-emoji-lock-badge">🔒</span></button>';
        }
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
      btn.onclick = function(e) {
        e.stopPropagation();
        applyReaction(btn.dataset.em, msg, cls, mainContainer);
        menu.remove();
        activeContextMenu = null;
      };
    });

    menu.querySelectorAll('[data-locked-em]').forEach(function(btn) {
      btn.onclick = function(e) {
        e.stopPropagation();
        showLockedEmojiModal(btn.dataset.lockedEm);
      };
    });

    menu.querySelector('#tgMoreEmojisBtn').onclick = function(e) {
      e.stopPropagation();
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
        window.EthithSync.publishLive({
          type: 'PIN_MSG',
          classId: cls.code || cls.id,
          msgId: msg.id
        });
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
          window.EthithSync.publishLive({
            type: 'DELETE_MSG',
            classId: cls.code || cls.id,
            msgId: msg.id
          });
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
    var liveCls = (S.classes || []).find(function(c) {
      return (c.id && (c.id === cls.id || c.id === cls.code)) || (c.code && (c.code === cls.code || c.code === cls.id));
    }) || cls;
    var liveMsg = (liveCls.messages || []).find(function(m) { return m.id === msg.id; });
    if (!liveMsg) {
      liveMsg = msg;
      if (!liveCls.messages) liveCls.messages = [];
      liveCls.messages.push(liveMsg);
    }
    if (!liveMsg.reactions) liveMsg.reactions = {};
    if (!liveMsg.reactions[emoji]) liveMsg.reactions[emoji] = [];

    var myEmail = (S.user && S.user.email ? S.user.email : '').toLowerCase();
    var myId = (S.user && S.user.id ? S.user.id : '').toLowerCase();
    var userId = myEmail || myId || 'guest';

    var isAdded = true;
    var idx = -1;
    for (var i = 0; i < liveMsg.reactions[emoji].length; i++) {
      var itemU = (liveMsg.reactions[emoji][i] + '').toLowerCase();
      if ((myEmail && itemU === myEmail) || (myId && itemU === myId) || itemU === userId) {
        idx = i;
        break;
      }
    }

    if (idx > -1) {
      liveMsg.reactions[emoji].splice(idx, 1);
      if (liveMsg.reactions[emoji].length === 0) delete liveMsg.reactions[emoji];
      isAdded = false;
    } else {
      liveMsg.reactions[emoji].push(userId);
      isAdded = true;
    }
    msg.reactions = liveMsg.reactions;

    // Dynamic ordering: the most recently clicked emoji moves to the very first position (position 0)!
    var qr = (S.quickReactions && S.quickReactions.length > 0) ? S.quickReactions.slice() : EMOJIS_MASTER_LIST.slice();
    var qIdx = qr.indexOf(emoji);
    if (qIdx > -1) qr.splice(qIdx, 1);
    qr.unshift(emoji);
    S.quickReactions = qr;

    App.saveState();
    if (window.EthithSync) {
      window.EthithSync.publishLive({
        type: 'REACTION',
        classId: liveCls.code || liveCls.id || cls.code || cls.id,
        msgId: liveMsg.id,
        emoji: emoji,
        userId: userId,
        action: isAdded ? 'add' : 'remove'
      });
      window.EthithSync.broadcastLocal(S.classes, S.exams);
      window.EthithSync.pushRemoteStore(S.classes, S.exams);
    }
    renderClassDetail(mainContainer, liveCls);
  }

  // Full Emoji Picker Modal (72 emojis in an 8-column grid)
  function showAllEmojisPicker(x, y, msg, cls, mainContainer) {
    if (activeContextMenu) activeContextMenu.remove();

    var picker = document.createElement('div');
    picker.className = 'tg-context-menu';
    picker.style.left = Math.max(10, Math.min(x, window.innerWidth - 305)) + 'px';
    picker.style.top = Math.max(10, Math.min(y, window.innerHeight - 300)) + 'px';
    picker.style.width = '295px';
    picker.style.maxWidth = '315px';

    var myUnlocked = (S.user && S.user.unlockedEmojis) || window.ETHITH_DEFAULT_FREE_EMOJIS || ['👍', '😊', '❤️'];

    picker.innerHTML = '' +
      '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px 6px;border-bottom:1px solid var(--border)">' +
      '  <span style="font-size:12px;font-weight:700;color:var(--muted)">All Reactions (72)</span>' +
      '  <span style="font-size:11px;color:#f59e0b;font-weight:800">3 ta ochiq · Qolgani 🔒</span>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(8, 1fr);gap:2px;padding:8px 4px;max-height:220px;overflow-y:auto">' +
      EMOJIS_MASTER_LIST.map(function(em) {
        var isUnlocked = (myUnlocked.indexOf(em) !== -1);
        if (isUnlocked) {
          return '<button class="tg-context-reaction-btn" data-full-em="' + em + '" style="font-size:18px;padding:4px 0" title="Reaksiya bildirish">' + em + '</button>';
        } else {
          return '<button class="tg-context-reaction-btn is-locked" data-locked-full-em="' + em + '" style="font-size:18px;padding:4px 0" title="🔒 Qulflangan (Marketdan oching)"><span style="filter:grayscale(0.7) opacity(0.35)">' + em + '</span><span class="eth-emoji-lock-badge">🔒</span></button>';
        }
      }).join('') +
      '</div>';

    document.body.appendChild(picker);
    activeContextMenu = picker;

    picker.querySelectorAll('[data-full-em]').forEach(function(btn) {
      btn.onclick = function(e) {
        e.stopPropagation();
        applyReaction(btn.dataset.fullEm, msg, cls, mainContainer);
        picker.remove();
        activeContextMenu = null;
      };
    });

    picker.querySelectorAll('[data-locked-full-em]').forEach(function(btn) {
      btn.onclick = function(e) {
        e.stopPropagation();
        showLockedEmojiModal(btn.dataset.lockedFullEm);
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
      '    <h2>' + esc(cls.name) + ' · Student Performance Monitoring</h2>' +
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
    window._ethithCurrentView = 'exams';
    var isTeacher = S.user && S.user.role === 'teacher';
    window._ethithRefreshExamsList = function() {
      var apView = document.getElementById('apView');
      if (window._ethithCurrentView === 'exams' && apView) {
        renderExamsView(apView);
      }
    };

    var html = '' +
      '<div class="ap-sec" style="margin-top:0">' +
      '  <div>' +
      '    <h2>' + ic('trophy') + ' Exams & Leaderboards</h2>' +
      '    <p>' + (isTeacher ? 'Create custom exams, manage 6-digit access codes, configure public/private visibility, and monitor live leaderboards.' : 'Take practice exams or join proctored examinations with the 6-digit access code provided by your instructor.') + '</p>' +
      '  </div>' +
      (isTeacher ?
        '  <div style="display:flex;gap:10px;flex-wrap:wrap">' +
        '    <button class="eth-btn-primary" id="btnAiQuickExam" style="width:auto;padding:10px 18px;background:linear-gradient(135deg,#7c3aed 0%,#2563eb 100%);border:none;box-shadow:0 4px 15px rgba(124,58,237,0.35);font-weight:800;display:flex;align-items:center;gap:8px;color:#fff;cursor:pointer">' +
        '      ' + ethEmblemImg('eth-brand-emblem-mini', 'width:22px;height:22px;border-radius:5px;object-fit:cover;vertical-align:middle') + ' 5 Soniyada AI Test Yaratish (PDF/Audio)' +
        '    </button>' +
        '    <button class="ap-btn out" id="btnCreateExam" style="width:auto;padding:10px 18px;font-weight:700">' + ic('plus') + ' Yangi Imtihon Tuzish</button>' +
        '  </div>' :
        '') +
      '</div>';

    // Prominent Top Access / Search Panel
    html += '' +
      '<div class="eth-exam-access-hero">' +
      '  <div class="eth-exam-access-info">' +
      '    <h3><span style="font-size:18px">🔒</span> 6 Xonali Kod Bilan Imtihonga Kirish</h3>' +
      '    <p>O\'qituvchingiz bergan 6 xonali maxsus kodni kiriting. Yashirin va rasmiy imtihonlar qat\'iy kamera nazorati va to\'liq ekran himoyasida o\'tkaziladi.</p>' +
      '  </div>' +
      '  <div class="eth-exam-access-form">' +
      '    <div class="eth-access-input-wrap">' +
      '      <label>6 Xonali Imtihon Kodi</label>' +
      '      <input type="text" id="topExamCodeInput" placeholder="Masalan: 780580" maxlength="8" autocomplete="off" />' +
      '    </div>' +
      '    <div class="eth-access-input-wrap">' +
      '      <label>Ism va Familiyangiz</label>' +
      '      <input type="text" id="topStudentNameInput" value="' + esc((S.user && S.user.name) || '') + '" placeholder="Ism Familiya" />' +
      '    </div>' +
      '    <button class="eth-btn-primary eth-access-start-btn" id="btnTopStartExam">' +
      '      Imtihonni Boshlash ' + ic('right') +
      '    </button>' +
      '  </div>' +
      '</div>';

    // Strictly filter out private exams for students:
    var visibleExams = isTeacher ? (S.exams || []) : (S.exams || []).filter(function(x) { return x.isPublic === true; });

    if (visibleExams.length === 0) {
      html += '<div class="ap-card ap-empty">' + ic('trophy') + '<h2>' + (isTeacher ? 'No active exams created' : 'No public exams currently available') + '</h2><p>' + (isTeacher ? 'Click "Create New Exam" above to author exams and generate 6-digit codes.' : 'Please enter your 6-digit access code in the access panel above to start your test.') + '</p></div>';
    } else {
      html += '<div class="ap-grid g2">';
      visibleExams.forEach(function(ex) {
        var subCount = ex.submissions ? ex.submissions.length : 0;
        var maxAtt = ex.maxAttempts || 1;
        var isPub = ex.isPublic || false;

        html += '' +
          '<div class="ap-card" style="border:1.5px solid var(--border);position:relative">' +
          '  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
          '    <div style="display:flex;gap:6px;align-items:center">' +
          '      <span class="ap-tag">' + ex.duration + ' mins</span>' +
          (isPub ?
            '      <span class="eth-badge-open">🌐 Public</span>' :
            '      <span class="eth-badge-closed">🔒 Private</span>') +
          '      <span style="font-size:11.5px;color:var(--muted)">Attempts: ' + maxAtt + 'x</span>' +
          '    </div>' +
          '    <span style="display:inline-flex;align-items:center;gap:6px;font-family:monospace;font-weight:700;color:#2563eb;background:rgba(37,99,235,0.08);padding:3px 8px;border-radius:6px">' +
'      Code: ' + ex.code +
'      <button type="button" class="eth-copy-btn-mini" data-copy-code="' + ex.code + '" title="Kodni nusxalash">📋 Nusxalash</button>' +
'    </span>' +
          '  </div>' +
          '  <h3 style="font-size:18px;margin-bottom:6px">' + esc(ex.title) + '</h3>' +
          '  <p style="color:var(--muted);font-size:13px;margin:0 0 14px">' + (ex.questions ? ex.questions.length : 0) + ' questions · ' + subCount + ' submissions</p>' +
          '  <div style="display:flex;gap:8px">' +
          '    <button class="ap-btn solid" data-exam-lb="' + ex.id + '" style="flex:1">' + ic('trophy') + ' Leaderboard</button>' +
          (isTeacher ?
            '    <button class="ap-btn out" data-exam-manage="' + ex.id + '" style="flex:1">⚙️ Boshqarish & Ulashish</button>' :
            '    <button class="eth-btn-primary" data-exam-take="' + ex.id + '" style="flex:1">Testni Boshlash ' + ic('right') + '</button>') +
          '  </div>' +
          '</div>';
      });
      html += '</div>';
    }

    container.innerHTML = html;

    // Top Access Button Handler
    var btnTopStart = container.querySelector('#btnTopStartExam');
    if (btnTopStart) {
      btnTopStart.onclick = function() {
        var codeIn = (container.querySelector('#topExamCodeInput').value || '').trim();
        var nameIn = (container.querySelector('#topStudentNameInput').value || '').trim();

        if (!codeIn) {
          alert("Please enter the 6-digit access code for your exam.");
          container.querySelector('#topExamCodeInput').focus();
          return;
        }
        if (!nameIn) {
          alert("Please enter your full name before entering the proctored exam.");
          container.querySelector('#topStudentNameInput').focus();
          return;
        }

        if (S.user) {
          S.user.name = nameIn;
          App.saveState();
        }

        var matchedExam = (S.exams || []).find(function(x) {
          return (x.code + '').trim().toLowerCase() === codeIn.toLowerCase();
        });

        if (!matchedExam) {
          alert("No exam found with code: " + codeIn + ".\nPlease double check with your teacher.");
          return;
        }

        if (!checkStudentAttemptLimit(matchedExam)) return;

        startExamRunner(matchedExam, container);
      };
    }

    container.querySelectorAll('[data-exam-lb]').forEach(function(btn) {
      btn.onclick = function() {
        var ex = S.exams.find(function(x) { return x.id === btn.dataset.examLb; });
        if (ex) showExamLeaderboardModal(ex);
      };
    });

    container.querySelectorAll('[data-exam-manage]').forEach(function(btn) {
      btn.onclick = function() {
        var ex = S.exams.find(function(x) { return x.id === btn.dataset.examManage; });
        if (ex) showTeacherExamActionsModal(ex, container);
      };
    });

    container.querySelectorAll('[data-exam-take]').forEach(function(btn) {
      btn.onclick = function() {
        var ex = S.exams.find(function(x) { return x.id === btn.dataset.examTake; });
        if (!ex) return;

        if (!checkStudentAttemptLimit(ex)) return;
        startExamRunner(ex, container);
      };
    });

    if (isTeacher) {
      var aiQuickBtn = document.getElementById('btnAiQuickExam');
      if (aiQuickBtn) {
        aiQuickBtn.onclick = function() {
          showCreateExamModal(container);
        };
      }
      var createBtn = document.getElementById('btnCreateExam');
      if (createBtn) {
        createBtn.onclick = function() {
          showCreateExamModal(container);
        };
      }
    }
  }

  function checkStudentAttemptLimit(exam) {
    if (!S.user) return true;
    var userKey = (S.user.email || S.user.id || '').toLowerCase();
    var sub = (exam.submissions || []).find(function(s) {
      return (s.studentEmail && s.studentEmail.toLowerCase() === userKey) ||
             (s.studentId && s.studentId.toLowerCase() === userKey);
    });
    var maxAtt = exam.maxAttempts || 1;
    if (sub && (sub.attempts || 1) >= maxAtt) {
      alert("Attempt limit reached (" + (sub.attempts || 1) + "/" + maxAtt + ")!\nYou have already taken this exam.\nYour current score is: " + sub.score + " / " + sub.totalPossible + " (" + sub.percent + "%).");
      showExamLeaderboardModal(exam);
      return false;
    }
    return true;
  }

  function showTeacherExamActionsModal(exam, container) {
    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';

    function renderActions() {
      var html = '' +
        '<div class="eth-modal" style="max-width:460px;max-height:88vh;display:flex;flex-direction:column">' +
        '  <button type="button" class="eth-modal-close-btn" id="btnTopCloseExamActions" title="Yopish">✕</button>' +
        '  <div class="eth-modal-header" style="padding:18px 20px 14px">' +
        '    <h2 style="font-size:20px">' + ic('trophy') + ' Manage Exam</h2>' +
        '    <p style="font-size:13px">' + esc(exam.title) + '</p>' +
        '  </div>' +
        '  <div class="eth-modal-body" style="overflow-y:auto;max-height:calc(88vh - 120px);padding:14px 20px 18px;-webkit-overflow-scrolling:touch">' +
        '    <div style="font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.04em">Exam Access Code</div>' +
        '    <div class="eth-code-box" style="padding:10px 14px;margin:8px 0 14px">' +
        '      <div class="eth-code-digits" id="modalCodeDisplay" style="font-size:24px;letter-spacing:4px">' + exam.code + '</div>' +
        '      <button class="eth-copy-btn" id="btnCopyExamCode" style="padding:7px 12px;font-size:12.5px">' + ic('clip') + ' Copy Access Code</button>' +
        '    </div>' +
        '    <div style="margin:12px 0;padding:12px 14px;background:var(--bg2);border-radius:12px;border:1px solid var(--border)">' +
        '      <b style="font-size:13px;display:block;margin-bottom:8px">Exam Settings:</b>' +
        '      <div class="eth-form-group" style="margin-bottom:10px">' +
        '        <label style="font-size:12px;margin-bottom:4px">Exam Visibility:</label>' +
        '        <select id="examVisSelect" style="padding:8px 10px;font-size:13px">' +
        '          <option value="public" ' + (exam.isPublic ? 'selected' : '') + '>🌐 Public (Open to all students without code)</option>' +
        '          <option value="private" ' + (!exam.isPublic ? 'selected' : '') + '>🔒 Private (Requires 6-digit access code)</option>' +
        '        </select>' +
        '      </div>' +
        '      <div class="eth-form-group" style="margin-bottom:0">' +
        '        <label style="font-size:12px;margin-bottom:4px">Max Allowed Attempts per Student:</label>' +
        '        <select id="examMaxAttSelect" style="padding:8px 10px;font-size:13px">' +
        [1, 2, 3, 4, 5, 10].map(function(num) {
          return '<option value="' + num + '" ' + ((exam.maxAttempts || 1) === num ? 'selected' : '') + '>' + num + ' attempt' + (num > 1 ? 's' : '') + '</option>';
        }).join('') +
        '        </select>' +
        '      </div>' +
        '      <button class="eth-btn-primary" id="btnSaveExamSettings" style="margin-top:10px;padding:8px 14px;font-size:13px">Save Settings</button>' +
        '    </div>' +
        '    <div style="display:flex;flex-direction:column;gap:8px;margin-top:14px">' +
        '      <button class="ap-btn solid" id="btnEditExamFull" style="justify-content:center;padding:10px;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;font-weight:700;font-size:13px">✏️ Imtihonni Tahrirlash (Edit Exam Content)</button>' +
        '      <button class="ap-btn solid" id="btnDuplicateExam" style="justify-content:center;padding:10px;font-size:13px">' + ic('plus') + ' Duplicate as New Mock Exam</button>' +
        '      <button class="ap-btn out" id="btnViewLbFromManage" style="justify-content:center;padding:10px;font-size:13px">' + ic('trophy') + ' View Live Leaderboard (' + (exam.submissions ? exam.submissions.length : 0) + ' students)</button>' +
        '      <button class="ap-btn danger" id="btnDeleteExam" style="justify-content:center;padding:10px;color:#ef4444;border-color:rgba(239,68,68,0.3);font-size:13px">' + ic('trash') + ' Delete Exam Permanently</button>' +
        '    </div>' +
        '  </div>' +
        '  <div style="padding:10px 20px 14px;border-top:1px solid var(--border);text-align:right">' +
        '    <button class="ap-btn out" id="btnCloseManageModal" style="padding:7px 16px;font-size:13px">Yopish (Close)</button>' +
        '  </div>' +
        '</div>';

      overlay.innerHTML = html;

      overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
      var topClose = overlay.querySelector('#btnTopCloseExamActions');
      if (topClose) topClose.onclick = function() { overlay.remove(); };
      overlay.querySelector('#btnCloseManageModal').onclick = function() { overlay.remove(); };

      var onEsc = function(e) {
        if (e.key === 'Escape') {
          overlay.remove();
          window.removeEventListener('keydown', onEsc);
        }
      };
      window.addEventListener('keydown', onEsc);

      // Copy Code button
      overlay.querySelector('#btnCopyExamCode').onclick = function() {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(exam.code).then(function() {
            var btn = overlay.querySelector('#btnCopyExamCode');
            if (btn) btn.textContent = '✓ Code Copied!';
            setTimeout(function() {
              if (btn) btn.innerHTML = ic('clip') + ' Copy Access Code';
            }, 2000);
          }).catch(function() {
            prompt("Copy this 6-digit access code:", exam.code);
          });
        } else {
          prompt("Copy this 6-digit access code:", exam.code);
        }
      };

      // Save Settings button
      overlay.querySelector('#btnSaveExamSettings').onclick = function() {
        var vis = overlay.querySelector('#examVisSelect').value;
        var maxAtt = parseInt(overlay.querySelector('#examMaxAttSelect').value, 10) || 1;
        exam.isPublic = (vis === 'public');
        exam.maxAttempts = maxAtt;
        App.saveState();
        if (window.EthithSync) {
          window.EthithSync.publishLive({
            type: 'EXAM_UPDATED',
            exam: exam
          });
          window.EthithSync.broadcastLocal(S.classes, S.exams);
          window.EthithSync.pushRemoteStore(S.classes, S.exams);
        }
        alert("Exam settings saved successfully!");
        renderExamsView(container);
        renderActions();
      };

      // Edit Exam Full
      var btnEditEx = overlay.querySelector('#btnEditExamFull');
      if (btnEditEx) {
        btnEditEx.onclick = function() {
          overlay.remove();
          showEditExamModal(exam, container);
        };
      }

      // Duplicate Exam
      overlay.querySelector('#btnDuplicateExam').onclick = function() {
        var newTitle = prompt("Enter title for the duplicated mock exam:", exam.title + " (Copy)");
        if (!newTitle) return;
        var newCode = generateRichExamCode('MCK');
        var clonedQuestions = JSON.parse(JSON.stringify(exam.questions || []));
        var duplicatedExam = {
          id: 'exam_' + Date.now(),
          code: newCode,
          title: newTitle.trim(),
          duration: exam.duration,
          pointsPerQ: exam.pointsPerQ,
          questions: clonedQuestions,
          isPublic: exam.isPublic || false,
          maxAttempts: exam.maxAttempts || 1,
          submissions: []
        };
        S.exams.push(duplicatedExam);
        App.saveState();
        if (window.EthithSync) {
          window.EthithSync.broadcastLocal(S.classes, S.exams);
          window.EthithSync.pushRemoteStore(S.classes, S.exams);
        }
        overlay.remove();
        alert("Exam duplicated successfully!\nNew 6-digit access code: " + newCode);
        renderExamsView(container);
      };

      // View Leaderboard
      overlay.querySelector('#btnViewLbFromManage').onclick = function() {
        overlay.remove();
        showExamLeaderboardModal(exam);
      };

      // Delete Exam Permanently
      overlay.querySelector('#btnDeleteExam').onclick = function() {
        if (confirm("Are you sure you want to permanently delete this exam?\nTitle: " + exam.title + " (Code: " + exam.code + ")\nAll student submissions and leaderboard data will be erased.")) {
          if (!S.deletedExamIds) S.deletedExamIds = [];
          if (S.deletedExamIds.indexOf(exam.id) === -1) S.deletedExamIds.push(exam.id);
          if (exam.code && S.deletedExamIds.indexOf(exam.code) === -1) S.deletedExamIds.push(exam.code);

          S.exams = (S.exams || []).filter(function(x) {
            return x.id !== exam.id && (!exam.code || x.code !== exam.code);
          });
          App.saveState();
          if (window.EthithSync) {
            window.EthithSync.publishLive({
              type: 'DELETE_EXAM',
              examId: exam.id,
              examCode: exam.code
            });
            window.EthithSync.broadcastLocal(S.classes, S.exams);
            window.EthithSync.pushRemoteStore();
          }
          overlay.remove();
          alert("Exam deleted permanently from the platform.");
          renderExamsView(container);
        }
      };
    }

    renderActions();
    document.body.appendChild(overlay);
  }

  function showCreateExamModal(container, prefill) {
    if (container && !container.tagName && !container.nodeType) {
      prefill = container;
      container = document.getElementById('apView') || document.body;
    }
    prefill = prefill || {};
    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';

    var currentTitle = prefill.title || 'English Examination 2026';
    var currentDuration = prefill.duration || 30;
    var currentPoints = prefill.points || 2;
    var currentVisibility = prefill.visibility || 'private';
    var currentMaxAttempts = prefill.maxAttempts || 1;
    var currentAudioMaxPlays = prefill.audioMaxPlays || 1;
    var isLevelTransition = !!prefill.isLevelTransition;
    var levelFrom = prefill.levelFrom || null;
    var levelTo = prefill.levelTo || null;
    var currentPdfData = prefill.pdfData || null;
    var currentPdfName = prefill.pdfName || null;
    var currentTab = 'bulk';
    var questionsList = prefill.questions ? [].concat(prefill.questions) : [];
    var currentAudioData = prefill.audioData || null;
    var currentAudioName = prefill.audioName || null;
    var bulkTextCache = prefill.bulkText || '';
    var bulkAnsCache = prefill.bulkAnswers || '';
    var currentAttachedFile = prefill.attachedFile || null;

    function loadPdfJs(cb) {
      if (window.pdfjsLib) {
        cb(window.pdfjsLib);
        return;
      }
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      s.onload = function() {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          cb(window.pdfjsLib);
        } else {
          cb(null);
        }
      };
      s.onerror = function() { cb(null); };
      document.head.appendChild(s);
    }

    function extractFileText(file, cb) {
      if (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
        loadPdfJs(function(pdfLib) {
          if (!pdfLib) {
            alert("PDF kutubxonasi yuklanmadi. Iltimos, fayl matnini to\'g'ridan-to\'g'ri nusxalab joylashtiring yoki .txt fayl yuklang.");
            return;
          }
          var reader = new FileReader();
          reader.onload = function() {
            var typedarray = new Uint8Array(this.result);
            pdfLib.getDocument(typedarray).promise.then(async function(pdf) {
              var fullText = "";
              for (var i = 1; i <= pdf.numPages; i++) {
                var page = await pdf.getPage(i);
                var textContent = await page.getTextContent();
                var pageText = textContent.items.map(function(item) { return item.str; }).join(" ");
                fullText += pageText + "\n\n";
              }
              cb(fullText);
            }).catch(function(err) {
              alert("PDF o\'qishda xatolik yuz berdi: " + (err.message || err));
            });
          };
          reader.readAsArrayBuffer(file);
        });
      } else {
        var reader = new FileReader();
        reader.onload = function(e) { cb(e.target.result || ''); };
        reader.readAsText(file);
      }
    }

    function parseSmartAnswers(raw) {
      var map = {};
      if (!raw) return map;
      var lines = raw.split(/\r?\n/).map(function(l) { return l.trim(); }).filter(Boolean);
      for (var li = 0; li < lines.length; li++) {
        var line = lines[li];
        var compactRegex = /(\d+)[\.\)\-\:\,]?\s*([a-zA-Z]+)(?=(?:\s+\d+[\.\)\-\:\,]?|\s*,|\s*$))/g;
        var m;
        var compactCount = 0;
        while ((m = compactRegex.exec(line)) !== null) {
          var qNum = parseInt(m[1], 10);
          var ans = m[2].trim();
          if (ans && !map[qNum]) {
            map[qNum] = ans;
            compactCount++;
          }
        }
        if (compactCount === 0) {
          var tokenRegex = /(\d+)[\.\)\-\:\,]?\s+([^0-9\n\r]+?)(?=(?:\s+\d+[\.\)\-\:\,]?\s+)|$)/g;
          while ((m = tokenRegex.exec(line)) !== null) {
            var qNum2 = parseInt(m[1], 10);
            var ans2 = m[2].trim();
            if (ans2 && !map[qNum2]) {
              map[qNum2] = ans2;
            }
          }
        }
      }
      return map;
    }

    function parseQuestionsText(text, answersMap) {
      var questions = [];
      if (!text) return questions;
      var rawBlocks = text.split(/(?:^|\n)\s*(?=\d+[\.\)\-\:\s])/);
      var currentPts = currentPoints || 2;
      var activeExerciseTitle = '';
      var activePassage = '';

      for (var bi = 0; bi < rawBlocks.length; bi++) {
        var raw = rawBlocks[bi].trim();
        if (!raw) continue;

        var exHeaderMatch = raw.match(/(?:^|\n)\s*((?:Exercise|Task|Mashq|Reading|Listening|Writing|Section|Part)\s*\d*[\:\.\-\s][^\n]+)/i);
        if (exHeaderMatch) {
          activeExerciseTitle = exHeaderMatch[1].trim();
        }

        var ptsMatch = raw.match(/(\d+)\s*points?\s*for\s*each/i) || raw.match(/\[\s*(\d+)\s*\]/) || raw.match(/\/(\d+)/);
        if (ptsMatch) {
          currentPts = parseInt(ptsMatch[1], 10) || currentPts;
        }

        var qMatch = raw.match(/^(\d+)[\.\)\-\:\s]\s*([\s\S]+)/);
        if (!qMatch) {
          if (raw.length > 15) {
            activePassage = raw;
          }
          continue;
        }

        var qNum = parseInt(qMatch[1], 10);
        var body = qMatch[2].trim();

        var embeddedEx = body.match(/^((?:Exercise|Task|Mashq|Reading|Listening|Writing|Section|Part)\s*\d*[\:\.\-\s][^\n]+)\n([\s\S]+)/i);
        if (embeddedEx) {
          activeExerciseTitle = embeddedEx[1].trim();
          body = embeddedEx[2].trim();
        }

        var inlineAnsMatch = body.match(/(?:^|\n)\s*(?:Answer|Javob)\s*[:\-\)]\s*([^\n]+)/i);
        var inlineAns = inlineAnsMatch ? inlineAnsMatch[1].trim() : '';
        if (inlineAns) {
          body = body.replace(/(?:^|\n)\s*(?:Answer|Javob)\s*[:\-\)]\s*[^\n]+/i, '').trim();
        }

        var isBool = /TRUE\s*[\/\\]\s*FALSE/i.test(body) || /\bTrue\b[\s\S]*\bFalse\b/i.test(body);
        var optRegex = /(?:^|\n)\s*([a-dA-D])[\.\)\-\:\s]\s*([^\n]+)/g;
        var optMatches = [];
        var om;
        while ((om = optRegex.exec(body)) !== null) {
          optMatches.push(om);
        }

        var qType = 'choice';
        var prompt = body;
        var options = [];
        var answer = (answersMap && (answersMap[qNum] || answersMap[qNum + ''])) || inlineAns || '';

        if (isBool) {
          qType = 'bool';
          options = ['True', 'False'];
          prompt = body.replace(/TRUE\s*[\/\\]\s*FALSE/ig, '').trim();
          if (answer) {
            if (/^t/i.test(answer)) answer = 'True';
            else if (/^f/i.test(answer)) answer = 'False';
            else if (/^ng/i.test(answer)) answer = 'Not Given';
          }
        } else if (optMatches.length >= 2) {
          qType = 'choice';
          var firstOptIndex = body.search(/(?:^|\n)\s*[a-dA-D][\.\)\-\:\s]/);
          prompt = body.slice(0, firstOptIndex).trim();
          options = optMatches.map(function(m) { return m[2].trim(); });
          if (answer) {
            var letter = answer.trim().toUpperCase();
            var letterIdx = letter.charCodeAt(0) - 65;
            if (letterIdx >= 0 && letterIdx < options.length) {
              answer = options[letterIdx];
            }
          }
        } else {
          qType = 'written';
          prompt = body;
        }

        prompt = prompt.replace(/\d+\s*points?\s*for\s*each[^\n]*/ig, '').replace(/\[\s*\d+\s*\]/g, '').trim();

        questions.push({
          id: questionsList.length + questions.length + 1,
          num: qNum,
          type: qType,
          sectionTitle: activeExerciseTitle,
          passage: activePassage,
          question: prompt,
          options: options,
          answer: answer || (qType === 'bool' ? 'True' : (options[0] || 'Jawob kiritilmagan')),
          points: currentPts
        });
      }
      return questions;
    }

    function renderModal() {
      var linesCount = bulkTextCache ? bulkTextCache.split('\n').length : 0;
      var charsCount = bulkTextCache ? bulkTextCache.length : 0;

      var html = '' +
        '<div class="eth-modal" style="max-width:920px;width:95vw;max-height:92vh;display:flex;flex-direction:column">' +
        '  <button type="button" class="eth-modal-close-btn" id="btnTopCloseCreateExam" title="Yopish">✕</button>' +
        '  <div class="eth-modal-header">' +
        (isLevelTransition ?
          '    <h2>' + ic('trophy') + ' CEFR Daraja O\'tish Imtihoni: ' + esc(levelFrom) + ' ➔ ' + esc(levelTo) + '</h2>' +
          '    <p>' + esc(levelFrom) + ' dan ' + esc(levelTo) + ' ga o\'tuvchi o\'quvchilar uchun qat\'iy nazoratli rasmiy imtihon yaratish</p>' :
          '    <h2>' + ic('plus') + ' Yangi Imtihon / Mock Test Yaratish</h2>' +
          '    <p>50-100+ talab savollarni bir zumda aqlli tahlil qiling, audio va javoblar kalitini biriktiring</p>'
        ) +
        '  </div>' +
        '  <div class="eth-modal-body" style="overflow-y:auto;flex:1">' +
        '    <div class="eth-form-group">' +
        '      <label>Imtihon Nomi (Title)</label>' +
        '      <input type="text" id="exTitle" placeholder="Masalan: Progress Test 1B (Units 1-3) 2026" value="' + esc(currentTitle) + '" required>' +
        '    </div>' +
        '    <div style="display:flex;gap:12px;flex-wrap:wrap">' +
        '      <div class="eth-form-group" style="flex:1;min-width:140px">' +
        '        <label>Vaqt chegarasi (Daqiqa)</label>' +
        '        <input type="number" id="exDuration" value="' + currentDuration + '" min="5" max="240">' +
        '      </div>' +
        '      <div class="eth-form-group" style="flex:1;min-width:140px">' +
        '        <label>Har bir savol uchun ball</label>' +
        '        <input type="number" id="exPoints" value="' + currentPoints + '" min="1" max="100">' +
        '      </div>' +
        '      <div class="eth-form-group" style="flex:1;min-width:180px">' +
        '        <label>🎧 Audio tinglash limiti</label>' +
        '        <select id="exAudioMaxPlays">' +
        [1, 2, 3, 5, 10].map(function(num) {
          return '<option value="' + num + '" ' + (currentAudioMaxPlays === num ? 'selected' : '') + '>' + num + ' marta ' + (num === 1 ? '(IELTS standart)' : (num === 2 ? '(CEFR/Maktab)' : '')) + '</option>';
        }).join('') +
        '        </select>' +
        '      </div>' +
        '    </div>' +
        '    <div style="display:flex;gap:12px;flex-wrap:wrap">' +
        '      <div class="eth-form-group" style="flex:1;min-width:180px">' +
        '        <label>Kirish Huquqi (Visibility)</label>' +
        '        <select id="exVisibility">' +
        '          <option value="private" ' + (currentVisibility === 'private' ? 'selected' : '') + '>🔒 Yashirin (Faqat 6 xonali kod orqali)</option>' +
        '          <option value="public" ' + (currentVisibility === 'public' ? 'selected' : '') + '>🌐 Ochiq (Barcha o\'quvchilar uchun ochiq)</option>' +
        '        </select>' +
        '      </div>' +
        '      <div class="eth-form-group" style="flex:1;min-width:180px">' +
        '        <label>Ruxsat etilgan urinishlar soni</label>' +
        '        <select id="exMaxAttempts">' +
        [1, 2, 3, 4, 5, 10].map(function(num) {
          return '<option value="' + num + '" ' + (currentMaxAttempts === num ? 'selected' : '') + '>' + num + ' ta urinish' + (num > 1 ? ' (takrorlash)' : '') + '</option>';
        }).join('') +
        '        </select>' +
        '      </div>' +
        '    </div>' +
        (currentPdfData ?
          '    <div style="display:flex;align-items:center;justify-content:space-between;background:rgba(37,99,235,0.08);border:1.5px solid rgba(37,99,235,0.3);padding:10px 14px;border-radius:10px;margin-bottom:12px">' +
          '      <div style="display:flex;align-items:center;gap:8px;font-size:13.5px;font-weight:700;color:#2563eb;overflow:hidden;text-overflow:ellipsis">' +
          '        <span>📄 Biriktirilgan PDF Fayl:</span>' +
          '        <b style="color:var(--text)">' + esc(currentPdfName || 'document.pdf') + '</b>' +
          '        <span style="font-size:11px;background:#2563eb;color:#fff;padding:2px 8px;border-radius:10px">List Rejimi Tayyor</span>' +
          '      </div>' +
          '      <button type="button" id="btnRemovePdf" style="background:none;border:none;color:#ef4444;font-size:12px;font-weight:700;cursor:pointer">✕ O\'chirish</button>' +
          '    </div>' : ''
        ) +
        '    <!-- Audio / Listening Upload Section -->' +
        '    <div style="margin:12px 0 16px;padding:14px;background:var(--bg2);border-radius:12px;border:1.5px dashed var(--border)">' +
        '      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
        '        <b style="font-size:13.5px;display:flex;align-items:center;gap:6px">🎧 Listening Audio Track (Max: 25 MB):</b>' +
        (currentAudioData ? '<button type="button" id="btnRemoveAudio" style="background:none;border:none;color:#ef4444;font-size:12px;cursor:pointer;font-weight:700">✕ O\'chirish</button>' : '') +
        '      </div>' +
        (currentAudioData ?
          '<div style="display:flex;align-items:center;gap:12px;background:var(--card);padding:10px 14px;border-radius:8px;border:1px solid var(--border)">' +
          '  <span style="font-size:22px">🎵</span>' +
          '  <div style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px">' +
          '    <b>' + esc(currentAudioName || 'audio.mp3') + '</b>' +
          '  </div>' +
          '  <audio controls src="' + currentAudioData + '" style="height:32px;max-width:240px"></audio>' +
          '</div>' :
          '<div id="audioDropZone" style="text-align:center;padding:16px;cursor:pointer;border-radius:8px;transition:background 0.2s">' +
          '  <div style="font-size:26px;margin-bottom:4px">🎙️</div>' +
          '  <div style="font-size:13px;font-weight:600">Listening audio faylini sudrab tashlang (Drag & Drop) yoki bosing</div>' +
          '  <div style="font-size:11.5px;color:var(--muted);margin-top:2px">Qo\'llab-quvvatlanadi: .mp3, .wav, .m4a, .ogg (Maksimal hajm: 25 MB)</div>' +
          '  <input type="file" id="examAudioInput" accept="audio/*" style="display:none">' +
          '</div>'
        ) +
        '    </div>' +
        '    <!-- Question Format Tabs -->' +
        '    <div style="margin:14px 0 10px">' +
        '      <label style="font-weight:700;font-size:13.5px">Savol Qo\'shish Usuli:</label>' +
        '      <div class="eth-tabs" style="margin-top:6px">' +
        '        <button class="eth-tab ' + (currentTab === 'bulk' ? 'active' : '') + '" id="tabBulkBtn">📋 Aqlli Universal Import (50-100+ Qs / PDF)</button>' +
        '        <button class="eth-tab" id="tabWaygroundStudioExBtn" style="background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;font-weight:800">⚡ Wayground Studio (1:1)</button>' +
'        <button class="eth-tab ' + (currentTab === 'mc' ? 'active' : '') + '" id="tabMcBtn">🔘 Variantli (MC)</button>' +
        '        <button class="eth-tab ' + (currentTab === 'written' ? 'active' : '') + '" id="tabWrittenBtn">✍️ Yozma / Bo\'sh joy</button>' +
        '        <button class="eth-tab ' + (currentTab === 'bool' ? 'active' : '') + '" id="tabBoolBtn">☑️ True / False</button>' +
        '      </div>' +
        '    </div>' +
        '    <div id="qBuilderArea" style="background:var(--bg2);padding:14px;border-radius:12px;margin-bottom:16px">';

      if (currentTab === 'bulk') {
        html += '' +
          '<div style="display:flex;flex-direction:column;gap:12px">' +
          '  <div>' +
          '    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
          '      <label style="font-weight:700;font-size:13px">1. Savollar Matni (Questions Paper) — 50 dan 100+ gacha savollar / PDF / Rasm:</label>' +
          '      <div style="display:flex;align-items:center;gap:8px">' +
          (currentAttachedFile ? '<span style="font-size:12px;color:#2563eb;font-weight:700;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">📎 ' + esc(currentAttachedFile.name) + '</span>' : '') +
          '        <button type="button" class="eth-upload-btn-glow" id="btnUploadQFile">📁 PDF / Rasm / TXT Yuklash</button>' +
          '        <input type="file" id="bulkQFileInput" accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.doc,.docx" style="display:none">' +
          '      </div>' +
          '    </div>' +
          '    <textarea id="bulkTextInput" style="width:100%;min-height:280px;font-family:\'Consolas\',\'Monaco\',\'Courier New\',monospace;font-size:13.5px;line-height:1.55;padding:12px;border:1.5px solid var(--border);border-radius:10px;background:var(--card);color:var(--text);resize:vertical" placeholder="Bu yerga test savollarini tashlang yoki PDF/Rasm yuklang. Masalan:\n1. The capital of Uzbekistan is ___.\nA) Samarkand\nB) Tashkent\nC) Bukhara\nD) Khiva\n\n2. Water boils at 100 degrees Celsius.\nA) True\nB) False\n\nProgress test 1B yoki Unit tests kabi 50-100+ ta savollarni shundoq tashlang...">' + esc(bulkTextCache) + '</textarea>' +
          '    <div id="bulkTextStats" style="font-size:12px;color:var(--muted);margin-top:6px;display:flex;justify-content:space-between;align-items:center">' +
          '      <span id="bulkStatsCount">Satrlar: ' + linesCount + ' | Belgilar: ' + charsCount + '</span>' +
          '      <span style="color:#2563eb;font-weight:600">⚡ 50 dan 100+ gacha savollarni to\'g\'ridan-to\'g\'ri tahlil qiling yoki listda yeching</span>' +
          '    </div>' +
          '  </div>' +
          '  <div>' +
          '    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
          '      <label style="font-weight:700;font-size:13px">2. To\'g\'ri Javoblar Kaliti (Answer Key — pastda yoki alohida):</label>' +
          '      <div>' +
          '        <button type="button" class="eth-upload-btn-glow" id="btnUploadAnsFile">📁 Javoblar PDF/TXT Yuklash</button>' +
          '        <input type="file" id="bulkAnsFileInput" accept=".pdf,.txt,.doc,.docx" style="display:none">' +
          '      </div>' +
          '    </div>' +
          '    <textarea id="bulkAnswerInput" style="width:100%;min-height:90px;font-family:\'Consolas\',\'Monaco\',\'Courier New\',monospace;font-size:13px;line-height:1.45;padding:10px;border:1.5px solid var(--border);border-radius:10px;background:var(--card);color:var(--text);resize:vertical" placeholder="Masalan: 1b 2.a 3) c 4-d 5, a yoki 1 T 2 F 3 NG yoki 1 really; clothes 2 all; online...">' + esc(bulkAnsCache) + '</textarea>' +
          '    <div style="font-size:11.5px;color:var(--muted);margin-top:4px">Qo\'llab-quvvatlanadi: 1b, 1.b, 1)b, 1-b, 1,b, True/False, va Unit Tests yozma so\'zlari. Ballar (/10 yoki 2 points for each) avtomatik aniqlanadi!</div>' +
          '  </div>' +
          '  <div style="display:flex;gap:10px;margin-top:6px;flex-wrap:wrap">' +
          '    <button type="button" class="eth-btn-primary" id="btnAiExtract5Sec" style="flex:1;min-width:260px;padding:13px 18px;font-size:14px;font-weight:800;background:linear-gradient(135deg,#7c3aed 0%,#2563eb 100%);border:none;border-radius:12px;box-shadow:0 6px 20px rgba(124,58,237,0.4);display:flex;align-items:center;justify-content:center;gap:8px;color:#fff;cursor:pointer">' +
          '      ' + ethEmblemImg('eth-brand-emblem-mini', 'width:22px;height:22px;border-radius:5px;object-fit:cover') + ' ' +
          '      <span id="btnAiExtractText">5 Soniyada AI Bilan Test Yaratish (ETHITH Vision & Parser)</span>' +
          '    </button>' +
          '    <button type="button" class="ap-btn out" id="parseBulkBtn" style="padding:13px 16px;font-size:13px;font-weight:700">' +
          '      ⚡ Mahalliy Tahlil (Offline Parser)' +
          '    </button>' +
          '  </div>' +
          '</div>';
      } else if (currentTab === 'mc') {
        html += '' +
          '<div class="eth-form-group">' +
          '  <label>Savol matni:</label>' +
          '  <input type="text" id="mcQText" placeholder="e.g. She ___ to school every day.">' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
          '  <div><label style="font-size:12px">Variant A:</label><input type="text" id="mcOptA" placeholder="Variant A"></div>' +
          '  <div><label style="font-size:12px">Variant B:</label><input type="text" id="mcOptB" placeholder="Variant B"></div>' +
          '  <div><label style="font-size:12px">Variant C:</label><input type="text" id="mcOptC" placeholder="Variant C"></div>' +
          '  <div><label style="font-size:12px">Variant D:</label><input type="text" id="mcOptD" placeholder="Variant D"></div>' +
          '</div>' +
          '<div class="eth-form-group" style="margin-top:10px">' +
          '  <label>To\'g\'ri javob:</label>' +
          '  <select id="mcAnsSelect">' +
          '    <option value="A">Variant A</option>' +
          '    <option value="B">Variant B</option>' +
          '    <option value="C">Variant C</option>' +
          '    <option value="D">Variant D</option>' +
          '  </select>' +
          '</div>' +
          '<button type="button" class="eth-btn-primary" id="addMcQBtn" style="padding:10px 14px;margin-top:6px">' + ic('plus') + ' Savolni Qo\'shish</button>';
      } else if (currentTab === 'written') {
        html += '' +
          '<div class="eth-form-group">' +
          '  <label>Yozma savol / Bo\'sh joy qoldirilgan matn:</label>' +
          '  <textarea id="wQText" rows="2" placeholder="e.g. What is the past participle form of the verb \'write\'?"></textarea>' +
          '</div>' +
          '<div class="eth-form-group">' +
          '  <label>Kutilgan to\'g\'ri javob (yoki bir nechta variantlar \';\' bilan):</label>' +
          '  <input type="text" id="wAnsText" placeholder="e.g. written yoki really; clothes">' +
          '</div>' +
          '<button type="button" class="eth-btn-primary" id="addWQBtn" style="padding:10px 14px;margin-top:6px">' + ic('plus') + ' Yozma Savolni Qo\'shish</button>';
      } else if (currentTab === 'bool') {
        html += '' +
          '<div class="eth-form-group">' +
          '  <label>True / False Fikri:</label>' +
          '  <input type="text" id="boolQText" placeholder="e.g. The Earth revolves around the Sun.">' +
          '</div>' +
          '<div class="eth-form-group">' +
          '  <label>To\'g\'ri javob:</label>' +
          '  <select id="boolAnsSelect">' +
          '    <option value="True">True (Rost / To\'g\'ri)</option>' +
          '    <option value="False">False (Yolg\'on / Noto\'g\'ri)</option>' +
          '  </select>' +
          '</div>' +
          '<button type="button" class="eth-btn-primary" id="addBoolQBtn" style="padding:10px 14px;margin-top:6px">' + ic('plus') + ' True / False Savolni Qo\'shish</button>';
      }

      html += '' +
        '    </div>' +
        '    <div>' +
        '      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
        '        <b style="font-size:14px">Kiritilgan Savollar: <span style="color:#2563eb">' + questionsList.length + ' ta savol</span></b>' +
        (questionsList.length > 0 ? '<button id="clearAllQBtn" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:12.5px;font-weight:700">Hammasini o\'chirish</button>' : '') +
        '      </div>' +
        (questionsList.length === 0 ?
          '<div style="text-align:center;padding:16px;background:var(--card);border:1px dashed var(--border);border-radius:10px;font-size:13px;color:var(--muted)">Hozircha savollar kiritilmagan. Yuqoridagi Aqlli Universal Import yoki boshqa turlar orqali qo\'shing.</div>' :
          '<div style="display:flex;flex-direction:column;gap:8px;max-height:180px;overflow-y:auto">' +
          questionsList.map(function(q, i) {
            return '' +
              '<div style="display:flex;justify-content:space-between;align-items:center;background:var(--card);border:1px solid var(--border);padding:8px 12px;border-radius:8px;font-size:13px">' +
              '  <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-right:8px">' +
              '    <b>#' + (i + 1) + ' [' + (q.type === 'written' ? 'Yozma' : (q.type === 'bool' ? 'T/F' : 'Variantli')) + ']</b> ' + esc(q.question) + ' · <span style="color:#16a34a">Javob: ' + esc(q.answer) + '</span>' + (q.points ? ' <span style="color:#3b82f6">(' + q.points + ' ball)</span>' : '') +
              '  </div>' +
              '  <button data-del-q="' + i + '" style="background:none;border:none;color:#ef4444;cursor:pointer;font-weight:700">✕</button>' +
              '</div>';
          }).join('') +
          '</div>') +
        '    </div>' +
        '  </div>' +
        '  <div style="display:flex;gap:10px;padding:16px 24px;border-top:1px solid var(--border)">' +
        '    <button type="button" class="ap-btn out" id="exCancelBtn" style="flex:1">Bekor qilish</button>' +
        '    <button type="button" class="eth-btn-primary" id="saveExamFinalBtn" style="flex:2">Imtihonni Saqlash & Kod Yaratish ' + ic('right') + '</button>' +
        '  </div>' +
        '</div>';

      overlay.innerHTML = html;

      // Close handlers
      overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
      var topClose = overlay.querySelector('#btnTopCloseCreateExam');
      if (topClose) topClose.onclick = function() { overlay.remove(); };
      overlay.querySelector('#exCancelBtn').onclick = function() { overlay.remove(); };

      var onEsc = function(e) {
        if (e.key === 'Escape') {
          overlay.remove();
          window.removeEventListener('keydown', onEsc);
        }
      };
      window.addEventListener('keydown', onEsc);

      // Form updates
      overlay.querySelector('#exTitle').oninput = function(e) { currentTitle = e.target.value; };
      overlay.querySelector('#exDuration').oninput = function(e) { currentDuration = parseInt(e.target.value, 10) || 30; };
      overlay.querySelector('#exPoints').oninput = function(e) { currentPoints = parseInt(e.target.value, 10) || 2; };
      var audPlaysEl = overlay.querySelector('#exAudioMaxPlays');
      if (audPlaysEl) audPlaysEl.onchange = function(e) { currentAudioMaxPlays = parseInt(e.target.value, 10) || 1; };
      overlay.querySelector('#exVisibility').onchange = function(e) { currentVisibility = e.target.value; };
      overlay.querySelector('#exMaxAttempts').onchange = function(e) { currentMaxAttempts = parseInt(e.target.value, 10) || 1; };

      var rmPdfBtn = overlay.querySelector('#btnRemovePdf');
      if (rmPdfBtn) {
        rmPdfBtn.onclick = function() {
          currentPdfData = null;
          currentPdfName = null;
          renderModal();
        };
      }

      // Audio handling (max 25MB)
      var audioZone = overlay.querySelector('#audioDropZone');
      var audioInput = overlay.querySelector('#examAudioInput');
      if (audioZone && audioInput) {
        audioZone.onclick = function() { audioInput.click(); };
        audioZone.ondragover = function(e) { e.preventDefault(); audioZone.style.background = 'var(--accent-dim, rgba(37,99,235,0.08))'; };
        audioZone.ondragleave = function() { audioZone.style.background = 'transparent'; };
        audioZone.ondrop = function(e) {
          e.preventDefault();
          audioZone.style.background = 'transparent';
          if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleAudioFile(e.dataTransfer.files[0]);
          }
        };
        audioInput.onchange = function(e) {
          if (e.target.files && e.target.files[0]) {
            handleAudioFile(e.target.files[0]);
          }
        };
      }

      function handleAudioFile(file) {
        if (file.size > 25 * 1024 * 1024) {
          alert("Audio hajmi 25 MB dan oshmasligi kerak! (Sizning faylingiz: " + (file.size / (1024 * 1024)).toFixed(1) + " MB)");
          return;
        }
        var reader = new FileReader();
        reader.onload = function(ev) {
          currentAudioData = ev.target.result;
          currentAudioName = file.name;
          renderModal();
        };
        reader.readAsDataURL(file);
      }

      var removeAudioBtn = overlay.querySelector('#btnRemoveAudio');
      if (removeAudioBtn) {
        removeAudioBtn.onclick = function() {
          currentAudioData = null;
          currentAudioName = null;
          renderModal();
        };
      }

      // Live character and line count on bulk input
      var bulkTextEl = overlay.querySelector('#bulkTextInput');
      if (bulkTextEl) {
        bulkTextEl.oninput = function(e) {
          bulkTextCache = e.target.value;
          var statsEl = overlay.querySelector('#bulkStatsCount');
          if (statsEl) {
            var l = bulkTextCache ? bulkTextCache.split('\n').length : 0;
            var c = bulkTextCache ? bulkTextCache.length : 0;
            statsEl.textContent = 'Satrlar: ' + l + ' | Belgilar: ' + c;
          }
        };
      }

      // Tab switching
      overlay.querySelector('#tabBulkBtn').onclick = function() { saveCache(); currentTab = 'bulk'; renderModal(); };
      overlay.querySelector('#tabMcBtn').onclick = function() { saveCache(); currentTab = 'mc'; renderModal(); };
      overlay.querySelector('#tabWrittenBtn').onclick = function() { saveCache(); currentTab = 'written'; renderModal(); };
      overlay.querySelector('#tabBoolBtn').onclick = function() { saveCache(); currentTab = 'bool'; renderModal(); };

      function saveCache() {
        var tEl = overlay.querySelector('#bulkTextInput');
        if (tEl) bulkTextCache = tEl.value;
        var aEl = overlay.querySelector('#bulkAnswerInput');
        if (aEl) bulkAnsCache = aEl.value;
      }

      // Bulk PDF / Image / TXT upload
      var btnUploadQ = overlay.querySelector('#btnUploadQFile');
      var qFileInput = overlay.querySelector('#bulkQFileInput');
      if (btnUploadQ && qFileInput) {
        btnUploadQ.onclick = function() { qFileInput.click(); };
        qFileInput.onchange = function(e) {
          if (e.target.files && e.target.files[0]) {
            var file = e.target.files[0];
            var isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
            var isImg = /^image\//i.test(file.type) || /\.(png|jpe?g|webp)$/i.test(file.name);

            var r = new FileReader();
            r.onload = function(ev) {
              var dataUri = ev.target.result;
              var b64 = dataUri.split(',')[1] || '';
              currentAttachedFile = {
                name: file.name,
                mimeType: file.type || (isPdf ? 'application/pdf' : 'image/png'),
                base64: b64
              };
              if (isPdf) {
                currentPdfData = dataUri;
                currentPdfName = file.name;
              }
            };
            r.readAsDataURL(file);

            if (isImg) {
              bulkTextCache = "[Rasm yuklandi: " + file.name + "]\nPastdagi '5 Soniyada AI Bilan Test Yaratish' tugmasini bosing.";
              renderModal();
              alert("Rasm muvaffaqiyatli biriktirildi! Endi '5 Soniyada AI Bilan Test Yaratish' tugmasini bosing.");
            } else {
              extractFileText(file, function(text) {
                bulkTextCache = text;
                renderModal();
                alert("Savollar fayli muvaffaqiyatli o\'qildi! (" + file.name + ")");
              });
            }
          }
        };
      }

      var btnUploadAns = overlay.querySelector('#btnUploadAnsFile');
      var ansFileInput = overlay.querySelector('#bulkAnsFileInput');
      if (btnUploadAns && ansFileInput) {
        btnUploadAns.onclick = function() { ansFileInput.click(); };
        ansFileInput.onchange = function(e) {
          if (e.target.files && e.target.files[0]) {
            extractFileText(e.target.files[0], function(text) {
              bulkAnsCache = text;
              var aEl = overlay.querySelector('#bulkAnswerInput');
              if (aEl) aEl.value = text;
              alert("Javoblar kaliti fayli muvaffaqiyatli o\'qildi!");
            });
          }
        };
      }

      // 5-Second AI Exam Generator (ETHITH Multimodal Vision & Parsing)
      var btnAi = overlay.querySelector('#btnAiExtract5Sec');
      if (btnAi) {
        btnAi.onclick = async function() {
          saveCache();
          var qText = (bulkTextCache || '').trim();
          var aText = (bulkAnsCache || '').trim();

          if (!qText && !currentAttachedFile) {
            alert("Iltimos, avval test matnini kiriting yoki PDF / Rasm faylini yuklang!");
            return;
          }

          var btnTextSpan = overlay.querySelector('#btnAiExtractText');
          if (btnTextSpan) {
            btnTextSpan.textContent = '🧠 ETHITH AI tahlil qilmoqda (3–5 soniya)...';
          }
          btnAi.disabled = true;
          btnAi.style.opacity = '0.7';

          try {
            var aiRes = await window.EthithAI.parseAndExtractExam({
              text: qText,
              fileAttachment: currentAttachedFile,
              answersText: aText,
              defaultPoints: currentPoints
            });

            if (aiRes && aiRes.title && (!currentTitle || currentTitle === 'English Examination 2026')) {
              currentTitle = aiRes.title;
              var titEl = overlay.querySelector('#exTitle');
              if (titEl) titEl.value = currentTitle;
            }
            if (aiRes && aiRes.duration && (!currentDuration || currentDuration === 30)) {
              currentDuration = aiRes.duration;
              var durEl = overlay.querySelector('#exDuration');
              if (durEl) durEl.value = currentDuration;
            }

            if (aiRes && Array.isArray(aiRes.questions) && aiRes.questions.length > 0) {
              aiRes.questions.forEach(function(q, idx) {
                var rawType = String(q.type || '').toLowerCase();
                var qType = 'choice';
                if (rawType.includes('bool') || rawType.includes('true') || (Array.isArray(q.options) && q.options.length === 2 && /true/i.test(q.options[0]))) {
                  qType = 'bool';
                } else if (rawType.includes('writ') || rawType.includes('gap') || rawType.includes('fill') || !q.options || q.options.length === 0) {
                  qType = 'written';
                }

                var cleanOptions = [];
                if (qType === 'bool') {
                  cleanOptions = ['True', 'False'];
                } else if (Array.isArray(q.options)) {
                  cleanOptions = q.options.map(function(opt) {
                    return String(opt || '').replace(/^[A-Da-d1-4][\.\)]\s*/, '').trim();
                  }).filter(Boolean);
                }

                var cleanAns = String(q.answer || '').replace(/^[A-Da-d1-4][\.\)]\s*/, '').trim();
                var letterIdx = ['a', 'b', 'c', 'd'].indexOf(String(q.answer || '').trim().toLowerCase().replace(/[\.\)]/, ''));
                if (letterIdx !== -1 && cleanOptions[letterIdx]) {
                  cleanAns = cleanOptions[letterIdx];
                }
                if (!cleanAns) {
                  cleanAns = (qType === 'bool') ? 'True' : (cleanOptions[0] || 'A');
                }

                questionsList.push({
                  id: questionsList.length + 1,
                  num: q.num || (idx + 1),
                  type: qType,
                  question: String(q.question || '').replace(/^\d+[\.\)]\s*/, '').trim(),
                  options: cleanOptions,
                  answer: cleanAns,
                  points: q.points || currentPoints || 2
                });
              });
              renderModal();
              alert("✅ Muvaffaqiyatli! ETHITH AI " + aiRes.questions.length + " ta savolni tahlil qildi va imtihonga kiritdi!");
            } else {
              var ansMap = parseSmartAnswers(aText);
              var fallbackExtracted = parseQuestionsText(qText, ansMap);
              if (fallbackExtracted.length > 0) {
                questionsList = questionsList.concat(fallbackExtracted);
                renderModal();
                alert("Mahalliy tahlil orqali " + fallbackExtracted.length + " ta savol kiritildi.");
              } else {
                alert("AI savollarni ajrata olmadi. Iltimos, fayl yoki matnni tekshirib qaytadan urinib ko\'ring.");
              }
            }
          } catch(err) {
            console.warn("AI parse error, trying local fallback:", err);
            var ansMap2 = parseSmartAnswers(aText);
            var fallback2 = parseQuestionsText(qText, ansMap2);
            if (fallback2.length > 0) {
              questionsList = questionsList.concat(fallback2);
              renderModal();
              alert("AI bandligi sabab mahalliy tahlil ishlatildi: " + fallback2.length + " ta savol qo\'shildi!");
            } else {
              alert("Xatolik yuz berdi: " + (err.message || err));
            }
          } finally {
            if (btnAi) {
              btnAi.disabled = false;
              btnAi.style.opacity = '1';
              if (btnTextSpan) {
                btnTextSpan.textContent = '5 Soniyada AI Bilan Test Yaratish (ETHITH Vision & Parser)';
              }
            }
          }
        };
      }

      // Bulk Parse execution (Offline Local fallback)
      var parseBulkBtn = overlay.querySelector('#parseBulkBtn');
      if (parseBulkBtn) {
        parseBulkBtn.onclick = function() {
          saveCache();
          var qText = bulkTextCache.trim();
          var aText = bulkAnsCache.trim();
          if (!qText) {
            alert("Iltimos, avval savollar matnini kiriting yoki fayl yuklang!");
            return;
          }
          var ansMap = parseSmartAnswers(aText);
          var extracted = parseQuestionsText(qText, ansMap);
          if (extracted.length === 0) {
            alert("Savollarni ajratib bo\'lmadi. Savollar raqamlar bilan boshlanganiga ishonch hosil qiling (masalan: 1. yoki 1) )");
            return;
          }
          questionsList = questionsList.concat(extracted);
          alert(extracted.length + " ta savol muvaffaqiyatli aniqlandi va imtihonga qo\'shildi!");
          renderModal();
        };
      }

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
            alert("Iltimos, savol matni va kamida A hamda B variantlarini to\'ldiring!");
            return;
          }
          var opts = [a, b, c || "None", d || "None"];
          var ansMap = { 'A': a, 'B': b, 'C': c || "None", 'D': d || "None" };
          questionsList.push({
            id: questionsList.length + 1,
            type: 'choice',
            question: qText,
            options: opts,
            answer: ansMap[ansKey] || a,
            points: currentPoints
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
            alert("Iltimos, yozma savol matni va kutilgan to\'g'ri javobni kiriting!");
            return;
          }
          questionsList.push({
            id: questionsList.length + 1,
            type: 'written',
            question: qText,
            options: [],
            answer: ans,
            points: currentPoints
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
            alert("Iltimos, True / False fikr matnini kiriting!");
            return;
          }
          questionsList.push({
            id: questionsList.length + 1,
            type: 'bool',
            question: qText,
            options: ['True', 'False'],
            answer: ans,
            points: currentPoints
          });
          renderModal();
        };
      }

      // Delete single question
      overlay.querySelectorAll('[data-del-q]').forEach(function(btn) {
        btn.onclick = function() {
          var idx = parseInt(btn.dataset.delQ, 10);
          questionsList.splice(idx, 1);
          renderModal();
        };
      });

      // Clear all questions
      var clearAllBtn = overlay.querySelector('#clearAllQBtn');
      if (clearAllBtn) {
        clearAllBtn.onclick = function() {
          if (confirm("Barcha kiritilgan savollarni o\'chirmoqchimisiz?")) {
            questionsList = [];
            renderModal();
          }
        };
      }

      // Save Exam
      overlay.querySelector('#saveExamFinalBtn').onclick = function() {
        if (!currentTitle) {
          alert("Iltimos, imtihon nomini kiriting!");
          return;
        }
        if (questionsList.length === 0) {
          alert("Iltimos, kamida bitta savol qo\'shing!");
          return;
        }

        var code = generateRichExamCode('MCK');
        var newExam = {
          id: 'exam_' + Date.now(),
          code: code,
          title: currentTitle,
          duration: currentDuration,
          pointsPerQ: currentPoints,
          isPublic: (currentVisibility === 'public'),
          maxAttempts: currentMaxAttempts || 1,
          audioData: currentAudioData || null,
          audioName: currentAudioName || null,
          audioMaxPlays: currentAudioMaxPlays || 1,
          pdfData: currentPdfData || null,
          pdfName: currentPdfName || null,
          isLevelTransition: isLevelTransition,
          levelFrom: levelFrom,
          levelTo: levelTo,
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
        alert("Imtihon muvaffaqiyatli yaratildi!\nO\'quvchilar uchun 6 xonali maxsus kod: " + code);
        if (isLevelTransition && levelFrom) {
          renderLevelsView(container, levelFrom);
        } else {
          renderExamsView(container);
        }
      };
    }

    renderModal();
    document.body.appendChild(overlay);
  }

  function showJoinExamModal(container) {
    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';
    overlay.innerHTML = '' +
      '<div class="eth-modal" style="max-width:440px">' +
      '  <button type="button" class="eth-modal-close-btn" id="btnTopCloseJoinExam" title="Yopish">✕</button>' +
      '  <div class="eth-modal-header">' +
      '    <h2>' + ic('plus') + ' Imtihonga Kirish</h2>' +
      '    <p>O\'qituvchingiz bergan 6 xonali maxsus imtihon kodini kiriting</p>' +
      '  </div>' +
      '  <div class="eth-modal-body">' +
      '    <form id="joinExamForm">' +
      '      <div class="eth-form-group">' +
      '        <label>6 xonali Maxsus Imtihon Kodi</label>' +
      '        <input type="text" id="joinExCode" placeholder="Masalan: 849201" maxlength="6" required style="font-size:22px;letter-spacing:6px;text-align:center;font-weight:800;padding:12px">' +
      '      </div>' +
      '      <button type="submit" class="eth-btn-primary" style="width:100%;padding:12px 16px;font-size:15px">Imtihonni Boshlash ' + ic('right') + '</button>' +
      '      <button type="button" class="ap-btn out" id="btnCancelJoinExam" style="width:100%;margin-top:10px;padding:10px">Bekor qilish</button>' +
      '    </form>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
    var topClose = overlay.querySelector('#btnTopCloseJoinExam');
    if (topClose) topClose.onclick = function() { overlay.remove(); };
    var cancelBtn = overlay.querySelector('#btnCancelJoinExam');
    if (cancelBtn) cancelBtn.onclick = function() { overlay.remove(); };

    var onEsc = function(e) {
      if (e.key === 'Escape') {
        overlay.remove();
        window.removeEventListener('keydown', onEsc);
      }
    };
    window.addEventListener('keydown', onEsc);

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
        alert("Bunday 6 xonali kodga ega imtihon topilmadi! Kodni to\'g'ri kiritganingizni tekshiring.");
        return;
      }

      if (!checkStudentAttemptLimit(exam)) return;
      overlay.remove();
      startExamRunner(exam, container);
    };
  }

  function showOriginalPdfModal(exam) {
    if (!exam.pdfData) return;
    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';
    overlay.style.zIndex = '2147483649';
    overlay.innerHTML = '' +
      '<div class="eth-modal" style="max-width:960px;width:95vw;height:88vh;display:flex;flex-direction:column;padding:16px 20px">' +
      '  <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;border-bottom:1px solid var(--border)">' +
      '    <b style="font-size:16px">📑 Asl PDF Hujjati: ' + esc(exam.title) + '</b>' +
      '    <button type="button" class="eth-modal-close-btn" id="btnCloseOriginalPdf" style="position:static">✕</button>' +
      '  </div>' +
      '  <div style="flex:1;margin-top:12px;border-radius:10px;overflow:hidden;border:1px solid var(--border)">' +
      '    <iframe src="' + exam.pdfData + '#toolbar=0" style="width:100%;height:100%;border:none;background:#525659"></iframe>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.querySelector('#btnCloseOriginalPdf').onclick = function() {
      overlay.remove();
    };
  }

  function showPreTestSecurityBriefing(onConfirm) {
    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';
    overlay.style.zIndex = '2147483649';

    var activeTheme = (window.EthithApp && EthithApp.state && EthithApp.state.theme) || (window.S && S.theme) || (document.getElementById('app') && document.getElementById('app').getAttribute('data-theme')) || (document.body && document.body.getAttribute('data-theme')) || 'dark';
    overlay.setAttribute('data-theme', activeTheme);

    var isDark = (activeTheme === 'dark');
    var modalBg = isDark ? '#0d1829' : '#ffffff';
    var textPrimary = isDark ? '#f8fafc' : '#0f172a';
    var textMuted = isDark ? '#94a3b8' : '#475569';
    var textBold = isDark ? '#ffffff' : '#0f172a';

    var card1Bg = isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2';
    var card1Border = isDark ? 'rgba(239, 68, 68, 0.45)' : '#fecaca';
    var card1Title = isDark ? '#f87171' : '#b91c1c';
    var card1AlertBg = isDark ? 'rgba(239, 68, 68, 0.25)' : '#fee2e2';
    var card1AlertText = isDark ? '#fca5a5' : '#991b1b';

    var card2Bg = isDark ? 'rgba(16, 185, 129, 0.15)' : '#f0fdf4';
    var card2Border = isDark ? 'rgba(16, 185, 129, 0.45)' : '#bbf7d0';
    var card2Title = isDark ? '#34d399' : '#15803d';

    var card3Bg = isDark ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb';
    var card3Border = isDark ? 'rgba(245, 158, 11, 0.45)' : '#fde68a';
    var card3Title = isDark ? '#fbbf24' : '#b45309';

    overlay.innerHTML = '' +
      '<div class="eth-modal eth-security-briefing-modal" style="max-width:620px;padding:28px 30px;border:2.5px solid #ef4444;border-radius:20px;background:' + modalBg + ';color:' + textPrimary + ';box-shadow:0 25px 60px rgba(0,0,0,0.65), 0 0 30px rgba(239,68,68,0.2)">' +
      '  <div class="eth-modal-header" style="text-align:center;margin-bottom:20px;border-bottom:none;padding:0">' +
      '    <div style="font-size:44px;margin-bottom:10px">🛡️</div>' +
      '    <h2 style="font-size:23px;font-weight:900;color:' + textPrimary + ';margin:0 0 8px;letter-spacing:-0.01em">Qat\'iy Imtihon Xavfsizlik Qoidalari</h2>' +
      '    <p style="margin:0;font-size:14px;color:' + textMuted + ';line-height:1.5">Test boshlanishidan oldin quyidagi talablar bilan diqqat bilan tanishib chiqing:</p>' +
      '  </div>' +
      '  <div class="eth-modal-body" style="display:flex;flex-direction:column;gap:14px;font-size:13.5px;line-height:1.6;padding:0">' +
      '    <div style="background:' + card1Bg + ';border:1.5px solid ' + card1Border + ';padding:14px 16px;border-radius:12px">' +
      '      <b style="color:' + card1Title + ';display:flex;align-items:center;gap:6px;font-size:14.5px;margin-bottom:6px">🚫 1. TAQIQLANGAN TUGMALAR (Klaviaturadan qat\'iy nazorat):</b>' +
      '      <div style="color:' + textPrimary + ';margin-bottom:8px">' +
      '        Klaviaturadagi <b style="color:' + textBold + '">Tab, Esc, Alt, Windows (Win), Ctrl, Fn, F1–F12, Strelkalar (▲ ▼ ◄ ►), Delete (Del), Home (HM), PageUp (PU), PageDown (PD), Insert (INS), PrintScreen (PS), ScrollLock (SL), Pause/Break (PB)</b> tugmalariga tegish QAT\'IYAN TAQIQLANADI!' +
      '      </div>' +
      '      <div style="font-size:12.5px;color:' + card1AlertText + ';font-weight:800;background:' + card1AlertBg + ';padding:8px 12px;border-radius:8px;border:1px solid ' + card1Border + '">' +
      '        ⚠️ Test to\'liq ekranda o\'tkaziladi. Esc tugmasi bosilsa yoki to\'liq ekrandan chiqishga urunilsa, ekrandan chiqilmaydi va test DARHOL BLOKLANADI! O\'qituvchiga firibgarlik xabari yuboriladi!' +
      '      </div>' +
      '    </div>' +
      '    <div style="background:' + card2Bg + ';border:1.5px solid ' + card2Border + ';padding:14px 16px;border-radius:12px">' +
      '      <b style="color:' + card2Title + ';display:flex;align-items:center;gap:6px;font-size:14.5px;margin-bottom:6px">✅ 2. RUXSAT ETILGAN TUGMALAR:</b>' +
      '      <div style="color:' + textPrimary + '">' +
      '        Faqat javoblarni yozish uchun <b style="color:' + textBold + '">Harflar (A-Z, a-z), Sonlar (0-9), Probel (Space), Shift, Backspace (o\'chirish)</b> va tinish belgilaridan bemalol foydalanishingiz mumkin.' +
      '      </div>' +
      '    </div>' +
      '    <div style="background:' + card3Bg + ';border:1.5px solid ' + card3Border + ';padding:14px 16px;border-radius:12px">' +
      '      <b style="color:' + card3Title + ';display:flex;align-items:center;gap:6px;font-size:14.5px;margin-bottom:6px">📷 3. 30° QAT\'IY KAMERA VA OVAL NAZORATI:</b>' +
      '      <div style="color:' + textPrimary + '">' +
      '        Boshni <b style="color:' + textBold + '">30° dan ortiq burish</b>, kameradan uzoqlashish yoki brauzer oynasidan chiqish taqiqlanadi. Qoidabuzarlik yuz bersa, test bloklanadi va faqat o\'qituvchi blokdan ochmaguncha hech narsa ishlamaydi.' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '  <div style="margin-top:22px">' +
      '    <button type="button" class="eth-btn-primary" id="btnConfirmStartRules" style="width:100%;padding:15px 20px;font-size:15.5px;font-weight:800;background:linear-gradient(135deg,#2563eb,#1d4ed8);border-radius:12px;color:#ffffff;border:none;box-shadow:0 4px 16px rgba(37,99,235,0.45);cursor:pointer">' +
      '      ✅ Qoidalarni tushundim, testni boshlash &rarr;' +
      '    </button>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.querySelector('#btnConfirmStartRules').onclick = function() {
      try {
        var AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          if (!window._ethithAudioCtx) window._ethithAudioCtx = new AudioCtx();
          if (window._ethithAudioCtx.state === 'suspended') window._ethithAudioCtx.resume().catch(function(){});
        }
      } catch(e) {}
      overlay.remove();
      onConfirm();
    };
  }

  function startExamRunner(exam, mainContainer) {
    window._ethithIsTestInProgress = true;
    window._ethithRefreshQuizList = null;
    window._ethithRefreshGifts = null;
    var isTeacher = S.user && S.user.role === 'teacher';
    var timeLeftSeconds = exam.duration * 60;
    var isExamFinished = false;
    var isExamLocked = false;
    var proctorStream = null;
    var proctorInterval = null;
    var turnInfractionFrames = 0;
    var isPaletteCollapsed = false;
    var sessionInfractions = [];

    var state = {
      i: 0,
      answers: {}
    };

    window._ethithActiveRunningExam = exam;
    window._ethithOnActiveExamUpdated = function(updatedExam) {
      if (isExamFinished) return;
      exam.title = updatedExam.title || exam.title;
      exam.duration = updatedExam.duration || exam.duration;
      exam.isPublic = updatedExam.isPublic !== undefined ? updatedExam.isPublic : exam.isPublic;
      exam.maxAttempts = updatedExam.maxAttempts || exam.maxAttempts;
      if (updatedExam.questions && updatedExam.questions.length > 0) {
        exam.questions = updatedExam.questions;
      }
      var toast = document.createElement('div');
      toast.className = 'eth-live-toast-alert';
      toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#1e3a8a;color:#fff;padding:12px 24px;border-radius:12px;font-weight:700;z-index:99999999;box-shadow:0 8px 24px rgba(0,0,0,0.3);border:1.5px solid #60a5fa';
      toast.innerHTML = '🔔 <b>O\'qituvchi imtihon parametrlarini real vaqtda yangiladi!</b>';
      document.body.appendChild(toast);
      setTimeout(function() { if (toast && toast.parentNode) toast.remove(); }, 4000);
      try { renderExamQuestion(); } catch(e) {}
    };

    if (!isTeacher) {
      showPreTestSecurityBriefing(initRunner);
    } else {
      initRunner();
    }

    function initRunner() {
      // 1. Remove previous modal/overlay if any
      var oldModal = document.getElementById('ethExamLockdownModal');
      if (oldModal) oldModal.remove();
      var oldPip = document.getElementById('proctorPip');
      if (oldPip) oldPip.remove();
      var oldLock = document.getElementById('examLockedScreen');
      if (oldLock) oldLock.remove();

      // 2. Mount Dedicated Fullscreen Lockdown Container directly to body
      var lockdownModal = document.createElement('div');
      lockdownModal.id = 'ethExamLockdownModal';
      lockdownModal.className = 'eth-lockdown-fullscreen';
      var activeTheme = (window.EthithApp && EthithApp.state && EthithApp.state.theme) || (window.S && S.theme) || (document.getElementById('app') && document.getElementById('app').getAttribute('data-theme')) || (document.body && document.body.getAttribute('data-theme')) || 'dark';
      lockdownModal.setAttribute('data-theme', activeTheme);
      document.body.setAttribute('data-theme', activeTheme);
      document.body.appendChild(lockdownModal);

      // 2.5 Fullscreen & Keyboard Lock Enforcement (Students only)
      function requestKeyboardLock() {
        if (isTeacher || isExamFinished) return;
        if (navigator.keyboard && navigator.keyboard.lock) {
          try {
            var lockPromise = navigator.keyboard.lock([
              'Escape',
              'Tab',
              'AltLeft',
              'AltRight',
              'ControlLeft',
              'ControlRight',
              'MetaLeft',
              'MetaRight',
              'ContextMenu'
            ]);
            if (lockPromise && lockPromise.catch) {
              lockPromise.catch(function() {
                try {
                  navigator.keyboard.lock().catch(function(){});
                } catch(e) {}
              });
            }
          } catch(e) {}
        }
      }

      function ensureFullscreen() {
        if (isTeacher || isExamFinished) return;
        var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
        if (!isFs) {
          try {
            var target = lockdownModal || document.documentElement;
            var req = target.requestFullscreen || target.webkitRequestFullscreen || target.mozRequestFullScreen || target.msRequestFullscreen;
            if (req) {
              var p = req.call(target, { navigationUI: 'hide' });
              if (p && p.then) {
                p.then(function() {
                  requestKeyboardLock();
                }).catch(function(){});
              } else {
                requestKeyboardLock();
              }
            }
          } catch(e) {}
        } else {
          requestKeyboardLock();
        }
      }

      if (!isTeacher) {
        document.body.classList.add('proctored-fullscreen-mode');
        ensureFullscreen();
      }

      function onFullscreenChange() {
        if (isTeacher || isExamFinished) return;
        var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
        if (!isFs) {
          ensureFullscreen();
          if (!isExamLocked) {
            triggerInfraction("O\'quvchi Escape (Esc) tugmasini bosib ekrandan chiqishga urindi!");
          }
        } else {
          requestKeyboardLock();
        }
      }

      function onWindowResize() {
        if (isTeacher || isExamFinished) return;
        var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
        if (!isFs && !isExamLocked) {
          ensureFullscreen();
          triggerInfraction("O\'quvchi brauzer o\'lchamini o\'zgartirib chiqishga urindi!");
        }
      }

      // 3. Anti-Cheat: Tab Switch & Window Blur Detection (students only)
      function onWindowBlur() {
        if (isTeacher || isExamFinished || isExamLocked) return;
        triggerInfraction("Brauzer oynasi tark etildi yoki boshqa dasturga o\'tildi!");
      }
      function onVisChange() {
        if (isTeacher || isExamFinished || isExamLocked) return;
        if (document.hidden) {
          triggerInfraction("Boshqa tabga o\'tildi yoki oyna kichraytirildi!");
        }
      }

      // 3.5. Anti-Cheat: Strict Keyboard Lockdown (students only)
      var PROHIBITED_KEYS_MAP = {
        'tab': 'Tab',
        'escape': 'Escape (Esc)',
        'esc': 'Escape (Esc)',
        'alt': 'Alt',
        'altgraph': 'Alt',
        'control': 'Ctrl',
        'ctrl': 'Ctrl',
        'meta': 'Windows (Win)',
        'os': 'Windows (Win)',
        'fn': 'Fn',
        'fnlock': 'Fn',
        'arrowup': 'Yuqoriga strelka (▲)',
        'arrowdown': 'Pastga strelka (▼)',
        'arrowleft': 'Chapga strelka (◄)',
        'arrowright': 'O\'ngga strelka (►)',
        'delete': 'Delete (Del)',
        'home': 'Home (HM)',
        'end': 'End',
        'pageup': 'PageUp (PU)',
        'pagedown': 'PageDown (PD)',
        'insert': 'Insert (INS)',
        'printscreen': 'PrintScreen (PS)',
        'scrolllock': 'ScrollLock (SL)',
        'pause': 'Pause/Break (PB)',
        'contextmenu': 'Kontekst Menyusi'
      };

      function getBlockedKeyLabel(e) {
        var k = (e.key || '').toLowerCase();
        var code = (e.code || '').toLowerCase();
        var which = e.which || e.keyCode;

        // Escape checks
        if (k === 'escape' || k === 'esc' || code === 'escape' || which === 27) {
          return 'Escape (Esc)';
        }

        // Tab check
        if (k === 'tab' || code === 'tab' || which === 9) {
          return 'Tab';
        }

        // Function keys F1 - F12
        if (/^f(1[0-2]|[1-9])$/.test(k) || /^f(1[0-2]|[1-9])$/.test(code) || (which >= 112 && which <= 123)) {
          return (e.key || e.code || ('F' + (which - 111))).toUpperCase();
        }

        // Direct map
        if (PROHIBITED_KEYS_MAP[k]) return PROHIBITED_KEYS_MAP[k];
        if (PROHIBITED_KEYS_MAP[code]) return PROHIBITED_KEYS_MAP[code];

        // Modifier combos
        if (e.altKey || k === 'alt' || code === 'altleft' || code === 'altright') return 'Alt';
        if (e.metaKey || k === 'meta' || code === 'metaleft' || code === 'metaright' || code === 'osleft' || code === 'osright') return 'Windows (Win)';
        if (e.ctrlKey || k === 'control' || code === 'controlleft' || code === 'controlright') return 'Ctrl';

        // Arrows
        if (which === 37) return 'Chapga strelka (◄)';
        if (which === 38) return 'Yuqoriga strelka (▲)';
        if (which === 39) return 'O\'ngga strelka (►)';
        if (which === 40) return 'Pastga strelka (▼)';

        // Delete, Home, End, PageUp, PageDown, Insert, PrintScreen, etc.
        if (which === 46) return 'Delete (Del)';
        if (which === 36) return 'Home (HM)';
        if (which === 35) return 'End';
        if (which === 33) return 'PageUp (PU)';
        if (which === 34) return 'PageDown (PD)';
        if (which === 45) return 'Insert (INS)';
        if (which === 44) return 'PrintScreen (PS)';
        if (which === 145) return 'ScrollLock (SL)';
        if (which === 19) return 'Pause/Break (PB)';
        if (which === 93) return 'Kontekst Menyusi';

        return null;
      }

      function onKeyDownProctor(e) {
        if (isTeacher || isExamFinished) return;
        var blockedKeyName = getBlockedKeyLabel(e);
        if (blockedKeyName) {
          try {
            e.preventDefault();
            e.stopPropagation();
            if (e.stopImmediatePropagation) e.stopImmediatePropagation();
          } catch(err) {}
          ensureFullscreen();
          if (!isExamLocked) {
            triggerInfraction("O\'quvchi " + blockedKeyName + " tugmasini bosib ekranni o\'zgartirib firibgarlik qilmoqchi bo\'ldi!");
          }
          return false;
        }
      }

      function onKeyUpProctor(e) {
        if (isTeacher || isExamFinished) return;
        var blockedKeyName = getBlockedKeyLabel(e);
        if (blockedKeyName) {
          try {
            e.preventDefault();
            e.stopPropagation();
            if (e.stopImmediatePropagation) e.stopImmediatePropagation();
          } catch(err) {}
          ensureFullscreen();
          return false;
        }
      }

      if (!isTeacher) {
        window.addEventListener('blur', onWindowBlur);
        document.addEventListener('visibilitychange', onVisChange);
        window.addEventListener('keydown', onKeyDownProctor, true);
        window.addEventListener('keyup', onKeyUpProctor, true);
        document.addEventListener('keydown', onKeyDownProctor, true);
        document.addEventListener('keyup', onKeyUpProctor, true);
        document.addEventListener('fullscreenchange', onFullscreenChange);
        document.addEventListener('webkitfullscreenchange', onFullscreenChange);
        document.addEventListener('mozfullscreenchange', onFullscreenChange);
        document.addEventListener('MSFullscreenChange', onFullscreenChange);
        window.addEventListener('resize', onWindowResize);
        window.addEventListener('click', ensureFullscreen, true);
      }

      // Camera proctoring completely disabled
      function captureProctorSnapshot() {
        return null;
      }


      // Camera face tracking removed
      // 6. Trigger Infraction & Lock Exam with Photographic Proof
      function triggerInfraction(reason, violationSnapshot) {
        if (isTeacher || isExamLocked || isExamFinished) return;
        isExamLocked = true;
        playTitTitAlarm(6);

        var snapshotImg = violationSnapshot || captureProctorSnapshot();
        sessionInfractions.push({
          reason: reason,
          snapshot: snapshotImg,
          timestamp: Date.now()
        });

        var angleBadge = document.getElementById('proctorCamAngle');
        var dot = document.getElementById('proctorCamDot');
        if (dot) dot.className = 'eth-cam-dot danger';
        if (angleBadge) {
          angleBadge.textContent = 'BLOKLANDI';
          angleBadge.className = 'eth-cam-badge danger';
        }

        try {
          var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          var osc = audioCtx.createOscillator();
          var gain = audioCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(440, audioCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.4);
          gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.4);
        } catch(ae) {}

        var existingLock = document.getElementById('examLockedScreen');
        if (existingLock) existingLock.remove();

        var lockedOverlay = document.createElement('div');
        lockedOverlay.className = 'eth-exam-locked-screen';
        lockedOverlay.id = 'examLockedScreen';
        lockedOverlay.style.zIndex = '2147483648';
        lockedOverlay.innerHTML = '' +
          '<div class="eth-locked-box" style="max-width:520px;text-align:center;">' +
          '  <div class="eth-locked-icon">🚫</div>' +
          '  <h2 style="color:#ef4444;margin:8px 0 6px;">TEST BLOKLANDI: QOIDABUZARLIK ANIQLANDI</h2>' +
          '  <div class="eth-locked-student-badge">' +
          '    <span class="eth-locked-student-label">👤 BLOKLANGAN O\'QUVCHI:</span>' +
          '    <div class="eth-locked-student-name">' + esc((S.user && S.user.name) || 'O\'quvchi') + '</div>' +
          '  </div>' +
          '  <div class="eth-locked-reason" style="font-size:13.5px;padding:8px 12px;margin-bottom:12px;"><b>🚨 Qoidabuzarlik:</b> ' + esc(reason) + '</div>' +
          (snapshotImg ?
            '  <div class="eth-locked-snapshot-wrap">' +
            '    <div class="eth-locked-snapshot-badge">📸 Qoidabuzarlik Holati (Foto-Fakt Dalili)</div>' +
            '    <img src="' + snapshotImg + '" alt="Qoidabuzarlik surati">' +
            '    <div class="eth-locked-snapshot-hint">Ushbu foto-dalil avtomatik tarzda o\'qituvchingizga yuborildi</div>' +
            '  </div>' : ''
          ) +
          '  <div class="eth-locked-msg" style="font-size:13.5px;line-height:1.5;margin-bottom:14px;">' +
          '    Test paytida boshni 65° dan ortiq burish, 2.5 soniyadan ortiq chetga qarash yoki boshqa sahifalarga o\'tish qat\'iyan taqiqlanadi.<br>' +
          '    <b>O\'qituvchingiz ushbu foto-dalilni tekshirib, sizni blokdan chiqarguniga qadar kuting.</b>' +
          '  </div>' +
          '  <div class="eth-locked-pulse">' +
          '    <span class="eth-cam-dot danger"></span> O\'qituvchi tomonidan ko\'rib chiqilishi kutilmoqda...' +
          '  </div>' +
          '</div>';
        lockdownModal.appendChild(lockedOverlay);

        if (window.EthithSync) {
          window.EthithSync.publishLive({
            type: 'STUDENT_BLOCKED',
            studentId: (S.user && (S.user.email || S.user.id)) || 'guest',
            studentName: (S.user && S.user.name) || 'O\'quvchi',
            studentEmail: (S.user && S.user.email) || '',
            examId: exam.id,
            examCode: exam.code,
            examTitle: exam.title,
            reason: reason,
            snapshot: snapshotImg,
            timestamp: Date.now()
          });
        }
      }

      // 7. Real-Time Unblock Listener (Sub-100ms wakeup)
      window._ethithOnStudentUnblocked = function(ev) {
        var myKey = (S.user && (S.user.email || S.user.id || '')).toLowerCase();
        if ((ev.studentEmail && ev.studentEmail.toLowerCase() === myKey) ||
            (ev.studentId && ev.studentId.toLowerCase() === myKey)) {
          isExamLocked = false;
          turnInfractionFrames = 0;
          var lockEl = document.getElementById('examLockedScreen');
          if (lockEl) lockEl.remove();
          var angleBadge = document.getElementById('proctorCamAngle');
          var dot = document.getElementById('proctorCamDot');
          if (dot) dot.className = 'eth-cam-dot';
          if (angleBadge) {
            angleBadge.textContent = 'To\'g\'ri: 0°';
            angleBadge.className = 'eth-cam-badge';
          }
          ensureFullscreen();
        }
      };

    // 8. Exam Timer
    var timerInterval = setInterval(function() {
      if (isExamLocked || isExamFinished) return;
      timeLeftSeconds--;
      var badge = document.getElementById('examTimerDisplay');
      if (badge) {
        var m = Math.floor(timeLeftSeconds / 60);
        var s = timeLeftSeconds % 60;
        badge.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
      }
      if (timeLeftSeconds <= 0) {
        clearInterval(timerInterval);
        alert("Vaqt tugadi! Test avtomatik ravishda yakunlanadi.");
        finishExam();
      }
    }, 1000);

    // 9. Render Question & Palette
    // 8.5 Persistent Audio Player for Listening Exams (Continuous playback across question navigation)
    var audioBarEl = null;
    var examAudioObj = null;
    var maxAudioPlays = exam.audioMaxPlays || 1;
    var audioPlaysDone = 0;
    if (exam.audioData) {
      audioBarEl = document.createElement('div');
      audioBarEl.className = 'eth-test-audio-bar';
      audioBarEl.id = 'examPersistentAudioBar';
      audioBarEl.innerHTML = '' +
        '<div style="display:flex;align-items:center;gap:12px;width:100%;max-width:850px;margin:0 auto;flex-wrap:wrap">' +
        '  <button type="button" class="eth-test-audio-btn" id="btnExamAudioPlay">▶ Tinglash</button>' +
        '  <span class="eth-audio-replay-badge" id="examAudioPlaysBadge">Tinglash imkoni: ' + (maxAudioPlays - audioPlaysDone) + ' / ' + maxAudioPlays + '</span>' +
        '  <div style="flex:1;min-width:180px;display:flex;flex-direction:column;gap:3px">' +
        '    <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700">' +
        '      <span>🎧 Listening Audio: <b style="color:var(--test-accent)">' + esc(exam.audioName || 'Track') + '</b></span>' +
        '      <span id="examAudioTimeDisplay">00:00 / 00:00</span>' +
        '    </div>' +
        '    <input type="range" class="eth-test-audio-progress" id="examAudioProgress" value="0" min="0" max="100" step="0.1">' +
        '  </div>' +
        '  <button type="button" class="eth-test-audio-speed" id="btnExamAudioSpeed">1.0x</button>' +
        '  <audio id="examAudioEl" src="' + exam.audioData + '" preload="auto" style="display:none"></audio>' +
        '</div>';
      lockdownModal.appendChild(audioBarEl);

      examAudioObj = audioBarEl.querySelector('#examAudioEl');
      var playBtn = audioBarEl.querySelector('#btnExamAudioPlay');
      var timeDisp = audioBarEl.querySelector('#examAudioTimeDisplay');
      var progBar = audioBarEl.querySelector('#examAudioProgress');
      var speedBtn = audioBarEl.querySelector('#btnExamAudioSpeed');
      var playsBadge = audioBarEl.querySelector('#examAudioPlaysBadge');

      function fmtTime(sec) {
        var m = Math.floor(sec / 60);
        var s = Math.floor(sec % 60);
        return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
      }

      if (playBtn && examAudioObj) {
        playBtn.onclick = function() {
          if (audioPlaysDone >= maxAudioPlays) {
            alert("Audio tinglash limitiga yetdingiz (" + maxAudioPlays + " marta). Qayta tinglash mumkin emas!");
            return;
          }
          if (examAudioObj.paused) {
            examAudioObj.play().then(function() {
              playBtn.textContent = '⏸ To\'xtatish';
            }).catch(function(){});
          } else {
            examAudioObj.pause();
            playBtn.textContent = '▶ Tinglash';
          }
        };

        examAudioObj.ontimeupdate = function() {
          if (!isNaN(examAudioObj.duration) && examAudioObj.duration > 0) {
            var cur = examAudioObj.currentTime;
            var dur = examAudioObj.duration;
            timeDisp.textContent = fmtTime(cur) + ' / ' + fmtTime(dur);
            progBar.value = (cur / dur) * 100;
          }
        };

        examAudioObj.onended = function() {
          audioPlaysDone++;
          if (audioPlaysDone >= maxAudioPlays) {
            playBtn.disabled = true;
            playBtn.classList.add('exhausted');
            playBtn.textContent = '⛔ Tinglash limiti tugadi (' + maxAudioPlays + '/' + maxAudioPlays + ')';
            if (playsBadge) {
              playsBadge.textContent = '⛔ 0/' + maxAudioPlays + ' qoldi';
              playsBadge.style.color = '#ef4444';
              playsBadge.style.borderColor = 'rgba(239,68,68,0.3)';
              playsBadge.style.background = 'rgba(239,68,68,0.1)';
            }
          } else {
            playBtn.textContent = '▶ Tinglash';
            if (playsBadge) {
              playsBadge.textContent = 'Tinglash imkoni: ' + (maxAudioPlays - audioPlaysDone) + ' / ' + maxAudioPlays;
            }
          }
        };

        progBar.oninput = function() {
          if (!isNaN(examAudioObj.duration) && examAudioObj.duration > 0) {
            examAudioObj.currentTime = (progBar.value / 100) * examAudioObj.duration;
          }
        };

        var speeds = [1.0, 1.2, 1.5, 0.8];
        var sIdx = 0;
        speedBtn.onclick = function() {
          sIdx = (sIdx + 1) % speeds.length;
          examAudioObj.playbackRate = speeds[sIdx];
          speedBtn.textContent = speeds[sIdx] + 'x';
        };
      }
    }

    // 8.6 Authentic Interactive Worksheet Engine (Default: solve directly on paper)
    var isPaperMode = true;

    // 9. Render Question & Palette
    function renderExamQuestion() {
      if (isExamFinished) return;
      var q = exam.questions[state.i];
      var qType = q.type || 'choice';
      var answeredCount = Object.keys(state.answers).filter(function(k){ return state.answers[k] !== undefined && state.answers[k] !== ''; }).length;
      var totalQ = exam.questions.length;
      var progressPct = Math.round((answeredCount / totalQ) * 100);

      var m = Math.floor(timeLeftSeconds / 60);
      var s = timeLeftSeconds % 60;
      var timerStr = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;

      var html = '' +
        '<header class="eth-test-topbar">' +
        '  <div class="eth-test-topbar-left">' +
        '    <div class="eth-test-badge">' +
        '      <span class="eth-test-badge-dot"></span>' +
        '      <span>' + esc(exam.title) + '</span>' +
        '    </div>' +
        '    <span class="eth-test-qcount">' + (exam.code ? 'Kod: <b>' + exam.code + '</b>' : '(Nazoratli Test)') + '</span>' +
        '  </div>' +
        '  <div class="eth-test-topbar-center">' +
        '    <div class="eth-test-timer-pill" title="Qolgan vaqt">' +
        '      <span>⏱</span>' +
        '      <span id="examTimerDisplay">' + timerStr + '</span>' +
        '    </div>' +
        '  </div>' +
        '  <div class="eth-test-topbar-right">' +
        (exam.pdfData ?
          '    <button type="button" class="eth-test-mode-toggle" id="btnViewOriginalPdf" style="background:rgba(255,255,255,0.12);border:1.5px solid rgba(255,255,255,0.25);color:#fff;padding:6px 12px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;margin-right:8px;transition:all 0.15s">' +
          '      📑 Asl PDF Nusxasi' +
          '    </button>' : '') +
        '    <button type="button" class="eth-test-mode-toggle" id="btnTogglePaperMode" style="background:rgba(255,255,255,0.12);border:1.5px solid rgba(255,255,255,0.25);color:#fff;padding:6px 12px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;margin-right:8px;transition:all 0.15s">' +
        (isPaperMode ? '🔘 Bittalab Ko\'rish' : '📄 To\'liq Varoq (Worksheet)') +
        '    </button>' +
        '    <div class="eth-test-progress-info">' +
        '      <div class="eth-test-progress-text">Belgilangan: <b>' + answeredCount + ' / ' + totalQ + '</b> (' + progressPct + '%)</div>' +
        '      <div class="eth-test-progress-bar"><i style="width:' + progressPct + '%"></i></div>' +
        '    </div>' +
        '    <button type="button" class="eth-test-btn-finish" id="btnHeaderFinish">🏁 <span>Yakunlash</span></button>' +
        '  </div>' +
        '</header>';

      if (isPaperMode) {
        // Authentic Pure White Interactive Test Worksheet Paper (Marked Directly on the Test Paper)
        var studentName = (S.user && S.user.name) || 'O\'quvchi';
        var totalPossible = exam.questions.reduce(function(acc, item) { return acc + (item.points || exam.pointsPerQ || 2); }, 0);

        html += '' +
          '<main class="eth-worksheet-wrapper" id="worksheetMainWrapper">' +
          '  <div class="eth-worksheet-paper">' +
          '    <!-- Paper Header -->' +
          '    <div class="eth-paper-header">' +
          '      <div class="eth-paper-title-row">' +
          '        <div>' +
          '          <div class="eth-paper-institution">ETHITH International Examination Center</div>' +
          '          <h1 class="eth-paper-title">' + esc(exam.title) + '</h1>' +
          '        </div>' +
          '        <div class="eth-paper-marks-pill">⭐ Total Marks: ' + totalPossible + '</div>' +
          '      </div>' +
          '      <div class="eth-paper-meta-grid">' +
          '        <div class="eth-paper-meta-item"><b>Candidate:</b> <span>' + esc(studentName) + '</span></div>' +
          '        <div class="eth-paper-meta-item"><b>Date:</b> <span>' + new Date().toLocaleDateString() + '</span></div>' +
          '        <div class="eth-paper-meta-item"><b>Duration:</b> <span>' + exam.duration + ' mins</span></div>' +
          '        <div class="eth-paper-meta-item"><b>Questions:</b> <span>' + totalQ + ' items</span></div>' +
          '      </div>' +
          '      <div class="eth-paper-instructions">' +
          '        <b>📝 TOPSHIRIQLAR VA BELGILASH YO\'RIQNOMASI:</b><br>' +
          '        Savollarni diqqat bilan o\'qing va javoblaringizni to\'g\'ridan-to\'g\'ri ushbu varoqdagi variantlarni bosish yoki bo\'sh joylarga yozish orqali belgilang. Alohida yon panel yo\'q — barcha test bevosita varoq ustida ishlanadi.' +
          '      </div>' +
          '    </div>' +
          '    <!-- Paper Questions List -->' +
          '    <div class="eth-paper-questions-list">';

        exam.questions.forEach(function(qObj, qIdx) {
          var t = qObj.type || 'choice';
          var curAns = state.answers[qIdx];
          var isAns = (curAns !== undefined && curAns !== '');
          var pts = qObj.points || exam.pointsPerQ || 2;

          if (qObj.sectionTitle && (!exam.questions[qIdx - 1] || exam.questions[qIdx - 1].sectionTitle !== qObj.sectionTitle)) {
            html += '' +
              '    <div class="eth-paper-section-banner">' +
              '      <b>📖 ' + esc(qObj.sectionTitle) + '</b>' +
              (qObj.passage ? '      <div class="eth-paper-passage">' + esc(qObj.passage) + '</div>' : '') +
              '    </div>';
          }

          html += '' +
            '    <div class="eth-paper-q-card' + (isAns ? ' answered' : '') + '" id="paperQ_' + qIdx + '" data-paper-q-card="' + qIdx + '">' +
            '      <div class="eth-paper-q-top">' +
            '        <span class="eth-paper-q-num-badge">#' + (qIdx + 1) + '-Savol</span>' +
            '        <span class="eth-paper-q-pts">' + pts + ' ball</span>' +
            '      </div>' +
            '      <div class="eth-paper-q-text">' + (qIdx + 1) + '. ' + esc(qObj.question) + '</div>';

          var isWritingQ = (t === 'writing') || (/write\s+(an?\s+)?(essay|letter|paragraph|story|summary|report|article)|writing\s+task/i.test(qObj.question || ''));
          if (isWritingQ) {
            var curW = curAns || '';
            var wWords = curW ? curW.trim().split(/\s+/).filter(Boolean).length : 0;
            html += '' +
              '      <div class="eth-paper-writing-container">' +
              '        <div class="eth-paper-writing-header">' +
              '          <span class="eth-writing-badge">✍️ Yozma Insho / Writing Task</span>' +
              '          <span class="eth-writing-word-count" id="wc_' + qIdx + '">' + wWords + ' so\'z yozildi</span>' +
              '          <span class="eth-writing-target">Tavsiya: 50-150 so\'z</span>' +
              '        </div>' +
              '        <textarea class="eth-paper-writing-area" data-paper-writing-q="' + qIdx + '" rows="8" placeholder="Insho yoki yozma topshiriq javobingizni shu yerga to\'liq yozing...">' + esc(curW) + '</textarea>' +
              '        <div class="eth-writing-hint">💡 Mazmunning mosligi, matn tuzilishi, so\'z boyligi va grammatika AI tomonidan sinchkovlik bilan baholanadi.</div>' +
              '      </div>';
          } else if (t === 'bool') {
            html += '' +
              '      <div class="eth-paper-bool-group">' +
              '        <button type="button" class="eth-paper-bool-btn' + (curAns === 'True' ? ' selected' : '') + '" data-paper-q="' + qIdx + '" data-paper-ans="True">' +
              '          <span class="check-mark">✓</span> TRUE' +
              '        </button>' +
              '        <button type="button" class="eth-paper-bool-btn' + (curAns === 'False' ? ' selected' : '') + '" data-paper-q="' + qIdx + '" data-paper-ans="False">' +
              '          <span class="check-mark">✓</span> FALSE' +
              '        </button>' +
              '      </div>';
          } else if (t === 'choice') {
            html += '      <div class="eth-paper-choice-group">';
            qObj.options.forEach(function(opt, oIdx) {
              var letter = String.fromCharCode(65 + oIdx);
              var isSel = (curAns === opt || curAns === letter || (typeof curAns === 'string' && curAns.toLowerCase() === opt.toLowerCase()));
              html += '' +
                '        <div class="eth-paper-choice-item' + (isSel ? ' selected' : '') + '" data-paper-q="' + qIdx + '" data-paper-ans="' + esc(opt) + '" data-paper-letter="' + letter + '">' +
                '          <div class="eth-paper-choice-radio">' +
                '            <div class="eth-paper-radio-inner"></div>' +
                '          </div>' +
                '          <div class="eth-paper-choice-letter"><b>' + letter + ')</b></div>' +
                '          <div class="eth-paper-choice-label">' + esc(opt) + '</div>' +
                '        </div>';
            });
            html += '      </div>';
          } else {
            html += '' +
              '      <div class="eth-paper-gap-wrap">' +
              '        <span class="eth-paper-gap-label">✍️ Sizning javobingiz:</span>' +
              '        <input type="text" class="eth-paper-gap-input" data-paper-input-q="' + qIdx + '" value="' + esc(curAns || '') + '" placeholder="Javobni shu yerga yozing..." />' +
              '      </div>';
          }

          html += '    </div>';
        });

        html += '' +
          '    </div>' +
          '    <!-- Bottom Finish -->' +
          '    <div class="eth-paper-bottom-finish">' +
          '      <div style="font-size:14.5px;color:#64748b;font-weight:700">' +
          '        Jami: <b style="color:#2563eb"><span id="paperFooterAnswered">' + answeredCount + '</span> / ' + totalQ + '</b> ta savol belgilandi' +
          '      </div>' +
          '      <button type="button" class="eth-paper-finish-btn" id="btnPaperFinishBottom">' +
          '        🏁 Imtihonni Yakunlash va Natijalarni Saqlash (Finish Exam) &rarr;' +
          '      </button>' +
          '    </div>' +
          '  </div>' +
          '  <!-- Floating Quick Jump Navigator -->' +
          '  <div class="eth-paper-quick-nav" id="paperQuickNav">' +
          '    <div class="eth-paper-nav-title">' +
          '      <div style="display:flex;align-items:center;gap:6px">' +
          '        <span>📋 Savollar</span>' +
          '        <b style="color:#60a5fa;font-size:11.5px"><span id="paperNavAnsweredCount">' + answeredCount + '</span>/' + totalQ + '</b>' +
          '      </div>' +
          '      <button type="button" class="eth-paper-btn-min" id="btnMinQuickNav" title="Kichraytirish / Kattalashtirish">—</button>' +
          '    </div>' +
          '    <div class="eth-paper-nav-grid">';

        exam.questions.forEach(function(_, idx) {
          var isAns = (state.answers[idx] !== undefined && state.answers[idx] !== '');
          html += '<button type="button" class="eth-paper-nav-btn' + (isAns ? ' answered' : '') + '" data-jump-to="' + idx + '" title="Savol ' + (idx + 1) + '">' + (idx + 1) + '</button>';
        });

        html += '' +
          '    </div>' +
          '  </div>' +
          '</main>';
      } else {
        // Standard Single-Question Card Mode
        html += '' +
          '<main class="eth-test-main">' +
          '  <!-- Collapsible Question Palette Card -->' +
          '  <div class="eth-test-palette-card">' +
          '    <div class="eth-test-palette-header" id="btnTogglePalette">' +
          '      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
          '        <span style="font-size:16px">📋</span>' +
          '        <b style="font-size:14px;letter-spacing:-0.01em">Savollar navigatsiyasi</b>' +
          '        <span class="eth-test-chip success">✅ ' + answeredCount + ' ta belgilandi</span>' +
          '        <span class="eth-test-chip muted">⚪ ' + (totalQ - answeredCount) + ' ta kutilmoqda</span>' +
          '      </div>' +
          '      <span class="eth-test-palette-toggle-icon" id="paletteToggleArrow">' +
          (isPaletteCollapsed ? '🔽 Ro\'yxatni ochish' : '🔼 Yashirish') +
          '      </span>' +
          '    </div>' +
          '    <div class="eth-test-palette-grid' + (isPaletteCollapsed ? ' collapsed' : '') + '" id="testPaletteGrid">' +
          exam.questions.map(function(_, idx) {
            var isAns = state.answers[idx] !== undefined && state.answers[idx] !== '';
            var isCur = idx === state.i;
            var cls = 'eth-test-pbtn' + (isCur ? ' current' : '') + (isAns ? ' answered' : '');
            return '<button type="button" class="' + cls + '" data-goto="' + idx + '">' + (idx + 1) + '</button>';
          }).join('') +
          '    </div>' +
          '  </div>' +
          '  <!-- Main Question Card -->' +
          '  <div class="eth-test-card">' +
          '    <div class="eth-test-card-top">' +
          '      <div class="eth-test-pill-category">' + (qType === 'written' ? '✍️ Bo\'sh joy / Yozma' : (qType === 'bool' ? '☑️ True / False' : '🔘 Variantli')) + ' · SAVOL ' + (state.i + 1) + ' / ' + totalQ + '</div>' +
          '      <div class="eth-test-pill-points">⭐ ' + (q.points || exam.pointsPerQ || 1) + ' BALL</div>' +
          '    </div>' +
          '    <h2 class="eth-test-qtitle">' + esc(q.question) + '</h2>' +
          '    <div class="eth-test-options-list">';

        if (qType === 'written') {
          var currentW = state.answers[state.i] || '';
          html += '' +
            '<div style="margin:16px 0">' +
            '  <input type="text" id="examWrittenInput" class="eth-test-blank-input" value="' + esc(currentW) + '" placeholder="Javobingizni bu yerga yozing..." style="width:100%;padding:18px 20px;border:2px solid var(--test-item-border);border-radius:16px;font-size:17px;font-weight:600;background:var(--test-item-bg);color:var(--test-text);outline:none;box-sizing:border-box;transition:border-color 0.2s">' +
            '  <p style="font-size:13px;color:var(--test-text-muted);margin-top:8px">Javobni kiritganingizdan so\'ng pastdagi "Keyingi savol" tugmasini bosing yoki boshqa savolga o\'ting.</p>' +
            '</div>';
        } else if (qType === 'bool') {
          var selB = state.answers[state.i];
          html += '' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0">' +
            '  <button type="button" class="eth-test-opt' + (selB === 'True' ? ' selected' : '') + '" data-opt="True" style="justify-content:center;font-size:18px;font-weight:700">' +
            '    <span class="eth-test-opt-badge" style="background:#10b981;color:#fff">✓</span>' +
            '    <span>True</span>' +
            '    <span class="eth-test-opt-indicator"></span>' +
            '  </button>' +
            '  <button type="button" class="eth-test-opt' + (selB === 'False' ? ' selected' : '') + '" data-opt="False" style="justify-content:center;font-size:18px;font-weight:700">' +
            '    <span class="eth-test-opt-badge" style="background:#ef4444;color:#fff">✗</span>' +
            '    <span>False</span>' +
            '    <span class="eth-test-opt-indicator"></span>' +
            '  </button>' +
            '</div>';
        } else {
          var currentOpt = state.answers[state.i];
          q.options.forEach(function(opt, idx) {
            var letter = String.fromCharCode(65 + idx);
            var isSel = (currentOpt === opt || currentOpt === letter);
            html += '' +
              '<button type="button" class="eth-test-opt' + (isSel ? ' selected' : '') + '" data-opt="' + esc(opt) + '">' +
              '  <span class="eth-test-opt-badge">' + letter + '</span>' +
              '  <span class="eth-test-opt-text">' + esc(opt) + '</span>' +
              '  <span class="eth-test-opt-indicator"></span>' +
              '</button>';
          });
        }

        html += '' +
          '    </div>' +
          '  </div>' +
          '  <!-- Bottom Navigation Bar -->' +
          '  <footer class="eth-test-footer">' +
          '    <button type="button" class="eth-test-nav-btn prev" id="btnNavPrev"' + (state.i === 0 ? ' disabled style="opacity:0.35;cursor:not-allowed"' : '') + '>' +
          '      ⬅ <span>Oldingi savol</span>' +
          '    </button>' +
          '    <div class="eth-test-nav-center">Savol <b>' + (state.i + 1) + '</b> dan <b>' + totalQ + '</b></div>' +
          (state.i === totalQ - 1 ?
            '    <button type="button" class="eth-test-nav-btn finish" id="btnNavNext">🏁 <span>Testni yakunlash</span></button>' :
            '    <button type="button" class="eth-test-nav-btn next" id="btnNavNext"><span>Keyingi savol</span> ➡</button>'
          ) +
          '  </footer>' +
          '</main>';
      }

      var camBoxEl = document.getElementById('proctorCamBox');
      var audioBoxEl = document.getElementById('examPersistentAudioBar');

      // Preserve audio bar and webcam box while updating question view
      lockdownModal.innerHTML = html;
      if (audioBoxEl) lockdownModal.insertBefore(audioBoxEl, lockdownModal.querySelector('.eth-worksheet-wrapper') || lockdownModal.querySelector('.eth-test-main'));
      if (camBoxEl) lockdownModal.appendChild(camBoxEl);

      // View Original PDF Modal
      var btnViewPdf = document.getElementById('btnViewOriginalPdf');
      if (btnViewPdf && exam.pdfData) {
        btnViewPdf.onclick = function() {
          showOriginalPdfModal(exam);
        };
      }

      // Toggle Paper Mode
      var togglePaperBtn = document.getElementById('btnTogglePaperMode');
      if (togglePaperBtn) {
        togglePaperBtn.onclick = function() {
          saveCurrentWritten();
          isPaperMode = !isPaperMode;
          renderExamQuestion();
        };
      }

      // Authentic Paper Worksheet Mode Handlers
      if (isPaperMode) {
        var paperFinishBtn = document.getElementById('btnPaperFinishBottom');
        if (paperFinishBtn) {
          paperFinishBtn.onclick = function() {
            saveCurrentWritten();
            confirmFinish();
          };
        }

        // True / False Buttons directly on paper
        lockdownModal.querySelectorAll('.eth-paper-bool-btn').forEach(function(btn) {
          btn.onclick = function() {
            if (isExamLocked) return;
            var qIdx = parseInt(btn.dataset.paperQ, 10);
            var ans = btn.dataset.paperAns;
            state.answers[qIdx] = ans;
            var parent = btn.parentElement;
            if (parent) {
              parent.querySelectorAll('.eth-paper-bool-btn').forEach(function(b) { b.classList.remove('selected'); });
              btn.classList.add('selected');
            }
            updatePaperVisuals(qIdx);
          };
        });

        // Multiple Choice Items directly on paper
        lockdownModal.querySelectorAll('.eth-paper-choice-item').forEach(function(item) {
          item.onclick = function() {
            if (isExamLocked) return;
            var qIdx = parseInt(item.dataset.paperQ, 10);
            var ans = item.dataset.paperAns;
            state.answers[qIdx] = ans;
            var parent = item.parentElement;
            if (parent) {
              parent.querySelectorAll('.eth-paper-choice-item').forEach(function(b) { b.classList.remove('selected'); });
              item.classList.add('selected');
            }
            updatePaperVisuals(qIdx);
          };
        });

        // Gap Fill Inputs directly on paper
        lockdownModal.querySelectorAll('.eth-paper-gap-input').forEach(function(inp) {
          inp.oninput = function() {
            var qIdx = parseInt(inp.dataset.paperInputQ, 10);
            state.answers[qIdx] = inp.value.trim();
            updatePaperVisuals(qIdx);
          };
        });

        // Writing Textareas directly on paper with live word counter
        lockdownModal.querySelectorAll('.eth-paper-writing-area').forEach(function(tarea) {
          tarea.oninput = function() {
            var qIdx = parseInt(tarea.dataset.paperWritingQ, 10);
            var val = tarea.value;
            state.answers[qIdx] = val;
            var wWords = val.trim() ? val.trim().split(/\s+/).filter(Boolean).length : 0;
            var wcBadge = document.getElementById('wc_' + qIdx);
            if (wcBadge) wcBadge.textContent = wWords + ' so\'z yozildi';
            updatePaperVisuals(qIdx);
          };
        });

        // Make floating Quick Jump Navigator draggable & minimizable
        var qNavEl = document.getElementById('paperQuickNav');
        if (qNavEl) {
          makeElementDraggableAndCollapsible(qNavEl, qNavEl.querySelector('.eth-paper-nav-title'), qNavEl.querySelector('#btnMinQuickNav'));
        }

        // Quick Jump To Question
        lockdownModal.querySelectorAll('[data-jump-to]').forEach(function(btn) {
          btn.onclick = function() {
            var targetIdx = parseInt(btn.dataset.jumpTo, 10);
            var targetCard = document.getElementById('paperQ_' + targetIdx);
            if (targetCard) {
              targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
              targetCard.style.outline = '3px solid #2563eb';
              setTimeout(function() { targetCard.style.outline = 'none'; }, 1200);
            }
          };
        });

        function updatePaperVisuals(qIdx) {
          var card = document.getElementById('paperQ_' + qIdx);
          var isAnswered = (state.answers[qIdx] !== undefined && state.answers[qIdx] !== '');
          if (card) {
            if (isAnswered) card.classList.add('answered');
            else card.classList.remove('answered');
          }
          var navBtn = lockdownModal.querySelector('[data-jump-to="' + qIdx + '"]');
          if (navBtn) {
            if (isAnswered) navBtn.classList.add('answered');
            else navBtn.classList.remove('answered');
          }
          var ansCt = Object.keys(state.answers).filter(function(k){ return state.answers[k] !== undefined && state.answers[k] !== ''; }).length;
          var countNav = document.getElementById('paperNavAnsweredCount');
          if (countNav) countNav.textContent = ansCt;
          var countFoot = document.getElementById('paperFooterAnswered');
          if (countFoot) countFoot.textContent = ansCt;
          var pct = Math.round((ansCt / totalQ) * 100);
          var progText = lockdownModal.querySelector('.eth-test-progress-text b');
          if (progText) progText.textContent = ansCt + ' / ' + totalQ;
          var progBar = lockdownModal.querySelector('.eth-test-progress-bar i');
          if (progBar) progBar.style.width = pct + '%';
        }
      }

      // Toggle Palette
      var toggleBtn = document.getElementById('btnTogglePalette');
      if (toggleBtn) {
        toggleBtn.onclick = function() {
          isPaletteCollapsed = !isPaletteCollapsed;
          var grid = document.getElementById('testPaletteGrid');
          var arrow = document.getElementById('paletteToggleArrow');
          if (grid) {
            if (isPaletteCollapsed) {
              grid.classList.add('collapsed');
              if (arrow) arrow.textContent = '🔽 Ro\'yxatni ochish';
            } else {
              grid.classList.remove('collapsed');
              if (arrow) arrow.textContent = '🔼 Yashirish';
            }
          }
        };
      }

      // Event handlers: Palette buttons
      lockdownModal.querySelectorAll('.eth-test-pbtn').forEach(function(btn) {
        btn.onclick = function() {
          saveCurrentWritten();
          var target = parseInt(btn.dataset.goto, 10);
          if (!isNaN(target) && target >= 0 && target < totalQ) {
            state.i = target;
            renderExamQuestion();
          }
        };
      });

      // Previous button
      var prevBtn = document.getElementById('btnNavPrev');
      if (prevBtn) {
        prevBtn.onclick = function() {
          if (state.i > 0) {
            saveCurrentWritten();
            state.i--;
            renderExamQuestion();
          }
        };
      }

      // Next / Finish button
      var nextBtn = document.getElementById('btnNavNext');
      if (nextBtn) {
        nextBtn.onclick = function() {
          saveCurrentWritten();
          if (state.i === totalQ - 1) {
            confirmFinish();
          } else {
            state.i++;
            renderExamQuestion();
          }
        };
      }

      // Header finish button
      var hFinishBtn = document.getElementById('btnHeaderFinish');
      if (hFinishBtn) {
        hFinishBtn.onclick = function() {
          saveCurrentWritten();
          confirmFinish();
        };
      }

      // Real-time answer input
      if (qType === 'written') {
        var inp = document.getElementById('examWrittenInput');
        if (inp) {
          inp.oninput = function() {
            state.answers[state.i] = inp.value.trim();
            updatePaletteStatus(state.i, inp.value.trim().length > 0);
          };
        }
      } else {
        lockdownModal.querySelectorAll('.eth-test-opt').forEach(function(optBtn) {
          optBtn.onclick = function() {
            if (isExamLocked) return;
            var chosen = optBtn.dataset.opt;
            state.answers[state.i] = chosen;
            renderExamQuestion();
          };
        });
      }
    }

    function updatePaletteStatus(idx, isAnswered) {
      var pBtn = lockdownModal.querySelector('.eth-test-pbtn[data-goto="' + idx + '"]');
      if (pBtn) {
        if (isAnswered) pBtn.classList.add('answered');
        else pBtn.classList.remove('answered');
      }
    }

    function saveCurrentWritten() {
      var inp = document.getElementById('examWrittenInput');
      if (inp) {
        state.answers[state.i] = inp.value.trim();
      }
    }

    function confirmFinish() {
      var ansCount = Object.keys(state.answers).filter(function(k){ return state.answers[k] !== undefined && state.answers[k] !== ''; }).length;
      var totalQ = exam.questions.length;
      var msg = "Testni yakunlashga ishonchingiz komilmi?\n\nBelgilangan savollar: " + ansCount + " / " + totalQ + " ta.";
      if (ansCount < totalQ) {
        msg += "\nDiqqat: " + (totalQ - ansCount) + " ta savol javobsiz qoldi!";
      }
      if (confirm(msg)) {
        finishExam();
      }
    }

    // 10. Finish Exam & Detailed Results Breakdown (Async AI Evaluator Supported)
    async function finishExam() {
      if (isExamFinished) return;
      isExamFinished = true;

      // Check for Writing Tasks
      var hasWritingTasks = exam.questions.some(function(q) {
        return q.type === 'writing' || /write\s+(an?\s+)?(essay|letter|paragraph|story|summary|report|article)|writing\s+task/i.test(q.question || '');
      });

      if (hasWritingTasks && window.EthithAI && window.EthithAI.evaluateWritingSubmission) {
        var evalOverlay = document.createElement('div');
        evalOverlay.id = 'ethAiWritingEvalOverlay';
        evalOverlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.88);backdrop-filter:blur(8px);z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;padding:24px;text-align:center';
        evalOverlay.innerHTML = '' +
          '<div style="font-size:52px;margin-bottom:14px;animation:pulse 1s infinite">✍️</div>' +
          '<h3 style="margin:0 0 8px;font-size:23px;font-weight:900;color:#fff">ETHITH AI Writing Tekshiruvi</h3>' +
          '<p style="margin:0;color:#94a3b8;font-size:14.5px;max-width:440px">Insho va yozma topshiriqlaringiz xalqaro CEFR mezonlari (Task Response, Coherence, Vocabulary, Grammar) asosida tekshirilmoqda...</p>';
        lockdownModal.appendChild(evalOverlay);

        for (var wIdx = 0; wIdx < exam.questions.length; wIdx++) {
          var wQ = exam.questions[wIdx];
          var isW = (wQ.type === 'writing') || (/write\s+(an?\s+)?(essay|letter|paragraph|story|summary|report|article)|writing\s+task/i.test(wQ.question || ''));
          if (isW) {
            var studentWText = state.answers[wIdx] || '';
            var wPts = wQ.points || exam.pointsPerQ || 10;
            try {
              var evalRes = await window.EthithAI.evaluateWritingSubmission(wQ.question, studentWText, wPts);
              wQ._evalResult = evalRes;
            } catch(e) {
              wQ._evalResult = { score: Math.round(wPts * 0.7), feedback: "Yozma javob topshirildi.", criteria: {} };
            }
          }
        }
        evalOverlay.remove();
      }

      clearInterval(timerInterval);
      if (proctorInterval) clearInterval(proctorInterval);
      window.removeEventListener('blur', onWindowBlur);
      document.removeEventListener('visibilitychange', onVisChange);
      window.removeEventListener('keydown', onKeyDownProctor, true);
      window.removeEventListener('keyup', onKeyUpProctor, true);
      document.removeEventListener('keydown', onKeyDownProctor, true);
      document.removeEventListener('keyup', onKeyUpProctor, true);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
      document.removeEventListener('mozfullscreenchange', onFullscreenChange);
      document.removeEventListener('MSFullscreenChange', onFullscreenChange);
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('click', ensureFullscreen, true);
      window._ethithOnStudentUnblocked = null;
      if (navigator.keyboard && navigator.keyboard.unlock) {
        try { navigator.keyboard.unlock(); } catch(e) {}
      }

      if (examAudioObj) {
        try { examAudioObj.pause(); } catch(e) {}
      }

      if (proctorStream) {
        try {
          proctorStream.getTracks().forEach(function(track) { track.stop(); });
        } catch(e) {}
      }

      try {
        if (document.exitFullscreen) document.exitFullscreen().catch(function(){});
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      } catch(e) {}
      document.body.classList.remove('proctored-fullscreen-mode');

      var correctCount = 0;
      var incorrectCount = 0;
      var totalPossible = 0;
      var earnedScore = 0;

      var breakdown = exam.questions.map(function(q, idx) {
        var userAns = state.answers[idx];
        var isCorrect = false;
        var qPts = q.points || exam.pointsPerQ || 1;
        totalPossible += qPts;

        var writingEval = null;
        var isWritingQ = (q.type === 'writing') || (/write\s+(an?\s+)?(essay|letter|paragraph|story|summary|report|article)|writing\s+task/i.test(q.question || ''));

        if (isWritingQ) {
          var evalRes = q._evalResult;
          if (evalRes) {
            earnedScore += evalRes.score;
            isCorrect = (evalRes.score >= qPts * 0.5);
            writingEval = evalRes;
          } else {
            var words = (userAns || '').trim().split(/\s+/).filter(Boolean);
            var fallbackPts = Math.min(qPts, Math.round((words.length / 60) * qPts));
            earnedScore += fallbackPts;
            isCorrect = (fallbackPts >= qPts * 0.5);
            writingEval = {
              score: fallbackPts,
              wordCount: words.length,
              feedback: "Yozma topshiriq topshirildi (" + words.length + " so\'z).",
              criteria: { taskAchievement: Math.round(fallbackPts/4), coherence: Math.round(fallbackPts/4), lexical: Math.round(fallbackPts/4), grammar: Math.round(fallbackPts/4) }
            };
          }
          if (isCorrect) correctCount++; else incorrectCount++;
        } else if (userAns !== undefined && userAns !== '') {
          var uStr = String(userAns).trim().toLowerCase();
          var cStr = String(q.answer || '').trim().toLowerCase();

          if (uStr === cStr) {
            isCorrect = true;
          } else if (q.type === 'bool') {
            var uBool = (uStr === 'true' || uStr === 't');
            var cBool = (cStr === 'true' || cStr === 't');
            if (uBool === cBool && (uStr === 'true' || uStr === 't' || uStr === 'false' || uStr === 'f')) {
              isCorrect = true;
            }
          } else if (q.type === 'choice') {
            if (cStr.length === 1 && cStr >= 'a' && cStr <= 'd') {
              var optIdx = cStr.charCodeAt(0) - 97;
              if (q.options && q.options[optIdx] && q.options[optIdx].trim().toLowerCase() === uStr) {
                isCorrect = true;
              }
            }
          } else if (q.type === 'written') {
            var alts = cStr.split(/[\;\/]/).map(function(s){ return s.trim(); }).filter(Boolean);
            if (alts.indexOf(uStr) !== -1 || uStr === cStr) {
              isCorrect = true;
            }
          }

          if (isCorrect) {
            correctCount++;
            earnedScore += qPts;
          } else {
            incorrectCount++;
          }
        } else {
          incorrectCount++;
          userAns = 'Belgilanmagan';
        }

        return {
          qNum: idx + 1,
          question: q.question,
          userAns: userAns,
          correctAns: q.answer,
          isCorrect: isCorrect,
          points: qPts,
          writingEvaluation: writingEval
        };
      });

      var pct = totalPossible > 0 ? Math.round((earnedScore / totalPossible) * 100) : 0;
      var timeSpentMin = Math.max(1, Math.round((exam.duration * 60 - Math.max(0, timeLeftSeconds)) / 60));

      if (!exam.submissions) exam.submissions = [];
      var userKey = (S.user && (S.user.email || S.user.id || '')).toLowerCase();
      var existing = exam.submissions.find(function(s) {
        return (s.studentEmail && s.studentEmail.toLowerCase() === userKey) ||
               (s.studentId && s.studentId.toLowerCase() === userKey);
      });

      var currentAttemptNum = existing ? ((existing.attempts || 1) + 1) : 1;
      var attemptRecord = {
        attemptNum: currentAttemptNum,
        score: earnedScore,
        totalPossible: totalPossible,
        percent: pct,
        correctCount: correctCount,
        incorrectCount: incorrectCount,
        timeSpent: timeSpentMin + ' daqiqa',
        date: new Date().toLocaleString(),
        breakdown: breakdown,
        blockedCount: sessionInfractions.length,
        infractions: sessionInfractions
      };

      if (existing) {
        existing.attempts = currentAttemptNum;
        existing.score = earnedScore;
        existing.totalPossible = totalPossible;
        existing.percent = pct;
        existing.correctCount = correctCount;
        existing.incorrectCount = incorrectCount;
        existing.breakdown = breakdown;
        existing.timeSpent = timeSpentMin + ' daqiqa';
        existing.date = new Date().toLocaleString();
        existing.blockedCount = (existing.blockedCount || 0) + sessionInfractions.length;
        if (!existing.infractions) existing.infractions = [];
        existing.infractions = existing.infractions.concat(sessionInfractions);
        if (!existing.attemptsHistory) existing.attemptsHistory = [];
        existing.attemptsHistory.push(attemptRecord);
      } else {
        var sub = {
          studentId: (S.user && S.user.email) || (S.user && S.user.id) || 'guest',
          studentName: (S.user && S.user.name) || 'O\'quvchi',
          studentEmail: (S.user && S.user.email) || '',
          score: earnedScore,
          totalPossible: totalPossible,
          percent: pct,
          correctCount: correctCount,
          incorrectCount: incorrectCount,
          attempts: 1,
          breakdown: breakdown,
          timeSpent: timeSpentMin + ' daqiqa',
          date: new Date().toLocaleString(),
          blockedCount: sessionInfractions.length,
          infractions: sessionInfractions,
          attemptsHistory: [attemptRecord]
        };
        exam.submissions.push(sub);
      }

      var storeExam = (S.exams || []).find(function(x) {
        return (x.id && exam.id && String(x.id) === String(exam.id)) ||
               (x.code && exam.code && String(x.code).trim() === String(exam.code).trim());
      });
      if (storeExam) {
        storeExam.submissions = exam.submissions;
      } else {
        S.exams.push(exam);
      }

      App.saveState();
      var finalSubmission = existing || sub;

      if (window._ethithOnExamSubmission) {
        try {
          window._ethithOnExamSubmission({
            examId: exam.id,
            examCode: exam.code,
            submission: finalSubmission
          });
        } catch(e) {}
      }

      if (window.EthithSync) {
        window.EthithSync.publishLive({
          type: 'EXAM_SUBMISSION',
          examId: exam.id,
          examCode: exam.code,
          submission: finalSubmission
        });
        window.EthithSync.broadcastLocal(S.classes, S.exams);
        window.EthithSync.pushRemoteStore();
      }

      // Render Comprehensive Luxury Results Screen
      var resHtml = '' +
        '<header class="eth-test-topbar">' +
        '  <div class="eth-test-topbar-left">' +
        '    <div class="eth-test-badge">' +
        '      <span class="eth-test-badge-dot"></span>' +
        '      <span>Imtihon Natijalari</span>' +
        '    </div>' +
        '    <span class="eth-test-qcount">' + esc(exam.title) + '</span>' +
        '  </div>' +
        '  <button type="button" class="eth-test-nav-btn next" id="btnCloseExamModal" style="padding:8px 20px;font-size:13.5px">Yopish va Chiqish ✕</button>' +
        '</header>' +
        '<main class="eth-test-main" style="max-width:850px">' +
        '  <div class="eth-test-card" style="text-align:center;padding:40px 32px">' +
        '    <div style="font-size:60px;margin-bottom:12px">' + (pct >= 60 ? '🎉' : '📊') + '</div>' +
        '    <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:var(--test-text)">Imtihon Muvaffaqiyatli Yakunlandi!</h1>' +
        '    <p style="color:var(--test-text-muted);font-size:15px;margin:0 0 28px">' + esc(exam.title) + (exam.code ? ' · Maxsus Kod: ' + exam.code : '') + '</p>' +
        '    <div style="display:inline-block;padding:20px 48px;border-radius:22px;background:rgba(37,99,235,0.12);border:2.5px solid #3b82f6;margin-bottom:28px;box-shadow:0 10px 30px var(--test-accent-glow)">' +
        '      <span style="font-size:12.5px;text-transform:uppercase;letter-spacing:1px;font-weight:800;color:#60a5fa;display:block">Umumiy Natija</span>' +
        '      <span style="font-size:56px;font-weight:900;color:#3b82f6">' + pct + '%</span>' +
        '    </div>' +
        '    <div class="eth-res-metrics">' +
        '      <div class="eth-res-card" style="border-top:4px solid #10b981">' +
        '        <span style="font-size:12px;color:var(--test-text-muted);font-weight:700">TO\'G\'RI JAVOBLAR</span>' +
        '        <b style="color:#10b981">✅ ' + correctCount + ' ta</b>' +
        '      </div>' +
        '      <div class="eth-res-card" style="border-top:4px solid #ef4444">' +
        '        <span style="font-size:12px;color:var(--test-text-muted);font-weight:700">XATO / BELGILANMAGAN</span>' +
        '        <b style="color:#ef4444">❌ ' + incorrectCount + ' ta</b>' +
        '      </div>' +
        '      <div class="eth-res-card" style="border-top:4px solid #3b82f6">' +
        '        <span style="font-size:12px;color:var(--test-text-muted);font-weight:700">TO\'PLANGAN BALL</span>' +
        '        <b style="color:#3b82f6">⭐ ' + earnedScore + ' / ' + totalPossible + '</b>' +
        '      </div>' +
        '      <div class="eth-res-card" style="border-top:4px solid #8b5cf6">' +
        '        <span style="font-size:12px;color:var(--test-text-muted);font-weight:700">SARFLANGAN VAQT</span>' +
        '        <b style="color:#8b5cf6">⏱ ' + timeSpentMin + ' daqiqa</b>' +
        '      </div>' +
        '    </div>' +
        '    <div style="display:flex;justify-content:center;gap:14px;margin-top:28px;flex-wrap:wrap">' +
        '      <button type="button" class="eth-test-nav-btn next" id="btnIeltsFullReview" style="background:linear-gradient(135deg, #f59e0b, #ea580c);color:#fff;font-weight:800;padding:14px 28px;font-size:15px;box-shadow:0 4px 15px rgba(245,158,11,0.4)">🔍 Testni Tahlil Qilish (Full Review & Script Analysis)</button>' +
        '      <button type="button" class="eth-test-nav-btn next" id="btnResLeaderboard" style="padding:14px 28px;font-size:15px">' + ic('trophy') + ' Natijalar Jadvali (Leaderboard)</button>' +
        '      <button type="button" class="eth-test-nav-btn prev" id="btnResExit" style="padding:14px 28px;font-size:15px">Bosh Sahifaga Qaytish</button>' +
        '    </div>' +
        '  </div>' +
        '  <!-- Detailed Question Breakdown -->' +
        '  <h3 style="font-size:20px;font-weight:800;color:var(--test-text);margin:32px 0 16px;display:flex;align-items:center;gap:10px">' +
        '    📋 Savollar Tahlili va To\'liq Ko\'rib Chiqish (' + exam.questions.length + ' ta savol):' +
        '  </h3>' +
        '  <div class="eth-review-list">' +
        breakdown.map(function(item) {
          return '<div class="eth-review-item ' + (item.isCorrect ? 'correct' : 'incorrect') + '">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
            '  <b style="font-size:15px;color:var(--test-text)">Savol ' + item.qNum + '</b>' +
            '  <span style="font-size:13.5px;font-weight:800;color:' + (item.isCorrect ? '#10b981' : '#ef4444') + '">' +
            (item.isCorrect ? '✅ To\'g\'ri (+ ' + item.points + ' ball)' : '❌ Xato (0 ball)') +
            '  </span>' +
            '</div>' +
            '<p style="margin:0 0 12px;font-size:15.5px;color:var(--test-text);line-height:1.48">' + esc(item.question) + '</p>' +
            '<div style="font-size:14px;background:var(--test-palette-bg);padding:12px 16px;border-radius:12px;border:1px solid var(--test-item-border)">' +
            '  <div>Sizning javobingiz: <b style="color:' + (item.isCorrect ? '#10b981' : '#ef4444') + '">' + esc(item.userAns) + '</b></div>' +
            (!item.isCorrect ? '<div style="margin-top:6px">To\'g\'ri javob: <b style="color:#10b981">' + esc(item.correctAns) + '</b></div>' : '') +
            '</div>' +
            '</div>';
        }).join('') +
        '  </div>' +
        '</main>';

      lockdownModal.innerHTML = resHtml;

      function exitLockdown() {
        window._ethithIsTestInProgress = false;
        window._ethithActiveRunningExam = null;
        window._ethithOnActiveExamUpdated = null;
        if (lockdownModal) lockdownModal.remove();
        renderExamsView(mainContainer);
      }

      var reviewBtn = document.getElementById('btnIeltsFullReview');
      if (reviewBtn) {
        reviewBtn.onclick = function() {
          showIeltsFullReviewModal(exam, breakdown, earnedScore, totalPossible);
        };
      }

      var closeBtn = document.getElementById('btnCloseExamModal');
      if (closeBtn) closeBtn.onclick = exitLockdown;
      var exitBtn = document.getElementById('btnResExit');
      if (exitBtn) exitBtn.onclick = exitLockdown;
      var lbBtn = document.getElementById('btnResLeaderboard');
      if (lbBtn) {
        lbBtn.onclick = function() {
          if (lockdownModal) lockdownModal.remove();
          showExamLeaderboardModal(exam);
          renderExamsView(mainContainer);
        };
      }
    }

    renderExamQuestion();
  }
}

  function getStudentInfractionStats(submission, exam) {
    var sEmail = (submission.studentEmail || '').toLowerCase().trim();
    var sId = (submission.studentId || '').toLowerCase().trim();
    var sName = (submission.studentName || '').toLowerCase().trim();

    // 1. Notifications matching from S.notifications
    var allTimeNotifs = (S.notifications || []).filter(function(n) {
      var nEmail = (n.studentEmail || '').toLowerCase().trim();
      var nId = (n.studentId || '').toLowerCase().trim();
      var nName = (n.studentName || '').toLowerCase().trim();
      return (sEmail && nEmail === sEmail) ||
             (sId && nId === sId) ||
             (sName && nName === sName);
    });

    var examCode = (exam && (exam.code || exam.id)) ? String(exam.code || exam.id).trim().toLowerCase() : '';
    var examNotifs = allTimeNotifs.filter(function(n) {
      if (!examCode) return true;
      var nCode = (n.examCode || n.examId) ? String(n.examCode || n.examId).trim().toLowerCase() : '';
      return !nCode || nCode === examCode;
    });

    // 2. Direct blockedCount on submission or attemptsHistory
    var directBlocks = (submission.blockedCount || 0);
    if (Array.isArray(submission.attemptsHistory)) {
      var attSum = 0;
      submission.attemptsHistory.forEach(function(att) {
        attSum += (att.blockedCount || 0);
      });
      directBlocks = Math.max(directBlocks, attSum);
    }

    var examCount = Math.max(examNotifs.length, directBlocks);
    var totalCount = Math.max(allTimeNotifs.length, examCount);

    return {
      examBlocks: examCount,
      totalBlocks: totalCount,
      examNotifs: examNotifs,
      allTimeNotifs: allTimeNotifs
    };
  }

  function showExamLeaderboardModal(exam) {
    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';

    var freshExam = (S.exams || []).find(function(x) {
      return (exam.id && x.id === exam.id) || (exam.code && x.code === exam.code);
    }) || exam;
    exam = freshExam;

    var maxAtt = exam.maxAttempts || 1;

    function renderModalBody() {
      // Deduplicated list sorted by highest score and speed
      var subs = (exam.submissions || []).slice().sort(function(a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return parseInt(a.timeSpent, 10) - parseInt(b.timeSpent, 10);
      });

      overlay.innerHTML = '' +
        '<div class="eth-modal" style="max-width:880px">' +
        '  <button type="button" class="eth-modal-close-btn" id="btnTopCloseLeaderboard" title="Yopish">✕</button>' +
        '  <div class="eth-modal-header">' +
        '    <h2>' + ic('trophy') + ' ' + esc(exam.title) + ' · Natijalar Jadvali (Leaderboard)</h2>' +
        '    <p>Jami topshirganlar: <b>' + subs.length + ' ta o\'quvchi</b> · Qayta yechishlar va chuqur tahlil</p>' +
        '  </div>' +
        '  <div class="eth-modal-body" style="max-height:65vh;overflow-y:auto">' +
        (subs.length === 0 ?
          '<div style="text-align:center;padding:36px 0">' +
          '  <div style="font-size:44px;margin-bottom:10px">📊</div>' +
          '  <p style="color:var(--muted);font-size:15px;margin:0 0 14px">Bu imtihonni hali hech bir o\'quvchi topshirmagan.</p>' +
          '  <span style="font-size:12px;background:rgba(37,99,235,0.08);color:#2563eb;padding:5px 12px;border-radius:999px;font-weight:700">Imtihon kodi: ' + (exam.code || exam.id) + '</span>' +
          '</div>' :
          '<table class="eth-leaderboard-table">' +
          '  <thead><tr><th>O\'rin</th><th>O\'quvchi</th><th>Natija</th><th>Urinishlar</th><th>Vaqt</th><th>Harakat</th><th>Bloklanishlar</th></tr></thead>' +
          '  <tbody>' +
          subs.map(function(s, idx) {
            var rankCls = (idx === 0 ? 'eth-rank-1' : (idx === 1 ? 'eth-rank-2' : (idx === 2 ? 'eth-rank-3' : '')));
            var stats = getStudentInfractionStats(s, exam);
            return '<tr>' +
              '  <td><span class="eth-rank-badge ' + rankCls + '">' + (idx + 1) + '</span></td>' +
              '  <td><b>' + esc(s.studentName) + '</b><div style="font-size:11px;color:var(--muted)">' + esc(s.studentEmail || '') + '</div></td>' +
              '  <td><b style="color:#2563eb">' + s.score + ' / ' + s.totalPossible + ' (' + s.percent + '%)</b></td>' +
              '  <td><span style="font-size:12px;background:rgba(37,99,235,0.08);color:#2563eb;padding:3px 8px;border-radius:6px;font-weight:700">' + (s.attempts || 1) + ' / ' + maxAtt + '</span></td>' +
              '  <td>' + esc(s.timeSpent) + '</td>' +
              '  <td><button type="button" class="ap-btn solid" data-view-analysis="' + idx + '" style="padding:6px 12px;font-size:12px;font-weight:700">🔍 Tahlil (Xatolar)</button></td>' +
              '  <td>' +
              (stats.totalBlocks > 0 ?
                '<div style="display:flex;flex-direction:column;gap:3px">' +
                '  <span class="eth-lb-block-pill danger" title="Umumiy jami ' + stats.totalBlocks + ' marta bloklangan">' +
                '    🚨 <b>' + stats.totalBlocks + ' marta</b> bloklangan' +
                '  </span>' +
                (stats.totalBlocks !== stats.examBlocks ?
                  '  <span style="font-size:11px;color:var(--muted);font-weight:700">(Bu testda: ' + stats.examBlocks + ' marta)</span>' : ''
                ) +
                '</div>' :
                '<span class="eth-lb-block-pill clean" title="Hech qanday qoidabuzarlik yo\'q">' +
                '  🛡️ <b>0 marta</b> (Toza)' +
                '</span>'
              ) +
              '  </td>' +
              '</tr>';
          }).join('') +
          '  </tbody>' +
          '</table>'
        ) +
        '    <div style="display:flex;justify-content:flex-end;margin-top:20px">' +
        '      <button class="eth-btn-primary" id="lbCloseBtn" style="padding:8px 24px">Yopish</button>' +
        '    </div>' +
        '  </div>' +
        '</div>';

      var topClose = overlay.querySelector('#btnTopCloseLeaderboard');
      if (topClose) topClose.onclick = function() { cleanup(); overlay.remove(); };
      var botClose = overlay.querySelector('#lbCloseBtn');
      if (botClose) botClose.onclick = function() { cleanup(); overlay.remove(); };

      overlay.querySelectorAll('[data-view-analysis]').forEach(function(btn) {
        btn.onclick = function() {
          var subIdx = parseInt(btn.dataset.viewAnalysis, 10);
          var targetSub = subs[subIdx];
          if (targetSub) {
            showStudentExamAnalysisModal(exam, targetSub);
          }
        };
      });
    }

    renderModalBody();
    document.body.appendChild(overlay);

    function cleanup() {
      window.removeEventListener('keydown', onEsc);
      window._ethithOnExamSubmission = null;
    }

    overlay.onclick = function(e) { if (e.target === overlay) { cleanup(); overlay.remove(); } };

    var onEsc = function(e) {
      if (e.key === 'Escape') {
        cleanup();
        overlay.remove();
      }
    };
    window.addEventListener('keydown', onEsc);

    // Live sync hook: updates leaderboard modal in real-time if a student submits
    window._ethithOnExamSubmission = function(ev) {
      if ((ev.examId && ev.examId === exam.id) || (ev.examCode && ev.examCode === exam.code)) {
        var updatedEx = (S.exams || []).find(function(x) { return x.id === exam.id || x.code === exam.code; });
        if (updatedEx) {
          exam = updatedEx;
          renderModalBody();
        }
      }
    };

    // Background fetch fallback
    if (window.EthithSync && window.EthithSync.fetchRemoteStore) {
      window.EthithSync.fetchRemoteStore().then(function(remote) {
        if (remote && remote.exams) {
          var rx = remote.exams.find(function(x) { return x.id === exam.id || x.code === exam.code; });
          if (rx && Array.isArray(rx.submissions) && rx.submissions.length > 0) {
            if (!exam.submissions) exam.submissions = [];
            var changed = false;
            rx.submissions.forEach(function(rSub) {
              var rKey = (rSub.studentEmail || rSub.studentId || '').toLowerCase();
              var exists = exam.submissions.find(function(lSub) {
                return (lSub.studentEmail && lSub.studentEmail.toLowerCase() === rKey) ||
                       (lSub.studentId && lSub.studentId.toLowerCase() === rKey);
              });
              if (!exists) {
                exam.submissions.push(rSub);
                changed = true;
              }
            });
            if (changed) {
              App.saveState();
              renderModalBody();
            }
          }
        }
      }).catch(function(){});
    }
  }

  function showStudentExamAnalysisModal(exam, submission) {
    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';
    overlay.style.zIndex = '2147483647';

    var maxAtt = exam.maxAttempts || 1;
    var history = submission.attemptsHistory || [];
    if (history.length === 0 && submission.breakdown) {
      history = [{
        attemptNum: submission.attempts || 1,
        score: submission.score,
        totalPossible: submission.totalPossible,
        percent: submission.percent,
        correctCount: submission.correctCount,
        incorrectCount: submission.incorrectCount,
        timeSpent: submission.timeSpent,
        date: submission.date,
        breakdown: submission.breakdown
      }];
    }

    // Repeated Mistake Hotspot Analysis across attempts
    var mistakeCounts = {};
    history.forEach(function(att) {
      (att.breakdown || []).forEach(function(item) {
        if (!item.isCorrect) {
          var key = item.qNum;
          if (!mistakeCounts[key]) {
            mistakeCounts[key] = {
              qNum: item.qNum,
              question: item.question,
              failCount: 0,
              userAnswers: [],
              correctAns: item.correctAns,
              points: item.points || exam.pointsPerQ || 1
            };
          }
          mistakeCounts[key].failCount++;
          if (mistakeCounts[key].userAnswers.indexOf(item.userAns) === -1 && item.userAns) {
            mistakeCounts[key].userAnswers.push(item.userAns);
          }
        }
      });
    });

    var hotspots = Object.values(mistakeCounts).sort(function(a, b) {
      return b.failCount - a.failCount;
    });

    var latestBreakdown = submission.breakdown || (history.length > 0 ? history[history.length - 1].breakdown : []) || [];
    var stats = getStudentInfractionStats(submission, exam);

    var html = '' +
      '<div class="eth-modal eth-analysis-modal" style="max-width:820px;max-height:92vh;display:flex;flex-direction:column">' +
      '  <button type="button" class="eth-modal-close-btn" id="btnTopCloseStudentAnalysis" title="Yopish">✕</button>' +
      '  <div class="eth-modal-header">' +
      '    <h2>📊 O\'quvchi Natijalari va Xatolar Tahlili</h2>' +
      '    <p><b>' + esc(submission.studentName) + '</b> (' + esc(submission.studentEmail || 'Email kiritilmagan') + ') · ' + esc(exam.title) + '</p>' +
      '  </div>' +
      '  <div class="eth-modal-body" style="overflow-y:auto;flex:1;padding:20px 24px">' +
      '    <!-- Student Performance Cards -->' +
      '    <div class="eth-analysis-header-card">' +
      '      <div class="eth-analysis-stat">' +
      '        <span>Umumiy Natija</span>' +
      '        <b style="color:#2563eb">' + submission.score + ' / ' + submission.totalPossible + ' (' + submission.percent + '%)</b>' +
      '      </div>' +
      '      <div class="eth-analysis-stat">' +
      '        <span>To\'g\'ri / Xato</span>' +
      '        <b><span style="color:#10b981">✅ ' + (submission.correctCount || 0) + '</span> / <span style="color:#ef4444">❌ ' + (submission.incorrectCount || 0) + '</span></b>' +
      '      </div>' +
      '      <div class="eth-analysis-stat">' +
      '        <span>Qayta Yechishlar Soni</span>' +
      '        <b style="color:#8b5cf6">🔄 ' + (submission.attempts || 1) + ' marta (Maks: ' + maxAtt + ')</b>' +
      '      </div>' +
      '      <div class="eth-analysis-stat">' +
      '        <span>Sarflangan Vaqt</span>' +
      '        <b>⏱ ' + esc(submission.timeSpent || '—') + '</b>' +
      '      </div>' +
      '      <div class="eth-analysis-stat">' +
      '        <span>Bloklanishlar (Kamera)</span>' +
      (stats.totalBlocks > 0 ?
        '        <b style="color:#dc2626">🚨 ' + stats.totalBlocks + ' marta bloklangan</b>' +
        (stats.totalBlocks !== stats.examBlocks ? '<div style="font-size:11px;color:#ef4444;font-weight:700;margin-top:2px;">(Bu testda: ' + stats.examBlocks + ' marta)</div>' : '') :
        '        <b style="color:#10b981">🛡️ 0 marta (Toza)</b>'
      ) +
      '      </div>' +
      '    </div>' +
      '    <!-- Proctoring Infractions History Card -->' +
      '    <div style="margin:16px 0 20px;background:' + (stats.totalBlocks > 0 ? 'rgba(239, 68, 68, 0.06)' : 'rgba(16, 185, 129, 0.06)') + ';border:1.5px solid ' + (stats.totalBlocks > 0 ? '#ef4444' : '#10b981') + ';border-radius:14px;padding:16px 20px">' +
      '      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px">' +
      '        <h3 style="margin:0;font-size:16px;font-weight:800;color:' + (stats.totalBlocks > 0 ? '#dc2626' : '#10b981') + ';display:flex;align-items:center;gap:8px">' +
      (stats.totalBlocks > 0 ? '🚨 Kamera va Proctoring Nazorati (Bloklanishlar Tarixi):' : '🛡️ Kamera va Proctoring Nazorati (Intizom Tahlili):') +
      '        </h3>' +
      '        <span style="font-size:12.5px;font-weight:800;padding:4px 12px;border-radius:999px;background:' + (stats.totalBlocks > 0 ? '#dc2626' : '#10b981') + ';color:#fff">' +
      (stats.totalBlocks > 0 ? 'Umumiy jami: ' + stats.totalBlocks + ' marta bloklangan' : 'Toza (0 marta bloklangan)') +
      '        </span>' +
      '      </div>' +
      '      <p style="margin:0 0 10px;font-size:13.5px;color:var(--text);line-height:1.45">' +
      (stats.totalBlocks > 0 ?
        'Ushbu o\'quvchi imtihon davomida jami <b>' + stats.totalBlocks + ' marta</b> test qoidalarini buzgani aniqlangan va kamera nazorati tomonidan bloklangan.' +
        (stats.totalBlocks !== stats.examBlocks ? ' <i>(Ushbu imtihonning o\'zida: <b>' + stats.examBlocks + ' marta</b>)</i>' : '') :
        'O\'quvchi test davomida biror marta ham qoidabuzarlik qilmagan, intizomni namunali darajada saqlagan.'
      ) +
      '      </p>' +
      (stats.allTimeNotifs && stats.allTimeNotifs.length > 0 ?
        '      <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">' +
        stats.allTimeNotifs.map(function(n, ni) {
          var nTime = new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          return '<div style="background:var(--bg2, #f8fafc);border:1px solid rgba(239,68,68,0.25);border-radius:10px;padding:10px 14px;font-size:13px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">' +
            '  <div>' +
            '    <b style="color:#dc2626">🚨 #' + (ni + 1) + ' Qoidabuzarlik:</b> ' + esc(n.reason) +
            (n.examTitle ? '<div style="font-size:11px;color:var(--muted);margin-top:2px">Imtihon: ' + esc(n.examTitle) + ' (' + esc(n.examCode || '') + ')</div>' : '') +
            '  </div>' +
            '  <div style="display:flex;align-items:center;gap:8px">' +
            (n.snapshot ? '<img src="' + n.snapshot + '" style="height:38px;width:52px;object-fit:cover;border-radius:6px;border:1.5px solid #ef4444;cursor:pointer" title="Suratni kattalashtirib ko\'rish" onclick="window.open(this.src)">' : '') +
            '    <span style="font-size:11.5px;color:var(--muted);font-weight:600">⏱ ' + nTime + '</span>' +
            '  </div>' +
            '</div>';
        }).join('') +
        '      </div>' : ''
      ) +
      '    </div>' +
      '    <!-- Repeated Mistake Hotspots -->' +
      '    <div style="margin:22px 0 16px">' +
      '      <h3 style="font-size:16px;font-weight:800;color:var(--text);margin-bottom:10px;display:flex;align-items:center;gap:8px">' +
      '        🚨 Qayta-qayta xato qilingan savollar (' + hotspots.length + ' ta zaif nuqta):' +
      '      </h3>' +
      (hotspots.length === 0 ?
        '<div style="padding:14px 18px;background:rgba(16,185,129,0.08);border:1px solid #10b981;border-radius:12px;font-size:13.5px;color:#10b981;font-weight:600">' +
        '  🎉 Tabriklaymiz! O\'quvchi bu imtihonda qayta-qayta xato qilmagan. Mavzularni a\'lo darajada o\'zlashtirgan.' +
        '</div>' :
        '<div style="display:flex;flex-direction:column;gap:10px">' +
        hotspots.map(function(m) {
          return '<div class="eth-analysis-mistake-card">' +
            '  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
            '    <b style="font-size:14px;color:#dc2626">⚠️ Savol #' + m.qNum + ' · ' + m.failCount + ' marta xato qilingan</b>' +
            '    <span style="font-size:12px;background:rgba(239,68,68,0.12);color:#ef4444;padding:2px 8px;border-radius:6px;font-weight:700">-' + m.points + ' ball</span>' +
            '  </div>' +
            '  <p style="font-size:13.5px;margin:0 0 8px;color:var(--text);line-height:1.4">' + esc(m.question) + '</p>' +
            '  <div style="font-size:12.5px;display:flex;gap:16px;flex-wrap:wrap">' +
            '    <div>O\'quvchi javoblari: <b style="color:#ef4444">' + esc(m.userAnswers.join(', ') || 'Belgilanmagan') + '</b></div>' +
            '    <div>To\'g\'ri javob: <b style="color:#10b981">' + esc(m.correctAns) + '</b></div>' +
            '  </div>' +
            '</div>';
        }).join('') +
        '</div>'
      ) +
      '    </div>' +
      '    <!-- Question-by-Question Breakdown of Latest Attempt -->' +
      '    <div style="margin:24px 0 16px">' +
      '      <h3 style="font-size:16px;font-weight:800;color:var(--text);margin-bottom:10px">' +
      '        📋 Savollar Tahlili va O\'quvchi Javoblari (Oxirgi Urinish):' +
      '      </h3>' +
      (latestBreakdown.length === 0 ?
        '<p style="color:var(--muted);font-size:13px">Savollar tahlili mavjud emas.</p>' :
        '<div style="display:flex;flex-direction:column;gap:8px">' +
        latestBreakdown.map(function(b) {
          return '<div class="eth-analysis-qitem ' + (b.isCorrect ? 'correct' : 'incorrect') + '">' +
            '  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">' +
            '    <b>Savol #' + b.qNum + '</b>' +
            '    <span style="font-weight:800;font-size:12.5px;color:' + (b.isCorrect ? '#10b981' : '#ef4444') + '">' +
            (b.isCorrect ? '✅ To\'g\'ri (+' + (b.points || exam.pointsPerQ || 1) + ' ball)' : '❌ Xato (0 ball)') +
            '    </span>' +
            '  </div>' +
            '  <div style="font-size:13.5px;margin-bottom:6px;color:var(--text)">' + esc(b.question) + '</div>' +
            '  <div style="font-size:12.5px;display:flex;gap:14px;flex-wrap:wrap">' +
            '    <span>O\'quvchi javobi: <b style="color:' + (b.isCorrect ? '#10b981' : '#ef4444') + '">' + esc(b.userAns) + '</b></span>' +
            (!b.isCorrect ? '<span>To\'g\'ri javob: <b style="color:#10b981">' + esc(b.correctAns) + '</b></span>' : '') +
            '  </div>' +
            '</div>';
        }).join('') +
        '</div>'
      ) +
      '    </div>' +
      (history.length > 1 ?
        '    <!-- Attempts History Log -->' +
        '    <div style="margin:24px 0 10px">' +
        '      <h3 style="font-size:16px;font-weight:800;color:var(--text);margin-bottom:10px">📜 Urinishlar Tarixi Logi:</h3>' +
        '      <table class="eth-leaderboard-table" style="font-size:12.5px">' +
        '        <thead><tr><th>Urinish #</th><th>Sana & Vaqt</th><th>To\'plangan Ball</th><th>Foiz</th><th>Sarflangan Vaqt</th></tr></thead>' +
        '        <tbody>' +
        history.map(function(att) {
          return '<tr>' +
            '  <td><b>#' + att.attemptNum + '</b></td>' +
            '  <td>' + esc(att.date || '—') + '</td>' +
            '  <td><b style="color:#2563eb">' + att.score + ' / ' + att.totalPossible + '</b></td>' +
            '  <td>' + att.percent + '%</td>' +
            '  <td>' + esc(att.timeSpent || '—') + '</td>' +
            '</tr>';
        }).join('') +
        '        </tbody>' +
        '      </table>' +
        '    </div>' : ''
      ) +
      '  </div>' +
      '  <div style="padding:14px 24px;border-top:1px solid var(--border);text-align:right">' +
      '    <button type="button" class="eth-btn-primary" id="btnCloseStudentAnalysis" style="padding:9px 24px;font-size:14px">Yopish</button>' +
      '  </div>' +
      '</div>';

    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
    var topClose = overlay.querySelector('#btnTopCloseStudentAnalysis');
    if (topClose) topClose.onclick = function() { overlay.remove(); };
    var bottomClose = overlay.querySelector('#btnCloseStudentAnalysis');
    if (bottomClose) bottomClose.onclick = function() { overlay.remove(); };

    var onEsc = function(e) {
      if (e.key === 'Escape') {
        overlay.remove();
        window.removeEventListener('keydown', onEsc);
      }
    };
    window.addEventListener('keydown', onEsc);
  }

  function showTeacherNotificationsModal() {
    var existing = document.getElementById('teacherNotifsOverlay');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';
    overlay.id = 'teacherNotifsOverlay';

    window._ethithRefreshNotifsModal = function() {
      if (document.getElementById('teacherNotifsOverlay')) {
        renderNotifsContent();
      }
    };

    function renderNotifsContent() {
      var notifs = S.notifications || [];

      var html = '' +
        '<div class="eth-modal" style="max-width:620px">' +
        '  <button type="button" class="eth-modal-close-btn" id="btnTopCloseNotifs" title="Yopish">✕</button>' +
        '  <div class="eth-modal-header">' +
        '    <h2>' + ic('bell') + ' Security & Proctoring Alerts</h2>' +
        '    <p>Real-time camera and anti-cheat infractions reported during exams.</p>' +
        '  </div>' +
        '  <div class="eth-modal-body" style="max-height:480px;overflow-y:auto">' +
        (notifs.length === 0 ?
          '  <div class="ap-card ap-empty" style="padding:28px 16px">' +
          '    ' + ic('check') +
          '    <h3>All Clear!</h3>' +
          '    <p>No proctoring violations or blocked students at this time.</p>' +
          '  </div>' :
          '  <div style="display:flex;flex-direction:column;gap:12px">' +
          notifs.map(function(n) {
            var timeStr = new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            return '' +
              '<div class="ap-card" style="border:1.5px solid ' + (n.resolved ? 'var(--border)' : '#ef4444') + ';padding:14px;background:' + (n.resolved ? 'var(--bg2)' : 'rgba(239, 68, 68, 0.04)') + '">' +
              '  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid rgba(0,0,0,0.06)">' +
              '    <div>' +
              '      <span style="font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;display:block;">👤 O\'quvchi:</span>' +
              '      <span style="font-size:18px;font-weight:900;color:' + (n.resolved ? 'var(--text)' : '#dc2626') + ';letter-spacing:0.5px;text-transform:uppercase;">' + (n.resolved ? '✓ ' : '🚨 ') + esc(n.studentName) + '</span>' +
              '    </div>' +
              '    <span style="font-size:12px;color:var(--muted);font-weight:600">' + timeStr + '</span>' +
              '  </div>' +
              '  <div style="font-size:13px;color:var(--text);margin-bottom:6px">' +
              '    <b>Imtihon:</b> ' + esc(n.examTitle) + ' (Code: ' + esc(n.examCode) + ')' +
              '  </div>' +
              '  <div style="font-size:13px;color:#b91c1c;background:rgba(239, 68, 68, 0.08);padding:8px 12px;border-radius:8px;margin-bottom:12px;border:1px solid rgba(239,68,68,0.2)">' +
              '    <b>🚨 Qoidabuzarlik:</b> ' + esc(n.reason) +
              '  </div>' +
              (n.snapshot ?
                '  <div style="margin:-4px 0 12px;background:#0f172a;padding:8px;border-radius:10px;border:1.5px solid #ef4444">' +
                '    <div style="font-size:11px;color:#fca5a5;font-weight:700;margin-bottom:6px">📸 QOIDABUZARLIK SURATI (FOTO-DALIL):</div>' +
                '    <img src="' + n.snapshot + '" style="max-height:170px;width:100%;object-fit:cover;border-radius:6px;display:block" alt="Qoidabuzarlik surati">' +
                '  </div>' : ''
              ) +
              '  <div style="display:flex;justify-content:flex-end;gap:8px">' +
              (n.resolved ?
                '    <span style="font-size:12px;font-weight:700;color:#10b981;padding:6px 12px;background:rgba(16,185,129,0.1);border-radius:8px">✓ Blokdan chiqarilgan</span>' :
                '    <button class="eth-btn-primary" data-unblock-id="' + n.id + '" style="padding:8px 18px;font-size:13px;background:#10b981;border-color:#10b981;box-shadow:0 4px 12px rgba(16,185,129,0.3)">' +
                ic('unlock') + ' 🔓 Blokdan Chiqarish (Unblock)' +
                '    </button>') +
              '  </div>' +
              '</div>';
          }).join('') +
          '  </div>') +
        '  </div>' +
        '  <div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">' +
        (notifs.length > 0 ?
          '  <button class="ap-btn out" id="btnClearResolvedNotifs" style="font-size:12.5px;padding:6px 12px">Clear Resolved</button>' :
          '  <div></div>') +
        '    <button class="ap-btn solid" id="btnCloseNotifsModal" style="padding:8px 20px">Yopish (Close)</button>' +
        '  </div>' +
        '</div>';

      overlay.innerHTML = html;

      overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
      var topClose = overlay.querySelector('#btnTopCloseNotifs');
      if (topClose) topClose.onclick = function() { overlay.remove(); };
      var closeBtn = overlay.querySelector('#btnCloseNotifsModal');
      if (closeBtn) closeBtn.onclick = function() { overlay.remove(); };

      var onEsc = function(e) {
        if (e.key === 'Escape') {
          overlay.remove();
          window.removeEventListener('keydown', onEsc);
        }
      };
      window.addEventListener('keydown', onEsc);

      var clearBtn = overlay.querySelector('#btnClearResolvedNotifs');
      if (clearBtn) {
        clearBtn.onclick = function() {
          S.notifications = (S.notifications || []).filter(function(n) { return !n.resolved; });
          App.saveState();
          renderNotifsContent();
          if (window._ethithRefreshTopNav) window._ethithRefreshTopNav();
        };
      }

      overlay.querySelectorAll('[data-unblock-id]').forEach(function(btn) {
        btn.onclick = function() {
          var nId = btn.dataset.unblockId;
          var targetN = (S.notifications || []).find(function(n) { return n.id === nId; });
          if (!targetN) return;

          targetN.resolved = true;
          App.saveState();

          if (window.EthithSync) {
            window.EthithSync.publishLive({
              type: 'STUDENT_UNBLOCKED',
              studentId: targetN.studentId,
              studentEmail: targetN.studentEmail,
              examId: targetN.examId,
              examCode: targetN.examCode,
              timestamp: Date.now()
            });
          }

          if (window._ethithRefreshTopNav) window._ethithRefreshTopNav();
          renderNotifsContent();
        };
      });
    }

    renderNotifsContent();
    document.body.appendChild(overlay);
  }

  function showStudentNotificationsModal() {
    var existing = document.getElementById('studentNotifsOverlay');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';
    overlay.id = 'studentNotifsOverlay';

    var gifts = (S.user && S.user.gifts) || [];
    var sNotifs = (S.studentNotifications) || [];

    // Mark as read
    gifts.forEach(function(g) { g.read = true; });
    sNotifs.forEach(function(sn) { sn.read = true; });
    App.saveState();
    if (window._ethithRefreshTopNav) window._ethithRefreshTopNav();

    var html = '' +
      '<div class="eth-modal" style="max-width:580px">' +
      '  <button type="button" class="eth-modal-close-btn" id="btnTopCloseStudentNotifs" title="Yopish">✕</button>' +
      '  <div class="eth-modal-header">' +
      '    <h2>' + ic('bell') + ' Bildirishnomalar va Sovg\'alar</h2>' +
      '    <p>Do\'stlaringizdan kelgan sovg\'alar, quiz taklifnomalari va xabarlar.</p>' +
      '  </div>' +
      '  <div class="eth-modal-body" style="max-height:480px;overflow-y:auto">';

    if (gifts.length === 0 && sNotifs.length === 0) {
      html += '<div class="ap-card ap-empty" style="padding:32px 16px">' +
              '  <div style="font-size:48px;margin-bottom:10px">🎁</div>' +
              '  <h3 style="font-size:16px;font-weight:800;color:var(--text)">Hozircha xabarlar yo\'q</h3>' +
              '  <p style="font-size:13px;color:var(--muted);max-width:320px;margin:4px auto 0">Quiz test bellashuvlarida qatnashing yoki sinfdoshlaringiz bilan sovg\'alar almashing!</p>' +
              '</div>';
    } else {
      html += '<div style="display:flex;flex-direction:column;gap:12px">';
      gifts.forEach(function(g) {
        html += '<div class="ap-card" style="border:1.5px solid rgba(245,158,11,0.4);padding:14px;background:rgba(245,158,11,0.06);display:flex;align-items:center;gap:14px;border-radius:14px">' +
                '  <div style="font-size:40px;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.2))">' + (g.icon || '🎁') + '</div>' +
                '  <div style="flex:1">' +
                '    <div style="font-size:11px;font-weight:800;color:#f59e0b;text-transform:uppercase;letter-spacing:0.5px">🎁 ' + (g.senderName ? (esc(g.senderName) + ' sizga sovg\'a yubordi!') : 'Yangi Sovg\'a!') + '</div>' +
                '    <div style="font-size:15px;font-weight:900;color:var(--text);margin-top:2px">' + esc(g.name) + '</div>' +
                '    <div style="font-size:12px;color:var(--muted);margin-top:2px;line-height:1.4">' + esc(g.desc || '') + '</div>' +
                '  </div>' +
                '</div>';
      });
      sNotifs.forEach(function(sn) {
        html += '<div class="ap-card" style="padding:14px;display:flex;align-items:center;gap:12px;border-radius:14px">' +
                '  <div style="font-size:26px">⚡</div>' +
                '  <div style="flex:1">' +
                '    <div style="font-size:13px;font-weight:800;color:var(--text)">' + esc(sn.title || 'Xabar') + '</div>' +
                '    <div style="font-size:12px;color:var(--muted)">' + esc(sn.message || '') + '</div>' +
                '  </div>' +
                '</div>';
      });
      html += '</div>';
    }

    html += '  </div>' +
            '</div>';

    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    var btnClose = overlay.querySelector('#btnTopCloseStudentNotifs');
    if (btnClose) btnClose.onclick = function() { overlay.remove(); };
    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
  }

  window._ethithShowTeacherAlert = function(notif) {
    if (!S.user || S.user.role !== 'teacher') return;
    var existing = document.getElementById('floatingTeacherAlert_' + notif.id);
    if (existing) return;

    var alertEl = document.createElement('div');
    alertEl.id = 'floatingTeacherAlert_' + notif.id;
    alertEl.className = 'eth-teacher-floating-alert';
    alertEl.style.cssText = 'position:fixed;top:24px;right:24px;z-index:2147483647;background:#dc2626;color:#fff;padding:16px 20px;border-radius:14px;box-shadow:0 14px 35px rgba(220,38,38,0.5);max-width:440px;animation:ethNotifSlideIn 0.3s ease;display:flex;flex-direction:column;gap:10px;';
    alertEl.innerHTML = '' +
      '<div style="display:flex;justify-content:space-between;align-items:center">' +
      '  <b style="font-size:15px;display:flex;align-items:center;gap:6px">🚨 O\'QUVCHI TESTDA BLOKLANDI!</b>' +
      '  <button type="button" style="background:none;border:none;color:#fff;font-size:18px;cursor:pointer;opacity:0.8;line-height:1" onclick="this.closest(\'.eth-teacher-floating-alert\').remove()">✕</button>' +
      '</div>' +
      '<div class="eth-teacher-alert-student-badge">' +
      '  <span class="eth-teacher-alert-student-label">👤 BLOKLANGAN O\'QUVCHI:</span>' +
      '  <div class="eth-teacher-alert-student-name">' + esc(notif.studentName) + '</div>' +
      '</div>' +
      '<div style="font-size:13px;line-height:1.45;color:#fee2e2">' +
      '  <b>Imtihon:</b> ' + esc(notif.examTitle) + ' (' + esc(notif.examCode) + ')<br>' +
      '  <b>Qoidabuzarlik:</b> <span style="background:rgba(0,0,0,0.35);padding:2px 6px;border-radius:4px;color:#fff;font-weight:700">' + esc(notif.reason) + '</span>' +
      '</div>' +
      (notif.snapshot ?
        '<div style="margin:4px 0;background:#000;border-radius:10px;padding:6px;border:1.5px solid rgba(255,255,255,0.4);text-align:center">' +
        '  <div style="font-size:10.5px;font-weight:700;color:#fca5a5;margin-bottom:4px">📸 O\'QUVCHI QOIDABUZARLIK SURATI (FOTO-DALIL):</div>' +
        '  <img src="' + notif.snapshot + '" style="width:100%;max-height:180px;object-fit:cover;border-radius:6px;display:block;margin:0 auto;" alt="Dalil">' +
        '</div>' : ''
      ) +
      '<button type="button" class="eth-btn-primary" style="background:#fff;color:#dc2626;font-weight:900;border:none;padding:11px 16px;border-radius:8px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3);font-size:14.5px;">' +
      '  🔓 O\'quvchini Blokdan Chiqarish' +
      '</button>';

    var unblockBtn = alertEl.querySelector('button.eth-btn-primary');
    if (unblockBtn) {
      unblockBtn.onclick = function() {
        notif.resolved = true;
        App.saveState();
        if (window.EthithSync) {
          window.EthithSync.publishLive({
            type: 'STUDENT_UNBLOCKED',
            studentId: notif.studentId,
            studentEmail: notif.studentEmail,
            examId: notif.examId,
            examCode: notif.examCode,
            timestamp: Date.now()
          });
        }
        alertEl.remove();
        if (window._ethithRefreshTopNav) window._ethithRefreshTopNav();
        if (window._ethithRefreshNotifsModal) window._ethithRefreshNotifsModal();
      };
    }

    document.body.appendChild(alertEl);
  };

  // ==========================================
  // VIEW 5: PLACEMENT TEST (70 QUESTIONS)
  // ==========================================
  function renderPlacementView(container) {
    window._ethithCurrentView = 'placement';
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
    window._ethithIsTestInProgress = true;
    window._ethithRefreshQuizList = null;
    window._ethithRefreshGifts = null;
    showPreTestSecurityBriefing(initPlacementRunner);

    function initPlacementRunner() {
      var timeLeft = 90 * 60; // Exactly 1.5 hours (90 minutes) total for all 70 questions
      var isTestFinished = false;
      var isExamLocked = false;
      var isPaletteCollapsed = false;
      var proctorStream = null;
      var proctorInterval = null;
      var turnInfractionFrames = 0;
      var state = {
        i: 0,
        answers: {}
      };

      // 1. Remove previous modal if any
      var oldModal = document.getElementById('ethExamLockdownModal');
      if (oldModal) oldModal.remove();

      // 2. Mount Dedicated Fullscreen Lockdown Container directly to body
      var lockdownModal = document.createElement('div');
      lockdownModal.id = 'ethExamLockdownModal';
      lockdownModal.className = 'eth-lockdown-fullscreen';
      var activeTheme = (window.EthithApp && EthithApp.state && EthithApp.state.theme) || (window.S && S.theme) || (document.getElementById('app') && document.getElementById('app').getAttribute('data-theme')) || (document.body && document.body.getAttribute('data-theme')) || 'dark';
      lockdownModal.setAttribute('data-theme', activeTheme);
      document.body.setAttribute('data-theme', activeTheme);
      document.body.appendChild(lockdownModal);

      // Enter Fullscreen Mode & Keyboard Lock
      function ensureFullscreen() {
        if (isTestFinished) return;
        var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
        if (!isFs) {
          try {
            var target = lockdownModal || document.documentElement;
            var req = target.requestFullscreen || target.webkitRequestFullscreen || target.mozRequestFullScreen || target.msRequestFullscreen;
            if (req) req.call(target, { navigationUI: 'hide' }).catch(function(){});
          } catch(e) {}
        }
      }
      ensureFullscreen();
      document.body.classList.add('proctored-fullscreen-mode');

      function captureProctorSnapshot() {
        return null;
      }

      function triggerInfraction(reason, violationSnapshot) {
        if (isExamLocked || isTestFinished) return;
        isExamLocked = true;
        playTitTitAlarm(6);

        var snapshotImg = violationSnapshot || captureProctorSnapshot();

        var angleBadge = document.getElementById('proctorCamAngle');
        var dot = document.getElementById('proctorCamDot');
        if (dot) dot.className = 'eth-cam-dot danger';
        if (angleBadge) {
          angleBadge.textContent = 'BLOKLANDI';
          angleBadge.className = 'eth-cam-badge danger';
        }

        var existingLock = document.getElementById('examLockedScreen');
        if (existingLock) existingLock.remove();

        var lockedOverlay = document.createElement('div');
        lockedOverlay.className = 'eth-exam-locked-screen';
        lockedOverlay.id = 'examLockedScreen';
        lockedOverlay.style.zIndex = '2147483648';
        lockedOverlay.innerHTML = '' +
          '<div class="eth-locked-box" style="max-width:520px;text-align:center;">' +
          '  <div class="eth-locked-icon">🚫</div>' +
          '  <h2 style="color:#ef4444;margin:8px 0 6px;">PLACEMENT TEST BLOKLANDI</h2>' +
          '  <div class="eth-locked-student-badge">' +
          '    <span class="eth-locked-student-label">👤 BLOKLANGAN O\'QUVCHI:</span>' +
          '    <div class="eth-locked-student-name">' + esc((S.user && S.user.name) || 'O\'quvchi') + '</div>' +
          '  </div>' +
          '  <div class="eth-locked-reason" style="font-size:13.5px;padding:8px 12px;margin-bottom:12px;"><b>🚨 Qoidabuzarlik:</b> ' + esc(reason) + '</div>' +
          (snapshotImg ?
            '  <div class="eth-locked-snapshot-wrap">' +
            '    <div class="eth-locked-snapshot-badge">📸 Qoidabuzarlik Holati (Foto-Fakt Dalili)</div>' +
            '    <img src="' + snapshotImg + '" alt="Qoidabuzarlik surati">' +
            '    <div class="eth-locked-snapshot-hint">Ushbu foto-dalil avtomatik tarzda o\'qituvchingizga yuborildi</div>' +
            '  </div>' : ''
          ) +
          '  <div class="eth-locked-msg" style="font-size:13.5px;line-height:1.5;margin-bottom:14px;">' +
          '    Placement test paytida boshni 65° dan ortiq burish, 2.5 soniyadan ortiq chetga qarash yoki boshqa oynalarga o\'tish qat\'iyan taqiqlanadi.<br>' +
          '    <b>O\'qituvchingiz ushbu foto-dalilni tekshirib, sizni blokdan ochmaguncha kuting.</b>' +
          '  </div>' +
          '  <div class="eth-locked-pulse">' +
          '    <span class="eth-cam-dot danger"></span> Blokdan chiqarilishi kutilmoqda...' +
          '  </div>' +
          '</div>';
        lockdownModal.appendChild(lockedOverlay);

        if (window.EthithSync) {
          window.EthithSync.publishLive({
            type: 'STUDENT_BLOCKED',
            studentId: (S.user && (S.user.email || S.user.id)) || 'guest',
            studentName: (S.user && S.user.name) || 'O\'quvchi',
            studentEmail: (S.user && S.user.email) || '',
            examId: 'placement_70',
            examTitle: 'CEFR Placement Test (70 Savol)',
            reason: reason,
            snapshot: snapshotImg,
            timestamp: Date.now()
          });
        }
      }

      function onWindowBlur() {
        if (isTestFinished || isExamLocked) return;
        playTitTitAlarm(6);
        triggerInfraction("Brauzer oynasidan chiqish yoki boshqa oynalarga o\'tish aniqlandi");
      }
      function onVisChange() {
        if (isTestFinished || isExamLocked) return;
        if (document.hidden) {
          playTitTitAlarm(6);
          triggerInfraction("Brauzer oynasi minimallashtirildi yoki boshqa sahifaga o\'tildi");
        }
      }

      function requestKeyboardLock() {
        if (isTestFinished) return;
        if (navigator.keyboard && navigator.keyboard.lock) {
          try {
            var lockPromise = navigator.keyboard.lock([
              'Escape', 'Tab', 'AltLeft', 'AltRight', 'ControlLeft', 'ControlRight', 'MetaLeft', 'MetaRight', 'ContextMenu'
            ]);
            if (lockPromise && lockPromise.catch) {
              lockPromise.catch(function() {
                try { navigator.keyboard.lock().catch(function(){}); } catch(e) {}
              });
            }
          } catch(e) {}
        }
      }
      requestKeyboardLock();

      function onFullscreenChange() {
        if (isTestFinished) return;
        var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
        if (!isFs) {
          playTitTitAlarm(6);
          triggerInfraction("To\'liq ekran rejimidan chiqish aniqlandi! Qoidabuzarlik sababli placement test bloklandi.");
        }
      }

      function onKeyDownProctor(e) {
        if (isTestFinished) return;
        var blockedKeyName = getBlockedKeyLabel(e);
        if (blockedKeyName) {
          try {
            e.preventDefault();
            e.stopPropagation();
            if (e.stopImmediatePropagation) e.stopImmediatePropagation();
          } catch(err) {}
          ensureFullscreen();
          playTitTitAlarm(6);
          triggerInfraction("Taqiqlangan tugma bosildi: " + blockedKeyName);
          return false;
        }
      }

      function onKeyUpProctor(e) {
        if (isTestFinished) return;
        var blockedKeyName = getBlockedKeyLabel(e);
        if (blockedKeyName) {
          try {
            e.preventDefault();
            e.stopPropagation();
            if (e.stopImmediatePropagation) e.stopImmediatePropagation();
          } catch(err) {}
          ensureFullscreen();
          return false;
        }
      }

      window.addEventListener('blur', onWindowBlur);
      document.addEventListener('visibilitychange', onVisChange);
      window.addEventListener('keydown', onKeyDownProctor, true);
      window.addEventListener('keyup', onKeyUpProctor, true);
      document.addEventListener('keydown', onKeyDownProctor, true);
      document.addEventListener('keyup', onKeyUpProctor, true);
      document.addEventListener('fullscreenchange', onFullscreenChange);
      document.addEventListener('webkitfullscreenchange', onFullscreenChange);
      document.addEventListener('mozfullscreenchange', onFullscreenChange);
      document.addEventListener('MSFullscreenChange', onFullscreenChange);
      window.addEventListener('click', ensureFullscreen, true);

      // Placement test camera removed
      window._ethithOnStudentUnblocked = function(ev) {
        var myKey = (S.user && (S.user.email || S.user.id || '')).toLowerCase();
        if ((ev.studentEmail && ev.studentEmail.toLowerCase() === myKey) ||
            (ev.studentId && ev.studentId.toLowerCase() === myKey)) {
          isExamLocked = false;
          turnInfractionFrames = 0;
          var lockEl = document.getElementById('examLockedScreen');
          if (lockEl) lockEl.remove();
          var angleBadge = document.getElementById('proctorCamAngle');
          var dot = document.getElementById('proctorCamDot');
          if (dot) dot.className = 'eth-cam-dot';
          if (angleBadge) {
            angleBadge.textContent = "To\'g'ri: 0°";
            angleBadge.className = 'eth-cam-badge';
          }
          ensureFullscreen();
        }
      };

    function formatTime(sec) {
      if (sec < 0) sec = 0;
      var hrs = Math.floor(sec / 3600);
      var m = Math.floor((sec % 3600) / 60);
      var s = sec % 60;
      return (hrs < 10 ? '0' : '') + hrs + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }

    var interval = setInterval(function() {
      if (isTestFinished) return;
      timeLeft--;
      var badge = document.getElementById('plcTimer');
      if (badge) {
        badge.textContent = formatTime(timeLeft);
      }
      if (timeLeft <= 0) {
        clearInterval(interval);
        alert("Vaqt tugadi! Darajani aniqlash testi yakunlanadi.");
        finishPlacement();
      }
    }, 1000);

    function renderQ() {
      if (isTestFinished) return;
      var q = questions[state.i];
      var opts = q.options || { A: 'A', B: 'B', C: 'C', D: 'D' };
      var answeredCount = Object.keys(state.answers).filter(function(k){ return state.answers[k] !== undefined && state.answers[k] !== ''; }).length;
      var totalQ = questions.length;
      var progressPct = Math.round((answeredCount / totalQ) * 100);

      var currentChoice = state.answers[state.i];

      var html = '' +
        '<header class="eth-test-topbar">' +
        '  <div class="eth-test-topbar-left">' +
        '    <div class="eth-test-badge">' +
        '      <span class="eth-test-badge-dot"></span>' +
        '      <span>CEFR Darajani Aniqlash Testi</span>' +
        '    </div>' +
        '    <span class="eth-test-qcount">(Kamerasiz qat\'iy nazorat)</span>' +
        '  </div>' +
        '  <div class="eth-test-topbar-center">' +
        '    <div class="eth-test-timer-pill" title="Jami 1.5 soat ajratilgan">' +
        '      <span>⏱</span>' +
        '      <span id="plcTimer">' + formatTime(timeLeft) + '</span>' +
        '    </div>' +
        '  </div>' +
        '  <div class="eth-test-topbar-right">' +
        '    <div class="eth-test-progress-info">' +
        '      <div class="eth-test-progress-text">Belgilangan: <b>' + answeredCount + ' / ' + totalQ + '</b> (' + progressPct + '%)</div>' +
        '      <div class="eth-test-progress-bar"><i style="width:' + progressPct + '%"></i></div>' +
        '    </div>' +
        '    <button type="button" class="eth-test-btn-finish" id="btnPlcHeaderFinish">🏁 <span>Yakunlash</span></button>' +
        '  </div>' +
        '</header>' +
        '<main class="eth-test-main">' +
        '  <!-- Collapsible 70-Question Palette Card -->' +
        '  <div class="eth-test-palette-card">' +
        '    <div class="eth-test-palette-header" id="btnTogglePlcPalette">' +
        '      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
        '        <span style="font-size:16px">📋</span>' +
        '        <b style="font-size:14px;letter-spacing:-0.01em">Savollar xaritasi (70 ta savol)</b>' +
        '        <span class="eth-test-chip success">✅ ' + answeredCount + ' ta belgilandi</span>' +
        '        <span class="eth-test-chip muted">⚪ ' + (totalQ - answeredCount) + ' ta kutilmoqda</span>' +
        '      </div>' +
        '      <span class="eth-test-palette-toggle-icon" id="plcPaletteToggleArrow">' +
        (isPaletteCollapsed ? '🔽 Ro\'yxatni ochish' : '🔼 Yashirish') +
        '      </span>' +
        '    </div>' +
        '    <div class="eth-test-palette-grid' + (isPaletteCollapsed ? ' collapsed' : '') + '" id="plcPaletteGrid">' +
        questions.map(function(_, idx) {
          var isAns = state.answers[idx] !== undefined && state.answers[idx] !== '';
          var isCur = idx === state.i;
          var cls = 'eth-test-pbtn' + (isCur ? ' current' : '') + (isAns ? ' answered' : '');
          return '<button type="button" class="' + cls + '" data-goto="' + idx + '">' + (idx + 1) + '</button>';
        }).join('') +
        '    </div>' +
        '  </div>' +
        '  <!-- Main Question Box -->' +
        '  <div class="eth-test-card">' +
        '    <div class="eth-test-card-top">' +
        '      <div class="eth-test-pill-category">SAVOL ' + (state.i + 1) + ' / ' + totalQ + '</div>' +
        '      <div class="eth-test-pill-points">⭐ 1 BALL</div>' +
        '    </div>' +
        '    <h2 class="eth-test-qtitle">' + esc(q.prompt) + '</h2>' +
        '    <div class="eth-test-options-list">';

      ['A', 'B', 'C', 'D'].forEach(function(key) {
        var isSel = (currentChoice === key);
        html += '' +
          '<button type="button" class="eth-test-opt' + (isSel ? ' selected' : '') + '" data-k="' + key + '">' +
          '  <span class="eth-test-opt-badge">' + key + '</span>' +
          '  <span class="eth-test-opt-text">' + esc(opts[key]) + '</span>' +
          '  <span class="eth-test-opt-indicator"></span>' +
          '</button>';
      });

      html += '' +
        '    </div>' +
        '  </div>' +
        '  <!-- Bottom Navigation Bar -->' +
        '  <footer class="eth-test-footer">' +
        '    <button type="button" class="eth-test-nav-btn prev" id="btnPlcPrev"' + (state.i === 0 ? ' disabled style="opacity:0.35;cursor:not-allowed"' : '') + '>' +
        '      ⬅ <span>Oldingi savol</span>' +
        '    </button>' +
        '    <div class="eth-test-nav-center">Savol <b>' + (state.i + 1) + '</b> dan <b>' + totalQ + '</b></div>' +
        (state.i === totalQ - 1 ?
          '    <button type="button" class="eth-test-nav-btn finish" id="btnPlcNext">🏁 <span>Testni yakunlash</span></button>' :
          '    <button type="button" class="eth-test-nav-btn next" id="btnPlcNext"><span>Keyingi savol</span> ➡</button>'
        ) +
        '  </footer>' +
        '</main>';

      lockdownModal.innerHTML = html;

      // Toggle Palette
      var toggleBtn = document.getElementById('btnTogglePlcPalette');
      if (toggleBtn) {
        toggleBtn.onclick = function() {
          isPaletteCollapsed = !isPaletteCollapsed;
          var grid = document.getElementById('plcPaletteGrid');
          var arrow = document.getElementById('plcPaletteToggleArrow');
          if (grid) {
            if (isPaletteCollapsed) {
              grid.classList.add('collapsed');
              if (arrow) arrow.textContent = '🔽 Ro\'yxatni ochish';
            } else {
              grid.classList.remove('collapsed');
              if (arrow) arrow.textContent = '🔼 Yashirish';
            }
          }
        };
      }

      // Event handlers: Palette buttons
      lockdownModal.querySelectorAll('.eth-test-pbtn').forEach(function(btn) {
        btn.onclick = function() {
          var target = parseInt(btn.dataset.goto, 10);
          if (!isNaN(target) && target >= 0 && target < totalQ) {
            state.i = target;
            renderQ();
          }
        };
      });

      // Previous button
      var prevBtn = document.getElementById('btnPlcPrev');
      if (prevBtn) {
        prevBtn.onclick = function() {
          if (state.i > 0) {
            state.i--;
            renderQ();
          }
        };
      }

      // Next / Finish button
      var nextBtn = document.getElementById('btnPlcNext');
      if (nextBtn) {
        nextBtn.onclick = function() {
          if (state.i === totalQ - 1) {
            confirmPlcFinish();
          } else {
            state.i++;
            renderQ();
          }
        };
      }

      // Header finish button
      var hFinishBtn = document.getElementById('btnPlcHeaderFinish');
      if (hFinishBtn) {
        hFinishBtn.onclick = function() {
          confirmPlcFinish();
        };
      }

      // Option click handler (Does NOT advance question! Updates .selected state)
      lockdownModal.querySelectorAll('.eth-test-opt').forEach(function(optBtn) {
        optBtn.onclick = function() {
          var chosen = optBtn.dataset.k;
          state.answers[state.i] = chosen;
          renderQ();
        };
      });
    }

    function confirmPlcFinish() {
      var ansCount = Object.keys(state.answers).filter(function(k){ return state.answers[k] !== undefined && state.answers[k] !== ''; }).length;
      var totalQ = questions.length;
      var msg = "Darajani aniqlash testini yakunlashga ishonchingiz komilmi?\n\nBelgilangan savollar: " + ansCount + " / " + totalQ + " ta.";
      if (ansCount < totalQ) {
        msg += "\nDiqqat: " + (totalQ - ansCount) + " ta savol javobsiz qoldi!";
      }
      if (confirm(msg)) {
        finishPlacement();
      }
    }

    function finishPlacement() {
      if (isTestFinished) return;
      isTestFinished = true;

      clearInterval(interval);
      window.removeEventListener('blur', onWindowBlur);
      document.removeEventListener('visibilitychange', onVisChange);

      try {
        if (document.exitFullscreen) document.exitFullscreen().catch(function(){});
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      } catch(e) {}
      document.body.classList.remove('proctored-fullscreen-mode');

      var correctCount = 0;
      var incorrectCount = 0;

      var breakdown = questions.map(function(q, idx) {
        var userAns = state.answers[idx];
        var isCorrect = false;

        if (userAns !== undefined && userAns !== '') {
          if (userAns === q.answer) {
            isCorrect = true;
            correctCount++;
          } else {
            incorrectCount++;
          }
        } else {
          incorrectCount++;
          userAns = 'Belgilanmagan';
        }

        var opts = q.options || {};
        var userAnsText = userAns !== 'Belgilanmagan' && opts[userAns] ? (userAns + ') ' + opts[userAns]) : userAns;
        var correctAnsText = q.answer && opts[q.answer] ? (q.answer + ') ' + opts[q.answer]) : (q.answer || '');

        return {
          qNum: idx + 1,
          prompt: q.prompt,
          userAnsText: userAnsText,
          correctAnsText: correctAnsText,
          isCorrect: isCorrect
        };
      });

      var score = correctCount;
      var pct = Math.round((correctCount / questions.length) * 100);
      var timeSpentMin = Math.max(1, Math.round((90 * 60 - Math.max(0, timeLeft)) / 60));

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

      // Render Comprehensive Luxury Results Screen
      var resHtml = '' +
        '<header class="eth-test-topbar">' +
        '  <div class="eth-test-topbar-left">' +
        '    <div class="eth-test-badge">' +
        '      <span class="eth-test-badge-dot"></span>' +
        '      <span>CEFR Natijasi</span>' +
        '    </div>' +
        '    <span class="eth-test-qcount">Language Hub Standarti</span>' +
        '  </div>' +
        '  <button type="button" class="eth-test-nav-btn next" id="btnPlcContinue" style="padding:8px 20px;font-size:13.5px">Ta\'limni Boshlash ➡</button>' +
        '</header>' +
        '<main class="eth-test-main" style="max-width:850px">' +
        '  <div class="eth-test-card" style="text-align:center;padding:40px 32px">' +
        '    <div style="font-size:60px;margin-bottom:12px">🎓</div>' +
        '    <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:var(--test-text)">Sizning Darajangiz: <span style="color:#3b82f6">' + level + ' (' + levelDesc + ')</span></h1>' +
        '    <p style="color:var(--test-text-muted);font-size:15px;margin:0 0 28px">Language Hub xalqaro standarti asosida CEFR darajangiz belgilandi va profilingizga biriktirildi.</p>' +
        '    <div style="display:inline-block;padding:20px 48px;border-radius:22px;background:rgba(37,99,235,0.12);border:2.5px solid #3b82f6;margin-bottom:28px;box-shadow:0 10px 30px var(--test-accent-glow)">' +
        '      <span style="font-size:12.5px;text-transform:uppercase;letter-spacing:1px;font-weight:800;color:#60a5fa;display:block">To\'plangan Natija</span>' +
        '      <span style="font-size:56px;font-weight:900;color:#3b82f6">' + pct + '%</span>' +
        '    </div>' +
        '    <div class="eth-res-metrics">' +
        '      <div class="eth-res-card" style="border-top:4px solid #10b981">' +
        '        <span style="font-size:12px;color:var(--test-text-muted);font-weight:700">TO\'G\'RI JAVOBLAR</span>' +
        '        <b style="color:#10b981">✅ ' + correctCount + ' ta</b>' +
        '      </div>' +
        '      <div class="eth-res-card" style="border-top:4px solid #ef4444">' +
        '        <span style="font-size:12px;color:var(--test-text-muted);font-weight:700">XATO / BELGILANMAGAN</span>' +
        '        <b style="color:#ef4444">❌ ' + incorrectCount + ' ta</b>' +
        '      </div>' +
        '      <div class="eth-res-card" style="border-top:4px solid #3b82f6">' +
        '        <span style="font-size:12px;color:var(--test-text-muted);font-weight:700">TO\'PLANGAN BALL</span>' +
        '        <b style="color:#3b82f6">⭐ ' + score + ' / ' + questions.length + '</b>' +
        '      </div>' +
        '      <div class="eth-res-card" style="border-top:4px solid #8b5cf6">' +
        '        <span style="font-size:12px;color:var(--test-text-muted);font-weight:700">SARFLANGAN VAQT</span>' +
        '        <b style="color:#8b5cf6">⏱ ' + timeSpentMin + ' daqiqa</b>' +
        '      </div>' +
        '    </div>' +
        '    <div style="margin-top:28px">' +
        '      <button type="button" class="eth-test-nav-btn next" id="btnPlcGoLearn" style="padding:15px 36px;font-size:16px">O\'quv Dasturiga O\'tish ' + ic('right') + '</button>' +
        '    </div>' +
        '  </div>' +
        '  <!-- Detailed 70-Question Breakdown -->' +
        '  <h3 style="font-size:20px;font-weight:800;color:var(--test-text);margin:32px 0 16px;display:flex;align-items:center;gap:10px">' +
        '    📋 Savollar Tahlili va To\'liq Ko\'rib Chiqish (70 ta savol):' +
        '  </h3>' +
        '  <div class="eth-review-list">' +
        breakdown.map(function(item) {
          return '<div class="eth-review-item ' + (item.isCorrect ? 'correct' : 'incorrect') + '">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
            '  <b style="font-size:15px;color:var(--test-text)">Savol ' + item.qNum + '</b>' +
            '  <span style="font-size:13.5px;font-weight:800;color:' + (item.isCorrect ? '#10b981' : '#ef4444') + '">' +
            (item.isCorrect ? '✅ To\'g\'ri (+1 ball)' : '❌ Xato (0 ball)') +
            '  </span>' +
            '</div>' +
            '<p style="margin:0 0 12px;font-size:15.5px;color:var(--test-text);line-height:1.48">' + esc(item.prompt) + '</p>' +
            '<div style="font-size:14px;background:var(--test-palette-bg);padding:12px 16px;border-radius:12px;border:1px solid var(--test-item-border)">' +
            '  <div>Sizning javobingiz: <b style="color:' + (item.isCorrect ? '#10b981' : '#ef4444') + '">' + esc(item.userAnsText) + '</b></div>' +
            (!item.isCorrect ? '<div style="margin-top:6px">To\'g\'ri javob: <b style="color:#10b981">' + esc(item.correctAnsText) + '</b></div>' : '') +
            '</div>' +
            '</div>';
        }).join('') +
        '  </div>' +
        '</main>';

      lockdownModal.innerHTML = resHtml;

      function exitPlc() {
        window._ethithIsTestInProgress = false;
        if (lockdownModal) lockdownModal.remove();
        window.ethithOpenApp('level', S.level);
      }

      var contBtn = document.getElementById('btnPlcContinue');
      if (contBtn) contBtn.onclick = exitPlc;
      var goBtn = document.getElementById('btnPlcGoLearn');
      if (goBtn) goBtn.onclick = exitPlc;
    }

    renderQ();
    }
  }

  // ==========================================
  // VIEW 6: MISTAKES NOTEBOOK
  // ==========================================
  function renderMistakesNotebook(container) {
    window._ethithCurrentView = 'mistakes';
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
  // VIEW 7: IELTS PRACTICE HUB & FULL MOCK SIMULATOR
  // ==========================================
  function showIeltsFullReviewModal(exam, breakdown, earnedScore, totalPossible) {
    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';

    var pct = totalPossible > 0 ? (earnedScore / totalPossible) * 100 : 0;
    var bandScore = 6.0;
    if (pct >= 89) bandScore = 9.0;
    else if (pct >= 80) bandScore = 8.5;
    else if (pct >= 73) bandScore = 8.0;
    else if (pct >= 66) bandScore = 7.5;
    else if (pct >= 58) bandScore = 7.0;
    else if (pct >= 50) bandScore = 6.5;
    else if (pct >= 42) bandScore = 6.0;
    else if (pct >= 35) bandScore = 5.5;
    else bandScore = 5.0;

    var ieltsData = exam.ieltsData || {};
    var activeReviewTab = 'transcripts';
    if (!ieltsData.transcripts && ieltsData.readingPassages) activeReviewTab = 'reading';
    else if (!ieltsData.transcripts && ieltsData.writingSamples) activeReviewTab = 'writing';

    function renderContent() {
      var html = '' +
        '<div class="eth-modal" style="max-width:880px;width:95vw;max-height:92vh;display:flex;flex-direction:column">' +
        '  <button type="button" class="eth-modal-close-btn" id="btnCloseIeltsReview" title="Yopish">✕</button>' +
        '  <div class="eth-modal-header" style="padding-bottom:14px;border-bottom:1px solid var(--border)">' +
        '    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">' +
        '      <div>' +
        '        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
        '          <span style="background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:800">IELTS SCRIPT & CLUE ANALYSIS</span>' +
        '          <span style="font-size:12px;color:var(--muted)">' + esc(exam.title) + '</span>' +
        '        </div>' +
        '        <h2 style="margin:0;font-size:20px;font-weight:800">🔍 Rasmiy Skriptlar va To\'liq Tahlil</h2>' +
        '      </div>' +
        '      <div style="display:flex;align-items:center;gap:12px">' +
        '        <div style="text-align:right">' +
        '          <div style="font-size:11px;color:var(--muted);font-weight:700">TAXMINIY IELTS BAND</div>' +
        '          <div style="font-size:24px;font-weight:900;color:#ea580c">Band ' + bandScore + '</div>' +
        '        </div>' +
        '      </div>' +
        '    </div>' +
        '    <div class="eth-tabs" style="margin:14px 0 0">' +
        '      <button class="eth-tab ' + (activeReviewTab === 'transcripts' ? 'active' : '') + '" id="tabReviewTranscripts">🎧 Listening Transcripts (Vaqtlar & Clues)</button>' +
        '      <button class="eth-tab ' + (activeReviewTab === 'reading' ? 'active' : '') + '" id="tabReviewReading">📖 Reading Passages & Clues</button>' +
        '      <button class="eth-tab ' + (activeReviewTab === 'writing' ? 'active' : '') + '" id="tabReviewWriting">✍️ Writing Band 9 Samples</button>' +
        '      <button class="eth-tab ' + (activeReviewTab === 'questions' ? 'active' : '') + '" id="tabReviewQuestions">📋 Savollar Kaliti (' + breakdown.length + ')</button>' +
        '    </div>' +
        '  </div>' +
        '  <div class="eth-modal-body" style="overflow-y:auto;flex:1;padding:20px 24px">';

      if (activeReviewTab === 'transcripts') {
        html += '' +
          '<div style="line-height:1.7;font-size:14px">' +
          '  <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);padding:12px 16px;border-radius:10px;margin-bottom:16px;font-size:13px;color:var(--text)">' +
          '    💡 <b>Eslatma:</b> Listening audio matnlari vaqt belgilari (timestamps) bilan keltirilgan. Savollarning to\'g\'ri javoblari tushgan jumlalar <mark style="background:#fef08a;color:#854d0e;padding:2px 6px;border-radius:4px;font-weight:700">sariq rang</mark> bilan ajratib ko\'rsatilgan.' +
          '  </div>' +
          (ieltsData.transcripts ||
            '<div style="margin-bottom:20px">' +
            '  <h4 style="font-size:15px;color:#2563eb;margin:0 0 8px">🎧 Section 1: Customer Accommodation Inquiry</h4>' +
            '  <p><b>[00:15] Agent:</b> Good morning, Westside Property Rentals. How may I help you?<br>' +
            '  <b>[00:22] Caller:</b> Hello, I\'m calling regarding the studio apartment advertised on Green Street.<br>' +
            '  <b>[00:35] Agent:</b> Certainly! The apartment is available starting next Monday. <mark style="background:#fef08a;color:#854d0e;padding:2px 6px;border-radius:4px;font-weight:700">The monthly rent is £450 (Q1 clue: 450)</mark>, which covers all utility costs including water and high-speed internet.<br>' +
            '  <b>[01:12] Caller:</b> That sounds ideal. Is there parking available for residents?<br>' +
            '  <b>[01:18] Agent:</b> Yes, there is <mark style="background:#fef08a;color:#854d0e;padding:2px 6px;border-radius:4px;font-weight:700">underground parking (Q2 clue: underground)</mark> accessible with a secure electronic key fob.<br>' +
            '  <b>[02:04] Caller:</b> Wonderful. My surname is <mark style="background:#fef08a;color:#854d0e;padding:2px 6px;border-radius:4px;font-weight:700">HARLINGTON (Q3 clue: Harlington)</mark>, that\'s H-A-R-L-I-N-G-T-O-N.</p>' +
            '</div>' +
            '<div style="margin-bottom:20px">' +
            '  <h4 style="font-size:15px;color:#2563eb;margin:0 0 8px">🎧 Section 2: Botanical Gardens Visitor Information</h4>' +
            '  <p><b>[03:10] Guide:</b> Welcome everyone to the Royal Botanical Conservatory. As you can see from your maps, <mark style="background:#fef08a;color:#854d0e;padding:2px 6px;border-radius:4px;font-weight:700">the Orchid House is situated immediately north of the central lake (Q4 clue: North of lake)</mark>. We kindly request all guests to avoid flash photography inside the butterfly pavilion.</p>' +
            '</div>' +
            '<div style="margin-bottom:20px">' +
            '  <h4 style="font-size:15px;color:#2563eb;margin:0 0 8px">🎧 Section 3: Student Research Seminar</h4>' +
            '  <p><b>[05:40] Professor:</b> Before we finalize your methodology, let\'s review the sample size. <mark style="background:#fef08a;color:#854d0e;padding:2px 6px;border-radius:4px;font-weight:700">Having 120 respondents across three distinct age demographics (Q5 clue: 120)</mark> will ensure statistical validity.</p>' +
            '</div>'
          ) +
          '</div>';
      } else if (activeReviewTab === 'reading') {
        html += '' +
          '<div style="line-height:1.7;font-size:14px">' +
          '  <div style="background:rgba(37,99,235,0.08);border:1px solid rgba(37,99,235,0.25);padding:12px 16px;border-radius:10px;margin-bottom:16px;font-size:13px;color:var(--text)">' +
          '    💡 <b>Reading Tahlili:</b> Matn ichidagi to\'g\'ri javob kalitlari va ularning parafraza (paraphrase) qilingan shakllari to\'liq ko\'rsatilgan.' +
          '  </div>' +
          (ieltsData.readingPassages ||
            '<div style="margin-bottom:24px">' +
            '  <h4 style="font-size:16px;color:#2563eb;margin:0 0 10px">📖 Passage 1: The Evolution of Modern Architecture</h4>' +
            '  <p>In the early twentieth century, architectural philosophy underwent a radical shift from ornate historicism toward functional minimalism. <mark style="background:#dcfce7;color:#166534;padding:2px 6px;border-radius:4px;font-weight:700">The primary catalyst was the industrial manufacturing of reinforced concrete and structural steel (Clue: Industrial materials)</mark>, which allowed engineers to construct spans previously considered impossible without load-bearing masonry walls.</p>' +
            '  <p>Contrary to popular belief, <mark style="background:#fef08a;color:#854d0e;padding:2px 6px;border-radius:4px;font-weight:700">early modernist designs were initially met with intense skepticism by urban planning councils (Clue: Initial public resistance - True)</mark>, who feared geometric facades would destroy the cultural fabric of historic European metropolises.</p>' +
            '</div>' +
            '<div style="margin-bottom:24px">' +
            '  <h4 style="font-size:16px;color:#2563eb;margin:0 0 10px">📖 Passage 2: Marine Bio-Acoustics</h4>' +
            '  <p>Cetacean communication relies extensively on low-frequency acoustic vibrations capable of traveling thousands of kilometers across oceanic thermoclines. Recent sonar surveys indicate that <mark style="background:#fef08a;color:#854d0e;padding:2px 6px;border-radius:4px;font-weight:700">anthropogenic noise from commercial shipping lanes has attenuated blue whale vocalization distances by over 60 percent (Clue: Shipping impact - 60%)</mark>.</p>' +
            '</div>'
          ) +
          '</div>';
      } else if (activeReviewTab === 'writing') {
        html += '' +
          '<div style="display:flex;flex-direction:column;gap:18px">' +
          '  <div style="background:var(--card);border:1.5px solid var(--border);border-radius:12px;padding:18px">' +
          '    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
          '      <b style="font-size:15px;color:#2563eb">Task 1: Academic Report (Band 9 Model)</b>' +
          '      <span style="font-size:11.5px;background:#10b981;color:#fff;padding:2px 8px;border-radius:10px;font-weight:700">Band 9.0</span>' +
          '    </div>' +
          '    <p style="font-size:13.5px;color:var(--muted);margin-bottom:10px"><b>Prompt:</b> The chart illustrates global renewable energy adoption between 2010 and 2025.</p>' +
          '    <div style="background:var(--bg2);padding:14px;border-radius:8px;font-size:13.5px;line-height:1.6">' +
          '      The provided line graph delineates the trajectory of renewable energy generation across solar, wind, and hydroelectric sectors over a fifteen-year timeframe spanning from 2010 to 2025.<br><br>' +
          '      <b>Overall</b>, it is unequivocally manifest that while hydroelectric power maintained the preeminent volume throughout the initial phase, solar energy exhibited the most conspicuous and exponential surge, ultimately eclipsing all rival counterparts by the terminus of the period.<br><br>' +
          '      In 2010, hydroelectric output stood decisively at 800 gigawatt-hours, substantially overshadowing solar (50 GWh) and wind (120 GWh). However, commencing in 2018, solar installations accelerated sharply, soaring to an unprecedented 1,400 GWh by 2025.' +
          '    </div>' +
          '  </div>' +
          '  <div style="background:var(--card);border:1.5px solid var(--border);border-radius:12px;padding:18px">' +
          '    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
          '      <b style="font-size:15px;color:#ea580c">Task 2: Academic Essay (Band 9 Model)</b>' +
          '      <span style="font-size:11.5px;background:#10b981;color:#fff;padding:2px 8px;border-radius:10px;font-weight:700">Band 9.0</span>' +
          '    </div>' +
          '    <p style="font-size:13.5px;color:var(--muted);margin-bottom:10px"><b>Topic:</b> Should governments provide free tertiary education for all citizens?</p>' +
          '    <div style="background:var(--bg2);padding:14px;border-radius:8px;font-size:13.5px;line-height:1.6">' +
          '      The question of whether higher education should be universally subsidized by the state remains a subject of vigorous socio-economic debate. While detractors cite the exorbitant fiscal burden upon public coffers, I firmly contend that free tertiary education yields transformative dividend yields for national innovation, meritocratic social mobility, and systemic economic prosperity.<br><br>' +
          '      Primarily, removing pecuniary barriers democratizes access to knowledge. When universities assess candidates strictly upon intellectual aptitude rather than socioeconomic background, nations cultivate their most capable minds regardless of demographic origin...' +
          '    </div>' +
          '  </div>' +
          '</div>';
      } else {
        html += '' +
          '<div style="display:flex;flex-direction:column;gap:10px">' +
          breakdown.map(function(item) {
            return '' +
              '<div style="padding:12px 16px;border-radius:10px;background:var(--bg2);border:1px solid ' + (item.isCorrect ? '#22c55e' : '#ef4444') + ';display:flex;justify-content:space-between;align-items:center">' +
              '  <div>' +
              '    <b style="font-size:13.5px">#' + item.qNum + '. ' + esc(item.question) + '</b>' +
              '    <div style="font-size:12.5px;margin-top:4px">' +
              '      <span style="color:' + (item.isCorrect ? '#16a34a' : '#ef4444') + '">Sizning javobingiz: <b>' + esc(item.userAns) + '</b></span> · ' +
              '      <span style="color:#16a34a">To\'g\'ri javob: <b>' + esc(item.correctAns) + '</b></span>' +
              '    </div>' +
              '  </div>' +
              '  <span style="font-weight:800;font-size:13px;color:' + (item.isCorrect ? '#16a34a' : '#ef4444') + '">' +
              (item.isCorrect ? '✓ To\'g\'ri' : '✗ Xato') +
              '  </span>' +
              '</div>';
          }).join('') +
          '</div>';
      }

      html += '' +
        '  </div>' +
        '  <div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end">' +
        '    <button type="button" class="eth-btn-primary" id="btnExitReviewModal" style="padding:8px 20px">Yopish</button>' +
        '  </div>' +
        '</div>';

      overlay.innerHTML = html;

      overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
      var closeBtn = overlay.querySelector('#btnCloseIeltsReview');
      if (closeBtn) closeBtn.onclick = function() { overlay.remove(); };
      var exitBtn = overlay.querySelector('#btnExitReviewModal');
      if (exitBtn) exitBtn.onclick = function() { overlay.remove(); };

      var tTrans = overlay.querySelector('#tabReviewTranscripts');
      if (tTrans) tTrans.onclick = function() { activeReviewTab = 'transcripts'; renderContent(); };
      var tRead = overlay.querySelector('#tabReviewReading');
      if (tRead) tRead.onclick = function() { activeReviewTab = 'reading'; renderContent(); };
      var tWrite = overlay.querySelector('#tabReviewWriting');
      if (tWrite) tWrite.onclick = function() { activeReviewTab = 'writing'; renderContent(); };
      var tQuest = overlay.querySelector('#tabReviewQuestions');
      if (tQuest) tQuest.onclick = function() { activeReviewTab = 'questions'; renderContent(); };
    }

    renderContent();
    document.body.appendChild(overlay);
  }

  function renderIeltsHub(container, activeTab) {
    var curTab = activeTab || 'full_mock';
    if (curTab === 'ielts_hub' || curTab === 'ielts') curTab = 'full_mock';
    if (curTab.indexOf('ielts_') === 0) curTab = curTab.replace('ielts_', '');

    var tabs = [
      { id: 'full_mock', label: '🔥 IELTS Full Mock', badge: 'Simulyator' },
      { id: 'reading', label: '📖 Reading', badge: 'Passages · 40 Qs' },
      { id: 'writing', label: '✍️ Writing', badge: 'Task 1 & 2' },
      { id: 'listening', label: '🎧 Listening', badge: '4 Sections · 40 Qs' },
      { id: 'speaking', label: '🎙️ Speaking', badge: 'Parts 1-3' }
    ];

    var html = '' +
      '<div class="ap-sec" style="margin-top:0">' +
      '  <div>' +
      '    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
      '      <span style="background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff;font-weight:800;font-size:11.5px;padding:3px 10px;border-radius:10px">OFFICIAL IELTS HUB</span>' +
      '      <span style="font-size:12px;color:var(--muted)">Cambridge 18 & 19 Standards</span>' +
      '    </div>' +
      '    <h2>' + ic('flame') + ' IELTS Practice & Full Mock Simulator</h2>' +
      '    <p>Practice all 4 skills. Full anti-cheat proctoring & shroud during test; in-depth script and clue analysis upon completion.</p>' +
      '  </div>' +
      '</div>' +
      '<div class="eth-tabs" style="margin:0 0 20px 0">' +
      tabs.map(function(t) {
        return '<button class="eth-tab ' + (t.id === curTab ? 'active' : '') + '" data-ielts-tab="' + t.id + '">' + t.label + ' <span style="font-size:10px;opacity:0.75;margin-left:4px">(' + t.badge + ')</span></button>';
      }).join('') +
      '</div>';

    if (curTab === 'full_mock') {
      html += '' +
        '<div class="eth-full-mock-fire-card" id="btnLaunchFullMock1">' +
        '  <div class="eth-fire-badge">🔥 OFFICIAL IELTS FULL MOCK SIMULATOR 2026</div>' +
        '  <h2>IELTS Academic Full Mock Exam (Test 1)</h2>' +
        '  <p>To\'liq 4 ta ko\'nikmani o\'z ichiga olgan haqiqiy Cambridge imtihoni simulyatsiyasi. 165 daqiqa davomida listening, reading, writing va speaking topshiriqlari qat\'iy 35° proctor nazoratida o\'tkaziladi.</p>' +
        '  <div class="eth-full-mock-specs">' +
        '    <div class="eth-mock-spec-item"><b>🎧 Listening</b><span>4 Sections · 40 Qs · 30 min</span></div>' +
        '    <div class="eth-mock-spec-item"><b>📖 Reading</b><span>3 Passages · 40 Qs · 60 min</span></div>' +
        '    <div class="eth-mock-spec-item"><b>✍️ Writing</b><span>Task 1 & Task 2 · 60 min</span></div>' +
        '    <div class="eth-mock-spec-item"><b>🎙️ Speaking</b><span>Parts 1, 2, 3 · 15 min</span></div>' +
        '  </div>' +
        '  <div style="margin-top:20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">' +
        '    <div style="font-size:12.5px;color:rgba(255,255,255,0.75)">💡 Sinov paytida javoblar va audio matnlari yashiriladi. Test tugagach to\'liq skript tahlili ochiladi.</div>' +
        '    <button type="button" class="eth-full-mock-btn">Full Mock Testini Boshlash ' + ic('right') + '</button>' +
        '  </div>' +
        '</div>' +
        '<div class="eth-full-mock-fire-card" id="btnLaunchFullMock2" style="background:linear-gradient(135deg, #1e1b4b 0%, #311042 50%, #451a03 100%);border-color:rgba(217,119,6,0.6)">' +
        '  <div class="eth-fire-badge" style="background:linear-gradient(135deg, #d97706, #b45309)">⚡ CAMBRIDGE 19 RECENT SIMULATOR</div>' +
        '  <h2>IELTS Academic Full Mock Exam (Test 2)</h2>' +
        '  <p>Eng so\'nggi 2026-yilgi aktual topshiriqlar to\'plami. Ilmiy matnlar, xaritalar va murakkab grafiklar bilan to\'liq formatdagi simulyator.</p>' +
        '  <div class="eth-full-mock-specs">' +
        '    <div class="eth-mock-spec-item"><b>🎧 Listening</b><span>Academic Dialogues · 40 Qs</span></div>' +
        '    <div class="eth-mock-spec-item"><b>📖 Reading</b><span>High Density Passages · 40 Qs</span></div>' +
        '    <div class="eth-mock-spec-item"><b>✍️ Writing</b><span>Process Diagram & Opinion Essay</span></div>' +
        '    <div class="eth-mock-spec-item"><b>🎙️ Speaking</b><span>AI Interactive Examiner</span></div>' +
        '  </div>' +
        '  <div style="margin-top:20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">' +
        '    <div style="font-size:12.5px;color:rgba(255,255,255,0.75)">⏱ Umumiy vaqt: 165 daqiqa · Kamera va ekran qat\'iy bloklanadi</div>' +
        '    <button type="button" class="eth-full-mock-btn">Full Mock Test 2 Boshlash ' + ic('right') + '</button>' +
        '  </div>' +
        '</div>';
    } else if (curTab === 'reading') {
      html += '' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px">' +
        '  <div class="ap-card" style="padding:20px;border-radius:16px;display:flex;flex-direction:column;justify-content:space-between">' +
        '    <div>' +
        '      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
        '        <span class="eth-badge-open" style="background:rgba(37,99,235,0.1);color:#2563eb;font-size:11px;font-weight:700">Academic Reading</span>' +
        '        <span style="font-size:12px;color:var(--muted)">⏱ 60 daqiqa</span>' +
        '      </div>' +
        '      <h3 style="font-size:17px;margin:0 0 6px">Academic Reading Practice Test 1</h3>' +
        '      <p style="font-size:13px;color:var(--muted);line-height:1.5;margin:0 0 12px">Passage 1: Architecture · Passage 2: Marine Biology · Passage 3: Human Memory.</p>' +
        '      <div style="font-size:12px;background:var(--bg2);padding:8px 12px;border-radius:8px;margin-bottom:14px">' +
        '        📚 <b>40 ta savol:</b> True/False/Not Given, Matching, Summary completion' +
        '      </div>' +
        '    </div>' +
        '    <button class="eth-btn-primary" id="btnStartReading1" style="width:100%;padding:10px;font-weight:700">Testni Boshlash (60 min) ' + ic('right') + '</button>' +
        '  </div>' +
        '  <div class="ap-card" style="padding:20px;border-radius:16px;display:flex;flex-direction:column;justify-content:space-between">' +
        '    <div>' +
        '      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
        '        <span class="eth-badge-open" style="background:rgba(37,99,235,0.1);color:#2563eb;font-size:11px;font-weight:700">Academic Reading</span>' +
        '        <span style="font-size:12px;color:var(--muted)">⏱ 60 daqiqa</span>' +
        '      </div>' +
        '      <h3 style="font-size:17px;margin:0 0 6px">Academic Reading Practice Test 2</h3>' +
        '      <p style="font-size:13px;color:var(--muted);line-height:1.5;margin:0 0 12px">Passage 1: Ancient Agriculture · Passage 2: Sports Psychology · Passage 3: AI & Linguistics.</p>' +
        '      <div style="font-size:12px;background:var(--bg2);padding:8px 12px;border-radius:8px;margin-bottom:14px">' +
        '        📚 <b>40 ta savol:</b> Diagram Labelling, Multiple Choice, Sentence Completion' +
        '      </div>' +
        '    </div>' +
        '    <button class="eth-btn-primary" id="btnStartReading2" style="width:100%;padding:10px;font-weight:700">Testni Boshlash (60 min) ' + ic('right') + '</button>' +
        '  </div>' +
        '</div>';
    } else if (curTab === 'writing') {
      html += '' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px">' +
        '  <div class="ap-card" style="padding:20px;border-radius:16px;display:flex;flex-direction:column;justify-content:space-between">' +
        '    <div>' +
        '      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
        '        <span class="eth-badge-open" style="background:rgba(234,88,12,0.1);color:#ea580c;font-size:11px;font-weight:700">Academic Writing</span>' +
        '        <span style="font-size:12px;color:var(--muted)">⏱ 60 daqiqa</span>' +
        '      </div>' +
        '      <h3 style="font-size:17px;margin:0 0 6px">IELTS Writing Practice Test 1</h3>' +
        '      <p style="font-size:13px;color:var(--muted);line-height:1.5;margin:0 0 12px"><b>Task 1:</b> Renewable energy graph (150 words). <b>Task 2:</b> Free tertiary education essay (250 words).</p>' +
        '      <div style="font-size:12px;background:var(--bg2);padding:8px 12px;border-radius:8px;margin-bottom:14px">' +
        '        ✍️ Jonli so\'z hisoblagich, mezonlar bo\'yicha avtomatik AI tahlil va Band 9 namuna' +
        '      </div>' +
        '    </div>' +
        '    <button class="eth-btn-primary" id="btnStartWriting1" style="width:100%;padding:10px;font-weight:700">Writing Testini Boshlash ' + ic('right') + '</button>' +
        '  </div>' +
        '</div>';
    } else if (curTab === 'listening') {
      html += '' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px">' +
        '  <div class="ap-card" style="padding:20px;border-radius:16px;display:flex;flex-direction:column;justify-content:space-between">' +
        '    <div>' +
        '      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
        '        <span class="eth-badge-open" style="background:rgba(16,185,129,0.1);color:#10b981;font-size:11px;font-weight:700">IELTS Listening</span>' +
        '        <span style="font-size:12px;color:var(--muted)">⏱ 35 daqiqa</span>' +
        '      </div>' +
        '      <h3 style="font-size:17px;margin:0 0 6px">IELTS Listening Practice Test 1</h3>' +
        '      <p style="font-size:13px;color:var(--muted);line-height:1.5;margin:0 0 12px">Section 1: Rental Booking · Section 2: Botanical Tour · Section 3: Student Research · Section 4: Academic Lecture.</p>' +
        '      <div style="font-size:12px;background:var(--bg2);padding:8px 12px;border-radius:8px;margin-bottom:14px">' +
        '        🎧 <b>40 ta savol:</b> Audio faqat belgilangan marta eshittiriladi. Tugagach to\'liq skript ochiladi.' +
        '      </div>' +
        '    </div>' +
        '    <button class="eth-btn-primary" id="btnStartListening1" style="width:100%;padding:10px;font-weight:700">Listening Testini Boshlash ' + ic('right') + '</button>' +
        '  </div>' +
        '</div>';
    } else if (curTab === 'speaking') {
      html += '' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px">' +
        '  <div class="ap-card" style="padding:20px;border-radius:16px;display:flex;flex-direction:column;justify-content:space-between">' +
        '    <div>' +
        '      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
        '        <span class="eth-badge-open" style="background:rgba(139,92,246,0.1);color:#8b5cf6;font-size:11px;font-weight:700">Speaking Simulator</span>' +
        '        <span style="font-size:12px;color:var(--muted)">⏱ 14 daqiqa</span>' +
        '      </div>' +
        '      <h3 style="font-size:17px;margin:0 0 6px">IELTS Speaking Full Simulator Test 1</h3>' +
        '      <p style="font-size:13px;color:var(--muted);line-height:1.5;margin:0 0 12px">Part 1: Hometown & Routines · Part 2: Impressive Architecture · Part 3: Urban Design & Heritage.</p>' +
        '      <div style="font-size:12px;background:var(--bg2);padding:8px 12px;border-radius:8px;margin-bottom:14px">' +
        '        🎙️ Interaktiv audio/matnli AI imtihon oluvchi va Band 9 mezonlari tahlili' +
        '      </div>' +
        '    </div>' +
        '    <button class="eth-btn-primary" id="btnStartSpeaking1" style="width:100%;padding:10px;font-weight:700">Speaking Testini Boshlash ' + ic('right') + '</button>' +
        '  </div>' +
        '</div>';
    }

    container.innerHTML = html;

    // Tab switching
    container.querySelectorAll('[data-ielts-tab]').forEach(function(btn) {
      btn.onclick = function() {
        renderIeltsHub(container, btn.dataset.ieltsTab);
      };
    });

    function launchTest(type, num) {
      var isFullMock = (type === 'full_mock');
      var sampleQuestions = [];
      if (type === 'reading' || isFullMock) {
        sampleQuestions = [
          { question: "Modernist architecture was initially welcomed enthusiastically by urban councils.", options: ["True", "False", "Not Given"], answer: "False", type: "choice", points: 1 },
          { question: "What industrial material primarily accelerated early modernist structural design?", options: ["reinforced concrete", "timber frames", "quarried sandstone", "bronze panels"], answer: "reinforced concrete", type: "choice", points: 1 },
          { question: "Shipping noise has reduced whale acoustic transmission distances by ____ percent.", options: ["40", "50", "60", "70"], answer: "60", type: "choice", points: 1 },
          { question: "Architects turned towards minimalism because of a rejection of historic ornate decorations.", options: ["True", "False", "Not Given"], answer: "True", type: "choice", points: 1 }
        ];
      }
      if (type === 'listening' || isFullMock) {
        sampleQuestions = sampleQuestions.concat([
          { question: "The studio apartment on Green Street costs £___ per month.", options: [], answer: "450", type: "written", points: 1 },
          { question: "What type of parking facility is available for residents?", options: ["underground", "street-level", "valet", "none"], answer: "underground", type: "choice", points: 1 },
          { question: "The caller\'s surname is spelt: H-A-R-L-I-N-G-T-O-N.", options: ["True", "False"], answer: "True", type: "bool", points: 1 },
          { question: "The Orchid House is located immediately ___ of the central lake.", options: ["north", "south", "east", "west"], answer: "north", type: "choice", points: 1 }
        ]);
      }
      if (type === 'writing' || isFullMock) {
        sampleQuestions = sampleQuestions.concat([
          { question: "Writing Task 1: Summarize the main features and trends of the renewable energy adoption chart (150 words minimum):", options: [], answer: "Overall, solar energy demonstrated exponential growth...", type: "written", points: 5 },
          { question: "Writing Task 2: To what extent do you agree that higher education should be free for all citizens? Write your essay (250 words minimum):", options: [], answer: "In conclusion, free higher education democratizes intellectual development...", type: "written", points: 10 }
        ]);
      }
      if (type === 'speaking' || isFullMock) {
        sampleQuestions = sampleQuestions.concat([
          { question: "Speaking Part 1: How has your hometown transformed over the past decade?", options: [], answer: "My hometown has modernized with advanced infrastructure...", type: "written", points: 3 },
          { question: "Speaking Part 2 (Cue Card): Describe an impressive architectural landmark you have visited:", options: [], answer: "I would like to describe the Registan Square in Samarkand...", type: "written", points: 5 }
        ]);
      }

      var testExam = {
        id: 'ielts_exam_' + type + '_' + num + '_' + Date.now(),
        code: 'IELTS-' + num,
        title: (isFullMock ? 'IELTS Academic Full Mock Exam ' + num : 'IELTS ' + type.charAt(0).toUpperCase() + type.slice(1) + ' Test ' + num),
        duration: isFullMock ? 165 : (type === 'reading' ? 60 : (type === 'writing' ? 60 : (type === 'listening' ? 35 : 15))),
        pointsPerQ: 1,
        questions: sampleQuestions,
        isIelts: true,
        hasScriptAnalysis: true,
        audioMaxPlays: 1,
        isPublic: true,
        maxAttempts: 3,
        submissions: []
      };

      startExamRunner(testExam, container);
    }

    var fm1 = document.getElementById('btnLaunchFullMock1');
    if (fm1) fm1.onclick = function() { launchTest('full_mock', 1); };
    var fm2 = document.getElementById('btnLaunchFullMock2');
    if (fm2) fm2.onclick = function() { launchTest('full_mock', 2); };
    var r1 = document.getElementById('btnStartReading1');
    if (r1) r1.onclick = function() { launchTest('reading', 1); };
    var r2 = document.getElementById('btnStartReading2');
    if (r2) r2.onclick = function() { launchTest('reading', 2); };
    var w1 = document.getElementById('btnStartWriting1');
    if (w1) w1.onclick = function() { launchTest('writing', 1); };
    var l1 = document.getElementById('btnStartListening1');
    if (l1) l1.onclick = function() { launchTest('listening', 1); };
    var s1 = document.getElementById('btnStartSpeaking1');
    if (s1) s1.onclick = function() { launchTest('speaking', 1); };
  }


  // Teacher Exam Edit Modal with Real-time Sync
  function showEditExamModal(exam, container) {
    var overlay = document.createElement('div');
    overlay.className = 'eth-modal-overlay';
    overlay.style.zIndex = '2147483648';

    var tempExam = JSON.parse(JSON.stringify(exam));
    if (!tempExam.questions) tempExam.questions = [];

    function renderEditForm() {
      var html = '' +
        '<div class="eth-modal eth-exam-edit-modal">' +
        '  <button type="button" class="eth-modal-close-btn" id="btnCloseEditModal">✕</button>' +
        '  <div class="eth-modal-header">' +
        '    <h2>✏️ Imtihonni Tahrirlash</h2>' +
        '    <p>O\'zgartirishlar saqlangach, barcha o\'quvchilar ekranida real vaqtda yangilanadi (Kod: <b>' + tempExam.code + '</b>)</p>' +
        '  </div>' +
        '  <div class="eth-modal-body">' +
        '    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">' +
        '      <div class="eth-form-group">' +
        '        <label>Imtihon Nomi (Title)</label>' +
        '        <input type="text" id="editExTitle" value="' + esc(tempExam.title) + '" required />' +
        '      </div>' +
        '      <div class="eth-form-group">' +
        '        <label>Davomiyligi (Daqiqada)</label>' +
        '        <input type="number" id="editExDuration" value="' + tempExam.duration + '" min="5" max="180" required />' +
        '      </div>' +
        '    </div>' +
        '    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">' +
        '      <div class="eth-form-group">' +
        '        <label>Ko\'rinishi (Visibility)</label>' +
        '        <select id="editExVis">' +
        '          <option value="public" ' + (tempExam.isPublic ? 'selected' : '') + '>🌐 Public (Ochiq)</option>' +
        '          <option value="private" ' + (!tempExam.isPublic ? 'selected' : '') + '>🔒 Private (Faqat 6 xonali kod bilan)</option>' +
        '        </select>' +
        '      </div>' +
        '      <div class="eth-form-group">' +
        '        <label>Har bir savol bali (Points per Q)</label>' +
        '        <input type="number" id="editExPts" value="' + (tempExam.pointsPerQ || 2) + '" min="1" max="20" />' +
        '      </div>' +
        '    </div>' +
        '    <div style="display:flex;justify-content:space-between;align-items:center;margin:18px 0 10px">' +
        '      <h4 style="margin:0;font-size:15.5px">Savollar Ro\'yxati (' + tempExam.questions.length + ' ta savol):</h4>' +
        '      <button type="button" class="ap-btn out" id="btnAddQInEdit" style="padding:6px 14px;font-size:12.5px">+ Yangi Savol Qo\'shish</button>' +
        '    </div>' +
        '    <div id="editQuestionsList" style="display:flex;flex-direction:column;gap:12px;max-height:48vh;overflow-y:auto;padding-right:4px">';

      tempExam.questions.forEach(function(q, qIdx) {
        var t = q.type || 'choice';
        html += '' +
          '<div class="eth-q-edit-card">' +
          '  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
          '    <span style="font-weight:800;font-size:13px;color:#2563eb">#' + (qIdx + 1) + '-Savol</span>' +
          '    <div style="display:flex;gap:8px;align-items:center">' +
          '      <select class="q-edit-type" data-qidx="' + qIdx + '" style="padding:4px 8px;font-size:12px;border-radius:6px;border:1px solid var(--border)">' +
          '        <option value="choice" ' + (t === 'choice' ? 'selected' : '') + '>🔘 Variantli (A,B,C,D)</option>' +
          '        <option value="bool" ' + (t === 'bool' ? 'selected' : '') + '>☑️ True / False</option>' +
          '        <option value="written" ' + (t === 'written' ? 'selected' : '') + '>✍️ Qisqa Yozma (Gap fill)</option>' +
          '        <option value="writing" ' + (t === 'writing' ? 'selected' : '') + '>📝 Insho (Writing Task)</option>' +
          '      </select>' +
          '      <button type="button" class="ap-btn danger btn-del-q" data-qidx="' + qIdx + '" style="padding:4px 8px;font-size:11px;color:#ef4444">O\'chirish</button>' +
          '    </div>' +
          '  </div>' +
          '  <div class="eth-form-group" style="margin-bottom:8px">' +
          '    <textarea class="q-edit-text" data-qidx="' + qIdx + '" rows="2" style="width:100%;box-sizing:border-box;padding:8px 10px;font-size:13.5px;border-radius:8px;border:1px solid var(--border)" placeholder="Savol matni...">' + esc(q.question) + '</textarea>' +
          '  </div>';

        if (t === 'choice') {
          var opts = q.options || ['', '', '', ''];
          while (opts.length < 4) opts.push('');
          html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">';
          opts.forEach(function(opt, oIdx) {
            var letter = String.fromCharCode(65 + oIdx);
            html += '' +
              '<div style="display:flex;align-items:center;gap:6px">' +
              '  <b style="font-size:12px;min-width:18px">' + letter + ')</b>' +
              '  <input type="text" class="q-edit-opt" data-qidx="' + qIdx + '" data-oidx="' + oIdx + '" value="' + esc(opt) + '" style="flex:1;padding:6px 8px;font-size:12.5px;border-radius:6px;border:1px solid var(--border)" placeholder="Variant ' + letter + '" />' +
              '</div>';
          });
          html += '</div>';
          html += '<div style="display:flex;align-items:center;gap:8px;font-size:13px">' +
            '  <span>To\'g\'ri javob:</span>' +
            '  <input type="text" class="q-edit-ans" data-qidx="' + qIdx + '" value="' + esc(q.answer) + '" style="flex:1;padding:6px 8px;font-size:12.5px;border-radius:6px;border:1px solid var(--border)" placeholder="Variant matni yoki harfi..." />' +
            '</div>';
        } else if (t === 'bool') {
          html += '<div style="display:flex;align-items:center;gap:12px;font-size:13px">' +
            '  <span>To\'g\'ri javob:</span>' +
            '  <select class="q-edit-ans" data-qidx="' + qIdx + '" style="padding:6px 12px;border-radius:6px;border:1px solid var(--border)">' +
            '    <option value="True" ' + (q.answer === 'True' ? 'selected' : '') + '>True</option>' +
            '    <option value="False" ' + (q.answer === 'False' ? 'selected' : '') + '>False</option>' +
            '  </select>' +
            '</div>';
        } else {
          html += '<div style="display:flex;align-items:center;gap:8px;font-size:13px">' +
            '  <span>' + (t === 'writing' ? 'Baholash mezoni / kalit so\'zlar:' : 'To\'g\'ri javob:') + '</span>' +
            '  <input type="text" class="q-edit-ans" data-qidx="' + qIdx + '" value="' + esc(q.answer) + '" style="flex:1;padding:6px 8px;font-size:12.5px;border-radius:6px;border:1px solid var(--border)" placeholder="To\'g\'ri javob..." />' +
            '</div>';
        }

        html += '</div>';
      });

      html += '' +
        '    </div>' +
        '  </div>' +
        '  <div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:10px">' +
        '    <button type="button" class="ap-btn out" id="btnCancelEdit">Bekor Qilish</button>' +
        '    <button type="button" class="eth-btn-primary" id="btnSaveEditLive" style="padding:10px 22px;font-weight:800">💾 Saqlash va Real Vaqtda Tarqatish</button>' +
        '  </div>' +
        '</div>';

      overlay.innerHTML = html;
      bindEditEvents();
    }

    function syncFormToTemp() {
      var tIn = overlay.querySelector('#editExTitle');
      var dIn = overlay.querySelector('#editExDuration');
      var vIn = overlay.querySelector('#editExVis');
      var pIn = overlay.querySelector('#editExPts');
      if (tIn) tempExam.title = tIn.value.trim() || tempExam.title;
      if (dIn) tempExam.duration = parseInt(dIn.value, 10) || tempExam.duration;
      if (vIn) tempExam.isPublic = (vIn.value === 'public');
      if (pIn) tempExam.pointsPerQ = parseInt(pIn.value, 10) || tempExam.pointsPerQ;

      overlay.querySelectorAll('.q-edit-text').forEach(function(ta) {
        var idx = parseInt(ta.dataset.qidx, 10);
        if (tempExam.questions[idx]) tempExam.questions[idx].question = ta.value.trim();
      });

      overlay.querySelectorAll('.q-edit-opt').forEach(function(inp) {
        var qIdx = parseInt(inp.dataset.qidx, 10);
        var oIdx = parseInt(inp.dataset.oidx, 10);
        if (tempExam.questions[qIdx]) {
          if (!tempExam.questions[qIdx].options) tempExam.questions[qIdx].options = [];
          tempExam.questions[qIdx].options[oIdx] = inp.value.trim();
        }
      });

      overlay.querySelectorAll('.q-edit-ans').forEach(function(inp) {
        var qIdx = parseInt(inp.dataset.qidx, 10);
        if (tempExam.questions[qIdx]) tempExam.questions[qIdx].answer = inp.value.trim();
      });
    }

    function bindEditEvents() {
      overlay.querySelector('#btnCloseEditModal').onclick = function() { overlay.remove(); };
      overlay.querySelector('#btnCancelEdit').onclick = function() { overlay.remove(); };

      overlay.querySelectorAll('.q-edit-type').forEach(function(sel) {
        sel.onchange = function() {
          syncFormToTemp();
          var idx = parseInt(sel.dataset.qidx, 10);
          tempExam.questions[idx].type = sel.value;
          if (sel.value === 'bool') {
            tempExam.questions[idx].options = ['True', 'False'];
            tempExam.questions[idx].answer = 'True';
          } else if (sel.value === 'choice' && (!tempExam.questions[idx].options || tempExam.questions[idx].options.length === 0)) {
            tempExam.questions[idx].options = ['', '', '', ''];
          }
          renderEditForm();
        };
      });

      overlay.querySelectorAll('.btn-del-q').forEach(function(btn) {
        btn.onclick = function() {
          syncFormToTemp();
          var idx = parseInt(btn.dataset.qidx, 10);
          if (confirm("#" + (idx + 1) + "-savolni o\'chirishga ishonchingiz komilmi?")) {
            tempExam.questions.splice(idx, 1);
            renderEditForm();
          }
        };
      });

      var addBtn = overlay.querySelector('#btnAddQInEdit');
      if (addBtn) {
        addBtn.onclick = function() {
          syncFormToTemp();
          tempExam.questions.push({
            type: 'choice',
            question: 'Yangi savol matni',
            options: ['Variant A', 'Variant B', 'Variant C', 'Variant D'],
            answer: 'Variant A',
            points: tempExam.pointsPerQ || 2
          });
          renderEditForm();
        };
      }

      var saveBtn = overlay.querySelector('#btnSaveEditLive');
      if (saveBtn) {
        saveBtn.onclick = function() {
          syncFormToTemp();
          if (!tempExam.title) { alert("Iltimos, imtihon nomini kiriting!"); return; }
          if (!tempExam.questions || tempExam.questions.length === 0) { alert("Kamida 1 ta savol bo\'lishi shart!"); return; }

          var exIdx = (S.exams || []).findIndex(function(x) {
            return (x.id && exam.id && String(x.id) === String(exam.id)) ||
                   (x.code && exam.code && String(x.code).trim() === String(exam.code).trim());
          });

          exam.title = tempExam.title;
          exam.duration = tempExam.duration;
          exam.isPublic = tempExam.isPublic;
          exam.pointsPerQ = tempExam.pointsPerQ;
          exam.questions = tempExam.questions;

          if (exIdx > -1) {
            S.exams[exIdx] = exam;
          } else {
            S.exams.push(exam);
          }

          App.saveState();

          if (window.EthithSync) {
            window.EthithSync.publishLive({
              type: 'EXAM_UPDATED',
              exam: exam
            });
            window.EthithSync.broadcastLocal(S.classes, S.exams);
            window.EthithSync.pushRemoteStore();
          }

          overlay.remove();
          alert("Imtihon muvaffaqiyatli saqlandi va real vaqtda barcha talabalarda yangilandi!");
          renderExamsView(container);
        };
      }
    }

    renderEditForm();
    document.body.appendChild(overlay);
  }

  // Level Progression Tests View (Dedicated Hub for CEFR Transitions)
  function renderProgressionTestsView(container) {
    window._ethithCurrentView = 'progression';
    var isTeacher = S.user && S.user.role === 'teacher';
    var levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
    var NEXT_LEVEL = { A1: 'A2', A2: 'B1', B1: 'B2', B2: 'C1', C1: 'C2' };
    var activeTrans = S._activeProgTab || 'A1';

    window._ethithRefreshProgressionTests = function() {
      var apView = document.getElementById('apView');
      if (window._ethithCurrentView === 'progression' && apView) {
        renderProgressionTestsView(apView);
      }
    };

    function renderView() {
      var nextLv = NEXT_LEVEL[activeTrans] || 'Keyingi';
      var customTrans = (S.exams || []).filter(function(e) {
        return e.isLevelTransition && (e.levelFrom === activeTrans || (!e.levelFrom && activeTrans === 'A1'));
      });

      var html = '' +
        '<div class="ap-sec" style="margin-top:0">' +
        '  <div>' +
        '    <h2>' + ic('trophy') + ' CEFR Level Progression Tests (Daraja O\'tish Imtihonlari)</h2>' +
        '    <p>Har bir CEFR darajasidan keyingi darajaga o\'tish uchun rasmiy sinov va o\'qituvchilar yaratgan testlar.</p>' +
        '  </div>' +
        (isTeacher ?
          '  <button class="eth-btn-primary" id="btnCreateProgExam" style="padding:10px 18px;font-weight:800;background:linear-gradient(135deg,#2563eb,#4f46e5)">🎓 Yangi Daraja O\'tish Testi Yaratish</button>' : '') +
        '</div>' +
        '<div class="eth-tabs" style="margin:0 0 20px 0">';

      levels.forEach(function(lv) {
        var nLv = NEXT_LEVEL[lv];
        html += '<button class="eth-tab ' + (lv === activeTrans ? 'active' : '') + '" data-prog-tab="' + lv + '">' + lv + ' ➔ ' + nLv + ' Transition</button>';
      });

      html += '</div>' +
        '<div class="eth-progression-hero">' +
        '  <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
        '    <span style="background:rgba(255,255,255,0.2);padding:3px 10px;border-radius:12px;font-size:12px;font-weight:800">🏆 Rasmiy CEFR Imtihoni</span>' +
        '    <span class="eth-badge-open" style="font-size:11.5px;font-weight:700">30 Savol · 90 Daqiqa</span>' +
        '  </div>' +
        '  <h2 style="font-size:22px;margin:0 0 6px;color:#fff">' + activeTrans + ' &rarr; ' + nextLv + ' Level Transition Exam</h2>' +
        '  <p style="margin:0 0 16px;opacity:0.9;font-size:14px;max-width:650px">' + activeTrans + ' darajasidagi barcha mavzularni o\'zlashtirganingizni tasdiqlash va rasman ' + nextLv + ' darajasiga ko\'tarilish uchun 30 savoldan iborat rasmiy imtihon.</p>' +
        '  <button class="ap-btn" id="btnStartOfficialProgExam" style="background:#fff;color:#1e3a8a;font-weight:800;padding:12px 24px;border-radius:12px;font-size:14px;border:none;cursor:pointer">Rasmiy Testni Boshlash &rarr;</button>' +
        '</div>';

      if (customTrans.length > 0) {
        html += '<h3 style="font-size:16px;margin:0 0 14px;display:flex;align-items:center;gap:8px"><span>👨‍🏫</span> <b>O\'qituvchilar yaratgan ' + activeTrans + ' ➔ ' + nextLv + ' testlari (' + customTrans.length + ' ta):</b></h3>' +
          '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px">';
        customTrans.forEach(function(ex) {
          html += '' +
            '<div class="eth-progression-card">' +
            '  <div>' +
            '    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
            '      <span style="font-size:11px;font-weight:800;padding:3px 9px;border-radius:10px;background:rgba(37,99,235,0.1);color:#2563eb">🎓 ' + esc(ex.levelFrom || activeTrans) + ' ➔ ' + esc(ex.levelTo || nextLv) + '</span>' +
            '      <span style="font-size:12px;color:var(--muted);display:inline-flex;align-items:center;gap:4px">Kod: <b style="color:var(--text)">' + esc(ex.code) + '</b> <button type="button" class="eth-copy-btn-mini" data-copy-code="' + ex.code + '" title="Kodni nusxalash">📋 Nusxalash</button></span>' +
            '    </div>' +
            '    <h4 style="margin:0 0 6px;font-size:16px">' + esc(ex.title) + '</h4>' +
            '    <div style="font-size:12px;color:var(--muted);display:flex;gap:12px;flex-wrap:wrap">' +
            '      <span>⏱ ' + ex.duration + ' daqiqa</span>' +
            '      <span>❓ ' + (ex.questions ? ex.questions.length : 0) + ' ta savol</span>' +
            '      <span>⭐ ' + (ex.pointsPerQ || 2) + ' ball/savol</span>' +
            '    </div>' +
            '  </div>' +
            '  <button class="eth-btn-primary" data-run-prog-ex="' + ex.id + '" style="width:100%;padding:10px;font-weight:800;font-size:13.5px">Testni Boshlash ' + ic('right') + '</button>' +
            '</div>';
        });
        html += '</div>';
      }

      container.innerHTML = html;

      container.querySelectorAll('[data-prog-tab]').forEach(function(tab) {
        tab.onclick = function() {
          activeTrans = tab.dataset.progTab;
          S._activeProgTab = activeTrans;
          renderView();
        };
      });

      var offBtn = container.querySelector('#btnStartOfficialProgExam');
      if (offBtn) {
        offBtn.onclick = function() {
          var examQuestions = (window.EthithQuizEngine && window.EthithQuizEngine.generateQuiz)
            ? window.EthithQuizEngine.generateQuiz(activeTrans, 1, 30)
            : [];
          if (!examQuestions || examQuestions.length === 0) {
            examQuestions = [
              { question: "Choose the correct " + activeTrans + " sentence structure.", options: ["She works every day", "She work every day", "She working every day", "She be working"], answer: "She works every day", points: 2 },
              { question: "Which connector best completes the passage?", options: ["however", "although", "despite", "furthermore"], answer: "however", points: 2 }
            ];
          }
          var transExam = {
            id: 'trans_exam_' + activeTrans + '_' + nextLv,
            code: activeTrans + '-' + nextLv,
            title: activeTrans + ' → ' + nextLv + ' Level Transition Exam',
            duration: 90,
            pointsPerQ: 2,
            questions: examQuestions,
            isPublic: true,
            maxAttempts: 5,
            submissions: []
          };
          startExamRunner(transExam, container);
        };
      }

      container.querySelectorAll('[data-run-prog-ex]').forEach(function(btn) {
        btn.onclick = function() {
          var exId = btn.dataset.runProgEx;
          var exObj = (S.exams || []).find(function(e) { return e.id === exId; });
          if (exObj) startExamRunner(exObj, container);
        };
      });

      var crBtn = container.querySelector('#btnCreateProgExam');
      if (crBtn) {
        crBtn.onclick = function() {
          showCreateExamModal(container, { isLevelTransition: true, levelFrom: activeTrans, levelTo: nextLv });
        };
      }
    }

    renderView();
  }

  
  // =========================================================================
  // ETHITH QUIZ TEST & LIVE BATTLE ARENA (1:1 WAYGROUND STUDIO & MULTIPLAYER)
  // =========================================================================

  function shuffleArray(arr) {
    if (!arr || !arr.length) return [];
    var copy = arr.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  // -------------------------------------------------------------------------
  // 1:1 WAYGROUND TEST STUDIO MODAL (SINGLE CHOICE, CHECKBOX & TRUE/FALSE)
  // -------------------------------------------------------------------------
  function showWaygroundStudioModal(opts) {
    opts = opts || {};
    var isExamImport = Boolean(opts.isExamImport);
    var addedQuestions = opts.existingQuestions ? JSON.parse(JSON.stringify(opts.existingQuestions)) : [];
    var quizTitle = opts.title || ('English Quiz Battle #' + (S.quizzes ? S.quizzes.length + 1 : 1));
    var quizCode = opts.code || generateRichExamCode('QZ');

    // Studio state
    var currentType = 'mcq'; // 'mcq' | 'checkbox' | 'bool'
    var currentPoints = 1;
    var currentTimeSec = 30;
    var questionText = '';
    var optionsList = ['', '', '', ''];
    var correctIndices = [0];

    var overlay = document.createElement('div');
    overlay.className = 'wayground-modal-overlay animate-fade-in';

    function renderStudio() {
      var typeLabels = {
        'mcq': 'Multiple choice',
        'checkbox': 'Checkbox (Ko\'p tanlovli)',
        'bool': 'True / False'
      };

      var html = '';

      // 1. TOP HEADER BAR - Modern Dark Glassmorphic
      html += '<header class="wayground-header-bar">';
      html += '  <div class="flex items-center gap-3">';
      html += '    <button id="btnWgBack" class="wayground-back-btn" title="Chiqish">';
      html += '      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>';
      html += '    </button>';
      
      // Question Types Dropdown
      html += '    <div class="relative">';
      html += '      <button id="btnWgTypeDropdown" class="wayground-dropdown-btn">';
      html += '        <span class="w-4 h-4 rounded bg-amber-500 text-white flex items-center justify-center text-[10px]">☑</span>';
      html += '        <span id="wgTypeLabelText">' + (typeLabels[currentType] || 'Multiple choice') + '</span>';
      html += '        <span class="text-[10px] ml-1">▾</span>';
      html += '      </button>';
      html += '      <div id="wgTypeDropdownMenu" class="hidden wayground-dropdown-menu">';
      html += '        <button class="wayground-dropdown-item" data-type="mcq"><span>🔘</span> Multiple choice (Yagona to\'g\'ri)</button>';
      html += '        <button class="wayground-dropdown-item" data-type="checkbox"><span>☑️</span> Checkbox (Ko\'p tanlovli)</button>';
      html += '        <button class="wayground-dropdown-item" data-type="bool"><span>⚖️</span> True / False (To\'g\'ri/Noto\'g\'ri)</button>';
      html += '      </div>';
      html += '    </div>';
      html += '  </div>';

      // Middle controls: Points & Timer
      html += '  <div class="flex items-center gap-2">';
      html += '    <select id="wgPointsSelect" class="wayground-select">';
      [1, 2, 3, 5, 10].forEach(function(pts) {
        html += '<option value="' + pts + '" ' + (currentPoints === pts ? 'selected' : '') + '>' + pts + ' point' + (pts > 1 ? 's' : '') + '</option>';
      });
      html += '    </select>';
      html += '    <select id="wgTimerSelect" class="wayground-select">';
      [10, 20, 30, 45, 60, 90].forEach(function(sec) {
        html += '<option value="' + sec + '" ' + (currentTimeSec === sec ? 'selected' : '') + '>' + sec + ' sec</option>';
      });
      html += '    </select>';
      html += '  </div>';

      // Right: Add Question & Final Save
      html += '  <div class="flex items-center gap-2.5">';
      html += '    <button id="btnWgAddQuestion" class="wayground-btn-add">';
      html += '      <span>➕ Add question (Savol qo\'shish)</span>';
      html += '    </button>';
      html += '    <button id="btnWgSaveAllFinal" class="wayground-btn-save">';
      html += '      <span>💾 Saqlash va Yakunlash</span>';
      html += '    </button>';
      html += '  </div>';
      html += '</header>';

      // 2. MAIN STUDIO CANVAS
      html += '<main class="wayground-studio-canvas">';

      // Modern Glassmorphic Sub-bar (Title & Code)
      html += '  <div class="wayground-subbar">';
      html += '    <div class="flex-1 w-full flex items-center gap-2.5">';
      html += '      <span class="wayground-label-amber">🎯 <span>Quiz Nomi:</span></span>';
      html += '      <input id="wgQuizTitleInput" type="text" value="' + esc(quizTitle) + '" placeholder="Quiz mavzusi yoki nomini kiriting..." class="flex-1 wayground-subbar-input" />';
      html += '    </div>';
      html += '    <div class="flex items-center gap-2">';
      html += '      <span class="wayground-label-cyan">🔑 <span>Maxsus Kod:</span></span>';
      html += '      <input id="wgQuizCodeInput" type="text" value="' + esc(quizCode) + '" class="w-36 wayground-subbar-input wayground-subbar-code text-center uppercase" />';
      html += '      <button id="btnWgRegenCode" class="wayground-regen-btn group" title="Yangi kod generatsiya qilish">';
      html += '        <svg class="w-4 h-4 text-cyan-300 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>';
      html += '      </button>';
      html += '    </div>';
      html += '  </div>';

      // Large Question Input Box (1:1 with Wayground aspect-ratio canvas)
      html += '  <div class="wayground-question-box">';
      html += '    <div class="text-xs uppercase font-black tracking-wide mb-2.5 flex items-center justify-between">';
      html += '      <span class="wayground-label-qtext"><span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span> Savol Matni:</span>';
      html += '      <span class="wayground-badge-shuffle">⚡ Variantlar har bir o\'quvchida avtomatik chalkashib tushadi</span>';
      html += '    </div>';
      html += '    <textarea id="wgQuestionTextInput" class="wayground-question-textarea" placeholder="Savol matnini bu yerga yozing (masalan: She ___ to school every day)...">' + esc(questionText) + '</textarea>';
      html += '  </div>';

      // Options Grid with Ambient Morphing Colors
      html += '  <div class="wayground-options-grid">';
      optionsList.forEach(function(optText, optIdx) {
        var isChecked = correctIndices.indexOf(optIdx) !== -1;
        var brandClass = 'wayground-brand-' + (optIdx % 6);
        var letter = String.fromCharCode(65 + optIdx);

        html += '<div class="wayground-option-card ' + brandClass + ' ' + (isChecked ? 'is-correct' : '') + '" data-opt-idx="' + optIdx + '">';
        html += '  <div class="wayground-card-topbar">';
        if (currentType !== 'bool') {
          html += '    <button class="wayground-trash-btn btnWgDeleteOption" data-opt-idx="' + optIdx + '" title="Variantni o\'chirish">';
          html += '      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>';
          html += '    </button>';
        } else {
          html += '    <span></span>';
        }
        html += '    <span class="font-black text-white/90 text-sm font-mono">' + letter + '</span>';
        html += '    <button class="wayground-check-btn ' + (isChecked ? 'checked' : '') + '" data-opt-idx="' + optIdx + '" title="To\'g\'ri javob deb belgilash">';
        html += '      <span>✓</span>';
        html += '    </button>';
        html += '  </div>';

        html += '  <textarea class="wayground-option-textarea wgOptTextInput" data-opt-idx="' + optIdx + '" placeholder="Variant matnini kiriting...">' + esc(optText) + '</textarea>';

        html += '  <div class="text-center text-[10px] font-extrabold text-white/80 tracking-wider uppercase">';
        html += (isChecked ? '✅ TO\'G\'RI JAVOB' : 'Tanlash uchun ptichkani bosing');
        html += '  </div>';
        html += '</div>';
      });

      // Dedicated "+" card to add an option (User Requirement)
      if (currentType !== 'bool') {
        html += '<div id="btnWgAddOptionCard" class="wayground-add-option-card" title="Yangi variant qo\'shish">';
        html += '  <div class="text-3xl font-black">+</div>';
        html += '  <div class="text-xs font-bold">Variant qo\'shish</div>';
        html += '</div>';
      }

      html += '  </div>';

      // Bottom Saved Questions List
      html += '  <div class="w-full max-w-[960px] bg-gray-900/90 rounded-2xl border border-gray-800 p-4 space-y-3">';
      html += '    <div class="flex items-center justify-between">';
      html += '      <div class="font-extrabold text-xs text-gray-300 uppercase tracking-wider flex items-center gap-2">';
      html += '        <span>📋 Qo\'shilgan Savollar:</span>';
      html += '        <span class="px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 text-xs font-black">' + addedQuestions.length + ' ta</span>';
      html += '      </div>';
      if (addedQuestions.length > 0) {
        html += '      <button id="btnWgClearAllAdded" class="text-xs font-bold text-rose-400 hover:text-rose-300">Tozalash</button>';
      }
      html += '    </div>';

      if (addedQuestions.length === 0) {
        html += '    <div class="p-6 text-center text-xs text-gray-500 border border-dashed border-gray-800 rounded-xl">';
        html += '      Hali savollar qo\'shilmadi. Yuqorida savol va variantlarni kiritib, "Add question" tugmasini bosing!';
        html += '    </div>';
      } else {
        html += '    <div class="space-y-2 max-h-64 overflow-y-auto pr-1">';
        addedQuestions.forEach(function(q, qIdx) {
          html += '<div class="p-3 bg-gray-800/80 rounded-xl border border-gray-700/80 flex items-start justify-between gap-3 text-xs">';
          html += '  <div class="space-y-1 flex-1">';
          html += '    <div class="font-black text-white">' + (qIdx + 1) + '. ' + q.question + '</div>';
          html += '    <div class="flex flex-wrap gap-2 text-[11px]">';
          q.options.forEach(function(opt, oIdx) {
            var isCorr = Array.isArray(q.correctAnswers) ? (q.correctAnswers.indexOf(oIdx) !== -1) : (oIdx === q.correctAnswer);
            html += '<span class="px-2 py-0.5 rounded ' + (isCorr ? 'bg-emerald-900/60 text-emerald-300 font-bold border border-emerald-700/50' : 'bg-gray-700 text-gray-300') + '">';
            html += String.fromCharCode(65 + oIdx) + ') ' + opt + (isCorr ? ' ✅' : '');
            html += '</span>';
          });
          html += '    </div>';
          html += '  </div>';
          html += '  <button class="btnWgDeleteSavedQ text-gray-400 hover:text-rose-400 font-bold p-1" data-q-idx="' + qIdx + '">✕</button>';
          html += '</div>';
        });
        html += '    </div>';
      }

      html += '  </div>';

      html += '</main>';

      overlay.innerHTML = html;

      // ATTACH LISTENERS
      var btnBack = overlay.querySelector('#btnWgBack');
      if (btnBack) btnBack.onclick = function() { overlay.remove(); };

      // Type dropdown toggle
      var btnType = overlay.querySelector('#btnWgTypeDropdown');
      var typeMenu = overlay.querySelector('#wgTypeDropdownMenu');
      if (btnType && typeMenu) {
        btnType.onclick = function(e) {
          e.stopPropagation();
          typeMenu.classList.toggle('hidden');
        };
        overlay.addEventListener('click', function() {
          if (!typeMenu.classList.contains('hidden')) typeMenu.classList.add('hidden');
        });
        typeMenu.querySelectorAll('button[data-type]').forEach(function(btn) {
          btn.onclick = function(e) {
            e.stopPropagation();
            var t = btn.getAttribute('data-type');
            currentType = t;
            if (t === 'bool') {
              optionsList = ['True', 'False'];
              correctIndices = [0];
            } else if (optionsList.length < 4) {
              optionsList = ['', '', '', ''];
              correctIndices = [0];
            }
            typeMenu.classList.add('hidden');
            renderStudio();
          };
        });
      }

      // Points and Timer
      var selPoints = overlay.querySelector('#wgPointsSelect');
      if (selPoints) {
        selPoints.onchange = function() { currentPoints = parseInt(selPoints.value, 10) || 1; };
      }
      var selTimer = overlay.querySelector('#wgTimerSelect');
      if (selTimer) {
        selTimer.onchange = function() { currentTimeSec = parseInt(selTimer.value, 10) || 30; };
      }

      // Title & Code inputs
      var inTitle = overlay.querySelector('#wgQuizTitleInput');
      if (inTitle) inTitle.oninput = function() { quizTitle = inTitle.value; };
      var inCode = overlay.querySelector('#wgQuizCodeInput');
      if (inCode) inCode.oninput = function() { quizCode = inCode.value.toUpperCase(); };

      var btnRegen = overlay.querySelector('#btnWgRegenCode');
      if (btnRegen) {
        btnRegen.onclick = function() {
          quizCode = generateRichExamCode('QZ');
          if (inCode) inCode.value = quizCode;
        };
      }

      // Question Text input
      var qTextInput = overlay.querySelector('#wgQuestionTextInput');
      if (qTextInput) {
        qTextInput.oninput = function() { questionText = qTextInput.value; };
      }

      // Option inputs
      overlay.querySelectorAll('.wgOptTextInput').forEach(function(optIn) {
        optIn.oninput = function() {
          var idx = parseInt(optIn.getAttribute('data-opt-idx'), 10);
          optionsList[idx] = optIn.value;
        };
      });

      // Checkmark button clicks ("Ptichka")
      overlay.querySelectorAll('.wayground-check-btn').forEach(function(chkBtn) {
        chkBtn.onclick = function(e) {
          e.stopPropagation();
          var idx = parseInt(chkBtn.getAttribute('data-opt-idx'), 10);
          if (currentType === 'checkbox') {
            var exist = correctIndices.indexOf(idx);
            if (exist !== -1) {
              if (correctIndices.length > 1) correctIndices.splice(exist, 1);
            } else {
              correctIndices.push(idx);
            }
          } else {
            correctIndices = [idx];
          }
          renderStudio();
        };
      });

      // Delete option button
      overlay.querySelectorAll('.btnWgDeleteOption').forEach(function(delBtn) {
        delBtn.onclick = function(e) {
          e.stopPropagation();
          var idx = parseInt(delBtn.getAttribute('data-opt-idx'), 10);
          if (optionsList.length <= 2) {
            alert("Kamida 2 ta variant bo\'lishi shart!");
            return;
          }
          optionsList.splice(idx, 1);
          correctIndices = correctIndices.filter(function(i) { return i !== idx; }).map(function(i) {
            return i > idx ? (i - 1) : i;
          });
          if (correctIndices.length === 0) correctIndices = [0];
          renderStudio();
        };
      });

      // "+" Add Option Card (User Requirement)
      var btnAddOpt = overlay.querySelector('#btnWgAddOptionCard');
      if (btnAddOpt) {
        btnAddOpt.onclick = function() {
          optionsList.push('');
          renderStudio();
        };
      }

      // Delete saved question
      overlay.querySelectorAll('.btnWgDeleteSavedQ').forEach(function(btn) {
        btn.onclick = function() {
          var idx = parseInt(btn.getAttribute('data-q-idx'), 10);
          addedQuestions.splice(idx, 1);
          renderStudio();
        };
      });

      // Clear all
      var btnClearAll = overlay.querySelector('#btnWgClearAllAdded');
      if (btnClearAll) {
        btnClearAll.onclick = function() {
          if (confirm("Barcha qo\'shilgan savollarni tozalashni xohlaysizmi?")) {
            addedQuestions = [];
            renderStudio();
          }
        };
      }

      // "Add question" button (User Requirement: automatic notification & append)
      var btnAddQuestion = overlay.querySelector('#btnWgAddQuestion');
      if (btnAddQuestion) {
        btnAddQuestion.onclick = function() {
          var trimmedQ = (questionText || '').trim();
          if (!trimmedQ) {
            alert("Iltimos, avval savol matnini kiriting!");
            if (qTextInput) qTextInput.focus();
            return;
          }

          var hasEmpty = optionsList.some(function(o) { return !o || !o.trim(); });
          if (hasEmpty) {
            alert("Iltimos, barcha variantlar matnini to\'liq kiriting!");
            return;
          }

          if (!correctIndices || correctIndices.length === 0) {
            alert("Iltimos, to\'g\'ri javob ustidagi ptichka (✓) belgisini bosing!");
            return;
          }

          var newQ = {
            id: 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            type: currentType,
            question: trimmedQ,
            options: optionsList.slice(),
            correctAnswers: correctIndices.slice(),
            correctAnswer: correctIndices[0],
            points: currentPoints,
            timeSec: currentTimeSec
          };

          addedQuestions.push(newQ);

          // User-Requested Toast: "savol aftamatik tarzda pastga qo\'shildi deb yozuv chiqadi"
          var toast = document.createElement('div');
          toast.className = 'wayground-added-toast';
          toast.innerHTML = '<span>✅</span> <span>Savol avtomatik tarzda pastga qo\'shildi! (Jami: ' + addedQuestions.length + ' ta)</span>';
          document.body.appendChild(toast);
          setTimeout(function() { if (toast && toast.parentNode) toast.remove(); }, 3500);

          // Reset inputs for next question
          questionText = '';
          if (currentType === 'bool') {
            optionsList = ['True', 'False'];
            correctIndices = [0];
          } else {
            optionsList = ['', '', '', ''];
            correctIndices = [0];
          }

          renderStudio();
        };
      }

      // "Save All & Launch" button
      var btnSaveAll = overlay.querySelector('#btnWgSaveAllFinal');
      if (btnSaveAll) {
        btnSaveAll.onclick = function() {
          if (addedQuestions.length === 0) {
            alert("Iltimos, kamida bitta savol qo\'shing!");
            return;
          }

          if (isExamImport && opts.onSave) {
            opts.onSave(addedQuestions);
            overlay.remove();
            return;
          }

          var newQuiz = {
            id: 'quiz_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            code: quizCode.trim().toUpperCase(),
            title: quizTitle.trim() || 'English Blitz Battle',
            created: Date.now(),
            teacherEmail: S.user.email,
            teacherName: S.user.name,
            status: 'lobby',
            questions: addedQuestions,
            lobbyParticipants: [],
            lastSessionAnalysis: null
          };

          if (!Array.isArray(S.quizzes)) S.quizzes = [];
          S.quizzes.unshift(newQuiz);
          App.saveState();

          if (window.EthithSync && window.EthithSync.publishLive) {
            window.EthithSync.publishLive({ type: 'QUIZ_CREATED', quiz: newQuiz });
          }

          overlay.remove();
          if (window._ethithRefreshQuizList) window._ethithRefreshQuizList();
          startQuizBattleRunner(newQuiz, true);
        };
      }
    }

    renderStudio();
    document.body.appendChild(overlay);
  }

  // Alias for showCreateQuizModal
  function showCreateQuizModal(container) {
    showWaygroundStudioModal({});
  }

  // -------------------------------------------------------------------------
  // MAIN QUIZ BATTLE DASHBOARD VIEW (STUDENT JOIN-ONLY VS TEACHER STUDIO)
  // -------------------------------------------------------------------------
  function renderQuizBattleView(container) {
    if (!container) return;
    if (!S.user) {
      if (window.EthithApp && window.EthithApp.showAuthModal) window.EthithApp.showAuthModal();
      return;
    }

    if (!Array.isArray(S.quizzes)) S.quizzes = [];
    if (!Array.isArray(S.user.gifts)) S.user.gifts = [];

    var isTeacher = (S.user.role === 'teacher' || S.user.email === 'joraboyevmuhammad85@gmail.com');
    var activeSubtab = window._ethithQuizSubtab || 'quizzes';

    function renderContent() {
      // 0. Restore gifts from account / local backup if any are missing
      if (S.user) {
        if (!Array.isArray(S.user.gifts)) S.user.gifts = [];
        var userBkpKey = (S.user.email || S.user.name || '').toLowerCase().trim();
        if (userBkpKey) {
          try {
            var bGifts = JSON.parse(localStorage.getItem('ethith_student_gifts_' + userBkpKey) || '[]');
            if (Array.isArray(bGifts)) {
              bGifts.forEach(function(bg) {
                if (!S.user.gifts.some(function(existing) { return existing.id === bg.id || (existing.quizId === bg.quizId && existing.name === bg.name); })) {
                  S.user.gifts.push(bg);
                }
              });
            }
          } catch(e) {}
        }
        if (Array.isArray(S.accounts)) {
          var myAccount = S.accounts.find(function(a) {
            return (a.email && S.user.email && a.email.toLowerCase() === S.user.email.toLowerCase()) ||
                   (a.name && S.user.name && a.name.toLowerCase() === S.user.name.toLowerCase());
          });
          if (myAccount && Array.isArray(myAccount.gifts)) {
            myAccount.gifts.forEach(function(ag) {
              if (!S.user.gifts.some(function(existing) { return existing.id === ag.id || (existing.quizId === ag.quizId && existing.name === ag.name); })) {
                S.user.gifts.push(ag);
              }
            });
          }
        }
      }

      // Auto-claim any received gifts from friends in localStorage
      var myRecKey = 'ethith_received_gifts_' + (S.user.name || '').toLowerCase().trim();
      var myRecKeyEmail = 'ethith_received_gifts_' + (S.user.email || S.user.id || '').toLowerCase().trim();
      var pendingGifts = [];
      try { pendingGifts = pendingGifts.concat(JSON.parse(localStorage.getItem(myRecKey) || '[]')); } catch(e) {}
      try {
        if (myRecKeyEmail && myRecKeyEmail !== myRecKey) {
          pendingGifts = pendingGifts.concat(JSON.parse(localStorage.getItem(myRecKeyEmail) || '[]'));
        }
      } catch(e) {}
      if (pendingGifts.length > 0) {
        if (!Array.isArray(S.user.gifts)) S.user.gifts = [];
        pendingGifts.forEach(function(g) {
          if (!S.user.gifts.some(function(existing) { return existing.id === g.id; })) {
            S.user.gifts.unshift(g);
          }
        });
        localStorage.removeItem(myRecKey);
        if (myRecKeyEmail) localStorage.removeItem(myRecKeyEmail);
        if (window.EthithApp && window.EthithApp.saveState) window.EthithApp.saveState();
      }

      var quizzesCount = S.quizzes.length;
      var giftsCount = S.user.gifts.length;

      var html = '<div class="max-w-6xl mx-auto space-y-6 pb-20">';

      // Top Header Bar
      html += '<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-gradient-to-r from-gray-900 via-gray-950 to-blue-950 rounded-3xl border border-gray-800 shadow-2xl">';
      html += '  <div>';
      html += '    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black tracking-wider uppercase mb-2">';
      html += '      <span>⚡ ETHITH LIVE QUIZ BATTLE</span>';
      html += '      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>';
      html += '    </div>';
      html += '    <h1 class="text-2xl md:text-3xl font-black text-white tracking-tight">Quiz Test Bellashuvi</h1>';
      html += '    <p class="text-xs md:text-sm text-gray-400 mt-1 max-w-2xl">';
      html += '      Jonli multiplayer test musobaqasi! 10 soniyalik bonus (+100 ball), to\'g\'ri javobga +600 ball, xatoga -500 ball va 1-2-3 o\'rinlarga 100+ g\'alati 3D o\'zbekcha sovrinlar!';
      html += '    </p>';
      html += '  </div>';

      // Exact Image 1 button for Teacher ONLY: "+ Yangi Imtihon Tuzish"
      if (isTeacher) {
        html += '  <div>';
        html += '    <button id="btnOpenWaygroundStudio" class="eth-exam-create-btn-dark">';
        html += '      <span style="font-size:22px;line-height:1;margin-top:-2px">+</span>';
        html += '      <span>Yangi Imtihon Tuzish</span>';
        html += '    </button>';
        html += '  </div>';
      }
      html += '</div>';

      // TEACHER VIEW: Teachers do NOT take exams, only manage quizzes (No join card, no gifts tab!)
      if (isTeacher) {
        html += '<div class="space-y-4 pt-2">';
        html += '  <div class="flex items-center justify-between">';
        html += '    <h3 class="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">';
        html += '      <span>📋 O\'qituvchi Boshqaruvi (Mavjud Quiz Testlar)</span>';
        html += '    </h3>';
        html += '  </div>';

        if (S.quizzes.length === 0) {
          html += '<div class="ap-card ap-empty" style="text-align:center;padding:32px 20px">';
          html += '  <div style="font-size:36px;margin-bottom:8px">🎯</div>';
          html += '  <h3 style="font-size:16px;font-weight:800;color:var(--text);margin-bottom:4px">Hozircha hech qanday quiz testlar yo\'q</h3>';
          html += '  <p style="font-size:12.5px;color:var(--muted)">Yuqoridagi "+ Yangi Imtihon Tuzish" tugmasini bosib Wayground Studio orqali test tuzing.</p>';
          html += '</div>';
        } else {
          html += '<div class="ap-grid g2">';
          S.quizzes.forEach(function(quiz) {
            var qCount = (quiz.questions || []).length;
            var statusBadge = '';
            if (quiz.status === 'active') {
              statusBadge = '<span class="eth-badge-open animate-pulse">🟢 Jonli Battle</span>';
            } else if (quiz.status === 'finished') {
              statusBadge = '<span class="eth-badge-closed">🟣 Yakunlangan</span>';
            } else {
              statusBadge = '<span class="eth-badge-open" style="background:rgba(234,179,8,0.12);color:#eab308;border-color:rgba(234,179,8,0.3)">🟡 Lobby</span>';
            }

            html += '<div class="ap-card" style="border:1.5px solid var(--border);position:relative;display:flex;flex-direction:column;justify-content:space-between">';
            html += '  <div>';
            html += '    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;gap:8px;flex-wrap:wrap">';
            html += '      <div style="display:flex;gap:6px;align-items:center">';
            html += '        <span class="ap-tag">⚡ Blitz Quiz</span>';
            html +=          statusBadge;
            html += '        <span style="font-size:11.5px;color:var(--muted)">' + qCount + ' ta savol</span>';
            html += '      </div>';
            html += '      <span style="display:inline-flex;align-items:center;gap:6px;font-family:monospace;font-weight:700;color:#2563eb;background:rgba(37,99,235,0.08);padding:3px 8px;border-radius:6px;font-size:12px">';
            html += '        Code: ' + esc(quiz.code);
            html += '        <button type="button" class="eth-copy-btn-mini" data-copy-code="' + esc(quiz.code) + '" title="Kodni nusxalash">📋 Nusxalash</button>';
            html += '      </span>';
            html += '    </div>';

            html += '    <h3 style="font-size:17px;font-weight:800;color:var(--text);margin-bottom:6px;line-height:1.3">' + esc(quiz.title || 'Quiz Test') + '</h3>';
            html += '    <p style="color:var(--muted);font-size:12.5px;margin:0 0 14px">';
            html += '      📝 ' + qCount + ' questions · ⚡ +600 / +100 / -500 ball · 🎁 100+ Sovrinlar';
            html += '    </p>';
            html += '  </div>';

            html += '  <div style="display:flex;gap:8px;align-items:center;padding-top:10px;border-top:1px solid var(--border);flex-wrap:wrap">';
            html += '    <button class="ap-btn solid btnStartQuizRunner" data-quiz-id="' + quiz.id + '" style="flex:1;justify-content:center;padding:10px 16px;font-size:13.5px">';
            html += '      ▶️ Lobbyni ochish';
            html += '    </button>';
            html += '    <button class="ap-btn out btnViewQuizAnalysis" data-quiz-id="' + quiz.id + '" style="padding:10px 14px;font-size:13px;justify-content:center;color:#8b5cf6;border-color:rgba(139,92,246,0.4)" title="Test Tahlili">📊 Test Tahlili</button>';
            html += '    <button class="ap-btn out btnDeleteQuiz" data-quiz-id="' + quiz.id + '" style="padding:10px 12px;color:#ef4444;justify-content:center" title="O\'chirish">';
            html += '      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>';
            html += '    </button>';
            html += '  </div>';
            html += '</div>';
          });
          html += '</div>';
        }
        html += '</div>';
      }

      // STUDENT VIEW: Clean Tabs (Enter Code vs Sovrinlar)
      else {
        html += '<div class="flex items-center justify-start py-2">';
        html += '  <div class="eth-quiz-pill-tabs">';
        html += '    <button id="tabQuizzesBtn" class="eth-quiz-pill-tab ' + (activeSubtab === 'quizzes' ? 'active-quizzes' : '') + '">';
        html += '      <span>⚡ Imtihonga Kirish</span>';
        html += '    </button>';
        html += '    <button id="tabGiftsBtn" class="eth-quiz-pill-tab ' + (activeSubtab === 'gifts' ? 'active-gifts' : '') + '">';
        html += '      <span>🎁 Sovrinlar (' + giftsCount + ')</span>';
        html += '    </button>';
        html += '  </div>';
        html += '</div>';

        // SUBTAB 1: QUIZZES - COMPACT JOIN CARD (Less than half screen width, perfectly centered)
        if (activeSubtab === 'quizzes') {
          html += '<div class="eth-exam-join-card-dark max-w-sm sm:max-w-md mx-auto space-y-4 my-6 p-6 shadow-2xl" style="border-radius:22px;border:1.5px solid rgba(59,130,246,0.3);">';
          html += '  <div class="flex items-center gap-3 border-b border-gray-800 pb-3">';
          html += '    <div class="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-lg text-blue-400 flex-shrink-0">🔒</div>';
          html += '    <div>';
          html += '      <h3 class="text-base font-black text-white leading-tight">Maxsus Kod Bilan Kirish</h3>';
          html += '      <p class="text-[11px] text-gray-400 leading-tight">O\'qituvchi bergan 6 xonali kodni kiriting</p>';
          html += '    </div>';
          html += '  </div>';
          html += '  <div class="space-y-3.5 pt-1">';
          html += '    <div>';
          html += '      <label class="text-[10px] font-black uppercase tracking-wider text-blue-300 block mb-1">🔑 IMTIHON KODI</label>';
          html += '      <input id="quizCodeInputHero" type="text" placeholder="Masalan: QZ-7K#9X" class="eth-exam-join-input-dark font-mono uppercase tracking-wider w-full" />';
          html += '    </div>';
          html += '    <div>';
          html += '      <label class="text-[10px] font-black uppercase tracking-wider text-blue-300 block mb-1">👤 ISM VA FAMILIYANGIZ</label>';
          html += '      <input id="quizStudentNameHero" type="text" value="' + esc(S.user.name || '') + '" class="eth-exam-join-input-dark font-bold w-full" readonly />';
          html += '    </div>';
          html += '    <button id="btnStartQuizHeroJoin" class="eth-exam-join-btn-blue w-full justify-center py-3 text-sm font-black shadow-lg" style="margin-top:8px;">';
          html += '      <span>Imtihonni Boshlash</span>';
          html += '      <span>➔</span>';
          html += '    </button>';
          html += '  </div>';
          html += '</div>';
        }

        // SUBTAB 2: SOVRINLAR
        else if (activeSubtab === 'gifts') {
          html += '<div class="space-y-4">';

          // ETHITH Coin Wallet Bar
          html += '<div class="eth-coin-wallet-bar">';
          html += '  <div style="display:flex;align-items:center;gap:14px;">';
          html += '    <div style="width:48px;height:48px;border-radius:14px;background:rgba(245,158,11,0.2);border:1.5px solid #f59e0b;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 15px rgba(245,158,11,0.3);">' + (window.ETHITH_COIN_SVG ? window.ETHITH_COIN_SVG(32) : '🪙') + '</div>';
          html += '    <div>';
          html += '      <div style="font-size:11px;font-weight:900;text-transform:uppercase;color:#fbbf24;letter-spacing:0.06em;">ETHITH Hamyon Balansi</div>';
          html += '      <div style="font-size:22px;font-weight:900;color:#ffffff;font-family:monospace;letter-spacing:0.5px;">' + (S.user.coins || 0).toLocaleString() + ' <span style="font-size:13px;color:#f59e0b;font-weight:800;">ETHITH Coin</span></div>';
          html += '    </div>';
          html += '  </div>';
          html += '  <div style="font-size:12px;color:#94a3b8;font-weight:600;max-width:340px;line-height:1.5;">';
          html += '    Kulgili 3D sovrinlaringizni istalgan payt <b>ETHITH Coinga</b> sotishingiz yoki sinfdosh do\'stlaringizga sovg\'a qilishingiz mumkin!';
          html += '  </div>';
          html += '</div>';

          if (S.user.gifts.length === 0) {
            html += '<div class="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">';
            html += '  <div class="text-6xl mb-3">🏆</div>';
            html += '  <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">Sizda hali sovrinlar yo\'q</h3>';
            html += '  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">Quiz Bellashuvlarida qatnashib kuchli uchlikka kiring va birinchi sovriningizni yutib oling!</p>';
            html += '</div>';
          } else {
            html += '<div class="eth-sovrin-grid">';
            S.user.gifts.forEach(function(gift, idx) {
              var isFromFriend = Boolean(gift.fromFriend || gift.senderName);
              var senderTitle = gift.fromFriend || gift.senderName || '';
              var giftPrice = window.ETHITH_GET_PRIZE_PRICE ? window.ETHITH_GET_PRIZE_PRICE(gift) : (gift.price || 50);

              html += '<div class="eth-gift-card-3d">';
              html += '  <div>';
              html += '    <div class="eth-gift-emoji-3d">' + (gift.icon || '🎁') + '</div>';
              html += '    <h4 style="font-size:16px;font-weight:900;color:#ffffff;margin:8px 0 4px;line-height:1.3;">' + esc(gift.name || 'Sovrin') + '</h4>';
              html += '    <p style="font-size:12px;color:#94a3b8;line-height:1.5;margin:6px 0;">' + esc(gift.desc || '') + '</p>';
              html += '    <div class="eth-gift-price-badge">' + (window.ETHITH_COIN_SVG ? window.ETHITH_COIN_SVG(16) : '🪙') + ' Qiymati: ' + giftPrice + ' ETHITH Coin</div>';
              if (isFromFriend) {
                html += '    <div style="margin-top:8px;font-size:11px;font-weight:900;color:#60a5fa;background:rgba(37,99,235,0.15);border:1px solid rgba(96,165,250,0.4);border-radius:8px;padding:4px 10px;display:inline-flex;align-items:center;gap:6px;">🎁 Do\'stdan sovg\'a (' + esc(senderTitle) + ')</div>';
              }
              html += '  </div>';
              html += '  <div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.1);display:flex;flex-direction:column;gap:8px;">';
              html += '    <button type="button" class="btnSellGiftModal eth-gift-sell-btn" data-gift-idx="' + idx + '" data-price="' + giftPrice + '">';
              html += '      💰 Sotish (+' + giftPrice + ' Coin)';
              html += '    </button>';
              html += '    <button type="button" class="btnSendGiftModal eth-gift-action-btn" data-gift-idx="' + idx + '">';
              html += '      🎁 Do\'stga yuborish';
              html += '    </button>';
              html += '  </div>';
              html += '</div>';
            });
            html += '</div>';
          }
          html += '</div>';
        }
      }

      html += '</div>';

      container.innerHTML = html;

      // ATTACH LISTENERS
      if (!isTeacher) {
        var tabQuizzesBtn = container.querySelector('#tabQuizzesBtn');
        var tabGiftsBtn = container.querySelector('#tabGiftsBtn');
        if (tabQuizzesBtn) {
          tabQuizzesBtn.onclick = function() {
            window._ethithQuizSubtab = 'quizzes';
            activeSubtab = 'quizzes';
            renderContent();
          };
        }
        if (tabGiftsBtn) {
          tabGiftsBtn.onclick = function() {
            window._ethithQuizSubtab = 'gifts';
            activeSubtab = 'gifts';
            renderContent();
          };
        }
      }

      // Teacher Studio Trigger
      var btnOpenStudio = container.querySelector('#btnOpenWaygroundStudio');
      if (btnOpenStudio) {
        btnOpenStudio.onclick = function() {
          showWaygroundStudioModal({});
        };
      }

      // Hero Join Card Action
      var btnHeroJoin = container.querySelector('#btnStartQuizHeroJoin');
      var inHeroCode = container.querySelector('#quizCodeInputHero');
      var inHeroName = container.querySelector('#quizStudentNameHero');

      if (btnHeroJoin && inHeroCode) {
        function doHeroJoin() {
          var codeVal = inHeroCode.value.trim().toUpperCase();
          if (!codeVal) {
            alert("Iltimos, imtihon kodini kiriting! Masalan: QZ-7K#9X yoki 6 xonali kod");
            return;
          }
          if (inHeroName && inHeroName.value.trim()) {
            var inputStudentName = inHeroName.value.trim();
            S.user.name = inputStudentName;
            var cleanStEmail = (S.user.email || (inputStudentName.toLowerCase().replace(/\s+/g, '.') + '@ethith.uz')).toLowerCase().trim();

            if (!Array.isArray(S.accounts)) S.accounts = [];
            var exStudent = S.accounts.find(function(a) {
              return (a.email && a.email.toLowerCase() === cleanStEmail) ||
                     (a.name && a.name.toLowerCase() === inputStudentName.toLowerCase());
            });
            if (!exStudent) {
              S.accounts.push({
                id: S.user.id || ('st_' + Date.now()),
                role: 'student',
                name: inputStudentName,
                email: cleanStEmail,
                gifts: S.user.gifts || [],
                createdAt: Date.now()
              });
            } else {
              exStudent.name = inputStudentName;
              if (Array.isArray(exStudent.gifts) && (!S.user.gifts || S.user.gifts.length === 0)) {
                S.user.gifts = exStudent.gifts.slice();
              }
            }

            try {
              var allRegStudents = JSON.parse(localStorage.getItem('ethith_all_registered_users') || '[]');
              if (!allRegStudents.some(function(u) { return (u.email && u.email.toLowerCase() === cleanStEmail) || u.name.toLowerCase() === inputStudentName.toLowerCase(); })) {
                allRegStudents.push({
                  id: S.user.id || ('st_' + Date.now()),
                  name: inputStudentName,
                  email: cleanStEmail,
                  role: 'student',
                  joinedAt: Date.now()
                });
                localStorage.setItem('ethith_all_registered_users', JSON.stringify(allRegStudents));
              }
            } catch(e) {}

            if (window.EthithSync && window.EthithSync.publishLive) {
              window.EthithSync.publishLive({
                type: 'USER_REGISTERED',
                user: {
                  id: S.user.id || ('st_' + Date.now()),
                  name: inputStudentName,
                  email: cleanStEmail,
                  role: 'student'
                }
              });
            }

            App.saveState();
          }

          var matched = S.quizzes.find(function(q) {
            return q.code && (q.code.trim().toUpperCase() === codeVal || q.code.trim().toUpperCase().indexOf(codeVal) !== -1);
          });
          if (!matched) {
            alert("Kiritilgan '" + codeVal + "' kodi bo\'yicha hech qanday Quiz topilmadi! Kodni to\'g\'ri yozganingizni tekshiring.");
            return;
          }

          var isHost = (S.user && (S.user.email === matched.teacherEmail || isTeacher));
          startQuizBattleRunner(matched, isHost);
        }

        btnHeroJoin.onclick = doHeroJoin;
        inHeroCode.onkeydown = function(e) {
          if (e.key === 'Enter') doHeroJoin();
        };
      }

      // Start Runner buttons
      container.querySelectorAll('.btnStartQuizRunner').forEach(function(btn) {
        btn.onclick = function() {
          var qId = btn.getAttribute('data-quiz-id');
          var quizObj = S.quizzes.find(function(q) { return q.id === qId; });
          if (quizObj) {
            var isHost = (S.user && (S.user.email === quizObj.teacherEmail || isTeacher));
            startQuizBattleRunner(quizObj, isHost);
          }
        };
      });

      // View Analysis buttons
      container.querySelectorAll('.btnViewQuizAnalysis').forEach(function(btn) {
        btn.onclick = function() {
          var qId = btn.getAttribute('data-quiz-id');
          var quizObj = S.quizzes.find(function(q) { return q.id === qId; });
          if (quizObj) showQuizAnalysisModal(quizObj);
        };
      });

      // Delete Quiz buttons
      container.querySelectorAll('.btnDeleteQuiz').forEach(function(btn) {
        btn.onclick = function() {
          var qId = btn.getAttribute('data-quiz-id');
          if (!confirm("Ushbu quiz testni butunlay o\'chirmoqchimisiz?")) return;
          S.quizzes = S.quizzes.filter(function(q) { return q.id !== qId; });
          if (!S.deletedQuizIds) S.deletedQuizIds = [];
          if (S.deletedQuizIds.indexOf(qId) === -1) {
            S.deletedQuizIds.push(qId);
          }
          App.saveState();
          if (window.EthithSync && window.EthithSync.publishLive) {
            window.EthithSync.publishLive({ type: 'QUIZ_DELETED', quizId: qId });
          }
          renderContent();
        };
      });

      // Sell Gift buttons (Exchange for ETHITH Coins)
      container.querySelectorAll('.btnSellGiftModal').forEach(function(btn) {
        btn.onclick = function() {
          var idx = parseInt(btn.getAttribute('data-gift-idx'), 10);
          var giftObj = (S.user && S.user.gifts) ? S.user.gifts[idx] : null;
          if (!giftObj) return;
          var price = parseInt(btn.getAttribute('data-price'), 10) || (window.ETHITH_GET_PRIZE_PRICE ? window.ETHITH_GET_PRIZE_PRICE(giftObj) : 100);
          var giftName = giftObj.name || giftObj.title || "Sovrin";
          if (!confirm("Siz rostdan ham ushbu sovrinni (" + giftName + ") " + price + " ETHITH Coin evaziga sotmoqchimisiz?")) return;
          
          // Remove gift from user\'s inventory
          S.user.gifts.splice(idx, 1);
          // Credit ETHITH Coins
          S.user.coins = (S.user.coins || 0) + price;

          // Sync into S.accounts
          if (Array.isArray(S.accounts)) {
            var myAcc = S.accounts.find(function(a) {
              return (a.email && S.user.email && a.email.toLowerCase() === S.user.email.toLowerCase()) ||
                     (a.name && S.user.name && a.name.toLowerCase() === S.user.name.toLowerCase());
            });
            if (myAcc) {
              myAcc.coins = S.user.coins;
              myAcc.gifts = S.user.gifts;
            }
          }

          // Update dedicated localStorage backup
          var myUserKey = (S.user.email || S.user.name || 'user').toLowerCase().trim();
          try {
            localStorage.setItem('ethith_student_gifts_' + myUserKey, JSON.stringify(S.user.gifts));
          } catch(e) {}

          App.saveState();
          if (typeof App.showToast === 'function') {
            App.showToast("Muvaffaqiyatli sotildi! Hamyoningizga +" + price + " ETHITH Coin qo\'shildi! 🪙", "success");
          } else {
            alert("Muvaffaqiyatli sotildi! Hamyoningizga +" + price + " ETHITH Coin qo\'shildi! 🪙");
          }
          renderContent();
        };
      });

      // Send Gift buttons
      container.querySelectorAll('.btnSendGiftModal').forEach(function(btn) {
        btn.onclick = function() {
          var idx = parseInt(btn.getAttribute('data-gift-idx'), 10);
          var giftObj = S.user.gifts[idx];
          if (giftObj) {
            showSendGiftModal(giftObj, function() {
              renderContent();
            });
          }
        };
      });
    }

    renderContent();
    window._ethithRefreshQuizList = renderContent;
    window._ethithRefreshGifts = renderContent;
  }

  // -------------------------------------------------------------------------
  // LIVE QUIZ BATTLE RUNNER (WITH COMPLETE OPTION SHUFFLING PER STUDENT)
  // -------------------------------------------------------------------------
  function startQuizBattleRunner(quiz, isHost) {
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      alert("Ushbu quizda savollar mavjud emas!");
      return;
    }

    var old = document.querySelector('.eth-quiz-fullscreen');
    if (old) old.remove();

    var isTeacher = Boolean(isHost || (S.user && (S.user.role === 'teacher' || S.user.email === quiz.teacherEmail)));
    var myStudentId = (S.user && (S.user.email || S.user.id)) || ('st_' + Date.now());
    var myStudentName = (S.user && S.user.name) || 'O\'quvchi';
    var hasAwardedPrizeThisSession = false;

    var currentPhase = 'lobby';
    var myScore = 0;
    var correctCount = 0;
    var wrongCount = 0;
    var silentInfractions = 0;
    var currentQIndex = 0;
    var questionTimerInterval = null;
    var questionRemainingMs = 10000;
    var questionStartTime = 0;
    var myStreak = 0;
    var previousRanksMap = {};

    // -------------------------------------------------------------------------
    // SEQUENTIAL BATTLE AUDIO ENGINE (ETHITH TAST 1 & 2)
    // -------------------------------------------------------------------------
    var battleAudio = null;
    var currentAudioTrack = 1;
    var isMusicMuted = false;

    function playBattleTrack(trackNum) {
      if (isMusicMuted) return;
      if (battleAudio) {
        try { battleAudio.pause(); battleAudio.src = ''; } catch(e){}
      }
      currentAudioTrack = trackNum;
      battleAudio = new Audio(trackNum === 1 ? 'audio_battle_1.mp3' : 'audio_battle_2.mp3');
      battleAudio.volume = 0.55;
      battleAudio.onended = function() {
        playBattleTrack(currentAudioTrack === 1 ? 2 : 1);
      };
      battleAudio.play().catch(function(err) {
        console.log("Audio autoplay prevented or failed:", err);
      });
    }

    function startBattleMusic() {
      if (!battleAudio && !isMusicMuted) {
        playBattleTrack(1);
      }
    }

    function toggleMusicMute() {
      isMusicMuted = !isMusicMuted;
      if (battleAudio) {
        battleAudio.muted = isMusicMuted;
        if (!isMusicMuted && battleAudio.paused) {
          battleAudio.play().catch(function(){});
        }
      } else if (!isMusicMuted) {
        playBattleTrack(currentAudioTrack);
      }
      root.querySelectorAll('.eth-music-toggle-btn').forEach(function(btn) {
        btn.innerHTML = isMusicMuted ? '🔇 Muzika' : '🔊 Muzika';
      });
    }

    function stopBattleMusic() {
      if (battleAudio) {
        try {
          battleAudio.pause();
          battleAudio.src = '';
        } catch(e){}
        battleAudio = null;
      }
    }

    // Floating Infraction Toasts for Teacher Command Center
    function showTeacherInfractionToast(event) {
      if (!isTeacher) return;
      var toastContainer = document.getElementById('ethQuizToastArea');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'ethQuizToastArea';
        toastContainer.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999999;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
        document.body.appendChild(toastContainer);
      }

      var toast = document.createElement('div');
      toast.className = 'eth-quiz-infraction-toast' + (event.action === 'TAB_RETURN' || event.action === 'FOCUS' ? ' return' : '');
      toast.style.pointerEvents = 'auto';

      var icon = event.isViolation ? '🚨' : (event.action === 'TAB_RETURN' ? '🟢' : '🔔');
      toast.innerHTML = '<span style="font-size:24px;">' + icon + '</span>' +
        '<div style="flex:1;min-width:0;">' +
          '<div style="font-weight:900;font-size:13px;color:#fff;display:flex;align-items:center;gap:6px;">' +
            (event.hero ? '<span>' + event.hero.emoji + '</span>' : '') +
            '<span>' + (event.studentName || 'O\'quvchi') + '</span>' +
            '<span style="font-size:10px;color:#94a3b8;margin-left:auto;">' + (event.timestamp || '') + '</span>' +
          '</div>' +
          '<div style="font-size:12px;color:' + (event.isViolation ? '#fca5a5' : '#86efac') + ';font-weight:700;margin-top:2px;">' +
            event.detail +
          '</div>' +
        '</div>';

      toastContainer.appendChild(toast);

      setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.4s ease';
        setTimeout(function() { toast.remove(); }, 400);
      }, 4500);
    }

    // 12 Distinct Quizizz-Style Animated Heroes
    var QUIZIZZ_HEROES = [
      { id: 'mustache', name: 'Professor Mo\'ylov', emoji: '🥸', bg: 'linear-gradient(135deg, #f59e0b, #d97706)', border: '#fbbf24' },
      { id: 'robot', name: 'Kiber Bot 3000', emoji: '🤖', bg: 'linear-gradient(135deg, #06b6d4, #0891b2)', border: '#22d3ee' },
      { id: 'fox', name: 'Hiylakor Tulki', emoji: '🦊', bg: 'linear-gradient(135deg, #f97316, #ea580c)', border: '#fb923c' },
      { id: 'wizard', name: 'Sehrgar Bobo', emoji: '🧙‍♂️', bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: '#a78bfa' },
      { id: 'dino', name: 'Tezkor Dino', emoji: '🦖', bg: 'linear-gradient(135deg, #10b981, #059669)', border: '#34d399' },
      { id: 'ninja', name: 'Soyadagi Ninja', emoji: '🥷', bg: 'linear-gradient(135deg, #374151, #1f2937)', border: '#9ca3af' },
      { id: 'alien', name: 'Galaktika O\'zgasi', emoji: '👾', bg: 'linear-gradient(135deg, #ec4899, #db2777)', border: '#f472b6' },
      { id: 'lion', name: 'Jasur Arslon', emoji: '🦁', bg: 'linear-gradient(135deg, #eab308, #ca8a04)', border: '#fde047' },
      { id: 'panda', name: 'Dono Panda', emoji: '🐼', bg: 'linear-gradient(135deg, #475569, #334155)', border: '#94a3b8' },
      { id: 'unicorn', name: 'Sehrli Toychoq', emoji: '🦄', bg: 'linear-gradient(135deg, #a855f7, #9333ea)', border: '#c084fc' },
      { id: 'superhero', name: 'Super Qahramon', emoji: '🦸', bg: 'linear-gradient(135deg, #ef4444, #dc2626)', border: '#f87171' },
      { id: 'detective', name: 'Sirli Detektiv', emoji: '🕵️', bg: 'linear-gradient(135deg, #0284c7, #0369a1)', border: '#38bdf8' }
    ];

    function getStudentHero(idOrName, idx) {
      var hash = 0;
      var str = String(idOrName || idx || 'hero');
      for (var i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
      }
      var selectedIndex = Math.abs(hash + (idx || 0)) % QUIZIZZ_HEROES.length;
      var foundAcc = (S.accounts || []).find(function(a) {
        return (a.name && a.name.toLowerCase() === str.toLowerCase()) || (a.id && a.id === str);
      });
      if (foundAcc && foundAcc.avatar) {
        var avObj = (window.ETHITH_AVATARS || []).find(function(av) { return av.id === foundAcc.avatar || (foundAcc.avatar.id && av.id === foundAcc.avatar.id); });
        if (avObj) {
          return { id: avObj.id, name: avObj.name, emoji: '', isCustomAvatar: true, avatar: avObj, bg: avObj.bg || '#1e293b', border: avObj.border || '#38bdf8' };
        }
      }
      return QUIZIZZ_HEROES[selectedIndex];
    }

    // 1. Shuffle Questions order per student
    var shuffledQuestions = shuffleArray(quiz.questions);

    // 2. Pre-shuffle OPTIONS for EACH question per student (User Requirement: "har bitta savolning variandining o\'rniham almashib tushadi")
    var preparedQuestions = shuffledQuestions.map(function(q) {
      var origOpts = q.options || [];
      var mapped = origOpts.map(function(optText, oIdx) {
        var isCorr = false;
        if (Array.isArray(q.correctAnswers) && q.correctAnswers.length > 0) {
          isCorr = (q.correctAnswers.indexOf(oIdx) !== -1);
        } else {
          isCorr = (oIdx === q.correctAnswer);
        }
        return {
          text: optText,
          origIndex: oIdx,
          isCorrect: isCorr
        };
      });

      // Scramble option positions for this student!
      var scrambled = shuffleArray(mapped);

      return {
        id: q.id,
        type: q.type || 'mcq',
        question: q.question,
        options: scrambled,
        points: q.points || 1,
        timeSec: q.timeSec || 10
      };
    });

    var studentAnswersMap = {};
    var myHero = getStudentHero(myStudentId, 0);

    var participantsMap = {};
    if (!isTeacher) {
      participantsMap[myStudentId] = {
        id: myStudentId,
        name: myStudentName,
        hero: myHero,
        joinIndex: 1,
        score: 0,
        currentQ: 0,
        totalQ: preparedQuestions.length,
        correctCount: 0,
        wrongCount: 0,
        infractions: 0,
        finished: false,
        answers: {}
      };
    }

    var teacherTelemetryLogs = [];
    var teacherLiveActiveTab = 'leaderboard';
    function appendTeacherTelemetryLog(logItem) {
      teacherTelemetryLogs.unshift(logItem);
      if (teacherTelemetryLogs.length > 60) teacherTelemetryLogs.pop();
    }

    var root = document.createElement('div');
    root.className = 'eth-quiz-fullscreen';
    document.body.appendChild(root);

    // Announce Lobby Join via MQTT
    if (!isTeacher && window.EthithSync && window.EthithSync.publishLive) {
      window.EthithSync.publishLive({
        type: 'QUIZ_LOBBY_STATE',
        quizId: quiz.id,
        studentId: myStudentId,
        studentName: myStudentName,
        hero: myHero,
        joinIndex: 1,
        action: 'join'
      });
    }

    // Silent Proctoring Telemetry Handler (No camera preview, no blocking)
    function sendStudentTelemetry(actionType, detail, isViolation) {
      if (isTeacher) return;
      if (isViolation) {
        silentInfractions++;
        if (participantsMap[myStudentId]) participantsMap[myStudentId].infractions = silentInfractions;
      }
      var now = new Date();
      var timeStr = (now.getHours() < 10 ? '0' : '') + now.getHours() + ':' +
                    (now.getMinutes() < 10 ? '0' : '') + now.getMinutes() + ':' +
                    (now.getSeconds() < 10 ? '0' : '') + now.getSeconds();

      if (window.EthithSync && window.EthithSync.publishLive) {
        window.EthithSync.publishLive({
          type: 'QUIZ_STUDENT_INFRACTION',
          quizId: quiz.id,
          studentId: myStudentId,
          studentName: myStudentName,
          hero: myHero,
          action: actionType,
          detail: detail,
          isViolation: Boolean(isViolation),
          infractions: silentInfractions,
          timestamp: timeStr
        });
        window.EthithSync.publishLive({
          type: 'QUIZ_SILENT_INFRACTION',
          quizId: quiz.id,
          studentId: myStudentId,
          studentName: myStudentName,
          infractions: silentInfractions,
          reason: detail
        });
      }
    }

    var onVisibilityChange = function() {
      if (currentPhase !== 'playing') return;
      if (document.visibilityState === 'hidden') {
        sendStudentTelemetry('TAB_EXIT', '🚨 Brauzer oynasidan chiqdi / Boshqa ilovaga o\'tdi!', true);
      } else if (document.visibilityState === 'visible') {
        sendStudentTelemetry('TAB_RETURN', '🟢 Test oynasiga qaytdi.', false);
      }
    };

    var onWindowBlur = function() {
      if (currentPhase !== 'playing') return;
      sendStudentTelemetry('BLUR', '⚠️ Oyna fokusini yo\'qotdi (boshqa oynani bosdi)', true);
    };

    var onWindowFocus = function() {
      if (currentPhase !== 'playing') return;
      sendStudentTelemetry('FOCUS', '🟢 Oyna fokusiga qaytdi', false);
    };

    var onKeyDown = function(e) {
      if (currentPhase !== 'playing' || isTeacher) return;
      if (e.key === 'Alt' || e.key === 'F12' || (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'Tab')) || e.key === 'Escape') {
        var keyLabel = e.key === ' ' ? 'Space' : e.key;
        if (e.altKey && e.key !== 'Alt') keyLabel = 'Alt+' + keyLabel;
        if (e.ctrlKey && e.key !== 'Control') keyLabel = 'Ctrl+' + keyLabel;
        sendStudentTelemetry('FORBIDDEN_KEY', '⚠️ Taqiqlangan tugmani bosdi (' + keyLabel + ')!', true);
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('focus', onWindowFocus);
    window.addEventListener('keydown', onKeyDown);

    function cleanupListeners() {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onWindowBlur);
      window.removeEventListener('focus', onWindowFocus);
      window.removeEventListener('keydown', onKeyDown);
      if (questionTimerInterval) clearInterval(questionTimerInterval);
      stopBattleMusic();
      window._ethithOnQuizEvent = null;
    }

    function getMyRank() {
      var arr = Object.values(participantsMap);
      arr.sort(function(a, b) { return b.score - a.score; });
      var idx = arr.findIndex(function(p) { return p.id === myStudentId; });
      return idx >= 0 ? (idx + 1) : 1;
    }

    window._ethithOnQuizEvent = function(event) {
      if (!event || event.quizId !== quiz.id) return;

      if (event.type === 'QUIZ_LOBBY_STATE') {
        if (!participantsMap[event.studentId]) {
          var joinNum = Object.keys(participantsMap).length + 1;
          participantsMap[event.studentId] = {
            id: event.studentId,
            name: event.studentName || 'O\'quvchi',
            hero: event.hero || getStudentHero(event.studentId, joinNum),
            joinIndex: event.joinIndex || joinNum,
            score: 0,
            currentQ: 0,
            totalQ: preparedQuestions.length,
            correctCount: 0,
            wrongCount: 0,
            infractions: 0,
            streak: 0,
            finished: false,
            answers: {}
          };
        }
        if (currentPhase === 'lobby') renderLobby();
      }
      else if (event.type === 'QUIZ_STARTED') {
        if (currentPhase === 'lobby') startCountdown();
      }
      else if (event.type === 'QUIZ_STUDENT_INFRACTION') {
        if (participantsMap[event.studentId]) {
          if (event.isViolation) {
            participantsMap[event.studentId].infractions = event.infractions || (participantsMap[event.studentId].infractions + 1);
          }
        }
        if (isTeacher) {
          appendTeacherTelemetryLog(event);
          showTeacherInfractionToast(event);
          if (event.isViolation && typeof playTitTitAlarm === 'function') {
            try { playTitTitAlarm(1); } catch(e) {}
          }
          if (currentPhase === 'teacher_control') {
            renderTeacherCommandCenter();
          }
        }
      }
      else if (event.type === 'QUIZ_SCORE_UPDATE') {
        if (!participantsMap[event.studentId]) {
          var jNum = Object.keys(participantsMap).length + 1;
          participantsMap[event.studentId] = {
            id: event.studentId,
            name: event.studentName || 'O\'quvchi',
            hero: event.hero || getStudentHero(event.studentId, jNum),
            joinIndex: jNum
          };
        }
        var p = participantsMap[event.studentId];
        var oldScore = p.score || 0;
        var diff = (event.score || 0) - oldScore;

        p.score = event.score || 0;
        p.currentQ = event.currentQ || 0;
        p.totalQ = event.totalQ || preparedQuestions.length;
        p.correctCount = event.correctCount || 0;
        p.wrongCount = event.wrongCount || 0;
        p.infractions = event.infractions || 0;
        p.streak = (event.streak !== undefined) ? event.streak : (diff > 0 ? ((p.streak || 0) + 1) : 0);
        if (event.answers) p.answers = event.answers;

        if (isTeacher) {
          var isEarned = (diff > 0);
          appendTeacherTelemetryLog({
            studentId: event.studentId,
            studentName: event.studentName,
            hero: p.hero,
            action: isEarned ? 'CORRECT' : 'WRONG',
            detail: isEarned ? ('⚡ ' + (event.studentName || 'O\'quvchi') + ' ' + (event.currentQ) + '-savolga to\'g\'ri javob berdi (+' + diff + ' ball)!') : ('❌ ' + (event.studentName || 'O\'quvchi') + ' ' + (event.currentQ) + '-savolda adashdi (-500 ball)'),
            timestamp: new Date().toTimeString().slice(0, 8),
            isViolation: false
          });
        }

        if (currentPhase === 'playing') {
          updateLiveRankPill();
        } else if (currentPhase === 'teacher_control') {
          renderTeacherCommandCenter();
        } else if (currentPhase === 'waiting_others') {
          renderWaitingOthers();
        }
      }
      else if (event.type === 'QUIZ_FINISHED') {
        if (participantsMap[event.studentId]) {
          participantsMap[event.studentId].finished = true;
          participantsMap[event.studentId].score = event.score || participantsMap[event.studentId].score;
          if (event.answers) participantsMap[event.studentId].answers = event.answers;
        }
        if (isTeacher) {
          appendTeacherTelemetryLog({
            studentId: event.studentId,
            studentName: event.studentName,
            hero: (participantsMap[event.studentId] && participantsMap[event.studentId].hero) || null,
            action: 'FINISHED',
            detail: '🏁 ' + (event.studentName || 'O\'quvchi') + ' barcha savollarni yakunladi! Yakuniy ball: ' + (event.score || 0),
            timestamp: new Date().toTimeString().slice(0, 8),
            isViolation: false
          });
          if (currentPhase === 'teacher_control') renderTeacherCommandCenter();
        } else if (currentPhase === 'waiting_others') {
          renderWaitingOthers();
        }
      }
      else if (event.type === 'QUIZ_FORCE_FINISH' || event.type === 'QUIZ_FINISH_PODIUM') {
        renderFinalePodium(event.officialPrizes, event.rankings);
      }
    };

    // PHASE 1: LOBBY WITH ANIMATED QUIZIZZ CHARACTERS
    function renderLobby() {
      currentPhase = 'lobby';
      var participantList = Object.values(participantsMap);

      var html = '<div class="max-w-3xl w-full mx-auto p-6 md:p-8 bg-gray-900/95 border border-gray-700/80 rounded-3xl backdrop-blur-2xl text-center space-y-6 shadow-2xl animate-fade-in">';
      html += '  <div class="flex items-center justify-between border-b border-gray-800 pb-4">';
      html += '    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black tracking-wide border border-amber-500/30">';
      html += '      <span>⚡ ETHITH QUIZ BATTLE LOBBY</span>';
      html += '    </div>';
      html += '    <button id="btnExitQuizLobby" class="eth-quiz-close-btn" title="Chiqish">✕</button>';
      html += '  </div>';

      html += '  <div class="space-y-2">';
      html += '    <h2 class="text-2xl md:text-3xl font-black text-white leading-tight">' + (quiz.title || 'Quiz Test') + '</h2>';
      html += '    <p class="text-xs md:text-sm text-gray-400">Barcha o\'quvchilar qo\'shilishini kuting. O\'qituvchi start berishi bilan hamma bir vaqtda boshlaydi!</p>';
      html += '  </div>';

      // Sleek Compact Code Box
      html += '  <div class="p-4 bg-gray-800/90 rounded-2xl border border-gray-700 shadow-xl space-y-2">';
      html += '    <div class="text-[11px] uppercase font-bold tracking-wider text-gray-400">Bellashuv Maxsus Kodi:</div>';
      html += '    <div class="flex flex-wrap items-center justify-center gap-3">';
      html += '      <span class="text-3xl md:text-4xl font-mono font-black text-white tracking-widest">' + quiz.code + '</span>';
      html += '      <button id="btnCopyLobbyCode" class="eth-quiz-copy-code-btn">📋 Nusxalash</button>';
      html += '    </div>';
      html += '    <div class="text-[11px] text-gray-400 font-medium">O\'quvchilar ushbu kodni kiritib o\'z qahramonlari bilan jangga qo\'shiladilar</div>';
      html += '  </div>';

      // Participants list
      html += '  <div class="space-y-2.5 text-left">';
      html += '    <div class="flex items-center justify-between text-xs font-bold text-gray-300 px-1">';
      html += '      <span>Qo\'shilgan Qahramonlar (' + participantList.length + ' ta)</span>';
      html += '      <span class="text-emerald-400 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Jonli kutmoqda</span>';
      html += '    </div>';

      if (participantList.length === 0) {
        html += '<div class="p-8 text-center text-gray-400 bg-gray-800/40 rounded-2xl border border-dashed border-gray-700 text-sm font-bold">';
        html += '  <span>⏳ Hozircha o\'quvchilar qo\'shilmadi. Kodni ulashing va o\'quvchilar paydo bo\'lishini kuting...</span>';
        html += '</div>';
      } else {
        html += '    <div class="quiz-lobby-grid-3">';
        participantList.forEach(function(p, idx) {
          var isMe = (p.id === myStudentId);
          var hero = p.hero || getStudentHero(p.id, idx);
          html += '<div class="quiz-student-lobby-card-compact" style="border-color: ' + hero.border + ';">';
          html += '  <div class="quiz-mini-avatar" style="background: ' + hero.bg + '; border: 1.5px solid ' + hero.border + ';">';
          html += '    <span>' + hero.emoji + '</span>';
          html += '  </div>';
          html += '  <div class="min-w-0 flex-1 text-left">';
          html += '    <div class="flex items-center gap-1.5">';
          html += '      <span class="text-xs font-black text-white truncate">' + p.name + '</span>';
          if (isMe) {
            html += '    <span class="px-1.5 py-0.2 rounded bg-emerald-500/80 text-[9px] font-black text-white">Siz</span>';
          }
          html += '    </div>';
          html += '    <div class="text-[10px] text-gray-400 font-semibold truncate flex items-center gap-1 mt-0.5">';
          html += '      <span class="text-amber-400 font-mono">#' + (p.joinIndex || (idx + 1)) + '</span>';
          html += '      <span>·</span>';
          html += '      <span class="truncate">' + hero.name + '</span>';
          html += '    </div>';
          html += '  </div>';
          html += '</div>';
        });
        html += '    </div>';
      }
      html += '  </div>';

      // Action Button
      html += '  <div class="pt-3">';
      if (isTeacher) {
        html += '    <button id="btnTeacherStartBattle" class="eth-quiz-start-btn">';
        html += '      <span class="text-xl">🚀</span>';
        html += '      <span>BATTLE NI BOSHLASH (START)</span>';
        html += '    </button>';
      } else {
        html += '    <div class="py-4 px-6 rounded-2xl bg-gray-800/80 border border-gray-700/80 text-sm font-extrabold text-amber-400 flex items-center justify-center gap-3 animate-pulse shadow-lg">';
        html += '      <span class="text-2xl">⏳</span>';
        html += '      <span>Ustoz start berishini kutmoqdamiz... Qahramoningiz tayyor!</span>';
        html += '    </div>';
      }
      html += '  </div>';

      html += '</div>';

      root.innerHTML = html;

      var btnExit = root.querySelector('#btnExitQuizLobby');
      if (btnExit) {
        btnExit.onclick = function() {
          cleanupListeners();
          root.remove();
        };
      }

      var btnCopy = root.querySelector('#btnCopyLobbyCode');
      if (btnCopy) {
        btnCopy.onclick = function() {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(quiz.code).then(function() {
              alert("Quiz kodi nusxalandi: " + quiz.code);
            });
          } else {
            prompt("Quiz kodi:", quiz.code);
          }
        };
      }

      var btnStart = root.querySelector('#btnTeacherStartBattle');
      if (btnStart) {
        btnStart.onclick = function() {
          quiz.status = 'active';
          App.saveState();
          if (window.EthithSync && window.EthithSync.publishLive) {
            window.EthithSync.publishLive({
              type: 'QUIZ_STARTED',
              quizId: quiz.id
            });
          }
          startCountdown();
        };
      }
    }

    // PHASE 2: 3-2-1 COUNTDOWN
    function startCountdown() {
      currentPhase = 'countdown';
      var count = 3;

      function renderCount() {
        var html = '<div class="max-w-md w-full mx-auto p-12 text-center space-y-4 animate-fade-in">';
        html += '  <div class="text-xs uppercase font-extrabold tracking-widest text-amber-400">Battle boshlanmoqda!</div>';
        html += '  <div class="text-8xl md:text-9xl font-black text-white animate-bounce tracking-tight font-mono">' + count + '</div>';
        html += '  <div class="text-sm font-bold text-gray-300">Tez va to\'g\'ri javob bering, bonus ballarni qo\'lga kiriting!</div>';
        html += '</div>';
        root.innerHTML = html;
        if (typeof playTitTitAlarm === 'function') playTitTitAlarm(2);
      }

      renderCount();

      var timer = setInterval(function() {
        count--;
        if (count > 0) {
          renderCount();
        } else {
          clearInterval(timer);
          startBattleMusic();
          if (isTeacher) {
            renderTeacherCommandCenter();
          } else {
            renderPlayingQuestion();
          }
        }
      }, 1000);
    }

    // PHASE 3A: TEACHER LIVE COMMAND & PROCTORING CENTER (WAYGROUND 17:59:33 1:1)
    function renderTeacherCommandCenter() {
      currentPhase = 'teacher_control';
      var list = Object.values(participantsMap);
      list.sort(function(a, b) { return b.score - a.score; });

      var totalFinished = list.filter(function(p) { return p.finished; }).length;
      var totalInfractions = list.reduce(function(acc, p) { return acc + (p.infractions || 0); }, 0);
      var totalCorrectAnswers = list.reduce(function(acc, p) { return acc + (p.correctCount || 0); }, 0);
      var totalQuestionsAnswered = list.reduce(function(acc, p) { return acc + (p.currentQ || 0); }, 0);
      var classAccuracyPct = totalQuestionsAnswered > 0 ? Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100) : 100;

      var html = '<div class="eth-wayground-screen max-w-5xl w-full mx-auto p-4 md:p-6 space-y-4 animate-fade-in pb-16">';

      // 1. TOP WAYGROUND BAR (Matches 17:59:33 with Central Giant Join Code Box)
      html += '<div class="eth-wg-live-topbar">';
      html += '  <div class="flex items-center gap-3">';
      html += '    <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shadow-inner">📡</div>';
      html += '    <div>';
      html += '      <div class="flex items-center gap-2">';
      html += '        <h2 class="text-base md:text-lg font-black text-white leading-tight">' + (quiz.title || 'Quiz Test') + '</h2>';
      html += '        <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase">JONLI EFIR</span>';
      html += '      </div>';
      html += '      <div class="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">';
      html += '        <span>O\'quvchilar: <strong class="text-white">' + list.length + ' ta</strong></span>';
      html += '        <span>·</span>';
      html += '        <span>Tugatgan: <strong class="text-emerald-400">' + totalFinished + ' / ' + list.length + '</strong></span>';
      if (totalInfractions > 0) {
        html += '        <span>·</span>';
        html += '        <span class="text-rose-400 font-extrabold">🚨 ' + totalInfractions + ' ogohlantirish</span>';
      }
      html += '      </div>';
      html += '    </div>';
      html += '  </div>';

      // Central Join Code Box (1:1 with Wayground 17:59:33)
      html += '  <div class="eth-wg-live-code-center" id="btnCopyCommandCode" title="Kodni nusxalash">';
      html += '    <span class="text-xs font-bold text-gray-400 uppercase">KOD:</span>';
      html += '    <span class="eth-wg-live-code-digit">' + quiz.code + '</span>';
      html += '    <span style="font-size:16px;">📋</span>';
      html += '  </div>';

      // Right Action Buttons
      html += '  <div class="eth-wg-live-actions">';
      html += '    <button id="btnToggleQuizMusic" class="eth-wg-music-btn eth-music-toggle-btn">';
      html += '      <span>' + (isMusicMuted ? '🔇' : '🔊') + '</span>';
      html += '      <span>' + (isMusicMuted ? 'Ovoz: O\'chiq' : 'Muzika') + '</span>';
      html += '    </button>';
      html += '    <button id="btnTeacherForceFinishLive" class="eth-teacher-finish-btn py-2 px-3 text-xs font-black">';
      html += '      <span>🏁</span>';
      html += '      <span>Yakunlash</span>';
      html += '    </button>';
      html += '    <button id="btnTeacherExitLive" class="eth-quiz-close-btn" title="Chiqish">✕</button>';
      html += '  </div>';
      html += '</div>';

      // 2. SUBBAR: CIRCULAR ACCURACY GAUGE + TABS (Leaderboard & Questions)
      html += '<div class="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-2xl bg-gray-900/90 border border-gray-800 backdrop-blur-xl">';
      html += '  <div class="eth-wg-live-gauge-wrap">';
      html += '    <div class="eth-wg-live-gauge-circle">' + classAccuracyPct + '%</div>';
      html += '    <div>';
      html += '      <div style="font-size:12px;font-weight:800;color:#f8fafc;">Class Accuracy</div>';
      html += '      <div style="font-size:10px;color:#94a3b8;">Sinf o\'rtacha aniqligi</div>';
      html += '    </div>';
      html += '  </div>';

      html += '  <div class="eth-wg-live-tabs">';
      html += '    <button class="eth-wg-live-tab-btn ' + (teacherLiveActiveTab === 'leaderboard' ? 'active' : '') + '" id="btnLiveTabLeaderboard">';
      html += '      <span>🏆</span> <span>Leaderboard (Reyting)</span>';
      html += '    </button>';
      html += '    <button class="eth-wg-live-tab-btn ' + (teacherLiveActiveTab === 'questions' ? 'active' : '') + '" id="btnLiveTabQuestions">';
      html += '      <span>❓</span> <span>Questions (Savollar ' + preparedQuestions.length + ')</span>';
      html += '    </button>';
      html += '  </div>';
      html += '</div>';

      // 3. TAB CONTENT
      if (teacherLiveActiveTab === 'leaderboard') {
        // TAB 1: LEADERBOARD (1:1 with Wayground 17:59:33)
        html += '<div class="eth-wg-live-board">';
        html += '  <div class="eth-wg-live-board-header">';
        html += '    <div class="flex items-center gap-2"><span>👥</span> <span>' + list.length + ' ta o\'quvchi (Students)</span></div>';
        html += '    <span class="text-[11px] text-gray-400">To\'plangan ballar asosida jonli reyting</span>';
        html += '  </div>';

        html += '  <div class="eth-wg-live-sub-header">';
        html += '    <div style="width: 70px;">O\'rin (Rank)</div>';
        html += '    <div style="flex: 1; padding-left: 12px;">O\'quvchi (Student)</div>';
        html += '    <div style="width: 120px; text-align: right;">Ball (Score)</div>';
        html += '    <div style="width: 170px; text-align: right; padding-right: 8px;">Streak & Jarayon 🔥</div>';
        html += '  </div>';

        if (list.length === 0) {
          html += '<div class="p-12 text-center text-gray-400 text-sm font-bold">';
          html += '  <span>⏳ O\'quvchilar qo\'shilishini kutmoqdamiz...</span>';
          html += '</div>';
        } else {
          html += '  <div>';
          list.forEach(function(p, idx) {
            var newRank = idx + 1;
            var oldRank = previousRanksMap[p.id];
            var animClass = '';
            if (oldRank !== undefined) {
              if (newRank > oldRank) animClass = 'rank-fell';
              else if (newRank < oldRank) animClass = 'rank-rose';
            }
            previousRanksMap[p.id] = newRank;

            var hero = p.hero || getStudentHero(p.id, idx);
            var medal = newRank === 1 ? '🥇 1' : (newRank === 2 ? '🥈 2' : (newRank === 3 ? '🥉 3' : (newRank)));
            var streak = p.streak || 0;
            var totalQ = preparedQuestions.length || 1;
            var correctPct = Math.round(((p.correctCount || 0) / totalQ) * 100);
            var wrongPct = Math.round(((p.wrongCount || 0) / totalQ) * 100);

            html += '<div class="eth-wg-live-player-card ' + animClass + '">';
            // Col 1: Rank
            html += '  <div style="width: 70px;" class="font-black text-sm ' + (newRank === 1 ? 'text-amber-400' : 'text-gray-400') + '">' + medal + '</div>';
            // Col 2: Avatar + Name + Badges
            html += '  <div class="eth-wg-live-player-info">';
            html += '    <div class="eth-wg-live-avatar" style="background: ' + hero.bg + '; border: 1.5px solid ' + hero.border + ';">' + hero.emoji + '</div>';
            html += '    <div class="eth-wg-live-player-namebox">';
            html += '      <div class="eth-wg-live-player-name-row">';
            html += '        <span class="font-black text-white text-sm truncate">' + p.name + '</span>';
            if (p.finished) {
              html += '        <span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-black">✅ Yakunladi</span>';
            }
            if (p.infractions > 0) {
              html += '        <span class="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[9px] font-black">🚨 ' + p.infractions + ' marta</span>';
            }
            html += '      </div>';
            html += '      <div class="text-[10px] text-gray-400 font-semibold">' + hero.name + '</div>';
            html += '    </div>';
            html += '  </div>';
            // Col 3: Score
            html += '  <div style="width: 120px; text-align: right;" class="flex-shrink-0">';
            html += '    <div class="font-mono font-black text-base text-amber-400">' + (p.score || 0).toLocaleString() + '</div>';
            html += '    <div class="text-[10px] text-gray-400 uppercase font-bold">Ball</div>';
            html += '  </div>';
            // Col 4: Progress Bar & Streak (Matches 17:59:33)
            html += '  <div style="width: 170px;" class="flex items-center justify-end gap-2 flex-shrink-0">';
            html += '    <div class="eth-wg-live-bar-wrap">';
            html += '      <div class="eth-wg-live-bar-streak">';
            html += '        <span>🔥</span> <span>' + streak + '</span>';
            html += '      </div>';
            html += '      <div class="eth-wg-live-bar-correct" style="width: ' + correctPct + '%;"></div>';
            html += '      <div class="eth-wg-live-bar-incorrect" style="width: ' + wrongPct + '%;"></div>';
            html += '    </div>';
            html += '  </div>';
            html += '</div>';
          });
          html += '  </div>';
        }
        html += '</div>';
      } else {
        // TAB 2: QUESTIONS BREAKDOWN (Sequential list of questions with option distribution)
        html += '<div class="space-y-4 max-h-[620px] overflow-y-auto pr-1">';
        preparedQuestions.forEach(function(q, qIdx) {
          var totalAnswered = 0;
          var correctCountTotal = 0;
          var optCounts = {};
          var optStudents = {};
          (q.options || []).forEach(function(opt, oIdx) {
            optCounts[oIdx] = 0;
            optStudents[oIdx] = [];
          });

          list.forEach(function(st) {
            var stAns = st.answers ? (st.answers[q.id] || st.answers['q_' + qIdx]) : null;
            if (stAns !== undefined && stAns !== null && stAns.chosenOriginalIndex !== undefined) {
              totalAnswered++;
              var cIdx = stAns.chosenOriginalIndex;
              if (optCounts[cIdx] !== undefined) {
                optCounts[cIdx]++;
                optStudents[cIdx].push(st.name);
              }
              if (stAns.isCorrect) correctCountTotal++;
            }
          });

          var accPct = totalAnswered > 0 ? Math.round((correctCountTotal / totalAnswered) * 100) : 100;
          var isHighAcc = accPct >= 70;
          var isLowAcc = accPct < 40;

          var corrOpt = q.options[q.correctAnswer || 0];
          var corrText = (typeof corrOpt === 'object' && corrOpt !== null) ? (corrOpt.text || '') : String(corrOpt || '');

          html += '<div class="eth-wg-qreport-card">';
          html += '  <div class="eth-wg-qreport-header">';
          html += '    <div>';
          html += '      <div class="eth-wg-qreport-title">Question ' + (qIdx + 1) + ': ' + q.question + '</div>';
          html += '      <div class="eth-wg-qreport-correct-pill">';
          html += '        <span>✅</span>';
          html += '        <span>To\'g\'ri javob: ' + String.fromCharCode(65 + (q.correctAnswer || 0)) + ') ' + esc(corrText) + '</span>';
          html += '      </div>';
          html += '    </div>';
          html += '    <span class="eth-wg-qreport-acc-badge ' + (isHighAcc ? 'high' : (isLowAcc ? 'low' : 'mid')) + '">';
          html += '      ' + accPct + '% Aniqlik';
          html += '    </span>';
          html += '  </div>';

          html += '  <div class="eth-wg-qreport-options-grid">';
          (q.options || []).forEach(function(opt, oIdx) {
            var letter = String.fromCharCode(65 + oIdx);
            var isCorr = (oIdx === (q.correctAnswer || 0));
            var oCount = optCounts[oIdx] || 0;
            var oPct = totalAnswered > 0 ? Math.round((oCount / totalAnswered) * 100) : 0;
            var stList = optStudents[oIdx] || [];
            var optText = (typeof opt === 'object' && opt !== null) ? (opt.text || '') : String(opt || '');

            html += '<div class="eth-wg-qreport-opt-box ' + (isCorr ? 'is-correct' : '') + '">';
            html += '  <div class="eth-wg-qreport-opt-top">';
            html += '    <span style="' + (isCorr ? 'color:#10b981;font-weight:900;' : '') + '">' + letter + ') ' + esc(optText) + (isCorr ? ' ✅' : '') + '</span>';
            html += '    <span style="font-family: monospace; font-size: 11px; opacity: 0.85;">' + oCount + ' (' + oPct + '%)</span>';
            html += '  </div>';

            html += '  <div class="eth-wg-qreport-bar-track">';
            html += '    <div class="eth-wg-qreport-bar-fill ' + (isCorr ? 'is-correct' : '') + '" style="width:' + oPct + '%;"></div>';
            html += '  </div>';

            if (stList.length > 0) {
              html += '  <div class="eth-wg-qreport-students" title="' + stList.join(', ') + '">';
              html += '    👥 Tanlaganlar: <strong>' + stList.join(', ') + '</strong>';
              html += '  </div>';
            } else {
              html += '  <div class="eth-wg-qreport-students" style="opacity: 0.6; font-style: italic;">Hech kim tanlamadi</div>';
            }
            html += '</div>';
          });
          html += '  </div>';

          html += '</div>';
        });
        html += '</div>';
      }

      html += '</div>'; // End Screen

      root.innerHTML = html;

      // Event listeners for tabs
      var tabLeaderboard = root.querySelector('#btnLiveTabLeaderboard');
      if (tabLeaderboard) {
        tabLeaderboard.onclick = function() {
          teacherLiveActiveTab = 'leaderboard';
          renderTeacherCommandCenter();
        };
      }
      var tabQuestions = root.querySelector('#btnLiveTabQuestions');
      if (tabQuestions) {
        tabQuestions.onclick = function() {
          teacherLiveActiveTab = 'questions';
          renderTeacherCommandCenter();
        };
      }

      var btnCopyCode = root.querySelector('#btnCopyCommandCode');
      if (btnCopyCode) {
        btnCopyCode.onclick = function() {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(quiz.code).then(function() {
              alert("Quiz kodi nusxalandi: " + quiz.code);
            });
          } else {
            prompt("Quiz kodi:", quiz.code);
          }
        };
      }

      var btnMusic = root.querySelector('#btnToggleQuizMusic');
      if (btnMusic) {
        btnMusic.onclick = toggleMusicMute;
      }

      var btnFinishLive = root.querySelector('#btnTeacherForceFinishLive');
      if (btnFinishLive) {
        btnFinishLive.onclick = function() {
          if (!confirm("Barcha o\'quvchilar uchun bellashuvni to\'xtatib, yakuniy 3D sovrinlar shousi va tahlilga o\'tilsinmi?")) return;
          executeOfficialFinish();
        };
      }

      var btnExitLive = root.querySelector('#btnTeacherExitLive');
      if (btnExitLive) {
        btnExitLive.onclick = function() {
          if (confirm("Jonli nazorat markazidan chiqishni xohlaysizmi? O\'quvchilar testni davom ettiradi.")) {
            cleanupListeners();
            root.remove();
          }
        };
      }
    }

    // PHASE 3B: STUDENT PLAYING QUESTIONS (10S SPEED BONUS + 2x2 VIBRANT CARDS)
    function updateLiveRankPill() {
      var rankEl = root.querySelector('#liveRankPill');
      var scoreEl = root.querySelector('#liveScorePill');
      if (rankEl) {
        var r = getMyRank();
        rankEl.textContent = (r === 1 ? '🥇 1-o\'rin' : (r === 2 ? '🥈 2-o\'rin' : (r === 3 ? '🥉 3-o\'rin' : ('#' + r + '-o\'rin'))));
      }
      if (scoreEl) {
        scoreEl.textContent = myScore.toLocaleString() + ' Ball';
      }
    }

    function renderPlayingQuestion() {
      currentPhase = 'playing';
      if (currentQIndex >= preparedQuestions.length) {
        finishMyQuiz();
        return;
      }

      var q = preparedQuestions[currentQIndex];
      questionRemainingMs = 10000;
      questionStartTime = Date.now();
      var isAnswered = false;

      var html = '<div class="max-w-3xl w-full mx-auto space-y-5 pb-12 animate-fade-in">';

      // Top Status Bar
      html += '<div class="eth-quiz-topbar flex items-center justify-between px-5 py-3 rounded-2xl bg-gray-900/95 border border-gray-700/80 backdrop-blur-md shadow-xl">';
      html += '  <div class="flex items-center gap-3">';
      html += '    <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xl" style="background: ' + myHero.bg + '; border: 1.5px solid ' + myHero.border + ';">' + myHero.emoji + '</div>';
      html += '    <span class="text-xs font-bold uppercase tracking-wider text-gray-400">Savol:</span>';
      html += '    <span class="text-sm font-black text-white">' + (currentQIndex + 1) + ' / ' + preparedQuestions.length + '</span>';
      html += '  </div>';
      html += '  <div class="flex items-center gap-2.5">';
      if (myStreak >= 2) {
        html += '    <div class="px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-black animate-pulse">🔥 ' + myStreak + ' streak</div>';
      }
      html += '    <button id="btnToggleQuizMusic" class="eth-wayground-music-btn eth-music-toggle-btn text-xs py-1 px-2.5">';
      html +=        (isMusicMuted ? '🔇 Muzika' : '🔊 Muzika');
      html += '    </button>';
      html += '    <div id="liveRankPill" class="eth-quiz-rank-pill">#' + getMyRank() + '-o\'rin</div>';
      html += '    <div id="liveScorePill" class="eth-quiz-score-pill">' + myScore.toLocaleString() + ' Ball</div>';
      html += '  </div>';
      html += '</div>';

      // 10s Timer Bar
      html += '<div class="space-y-1.5">';
      html += '  <div class="flex items-center justify-between text-xs font-bold text-gray-300 px-1">';
      html += '    <span id="timerTextLabel" class="text-amber-400">⚡ Tezlik bonusi: 10.0s (+100 ball)</span>';
      html += '    <span class="text-gray-400">To\'g\'ri: +600 | Xato: -500</span>';
      html += '  </div>';
      html += '  <div class="eth-quiz-timer-track">';
      html += '    <div id="quizTimerBar" class="eth-quiz-timer-fill" style="width: 100%;"></div>';
      html += '  </div>';
      html += '</div>';

      // Power-ups / Booster Action Bar in Quiz Battle
      var b50 = (S.user && S.user.boosters && S.user.boosters['50_50']) || 0;
      var bFreeze = (S.user && S.user.boosters && S.user.boosters['time_freeze']) || 0;
      var bShield = (S.user && S.user.boosters && S.user.boosters['shield']) || 0;
      var bHint = (S.user && S.user.boosters && S.user.boosters['hint_master']) || 0;
      var bAuto = (S.user && S.user.boosters && S.user.boosters['auto_solve']) || 0;
      var bTimeBonus = (S.user && S.user.boosters && S.user.boosters['time_bonus']) || 0;

      if (b50 > 0 || bFreeze > 0 || bShield > 0) {
        html += '<div class="eth-quiz-booster-bar flex items-center justify-center gap-3 py-1">';
        if (b50 > 0) {
          html += '<button id="btnQuizBooster50" type="button" class="eth-booster-action-btn">✂️ 50/50 (' + b50 + ')</button>';
        }
        if (bFreeze > 0) {
          html += '<button id="btnQuizBoosterFreeze" type="button" class="eth-booster-action-btn">⏱️ Vaqt Muzlatish +15s (' + bFreeze + ')</button>';
        }
        if (bShield > 0) {
          html += '<div class="eth-booster-action-btn" style="border-color:#38bdf8;background:rgba(2,132,199,0.2);color:#7dd3fc;cursor:default;">🛡️ Qalqon Faol (' + bShield + ')</div>';
        }
        if (bHint > 0) {
          html += '<button id="btnQuizBoosterHint" type="button" class="eth-booster-action-btn">💡 Yordam (' + bHint + ')</button>';
        }
        if (bTimeBonus > 0) {
          html += '<button id="btnQuizBoosterTimeBonus" type="button" class="eth-booster-action-btn">⏱️ +20s Vaqt (' + bTimeBonus + ')</button>';
        }
        if (bAuto > 0) {
          html += '<button id="btnQuizBoosterAuto" type="button" class="eth-booster-action-btn">🤖 Avto-AI (' + bAuto + ')</button>';
        }
        html += '</div>';
      }

      // Question Card
      html += '<div class="eth-quiz-card space-y-6">';
      html += '  <div class="text-xl md:text-3xl font-black text-white leading-relaxed text-center">' + q.question + '</div>';

      // 2x2 Clean Circular Badges Options Grid (NO GEOMETRIC SHAPES!)
      html += '  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">';
      var optClasses = ['eth-quiz-opt-a', 'eth-quiz-opt-b', 'eth-quiz-opt-c', 'eth-quiz-opt-d'];
      var letters = ['A', 'B', 'C', 'D'];

      q.options.forEach(function(optObj, sIdx) {
        var optClass = optClasses[sIdx % optClasses.length];
        var letter = letters[sIdx % letters.length] || String.fromCharCode(65 + sIdx);

        html += '<button class="eth-quiz-opt-btn ' + optClass + '" data-scrambled-idx="' + sIdx + '">';
        html += '  <span class="eth-quiz-opt-letter">' + letter + '</span>';
        html += '  <span class="text-base font-extrabold text-white text-left flex-1">' + optObj.text + '</span>';
        html += '</button>';
      });
      html += '  </div>';
      html += '</div>';

      // Floating Feedback Container
      html += '<div id="feedbackContainer" class="h-12 flex items-center justify-center"></div>';

      html += '</div>';

      root.innerHTML = html;
      updateLiveRankPill();

      var btnMusic = root.querySelector('#btnToggleQuizMusic');
      if (btnMusic) btnMusic.onclick = toggleMusicMute;

      // Booster 50/50 in Quiz
      var btnQ50 = root.querySelector('#btnQuizBooster50');
      if (btnQ50) {
        btnQ50.onclick = function() {
          if (isAnswered) return;
          if (!S.user || !S.user.boosters || (S.user.boosters['50_50'] || 0) <= 0) return;
          S.user.boosters['50_50']--;
          App.saveState();
          btnQ50.disabled = true;
          btnQ50.innerHTML = '✂️ 50/50 (Qo\'llanildi)';
          var wrongBtns = [];
          root.querySelectorAll('.eth-quiz-opt-btn').forEach(function(b) {
            var sIdx = parseInt(b.getAttribute('data-scrambled-idx'), 10);
            if (!q.options[sIdx] || !q.options[sIdx].isCorrect) wrongBtns.push(b);
          });
          wrongBtns.sort(function() { return 0.5 - Math.random(); });
          for (var wi = 0; wi < Math.min(2, wrongBtns.length); wi++) {
            wrongBtns[wi].style.opacity = '0.2';
            wrongBtns[wi].style.pointerEvents = 'none';
          }
        };
      }

      // Booster Time Freeze in Quiz (+15s)
            var btnQHint = root.querySelector('#btnQuizBoosterHint');
      if (btnQHint) {
        btnQHint.onclick = function() {
          if (isAnswered) return;
          if (!S.user || !S.user.boosters || (S.user.boosters['hint_master'] || 0) <= 0) return;
          S.user.boosters['hint_master']--;
          App.saveState();
          btnQHint.disabled = true;
          var correctOpt = q.options.find(function(o) { return o.isCorrect; });
          var hintText = correctOpt ? correctOpt.text : '';
          alert('💡 Donishmand Maslahati:\nTo\'g\'ri javob: "' + hintText.slice(0, Math.ceil(hintText.length / 2)) + '..."');
        };
      }

      var btnQTimeBonus = root.querySelector('#btnQuizBoosterTimeBonus');
      if (btnQTimeBonus) {
        btnQTimeBonus.onclick = function() {
          if (isAnswered) return;
          if (!S.user || !S.user.boosters || (S.user.boosters['time_bonus'] || 0) <= 0) return;
          S.user.boosters['time_bonus']--;
          App.saveState();
          btnQTimeBonus.disabled = true;
          questionStartTime += 20000;
        };
      }

      var btnQAuto = root.querySelector('#btnQuizBoosterAuto');
      if (btnQAuto) {
        btnQAuto.onclick = function() {
          if (isAnswered) return;
          if (!S.user || !S.user.boosters || (S.user.boosters['auto_solve'] || 0) <= 0) return;
          S.user.boosters['auto_solve']--;
          App.saveState();
          btnQAuto.disabled = true;
          var correctBtn = null;
          root.querySelectorAll('.eth-quiz-opt-btn').forEach(function(b) {
            var sIdx = parseInt(b.getAttribute('data-scrambled-idx'), 10);
            if (q.options[sIdx] && q.options[sIdx].isCorrect) correctBtn = b;
          });
          if (correctBtn) correctBtn.click();
        };
      }

      var btnQFreeze = root.querySelector('#btnQuizBoosterFreeze');
      if (btnQFreeze) {
        btnQFreeze.onclick = function() {
          if (isAnswered) return;
          if (!S.user || !S.user.boosters || (S.user.boosters['time_freeze'] || 0) <= 0) return;
          S.user.boosters['time_freeze']--;
          App.saveState();
          btnQFreeze.disabled = true;
          btnQFreeze.innerHTML = '⏱️ Vaqt Muzlatildi (+15s)';
          questionStartTime += 15000;
        };
      }

      // Start 10s Timer
      var timerBar = root.querySelector('#quizTimerBar');
      var timerLabel = root.querySelector('#timerTextLabel');

      if (questionTimerInterval) clearInterval(questionTimerInterval);
      questionTimerInterval = setInterval(function() {
        if (isAnswered) {
          clearInterval(questionTimerInterval);
          return;
        }
        var elapsed = Date.now() - questionStartTime;
        questionRemainingMs = Math.max(0, 10000 - elapsed);
        var pct = (questionRemainingMs / 10000) * 100;

        if (timerBar) timerBar.style.width = pct + '%';

        if (questionRemainingMs > 0) {
          if (timerLabel) timerLabel.innerHTML = '⚡ Tezlik bonusi: ' + (questionRemainingMs / 1000).toFixed(1) + 's (+100 ball)';
        } else {
          if (timerLabel) timerLabel.innerHTML = '<span class="text-gray-400">⚡ Bonus muddati tugadi (Asosiy ball: +600)</span>';
          if (timerBar) timerBar.style.background = '#6b7280';
        }
      }, 50);

      // Handle Option Selection
      root.querySelectorAll('.eth-quiz-opt-btn').forEach(function(btn) {
        btn.onclick = function() {
          if (isAnswered) return;
          isAnswered = true;
          if (questionTimerInterval) clearInterval(questionTimerInterval);

          var sIdx = parseInt(btn.getAttribute('data-scrambled-idx'), 10);
          var chosenOptObj = q.options[sIdx];
          var elapsedSec = (Date.now() - questionStartTime) / 1000;
          var hasBonus = (elapsedSec <= 10.2);
          var isCorrect = Boolean(chosenOptObj && chosenOptObj.isCorrect);

          var feedbackHtml = '';

          if (isCorrect) {
            myStreak++;
            correctCount++;
            var earned = 600 + (hasBonus ? 100 : 0);
            myScore += earned;
            btn.classList.add('correct');
            feedbackHtml = '<div class="eth-quiz-bonus-tag">' + (hasBonus ? '⚡ +700 (Tezlik Bonusi!)' : '✅ +600 Ball') + '</div>';
          } else {
            myStreak = 0;
            wrongCount++;
            var shieldSaved = false;
            if (S.user && S.user.boosters && (S.user.boosters['shield'] || 0) > 0) {
              S.user.boosters['shield']--;
              App.saveState();
              shieldSaved = true;
            } else {
              myScore = Math.max(0, myScore - 500);
            }
            btn.classList.add('incorrect');
            // Highlight the correct one
            root.querySelectorAll('.eth-quiz-opt-btn').forEach(function(otherBtn) {
              var otherIdx = parseInt(otherBtn.getAttribute('data-scrambled-idx'), 10);
              if (q.options[otherIdx] && q.options[otherIdx].isCorrect) {
                otherBtn.classList.add('correct');
              }
            });
            feedbackHtml = shieldSaved ?
              '<div class="eth-quiz-bonus-tag" style="background:#0284c7;color:#fff;border-color:#38bdf8">🛡️ QALQON SAQLAB QOLDI! (0 Ball Jarima)</div>' :
              '<div class="eth-quiz-bonus-tag incorrect">❌ -500 Ball</div>';
          }

          // Record answer
          studentAnswersMap[q.id || ('q_' + currentQIndex)] = {
            questionText: q.question,
            chosenOriginalIndex: chosenOptObj ? chosenOptObj.origIndex : 0,
            isCorrect: isCorrect,
            timeTaken: elapsedSec
          };

          if (participantsMap[myStudentId]) {
            participantsMap[myStudentId].score = myScore;
            participantsMap[myStudentId].currentQ = currentQIndex + 1;
            participantsMap[myStudentId].correctCount = correctCount;
            participantsMap[myStudentId].wrongCount = wrongCount;
            participantsMap[myStudentId].streak = myStreak;
            participantsMap[myStudentId].answers = studentAnswersMap;
          }

          if (window.EthithSync && window.EthithSync.publishLive) {
            window.EthithSync.publishLive({
              type: 'QUIZ_SCORE_UPDATE',
              quizId: quiz.id,
              studentId: myStudentId,
              studentName: myStudentName,
              score: myScore,
              currentQ: currentQIndex + 1,
              totalQ: preparedQuestions.length,
              correctCount: correctCount,
              wrongCount: wrongCount,
              streak: myStreak,
              infractions: silentInfractions,
              answers: studentAnswersMap
            });
          }

          updateLiveRankPill();

          var fBox = root.querySelector('#feedbackContainer');
          if (fBox) fBox.innerHTML = feedbackHtml;

          setTimeout(function() {
            currentQIndex++;
            renderPlayingQuestion();
          }, 1200);
        };
      });
    }

    // PHASE 4: FINISH MY QUIZ & WAIT OTHERS (Points determine rank, not time)
    function finishMyQuiz() {
      currentPhase = 'waiting_others';
      if (participantsMap[myStudentId]) {
        participantsMap[myStudentId].finished = true;
      }

      if (window.EthithSync && window.EthithSync.publishLive) {
        window.EthithSync.publishLive({
          type: 'QUIZ_FINISHED',
          quizId: quiz.id,
          studentId: myStudentId,
          studentName: myStudentName,
          score: myScore,
          answers: studentAnswersMap
        });
      }

      // Students must wait for the teacher to officially finish the test
      renderWaitingOthers();
    }

    function renderWaitingOthers() {
      var list = Object.values(participantsMap);
      list.sort(function(a, b) { return b.score - a.score; });

      var html = '<div class="max-w-2xl w-full mx-auto p-6 md:p-8 bg-gray-900/95 border border-gray-700/80 rounded-3xl backdrop-blur-xl text-center space-y-6 shadow-2xl animate-fade-in">';
      html += '  <div class="text-6xl animate-bounce">🎉</div>';
      html += '  <div class="space-y-2">';
      html += '    <h3 class="text-2xl md:text-3xl font-black text-white">Siz barcha savollarni yakunladingiz!</h3>';
      if (isTeacher) {
        html += '    <p class="text-xs md:text-sm text-gray-300">O\'quvchilar javoblarini yakunlashini kuting yoki istalgan payt bellashuvni rasman to\'xtatib sovrinlarni barchaga e\'lon qiling.</p>';
      } else {
        html += '    <div style="background:rgba(245,158,11,0.15);border:1.5px solid #f59e0b;border-radius:14px;padding:12px 16px;text-align:center;">';
        html += '      <div style="font-size:13px;font-weight:900;color:#fbbf24;display:flex;align-items:center;justify-content:center;gap:6px;">⏳ O\'qituvchi testni yakunlashini kuting...</div>';
        html += '      <div style="font-size:11.5px;color:#cbd5e1;font-weight:600;margin-top:4px;">1, 2 va 3-o\'rinlar hamda kulgili sovrinlar faqat o\'qituvchi testni rasman yakunlaganidan so\'ng barchaga bir vaqtda e\'lon qilinadi!</div>';
        html += '    </div>';
      }
      html += '  </div>';

      html += '  <div class="p-5 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-inner space-y-1">';
      html += '    <div class="text-xs text-gray-400 font-bold uppercase tracking-wider">Sizning yakuniy to\'plagan balingiz:</div>';
      html += '    <div class="text-4xl md:text-5xl font-mono font-black text-amber-400">' + myScore.toLocaleString() + ' Ball</div>';
      html += '    <div class="text-xs text-emerald-400 font-bold mt-1">To\'g\'ri: ' + correctCount + ' ta · Xato: ' + wrongCount + ' ta</div>';
      html += '  </div>';

      html += '  <div class="space-y-2 text-left">';
      html += '    <div class="text-xs font-bold text-gray-300 px-1">Qatnashuvchilar holati (Jonli):</div>';
      html += '    <div class="space-y-2 max-h-56 overflow-y-auto pr-1">';
      list.forEach(function(p, idx) {
        var isMe = (p.id === myStudentId);
        var hero = p.hero || getStudentHero(p.id, idx);
        html += '<div class="px-3.5 py-2.5 rounded-2xl bg-gray-800/70 border ' + (isMe ? 'border-amber-500/80 text-amber-300 font-black' : 'border-gray-700 text-gray-300') + ' text-xs flex items-center justify-between">';
        html += '  <div class="flex items-center gap-2.5 truncate">';
        html += '    <span class="font-mono font-bold text-gray-400 w-5">#' + (idx + 1) + '</span>';
        html += '    <span class="text-lg">' + hero.emoji + '</span>';
        html += '    <span class="truncate font-extrabold">' + p.name + (p.finished ? ' (Yakunladi ✅)' : ' (Yechmoqda ⏳)') + '</span>';
        html += '  </div>';
        html += '  <span class="font-mono font-black text-amber-400 text-sm">' + (p.score || 0).toLocaleString() + '</span>';
        html += '</div>';
      });
      html += '    </div>';
      html += '  </div>';

      if (isTeacher) {
        html += '  <button id="btnTeacherFinishFromWaiting" class="eth-teacher-finish-btn w-full justify-center text-sm py-3.5">';
        html += '    🏁 Testni Barchaga To\'xtatish va Sovg\'alarni Berish';
        html += '  </button>';
      } else if (list.length <= 1) {
        html += '  <button id="btnStudentSoloFinish" class="eth-teacher-finish-btn w-full justify-center text-sm py-3.5" style="background:rgba(59,130,246,0.3);border-color:#3b82f6;">';
        html += '    🏁 Yakka mashg\'ulotni yakunlash va natijani ko\'rish';
        html += '  </button>';
      }

      html += '</div>';

      root.innerHTML = html;

      var btnFinish = root.querySelector('#btnTeacherFinishFromWaiting');
      if (btnFinish) {
        btnFinish.onclick = function() {
          if (!confirm("Barcha o\'quvchilar uchun bellashuvni to\'xtatib, yakuniy 3D sovrinlar shousi va tahlilga o\'tilsinmi?")) return;
          executeOfficialFinish();
        };
      }

      var btnSolo = root.querySelector('#btnStudentSoloFinish');
      if (btnSolo) {
        btnSolo.onclick = function() {
          executeOfficialFinish();
        };
      }
    }

    // OFFICIAL FINISH: Synchronously determine ranks, assign official prizes, and broadcast to all
    function executeOfficialFinish() {
      var list = Object.values(participantsMap);
      list.sort(function(a, b) { return b.score - a.score; });

      var prize1 = window.ETHITH_GET_RANDOM_PRIZE ? window.ETHITH_GET_RANDOM_PRIZE(1) : { name: "Eski rezina tapichka (43-razmer)", icon: "🩴", desc: "Sifatli va qalin tapichka", rarity: "oddiy", price: 60 };
      var prize2 = window.ETHITH_GET_RANDOM_PRIZE ? window.ETHITH_GET_RANDOM_PRIZE(2) : { name: "Bolalar tagligi (Pampers XXL)", icon: "👶", desc: "Ultra singdiruvchi maxsus sovg\'a", rarity: "kamyob", price: 180 };
      var prize3 = window.ETHITH_GET_RANDOM_PRIZE ? window.ETHITH_GET_RANDOM_PRIZE(3) : { name: "Baland poshnali qizil tufli", icon: "👠", desc: "Klassik 12 sm poshnali ko\'rkam tufli", rarity: "epika", price: 350 };

      if (!prize1.price && window.ETHITH_GET_PRIZE_PRICE) prize1.price = window.ETHITH_GET_PRIZE_PRICE(prize1);
      if (!prize2.price && window.ETHITH_GET_PRIZE_PRICE) prize2.price = window.ETHITH_GET_PRIZE_PRICE(prize2);
      if (!prize3.price && window.ETHITH_GET_PRIZE_PRICE) prize3.price = window.ETHITH_GET_PRIZE_PRICE(prize3);

      var officialPrizes = { 1: prize1, 2: prize2, 3: prize3 };

      var rankingsData = list.map(function(p, idx) {
        return {
          rank: idx + 1,
          id: p.id,
          name: p.name,
          hero: p.hero || getStudentHero(p.id, idx),
          score: p.score || 0,
          correctCount: p.correctCount || 0,
          wrongCount: p.wrongCount || 0,
          infractions: p.infractions || 0,
          answers: p.answers || {},
          prize: (idx === 0 ? prize1 : (idx === 1 ? prize2 : (idx === 2 ? prize3 : null)))
        };
      });

      if (window.EthithSync && window.EthithSync.publishLive) {
        window.EthithSync.publishLive({
          type: 'QUIZ_FINISH_PODIUM',
          quizId: quiz.id,
          officialPrizes: officialPrizes,
          rankings: rankingsData
        });
      }

      renderFinalePodium(officialPrizes, rankingsData);
    }

    // PHASE 5: FINALE PODIUM WITH SYNCHRONIZED PRIZES & COIN ECONOMY
    function renderFinalePodium(officialPrizes, providedRankings) {
      currentPhase = 'finished';
      cleanupListeners();
      stopBattleMusic();

      var list = [];
      if (Array.isArray(providedRankings) && providedRankings.length > 0) {
        list = providedRankings;
      } else {
        list = Object.values(participantsMap);
        list.sort(function(a, b) { return b.score - a.score; });
      }

      var winner1 = list[0] || null;
      var winner2 = list[1] || null;
      var winner3 = list[2] || null;

      var prize1 = (officialPrizes && officialPrizes[1]) ? officialPrizes[1] : (window.ETHITH_GET_RANDOM_PRIZE ? window.ETHITH_GET_RANDOM_PRIZE(1) : { name: "Eski rezina tapichka (43-razmer)", icon: "🩴", desc: "Sifatli va qalin tapichka", rarity: "oddiy", price: 60 });
      var prize2 = (officialPrizes && officialPrizes[2]) ? officialPrizes[2] : (window.ETHITH_GET_RANDOM_PRIZE ? window.ETHITH_GET_RANDOM_PRIZE(2) : { name: "Bolalar tagligi (Pampers XXL)", icon: "👶", desc: "Ultra singdiruvchi maxsus sovg\'a", rarity: "kamyob", price: 180 });
      var prize3 = (officialPrizes && officialPrizes[3]) ? officialPrizes[3] : (window.ETHITH_GET_RANDOM_PRIZE ? window.ETHITH_GET_RANDOM_PRIZE(3) : { name: "Baland poshnali qizil tufli", icon: "👠", desc: "Klassik 12 sm poshnali ko\'rkam tufli", rarity: "epika", price: 350 });

      if (!prize1.price && window.ETHITH_GET_PRIZE_PRICE) prize1.price = window.ETHITH_GET_PRIZE_PRICE(prize1);
      if (!prize2.price && window.ETHITH_GET_PRIZE_PRICE) prize2.price = window.ETHITH_GET_PRIZE_PRICE(prize2);
      if (!prize3.price && window.ETHITH_GET_PRIZE_PRICE) prize3.price = window.ETHITH_GET_PRIZE_PRICE(prize3);

      if (winner1) winner1.prize = prize1;
      if (winner2) winner2.prize = prize2;
      if (winner3) winner3.prize = prize3;

      var myRank = getMyRank();
      var awardedPrize = null;
      if (myRank === 1) {
        try {
          if (window.playVictoryFanfare) {
            window.playVictoryFanfare(S.user ? S.user.victorySound : 'royal_fanfare');
          }
        } catch(e) {}
      }
      if (!hasAwardedPrizeThisSession && myRank <= 3 && S.user) {
        hasAwardedPrizeThisSession = true;
        if (!Array.isArray(S.user.gifts)) S.user.gifts = [];
        awardedPrize = (myRank === 1 ? prize1 : (myRank === 2 ? prize2 : prize3));
        var newWonGift = {
          id: 'gift_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          quizId: quiz.id,
          name: awardedPrize.name,
          icon: awardedPrize.icon,
          desc: awardedPrize.desc,
          price: awardedPrize.price || (window.ETHITH_GET_PRIZE_PRICE ? window.ETHITH_GET_PRIZE_PRICE(awardedPrize) : 100),
          rarity: awardedPrize.rarity || 'oddiy',
          rank: myRank,
          quizTitle: quiz.title,
          wonAt: Date.now()
        };
        S.user.gifts.unshift(newWonGift);

        // Also add to user\'s record in S.accounts
        if (Array.isArray(S.accounts)) {
          var myAccountRec = S.accounts.find(function(a) {
            return (a.email && S.user.email && a.email.toLowerCase() === S.user.email.toLowerCase()) ||
                   (a.name && S.user.name && a.name.toLowerCase() === S.user.name.toLowerCase());
          });
          if (myAccountRec) {
            if (!Array.isArray(myAccountRec.gifts)) myAccountRec.gifts = [];
            myAccountRec.gifts.unshift(newWonGift);
            if (myAccountRec.coins === undefined) myAccountRec.coins = S.user.coins || 150;
          }
        }

        // Dedicated local backup
        var myUserKey = (S.user.email || S.user.name || 'user').toLowerCase().trim();
        try {
          var bkpList = JSON.parse(localStorage.getItem('ethith_student_gifts_' + myUserKey) || '[]');
          bkpList.unshift(newWonGift);
          localStorage.setItem('ethith_student_gifts_' + myUserKey, JSON.stringify(bkpList));
        } catch(e) {}

        if (window.EthithApp && window.EthithApp.saveState) window.EthithApp.saveState();
        else if (typeof App !== 'undefined' && App.saveState) App.saveState();

        if (window.EthithSync && window.EthithSync.publishLive) {
          window.EthithSync.publishLive({
            type: 'USER_STATE_SYNC',
            user: {
              id: S.user.id,
              name: S.user.name,
              email: S.user.email,
              role: S.user.role,
              coins: S.user.coins,
              avatar: S.user.avatar,
              level: S.level || S.user.level,
              nameStyle: S.user.nameStyle,
              title: S.user.title,
              dailyMinutes: S.user.dailyMinutes
            }
          });
          if (window.EthithSync.pushRemoteStore) window.EthithSync.pushRemoteStore();
        }

        if (window._ethithRefreshGifts) window._ethithRefreshGifts();
      } else if (myRank <= 3) {
        awardedPrize = (myRank === 1 ? prize1 : (myRank === 2 ? prize2 : prize3));
      }

      // Compile Persistent Teacher Analytics (Original Question Order)
      var questionStats = (quiz.questions || []).map(function(origQ, qIdx) {
        var optCounts = { 0: 0, 1: 0, 2: 0, 3: 0 };
        var optStudents = { 0: [], 1: [], 2: [], 3: [] };
        var correctCountTotal = 0;
        var totalAnswered = 0;

        list.forEach(function(student) {
          if (!student.answers) return;
          var ans = student.answers[origQ.id] || student.answers['q_' + qIdx];
          if (!ans) {
            for (var k in student.answers) {
              if (student.answers[k] && student.answers[k].questionText === origQ.question) {
                ans = student.answers[k];
                break;
              }
            }
          }

          if (ans !== undefined && ans.chosenOriginalIndex !== undefined) {
            totalAnswered++;
            var cIdx = ans.chosenOriginalIndex;
            if (optCounts[cIdx] !== undefined) {
              optCounts[cIdx]++;
              optStudents[cIdx].push(student.name);
            }
            if (ans.isCorrect) correctCountTotal++;
          }
        });

        var accPct = totalAnswered > 0 ? Math.round((correctCountTotal / totalAnswered) * 100) : 0;

        return {
          questionIndex: qIdx,
          questionText: origQ.question,
          options: origQ.options,
          correctAnswer: origQ.correctAnswer || 0,
          optCounts: optCounts,
          optStudents: optStudents,
          totalAnswered: totalAnswered,
          accuracyPct: accPct
        };
      });

      var sortedByMistakes = list.slice().sort(function(a, b) { return (b.wrongCount || 0) - (a.wrongCount || 0); });
      var mostMistakesStudent = sortedByMistakes[0] || null;
      var leastMistakesStudent = sortedByMistakes[sortedByMistakes.length - 1] || null;

      quiz.lastSessionAnalysis = {
        finishedAt: Date.now(),
        totalParticipants: list.length,
        questionStats: questionStats,
        officialPrizes: { 1: prize1, 2: prize2, 3: prize3 },
        rankings: list.map(function(p, idx) {
          return {
            rank: idx + 1,
            id: p.id,
            name: p.name,
            hero: p.hero || getStudentHero(p.id, idx),
            score: p.score,
            correctCount: p.correctCount,
            wrongCount: p.wrongCount,
            infractions: p.infractions,
            answers: p.answers || {},
            prize: p.prize || (idx === 0 ? prize1 : (idx === 1 ? prize2 : (idx === 2 ? prize3 : null)))
          };
        }),
        mostMistakesStudent: mostMistakesStudent ? { name: mostMistakesStudent.name, wrongCount: mostMistakesStudent.wrongCount } : null,
        leastMistakesStudent: leastMistakesStudent ? { name: leastMistakesStudent.name, correctCount: leastMistakesStudent.correctCount } : null
      };
      quiz.status = 'finished';
      App.saveState();

      // Render 3D Podium HTML
      var html = '<div class="max-w-4xl w-full mx-auto p-6 md:p-8 space-y-8 animate-fade-in pb-16 text-center">';
      html += '  <div class="space-y-2">';
      html += '    <div class="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/20 text-amber-400 font-extrabold text-xs uppercase tracking-widest">';
      html += '      <span>🏆 QUIZ BATTLE G\'OLIBLARI VA KULGILI SOVRINLAR</span>';
      html += '    </div>';
      html += '    <h2 class="text-3xl md:text-5xl font-black text-white tracking-tight">' + (quiz.title || 'Quiz Test') + '</h2>';
      html += '    <p class="text-xs md:text-sm text-gray-400">Bellashuv yakunlandi! 1, 2 va 3-o\'rin sohiblariga 100 dan ortiq kulgili 3D sovg\'alar taqdim etildi.</p>';
      html += '  </div>';

      // 3-Step Podium
      html += '  <div class="eth-quiz-podium-wrap flex flex-col md:flex-row items-end justify-center gap-4 pt-8">';

      // 2nd Place (Silver)
      if (winner2) {
        html += '<div class="w-full md:w-1/3 order-2 md:order-1 space-y-3">';
        html += '  <div class="eth-gift-card-3d bg-gray-800/90 border border-gray-600 rounded-2xl p-4 shadow-xl text-center">';
        html += '    <div class="text-5xl mb-2">' + prize2.icon + '</div>';
        html += '    <div class="text-xs font-bold text-gray-400 uppercase">🥈 2-O\'rin Sovrini:</div>';
        html += '    <div class="font-extrabold text-sm text-white mt-1">' + prize2.name + '</div>';
        html += '    <div class="text-[11px] text-gray-400 mt-1">' + prize2.desc + '</div>';
        html += '    <div class="eth-gift-price-badge" style="margin-top:8px;">' + (window.ETHITH_COIN_SVG ? window.ETHITH_COIN_SVG(16) : '🪙') + ' Qiymati: ' + (prize2.price || 180) + ' ETHITH Coin</div>';
        html += '  </div>';
        html += '  <div class="p-4 rounded-t-2xl bg-gradient-to-t from-gray-700 to-gray-600 text-white shadow-lg h-36 flex flex-col justify-end">';
        html += '    <div class="font-black text-base truncate">' + (winner2.hero ? (winner2.hero.emoji + ' ') : '') + winner2.name + '</div>';
        html += '    <div class="font-mono text-sm text-amber-300 font-bold">' + winner2.score.toLocaleString() + ' Ball</div>';
        html += '    <div class="text-2xl font-black mt-1">2</div>';
        html += '  </div>';
        html += '</div>';
      }

      // 1st Place (Gold)
      if (winner1) {
        html += '<div class="w-full md:w-1/3 order-1 md:order-2 space-y-3 -mt-6">';
        html += '  <div class="eth-gift-card-3d bg-gradient-to-b from-amber-950/80 to-gray-800 border-2 border-amber-500 rounded-2xl p-5 shadow-2xl text-center transform scale-105">';
        html += '    <div class="text-6xl mb-2">' + prize1.icon + '</div>';
        html += '    <div class="text-xs font-black text-amber-400 uppercase">👑 1-O\'RIN BOSHQAHRAMONI:</div>';
        html += '    <div class="font-extrabold text-base text-amber-300 mt-1">' + prize1.name + '</div>';
        html += '    <div class="text-[11px] text-amber-100/80 mt-1">' + prize1.desc + '</div>';
        html += '    <div class="eth-gift-price-badge" style="margin-top:8px;background:rgba(245,158,11,0.25);border-color:#f59e0b;color:#fde68a;">' + (window.ETHITH_COIN_SVG ? window.ETHITH_COIN_SVG(16) : '🪙') + ' Qiymati: ' + (prize1.price || 500) + ' ETHITH Coin</div>';
        html += '  </div>';
        html += '  <div class="p-5 rounded-t-2xl bg-gradient-to-t from-amber-600 to-yellow-500 text-gray-950 shadow-2xl h-48 flex flex-col justify-end">';
        html += '    <div class="font-black text-lg truncate">' + (winner1.hero ? (winner1.hero.emoji + ' ') : '') + winner1.name + '</div>';
        html += '    <div class="font-mono text-base font-extrabold">' + winner1.score.toLocaleString() + ' Ball</div>';
        html += '    <div class="text-3xl font-black mt-1">🥇 1</div>';
        html += '  </div>';
        html += '</div>';
      }

      // 3rd Place (Bronze)
      if (winner3) {
        html += '<div class="w-full md:w-1/3 order-3 md:order-3 space-y-3">';
        html += '  <div class="eth-gift-card-3d bg-gray-800/90 border border-amber-800 rounded-2xl p-4 shadow-xl text-center">';
        html += '    <div class="text-5xl mb-2">' + prize3.icon + '</div>';
        html += '    <div class="text-xs font-bold text-amber-600 uppercase">🥉 3-O\'rin Sovrini:</div>';
        html += '    <div class="font-extrabold text-sm text-white mt-1">' + prize3.name + '</div>';
        html += '    <div class="text-[11px] text-gray-400 mt-1">' + prize3.desc + '</div>';
        html += '    <div class="eth-gift-price-badge" style="margin-top:8px;">' + (window.ETHITH_COIN_SVG ? window.ETHITH_COIN_SVG(16) : '🪙') + ' Qiymati: ' + (prize3.price || 90) + ' ETHITH Coin</div>';
        html += '  </div>';
        html += '  <div class="p-4 rounded-t-2xl bg-gradient-to-t from-amber-900 to-amber-800 text-white shadow-lg h-28 flex flex-col justify-end">';
        html += '    <div class="font-black text-base truncate">' + (winner3.hero ? (winner3.hero.emoji + ' ') : '') + winner3.name + '</div>';
        html += '    <div class="font-mono text-sm text-amber-300 font-bold">' + winner3.score.toLocaleString() + ' Ball</div>';
        html += '    <div class="text-2xl font-black mt-1">3</div>';
        html += '  </div>';
        html += '</div>';
      }

      html += '  </div>';

      // Congratulatory Banner for Winners
      if (myRank <= 3 && awardedPrize) {
        html += '<div style="margin:20px auto;max-width:560px;padding:16px 22px;background:linear-gradient(135deg,rgba(16,185,129,0.2),rgba(5,150,105,0.25));border:2px solid #10b981;border-radius:20px;display:flex;align-items:center;gap:14px;box-shadow:0 10px 30px rgba(16,185,129,0.3);text-align:left;">';
        html += '  <span style="font-size:38px;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.4));">' + awardedPrize.icon + '</span>';
        html += '  <div>';
        html += '    <div style="font-size:15px;font-weight:900;color:#34d399;display:flex;align-items:center;gap:6px;">🎉 Tabriklaymiz! Siz ' + myRank + '-o\'rinni egalladingiz!</div>';
        html += '    <div style="font-size:12.5px;color:#ffffff;font-weight:700;margin-top:2px;">\'' + esc(awardedPrize.name) + '\' (' + (awardedPrize.price || 100) + ' ETHITH Coin qiymatida) sovrini sizning Sovrinlar kolleksiyangizga muvaffaqiyatli qo\'shildi!</div>';
        html += '  </div>';
        html += '</div>';
      }

      // Buttons
      html += '  <div class="flex flex-wrap items-center justify-center gap-4 pt-6">';
      if (myRank <= 3) {
        html += '    <button id="btnViewGiftsFromPodium" class="eth-gift-action-btn" style="width:auto!important;padding:12px 24px!important;font-size:14px!important;">';
        html += '      <span>🎁 Sovrinlarimni Ko\'rish (' + (S.user && S.user.gifts ? S.user.gifts.length : 1) + ')</span>';
        html += '    </button>';
      }
      html += '    <button id="btnViewAnalysisFromPodium" class="eth-podium-analysis-btn">';
      html += '      <span>📊 Batafsil Test Tahlilini Ko\'rish</span>';
      html += '    </button>';
      html += '    <button id="btnExitPodium" class="eth-podium-exit-btn">';
      html += '      <span>🚪 Testni Tark Etish (Dashboard)</span>';
      html += '    </button>';
      html += '  </div>';

      html += '</div>';

      root.innerHTML = html;

      var btnGifts = root.querySelector('#btnViewGiftsFromPodium');
      if (btnGifts) {
        btnGifts.onclick = function() {
          root.remove();
          window._ethithQuizSubtab = 'gifts';
          if (window._ethithRefreshQuizList) window._ethithRefreshQuizList();
        };
      }

      var btnExit = root.querySelector('#btnExitPodium');
      if (btnExit) {
        btnExit.onclick = function() {
          root.remove();
          if (window._ethithRefreshQuizList) window._ethithRefreshQuizList();
        };
      }

      var btnAnalysis = root.querySelector('#btnViewAnalysisFromPodium');
      if (btnAnalysis) {
        btnAnalysis.onclick = function() {
          root.remove();
          if (window._ethithRefreshQuizList) window._ethithRefreshQuizList();
          showQuizAnalysisModal(quiz);
        };
      }
    }

    renderLobby();
  }

  // -------------------------------------------------------------------------
  // WAYGROUND 1:1 QUIZ ANALYSIS REPORT MODAL (ALL ENGLISH AS USER REQUESTED)
  // -------------------------------------------------------------------------
  function showQuizAnalysisModal(quiz) {
    if (!quiz) return;
    var analysis = quiz.lastSessionAnalysis;
    if (!analysis) {
      alert("No report data available yet. Host or participate in this quiz to generate the full session report!");
      return;
    }

    var rankings = analysis.rankings || [];
    var qStats = analysis.questionStats || [];
    var totalQuestions = qStats.length || (quiz.questions ? quiz.questions.length : 0);
    var totalParticipants = analysis.totalParticipants || rankings.length;

    // Calculate overall class accuracy
    var totalCorrect = rankings.reduce(function(acc, r) { return acc + (r.correctCount || 0); }, 0);
    var totalAnswered = totalQuestions * totalParticipants;
    var accuracyPct = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 100;
    var completionRatePct = totalParticipants > 0 ? 100 : 0;

    var formattedDate = analysis.finishedAt ? new Date(analysis.finishedAt).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : 'Just now';

    var overlay = document.createElement('div');
    overlay.className = 'eth-wayground-report-overlay';

    var html = '<div class="eth-wayground-report-modal">';

    // HEADER
    html += '<div class="eth-wg-report-header">';
    html += '  <div class="flex items-center gap-3 flex-wrap">';
    html += '    <h3 class="text-xl md:text-2xl font-black text-gray-900 dark:text-white leading-tight">' + (quiz.title || 'Assessment Report') + '</h3>';
    html += '    <span class="eth-wg-badge-active"><span class="dot"></span> Active</span>';
    html += '    <span class="eth-wg-code-box">Code: ' + (quiz.code || '------') + '</span>';
    html += '  </div>';
    html += '  <div class="flex items-center gap-2">';
    html += '    <button id="btnWgPrintReport" class="px-3.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold border border-gray-300 dark:border-gray-700 flex items-center gap-1.5 transition-all">';
    html += '      <span>🖨️</span> <span>Print Report</span>';
    html += '    </button>';
    html += '    <button id="btnCloseWgReport" class="eth-modal-close-btn" title="Close">✕</button>';
    html += '  </div>';
    html += '</div>';

    // SUBHEADER (STARTED & LAST UPDATED)
    html += '<div class="px-6 py-2.5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">';
    html += '  <div class="flex items-center gap-2">';
    html += '    <span>Started: <strong>' + formattedDate + '</strong></span>';
    html += '    <span>·</span>';
    html += '    <span class="text-emerald-600 dark:text-emerald-400 font-bold">Live Quiz</span>';
    html += '  </div>';
    html += '  <div>Last updated: <strong>Just now</strong></div>';
    html += '</div>';

    // 4 STAT METRIC CARDS
    html += '<div class="eth-wg-stat-grid">';

    // Card 1: Accuracy
    html += '  <div class="eth-wg-stat-item">';
    html += '    <div class="eth-wg-stat-icon-box text-emerald-500">🎯</div>';
    html += '    <div>';
    html += '      <div class="eth-wg-stat-label">Accuracy</div>';
    html += '      <div class="eth-wg-stat-val text-emerald-600 dark:text-emerald-400">' + accuracyPct + '%</div>';
    html += '      <div class="text-[10px] text-gray-400 font-medium mt-0.5">Based on best attempt</div>';
    html += '    </div>';
    html += '  </div>';

    // Card 2: Completion Rate
    html += '  <div class="eth-wg-stat-item">';
    html += '    <div class="eth-wg-stat-icon-box text-blue-500">✅</div>';
    html += '    <div>';
    html += '      <div class="eth-wg-stat-label">Completion Rate</div>';
    html += '      <div class="eth-wg-stat-val text-blue-600 dark:text-blue-400">' + completionRatePct + '%</div>';
    html += '      <div class="text-[10px] text-gray-400 font-medium mt-0.5">Based on best attempt report</div>';
    html += '    </div>';
    html += '  </div>';

    // Card 3: Total Students
    html += '  <div class="eth-wg-stat-item">';
    html += '    <div class="eth-wg-stat-icon-box text-amber-500">👥</div>';
    html += '    <div>';
    html += '      <div class="eth-wg-stat-label">Total Students</div>';
    html += '      <div class="eth-wg-stat-val text-amber-600 dark:text-amber-400">' + totalParticipants + '</div>';
    html += '      <div class="text-[10px] text-gray-400 font-medium mt-0.5">Participating students</div>';
    html += '    </div>';
    html += '  </div>';

    // Card 4: Questions
    html += '  <div class="eth-wg-stat-item">';
    html += '    <div class="eth-wg-stat-icon-box text-purple-500">❓</div>';
    html += '    <div>';
    html += '      <div class="eth-wg-stat-label">Questions</div>';
    html += '      <div class="eth-wg-stat-val text-purple-600 dark:text-purple-400">' + totalQuestions + '</div>';
    html += '      <div class="text-[10px] text-gray-400 font-medium mt-0.5">Assigned questions</div>';
    html += '    </div>';
    html += '  </div>';

    html += '</div>'; // End stats grid

    // TABS BAR
    html += '<div class="eth-wg-tabs-bar">';
    html += '  <button class="eth-wg-tab-btn active" data-wg-tab="overview"><span>📊</span> Overview</button>';
    html += '  <button class="eth-wg-tab-btn" data-wg-tab="participants"><span>👥</span> Participants (' + rankings.length + ')</button>';
    html += '  <button class="eth-wg-tab-btn" data-wg-tab="questions"><span>❓</span> Questions (' + totalQuestions + ')</button>';
    html += '</div>';

    // TAB CONTENTS CONTAINER
    html += '<div class="flex-1 overflow-y-auto" id="wgReportTabBody" style="min-height: 380px;">';
    html += '</div>';

    html += '</div>'; // End modal

    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    var activeTab = 'overview';

    function renderWgReportTab() {
      var bodyEl = overlay.querySelector('#wgReportTabBody');
      if (!bodyEl) return;

      var tabHtml = '';

      if (activeTab === 'overview') {
        // OVERVIEW: QUESTION MATRIX 1:1 WITH WAYGROUND
        tabHtml += '<div class="p-4 md:p-6 space-y-4">';
        tabHtml += '  <div class="flex items-center justify-between gap-3 flex-wrap">';
        tabHtml += '    <div class="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300">';
        tabHtml += '      <span>Sort by:</span>';
        tabHtml += '      <span class="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200">Accuracy (High to Low)</span>';
        tabHtml += '    </div>';
        tabHtml += '    <div class="text-xs text-gray-500 dark:text-gray-400 font-medium">';
        tabHtml += '      <span>Green: <strong>100% (Correct)</strong></span> · <span class="text-rose-500 font-bold">Red: 0% (Incorrect)</span>';
        tabHtml += '    </div>';
        tabHtml += '  </div>';

        // Matrix Table
        tabHtml += '  <div class="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-gray-900">';
        tabHtml += '    <div class="eth-wg-matrix-wrapper">';

        // Header Row
        tabHtml += '      <div class="eth-wg-matrix-row bg-gray-50 dark:bg-gray-800/80 font-black text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">';
        tabHtml += '        <div class="eth-wg-matrix-left uppercase tracking-wider">Participant</div>';
        tabHtml += '        <div class="eth-wg-matrix-right">';
        for (var qIdx = 0; qIdx < totalQuestions; qIdx++) {
          var qs = qStats[qIdx];
          var qAcc = qs ? qs.accuracyPct : 100;
          tabHtml += '        <div class="eth-wg-matrix-qcol" title="Question ' + (qIdx + 1) + '">';
          tabHtml += '          <span class="font-extrabold text-gray-700 dark:text-gray-200">Q' + (qIdx + 1) + '</span>';
          tabHtml += '          <span class="text-[10px] ' + (qAcc >= 70 ? 'text-emerald-500' : (qAcc >= 40 ? 'text-amber-500' : 'text-rose-500')) + ' font-bold">' + qAcc + '%</span>';
          tabHtml += '        </div>';
        }
        tabHtml += '        </div>';
        tabHtml += '      </div>';

        // Participant Rows
        if (rankings.length === 0) {
          tabHtml += '    <div class="p-8 text-center text-gray-400 text-xs font-bold">No participants yet in this session.</div>';
        } else {
          rankings.forEach(function(r) {
            var hero = r.hero || { emoji: '🎓', bg: '#fef3c7', border: '#f59e0b' };
            var rAcc = totalQuestions > 0 ? Math.round(((r.correctCount || 0) / totalQuestions) * 100) : 100;
            var rAnswers = r.answers || {};

            tabHtml += '    <div class="eth-wg-matrix-row">';
            // Left sticky participant info
            tabHtml += '      <div class="eth-wg-matrix-left">';
            tabHtml += '        <div class="flex items-center gap-2.5 min-w-0">';
            tabHtml += '          <div class="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0" style="background:' + hero.bg + '; border:1.5px solid ' + hero.border + ';">' + hero.emoji + '</div>';
            tabHtml += '          <div class="min-w-0">';
            tabHtml += '            <div class="font-black text-xs text-gray-900 dark:text-white truncate" title="' + r.name + '">' + r.name + '</div>';
            tabHtml += '            <div class="text-[10px] text-gray-400 font-semibold">' + (r.score || 0).toLocaleString() + ' pts</div>';
            tabHtml += '          </div>';
            tabHtml += '        </div>';
            tabHtml += '        <div class="text-right flex-shrink-0">';
            tabHtml += '          <span class="px-2 py-0.5 rounded text-[11px] font-black ' + (rAcc >= 70 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : (rAcc >= 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400')) + '">' + rAcc + '%</span>';
            tabHtml += '        </div>';
            tabHtml += '      </div>';

            // Right Question Cells
            tabHtml += '      <div class="eth-wg-matrix-right">';
            for (var qi = 0; qi < totalQuestions; qi++) {
              var qId = (quiz.questions && quiz.questions[qi] && quiz.questions[qi].id) || ('q_' + qi);
              var ans = rAnswers[qId] || rAnswers['q_' + qi];
              if (!ans && quiz.questions && quiz.questions[qi]) {
                for (var ak in rAnswers) {
                  if (rAnswers[ak] && rAnswers[ak].questionText === quiz.questions[qi].question) {
                    ans = rAnswers[ak];
                    break;
                  }
                }
              }

              // Determine correct or wrong
              var isCellCorrect = false;
              var isCellAnswered = false;
              if (ans !== undefined) {
                isCellAnswered = true;
                isCellCorrect = (ans.isCorrect === true);
              } else if (r.correctCount !== undefined) {
                // If detailed answer map is missing, display based on correct count
                isCellAnswered = true;
                isCellCorrect = (qi < (r.correctCount || 0));
              }

              tabHtml += '      <div class="eth-wg-matrix-qcol" title="Q' + (qi + 1) + ': ' + (isCellCorrect ? 'Correct (100%)' : 'Incorrect (0%)') + '">';
              if (!isCellAnswered) {
                tabHtml += '        <span class="eth-wg-qbadge-empty">—</span>';
              } else if (isCellCorrect) {
                tabHtml += '        <span class="eth-wg-qbadge-correct">100%</span>';
              } else {
                tabHtml += '        <span class="eth-wg-qbadge-wrong">0%</span>';
              }
              tabHtml += '      </div>';
            }
            tabHtml += '      </div>';

            tabHtml += '    </div>';
          });
        }

        tabHtml += '    </div>'; // End matrix wrapper
        tabHtml += '  </div>'; // End table border box
        tabHtml += '</div>';
      }

      else if (activeTab === 'participants') {
        // PARTICIPANTS TAB: FULL LEADERBOARD TABLE IN ENGLISH
        tabHtml += '<div class="p-4 md:p-6 space-y-4">';
        tabHtml += '  <div class="flex items-center justify-between">';
        tabHtml += '    <h4 class="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider">Student Rankings & Proctoring Telemetry</h4>';
        tabHtml += '    <span class="text-xs text-gray-500 dark:text-gray-400">Total ' + rankings.length + ' participants</span>';
        tabHtml += '  </div>';

        tabHtml += '  <div class="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-gray-900">';
        tabHtml += '    <div class="overflow-x-auto">';
        tabHtml += '      <table class="w-full text-xs text-left">';
        tabHtml += '        <thead class="bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 uppercase font-black border-b border-gray-200 dark:border-gray-700">';
        tabHtml += '          <tr>';
        tabHtml += '            <th class="px-4 py-3 text-center w-14">Rank</th>';
        tabHtml += '            <th class="px-4 py-3">Student Name</th>';
        tabHtml += '            <th class="px-4 py-3 text-right">Score</th>';
        tabHtml += '            <th class="px-4 py-3 text-center">Accuracy</th>';
        tabHtml += '            <th class="px-4 py-3 text-center">Correct / Wrong</th>';
        tabHtml += '            <th class="px-4 py-3 text-center">Proctoring Violations</th>';
        tabHtml += '            <th class="px-4 py-3">Awarded 3D Prize</th>';
        tabHtml += '          </tr>';
        tabHtml += '        </thead>';
        tabHtml += '        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">';

        if (rankings.length === 0) {
          tabHtml += '        <tr><td colspan="7" class="p-8 text-center text-gray-400 text-xs font-bold">No participants yet.</td></tr>';
        } else {
          rankings.forEach(function(r) {
            var hero = r.hero || { emoji: '🎓', bg: '#fef3c7', border: '#f59e0b' };
            var rAcc = totalQuestions > 0 ? Math.round(((r.correctCount || 0) / totalQuestions) * 100) : 100;
            var rankMedal = r.rank === 1 ? '🥇 1' : (r.rank === 2 ? '🥈 2' : (r.rank === 3 ? '🥉 3' : ('#' + r.rank)));

            tabHtml += '        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">';
            tabHtml += '          <td class="px-4 py-3 text-center font-black ' + (r.rank === 1 ? 'text-amber-500' : 'text-gray-500') + '">' + rankMedal + '</td>';
            tabHtml += '          <td class="px-4 py-3 font-extrabold text-gray-900 dark:text-white flex items-center gap-2.5">';
            tabHtml += '            <span class="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style="background:' + hero.bg + '; border:1.5px solid ' + hero.border + ';">' + hero.emoji + '</span>';
            tabHtml += '            <span>' + r.name + '</span>';
            tabHtml += '          </td>';
            tabHtml += '          <td class="px-4 py-3 text-right font-mono font-black text-amber-500">' + (r.score || 0).toLocaleString() + '</td>';
            tabHtml += '          <td class="px-4 py-3 text-center">';
            tabHtml += '            <span class="px-2 py-0.5 rounded text-[11px] font-black ' + (rAcc >= 70 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : (rAcc >= 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400')) + '">' + rAcc + '%</span>';
            tabHtml += '          </td>';
            tabHtml += '          <td class="px-4 py-3 text-center font-bold">';
            tabHtml += '            <span class="text-emerald-600 dark:text-emerald-400">+' + (r.correctCount || 0) + '</span> / <span class="text-rose-500">-' + (r.wrongCount || 0) + '</span>';
            tabHtml += '          </td>';
            tabHtml += '          <td class="px-4 py-3 text-center">';
            if (r.infractions > 0) {
              tabHtml += '            <span class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 font-extrabold text-[10px] border border-rose-300 dark:border-rose-800">🚨 ' + r.infractions + ' violations</span>';
            } else {
              tabHtml += '            <span class="text-emerald-600 dark:text-emerald-400 font-bold">Clean (0)</span>';
            }
            tabHtml += '          </td>';
            tabHtml += '          <td class="px-4 py-3 font-semibold text-gray-700 dark:text-amber-200">';
            tabHtml +=              r.prize ? (r.prize.icon + ' ' + r.prize.name) : '—';
            tabHtml += '          </td>';
            tabHtml += '        </tr>';
          });
        }

        tabHtml += '        </tbody>';
        tabHtml += '      </table>';
        tabHtml += '    </div>';
        tabHtml += '  </div>';
        tabHtml += '</div>';
      }

      else if (activeTab === 'questions') {
        // QUESTIONS TAB: FULL QUESTION BREAKDOWN WITH OPTION DISTRIBUTIONS & METRICS
        tabHtml += '<div class="eth-wg-qreport-scroll">';
        tabHtml += '  <div class="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800">';
        tabHtml += '    <h4 class="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider">Question Accuracy & Option Distributions</h4>';
        tabHtml += '    <span class="text-xs text-gray-500 dark:text-gray-400 font-bold">Total ' + qStats.length + ' questions</span>';
        tabHtml += '  </div>';

        if (qStats.length === 0) {
          tabHtml += '  <div class="p-8 text-center text-gray-400 text-xs font-bold">No questions found in this assessment.</div>';
        } else {
          qStats.forEach(function(stat, sIdx) {
            var isHighAcc = stat.accuracyPct >= 70;
            var isLowAcc = stat.accuracyPct < 40;

            var corrOpt = stat.options[stat.correctAnswer];
            var corrText = (typeof corrOpt === 'object' && corrOpt !== null) ? (corrOpt.text || '') : String(corrOpt || '');

            tabHtml += '<div class="eth-wg-qreport-card">';
            tabHtml += '  <div class="eth-wg-qreport-header">';
            tabHtml += '    <div>';
            tabHtml += '      <div class="eth-wg-qreport-title">Question ' + (sIdx + 1) + ': ' + stat.questionText + '</div>';
            tabHtml += '      <div class="eth-wg-qreport-correct-pill">';
            tabHtml += '        <span>✅</span>';
            tabHtml += '        <span>Correct Answer: ' + String.fromCharCode(65 + stat.correctAnswer) + ') ' + esc(corrText) + '</span>';
            tabHtml += '      </div>';
            tabHtml += '    </div>';
            tabHtml += '    <span class="eth-wg-qreport-acc-badge ' + (isHighAcc ? 'high' : (isLowAcc ? 'low' : 'mid')) + '">';
            tabHtml += '      ' + stat.accuracyPct + '% Accuracy';
            tabHtml += '    </span>';
            tabHtml += '  </div>';

            tabHtml += '  <div class="eth-wg-qreport-options-grid">';
            (stat.options || []).forEach(function(opt, optIdx) {
              var letter = String.fromCharCode(65 + optIdx);
              var isCorr = (optIdx === stat.correctAnswer);
              var chosenStudents = (stat.optStudents && stat.optStudents[optIdx]) || [];
              var optCount = (stat.optCounts && stat.optCounts[optIdx]) || 0;
              var optPct = stat.totalAnswered > 0 ? Math.round((optCount / stat.totalAnswered) * 100) : 0;
              var optText = (typeof opt === 'object' && opt !== null) ? (opt.text || '') : String(opt || '');

              tabHtml += '<div class="eth-wg-qreport-opt-box ' + (isCorr ? 'is-correct' : '') + '">';
              tabHtml += '  <div class="eth-wg-qreport-opt-top">';
              tabHtml += '    <span style="' + (isCorr ? 'color:#10b981;font-weight:900;' : '') + '">' + letter + ') ' + esc(optText) + (isCorr ? ' ✅' : '') + '</span>';
              tabHtml += '    <span style="font-family: monospace; font-size: 11px; opacity: 0.85;">' + optCount + ' (' + optPct + '%)</span>';
              tabHtml += '  </div>';

              // Visual Progress Fill Bar
              tabHtml += '  <div class="eth-wg-qreport-bar-track">';
              tabHtml += '    <div class="eth-wg-qreport-bar-fill ' + (isCorr ? 'is-correct' : '') + '" style="width:' + optPct + '%;"></div>';
              tabHtml += '  </div>';

              if (chosenStudents.length > 0) {
                tabHtml += '  <div class="eth-wg-qreport-students" title="' + chosenStudents.join(', ') + '">';
                tabHtml += '    👥 Selected by: <strong class="text-gray-900 dark:text-gray-100">' + chosenStudents.join(', ') + '</strong>';
                tabHtml += '  </div>';
              } else {
                tabHtml += '  <div class="eth-wg-qreport-students" style="opacity: 0.6; font-style: italic;">No students selected this</div>';
              }
              tabHtml += '</div>';
            });
            tabHtml += '  </div>';

            tabHtml += '</div>';
          });
        }
        tabHtml += '</div>';
      }

      bodyEl.innerHTML = tabHtml;
    }

    renderWgReportTab();

    // Tab buttons event listeners
    overlay.querySelectorAll('.eth-wg-tab-btn').forEach(function(btn) {
      btn.onclick = function() {
        overlay.querySelectorAll('.eth-wg-tab-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeTab = btn.getAttribute('data-wg-tab');
        renderWgReportTab();
      };
    });

    // Close button
    function closeReport() {
      overlay.remove();
    }
    var closeBtn = overlay.querySelector('#btnCloseWgReport');
    if (closeBtn) closeBtn.onclick = closeReport;

    // Print button
    var printBtn = overlay.querySelector('#btnWgPrintReport');
    if (printBtn) {
      printBtn.onclick = function() {
        window.print();
      };
    }
  }

  // -------------------------------------------------------------------------
  // SEND GIFT MODAL (TRANSFER PRIZE TO A FRIEND WITH REALTIME SEARCH)
  // -------------------------------------------------------------------------
  function showSendGiftModal(gift, onSent) {
    if (!gift) return;

    var overlay = document.createElement('div');
    overlay.className = 'eth-gift-modal-overlay';

    var myEmail = (S.user && (S.user.email || S.user.id || '')).toLowerCase().trim();
    var myName = (S.user && S.user.name || '').toLowerCase().trim();

    function getRegisteredFriends() {
      var list = [];
      var seenNames = {};

      function addFriend(st) {
        if (!st || !st.name) return;
        var name = String(st.name).trim();
        var nameLower = name.toLowerCase();
        var email = String(st.email || st.id || '').toLowerCase().trim();

        if (myEmail && email && email === myEmail) return;
        if (myName && nameLower === myName) return;
        if (seenNames[nameLower]) return;
        seenNames[nameLower] = true;

        list.push({
          id: st.id || ('u_' + nameLower.replace(/\s+/g, '_')),
          name: name,
          email: email || (nameLower.replace(/\s+/g, '.') + '@ethith.uz'),
          role: st.role || 'student'
        });
      }

      // 1. All registered accounts in S.accounts
      (S.accounts || []).forEach(addFriend);

      // 2. Dedicated localStorage registered users registry
      try {
        var storedUsers = JSON.parse(localStorage.getItem('ethith_all_registered_users') || '[]');
        if (Array.isArray(storedUsers)) storedUsers.forEach(addFriend);
      } catch(e) {}

      // 3. All students in S.classes
      (S.classes || []).forEach(function(cls) {
        (cls.students || []).forEach(addFriend);
      });

      // 4. All students who submitted exams
      (S.exams || []).forEach(function(ex) {
        (ex.submissions || []).forEach(function(sub) {
          if (sub && sub.studentName) {
            addFriend({ name: sub.studentName, email: sub.studentEmail || sub.studentId || '' });
          }
        });
      });

      // 5. All quiz battle participants
      (S.quizzes || []).forEach(function(qz) {
        if (qz.lastSessionAnalysis && Array.isArray(qz.lastSessionAnalysis.rankings)) {
          qz.lastSessionAnalysis.rankings.forEach(function(p) {
            if (p && p.name) addFriend({ name: p.name, email: (p.id && p.id.indexOf('@') !== -1) ? p.id : '' });
          });
        }
      });

      return list;
    }

    var friendsList = getRegisteredFriends();

    var html = '<div class="eth-gift-modal-box">';

    html += '  <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.12);padding-bottom:14px;">';
    html += '    <div style="display:flex;align-items:center;gap:10px;">';
    html += '      <span style="font-size:24px;">🎁</span>';
    html += '      <h3 style="font-size:18px;font-weight:900;color:#ffffff;margin:0;">Do\'stga Sovrin Yuborish</h3>';
    html += '    </div>';
    html += '    <button type="button" id="btnCloseSendGift" class="eth-modal-close-btn" title="Yopish">✕</button>';
    html += '  </div>';

    // Prize Card Preview
    html += '  <div class="eth-gift-card-3d" style="padding:16px!important;box-shadow:none!important;margin:0!important;">';
    html += '    <div style="font-size:46px;line-height:1;margin-bottom:6px;">' + (gift.icon || '🎁') + '</div>';
    html += '    <div style="font-weight:900;font-size:15px;color:#ffffff;">' + esc(gift.name || 'Sovrin') + '</div>';
    html += '    <div style="font-size:11.5px;color:#94a3b8;line-height:1.4;margin-top:4px;">' + esc(gift.desc || '') + '</div>';
    html += '  </div>';

    // Search Box (User Requirement)
    html += '  <div style="display:flex;flex-direction:column;gap:6px;">';
    html += '    <label style="font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.04em;color:#94a3b8;">Do\'stingizni qidiring:</label>';
    html += '    <input id="inputFriendSearch" type="text" placeholder="🔍 Do\'stingizning ismini yozing..." style="width:100%;box-sizing:border-box;padding:11px 14px;border-radius:12px;background:#030712;border:1.5px solid #374151;color:#ffffff;font-size:13px;font-weight:700;outline:none;" />';
    html += '  </div>';

    // Dynamic Friends List Container
    html += '  <div>';
    html += '    <div style="display:flex;align-items:center;justify-content:space-between;font-size:11.5px;color:#94a3b8;font-weight:700;margin-bottom:8px;">';
    html += '      <span>Mavjud do\'stlar</span>';
    html += '      <span id="friendsCountBadge" style="color:#60a5fa;font-family:monospace;font-weight:900;">' + friendsList.length + ' ta</span>';
    html += '    </div>';
    html += '    <div id="friendsListContainer" style="display:flex;flex-direction:column;gap:8px;max-height:220px;overflow-y:auto;padding-right:4px;">';
    html += '    </div>';
    html += '  </div>';

    html += '</div>';

    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    var onEsc = function(e) {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onEsc);

    function close() {
      window._ethithRefreshFriendsList = null;
      window.removeEventListener('keydown', onEsc);
      overlay.remove();
    }

    overlay.onclick = function(e) {
      if (e.target === overlay) close();
    };

    var btnClose = overlay.querySelector('#btnCloseSendGift');
    if (btnClose) btnClose.onclick = close;

    window._ethithRefreshFriendsList = function() {
      friendsList = getRegisteredFriends();
      renderFilteredFriends(searchInput ? searchInput.value : '');
    };

    function renderFilteredFriends(query) {
      query = (query || '').toLowerCase().trim();
      var filtered = friendsList.filter(function(fr) {
        return !query || fr.name.toLowerCase().indexOf(query) !== -1 || fr.email.toLowerCase().indexOf(query) !== -1;
      });

      var countEl = overlay.querySelector('#friendsCountBadge');
      if (countEl) countEl.textContent = filtered.length + ' ta';

      var containerEl = overlay.querySelector('#friendsListContainer');
      if (!containerEl) return;

      if (filtered.length === 0) {
        containerEl.innerHTML = '<div style="padding:22px;text-align:center;font-size:12px;color:#94a3b8;font-weight:700;background:#030712;border-radius:12px;border:1px dashed #374151;">' +
          (query ? 'Kiritilgan nom bo\'yicha hech kim topilmadi' : 'Hozircha saytda boshqa ro\'yxatdan o\'tgan foydalanuvchilar yo\'q.<br>Yangi do\'stlaringiz saytga kirishi bilan bu yerda avtomatik paydo bo\'ladi!') +
          '</div>';
        return;
      }

      var itemsHtml = '';
      filtered.forEach(function(fr) {
        itemsHtml += '<div style="padding:10px 14px;background:rgba(30,41,59,0.9);border-radius:14px;border:1px solid #334155;display:flex;align-items:center;justify-content:space-between;gap:12px;">';
        itemsHtml += '  <div style="display:flex;align-items:center;gap:10px;min-width:0;flex:1;">';
        itemsHtml += '    <span style="width:34px;height:34px;border-radius:10px;background:rgba(59,130,246,0.2);border:1px solid rgba(96,165,250,0.4);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">👤</span>';
        itemsHtml += '    <div style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">';
        itemsHtml += '      <div style="font-weight:800;font-size:13px;color:#ffffff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(fr.name) + '</div>';
        itemsHtml += '      <div style="font-size:10.5px;color:#94a3b8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(fr.email) + '</div>';
        itemsHtml += '    </div>';
        itemsHtml += '  </div>';
        itemsHtml += '  <button type="button" class="btnSendToThisFriend eth-gift-action-btn" style="width:auto!important;padding:7px 14px!important;font-size:12px!important;flex-shrink:0;" data-friend-name="' + esc(fr.name) + '" data-friend-email="' + esc(fr.email) + '">';
        itemsHtml += '    Yuborish 🎁';
        itemsHtml += '  </button>';
        itemsHtml += '</div>';
      });

      containerEl.innerHTML = itemsHtml;

      containerEl.querySelectorAll('.btnSendToThisFriend').forEach(function(btn) {
        btn.onclick = function() {
          var targetName = btn.getAttribute('data-friend-name');
          var targetEmail = btn.getAttribute('data-friend-email');
          executeSend(targetName, targetEmail);
        };
      });
    }

    function executeSend(targetName, targetEmail) {
      if (!confirm("Rostdan ham '" + gift.name + "' sovrinini " + targetName + " ga yubormoqchimisiz?")) return;

      // 1. Remove from sender\'s gifts
      if (Array.isArray(S.user.gifts)) {
        var gIdx = S.user.gifts.findIndex(function(g) { return (g.id && g.id === gift.id) || g.name === gift.name; });
        if (gIdx !== -1) S.user.gifts.splice(gIdx, 1);

        // Update in S.accounts
        if (Array.isArray(S.accounts)) {
          var senderAccount = S.accounts.find(function(a) {
            return (a.email && S.user.email && a.email.toLowerCase() === S.user.email.toLowerCase()) ||
                   (a.name && S.user.name && a.name.toLowerCase() === S.user.name.toLowerCase());
          });
          if (senderAccount) {
            senderAccount.gifts = S.user.gifts.slice();
          }
        }

        // Update local backup
        var senderUserKey = (S.user.email || S.user.name || 'user').toLowerCase().trim();
        try {
          localStorage.setItem('ethith_student_gifts_' + senderUserKey, JSON.stringify(S.user.gifts));
        } catch(e) {}

        if (window.EthithApp && window.EthithApp.saveState) window.EthithApp.saveState();
      }

      var transferredGift = Object.assign({}, gift, {
        id: 'gift_' + Date.now(),
        fromFriend: S.user.name || "Do\'stingiz",
        senderName: S.user.name || "Do\'stingiz",
        transferredAt: Date.now()
      });

      // 2. Save into recipient\'s auto-claim inbox in localStorage
      var targetKeyName = 'ethith_received_gifts_' + targetName.toLowerCase().trim();
      var pending = [];
      try { pending = JSON.parse(localStorage.getItem(targetKeyName) || '[]'); } catch(e) {}
      pending.push(transferredGift);
      localStorage.setItem(targetKeyName, JSON.stringify(pending));

      if (targetEmail) {
        var targetKeyEmail = 'ethith_received_gifts_' + targetEmail.toLowerCase().trim();
        var pendingEmail = [];
        try { pendingEmail = JSON.parse(localStorage.getItem(targetKeyEmail) || '[]'); } catch(e) {}
        pendingEmail.push(transferredGift);
        localStorage.setItem(targetKeyEmail, JSON.stringify(pendingEmail));
      }

      // 3. Broadcast GIFT_SENT event via real-time sync
      if (window.EthithSync && window.EthithSync.publishLive) {
        window.EthithSync.publishLive({
          type: 'GIFT_SENT',
          giftName: gift.name,
          giftIcon: gift.icon,
          giftDesc: gift.desc,
          senderName: S.user.name || "Do\'stingiz",
          recipientName: targetName,
          recipientEmail: targetEmail
        });
      }

      // 4. Top Toast Notification (User Requirement: "sovg\'ani do\'stiga yuborgach tepada habar kelsin")
      var toast = document.createElement('div');
      toast.className = 'animate-fade-in';
      toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#0f172a;color:#fff;padding:14px 28px;border-radius:16px;font-weight:800;z-index:99999999;box-shadow:0 12px 35px rgba(0,0,0,0.5);border:2px solid #10b981;display:flex;align-items:center;gap:12px;backdrop-filter:blur(10px);';
      toast.innerHTML = '<span style="font-size:26px;">🎁</span><div><div style="font-size:13px;font-weight:900;color:#10b981;">Sovrin Muvaffaqiyatli Yuborildi!</div><div style="font-size:12px;color:#e2e8f0;font-weight:600;">\'' + esc(gift.name) + '\' sovrini ' + esc(targetName) + ' ga yuborildi!</div></div>';
      document.body.appendChild(toast);
      setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, -20px)';
        toast.style.transition = 'all 0.4s ease';
        setTimeout(function() { if (toast && toast.parentNode) toast.remove(); }, 400);
      }, 4000);

      close();
      if (onSent) onSent();
    }

    renderFilteredFriends('');

    var searchInput = overlay.querySelector('#inputFriendSearch');
    if (searchInput) {
      searchInput.oninput = function() {
        renderFilteredFriends(searchInput.value);
      };
      setTimeout(function() { searchInput.focus(); }, 100);
    }
  }

  
  // ====================================================
  // 1. MOTION ANIMATED LEADERBOARD VIEW (COIN-BASED)
  // ====================================================
  function renderLeaderboardView(container) {
    if (!container) return;
    window._ethithCurrentView = 'leaderboard';
    window._ethithIsTestInProgress = false;
    window._ethithRefreshQuizList = null;
    window._ethithRefreshGifts = null;
    window._ethithRefreshLeaderboard = function() {
      if (window._ethithCurrentView === 'leaderboard' && !window._ethithIsTestInProgress) {
        renderLeaderboardView(container);
      }
    };

    var regUsers = [];
    try {
      var rawReg = JSON.parse(localStorage.getItem('ethith_all_registered_users') || '[]');
      if (Array.isArray(rawReg)) {
        var cleanReg = [];
        var seenReg = {};
        rawReg.forEach(function(r) {
          if (!r) return;
          var nm = (r.name || '').trim().toLowerCase();
          var em = (r.email || '').trim().toLowerCase();
          if (nm === 'john doe' || em.includes('john.doe') || em.includes('example.com') || em === 'nursulton@ethith.uz' || nm === 'test') return;
          var key = em || nm;
          if (!key || seenReg[key]) return;
          seenReg[key] = true;
          cleanReg.push(r);
        });
        localStorage.setItem('ethith_all_registered_users', JSON.stringify(cleanReg));
        regUsers = cleanReg;
      }
    } catch(e) {}

    var classStudents = [];
    (S.classes || []).forEach(function(c) {
      if (Array.isArray(c.students)) {
        c.students.forEach(function(st) {
          if (st && st.role !== 'teacher') {
            var stName = (st.name || '').trim().toLowerCase();
            var stEmail = (st.email || '').trim().toLowerCase();
            if (stName === 'john doe' || stEmail.includes('john.doe') || stEmail.includes('example.com') || stEmail === 'nursulton@ethith.uz') return;
            classStudents.push(st);
          }
        });
      }
    });

    var allAccounts = (S.accounts || []).concat(regUsers).concat(classStudents);
    var uniqueStudents = [];

    allAccounts.forEach(function(u) {
      if (!u || u.role === 'teacher') return;
      var cleanName = (u.name || '').trim();
      var cleanEmail = (u.email || '').trim().toLowerCase();
      var cleanId = (u.id || '').trim();
      if (!cleanName && !cleanEmail && !cleanId) return;

      var lowerName = cleanName.toLowerCase();
      if (lowerName === 'john doe' || lowerName === 'test' || cleanEmail.includes('john.doe') || cleanEmail.includes('example.com') || cleanId.includes('sync_test') || cleanEmail === 'nursulton@ethith.uz') return;

      var coinCount = (u.coins !== undefined && u.coins !== null) ? Number(u.coins) : 0;

      // Strict Deduplication: Match by email, id, or identical name!
      var existing = uniqueStudents.find(function(s) {
        if (cleanEmail && s.email && cleanEmail === s.email) return true;
        if (cleanId && s.id && cleanId === s.id) return true;
        if (lowerName && s.name && lowerName === s.name.trim().toLowerCase()) return true;
        return false;
      });

      if (!existing) {
        uniqueStudents.push({
          id: cleanEmail || cleanId || cleanName,
          name: cleanName || "O'quvchi",
          email: cleanEmail,
          level: u.level || 'A1',
          avatar: u.avatar || null,
          coins: coinCount,
          nameStyle: u.nameStyle || null,
          title: u.title || null,
          dailyMinutes: u.dailyMinutes || 0
        });
      } else {
        existing.coins = Math.max(existing.coins, coinCount);
        if (u.avatar !== undefined && u.avatar !== null) existing.avatar = u.avatar;
        if (u.level) existing.level = u.level;
        if (u.nameStyle !== undefined && u.nameStyle !== null) existing.nameStyle = u.nameStyle;
        if (u.title !== undefined && u.title !== null) existing.title = u.title;
        if (cleanEmail && (!existing.email || existing.email.endsWith('@ethith.uz'))) {
          existing.email = cleanEmail;
          existing.id = cleanEmail;
        }
        if (cleanName && (!existing.name || existing.name === "O'quvchi")) existing.name = cleanName;
        if ((u.dailyMinutes || 0) > (existing.dailyMinutes || 0)) existing.dailyMinutes = u.dailyMinutes;
      }
    });

    // Ensure current active student is updated or added without duplication
    if (S.user && S.user.role !== 'teacher') {
      var myName = (S.user.name || '').trim().toLowerCase();
      var myEmail = (S.user.email || '').trim().toLowerCase();
      var myId = (S.user.id || '').trim();
      var myCoins = Number(S.user.coins || 0);

      var meInList = uniqueStudents.find(function(s) {
        if (myEmail && s.email && myEmail === s.email) return true;
        if (myId && s.id && myId === s.id) return true;
        if (myName && s.name && myName === s.name.trim().toLowerCase()) return true;
        return false;
      });

      if (meInList) {
        meInList.coins = myCoins;
        meInList.avatar = S.user.avatar !== undefined ? S.user.avatar : meInList.avatar;
        meInList.level = S.level || S.user.level || meInList.level;
        meInList.nameStyle = S.user.nameStyle || meInList.nameStyle;
        meInList.title = S.user.title || meInList.title;
        if (myEmail && (!meInList.email || meInList.email.endsWith('@ethith.uz'))) {
          meInList.email = myEmail;
          meInList.id = myEmail;
        }
        if (S.user.name) meInList.name = S.user.name;
      } else {
        uniqueStudents.push({
          id: myEmail || myId || S.user.name,
          name: S.user.name || "O'quvchi",
          email: myEmail,
          level: S.level || 'A1',
          avatar: S.user.avatar || null,
          coins: myCoins,
          nameStyle: S.user.nameStyle || null,
          title: S.user.title || null,
          dailyMinutes: S.user.dailyMinutes || 0
        });
      }
    }

    var students = uniqueStudents;
    students.sort(function(a, b) {
      if (b.coins !== a.coins) return b.coins - a.coins;
      return (b.dailyMinutes || 0) - (a.dailyMinutes || 0);
    });

    students = students.slice(0, 50);

    var myRank = -1;
    if (S.user && S.user.role !== 'teacher') {
      var myKey = ((S.user.email && S.user.email.trim().toLowerCase()) || (S.user.id || S.user.name || '').toLowerCase()).trim();
      myRank = students.findIndex(function(s) {
        return (s.email && s.email.toLowerCase() === myKey) || (s.id && s.id.toLowerCase() === myKey) || (s.name.toLowerCase() === S.user.name.toLowerCase());
      }) + 1;
    }

    var first = students[0] || null;
    var second = students[1] || null;
    var third = students[2] || null;

    var html = '<div class="eth-leaderboard-screen animate-fade-in">';

    // Header
    html += '<div class="eth-lb-header">' +
      '<div class="eth-lb-title">⚡ ETHITH COIN LEADERBOARD ⚡</div>' +
      '<p class="eth-lb-subtitle">Platformadagi barcha o\'quvchilarning tangalar bo\'yicha jonli reytingi</p>' +
      (myRank > 0 ? '<div style="margin-top:14px;display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:20px;background:rgba(245,158,11,0.18);border:1px solid #f59e0b;font-size:13px;font-weight:800;color:#fde047">' +
        'Sizning o\'rningiz: <b style="font-size:15px">#' + myRank + '</b> (' + (S.user.coins || 0).toLocaleString() + ' Coin)</div>' : '') +
    '</div>';

    // Podium Row
    if (first) {
      html += '<div class="eth-lb-podium-row">';

      // Rank 2: Silver Motion
      if (second) {
        html += '<div class="eth-lb-card-2">' +
          '<div style="font-size:26px;margin-bottom:6px">🥈</div>' +
          '<div style="display:flex;justify-content:center;margin-bottom:10px">' +
            window.ETHITH_RENDER_USER_AVATAR(second, 56) +
          '</div>' +
          '<div style="font-weight:800;font-size:16px;color:#f8fafc;margin-bottom:4px">' + (window.ETHITH_RENDER_USER_NAME_HTML ? window.ETHITH_RENDER_USER_NAME_HTML(second) : esc(second.name)) + '</div>' +
          '<div style="font-size:12px;color:#94a3b8;margin-bottom:10px">' + (second.level || 'A1') + ' Daraja</div>' +
          '<div style="display:inline-flex;align-items:center;gap:6px;font-weight:900;color:#cbd5e1;background:rgba(255,255,255,0.08);padding:4px 12px;border-radius:12px">' +
            window.ETHITH_COIN_SVG(18) + ' ' + (second.coins || 0).toLocaleString() +
          '</div>' +
        '</div>';
      }

      // Rank 1: Crowned Golden Champion
      html += '<div class="eth-lb-card-1">' +
        '<div class="eth-crown-badge">👑</div>' +
        '<div style="display:flex;justify-content:center;margin-bottom:12px;margin-top:8px">' +
          window.ETHITH_RENDER_USER_AVATAR(first, 68, '', 'box-shadow: 0 0 20px #f59e0b') +
        '</div>' +
        '<div style="font-weight:900;font-size:18px;color:#fde047;margin-bottom:4px">' + (window.ETHITH_RENDER_USER_NAME_HTML ? window.ETHITH_RENDER_USER_NAME_HTML(first) : esc(first.name)) + '</div>' +
        '<div style="font-size:12.5px;color:#fef08a;margin-bottom:12px;font-weight:700">👑 1-O\'RIN CHEMPION (' + (first.level || 'A1') + ')</div>' +
        '<div style="display:inline-flex;align-items:center;gap:6px;font-weight:900;color:#fbbf24;background:rgba(245,158,11,0.22);border:1px solid #f59e0b;padding:6px 16px;border-radius:16px;font-size:16px">' +
          window.ETHITH_COIN_SVG(22) + ' ' + (first.coins || 0).toLocaleString() + ' <span style="font-size:11px">COIN</span>' +
        '</div>' +
      '</div>';

      // Rank 3: Bronze Motion
      if (third) {
        html += '<div class="eth-lb-card-3">' +
          '<div style="font-size:26px;margin-bottom:6px">🥉</div>' +
          '<div style="display:flex;justify-content:center;margin-bottom:10px">' +
            window.ETHITH_RENDER_USER_AVATAR(third, 56) +
          '</div>' +
          '<div style="font-weight:800;font-size:16px;color:#f8fafc;margin-bottom:4px">' + (window.ETHITH_RENDER_USER_NAME_HTML ? window.ETHITH_RENDER_USER_NAME_HTML(third) : esc(third.name)) + '</div>' +
          '<div style="font-size:12px;color:#94a3b8;margin-bottom:10px">' + (third.level || 'A1') + ' Daraja</div>' +
          '<div style="display:inline-flex;align-items:center;gap:6px;font-weight:900;color:#f59e0b;background:rgba(255,255,255,0.08);padding:4px 12px;border-radius:12px">' +
            window.ETHITH_COIN_SVG(18) + ' ' + (third.coins || 0).toLocaleString() +
          '</div>' +
        '</div>';
      }

      html += '</div>';
    }

    // Remaining Ranks 4+ (Minimalist, uniform, no-effect clean rows)
    var restStudents = students.slice(3);
    if (restStudents.length > 0) {
      html += '<div class="eth-lb-list">';
      html += '<div style="font-weight:800;font-size:14px;color:var(--muted);margin-bottom:8px;padding-left:4px">BOSHQA O\'QUVCHILAR:</div>';
      restStudents.forEach(function(st, idx) {
        var rank = idx + 4;
        var isMe = S.user && ((st.email && S.user.email && st.email.toLowerCase() === S.user.email.toLowerCase()) || st.name.toLowerCase() === S.user.name.toLowerCase());
        html += '<div class="eth-lb-row ' + (isMe ? 'is-me' : '') + '">' +
          '<div class="eth-lb-rank-num">#' + rank + '</div>' +
          '<div class="eth-lb-user-info">' +
            window.ETHITH_RENDER_USER_AVATAR(st, 36) +
            '<div style="min-width:0;flex:1">' +
              '<div class="eth-lb-name">' + (window.ETHITH_RENDER_USER_NAME_HTML ? window.ETHITH_RENDER_USER_NAME_HTML(st) : esc(st.name)) + (isMe ? ' <span style="font-size:11px;color:#f59e0b;font-weight:800">(Siz)</span>' : '') + '</div>' +
              '<div style="font-size:11.5px;color:var(--muted)">' + (st.level || 'A1') + ' Daraja</div>' +
            '</div>' +
          '</div>' +
          '<div class="eth-lb-coins">' +
            window.ETHITH_COIN_SVG(16) + ' ' + (st.coins || 0).toLocaleString() +
          '</div>' +
        '</div>';
      });
      html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;
  }

  // ====================================================
  
  // ====================================================

  // ====================================================
  // WEB AUDIO API COMPREHENSIVE 50 DISTINCT VICTORY SOUND GENERATORS
  // ====================================================
  var _activeAudioNodes = [];

  window.stopCurrentFanfare = function() {
    try {
      _activeAudioNodes.forEach(function(node) {
        try { if (node.stop) node.stop(); } catch(e) {}
        try { if (node.disconnect) node.disconnect(); } catch(e) {}
      });
      _activeAudioNodes = [];
    } catch(e) {}
  };

  window.playVictoryFanfare = function(soundId) {
    try {
      window.stopCurrentFanfare();

      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      var ctx = window._ethithAudioCtx || new AudioCtx();
      window._ethithAudioCtx = ctx;
      if (ctx.state === 'suspended') ctx.resume();
      var now = ctx.currentTime;

      function createTone(freq, type, startTime, duration, gainVal, endGain) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(gainVal || 0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(endGain || 0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
        _activeAudioNodes.push(osc, gain);
        return { osc: osc, gain: gain };
      }

      function createNoiseBurst(startTime, duration, freq, q, gainVal) {
        var bufferSize = ctx.sampleRate * duration;
        var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1);
        }
        var noise = ctx.createBufferSource();
        noise.buffer = buffer;
        var filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq || 1200, startTime);
        filter.Q.setValueAtTime(q || 2.0, startTime);
        var gain = ctx.createGain();
        gain.gain.setValueAtTime(gainVal || 0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(startTime);
        noise.stop(startTime + duration);
        _activeAudioNodes.push(noise, filter, gain);
        return { noise: noise, filter: filter, gain: gain };
      }

      // ====================================================
      // 50 DEDICATED DISTINCT SOUND ENGINES
      // ====================================================
      var engines = {
        // 1. STADIUM APPLAUSE (4s) - Open-air soccer stadium with low roar
        applause_stadium_4s: function() {
          createNoiseBurst(now, 4.0, 950, 1.2, 0.45);
          createTone(65, 'sine', now, 3.8, 0.4, 0.01); // stadium low roar
          for (var i = 0; i < 16; i++) {
            createTone(420 + Math.random() * 200, 'triangle', now + i * 0.22, 0.12, 0.2);
          }
        },

        // 2. HUGE CONCERT HALL APPLAUSE (6s) - Crisp woody snaps & reverb
        applause_huge_6s: function() {
          createNoiseBurst(now, 6.0, 1800, 2.8, 0.4);
          for (var i = 0; i < 28; i++) {
            createNoiseBurst(now + i * 0.2, 0.08, 2200 + Math.random() * 600, 4.0, 0.35);
          }
        },

        // 3. STANDING OVATION (8s) - Accelerating clapping + fan whistles
        applause_standing_8s: function() {
          createNoiseBurst(now, 8.0, 1500, 1.8, 0.5);
          // 2 enthusiastic whistling slides
          var w1 = createTone(1400, 'sine', now + 1.2, 1.4, 0.25);
          w1.osc.frequency.linearRampToValueAtTime(2900, now + 2.0);
          var w2 = createTone(1600, 'sine', now + 4.0, 1.6, 0.25);
          w2.osc.frequency.linearRampToValueAtTime(3200, now + 4.9);
        },

        // 4. LOUD URAAA (3s) - Deep baritone masculine chant
        cheer_ura_loud_3s: function() {
          [220, 277.18, 329.63].forEach(function(f) {
            var o = createTone(f, 'sawtooth', now, 3.0, 0.28);
            o.osc.frequency.linearRampToValueAtTime(f * 1.15, now + 2.5);
          });
          createTone(110, 'sine', now, 3.0, 0.4);
        },

        // 5. CROWD URAAA CHANT (5s) - Double-wave chant: U-RA! ... U-RA!
        cheer_ura_crowd_5s: function() {
          // 1st wave
          createTone(260, 'sawtooth', now + 0.1, 1.8, 0.35);
          createTone(330, 'sawtooth', now + 0.1, 1.8, 0.3);
          createNoiseBurst(now + 0.1, 1.8, 800, 1.5, 0.3);
          // 2nd wave (higher pitch & louder!)
          createTone(330, 'sawtooth', now + 2.4, 2.4, 0.45);
          createTone(392, 'sawtooth', now + 2.4, 2.4, 0.4);
          createNoiseBurst(now + 2.4, 2.4, 900, 1.5, 0.4);
        },

        // 6. STADIUM URAAA CRESCENDO (7s) - Massive 7-second rising roar
        cheer_ura_stadium_7s: function() {
          var roar = createTone(180, 'sawtooth', now, 7.0, 0.15);
          roar.gain.gain.linearRampToValueAtTime(0.45, now + 3.5);
          roar.osc.frequency.linearRampToValueAtTime(380, now + 5.5);
          createNoiseBurst(now, 7.0, 1100, 1.2, 0.35);
          // Fireworks thuds
          createTone(90, 'sine', now + 3.0, 0.8, 0.5);
          createTone(80, 'sine', now + 5.2, 0.9, 0.55);
        },

        // 7. YES CHAMPION (4s) - Punchy "YEEES!" shout + victory chime
        cheer_yes_champion_4s: function() {
          var v = createTone(440, 'sawtooth', now, 1.8, 0.4);
          v.osc.frequency.linearRampToValueAtTime(660, now + 1.2);
          // Ascending C - E - G - C arpeggio
          [523.25, 659.25, 783.99, 1046.50].forEach(function(f, i) {
            createTone(f, 'sine', now + 1.8 + i * 0.18, 1.2, 0.35);
          });
        },

        // 8. BRAVO OVATION (6s) - European opera "BRAVO!" shout + rhythmic claps
        cheer_bravo_ovation_6s: function() {
          // "BRA-VO!"
          createTone(392, 'sawtooth', now, 0.6, 0.4);
          createTone(587.33, 'sawtooth', now + 0.6, 1.4, 0.45);
          // Clapping rhythm
          for (var i = 0; i < 18; i++) {
            createNoiseBurst(now + 1.8 + i * 0.22, 0.1, 1900, 3.0, 0.28);
          }
        },

        // 9. STADIUM ROAR (8s) - Rhythmic foot-stomps and stadium cheer
        cheer_stadium_roar_8s: function() {
          createNoiseBurst(now, 8.0, 1000, 1.0, 0.35);
          for (var s = 0; s < 6; s++) {
            createTone(55, 'sine', now + s * 1.2, 0.6, 0.6); // bass stomp
            createTone(110, 'triangle', now + s * 1.2, 0.4, 0.4);
          }
        },

        // 10. FIREWORKS & CLAPS (10s) - 3 Whistling rockets + 3 massive booms + applause
        cheer_fireworks_claps_10s: function() {
          [0.2, 3.2, 6.2].forEach(function(tStart, idx) {
            // Rocket whistle
            var r = createTone(500, 'sine', now + tStart, 1.2, 0.2);
            r.osc.frequency.exponentialRampToValueAtTime(2600 + idx * 300, now + tStart + 1.1);
            // Explosion boom
            var bTime = now + tStart + 1.2;
            createTone(50, 'sine', bTime, 1.4, 0.6);
            createNoiseBurst(bTime, 1.5, 450, 0.8, 0.45);
          });
          createNoiseBurst(now + 4.0, 6.0, 1600, 2.0, 0.35); // crowd claps
        },

        // 11. ROYAL FANFARE (3s) - Quick sharp C-E-G-C trumpet blast
        royal_fanfare_3s: function() {
          [523.25, 659.25, 783.99, 1046.50].forEach(function(f, i) {
            createTone(f, 'triangle', now + i * 0.25, 0.3 + (i === 3 ? 1.5 : 0), 0.4);
            createTone(f * 0.5, 'sawtooth', now + i * 0.25, 0.3 + (i === 3 ? 1.5 : 0), 0.18);
          });
        },

        // 12. ROYAL FANFARE (5s) - British coronation dotted rhythm
        royal_fanfare_5s: function() {
          var seq = [
            { f: 523.25, t: 0, d: 0.2 }, { f: 523.25, t: 0.25, d: 0.2 }, { f: 523.25, t: 0.5, d: 0.2 },
            { f: 659.25, t: 0.75, d: 0.4 }, { f: 587.33, t: 1.2, d: 0.3 }, { f: 783.99, t: 1.6, d: 0.4 },
            { f: 1046.50, t: 2.1, d: 2.6 }
          ];
          seq.forEach(function(s) {
            createTone(s.f, 'triangle', now + s.t, s.d, 0.4);
            createTone(s.f * 0.5, 'sawtooth', now + s.t, s.d, 0.18);
          });
        },

        // 13. ROYAL FANFARE (8s) - Baroque palace clarino trumpet trills
        royal_fanfare_8s: function() {
          var trills = [523.25, 587.33, 523.25, 587.33, 659.25, 783.99, 1046.50];
          trills.forEach(function(f, i) {
            createTone(f, 'triangle', now + i * 0.2, 0.25, 0.35);
          });
          // Sustained regal chord (C maj)
          [523.25, 659.25, 783.99, 1046.50].forEach(function(f) {
            createTone(f, 'triangle', now + 1.6, 6.0, 0.35);
            createTone(f * 0.5, 'sawtooth', now + 1.6, 6.0, 0.15);
          });
        },

        // 14. OLYMPIC FANFARE (6s) - Famous Olympic rising intervals (G-C-E-G-C)
        olympic_fanfare_6s: function() {
          var notes = [392.00, 523.25, 659.25, 783.99, 1046.50];
          var times = [0, 0.4, 0.8, 1.2, 1.8];
          var durs = [0.35, 0.35, 0.35, 0.5, 4.0];
          notes.forEach(function(f, i) {
            createTone(f, 'triangle', now + times[i], durs[i], 0.45);
            createTone(f * 2, 'sine', now + times[i], durs[i], 0.15);
          });
        },

        // 15. CAESAR MARCH (7s) - Roman legion martial horns in D minor -> D major
        caesar_march_7s: function() {
          var melody = [293.66, 349.23, 440.00, 587.33, 739.99]; // D minor to triumphant D major!
          melody.forEach(function(f, i) {
            createTone(f, 'sawtooth', now + i * 0.5, 0.55, 0.35);
            createTone(73.42, 'sine', now + i * 0.5, 0.4, 0.5); // war drum
          });
          [293.66, 369.99, 440.00, 587.33].forEach(function(f) {
            createTone(f, 'triangle', now + 2.8, 4.0, 0.4);
          });
        },

        // 16. TRIUMPHAL ARCH (5s) - French cavalry bugle call
        triumphal_arch_5s: function() {
          var bugle = [196, 261.63, 329.63, 392, 523.25, 392, 523.25];
          var t = [0, 0.25, 0.5, 0.75, 1.1, 1.5, 2.0];
          bugle.forEach(function(f, i) {
            createTone(f, 'triangle', now + t[i], (i === 6 ? 2.8 : 0.3), 0.45);
          });
        },

        // 17. GOLDEN HORNS (4s) - Mellow warm French Horn quartet in F major
        golden_horns_4s: function() {
          [174.61, 220.00, 261.63, 349.23].forEach(function(f) {
            var h = createTone(f, 'sine', now, 3.8, 0.35);
            h.gain.gain.linearRampToValueAtTime(0.45, now + 0.8);
          });
        },

        // 18. CORONATION ANTHEM (9s) - Handel Zadok style arpeggios rising to climax
        coronation_anthem_9s: function() {
          var arp = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
          for (var bar = 0; bar < 4; bar++) {
            arp.forEach(function(f, i) {
              createTone(f, 'sine', now + bar * 1.2 + i * 0.12, 0.2, 0.2);
            });
          }
          // Climax grand chord
          [261.63, 329.63, 392.00, 523.25, 1046.50].forEach(function(f) {
            createTone(f, 'triangle', now + 5.0, 4.0, 0.4);
          });
        },

        // 19. KNIGHTS TRIUMPH (6s) - Medieval tournament herald fanfare
        knights_triumph_6s: function() {
          var m = [293.66, 293.66, 329.63, 293.66, 440.00, 587.33];
          var d = [0.25, 0.25, 0.25, 0.25, 0.6, 4.0];
          var times = [0, 0.3, 0.6, 0.9, 1.3, 2.0];
          m.forEach(function(f, i) {
            createTone(f, 'triangle', now + times[i], d[i], 0.45);
            createTone(f * 0.5, 'sawtooth', now + times[i], d[i], 0.2);
          });
        },

        // 20. GRAND ORCHESTRA (10s) - Full symphony finale (C - F - G - C)
        grand_orchestra_10s: function() {
          var chords = [
            { t: 0, f: [261.63, 329.63, 392.00] }, // C
            { t: 2.2, f: [349.23, 440.00, 523.25] }, // F
            { t: 4.4, f: [392.00, 493.88, 587.33] }, // G
            { t: 6.6, f: [261.63, 329.63, 392.00, 523.25, 1046.50] } // C!
          ];
          chords.forEach(function(c) {
            c.f.forEach(function(freq) {
              createTone(freq, 'triangle', now + c.t, 2.2, 0.35);
              createTone(freq * 0.5, 'sawtooth', now + c.t, 2.2, 0.15);
            });
            createTone(65.41, 'sine', now + c.t, 1.2, 0.6); // timpani
          });
        },

        // 21. DRUM ROLL CYMBAL (3s) - Accelerating snare roll to cymbal splash
        drum_roll_cymbal_3s: function() {
          for (var i = 0; i < 35; i++) {
            var t = now + Math.pow(i / 35, 1.8) * 2.2;
            createNoiseBurst(t, 0.05, 1200, 2.0, 0.1 + (i / 35) * 0.4);
          }
          // Cymbal crash
          createNoiseBurst(now + 2.2, 1.8, 3500, 0.8, 0.6);
        },

        // 22. TAIKO WAR DRUMS (5s) - Japanese massive drums: DON... DON... DOKO-DON!
        taiko_war_drums_5s: function() {
          var hits = [0, 0.8, 1.6, 2.2, 2.5, 3.2];
          hits.forEach(function(t, idx) {
            var d = createTone(55, 'sine', now + t, 0.6, 0.7);
            d.osc.frequency.exponentialRampToValueAtTime(32, now + t + 0.3);
            createTone(110, 'triangle', now + t, 0.25, 0.5);
          });
        },

        // 23. TIMPANI THUNDER (6s) - Classical kettle drums rolling & striking
        timpani_thunder_6s: function() {
          for (var i = 0; i < 20; i++) {
            var t = now + i * 0.12;
            createTone(98 + (i % 2) * 5, 'sine', t, 0.2, 0.2 + (i / 20) * 0.4);
          }
          // Final strike on C
          var strike = createTone(130.81, 'sine', now + 2.6, 3.0, 0.8);
          strike.osc.frequency.exponentialRampToValueAtTime(65.41, now + 3.8);
        },

        // 24. STADIUM STOMP (4s) - Queen "We Will Rock You" (Boom-boom-CLAP!)
        stadium_stomp_4s: function() {
          [0, 2.0].forEach(function(offset) {
            // Stomp 1
            createTone(48, 'sine', now + offset, 0.35, 0.7);
            // Stomp 2
            createTone(48, 'sine', now + offset + 0.35, 0.35, 0.7);
            // CLAP!
            createNoiseBurst(now + offset + 0.7, 0.8, 1600, 1.5, 0.6);
          });
        },

        // 25. MARCHING BAND DRUMS (7s) - Military snare drumline cadence
        marching_band_drums_7s: function() {
          for (var step = 0; step < 24; step++) {
            var t = now + step * 0.28;
            var isAccent = (step % 4 === 0);
            createNoiseBurst(t, 0.08, 2200, 3.0, isAccent ? 0.5 : 0.2);
            if (isAccent) createTone(65, 'sine', t, 0.25, 0.5);
          }
        },

        // 26. AFRICAN DJEMBE (5s) - High-energy African hand drums
        african_djembe_5s: function() {
          for (var i = 0; i < 18; i++) {
            var t = now + i * 0.26;
            var isBass = (i % 3 === 0);
            if (isBass) {
              createTone(75, 'sine', t, 0.22, 0.6);
            } else {
              createTone(320, 'triangle', t, 0.12, 0.35);
            }
          }
        },

        // 27. BRASS & CYMBALS (6s) - Huge brass blast + orchestral crash cymbal
        brass_and_cymbals_6s: function() {
          [261.63, 329.63, 392.00, 523.25].forEach(function(f) {
            createTone(f, 'triangle', now, 5.0, 0.4);
            createTone(f * 0.5, 'sawtooth', now, 5.0, 0.2);
          });
          createNoiseBurst(now, 4.0, 3200, 0.7, 0.65); // giant crash
        },

        // 28. GONG DYNASTY (4s) - Deep Tibetan/Chinese temple gong
        gong_dynasty_4s: function() {
          [62.5, 128.3, 194.2, 312.5, 480.0].forEach(function(f, idx) {
            createTone(f, 'sine', now, 4.0, 0.5 / (idx + 1));
          });
        },

        // 29. DRUM SOLO VICTORY (8s) - Rock tom-tom fills around the kit
        drum_solo_victory_8s: function() {
          var toms = [240, 200, 160, 120, 90, 60];
          toms.forEach(function(f, i) {
            for (var r = 0; r < 3; r++) {
              createTone(f, 'sine', now + i * 1.0 + r * 0.22, 0.25, 0.5);
            }
          });
          createNoiseBurst(now + 6.5, 2.0, 3500, 0.8, 0.6); // final crash!
        },

        // 30. HEAVY BASS DROP (5s) - Modern 808 Trap sub-bass sliding down
        heavy_bass_drop_5s: function() {
          var b = createTone(180, 'sine', now, 4.8, 0.8);
          b.osc.frequency.exponentialRampToValueAtTime(34, now + 1.8);
          createTone(180, 'sawtooth', now, 1.0, 0.3); // initial bite
        },

        // 31. ROCK GUITAR RIFF (4s) - Hard rock power chord riff (E5 - G5 - A5 - Bb5 - A5)
        rock_guitar_riff_4s: function() {
          var riff = [
            { f: 164.81, t: 0, d: 0.3 }, { f: 196.00, t: 0.4, d: 0.3 },
            { f: 220.00, t: 0.8, d: 0.3 }, { f: 233.08, t: 1.2, d: 0.3 },
            { f: 220.00, t: 1.6, d: 2.2 }
          ];
          riff.forEach(function(r) {
            createTone(r.f, 'sawtooth', now + r.t, r.d, 0.4);
            createTone(r.f * 1.5, 'sawtooth', now + r.t, r.d, 0.25);
          });
        },

        // 32. ROCK POWER CHORDS (6s) - AC/DC stadium punch chords (A - D - G - A)
        rock_power_chords_6s: function() {
          var chords = [
            { f: 220, t: 0 }, { f: 293.66, t: 1.0 }, { f: 392, t: 2.0 }, { f: 440, t: 3.2 }
          ];
          chords.forEach(function(c) {
            createTone(c.f, 'sawtooth', now + c.t, 1.8, 0.4);
            createTone(c.f * 1.5, 'sawtooth', now + c.t, 1.8, 0.3);
            createTone(110, 'sine', now + c.t, 0.4, 0.5); // kick
          });
        },

        // 33. ROCK SOLO LEGEND (8s) - 80s Metal tapping arpeggios & screaming bend
        rock_solo_legend_8s: function() {
          var notes = [440, 523.25, 659.25, 880, 1046.50, 1318.51, 1760];
          for (var cycle = 0; cycle < 3; cycle++) {
            notes.forEach(function(f, i) {
              createTone(f, 'sawtooth', now + cycle * 1.4 + i * 0.15, 0.25, 0.3);
            });
          }
          // Screaming high vibrato hold
          var highLead = createTone(1760, 'sawtooth', now + 4.8, 3.2, 0.4);
          highLead.osc.frequency.linearRampToValueAtTime(1975.53, now + 6.0);
        },

        // 34. CYBER SYNTH ARP (3s) - Fast 16th-note 140BPM synth arpeggios
        cyber_synth_arp_3s: function() {
          var arp = [440, 523.25, 659.25, 783.99, 880, 783.99, 659.25, 523.25];
          for (var rep = 0; rep < 3; rep++) {
            arp.forEach(function(f, i) {
              createTone(f, 'square', now + rep * 0.96 + i * 0.12, 0.14, 0.2);
            });
          }
        },

        // 35. CYBERWAVE WIN (5s) - 80s Synthwave Outrun synth brass chords
        cyberwave_win_5s: function() {
          var chords = [
            { t: 0, f: [261.63, 329.63, 392, 493.88] }, // Cmaj7
            { t: 1.2, f: [220, 261.63, 329.63, 392] },   // Am7
            { t: 2.4, f: [174.61, 220, 261.63, 329.63] },// Fmaj7
            { t: 3.6, f: [196, 246.94, 293.66, 392] }    // G
          ];
          chords.forEach(function(c) {
            c.f.forEach(function(freq) {
              createTone(freq, 'sawtooth', now + c.t, 1.4, 0.2);
              createTone(freq * 1.008, 'sawtooth', now + c.t, 1.4, 0.2); // stereo chorus
            });
          });
        },

        // 36. SYNTHWAVE ANTHEM (7s) - Analog bassline + glowing neon lead melody
        synthwave_anthem_7s: function() {
          // Bassline pulses
          for (var b = 0; b < 14; b++) {
            createTone(110, 'sawtooth', now + b * 0.45, 0.35, 0.35);
          }
          // Lead melody
          var lead = [440, 493.88, 523.25, 659.25, 587.33, 440];
          var times = [0, 0.9, 1.8, 2.7, 4.0, 5.0];
          lead.forEach(function(f, idx) {
            createTone(f, 'sine', now + times[idx], 1.2, 0.3);
          });
        },

        // 37. TECHNO DROP (6s) - 303 acid filter sweep + four-on-the-floor beat
        techno_drop_6s: function() {
          // 4/4 Kick beat
          for (var k = 0; k < 6; k++) {
            createTone(55, 'sine', now + k * 0.9, 0.4, 0.7);
          }
          // Acid 303 squelch
          var acid = createTone(110, 'sawtooth', now, 5.5, 0.35);
          acid.osc.frequency.linearRampToValueAtTime(880, now + 3.0);
          acid.osc.frequency.linearRampToValueAtTime(220, now + 5.5);
        },

        // 38. PIXEL ARCADE WIN (3s) - Nintendo NES 8-bit Mario level clear style
        pixel_arcade_win_3s: function() {
          var nes = [392, 523.25, 659.25, 783.99, 659.25, 783.99, 1046.50];
          var t = [0, 0.14, 0.28, 0.42, 0.7, 0.84, 1.1];
          nes.forEach(function(f, i) {
            createTone(f, 'square', now + t[i], (i === 6 ? 1.8 : 0.16), 0.22);
          });
        },

        // 39. ARCADE LEVEL UP (5s) - Sega Genesis 16-bit FM synth chime
        arcade_level_up_5s: function() {
          var seq = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
          seq.forEach(function(f, i) {
            createTone(f, 'triangle', now + i * 0.16, 0.3, 0.3);
            createTone(f * 2, 'sine', now + i * 0.16, 0.2, 0.15); // sparkle
          });
          createTone(261.63, 'square', now + 1.2, 3.5, 0.2); // base hold
        },

        // 40. CHIPTUNE MELODY (7s) - Complete Game Boy chiptune theme
        chiptune_melody_7s: function() {
          var chiptuneNotes = [
            440, 440, 659.25, 587.33, 523.25, 493.88, 523.25, 659.25,
            880, 783.99, 659.25, 587.33, 659.25, 880, 1046.50
          ];
          chiptuneNotes.forEach(function(f, i) {
            createTone(f, 'square', now + i * 0.38, 0.32, 0.2);
            createTone(f * 0.5, 'triangle', now + i * 0.38, 0.32, 0.2);
          });
        },

        // 41. GOLDEN BELLS (3s) - Bright sparkling glockenspiel in C7
        golden_bells_3s: function() {
          [1046.50, 1318.51, 1567.98, 2093.00].forEach(function(f, i) {
            createTone(f, 'sine', now + i * 0.25, 1.8, 0.35);
          });
        },

        // 42. CHURCH CHIMES (5s) - Big Ben Westminster cathedral bells
        church_chimes_5s: function() {
          var westminster = [329.63, 415.30, 369.99, 246.94]; // E - G# - F# - B
          westminster.forEach(function(f, i) {
            var b = createTone(f, 'sine', now + i * 0.9, 2.5, 0.4);
            createTone(f * 2.76, 'sine', now + i * 0.9, 1.2, 0.15); // bell inharmonic
          });
        },

        // 43. CRYSTAL GLOCKENSPIEL (4s) - Fairy dust crystal chimes
        crystal_glockenspiel_4s: function() {
          var penta = [783.99, 880.00, 987.77, 1174.66, 1318.51, 1567.98, 1760.00, 2093.00];
          penta.forEach(function(f, i) {
            createTone(f, 'sine', now + i * 0.14, 1.5, 0.28);
          });
        },

        // 44. HARPA HEAVENLY (6s) - Angelic Celtic harp ascending 3 octaves
        harpa_heavenly_6s: function() {
          var harp = [
            130.81, 164.81, 196.00, 261.63, 329.63, 392.00,
            523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98
          ];
          harp.forEach(function(f, i) {
            createTone(f, 'sine', now + i * 0.2, 3.5, 0.25);
          });
        },

        // 45. VICTORY MARCH (7s) - Sousa American marching band
        victory_march_7s: function() {
          var tune = [523.25, 523.25, 587.33, 659.25, 523.25, 659.25, 783.99];
          var t = [0, 0.3, 0.6, 0.9, 1.4, 1.7, 2.2];
          tune.forEach(function(f, i) {
            createTone(f, 'triangle', now + t[i], (i === 6 ? 4.0 : 0.28), 0.4);
            createTone(f * 0.5, 'sawtooth', now + t[i], (i === 6 ? 4.0 : 0.28), 0.18);
          });
        },

        // 46. CHAMPIONS LEAGUE (8s) - UEFA Champions League choral crescendo
        champions_league_8s: function() {
          var choir = [
            { t: 0, f: [261.63, 329.63, 392] },
            { t: 2.0, f: [293.66, 369.99, 440] },
            { t: 4.0, f: [329.63, 415.30, 493.88] },
            { t: 5.5, f: [523.25, 659.25, 783.99, 1046.50] } // Les grandes equipes!
          ];
          choir.forEach(function(c) {
            c.f.forEach(function(freq) {
              createTone(freq, 'sawtooth', now + c.t, 2.4, 0.2);
              createTone(freq, 'sine', now + c.t, 2.4, 0.3);
            });
          });
        },

        // 47. EPIC TRAILER HIT (5s) - Hans Zimmer "BRAAAM" horn of doom to triumph
        epic_trailer_hit_5s: function() {
          var b = createTone(65.41, 'sawtooth', now, 4.5, 0.7); // massive BRAAAM
          createTone(130.81, 'sawtooth', now, 4.5, 0.5);
          createTone(45, 'sine', now, 1.5, 0.8); // sub impact
        },

        // 48. COSMIC ASCENSION (6s) - Interstellar space pipe organ chord
        cosmic_ascension_6s: function() {
          [65.41, 130.81, 196.00, 261.63, 392.00, 523.25].forEach(function(f) {
            var o = createTone(f, 'triangle', now, 5.8, 0.35);
            o.gain.gain.linearRampToValueAtTime(0.5, now + 2.5);
          });
        },

        // 49. SUPERHERO THEME (9s) - Avengers / Marvel heroic galloping brass
        superhero_theme_9s: function() {
          var avengers = [
            { f: 220, t: 0, d: 0.3 }, { f: 220, t: 0.35, d: 0.3 }, { f: 220, t: 0.7, d: 0.3 },
            { f: 261.63, t: 1.1, d: 0.6 }, { f: 329.63, t: 1.8, d: 0.8 },
            { f: 440, t: 2.8, d: 1.4 }, { f: 523.25, t: 4.4, d: 4.0 }
          ];
          avengers.forEach(function(a) {
            createTone(a.f, 'triangle', now + a.t, a.d, 0.45);
            createTone(a.f * 0.5, 'sawtooth', now + a.t, a.d, 0.2);
          });
        },

        // 50. ULTIMATE GRAND WIN (10s) - Snare roll + Crowd URAAA + Fireworks + Brass
        ultimate_grand_win_10s: function() {
          // 1. Snare roll (0-2s)
          for (var r = 0; r < 20; r++) {
            createNoiseBurst(now + (r / 20) * 1.8, 0.06, 1400, 2.0, 0.1 + (r / 20) * 0.4);
          }
          // 2. Crowd URAAA! (2s)
          createTone(260, 'sawtooth', now + 1.8, 4.0, 0.35);
          createNoiseBurst(now + 1.8, 4.0, 1000, 1.2, 0.35);
          // 3. Fireworks boom (4s)
          createTone(55, 'sine', now + 3.8, 1.5, 0.7);
          createNoiseBurst(now + 3.8, 1.5, 3000, 0.8, 0.5);
          // 4. Grand Brass Fanfare (5s-10s)
          [261.63, 329.63, 392.00, 523.25, 1046.50].forEach(function(f) {
            createTone(f, 'triangle', now + 4.8, 5.0, 0.45);
          });
        }
      };

      // Execute dedicated sound engine if available, or fallback
      if (engines[soundId]) {
        engines[soundId]();
      } else {
        // Fallback default
        engines.royal_fanfare_3s();
      }
    } catch(e) {
      console.error('Audio synthesis error:', e);
    }
  };

    // Distinct audio for Pack Opening Rarity Reveals
  function playPackRevealSound(rarity) {
    try {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      var ctx = window._ethithAudioCtx || new AudioCtx();
      window._ethithAudioCtx = ctx;
      if (ctx.state === 'suspended') ctx.resume();
      var now = ctx.currentTime;

      if (rarity === 'Legendary' || rarity === 'Mythic') {
        // Boom + Fanfare + Cymbal crash!
        var bOsc = ctx.createOscillator();
        var bGain = ctx.createGain();
        bOsc.type = 'sawtooth';
        bOsc.frequency.setValueAtTime(260, now);
        bOsc.frequency.exponentialRampToValueAtTime(45, now + 0.8);
        bGain.gain.setValueAtTime(0.5, now);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
        bOsc.connect(bGain);
        bGain.connect(ctx.destination);
        bOsc.start(now);
        bOsc.stop(now + 0.85);

        [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach(function(f, i) {
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + 0.2 + i * 0.1);
          gain.gain.setValueAtTime(0.4, now + 0.2 + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2 + i * 0.1 + 0.8);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + 0.2 + i * 0.1);
          osc.stop(now + 0.2 + i * 0.1 + 0.8);
        });
      } else if (rarity === 'Epic') {
        // Mystical violet synth riser
        [392.00, 523.25, 659.25, 783.99, 1046.50].forEach(function(f, i) {
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + i * 0.09);
          gain.gain.setValueAtTime(0.35, now + i * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.09);
          osc.stop(now + i * 0.09 + 0.6);
        });
      } else if (rarity === 'Rare') {
        // Sparkling azure chime
        [523.25, 659.25, 783.99, 1046.50].forEach(function(f, i) {
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + i * 0.08);
          gain.gain.setValueAtTime(0.28, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.5);
        });
      } else {
        // Common soft chime
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(554.37, now + 0.25);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch(e) {}
  }

  // ====================================================
  // 2. ETHITH 2.0 MULTI-TAB MARKET, BOOSTERS & P2P AUCTION
  // ====================================================
  var _activeMarketTab = 'packs'; // 'packs', 'boosters', 'p2p', 'cosmetics', 'vault'
  var _activeVaultFilter = 'all';
  var _activeP2pFilter = 'all'; // 'all', 'mine'
  var _currentlyPlayingPreview = null;

  function isSameCalendarDay(ts1, ts2) {
    if (!ts1) return false;
    var d1 = new Date(ts1);
    var d2 = new Date(ts2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  function getCosmeticStatus(user, itemId) {
    if (!user || !user.activeCosmetics || !user.activeCosmetics[itemId]) {
      return { active: false, expired: false, label: '7 kunlik litsenziya', isOwned: false };
    }
    var info = user.activeCosmetics[itemId];
    var exp = Number(info.expiresAt || 0);
    var now = Date.now();
    if (now >= exp) {
      return { active: false, expired: true, label: '🔴 Muddati tugagan', isOwned: true };
    }
    var daysLeft = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    var hoursLeft = Math.ceil((exp - now) / (1000 * 60 * 60));
    var displayStr = (daysLeft > 1) ? (daysLeft + ' kun qoldi') : (hoursLeft + ' soat qoldi');
    return { active: true, expired: false, daysLeft: daysLeft, label: '⏳ ' + displayStr, isOwned: true };
  }

  function renderMarketView(container) {
    if (!container) return;
    window._ethithCurrentView = 'market';
    window._ethithIsTestInProgress = false;
    window._ethithRefreshQuizList = null;
    window._ethithRefreshGifts = null;
    window._ethithRefreshMarket = function() {
      if (window._ethithCurrentView === 'market' && !window._ethithIsTestInProgress) {
        renderMarketView(container);
      }
    };

    var userCoins = (S.user && S.user.coins !== undefined) ? Number(S.user.coins) : 0;
    var lastDaily = (S.user && S.user.lastDailyPackAt) ? Number(S.user.lastDailyPackAt) : 0;
    var now = Date.now();
    
    // Daily free pack midnight (00:00:00) reset check
    var isDailyReady = !isSameCalendarDay(lastDaily, now);
    var nextMidnight = new Date();
    nextMidnight.setHours(24, 0, 0, 0);
    var remainingMs = Math.max(0, nextMidnight.getTime() - now);
    var remainingHrs = Math.floor(remainingMs / (1000 * 60 * 60));
    var remainingMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    var timeToMidnightStr = remainingHrs + 's ' + remainingMins + 'd';

    // Daily 10-pack Pity check (00:00:00 reset)
    var todayStr = (function() {
      var d = new Date();
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    })();

    if (S.user) {
      if (S.user.dailyPityDate !== todayStr) {
        S.user.dailyPityCount = 0;
        S.user.dailyPityDate = todayStr;
      }
    }
    var dailyPity = S.user ? Number(S.user.dailyPityCount || 0) : 0;
    var dailyPityPct = Math.min(100, Math.round((dailyPity / 10) * 100));

    var html = '<div class="eth-market-screen animate-fade-in">';

    // Top Header Banner
    html += '<div class="eth-market-banner">' +
      '<div>' +
        '<div style="font-size:12px;font-weight:800;letter-spacing:1px;color:#fde047;text-transform:uppercase;margin-bottom:6px">⚡ ETHITH SUPREME MARKET & HUB ⚡</div>' +
        '<h2 style="font-size:26px;font-weight:900;margin:0 0 8px">Sehrli Qutilar, Kuchaytirgichlar & O\'quvchilar Savdo Maydoni</h2>' +
        '<p style="font-size:14px;color:#cbd5e1;margin:0;max-width:580px">Tangalarga qutilar oching, testlar uchun super kuchlar sotib oling yoki boshqa o\'quvchilar bilan to\'g\'ridan-to\'g\'ri savdo qiling!</p>' +
      '</div>' +
      '<div style="text-align:right;flex-shrink:0">' +
        '<div style="font-size:12px;color:#94a3b8;font-weight:700;margin-bottom:4px">HAMYONINGIZ:</div>' +
        '<div style="display:inline-flex;align-items:center;gap:8px;background:rgba(0,0,0,0.45);border:1px solid #f59e0b;padding:8px 18px;border-radius:20px;box-shadow:0 0 16px rgba(245,158,11,0.25)">' +
          window.ETHITH_COIN_SVG(26) +
          '<span style="font-size:20px;font-weight:900;color:#fde047;font-family:monospace">' + userCoins.toLocaleString() + '</span>' +
          '<span style="font-size:11px;font-weight:800;color:#f59e0b">COIN</span>' +
        '</div>' +
      '</div>' +
    '</div>';

    // Market Navigation Tabs (5 Tabs)
    html += '<div class="eth-market-tabs-wrap">' +
      '<button type="button" class="eth-market-tab-btn ' + (_activeMarketTab === 'packs' ? 'active' : '') + '" data-market-tab="packs">🎁 Qutilar (' + (window.ETHITH_PACKS || []).length + ' ta)</button>' +
      '<button type="button" class="eth-market-tab-btn ' + (_activeMarketTab === 'boosters' ? 'active' : '') + '" data-market-tab="boosters">⚡ Kuchaytirgichlar (' + (window.ETHITH_BOOSTERS || []).length + ' ta)</button>' +
      '<button type="button" class="eth-market-tab-btn ' + (_activeMarketTab === 'p2p' ? 'active' : '') + '" data-market-tab="p2p">🏷️ Sotish & Savdo (P2P)</button>' +
      '<button type="button" class="eth-market-tab-btn ' + (_activeMarketTab === 'cosmetics' ? 'active' : '') + '" data-market-tab="cosmetics">👑 VIP Pardozlar & Ovozlar</button>' +
      '<button type="button" class="eth-market-tab-btn ' + (_activeMarketTab === 'vault' ? 'active' : '') + '" data-market-tab="vault">🪙 Shaxsiy Seyf (Sell Vault)</button>' +
    '</div>';

    // -------------------------------------------------------------
    // TAB 1: PACKS (20 SEHRLI QUTILAR + 10-PACK DAILY PITY)
    // -------------------------------------------------------------
    if (_activeMarketTab === 'packs') {
      // 10-Pack Daily Pity Banner
      html += '<div class="eth-pity-banner">' +
        '<div class="eth-pity-header">' +
          '<div class="eth-pity-title">' +
            '<span>🎯 KUNLIK OMAD KAFOLATI (DAILY PITY 10 PACK)</span>' +
            (dailyPity >= 9 ? '<span style="color:#fde047;font-size:12px;font-weight:900;animation:pulse 1s infinite">🔥 100% KAFOLAT FAOL!</span>' : '') +
          '</div>' +
          '<div class="eth-pity-badge">' + dailyPity + ' / 10 Ochildi</div>' +
        '</div>' +
        '<div class="eth-pity-bar-wrap">' +
          '<div class="eth-pity-fill" style="width:' + dailyPityPct + '%"></div>' +
        '</div>' +
        '<div class="eth-pity-subtext">' +
          (dailyPity >= 9 ?
            '✨ <b>Keyingi ochilgan packdan 100% KAFOLATLANGAN holda EPIC yoki LEGENDARY (50/50) tushadi!</b>' :
            '💡 Har kuni 10-paketda 100% Epic yoki Legendary tushishi kafolatlangan! Agar 10-paketga yetmasdan Epic yoki Legendary tushsa, hisoblagich avtomatik 0 ga qaytadi.') +
        '</div>' +
      '</div>';

      // Grid of 20 Packs
      html += '<div class="eth-market-grid">';
      (window.ETHITH_PACKS || []).forEach(function(pack) {
        var isComing = Boolean(pack.isComingSoon);
        var canOpenDaily = pack.isFreeDaily ? isDailyReady : true;

        var btnLabel = '';
        if (isComing) {
          btnLabel = '🔒 TEZ KUNDA';
        } else if (pack.isFreeDaily) {
          btnLabel = isDailyReady ? '🎁 BEPUL OCHISH (0 COIN)' : ('⏳ Yangi kunga: ' + timeToMidnightStr);
        } else {
          btnLabel = window.ETHITH_COIN_SVG(18) + ' ' + pack.price + ' COIN BILAN OCHISH';
        }

        html += '<div class="eth-pack-card" style="background:' + pack.gradient + ';border-color:' + pack.glowColor + '" data-pack-id="' + pack.id + '">' +
          '<div class="eth-pack-badge">' + esc(pack.badge) + '</div>' +
          '<div class="eth-pack-icon">' + pack.icon + '</div>' +
          '<div class="eth-pack-name">' + esc(pack.name) + '</div>' +
          '<div class="eth-pack-desc">' + esc(pack.desc) + '</div>' +
          '<button type="button" class="eth-pack-btn ' + ((isComing || !canOpenDaily) ? 'is-disabled' : '') + '" data-action="open-pack" data-pack-id="' + pack.id + '">' +
            btnLabel +
          '</button>' +
        '</div>';
      });
      html += '</div>';
    }

    // -------------------------------------------------------------
    // TAB 2: POWER-UPS & BOOSTERS (19 KUCHAYTIRGICHLAR)
    // -------------------------------------------------------------
    else if (_activeMarketTab === 'boosters') {
      var userBoosters = (S.user && S.user.boosters) || {};
      var has2xActive = Boolean(S.user && S.user.booster2xUntil && Number(S.user.booster2xUntil) > Date.now());
      var remain2xMins = has2xActive ? Math.ceil((Number(S.user.booster2xUntil) - Date.now()) / 60000) : 0;

      html += '<div style="margin-bottom:20px;background:rgba(2,132,199,0.12);border:1px solid #0284c7;padding:16px 20px;border-radius:18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">' +
        '<div>' +
          '<h3 style="margin:0 0 4px;font-size:17px;font-weight:900;color:#38bdf8">⚡ Test va Quiz Kuchaytirgichlari (' + (window.ETHITH_BOOSTERS || []).length + ' xil Super Kuch)</h3>' +
          '<p style="margin:0;font-size:13px;color:#cbd5e1">Faqat Quiz Bellashuvi va A1–C2 dars testlarida yordam beradi (jiddiy Mock imtihonlarda ishlamaydi).</p>' +
        '</div>' +
        (has2xActive ? '<div style="background:rgba(245,158,11,0.2);border:1px solid #f59e0b;padding:6px 14px;border-radius:12px;font-weight:900;color:#fde047;font-size:13px;display:inline-flex;align-items:center;gap:6px">' +
          '🔥 2X Coin Faol: ' + remain2xMins + ' daqiqa qoldi</div>' : '') +
      '</div>';

      html += '<div class="eth-booster-grid">';
      (window.ETHITH_BOOSTERS || []).forEach(function(b) {
        var count = userBoosters[b.id] || 0;
        html += '<div class="eth-booster-card" style="background:' + b.gradient + ';border-color:' + b.glowColor + '">' +
          '<div class="eth-booster-badge">' + b.badge + '</div>' +
          '<div class="eth-booster-icon">' + b.icon + '</div>' +
          '<div class="eth-booster-name">' + esc(b.name) + '</div>' +
          '<div class="eth-booster-desc">' + esc(b.desc) + '</div>' +
          '<div class="eth-booster-footer">' +
            '<div class="eth-booster-stock">Sizda: <b>' + count + ' dona</b></div>' +
            '<button type="button" class="eth-booster-buy-btn" data-action="buy-booster" data-booster-id="' + b.id + '">' +
              window.ETHITH_COIN_SVG(16) + ' ' + b.price + ' Coin' +
            '</button>' +
          '</div>' +
        '</div>';
      });
      html += '</div>';
    }

    // -------------------------------------------------------------
    // TAB 3: P2P MARKETPLACE & AUCTION (QORA BOZOR)
    // -------------------------------------------------------------
    else if (_activeMarketTab === 'p2p') {
      var allListings = Array.isArray(S.p2pListings) ? S.p2pListings : [];
      var myId = (S.user && (S.user.id || S.user.email)) || '';

      var filteredListings = allListings.filter(function(item) {
        if (_activeP2pFilter === 'mine') {
          return item.sellerId === myId || (item.sellerEmail && S.user.email && item.sellerEmail.toLowerCase() === S.user.email.toLowerCase());
        }
        return true;
      });

      html += '<div class="eth-p2p-header-bar">' +
        '<div>' +
          '<h3 style="margin:0 0 4px;font-size:18px;font-weight:900;color:#ffffff">🏴‍☠️ O\'quvchilar Qora Bozori & Auksioni</h3>' +
          '<p style="margin:0;font-size:13px;color:#94a3b8">Boshqa o\'quvchilarning noyob avatarlari, kuboklari va emojilarini sotib oling yoki o\'zingiznikini soting / almashtiring (Barter)!</p>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:10px">' +
          '<button type="button" class="eth-market-tab-btn ' + (_activeP2pFilter === 'all' ? 'active' : '') + '" style="padding:8px 14px;font-size:12.5px" data-p2p-filter="all">Barcha E\'lonlar (' + allListings.length + ')</button>' +
          '<button type="button" class="eth-market-tab-btn ' + (_activeP2pFilter === 'mine' ? 'active' : '') + '" style="padding:8px 14px;font-size:12.5px" data-p2p-filter="mine">Mening E\'lonlarim</button>' +
          '<button type="button" class="eth-p2p-post-btn" id="btnOpenPostP2PModal">+ Yangi E\'lon Qo\'shish</button>' +
        '</div>' +
      '</div>';

      if (filteredListings.length === 0) {
        html += '<div class="eth-vault-empty">' +
          '<div class="eth-vault-empty-icon">🏷️</div>' +
          '<h3 style="font-size:18px;font-weight:800;color:#cbd5e1;margin-bottom:6px">Hozircha faol e\'lonlar yo\'q</h3>' +
          '<p style="font-size:13px;color:#64748b;max-width:420px;margin:0 auto 16px">Birinchi bo\'lib o\'zingizning nodir sovriningiz, emojingiz yoki personaj avataringizni auksionga chiqaring!</p>' +
          '<button type="button" class="eth-p2p-post-btn" id="btnEmptyPostP2P">+ E\'lon Berish</button>' +
        '</div>';
      } else {
        html += '<div class="eth-p2p-grid">';
        filteredListings.forEach(function(l) {
          var isMyListing = S.user && ((l.sellerEmail && S.user.email && l.sellerEmail.toLowerCase() === S.user.email.toLowerCase()) || l.sellerId === myId || (l.sellerName && S.user.name && l.sellerName.toLowerCase() === S.user.name.toLowerCase()));
          var it = l.item || {};
          var rarity = it.rarity || 'Rare';

          var visualHtml = '';
          if (it.type === 'avatar' && it.svg) {
            visualHtml = '<div style="width:100%;height:100%">' + it.svg + '</div>';
          } else if (it.type === 'emoji' || it.emojiChar) {
            visualHtml = '<span>' + (it.emojiChar || it.emoji || '⚡') + '</span>';
          } else {
            visualHtml = '<span>' + (it.icon || '🎁') + '</span>';
          }

          html += '<div class="eth-p2p-card">' +
            '<div class="eth-p2p-card-top">' +
              '<div class="eth-p2p-item-visual">' + visualHtml + '</div>' +
              '<div style="min-width:0;flex:1">' +
                '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">' +
                  '<span class="eth-rarity-badge eth-rarity-' + rarity + '" style="font-size:9.5px;padding:2px 6px">' + rarity + '</span>' +
                  (l.allowBarter ? '<span style="font-size:10px;font-weight:800;color:#a78bfa;background:rgba(139,92,246,0.2);padding:2px 6px;border-radius:6px">🔄 Barter</span>' : '') +
                '</div>' +
                '<h4 style="margin:0 0 4px;font-size:15px;font-weight:900;color:#ffffff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(it.name || 'Buyum') + '</h4>' +
                '<div style="font-size:11.5px;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(it.desc || 'Noyob mahsulot') + '</div>' +
              '</div>' +
            '</div>' +
            '<div class="eth-p2p-seller-info">' +
              '<span>Sotuvchi:</span> ' +
              (window.ETHITH_RENDER_USER_NAME_HTML ? window.ETHITH_RENDER_USER_NAME_HTML({ name: l.sellerName, nameStyle: l.sellerNameStyle, title: l.sellerTitle }) : ('<b>' + esc(l.sellerName || 'O\'quvchi') + '</b>')) +
            '</div>' +
            '<div class="eth-p2p-actions-row">' +
              '<div style="display:inline-flex;align-items:center;gap:5px;font-size:16px;font-weight:900;color:#fde047;font-family:monospace">' +
                window.ETHITH_COIN_SVG(18) + ' ' + Number(l.price).toLocaleString() +
              '</div>' +
              '<div style="flex:1"></div>' +
              (isMyListing ?
                '<button type="button" class="eth-vault-sell-btn" style="background:#dc2626;padding:7px 12px;font-size:12px" data-action="cancel-p2p" data-listing-id="' + l.id + '">❌ Bekor Qilish</button>' :
                '<div style="display:flex;gap:6px">' +
                  (l.allowBarter ? '<button type="button" class="eth-p2p-barter-btn" data-action="barter-p2p" data-listing-id="' + l.id + '">🔄 Almashish</button>' : '') +
                  '<button type="button" class="eth-p2p-buy-btn" data-action="buy-p2p" data-listing-id="' + l.id + '">🛒 Sotib Olish</button>' +
                '</div>'
              ) +
            '</div>' +
          '</div>';
        });
        html += '</div>';
      }
    }

    // -------------------------------------------------------------
    // TAB 4: VIP COSMETICS, 15 GLOWING NAMES, 100 TITLES & 50 SOUNDS
    // -------------------------------------------------------------
    else if (_activeMarketTab === 'cosmetics') {
      var cosmetics = window.ETHITH_COSMETICS || {};
      var myNameStyle = S.user ? S.user.nameStyle : null;
      var myTitle = S.user ? S.user.title : null;
      var myVictorySound = S.user ? S.user.victorySound : null;

      // 1. 15 GLOWING NICKNAME STYLES
      html += '<div style="margin-bottom:34px">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
          '<h3 style="font-size:18px;font-weight:900;color:#fde047;margin:0">🔥 1. Yonib Turuvchi Nikneym Effektlari (15 xil)</h3>' +
          '<span style="font-size:12px;font-weight:800;color:#34d399;background:rgba(16,185,129,0.15);padding:3px 10px;border-radius:10px">⏳ 7 Kunlik Litsenziya</span>' +
        '</div>' +
        '<p style="font-size:13px;color:#94a3b8;margin:0 0 16px">Turnir jadvali, shaxsiy profilingiz va chatda ismingiz olov, neon yoki shohona ranglar bilan yonib turadi!</p>' +
        '<div class="eth-cosmetic-grid">';

      (cosmetics.nameStyles || []).forEach(function(ns) {
        var status = getCosmeticStatus(S.user, ns.id);
        var isEquipped = (myNameStyle === ns.id) && status.active;

        html += '<div class="eth-cosmetic-card" style="border-color:' + (isEquipped ? '#f59e0b' : 'rgba(255,255,255,0.12)') + '">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
            '<span style="font-size:12px;color:#94a3b8;font-weight:700">PREVIEW:</span>' +
            '<span class="eth-vip-timer-badge ' + (status.expired ? 'expired' : '') + '">' + status.label + '</span>' +
          '</div>' +
          '<div style="background:#030712;padding:12px;border-radius:12px;text-align:center;margin-bottom:14px;border:1px solid #1f2937">' +
            '<span class="' + ns.className + '" style="font-size:18px;font-weight:900">' + esc(S.user ? S.user.name : 'Muhammadyusuf') + '</span>' +
          '</div>' +
          '<div style="font-size:16px;font-weight:900;color:#fff;margin-bottom:4px">' + ns.name + '</div>' +
          '<div style="font-size:12.5px;color:#cbd5e1;line-height:1.4;margin-bottom:16px;flex:1">' + esc(ns.desc) + '</div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.1);padding-top:12px">' +
            '<div style="font-size:15px;font-weight:900;color:#fde047;font-family:monospace">' + window.ETHITH_COIN_SVG(16) + ' ' + ns.price + ' Coin</div>' +
            (isEquipped ?
              '<button type="button" class="eth-vault-sell-btn" style="background:#475569;font-size:12px;padding:6px 12px" data-action="unequip-name-style">O\'chirish</button>' :
              '<button type="button" class="eth-p2p-buy-btn" style="font-size:12px;padding:6px 14px" data-action="equip-name-style" data-style-id="' + ns.id + '" data-price="' + ns.price + '" data-style-name="' + esc(ns.name) + '">' +
                (status.active ? 'Tanlash' : (status.expired ? 'Yangilash (7 kun)' : 'Sotib Olish (7 kun)')) +
              '</button>'
            ) +
          '</div>' +
        '</div>';
      });
      html += '</div></div>';

      // 2. 100 VIP TITLES
      html += '<div style="margin-bottom:34px">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
          '<h3 style="font-size:18px;font-weight:900;color:#60a5fa;margin:0">👑 2. Maxsus Maqomlar & Unvonlar (' + (cosmetics.titles || []).length + ' ta)</h3>' +
          '<span style="font-size:12px;font-weight:800;color:#34d399;background:rgba(16,185,129,0.15);padding:3px 10px;border-radius:10px">⏳ 7 Kunlik Litsenziya</span>' +
        '</div>' +
        '<p style="font-size:13px;color:#94a3b8;margin:0 0 16px">Ismingiz ostida barchaga ko\'rinib turuvchi eksklyuziv oliy maqomlar va unvonlar yorlig\'i.</p>' +
        '<div class="eth-cosmetic-grid" style="grid-template-columns:repeat(auto-fill, minmax(260px, 1fr))">';

      (cosmetics.titles || []).forEach(function(tt) {
        var status = getCosmeticStatus(S.user, tt.id);
        var isEquipped = (myTitle === tt.name) && status.active;

        html += '<div class="eth-cosmetic-card" style="border-color:' + (isEquipped ? '#3b82f6' : 'rgba(255,255,255,0.12)') + '">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
            '<span style="font-size:11px;color:#94a3b8;font-weight:700">UNVON:</span>' +
            '<span class="eth-vip-timer-badge ' + (status.expired ? 'expired' : '') + '">' + status.label + '</span>' +
          '</div>' +
          '<div style="background:#030712;padding:10px;border-radius:12px;text-align:center;margin-bottom:12px;border:1px solid #1f2937">' +
            '<span class="eth-user-title-badge" style="font-size:12.5px;padding:3px 10px">' + esc(tt.name) + '</span>' +
          '</div>' +
          '<div style="font-size:15px;font-weight:900;color:#fff;margin-bottom:4px">' + esc(tt.name) + '</div>' +
          '<div style="font-size:11.5px;color:#cbd5e1;line-height:1.4;margin-bottom:14px;flex:1">' + esc(tt.desc) + '</div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.1);padding-top:10px">' +
            '<div style="font-size:14px;font-weight:900;color:#fde047;font-family:monospace">' + window.ETHITH_COIN_SVG(15) + ' ' + tt.price + ' Coin</div>' +
            (isEquipped ?
              '<button type="button" class="eth-vault-sell-btn" style="background:#475569;font-size:11px;padding:5px 10px" data-action="unequip-title">O\'chirish</button>' :
              '<button type="button" class="eth-p2p-buy-btn" style="font-size:11px;padding:5px 12px" data-action="equip-title" data-title-id="' + tt.id + '" data-title-name="' + esc(tt.name) + '" data-price="' + tt.price + '">' +
                (status.active ? 'Tanlash' : (status.expired ? 'Yangilash (7 kun)' : 'Sotib Olish (7 kun)')) +
              '</button>'
            ) +
          '</div>' +
        '</div>';
      });
      html += '</div></div>';

      // 3. 50 VICTORY SOUNDS (WITH PREVIEWS & DURATIONS 2s-10s)
      html += '<div style="margin-bottom:34px">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
          '<h3 style="font-size:18px;font-weight:900;color:#a855f7;margin:0">🎺 3. Quiz G\'alaba Ovozlar (' + (cosmetics.victorySounds || []).length + ' ta - 2s dan 10s gacha)</h3>' +
          '<span style="font-size:12px;font-weight:800;color:#34d399;background:rgba(16,185,129,0.15);padding:3px 10px;border-radius:10px">⏳ 7 Kunlik Litsenziya</span>' +
        '</div>' +
        '<p style="font-size:13px;color:#94a3b8;margin:0 0 16px">Quiz Bellashuvida 1-o\'rinni olganingizda ustoz va barcha sinfdoshlar ekranida maxsus qarsaklar, URA! hayqiriqlari yoki orkestr sadolari yangraydi!</p>' +
        '<div class="eth-cosmetic-grid" style="grid-template-columns:repeat(auto-fill, minmax(260px, 1fr))">';

      (cosmetics.victorySounds || []).forEach(function(vs) {
        var status = getCosmeticStatus(S.user, vs.id);
        var isEquipped = (myVictorySound === vs.id) || (!myVictorySound && vs.id === 'applause_stadium_4s');
        var isPlayingThis = (_currentlyPlayingPreview === vs.id);

        html += '<div class="eth-cosmetic-card" style="border-color:' + (isEquipped ? '#a855f7' : 'rgba(255,255,255,0.12)') + '">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
            '<span style="font-size:11px;font-weight:800;color:#c084fc;background:rgba(168,85,247,0.15);padding:2px 8px;border-radius:8px">⏱️ ' + vs.duration + '</span>' +
            '<span class="eth-vip-timer-badge ' + (status.expired ? 'expired' : '') + '">' + status.label + '</span>' +
          '</div>' +
          '<div style="font-size:15px;font-weight:900;color:#fff;margin-bottom:4px">' + esc(vs.name) + '</div>' +
          '<div style="font-size:11.5px;color:#cbd5e1;line-height:1.4;margin-bottom:12px;flex:1">' + esc(vs.desc) + '</div>' +
          '<div style="margin-bottom:12px">' +
            '<button type="button" class="eth-sound-preview-btn ' + (isPlayingThis ? 'playing' : '') + '" style="width:100%;justify-content:center" data-action="preview-sound" data-sound-id="' + vs.id + '">' +
              (isPlayingThis ? '⏹ To\'xtatish' : '▶ Tinglash (' + vs.duration + ')') +
            '</button>' +
          '</div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.1);padding-top:10px">' +
            '<div style="font-size:14px;font-weight:900;color:#fde047;font-family:monospace">' + window.ETHITH_COIN_SVG(15) + ' ' + vs.price + ' Coin</div>' +
            (isEquipped ?
              '<span style="font-size:11px;font-weight:900;color:#a855f7">✓ Tanlangan</span>' :
              '<button type="button" class="eth-p2p-buy-btn" style="font-size:11px;padding:5px 12px" data-action="equip-sound" data-sound-id="' + vs.id + '" data-price="' + vs.price + '" data-sound-name="' + esc(vs.name) + '">' +
                (status.active ? 'Tanlash' : (status.expired ? 'Yangilash (7 kun)' : 'Sotib Olish (7 kun)')) +
              '</button>'
            ) +
          '</div>' +
        '</div>';
      });
      html += '</div></div>';
    }

    // -------------------------------------------------------------
    // TAB 5: SYSTEM SELL VAULT (SHAXSIY SEYF)
    // -------------------------------------------------------------
    else if (_activeMarketTab === 'vault') {
      var sellableItems = [];
      var userGifts = (S.user && Array.isArray(S.user.gifts)) ? S.user.gifts : [];
      userGifts.forEach(function(g, idx) {
        var rarity = g.rarity || 'Common';
        var val = g.price || (rarity === 'Legendary' ? 1000 : (rarity === 'Epic' ? 450 : (rarity === 'Rare' ? 200 : 70)));
        sellableItems.push({
          type: 'gift',
          index: idx,
          id: 'gift_' + idx,
          name: g.name || 'Sovrin',
          desc: g.desc || 'Packdan tushgan maxsus buyum',
          icon: g.icon || '🎁',
          rarity: rarity,
          price: val
        });
      });

      var defaultEmojis = window.ETHITH_DEFAULT_FREE_EMOJIS || ['👍', '😊', '❤️'];
      var userEmojis = (S.user && Array.isArray(S.user.unlockedEmojis)) ? S.user.unlockedEmojis : [];
      userEmojis.forEach(function(emChar) {
        if (defaultEmojis.indexOf(emChar) === -1) {
          var catalogEntry = (window.ETHITH_CHAT_EMOJIS || []).find(function(e) { return e.emoji === emChar; });
          var rarity = catalogEntry ? catalogEntry.rarity : 'Rare';
          var val = (rarity === 'Legendary' ? 850 : (rarity === 'Epic' ? 400 : (rarity === 'Rare' ? 180 : 60)));
          sellableItems.push({
            type: 'emoji',
            emojiChar: emChar,
            id: 'emoji_' + emChar,
            name: emChar + ' ' + (catalogEntry ? catalogEntry.name : 'Maxsus Emoji'),
            desc: 'Chat va reaksiyalarda ochilgan emoji',
            icon: emChar,
            rarity: rarity,
            price: val
          });
        }
      });

      var userAvatars = (S.user && Array.isArray(S.user.unlockedAvatars)) ? S.user.unlockedAvatars : [];
      userAvatars.forEach(function(avId) {
        if (avId !== (S.user && S.user.avatar)) {
          var avObj = (window.ETHITH_AVATARS || []).find(function(a) { return a.id === avId; });
          var rarity = avObj ? avObj.rarity : 'Epic';
          var val = (rarity === 'Legendary' ? 1200 : (rarity === 'Epic' ? 550 : 250));
          sellableItems.push({
            type: 'avatar',
            avatarId: avId,
            id: 'avatar_' + avId,
            name: avObj ? avObj.name : 'Personaj Avatari',
            desc: avObj ? avObj.tagline : 'Eksklyuziv personaj avatari',
            svg: avObj ? avObj.svg : '',
            rarity: rarity,
            price: val
          });
        }
      });

      var filteredItems = sellableItems.filter(function(item) {
        if (_activeVaultFilter === 'gifts') return item.type === 'gift';
        if (_activeVaultFilter === 'emojis') return item.type === 'emoji';
        if (_activeVaultFilter === 'avatars') return item.type === 'avatar';
        return true;
      });

      html += '<div class="eth-vault-section">' +
        '<div class="eth-vault-header">' +
          '<div class="eth-vault-title-wrap">' +
            '<h3><span>🪙 Shaxsiy Seyf & Tizimga Tezkor Sotish</span></h3>' +
            '<p>Ortiqcha buyumlaringizni darhol tizim bankiga soting va hisobingizga naqd ETHITH Coinlar oling!</p>' +
          '</div>' +
          '<div class="eth-vault-filters">' +
            '<button type="button" class="eth-vault-filter-btn ' + (_activeVaultFilter === 'all' ? 'active' : '') + '" data-vault-filter="all">Hammasi (' + sellableItems.length + ')</button>' +
            '<button type="button" class="eth-vault-filter-btn ' + (_activeVaultFilter === 'gifts' ? 'active' : '') + '" data-vault-filter="gifts">Sovg\'alar (' + userGifts.length + ')</button>' +
            '<button type="button" class="eth-vault-filter-btn ' + (_activeVaultFilter === 'emojis' ? 'active' : '') + '" data-vault-filter="emojis">Chat Emojilari</button>' +
            '<button type="button" class="eth-vault-filter-btn ' + (_activeVaultFilter === 'avatars' ? 'active' : '') + '" data-vault-filter="avatars">Avatarlar</button>' +
          '</div>' +
        '</div>';

      if (filteredItems.length === 0) {
        html += '<div class="eth-vault-empty">' +
          '<div class="eth-vault-empty-icon">🪙</div>' +
          '<h3 style="font-size:18px;font-weight:800;color:#cbd5e1;margin-bottom:6px">Hozircha sotish uchun buyumlar yo\'q</h3>' +
          '<p style="font-size:13px;color:#64748b;max-width:400px;margin:0 auto">Packlarni ochib qiziqarli sovg\'alar va personajlarni yuting, keyin esa shu yerda soting!</p>' +
        '</div>';
      } else {
        html += '<div class="eth-vault-grid">';
        filteredItems.forEach(function(item) {
          var visualHtml = '';
          if (item.type === 'avatar' && item.svg) {
            visualHtml = '<div style="width:100%;height:100%">' + item.svg + '</div>';
          } else if (item.type === 'emoji') {
            visualHtml = '<span style="font-size:32px">' + item.icon + '</span>';
          } else {
            visualHtml = '<span style="font-size:32px">' + item.icon + '</span>';
          }

          html += '<div class="eth-vault-card">' +
            '<div class="eth-vault-card-visual">' + visualHtml + '</div>' +
            '<div class="eth-vault-card-body">' +
              '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">' +
                '<span class="eth-rarity-badge eth-rarity-' + item.rarity + '" style="font-size:10px;padding:2px 8px">' + item.rarity + '</span>' +
              '</div>' +
              '<div class="eth-vault-card-name">' + esc(item.name) + '</div>' +
              '<div class="eth-vault-card-desc">' + esc(item.desc) + '</div>' +
              '<div class="eth-vault-card-footer">' +
                '<div class="eth-vault-price-tag">' +
                  window.ETHITH_COIN_SVG(16) + ' +' + item.price +
                '</div>' +
                '<button type="button" class="eth-vault-sell-btn" data-action="sell-vault-item" data-item-type="' + item.type + '" data-item-key="' + (item.type === 'gift' ? item.index : (item.type === 'emoji' ? item.emojiChar : item.avatarId)) + '" data-item-price="' + item.price + '" data-item-name="' + esc(item.name) + '">' +
                  'Sotish' +
                '</button>' +
              '</div>' +
            '</div>' +
          '</div>';
        });
        html += '</div>';
      }
      html += '</div>';
    }

    html += '</div>'; // end eth-market-screen
    container.innerHTML = html;

    // -------------------------------------------------------------
    // EVENT LISTENERS BINDING
    // -------------------------------------------------------------
    container.querySelectorAll('[data-market-tab]').forEach(function(btn) {
      btn.onclick = function() {
        if (window.stopCurrentFanfare) window.stopCurrentFanfare();
        _currentlyPlayingPreview = null;
        _activeMarketTab = btn.dataset.marketTab;
        renderMarketView(container);
      };
    });

    container.querySelectorAll('[data-vault-filter]').forEach(function(btn) {
      btn.onclick = function() {
        _activeVaultFilter = btn.dataset.vaultFilter;
        renderMarketView(container);
      };
    });

    container.querySelectorAll('[data-p2p-filter]').forEach(function(btn) {
      btn.onclick = function() {
        _activeP2pFilter = btn.dataset.p2pFilter;
        renderMarketView(container);
      };
    });

    // Buy Booster listener (Supports all 19 Boosters)
    container.querySelectorAll('[data-action="buy-booster"]').forEach(function(btn) {
      btn.onclick = function() {
        var bId = btn.dataset.boosterId;
        var bObj = (window.ETHITH_BOOSTERS || []).find(function(item) { return item.id === bId; });
        if (!bObj) return;

        if (!S.user || (S.user.coins || 0) < bObj.price) {
          alert("Mablag' yetarli emas! Sizda " + (S.user.coins || 0) + " Coin bor, ushbu kuchaytirgich narxi esa " + bObj.price + " Coin.");
          return;
        }

        if (!confirm('"' + bObj.name + '" kuchaytirgichini ' + bObj.price + ' ETHITH Coinga sotib olishni tasdiqlaysizmi?')) {
          return;
        }

        S.user.coins = Math.max(0, (S.user.coins || 0) - bObj.price);
        if (!S.user.boosters) S.user.boosters = {};
        S.user.boosters[bId] = (S.user.boosters[bId] || 0) + 1;

        if (bId === 'booster_2x') {
          S.user.booster2xUntil = Math.max(Date.now(), S.user.booster2xUntil || 0) + (60 * 60 * 1000);
        }

        if (Array.isArray(S.accounts)) {
          var myAcc = S.accounts.find(function(a) {
            return (a.email && S.user.email && a.email.toLowerCase() === S.user.email.toLowerCase()) ||
                   (a.name && S.user.name && a.name.toLowerCase() === S.user.name.toLowerCase());
          });
          if (myAcc) myAcc.coins = S.user.coins;
        }

        App.saveState();
        if (window._ethithUpdateTopCoins) window._ethithUpdateTopCoins();
        if (window.EthithSync && window.EthithSync.publishLive) {
          window.EthithSync.publishLive({
            type: 'USER_STATE_SYNC',
            user: {
              id: S.user.id,
              name: S.user.name,
              email: S.user.email,
              role: S.user.role,
              coins: S.user.coins,
              avatar: S.user.avatar,
              level: S.level || S.user.level,
              nameStyle: S.user.nameStyle,
              title: S.user.title,
              dailyMinutes: S.user.dailyMinutes
            }
          });
          if (window.EthithSync.pushRemoteStore) window.EthithSync.pushRemoteStore();
        }

        playPackMagicSound('connect');
        alert('🎉 "' + bObj.name + '" muvaffaqiyatli sotib olindi!\nSizdagi miqdor: ' + S.user.boosters[bId] + ' dona.');
        renderMarketView(container);
      };
    });

    // P2P Listeners
    var btnPostP2p = container.querySelector('#btnOpenPostP2PModal') || container.querySelector('#btnEmptyPostP2P');
    if (btnPostP2p) {
      btnPostP2p.onclick = function() {
        showPostP2PListingModal(function() {
          renderMarketView(container);
        });
      };
    }

    container.querySelectorAll('[data-action="buy-p2p"]').forEach(function(btn) {
      btn.onclick = function() {
        var lId = btn.dataset.listingId;
        var listing = (S.p2pListings || []).find(function(l) { return l.id === lId; });
        if (!listing) return;

        if (!S.user || (S.user.coins || 0) < listing.price) {
          alert("Mablag' yetarli emas! Ushbu buyum narxi " + listing.price + " Coin, sizda esa " + (S.user.coins || 0) + " Coin bor.");
          return;
        }

        if (!confirm('"' + (listing.item.name || 'Buyum') + '"ni ' + listing.price + ' ETHITH Coinga sotib olishni tasdiqlaysizmi?')) {
          return;
        }

        S.user.coins -= listing.price;
        var it = listing.item;
        if (it.type === 'gift') {
          if (!Array.isArray(S.user.gifts)) S.user.gifts = [];
          S.user.gifts.unshift(it);
        } else if (it.type === 'emoji') {
          if (!Array.isArray(S.user.unlockedEmojis)) S.user.unlockedEmojis = [];
          if (S.user.unlockedEmojis.indexOf(it.emojiChar) === -1) S.user.unlockedEmojis.push(it.emojiChar);
        } else if (it.type === 'avatar') {
          if (!Array.isArray(S.user.unlockedAvatars)) S.user.unlockedAvatars = [];
          if (S.user.unlockedAvatars.indexOf(it.avatarId) === -1) S.user.unlockedAvatars.push(it.avatarId);
        }

        S.p2pListings = S.p2pListings.filter(function(l) { return l.id !== lId; });

        if (Array.isArray(S.accounts)) {
          var sellerAcc = S.accounts.find(function(a) {
            return (a.email && listing.sellerEmail && a.email.toLowerCase() === listing.sellerEmail.toLowerCase()) ||
                   (a.name && listing.sellerName && a.name.toLowerCase() === listing.sellerName.toLowerCase());
          });
          if (sellerAcc) sellerAcc.coins = (sellerAcc.coins || 0) + listing.price;
        }

        App.saveState();
        if (window._ethithUpdateTopCoins) window._ethithUpdateTopCoins();

        if (window.EthithSync && window.EthithSync.publishLive) {
          window.EthithSync.publishLive({
            type: 'P2P_BUY_ITEM',
            listingId: lId,
            sellerId: listing.sellerId,
            sellerEmail: listing.sellerEmail,
            sellerName: listing.sellerName,
            buyerId: S.user.id || S.user.email,
            buyerName: S.user.name,
            price: listing.price,
            itemName: listing.item.name
          });
          if (window.EthithSync.pushRemoteStore) window.EthithSync.pushRemoteStore();
        }

        playPackMagicSound('connect');
        alert('🎉 Xarid amalga oshirildi! "' + listing.item.name + '" sizning inventaringizga qo\'shildi.');
        renderMarketView(container);
      };
    });

    container.querySelectorAll('[data-action="cancel-p2p"]').forEach(function(btn) {
      btn.onclick = function() {
        var lId = btn.dataset.listingId;
        var listing = (S.p2pListings || []).find(function(l) { return l.id === lId; });
        if (!listing) return;

        if (!confirm("Ushbu e'lonni bekor qilib, buyumni inventaringizga qaytarishni xohlaysizmi?")) return;

        var it = listing.item;
        if (it) {
          if (it.type === 'gift' || it.type === 'prize') {
            if (!Array.isArray(S.user.gifts)) S.user.gifts = [];
            S.user.gifts.unshift(it);
          } else if (it.type === 'emoji' || it.emojiChar) {
            var emChar = it.emojiChar || it.emoji || it.icon;
            if (!Array.isArray(S.user.unlockedEmojis)) S.user.unlockedEmojis = [];
            if (emChar && S.user.unlockedEmojis.indexOf(emChar) === -1) S.user.unlockedEmojis.push(emChar);
          } else if (it.type === 'avatar' || it.avatarId) {
            var avId = it.avatarId || it.id;
            if (!Array.isArray(S.user.unlockedAvatars)) S.user.unlockedAvatars = [];
            if (avId && S.user.unlockedAvatars.indexOf(avId) === -1) S.user.unlockedAvatars.push(avId);
          }
        }

        // Remove from listings
        S.p2pListings = (S.p2pListings || []).filter(function(l) { return l.id !== lId; });

        // Explicitly record in deletedListingIds so sync poller never re-adds it!
        if (!S.deletedListingIds) S.deletedListingIds = [];
        if (S.deletedListingIds.indexOf(lId) === -1) S.deletedListingIds.push(lId);

        try {
          localStorage.setItem('ethith_p2p_listings', JSON.stringify(S.p2pListings));
          localStorage.setItem('ethith_deleted_listing_ids', JSON.stringify(S.deletedListingIds));
        } catch(e) {}

        App.saveState();

        if (window.EthithSync && window.EthithSync.publishLive) {
          window.EthithSync.publishLive({
            type: 'P2P_REMOVE_ITEM',
            listingId: lId
          });
          if (window.EthithSync.pushRemoteStore) window.EthithSync.pushRemoteStore();
        }

        alert("E'lon bekor qilindi va buyum inventaringizga muvaffaqiyatli qaytarildi.");
        renderMarketView(container);
      };
    });

    container.querySelectorAll('[data-action="barter-p2p"]').forEach(function(btn) {
      btn.onclick = function() {
        var lId = btn.dataset.listingId;
        var listing = (S.p2pListings || []).find(function(l) { return l.id === lId; });
        if (!listing) return;

        showBarterOfferModal(listing, function() {
          renderMarketView(container);
        });
      };
    });

    // VIP Cosmetics (Temporary 7-Day License Purchase & Equipping)
    container.querySelectorAll('[data-action="equip-name-style"]').forEach(function(btn) {
      btn.onclick = function() {
        var sId = btn.dataset.styleId;
        var sName = btn.dataset.styleName || sId;
        var price = Number(btn.dataset.price) || 0;
        var status = getCosmeticStatus(S.user, sId);

        if (status.active) {
          // Already active, just equip
          S.user.nameStyle = sId;
          App.saveState();
          if (window._ethithUpdateTopCoins) window._ethithUpdateTopCoins();
          renderMarketView(container);
          alert('✓ "' + sName + '" faol nikneym sifatida o\'rnatildi!');
          return;
        }

        if (!confirm('"' + sName + '" nikneym effektining 7 kunlik litsenziyasini ' + price + ' ETHITH Coinga sotib olishni tasdiqlaysizmi?')) return;
        if ((S.user.coins || 0) < price) {
          alert("Mablag' yetarli emas! Sizda " + (S.user.coins || 0) + " Coin bor.");
          return;
        }

        S.user.coins -= price;
        S.user.nameStyle = sId;
        if (!S.user.activeCosmetics) S.user.activeCosmetics = {};
        var existing = S.user.activeCosmetics[sId];
        var baseTime = (existing && existing.expiresAt > Date.now()) ? existing.expiresAt : Date.now();
        S.user.activeCosmetics[sId] = {
          id: sId,
          type: 'nameStyle',
          name: sName,
          expiresAt: baseTime + (7 * 24 * 60 * 60 * 1000)
        };

        App.saveState();
        if (window._ethithUpdateTopCoins) window._ethithUpdateTopCoins();
        if (window.EthithSync && window.EthithSync.publishLive) {
          window.EthithSync.publishLive({
            type: 'USER_STATE_SYNC',
            user: {
              id: S.user.id,
              name: S.user.name,
              email: S.user.email,
              role: S.user.role,
              coins: S.user.coins,
              avatar: S.user.avatar,
              level: S.level || S.user.level,
              nameStyle: S.user.nameStyle,
              title: S.user.title,
              dailyMinutes: S.user.dailyMinutes
            }
          });
          if (window.EthithSync.pushRemoteStore) window.EthithSync.pushRemoteStore();
        }
        playPackMagicSound('connect');
        alert("🎉 Nikneym effekti 7 kunga faollashtirildi! Endi ismingiz barcha joyda ajoyib nur bilan yonadi.");
        renderMarketView(container);
      };
    });

    container.querySelectorAll('[data-action="unequip-name-style"]').forEach(function(btn) {
      btn.onclick = function() {
        S.user.nameStyle = null;
        App.saveState();
        if (window.EthithSync && window.EthithSync.publishLive) {
          window.EthithSync.publishLive({
            type: 'USER_STATE_SYNC',
            user: { id: S.user.id, name: S.user.name, email: S.user.email, role: S.user.role, coins: S.user.coins, nameStyle: null, title: S.user.title }
          });
          if (window.EthithSync.pushRemoteStore) window.EthithSync.pushRemoteStore();
        }
        alert("Nikneym effekti o'chirildi.");
        renderMarketView(container);
      };
    });

    container.querySelectorAll('[data-action="equip-title"]').forEach(function(btn) {
      btn.onclick = function() {
        var tId = btn.dataset.titleId;
        var tName = btn.dataset.titleName;
        var price = Number(btn.dataset.price) || 0;
        var status = getCosmeticStatus(S.user, tId);

        if (status.active) {
          S.user.title = tName;
          S.user.titleId = tId;
          App.saveState();
          renderMarketView(container);
          alert('✓ "' + tName + '" unvoni faol maqom sifatida o\'rnatildi!');
          return;
        }

        if (!confirm('"' + tName + '" unvonining 7 kunlik litsenziyasini ' + price + ' ETHITH Coinga sotib olishni tasdiqlaysizmi?')) return;
        if ((S.user.coins || 0) < price) {
          alert("Mablag' yetarli emas! Sizda " + (S.user.coins || 0) + " Coin bor.");
          return;
        }

        S.user.coins -= price;
        S.user.title = tName;
        S.user.titleId = tId;
        if (!S.user.activeCosmetics) S.user.activeCosmetics = {};
        var existing = S.user.activeCosmetics[tId];
        var baseTime = (existing && existing.expiresAt > Date.now()) ? existing.expiresAt : Date.now();
        S.user.activeCosmetics[tId] = {
          id: tId,
          type: 'title',
          name: tName,
          expiresAt: baseTime + (7 * 24 * 60 * 60 * 1000)
        };

        App.saveState();
        if (window._ethithUpdateTopCoins) window._ethithUpdateTopCoins();
        if (window.EthithSync && window.EthithSync.publishLive) {
          window.EthithSync.publishLive({
            type: 'USER_STATE_SYNC',
            user: {
              id: S.user.id,
              name: S.user.name,
              email: S.user.email,
              role: S.user.role,
              coins: S.user.coins,
              avatar: S.user.avatar,
              level: S.level || S.user.level,
              nameStyle: S.user.nameStyle,
              title: S.user.title,
              dailyMinutes: S.user.dailyMinutes
            }
          });
          if (window.EthithSync.pushRemoteStore) window.EthithSync.pushRemoteStore();
        }
        playPackMagicSound('connect');
        alert('🎉 "' + tName + '" unvoni 7 kunga muvaffaqiyatli o\'rnatildi!');
        renderMarketView(container);
      };
    });

    container.querySelectorAll('[data-action="unequip-title"]').forEach(function(btn) {
      btn.onclick = function() {
        S.user.title = null;
        S.user.titleId = null;
        App.saveState();
        if (window.EthithSync && window.EthithSync.publishLive) {
          window.EthithSync.publishLive({
            type: 'USER_STATE_SYNC',
            user: { id: S.user.id, name: S.user.name, email: S.user.email, role: S.user.role, coins: S.user.coins, nameStyle: S.user.nameStyle, title: null }
          });
          if (window.EthithSync.pushRemoteStore) window.EthithSync.pushRemoteStore();
        }
        alert("Unvon o'chirildi.");
        renderMarketView(container);
      };
    });

    // Preview Victory Sound with Toggle
    container.querySelectorAll('[data-action="preview-sound"]').forEach(function(btn) {
      btn.onclick = function() {
        var sId = btn.dataset.soundId;
        if (_currentlyPlayingPreview === sId) {
          if (window.stopCurrentFanfare) window.stopCurrentFanfare();
          _currentlyPlayingPreview = null;
          renderMarketView(container);
        } else {
          _currentlyPlayingPreview = sId;
          if (window.playVictoryFanfare) window.playVictoryFanfare(sId);
          renderMarketView(container);
        }
      };
    });

    // Equip / Buy Victory Sound (Temporary 7-Day Lease)
    container.querySelectorAll('[data-action="equip-sound"]').forEach(function(btn) {
      btn.onclick = function() {
        var sId = btn.dataset.soundId;
        var sName = btn.dataset.soundName || sId;
        var price = Number(btn.dataset.price) || 0;
        var status = getCosmeticStatus(S.user, sId);

        if (status.active) {
          S.user.victorySound = sId;
          App.saveState();
          renderMarketView(container);
          alert('✓ "' + sName + '" g\'alaba sadolari sifatida tanlandi!');
          return;
        }

        if (!confirm('"' + sName + '" g\'alaba ovozining 7 kunlik litsenziyasini ' + price + ' ETHITH Coinga sotib olishni tasdiqlaysizmi?')) return;
        if ((S.user.coins || 0) < price) {
          alert("Mablag' yetarli emas! Sizda " + (S.user.coins || 0) + " Coin bor.");
          return;
        }

        S.user.coins -= price;
        S.user.victorySound = sId;
        if (!S.user.activeCosmetics) S.user.activeCosmetics = {};
        var existing = S.user.activeCosmetics[sId];
        var baseTime = (existing && existing.expiresAt > Date.now()) ? existing.expiresAt : Date.now();
        S.user.activeCosmetics[sId] = {
          id: sId,
          type: 'victorySound',
          name: sName,
          expiresAt: baseTime + (7 * 24 * 60 * 60 * 1000)
        };

        App.saveState();
        if (window._ethithUpdateTopCoins) window._ethithUpdateTopCoins();
        if (window.EthithSync && window.EthithSync.publishLive) {
          window.EthithSync.publishLive({
            type: 'USER_STATE_SYNC',
            user: { id: S.user.id, name: S.user.name, email: S.user.email, role: S.user.role, coins: S.user.coins, victorySound: sId }
          });
          if (window.EthithSync.pushRemoteStore) window.EthithSync.pushRemoteStore();
        }
        if (window.playVictoryFanfare) window.playVictoryFanfare(sId);
        alert("🎉 G'alaba ovozi 7 kunga o'rnatildi! Quizda 1-o'rinni olganingizda shu kuy yangraydi.");
        renderMarketView(container);
      };
    });

    // Sell Vault Item Listener
    container.querySelectorAll('[data-action="sell-vault-item"]').forEach(function(btn) {
      btn.onclick = function() {
        var itType = btn.dataset.itemType;
        var itPrice = Number(btn.dataset.itemPrice) || 0;
        var itName = btn.dataset.itemName;
        var itKey = btn.dataset.itemKey;

        if (!confirm('"' + itName + '" buyumini +' + itPrice + ' ETHITH Coinga sotishni tasdiqlaysizmi?')) {
          return;
        }

        if (itType === 'gift') {
          var gIdx = Number(itKey);
          if (Array.isArray(S.user.gifts) && gIdx >= 0 && gIdx < S.user.gifts.length) {
            S.user.gifts.splice(gIdx, 1);
          }
        } else if (itType === 'emoji') {
          if (Array.isArray(S.user.unlockedEmojis)) {
            var eIdx = S.user.unlockedEmojis.indexOf(itKey);
            if (eIdx > -1) S.user.unlockedEmojis.splice(eIdx, 1);
          }
        } else if (itType === 'avatar') {
          if (Array.isArray(S.user.unlockedAvatars)) {
            var aIdx = S.user.unlockedAvatars.indexOf(itKey);
            if (aIdx > -1) S.user.unlockedAvatars.splice(aIdx, 1);
          }
        }

        S.user.coins = (S.user.coins || 0) + itPrice;
        if (Array.isArray(S.accounts)) {
          var myAcc = S.accounts.find(function(a) {
            return (a.email && S.user.email && a.email.toLowerCase() === S.user.email.toLowerCase()) ||
                   (a.name && S.user.name && a.name.toLowerCase() === S.user.name.toLowerCase());
          });
          if (myAcc) myAcc.coins = S.user.coins;
        }

        App.saveState();
        if (window._ethithUpdateTopCoins) window._ethithUpdateTopCoins();

        if (window.EthithSync && window.EthithSync.publishLive) {
          window.EthithSync.publishLive({
            type: 'USER_STATE_SYNC',
            user: {
              id: S.user.id,
              name: S.user.name,
              email: S.user.email,
              role: S.user.role,
              coins: S.user.coins,
              avatar: S.user.avatar,
              level: S.level || S.user.level,
              dailyMinutes: S.user.dailyMinutes
            }
          });
          if (window.EthithSync.pushRemoteStore) window.EthithSync.pushRemoteStore();
        }

        playPackMagicSound('connect');
        alert('🎉 "' + itName + '" muvaffaqiyatli sotildi!\nHamyoningizga +' + itPrice + ' ETHITH Coin qo\'shildi!');
        renderMarketView(container);
      };
    });

    // Open Pack Listener (Daily 00:00 midnight reset check)
    container.querySelectorAll('[data-action="open-pack"]').forEach(function(btn) {
      btn.onclick = function() {
        var pId = btn.dataset.packId;
        var p = (window.ETHITH_PACKS || []).find(function(item) { return item.id === pId; });
        if (!p || p.isComingSoon) {
          if (p && p.isComingSoon) alert("Ushbu pack tez kunda ochiladi!");
          return;
        }

        if (p.isFreeDaily) {
          var last = (S.user && S.user.lastDailyPackAt) ? Number(S.user.lastDailyPackAt) : 0;
          if (isSameCalendarDay(last, Date.now())) {
            alert("Kunlik bepul pack bugun uchun allaqachon ochilgan! Yangi kun boshlanishi (soat 00:00) bilan yana ochishingiz mumkin.");
            return;
          }
        } else {
          if (!S.user || (S.user.coins || 0) < p.price) {
            alert("Mablag' yetarli emas! Sizda " + (S.user.coins || 0) + " Coin bor, ushbu pack narxi esa " + p.price + " Coin.");
            return;
          }
        }

        // Open MLBB style interactive modal
        showMLBBPackOpeningModal(p, function() {
          renderMarketView(container);
          if (window._ethithUpdateTopCoins) window._ethithUpdateTopCoins();
        });
      };
    });
  }

  // ====================================================
  // MODAL: POST ITEM TO P2P AUCTION / MARKET
  // ====================================================
  function showPostP2PListingModal(onPosted) {
    var overlay = document.createElement('div');
    overlay.className = 'eth-gift-modal-overlay';

    var myItems = [];
    (S.user.gifts || []).forEach(function(g, idx) {
      myItems.push({ type: 'gift', index: idx, id: 'gift_' + idx, name: g.name || 'Sovrin', icon: g.icon || '🎁', rarity: g.rarity || 'Rare', desc: g.desc });
    });
    var defaultEmojis = window.ETHITH_DEFAULT_FREE_EMOJIS || ['👍', '😊', '❤️'];
    (S.user.unlockedEmojis || []).forEach(function(em) {
      if (defaultEmojis.indexOf(em) === -1) {
        var cat = (window.ETHITH_CHAT_EMOJIS || []).find(function(e) { return e.emoji === em; });
        myItems.push({ type: 'emoji', emojiChar: em, id: 'emoji_' + em, name: em + ' ' + (cat ? cat.name : 'Emoji'), icon: em, rarity: cat ? cat.rarity : 'Rare', desc: 'Chat Emojisi' });
      }
    });
    (S.user.unlockedAvatars || []).forEach(function(avId) {
      if (avId !== S.user.avatar) {
        var avObj = (window.ETHITH_AVATARS || []).find(function(a) { return a.id === avId; });
        myItems.push({ type: 'avatar', avatarId: avId, id: 'avatar_' + avId, name: avObj ? avObj.name : 'Avatar', svg: avObj ? avObj.svg : '', icon: '👤', rarity: avObj ? avObj.rarity : 'Epic', desc: avObj ? avObj.tagline : 'Personaj' });
      }
    });

    var html = '<div class="eth-gift-modal-box">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.12);padding-bottom:14px;margin-bottom:18px">' +
        '<div style="display:flex;align-items:center;gap:10px">' +
          '<span style="font-size:24px;">🏴‍☠️</span>' +
          '<h3 style="font-size:18px;font-weight:900;color:#ffffff;margin:0;">Qora Bozorga E\'lon Chiqarish</h3>' +
        '</div>' +
        '<button type="button" id="btnClosePostModal" style="background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer;font-weight:700">✕</button>' +
      '</div>';

    if (myItems.length === 0) {
      html += '<div style="text-align:center;padding:30px 10px;color:#cbd5e1">' +
        '<p style="font-size:15px;margin-bottom:16px">Sizda hozircha auksionga chiqarish uchun ortiqcha sovg\'a yoki personaj yo\'q.</p>' +
        '<button type="button" class="eth-p2p-buy-btn" id="btnCancelEmptyPost">Orqaga</button>' +
      '</div>';
    } else {
      html += '<div style="margin-bottom:14px">' +
        '<label style="display:block;font-size:12.5px;font-weight:800;color:#94a3b8;margin-bottom:8px">1. SOTILADIGAN BUYUMNI TANLANG:</label>' +
        '<div id="postItemsSelectArea" style="display:flex;flex-direction:column;gap:8px;max-height:190px;overflow-y:auto;padding-right:4px">';

      myItems.forEach(function(item, idx) {
        html += '<div class="eth-p2p-select-item ' + (idx === 0 ? 'selected' : '') + '" data-item-idx="' + idx + '" style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:12px;background:' + (idx === 0 ? 'rgba(245,158,11,0.18)' : '#0f172a') + ';border:1.5px solid ' + (idx === 0 ? '#f59e0b' : '#374151') + ';cursor:pointer;transition:all 0.2s ease">' +
          '<span style="font-size:24px">' + (item.type === 'avatar' ? '👤' : item.icon) + '</span>' +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-size:13.5px;font-weight:900;color:#fff;display:flex;align-items:center;gap:6px">' +
              esc(item.name) +
              '<span class="eth-rarity-badge eth-rarity-' + item.rarity + '" style="font-size:9px;padding:2px 6px">' + item.rarity + '</span>' +
            '</div>' +
            '<div style="font-size:11.5px;color:#94a3b8">' + esc(item.desc || '') + '</div>' +
          '</div>' +
        '</div>';
      });

      html += '</div></div>' +
        '<div style="margin-bottom:16px">' +
          '<label style="display:block;font-size:12.5px;font-weight:800;color:#94a3b8;margin-bottom:6px">2. NARX (ETHITH COIN):</label>' +
          '<input id="inputP2pPrice" type="number" min="50" max="100000" value="500" style="width:100%;box-sizing:border-box;padding:11px 14px;border-radius:12px;background:#030712;border:1.5px solid #374151;color:#fde047;font-size:16px;font-weight:900;font-family:monospace;outline:none;" />' +
        '</div>' +
        '<div style="margin-bottom:20px">' +
          '<label style="display:flex;align-items:center;gap:10px;font-size:13px;font-weight:800;color:#cbd5e1;cursor:pointer">' +
            '<input id="chkAllowBarter" type="checkbox" checked style="width:18px;height:18px;accent-color:#8b5cf6;" />' +
            '<span>🔄 Boshqa buyumga almashishga (Barter) ruxsat berish</span>' +
          '</label>' +
        '</div>' +
        '<button type="button" id="btnConfirmPostP2P" style="width:100%;padding:13px;background:linear-gradient(135deg, #10b981, #059669);border:none;border-radius:14px;color:#fff;font-weight:900;font-size:15px;cursor:pointer;box-shadow:0 6px 16px rgba(16,185,129,0.35)">' +
          '🏷️ Sotuvga Chiqarish' +
        '</button>';
    }

    html += '</div>';
    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
    var closeBtn = overlay.querySelector('#btnClosePostModal');
    if (closeBtn) closeBtn.onclick = function() { overlay.remove(); };
    var emptyCancel = overlay.querySelector('#btnCancelEmptyPost');
    if (emptyCancel) emptyCancel.onclick = function() { overlay.remove(); };

    var selectedIdx = 0;
    overlay.querySelectorAll('.eth-p2p-select-item').forEach(function(row) {
      row.onclick = function() {
        selectedIdx = Number(row.dataset.itemIdx);
        overlay.querySelectorAll('.eth-p2p-select-item').forEach(function(r) {
          r.style.background = '#0f172a';
          r.style.borderColor = '#374151';
        });
        row.style.background = 'rgba(245,158,11,0.18)';
        row.style.borderColor = '#f59e0b';
      };
    });

    var confirmBtn = overlay.querySelector('#btnConfirmPostP2P');
    if (confirmBtn) {
      confirmBtn.onclick = function() {
        var priceInput = overlay.querySelector('#inputP2pPrice');
        var priceVal = Math.max(10, Number(priceInput.value) || 100);
        var allowBarter = Boolean(overlay.querySelector('#chkAllowBarter').checked);
        var chosenItem = myItems[selectedIdx];
        if (!chosenItem) return;

        if (chosenItem.type === 'gift') {
          if (Array.isArray(S.user.gifts)) S.user.gifts.splice(chosenItem.index, 1);
        } else if (chosenItem.type === 'emoji') {
          var eIdx = (S.user.unlockedEmojis || []).indexOf(chosenItem.emojiChar);
          if (eIdx > -1) S.user.unlockedEmojis.splice(eIdx, 1);
        } else if (chosenItem.type === 'avatar') {
          var aIdx = (S.user.unlockedAvatars || []).indexOf(chosenItem.avatarId);
          if (aIdx > -1) S.user.unlockedAvatars.splice(aIdx, 1);
        }

        var newListing = {
          id: 'p2p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          sellerId: S.user.id || S.user.email,
          sellerName: S.user.name,
          sellerEmail: S.user.email,
          sellerAvatar: S.user.avatar,
          sellerNameStyle: S.user.nameStyle,
          sellerTitle: S.user.title,
          item: chosenItem,
          price: priceVal,
          allowBarter: allowBarter,
          createdAt: Date.now()
        };

        if (!Array.isArray(S.p2pListings)) S.p2pListings = [];
        S.p2pListings.unshift(newListing);

        App.saveState();
        if (window.EthithSync && window.EthithSync.publishLive) {
          window.EthithSync.publishLive({
            type: 'P2P_LIST_ITEM',
            listing: newListing
          });
          if (window.EthithSync.pushRemoteStore) window.EthithSync.pushRemoteStore();
        }

        overlay.remove();
        alert('🎉 "' + chosenItem.name + '" muvaffaqiyatli auksionga qo\'yildi!');
        if (onPosted) onPosted();
      };
    }
  }

  // ====================================================
  // MODAL: BARTER TRADE OFFER
  // ====================================================
  function showBarterOfferModal(targetListing, onDone) {
    var overlay = document.createElement('div');
    overlay.className = 'eth-gift-modal-overlay';

    var myItems = [];
    (S.user.gifts || []).forEach(function(g, idx) {
      myItems.push({ type: 'gift', index: idx, id: 'gift_' + idx, name: g.name || 'Sovrin', icon: g.icon || '🎁', rarity: g.rarity || 'Rare', desc: g.desc });
    });
    var defaultEmojis = window.ETHITH_DEFAULT_FREE_EMOJIS || ['👍', '😊', '❤️'];
    (S.user.unlockedEmojis || []).forEach(function(em) {
      if (defaultEmojis.indexOf(em) === -1) {
        var cat = (window.ETHITH_CHAT_EMOJIS || []).find(function(e) { return e.emoji === em; });
        myItems.push({ type: 'emoji', emojiChar: em, id: 'emoji_' + em, name: em + ' ' + (cat ? cat.name : 'Emoji'), icon: em, rarity: cat ? cat.rarity : 'Rare', desc: 'Chat Emojisi' });
      }
    });

    var html = '<div class="eth-gift-modal-box">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.12);padding-bottom:14px;margin-bottom:18px">' +
        '<div style="display:flex;align-items:center;gap:10px">' +
          '<span style="font-size:24px;">🔄</span>' +
          '<h3 style="font-size:18px;font-weight:900;color:#ffffff;margin:0;">Buyum Almashish (Barter)</h3>' +
        '</div>' +
        '<button type="button" id="btnCloseBarterModal" style="background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer;font-weight:700">✕</button>' +
      '</div>';

    if (myItems.length === 0) {
      html += '<div style="text-align:center;padding:30px 10px;color:#cbd5e1">' +
        '<p style="font-size:15px;margin-bottom:16px">Sizda almashish uchun ortiqcha sovrin yoki emoji yo\'q.</p>' +
        '<button type="button" class="eth-p2p-buy-btn" id="btnCancelBarter">Orqaga</button>' +
      '</div>';
    } else {
      html += '<p style="font-size:13.5px;color:#cbd5e1;margin-bottom:14px"><b>' + esc(targetListing.sellerName) + '</b>ning <b>"' + esc(targetListing.item.name) + '"</b> buyumiga qaysi buyumingizni taklif qilasiz?</p>' +
        '<div id="barterItemsList" style="display:flex;flex-direction:column;gap:8px;max-height:220px;overflow-y:auto;padding-right:4px;margin-bottom:20px">';

      myItems.forEach(function(item, idx) {
        html += '<div class="eth-barter-opt ' + (idx === 0 ? 'selected' : '') + '" data-item-idx="' + idx + '" style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:12px;background:' + (idx === 0 ? 'rgba(139,92,246,0.22)' : '#0f172a') + ';border:1.5px solid ' + (idx === 0 ? '#8b5cf6' : '#374151') + ';cursor:pointer;transition:all 0.2s ease">' +
          '<span style="font-size:24px">' + item.icon + '</span>' +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-size:13.5px;font-weight:900;color:#fff;display:flex;align-items:center;gap:6px">' +
              esc(item.name) +
              '<span class="eth-rarity-badge eth-rarity-' + item.rarity + '" style="font-size:9px;padding:2px 6px">' + item.rarity + '</span>' +
            '</div>' +
            '<div style="font-size:11.5px;color:#94a3b8">' + esc(item.desc || '') + '</div>' +
          '</div>' +
        '</div>';
      });

      html += '</div>' +
        '<button type="button" id="btnConfirmBarter" style="width:100%;padding:13px;background:linear-gradient(135deg, #8b5cf6, #7c3aed);border:none;border-radius:14px;color:#fff;font-weight:900;font-size:15px;cursor:pointer;box-shadow:0 6px 16px rgba(139,92,246,0.35)">' +
          '🔄 Barterni Tasdiqlash' +
        '</button>';
    }

    html += '</div>';
    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
    var closeBtn = overlay.querySelector('#btnCloseBarterModal');
    if (closeBtn) closeBtn.onclick = function() { overlay.remove(); };
    var cancelBtn = overlay.querySelector('#btnCancelBarter');
    if (cancelBtn) cancelBtn.onclick = function() { overlay.remove(); };

    var selectedIdx = 0;
    overlay.querySelectorAll('.eth-barter-opt').forEach(function(row) {
      row.onclick = function() {
        selectedIdx = Number(row.dataset.itemIdx);
        overlay.querySelectorAll('.eth-barter-opt').forEach(function(r) {
          r.style.background = '#0f172a';
          r.style.borderColor = '#374151';
        });
        row.style.background = 'rgba(139,92,246,0.22)';
        row.style.borderColor = '#8b5cf6';
      };
    });

    var confirmBtn = overlay.querySelector('#btnConfirmBarter');
    if (confirmBtn) {
      confirmBtn.onclick = function() {
        var myOffer = myItems[selectedIdx];
        if (!myOffer) return;

        if (myOffer.type === 'gift') {
          if (Array.isArray(S.user.gifts)) S.user.gifts.splice(myOffer.index, 1);
        } else if (myOffer.type === 'emoji') {
          var eIdx = (S.user.unlockedEmojis || []).indexOf(myOffer.emojiChar);
          if (eIdx > -1) S.user.unlockedEmojis.splice(eIdx, 1);
        }

        var received = targetListing.item;
        if (received.type === 'gift') {
          if (!Array.isArray(S.user.gifts)) S.user.gifts = [];
          S.user.gifts.unshift(received);
        } else if (received.type === 'emoji') {
          if (!Array.isArray(S.user.unlockedEmojis)) S.user.unlockedEmojis = [];
          if (S.user.unlockedEmojis.indexOf(received.emojiChar) === -1) S.user.unlockedEmojis.push(received.emojiChar);
        } else if (received.type === 'avatar') {
          if (!Array.isArray(S.user.unlockedAvatars)) S.user.unlockedAvatars = [];
          if (S.user.unlockedAvatars.indexOf(received.avatarId) === -1) S.user.unlockedAvatars.push(received.avatarId);
        }

        S.p2pListings = (S.p2pListings || []).filter(function(l) { return l.id !== targetListing.id; });

        if (Array.isArray(S.accounts)) {
          var sellerAcc = S.accounts.find(function(a) {
            return (a.email && targetListing.sellerEmail && a.email.toLowerCase() === targetListing.sellerEmail.toLowerCase()) ||
                   (a.name && targetListing.sellerName && a.name.toLowerCase() === targetListing.sellerName.toLowerCase());
          });
          if (sellerAcc) {
            if (!Array.isArray(sellerAcc.gifts)) sellerAcc.gifts = [];
            sellerAcc.gifts.unshift(myOffer);
          }
        }

        App.saveState();
        if (window.EthithSync && window.EthithSync.publishLive) {
          window.EthithSync.publishLive({
            type: 'P2P_BARTER_SWAP',
            listingId: targetListing.id,
            sellerId: targetListing.sellerId,
            sellerEmail: targetListing.sellerEmail,
            sellerName: targetListing.sellerName,
            buyerId: S.user.id || S.user.email,
            buyerName: S.user.name,
            offeredItem: myOffer
          });
          if (window.EthithSync.pushRemoteStore) window.EthithSync.pushRemoteStore();
        }

        playPackMagicSound('connect');
        overlay.remove();
        alert('🎉 Muvaffaqiyatli Barter! Siz "' + received.name + '" buyumini qabul qilib oldingiz.');
        if (onDone) onDone();
      };
    }
  }

  // 3. MLBB STYLE 5-BOX DRAW & CONNECT PACK OPENING MODAL
  // ====================================================
  function playPackMagicSound(type) {
    try {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!window._ethithAudioCtx) {
        window._ethithAudioCtx = new AudioCtx();
      }
      var ctx = window._ethithAudioCtx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      var now = ctx.currentTime;

      if (type === 'connect') {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'triangle';
        var freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        var f = freqs[Math.floor(Math.random() * freqs.length)];
        osc.frequency.setValueAtTime(f, now);
        osc.frequency.exponentialRampToValueAtTime(f * 1.4, now + 0.25);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'blast') {
        var osc1 = ctx.createOscillator();
        var gain1 = ctx.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(160, now);
        osc1.frequency.exponentialRampToValueAtTime(920, now + 0.5);
        gain1.gain.setValueAtTime(0.3, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.55);

        var osc2 = ctx.createOscillator();
        var gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(180, now + 0.45);
        osc2.frequency.exponentialRampToValueAtTime(45, now + 0.9);
        gain2.gain.setValueAtTime(0.45, now + 0.45);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.45);
        osc2.stop(now + 0.9);
      } else if (type === 'reveal') {
        [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach(function(fq, i) {
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(fq, now + i * 0.07);
          gain.gain.setValueAtTime(0.22, now + i * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.7);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.07);
          osc.stop(now + i * 0.07 + 0.7);
        });
      }
    } catch(e) {}
  }

  function showMLBBPackOpeningModal(pack, onDone) {
    var overlay = document.createElement('div');
    overlay.className = 'eth-pack-modal-overlay animate-fade-in';

    // 5 coordinates arranged in a stylish arc/pentagon
    var boxPositions = [
      { x: 131, y: 15 },   // Top Center
      { x: 236, y: 95 },   // Top Right
      { x: 196, y: 225 },  // Bottom Right
      { x: 66,  y: 225 },  // Bottom Left
      { x: 26,  y: 95 }    // Top Left
    ];

    var connectedBoxes = [];
    var isFusing = false;

    var arenaHtml = '' +
      '<div class="eth-pack-arena" id="ethPackArena">' +
      '  <div class="eth-pack-arena-title">✨ ' + esc(pack.name.toUpperCase()) + ' ✨</div>' +
      '  <div class="eth-pack-arena-hint" id="ethPackArenaHint">Qutini ochish uchun 5 ta sehrli nuqtani ketma-ket bosing yoki birlashtiring (<b id="ethBoxCount">0</b>/5)</div>' +
      '  <div class="eth-boxes-container" id="ethBoxesContainer">' +
      '    <svg id="ethLaserSvg" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1"></svg>' +
           boxPositions.map(function(pos, i) {
             return '<div class="eth-mystery-box" data-idx="' + i + '" style="left:' + pos.x + 'px;top:' + pos.y + 'px;">' + (i + 1) + '</div>';
           }).join('') +
      '  </div>' +
      '  <div style="margin-top:24px;display:flex;gap:12px">' +
      '    <button type="button" id="ethAutoConnectBtn" style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:#fff;padding:8px 18px;border-radius:20px;font-size:13px;font-weight:700;cursor:pointer">⚡ Tezkor Ulash (Hammasi)</button>' +
      '    <button type="button" id="ethCancelPackBtn" style="background:transparent;border:none;color:#94a3b8;font-size:13px;cursor:pointer">Bekor qilish</button>' +
      '  </div>' +
      '</div>';

    overlay.innerHTML = arenaHtml;
    document.body.appendChild(overlay);

    var laserSvg = overlay.querySelector('#ethLaserSvg');
    var countEl = overlay.querySelector('#ethBoxCount');
    var hintEl = overlay.querySelector('#ethPackArenaHint');
    var containerEl = overlay.querySelector('#ethBoxesContainer');

    function drawLaserLine(x1, y1, x2, y2) {
      var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('stroke', '#fde047');
      line.setAttribute('stroke-width', '4');
      line.setAttribute('stroke-linecap', 'round');
      line.setAttribute('filter', 'drop-shadow(0 0 8px #f59e0b)');
      laserSvg.appendChild(line);
    }

    function connectBox(idx) {
      if (isFusing || connectedBoxes.indexOf(idx) !== -1) return;

      connectedBoxes.push(idx);
      var boxEl = overlay.querySelector('.eth-mystery-box[data-idx="' + idx + '"]');
      if (boxEl) {
        boxEl.classList.add('is-connected');
        boxEl.innerHTML = '⚡';
      }

      playPackMagicSound('connect');

      if (connectedBoxes.length > 1) {
        var prevIdx = connectedBoxes[connectedBoxes.length - 2];
        var p1 = boxPositions[prevIdx];
        var p2 = boxPositions[idx];
        drawLaserLine(p1.x + 29, p1.y + 29, p2.x + 29, p2.y + 29);
      }

      if (countEl) countEl.textContent = connectedBoxes.length;

      // When all 5 connected -> FUSE & BLAST!
      if (connectedBoxes.length >= 5) {
        // Connect last to first
        var pLast = boxPositions[connectedBoxes[4]];
        var pFirst = boxPositions[connectedBoxes[0]];
        drawLaserLine(pLast.x + 29, pLast.y + 29, pFirst.x + 29, pFirst.y + 29);
        triggerFusionAndReveal();
      }
    }

    overlay.querySelectorAll('.eth-mystery-box').forEach(function(box) {
      box.onclick = function() {
        var idx = Number(box.dataset.idx);
        connectBox(idx);
      };
    });

    var autoBtn = overlay.querySelector('#ethAutoConnectBtn');
    if (autoBtn) {
      autoBtn.onclick = function() {
        [0, 1, 2, 3, 4].forEach(function(i, seq) {
          setTimeout(function() { connectBox(i); }, seq * 120);
        });
      };
    }

    var cancelBtn = overlay.querySelector('#ethCancelPackBtn');
    if (cancelBtn) {
      cancelBtn.onclick = function() {
        overlay.remove();
      };
    }

    function triggerFusionAndReveal() {
      if (isFusing) return;
      isFusing = true;

      if (autoBtn) autoBtn.style.display = 'none';
      if (cancelBtn) cancelBtn.style.display = 'none';
      if (hintEl) hintEl.innerHTML = '<span style="color:#fde047;font-weight:900">⚡ ENERGIYA BIRLASHMOQDA... ⚡</span>';

      // Deduct coins & record daily
      if (pack.isFreeDaily) {
        S.user.lastDailyPackAt = Date.now();
      } else {
        S.user.coins = Math.max(0, (S.user.coins || 0) - pack.price);
      }
      App.saveState();
      if (window._ethithUpdateTopCoins) window._ethithUpdateTopCoins();

      // Magical fusion audio
      playPackMagicSound('blast');

      // Fuse boxes
      containerEl.classList.add('fusing');

      setTimeout(function() {
        // Blast Supernova!
        var blast = document.createElement('div');
        blast.className = 'eth-supernova-blast';
        containerEl.appendChild(blast);

        // Run RNG drop
        var wonItem = window.ETHITH_OPEN_PACK(pack.id, S.user);

        // Process reward
        if (wonItem.type === 'coins') {
          S.user.coins = (S.user.coins || 0) + wonItem.amount;
        } else if (wonItem.type === 'prize') {
          if (!S.user.gifts) S.user.gifts = [];
          S.user.gifts.unshift(wonItem.item || { name: wonItem.name, desc: wonItem.desc, icon: wonItem.icon, rarity: wonItem.rarity, price: wonItem.coinPrice || 100 });
        } else if (wonItem.type === 'emoji') {
          if (!S.user.unlockedEmojis) S.user.unlockedEmojis = (window.ETHITH_DEFAULT_FREE_EMOJIS || []).slice();
          if (S.user.unlockedEmojis.indexOf(wonItem.emoji) === -1) {
            S.user.unlockedEmojis.push(wonItem.emoji);
          }
        } else if (wonItem.type === 'avatar') {
          if (!S.user.unlockedAvatars) S.user.unlockedAvatars = [];
          if (S.user.unlockedAvatars.indexOf(wonItem.avatar.id) === -1) {
            S.user.unlockedAvatars.push(wonItem.avatar.id);
          }
          if (!S.user.avatar) {
            S.user.avatar = wonItem.avatar.id;
          }
        }

        App.saveState();
        if (window._ethithUpdateTopCoins) window._ethithUpdateTopCoins();

        // Broadcast user state in real time via MQTT & Remote Store
        if (window.EthithSync && window.EthithSync.broadcastUserState) {
          window.EthithSync.broadcastUserState();
        } else if (window.EthithSync && window.EthithSync.publishLive && S.user) {
          window.EthithSync.publishLive({
            type: 'USER_STATE_SYNC',
            user: {
              id: S.user.id,
              name: S.user.name,
              email: S.user.email,
              role: S.user.role,
              coins: S.user.coins,
              avatar: S.user.avatar,
              level: S.level || S.user.level,
              dailyMinutes: S.user.dailyMinutes
            }
          });
        }

        setTimeout(function() {
          renderRevealScreen(wonItem);
        }, 600);
      }, 700);
    }

    function renderRevealScreen(won) {
      if (typeof playPackRevealSound === 'function') {
        playPackRevealSound(won.rarity);
      } else {
        playPackMagicSound('reveal');
      }

      var arena = overlay.querySelector('#ethPackArena');
      var isUltra = (won.rarity === 'Legendary' || won.rarity === 'Mythic');
      
      // Screen tremor & fire embers on Legendary / Mythic
      if (isUltra && arena) {
        arena.classList.add('eth-legendary-shake');
        for (var e = 0; e < 24; e++) {
          var ember = document.createElement('div');
          ember.className = 'eth-fire-ember';
          var size = Math.floor(Math.random() * 8) + 4;
          ember.style.width = size + 'px';
          ember.style.height = size + 'px';
          ember.style.left = (Math.random() * 90 + 5) + '%';
          ember.style.top = (Math.random() * 40 + 50) + '%';
          ember.style.setProperty('--ember-dx', ((Math.random() - 0.5) * 80) + 'px');
          ember.style.animationDelay = (Math.random() * 0.8) + 's';
          overlay.appendChild(ember);
        }
      }

      var cardGraphic = '';
      if (won.type === 'coins') {
        cardGraphic = '' +
          '<div class="eth-coin-reveal-stage">' +
          '  <div class="eth-two-sided-coin-wrapper">' +
          '    <div class="eth-coin-face-card">' +
          '      <div class="eth-yellow-coin-3d side-square">' +
          '        <div class="eth-coin-inner-square"></div>' +
          '      </div>' +
          '      <span class="lbl">1-Tomoni (To\'rtburchak)</span>' +
          '    </div>' +
          '    <div style="font-size:22px;color:#f59e0b;font-weight:900">⇄</div>' +
          '    <div class="eth-coin-face-card">' +
          '      <div class="eth-yellow-coin-3d side-e">' +
          '        <div class="eth-coin-inner-e">E</div>' +
          '      </div>' +
          '      <span class="lbl">2-Tomoni (Katta E)</span>' +
          '    </div>' +
          '  </div>' +
          '  <div class="eth-gold-pile-container">' +
          '    <div class="eth-gold-pile-sparkles"></div>' +
          '    <svg class="eth-gold-pile-svg" viewBox="0 0 160 80">' +
          '      <ellipse cx="80" cy="65" rx="65" ry="12" fill="#78350f" opacity="0.5"/>' +
          '      <ellipse cx="38" cy="60" rx="20" ry="7" fill="#b45309"/><ellipse cx="38" cy="57" rx="20" ry="7" fill="#f59e0b"/><ellipse cx="38" cy="55" rx="18" ry="6" fill="#fbbf24"/>' +
          '      <ellipse cx="80" cy="62" rx="22" ry="7" fill="#b45309"/><ellipse cx="80" cy="59" rx="22" ry="7" fill="#f59e0b"/><ellipse cx="80" cy="57" rx="20" ry="6" fill="#fde047"/>' +
          '      <ellipse cx="122" cy="60" rx="20" ry="7" fill="#b45309"/><ellipse cx="122" cy="57" rx="20" ry="7" fill="#f59e0b"/><ellipse cx="122" cy="55" rx="18" ry="6" fill="#fbbf24"/>' +
          '      <ellipse cx="58" cy="48" rx="20" ry="7" fill="#92400e"/><ellipse cx="58" cy="45" rx="20" ry="7" fill="#d97706"/><ellipse cx="58" cy="43" rx="18" ry="6" fill="#fbbf24"/>' +
          '      <ellipse cx="102" cy="48" rx="20" ry="7" fill="#92400e"/><ellipse cx="102" cy="45" rx="20" ry="7" fill="#d97706"/><ellipse cx="102" cy="43" rx="18" ry="6" fill="#fbbf24"/>' +
          '      <ellipse cx="80" cy="34" rx="20" ry="7" fill="#78350f"/><ellipse cx="80" cy="31" rx="20" ry="7" fill="#f59e0b"/><ellipse cx="80" cy="29" rx="18" ry="6" fill="#fef08a"/>' +
          '      <polygon points="80,14 82,21 89,23 82,25 80,32 78,25 71,23 78,21" fill="#ffffff" filter="drop-shadow(0 0 4px #fbbf24)"/>' +
          '      <polygon points="40,36 41,41 46,42 41,43 40,48 39,43 34,42 39,41" fill="#fef08a"/>' +
          '      <polygon points="120,38 121,43 126,44 121,45 120,50 119,45 114,44 119,43" fill="#fef08a"/>' +
          '    </svg>' +
          '    <div class="eth-gold-pile-badge">' +
          '      <span>✨ OLTIN XAZINA UYUMI ✨</span>' +
          '    </div>' +
          '  </div>' +
          '</div>';
      } else if (won.type === 'avatar' && won.avatar) {
        cardGraphic = '<div style="width:110px;height:110px;margin:0 auto 16px;border-radius:50%;overflow:hidden;border:3px solid #fde047;box-shadow:0 0 25px rgba(245,158,11,0.6)">' + won.avatar.svg + '</div>';
      } else if (won.type === 'emoji') {
        cardGraphic = '<div style="font-size:72px;margin:10px auto 16px;filter:drop-shadow(0 0 16px rgba(255,255,255,0.6))">' + won.emoji + '</div>';
      } else {
        cardGraphic = '<div style="font-size:68px;margin:10px auto 16px;filter:drop-shadow(0 0 16px rgba(245,158,11,0.6))">' + won.icon + '</div>';
      }

      var rarityCls = (won.rarity || 'common').toLowerCase();
      var revealHtml = '' +
        '<div class="eth-revealed-card eth-card-rarity-' + rarityCls + ' eth-reveal-' + rarityCls + '">' +
        '  <div class="eth-rarity-badge eth-rarity-' + won.rarity + '">' + won.rarity + '</div>' +
           cardGraphic +
        '  <div style="font-weight:900;font-size:20px;color:#fde047;margin-bottom:8px">' + esc(won.name) + '</div>' +
        '  <div style="font-size:13px;color:#cbd5e1;line-height:1.5;margin-bottom:20px">' + esc(won.desc) + '</div>' +
        '  <button type="button" id="ethClaimRewardBtn" style="width:100%;padding:12px;background:linear-gradient(135deg, #f59e0b, #d97706);border:none;border-radius:14px;color:#fff;font-weight:900;font-size:15px;cursor:pointer;box-shadow:0 6px 16px rgba(245,158,11,0.4)">' +
        '    🎉 QABUL QILISH' +
        '  </button>' +
        '</div>';

      if (arena) arena.innerHTML = revealHtml;

      var claimBtn = overlay.querySelector('#ethClaimRewardBtn');
      if (claimBtn) {
        claimBtn.onclick = function() {
          overlay.remove();
          if (onDone) onDone();
        };
      }
    }
  }


  // ====================================================
  // 4. USER PROFILE & AVATAR MANAGER VIEW
  // ====================================================
  function renderProfileView(container) {
    if (!container) return;

    var user = S.user || { name: 'Guest', email: '', role: 'student', coins: 0, dailyMinutes: 0 };
    var isTeacher = user.role === 'teacher';

    // Calculate Leaderboard Rank
    var regUsers = [];
    try { regUsers = JSON.parse(localStorage.getItem('ethith_all_registered_users') || '[]'); } catch(e) {}
    var allAccounts = (S.accounts || []).concat(regUsers);
    var studentMap = {};
    allAccounts.forEach(function(u) {
      if (!u || u.role === 'teacher') return;
      var key = ((u.email && u.email.trim().toLowerCase()) || (u.id || u.name || '').toLowerCase()).trim();
      if (!studentMap[key]) studentMap[key] = { coins: Number(u.coins || 0) };
      else studentMap[key].coins = Math.max(studentMap[key].coins, Number(u.coins || 0));
    });
    if (user.role !== 'teacher') {
      var myKey = ((user.email && user.email.trim().toLowerCase()) || (user.id || user.name || '').toLowerCase()).trim();
      studentMap[myKey] = { coins: Number(user.coins || 0) };
    }
    var sorted = Object.values(studentMap).sort(function(a, b) { return b.coins - a.coins; });
    var myRank = sorted.findIndex(function(s) { return s.coins <= (user.coins || 0); }) + 1;
    if (myRank <= 0) myRank = 1;

    var unlockedAvatars = user.unlockedAvatars || [];
    var unlockedEmojis = user.unlockedEmojis || window.ETHITH_DEFAULT_FREE_EMOJIS || ['👍', '😊', '❤️'];
    var gifts = user.gifts || [];

    var html = '<div class="eth-profile-screen animate-fade-in">';

    // Hero Section with Styled Name
    var userStyledNameHtml = window.ETHITH_RENDER_USER_NAME_HTML ? window.ETHITH_RENDER_USER_NAME_HTML(user) : ('<span style="font-size:24px;font-weight:900">' + esc(user.name) + '</span>');

    html += '<div class="eth-profile-hero">' +
      '<div class="eth-profile-avatar-wrap">' +
        window.ETHITH_RENDER_USER_AVATAR(user, 90, '', 'border-width:3px') +
        (!isTeacher ? '<button type="button" class="eth-profile-change-av-btn" id="btnChangeAvatar" title="Rasmni o\'zgartirish">✏️</button>' : '') +
      '</div>' +
      '<div style="flex:1;min-width:0">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap">' +
          '<h1 style="font-size:24px;font-weight:900;color:var(--text);margin:0;display:inline-flex;align-items:center;gap:6px">' + userStyledNameHtml + '</h1>' +
          '<span style="padding:3px 10px;border-radius:12px;font-size:12px;font-weight:800;background:var(--soft);color:var(--pri)">' + (isTeacher ? 'O\'qituvchi (Master)' : user.level || S.level || 'A1') + '</span>' +
        '</div>' +
        '<div style="font-size:13.5px;color:var(--muted);margin-bottom:12px">📧 ' + esc(user.email || 'Email kiritilmagan') + '</div>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
          (!isTeacher ? '<button type="button" class="ap-btn pri" id="btnEditProfileInfo" style="padding:6px 14px;font-size:13px;display:inline-flex;align-items:center;gap:6px">' + ic('edit') + ' Profilni Tahrirlash</button>' : '') +
          (!isTeacher ? '<button type="button" class="ap-btn gh" id="btnProfileOpenMarket" style="padding:6px 14px;font-size:13px">' + ic('sparkles') + ' Marketga o\'tish (Pack ochish)</button>' : '') +
          '<button type="button" class="ap-btn gh" id="btnProfileLogout" style="padding:6px 14px;font-size:13px;color:#dc2626">' + ic('lock') + ' Tizimdan chiqish (Log out)</button>' +
        '</div>' +
      '</div>' +
    '</div>';

    // Stats Grid
    if (!isTeacher) {
      html += '<div class="eth-profile-stats-grid">' +
        '<div class="eth-pstat-card">' +
          '<div style="font-size:32px">' + window.ETHITH_COIN_SVG(36) + '</div>' +
          '<div>' +
            '<div class="eth-pstat-val" style="color:#d97706">' + (user.coins || 0).toLocaleString() + '</div>' +
            '<div class="eth-pstat-lbl">Jami ETHITH Coinlar</div>' +
          '</div>' +
        '</div>' +
        '<div class="eth-pstat-card">' +
          '<div style="font-size:32px">👑</div>' +
          '<div>' +
            '<div class="eth-pstat-val" style="color:#f59e0b">#' + myRank + '</div>' +
            '<div class="eth-pstat-lbl">Leaderboard O\'rni</div>' +
          '</div>' +
        '</div>' +
        '<div class="eth-pstat-card">' +
          '<div style="font-size:32px">⏱️</div>' +
          '<div>' +
            '<div class="eth-pstat-val">' + (user.dailyMinutes || 0) + ' min</div>' +
            '<div class="eth-pstat-lbl">Foydalanilgan Muddat</div>' +
          '</div>' +
        '</div>' +
        '<div class="eth-pstat-card">' +
          '<div style="font-size:32px">🎁</div>' +
          '<div>' +
            '<div class="eth-pstat-val">' + gifts.length + ' ta</div>' +
            '<div class="eth-pstat-lbl">Yutilgan Sovrinlar</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }

    // VIP STATUS SHOWCASE SECTION (Active Glowing Names, Titles, and Victory Sounds with Countdown)
    if (!isTeacher) {
      var activeCosmetics = user.activeCosmetics || {};
      var activeItemsList = Object.values(activeCosmetics);

      html += '<div style="background:var(--card);border:1px solid var(--line);border-radius:20px;padding:24px;margin-bottom:24px">';
      html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px">' +
        '<h3 style="font-size:18px;font-weight:900;color:#fde047;margin:0;display:flex;align-items:center;gap:8px">✨ Mening VIP Statusim & Litsenziyalarim</h3>' +
        '<button type="button" class="ap-btn pri" id="btnManageVIPInMarket" style="padding:5px 12px;font-size:12px">Pardozlarni Yangilash</button>' +
      '</div>';

      if (activeItemsList.length === 0 && !user.nameStyle && !user.title) {
        html += '<p style="font-size:13.5px;color:var(--muted);margin:0">Sizda hali faol VIP pardoz yoki maxsus unvon litsenziyasi yo\'q. Marketdagi <b>👑 VIP Pardozlar</b> bo\'limidan yonuvchi ism, unvon yoki g\'alaba ovozlarini sotib olishingiz mumkin!</p>';
      } else {
        html += '<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(240px, 1fr));gap:14px">';
        
        // Active Name Style
        if (user.nameStyle) {
          var nsStatus = getCosmeticStatus(user, user.nameStyle);
          html += '<div style="padding:14px;background:var(--soft);border:1px solid rgba(245,158,11,0.3);border-radius:14px">' +
            '<div style="font-size:11px;font-weight:800;color:#f59e0b;margin-bottom:6px">YONUVCHI ISM EFFEKTI:</div>' +
            '<div style="font-size:16px;font-weight:900;margin-bottom:8px" class="name-fx-' + user.nameStyle + '">' + esc(user.name) + '</div>' +
            '<span class="eth-vip-timer-badge ' + (nsStatus.expired ? 'expired' : '') + '">' + nsStatus.label + '</span>' +
          '</div>';
        }

        // Active Title
        if (user.title) {
          var tId = user.titleId || user.title;
          var tStatus = getCosmeticStatus(user, tId);
          html += '<div style="padding:14px;background:var(--soft);border:1px solid rgba(59,130,246,0.3);border-radius:14px">' +
            '<div style="font-size:11px;font-weight:800;color:#60a5fa;margin-bottom:6px">MAQSUS VIP UNVON:</div>' +
            '<div style="margin-bottom:8px"><span class="eth-user-title-badge" style="font-size:13px">' + esc(user.title) + '</span></div>' +
            '<span class="eth-vip-timer-badge ' + (tStatus.expired ? 'expired' : '') + '">' + tStatus.label + '</span>' +
          '</div>';
        }

        // Active Victory Sound
        var vsId = user.victorySound || 'applause_stadium_4s';
        var vsStatus = getCosmeticStatus(user, vsId);
        var vsObj = (window.ETHITH_COSMETICS && window.ETHITH_COSMETICS.victorySounds || []).find(function(s) { return s.id === vsId; });
        html += '<div style="padding:14px;background:var(--soft);border:1px solid rgba(168,85,247,0.3);border-radius:14px">' +
          '<div style="font-size:11px;font-weight:800;color:#c084fc;margin-bottom:6px">QUIZ G\'ALABA OVOZI:</div>' +
          '<div style="font-size:14px;font-weight:900;color:var(--text);margin-bottom:8px">' + (vsObj ? vsObj.name : 'Stadion Qarsaklari') + '</div>' +
          '<div style="display:flex;align-items:center;gap:8px">' +
            '<button type="button" class="eth-sound-preview-btn" style="padding:3px 10px;font-size:11px" id="btnPlayMyVictorySound">▶ Tinglash</button>' +
            '<span class="eth-vip-timer-badge ' + (vsStatus.expired ? 'expired' : '') + '">' + vsStatus.label + '</span>' +
          '</div>' +
        '</div>';

        html += '</div>';
      }
      html += '</div>';
    }

    // Showcase Tabs: Avatars, Emojis, Gifts
    if (!isTeacher) {
      html += '<div style="background:var(--card);border:1px solid var(--line);border-radius:20px;padding:24px;margin-bottom:24px">';
      html += '<h3 style="font-size:18px;font-weight:900;color:var(--text);margin:0 0 16px;display:flex;align-items:center;gap:8px">🎭 Mening Ochilgan Avatarlarim (' + unlockedAvatars.length + ')</h3>';

      if (unlockedAvatars.length === 0) {
        html += '<p style="font-size:13.5px;color:var(--muted)">Sizda hali ochilgan maxsus personaj rasmlari yo\'q. Marketdan <b>Boys Avatar Pack</b> yoki <b>Girls Avatar Pack</b> ochib ajoyib fantastik avatarlarni yutib oling!</p>';
      } else {
        html += '<div style="display:flex;gap:14px;flex-wrap:wrap">';
        unlockedAvatars.forEach(function(avId) {
          var avObj = (window.ETHITH_AVATARS || []).find(function(a) { return a.id === avId; });
          if (!avObj) return;
          var isCurrent = (user.avatar === avId) || (user.avatar && user.avatar.id === avId);

          html += '<div style="width:100px;text-align:center;padding:12px 8px;border-radius:16px;background:var(--soft);border:2px solid ' + (isCurrent ? '#f59e0b' : 'var(--line)') + ';position:relative">' +
            (isCurrent ? '<span style="position:absolute;top:4px;right:4px;font-size:11px">⭐</span>' : '') +
            '<div style="width:58px;height:58px;margin:0 auto 8px;border-radius:50%;overflow:hidden">' + avObj.svg + '</div>' +
            '<div style="font-size:11.5px;font-weight:800;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(avObj.name) + '</div>' +
            (isCurrent ? '<div style="font-size:10px;font-weight:800;color:#f59e0b;margin-top:4px">O\'RNATILGAN</div>' :
              '<button type="button" class="btnSetAvatar" data-av-id="' + avObj.id + '" style="margin-top:6px;padding:3px 8px;font-size:10.5px;font-weight:700;background:var(--pri);color:#fff;border:none;border-radius:6px;cursor:pointer">Tanlash</button>') +
          '</div>';
        });
        html += '</div>';
      }
      html += '</div>';

      // Emojis showcase
      html += '<div style="background:var(--card);border:1px solid var(--line);border-radius:20px;padding:24px;margin-bottom:24px">';
      html += '<h3 style="font-size:18px;font-weight:900;color:var(--text);margin:0 0 16px;display:flex;align-items:center;gap:8px">⚡ Mening Chat Emojilarim (' + unlockedEmojis.length + ')</h3>';
      html += '<div style="display:flex;gap:10px;flex-wrap:wrap">';
      (window.ETHITH_CHAT_EMOJIS || []).forEach(function(emItem) {
        var isUnlocked = emItem.isDefault || (unlockedEmojis.indexOf(emItem.emoji) !== -1);
        html += '<div style="padding:8px 12px;border-radius:12px;background:var(--soft);border:1px solid ' + (isUnlocked ? 'var(--line)' : 'rgba(239,68,68,0.25)') + ';display:inline-flex;align-items:center;gap:6px;opacity:' + (isUnlocked ? '1' : '0.45') + '">' +
          '<span style="font-size:20px">' + emItem.emoji + '</span>' +
          '<span style="font-size:12px;font-weight:700;color:var(--text)">' + esc(emItem.name) + '</span>' +
          (!isUnlocked ? '<span style="font-size:10px">🔒</span>' : '') +
        '</div>';
      });
      html += '</div>';
      html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;

    // Attach Handlers
    window._ethithRefreshProfile = function() {
      if (window._ethithCurrentView === 'profile') {
        renderProfileView(container);
      }
    };

    var editProfBtn = container.querySelector('#btnEditProfileInfo');
    if (editProfBtn) {
      editProfBtn.onclick = function() {
        showEditProfileModal(container);
      };
    }

    var changeAvBtn = container.querySelector('#btnChangeAvatar');
    if (changeAvBtn) {
      changeAvBtn.onclick = function() {
        showEditProfileModal(container);
      };
    }

    var marketBtn = container.querySelector('#btnProfileOpenMarket');
    if (marketBtn) {
      marketBtn.onclick = function() {
        if (window.go) window.go('market');
      };
    }

    var manageVipBtn = container.querySelector('#btnManageVIPInMarket');
    if (manageVipBtn) {
      manageVipBtn.onclick = function() {
        _activeMarketTab = 'cosmetics';
        if (window.go) window.go('market');
      };
    }

    var mySoundBtn = container.querySelector('#btnPlayMyVictorySound');
    if (mySoundBtn) {
      mySoundBtn.onclick = function() {
        if (window.playVictoryFanfare) window.playVictoryFanfare(user.victorySound || 'applause_stadium_4s');
      };
    }

    var logoutBtn = container.querySelector('#btnProfileLogout');
    if (logoutBtn) {
      logoutBtn.onclick = function() {
        if (confirm("Rostdan ham tizimdan chiqishni xohlaysizmi?")) {
          S.user = null;
          App.saveState();
          document.documentElement.classList.remove('eth-logged-in');
          var ap = document.getElementById('app');
          if (ap) ap.style.display = 'none';
          var landing = document.getElementById('landing');
          if (landing) landing.style.display = '';
          if (App.showAuthModal) App.showAuthModal();
        }
      };
    }

    container.querySelectorAll('.btnSetAvatar').forEach(function(btn) {
      btn.onclick = function() {
        var targetId = btn.dataset.avId;
        S.user.avatar = targetId;
        App.saveState();
        if (window.EthithSync && window.EthithSync.publishLive) {
          window.EthithSync.publishLive({
            type: 'USER_STATE_SYNC',
            user: S.user,
            updatedAt: Date.now()
          });
        }
        if (window.EthithSync && window.EthithSync.pushRemoteStore) {
          window.EthithSync.pushRemoteStore();
        }
        if (window._ethithRefreshTopNav) window._ethithRefreshTopNav();
        renderProfileView(container);
      };
    });
  }

  // ====================================================
  // 5. AVATAR PICKER MODAL (ONLY UNLOCKED AVATARS)
  // ====================================================
  function showAvatarPickerModal(onDone) {
    var overlay = document.createElement('div');
    overlay.className = 'eth-pack-modal-overlay animate-fade-in';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.78);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:999999;padding:16px;';

    var unlocked = (S.user && S.user.unlockedAvatars) || [];

    var html = '' +
      '<div style="background:#0f172a;border:1.5px solid #3b82f6;border-radius:24px;padding:26px;max-width:540px;width:100%;color:#ffffff;box-shadow:0 25px 60px rgba(0,0,0,0.85);max-height:90vh;overflow-y:auto">' +
      '  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">' +
      '    <h3 style="margin:0;font-size:20px;font-weight:900;color:#ffffff;display:flex;align-items:center;gap:8px">🎭 Profil Rasmini Tanlash</h3>' +
      '    <button type="button" id="btnCloseAvPicker" style="background:none;border:none;font-size:26px;color:#94a3b8;cursor:pointer;line-height:1">&times;</button>' +
      '  </div>' +
      '  <p style="font-size:13.5px;color:#cbd5e1;margin-bottom:18px;line-height:1.5">Faqat Marketdan yutib olingan fantastik va kinomatografik personaj rasmlarini o\'rnatish mumkin (ixtiyoriy rasm yuklash taqiqlangan):</p>' +
      '  <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(90px, 1fr));gap:12px;max-height:300px;overflow-y:auto;padding:8px;background:#09101d;border-radius:14px;border:1px solid #334155;margin-bottom:20px">' +
      '    <div class="avChoiceCard" data-av-none="1" style="text-align:center;padding:12px 6px;border-radius:14px;background:#1e293b;border:2px solid ' + (!S.user.avatar ? '#f59e0b' : 'transparent') + ';cursor:pointer">' +
      '      <div style="width:48px;height:48px;margin:0 auto 6px;border-radius:50%;background:#2563eb;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:20px">' + (S.user.name ? S.user.name.charAt(0).toUpperCase() : 'U') + '</div>' +
      '      <div style="font-size:11.5px;font-weight:800;color:#f1f5f9">Bosh harf</div>' +
      '    </div>';

    unlocked.forEach(function(avId) {
      var avObj = (window.ETHITH_AVATARS || []).find(function(a) { return a.id === avId; });
      if (!avObj) return;
      var isCur = (S.user.avatar === avId) || (S.user.avatar && S.user.avatar.id === avId);

      html += '<div class="avChoiceCard" data-av-id="' + avObj.id + '" style="text-align:center;padding:12px 6px;border-radius:14px;background:#1e293b;border:2px solid ' + (isCur ? '#f59e0b' : 'transparent') + ';cursor:pointer">' +
        '<div style="width:48px;height:48px;margin:0 auto 6px;border-radius:50%;overflow:hidden">' + avObj.svg + '</div>' +
        '<div style="font-size:11.5px;font-weight:800;color:#f1f5f9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(avObj.name) + '</div>' +
      '</div>';
    });

    html += '  </div>' +
      '  <div style="display:flex;justify-content:flex-end;gap:10px">' +
      '    <button type="button" id="btnGoMarketFromAv" style="padding:10px 16px;background:#1e293b;color:#38bdf8;border:1px solid #334155;border-radius:12px;font-size:13px;font-weight:800;cursor:pointer">🎁 Yangi Avatar Olish (Market)</button>' +
      '    <button type="button" id="btnDoneAvPicker" style="padding:10px 20px;background:#3b82f6;color:#fff;border:none;border-radius:12px;font-size:13.5px;font-weight:900;cursor:pointer">Yopish</button>' +
      '  </div>' +
      '</div>';

    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    overlay.querySelectorAll('.avChoiceCard').forEach(function(card) {
      card.onclick = function() {
        var chosenAv = card.dataset.avNone ? null : card.dataset.avId;
        S.user.avatar = chosenAv;

        if (!Array.isArray(S.accounts)) S.accounts = [];
        var acc = S.accounts.find(function(a) {
          return a && ((S.user.email && a.email && a.email.toLowerCase().trim() === S.user.email.toLowerCase().trim()) || (a.id && a.id === S.user.id));
        });
        if (acc) {
          acc.avatar = chosenAv;
          acc.updatedAt = Date.now();
        }

        var regKey = 'ethith_all_registered_users';
        var regList = [];
        try { regList = JSON.parse(localStorage.getItem(regKey) || '[]'); } catch(e) {}
        var rIdx = regList.findIndex(function(a) {
          return a && a.email && S.user.email && a.email.toLowerCase().trim() === S.user.email.toLowerCase().trim();
        });
        if (rIdx > -1) {
          regList[rIdx].avatar = chosenAv;
          localStorage.setItem(regKey, JSON.stringify(regList));
        }

        (S.classes || []).forEach(function(c) {
          if (Array.isArray(c.students)) {
            c.students.forEach(function(st) {
              if (st && st.email && S.user.email && st.email.toLowerCase().trim() === S.user.email.toLowerCase().trim()) {
                st.avatar = chosenAv;
              }
            });
          }
        });

        App.saveState();

        if (window.EthithSync && window.EthithSync.publishLive) {
          window.EthithSync.publishLive({
            type: 'USER_STATE_SYNC',
            user: S.user,
            updatedAt: Date.now()
          });
        }
        if (window.EthithSync && window.EthithSync.pushRemoteStore) {
          window.EthithSync.pushRemoteStore();
        }
        if (window._ethithRefreshTopNav) window._ethithRefreshTopNav();
        overlay.remove();
        if (onDone) onDone();
      };
    });

    overlay.querySelector('#btnCloseAvPicker').onclick = function() { overlay.remove(); };
    overlay.querySelector('#btnDoneAvPicker').onclick = function() { overlay.remove(); };
    var marketBtn = overlay.querySelector('#btnGoMarketFromAv');
    if (marketBtn) {
      marketBtn.onclick = function() {
        overlay.remove();
        if (window.go) window.go('market');
      };
    }
  }

  // ====================================================
  // 5B. EDIT PROFILE & ACCOUNT MODAL (NAME, GMAIL, AVATAR)
  // ====================================================
  function showEditProfileModal(container) {
    var user = S.user;
    if (!user) return;
    var overlay = document.createElement('div');
    overlay.className = 'eth-pack-modal-overlay animate-fade-in';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.78);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:999999;padding:16px;';

    var unlocked = user.unlockedAvatars || [];
    var currentAvatarId = (user.avatar && user.avatar.id) ? user.avatar.id : (user.avatar || null);
    var selectedAvatar = currentAvatarId;

    var html = '' +
      '<div style="background:#0f172a;border:1.5px solid #3b82f6;border-radius:24px;padding:26px;max-width:540px;width:100%;color:#ffffff;box-shadow:0 25px 60px rgba(0,0,0,0.85);max-height:90vh;overflow-y:auto;position:relative">' +
      '  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">' +
      '    <h3 style="margin:0;font-size:20px;font-weight:900;color:#ffffff;display:flex;align-items:center;gap:8px">✏️ Akkaunt va Profilni Tahrirlash</h3>' +
      '    <button type="button" id="btnCloseEditProfile" style="background:none;border:none;font-size:26px;color:#94a3b8;cursor:pointer;line-height:1">&times;</button>' +
      '  </div>' +
      '  <p style="font-size:13.5px;color:#cbd5e1;margin-bottom:18px;line-height:1.5">Ismingiz, emailingiz va profilingiz avatarini o\'zgartirishingiz mumkin. O\'zgarishlar darhol barcha qurilmalarga uzatiladi:</p>' +
      '  <div style="display:flex;flex-direction:column;gap:14px;margin-bottom:18px">' +
      '    <div>' +
      '      <label style="display:block;font-size:13px;font-weight:800;color:#f1f5f9;margin-bottom:6px">👤 Ismingiz (To\'liq ism yoki taxallus):</label>' +
      '      <input type="text" id="inpEditName" value="' + esc(user.name || '') + '" style="width:100%;padding:11px 14px;background:#1e293b;border:1.5px solid #475569;border-radius:12px;color:#ffffff !important;font-size:14.5px;font-weight:700;box-sizing:border-box" placeholder="Ismingizni kiriting">' +
      '    </div>' +
      '    <div>' +
      '      <label style="display:block;font-size:13px;font-weight:800;color:#f1f5f9;margin-bottom:6px">📧 Gmail Pochta Manzilingiz (Akkaunt ID):</label>' +
      '      <input type="email" id="inpEditEmail" value="' + esc(user.email || '') + '" style="width:100%;padding:11px 14px;background:#1e293b;border:1.5px solid #475569;border-radius:12px;color:#ffffff !important;font-size:14.5px;font-weight:700;box-sizing:border-box" placeholder="misol@gmail.com">' +
      '      <small style="color:#fbbf24;font-size:12px;font-weight:600;margin-top:5px;display:block">⚠️ Gmail orqali boshqa qurilmalarda akkauntingizga kirishingiz va coinlarni qabul qilishingiz mumkin.</small>' +
      '    </div>' +
      '  </div>' +
      '  <div style="margin-bottom:20px">' +
      '    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
      '      <label style="font-size:13px;font-weight:800;color:#f1f5f9">🎭 Profil Rasmi (Avatar):</label>' +
      '      <button type="button" id="btnGoMarketFromEdit" style="background:none;border:none;color:#38bdf8;font-size:12px;font-weight:800;cursor:pointer">🎁 Yangi avatar olish (Market) ↗</button>' +
      '    </div>' +
      '    <div id="editAvatarListGrid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(88px, 1fr));gap:10px;max-height:190px;overflow-y:auto;padding:8px;background:#09101d;border-radius:14px;border:1px solid #334155">' +
      '      <div class="avChoiceCardEdit" data-av-id="" style="text-align:center;padding:10px 4px;border-radius:12px;background:#1e293b;border:2px solid ' + (!selectedAvatar ? '#f59e0b' : 'transparent') + ';cursor:pointer">' +
      '        <div style="width:44px;height:44px;margin:0 auto 6px;border-radius:50%;background:#2563eb;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:18px" id="avEditInitialLetter">' + (user.name ? user.name.charAt(0).toUpperCase() : 'U') + '</div>' +
      '        <div style="font-size:11.5px;font-weight:800;color:#f1f5f9">Bosh harf</div>' +
      '      </div>';

    unlocked.forEach(function(avId) {
      var avObj = (window.ETHITH_AVATARS || []).find(function(a) { return a.id === avId; });
      if (!avObj) return;
      var isCur = (selectedAvatar === avObj.id);
      html += '<div class="avChoiceCardEdit" data-av-id="' + avObj.id + '" style="text-align:center;padding:10px 4px;border-radius:12px;background:#1e293b;border:2px solid ' + (isCur ? '#f59e0b' : 'transparent') + ';cursor:pointer">' +
        '<div style="width:44px;height:44px;margin:0 auto 6px;border-radius:50%;overflow:hidden">' + avObj.svg + '</div>' +
        '<div style="font-size:11.5px;font-weight:800;color:#f1f5f9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(avObj.name) + '</div>' +
      '</div>';
    });

    html += '    </div>' +
      '  </div>' +
      '  <div id="editProfileMsg" style="font-size:13px;margin-bottom:14px;padding:8px 12px;border-radius:10px;display:none;font-weight:700"></div>' +
      '  <div style="display:flex;justify-content:flex-end;gap:10px">' +
      '    <button type="button" id="btnCancelEditProfile" style="padding:10px 18px;background:#334155;color:#f1f5f9 !important;border:1px solid #475569;border-radius:12px;font-size:13.5px;font-weight:800;cursor:pointer">Bekor qilish</button>' +
      '    <button type="button" id="btnSaveEditProfile" style="padding:10px 22px;background:linear-gradient(135deg,#3b82f6,#2563eb);color:#ffffff !important;border:none;border-radius:12px;font-size:14px;font-weight:900;cursor:pointer;box-shadow:0 4px 14px rgba(37,99,235,0.4)">💾 Saqlash va Yangilash</button>' +
      '  </div>' +
      '</div>';

    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    var inpName = overlay.querySelector('#inpEditName');
    var inpEmail = overlay.querySelector('#inpEditEmail');
    var letterEl = overlay.querySelector('#avEditInitialLetter');
    if (inpName && letterEl) {
      inpName.addEventListener('input', function() {
        var v = inpName.value.trim();
        letterEl.textContent = v ? v.charAt(0).toUpperCase() : 'U';
      });
    }

    overlay.querySelectorAll('.avChoiceCardEdit').forEach(function(card) {
      card.onclick = function() {
        selectedAvatar = card.dataset.avId || null;
        overlay.querySelectorAll('.avChoiceCardEdit').forEach(function(c) {
          c.style.borderColor = 'transparent';
        });
        card.style.borderColor = '#f59e0b';
      };
    });

    overlay.querySelector('#btnCloseEditProfile').onclick = function() { overlay.remove(); };
    overlay.querySelector('#btnCancelEditProfile').onclick = function() { overlay.remove(); };

    var marketLink = overlay.querySelector('#btnGoMarketFromEdit');
    if (marketLink) {
      marketLink.onclick = function() {
        overlay.remove();
        if (window.go) window.go('market');
      };
    }

    overlay.querySelector('#btnSaveEditProfile').onclick = function() {
      var msgEl = overlay.querySelector('#editProfileMsg');
      var newName = (inpName.value || '').trim();
      var newEmail = (inpEmail.value || '').trim().toLowerCase();

      if (!newName) {
        msgEl.style.display = 'block';
        msgEl.style.background = 'rgba(239,68,68,0.2)';
        msgEl.style.color = '#fca5a5';
        msgEl.textContent = "Iltimos, ismingizni kiriting!";
        return;
      }
      if (!newEmail || !newEmail.includes('@')) {
        msgEl.style.display = 'block';
        msgEl.style.background = 'rgba(239,68,68,0.2)';
        msgEl.style.color = '#fca5a5';
        msgEl.textContent = "Iltimos, to'g'ri Gmail manzilingizni kiriting!";
        return;
      }

      var oldEmail = (user.email || '').trim().toLowerCase();
      var oldName = (user.name || '').trim();

      if (newEmail !== oldEmail) {
        var existingOther = (S.accounts || []).find(function(a) {
          return a && a.email && a.email.toLowerCase().trim() === newEmail &&
                 a.id !== user.id && a.email.toLowerCase().trim() !== oldEmail;
        });
        if (existingOther) {
          msgEl.style.display = 'block';
          msgEl.style.background = 'rgba(239,68,68,0.2)';
          msgEl.style.color = '#fca5a5';
          msgEl.textContent = "Ushbu Gmail bilan boshqa akkaunt mavjud! Iltimos, o'zingizning emailingizni kiriting.";
          return;
        }
      }

      user.name = newName;
      user.email = newEmail;
      user.id = newEmail;
      user.avatar = selectedAvatar;
      user.updatedAt = Date.now();

      if (!Array.isArray(S.accounts)) S.accounts = [];
      var accIdx = S.accounts.findIndex(function(a) {
        if (!a) return false;
        var aEm = (a.email || '').toLowerCase().trim();
        var aNm = (a.name || '').toLowerCase().trim();
        return (oldEmail && aEm === oldEmail) ||
               (oldName && aNm === oldName.toLowerCase()) ||
               (a.id && a.id === user.id);
      });
      if (accIdx > -1) {
        S.accounts[accIdx].name = newName;
        S.accounts[accIdx].email = newEmail;
        S.accounts[accIdx].id = newEmail;
        S.accounts[accIdx].avatar = selectedAvatar;
        S.accounts[accIdx].coins = Number(user.coins || 0);
        S.accounts[accIdx].updatedAt = Date.now();
      } else {
        S.accounts.push(user);
      }

      var deduped = [];
      var seen = {};
      S.accounts.forEach(function(a) {
        if (!a || !a.email) return;
        var em = a.email.toLowerCase().trim();
        if (!seen[em]) {
          seen[em] = true;
          deduped.push(a);
        }
      });
      S.accounts = deduped;

      var regKey = 'ethith_all_registered_users';
      var regList = [];
      try { regList = JSON.parse(localStorage.getItem(regKey) || '[]'); } catch(e) {}
      var rIdx = regList.findIndex(function(a) {
        if (!a) return false;
        var aEm = (a.email || '').toLowerCase().trim();
        var aNm = (a.name || '').toLowerCase().trim();
        return (oldEmail && aEm === oldEmail) ||
               (oldName && aNm === oldName.toLowerCase());
      });
      if (rIdx > -1) {
        regList[rIdx].name = newName;
        regList[rIdx].email = newEmail;
        regList[rIdx].id = newEmail;
        regList[rIdx].avatar = selectedAvatar;
        regList[rIdx].coins = Number(user.coins || 0);
      } else {
        regList.push(user);
      }
      localStorage.setItem(regKey, JSON.stringify(regList));

      (S.classes || []).forEach(function(c) {
        if (Array.isArray(c.students)) {
          c.students.forEach(function(st) {
            var sEm = (st.email || '').toLowerCase().trim();
            var sNm = (st.name || '').toLowerCase().trim();
            if ((oldEmail && sEm === oldEmail) || (oldName && sNm === oldName.toLowerCase())) {
              st.name = newName;
              st.email = newEmail;
              st.id = newEmail;
              st.avatar = selectedAvatar;
            }
          });
        }
      });

      App.saveState();

      if (window.EthithSync && window.EthithSync.publishLive) {
        window.EthithSync.publishLive({
          type: 'USER_STATE_SYNC',
          user: user,
          oldEmail: oldEmail,
          oldName: oldName,
          updatedAt: Date.now()
        });
      }

      if (window.EthithSync && window.EthithSync.pushRemoteStore) {
        window.EthithSync.pushRemoteStore();
      }

      if (window._ethithRefreshTopNav) window._ethithRefreshTopNav();
      if (window._ethithUpdateTopCoins) window._ethithUpdateTopCoins();
      if (window._ethithRefreshLeaderboard) window._ethithRefreshLeaderboard();
      if (window._ethithRefreshFriendsList) window._ethithRefreshFriendsList();
      if (container) renderProfileView(container);

      overlay.remove();

      var toast = document.createElement('div');
      toast.className = 'eth-toast-toast animate-slide-in';
      toast.style.cssText = 'position:fixed;top:24px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg, #10b981, #059669);color:#ffffff !important;padding:12px 24px;border-radius:14px;font-weight:900;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,0.5);z-index:999999;';
      toast.innerHTML = '✅ Profil ma\'lumotlaringiz muvaffaqiyatli saqlandi va barcha qurilmalarda yangilandi!';
      document.body.appendChild(toast);
      setTimeout(function() { toast.remove(); }, 4000);
    };
  }

  function showBuyCoinsModal() {
    var overlay = document.createElement('div');
    overlay.className = 'eth-pack-modal-overlay animate-fade-in';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.78);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:999999;padding:16px;';

    var myEmail = (S.user && S.user.email) ? S.user.email : 'Hisobga kirilmagan';
    var coinSvg = '<svg width="20" height="20" viewBox="0 0 24 24" style="vertical-align:middle;display:inline-block"><circle cx="12" cy="12" r="10" fill="#f59e0b"/><circle cx="12" cy="12" r="7.5" stroke="#fbbf24" stroke-width="1.5"/><text x="12" y="15.5" font-size="11" font-weight="900" fill="#78350f" text-anchor="middle">¢</text></svg>';
    var bigCoinSvg = '<svg width="28" height="28" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#f59e0b"/><circle cx="12" cy="12" r="7.5" stroke="#fbbf24" stroke-width="1.5"/><text x="12" y="15.5" font-size="11" font-weight="900" fill="#78350f" text-anchor="middle">¢</text></svg>';

    var html = '' +
      '<div style="background:#0f172a;border:1.5px solid #f59e0b;border-radius:24px;padding:28px 24px;max-width:520px;width:100%;color:#ffffff !important;box-shadow:0 25px 60px rgba(0,0,0,0.85);position:relative;animation:popIn 0.25s ease">' +
      '  <button type="button" id="btnCloseBuyCoinsModal" style="position:absolute;top:16px;right:18px;background:none;border:none;font-size:24px;color:#94a3b8;cursor:pointer;line-height:1">&times;</button>' +
      '  <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">' +
      '    <div style="width:48px;height:48px;border-radius:16px;background:linear-gradient(135deg,#f59e0b,#b45309);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 15px rgba(245,158,11,0.4)">' + bigCoinSvg + '</div>' +
      '    <div>' +
      '      <h3 style="margin:0;font-size:20px;font-weight:900;color:#fde047">Rasmiy ETHITH Coin Xaridi</h3>' +
      '      <span style="font-size:12px;color:#38bdf8;font-weight:800;display:inline-flex;align-items:center;gap:4px">🛡️ 100% Rasmiy & Xavfsiz Xizmat</span>' +
      '    </div>' +
      '  </div>' +
      '  <div style="background:linear-gradient(135deg,rgba(16,185,129,0.2),rgba(5,150,105,0.15));border:1.5px solid #10b981;border-radius:16px;padding:14px 16px;margin-bottom:16px">' +
      '    <div style="font-size:13.5px;font-weight:900;color:#34d399;margin-bottom:6px;display:flex;align-items:center;gap:6px">✅ 100% KAFOLAT:</div>' +
      '    <div style="font-size:13.5px;color:#ffffff !important;line-height:1.5;font-weight:700">' +
      '      Sizlar uchun faqat sifatli coin beramiz 100% kafolat bilan agar coin o\'tmasa pulingiz 100% qaytarib beriladi.' +
      '    </div>' +
      '  </div>' +
      '  <div style="background:#1e293b;border:1px solid #334155;border-radius:16px;padding:14px;margin-bottom:16px">' +
      '    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
      '      <span style="font-size:13px;font-weight:800;color:#cbd5e1 !important">Narxlar tarifi:</span>' +
      '      <span style="font-size:13px;font-weight:900;color:#f59e0b">' + coinSvg + ' 100 ta Coin = 2,000 so\'m</span>' +
      '    </div>' +
      '    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
      '      <div style="background:#0f172a;border:1px solid #334155;border-radius:10px;padding:10px;text-align:center">' +
      '        <div style="font-size:14px;font-weight:900;color:#fde047;display:flex;align-items:center;justify-content:center;gap:4px">' + coinSvg + ' 100 Coin</div>' +
      '        <div style="font-size:12px;font-weight:800;color:#22c55e">2,000 so\'m</div>' +
      '      </div>' +
      '      <div style="background:#0f172a;border:1px solid #334155;border-radius:10px;padding:10px;text-align:center">' +
      '        <div style="font-size:14px;font-weight:900;color:#fde047;display:flex;align-items:center;justify-content:center;gap:4px">' + coinSvg + ' 500 Coin</div>' +
      '        <div style="font-size:12px;font-weight:800;color:#22c55e">10,000 so\'m</div>' +
      '      </div>' +
      '      <div style="background:#0f172a;border:1px solid #334155;border-radius:10px;padding:10px;text-align:center">' +
      '        <div style="font-size:14px;font-weight:900;color:#fde047;display:flex;align-items:center;justify-content:center;gap:4px">' + coinSvg + ' 1,000 Coin</div>' +
      '        <div style="font-size:12px;font-weight:800;color:#22c55e">20,000 so\'m</div>' +
      '      </div>' +
      '      <div style="background:#0f172a;border:1.5px solid rgba(245,158,11,0.5);border-radius:10px;padding:10px;text-align:center;box-shadow:0 0 10px rgba(245,158,11,0.2)">' +
      '        <div style="font-size:14px;font-weight:900;color:#fde047;display:flex;align-items:center;justify-content:center;gap:4px">' + coinSvg + ' 5,000 Coin 🔥</div>' +
      '        <div style="font-size:12px;font-weight:800;color:#22c55e">100,000 so\'m</div>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '  <div style="background:rgba(239,68,68,0.15);border:1.5px solid rgba(239,68,68,0.4);border-radius:14px;padding:12px 14px;margin-bottom:16px">' +
      '    <div style="font-size:12.5px;font-weight:800;color:#fca5a5;line-height:1.4">' +
      '      ⚠️ DIQQAT: Faqatgina manashu Admindan coin olishingiz mumkin, boshqalarga ishonmang!' +
      '    </div>' +
      '    <div style="font-size:12.5px;color:#e2e8f0 !important;margin-top:6px;font-weight:700">' +
      '      Rasmiy Admin: <b style="color:#38bdf8;font-size:13px">@Mu_striker</b>' +
      '    </div>' +
      '  </div>' +
      '  <div style="font-size:12.5px;color:#cbd5e1 !important;margin-bottom:18px;text-align:center;line-height:1.5;font-weight:600">' +
      '    Sizning emailingiz: <b style="color:#fbbf24;font-size:13px;background:rgba(245,158,11,0.15);padding:2px 8px;border-radius:6px;border:1px solid rgba(245,158,11,0.3)">' + esc(myEmail) + '</b><br>' +
      '    Adminga ushbu emailingizni yozsangiz, bot orqali darhol hisobingizga coinlar o\'tkaziladi.' +
      '  </div>' +
      '  <a href="https://t.me/Mu_striker?text=' + encodeURIComponent("Assalomu alaykum, ETHITH Coin sotib olmoqchiman. Mening emailim: " + myEmail) + '" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:14px 20px;background:linear-gradient(135deg,#0284c7,#0369a1);color:#ffffff !important;border-radius:16px;font-size:15px;font-weight:900;text-decoration:none;box-shadow:0 10px 25px rgba(2,132,199,0.4);box-sizing:border-box;text-align:center">' +
      '    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.77-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>' +
      '    Coin olish uchun adminga murojaat qiling' +
      '  </a>' +
      '</div>';

    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    overlay.querySelector('#btnCloseBuyCoinsModal').onclick = function() { overlay.remove(); };
  }
  window.showBuyCoinsModal = showBuyCoinsModal;

  window.EthithViews = {
    renderLeaderboardView: renderLeaderboardView,
    renderMarketView: renderMarketView,
    showMLBBPackOpeningModal: showMLBBPackOpeningModal,
    renderProfileView: renderProfileView,
    showAvatarPickerModal: showAvatarPickerModal,
    showEditProfileModal: showEditProfileModal,
    showBuyCoinsModal: showBuyCoinsModal,
    showWaygroundStudioModal: showWaygroundStudioModal,
    renderQuizBattleView: renderQuizBattleView,
    showCreateQuizModal: showCreateQuizModal,
    startQuizBattleRunner: startQuizBattleRunner,
    showQuizAnalysisModal: showQuizAnalysisModal,
    showSendGiftModal: showSendGiftModal,
    renderAskAITeacher: renderAskAITeacher,
    renderLevelsView: renderLevelsView,
    renderClassesView: renderClassesView,
    renderExamsView: renderExamsView,
    renderPlacementView: renderPlacementView,
    renderProgressionTestsView: renderProgressionTestsView,
    showEditExamModal: showEditExamModal,
    renderMistakesNotebook: renderMistakesNotebook,
    renderIeltsHub: renderIeltsHub,
    showIeltsFullReviewModal: showIeltsFullReviewModal,
    showCreateLevelTransitionExamModal: showCreateLevelTransitionExamModal,
    showCreateExamModal: showCreateExamModal,
    showTeacherNotificationsModal: showTeacherNotificationsModal,
    showStudentNotificationsModal: showStudentNotificationsModal,
    formatAIMarkdown: formatAIMarkdown,
    formatMarkdown: formatAIMarkdown,
    startExamRunner: startExamRunner,
    runPlacementTest: runPlacementTest
  };

})(window);
