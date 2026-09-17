const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const soundButton = document.getElementById("soundButton");

const W = canvas.width;
const H = canvas.height;
const GROUND_Y = H - 72;
const STORAGE_KEY = "cloud-hopper-high-score";

const state = {
  mode: "ready",
  score: 0,
  highScore: Number(localStorage.getItem(STORAGE_KEY) || 0),
  pipes: [],
  spawnTimer: 0,
  lastTime: performance.now(),
  gameOverAt: 0,
  soundOn: true,
  shake: 0,
};

const bird = {
  x: 92,
  y: 290,
  vy: 0,
  radius: 15,
  rotation: 0,
  bobTime: 0,
};

let audioContext = null;

function ensureAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function tone(frequency, duration, volume = 0.035, type = "sine") {
  if (!state.soundOn) return;
  ensureAudio();

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const now = audioContext.currentTime;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + duration);
}

function resetGame() {
  state.mode = "ready";
  state.score = 0;
  state.pipes = [];
  state.spawnTimer = 0;
  state.shake = 0;

  bird.x = 92;
  bird.y = 290;
  bird.vy = 0;
  bird.rotation = 0;
  bird.bobTime = 0;
}

function startGame() {
  state.mode = "running";
  state.spawnTimer = 0.55;
  flap();
}

function flap() {
  if (state.mode !== "running") return;
  bird.vy = -365;
  tone(540, 0.06, 0.025, "triangle");
}

function handleAction() {
  if (state.mode === "ready") {
    startGame();
    return;
  }

  if (state.mode === "running") {
    flap();
    return;
  }

  if (state.mode === "gameover" && performance.now() - state.gameOverAt > 320) {
    resetGame();
    startGame();
  }
}

function spawnPipe() {
  const gap = Math.max(124, 164 - state.score * 1.4);
  const margin = 84;
  const minCenter = margin + gap / 2;
  const maxCenter = GROUND_Y - margin - gap / 2;
  const gapCenter = minCenter + Math.random() * (maxCenter - minCenter);

  state.pipes.push({
    x: W + 28,
    width: 62,
    gapTop: gapCenter - gap / 2,
    gapBottom: gapCenter + gap / 2,
    scored: false,
  });
}

function endGame() {
  if (state.mode !== "running") return;

  state.mode = "gameover";
  state.gameOverAt = performance.now();
  state.shake = 8;
  tone(170, 0.18, 0.05, "sawtooth");

  if (state.score > state.highScore) {
    state.highScore = state.score;
    localStorage.setItem(STORAGE_KEY, String(state.highScore));
  }
}

function circleRectCollision(cx, cy, radius, rect) {
  const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.height));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy < radius * radius;
}

function update(dt) {
  bird.bobTime += dt;

  if (state.shake > 0) {
    state.shake = Math.max(0, state.shake - dt * 28);
  }

  if (state.mode === "ready") {
    bird.y = 290 + Math.sin(bird.bobTime * 3.2) * 7;
    bird.rotation = Math.sin(bird.bobTime * 3.2) * 0.05;
    return;
  }

  if (state.mode === "running") {
    bird.vy += 1020 * dt;
    bird.y += bird.vy * dt;
    bird.rotation = Math.max(-0.42, Math.min(1.15, bird.vy / 470));

    const speed = Math.min(215, 148 + state.score * 2.1);
    state.spawnTimer -= dt;

    if (state.spawnTimer <= 0) {
      spawnPipe();
      state.spawnTimer = Math.max(1.18, 1.48 - state.score * 0.008);
    }

    for (const pipe of state.pipes) {
      pipe.x -= speed * dt;

      if (!pipe.scored && pipe.x + pipe.width < bird.x) {
        pipe.scored = true;
        state.score += 1;
        tone(760, 0.09, 0.03, "sine");
      }

      const topRect = { x: pipe.x, y: 0, width: pipe.width, height: pipe.gapTop };
      const bottomRect = {
        x: pipe.x,
        y: pipe.gapBottom,
        width: pipe.width,
        height: GROUND_Y - pipe.gapBottom,
      };

      if (
        circleRectCollision(bird.x, bird.y, bird.radius - 2, topRect) ||
        circleRectCollision(bird.x, bird.y, bird.radius - 2, bottomRect)
      ) {
        endGame();
      }
    }

    state.pipes = state.pipes.filter((pipe) => pipe.x + pipe.width > -20);

    if (bird.y - bird.radius <= 0 || bird.y + bird.radius >= GROUND_Y) {
      bird.y = Math.min(GROUND_Y - bird.radius, Math.max(bird.radius, bird.y));
      endGame();
    }
  } else if (state.mode === "gameover") {
    if (bird.y + bird.radius < GROUND_Y) {
      bird.vy += 1200 * dt;
      bird.y += bird.vy * dt;
      bird.rotation = Math.min(1.45, bird.rotation + dt * 2.7);
    } else {
      bird.y = GROUND_Y - bird.radius;
    }
  }
}

