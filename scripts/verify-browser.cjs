const path = require("node:path");
const os = require("node:os");
const { chromium } = require("playwright");

const baseUrl = process.env.PORTFOLIO_URL || "http://127.0.0.1:4173";
const outputDir = process.env.PORTFOLIO_SCREENSHOT_DIR || os.tmpdir();
const executablePath =
  process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function revealSections(page) {
  await page.evaluate(async () => {
    const stops = [...document.querySelectorAll("main section")];
    for (const stop of stops) {
      stop.scrollIntoView({ block: "center" });
      await new Promise((resolve) => setTimeout(resolve, 45));
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

  const response = await page.goto(baseUrl, { waitUntil: "networkidle" });
  await revealSections(page);
  await page.screenshot({
    path: path.join(outputDir, `portfolio-${name}.png`),
    fullPage: true,
  });

  const result = await page.evaluate(() => ({
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
    gallerySlides: document.querySelectorAll(".gallery-slide").length,
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
  }));

  return {
    status: response?.status(),
    errors,
    failedRequests,
    ...result,
  };
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath });

  try {
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      deviceScaleFactor: 1,
    });
    const desktopPage = await desktopContext.newPage();
    const desktop = await inspectPage(desktopPage, "desktop");

    await desktopPage.locator("#themeToggle").click();
    const selectedTheme = await desktopPage.evaluate(
      () => document.documentElement.dataset.theme,
    );
    await desktopPage.reload({ waitUntil: "networkidle" });
    await revealSections(desktopPage);
    const persistedTheme = await desktopPage.evaluate(
      () => document.documentElement.dataset.theme,
    );
    await desktopPage.screenshot({
      path: path.join(outputDir, "portfolio-desktop-dark.png"),
      fullPage: true,
    });

    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    const mobile = await inspectPage(mobilePage, "mobile");

    console.log(
      JSON.stringify(
        {
          desktop,
          mobile,
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
