/* ==========================================================================
   LA GRANDE HISTOIRE - INTERACTIVE CANVAS & CHAPTER MECHANICS
   ========================================================================== */

// --- State Management ---
const state = {
  currentPage: 1,
  unlockedPages: [1], // Page 1 is always unlocked
  soundEnabled: true,
  passwords: {
    1: 'peuple',
    2: 'repos'
  }
};

// Load saved progress from localStorage if available
try {
  const saved = localStorage.getItem('lgh_unlocked');
  if (saved) {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      state.unlockedPages = Array.from(new Set([1, ...parsed]));
    }
  }
} catch (e) {
  console.warn('Storage not available:', e);
}

// --------------------------------------------------------------------------
// Web Audio API Synthesizer (Zero external audio files needed)
// --------------------------------------------------------------------------
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
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

    // Harmonious ethereal chord (F - A - C - E - G)
    const notes = [349.23, 440.00, 523.25, 659.25, 783.99];
    const now = audioCtx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      // Delicate envelope
      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 1.7);
    });
  } catch (err) {
    console.error('Audio play error:', err);
  }
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
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.25);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  } catch (err) {
    console.error('Audio error sound:', err);
  }
}

// --------------------------------------------------------------------------
// Animated Canvas Background (Page-dependent Visual Themes)
// --------------------------------------------------------------------------
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let celebrationParticles = [];
let mouse = { x: 0, y: 0, active: false };

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.active = true;
});

window.addEventListener('mouseleave', () => {
  mouse.active = false;
});

// Particle Definition
class Particle {
  constructor(pageTheme) {
    this.reset(pageTheme);
  }

  reset(pageTheme) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = Math.random() * 2.2 + 0.8;
    this.baseAlpha = Math.random() * 0.6 + 0.2;
    this.alpha = this.baseAlpha;
    this.pulse = Math.random() * Math.PI * 2;
    this.pulseSpeed = Math.random() * 0.02 + 0.01;

