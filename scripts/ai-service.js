/**
 * FLUENTLY - AI & Grammar Engine Connector
 * Multi-tiered intelligent grammar correction and NLP engine:
 * 1. Real-time Open Grammar & Spell Engine (LanguageTool REST API with 10,000+ English rules, zero keys needed)
 * 2. Deep Generative AI (Gemini 1.5 Flash if API key configured)
 * 3. Comprehensive Local NLP Rule & Vocabulary Enhancement Engine (instant offline fallback + CEFR metrics)
 */

class AIService {
  constructor() {
    this.apiKey = (localStorage.getItem('fluently_gemini_api_key') || '').trim();
    this.engine = localStorage.getItem('fluently_engine') || 'smart-local';
  }

  setApiKey(key) {
    this.apiKey = (key || '').trim();
    localStorage.setItem('fluently_gemini_api_key', this.apiKey);
  }

  setEngine(engine) {
    this.engine = engine;
    localStorage.setItem('fluently_engine', this.engine);
  }

  async fetchLanguageTool(text) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6500);

      const response = await fetch('https://api.languagetool.org/v2/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          text: text,
          language: 'en-US'
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) return null;
      const data = await response.json();
      if (!data || !Array.isArray(data.matches)) return null;

      return data.matches.map(m => {
        let categoryName = m.rule?.category?.name || 'Grammar';
        if (m.rule?.issueType === 'misspelling') categoryName = 'Spelling Mistake';
        else if (m.shortMessage && m.shortMessage.length < 30) categoryName = m.shortMessage;

        const replacements = (m.replacements || []).slice(0, 3).map(r => r.value.trim()).filter(Boolean);
        const matched = text.substring(m.offset, m.offset + m.length);
        const firstFix = replacements[0] || '';

        return {
          type: categoryName,
          severity: m.rule?.issueType === 'misspelling' ? 'warning' : 'error',
          matched: matched,
          replacement: replacements.length ? replacements.join(' / ') : 'Correction needed',
          firstFix: firstFix,
          explanation: m.message || 'Grammar or syntax error detected.',
          index: m.offset,
          length: m.length
        };
      });
    } catch (e) {
      console.warn('LanguageTool API unavailable or timed out, relying on local NLP engine:', e);
      return null;
    }
  }

  async getWritingCritique(text) {
    if (!text || !text.trim()) {
      return window.analyzer.analyze('');
    }

    const trimmed = text.trim();
    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
    const charCount = text.length;

    // 1. If Gemini API key is configured and selected
    if (this.engine === 'gemini' && this.apiKey) {
      try {
        const aiResult = await this.callGeminiWritingCritique(trimmed);
        if (aiResult && aiResult.issues) {
          // Merge local rules if AI missed any obvious rule violations
          const local = window.analyzer.analyze(trimmed);
          if (local.issues && local.issues.length > 0) {
            const existingMatches = new Set(aiResult.issues.map(i => i.matched.toLowerCase()));
            local.issues.forEach(li => {
              if (!existingMatches.has(li.matched.toLowerCase())) {
                aiResult.issues.push(li);
              }
            });
          }
          return aiResult;
        }
      } catch (e) {
        console.warn('Gemini critique failed, falling back to neural/rule hybrid:', e);
      }
    }

    // 2. Fetch from LanguageTool & Local Analyzer concurrently
    const localResult = window.analyzer.analyze(trimmed);
    const ltMatches = await this.fetchLanguageTool(trimmed);

    // Merge issues from both engines without duplicates or conflicting overlaps
    const combinedIssues = [];
    const occupiedRanges = [];

    // Prioritize LanguageTool matches
    if (ltMatches && ltMatches.length > 0) {
      ltMatches.forEach(issue => {
        combinedIssues.push(issue);
        occupiedRanges.push({ start: issue.index, end: issue.index + issue.length });
      });
    }

    // Add local analyzer issues that do not overlap
    if (localResult.issues && localResult.issues.length > 0) {
      localResult.issues.forEach(localIssue => {
        let localStart = localIssue.index;
        if (localStart === undefined || localStart < 0) {
          localStart = trimmed.indexOf(localIssue.matched);
          if (localStart < 0) localStart = trimmed.toLowerCase().indexOf(localIssue.matched.toLowerCase());
        }
        const localEnd = (localStart >= 0 ? localStart : 0) + localIssue.matched.length;

        const isOverlapping = occupiedRanges.some(r =>
          (localStart >= r.start && localStart < r.end) ||
          (localEnd > r.start && localEnd <= r.end) ||
          (localStart <= r.start && localEnd >= r.end)
        );

        if (!isOverlapping && localStart >= 0) {
          const firstFix = localIssue.replacement.split(' / ')[0].replace(/\$[0-9]/g, '').trim();
          combinedIssues.push({
            type: localIssue.type,
            severity: localIssue.severity,
            matched: localIssue.matched,
            replacement: localIssue.replacement,
            firstFix: firstFix,
            explanation: localIssue.explanation,
            index: localStart,
            length: localIssue.matched.length
          });
          occupiedRanges.push({ start: localStart, end: localEnd });
        }
      });
    }

    // Sort issues by position in the source text
    combinedIssues.sort((a, b) => (a.index || 0) - (b.index || 0));

    // Construct polished text by replacing matched faulty spans from back to front
    let polishedText = trimmed;
    const sortedForReplacement = [...combinedIssues].sort((a, b) => (b.index || 0) - (a.index || 0));
    for (const issue of sortedForReplacement) {
      if (issue.firstFix && issue.index !== undefined && issue.index >= 0) {
        polishedText =
          polishedText.substring(0, issue.index) +
          issue.firstFix +
          polishedText.substring(issue.index + issue.length);
      }
    }

    // Apply high-impact vocabulary upgrades
    if (localResult.vocabSuggestions && localResult.vocabSuggestions.length > 0) {
      for (const item of localResult.vocabSuggestions) {
        const reg = new RegExp(`\\b${item.original}\\b`, 'gi');
        polishedText = polishedText.replace(reg, item.suggested);
      }
    }

    // Capitalize beginning of sentences
    polishedText = polishedText.replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());

    // Compute dynamic scores
    const spellingIssues = combinedIssues.filter(i => 
      i.type.toLowerCase().includes('spell') || 
      i.type.toLowerCase().includes('typo') || 
      i.type.toLowerCase().includes('homophone')
    );
    const grammarOnlyIssues = combinedIssues.filter(i => 
      !i.type.toLowerCase().includes('spell') && 
      !i.type.toLowerCase().includes('typo') && 
      !i.type.toLowerCase().includes('homophone')
    );

    let grammarScore = Math.max(10, Math.min(100, 100 - (grammarOnlyIssues.length * 15)));
    let spellingScore = wordCount > 0 ? Math.max(10, Math.min(100, Math.round(((wordCount - spellingIssues.length) / wordCount) * 100))) : 100;
    let varietyScore = localResult.metrics?.variety ? parseInt(localResult.metrics.variety) : 75;
    let vocabScore = localResult.metrics?.vocab ? parseInt(localResult.metrics.vocab) : 70;

    let overallScore = Math.round((grammarScore * 0.4) + (spellingScore * 0.25) + (varietyScore * 0.18) + (vocabScore * 0.17));

    let gradeLabel = "Basic Intermediate (B1)";
    if (combinedIssues.length === 0 && overallScore >= 88) gradeLabel = "Advanced Fluency (C1/C2)";
    else if (combinedIssues.length <= 2 && overallScore >= 75) gradeLabel = "Strong Upper-Intermediate (B2)";
    else if (overallScore >= 55) gradeLabel = "Developing Intermediate (B1)";
    else gradeLabel = "Needs Revision (A2/B1)";

    return {
      wordCount,
      charCount,
      score: overallScore,
      gradeLabel,
      issues: combinedIssues,
      spellingIssues,
      vocabSuggestions: localResult.vocabSuggestions || [],
      metrics: {
        grammar: `${grammarScore}%`,
        spelling: `${spellingScore}%`,
        variety: `${varietyScore}%`,
        vocab: `${vocabScore}%`
      },
      polishedText
    };
  }

  async callGeminiWritingCritique(text) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(this.apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert English Language Coach for Intermediate (B1/B2) students.
Analyze this learner text carefully for ALL grammar, tense, spelling, agreement, word choice, and structural errors:
"${text}"

Return a JSON object with:
{
  "score": (number 1-100 based on accuracy),
  "gradeLabel": ("Advanced Fluency (C1)" | "Upper-Intermediate (B2)" | "Developing Intermediate (B1)" | "Needs Revision (A2)"),
  "issues": [
    { "type": "Grammar"|"Agreement"|"Tense"|"Spelling"|"Collocation"|"Redundancy", "severity": "error"|"warning", "matched": "the exact faulty substring", "replacement": "the corrected phrase", "explanation": "clear grammatical reason" }
  ],
  "vocabSuggestions": [
    { "original": "basic word", "suggested": "advanced C1 alternative" }
  ],
  "metrics": { "grammar": "85%", "spelling": "95%", "variety": "80%", "vocab": "75%" },
  "polishedText": "Flawlessly rewritten elegant C1 level version of the text"
}
Output ONLY valid JSON.`
          }]
        }]
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    parsed.wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    parsed.charCount = text.length;
    return parsed;
  }

  async getDialogueResponse(scenario, chatHistory = [], userMessage = '') {
    // 1. Try Generative AI if key is present
    if (this.apiKey && this.engine !== 'smart-local') {
      try {
        const historyContext = chatHistory.slice(-6).map(m => `${m.role === 'user' ? 'Learner' : scenario.botRole}: "${m.content}"`).join('\n');
        const prompt = `You are a conversational roleplay partner for an intermediate English student (B1/B2 level aiming for C1 fluency).
Scenario: "${scenario.title}" — ${scenario.desc}
Your Persona / Role: "${scenario.botRole}".
Tone: Natural, spoken English, realistic to the situation, supportive yet authentic.

Conversation History:
${historyContext}
Learner: "${userMessage}"

Respond strictly as "${scenario.botRole}". Keep your reply concise (1 to 3 spoken sentences). React directly to what the learner said, and ask an engaging, realistic follow-up question or continue the roleplay naturally. Do not break character. Do not include markdown or stage directions.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(this.apiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.75,
              maxOutputTokens: 180
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (reply) return reply;
        }
      } catch (e) {
        console.warn('Gemini Dialogue AI error, falling back to dynamic local persona:', e);
      }
    }

    // 2. Dynamic Smart-Local Persona Branching Engine (offline / infinite fallback)
    return this.generateLocalPersonaResponse(scenario, chatHistory, userMessage);
  }

  generateLocalPersonaResponse(scenario, chatHistory = [], userMessage = '') {
    const text = (userMessage || '').toLowerCase();
    const userTurnsCount = chatHistory.filter(m => m.role === 'user').length;
    const scenarioKey = scenario.key || 'job_interview';

    // Scenario 1: Job Interview
    if (scenarioKey === 'job_interview') {
      if (text.includes('salary') || text.includes('compensation') || text.includes('pay')) {
        return "We offer competitive compensation commensurate with experience, plus comprehensive benefits. How does your experience aligning cross-functional teams differentiate you from other candidates?";
      }
      if (text.includes('conflict') || text.includes('disagree') || text.includes('argument') || text.includes('feedback')) {
        return "Constructive dissent is crucial for innovation. Could you give an example of a decision you made where you had to balance engineering quality against speed to market?";
      }
      if (text.includes('fail') || text.includes('mistake') || text.includes('learned') || text.includes('obstacle')) {
        return "That kind of accountability is exactly what we value. If you were to step into this role tomorrow, what would be your top priority during your first thirty days?";
      }
      if (text.includes('question') || text.endsWith('?') || text.includes('culture') || text.includes('roadmap')) {
        return "Our culture values high agency, psychological safety, and continuous learning. How do you usually mentor more junior teammates when introducing new workflows?";
      }
      if (userTurnsCount >= 4) {
        const advancedFollowups = [
          "That's a compelling point. Looking ahead three years, what technical or leadership milestones are you aiming to achieve?",
          "I really appreciate the depth of your answers today. Do you have any specific questions for me regarding our leadership philosophy or team structure?",
          "Thank you for sharing your journey. To wrap things up, how do you sustain your motivation and keep learning amidst demanding project timelines?"
        ];
        return advancedFollowups[(userTurnsCount - 4) % advancedFollowups.length];
      }
    }

    // Scenario 2: London Coffee Shop
    if (scenarioKey === 'coffee_shop') {
      if (text.includes('oat') || text.includes('almond') || text.includes('skim') || text.includes('whole') || text.includes('milk')) {
        return "Spot on! That'll be lovely. Would you like an artisan croissant, cinnamon roll, or one of our fresh sourdough toasties to pair with it?";
      }
      if (text.includes('takeaway') || text.includes('here') || text.includes('sit') || text.includes('to go') || text.includes('stay')) {
        return "Brilliant! London weather is surprisingly sunny today, isn't it? Have you got any exciting plans or places you're heading to after this?";
      }
      if (text.includes('croissant') || text.includes('pastry') || text.includes('cake') || text.includes('food') || text.includes('nothing') || text.includes('no thanks')) {
        return "No problem at all! Coming right up. Have you visited Covent Garden market nearby, or are you just exploring the neighborhood?";
      }
      if (userTurnsCount >= 4) {
        const cafeFollowups = [
          "Here is your piping hot drink! Can I get you a napkin or a stamp on your loyalty card today?",
          "There you go, crafted to perfection! Let me know if you need the Wi-Fi password or anything else while you're here.",
          "Smells fantastic, doesn't it? Have a wonderful day enjoying the vibrant London atmosphere!"
        ];
        return cafeFollowups[(userTurnsCount - 4) % cafeFollowups.length];
      }
    }

    // Scenario 3: Hotel Check-in
    if (scenarioKey === 'hotel_checkin') {
      if (text.includes('upgrade') || text.includes('view') || text.includes('high floor') || text.includes('quiet') || text.includes('corner')) {
        return "Let me check our availability for you right now... Wonderful news! I can offer you a corner executive suite on the 21st floor with panoramic skyline views. Shall I lock that in for you?";
      }
      if (text.includes('breakfast') || text.includes('dinner') || text.includes('gym') || text.includes('pool') || text.includes('amenities')) {
        return "Breakfast is served at The Heritage Brasserie from 6:30 AM to 10:30 AM, and our infinity pool and wellness center are open 24/7 on the top deck. Would you like assistance with your luggage to the suite?";
      }
      if (userTurnsCount >= 4) {
        const hotelFollowups = [
          "Here are your room keys and Wi-Fi access code. Is there any restaurant reservation or city tour we can arrange on your behalf today?",
          "All settled! Please don't hesitate to dial '0' from your room phone if you need anything at all during your stay. Enjoy Singapore!",
          "Thank you for choosing Grand Heritage! Have an exceptionally comfortable stay with us."
        ];
        return hotelFollowups[(userTurnsCount - 4) % hotelFollowups.length];
      }
    }

    // Scenario 4: Office Debate & Compromise
    if (scenarioKey === 'office_debate') {
      if (text.includes('deadline') || text.includes('time') || text.includes('rush') || text.includes('compress') || text.includes('delay')) {
        return "That's a very valid concern. If we maintain the quality bar, which specific features do you think are non-negotiable for phase one versus phase two?";
      }
      if (text.includes('test') || text.includes('qa') || text.includes('bug') || text.includes('quality') || text.includes('risk')) {
        return "I completely agree that sacrificing QA would backfire. What if we do a gradual staged rollout starting with 5% of users next week?";
      }
      if (userTurnsCount >= 4) {
        const debateFollowups = [
          "That makes absolute sense. Let's draft a clear proposal for leadership highlighting this balanced approach. Would you like to present it together?",
          "I really value your pragmatic perspective on this. Let's align with the engineering leads at tomorrow's standup.",
          "Fantastic compromise. I'm glad we talked through this openly to find a win-win strategy!"
        ];
        return debateFollowups[(userTurnsCount - 4) % debateFollowups.length];
      }
    }

    // Scenario 5: Airport Customs & Immigration
    if (scenarioKey === 'airport') {
      if (text.includes('vacation') || text.includes('holiday') || text.includes('business') || text.includes('conference') || text.includes('visit') || text.includes('tourist')) {
        return "Understood. How long do you intend to stay in the country, and what is the address or name of your accommodations?";
      }
      if (text.includes('hotel') || text.includes('days') || text.includes('weeks') || text.includes('staying') || text.includes('airbnb')) {
        return "Thank you. Do you have a return ticket booked, and do you have any commercial samples or agricultural products in your baggage?";
      }
      if (userTurnsCount >= 4) {
        const airportFollowups = [
          "Everything checks out in our system. Here is your passport with the entry stamp. Enjoy your visit and safe travels!",
          "All clear. Please proceed to baggage carousel 4 to collect your luggage. Welcome!",
          "Your entry is processed. Have a pleasant and safe journey!"
        ];
        return airportFollowups[(userTurnsCount - 4) % airportFollowups.length];
      }
    }

    // Standard fallback response based on script sequence
    if (scenario.responses && this.stepIndex !== undefined && scenario.responses[this.stepIndex]) {
      const resp = scenario.responses[this.stepIndex];
      return resp;
    }

    return "That's a very clear and well-articulated response. How would you elaborate on this further from your perspective?";
  }

  async getDialogueSuggestions(scenario, chatHistory = [], lastBotMessage = '') {
    // If Gemini key is available, generate dynamic C1 suggestions
    if (this.apiKey && this.engine !== 'smart-local') {
      try {
        const prompt = `You are a C1 English Fluency Coach.
Scenario: "${scenario.title}"
Current bot question/statement: "${lastBotMessage}"

Provide 3 distinct, high-impact C1/Advanced response starter phrases that an intermediate learner could say back in this context.
Focus on sophisticated vocabulary, diplomatic phrasing, idiomatic naturalness, and clear sentence structure.

Return ONLY a JSON array with exactly 3 strings. Example:
["I would argue that...", "From my perspective, the primary bottleneck is...", "Could you elaborate on how..."]`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(this.apiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7 }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          const match = cleanJson.match(/\[[\s\S]*\]/);
          if (match) {
            const arr = JSON.parse(match[0]);
            if (Array.isArray(arr) && arr.length >= 2) return arr.slice(0, 3);
          }
        }
      } catch (e) {
        console.warn('AI suggestions error, falling back to local C1 bank:', e);
      }
    }

    // Local Curated C1 Suggestions Matrix
    return this.getLocalSuggestionsMatrix(scenario, lastBotMessage);
  }

  getLocalSuggestionsMatrix(scenario, lastBotMessage = '') {
    const key = scenario.key || 'job_interview';
    const text = (lastBotMessage || '').toLowerCase();

    const bank = {
      job_interview: [
        [
          "In my previous role, I spearheaded several cross-functional projects that significantly accelerated delivery.",
          "I specialize in architecting scalable solutions while fostering close collaboration across engineering and product teams.",
          "What attracted me most to this position is your team's commitment to high engineering standards and user-centric design."
        ],
        [
          "When navigating tight deadlines, I prioritize high-impact deliverables and maintain transparent communication with stakeholders.",
          "I actively encourage constructive feedback to ensure we address potential roadblocks before they escalate.",
          "My greatest strength lies in synthesizing complex technical requirements into actionable, milestone-driven plans."
        ],
        [
          "Could you elaborate on the team's current technical roadmap and the biggest engineering challenges anticipated this year?",
          "How does the organization support continuous professional development and knowledge sharing among senior engineers?",
          "I would welcome the opportunity to dive deeper into how cross-functional alignment is measured within this department."
        ]
      ],
      coffee_shop: [
        [
          "Good morning! I would love an oat milk flat white, extra hot, along with an almond croissant, please.",
          "Could I please get a large iced Americano with a splash of oat milk for takeaway?",
          "I'm keen to try your single-origin pour-over. Which roast would you recommend today?"
        ],
        [
          "I'll be taking this to go, as I'm heading over to Covent Garden for a gallery exhibition.",
          "I'm planning to sit by the window for an hour to catch up on some reading and enjoy the lively atmosphere.",
          "The weather is surprisingly crisp today! Could I also grab a glass of tap water alongside the coffee?"
        ],
        [
          "That smells wonderful! Could I also get a stamp on my loyalty card, please?",
          "Thank you so much! By the way, could you share the Wi-Fi credentials with me?",
          "I genuinely appreciate the recommendation. Have a delightful rest of your day!"
        ]
      ],
      hotel_checkin: [
        [
          "Good afternoon. I have a reservation under my name for a deluxe suite for three nights.",
          "Here is my passport and reservation confirmation number. We are thrilled to be visiting Singapore.",
          "Good day! I was wondering if there might be any complimentary upgrades available for higher floor suites?"
        ],
        [
          "If possible, we would greatly appreciate a quiet corner room on an upper floor overlooking the city skyline.",
          "Could you please confirm whether breakfast is included in our package, and what hours the lounge operates?",
          "Would you mind arranging for a wake-up call at 7:00 AM tomorrow, and could we request two extra feather pillows?"
        ],
        [
          "Thank you for the seamless check-in. Could you recommend a local restaurant within walking distance for authentic cuisine?",
          "That sounds perfect! Is the rooftop infinity pool accessible throughout the evening?",
          "We truly appreciate your hospitality and exceptional service. Thank you for accommodating our room preference."
        ]
      ],
      office_debate: [
        [
          "I see where you're coming from, but I have some reservations regarding the compressed QA timeline.",
          "While accelerating the launch is appealing, compromising on automated testing could jeopardize our user retention.",
          "What if we adopt a phased rollout strategy to mitigate risk while still hitting our primary market milestones?"
        ],
        [
          "From my perspective, focusing on the core feature set first allows us to gather early user feedback without overwhelming the team.",
          "Let's establish explicit success metrics so both engineering and product goals remain fully aligned.",
          "I would propose scheduling a quick cross-functional sync tomorrow to walk through the edge cases before committing."
        ],
        [
          "That seems like a pragmatic compromise that protects our code quality while meeting leadership expectations.",
          "I'm happy to draft the summary memo and circulate it with the team for final alignment.",
          "I appreciate you taking the time to talk through these trade-offs openly and finding a constructive solution."
        ]
      ],
      airport: [
        [
          "Good afternoon, Officer. Here are my passport, visa documentation, and return flight itinerary.",
          "I am visiting for a two-week technology conference in the city, followed by three days of personal sightseeing.",
          "I will be staying at the central downtown hotel for the duration of my ten-day business trip."
        ],
        [
          "I am traveling alone and have only standard personal luggage with no commercial or restricted goods to declare.",
          "I have booked a return flight scheduled for the 24th, and all my accommodation bookings are confirmed in advance.",
          "I have sufficient funds and medical insurance coverage for the entire duration of my stay."
        ],
        [
          "Thank you, Officer. Could you point me in the direction of the airport express train station?",
          "Thank you very much. I appreciate your assistance. Have a good evening!",
          "All clear. Thank you for your courtesy and have a great rest of your shift!"
        ]
      ]
    };

    const scenarioBanks = bank[key] || bank.job_interview;
    // Pick set based on question context or random set
    const randomIndex = Math.floor(Math.random() * scenarioBanks.length);
    return scenarioBanks[randomIndex];
  }
}

window.aiService = new AIService();

