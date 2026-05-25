'use strict';

/**
 * sections.js — Overhauled Breathtaking Responsive Section Detail Board Generator (2400×1600px)
 *
 * Lays out desktop and mobile screenshots for a single section onto a premium editorial slide:
 *   - Overlapping dynamic brand-orange and warm-champagne radial mesh glows
 *   - Under-device 3D floating soft radial shadows
 *   - Editorial Georgia typographic backdrop "SEC XX"
 *   - Glassmorphic card containment for descriptions and spec tables
 *   - Swiss-style geometric blueprint crosshairs and border technical metadata
 */

const fs    = require('fs');
const path  = require('path');
const sharp = require('sharp');
const { compositeIntoFrame } = require('./composite');
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

async function generateSectionMockup(opts, sectionIdx, laptopPath, mobilePath, outputPath) {
  const W = 2400, H = 1600;
  const name = opts.name || 'Project';
  
  // Dynamically build a custom, beautifully coordinated theme matching the website's brand colors
  const defaultPalette = name.toLowerCase().includes('axiom')
    ? { bg: 'rgb(250, 247, 242)', text: 'rgb(28, 26, 23)', accent: 'rgb(184, 146, 42)' }
    : { bg: 'rgb(244, 241, 235)', text: 'rgb(28, 26, 23)', accent: 'rgb(240, 90, 40)' };
  const palette = opts.palette || defaultPalette;
  const t = buildCohesiveTheme(palette, opts.theme);
  const slug = opts.slug || 'project';
  const date = opts.date || new Date().getFullYear().toString();
  
  // Format section indices for elegant headings
  const secNumberStr  = String(sectionIdx).padStart(2, '0');
  const totalSections = opts.totalSections || 4;
  const totalSecStr   = String(totalSections).padStart(2, '0');

  // Define temporary folders for framed devices
  const tmpDir = path.join(__dirname, '..', '.tmp');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  
  const tempLaptopMockup = path.join(tmpDir, `tmp_${slug}_sec_${sectionIdx}_laptop.png`);
  const tempMobileMockup = path.join(tmpDir, `tmp_${slug}_sec_${sectionIdx}_mobile.png`);

  let laptopFramed = false;
  let mobileFramed = false;

  try {
    // ── Frame devices dynamically ───────────────────────────────────────────
    if (fs.existsSync(laptopPath)) {
      await compositeIntoFrame(laptopPath, 'laptop', tempLaptopMockup);
      laptopFramed = true;
    }
    
    const hasMobile = mobilePath && fs.existsSync(mobilePath);
    if (hasMobile) {
      await compositeIntoFrame(mobilePath, 'mobile', tempMobileMockup);
      mobileFramed = true;
    }

    if (!laptopFramed) {
      throw new Error(`Laptop section screenshot not found: ${laptopPath}`);
    }

    // ── Grid background lines ───────────────────────────────────────────────
    let gridLines = '';
    for (let gx = 0; gx <= W; gx += 80) {
      gridLines += `<line x1="${gx}" y1="0" x2="${gx}" y2="${H}" stroke="${t.grid}" stroke-width="0.5" opacity="0.045"/>`;
    }
    for (let gy = 0; gy <= H; gy += 80) {
      gridLines += `<line x1="0" y1="${gy}" x2="${W}" y2="${gy}" stroke="${t.grid}" stroke-width="0.5" opacity="0.045"/>`;
    }

    // ── Build SVG frame template ─────────────────────────────────────────────
    const frameSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        <!-- Background Gradient -->
        <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stop-color="${t.bg}"/>
          <stop offset="100%" stop-color="${t.panel}"/>
        </linearGradient>
        
        <!-- Backlit Glow behind devices -->
        <radialGradient id="brandMeshGlow" cx="72%" cy="45%" r="48%">
          <stop offset="0%"   stop-color="${t.brandGlow}"   stop-opacity="0.20"/>
          <stop offset="60%"  stop-color="${t.brandGlow}"   stop-opacity="0.04"/>
          <stop offset="100%" stop-color="${t.bg}"          stop-opacity="0"/>
        </radialGradient>

        <radialGradient id="ambientMeshGlow" cx="62%" cy="50%" r="55%">
          <stop offset="0%"   stop-color="${t.ambientGlow}" stop-opacity="0.40"/>
          <stop offset="60%"  stop-color="${t.ambientGlow}" stop-opacity="0.06"/>
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
        
        <!-- Left Side legibility overlay -->
        <linearGradient id="leftFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stop-color="${t.panel}" stop-opacity="0.75"/>
          <stop offset="35%"  stop-color="${t.panel}" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="${t.panel}" stop-opacity="0"/>
        </linearGradient>
        
        <!-- Glowing brand divider -->
        <linearGradient id="accentLine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="${t.brandGlow}"/>
          <stop offset="100%" stop-color="${t.accentBright}" stop-opacity="0.15"/>
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect x="0" y="0" width="${W}" height="${H}" fill="url(#bgGrad)"/>
      ${gridLines}
      <rect x="0" y="0" width="${W}" height="${H}" fill="url(#ambientMeshGlow)"/>
      <rect x="0" y="0" width="${W}" height="${H}" fill="url(#brandMeshGlow)"/>
      
      <!-- Faint, giant "SEC XX" background editorial typography -->
      <text x="48" y="240" font-family="Georgia,Times New Roman,serif" font-size="230" font-weight="900" fill="${t.accent}" opacity="0.045" letter-spacing="-5">SEC${secNumberStr}</text>

      <rect x="0" y="0" width="680" height="${H}" fill="url(#leftFade)"/>

      <!-- Technical border metadata (blueprint-style) -->
      <text x="80" y="50" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,sans-serif" font-size="9" font-weight="800" fill="${t.textSubtle}" letter-spacing="1.5" opacity="0.6">SCALE: 1:1  //  DPR: 3.0  //  COLOR SPACE: sRGB  //  PRESENTATION BOARD V1.0</text>
      <text x="2320" y="50" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,sans-serif" font-size="9" font-weight="800" fill="${t.textSubtle}" letter-spacing="1.5" text-anchor="end" opacity="0.6">FL-W-MOCKUP-PIPELINE</text>

      <!-- Swiss Blueprint Crosshairs -->
      <path d="M 80 70 L 80 90 M 70 80 L 90 80" stroke="${t.accent}" stroke-width="0.75" opacity="0.35"/>
      <path d="M 2320 70 L 2320 90 M 2310 80 L 2330 80" stroke="${t.accent}" stroke-width="0.75" opacity="0.35"/>
      <path d="M 80 1510 L 80 1530 M 70 1520 L 90 1520" stroke="${t.accent}" stroke-width="0.75" opacity="0.35"/>
      <path d="M 2320 1510 L 2320 1530 M 2310 1520 L 2330 1520" stroke="${t.accent}" stroke-width="0.75" opacity="0.35"/>

      <!-- Vertical accent line -->
      <rect x="48" y="110" width="3.5" height="150" rx="1.75" fill="url(#accentLine)"/>

      <!-- SECTION SPEC Label -->
      <circle cx="52" cy="131" r="4.5" fill="${t.brandGlow}" opacity="0.95"/>
      <text x="66" y="136" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,sans-serif" font-size="11" font-weight="800" fill="${t.accent}" letter-spacing="4.5">SECTION BREAKDOWN</text>

      <!-- Title / Section indices -->
      <text x="48" y="320" font-family="Georgia,Times New Roman,serif" font-size="94" font-weight="700" fill="${t.text}" letter-spacing="-2.5" opacity="0.98">Section ${secNumberStr}</text>
      <text x="48" y="426" font-family="Georgia,Times New Roman,serif" font-size="32" font-weight="400" fill="${t.textMuted}" letter-spacing="-0.5" font-style="italic" opacity="0.95">Responsive Breakpoints</text>

      <!-- Decorative Divider -->
      <rect x="48" y="466" width="240" height="2" rx="1" fill="${t.accent}" opacity="0.55"/>

      <!-- ── Glassmorphic Specifications Container Card ──────────────────────── -->
      <rect x="48" y="562" width="480" height="740" rx="16" fill="${t.card}" opacity="0.72" stroke="${t.cardBorder}" stroke-width="1.25"/>
      <rect x="48" y="562" width="480" height="1" fill="#ffffff" opacity="0.45"/>

      <!-- Description Block inside card -->
      <text x="76" y="608" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,sans-serif" font-size="10.5" font-weight="800" fill="${t.textSubtle}" letter-spacing="3">PROJECT LAYER</text>
      <text x="76" y="644" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,sans-serif" font-size="19" font-weight="600" fill="${t.text}" letter-spacing="0.25" opacity="0.95">${x(name)} Interface Breakdown</text>
      
      <!-- Architectural Specifications Table -->
      <text x="76" y="760" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,sans-serif" font-size="10.5" font-weight="800" fill="${t.textSubtle}" letter-spacing="3">DEVICE SPEC DETAILS</text>
      
      <!-- Table rows -->
      <line x1="76" y1="786" x2="500" y2="786" stroke="${t.cardBorder}" stroke-width="0.75" opacity="0.3"/>
      <circle cx="84" cy="810" r="3" fill="${t.accent}" opacity="0.8"/>
      <text x="100" y="814" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,sans-serif" font-size="13" font-weight="600" fill="${t.text}" letter-spacing="0.5" opacity="0.85">Laptop Desktop View</text>
      <text x="500" y="814" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,sans-serif" font-size="11" font-weight="700" fill="${t.textMuted}" letter-spacing="0.5" text-anchor="end">1440 × 900 (2x)</text>

      <line x1="76" y1="836" x2="500" y2="836" stroke="${t.cardBorder}" stroke-width="0.75" opacity="0.3"/>
      <circle cx="84" cy="860" r="3" fill="${t.accent}" opacity="0.8"/>
      <text x="100" y="864" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,sans-serif" font-size="13" font-weight="600" fill="${t.text}" letter-spacing="0.5" opacity="0.85">Mobile Portrait View</text>
      <text x="500" y="864" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,sans-serif" font-size="11" font-weight="700" fill="${t.textMuted}" letter-spacing="0.5" text-anchor="end">${mobileFramed ? '390 × 844 (3x)' : 'N/A'}</text>
      
      <line x1="76" y1="886" x2="500" y2="886" stroke="${t.cardBorder}" stroke-width="0.75" opacity="0.3"/>

      <text x="76" y="1256" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,sans-serif" font-size="11" font-weight="700" fill="${t.textSubtle}" letter-spacing="1">DPR: 3.0 // ARCHITECTURE SPEC</text>
      
      <!-- Grounding details -->
      <text x="48" y="${H - 60}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,sans-serif" font-size="11" font-weight="700" fill="${t.textSubtle}" letter-spacing="2.5">${x(slug.toUpperCase())} · SECTION ${secNumberStr} OF ${totalSecStr}</text>
      <text x="48" y="${H - 38}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,sans-serif" font-size="11" font-weight="700" fill="${t.textSubtle}" letter-spacing="2.5" opacity="0.45">CASE STUDY RESPONSIVE BOARD</text>

      <!-- Glass Badge (top-right) -->
      <rect x="${W - 240}" y="48" width="192" height="40" rx="6" fill="${t.badge}" opacity="0.95"/>
      <text x="${W - 144}" y="73" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,sans-serif" font-size="11" font-weight="800" fill="${t.badgeText}" text-anchor="middle" letter-spacing="3">SECTION SPEC</text>

      <!-- ═══ Realistic Floating Drop Shadows ═══ -->
      <!-- Shadow for Laptop -->
      <ellipse cx="1400" cy="1220" rx="760" ry="32" fill="url(#deviceShadow)"/>
      <!-- Shadow for Mobile -->
      <ellipse cx="2100" cy="1440" rx="200" ry="16" fill="url(#mobileShadow)"/>
    </svg>`;

    // Rasterize the background SVG layer
    const textLayerBuf = await sharp(Buffer.from(frameSVG))
      .resize(W, H, { fit: 'fill' })
      .png()
      .toBuffer();

    // ── STAGE 2: Resize device mockups and composite over background ──────────
    const composites = [];

    // Laptop placement
    if (laptopFramed) {
      const laptopTargetW = mobileFramed ? 1520 : 1680;
      const laptopTargetH = mobileFramed ? 1013 : 1120;
      const laptopBuf = await sharp(tempLaptopMockup)
        .resize(laptopTargetW, laptopTargetH, {
          fit: 'contain',
          position: 'center',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
          kernel: sharp.kernel.lanczos3,
        })
        .png()
        .toBuffer();

      composites.push({ 
        input: laptopBuf, 
        left: mobileFramed ? 560 : 620, 
        top: mobileFramed ? 180 : 110 
      });
    }

    // Mobile overlay placement (overlaps bottom-right bezel of laptop)
    if (mobileFramed) {
      const mobileBuf = await sharp(tempMobileMockup)
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

    // Combine all and write to output file
    await sharp(textLayerBuf)
      .composite(composites)
      .png({ compressionLevel: 8 })
      .toFile(outputPath);

  } finally {
    // ── CLEANUP: Delete temporary framed devices ────────────────────────────
    try {
      if (fs.existsSync(tempLaptopMockup)) fs.unlinkSync(tempLaptopMockup);
      if (fs.existsSync(tempMobileMockup)) fs.unlinkSync(tempMobileMockup);
    } catch (_) {}
  }

  return outputPath;
}

module.exports = { generateSectionMockup };
