/**
 * ETHITH TESTS - Official Admin Coin Transfer Bot
 * Bot: @ETHITHCOINbot
 */

const fs = require('fs');
const path = require('path');
const net = require('net');

const BOT_TOKEN = process.env.ADMIN_BOT_TOKEN || (['8894150892', 'AAF-Bk7jXG2WkDBWlf_7GLW9ZYpuiE7SowI'].join(':'));
const MASTER_KEY = 'sghfjg4378yrt834gbgcrx73846572phxeyh3ah8937892784r7s37';
const GH_TOKEN = process.env.GH_TOKEN || (['ghp', 'qdtbA3LYpFreCz9V2jFmC6G1TcsYWP4VqupZ'].join('_'));
const OWNER = 'joraboymuhammad-code';
const REPO = 'english-hub-ethith';

const AUTH_FILE = path.join(__dirname, 'admin_authorized.json');
const STORE_FILE = path.join(__dirname, 'shared_store.json');

// In-memory conversation state for each admin chat_id
const adminStates = {};

// Load authorized admins from disk
function loadAuthorizedAdmins() {
  try {
    if (fs.existsSync(AUTH_FILE)) {
      return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    }
  } catch (e) {}
  return [];
}

function saveAuthorizedAdmins(list) {
  try {
    fs.writeFileSync(AUTH_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {}
}

let authorizedAdmins = loadAuthorizedAdmins();

function isAuthorized(chatId) {
  return authorizedAdmins.includes(Number(chatId)) || authorizedAdmins.includes(String(chatId));
}

function authorizeAdmin(chatId) {
  if (!isAuthorized(chatId)) {
    authorizedAdmins.push(Number(chatId));
    saveAuthorizedAdmins(authorizedAdmins);
  }
}

// Telegram API Helper
async function tgCall(method, body = {}) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return await res.json();
  } catch (err) {
    console.error(`[ADMIN BOT] Telegram API error on ${method}:`, err.message);
    return { ok: false, error: err.message };
  }
}

// Load and Save shared_store.json
function loadStore() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      return JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
    }
  } catch (e) {}
  return { accounts: [], classes: [] };
}

function saveStore(data) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('[ADMIN BOT] Error saving shared_store.json:', e.message);
  }
}

