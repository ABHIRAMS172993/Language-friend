/**
 * FLUENTLY - Reading Lounge & Interactive Comprehension
 */

class ReadingLounge {
  constructor() {
    this.articles = [
      {
        id: 'habits',
        title: "The Science of Habit Formation: Rewiring Your Daily Routines",
        category: "psychology",
        level: "B2 Upper-Intermediate",
        readTime: "3 min read",
        excerpt: "Discover the neural feedback loop behind morning habits and how small 1% adjustments compound into life-altering transformations.",
        content: `Every single day, approximately forty percent of the actions you execute are not deliberate decisions, but deeply ingrained habits. Neurologists call this mechanism the habit loop, which consists of three distinct components: the cue, the routine, and the reward.

When an individual attempts to eliminate a detrimental habit, the most effective strategy is not to suppress the impulse entirely, but rather to substitute the middle routine. For instance, if stress acts as your primary cue, replacing mindless social media scrolling with a five-minute brisk walk preserves the psychological relief without the associated burnout.

Furthermore, consistency triumphs over intensity. Committing to read just ten pages of an English book per day may seem negligible in isolation, yet it culminates in more than twelve completed books annually. Over time, these atomic practices reshape your neuroplastic pathways, turning conscious struggle into second nature.`,
        quiz: [
          {
            question: "According to the passage, what percentage of daily actions stem from habits rather than deliberate decisions?",
            options: ["About 20%", "Approximately 40%", "Over 80%", "Nearly 100%"],
            answer: 1,
            explanation: "The text states that 'approximately forty percent of the actions you execute are not deliberate decisions, but deeply ingrained habits.'"
          },
          {
            question: "What is recommended when trying to overcome a detrimental habit?",
            options: [
              "Suppress the craving using sheer willpower",
              "Isolate yourself from all cues",
              "Substitute the routine while maintaining the cue and reward",
              "Avoid physical exercise"
            ],
            answer: 2,
            explanation: "The article advises substituting the middle routine while keeping the cue and psychological reward."
          }
        ]
      },
      {
        id: 'remote_work',
        title: "The Architecture of Remote Work: Asynchronous Collaboration",
        category: "business",
        level: "B2 Upper-Intermediate",
        readTime: "4 min read",
        excerpt: "Why modern distributed teams prioritize detailed written documentation over endless synchronous video meetings.",
        content: `As organizations transition toward distributed workforces across multiple continents, traditional communication models are becoming obsolete. The modern gold standard is asynchronous collaboration—a paradigm where team members contribute on their own schedules without expecting immediate replies.

In an asynchronous culture, written clarity is paramount. Vague instructions like 'please take care of this soon' create friction and misunderstandings. In contrast, articulate documentation detailing specific project parameters, acceptance criteria, and explicit deadlines fosters autonomous decision-making.

Moreover, asynchronous workflows significantly reduce workplace fatigue. By minimizing the deluge of fragmented instant notifications and unnecessary video calls, professionals can allocate uninterrupted blocks of time for deep cognitive tasks. Thus, remote work ceases to be merely a logistical convenience and transforms into a driver of high-caliber output.`,
        quiz: [
          {
            question: "What is the core principle of asynchronous collaboration described in the text?",
            options: [
              "Holding mandatory daily 2-hour video conferences",
              "Contributing without requiring immediate, real-time responses",
              "Working exclusively in the office during daytime hours",
              "Relying solely on informal verbal agreements"
            ],
            answer: 1,
            explanation: "Asynchronous collaboration means team members contribute on their own schedules without needing instant replies."
          },
          {
            question: "According to the article, what is essential in an asynchronous culture?",
            options: [
              "Written clarity and thorough documentation",
              "Sending multiple short emails every hour",
              "Working identical hours to teammates",
              "Avoiding written records"
            ],
            answer: 0,
            explanation: "The article emphasizes that written clarity and articulate documentation are paramount to avoid friction."
          }
        ]
      },
      {
        id: 'creativity',
        title: "Why Mind-Wandering Sparks Creative Breakthroughs",
        category: "psychology",
        level: "B1+ Intermediate",
        readTime: "3 min read",
        excerpt: "Why our most brilliant epiphanies happen in the shower or during casual walks rather than under forced pressure.",
        content: `Have you ever noticed that your most ingenious ideas tend to surface while you are taking a shower, washing dishes, or strolling through a quiet park? This phenomenon is not mere coincidence; it is deeply tied to the brain's default mode network.

When we are hyper-focused on a complex problem, our analytical executive network suppresses unrelated associations. However, when we engage in undemanding, repetitive tasks, our attention shifts inward. In this relaxed state, disparate memories, latent thoughts, and novel concepts can spontaneously connect.

Psychologists suggest scheduling intentional 'white space' into your weekly calendar. Rather than filling every idle moment with digital consumption, allowing your thoughts to wander freely can rejuvenate mental stamina and accelerate creative problem solving.`,
        quiz: [
          {
            question: "Why do innovative ideas often emerge during simple, routine tasks?",
            options: [
              "Because the brain shuts down completely",
              "The default mode network allows unrelated ideas to spontaneously connect",
              "Stress hormones reach their highest peak",
              "Memory retrieval becomes impossible"
            ],
            answer: 1,
            explanation: "During undemanding tasks, the default mode network activates, allowing disparate memories and concepts to connect."
          }
        ]
      }
    ];

    this.dictionary = {
      "deliberate": { ipa: "/dɪˈlɪb.ər.ət/", def: "Done consciously and intentionally.", ex: "She made a deliberate choice to change careers." },
      "ingrained": { ipa: "/ɪnˈɡreɪnd/", def: "Firmly fixed or deeply rooted; difficult to change.", ex: "These habits are deeply ingrained from childhood." },
      "substitute": { ipa: "/ˈsʌb.stɪ.tʃuːt/", def: "To replace one thing or person with another.", ex: "You can substitute honey for refined sugar." },
      "negligible": { ipa: "/ˈneɡ.lɪ.dʒə.bəl/", def: "So small or unimportant as to be not worth considering.", ex: "The difference in cost was negligible." },
      "culminates": { ipa: "/ˈkʌl.mɪ.neɪts/", def: "Reaches a climax or point of highest development.", ex: "The multi-year project culminates in a global product launch." },
      "obsolete": { ipa: "/ˌɒb.səˈliːt/", def: "No longer produced or used; out of date.", ex: "Typewriters became largely obsolete with the advent of computers." },
      "asynchronous": { ipa: "/eɪˈsɪŋ.krə.nəs/", def: "Not occurring at the same time; independent of real-time sync.", ex: "Email is an asynchronous method of communication." },
      "paramount": { ipa: "/ˈpær.ə.maʊnt/", def: "More important than anything else; supreme.", ex: "Safety is paramount in any aviation operation." },
      "fatigue": { ipa: "/fəˈtiːɡ/", def: "Extreme tiredness resulting from mental or physical exertion.", ex: "Continuous screen time often causes visual and mental fatigue." },
      "deluge": { ipa: "/ˈdel.juːdʒ/", def: "A severe flood, or an overwhelming rush of things.", ex: "The support team received a deluge of incoming tickets." },
      "ingenious": { ipa: "/ɪnˈdʒiː.ni.əs/", def: "Clever, original, and inventive.", ex: "He devised an ingenious mechanism to save solar energy." },
      "disparate": { ipa: "/ˈdɪs.pər.ət/", def: "Essentially different in kind; not allowing comparison.", ex: "The team brought together disparate perspectives to solve the problem." },
      "rejuvenate": { ipa: "/rɪˈdʒuː.vən.eɪt/", def: "Make someone or something feel younger, fresher, or more lively.", ex: "A weekend in nature helped rejuvenate her spirits." }
    };

    this.currentArticle = this.articles[0];
    this.synth = window.speechSynthesis;
    this.fontSizeState = 0; // 0=normal, 1=medium, 2=large

    this.initElements();
    this.renderArticlesList();
    this.loadArticle(this.articles[0].id);
  }

