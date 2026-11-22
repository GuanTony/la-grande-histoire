/* ==========================================================================
   LA GRANDE HISTOIRE - PURE VISUAL & MOTION SCRIPT
   ========================================================================== */

const state = {
  currentPage: 1,
  unlockedPages: [1],
  soundEnabled: true,
  passwords: {
    1: 'peuple',
    2: 'repos'
  }
};

// Restore saved progress
try {
  const saved = localStorage.getItem('lgh_vis_unlocked');
  if (saved) {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      state.unlockedPages = Array.from(new Set([1, ...parsed]));
    }
  }
} catch (e) {}

// --------------------------------------------------------------------------
// Audio System (Synthesized Ambient / Chimes)
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

    // Harmonic triumphant chord
    const freqs = [261.63, 329.63, 392.00, 523.25, 659.25]; // C major 7th / 9th
    const now = audioCtx.currentTime;

    freqs.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.001, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.07 + 0.05);
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
    osc.frequency.setValueAtTime(130, now);
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
// Multi-Layer Canvas Animations
// --------------------------------------------------------------------------
const canvases = {
  1: document.getElementById('canvas-1'),
  2: document.getElementById('canvas-2'),
  3: document.getElementById('canvas-3')
};

const contexts = {
  1: canvases[1].getContext('2d'),
  2: canvases[2].getContext('2d'),
  3: canvases[3].getContext('2d')
};

let width = window.innerWidth;
let height = window.innerHeight;

function resizeAll() {
  width = window.innerWidth;
  height = window.innerHeight;
  for (let i = 1; i <= 3; i++) {
    if (canvases[i]) {
      canvases[i].width = width;
      canvases[i].height = height;
    }
  }
}
window.addEventListener('resize', resizeAll);
resizeAll();

// Particle Systems
const particlesPage1 = [];
const particlesPage2 = [];
const particlesPage3 = [];

// Page 1: Genesis Stardust & Divine Light Rays
for (let i = 0; i < 70; i++) {
  particlesPage1.push({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 2.5 + 0.8,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    alpha: Math.random() * 0.7 + 0.2,
    pulse: Math.random() * Math.PI * 2,
    color: Math.random() > 0.4 ? '255, 230, 150' : '200, 235, 255'
  });
}

// Page 2: Exodus Burning Bush & Pillar of Fire Embers
for (let i = 0; i < 90; i++) {
  particlesPage2.push({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 3 + 1,
    vx: (Math.random() - 0.5) * 0.8,
    vy: -(Math.random() * 1.6 + 0.6), // Floating up
    alpha: Math.random() * 0.8 + 0.2,
    color: Math.random() > 0.5 ? '255, 145, 45' : '255, 210, 80'
  });
}

// Page 3: Rest & Promised Land Serene Golden Motes
for (let i = 0; i < 60; i++) {
  particlesPage3.push({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 3.2 + 1,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.2,
    alpha: Math.random() * 0.6 + 0.2,
    pulse: Math.random() * Math.PI * 2,
    color: '250, 230, 160'
  });
}

let tick = 0;

