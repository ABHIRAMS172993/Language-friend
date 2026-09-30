/**
 * FLUENTLY - Conversational Roleplay Partner
 */

class DialoguePartner {
  constructor() {
    this.scenarios = {
      job_interview: {
        title: "Job Interview for a Project Lead Role",
        desc: "You are speaking with Alex, a senior hiring manager. Practice explaining your strengths, career trajectory, and handling behavioral questions.",
        icon: "💼",
        botRole: "Alex, Senior Hiring Manager",
        initialGreeting: "Hello! Thanks for taking the time to speak with me today. To kick things off, could you briefly introduce yourself and share what attracted you to this role?",
        responses: [
          "That's very insightful. Could you describe a time when you faced a strict deadline and unexpected road blocks? How did you prioritize?",
          "Impressive. And how do you handle polite disagreements within your cross-functional team when engineering and product goals clash?",
          "Thank you for sharing that. What would you say is your greatest technical strength, and an area you are actively working to improve?",
          "Those are solid perspectives. Do you have any questions for me about our team culture or current project roadmap?"
        ]
      },
      coffee_shop: {
        title: "Ordering & Small Talk at a London Coffee Shop",
        desc: "You are at an artisan cafe in Covent Garden. Practice ordering specific items, customizing drinks, and making friendly small talk.",
        icon: "☕",
        botRole: "Liam, Barista",
        initialGreeting: "Good morning! Welcome to Roasters. What can I get started for you today?",
        responses: [
          "Sure thing! Would you like oat milk, whole milk, or almond milk with that? And any pastry to go with it?",
          "Brilliant choice. Are you having that here to enjoy the cafe vibe, or is it for takeaway on your way to work?",
          "Lovely! Weather's quite pleasant today, isn't it? Have you got any exciting plans for the weekend around London?",
          "That sounds wonderful! Here is your drink, piping hot. Enjoy your day!"
        ]
      },
      hotel_checkin: {
        title: "Hotel Check-in & Requesting a Room Upgrade",
        desc: "You have arrived at a 4-star boutique hotel in Singapore. Practice checking in and politely asking if a higher-floor room with a view is available.",
        icon: "🏨",
        botRole: "Elena, Front Desk Concierge",
        initialGreeting: "Welcome to the Grand Heritage Hotel! How may I assist you with your reservation today?",
        responses: [
          "Certainly! I have your reservation under the standard deluxe suite for 3 nights. Could I please see your ID or passport?",
          "Thank you! Everything looks in order. Was there any specific preference you had regarding your room or floor level?",
          "Let me check our system for you. Yes! We have an executive suite on the 18th floor facing the city skyline. I can offer you a complimentary upgrade.",
          "Here are your keycards. Breakfast is served on the 3rd floor from 6:30 to 10:30 AM. Is there anything else I can assist you with?"
        ]
      },
      office_debate: {
        title: "Workplace Collaboration & Polite Disagreement",
        desc: "Discuss a new product launch deadline with your teammate Priya. Practice phrasing diplomatic pushback and proposing constructive alternatives.",
        icon: "🤝",
        botRole: "Priya, Product Manager",
        initialGreeting: "Hey! Thanks for jumping on this sync. We're considering moving the launch date up by two weeks to beat our competitor. What are your initial thoughts?",
        responses: [
          "I understand your perspective. But do you think our testing and QA pipeline can handle the compressed timeline without compromising quality?",
          "That's a fair compromise. What if we launch a private beta first to a smaller segment of users?",
          "I like that approach a lot. Who do you think we should assign to coordinate the beta feedback collection?",
          "Sounds like a plan! Let's draft a summary email to the leadership team highlighting these action items."
        ]
      },
      airport: {
        title: "Airport Immigration & Customs Officer",
        desc: "Answer standard customs and border control questions confidently and concisely.",
        icon: "✈️",
        botRole: "Officer Miller, Immigration Officer",
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

    this.initElements();
    this.initVoiceInput();
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

    this.scenarioSelect.addEventListener('change', (e) => {
      this.loadScenario(e.target.value);
    });

    document.getElementById('btn-restart-chat').addEventListener('click', () => {
      this.loadScenario(this.currentScenarioKey);
    });

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

  initVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'en-US';
      this.recognition.interimResults = false;

      this.recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        this.inputBox.value = (this.inputBox.value ? this.inputBox.value + ' ' : '') + transcript;
      };

      this.recognition.onend = () => {
        this.isListening = false;
        document.getElementById('btn-chat-mic').style.transform = 'scale(1)';
      };

      document.getElementById('btn-chat-mic').addEventListener('click', () => {
        if (this.isListening) {
          this.recognition.stop();
        } else {
          this.isListening = true;
          document.getElementById('btn-chat-mic').style.transform = 'scale(1.3)';
          this.recognition.start();
          app.showToast('Listening to your chat voice...', 'info');
        }
      });
    }
  }

