const path = require("node:path");
const os = require("node:os");
const { chromium } = require("playwright");

const baseUrl = process.env.PORTFOLIO_URL || "http://127.0.0.1:4173";
const outputDir = process.env.PORTFOLIO_SCREENSHOT_DIR || os.tmpdir();
const skipScreenshots = process.env.SKIP_SCREENSHOTS === "1";
const executablePath =
  process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function revealSections(page) {
  if (skipScreenshots) {
    await page.evaluate(() => {
      document.querySelectorAll(".reveal").forEach((item) => item.classList.add("visible"));
      window.scrollTo(0, 0);
    });
    return;
  }

  await page.evaluate(async () => {
    const stops = [...document.querySelectorAll(".reveal")];
    for (const stop of stops) {
      stop.scrollIntoView({ block: "center" });
      await new Promise((resolve) => setTimeout(resolve, 28));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(150);
}

async function holdDirectionalControl(page, direction, pointerType = "mouse", pointerId = 1) {
  const control = page.locator(`[data-move="${direction}"]`);
  const before = await page.evaluate(() => ({
    x: Number(document.querySelector("#techGame").dataset.playerX),
    y: Number(document.querySelector("#techGame").dataset.playerY),
  }));

  await control.dispatchEvent("pointerdown", {
    pointerId,
    pointerType,
    isPrimary: true,
    buttons: 1,
  });
  await page.waitForTimeout(150);
  const pressed = await control.evaluate((button) => ({
    pressed: button.getAttribute("aria-pressed"),
    visual: button.classList.contains("is-pressed"),
  }));
  await control.dispatchEvent("pointerup", {
    pointerId,
    pointerType,
    isPrimary: true,
  });
  const after = await page.evaluate(() => ({
    x: Number(document.querySelector("#techGame").dataset.playerX),
    y: Number(document.querySelector("#techGame").dataset.playerY),
  }));
  const released = await control.evaluate((button) => ({
    pressed: button.getAttribute("aria-pressed"),
    visual: button.classList.contains("is-pressed"),
  }));

  return { before, after, pressed, released };
}

async function getNavigationState(page) {
  return page.evaluate(() => {
    const activeLinks = [...document.querySelectorAll("#primaryNavigation a.active")];
    const currentLinks = [
      ...document.querySelectorAll('#primaryNavigation a[aria-current="location"]'),
    ];

    return {
      active: activeLinks.map((link) => link.getAttribute("href")),
      current: currentLinks.map((link) => link.getAttribute("href")),
      passes:
        activeLinks.length === 1 &&
        currentLinks.length === 1 &&
        activeLinks[0] === currentLinks[0],
    };
  });
}

async function waitForActiveNavigation(page, href) {
  try {
    await page.waitForFunction(
      (expectedHref) => {
        const activeLinks = [...document.querySelectorAll("#primaryNavigation a.active")];
        return (
          activeLinks.length === 1 &&
          activeLinks[0].getAttribute("href") === expectedHref &&
          activeLinks[0].getAttribute("aria-current") === "location"
        );
      },
      href,
      { timeout: 6000 },
    );
  } catch (error) {
    const diagnostic = await page.evaluate(() => ({
      scrollY: Math.round(window.scrollY),
      active: [...document.querySelectorAll("#primaryNavigation a.active")].map((link) =>
        link.getAttribute("href"),
      ),
      sections: [...document.querySelectorAll("#primaryNavigation a")].map((link) => {
        const section = document.querySelector(link.getAttribute("href"));
        return {
          href: link.getAttribute("href"),
          top: Math.round(section.getBoundingClientRect().top),
          offsetTop: Math.round(section.offsetTop),
        };
      }),
    }));
    throw new Error(`Expected active navigation ${href}: ${JSON.stringify(diagnostic)}`, {
      cause: error,
    });
  }
  return getNavigationState(page);
}

async function clickNavigation(page, href) {
  await page.locator(`#primaryNavigation a[href="${href}"]`).click();
  return waitForActiveNavigation(page, href);
}

async function scrollToNavigationSection(page, sectionId) {
  await page.evaluate((id) => {
    document.getElementById(id).scrollIntoView({ behavior: "instant", block: "start" });
  }, sectionId);
  return waitForActiveNavigation(page, `#${sectionId}`);
}

async function inspectPage(page, name) {
  const errors = [];
  const failedRequests = [];

  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => {
    failedRequests.push(`${request.url()}: ${request.failure()?.errorText || "failed"}`);
  });

  const response = await page.goto(baseUrl, {
    waitUntil: skipScreenshots ? "domcontentloaded" : "networkidle",
  });
  await page.waitForTimeout(250);
  if (!skipScreenshots) {
    await page.screenshot({
      path: path.join(outputDir, `portfolio-${name}-viewport.png`),
    });
  }
  await revealSections(page);
  await page.locator("#projects").scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  if (!skipScreenshots) {
    await page.screenshot({
      path: path.join(outputDir, `portfolio-${name}-projects.png`),
    });
  }

  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  if (!skipScreenshots) {
    await page.screenshot({
      path: path.join(outputDir, `portfolio-${name}-contact.png`),
    });
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(700);

  const result = await page.evaluate(() => ({
    viewport: { width: window.innerWidth, height: window.innerHeight },
    title: document.title,
    heading: document.querySelector("h1")?.textContent.trim(),
    featuredProjects: [...document.querySelectorAll("#featuredProjects .project-card")].map(
      (card) => card.querySelector("h3")?.textContent.trim(),
    ),
    additionalProjects: [
      ...document.querySelectorAll("#additionalProjects .project-card"),
    ].map((card) => card.querySelector("h3")?.textContent.trim()),
    missingAlt: [...document.images].filter((image) => !image.alt).map((image) => image.src),
    hasHorizontalOverflow:
      document.documentElement.scrollWidth > document.documentElement.clientWidth,
    overflowElements: [...document.querySelectorAll("body *")]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.left < -1 || rect.right > document.documentElement.clientWidth + 1;
      })
      .slice(0, 12)
      .map((element) => ({
        tag: element.tagName,
        className: element.className,
        left: Math.round(element.getBoundingClientRect().left),
        right: Math.round(element.getBoundingClientRect().right),
      })),
    gallerySectionPresent: Boolean(document.querySelector("#gallery")),
    aboutSectionPresent: Boolean(document.querySelector("#about")),
    aboutNavigationPresent: Boolean(document.querySelector('a[href="#about"]')),
    experienceSectionPresent: Boolean(document.querySelector("#experience")),
    experienceNavigationPresent: Boolean(document.querySelector('a[href="#experience"]')),
    persistentBackground: (() => {
      const background = document.querySelector(".site-background");
      return background
        ? {
            present: true,
            position: getComputedStyle(background).position,
            image: getComputedStyle(background.querySelector(".site-background-image"))
              .backgroundImage,
          }
        : { present: false, position: null, image: null };
    })(),
    hero: (() => {
      const hero = document.querySelector("#home").getBoundingClientRect();
      const copyElement = document.querySelector(".hero-copy");
      const copy = copyElement.getBoundingClientRect();
      const copyStyle = getComputedStyle(copyElement);
      const nameElement = document.querySelector(".hero-name");
      const name = nameElement.getBoundingClientRect();
      const nameStyle = getComputedStyle(nameElement);
      const header = document.querySelector("#siteHeader").getBoundingClientRect();
      const visual = document.querySelector(".hero-visual").getBoundingClientRect();
      const portraitElement = document.querySelector(".hero-visual img");
      const portrait = portraitElement.getBoundingClientRect();
      const headlineElement = document.querySelector(".hero-copy h1");
      const headline = headlineElement.getBoundingClientRect();
      const headlineStyle = getComputedStyle(headlineElement);
      const introduction = document.querySelector(".hero-text").getBoundingClientRect();
      const actions = document.querySelector(".hero-actions").getBoundingClientRect();
      return {
        top: Math.round(hero.top),
        height: Math.round(hero.height),
        copyTop: Math.round(copy.top),
        copyHeight: Math.round(copy.height),
        copyBottom: Math.round(copy.bottom),
        copyMinHeight: copyStyle.minHeight,
        copyTransform: copyStyle.transform,
        name: {
          text: nameElement.textContent.replace(/\s+/g, " ").trim(),
          fontSize: Number.parseFloat(nameStyle.fontSize),
          lineHeight: Number.parseFloat(nameStyle.lineHeight),
          width: Math.round(name.width),
          height: Math.round(name.height),
          left: Math.round(name.left),
          right: Math.round(name.right),
          bottom: Math.round(name.bottom),
          fullyVisible: name.left >= -1 && name.right <= window.innerWidth + 1,
        },
        tagline: {
          fontSize: Number.parseFloat(headlineStyle.fontSize),
          top: Math.round(headline.top),
          bottom: Math.round(headline.bottom),
          fullyVisible:
            headline.left >= -1 &&
            headline.right <= window.innerWidth + 1 &&
            headline.bottom <= window.innerHeight + 1,
        },
        introduction: {
          top: Math.round(introduction.top),
          bottom: Math.round(introduction.bottom),
          fullyVisible: introduction.bottom <= window.innerHeight + 1,
        },
        headerBottom: Math.round(header.bottom),
        headlineBottom: Math.round(headline.bottom),
        actionsBottom: Math.round(actions.bottom),
        visualTop: Math.round(visual.top),
        visualBottom: Math.round(visual.bottom),
        portraitSrc: portraitElement.getAttribute("src"),
        portraitAlt: portraitElement.getAttribute("alt"),
        portraitTop: Math.round(portrait.top),
        portraitBottom: Math.round(portrait.bottom),
        headVisible: portrait.top >= header.bottom - 1,
        portraitContained:
          portrait.top >= hero.top - 1 && portrait.bottom <= hero.bottom + 1,
        ctasVisible: actions.bottom <= window.innerHeight + 1,
        fitsInitialViewport:
          hero.height <= window.innerHeight + 2 &&
          copy.bottom <= hero.bottom + 2 &&
          portrait.bottom <= hero.bottom + 2,
      };
    })(),
    contactLayout: (() => {
      const section = document.querySelector("#contact");
      const resume = section.querySelector(".resume-block").getBoundingClientRect();
      const contact = section.querySelector(".contact-block").getBoundingClientRect();
      return {
        sectionHeight: Math.round(section.getBoundingClientRect().height),
        resumeWidth: Math.round(resume.width),
        contactWidth: Math.round(contact.width),
        topAligned: Math.abs(resume.top - contact.top) <= 1,
        fitsViewportHeight: section.getBoundingClientRect().height <= window.innerHeight,
      };
    })(),
    identity: {
      brand: document.querySelector(".brand > span:last-child")?.textContent.trim(),
      footer: document.querySelector(".footer-identity strong")?.textContent.trim(),
      exactEmailLinks: document.querySelectorAll(
        'a[href="mailto:Ishaqnasiru29@gmail.com"]',
      ).length,
      oldEmailPresent: document.documentElement.textContent.includes("inasiru3540"),
    },
    community: [...document.querySelectorAll("#communityList .timeline-card")].map((card) => ({
      organization: card.querySelector("h3")?.textContent.trim(),
      title: card.querySelector("strong")?.textContent.trim(),
      date: card.querySelector("time")?.textContent.trim(),
    })),
    skillShelfHeaders: [...document.querySelectorAll(".skill-shelf-header")].map((header) =>
      header.textContent.replace(/\s+/g, " ").trim(),
    ),
    footerPresent: Boolean(document.querySelector(".site-footer .footer-shell")),
    navIndicator: (() => {
      const indicator = document.querySelector("#navIndicator");
      return indicator
        ? {
            visible: getComputedStyle(indicator).display !== "none" &&
              indicator.classList.contains("visible"),
            width: Math.round(indicator.getBoundingClientRect().width),
          }
        : null;
    })(),
    brokenInternalAnchors: [...document.querySelectorAll('a[href^="#"]')]
      .map((link) => link.getAttribute("href"))
      .filter((href) => href !== "#" && !document.querySelector(href)),
    unsafeExternalTabs: [...document.querySelectorAll('a[target="_blank"]')]
      .filter((link) => !link.relList.contains("noopener"))
      .map((link) => link.href),
    mobileControlsVisible: (() => {
      const controls = document.querySelector(".touch-pad");
      return controls ? getComputedStyle(controls).display !== "none" : false;
    })(),
    glassPanels: [...document.querySelectorAll(
      ".project-card, .skill-shelf, .timeline-card, .game-panel, .game-instructions, .resume-block, .contact-block",
    )].slice(0, 8).map((panel) => ({
      background: getComputedStyle(panel).backgroundColor,
      backdropFilter:
        getComputedStyle(panel).backdropFilter || getComputedStyle(panel).webkitBackdropFilter,
    })),
    headerPosition: getComputedStyle(document.querySelector("#siteHeader")).position,
    resumeLinks: [...document.querySelectorAll('a[href$=".pdf"]')].map((link) =>
      link.getAttribute("href"),
    ),
    sectionRects: [...document.querySelectorAll("main > section")].map((section) => ({
      id: section.id,
      top: Math.round(section.offsetTop),
      height: Math.round(section.offsetHeight),
      bottom: Math.round(section.offsetTop + section.offsetHeight),
    })),
    projectLayout: [...document.querySelector("#projects").children].map((child) => ({
      className: child.className,
      top: Math.round(child.offsetTop),
      height: Math.round(child.offsetHeight),
      bottom: Math.round(child.offsetTop + child.offsetHeight),
    })),
  }));

  return {
    status: response?.status(),
    errors,
    failedRequests,
    ...result,
  };
}

async function inspectDarkTheme(page, name) {
  await page.evaluate(() => localStorage.setItem("portfolio-theme", "dark"));
  await page.reload({ waitUntil: skipScreenshots ? "domcontentloaded" : "networkidle" });
  await revealSections(page);
  if (!skipScreenshots) {
    await page.screenshot({
      path: path.join(outputDir, `portfolio-${name}-dark.png`),
      fullPage: false,
    });
  }

  return page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    hasHorizontalOverflow:
      document.documentElement.scrollWidth > document.documentElement.clientWidth,
    heroHeight: Math.round(document.querySelector("#home").getBoundingClientRect().height),
    footerColor: getComputedStyle(document.querySelector(".site-footer")).color,
    passes:
      document.documentElement.dataset.theme === "dark" &&
      document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  }));
}

