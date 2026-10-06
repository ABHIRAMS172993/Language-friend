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

    this.impromptuPrompts = [
      "What is one technology invention you cannot live without, and why?",
      "Describe a memorable trip you took and what made it special.",
      "If you could have dinner with any historical figure, who would it be and why?",
      "Do you prefer working remotely or in a traditional office? Explain your reasons.",
      "What is a personal habit you are trying to build or break this year?",
      "Describe your dream job and what skills you need to succeed in it."
    ];
    this.currentImpromptuIndex = 0;
    this.impromptuRecording = false;
    this.impromptuTimerInterval = null;
    this.impromptuSeconds = 0;
    this.impromptuTranscript = '';

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
        if (this.impromptuRecording) {
          // Impromptu mode start
        } else {
          this.isRecording = true;
          this.micBtn.classList.add('recording');
          this.micStatusLabel.innerText = "Listening... Speak clearly now!";
          this.animateVisualizer();
        }
      };

      this.recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (this.impromptuRecording) {
          this.impromptuTranscript = (this.impromptuTranscript ? this.impromptuTranscript + ' ' : '') + transcript;
          const transcriptEl = document.getElementById('impromptu-transcript-text');
          if (transcriptEl) {
            transcriptEl.innerText = this.impromptuTranscript;
          }
        } else {
          this.evaluateSpeech(transcript);
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (this.impromptuRecording) {
          this.stopImpromptuRecording();
        } else {
          this.stopRecording();
        }
        app.showToast('Microphone error: ' + event.error, 'error');
      };

      this.recognition.onend = () => {
        if (this.impromptuRecording) {
          // In impromptu mode, if speech paused but timer still running, auto-restart to continue listening
          if (this.impromptuSeconds < 60) {
            try {
              this.recognition.start();
            } catch (e) {}
          } else {
            this.stopImpromptuRecording();
          }
        } else {
          this.stopRecording();
        }
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
    document.getElementById('btn-mode-read').addEventListener('click', () => {
      document.getElementById('btn-mode-read').classList.add('active');
      document.getElementById('btn-mode-impromptu').classList.remove('active');
      document.getElementById('speaking-read-section').style.display = 'block';
      document.getElementById('speaking-impromptu-section').style.display = 'none';
    });

    document.getElementById('btn-mode-impromptu').addEventListener('click', () => {
      document.getElementById('btn-mode-impromptu').classList.add('active');
      document.getElementById('btn-mode-read').classList.remove('active');
      document.getElementById('speaking-read-section').style.display = 'none';
      document.getElementById('speaking-impromptu-section').style.display = 'block';
    });

    // Impromptu new topic
    const newTopicBtn = document.getElementById('btn-new-impromptu-topic');
    if (newTopicBtn) {
      newTopicBtn.addEventListener('click', () => {
        this.nextImpromptuTopic();
      });
    }

    // Impromptu record toggle
    const toggleRecBtn = document.getElementById('btn-toggle-impromptu-rec');
    if (toggleRecBtn) {
      toggleRecBtn.addEventListener('click', () => {
        this.toggleImpromptuRecording();
      });
    }
  }

  nextImpromptuTopic() {
    this.currentImpromptuIndex = (this.currentImpromptuIndex + 1) % this.impromptuPrompts.length;
    const promptEl = document.getElementById('impromptu-question');
    if (promptEl) {
      promptEl.innerText = `"${this.impromptuPrompts[this.currentImpromptuIndex]}"`;
    }
    app.showToast('New impromptu prompt loaded!', 'info');
  }

  toggleImpromptuRecording() {
    const btn = document.getElementById('btn-toggle-impromptu-rec');
    const timerEl = document.getElementById('speaking-timer');

    if (this.impromptuRecording) {
      this.stopImpromptuRecording();
    } else {
      if (!this.recognition) {
        app.showToast('Speech recognition is not supported in this browser.', 'error');
        return;
      }
      this.impromptuRecording = true;
      this.impromptuSeconds = 0;
      this.impromptuTranscript = '';
      if (btn) btn.innerHTML = '⏹️ Stop & Evaluate';
      if (timerEl) {
        timerEl.classList.add('running');
        timerEl.innerText = '00:00';
      }

      this.impromptuTimerInterval = setInterval(() => {
        this.impromptuSeconds++;
        const mins = String(Math.floor(this.impromptuSeconds / 60)).padStart(2, '0');
        const secs = String(this.impromptuSeconds % 60).padStart(2, '0');
        if (timerEl) timerEl.innerText = `${mins}:${secs}`;
        if (this.impromptuSeconds >= 60) {
          this.stopImpromptuRecording();
        }
      }, 1000);

      try {
        this.recognition.start();
      } catch (e) {
        // already active
      }
      app.showToast('Recording started! Speak continuously for 30-60s...', 'success');
    }
  }

  stopImpromptuRecording() {
    this.impromptuRecording = false;
    clearInterval(this.impromptuTimerInterval);
    const btn = document.getElementById('btn-toggle-impromptu-rec');
    const timerEl = document.getElementById('speaking-timer');
    if (btn) btn.innerHTML = '🎙️ Start Speaking (60s)';
    if (timerEl) timerEl.classList.remove('running');

    if (this.recognition) {
      try { this.recognition.stop(); } catch(e) {}
    }

    this.evaluateImpromptuSpeech();
  }

  async evaluateImpromptuSpeech() {
    const resultBox = document.getElementById('impromptu-result-box');
    const transcriptEl = document.getElementById('impromptu-transcript-text');
    const wpmEl = document.getElementById('impromptu-wpm');
    const wordsEl = document.getElementById('impromptu-words');
    const grammarEl = document.getElementById('impromptu-grammar-score');
    const fluencyEl = document.getElementById('impromptu-fluency-grade');

    if (!resultBox) return;
    resultBox.style.display = 'block';

    const text = (this.impromptuTranscript || '').trim();
    if (!text) {
      transcriptEl.innerHTML = `<span class="text-placeholder">No speech detected. Please check microphone permissions and try speaking again.</span>`;
      return;
    }

    transcriptEl.innerText = text;
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const minutes = Math.max(0.1, this.impromptuSeconds / 60);
    const wpm = Math.round(wordCount / minutes);

    if (grammarEl) grammarEl.innerText = 'Analyzing...';

    // Run unified AI/LanguageTool/NLP analyzer on spoken text
    let analysis;
    try {
      analysis = await window.aiService.getWritingCritique(text);
    } catch(e) {
      analysis = window.analyzer.analyze(text);
    }

    if (wpmEl) wpmEl.innerText = `${wpm} WPM`;
    if (wordsEl) wordsEl.innerText = wordCount;
    if (grammarEl) grammarEl.innerText = analysis.metrics?.grammar || `${analysis.score}%`;
    if (fluencyEl) fluencyEl.innerText = analysis.gradeLabel.split(' ')[0] || 'B2';

    app.incrementStats(wordCount);
    app.recordSpeakingScore(analysis.score);
    app.showToast(`Impromptu evaluation complete! Pacing: ${wpm} WPM`, 'success');
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
