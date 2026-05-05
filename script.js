const calmModeButton = document.querySelector("#calmMode");
const themeToggle = document.querySelector("#themeToggle");
const typingName = document.querySelector("#typingName");
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
const galleryDots = document.querySelector("#galleryDots");
const prevSlide = document.querySelector("#prevSlide");
const nextSlide = document.querySelector("#nextSlide");
const contactForm = document.querySelector("#contactForm");
const formStatus = document.querySelector("#formStatus");
const sendMessageButton = document.querySelector("#sendMessageButton");

const themeKey = "portfolio-theme";
const keys = new Set();
let animationFrame = null;
let galleryTimer = null;
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
let typingIndex = typingLinesSeedLength();
let typingTextIndex = 0;
let isDeleting = false;

const typingLines = ["Ishaq Ishaq Nasiru", "Ishaq Nasiru", "Ameer Energy"];
const techItems = ["AI", "C#", "Py", "JS", "SQL", "API", "Git", "UX", "C++", "Map"];
const funnyHits = [
  "Golden Sunny clipped a rock. We reset with style.",
  "Tiny crash. Big comeback.",
  "Navigation says recalculating with confidence.",
  "That rock had personal beef.",
];

const gallerySlides = [
  {
    image: "assets/gallery/hackcanada-team.jpeg",
    title: "HackCanada Crew",
    caption: "Team moment during HackCanada, right in the middle of the build energy.",
    alt: "Ishaq with HackCanada teammates during the event",
  },
  {
    image: "assets/gallery/hackcanada-break.jpeg",
    title: "HackCanada Candid",
    caption: "One of those behind-the-scenes moments where the pace slows for a second and the vibe stays high.",
    alt: "Ishaq seated during HackCanada in a candid event moment",
  },
  {
    image: "assets/gallery/hackcanada-duo.jpeg",
    title: "Post-build Snapshot",
    caption: "Quick photo with a teammate after the pressure, ideas, and problem solving.",
    alt: "Ishaq and a HackCanada teammate posing together",
  },
  {
    image: "assets/gallery/growth-summit-action.jpeg",
    title: "Growth Summit Volunteering",
    caption: "Working the room, helping the event flow, and staying part of the conversations.",
    alt: "Ishaq volunteering during the Growth Summit event",
  },
  {
    image: "assets/gallery/growth-summit-booth.jpeg",
    title: "Booth Setup Mode",
    caption: "Event support, logistics, and showing up for the team side of tech.",
    alt: "Ishaq with volunteers at a summit booth",
  },
  {
    image: "assets/gallery/growth-summit-crew.jpeg",
    title: "Crew Photo",
    caption: "Full group shot from the Growth Summit team day.",
    alt: "Large group photo featuring Ishaq and event volunteers",
  },
  {
    image: "assets/gallery/badge-collection.jpeg",
    title: "Badges and Milestones",
    caption: "A little collection of events, rooms, and communities I have been part of.",
    alt: "Collection of event badges and credentials",
  },
  {
    image: "assets/gallery/ai-build-group.jpeg",
    title: "Google Build with AI",
    caption: "Community learning session, good people, and a very real reminder that showing up matters.",
    alt: "Group photo from Google Build with AI event",
  },
  {
    image: "assets/gallery/gdg-team.jpeg",
    title: "GDG Waterloo Night",
    caption: "A strong room for AI talks, builders, and shared curiosity.",
    alt: "Team photo from a GDG Waterloo event",
  },
  {
    image: "assets/gallery/it-club-table.jpg",
    title: "IT Club Table",
    caption: "Representing IT Club, talking with students, and making tech spaces feel open and inviting.",
    alt: "Ishaq seated at an IT Club information table",
  },
  {
    image: "assets/gallery/autonomic-photo.jpeg",
    title: "A Little Extra Personality",
    caption: "Because a portfolio should still feel human.",
    alt: "Ishaq in a photobooth-style group picture",
  },
  {
    image: "assets/gallery/autonomic-fam.jpeg",
    title: "Future CEO Energy",
    caption: "One of the funniest event shots, so it earned a place in the rotation.",
    alt: "Ishaq holding a playful sign in a photobooth picture",
  },
];

function applySavedTheme() {
  const savedTheme = localStorage.getItem(themeKey);
  const shouldUseDark = savedTheme === "dark";
  document.body.classList.toggle("dark", shouldUseDark);
  themeToggle.setAttribute("aria-pressed", String(shouldUseDark));
  themeToggle.querySelector("span[aria-hidden='true']").textContent = shouldUseDark ? "L" : "D";
}

function toggleTheme() {
  const darkMode = document.body.classList.toggle("dark");
  localStorage.setItem(themeKey, darkMode ? "dark" : "light");
  themeToggle.setAttribute("aria-pressed", String(darkMode));
  themeToggle.querySelector("span[aria-hidden='true']").textContent = darkMode ? "L" : "D";
}

themeToggle.addEventListener("click", toggleTheme);
applySavedTheme();

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

