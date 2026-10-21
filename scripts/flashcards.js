/**
 * FLUENTLY - Vocabulary & Flashcards SRS Studio
 * Interactive 3D Spaced Repetition System (SRS) trainer,
 * curated C1 upgrades, collocations, ESL traps, bookmarking, and collocation quizzes.
 */

class FlashcardStudio {
  constructor() {
    this.currentDeckKey = 'c1_upgrades';
    this.currentIndex = 0;
    this.isFlipped = false;
    this.currentMode = 'flashcards'; // 'flashcards' | 'matrix' | 'quiz'
    this.quizIndex = 0;
    this.quizScore = 0;
    this.quizAnswered = false;

    // Local Storage Keys
    this.STORAGE_SAVED_WORDS = 'fluently_saved_words_v1';
    this.STORAGE_MASTERY = 'fluently_vocab_mastery_v1';

    this.masteryData = this.loadMasteryData();
    this.savedWords = this.loadSavedWords();

    this.curatedDecks = {
      c1_upgrades: {
        title: "B2 → C1 Power Upgrades",
        icon: "🌟",
        description: "Elevate everyday B2 intermediate words into commanding, sophisticated C1 expressions.",
        cards: [
          {
            id: "c1_paramount",
            basic: "Very important / Crucial",
            advanced: "Paramount / Pivotal",
            ipa: "/ˈpær.ə.maʊnt/",
            def: "More important than anything else; supreme in urgency or significance.",
            example: "Maintaining user privacy and security is paramount in our architecture.",
            category: "Adjective"
          },
          {
            id: "c1_arduous",
            basic: "Hard / Difficult",
            advanced: "Arduous / Demanding",
            ipa: "/ˈɑː.dju.əs/",
            def: "Involving or requiring strenuous effort; tiring and challenging.",
            example: "Mastering conversational fluency is an arduous but profoundly fulfilling endeavor.",
            category: "Adjective"
          },
          {
            id: "c1_impediment",
            basic: "Problem / Obstacle",
            advanced: "Impediment / Hurdle",
            ipa: "/ɪmˈpɛd.ɪ.mənt/",
            def: "A hindrance or obstruction in doing something effectively.",
            example: "A lack of timely communication was the primary impediment to project delivery.",
            category: "Noun"
          },
          {
            id: "c1_facilitate",
            basic: "Help / Make easy",
            advanced: "Facilitate / Expedite",
            ipa: "/fəˈsɪl.ɪ.teɪt/",
            def: "To make an action or process smooth, seamless, or easier.",
            example: "Modern asynchronous tools facilitate effortless cross-time-zone collaboration.",
            category: "Verb"
          },
          {
            id: "c1_exemplify",
            basic: "Show / Give example of",
            advanced: "Exemplify / Embody",
            ipa: "/ɪɡˈzɛm.plɪ.faɪ/",
            def: "To serve as a prime, typical, or outstanding model of something.",
            example: "Her composure under severe stress exemplified true executive leadership.",
            category: "Verb"
          },
          {
            id: "c1_bolster",
            basic: "Support / Strengthen",
            advanced: "Bolster / Fortify",
            ipa: "/ˈbəʊl.stər/",
            def: "To support, reinforce, or strengthen something that may be weak.",
            example: "They hired seasoned advisors to bolster their international market presence.",
            category: "Verb"
          },
          {
            id: "c1_scrutinize",
            basic: "Look at carefully / Examine",
            advanced: "Scrutinize / Audit",
            ipa: "/ˈskruː.tɪ.naɪz/",
            def: "To examine or inspect with meticulous and critical attention to detail.",
            example: "Regulators will thoroughly scrutinize the merger before granting clearance.",
            category: "Verb"
          },
          {
            id: "c1_ephemeral",
            basic: "Short-lived / Temporary",
            advanced: "Ephemeral / Transient",
            ipa: "/ɪˈfem.ər.əl/",
            def: "Lasting for a very brief period of time; fleeting.",
            example: "Viral internet trends are notoriously ephemeral, vanishing within weeks.",
            category: "Adjective"
          },
          {
            id: "c1_pervasive",
            basic: "Everywhere / Spreading",
            advanced: "Pervasive / Ubiquitous",
            ipa: "/pəˈveɪ.sɪv/",
            def: "Spreading widely throughout an area or group of people; inescapable.",
            example: "Smartphones have exerted a pervasive influence on modern social dynamics.",
            category: "Adjective"
          },
          {
            id: "c1_lucrative",
            basic: "Making a lot of money",
            advanced: "Lucrative / High-yielding",
            ipa: "/ˈluː.krə.tɪv/",
            def: "Producing a great deal of profit; commercially highly advantageous.",
            example: "The agency negotiated a lucrative contract with a multinational retailer.",
            category: "Adjective"
          },
          {
            id: "c1_unprecedented",
            basic: "Never happened before",
            advanced: "Unprecedented / Novel",
            ipa: "/ʌnˈpres.ɪ.den.tɪd/",
            def: "Never done or known before; completely without previous example.",
            example: "The team demonstrated unprecedented agility in responding to the disruption.",
            category: "Adjective"
          },
          {
            id: "c1_detrimental",
            basic: "Very bad / Harmful",
            advanced: "Detrimental / Pernicious",
            ipa: "/ˌdet.rɪˈmen.təl/",
            def: "Tending to cause noticeable damage, injury, or severe harm.",
            example: "Chronic sleep deprivation is deeply detrimental to cognitive functioning.",
            category: "Adjective"
          },
          {
            id: "c1_mitigate",
            basic: "Lessen / Reduce bad effect",
            advanced: "Mitigate / Alleviate",
            ipa: "/ˈmɪt.ɪ.ɡeɪt/",
            def: "To make something bad less severe, serious, or painful.",
            example: "Early risk assessment helps mitigate potential financial losses.",
            category: "Verb"
          },
          {
            id: "c1_substantiate",
            basic: "Prove with facts",
            advanced: "Substantiate / Validate",
            ipa: "/səbˈstæn.ʃi.eɪt/",
            def: "To provide solid evidence or facts to support or prove the truth of something.",
            example: "The researcher cited rigorous field studies to substantiate her bold claims.",
            category: "Verb"
          },
          {
            id: "c1_comprehensive",
            basic: "Covering everything / Complete",
            advanced: "Comprehensive / Exhaustive",
            ipa: "/ˌkɒm.prɪˈhen.sɪv/",
            def: "Including or dealing with all or nearly all elements or aspects of something.",
            example: "The consultant produced a comprehensive audit of the company's workflows.",
            category: "Adjective"
          },
          {
            id: "c1_conscientious",
            basic: "Working very hard and carefully",
            advanced: "Conscientious / Meticulous",
            ipa: "/ˌkɒn.ʃiˈen.ʃəs/",
            def: "Wishing to do one's work or duty well and thoroughly.",
            example: "He is a conscientious engineer who double-checks every line of code.",
            category: "Adjective"
          },
          {
            id: "c1_discrepancy",
            basic: "Difference / Mismatch",
            advanced: "Discrepancy / Inconsistency",
            ipa: "/dɪˈskrep.ən.si/",
            def: "A lack of compatibility or similarity between two or more facts.",
            example: "The auditor identified a notable discrepancy between revenue records and bank slips.",
            category: "Noun"
          },
          {
            id: "c1_ambiguous",
            basic: "Unclear / Having two meanings",
            advanced: "Ambiguous / Equivocal",
            ipa: "/æmˈbɪɡ.ju.əs/",
            def: "Open to more than one interpretation; not having an obvious single meaning.",
            example: "The contractual clause was ambiguous, causing disagreement between the parties.",
            category: "Adjective"
          },
          {
            id: "c1_eloquent",
            basic: "Good at speaking clearly",
            advanced: "Eloquent / Articulate",
            ipa: "/ˈel.ə.kwənt/",
            def: "Fluent or persuasive in speaking or writing; expressing feelings vividly.",
            example: "Her eloquent keynote speech inspired hundreds of aspiring entrepreneurs.",
            category: "Adjective"
          },
          {
            id: "c1_resilience",
            basic: "Ability to bounce back",
            advanced: "Resilience / Fortitude",
            ipa: "/rɪˈzɪl.jəns/",
            def: "The capacity to withstand or recover quickly from difficulties; toughness.",
            example: "The community showed remarkable resilience in rebuilding after the storm.",
            category: "Noun"
          }
        ]
      },
      collocations: {
        title: "Collocations & Phrasal Verbs",
        icon: "🤝",
        description: "Natural word pairings and sophisticated phrasal expressions that sound inherently native.",
        cards: [
          {
            id: "colloc_bear_in_mind",
            basic: "Remember / Don't forget",
            advanced: "Bear in mind",
            ipa: "/beər ɪn maɪnd/",
            def: "To remember to consider something when you are thinking about or doing something.",
            example: "Bear in mind that international shipping times may double during peak holidays.",
            category: "Idiomatic Collocation"
          },
          {
            id: "colloc_bridge_the_gap",
            basic: "Connect two different things",
            advanced: "Bridge the gap",
            ipa: "/brɪdʒ ðə ɡæp/",
            def: "To connect two things or to make the difference between them smaller.",
            example: "This interactive app helps bridge the gap between B2 theory and C1 conversation.",
            category: "Verb Phrase"
          },
          {
            id: "colloc_shed_light_on",
            basic: "Explain / Make clear",
            advanced: "Shed light on",
            ipa: "/ʃed laɪt ɒn/",
            def: "To provide new information or context that helps people understand something.",
            example: "The newly released internal documents shed light on how the decision was made.",
            category: "Verb Phrase"
          },
          {
            id: "colloc_pave_the_way",
            basic: "Make something possible in the future",
            advanced: "Pave the way for",
            ipa: "/peɪv ðə weɪ fɔːr/",
            def: "To create the conditions or circumstances that make subsequent progress possible.",
            example: "Groundbreaking battery research has paved the way for long-range electric aviation.",
            category: "Verb Phrase"
          },
          {
            id: "colloc_take_for_granted",
            basic: "Not appreciate something because it's always there",
            advanced: "Take for granted",
            ipa: "/teɪk fɔːr ˈɡrɑːn.tɪd/",
            def: "To fail to properly appreciate something as a consequence of becoming overly familiar with it.",
            example: "We often take high-speed global connectivity for granted in our daily work.",
            category: "Idiomatic Collocation"
          },
          {
            id: "colloc_call_into_question",
            basic: "Doubt / Ask if something is true",
            advanced: "Call into question",
            ipa: "/kɔːl ˈɪn.tuː ˈkwes.tʃən/",
            def: "To express doubts about something or suggest that it might not be accurate or valid.",
            example: "Recent experimental results call into question the traditional textbook theory.",
            category: "Verb Phrase"
          },
          {
            id: "colloc_come_to_terms_with",
            basic: "Accept a sad or difficult situation",
            advanced: "Come to terms with",
            ipa: "/kʌm tuː tɜːmz wɪð/",
            def: "To gradually accept a difficult situation and start to deal with it positively.",
            example: "It took several months for the founder to come to terms with the company restructuring.",
            category: "Idiomatic Collocation"
          },
          {
            id: "colloc_tip_the_scales",
            basic: "Decide the winner / Make the difference",
            advanced: "Tip the scales / Balance",
            ipa: "/tɪp ðə skeɪlz/",
            def: "To give a slight advantage to someone or something; produce a decisive shift.",
            example: "Her extensive background in machine learning tipped the scales in her favor.",
            category: "Idiomatic Collocation"
          },
          {
            id: "colloc_play_a_pivotal_role",
            basic: "Be very important in doing something",
            advanced: "Play a pivotal role in",
            ipa: "/pleɪ ə ˈpɪv.ə.təl rəʊl/",
            def: "To be of central, decisive importance in the success or development of something.",
            example: "Mentors play a pivotal role in shaping early career trajectories.",
            category: "Verb Phrase"
          },
          {
            id: "colloc_reconcile_differences",
            basic: "Agree after an argument",
            advanced: "Reconcile differences",
            ipa: "/ˈrek.ən.saɪl ˈdɪf.ər.ən.sɪz/",
            def: "To find a satisfactory way of dealing with two opposing viewpoints or parties.",
            example: "The mediator helped both department heads reconcile their budgetary differences.",
            category: "Verb Phrase"
          },
          {
            id: "colloc_gauge_reaction",
            basic: "Check what people think",
            advanced: "Gauge public / user reaction",
            ipa: "/ɡeɪdʒ riˈæk.ʃən/",
            def: "To judge, measure, or evaluate the feelings or opinions of others.",
            example: "We conducted beta testing to gauge user reaction to the redesigned interface.",
            category: "Verb Phrase"
          },
          {
            id: "colloc_strike_a_balance",
            basic: "Find a middle way",
            advanced: "Strike a delicate balance",
            ipa: "/straɪk ə ˈbæl.əns/",
            def: "To choose or establish a compromise between two conflicting requirements or priorities.",
            example: "Product managers must strike a balance between rapid shipping and code quality.",
            category: "Idiomatic Collocation"
          }
        ]
      },
      esl_traps: {
        title: "ESL Trap Buster",
        icon: "⚠️",
        description: "Eradicate stubborn non-standard phrases and Indian English / ESL colloquial habits.",
        cards: [
          {
            id: "trap_revert_back",
            basic: "Common Error: 'Please revert back to me'",
            advanced: "Standard C1: 'Please reply / respond' or 'revert to the previous version'",
            ipa: "/rɪˈplaɪ/",
            def: "'Revert' means to return to a previous state, not to reply. Using 'back' with 'revert' is redundant.",
            example: "Correct: 'I will reply with the approved design assets before noon.'",
            category: "Redundancy"
          },
          {
            id: "trap_prepone",
            basic: "Common Error: 'Can we prepone the meeting?'",
            advanced: "Standard C1: 'Can we bring the meeting forward / reschedule earlier?'",
            ipa: "/brɪŋ ˈfɔː.wəd/",
            def: "'Prepone' is an Indian English neologism not recognized or understood in standard US/UK business English.",
            example: "Correct: 'Could we bring forward tomorrow's sync to 10:00 AM?'",
            category: "Regional Trap"
          },
          {
            id: "trap_did_not_knew",
            basic: "Common Error: 'I did not knew about that'",
            advanced: "Standard C1: 'I did not know about that'",
            ipa: "/dɪd nɒt nəʊ/",
            def: "Double past tense error. Auxiliary 'did' already carries past tense; the following main verb must be base form.",
            example: "Correct: 'We did not realize that the deadline had shifted.'",
            category: "Grammar Trap"
          },
          {
            id: "trap_passed_out",
            basic: "Common Error: 'I passed out from university in 2022'",
            advanced: "Standard C1: 'I graduated from university in 2022'",
            ipa: "/ˈɡrædʒ.u.eɪ.tɪd/",
            def: "In standard native English, 'pass out' means to faint or lose consciousness, not to graduate from an institution.",
            example: "Correct: 'She graduated from Oxford with first-class honors in computer science.'",
            category: "False Friend"
          },
          {
            id: "trap_discuss_about",
            basic: "Common Error: 'Let us discuss about the proposal'",
            advanced: "Standard C1: 'Let us discuss the proposal'",
            ipa: "/dɪˈskʌs/",
            def: "'Discuss' is a transitive verb that takes a direct object without the preposition 'about'.",
            example: "Correct: 'We gathered to discuss the upcoming product roadmap.'",
            category: "Preposition Trap"
          },
          {
            id: "trap_cope_up_with",
            basic: "Common Error: 'It is hard to cope up with the stress'",
            advanced: "Standard C1: 'It is hard to cope with the stress'",
            ipa: "/kəʊp wɪð/",
            def: "Adding 'up' is a non-standard habit. The standard idiom is simply 'cope with' or 'keep up with'.",
            example: "Correct: 'The server struggled to cope with the sudden traffic surge.'",
            category: "Preposition Trap"
          },
          {
            id: "trap_out_of_station",
            basic: "Common Error: 'I am out of station this week'",
            advanced: "Standard C1: 'I am out of town / away on travel this week'",
            ipa: "/aʊt əv taʊn/",
            def: "'Out of station' originates from British colonial military administration and is archaic outside the Indian subcontinent.",
            example: "Correct: 'I will be out of town for a conference until Thursday.'",
            category: "Regional Trap"
          },
          {
            id: "trap_order_for",
            basic: "Common Error: 'Did you order for coffee?'",
            advanced: "Standard C1: 'Did you order coffee?'",
            ipa: "/ˈɔː.dər/",
            def: "'Order' as a verb takes a direct object. 'Order for' is only valid when 'order' is a noun (e.g. 'an order for supplies').",
            example: "Correct: 'We ordered lunch for the entire development team.'",
            category: "Preposition Trap"
          },
          {
            id: "trap_years_back",
            basic: "Common Error: 'Two years back, I moved to London'",
            advanced: "Standard C1: 'Two years ago, I moved to London'",
            ipa: "/əˈɡəʊ/",
            def: "In standard English narrative and professional speech, use 'ago' instead of 'back' when stating elapsed time.",
            example: "Correct: 'Five years ago, we began our transition to distributed cloud architecture.'",
            category: "Idiomatic Precision"
          },
          {
            id: "trap_revert_same",
            basic: "Common Error: 'Please do the needful and revert the same'",
            advanced: "Standard C1: 'Please handle this and let me know your thoughts'",
            ipa: "/ˈhæn.dəl ðɪs/",
            def: "'Do the needful' and 'the same' are archaic bureaucratisms that sound unnatural and stiff in modern executive English.",
            example: "Correct: 'Please review the draft at your earliest convenience and confirm approval.'",
            category: "Archaic Idiom"
          }
        ]
      }
    };

    // Collocation Quiz Questions
    this.quizQuestions = [
      {
        prompt: "The research team hopes the latest field experiment will _____ light on the mystery.",
        options: ["cast", "shed", "drop", "make"],
        answer: 1,
        collocation: "shed light on",
        explanation: "'Shed light on' is the natural, idiomatic C1 collocation meaning to clarify or reveal new information."
      },
      {
        prompt: "Her extensive background in systems architecture _____ the scales in her favor during the interview.",
        options: ["tipped", "pulled", "shook", "weighed"],
        answer: 0,
        collocation: "tip the scales",
        explanation: "'Tip the scales' means to create a decisive advantage or shift an outcome."
      },
      {
        prompt: "Before making a final choice, please _____ in mind that supply chain delays may occur.",
        options: ["keep", "hold", "bear", "carry"],
        answer: 2,
        collocation: "bear in mind",
        explanation: "'Bear in mind' is a sophisticated C1 way of saying remember or keep under consideration."
      },
      {
        prompt: "Recent findings have called the old safety assumptions _____ question.",
        options: ["in", "into", "onto", "under"],
        answer: 1,
        collocation: "call into question",
        explanation: "'Call into question' is the fixed prepositional collocation meaning to express serious doubt about validity."
      },
      {
        prompt: "Mentors play a _____ role in guiding early-career software engineers.",
        options: ["pivotal", "middle", "pointed", "sharp"],
        answer: 0,
        collocation: "play a pivotal role",
        explanation: "'Play a pivotal role' means to be of supreme, central importance in an outcome."
      },
      {
        prompt: "We cannot take continuous network uptime _____ granted in high-stakes environments.",
        options: ["as", "for", "with", "by"],
        answer: 1,
        collocation: "take for granted",
        explanation: "'Take for granted' is the fixed idiom meaning to fail to appreciate something because you assume it will always be there."
      },
      {
        prompt: "The new bridge program is designed to _____ the gap between theoretical knowledge and practical application.",
        options: ["fill", "close", "bridge", "cross"],
        answer: 2,
        collocation: "bridge the gap",
        explanation: "'Bridge the gap' specifically highlights connecting two divergent or distinct domains smoothly."
      },
      {
        prompt: "During negotiations, both sides worked constructively to _____ their differences.",
        options: ["reconcile", "stitch", "repair", "amend"],
        answer: 0,
        collocation: "reconcile differences",
        explanation: "'Reconcile differences' is the executive standard collocation for settling disputes harmoniously."
      }
    ];

    this.init();
  }

