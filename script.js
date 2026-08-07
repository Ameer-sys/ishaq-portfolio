const data = window.portfolioData;
const themeKey = "portfolio-theme";
const deviconBase = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/";

const themeToggle = document.querySelector("#themeToggle");
const calmModeButton = document.querySelector("#calmMode");
const siteHeader = document.querySelector("#siteHeader");
const menuToggle = document.querySelector("#menuToggle");
const primaryNavigation = document.querySelector("#primaryNavigation");
const navigationLinks = [...document.querySelectorAll("#primaryNavigation a")];
const navigationSections = navigationLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const ship = document.querySelector("#ship");
const featuredProjects = document.querySelector("#featuredProjects");
const additionalProjects = document.querySelector("#additionalProjects");
const experienceList = document.querySelector("#experienceList");
const communityList = document.querySelector("#communityList");
const skillsList = document.querySelector("#skillsList");
const toggleProjectsButton = document.querySelector("#toggleProjects");
const currentYear = document.querySelector("#currentYear");
const contactForm = document.querySelector("#contactForm");
const formStatus = document.querySelector("#formStatus");
const sendMessageButton = document.querySelector("#sendMessageButton");

const canvas = document.querySelector("#techGame");
const ctx = canvas.getContext("2d");
const startButton = document.querySelector("#startGame");
const gameStatus = document.querySelector("#gameStatus");
const touchButtons = document.querySelectorAll("[data-move]");

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

const techItems = ["AI", "C#", "Py", "JS", "SQL", "API", "Git", "UX", "C++", "IoT"];
const funnyHits = [
  "Golden Sunny clipped a rock. Course corrected.",
  "Tiny crash. Strong recovery.",
  "Navigation is recalculating with confidence.",
  "That rock was unusually committed.",
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function projectVisual(project) {
  const title = escapeHtml(project.title);
  const monogram = title
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2);

  const visuals = {
    pillpal:
      '<div class="pillbox" aria-hidden="true"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div>',
    naftelia: '<div class="route-line" aria-hidden="true"></div>',
    legalai: '<div class="document-stack" aria-hidden="true"></div>',
    smadium: '<div class="stadium-rings" aria-hidden="true"></div>',
    drivetracker: '<div class="phone-frame" aria-hidden="true"></div>',
    robot: '<div class="robot-orbit" aria-hidden="true"></div>',
    drone: '<div class="drone-frame" aria-hidden="true"><span></span><span></span><span></span><span></span></div>',
    blockbuilt: '<div class="blockbuilt-mark" aria-hidden="true"><span></span><span></span><span></span></div>',
    radarcare: '<div class="radar-rings" aria-hidden="true"><span></span></div>',
    doxyq: '<div class="doxyq-lines" aria-hidden="true"><span>/**</span><span>* docs</span><span>*/</span></div>',
    campusio: '<div class="campus-blocks" aria-hidden="true"><span></span><span></span><span></span></div>',
  };

  return `
    <div class="project-visual project-visual-${escapeHtml(project.visual || "default")}" aria-label="${title} project visual">
      <span class="project-monogram" aria-hidden="true">${escapeHtml(monogram)}</span>
      ${visuals[project.visual] || ""}
    </div>
  `;
}

function projectLinks(project) {
  const links = [];

  if (project.githubUrl) {
    links.push(
      `<a class="project-link" href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noopener noreferrer">GitHub</a>`
    );
  }

  if (project.liveUrl) {
    links.push(
      `<a class="project-link" href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener noreferrer">Live project</a>`
    );
  }

  return links.length ? `<div class="project-links">${links.join("")}</div>` : "";
}

function projectCard(project, index, primary = false) {
  const technologies = project.technologies || [];
  const features = project.keyFeatures || [];
  const classNames = primary
    ? "project-card project-card-featured project-card-primary reveal"
    : project.featured
      ? "project-card project-card-featured reveal"
      : "project-card project-card-compact reveal";

  return `
    <article class="${classNames}">
      ${projectVisual(project)}
      <div class="project-body">
        <div class="project-topline">
          <span class="project-number">${String(index + 1).padStart(2, "0")}</span>
          ${project.projectStatus ? `<span class="project-status">${escapeHtml(project.projectStatus)}</span>` : ""}
        </div>
        <h3>${escapeHtml(project.title)}</h3>
        <p class="project-summary">${escapeHtml(project.shortDescription)}</p>
        ${
          project.fullDescription && project.featured
            ? `<p class="project-summary">${escapeHtml(project.fullDescription)}</p>`
            : ""
        }
        ${
          project.role || project.date
            ? `
              <div class="project-meta">
                ${
                  project.role
                    ? `<div><span>Role</span><strong>${escapeHtml(project.role)}</strong></div>`
                    : ""
                }
                ${
                  project.date
                    ? `<div><span>Context</span><strong>${escapeHtml(project.date)}</strong></div>`
                    : ""
                }
              </div>
            `
            : ""
        }
        ${
          features.length
            ? `<ul class="project-features">${features
                .map((feature) => `<li>${escapeHtml(feature)}</li>`)
                .join("")}</ul>`
            : ""
        }
        ${
          technologies.length
            ? `<div class="project-tags" aria-label="${escapeHtml(project.title)} technologies">${technologies
                .map((technology) => `<span>${escapeHtml(technology)}</span>`)
                .join("")}</div>`
            : ""
        }
        ${projectLinks(project)}
      </div>
    </article>
  `;
}

