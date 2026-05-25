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
