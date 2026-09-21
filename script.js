/**
 * Study Time Planner
 * Plain JavaScript implementation for scheduling study sessions.
 * Features live clock and interactive study session timer.
 * Zero external libraries or frameworks.
 */

// Constant default start time: 09:00 AM (9 * 60 minutes)
const DEFAULT_START_MINUTES = 9 * 60;

// DOM Elements - Planner Input
const availableTimeInput = document.getElementById('available-time');
const subjectsList = document.getElementById('subjects-list');
const btnAddSubject = document.getElementById('btn-add-subject');
const btnCreatePlan = document.getElementById('btn-create-plan');
const btnClear = document.getElementById('btn-clear');
const btnLoadExample = document.getElementById('btn-load-example');
const errorBanner = document.getElementById('error-banner');

// DOM Elements - Planner Output
const emptyState = document.getElementById('empty-state');
const scheduleOutput = document.getElementById('schedule-output');
const timelineList = document.getElementById('timeline-list');
const remainingNotice = document.getElementById('remaining-notice');

// DOM Elements - Summary
const summaryTotalTime = document.getElementById('summary-total-time');
const summarySubjectsCount = document.getElementById('summary-subjects-count');
const summaryRemainingTime = document.getElementById('summary-remaining-time');

// DOM Elements - Theme & Clock
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const themeLabel = document.getElementById('theme-label');
const clockDisplay = document.getElementById('clock-display');

// DOM Elements - Study Session Timer
const sessionTimerCard = document.getElementById('session-timer-card');
const timerSubjectName = document.getElementById('timer-subject-name');
const timerTargetTime = document.getElementById('timer-target-time');
const timerCountdown = document.getElementById('timer-countdown');
const timerProgressBar = document.getElementById('timer-progress-bar');
const btnTimerToggle = document.getElementById('btn-timer-toggle');
const timerToggleIcon = document.getElementById('timer-toggle-icon');
const timerToggleText = document.getElementById('timer-toggle-text');
const btnTimerReset = document.getElementById('btn-timer-reset');
const btnCloseTimer = document.getElementById('btn-close-timer');

// Default initial subjects
const DEFAULT_SUBJECTS = [
  { name: 'DSA', hours: 2 },
  { name: 'React', hours: 1 },
  { name: 'Node.js', hours: 1 }
];

// Active Timer State
let timerInterval = null;
let timerTotalSeconds = 0;
let timerRemainingSeconds = 0;
let timerIsRunning = false;
let currentTimerSubject = null;
let activeScheduleItems = [];

/* --------------------------------------------------------------------------
   Live Current Clock
   -------------------------------------------------------------------------- */
function updateLiveClock() {
  if (!clockDisplay) return;
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  if (hours === 0) hours = 12;
  const paddedHours = String(hours).padStart(2, '0');

  clockDisplay.textContent = `${paddedHours}:${minutes}:${seconds} ${ampm}`;
}

function initClock() {
  updateLiveClock();
  setInterval(updateLiveClock, 1000);
}

/* --------------------------------------------------------------------------
   Theme Management
   -------------------------------------------------------------------------- */
function initTheme() {
  let savedTheme = null;
  try {
    if (typeof localStorage !== 'undefined') {
      savedTheme = localStorage.getItem('study_planner_theme');
    }
  } catch (e) {
    console.warn('localStorage is not available:', e);
  }

  let prefersDark = false;
  try {
    prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch (e) {
    // Ignore matchMedia errors
  }

  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  applyTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('study_planner_theme', newTheme);
        }
      } catch (e) {
        // Ignore fallback
      }
    });
  }
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (themeIcon) themeIcon.textContent = '☀️';
    if (themeLabel) themeLabel.textContent = 'Light';
    if (themeToggleBtn) themeToggleBtn.setAttribute('aria-label', 'Switch to light mode');
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (themeIcon) themeIcon.textContent = '🌙';
    if (themeLabel) themeLabel.textContent = 'Dark';
    if (themeToggleBtn) themeToggleBtn.setAttribute('aria-label', 'Switch to dark mode');
  }
}

/* --------------------------------------------------------------------------
   Subject Rows Management
   -------------------------------------------------------------------------- */
/**
 * Creates and appends a new subject row to the list.
 * @param {string} name - Initial subject name
 * @param {number|string} hours - Initial subject hours
 * @param {boolean} shouldFocus - Whether to focus the new row's subject name input
 */