function renderFrame() {
  tick++;

  // --- Render Page 1 (Genesis) ---
  if (state.currentPage === 1) {
    const ctx = contexts[1];
    ctx.clearRect(0, 0, width, height);

    // Radiant god rays from top-center
    const rayCount = 8;
    const originX = width * 0.5;
    const originY = height * 0.1;
    for (let r = 0; r < rayCount; r++) {
      const angle = (r / rayCount) * Math.PI + Math.sin(tick * 0.005 + r) * 0.15;
      const rayLen = Math.max(width, height) * 1.2;
      const x2 = originX + Math.cos(angle) * rayLen;
      const y2 = originY + Math.sin(angle) * rayLen;

      const grad = ctx.createLinearGradient(originX, originY, x2, y2);
      grad.addColorStop(0, 'rgba(255, 240, 180, 0.12)');
      grad.addColorStop(0.7, 'rgba(255, 220, 140, 0.03)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(x2 - 80, y2);
      ctx.lineTo(x2 + 80, y2);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Particles
    particlesPage1.forEach(p => {
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
  }

  // --- Render Page 2 (Exodus & Leviticus) ---
  else if (state.currentPage === 2) {
    const ctx = contexts[2];
    ctx.clearRect(0, 0, width, height);

    // Pillar of fire aura at bottom center
    const fireGrad = ctx.createRadialGradient(width * 0.5, height, 10, width * 0.5, height * 0.4, width * 0.5);
    const pulseIntensity = 0.12 + Math.sin(tick * 0.04) * 0.04;
    fireGrad.addColorStop(0, `rgba(255, 110, 20, ${pulseIntensity})`);
    fireGrad.addColorStop(0.5, 'rgba(200, 60, 10, 0.04)');
    fireGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = fireGrad;
    ctx.fillRect(0, 0, width, height);

    // Rising burning sparks
    particlesPage2.forEach(p => {
      p.x += p.vx + Math.sin(tick * 0.02 + p.y * 0.01) * 0.4;
      p.y += p.vy;

      if (p.y < -10) {
        p.y = height + 10;
        p.x = width * 0.3 + Math.random() * (width * 0.4);
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
      ctx.shadowBlur = 12;
      ctx.shadowColor = `rgba(${p.color}, 0.9)`;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  // --- Render Page 3 (Rest & Promised Land) ---
  else if (state.currentPage === 3) {
    const ctx = contexts[3];
    ctx.clearRect(0, 0, width, height);

    // Soft celestial golden aura
    const restGrad = ctx.createRadialGradient(width * 0.5, height * 0.5, 40, width * 0.5, height * 0.5, width * 0.65);
    restGrad.addColorStop(0, 'rgba(255, 235, 160, 0.09)');
    restGrad.addColorStop(0.7, 'rgba(212, 175, 55, 0.02)');
    restGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = restGrad;
    ctx.fillRect(0, 0, width, height);

    particlesPage3.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.015;
      const currentAlpha = Math.max(0.1, p.alpha + Math.sin(p.pulse) * 0.2);

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${currentAlpha})`;
      ctx.shadowBlur = 12;
      ctx.shadowColor = 'rgba(255, 230, 160, 0.8)';
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  requestAnimationFrame(renderFrame);
}
renderFrame();

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
        dotBtn.title = `Chapitre ${['I', 'II', 'III'][p - 1]}`;
      } else {
        dotBtn.classList.add('locked');
        dotBtn.setAttribute('disabled', 'true');
        dotBtn.title = `Chapitre ${['I', 'II', 'III'][p - 1]} (Verrouillé)`;
      }

      if (p === state.currentPage) {
        dotBtn.classList.add('active');
      } else {
        dotBtn.classList.remove('active');
      }
    }
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

// Dots navigation click
document.querySelectorAll('.dot-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const page = parseInt(btn.getAttribute('data-page'), 10);
    goToPage(page);
  });
});

// String cleaner helper
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
    // Correct password
    const nextPage = fromPage + 1;
    if (!state.unlockedPages.includes(nextPage)) {
      state.unlockedPages.push(nextPage);
      try {
        localStorage.setItem('lgh_vis_unlocked', JSON.stringify(state.unlockedPages));
      } catch (e) {}
    }

    if (feedbackEl) {
      feedbackEl.textContent = '✨';
      feedbackEl.className = 'feedback-msg success';
    }

    playUnlockSound();

    flashTransition(() => {
      goToPage(nextPage);
      if (inputEl) inputEl.value = '';
      if (feedbackEl) feedbackEl.textContent = '';
    });
  } else {
    // Incorrect password
    if (feedbackEl) {
      feedbackEl.textContent = 'Le sceau résiste...';
      feedbackEl.className = 'feedback-msg error';
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
    soundBtn.title = state.soundEnabled ? 'Désactiver le son' : 'Activer le son';
  });
}

// Initial UI sync
updateUI();
