/**
 * FLUENTLY - Main Application Controller
 * Handles tabs, settings, dark/light theme, stats storage, and vocabulary matrices.
 */

class FluentlyApp {
  constructor() {
    this.currentTab = 'dashboard';
    this.totalWords = parseInt(localStorage.getItem('fluently_total_words') || '1480');
    this.speakingScores = JSON.parse(localStorage.getItem('fluently_speaking_scores') || '[90, 92, 88, 94]');
    this.theme = localStorage.getItem('fluently_theme') || 'dark';

    this.vocabData = [
      {
        basic: "Very good / Great",
        advanced: "Exceptional / Exemplary",
        ipa: "/ɪkˈzɛp.ʃən.əl/",
        def: "Unusually good; outstanding.",
        example: "The engineering team delivered an exceptional product ahead of the deadline."
      },
      {
        basic: "Very bad",
        advanced: "Detrimental / Subpar",
        ipa: "/ˌdɛt.rɪˈmɛn.təl/",
        def: "Tending to cause harm or damage.",
        example: "Smoking is unquestionably detrimental to long-term health."
      },
      {
        basic: "Very important",
        advanced: "Paramount / Pivotal",
        ipa: "/ˈpær.ə.maʊnt/",
        def: "Of supreme urgency or significance.",
        example: "Maintaining user data privacy is paramount to our company ethos."
      },
      {
        basic: "Hard / Difficult",
        advanced: "Arduous / Demanding",
        ipa: "/ˈɑː.dju.əs/",
        def: "Involving or requiring strenuous effort; tiring.",
        example: "Mastering a second language is an arduous but deeply rewarding journey."
      },
      {
        basic: "Problem",
        advanced: "Impediment / Hurdle",
        ipa: "/ɪmˈpɛd.ɪ.mənt/",
        def: "A hindrance or obstruction in doing something.",
        example: "A lack of seed capital was the primary impediment to their expansion."
      },
      {
        basic: "Help / Support",
        advanced: "Facilitate / Assist",
        ipa: "/fəˈsɪl.ɪ.teɪt/",
        def: "Make an action or process easy or easier.",
        example: "Our modern software tools facilitate seamless global collaboration."
      },
      {
        basic: "Show / Prove",
        advanced: "Exemplify / Demonstrate",
        ipa: "/ɪɡˈzɛm.plɪ.faɪ/",
        def: "Be a typical or prime example of something.",
        example: "Her prompt response exemplified true professional dedication."
      },
      {
        basic: "Change",
        advanced: "Metamorphose / Adapt",
        ipa: "/əˈdæpt/",
        def: "Adjust to new conditions or modify fundamentally.",
        example: "Agile businesses quickly adapt to unpredictable market fluctuations."
      }
    ];

    this.init();
  }

  init() {
    this.applyTheme(this.theme);
    this.initNavigation();
    this.initSettingsModal();
    this.initVocabMatrix();
    this.updateStatsUI();

    // Initialize module controllers once DOM is loaded
    window.writingCoach = new WritingCoach();
    window.speakingStudio = new SpeakingStudio();
    window.readingLounge = new ReadingLounge();
    window.dialoguePartner = new DialoguePartner();
  }

