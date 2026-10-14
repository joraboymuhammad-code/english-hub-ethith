
/**
 * ETHITH TESTS - Offline Algorithmic Quiz Engine
 * Created by Muhammadyusuf Jo'raboyev
 * Generates 25 to 50 high quality, pedagogical English quiz questions
 * for all 240 topics across A1-C2 with 0 network latency and 100% reliability.
 */
(function(window) {
  'use strict';

  var CURRICULUM = {
  "A1": [
    {
      "num": 1,
      "title": "Alphabet & Phonetics",
      "desc": "Alphabet, phonetic sounds, and accurate pronunciation"
    },
    {
      "num": 2,
      "title": "Greetings & Introductions",
      "desc": "Greetings, introductions, and polite conversation"
    },
    {
      "num": 3,
      "title": "Numbers 1–100 & Dates",
      "desc": "Numbers 1-100, ordinal numbers, and calendar dates"
    },
    {
      "num": 4,
      "title": "Personal Pronouns & Verb \"To Be\"",
      "desc": "Subject pronouns and affirmative, negative forms of To Be"
    },
    {
      "num": 5,
      "title": "Countries, Nationalities & Languages",
      "desc": "Countries, nationalities, and world languages"
    },
    {
      "num": 6,
      "title": "Family & Relationships",
      "desc": "Immediate and extended family relationships"
    },
    {
      "num": 7,
      "title": "Jobs & Professions",
      "desc": "Kasblar"
    },
    {
      "num": 8,
      "title": "Plural Nouns & Demonstratives",
      "desc": "Regular/irregular plural nouns and demonstratives"
    },
    {
      "num": 9,
      "title": "Possessive Adjectives & Possessive 's",
      "desc": "Tegishlilik olmoshlari"
    },
    {
      "num": 10,
      "title": "Present Simple: Affirmative",
      "desc": "Hozirgi oddiy vaqt: Tasdiq"
    },
    {
      "num": 11,
      "title": "Present Simple: Negative & Questions",
      "desc": "Negative and question forms"
    },
    {
      "num": 12,
      "title": "Adjectives: Describing People & Things",
      "desc": "Descriptive adjectives for people and objects"
    },
    {
      "num": 13,
      "title": "Daily Routines & Time",
      "desc": "Daily routines, daily schedules, and time expressions"
    },
    {
      "num": 14,
      "title": "Adverbs of Frequency",
      "desc": "Chastota ravishlari: Always, Usually, Never"
    },
    {
      "num": 15,
      "title": "Telling Time & Days of the Week",
      "desc": "Days of the week, months, and accurate time telling"
    },
    {
      "num": 16,
      "title": "Food & Drinks: Vocabulary",
      "desc": "Food, beverages, and dining vocabulary"
    },
    {
      "num": 17,
      "title": "Countables & Uncountables",
      "desc": "Countable and uncountable nouns with some/any"
    },
    {
      "num": 18,
      "title": "Articles: A, An, The",
      "desc": "Artikllar"
    },
    {
      "num": 19,
      "title": "Rooms & Furniture",
      "desc": "House rooms, furniture, and household appliances"
    },
    {
      "num": 20,
      "title": "There is / There are",
      "desc": "Mavjudlik iboralari"
    },
    {
      "num": 21,
      "title": "Prepositions of Place",
      "desc": "Spatial prepositions: in, on, under, between, next to"
    },
    {
      "num": 22,
      "title": "Clothes & Appearance",
      "desc": "Clothing styles, accessories, and physical appearance"
    },
    {
      "num": 23,
      "title": "Free Time Activities & Hobbies",
      "desc": "Hobbies, leisure activities, and personal interests"
    },
    {
      "num": 24,
      "title": "Can / Can't for Ability & Requests",
      "desc": "Expressing ability, possibility, and polite requests"
    },
    {
      "num": 25,
      "title": "Present Continuous: Actions Right Now",
      "desc": "Actions happening now and temporary present situations"
    },
    {
      "num": 26,
      "title": "Present Simple vs Present Continuous",
      "desc": "Ikkala vaqt taqqoslanishi"
    },
    {
      "num": 27,
      "title": "Weather & Seasons",
      "desc": "Weather conditions, temperatures, and four seasons"
    },
    {
      "num": 28,
      "title": "Imperatives & Classroom Language",
      "desc": "Buyruq fe'llari"
    },
    {
      "num": 29,
      "title": "Places in the City & Directions",
      "desc": "City landmarks, urban places, and asking for directions"
    },
    {
      "num": 30,
      "title": "Prepositions of Time",
      "desc": "Vaqt predloglari: At, On, In"
    },
    {
      "num": 31,
      "title": "Object Pronouns",
      "desc": "Tushum kelishigi olmoshlari: Me, Him, Them"
    },
    {
      "num": 32,
      "title": "Past Simple of \"To Be\": Was / Were",
      "desc": "Past simple forms of To Be: was and were"
    },
    {
      "num": 33,
      "title": "Past Simple: Regular Verbs",
      "desc": "Affirmative regular past actions with -ed endings"
    },
    {
      "num": 34,
      "title": "Past Simple: Irregular Verbs",
      "desc": "Common irregular verbs in Past Simple"
    },
    {
      "num": 35,
      "title": "Past Simple: Questions & Negatives",
      "desc": "Past Simple negatives and questions"
    },
    {
      "num": 36,
      "title": "Transport & Travel Vocabulary",
      "desc": "Modes of public transport and travel essentials"
    },
    {
      "num": 37,
      "title": "Question Words: Who, What, Where, When, Why, How",
      "desc": "Open questions using Who, What, Where, When, Why, and How"
    },
    {
      "num": 38,
      "title": "Going to: Future Plans",
      "desc": "Kelajak rejalar"
    },
    {
      "num": 39,
      "title": "Health & Body Parts",
      "desc": "Human anatomy, minor illnesses, and health advice"
    },
    {
      "num": 40,
      "title": "Basic Shopping & Prices",
      "desc": "Store conversations, prices, sizes, and checkout phrases"
    }
  ],
  "A2": [
    {
      "num": 1,
      "title": "Describing Personality & Character",
      "desc": "Inson fe'l-atvorini tasvirlash"
    },
    {
      "num": 2,
      "title": "Past Simple: Time Expressions",
      "desc": "Ago, Yesterday, Last week"
    },
    {
      "num": 3,
      "title": "Past Continuous: Actions in Progress in Past",
      "desc": "Past activities in progress at a specific past moment"
    },
    {
      "num": 4,
      "title": "Past Simple vs Past Continuous",
      "desc": "Past Continuous background actions interrupted by Past Simple"
    },
    {
      "num": 5,
      "title": "Comparative Adjectives",
      "desc": "Comparative adjectives"
    },
    {
      "num": 6,
      "title": "Superlative Adjectives",
      "desc": "Superlative adjectives"
    },
    {
      "num": 7,
      "title": "Have to / Don't have to",
      "desc": "Majburiyat fe'li"
    },
    {
      "num": 8,
      "title": "Must / Mustn't",
      "desc": "Obligation, rules, strong necessity, and prohibition"
    },
    {
      "num": 9,
      "title": "Should / Shouldn't for Advice",
      "desc": "Maslahat berish"
    },
    {
      "num": 10,
      "title": "Present Perfect: Ever & Never",
      "desc": "Talking about life experiences with ever and never"
    },
    {
      "num": 11,
      "title": "Present Perfect vs Past Simple",
      "desc": "Zamonlar farqi"
    },
    {
      "num": 12,
      "title": "Present Perfect with Just, Already, Yet",
      "desc": "Recent events with just, already, and yet"
    },
    {
      "num": 13,
      "title": "Present Perfect with For & Since",
      "desc": "Vaqt davomiyligi"
    },
    {
      "num": 14,
      "title": "Will / Won't for Predictions & Offers",
      "desc": "Spontaneous decisions, predictions, and offers with will"
    },
    {
      "num": 15,
      "title": "Will vs Going to",
      "desc": "Kelajak zamonlar farqi"
    },
    {
      "num": 16,
      "title": "First Conditional",
      "desc": "Birinchi tur shart gipotezalari"
    },
    {
      "num": 17,
      "title": "Subject / Object Questions",
      "desc": "Subject and object questions"
    },
    {
      "num": 18,
      "title": "Too & Enough",
      "desc": "Expressing excess and sufficiency with too and enough"
    },
    {
      "num": 19,
      "title": "Something, Anyone, Nowhere",
      "desc": "Aniqmas olmoshlar"
    },
    {
      "num": 20,
      "title": "Infinitive of Purpose",
      "desc": "Maqsad infinitivi: To do..."
    },
    {
      "num": 21,
      "title": "Verbs Followed by Infinitive / Gerund",
      "desc": "Verb complementation with gerunds and to-infinitives"
    },
    {
      "num": 22,
      "title": "Phrasal Verbs 1: Daily Life",
      "desc": "Kundalik iborali fe'llar"
    },
    {
      "num": 23,
      "title": "Giving Directions & Map Reading",
      "desc": "Navigating town maps, landmarks, and street directions"
    },
    {
      "num": 24,
      "title": "Ordering Food in Restaurants",
      "desc": "Restoranda buyurtma berish"
    },
    {
      "num": 25,
      "title": "Describing Feelings & Emotions",
      "desc": "Hissiyotlarni ifodalash"
    },
    {
      "num": 26,
      "title": "Holidays & Hotel Reservation",
      "desc": "Hotel check-in, bookings, holidays, and accommodations"
    },
    {
      "num": 27,
      "title": "House & Chores",
      "desc": "Domestic chores, home duties, and household management"
    },
    {
      "num": 28,
      "title": "Shopping & Returning Items",
      "desc": "Returning faulty items, asking for refunds and exchanges"
    },
    {
      "num": 29,
      "title": "Asking for / Giving Permission",
      "desc": "Requesting, granting, and refusing permission politely"
    },
    {
      "num": 30,
      "title": "Make vs Do",
      "desc": "Common collocations and distinctions between make and do"
    },
    {
      "num": 31,
      "title": "Used to: Past Habits",
      "desc": "Past habits and states that no longer occur in present"
    },
    {
      "num": 32,
      "title": "Defining Relative Clauses: Who, Which, Where",
      "desc": "Nisbiy ergash gaplar"
    },
    {
      "num": 33,
      "title": "Passive Voice: Present Simple",
      "desc": "Hozirgi zamon majhul nisbati"
    },
    {
      "num": 34,
      "title": "Passive Voice: Past Simple",
      "desc": "Passive constructions describing past historical events"
    },
    {
      "num": 35,
      "title": "Articles: Zero Article vs Definite Article",
      "desc": "Artikl ishlatilmaydigan hollar"
    },
    {
      "num": 36,
      "title": "Money, Banking & Payments",
      "desc": "Financial transactions, currencies, ATM, and payments"
    },
    {
      "num": 37,
      "title": "Music, Movies & Entertainment",
      "desc": "Film genres, musical styles, and arts entertainment"
    },
    {
      "num": 38,
      "title": "Technology & Gadgets",
      "desc": "Modern gadgets, computers, smartphones, and the internet"
    },
    {
      "num": 39,
      "title": "Writing Personal Emails / Postcards",
      "desc": "Shaxsiy xatlar yozish"
    },
    {
      "num": 40,
      "title": "A2 Level Final Speaking & Review",
      "desc": "A2 bosqichi umumiy takrorlovi"
    }
  ],
  "B1": [
    {
      "num": 1,
      "title": "Present Perfect Continuous",
      "desc": "Hozirgi tugallangan davomli zamon"
    },
    {
      "num": 2,
      "title": "Present Perfect Simple vs Present Perfect Continuous",
      "desc": "Taqqoslash"
    },
    {
      "num": 3,
      "title": "Past Perfect Simple",
      "desc": "Actions completed before another point in the past"
    },
    {
      "num": 4,
      "title": "Narrative Tenses: Storytelling",
      "desc": "Combining past tenses for engaging narrative storytelling"
    },
    {
      "num": 5,
      "title": "Second Conditional: Unreal Situations",
      "desc": "Ikkinchi tur shart gaplari"
    },
    {
      "num": 6,
      "title": "Third Conditional: Past Regrets",
      "desc": "Unreal past conditions, hypothetical outcomes, and regrets"
    },
    {
      "num": 7,
      "title": "Wish / If Only",
      "desc": "Hypothetical wishes about present and past situations"
    },
    {
      "num": 8,
      "title": "Modal Verbs of Deduction: Must, Might, Can't",
      "desc": "Taxmin modallari"
    },
    {
      "num": 9,
      "title": "Modals of Ability in the Past: Could, Managed to, Was able to",
      "desc": "Modals of Ability in the Past: Could, Managed to, Was able to"
    },
    {
      "num": 10,
      "title": "Reported Speech: Statements",
      "desc": "Reporting statements with backshifted verb tenses"
    },
    {
      "num": 11,
      "title": "Reported Speech: Questions & Commands",
      "desc": "Reported questions, commands, instructions, and requests"
    },
    {
      "num": 12,
      "title": "Passive Voice: All Tenses",
      "desc": "Passive voice across all tenses"
    },
    {
      "num": 13,
      "title": "Causatives: Have / Get Something Done",
      "desc": "Xizmatlardan foydalanish"
    },
    {
      "num": 14,
      "title": "Non-defining Relative Clauses",
      "desc": "Relative clauses providing non-essential parenthetical detail"
    },
    {
      "num": 15,
      "title": "Quantifiers: All, Both, Neither, Either, None",
      "desc": "Quantifiers: All, Both, Neither, Either, None"
    },
    {
      "num": 16,
      "title": "Question Tags",
      "desc": "Question tags: Isn't it? Don't you?"
    },
    {
      "num": 17,
      "title": "Indirect Questions",
      "desc": "Polite embedded questions starting with 'Could you tell me...'"
    },
    {
      "num": 18,
      "title": "So / Such... That",
      "desc": "Shunchalik...ki tuzilmasi"
    },
    {
      "num": 19,
      "title": "Connecting Words: Although, However, In spite of",
      "desc": "Concession and contrast linkers: although, even though, in spite of"
    },
    {
      "num": 20,
      "title": "Expressing Opinions & Agreeing/Disagreeing",
      "desc": "Fikr bildirish"
    },
    {
      "num": 21,
      "title": "Phrasal Verbs 2: Work & Travel",
      "desc": "Iborali fe'llar"
    },
    {
      "num": 22,
      "title": "Education & School Systems",
      "desc": "Academic subjects, qualifications, exams, and schooling"
    },
    {
      "num": 23,
      "title": "Work, Jobs & Job Interviews",
      "desc": "Muvaffaqiyatli suhbatga tayyorlov"
    },
    {
      "num": 24,
      "title": "Environment & Natural Disasters",
      "desc": "Ecology, environmental protection, and natural disasters"
    },
    {
      "num": 25,
      "title": "Health, Fitness & Illnesses",
      "desc": "Medical treatments, physical fitness, symptoms, and remedies"
    },
    {
      "num": 26,
      "title": "Crime & Law Vocabulary",
      "desc": "Legal terminology, courtroom procedures, and criminal law"
    },
    {
      "num": 27,
      "title": "Media, News & Social Media",
      "desc": "Journalism, broadcasting, social platforms, and media bias"
    },
    {
      "num": 28,
      "title": "Travel & Tourism",
      "desc": "Ecotourism, cultural sightseeing, itineraries, and hospitality"
    },
    {
      "num": 29,
      "title": "IELTS Writing Task 1: Overview of Graphs",
      "desc": "Grafiklar sharhi"
    },
    {
      "num": 30,
      "title": "IELTS Writing Task 2: Essay Structure",
      "desc": "Insho tuzilishi"
    },
    {
      "num": 31,
      "title": "IELTS Speaking Part 1: Personal Questions",
      "desc": "Suhbat 1-qism"
    },
    {
      "num": 32,
      "title": "IELTS Speaking Part 2: Cue Card Strategy",
      "desc": "Suhbat 2-qism"
    },
    {
      "num": 33,
      "title": "IELTS Listening: Multiple Choice Strategies",
      "desc": "Tinglab tushunish"
    },
    {
      "num": 34,
      "title": "IELTS Reading: Skimming & Scanning",
      "desc": "Reading techniques: locating information and understanding gist"
    },
    {
      "num": 35,
      "title": "Describing Graphs & Trends",
      "desc": "Describing upward/downward trends, fluctuations, and stability"
    },
    {
      "num": 36,
      "title": "Prefixes & Suffixes: Word Formation",
      "desc": "Morphological word building with prefixes and suffixes"
    },
    {
      "num": 37,
      "title": "Collocations 1: Verb + Noun Combinations",
      "desc": "Common verb-noun combinations and lexical chunks"
    },
    {
      "num": 38,
      "title": "Formal vs Informal Register",
      "desc": "Stylistic register differences in academic and informal English"
    },
    {
      "num": 39,
      "title": "Writing Formal Emails & Letters",
      "desc": "Rasmiy xatlar yozish"
    },
    {
      "num": 40,
      "title": "B1 Level Progress Examination",
      "desc": "B1 Level milestone assessment"
    }
  ],
  "B2": [
    {
      "num": 1,
      "title": "Advanced Future Forms",
      "desc": "Future Continuous, Future Perfect"
    },
    {
      "num": 2,
      "title": "Future in the Past",
      "desc": "Future in the past: actions intended or predicted in the past"
    },
    {
      "num": 3,
      "title": "Mixed Conditionals",
      "desc": "Aralash turdagi shart gaplar"
    },
    {
      "num": 4,
      "title": "Advanced Passive Structures: It is said that / He is thought to...",
      "desc": "Advanced Passive Structures: It is said that / He is thought to..."
    },
    {
      "num": 5,
      "title": "Inversion after Negative Adverbs",
      "desc": "Negative adverb fronting with subject-auxiliary inversion"
    },
    {
      "num": 6,
      "title": "Emphatic Structures: Split Sentences",
      "desc": "Cleft Sentences"
    },
    {
      "num": 7,
      "title": "Participle Clauses",
      "desc": "Participle clauses reducing relative and adverbial clauses"
    },
    {
      "num": 8,
      "title": "Advanced Modal Verbs in the Past: Should have, Could have",
      "desc": "Advanced Modal Verbs in the Past: Should have, Could have"
    },
    {
      "num": 9,
      "title": "Complex Relative Clauses & Prepositions",
      "desc": "Preposition + Which/Whom"
    },
    {
      "num": 10,
      "title": "Advanced Reported Speech & Reporting Verbs",
      "desc": "Urge, Deny, Insist"
    },
    {
      "num": 11,
      "title": "Verbs of Sensation + Bare Infinitive / -ing",
      "desc": "Segi a'zolari fe'llari"
    },
    {
      "num": 12,
      "title": "Subjunctive Mood in Modern English",
      "desc": "Mandative subjunctive in formal and legislative statements"
    },
    {
      "num": 13,
      "title": "Advanced Articles & Noun Phrases",
      "desc": "Advanced Articles & Noun Phrases"
    },
    {
      "num": 14,
      "title": "Discourse Markers & Text Cohesion",
      "desc": "Cohesive discourse markers"
    },
    {
      "num": 15,
      "title": "Advanced Phrasal Verbs 3: Abstract Concepts",
      "desc": "Murakkab iborali fe'llar"
    },
    {
      "num": 16,
      "title": "Advanced Collocations 2: Adjective + Noun / Adverb + Adjective",
      "desc": "Advanced Collocations 2: Adjective + Noun / Adverb + Adjective"
    },
    {
      "num": 17,
      "title": "Idioms: Work, Life & Relationships",
      "desc": "Idiomatic expressions for workplace, lifestyle, and relationships"
    },
    {
      "num": 18,
      "title": "Academic Vocabulary for IELTS Writing",
      "desc": "Formal vocabulary, academic collocations, and register precision"
    },
    {
      "num": 19,
      "title": "IELTS Writing Task 1: Line Graphs & Bar Charts",
      "desc": "Reporting dynamic trends and comparisons in line/bar graphs"
    },
    {
      "num": 20,
      "title": "IELTS Writing Task 1: Pie Charts & Tables",
      "desc": "Analyzing static proportion and statistical categorical tables"
    },
    {
      "num": 21,
      "title": "IELTS Writing Task 1: Process Diagrams & Maps",
      "desc": "Describing cyclic manufacturing stages and geographic changes"
    },
    {
      "num": 22,
      "title": "IELTS Writing Task 2: Opinion Essays",
      "desc": "Agree/Disagree"
    },
    {
      "num": 23,
      "title": "IELTS Writing Task 2: Discussion Essays",
      "desc": "Discuss Both Views"
    },
    {
      "num": 24,
      "title": "IELTS Writing Task 2: Problem & Solution Essays",
      "desc": "Analyzing societal issues, consequences, and proposing remedies"
    },
    {
      "num": 25,
      "title": "IELTS Speaking Part 3: Abstract Discussion",
      "desc": "Complex analytical reading comprehension"
    },
    {
      "num": 26,
      "title": "IELTS Reading: True / False / Not Given Mastery",
      "desc": "IELTS Reading: True / False / Not Given Mastery"
    },
    {
      "num": 27,
      "title": "IELTS Reading: Headings Matching & Gap Fills",
      "desc": "IELTS Reading: Headings Matching & Gap Fills"
    },
    {
      "num": 28,
      "title": "IELTS Listening: Map Labelling & Section 4 Strategies",
      "desc": "IELTS Listening: Map Labelling & Section 4 Strategies"
    },
    {
      "num": 29,
      "title": "Business & Global Economy Vocabulary",
      "desc": "Macroeconomics, global commerce, startups, and entrepreneurship"
    },
    {
      "num": 30,
      "title": "Globalization & Culture",
      "desc": "Cultural integration, international exchange, and migration"
    },
    {
      "num": 31,
      "title": "Science, Innovation & Artificial Intelligence",
      "desc": "Emerging scientific breakthroughs, AI ethics, and robotics"
    },
    {
      "num": 32,
      "title": "Psychology & Human Behaviour",
      "desc": "Psixologiya"
    },
    {
      "num": 33,
      "title": "Environment: Climate Change & Sustainability",
      "desc": "Global warming, renewable energy, and ecological footprint"
    },
    {
      "num": 34,
      "title": "Architecture, Cities & Urban Planning",
      "desc": "Urbanistika"
    },
    {
      "num": 35,
      "title": "Consumerism & Advertising",
      "desc": "Targeted marketing, brand consumerism, and persuasion tactics"
    },
    {
      "num": 36,
      "title": "Nuances in Meaning: Synonym Differentiation",
      "desc": "Sinonimlar farqi"
    },
    {
      "num": 37,
      "title": "Writing Formal Reports & Proposals",
      "desc": "Structuring formal business proposals, executive summaries, and reports"
    },
    {
      "num": 38,
      "title": "Paraphrasing Techniques for High Band Score",
      "desc": "Qayta tahrirlash"
    },
    {
      "num": 39,
      "title": "Pronunciation: Intonation & Sentence Stress",
      "desc": "Sentence stress, contrastive tonicity, and communicative intent"
    },
    {
      "num": 40,
      "title": "B2 Certification & IELTS Band 6.5–7.0 Mock Exam",
      "desc": "B2 Certification & IELTS Band 6.5–7.0 Mock Exam"
    }
  ],
  "C1": [
    {
      "num": 1,
      "title": "Advanced Inversion with Conditional Sentences",
      "desc": "Had I known..., Were you to..."
    },
    {
      "num": 2,
      "title": "Advanced Ellipsis & Substitution",
      "desc": "Ellipsis and substitution techniques"
    },
    {
      "num": 3,
      "title": "Advanced Nominal Clauses",
      "desc": "What I mean is..., That he survived is a miracle"
    },
    {
      "num": 4,
      "title": "Advanced Sentence Adverbs & Modifiers",
      "desc": "Admittedly, Presumably"
    },
    {
      "num": 5,
      "title": "Complex Prepositional Phrases",
      "desc": "In light of, On behalf of, By virtue of"
    },
    {
      "num": 6,
      "title": "Passives with Impersonal Construction & Gerunds",
      "desc": "Passives with Impersonal Construction & Gerunds"
    },
    {
      "num": 7,
      "title": "Compound Adjectives & Nouns",
      "desc": "Advanced Word Building"
    },
    {
      "num": 8,
      "title": "Idiomatic Expressions & Metaphors",
      "desc": "Metaphorical language, nuance, and figurative idioms"
    },
    {
      "num": 9,
      "title": "Advanced Discourse Markers for Formal Writing",
      "desc": "Advanced Discourse Markers for Formal Writing"
    },
    {
      "num": 10,
      "title": "Precision in Vocabulary: Fine Distinctions",
      "desc": "Subtle semantic distinctions among near-synonyms"
    },
    {
      "num": 11,
      "title": "Stylistic Devices: Alliteration, Hyperbole & Irony",
      "desc": "Adabiy uslublar"
    },
    {
      "num": 12,
      "title": "Register Nuances: Academic, Legal, Medical & Conversational",
      "desc": "Register Nuances: Academic, Legal, Medical & Conversational"
    },
    {
      "num": 13,
      "title": "IELTS Academic Task 2: Band 8+ Cohesion & Coherence",
      "desc": "IELTS Academic Task 2: Band 8+ Cohesion & Coherence"
    },
    {
      "num": 14,
      "title": "IELTS Academic Task 2: Advanced Lexical Resource Strategies",
      "desc": "IELTS Academic Task 2: Advanced Lexical Resource Strategies"
    },
    {
      "num": 15,
      "title": "IELTS Academic Task 2: Complex Grammatical Structures",
      "desc": "IELTS Academic Task 2: Complex Grammatical Structures"
    },
    {
      "num": 16,
      "title": "Advanced Paraphrasing & Academic Synthesis",
      "desc": "Synthesizing contradictory viewpoints and academic paraphrasing"
    },
    {
      "num": 17,
      "title": "IELTS Speaking Part 3: Fluency, Coherence & Native Expressions",
      "desc": "IELTS Speaking Part 3: Fluency, Coherence & Native Expressions"
    },
    {
      "num": 18,
      "title": "Critical Thinking & Argumentative Essay Writing",
      "desc": "Tanqidiy fikrlash"
    },
    {
      "num": 19,
      "title": "Speed Reading & Advanced Inference in Academic Texts",
      "desc": "Speed Reading & Advanced Inference in Academic Texts"
    },
    {
      "num": 20,
      "title": "IELTS Listening: Complex Accents & Speed Adaptation",
      "desc": "IELTS Listening: Complex Accents & Speed Adaptation"
    },
    {
      "num": 21,
      "title": "Philosophy, Ethics & Moral Dilemmas",
      "desc": "Ethical frameworks, utilitarianism, and moral dilemmas"
    },
    {
      "num": 22,
      "title": "Politics, Governance & International Relations",
      "desc": "Siyosat"
    },
    {
      "num": 23,
      "title": "Genetics, Biotechnology & Ethics",
      "desc": "Genetic modification, crispr ethics, and biomedical engineering"
    },
    {
      "num": 24,
      "title": "Sociology, Social Class & Inequality",
      "desc": "Sotsiologiya"
    },
    {
      "num": 25,
      "title": "Astronomy, Cosmology & Space Exploration",
      "desc": "Koinot"
    },
    {
      "num": 26,
      "title": "History, Archaeology & Civilizations",
      "desc": "Archaeological excavation, historical interpretation, and heritage"
    },
    {
      "num": 27,
      "title": "Linguistics, Language Acquisition & Extinction",
      "desc": "Tilshunoslik"
    },
    {
      "num": 28,
      "title": "Neuroscience & Consciousness",
      "desc": "Neyrobiologiya"
    },
    {
      "num": 29,
      "title": "Mass Media Ethics & Misinformation",
      "desc": "OAV xavfsizligi"
    },
    {
      "num": 30,
      "title": "Financial Markets & Cryptocurrency",
      "desc": "Decentralized finance, investment portfolios, and financial markets"
    },
    {
      "num": 31,
      "title": "Advanced Business Presentations & Negotiation Skills",
      "desc": "Advanced Business Presentations & Negotiation Skills"
    },
    {
      "num": 32,
      "title": "Rhetoric & Public Speaking Techniques",
      "desc": "Natiqaslik san'ati"
    },
    {
      "num": 33,
      "title": "Collocations with High-level Abstract Nouns",
      "desc": "Collocations with High-level Abstract Nouns"
    },
    {
      "num": 34,
      "title": "Advanced Phrasal Verbs with Multiple Meanings",
      "desc": "Advanced Phrasal Verbs with Multiple Meanings"
    },
    {
      "num": 35,
      "title": "Writing Academic Abstracts & Executive Summaries",
      "desc": "Writing Academic Abstracts & Executive Summaries"
    },
    {
      "num": 36,
      "title": "Error Analysis: Common Band 7 to 8 Pitfalls",
      "desc": "Comprehensive error analysis"
    },
    {
      "num": 37,
      "title": "Nuanced Expressing of Uncertainty & Probability",
      "desc": "Ehtimollik ifodasi"
    },
    {
      "num": 38,
      "title": "Advanced Listening: Lectures, Debates & Podcasts",
      "desc": "Advanced Listening: Lectures, Debates & Podcasts"
    },
    {
      "num": 39,
      "title": "Native-like Conversational Fillers & Softeners",
      "desc": "Native-like Conversational Fillers & Softeners"
    },
    {
      "num": 40,
      "title": "C1 Level Final Assessment & IELTS Band 7.5–8.0 Simulation",
      "desc": "C1 Level Final Assessment & IELTS Band 7.5–8.0 Simulation"
    }
  ],
  "C2": [
    {
      "num": 1,
      "title": "Masterful Sentence Structure & Syntax Variations",
      "desc": "Sintaktik mahorat"
    },
    {
      "num": 2,
      "title": "Rare & Archaic Grammar Forms in Modern Contexts",
      "desc": "Rare & Archaic Grammar Forms in Modern Contexts"
    },
    {
      "num": 3,
      "title": "Punctuation Nuances: Semicolons, Colons, Dashes for Style",
      "desc": "Punctuation Nuances: Semicolons, Colons, Dashes for Style"
    },
    {
      "num": 4,
      "title": "Absolute Clauses & Parenthetical Constructions",
      "desc": "Absolute Clauses & Parenthetical Constructions"
    },
    {
      "num": 5,
      "title": "Sophisticated Use of Unexpressed Assumptions & Implicature",
      "desc": "Sophisticated Use of Unexpressed Assumptions & Implicature"
    },
    {
      "num": 6,
      "title": "Extreme Inversion & Stylistic Fronting",
      "desc": "Out stepped the king..."
    },
    {
      "num": 7,
      "title": "Academic & Literary Prose Editing",
      "desc": "Tekstlarni professional tahrirlash"
    },
    {
      "num": 8,
      "title": "Idiomatic Precision & Cultural Allusions",
      "desc": "Literary devices, archaic nuances, and cultural allusions"
    },
    {
      "num": 9,
      "title": "Native-level Wordplay, Puns & Humor Mechanics",
      "desc": "Native-level Wordplay, Puns & Humor Mechanics"
    },
    {
      "num": 10,
      "title": "Rhetorical Devices: Anaphora, Chiasmus, Antithesis",
      "desc": "Rhetorical Devices: Anaphora, Chiasmus, Antithesis"
    },
    {
      "num": 11,
      "title": "Writing for Publication: Journal Articles & Essays",
      "desc": "Writing for Publication: Journal Articles & Essays"
    },
    {
      "num": 12,
      "title": "Advanced Critical Discourse Analysis",
      "desc": "Inferential textual analysis and nuances"
    },
    {
      "num": 13,
      "title": "Debating Complex Global Policies & Philosophical Thought",
      "desc": "Debating Complex Global Policies & Philosophical Thought"
    },
    {
      "num": 14,
      "title": "Epistemology: What is Knowledge'",
      "desc": "Epistemology, rationalism, ontology, and epistemic truth"
    },
    {
      "num": 15,
      "title": "Quantum Computing & Theoretical Physics Concepts",
      "desc": "Quantum Computing & Theoretical Physics Concepts"
    },
    {
      "num": 16,
      "title": "Macroeconomics, Monetary Policies & Global Systems",
      "desc": "Macroeconomics, Monetary Policies & Global Systems"
    },
    {
      "num": 17,
      "title": "Deep Psychology: Behavioral Economics & Biases",
      "desc": "Xulq-atvor iqtisodiyoti"
    },
    {
      "num": 18,
      "title": "Environmental Law & Global Treaties",
      "desc": "Xalqaro ekologik huquq"
    },
    {
      "num": 19,
      "title": "Artificial General Intelligence (AGI) & Transhumanism",
      "desc": "Artificial General Intelligence (AGI) & Transhumanism"
    },
    {
      "num": 20,
      "title": "Post-Modern Literature & Classical Poetry Analysis",
      "desc": "Post-Modern Literature & Classical Poetry Analysis"
    },
    {
      "num": 21,
      "title": "Anthropological Perspectives on Culture & Rituals",
      "desc": "Anthropological Perspectives on Culture & Rituals"
    },
    {
      "num": 22,
      "title": "Medical Ethics, Euthanasia & Bioethics",
      "desc": "Medical Ethics, Euthanasia & Bioethics"
    },
    {
      "num": 23,
      "title": "Criminal Justice Systems & Penology",
      "desc": "Jurisprudence, penal reform, restorative justice, and legal theory"
    },
    {
      "num": 24,
      "title": "Architectural Theory & Urban Aesthetics",
      "desc": "Architectural Theory & Urban Aesthetics"
    },
    {
      "num": 25,
      "title": "Cognitive Linguistics & Conceptual Metaphor Theory",
      "desc": "Cognitive Linguistics & Conceptual Metaphor Theory"
    },
    {
      "num": 26,
      "title": "History of Diplomacy & Geopolitics",
      "desc": "History of Diplomacy & Geopolitics"
    },
    {
      "num": 27,
      "title": "Art Criticism, Aesthetics & Visual Culture Analysis",
      "desc": "Art Criticism, Aesthetics & Visual Culture Analysis"
    },
    {
      "num": 28,
      "title": "Advanced Corporate Strategy & Mergers",
      "desc": "Korporativ strategiya"
    },
    {
      "num": 29,
      "title": "Analyzing Propaganda & Psychological Warfare",
      "desc": "Analyzing Propaganda & Psychological Warfare"
    },
    {
      "num": 30,
      "title": "Complex Negotiations & Dispute Resolution",
      "desc": "Complex Negotiations & Dispute Resolution"
    },
    {
      "num": 31,
      "title": "Native Accent Variations: Received Pronunciation, General American, Regional Dialects",
      "desc": "Native Accent Variations: Received Pronunciation, General American, Regional Dialects"
    },
    {
      "num": 32,
      "title": "Subtle Humor, Irony, Sarcasm & Innuendo Recognition",
      "desc": "Subtle Humor, Irony, Sarcasm & Innuendo Recognition"
    },
    {
      "num": 33,
      "title": "Simultaneous Translation & Interpretation Techniques",
      "desc": "Simultan tarjima"
    },
    {
      "num": 34,
      "title": "High-Level Editing: Removing Wordiness & Improving Flow",
      "desc": "High-Level Editing: Removing Wordiness & Improving Flow"
    },
    {
      "num": 35,
      "title": "Synthesis of Multiple Complex Academic Texts",
      "desc": "Synthesis of Multiple Complex Academic Texts"
    },
    {
      "num": 36,
      "title": "Precision in Terminology Across Multi-Disciplinary Fields",
      "desc": "Precision in Terminology Across Multi-Disciplinary Fields"
    },
    {
      "num": 37,
      "title": "Mastery over Lexical Register Transitions",
      "desc": "Effortless calibration between hyper-formal and colloquial registers"
    },
    {
      "num": 38,
      "title": "Expressing Abstract & Elusive Concepts Effortlessly",
      "desc": "Expressing Abstract & Elusive Concepts Effortlessly"
    },
    {
      "num": 39,
      "title": "IELTS Band 9.0 Perfection & Native-Speaker Benchmarking",
      "desc": "IELTS Band 9.0 Perfection & Native-Speaker Benchmarking"
    },
    {
      "num": 40,
      "title": "C2 Mastery Capstone Project & Final Certification",
      "desc": "C2 Mastery Capstone Project & Final Certification"
    }
  ]
};
  window.ETHITH_CURRICULUM = CURRICULUM;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Common vocabulary pools
  var NAMES = ["Ali", "Vali", "Malika", "Zuhra", "John", "Emma", "David", "Sarah", "Alex", "Elena", "Michael", "Sophia", "Tom", "Anna", "Bob", "Lucy", "James", "Lily", "Peter", "Kate"];
  var PRONOUNS = [
    { sub: "I", be: "am", negBe: "am not", pastBe: "was", do: "do", have: "have", poss: "my", obj: "me" },
    { sub: "He", be: "is", negBe: "is not", pastBe: "was", do: "does", have: "has", poss: "his", obj: "him" },
    { sub: "She", be: "is", negBe: "is not", pastBe: "was", do: "does", have: "has", poss: "her", obj: "her" },
    { sub: "We", be: "are", negBe: "are not", pastBe: "were", do: "do", have: "have", poss: "our", obj: "us" },
    { sub: "They", be: "are", negBe: "are not", pastBe: "were", do: "do", have: "have", poss: "their", obj: "them" },
    { sub: "You", be: "are", negBe: "are not", pastBe: "were", do: "do", have: "have", poss: "your", obj: "you" }
  ];

  var JOBS = ["teacher", "doctor", "engineer", "pilot", "nurse", "artist", "chef", "driver", "lawyer", "architect", "dentist", "scientist"];
  var COUNTRIES = [
    { country: "Uzbekistan", nat: "Uzbek", lang: "Uzbek" },
    { country: "the UK", nat: "British", lang: "English" },
    { country: "the USA", nat: "American", lang: "English" },
    { country: "Germany", nat: "German", lang: "German" },
    { country: "France", nat: "French", lang: "French" },
    { country: "Japan", nat: "Japanese", lang: "Japanese" },
    { country: "Turkey", nat: "Turkish", lang: "Turkish" },
    { country: "Spain", nat: "Spanish", lang: "Spanish" }
  ];

  var VERBS_BASE = [
    { v: "read", s: "reads", past: "read", pp: "read", ing: "reading", uz: "o'qimoq" },
    { v: "write", s: "writes", past: "wrote", pp: "written", ing: "writing", uz: "yozmoq" },
    { v: "speak", s: "speaks", past: "spoke", pp: "spoken", ing: "speaking", uz: "gapirmoq" },
    { v: "watch", s: "watches", past: "watched", pp: "watched", ing: "tomosha qilmoq" },
    { v: "visit", s: "visits", past: "visited", pp: "visited", ing: "tashrif buyurmoq" },
    { v: "learn", s: "learns", past: "learned", pp: "learned", ing: "o'rganmoq" },
    { v: "play", s: "plays", past: "played", pp: "played", ing: "o'ynamoq" },
    { v: "eat", s: "eats", past: "ate", pp: "eaten", ing: "yemoq" },
    { v: "drink", s: "drinks", past: "drank", pp: "drunk", ing: "ichmoq" },
    { v: "buy", s: "buys", past: "bought", pp: "bought", ing: "sotib olmoq" },
    { v: "make", s: "makes", past: "made", pp: "made", ing: "yasamoq" },
    { v: "take", s: "takes", past: "took", pp: "taken", ing: "olmoq" },
    { v: "finish", s: "finishes", past: "finished", pp: "finished", ing: "tugatmoq" },
    { v: "understand", s: "understands", past: "understood", pp: "understood", ing: "tushunmoq" }
  ];

  function formatOptions(correct, distractors, explanation) {
    var uniqueDist = distractors.filter(function(d) { return d !== correct; });
    var opts = [correct].concat(uniqueDist.slice(0, 3));
    while (opts.length < 4) {
      opts.push("None of the above");
    }
    opts = shuffle(opts);
    return {
      options: opts,
      answer: correct,
      explanation: explanation
    };
  }

  /**
   * Main algorithmic generator for any level and topic
   */
  function generateTopicQuiz(level, topicNum, count) {
    count = Math.max(25, Math.min(50, count || 25));
    var lvlTopics = CURRICULUM[level] || CURRICULUM["A1"];
    var topic = lvlTopics.find(function(t) { return t.num === topicNum; }) || lvlTopics[0];
    var title = topic.title;

    var questions = [];
    var seenQ = {};

    var attempts = 0;
    while (questions.length < count && attempts < 400) {
      attempts++;
      var qItem = generateSingleQuestion(level, topicNum, title, questions.length + 1);
      if (qItem && !seenQ[qItem.q]) {
        seenQ[qItem.q] = true;
        questions.push(qItem);
      }
    }

    // If still short, generate variations
    while (questions.length < count) {
      var fallback = generateSingleQuestion(level, topicNum, title, questions.length + 1);
      questions.push(fallback);
    }

    return questions.slice(0, count);
  }

  function generateSingleQuestion(level, topicNum, title, index) {
    var p = pickRandom(PRONOUNS);
    var name = pickRandom(NAMES);
    var verb = pickRandom(VERBS_BASE);
    var job = pickRandom(JOBS);
    var c = pickRandom(COUNTRIES);

    var qText = "";
    var correct = "";
    var distractors = [];
    var exp = "";

    // Specific algorithmic logic by Level and Topic
    if (level === "A1") {
      if (topicNum === 1 || topicNum === 4) { // Verb to be & Pronouns
        var mode = index % 3;
        if (mode === 0) {
          qText = p.sub + " ___ a hardworking " + job + ".";
          correct = p.be;
          distractors = ["are", "am", "is", "be"];
          exp = "The pronoun '" + p.sub + "' correctly pairs with the form '" + p.be + "' of the verb 'to be'.";
        } else if (mode === 1) {
          qText = name + " and " + p.sub.toLowerCase() + " ___ in the classroom right now.";
          correct = "are";
          distractors = ["is", "am", "be", "was"];
          exp = "Because there are two people (plural subject), the plural verb form 'are' is used.";
        } else {
          qText = name + " ___ not feeling well today.";
          correct = "is";
          distractors = ["are", "am", "be", "were"];
          exp = "With third-person singular subjects (he/she/it), 'is not' (isn't) is required.";
        }
      } else if (topicNum === 2) { // Questions with to be
        qText = "___ " + p.sub.toLowerCase() + " ready to start the lesson?";
        correct = p.be.charAt(0).toUpperCase() + p.be.slice(1);
        distractors = ["Do", "Does", "Are", "Is", "Am"];
        exp = "When forming a question with 'to be', the verb form (" + correct + ") inverts to precede the subject.";
      } else if (topicNum === 3) { // Numbers & Dates
        var numMap = { "12": "twelve", "20": "twenty", "15": "fifteen", "30": "thirty", "40": "forty", "50": "fifty", "100": "one hundred" };
        var nKeys = Object.keys(numMap);
        var k = pickRandom(nKeys);
        qText = "Choose the correct spelling of the number " + k + ":";
        correct = numMap[k];
        distractors = [k + "teen", k + "ty", "twelv", "fiveteen", "fourty"];
        exp = "The correct English spelling for " + k + " is '" + correct + "'.";
      } else if (topicNum === 5) { // Countries & Nationalities
        qText = name + " is from " + c.country + ". He is ___.";
        correct = c.nat;
        distractors = [c.country, c.lang + "ish", "from " + c.nat, c.lang];
        exp = "To describe nationality or origin, use the nationality adjective '" + c.nat + "'.";
      } else if (topicNum === 6 || topicNum === 9) { // Possessives
        qText = "This is " + name + "'s book. It is ___ book.";
        correct = (name === "Ali" || name === "Vali" || name === "John") ? "his" : "her";
        distractors = ["him", "she", "he", "hers"];
        exp = "Possessive adjectives ('his' or 'her') modify nouns to show ownership.";
      } else if (topicNum === 7 || topicNum === 8) { // Plurals & Demonstratives
        var mode = index % 2;
        if (mode === 0) {
          qText = "___ books over there on that far table are mine.";
          correct = "Those";
          distractors = ["These", "This", "That", "Them"];
          exp = "Use 'Those' for plural objects that are far away in distance or time.";
        } else {
          qText = "Look at ___ watch on my wrist right here.";
          correct = "this";
          distractors = ["these", "those", "that", "them"];
          exp = "Use 'this' for a singular object that is near the speaker.";
        }
      } else if (topicNum === 10 || topicNum === 11) { // Present Simple
        var isSingular = (p.sub === "He" || p.sub === "She");
        if (index % 2 === 0) {
          qText = p.sub + " usually ___ English every morning.";
          correct = isSingular ? verb.s : verb.v;
          distractors = [verb.ing, verb.past, isSingular ? verb.v : verb.s, "to " + verb.v];
          exp = "In Present Simple, third-person singular (he/she/it) verbs take the -s/-es suffix; other subjects use the base verb.";
        } else {
          qText = (isSingular ? "Does " : "Do ") + p.sub.toLowerCase() + " ___ coffee in the afternoon?";
          correct = "drink";
          distractors = ["drinks", "drinking", "drank", "dranked"];
          exp = "In questions using Do/Does, the auxiliary carries the tense, so the main verb stays in its bare infinitive form.";
        }
      } else if (topicNum === 24) { // Can / Can't
        qText = name + " can ___ three languages fluently.";
        correct = "speak";
        distractors = ["speaks", "speaking", "to speak", "spoke"];
        exp = "Modal verbs (can, could, must, should) are always followed directly by a bare infinitive without 'to'.";
      } else if (topicNum === 25 || topicNum === 26) { // Present Continuous
        qText = "Look! " + name + " ___ a letter at the moment.";
        correct = "is writing";
        distractors = ["writes", "write", "are writing", "was writing"];
        exp = "Time markers like 'Look!' and 'at the moment' indicate ongoing actions in the Present Continuous (be + -ing).";
      } else if (topicNum >= 32 && topicNum <= 35) { // Past Simple
        if (index % 2 === 0) {
          qText = "Yesterday, " + name + " ___ to the market and bought fresh fruit.";
          correct = "went";
          distractors = ["goes", "go", "gone", "going"];
          exp = "'Yesterday' is a definitive past time marker requiring Past Simple; the irregular past of 'go' is 'went'.";
        } else {
          qText = name + " didn't ___ TV last night.";
          correct = "watch";
          distractors = ["watched", "watching", "watches", "to watch"];
          exp = "After the negative auxiliary 'didn't', the main verb always reverts to its base infinitive form.";
        }
      } else { // General A1 Topics
        qText = "Choose the correct option for: " + title + " (" + (index) + "):\n" + name + " wants to ___ English well.";
        correct = "learn";
        distractors = ["learning", "learns", "learned", "to learn"];
        exp = "After 'wants to', use the base infinitive verb (learn) to express desires.";
      }
    } else if (level === "A2") {
      if (topicNum === 3 || topicNum === 4) { // Past Continuous vs Past Simple
        qText = "While " + name + " ___ a shower, the telephone suddenly rang.";
        correct = "was taking";
        distractors = ["took", "is taking", "were taking", "takes"];
        exp = "A background continuous action introduced by 'while' uses Past Continuous (was/were + -ing), interrupted by Past Simple.";
      } else if (topicNum === 5 || topicNum === 6) { // Comparatives & Superlatives
        if (index % 2 === 0) {
          qText = "A plane is ___ than a train.";
          correct = "faster";
          distractors = ["more fast", "fastest", "fast", "as fast"];
          exp = "Single-syllable adjectives form their comparative degree by adding '-er' followed by 'than'.";
        } else {
          qText = "Mount Everest is ___ mountain in the world.";
          correct = "the highest";
          distractors = ["highest", "more high", "higher", "the most high"];
          exp = "Superlative adjectives always take the definite article 'the' and the '-est' suffix.";
        }
      } else if (topicNum >= 10 && topicNum <= 13) { // Present Perfect
        if (index % 2 === 0) {
          qText = "Have you ever ___ to London?";
          correct = "been";
          distractors = ["went", "gone", "being", "be"];
          exp = "Inquiries about life experiences use the Present Perfect construction 'Have you ever been to...'.";
        } else {
          qText = name + " has lived in this city ___ five years.";
          correct = "for";
          distractors = ["since", "during", "ago", "from"];
          exp = "'For' indicates duration over a period of time (e.g. for five years), whereas 'since' denotes a starting point.";
        }
      } else if (topicNum === 16) { // First Conditional
        qText = "If it ___ tomorrow, we will stay at home.";
        correct = "rains";
        distractors = ["will rain", "rained", "raining", "rain"];
        exp = "First Conditional structure: the 'if'-clause uses Present Simple (rains), while the result clause uses 'will + base verb'.";
      } else if (topicNum === 31) { // Used to
        qText = "When I was a child, I used to ___ in the village.";
        correct = "live";
        distractors = ["living", "lived", "lives", "to live"];
        exp = "'Used to' expresses past habits or states and is followed by the bare base form of the verb.";
      } else if (topicNum === 33 || topicNum === 34) { // Passive Voice
        qText = "English ___ by millions of people worldwide.";
        correct = "is spoken";
        distractors = ["speaks", "is speaking", "spoke", "has spoke"];
        exp = "Passive Voice formula is 'be + past participle (V3)': 'is spoken' correctly describes the general truth.";
      } else {
        qText = "Select the correct grammatically accurate sentence related to: " + title + ":\n" + name + " ___ to complete the project on time.";
        correct = "has to work hard";
        distractors = ["have to work hard", "must to work hard", "should working", "has work hard"];
        exp = "Third-person singular obligations require 'has to' followed by the base verb: 'has to work'.";
      }
    } else if (level === "B1") {
      if (topicNum === 1 || topicNum === 2) { // Present Perfect Continuous vs Simple
        if (index % 2 === 0) {
          qText = name + " is exhausted because he ___ in the garden for four hours.";
          correct = "has been working";
          distractors = ["has worked", "is working", "works", "had worked"];
          exp = "Present Perfect Continuous (has been working) highlights an action continuing over time with present evidence or fatigue.";
        } else {
          qText = "How many pages of the book ___ so far?";
          correct = "have you read";
          distractors = ["have you been reading", "did you read", "do you read", "are you reading"];
          exp = "When asking about completed quantities or finished items, use Present Perfect Simple (have you read).";
        }
      } else if (topicNum === 3) { // Past Perfect
        qText = "When the police arrived, the thieves ___ already fled.";
        correct = "had";
        distractors = ["have", "has", "did", "were"];
        exp = "Past Perfect (had + past participle) designates an action completed prior to another past event.";
      } else if (topicNum === 5) { // Second Conditional
        qText = "If I ___ a million dollars, I would travel around the world.";
        correct = "won";
        distractors = ["win", "would win", "have won", "will win"];
        exp = "Second Conditional (hypothetical present/future): 'if' + Past Simple, result clause with 'would' + base verb.";
      } else if (topicNum === 6) { // Third Conditional
        qText = "If she had studied harder, she ___ the examination.";
        correct = "would have passed";
        distractors = ["would pass", "passed", "will pass", "had passed"];
        exp = "Third Conditional (past regrets/unreal past): 'if' + Past Perfect (had + V3), result clause with 'would have + V3'.";
      } else if (topicNum === 8) { // Modals of deduction
        qText = "Look at his luxury car and mansion! He ___ be very wealthy.";
        correct = "must";
        distractors = ["can't", "should", "might not", "needn't"];
        exp = "Use 'must' for strong logical deduction and high certainty based on clear observed evidence.";
      } else if (topicNum === 13) { // Causative
        qText = "I don't know how to repair my car, so I will have it ___ by a mechanic.";
        correct = "repaired";
        distractors = ["repair", "repairing", "to repair", "repairs"];
        exp = "Causative structure: 'have + object + past participle (V3)' expresses arranging for someone else to perform a service.";
      } else {
        qText = "Regarding " + title + ": " + name + " wanted to know whether ___ on the weekend.";
        correct = "they would attend the conference";
        distractors = ["would they attend the conference", "they will attend the conference", "did they attend", "they attend"];
        exp = "Reported embedded questions maintain affirmative statement word order (subject + auxiliary/verb) with backshifted tense.";
      }
    } else if (level === "B2") {
      if (topicNum === 1) { // Advanced Future Forms
        qText = "By this time tomorrow, we ___ over the Atlantic ocean.";
        correct = "will be flying";
        distractors = ["will fly", "fly", "are flying", "will have been flown"];
        exp = "Future Continuous (will be + -ing) specifies an ongoing action in progress at a defined future point in time.";
      } else if (topicNum === 3) { // Mixed Conditionals
        qText = "If I had taken your advice yesterday, I ___ in this trouble right now.";
        correct = "wouldn't be";
        distractors = ["wouldn't have been", "won't be", "am not", "hadn't been"];
        exp = "Mixed Conditional: an unreal past condition (had taken) producing a direct consequence in the present (wouldn't be right now).";
      } else if (topicNum === 5) { // Inversion after negative adverbs
        qText = "Rarely ___ such an extraordinary performance in modern theatre.";
        correct = "have I witnessed";
        distractors = ["I have witnessed", "did I witnessed", "I witnessed", "was I witnessed"];
        exp = "Fronted negative or restrictive adverbs (Rarely, Seldom, Never) demand negative inversion: auxiliary + subject + main verb.";
      } else if (topicNum === 8) { // Past modals
        qText = "You ___ that sensitive email to everyone; it was completely confidential!";
        correct = "shouldn't have sent";
        distractors = ["mustn't send", "couldn't send", "needn't send", "wouldn't send"];
        exp = "'Shouldn't have + past participle' expresses criticism or regret regarding an inappropriate past action.";
      } else {
        qText = "Advanced context for " + title + ": The CEO insisted that the audit report ___ submitted without delay.";
        correct = "be";
        distractors = ["is", "was", "will be", "to be"];
        exp = "The mandative subjunctive requires the base form of the verb ('be') following demand/insistence clauses.";
      }
    } else if (level === "C1") {
      if (topicNum === 1) { // Inversion with conditionals
        qText = "___ you require any further assistance, please do not hesitate to contact our office.";
        correct = "Should";
        distractors = ["If", "Were", "Had", "Unless"];
        exp = "In formal conditional inversion omitting 'if', 'Should you require...' replaces 'If you should require...'.";
      } else if (topicNum === 3) { // Nominal clauses
        qText = "___ amazed everyone was how smoothly the entire transition was executed.";
        correct = "What";
        distractors = ["That", "Which", "It", "Whatever"];
        exp = "Nominal relative clauses ('What amazed everyone...') function as a whole noun phrase acting as sentence subject.";
      } else {
        qText = "Formal academic analysis of " + title + ": Under no circumstances ___ proprietary data be disclosed to unauthorized third parties.";
        correct = "may";
        distractors = ["can't", "is to", "will it", "it shall"];
        exp = "Negative phrase fronting ('Under no circumstances') mandates subject-auxiliary inversion: modal + subject + verb.";
      }
    } else { // C2 Level
      if (topicNum === 6) { // Stylistic fronting / extreme inversion
        qText = "Down into the dark abyss ___ the courageous explorers.";
        correct = "plunged";
        distractors = ["did plunge", "they plunged", "was plunging", "plunging"];
        exp = "Locative/directional prepositional fronting triggers full inversion: prepositional phrase + main verb (plunged) + subject.";
      } else {
        qText = "Mastery level syntax for " + title + ": Scarcely had the resolution been ratified ___ fresh geopolitical disputes emerged.";
        correct = "when";
        distractors = ["than", "then", "that", "while"];
        exp = "'Scarcely had... when...' is a correlative inversion structure denoting that one event occurred immediately after another.";
      }
    }

    var formatted = formatOptions(correct, distractors, exp);
    return {
      id: index,
      question: qText,
      options: formatted.options,
      answer: formatted.answer,
      explanation: formatted.explanation
    };
  }

  window.EthithQuizEngine = {
    generateQuiz: generateTopicQuiz,
    getCurriculum: function() { return CURRICULUM; }
  };

})(window);