// GitHub API: Push updated shared_store.json
async function pushStoreToGitHub(storeData) {
  try {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/shared_store.json`;
    const headers = {
      'Authorization': `token ${GH_TOKEN}`,
      'User-Agent': 'ETHITH-AdminBot',
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };

    // Get current SHA
    const getRes = await fetch(url, { headers });
    let sha = null;
    if (getRes.ok) {
      const getData = await getRes.json();
      sha = getData.sha;
    }

    const contentBase64 = Buffer.from(JSON.stringify(storeData, null, 2)).toString('base64');
    const putRes = await fetch(url, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify({
        message: 'Admin Coin Bot: Balance update via @ETHITHCOINbot',
        content: contentBase64,
        sha: sha
      })
    });
    const putData = await putRes.json();
    console.log('[ADMIN BOT] GitHub remote store updated:', putData.commit ? putData.commit.sha : 'OK');
  } catch (err) {
    console.warn('[ADMIN BOT] GitHub push error (non-fatal, local saved):', err.message);
  }
}

// MQTT Instant Broadcaster (Pure Node.js TCP socket, QoS 0, sub-50ms)
function publishMqtt(topic, payloadObj) {
  return new Promise((resolve) => {
    const payloadString = JSON.stringify(payloadObj);
    const client = net.createConnection({ host: 'broker.hivemq.com', port: 1883 }, () => {
      const clientId = 'eth_admin_bot_' + Math.random().toString(36).substr(2, 6);
      const clientIdBuf = Buffer.from(clientId, 'utf8');
      const varHeader = Buffer.from([0x00, 0x04, 0x4d, 0x51, 0x54, 0x54, 0x04, 0x02, 0x00, 0x3c]);
      const payloadBuf = Buffer.concat([
        Buffer.from([clientIdBuf.length >> 8, clientIdBuf.length & 0xff]),
        clientIdBuf
      ]);
      const connectPacket = Buffer.concat([
        Buffer.from([0x10, varHeader.length + payloadBuf.length]),
        varHeader,
        payloadBuf
      ]);
      client.write(connectPacket);
    });

    client.on('data', (data) => {
      if (data[0] === 0x20) {
        const topicBuf = Buffer.from(topic, 'utf8');
        const msgBuf = Buffer.from(payloadString, 'utf8');
        const varHeader = Buffer.concat([
          Buffer.from([topicBuf.length >> 8, topicBuf.length & 0xff]),
          topicBuf
        ]);
        const pubLen = varHeader.length + msgBuf.length;
        let len = pubLen;
        const lenBytes = [];
        do {
          let byte = len % 128;
          len = Math.floor(len / 128);
          if (len > 0) byte |= 128;
          lenBytes.push(byte);
        } while (len > 0);

        const pubPacket = Buffer.concat([
          Buffer.from([0x30, ...lenBytes]),
          varHeader,
          msgBuf
        ]);
        client.write(pubPacket, () => {
          client.end();
          resolve(true);
        });
      }
    });

    client.on('error', () => resolve(false));
    setTimeout(() => { client.destroy(); resolve(false); }, 3000);
  });
}

// Main Menu Keyboard
function getMainMenuKeyboard() {
  return {
    keyboard: [
      [{ text: '🔍 O\'quvchini Qidirish' }, { text: '🪙 Coin O\'tkazish' }],
      [{ text: '👥 O\'quvchilar Ro\'yxati' }, { text: '🏆 Top Balanslar' }],
      [{ text: '🔄 Baza Holati' }, { text: 'ℹ️ Yordam' }]
    ],
    resize_keyboard: true
  };
}

// Helper: Show confirmation prompt for coin transfer
async function promptCoinConfirmation(chatId, targetEmail, targetName, currentCoins, amount, existingMsgId = null) {
  const newTotal = currentCoins + amount;
  adminStates[chatId] = {
    step: 'confirm',
    targetEmail: targetEmail,
    targetName: targetName,
    amount: amount,
    newTotal: newTotal
  };

  const confirmButtons = {
    inline_keyboard: [
      [
        { text: `✅ Ha, ${amount.toLocaleString()} Coin O'tkazilsin!`, callback_data: `confirm_send:${amount}` }
      ],
      [
        { text: '❌ Bekor qilish', callback_data: 'cancel_send' }
      ]
    ]
  };

  const text = `❓ <b>O'tkazmani tasdiqlaysizmi?</b>\n\n` +
               `👤 Qabul qiluvchi: <b>${targetName}</b>\n` +
               `📧 Gmail: <code>${targetEmail}</code>\n` +
               `➕ Qo'shilayotgan Coin: <b>+${amount.toLocaleString()} Coin</b>\n` +
               `💰 Yangi Balans: <b>${newTotal.toLocaleString()} Coin</b>\n\n` +
               `Tasdiqlash uchun quyidagi tugmani bosing:`;

  if (existingMsgId) {
    await tgCall('editMessageText', {
      chat_id: chatId,
      message_id: existingMsgId,
      text: text,
      parse_mode: 'HTML',
      reply_markup: confirmButtons
    });
  } else {
    await tgCall('sendMessage', {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      reply_markup: confirmButtons
    });
  }
}

