// rocket-game.js - Rocket Defense Game Engine

const RocketGame = {
  goalCount: 20,
  currentIndex: 0,
  targetSequence: "",
  correctCount: 0,
  totalAttempts: 0,
  animInterval: null,
  isAnimating: false,
  keyPositions: { 'a': 15, 's': 25, 'd': 35, 'f': 45, 'j': 55, 'k': 65, 'l': 75, ';': 85 },
  onCompleteCallback: null,

  init(onComplete) {
    this.onCompleteCallback = onComplete;
    this.currentIndex = 0;
    this.correctCount = 0;
    this.totalAttempts = 0;
    this.isAnimating = false;
    this.targetSequence = this.generateSequence(this.goalCount);
    
    document.getElementById('launchedCount').innerText = 0;
    document.getElementById('targetGoal').innerText = this.goalCount;
    this.positionRocket();
  },

  generateSequence(length) {
    const chars = ["f", "j", "d", "k"];
    let seq = "";
    for (let i = 0; i < length; i++) {
      seq += chars[Math.floor(Math.random() * chars.length)];
    }
    return seq;
  },

  positionRocket() {
    const rocket = document.getElementById('targetRocket');
    const currentChar = this.targetSequence[this.currentIndex].toLowerCase();
    const xPos = this.keyPositions[currentChar] || 50;
    
    rocket.style.left = `calc(${xPos}% - 25px)`;
    rocket.style.bottom = '20px';
    document.getElementById('rocketLetter').innerText = this.targetSequence[this.currentIndex].toUpperCase();
  },

  handleInput(key) {
    if (this.isAnimating) return;

    const expectedChar = this.targetSequence[this.currentIndex];
    this.totalAttempts++;

    if (key.toLowerCase() === expectedChar.toLowerCase()) {
      this.correctCount++;
      this.launchAnimation();
    } else {
      this.shakeRocket();
    }

    return Math.round((this.correctCount / this.totalAttempts) * 100);
  },

  launchAnimation() {
    this.isAnimating = true;
    const rocket = document.getElementById('targetRocket');
    let pos = 20;

    clearInterval(this.animInterval);
    this.animInterval = setInterval(() => {
      pos += 18;
      rocket.style.bottom = `${pos}px`;

      if (pos > 360) {
        clearInterval(this.animInterval);
        this.isAnimating = false;
        this.currentIndex++;
        document.getElementById('launchedCount').innerText = this.currentIndex;

        if (this.currentIndex >= this.targetSequence.length) {
          const finalAccuracy = Math.round((this.correctCount / this.totalAttempts) * 100);
          if (this.onCompleteCallback) this.onCompleteCallback(finalAccuracy);
        } else {
          this.positionRocket();
        }
      }
    }, 20);
  },

  shakeRocket() {
    const rocket = document.getElementById('targetRocket');
    rocket.classList.add('shake');
    setTimeout(() => rocket.classList.remove('shake'), 200);
  },

  reset() {
    clearInterval(this.animInterval);
    this.isAnimating = false;
  }
};