function addSubject(name = '', hours = '', shouldFocus = false) {
  if (!subjectsList) return;

  const row = document.createElement('div');
  row.className = 'subject-row';
  row.setAttribute('role', 'listitem');

  row.innerHTML = `
    <div class="subject-name-wrapper">
      <input
        type="text"
        class="form-control subject-name-input"
        placeholder="Subject name (e.g. DSA)"
        value="${escapeHtml(name)}"
        aria-label="Subject name"
        required
      >
    </div>
    <div class="subject-hours-wrapper">
      <input
        type="number"
        class="form-control subject-hours-input"
        min="0.1"
        step="0.5"
        placeholder="Hours"
        value="${hours !== '' ? hours : ''}"
        aria-label="Subject study hours"
        required
      >
      <span class="input-addon">hrs</span>
    </div>
    <button type="button" class="btn-remove" aria-label="Remove this subject">
      Remove
    </button>
  `;

  // Attach event listener to Remove button
  const removeBtn = row.querySelector('.btn-remove');
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      row.remove();
    });
  }

  subjectsList.appendChild(row);

  if (shouldFocus) {
    const nameInput = row.querySelector('.subject-name-input');
    if (nameInput) {
      nameInput.focus();
    }
  }
}

/**
 * Escapes HTML characters to prevent XSS when rendering user inputs
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Collects current subjects from the DOM.
 * @returns {Array<{name: string, hours: number, rawHours: string}>}
 */
function getSubjectsData() {
  if (!subjectsList) return [];
  const rows = subjectsList.querySelectorAll('.subject-row');
  const subjects = [];

  rows.forEach(row => {
    const nameInput = row.querySelector('.subject-name-input');
    const hoursInput = row.querySelector('.subject-hours-input');

    const rawName = nameInput ? nameInput.value : '';
    const rawHours = hoursInput ? hoursInput.value.trim() : '';
    const parsedHours = parseFloat(rawHours);

    subjects.push({
      name: rawName.trim(),
      hours: isNaN(parsedHours) ? 0 : parsedHours,
      rawHours: rawHours
    });
  });

  return subjects;
}

/* --------------------------------------------------------------------------
   Validation Logic
   -------------------------------------------------------------------------- */
/**
 * Validates available time and subjects list according to specifications.
 * @param {number} availableHours
 * @param {string} rawAvailableHours
 * @param {Array<{name: string, hours: number, rawHours: string}>} subjects
 * @returns {string|null} Error message or null if valid
 */
function validate(availableHours, rawAvailableHours, subjects) {
  // 1. Available study time exists
  if (!rawAvailableHours || rawAvailableHours.trim() === '' || isNaN(availableHours)) {
    return 'Please enter your available study time.';
  }

  // 2. Available study time is greater than 0
  if (availableHours <= 0) {
    return 'Study hours must be greater than 0.';
  }

  // 3. At least one subject exists
  if (subjects.length === 0) {
    return 'Please add at least one subject.';
  }

  // 4. Every subject has a name
  for (let i = 0; i < subjects.length; i++) {
    if (subjects[i].name === '') {
      return 'Please enter a name for every subject.';
    }
  }

  // 5 & 6. Every subject has valid hours greater than 0
  for (let i = 0; i < subjects.length; i++) {
    if (subjects[i].rawHours === '' || isNaN(parseFloat(subjects[i].rawHours))) {
      return 'Study hours must be greater than 0.';
    }
    if (subjects[i].hours <= 0) {
      return 'Study hours must be greater than 0.';
    }
  }

  // 7. Total subject hours cannot exceed available time
  const totalSubjectHours = subjects.reduce((sum, s) => sum + s.hours, 0);
  if (totalSubjectHours > availableHours) {
    return `Your subjects require ${formatHours(totalSubjectHours)}, but you only have ${formatHours(availableHours)} available.`;
  }

  return null;
}

function showError(message) {
  if (!errorBanner) return;
  errorBanner.textContent = message;
  errorBanner.classList.remove('hidden');
}

function clearError() {
  if (!errorBanner) return;
  errorBanner.textContent = '';
  errorBanner.classList.add('hidden');
}

/* --------------------------------------------------------------------------
   Time Calculation and Formatting
   -------------------------------------------------------------------------- */
