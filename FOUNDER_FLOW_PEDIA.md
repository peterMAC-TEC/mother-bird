# Mother Bird — Product Pedia

This is the single reference document for Mother Bird. It's written to be pasted into Claude Code (or read by it directly from this repo) so a new session has full context without you re-explaining the product from scratch. Everything here reflects the actual code in this repo as of this handoff — not aspirational, not a spec that was never built.

---

## 1. The problem this exists to solve

Student founders at Forge Mesa want to build real companies, but the work doesn't fit in a day. A founder is running manufacturer conversations, watching competitors, managing inventory, and coming up with strategy — on top of college group projects, assignments, and a stream of email and Nexus notifications. The moment it breaks down: sitting down to work and feeling like everything is too much to start, with no reliable way to tell what's actually urgent versus what's just loud.

What's tried and doesn't work: generic to-do apps and note-taking tools, which have no opinion about running a business, don't hold anyone accountable, don't warn you before things pile up, and don't help you understand your own patterns well enough to fix them.

What Mother Bird does instead: force long-term goals into small, doable tasks; show one honest list of what's due today; and surface backlog *before* it becomes a crisis rather than after.

## 2. Who it's for

One person, solo — a student founder, using their own phone or laptop, with zero setup cost. Not a team tool (yet — see §8). No login, because login is friction that kills the "type a habit in one line" philosophy this was built on.

## 3. Origin and lineage

This was forked from the MESA Forge AI Hackathon "Habit Tracker" Core — a deliberately tiny app (type a habit, check it off daily, `localStorage` only) built to prove that frictionless capture beats feature-complete setup. Mother Bird keeps that philosophy (still no login, still no server, still works instantly) and generalizes the single "habit" concept into a fuller founder system: goals broken into tasks, backlog detection, time-awareness, and business metrics.

If you're picking this up fresh: the core interaction model — type something in one line, it appears, tap to check it off — is the thing to protect. Every feature added should still let you capture something in under five seconds.

## 4. What's built, feature by feature

### 4.1 Goals → tasks (with founder templates)
A **Goal** is a long-term thing (`src/components/GoalsView.jsx`, `GoalCard.jsx`). Creating one offers four founder-specific templates (`src/lib/goalTemplates.js`) — Launch an MVP, Get first 10 paying customers, Set up manufacturing, Raise a pre-seed round — each pre-loaded with 5 starter checklist tasks, or a blank "start from scratch" form. A goal is broken into **Tasks** that are either one-time checklist items (the actual execution steps) or recurring items (daily / weekdays — the habit-like ongoing behaviors). Each goal card shows a progress bar computed only from its one-time tasks (`goalProgress()` in `src/lib/taskLogic.js`) — recurring tasks are counted separately (shown as "+N recurring") since "percent done" doesn't mean the same thing for an ongoing habit as it does for a checklist item.

### 4.2 Today — one aggregated checklist
`src/components/TodayView.jsx` pulls every task across every goal (plus standalone tasks with no goal) that's due *today* and shows it as one list, tagged with which goal it belongs to. This is the screen a founder should open first thing — the answer to "what do I actually need to do today" without visiting each goal separately.

### 4.3 Backlog warnings
`backlogFor()` in `src/lib/taskLogic.js` is the core "don't let this quietly pile up" logic:
- A one-time task counts as overdue if its due date has passed and it's still not checked off.
- A recurring task counts as "slipping" if it was due and missed on 2 or more of the last 7 days.

Both surface in `BacklogBanner.jsx` at the top of Today, with a one-tap "Mark done" per item. The threshold (2 misses in 7 days) is a judgment call, not a law — tune it in `backlogFor()` if it's too sensitive or not sensitive enough once there's real usage data.

### 4.4 Daily capacity (proactive, not just reactive)
Backlog warnings are reactive — they tell you after something's already late. Capacity is proactive: any task can carry a rough time estimate (`estimateMinutes`, 15 min to 4 hr, set in `AddTaskForm.jsx`), and a user-set daily capacity (`forge-flow:settings`, changed via the dropdown in `CapacityBar.jsx`) compares planned-minutes-for-today (`plannedMinutesForDay()` in `taskLogic.js`) against that limit. Go over, and a warning appears *while you're still planning the day*, not after you've already failed to do it all. This is the single most direct answer to the "too much to do all at once" problem the founder described when this was scoped — it's worth protecting and extending before almost anything else here.

