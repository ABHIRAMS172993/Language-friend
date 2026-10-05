/**
 * FLUENTLY - AI Service Connector
 * Connects to Gemini API if key is provided, or seamlessly falls back to the smart local engine.
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

  async getWritingCritique(text) {
    // If user selected smart-local or has no API key, use local analyzer
    if (this.engine === 'smart-local' || !this.apiKey) {
      return window.analyzer.analyze(text);
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(this.apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert English Language Coach for Intermediate (B1/B2) students.
Analyze this learner text:
"${text}"

Return a JSON object with:
{
  "score": (number 1-100),
  "gradeLabel": (e.g. "B2 Upper Intermediate"),
  "issues": [
    { "type": "Grammar"|"Collocation"|"Tense"|"Redundancy", "severity": "error"|"warning", "matched": "...", "replacement": "...", "explanation": "..." }
  ],
  "vocabSuggestions": [
    { "original": "...", "suggested": "..." }
  ],
  "metrics": { "grammar": "85%", "variety": "80%", "vocab": "75%" },
  "polishedText": "Rewritten elegant C1 level version of the text"
}
Output ONLY valid JSON.`
            }]
          }]
        })
      });

      if (!response.ok) {
        console.warn('AI API HTTP Error:', response.status);
        return window.analyzer.analyze(text);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        parsed.wordCount = text.trim().split(/\s+/).filter(Boolean).length;
        parsed.charCount = text.length;

        // Ensure metrics structure exists
        if (!parsed.metrics) {
          parsed.metrics = { grammar: '75%', variety: '70%', vocab: '70%' };
        }

        // Merge with local analyzer if AI missed obvious rule violations
        const local = window.analyzer.analyze(text);
        if ((!parsed.issues || parsed.issues.length === 0) && local.issues.length > 0) {
          parsed.issues = local.issues;
          parsed.metrics.grammar = local.metrics.grammar;
          parsed.score = Math.min(parsed.score || 80, local.score);
        }

        return parsed;
      }
      return window.analyzer.analyze(text);
    } catch (e) {
      console.warn('AI API failed, falling back to local analyzer', e);
      return window.analyzer.analyze(text);
    }
  }

  async getDialogueResponse(scenario, chatHistory, userMessage) {
    if (this.engine === 'smart-local' || !this.apiKey) {
      return null; // Will trigger simulated scenario response in dialogue.js
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