function typeLoop() {
  const currentText = typingLines[typingTextIndex];
  const visibleText = currentText.slice(0, typingIndex);
  typingName.textContent = visibleText;

  if (!isDeleting && typingIndex < currentText.length) {
    typingIndex += 1;
    setTimeout(typeLoop, 110);
    return;
  }

  if (!isDeleting && typingIndex === currentText.length) {
    isDeleting = true;
    setTimeout(typeLoop, 1200);
    return;
  }

  if (isDeleting && typingIndex > 0) {
    typingIndex -= 1;
    setTimeout(typeLoop, 55);
    return;
  }

  isDeleting = false;
  typingTextIndex = (typingTextIndex + 1) % typingLines.length;
  setTimeout(typeLoop, 220);
}

function renderGalleryDots() {
  galleryDots.innerHTML = "";
  gallerySlides.forEach((slide, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Open slide ${index + 1}: ${slide.title}`);
    if (index === galleryIndex) dot.classList.add("active");
    dot.addEventListener("click", () => showGallerySlide(index));
    galleryDots.appendChild(dot);
  });
}

function restartGalleryTimer() {
  window.clearInterval(galleryTimer);
  galleryTimer = window.setInterval(() => {
    showGallerySlide(galleryIndex + 1);
  }, 4800);
}

function showGallerySlide(nextIndex) {
  galleryIndex = (nextIndex + gallerySlides.length) % gallerySlides.length;
  const slide = gallerySlides[galleryIndex];
  galleryImage.style.opacity = "0";
  galleryImage.style.transform = "scale(0.985)";

  window.setTimeout(() => {
    galleryImage.src = slide.image;
    galleryImage.alt = slide.alt;
    galleryTitle.textContent = slide.title;
    galleryCaption.textContent = slide.caption;
    galleryImage.style.opacity = "1";
    galleryImage.style.transform = "scale(1)";
    renderGalleryDots();
  }, 160);
}

prevSlide.addEventListener("click", () => {
  showGallerySlide(galleryIndex - 1);
  restartGalleryTimer();
});

nextSlide.addEventListener("click", () => {
  showGallerySlide(galleryIndex + 1);
  restartGalleryTimer();
});

document.addEventListener("contextmenu", (event) => {
  if (event.target.closest(".gallery-stage")) {
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
  gameStatus.textContent = "Golden Sunny is out. Collect the stack and dodge rocks.";
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
      gameStatus.textContent = score % 4 === 0 ? "Golden Sunny is stacking up nicely." : "Nice pickup.";
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

  ctx.fillStyle = "#ffd55a";
  ctx.beginPath();
  ctx.arc(canvas.width - 58, 52, 20, 0, Math.PI * 2);
  ctx.fill();

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

  ctx.fillStyle = "#7d451d";
  roundedRect(player.x, player.y + 18, player.width, 18, 12);
  ctx.fill();

  ctx.fillStyle = "#fff9ea";
  ctx.beginPath();
  ctx.moveTo(player.x + 27, player.y - 10);
  ctx.lineTo(player.x + 27, player.y + 18);
  ctx.lineTo(player.x + 52, player.y + 18);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffd55a";
  ctx.fillRect(player.x + 10, player.y + 22, 8, 8);
  ctx.fillRect(player.x + 22, player.y + 22, 8, 8);

  ctx.strokeStyle = "#5e3d26";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(player.x + 26, player.y - 10);
  ctx.lineTo(player.x + 26, player.y + 27);
  ctx.stroke();

  ctx.fillStyle = "#fff7c4";
  ctx.font = "600 8px 'Press Start 2P', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("GS", player.x + 27, player.y + 14);
}

function drawCollectibles(now) {
  collectibles.forEach((item) => {
    if (item.collected) return;
    const bob = Math.sin((now + item.x) / 260) * 4;

    ctx.fillStyle = "#ffffff";
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
  roundedRect(18, 16, 318, 44, 10);
  ctx.fill();
  ctx.fillStyle = "#102033";
  ctx.font = "800 16px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(`Golden Sunny`, 34, 39);
  ctx.fillText(`Stack ${score}/${collectibles.length}`, 148, 39);
  ctx.fillText(`Time ${Math.ceil(Math.max(0, timeLeft))}`, 244, 39);
}

function endGame() {
  gameRunning = false;
  keys.clear();
  cancelAnimationFrame(animationFrame);
  drawGame();
  gameStatus.textContent =
    score === collectibles.length
      ? "Full stack collected. Golden Sunny cleared the route."
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

async function submitContactForm(event) {
  event.preventDefault();
  formStatus.textContent = "Sending...";
  sendMessageButton.disabled = true;

  const formData = new FormData(contactForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Message could not be delivered.");
    }

    contactForm.reset();
    formStatus.textContent = "Message sent. Nice one, I will see it in my inbox.";
  } catch (error) {
    formStatus.textContent = "That did not send cleanly. Try the Email button just below.";
  } finally {
    sendMessageButton.disabled = false;
  }
}

contactForm.addEventListener("submit", submitContactForm);

resetGame();
drawGame();
renderGalleryDots();
showGallerySlide(0);
restartGalleryTimer();
typingName.textContent = typingLines[0];
window.setTimeout(typeLoop, 1800);
startButton.addEventListener("click", startGame);
function typingLinesSeedLength() {
  return "Ishaq Ishaq Nasiru".length;
}
