const calmModeButton = document.querySelector("#calmMode");
const ship = document.querySelector("#ship");
const canvas = document.querySelector("#techGame");
const ctx = canvas.getContext("2d");
const startButton = document.querySelector("#startGame");
const gameStatus = document.querySelector("#gameStatus");
const touchButtons = document.querySelectorAll("[data-move]");
const revealItems = document.querySelectorAll(".reveal");
const galleryImage = document.querySelector("#galleryImage");
const galleryTitle = document.querySelector("#galleryTitle");
const galleryCaption = document.querySelector("#galleryCaption");
const prevSlide = document.querySelector("#prevSlide");
const nextSlide = document.querySelector("#nextSlide");

const keys = new Set();
let animationFrame = null;
let gameRunning = false;
let score = 0;
let timeLeft = 50;
let lastTick = 0;
let invincibleUntil = 0;
let player;
let collectibles;
let rocks;
let boosts;
let galleryIndex = 0;

const techItems = ["AI", "C#", "Py", "JS", "SQL", "API", "Git", "UX", "C++", "Map"];
const funnyHits = [
  "Rock tax paid. Ameer ship respawned.",
  "Tiny crash. Big comeback.",
  "Navigation said recalculating with confidence.",
  "That rock had personal beef.",
];

const gallerySlides = [
  {
    image: "assets/ishaq-headshot.jpeg",
    title: "Professional Portrait",
    caption: "Portfolio headshot used for recruiter-facing pages and professional profiles.",
    alt: "Professional headshot of Ishaq Ishaq Nasiru",
  },
  {
    image: "assets/ishaq-headshot.jpeg",
    title: "Captain's Log Portrait",
    caption: "A clean personal shot for the portfolio's ocean-themed identity.",
    alt: "Ishaq portrait used in the Captain's Log section",
  },
  {
    image: "assets/ishaq-headshot.jpeg",
    title: "Event Gallery Slot",
    caption: "Add hackathon, GDG, IT Club, and volunteering photos here as the gallery grows.",
    alt: "Placeholder gallery slide using Ishaq portrait",
  },
];

calmModeButton.addEventListener("click", () => {
  const isCalm = document.body.classList.toggle("calm");
  calmModeButton.setAttribute("aria-pressed", String(isCalm));
});

