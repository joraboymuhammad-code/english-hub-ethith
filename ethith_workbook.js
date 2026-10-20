/**
 * ETHITH OXFORD NAVIGATE INTERMEDIATE (B1+) DIGITAL WORKBOOK
 * Authentic OUP Navigate Intermediate (B1+) Material
 * High-performance, lightweight image-overlay system with zero PDF lag.
 * Omits all listening exercises strictly per requirements.
 *
 * Rich Authentic Interaction Types:
 * 1. fill   - O'qib yoziladigan (Text inputs on printed lines)
 * 2. cross  - O'chiriladigan (Realistic pen strikethrough for incorrect words)
 * 3. choose - Belgilanadigan (Highlighting correct option in pairs)
 * 4. match  - Bog'lanadigan (Letter selector badges for matching questions to answers)
 * 5. insert - Chiziladigan / Joylashtiriladigan (Slash caret insertion between words)
 */

(function(window) {
  'use strict';

  var WB = window.ETHITH_WORKBOOK_B1 = window.ETHITH_WORKBOOK_B1 || {};

  // Check if current user is Teacher/Admin
  function isTeacherRole() {
    var u = (window.EthithApp && window.EthithApp.state && window.EthithApp.state.user) || (window.S && window.S.user);
    return !!(u && (u.role === 'teacher' || u.role === 'admin'));
  }

  // 12 Authentic Units from Oxford Navigate Intermediate B1+
  WB.units = [
    {
      unit: 1,
      title: "Unit 1: Trends",
      subtitle: "Grammar: Present simple, continuous and perfect · Vocabulary: Friendship",
      available: true,
      lessons: [
        { code: "1.1", title: "1.1 Are you really my friend?", desc: "Grammar (Present tenses), Vocabulary (Friendship) & Pronunciation", pages: [4, 5], active: true },
        { code: "1.2", title: "1.2 Why spending's #trending", desc: "Grammar (State verbs), Vocabulary (Spending)", pages: [6, 7], active: true },
        { code: "1.3", title: "1.3 Vocabulary development", desc: "Noun suffixes (-ment, -tion, -ity, -ship)", pages: [8], active: true },
        { code: "1.4", title: "1.4 Speaking and writing", desc: "Asking for and giving opinions, writing social media", pages: [9], active: true }
      ]
    },
    {
      unit: 2,
      title: "Unit 2: What a story!",
      subtitle: "Narrative forms & sequencing events · Vocabulary: Describing past experiences",
      available: true,
      lessons: [
        { code: "2.1", title: "2.1 I'll never forget that day", desc: "Grammar (Narrative forms), Vocabulary (Past experiences)", pages: [10, 11], active: true },
        { code: "2.2", title: "2.2 Unbelievable?", desc: "Grammar (Sequencing events), Vocabulary (Communication)", pages: [12, 13], active: true },
        { code: "2.3", title: "2.3 Vocabulary development", desc: "Comment adverbs", pages: [14], active: true },
        { code: "2.4", title: "2.4 Speaking and writing", desc: "Showing interest, writing a narrative", pages: [15], active: true },
        { code: "2.5", title: "2.5 Review & Reading", desc: "Review: Units 1 and 2, Reading for pleasure (Kidnapped)", pages: [16, 17], active: true }
      ]
    },
    {
      unit: 3,
      title: "Unit 3: Life skills",
      subtitle: "Ability, obligation, permission & possibility · Vocabulary: Challenges and success",
      available: true,
      lessons: [
        { code: "3.1", title: "3.1 The balance of life", desc: "Grammar (Ability), Vocabulary (Challenges and success)", pages: [18, 19], active: true },
        { code: "3.2", title: "3.2 Survival skills", desc: "Grammar (Obligation, permission and possibility), Vocabulary (Work skills)", pages: [20, 21], active: true },
        { code: "3.3", title: "3.3 Vocabulary development", desc: "Compound adjectives", pages: [22], active: true },
        { code: "3.4", title: "3.4 Speaking and writing", desc: "Practical instructions, writing an opinion paragraph", pages: [23], active: true }
      ]
    },
    {
      unit: 4,
      title: "Unit 4: Space",
      subtitle: "will/be going to for predictions & probability · Vocabulary: Living on water",
      available: true,
      lessons: [
        { code: "4.1", title: "4.1 Living on water", desc: "Grammar (will/be going to for predictions), Vocabulary (Living on water)", pages: [24, 25], active: true },
        { code: "4.2", title: "4.2 Into the wilderness", desc: "Grammar (Probability), Vocabulary (The natural world)", pages: [26, 27], active: true },
        { code: "4.3", title: "4.3 Vocabulary development", desc: "Idiomatic phrases about places", pages: [28], active: true },
        { code: "4.4", title: "4.4 Speaking and writing", desc: "Enquiries, avoiding repetition", pages: [29, 30], active: true },
        { code: "4.5", title: "4.5 Review: Units 3 & 4", desc: "Grammar and vocabulary review", pages: [31], active: true }
      ]
    },
    {
      unit: 5,
      title: "Unit 5: Entertainment",
      subtitle: "-ing form and infinitive with to, present perfect simple vs past simple",
      available: true,
      lessons: [
        { code: "5.1", title: "5.1 Going to the movies", desc: "Grammar (-ing form and infinitive with to), Vocabulary (Going to the movies)", pages: [32, 33], active: true },
        { code: "5.2", title: "5.2 Video games", desc: "Grammar (Present perfect simple and past simple), Vocabulary (Video games)", pages: [34, 35], active: true },
        { code: "5.3", title: "5.3 Vocabulary development", desc: "Extreme adjectives", pages: [36], active: true },
        { code: "5.4", title: "5.4 Speaking and writing", desc: "Comparing and recommending, film review", pages: [37], active: true }
      ]
    },
    {
      unit: 6,
      title: "Unit 6: In control?",
      subtitle: "Relative clauses, present perfect simple & continuous · Vocabulary: Machines",
      available: true,
      lessons: [
        { code: "6.1", title: "6.1 Man and machine", desc: "Grammar (Relative clauses), Vocabulary (Machines)", pages: [38, 39], active: true },
        { code: "6.2", title: "6.2 Climate control", desc: "Grammar (Present perfect simple and continuous), Vocabulary (Climate)", pages: [40, 41], active: true },
        { code: "6.3", title: "6.3 Vocabulary development", desc: "Adjective suffixes", pages: [42], active: true },
        { code: "6.4", title: "6.4 Speaking and writing", desc: "Changing arrangements, professional email", pages: [43, 44], active: true },
        { code: "6.5", title: "6.5 Review: Units 5 & 6", desc: "Grammar and vocabulary review", pages: [45], active: true }
      ]
    },
    {
      unit: 7,
      title: "Unit 7: Ambitions",
      subtitle: "used to and would, question forms · Vocabulary: Working conditions",
      available: true,
      lessons: [
        { code: "7.1", title: "7.1 Working conditions", desc: "Grammar (used to and would), Vocabulary (Working conditions)", pages: [46, 47], active: true },
        { code: "7.2", title: "7.2 High achievers", desc: "Grammar (Question forms), Vocabulary (High achievers)", pages: [48, 49], active: true },
        { code: "7.3", title: "7.3 Vocabulary development", desc: "Collocations", pages: [50], active: true },
        { code: "7.4", title: "7.4 Speaking and writing", desc: "Clarification, application letter or email", pages: [51], active: true }
      ]
    },
    {
      unit: 8,
      title: "Unit 8: Choices",
      subtitle: "Real and unreal conditionals · Vocabulary: Happiness factors & personality",
      available: true,
      lessons: [
        { code: "8.1", title: "8.1 Happy choices", desc: "Grammar (Real conditionals), Vocabulary (Happiness factors)", pages: [52, 53], active: true },
        { code: "8.2", title: "8.2 Personality and behaviour", desc: "Grammar (Unreal conditionals), Vocabulary (Personality and behaviour)", pages: [54, 55], active: true },
        { code: "8.3", title: "8.3 Vocabulary development", desc: "Prefixes", pages: [56], active: true },
        { code: "8.4", title: "8.4 Speaking and writing", desc: "Giving a talk, taking notes", pages: [57, 58], active: true },
        { code: "8.5", title: "8.5 Review: Units 7 & 8", desc: "Grammar and vocabulary review", pages: [59], active: true }
      ]
    },
    {
      unit: 9,
      title: "Unit 9: Appearances",
      subtitle: "Comparison, deduction & speculation · Vocabulary: Physical appearance",
      available: true,
      lessons: [
        { code: "9.1", title: "9.1 Physical appearance", desc: "Grammar (Comparison), Vocabulary (Physical appearance)", pages: [60, 61], active: true },
        { code: "9.2", title: "9.2 Paintings", desc: "Grammar (Deduction and speculation), Vocabulary (Paintings)", pages: [62, 63], active: true },
        { code: "9.3", title: "9.3 Vocabulary development", desc: "Phrasal verbs", pages: [64], active: true },
        { code: "9.4", title: "9.4 Speaking and writing", desc: "Making complaints, online discussions", pages: [65], active: true }
      ]
    },
    {
      unit: 10,
      title: "Unit 10: Compete and cooperate",
      subtitle: "Passives, articles · Vocabulary: Business & competitive sport",
      available: true,
      lessons: [
        { code: "10.1", title: "10.1 Business", desc: "Grammar (Passives), Vocabulary (Business)", pages: [66, 67], active: true },
        { code: "10.2", title: "10.2 Competitive sport", desc: "Grammar (Using articles: a/an, the, -), Vocabulary (Competitive sport)", pages: [68, 69], active: true },
        { code: "10.3", title: "10.3 Vocabulary development", desc: "Phrases with take and have", pages: [70], active: true },
        { code: "10.4", title: "10.4 Speaking and writing", desc: "Making recommendations, changes and differences", pages: [71, 72], active: true },
        { code: "10.5", title: "10.5 Review: Units 9 & 10", desc: "Grammar and vocabulary review", pages: [73], active: true }
      ]
    },
    {
      unit: 11,
      title: "Unit 11: Consequences",
      subtitle: "Unreal past conditionals, should/shouldn't have · Vocabulary: Crime",
      available: true,
      lessons: [
        { code: "11.1", title: "11.1 Crime", desc: "Grammar (Unreal past conditional), Vocabulary (Crime)", pages: [74, 75], active: true },
        { code: "11.2", title: "11.2 Social media behaviour", desc: "Grammar (should/shouldn't have), Vocabulary (Behaviour on social media)", pages: [76, 77], active: true },
        { code: "11.3", title: "11.3 Vocabulary development", desc: "Words with multiple meanings", pages: [78], active: true },
        { code: "11.4", title: "11.4 Speaking and writing", desc: "Decisions, apologizing", pages: [79], active: true }
      ]
    },
    {
      unit: 12,
      title: "Unit 12: Influence",
      subtitle: "Reported speech & questions · Vocabulary: Advertising and persuasion",
      available: true,
      lessons: [
        { code: "12.1", title: "12.1 Advertising", desc: "Grammar (Reported speech), Vocabulary (Advertising)", pages: [80, 81], active: true },
        { code: "12.2", title: "12.2 Persuading people", desc: "Grammar (Reported questions), Vocabulary (Persuading people)", pages: [82, 83], active: true },
        { code: "12.3", title: "12.3 Vocabulary development", desc: "Dependent prepositions", pages: [84], active: true },
        { code: "12.4", title: "12.4 Speaking and writing", desc: "Agreeing and disagreeing, advantages and disadvantages essay", pages: [85, 86], active: true },
        { code: "12.5", title: "12.5 Review: Units 11 & 12", desc: "Grammar and vocabulary review", pages: [87], active: true }
      ]
    }
  ];

  // 100% Calibrated Coordinates & Multi-Type Data for Unit 1.1 (Pages 4 and 5)
  // Listening exercises (4b, 7a, 7c, 7d) omitted strictly per requirements.
  WB.defaultInputs = {
    4: [
      // EXERCISE 1: Grammar · present simple, continuous & perfect (Lines 2 to 9) - TYPE: fill
      { id: "p4_ex1_2", type: "fill", page: 4, exercise: "1", label: "2", top: 61.2, left: 20.8, width: 22.0, height: 1.9, correct: "access or ACCESS" },
      { id: "p4_ex1_3", type: "fill", page: 4, exercise: "1", label: "3", top: 65.6, left: 12.0, width: 22.0, height: 1.9, correct: "is still changing or 's still changing" },
      { id: "p4_ex1_4", type: "fill", page: 4, exercise: "1", label: "4", top: 67.2, left: 28.5, width: 17.0, height: 1.9, correct: "check or CHECK" },
      { id: "p4_ex1_5", type: "fill", page: 4, exercise: "1", label: "5", top: 74.0, left: 13.5, width: 22.0, height: 1.9, correct: "is increasing or 's increasing" },
      { id: "p4_ex1_6", type: "fill", page: 4, exercise: "1", label: "6", top: 76.2, left: 24.5, width: 17.0, height: 1.9, correct: "have already uploaded or 've already uploaded" },
      { id: "p4_ex1_7", type: "fill", page: 4, exercise: "1", label: "7", top: 80.8, left: 19.5, width: 17.0, height: 1.9, correct: "is currently growing or 's currently growing" },
      { id: "p4_ex1_8", type: "fill", page: 4, exercise: "1", label: "8", top: 85.4, left: 19.5, width: 17.0, height: 1.9, correct: "has or HAS" },
      { id: "p4_ex1_9", type: "fill", page: 4, exercise: "1", label: "9", top: 91.5, left: 12.0, width: 17.0, height: 1.9, correct: "have just checked or 've just checked" },

      // EXERCISE 2: Cross out the incorrect word or phrase (Sentences 2 to 6) - TYPE: cross
      { id: "p4_ex2_2_a", type: "cross", page: 4, exercise: "2", group: "2.2", text: "this week", top: 31.6, left: 69.5, width: 6.8, height: 1.6, incorrect: false },
      { id: "p4_ex2_2_b", type: "cross", page: 4, exercise: "2", group: "2.2", text: "at the moment", top: 31.6, left: 78.0, width: 9.8, height: 1.6, incorrect: false },
      { id: "p4_ex2_2_c", type: "cross", page: 4, exercise: "2", group: "2.2", text: "all the time", top: 33.4, left: 56.4, width: 9.2, height: 1.6, incorrect: true },

      { id: "p4_ex2_3_a", type: "cross", page: 4, exercise: "2", group: "2.3", text: "already", top: 35.4, left: 59.8, width: 5.6, height: 1.6, incorrect: true },
      { id: "p4_ex2_3_b", type: "cross", page: 4, exercise: "2", group: "2.3", text: "always", top: 35.4, left: 66.2, width: 5.4, height: 1.6, incorrect: false },
      { id: "p4_ex2_3_c", type: "cross", page: 4, exercise: "2", group: "2.3", text: "usually", top: 35.4, left: 72.8, width: 5.6, height: 1.6, incorrect: false },

      { id: "p4_ex2_4_a", type: "cross", page: 4, exercise: "2", group: "2.4", text: "for a long time", top: 39.2, left: 51.5, width: 11.2, height: 1.6, incorrect: false },
      { id: "p4_ex2_4_b", type: "cross", page: 4, exercise: "2", group: "2.4", text: "lately", top: 39.2, left: 64.5, width: 5.0, height: 1.6, incorrect: false },
      { id: "p4_ex2_4_c", type: "cross", page: 4, exercise: "2", group: "2.4", text: "at the moment", top: 41.0, left: 54.0, width: 6.8, height: 1.6, incorrect: true },

      { id: "p4_ex2_5_a", type: "cross", page: 4, exercise: "2", group: "2.5", text: "every week", top: 44.8, left: 54.0, width: 5.0, height: 1.6, incorrect: false },
      { id: "p4_ex2_5_b", type: "cross", page: 4, exercise: "2", group: "2.5", text: "now", top: 44.8, left: 60.5, width: 4.2, height: 1.6, incorrect: true },
      { id: "p4_ex2_5_c", type: "cross", page: 4, exercise: "2", group: "2.5", text: "all the time", top: 44.8, left: 66.0, width: 9.0, height: 1.6, incorrect: false },

      { id: "p4_ex2_6_a", type: "cross", page: 4, exercise: "2", group: "2.6", text: "every time", top: 48.0, left: 54.0, width: 8.4, height: 1.6, incorrect: true },
      { id: "p4_ex2_6_b", type: "cross", page: 4, exercise: "2", group: "2.6", text: "these days", top: 48.0, left: 63.5, width: 8.4, height: 1.6, incorrect: false },
      { id: "p4_ex2_6_c", type: "cross", page: 4, exercise: "2", group: "2.6", text: "nowadays", top: 48.0, left: 72.8, width: 8.4, height: 1.6, incorrect: false },

      // EXERCISE 3: Choose correct options (LinkedIn card) - TYPE: choose
      { id: "p4_ex3_2_a", type: "choose", page: 4, exercise: "3", group: "3.2", text: "is increasing", top: 68.6, left: 70.8, width: 9.6, height: 1.6, correct: true },
      { id: "p4_ex3_2_b", type: "choose", page: 4, exercise: "3", group: "3.2", text: "increases", top: 70.5, left: 54.2, width: 7.2, height: 1.6, correct: false },

      { id: "p4_ex3_3_a", type: "choose", page: 4, exercise: "3", group: "3.3", text: "is having", top: 72.3, left: 69.8, width: 7.2, height: 1.6, correct: false },
      { id: "p4_ex3_3_b", type: "choose", page: 4, exercise: "3", group: "3.3", text: "has", top: 72.3, left: 78.4, width: 3.8, height: 1.6, correct: true },

      { id: "p4_ex3_4_a", type: "choose", page: 4, exercise: "3", group: "3.4", text: "have checked", top: 74.2, left: 76.5, width: 10.8, height: 1.6, correct: false },
      { id: "p4_ex3_4_b", type: "choose", page: 4, exercise: "3", group: "3.4", text: "check", top: 76.1, left: 54.2, width: 5.0, height: 1.6, correct: true },

      { id: "p4_ex3_5_a", type: "choose", page: 4, exercise: "3", group: "3.5", text: "use", top: 78.0, left: 74.2, width: 3.6, height: 1.6, correct: true },
      { id: "p4_ex3_5_b", type: "choose", page: 4, exercise: "3", group: "3.5", text: "have used", top: 78.0, left: 79.2, width: 8.8, height: 1.6, correct: false },

      { id: "p4_ex3_6_a", type: "choose", page: 4, exercise: "3", group: "3.6", text: "already visited", top: 85.4, left: 54.2, width: 6.8, height: 1.6, correct: false },
      { id: "p4_ex3_6_b", type: "choose", page: 4, exercise: "3", group: "3.6", text: "has already visited", top: 85.4, left: 63.8, width: 14.8, height: 1.6, correct: true },

      { id: "p4_ex3_7_a", type: "choose", page: 4, exercise: "3", group: "3.7", text: "include", top: 87.3, left: 67.2, width: 6.2, height: 1.6, correct: true },
      { id: "p4_ex3_7_b", type: "choose", page: 4, exercise: "3", group: "3.7", text: "are including", top: 87.3, left: 75.0, width: 10.2, height: 1.6, correct: false },

      { id: "p4_ex3_8_a", type: "choose", page: 4, exercise: "3", group: "3.8", text: "are taking place", top: 91.0, left: 65.5, width: 13.5, height: 1.6, correct: true },
      { id: "p4_ex3_8_b", type: "choose", page: 4, exercise: "3", group: "3.8", text: "have taken place", top: 91.0, left: 80.5, width: 14.0, height: 1.6, correct: false }
    ],
    5: [
      // EXERCISE 4a: Match questions 1-6 to answers a-f - TYPE: fill (Student types letter directly)
      { id: "p5_ex4_1", type: "fill", page: 5, exercise: "4a", label: "...", top: 13.6, left: 5.5, width: 2.8, height: 1.8, correct: "c" },
      { id: "p5_ex4_2", type: "fill", page: 5, exercise: "4a", label: "...", top: 15.4, left: 5.5, width: 2.8, height: 1.8, correct: "f" },
      { id: "p5_ex4_3", type: "fill", page: 5, exercise: "4a", label: "...", top: 17.2, left: 5.5, width: 2.8, height: 1.8, correct: "a" },
      { id: "p5_ex4_4", type: "fill", page: 5, exercise: "4a", label: "...", top: 19.0, left: 5.5, width: 2.8, height: 1.8, correct: "d" },
      { id: "p5_ex4_5", type: "fill", page: 5, exercise: "4a", label: "...", top: 20.8, left: 5.5, width: 2.8, height: 1.8, correct: "e" },
      { id: "p5_ex4_6", type: "fill", page: 5, exercise: "4a", label: "...", top: 22.7, left: 5.5, width: 2.8, height: 1.8, correct: "b" },

      // EXERCISE 5: Slash Caret Insertion (Put word in brackets in correct place) - TYPE: insert
      { id: "p5_ex5_2", type: "insert", page: 5, exercise: "5", group: "5.2", word: "out", top: 46.5, left: 23.5, width: 2.0, height: 1.6, correct: true },
      { id: "p5_ex5_3", type: "insert", page: 5, exercise: "5", group: "5.3", word: "on", top: 48.6, left: 11.2, width: 2.0, height: 1.6, correct: true },
      { id: "p5_ex5_4", type: "insert", page: 5, exercise: "5", group: "5.4", word: "in", top: 50.8, left: 23.5, width: 2.0, height: 1.6, correct: true },
      { id: "p5_ex5_5", type: "insert", page: 5, exercise: "5", group: "5.5", word: "with", top: 53.0, left: 14.5, width: 2.0, height: 1.6, correct: true },

      // EXERCISE 6: Complete opinions with have, help, keep, make, trust - TYPE: fill
      { id: "p5_ex6_2", type: "fill", page: 5, exercise: "6", label: "2", top: 64.6, left: 21.0, width: 10.0, height: 1.9, correct: "help or HELP" },
      { id: "p5_ex6_3", type: "fill", page: 5, exercise: "6", label: "3", top: 66.8, left: 13.0, width: 10.0, height: 1.9, correct: "trust or TRUST" },
      { id: "p5_ex6_4", type: "fill", page: 5, exercise: "6", label: "4", top: 73.5, left: 8.0, width: 10.0, height: 1.9, correct: "have or HAVE" },
      { id: "p5_ex6_5", type: "fill", page: 5, exercise: "6", label: "5", top: 74.5, left: 40.0, width: 10.0, height: 1.9, correct: "make or MAKE" },

      // EXERCISE 7b: Pronunciation rule (consonant / vowel) - TYPE: choose
      { id: "p5_ex7_1_a", type: "choose", page: 5, exercise: "7b", group: "7.1", text: "consonant", top: 57.0, left: 63.8, width: 7.2, height: 1.6, correct: true },
      { id: "p5_ex7_1_b", type: "choose", page: 5, exercise: "7b", group: "7.1", text: "vowel", top: 57.0, left: 72.0, width: 5.4, height: 1.6, correct: false },
      { id: "p5_ex7_2_a", type: "choose", page: 5, exercise: "7b", group: "7.2", text: "consonant", top: 59.0, left: 77.2, width: 7.2, height: 1.6, correct: false },
      { id: "p5_ex7_2_b", type: "choose", page: 5, exercise: "7b", group: "7.2", text: "vowel", top: 60.8, left: 53.6, width: 5.4, height: 1.6, correct: true }
    ],
    6: [
      // EXERCISE 1: Match special offers 1-4 to shop types a-d - TYPE: fill (Student types number directly)
      { id: "p6_ex1_a", type: "fill", page: 6, exercise: "1", label: "...", top: 68.6, left: 20.8, width: 2.8, height: 1.8, correct: "2" },
      { id: "p6_ex1_b", type: "fill", page: 6, exercise: "1", label: "...", top: 70.3, left: 22.2, width: 2.8, height: 1.8, correct: "4" },
      { id: "p6_ex1_d", type: "fill", page: 6, exercise: "1", label: "...", top: 70.4, left: 42.5, width: 2.8, height: 1.8, correct: "3" },

      // EXERCISE 2: Match the words in bold to definitions (TYPE: fill)
      { id: "p6_ex2_2", type: "fill", page: 6, exercise: "2", label: "2", top: 76.8, left: 30.5, width: 17.5, height: 1.9, correct: "discount or DISCOUNT" },
      { id: "p6_ex2_3", type: "fill", page: 6, exercise: "2", label: "3", top: 79.2, left: 30.5, width: 21.0, height: 1.9, correct: "two for the price of one" },
      { id: "p6_ex2_4", type: "fill", page: 6, exercise: "2", label: "4", top: 82.5, left: 30.5, width: 17.5, height: 1.9, correct: "customer or CUSTOMER" },
      { id: "p6_ex2_5", type: "fill", page: 6, exercise: "2", label: "5", top: 85.8, left: 30.5, width: 17.5, height: 1.9, correct: "half-price or half price" },
      { id: "p6_ex2_6", type: "fill", page: 6, exercise: "2", label: "6", top: 89.0, left: 30.5, width: 17.5, height: 1.9, correct: "deals or DEALS or bargains" },

      // EXERCISE 3: Shopping Holidays (Choose options 1 to 9) (TYPE: choose)
      { id: "p6_ex3_1_a", type: "choose", page: 6, exercise: "3", group: "3.1", text: "discount", top: 20.6, left: 57.0, width: 9.8, height: 1.6, correct: true },
      { id: "p6_ex3_1_b", type: "choose", page: 6, exercise: "3", group: "3.1", text: "shopping", top: 20.6, left: 68.8, width: 9.8, height: 1.6, correct: false },
      { id: "p6_ex3_1_c", type: "choose", page: 6, exercise: "3", group: "3.1", text: "consumer", top: 20.6, left: 80.5, width: 10.2, height: 1.6, correct: false },

      { id: "p6_ex3_2_a", type: "choose", page: 6, exercise: "3", group: "3.2", text: "shopping", top: 22.3, left: 57.0, width: 9.8, height: 1.6, correct: true },
      { id: "p6_ex3_2_b", type: "choose", page: 6, exercise: "3", group: "3.2", text: "offer", top: 22.3, left: 68.8, width: 9.8, height: 1.6, correct: false },
      { id: "p6_ex3_2_c", type: "choose", page: 6, exercise: "3", group: "3.2", text: "shopper", top: 22.3, left: 80.5, width: 10.2, height: 1.6, correct: false },

      { id: "p6_ex3_3_a", type: "choose", page: 6, exercise: "3", group: "3.3", text: "special offer", top: 24.0, left: 57.0, width: 10.5, height: 1.6, correct: false },
      { id: "p6_ex3_3_b", type: "choose", page: 6, exercise: "3", group: "3.3", text: "deal", top: 24.0, left: 68.8, width: 9.8, height: 1.6, correct: true },
      { id: "p6_ex3_3_c", type: "choose", page: 6, exercise: "3", group: "3.3", text: "item", top: 24.0, left: 80.5, width: 10.2, height: 1.6, correct: false },

      { id: "p6_ex3_4_a", type: "choose", page: 6, exercise: "3", group: "3.4", text: "purchases", top: 25.8, left: 57.0, width: 9.8, height: 1.6, correct: false },
      { id: "p6_ex3_4_b", type: "choose", page: 6, exercise: "3", group: "3.4", text: "customers", top: 25.8, left: 68.8, width: 10.5, height: 1.6, correct: true },
      { id: "p6_ex3_4_c", type: "choose", page: 6, exercise: "3", group: "3.4", text: "discounts", top: 25.8, left: 80.5, width: 10.2, height: 1.6, correct: false },

      { id: "p6_ex3_5_a", type: "choose", page: 6, exercise: "3", group: "3.5", text: "half-price", top: 27.5, left: 57.0, width: 9.8, height: 1.6, correct: true },
      { id: "p6_ex3_5_b", type: "choose", page: 6, exercise: "3", group: "3.5", text: "purchases", top: 27.5, left: 68.8, width: 9.8, height: 1.6, correct: false },
      { id: "p6_ex3_5_c", type: "choose", page: 6, exercise: "3", group: "3.5", text: "special offers", top: 27.5, left: 80.5, width: 12.0, height: 1.6, correct: false },

      { id: "p6_ex3_6_a", type: "choose", page: 6, exercise: "3", group: "3.6", text: "half-price", top: 29.2, left: 57.0, width: 9.8, height: 1.6, correct: false },
      { id: "p6_ex3_6_b", type: "choose", page: 6, exercise: "3", group: "3.6", text: "bargains", top: 29.2, left: 68.8, width: 9.8, height: 1.6, correct: true },
      { id: "p6_ex3_6_c", type: "choose", page: 6, exercise: "3", group: "3.6", text: "consumers", top: 29.2, left: 80.5, width: 10.5, height: 1.6, correct: false },

      { id: "p6_ex3_7_a", type: "choose", page: 6, exercise: "3", group: "3.7", text: "Deals", top: 31.0, left: 57.0, width: 9.8, height: 1.6, correct: false },
      { id: "p6_ex3_7_b", type: "choose", page: 6, exercise: "3", group: "3.7", text: "Items", top: 31.0, left: 68.8, width: 9.8, height: 1.6, correct: false },
      { id: "p6_ex3_7_c", type: "choose", page: 6, exercise: "3", group: "3.7", text: "Shoppers", top: 31.0, left: 80.5, width: 10.2, height: 1.6, correct: true },

      { id: "p6_ex3_8_a", type: "choose", page: 6, exercise: "3", group: "3.8", text: "half-price", top: 32.7, left: 57.0, width: 9.8, height: 1.6, correct: true },
      { id: "p6_ex3_8_b", type: "choose", page: 6, exercise: "3", group: "3.8", text: "bargain", top: 32.7, left: 68.8, width: 9.8, height: 1.6, correct: false },
      { id: "p6_ex3_8_c", type: "choose", page: 6, exercise: "3", group: "3.8", text: "offer", top: 32.7, left: 80.5, width: 10.2, height: 1.6, correct: false },

      { id: "p6_ex3_9_a", type: "choose", page: 6, exercise: "3", group: "3.9", text: "offers", top: 34.4, left: 57.0, width: 9.8, height: 1.6, correct: false },
      { id: "p6_ex3_9_b", type: "choose", page: 6, exercise: "3", group: "3.9", text: "consumers", top: 34.4, left: 68.8, width: 10.5, height: 1.6, correct: false },
      { id: "p6_ex3_9_c", type: "choose", page: 6, exercise: "3", group: "3.9", text: "purchases", top: 34.4, left: 80.5, width: 10.2, height: 1.6, correct: true }
    ],
    7: [
      // EXERCISE 4: Complete sentences with state verbs (Lines 2 to 5) (TYPE: fill)
      { id: "p7_ex4_2", type: "fill", page: 7, exercise: "4", label: "2", top: 20.5, left: 21.0, width: 14.5, height: 1.9, correct: "owned or OWNED" },
      { id: "p7_ex4_3", type: "fill", page: 7, exercise: "4", label: "3", top: 23.8, left: 19.5, width: 14.0, height: 1.9, correct: "tastes or TASTES" },
      { id: "p7_ex4_4", type: "fill", page: 7, exercise: "4", label: "4", top: 27.0, left: 34.0, width: 13.0, height: 1.9, correct: "seems or SEEMS" },
      { id: "p7_ex4_5", type: "fill", page: 7, exercise: "4", label: "5", top: 30.3, left: 20.5, width: 14.5, height: 1.9, correct: "understand or UNDERSTAND" },

      // EXERCISE 5: Choose the correct form of the verbs (Sentences 1 to 6) (TYPE: choose)
      { id: "p7_ex5_1_a", type: "choose", page: 7, exercise: "5", group: "5.1", text: "want", top: 39.6, left: 13.5, width: 6.8, height: 1.6, correct: true },
      { id: "p7_ex5_1_b", type: "choose", page: 7, exercise: "5", group: "5.1", text: "'m wanting", top: 39.6, left: 21.2, width: 11.2, height: 1.6, correct: false },

      { id: "p7_ex5_2_a", type: "choose", page: 7, exercise: "5", group: "5.2", text: "know", top: 41.3, left: 13.5, width: 7.0, height: 1.6, correct: true },
      { id: "p7_ex5_2_b", type: "choose", page: 7, exercise: "5", group: "5.2", text: "'m knowing", top: 41.3, left: 21.5, width: 11.5, height: 1.6, correct: false },

      { id: "p7_ex5_3_a", type: "choose", page: 7, exercise: "5", group: "5.3", text: "spend", top: 43.0, left: 13.5, width: 7.2, height: 1.6, correct: false },
      { id: "p7_ex5_3_b", type: "choose", page: 7, exercise: "5", group: "5.3", text: "'m spending", top: 43.0, left: 21.8, width: 12.2, height: 1.6, correct: true },

      { id: "p7_ex5_4_a", type: "choose", page: 7, exercise: "5", group: "5.4", text: "have", top: 48.0, left: 13.5, width: 6.5, height: 1.6, correct: false },
      { id: "p7_ex5_4_b", type: "choose", page: 7, exercise: "5", group: "5.4", text: "'m having", top: 48.0, left: 21.0, width: 11.0, height: 1.6, correct: true },

      { id: "p7_ex5_5_a", type: "choose", page: 7, exercise: "5", group: "5.5", text: "never buy", top: 51.0, left: 13.5, width: 10.0, height: 1.6, correct: true },
      { id: "p7_ex5_5_b", type: "choose", page: 7, exercise: "5", group: "5.5", text: "'m never buying", top: 51.0, left: 24.5, width: 14.5, height: 1.6, correct: false },

      { id: "p7_ex5_6_a", type: "choose", page: 7, exercise: "5", group: "5.6", text: "see", top: 54.3, left: 13.5, width: 5.5, height: 1.6, correct: true },
      { id: "p7_ex5_6_b", type: "choose", page: 7, exercise: "5", group: "5.6", text: "'m seeing", top: 54.3, left: 20.0, width: 10.5, height: 1.6, correct: false },

      // EXERCISE 6: Always true (A) or now (N)? - TYPE: fill (Student types A or N directly on underline)
      { id: "p7_ex6_2a", type: "fill", page: 7, exercise: "6", label: "A/N", top: 63.8, left: 41.5, width: 3.2, height: 1.8, correct: "a or A" },
      { id: "p7_ex6_2b", type: "fill", page: 7, exercise: "6", label: "A/N", top: 65.5, left: 38.5, width: 3.2, height: 1.8, correct: "n or N" },
      { id: "p7_ex6_3a", type: "fill", page: 7, exercise: "6", label: "A/N", top: 67.3, left: 43.5, width: 3.2, height: 1.8, correct: "n or N" },
      { id: "p7_ex6_3b", type: "fill", page: 7, exercise: "6", label: "A/N", top: 69.0, left: 33.5, width: 3.2, height: 1.8, correct: "a or A" },
      { id: "p7_ex6_4a", type: "fill", page: 7, exercise: "6", label: "A/N", top: 70.7, left: 42.0, width: 3.2, height: 1.8, correct: "n or N" },
      { id: "p7_ex6_4b", type: "fill", page: 7, exercise: "6", label: "A/N", top: 72.4, left: 31.5, width: 3.2, height: 1.8, correct: "a or A" },
      { id: "p7_ex6_5a", type: "fill", page: 7, exercise: "6", label: "A/N", top: 74.1, left: 42.5, width: 3.2, height: 1.8, correct: "a or A" },
      { id: "p7_ex6_5b", type: "fill", page: 7, exercise: "6", label: "A/N", top: 75.9, left: 38.0, width: 3.2, height: 1.8, correct: "n or N" },

      // EXERCISE 7: Compulsive buying error correction (TYPE: fill)
      { id: "p7_ex7_5", type: "fill", page: 7, exercise: "7", label: "L5", top: 34.5, left: 78.5, width: 14.0, height: 1.9, correct: "don't need or do not need" },
      { id: "p7_ex7_8", type: "fill", page: 7, exercise: "7", label: "L8", top: 42.1, left: 57.0, width: 14.0, height: 1.9, correct: "You want or you want" },
      { id: "p7_ex7_13", type: "fill", page: 7, exercise: "7", label: "L13", top: 56.6, left: 58.0, width: 14.0, height: 1.9, correct: "you know or You know" },
      { id: "p7_ex7_18", type: "fill", page: 7, exercise: "7", label: "L18", top: 71.2, left: 66.0, width: 12.0, height: 1.9, correct: "seem or SEEM" }
    ],
    8: [
      // EXERCISE 1: Noun suffixes (TYPE: fill)
      { id: "p8_ex1_1", type: "fill", page: 8, exercise: "1", label: "-ity", top: 27.3, left: 22.0, width: 14.0, height: 1.9, correct: "security or SECURITY" },
      { id: "p8_ex1_2a", type: "fill", page: 8, exercise: "1", label: "-tion(1)", top: 29.1, left: 18.0, width: 14.0, height: 1.9, correct: "communication or information" },
      { id: "p8_ex1_2b", type: "fill", page: 8, exercise: "1", label: "-tion(2)", top: 29.1, left: 33.0, width: 14.0, height: 1.9, correct: "information or communication" },
      { id: "p8_ex1_3a", type: "fill", page: 8, exercise: "1", label: "-ment(1)", top: 30.9, left: 18.0, width: 14.0, height: 1.9, correct: "achievement or government" },
      { id: "p8_ex1_3b", type: "fill", page: 8, exercise: "1", label: "-ment(2)", top: 30.9, left: 33.0, width: 14.0, height: 1.9, correct: "government or achievement" },
      { id: "p8_ex1_4a", type: "fill", page: 8, exercise: "1", label: "-ship(1)", top: 32.7, left: 18.0, width: 14.0, height: 1.9, correct: "friendship or membership" },
      { id: "p8_ex1_4b", type: "fill", page: 8, exercise: "1", label: "-ship(2)", top: 32.7, left: 33.0, width: 14.0, height: 1.9, correct: "membership or friendship" },

      // EXERCISE 2: Complete sentences (TYPE: fill)
      { id: "p8_ex2_2", type: "fill", page: 8, exercise: "2", label: "2", top: 42.1, left: 40.5, width: 12.0, height: 1.9, correct: "security or SECURITY" },
      { id: "p8_ex2_3", type: "fill", page: 8, exercise: "2", label: "3", top: 46.8, left: 26.5, width: 14.0, height: 1.9, correct: "information or INFORMATION" },
      { id: "p8_ex2_4", type: "fill", page: 8, exercise: "2", label: "4", top: 48.5, left: 27.0, width: 9.0, height: 1.9, correct: "ability or ABILITY" },
      { id: "p8_ex2_5", type: "fill", page: 8, exercise: "2", label: "5", top: 51.8, left: 35.0, width: 9.0, height: 1.9, correct: "friendship or FRIENDSHIP" },

      // EXERCISE 3: Children and the internet article (TYPE: fill)
      { id: "p8_ex3_2", type: "fill", page: 8, exercise: "3", label: "2", top: 73.1, left: 20.0, width: 9.2, height: 1.9, correct: "improvements or improvement" },
      { id: "p8_ex3_3", type: "fill", page: 8, exercise: "3", label: "3", top: 76.0, left: 30.0, width: 8.5, height: 1.9, correct: "ability or abilities" },
      { id: "p8_ex3_4", type: "fill", page: 8, exercise: "3", label: "4", top: 81.0, left: 12.5, width: 9.0, height: 1.9, correct: "development or DEVELOPMENT" },
      { id: "p8_ex3_5", type: "fill", page: 8, exercise: "3", label: "5", top: 85.2, left: 12.5, width: 9.0, height: 1.9, correct: "imagination or imaginations" },
      { id: "p8_ex3_6", type: "fill", page: 8, exercise: "3", label: "6", top: 88.7, left: 12.5, width: 9.0, height: 1.9, correct: "relationships or relationship" },
      { id: "p8_ex3_7", type: "fill", page: 8, exercise: "3", label: "7", top: 90.2, left: 23.5, width: 9.0, height: 1.9, correct: "friendships or friendship" },

      // EXERCISE 5a: Friendships Review (TYPE: fill)
      { id: "p8_ex5_2", type: "fill", page: 8, exercise: "5a", label: "2", top: 56.6, left: 60.5, width: 8.5, height: 1.8, correct: "touch or TOUCH" },
      { id: "p8_ex5_3", type: "fill", page: 8, exercise: "5a", label: "3", top: 58.2, left: 59.0, width: 8.5, height: 1.8, correct: "on or ON" },
      { id: "p8_ex5_5", type: "fill", page: 8, exercise: "5a", label: "5", top: 61.4, left: 57.0, width: 8.5, height: 1.8, correct: "have or HAVE" },
      { id: "p8_ex5_6", type: "fill", page: 8, exercise: "5a", label: "6", top: 63.0, left: 57.0, width: 8.5, height: 1.8, correct: "help or HELP" },
      { id: "p8_ex5_7", type: "fill", page: 8, exercise: "5a", label: "7", top: 64.6, left: 57.0, width: 8.5, height: 1.8, correct: "keep or KEEP" },
      { id: "p8_ex5_8", type: "fill", page: 8, exercise: "5a", label: "8", top: 66.1, left: 57.0, width: 8.5, height: 1.8, correct: "make or MAKE" },
      { id: "p8_ex5_9", type: "fill", page: 8, exercise: "5a", label: "9", top: 67.7, left: 60.5, width: 8.5, height: 1.8, correct: "up or UP" }
    ]
,
    9: [
      {
            "id": "p9_ex1b_b",
            "type": "fill",
            "page": 9,
            "exercise": "1b",
            "label": "some",
            "top": 30.7,
            "left": 14.5,
            "width": 8.5,
            "height": 1.8,
            "correct": "some or SOME"
      },
      {
            "id": "p9_ex1b_c",
            "type": "fill",
            "page": 9,
            "exercise": "1b",
            "label": "personally",
            "top": 32.4,
            "left": 15.5,
            "width": 9,
            "height": 1.8,
            "correct": "personally or PERSONALLY"
      },
      {
            "id": "p9_ex1b_d",
            "type": "fill",
            "page": 9,
            "exercise": "1b",
            "label": "me",
            "top": 34.1,
            "left": 30.5,
            "width": 7,
            "height": 1.8,
            "correct": "me or ME"
      },
      {
            "id": "p9_ex1b_e",
            "type": "fill",
            "page": 9,
            "exercise": "1b",
            "label": "think",
            "top": 35.8,
            "left": 18,
            "width": 8.5,
            "height": 1.8,
            "correct": "think or THINK"
      },
      {
            "id": "p9_ex1b_f",
            "type": "fill",
            "page": 9,
            "exercise": "1b",
            "label": "convinced",
            "top": 37.6,
            "left": 13.5,
            "width": 9,
            "height": 1.8,
            "correct": "convinced or CONVINCED"
      },
      {
            "id": "p9_ex1b_g",
            "type": "fill",
            "page": 9,
            "exercise": "1b",
            "label": "definitely",
            "top": 39.3,
            "left": 12,
            "width": 9,
            "height": 1.8,
            "correct": "definitely or DEFINITELY"
      },
      {
            "id": "p9_ex1b_h",
            "type": "fill",
            "page": 9,
            "exercise": "1b",
            "label": "far",
            "top": 41,
            "left": 17,
            "width": 7.5,
            "height": 1.8,
            "correct": "far or FAR"
      },
      {
            "id": "p9_ex3_1",
            "type": "fill",
            "page": 9,
            "exercise": "3",
            "label": "1",
            "top": 62.2,
            "left": 15.5,
            "width": 8,
            "height": 1.8,
            "correct": "How or how"
      },
      {
            "id": "p9_ex3_2",
            "type": "fill",
            "page": 9,
            "exercise": "3",
            "label": "2",
            "top": 62.2,
            "left": 27.5,
            "width": 8,
            "height": 1.8,
            "correct": "about or ABOUT"
      },
      {
            "id": "p9_ex3_3",
            "type": "fill",
            "page": 9,
            "exercise": "3",
            "label": "3",
            "top": 64,
            "left": 21,
            "width": 7.5,
            "height": 1.8,
            "correct": "you or YOU"
      },
      {
            "id": "p9_ex3_4",
            "type": "fill",
            "page": 9,
            "exercise": "3",
            "label": "4",
            "top": 65.8,
            "left": 21,
            "width": 7.5,
            "height": 1.8,
            "correct": "me or ME"
      },
      {
            "id": "p9_ex3_5",
            "type": "fill",
            "page": 9,
            "exercise": "3",
            "label": "5",
            "top": 67.5,
            "left": 14.5,
            "width": 7,
            "height": 1.8,
            "correct": "to or TO"
      },
      {
            "id": "p9_ex3_6",
            "type": "fill",
            "page": 9,
            "exercise": "3",
            "label": "6",
            "top": 69.3,
            "left": 16,
            "width": 8,
            "height": 1.8,
            "correct": "don't or dont"
      },
      {
            "id": "p9_ex3_7",
            "type": "fill",
            "page": 9,
            "exercise": "3",
            "label": "7",
            "top": 69.3,
            "left": 28.5,
            "width": 8,
            "height": 1.8,
            "correct": "think or THINK"
      },
      {
            "id": "p9_ex3_8",
            "type": "fill",
            "page": 9,
            "exercise": "3",
            "label": "8",
            "top": 71,
            "left": 14.5,
            "width": 7.5,
            "height": 1.8,
            "correct": "am or 'm"
      },
      {
            "id": "p9_ex3_9",
            "type": "fill",
            "page": 9,
            "exercise": "3",
            "label": "9",
            "top": 72.8,
            "left": 17.5,
            "width": 7.5,
            "height": 1.8,
            "correct": "far or FAR"
      },
      {
            "id": "p9_ex3_10",
            "type": "fill",
            "page": 9,
            "exercise": "3",
            "label": "10",
            "top": 72.8,
            "left": 33,
            "width": 10,
            "height": 1.8,
            "correct": "concerned or CONCERNED"
      }
],
    10: [
      {
            "id": "p10_ex1a_1_a",
            "type": "choose",
            "page": 10,
            "exercise": "1a",
            "group": "1a.1",
            "text": "have you ever been",
            "top": 34.8,
            "left": 13.5,
            "width": 17.5,
            "height": 1.6,
            "correct": true
      },
      {
            "id": "p10_ex1a_1_b",
            "type": "choose",
            "page": 10,
            "exercise": "1a",
            "group": "1a.1",
            "text": "were you ever",
            "top": 34.8,
            "left": 32,
            "width": 13.5,
            "height": 1.6,
            "correct": false
      },
      {
            "id": "p10_ex1a_2_a",
            "type": "choose",
            "page": 10,
            "exercise": "1a",
            "group": "1a.2",
            "text": "did you ever feel",
            "top": 39.8,
            "left": 13.5,
            "width": 15.5,
            "height": 1.6,
            "correct": false
      },
      {
            "id": "p10_ex1a_2_b",
            "type": "choose",
            "page": 10,
            "exercise": "1a",
            "group": "1a.2",
            "text": "do you ever feel",
            "top": 39.8,
            "left": 30,
            "width": 15.5,
            "height": 1.6,
            "correct": true
      },
      {
            "id": "p10_ex1a_3_a",
            "type": "choose",
            "page": 10,
            "exercise": "1a",
            "group": "1a.3",
            "text": "have you ever had",
            "top": 44.8,
            "left": 13.5,
            "width": 17,
            "height": 1.6,
            "correct": true
      },
      {
            "id": "p10_ex1a_3_b",
            "type": "choose",
            "page": 10,
            "exercise": "1a",
            "group": "1a.3",
            "text": "did you ever have",
            "top": 44.8,
            "left": 31.5,
            "width": 17,
            "height": 1.6,
            "correct": false
      },
      {
            "id": "p10_ex1a_4_a",
            "type": "choose",
            "page": 10,
            "exercise": "1a",
            "group": "1a.4",
            "text": "do you ever wonder",
            "top": 51.5,
            "left": 13.5,
            "width": 18,
            "height": 1.6,
            "correct": true
      },
      {
            "id": "p10_ex1a_4_b",
            "type": "choose",
            "page": 10,
            "exercise": "1a",
            "group": "1a.4",
            "text": "are you ever wondering",
            "top": 51.5,
            "left": 32.5,
            "width": 20,
            "height": 1.6,
            "correct": false
      },
      {
            "id": "p10_ex1a_5_a",
            "type": "choose",
            "page": 10,
            "exercise": "1a",
            "group": "1a.5",
            "text": "did you ever see",
            "top": 58.2,
            "left": 13.5,
            "width": 15.5,
            "height": 1.6,
            "correct": false
      },
      {
            "id": "p10_ex1a_5_b",
            "type": "choose",
            "page": 10,
            "exercise": "1a",
            "group": "1a.5",
            "text": "have you ever seen",
            "top": 58.2,
            "left": 30,
            "width": 17.5,
            "height": 1.6,
            "correct": true
      },
      {
            "id": "p10_ex1a_6_a",
            "type": "choose",
            "page": 10,
            "exercise": "1a",
            "group": "1a.6",
            "text": "do you ever think",
            "top": 63.2,
            "left": 13.5,
            "width": 16.5,
            "height": 1.6,
            "correct": true
      },
      {
            "id": "p10_ex1a_6_b",
            "type": "choose",
            "page": 10,
            "exercise": "1a",
            "group": "1a.6",
            "text": "did you ever think",
            "top": 63.2,
            "left": 31,
            "width": 16.5,
            "height": 1.6,
            "correct": false
      },
      {
            "id": "p10_ex1a_7_a",
            "type": "choose",
            "page": 10,
            "exercise": "1a",
            "group": "1a.7",
            "text": "have you ever had",
            "top": 70,
            "left": 13.5,
            "width": 17,
            "height": 1.6,
            "correct": true
      },
      {
            "id": "p10_ex1a_7_b",
            "type": "choose",
            "page": 10,
            "exercise": "1a",
            "group": "1a.7",
            "text": "did you ever have",
            "top": 70,
            "left": 31.5,
            "width": 17,
            "height": 1.6,
            "correct": false
      },
      {
            "id": "p10_ex2a_b",
            "type": "fill",
            "page": 10,
            "exercise": "2a",
            "label": "remember",
            "top": 53.8,
            "left": 58,
            "width": 9,
            "height": 1.8,
            "correct": "remember or REMEMBER"
      },
      {
            "id": "p10_ex2a_c",
            "type": "fill",
            "page": 10,
            "exercise": "2a",
            "label": "expecting",
            "top": 58.6,
            "left": 81.5,
            "width": 10.5,
            "height": 1.8,
            "correct": "expecting or EXPECTING"
      },
      {
            "id": "p10_ex2a_d",
            "type": "fill",
            "page": 10,
            "exercise": "2a",
            "label": "reminded",
            "top": 62,
            "left": 74,
            "width": 10,
            "height": 1.8,
            "correct": "reminded or REMINDED"
      },
      {
            "id": "p10_ex2a_e",
            "type": "fill",
            "page": 10,
            "exercise": "2a",
            "label": "believe",
            "top": 65.5,
            "left": 63.5,
            "width": 9,
            "height": 1.8,
            "correct": "believe or BELIEVE"
      },
      {
            "id": "p10_ex2a_f",
            "type": "fill",
            "page": 10,
            "exercise": "2a",
            "label": "realize",
            "top": 70,
            "left": 74,
            "width": 9,
            "height": 1.8,
            "correct": "realize or REALIZE"
      },
      {
            "id": "p10_ex2a_g",
            "type": "fill",
            "page": 10,
            "exercise": "2a",
            "label": "wonder",
            "top": 73.5,
            "left": 60,
            "width": 9,
            "height": 1.8,
            "correct": "wonder or WONDER"
      }
],
    11: [
      {
            "id": "p11_ex3b_1",
            "type": "fill",
            "page": 11,
            "exercise": "3b",
            "label": "1",
            "top": 25.5,
            "left": 28.5,
            "width": 3.2,
            "height": 1.8,
            "correct": "d or D"
      },
      {
            "id": "p11_ex3b_2",
            "type": "fill",
            "page": 11,
            "exercise": "3b",
            "label": "2",
            "top": 33.9,
            "left": 24.5,
            "width": 3.2,
            "height": 1.8,
            "correct": "e or E"
      },
      {
            "id": "p11_ex3b_3",
            "type": "fill",
            "page": 11,
            "exercise": "3b",
            "label": "3",
            "top": 38.5,
            "left": 18,
            "width": 3.2,
            "height": 1.8,
            "correct": "b or B"
      },
      {
            "id": "p11_ex3b_4",
            "type": "fill",
            "page": 11,
            "exercise": "3b",
            "label": "4",
            "top": 40,
            "left": 19.5,
            "width": 3.2,
            "height": 1.8,
            "correct": "a or A"
      },
      {
            "id": "p11_ex3b_5",
            "type": "fill",
            "page": 11,
            "exercise": "3b",
            "label": "5",
            "top": 50,
            "left": 18,
            "width": 3.2,
            "height": 1.8,
            "correct": "c or C"
      },
      {
            "id": "p11_ex4_1",
            "type": "fill",
            "page": 11,
            "exercise": "4",
            "label": "1",
            "top": 21,
            "left": 71,
            "width": 16,
            "height": 1.8,
            "correct": "had always dreamt or had always dreamed"
      },
      {
            "id": "p11_ex4_2",
            "type": "fill",
            "page": 11,
            "exercise": "4",
            "label": "2",
            "top": 22.8,
            "left": 71,
            "width": 14,
            "height": 1.8,
            "correct": "had taken or HAD TAKEN"
      },
      {
            "id": "p11_ex4_3",
            "type": "fill",
            "page": 11,
            "exercise": "4",
            "label": "3",
            "top": 24.5,
            "left": 71,
            "width": 12,
            "height": 1.8,
            "correct": "missed or MISSED"
      },
      {
            "id": "p11_ex4_4",
            "type": "fill",
            "page": 11,
            "exercise": "4",
            "label": "4",
            "top": 26.2,
            "left": 71,
            "width": 14,
            "height": 1.8,
            "correct": "were waiting or WERE WAITING"
      },
      {
            "id": "p11_ex4_5",
            "type": "fill",
            "page": 11,
            "exercise": "4",
            "label": "5",
            "top": 28,
            "left": 71,
            "width": 14,
            "height": 1.8,
            "correct": "disappeared or DISAPPEARED"
      },
      {
            "id": "p11_ex4_6",
            "type": "fill",
            "page": 11,
            "exercise": "4",
            "label": "6",
            "top": 29.8,
            "left": 71,
            "width": 14,
            "height": 1.8,
            "correct": "had taken or HAD TAKEN"
      },
      {
            "id": "p11_ex4_7",
            "type": "fill",
            "page": 11,
            "exercise": "4",
            "label": "7",
            "top": 31.5,
            "left": 71,
            "width": 14,
            "height": 1.8,
            "correct": "were going or WERE GOING"
      },
      {
            "id": "p11_ex4_8",
            "type": "fill",
            "page": 11,
            "exercise": "4",
            "label": "8",
            "top": 33.2,
            "left": 71,
            "width": 14,
            "height": 1.8,
            "correct": "hadn't seen or had not seen"
      },
      {
            "id": "p11_ex4_9",
            "type": "fill",
            "page": 11,
            "exercise": "4",
            "label": "9",
            "top": 35,
            "left": 71,
            "width": 12,
            "height": 1.8,
            "correct": "rained or RAINED"
      },
      {
            "id": "p11_ex4_10",
            "type": "fill",
            "page": 11,
            "exercise": "4",
            "label": "10",
            "top": 36.8,
            "left": 71,
            "width": 16,
            "height": 1.8,
            "correct": "had already gone or 'd already gone"
      },
      {
            "id": "p11_ex4_11",
            "type": "fill",
            "page": 11,
            "exercise": "4",
            "label": "11",
            "top": 38.5,
            "left": 71,
            "width": 14,
            "height": 1.8,
            "correct": "were watching or WERE WATCHING"
      }
],
    12: [
      {
            "id": "p12_ex2_1",
            "type": "fill",
            "page": 12,
            "exercise": "2",
            "label": "1",
            "top": 48,
            "left": 57,
            "width": 12,
            "height": 1.8,
            "correct": "during or DURING"
      },
      {
            "id": "p12_ex2_2",
            "type": "fill",
            "page": 12,
            "exercise": "2",
            "label": "2",
            "top": 52,
            "left": 57,
            "width": 10,
            "height": 1.8,
            "correct": "until or UNTIL"
      },
      {
            "id": "p12_ex2_3",
            "type": "fill",
            "page": 12,
            "exercise": "2",
            "label": "3",
            "top": 56,
            "left": 57,
            "width": 14,
            "height": 1.8,
            "correct": "As soon as or as soon as"
      },
      {
            "id": "p12_ex2_4",
            "type": "fill",
            "page": 12,
            "exercise": "2",
            "label": "4",
            "top": 60,
            "left": 57,
            "width": 10,
            "height": 1.8,
            "correct": "while or WHILE"
      },
      {
            "id": "p12_ex2_5",
            "type": "fill",
            "page": 12,
            "exercise": "2",
            "label": "5",
            "top": 64,
            "left": 57,
            "width": 14,
            "height": 1.8,
            "correct": "Meanwhile or in the meanwhile"
      },
      {
            "id": "p12_ex2_6",
            "type": "fill",
            "page": 12,
            "exercise": "2",
            "label": "6",
            "top": 68,
            "left": 57,
            "width": 14,
            "height": 1.8,
            "correct": "By the time or by the time"
      }
],
    13: [
      {
            "id": "p13_ex5a_1_a",
            "type": "choose",
            "page": 13,
            "exercise": "5a",
            "group": "5a.1",
            "text": "announced",
            "top": 40.2,
            "left": 24.5,
            "width": 12,
            "height": 1.6,
            "correct": true
      },
      {
            "id": "p13_ex5a_1_b",
            "type": "choose",
            "page": 13,
            "exercise": "5a",
            "group": "5a.1",
            "text": "told",
            "top": 40.2,
            "left": 38,
            "width": 8.5,
            "height": 1.6,
            "correct": false
      },
      {
            "id": "p13_ex5a_2_a",
            "type": "choose",
            "page": 13,
            "exercise": "5a",
            "group": "5a.2",
            "text": "admitted",
            "top": 45.2,
            "left": 23.5,
            "width": 11.5,
            "height": 1.6,
            "correct": false
      },
      {
            "id": "p13_ex5a_2_b",
            "type": "choose",
            "page": 13,
            "exercise": "5a",
            "group": "5a.2",
            "text": "interviewed",
            "top": 45.2,
            "left": 36.5,
            "width": 14,
            "height": 1.6,
            "correct": true
      },
      {
            "id": "p13_ex5a_3_a",
            "type": "choose",
            "page": 13,
            "exercise": "5a",
            "group": "5a.3",
            "text": "claimed",
            "top": 51.5,
            "left": 24.5,
            "width": 10.5,
            "height": 1.6,
            "correct": true
      },
      {
            "id": "p13_ex5a_3_b",
            "type": "choose",
            "page": 13,
            "exercise": "5a",
            "group": "5a.3",
            "text": "invented",
            "top": 51.5,
            "left": 36.5,
            "width": 11.5,
            "height": 1.6,
            "correct": false
      },
      {
            "id": "p13_ex5a_4_a",
            "type": "choose",
            "page": 13,
            "exercise": "5a",
            "group": "5a.4",
            "text": "reported",
            "top": 57.8,
            "left": 23.5,
            "width": 11.5,
            "height": 1.6,
            "correct": true
      },
      {
            "id": "p13_ex5a_4_b",
            "type": "choose",
            "page": 13,
            "exercise": "5a",
            "group": "5a.4",
            "text": "informed",
            "top": 57.8,
            "left": 36.5,
            "width": 12,
            "height": 1.6,
            "correct": false
      },
      {
            "id": "p13_ex5a_5_a",
            "type": "choose",
            "page": 13,
            "exercise": "5a",
            "group": "5a.5",
            "text": "claimed",
            "top": 66,
            "left": 23.5,
            "width": 10.5,
            "height": 1.6,
            "correct": false
      },
      {
            "id": "p13_ex5a_5_b",
            "type": "choose",
            "page": 13,
            "exercise": "5a",
            "group": "5a.5",
            "text": "invented",
            "top": 66,
            "left": 35.5,
            "width": 11.5,
            "height": 1.6,
            "correct": true
      }
],
    14: [
      {
            "id": "p14_ex1_2_a",
            "type": "choose",
            "page": 14,
            "exercise": "1",
            "group": "1.2",
            "text": "Fortunately",
            "top": 33.7,
            "left": 12.5,
            "width": 13,
            "height": 1.6,
            "correct": false
      },
      {
            "id": "p14_ex1_2_b",
            "type": "choose",
            "page": 14,
            "exercise": "1",
            "group": "1.2",
            "text": "Curiously",
            "top": 33.7,
            "left": 26.5,
            "width": 12,
            "height": 1.6,
            "correct": true
      },
      {
            "id": "p14_ex1_3_a",
            "type": "choose",
            "page": 14,
            "exercise": "1",
            "group": "1.3",
            "text": "Remarkably",
            "top": 38.5,
            "left": 12.5,
            "width": 13.5,
            "height": 1.6,
            "correct": true
      },
      {
            "id": "p14_ex1_3_b",
            "type": "choose",
            "page": 14,
            "exercise": "1",
            "group": "1.3",
            "text": "Personally",
            "top": 38.5,
            "left": 27,
            "width": 12.5,
            "height": 1.6,
            "correct": false
      },
      {
            "id": "p14_ex1_4_a",
            "type": "choose",
            "page": 14,
            "exercise": "1",
            "group": "1.4",
            "text": "Fortunately",
            "top": 43.3,
            "left": 12.5,
            "width": 13,
            "height": 1.6,
            "correct": true
      },
      {
            "id": "p14_ex1_4_b",
            "type": "choose",
            "page": 14,
            "exercise": "1",
            "group": "1.4",
            "text": "Sadly",
            "top": 43.3,
            "left": 26.5,
            "width": 8.5,
            "height": 1.6,
            "correct": false
      },
      {
            "id": "p14_ex1_5_a",
            "type": "choose",
            "page": 14,
            "exercise": "1",
            "group": "1.5",
            "text": "Amazingly",
            "top": 49.6,
            "left": 35,
            "width": 12.5,
            "height": 1.6,
            "correct": false
      },
      {
            "id": "p14_ex1_5_b",
            "type": "choose",
            "page": 14,
            "exercise": "1",
            "group": "1.5",
            "text": "Naturally",
            "top": 49.6,
            "left": 48.5,
            "width": 11.5,
            "height": 1.6,
            "correct": true
      },
      {
            "id": "p14_ex1_6_a",
            "type": "choose",
            "page": 14,
            "exercise": "1",
            "group": "1.6",
            "text": "interestingly",
            "top": 57.5,
            "left": 29.5,
            "width": 14,
            "height": 1.6,
            "correct": true
      },
      {
            "id": "p14_ex1_6_b",
            "type": "choose",
            "page": 14,
            "exercise": "1",
            "group": "1.6",
            "text": "unfortunately",
            "top": 57.5,
            "left": 44.5,
            "width": 15,
            "height": 1.6,
            "correct": false
      }
],
    15: [
  {
    "id": "p15_ex2_2",
    "type": "fill",
    "page": 15,
    "exercise": "2",
    "label": "2",
    "top": 40.3,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "Really or really"
  },
  {
    "id": "p15_ex2_3",
    "type": "fill",
    "page": 15,
    "exercise": "2",
    "label": "3",
    "top": 42,
    "left": 37,
    "width": 12,
    "height": 1.8,
    "correct": "believe"
  },
  {
    "id": "p15_ex2_4",
    "type": "fill",
    "page": 15,
    "exercise": "2",
    "label": "4",
    "top": 46.8,
    "left": 14.8,
    "width": 9,
    "height": 1.8,
    "correct": "amazing"
  },
  {
    "id": "p15_ex2_5",
    "type": "fill",
    "page": 15,
    "exercise": "2",
    "label": "5",
    "top": 53.7,
    "left": 10.9,
    "width": 10,
    "height": 1.8,
    "correct": "Someone or someone"
  },
  {
    "id": "p15_ex2_6",
    "type": "fill",
    "page": 15,
    "exercise": "2",
    "label": "6",
    "top": 63.1,
    "left": 10.9,
    "width": 9,
    "height": 1.8,
    "correct": "That or that"
  },
  {
    "id": "p15_ex2_7",
    "type": "fill",
    "page": 15,
    "exercise": "2",
    "label": "7",
    "top": 68.1,
    "left": 19,
    "width": 8.5,
    "height": 1.8,
    "correct": "mean"
  },
  {
    "id": "p15_ex2_8",
    "type": "fill",
    "page": 15,
    "exercise": "2",
    "label": "8",
    "top": 73.1,
    "left": 14,
    "width": 8,
    "height": 1.8,
    "correct": "way"
  },
  {
    "id": "p15_ex4_2",
    "type": "fill",
    "page": 15,
    "exercise": "4",
    "label": "2",
    "top": 45.4,
    "left": 69,
    "width": 8.5,
    "height": 1.8,
    "correct": "while"
  },
  {
    "id": "p15_ex4_3",
    "type": "fill",
    "page": 15,
    "exercise": "4",
    "label": "3",
    "top": 50.1,
    "left": 73,
    "width": 9,
    "height": 1.8,
    "correct": "straightaway"
  },
  {
    "id": "p15_ex4_4",
    "type": "fill",
    "page": 15,
    "exercise": "4",
    "label": "4",
    "top": 53.3,
    "left": 56.5,
    "width": 10,
    "height": 1.8,
    "correct": "instant"
  },
  {
    "id": "p15_ex4_5",
    "type": "fill",
    "page": 15,
    "exercise": "4",
    "label": "5",
    "top": 61.1,
    "left": 73,
    "width": 9,
    "height": 1.8,
    "correct": "just"
  },
  {
    "id": "p15_ex4_6",
    "type": "fill",
    "page": 15,
    "exercise": "4",
    "label": "6",
    "top": 64.4,
    "left": 79.8,
    "width": 9,
    "height": 1.8,
    "correct": "soon"
  },
  {
    "id": "p15_ex4_7",
    "type": "fill",
    "page": 15,
    "exercise": "4",
    "label": "7",
    "top": 67.5,
    "left": 61.8,
    "width": 9,
    "height": 1.8,
    "correct": "end"
  }
],
    16: [
  {
    "id": "p16_ex1_1",
    "type": "choose",
    "page": 16,
    "exercise": "1",
    "group": "p16_ex1",
    "text": "1 a romantic love story",
    "top": 71.4,
    "left": 10.5,
    "width": 22,
    "height": 1.7,
    "correct": false
  },
  {
    "id": "p16_ex1_2",
    "type": "choose",
    "page": 16,
    "exercise": "1",
    "group": "p16_ex1",
    "text": "2 a crime story set in modern times",
    "top": 73.2,
    "left": 10.5,
    "width": 25,
    "height": 1.7,
    "correct": false
  },
  {
    "id": "p16_ex1_3",
    "type": "choose",
    "page": 16,
    "exercise": "1",
    "group": "p16_ex1",
    "text": "3 a historical adventure story",
    "top": 74.9,
    "left": 10.5,
    "width": 23,
    "height": 1.7,
    "correct": true
  },
  {
    "id": "p16_ex1_4",
    "type": "choose",
    "page": 16,
    "exercise": "1",
    "group": "p16_ex1",
    "text": "4 a true story about a rebellion",
    "top": 76.6,
    "left": 10.5,
    "width": 23,
    "height": 1.7,
    "correct": false
  }
],
    17: [
  {
    "id": "p17_ex1_2",
    "type": "fill",
    "page": 17,
    "exercise": "1",
    "label": "2",
    "top": 27.5,
    "left": 34,
    "width": 14,
    "height": 1.8,
    "correct": "have grown or 've grown"
  },
  {
    "id": "p17_ex1_3",
    "type": "fill",
    "page": 17,
    "exercise": "1",
    "label": "3",
    "top": 30.8,
    "left": 38,
    "width": 10,
    "height": 1.8,
    "correct": "was having"
  },
  {
    "id": "p17_ex1_4",
    "type": "fill",
    "page": 17,
    "exercise": "1",
    "label": "4",
    "top": 35.6,
    "left": 40.5,
    "width": 8,
    "height": 1.8,
    "correct": "had borrowed or 'd borrowed"
  },
  {
    "id": "p17_ex1_5",
    "type": "fill",
    "page": 17,
    "exercise": "1",
    "label": "5",
    "top": 38.9,
    "left": 28,
    "width": 14.5,
    "height": 1.8,
    "correct": "spend"
  },
  {
    "id": "p17_ex1_6",
    "type": "fill",
    "page": 17,
    "exercise": "1",
    "label": "6",
    "top": 43.7,
    "left": 16,
    "width": 14.5,
    "height": 1.8,
    "correct": "is constantly developing or 's constantly developing"
  },
  {
    "id": "p17_ex2_3",
    "type": "fill",
    "page": 17,
    "exercise": "2",
    "label": "3",
    "top": 72.5,
    "left": 13.5,
    "width": 8.5,
    "height": 1.8,
    "correct": "own"
  },
  {
    "id": "p17_ex2_4",
    "type": "fill",
    "page": 17,
    "exercise": "2",
    "label": "4",
    "top": 73.9,
    "left": 19.5,
    "width": 8,
    "height": 1.8,
    "correct": "until"
  },
  {
    "id": "p17_ex2_5",
    "type": "fill",
    "page": 17,
    "exercise": "2",
    "label": "5",
    "top": 77.4,
    "left": 24.5,
    "width": 9.5,
    "height": 1.8,
    "correct": "want"
  },
  {
    "id": "p17_ex2_6",
    "type": "fill",
    "page": 17,
    "exercise": "2",
    "label": "6",
    "top": 78.8,
    "left": 16,
    "width": 9,
    "height": 1.8,
    "correct": "as soon as"
  },
  {
    "id": "p17_ex2_7",
    "type": "fill",
    "page": 17,
    "exercise": "2",
    "label": "7",
    "top": 82.4,
    "left": 25.5,
    "width": 10,
    "height": 1.8,
    "correct": "during"
  },
  {
    "id": "p17_ex2_8",
    "type": "fill",
    "page": 17,
    "exercise": "2",
    "label": "8",
    "top": 83.8,
    "left": 24.5,
    "width": 8.5,
    "height": 1.8,
    "correct": "hate"
  },
  {
    "id": "p17_ex2_9",
    "type": "fill",
    "page": 17,
    "exercise": "2",
    "label": "9",
    "top": 87.4,
    "left": 34,
    "width": 9,
    "height": 1.8,
    "correct": "agree"
  },
  {
    "id": "p17_ex2_10",
    "type": "fill",
    "page": 17,
    "exercise": "2",
    "label": "10",
    "top": 90.1,
    "left": 11.5,
    "width": 16.5,
    "height": 1.8,
    "correct": "Meanwhile or In the meanwhile"
  },
  {
    "id": "p17_ex3_2",
    "type": "fill",
    "page": 17,
    "exercise": "3",
    "label": "2",
    "top": 37.6,
    "left": 70,
    "width": 14,
    "height": 1.8,
    "correct": "common"
  },
  {
    "id": "p17_ex3_3",
    "type": "fill",
    "page": 17,
    "exercise": "3",
    "label": "3",
    "top": 39.1,
    "left": 59,
    "width": 8,
    "height": 1.8,
    "correct": "meet"
  },
  {
    "id": "p17_ex3_4",
    "type": "fill",
    "page": 17,
    "exercise": "3",
    "label": "4",
    "top": 46.8,
    "left": 72,
    "width": 7.2,
    "height": 1.8,
    "correct": "out"
  },
  {
    "id": "p17_ex3_5",
    "type": "fill",
    "page": 17,
    "exercise": "3",
    "label": "5",
    "top": 51.6,
    "left": 72,
    "width": 12,
    "height": 1.8,
    "correct": "admitted"
  },
  {
    "id": "p17_ex3_6",
    "type": "fill",
    "page": 17,
    "exercise": "3",
    "label": "6",
    "top": 54.6,
    "left": 59,
    "width": 9,
    "height": 1.8,
    "correct": "expect"
  },
  {
    "id": "p17_ex3_7",
    "type": "fill",
    "page": 17,
    "exercise": "3",
    "label": "7",
    "top": 59.4,
    "left": 60,
    "width": 9,
    "height": 1.8,
    "correct": "believes"
  },
  {
    "id": "p17_ex3_8",
    "type": "fill",
    "page": 17,
    "exercise": "3",
    "label": "8",
    "top": 65.6,
    "left": 61.5,
    "width": 12,
    "height": 1.8,
    "correct": "told"
  },
  {
    "id": "p17_ex4_2",
    "type": "fill",
    "page": 17,
    "exercise": "4",
    "label": "2",
    "top": 77.9,
    "left": 72,
    "width": 9.5,
    "height": 1.8,
    "correct": "ask"
  },
  {
    "id": "p17_ex4_3",
    "type": "fill",
    "page": 17,
    "exercise": "4",
    "label": "3",
    "top": 79.6,
    "left": 69,
    "width": 9.5,
    "height": 1.8,
    "correct": "think"
  },
  {
    "id": "p17_ex4_4",
    "type": "fill",
    "page": 17,
    "exercise": "4",
    "label": "4",
    "top": 86.1,
    "left": 66,
    "width": 9,
    "height": 1.8,
    "correct": "feel"
  },
  {
    "id": "p17_ex4_5",
    "type": "fill",
    "page": 17,
    "exercise": "4",
    "label": "5",
    "top": 89.4,
    "left": 72,
    "width": 5.5,
    "height": 1.8,
    "correct": "to"
  }
],
    18: [
  {
    "id": "p18_ex1_2_a",
    "type": "choose",
    "page": 18,
    "exercise": "1",
    "group": "p18_1_2",
    "text": "for",
    "top": 36.3,
    "left": 34,
    "width": 3.5,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p18_ex1_2_b",
    "type": "choose",
    "page": 18,
    "exercise": "1",
    "group": "p18_1_2",
    "text": "about",
    "top": 36.3,
    "left": 38,
    "width": 4.8,
    "height": 1.6,
    "correct": true
  },
  {
    "id": "p18_ex1_2_c",
    "type": "choose",
    "page": 18,
    "exercise": "1",
    "group": "p18_1_2",
    "text": "to",
    "top": 37.9,
    "left": 10.8,
    "width": 2.2,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p18_ex1_3_a",
    "type": "choose",
    "page": 18,
    "exercise": "1",
    "group": "p18_1_3",
    "text": "make",
    "top": 39.6,
    "left": 23.5,
    "width": 4.5,
    "height": 1.6,
    "correct": true
  },
  {
    "id": "p18_ex1_3_b",
    "type": "choose",
    "page": 18,
    "exercise": "1",
    "group": "p18_1_3",
    "text": "do",
    "top": 39.6,
    "left": 28.5,
    "width": 3,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p18_ex1_3_c",
    "type": "choose",
    "page": 18,
    "exercise": "1",
    "group": "p18_1_3",
    "text": "go",
    "top": 39.6,
    "left": 32,
    "width": 3,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p18_ex1_4_a",
    "type": "choose",
    "page": 18,
    "exercise": "1",
    "group": "p18_1_4",
    "text": "over",
    "top": 42.8,
    "left": 26.5,
    "width": 4,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p18_ex1_4_b",
    "type": "choose",
    "page": 18,
    "exercise": "1",
    "group": "p18_1_4",
    "text": "with",
    "top": 42.8,
    "left": 31,
    "width": 3.8,
    "height": 1.6,
    "correct": true
  },
  {
    "id": "p18_ex1_4_c",
    "type": "choose",
    "page": 18,
    "exercise": "1",
    "group": "p18_1_4",
    "text": "at",
    "top": 42.8,
    "left": 35.5,
    "width": 2.5,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p18_ex1_5_a",
    "type": "choose",
    "page": 18,
    "exercise": "1",
    "group": "p18_1_5",
    "text": "for",
    "top": 46.1,
    "left": 33.5,
    "width": 3,
    "height": 1.6,
    "correct": true
  },
  {
    "id": "p18_ex1_5_b",
    "type": "choose",
    "page": 18,
    "exercise": "1",
    "group": "p18_1_5",
    "text": "at",
    "top": 46.1,
    "left": 37,
    "width": 2.5,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p18_ex1_5_c",
    "type": "choose",
    "page": 18,
    "exercise": "1",
    "group": "p18_1_5",
    "text": "over",
    "top": 46.1,
    "left": 40,
    "width": 4,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p18_ex1_6_a",
    "type": "choose",
    "page": 18,
    "exercise": "1",
    "group": "p18_1_6",
    "text": "making",
    "top": 50.9,
    "left": 10.8,
    "width": 6,
    "height": 1.6,
    "correct": true
  },
  {
    "id": "p18_ex1_6_b",
    "type": "choose",
    "page": 18,
    "exercise": "1",
    "group": "p18_1_6",
    "text": "having",
    "top": 50.9,
    "left": 17.5,
    "width": 5.5,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p18_ex1_6_c",
    "type": "choose",
    "page": 18,
    "exercise": "1",
    "group": "p18_1_6",
    "text": "doing",
    "top": 50.9,
    "left": 23.5,
    "width": 5,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p18_ex1_7_a",
    "type": "choose",
    "page": 18,
    "exercise": "1",
    "group": "p18_1_7",
    "text": "show",
    "top": 52.6,
    "left": 31,
    "width": 4.8,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p18_ex1_7_b",
    "type": "choose",
    "page": 18,
    "exercise": "1",
    "group": "p18_1_7",
    "text": "be",
    "top": 52.6,
    "left": 36.5,
    "width": 2.8,
    "height": 1.6,
    "correct": true
  },
  {
    "id": "p18_ex1_7_c",
    "type": "choose",
    "page": 18,
    "exercise": "1",
    "group": "p18_1_7",
    "text": "have",
    "top": 52.6,
    "left": 40,
    "width": 4.5,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p18_ex1_8_a",
    "type": "choose",
    "page": 18,
    "exercise": "1",
    "group": "p18_1_8",
    "text": "lift",
    "top": 55.8,
    "left": 26.5,
    "width": 3.2,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p18_ex1_8_b",
    "type": "choose",
    "page": 18,
    "exercise": "1",
    "group": "p18_1_8",
    "text": "prove",
    "top": 55.8,
    "left": 30.5,
    "width": 4.8,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p18_ex1_8_c",
    "type": "choose",
    "page": 18,
    "exercise": "1",
    "group": "p18_1_8",
    "text": "rise",
    "top": 55.8,
    "left": 36,
    "width": 3.6,
    "height": 1.6,
    "correct": true
  },
  {
    "id": "p18_ex2_2",
    "type": "fill",
    "page": 18,
    "exercise": "2",
    "label": "2",
    "top": 78.9,
    "left": 16.5,
    "width": 9.5,
    "height": 1.8,
    "correct": "manage or MANAGE"
  },
  {
    "id": "p18_ex2_3",
    "type": "fill",
    "page": 18,
    "exercise": "2",
    "label": "3",
    "top": 88.2,
    "left": 15,
    "width": 9.5,
    "height": 1.8,
    "correct": "succeed or SUCCEED"
  },
  {
    "id": "p18_ex2_4",
    "type": "fill",
    "page": 18,
    "exercise": "2",
    "label": "4",
    "top": 29,
    "left": 58,
    "width": 8.5,
    "height": 1.8,
    "correct": "avoid or AVOID"
  },
  {
    "id": "p18_ex2_5",
    "type": "fill",
    "page": 18,
    "exercise": "2",
    "label": "5",
    "top": 30.8,
    "left": 81.5,
    "width": 9.5,
    "height": 1.8,
    "correct": "observe or OBSERVE"
  },
  {
    "id": "p18_ex2_6",
    "type": "fill",
    "page": 18,
    "exercise": "2",
    "label": "6",
    "top": 35.6,
    "left": 76.5,
    "width": 8.5,
    "height": 1.8,
    "correct": "achieve or ACHIEVE"
  },
  {
    "id": "p18_ex3_2",
    "type": "fill",
    "page": 18,
    "exercise": "3",
    "label": "2",
    "top": 68.9,
    "left": 64,
    "width": 16,
    "height": 1.8,
    "correct": "rise to"
  },
  {
    "id": "p18_ex3_3",
    "type": "fill",
    "page": 18,
    "exercise": "3",
    "label": "3",
    "top": 73.4,
    "left": 57,
    "width": 16,
    "height": 1.8,
    "correct": "thinking about"
  },
  {
    "id": "p18_ex3_4",
    "type": "fill",
    "page": 18,
    "exercise": "3",
    "label": "4",
    "top": 75,
    "left": 69.5,
    "width": 15.5,
    "height": 1.8,
    "correct": "managed to"
  },
  {
    "id": "p18_ex3_5",
    "type": "fill",
    "page": 18,
    "exercise": "3",
    "label": "5",
    "top": 84.2,
    "left": 64.5,
    "width": 15.5,
    "height": 1.8,
    "correct": "succeeding in"
  },
  {
    "id": "p18_ex3_6",
    "type": "fill",
    "page": 18,
    "exercise": "3",
    "label": "6",
    "top": 87.3,
    "left": 66,
    "width": 15.5,
    "height": 1.8,
    "correct": "wait for"
  },
  {
    "id": "p18_ex3_7",
    "type": "fill",
    "page": 18,
    "exercise": "3",
    "label": "7",
    "top": 90.4,
    "left": 57,
    "width": 16,
    "height": 1.8,
    "correct": "prefer to"
  }
],
    19: [
  {
    "id": "p19_ex4_1_a",
    "type": "choose",
    "page": 19,
    "exercise": "4",
    "group": "p19_4_1",
    "text": "a can",
    "top": 17.5,
    "left": 10.8,
    "width": 6,
    "height": 1.6,
    "correct": true
  },
  {
    "id": "p19_ex4_1_b",
    "type": "choose",
    "page": 19,
    "exercise": "4",
    "group": "p19_4_1",
    "text": "b manage",
    "top": 17.5,
    "left": 25.5,
    "width": 8.5,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p19_ex4_1_c",
    "type": "choose",
    "page": 19,
    "exercise": "4",
    "group": "p19_4_1",
    "text": "c am able",
    "top": 17.5,
    "left": 35,
    "width": 8.5,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p19_ex4_2_a",
    "type": "choose",
    "page": 19,
    "exercise": "4",
    "group": "p19_4_2",
    "text": "a able",
    "top": 22.3,
    "left": 10.8,
    "width": 6,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p19_ex4_2_b",
    "type": "choose",
    "page": 19,
    "exercise": "4",
    "group": "p19_4_2",
    "text": "b manage",
    "top": 22.3,
    "left": 25.5,
    "width": 8.5,
    "height": 1.6,
    "correct": true
  },
  {
    "id": "p19_ex4_2_c",
    "type": "choose",
    "page": 19,
    "exercise": "4",
    "group": "p19_4_2",
    "text": "c can",
    "top": 22.3,
    "left": 35,
    "width": 5.5,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p19_ex4_3_a",
    "type": "choose",
    "page": 19,
    "exercise": "4",
    "group": "p19_4_3",
    "text": "a didn't manage to",
    "top": 25.8,
    "left": 10.8,
    "width": 14,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p19_ex4_3_b",
    "type": "choose",
    "page": 19,
    "exercise": "4",
    "group": "p19_4_3",
    "text": "b couldn't",
    "top": 25.8,
    "left": 25.5,
    "width": 8,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p19_ex4_3_c",
    "type": "choose",
    "page": 19,
    "exercise": "4",
    "group": "p19_4_3",
    "text": "c didn't succeed in",
    "top": 25.8,
    "left": 35,
    "width": 14,
    "height": 1.6,
    "correct": true
  },
  {
    "id": "p19_ex4_4_a",
    "type": "choose",
    "page": 19,
    "exercise": "4",
    "group": "p19_4_4",
    "text": "a were able",
    "top": 30.7,
    "left": 10.8,
    "width": 9,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p19_ex4_4_b",
    "type": "choose",
    "page": 19,
    "exercise": "4",
    "group": "p19_4_4",
    "text": "b could",
    "top": 30.7,
    "left": 25.5,
    "width": 6.5,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p19_ex4_4_c",
    "type": "choose",
    "page": 19,
    "exercise": "4",
    "group": "p19_4_4",
    "text": "c managed to",
    "top": 30.7,
    "left": 35,
    "width": 10.5,
    "height": 1.6,
    "correct": true
  },
  {
    "id": "p19_ex4_5_a",
    "type": "choose",
    "page": 19,
    "exercise": "4",
    "group": "p19_4_5",
    "text": "a able",
    "top": 35.7,
    "left": 10.8,
    "width": 6,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p19_ex4_5_b",
    "type": "choose",
    "page": 19,
    "exercise": "4",
    "group": "p19_4_5",
    "text": "b succeed",
    "top": 35.7,
    "left": 25.5,
    "width": 8.5,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p19_ex4_5_c",
    "type": "choose",
    "page": 19,
    "exercise": "4",
    "group": "p19_4_5",
    "text": "c manage",
    "top": 35.7,
    "left": 35,
    "width": 8.5,
    "height": 1.6,
    "correct": true
  },
  {
    "id": "p19_ex4_6_a",
    "type": "choose",
    "page": 19,
    "exercise": "4",
    "group": "p19_4_6",
    "text": "a able",
    "top": 40.7,
    "left": 10.8,
    "width": 6,
    "height": 1.6,
    "correct": true
  },
  {
    "id": "p19_ex4_6_b",
    "type": "choose",
    "page": 19,
    "exercise": "4",
    "group": "p19_4_6",
    "text": "b could",
    "top": 40.7,
    "left": 25.5,
    "width": 6.5,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p19_ex4_6_c",
    "type": "choose",
    "page": 19,
    "exercise": "4",
    "group": "p19_4_6",
    "text": "c managing",
    "top": 40.7,
    "left": 35,
    "width": 9.5,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p19_ex5_2",
    "type": "fill",
    "page": 19,
    "exercise": "5",
    "label": "2",
    "top": 53.6,
    "left": 10.9,
    "width": 35,
    "height": 1.8,
    "correct": "Did they manage to find their way back easily?"
  },
  {
    "id": "p19_ex5_3",
    "type": "fill",
    "page": 19,
    "exercise": "5",
    "label": "3",
    "top": 57.1,
    "left": 10.9,
    "width": 35,
    "height": 1.8,
    "correct": "Tina wasn't able to get a holiday job last summer."
  },
  {
    "id": "p19_ex5_4",
    "type": "fill",
    "page": 19,
    "exercise": "5",
    "label": "4",
    "top": 62,
    "left": 10.9,
    "width": 35,
    "height": 1.8,
    "correct": "Some students succeeded in passing all the exams."
  },
  {
    "id": "p19_ex5_5",
    "type": "fill",
    "page": 19,
    "exercise": "5",
    "label": "5",
    "top": 65.5,
    "left": 10.9,
    "width": 35,
    "height": 1.8,
    "correct": "Can you lift such heavy bags?"
  },
  {
    "id": "p19_ex5_6",
    "type": "fill",
    "page": 19,
    "exercise": "5",
    "label": "6",
    "top": 70.4,
    "left": 10.9,
    "width": 35,
    "height": 1.8,
    "correct": "Are you sure that Jack will be able to find the hotel?"
  },
  {
    "id": "p19_ex5_7",
    "type": "fill",
    "page": 19,
    "exercise": "5",
    "label": "7",
    "top": 73.9,
    "left": 10.9,
    "width": 35,
    "height": 1.8,
    "correct": "Lars didn't manage to pass his driving test."
  },
  {
    "id": "p19_ex5_8",
    "type": "fill",
    "page": 19,
    "exercise": "5",
    "label": "8",
    "top": 77.4,
    "left": 10.9,
    "width": 35,
    "height": 1.8,
    "correct": "Do you think Anna can come on Sunday?"
  },
  {
    "id": "p19_ex6_2",
    "type": "fill",
    "page": 19,
    "exercise": "6",
    "label": "2",
    "top": 54.6,
    "left": 70.5,
    "width": 16,
    "height": 1.8,
    "correct": "couldn't play or wasn't able to play"
  },
  {
    "id": "p19_ex6_3",
    "type": "fill",
    "page": 19,
    "exercise": "6",
    "label": "3",
    "top": 59.5,
    "left": 69,
    "width": 16,
    "height": 1.8,
    "correct": "will be able to buy"
  },
  {
    "id": "p19_ex6_4",
    "type": "fill",
    "page": 19,
    "exercise": "6",
    "label": "4",
    "top": 63.7,
    "left": 62,
    "width": 16,
    "height": 1.8,
    "correct": "managed to sell or succeeded in selling"
  },
  {
    "id": "p19_ex6_5",
    "type": "fill",
    "page": 19,
    "exercise": "6",
    "label": "5",
    "top": 68.7,
    "left": 71.5,
    "width": 16,
    "height": 1.8,
    "correct": "can't act"
  },
  {
    "id": "p19_ex6_6",
    "type": "fill",
    "page": 19,
    "exercise": "6",
    "label": "6",
    "top": 70.1,
    "left": 63,
    "width": 16,
    "height": 1.8,
    "correct": "can't sing"
  },
  {
    "id": "p19_ex6_7",
    "type": "fill",
    "page": 19,
    "exercise": "6",
    "label": "7",
    "top": 73,
    "left": 55,
    "width": 18,
    "height": 1.8,
    "correct": "could dance or was able to dance"
  },
  {
    "id": "p19_ex6_8",
    "type": "fill",
    "page": 19,
    "exercise": "6",
    "label": "8",
    "top": 77.9,
    "left": 55,
    "width": 16,
    "height": 1.8,
    "correct": "could cook or was able to cook"
  }
],
    20: [
  {
    "id": "p20_ex1_1",
    "type": "fill",
    "page": 20,
    "exercise": "1",
    "label": "1",
    "top": 22.8,
    "left": 18,
    "width": 5,
    "height": 1.8,
    "correct": "c or C"
  },
  {
    "id": "p20_ex1_2",
    "type": "fill",
    "page": 20,
    "exercise": "1",
    "label": "2",
    "top": 24.5,
    "left": 18,
    "width": 5,
    "height": 1.8,
    "correct": "d or D"
  },
  {
    "id": "p20_ex1_3",
    "type": "fill",
    "page": 20,
    "exercise": "1",
    "label": "3",
    "top": 26.6,
    "left": 18,
    "width": 5,
    "height": 1.8,
    "correct": "a or A"
  },
  {
    "id": "p20_ex1_4",
    "type": "fill",
    "page": 20,
    "exercise": "1",
    "label": "4",
    "top": 28.1,
    "left": 18,
    "width": 5,
    "height": 1.8,
    "correct": "b or B"
  },
  {
    "id": "p20_ex1_5",
    "type": "fill",
    "page": 20,
    "exercise": "1",
    "label": "5",
    "top": 29.7,
    "left": 18,
    "width": 5,
    "height": 1.8,
    "correct": "f or F"
  },
  {
    "id": "p20_ex1_6",
    "type": "fill",
    "page": 20,
    "exercise": "1",
    "label": "6",
    "top": 31.4,
    "left": 18,
    "width": 5,
    "height": 1.8,
    "correct": "e or E"
  },
  {
    "id": "p20_ex2_2",
    "type": "fill",
    "page": 20,
    "exercise": "2",
    "label": "2",
    "top": 56.3,
    "left": 15,
    "width": 8.5,
    "height": 1.8,
    "correct": "setting goals"
  },
  {
    "id": "p20_ex2_3",
    "type": "fill",
    "page": 20,
    "exercise": "2",
    "label": "3",
    "top": 59.4,
    "left": 24.5,
    "width": 15,
    "height": 1.8,
    "correct": "take responsibility"
  },
  {
    "id": "p20_ex2_4",
    "type": "fill",
    "page": 20,
    "exercise": "2",
    "label": "4",
    "top": 64,
    "left": 26,
    "width": 14.5,
    "height": 1.8,
    "correct": "making decisions"
  },
  {
    "id": "p20_ex2_5",
    "type": "fill",
    "page": 20,
    "exercise": "2",
    "label": "5",
    "top": 70.1,
    "left": 13.5,
    "width": 8.5,
    "height": 1.8,
    "correct": "solving problems"
  },
  {
    "id": "p20_ex2_6",
    "type": "fill",
    "page": 20,
    "exercise": "2",
    "label": "6",
    "top": 78.6,
    "left": 16,
    "width": 8.5,
    "height": 1.8,
    "correct": "managed teams"
  },
  {
    "id": "p20_ex3_2",
    "type": "fill",
    "page": 20,
    "exercise": "3",
    "label": "2",
    "top": 24,
    "left": 57,
    "width": 9,
    "height": 1.8,
    "correct": "working"
  },
  {
    "id": "p20_ex3_3",
    "type": "fill",
    "page": 20,
    "exercise": "3",
    "label": "3",
    "top": 25.7,
    "left": 57,
    "width": 9,
    "height": 1.8,
    "correct": "being"
  },
  {
    "id": "p20_ex3_4",
    "type": "fill",
    "page": 20,
    "exercise": "3",
    "label": "4",
    "top": 27.4,
    "left": 61.5,
    "width": 7.5,
    "height": 1.8,
    "correct": "tasking"
  },
  {
    "id": "p20_ex3_5",
    "type": "fill",
    "page": 20,
    "exercise": "3",
    "label": "5",
    "top": 29.2,
    "left": 57,
    "width": 9,
    "height": 1.8,
    "correct": "persuading"
  },
  {
    "id": "p20_ex3_6",
    "type": "fill",
    "page": 20,
    "exercise": "3",
    "label": "6",
    "top": 30.9,
    "left": 57,
    "width": 9,
    "height": 1.8,
    "correct": "being"
  },
  {
    "id": "p20_ex4_b",
    "type": "fill",
    "page": 20,
    "exercise": "4",
    "label": "b",
    "top": 57.1,
    "left": 85,
    "width": 4.5,
    "height": 1.8,
    "correct": "3"
  },
  {
    "id": "p20_ex4_c",
    "type": "fill",
    "page": 20,
    "exercise": "4",
    "label": "c",
    "top": 63.5,
    "left": 85,
    "width": 4.5,
    "height": 1.8,
    "correct": "5"
  },
  {
    "id": "p20_ex4_d",
    "type": "fill",
    "page": 20,
    "exercise": "4",
    "label": "d",
    "top": 75.2,
    "left": 85,
    "width": 4.5,
    "height": 1.8,
    "correct": "1"
  },
  {
    "id": "p20_ex4_e",
    "type": "fill",
    "page": 20,
    "exercise": "4",
    "label": "e",
    "top": 80.2,
    "left": 85,
    "width": 4.5,
    "height": 1.8,
    "correct": "4"
  },
  {
    "id": "p20_ex4_f",
    "type": "fill",
    "page": 20,
    "exercise": "4",
    "label": "f",
    "top": 86.5,
    "left": 85,
    "width": 4.5,
    "height": 1.8,
    "correct": "2"
  }
],
    21: [
  {
    "id": "p21_ex5_1_a",
    "type": "choose",
    "page": 21,
    "exercise": "5",
    "group": "p21_5_1",
    "text": "has to",
    "top": 45.2,
    "left": 45,
    "width": 5.5,
    "height": 1.6,
    "correct": true
  },
  {
    "id": "p21_ex5_1_b",
    "type": "choose",
    "page": 21,
    "exercise": "5",
    "group": "p21_5_1",
    "text": "can",
    "top": 46.8,
    "left": 12.2,
    "width": 4,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p21_ex5_2_a",
    "type": "choose",
    "page": 21,
    "exercise": "5",
    "group": "p21_5_2",
    "text": "can",
    "top": 51.3,
    "left": 12.2,
    "width": 4,
    "height": 1.6,
    "correct": true
  },
  {
    "id": "p21_ex5_2_b",
    "type": "choose",
    "page": 21,
    "exercise": "5",
    "group": "p21_5_2",
    "text": "need to",
    "top": 51.3,
    "left": 17,
    "width": 6.5,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p21_ex5_3_a",
    "type": "choose",
    "page": 21,
    "exercise": "5",
    "group": "p21_5_3",
    "text": "can't",
    "top": 51.3,
    "left": 32.5,
    "width": 5,
    "height": 1.6,
    "correct": true
  },
  {
    "id": "p21_ex5_3_b",
    "type": "choose",
    "page": 21,
    "exercise": "5",
    "group": "p21_5_3",
    "text": "don't need to",
    "top": 51.3,
    "left": 38,
    "width": 9.5,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p21_ex5_4_a",
    "type": "choose",
    "page": 21,
    "exercise": "5",
    "group": "p21_5_4",
    "text": "can",
    "top": 56.7,
    "left": 16,
    "width": 4,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p21_ex5_4_b",
    "type": "choose",
    "page": 21,
    "exercise": "5",
    "group": "p21_5_4",
    "text": "have to",
    "top": 56.7,
    "left": 21,
    "width": 6.5,
    "height": 1.6,
    "correct": true
  },
  {
    "id": "p21_ex5_5_a",
    "type": "choose",
    "page": 21,
    "exercise": "5",
    "group": "p21_5_5",
    "text": "mustn't",
    "top": 58.2,
    "left": 24,
    "width": 6.5,
    "height": 1.6,
    "correct": true
  },
  {
    "id": "p21_ex5_5_b",
    "type": "choose",
    "page": 21,
    "exercise": "5",
    "group": "p21_5_5",
    "text": "needn't",
    "top": 58.2,
    "left": 31.5,
    "width": 6.5,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p21_ex5_6_a",
    "type": "choose",
    "page": 21,
    "exercise": "5",
    "group": "p21_5_6",
    "text": "mustn't",
    "top": 60.1,
    "left": 32.5,
    "width": 6.5,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p21_ex5_6_b",
    "type": "choose",
    "page": 21,
    "exercise": "5",
    "group": "p21_5_6",
    "text": "don't have to",
    "top": 60.1,
    "left": 39.5,
    "width": 9.5,
    "height": 1.6,
    "correct": true
  },
  {
    "id": "p21_ex5_7_a",
    "type": "choose",
    "page": 21,
    "exercise": "5",
    "group": "p21_5_7",
    "text": "can",
    "top": 61.7,
    "left": 34,
    "width": 4,
    "height": 1.6,
    "correct": true
  },
  {
    "id": "p21_ex5_7_b",
    "type": "choose",
    "page": 21,
    "exercise": "5",
    "group": "p21_5_7",
    "text": "need to",
    "top": 61.7,
    "left": 39,
    "width": 6.5,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p21_ex5_8_a",
    "type": "choose",
    "page": 21,
    "exercise": "5",
    "group": "p21_5_8",
    "text": "had to",
    "top": 69.3,
    "left": 47,
    "width": 5.5,
    "height": 1.6,
    "correct": true
  },
  {
    "id": "p21_ex5_8_b",
    "type": "choose",
    "page": 21,
    "exercise": "5",
    "group": "p21_5_8",
    "text": "mustn't",
    "top": 70.8,
    "left": 15,
    "width": 6.5,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p21_ex5_9_a",
    "type": "choose",
    "page": 21,
    "exercise": "5",
    "group": "p21_5_9",
    "text": "didn't have to",
    "top": 73.9,
    "left": 16.5,
    "width": 10,
    "height": 1.6,
    "correct": true
  },
  {
    "id": "p21_ex5_9_b",
    "type": "choose",
    "page": 21,
    "exercise": "5",
    "group": "p21_5_9",
    "text": "couldn't",
    "top": 73.9,
    "left": 27.5,
    "width": 6.5,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p21_ex5_10_a",
    "type": "choose",
    "page": 21,
    "exercise": "5",
    "group": "p21_5_10",
    "text": "could",
    "top": 78.5,
    "left": 23.5,
    "width": 5,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p21_ex5_10_b",
    "type": "choose",
    "page": 21,
    "exercise": "5",
    "group": "p21_5_10",
    "text": "had to",
    "top": 78.5,
    "left": 29,
    "width": 5.5,
    "height": 1.6,
    "correct": true
  },
  {
    "id": "p21_ex7_2",
    "type": "fill",
    "page": 21,
    "exercise": "7",
    "label": "2",
    "top": 43,
    "left": 70,
    "width": 22,
    "height": 1.8,
    "correct": "don't have to wear a tie."
  },
  {
    "id": "p21_ex7_3",
    "type": "fill",
    "page": 21,
    "exercise": "7",
    "label": "3",
    "top": 49.5,
    "left": 85,
    "width": 11,
    "height": 1.8,
    "correct": "couldn't check personal emails at work."
  },
  {
    "id": "p21_ex7_4",
    "type": "fill",
    "page": 21,
    "exercise": "7",
    "label": "4",
    "top": 56,
    "left": 70,
    "width": 22,
    "height": 1.8,
    "correct": "can't eat sandwiches at your work station."
  },
  {
    "id": "p21_ex7_5",
    "type": "fill",
    "page": 21,
    "exercise": "7",
    "label": "5",
    "top": 62.5,
    "left": 83,
    "width": 13,
    "height": 1.8,
    "correct": "had to sign out every time they left the building."
  },
  {
    "id": "p21_ex7_6",
    "type": "fill",
    "page": 21,
    "exercise": "7",
    "label": "6",
    "top": 69.1,
    "left": 70,
    "width": 22,
    "height": 1.8,
    "correct": "need to book holidays six months in advance."
  },
  {
    "id": "p21_ex7_7",
    "type": "fill",
    "page": 21,
    "exercise": "7",
    "label": "7",
    "top": 74,
    "left": 70,
    "width": 22,
    "height": 1.8,
    "correct": "must switch off your mobile phone at work."
  },
  {
    "id": "p21_ex7_8",
    "type": "fill",
    "page": 21,
    "exercise": "7",
    "label": "8",
    "top": 80.5,
    "left": 88,
    "width": 9,
    "height": 1.8,
    "correct": "are able to start work between 8 and 10 a.m."
  }
],
    22: [
  {
    "id": "p22_ex1a_2",
    "type": "fill",
    "page": 22,
    "exercise": "1a",
    "label": "2",
    "top": 30.7,
    "left": 16.5,
    "width": 9,
    "height": 1.8,
    "correct": "handed or HANDED"
  },
  {
    "id": "p22_ex1a_3",
    "type": "fill",
    "page": 22,
    "exercise": "1a",
    "label": "3",
    "top": 32.4,
    "left": 18,
    "width": 9,
    "height": 1.8,
    "correct": "sleeved or SLEEVED"
  },
  {
    "id": "p22_ex1a_4",
    "type": "fill",
    "page": 22,
    "exercise": "1a",
    "label": "4",
    "top": 34.1,
    "left": 17.5,
    "width": 9,
    "height": 1.8,
    "correct": "looking or LOOKING"
  },
  {
    "id": "p22_ex1a_5",
    "type": "fill",
    "page": 22,
    "exercise": "1a",
    "label": "5",
    "top": 35.9,
    "left": 20.5,
    "width": 9,
    "height": 1.8,
    "correct": "speaking or SPEAKING"
  },
  {
    "id": "p22_ex1a_6",
    "type": "fill",
    "page": 22,
    "exercise": "1a",
    "label": "6",
    "top": 37.5,
    "left": 18,
    "width": 9,
    "height": 1.8,
    "correct": "made or MADE"
  },
  {
    "id": "p22_ex1b_a",
    "type": "fill",
    "page": 22,
    "exercise": "1b",
    "label": "a",
    "top": 42.3,
    "left": 47,
    "width": 4.5,
    "height": 1.8,
    "correct": "2"
  },
  {
    "id": "p22_ex1b_b",
    "type": "fill",
    "page": 22,
    "exercise": "1b",
    "label": "b",
    "top": 45.5,
    "left": 47,
    "width": 4.5,
    "height": 1.8,
    "correct": "3"
  },
  {
    "id": "p22_ex1b_c",
    "type": "fill",
    "page": 22,
    "exercise": "1b",
    "label": "c",
    "top": 48.8,
    "left": 47,
    "width": 4.5,
    "height": 1.8,
    "correct": "4"
  },
  {
    "id": "p22_ex1b_d",
    "type": "fill",
    "page": 22,
    "exercise": "1b",
    "label": "d",
    "top": 50.5,
    "left": 47,
    "width": 4.5,
    "height": 1.8,
    "correct": "5"
  },
  {
    "id": "p22_ex1b_e",
    "type": "fill",
    "page": 22,
    "exercise": "1b",
    "label": "e",
    "top": 53.7,
    "left": 47,
    "width": 4.5,
    "height": 1.8,
    "correct": "1"
  },
  {
    "id": "p22_ex1b_f",
    "type": "fill",
    "page": 22,
    "exercise": "1b",
    "label": "f",
    "top": 57,
    "left": 47,
    "width": 4.5,
    "height": 1.8,
    "correct": "6"
  },
  {
    "id": "p22_ex2_2",
    "type": "fill",
    "page": 22,
    "exercise": "2",
    "label": "2",
    "top": 79.1,
    "left": 18.5,
    "width": 15,
    "height": 1.8,
    "correct": "full-time"
  },
  {
    "id": "p22_ex2_3",
    "type": "fill",
    "page": 22,
    "exercise": "2",
    "label": "3",
    "top": 84.8,
    "left": 22,
    "width": 16,
    "height": 1.8,
    "correct": "second-hand"
  },
  {
    "id": "p22_ex2_4",
    "type": "fill",
    "page": 22,
    "exercise": "2",
    "label": "4",
    "top": 87.6,
    "left": 12.5,
    "width": 15,
    "height": 1.8,
    "correct": "five-star"
  },
  {
    "id": "p22_ex2_5",
    "type": "fill",
    "page": 22,
    "exercise": "2",
    "label": "5",
    "top": 90.4,
    "left": 12.5,
    "width": 15,
    "height": 1.8,
    "correct": "overpriced"
  },
  {
    "id": "p22_ex2_6",
    "type": "fill",
    "page": 22,
    "exercise": "2",
    "label": "6",
    "top": 77.6,
    "left": 59,
    "width": 14,
    "height": 1.8,
    "correct": "easy-going"
  },
  {
    "id": "p22_ex2_7",
    "type": "fill",
    "page": 22,
    "exercise": "2",
    "label": "7",
    "top": 80.4,
    "left": 45,
    "width": 15,
    "height": 1.8,
    "correct": "hard-working"
  },
  {
    "id": "p22_ex2_8",
    "type": "fill",
    "page": 22,
    "exercise": "2",
    "label": "8",
    "top": 86,
    "left": 56,
    "width": 14,
    "height": 1.8,
    "correct": "500-page"
  },
  {
    "id": "p22_ex3_1",
    "type": "fill",
    "page": 22,
    "exercise": "3",
    "label": "1",
    "top": 22.8,
    "left": 62,
    "width": 5,
    "height": 1.8,
    "correct": "f or F"
  },
  {
    "id": "p22_ex3_2",
    "type": "fill",
    "page": 22,
    "exercise": "3",
    "label": "2",
    "top": 24.5,
    "left": 62,
    "width": 5,
    "height": 1.8,
    "correct": "c or C"
  },
  {
    "id": "p22_ex3_3",
    "type": "fill",
    "page": 22,
    "exercise": "3",
    "label": "3",
    "top": 26.2,
    "left": 62,
    "width": 5,
    "height": 1.8,
    "correct": "a or A"
  },
  {
    "id": "p22_ex3_4",
    "type": "fill",
    "page": 22,
    "exercise": "3",
    "label": "4",
    "top": 28.1,
    "left": 62,
    "width": 5,
    "height": 1.8,
    "correct": "e or E"
  },
  {
    "id": "p22_ex3_5",
    "type": "fill",
    "page": 22,
    "exercise": "3",
    "label": "5",
    "top": 29.7,
    "left": 62,
    "width": 5,
    "height": 1.8,
    "correct": "h or H"
  },
  {
    "id": "p22_ex3_6",
    "type": "fill",
    "page": 22,
    "exercise": "3",
    "label": "6",
    "top": 31.4,
    "left": 62,
    "width": 5,
    "height": 1.8,
    "correct": "g or G"
  },
  {
    "id": "p22_ex3_7",
    "type": "fill",
    "page": 22,
    "exercise": "3",
    "label": "7",
    "top": 33.2,
    "left": 62,
    "width": 5,
    "height": 1.8,
    "correct": "b or B"
  },
  {
    "id": "p22_ex3_8",
    "type": "fill",
    "page": 22,
    "exercise": "3",
    "label": "8",
    "top": 34.9,
    "left": 62,
    "width": 5,
    "height": 1.8,
    "correct": "d or D"
  },
  {
    "id": "p22_ex4_2",
    "type": "fill",
    "page": 22,
    "exercise": "4",
    "label": "2",
    "top": 53.8,
    "left": 58,
    "width": 8.5,
    "height": 1.8,
    "correct": "taking"
  },
  {
    "id": "p22_ex4_3",
    "type": "fill",
    "page": 22,
    "exercise": "4",
    "label": "3",
    "top": 55.2,
    "left": 61,
    "width": 7.5,
    "height": 1.8,
    "correct": "tasking"
  },
  {
    "id": "p22_ex4_4",
    "type": "fill",
    "page": 22,
    "exercise": "4",
    "label": "4",
    "top": 56.6,
    "left": 58,
    "width": 8.5,
    "height": 1.8,
    "correct": "setting"
  },
  {
    "id": "p22_ex4_5",
    "type": "fill",
    "page": 22,
    "exercise": "4",
    "label": "5",
    "top": 50.9,
    "left": 78,
    "width": 8,
    "height": 1.8,
    "correct": "managing"
  },
  {
    "id": "p22_ex4_6",
    "type": "fill",
    "page": 22,
    "exercise": "4",
    "label": "6",
    "top": 53.7,
    "left": 78,
    "width": 8,
    "height": 1.8,
    "correct": "being"
  },
  {
    "id": "p22_ex4_7",
    "type": "fill",
    "page": 22,
    "exercise": "4",
    "label": "7",
    "top": 56.6,
    "left": 78,
    "width": 8,
    "height": 1.8,
    "correct": "making"
  },
  {
    "id": "p22_ex4_8",
    "type": "fill",
    "page": 22,
    "exercise": "4",
    "label": "8",
    "top": 58,
    "left": 78,
    "width": 8,
    "height": 1.8,
    "correct": "solving"
  }
],
    23: [
  {
    "id": "p23_ex1b_2",
    "type": "fill",
    "page": 23,
    "exercise": "1b",
    "label": "2",
    "top": 70.4,
    "left": 16,
    "width": 8.5,
    "height": 1.8,
    "correct": "show"
  },
  {
    "id": "p23_ex1b_3",
    "type": "fill",
    "page": 23,
    "exercise": "1b",
    "label": "3",
    "top": 72.1,
    "left": 17,
    "width": 8.5,
    "height": 1.8,
    "correct": "thing"
  },
  {
    "id": "p23_ex1b_4",
    "type": "fill",
    "page": 23,
    "exercise": "1b",
    "label": "4",
    "top": 75.4,
    "left": 17,
    "width": 8.5,
    "height": 1.8,
    "correct": "show"
  },
  {
    "id": "p23_ex1b_5",
    "type": "fill",
    "page": 23,
    "exercise": "1b",
    "label": "5",
    "top": 77.1,
    "left": 17.5,
    "width": 8.5,
    "height": 1.8,
    "correct": "like"
  },
  {
    "id": "p23_ex1b_6",
    "type": "fill",
    "page": 23,
    "exercise": "1b",
    "label": "6",
    "top": 78.8,
    "left": 20,
    "width": 8.5,
    "height": 1.8,
    "correct": "done"
  },
  {
    "id": "p23_ex1b_7",
    "type": "fill",
    "page": 23,
    "exercise": "1b",
    "label": "7",
    "top": 82,
    "left": 15,
    "width": 8.5,
    "height": 1.8,
    "correct": "doing"
  },
  {
    "id": "p23_ex1b_8",
    "type": "fill",
    "page": 23,
    "exercise": "1b",
    "label": "8",
    "top": 85.3,
    "left": 17.5,
    "width": 8.5,
    "height": 1.8,
    "correct": "next"
  },
  {
    "id": "p23_ex2a_a",
    "type": "choose",
    "page": 23,
    "exercise": "2a",
    "group": "p23_2a",
    "text": "a reading",
    "top": 26,
    "left": 53.3,
    "width": 7.5,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p23_ex2a_b",
    "type": "choose",
    "page": 23,
    "exercise": "2a",
    "group": "p23_2a",
    "text": "b speaking",
    "top": 26,
    "left": 62,
    "width": 8,
    "height": 1.6,
    "correct": false
  },
  {
    "id": "p23_ex2a_c",
    "type": "choose",
    "page": 23,
    "exercise": "2a",
    "group": "p23_2a",
    "text": "c doing",
    "top": 26,
    "left": 71,
    "width": 7,
    "height": 1.6,
    "correct": true
  },
  {
    "id": "p23_ex2b_2",
    "type": "fill",
    "page": 23,
    "exercise": "2b",
    "label": "2",
    "top": 56.5,
    "left": 67,
    "width": 14,
    "height": 1.8,
    "correct": "such as"
  },
  {
    "id": "p23_ex2b_3",
    "type": "fill",
    "page": 23,
    "exercise": "2b",
    "label": "3",
    "top": 59.8,
    "left": 72,
    "width": 6,
    "height": 1.8,
    "correct": "too"
  },
  {
    "id": "p23_ex2b_4",
    "type": "fill",
    "page": 23,
    "exercise": "2b",
    "label": "4",
    "top": 64.8,
    "left": 70,
    "width": 8,
    "height": 1.8,
    "correct": "also"
  },
  {
    "id": "p23_ex2b_5",
    "type": "fill",
    "page": 23,
    "exercise": "2b",
    "label": "5",
    "top": 69.8,
    "left": 61,
    "width": 14,
    "height": 1.8,
    "correct": "for example"
  },
  {
    "id": "p23_ex2b_6",
    "type": "fill",
    "page": 23,
    "exercise": "2b",
    "label": "6",
    "top": 76.5,
    "left": 61,
    "width": 14.5,
    "height": 1.8,
    "correct": "On top of that or on top of that"
  }
],
    24: [
  {
    "id": "p24_ex1_1",
    "type": "fill",
    "page": 24,
    "exercise": "1",
    "label": "1",
    "top": 28.5,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "ferry"
  },
  {
    "id": "p24_ex1_2",
    "type": "fill",
    "page": 24,
    "exercise": "1",
    "label": "2",
    "top": 31.8,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "sea"
  },
  {
    "id": "p24_ex1_3",
    "type": "fill",
    "page": 24,
    "exercise": "1",
    "label": "3",
    "top": 35.1,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "coast"
  },
  {
    "id": "p24_ex1_4",
    "type": "fill",
    "page": 24,
    "exercise": "1",
    "label": "4",
    "top": 38.4,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "island"
  },
  {
    "id": "p24_ex1_5",
    "type": "fill",
    "page": 24,
    "exercise": "1",
    "label": "5",
    "top": 41.7,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "mainland"
  },
  {
    "id": "p24_ex2_1",
    "type": "fill",
    "page": 24,
    "exercise": "2",
    "label": "1",
    "top": 52,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "floats"
  },
  {
    "id": "p24_ex2_2",
    "type": "fill",
    "page": 24,
    "exercise": "2",
    "label": "2",
    "top": 55.3,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "beaches"
  },
  {
    "id": "p24_ex2_3",
    "type": "fill",
    "page": 24,
    "exercise": "2",
    "label": "3",
    "top": 58.6,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "waves"
  },
  {
    "id": "p24_ex2_4",
    "type": "fill",
    "page": 24,
    "exercise": "2",
    "label": "4",
    "top": 61.9,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "inland"
  },
  {
    "id": "p24_ex2_5",
    "type": "fill",
    "page": 24,
    "exercise": "2",
    "label": "5",
    "top": 65.2,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "canals"
  },
  {
    "id": "p24_ex4_1",
    "type": "fill",
    "page": 24,
    "exercise": "4",
    "label": "1",
    "top": 38,
    "left": 55,
    "width": 18,
    "height": 1.8,
    "correct": "isn't going to or is not going to"
  },
  {
    "id": "p24_ex4_2",
    "type": "fill",
    "page": 24,
    "exercise": "4",
    "label": "2",
    "top": 41.5,
    "left": 55,
    "width": 14,
    "height": 1.8,
    "correct": "won't or will not"
  },
  {
    "id": "p24_ex4_3",
    "type": "fill",
    "page": 24,
    "exercise": "4",
    "label": "3",
    "top": 45,
    "left": 55,
    "width": 16,
    "height": 1.8,
    "correct": "'re going to or are going to"
  },
  {
    "id": "p24_ex4_4",
    "type": "fill",
    "page": 24,
    "exercise": "4",
    "label": "4",
    "top": 48.5,
    "left": 55,
    "width": 12,
    "height": 1.8,
    "correct": "'ll or will"
  },
  {
    "id": "p24_ex4_5",
    "type": "fill",
    "page": 24,
    "exercise": "4",
    "label": "5",
    "top": 52,
    "left": 55,
    "width": 16,
    "height": 1.8,
    "correct": "'re going to or are going to"
  },
  {
    "id": "p24_ex5a_1",
    "type": "fill",
    "page": 24,
    "exercise": "5a",
    "label": "1",
    "top": 62,
    "left": 55,
    "width": 16,
    "height": 1.8,
    "correct": "'m going to or am going to"
  },
  {
    "id": "p24_ex5a_2",
    "type": "fill",
    "page": 24,
    "exercise": "5a",
    "label": "2",
    "top": 65.5,
    "left": 55,
    "width": 16,
    "height": 1.8,
    "correct": "'re going to or are going to"
  },
  {
    "id": "p24_ex5a_3",
    "type": "fill",
    "page": 24,
    "exercise": "5a",
    "label": "3",
    "top": 69,
    "left": 55,
    "width": 16,
    "height": 1.8,
    "correct": "'re going to or are going to"
  },
  {
    "id": "p24_ex5a_4",
    "type": "fill",
    "page": 24,
    "exercise": "5a",
    "label": "4",
    "top": 72.5,
    "left": 55,
    "width": 12,
    "height": 1.8,
    "correct": "'ll or will"
  },
  {
    "id": "p24_ex5a_5",
    "type": "fill",
    "page": 24,
    "exercise": "5a",
    "label": "5",
    "top": 76,
    "left": 55,
    "width": 12,
    "height": 1.8,
    "correct": "will"
  },
  {
    "id": "p24_ex5a_6",
    "type": "fill",
    "page": 24,
    "exercise": "5a",
    "label": "6",
    "top": 79.5,
    "left": 55,
    "width": 12,
    "height": 1.8,
    "correct": "will"
  },
  {
    "id": "p24_ex5a_7",
    "type": "fill",
    "page": 24,
    "exercise": "5a",
    "label": "7",
    "top": 83,
    "left": 55,
    "width": 12,
    "height": 1.8,
    "correct": "'ll or will"
  }
],
    25: [
  {
    "id": "p25_ex6a_1",
    "type": "fill",
    "page": 25,
    "exercise": "6a",
    "label": "1",
    "top": 22,
    "left": 10.9,
    "width": 22,
    "height": 1.8,
    "correct": "will definitely join"
  },
  {
    "id": "p25_ex6a_2",
    "type": "fill",
    "page": 25,
    "exercise": "6a",
    "label": "2",
    "top": 26.5,
    "left": 10.9,
    "width": 22,
    "height": 1.8,
    "correct": "are likely to plant"
  },
  {
    "id": "p25_ex6a_3",
    "type": "fill",
    "page": 25,
    "exercise": "6a",
    "label": "3",
    "top": 31,
    "left": 10.9,
    "width": 30,
    "height": 1.8,
    "correct": "will definitely not survive or definitely won't survive"
  },
  {
    "id": "p25_ex6a_4",
    "type": "fill",
    "page": 25,
    "exercise": "6a",
    "label": "4",
    "top": 35.5,
    "left": 10.9,
    "width": 25,
    "height": 1.8,
    "correct": "will possibly take part"
  },
  {
    "id": "p25_ex6a_5",
    "type": "fill",
    "page": 25,
    "exercise": "6a",
    "label": "5",
    "top": 40,
    "left": 10.9,
    "width": 25,
    "height": 1.8,
    "correct": "probably won't need"
  },
  {
    "id": "p25_ex6a_6",
    "type": "fill",
    "page": 25,
    "exercise": "6a",
    "label": "6",
    "top": 44.5,
    "left": 10.9,
    "width": 25,
    "height": 1.8,
    "correct": "is unlikely to succeed"
  },
  {
    "id": "p25_ex7_1",
    "type": "fill",
    "page": 25,
    "exercise": "7",
    "label": "1",
    "top": 54,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "won't"
  },
  {
    "id": "p25_ex7_2",
    "type": "fill",
    "page": 25,
    "exercise": "7",
    "label": "2",
    "top": 57.5,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "will"
  },
  {
    "id": "p25_ex7_3",
    "type": "fill",
    "page": 25,
    "exercise": "7",
    "label": "3",
    "top": 61,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "may"
  },
  {
    "id": "p25_ex7_4",
    "type": "fill",
    "page": 25,
    "exercise": "7",
    "label": "4",
    "top": 64.5,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "might"
  },
  {
    "id": "p25_ex7_5",
    "type": "fill",
    "page": 25,
    "exercise": "7",
    "label": "5",
    "top": 68,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "likely"
  },
  {
    "id": "p25_ex7_6",
    "type": "fill",
    "page": 25,
    "exercise": "7",
    "label": "6",
    "top": 71.5,
    "left": 10.9,
    "width": 16,
    "height": 1.8,
    "correct": "will probably"
  },
  {
    "id": "p25_ex3b_1",
    "type": "fill",
    "page": 25,
    "exercise": "3b",
    "label": "1",
    "top": 45,
    "left": 55,
    "width": 14,
    "height": 1.8,
    "correct": "centre"
  },
  {
    "id": "p25_ex3b_2",
    "type": "fill",
    "page": 25,
    "exercise": "3b",
    "label": "2",
    "top": 48.5,
    "left": 55,
    "width": 10,
    "height": 1.8,
    "correct": "it"
  },
  {
    "id": "p25_ex3b_3",
    "type": "fill",
    "page": 25,
    "exercise": "3b",
    "label": "3",
    "top": 52,
    "left": 55,
    "width": 16,
    "height": 1.8,
    "correct": "fascinating"
  },
  {
    "id": "p25_ex3b_4",
    "type": "fill",
    "page": 25,
    "exercise": "3b",
    "label": "4",
    "top": 55.5,
    "left": 55,
    "width": 16,
    "height": 1.8,
    "correct": "traditional"
  },
  {
    "id": "p25_ex3b_5",
    "type": "fill",
    "page": 25,
    "exercise": "3b",
    "label": "5",
    "top": 59,
    "left": 55,
    "width": 16,
    "height": 1.8,
    "correct": "hometown"
  },
  {
    "id": "p25_ex3b_6",
    "type": "fill",
    "page": 25,
    "exercise": "3b",
    "label": "6",
    "top": 62.5,
    "left": 55,
    "width": 14,
    "height": 1.8,
    "correct": "place"
  },
  {
    "id": "p25_ex3b_7",
    "type": "fill",
    "page": 25,
    "exercise": "3b",
    "label": "7",
    "top": 66,
    "left": 55,
    "width": 12,
    "height": 1.8,
    "correct": "there"
  },
  {
    "id": "p25_ex3b_8",
    "type": "fill",
    "page": 25,
    "exercise": "3b",
    "label": "8",
    "top": 69.5,
    "left": 55,
    "width": 12,
    "height": 1.8,
    "correct": "great"
  }
],
    26: [
  {
    "id": "p26_ex1_1",
    "type": "fill",
    "page": 26,
    "exercise": "1",
    "label": "1",
    "top": 24.5,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "fresh air"
  },
  {
    "id": "p26_ex1_2",
    "type": "fill",
    "page": 26,
    "exercise": "1",
    "label": "2",
    "top": 27.5,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "season"
  },
  {
    "id": "p26_ex1_3",
    "type": "fill",
    "page": 26,
    "exercise": "1",
    "label": "3",
    "top": 30.5,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "sunshine"
  },
  {
    "id": "p26_ex1_4",
    "type": "fill",
    "page": 26,
    "exercise": "1",
    "label": "4",
    "top": 33.5,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "landscape"
  },
  {
    "id": "p26_ex1_5",
    "type": "fill",
    "page": 26,
    "exercise": "1",
    "label": "5",
    "top": 36.5,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "sunset"
  },
  {
    "id": "p26_ex1_6",
    "type": "fill",
    "page": 26,
    "exercise": "1",
    "label": "6",
    "top": 39.5,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "scenery"
  },
  {
    "id": "p26_ex2a_1",
    "type": "fill",
    "page": 26,
    "exercise": "2a",
    "label": "1",
    "top": 52,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "landscape"
  },
  {
    "id": "p26_ex2a_2",
    "type": "fill",
    "page": 26,
    "exercise": "2a",
    "label": "2",
    "top": 55,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "season"
  },
  {
    "id": "p26_ex2a_3",
    "type": "fill",
    "page": 26,
    "exercise": "2a",
    "label": "3",
    "top": 58,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "fresh air"
  },
  {
    "id": "p26_ex2a_4",
    "type": "fill",
    "page": 26,
    "exercise": "2a",
    "label": "4",
    "top": 61,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "sunset"
  },
  {
    "id": "p26_ex2a_5",
    "type": "fill",
    "page": 26,
    "exercise": "2a",
    "label": "5",
    "top": 64,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "sunshine"
  },
  {
    "id": "p26_ex2a_6",
    "type": "fill",
    "page": 26,
    "exercise": "2a",
    "label": "6",
    "top": 67,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "scenery"
  }
],
    27: [
  {
    "id": "p27_ex3_1",
    "type": "fill",
    "page": 27,
    "exercise": "3",
    "label": "1",
    "top": 22,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "landscape"
  },
  {
    "id": "p27_ex3_2",
    "type": "fill",
    "page": 27,
    "exercise": "3",
    "label": "2",
    "top": 25.5,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "valleys"
  },
  {
    "id": "p27_ex3_3",
    "type": "fill",
    "page": 27,
    "exercise": "3",
    "label": "3",
    "top": 29,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "waterfalls"
  },
  {
    "id": "p27_ex3_4",
    "type": "fill",
    "page": 27,
    "exercise": "3",
    "label": "4",
    "top": 32.5,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "cliffs"
  },
  {
    "id": "p27_ex3_5",
    "type": "fill",
    "page": 27,
    "exercise": "3",
    "label": "5",
    "top": 36,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "soil"
  },
  {
    "id": "p27_ex3_6",
    "type": "fill",
    "page": 27,
    "exercise": "3",
    "label": "6",
    "top": 39.5,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "scenery"
  },
  {
    "id": "p27_ex4_1",
    "type": "fill",
    "page": 27,
    "exercise": "4",
    "label": "1",
    "top": 52,
    "left": 55,
    "width": 18,
    "height": 1.8,
    "correct": "'re going to stay or are going to stay"
  },
  {
    "id": "p27_ex4_2",
    "type": "fill",
    "page": 27,
    "exercise": "4",
    "label": "2",
    "top": 56,
    "left": 55,
    "width": 12,
    "height": 1.8,
    "correct": "'ll go or will go"
  },
  {
    "id": "p27_ex4_3",
    "type": "fill",
    "page": 27,
    "exercise": "4",
    "label": "3",
    "top": 60,
    "left": 55,
    "width": 18,
    "height": 1.8,
    "correct": "'re going to climb or are going to climb"
  },
  {
    "id": "p27_ex4_4",
    "type": "fill",
    "page": 27,
    "exercise": "4",
    "label": "4",
    "top": 64,
    "left": 55,
    "width": 18,
    "height": 1.8,
    "correct": "'re going to book or are going to book"
  },
  {
    "id": "p27_ex4_5",
    "type": "fill",
    "page": 27,
    "exercise": "4",
    "label": "5",
    "top": 68,
    "left": 55,
    "width": 16,
    "height": 1.8,
    "correct": "will destroy"
  },
  {
    "id": "p27_ex4_6",
    "type": "fill",
    "page": 27,
    "exercise": "4",
    "label": "6",
    "top": 72,
    "left": 55,
    "width": 12,
    "height": 1.8,
    "correct": "'ll tell or will tell"
  }
],
    28: [
  {
    "id": "p28_ex1_1",
    "type": "fill",
    "page": 28,
    "exercise": "1",
    "label": "1",
    "top": 24,
    "left": 10.9,
    "width": 10,
    "height": 1.8,
    "correct": "at"
  },
  {
    "id": "p28_ex1_2",
    "type": "fill",
    "page": 28,
    "exercise": "1",
    "label": "2",
    "top": 27.5,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "anywhere"
  },
  {
    "id": "p28_ex1_3",
    "type": "fill",
    "page": 28,
    "exercise": "1",
    "label": "3",
    "top": 31,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "sardines"
  },
  {
    "id": "p28_ex1_4",
    "type": "fill",
    "page": 28,
    "exercise": "1",
    "label": "4",
    "top": 34.5,
    "left": 10.9,
    "width": 10,
    "height": 1.8,
    "correct": "of"
  },
  {
    "id": "p28_ex1_5",
    "type": "fill",
    "page": 28,
    "exercise": "1",
    "label": "5",
    "top": 38,
    "left": 10.9,
    "width": 10,
    "height": 1.8,
    "correct": "for"
  },
  {
    "id": "p28_ex1_6",
    "type": "fill",
    "page": 28,
    "exercise": "1",
    "label": "6",
    "top": 41.5,
    "left": 10.9,
    "width": 10,
    "height": 1.8,
    "correct": "back"
  },
  {
    "id": "p28_ex1_7",
    "type": "fill",
    "page": 28,
    "exercise": "1",
    "label": "7",
    "top": 45,
    "left": 10.9,
    "width": 10,
    "height": 1.8,
    "correct": "down"
  },
  {
    "id": "p28_ex1_8",
    "type": "fill",
    "page": 28,
    "exercise": "1",
    "label": "8",
    "top": 48.5,
    "left": 10.9,
    "width": 10,
    "height": 1.8,
    "correct": "over"
  },
  {
    "id": "p28_ex2_1",
    "type": "fill",
    "page": 28,
    "exercise": "2",
    "label": "1",
    "top": 60,
    "left": 10.9,
    "width": 30,
    "height": 1.8,
    "correct": "are making themselves at home"
  },
  {
    "id": "p28_ex2_2",
    "type": "fill",
    "page": 28,
    "exercise": "2",
    "label": "2",
    "top": 64.5,
    "left": 10.9,
    "width": 22,
    "height": 1.8,
    "correct": "run out of space"
  },
  {
    "id": "p28_ex2_3",
    "type": "fill",
    "page": 28,
    "exercise": "2",
    "label": "3",
    "top": 69,
    "left": 10.9,
    "width": 18,
    "height": 1.8,
    "correct": "get rid of"
  },
  {
    "id": "p28_ex2_4",
    "type": "fill",
    "page": 28,
    "exercise": "2",
    "label": "4",
    "top": 73.5,
    "left": 10.9,
    "width": 22,
    "height": 1.8,
    "correct": "all over the place"
  },
  {
    "id": "p28_ex2_5",
    "type": "fill",
    "page": 28,
    "exercise": "2",
    "label": "5",
    "top": 78,
    "left": 10.9,
    "width": 18,
    "height": 1.8,
    "correct": "settling down"
  },
  {
    "id": "p28_ex2_6",
    "type": "fill",
    "page": 28,
    "exercise": "2",
    "label": "6",
    "top": 82.5,
    "left": 10.9,
    "width": 18,
    "height": 1.8,
    "correct": "feel at home"
  }
],
    29: [
  {
    "id": "p29_ex1b_1",
    "type": "fill",
    "page": 29,
    "exercise": "1b",
    "label": "1",
    "top": 32.5,
    "left": 10.9,
    "width": 10,
    "height": 1.8,
    "correct": "can I"
  },
  {
    "id": "p29_ex1b_2",
    "type": "fill",
    "page": 29,
    "exercise": "1b",
    "label": "2",
    "top": 35.5,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "wonder if"
  },
  {
    "id": "p29_ex1b_3",
    "type": "fill",
    "page": 29,
    "exercise": "1b",
    "label": "3",
    "top": 38.5,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "aware that"
  },
  {
    "id": "p29_ex1b_4",
    "type": "fill",
    "page": 29,
    "exercise": "1b",
    "label": "4",
    "top": 41.5,
    "left": 10.9,
    "width": 12,
    "height": 1.8,
    "correct": "Could you"
  },
  {
    "id": "p29_ex1b_5",
    "type": "fill",
    "page": 29,
    "exercise": "1b",
    "label": "5",
    "top": 44.5,
    "left": 10.9,
    "width": 16,
    "height": 1.8,
    "correct": "with anything"
  },
  {
    "id": "p29_ex1b_6",
    "type": "fill",
    "page": 29,
    "exercise": "1b",
    "label": "6",
    "top": 47.5,
    "left": 10.9,
    "width": 12,
    "height": 1.8,
    "correct": "you tell"
  },
  {
    "id": "p29_ex1b_7",
    "type": "fill",
    "page": 29,
    "exercise": "1b",
    "label": "7",
    "top": 50.5,
    "left": 10.9,
    "width": 16,
    "height": 1.8,
    "correct": "appreciate"
  }
],
    30: [
  {
    "id": "p30_ex1_1",
    "type": "choose",
    "page": 30,
    "exercise": "1",
    "group": "p30_1",
    "text": "Cardboard shelters",
    "top": 58.5,
    "left": 10.9,
    "width": 22,
    "height": 1.7,
    "correct": true
  },
  {
    "id": "p30_ex1_2",
    "type": "choose",
    "page": 30,
    "exercise": "1",
    "group": "p30_1",
    "text": "Concrete skyscrapers",
    "top": 61.5,
    "left": 10.9,
    "width": 22,
    "height": 1.7,
    "correct": false
  },
  {
    "id": "p30_ex2_2",
    "type": "fill",
    "page": 30,
    "exercise": "2",
    "label": "2",
    "top": 68,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "architect"
  },
  {
    "id": "p30_ex2_3",
    "type": "fill",
    "page": 30,
    "exercise": "2",
    "label": "3",
    "top": 71.5,
    "left": 10.9,
    "width": 16,
    "height": 1.8,
    "correct": "architecture"
  },
  {
    "id": "p30_ex2_4",
    "type": "fill",
    "page": 30,
    "exercise": "2",
    "label": "4",
    "top": 75,
    "left": 10.9,
    "width": 14,
    "height": 1.8,
    "correct": "recycled"
  },
  {
    "id": "p30_ex3_1",
    "type": "fill",
    "page": 30,
    "exercise": "3",
    "label": "1",
    "top": 50,
    "left": 55,
    "width": 12,
    "height": 1.8,
    "correct": "known"
  },
  {
    "id": "p30_ex3_2",
    "type": "fill",
    "page": 30,
    "exercise": "3",
    "label": "2",
    "top": 53.5,
    "left": 55,
    "width": 12,
    "height": 1.8,
    "correct": "disaster"
  },
  {
    "id": "p30_ex3_3",
    "type": "fill",
    "page": 30,
    "exercise": "3",
    "label": "3",
    "top": 57,
    "left": 55,
    "width": 12,
    "height": 1.8,
    "correct": "solution"
  },
  {
    "id": "p30_ex3_4",
    "type": "fill",
    "page": 30,
    "exercise": "3",
    "label": "4",
    "top": 60.5,
    "left": 55,
    "width": 12,
    "height": 1.8,
    "correct": "refugee"
  },
  {
    "id": "p30_ex3_5",
    "type": "fill",
    "page": 30,
    "exercise": "3",
    "label": "5",
    "top": 64,
    "left": 55,
    "width": 12,
    "height": 1.8,
    "correct": "homes"
  },
  {
    "id": "p30_ex3_6",
    "type": "fill",
    "page": 30,
    "exercise": "3",
    "label": "6",
    "top": 67.5,
    "left": 55,
    "width": 12,
    "height": 1.8,
    "correct": "wood"
  },
  {
    "id": "p30_ex3_7",
    "type": "fill",
    "page": 30,
    "exercise": "3",
    "label": "7",
    "top": 71,
    "left": 55,
    "width": 10,
    "height": 1.8,
    "correct": "easy"
  },
  {
    "id": "p30_ex3_8",
    "type": "fill",
    "page": 30,
    "exercise": "3",
    "label": "8",
    "top": 74.5,
    "left": 55,
    "width": 10,
    "height": 1.8,
    "correct": "saved"
  }
],
    31: [
  {
    "id": "p31_ex1_1",
    "type": "fill",
    "page": 31,
    "exercise": "1",
    "label": "1",
    "top": 22,
    "left": 10.9,
    "width": 35,
    "height": 1.8,
    "correct": "Andy wasn't able to open the front door."
  },
  {
    "id": "p31_ex1_2",
    "type": "fill",
    "page": 31,
    "exercise": "1",
    "label": "2",
    "top": 26.5,
    "left": 10.9,
    "width": 35,
    "height": 1.8,
    "correct": "We definitely won't get home before nine o'clock."
  },
  {
    "id": "p31_ex1_3",
    "type": "fill",
    "page": 31,
    "exercise": "1",
    "label": "3",
    "top": 31,
    "left": 10.9,
    "width": 35,
    "height": 1.8,
    "correct": "I didn't manage to finish the exercise."
  },
  {
    "id": "p31_ex1_4",
    "type": "fill",
    "page": 31,
    "exercise": "1",
    "label": "4",
    "top": 35.5,
    "left": 10.9,
    "width": 35,
    "height": 1.8,
    "correct": "You don't have to stay here all evening."
  },
  {
    "id": "p31_ex1_5",
    "type": "fill",
    "page": 31,
    "exercise": "1",
    "label": "5",
    "top": 40,
    "left": 10.9,
    "width": 35,
    "height": 1.8,
    "correct": "They are unlikely to get much better at maths."
  },
  {
    "id": "p31_ex1_6",
    "type": "fill",
    "page": 31,
    "exercise": "1",
    "label": "6",
    "top": 44.5,
    "left": 10.9,
    "width": 35,
    "height": 1.8,
    "correct": "What does she need to do to pass the exam?"
  },
  {
    "id": "p31_ex3_1",
    "type": "fill",
    "page": 31,
    "exercise": "3",
    "label": "1",
    "top": 56,
    "left": 10.9,
    "width": 12,
    "height": 1.8,
    "correct": "peak"
  },
  {
    "id": "p31_ex3_2",
    "type": "fill",
    "page": 31,
    "exercise": "3",
    "label": "2",
    "top": 59.5,
    "left": 10.9,
    "width": 12,
    "height": 1.8,
    "correct": "coast"
  },
  {
    "id": "p31_ex3_3",
    "type": "fill",
    "page": 31,
    "exercise": "3",
    "label": "3",
    "top": 63,
    "left": 10.9,
    "width": 12,
    "height": 1.8,
    "correct": "ferry"
  },
  {
    "id": "p31_ex3_4",
    "type": "fill",
    "page": 31,
    "exercise": "3",
    "label": "4",
    "top": 66.5,
    "left": 10.9,
    "width": 12,
    "height": 1.8,
    "correct": "lake"
  },
  {
    "id": "p31_ex3_5",
    "type": "fill",
    "page": 31,
    "exercise": "3",
    "label": "5",
    "top": 70,
    "left": 10.9,
    "width": 12,
    "height": 1.8,
    "correct": "canal"
  },
  {
    "id": "p31_ex3_6",
    "type": "fill",
    "page": 31,
    "exercise": "3",
    "label": "6",
    "top": 73.5,
    "left": 10.9,
    "width": 12,
    "height": 1.8,
    "correct": "forest"
  },
  {
    "id": "p31_ex3_7",
    "type": "fill",
    "page": 31,
    "exercise": "3",
    "label": "7",
    "top": 77,
    "left": 10.9,
    "width": 12,
    "height": 1.8,
    "correct": "season"
  },
  {
    "id": "p31_ex3_8",
    "type": "fill",
    "page": 31,
    "exercise": "3",
    "label": "8",
    "top": 80.5,
    "left": 10.9,
    "width": 12,
    "height": 1.8,
    "correct": "island"
  }
]
  };

  // Get active inputs for a page (with custom saved overrides)
  WB.getPageInputs = function(page) {
    try {
      var saved = localStorage.getItem('ethith_wb_coords_v2_' + page);
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return WB.defaultInputs[page] || [];
  };

  WB.savePageInputs = function(page, inputs) {
    try {
      localStorage.setItem('ethith_wb_coords_v2_' + page, JSON.stringify(inputs));
    } catch(e) {}
  };

  WB.resetPageInputs = function(page) {
    try {
      localStorage.removeItem('ethith_wb_coords_v2_' + page);
    } catch(e) {}
  };

  // Resolve authentic page image URL
  WB.getPageImage = function(pageNum) {
    var basePath = window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    if (pageNum === 4) return basePath + 'workbook_b1_u1_p4.jpg';
    if (pageNum === 5) return basePath + 'workbook_b1_u1_p5.jpg';
    var pageFileNum = String(pageNum + 1).padStart(3, '0');
    return basePath + 'workbook_pages/page_' + pageFileNum + '.jpg';
  };

  // Check an individual input against correct options
  WB.checkAnswer = function(userVal, correctRaw) {
    var userClean = (userVal || '').trim().toLowerCase();
    if (!userClean) return false;
    var allowed = [];
    if (Array.isArray(correctRaw)) {
      allowed = correctRaw;
    } else if (typeof correctRaw === 'string') {
      allowed = correctRaw.split(/\s+or\s+/i);
    }
    return allowed.some(function(opt) {
      var optClean = opt.trim().toLowerCase();
      var norm1 = userClean.replace(/’/g, "'");
      var norm2 = optClean.replace(/’/g, "'");
      return norm1 === norm2;
    });
  };

  // Open Lesson Helper with robust multi-layer fallback
  WB.openLesson = function(unitNum, lessonCode, pageNum) {
    unitNum = parseInt(unitNum, 10) || 1;
    lessonCode = lessonCode || '1.1';
    var apView = document.getElementById('apView');
    if (window.go) {
      window.go('intermediate', { unit: unitNum, lesson: lessonCode, page: pageNum });
    } else if (window.ethithOpenApp) {
      window.ethithOpenApp('intermediate', { unit: unitNum, lesson: lessonCode, page: pageNum });
    } else if (apView) {
      WB.renderLesson(apView, unitNum, lessonCode);
    }
  };

  // Main Intermediate View Entry Point
  window.EthithViews = window.EthithViews || {};
  window.EthithViews.renderIntermediateView = function(container, arg) {
    if (!arg || !arg.unit) {
      renderUnitsCatalog(container);
    } else {
      var unitNum = parseInt(arg.unit, 10) || 1;
      var lessonCode = arg.lesson || (unitNum + '.1');
      WB.renderLesson(container, unitNum, lessonCode);
    }
  };

  // 1. Units Catalog View (Shows 12 Units in sequence)
  function renderUnitsCatalog(container) {
    var h = '<div class="eth-wb-catalog" style="max-width:1100px;margin:0 auto;padding:16px 20px 60px;">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;margin-bottom:24px;background:linear-gradient(135deg,rgba(14,165,233,0.12),rgba(30,58,138,0.22));border:1px solid rgba(56,189,248,0.3);padding:22px 26px;border-radius:20px;backdrop-filter:blur(10px);">' +
        '<div>' +
          '<div style="display:inline-flex;align-items:center;gap:6px;background:#0284c7;color:#fff;font-size:11px;font-weight:800;padding:4px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">' +
            '📘 Oxford Navigate B1+ Workbook' +
          '</div>' +
          '<h1 style="font-size:26px;font-weight:900;margin:0 0 6px;color:var(--text)">Intermediate (B1+) Darslik Dasturi</h1>' +
          '<p style="font-size:14px;color:var(--muted);margin:0;max-width:680px;line-height:1.5;">' +
            'Barcha 12 ta rasmiy Unitlar va mashqlar kitobi. PDF usulidagi uzluksiz sahifalar, turli interaktiv topshiriqlar (o‘qib yozish, chizib o‘chirish, variant tanlash, bog‘lash, joylashtirish). <b style="color:#38bdf8;">(Listening mashqlari butunlay chiqarilgan).</b>' +
          '</p>' +
        '</div>' +
        '<div style="display:flex;gap:10px;align-items:center;">' +
          '<div style="background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px 18px;text-align:center;">' +
            '<div style="font-size:20px;font-weight:900;color:#0ea5e9;">12</div>' +
            '<div style="font-size:11px;font-weight:700;color:var(--muted);">Jami Unitlar</div>' +
          '</div>' +
          '<div style="background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px 18px;text-align:center;">' +
            '<div style="font-size:20px;font-weight:900;color:#10b981;">113</div>' +
            '<div style="font-size:11px;font-weight:700;color:var(--muted);">Kitob Sahifalari</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    // Unit Grid (12 units)
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));gap:18px;">';

    WB.units.forEach(function(u) {
      var isAvail = u.available;
      h += '<div class="eth-wb-unit-card" style="background:var(--card);border:1.5px solid ' + (isAvail ? '#38bdf8' : 'var(--line)') + ';border-radius:18px;padding:20px;position:relative;display:flex;flex-direction:column;justify-content:space-between;transition:all 0.25s ease;box-shadow:' + (isAvail ? '0 12px 30px -10px rgba(14,165,233,0.3)' : 'none') + ';">' +
        '<div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">' +
            '<span style="font-size:12px;font-weight:800;color:' + (isAvail ? '#0284c7' : 'var(--muted)') + ';text-transform:uppercase;letter-spacing:0.04em;">UNIT ' + u.unit + '</span>' +
            '<span style="font-size:11px;font-weight:700;padding:3px 9px;border-radius:12px;background:' + (isAvail ? 'rgba(16,185,129,0.15)' : 'var(--soft)') + ';color:' + (isAvail ? '#10b981' : 'var(--muted)') + ';">' +
              (isAvail ? '● Ochiq (Tayyor)' : '🔒 Tayyorlanmoqda') +
            '</span>' +
          '</div>' +
          '<h3 style="font-size:18px;font-weight:800;margin:0 0 6px;color:var(--text);">' + u.title + '</h3>' +
          '<p style="font-size:13px;color:var(--muted);margin:0 0 16px;line-height:1.4;">' + u.subtitle + '</p>';

      if (u.lessons && u.lessons.length > 0) {
        h += '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">';
        u.lessons.forEach(function(les) {
          h += '<div class="eth-wb-lesson-row" data-unit="' + u.unit + '" data-lesson="' + les.code + '" ' +
            'onclick="if(window.ETHITH_WORKBOOK_B1) window.ETHITH_WORKBOOK_B1.openLesson(' + u.unit + ', \'' + les.code + '\');" ' +
            'style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 12px;border-radius:12px;background:rgba(14,165,233,0.08);border:1.5px solid rgba(56,189,248,0.25);cursor:pointer;transition:all 0.2s;">' +
            '<div style="min-width:0;flex:1;">' +
              '<div style="font-size:13.5px;font-weight:800;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + les.title + '</div>' +
              '<div style="font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + les.desc + '</div>' +
            '</div>' +
            '<button type="button" ' +
              'onclick="event.stopPropagation(); if(window.ETHITH_WORKBOOK_B1) window.ETHITH_WORKBOOK_B1.openLesson(' + u.unit + ', \'' + les.code + '\');" ' +
              'style="flex:none;background:linear-gradient(135deg, #0284c7, #154b89);color:#fff;border:none;border-radius:10px;padding:7px 16px;font-size:12.5px;font-weight:900;cursor:pointer;box-shadow:0 4px 14px rgba(2,132,199,0.35);">' +
              'Boshlash ➔' +
            '</button>' +
          '</div>';
        });
        h += '</div>';
      }

      h += '</div>' +
        '<div style="border-top:1px solid var(--line);padding-top:12px;display:flex;align-items:center;justify-content:space-between;font-size:12px;color:var(--muted);">' +
          '<span>Navigate B1+ Workbook</span>' +
          '<span>' + (u.lessons ? u.lessons.length + ' ta dars' : '5 Dars') + '</span>' +
        '</div>' +
      '</div>';
    });

    h += '</div></div>';
    container.innerHTML = h;
  }

  WB.renderUnitsCatalog = renderUnitsCatalog;

  // 2. Interactive Digital Workbook Viewer (Continuous Vertical Scroll PDF-Style)
  function renderLesson(container, unitNum, lessonCode) {
    unitNum = parseInt(unitNum, 10) || 1;
    lessonCode = lessonCode || (unitNum + '.1');

    var unitData = WB.units.find(function(u) { return u.unit === unitNum; }) || WB.units[0];
    var lessonData = null;
    if (unitData && unitData.lessons) {
      lessonData = unitData.lessons.find(function(l) { return l.code === lessonCode; });
    }
    if (!lessonData) {
      lessonData = { code: lessonCode, title: "Unit " + lessonCode, desc: "Interactive Workbook Pages", pages: [4, 5] };
    }

    var pages = lessonData.pages || [4, 5];
    var isTeacher = isTeacherRole();
    var isEditor = isTeacher && (window._ethithWbEditorMode === true);

    var h = '<div class="eth-wb-viewer" style="max-width:1050px;margin:0 auto;padding:12px 16px 80px;">' +
      // Header & Navigation Strip
      '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:14px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px 18px;">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<button id="ethWbBackBtn" style="background:var(--soft);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:8px 14px;font-size:12.5px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:6px;">' +
            '← Barcha Unitlar' +
          '</button>' +
          '<div>' +
            '<div style="font-size:15px;font-weight:900;color:var(--text);">' + lessonData.title + '</div>' +
            '<div style="font-size:11.5px;color:var(--muted);">' + lessonData.desc + ' · Uzluksiz PDF ko‘rinishi (Ikkala sahifa birga)</div>' +
          '</div>' +
        '</div>' +

        // Controls
        '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
          // Jump pills for quick scroll
          '<div style="display:inline-flex;background:var(--soft);border:1px solid var(--line);border-radius:10px;padding:3px;gap:2px;">';

    pages.forEach(function(p, idx) {
      h += '<button class="eth-wb-jump-btn" data-target="ethWbPage_' + p + '" style="border:none;background:transparent;color:var(--text);padding:6px 12px;border-radius:8px;font-weight:800;font-size:11.5px;cursor:pointer;">' +
        '📄 ' + (idx + 1) + '-bet (' + p + '-sahifa)' +
      '</button>';
    });

    h += '</div>';

    // Visual Editor Mode Toggle: STRICTLY FOR TEACHERS ONLY
    if (isTeacher) {
      h += '<button id="ethWbToggleEditor" style="background:' + (isEditor ? '#ef4444' : '#10b981') + ';color:#fff;border:none;border-radius:10px;padding:8px 14px;font-size:12px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 12px rgba(16,185,129,0.3);">' +
        (isEditor ? '✖ Tahrirlashni Yopish' : '✏️ Visual Editor (Ustoz)') +
      '</button>';
    }

    h += '</div></div>';

    // Visual Editor Toolbar if teacher is actively editing
    if (isEditor) {
      h += '<div id="ethWbEditorToolbar" style="background:rgba(15,23,42,0.95);border:2px solid #38bdf8;border-radius:14px;padding:12px 18px;margin-bottom:14px;color:#fff;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;box-shadow:0 8px 24px rgba(0,0,0,0.4);">' +
        '<div style="font-size:13px;line-height:1.5;">' +
          '<b style="color:#38bdf8;">Visual Editor Faol:</b> ' +
          '<span>🖱️ <b>Sichqonchaning o‘ng tugmasi:</b> bosilganda katakcha darhol o‘chadi! | </span>' +
          '<span>✋ <b>Chap tugma bilan bosib tortish:</b> katakchani xohlagan joyga ko‘chiradi! | </span>' +
          '<span>➕ <b>Bo‘sh joyda tortish:</b> yangi katakcha chizadi.</span>' +
        '</div>' +
        '<div style="display:flex;gap:8px;align-items:center;">' +
          '<button id="ethWbExportBtn" style="background:#0284c7;color:#fff;border:none;padding:7px 12px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;">📋 JSON Nusxa</button>' +
          '<button id="ethWbSaveAllBtn" style="background:#10b981;color:#fff;border:none;padding:7px 12px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;">💾 Saqlash</button>' +
          '<button id="ethWbResetCoordsBtn" style="background:#64748b;color:#fff;border:none;padding:7px 12px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;">↺ Asliga qaytarish</button>' +
        '</div>' +
      '</div>';
    }

    // Interactive Instruction Badge
    h += '<div style="margin-bottom:14px;background:rgba(14,165,233,0.1);border:1px solid rgba(56,189,248,0.3);border-radius:12px;padding:10px 16px;display:flex;align-items:center;gap:12px;font-size:12.5px;color:var(--text);flex-wrap:wrap;">' +
      '<span style="font-weight:800;color:#0284c7;">🎯 Mashq qilish:</span>' +
      '<span>✍️ <b>Yozish:</b> chiziqqa bosing</span>' +
      '<span>✂️ <b>O‘chirish:</b> noto‘g‘ri so‘zga bosing</span>' +
      '<span>🔘 <b>Tanlash:</b> to‘g‘ri variantga bosing</span>' +
      '<span>🔗 <b>Bog‘lash:</b> harf katagiga bosing</span>' +
      '<span>📍 <b>Joylashtirish:</b> so‘zlar orasiga bosing</span>' +
      '<span style="margin-left:auto;color:var(--muted);font-size:11.5px;">(Pastga sursangiz keyingi sahifa chiqadi)</span>' +
    '</div>';

    // Pages Display Container - VERTICAL CONTINUOUS PDF SCROLL
    h += '<div id="ethWbPagesWrap" style="display:flex;flex-direction:column;gap:30px;align-items:center;">';

    pages.forEach(function(pageNum, idx) {
      var imgSrc = WB.getPageImage(pageNum);
      var inputs = WB.getPageInputs(pageNum);
      h += renderSinglePageBlock(pageNum, idx + 1, imgSrc, inputs, isEditor);
    });

    h += '</div>';

    // Bottom Sticky Action Bar (Unified evaluation for all pages in this lesson)
    h += '<div style="position:sticky;bottom:16px;z-index:90;margin-top:24px;background:rgba(15,23,42,0.92);backdrop-filter:blur(12px);border:1px solid rgba(56,189,248,0.4);border-radius:18px;padding:12px 22px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;box-shadow:0 14px 40px rgba(0,0,0,0.5);color:#fff;">' +
      '<div style="display:flex;align-items:center;gap:14px;">' +
        '<div id="ethWbScoreDisplay" style="font-size:14px;font-weight:800;display:inline-flex;align-items:center;gap:6px;">' +
          '<span>Bajarildi: <b id="ethWbAnsweredCount" style="color:#38bdf8;">0</b> / <span id="ethWbTotalCount">0</span></span>' +
        '</div>' +
        '<div id="ethWbResultPill" style="display:none;font-size:13px;font-weight:800;padding:4px 12px;border-radius:20px;background:rgba(16,185,129,0.2);color:#34d399;border:1px solid rgba(52,211,153,0.4);"></div>' +
      '</div>' +

      '<div style="display:flex;align-items:center;gap:10px;">' +
        '<button id="ethWbResetBtn" style="background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.2);padding:9px 18px;border-radius:12px;font-size:13px;font-weight:800;cursor:pointer;">' +
          '↻ Tozalash' +
        '</button>' +
        '<button id="ethWbCheckBtn" style="background:linear-gradient(135deg,#0284c7,#154b89);color:#fff;border:none;padding:10px 24px;border-radius:12px;font-size:14px;font-weight:900;cursor:pointer;box-shadow:0 6px 20px rgba(2,132,199,0.4);">' +
          '✓ Tekshirish (Check Both Pages)' +
        '</button>' +
      '</div>' +
    '</div>';

    // Interactive Edit Modal for Teachers
    if (isTeacher) {
      h += '<div id="ethWbInputModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;align-items:center;justify-content:center;backdrop-filter:blur(4px);">' +
        '<div style="background:var(--card);border:2px solid #38bdf8;border-radius:18px;padding:22px;max-width:440px;width:90%;color:var(--text);box-shadow:0 20px 50px rgba(0,0,0,0.5);">' +
          '<h3 id="ethWbModalTitle" style="font-size:17px;font-weight:900;margin:0 0 14px;color:#0284c7;">Katakcha Sozlamalari</h3>' +
          '<div style="margin-bottom:12px;">' +
            '<label style="display:block;font-size:12px;font-weight:800;margin-bottom:4px;color:var(--muted);">Turi (type):</label>' +
            '<select id="ethWbModalType" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--line);background:var(--soft);color:var(--text);font-weight:700;">' +
              '<option value="fill">Fill (O‘qib yozish)</option>' +
              '<option value="cross">Cross (Chizib o‘chirish)</option>' +
              '<option value="choose">Choose (Variant tanlash)</option>' +
              '<option value="match">Match (Harf bilan bog‘lash)</option>' +
              '<option value="insert">Insert (Prepozitsiya kiritish)</option>' +
            '</select>' +
          '</div>' +
          '<div style="margin-bottom:12px;">' +
            '<label style="display:block;font-size:12px;font-weight:800;margin-bottom:4px;color:var(--muted);">Guruh / Belgisi:</label>' +
            '<input type="text" id="ethWbModalLabel" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--line);background:var(--soft);color:var(--text);font-weight:700;" placeholder="masalan: 2 yoki 3.1" />' +
          '</div>' +
          '<div style="margin-bottom:14px;">' +
            '<label style="display:block;font-size:12px;font-weight:800;margin-bottom:4px;color:var(--muted);">To‘g‘ri Javob ("or" bilan ajrating):</label>' +
            '<input type="text" id="ethWbModalCorrect" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--line);background:var(--soft);color:var(--text);font-weight:700;" placeholder="masalan: access yoki time or TIME" />' +
          '</div>' +
          '<div style="display:flex;justify-content:space-between;gap:8px;">' +
            '<button id="ethWbModalDeleteBtn" style="background:#ef4444;color:#fff;border:none;padding:8px 14px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;">O‘chirish</button>' +
            '<div style="display:flex;gap:8px;">' +
              '<button id="ethWbModalCancelBtn" style="background:var(--soft);color:var(--text);border:1px solid var(--line);padding:8px 14px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;">Bekor qilish</button>' +
              '<button id="ethWbModalSaveBtn" style="background:#0284c7;color:#fff;border:none;padding:8px 18px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;">Saqlash</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }

    h += '</div>';
    container.innerHTML = h;

    attachViewerHandlers(container, unitNum, lessonCode, pages, isEditor, isTeacher);
  }

  // Render a single page with multi-type interactive elements
  function renderSinglePageBlock(pageNum, pageIndex, imgSrc, inputs, isEditor) {
    var h = '<div id="ethWbPage_' + pageNum + '" class="eth-wb-page-box" data-page="' + pageNum + '" style="position:relative;width:100%;max-width:920px;margin:0 auto;box-shadow:0 10px 40px rgba(0,0,0,0.25);border-radius:14px;overflow:hidden;background:#fff;border:1px solid var(--line);">' +
      // Top indicator banner
      '<div style="background:#0f172a;color:#fff;padding:6px 14px;display:flex;align-items:center;justify-content:space-between;font-size:12px;font-weight:800;">' +
        '<span>📄 ' + pageIndex + '-bet (Navigate B1+ Page ' + pageNum + ')</span>' +
        '<span style="color:#38bdf8;">' + inputs.length + ' ta interaktiv topshiriq</span>' +
      '</div>' +
      '<img src="' + imgSrc + '" class="eth-wb-img" data-page="' + pageNum + '" style="width:100%;height:auto;display:block;user-select:none;pointer-events:' + (isEditor ? 'none' : 'auto') + ';" alt="Oxford Navigate B1+ Page ' + pageNum + '" />' +
      '<div class="eth-wb-overlay-layer" data-page="' + pageNum + '" style="position:absolute;top:29px;left:0;right:0;bottom:0;' + (isEditor ? 'cursor:crosshair;' : '') + '">';

    inputs.forEach(function(item) {
      var itemType = item.type || 'fill';
      var zIndex = isEditor ? '50' : '10';

      h += '<div class="eth-wb-item-wrap" data-id="' + item.id + '" data-page="' + pageNum + '" data-type="' + itemType + '" data-group="' + (item.group || '') + '" ' +
        'style="position:absolute;top:' + item.top + '%;left:' + item.left + '%;width:' + item.width + '%;height:' + item.height + '%;z-index:' + zIndex + ';">';

      if (itemType === 'fill') {
        var isSmallLetter = (item.width && item.width <= 4.0);
        var inputStyle = 'width:100%;height:100%;' + 
          (isEditor ? 'pointer-events:none;' : '') + 
          (isSmallLetter ? 'text-align:center;text-transform:uppercase;font-weight:900;padding:0;font-size:13px;' : '');

        h += '<input type="text" ' +
          'class="eth-wb-input wb-fill-input' + (isSmallLetter ? ' wb-small-letter' : '') + '" ' +
          'data-id="' + item.id + '" ' +
          'data-page="' + pageNum + '" ' +
          'data-type="fill" ' +
          'data-correct="' + (item.correct || '').replace(/"/g, '&quot;') + '" ' +
          (isEditor ? 'disabled ' : '') +
          'style="' + inputStyle + '" ' +
          'placeholder="' + (item.label ? item.label : '...') + '" autocomplete="off" spellcheck="false" />' +
          '<div class="eth-wb-hint-badge" style="display:none;position:absolute;top:100%;left:0;background:#1e293b;color:#38bdf8;font-size:11px;font-weight:800;padding:2px 8px;border-radius:4px;white-space:nowrap;z-index:90;box-shadow:0 4px 12px rgba(0,0,0,0.3);margin-top:3px;pointer-events:none;"></div>';
      } else if (itemType === 'cross') {
        h += '<div class="wb-cross-chip" ' +
          'data-id="' + item.id + '" ' +
          'data-page="' + pageNum + '" ' +
          'data-type="cross" ' +
          'data-group="' + (item.group || '') + '" ' +
          'data-incorrect="' + (item.incorrect === true ? 'true' : 'false') + '" ' +
          'data-text="' + (item.text || '').replace(/"/g, '&quot;') + '" ' +
          'style="width:100%;height:100%;' + (isEditor ? 'pointer-events:none;' : '') + '" ' +
          'title="O‘chirish uchun bosing: ' + (item.text || '') + '"></div>' +
          '<div class="eth-wb-hint-badge" style="display:none;position:absolute;top:100%;left:0;background:#1e293b;color:#38bdf8;font-size:11px;font-weight:800;padding:2px 8px;border-radius:4px;white-space:nowrap;z-index:90;box-shadow:0 4px 12px rgba(0,0,0,0.3);margin-top:3px;pointer-events:none;"></div>';
      } else if (itemType === 'choose') {
        h += '<div class="wb-choose-chip" ' +
          'data-id="' + item.id + '" ' +
          'data-page="' + pageNum + '" ' +
          'data-type="choose" ' +
          'data-group="' + (item.group || '') + '" ' +
          'data-correct="' + (item.correct === true ? 'true' : 'false') + '" ' +
          'data-text="' + (item.text || '').replace(/"/g, '&quot;') + '" ' +
          'style="width:100%;height:100%;' + (isEditor ? 'pointer-events:none;' : '') + '" ' +
          'title="Tanlash uchun bosing: ' + (item.text || '') + '"></div>' +
          '<div class="eth-wb-hint-badge" style="display:none;position:absolute;top:100%;left:0;background:#1e293b;color:#38bdf8;font-size:11px;font-weight:800;padding:2px 8px;border-radius:4px;white-space:nowrap;z-index:90;box-shadow:0 4px 12px rgba(0,0,0,0.3);margin-top:3px;pointer-events:none;"></div>';
      } else if (itemType === 'match') {
        h += '<div class="wb-match-slot" ' +
          'data-id="' + item.id + '" ' +
          'data-page="' + pageNum + '" ' +
          'data-type="match" ' +
          'data-correct="' + (item.correct || '') + '" ' +
          'style="width:100%;height:100%;' + (isEditor ? 'pointer-events:none;' : '') + '" ' +
          'title="Javob harfini tanlang (a-f)">?</div>' +
          '<div class="eth-wb-hint-badge" style="display:none;position:absolute;top:100%;left:0;background:#1e293b;color:#38bdf8;font-size:11px;font-weight:800;padding:2px 8px;border-radius:4px;white-space:nowrap;z-index:90;box-shadow:0 4px 12px rgba(0,0,0,0.3);margin-top:3px;pointer-events:none;"></div>';
      } else if (itemType === 'insert') {
        h += '<div class="wb-insert-slot" ' +
          'data-id="' + item.id + '" ' +
          'data-page="' + pageNum + '" ' +
          'data-type="insert" ' +
          'data-group="' + (item.group || '') + '" ' +
          'data-word="' + (item.word || '') + '" ' +
          'data-correct="' + (item.correct === true ? 'true' : 'false') + '" ' +
          'style="width:100%;height:100%;' + (isEditor ? 'pointer-events:none;' : '') + '" ' +
          'title="So‘zni shu yerga joylashtirish">' +
            '<span class="wb-insert-text">' + (item.word || '') + '</span>' +
          '</div>' +
          '<div class="eth-wb-hint-badge" style="display:none;position:absolute;top:100%;left:0;background:#1e293b;color:#38bdf8;font-size:11px;font-weight:800;padding:2px 8px;border-radius:4px;white-space:nowrap;z-index:90;box-shadow:0 4px 12px rgba(0,0,0,0.3);margin-top:3px;pointer-events:none;"></div>';
      }

      if (isEditor) {
        h += '<div class="eth-wb-edit-handle" data-id="' + item.id + '" title="Surish: bosib torting | O‘chirish: o‘ng tugmani bosing" style="position:absolute;inset:0;background:rgba(2,132,199,0.3);border:1.5px solid #0284c7;cursor:grab;display:flex;align-items:center;justify-content:center;color:#0284c7;font-size:10px;font-weight:900;user-select:none;">' +
          (item.label || item.id) +
        '</div>';
      }

      h += '</div>';
    });

    if (isEditor) {
      h += '<div class="eth-wb-drag-box" style="display:none;position:absolute;border:2px dashed #ef4444;background:rgba(239,68,68,0.2);pointer-events:none;z-index:100;"></div>';
    }

    h += '</div></div>';
    return h;
  }

  // Attach All Multi-Type Event Handlers across all rendered pages
  function attachViewerHandlers(container, unitNum, lessonCode, pages, isEditor, isTeacher) {
    // Back to catalog
    var backBtn = container.querySelector('#ethWbBackBtn');
    if (backBtn) {
      backBtn.addEventListener('click', function() {
        if (window.go) window.go('intermediate');
      });
    }

    // Jump buttons
    container.querySelectorAll('.eth-wb-jump-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var targetId = this.getAttribute('data-target');
        var targetEl = container.querySelector('#' + targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Toggle Editor Button (Teachers Only)
    var toggleBtn = container.querySelector('#ethWbToggleEditor');
    if (toggleBtn && isTeacher) {
      toggleBtn.addEventListener('click', function() {
        window._ethithWbEditorMode = !window._ethithWbEditorMode;
        renderLesson(container, unitNum, lessonCode);
      });
    }

    // Dynamic Counter for Answered Questions across ALL pages
    function updateCount() {
      var distinctCount = 0;
      var filled = 0;

      // 1. Fill inputs
      var fillInputs = container.querySelectorAll('.wb-fill-input');
      distinctCount += fillInputs.length;
      fillInputs.forEach(function(inp) {
        if (inp.value && inp.value.trim().length > 0) filled++;
      });

      // 2. Cross groups
      var allCrossGroups = {};
      var crossedGroups = {};
      container.querySelectorAll('.wb-cross-chip').forEach(function(chip) {
        var grp = chip.getAttribute('data-group');
        if (grp) {
          allCrossGroups[grp] = true;
          if (chip.classList.contains('crossed')) crossedGroups[grp] = true;
        }
      });
      distinctCount += Object.keys(allCrossGroups).length;
      filled += Object.keys(crossedGroups).length;

      // 3. Choose groups
      var allChooseGroups = {};
      var selectedGroups = {};
      container.querySelectorAll('.wb-choose-chip').forEach(function(chip) {
        var grp = chip.getAttribute('data-group');
        if (grp) {
          allChooseGroups[grp] = true;
          if (chip.classList.contains('selected')) selectedGroups[grp] = true;
        }
      });
      distinctCount += Object.keys(allChooseGroups).length;
      filled += Object.keys(selectedGroups).length;

      // 4. Match slots
      var matchSlots = container.querySelectorAll('.wb-match-slot');
      distinctCount += matchSlots.length;
      matchSlots.forEach(function(slot) {
        if (slot.textContent && slot.textContent !== '?') filled++;
      });

      // 5. Insert slots
      var insertSlots = container.querySelectorAll('.wb-insert-slot');
      distinctCount += insertSlots.length;
      insertSlots.forEach(function(slot) {
        if (slot.classList.contains('inserted')) filled++;
      });

      var aEl = container.querySelector('#ethWbAnsweredCount');
      var tEl = container.querySelector('#ethWbTotalCount');
      if (aEl) aEl.textContent = filled;
      if (tEl) tEl.textContent = distinctCount || 36;
    }
    updateCount();

    // 1. Fill Inputs Interaction
    container.querySelectorAll('.wb-fill-input').forEach(function(inp) {
      inp.addEventListener('input', function() {
        this.classList.remove('correct', 'incorrect');
        var wrap = this.closest('.eth-wb-item-wrap');
        if (wrap) {
          var hint = wrap.querySelector('.eth-wb-hint-badge');
          if (hint) hint.style.display = 'none';
        }
        updateCount();
      });
    });

    // 2. Cross-out Chips Interaction (Click to strike through)
    container.querySelectorAll('.wb-cross-chip').forEach(function(chip) {
      chip.addEventListener('click', function(e) {
        if (isEditor) return;
        e.stopPropagation();
        this.classList.toggle('crossed');
        this.classList.remove('correct', 'incorrect', 'should-cross');
        var wrap = this.closest('.eth-wb-item-wrap');
        if (wrap) {
          var hint = wrap.querySelector('.eth-wb-hint-badge');
          if (hint) hint.style.display = 'none';
        }
        updateCount();
      });
    });

    // 3. Choose Chips Interaction (Click to select option with instant correct/incorrect feedback)
    container.querySelectorAll('.wb-choose-chip').forEach(function(chip) {
      chip.addEventListener('click', function(e) {
        if (isEditor) return;
        e.stopPropagation();
        var grp = this.getAttribute('data-group');
        var wasSelected = this.classList.contains('selected');

        // Deselect sibling chips in same group
        if (grp) {
          container.querySelectorAll('.wb-choose-chip[data-group="' + grp + '"]').forEach(function(c) {
            c.classList.remove('selected', 'correct', 'incorrect', 'should-choose');
            var wrap = c.closest('.eth-wb-item-wrap');
            if (wrap) {
              var hint = wrap.querySelector('.eth-wb-hint-badge');
              if (hint) {
                hint.style.display = 'none';
                hint.textContent = '';
              }
            }
          });
        }

        if (!wasSelected) {
          this.classList.add('selected');
          var isCorrect = (this.getAttribute('data-correct') === 'true');
          var wrap = this.closest('.eth-wb-item-wrap');
          var hint = wrap ? wrap.querySelector('.eth-wb-hint-badge') : null;

          if (isCorrect) {
            this.classList.add('correct');
            this.classList.remove('incorrect');
            if (hint) {
              hint.innerHTML = '<span style="color:#22c55e;font-weight:900;">✓ To‘g‘ri javob</span>';
              hint.style.display = 'block';
              hint.style.background = 'rgba(6, 78, 59, 0.95)';
              hint.style.borderColor = '#10b981';
            }
          } else {
            this.classList.add('incorrect');
            this.classList.remove('correct');
            if (hint) {
              hint.innerHTML = '<span style="color:#f87171;font-weight:900;">✗ Noto‘g‘ri</span>';
              hint.style.display = 'block';
              hint.style.background = 'rgba(127, 29, 29, 0.95)';
              hint.style.borderColor = '#ef4444';
            }
          }
        }
        updateCount();
      });
    });

    // 4. Match Slot Interaction (Click to open letter picker)
    var activePopover = null;
    function closePopover() {
      if (activePopover && activePopover.parentNode) {
        activePopover.parentNode.removeChild(activePopover);
      }
      activePopover = null;
    }
    document.addEventListener('click', closePopover);

    container.querySelectorAll('.wb-match-slot').forEach(function(slot) {
      slot.addEventListener('click', function(e) {
        if (isEditor) return;
        e.stopPropagation();
        closePopover();

        var pop = document.createElement('div');
        pop.className = 'wb-letter-popover';
        var letters = ['a', 'b', 'c', 'd', 'e', 'f'];

        letters.forEach(function(l) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'wb-letter-btn';
          btn.textContent = l;
          btn.addEventListener('click', function(ev) {
            ev.stopPropagation();
            slot.textContent = l;
            slot.classList.remove('correct', 'incorrect');
            closePopover();
            updateCount();
          });
          pop.appendChild(btn);
        });

        // Clear option
        var clr = document.createElement('button');
        clr.type = 'button';
        clr.className = 'wb-letter-btn';
        clr.textContent = '✕';
        clr.style.color = '#ef4444';
        clr.addEventListener('click', function(ev) {
          ev.stopPropagation();
          slot.textContent = '?';
          slot.classList.remove('correct', 'incorrect');
          closePopover();
          updateCount();
        });
        pop.appendChild(clr);

        slot.parentNode.appendChild(pop);
        activePopover = pop;
      });
    });

    // 5. Insert Slot Interaction (Click to place slash and insert bracketed word)
    container.querySelectorAll('.wb-insert-slot').forEach(function(slot) {
      slot.addEventListener('click', function(e) {
        if (isEditor) return;
        e.stopPropagation();
        this.classList.toggle('inserted');
        this.classList.remove('correct', 'incorrect');
        updateCount();
      });
    });

    // Check Answers Button Logic (Evaluates BOTH pages simultaneously)
    var checkBtn = container.querySelector('#ethWbCheckBtn');
    if (checkBtn) {
      checkBtn.addEventListener('click', function() {
        var correctCount = 0;
        var totalQuestions = 0;

        // 1. Check Fill Inputs across both pages
        var fillInputs = container.querySelectorAll('.wb-fill-input');
        totalQuestions += fillInputs.length;
        fillInputs.forEach(function(inp) {
          var userVal = inp.value || '';
          var correctRaw = inp.getAttribute('data-correct') || '';
          var isCorrect = WB.checkAnswer(userVal, correctRaw);
          var wrap = inp.closest('.eth-wb-item-wrap');
          var hint = wrap ? wrap.querySelector('.eth-wb-hint-badge') : null;

          if (isCorrect) {
            correctCount++;
            inp.classList.add('correct');
            inp.classList.remove('incorrect');
            if (hint) hint.style.display = 'none';
          } else {
            inp.classList.add('incorrect');
            inp.classList.remove('correct');
            if (hint) {
              var displayAns = correctRaw.split(/\s+or\s+/i)[0] || correctRaw;
              hint.textContent = '✓ ' + displayAns;
              hint.style.display = 'block';
            }
          }
        });

        // 2. Check Cross-out Groups across both pages
        var crossGroups = {};
        container.querySelectorAll('.wb-cross-chip').forEach(function(chip) {
          var grp = chip.getAttribute('data-group');
          if (grp) {
            if (!crossGroups[grp]) crossGroups[grp] = [];
            crossGroups[grp].push(chip);
          }
        });
        Object.keys(crossGroups).forEach(function(grp) {
          totalQuestions++;
          var chips = crossGroups[grp];
          var correctChip = null;
          var userWrongCrossed = false;
          var userCrossedTarget = false;

          chips.forEach(function(c) {
            var isTarget = (c.getAttribute('data-incorrect') === 'true');
            var isCrossed = c.classList.contains('crossed');
            if (isTarget) correctChip = c;
            if (isCrossed && isTarget) userCrossedTarget = true;
            if (isCrossed && !isTarget) userWrongCrossed = true;
          });

          if (userCrossedTarget && !userWrongCrossed) {
            correctCount++;
            if (correctChip) {
              correctChip.classList.add('correct');
              correctChip.classList.remove('should-cross');
            }
          } else {
            chips.forEach(function(c) {
              if (c.classList.contains('crossed') && c.getAttribute('data-incorrect') !== 'true') {
                c.classList.add('incorrect');
              }
            });
            if (correctChip) {
              correctChip.classList.add('should-cross');
            }
          }
        });

        // 3. Check Choose Groups across both pages
        var chooseGroups = {};
        container.querySelectorAll('.wb-choose-chip').forEach(function(chip) {
          var grp = chip.getAttribute('data-group');
          if (grp) {
            if (!chooseGroups[grp]) chooseGroups[grp] = [];
            chooseGroups[grp].push(chip);
          }
        });
        Object.keys(chooseGroups).forEach(function(grp) {
          totalQuestions++;
          var chips = chooseGroups[grp];
          var selectedChip = null;
          var correctChip = null;

          chips.forEach(function(c) {
            if (c.classList.contains('selected')) selectedChip = c;
            if (c.getAttribute('data-correct') === 'true') correctChip = c;
          });

          if (selectedChip && selectedChip.getAttribute('data-correct') === 'true') {
            correctCount++;
            selectedChip.classList.add('correct');
            selectedChip.classList.remove('incorrect');
          } else {
            if (selectedChip) {
              selectedChip.classList.add('incorrect');
              selectedChip.classList.remove('correct');
            }
            if (correctChip) {
              correctChip.classList.add('should-choose');
            }
          }
        });

        // 4. Check Match Slots across both pages
        var matchSlots = container.querySelectorAll('.wb-match-slot');
        totalQuestions += matchSlots.length;
        matchSlots.forEach(function(slot) {
          var userLetter = (slot.textContent || '').trim().toLowerCase();
          var correctLetter = (slot.getAttribute('data-correct') || '').trim().toLowerCase();
          var wrap = slot.closest('.eth-wb-item-wrap');
          var hint = wrap ? wrap.querySelector('.eth-wb-hint-badge') : null;

          if (userLetter === correctLetter && userLetter !== '?') {
            correctCount++;
            slot.classList.add('correct');
            slot.classList.remove('incorrect');
            if (hint) hint.style.display = 'none';
          } else {
            slot.classList.add('incorrect');
            slot.classList.remove('correct');
            if (hint) {
              hint.textContent = '✓ ' + correctLetter.toUpperCase();
              hint.style.display = 'block';
            }
          }
        });

        // 5. Check Insert Slots across both pages
        var insertSlots = container.querySelectorAll('.wb-insert-slot');
        totalQuestions += insertSlots.length;
        insertSlots.forEach(function(slot) {
          var isInserted = slot.classList.contains('inserted');
          var isCorrect = (slot.getAttribute('data-correct') === 'true');

          if (isInserted && isCorrect) {
            correctCount++;
            slot.classList.add('correct');
            slot.classList.remove('incorrect');
          } else if (isInserted && !isCorrect) {
            slot.classList.add('incorrect');
            slot.classList.remove('correct');
          } else {
            slot.classList.add('incorrect');
          }
        });

        if (totalQuestions === 0) totalQuestions = 36;

        // Show Score Pill
        var pct = Math.round((correctCount / totalQuestions) * 100);
        var pill = container.querySelector('#ethWbResultPill');
        if (pill) {
          pill.style.display = 'inline-block';
          pill.innerHTML = 'Natija: <b>' + correctCount + ' / ' + totalQuestions + ' (' + pct + '%)</b>';
          if (pct >= 80) {
            pill.style.background = 'rgba(16,185,129,0.2)';
            pill.style.color = '#34d399';
            pill.style.borderColor = 'rgba(52,211,153,0.4)';
          } else {
            pill.style.background = 'rgba(245,158,11,0.2)';
            pill.style.color = '#fbbf24';
            pill.style.borderColor = 'rgba(251,191,36,0.4)';
          }
        }

        // Award Coins
        var coinsToAdd = 0;
        if (pct >= 70 && window.EthithApp && window.EthithApp.state && window.EthithApp.state.user) {
          coinsToAdd = Math.round(correctCount * 3);
          window.EthithApp.state.user.coins = (window.EthithApp.state.user.coins || 0) + coinsToAdd;
          if (window.EthithSync && window.EthithSync.syncUser) window.EthithSync.syncUser(window.EthithApp.state.user);
          if (window.toast) window.toast('Ajoyib natija! +' + coinsToAdd + ' ETHITH Coins qo‘shildi!');
        }

        // Show Interactive Result Modal Popup per User Requirement
        WB.showResultModal(correctCount, totalQuestions, pct, coinsToAdd);
      });
    }

    // Interactive Result Modal Popup (Percentage Meter, Review Mistakes, Retake)
    WB.showResultModal = function(correctCount, totalQuestions, pct, coinsToAdd) {
      var existing = document.getElementById('ethWbResultModalOverlay');
      if (existing) existing.remove();

      var title = "Natijangiz";
      var emoji = "🎉";
      var subtitle = "Ajoyib natija! Barakalla!";
      if (pct < 50) {
        emoji = "💪";
        subtitle = "Yana bir bor urinib ko‘ring, albatta uddalaysiz!";
      } else if (pct < 80) {
        emoji = "👍";
        subtitle = "Yaxshi harakat! Xatolarni ko‘rib chiqing va qayta topshiring.";
      }

      var ov = document.createElement('div');
      ov.id = 'ethWbResultModalOverlay';
      ov.style.cssText = 'position:fixed;inset:0;background:rgba(5,10,24,0.82);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;animation:ethFadeIn 0.2s ease-out;';

      ov.innerHTML = 
        '<div id="ethWbResultModal" style="background:#0f172a;border:1.5px solid rgba(56,189,248,0.35);box-shadow:0 25px 60px -15px rgba(0,0,0,0.85), 0 0 40px rgba(14,165,233,0.25);border-radius:24px;width:100%;max-width:420px;padding:28px 24px;position:relative;text-align:center;color:#fff;animation:ethScaleIn 0.25s ease-out;">' +
          '<button id="ethWbModalCloseX" style="position:absolute;top:16px;right:16px;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.08);border:none;color:#94a3b8;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;transition:background 0.2s;">✕</button>' +
          '<div style="font-size:44px;margin-bottom:6px;">' + emoji + '</div>' +
          '<div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#38bdf8;margin-bottom:4px;">Workbook Natijasi</div>' +
          '<div style="font-size:48px;font-weight:900;line-height:1.1;background:linear-gradient(135deg,#38bdf8,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:6px;">' + pct + '%</div>' +
          '<p style="font-size:13.5px;color:#94a3b8;margin:0 0 20px;line-height:1.45;">' + subtitle + '</p>' +
          
          // 3-Stat Grid
          '<div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:10px;margin-bottom:24px;">' +
            '<div style="background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);border-radius:14px;padding:12px 6px;">' +
              '<div style="font-size:22px;font-weight:900;color:#4ade80;">' + correctCount + '</div>' +
              '<div style="font-size:11px;font-weight:700;color:#86efac;text-transform:uppercase;letter-spacing:0.04em;">To‘g‘ri</div>' +
            '</div>' +
            '<div style="background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);border-radius:14px;padding:12px 6px;">' +
              '<div style="font-size:22px;font-weight:900;color:#f87171;">' + (totalQuestions - correctCount) + '</div>' +
              '<div style="font-size:11px;font-weight:700;color:#fca5a5;text-transform:uppercase;letter-spacing:0.04em;">Xato</div>' +
            '</div>' +
            '<div style="background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.3);border-radius:14px;padding:12px 6px;">' +
              '<div style="font-size:22px;font-weight:900;color:#fbbf24;">+' + (coinsToAdd || 0) + '</div>' +
              '<div style="font-size:11px;font-weight:700;color:#fde68a;text-transform:uppercase;letter-spacing:0.04em;">Coin</div>' +
            '</div>' +
          '</div>' +

          // Action Buttons
          '<div style="display:flex;flex-direction:column;gap:10px;">' +
            '<button id="ethWbModalReviewBtn" style="background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:14px;padding:13px;font-size:14.5px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 8px 20px -4px rgba(2,132,199,0.5);transition:opacity 0.2s;">' +
              '<span>🔍</span> Xatolarni ko‘rish' +
            '</button>' +
            '<button id="ethWbModalRetakeBtn" style="background:rgba(255,255,255,0.06);color:#f1f5f9;border:1.5px solid rgba(255,255,255,0.15);border-radius:14px;padding:12px;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:background 0.2s;">' +
              '<span>↻</span> Qaytadan boshlash' +
            '</button>' +
          '</div>' +
        '</div>';

      document.body.appendChild(ov);

      // Close button
      ov.querySelector('#ethWbModalCloseX').addEventListener('click', function() {
        ov.remove();
      });

      // Close on backdrop click outside modal
      ov.addEventListener('click', function(e) {
        if (e.target === ov) ov.remove();
      });

      // Xatolarni ko'rish
      ov.querySelector('#ethWbModalReviewBtn').addEventListener('click', function() {
        ov.remove();
        var mistakes = document.querySelectorAll('.wb-fill-input.incorrect, .wb-cross-chip.should-cross, .wb-choose-chip.should-choose, .wb-match-slot.incorrect, .wb-insert-slot.incorrect');
        if (mistakes.length > 0) {
          var first = mistakes[0];
          first.scrollIntoView({ behavior: 'smooth', block: 'center' });
          mistakes.forEach(function(el) {
            el.style.transition = 'transform 0.3s, box-shadow 0.3s';
            el.style.transform = 'scale(1.12)';
            el.style.boxShadow = '0 0 20px rgba(239,68,68,0.95)';
            setTimeout(function() {
              el.style.transform = '';
              el.style.boxShadow = '';
            }, 1500);
          });
        } else {
          if (window.toast) window.toast('Sizda hech qanday xato yo‘q! Barakalla!');
        }
      });

      // Qaytadan boshlash
      ov.querySelector('#ethWbModalRetakeBtn').addEventListener('click', function() {
        ov.remove();
        var resetBtn = document.getElementById('ethWbResetBtn');
        if (resetBtn) resetBtn.click();
        var pagesWrap = document.getElementById('ethWbPagesWrap');
        if (pagesWrap) {
          pagesWrap.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    };

    // Reset Button
    var resetBtn = container.querySelector('#ethWbResetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        container.querySelectorAll('.wb-fill-input').forEach(function(inp) {
          inp.value = '';
          inp.classList.remove('correct', 'incorrect');
        });
        container.querySelectorAll('.wb-cross-chip').forEach(function(chip) {
          chip.classList.remove('crossed', 'correct', 'incorrect', 'should-cross');
        });
        container.querySelectorAll('.wb-choose-chip').forEach(function(chip) {
          chip.classList.remove('selected', 'correct', 'incorrect', 'should-choose');
        });
        container.querySelectorAll('.wb-match-slot').forEach(function(slot) {
          slot.textContent = '?';
          slot.classList.remove('correct', 'incorrect');
        });
        container.querySelectorAll('.wb-insert-slot').forEach(function(slot) {
          slot.classList.remove('inserted', 'correct', 'incorrect');
        });
        container.querySelectorAll('.eth-wb-hint-badge').forEach(function(badge) {
          badge.style.display = 'none';
        });

        var pill = container.querySelector('#ethWbResultPill');
        if (pill) pill.style.display = 'none';
        updateCount();
      });
    }

    // Visual Editor Setup for Teachers ONLY
    if (isTeacher && isEditor) {
      setupVisualEditor(container, unitNum, lessonCode, pages);
    }
  }

  // Teacher Visual Editor Dragging & Editing Setup
  function setupVisualEditor(container, unitNum, lessonCode, pages) {
    var modal = container.querySelector('#ethWbInputModal');
    var modalTitle = container.querySelector('#ethWbModalTitle');
    var modalType = container.querySelector('#ethWbModalType');
    var modalLabel = container.querySelector('#ethWbModalLabel');
    var modalCorrect = container.querySelector('#ethWbModalCorrect');
    var modalSave = container.querySelector('#ethWbModalSaveBtn');
    var modalCancel = container.querySelector('#ethWbModalCancelBtn');
    var modalDelete = container.querySelector('#ethWbModalDeleteBtn');

    var currentTarget = null;

    function openModal(isNew, pageNum, item) {
      if (!isTeacherRole()) return;
      currentTarget = { isNew: isNew, page: pageNum, item: item };
      modalTitle.textContent = isNew ? 'Yangi Katakcha Qo‘shish' : 'Katakchani Tahrirlash (' + item.id + ')';
      modalType.value = item.type || 'fill';
      modalLabel.value = item.label || item.group || '';
      modalCorrect.value = item.correct || (item.incorrect ? 'incorrect' : '');
      modalDelete.style.display = isNew ? 'none' : 'block';
      modal.style.display = 'flex';
    }

    function closeModal() {
      if (modal) modal.style.display = 'none';
      currentTarget = null;
    }

    if (modalCancel) modalCancel.addEventListener('click', closeModal);

    if (modalSave) {
      modalSave.addEventListener('click', function() {
        if (!currentTarget) return;
        var page = currentTarget.page;
        var inputs = WB.getPageInputs(page);

        if (currentTarget.isNew) {
          var newItem = currentTarget.item;
          newItem.id = 'p' + page + '_custom_' + Date.now().toString().slice(-5);
          newItem.type = modalType.value;
          newItem.label = modalLabel.value.trim() || 'New';
          newItem.correct = modalCorrect.value.trim() || '';
          inputs.push(newItem);
        } else {
          var exist = inputs.find(function(x) { return x.id === currentTarget.item.id; });
          if (exist) {
            exist.type = modalType.value;
            exist.label = modalLabel.value.trim();
            exist.correct = modalCorrect.value.trim();
          }
        }

        WB.savePageInputs(page, inputs);
        closeModal();
        renderLesson(container, unitNum, lessonCode);
      });
    }

    if (modalDelete) {
      modalDelete.addEventListener('click', function() {
        if (!currentTarget || currentTarget.isNew) return;
        var page = currentTarget.page;
        var inputs = WB.getPageInputs(page).filter(function(x) { return x.id !== currentTarget.item.id; });
        WB.savePageInputs(page, inputs);
        closeModal();
        renderLesson(container, unitNum, lessonCode);
      });
    }

    // 1. Right-Click to Delete & Mouse Drag to Move
    container.querySelectorAll('.eth-wb-edit-handle').forEach(function(handle) {
      // Right-Click Context Menu: Instant deletion!
      handle.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var id = this.getAttribute('data-id');
        var wrap = this.closest('.eth-wb-item-wrap');
        var page = parseInt(wrap.getAttribute('data-page'), 10);
        var inputs = WB.getPageInputs(page);
        var item = inputs.find(function(x) { return x.id === id; });
        var lbl = item ? (item.label || item.id) : id;

        inputs = inputs.filter(function(x) { return x.id !== id; });
        WB.savePageInputs(page, inputs);
        wrap.remove();
        if (window.toast) {
          window.toast('🗑️ "' + lbl + '" katakchasi o‘chirildi');
        }
      });

      // Mouse Drag to Move
      handle.addEventListener('mousedown', function(e) {
        if (e.button === 2) return; // Right-click reserved for delete
        e.preventDefault();
        e.stopPropagation();

        var wrap = this.closest('.eth-wb-item-wrap');
        var layer = wrap.closest('.eth-wb-overlay-layer');
        var page = parseInt(wrap.getAttribute('data-page'), 10);
        var id = this.getAttribute('data-id');

        var layerRect = layer.getBoundingClientRect();
        var startX = e.clientX;
        var startY = e.clientY;
        var startLeftPct = parseFloat(wrap.style.left) || 0;
        var startTopPct = parseFloat(wrap.style.top) || 0;

        var hasMoved = false;
        wrap.style.opacity = '0.75';
        wrap.style.zIndex = '999';

        function onMouseMove(ev) {
          var dx = ev.clientX - startX;
          var dy = ev.clientY - startY;
          if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved = true;

          var dxPct = (dx / layerRect.width) * 100;
          var dyPct = (dy / layerRect.height) * 100;

          var newLeft = Math.max(0, Math.min(95, startLeftPct + dxPct));
          var newTop = Math.max(0, Math.min(98, startTopPct + dyPct));

          wrap.style.left = newLeft.toFixed(1) + '%';
          wrap.style.top = newTop.toFixed(1) + '%';
        }

        function onMouseUp(ev) {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
          wrap.style.opacity = '1';
          wrap.style.zIndex = '50';

          if (hasMoved) {
            var finalLeft = parseFloat(wrap.style.left);
            var finalTop = parseFloat(wrap.style.top);
            var inputs = WB.getPageInputs(page);
            var item = inputs.find(function(x) { return x.id === id; });
            if (item) {
              item.left = finalLeft;
              item.top = finalTop;
              WB.savePageInputs(page, inputs);
            }
          } else {
            // Clicked without moving: open edit modal
            var inputs = WB.getPageInputs(page);
            var item = inputs.find(function(x) { return x.id === id; });
            if (item) openModal(false, page, item);
          }
        }

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });
    });

    // 2. Click & Drag on Empty Page Area to Draw New Element
    container.querySelectorAll('.eth-wb-overlay-layer').forEach(function(layer) {
      var page = parseInt(layer.getAttribute('data-page'), 10);
      var dragBox = layer.querySelector('.eth-wb-drag-box');
      var isDrawing = false;
      var startX = 0, startY = 0;
      var rect = null;

      layer.addEventListener('mousedown', function(e) {
        if (e.button === 2) return;
        if (e.target.classList.contains('eth-wb-edit-handle') || e.target.classList.contains('wb-letter-btn')) return;
        isDrawing = true;
        rect = layer.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        if (dragBox) {
          dragBox.style.left = startX + 'px';
          dragBox.style.top = startY + 'px';
          dragBox.style.width = '0px';
          dragBox.style.height = '0px';
          dragBox.style.display = 'block';
        }
      });

      window.addEventListener('mousemove', function(e) {
        if (!isDrawing || !rect || !dragBox) return;
        var curX = e.clientX - rect.left;
        var curY = e.clientY - rect.top;
        var left = Math.min(startX, curX);
        var top = Math.min(startY, curY);
        var width = Math.abs(curX - startX);
        var height = Math.abs(curY - startY);

        dragBox.style.left = left + 'px';
        dragBox.style.top = top + 'px';
        dragBox.style.width = width + 'px';
        dragBox.style.height = height + 'px';
      });

      window.addEventListener('mouseup', function(e) {
        if (!isDrawing) return;
        isDrawing = false;
        if (dragBox) dragBox.style.display = 'none';

        if (!rect) return;
        var endX = e.clientX - rect.left;
        var endY = e.clientY - rect.top;
        var wPx = Math.abs(endX - startX);
        var hPx = Math.abs(endY - startY);

        if (wPx > 15 && hPx > 10) {
          var topPct = parseFloat(((Math.min(startY, endY) / rect.height) * 100).toFixed(1));
          var leftPct = parseFloat(((Math.min(startX, endX) / rect.width) * 100).toFixed(1));
          var widthPct = parseFloat(((wPx / rect.width) * 100).toFixed(1));
          var heightPct = parseFloat(((hPx / rect.height) * 100).toFixed(1));

          var newItem = {
            page: page,
            type: 'fill',
            top: topPct,
            left: leftPct,
            width: widthPct,
            height: heightPct,
            correct: '',
            label: ''
          };
          openModal(true, page, newItem);
        }
        rect = null;
      });
    });

    // 3. Export JSON Button
    var exportBtn = container.querySelector('#ethWbExportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', function() {
        var allPagesData = {};
        pages.forEach(function(p) {
          allPagesData['page' + p] = WB.getPageInputs(p);
        });
        var jsonStr = JSON.stringify(allPagesData, null, 2);
        if (navigator.clipboard) {
          navigator.clipboard.writeText(jsonStr).then(function() {
            alert('Koordinatalar buferga nusxa olindi!');
          }).catch(function() {
            prompt('Koordinatalar JSON kodi:', jsonStr);
          });
        } else {
          prompt('Koordinatalar JSON kodi:', jsonStr);
        }
      });
    }

    // 4. Save Button
    var saveBtn = container.querySelector('#ethWbSaveAllBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        alert('Barcha koordinatalar muvaffaqiyatli saqlandi!');
      });
    }

    // 5. Reset Coords Button
    var resetCoordsBtn = container.querySelector('#ethWbResetCoordsBtn');
    if (resetCoordsBtn) {
      resetCoordsBtn.addEventListener('click', function() {
        if (confirm('Ushbu darsning barcha koordinatalarini asl holatiga qaytarishni xohlaysizmi?')) {
          pages.forEach(function(p) {
            WB.resetPageInputs(p);
          });
          renderLesson(container, unitNum, lessonCode);
        }
      });
    }
  }

  WB.renderLesson = renderLesson;
  WB.renderLesson1_1 = function(container) {
    renderLesson(container, 1, '1.1');
  };

})(window);