  initElements() {
    this.articlesListEl = document.getElementById('articles-list-container');
    this.articleTitleEl = document.getElementById('article-title-heading');
    this.articleParagraphsEl = document.getElementById('article-paragraphs');
    this.readerLevelEl = document.getElementById('reader-level');
    this.readerTimeEl = document.getElementById('reader-time');
    this.quizContainer = document.getElementById('reading-quiz-card');
    this.quizQuestionsList = document.getElementById('quiz-questions-list');
    this.quizResultFeedback = document.getElementById('quiz-result-feedback');
    this.popover = document.getElementById('word-definition-popover');

    // Read aloud button
    document.getElementById('btn-read-aloud').addEventListener('click', () => {
      this.readArticleAloud();
    });

    // Font size toggle
    document.getElementById('btn-font-size').addEventListener('click', () => {
      this.toggleFontSize();
    });

    // Category filter
    document.getElementById('reading-category-select').addEventListener('change', (e) => {
      this.filterCategory(e.target.value);
    });

    // Submit quiz
    document.getElementById('btn-submit-quiz').addEventListener('click', () => {
      this.checkQuiz();
    });

    // Popover close
    document.getElementById('popover-close-btn').addEventListener('click', () => {
      this.popover.style.display = 'none';
    });

    // Popover pronounce
    document.getElementById('popover-speak-btn').addEventListener('click', () => {
      const word = document.getElementById('popover-word').innerText;
      if (word && this.synth) {
        const u = new SpeechSynthesisUtterance(word);
        u.lang = 'en-US';
        this.synth.speak(u);
      }
    });

    // Global click to dismiss popover
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.vocab-word') && !e.target.closest('#word-definition-popover')) {
        this.popover.style.display = 'none';
      }
    });
  }

  renderArticlesList(filterCat = 'all') {
    let list = this.articles;
    if (filterCat !== 'all') {
      list = list.filter(a => a.category === filterCat);
    }

    let html = '';
    list.forEach(art => {
      const activeClass = art.id === this.currentArticle.id ? 'active' : '';
      html += `
        <div class="article-item-card ${activeClass}" onclick="readingLounge.loadArticle('${art.id}')">
          <div class="article-item-meta">
            <span>${art.level}</span>
            <span>${art.readTime}</span>
          </div>
          <h4>${art.title}</h4>
          <p>${art.excerpt}</p>
        </div>
      `;
    });
    this.articlesListEl.innerHTML = html;
  }

  filterCategory(cat) {
    this.renderArticlesList(cat);
  }

  loadArticle(id) {
    const art = this.articles.find(a => a.id === id);
    if (!art) return;
    this.currentArticle = art;

    this.articleTitleEl.innerText = art.title;
    this.readerLevelEl.innerText = art.level;
    this.readerTimeEl.innerText = `⏱️ ${art.readTime}`;

    // Wrap vocabulary words with interactive span
    const paragraphs = art.content.split('\n\n');
    let contentHtml = '';

    paragraphs.forEach(p => {
      let pText = p;
      for (const word of Object.keys(this.dictionary)) {
        const reg = new RegExp(`\\b(${word})\\b`, 'gi');
        pText = pText.replace(reg, `<span class="vocab-word" onclick="readingLounge.showWordLookup(event, '$1')">$1</span>`);
      }
      contentHtml += `<p>${pText}</p>`;
    });

    this.articleParagraphsEl.innerHTML = contentHtml;
    this.renderArticlesList(document.getElementById('reading-category-select').value);
    this.renderQuiz(art.quiz);
  }

  showWordLookup(event, word) {
    event.stopPropagation();
    const cleanWord = word.toLowerCase().trim();
    const info = this.dictionary[cleanWord];

    if (!info) return;

    document.getElementById('popover-word').innerText = word;
    document.getElementById('popover-phonetic').innerText = info.ipa;
    document.getElementById('popover-def').innerText = info.def;
    document.getElementById('popover-example').innerText = `"${info.ex}"`;

    const rect = event.target.getBoundingClientRect();
    this.popover.style.display = 'block';
    this.popover.style.top = `${rect.bottom + 8}px`;
    this.popover.style.left = `${Math.max(16, Math.min(window.innerWidth - 300, rect.left - 20))}px`;
  }

  readArticleAloud() {
    if (!this.synth) return;
    if (this.synth.speaking) {
      this.synth.cancel();
      app.showToast('Stopped reading audio.', 'info');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(this.currentArticle.content);
    utterance.lang = 'en-US';
    utterance.rate = parseFloat(localStorage.getItem('fluently_voice_rate') || '0.95');
    this.synth.speak(utterance);
    app.showToast('Reading article aloud... Click again to stop.', 'success');
  }

  toggleFontSize() {
    this.fontSizeState = (this.fontSizeState + 1) % 3;
    const sizes = ['1.05rem', '1.2rem', '1.35rem'];
    this.articleParagraphsEl.style.fontSize = sizes[this.fontSizeState];
    app.showToast(`Font size adjusted to ${sizes[this.fontSizeState]}`, 'info');
  }

  renderQuiz(quiz) {
    if (!quiz || quiz.length === 0) {
      this.quizContainer.style.display = 'none';
      return;
    }

    this.quizContainer.style.display = 'block';
    this.quizResultFeedback.innerHTML = '';
    let html = '';

    quiz.forEach((q, qIndex) => {
      html += `
        <div class="quiz-q-block" data-qindex="${qIndex}">
          <div class="quiz-q-text">${qIndex + 1}. ${q.question}</div>
          <div class="quiz-options">
            ${q.options.map((opt, optIndex) => `
              <label class="quiz-opt" id="opt-${qIndex}-${optIndex}">
                <input type="radio" name="quiz-q-${qIndex}" value="${optIndex}">
                <span>${opt}</span>
              </label>
            `).join('')}
          </div>
        </div>
      `;
    });

    this.quizQuestionsList.innerHTML = html;
  }

  checkQuiz() {
    const quiz = this.currentArticle.quiz;
    let score = 0;
    let answered = 0;

    quiz.forEach((q, qIndex) => {
      const selected = document.querySelector(`input[name="quiz-q-${qIndex}"]:checked`);
      if (selected) {
        answered++;
        const val = parseInt(selected.value);
        const optEl = document.getElementById(`opt-${qIndex}-${val}`);
        const correctEl = document.getElementById(`opt-${qIndex}-${q.answer}`);

        if (val === q.answer) {
          score++;
          optEl.classList.add('correct');
        } else {
          optEl.classList.add('wrong');
          if (correctEl) correctEl.classList.add('correct');
        }
      }
    });

    if (answered < quiz.length) {
      app.showToast('Please answer all questions before submitting.', 'warning');
      return;
    }

    const percentage = Math.round((score / quiz.length) * 100);
    this.quizResultFeedback.innerHTML = `
      <div style="margin-top:14px; padding:12px; border-radius:8px; background:${percentage === 100 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}; font-weight:700; color:#fff;">
        Score: ${score} / ${quiz.length} (${percentage}%) - ${percentage === 100 ? '🎉 Excellent comprehension!' : '💡 Review the highlighted correct options.'}
      </div>
    `;
    app.showToast(`Quiz completed! You scored ${score}/${quiz.length}`, 'success');
  }
}

window.readingLounge = null;