/**
 * Converts total minutes from midnight into 12-hour AM/PM string (e.g. 09:00 AM, 01:30 PM).
 * @param {number} totalMinutes
 * @returns {string}
 */
function formatTime(totalMinutes) {
  const normalized = Math.floor(totalMinutes) % 1440;
  let hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';

  let displayHours = hours % 12;
  if (displayHours === 0) {
    displayHours = 12;
  }

  const paddedHours = String(displayHours).padStart(2, '0');
  const paddedMinutes = String(minutes).padStart(2, '0');

  return `${paddedHours}:${paddedMinutes} ${ampm}`;
}

/**
 * Formats a number of hours into clean string, singular/plural.
 * e.g. 1 -> "1 hour", 2 -> "2 hours", 1.5 -> "1.5 hours"
 * @param {number} hours
 * @returns {string}
 */
function formatHours(hours) {
  const rounded = Math.round(hours * 100) / 100;
  return rounded === 1 ? '1 hour' : `${rounded} hours`;
}

/**
 * Converts seconds into HH:MM:SS format.
 * @param {number} totalSec
 * @returns {string}
 */
function formatCountdown(totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  const paddedH = String(h).padStart(2, '0');
  const paddedM = String(m).padStart(2, '0');
  const paddedS = String(s).padStart(2, '0');

  return `${paddedH}:${paddedM}:${paddedS}`;
}

/**
 * Plays a gentle, pleasant notification chime via Web Audio API when a study timer completes.
 */
function playChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Note 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Note 2: B5 (987.77 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.2);
    gain2.gain.setValueAtTime(0.12, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.2);
    osc2.stop(now + 0.75);
  } catch (e) {
    // Audio context not allowed or unsupported
  }
}

/**
 * Generates schedule items sequentially starting at 09:00 AM.
 * @param {Array<{name: string, hours: number}>} subjects
 * @returns {Array<{name: string, hours: number, startTime: string, endTime: string}>}
 */
function generateSchedule(subjects) {
  let currentMinutes = DEFAULT_START_MINUTES;
  const schedule = [];

  subjects.forEach(subject => {
    const durationMinutes = Math.round(subject.hours * 60);
    const startMinutes = currentMinutes;
    const endMinutes = currentMinutes + durationMinutes;

    schedule.push({
      name: subject.name,
      hours: subject.hours,
      startTime: formatTime(startMinutes),
      endTime: formatTime(endMinutes)
    });

    currentMinutes = endMinutes;
  });

  return schedule;
}

/* --------------------------------------------------------------------------
   Rendering Schedule
   -------------------------------------------------------------------------- */
/**
 * Renders the generated schedule and summary into the DOM.
 */
function renderSchedule(schedule, totalHours, availableHours) {
  activeScheduleItems = schedule;
  const remainingHours = Math.max(0, Math.round((availableHours - totalHours) * 100) / 100);

  // Update Summary Bar
  if (summaryTotalTime) summaryTotalTime.textContent = formatHours(totalHours);
  if (summarySubjectsCount) summarySubjectsCount.textContent = schedule.length;
  if (summaryRemainingTime) summaryRemainingTime.textContent = formatHours(remainingHours);

  // Build Timeline Items
  if (timelineList) {
    timelineList.innerHTML = '';
    schedule.forEach((item, index) => {
      const timelineItem = document.createElement('div');
      timelineItem.className = 'timeline-item';
      timelineItem.setAttribute('role', 'listitem');
      timelineItem.setAttribute('data-index', index);

      timelineItem.innerHTML = `
        <div class="timeline-card">
          <div class="timeline-content">
            <span class="timeline-time">${escapeHtml(item.startTime)} — ${escapeHtml(item.endTime)}</span>
            <h4 class="timeline-subject">${escapeHtml(item.name)}</h4>
          </div>
          <div class="timeline-actions">
            <span class="timeline-duration-badge">${formatHours(item.hours)}</span>
            <button type="button" class="btn-start-session" data-index="${index}" aria-label="Start timer for ${escapeHtml(item.name)}">
              <span>▶</span> Start Timer
            </button>
          </div>
        </div>
      `;

      // Click to start timer for this session
      const startBtn = timelineItem.querySelector('.btn-start-session');
      if (startBtn) {
        startBtn.addEventListener('click', () => {
          startSessionTimer(index, item);
        });
      }

      timelineList.appendChild(timelineItem);
    });
  }

  // Remaining Notice
  if (remainingNotice) {
    if (remainingHours > 0) {
      remainingNotice.textContent = `${formatHours(remainingHours)} remaining`;
      remainingNotice.classList.remove('hidden');
    } else {
      remainingNotice.textContent = '';
      remainingNotice.classList.add('hidden');
    }
  }

  // Reveal Output Card
  if (emptyState) emptyState.classList.add('hidden');
  if (scheduleOutput) scheduleOutput.classList.remove('hidden');
}

