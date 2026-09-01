// rocket-game.js - Rocket Defense Game Engine

const RocketGame = {
  goalCount: 20,
  currentIndex: 0,
  targetSequence: "",
  correctCount: 0,
  totalAttempts: 0,
  gameActive: false,
  riseInterval: null,
  launchInterval: null,
  starAnimFrame: null,
  isAnimating: false,
  onCompleteCallback: null,

  // Vertical movement limits (bottom %)
  minBottom: 5,
  maxBottom: 85,
  currentBottom: 5,
  riseSpeed: 0.18, // Speed of rising rocket

  // Key X-positions (percentage matching keyboard columns)
  keyPositions: {
    'a': 12, 's': 20, 'd': 28, 'f': 36, 'g': 44,
    'h': 52, 'j': 60, 'k': 68, 'l': 76, ';': 84
  },

  // Key colors matching finger zones
  keyColors: {
    'a': 'var(--col-pinky, #ec4899)',
    's': 'var(--col-ring, #a855f7)',
    'd': 'var(--col-middle, #3b82f6)',
    'f': 'var(--col-index-l, #22c55e)',
    'g': 'var(--col-index-l, #22c55e)',
    'h': 'var(--col-index-r, #eab308)',
    'j': 'var(--col-index-r, #eab308)',
    'k': 'var(--col-middle, #3b82f6)',
    'l': 'var(--col-ring, #a855f7)',
    ';': 'var(--col-pinky, #ec4899)'
  },

  init(sequenceText, onComplete) {
    this.reset();
    this.onCompleteCallback = typeof onComplete === 'function' ? onComplete : null;

    let rawSeq = typeof sequenceText === 'string' ? sequenceText : "";
    let validChars = rawSeq.toLowerCase().replace(/[^a-z;]/g, '');

    if (!validChars.length) {
      validChars = "fjfdkslakjdgh;";
    }

    this.targetSequence = validChars;
    this.goalCount = this.targetSequence.length;

    this.renderGameContainer();
    this.setupSpaceBackground();
    this.bindGlobalKeyboard();
    this.showInstructionsPopup();
  },

  bindGlobalKeyboard() {
    if (this._keyListener) {
      window.removeEventListener('keydown', this._keyListener);
    }
    this._keyListener = (e) => {
      if (!this.gameActive) return;
      // Prevent browser default actions for keys like semicolon or space
      if (e.key === ';' || e.key === ' ') e.preventDefault();
      this.handleInput(e.key);
    };
    window.addEventListener('keydown', this._keyListener);
  },

  renderGameContainer() {
    const container = document.getElementById('raceCarGameDisplay') || document.body;

    container.innerHTML = `
      <style>
        .rocket-arena {
          position: relative;
          width: 100%;
          height: 580px; /* Increased height */
          background: #020617;
          overflow: hidden;
          font-family: system-ui, -apple-system, sans-serif;
          user-select: none;
        }
        .star-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }
        .rocket-tracker {
          position: absolute;
          top: 15px;
          left: 20px;
          right: 20px;
          display: flex;
          justify-content: space-between;
          color: #94a3b8;
          font-size: 1.1rem;
          font-weight: 600;
          z-index: 10;
        }
        .rocket-entity {
          position: absolute;
          width: 60px;
          height: 90px;
          z-index: 20;
          display: none;
          transform: translateX(-50%);
        }
        .rocket-entity.shake {
          animation: rocketShake 0.25s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes rocketShake {
          10%, 90% { transform: translate3d(-2px, 0, 0) translateX(-50%); }
          20%, 80% { transform: translate3d(4px, 0, 0) translateX(-50%); }
          30%, 50%, 70% { transform: translate3d(-6px, 0, 0) translateX(-50%); }
          40%, 60% { transform: translate3d(6px, 0, 0) translateX(-50%); }
        }
        .rocket-badge {
          position: absolute;
          top: 28px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 1.3rem;
          font-weight: 900;
          color: #020617;
          text-shadow: 0 0 3px rgba(255,255,255,0.9);
          pointer-events: none;
        }
        .rocket-flame {
          position: absolute;
          bottom: -14px;
          left: 50%;
          transform: translateX(-50%);
          width: 16px;
          height: 24px;
          background: linear-gradient(to bottom, #f59e0b, #ef4444, transparent);
          border-radius: 50%;
          animation: flamePulse 0.12s infinite alternate;
        }
        .rocket-flame.super-boost {
          height: 45px;
          bottom: -32px;
          background: linear-gradient(to bottom, #38bdf8, #6366f1, transparent);
        }
        @keyframes flamePulse {
          0% { opacity: 0.8; transform: translateX(-50%) scaleX(0.9); }
          100% { opacity: 1; transform: translateX(-50%) scaleX(1.1); filter: drop-shadow(0 0 10px #f59e0b); }
        }
        .rocket-modal-overlay {
          position: absolute;
          inset: 0;
          background: rgba(2, 6, 23, 0.88);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 50;
        }
        .rocket-modal-card {
          background: #1e293b;
          border: 2px solid #38bdf8;
          border-radius: 12px;
          padding: 28px 36px;
          text-align: center;
          max-width: 420px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.6);
        }
        .rocket-modal-card h2 {
          color: #f8fafc;
          margin: 0 0 12px 0;
        }
        .rocket-modal-card p {
          color: #cbd5e1;
          font-size: 1.1rem;
          line-height: 1.4;
          margin-bottom: 22px;
        }
        .rocket-start-btn {
          background: #0284c7;
          color: #ffffff;
          border: none;
          padding: 12px 28px;
          font-size: 1rem;
          font-weight: bold;
          border-radius: 6px;
          cursor: pointer;
        }
        .rocket-start-btn:hover {
          background: #0369a1;
        }
        .rocket-countdown {
          font-size: 6rem;
          font-weight: 900;
          color: #38bdf8;
          text-shadow: 0 0 20px rgba(56, 189, 248, 0.6);
        }
      </style>
      <div class="rocket-arena" id="rocketArena">
        <canvas id="spaceBgCanvas" class="star-canvas"></canvas>

        <div class="rocket-tracker">
          <span>ROCKETS DESTROYED: <strong id="launchedCount" style="color:#38bdf8;">0</strong> / <span id="targetGoal">${this.goalCount}</span></span>
        </div>

        <div id="targetRocket" class="rocket-entity">
          <svg viewBox="0 0 60 90" width="100%" height="100%">
            <path d="M30 2 C42 20, 48 45, 48 70 L12 70 C12 45, 18 20, 30 2 Z" id="rocketBody" fill="#22c55e" stroke="#ffffff" stroke-width="2"/>
            <path d="M12 50 C2 55, 0 75, 4 82 L12 70 Z" id="rocketFinLeft" fill="#0f172a"/>
            <path d="M48 50 C58 55, 60 75, 56 82 L48 70 Z" id="rocketFinRight" fill="#0f172a"/>
            <circle cx="30" cy="36" r="14" fill="#ffffff" stroke="#020617" stroke-width="2"/>
          </svg>
          <div id="rocketLetter" class="rocket-badge">F</div>
          <div id="rocketFlame" class="rocket-flame"></div>
        </div>

        <div id="rocketOverlay" class="rocket-modal-overlay">
          <div id="rocketModalContent" class="rocket-modal-card">
            <h2>Rocket Defense</h2>
            <p>With hands on home keys, type each letter to destroy the rockets.</p>
            <button class="rocket-start-btn" onclick="RocketGame.startCountdown()">START GAME</button>
          </div>
        </div>
      </div>
    `;
  },

  setupSpaceBackground() {
    const canvas = document.getElementById('spaceBgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resizeCanvas();

    // Create stars
    const stars = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random(),
      twinkleSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() < 0.5 ? 1 : -1)
    }));

    // Shooting star state
    let shootingStar = null;

    const spawnShootingStar = () => {
      shootingStar = {
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height * 0.4),
        length: Math.random() * 80 + 40,
        speed: Math.random() * 10 + 12,
        dx: Math.random() * 4 + 6,
        dy: Math.random() * 2 + 3,
        alpha: 1
      };
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render stars with twinkling
      stars.forEach(star => {
        star.alpha += star.twinkleSpeed;
        if (star.alpha <= 0.1 || star.alpha >= 1) star.twinkleSpeed *= -1;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, star.alpha))})`;
        ctx.fill();
      });

      // Handle shooting stars
      if (!shootingStar && Math.random() < 0.015) {
        spawnShootingStar();
      }

      if (shootingStar) {
        ctx.beginPath();
        const grad = ctx.createLinearGradient(
          shootingStar.x, shootingStar.y,
          shootingStar.x - shootingStar.dx * 8, shootingStar.y - shootingStar.dy * 8
        );
        grad.addColorStop(0, `rgba(56, 189, 248, ${shootingStar.alpha})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(shootingStar.x - shootingStar.dx * 8, shootingStar.y - shootingStar.dy * 8);
        ctx.stroke();

        shootingStar.x += shootingStar.dx;
        shootingStar.y += shootingStar.dy;
        shootingStar.alpha -= 0.02;

        if (shootingStar.alpha <= 0) shootingStar = null;
      }

      this.starAnimFrame = requestAnimationFrame(render);
    };

    render();
  },

  showInstructionsPopup() {
    const overlay = document.getElementById('rocketOverlay');
    if (overlay) overlay.style.display = 'flex';
  },

  startCountdown() {
    const content = document.getElementById('rocketModalContent');
    if (!content) return;

    let count = 3;
    content.innerHTML = `<div class="rocket-countdown">${count}</div>`;

    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        content.innerHTML = `<div class="rocket-countdown">${count}</div>`;
      } else {
        clearInterval(timer);
        const overlay = document.getElementById('rocketOverlay');
        if (overlay) overlay.style.display = 'none';
        this.gameActive = true;
        this.spawnNextRocket();
      }
    }, 1000);
  },

  spawnNextRocket() {
    this.clearIntervals();

    if (this.currentIndex >= this.targetSequence.length) {
      this.finishGame();
      return;
    }

    const currentChar = this.targetSequence[this.currentIndex];
    const rocket = document.getElementById('targetRocket');
    const body = document.getElementById('rocketBody');
    const letterEl = document.getElementById('rocketLetter');
    const flame = document.getElementById('rocketFlame');

    if (!rocket || !body || !letterEl) return;

    if (flame) flame.classList.remove('super-boost');

    // X position matching keyboard column and color setup
    const xPos = this.keyPositions[currentChar] || 50;
    const themeColor = this.keyColors[currentChar] || '#0284c7';

    rocket.style.display = 'block';
    rocket.style.left = `${xPos}%`;
    this.currentBottom = this.minBottom;
    rocket.style.bottom = `${this.currentBottom}%`;

    body.setAttribute('fill', themeColor);
    letterEl.innerText = currentChar.toUpperCase();

    this.isAnimating = false;
    this.startRising();
  },

  startRising() {
    this.riseInterval = setInterval(() => {
      if (!this.gameActive || this.isAnimating) return;

      this.currentBottom += this.riseSpeed;
      const rocket = document.getElementById('targetRocket');

      if (rocket) {
        rocket.style.bottom = `${this.currentBottom}%`;
      }

      // If rocket hits top, shake and drop to bottom for retry
      if (this.currentBottom >= this.maxBottom) {
        this.totalAttempts++;
        this.shakeRocket();
        this.currentBottom = this.minBottom;
      }
    }, 20);
  },

  handleInput(key) {
    if (!this.gameActive || this.isAnimating) return;

    const expectedChar = this.targetSequence[this.currentIndex];
    this.totalAttempts++;

    if (key.toLowerCase() === expectedChar.toLowerCase()) {
      this.correctCount++;
      this.launchRocketSuccess();
    } else {
      this.shakeRocket();
    }

    return Math.round((this.correctCount / this.totalAttempts) * 100);
  },

  launchRocketSuccess() {
    this.isAnimating = true;
    this.clearIntervals();

    const rocket = document.getElementById('targetRocket');
    const flame = document.getElementById('rocketFlame');
    if (flame) flame.classList.add('super-boost');

    // Shoot rocket upwards off screen
    this.launchInterval = setInterval(() => {
      this.currentBottom += 4.5;
      if (rocket) rocket.style.bottom = `${this.currentBottom}%`;

      if (this.currentBottom > 115) {
        this.clearIntervals();
        this.currentIndex++;

        const countEl = document.getElementById('launchedCount');
        if (countEl) countEl.innerText = this.currentIndex;

        this.spawnNextRocket();
      }
    }, 15);
  },

  shakeRocket() {
    const rocket = document.getElementById('targetRocket');
    if (rocket) {
      rocket.classList.add('shake');
      setTimeout(() => rocket.classList.remove('shake'), 250);
    }
  },

  finishGame() {
    this.gameActive = false;
    this.clearIntervals();

    const finalAccuracy = this.totalAttempts > 0
      ? Math.round((this.correctCount / this.totalAttempts) * 100)
      : 100;

    if (this.onCompleteCallback) {
      this.onCompleteCallback(finalAccuracy);
    }
  },

  clearIntervals() {
    if (this.riseInterval) clearInterval(this.riseInterval);
    if (this.launchInterval) clearInterval(this.launchInterval);
  },

  reset() {
    this.clearIntervals();
    if (this.starAnimFrame) cancelAnimationFrame(this.starAnimFrame);
    if (this._keyListener) window.removeEventListener('keydown', this._keyListener);

    this.gameActive = false;
    this.isAnimating = false;
    this.currentIndex = 0;
    this.correctCount = 0;
    this.totalAttempts = 0;
  }
};