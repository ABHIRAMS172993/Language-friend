/**
 * FLUENTLY - Speaking Studio & Voice Pronunciation Engine
 */

class SpeakingStudio {
  constructor() {
    this.drills = {
      business: [
        "Although we encountered several unforeseen obstacles during the rollout, our proactive communication ensured customer satisfaction.",
        "Could you please walk me through the key assumptions underpinning this quarterly financial forecast?",
        "I would recommend aligning with the product design team before finalizing the technical specifications.",
        "To mitigate project risks, we should establish clear milestones and hold weekly standup check-ins.",
        "The primary objective of this presentation is to evaluate the feasibility of our new expansion strategy."
      ],
      daily: [
        "I've been thinking about picking up a new hobby lately, perhaps learning Spanish or landscape photography.",
        "Would you mind keeping an eye on my laptop for a few minutes while I grab a coffee?",
        "The traffic during rush hour was utterly chaotic, so I decided to take the subway instead.",
        "Let's catch up over brunch this weekend and talk about how your new job is going.",
        "I genuinely appreciate you taking the time to help me move into the new apartment yesterday."
      ],
      idioms: [
        "We need to go back to the drawing board after our initial proposal was turned down by the committee.",
        "Let's touch base next Tuesday once everyone has reviewed the updated memorandum.",
        "She really hit the nail on the head when describing the root cause of our low retention rate.",
        "I'm feeling a bit under the weather today, so I might sign off slightly earlier than usual.",
        "Don't put all your eggs in one basket; diversify your investments across several sectors."
      ],
      tongue_twisters: [
        "She sells sea shells by the sea shore, and the shells she sells are sea shells, I'm sure.",
        "Peter Piper picked a peck of pickled peppers; where is the peck of pickled peppers Peter Piper picked?",
        "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
        "Thirty-three thirsty, thundering thoroughbreds thumped through thirty-three thrones."
      ]
    };

    this.currentCategory = 'business';
    this.currentIndex = 0;
    this.isRecording = false;
    this.recognition = null;
    this.synth = window.speechSynthesis;

    this.targetSentenceEl = document.getElementById('target-sentence-text');
    this.drillCounterEl = document.getElementById('drill-counter');
    this.diffOutputEl = document.getElementById('speech-diff-output');
    this.accuracyBadgeEl = document.getElementById('speech-accuracy-badge');
    this.micBtn = document.getElementById('btn-toggle-mic');
    this.micStatusLabel = document.getElementById('mic-status-label');
    this.tipsBox = document.getElementById('speech-tips-container');
    this.tipsList = document.getElementById('speech-tips-list');
    this.canvas = document.getElementById('audio-visualizer');
    this.canvasCtx = this.canvas.getContext('2d');

    this.initSpeechRecognition();
    this.initEvents();
    this.loadDrill();
    this.drawVisualizerIdle();
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isRecording = true;
        this.micBtn.classList.add('recording');
        this.micStatusLabel.innerText = "Listening... Speak clearly now!";
        this.animateVisualizer();
      };

