'use strict';

/**
 * composite.js — Sharp image compositing
 *
 * compositeIntoFrame:
 *   1. Resize screenshot to fill the screen opening
 *   2. Rasterize frame SVG (screen area = alpha=0)
 *   3. Create canvas: place screenshot at screen coords, composite frame on top
 *      (frame surrounds the screenshot because screen is transparent)
 *
 * createDualMockup: laptop + mobile side-by-side on transparent canvas
 */

const path  = require('path');
const sharp = require('sharp');
const { laptopFrameSVG, mobileFrameSVG, SCREEN_AREAS } = require('./frames');

async function compositeIntoFrame(screenshotPath, deviceType, outputPath) {
  const area   = SCREEN_AREAS[deviceType];
  const svgStr = deviceType === 'laptop' ? laptopFrameSVG() : mobileFrameSVG();

  // 1. Resize screenshot to fit screen opening exactly
  const screenBuf = await sharp(screenshotPath)
    .resize(area.w, area.h, { fit: 'cover', position: 'top', kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();

  // 2. Rasterize frame at native resolution (screen area is alpha=0)
  const frameBuf = await sharp(Buffer.from(svgStr))
    .resize(area.totalW, area.totalH, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();

  // 3. Compose: transparent canvas → screenshot at screen coords → frame on top
  //    The frame's alpha=0 screen opening lets the screenshot show through
  await sharp({
    create: {
      width:      area.totalW,
      height:     area.totalH,
      channels:   4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    }
  })
  .composite([
    { input: screenBuf, left: area.x, top: area.y },  // screenshot behind
    { input: frameBuf,  left: 0,      top: 0      },  // frame on top (screen area transparent)
  ])
  .png()
  .toFile(outputPath);

  return outputPath;
}

// ─── Dual mockup (laptop + mobile side-by-side) ───────────────────────────────

async function createDualMockup(laptopMockupPath, mobileMockupPath, outputPath) {
  const lA = SCREEN_AREAS.laptop;
  const mA = SCREEN_AREAS.mobile;

  // Scale mobile to 62% of laptop height
  const mScale = (lA.totalH * 0.62) / mA.totalH;
  const mW     = Math.round(mA.totalW * mScale);
  const mH     = Math.round(mA.totalH * mScale);

  // Canvas: laptop + mobile overlapping by 40px, 40px bottom padding
  const gap      = -40;
  const canvasW  = lA.totalW + mW + gap;
  const canvasH  = Math.max(lA.totalH, mH) + 60;
  const mobileTop = canvasH - mH - 20;

  const laptopBuf = await sharp(laptopMockupPath)
    .resize(lA.totalW, lA.totalH, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
    .png().toBuffer();
  const mobileBuf = await sharp(mobileMockupPath)
    .resize(mW, mH, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
    .png().toBuffer();

  await sharp({
    create: { width: canvasW, height: canvasH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  })
  .composite([
    { input: laptopBuf, left: 0,               top: 0         },
    { input: mobileBuf, left: lA.totalW + gap, top: mobileTop },
  ])
  .png()
  .toFile(outputPath);

  return outputPath;
}

module.exports = { compositeIntoFrame, createDualMockup };
