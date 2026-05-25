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

    const title = await page.title().catch(() => 'Untitled Page');
    const palette = await extractPaletteFromPage(page);
    return { hero: heroPath, full: fullPath, sections, palette, title };
  } finally {
    await context.close();
  }
}

// ─── Crawler Helpers ─────────────────────────────────────────────────────────

async function discoverLinks(browser, url) {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    await waitForPageReady(page);
    
    const links = await page.evaluate(() => {
      const origin = window.location.origin;
      return Array.from(document.querySelectorAll('a'))
        .map(a => a.href)
        .filter(href => href && href.startsWith(origin))
        .map(href => {
          try {
            const u = new URL(href);
            return u.origin + u.pathname.replace(/\/$/, '');
          } catch (_) {
            return null;
          }
        })
        .filter(Boolean);
    });
    return Array.from(new Set(links));
  } catch (err) {
    console.error('  [Crawler] Link discovery failed:', err.message);
    return [];
  } finally {
    await context.close();
  }
}

function getPageSlug(urlStr, initialUrlStr) {
  try {
    const initialUrl = new URL(initialUrlStr);
    const targetUrl = new URL(urlStr);
    
    const initialPath = initialUrl.pathname.replace(/\/$/, '');
    const targetPath = targetUrl.pathname.replace(/\/$/, '');
    
    if (targetPath === initialPath || targetPath === '' || targetPath === '/') {
      return '';
    }
    
    const cleaned = targetUrl.pathname.replace(/^\/|\/$/g, '');
    return cleaned.replace(/\//g, '_') || 'page';
  } catch (_) {
    return 'page';
  }
}

function filterAndDeduplicateLinks(links, initialUrl) {
  const ignoredPatterns = ['/cart', '/checkout', '/search', '/login', '/signup', '/account', '/privacy', '/terms', '/rules', '/api'];
  
  // 1. Filter out utility paths
  const filtered = links.filter(link => {
    try {
      const pathname = new URL(link).pathname.toLowerCase();
      return !ignoredPatterns.some(pat => pathname.includes(pat));
    } catch (_) {
      return false;
    }
  });

  // 2. Dynamic template deduplication (e.g. only keep 1 product or 1 collection layout showcase)
  const finalLinks = [];
  const patternsSeen = new Map();
  
  for (const link of filtered) {
    try {
      const urlObj = new URL(link);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      
      if (pathParts.length >= 2) {
        const parentPattern = pathParts[0].toLowerCase();
        if (['product', 'products', 'collection', 'collections', 'p', 'c'].includes(parentPattern)) {
          const count = patternsSeen.get(parentPattern) || 0;
          if (count >= 1) {
            continue;
          }
          patternsSeen.set(parentPattern, count + 1);
        }
      }
      finalLinks.push(link);
    } catch (_) {}
  }
  
  return finalLinks;
}

// ─── Public API ───────────────────────────────────────────────────────────────

async function captureScreenshots(url, outDir, slug) {
  const launchOpts = { headless: true };
  const browser = await chromium.launch(launchOpts);

  try {
    // 1. Discover links from the homepage
    const discovered = await discoverLinks(browser, url);
    const filteredLinks = filterAndDeduplicateLinks(discovered, url);
    
    // Ensure homepage is first
    const finalLinks = [url];
    for (const link of filteredLinks) {
      if (link.replace(/\/$/, '') !== url.replace(/\/$/, '') && finalLinks.length < 6) {
        finalLinks.push(link);
      }
    }

    console.log(`\n  [Crawl] Found ${discovered.length} same-origin links. Deduplicated to ${finalLinks.length} key pages.`);
    finalLinks.forEach((link, idx) => {
      console.log(`    ${idx + 1}. ${link}`);
    });

    const pagesResult = [];

    // 2. Sequential multi-page capture loop
    for (let i = 0; i < finalLinks.length; i++) {
      const targetUrl = finalLinks[i];
      const pageSlug = getPageSlug(targetUrl, url);
      const isHome = pageSlug === '';
      const displaySlug = isHome ? 'home' : pageSlug;

      console.log(`\n  [Capture] Page ${i + 1}/${finalLinks.length}: ${targetUrl} (${displaySlug})`);

      const laptopPrefix = isHome ? 'laptop' : `${pageSlug}_laptop`;
      const mobilePrefix = isHome ? 'mobile' : `${pageSlug}_mobile`;

      const laptopMaxSec = isHome ? 6 : 4;
      const mobileMaxSec = isHome ? 4 : 2;

      try {
        const laptopResult = await captureViewport(browser, targetUrl, 1440, 900, 2, slug, laptopPrefix, outDir, laptopMaxSec);
        const mobileResult = await captureViewport(browser, targetUrl, 390,  844, 3, slug, mobilePrefix, outDir, mobileMaxSec);

        pagesResult.push({
          url:            targetUrl,
          pageSlug:       pageSlug,
          title:          laptopResult.title || 'Untitled Page',
          laptopHero:     laptopResult.hero,
          laptopFull:     laptopResult.full,
          laptopSections: laptopResult.sections,
          mobileHero:     mobileResult.hero,
          mobileSections: mobileResult.sections,
          palette:        laptopResult.palette,
        });
      } catch (pageErr) {
        console.error(`  ✗ Capture failed for ${targetUrl}: ${pageErr.message}`);
      }
    }

    return pagesResult;
  } finally {
    await browser.close();
  }
}

module.exports = { captureScreenshots };