function roundedRect(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawBackground(time) {
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, "#67e8f9");
  sky.addColorStop(0.48, "#93c5fd");
  sky.addColorStop(1, "#dbeafe");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GROUND_Y);

  drawSun();
  drawCloud(52 - ((time * 7) % 470), 105, 0.85, 0.62);
  drawCloud(280 - ((time * 4.5) % 520), 168, 0.65, 0.5);
  drawCloud(410 - ((time * 5.2) % 540), 78, 0.55, 0.42);

  ctx.fillStyle = "#86efac";
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y - 46);
  ctx.quadraticCurveTo(72, GROUND_Y - 110, 146, GROUND_Y - 48);
  ctx.quadraticCurveTo(230, GROUND_Y - 122, 360, GROUND_Y - 44);
  ctx.lineTo(360, GROUND_Y);
  ctx.lineTo(0, GROUND_Y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#4ade80";
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y - 22);
  ctx.quadraticCurveTo(96, GROUND_Y - 76, 205, GROUND_Y - 24);
  ctx.quadraticCurveTo(280, GROUND_Y - 66, 360, GROUND_Y - 18);
  ctx.lineTo(360, GROUND_Y);
  ctx.lineTo(0, GROUND_Y);
  ctx.closePath();
  ctx.fill();
}

function drawSun() {
  const gradient = ctx.createRadialGradient(294, 96, 4, 294, 96, 42);
  gradient.addColorStop(0, "rgba(254, 240, 138, 0.95)");
  gradient.addColorStop(1, "rgba(254, 240, 138, 0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(294, 96, 42, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fef08a";
  ctx.beginPath();
  ctx.arc(294, 96, 22, 0, Math.PI * 2);
  ctx.fill();
}

function drawCloud(x, y, scale, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(0, 8, 22, Math.PI, 0);
  ctx.arc(22, 0, 26, Math.PI, 0);
  ctx.arc(48, 10, 18, Math.PI, 0);
  ctx.lineTo(48, 25);
  ctx.lineTo(0, 25);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawGround(time) {
  ctx.fillStyle = "#365314";
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

  ctx.fillStyle = "#65a30d";
  ctx.fillRect(0, GROUND_Y, W, 12);

  ctx.fillStyle = "#84cc16";
  ctx.fillRect(0, GROUND_Y, W, 5);

  const offset = (time * 65) % 28;
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  for (let x = -28 - offset; x < W + 28; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y + 16);
    ctx.lineTo(x + 14, H);
    ctx.lineTo(x + 24, H);
    ctx.lineTo(x + 10, GROUND_Y + 16);
    ctx.closePath();
    ctx.fill();
  }
}

function drawPipe(pipe) {
  drawPipeSection(pipe.x, 0, pipe.width, pipe.gapTop, true);
  drawPipeSection(pipe.x, pipe.gapBottom, pipe.width, GROUND_Y - pipe.gapBottom, false);
}

function drawPipeSection(x, y, width, height, isTop) {
  const bodyGradient = ctx.createLinearGradient(x, 0, x + width, 0);
  bodyGradient.addColorStop(0, "#16a34a");
  bodyGradient.addColorStop(0.45, "#4ade80");
  bodyGradient.addColorStop(1, "#15803d");

  ctx.fillStyle = bodyGradient;
  ctx.strokeStyle = "#166534";
  ctx.lineWidth = 3;

  roundedRect(x, y - 3, width, height + 6, 7);
  ctx.fill();
  ctx.stroke();

  const capHeight = 28;
  const capWidth = width + 12;
  const capX = x - 6;
  const capY = isTop ? y + height - capHeight : y;

  roundedRect(capX, capY, capWidth, capHeight, 7);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.16)";
  roundedRect(x + 8, y + 4, 8, Math.max(0, height - 8), 4);
  ctx.fill();
}