function renderProjects() {
  const featured = data.projects.filter((project) => project.featured);
  const additional = data.projects.filter((project) => !project.featured);

  featuredProjects.innerHTML = featured
    .map((project, index) => projectCard(project, index, index === 0))
    .join("");
  additionalProjects.innerHTML = additional
    .map(
      (project, index) =>
        `<div class="additional-project${index >= 3 ? " additional-project-hidden" : ""}">${projectCard(
          project,
          featured.length + index
        )}</div>`
    )
    .join("");

  if (!toggleProjectsButton) return;
  toggleProjectsButton.hidden = additional.length <= 3;
}

function renderExperience() {
  experienceList.innerHTML = data.experience
    .map(
      (item) => `
        <article class="experience-card reveal">
          <time class="experience-date">${escapeHtml(item.date)}</time>
          <div>
            <h3>${escapeHtml(item.organization)}</h3>
            <strong>${escapeHtml(item.title)}</strong>
            ${item.location ? `<span class="experience-location">${escapeHtml(item.location)}</span>` : ""}
            <p>${escapeHtml(item.description)}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function renderCommunity() {
  communityList.innerHTML = data.community
    .map(
      (item, index) => `
        <article class="timeline-card reveal" data-index="${String(index + 1).padStart(2, "0")}">
          <time>${escapeHtml(item.date)}</time>
          <h3>${escapeHtml(item.organization)}</h3>
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.description)}</p>
        </article>
      `
    )
    .join("");
}

function renderSkills() {
  skillsList.innerHTML = data.skills
    .map(
      (group) => `
        <section class="skill-shelf reveal" aria-label="${escapeHtml(group.category)}">
          <h3 class="pixel-label">${escapeHtml(group.category)}</h3>
          <div class="skill-grid">
            ${group.items
              .map((item) => {
                const graphic = item.icon
                  ? `<img src="${deviconBase}${escapeHtml(item.icon)}" alt="${escapeHtml(item.name)} logo" loading="lazy" />`
                  : `<span class="skill-glyph" aria-hidden="true">${escapeHtml(item.glyph || item.name.slice(0, 2))}</span>`;

                return `
                  <article
                    class="skill-card"
                    tabindex="0"
                    data-tooltip="${escapeHtml(item.note)}"
                    aria-label="${escapeHtml(item.name)}. ${escapeHtml(item.note)}"
                  >
                    ${graphic}
                    <strong>${escapeHtml(item.name)}</strong>
                  </article>
                `;
              })
              .join("")}
          </div>
        </section>
      `
    )
    .join("");
}

function renderPortfolioContent() {
  renderProjects();
  renderExperience();
  renderCommunity();
  renderSkills();
  currentYear.textContent = new Date().getFullYear();
}

function toggleAdditionalProjects() {
  const isExpanded = toggleProjectsButton.getAttribute("aria-expanded") === "true";
  additionalProjects.classList.toggle("show-all-projects", !isExpanded);
  toggleProjectsButton.setAttribute("aria-expanded", String(!isExpanded));
  toggleProjectsButton.textContent = isExpanded ? "View More Projects" : "Show Fewer Projects";
}

function currentTheme() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function updateThemeControl() {
  const dark = currentTheme() === "dark";
  themeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  themeToggle.setAttribute("title", dark ? "Switch to light mode" : "Switch to dark mode");
}

function toggleTheme() {
  const nextTheme = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem(themeKey, nextTheme);
  updateThemeControl();
}

themeToggle.addEventListener("click", toggleTheme);
updateThemeControl();

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
  if (localStorage.getItem(themeKey)) return;
  document.documentElement.dataset.theme = event.matches ? "dark" : "light";
  updateThemeControl();
});

calmModeButton.addEventListener("click", () => {
  const isCalm = document.body.classList.toggle("calm");
  calmModeButton.setAttribute("aria-pressed", String(isCalm));
  calmModeButton.setAttribute(
    "aria-label",
    isCalm ? "Restore decorative motion" : "Reduce decorative motion"
  );
  calmModeButton.setAttribute("title", isCalm ? "Restore motion" : "Reduce motion");
});

function closeNavigation() {
  primaryNavigation.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
  document.body.classList.remove("menu-open");
}

function toggleNavigation() {
  const isOpen = !primaryNavigation.classList.contains("open");
  primaryNavigation.classList.toggle("open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  document.body.classList.toggle("menu-open", isOpen);
}

function setActiveNavigation(sectionId) {
  navigationLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${sectionId}`;
    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

