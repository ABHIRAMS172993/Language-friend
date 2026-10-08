/**
 * FLUENTLY - Writing Lab & Essay Reviewer
 * Integrated with IndexedDB database for persistent notes and analysis history.
 */

class WritingCoach {
  constructor() {
    this.textarea = document.getElementById('writing-input');
    this.wordCountEl = document.getElementById('editor-word-count');
    this.charCountEl = document.getElementById('editor-char-count');
    this.scoreValEl = document.getElementById('writing-score-val');
    this.scoreLabelEl = document.getElementById('writing-grade-label');
    this.metricGrammar = document.getElementById('metric-grammar');
    this.metricSpelling = document.getElementById('metric-spelling');
    this.metricVariety = document.getElementById('metric-variety');
    this.metricVocab = document.getElementById('metric-vocab');
    this.issuesContainer = document.getElementById('issues-container');
    this.countIssuesEl = document.getElementById('count-issues');
    this.spellingContainer = document.getElementById('spelling-container');
    this.countSpellingEl = document.getElementById('count-spelling');
    this.spellingActionBar = document.getElementById('spelling-action-bar');
    this.spellingSummaryText = document.getElementById('spelling-summary-text');
    this.polishedTextContainer = document.getElementById('polished-text-container');
    this.vocabUpgradesContainer = document.getElementById('vocab-upgrades-container');
    this.activePromptBanner = document.getElementById('active-prompt-banner');
    this.activePromptText = document.getElementById('active-prompt-text');

    this.sampleEssays = [
      `Myself Rahul and I passed out from college last year. I did not knew that finding a job will be so hard. When I went for an interview, the manager did not asked many questions. He said everyone are qualified, but we must discuss about new skills. I order for a coffee while waiting. Revert back to me soon with feedback.`,
      `Working from home is very good because it save time and energy. However, their is a big problem when team members are out of station and dont answer quickly. Each of them are doing work in different hours. To make things more better, we must cope up with these new digital tools. It is definately a huge challenge.`,
      `In my opinion, artificial intelligence will effect our daily jobs in a huge way. Some people think it is very bad, but others say it is very important for productivity. We could able to finish routine tasks faster and focus on creative solutions. I am writting this review to share my perspective.`
    ];

    this.prompts = [
      "Explain the biggest challenge you faced when starting your career and how you handled it.",
      "Should companies implement a 4-day work week? Discuss pros and cons.",
      "Write a polite letter to an airline customer service complaining about lost luggage.",
      "Describe a book, movie, or mentor that strongly influenced your mindset.",
      "What are the advantages and drawbacks of social media on young adults' attention spans?"
    ];

    this.currentActiveNoteId = null;
    this.currentSpellingIssues = [];
    this.initEvents();
    this.updateDbBadges();
  }

