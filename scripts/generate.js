'use strict';

/**
 * generate.js — CLI Orchestrator
 *
 * Usage:
 *   node scripts/generate.js --url https://example.com
 *   node scripts/generate.js \
 *     --url https://example.com \
 *     --name "ProjectName" \
 *     --tagline "Short description." \
 *     --features "Feat1,Feat2,Feat3" \
 *     --deliverables "Web App,Mobile,Dashboard" \
 *     --theme light
 */

const fs       = require('fs');
const path     = require('path');
const archiver = require('archiver');
const chalk    = require('chalk');
const ora      = require('ora');
const sharp    = require('sharp');

const { captureScreenshots }  = require('./capture');
const { compositeIntoFrame, createDualMockup } = require('./composite');
const { generateCover }       = require('./cover');
const { generateSectionMockup } = require('./sections');

// ─── CLI arg parser ───────────────────────────────────────────────────────────

function arg(name, fallback = null) {
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : fallback;
}

// ─── Slug & date helpers ──────────────────────────────────────────────────────

function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project';
}

function dateStamp() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
}

// ─── ZIP helper ───────────────────────────────────────────────────────────────

function zipDirectory(sourceDir, outZip) {
  return new Promise((resolve, reject) => {
    const output  = fs.createWriteStream(outZip);
    const archive = archiver('zip', { zlib: { level: 6 } });
    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(sourceDir, path.basename(sourceDir));
    archive.finalize();
  });
}

// ─── Social crop helper ───────────────────────────────────────────────────────

async function cropCenter(inputPath, w, h, outputPath) {
  const meta = await sharp(inputPath).metadata();
  const sw = meta.width, sh = meta.height;
  const scale = Math.max(w / sw, h / sh);
  const rw = Math.round(sw * scale), rh = Math.round(sh * scale);
  const left = Math.round((rw - w) / 2), top = Math.round((rh - h) / 2);
  await sharp(inputPath)
    .resize(rw, rh, { kernel: sharp.kernel.lanczos3 })
    .extract({ left, top, width: w, height: h })
    .png({ compressionLevel: 8 })
    .toFile(outputPath);
}

// ─── Step logger ─────────────────────────────────────────────────────────────

