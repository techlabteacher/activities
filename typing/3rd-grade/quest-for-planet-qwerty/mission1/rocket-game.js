// rocket-game.js - Rocket Defense Game Engine

const RocketGame = {
  goalCount: 20,
  currentIndex: 0,
  targetSequence: "",
  correctCount: 0,
  totalAttempts: 0,
  riseInterval: null,
  launchInterval: null,
  isAnimating: false,
  onCompleteCallback: null,
  
  // Vertical limits in percentages (bottom %)
  minBottom: 5,
  maxBottom: 82,
  currentBottom: 5,
  riseSpeed: 0.15, // Adjust float speed here

  // Key x-positions (percentages) matching standard layout
  keyPositions: {
    'a': 12, 's': 20, 'd': 28, 'f': 36, 'g': 44,
    'h': 52, 'j': 60, 'k': 68, 'l': 76, ';': 84
  },

  // Dynamic finger color mapping using CSS Variables
  keyColors: {
    'a': 'var(--col-pinky)',
    's': 'var(--col-ring)',
    'd': 'var(--col-middle)',
    'f': 'var(--col-index-l)',
    'g': 'var(--col-index-l)',
    'h': 'var(--col-index-r)',
    'j': 'var(--col-index-r)',
    'k': 'var(--col-middle)',
    'l': 'var(--col-ring)',
    ';': 'var(--col-pinky)'
  },

  init(sequenceText, onComplete) {
    this.onCompleteCallback = onComplete;
    this.currentIndex = 0;
    this.correctCount = 0;
    this.totalAttempts = 0;
    this.isAnimating = false;
    
    // Clean target sequence to valid keys
    const validChars = sequenceText.toLowerCase().replace(/[^a-z;]/g, '');
    this.targetSequence = validChars.length > 0 ? validChars : "fjdkslagh;";
    this.goalCount = this.targetSequence.length;

    this.setupGameUI();
    this.spawnRocket();
  },

  setupGameUI() {
    const container = document.getElementById('raceCarGameDisplay');
    if (!container) return;

    container.innerHTML = `
      <style>
        .rocket-arena {
          position: relative;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 50% 100%, #0f172a 0%, #020617 100%);
          overflow: hidden;
        }
        .rocket-tracker-bar {
          position: absolute;
          top: 10px;
          left: 15px;
          right: 15px;
          display: flex;
          justify-content: space-between;
          font-family: var(--font-tech);
          font-size: 1rem;
          color: #94a3b8;
          z-index: 5;
        }
        .rocket-entity {
          position: absolute;
          width: 60px;
          height: 90px;
          transition: transform 0.1s ease;
          z-index: 10;
        }
        .rocket-entity.shake {
          animation: rocketShake 0.25s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes rocketShake {
          10%, 90% { transform: translate3d(-2px, 0, 0); }
          20%, 80% { transform: translate3d(4px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-6px, 0, 0); }
          40%, 60% { transform: translate3d(6px, 0, 0); }
        }
        .rocket-badge {
          position: absolute;
          top: 28px;
          left: 50%;
          transform: translateX(-50%);
          font-family: var(--font-header);
          font-size: 1.2rem;
          font-weight: 900;
          color: #020617;
          text-shadow: 0 0 3px rgba(255,255,255,0.8);
          pointer-events: none;
        }
        .rocket-flame {
          position: absolute;
          bottom: -12px;
          left: 50%;
          transform: translateX(-50%);
          width: 16px;
          height: 24px;
          background: linear-gradient(to bottom, #f59e0b, #ef4444, transparent);
          border-radius: 50%;
          animation: flamePulse 0.15s infinite alternate;
        }
        @keyframes flamePulse {
          0% { height: 20px; opacity: 0.8; }
          100% { height: 28px; opacity: 1; filter: drop-shadow(0 0 8px #f59e0b); }
        }
      </style>
      <div class="rocket-arena" id="rocketArena">
        <div class="rocket-tracker-bar">
          <span>ROCKETS LAUNCHED: <strong id="launchedCount" style="color:var(--class-theme-color);">0</strong>/<span id="targetGoal">${this.goalCount}</span></span>
        </div>
        <div id="targetRocket" class="rocket-entity">
          <svg viewBox="0 0 60 90" width="100%" height="100%">
            <path d="M30 2 C42 20, 48 45, 48 70 L12 70 C12 45, 18 20, 30 2 Z" id="rocketBody" fill="#22c55e" stroke="#ffffff" stroke-width="2"/>
            <path d="M12 50 C2 55, 0 75, 4 82 L12 70 Z" id="rocketFinLeft" fill="#1e293b"/>
            <path d="M48 50 C58 55, 60 75, 56 82 L48 70 Z" id="rocketFinRight" fill="#1e293b"/>
            <circle cx="30" cy="36" r="14" fill="#ffffff" stroke="#020617" stroke-width="2"/>
          </svg>
          <div id="rocketLetter" class="rocket-badge">F</div>
          <div class="rocket-flame"></div>
        </div>
      </div>
    `;
  },

  spawnRocket() {
    this.clearIntervals();
    if (this.currentIndex >= this.targetSequence.length) {
      this.finishGame();
      return;
    }

    const currentChar = this.targetSequence[this.currentIndex];
    const rocket = document.getElementById('targetRocket');
    const body = document.getElementById('rocketBody');
    const letterEl = document.getElementById('rocketLetter');
    
    if (!rocket || !body) return;

    // Set position and color based on key
    const xPos = this.keyPositions[currentChar] || 50;
    const themeColor = this.keyColors[currentChar] || 'var(--class-theme-color)';

    rocket.style.left = `calc(${xPos}% - 30px)`;
    this.currentBottom = this.minBottom;
    rocket.style.bottom = `${this.currentBottom}%`;
    body.setAttribute('fill', themeColor);
    letterEl.innerText = currentChar.toUpperCase();

    this.isAnimating = false;
    this.startRising();
  },

  startRising() {
    this.riseInterval = setInterval(() => {
      if (this.isAnimating) return;

      this.currentBottom += this.riseSpeed;
      const rocket = document.getElementById('targetRocket');
      
      if (rocket) {
        rocket.style.bottom = `${this.currentBottom}%`;
      }

      // Reached top without typing
      if (this.currentBottom >= this.maxBottom) {
        this.totalAttempts++;
        this.shakeRocket();
        this.currentBottom = this.minBottom; // Reset back to bottom for retry
      }
    }, 20);
  },

  handleInput(key) {
    if (this.isAnimating) return;

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
    
    this.launchInterval = setInterval(() => {
      this.currentBottom += 3.5; // Rapid boost upwards
      if (rocket) rocket.style.bottom = `${this.currentBottom}%`;

      if (this.currentBottom > 110) { // Off screen
        this.clearIntervals();
        this.currentIndex++;
        
        const countEl = document.getElementById('launchedCount');
        if (countEl) countEl.innerText = this.currentIndex;

        this.spawnRocket();
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
    this.isAnimating = false;
  }
};