function drawBird() {
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(bird.rotation);

  ctx.fillStyle = "rgba(15, 23, 42, 0.16)";
  ctx.beginPath();
  ctx.ellipse(2, 18, 18, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  const bodyGradient = ctx.createLinearGradient(-16, -14, 18, 16);
  bodyGradient.addColorStop(0, "#fef08a");
  bodyGradient.addColorStop(1, "#f59e0b");
  ctx.fillStyle = bodyGradient;
  ctx.strokeStyle = "#92400e";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const wingY = state.mode === "running" ? Math.sin(bird.bobTime * 18) * 4 + 5 : Math.sin(bird.bobTime * 6) * 3 + 5;
  ctx.fillStyle = "#fde047";
  ctx.beginPath();
  ctx.ellipse(-5, wingY, 10, 6, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(7, -5, 6.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(9.4, -5, 2.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fb7185";
  ctx.beginPath();
  ctx.moveTo(15, -1);
  ctx.lineTo(27, 3);
  ctx.lineTo(15, 7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawScore() {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 46px system-ui, sans-serif";
  ctx.lineWidth = 7;
  ctx.strokeStyle = "rgba(15, 23, 42, 0.34)";
  ctx.strokeText(String(state.score), W / 2, 62);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(String(state.score), W / 2, 62);
}

function drawReadyOverlay() {
  ctx.fillStyle = "rgba(15, 23, 42, 0.10)";
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font = "900 35px system-ui, sans-serif";
  ctx.fillStyle = "#0f172a";
  ctx.fillText("Cloud Hopper", W / 2, 180);

  ctx.font = "700 16px system-ui, sans-serif";
  ctx.fillStyle = "rgba(15, 23, 42, 0.68)";
  ctx.fillText("Proleť mezi překážkami", W / 2, 213);

  roundedRect(74, 380, 212, 64, 20);
  ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
  ctx.fill();

  ctx.font = "800 18px system-ui, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Klepni a leť", W / 2, 403);

  ctx.font = "600 12px system-ui, sans-serif";
  ctx.fillStyle = "#cbd5e1";
  ctx.fillText("tap • klik • mezerník", W / 2, 426);

  ctx.font = "700 13px system-ui, sans-serif";
  ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
  ctx.fillText(`Rekord: ${state.highScore}`, W / 2, 480);
}

function drawGameOverOverlay() {
  ctx.fillStyle = "rgba(15, 23, 42, 0.30)";
  ctx.fillRect(0, 0, W, H);

  roundedRect(47, 188, 266, 226, 26);
  ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font = "900 30px system-ui, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Konec hry", W / 2, 232);

  ctx.font = "700 13px system-ui, sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("SKÓRE", 118, 280);
  ctx.fillText("REKORD", 242, 280);

  ctx.font = "900 31px system-ui, sans-serif";
  ctx.fillStyle = "#f8fafc";
  ctx.fillText(String(state.score), 118, 316);
  ctx.fillStyle = "#fde047";
  ctx.fillText(String(state.highScore), 242, 316);

  roundedRect(82, 346, 196, 48, 16);
  ctx.fillStyle = "#22c55e";
  ctx.fill();

  ctx.font = "800 16px system-ui, sans-serif";
  ctx.fillStyle = "#052e16";
  ctx.fillText("Hrát znovu", W / 2, 370);
}

function draw(time) {
  ctx.save();

  if (state.shake > 0) {
    const amount = state.shake;
    ctx.translate((Math.random() - 0.5) * amount, (Math.random() - 0.5) * amount);
  }

  drawBackground(time);

  for (const pipe of state.pipes) {
    drawPipe(pipe);
  }

  drawGround(time);
  drawBird();

  if (state.mode === "running") {
    drawScore();
  } else if (state.mode === "ready") {
    drawReadyOverlay();
  } else {
    drawGameOverOverlay();
  }

  ctx.restore();
}

function loop(now) {
  const dt = Math.min((now - state.lastTime) / 1000, 0.033);
  state.lastTime = now;

  update(dt);
  draw(now / 1000);
  requestAnimationFrame(loop);
}

canvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  handleAction();
});

document.addEventListener("keydown", (event) => {
  if (event.code === "Space" || event.code === "ArrowUp") {
    event.preventDefault();
    handleAction();
  }
});

soundButton.addEventListener("click", (event) => {
  event.stopPropagation();
  state.soundOn = !state.soundOn;
  soundButton.textContent = state.soundOn ? "🔊" : "🔇";
  soundButton.setAttribute("aria-label", state.soundOn ? "Vypnout zvuk" : "Zapnout zvuk");

  if (state.soundOn) {
    tone(660, 0.07, 0.025, "sine");
  }
});

window.addEventListener("blur", () => {
  state.lastTime = performance.now();
});

requestAnimationFrame(loop);