### 4.5 KPI tracker
The one piece that makes this feel like a business tool instead of a to-do list. `src/components/KPIsView.jsx` / `KPICard.jsx` / `src/lib/kpiLogic.js` let a founder define any metric (name + optional unit — "Weekly revenue ($)", "Signups", "Units manufactured", "Sales calls made") and log a value against today's date whenever they check in. Each card shows the latest value, day-over-day percent change (`trend()`), and a small inline SVG sparkline (`sparklinePoints()`) built from up to the last 10 entries — no charting library, just scaled polyline points. This is intentionally the least "productivity app" feature here and the most "founder command center" one.

### 4.6 Metrics dashboard
`DashboardView.jsx` is the zoomed-out view: goals in motion, today's completion ratio, current backlog count, a 7-day activity bar strip (`completionByDay()`), and a simple weekday-vs-weekend completion-rate comparison (`weekdayWeekendInsight()`) that only appears once there's enough history (≥4 completions) to say anything meaningful. This is a real computed pattern, not an AI guess — see §8 for where actual AI-generated insight could replace or augment it later.

### 4.7 Data backup (export / import)
The biggest trust gap in a `localStorage`-only app is a cleared cache silently erasing everything. `src/lib/backup.js` reads every key in `storage.js`'s `ALL_KEYS` straight from `localStorage` into one JSON object (`buildSnapshot()`) and offers it as a downloadable `forge-flow-backup-<date>.json` (`downloadSnapshot()`, a `Blob` + a synthetic anchor click, no library). Import reverses it: `parseSnapshot()` validates the file actually looks like a Mother Bird backup and throws a user-facing message if not, `restoreSnapshot()` overwrites those keys, and the page reloads so React re-mounts from the restored data. Because it iterates `ALL_KEYS` rather than a hardcoded list, adding `forge-flow:expenses` later (§4.13) required zero changes here — export/import picked it up automatically, verified by a round-trip test. The UI (`src/components/DataBackup.jsx`) lives on the Metrics/Dashboard tab under a "Data" heading — two buttons, Export and Import, plus a hidden file input for the import picker. Importing confirms first (`window.confirm`) since it overwrites whatever's currently in this browser.

