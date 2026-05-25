'use strict';

/**
 * theme-extractor.js — Dynamic Brand Color Extraction & Cohesive Theme Builder
 */

function parseColor(str) {
  if (!str) return [28, 26, 23];
  
  // Handle rgb / rgba
  let m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (m) {
    return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
  }
  
  // Handle hex
  let hex = str.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  if (hex.length === 6) {
    return [
      parseInt(hex.substr(0, 2), 16),
      parseInt(hex.substr(2, 2), 16),
      parseInt(hex.substr(4, 2), 16)
    ];
  }
  
  return [28, 26, 23];
}

function rgbToHex(r, g, b) {
  const toH = val => Math.max(0, Math.min(255, Math.round(val))).toString(16).padStart(2, '0');
  return `#${toH(r)}${toH(g)}${toH(b)}`;
}

function blend(c1, c2, weight) {
  const rgb1 = parseColor(c1);
  const rgb2 = parseColor(c2);
  const r = rgb1[0] * (1 - weight) + rgb2[0] * weight;
  const g = rgb1[1] * (1 - weight) + rgb2[1] * weight;
  const b = rgb1[2] * (1 - weight) + rgb2[2] * weight;
  return rgbToHex(r, g, b);
}

function getLuminance(c) {
  const rgb = parseColor(c);
  return (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
}

// Convert any color to standard hex format
function toHex(colorStr) {
  const rgb = parseColor(colorStr);
  return rgbToHex(rgb[0], rgb[1], rgb[2]);
}

/**
 * Extracts raw page colors (bg, text, accent) inside the browser context
 */
async function extractPaletteFromPage(page) {
  return await page.evaluate(() => {
    // 1. Get body background color
    let bg = window.getComputedStyle(document.body).backgroundColor;
    if (bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)' || bg === 'rgb(255, 255, 255)') {
      const firstSection = document.querySelector('section') || document.querySelector('main') || document.querySelector('div');
      if (firstSection) {
        bg = window.getComputedStyle(firstSection).backgroundColor;
      }
    }
    if (bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') {
      bg = 'rgb(255, 255, 255)';
    }

    // 2. Get body text color
    let text = window.getComputedStyle(document.body).color;
    if (text === 'transparent' || text === 'rgba(0, 0, 0, 0)') {
      text = 'rgb(0, 0, 0)';
    }

    // 3. Extract primary brand accent (colorful solid CTA buttons or prominent links)
    let accent = null;
    const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
    const candidates = [];

    for (const btn of buttons) {
      const style = window.getComputedStyle(btn);
      const btnBg = style.backgroundColor;
      
      const m = btnBg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (m) {
        const r = parseInt(m[1]), g = parseInt(m[2]), b = parseInt(m[3]);
        // Filter out grey scale, black, white elements
        const diff = Math.max(r, g, b) - Math.min(r, g, b);
        const isGrey = diff < 20;
        const isBlackOrWhite = (r < 30 && g < 30 && b < 30) || (r > 230 && g > 230 && b > 230);
        
        if (!isGrey && !isBlackOrWhite && btnBg !== 'transparent') {
          candidates.push({ bg: btnBg, area: btn.offsetWidth * btn.offsetHeight });
        }
      }
    }

    if (candidates.length > 0) {
      // Use the color of the largest colorful CTA
      candidates.sort((a, b) => b.area - a.area);
      accent = candidates[0].bg;
    } else {
      // Fallback: look for colorful links/headings
      const links = Array.from(document.querySelectorAll('a, h1, h2, span'));
      const linkCandidates = [];
      for (const el of links) {
        const color = window.getComputedStyle(el).color;
        const m = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (m) {
          const r = parseInt(m[1]), g = parseInt(m[2]), b = parseInt(m[3]);
          const diff = Math.max(r, g, b) - Math.min(r, g, b);
          if (diff > 30 && color !== 'transparent') {
            linkCandidates.push(color);
          }
        }
      }
      accent = linkCandidates[0] || 'rgb(138, 110, 77)'; // Fallback to warm copper/gold
    }

    return { bg, text, accent };
  }).catch(() => ({ bg: 'rgb(255, 255, 255)', text: 'rgb(28, 26, 23)', accent: 'rgb(184, 146, 42)' }));
}

/**
 * Builds a cohesive, high-fashion 12-token color theme based on extracted brand details
 */
function buildCohesiveTheme(palette, requestedTheme) {
  const siteBg     = toHex(palette.bg);
  const siteText   = toHex(palette.text);
  const siteAccent = toHex(palette.accent);
  
  const isSiteDark  = getLuminance(siteBg) < 0.5;
  const isBoardDark = requestedTheme === 'dark';
  
  let bg, panel, text, textMuted, textSubtle, card, cardBorder, pill, pillText;
  
  if (isBoardDark) {
    // Premium dark-mode board styled to the site's colors
    bg = isSiteDark ? siteBg : '#0c0c0c';
    panel = blend(bg, '#ffffff', 0.05); // slight white blend for panel depth
    text = '#fdfcfb';
    textMuted = '#8f8982';
    textSubtle = '#5c5852';
    card = '#141414';
    cardBorder = blend(bg, '#ffffff', 0.12);
    pill = blend(bg, '#ffffff', 0.08);
    pillText = siteAccent;
  } else {
    // Premium light-mode board styled to the site's colors
    bg = !isSiteDark ? siteBg : '#f5f2eb';
    panel = blend(bg, '#000000', 0.04); // slight black blend for panel depth
    text = '#1c1814';
    textMuted = '#6c6258';
    textSubtle = '#958b7e';
    card = '#ffffff';
    cardBorder = blend(bg, '#000000', 0.12);
    pill = blend(bg, '#000000', 0.06);
    pillText = blend(siteAccent, '#000000', 0.15); // darken slightly for legibility
  }
  
  return {
    bg,
    panel,
    text,
    textMuted,
    textSubtle,
    accent: siteAccent,
    accentBright: blend(siteAccent, '#ffffff', 0.25),
    pill,
    pillText,
    card,
    cardBorder,
    grid: siteAccent,
    badge: isBoardDark ? siteAccent : '#1a1816',
    badgeText: isBoardDark ? '#0b0b0b' : '#f5f2eb',
    brandGlow: siteAccent,
    ambientGlow: blend(siteAccent, bg, 0.70)
  };
}

module.exports = {
  extractPaletteFromPage,
  buildCohesiveTheme,
  toHex
};