async function verifyImmediateLoad(browser) {
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  const immediate = await page.evaluate(() => {
    const hero = document.querySelector("#home");
    const heroStyle = getComputedStyle(hero);
    return {
      introPresent: Boolean(document.querySelector("#introScreen, .intro-screen")),
      soundControlPresent: Boolean(document.querySelector("#soundToggle, .sound-button")),
      introStatePresent: Object.hasOwn(document.documentElement.dataset, "intro"),
      heroVisible:
        heroStyle.display !== "none" &&
        heroStyle.visibility !== "hidden" &&
        hero.getBoundingClientRect().top <= window.innerHeight,
      projectsRendered: document.querySelectorAll("#featuredProjects .project-card").length > 0,
      oldIntroStorage: sessionStorage.getItem("portfolioIntroPlayed"),
      oldSoundStorage: localStorage.getItem("portfolio-sound-enabled"),
    };
  });
  await context.close();

  const reducedContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    reducedMotion: "reduce",
  });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(baseUrl, { waitUntil: "domcontentloaded" });
  const reducedMotion = await reducedPage.evaluate(() => ({
    heroAnimation: getComputedStyle(document.querySelector(".hero-name-text")).animationName,
    heroVisible: getComputedStyle(document.querySelector("#home")).visibility !== "hidden",
  }));
  await reducedContext.close();

  return {
    immediate,
    reducedMotion,
    errors,
    passes:
      errors.length === 0 &&
      !immediate.introPresent &&
      !immediate.soundControlPresent &&
      !immediate.introStatePresent &&
      immediate.heroVisible &&
      immediate.projectsRendered &&
      immediate.oldIntroStorage === null &&
      immediate.oldSoundStorage === null &&
      reducedMotion.heroAnimation === "none" &&
      reducedMotion.heroVisible,
  };
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath });

  try {
    const immediateLoadCheck = await verifyImmediateLoad(browser);
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const desktopPage = await desktopContext.newPage();
    const desktop = await inspectPage(desktopPage, "1440x900");

    const compactDesktopContext = await browser.newContext({
      viewport: { width: 1366, height: 768 },
      deviceScaleFactor: 1,
    });
    const compactDesktopPage = await compactDesktopContext.newPage();
    const compactDesktop = await inspectPage(compactDesktopPage, "1366x768");
    const compactDesktopDark = await inspectDarkTheme(compactDesktopPage, "1366x768");

    const wideDesktopContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
    });
    const wideDesktopPage = await wideDesktopContext.newPage();
    const wideDesktop = await inspectPage(wideDesktopPage, "1920x1080");
    const wideDesktopDark = await inspectDarkTheme(wideDesktopPage, "1920x1080");

    await desktopPage.locator("#game").scrollIntoViewIfNeeded();
    await desktopPage.locator("#startGame").click();
    await desktopPage.waitForTimeout(220);
    if (!skipScreenshots) {
      await desktopPage.screenshot({
        path: path.join(outputDir, "portfolio-tech-stack-game.png"),
        fullPage: false,
      });
    }
    const gameCheck = await desktopPage.evaluate(() => {
      const gameCanvas = document.querySelector("#techGame");
      const pixels = gameCanvas
        .getContext("2d")
        .getImageData(0, 0, gameCanvas.width, gameCanvas.height).data;
      const paintedPixels = pixels.filter((value, index) => index % 4 === 3 && value > 0).length;
      return {
        status: document.querySelector("#gameStatus").textContent.trim(),
        paintedPixels,
        passes:
          document.querySelector("#gameStatus").textContent.includes("Tech Stack") &&
          paintedPixels > 1000,
      };
    });

    const desktopGameStart = await desktopPage.evaluate(() => ({
      x: Number(document.querySelector("#techGame").dataset.playerX),
      y: Number(document.querySelector("#techGame").dataset.playerY),
    }));
    await desktopPage.keyboard.down("d");
    await desktopPage.waitForTimeout(150);
    await desktopPage.keyboard.up("d");
    const desktopGameAfterD = await desktopPage.evaluate(() => ({
      x: Number(document.querySelector("#techGame").dataset.playerX),
      y: Number(document.querySelector("#techGame").dataset.playerY),
    }));
    await desktopPage.keyboard.down("ArrowDown");
    await desktopPage.waitForTimeout(150);
    await desktopPage.keyboard.up("ArrowDown");
    const desktopGameAfterArrow = await desktopPage.evaluate(() => ({
      x: Number(document.querySelector("#techGame").dataset.playerX),
      y: Number(document.querySelector("#techGame").dataset.playerY),
    }));
    gameCheck.desktopControls = {
      start: desktopGameStart,
      afterD: desktopGameAfterD,
      afterArrow: desktopGameAfterArrow,
      passes:
        desktopGameAfterD.x > desktopGameStart.x &&
        desktopGameAfterArrow.y > desktopGameAfterD.y,
    };

    const desktopPhysicalControls = {};
    for (const [index, direction] of ["right", "left", "down", "up"].entries()) {
      desktopPhysicalControls[direction] = await holdDirectionalControl(
        desktopPage,
        direction,
        "mouse",
        20 + index,
      );
    }
    const keyboardButtonStart = await desktopPage.evaluate(
      () => Number(document.querySelector("#techGame").dataset.playerX),
    );
    const focusedRightButton = desktopPage.locator('[data-move="right"]');
    await focusedRightButton.focus();
    await focusedRightButton.press("Enter", { delay: 150 });
    const keyboardButtonEnd = await desktopPage.evaluate(
      () => Number(document.querySelector("#techGame").dataset.playerX),
    );
    gameCheck.physicalControls = {
      ...desktopPhysicalControls,
      keyboardButtonStart,
      keyboardButtonEnd,
      passes:
        desktopPhysicalControls.right.after.x > desktopPhysicalControls.right.before.x &&
        desktopPhysicalControls.left.after.x < desktopPhysicalControls.left.before.x &&
        desktopPhysicalControls.down.after.y > desktopPhysicalControls.down.before.y &&
        desktopPhysicalControls.up.after.y < desktopPhysicalControls.up.before.y &&
        Object.values(desktopPhysicalControls).every(
          (control) =>
            control.pressed.pressed === "true" &&
            control.pressed.visual === true &&
            control.released.pressed === "false" &&
            control.released.visual === false,
        ) &&
        keyboardButtonEnd > keyboardButtonStart,
    };
    gameCheck.passes =
      gameCheck.passes &&
      gameCheck.desktopControls.passes &&
      gameCheck.physicalControls.passes;

    await scrollToNavigationSection(desktopPage, "home");
    const navigationClickSequence = [];
    for (const href of [
      "#projects",
      "#tools",
      "#projects",
      "#community",
      "#projects",
    ]) {
      navigationClickSequence.push({ href, state: await clickNavigation(desktopPage, href) });
    }

    const navigationScrollSequence = [];
    for (const sectionId of [
      "home",
      "projects",
      "tools",
      "community",
      "contact",
      "community",
      "tools",
      "projects",
      "home",
    ]) {
      navigationScrollSequence.push({
        sectionId,
        state: await scrollToNavigationSection(desktopPage, sectionId),
      });
    }

    await desktopPage.evaluate(() => {
      const projects = document.querySelector("#projects");
      window.scrollTo({ top: projects.offsetTop - 24, behavior: "instant" });
    });
    await desktopPage.waitForTimeout(50);
    const projectsFromNearby = await clickNavigation(desktopPage, "#projects");

    const anchorOffset = await desktopPage.evaluate(() => {
      const header = document.querySelector("#siteHeader").getBoundingClientRect();
      const section = document.querySelector("#projects").getBoundingClientRect();
      return {
        headerBottom: Math.round(header.bottom),
        sectionTop: Math.round(section.top),
        passes: section.top >= header.bottom - 2,
      };
    });

    await scrollToNavigationSection(desktopPage, "community");
    await desktopPage.reload({
      waitUntil: skipScreenshots ? "domcontentloaded" : "networkidle",
    });
    const activeAfterRefresh = await waitForActiveNavigation(desktopPage, "#community");

    await scrollToNavigationSection(desktopPage, "projects");
    await desktopPage.setViewportSize({ width: 390, height: 844 });
    await desktopPage.waitForTimeout(100);
    const activeAfterMobileResize = await getNavigationState(desktopPage);
    const projectsAfterMobileResize = await scrollToNavigationSection(
      desktopPage,
      "projects",
    );
    await desktopPage.setViewportSize({ width: 1440, height: 900 });
    await desktopPage.waitForTimeout(100);
    const activeAfterDesktopResize = await getNavigationState(desktopPage);
    const projectsAfterDesktopResize = await scrollToNavigationSection(
      desktopPage,
      "projects",
    );

    const hashPage = await desktopContext.newPage();
    await hashPage.goto(new URL("#projects", `${baseUrl.replace(/\/?$/, "/")}`).href, {
      waitUntil: skipScreenshots ? "domcontentloaded" : "networkidle",
    });
    const activeFromHash = await waitForActiveNavigation(hashPage, "#projects");
    await hashPage.close();

    const navigationCheck = {
      clickSequence: navigationClickSequence,
      scrollSequence: navigationScrollSequence,
      projectsFromNearby,
      activeAfterRefresh,
      activeAfterMobileResize,
      projectsAfterMobileResize,
      activeAfterDesktopResize,
      projectsAfterDesktopResize,
      activeFromHash,
      anchorOffset,
      passes:
        navigationClickSequence.every(
          ({ href, state }) => state.passes && state.active[0] === href,
        ) &&
        navigationScrollSequence.every(
          ({ sectionId, state }) => state.passes && state.active[0] === `#${sectionId}`,
        ) &&
        projectsFromNearby.passes &&
        projectsFromNearby.active[0] === "#projects" &&
        activeAfterRefresh.passes &&
        activeAfterRefresh.active[0] === "#community" &&
        activeAfterMobileResize.passes &&
        projectsAfterMobileResize.passes &&
        projectsAfterMobileResize.active[0] === "#projects" &&
        activeAfterDesktopResize.passes &&
        projectsAfterDesktopResize.passes &&
        projectsAfterDesktopResize.active[0] === "#projects" &&
        activeFromHash.passes &&
        anchorOffset.passes,
    };

    const resumeResponse = await desktopPage.request.get(
      new URL("assets/ishaq-nasiru-resume.pdf", `${baseUrl.replace(/\/?$/, "/")}`).href,
    );
    const resumeCheck = {
      status: resumeResponse.status(),
      contentType: resumeResponse.headers()["content-type"],
      passes:
        resumeResponse.ok() &&
        resumeResponse.headers()["content-type"]?.includes("application/pdf"),
    };

    await desktopPage.route("https://formsubmit.co/ajax/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: "true" }),
      });
    });
    await desktopPage.locator("#contact").scrollIntoViewIfNeeded();
    await desktopPage.locator('#contactForm input[name="name"]').fill("Portfolio QA");
    await desktopPage
      .locator('#contactForm input[name="email"]')
      .fill("qa@example.com");
    await desktopPage
      .locator('#contactForm textarea[name="message"]')
      .fill("Automated contact form verification.");
    const contactUrlBefore = desktopPage.url();
    await desktopPage.locator('#contactForm button[type="submit"]').click();
    await desktopPage.waitForFunction(
      () => document.querySelector("#formStatus")?.textContent.includes("Message sent"),
    );
    const contactCheck = await desktopPage.evaluate((urlBefore) => ({
      urlBefore,
      urlAfter: window.location.href,
      status: document.querySelector("#formStatus")?.textContent.trim(),
      passes:
        window.location.href === urlBefore &&
        document.querySelector("#formStatus")?.textContent.includes("Message sent"),
    }), contactUrlBefore);

    await desktopPage.locator("#themeToggle").click();
    const selectedTheme = await desktopPage.evaluate(
      () => document.documentElement.dataset.theme,
    );
    await desktopPage.reload({
      waitUntil: skipScreenshots ? "domcontentloaded" : "networkidle",
    });
    await revealSections(desktopPage);
    const persistedTheme = await desktopPage.evaluate(
      () => document.documentElement.dataset.theme,
    );
    if (!skipScreenshots) {
      await desktopPage.screenshot({
        path: path.join(outputDir, "portfolio-desktop-dark.png"),
        fullPage: true,
      });
    }

    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    const mobile = await inspectPage(mobilePage, "390x844");
    let mobileMenuOpen;
    let mobileMenuClosed;
    let mobileProjectActive;
    try {
      await mobilePage.locator("#menuToggle").click({ timeout: 3000 });
      mobileMenuOpen = await mobilePage.evaluate(() => ({
        expanded: document.querySelector("#menuToggle").getAttribute("aria-expanded"),
        visible: document.querySelector("#primaryNavigation").classList.contains("open"),
        locked: document.body.classList.contains("menu-open"),
      }));
      await mobilePage.locator('#primaryNavigation a[href="#projects"]').click({ timeout: 3000 });
      mobileProjectActive = await waitForActiveNavigation(mobilePage, "#projects");
      mobileMenuClosed = await mobilePage.evaluate(() => ({
        expanded: document.querySelector("#menuToggle").getAttribute("aria-expanded"),
        visible: document.querySelector("#primaryNavigation").classList.contains("open"),
        locked: document.body.classList.contains("menu-open"),
      }));
    } catch (error) {
      mobileMenuOpen = { passes: false, error: error.message };
      mobileMenuClosed = { passes: false, error: error.message };
      mobileProjectActive = { passes: false, error: error.message };
    }

    await mobilePage.locator("#game").scrollIntoViewIfNeeded();
    await mobilePage.locator("#startGame").click();
    await mobilePage.waitForTimeout(100);
    const mobileDirections = {};
    for (const [index, direction] of ["right", "left", "down", "up"].entries()) {
      mobileDirections[direction] = await holdDirectionalControl(
        mobilePage,
        direction,
        "touch",
        40 + index,
      );
    }
    const touchPadMetrics = await mobilePage.locator(".touch-pad").evaluate((pad) => {
      const rect = pad.getBoundingClientRect();
      return {
        visible: getComputedStyle(pad).display === "grid",
        fitsViewport: rect.left >= 0 && rect.right <= window.innerWidth,
        touchAction: getComputedStyle(pad).touchAction,
      };
    });
    const mobileGameCheck = {
      directions: mobileDirections,
      touchPad: touchPadMetrics,
      passes:
        mobileDirections.right.after.x > mobileDirections.right.before.x &&
        mobileDirections.left.after.x < mobileDirections.left.before.x &&
        mobileDirections.down.after.y > mobileDirections.down.before.y &&
        mobileDirections.up.after.y < mobileDirections.up.before.y &&
        Object.values(mobileDirections).every(
          (control) =>
            control.pressed.pressed === "true" &&
            control.pressed.visual === true &&
            control.released.pressed === "false" &&
            control.released.visual === false,
        ) &&
        touchPadMetrics.visible &&
        touchPadMetrics.fitsViewport &&
        touchPadMetrics.touchAction === "none",
    };
    if (!skipScreenshots) {
      await mobilePage.locator(".touch-pad").scrollIntoViewIfNeeded();
      await mobilePage.waitForTimeout(120);
      await mobilePage.screenshot({
        path: path.join(outputDir, "portfolio-mobile-tech-stack-game.png"),
        fullPage: false,
      });
    }
    const mobileDark = await inspectDarkTheme(mobilePage, "390x844");

    const tabletContext = await browser.newContext({
      viewport: { width: 768, height: 1024 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
    });
    const tabletPage = await tabletContext.newPage();
    const tablet = await inspectPage(tabletPage, "768x1024");
    const tabletDark = await inspectDarkTheme(tabletPage, "768x1024");

    await desktopPage.locator("#projects").scrollIntoViewIfNeeded();
    const hiddenProjectsBefore = await desktopPage.locator(".additional-project-hidden").count();
    await desktopPage.locator("#toggleProjects").click();
    const projectReveal = await desktopPage.evaluate(() => ({
      expanded: document.querySelector("#toggleProjects").getAttribute("aria-expanded"),
      visibleProjects: [...document.querySelectorAll("#additionalProjects .additional-project")].filter(
        (item) => getComputedStyle(item).display !== "none",
      ).length,
    }));

    const summarizeViewport = (result) => ({
      status: result.status,
      viewport: result.viewport,
      errors: result.errors,
      failedRequests: result.failedRequests,
      overflow: result.hasHorizontalOverflow,
      overflowElements: result.overflowElements,
      hero: result.hero,
      contactLayout: result.contactLayout,
      gallerySectionPresent: result.gallerySectionPresent,
      aboutSectionPresent: result.aboutSectionPresent,
      aboutNavigationPresent: result.aboutNavigationPresent,
      experienceSectionPresent: result.experienceSectionPresent,
      experienceNavigationPresent: result.experienceNavigationPresent,
      persistentBackground: result.persistentBackground,
      missingAlt: result.missingAlt,
      brokenInternalAnchors: result.brokenInternalAnchors,
      unsafeExternalTabs: result.unsafeExternalTabs,
      identity: result.identity,
      community: result.community,
      skillShelfHeaders: result.skillShelfHeaders,
      footerPresent: result.footerPresent,
      navIndicator: result.navIndicator,
      mobileControlsVisible: result.mobileControlsVisible,
      glassPanels: result.glassPanels,
    });

    const viewportPasses = (result) =>
      result.status === 200 &&
      result.errors.length === 0 &&
      result.failedRequests.length === 0 &&
      !result.hasHorizontalOverflow &&
      result.missingAlt.length === 0 &&
      result.brokenInternalAnchors.length === 0 &&
      result.unsafeExternalTabs.length === 0 &&
      !result.experienceSectionPresent &&
      !result.experienceNavigationPresent &&
      !result.aboutSectionPresent &&
      !result.aboutNavigationPresent &&
      result.persistentBackground.present &&
      result.persistentBackground.position === "fixed" &&
      result.persistentBackground.image.includes("ishaq-voxel-scene.webp") &&
      result.hero.portraitSrc.endsWith("ishaq-headshot.jpeg") &&
      result.hero.name.text === "Ishaq Ishaq Nasiru" &&
      result.hero.name.fullyVisible &&
      result.hero.name.fontSize >=
        (result.viewport.width <= 680 ? 28 : result.viewport.width <= 900 ? 38 : 50) &&
      result.hero.name.fontSize >= result.hero.tagline.fontSize * 1.3 &&
      result.hero.tagline.top >= result.hero.name.bottom + 10 &&
      result.hero.tagline.fullyVisible &&
      result.hero.introduction.top >= result.hero.tagline.bottom + 8 &&
      result.hero.introduction.fullyVisible &&
      result.hero.headVisible &&
      result.hero.portraitContained &&
      result.hero.ctasVisible &&
      result.mobileControlsVisible &&
      result.glassPanels.every((panel) => panel.backdropFilter !== "none") &&
      (result.viewport.width < 1024 || result.hero.fitsInitialViewport);

    const desktopContactPasses = (result) =>
      result.contactLayout.topAligned &&
      result.contactLayout.fitsViewportHeight &&
      result.contactLayout.resumeWidth < result.contactLayout.contactWidth;

    const conHacksEntry = desktop.community.find(
      (entry) => entry.organization === "ConHacks",
    );
    const verification = {
      immediateLoad: immediateLoadCheck.passes,
      desktop: viewportPasses(desktop) && desktopContactPasses(desktop),
      compactDesktop:
        viewportPasses(compactDesktop) && desktopContactPasses(compactDesktop),
      wideDesktop: viewportPasses(wideDesktop) && desktopContactPasses(wideDesktop),
      mobile: viewportPasses(mobile),
      tablet: viewportPasses(tablet),
      community: conHacksEntry?.date === "2025 & 2026",
      navigation:
        navigationCheck.passes &&
        mobileMenuOpen.expanded === "true" &&
        mobileMenuOpen.visible === true &&
        mobileMenuClosed.expanded === "false" &&
        mobileMenuClosed.visible === false &&
        mobileProjectActive.passes &&
        mobileProjectActive.active[0] === "#projects",
      resume: resumeCheck.passes,
      contact: contactCheck.passes,
      game: gameCheck.passes && mobileGameCheck.passes,
      projects:
        JSON.stringify(desktop.featuredProjects) ===
          JSON.stringify([
            "PillPal",
            "Precision Agriculture Sprayer Drone",
            "BlockBuilt",
            "LegalAI",
          ]) &&
        hiddenProjectsBefore > 0 &&
        projectReveal.expanded === "true",
      theme:
        selectedTheme === persistedTheme &&
        compactDesktopDark.passes &&
        wideDesktopDark.passes &&
        mobileDark.passes &&
        tabletDark.passes,
    };
    verification.passes = Object.values(verification).every(Boolean);

    console.log(
      JSON.stringify(
        {
          desktop: summarizeViewport(desktop),
          compactDesktop: summarizeViewport(compactDesktop),
          compactDesktopDark,
          wideDesktop: summarizeViewport(wideDesktop),
          wideDesktopDark,
          mobile: summarizeViewport(mobile),
          mobileDark,
          tablet: summarizeViewport(tablet),
          tabletDark,
          navigation: {
            ...navigationCheck,
            mobileMenuOpen,
            mobileMenuClosed,
            mobileProjectActive,
          },
          resume: resumeCheck,
          contact: contactCheck,
          immediateLoad: immediateLoadCheck,
          game: gameCheck,
          mobileGame: mobileGameCheck,
          projectReveal: {
            hiddenBefore: hiddenProjectsBefore,
            ...projectReveal,
            passes: hiddenProjectsBefore > 0 && projectReveal.expanded === "true",
          },
          theme: {
            selected: selectedTheme,
            persisted: persistedTheme,
            passes: selectedTheme === persistedTheme,
          },
          verification,
          screenshots: outputDir,
        },
        null,
        2,
      ),
    );

    if (!verification.passes) {
      throw new Error("Portfolio verification failed. Review the verification summary.");
    }
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
