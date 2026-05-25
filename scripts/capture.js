'use strict';

/**
 * capture.js — Playwright screenshot logic
 *
 * Exports: captureScreenshots(url, outDir, slug)
 * Returns: shots = {
 *   laptopHero, laptopFull, laptopSections[],
 *   mobileHero, mobileSections[]
 * }
 *
 * Uses Google Chrome on Windows if available; falls back to system Chromium.
 */

const fs   = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { extractPaletteFromPage } = require('./theme-extractor');

// ─── Chrome binary resolution ────────────────────────────────────────────────

const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.CHROME_PATH,
].filter(Boolean);

function findChrome() {
  for (const p of CHROME_CANDIDATES) {
    if (fs.existsSync(p)) return p;
  }
  return null; // playwright will use its own bundled chromium
}

// ─── Wait helpers ─────────────────────────────────────────────────────────────

async function waitForPageReady(page) {
  try { await page.waitForLoadState('networkidle', { timeout: 15000 }); } catch (_) {}
  try { await page.waitForLoadState('domcontentloaded', { timeout: 5000 }); } catch (_) {}

  // Wait for all <img> elements to finish loading
  await page.evaluate(() => {
    return Promise.all(
      Array.from(document.images)
        .filter(img => !img.complete)
        .map(img => new Promise(resolve => {
          img.addEventListener('load',  resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        }))
    );
  }).catch(() => {});

  await page.waitForTimeout(1500);
}

// ─── Smooth scroll to trigger lazy loads ─────────────────────────────────────

async function scrollToTriggerLazyLoad(page, viewportHeight) {
  const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  let y = 0;
  const step = Math.floor(viewportHeight * 0.8);
  while (y < totalHeight) {
    await page.evaluate(scrollY => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(120);
    y += step;
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
}

// ─── Single viewport capture session ─────────────────────────────────────────

async function captureViewport(browser, url, vpW, vpH, dpr, slug, prefix, outDir, maxSections) {
  const context = await browser.newContext({
    viewport: { width: vpW, height: vpH },
    deviceScaleFactor: dpr,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
      'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
    },
  });

  // Mask webdriver detection
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'plugins',   { get: () => [1, 2, 3] });
  });

  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    
    // Inject style to completely disable all CSS transitions, animations, and smooth scrolling
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          transition: none !important;
          animation: none !important;
          transition-duration: 0s !important;
          animation-duration: 0s !important;
          scroll-behavior: auto !important;
        }
      `
    }).catch(() => {});

    await waitForPageReady(page);
    await scrollToTriggerLazyLoad(page, vpH);

    // ── Hero screenshot (scroll=0) ──────────────────────────────────────────
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000); // 1s settle time
    const heroPath = path.join(outDir, `${slug}_${prefix}_hero.png`);
    await page.screenshot({ path: heroPath, clip: { x: 0, y: 0, width: vpW, height: vpH } });

    // ── Full page screenshot ────────────────────────────────────────────────
    const fullPath = path.join(outDir, `${slug}_${prefix}_full.png`);
    await page.screenshot({ path: fullPath, fullPage: true });

    // ── Section screenshots (one per viewport height) ───────────────────────
    const totalH = await page.evaluate(() => document.documentElement.scrollHeight);
    const sections = [];
    const numSections = Math.min(maxSections, Math.max(0, Math.ceil(totalH / vpH) - 1));

    for (let i = 1; i <= numSections; i++) {
      const scrollY = vpH * i;
      await page.evaluate(sy => window.scrollTo(0, sy), scrollY);
      await page.waitForTimeout(1200); // 1.2s settling time for elements to render
      const secPath = path.join(outDir, `${slug}_${prefix}_section_${i}.png`);
      await page.screenshot({ path: secPath, clip: { x: 0, y: 0, width: vpW, height: vpH } });
      sections.push(secPath);
    }

    const palette = await extractPaletteFromPage(page);
    return { hero: heroPath, full: fullPath, sections, palette };
  } finally {
    await context.close();
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

async function captureScreenshots(url, outDir, slug) {
  const launchOpts = { headless: true };
  const browser = await chromium.launch(launchOpts);

  try {
    const [laptopResult, mobileResult] = await Promise.all([
      captureViewport(browser, url, 1440, 900, 2, slug, 'laptop', outDir, 6),
      captureViewport(browser, url, 390,  844, 3, slug, 'mobile', outDir, 4),
    ]);

    return {
      laptopHero:     laptopResult.hero,
      laptopFull:     laptopResult.full,
      laptopSections: laptopResult.sections,
      mobileHero:     mobileResult.hero,
      mobileSections: mobileResult.sections,
      palette:        laptopResult.palette,
    };
  } finally {
    await browser.close();
  }
}

module.exports = { captureScreenshots };
