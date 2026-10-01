/**
 * FLUENTLY - Writing Lab & Essay Reviewer
 */

class WritingCoach {
  constructor() {
    this.textarea = document.getElementById('writing-input');
    this.wordCountEl = document.getElementById('editor-word-count');
    this.charCountEl = document.getElementById('editor-char-count');
    this.scoreValEl = document.getElementById('writing-score-val');
    this.scoreLabelEl = document.getElementById('writing-grade-label');
    this.metricGrammar = document.getElementById('metric-grammar');
    this.metricVariety = document.getElementById('metric-variety');
    this.metricVocab = document.getElementById('metric-vocab');
    this.issuesContainer = document.getElementById('issues-container');
    this.countIssuesEl = document.getElementById('count-issues');
    this.polishedTextContainer = document.getElementById('polished-text-container');
    this.vocabUpgradesContainer = document.getElementById('vocab-upgrades-container');
    this.activePromptBanner = document.getElementById('active-prompt-banner');
    this.activePromptText = document.getElementById('active-prompt-text');

    this.sampleEssays = [
      `Myself Rahul and I passed out from college last year. I did not knew that finding a job will be so hard. When I went for an interview, the manager did not asked many questions. He said everyone are qualified, but we must discuss about new skills. I order for a coffee while waiting. Revert back to me soon with feedback.`,
      `Working from home is very good because it save time and energy. However, their is a big problem when team members are out of station and dont answer quickly. Each of them are doing work in different hours. To make things more better, we must cope up with these new digital tools.`,
      `In my opinion, artificial intelligence will effect our daily jobs in a huge way. Some people think it is very bad, but others say it is very important for productivity. We could able to finish routine tasks faster and focus on creative solutions.`
    ];

    this.prompts = [
      "Explain the biggest challenge you faced when starting your career and how you handled it.",
      "Should companies implement a 4-day work week? Discuss pros and cons.",
      "Write a polite letter to an airline customer service complaining about lost luggage.",
      "Describe a book, movie, or mentor that strongly influenced your mindset.",
      "What are the advantages and drawbacks of social media on young adults' attention spans?"
    ];

    this.initEvents();
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
      this.updateCounts();
      this.resetFeedback();
    });

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
        document.querySelectorAll('.fb-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.fb-pane').forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const target = e.currentTarget.getAttribute('data-fbtab');
        const pane = document.getElementById(`fb-pane-${target}`);
        if (pane) pane.classList.add('active');
      });
    });
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

  loadPrompt(promptText) {
    this.activePromptText.innerText = promptText;
    this.activePromptBanner.style.display = 'flex';
    app.switchTab('writing');
    this.textarea.focus();
    app.showToast('New writing prompt loaded! Start typing your answer.', 'success');
  }

  updateCounts() {
    const val = this.textarea.value.trim();
    const words = val.length ? val.split(/\s+/).length : 0;
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
    this.scoreLabelEl.innerText = "Analyzing grammar & style...";
    this.scoreValEl.innerText = "..";

    const result = await window.aiService.getWritingCritique(text);

    // Update Scores
    this.scoreValEl.innerText = result.score;
    this.scoreLabelEl.innerText = result.gradeLabel;
    this.metricGrammar.innerText = result.metrics.grammar;
    this.metricVariety.innerText = result.metrics.variety;
    this.metricVocab.innerText = result.metrics.vocab;

    // Render Issues List
    this.countIssuesEl.innerText = result.issues.length;
    this.renderIssues(result.issues);

    // Render Polished Text
    this.polishedTextContainer.innerHTML = `<p>${result.polishedText || 'No modifications needed! Excellent flow.'}</p>`;

    // Render Vocab Upgrades
    this.renderVocabUpgrades(result.vocabSuggestions);

    // Track total words
    app.incrementStats(result.wordCount);
    app.showToast(`Analysis complete! Detected ${result.issues.length} potential improvements.`, 'success');
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
    issues.forEach((issue, idx) => {
      const fixTarget = issue.replacement.split(' / ')[0].replace('$1', '').replace('$2', '').trim();
      html += `
        <div class="issue-item ${issue.severity === 'warning' ? 'warning' : ''}">
          <div class="issue-header">
            <span class="issue-type">${issue.type}</span>
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
    this.textarea.value = this.textarea.value.replace(new RegExp(match, 'i'), replacement);
    this.updateCounts();
    this.runAnalysis();
    app.showToast(`Applied fix: "${replacement}"`, 'success');
  }

  resetFeedback() {
    this.scoreValEl.innerText = '--';
    this.scoreLabelEl.innerText = 'Ready to analyze';
    this.metricGrammar.innerText = '--';
    this.metricVariety.innerText = '--';
    this.metricVocab.innerText = '--';
    this.countIssuesEl.innerText = '0';
    this.issuesContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <p>Type your paragraph on the left and click <strong>"Analyze & Correct"</strong>.</p>
      </div>`;
    this.polishedTextContainer.innerHTML = `<p class="text-muted">Polished text will appear here once analyzed.</p>`;
    this.vocabUpgradesContainer.innerHTML = `<p class="text-muted">High-impact synonym upgrades will be shown here.</p>`;
  }
}

window.writingCoach = null;
