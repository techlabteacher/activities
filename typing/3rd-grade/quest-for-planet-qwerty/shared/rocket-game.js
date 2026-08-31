<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lesson 4: Rocket Defense</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;900&family=Share+Tech+Mono&family=Fredoka+One&family=Open+Sans:wght@600;700&display=swap" rel="stylesheet">
  
  <style>
    :root {
      --class-theme-color: #38bdf8;
      --neon-green: #22c55e;
      --neon-amber: #f59e0b;
      --neon-red: #ef4444;
      --font-tech: 'Share Tech Mono', monospace;
      --font-header: 'Orbitron', sans-serif;
      --font-playful: 'Fredoka One', cursive;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body { 
      background: radial-gradient(circle at 50% 20%, #1e1b4b 0%, #030712 100%);
      color: #f8fafc; 
      font-family: 'Open Sans', sans-serif; 
      min-height: 100vh;
      padding: 20px; 
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      user-select: none;
    }

    .game-console { 
      max-width: 800px; 
      width: 100%;
      background: rgba(19, 27, 46, 0.95); 
      border-radius: 24px; 
      padding: 25px; 
      box-shadow: 0 0 35px var(--class-theme-color); 
      border: 3px solid var(--class-theme-color); 
      position: relative;
    }

    .console-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(10, 14, 23, 0.8);
      padding: 12px 20px;
      border-radius: 14px;
      margin-bottom: 15px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .title-group { display: flex; align-items: center; gap: 12px; }
    .app-title { font-family: var(--font-header); color: var(--class-theme-color); font-size: 1.3rem; font-weight: 800; }

    .sky-game-area {
      background: radial-gradient(circle at 50% 100%, #1e293b 0%, #030712 100%);
      border: 2px solid var(--class-theme-color);
      border-radius: 14px;
      height: 400px;
      margin-bottom: 15px;
      position: relative;
      overflow: hidden;
    }

    .rocket-counter-center {
      position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.85); padding: 6px 20px; border-radius: 20px;
      font-family: var(--font-tech); border: 1px solid var(--class-theme-color); z-index: 10;
    }

    .target-rocket {
      width: 50px; height: 80px;
      position: absolute; bottom: 20px;
      display: flex; flex-direction: column; align-items: center;
      transition: left 0.3s ease-out;
    }

    .target-rocket.shake { animation: shake 0.2s ease-in-out; }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-8px); }
      75% { transform: translateX(8px); }
    }

    .rocket-structure { position: relative; width: 36px; height: 60px; display: flex; align-items: center; justify-content: center; }
    .rocket-nose { position: absolute; top: 0; width: 18px; height: 18px; background: #cbd5e1; clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }
    .rocket-body-main { position: absolute; top: 14px; width: 22px; height: 40px; background: var(--neon-green); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .rocket-letter { font-family: var(--font-playful); font-size: 1.1rem; color: #1e293b; font-weight: bold; }
    .rocket-thruster-flame { width: 10px; height: 14px; background: linear-gradient(180deg, var(--neon-amber), var(--neon-red)); border-radius: 0 0 6px 6px; }

    .telemetry-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(15, 23, 42, 0.6);
      padding: 10px 18px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .meter-label { font-family: var(--font-tech); font-size: 0.85rem; color: #cbd5e1; margin-right: 10px; }
    .accuracy-text { font-family: var(--font-tech); font-weight: bold; font-size: 1rem; color: var(--neon-green); }

    .btn-control {
      font-family: var(--font-tech);
      background: #1e293b;
      color: var(--class-theme-color);
      border: 1px solid var(--class-theme-color);
      height: 36px;
      padding: 0 12px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-control:hover { background: rgba(56, 189, 248, 0.2); }

    .modal-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(3, 7, 18, 0.92); border-radius: 24px; display: flex; justify-content: center; align-items: center; z-index: 30; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
    .modal-overlay.active { opacity: 1; pointer-events: auto; }
    .modal-card { background: #0f172a; border: 2px solid var(--class-theme-color); border-radius: 20px; padding: 30px; max-width: 440px; width: 90%; text-align: center; }
    .modal-title { font-family: var(--font-header); color: var(--class-theme-color); font-size: 1.5rem; margin-bottom: 10px; }
    .stars-container { font-size: 2.2rem; margin: 10px 0; color: #334155; }
    .star.filled { color: var(--neon-amber); }
    .btn-primary { font-family: var(--font-tech); background: var(--class-theme-color); color: #020617; padding: 10px 24px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer; transition: transform 0.1s; }
    .btn-primary:hover { transform: scale(1.05); }
  </style>
</head>
<body onload="initGame()">

<div class="game-console">
  <div class="console-header">
    <div class="title-group">
      <span style="font-size: 1.8rem;">🚀</span>
      <span class="app-title">Lesson 4: Rocket Defense</span>
    </div>
    <button class="btn-control" onclick="resetGame()">RESTART</button>
  </div>

  <div class="sky-game-area">
    <div class="rocket-counter-center">Rockets Destroyed: <span id="launchedCount">0</span> / <span id="targetGoal">20</span></div>
    <div id="targetRocket" class="target-rocket">
      <div class="rocket-structure">
        <div class="rocket-nose"></div>
        <div class="rocket-body-main"><span id="rocketLetter" class="rocket-letter">F</span></div>
      </div>
      <div class="rocket-thruster-flame"></div>
    </div>
  </div>

  <div class="telemetry-bar">
    <div>
      <span class="meter-label">ACCURACY:</span>
      <span id="accuracyVal" class="accuracy-text">100%</span>
    </div>
    <button class="btn-control" onclick="window.close()">CLOSE GAME</button>
  </div>

  <!-- Completion Modal -->
  <div id="completionModal" class="modal-overlay">
    <div class="modal-card">
      <h2 class="modal-title">DEFENSE COMPLETE!</h2>
      <div class="stars-container">
        <span class="star" id="star1">★</span><span class="star" id="star2">★</span><span class="star" id="star3">★</span>
      </div>
      <p style="margin-bottom: 15px; color: #cbd5e1;">Accuracy: <strong id="finalAccuracy">100%</strong></p>
      <button class="btn-primary" onclick="resetGame()">Play Again 🚀</button>
    </div>
  </div>
</div>

<script>
  const ROCKET_GOAL_COUNT = 20;
  const keyXPositions = { 'a': 15, 's': 25, 'd': 35, 'f': 45, 'j': 55, 'k': 65, 'l': 75, ';': 85 };

  let targetText = "";
  let currentIndex = 0;
  let totalTyped = 0, correctTyped = 0;
  let rocketAnim = null;
  let isAnimatingRocket = false;

  function initGame() {
    window.addEventListener('keydown', handleKeyPress);
    resetGame();
  }

  function generateRandomSequence(length) {
    const chars = ["f", "j", "d", "k"];
    let res = "";
    for (let i = 0; i < length; i++) res += chars[Math.floor(Math.random() * chars.length)];
    return res;
  }

  function resetGame() {
    clearInterval(rocketAnim);
    isAnimatingRocket = false;
    currentIndex = 0; totalTyped = 0; correctTyped = 0;
    targetText = generateRandomSequence(ROCKET_GOAL_COUNT);
    document.getElementById('launchedCount').innerText = 0;
    document.getElementById('accuracyVal').innerText = "100%";
    document.getElementById('completionModal').classList.remove('active');
    positionGameRocket();
  }

  function positionGameRocket() {
    const rocket = document.getElementById('targetRocket');
    const char = targetText[currentIndex].toLowerCase();
    const xPos = keyXPositions[char] || 50;
    rocket.style.left = `calc(${xPos}% - 25px)`;
    rocket.style.bottom = '20px';
    document.getElementById('rocketLetter').innerText = targetText[currentIndex].toUpperCase();
  }

  function launchRocketAnimation() {
    if (isAnimatingRocket) return;
    isAnimatingRocket = true;
    const rocket = document.getElementById('targetRocket');
    let pos = 20;
    clearInterval(rocketAnim);
    rocketAnim = setInterval(() => {
      pos += 18;
      rocket.style.bottom = `${pos}px`;
      if (pos > 400) {
        clearInterval(rocketAnim);
        isAnimatingRocket = false;
        currentIndex++;
        document.getElementById('launchedCount').innerText = currentIndex;
        if (currentIndex >= targetText.length) {
          showCompletionModal(Math.round((correctTyped / totalTyped) * 100));
        } else {
          positionGameRocket();
        }
      }
    }, 20);
  }

  function handleKeyPress(e) {
    if (e.key === ' ' || e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) return;
    if (isAnimatingRocket || currentIndex >= targetText.length) return;

    totalTyped++;
    const expectedChar = targetText[currentIndex];

    if (e.key.toLowerCase() === expectedChar.toLowerCase()) {
      correctTyped++;
      launchRocketAnimation();
    } else {
      const rocket = document.getElementById('targetRocket');
      rocket.classList.add('shake');
      setTimeout(() => rocket.classList.remove('shake'), 200);
    }

    const acc = Math.round((correctTyped / totalTyped) * 100);
    const txt = document.getElementById('accuracyVal');
    txt.innerText = `${acc}%`;
    txt.style.color = acc >= 90 ? 'var(--neon-green)' : (acc >= 80 ? 'var(--neon-amber)' : 'var(--neon-red)');
  }

  function showCompletionModal(accuracy) {
    let starsEarned = 0;
    if (accuracy >= 80 && accuracy <= 84) starsEarned = 1;
    else if (accuracy >= 85 && accuracy <= 89) starsEarned = 2;
    else if (accuracy >= 90) starsEarned = 3;

    document.getElementById('star1').classList.toggle('filled', starsEarned >= 1);
    document.getElementById('star2').classList.toggle('filled', starsEarned >= 2);
    document.getElementById('star3').classList.toggle('filled', starsEarned >= 3);
    document.getElementById('finalAccuracy').innerText = `${accuracy}%`;

    document.getElementById('completionModal').classList.add('active');
  }
</script>
</body>
</html>