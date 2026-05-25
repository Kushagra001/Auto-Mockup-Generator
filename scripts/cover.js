'use strict';

/**
 * cover.js — Overhauled Breathtaking Creative Cover Board Generator (2400×1600px)
 *
 * Implements high-end design agency styling:
 *   - Overlapping dynamic brand-orange and warm-champagne radial mesh glows
 *   - Under-device 3D floating soft radial shadows
 *   - Editorial Georgia typographic backdrop
 *   - Glassmorphic card containment for features/specs
 *   - Swiss-style geometric blueprint crosshairs and border technical metadata
 */

const fs    = require('fs');
const sharp = require('sharp');
const { buildCohesiveTheme } = require('./theme-extractor');

function x(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&apos;');
}

function wrapText(text, maxLen) {
  if (text.length <= maxLen) return [text];
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxLen && cur) { lines.push(cur.trim()); cur = w; }
    else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

async function generateCover(opts, laptopMockupPath, mobileMockupPath, outputPath) {
  const W = 2400, H = 1600;
  const name         = opts.name        || 'Untitled Project';
  
  // Dynamically build a custom, beautifully coordinated theme matching the website's brand colors
  const defaultPalette = name.toLowerCase().includes('axiom')
    ? { bg: 'rgb(250, 247, 242)', text: 'rgb(28, 26, 23)', accent: 'rgb(184, 146, 42)' }
    : { bg: 'rgb(244, 241, 235)', text: 'rgb(28, 26, 23)', accent: 'rgb(240, 90, 40)' };
  const palette = opts.palette || defaultPalette;
  const t = buildCohesiveTheme(palette, opts.theme);
  const tagline      = opts.tagline     || 'A carefully crafted digital product.';
  const features     = (opts.features   || []).slice(0, 6);
  const deliverables = (opts.deliverables || []).slice(0, 4);
  const slug         = opts.slug        || 'project';
  const date         = opts.date        || new Date().getFullYear().toString();

  // ── Feature pills: highly polished status tags inside glass ─────────────
  const pillsHtml = features.map((f, i) => {
    const px = 76 + (i % 2) * 218;
    const py = 612 + Math.floor(i / 2) * 48;
    return `
    <rect x="${px}" y="${py}" width="202" height="32" rx="6" fill="${t.pill}" opacity="0.9" stroke="${t.cardBorder}" stroke-width="0.5"/>
    <circle cx="${px + 14}" cy="${py + 16}" r="2.5" fill="${t.brandGlow}" opacity="0.95"/>
    <text x="${px + 26}" y="${py + 20}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,sans-serif" font-size="10.5" font-weight="700" fill="${t.pillText}" letter-spacing="1">${x(f.toUpperCase())}</text>`;
  }).join('');

  // ── Deliverables: premium spec list inside glass ─────────────────────────
  const deliverablesHtml = deliverables.map((d, i) => {
    const dy = 830 + i * 50;
    return `
    <line x1="76" y1="${dy}" x2="500" y2="${dy}" stroke="${t.cardBorder}" stroke-width="0.75" opacity="0.3"/>
    <circle cx="84" cy="${dy + 24}" r="3" fill="${t.accent}" opacity="0.8"/>
    <text x="100" y="${dy + 28}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,sans-serif" font-size="12.5" font-weight="600" fill="${t.text}" letter-spacing="0.5" opacity="0.85">${x(d)}</text>
    <text x="500" y="${dy + 28}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,sans-serif" font-size="9" font-weight="800" fill="${t.accent}" letter-spacing="1.5" text-anchor="end" opacity="0.8">SPECIFIED</text>`;
  }).join('') + `<line x1="76" y1="${830 + deliverables.length * 50}" x2="500" y2="${830 + deliverables.length * 50}" stroke="${t.cardBorder}" stroke-width="0.75" opacity="0.3"/>`;

  // ── Grid pattern ─────────────────────────────────────────────────────────
  let gridLines = '';
  for (let gx = 0; gx <= W; gx += 80) {
    gridLines += `<line x1="${gx}" y1="0" x2="${gx}" y2="${H}" stroke="${t.grid}" stroke-width="0.5" opacity="0.045"/>`;
  }
  for (let gy = 0; gy <= H; gy += 80) {
    gridLines += `<line x1="0" y1="${gy}" x2="${W}" y2="${gy}" stroke="${t.grid}" stroke-width="0.5" opacity="0.045"/>`;
  }

  const taglineLines = wrapText(tagline, 36);
  const nameParts    = name.split(' ');
  const nameLine1    = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ');
  const nameLine2    = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ');

  // ── STAGE 1: Build background / text / UI layer SVG ──────────────────────
  const textLayerSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="${t.bg}"/>
      <stop offset="100%" stop-color="${t.panel}"/>
    </linearGradient>
    
    <!-- Signature Orange Brand Mesh Glow -->
    <radialGradient id="brandMeshGlow" cx="72%" cy="45%" r="48%">
      <stop offset="0%"   stop-color="${t.brandGlow}"   stop-opacity="0.22"/>
      <stop offset="60%"  stop-color="${t.brandGlow}"   stop-opacity="0.04"/>
      <stop offset="100%" stop-color="${t.bg}"          stop-opacity="0"/>
    </radialGradient>

    <!-- Secondary Champagne Backlit Glow -->
    <radialGradient id="ambientMeshGlow" cx="62%" cy="50%" r="55%">
      <stop offset="0%"   stop-color="${t.ambientGlow}" stop-opacity="0.45"/>
      <stop offset="60%"  stop-color="${t.ambientGlow}" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="${t.bg}"          stop-opacity="0"/>
    </radialGradient>
    
    <!-- Soft 3D Shadow for Laptop -->
    <radialGradient id="deviceShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#000000" stop-opacity="0.22"/>
      <stop offset="60%"  stop-color="#000000" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <!-- Soft 3D Shadow for Mobile -->
    <radialGradient id="mobileShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#000000" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <!-- Left Overlay for legibility -->
    <linearGradient id="leftFade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="${t.panel}" stop-opacity="0.75"/>
      <stop offset="35%"  stop-color="${t.panel}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${t.panel}" stop-opacity="0"/>
    </linearGradient>
    
    <!-- Vertical Accent bar -->
    <linearGradient id="accentLine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="${t.brandGlow}"/>
      <stop offset="100%" stop-color="${t.accentBright}" stop-opacity="0.1"/>
    </linearGradient>
  </defs>

  <!-- Background Base -->
  <rect x="0" y="0" width="${W}" height="${H}" fill="url(#bgGrad)"/>
  
  <!-- Subtle Architectural Grid -->
  ${gridLines}
  
  <!-- Backlighting Glows for Devices -->
  <rect x="0" y="0" width="${W}" height="${H}" fill="url(#ambientMeshGlow)"/>
  <rect x="0" y="0" width="${W}" height="${H}" fill="url(#brandMeshGlow)"/>
  
  <!-- Faint, giant "FLŌW" background editorial typography -->
  <text x="48" y="240" font-family="Georgia,Times New Roman,serif" font-size="230" font-weight="900" fill="${t.accent}" opacity="0.045" letter-spacing="-5">FLOW</text>

  <!-- Left Side Shadow Overlay -->
  <rect x="0" y="0" width="680" height="${H}" fill="url(#leftFade)"/>

  <!-- Technical border metadata (blueprint-style) -->
  <text x="80" y="50" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,sans-serif" font-size="9" font-weight="800" fill="${t.textSubtle}" letter-spacing="1.5" opacity="0.6">SCALE: 1:1  //  DPR: 3.0  //  COLOR SPACE: sRGB  //  PRESENTATION BOARD V1.0</text>
  <text x="2320" y="50" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,sans-serif" font-size="9" font-weight="800" fill="${t.textSubtle}" letter-spacing="1.5" text-anchor="end" opacity="0.6">FL-W-MOCKUP-PIPELINE</text>

  <!-- Swiss Blueprint Crosshairs -->
  <!-- Top-left -->
  <path d="M 80 70 L 80 90 M 70 80 L 90 80" stroke="${t.accent}" stroke-width="0.75" opacity="0.35"/>
  <!-- Top-right -->
  <path d="M 2320 70 L 2320 90 M 2310 80 L 2330 80" stroke="${t.accent}" stroke-width="0.75" opacity="0.35"/>
  <!-- Bottom-left -->
  <path d="M 80 1510 L 80 1530 M 70 1520 L 90 1520" stroke="${t.accent}" stroke-width="0.75" opacity="0.35"/>
  <!-- Bottom-right -->
  <path d="M 2320 1510 L 2320 1530 M 2310 1520 L 2330 1520" stroke="${t.accent}" stroke-width="0.75" opacity="0.35"/>

  <!-- Vertical glowing accent bar next to title -->
  <rect x="48" y="110" width="3.5" height="150" rx="1.75" fill="url(#accentLine)"/>

  <!-- BRAND CLASSIFICATION Label -->
  <circle cx="52" cy="131" r="4.5" fill="${t.brandGlow}" opacity="0.95"/>
  <text x="66" y="136" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,sans-serif" font-size="11" font-weight="800" fill="${t.accent}" letter-spacing="4.5">SELECTED WORK</text>

  <!-- Title Card — Serif elegance with precise spacing -->
  <text x="48" y="320" font-family="Georgia,Times New Roman,serif" font-size="94" font-weight="700" fill="${t.text}" letter-spacing="-2.5" opacity="0.98">${x(nameLine1)}</text>
  ${nameLine2 ? `<text x="48" y="426" font-family="Georgia,Times New Roman,serif" font-size="94" font-weight="700" fill="${t.text}" letter-spacing="-2.5" opacity="0.98">${x(nameLine2)}</text>` : ''}

  <!-- Minimal Decorative Divider -->
  <rect x="48" y="466" width="240" height="2" rx="1" fill="${t.accent}" opacity="0.55"/>

  <!-- Tagline -->
  ${taglineLines.map((line, i) => `<text x="48" y="${512 + i * 36}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,sans-serif" font-size="19" font-weight="500" fill="${t.textMuted}" letter-spacing="0.2" opacity="0.9">${x(line)}</text>`).join('\n  ')}

  <!-- ── Glassmorphic Specifications Container Card ──────────────────────── -->
  <!-- Backdrop glass card -->
  <rect x="48" y="562" width="480" height="740" rx="16" fill="${t.card}" opacity="0.72" stroke="${t.cardBorder}" stroke-width="1.25"/>
  <!-- Highlights and labels inside card -->
  <rect x="48" y="562" width="480" height="1" fill="#ffffff" opacity="0.45"/>
  
  <text x="76" y="598" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,sans-serif" font-size="10.5" font-weight="800" fill="${t.textSubtle}" letter-spacing="3">CORE DISTILLED INTELLIGENCE</text>
  
  <!-- Feature Pills Panel (rendered inside card coords) -->
  ${pillsHtml}

  <!-- SPECIFICATIONS label -->
  <text x="76" y="806" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,sans-serif" font-size="10.5" font-weight="800" fill="${t.textSubtle}" letter-spacing="3">ARCHITECTURE &amp; SPECS</text>

  <!-- Spec List Table -->
  ${deliverablesHtml}

  <!-- Technical spec details in card footer -->
  <text x="76" y="1256" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,sans-serif" font-size="11" font-weight="700" fill="${t.textSubtle}" letter-spacing="1">DPR: 3.0 (ACCENT) // PIPELINE v1.0.0</text>

  <!-- Grounding details -->
  <text x="48" y="${H - 60}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,sans-serif" font-size="11" font-weight="700" fill="${t.textSubtle}" letter-spacing="2.5">${x(slug.toUpperCase())} · ${x(date)}</text>
  <text x="48" y="${H - 38}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,sans-serif" font-size="11" font-weight="700" fill="${t.textSubtle}" letter-spacing="2.5" opacity="0.45">CASE STUDY PRESENTATION PORTFOLIO</text>

  <!-- Modern Corner Badge -->
  <rect x="${W - 240}" y="48" width="192" height="40" rx="6" fill="${t.badge}" opacity="0.95"/>
  <text x="${W - 144}" y="73" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,sans-serif" font-size="11" font-weight="800" fill="${t.badgeText}" text-anchor="middle" letter-spacing="3">PORTFOLIO ENTRY</text>

  <!-- ═══ Realistic Floating Drop Shadows ═══ -->
  <!-- Shadow for Laptop -->
  <ellipse cx="1400" cy="1220" rx="760" ry="32" fill="url(#deviceShadow)"/>
  <!-- Shadow for Mobile -->
  <ellipse cx="2100" cy="1440" rx="200" ry="16" fill="url(#mobileShadow)"/>
</svg>`;

  // Rasterize text layer
  const textLayerBuf = await sharp(Buffer.from(textLayerSVG))
    .resize(W, H, { fit: 'fill' })
    .png()
    .toBuffer();

  // ── STAGE 2: Resize device mockups and composite over text layer ──────────

  // Laptop: large and centered beautifully on the right panel
  const laptopTargetW = 1680, laptopTargetH = 1120;
  const laptopBuf = await sharp(laptopMockupPath)
    .resize(laptopTargetW, laptopTargetH, {
      fit: 'contain',
      position: 'center',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer();

  const composites = [
    { input: laptopBuf, left: 560, top: 110 },
  ];

  // Mobile: overlaps laptop hinge and bezels on bottom-right, scaled perfectly
  if (mobileMockupPath && fs.existsSync(mobileMockupPath)) {
    const mobileBuf = await sharp(mobileMockupPath)
      .resize(440, 954, {
        fit: 'contain',
        position: 'center',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        kernel: sharp.kernel.lanczos3,
      })
      .png()
      .toBuffer();
    composites.push({ input: mobileBuf, left: 1880, top: 520 });
  }

  // Final composite: text layer + backlit glows + shadows first, then devices on top
  await sharp(textLayerBuf)
    .composite(composites)
    .png({ compressionLevel: 8 })
    .toFile(outputPath);

  return outputPath;
}

module.exports = { generateCover };