  loadScenario(key) {
    this.currentScenarioKey = key;
    const scen = this.scenarios[key];
    if (!scen) return;

    this.stepIndex = 0;
    this.chatHistory = [];
    this.scenarioIcon.innerText = scen.icon;
    this.scenarioTitle.innerText = scen.title;
    this.scenarioDesc.innerText = scen.desc;
    this.streamBox.innerHTML = '';

    // Add initial bot greeting
    this.addBotMessage(scen.initialGreeting);
  }

  async handleUserSend() {
    const text = this.inputBox.value.trim();
    if (!text) return;

    this.inputBox.value = '';

    // Instant grammar check on user utterance
    const analysis = window.analyzer.analyze(text);

    // Append user message with grammar feedback tag
    this.addUserMessage(text, analysis);

    // Bot responding
    setTimeout(async () => {
      const scen = this.scenarios[this.currentScenarioKey];
      let botResponse = null;

      // Try AI service if configured
      botResponse = await window.aiService.getDialogueResponse(scen, this.chatHistory, text);

      if (!botResponse) {
        // Fallback to scripted branch
        if (this.stepIndex < scen.responses.length) {
          botResponse = scen.responses[this.stepIndex];
          this.stepIndex++;
        } else {
          botResponse = "Thank you for this wonderful practice session! You communicated clearly and kept the conversation flowing naturally.";
        }
      }

      this.addBotMessage(botResponse);
    }, 800);
  }

  addUserMessage(text, analysis) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble user';

    let feedbackHtml = '';
    if (analysis.issues && analysis.issues.length > 0) {
      const firstIssue = analysis.issues[0];
      feedbackHtml = `
        <div class="grammar-feedback-badge has-error">
          <span>⚠️ Fix: "${firstIssue.matched}" &rarr; <strong>"${firstIssue.replacement}"</strong> (${firstIssue.type})</span>
        </div>
      `;
    } else {
      feedbackHtml = `
        <div class="grammar-feedback-badge">
          <span>✅ Great sentence structure!</span>
        </div>
      `;
    }

    bubble.innerHTML = `
      <div class="bubble-avatar">👤</div>
      <div class="bubble-content">
        <div class="bubble-text">${text}</div>
        ${feedbackHtml}
      </div>
    `;

    this.streamBox.appendChild(bubble);
    this.streamBox.scrollTop = this.streamBox.scrollHeight;
    this.chatHistory.push({ role: 'user', content: text });
    app.incrementStats(text.split(/\s+/).length);
  }

  addBotMessage(text) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble bot';

    bubble.innerHTML = `
      <div class="bubble-avatar">${this.scenarios[this.currentScenarioKey].icon}</div>
      <div class="bubble-content">
        <div class="bubble-text">${text}</div>
      </div>
    `;

    this.streamBox.appendChild(bubble);
    this.streamBox.scrollTop = this.streamBox.scrollHeight;
    this.chatHistory.push({ role: 'bot', content: text });

    // Optional audio narration for bot message
    if (window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 1.0;
      // window.speechSynthesis.speak(u);
    }
  }
}

window.dialoguePartner = null;
