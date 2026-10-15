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
    'QVEuQWI4Uk42Sk5fQ2piZzV2dFJ6NGxNNTB1VHAtV0hab1FpbE5zMnd2ZXlzeWhlT1dFcHc=',
    'QVEuQWI4Uk42SmlEd2l5WU5aUmVITlJ6SVU2NFBRbHlzUzBHNW5fS2F5bWF2MWp2dFhZVXc=',
    'QVEuQWI4Uk42S1dyV3pxclB6c3c5dEd5SDlYZkppWlNkYTdqWF9PVWxuSmhCN2dzT21YNXc=',
    'QVEuQWI4Uk42SjAzSm9iamVleU42WFR2MmpaekxLNEN1cVdXSHQ1eDdvojhXWmlRSFo4aHc=',
    'QVEuQWI4Uk42S19JQmJOMnJNR2lMWi1HMWJ0a0RrOUF2VFgtVXQwRHNFTHNJTzVLdElNWnc=',
    'QVEuQWI4Uk42SU5xa2xCRFZWN0F0Zi1yWlBqV0ZuMFNvaDVqNE5mWUlfQ1dmYkVKUWFFT3c=',
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

  var SYSTEM_PROMPT = "You are ETHITH AI, an advanced AI English teacher created by Muhammadyusuf Jo'raboyev. Provide clear, comprehensive, and pedagogical explanations for English learners. Answer questions thoroughly, explain grammar rules, vocabulary, pronunciation, and IELTS strategies in an encouraging and engaging tone.";

  var currentKeyIndex = 0;
  var keyErrors = {};

  function getKey() {
    var key = API_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    return key;
  }

  var MODELS = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];

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

    return "Hello! I am experiencing a temporary connection delay reaching the AI service (" + (lastError ? lastError.message : 'Timeout') + "). Please try sending your question again.";
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
      parts: [{ text: SYSTEM_PROMPT + "\n\nHello, I am starting a learning session with you." }]
    });
    contents.push({
      role: 'model',
      parts: [{ text: "Hello! I am ETHITH AI — your personal AI English instructor. How can I assist you with your English learning today?" }]
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
        text: "[Attached Document Content]:\n" + fileAttachment.textData.slice(0, 15000)
      });
    }

    currentParts.push({ text: message || "Please provide an explanation for this question or study material." });

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
      'Task: Based on the provided exam materials, generate exactly ' + targetCount + ' high-quality multiple choice quiz questions.\n' +
      'Each question must have 4 options, a correct "answer" (exact match to one of the options), and a concise "explanation".\n\n' +
      'Exam Material:\n' + content.slice(0, 12000) + '\n\n' +
      'Return response ONLY in the following valid JSON array format:\n' +
      '[\n' +
      '  {\n' +
      '    "id": 1,\n' +
      '    "question": "Question text...",\n' +
      '    "options": ["Option A", "Option B", "Option C", "Option D"],\n' +
      '    "answer": "Option A",\n' +
      '    "explanation": "Brief explanation..."\n' +
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

  // 4. Intelligent Exam Extraction from PDF, Image, or Raw Text (Cambridge/Oxford/IELTS tests)
  async function parseAndExtractExam(params) {
    params = params || {};
    var text = params.text || '';
    var fileAttachment = params.fileAttachment || null;
    var answersText = params.answersText || '';
    var defaultPts = params.defaultPoints || 2;

    var parts = [];

    var prompt = "You are an expert Cambridge and Oxford English exam parser. Analyze the provided exam material (document, image, or text) and the optional answer key.\n" +
      "Extract all individual exercises and questions into a clean JSON structure.\n" +
      "Requirements:\n" +
      "1. \"title\": detect the exam title from the header (e.g. 'B1+ Progress test 1B Units 1–3') or generate an appropriate descriptive title.\n" +
      "2. \"duration\": suggested time in minutes (default 30 or 45).\n" +
      "3. \"questions\": array of all extracted questions. Each question MUST have:\n" +
      "   - \"num\": sequential integer (1, 2, 3...)\n" +
      "   - \"type\": 'choice' | 'bool' | 'written'\n" +
      "   - \"question\": clear, complete question or statement text without the leading number or letter labels\n" +
      "   - \"options\": array of strings (for 'choice': provide the choices text without the 'a/b/c/d' prefix; for 'bool': provide exactly [\"True\", \"False\"]; for 'written': provide empty array [])\n" +
      "   - \"points\": number (read from points box e.g. 2, or default " + defaultPts + ")\n" +
      "   - \"answer\": correct answer string. If an ANSWER KEY was provided, correlate and assign the exact answer. If not provided, infer the best answer or leave as option A / True.\n" +
      "\nReturn ONLY a valid JSON object matching this schema without markdown fences:\n" +
      "{\"title\": string, \"duration\": number, \"questions\": [{\"num\": number, \"type\": string, \"question\": string, \"options\": string[], \"points\": number, \"answer\": string}]}";

    parts.push({ text: prompt });

    if (fileAttachment && fileAttachment.base64 && fileAttachment.mimeType) {
      parts.push({
        inlineData: {
          mimeType: fileAttachment.mimeType,
          data: fileAttachment.base64
        }
      });
    }

    if (text) {
      parts.push({ text: "=== EXAM QUESTIONS TEXT ===\n" + text.slice(0, 30000) });
    }

    if (answersText) {
      parts.push({ text: "=== ANSWER KEY (CORRECT ANSWERS) ===\n" + answersText.slice(0, 5000) });
    }

    var payload = {
      contents: [{ parts: parts }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    };

    var rawResponse = await callGeminiRaw(payload, 'gemini-flash-lite-latest');
    var cleanJson = (rawResponse || '').replace(/```json/gi, '').replace(/```/g, '').trim();
    try {
      var parsed = JSON.parse(cleanJson);
      return parsed;
    } catch(err) {
      console.error('Failed to parse Gemini exam JSON:', err, cleanJson);
      throw err;
    }
  }

  window.EthithAI = {
    generateTopicQuiz: generateTopicQuiz,
    askAITeacher: askAITeacher,
    generateExamFromContent: generateExamFromContent,
    parseAndExtractExam: parseAndExtractExam,
    systemPrompt: SYSTEM_PROMPT
  };

})(window);
