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
    const issueCount = combinedIssues.length;
    let grammarScore = Math.max(10, Math.min(100, 100 - (issueCount * 14)));
    let varietyScore = localResult.metrics?.variety ? parseInt(localResult.metrics.variety) : 75;
    let vocabScore = localResult.metrics?.vocab ? parseInt(localResult.metrics.vocab) : 70;

    let overallScore = Math.round((grammarScore * 0.5) + (varietyScore * 0.25) + (vocabScore * 0.25));

    let gradeLabel = "Basic Intermediate (B1)";
    if (issueCount === 0 && overallScore >= 88) gradeLabel = "Advanced Fluency (C1/C2)";
    else if (issueCount <= 2 && overallScore >= 75) gradeLabel = "Strong Upper-Intermediate (B2)";
    else if (overallScore >= 55) gradeLabel = "Developing Intermediate (B1)";
    else gradeLabel = "Needs Revision (A2/B1)";

    return {
      wordCount,
      charCount,
      score: overallScore,
      gradeLabel,
      issues: combinedIssues,
      vocabSuggestions: localResult.vocabSuggestions || [],
      metrics: {
        grammar: `${grammarScore}%`,
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
  "metrics": { "grammar": "85%", "variety": "80%", "vocab": "75%" },
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

  async getDialogueResponse(scenario, chatHistory, userMessage) {
    if (this.engine === 'smart-local' || !this.apiKey) {
      return null; // Triggers simulated scenario responses
    }

    try {
      const prompt = `You are a conversational roleplay partner for an intermediate English student.
Scenario: ${scenario.title} (${scenario.desc})
Role: You are ${scenario.botRole}.
User: ${userMessage}

Respond in 1-3 natural, engaging English sentences keeping the roleplay going, while speaking at a clear B2/C1 level.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(this.apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (e) {
      console.warn('Dialogue AI error', e);
      return null;
    }
  }
}

window.aiService = new AIService();