/* --------------------------------------------------------------------------
   Study Session Timer Logic
   -------------------------------------------------------------------------- */
function startSessionTimer(index, item) {
  // Clear any existing active timer interval
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  currentTimerSubject = item;
  timerTotalSeconds = Math.max(1, Math.round(item.hours * 3600));
  timerRemainingSeconds = timerTotalSeconds;

  // Update Timer Card UI
  if (timerSubjectName) timerSubjectName.textContent = item.name;
  if (timerTargetTime) {
    timerTargetTime.textContent = `${item.startTime} — ${item.endTime} (${formatHours(item.hours)})`;
  }
  if (timerCountdown) {
    timerCountdown.classList.remove('timer-finished');
    timerCountdown.textContent = formatCountdown(timerRemainingSeconds);
  }
  if (timerProgressBar) {
    timerProgressBar.style.width = '100%';
  }

  // Highlight active timeline row
  highlightActiveTimelineItem(index);

  // Reveal Timer Card
  if (sessionTimerCard) {
    sessionTimerCard.classList.remove('hidden');
    sessionTimerCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Automatically start timer
  startTimerCountdown();
}

function startTimerCountdown() {
  timerIsRunning = true;
  updateTimerToggleButton(true);

  timerInterval = setInterval(() => {
    timerRemainingSeconds--;

    if (timerRemainingSeconds <= 0) {
      // Completed!
      timerRemainingSeconds = 0;
      clearInterval(timerInterval);
      timerInterval = null;
      timerIsRunning = false;
      updateTimerToggleButton(false);

      if (timerCountdown) {
        timerCountdown.textContent = 'Session Finished! 🎉';
        timerCountdown.classList.add('timer-finished');
      }
      if (timerProgressBar) {
        timerProgressBar.style.width = '0%';
      }

      playChime();
      return;
    }

    // Update countdown display and progress bar
    if (timerCountdown) {
      timerCountdown.textContent = formatCountdown(timerRemainingSeconds);
    }
    if (timerProgressBar && timerTotalSeconds > 0) {
      const pct = (timerRemainingSeconds / timerTotalSeconds) * 100;
      timerProgressBar.style.width = `${pct}%`;
    }
  }, 1000);
}

function pauseTimerCountdown() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerIsRunning = false;
  updateTimerToggleButton(false);
}

function toggleTimer() {
  if (!currentTimerSubject) return;

  if (timerIsRunning) {
    pauseTimerCountdown();
  } else {
    // If timer completed, reset first
    if (timerRemainingSeconds <= 0) {
      timerRemainingSeconds = timerTotalSeconds;
      if (timerCountdown) timerCountdown.classList.remove('timer-finished');
    }
    startTimerCountdown();
  }
}

function resetTimer() {
  pauseTimerCountdown();
  if (!currentTimerSubject) return;

  timerRemainingSeconds = timerTotalSeconds;
  if (timerCountdown) {
    timerCountdown.classList.remove('timer-finished');
    timerCountdown.textContent = formatCountdown(timerRemainingSeconds);
  }
  if (timerProgressBar) {
    timerProgressBar.style.width = '100%';
  }
}

function closeTimer() {
  pauseTimerCountdown();
  currentTimerSubject = null;
  if (sessionTimerCard) sessionTimerCard.classList.add('hidden');
  clearActiveTimelineHighlight();
}

function updateTimerToggleButton(isRunning) {
  if (!timerToggleIcon || !timerToggleText) return;
  if (isRunning) {
    timerToggleIcon.textContent = '⏸';
    timerToggleText.textContent = 'Pause Timer';
  } else {
    timerToggleIcon.textContent = '▶';
    timerToggleText.textContent = timerRemainingSeconds < timerTotalSeconds ? 'Resume Timer' : 'Start Timer';
  }
}

