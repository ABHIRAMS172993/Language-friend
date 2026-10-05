/**
 * FLUENTLY - NLP & Intermediate Grammar Analyzer
 * Comprehensive rule-based parser for intermediate English learners.
 * Handles subject-verb agreement, common ESL/Indian English errors, redundant phrases,
 * weak vocabulary, and generates enhanced C1 suggestions.
 */

class EnglishAnalyzer {
  constructor() {
    this.irregularPast = {
      knew: 'know', went: 'go', saw: 'see', came: 'come', took: 'take',
      made: 'make', told: 'tell', bought: 'buy', brought: 'bring',
      spoke: 'speak', wrote: 'write', ate: 'eat', gave: 'give',
      found: 'find', heard: 'hear', felt: 'feel', thought: 'think',
      ran: 'run', met: 'meet', began: 'begin', became: 'become',
      chose: 'choose', drank: 'drink', fell: 'fall', forgot: 'forget',
      got: 'get', lost: 'lose', paid: 'pay', sent: 'send', slept: 'sleep',
      spent: 'spend', stood: 'stand', swam: 'swim', taught: 'teach',
      threw: 'throw', understood: 'understand', wore: 'wear', won: 'win'
    };

    this.grammarRules = [
      // 0. High-Frequency Spacing, Pronouns & Typos
      {
        pattern: /\bIam\b/g,
        type: 'Spacing & Contraction',
        severity: 'error',
        replacement: "I am / I'm",
        explanation: "'Iam' is missing a space. Write 'I am' or use the contraction \"I'm\"."
      },
      {
        pattern: /\bIm\b/g,
        type: 'Punctuation & Contraction',
        severity: 'error',
        replacement: "I'm / I am",
        explanation: "Missing apostrophe in contraction. Write \"I'm\" or 'I am'."
      },
      {
        pattern: /(^|[\s,;:(])i([\s,;:.!?')])/g,
        type: 'Capitalization',
        severity: 'error',
        replacement: "$1I$2",
        explanation: "The first-person pronoun 'I' must always be capitalized."
      },
      {
        pattern: /\balot\b/gi,
        type: 'Spelling & Spacing',
        severity: 'error',
        replacement: 'a lot',
        explanation: "'A lot' is always written as two separate words."
      },
      {
        pattern: /\binfront\s+of\b/gi,
        type: 'Spelling & Spacing',
        severity: 'error',
        replacement: 'in front of',
        explanation: "'In front' is written as two separate words."
      },
      {
        pattern: /\baswell\b/gi,
        type: 'Spelling & Spacing',
        severity: 'error',
        replacement: 'as well',
        explanation: "'As well' is written as two separate words."
      },
      {
        pattern: /\bnoone\b/gi,
        type: 'Spelling & Spacing',
        severity: 'error',
        replacement: 'no one',
        explanation: "'No one' is written as two separate words."
      },
      {
        pattern: /\beachother\b/gi,
        type: 'Spelling & Spacing',
        severity: 'error',
        replacement: 'each other',
        explanation: "'Each other' is written as two separate words."
      },
      {
        pattern: /\batleast\b/gi,
        type: 'Spelling & Spacing',
        severity: 'error',
        replacement: 'at least',
        explanation: "'At least' is written as two separate words."
      },
      {
        pattern: /\bincase\b/gi,
        type: 'Spelling & Spacing',
        severity: 'error',
        replacement: 'in case',
        explanation: "'In case' is written as two separate words."
      },
      {
        pattern: /\bthankyou\b/gi,
        type: 'Spelling & Spacing',
        severity: 'warning',
        replacement: 'thank you',
        explanation: "As a verb phrase, use 'thank you' (two words). 'Thank-you' is only a noun/adjective."
      },

      // 1. Movement Verbs with 'Home' & Preposition Errors
      {
        pattern: /\b(go|going|went|gone|goes|come|coming|came|reach|reached|reaching|reaches|arrive|arrived|arriving|walk|walking|walked|run|running|ran|drive|driving|drove|head|heading|headed|return|returning|returned)\s+to\s+home\b/gi,
        type: 'Preposition Error',
        severity: 'error',
        replacement: '$1 home',
        explanation: "'Home' functions as an adverb of direction with movement verbs. Do not use 'to' before 'home' (say '$1 home')."
      },
      {
        pattern: /\b(reach|reaching|reached|reaches)\s+to\s+(the\s+|a\s+|an\s+)?([a-zA-Z]+)\b/gi,
        type: 'Transitive Verb Error',
        severity: 'error',
        replacement: '$1 $2$3',
        explanation: "'Reach' is a transitive verb that directly takes the destination without 'to' (e.g. '$1 $2$3')."
      },

      // 2. Missing Articles with Transport Stations & Public Places
      {
        pattern: /\b(reach|reached|reaches|reaching|go\s+to|going\s+to|went\s+to|at|leave|leaving|left|arrive\s+at|arriving\s+at|arrived\s+at)\s+(railway\s+station|bus\s+stand|bus\s+station|airport|train\s+station|metro\s+station|office|gym|hospital|bank)\b/gi,
        type: 'Missing Article',
        severity: 'error',
        replacement: '$1 the $2',
        explanation: "Singular countable places like '$2' require a definite article ('the $2') or indefinite article in this context."
      },

      // 3. Common ESL / Regional Idioms & Redundancies
      {
        pattern: /\brevert\s+back\b/gi,
        type: 'Redundancy',
        severity: 'warning',
        replacement: 'reply / respond',
        explanation: "'Revert' already means to return or reply. Using 'back' is redundant."
      },
      {
        pattern: /\bprepone\b/gi,
        type: 'ESL Collocation',
        severity: 'warning',
        replacement: 'reschedule earlier / bring forward',
        explanation: "'Prepone' is informal regional English. In standard international English, use 'reschedule earlier' or 'bring forward'."
      },
      {
        pattern: /\bpassed\s+out\s+from\s+(college|university|school|institute)\b/gi,
        type: 'Idiom Mistake',
        severity: 'error',
        replacement: 'graduated from $1',
        explanation: "'Passed out' means fainted or lost consciousness. For educational institutions, use 'graduated from'."
      },
      {
        pattern: /\bdiscuss\s+about\b/gi,
        type: 'Preposition Error',
        severity: 'error',
        replacement: 'discuss',
        explanation: "'Discuss' is a transitive verb that takes a direct object (e.g. 'discuss the proposal', not 'discuss about')."
      },
      {
        pattern: /\border\s+for\s+(a\s+|an\s+|the\s+)?(coffee|pizza|food|drinks|lunch|dinner|items|meal)\b/gi,
        type: 'Preposition Error',
        severity: 'error',
        replacement: 'order $1$2',
        explanation: "When ordering goods/food, use 'order [item]', not 'order for [item]'."
      },
      {
        pattern: /\bcope\s+up\s+with\b/gi,
        type: 'Phrasal Verb Error',
        severity: 'error',
        replacement: 'cope with',
        explanation: "The correct standard English phrase is 'cope with', never 'cope up with'."
      },
      {
        pattern: /\bmyself\s+([A-Za-z]+)\b/gi,
        type: 'Introduction Error',
        severity: 'error',
        replacement: "I am $1 / My name is $1",
        explanation: "Never introduce yourself using reflexive 'Myself [Name]'. Use 'I am...' or 'My name is...'."
      },
      {
        pattern: /\bout\s+of\s+station\b/gi,
        type: 'Collocation Error',
        severity: 'warning',
        replacement: 'out of town / away',
        explanation: "'Out of station' is archaic. Modern international English uses 'out of town' or 'away on travel'."
      },
      {
        pattern: /\bdo\s+one\s+thing\b/gi,
        type: 'Colloquialism',
        severity: 'warning',
        replacement: "here's an idea / consider this",
        explanation: "'Do one thing' is a direct translation. Prefer 'Consider this' or 'Here is a suggestion'."
      },
      {
        pattern: /\btell\s+to\s+(me|us|him|her|them)\b/gi,
        type: 'Preposition Error',
        severity: 'error',
        replacement: 'tell $1',
        explanation: "'Tell' takes a direct personal object without 'to' (e.g. 'tell $1', not 'tell to $1')."
      },
      {
        pattern: /\b(said|say|says)\s+(me|us|him|her|them)\b/gi,
        type: 'Say vs Tell Error',
        severity: 'error',
        replacement: 'told $2 / said to $2',
        explanation: "'Say' requires the preposition 'to' before a person (say to $2), or use 'tell/told $2'."
      },
      {
        pattern: /\bexplain\s+me\b/gi,
        type: 'Preposition Error',
        severity: 'error',
        replacement: 'explain to me',
        explanation: "In standard English, use 'explain to me' or 'explain this to me', not 'explain me'."
      },
      {
        pattern: /\bsuggest\s+me\b/gi,
        type: 'Preposition Error',
        severity: 'error',
        replacement: 'suggest to me / recommend to me',
        explanation: "Use 'suggest to me' or 'recommend to me', not 'suggest me'."
      },
      {
        pattern: /\b(give|giving|gave|given)\s+(an?\s+)?exam\b/gi,
        type: 'Collocation Error',
        severity: 'error',
        replacement: 'take / taking an exam',
        explanation: "Students 'take' or 'sit for' an exam; examiners and teachers 'give' the exam."
      },
      {
        pattern: /\b(take|taking|took)\s+(tea|coffee)\b/gi,
        type: 'Collocation Error',
        severity: 'warning',
        replacement: 'have / drink $2',
        explanation: "In standard English, we usually 'have $2' or 'drink $2' rather than 'take $2'."
      },
      {
        pattern: /\baccording\s+to\s+me\b/gi,
        type: 'Collocation Error',
        severity: 'warning',
        replacement: 'in my opinion / from my perspective',
        explanation: "'According to' is used for third parties or sources. For your own view, use 'in my opinion' or 'from my perspective'."
      },
      {
        pattern: /\btoday\s+morning\b/gi,
        type: 'Time Expression',
        severity: 'error',
        replacement: 'this morning',
        explanation: "Use 'this morning', not 'today morning'."
      },
      {
        pattern: /\b(he|she|they|I|we|who)\s+told\s+that\b/gi,
        type: 'Say vs Tell Error',
        severity: 'error',
        replacement: '$1 said that',
        explanation: "'Tell' must have a recipient/object (e.g. '$1 told me that' or '$1 said that')."
      },
      {
        pattern: /\bhave\s+(?:a\s+)?doubt\b/gi,
        type: 'Collocation Choice',
        severity: 'warning',
        replacement: 'have a question / have a query',
        explanation: "'Doubt' implies mistrust or skepticism in international English. When asking for clarification, use 'have a question' or 'have a query'."
      },
      {
        pattern: /\bsince\s+(\d+|several|a\s+few|many)\s+(years|months|days|weeks|hours|minutes)\b/gi,
        type: 'Preposition of Duration',
        severity: 'error',
        replacement: 'for $1 $2',
        explanation: "Use 'for' with periods/durations of time ('for $1 $2'), and 'since' only for specific starting points in time (e.g. 'since 2020')."
      },
      {
        pattern: /\byesterday\s+night\b/gi,
        type: 'Time Expression',
        severity: 'error',
        replacement: 'last night',
        explanation: "Use 'last night', not 'yesterday night'."
      },
      {
        pattern: /\btoday\s+night\b/gi,
        type: 'Time Expression',
        severity: 'error',
        replacement: 'tonight',
        explanation: "Use 'tonight', not 'today night'."
      },
      {
        pattern: /\bon\s+(yesterday|today|tomorrow)\b/gi,
        type: 'Preposition Error',
        severity: 'error',
        replacement: '$1',
        explanation: "Do not use the preposition 'on' before 'yesterday', 'today', or 'tomorrow'."
      },
      {
        pattern: /\bin\s+the\s+night\b/gi,
        type: 'Preposition Error',
        severity: 'warning',
        replacement: 'at night',
        explanation: "Standard English uses 'at night' (or 'during the night' for specific occurrences)."
      },
      {
        pattern: /\bpay\s+attention\s+on\b/gi,
        type: 'Preposition Error',
        severity: 'error',
        replacement: 'pay attention to',
        explanation: "The correct idiom is 'pay attention to', not 'pay attention on'."
      },
      {
        pattern: /\bcongratulate\s+(?:him|her|them|someone|you)\s+for\b/gi,
        type: 'Preposition Error',
        severity: 'error',
        replacement: 'congratulate on',
        explanation: "You congratulate someone 'on' an achievement or event, not 'for'."
      },
      {
        pattern: /\bmarried\s+with\b/gi,
        type: 'Preposition Error',
        severity: 'error',
        replacement: 'married to',
        explanation: "In standard English, one is 'married to' someone, not 'married with'."
      },
      {
        pattern: /\blook(?:ing)?\s+forward\s+to\s+(meet|hear|see|receive|work|visit)\b/gi,
        type: 'Gerund Form Error',
        severity: 'error',
        replacement: 'look forward to $1ing',
        explanation: "'Look forward to' is followed by a gerund (-ing form), e.g., 'look forward to $1ing'."
      },
      {
        pattern: /\bcomprise\s+of\b/gi,
        type: 'Preposition Redundancy',
        severity: 'error',
        replacement: 'comprise / consist of',
        explanation: "'Comprise' does not take 'of'. Use 'comprise' alone or 'consist of'."
      },
      {
        pattern: /\bdespite\s+of\b/gi,
        type: 'Preposition Redundancy',
        severity: 'error',
        replacement: 'despite / in spite of',
        explanation: "'Despite' never takes 'of'. Use 'despite' or 'in spite of'."
      },

      // 4. Uncountable Noun Traps
      {
        pattern: /\b(an\s+)?advices\b/gi,
        type: 'Uncountable Noun',
        severity: 'error',
        replacement: 'advice / pieces of advice',
        explanation: "'Advice' is uncountable in English. Use 'advice' or 'some pieces of advice'."
      },
      {
        pattern: /\bfeedbacks\b/gi,
        type: 'Uncountable Noun',
        severity: 'error',
        replacement: 'feedback',
        explanation: "'Feedback' is uncountable. Use 'feedback' or 'pieces of feedback'."
      },
      {
        pattern: /\binformations\b/gi,
        type: 'Uncountable Noun',
        severity: 'error',
        replacement: 'information',
        explanation: "'Information' is uncountable. Use 'information' or 'pieces of information'."
      },
      {
        pattern: /\bfurnitures\b/gi,
        type: 'Uncountable Noun',
        severity: 'error',
        replacement: 'furniture',
        explanation: "'Furniture' is uncountable. Use 'furniture' or 'items of furniture'."
      },
      {
        pattern: /\bluggages\b/gi,
        type: 'Uncountable Noun',
        severity: 'error',
        replacement: 'luggage',
        explanation: "'Luggage' is uncountable. Use 'luggage' or 'bags'."
      },
      {
        pattern: /\bequipments\b/gi,
        type: 'Uncountable Noun',
        severity: 'error',
        replacement: 'equipment',
        explanation: "'Equipment' is uncountable. Use 'equipment' or 'pieces of equipment'."
      },
      {
        pattern: /\bhomeworks\b/gi,
        type: 'Uncountable Noun',
        severity: 'error',
        replacement: 'homework',
        explanation: "'Homework' is uncountable. Use 'homework' or 'assignments'."
      },

      // 5. Stative Verbs in Continuous Form Trap
      {
        pattern: /\b(am|is|are|was|were)\s+having\s+(a\s+|an\s+)?(car|bike|laptop|phone|house|dog|cat|sister|brother|doubt|question|meeting)\b/gi,
        type: 'Stative Verb Error',
        severity: 'warning',
        replacement: 'have $2$3',
        explanation: "When expressing possession or relationship, 'have' is stative and not used in continuous '-ing' form (e.g. 'have $2$3')."
      },

      // 6. Double Comparative & Modal Errors
      {
        pattern: /\bcould\s+able\s+to\b/gi,
        type: 'Modal Redundancy',
        severity: 'error',
        replacement: 'was able to / could',
        explanation: "'Could' and 'able to' mean the same ability. Use either 'could' or 'was able to'."
      },
      {
        pattern: /\bcan\s+be\s+able\s+to\b/gi,
        type: 'Modal Redundancy',
        severity: 'error',
        replacement: 'can / will be able to',
        explanation: "Use either 'can' or 'will be able to'."
      },
      {
        pattern: /\bmore\s+better\b/gi,
        type: 'Double Comparative',
        severity: 'error',
        replacement: 'better',
        explanation: "'Better' is already comparative. Do not combine 'more' with 'better'."
      },
      {
        pattern: /\bmore\s+easier\b/gi,
        type: 'Double Comparative',
        severity: 'error',
        replacement: 'easier',
        explanation: "Use 'easier', not 'more easier'."
      },
      {
        pattern: /\bmore\s+faster\b/gi,
        type: 'Double Comparative',
        severity: 'error',
        replacement: 'faster',
        explanation: "Use 'faster', not 'more faster'."
      },

      // 7. Subject-Verb Agreement Common Traps
      {
        pattern: /\beveryone\s+are\b/gi,
        type: 'Subject-Verb Agreement',
        severity: 'error',
        replacement: 'everyone is',
        explanation: "'Everyone', 'everybody', and 'each' are grammatically singular and require singular verbs ('is/has/does')."
      },
      {
        pattern: /\beverybody\s+are\b/gi,
        type: 'Subject-Verb Agreement',
        severity: 'error',
        replacement: 'everybody is',
        explanation: "'Everybody' is grammatically singular. Use 'everybody is'."
      },
      {
        pattern: /\beverybody\s+have\b/gi,
        type: 'Subject-Verb Agreement',
        severity: 'error',
        replacement: 'everybody has',
        explanation: "'Everybody' is grammatically singular. Use 'everybody has'."
      },
      {
        pattern: /\beach\s+of\s+them\s+are\b/gi,
        type: 'Subject-Verb Agreement',
        severity: 'error',
        replacement: 'each of them is',
        explanation: "'Each' is the singular subject. Use 'is' instead of 'are'."
      },
      {
        pattern: /\bone\s+of\s+the\s+([a-z]+s)\s+are\b/gi,
        type: 'Subject-Verb Agreement',
        severity: 'error',
        replacement: 'one of the $1 is',
        explanation: "'One' is the singular subject. Use 'is' instead of 'are'."
      },
      {
        pattern: /\bhe\s+do\s+not\b/gi,
        type: 'Subject-Verb Agreement',
        severity: 'error',
        replacement: 'he does not',
        explanation: "Third-person singular 'he/she/it' requires 'does not'."
      },
      {
        pattern: /\bshe\s+do\s+not\b/gi,
        type: 'Subject-Verb Agreement',
        severity: 'error',
        replacement: 'she does not',
        explanation: "Third-person singular 'he/she/it' requires 'does not'."
      },
      {
        pattern: /\bit\s+dont\b/gi,
        type: 'Subject-Verb Agreement',
        severity: 'error',
        replacement: "it doesn't",
        explanation: "Third person 'it' takes 'doesn't', not 'don't'."
      },
      {
        pattern: /\bit\s+save\s+time\b/gi,
        type: 'Subject-Verb Agreement',
        severity: 'error',
        replacement: 'it saves time',
        explanation: "Third-person singular 'it' requires singular verb 'saves'."
      },

      // 8. Word Confusion (Homophones / Intermediate)
      {
        pattern: /\btheir\s+is\b/gi,
        type: 'Confused Words',
        severity: 'error',
        replacement: 'there is',
        explanation: "'Their' denotes possession. Use 'there is' to indicate existence or location."
      },
      {
        pattern: /\byour\s+welcome\b/gi,
        type: 'Confused Words',
        severity: 'error',
        replacement: "you're welcome",
        explanation: "Use the contraction \"you're\" (you are), not the possessive 'your'."
      },
      {
        pattern: /\bits\s+a\s+(good|great|bad|problem|challenge|pleasure|fact)\b/gi,
        type: 'Apostrophe Trap',
        severity: 'error',
        replacement: "it's a $1",
        explanation: "Use \"it's\" (contraction of 'it is') instead of possessive 'its'."
      },
      {
        pattern: /\bloose\s+weight\b/gi,
        type: 'Confused Words',
        severity: 'error',
        replacement: 'lose weight',
        explanation: "'Loose' means not tight. 'Lose' means to shed or misplace."
      },
      {
        pattern: /\beffect\s+our\b/gi,
        type: 'Affect vs Effect',
        severity: 'warning',
        replacement: 'affect our',
        explanation: "'Affect' is typically the verb (to influence); 'Effect' is usually the noun (the outcome)."
      }
    ];

    // B2 to C1 Vocabulary Replacement Dictionary
    this.vocabUpgrades = {
      "very good": ["exceptional", "outstanding", "exemplary"],
      "very bad": ["detrimental", "dreadful", "subpar"],
      "very big": ["substantial", "immense", "colossal"],
      "very small": ["minuscule", "negligible", "compact"],
      "very happy": ["thrilled", "elated", "delighted"],
      "very sad": ["devastated", "disheartened"],
      "very important": ["paramount", "pivotal", "crucial"],
      "a lot of": ["a multitude of", "an abundance of", "numerous"],
      "think": ["reckon", "surmise", "maintain the view that"],
      "problem": ["hurdle", "impediment", "predicament"],
      "hard": ["arduous", "demanding", "formidable"],
      "help": ["assist", "facilitate", "support"],
      "show": ["illustrate", "demonstrate", "exemplify"],
      "change": ["transform", "modify", "adapt"],
      "explain": ["clarify", "elucidate", "articulate"]
    };
  }

  getBaseVerb(verb) {
    const lower = verb.toLowerCase();
    if (this.irregularPast[lower]) {
      return this.irregularPast[lower];
    }
    if (lower.endsWith('ed')) {
      if (lower.endsWith('ied')) return lower.slice(0, -3) + 'y';
      if (lower.endsWith('eed')) return lower;
      return lower.slice(0, -2);
    }
    return verb;
  }

  /**
   * Main analysis method
   */
  analyze(text) {
    if (!text || text.trim().length === 0) {
      return {
        wordCount: 0,
        charCount: 0,
        score: 0,
        gradeLabel: "No text entered",
        issues: [],
        vocabSuggestions: [],
        metrics: { grammar: '0%', variety: '0%', vocab: '0%' },
        polishedText: ""
      };
    }

    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const charCount = text.length;

    const issues = [];
    let polishedText = text;

    // Run Static Grammar Rules
    this.grammarRules.forEach(rule => {
      let match;
      const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
      while ((match = regex.exec(text)) !== null) {
        let replacement = rule.replacement;
        if (match[1] && replacement.includes('$1')) {
          replacement = replacement.split('$1').join(match[1]);
        }
        if (match[2] && replacement.includes('$2')) {
          replacement = replacement.split('$2').join(match[2]);
        }
        issues.push({
          type: rule.type,
          severity: rule.severity,
          matched: match[0],
          replacement: replacement,
          explanation: rule.explanation,
          index: match.index
        });
      }
    });

    // Run Dynamic Double Past Tense Rule (did + past tense verb)
    const doublePastRegex = /\b(did\s+not|didn't|did)\s+([a-zA-Z]+)\b/gi;
    let dpMatch;
    while ((dpMatch = doublePastRegex.exec(text)) !== null) {
      const aux = dpMatch[1];
      const verb = dpMatch[2].toLowerCase();
      // Check if verb is irregular past or regular -ed
      if (this.irregularPast[verb] || (verb.endsWith('ed') && verb.length > 3 && !['red', 'bed', 'led', 'fed'].includes(verb))) {
        const base = this.getBaseVerb(verb);
        const correctPhrase = `${aux} ${base}`;
        issues.push({
          type: 'Tense Consistency',
          severity: 'error',
          matched: dpMatch[0],
          replacement: correctPhrase,
          explanation: `After '${aux}', always use the base/infinitive verb form ('${base}'), not past tense '${verb}'.`,
          index: dpMatch.index
        });
      }
    }

    // Check Vocabulary Upgrades
    const vocabSuggestions = [];
    const lowerText = text.toLowerCase();
    for (const [basic, advancedList] of Object.entries(this.vocabUpgrades)) {
      if (lowerText.includes(basic.toLowerCase())) {
        vocabSuggestions.push({
          original: basic,
          suggested: advancedList[0],
          allSuggestions: advancedList
        });
      }
    }

    // Passive voice detection count
    const passiveCount = (text.match(/\b(is|are|was|were|been|being)\s+([a-z]+ed|[a-z]+en)\b/gi) || []).length;

    // Sentence variety & length score
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.length ? (wordCount / sentences.length) : 0;
    
    // Calculate scoring
    let grammarScore = Math.max(20, 100 - (issues.length * 14));
    let varietyScore = avgSentenceLength >= 8 && avgSentenceLength <= 24 ? 90 : 70;
    if (passiveCount > 3) varietyScore -= 10;
    let vocabScore = Math.min(100, 65 + (vocabSuggestions.length * 6) + (wordCount > 50 ? 15 : 5));

    const overallScore = Math.round((grammarScore * 0.5) + (varietyScore * 0.25) + (vocabScore * 0.25));

    let gradeLabel = "Basic Intermediate (B1)";
    if (overallScore >= 90) gradeLabel = "Advanced Fluency (C1/C2)";
    else if (overallScore >= 75) gradeLabel = "Strong Upper-Intermediate (B2)";
    else if (overallScore >= 60) gradeLabel = "Developing Intermediate (B1+)";

    // Apply known rule fixes to polished version
    issues.forEach(issue => {
      const fix = issue.replacement.split(' / ')[0];
      const reg = new RegExp(issue.matched.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      polishedText = polishedText.replace(reg, fix);
    });

    // Apply high level vocab replacements smoothly
    for (const item of vocabSuggestions) {
      const reg = new RegExp(`\\b${item.original}\\b`, 'gi');
      polishedText = polishedText.replace(reg, item.suggested);
    }

    // Capitalize first letter of sentences
    polishedText = polishedText.replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());

    return {
      wordCount,
      charCount,
      score: overallScore,
      gradeLabel,
      issues,
      vocabSuggestions,
      metrics: {
        grammar: `${grammarScore}%`,
        variety: `${varietyScore}%`,
        vocab: `${vocabScore}%`
      },
      polishedText
    };
  }
}

// Instantiate global analyzer
window.analyzer = new EnglishAnalyzer();
