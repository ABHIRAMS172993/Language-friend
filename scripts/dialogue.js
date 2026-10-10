/**
 * FLUENTLY - Conversational Roleplay Partner
 * Dynamic AI roleplay with persona branching, in-line C1 suggestion pills,
 * regional text-to-speech accents (UK / US / International), and IndexedDB persistence.
 */

class DialoguePartner {
  constructor() {
    this.scenarios = {
      job_interview: {
        key: "job_interview",
        title: "Job Interview for a Project Lead Role",
        desc: "You are speaking with Alex, a senior hiring manager. Practice explaining your strengths, career trajectory, handling behavioral questions, and discussing team alignment.",
        icon: "💼",
        botRole: "Alex, Senior Hiring Manager",
        accent: "en-US",
        accentLabel: "🇺🇸 US Corporate",
        pitch: 1.0,
        initialGreeting: "Hello! Thanks for taking the time to speak with me today. To kick things off, could you briefly introduce yourself and share what attracted you to this role?",
        responses: [
          "That's very insightful. Could you describe a time when you faced a strict deadline and unexpected road blocks? How did you prioritize?",
          "Impressive. And how do you handle polite disagreements within your cross-functional team when engineering and product goals clash?",
          "Thank you for sharing that. What would you say is your greatest technical strength, and an area you are actively working to improve?",
          "Those are solid perspectives. Do you have any questions for me about our team culture or current project roadmap?"
        ]
      },
      coffee_shop: {
        key: "coffee_shop",
        title: "Ordering & Small Talk at a London Coffee Shop",
        desc: "You are at an artisan cafe in Covent Garden. Practice ordering specific items, customizing drinks, and making friendly British small talk.",
        icon: "☕",
        botRole: "Liam, Barista",
        accent: "en-GB",
        accentLabel: "🇬🇧 British (London)",
        pitch: 1.05,
        initialGreeting: "Good morning! Welcome to Roasters in Covent Garden. What can I get started for you today?",
        responses: [
          "Sure thing! Would you like oat milk, whole milk, or almond milk with that? And any fresh pastry to go with it?",
          "Brilliant choice. Are you having that here to enjoy the cafe vibe, or is it for takeaway on your way to work?",
          "Lovely! Weather's quite pleasant today, isn't it? Have you got any exciting plans for the weekend around London?",
          "That sounds wonderful! Here is your drink, piping hot. Enjoy your day!"
        ]
      },
      hotel_checkin: {
        key: "hotel_checkin",
        title: "Hotel Check-in & Requesting a Room Upgrade",
        desc: "You have arrived at a 4-star boutique hotel in Singapore. Practice checking in and politely asking if a higher-floor room with a view is available.",
        icon: "🏨",
        botRole: "Elena, Front Desk Concierge",
        accent: "en-GB",
        accentLabel: "🇸🇬 Hospitality / International",
        pitch: 1.1,
        initialGreeting: "Welcome to the Grand Heritage Hotel! How may I assist you with your reservation today?",
        responses: [
          "Certainly! I have your reservation under the standard deluxe suite for 3 nights. Could I please see your ID or passport?",
          "Thank you! Everything looks in order. Was there any specific preference you had regarding your room or floor level?",
          "Let me check our system for you. Yes! We have an executive suite on the 18th floor facing the city skyline. I can offer you a complimentary upgrade.",
          "Here are your keycards. Breakfast is served on the 3rd floor from 6:30 to 10:30 AM. Is there anything else I can assist with?"
        ]
      },
      office_debate: {
        key: "office_debate",
        title: "Workplace Collaboration & Polite Disagreement",
        desc: "Discuss a new product launch deadline with your teammate Priya. Practice phrasing diplomatic pushback and proposing constructive alternatives.",
        icon: "🤝",
        botRole: "Priya, Product Manager",
        accent: "en-US",
        accentLabel: "🇺🇸 US Collaborative",
        pitch: 1.0,
        initialGreeting: "Hey! Thanks for jumping on this sync. We're considering moving the launch date up by two weeks to beat our competitor. What are your initial thoughts?",
        responses: [
          "I understand your perspective. But do you think our testing and QA pipeline can handle the compressed timeline without compromising quality?",
          "That's a fair compromise. What if we launch a private beta first to a smaller segment of users?",
          "I like that approach a lot. Who do you think we should assign to coordinate the beta feedback collection?",
          "Sounds like a plan! Let's draft a summary email to the leadership team highlighting these action items."
        ]
      },
      airport: {
        key: "airport",
        title: "Airport Immigration & Customs Officer",
        desc: "Answer standard customs and border control questions confidently and concisely.",
        icon: "✈️",
        botRole: "Officer Miller, Immigration Officer",
        accent: "en-US",
        accentLabel: "🇺🇸 US Customs & Border",
        pitch: 0.95,
        initialGreeting: "Good afternoon. Passport and boarding pass, please. What is the primary purpose of your visit?",
        responses: [
          "How long do you intend to stay in the country, and where will you be residing during your visit?",
          "Are you traveling alone, or is anyone accompanying you on this trip?",
          "Do you have anything to declare from your luggage, such as commercial goods or agricultural items?",
          "Everything is verified. Welcome, and have a pleasant stay!"
        ]
      }
    };

    this.currentScenarioKey = 'job_interview';
    this.chatHistory = [];
    this.stepIndex = 0;
    this.isListening = false;
    this.recognition = null;
    this.isBotTyping = false;
    this.currentSuggestions = [];
    
    // Auto speech configuration
    const savedAutoSpeak = localStorage.getItem('fluently_dialogue_autospeak');
    this.autoSpeak = savedAutoSpeak !== null ? savedAutoSpeak === 'true' : true;

    this.initElements();
    this.initVoiceInput();
    this.initVoiceSynthesis();
    this.loadScenario('job_interview');
  }

