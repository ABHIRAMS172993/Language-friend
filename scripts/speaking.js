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
    this.drillStartTime = null; // Track when user started speaking for WPM
    this.bestAccuracies = {}; // Track best accuracy per drill
    this.visualizerBars = []; // Smoothed visualizer bar heights

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
      "Describe your dream job and what skills you need to succeed in it.",
      "What's a skill you learned recently that surprised you?",
      "Talk about a book, movie, or show that changed your perspective on something."
    ];
    this.currentImpromptuIndex = 0;
    this.impromptuRecording = false;
    this.impromptuTimerInterval = null;
    this.impromptuSeconds = 0;
    this.impromptuTranscript = '';

    // Initialize smoothed visualizer bars
    for (let i = 0; i < 36; i++) this.visualizerBars.push(4);

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
          this.drillStartTime = Date.now();
          this.micBtn.classList.add('recording');
          this.micStatusLabel.innerText = "🔴 Listening... Speak clearly now!";
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

    // Keyboard shortcut: Spacebar toggles mic when on Speaking tab
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && window.app && window.app.currentTab === 'speaking') {
        // Don't trigger if user is typing in an input or textarea
        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        e.preventDefault();
        if (document.getElementById('speaking-impromptu-section')?.style.display !== 'none') {
          this.toggleImpromptuRecording();
        } else {
          this.micBtn.click();
        }
      }
    });
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
    if (window.goalsManager) {
      window.goalsManager.logActivity('speaking', 30, 'Impromptu Speaking Speech');
    }
    app.showToast(`Impromptu evaluation complete! Pacing: ${wpm} WPM`, 'success');
  }


  loadDrill() {
    const list = this.drills[this.currentCategory];
    const sentence = list[this.currentIndex];
    this.targetSentenceEl.innerText = sentence;
    this.drillCounterEl.innerText = `${this.currentIndex + 1} / ${list.length}`;
    this.diffOutputEl.innerHTML = `<span class="text-placeholder">Click microphone (or press <kbd>Space</kbd>) and read the sentence above...</span>`;
    this.accuracyBadgeEl.innerText = `Accuracy: --%`;
    this.tipsBox.style.display = 'none';
    this.drillStartTime = null;
  }

  stopRecording() {
    this.isRecording = false;
    this.micBtn.classList.remove('recording');
    this.micStatusLabel.innerText = "Click to Start Speaking";
    this.drawVisualizerIdle();
  }

  /**
   * LCS-based word diff algorithm for accurate pronunciation evaluation.
   * Properly handles word order, duplicates, insertions, and deletions.
   */
  computeLCS(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
    // Backtrack to get the LCS indices in both arrays
    const matchedA = new Set(), matchedB = new Set();
    let i = m, j = n;
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) {
        matchedA.add(i - 1);
        matchedB.add(j - 1);
        i--; j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
    return { matchedA, matchedB, lcsLength: dp[m][n] };
  }

  evaluateSpeech(userTranscript) {
    if (!userTranscript || userTranscript.trim() === '') return;

    const targetSentence = this.targetSentenceEl.innerText;
    const cleanTarget = targetSentence.toLowerCase().replace(/[^a-z0-9'\s]/g, '').split(/\s+/).filter(w => w);
    const cleanSpoken = userTranscript.toLowerCase().replace(/[^a-z0-9'\s]/g, '').split(/\s+/).filter(w => w);

    // Use LCS for proper order-aware matching
    const { matchedA, matchedB, lcsLength } = this.computeLCS(cleanTarget, cleanSpoken);

    // Build diff HTML from spoken words perspective
    let diffHtml = '';
    cleanSpoken.forEach((word, idx) => {
      if (matchedB.has(idx)) {
        diffHtml += `<span class="word-correct">${word}</span> `;
      } else {
        diffHtml += `<span class="word-extra">${word}</span> `;
      }
    });

    // Show missed target words (not matched)
    const missedWords = cleanTarget.filter((_, idx) => !matchedA.has(idx));
    if (missedWords.length > 0 && cleanSpoken.length > 2) {
      diffHtml += `<br><span style="font-size:0.78rem; color:var(--text-muted); margin-top:6px; display:inline-block;">Missed: </span>`;
      missedWords.slice(0, 5).forEach(mw => {
        diffHtml += `<span class="word-missed">${mw}</span> `;
      });
      if (missedWords.length > 5) {
        diffHtml += `<span class="word-missed">+${missedWords.length - 5} more</span> `;
      }
    }

    const accuracy = Math.min(100, Math.round((lcsLength / Math.max(cleanTarget.length, 1)) * 100));
    this.diffOutputEl.innerHTML = diffHtml;
    this.accuracyBadgeEl.innerText = `Accuracy: ${accuracy}%`;
    this.accuracyBadgeEl.style.background = accuracy >= 80
      ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
    this.accuracyBadgeEl.style.color = accuracy >= 80 ? '#10b981' : '#ef4444';

    // Calculate WPM if we have timing info
    let wpmHtml = '';
    if (this.drillStartTime) {
      const elapsedSec = (Date.now() - this.drillStartTime) / 1000;
      const wpm = Math.round((cleanSpoken.length / Math.max(elapsedSec, 1)) * 60);
      const wpmLabel = wpm < 100 ? 'Slow — try speeding up slightly' :
                       wpm > 180 ? 'Very fast — slow down for clarity' :
                       wpm > 150 ? 'Fast — good energy!' : 'Natural pace 👍';
      wpmHtml = `<span class="speed-badge">${wpm} WPM — ${wpmLabel}</span>`;
    }

    // Advice tips
    this.tipsBox.style.display = 'block';
    if (accuracy < 60) {
      this.tipsList.innerHTML = `
        ${wpmHtml}
        <p>• Try reading the sentence slowly first, then gradually increase speed.</p>
        <p>• Focus on one difficult word at a time — tap <strong>"🔊 Listen to Native Audio"</strong> to hear the reference.</p>
        <p>• Articulate ending consonants clearly (e.g. <em>-ed, -s, -ct, -tion</em>).</p>
      `;
    } else if (accuracy < 80) {
      this.tipsList.innerHTML = `
        ${wpmHtml}
        <p>• Good attempt! Speak at a measured pace (~130 words/minute).</p>
        <p>• Make sure to articulate ending consonants clearly (e.g. <em>-ed, -s, -ct</em>).</p>
        <p>• Listen to the native audio reference using the <strong>"🔊 Listen to Native Audio"</strong> button above.</p>
      `;
    } else if (accuracy < 95) {
      this.tipsList.innerHTML = `
        ${wpmHtml}
        <p style="color:#10b981;">✅ Very good pronunciation! A few minor words were off — try again to hit 95%+.</p>
      `;
    } else {
      this.tipsList.innerHTML = `
        ${wpmHtml}
        <p style="color:#34d399;">🌟 Outstanding pronunciation and rhythm! Perfect score — keep this fluency pace up.</p>
      `;
      // Auto-advance to next drill after a brief celebration delay if perfect
      if (accuracy >= 95) {
        setTimeout(() => {
          app.showToast('🎯 Excellent! Loading next drill...', 'success');
          const list = this.drills[this.currentCategory];
          this.currentIndex = (this.currentIndex + 1) % list.length;
          this.loadDrill();
        }, 2500);
      }
    }

    // Track best accuracy for this drill
    const drillKey = `${this.currentCategory}_${this.currentIndex}`;
    const prevBest = this.bestAccuracies[drillKey] || 0;
    if (accuracy > prevBest) {
      this.bestAccuracies[drillKey] = accuracy;
    }

    // Update global app stats
    app.recordSpeakingScore(accuracy);
    if (window.goalsManager) {
      window.goalsManager.logActivity('speaking', 30, 'Sentence Drill Practice');
    }
  }

  speakText(text) {
    if (!this.synth) return;
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = parseFloat(localStorage.getItem('fluently_voice_rate') || '0.95');
    if (window.app && typeof window.app.getPreferredVoice === 'function') {
      const voice = window.app.getPreferredVoice();
      if (voice) utterance.voice = voice;
    }
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

    const bars = this.visualizerBars.length;
    const barWidth = width / bars;

    // Smooth interpolation: each bar eases toward a random target
    for (let i = 0; i < bars; i++) {
      const target = Math.random() * (height * 0.85) + 4;
      this.visualizerBars[i] += (target - this.visualizerBars[i]) * 0.18;
      const barHeight = this.visualizerBars[i];
      const x = i * barWidth;
      const y = (height - barHeight) / 2;
      const hue = 230 + (i / bars) * 50; // gradient from indigo to cyan
      const gradient = this.canvasCtx.createLinearGradient(0, y, 0, y + barHeight);
      gradient.addColorStop(0, `hsl(${hue}, 75%, 65%)`);
      gradient.addColorStop(1, `hsl(${hue + 30}, 80%, 55%)`);
      this.canvasCtx.fillStyle = gradient;
      this.canvasCtx.beginPath();
      const radius = Math.min(3, barWidth / 4);
      // Rounded bar
      this.canvasCtx.roundRect(x + 1.5, y, barWidth - 3, barHeight, radius);
      this.canvasCtx.fill();
    }

    requestAnimationFrame(() => this.animateVisualizer());
  }
}

window.speakingStudio = null;