### 4.8 Installable PWA
A web app manifest (`public/manifest.webmanifest`) and a hand-written service worker (`public/sw.js`, no `vite-plugin-pwa` or other new dependency — kept in line with the "no build tooling beyond Vite" rule) make this installable to a phone home screen or desktop, opening in `display: standalone` with no browser chrome. Icons (`public/icon-192.png`, `icon-512.png`, `icon-180.png` for iOS) are hand-generated solid-`--accent`-green rounded squares with a white checkmark — same glyph as the existing favicon — via a one-off Node script (not checked into the repo; regenerate similarly if the icon ever needs to change). `index.html` links the manifest and sets `theme-color`/`apple-mobile-web-app-*` meta tags; `src/main.jsx` registers the service worker on `load`, swallowing failures so a broken registration can never block the app itself from working. The service worker splits its strategy by request type: navigations (loading the HTML shell) go network-first, falling back to cache only when offline — cache-first here would risk serving a stale `index.html` that references a hashed JS/CSS filename a newer build already deleted (hit this exact bug once while iterating: a stale cached shell 404'd on its own bundle). Everything else — the hashed, effectively-immutable build assets — is cache-first, refreshed in the background on every request, so there's nothing to keep in sync across builds. This is packaging only — no offline data sync, no background sync of `localStorage` changes.

### 4.9 Read-only shareable progress link
`src/lib/shareLink.js` builds a small snapshot — goal **titles and checklist progress only** (`{title, done, total, pct}` per goal, computed with the same `goalProgress()` used everywhere else) — deliberately excluding task text and KPI values, since this may leave the browser. The snapshot is JSON-stringified, UTF-8-safe base64url-encoded, and appended to the URL as a hash fragment (`#share=<encoded>`, not a query param, so it's never sent to a server in an access log if this is ever deployed behind one). `ShareProgress.jsx` (on the Goals tab, under "Share progress") generates the link from current `goals`/`tasks` and copies it to the clipboard. On load, `App.jsx` calls `readShareSnapshotFromHash()` before anything else renders; if the hash decodes to a valid snapshot, it renders `SharedProgressView.jsx` instead of the normal tabbed app — no tab nav, no forms, no checkboxes, nothing interactive, and it never touches `localStorage`, so it renders identically whether or not the viewer has ever used Mother Bird. Regenerate the link any time — it's a point-in-time snapshot, not a live view; there's no way for the recipient's open tab to update itself.

### 4.10 Calendar / activity heatmap
The Dashboard's 7-day strip only shows the immediate past; `activityGrid()` in `taskLogic.js` extends the same idea over a rolling 12 weeks (~3 months), laid out as calendar weeks (Sunday-first columns, matching the GitHub-contributions convention most people already read intuitively). It reuses `lastNDays()`/`dayOfWeek()` from `dates.js` rather than reinventing date math, pads the first/last week with `null` cells so the grid is always a clean 7-row rectangle, and shares its per-day completion count (`doneCountOn()`, factored out of the existing `completionByDay()`) so the two views can never silently disagree. `CalendarHeatmap.jsx` renders it as a single CSS grid (`grid-auto-flow: column`, one flat list of weekday-label / month-label / cell items — simpler than nesting a nested-flex layout and guarantees row alignment for free), color-coded into 5 levels relative to the busiest day in the window, with a native `title` tooltip per cell (date + count) instead of a custom tooltip component. Lives on the Metrics tab between "Last 7 days" and "Patterns".

### 4.11 Custom recurrence
Beyond `daily`/`weekdays`, a task can now repeat on specific days of the week: `recurrence: "custom"` plus a new `recurrenceDays` field (an array of 0–6 ints, Sun=0..Sat=6). `AddTaskForm.jsx` shows a row of day-toggle buttons only when "Custom days" is selected, and won't submit with zero days picked (same silent-no-op pattern as an empty title). Everywhere `taskLogic.js` branches on `recurrence` was grepped and updated: `isRecurring()` and `recurrenceAppliesOn()` both gained a `"custom"` case (the latter checks `(task.recurrenceDays || []).includes(dayOfWeek(iso))` — the `|| []` is the safe default for tasks saved before this field existed). `isDueOn`, `toggledCheckIns`, `backlogFor`, `goalProgress`, `completionByDay`/`doneCountOn`, and `weekdayWeekendInsight` needed **no changes** — they all already dispatch through `recurrenceAppliesOn()` or a generic "not once" check rather than hardcoding the recurrence strings, so a custom schedule slots into the existing backlog/capacity/insight logic for free. The one new function is `recurrenceLabel(task)`, which replaced a static `{once, daily, weekdays}` label lookup in `TaskRow.jsx` with one that also renders a custom schedule as e.g. "Tue, Fri".

**Descoped from this item:** "N times a week" (a weekly quota rather than fixed days) was *not* built. It needs different due/backlog semantics — a day is "due" only if the week's quota isn't met yet, and "missed" would mean the whole week's quota came up short, not a specific missed day — which didn't fit the small, verify-before-moving-on scope of this session. If it's picked up later, it's a genuinely separate recurrence family, not an extension of `recurrenceDays`.

### 4.12 Voice dictation
A mic button (`src/components/VoiceButton.jsx`) sits next to every free-text field a founder is likely to want to speak instead of type: task title (`AddTaskForm.jsx`), goal title and notes (`AddGoalForm.jsx`), metric name (`AddKPIForm.jsx`), and today's value when logging a KPI (`KPICard.jsx`). It's built entirely on the browser's native Web Speech API (`SpeechRecognition`/`webkitSpeechRecognition`) — no backend, no API key, no per-use cost, works the instant you click it. Tap the mic, talk, tap again (or it keeps listening — `continuous: true`, `interimResults: true` — so a pause to think doesn't cut you off); the field fills live as you speak and can still be hand-edited afterward, same as anything you'd typed. If the browser doesn't support the API, `VoiceButton` renders nothing (feature-detected, not a dead button); if the user denies mic access, it surfaces "Microphone access denied" inline instead of failing silently. For the one numeric field (KPI value), `extractNumber()` in `src/lib/voice.js` pulls the first digit token out of the transcript — a plain regex, not NLU, documented as such.

**Explicitly not built:** a "talk freely and the app figures out whether it's a goal, a task, or a KPI" agent. That needs real NLU (an LLM call), which means a real API key with real cost and — since this app has no backend — a key exposed in the browser's own network requests. Given the choice, dictation into the existing structured fields was chosen over building a fake/heuristic parser of freeform speech, consistent with the "don't attempt a fake version" principle already in this doc's roadmap (§8, item 6). If real AI parsing is wanted later, it's a deliberate architecture change (a small serverless proxy to hide the key, at minimum), not a UI addition.

The one field a plain text-fill wouldn't work for is the due-date picker (`<input type="date">` only accepts a real ISO value, not arbitrary spoken text) — so it gets its own parser, `parseSpokenDate()` in `src/lib/dates.js`, sitting right in the task-options bar next to the date field (`AddTaskForm.jsx`'s `.date-with-voice` wrapper). It's a bounded, regex-based pattern matcher — not NLU — that understands: `today`/`tomorrow`/`yesterday`, `in N days`/`in N weeks`, `next week`, weekday names (`friday` and `next friday` both mean the nearest upcoming Friday — deliberately not distinguished, since that distinction is genuinely ambiguous in everyday speech), `<month> <day>` in either order with an optional ordinal suffix ("Sept 20", "20th of September"), and numeric `M/D`. A month/day that's already passed this year rolls to next year (e.g. saying "March 3rd" in September correctly means next March). Anything it doesn't recognize returns `null` — the due-date field is left exactly as it was rather than being cleared, and an inline message under the options row suggests a phrasing that works. Verified with 15 phrase cases (see commit/session history) covering every branch, including the year-rollover edge case.

