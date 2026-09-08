You're picking up an in-progress project called Forge Flow — a no-login, mobile-first React app that helps a solo student founder break long-term goals into daily tasks, warns them before work piles into backlog, and tracks real business metrics. It's already built and working: goals with founder templates, an aggregated daily checklist, backlog detection, a daily time-capacity warning, and a KPI tracker with sparklines.

**Before touching anything**, read `FOUNDER_FLOW_PEDIA.md` in the root of this repo. It's the full reference: the problem this solves, every feature and why it exists, the complete data model, a file-by-file map, the design tokens in use, and the ground rules for extending it. Don't skip it — it answers most "why is this built this way" questions before you have to ask them.

Then verify the current state before adding anything:
```bash
npm install
npm run build
```
It should compile clean. If it doesn't, fix that first and don't proceed until it does.

## What to build next, in this order

Work through these one at a time. Get each one fully working — build passes, manually exercised in the browser — before starting the next. Don't parallelize; each is small enough to finish and verify before moving on.

### 1. JSON export / import
Add a way to export all of `localStorage` (the four `forge-flow:*` keys — see the pedia's data model section) to a downloadable `.json` file, and re-import it to restore state. This is the single biggest trust gap right now: a cleared browser cache loses everything with no way back.
- Acceptance: exporting then clearing `localStorage` then importing restores goals, tasks, KPIs, and settings exactly.
- Put the button(s) somewhere sensible — the Metrics/Dashboard view is a reasonable home if there's no dedicated settings surface yet.

### 2. Installable PWA
Add a web app manifest and a minimal service worker so this can be added to a phone's home screen and opens like a native app, with the built assets cached.
- Acceptance: `npm run build && npm run preview`, open in Chrome, confirm the browser offers "Install" / "Add to Home Screen," and the app opens in standalone mode without a URL bar.
- Don't overreach into offline data sync — this is caching the app shell, not building an offline-first sync layer.

### 3. Read-only shareable progress link
A lighter version of "social accountability" that doesn't need accounts or a backend: a button that encodes a snapshot of goal titles + progress percentages (not raw task text, not KPIs unless you decide otherwise) into a URL (e.g. a base64 blob in a query param or hash), and a read-only view that renders that snapshot when someone opens the link — no editing, no login.
- Acceptance: generate a link, open it in a fresh incognito context (no localStorage), and confirm it renders the snapshot correctly and cannot be edited from that view.
- Keep the encoded payload small and be thoughtful about what's shared — this is a founder's real business progress.

### 4. Calendar / heatmap view
Visualize `checkIns` history over weeks or months, not just the last-7-days strip already on the Dashboard. Reuse the existing date helpers in `src/lib/dates.js` rather than reinventing date math.

### 5. Custom recurrence
Extend beyond `daily` / `weekdays` — e.g., specific days of the week, or "N times a week." This touches the `recurrence` field's shape and every place in `src/lib/taskLogic.js` that currently checks `recurrence === 'daily' | 'weekdays'`. Grep for `recurrence` before starting so you catch every call site.

## Ground rules (from the pedia — repeated because they matter)

- Preserve frictionless capture. Nothing above should require an account, a setup wizard, or more than a few seconds to use for the first time.
- Keep logic in `src/lib/*.js` as pure, testable functions; components stay thin renderers over them.
- `localStorage` only. Don't introduce a backend for any of the five items above — none of them need one.
- Any new field on an existing stored object needs a safe default for old data that won't have it (there's no migration system).
- Run `npm run build` after each item and manually click through the flow before moving to the next item.
- Update `FOUNDER_FLOW_PEDIA.md` with a short paragraph for each feature you add, in the same session you add it — not as a follow-up.

## Definition of done for this session

All five items built, `npm run build` passing, the pedia doc updated to describe each addition (feature list, data model, file map, and roadmap section all kept in sync), and a short summary at the end of what was built and what — if anything — was deliberately skipped or descoped, and why.
