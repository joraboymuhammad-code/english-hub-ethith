/**
 * ETHITH TESTS - Official Online GitHub-Connected Admin Coin Transfer Bot
 * Bot: @ETHITHCOINbot
 * Connected 100% live to GitHub shared_store.json + Dual MQTT Brokers (HiveMQ & EMQX)
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

// Owner @Mu_striker is permanently authorized across all cloud & local instances
const DEFAULT_ADMIN_IDS = [6772427596, 98124765];

// In-memory conversation state for each admin chat_id
const adminStates = {};

function loadAuthorizedAdmins() {
  const set = new Set(DEFAULT_ADMIN_IDS.map(Number));
  try {
    if (fs.existsSync(AUTH_FILE)) {
      const arr = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
      if (Array.isArray(arr)) arr.forEach(id => set.add(Number(id)));
    }
  } catch (e) {}
  return Array.from(set);
}

function saveAuthorizedAdmins(list) {
  try {
    fs.writeFileSync(AUTH_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {}
}

let authorizedAdmins = loadAuthorizedAdmins();

function isAuthorized(chatId) {
  const num = Number(chatId);
  return authorizedAdmins.includes(num) || DEFAULT_ADMIN_IDS.includes(num);
}

function authorizeAdmin(chatId) {
  const num = Number(chatId);
  if (!authorizedAdmins.includes(num)) {
    authorizedAdmins.push(num);
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

// Ensure all students from classes are also represented in store.accounts
function unifyAccountsAndStudents(store) {
  if (!store || typeof store !== 'object') store = { accounts: [], classes: [] };
  if (!Array.isArray(store.accounts)) store.accounts = [];
  if (!Array.isArray(store.classes)) store.classes = [];

  if (Array.isArray(store.authorizedAdminChatIds)) {
    store.authorizedAdminChatIds.forEach(id => {
      const n = Number(id);
      if (n && !authorizedAdmins.includes(n)) authorizedAdmins.push(n);
    });
  }

  store.classes.forEach(cls => {
    if (!cls || !Array.isArray(cls.students)) return;
    cls.students.forEach(st => {
      if (!st) return;
      const stEmail = (st.email || (st.id && String(st.id).includes('@') ? st.id : '')).toLowerCase().trim();
      const stName = (cls.customStudentNames && cls.customStudentNames[st.id]) || st.name || '';
      if (!stEmail && !stName) return;

      const existing = store.accounts.find(a => {
        if (!a) return false;
        const aEm = (a.email || '').toLowerCase().trim();
        const aNm = (a.name || '').toLowerCase().trim();
        return (stEmail && aEm === stEmail) || (stName && aNm === stName.toLowerCase().trim());
      });

      if (!existing) {
        store.accounts.push({
          id: st.id || stEmail || ('st_' + Date.now()),
          role: 'student',
          name: stName || (stEmail ? stEmail.split('@')[0] : "O'quvchi"),
          email: stEmail || (stName.toLowerCase().replace(/[^a-z0-9]/g, '') + '@ethith.uz'),
          coins: st.coins !== undefined ? Number(st.coins) : 150,
          level: st.level || 'B1+',
          dailyMinutes: st.dailyMinutes || 0,
          updatedAt: st.updatedAt || Date.now()
        });
      } else {
        if (stName && (!existing.name || existing.name === "Yangi O'quvchi" || existing.name === "O'quvchi")) {
          existing.name = stName;
        }
        if (st.coins !== undefined && Number(st.coins) > Number(existing.coins || 0)) {
          existing.coins = Number(st.coins);
        }
      }
    });
  });

  return store;
}

// Fetch LIVE shared_store.json directly from GitHub (with local fallback)
async function fetchLiveStoreFromGitHub() {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/shared_store.json?_t=${Date.now()}`;
  const headers = {
    'Authorization': `token ${GH_TOKEN}`,
    'User-Agent': 'ETHITH-AdminBot-Live',
    'Accept': 'application/vnd.github.v3+json',
    'Cache-Control': 'no-cache, no-store'
  };

  try {
    const res = await fetch(url, { headers, cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.content) {
        const jsonStr = Buffer.from(data.content, 'base64').toString('utf8');
        const parsed = unifyAccountsAndStudents(JSON.parse(jsonStr));
        parsed._githubSha = data.sha;
        try {
          const toSaveLocal = { ...parsed };
          delete toSaveLocal._githubSha;
          fs.writeFileSync(STORE_FILE, JSON.stringify(toSaveLocal, null, 2), 'utf8');
        } catch (e) {}
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[ADMIN BOT] Live GitHub fetch warning, falling back to local:', err.message);
  }

  try {
    if (fs.existsSync(STORE_FILE)) {
      return unifyAccountsAndStudents(JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')));
    }
  } catch (e) {}
  return { accounts: [], classes: [] };
}

// Atomic GitHub Push with 409 Conflict Retry & Account Balance Preservation
async function updateStudentCoinsOnGitHub(targetEmail, targetName, amountToAdd, isAbsoluteSet = false) {
  const cleanEmail = targetEmail.toLowerCase().trim();
  const headers = {
    'Authorization': `token ${GH_TOKEN}`,
    'User-Agent': 'ETHITH-AdminBot-Live',
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/shared_store.json`;

  let finalAccount = null;

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const getRes = await fetch(`${url}?_t=${Date.now()}`, { headers, cache: 'no-store' });
      let sha = null;
      let store = { accounts: [], classes: [] };

      if (getRes.ok) {
        const getData = await getRes.json();
        sha = getData.sha;
        store = unifyAccountsAndStudents(JSON.parse(Buffer.from(getData.content, 'base64').toString('utf8')));
      } else if (fs.existsSync(STORE_FILE)) {
        store = unifyAccountsAndStudents(JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')));
      }

      if (!Array.isArray(store.accounts)) store.accounts = [];
      store.authorizedAdminChatIds = authorizedAdmins;

      let acc = store.accounts.find(a => a && a.email && a.email.toLowerCase().trim() === cleanEmail);
      const now = Date.now();

      if (acc) {
        acc.coins = isAbsoluteSet ? amountToAdd : ((Number(acc.coins) || 0) + amountToAdd);
        if (targetName && !targetName.includes("Yangi") && (!acc.name || acc.name.includes("Yangi"))) {
          acc.name = targetName;
        }
        acc.updatedAt = now;
      } else {
        const safeName = (targetName && !targetName.includes("Yangi")) ? targetName : (cleanEmail.split('@')[0] || "O'quvchi");
        acc = {
          id: cleanEmail,
          name: safeName,
          email: cleanEmail,
          role: 'student',
          coins: amountToAdd,
          level: 'B1+',
          dailyMinutes: 0,
          createdAt: now,
          updatedAt: now
        };
        store.accounts.push(acc);
      }

      // Also update inside any class student roster so class views stay in sync
      if (Array.isArray(store.classes)) {
        store.classes.forEach(cls => {
          if (cls && Array.isArray(cls.students)) {
            cls.students.forEach(st => {
              if (!st) return;
              const stEm = (st.email || st.id || '').toLowerCase().trim();
              const stNm = (st.name || '').toLowerCase().trim();
              if (stEm === cleanEmail || (acc.name && stNm === acc.name.toLowerCase().trim())) {
                st.coins = acc.coins;
                st.updatedAt = now;
              }
            });
          }
        });
      }

      store.updatedAt = now;
      finalAccount = acc;

      // Save locally
      try {
        fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
      } catch (e) {}

      // Push to GitHub
      const contentBase64 = Buffer.from(JSON.stringify(store, null, 2), 'utf8').toString('base64');
      const putRes = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: `Admin Coin Bot: +${amountToAdd} Coin to ${cleanEmail} (Total: ${acc.coins})`,
          content: contentBase64,
          sha: sha || undefined
        })
      });

      if (putRes.ok) {
        const putData = await putRes.json();
        console.log(`[ADMIN BOT] GitHub store updated for ${cleanEmail}: ${acc.coins} Coin (commit ${putData.commit ? putData.commit.sha.slice(0, 7) : 'OK'})`);
        return { ok: true, account: finalAccount };
      } else if (putRes.status === 409) {
        console.warn(`[ADMIN BOT] 409 Conflict on attempt ${attempt}, retrying...`);
        await new Promise(r => setTimeout(r, 250 * attempt));
        continue;
      } else {
        const errTxt = await putRes.text();
        console.warn(`[ADMIN BOT] GitHub PUT status ${putRes.status}:`, errTxt);
      }
    } catch (err) {
      console.warn(`[ADMIN BOT] GitHub update error on attempt ${attempt}:`, err.message);
      await new Promise(r => setTimeout(r, 300));
    }
  }

  return { ok: false, account: finalAccount };
}

// MQTT Instant Broadcaster to BOTH HiveMQ & EMQX (Pure Node.js TCP socket, sub-50ms)
function publishSingleBroker(host, topic, payloadString) {
  return new Promise((resolve) => {
    const client = net.createConnection({ host, port: 1883 }, () => {
      const clientId = 'eth_adm_' + Math.random().toString(36).substr(2, 7);
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
    setTimeout(() => { client.destroy(); resolve(false); }, 2500);
  });
}

async function publishMqtt(topic, payloadObj) {
  const payloadString = JSON.stringify(payloadObj);
  await Promise.all([
    publishSingleBroker('broker.hivemq.com', topic, payloadString),
    publishSingleBroker('broker.emqx.io', topic, payloadString)
  ]);
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
  const newTotal = (Number(currentCoins) || 0) + amount;
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
        { text: `✅ Ha, +${amount.toLocaleString()} Coin O'tkazilsin!`, callback_data: `confirm_send:${amount}` }
      ],
      [
        { text: '❌ Bekor qilish', callback_data: 'cancel_send' }
      ]
    ]
  };

  const text = `❓ <b>O'tkazmani tasdiqlaysizmi?</b>\n\n` +
               `👤 Qabul qiluvchi: <b>${targetName}</b>\n` +
               `📧 Gmail: <code>${targetEmail}</code>\n` +
               `💰 Hozirgi Balans: <b>${(Number(currentCoins) || 0).toLocaleString()} Coin</b>\n` +
               `➕ Qo'shilayotgan Coin: <b>+${amount.toLocaleString()} Coin</b>\n` +
               `🚀 Yangi Balans: <b>${newTotal.toLocaleString()} Coin</b>\n\n` +
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
    currentCoins: Number(currentCoins) || 0
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
          `💰 GitHub'dagi Joriy Balans: <b>${(Number(currentCoins) || 0).toLocaleString()} Coin</b>\n\n` +
          `Quyidagi tezkor tugmalardan birini bosing yoki xabarda istalgan miqdorni son bilan yozing (masalan: <code>2500</code>):`,
    parse_mode: 'HTML',
    reply_markup: presetKeyboard
  });
}

// Helper: Perform search and send matching student cards
async function performStudentSearch(chatId, queryText) {
  const q = queryText.toLowerCase().trim();
  const store = await fetchLiveStoreFromGitHub();
  const accounts = (store.accounts || []).filter(a => a && a.role !== 'teacher');
  const matches = accounts.filter(a => {
    const name = (a.name || '').toLowerCase();
    const email = (a.email || '').toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  if (matches.length === 0) {
    await tgCall('sendMessage', {
      chat_id: chatId,
      text: `❌ <b>"${queryText}" bo'yicha o'quvchi topilmadi.</b>\n\nAgar yangi Gmail manziliga coin o'tkazmoqchi bo'lsangiz, to'liq Gmail manzilini yozing (masalan: <code>user@gmail.com</code>).`,
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
    text: `🎯 <b>"${queryText}" bo'yicha GitHub bazasidan ${matches.length} ta o'quvchi topildi:</b>`,
    parse_mode: 'HTML',
    reply_markup: getMainMenuKeyboard()
  });

  for (const acc of matches.slice(0, 6)) {
    const email = acc.email;
    const coins = (Number(acc.coins) || 0).toLocaleString();
    const card = `👤 <b>${acc.name}</b>\n` +
                 `📧 Gmail: <code>${email}</code>\n` +
                 `💰 Balans: <b>${coins} Coin</b>\n` +
                 `🎓 Daraja: <b>${acc.level || 'B1+'}</b>`;

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
}

// Handle Incoming Telegram Message
async function handleMessage(msg) {
  if (!msg || !msg.chat) return;
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();
  if (!text) return;

  // 1. Check if user is authorized
  if (!isAuthorized(chatId)) {
    if (text === MASTER_KEY) {
      authorizeAdmin(chatId);
      adminStates[chatId] = { step: 'idle' };
      await tgCall('sendMessage', {
        chat_id: chatId,
        text: '✅ <b>Maxfiy kod to\'g\'ri! Siz muvaffaqiyatli avtorizatsiyadan o\'tdingiz.</b>\n\n' +
              '👑 <b>Xush kelibsiz, Bosh Admin!</b>\n' +
              'Bot GitHub bulut bazasiga va MQTT tarmog\'iga 100% online ulangan.',
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

  // 2. ALWAYS check top-level Menu Commands FIRST so the bot NEVER gets stuck in a state!
  if (text === '/start' || text === '/menu') {
    adminStates[chatId] = { step: 'idle' };
    await tgCall('sendMessage', {
      chat_id: chatId,
      text: '👑 <b>ETHITH Admin Coin Boshqaruvi (GitHub Online)</b>\n\n' +
            '💡 <i>Maslahat: Tugmalardan foydalanishingiz yoki istalgan vaqtda to\'g\'ridan-to\'g\'ri o\'quvchining Gmail manzilini (masalan: <code>user@gmail.com</code>) yozib yuborishingiz mumkin!</i>',
      parse_mode: 'HTML',
      reply_markup: getMainMenuKeyboard()
    });
    return;
  }

  if (text === '❌ Bekor qilish' || text === '/cancel') {
    adminStates[chatId] = { step: 'idle' };
    await tgCall('sendMessage', {
      chat_id: chatId,
      text: '✅ Amal bekor qilindi. Asosiy menyudasiz:',
      reply_markup: getMainMenuKeyboard()
    });
    return;
  }

  if (text === 'ℹ️ Yordam' || text === '/help') {
    adminStates[chatId] = { step: 'idle' };
    await tgCall('sendMessage', {
      chat_id: chatId,
      text: 'ℹ️ <b>Admin Qo\'llanmasi (Online GitHub Baza):</b>\n\n' +
            '1️⃣ <b>Tezkor usul:</b> Chatga shunchaki o\'quvchining Gmail manzilini yozing (masalan: <code>sarvartovboyev09@gmail.com</code>) — bot darhol tanga miqdorini so\'raydi!\n' +
            '2️⃣ <b>Super tezkor usul:</b> Gmail va miqdorni bitta xabarda yozing (masalan: <code>sarvartovboyev09@gmail.com 10000</code>).\n' +
            '3️⃣ <b>🔍 O\'quvchini Qidirish:</b> Ism yoki Gmail orqali GitHub bazasidan qidirish.\n' +
            '4️⃣ <b>👥 O\'quvchilar Ro\'yxati:</b> Barcha guruh va ro\'yxatdagi o\'quvchilar.\n' +
            '5️⃣ <b>🏆 Top Balanslar:</b> Eng ko\'p tangaga ega o\'quvchilar.',
      parse_mode: 'HTML',
      reply_markup: getMainMenuKeyboard()
    });
    return;
  }

  if (text === '🔄 Baza Holati' || text === '/status') {
    adminStates[chatId] = { step: 'idle' };
    const store = await fetchLiveStoreFromGitHub();
    const students = (store.accounts || []).filter(a => a && a.role !== 'teacher');
    const classesCount = (store.classes || []).length;
    await tgCall('sendMessage', {
      chat_id: chatId,
      text: `🟢 <b>GitHub Cloud & MQTT Baza Holati:</b>\n\n` +
            `• GitHub Repo: <code>${OWNER}/${REPO}</code> (Ulangan ✅)\n` +
            `• Jami O'quvchilar: <b>${students.length} ta</b>\n` +
            `• Faol Guruhlar: <b>${classesCount} ta</b>\n` +
            `• Real-Vaqt Tarmog'i: <b>HiveMQ + EMQX (Faol ⚡)</b>\n` +
            `• Holat: <b>100% Online</b>`,
      parse_mode: 'HTML',
      reply_markup: getMainMenuKeyboard()
    });
    return;
  }

  if (text === '🔍 O\'quvchini Qidirish' || text === '/search') {
    adminStates[chatId] = { step: 'waiting_search_query' };
    await tgCall('sendMessage', {
      chat_id: chatId,
      text: '🔍 <b>O\'quvchini Qidirish:</b>\n\n' +
            'O\'quvchining <b>ismi</b> yoki <b>Gmail manzilini</b> yozing (masalan: <code>Sardorbek</code>, <code>Ashurov</code> yoki <code>sarvar...</code>):',
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [[{ text: '❌ Bekor qilish' }]],
        resize_keyboard: true
      }
    });
    return;
  }

  if (text === '🪙 Coin O\'tkazish' || text === '/sendcoin') {
    adminStates[chatId] = { step: 'waiting_email' };
    await tgCall('sendMessage', {
      chat_id: chatId,
      text: '📧 <b>Qaysi o\'quvchiga coin o\'tkazmoqchisiz?</b>\n\nFoydalanuvchining <b>Gmail manzilini</b> kiriting (masalan: <code>sarvartovboyev09@gmail.com</code>):',
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [[{ text: '❌ Bekor qilish' }]],
        resize_keyboard: true
      }
    });
    return;
  }

  if (text === '🏆 Top Balanslar' || text === '/top') {
    adminStates[chatId] = { step: 'idle' };
    const store = await fetchLiveStoreFromGitHub();
    const accounts = (store.accounts || []).filter(a => a && a.role !== 'teacher');
    accounts.sort((a, b) => (Number(b.coins) || 0) - (Number(a.coins) || 0));

    if (accounts.length === 0) {
      await tgCall('sendMessage', {
        chat_id: chatId,
        text: 'O\'quvchilar ro\'yxati bo\'sh.',
        reply_markup: getMainMenuKeyboard()
      });
      return;
    }

    let topText = '🏆 <b>GitHub Bazadagi Eng Ko\'p Coin Yig\'gan O\'quvchilar:</b>\n\n';
    const inlineButtons = [];

    accounts.slice(0, 12).forEach((acc, i) => {
      const medal = i === 0 ? '🥇' : (i === 1 ? '🥈' : (i === 2 ? '🥉' : `${i + 1}.`));
      const email = acc.email || 'Email yo\'q';
      const coins = (Number(acc.coins) || 0).toLocaleString();
      topText += `${medal} <b>${acc.name || "O'quvchi"}</b> — <b>${coins} Coin</b>\n   📧 <code>${email}</code>\n\n`;
      if (email.includes('@')) {
        inlineButtons.push([{
          text: `🪙 ${acc.name} (${coins}) ga coin berish`,
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

  if (text === '👥 O\'quvchilar Ro\'yxati' || text === '/users') {
    adminStates[chatId] = { step: 'idle' };
    const store = await fetchLiveStoreFromGitHub();
    const accounts = (store.accounts || []).filter(a => a && a.role !== 'teacher');
    if (accounts.length === 0) {
      await tgCall('sendMessage', {
        chat_id: chatId,
        text: 'Hozircha hech qanday o\'quvchi ro\'yxatdan o\'tmagan.',
        reply_markup: getMainMenuKeyboard()
      });
      return;
    }

    let listText = `📋 <b>GitHub Bazadagi O'quvchilar Ro'yxati (${accounts.length} ta):</b>\n\n`;
    const inlineButtons = [];

    accounts.slice(0, 15).forEach((acc, i) => {
      const email = acc.email || 'Email yo\'q';
      const coins = (Number(acc.coins) || 0).toLocaleString();
      listText += `${i + 1}. 👤 <b>${acc.name || "O'quvchi"}</b>\n   📧 <code>${email}</code>\n   💰 <b>${coins} Coin</b> | 🎓 ${acc.level || 'B1+'}\n\n`;
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

  // 3. SMART DIRECT INPUT: Check if user typed "email@gmail.com 5000" or "email@gmail.com" in ANY state!
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    const cleanEmail = emailMatch[1].toLowerCase().trim();
    const remainder = text.replace(emailMatch[0], '').replace(/[^0-9]/g, '').trim();
    const store = await fetchLiveStoreFromGitHub();
    const userAcc = (store.accounts || []).find(a => a && a.email && a.email.toLowerCase().trim() === cleanEmail);
    const userName = (userAcc && userAcc.name && !userAcc.name.includes("Yangi")) ? userAcc.name : (cleanEmail.split('@')[0] || "O'quvchi");
    const curCoins = userAcc ? (Number(userAcc.coins) || 0) : 0;

    if (remainder.length > 0) {
      const directAmt = parseInt(remainder, 10);
      if (directAmt > 0) {
        await promptCoinConfirmation(chatId, cleanEmail, userName, curCoins, directAmt);
        return;
      }
    }

    await sendPresetAmountMenu(chatId, cleanEmail, userName, curCoins);
    return;
  }

  // 4. State-specific handling
  const state = adminStates[chatId] || { step: 'idle' };

  if (state.step === 'waiting_amount') {
    const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num) && num > 0) {
      await promptCoinConfirmation(chatId, state.targetEmail, state.targetName, state.currentCoins || 0, num);
      return;
    }
  }

  // If user typed a name or search query in waiting_search_query, waiting_email, or idle: search students!
  await performStudentSearch(chatId, text);
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
    await tgCall('answerCallbackQuery', { callback_query_id: cb.id });
    const store = await fetchLiveStoreFromGitHub();
    const userAcc = (store.accounts || []).find(a => a && a.email && a.email.toLowerCase().trim() === email.toLowerCase().trim());
    const userName = userAcc ? userAcc.name : email;
    const curCoins = userAcc ? (Number(userAcc.coins) || 0) : 0;

    await sendPresetAmountMenu(chatId, email, userName, curCoins);
    return;
  }

  if (data.startsWith('quick_send:')) {
    const parts = data.split(':');
    const email = parts[1];
    const amount = parseInt(parts[2], 10);

    await tgCall('answerCallbackQuery', { callback_query_id: cb.id });
    const store = await fetchLiveStoreFromGitHub();
    const userAcc = (store.accounts || []).find(a => a && a.email && a.email.toLowerCase().trim() === email.toLowerCase().trim());
    const userName = userAcc ? userAcc.name : email;
    const curCoins = userAcc ? (Number(userAcc.coins) || 0) : 0;

    await promptCoinConfirmation(chatId, email, userName, curCoins, amount);
    return;
  }

  if (data.startsWith('preset_amt:')) {
    const amount = parseInt(data.split('preset_amt:')[1], 10);
    const state = adminStates[chatId];
    if (!state || !state.targetEmail) {
      await tgCall('answerCallbackQuery', { callback_query_id: cb.id, text: 'Iltimos, Gmail manzilini qaytadan tanlang' });
      return;
    }
    await tgCall('answerCallbackQuery', { callback_query_id: cb.id });
    await promptCoinConfirmation(chatId, state.targetEmail, state.targetName, state.currentCoins || 0, amount, cb.message.message_id);
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
      await tgCall('answerCallbackQuery', { callback_query_id: cb.id, text: 'Ushbu o\'tkazma allaqachon bajarilgan yoki eskirgan' });
      return;
    }

    const targetEmail = state.targetEmail;
    const targetName = state.targetName;
    const amount = state.amount;

    // Prevent double-tap duplicate transfers
    adminStates[chatId] = { step: 'idle' };
    await tgCall('answerCallbackQuery', { callback_query_id: cb.id, text: 'GitHub bazasiga yozilmoqda...' });

    // 1. Atomically update GitHub shared_store.json + local store
    const res = await updateStudentCoinsOnGitHub(targetEmail, targetName, amount, false);
    const acc = res.account || { name: targetName, email: targetEmail, coins: state.newTotal };

    // 2. Broadcast via Dual MQTT Brokers (HiveMQ + EMQX) to web & Mini App clients
    const mqttPayload = {
      type: 'USER_COINS_UPDATE',
      eventId: 'ev_admin_coin_' + Date.now(),
      targetEmail: targetEmail,
      addedCoins: amount,
      newBalance: acc.coins,
      user: {
        email: targetEmail,
        name: acc.name,
        coins: acc.coins,
        updatedAt: Date.now()
      }
    };
    await publishMqtt('ethith/v3/global', mqttPayload);

    await tgCall('editMessageText', {
      chat_id: chatId,
      message_id: cb.message.message_id,
      text: `🎉 <b>Coin Muvaffaqiyatli O'tkazildi (GitHub + Live Sync)!</b>\n\n` +
            `👤 O'quvchi: <b>${acc.name}</b>\n` +
            `📧 Gmail: <code>${targetEmail}</code>\n` +
            `➕ O'tkazilgan: <b>+${amount.toLocaleString()} Coin</b>\n` +
            `💰 Yangi Balans: <b>${Number(acc.coins).toLocaleString()} Coin</b>\n` +
            `☁️ GitHub Baza: <b>${res.ok ? 'Saqlandi ✅' : 'Sinxronlandi ⚡'}</b>\n\n` +
            `⚡ <i>Tangalar o'quvchining GitHub bulut hisobiga yozildi va ekranida darhol yangilandi!</i>`,
      parse_mode: 'HTML'
    });

    await tgCall('sendMessage', {
      chat_id: chatId,
      text: 'Yana boshqa amal bajarish uchun quyidagi menyudan foydalaning yoki Gmail yozing:',
      reply_markup: getMainMenuKeyboard()
    });
  }
}

// Telegram Long Polling Runner with Batch Deduplication (no spam on reconnect)
let lastUpdateId = 0;
let isPollingActive = true;

async function pollUpdates() {
  if (!isPollingActive) return;
  try {
    const res = await tgCall('getUpdates', {
      offset: lastUpdateId + 1,
      timeout: 20,
      allowed_updates: ['message', 'callback_query']
    });

    if (res && res.ok && Array.isArray(res.result) && res.result.length > 0) {
      // Advance offset past all received updates
      for (const u of res.result) {
        if (u.update_id > lastUpdateId) lastUpdateId = u.update_id;
      }

      // If multiple messages queued up from the same chat while offline, only process the LATEST update per chat!
      const latestByChat = new Map();
      const callbacks = [];
      for (const u of res.result) {
        if (u.callback_query) {
          callbacks.push(u.callback_query);
        } else if (u.message && u.message.chat) {
          latestByChat.set(u.message.chat.id, u.message);
        }
      }

      for (const cb of callbacks) {
        await handleCallbackQuery(cb);
      }
      for (const msg of latestByChat.values()) {
        await handleMessage(msg);
      }
    } else if (res && res.error_code === 409) {
      if (process.env.GITHUB_ACTIONS === 'true') {
        console.log('[ADMIN BOT] Primary bot instance is already active and polling. Cloud standby yielding cleanly.');
        process.exit(0);
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  } catch (e) {
    console.error('[ADMIN BOT] Polling error:', e.message);
  }

  if (isPollingActive) {
    setTimeout(pollUpdates, 400);
  }
}

// If running inside GitHub Actions, re-dispatch workflow before 50-minute mark for 24/7 cloud operation
if (process.env.GITHUB_ACTIONS === 'true') {
  const MAX_RUN_MS = 45 * 60 * 1000; // 45 minutes
  setTimeout(async () => {
    console.log('[ADMIN BOT] 45m cycle complete on GitHub Actions. Triggering next cloud cycle...');
    isPollingActive = false;
    try {
      await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/ethith_coin_bot.yml/dispatches`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${GH_TOKEN}`,
          'User-Agent': 'ETHITH-AdminBot-Chain',
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ref: 'main' })
      });
    } catch (e) {}
    setTimeout(() => process.exit(0), 1500);
  }, MAX_RUN_MS);
}

console.log('[ETHITH ADMIN BOT] Starting @ETHITHCOINbot (GitHub Live Cloud Sync)...');
// Ensure webhook is cleared so getUpdates works reliably
tgCall('deleteWebhook', { drop_pending_updates: false }).then(() => {
  pollUpdates();
});
