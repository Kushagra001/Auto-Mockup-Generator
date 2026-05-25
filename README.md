# <p align="center"><img src="assets/banner.svg" width="100%"></p>

<p align="center">
  <a href="https://github.com/Kushagra001/Auto-Mockup-Generator">
    <img src="https://img.shields.io/github/stars/Kushagra001/Auto-Mockup-Generator?style=for-the-badge&color=FFE15D&logo=github" alt="Stars">
  </a>
  <a href="https://github.com/Kushagra001/Auto-Mockup-Generator/issues">
    <img src="https://img.shields.io/github/issues/Kushagra001/Auto-Mockup-Generator?style=for-the-badge&color=FF6464&logo=github" alt="Issues">
  </a>
  <a href="https://github.com/Kushagra001/Auto-Mockup-Generator/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/Kushagra001/Auto-Mockup-Generator?style=for-the-badge&color=98D8AA" alt="License">
  </a>
</p>

<p align="center">
  <b>An automated, premium presentation-board generation pipeline. It captures live viewports, mathematically extracts their exact color DNA, and skins high-fidelity case study layouts dynamically.</b>
</p>

---

## 📸 Dynamic Presentation Gallery

### 🖤 Arca Studio (Hyper-Minimalist Monochrome)
> **Mathematical Essence:** Matte charcoal, cold white, minimal grid structure.

<p align="center">
  <img src="assets/arca-studio_cover_light.png" width="48%" />
  <img src="assets/arca-studio_cover_dark.png" width="48%" />
</p>

### 💛 Axiom Strategy (Luxury Gold & Cream)
> **Mathematical Essence:** Warm champagne background, deep walnut text, premium luxury gold glowing highlights.

<p align="center">
  <img src="assets/axiom-strategy_cover_light.png" width="48%" />
  <img src="assets/axiom-strategy_cover_dark.png" width="48%" />
</p>

### 💙 Flow (High-End Vibrant Cyan & Dark Purple)
> **Mathematical Essence:** Faint outline Georgia watermark `"FLOW"`, glassmorphic specification cards.

<p align="center">
  <img src="assets/fl-w_cover_light.png" width="48%" />
  <img src="assets/fl-w_cover_dark.png" width="48%" />
</p>

---

## ⚡ Animated Pipeline Status

<p align="center">
  <img src="assets/status.svg" width="400">
</p>

---

## ✨ Features DNA

* **🎨 Algorithmic Color Extraction:** Crawls CSS values from pages, calculates contrasting text/panel tones, and outputs custom balanced glowing themes automatically.
* **🕵️ Self-Healing Viewport settling:** Injects runtime style rules to freeze Framer Motion transitions, GSAP scrolls, and layout-delay shifts.
* **📱 Unified Responsive Layouts:** Automatically stacks, centers, and clusters high-fidelity laptop and mobile frames in unified composite slide decks.

---

## 🛠️ Step-by-Step Execution

1. **Install dependencies:**
   ```bash
   npm install
   npx playwright install chromium
   ```

2. **Run Pipeline:**
   ```bash
   node scripts/generate.js \
     --url "https://arca-studio.vercel.app/" \
     --name "Arca Studio" \
     --tagline "We build what others can't." \
     --features "Bespoke Web Development, Automation & Integrations" \
     --deliverables "Next.js Development, Tailwind & UI Styling, Framer Motion" \
     --theme light
   ```
