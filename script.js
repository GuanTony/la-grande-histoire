/* ==========================================================================
   LA GRANDE HISTOIRE - 15-SECOND AUTOMATIC SLIDESHOW & PROGRESSION (PAGES 1-17)
   ========================================================================== */

const state = {
  currentPage: 1,
  unlockedPages: [1],
  currentMode: 'slideshow', // Default directly to slideshow
  currentSlide: {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0,
    11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0
  },
  passwords: {
    1: 'peuple',
    2: 'repos',
    3: 'devant',
    4: 'David',
    5: 'Toujours',
    6: 'Juda',
    7: 'Espérance',
    8: 'Homme',
    9: 'Esprit',
    10: 'Messager',
    11: 'Nations',
    12: 'culte',
    13: 'servir',
    14: 'Amour',
    15: 'Oeuvre',
    16: 'Patience'
  }
};

// Restore saved progress
try {
  const saved = localStorage.getItem('lgh_concrete_unlocked');
  if (saved) {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      state.unlockedPages = Array.from(new Set([1, ...parsed]));
    }
  }
} catch (e) {}

// --------------------------------------------------------------------------
// 15-Second Automatic Slideshow Timer & Progress Bar
// --------------------------------------------------------------------------
const SLIDE_DURATION = 15000; // 15 seconds
let slideStartTime = Date.now();
let slideTimerAnim = null;

function resetSlideTimer() {
  slideStartTime = Date.now();
}

function updateProgressBar() {
  const elapsed = Date.now() - slideStartTime;
  const progress = Math.min(100, (elapsed / SLIDE_DURATION) * 100);

  const bar = document.getElementById(`progress-${state.currentPage}`);
  if (bar) {
    bar.style.width = `${progress}%`;
  }

  if (elapsed >= SLIDE_DURATION) {
    if (state.currentMode === 'slideshow' && state.currentPage <= 17) {
      nextSlide(state.currentPage, false); // auto next
    }
    resetSlideTimer();
  }

  slideTimerAnim = requestAnimationFrame(updateProgressBar);
}

// --------------------------------------------------------------------------
// View Mode Switcher (Slideshow vs Grid)
// --------------------------------------------------------------------------
const modeGridBtn = document.getElementById('mode-grid-btn');
const modeSlideBtn = document.getElementById('mode-slide-btn');

function setViewMode(mode) {
  state.currentMode = mode;
  if (mode === 'grid') {
    if (modeGridBtn) modeGridBtn.classList.add('active');
    if (modeSlideBtn) modeSlideBtn.classList.remove('active');
    document.querySelectorAll('.mosaic-grid').forEach(el => el.classList.remove('hidden'));
    document.querySelectorAll('.slideshow-view').forEach(el => el.classList.add('hidden'));
  } else {
    if (modeSlideBtn) modeSlideBtn.classList.add('active');
    if (modeGridBtn) modeGridBtn.classList.remove('active');
    document.querySelectorAll('.mosaic-grid').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.slideshow-view').forEach(el => el.classList.remove('hidden'));
    resetSlideTimer();
    updateSlideDisplay(state.currentPage);
  }
}

if (modeGridBtn && modeSlideBtn) {
  modeGridBtn.addEventListener('click', () => setViewMode('grid'));
  modeSlideBtn.addEventListener('click', () => setViewMode('slideshow'));
}

// Clicking any card in the grid zooms directly into the slideshow
document.querySelectorAll('.panel-card').forEach(card => {
  card.addEventListener('click', () => {
    const index = parseInt(card.getAttribute('data-index'), 10) || 0;
    state.currentSlide[state.currentPage] = index;
    setViewMode('slideshow');
  });
});

// --------------------------------------------------------------------------
// Slideshow Navigation (Next, Prev, Bullets)
// --------------------------------------------------------------------------
function getSlidesCount(pageNum) {
  const counts = {
    1: 6, 2: 6, 3: 3, 4: 4, 5: 4, 6: 4, 7: 4,
    8: 3, 9: 3, 10: 3, 11: 6,
    12: 3, 13: 3, 14: 3, 15: 3, 16: 3, 17: 4
  };
  return counts[pageNum] || 3;
}

function setupBullets(pageNum) {
  const container = document.getElementById(`bullets-${pageNum}`);
  if (!container) return;
  const count = getSlidesCount(pageNum);
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('span');
    dot.className = `bullet-dot ${i === state.currentSlide[pageNum] ? 'active' : ''}`;
    dot.addEventListener('click', () => {
      state.currentSlide[pageNum] = i;
      resetSlideTimer();
      updateSlideDisplay(pageNum);
    });
    container.appendChild(dot);
  }
}

