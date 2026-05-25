# <p align="center"><svg width="100%" height="200" viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="background: linear-gradient(135deg, #0f0c20 0%, #15102a 50%, #06020f 100%); border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);"><defs><linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FFE15D"/><stop offset="100%" stop-color="#FF6464"/></linearGradient><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/></pattern></defs><rect width="800" height="200" rx="12" fill="url(#grid)"/><circle cx="100" cy="100" r="150" fill="#FF6464" opacity="0.05" filter="blur(40px)"/><circle cx="700" cy="100" r="120" fill="#FFE15D" opacity="0.05" filter="blur(40px)"/><text x="50%" y="95" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" fill="url(#textGrad)" text-anchor="middle" letter-spacing="1.5">AUTO-MOCKUP-GENERATOR</text><text x="50%" y="135" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#98D8AA" text-anchor="middle" letter-spacing="3" opacity="0.9">DYNAMIC BRAND-THEMED PRESENTATION PIPELINE</text><path d="M150 160 L650 160" stroke="rgba(255,255,255,0.1)" stroke-width="2" stroke-dasharray="10 5"/></svg></p>

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
  <svg width="400" height="60" viewBox="0 0 400 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="60" rx="10" fill="#0A0A0A"/>
    <circle cx="30" cy="30" r="8" fill="#00FF66">
      <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite"/>
    </circle>
    <text x="50" y="36" fill="#FFFFFF" font-family="Courier New, monospace" font-size="14" font-weight="bold">PIPELINE OPERATIONAL · v1.0.0</text>
  </svg>
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