    // Movement speeds according to page theme
    if (pageTheme === 1) {
      // Genesis: Gentle celestial drift & starlight
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.color = Math.random() > 0.3 ? '245, 214, 130' : '180, 220, 255';
    } else if (pageTheme === 2) {
      // Exodus: Embers rising from the burning bush into night
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = -(Math.random() * 1.2 + 0.4); // Ascending
      this.size = Math.random() * 2.8 + 1;
      this.color = Math.random() > 0.4 ? '255, 140, 40' : '245, 205, 90';
    } else {
      // Rest: Peaceful golden celestial waves
      this.vx = (Math.random() - 0.5) * 0.2;
      this.vy = (Math.random() - 0.5) * 0.15;
      this.size = Math.random() * 3 + 1;
      this.color = Math.random() > 0.5 ? '250, 230, 160' : '150, 210, 190';
    }
  }

  update(pageTheme) {
    this.x += this.vx;
    this.y += this.vy;
    this.pulse += this.pulseSpeed;
    this.alpha = this.baseAlpha + Math.sin(this.pulse) * 0.2;

    // Subtle reaction to mouse
    if (mouse.active) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        this.x -= (dx / dist) * 1.2;
        this.y -= (dy / dist) * 1.2;
      }
    }

    // Wrap around borders
    if (pageTheme === 2) {
      if (this.y < -10) this.y = height + 10;
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
    } else {
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color}, ${Math.max(0.05, this.alpha)})`;
    ctx.shadowBlur = 12;
    ctx.shadowColor = `rgba(${this.color}, 0.8)`;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// Celebration Sparks on correct unlock
class Spark {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.alpha = 1;
    this.decay = Math.random() * 0.02 + 0.015;
    this.size = Math.random() * 3.5 + 1.5;
    this.color = Math.random() > 0.5 ? '255, 230, 130' : '255, 180, 50';
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.06; // Gravity
    this.alpha -= this.decay;
  }

  draw() {
    if (this.alpha <= 0) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
    ctx.shadowBlur = 15;
    ctx.shadowColor = `rgba(${this.color}, 0.9)`;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function triggerCelebration(originX, originY) {
  for (let i = 0; i < 75; i++) {
    celebrationParticles.push(new Spark(originX, originY));
  }
}

// Initialize particles pool
function initParticles() {
  particles = [];
  const count = Math.min(100, Math.floor((width * height) / 12000));
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(state.currentPage));
  }
}
initParticles();

// Animation Loop
let animFrame = 0;
function animate() {
  animFrame++;
  ctx.clearRect(0, 0, width, height);

  // Background light beam according to chapter
  if (state.currentPage === 1) {
    // "Fiat Lux" radiant central ray of creation
    const grad = ctx.createRadialGradient(width * 0.5, 0, 10, width * 0.5, height * 0.6, width * 0.6);
    grad.addColorStop(0, 'rgba(245, 214, 130, 0.09)');
    grad.addColorStop(0.5, 'rgba(100, 150, 220, 0.03)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (state.currentPage === 2) {
    // Pillar of Fire & Desert Warmth
    const grad = ctx.createRadialGradient(width * 0.5, height, 20, width * 0.5, height * 0.3, width * 0.55);
    grad.addColorStop(0, 'rgba(235, 110, 40, 0.12)');
    grad.addColorStop(0.6, 'rgba(180, 50, 20, 0.04)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else {
    // Rest & Promised Land Aurora
    const grad = ctx.createRadialGradient(width * 0.5, height * 0.5, 50, width * 0.5, height * 0.5, width * 0.7);
    grad.addColorStop(0, 'rgba(120, 200, 170, 0.08)');
    grad.addColorStop(0.5, 'rgba(230, 195, 100, 0.04)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // Update & Draw Ambient Particles
  for (let i = 0; i < particles.length; i++) {
    particles[i].update(state.currentPage);
    particles[i].draw();
  }

  // Update & Draw Celebration Sparks
  for (let i = celebrationParticles.length - 1; i >= 0; i--) {
    celebrationParticles[i].update();
    celebrationParticles[i].draw();
    if (celebrationParticles[i].alpha <= 0) {
      celebrationParticles.splice(i, 1);
    }
  }

  requestAnimationFrame(animate);
}
animate();

// --------------------------------------------------------------------------
// Navigation & Page Transitions
// --------------------------------------------------------------------------
function updateUI() {
  // Update Cards Visibility
  for (let p = 1; p <= 3; p++) {
    const card = document.getElementById(`page-${p}`);
    const navBtn = document.getElementById(`btn-nav-${p}`);
    const lockIcon = document.getElementById(`lock-icon-${p}`);

    if (card) {
      if (p === state.currentPage) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    }

    if (navBtn) {
      const isUnlocked = state.unlockedPages.includes(p);
      if (isUnlocked) {
        navBtn.classList.remove('locked');
        navBtn.removeAttribute('disabled');
        if (lockIcon) lockIcon.style.display = 'none';
      } else {
        navBtn.classList.add('locked');
        navBtn.setAttribute('disabled', 'true');
        if (lockIcon) lockIcon.style.display = 'inline';
      }

      if (p === state.currentPage) {
        navBtn.classList.add('active');
      } else {
        navBtn.classList.remove('active');
      }
    }
  }

  // Adjust ambient glows color
  const glowTop = document.querySelector('.glow-top');
  const glowBottom = document.querySelector('.glow-bottom');
  if (state.currentPage === 1) {
    if (glowTop) glowTop.style.background = 'radial-gradient(circle, #e5c158, #ffb347)';
    if (glowBottom) glowBottom.style.background = 'radial-gradient(circle, #2b5876, #4e4376)';
  } else if (state.currentPage === 2) {
    if (glowTop) glowTop.style.background = 'radial-gradient(circle, #e25822, #7a1515)';
    if (glowBottom) glowBottom.style.background = 'radial-gradient(circle, #f39c12, #3e1b1b)';
  } else {
    if (glowTop) glowTop.style.background = 'radial-gradient(circle, #56ab2f, #a8e063)';
    if (glowBottom) glowBottom.style.background = 'radial-gradient(circle, #d4af37, #1e3c72)';
  }

  // Re-orient particles smoothly
  particles.forEach(p => p.reset(state.currentPage));
}

function goToPage(pageNum) {
  if (!state.unlockedPages.includes(pageNum)) return;
  state.currentPage = pageNum;
  updateUI();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Stepper click handlers
document.querySelectorAll('.step-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const page = parseInt(btn.getAttribute('data-page'), 10);
    goToPage(page);
  });
});

// --------------------------------------------------------------------------
// Enigma / Password Verification Logic
// --------------------------------------------------------------------------
function cleanString(str) {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ""); // Remove punctuation
}

function handleGateSubmit(fromPage) {
  const inputEl = document.getElementById(`pass-${fromPage}`);
  const feedbackEl = document.getElementById(`feedback-${fromPage}`);
  const expectedWord = state.passwords[fromPage];

  if (!inputEl || !feedbackEl) return;

  const entered = cleanString(inputEl.value);
  const target = cleanString(expectedWord);

  if (entered === target) {
    // SUCCESS
    const nextPage = fromPage + 1;
    if (!state.unlockedPages.includes(nextPage)) {
      state.unlockedPages.push(nextPage);
      try {
        localStorage.setItem('lgh_unlocked', JSON.stringify(state.unlockedPages));
      } catch (e) {}
    }

    feedbackEl.textContent = '✨ Sceau brisé ! Le passage s’ouvre...';
    feedbackEl.className = 'gate-feedback success';

    // Sound & particles
    playUnlockSound();
    const rect = inputEl.getBoundingClientRect();
    triggerCelebration(rect.left + rect.width / 2, rect.top + rect.height / 2);

    setTimeout(() => {
      goToPage(nextPage);
    }, 700);
  } else {
    // ERROR
    feedbackEl.textContent = 'Le sceau résiste... Relisez le verset avec attention pour trouver le mot.';
    feedbackEl.className = 'gate-feedback error';
    playErrorSound();

    // Trigger shake animation re-flow
    inputEl.classList.remove('shake');
    void inputEl.offsetWidth;
    inputEl.classList.add('shake');
  }
}

// Form listeners for Page 1 and Page 2
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

// Sound toggle button
const soundBtn = document.getElementById('sound-btn');
const soundIcon = document.getElementById('sound-icon');
if (soundBtn && soundIcon) {
  soundBtn.addEventListener('click', () => {
    initAudio();
    state.soundEnabled = !state.soundEnabled;
    soundIcon.textContent = state.soundEnabled ? '🔊' : '🔇';
    soundBtn.title = state.soundEnabled ? 'Désactiver les effets sonores' : 'Activer les effets sonores';
  });
}

// First initialization
updateUI();
