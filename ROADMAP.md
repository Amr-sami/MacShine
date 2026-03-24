# macclean — Development Roadmap

> Master checklist across all phases. Mark `[x]` as each item is completed.

---

## Phase 1 — Local Desktop App

### 1.1 Project Scaffold
- [x] pnpm workspace (`apps/desktop`, `apps/web`, `packages/shared-types`)
- [x] Electron 28 + React 18 + TypeScript + Vite
- [x] Folder structure from spec section 4
- [x] Working `electron/main.ts` (BrowserWindow opens)
- [x] Python bridge (`bridge/python.ts` ↔ `python/main.py`)
- [x] `electron-builder.yml` for macOS `.dmg`
- [x] `pnpm dev` launches the app

### 1.2 App Shell (Section 5.1)
- [x] Frameless titlebar with traffic-light buttons at `{x:16, y:16}`
- [x] Background color `#0d0f0e`
- [x] Min window size 900×600
- [x] Hide to menu bar tray on close (keep alive)
- [x] Spawn Python subprocess on launch, keep alive
- [x] `app.setLoginItemSettings({ openAtLogin: false })`

### 1.3 Menu Bar Tray (Section 5.2)
- [x] 16×16 monochrome template tray icon
- [x] Tray menu: Open macclean, Quick Scan, separator, Last cleaned, Quit

### 1.4 Python Bridge Protocol (Section 5.3 / 13)
- [x] Newline-delimited JSON over stdin/stdout
- [x] Request ID → Promise mapping
- [x] Progress streaming to renderer via `webContents.send`
- [x] Error handling (permission denied → specific code)
- [x] Subprocess crash detection + restart

### 1.5 Preload & IPC (Section 13.1)
- [x] `contextBridge` typed API (`scan`, `delete`, `skipModule`, `getSettings`, etc.)
- [x] `onProgress` callback listener with cleanup

### 1.6 Cleaning Modules — Python (Section 5.4)
- [x] **caches** — scan `~/Library/Caches`, `/Library/Caches`; recreate dir after delete
- [x] **logs** — scan `~/Library/Logs`, `/private/var/log`; skip files modified <24h
- [x] **trash** — scan `~/.Trash`; show item count + size; warn permanent
- [x] **xcode** — DerivedData, Archives, Simulators; only if Xcode installed
- [x] **browsers** — Safari, Chrome, Firefox, Edge, Brave cache; only if installed
- [x] **large_files** — `~/Downloads`, `~/Desktop`, `~/Movies`, `~/Music`; threshold 200MB; selectable list
- [x] **duplicates** — `~/Downloads`, `~/Desktop`; MD5 hash grouping; keep/delete per file
- [x] **brew** — `brew autoremove` + `brew cleanup --prune=all`; only if Homebrew installed
- [x] **startup** — list LaunchAgents/Daemons; READ-ONLY in Phase 1
- [x] **dns_memory** — flush DNS, `sudo purge`; no file deletion

### 1.7 Safety Engine (Section 6.6 / 10)
- [x] `utils/safety.py` — sensitive path filter (`.ssh`, `Keychains`, `Documents`, etc.)
- [x] Sensitive pattern filter (`*password*`, `*.pem`, `*.key`, `*.env`, etc.)
- [x] `is_safe_to_scan()`, `is_safe_to_delete()`, `filter_paths()`
- [x] Blocked paths never reach the UI

### 1.8 UI — Layout & Design (Section 12)
- [x] Sidebar (220px) + main panel layout
- [x] Sidebar: logo, Smart Scan, module list, History, Settings
- [x] Module status dots: idle, scanning, found, done, skipped, error
- [x] Dark terminal aesthetic (`#0d0f0e`, `#4ade80`, JetBrains Mono)
- [x] Topbar: disk free + last cleaned

### 1.9 Smart Scan (Section 5.5)
- [x] One-click scan: caches, logs, trash, browsers, brew (parallel)
- [x] Skip: large_files, duplicates, xcode
- [x] Summary view: total found across modules
- [x] "Review and Clean" → full results view