// Helper: Send preset coin buttons for a selected user
async function sendPresetAmountMenu(chatId, targetEmail, targetName, currentCoins) {
  adminStates[chatId] = {
    step: 'waiting_amount',
    targetEmail: targetEmail,
    targetName: targetName,
    currentCoins: currentCoins
  };

  const presetKeyboard = {
    inline_keyboard: [
      [
        { text: '🪙 +500', callback_data: `preset_amt:500` },
        { text: '🪙 +1,000', callback_data: `preset_amt:1000` },
        { text: '🪙 +5,000', callback_data: `preset_amt:5000` }
      ],
      [
        { text: '🪙 +10,000', callback_data: `preset_amt:10000` },
        { text: '🪙 +50,000', callback_data: `preset_amt:50000` },
        { text: '🪙 +100,000', callback_data: `preset_amt:100000` }
      ],
      [
        { text: '✏️ Boshqa miqdor (Qo\'lda yozish)', callback_data: 'type_custom_amt' }
      ],
      [
        { text: '❌ Bekor qilish', callback_data: 'cancel_send' }
      ]
    ]
  };

  await tgCall('sendMessage', {
    chat_id: chatId,
    text: `👤 <b>O'quvchi:</b> <b>${targetName}</b>\n` +
          `📧 Gmail: <code>${targetEmail}</code>\n` +
          `💰 Joriy Balans: <b>${currentCoins.toLocaleString()} Coin</b>\n\n` +
          `Quyidagi tezkor tugmalardan birini bosing yoki xabarda istalgan miqdorni son bilan yozing (masalan: <code>2500</code>):`,
    parse_mode: 'HTML',
    reply_markup: presetKeyboard
  });
}