### 4.13 Voice expense tracker
A fifth tab ("Spend", `src/components/ExpensesView.jsx`) for logging money in and out entirely by voice, in ₹. `ExpenseCapture.jsx` is a single big mic button — tap once, say something like *"40 rupees for tea"* or *"6000 rupees for glass bottles from manufacturer"*, and it saves itself the moment you stop talking (`continuous: false` on the `SpeechRecognition` instance, so the browser's own silence-detection ends the utterance — deliberately a different mode from `VoiceButton.jsx`'s continuous/manual-stop dictation, since this needs to auto-commit, not fill a field). `src/lib/expenseLogic.js` does the parsing, entirely client-side pattern-matching, not NLU:
- `extractAmount()` finds every number in the phrase and picks the one nearest a currency word (rupees/rs/inr), falling back to the first number if none — handles "tea for 40 rupees" as well as "40 rupees for tea."
- `classifyExpense()` guesses personal vs. business by counting hits against two hand-written keyword lists (business: manufacturer, supplier, inventory, client, vendor, invoice, etc.; personal: tea, lunch, groceries, uber, rent, etc.) — more business hits wins, a tie or zero hits defaults to personal.
- If no number is found at all, nothing is saved — the mic surfaces "Couldn't catch an amount... try again" instead of logging garbage.

Because the guess can be wrong, every logged expense's category is a tappable pill (`ExpenseRow.jsx`) that flips personal ⇄ business with one tap, *and* the same one-tap fix is offered right in the capture feedback the moment it's guessed (`onToggleCategory` passed down to `ExpenseCapture.jsx` too) — so there's no separate "confirm before saving" step to slow down capture, matching the rest of this app's "capture first, correct never blocks capture" philosophy. `totalsByCategory()` sums both running totals live off whatever's currently logged; the list below is sorted newest-first showing amount (`toLocaleString("en-IN")` — real Indian digit grouping, e.g. ₹1,56,000), description, and date. Deliberately not attempted: parsing amounts spoken as words ("six thousand rupees") — relying on the browser's own speech engine to already convert spoken numbers to digits (which Chrome does natively) rather than hand-rolling word-to-number parsing for arbitrary magnitudes.

## 5. Data model

Everything lives in `localStorage`, one JSON array or object per key, read/written through `src/lib/storage.js`:

