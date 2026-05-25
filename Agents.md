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
  printf '%s\n' "$SKILL_BODY" > "$dir/SKILL.md"
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

---

## 1. Architecture Overview

You operate within a **4-layer architecture**:

```
┌─────────────────────────────────────────────────────┐
│  Layer 0: MCP Servers                               │
│  External capabilities (filesystem, APIs, services) │
│  Declared in mcp.config.json                        │
├─────────────────────────────────────────────────────┤
│  Layer 1: Directives                                │
│  SOPs in Markdown — what to do and why              │
│  Lives in directives/                               │
├─────────────────────────────────────────────────────┤
│  Layer 2: Orchestration  ← YOU ARE HERE             │
│  Intelligent routing, error handling, decisions     │
│  Read directives → call tools in correct order      │
├─────────────────────────────────────────────────────┤
│  Layer 3: Execution                                 │
│  Deterministic Python scripts in execution/         │
│  Handles API calls, data processing, file ops       │
└─────────────────────────────────────────────────────┘
```

**Why this works:** LLMs are probabilistic; business logic must be deterministic. Push complexity into Layer 3 scripts and MCP tools. You focus only on decision-making.

---

## 2. Task Execution Protocol

For every task, follow this pipeline without skipping steps:

```
/plan → check_skill_registry → load_directive → check_mcp → /execute → /validate → /anneal
```

**1. /plan** — Decompose the request into subtasks. Identify which skills, MCP servers, and scripts are needed. State the plan before doing anything.

**2. check_skill_registry** — Open `skills/registry.json`. Match skills by `capabilities` array. If no match, ask whether to import one.

**3. load_directive** — Open `directives/<name>.md`. Read it fully. The directive overrides your default behavior for that task.

**4. check_mcp** — Cross-reference skill's `mcp_servers` against `mcp.config.json`. If a required server is missing: `python execution/configure_mcp.py --skill <name>`. If available → prefer MCP over raw Python scripts.

**5. /execute** — Use MCP tools as primary execution layer. Fall back to `execution/` scripts only when no MCP tool covers the need. Never simulate external actions.

**6. /validate** — Verify output matches directive spec. Check for silent failures (empty files, partial outputs, swallowed API errors).

**7. /anneal** — If anything broke or was ambiguous, update the directive. Log: `"Updated directives/<skill>.md → added note about X"`

---

## 3. MCP Integration Layer

MCP servers are **Layer 0** — always-on tools that skills declare dependencies on.

**Execution priority:**
```
1. MCP tool       (server active + correct capability)
2. execution/     Python script (no MCP tool covers it)
3. LLM reasoning  (pure analysis/planning, no side effects only)
```

Never invert this order.

**`mcp.config.json` schema:**
```json
{
  "version": "1.0",
  "servers": {
    "<server_name>": {
      "type": "stdio" | "url",
      "command": "...",
      "env_required": [],
      "skills_that_use_this": [],
      "status": "active" | "needs_config"
    }
  }
}
```

If a server has `"status": "needs_config"`, do not use it — tell the user which env keys are missing.

---

## 4. Skill System

### What a Skill Is

A skill is a self-contained, importable capability. Skills are written to four locations so every IDE picks them up:

```
.claude/skills/<name>/SKILL.md     ← Claude Code
.agents/skills/<name>/SKILL.md     ← Antigravity
.github/skills/<name>/SKILL.md     ← VS Code Copilot
directives/<name>.md               ← Framework directive layer
```

### Importing a Custom Skill

For skills that follow the standard `skill.manifest.json` format:

```bash
python execution/load_skill.py <GITHUB_URL> [--name <custom_name>]
```

This clones the repo, reads the manifest, copies SKILL.md to all four locations above, installs `requirements.txt`, wires MCP entries into `mcp.config.json`, and registers in `skills/registry.json`.

### skill.manifest.json Schema

```json
{
  "name": "string",
  "version": "semver",
  "description": "one-liner",
  "entry_directive": "SKILL.md",
  "execution_entry": "main.py",
  "requires_mcp": ["server_name"],
  "requires_env": ["ENV_KEY"],
  "capabilities": ["verb_noun"],
  "tags": ["category"],
  "smoke_test": "python execution/<name>/smoke_test.py"
}
```

---

## 5. Self-Annealing Protocol

Errors are system-improvement opportunities:

```
1. Read full error + stack trace
2. Identify root cause
3. Fix the script
4. Test again (skip if paid tokens involved — ask user first)
5. Update the directive with what you learned
6. Report: "Fixed X. Updated directive with note about Y."
```