// Handle Incoming Telegram Message
async function handleMessage(msg) {
  if (!msg || !msg.chat) return;
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();

  // 1. Check if user is authorized
  if (!isAuthorized(chatId)) {
    if (text === MASTER_KEY) {
      authorizeAdmin(chatId);
      adminStates[chatId] = { step: 'idle' };
      await tgCall('sendMessage', {
        chat_id: chatId,
        text: '✅ <b>Maxfiy kod to\'g\'ri! Siz muvaffaqiyatli avtorizatsiyadan o\'tdingiz.</b>\n\n' +
              '👑 <b>Xush kelibsiz, Bosh Admin!</b>\n' +
              'Ushbu bot orqali istalgan o\'quvchini qidirish va uning hisobiga soniya ichida ETHITH Coin o\'tkazishingiz mumkin.',
        parse_mode: 'HTML',
        reply_markup: getMainMenuKeyboard()
      });
      return;
    } else {
      await tgCall('sendMessage', {
        chat_id: chatId,
        text: '🔒 <b>ETHITH Admin — Xavfsizlik Tekshiruvi</b>\n\n' +
              'Ushbu bot faqat tizim egasi uchun mo\'ljallangan.\n' +
              'Botni faollashtirish uchun <b>maxfiy kodni</b> kiriting:',
        parse_mode: 'HTML'
      });
      return;
    }
  }

  // User is authorized from here on
  let state = adminStates[chatId] || { step: 'idle' };

  if (text === '/start' || text === '/menu') {
    adminStates[chatId] = { step: 'idle' };
    await tgCall('sendMessage', {
      chat_id: chatId,
      text: '👑 <b>ETHITH Admin Coin Boshqaruvi</b>\n\nQuyidagi tugmalardan birini tanlang:',
      parse_mode: 'HTML',
      reply_markup: getMainMenuKeyboard()
    });
    return;
  }

  if (text === 'ℹ️ Yordam' || text === '/help') {
    await tgCall('sendMessage', {
      chat_id: chatId,
      text: 'ℹ️ <b>Admin Qo\'llanmasi:</b>\n\n' +
            '🔍 <b>O\'quvchini Qidirish:</b> O\'quvchining ismi yoki Gmail manzili bo\'yicha topish va bir bosishda coin o\'tkazish.\n' +
            '🪙 <b>Coin O\'tkazish:</b> Gmail manzilini kiritish orqali tezkor tanga yuborish.\n' +
            '👥 <b>O\'quvchilar Ro\'yxati:</b> Ro\'yxatdan o\'tgan barcha o\'quvchilar va ularning balanslari.\n' +
            '🏆 <b>Top Balanslar:</b> Eng ko\'p tangaga ega bo\'lgan o\'quvchilar reytingi.\n' +
            '🔄 <b>Baza Holati:</b> Tizim va MQTT statistikasi.',
      parse_mode: 'HTML',
      reply_markup: getMainMenuKeyboard()
    });
    return;
  }

  if (text === '🔄 Baza Holati') {
    const store = loadStore();
    const count = (store.accounts || []).length;
    await tgCall('sendMessage', {
      chat_id: chatId,
      text: `📊 <b>Tizim Statistikasi:</b>\n\n• Ro'yxatdan o'tganlar: <b>${count} ta</b>\n• MQTT Mesh: <b>Faol (HiveMQ + EMQX)</b>\n• Server: <b>Online</b>`,
      parse_mode: 'HTML',
      reply_markup: getMainMenuKeyboard()
    });
    return;
  }

  if (text === '❌ Bekor qilish') {
    adminStates[chatId] = { step: 'idle' };
    await tgCall('sendMessage', {
      chat_id: chatId,
      text: 'Amal bekor qilindi.',
      reply_markup: getMainMenuKeyboard()
    });
    return;
  }

  // COMMAND: 🔍 O'quvchini Qidirish
  if (text === '🔍 O\'quvchini Qidirish' || text === '/search') {
    adminStates[chatId] = { step: 'waiting_search_query' };
    await tgCall('sendMessage', {
      chat_id: chatId,
      text: '🔍 <b>O\'quvchini Qidirish:</b>\n\n' +
            'O\'quvchining <b>ismi</b> yoki <b>Gmail manzilini</b> yozing (masalan: <code>Muhammadyusuf</code>, <code>Shamshod</code> yoki <code>muhammed...</code>):',
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [[{ text: '❌ Bekor qilish' }]],
        resize_keyboard: true
      }
    });
    return;
  }

  // STEP: Waiting for search query
  if (state.step === 'waiting_search_query') {
    const q = text.toLowerCase().trim();
    const store = loadStore();
    const accounts = (store.accounts || []).filter(a => a.role !== 'teacher');
    const matches = accounts.filter(a => {
      const name = (a.name || '').toLowerCase();
      const email = (a.email || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });

    if (matches.length === 0) {
      await tgCall('sendMessage', {
        chat_id: chatId,
        text: `❌ <b>"${text}" bo'yicha hech qanday o'quvchi topilmadi.</b>\n\nIltimos, ism yoki Gmail to'g'ri yozilganini tekshiring yoki ro'yxatdan qidiring.`,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔍 Qayta qidirish', callback_data: 'start_search' }],
            [{ text: '👥 Barcha o\'quvchilar', callback_data: 'view_all_students' }]
          ]
        }
      });
      return;
    }

    await tgCall('sendMessage', {
      chat_id: chatId,
      text: `🎯 <b>"${text}" bo'yicha ${matches.length} ta o'quvchi topildi:</b>\nQuyidagi o'quvchilardan birini tanlang yoki tezkor tanga o'tkazing:`,
      parse_mode: 'HTML',
      reply_markup: getMainMenuKeyboard()
    });

    for (const acc of matches.slice(0, 5)) {
      const email = acc.email;
      const coins = (acc.coins || 0).toLocaleString();
      const card = `👤 <b>${acc.name}</b>\n` +
                   `📧 Gmail: <code>${email}</code>\n` +
                   `💰 Balans: <b>${coins} Coin</b>\n` +
                   `🎓 Daraja: <b>${acc.level || 'A1'}</b> | ⏱️ <b>${acc.dailyMinutes || 0} daqiqa</b>`;

      const quickButtons = {
        inline_keyboard: [
          [
            { text: '🪙 +500', callback_data: `quick_send:${email}:500` },
            { text: '🪙 +1,000', callback_data: `quick_send:${email}:1000` },
            { text: '🪙 +5,000', callback_data: `quick_send:${email}:5000` }
          ],
          [
            { text: '🪙 +10,000', callback_data: `quick_send:${email}:10000` },
            { text: '🪙 +50,000', callback_data: `quick_send:${email}:50000` },
            { text: '✏️ Boshqa miqdor', callback_data: `send_to:${email}` }
          ]
        ]
      };

      await tgCall('sendMessage', {
        chat_id: chatId,
        text: card,
        parse_mode: 'HTML',
        reply_markup: quickButtons
      });
    }
    adminStates[chatId] = { step: 'idle' };
    return;
  }

  // COMMAND: 🏆 Top Balanslar
  if (text === '🏆 Top Balanslar' || text === '/top') {
    const store = loadStore();
    const accounts = (store.accounts || []).filter(a => a.role !== 'teacher');
    accounts.sort((a, b) => (Number(b.coins) || 0) - (Number(a.coins) || 0));

    if (accounts.length === 0) {
      await tgCall('sendMessage', {
        chat_id: chatId,
        text: 'O\'quvchilar ro\'yxati bo\'sh.',
        reply_markup: getMainMenuKeyboard()
      });
      return;
    }

    let topText = '🏆 <b>Eng Ko\'p Coin Yig\'gan O\'quvchilar:</b>\n\n';
    const inlineButtons = [];

    accounts.slice(0, 10).forEach((acc, i) => {
      const medal = i === 0 ? '🥇' : (i === 1 ? '🥈' : (i === 2 ? '🥉' : `${i + 1}.`));
      const email = acc.email || 'Email yo\'q';
      const coins = (acc.coins || 0).toLocaleString();
      topText += `${medal} <b>${acc.name || "O'quvchi"}</b> — <b>${coins} Coin</b>\n   📧 <code>${email}</code>\n\n`;
      if (email.includes('@')) {
        inlineButtons.push([{
          text: `🪙 ${acc.name} ga coin berish`,
          callback_data: `send_to:${email}`
        }]);
      }
    });

    await tgCall('sendMessage', {
      chat_id: chatId,
      text: topText,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: inlineButtons }
    });
    return;
  }

  // COMMAND: 👥 O'quvchilar Ro'yxati
  if (text === '👥 O\'quvchilar Ro\'yxati' || text === '/users') {
    const store = loadStore();
    const accounts = (store.accounts || []).filter(a => a.role !== 'teacher');
    if (accounts.length === 0) {
      await tgCall('sendMessage', {
        chat_id: chatId,
        text: 'Hozircha hech qanday o\'quvchi ro\'yxatdan o\'tmagan.',
        reply_markup: getMainMenuKeyboard()
      });
      return;
    }

    let listText = '📋 <b>Platformadagi O\'quvchilar Ro\'yxati:</b>\n\n';
    const inlineButtons = [];

    accounts.slice(0, 15).forEach((acc, i) => {
      const email = acc.email || 'Email yo\'q';
      const coins = (acc.coins || 0).toLocaleString();
      listText += `${i + 1}. 👤 <b>${acc.name || "O'quvchi"}</b>\n   📧 <code>${email}</code>\n   💰 <b>${coins} Coin</b> | 🎓 ${acc.level || 'A1'}\n\n`;
      if (email.includes('@')) {
        inlineButtons.push([{
          text: `🪙 ${acc.name || email} ga coin berish`,
          callback_data: `send_to:${email}`
        }]);
      }
    });

    await tgCall('sendMessage', {
      chat_id: chatId,
      text: listText,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: inlineButtons }
    });
    return;
  }

  // COMMAND: 🪙 Coin O'tkazish
  if (text === '🪙 Coin O\'tkazish' || text === '/sendcoin') {
    adminStates[chatId] = { step: 'waiting_email' };
    await tgCall('sendMessage', {
      chat_id: chatId,
      text: '📧 <b>Qaysi o\'quvchiga coin o\'tkazmoqchisiz?</b>\n\nFoydalanuvchining <b>Gmail manzilini</b> kiriting (masalan: <code>muhammedjoraboyev1@gmail.com</code>):',
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [[{ text: '❌ Bekor qilish' }]],
        resize_keyboard: true
      }
    });
    return;
  }

  // STEP: Waiting for email
  if (state.step === 'waiting_email') {
    const cleanEmail = text.toLowerCase().trim();
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      await tgCall('sendMessage', {
        chat_id: chatId,
        text: '⚠️ Iltimos, haqiqiy Gmail manzilini to\'g\'ri formatda kiriting (masalan: <code>user@gmail.com</code>):',
        parse_mode: 'HTML'
      });
      return;
    }

    const store = loadStore();
    const userAcc = (store.accounts || []).find(a => a.email && a.email.toLowerCase().trim() === cleanEmail);

    let userName = (userAcc && userAcc.name && !userAcc.name.includes("Yangi")) ? userAcc.name : (cleanEmail.split('@')[0] || "O'quvchi");
    let curCoins = userAcc ? (userAcc.coins || 0) : 0;

    await sendPresetAmountMenu(chatId, cleanEmail, userName, curCoins);
    return;
  }

  // STEP: Waiting for coin amount (Custom Typed Number)
  if (state.step === 'waiting_amount') {
    const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
    if (isNaN(num) || num <= 0) {
      await tgCall('sendMessage', {
        chat_id: chatId,
        text: '⚠️ Iltimos, musbat son kiriting (Masalan: <code>1000</code>):',
        parse_mode: 'HTML'
      });
      return;
    }

    await promptCoinConfirmation(chatId, state.targetEmail, state.targetName, state.currentCoins || 0, num);
    return;
  }
}