window.addEventListener("scroll", () => {
  if (!ship || document.body.classList.contains("calm")) return;
  const travel = Math.min(window.scrollY * 0.18, 140);
  ship.style.translate = `${travel}px 0`;
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

revealItems.forEach((item) => revealObserver.observe(item));

function showGallerySlide(direction = 0) {
  galleryIndex = (galleryIndex + direction + gallerySlides.length) % gallerySlides.length;
  const slide = gallerySlides[galleryIndex];
  galleryImage.style.opacity = "0";
  window.setTimeout(() => {
    galleryImage.src = slide.image;
    galleryImage.alt = slide.alt;
    galleryTitle.textContent = slide.title;
    galleryCaption.textContent = slide.caption;
    galleryImage.style.opacity = "1";
  }, 160);
}

prevSlide.addEventListener("click", () => showGallerySlide(-1));
nextSlide.addEventListener("click", () => showGallerySlide(1));

document.addEventListener("contextmenu", (event) => {
  if (event.target.closest(".gallery-frame")) {
    event.preventDefault();
  }
});

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["arrowleft", "arrowright", "arrowup", "arrowdown", "w", "a", "s", "d"].includes(key)) {
    keys.add(key);
    if (gameRunning) event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

touchButtons.forEach((button) => {
  const move = button.dataset.move;
  const keyMap = { up: "w", left: "a", down: "s", right: "d" };
  const key = keyMap[move];

  const press = (event) => {
    event.preventDefault();
    keys.add(key);
  };
  const release = (event) => {
    event.preventDefault();
    keys.delete(key);
  };

  button.addEventListener("pointerdown", press);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
});

function resetGame() {
  score = 0;
  timeLeft = 50;
  invincibleUntil = 0;
  lastTick = performance.now();
  player = {
    x: 84,
    y: canvas.height / 2,
    width: 56,
    height: 36,
    speed: 4.9,
  };

  collectibles = Array.from({ length: 12 }, (_, index) => ({
    x: 170 + Math.random() * (canvas.width - 230),
    y: 58 + Math.random() * (canvas.height - 118),
    size: 34,
    label: techItems[index % techItems.length],
    collected: false,
  }));

  rocks = Array.from({ length: 7 }, () => ({
    x: 230 + Math.random() * (canvas.width - 290),
    y: 64 + Math.random() * (canvas.height - 128),
    radius: 18 + Math.random() * 13,
  }));

  boosts = Array.from({ length: 2 }, () => ({
    x: 190 + Math.random() * (canvas.width - 260),
    y: 70 + Math.random() * (canvas.height - 140),
    size: 28,
    used: false,
  }));
}

function startGame() {
  resetGame();
  gameRunning = true;
  startButton.textContent = "Restart Game";
  gameStatus.textContent = "Collect the stack. Dodge rocks. Boosts add time.";
  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(gameLoop);
}

function gameLoop(now) {
  const deltaSeconds = (now - lastTick) / 1000;
  lastTick = now;

  if (gameRunning) {
    timeLeft -= deltaSeconds;
    updatePlayer();
    checkCollisions(now);
  }

  drawGame(now);

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
  player.y = clamp(player.y, 54, canvas.height - player.height - 20);
}

function checkCollisions(now) {
  collectibles.forEach((item) => {
    if (!item.collected && rectanglesTouch(player, item)) {
      item.collected = true;
      score += 1;
      gameStatus.textContent = score % 4 === 0 ? "Stack looking serious now." : "Nice pickup.";
    }
  });

  boosts.forEach((boost) => {
    if (!boost.used && rectanglesTouch(player, boost)) {
      boost.used = true;
      timeLeft += 6;
      gameStatus.textContent = "Power-up grabbed. Extra time unlocked.";
    }
  });

  rocks.forEach((rock) => {
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    const distance = Math.hypot(centerX - rock.x, centerY - rock.y);

    if (distance < rock.radius + 18 && now > invincibleUntil) {
      player.x = 84;
      player.y = canvas.height / 2;
      timeLeft = Math.max(0, timeLeft - 4);
      invincibleUntil = now + 1300;
      gameStatus.textContent = funnyHits[Math.floor(Math.random() * funnyHits.length)];
    }
  });
}

function drawGame(now = performance.now()) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawWater(now);
  drawRocks();
  drawBoosts(now);
  drawCollectibles(now);
  drawBoat(now);
  drawHud();
}

function drawWater(now) {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#8de0f0");
  gradient.addColorStop(0.58, "#0e86a3");
  gradient.addColorStop(1, "#073f5f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 3;
  for (let y = 82; y < canvas.height; y += 52) {
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += 20) {
      const waveY = y + Math.sin((x + now / 20) / 30) * 7;
      if (x === 0) ctx.moveTo(x, waveY);
      else ctx.lineTo(x, waveY);
    }
    ctx.stroke();
  }
}

function drawBoat(now) {
  const blinking = now < invincibleUntil && Math.floor(now / 100) % 2 === 0;
  if (blinking) return;

  ctx.fillStyle = "#623a2c";
  roundedRect(player.x, player.y + 18, player.width, 18, 12);
  ctx.fill();

  ctx.fillStyle = "#fff9ea";
  ctx.beginPath();
  ctx.moveTo(player.x + 27, player.y - 10);
  ctx.lineTo(player.x + 27, player.y + 18);
  ctx.lineTo(player.x + 52, player.y + 18);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffc43d";
  ctx.fillRect(player.x + 10, player.y + 22, 8, 8);
  ctx.fillRect(player.x + 22, player.y + 22, 8, 8);

  ctx.strokeStyle = "#5e3d26";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(player.x + 26, player.y - 10);
  ctx.lineTo(player.x + 26, player.y + 27);
  ctx.stroke();
}

function drawCollectibles(now) {
  collectibles.forEach((item) => {
    if (item.collected) return;
    const bob = Math.sin((now + item.x) / 260) * 4;

    ctx.fillStyle = "#fff9ea";
    roundedRect(item.x, item.y + bob, item.size + 14, item.size, 8);
    ctx.fill();
    ctx.strokeStyle = "#073f5f";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#073f5f";
    ctx.font = "700 13px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(item.label, item.x + item.size / 2 + 7, item.y + item.size / 2 + bob);
  });
}

function drawBoosts(now) {
  boosts.forEach((boost) => {
    if (boost.used) return;
    const pulse = 1 + Math.sin(now / 180) * 0.08;
    ctx.save();
    ctx.translate(boost.x + boost.size / 2, boost.y + boost.size / 2);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = "#ffc43d";
    ctx.fillRect(-boost.size / 2, -boost.size / 2, boost.size, boost.size);
    ctx.fillStyle = "#ff6b57";
    ctx.fillRect(-7, -7, 14, 14);
    ctx.restore();
  });
}

function drawRocks() {
  rocks.forEach((rock) => {
    ctx.fillStyle = "#566b7c";
    ctx.beginPath();
    ctx.arc(rock.x, rock.y, rock.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.24)";
    ctx.beginPath();
    ctx.arc(rock.x - rock.radius / 3, rock.y - rock.radius / 3, rock.radius / 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawHud() {
  ctx.fillStyle = "rgba(255, 249, 234, 0.94)";
  roundedRect(18, 16, 286, 44, 10);
  ctx.fill();
  ctx.fillStyle = "#102033";
  ctx.font = "800 16px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(`Stack ${score}/${collectibles.length}`, 34, 39);
  ctx.fillText(`Time ${Math.ceil(Math.max(0, timeLeft))}`, 170, 39);
}

function endGame() {
  gameRunning = false;
  keys.clear();
  cancelAnimationFrame(animationFrame);
  drawGame();
  gameStatus.textContent =
    score === collectibles.length
      ? "Full stack collected. Recruiter final boss defeated."
      : `Voyage complete. Stack collected: ${score}/${collectibles.length}.`;
}

function rectanglesTouch(first, second) {
  const size = second.size || 30;
  return (
    first.x < second.x + size &&
    first.x + first.width > second.x &&
    first.y < second.y + size &&
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
showGallerySlide(0);
startButton.addEventListener("click", startGame);