### 1.10 Confirmation Dialogs (Section 12.4)
- [x] Show paths/description, total size, permanent vs Trash
- [x] Warning text (Xcode, browsers, etc.)
- [x] Two buttons: Cancel + destructive action
- [x] No auto-close, no countdown

### 1.11 Session State — Zustand (Section 5.6)
- [x] `SessionState` store: modules, totalFreed, scan timestamps
- [x] `ModuleState` per module: status, foundPaths, bytes, error

### 1.12 Settings (Section 5.7)
- [x] `electron-store` → `~/Library/Application Support/macclean/config.json`
- [x] All settings fields: threshold, launchAtLogin, menuBar, telemetry, etc.
- [x] Settings UI page

### 1.13 Cleaning History (Section 5.8)
- [ ] SQLite at `~/Library/Application Support/macclean/history.db`
- [ ] `cleaning_sessions` + `cleaning_actions` tables
- [x] No file paths stored (privacy)
- [x] History UI page

### 1.14 Audit Log (Section 10.5)
- [x] Append to `~/Library/Application Support/macclean/audit.log`
- [x] Format: timestamp, action, module, paths count, bytes, permanent flag
- [x] No file paths in log

### 1.15 Onboarding Flow (Section 12.5)
- [x] Welcome screen
- [x] Full Disk Access request screen
- [x] Notifications request screen
- [x] "You're ready" screen with disk usage + Smart Scan button

### 1.16 Undo System (Section 10.4)
- [x] 5-second undo toast for Trash-based deletions
- [ ] Restore from Trash on undo click
- [x] Permanent delete confirmation (explicit "cannot be undone" text)

### 1.17 Distribution (Section 14)
- [x] `.dmg` build via electron-builder
- [ ] Code signing with Developer ID
- [ ] Notarization via `xcrun notarytool`
- [ ] Auto-updater via `electron-updater` + GitHub Releases

### ✅ Phase 1 Complete
- [x] All safety tests pass
- [x] All modules scan + delete correctly
- [x] Full UI functional
- [x] `.dmg` builds and installs cleanly

---

## Phase 2 — Smart Notifications + Safety Engine

### 2.1 Unused App Detection (Section 6.1)
- [x] List all `.app` bundles in `/Applications` + `~/Applications`
- [x] Read `kMDItemLastUsedDate` via `mdls`
- [x] Compute app size (bundle + support files + containers)
- [x] Flag apps unused >90 days (configurable threshold)

### 2.2 App Manager Module (Section 6.3)
- [x] List all installed apps: icon, name, version, size, last used, badge
- [x] "Uninstall" → two-step confirmation (Rule 3)
- [x] "Show leftover files" — expand support file tree
- [x] "Open app" — launch app
- [x] Uninstall: confirm dialog → move to Trash → 5s undo toast

### 2.3 Notifications (Section 6.2 / 6.4 / 6.5 / 11)
- [x] Unused apps notification (7-day cap, 30-day snooze)
- [x] Disk 85% notification (7-day cap)
- [x] Disk 95% notification (24h cap, ignores DND)
- [x] Long-unscanned notification (14-day cap)
- [x] Frequency enforcement via `electron-store` timestamps
- [x] Do Not Disturb / Focus mode respect
- [x] In-app banner fallback if permission denied

### 2.4 Startup Module — Disable (Section 5.4)
- [x] Upgrade startup module from read-only to "disable" functionality

### 2.5 Background Agent
- [x] `launchd` agent for weekly unused app check
- [x] Disk usage check every 6 hours

### ✅ Phase 2 Complete
- [x] Unused app detection working
- [x] All notification types firing correctly
- [x] App Manager uninstall flow with two-step + undo

---

## Phase 3 — SaaS Layer (Accounts + Payments)

### 3.1 Next.js Web App (Section 7.3)
- [x] Marketing pages: `/`, `/pricing`, `/download`, `/changelog`
- [x] Auth pages: `/login`, `/signup`
- [x] Dashboard: `/app/dashboard`, `/app/history`, `/app/account`, `/app/billing`

### 3.2 Supabase Setup
- [ ] PostgreSQL database via Supabase
- [x] Supabase Auth (email + Google + GitHub OAuth)
- [ ] Row-level security policies

