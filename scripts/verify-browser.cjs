const path = require("node:path");
const os = require("node:os");
const { chromium } = require("playwright");

const baseUrl = process.env.PORTFOLIO_URL || "http://127.0.0.1:4173";
const outputDir = process.env.PORTFOLIO_SCREENSHOT_DIR || os.tmpdir();
const executablePath =
  process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function revealSections(page) {
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

  const response = await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(250);
  await page.screenshot({
    path: path.join(outputDir, `portfolio-${name}-viewport.png`),
  });
  await revealSections(page);
  await page.screenshot({
    path: path.join(outputDir, `portfolio-${name}.png`),
    fullPage: true,
  });
  await page.locator("#projects").scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await page.screenshot({
    path: path.join(outputDir, `portfolio-${name}-projects.png`),
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

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath });

  try {
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      deviceScaleFactor: 1,
    });
    const desktopPage = await desktopContext.newPage();
    const desktop = await inspectPage(desktopPage, "desktop");

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
    await mobilePage.locator("#menuToggle").click();
    const mobileMenuOpen = await mobilePage.evaluate(() => ({
      expanded: document.querySelector("#menuToggle").getAttribute("aria-expanded"),
      visible: document.querySelector("#primaryNavigation").classList.contains("open"),
      locked: document.body.classList.contains("menu-open"),
    }));
    await mobilePage.locator('#primaryNavigation a[href="#about"]').click();
    await mobilePage.waitForTimeout(200);
    const mobileMenuClosed = await mobilePage.evaluate(() => ({
      expanded: document.querySelector("#menuToggle").getAttribute("aria-expanded"),
      visible: document.querySelector("#primaryNavigation").classList.contains("open"),
      locked: document.body.classList.contains("menu-open"),
    }));

    const tabletContext = await browser.newContext({
      viewport: { width: 768, height: 1024 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
    });
    const tabletPage = await tabletContext.newPage();
    const tablet = await inspectPage(tabletPage, "tablet");

    await desktopPage.locator("#projects").scrollIntoViewIfNeeded();
    const hiddenProjectsBefore = await desktopPage.locator(".additional-project-hidden").count();
    await desktopPage.locator("#toggleProjects").click();
    const projectReveal = await desktopPage.evaluate(() => ({
      expanded: document.querySelector("#toggleProjects").getAttribute("aria-expanded"),
      visibleProjects: [...document.querySelectorAll("#additionalProjects .additional-project")].filter(
        (item) => getComputedStyle(item).display !== "none",
      ).length,
    }));

    console.log(
      JSON.stringify(
        {
          desktop,
          mobile,
          tablet,
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
