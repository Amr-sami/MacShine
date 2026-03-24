# macclean — Full Product Specification
### Electron Desktop App · SaaS · macOS

**Document version:** 1.0  
**Intended readers:** Claude Code, developers, product owners  
**Purpose:** Complete engineering and product spec. Every phase, feature, data rule, stack decision, and UI behavior is defined here. Build from this document top to bottom.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Core Principles — Non-Negotiable Rules](#2-core-principles)
3. [Tech Stack](#3-tech-stack)
4. [Repository Structure](#4-repository-structure)
5. [Phase 1 — Local Desktop App](#5-phase-1--local-desktop-app)
6. [Phase 2 — Smart Notifications + Safety Engine](#6-phase-2--smart-notifications--safety-engine)
7. [Phase 3 — SaaS Layer (Accounts + Payments)](#7-phase-3--saas-layer)
8. [Phase 4 — Cloud Dashboard + Multi-Mac](#8-phase-4--cloud-dashboard--multi-mac)
9. [Phase 5 — Advanced Features](#9-phase-5--advanced-features)
10. [Data Safety Rules (Global)](#10-data-safety-rules)
11. [Notification System Spec](#11-notification-system-spec)
12. [UI/UX Specification](#12-uiux-specification)
13. [IPC Bridge Spec (Electron ↔ Python)](#13-ipc-bridge-spec)
14. [Installer + Distribution](#14-installer--distribution)
15. [SaaS Pricing + Licensing](#15-saas-pricing--licensing)
16. [Testing Strategy](#16-testing-strategy)

---

## 1. Project Overview

**macclean** is a macOS desktop application that helps users reclaim disk space, manage unused apps, and keep their system healthy — without ever deleting anything the user did not explicitly approve.

It is built as an Electron shell wrapping a React UI, with a Python subprocess handling all system-level operations. The SaaS layer (accounts, payments, cloud dashboard) is a separate Next.js web app.

### What it is not

- It is not a background process that runs constantly
- It is not an antivirus
- It is not a VPN
- It does not auto-delete anything, ever
- It does not send user file paths, file names, or system data to any server without explicit opt-in

### Competitive positioning

| | macclean | CleanMyMac | MacKeeper |
|---|---|---|---|
| Price | $0 free / $19.99 pro | $39.95/yr | $10.95/mo |
| Open core | yes | no | no |
| Auto-deletes | never | optional | optional |
| Background process | no | yes | yes |
| User notified before any action | always | partial | rarely |
| Sandbox-safe | yes | partial | no |

---

## 2. Core Principles

These are non-negotiable rules. Every feature must comply. Claude Code must refuse to implement anything that violates these.

### Rule 1 — Never delete without explicit confirmation

Every deletion action requires a user confirmation step. This means:
- Show exactly what will be deleted (file paths, sizes, counts)
- Show the total size
- Present a clear yes/no prompt
- Log what was deleted after the fact

There is no "auto-clean on launch" mode. There is no "trust me" mode. Even scheduled cleanups (Phase 3 Pro feature) must show a notification and give the user a cancellation window before executing.

### Rule 2 — Sensitive data is never touched automatically

The following categories are flagged as sensitive and are excluded from all automatic scanning. They are only shown to the user if the user manually navigates to the relevant module and explicitly enables it:

- `~/Documents`
- `~/Desktop`
- `~/Downloads` (shown but never auto-selected)
- `~/Pictures`
- `~/Movies`
- `~/.ssh`
- `~/.gnupg`
- `~/Library/Keychains`
- Any path matching `*password*`, `*secret*`, `*credentials*`, `*token*`, `*.pem`, `*.key`
- iCloud Drive synced folders
- Time Machine backup volumes

If a scan accidentally traverses into one of these paths, the result is silently dropped from the results. It is never shown to the user and never logged.

### Rule 3 — Apps are never uninstalled without a two-step confirmation

When the app uninstaller module is used:
- Step 1: Show the app, its size, its leftover files, and its last-used date
- Step 2: Explicitly ask "Move to Trash or permanently delete?"
- Step 3: Show a 5-second undo window after deletion

The user must click through both steps. There is no bulk-uninstall-all button.

### Rule 4 — Unused app notifications are informational only

When macclean detects an app that has not been launched in 90+ days, it sends a notification. That notification:
- Names the app
- Shows its size on disk
- Shows its last-used date
- Offers two actions: "Review" (opens macclean to the app) or "Dismiss"

The notification does NOT offer a "Delete" button. Deletion only happens after the user opens the app and goes through the two-step flow.

### Rule 5 — No telemetry without opt-in

No file names, paths, or system data leave the device unless the user explicitly opts into cloud sync (Phase 4 feature). Crash reports use a local-only log file by default. Opt-in Sentry crash reporting is available in settings.

---

## 3. Tech Stack

### Desktop app

| Layer | Technology | Version | Reason |
|---|---|---|---|
| Shell | Electron | 28.x | Cross-platform, ships as .app, no Swift needed |
| UI framework | React | 18.x | Component model, fast iteration |
| UI language | TypeScript | 5.x | Type safety across IPC boundaries |
| Styling | Tailwind CSS | 3.x | Utility classes, consistent design tokens |
| State management | Zustand | 4.x | Lightweight, no boilerplate |
| Build tool | Vite | 5.x | Fast HMR, works with Electron |
| Electron bundler | electron-builder | 24.x | Produces .dmg, handles code signing |
| Python bridge | child_process (Node) | built-in | Spawns Python subprocess, communicates via stdin/stdout JSON |
| Python version | Python | 3.10+ | Ships bundled via pyinstaller |
| Auto-updater | electron-updater | built-in with electron-builder | Sparkle-compatible update mechanism |
| Persistence (local) | electron-store | 8.x | JSON config file, encrypted with safeStorage |

### SaaS backend

| Layer | Technology | Version | Reason |
|---|---|---|---|
| Framework | Next.js | 14.x (App Router) | Full-stack, API routes + frontend in one |
| Language | TypeScript | 5.x | Consistent with desktop codebase |
| Database | PostgreSQL via Supabase | latest | Managed, free tier, row-level security |
| Auth | Supabase Auth | latest | Email + OAuth (Google, GitHub), handles sessions |
| Payments | Paddle | latest | Handles VAT globally, built for software SaaS |
| Email | Resend | latest | Transactional email, developer-friendly |
| Hosting | Vercel (frontend) + Supabase (backend) | — | Low cost, auto-scales |
| License validation | Custom JWT signed with RS256 | — | Offline-capable license check |

### Developer tooling

| Tool | Purpose |
|---|---|
| VS Code | Primary editor for all code |
| Xcode | Code signing and notarization only (no coding done here) |
| ESLint + Prettier | Code formatting |
| Vitest | Unit tests |
| Playwright | E2E tests |
| GitHub Actions | CI/CD: lint, test, build, release |

### Why not Swift/SwiftUI yet

Swift is the right long-term choice for a native macOS app. It is not the right starting choice because:
- The Python logic already exists and works
- Electron lets the entire codebase live in VS Code
- The UI can be iterated on quickly without recompiling Swift
- SwiftUI migration is planned as Phase 6 after product-market fit is confirmed

---

## 4. Repository Structure

```
macclean/
├── apps/
│   ├── desktop/                  # Electron app
│   │   ├── electron/             # Main process (Node.js)
│   │   │   ├── main.ts           # App entry, window creation
│   │   │   ├── ipc/              # IPC handlers (one file per module)
│   │   │   │   ├── scanner.ts
│   │   │   │   ├── cleaner.ts
│   │   │   │   ├── notifications.ts
│   │   │   │   └── updater.ts
│   │   │   └── bridge/
│   │   │       └── python.ts     # Spawns Python subprocess, JSON protocol
│   │   ├── renderer/             # React UI (Vite)
│   │   │   ├── src/
│   │   │   │   ├── app/          # Page-level components
│   │   │   │   ├── modules/      # One folder per cleaning module
│   │   │   │   ├── components/   # Shared UI components
│   │   │   │   ├── store/        # Zustand stores
│   │   │   │   ├── hooks/        # Custom React hooks
│   │   │   │   └── types/        # Shared TypeScript types
│   │   │   └── index.html
│   │   ├── python/               # Python backend
│   │   │   ├── main.py           # Entry point, reads JSON from stdin
│   │   │   ├── modules/          # One file per module
│   │   │   │   ├── caches.py
│   │   │   │   ├── logs.py
│   │   │   │   ├── trash.py
│   │   │   │   ├── xcode.py
│   │   │   │   ├── browsers.py
│   │   │   │   ├── large_files.py
│   │   │   │   ├── duplicates.py
│   │   │   │   ├── brew.py
│   │   │   │   ├── startup.py
│   │   │   │   ├── apps.py       # App usage tracker
│   │   │   │   └── privacy.py    # Privacy cleaner
│   │   │   ├── utils/
│   │   │   │   ├── safety.py     # Sensitive path filter
│   │   │   │   ├── sizes.py      # Disk size helpers
│   │   │   │   └── permissions.py
│   │   │   └── build.sh          # pyinstaller build script
│   │   ├── package.json
│   │   └── electron-builder.yml
│   │
│   └── web/                      # Next.js SaaS web app
│       ├── app/                  # App Router pages
│       │   ├── (marketing)/      # Landing, pricing, blog
│       │   ├── (auth)/           # Login, signup
│       │   └── (dashboard)/      # User dashboard
│       ├── components/
│       ├── lib/
│       │   ├── supabase.ts
│       │   ├── paddle.ts
│       │   └── license.ts        # License key generation + validation
│       └── package.json
│
├── packages/
│   └── shared-types/             # TypeScript types shared across apps
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── release.yml           # Builds .dmg, notarizes, publishes
│
└── package.json                  # Root workspace (pnpm workspaces)
```

---

## 5. Phase 1 — Local Desktop App

**Goal:** Ship a working macOS desktop app that replicates everything the Python terminal script does, with a proper UI.  
**Timeline:** 6–8 weeks  
**Stack used:** Electron + React + TypeScript + Python subprocess  
**Distribution:** `.dmg` download from website, no account required

### 5.1 App shell

The Electron main process must:

- Create a single `BrowserWindow` (1100×740, min 900×600)
- Hide the default menu bar on macOS
- Use a custom frameless titlebar with traffic-light buttons repositioned to `{ x: 16, y: 16 }`
- Set `backgroundColor` to `#0d0f0e` (matches the dark terminal theme)
- Register `app.setLoginItemSettings({ openAtLogin: false })` — login item disabled by default, exposed as a toggle in settings
- On close, hide to menu bar tray instead of quitting (standard macOS behavior)
- Spawn the Python subprocess on app launch and keep it alive

### 5.2 Menu bar tray

- Tray icon: 16x16 monochrome template icon (renders correctly in light/dark menu bar)
- Tray menu items:
  - "Open macclean"
  - "Quick Scan" (runs the fast scan and shows a notification with results)
  - separator
  - "Last cleaned: {date}" (disabled, informational)
  - "Quit macclean"

### 5.3 Python subprocess bridge

The Python backend runs as a persistent subprocess. Communication is via newline-delimited JSON over stdin/stdout.

Request format (Node sends to Python):
```json
{ "id": "req_abc123", "action": "scan", "module": "caches", "options": {} }
```

Response format (Python sends to Node) — streaming progress:
```json
{ "id": "req_abc123", "type": "progress", "data": { "path": "~/Library/Caches", "size": 3840 } }
```

Response format — final result:
```json
{ "id": "req_abc123", "type": "result", "data": { "total": 4260, "paths": [...] } }
```

Response format — error:
```json
{ "id": "req_abc123", "type": "error", "message": "Permission denied: /Library/Caches" }
```

All sizes are in bytes. All paths are absolute (no `~` shorthand). The bridge in `python.ts` maps request IDs to pending Promise resolvers and streams progress events to the renderer via `webContents.send`.

### 5.4 Cleaning modules — Phase 1

All 10 modules from the terminal script are ported. Each module follows the same contract:

1. `scan(options)` — returns found paths + total size, makes no changes
2. `delete(paths[])` — deletes the given paths, returns actual bytes freed
3. `skip()` — marks module as skipped in session state

Module definitions:

**caches**
- Scan: `~/Library/Caches`, `/Library/Caches`
- Safe to delete: yes, apps rebuild caches automatically
- Sensitive path check: skip any path matching sensitive rules from Rule 2
- After delete: recreate `~/Library/Caches` directory so apps don't crash

**logs**
- Scan: `~/Library/Logs`, `~/Library/Logs/DiagnosticReports`, `/private/var/log`
- Safe to delete: yes
- Filter: skip any log file modified in the last 24 hours (might be active)

**trash**
- Scan: `~/.Trash`
- Show: item count + total size
- Warn: this is permanent

**xcode**
- Scan: `~/Library/Developer/Xcode/DerivedData`, `~/Library/Developer/Xcode/Archives`, `~/Library/Developer/CoreSimulator/Devices`
- Only show module if Xcode is installed (check for `/Applications/Xcode.app`)
- Warning text: "Xcode will rebuild DerivedData on next compile. Simulator images will re-download when needed."

**browsers**
- Scan: Safari, Chrome, Firefox, Edge, Brave cache paths
- Only scan browsers that are actually installed (check `/Applications/`)
- Warning: "Close all browsers before cleaning."

**large_files**
- Scan: `~/Downloads`, `~/Desktop`, `~/Movies`, `~/Music`
- Threshold: configurable, default 200 MB
- Do not scan `~/Documents` or `~/Pictures` (sensitive)
- UI: show a selectable list — user picks which files to delete, not bulk delete all
- Sort: largest first

**duplicates**
- Scan: `~/Downloads`, `~/Desktop`
- Algorithm: MD5 hash, group by hash, keep first occurrence
- Do not scan `~/Documents` or `~/Pictures`
- UI: show groups with "keep" / "delete" controls per file, not bulk delete

**brew**
- Only show if Homebrew is installed (`which brew`)
- Actions: `brew autoremove`, `brew cleanup --prune=all`
- Show: estimated space before running, actual freed after

**startup**
- Scan: `~/Library/LaunchAgents`, `/Library/LaunchAgents`, `/Library/LaunchDaemons`
- This module is READ-ONLY in Phase 1. Show the list, explain what each item is, but do not offer delete.
- Phase 2 will add "disable" functionality

**dns_memory**
- Actions: flush DNS, run `sudo purge`
- Requires sudo — macOS will show its own auth dialog
- This module has no file deletion, just system commands

### 5.5 Smart Scan

"Smart Scan" is a one-click entry point that:
1. Runs `scan()` on: caches, logs, trash, browsers, brew (in parallel)
2. Skips: large_files, duplicates, xcode (these require user interaction)
3. Shows a summary: total found across all modules
4. Shows a "Review and Clean" button that opens the full results view

Smart Scan is the default home screen action.

### 5.6 Session state

Persisted in memory during a session (not to disk). Managed by Zustand.

```typescript
interface SessionState {
  modules: Record<ModuleId, ModuleState>
  totalFreed: number
  scanStartedAt: Date | null
  scanCompletedAt: Date | null
}

interface ModuleState {
  status: 'idle' | 'scanning' | 'found' | 'deleting' | 'done' | 'skipped' | 'error'
  foundPaths: FoundPath[]
  totalFoundBytes: number
  freedBytes: number
  error: string | null
}
```

### 5.7 Settings (Phase 1)

Persisted via `electron-store` to `~/Library/Application Support/macclean/config.json`.

```typescript
interface AppSettings {
  largeFileThresholdMB: number        // default: 200
  launchAtLogin: boolean              // default: false
  showInMenuBar: boolean              // default: true
  unusedAppThresholdDays: number      // default: 90
  scanOnLaunch: boolean               // default: false
  telemetryOptIn: boolean             // default: false
  lastCleanedAt: string | null
  installId: string                   // random UUID, never sent anywhere in Phase 1
}
```

### 5.8 Cleaning history

After each completed module, append to a local SQLite database at `~/Library/Application Support/macclean/history.db`.

Schema:
```sql
CREATE TABLE cleaning_sessions (
  id TEXT PRIMARY KEY,
  started_at TEXT,
  completed_at TEXT,
  total_freed_bytes INTEGER
);

CREATE TABLE cleaning_actions (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES cleaning_sessions(id),
  module TEXT,
  action TEXT,  -- 'deleted' | 'skipped'
  paths_count INTEGER,
  freed_bytes INTEGER,
  timestamp TEXT
);
```

Note: file paths are NOT stored in the history database. Only aggregate counts and sizes. This is a deliberate privacy decision.

---

## 6. Phase 2 — Smart Notifications + Safety Engine

**Goal:** Add proactive notifications for unused apps, long-unscanned state, and a smarter safety layer.  
**Timeline:** 3–4 weeks after Phase 1  
**Requires Phase 1 complete**

### 6.1 Unused app detection

On app launch (and once per week in the background via a launchd agent), macclean checks:

1. List all `.app` bundles in `/Applications` and `~/Applications`
2. For each app, read its last-used date from the macOS Launch Services database:
   ```bash
   mdls -name kMDItemLastUsedDate /Applications/SomeApp.app
   ```
3. If `kMDItemLastUsedDate` is more than `settings.unusedAppThresholdDays` days ago (default 90):
   - Add to "unused apps" list
   - Compute app size on disk (`.app` bundle + `~/Library/Application Support/{AppName}` + `~/Library/Containers/{BundleID}`)

4. Trigger a notification (see Notification System Spec, section 11)

### 6.2 Unused app notification behavior

Notification payload:
```
Title: "3 apps haven't been used in 90+ days"
Body:  "GarageBand (1.2 GB), Sketch (890 MB), and 1 more are taking up space."
Actions: ["Review", "Dismiss"]
```

On "Review": open macclean to the App Manager module.  
On "Dismiss": snooze this notification for 30 days (store snooze timestamp in electron-store).

Never show this notification more than once per 7 days regardless of snooze.

### 6.3 App Manager module

New module added in Phase 2.

UI shows a list of all installed apps with:
- App icon
- App name
- Version
- Size on disk (bundle + support files + containers)
- Last used date
- A badge: "Unused 90+ days" if applicable

For each app, user can:
- "Uninstall" — triggers the two-step confirmation flow (see Rule 3)
- "Show leftover files" — expands a tree of support files, preferences, containers
- "Open app" — launches the app

The uninstall flow:
```
Step 1: Confirm dialog
  "Uninstall Sketch?
   This will move the following to Trash:
   - /Applications/Sketch.app (890 MB)
   - ~/Library/Application Support/com.bohemiancoding.sketch3 (120 MB)
   - ~/Library/Containers/com.bohemiancoding.sketch3 (45 MB)
   Total: 1.05 GB
   [Cancel]  [Move to Trash]"

Step 2: After move to Trash, show in-app toast:
  "Sketch moved to Trash. Undo (5s)"
  — clicking Undo calls NSWorkspace to restore from Trash
```

### 6.4 Space used notifications

Trigger a notification when disk usage crosses 85% or 95%:
```
Title: "Your disk is 87% full"
Body:  "You have 14.2 GB remaining. Run a quick scan to free up space."
Action: "Quick Scan"
```

Check disk usage on app launch and once every 6 hours via the background agent.

### 6.5 Long-unscanned notification

If `settings.lastCleanedAt` is more than 30 days ago (or null):
```
Title: "macclean hasn't run in 30 days"
Body:  "A quick scan usually finds 2–5 GB of junk. Takes 30 seconds."
Action: "Scan Now"
```

Show maximum once per 14 days.

### 6.6 Safety Engine

A Python module `utils/safety.py` that every scan and delete operation runs through before executing.

```python
SENSITIVE_PATHS = [
    "~/.ssh",
    "~/.gnupg",
    "~/Library/Keychains",
    # ... full list from Rule 2
]

SENSITIVE_PATTERNS = [
    r".*password.*",
    r".*secret.*",
    r".*credentials.*",
    r".*\.pem$",
    r".*\.key$",
    r".*\.env.*",
]

def is_safe_to_scan(path: str) -> bool:
    """Returns False if path matches any sensitive rule."""

def is_safe_to_delete(path: str) -> bool:
    """Stricter than is_safe_to_scan. Also blocks anything in ~/Documents."""

def filter_paths(paths: list[str]) -> tuple[list[str], list[str]]:
    """Returns (safe_paths, blocked_paths). Blocked paths are silently dropped."""
```

The safety engine runs on every list of paths before they are shown to the user or deleted. Blocked paths never reach the UI.

---

## 7. Phase 3 — SaaS Layer

**Goal:** Add accounts, license keys, and a Pro tier with scheduled cleaning.  
**Timeline:** 4–6 weeks after Phase 2  
**Requires:** Phase 1 + 2 complete

### 7.1 What stays free forever

- All 10 cleaning modules (scan + delete)
- App Manager (unused app detection)
- Cleaning history (local)
- All notifications
- Smart Scan

### 7.2 Pro tier features

| Feature | Free | Pro ($19.99/yr) |
|---|---|---|
| All cleaning modules | yes | yes |
| App Manager | yes | yes |
| Notifications | yes | yes |
| Cleaning history | last 5 sessions | unlimited |
| Scheduled cleaning | no | yes |
| Privacy Cleaner module | no | yes |
| Duplicate finder (unlimited) | 50 files max | unlimited |
| Large file scanner | 20 results max | unlimited |
| Email cleaning report | no | yes |
| Cloud dashboard (Phase 4) | no | yes |

### 7.3 Web app pages

```
/ (marketing)
/pricing
/download
/changelog
/login
/signup
/app/dashboard          — overview, last scan, disk usage
/app/history            — full cleaning history synced from device
/app/account            — email, password, subscription management
/app/billing            — Paddle billing portal
```

### 7.4 License key system

On purchase, Paddle webhook triggers license key generation:

```typescript
// lib/license.ts
function generateLicenseKey(userId: string, plan: string, expiresAt: Date): string {
  // JWT signed with RS256 private key
  // Payload: { sub: userId, plan, exp: expiresAt.getTime() / 1000, iat: now }
}
```

The desktop app validates the license key:
1. First: verify JWT signature using the embedded RS256 public key (offline, no network needed)
2. Then: optionally call `/api/license/validate` to check revocation status (requires network)

License key is stored in macOS Keychain via Electron's `safeStorage` API.

### 7.5 Scheduled cleaning (Pro)

User sets a schedule: daily / weekly / monthly, at a chosen time.

Implementation:
- Register a `launchd` plist in `~/Library/LaunchAgents/io.macclean.scheduler.plist`
- The plist runs `macclean --headless --schedule` at the configured time
- Headless mode: runs Smart Scan, generates a report, sends a notification
- The notification shows what was found and asks for confirmation before deleting
- Cancellation window: 60 seconds (user can dismiss the notification to cancel)

Scheduled cleaning never runs without the confirmation notification. If the user's Mac is asleep at the scheduled time, launchd reschedules for the next wake.

### 7.6 Privacy Cleaner module (Pro)

Cleans:
- Recent files list (`NSRecentDocumentsDirectory`)
- QuickLook thumbnail cache (`~/Library/Caches/com.apple.QuickLook.thumbnailcache`)
- macOS Quarantine database (`~/Library/Preferences/com.apple.LaunchServices.QuarantineEventsV2`)
- Safari browsing history (user must explicitly select this)
- Clipboard (cleared immediately, no confirmation needed since it's non-destructive)
- DNS cache (same as existing module)

Excluded from Privacy Cleaner:
- Chrome / Firefox history (they handle their own data; macclean does not write to live browser databases)
- Keychain entries
- Any password manager data

---

## 8. Phase 4 — Cloud Dashboard + Multi-Mac

**Goal:** Let Pro users see cleaning stats and history across multiple Macs in a web dashboard.  
**Timeline:** 6–8 weeks after Phase 3

### 8.1 Data sync

When cloud sync is enabled (opt-in, Pro only), the desktop app sends cleaning session summaries to the backend after each session:

```typescript
interface SyncPayload {
  deviceId: string          // UUID stored in Keychain, never changes
  deviceName: string        // macOS hostname
  macOSVersion: string
  sessionId: string
  completedAt: string       // ISO 8601
  totalFreedBytes: number
  moduleSummaries: {
    module: string
    freedBytes: number
    pathsCount: number
    // NOTE: actual file paths are NEVER sent
  }[]
  diskUsageBefore: number
  diskUsageAfter: number
}
```

File paths, file names, and file contents are never sent. Only aggregate statistics.

### 8.2 Dashboard features

- Total space freed across all devices (lifetime)
- Per-device breakdown with last-seen date
- Cleaning frequency chart (weekly, last 12 months)
- Top modules by space freed
- "Unused apps" list synced from each device (app names only, no paths)
- Email report: weekly digest sent every Monday if at least one session ran

### 8.3 Family plan ($34.99/yr)

- Up to 5 devices
- Shared dashboard
- One billing seat

---

## 9. Phase 5 — Advanced Features

**Goal:** Expand feature set to justify pricing at $29.99–$39.99/yr.  
**Timeline:** Year 2

### 9.1 Space Lens

Visual disk map showing what is using space:
- Treemap visualization (D3.js in the renderer)
- Clickable: drill down into any folder
- Color-coded by file type
- Excludes sensitive paths automatically
- Built entirely in the renderer, no Python needed (uses `du` via a shell call)

### 9.2 Full App Uninstaller

Improvement over Phase 2 App Manager:
- Detect ALL leftover files for any app using a fingerprint database
- Fingerprint sources: AppCleaner open-source database + custom scraping
- Show "Leftover score": how much junk an app typically leaves behind
- Show leftovers from already-deleted apps (orphaned support files)

### 9.3 Memory Monitor

- Menu bar widget showing memory pressure (green / yellow / red)
- One-click memory purge from the menu bar
- Chart of memory pressure over the last hour

### 9.4 Malware Scanner (Basic)

- YARA rules-based scan of `/Applications` and `~/Downloads`
- Uses open-source YARA rules from the community
- Does NOT use a cloud database (offline only)
- Findings are suggestions, not automatic actions

### 9.5 Update Manager

- Lists all installed apps with available updates
- Sources: Sparkle feeds for non-App-Store apps, Mac App Store API for App Store apps
- "Update All" button — opens each app's updater, does not auto-install
- Identifies apps that have been abandoned (no update in 2+ years)

### 9.6 Email Attachment Cleaner

- Scans `~/Library/Mail` for large attachments
- Groups by sender, subject, size
- Lets user select individual attachments to delete
- Does not modify `.mbox` files directly — exports attachment, then re-links
- Only available if Apple Mail is detected

---

## 10. Data Safety Rules

This section is the definitive reference for all data handling decisions.

### 10.1 What is never deleted without confirmation

- Any user file (documents, photos, videos, music)
- Any app bundle
- Any preference file (`.plist`)
- Any keychain entry
- Anything in `~/Documents`, `~/Pictures`, `~/Music`
- Anything in iCloud Drive

### 10.2 What is safe to delete automatically (after confirmation)

- Cache files in `~/Library/Caches` and `/Library/Caches`
- Log files in `~/Library/Logs` and `/var/log`
- Xcode DerivedData
- Xcode Simulator images
- Contents of Trash
- Homebrew old formula versions
- Browser cache (not history, not bookmarks, not passwords)

### 10.3 What requires two-step confirmation

- App uninstallation (any `.app`)
- Browser history
- Privacy data (recent files list, quarantine database)
- Any file over 1 GB

### 10.4 The undo window

Any deletion that moves files to Trash (vs. permanent deletion) must show a 5-second undo toast in the UI. The toast must have an "Undo" button. If the user clicks Undo within 5 seconds, the files are restored from Trash.

Files that are permanently deleted (not moved to Trash) — caches, logs, Xcode DerivedData — do not have an undo window because they cannot be restored. The confirmation dialog for these makes this explicit:

```
"This will permanently delete 3.8 GB of cache files.
 This cannot be undone.
 [Cancel]  [Delete Permanently]"
```

### 10.5 Audit log

Every delete action is written to the local audit log at:
`~/Library/Application Support/macclean/audit.log`

Format:
```
2025-01-15T14:32:11Z  DELETE  module=caches  paths=142  bytes=3840000000  permanent=true
2025-01-15T14:33:45Z  DELETE  module=trash   paths=23   bytes=1240000000  permanent=false
2025-01-15T14:34:02Z  SKIP    module=logs
```

File paths are never written to the audit log. Only module name, action, count, and size.

---

## 11. Notification System Spec

All notifications use the macOS Notification Center via Electron's `Notification` API.

### 11.1 Notification types

| ID | Trigger | Frequency cap | Actions |
|---|---|---|---|
| `unused_apps` | Apps unused 90+ days detected | Once per 7 days | Review, Dismiss |
| `disk_85` | Disk usage crosses 85% | Once per 7 days | Quick Scan, Dismiss |
| `disk_95` | Disk usage crosses 95% | Once per 24 hours | Quick Scan |
| `long_unscanned` | No clean in 30+ days | Once per 14 days | Scan Now, Dismiss |
| `schedule_confirm` | Scheduled clean is about to run | Per schedule | Allow, Cancel |
| `scan_complete` | Quick Scan finishes | Always | Review, Dismiss |

### 11.2 Notification frequency enforcement

Store last-sent timestamps in electron-store:
```typescript
interface NotificationState {
  lastSent: Record<NotificationId, string | null>  // ISO 8601
}
```

Before sending any notification, check: `now - lastSent[id] >= frequencyCap`. If the cap is not met, skip silently.

### 11.3 Do Not Disturb respect

Use `systemPreferences.getAnimationSettings()` and `powerMonitor.getSystemIdleState()`. Do not send notifications if:
- Focus mode is active
- The system has been idle for less than 5 minutes (user is actively working)
- System is in low-power mode

Exception: `disk_95` (critical) ignores Do Not Disturb.

### 11.4 Notification permission

Request notification permission on first launch:
```typescript
const { Notification } = require('electron')
if (Notification.isSupported()) {
  // macOS automatically requests permission on first Notification.show()
}
```

If the user denies permission, show an in-app banner instead for critical notifications (`disk_95`).

---

## 12. UI/UX Specification

### 12.1 Design language

- Dark terminal aesthetic
- Monospace font: JetBrains Mono for code/paths, system-ui for UI labels
- Background: `#0d0f0e`
- Primary accent: `#4ade80` (green)
- Warning: `#f59e0b` (amber)
- Destructive: `#f87171` (red)
- Text primary: `#e2e8e0`
- Text muted: `#6b7a6e`
- Border: `#2a2e2b`

### 12.2 Layout

```
+-------------------+----------------------------------------+
| Sidebar (220px)   | Main panel                             |
|                   |                                        |
| [logo]            | [Topbar: disk free, last cleaned]      |
|                   |                                        |
| Smart Scan        | [Current module output / home screen]  |
| ─────────         |                                        |
| Modules           |                                        |
|  caches           | [Confirm bar / summary bar]            |
|  logs             |                                        |
|  trash            |                                        |
|  ...              |                                        |
| ─────────         |                                        |
| App Manager       |                                        |
| Space Lens        |                                        |
| History           |                                        |
| Settings          |                                        |
+-------------------+----------------------------------------+
```

### 12.3 Module states

Each module in the sidebar shows one of:
- `idle` — gray dot, no size shown
- `scanning` — animated dot, "scanning..." label
- `found` — amber dot, size shown (e.g. "4.2 GB")
- `done` — green dot, freed size shown
- `skipped` — gray dot, "skipped" label
- `error` — red dot, "error" label

### 12.4 Confirmation dialog spec

All confirmation dialogs must show:
1. What will be deleted (list of paths or description)
2. Total size
3. Whether it is permanent or going to Trash
4. Warning text if applicable (Xcode, browsers, etc.)
5. Two buttons: destructive action (right, styled red or green depending on severity) + Cancel (left, muted)

No confirmation dialog should auto-close or have a countdown that forces the user to act.

### 12.5 Onboarding flow

First launch only:

```
Screen 1: "Welcome to macclean"
  - Brief description
  - "Get Started" button

Screen 2: "Grant Full Disk Access"
  - Explanation of why it's needed
  - Button: "Open Privacy Settings" (opens System Settings > Privacy > Full Disk Access)
  - "Skip for now" (app works with reduced access, some modules will show errors)

Screen 3: "Notifications"
  - Explanation: "macclean can notify you when apps are unused or disk is getting full"
  - Button: "Enable Notifications"
  - "Skip"

Screen 4: "You're ready"
  - Show current disk usage
  - "Run Smart Scan" button
```

---

## 13. IPC Bridge Spec

### 13.1 IPC channels (Electron main ↔ renderer)

All IPC uses `contextBridge` + `ipcRenderer.invoke` (no `remote` module). The preload script exposes a typed API to the renderer:

```typescript
// preload.ts
contextBridge.exposeInMainWorld('macclean', {
  scan: (module: ModuleId, options?: ScanOptions) => 
    ipcRenderer.invoke('scan', module, options),
  
  delete: (module: ModuleId, paths: string[]) => 
    ipcRenderer.invoke('delete', module, paths),
  
  skipModule: (module: ModuleId) => 
    ipcRenderer.invoke('skip', module),
  
  getSettings: () => 
    ipcRenderer.invoke('get-settings'),
  
  setSettings: (settings: Partial<AppSettings>) => 
    ipcRenderer.invoke('set-settings', settings),
  
  getDiskUsage: () => 
    ipcRenderer.invoke('get-disk-usage'),
  
  getHistory: (limit?: number) => 
    ipcRenderer.invoke('get-history', limit),

  onProgress: (callback: (data: ProgressEvent) => void) => {
    ipcRenderer.on('scan-progress', (_, data) => callback(data))
    return () => ipcRenderer.removeAllListeners('scan-progress')
  }
})
```

### 13.2 Python protocol — full action list

| action | module | description |
|---|---|---|
| `scan` | any module id | scan and return found paths + sizes |
| `delete` | any module id | delete given paths, return freed bytes |
| `get_app_list` | `apps` | return all installed apps with metadata |
| `uninstall_app` | `apps` | move app + support files to Trash |
| `get_disk_usage` | — | return disk total, free, used |
| `run_brew_cleanup` | `brew` | run brew cleanup, return freed bytes |
| `flush_dns` | `dns_memory` | flush DNS cache |
| `purge_memory` | `dns_memory` | run sudo purge |
| `get_startup_items` | `startup` | return all launch agents/daemons |
| `get_duplicates` | `duplicates` | return duplicate groups |
| `get_large_files` | `large_files` | return files above threshold |

### 13.3 Error handling

All Python errors are caught and returned as `type: "error"` responses. The Node bridge translates these to rejected Promises. The renderer catches them and shows an inline error state in the module panel.

Permission errors (EPERM, EACCES) trigger a specific error code `"permission_denied"` that the UI maps to: "macclean needs Full Disk Access to scan this location. Open Privacy Settings?"

---

## 14. Installer + Distribution

### 14.1 Build pipeline

```yaml
# .github/workflows/release.yml
# Triggered on: git tag push matching v*.*.*

steps:
  - Build Python binary: pyinstaller --onefile --distpath electron/resources python/main.py
  - Build Vite renderer: vite build
  - Build Electron app: electron-builder --mac --publish never
  - Notarize: xcrun notarytool submit macclean-*.dmg --apple-id $APPLE_ID ...
  - Staple: xcrun stapler staple macclean-*.dmg
  - Upload to GitHub Release: gh release upload $TAG macclean-*.dmg
  - Invalidate download page cache
```

### 14.2 Code signing requirements

- Apple Developer Program membership ($99/yr)
- Developer ID Application certificate
- Developer ID Installer certificate (for pkg, if needed)
- Hardened Runtime enabled
- Entitlements required:
  ```xml
  <key>com.apple.security.cs.allow-jit</key><true/>
  <key>com.apple.security.cs.disable-library-validation</key><true/>
  <key>com.apple.security.automation.apple-events</key><true/>
  ```

### 14.3 Auto-updater

- Uses `electron-updater` with a GitHub Releases feed
- Checks for updates on launch + every 4 hours
- Downloads update in background, notifies user when ready
- Update prompt: "macclean 1.2.0 is ready to install. Restart now or later?"
- Never auto-restarts without user action

### 14.4 DMG layout

- Background: dark solid `#0d0f0e`
- App icon: left side
- Applications alias: right side
- Window size: 540 × 380

---

## 15. SaaS Pricing + Licensing

### 15.1 Plans

**Free**
- No account required
- All core cleaning modules
- Unlimited scans
- Local history (last 5 sessions)
- Notification system

**Pro — $19.99/year**
- Everything in Free
- Unlimited history
- Scheduled cleaning
- Privacy Cleaner module
- Unlimited duplicates + large file results
- Email reports
- Cloud dashboard (Phase 4)

**Family — $34.99/year**
- Everything in Pro
- Up to 5 devices

### 15.2 License validation flow

```
App launch
  → Read license key from Keychain
  → If no key: run in Free mode
  → If key exists:
      → Verify JWT signature (offline, instant)
      → If valid + not expired: run in Pro mode
      → If expired: show "Your Pro license expired" banner, offer renewal
      → If signature invalid: show "License key invalid" error
      → Every 7 days: call /api/license/validate for revocation check
```

### 15.3 Paddle integration

Webhook events handled:
- `subscription.created` → generate license key, send welcome email via Resend
- `subscription.updated` → update expiry in database
- `subscription.cancelled` → mark as cancelled, license remains valid until period end
- `subscription.payment_failed` → send dunning email, set grace period 7 days

---

## 16. Testing Strategy

### 16.1 Unit tests (Vitest)

- Python modules: pytest, each module has a test with mock file system
- Node bridge: mock Python subprocess, verify JSON protocol
- Zustand stores: test state transitions for each module status
- Safety engine: comprehensive tests for sensitive path filtering

### 16.2 Integration tests (Playwright)

- Full scan + delete flow for each module
- Confirmation dialog appears and must be clicked
- Undo toast appears and restores files
- Onboarding flow completes correctly
- Settings persist across app restart

### 16.3 Safety tests (required to pass before any release)

These tests must pass 100%:

```
- Scan does not return paths under ~/.ssh
- Scan does not return paths under ~/Library/Keychains
- Delete call with a path under ~/Documents returns an error, does not delete
- Delete call with a path matching *.pem returns an error, does not delete
- Scan of ~/Downloads does not auto-select any files
- Uninstall flow requires exactly two user actions before deletion executes
- No file paths appear in audit.log
- No file paths appear in any network request
```

### 16.4 Release checklist

Before every release:

- [ ] All safety tests pass
- [ ] Audit log format is correct (no paths logged)
- [ ] Sensitive path filter covers all paths in Rule 2
- [ ] Confirmation dialog shown for every delete action
- [ ] Undo toast shown for all Trash-based deletions
- [ ] No telemetry calls made when `telemetryOptIn` is false
- [ ] License validation works offline
- [ ] App builds and notarizes cleanly on a clean macOS install
- [ ] Auto-updater fetches and applies a test update correctly

---

*macclean product specification — maintained by the macclean team*  
*This document is the single source of truth. When in doubt, refer here.*