Never swallow errors silently. Never retry blindly more than 3 times — on the 3rd failure, surface a clear diagnosis to the user.

**Directive update rules:**
- **DO** append learnings to `## Notes` at the bottom: `[YYYY-MM-DD] <what you learned>`
- **DO NOT** overwrite a directive's core goal without asking the user

---

## 6. File Organization

```
project/
├── AGENTS.md                          ← This file (Antigravity + shared entry point)
├── CLAUDE.md                          ← Mirror (Claude Code entry point)
├── .github/
│   ├── copilot-instructions.md        ← Mirror (VS Code Copilot entry point)
│   └── skills/                        ← VS Code Copilot skill location
│       └── <skill_name>/SKILL.md
├── .claude/
│   └── skills/                        ← Claude Code skill location
│       └── <skill_name>/SKILL.md
├── .agents/
│   └── skills/                        ← Antigravity skill location
│       └── <skill_name>/SKILL.md
├── mcp.config.json                    ← MCP server declarations
├── skills/
│   └── registry.json                  ← Active skill index
├── directives/                        ← Framework SOPs
│   └── <skill_name>.md
├── execution/                         ← Python scripts
│   ├── load_skill.py
│   ├── configure_mcp.py
│   └── <skill_name>/
├── .tmp/                              ← Intermediates (never commit)
├── .env                               ← API keys (never commit)
└── .env.example
```

---

## 7. Operating Principles

**Check tools first.** Before writing a script, check `execution/` and active MCP servers. Only create new scripts if nothing exists.

**Prefer MCP over scripts.** MCP tools are faster, more reliable, and externally maintained.

**Never simulate.** If you can't actually call the tool, say so. Don't fake outputs.

**Be explicit about the plan.** One sentence before acting is enough.

**Preserve directives.** They're your long-term memory. Improve them, never discard them.

**Scope creep kills tasks.** If the task grows mid-execution, pause and re-plan with the user.

---

## 8. VS Code One-Time Setup

VS Code Copilot requires one setting to enable skills (one-time per machine):

```
VS Code Settings → search "chat.useAgentSkills" → enable ✓
```

Also requires an active GitHub Copilot subscription (Individual / Business / Enterprise). The free tier does not include agent mode.

Once enabled, Copilot auto-detects skills in `.github/skills/` and loads them on demand. The `.github/copilot-instructions.md` mirror ensures VS Code also follows the framework's operating principles even before any skill is invoked.

---

## 9. Default Skills Reference

| Skill | What it does | Invoke |
|---|---|---|
| **impeccable** | Design quality: audit, polish, critique, craft, animate | `/impeccable audit` · `/impeccable craft` · `/impeccable polish` |
| **caveman** | Cut output tokens ~75%, terse mode with intensity levels | `/caveman` · `/caveman ultra` · `stop caveman` |
| **design-extract** | Extract any site's full design system + MCP server | `designlang <url>` · `designlang grade` · `designlang mcp` |
| **browser-harness** | Self-healing Chrome automation via CDP | `browser-harness <<'PY' ... PY` |
| **open-design** | Full design workspace UI (manual install) | See `directives/open-design.md` |

### Skill interaction patterns

```
"Build a landing page matching Stripe's design"
  1. design-extract:  designlang https://stripe.com    ← extract tokens + layout
  2. impeccable:      /impeccable craft                 ← build with quality gate
  3. browser-harness: screenshot + verify               ← visual QA pass
  4. impeccable:      /impeccable audit                 ← anti-pattern check
```

```
"Long refactor session" (cost-sensitive)
  → /caveman ultra          ← enable first, saves ~75% output tokens
  → /impeccable polish      ← quality pass per component
  → "stop caveman"          ← disable when done
```

---

## 10. Quick Reference

| I need to... | Do this |
|---|---|
| Bootstrap a fresh project | Drop `AGENTS.md` → agent auto-runs Section 0.1 |
| Re-run skill bootstrap | Delete `skills/registry.json`, start new session |
| Import a custom skill | `python execution/load_skill.py <URL>` |
| See active skills | Read `skills/registry.json` |
| See MCP server status | `python execution/configure_mcp.py --status` |
| Add an MCP server | `python execution/configure_mcp.py --add <name>` |
| Fix / improve a directive | Edit `directives/<name>.md`, append to `## Notes` |
| Extract a site's design | `designlang <url>` |
| Audit UI quality | `/impeccable audit` |
| Reduce token spend | `/caveman` or `/caveman ultra` |
| Automate the browser | `browser-harness <<'PY' ... PY` |
| Enable skills in VS Code | Settings → `chat.useAgentSkills` → enable |