function initializeNavigation() {
  menuToggle.addEventListener("click", toggleNavigation);
  navigationLinks.forEach((link) => link.addEventListener("click", closeNavigation));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNavigation();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) closeNavigation();
  });

  if (!("IntersectionObserver" in window)) {
    setActiveNavigation("home");
    return;
  }

  const visibleSections = new Map();
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleSections.set(entry.target.id, entry.intersectionRatio);
        else visibleSections.delete(entry.target.id);
      });

      const current = [...visibleSections.entries()].sort((a, b) => b[1] - a[1])[0];
      if (current) setActiveNavigation(current[0]);
    },
    { rootMargin: "-18% 0px -62% 0px", threshold: [0.05, 0.2, 0.45] }
  );

  navigationSections.forEach((section) => sectionObserver.observe(section));
  setActiveNavigation("home");
}

function syncHeaderState() {
  siteHeader.classList.toggle("scrolled", window.scrollY > 24);
}

window.addEventListener(
  "scroll",
  () => {
    syncHeaderState();
    if (!ship || document.body.classList.contains("calm")) return;
    const travel = Math.min(window.scrollY * 0.06, 44);
    ship.style.translate = `${travel}px 0`;
  },
  { passive: true }
);

syncHeaderState();

function initializeRevealAnimations() {
  const revealItems = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -30px" }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (!["arrowleft", "arrowright", "arrowup", "arrowdown", "w", "a", "s", "d"].includes(key)) {
    return;
  }

  keys.add(key);
  if (gameRunning) event.preventDefault();
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

touchButtons.forEach((button) => {
  const keyMap = { up: "w", left: "a", down: "s", right: "d" };
  const key = keyMap[button.dataset.move];

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
      gameStatus.textContent =
        score % 4 === 0 ? "Golden Sunny is stacking up nicely." : "Nice pickup.";
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
  gradient.addColorStop(0, "#9fe6ef");
  gradient.addColorStop(0.58, "#0e86a3");
  gradient.addColorStop(1, "#073f5f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#f6c943";
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

  ctx.fillStyle = "#f6c943";
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

function drawCloud(x, y, width, height) {
  ctx.beginPath();
  ctx.roundRect(x, y + height * 0.34, width, height * 0.66, 9);
  ctx.arc(x + width * 0.3, y + height * 0.42, height * 0.35, 0, Math.PI * 2);
  ctx.arc(x + width * 0.63, y + height * 0.32, height * 0.42, 0, Math.PI * 2);
  ctx.fill();
}

function drawCollectibles(now) {
  collectibles.forEach((item) => {
    if (item.collected) return;
    const bob = Math.sin((now + item.x) / 260) * 4;
    const cloudWidth = item.size + 18;

    ctx.fillStyle = "#ffffff";
    drawCloud(item.x, item.y + bob, cloudWidth, item.size);
    ctx.fillStyle = "#073f5f";
    ctx.font = "700 12px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(item.label, item.x + cloudWidth / 2, item.y + item.size * 0.7 + bob);
  });
}

function drawBoosts(now) {
  boosts.forEach((boost) => {
    if (boost.used) return;
    const pulse = 1 + Math.sin(now / 180) * 0.08;
    ctx.save();
    ctx.translate(boost.x + boost.size / 2, boost.y + boost.size / 2);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = "#f6c943";
    ctx.fillRect(-boost.size / 2, -boost.size / 2, boost.size, boost.size);
    ctx.fillStyle = "#e85f4d";
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
  roundedRect(18, 16, 318, 44, 8);
  ctx.fill();
  ctx.fillStyle = "#102033";
  ctx.font = "800 16px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("Golden Sunny", 34, 39);
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
  ctx.roundRect(x, y, width, height, radius);
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

    if (!response.ok) throw new Error("Message could not be delivered.");

    contactForm.reset();
    formStatus.textContent = "Message sent. Thanks for reaching out.";
  } catch (error) {
    formStatus.textContent = "That did not send cleanly. Please use the Email button.";
  } finally {
    sendMessageButton.disabled = false;
  }
}

renderPortfolioContent();
initializeNavigation();
initializeRevealAnimations();
resetGame();
drawGame();

startButton.addEventListener("click", startGame);
contactForm.addEventListener("submit", submitContactForm);
toggleProjectsButton?.addEventListener("click", toggleAdditionalProjects);
