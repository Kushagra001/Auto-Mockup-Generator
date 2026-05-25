<!-- Mirror of AGENTS.md for Claude Code — edit AGENTS.md instead -->

# AGENTS.md — Agentic Framework
> Single source of truth for agent behavior, architecture, MCP wiring, and skill loading.
> Read by: **Antigravity** (v1.20.3+), **Claude Code** (via CLAUDE.md mirror), **VS Code Copilot** (via .github/copilot-instructions.md mirror)

---

## IDE Compatibility

This file is designed to work across all three environments without modification:

| IDE | Reads this file as | Skills path | Notes |
|---|---|---|---|
| **Antigravity** | `AGENTS.md` (native, v1.20.3+) | `.agents/skills/<name>/SKILL.md` | GEMINI.md takes priority if present |
| **Claude Code** | `CLAUDE.md` (mirror) | `.claude/skills/<name>/SKILL.md` | Original skill format |
| **VS Code Copilot** | `.github/copilot-instructions.md` (mirror) | `.github/skills/<name>/SKILL.md` | Requires `chat.useAgentSkills: true` |

The bootstrap (Section 0.1) writes skills to **all three paths simultaneously** so every IDE gets them regardless of which one you open the project in.

---

## 0. Startup Checklist

On every new session, run these steps silently before responding to any task:

