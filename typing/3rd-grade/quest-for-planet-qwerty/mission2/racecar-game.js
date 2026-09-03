window.RaceCarGame = (function() {
  let canvas, ctx;
  let targetText = "";
  let currentIndex = 0;
  let totalTyped = 0;
  let correctTyped = 0;
  let onCompleteCallback = null;
  let animationId = null;

  function init(text, onComplete) {
    targetText = text || "";
    currentIndex = 0;
    totalTyped = 0;
    correctTyped = 0;
    onCompleteCallback = onComplete;

    const container = document.getElementById('raceCarGameDisplay');
    if (!container) return;

    container.innerHTML = '<canvas id="raceCarCanvas"></canvas>';
    canvas = document.getElementById('raceCarCanvas');
    ctx = canvas.getContext('2d');

    resizeCanvas();
    window.removeEventListener('resize', resizeCanvas);
    window.addEventListener('resize', resizeCanvas);

    if (animationId) cancelAnimationFrame(animationId);
    loop();
  }

  function resizeCanvas() {
    const container = document.getElementById('raceCarGameDisplay');
    if (container && canvas) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }
  }

  function reset() {
    currentIndex = 0;
    totalTyped = 0;
    correctTyped = 0;
  }

  function handleInput(key) {
    if (currentIndex >= targetText.length) return;

    totalTyped++;
    const expectedChar = targetText[currentIndex];

    if (key === expectedChar) {
      correctTyped++;
      currentIndex++;
    }

    const accuracy = Math.round((correctTyped / totalTyped) * 100);

    if (currentIndex >= targetText.length && typeof onCompleteCallback === 'function') {
      setTimeout(() => onCompleteCallback(accuracy), 300);
    }

    return accuracy;
  }

  function loop() {
    draw();
    animationId = requestAnimationFrame(loop);
  }

  function draw() {
    if (!ctx || !canvas) return;

    const w = canvas.width;
    const h = canvas.height;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Racetrack background
    const trackY = h * 0.4;
    const trackHeight = h * 0.35;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, trackY, w, trackHeight);

    // Track Borders
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, trackY);
    ctx.lineTo(w, trackY);
    ctx.moveTo(0, trackY + trackHeight);
    ctx.lineTo(w, trackY + trackHeight);
    ctx.stroke();

    // Center Dashed Line
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([15, 15]);
    ctx.beginPath();
    ctx.moveTo(0, trackY + trackHeight / 2);
    ctx.lineTo(w, trackY + trackHeight / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Finish Line
    const finishX = w - 60;
    const squareSize = 10;
    for (let r = 0; r < Math.floor(trackHeight / squareSize); r++) {
      for (let c = 0; c < 2; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? '#ffffff' : '#000000';
        ctx.fillRect(finishX + c * squareSize, trackY + r * squareSize, squareSize, squareSize);
      }
    }

    // Car position calculation
    const progress = targetText.length > 0 ? currentIndex / targetText.length : 0;
    const startX = 40;
    const maxCarX = finishX - 50;
    const carX = startX + progress * (maxCarX - startX);
    const carY = trackY + trackHeight / 2 - 12;

    // Draw Race Car Body
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.fillRect(carX, carY, 40, 24);
    ctx.shadowBlur = 0;

    // Cabin
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(carX + 10, carY + 4, 18, 16);

    // Wheels
    ctx.fillStyle = '#000000';
    ctx.fillRect(carX + 4, carY - 4, 8, 6);
    ctx.fillRect(carX + 28, carY - 4, 8, 6);
    ctx.fillRect(carX + 4, carY + 22, 8, 6);
    ctx.fillRect(carX + 28, carY + 22, 8, 6);

    // On-screen Prompts / Text HUD
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';

    const charToShow = targetText[currentIndex] || 'FINISHED!';
    ctx.fillText(`TYPE THIS KEY: [ ${charToShow === ' ' ? 'SPACE' : charToShow} ]`, w / 2, h * 0.2);

    // Remaining text preview
    ctx.font = '16px "Share Tech Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    const remaining = targetText.substring(currentIndex, currentIndex + 15);
    ctx.fillText(`NEXT: ${remaining}`, w / 2, h * 0.88);
  }

  return {
    init: init,
    reset: reset,
    handleInput: handleInput
  };
})();