/**
 * FLUENTLY - Daily Goals, Streak Tracking & XP Engine
 * Tracks daily practice across modules, computes consecutive day streaks,
 * awards XP, and motivates intermediate learners with milestones and celebratory effects.
 */

class GoalsManager {
  constructor() {
    this.storageKey = 'fluently_goals_data_v1';
    this.data = this.loadData();
    this.checkDayRollover();
  }

  loadData() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to load goals data:', e);
    }

    const todayStr = this.getTodayDateString();
    return {
      streak: 4, // Default initial baseline for existing intermediate learners
      lastActiveDate: todayStr,
      xp: 420,
      level: 'B2 Intermediate',
      targetMinutes: 20,
      todayDate: todayStr,
      todayTasks: {
        writing: false,
        speaking: false,
        reading: false,
        dialogue: false
      },
      weeklyHistory: this.generateInitialWeek(todayStr, 4)
    };
  }

  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save goals data:', e);
    }
  }

  getTodayDateString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  generateInitialWeek(todayStr, streakCount) {
    // Generate the last 7 days with past days active up to streakCount
    const week = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      // If within recent streak days
      const isCompleted = i === 0 ? false : (i < streakCount);
      week.push({
        date: dateStr,
        dayName,
        completed: isCompleted,
        xp: isCompleted ? 100 : 0
      });
    }
    return week;
  }

  checkDayRollover() {
    const todayStr = this.getTodayDateString();
    if (this.data.todayDate !== todayStr) {
      // Determine day difference
      const lastDate = new Date(this.data.lastActiveDate || this.data.todayDate);
      const currentDate = new Date(todayStr);
      const diffTime = Math.abs(currentDate - lastDate);
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
        // Streak lost if missed more than 1 day
        this.data.streak = 0;
      }

      this.data.todayDate = todayStr;
      this.data.todayTasks = {
        writing: false,
        speaking: false,
        reading: false,
        dialogue: false
      };

      // Rotate weekly history
      this.updateWeeklyHistory(todayStr);
      this.saveData();
    }
  }

  updateWeeklyHistory(todayStr) {
    if (!this.data.weeklyHistory) {
      this.data.weeklyHistory = this.generateInitialWeek(todayStr, this.data.streak);
      return;
    }
    const exists = this.data.weeklyHistory.find(h => h.date === todayStr);
    if (!exists) {
      const d = new Date();
      this.data.weeklyHistory.push({
        date: todayStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: false,
        xp: 0
      });
      if (this.data.weeklyHistory.length > 7) {
        this.data.weeklyHistory.shift();
      }
    }
  }

  /**
   * Log activity when a user completes practice in any track
   * @param {'writing' | 'speaking' | 'reading' | 'dialogue'} moduleType
   * @param {number} xpAmount
   * @param {string} description
   */
  logActivity(moduleType, xpAmount = 30, description = 'Practice Completed') {
    this.checkDayRollover();

    const wasModuleDone = this.data.todayTasks[moduleType];
    this.data.todayTasks[moduleType] = true;
    this.data.xp += xpAmount;

    // Check if today qualifies for streak increment
    const completedTasksCount = Object.values(this.data.todayTasks).filter(Boolean).length;
    const todayStr = this.getTodayDateString();

    // At least 2 tasks completed marks the day as a streak milestone!
    if (completedTasksCount >= 2 && this.data.lastActiveDate !== todayStr) {
      this.data.streak += 1;
      this.data.lastActiveDate = todayStr;
      this.triggerConfetti();
      if (window.app && window.app.showToast) {
        window.app.showToast(`🔥 Streak Extended! ${this.data.streak} Days Strong! (+50 Bonus XP)`, 'success');
      }
      this.data.xp += 50;
    }

    // Update today's entry in weekly history
    const todayEntry = this.data.weeklyHistory.find(h => h.date === todayStr);
    if (todayEntry) {
      todayEntry.completed = completedTasksCount >= 2;
      todayEntry.xp = (todayEntry.xp || 0) + xpAmount;
    }

    this.saveData();
    this.renderGoalsUI();

    if (!wasModuleDone && window.app && window.app.showToast) {
      window.app.showToast(`+${xpAmount} XP earned in ${this.formatModuleName(moduleType)}! 🌟`, 'success');
    }
  }

  formatModuleName(key) {
    const map = {
      writing: 'Writing Lab',
      speaking: 'Speaking Studio',
      reading: 'Reading Lounge',
      dialogue: 'Roleplay Partner'
    };
    return map[key] || key;
  }

  getTodayCompletedCount() {
    return Object.values(this.data.todayTasks).filter(Boolean).length;
  }

  getTotalTasksCount() {
    return Object.keys(this.data.todayTasks).length;
  }

  getProgressPercentage() {
    return Math.round((this.getTodayCompletedCount() / this.getTotalTasksCount()) * 100);
  }

  renderGoalsUI() {
    // 1. Sidebar Streak Widget
    const streakDaysEl = document.getElementById('streak-days');
    if (streakDaysEl) {
      streakDaysEl.innerText = `${this.data.streak} Day Streak`;
    }
    const streakSubEl = document.querySelector('.streak-sub');
    if (streakSubEl) {
      const completedCount = this.getTodayCompletedCount();
      streakSubEl.innerText = `${completedCount}/4 Daily Goals Complete · ${this.data.xp} XP`;
    }

    // 2. Dashboard Tracker Card (if present)
    const goalPctEl = document.getElementById('daily-goal-pct');
    const goalFillEl = document.getElementById('daily-goal-fill');
    const goalXpEl = document.getElementById('daily-total-xp');
    const goalStreakBadge = document.getElementById('daily-streak-badge');

    if (goalPctEl) goalPctEl.innerText = `${this.getProgressPercentage()}%`;
    if (goalFillEl) goalFillEl.style.width = `${this.getProgressPercentage()}%`;
    if (goalXpEl) goalXpEl.innerText = `${this.data.xp} XP`;
    if (goalStreakBadge) goalStreakBadge.innerText = `${this.data.streak} Days`;

    // 3. Daily task checklist checkboxes in dashboard/modal
    ['writing', 'speaking', 'reading', 'dialogue'].forEach(task => {
      const checkEl = document.getElementById(`goal-check-${task}`);
      const rowEl = document.getElementById(`goal-row-${task}`);
      if (checkEl) {
        checkEl.checked = !!this.data.todayTasks[task];
      }
      if (rowEl) {
        if (this.data.todayTasks[task]) {
          rowEl.classList.add('completed');
        } else {
          rowEl.classList.remove('completed');
        }
      }
    });

    // 4. Weekly 7-day pill bar
    const weekContainer = document.getElementById('weekly-streak-days');
    if (weekContainer && this.data.weeklyHistory) {
      weekContainer.innerHTML = this.data.weeklyHistory.map(day => {
        const isToday = day.date === this.getTodayDateString();
        const activeClass = day.completed ? 'completed' : '';
        const todayClass = isToday ? 'today' : '';
        return `
          <div class="week-day-pill ${activeClass} ${todayClass}" title="${day.date}: ${day.completed ? 'Goal Achieved' : 'Incomplete'}">
            <span class="day-label">${day.dayName}</span>
            <span class="day-icon">${day.completed ? '✓' : (isToday ? '•' : '—')}</span>
          </div>
        `;
      }).join('');
    }

    // 5. Update user-level tag in header with XP
    const userLevelTag = document.querySelector('.user-level-tag');
    if (userLevelTag) {
      userLevelTag.innerHTML = `Level: <strong>B1/B2</strong> · <span style="color:var(--accent-gold); font-weight:700;">★ ${this.data.xp} XP</span>`;
    }
  }

  openGoalsModal() {
    const modal = document.getElementById('goals-modal');
    if (modal) {
      this.renderGoalsUI();
      modal.style.display = 'flex';
    }
  }

  closeGoalsModal() {
    const modal = document.getElementById('goals-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  triggerConfetti() {
    // Lightweight canvas confetti effect without external libraries
    const canvas = document.createElement('canvas');
    canvas.id = 'streak-confetti-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#eab308', '#4361ee', '#10b981', '#f43f5e', '#a855f7', '#38bdf8'];
    const particles = [];
    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.4,
        r: Math.random() * 6 + 3,
        dx: (Math.random() - 0.5) * 16,
        dy: (Math.random() - 0.7) * 18,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 10,
        tiltAngleInc: (Math.random() * 0.07) + 0.05,
        tiltAngle: 0,
        life: 100
      });
    }

    let frame = 0;
    function renderConfetti() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;

      particles.forEach(p => {
        p.tiltAngle += p.tiltAngleInc;
        p.y += (Math.cos(p.tiltAngle) + 1 + p.r / 2) / 2 + 1.2;
        p.x += Math.sin(p.tiltAngle);
        p.tilt = Math.sin(p.tiltAngle) * 12;

        p.life -= 1;
        if (p.life > 0) active = true;

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 3, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 3);
        ctx.stroke();
      });

      frame++;
      if (active && frame < 150) {
        requestAnimationFrame(renderConfetti);
      } else {
        canvas.remove();
      }
    }
    renderConfetti();
  }
}

// Global instance initialization
window.goalsManager = new GoalsManager();