  initNavigation() {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      this.applyTheme(this.theme);
    });
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    // Update active nav button
    document.querySelectorAll('.nav-item').forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update active pane
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('active');
    });

    const targetPane = document.getElementById(`pane-${tabId}`);
    if (targetPane) {
      targetPane.classList.add('active');
    }
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fluently_theme', theme);
    document.getElementById('theme-toggle').innerText = theme === 'dark' ? '🌙' : '☀️';
  }

  initSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const openBtn = document.getElementById('btn-open-settings');
    const closeBtn = document.getElementById('btn-close-modal');
    const engineSelect = document.getElementById('ai-engine-select');
    const geminiGroup = document.getElementById('gemini-key-group');
    const geminiKeyInput = document.getElementById('gemini-api-key');
    const voiceRateRange = document.getElementById('voice-rate-range');
    const voiceRateLabel = document.getElementById('voice-rate-label');
    const saveBtn = document.getElementById('btn-save-settings');

    // Populate initial values
    geminiKeyInput.value = window.aiService.apiKey || '';
    engineSelect.value = window.aiService.engine || 'smart-local';
    geminiGroup.style.display = engineSelect.value === 'gemini' ? 'flex' : 'none';

    openBtn.addEventListener('click', () => {
      modal.style.display = 'flex';
      this.populateVoiceSelect();
      this.populateDatabaseInfo();
    });

    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });

    engineSelect.addEventListener('change', (e) => {
      geminiGroup.style.display = e.target.value === 'gemini' ? 'flex' : 'none';
    });

    voiceRateRange.addEventListener('input', (e) => {
      voiceRateLabel.innerText = `${e.target.value}x`;
    });

    saveBtn.addEventListener('click', () => {
      window.aiService.setEngine(engineSelect.value);
      window.aiService.setApiKey(geminiKeyInput.value);
      localStorage.setItem('fluently_voice_rate', voiceRateRange.value);
      modal.style.display = 'none';
      this.showToast('Settings successfully saved!', 'success');
    });

    // Database Export
    const exportDbBtn = document.getElementById('btn-export-db');
    if (exportDbBtn) {
      exportDbBtn.addEventListener('click', async () => {
        if (!window.fluentlyDB) return;
        try {
          const exportData = await window.fluentlyDB.exportAllData();
          const jsonStr = JSON.stringify(exportData, null, 2);
          const blob = new Blob([jsonStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `fluently_data_backup_${new Date().toISOString().slice(0, 10)}.json`;
          a.click();
          URL.revokeObjectURL(url);
          this.showToast('Database successfully exported to JSON!', 'success');
        } catch (err) {
          this.showToast('Export failed: ' + err.message, 'error');
        }
      });
    }

    // Database Clear
    const clearDbBtn = document.getElementById('btn-clear-db');
    if (clearDbBtn) {
      clearDbBtn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to clear all stored chat messages, notes, and grammar review history from IndexedDB?')) return;
        if (!window.fluentlyDB) return;
        try {
          await window.fluentlyDB.clearAllData();
          if (window.writingCoach) {
            window.writingCoach.updateDbBadges();
          }
          this.populateDatabaseInfo();
          this.showToast('Database wiped clean.', 'info');
        } catch (err) {
          this.showToast('Clear failed: ' + err.message, 'error');
        }
      });
    }

    document.getElementById('btn-reset-stats').addEventListener('click', () => {
      this.totalWords = 0;
      this.speakingScores = [85];
      localStorage.setItem('fluently_total_words', '0');
      localStorage.setItem('fluently_speaking_scores', JSON.stringify([85]));
      this.updateStatsUI();
      modal.style.display = 'none';
      this.showToast('Daily stats reset.', 'info');
    });
  }

  async populateDatabaseInfo() {
    const dbStatusEl = document.getElementById('db-status-label');
    const dbCountEl = document.getElementById('db-records-count');
    if (!window.fluentlyDB || !dbStatusEl) return;

    try {
      const stats = await window.fluentlyDB.getDatabaseStats();
      dbStatusEl.innerHTML = `<span style="color:var(--accent-success); font-weight:700;">🟢 Connected (IndexedDB)</span>`;
      if (dbCountEl) {
        dbCountEl.innerText = `${stats.chatCount} chats · ${stats.notesCount} notes · ${stats.reviewsCount} reviews`;
      }
    } catch (e) {
      dbStatusEl.innerText = '🔴 Disconnected';
    }
  }

  populateVoiceSelect() {
    const voiceSelect = document.getElementById('target-accent-select');
    if (!window.speechSynthesis) return;

    const voices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
    if (voices.length > 0) {
      voiceSelect.innerHTML = voices.map(v => `<option value="${v.name}">${v.name} (${v.lang})</option>`).join('');
    } else {
      voiceSelect.innerHTML = `<option value="default">Default System English Voice</option>`;
    }
  }

  initVocabMatrix() {
    const container = document.getElementById('vocab-cards-grid');
    const searchInput = document.getElementById('vocab-search-input');

    const render = (query = '') => {
      const filtered = this.vocabData.filter(item =>
        item.basic.toLowerCase().includes(query.toLowerCase()) ||
        item.advanced.toLowerCase().includes(query.toLowerCase()) ||
        item.def.toLowerCase().includes(query.toLowerCase())
      );

      let html = '';
      filtered.forEach(item => {
        html += `
          <div class="vocab-card">
            <div class="vocab-card-header">
              <span class="basic-word-tag">Replace: ${item.basic}</span>
              <button class="tool-btn" onclick="app.pronounce('${item.advanced.split(' / ')[0]}')">🔊</button>
            </div>
            <div class="adv-term">${item.advanced}</div>
            <div style="font-size:0.78rem; color:var(--accent-secondary); font-family:monospace;">${item.ipa}</div>
            <p class="vocab-definition">${item.def}</p>
            <div class="vocab-example-quote">"${item.example}"</div>
          </div>
        `;
      });
      container.innerHTML = html;
    };

    render();

    searchInput.addEventListener('input', (e) => {
      render(e.target.value);
    });
  }

  pronounce(word) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  }

  incrementStats(words) {
    this.totalWords += words;
    localStorage.setItem('fluently_total_words', this.totalWords.toString());
    this.updateStatsUI();
  }

  recordSpeakingScore(score) {
    this.speakingScores.push(score);
    if (this.speakingScores.length > 10) this.speakingScores.shift();
    localStorage.setItem('fluently_speaking_scores', JSON.stringify(this.speakingScores));
    this.updateStatsUI();
  }

  updateStatsUI() {
    const totalWordsEl = document.getElementById('total-words-stat');
    if (totalWordsEl) totalWordsEl.innerText = this.totalWords.toLocaleString();
    const avg = Math.round(this.speakingScores.reduce((a, b) => a + b, 0) / this.speakingScores.length);
    const avgEl = document.getElementById('avg-speaking-stat');
    if (avgEl) avgEl.innerText = `${avg}%`;

    // Dynamic radar progress bars
    const speakingVal = document.getElementById('meter-val-speaking');
    const speakingBar = document.getElementById('meter-bar-speaking');
    if (speakingVal) speakingVal.innerText = `${avg}%`;
    if (speakingBar) speakingBar.style.width = `${avg}%`;

    const structurePct = Math.min(96, Math.max(65, 75 + Math.floor(this.totalWords / 200)));
    const structVal = document.getElementById('meter-val-structure');
    const structBar = document.getElementById('meter-bar-structure');
    if (structVal) structVal.innerText = `${structurePct}%`;
    if (structBar) structBar.style.width = `${structurePct}%`;
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;

    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3500);
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new FluentlyApp();
});
