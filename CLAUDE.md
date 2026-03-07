# CLAUDE.md — AceTrack Codebase Guide

This file provides guidance for AI assistants working on the AceTrack codebase.

---

## Project Overview

**AceTrack** is an offline-first Progressive Web App (PWA) for individual volleyball stat tracking. It runs entirely in the browser using IndexedDB for persistence — there is no backend or external API.

- **Live app:** https://ai.studio/apps/drive/1sOnEiCn4u-kNG-rmw7as11ZrJAIbM4gR
- **Deployment:** Cloudflare Workers (static asset serving)
- **Current version:** 1.0.12

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript 5.7 |
| Build tool | Vite 6 |
| Styling | Tailwind CSS 4 |
| UI components | Shadcn UI (Radix UI primitives) |
| Icons | Lucide React |
| Notifications | Sonner (toasts) |
| Storage | Browser IndexedDB (no backend) |
| PWA | Service Worker (public/sw.js) |
| Deployment | Cloudflare Workers (wrangler.jsonc) |

---

## Repository Structure

```
ace-track/
├── index.html              # HTML entry point
├── index.tsx               # React root mount
├── App.tsx                 # Root component — state, routing, persistence
├── types.ts                # All TypeScript types/interfaces
├── db.ts                   # IndexedDB wrapper + CSV import/export
├── app.css                 # Tailwind theme + custom CSS variables
├── vite.config.ts          # Vite config (port 3000, output: dist)
├── tsconfig.json           # TypeScript config
├── components.json         # Shadcn UI config
├── wrangler.jsonc          # Cloudflare Workers deployment
├── metadata.json           # PWA metadata (keep in sync with package.json version)
├── package.json            # Version source of truth
│
├── views/                  # Page-level components (full-screen views)
│   ├── Dashboard.tsx       # Tournament list + creation form
│   ├── EventDetail.tsx     # Tournament detail (matches list)
│   ├── MatchDetail.tsx     # Match detail (sets, stats summary)
│   ├── SetTracker.tsx      # Live stat tracking UI
│   └── ProfileSettings.tsx # Player profile, custom stats, backup/restore
│
├── components/             # Reusable components
│   ├── ui/                 # Shadcn-generated UI primitives (do not hand-edit)
│   │   ├── alert-dialog.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── sonner.tsx
│   ├── EventDetail/        # Sub-components for EventDetail view
│   │   ├── CreateMatchForm.tsx
│   │   ├── EventHeader.tsx
│   │   ├── MatchList.tsx
│   │   └── TournamentStats.tsx
│   ├── Layout.tsx          # Navigation wrapper (header, footer)
│   ├── OnboardingModal.tsx # First-time user guide
│   └── VersionDisplay.tsx  # App version display
│
├── hooks/
│   └── useTournamentExport.ts  # CSV export hook
│
├── lib/
│   └── utils.ts            # cn() helper for merging Tailwind classes
│
├── public/
│   ├── sw.js               # Service worker (PWA caching, contains CACHE_NAME)
│   ├── manifest.json       # PWA manifest
│   └── *.png               # App icons
│
├── scripts/
│   ├── version-bump.js     # Auto-increment patch version across all files
│   └── validate-version.js # Pre-build version validation
│
├── docs/
│   └── version-management.md   # Version management guide
│
├── openspec/               # Specification-driven development artifacts
│   ├── specs/              # Feature specs
│   └── changes/            # Change tracking documents
│
└── .agent/                 # Agent workflow definitions
```

---

## Data Model

All data is stored in a single IndexedDB document under the key `"current"`.

```
AppState
├── events: Event[]
├── profile: PlayerProfile
└── customStats: StatDefinition[]

Event
├── id, name, location, date, endDate?
└── matches: Match[]

Match
├── id, opponent, date
└── sets: SetData[]

SetData
├── id, setNumber, isCompleted
└── logs: StatLog[]

StatLog
└── id, statId, timestamp, value

PlayerProfile
└── name, number, position, trackedStats[], categoryAliases{}

StatDefinition
└── id, name, category, defaultValue, isCustom
```

The DB layer (`db.ts`) handles all reads/writes. **Never access `localStorage` or `sessionStorage` for app state** — use `saveAppState()` / `getAppState()` from `db.ts`.

---

## Application Routing

There is **no router library**. Navigation is managed by a `currentView` state in `App.tsx` with a switch on view name:

| View name | Component | Description |
|---|---|---|
| `dashboard` | `Dashboard.tsx` | Home — list of tournaments |
| `event` | `EventDetail.tsx` | Tournament matches |
| `match` | `MatchDetail.tsx` | Match sets and stats |
| `set` | `SetTracker.tsx` | Live stat tracking |
| `settings` | `ProfileSettings.tsx` | Profile and data management |

