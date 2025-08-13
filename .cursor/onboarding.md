## Relocation-Z-2025 Agent Onboarding

This guide helps the Cursor agent scan the repo for common issues and propose fixes.

### 1) Import the agent
- Ensure `.cursor/agent.json` exists (already included).
- In Cursor: Agents → New agent → Import from repo.

### 2) Start a local server
- Command: `python3 -m http.server 5173 --directory .`
- Open: `http://localhost:5173/index.html`

### 3) Run quick health checks
- Command: `node scripts/scan.js`
- What it does:
  - Verifies required files exist (`index.html`, `assets/style.css`, `assets/script.js`).
  - Checks `index.html` for missing local assets in `src`/`href`.
  - Runs a Node syntax check on `assets/script.js`.
  - Performs a basic CSS braces balance check.

### 4) Review and fix
- Ask the agent to fix any reported issues.
- Keep changes small and focused; validate in the browser.

### 5) Optional hardening
- Add ESLint/Prettier for JS formatting and linting.
- Migrate to Vite if you want a modern dev server and bundling.

### Agent prompts you can use
- "Scan for missing assets and JS/CSS syntax errors and propose edits."
- "Improve accessibility and responsiveness of `index.html`."
- "Refactor `assets/script.js` to avoid global scope leaks."