```
forge-flow:goals     → [{ id, title, notes, createdAt }]

forge-flow:tasks     → [{
  id, title,
  goalId,                 // string id, or null for a standalone task
  recurrence,              // 'once' | 'daily' | 'weekdays' | 'custom'
  recurrenceDays,          // number[]|null — 0 (Sun)..6 (Sat), only meaningful when recurrence === 'custom'
  dueDate,                 // ISO date string, only meaningful when recurrence === 'once'
  estimateMinutes,         // number or null
  checkIns,                // string[] of ISO dates — completion history
  createdAt,
}]

forge-flow:kpis      → [{
  id, name, unit,          // unit is a free-text string, e.g. "$", "signups"
  entries,                 // [{ date: ISO, value: number }], sorted ascending, one per date
  createdAt,
}]

forge-flow:settings  → { capacityMinutes: number | null }

forge-flow:expenses  → [{
  id, amountRupees: number, description: string,
  category,                // 'personal' | 'business' — user-correctable, machine-guessed
  rawTranscript: string,   // the original spoken phrase, kept for transparency/debugging
  createdAt,
}]
```

Notes for anyone extending this:
- `checkIns` for a `'once'` task holds at most one date — the day it was completed. `isDueOn()` in `taskLogic.js` keeps a completed one-time task visible on Today *only* for the day it was checked off, then it drops off the list (this was a real bug caught during testing: tasks were vanishing the instant they were checked, with no visible confirmation).
- There is no schema versioning or migration. If you change a shape (e.g. add a required field to tasks), existing browsers with old data will have `undefined` for the new field — code defensively (`estimateMinutes || 0`, not `estimateMinutes` assumed present).
- No backend, no sync, no multi-device. Each browser profile is its own island.

## 6. File map

```
index.html                       entry HTML, title, inline favicon (data URI, avoids a 404), manifest link, PWA meta
vite.config.js                   Vite + @vitejs/plugin-react, no other config
public/manifest.webmanifest      PWA manifest — name, icons, standalone display
public/sw.js                     minimal app-shell service worker (network-first shell, cache-first assets)
public/icon-192.png, icon-512.png, icon-180.png   hand-generated app icons
src/main.jsx                     React root, imports styles.css, registers the service worker
src/App.jsx                      top-level state (goals/tasks/kpis/settings/expenses), tab routing, all handlers
src/styles.css                   the entire design system — plain CSS, no framework, one file

src/lib/
  dates.js                       ISO date helpers: todayISO, addDays, dayOfWeek, isWeekday, lastNDays, formatting, monthLabel, parseSpokenDate
  storage.js                     localStorage read/write for all five keys, defensive try/catch throughout
  taskLogic.js                   the real logic: isDueOn, isDoneOn, toggledCheckIns, backlogFor, goalProgress,
                                  plannedMinutesForDay, completionByDay, activityGrid, recurrenceLabel, weekdayWeekendInsight
  kpiLogic.js                    upsertEntry, latestEntry, trend, sparklinePoints
  goalTemplates.js                the 4 founder goal templates and their starter tasks
  backup.js                      buildSnapshot, downloadSnapshot, parseSnapshot, restoreSnapshot — export/import
  shareLink.js                    buildShareSnapshot, encodeShareSnapshot, buildShareURL, readShareSnapshotFromHash
  voice.js                        isVoiceSupported, extractNumber — voice dictation helpers
  expenseLogic.js                  parseExpensePhrase, classifyExpense, totalsByCategory — voice expense parsing

src/components/
  TabNav.jsx                     bottom tab bar: Today / Goals / KPIs / Spend / Metrics
  VoiceButton.jsx                  reusable mic button (Web Speech API), used in every add-task/goal/KPI form
  ExpenseCapture.jsx               one-tap voice expense capture (auto-commits on silence), rendered on Spend tab
  ExpensesView.jsx                 personal/business running totals + the logged-expenses list
  ExpenseRow.jsx                   one expense row: amount, description, tappable category pill, date, delete
  DataBackup.jsx                  export/import buttons + file picker, rendered on Metrics tab
  ShareProgress.jsx                generate/copy a read-only share link, rendered on Goals tab
  SharedProgressView.jsx           the read-only view rendered instead of the app when a share link is opened
  CalendarHeatmap.jsx              12-week completion heatmap, rendered on Metrics tab
  TodayView.jsx                  aggregated due-today checklist + backlog banner + capacity bar
  BacklogBanner.jsx               falling-behind list with inline "Mark done"
  CapacityBar.jsx                  planned-minutes vs capacity, with the capacity dropdown
  AddTaskForm.jsx                  title, optional goal, recurrence, due date, time estimate
  TaskRow.jsx                      one task row: checkbox, goal tag, recurrence, estimate, overdue flag, delete
  GoalsView.jsx / GoalCard.jsx      goal list, expand-to-see-tasks, per-goal AddTaskForm, delete goal, composes ShareProgress
  AddGoalForm.jsx                  template picker ⇄ blank custom-goal form
  KPIsView.jsx / KPICard.jsx        KPI list, per-KPI log-a-value form + sparkline
  AddKPIForm.jsx                    name + unit
  DashboardView.jsx                 stat tiles, 7-day activity strip, weekday/weekend insight, composes CalendarHeatmap + DataBackup
```