Navigation happens by calling `setCurrentView()` and setting context like `setSelectedEventId()`, `setSelectedMatchId()`, `setSelectedSetId()`.

---

## Key Conventions

### TypeScript
- All types live in `types.ts`. Add new types there.
- Path alias `@/*` maps to the root directory.
- Avoid `any`; prefer explicit typing.

### Styling
- Use **Tailwind CSS utility classes** exclusively. Do not write raw CSS except in `app.css` for theme variables.
- Use the `cn()` helper from `lib/utils.ts` for conditional class merging.
- Custom theme CSS variables are defined in `app.css` (brand colors, category-specific surfaces). Use them via Tailwind rather than hardcoded hex values.
- The app uses a **mobile-first** responsive design.

### UI Components
- Use **Shadcn UI components** from `components/ui/` for dialogs, buttons, inputs, cards.
- **Do not hand-edit files in `components/ui/`** — they are managed by the Shadcn CLI. To add a new component: `npx shadcn@latest add <component>`.
- For user feedback, use **Sonner toasts** (`import { toast } from 'sonner'`), not `alert()`.
- For destructive confirmations, use **`AlertDialog`** from `components/ui/alert-dialog.tsx`, not `confirm()`.

### State Management
- All shared state lives in `App.tsx` and is passed down as props.
- There is no Redux, Zustand, or Context API for app state.
- After any mutation, call `saveAppState(appState)` to persist to IndexedDB.

### Version Management
- **`package.json` is the single source of truth** for the version.
- The version must be kept in sync across: `package.json`, `metadata.json`, `App.tsx` (VERSION constant), and `public/sw.js` (CACHE_NAME).
- Use `npm run version:bump` to auto-increment all four locations.
- Use `npm run build:prod` for production builds — it validates and bumps version automatically.
- Never manually edit version numbers across files; always use the script.

### Service Worker
- `public/sw.js` uses a cache-first strategy.
- When assets change, bump the version so the CACHE_NAME changes and old caches are invalidated.
- Service worker registration is skipped in development mode (`import.meta.env.MODE === 'development'`).

---

## Development Workflow

### Setup
```bash
npm install
npm run dev        # Dev server at http://localhost:3000
```

### Build
```bash
npm run build           # Standard build to /dist
npm run build:prod      # Validates version, then builds (use for releases)
npm run version:bump    # Increment patch version across all files
npm run version:validate # Check version consistency
```

### Adding a Shadcn Component
```bash
npx shadcn@latest add <component-name>
```

### Deploying
```bash
npm run build
npx wrangler deploy     # Deploy to Cloudflare Workers
```

---

## Default Stat Categories

The app tracks 18 default stats across 5 categories:

| Category | Example Stats |
|---|---|
| Attacking | Kill, Attack Error, Attack Attempt |
| Serving | Ace, Service Error, Serve Attempt |
| Defense | Dig, Dig Error |
| Setting | Assist, Setting Error, Ball Handling Error |
| Blocking | Block, Block Error, Block Attempt |

Stats are defined in `types.ts`. Users can also define custom stats via ProfileSettings.

---

## Common Pitfalls

1. **Don't use `window.alert()` or `window.confirm()`** — use Sonner toasts and Shadcn AlertDialog instead.
2. **Don't mutate state directly** — always create new objects/arrays when updating state (React immutability).
3. **Don't forget to persist** — after any state change that should survive a refresh, call `saveAppState()`.
4. **Don't add `console.log` to production code** — remove debug logging before committing.
5. **Don't hand-edit `components/ui/`** — use the Shadcn CLI.
6. **Don't use `localStorage`** for app data — use IndexedDB via `db.ts`.
7. **Version bumps** — always use `npm run version:bump`, never edit version strings manually across files.

---

## No Testing Framework

There are currently no automated tests in this repository. Manual testing in the browser is the current verification approach.

---

## Key Files Quick Reference

| File | Purpose |
|---|---|
| `App.tsx` | Root state, routing, PWA update logic |
| `types.ts` | All TypeScript interfaces |
| `db.ts` | IndexedDB CRUD, CSV import/export, backup/restore |
| `app.css` | Brand theme, CSS variables, Tailwind config |
| `views/SetTracker.tsx` | Live stat tracking (most complex UI) |
| `views/ProfileSettings.tsx` | Profile, custom stats, data management |
| `scripts/version-bump.js` | Sync version across all 4 files |
| `public/sw.js` | Service worker (cache busting via version) |
| `docs/version-management.md` | Full version management documentation |
