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
    hero: (() => {
      const hero = document.querySelector("#home").getBoundingClientRect();
      const copyElement = document.querySelector(".hero-copy");
      const copy = copyElement.getBoundingClientRect();
      const copyStyle = getComputedStyle(copyElement);
      return {
        top: Math.round(hero.top),
        height: Math.round(hero.height),
        copyTop: Math.round(copy.top),
        copyHeight: Math.round(copy.height),
        copyBottom: Math.round(copy.bottom),
        copyMinHeight: copyStyle.minHeight,
        copyTransform: copyStyle.transform,
        fitsInitialViewport: hero.height <= window.innerHeight + 2 && copy.bottom <= hero.bottom + 2,
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

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath });

  try {
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
          document.querySelector("#gameStatus").textContent.includes("Golden Sunny") &&
          paintedPixels > 1000,
      };
    });

    await desktopPage.locator('#primaryNavigation a[href="#projects"]').click();
    await desktopPage.waitForTimeout(250);
    const anchorOffset = await desktopPage.evaluate(() => {
      const header = document.querySelector("#siteHeader").getBoundingClientRect();
      const section = document.querySelector("#projects").getBoundingClientRect();
      return {
        headerBottom: Math.round(header.bottom),
        sectionTop: Math.round(section.top),
        passes: section.top >= header.bottom - 2,
      };
    });

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
    try {
      await mobilePage.locator("#menuToggle").click({ timeout: 3000 });
      mobileMenuOpen = await mobilePage.evaluate(() => ({
        expanded: document.querySelector("#menuToggle").getAttribute("aria-expanded"),
        visible: document.querySelector("#primaryNavigation").classList.contains("open"),
        locked: document.body.classList.contains("menu-open"),
      }));
      await mobilePage.locator('#primaryNavigation a[href="#about"]').click({ timeout: 3000 });
      await mobilePage.waitForTimeout(200);
      mobileMenuClosed = await mobilePage.evaluate(() => ({
        expanded: document.querySelector("#menuToggle").getAttribute("aria-expanded"),
        visible: document.querySelector("#primaryNavigation").classList.contains("open"),
        locked: document.body.classList.contains("menu-open"),
      }));
    } catch (error) {
      mobileMenuOpen = { passes: false, error: error.message };
      mobileMenuClosed = { passes: false, error: error.message };
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
      gallerySectionPresent: result.gallerySectionPresent,
      missingAlt: result.missingAlt,
      brokenInternalAnchors: result.brokenInternalAnchors,
      unsafeExternalTabs: result.unsafeExternalTabs,
      identity: result.identity,
      community: result.community,
      skillShelfHeaders: result.skillShelfHeaders,
      footerPresent: result.footerPresent,
      navIndicator: result.navIndicator,
    });

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
            anchorOffset,
            mobileMenuOpen,
            mobileMenuClosed,
          },
          resume: resumeCheck,
          contact: contactCheck,
          game: gameCheck,
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
          screenshots: outputDir,
        },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