No router (five tabs, one `useState`), no global state library (lifted state in `App.jsx`, passed down as props), no TypeScript, no CSS framework. Keep it that way unless there's a real reason not to — the whole point of this Core is that it stays simple enough to hold in your head.

## 7. Design system (as actually implemented in `styles.css`)

- **Color (dark, purple-branded — rebranded from the original light/green Habit Tracker Core look; renamed "Forge Flow" → "Mother Bird" in the same pass):** `--accent: #8b2fe0` / `--accent-strong: #a855f7` (vibrant dark purple — brand chrome: buttons, active tab, selected states, chart lines/tags; not a status color), `--bg: #0a0710`, `--surface: #17101f`, `--surface-sunken: #0f0a17`, `--border: #2e2340`, `--text: #f3f0f8`, `--text-muted: #a99bc2`. Status is a strict two-color system layered on top of brand: `--success: #22c55e` (green — done, on-track, positive trend, progress fill) and `--danger: #ef4444` (red — overdue, over capacity, negative trend, backlog/alerts), each with a `-soft` `rgba()` tint for banner/tile backgrounds (translucent overlays, not flat light tints, since they sit on dark surfaces). The old `--warn` amber token is gone — everything that used to be amber (backlog banner, capacity-over, overdue flag) is `--danger` red now, so warnings and errors read the same way instead of splitting attention across two colors. `color-scheme: dark` is set on `:root` so native controls (date picker, number spinners, select arrows) render with dark-mode chrome instead of a jarring light popup.
- **Type:** system font stack, no custom typeface loaded. Sizes are mostly `0.7rem`–`1.6rem`, set inline per component rather than a formal scale — if this grows much further, promoting sizes to CSS custom properties would keep it consistent.
- **Layout:** single column, `max-width: 560px`, centered, mobile-first. Fixed bottom tab bar. No breakpoint above mobile — desktop just centers the same layout, which is a deliberate simplicity choice, not an oversight.
- **Components:** cards (`.surface` + `1px solid var(--border)` + `border-radius: 8–10px`) are the one repeating visual unit — task rows, goal cards, KPI cards, stat tiles all share the same edge treatment, and all now share the same internal padding (`16px 18px` — was an inconsistent mix of `12px`–`14px` before a pass unified it). Every `<input>`/`<textarea>` must set explicit `background`/`color` — the browser's default white input face is invisible-bug-bad on a dark surface (this bit us once: KPI/goal forms were missed in the first recolor pass and rendered as white boxes until caught in manual testing).
- **Motion (small, deliberate, never decorative):** every `<button>` gets a shared `transition` + a `:active { transform: scale(0.97) }` press-down, so every tap in the app feels the same. The task checkbox is a real circle now (`.task-check-icon`, `22px`, border-only when unchecked, filled `--success` + a `check-pop` keyframe when checked) instead of a bare "✓" glyph — the pop makes checking something off read as a small reward, not just a color flip. `goal-card-body` (expanding a goal) and `.backlog-banner` (appearing) both use one shared `fade-slide-in` keyframe on mount, so new content never just snaps into place. All of it is wrapped in a `@media (prefers-reduced-motion: reduce)` guard that collapses every transition/animation to near-zero — motion is a nice-to-have, not something to fight a user's OS setting over.
- **Hover/focus affordances:** `.goal-card-head` and `.task-check` get a `--surface-sunken` hover fill so the tap targets read as interactive before you touch them (a plain `<button>` with no background gave no such hint); everything else keeps the pre-existing `:focus-visible` outline in `--accent`.
- **App identity:** name is "Mother Bird" (was "Forge Flow") — `index.html` `<title>`/meta, `App.jsx` `<h1>`, `SharedProgressView.jsx` `<h1>`, `manifest.webmanifest` `name`/`short_name`, and user-facing copy in `backup.js`/`DataBackup.jsx` were updated. Deliberately **not** renamed: the `forge-flow:*` `localStorage` key prefix (`storage.js`), the backup file's internal `.json` filename prefix's underlying key names, and `package.json`'s `name` field — these are internal identifiers with no user-facing exposure, and renaming the storage keys specifically would orphan any data already saved under the old keys with no migration path. If a full internal rename is ever wanted, it needs a real migration (read old keys once, write under new keys, keep a fallback), not a find-replace.