function updateSlideDisplay(pageNum) {
  if (pageNum > 17) return;
  const slideshow = document.getElementById(`slideshow-${pageNum}`);
  if (!slideshow) return;

  const slides = slideshow.querySelectorAll('.slide-item');
  const bullets = slideshow.querySelectorAll('.bullet-dot');
  const curIdx = state.currentSlide[pageNum];

  slides.forEach((s, idx) => {
    if (idx === curIdx) {
      s.classList.add('active');
    } else {
      s.classList.remove('active');
    }
  });

  bullets.forEach((b, idx) => {
    if (idx === curIdx) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });
}

function prevSlide(pageNum) {
  const count = getSlidesCount(pageNum);
  state.currentSlide[pageNum] = (state.currentSlide[pageNum] - 1 + count) % count;
  resetSlideTimer();
  updateSlideDisplay(pageNum);
}

function nextSlide(pageNum, reset = true) {
  const count = getSlidesCount(pageNum);
  state.currentSlide[pageNum] = (state.currentSlide[pageNum] + 1) % count;
  if (reset) resetSlideTimer();
  updateSlideDisplay(pageNum);
}

// Initialise bullets for all 17 pages
for (let p = 1; p <= 17; p++) {
  setupBullets(p);
}

// Keyboard arrow navigation
window.addEventListener('keydown', (e) => {
  if (state.currentMode === 'slideshow') {
    if (e.key === 'ArrowLeft') prevSlide(state.currentPage);
    if (e.key === 'ArrowRight') nextSlide(state.currentPage);
  }
});

// --------------------------------------------------------------------------
// Page Navigation & Password Gate
// --------------------------------------------------------------------------
function updateUI() {
  for (let p = 1; p <= 17; p++) {
    const pageEl = document.getElementById(`page-${p}`);
    const dotBtn = document.querySelector(`.dot-btn[data-page="${p}"]`);

    if (pageEl) {
      if (p === state.currentPage) {
        pageEl.classList.add('active');
      } else {
        pageEl.classList.remove('active');
      }
    }

    if (dotBtn) {
      const isUnlocked = state.unlockedPages.includes(p);
      if (isUnlocked) {
        dotBtn.classList.remove('locked');
        dotBtn.removeAttribute('disabled');
      } else {
        dotBtn.classList.add('locked');
        dotBtn.setAttribute('disabled', 'true');
      }

      if (p === state.currentPage) {
        dotBtn.classList.add('active');
      } else {
        dotBtn.classList.remove('active');
      }
    }
  }

  resetSlideTimer();
  if (state.currentMode === 'slideshow') {
    updateSlideDisplay(state.currentPage);
  }
}

function flashTransition(callback) {
  const flash = document.getElementById('flash-screen');
  if (flash) {
    flash.classList.add('trigger');
    setTimeout(() => {
      if (callback) callback();
      setTimeout(() => {
        flash.classList.remove('trigger');
      }, 200);
    }, 350);
  } else if (callback) {
    callback();
  }
}

function goToPage(pageNum) {
  if (!state.unlockedPages.includes(pageNum)) return;
  state.currentPage = pageNum;
  updateUI();
}

document.querySelectorAll('.dot-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const page = parseInt(btn.getAttribute('data-page'), 10);
    goToPage(page);
  });
});

function cleanString(str) {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
}

function handleGateSubmit(fromPage) {
  const inputEl = document.getElementById(`pass-${fromPage}`);
  const feedbackEl = document.getElementById(`feedback-${fromPage}`);
  const expectedWord = state.passwords[fromPage];

  if (!inputEl) return;

  const entered = cleanString(inputEl.value);
  const target = cleanString(expectedWord);

  if (entered === target) {
    const nextPage = fromPage + 1;
    if (!state.unlockedPages.includes(nextPage)) {
      state.unlockedPages.push(nextPage);
      try {
        localStorage.setItem('lgh_concrete_unlocked', JSON.stringify(state.unlockedPages));
      } catch (e) {}
    }

    if (feedbackEl) {
      feedbackEl.textContent = '✨';
      feedbackEl.className = 'gate-status success';
    }

    flashTransition(() => {
      goToPage(nextPage);
      if (inputEl) inputEl.value = '';
      if (feedbackEl) feedbackEl.textContent = '';
    });
  } else {
    if (feedbackEl) {
      feedbackEl.textContent = 'Le sceau résiste...';
      feedbackEl.className = 'gate-status error';
    }

    inputEl.classList.remove('shake');
    void inputEl.offsetWidth;
    inputEl.classList.add('shake');
  }
}

// Form listeners for all pages with password gates (1 to 16)
for (let p = 1; p <= 16; p++) {
  const form = document.getElementById(`form-gate-${p}`);
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleGateSubmit(p);
    });
  }
}

// Start timer loop & initial UI
updateUI();
requestAnimationFrame(updateProgressBar);