### 3.3 License Key System (Section 7.4)
- [x] RS256 JWT license key generation
- [x] Offline validation (embedded public key)
- [x] Online revocation check (`/api/license/validate`)
- [x] License stored in macOS Keychain via `safeStorage`

### 3.4 Paddle Integration (Section 7.5 / 15.3)
- [x] Webhook: `subscription.created` → generate key + welcome email
- [x] Webhook: `subscription.updated` → update expiry
- [x] Webhook: `subscription.cancelled` → mark cancelled, valid until period end
- [x] Webhook: `subscription.payment_failed` → dunning email + 7-day grace

### 3.5 Pro Tier Gating (Section 7.2)
- [x] History: last 5 sessions (free) vs unlimited (pro)
- [x] Duplicates: 50 files max (free) vs unlimited (pro)
- [x] Large files: 20 results max (free) vs unlimited (pro)
- [x] Scheduled cleaning (pro only)
- [x] Privacy Cleaner module (pro only)
- [x] Email cleaning report (pro only)

### 3.6 Scheduled Cleaning (Section 7.5)
- [x] `launchd` plist in `~/Library/LaunchAgents/`
- [x] Headless mode: `macclean --headless --schedule`
- [x] Confirmation notification before executing (60s cancel window)

### 3.7 Privacy Cleaner Module (Section 7.6)
- [x] Recent files list, QuickLook cache, Quarantine DB
- [x] Safari history (explicit opt-in only)
- [x] Clipboard clear
- [x] Excludes: Chrome/Firefox history, Keychain, password managers

### 3.8 Email Reports
- [x] Resend integration for transactional email
- [x] Cleaning report email after sessions

### ✅ Phase 3 Complete
- [ ] Web app live on Vercel
- [x] Paddle payments working
- [x] License validation (online + offline)
- [x] Pro features gated correctly

---

## Phase 4 — Cloud Dashboard + Multi-Mac

### 4.1 Data Sync (Section 8.1)
- [x] Opt-in cloud sync (Pro only)
- [x] `SyncPayload`: deviceId, session stats, module summaries
- [x] No file paths/names ever sent

### 4.2 Dashboard Features (Section 8.2)
- [x] Total space freed (lifetime, all devices)
- [x] Per-device breakdown + last-seen date
- [x] Cleaning frequency chart (12 months)
- [x] Top modules by space freed
- [x] Unused apps list synced (app names only)

### 4.3 Email Reports
- [x] Weekly digest (Monday) if ≥1 session ran

### 4.4 Family Plan (Section 8.3)
- [x] Up to 5 devices, shared dashboard
- [x] $34.99/yr pricing

### ✅ Phase 4 Complete
- [x] Multi-device sync working
- [x] Cloud dashboard functional
- [x] Family plan billing

---

## Phase 5 — Advanced Features

### 5.1 Space Lens (Section 9.1)
- [x] D3.js treemap visualization
- [x] Clickable drill-down into folders
- [x] Color-coded by file type
- [x] Excludes sensitive paths

### 5.2 Sandbox Uninstaller (Section 9.2)
- [x] Parse `Container` folders in `~/Library/Containers`
- [x] Match to bundle IDs
- [x] Identify orphaned containers from deleted apps

### 5.3 Memory Monitor (Section 9.3)
- [x] Menu bar memory pressure widget (green/yellow/red)
- [x] One-click memory purge
- [x] 1-hour pressure chart

### 5.4 Malware Scanner (Section 9.4)
- [x] YARA rules-based scan (`/Applications`, `~/Downloads`)
- [x] Open-source YARA rules, offline only
- [x] Findings as suggestions, never auto-actions

### 5.5 Update Manager (Section 9.5)
- [x] List installed apps with available updates
- [x] Sparkle feeds + Mac App Store API
- [x] "Update All" — opens each updater, no auto-install
- [x] Abandoned app detection (no update in 2+ years)

### 5.6 Email Attachment Cleaner (Section 9.6)
- [x] Scan `~/Library/Mail` for large attachments
- [x] Group by sender, subject, size
- [x] Only available if Apple Mail detected

### ✅ Phase 5 Complete
- [x] All advanced features functional
- [x] Pricing justified at $29.99–$39.99/yr
