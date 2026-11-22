/* ==========================================================================
   LA GRANDE HISTOIRE - FRESCO 9 & SLIDESHOW MECHANICS
   ========================================================================== */

const state = {
  currentPage: 1,
  unlockedPages: [1],
  currentMode: 'grid', // 'grid' or 'slideshow'
  currentSlide: { 1: 0, 2: 0 },
  soundEnabled: true,
  passwords: {
    1: 'peuple',
    2: 'repos'
  }
};

// Restore progress
try {
  const saved = localStorage.getItem('lgh_fresco_unlocked');
  if (saved) {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      state.unlockedPages = Array.from(new Set([1, ...parsed]));
    }
  }
} catch (e) {}

// --------------------------------------------------------------------------
// Audio Synthesizer (Chime & Error)
// --------------------------------------------------------------------------
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playUnlockSound() {
  if (!state.soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;

    const freqs = [349.23, 440.00, 523.25, 659.25, 783.99]; // F maj 9
    const now = audioCtx.currentTime;

    freqs.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.001, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.07 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 1.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 1.9);
    });
  } catch (err) {}
}

function playErrorSound() {
  if (!state.soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.22);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.23);
  } catch (err) {}
}

// --------------------------------------------------------------------------
// Ambient Canvas Background
// --------------------------------------------------------------------------
const canvas = document.getElementById('ambient-canvas');
const ctx = canvas.getContext('2d');
let width, height;
let particles = [];

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function initParticles() {
  particles = [];
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.8,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      color: state.currentPage === 2 ? '255, 150, 50' : '245, 215, 130'
    });
  }
}
initParticles();

function animateCanvas() {
  ctx.clearRect(0, 0, width, height);

  // Soft atmospheric radial gradient
  const grad = ctx.createRadialGradient(width * 0.5, height * 0.5, 30, width * 0.5, height * 0.5, width * 0.7);
  if (state.currentPage === 1) {
    grad.addColorStop(0, 'rgba(212, 175, 55, 0.08)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
  } else if (state.currentPage === 2) {
    grad.addColorStop(0, 'rgba(200, 70, 20, 0.1)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
  } else {
    grad.addColorStop(0, 'rgba(120, 190, 140, 0.08)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Particles
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.pulse += 0.02;
    const currentAlpha = Math.max(0.1, p.alpha + Math.sin(p.pulse) * 0.2);

    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.color}, ${currentAlpha})`;
    ctx.shadowBlur = 10;
    ctx.shadowColor = `rgba(${p.color}, 0.8)`;
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  requestAnimationFrame(animateCanvas);
}
animateCanvas();

// --------------------------------------------------------------------------
// View Mode Switcher (Grid 9 vs Slideshow)
// --------------------------------------------------------------------------
const modeGridBtn = document.getElementById('mode-grid-btn');
const modeSlideBtn = document.getElementById('mode-slide-btn');

function setViewMode(mode) {
  state.currentMode = mode;
  if (mode === 'grid') {
    modeGridBtn.classList.add('active');
    modeSlideBtn.classList.remove('active');
    document.querySelectorAll('.mosaic-grid').forEach(el => el.classList.remove('hidden'));
    document.querySelectorAll('.slideshow-view').forEach(el => el.classList.add('hidden'));
  } else {
    modeSlideBtn.classList.add('active');
    modeGridBtn.classList.remove('active');
    document.querySelectorAll('.mosaic-grid').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.slideshow-view').forEach(el => el.classList.remove('hidden'));
    updateSlideDisplay(state.currentPage);
  }
}

if (modeGridBtn && modeSlideBtn) {
  modeGridBtn.addEventListener('click', () => setViewMode('grid'));
  modeSlideBtn.addEventListener('click', () => setViewMode('slideshow'));
}

// Clicking any panel in the 9-grid zooms directly into the slideshow view on that scene!
document.querySelectorAll('.panel-card').forEach(card => {
  card.addEventListener('click', () => {
    const index = parseInt(card.getAttribute('data-index'), 10) || 0;
    state.currentSlide[state.currentPage] = index;
    setViewMode('slideshow');
  });
});

// --------------------------------------------------------------------------
// Slideshow Mechanics (9 Images enchaînées)
// --------------------------------------------------------------------------
function setupBullets(pageNum) {
  const container = document.getElementById(`bullets-${pageNum}`);
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const dot = document.createElement('span');
    dot.className = `bullet-dot ${i === state.currentSlide[pageNum] ? 'active' : ''}`;
    dot.addEventListener('click', () => {
      state.currentSlide[pageNum] = i;
      updateSlideDisplay(pageNum);
    });
    container.appendChild(dot);
  }
}

function updateSlideDisplay(pageNum) {
  if (pageNum > 2) return;
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
  state.currentSlide[pageNum] = (state.currentSlide[pageNum] - 1 + 9) % 9;
  updateSlideDisplay(pageNum);
}

function nextSlide(pageNum) {
  state.currentSlide[pageNum] = (state.currentSlide[pageNum] + 1) % 9;
  updateSlideDisplay(pageNum);
}

setupBullets(1);
setupBullets(2);

// Keyboard arrow navigation
window.addEventListener('keydown', (e) => {
  if (state.currentMode === 'slideshow') {
    if (e.key === 'ArrowLeft') prevSlide(state.currentPage);
    if (e.key === 'ArrowRight') nextSlide(state.currentPage);
  }
});

// --------------------------------------------------------------------------
// Navigation & Password Gate Logic
// --------------------------------------------------------------------------
function updateUI() {
  for (let p = 1; p <= 3; p++) {
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

  initParticles();
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
        localStorage.setItem('lgh_fresco_unlocked', JSON.stringify(state.unlockedPages));
      } catch (e) {}
    }

    if (feedbackEl) {
      feedbackEl.textContent = '✨';
      feedbackEl.className = 'gate-status success';
    }

    playUnlockSound();

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
    playErrorSound();

    inputEl.classList.remove('shake');
    void inputEl.offsetWidth;
    inputEl.classList.add('shake');
  }
}

// Form listeners
const form1 = document.getElementById('form-gate-1');
if (form1) {
  form1.addEventListener('submit', (e) => {
    e.preventDefault();
    handleGateSubmit(1);
  });
}

const form2 = document.getElementById('form-gate-2');
if (form2) {
  form2.addEventListener('submit', (e) => {
    e.preventDefault();
    handleGateSubmit(2);
  });
}

// Sound toggle
const soundBtn = document.getElementById('sound-btn');
const soundIcon = document.getElementById('sound-icon');
if (soundBtn && soundIcon) {
  soundBtn.addEventListener('click', () => {
    initAudio();
    state.soundEnabled = !state.soundEnabled;
    soundIcon.textContent = state.soundEnabled ? '🔊' : '🔇';
  });
}

// First sync
updateUI();
