# Fluently — Intermediate English Mastery & Practice Studio 🎓

Fluently is a modern web application designed for **intermediate English learners (B1/B2)** to achieve **advanced fluency (C1)** through deliberate practice across **Writing**, **Speaking**, **Reading**, and **Conversational Dialogue**.

![Fluently App](https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 Features

### ✍️ 1. Writing Lab & AI Grammar & Spelling Reviewer
- **Comprehensive Spelling Check**: Identifies common ESL/intermediate spelling traps, double consonant errors (*"occurred"*, *"recommended"*, *"successful"*), silent letters, vowel mixups (*"receive"*, *"separate"*, *"definitely"*), and confusing homophones (*"their/there"*, *"affect/effect"*, *"lose/loose"*).
- **Dedicated Spelling Check Tab & 1-Click Fix All**: Review isolated spelling mistakes with mnemonic tips, or click **"⚡ Fix All Spelling"** to correct all typos simultaneously.
- **Instant Error Detection**: Flags subtle intermediate grammar mistakes (subject-verb agreement, double past tense e.g. *"did not knew"*, missing prepositions).
- **ESL & Regional Traps**: Identifies redundant or non-standard phrases (*"revert back"*, *"prepone"*, *"passed out from college"*, *"discuss about"*).
- **1-Click Corrections**: Apply suggested grammar corrections directly to the text editor.
- **Polished C1 Rewrite**: Automatically rewrites your paragraph with natural native-speaker elegance.
- **B2 → C1 Vocab Enhancer**: Identifies repetitive basic words (*"very good"*, *"hard"*, *"problem"*) and provides high-impact alternatives (*"exceptional"*, *"arduous"*, *"impediment"*).

### 🎙️ 2. Speaking Studio & Pronunciation Engine
- **Live Speech Recognition**: Uses the browser's Web Speech API (`webkitSpeechRecognition`) for hands-free speaking drills.
- **Targeted Drill Categories**: Business Meetings, Everyday Conversations, Common Idioms, and Tongue Twisters.
- **Word-by-Word Accuracy Scoring**: Highlights correct words (🟢), missed words (🔴), and extra/mispronounced words (🟡).
- **Native Audio Reference**: Text-to-Speech playback at customizable speeds (0.7x to 1.3x).
- **Live Audio Waveform**: Animated visualizer canvas giving real-time feedback during microphone recording.

### 📖 3. Reading Lounge & Comprehension
- **Graded Intermediate Articles**: Real-world articles on Habit Formation, Asynchronous Remote Work, and Creativity.
- **Interactive Clickable Vocabulary**: Click any underlined word (e.g. *deliberate*, *ingrained*, *paramount*) for an instant dictionary popover with IPA pronunciation, definitions, and audio.
- **Full Article Audio Narration**: Listen to native-speaker audio playback.
- **Comprehension Quizzes**: Instant checks with detailed explanations.

### 💬 4. Conversational Roleplay Partner & Dynamic AI
- **Dynamic AI Response Branching**: Powered by Gemini LLM + intelligent local heuristic personas for infinite, context-aware back-and-forth dialogue without abrupt script limits.
- **In-Line C1 Starter Phrase Pills ("What could I say next?")**: 3 clickable C1-level suggestions generated for each turn to help intermediate learners formulate advanced, natural responses.
- **Turn-by-Turn Speech with Regional Accents**: Automatic vocalization of bot messages using regional TTS accents (🇬🇧 British English for London Cafe, 🇺🇸 US Corporate for Job Interview & Customs).
- **Realistic Interactive Scenarios**:
  - 💼 *Job Interview (Senior Project Lead Role)*
  - ☕ *Ordering at a London Coffee Shop*
  - 🏨 *Hotel Check-In & Requesting an Executive Upgrade*
  - 🤝 *Workplace Collaboration & Polite Disagreement*
  - ✈️ *Airport Immigration & Customs*
- **Speech & Text Input**: Respond by typing or hands-free voice transcription.
- **Real-Time Sentence Fixes**: Inspects and corrects every message you send before continuing.

### 🗂️ 5. Vocab & Flashcards SRS Studio (Active Recall & Spaced Repetition)
- **Interactive 3D Flashcard Trainer**: Flip cards with smooth 3D perspective animations, audio pronunciation playback, IPA phonetic guides, and authentic executive example sentences.
- **SRS Recall Rating System**: Rate recall difficulty (*🔴 Need Practice*, *🟡 Familiar*, or *🟢 Mastered*) with keyboard shortcuts (`[Space]` to flip, `[←/→]` to navigate, `[1, 2, 3]` to rate) and dynamic deck mastery percentage bars.
- **Curated Multi-Track Decks**:
  - 🌟 **B2 &rarr; C1 Upgrades**: 20 high-frequency upgrades (*paramount, arduous, impediment, facilitate, exemplify, bolster, scrutinize, ephemeral, lucrative, unprecedented, etc.*).
  - 🤝 **Collocations &amp; Phrasals**: Authentic word pairings (*bear in mind, bridge the gap, shed light on, pave the way, take for granted, call into question, tip the scales, play a pivotal role*).
  - ⚠️ **ESL Trap Buster**: Eradicate non-standard phrasing (*revert back, prepone, did not knew, passed out from college, discuss about, cope up with*).
  - ⭐ **My Saved Words**: Personal deck populated from reading bookmarks or custom entries.
- **Cross-Module 1-Click Bookmarking**: Bookmark any word lookup from the Reading Lounge popover directly into your personal Flashcard study queue.
- **Custom Flashcard Creator**: Modal to create and store custom words with definitions, examples, and category tags.
- **Collocation Challenge Quiz**: 4-choice interactive quiz with immediate rationale explanations and +20 XP rewards.
- **Vocab Matrix Explorer**: Searchable matrix filterable by C1 Upgrades, Collocations, ESL Traps, and Saved Words with pronunciation and bookmark toggles.

### 🔥 6. Daily Goals, Streak Tracking & XP Engine
- **Consecutive Day Streaks**: Tracks daily learning consistency with dynamic day counters and milestone tracking.
- **Multi-Track Practice Checklist**: Seamlessly logs completions across Writing Lab, Speaking Studio, Reading Lounge, Roleplay Partner, and Vocab & Flashcards.
- **Dynamic XP Scoring**: Earn XP points for every practice session, quiz, drill, dialogue turn, and flashcard review.
- **7-Day History Week Strip**: Visual weekly history indicators for daily targets met.
- **Canvas Confetti Celebrations**: Lightweight confetti physics celebrate streak milestones and goal achievements.

---

## 🚀 Getting Started

No build tools, npm packages, or server installations are required!

### Option 1: Open Directly in Browser
Double-click `index.html` to open it in Google Chrome, Microsoft Edge, or any modern web browser.

### Option 2: Run via Local Server (Recommended for Microphone)
```bash
# Using Python
python -m http.server 3000

# Or using Node.js / NPX
npx serve .
```
Then visit `http://localhost:3000`.

---

## 📁 Project Structure

```
Language-friend/
├── index.html              # Main application layout & UI
├── README.md               # Documentation & setup guide
├── styles/
│   ├── main.css            # Global styling, tokens, dark/light theme, dashboard
│   └── modules.css         # Component styling for Writing, Speaking, Reading, Chat, Goals, Flashcards
└── scripts/
    ├── database.js         # Client-side IndexedDB persistence layer
    ├── analyzer.js         # Offline rule-based NLP grammar & ESL heuristic engine
    ├── ai-service.js       # Cloud AI connector (Gemini) + offline fallback
    ├── goals.js            # Daily goals, streak tracking, XP engine & celebrations
    ├── writing.js          # Writing Lab logic & 1-click correction tools
    ├── speaking.js         # Speech Recognition, diff comparison & audio visualizer
    ├── reading.js          # Reading Lounge, word lookup popover & quizzes
    ├── dialogue.js         # Conversational roleplay simulator
    ├── flashcards.js       # Vocab & Flashcards SRS Studio, collocations & custom decks
    └── app.js              # State manager, theme toggle, settings & stats tracking
```

---

## 📜 License
MIT License. Built for English language learners worldwide.
