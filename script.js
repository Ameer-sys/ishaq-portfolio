const calmModeButton = document.querySelector("#calmMode");
const ship = document.querySelector("#ship");
const skillNote = document.querySelector("#skillNote");
const skillButtons = document.querySelectorAll("[data-skill]");
const canvas = document.querySelector("#techGame");
const ctx = canvas.getContext("2d");
const startButton = document.querySelector("#startGame");
const gameStatus = document.querySelector("#gameStatus");

const keys = new Set();
let animationFrame = null;
let gameRunning = false;
let score = 0;
let timeLeft = 45;
let lastTick = 0;
let player;
let collectibles;
let rocks;

const techItems = ["Py", "C++", "JS", "Git", "API", "C", "AI", "CSS"];

calmModeButton.addEventListener("click", () => {
  const isCalm = document.body.classList.toggle("calm");
  calmModeButton.setAttribute("aria-pressed", String(isCalm));
});

window.addEventListener("scroll", () => {
  if (!ship || document.body.classList.contains("calm")) {
    return;
  }

  const travel = Math.min(window.scrollY * 0.18, 140);
  ship.style.translate = `${travel}px 0`;
});

skillButtons.forEach((button) => {
  const showSkill = () => {
    skillNote.textContent = button.dataset.skill;
  };

  button.addEventListener("mouseenter", showSkill);
  button.addEventListener("focus", showSkill);
  button.addEventListener("click", showSkill);
});

window.addEventListener("keydown", (event) => {
  keys.add(event.key.toLowerCase());
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

function resetGame() {
  score = 0;
  timeLeft = 45;
  lastTick = performance.now();
  player = {
    x: 84,
    y: canvas.height / 2,
    width: 54,
    height: 34,
    speed: 4.6,
  };

  collectibles = Array.from({ length: 10 }, (_, index) => ({
    x: 170 + Math.random() * (canvas.width - 220),
    y: 54 + Math.random() * (canvas.height - 108),
    size: 32,
    label: techItems[index % techItems.length],
    collected: false,
  }));

  rocks = Array.from({ length: 6 }, () => ({
    x: 230 + Math.random() * (canvas.width - 280),
    y: 58 + Math.random() * (canvas.height - 116),
    radius: 18 + Math.random() * 12,
  }));
}

function startGame() {
  resetGame();
  gameRunning = true;
  startButton.textContent = "Restart Game";
  gameStatus.textContent = "Collect the tech icons. Avoid the rocks.";
  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(gameLoop);
}

function gameLoop(now) {
  const deltaSeconds = (now - lastTick) / 1000;
  lastTick = now;

  if (gameRunning) {
    timeLeft -= deltaSeconds;
    updatePlayer();
    checkCollisions();
  }

  drawGame();

  if (timeLeft <= 0 || score === collectibles.length) {
    endGame();
    return;
  }

  animationFrame = requestAnimationFrame(gameLoop);
}

function updatePlayer() {
  const left = keys.has("arrowleft") || keys.has("a");
  const right = keys.has("arrowright") || keys.has("d");
  const up = keys.has("arrowup") || keys.has("w");
  const down = keys.has("arrowdown") || keys.has("s");

  if (left) player.x -= player.speed;
  if (right) player.x += player.speed;
  if (up) player.y -= player.speed;
  if (down) player.y += player.speed;

  player.x = clamp(player.x, 16, canvas.width - player.width - 16);
  player.y = clamp(player.y, 50, canvas.height - player.height - 20);
}

function checkCollisions() {
  collectibles.forEach((item) => {
    if (!item.collected && rectanglesTouch(player, item)) {
      item.collected = true;
      score += 1;
    }
  });

  rocks.forEach((rock) => {
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    const distance = Math.hypot(centerX - rock.x, centerY - rock.y);

    if (distance < rock.radius + 17) {
      player.x = 84;
      player.y = canvas.height / 2;
      timeLeft = Math.max(0, timeLeft - 3);
    }
  });
}

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawWater();
  drawRocks();
  drawCollectibles();
  drawBoat();
  drawHud();
}

function drawWater() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#84d6ec");
  gradient.addColorStop(0.58, "#117b94");
  gradient.addColorStop(1, "#084b63");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.38)";
  ctx.lineWidth = 3;
  for (let y = 80; y < canvas.height; y += 54) {
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += 20) {
      const waveY = y + Math.sin((x + performance.now() / 20) / 30) * 7;
      if (x === 0) {
        ctx.moveTo(x, waveY);
      } else {
        ctx.lineTo(x, waveY);
      }
    }
    ctx.stroke();
  }
}

function drawBoat() {
  ctx.fillStyle = "#623a2c";
  roundedRect(player.x, player.y + 18, player.width, 18, 12);
  ctx.fill();

  ctx.fillStyle = "#fffaf0";
  ctx.beginPath();
  ctx.moveTo(player.x + 26, player.y - 8);
  ctx.lineTo(player.x + 26, player.y + 18);
  ctx.lineTo(player.x + 50, player.y + 18);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#5e3d26";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(player.x + 25, player.y - 8);
  ctx.lineTo(player.x + 25, player.y + 26);
  ctx.stroke();
}

function drawCollectibles() {
  collectibles.forEach((item) => {
    if (item.collected) return;

    ctx.fillStyle = "#fffaf0";
    roundedRect(item.x, item.y, item.size + 12, item.size, 8);
    ctx.fill();
    ctx.strokeStyle = "#084b63";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#084b63";
    ctx.font = "700 13px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(item.label, item.x + item.size / 2 + 6, item.y + item.size / 2);
  });
}

function drawRocks() {
  rocks.forEach((rock) => {
    ctx.fillStyle = "#5b6f7f";
    ctx.beginPath();
    ctx.arc(rock.x, rock.y, rock.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.beginPath();
    ctx.arc(rock.x - rock.radius / 3, rock.y - rock.radius / 3, rock.radius / 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawHud() {
  ctx.fillStyle = "rgba(255, 250, 240, 0.92)";
  roundedRect(18, 16, 236, 42, 10);
  ctx.fill();
  ctx.fillStyle = "#102033";
  ctx.font = "800 16px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(`Score ${score}/${collectibles.length}`, 34, 38);
  ctx.fillText(`Time ${Math.ceil(Math.max(0, timeLeft))}`, 144, 38);
}

function endGame() {
  gameRunning = false;
  cancelAnimationFrame(animationFrame);
  drawGame();
  gameStatus.textContent =
    score === collectibles.length
      ? "Nice. You collected the full tech stack."
      : `Run complete. You collected ${score} tech item${score === 1 ? "" : "s"}.`;
}

function rectanglesTouch(first, second) {
  return (
    first.x < second.x + second.size &&
    first.x + first.width > second.x &&
    first.y < second.y + second.size &&
    first.y + first.height > second.y
  );
}

function roundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

resetGame();
drawGame();
startButton.addEventListener("click", startGame);