  initEvents() {
    // Textarea typing live count
    this.textarea.addEventListener('input', () => {
      this.updateCounts();
    });

    // Analyze button
    document.getElementById('btn-analyze-writing').addEventListener('click', () => {
      this.runAnalysis();
    });

    // Quick Spell Check button in toolbar
    const spellCheckQuickBtn = document.getElementById('btn-spell-check-quick');
    if (spellCheckQuickBtn) {
      spellCheckQuickBtn.addEventListener('click', async () => {
        const text = this.textarea.value.trim();
        if (!text) {
          app.showToast('Please type or paste some text first to run a spell check.', 'warning');
          return;
        }
        await this.runAnalysis();
        // Switch to the spelling tab
        this.switchFeedbackTab('spelling');
        if (this.currentSpellingIssues.length === 0) {
          app.showToast('✨ 100% Correct Spelling! No typos found.', 'success');
        } else {
          app.showToast(`Found ${this.currentSpellingIssues.length} spelling mistake(s).`, 'info');
        }
      });
    }

    // Fix All Spelling button
    const fixAllSpellingBtn = document.getElementById('btn-fix-all-spelling');
    if (fixAllSpellingBtn) {
      fixAllSpellingBtn.addEventListener('click', () => {
        this.fixAllSpelling();
      });
    }

    // Sample essay button
    document.getElementById('btn-sample-writing').addEventListener('click', () => {
      const sample = this.sampleEssays[Math.floor(Math.random() * this.sampleEssays.length)];
      this.textarea.value = sample;
      this.updateCounts();
      this.runAnalysis();
      app.showToast('Sample intermediate paragraph loaded!', 'success');
    });

    // Random prompt button
    document.getElementById('btn-writing-prompt').addEventListener('click', () => {
      const p = this.prompts[Math.floor(Math.random() * this.prompts.length)];
      this.loadPrompt(p);
    });

    // Clear editor
    document.getElementById('btn-clear-editor').addEventListener('click', () => {
      this.textarea.value = '';
      this.currentActiveNoteId = null;
      this.updateCounts();
      this.resetFeedback();
    });

    // Save Draft/Note button
    const saveNoteBtn = document.getElementById('btn-save-note');
    if (saveNoteBtn) {
      saveNoteBtn.addEventListener('click', () => {
        this.openSaveNoteModal();
      });
    }

    // Open History & Notes button
    const openHistoryBtn = document.getElementById('btn-open-writing-history');
    if (openHistoryBtn) {
      openHistoryBtn.addEventListener('click', () => {
        this.openHistoryModal('notes');
      });
    }

    // Copy polished text
    document.getElementById('btn-copy-polished').addEventListener('click', () => {
      const text = this.polishedTextContainer.innerText;
      if (text && !text.includes('Polished text will appear here')) {
        navigator.clipboard.writeText(text);
        app.showToast('Polished text copied to clipboard!', 'success');
      }
    });

    // Tone adjustment buttons
    const formalBtn = document.getElementById('btn-tone-formal');
    if (formalBtn) {
      formalBtn.addEventListener('click', () => {
        this.adjustTone('formal');
      });
    }

    const casualBtn = document.getElementById('btn-tone-casual');
    if (casualBtn) {
      casualBtn.addEventListener('click', () => {
        this.adjustTone('casual');
      });
    }

    // Sub tabs inside feedback
    document.querySelectorAll('.fb-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const target = e.currentTarget.getAttribute('data-fbtab');
        this.switchFeedbackTab(target);
      });
    });

    // History Modal Tabs
    document.querySelectorAll('.history-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.history-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.history-tab-pane').forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const tabTarget = e.currentTarget.getAttribute('data-htab');
        const pane = document.getElementById(`htab-pane-${tabTarget}`);
        if (pane) pane.classList.add('active');
      });
    });

    // Close History Modal
    const closeHistModalBtn = document.getElementById('btn-close-history-modal');
    if (closeHistModalBtn) {
      closeHistModalBtn.addEventListener('click', () => {
        document.getElementById('writing-history-modal').style.display = 'none';
      });
    }

    // Close Save Note Modal
    const closeSaveModalBtn = document.getElementById('btn-close-savenote-modal');
    if (closeSaveModalBtn) {
      closeSaveModalBtn.addEventListener('click', () => {
        document.getElementById('save-note-modal').style.display = 'none';
      });
    }

    // Confirm Save Note
    const confirmSaveBtn = document.getElementById('btn-confirm-save-note');
    if (confirmSaveBtn) {
      confirmSaveBtn.addEventListener('click', () => {
        this.handleSaveNoteSubmit();
      });
    }
  }

  adjustTone(tone) {
    let text = this.textarea.value.trim();
    if (!text) {
      app.showToast('Enter some text first to apply tone transformation.', 'warning');
      return;
    }

    if (tone === 'formal') {
      const formalReplacements = [
        [/\bdon't\b/gi, 'do not'],
        [/\bcan't\b/gi, 'cannot'],
        [/\bwon't\b/gi, 'will not'],
        [/\bdidn't\b/gi, 'did not'],
        [/\bisn't\b/gi, 'is not'],
        [/\baren't\b/gi, 'are not'],
        [/\bwasn't\b/gi, 'was not'],
        [/\bweren't\b/gi, 'were not'],
        [/\bI'm\b/gi, 'I am'],
        [/\bwe're\b/gi, 'we are'],
        [/\bthey're\b/gi, 'they are'],
        [/\byou're\b/gi, 'you are'],
        [/\bgonna\b/gi, 'going to'],
        [/\bwanna\b/gi, 'wish to'],
        [/\bkids\b/gi, 'children'],
        [/\blot of\b/gi, 'substantial number of'],
        [/\bget\b/gi, 'obtain'],
        [/\bso\b/gi, 'consequently'],
        [/\babout\b/gi, 'regarding']
      ];
      formalReplacements.forEach(([reg, rep]) => {
        text = text.replace(reg, rep);
      });
      this.textarea.value = text;
      this.updateCounts();
      this.runAnalysis();
      app.showToast('Applied Professional C1 Business tone!', 'success');
    } else if (tone === 'casual') {
      const casualReplacements = [
        [/\bdo not\b/gi, "don't"],
        [/\bcannot\b/gi, "can't"],
        [/\bwill not\b/gi, "won't"],
        [/\bdid not\b/gi, "didn't"],
        [/\bis not\b/gi, "isn't"],
        [/\bare not\b/gi, "aren't"],
        [/\bI am\b/gi, "I'm"],
        [/\bwe are\b/gi, "we're"],
        [/\bthey are\b/gi, "they're"],
        [/\bconsequently\b/gi, "so"],
        [/\bfurthermore\b/gi, "also"],
        [/\bparamount\b/gi, "super important"],
        [/\bexceptional\b/gi, "really great"]
      ];
      casualReplacements.forEach(([reg, rep]) => {
        text = text.replace(reg, rep);
      });
      this.textarea.value = text;
      this.updateCounts();
      this.runAnalysis();
      app.showToast('Applied Relaxed Casual Conversational tone!', 'success');
    }
  }

  switchFeedbackTab(target) {
    document.querySelectorAll('.fb-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.fb-pane').forEach(p => p.classList.remove('active'));
    
    const activeTab = document.querySelector(`.fb-tab[data-fbtab="${target}"]`);
    if (activeTab) activeTab.classList.add('active');

    const pane = document.getElementById(`fb-pane-${target}`);
    if (pane) pane.classList.add('active');
  }

  loadPrompt(promptText) {
    this.activePromptText.innerText = promptText;
    this.activePromptBanner.style.display = 'flex';
    app.switchTab('writing');
    this.textarea.focus();
    app.showToast('New writing prompt loaded! Start typing your answer.', 'success');
  }

  updateCounts() {
    const val = this.textarea.value.trim();
    const words = val.length ? val.split(/\s+/).filter(Boolean).length : 0;
    this.wordCountEl.innerText = words;
    this.charCountEl.innerText = this.textarea.value.length;
  }

  async runAnalysis() {
    const text = this.textarea.value.trim();
    if (!text) {
      app.showToast('Please type some text before analyzing.', 'error');
      return;
    }

    // Show loading state
    this.scoreLabelEl.innerText = "Analyzing grammar, spelling & style...";
    this.scoreValEl.innerText = "..";

    let result = null;
    try {
      result = await window.aiService.getWritingCritique(text);

      // Update Scores
      this.scoreValEl.innerText = result.score !== undefined ? result.score : '--';
      this.scoreLabelEl.innerText = result.gradeLabel || 'Analyzed';
      this.metricGrammar.innerText = result.metrics?.grammar || '--';
      if (this.metricSpelling) this.metricSpelling.innerText = result.metrics?.spelling || '100%';
      this.metricVariety.innerText = result.metrics?.variety || '--';
      this.metricVocab.innerText = result.metrics?.vocab || '--';

      // Separate Spelling Issues vs All Issues
      const issueList = result.issues || [];
      const spellingIssues = issueList.filter(i => 
        (i.type && (
          i.type.toLowerCase().includes('spell') || 
          i.type.toLowerCase().includes('typo') || 
          i.type.toLowerCase().includes('homophone')
        ))
      );
      this.currentSpellingIssues = spellingIssues;

      this.countIssuesEl.innerText = issueList.length;
      if (this.countSpellingEl) this.countSpellingEl.innerText = spellingIssues.length;

      this.renderIssues(issueList);
      this.renderSpellingIssues(spellingIssues);

      // Render Polished Text
      this.polishedTextContainer.innerHTML = `<p>${result.polishedText || 'No modifications needed! Excellent flow.'}</p>`;

      // Render Vocab Upgrades
      this.renderVocabUpgrades(result.vocabSuggestions || []);

      // Track total words
      app.incrementStats(result.wordCount || 0);
      app.showToast(`Analysis complete! Detected ${issueList.length} improvements (${spellingIssues.length} spelling).`, 'success');
    } catch (err) {
      console.error('Analysis error:', err);
      result = window.analyzer.analyze(text);
      this.scoreValEl.innerText = result.score;
      this.scoreLabelEl.innerText = result.gradeLabel;
      this.metricGrammar.innerText = result.metrics.grammar;
      if (this.metricSpelling) this.metricSpelling.innerText = result.metrics.spelling || '100%';
      this.metricVariety.innerText = result.metrics.variety;
      this.metricVocab.innerText = result.metrics.vocab;

      const issueList = result.issues || [];
      const spellingIssues = result.spellingIssues || issueList.filter(i => 
        i.type && (i.type.toLowerCase().includes('spell') || i.type.toLowerCase().includes('typo') || i.type.toLowerCase().includes('homophone'))
      );
      this.currentSpellingIssues = spellingIssues;

      this.countIssuesEl.innerText = issueList.length;
      if (this.countSpellingEl) this.countSpellingEl.innerText = spellingIssues.length;

      this.renderIssues(issueList);
      this.renderSpellingIssues(spellingIssues);
      this.polishedTextContainer.innerHTML = `<p>${result.polishedText}</p>`;
      this.renderVocabUpgrades(result.vocabSuggestions);
      app.showToast('Analysis completed using local grammar & spelling engine.', 'info');
    }

    // Save to Database (IndexedDB)
    if (result && window.fluentlyDB) {
      try {
        const promptTitle = (this.activePromptBanner.style.display !== 'none') ? this.activePromptText.innerText : '';
        await window.fluentlyDB.saveReview({
          title: promptTitle ? `Prompt: ${promptTitle.slice(0, 40)}...` : undefined,
          originalText: text,
          polishedText: result.polishedText || '',
          score: result.score,
          gradeLabel: result.gradeLabel,
          metrics: result.metrics,
          issues: result.issues || [],
          spellingCount: this.currentSpellingIssues.length,
          vocabSuggestions: result.vocabSuggestions || [],
          wordCount: text.split(/\s+/).filter(Boolean).length
        });
        this.updateDbBadges();
      } catch (dbErr) {
        console.warn('Database review save error:', dbErr);
      }
    }
  }

  renderIssues(issues) {
    if (!issues || issues.length === 0) {
      this.issuesContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🎉</div>
          <h3>Clean & Accurate Grammar!</h3>
          <p>No major structural or grammatical errors found. Great intermediate writing!</p>
        </div>`;
      return;
    }

    let html = '';
    issues.forEach((issue) => {
      const fixTarget = issue.replacement.split(' / ')[0].replace(/\$[0-9]/g, '').trim();
      const isSpelling = issue.type && (
        issue.type.toLowerCase().includes('spell') || 
        issue.type.toLowerCase().includes('typo') || 
        issue.type.toLowerCase().includes('homophone')
      );
      
      html += `
        <div class="issue-item ${isSpelling ? 'spelling' : (issue.severity === 'warning' ? 'warning' : '')}">
          <div class="issue-header">
            <span class="issue-type">${isSpelling ? '🔤 ' : ''}${issue.type}</span>
          </div>
          <div>
            <span class="issue-bad">"${issue.matched}"</span> &rarr;
            <span class="issue-suggestion">"${issue.replacement}"</span>
          </div>
          <p class="issue-explanation">${issue.explanation}</p>
          <button class="btn-apply-fix" onclick="writingCoach.applyFix('${encodeURIComponent(issue.matched)}', '${encodeURIComponent(fixTarget)}')">
            ⚡ Apply Correction
          </button>
        </div>
      `;
    });
    this.issuesContainer.innerHTML = html;
  }

  renderSpellingIssues(spellingIssues) {
    if (!this.spellingContainer) return;

    if (!spellingIssues || spellingIssues.length === 0) {
      if (this.spellingActionBar) this.spellingActionBar.style.display = 'none';
      this.spellingContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">✨</div>
          <h3>100% Flawless Spelling!</h3>
          <p>Zero spelling mistakes, typos, or double-consonant errors detected in your text.</p>
        </div>`;
      return;
    }

    if (this.spellingActionBar) {
      this.spellingActionBar.style.display = 'flex';
      if (this.spellingSummaryText) {
        this.spellingSummaryText.innerText = `${spellingIssues.length} spelling & typo ${spellingIssues.length === 1 ? 'error' : 'errors'} found`;
      }
    }

    let html = '';
    spellingIssues.forEach((issue) => {
      const fixTarget = issue.replacement.split(' / ')[0].replace(/\$[0-9]/g, '').trim();
      html += `
        <div class="issue-item spelling">
          <div class="issue-header">
            <span class="issue-type">🔤 ${issue.type}</span>
          </div>
          <div class="spelling-comparison">
            <span class="issue-bad">"${issue.matched}"</span>
            <span class="spelling-arrow">&rarr;</span>
            <span class="issue-suggestion">"${issue.replacement}"</span>
          </div>
          <p class="issue-explanation">${issue.explanation}</p>
          <button class="btn-apply-fix" onclick="writingCoach.applyFix('${encodeURIComponent(issue.matched)}', '${encodeURIComponent(fixTarget)}')">
            ⚡ Apply Fix: "${fixTarget}"
          </button>
        </div>
      `;
    });
    this.spellingContainer.innerHTML = html;
  }

  fixAllSpelling() {
    if (!this.currentSpellingIssues || this.currentSpellingIssues.length === 0) {
      app.showToast('No spelling errors to fix.', 'info');
      return;
    }

    let text = this.textarea.value;
    let fixCount = 0;

    // Sort by matched string length descending to avoid partial substring corruption
    const sortedIssues = [...this.currentSpellingIssues].sort((a, b) => (b.matched.length - a.matched.length));

    sortedIssues.forEach(issue => {
      const fixTarget = issue.replacement.split(' / ')[0].replace(/\$[0-9]/g, '').trim();
      if (fixTarget && fixTarget !== 'Correction needed') {
        const escaped = issue.matched.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const reg = new RegExp(`\\b${escaped}\\b`, 'gi');
        if (reg.test(text)) {
          text = text.replace(reg, fixTarget);
          fixCount++;
        } else {
          // Fallback if matched with punctuation
          const directReg = new RegExp(escaped, 'i');
          if (directReg.test(text)) {
            text = text.replace(directReg, fixTarget);
            fixCount++;
          }
        }
      }
    });

    this.textarea.value = text;
    this.updateCounts();
    this.runAnalysis();
    app.showToast(`Applied ${fixCount} spelling corrections in one click!`, 'success');
  }

  renderVocabUpgrades(vocabSuggestions) {
    if (!vocabSuggestions || vocabSuggestions.length === 0) {
      this.vocabUpgradesContainer.innerHTML = `<p class="text-muted">No repetitive basic words found. Your vocabulary variety is solid.</p>`;
      return;
    }

    let html = '';
    vocabSuggestions.forEach(item => {
      html += `
        <div class="vocab-upgrade-item">
          <div class="vocab-original">Basic: <strong>"${item.original}"</strong></div>
          <div class="vocab-arrow">&rarr;</div>
          <div class="vocab-enhanced">C1 Choice: <strong>"${item.suggested}"</strong></div>
        </div>
      `;
    });
    this.vocabUpgradesContainer.innerHTML = html;
  }

  applyFix(encodedMatch, encodedReplacement) {
    const match = decodeURIComponent(encodedMatch);
    const replacement = decodeURIComponent(encodedReplacement);
    const escaped = match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    this.textarea.value = this.textarea.value.replace(new RegExp(escaped, 'i'), replacement);
    this.updateCounts();
    this.runAnalysis();
    app.showToast(`Applied fix: "${replacement}"`, 'success');
  }

  resetFeedback() {
    this.scoreValEl.innerText = '--';
    this.scoreLabelEl.innerText = 'Ready to analyze';
    this.metricGrammar.innerText = '--';
    if (this.metricSpelling) this.metricSpelling.innerText = '--';
    this.metricVariety.innerText = '--';
    this.metricVocab.innerText = '--';
    this.countIssuesEl.innerText = '0';
    if (this.countSpellingEl) this.countSpellingEl.innerText = '0';
    this.currentSpellingIssues = [];
    if (this.spellingActionBar) this.spellingActionBar.style.display = 'none';
    this.issuesContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <p>Type your paragraph on the left and click <strong>"Analyze & Correct"</strong>.</p>
      </div>`;
    if (this.spellingContainer) {
      this.spellingContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔤</div>
          <p>Click <strong>"Analyze & Correct"</strong> or <strong>"Spell Check"</strong> to inspect word spellings and typos.</p>
        </div>`;
    }
    this.polishedTextContainer.innerHTML = `<p class="text-muted">Polished text will appear here once analyzed.</p>`;
    this.vocabUpgradesContainer.innerHTML = `<p class="text-muted">High-impact synonym upgrades will be shown here.</p>`;
  }

  // ==========================================
  // DATABASE NOTES & HISTORY MODAL
  // ==========================================

  openSaveNoteModal() {
    const text = this.textarea.value.trim();
    if (!text) {
      app.showToast('Please type some text before saving as a note or draft.', 'warning');
      return;
    }

    const modal = document.getElementById('save-note-modal');
    const titleInput = document.getElementById('save-note-title');
    const tagInput = document.getElementById('save-note-tag');
    const previewEl = document.getElementById('save-note-preview');

    if (!titleInput.value) {
      const firstLine = text.split('\n')[0].slice(0, 35);
      titleInput.value = firstLine.length > 3 ? firstLine : 'Draft - ' + new Date().toLocaleDateString();
    }
    previewEl.innerText = text.slice(0, 180) + (text.length > 180 ? '...' : '');

    modal.style.display = 'flex';
  }

  async handleSaveNoteSubmit() {
    const title = document.getElementById('save-note-title').value.trim() || 'Untitled Note';
    const tag = document.getElementById('save-note-tag').value.trim();
    const content = this.textarea.value.trim();

    if (!content) {
      app.showToast('Note content cannot be empty.', 'error');
      return;
    }

    try {
      await window.fluentlyDB.saveNote({
        id: this.currentActiveNoteId,
        title,
        content,
        tags: tag ? [tag] : ['Writing Lab']
      });

      document.getElementById('save-note-modal').style.display = 'none';
      app.showToast(`Note "${title}" saved to database!`, 'success');
      this.updateDbBadges();
    } catch (e) {
      console.error(e);
      app.showToast('Failed to save note to database.', 'error');
    }
  }

  async openHistoryModal(defaultTab = 'notes') {
    const modal = document.getElementById('writing-history-modal');
    modal.style.display = 'flex';

    // Switch tab
    document.querySelectorAll('.history-tab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-htab') === defaultTab);
    });
    document.querySelectorAll('.history-tab-pane').forEach(p => {
      p.classList.toggle('active', p.id === `htab-pane-${defaultTab}`);
    });

    await this.renderSavedNotesList();
    await this.renderReviewsHistoryList();
  }

  async renderSavedNotesList() {
    const container = document.getElementById('notes-history-list');
    if (!container) return;

    try {
      const notes = await window.fluentlyDB.getNotes();
      if (notes.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">📒</div>
            <h3>No Saved Notes Yet</h3>
            <p>Write an essay or draft in Writing Lab and click <strong>"Save Note"</strong> to store it here.</p>
          </div>
        `;
        return;
      }

      let html = '';
      notes.forEach(note => {
        const dateStr = new Date(note.updatedAt || note.createdAt).toLocaleString();
        const wordCount = note.content ? note.content.split(/\s+/).filter(Boolean).length : 0;
        const tag = (note.tags && note.tags[0]) || 'Draft';

        html += `
          <div class="history-item-card">
            <div class="history-card-top">
              <div class="history-title-area">
                <h4>${this.escapeHtml(note.title)}</h4>
                <div class="history-meta">
                  <span class="history-tag">${this.escapeHtml(tag)}</span>
                  <span>${wordCount} words</span>
                  <span>•</span>
                  <span>${dateStr}</span>
                </div>
              </div>
              <div class="history-actions">
                <button class="btn btn-sm btn-primary" onclick="writingCoach.loadNoteIntoEditor('${note.id}')">📝 Open in Editor</button>
                <button class="btn btn-sm btn-danger" onclick="writingCoach.deleteNote('${note.id}')">🗑️</button>
              </div>
            </div>
            <div class="history-snippet">${this.escapeHtml(note.content)}</div>
          </div>
        `;
      });
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<p class="text-danger">Failed to load notes: ${err.message}</p>`;
    }
  }

  async renderReviewsHistoryList() {
    const container = document.getElementById('reviews-history-list');
    if (!container) return;

    try {
      const reviews = await window.fluentlyDB.getReviews();
      if (reviews.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">📊</div>
            <h3>No Review History Yet</h3>
            <p>Every time you click <strong>"Analyze & Correct"</strong>, your score, identified issues, and polished version will be saved here.</p>
          </div>
        `;
        return;
      }

      let html = '';
      reviews.forEach(rev => {
        const dateStr = new Date(rev.timestamp).toLocaleString();
        const scoreVal = rev.score !== null ? `${rev.score}/100` : '--';
        const issuesCount = rev.issues ? rev.issues.length : 0;

        html += `
          <div class="history-item-card">
            <div class="history-card-top">
              <div class="history-title-area">
                <h4>${this.escapeHtml(rev.title)}</h4>
                <div class="history-meta">
                  <span class="history-score-badge">Score: ${scoreVal} (${rev.gradeLabel || 'Evaluated'})</span>
                  <span class="history-issues-badge">${issuesCount} corrections${rev.spellingCount ? ` (${rev.spellingCount} spelling)` : ''}</span>
                  <span>•</span>
                  <span>${dateStr}</span>
                </div>
              </div>
              <div class="history-actions">
                <button class="btn btn-sm btn-outline" onclick="writingCoach.loadReviewIntoEditor('${rev.id}')">✏️ Reload Text</button>
                <button class="btn btn-sm btn-danger" onclick="writingCoach.deleteReview('${rev.id}')">🗑️</button>
              </div>
            </div>

            <div class="history-review-diff">
              <div class="diff-block">
                <strong>Original:</strong>
                <p>${this.escapeHtml(rev.originalText)}</p>
              </div>
              ${rev.polishedText ? `
                <div class="diff-block polished">
                  <strong>Polished C1:</strong>
                  <p>${this.escapeHtml(rev.polishedText)}</p>
                </div>
              ` : ''}
            </div>

            <div class="history-note-field">
              <label>Personal Learning Note:</label>
              <div class="note-edit-row">
                <input type="text" id="rev-note-${rev.id}" value="${this.escapeHtml(rev.userNote || '')}" placeholder="Add a key takeaway (e.g., 'Remember past perfect tense')..." class="text-input-sm">
                <button class="btn btn-sm btn-outline" onclick="writingCoach.saveReviewNote('${rev.id}')">Save Note</button>
              </div>
            </div>
          </div>
        `;
      });
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<p class="text-danger">Failed to load reviews: ${err.message}</p>`;
    }
  }

  async loadNoteIntoEditor(id) {
    const notes = await window.fluentlyDB.getNotes();
    const note = notes.find(n => n.id === id);
    if (!note) return;

    this.textarea.value = note.content;
    this.currentActiveNoteId = note.id;
    this.updateCounts();
    document.getElementById('writing-history-modal').style.display = 'none';
    app.switchTab('writing');
    app.showToast(`Loaded note "${note.title}" into editor.`, 'success');
  }

  async deleteNote(id) {
    if (!confirm('Are you sure you want to delete this saved note?')) return;
    await window.fluentlyDB.deleteNote(id);
    app.showToast('Note deleted from database.', 'info');
    this.renderSavedNotesList();
    this.updateDbBadges();
  }

  async loadReviewIntoEditor(id) {
    const reviews = await window.fluentlyDB.getReviews();
    const rev = reviews.find(r => r.id === id);
    if (!rev) return;

    this.textarea.value = rev.originalText;
    this.currentActiveNoteId = null;
    this.updateCounts();
    document.getElementById('writing-history-modal').style.display = 'none';
    app.switchTab('writing');
    this.runAnalysis();
    app.showToast('Loaded past review into editor and analyzed.', 'success');
  }

  async saveReviewNote(id) {
    const input = document.getElementById(`rev-note-${id}`);
    if (!input) return;
    await window.fluentlyDB.updateReviewNotes(id, input.value.trim());
    app.showToast('Personal learning note updated in database!', 'success');
  }

  async deleteReview(id) {
    if (!confirm('Are you sure you want to delete this grammar review from history?')) return;
    await window.fluentlyDB.deleteReview(id);
    app.showToast('Review deleted from database.', 'info');
    this.renderReviewsHistoryList();
    this.updateDbBadges();
  }

  async updateDbBadges() {
    if (!window.fluentlyDB) return;
    try {
      const stats = await window.fluentlyDB.getDatabaseStats();
      const badge = document.getElementById('badge-writing-notes-count');
      if (badge) {
        badge.innerText = stats.notesCount + stats.reviewsCount;
        badge.style.display = (stats.notesCount + stats.reviewsCount > 0) ? 'inline-block' : 'none';
      }
    } catch (e) {}
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

window.writingCoach = null;
