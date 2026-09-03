window.RaceCarGame = {
  targetText: "",
  currentIndex: 0,
  totalTyped: 0,
  correctTyped: 0,
  errorIndices: [],
  onComplete: null,
  canvas: null,
  ctx: null,
  animFrame: null,

  init(text, completeCallback) {
    this.targetText = text;
    this.onComplete = completeCallback;
    this.canvas = document.getElementById('raceCarCanvas');
    if (this.canvas) {
      this.canvas.width = this.canvas.parentElement.clientWidth;
      this.canvas.height = 260;
      this.ctx = this.canvas.getContext('2d');
    }
    this.reset();
  },

  reset() {
    this.currentIndex = 0;
    this.totalTyped = 0;
    this.correctTyped = 0;
    this.errorIndices = [];
    this.renderText();
    this.startAnimation();
  },

  renderText() {
    const container = document.getElementById('raceTextNodesContainer');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < this.targetText.length; i++) {
      const span = document.createElement('span');
      span.className = 'char-node';
      if (this.targetText[i] === ' ') {
        span.classList.add('space-node');
        span.innerHTML = '&nbsp;';
      } else {
        span.innerText = this.targetText[i];
      }
      if (i < this.currentIndex) {
        span.classList.add(this.errorIndices.includes(i) ? 'char-error' : 'char-done');
      } else if (i === this.currentIndex) {
        span.classList.add('char-current');
      }
      container.appendChild(span);
    }
  },

  handleInput(key) {
    if (this.currentIndex >= this.targetText.length) return;
    const expectedChar = this.targetText[this.currentIndex];
    this.totalTyped++;
    if (key === expectedChar) {
      this.correctTyped++;
    } else {
      this.errorIndices.push(this.currentIndex);
    }
    this.currentIndex++;
    this.renderText();

    const acc = Math.round((this.correctTyped / this.totalTyped) * 100);
    if (this.currentIndex >= this.targetText.length) {
      cancelAnimationFrame(this.animFrame);
      if (this.onComplete) this.onComplete(acc);
    }
    return acc;
  },

  startAnimation() {
    const draw = () => {
      if (!this.ctx) return;
      const w = this.canvas.width;
      const h = this.canvas.height;
      this.ctx.clearRect(0, 0, w, h);

      // Track Background
      this.ctx.fillStyle = '#0f172a';
      this.ctx.fillRect(0, 0, w, h);

      // Outer Track Border
      this.ctx.strokeStyle = '#334155';
      this.ctx.lineWidth = 4;
      this.ctx.strokeRect(20, 20, w - 40, h - 40);

      // Finish Line
      this.ctx.fillStyle = '#22c55e';
      this.ctx.fillRect(w - 60, 30, 10, h - 60);

      // Progress Calculation
      const progress = this.targetText.length > 0 ? (this.currentIndex / this.targetText.length) : 0;
      const carX = 40 + progress * (w - 120);
      const carY = h / 2 - 15;

      // Draw Race Car Body
      this.ctx.fillStyle = '#ef4444';
      this.ctx.fillRect(carX, carY, 40, 30);
      this.ctx.fillStyle = '#38bdf8';
      this.ctx.fillRect(carX + 25, carY + 5, 10, 20);

      this.animFrame = requestAnimationFrame(draw);
    };
    draw();
  }
};