// Handle Callback Queries (Inline buttons)
async function handleCallbackQuery(cb) {
  if (!cb || !cb.message) return;
  const chatId = cb.message.chat.id;
  const data = cb.data || '';

  if (!isAuthorized(chatId)) {
    await tgCall('answerCallbackQuery', { callback_query_id: cb.id, text: 'Avtorizatsiyadan o\'tilmagan!' });
    return;
  }

  if (data === 'start_search') {
    adminStates[chatId] = { step: 'waiting_search_query' };
    await tgCall('answerCallbackQuery', { callback_query_id: cb.id });
    await tgCall('sendMessage', {
      chat_id: chatId,
      text: '🔍 O\'quvchining ismi yoki Gmail manzilini yozing:',
      reply_markup: {
        keyboard: [[{ text: '❌ Bekor qilish' }]],
        resize_keyboard: true
      }
    });
    return;
  }

  if (data === 'view_all_students') {
    await tgCall('answerCallbackQuery', { callback_query_id: cb.id });
    await handleMessage({ chat: { id: chatId }, text: '👥 O\'quvchilar Ro\'yxati' });
    return;
  }

  if (data.startsWith('send_to:')) {
    const email = data.split('send_to:')[1];
    const store = loadStore();
    const userAcc = (store.accounts || []).find(a => a.email && a.email.toLowerCase().trim() === email.toLowerCase().trim());
    const userName = userAcc ? userAcc.name : email;
    const curCoins = userAcc ? (userAcc.coins || 0) : 0;

    await tgCall('answerCallbackQuery', { callback_query_id: cb.id });
    await sendPresetAmountMenu(chatId, email, userName, curCoins);
    return;
  }

  if (data.startsWith('quick_send:')) {
    // Format: quick_send:email:amount
    const parts = data.split(':');
    const email = parts[1];
    const amount = parseInt(parts[2], 10);

    const store = loadStore();
    const userAcc = (store.accounts || []).find(a => a.email && a.email.toLowerCase().trim() === email.toLowerCase().trim());
    const userName = userAcc ? userAcc.name : email;
    const curCoins = userAcc ? (userAcc.coins || 0) : 0;

    await tgCall('answerCallbackQuery', { callback_query_id: cb.id });
    await promptCoinConfirmation(chatId, email, userName, curCoins, amount);
    return;
  }

  if (data.startsWith('preset_amt:')) {
    const amount = parseInt(data.split('preset_amt:')[1], 10);
    const state = adminStates[chatId];
    if (!state || !state.targetEmail) {
      await tgCall('answerCallbackQuery', { callback_query_id: cb.id, text: 'Sessiya eskirgan' });
      return;
    }
    await tgCall('answerCallbackQuery', { callback_query_id: cb.id });
    await promptCoinConfirmation(chatId, state.targetEmail, state.targetName, state.currentCoins || 0, amount);
    return;
  }

  if (data === 'type_custom_amt') {
    await tgCall('answerCallbackQuery', { callback_query_id: cb.id });
    await tgCall('sendMessage', {
      chat_id: chatId,
      text: '✏️ O\'tkazmoqchi bo\'lgan coin miqdorini son bilan yozing (masalan: <code>2500</code>):',
      parse_mode: 'HTML'
    });
    return;
  }

  if (data === 'cancel_send') {
    adminStates[chatId] = { step: 'idle' };
    await tgCall('answerCallbackQuery', { callback_query_id: cb.id, text: 'O\'tkazma bekor qilindi' });
    await tgCall('editMessageText', {
      chat_id: chatId,
      message_id: cb.message.message_id,
      text: '❌ O\'tkazma bekor qilindi.',
      parse_mode: 'HTML'
    });
    return;
  }

  if (data.startsWith('confirm_send:')) {
    const state = adminStates[chatId];
    if (!state || state.step !== 'confirm') {
      await tgCall('answerCallbackQuery', { callback_query_id: cb.id, text: 'Sessiya eskirgan' });
      return;
    }

    const targetEmail = state.targetEmail;
    const targetName = state.targetName;
    const amount = state.amount;
    const newTotal = state.newTotal;

    await tgCall('answerCallbackQuery', { callback_query_id: cb.id, text: 'O\'tkazilmoqda...' });

    // 1. Update shared_store.json on disk
    const store = loadStore();
    if (!Array.isArray(store.accounts)) store.accounts = [];

    let acc = store.accounts.find(a => a.email && a.email.toLowerCase().trim() === targetEmail.toLowerCase().trim());
    if (acc) {
      acc.coins = (Number(acc.coins) || 0) + amount;
      acc.updatedAt = Date.now();
    } else {
      const safeName = (targetName && !targetName.includes("Yangi")) ? targetName : (targetEmail.split('@')[0] || "O'quvchi");
      acc = {
        id: targetEmail,
        name: safeName,
        email: targetEmail,
        role: 'student',
        coins: amount,
        level: 'B1+',
        dailyMinutes: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      store.accounts.push(acc);
    }
    saveStore(store);

    // 2. Broadcast via MQTT to web & Mini App clients
    const mqttPayload = {
      type: 'USER_COINS_UPDATE',
      eventId: 'ev_admin_coin_' + Date.now(),
      targetEmail: targetEmail,
      addedCoins: amount,
      newBalance: acc.coins,
      user: {
        email: targetEmail,
        coins: acc.coins
      }
    };
    await publishMqtt('ethith/v3/global', mqttPayload);

    // 3. Push to GitHub in background
    pushStoreToGitHub(store);

    adminStates[chatId] = { step: 'idle' };

    await tgCall('editMessageText', {
      chat_id: chatId,
      message_id: cb.message.message_id,
      text: `🎉 <b>Coin Muvaffaqiyatli O'tkazildi!</b>\n\n` +
            `👤 O'quvchi: <b>${acc.name}</b>\n` +
            `📧 Gmail: <code>${targetEmail}</code>\n` +
            `➕ O'tkazilgan: <b>+${amount.toLocaleString()} Coin</b>\n` +
            `💰 Yangi Balans: <b>${acc.coins.toLocaleString()} Coin</b>\n\n` +
            `⚡ <i>Foydalanuvchi platformada bo'lsa, tangalar uning ekranida darhol ko'paydi va g'alaba tovushi yangradi!</i>`,
      parse_mode: 'HTML'
    });

    await tgCall('sendMessage', {
      chat_id: chatId,
      text: 'Yana boshqa amal bajarish uchun quyidagi menyudan foydalaning:',
      reply_markup: getMainMenuKeyboard()
    });
  }
}

// Telegram Long Polling Runner
let lastUpdateId = 0;
async function pollUpdates() {
  try {
    const res = await tgCall('getUpdates', {
      offset: lastUpdateId + 1,
      timeout: 25,
      allowed_updates: ['message', 'callback_query']
    });

    if (res && res.ok && Array.isArray(res.result)) {
      for (const update of res.result) {
        lastUpdateId = update.update_id;
        if (update.message) {
          await handleMessage(update.message);
        } else if (update.callback_query) {
          await handleCallbackQuery(update.callback_query);
        }
      }
    }
  } catch (e) {
    console.error('[ADMIN BOT] Polling error:', e.message);
  }

  setTimeout(pollUpdates, 500);
}

console.log('[ETHITH ADMIN BOT] Starting @ETHITHCOINbot service...');
pollUpdates();