1. Check if `skills/registry.json` exists
2. If it does → read it to know what capabilities are active, then skip to step 5
3. **If it does not exist → this is a fresh project. Run the Default Skill Bootstrap (Section 0.1) before doing anything else**
4. Read `mcp.config.json` → know what MCP servers are available
5. Check `.env` exists (do not read it aloud — just confirm it's present)

---

## 0.1 Default Skill Bootstrap

**Trigger:** `skills/registry.json` does not exist in the project root.

This project ships with 5 default skills. On first run, install them all automatically in this order:

```
1. impeccable      — design quality layer (23 commands, anti-pattern rules)
2. caveman         — token compression (~75% output token reduction)
3. design-extract  — extract any website's design system via CLI + MCP
4. browser-harness — self-healing browser automation via CDP
5. open-design     — local-first design workspace (full app, manual setup)
```

**Before running any step, create the required skill directories for all IDEs:**

```bash
mkdir -p .claude/skills
mkdir -p .agents/skills
mkdir -p .github/skills
mkdir -p directives execution skills .tmp
```

Run these steps in sequence. If any step fails, skip it, note the failure, and continue.

---

### Step 1 — impeccable (pbakaus/impeccable)

impeccable ships pre-built bundles for each IDE under `dist/`. Copy the right one per IDE.

```bash
git clone --depth 1 https://github.com/pbakaus/impeccable.git .tmp/impeccable

# Claude Code
cp -r .tmp/impeccable/dist/claude-code/.claude/skills/. .claude/skills/

# Antigravity
mkdir -p .agents/skills/impeccable
cp .tmp/impeccable/dist/claude-code/.claude/skills/impeccable/SKILL.md \
   .agents/skills/impeccable/SKILL.md

# VS Code Copilot
mkdir -p .github/skills/impeccable
cp .tmp/impeccable/dist/claude-code/.claude/skills/impeccable/SKILL.md \
   .github/skills/impeccable/SKILL.md

# Framework directive
cp .tmp/impeccable/dist/claude-code/.claude/skills/impeccable/SKILL.md \
   directives/impeccable.md

rm -rf .tmp/impeccable
```

Register in `skills/registry.json`:
- `capabilities: ["audit_ui", "polish_ui", "critique_design", "craft_feature", "animate_ui", "harden_ui"]`
- `tags: ["design", "frontend", "quality"]`
- `install_method: "prebuilt-bundle"`
- `invoke: "/impeccable <command>"`

---

### Step 2 — caveman (JuliusBrussee/caveman)

```bash
git clone --depth 1 https://github.com/JuliusBrussee/caveman.git .tmp/caveman

# Claude Code
mkdir -p .claude/skills/caveman
cp .tmp/caveman/skills/caveman/SKILL.md .claude/skills/caveman/SKILL.md

# Antigravity
mkdir -p .agents/skills/caveman
cp .tmp/caveman/skills/caveman/SKILL.md .agents/skills/caveman/SKILL.md

# VS Code Copilot
mkdir -p .github/skills/caveman
cp .tmp/caveman/skills/caveman/SKILL.md .github/skills/caveman/SKILL.md

# Framework directive
cp .tmp/caveman/skills/caveman/SKILL.md directives/caveman.md

rm -rf .tmp/caveman
```

Register with:
- `capabilities: ["compress_tokens", "terse_mode", "caveman_mode"]`
- `tags: ["tokens", "efficiency", "communication"]`
- `invoke: "/caveman [lite|full|ultra]"` — say "stop caveman" to disable

---

### Step 3 — design-extract (Manavarya09/design-extract)

design-extract is a Node CLI with a built-in MCP server. Install globally, write slim SKILL.md files for each IDE, then wire the MCP server.

```bash
# Install CLI globally
npm install -g designlang

# Clone for directive source
git clone --depth 1 https://github.com/Manavarya09/design-extract.git .tmp/design-extract
cp .tmp/design-extract/README.md directives/design-extract.md

# Write a slim SKILL.md to each IDE skill folder
SKILL_BODY='---
name: design-extract
description: Extract any website complete design system. Outputs DTCG tokens, typography, spacing, colors, layout, and WCAG scores. Exposes an MCP server for agent access.
---

# design-extract

Extract a site full design system with one command.

## Usage
designlang <url>                 # full extraction (17+ output files)
designlang grade <url>           # design report card + SVG badge
designlang battle <url1> <url2>  # head-to-head comparison
designlang clone <url>           # working Next.js starter
designlang mcp                   # start MCP server

## When to use
Any time you need to match, reference, or audit a website visual design system before building UI.'

for dir in .claude/skills/design-extract .agents/skills/design-extract .github/skills/design-extract; do
  mkdir -p "$dir"
  printf '%s
' "$SKILL_BODY" > "$dir/SKILL.md"
done

rm -rf .tmp/design-extract
```

Add to `mcp.config.json` under `"servers"`:
```json
"design-extract": {
  "type": "stdio",
  "command": "designlang",
  "args": ["mcp"],
  "env_required": [],
  "skills_that_use_this": ["design-extract"],
  "status": "active"
}
```

Register with:
- `capabilities: ["extract_design_system", "grade_design", "clone_site_design", "compare_designs", "audit_wcag"]`
- `tags: ["design", "tokens", "css", "extraction", "mcp"]`
- `invoke: "designlang <url>"`

---

### Step 4 — browser-harness (browser-use/browser-harness)

browser-harness is a Python package. Install it, then distribute its SKILL.md to all IDE paths.

```bash
# Install Python package
pip install browser-harness --break-system-packages 2>/dev/null || pip install browser-harness

# Clone for SKILL.md
git clone --depth 1 https://github.com/browser-use/browser-harness.git .tmp/browser-harness

# Claude Code
mkdir -p .claude/skills/browser-harness
cp .tmp/browser-harness/SKILL.md .claude/skills/browser-harness/SKILL.md

# Antigravity
mkdir -p .agents/skills/browser-harness
cp .tmp/browser-harness/SKILL.md .agents/skills/browser-harness/SKILL.md

# VS Code Copilot
mkdir -p .github/skills/browser-harness
cp .tmp/browser-harness/SKILL.md .github/skills/browser-harness/SKILL.md

# Framework directive + execution copy
cp .tmp/browser-harness/SKILL.md directives/browser-harness.md
mkdir -p execution/browser-harness
cp .tmp/browser-harness/SKILL.md execution/browser-harness/SKILL.md

rm -rf .tmp/browser-harness
```

Optional: add `BROWSER_USE_API_KEY=` to `.env` if using cloud browsers (not needed for local Chrome).

Register with:
- `capabilities: ["automate_browser", "scrape_page", "fill_form", "click_element", "screenshot_page", "bulk_http"]`
- `tags: ["browser", "automation", "scraping", "CDP"]`
- `requires_env: ["BROWSER_USE_API_KEY"]` (optional — cloud only)
- `invoke: "browser-harness <<'PY' ... PY"`

---

### Step 5 — open-design (nexu-io/open-design)

open-design is a full Next.js + Node daemon app. **Do not auto-install.** Create a directive note only.

```bash
cat > directives/open-design.md << 'EOF'
# open-design

Full local design workspace — open-source alternative to Claude Design.
31 composable skills + 72 brand-grade design systems. Sandboxed iframe preview.
Export: HTML / PDF / PPTX / ZIP.

## Status
MANUAL INSTALL REQUIRED. Requires Node ~24 + pnpm 10.33.x.

## Install
git clone https://github.com/nexu-io/open-design.git
cd open-design
corepack enable && pnpm install
pnpm tools-dev run web

## Capabilities
- Web / mobile / desktop prototype generation from a single prompt
- Magazine-style slide deck generation
- 72 brand design systems (Stripe, Vercel, Apple, Spotify, and 68 more)
- Sandboxed iframe preview with live agent streaming
- Multi-agent CLI detection (Claude Code, Codex, Cursor, Gemini, and more)

## When to use
When the user wants a full visual design workspace UI rather than agent-generated files.
Invoke via browser at the URL printed by pnpm tools-dev.

## Notes
Do not invoke or set up silently. Ask the user if they want to install it first.
EOF
```

Register as `install_method: "manual"`, `smoke_test_passed: null`.

---

### After Bootstrap

Once all steps complete:

1. Write `skills/registry.json` with all 5 entries (use today's date for `imported_at`)
2. Write the populated `mcp.config.json` with the `design-extract` MCP entry
3. Write two mirror files (if they don't already exist):
   - `CLAUDE.md` containing only: `<!-- Mirror of AGENTS.md for Claude Code — edit AGENTS.md instead -->`  followed by the full contents of this file
   - `.github/copilot-instructions.md` containing only: `<!-- Mirror of AGENTS.md for VS Code Copilot — edit AGENTS.md instead -->` followed by the full contents of this file
4. Print one summary line:

```
✓ Bootstrap complete: impeccable · caveman · design-extract · browser-harness · open-design (manual)
  Skills written to: .claude/skills/ · .agents/skills/ · .github/skills/
  Mirrors written: CLAUDE.md · .github/copilot-instructions.md
```

5. Continue with the user's original task
