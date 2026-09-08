# Forge Flow

A single-page React app for student founders juggling more work than fits in a day: break a long-term goal into small tasks, see one honest checklist of what's due today across every goal, get warned before things quietly pile up into backlog, and track the handful of numbers that actually say whether the business is working. No server, no login — everything lives in `localStorage` in your browser, and it works on a phone-sized screen.

Built on top of the MESA Forge hackathon "Habit Tracker" Core (frictionless one-line capture, daily check-off, local persistence) — extended into a founder task system per the V1 scope, then pushed further toward "the go-to spot for founders."

## What's here

- **Goals → tasks, from a template or from scratch.** Create a long-term goal by picking a founder template (Launch an MVP, Get first 10 paying customers, Set up manufacturing, Raise a pre-seed round — each pre-loaded with starter checklist tasks) or write your own. Break any goal into one-time checklist tasks or recurring tasks (daily / weekdays). Each goal shows a progress bar from its checklist tasks.
- **Today.** One aggregated checklist of everything due today, across all goals plus any standalone tasks, with the goal it belongs to tagged on each row.
- **Backlog warnings.** A banner surfaces tasks that are actually falling behind — a one-time task past its due date, or a recurring task missed on 2+ of the last 7 days it was due — with a one-tap "Mark done" to clear it.
- **Daily capacity.** Give any task a rough time estimate (15 min – 4 hr) and set a daily capacity limit; the Today view shows total time planned for the day and warns *before* you overload it, instead of only flagging backlog after the fact.
- **KPI tracker.** Track a handful of real business numbers — revenue, signups, units shipped, calls made, anything you define with an optional unit — log a value whenever you check in, and see the latest value, day-over-day change, and a sparkline trend.
- **Metrics dashboard.** Goals in motion, today's completion count, current backlog size, a 7-day activity strip, and a simple weekday-vs-weekend completion insight once there's enough history.
- Mobile-first layout with a bottom tab bar (Today / Goals / KPIs / Metrics), no account required.

## Run locally

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
```

Outputs a static site to `dist/`, deployable to Vercel with zero configuration (framework preset: Vite).

## Data model

Stored in `localStorage`:

- `forge-flow:goals` — `{ id, title, notes, createdAt }`
- `forge-flow:tasks` — `{ id, title, goalId, recurrence: 'once'|'daily'|'weekdays', dueDate, estimateMinutes, checkIns: string[], createdAt }`
- `forge-flow:kpis` — `{ id, name, unit, entries: [{ date, value }], createdAt }`
- `forge-flow:settings` — `{ capacityMinutes }`

Data is per-browser. Clearing site data or switching browsers/devices loses it — there's no backend yet.

## What's next

- **Trust & reach:** JSON export/import (backup and restore without fear of a cleared cache), installable PWA so it lives on the home screen like a real app.
- **Lightweight accountability:** a read-only shareable link of your progress, without building full multi-user accounts.
- **From the original roadmap:** calendar/heatmap view of check-in history, custom frequencies beyond daily/weekdays, real push notifications (needs a service worker + permission), full social accountability (needs accounts + a backend), and real email / Nexus notification integration (needs live API/OAuth access this build doesn't have).

See `FOUNDER_FLOW_PEDIA.md` for the full product reference — problem, architecture, every file's role, and how to extend this — written to be handed straight to Claude Code.

You don't need permission to make a feature look different, rename it, or take a different approach than what's described here — this is a starting point, not a rulebook.