function stepLog(num, label) {
  console.log('\n' + chalk.bold.cyan(`  ┌─ STEP ${num} `) + chalk.bold(label));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(chalk.bold.white('\n  ╔══════════════════════════════════════════╗'));
  console.log(chalk.bold.white('  ║      MOCKUP PIPELINE  ·  v1.0.0          ║'));
  console.log(chalk.bold.white('  ╚══════════════════════════════════════════╝\n'));

  const url          = arg('--url');
  const name         = arg('--name',         'Project');
  const tagline      = arg('--tagline',      'A premium digital product.');
  const featuresRaw  = arg('--features',     '');
  const delivRaw     = arg('--deliverables', '');
  const theme        = arg('--theme',        'light');

  if (!url) {
    console.error(chalk.red('  ✗ Missing --url argument\n'));
    console.error(chalk.gray('  Usage: node scripts/generate.js --url https://example.com\n'));
    process.exit(1);
  }

  const features     = featuresRaw  ? featuresRaw.split(',').map(f => f.trim()).filter(Boolean) : [];
  const deliverables = delivRaw     ? delivRaw.split(',').map(d => d.trim()).filter(Boolean)     : [];
  const slug         = toSlug(name);
  const date         = dateStamp();
  const runDir       = path.join(__dirname, '..', 'output', `${slug}-${date}`);
  const screenshotsDir = path.join(runDir, 'screenshots');
  const mockupsDir     = path.join(runDir, 'mockups');

  fs.mkdirSync(screenshotsDir, { recursive: true });
  fs.mkdirSync(mockupsDir,     { recursive: true });

  console.log(chalk.gray(`  URL    : ${url}`));
  console.log(chalk.gray(`  Name   : ${name}`));
  console.log(chalk.gray(`  Slug   : ${slug}`));
  console.log(chalk.gray(`  Theme  : ${theme}`));
  console.log(chalk.gray(`  Output : ${runDir}\n`));

  // ── STEP 1: Screenshots ──────────────────────────────────────────────────
  stepLog(1, 'Capturing screenshots');
  const spinner1 = ora({ text: 'Launching browser…', color: 'cyan', spinner: 'dots' }).start();
  let shots;
  try {
    shots = await captureScreenshots(url, screenshotsDir, slug);
    spinner1.succeed(chalk.green(`Captured ${2 + shots.laptopSections.length + shots.mobileSections.length} screenshots`));
  } catch (err) {
    spinner1.fail(chalk.red('Screenshot capture failed'));
    console.error(chalk.red('  Error: ' + err.message));
    throw err;
  }

  // Build options including the dynamically extracted brand color palette
  const palette = shots.palette;
  const opts = { name, tagline, features, deliverables, theme, slug, date, palette };

  // ── STEP 2: Device frame compositing ────────────────────────────────────
  stepLog(2, 'Compositing device frames');
  const spinner2 = ora({ text: 'Rendering frames…', color: 'cyan', spinner: 'dots' }).start();
  const laptopMockup = path.join(mockupsDir, `${slug}_laptop_mockup.png`);
  const mobileMockup = path.join(mockupsDir, `${slug}_mobile_mockup.png`);
  const dualMockup   = path.join(mockupsDir, `${slug}_dual_mockup.png`);
  try {
    await compositeIntoFrame(shots.laptopHero, 'laptop', laptopMockup);
    await compositeIntoFrame(shots.mobileHero, 'mobile', mobileMockup);
    await createDualMockup(laptopMockup, mobileMockup, dualMockup);
    spinner2.succeed(chalk.green('Device mockups created'));
  } catch (err) {
    spinner2.fail(chalk.red('Compositing failed'));
    console.error(chalk.red('  Error: ' + err.message));
    throw err;
  }

  // ── STEP 3: Cover boards ─────────────────────────────────────────────────
  stepLog(3, 'Generating cover boards');
  const spinner3 = ora({ text: 'Building cover SVG…', color: 'cyan', spinner: 'dots' }).start();
  const coverLight = path.join(mockupsDir, `${slug}_cover_light.png`);
  const coverDark  = path.join(mockupsDir, `${slug}_cover_dark.png`);
  try {
    await generateCover({ ...opts, theme: 'light' }, laptopMockup, mobileMockup, coverLight);
    await generateCover({ ...opts, theme: 'dark'  }, laptopMockup, mobileMockup, coverDark);
    spinner3.succeed(chalk.green('Cover boards rendered (light + dark)'));
  } catch (err) {
    spinner3.fail(chalk.red('Cover generation failed'));
    console.error(chalk.red('  Error: ' + err.message));
    throw err;
  }

  // ── STEP 4: Individual section mockup boards ──────────────────────────────
  stepLog(4, 'Generating individual section mockups');
  const spinner4 = ora({ text: 'Generating section mockups…', color: 'cyan', spinner: 'dots' }).start();
  let sectionsGenerated = 0;
  const maxSecToGenerate = Math.max(shots.laptopSections.length, shots.mobileSections.length);
  
  try {
    if (maxSecToGenerate > 0) {
      const totalSections = maxSecToGenerate;
      for (let i = 1; i <= totalSections; i++) {
        const laptopSecPath = shots.laptopSections[i - 1] || null;
        const mobileSecPath = shots.mobileSections[i - 1] || null;
        
        const sectionLightPath = path.join(mockupsDir, `${slug}_section_${i}_light.png`);
        const sectionDarkPath  = path.join(mockupsDir, `${slug}_section_${i}_dark.png`);
        
        await generateSectionMockup({ ...opts, theme: 'light', totalSections }, i, laptopSecPath, mobileSecPath, sectionLightPath);
        await generateSectionMockup({ ...opts, theme: 'dark',  totalSections }, i, laptopSecPath, mobileSecPath, sectionDarkPath);
        sectionsGenerated++;
      }
      spinner4.succeed(chalk.green(`Generated ${sectionsGenerated} responsive section mockups (both light & dark)`));
    } else {
      spinner4.warn(chalk.yellow('No section screenshots captured. Skipped individual section mockups.'));
    }
  } catch (err) {
    spinner4.fail(chalk.red('Section mockups generation failed: ' + err.message));
  }

  // ── STEP 5: Social crops ─────────────────────────────────────────────────
  stepLog(5, 'Creating social crops');
  const spinner5 = ora({ text: 'Cropping…', color: 'cyan', spinner: 'dots' }).start();
  const ogPath    = path.join(mockupsDir, `${slug}_og_1200x630.png`);
  const thumbPath = path.join(mockupsDir, `${slug}_thumb_800x800.png`);
  try {
    await cropCenter(coverLight, 1200, 630, ogPath);
    await cropCenter(coverLight, 800,  800, thumbPath);
    spinner5.succeed(chalk.green('OG image (1200×630) and thumbnail (800×800) created'));
  } catch (err) {
    spinner5.fail(chalk.red('Social crops failed: ' + err.message));
  }

  // ── STEP 6: ZIP packaging ────────────────────────────────────────────────
  stepLog(6, 'Packaging ZIP');
  const spinner6 = ora({ text: 'Compressing…', color: 'cyan', spinner: 'dots' }).start();
  const zipPath = path.join(__dirname, '..', 'output', `${slug}-mockups-${date}.zip`);
  try {
    await zipDirectory(runDir, zipPath);
    const zipSizeMB = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(1);
    spinner6.succeed(chalk.green(`ZIP created · ${zipSizeMB} MB`));
  } catch (err) {
    spinner6.fail(chalk.red('ZIP packaging failed: ' + err.message));
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('\n' + chalk.bold.white('  ╔══════════════════════════════════════════╗'));
  console.log(chalk.bold.white('  ║               OUTPUT SUMMARY              ║'));
  console.log(chalk.bold.white('  ╚══════════════════════════════════════════╝'));
  const files = [
    ['Laptop Mockup',     `${slug}_laptop_mockup.png`],
    ['Mobile Mockup',     `${slug}_mobile_mockup.png`],
    ['Dual Mockup',       `${slug}_dual_mockup.png`],
    ['Cover Light',       `${slug}_cover_light.png`],
    ['Cover Dark',        `${slug}_cover_dark.png`],
  ];
  for (let i = 1; i <= sectionsGenerated; i++) {
    files.push([`Section ${i} Light`, `${slug}_section_${i}_light.png`]);
    files.push([`Section ${i} Dark`,  `${slug}_section_${i}_dark.png`]);
  }
  files.push(
    ['OG Image 1200×630', `${slug}_og_1200x630.png`],
    ['Thumb 800×800',     `${slug}_thumb_800x800.png`]
  );
  for (const [label, file] of files) {
    const full = path.join(mockupsDir, file);
    const exists = fs.existsSync(full);
    const sizeMB = exists ? (fs.statSync(full).size / 1024 / 1024).toFixed(1) + ' MB' : '—';
    const icon = exists ? chalk.green('✓') : chalk.red('✗');
    console.log(`  ${icon}  ${chalk.gray(label.padEnd(22))} ${chalk.white(sizeMB)}`);
  }
  console.log(`\n  ${chalk.cyan('📦')} ZIP: ${chalk.white(zipPath)}`);
  console.log(`  ${chalk.cyan('📁')} Run: ${chalk.white(runDir)}\n`);
}

main().catch(err => {
  console.error(chalk.red('\n  ✗ Pipeline failed: ' + err.message));
  console.error(chalk.gray(err.stack));
  process.exit(1);
});