  loadMasteryData() {
    try {
      const raw = localStorage.getItem(this.STORAGE_MASTERY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  saveMasteryData() {
    try {
      localStorage.setItem(this.STORAGE_MASTERY, JSON.stringify(this.masteryData));
    } catch (e) {
      console.error('Failed to save mastery data:', e);
    }
  }

  loadSavedWords() {
    try {
      const raw = localStorage.getItem(this.STORAGE_SAVED_WORDS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to load saved words:', e);
    }

    // Default starter saved words
    return [
      {
        id: "saved_deliberate",
        basic: "Intentional / On purpose",
        advanced: "Deliberate",
        ipa: "/dɪˈlɪb.ər.ət/",
        def: "Done consciously and intentionally; carefully weighed and considered.",
        example: "She made a deliberate choice to prioritize long-term mastery over quick shortcuts.",
        category: "Saved from Reading"
      },
      {
        id: "saved_asynchronous",
        basic: "Not at the same time",
        advanced: "Asynchronous",
        ipa: "/eɪˈsɪŋ.krə.nəs/",
        def: "Not occurring at the exact same moment; communication independent of real-time presence.",
        example: "Asynchronous writing requires thoughtful phrasing to prevent unnecessary friction.",
        category: "Saved from Reading"
      },
      {
        id: "saved_rejuvenate",
        basic: "Make fresh / Energize",
        advanced: "Rejuvenate",
        ipa: "/rɪˈdʒuː.vən.eɪt/",
        def: "To give new energy, vitality, or a fresh perspective to someone or something.",
        example: "A short walk away from screens will rejuvenate your mental sharpness.",
        category: "Saved from Reading"
      }
    ];
  }

  saveSavedWords() {
    try {
      localStorage.setItem(this.STORAGE_SAVED_WORDS, JSON.stringify(this.savedWords));
    } catch (e) {
      console.error('Failed to save saved words:', e);
    }
  }

  init() {
    this.initEventListeners();
    this.renderCurrentDeck();
    this.renderMatrix();
    this.renderQuiz();
    this.updateDeckCounts();
  }

  initEventListeners() {
    // Mode Switcher Buttons
    document.querySelectorAll('.vocab-mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.currentTarget.getAttribute('data-mode');
        this.switchMode(mode);
      });
    });

    // Deck Selector Chips
    document.querySelectorAll('.deck-select-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const deckKey = e.currentTarget.getAttribute('data-deck');
        this.switchDeck(deckKey);
      });
    });

    // Keyboard navigation for flashcards
    document.addEventListener('keydown', (e) => {
      if (app && app.currentTab !== 'vocabulary') return;
      if (this.currentMode !== 'flashcards') return;
      // If typing in input, ignore
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        this.flipCard();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        this.nextCard();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        this.prevCard();
      } else if (e.key === '1') {
        this.rateCard('learning');
      } else if (e.key === '2') {
        this.rateCard('familiar');
      } else if (e.key === '3') {
        this.rateCard('mastered');
      }
    });

    // Search filter for matrix
    const searchInput = document.getElementById('vocab-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.renderMatrix(e.target.value);
      });
    }

    // Category filter pills for matrix
    document.querySelectorAll('.matrix-filter-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        document.querySelectorAll('.matrix-filter-pill').forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const filter = e.currentTarget.getAttribute('data-filter');
        this.renderMatrix(document.getElementById('vocab-search-input')?.value || '', filter);
      });
    });

    // Custom Word Modal wiring
    const addWordModal = document.getElementById('add-word-modal');
    const openAddBtn = document.getElementById('btn-open-add-word');
    const closeAddBtn = document.getElementById('btn-close-add-word');
    const cancelAddBtn = document.getElementById('btn-cancel-add-word');
    const formAdd = document.getElementById('form-add-word');

    if (openAddBtn && addWordModal) {
      openAddBtn.addEventListener('click', () => {
        addWordModal.style.display = 'flex';
      });
    }

    const closeModal = () => {
      if (addWordModal) addWordModal.style.display = 'none';
      if (formAdd) formAdd.reset();
    };

    if (closeAddBtn) closeAddBtn.addEventListener('click', closeModal);
    if (cancelAddBtn) cancelAddBtn.addEventListener('click', closeModal);
    if (addWordModal) {
      addWordModal.addEventListener('click', (e) => {
        if (e.target === addWordModal) closeModal();
      });
    }

    if (formAdd) {
      formAdd.addEventListener('submit', (e) => {
        e.preventDefault();
        const word = document.getElementById('new-word-term').value.trim();
        const basic = document.getElementById('new-word-basic').value.trim();
        const def = document.getElementById('new-word-def').value.trim();
        const example = document.getElementById('new-word-example').value.trim();
        const ipa = document.getElementById('new-word-ipa').value.trim() || `/${word.toLowerCase()}/`;
        const category = document.getElementById('new-word-category').value.trim() || 'Custom';

        if (!word || !def) {
          app.showToast('Please provide both the word and definition.', 'warning');
          return;
        }

        this.addCustomWord({ word, basic, def, example, ipa, category });
        closeModal();
      });
    }
  }

  getCurrentDeckCards() {
    if (this.currentDeckKey === 'saved') {
      return this.savedWords;
    }
    return this.curatedDecks[this.currentDeckKey]?.cards || [];
  }

  switchMode(mode) {
    this.currentMode = mode;
    document.querySelectorAll('.vocab-mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });

    document.querySelectorAll('.vocab-subview').forEach(view => {
      view.classList.toggle('active', view.id === `vocab-view-${mode}`);
    });

    if (mode === 'matrix') {
      this.renderMatrix();
    } else if (mode === 'quiz') {
      this.renderQuiz();
    } else {
      this.renderCurrentDeck();
    }
  }

  switchDeck(deckKey) {
    this.currentDeckKey = deckKey;
    this.currentIndex = 0;
    this.isFlipped = false;

    document.querySelectorAll('.deck-select-chip').forEach(chip => {
      chip.classList.toggle('active', chip.getAttribute('data-deck') === deckKey);
    });

    this.renderCurrentDeck();
  }

  flipCard() {
    const cardEl = document.getElementById('flashcard-element');
    if (!cardEl) return;
    this.isFlipped = !this.isFlipped;
    cardEl.classList.toggle('is-flipped', this.isFlipped);
  }

  nextCard() {
    const cards = this.getCurrentDeckCards();
    if (cards.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % cards.length;
    this.isFlipped = false;
    this.renderCardContent();
  }

  prevCard() {
    const cards = this.getCurrentDeckCards();
    if (cards.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + cards.length) % cards.length;
    this.isFlipped = false;
    this.renderCardContent();
  }

  shuffleDeck() {
    const cards = this.getCurrentDeckCards();
    if (cards.length <= 1) return;
    // Fisher-Yates shuffle
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    this.currentIndex = 0;
    this.isFlipped = false;
    this.renderCardContent();
    app.showToast('🔀 Deck shuffled!', 'info');
  }

  rateCard(level) {
    const cards = this.getCurrentDeckCards();
    if (cards.length === 0) return;
    const currentCard = cards[this.currentIndex];
    if (!currentCard) return;

    this.masteryData[currentCard.id] = level;
    this.saveMasteryData();

    // Reward XP through Goals Manager
    if (window.goalsManager) {
      const xp = level === 'mastered' ? 15 : (level === 'familiar' ? 10 : 5);
      window.goalsManager.logActivity('vocabulary', xp, `Flashcard: ${currentCard.advanced || currentCard.word}`);
    }

    const messages = {
      learning: '🔴 Marked for practice soon.',
      familiar: '🟡 Getting familiar! Keep it up.',
      mastered: '🟢 Mastered! Awesome work (+15 XP) 🎉'
    };
    app.showToast(messages[level] || 'Card reviewed.', 'success');

    this.updateMasteryProgressBar();

    // Advance to next card smoothly after short delay
    setTimeout(() => {
      this.nextCard();
    }, 350);
  }

  resetDeckMastery() {
    const cards = this.getCurrentDeckCards();
    if (!confirm('Reset mastery ratings for all cards in this deck?')) return;
    cards.forEach(c => {
      delete this.masteryData[c.id];
    });
    this.saveMasteryData();
    this.updateMasteryProgressBar();
    this.renderCardContent();
    app.showToast('Deck mastery reset to 0%.', 'info');
  }

  renderCurrentDeck() {
    const cards = this.getCurrentDeckCards();
    const emptyNotice = document.getElementById('deck-empty-notice');
    const cardScene = document.getElementById('flashcard-scene-wrapper');
    const controls = document.getElementById('flashcard-controls-bar');

    if (cards.length === 0) {
      if (emptyNotice) emptyNotice.style.display = 'block';
      if (cardScene) cardScene.style.display = 'none';
      if (controls) controls.style.display = 'none';
      return;
    }

    if (emptyNotice) emptyNotice.style.display = 'none';
    if (cardScene) cardScene.style.display = 'block';
    if (controls) controls.style.display = 'flex';

    if (this.currentIndex >= cards.length) {
      this.currentIndex = 0;
    }

    this.renderCardContent();
    this.updateMasteryProgressBar();
  }

  renderCardContent() {
    const cards = this.getCurrentDeckCards();
    const cardEl = document.getElementById('flashcard-element');
    if (!cardEl || cards.length === 0) return;

    cardEl.classList.remove('is-flipped');
    this.isFlipped = false;

    const card = cards[this.currentIndex];
    const cardIndexEl = document.getElementById('card-index-counter');
    if (cardIndexEl) {
      cardIndexEl.innerText = `Card ${this.currentIndex + 1} of ${cards.length}`;
    }

    // Card Front
    const frontCategory = document.getElementById('card-front-category');
    const frontPrompt = document.getElementById('card-front-prompt');
    const frontWord = document.getElementById('card-front-word');
    const frontMasteryBadge = document.getElementById('card-front-mastery');

    const mastery = this.masteryData[card.id] || 'unrated';
    const masteryBadges = {
      unrated: '<span class="status-badge">New</span>',
      learning: '<span class="status-badge learning">🔴 In Review</span>',
      familiar: '<span class="status-badge familiar">🟡 Familiar</span>',
      mastered: '<span class="status-badge mastered">🟢 Mastered</span>'
    };

    if (frontCategory) frontCategory.innerText = card.category || 'Vocabulary';
    if (frontPrompt) frontPrompt.innerText = card.basic ? `Replace: "${card.basic}"` : 'Target Expression';
    if (frontWord) frontWord.innerText = card.advanced || card.word || 'Word';
    if (frontMasteryBadge) frontMasteryBadge.innerHTML = masteryBadges[mastery];

    // Card Back
    const backWord = document.getElementById('card-back-word');
    const backIpa = document.getElementById('card-back-ipa');
    const backDef = document.getElementById('card-back-def');
    const backExample = document.getElementById('card-back-example');
    const backCategory = document.getElementById('card-back-category');

    const cleanTerm = (card.advanced || card.word || '').split(' / ')[0].split('(')[0].trim();

    if (backWord) backWord.innerText = card.advanced || card.word;
    if (backIpa) backIpa.innerText = card.ipa || '';
    if (backDef) backDef.innerText = card.def || '';
    if (backExample) backExample.innerText = `"${card.example || ''}"`;
    if (backCategory) backCategory.innerText = card.category || '';

    // Audio Button
    const speakBtn = document.getElementById('card-speak-btn');
    if (speakBtn) {
      speakBtn.onclick = (e) => {
        e.stopPropagation();
        this.pronounce(cleanTerm);
      };
    }

    // Bookmark Toggle on Back
    const bookmarkBtn = document.getElementById('card-bookmark-btn');
    if (bookmarkBtn) {
      const isSaved = this.isWordSaved(cleanTerm);
      bookmarkBtn.innerHTML = isSaved ? '★ Saved' : '⭐ Bookmark';
      bookmarkBtn.classList.toggle('saved', isSaved);
      bookmarkBtn.onclick = (e) => {
        e.stopPropagation();
        this.toggleSaveWord({
          id: card.id,
          basic: card.basic,
          advanced: card.advanced || card.word,
          ipa: card.ipa,
          def: card.def,
          example: card.example,
          category: card.category || 'Saved'
        });
        const nowSaved = this.isWordSaved(cleanTerm);
        bookmarkBtn.innerHTML = nowSaved ? '★ Saved' : '⭐ Bookmark';
        bookmarkBtn.classList.toggle('saved', nowSaved);
      };
    }
  }

  updateMasteryProgressBar() {
    const cards = this.getCurrentDeckCards();
    const bar = document.getElementById('deck-mastery-bar-fill');
    const text = document.getElementById('deck-mastery-text');
    if (!bar || !text || cards.length === 0) return;

    let masteredCount = 0;
    cards.forEach(c => {
      if (this.masteryData[c.id] === 'mastered') masteredCount++;
    });

    const pct = Math.round((masteredCount / cards.length) * 100);
    bar.style.width = `${pct}%`;
    text.innerText = `Mastery: ${masteredCount} / ${cards.length} cards (${pct}%)`;
  }

  updateDeckCounts() {
    const savedChipBadge = document.getElementById('saved-deck-count-badge');
    if (savedChipBadge) {
      savedChipBadge.innerText = this.savedWords.length;
    }
  }

  pronounce(word) {
    if (window.app && typeof window.app.pronounce === 'function') {
      window.app.pronounce(word);
    } else if (window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(word);
      u.lang = 'en-US';
      window.speechSynthesis.speak(u);
    }
  }

  // ==========================================
  // VOCABULARY MATRIX EXPLORER
  // ==========================================

  getAllMatrixWords() {
    const all = [];

    // 1. C1 upgrades
    this.curatedDecks.c1_upgrades.cards.forEach(c => {
      all.push({ ...c, origin: 'c1' });
    });

    // 2. Collocations
    this.curatedDecks.collocations.cards.forEach(c => {
      all.push({ ...c, origin: 'collocations' });
    });

    // 3. ESL Traps
    this.curatedDecks.esl_traps.cards.forEach(c => {
      all.push({ ...c, origin: 'esl' });
    });

    // 4. Saved words (custom or from articles)
    this.savedWords.forEach(c => {
      if (!all.some(item => item.id === c.id)) {
        all.push({ ...c, origin: 'saved' });
      }
    });

    return all;
  }

  renderMatrix(searchQuery = '', filterType = 'all') {
    const container = document.getElementById('vocab-cards-grid');
    if (!container) return;

    let items = this.getAllMatrixWords();

    if (filterType !== 'all') {
      if (filterType === 'saved') {
        const savedIds = new Set(this.savedWords.map(w => w.id));
        items = items.filter(i => savedIds.has(i.id) || this.isWordSaved(i.advanced || i.word));
      } else {
        items = items.filter(i => i.origin === filterType);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i =>
        (i.basic && i.basic.toLowerCase().includes(q)) ||
        (i.advanced && i.advanced.toLowerCase().includes(q)) ||
        (i.word && i.word.toLowerCase().includes(q)) ||
        (i.def && i.def.toLowerCase().includes(q))
      );
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-matrix-msg">
          <p>🔍 No vocabulary items matched your query.</p>
          <small>Try a different keyword or filter category.</small>
        </div>
      `;
      return;
    }

    let html = '';
    items.forEach(item => {
      const displayWord = item.advanced || item.word || '';
      const cleanTerm = displayWord.split(' / ')[0].split('(')[0].trim();
      const isSaved = this.isWordSaved(cleanTerm);
      const mastery = this.masteryData[item.id] || 'unrated';

      const tagClass = item.origin === 'c1' ? 'c1' : (item.origin === 'collocations' ? 'colloc' : (item.origin === 'esl' ? 'esl' : 'custom'));

      html += `
        <div class="vocab-card ${tagClass}">
          <div class="vocab-card-header">
            <span class="vocab-origin-pill ${tagClass}">${item.category || 'Vocabulary'}</span>
            <div class="card-header-actions">
              <button class="tool-btn-star ${isSaved ? 'active' : ''}" title="${isSaved ? 'Remove Bookmark' : 'Save to Flashcards'}" onclick="vocabStudio.toggleMatrixBookmark('${item.id}', event)">
                ${isSaved ? '★' : '☆'}
              </button>
              <button class="tool-btn" title="Pronounce" onclick="vocabStudio.pronounce('${cleanTerm}')">🔊</button>
            </div>
          </div>
          <div class="basic-word-tag">${item.basic ? `Prompt / Replace: <strong>${item.basic}</strong>` : 'C1 Expression'}</div>
          <div class="adv-term">${displayWord}</div>
          <div class="adv-ipa">${item.ipa || ''}</div>
          <p class="vocab-definition">${item.def || ''}</p>
          <div class="vocab-example-quote">"${item.example || ''}"</div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  toggleMatrixBookmark(cardId, event) {
    if (event) event.stopPropagation();
    const all = this.getAllMatrixWords();
    const item = all.find(i => i.id === cardId);
    if (!item) return;

    this.toggleSaveWord(item);
    this.renderMatrix(document.getElementById('vocab-search-input')?.value || '', document.querySelector('.matrix-filter-pill.active')?.getAttribute('data-filter') || 'all');
  }

  // ==========================================
  // BOOKMARK & SAVED WORDS REPO
  // ==========================================

  isWordSaved(wordStr) {
    if (!wordStr) return false;
    const clean = wordStr.toLowerCase().trim();
    return this.savedWords.some(w => {
      const term = (w.advanced || w.word || '').toLowerCase();
      return term.includes(clean) || clean.includes(term);
    });
  }

  saveWord({ word, basic = 'Saved Vocabulary', def, example = '', ipa = '', category = 'Saved Word' }) {
    const clean = word.toLowerCase().trim();
    if (this.isWordSaved(clean)) {
      app.showToast(`"${word}" is already in your Saved Flashcards deck!`, 'info');
      return;
    }

    const newCard = {
      id: `saved_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      basic,
      advanced: word,
      word,
      ipa: ipa || `/${clean}/`,
      def: def || 'Saved word from reading or conversation.',
      example: example || `Using "${word}" in daily deliberate practice.`,
      category
    };

    this.savedWords.unshift(newCard);
    this.saveSavedWords();
    this.updateDeckCounts();

    if (window.goalsManager) {
      window.goalsManager.logActivity('vocabulary', 10, `Saved Word: ${word}`);
    }

    app.showToast(`🌟 "${word}" saved to your Flashcard Deck! (+10 XP)`, 'success');
  }

  removeSavedWord(wordStr) {
    const clean = wordStr.toLowerCase().trim();
    this.savedWords = this.savedWords.filter(w => {
      const term = (w.advanced || w.word || '').toLowerCase();
      return !term.includes(clean) && !clean.includes(term);
    });
    this.saveSavedWords();
    this.updateDeckCounts();
    app.showToast(`Removed from saved flashcards.`, 'info');
  }

  toggleSaveWord(item) {
    const term = item.advanced || item.word || '';
    if (this.isWordSaved(term)) {
      this.removeSavedWord(term);
    } else {
      this.saveWord({
        word: term,
        basic: item.basic,
        def: item.def,
        example: item.example,
        ipa: item.ipa,
        category: item.category || 'Saved'
      });
    }
  }

  addCustomWord({ word, basic, def, example, ipa, category }) {
    this.saveWord({ word, basic, def, example, ipa, category });
    this.renderMatrix();
    if (this.currentDeckKey === 'saved') {
      this.renderCurrentDeck();
    }
  }

  // ==========================================
  // COLLOCATION & IDIOM CHALLENGE QUIZ
  // ==========================================

  renderQuiz() {
    const container = document.getElementById('colloc-quiz-container');
    if (!container) return;

    const q = this.quizQuestions[this.quizIndex];
    if (!q) {
      this.renderQuizCompletion();
      return;
    }

    this.quizAnswered = false;

    let html = `
      <div class="colloc-quiz-card">
        <div class="colloc-quiz-header">
          <span class="quiz-step-tag">Challenge ${this.quizIndex + 1} of ${this.quizQuestions.length}</span>
          <span class="quiz-score-tag">Score: ${this.quizScore} / ${this.quizIndex}</span>
        </div>
        <h3 class="colloc-quiz-prompt">"${q.prompt}"</h3>
        <p class="colloc-quiz-sub">Select the native C1 collocation to complete the sentence:</p>
        <div class="colloc-options-grid">
          ${q.options.map((opt, idx) => `
            <button class="colloc-opt-btn" onclick="vocabStudio.answerQuiz(${idx})">
              <span class="opt-letter">${String.fromCharCode(65 + idx)}</span>
              <span class="opt-text">${opt}</span>
            </button>
          `).join('')}
        </div>
        <div id="colloc-quiz-feedback" class="colloc-quiz-feedback" style="display:none;"></div>
      </div>
    `;

    container.innerHTML = html;
  }

  answerQuiz(selectedIdx) {
    if (this.quizAnswered) return;
    this.quizAnswered = true;

    const q = this.quizQuestions[this.quizIndex];
    const isCorrect = selectedIdx === q.answer;
    if (isCorrect) this.quizScore++;

    const buttons = document.querySelectorAll('.colloc-opt-btn');
    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.answer) {
        btn.classList.add('correct');
      } else if (idx === selectedIdx && !isCorrect) {
        btn.classList.add('wrong');
      }
    });

    const feedbackEl = document.getElementById('colloc-quiz-feedback');
    if (feedbackEl) {
      feedbackEl.style.display = 'block';
      feedbackEl.innerHTML = `
        <div class="feedback-banner ${isCorrect ? 'correct' : 'wrong'}">
          <div class="fb-icon">${isCorrect ? '✅ Well done!' : '❌ Not quite.'}</div>
          <p class="fb-text"><strong>${q.collocation}</strong> — ${q.explanation}</p>
          <div class="fb-action">
            <button class="btn btn-secondary btn-sm" onclick="vocabStudio.pronounce('${q.collocation}')">🔊 Listen</button>
            <button class="btn btn-primary btn-sm" onclick="vocabStudio.nextQuizQuestion()">Next Challenge &rarr;</button>
          </div>
        </div>
      `;
    }

    if (window.goalsManager) {
      const xp = isCorrect ? 20 : 5;
      window.goalsManager.logActivity('vocabulary', xp, 'Collocation Challenge');
    }
  }

  nextQuizQuestion() {
    this.quizIndex++;
    if (this.quizIndex >= this.quizQuestions.length) {
      this.renderQuizCompletion();
    } else {
      this.renderQuiz();
    }
  }

  renderQuizCompletion() {
    const container = document.getElementById('colloc-quiz-container');
    if (!container) return;

    const pct = Math.round((this.quizScore / this.quizQuestions.length) * 100);

    container.innerHTML = `
      <div class="colloc-quiz-card completion-card">
        <div class="completion-icon">🏆</div>
        <h3>Collocation Drill Complete!</h3>
        <p class="completion-score">You scored <strong>${this.quizScore} out of ${this.quizQuestions.length}</strong> (${pct}%)</p>
        <p class="completion-msg">
          ${pct >= 80 ? 'Incredible! Your intuition for native collocations and phrasal phrasing is sharp.' : 'Great practice! Review the B2→C1 and Collocation flashcards to solidify these patterns.'}
        </p>
        <div class="completion-actions">
          <button class="btn btn-secondary" onclick="vocabStudio.restartQuiz()">🔄 Retake Quiz</button>
          <button class="btn btn-primary" onclick="vocabStudio.switchMode('flashcards')">🗂️ Practice Flashcards</button>
        </div>
      </div>
    `;

    if (pct >= 80 && window.goalsManager) {
      window.goalsManager.triggerConfetti();
    }
  }

  restartQuiz() {
    this.quizIndex = 0;
    this.quizScore = 0;
    this.quizAnswered = false;
    this.renderQuiz();
  }
}
