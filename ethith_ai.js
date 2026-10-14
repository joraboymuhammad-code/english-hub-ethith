/**
 * ETHITH AI Engine
 * Created by Muhammadyusuf Jo'raboyev
 * Features:
 * - 9-Key Load Balanced Failover Pool
 * - Structured JSON Quiz Generation
 * - Multimodal Ask AI Teacher
 * - Exam PDF/Content Parser
 */

(function(window) {
  'use strict';

  var _ENC_KEYS = [
    'QVEuQWI4Uk42SjBzWk1laHpCSXoteDZnQVZ0dXhKcGg5ODVaV2ZwRktuM2xpdHVCbjRDX3c=',
    'QVEuQWI4Uk42SUFnS0JBbmpFLS1pNHZwMlRVLTN2RnJhc19FMmw1MlBYX1JvRDMyM1RBZ0E=',
    'QVEuQWI4Uk42TFpoYTNMVy1tWWI5eDNPNy1aai1KQXlqd2l6bG8wZ2owNFItWFllaXNqQlE=',
    'QVEuQWI4Uk42S0hOVUdBYjFDWkQ0azVqWGxBbFI4YUdtLTJrTjRhS2o2NlZ4SVJid1UyaGc=',
    'QVEuQWI4Uk42TEhhQ3h2TEtMcDZYdW9DbnZoWkhjSGttLTB1amx5Y2RqSmFYcFJNRzFjT2c=',
    'QVEuQWI4Uk42TDZ5U2hPb01fRmpnb2xtWWZVbVIzLXpyTEFLLUROcE8wZVN0WWpkV052c1E=',
    'QVEuQWI4Uk42S0t0TGRkUHZob1dkZTA3aGZyaVFFeXFDNi03M1Q5ZXdpb21fcTVoWVZZZGc=',
    'QVEuQWI4Uk42SXU3Qm9jcTdHSDZNdUJMclVvXzc5bXh2ZWdnVHk1bjFrWWd2UzdiNGJOUkE=',
    'QVEuQWI4Uk42SzR4NGpGb19rYWNyQ1FwRGxIQ3RFMkt6YnlwZmMyWXlhcWlPRUg3OUY4SlE='
  ];

  var API_KEYS = _ENC_KEYS.map(function(k){ return (typeof atob === 'function' ? atob(k) : Buffer.from(k, 'base64').toString('utf8')); });

  var SYSTEM_PROMPT = "Siz ETHITH AI platformasisiz. Yaratuvchingiz: Jo'raboyev Muhammadyusuf. Foydalanuvchilarning ingliz tili (va boshqa fanlar) bo'yicha savollariga batafsil, tushunarli va pedagogik yondashuvda javob bering.";

  var currentKeyIndex = 0;
  var keyErrors = {};

  function getKey() {
    var key = API_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    return key;
  }

  var MODELS = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-flash-lite-latest'];

  async function callGeminiRaw(bodyPayload, customModel) {
    var modelsToTry = customModel ? [customModel].concat(MODELS) : MODELS;
    var maxRetries = API_KEYS.length;
    var lastError = null;

    for (var mIdx = 0; mIdx < modelsToTry.length; mIdx++) {
      var model = modelsToTry[mIdx];
      for (var attempt = 0; attempt < maxRetries; attempt++) {
        var key = getKey();
        var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + key;

        try {
          var controller = new AbortController();
          var timeoutId = setTimeout(function() { controller.abort(); }, 12000);

          var response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyPayload),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            var data = await response.json();
            var text = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
            if (text) {
              return text;
            }
          }

          var errText = await response.text();
          console.warn('Gemini attempt failed with model ' + model + ' key ' + (attempt + 1) + ':', response.status);
          lastError = new Error('API Error: ' + response.status);
          if (response.status === 404) {
            break; // Model not found, skip to next model
          }
        } catch (err) {
          console.warn('Network or timeout error on model ' + model + ':', err.message);
          lastError = err;
        }
      }
    }

    return "Assalomu alaykum! Kechirasiz, ayni paytda serverdan javob olishda uzilish kuzatildi (" + (lastError ? lastError.message : 'Timeout') + "). Iltimos, savolingizni qayta yuboring.";
  }

  // 1. Generate Quiz for a specific Level & Topic - 100% OFFLINE ALGORITHMIC GENERATOR
  async function generateTopicQuiz(level, topicNum, topicTitle, count) {
    if (window.EthithQuizEngine && window.EthithQuizEngine.generateQuiz) {
      return window.EthithQuizEngine.generateQuiz(level, topicNum, count);
    }
    return [];
  }

  // 2. Ask AI Teacher
  async function askAITeacher(message, history, fileAttachment) {
    var contents = [];

    // System prompt as initial context
    contents.push({
      role: 'user',
      parts: [{ text: SYSTEM_PROMPT + "\n\nSalom, siz bilan suhbatni boshlayapman." }]
    });
    contents.push({
      role: 'model',
      parts: [{ text: "Assalomu alaykum! Men ETHITH AI — sizning shaxsiy ingliz tili va fanlar bo'yicha sun'iy intellekt o'qituvchingizman. Sizga qanday yordam bera olaman?" }]
    });

    // History (last 8 messages)
    if (Array.isArray(history)) {
      history.slice(-8).forEach(function(item) {
        contents.push({
          role: item.role === 'user' ? 'user' : 'model',
          parts: [{ text: item.text }]
        });
      });
    }

    // Current message parts
    var currentParts = [];
    if (fileAttachment && fileAttachment.base64 && fileAttachment.mimeType) {
      currentParts.push({
        inlineData: {
          mimeType: fileAttachment.mimeType,
          data: fileAttachment.base64
        }
      });
    }

    if (fileAttachment && fileAttachment.textData) {
      currentParts.push({
        text: "[Biriktirilgan hujjat matni]:\n" + fileAttachment.textData.slice(0, 15000)
      });
    }

    currentParts.push({ text: message || "Ushbu savol/material bo'yicha tushuntirish bering." });

    contents.push({
      role: 'user',
      parts: currentParts
    });

    var payload = {
      contents: contents,
      generationConfig: {
        temperature: 0.7
      }
    };

    return await callGeminiRaw(payload);
  }

  // 3. Generate Exam from PDF/Text Content
  async function generateExamFromContent(content, count) {
    var targetCount = Math.min(Math.max(parseInt(count, 10) || 15, 5), 40);

    var prompt = SYSTEM_PROMPT + '\n\n' +
      'Vazifa: Quyida berilgan imtihon materiallari asosida aniq ' + targetCount + ' ta sifatli viktorina test savoli tuzib bering.\n' +
      'Har bir savolda 4 ta variant (options) va to\'g\'ri javob ("answer") hamda qisqa izoh ("explanation") bo\'lsin.\n\n' +
      'Imtihon materiali:\n' + content.slice(0, 12000) + '\n\n' +
      'Javobni FAQAT quyidagi JSON formatida qaytaring:\n' +
      '[\n' +
      '  {\n' +
      '    "id": 1,\n' +
      '    "question": "Savol matni...",\n' +
      '    "options": ["A", "B", "C", "D"],\n' +
      '    "answer": "A",\n' +
      '    "explanation": "Izoh..."\n' +
      '  }\n' +
      ']';

    var payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: 'application/json'
      }
    };

    var rawResponse = await callGeminiRaw(payload);
    var cleanJson = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  }

  window.EthithAI = {
    generateTopicQuiz: generateTopicQuiz,
    askAITeacher: askAITeacher,
    generateExamFromContent: generateExamFromContent,
    systemPrompt: SYSTEM_PROMPT
  };

})(window);