      this.recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        this.evaluateSpeech(transcript);
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        this.stopRecording();
        app.showToast('Microphone error: ' + event.error, 'error');
      };

      this.recognition.onend = () => {
        this.stopRecording();
      };
    } else {
      console.warn('Web Speech Recognition API is not supported in this browser.');
    }
  }

  initEvents() {
    // Topic change
    document.getElementById('drill-topic-select').addEventListener('change', (e) => {
      this.currentCategory = e.target.value;
      this.currentIndex = 0;
      this.loadDrill();
    });

    // Next / Prev drills
    document.getElementById('btn-next-drill').addEventListener('click', () => {
      const list = this.drills[this.currentCategory];
      this.currentIndex = (this.currentIndex + 1) % list.length;
      this.loadDrill();
    });

    document.getElementById('btn-prev-drill').addEventListener('click', () => {
      const list = this.drills[this.currentCategory];
      this.currentIndex = (this.currentIndex - 1 + list.length) % list.length;
      this.loadDrill();
    });

    // Listen to native audio button
    document.getElementById('btn-listen-target').addEventListener('click', () => {
      this.speakText(this.targetSentenceEl.innerText);
    });

    // Mic toggle button
    this.micBtn.addEventListener('click', () => {
      if (!this.recognition) {
        app.showToast('Speech recognition is not supported in this browser. Please use Chrome/Edge or standard browser.', 'error');
        return;
      }
      if (this.isRecording) {
        this.recognition.stop();
      } else {
        try {
          this.recognition.start();
        } catch (e) {
          this.recognition.stop();
        }
      }
    });

    // Toggle Modes (Read drills vs Impromptu)
    document.getElementById('btn-mode-read').addEventListener('click', (e) => {
      document.getElementById('btn-mode-read').classList.add('active');
      document.getElementById('btn-mode-impromptu').classList.remove('active');
      document.getElementById('speaking-read-section').style.display = 'block';
      document.getElementById('speaking-impromptu-section').style.display = 'none';
    });

    document.getElementById('btn-mode-impromptu').addEventListener('click', (e) => {
      document.getElementById('btn-mode-impromptu').classList.add('active');
      document.getElementById('btn-mode-read').classList.remove('active');
      document.getElementById('speaking-read-section').style.display = 'none';
      document.getElementById('speaking-impromptu-section').style.display = 'block';
    });
  }

  loadDrill() {
    const list = this.drills[this.currentCategory];
    const sentence = list[this.currentIndex];
    this.targetSentenceEl.innerText = sentence;
    this.drillCounterEl.innerText = `${this.currentIndex + 1} / ${list.length}`;
    this.diffOutputEl.innerHTML = `<span class="text-placeholder">Click microphone and read the sentence above...</span>`;
    this.accuracyBadgeEl.innerText = `Accuracy: --%`;
    this.tipsBox.style.display = 'none';
  }

  stopRecording() {
    this.isRecording = false;
    this.micBtn.classList.remove('recording');
    this.micStatusLabel.innerText = "Click to Start Speaking";
    this.drawVisualizerIdle();
  }

  evaluateSpeech(userTranscript) {
    if (!userTranscript || userTranscript.trim() === '') return;

    const targetSentence = this.targetSentenceEl.innerText;
    const cleanTarget = targetSentence.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
    const cleanSpoken = userTranscript.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);

    let correctCount = 0;
    let diffHtml = '';

    cleanSpoken.forEach((word) => {
      if (cleanTarget.includes(word)) {
        diffHtml += `<span class="word-correct">${word}</span> `;
        correctCount++;
      } else {
        diffHtml += `<span class="word-extra">${word}</span> `;
      }
    });

    // Check missed target words
    const missed = cleanTarget.filter(tw => !cleanSpoken.includes(tw));
    if (missed.length > 0 && cleanSpoken.length > 3) {
      missed.slice(0, 3).forEach(mw => {
        diffHtml += `<span class="word-missed">(${mw})</span> `;
      });
    }

    const accuracy = Math.min(100, Math.round((correctCount / Math.max(cleanTarget.length, cleanSpoken.length)) * 100));
    this.diffOutputEl.innerHTML = diffHtml;
    this.accuracyBadgeEl.innerText = `Accuracy: ${accuracy}%`;

    // Advice tips
    if (accuracy < 80) {
      this.tipsBox.style.display = 'block';
      this.tipsList.innerHTML = `
        <p>• Speak at a deliberate, measured pace (~130 words/minute).</p>
        <p>• Make sure to articulate ending consonants clearly (e.g. <em>-ed, -s, -ct</em>).</p>
        <p>• Listen to the native audio reference using the <strong>"🔊 Listen to Native Audio"</strong> button above.</p>
      `;
    } else {
      this.tipsBox.style.display = 'block';
      this.tipsList.innerHTML = `<p style="color:#34d399;">🌟 Outstanding pronunciation and rhythm! Keep this fluency pace up.</p>`;
    }

    // Update global app stats
    app.recordSpeakingScore(accuracy);
  }

  speakText(text) {
    if (!this.synth) return;
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = parseFloat(localStorage.getItem('fluently_voice_rate') || '0.95');
    this.synth.speak(utterance);
    app.showToast('Playing reference audio...', 'success');
  }

  // Visualizer Animation
  drawVisualizerIdle() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    this.canvasCtx.clearRect(0, 0, width, height);
    this.canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    this.canvasCtx.lineWidth = 2;
    this.canvasCtx.beginPath();
    this.canvasCtx.moveTo(0, height / 2);
    this.canvasCtx.lineTo(width, height / 2);
    this.canvasCtx.stroke();
  }

  animateVisualizer() {
    if (!this.isRecording) return;
    const width = this.canvas.width;
    const height = this.canvas.height;
    this.canvasCtx.clearRect(0, 0, width, height);

    const bars = 32;
    const barWidth = width / bars;
    for (let i = 0; i < bars; i++) {
      const barHeight = Math.random() * (height * 0.8) + 4;
      const x = i * barWidth;
      const y = (height - barHeight) / 2;
      const gradient = this.canvasCtx.createLinearGradient(0, y, 0, y + barHeight);
      gradient.addColorStop(0, '#6366f1');
      gradient.addColorStop(1, '#06b6d4');
      this.canvasCtx.fillStyle = gradient;
      this.canvasCtx.fillRect(x + 2, y, barWidth - 4, barHeight);
    }

    requestAnimationFrame(() => this.animateVisualizer());
  }
}

window.speakingStudio = null;
