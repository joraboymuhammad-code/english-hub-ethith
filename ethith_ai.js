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

  async function callGeminiRaw(bodyPayload, customModel) {
    var model = customModel || 'gemini-flash-lite-latest';
    var maxRetries = API_KEYS.length;
    var lastError = null;

    for (var attempt = 0; attempt < maxRetries; attempt++) {
      var key = getKey();
      var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + key;

      try {
        var response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload)
        });

        if (response.ok) {
          var data = await response.json();
          var text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return text;
          }
        }

        var errText = await response.text();
        console.warn('Gemini attempt failed with key index ' + currentKeyIndex + ':', response.status, errText);
        lastError = new Error('API Error: ' + response.status);
      } catch (err) {
        console.warn('Network error on key index ' + currentKeyIndex + ':', err.message);
        lastError = err;
      }
    }

    throw lastError || new Error('Barcha API kalitlari band yoki javob bermadi.');
  }

  // 1. Generate Quiz for a specific Level & Topic
  async function generateTopicQuiz(level, topicNum, topicTitle, count) {
    var targetCount = Math.min(Math.max(parseInt(count, 10) || 25, 10), 50);

    var prompt = SYSTEM_PROMPT + '\n\n' +
      'Vazifa: Ingliz tili ' + level + ' darajasidagi "' + topicTitle + '" (Mavzu #' + topicNum + ') mavzusida aniq ' + targetCount + ' ta viktorina test savoli tuzib bering.\n' +
      'Talablar:\n' +
      '1. Har bir savolda 4 ta variant (options) bo\'lsin: A, B, C, D kabi 4 ta element.\n' +
      '2. "answer" maydoni variantlardan biri bilan bir xil bo\'lsin.\n' +
      '3. "explanation" maydonida o\'zbek tilida pedagogik va tushunarli qisqa izoh berilsin.\n' +
      '4. Javobni FAQAT va FAQAT quyidagi JSON formatida qaytaring, boshqa hech qanday so\'z yoki markdown belgisi qo\'shmang:\n' +
      '[\n' +
      '  {\n' +
      '    "id": 1,\n' +
      '    "question": "Savol matni...",\n' +
      '    "options": ["A variant", "B variant", "C variant", "D variant"],\n' +
      '    "answer": "A variant",\n' +
      '    "explanation": "Nima uchun bu to\'g\'riligi haqida izoh..."\n' +
      '  }\n' +
      ']';

    var payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.35,
        responseMimeType: 'application/json'
      }
    };

    var rawResponse = await callGeminiRaw(payload);
    var cleanJson = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
    var questions = JSON.parse(cleanJson);

    // Validate structure
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Test savollari generatsiyasida xatolik yuz berdi.');
    }

    return questions.map(function(q, i) {
      var opts = Array.isArray(q.options) ? q.options : ['A', 'B', 'C', 'D'];
      while (opts.length < 4) opts.push('Option ' + (opts.length + 1));
      if (opts.length > 4) opts = opts.slice(0, 4);

      var ans = q.answer;
      if (!opts.includes(ans)) {
        if (ans === 'A') ans = opts[0];
        else if (ans === 'B') ans = opts[1];
        else if (ans === 'C') ans = opts[2];
        else if (ans === 'D') ans = opts[3];
        else ans = opts[0];
      }

      return {
        id: i + 1,
        question: q.question || ('Question ' + (i + 1)),
        options: opts,
        answer: ans,
        explanation: q.explanation || "To'g'ri javob: " + ans
      };
    });
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