  initElements() {
    this.streamBox = document.getElementById('chat-stream-box');
    this.inputBox = document.getElementById('chat-input-text');
    this.sendBtn = document.getElementById('btn-send-chat');
    this.scenarioSelect = document.getElementById('scenario-select');
    this.scenarioIcon = document.getElementById('chat-scenario-icon');
    this.scenarioTitle = document.getElementById('chat-scenario-title');
    this.scenarioDesc = document.getElementById('chat-scenario-desc');
    this.accentBadge = document.getElementById('chat-accent-badge');
    this.autoSpeakBtn = document.getElementById('btn-toggle-auto-speak');
    this.suggestionsWrapper = document.getElementById('chat-suggestions-wrapper');
    this.suggestionsPills = document.getElementById('chat-suggestions-pills');
    this.refreshSuggestionsBtn = document.getElementById('btn-refresh-suggestions');

    this.scenarioSelect.addEventListener('change', (e) => {
      this.loadScenario(e.target.value);
    });

    document.getElementById('btn-restart-chat').addEventListener('click', () => {
      this.restartCurrentScenario();
    });

    if (this.autoSpeakBtn) {
      this.updateAutoSpeakButtonUI();
      this.autoSpeakBtn.addEventListener('click', () => {
        this.autoSpeak = !this.autoSpeak;
        localStorage.setItem('fluently_dialogue_autospeak', this.autoSpeak ? 'true' : 'false');
        this.updateAutoSpeakButtonUI();
        app.showToast(`Auto-voice narration ${this.autoSpeak ? 'enabled' : 'disabled'}`, 'info');
      });
    }

    if (this.refreshSuggestionsBtn) {
      this.refreshSuggestionsBtn.addEventListener('click', () => {
        this.generateAndRenderSuggestions(true);
      });
    }

    this.sendBtn.addEventListener('click', () => {
      this.handleUserSend();
    });

    this.inputBox.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleUserSend();
      }
    });
  }

  updateAutoSpeakButtonUI() {
    if (!this.autoSpeakBtn) return;
    if (this.autoSpeak) {
      this.autoSpeakBtn.innerHTML = '🔊 Voice: ON';
      this.autoSpeakBtn.classList.add('active-toggle');
    } else {
      this.autoSpeakBtn.innerHTML = '🔇 Voice: Muted';
      this.autoSpeakBtn.classList.remove('active-toggle');
    }
  }

  initVoiceSynthesis() {
    if (window.speechSynthesis) {
      // Pre-warm voices list
      window.speechSynthesis.onvoiceschanged = () => {
        this.availableVoices = window.speechSynthesis.getVoices();
      };
      this.availableVoices = window.speechSynthesis.getVoices();
    }
  }

  initVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'en-US';
      this.recognition.interimResults = false;

      this.recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        this.inputBox.value = (this.inputBox.value ? this.inputBox.value + ' ' : '') + transcript;
        this.inputBox.focus();
      };

      this.recognition.onend = () => {
        this.isListening = false;
        const micBtn = document.getElementById('btn-chat-mic');
        if (micBtn) {
          micBtn.style.transform = 'scale(1)';
          micBtn.classList.remove('listening');
        }
      };

      const micBtn = document.getElementById('btn-chat-mic');
      if (micBtn) {
        micBtn.addEventListener('click', () => {
          if (this.isListening) {
            this.recognition.stop();
          } else {
            this.isListening = true;
            micBtn.style.transform = 'scale(1.2)';
            micBtn.classList.add('listening');
            this.recognition.start();
            app.showToast('Listening... Speak your sentence naturally.', 'info');
          }
        });
      }
    }
  }

  async loadScenario(key) {
    this.currentScenarioKey = key;
    const scen = this.scenarios[key];
    if (!scen) return;

    this.chatHistory = [];
    this.scenarioIcon.innerText = scen.icon;
    this.scenarioTitle.innerText = scen.title;
    this.scenarioDesc.innerText = scen.desc;
    if (this.accentBadge) {
      this.accentBadge.innerText = scen.accentLabel;
    }
    this.streamBox.innerHTML = '';

    // Check Database for previous messages
    let savedMessages = [];
    if (window.fluentlyDB) {
      try {
        savedMessages = await window.fluentlyDB.getChatMessages(key);
      } catch (e) {
        console.warn('Could not read chat history from database:', e);
      }
    }

    if (savedMessages && savedMessages.length > 0) {
      // Re-hydrate UI from database history
      savedMessages.forEach(msg => {
        if (msg.role === 'user') {
          this.renderUserMessageUI(msg.content, msg.feedback);
          this.chatHistory.push({ role: 'user', content: msg.content });
        } else {
          this.renderBotMessageUI(msg.content, scen);
          this.chatHistory.push({ role: 'bot', content: msg.content });
        }
      });

      const botMessagesCount = savedMessages.filter(m => m.role === 'bot').length;
      this.stepIndex = Math.max(0, botMessagesCount - 1);
    } else {
      // Fresh conversation
      this.stepIndex = 0;
      await this.addBotMessage(scen.initialGreeting, true);
    }

    // Generate initial suggestions
    this.generateAndRenderSuggestions();
  }

  async restartCurrentScenario() {
    const key = this.currentScenarioKey;
    if (window.fluentlyDB) {
      await window.fluentlyDB.clearChatMessages(key);
    }
    const scen = this.scenarios[key];
    this.stepIndex = 0;
    this.chatHistory = [];
    this.streamBox.innerHTML = '';
    await this.addBotMessage(scen.initialGreeting, true);
    this.generateAndRenderSuggestions();
    app.showToast('Conversation reset. Clean slate ready!', 'info');
  }

  async handleUserSend() {
    if (this.isBotTyping) return;
    const text = this.inputBox.value.trim();
    if (!text) return;

    this.inputBox.value = '';

    // Instant grammar check on user utterance
    const analysis = window.analyzer ? window.analyzer.analyze(text) : null;

    // Append user message with grammar feedback badge
    await this.addUserMessage(text, analysis);

    // Show bot typing indicator
    this.showTypingIndicator();

    // Call dynamic AI / Persona response engine
    const scen = this.scenarios[this.currentScenarioKey];
    const delay = Math.floor(Math.random() * 400) + 700; // Natural realistic cadence

    setTimeout(async () => {
      let botResponse = null;
      try {
        if (window.aiService) {
          botResponse = await window.aiService.getDialogueResponse(scen, this.chatHistory, text);
        }
      } catch (e) {
        console.warn('Error fetching dynamic dialogue response:', e);
      }

      if (!botResponse) {
        if (this.stepIndex < scen.responses.length) {
          botResponse = scen.responses[this.stepIndex];
          this.stepIndex++;
        } else {
          botResponse = "You've articulated your thoughts with remarkable clarity! What other aspects of this topic would you like to explore together?";
        }
      }

      this.hideTypingIndicator();
      await this.addBotMessage(botResponse);
      this.generateAndRenderSuggestions();
    }, delay);
  }

  showTypingIndicator() {
    this.isBotTyping = true;
    const scen = this.scenarios[this.currentScenarioKey];
    let typingBubble = document.getElementById('chat-typing-indicator');
    if (!typingBubble) {
      typingBubble = document.createElement('div');
      typingBubble.id = 'chat-typing-indicator';
      typingBubble.className = 'chat-bubble bot typing-indicator-bubble';
      typingBubble.innerHTML = `
        <div class="bubble-avatar">${scen.icon}</div>
        <div class="bubble-content">
          <div class="bubble-text typing-dots-box">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-label">${this.escapeHtml(scen.botRole.split(',')[0])} is formulating a response...</span>
          </div>
        </div>
      `;
      this.streamBox.appendChild(typingBubble);
      this.streamBox.scrollTop = this.streamBox.scrollHeight;
    }
  }

  hideTypingIndicator() {
    this.isBotTyping = false;
    const typingBubble = document.getElementById('chat-typing-indicator');
    if (typingBubble) {
      typingBubble.remove();
    }
  }

  renderUserMessageUI(text, analysis) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble user';

    let feedbackHtml = '';
    if (analysis && analysis.issues && analysis.issues.length > 0) {
      const firstIssue = analysis.issues[0];
      feedbackHtml = `
        <div class="grammar-feedback-badge has-error">
          <span>⚠️ <strong>Suggested Fix:</strong> "${this.escapeHtml(firstIssue.matched)}" &rarr; <em>"${this.escapeHtml(firstIssue.replacement)}"</em> (${this.escapeHtml(firstIssue.type)})</span>
        </div>
      `;
    } else {
      feedbackHtml = `
        <div class="grammar-feedback-badge">
          <span>✅ Great sentence structure & natural phrasing!</span>
        </div>
      `;
    }

    bubble.innerHTML = `
      <div class="bubble-avatar">👤</div>
      <div class="bubble-content">
        <div class="bubble-text">${this.escapeHtml(text)}</div>
        ${feedbackHtml}
      </div>
    `;

    this.streamBox.appendChild(bubble);
    this.streamBox.scrollTop = this.streamBox.scrollHeight;
  }

  renderBotMessageUI(text, scen) {
    scen = scen || this.scenarios[this.currentScenarioKey];
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble bot';

    bubble.innerHTML = `
      <div class="bubble-avatar">${scen.icon}</div>
      <div class="bubble-content">
        <div class="bubble-speaker-tag">${this.escapeHtml(scen.botRole)}</div>
        <div class="bubble-text">${this.escapeHtml(text)}</div>
        <div class="bubble-actions-row">
          <button class="chat-speak-btn" onclick="dialoguePartner.speakBotText('${encodeURIComponent(text)}', '${scen.key}')">
            🔊 Listen <span class="accent-tag-inline">${scen.accentLabel.split(' ')[0]}</span>
          </button>
        </div>
      </div>
    `;

    this.streamBox.appendChild(bubble);
    this.streamBox.scrollTop = this.streamBox.scrollHeight;
  }

  async addUserMessage(text, analysis) {
    this.renderUserMessageUI(text, analysis);
    this.chatHistory.push({ role: 'user', content: text });
    if (window.app) {
      window.app.incrementStats(text.split(/\s+/).filter(Boolean).length);
    }

    // Save to Database
    if (window.fluentlyDB) {
      try {
        await window.fluentlyDB.saveChatMessage({
          scenarioKey: this.currentScenarioKey,
          role: 'user',
          content: text,
          feedback: analysis
        });
      } catch (err) {
        console.warn('Database save chat message failed:', err);
      }
    }
  }

  async addBotMessage(text, isInitial = false) {
    const scen = this.scenarios[this.currentScenarioKey];
    this.renderBotMessageUI(text, scen);
    this.chatHistory.push({ role: 'bot', content: text });

    // Auto-vocalize speech if enabled
    if (this.autoSpeak) {
      this.speakBotText(encodeURIComponent(text), scen.key);
    }

    // Save to Database
    if (window.fluentlyDB) {
      try {
        await window.fluentlyDB.saveChatMessage({
          scenarioKey: this.currentScenarioKey,
          role: 'bot',
          content: text,
          feedback: null
        });
      } catch (err) {
        console.warn('Database save bot message failed:', err);
      }
    }
  }

  speakBotText(encodedText, scenarioKey) {
    const text = decodeURIComponent(encodedText);
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const scen = this.scenarios[scenarioKey || this.currentScenarioKey] || this.scenarios.job_interview;

    const u = new SpeechSynthesisUtterance(text);
    u.lang = scen.accent || 'en-US';
    u.pitch = scen.pitch || 1.0;

    const baseRate = parseFloat(localStorage.getItem('fluently_voice_rate') || '0.95');
    u.rate = baseRate;

    // Pick best matching regional voice from system
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      let matchedVoice = null;

      if (scen.accent === 'en-GB') {
        matchedVoice = voices.find(v => v.lang.startsWith('en-GB') || v.name.includes('UK') || v.name.includes('United Kingdom') || v.name.includes('British') || v.name.includes('George') || v.name.includes('Hazel') || v.name.includes('Susan'));
      } else {
        matchedVoice = voices.find(v => v.lang === 'en-US' && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David') || v.name.includes('Zira')));
      }

      if (matchedVoice) {
        u.voice = matchedVoice;
      }
    }

    window.speechSynthesis.speak(u);
  }

  async generateAndRenderSuggestions(forceShuffle = false) {
    if (!this.suggestionsPills) return;
    const scen = this.scenarios[this.currentScenarioKey];
    const lastBotMsg = this.chatHistory.filter(m => m.role === 'bot').slice(-1)[0]?.content || scen.initialGreeting;

    this.suggestionsPills.innerHTML = `<span class="suggestions-loading-text">✨ Formulating C1 response options...</span>`;

    let suggestions = [];
    if (window.aiService) {
      suggestions = await window.aiService.getDialogueSuggestions(scen, this.chatHistory, lastBotMsg);
    }

    if (!suggestions || suggestions.length === 0) {
      suggestions = [
        "In my previous experience, I prioritized clear communication across all key stakeholders.",
        "Could you elaborate on the primary milestones and expectations for this initiative?",
        "From my perspective, adopting a phased rollout is the most pragmatic way to mitigate risk."
      ];
    }

    this.currentSuggestions = suggestions;
    this.renderSuggestions(suggestions);
  }

  renderSuggestions(suggestions) {
    if (!this.suggestionsPills) return;
    this.suggestionsPills.innerHTML = '';

    suggestions.forEach((pillText, idx) => {
      const pill = document.createElement('button');
      pill.className = 'chat-suggestion-pill';
      pill.setAttribute('title', 'Click to insert into your response');
      pill.innerHTML = `
        <span class="pill-number">#${idx + 1}</span>
        <span class="pill-text">${this.escapeHtml(pillText)}</span>
        <span class="pill-action-icon">↵</span>
      `;

      pill.addEventListener('click', () => {
        this.selectSuggestion(pillText);
      });

      this.suggestionsPills.appendChild(pill);
    });
  }

  selectSuggestion(text) {
    this.inputBox.value = text;
    this.inputBox.focus();
    this.inputBox.classList.add('flash-highlight');
    setTimeout(() => this.inputBox.classList.remove('flash-highlight'), 600);
    app.showToast('C1 suggestion inserted. Feel free to customize or send!', 'info');
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

window.dialoguePartner = null;
