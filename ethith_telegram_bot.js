/**
 * ETHITH TESTS - Official Telegram Bot Service
 * Bot: @ETHITH_testbot (Token: 8857210620:AAHeVQqMLgaHSKbEiAPg6m34o6VvRcQ7gzE)
 * Mini App URL: https://joraboymuhammad-code.github.io/english-hub-ethith/
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BOT_TOKEN = '8857210620:AAHeVQqMLgaHSKbEiAPg6m34o6VvRcQ7gzE';
const MINI_APP_URL = 'https://joraboymuhammad-code.github.io/english-hub-ethith/';
const CODES_FILE = path.join(__dirname, 'verification_codes.json');
const HTTP_PORT = 3850;

// Helper to generate 6-character code (Numbers, Letters, and Symbols)
function generate6CharCode() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  const symbols = '#$!*@';
  
  const parts = [
    letters[Math.floor(Math.random() * letters.length)],
    digits[Math.floor(Math.random() * digits.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
    letters[Math.floor(Math.random() * letters.length)],
    digits[Math.floor(Math.random() * digits.length)],
    symbols[Math.floor(Math.random() * symbols.length)]
  ];

  return parts.sort(() => 0.5 - Math.random()).join('');
}

// Read / Write Verification Codes store
function loadCodes() {
  try {
    if (fs.existsSync(CODES_FILE)) {
      return JSON.parse(fs.readFileSync(CODES_FILE, 'utf8'));
    }
  } catch (e) {}
  return { codes: {}, latest: null };
}

function saveCodes(data) {
  try {
    fs.writeFileSync(CODES_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving codes file:', e.message);
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
    console.error(`Telegram API error on ${method}:`, err.message);
    return { ok: false, error: err.message };
  }
}

// Helper to register active code in shared_store.json
function registerCodeInStore(code) {
  try {
    const storePath = path.join(__dirname, 'shared_store.json');
    if (fs.existsSync(storePath)) {
      const data = JSON.parse(fs.readFileSync(storePath, 'utf8'));
      if (!data.activeVerificationCodes) data.activeVerificationCodes = {};
      data.activeVerificationCodes[code.toUpperCase()] = Date.now() + 10 * 60 * 1000;
      fs.writeFileSync(storePath, JSON.stringify(data, null, 2), 'utf8');
    }
  } catch (e) {}
}

// Send Verification Code to a Chat ID
async function sendVerificationCodeToChat(chatId, userName = "Foydalanuvchi", customCode = null) {
  const code = (customCode || generate6CharCode()).toUpperCase();
  const store = loadCodes();

  store.codes[code] = {
    chatId: chatId,
    userName: userName,
    createdAt: Date.now(),
    expiresAt: Date.now() + 10 * 60 * 1000
  };
  store.latest = {
    code: code,
    chatId: chatId,
    userName: userName,
    createdAt: Date.now()
  };
  saveCodes(store);
  registerCodeInStore(code);

  const text = 
    `🔐 <b>ETHITH TESTS — Tasdiqlash Kodi</b>\n\n` +
    `Assalomu alaykum, <b>${userName}</b>!\n\n` +
    `Sizning 6 xonali tasdiqlash kodingiz:\n\n` +
    `👉 <code>${code}</code> 👈 <i>(nusxalash uchun ustiga bosing)</i>\n\n` +
    `Ushbu kodni Mini App dagi <b>Tasdiqlash Kodi</b> maydoniga kiriting.\n` +
    `⏱️ Kod 10 daqiqa davomida amal qiladi.`;

  const inlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: "🚀 ETHITH TESTS Mini App ni Ochish",
          web_app: { url: MINI_APP_URL }
        }
      ]
    ]
  };

  await tgCall('sendMessage', {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: inlineKeyboard
  });

  console.log(`[BOT] Verification code ${code} sent to chat ${chatId} (${userName})`);
  return code;
}

// Handle Incoming Telegram Message
async function handleMessage(msg) {
  if (!msg || !msg.chat) return;
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();
  const userName = msg.from ? (msg.from.first_name || msg.from.username || "O'quvchi") : "Foydalanuvchi";

  // Remember user chat ID
  const store = loadCodes();
  if (!store.users) store.users = {};
  if (msg.from && msg.from.username) {
    store.users[msg.from.username.toLowerCase().replace('@', '')] = chatId;
  }
  store.lastChatId = chatId;
  saveCodes(store);

  // If start command has "code" parameter or user asked for code
  if (text.includes('code') || text.includes('kod') || text === '🔑 Tasdiqlash Kodi' || text === '/code') {
    await sendVerificationCodeToChat(chatId, userName);
    return;
  }

  if (text.startsWith('/start') || text.startsWith('/webapp')) {
    const welcomeText = 
      `🇬🇧 <b>ETHITH TESTS Rasmiy Telegram Botiga Xush Kelibsiz!</b>\n\n` +
      `Assalomu alaykum, <b>${userName}</b>!\n\n` +
      `Ushbu platforma orqali siz:\n` +
      `• 📚 CEFR (A1–C2) 40 ta mavzu bo'yicha testlarni yechishingiz\n` +
      `• ⚡ Jonli Quiz Arena va turnirlarda qatnashishingiz\n` +
      `• 🪙 ETHITH Coinlar yig'ib, Marketdan unvon va sovrinlar olishingiz mumkin!\n\n` +
      `👇 <b>Platformaga kirish uchun quyidagi ko'k tugmani bosing:</b>`;

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "🚀 ETHITH TESTS (Mini App ni Ochish)",
            web_app: { url: MINI_APP_URL }
          }
        ],
        [
          {
            text: "🔑 Tasdiqlash Kodini Olish",
            callback_data: "get_code"
          }
        ]
      ]
    };

    const replyKeyboard = {
      keyboard: [
        [
          {
            text: "🚀 ETHITH TESTS",
            web_app: { url: MINI_APP_URL }
          },
          {
            text: "🔑 Tasdiqlash Kodi"
          }
        ]
      ],
      resize_keyboard: true
    };

    await tgCall('sendMessage', {
      chat_id: chatId,
      text: welcomeText,
      parse_mode: 'HTML',
      reply_markup: keyboard
    });

    // Also send reply keyboard
    await tgCall('sendMessage', {
      chat_id: chatId,
      text: "Mini App menyusi aktivlashtirildi. 'ETHITH TESTS' tugmasi orqali istalgan vaqt platformaga kirishingiz mumkin.",
      reply_markup: replyKeyboard
    });
    return;
  }

  if (text === '/help') {
    const helpText = 
      `ℹ️ <b>Yordam va Qo'llanma:</b>\n\n` +
      `1. Ro'yxatdan o'tish uchun Mini App da 'Kodni Olish' tugmasini bosing yoki botga /code buyrug'ini yuboring.\n` +
      `2. Bot sizga 6 xonali maxsus kod yuboradi.\n` +
      `3. Kodni Mini App ga kiritib ro'yxatdan o'tishni yakunlang.\n\n` +
      `Savollar yoki takliflar uchun: @Mu_striker`;

    await tgCall('sendMessage', {
      chat_id: chatId,
      text: helpText,
      parse_mode: 'HTML'
    });
    return;
  }
}

// Handle Callback Queries (from inline buttons)
async function handleCallbackQuery(cb) {
  if (!cb || !cb.message) return;
  const chatId = cb.message.chat.id;
  const userName = cb.from ? (cb.from.first_name || cb.from.username || "O'quvchi") : "Foydalanuvchi";

  if (cb.data === 'get_code') {
    await tgCall('answerCallbackQuery', { callback_query_id: cb.id, text: "Kodingiz tayyorlanmoqda..." });
    await sendVerificationCodeToChat(chatId, userName);
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
    console.error('Polling error:', e.message);
  }

  // Next poll
  setTimeout(pollUpdates, 500);
}

// Local HTTP Server for Frontend Integration
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', bot: 'ETHITH_testbot', timestamp: Date.now() }));
    return;
  }

  if (url.pathname === '/latest-code') {
    const store = loadCodes();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, latest: store.latest, codes: Object.keys(store.codes || {}) }));
    return;
  }

  if (url.pathname === '/check-code') {
    const code = (url.searchParams.get('code') || '').trim().toUpperCase();
    const store = loadCodes();
    const isValid = !!(store.codes && store.codes[code] && (store.codes[code].expiresAt > Date.now()));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, valid: isValid, code: code }));
    return;
  }

  if (url.pathname === '/send-code' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const code = (payload.code || generate6CharCode()).toUpperCase();
        const store = loadCodes();

        store.codes[code] = {
          chatId: payload.chatId || null,
          userName: payload.name || "O'quvchi",
          email: payload.email || '',
          createdAt: Date.now(),
          expiresAt: Date.now() + 10 * 60 * 1000
        };
        store.latest = {
          code: code,
          chatId: payload.chatId || null,
          userName: payload.name || "O'quvchi",
          email: payload.email || '',
          createdAt: Date.now()
        };
        saveCodes(store);
        registerCodeInStore(code);

        let targetChatId = payload.chatId;
        if (!targetChatId && payload.username) {
          const cleanU = payload.username.toLowerCase().replace('@', '').trim();
          if (store.users && store.users[cleanU]) {
            targetChatId = store.users[cleanU];
          }
        }
        if (!targetChatId && store.lastChatId) {
          targetChatId = store.lastChatId;
        }

        let sent = false;
        if (targetChatId) {
          await sendVerificationCodeToChat(targetChatId, payload.name || "Foydalanuvchi", code);
          sent = true;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, code: code, sent: sent }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(HTTP_PORT, () => {
  console.log(`[ETHITH BOT SERVER] Local HTTP API running on port ${HTTP_PORT}`);
  console.log(`[ETHITH BOT] Telegram long polling starting for @ETHITH_testbot...`);
  pollUpdates();
});
