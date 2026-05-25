# 🚀 Auto-Mockup-Generator

An automated, ultra-premium case study presentation and device mockup generation pipeline. It captures live websites, mathematically extracts their color scheme, and dynamically skins beautiful responsive presentation boards.

---

## ✨ Key Features

- 🎨 **Dynamic Brand Color-Theming:** Mathematically extracts primary backgrounds, texts, and CTA button colors from live sites to coordinate a bespoke luxury light/dark palette.
- 📸 **Self-Healing Automation:** Automatically injects standard sheets to disable layout shifts, Framer Motion delays, GSAP, and complex scrolling transitions. Captures pixel-perfect screenshots only after scroll-lazy loads settle.
- 💻📱 **Responsive Section Clustering:** Renders separate, clean mockup templates per section showcasing both laptop and mobile viewport variations.
- 🌟 **Premium Presentation Layouts:** Glassmorphic specification cards, outline watermark backdrops, technical Swiss typography grid system, and realistic floating 3D shadows.
- 📦 **One-Command Packaging:** Automated social cropping (1200×630 OG, 800×800 Thumbnail) and ZIP packaging.

---

## 🛠️ Installation & Setup

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```
2. **Install Playwright browser binaries:**
   ```bash
   npx playwright install chromium
   ```

---

## 🚀 Usage

Execute the pipeline orchestrator with custom site metadata:

```bash
node scripts/generate.js \
  --url "https://arca-studio.vercel.app/" \
  --name "Arca Studio" \
  --tagline "We build what others can't." \
  --features "Bespoke Web Development, Automation & Integrations, CMS & Content Systems" \
  --deliverables "Next.js Development, Tailwind & UI Styling, Framer Motion & GSAP" \
  --theme light
```

---

## 📁 Output Structure

All generated boards compile into `output/[project-name]-[date]`:

```
output/[project-slug]-[date]/
├── screenshots/                     # 12 Raw laptop & mobile viewport captures
└── mockups/
    ├── [slug]_cover_light.png       # Premium light mode presentation board
    ├── [slug]_cover_dark.png        # Premium dark mode presentation board
    ├── [slug]_laptop_mockup.png     # Floating composite laptop mockup
    ├── [slug]_mobile_mockup.png     # Floating composite mobile mockup
    ├── [slug]_dual_mockup.png       # Grouped laptop & mobile mockup
    ├── [slug]_section_[N]_light.png # Harmonized responsive light sections
    ├── [slug]_section_[N]_dark.png  # Harmonized responsive dark sections
    ├── [slug]_og_1200x630.png       # Optimized LinkedIn/Twitter social card
    └── [slug]_thumb_800x800.png     # Square portfolio thumbnail card
```