function highlightActiveTimelineItem(activeIndex) {
  if (!timelineList) return;
  const items = timelineList.querySelectorAll('.timeline-item');
  items.forEach((it, i) => {
    const btn = it.querySelector('.btn-start-session');
    if (i === activeIndex) {
      it.classList.add('timeline-item--active');
      if (btn) {
        btn.classList.add('is-active');
        btn.innerHTML = '<span>⚡</span> In Progress';
      }
    } else {
      it.classList.remove('timeline-item--active');
      if (btn) {
        btn.classList.remove('is-active');
        btn.innerHTML = '<span>▶</span> Start Timer';
      }
    }
  });
}

function clearActiveTimelineHighlight() {
  if (!timelineList) return;
  const items = timelineList.querySelectorAll('.timeline-item');
  items.forEach(it => {
    it.classList.remove('timeline-item--active');
    const btn = it.querySelector('.btn-start-session');
    if (btn) {
      btn.classList.remove('is-active');
      btn.innerHTML = '<span>▶</span> Start Timer';
    }
  });
}

/* --------------------------------------------------------------------------
   Actions & Handlers
   -------------------------------------------------------------------------- */
function createStudyPlan() {
  clearError();

  const rawAvailable = availableTimeInput ? availableTimeInput.value : '';
  const availableHours = parseFloat(rawAvailable);
  const subjects = getSubjectsData();

  const errorMessage = validate(availableHours, rawAvailable, subjects);
  if (errorMessage) {
    showError(errorMessage);
    return;
  }

  const totalHours = subjects.reduce((sum, s) => sum + s.hours, 0);
  const schedule = generateSchedule(subjects);
  renderSchedule(schedule, totalHours, availableHours);
}

function clearPlanner() {
  clearError();
  closeTimer();

  // Clear inputs
  if (availableTimeInput) availableTimeInput.value = '';
  if (subjectsList) subjectsList.innerHTML = '';

  // Reset summary and hide schedule
  if (scheduleOutput) scheduleOutput.classList.add('hidden');
  if (emptyState) emptyState.classList.remove('hidden');
  if (timelineList) timelineList.innerHTML = '';
  if (remainingNotice) remainingNotice.classList.add('hidden');

  if (summaryTotalTime) summaryTotalTime.textContent = '0 hours';
  if (summarySubjectsCount) summarySubjectsCount.textContent = '0';
  if (summaryRemainingTime) summaryRemainingTime.textContent = '0 hours';
}

function loadExample() {
  clearError();
  closeTimer();

  // Populate example available time
  if (availableTimeInput) availableTimeInput.value = '4';

  // Populate example subjects
  if (subjectsList) {
    subjectsList.innerHTML = '';
    DEFAULT_SUBJECTS.forEach(sub => {
      addSubject(sub.name, sub.hours, false);
    });
  }

  // Reset output to empty state
  if (scheduleOutput) scheduleOutput.classList.add('hidden');
  if (emptyState) emptyState.classList.remove('hidden');
  if (timelineList) timelineList.innerHTML = '';
  if (remainingNotice) remainingNotice.classList.add('hidden');
}

/* --------------------------------------------------------------------------
   Initialization
   -------------------------------------------------------------------------- */
function init() {
  initClock();
  initTheme();

  // Populate initial default subjects if list is empty
  if (subjectsList && subjectsList.children.length === 0) {
    DEFAULT_SUBJECTS.forEach(sub => {
      addSubject(sub.name, sub.hours, false);
    });
  }

  // Event Listeners - Planner Form
  if (btnAddSubject) {
    btnAddSubject.addEventListener('click', () => {
      addSubject('', '', true);
    });
  }

  if (btnCreatePlan) btnCreatePlan.addEventListener('click', createStudyPlan);
  if (btnClear) btnClear.addEventListener('click', clearPlanner);
  if (btnLoadExample) btnLoadExample.addEventListener('click', loadExample);

  // Event Listeners - Study Session Timer
  if (btnTimerToggle) btnTimerToggle.addEventListener('click', toggleTimer);
  if (btnTimerReset) btnTimerReset.addEventListener('click', resetTimer);
  if (btnCloseTimer) btnCloseTimer.addEventListener('click', closeTimer);
}

// Ensure execution whether DOM is still loading or already ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
