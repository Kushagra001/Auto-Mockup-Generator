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
  const spinner1 = ora({ text: 'Launching browser and crawling…', color: 'cyan', spinner: 'dots' }).start();
  let pagesResult;
  try {
    pagesResult = await captureScreenshots(url, screenshotsDir, slug);
    spinner1.succeed(chalk.green(`Captured screenshots for ${pagesResult.length} pages`));
  } catch (err) {
    spinner1.fail(chalk.red('Screenshot capture failed'));
    console.error(chalk.red('  Error: ' + err.message));
    throw err;
  }

  // Use the homepage's palette as the base brand palette for brand consistency
  const homePage = pagesResult.find(p => p.pageSlug === '') || pagesResult[0];
  const brandPalette = homePage.palette;

  // Track all generated mockups for output summary
  const summaryFiles = [];

  // Loop over discovered pages
  for (let pIdx = 0; pIdx < pagesResult.length; pIdx++) {
    const pageRes = pagesResult[pIdx];
    const pageSlug = pageRes.pageSlug;
    const pageUrl = pageRes.url;
    const isHome = pageSlug === '';
    const displaySlug = isHome ? 'home' : pageSlug;

    console.log(chalk.bold.magenta(`\n  ══════════════════════════════════════════════════`));
    console.log(chalk.bold.magenta(`  PAGE ${pIdx + 1}/${pagesResult.length}: ${displaySlug.toUpperCase()} (${pageUrl})`));
    console.log(chalk.bold.magenta(`  ══════════════════════════════════════════════════`));

    const suffix = isHome ? '' : `_${pageSlug}`;
    const pageName = isHome ? name : `${name} · ${pageSlug.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`;
    const pageTagline = isHome ? tagline : `Premium interface for the ${pageSlug.replace(/_/g, ' ')} section of ${name}.`;

    // Construct the options for cover and section boards
    // Keep consistent palette across all slides
    const opts = { 
      name: pageName, 
      tagline: pageTagline, 
      features, 
      deliverables, 
      theme, 
      slug, 
      date, 
      palette: brandPalette 
    };

    // ── STEP 2: Device frame compositing ────────────────────────────────────
    stepLog(2, `Compositing device frames for ${displaySlug}`);
    const spinner2 = ora({ text: 'Rendering frames…', color: 'cyan', spinner: 'dots' }).start();
    const laptopMockup = path.join(mockupsDir, `${slug}${suffix}_laptop_mockup.png`);
    const mobileMockup = path.join(mockupsDir, `${slug}${suffix}_mobile_mockup.png`);
    const dualMockup   = path.join(mockupsDir, `${slug}${suffix}_dual_mockup.png`);
    try {
      await compositeIntoFrame(pageRes.laptopHero, 'laptop', laptopMockup);
      await compositeIntoFrame(pageRes.mobileHero, 'mobile', mobileMockup);
      await createDualMockup(laptopMockup, mobileMockup, dualMockup);
      spinner2.succeed(chalk.green(`Device mockups created for ${displaySlug}`));
      summaryFiles.push([`${displaySlug.toUpperCase()} Laptop Mockup`, `${slug}${suffix}_laptop_mockup.png`]);
      summaryFiles.push([`${displaySlug.toUpperCase()} Mobile Mockup`, `${slug}${suffix}_mobile_mockup.png`]);
      summaryFiles.push([`${displaySlug.toUpperCase()} Dual Mockup`,   `${slug}${suffix}_dual_mockup.png`]);
    } catch (err) {
      spinner2.fail(chalk.red(`Compositing failed for ${displaySlug}`));
      console.error(chalk.red('  Error: ' + err.message));
      throw err;
    }

    // ── STEP 3: Cover boards ─────────────────────────────────────────────────
    stepLog(3, `Generating cover boards for ${displaySlug}`);
    const spinner3 = ora({ text: 'Building cover SVG…', color: 'cyan', spinner: 'dots' }).start();
    const coverLight = path.join(mockupsDir, `${slug}${suffix}_cover_light.png`);
    const coverDark  = path.join(mockupsDir, `${slug}${suffix}_cover_dark.png`);
    try {
      await generateCover({ ...opts, theme: 'light' }, laptopMockup, mobileMockup, coverLight);
      await generateCover({ ...opts, theme: 'dark'  }, laptopMockup, mobileMockup, coverDark);
      spinner3.succeed(chalk.green(`Cover boards rendered for ${displaySlug} (light + dark)`));
      summaryFiles.push([`${displaySlug.toUpperCase()} Cover Light`, `${slug}${suffix}_cover_light.png`]);
      summaryFiles.push([`${displaySlug.toUpperCase()} Cover Dark`,  `${slug}${suffix}_cover_dark.png`]);
    } catch (err) {
      spinner3.fail(chalk.red(`Cover generation failed for ${displaySlug}`));
      console.error(chalk.red('  Error: ' + err.message));
      throw err;
    }

    // ── STEP 4: Individual section mockup boards ──────────────────────────────
    stepLog(4, `Generating individual section mockups for ${displaySlug}`);
    const spinner4 = ora({ text: 'Generating section mockups…', color: 'cyan', spinner: 'dots' }).start();
    let sectionsGenerated = 0;
    const maxSecToGenerate = Math.max(pageRes.laptopSections.length, pageRes.mobileSections.length);
    
    try {
      if (maxSecToGenerate > 0) {
        const totalSections = maxSecToGenerate;
        for (let i = 1; i <= totalSections; i++) {
          const laptopSecPath = pageRes.laptopSections[i - 1] || null;
          const mobileSecPath = pageRes.mobileSections[i - 1] || null;
          
          const sectionLightPath = path.join(mockupsDir, `${slug}${suffix}_section_${i}_light.png`);
          const sectionDarkPath  = path.join(mockupsDir, `${slug}${suffix}_section_${i}_dark.png`);
          
          await generateSectionMockup({ ...opts, theme: 'light', totalSections }, i, laptopSecPath, mobileSecPath, sectionLightPath);
          await generateSectionMockup({ ...opts, theme: 'dark',  totalSections }, i, laptopSecPath, mobileSecPath, sectionDarkPath);
          sectionsGenerated++;
          summaryFiles.push([`${displaySlug.toUpperCase()} Section ${i} Light`, `${slug}${suffix}_section_${i}_light.png`]);
          summaryFiles.push([`${displaySlug.toUpperCase()} Section ${i} Dark`,  `${slug}${suffix}_section_${i}_dark.png`]);
        }
        spinner4.succeed(chalk.green(`Generated ${sectionsGenerated} responsive section mockups for ${displaySlug} (both light & dark)`));
      } else {
        spinner4.warn(chalk.yellow(`No section screenshots captured for ${displaySlug}. Skipped section mockups.`));
      }
    } catch (err) {
      spinner4.fail(chalk.red(`Section mockups generation failed for ${displaySlug}: ` + err.message));
    }

    // ── STEP 5: Social crops ─────────────────────────────────────────────────
    stepLog(5, `Creating social crops for ${displaySlug}`);
    const spinner5 = ora({ text: 'Cropping…', color: 'cyan', spinner: 'dots' }).start();
    const ogPath    = path.join(mockupsDir, `${slug}${suffix}_og_1200x630.png`);
    const thumbPath = path.join(mockupsDir, `${slug}${suffix}_thumb_800x800.png`);
    try {
      await cropCenter(coverLight, 1200, 630, ogPath);
      await cropCenter(coverLight, 800,  800, thumbPath);
      spinner5.succeed(chalk.green(`OG image (1200×630) and thumbnail (800×800) created for ${displaySlug}`));
      summaryFiles.push([`${displaySlug.toUpperCase()} OG 1200x630`, `${slug}${suffix}_og_1200x630.png`]);
      summaryFiles.push([`${displaySlug.toUpperCase()} Thumb 800x800`, `${slug}${suffix}_thumb_800x800.png`]);
    } catch (err) {
      spinner5.fail(chalk.red(`Social crops failed for ${displaySlug}: ` + err.message));
    }
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
  
  for (const [label, file] of summaryFiles) {
    const full = path.join(mockupsDir, file);
    const exists = fs.existsSync(full);
    const sizeMB = exists ? (fs.statSync(full).size / 1024 / 1024).toFixed(1) + ' MB' : '—';
    const icon = exists ? chalk.green('✓') : chalk.red('✗');
    console.log(`  ${icon}  ${chalk.gray(label.padEnd(30))} ${chalk.white(sizeMB)}`);
  }
  console.log(`\n  ${chalk.cyan('📦')} ZIP: ${chalk.white(zipPath)}`);
  console.log(`  ${chalk.cyan('📁')} Run: ${chalk.white(runDir)}\n`);
}

main().catch(err => {
  console.error(chalk.red('\n  ✗ Pipeline failed: ' + err.message));
  console.error(chalk.gray(err.stack));
  process.exit(1);
});