## 8. Roadmap — what's next, and how it'd plug in

Ordered roughly by effort-to-impact, based on everything scoped in conversation so far:

1. **JSON export / import.** ✅ Done — see §4.7. `src/lib/backup.js` + `src/components/DataBackup.jsx`, on the Metrics tab.
2. **Installable PWA.** ✅ Done — see §4.8. `public/manifest.webmanifest` + `public/sw.js`, registered in `src/main.jsx`.
3. **Read-only shareable progress link.** ✅ Done — see §4.9. `src/lib/shareLink.js` + `ShareProgress.jsx`/`SharedProgressView.jsx`.
4. **Calendar / heatmap view (original V2).** ✅ Done — see §4.10. `activityGrid()` in `taskLogic.js` + `CalendarHeatmap.jsx`.
5. **Custom recurrence (original V2).** ✅ Partially done — see §4.11. Specific days of the week shipped (`recurrence: "custom"` + `recurrenceDays`); "N times a week" deliberately descoped (different due/backlog semantics — see §4.11 for why).
6. **Real push notifications, real social accountability, real email/Nexus integration (original V3).** All three need a backend and/or live OAuth credentials this build doesn't have — don't attempt a fake version of these, they're worth doing properly or not at all. If email/Nexus integration becomes possible, the natural landing spot is a new task source that creates standalone tasks (`goalId: null`) rather than a new concept.
7. **AI weekly insights.** `weekdayWeekendInsight()` in `taskLogic.js` is a real computed heuristic, not AI — a natural upgrade path is generating a short weekly reflection from the same underlying data (completion patterns, backlog frequency, KPI trend direction) rather than hand-coding more heuristics. Flag clearly in the UI what's computed vs. generated so trust isn't misplaced.

## 9. How to run and verify changes

```bash
npm install
npm run dev       # local dev server
npm run build     # production build to dist/ — do this before trusting any change compiles
npm run preview   # serves the dist/ build, useful for testing the real production bundle
```

There's no test framework installed (no Jest/Vitest). Verification so far has been: `npm run build` to catch compile errs, plus manual smoke testing with Playwright (already available in this environment) driving a real browser through the actual user flows — add a goal from a template, check off tasks, trigger and clear a backlog item, log a KPI value, verify the capacity warning. If you add real tests, Vitest is the natural fit given Vite is already the build tool.

## 10. Ground rules for extending this

- Preserve frictionless capture. If a new feature needs a multi-step wizard or an account, it doesn't belong in the Core path — put it behind an optional flow instead.
- Keep logic in `src/lib/*.js` as pure functions and components as thin renderers over them — that split is what made the Playwright smoke tests possible without a test framework, and what will make real unit tests easy to add later.
- `localStorage` only, until there's an actual reason for a backend (real accounts, real notifications, cross-device sync). Don't add a backend "just in case."
- Every new field on an existing stored object needs a sensible default for old data that won't have it — there's no migration system.
- This document should be updated alongside the code, not after the fact. If you add a feature, add its paragraph here in the same session.
