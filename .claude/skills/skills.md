---
name: macshine-ui
description: >
  Use this skill whenever building, modifying, or reviewing any UI component,
  screen, layout, animation, or design decision inside the MacShine desktop
  application (Electron + React + Tailwind). This skill defines the complete
  design system, component library, UX patterns, motion language, and
  accessibility rules for MacShine. Trigger on any request involving screens,
  components, colors, typography, spacing, icons, animations, transitions,
  modals, toasts, sidebars, module panels, onboarding, or any visual element
  of the app. Also trigger when the user says "make it look better", "improve
  the UI", "add an animation", or "build the [X] screen". Never build any
  MacShine UI without reading this skill first.
---

# MacShine UI/UX Skill
### Senior Frontend + UX Reference — Electron + React + Tailwind

This skill is the single source of truth for every visual and interaction
decision in MacShine. Read it completely before writing a single line of
UI code. Every component, every spacing value, every animation curve, every
color — it is all defined here.

---

## 1. Design Direction

### The Concept

MacShine is a precision instrument. It should feel like the kind of software
that a thoughtful engineer built for themselves and then decided to share —
not a marketing-led product, not a startup landing page.

The aesthetic is **dark, focused, surgical**. Think of a high-end audio
mixing console, a terminal that respects the user's intelligence, or the
instrument cluster of a well-engineered car. Every element earns its place.
Nothing is decorative for its own sake.

The emotional goal: the user should feel **in control and informed** at every
moment. Not overwhelmed. Not talked down to. Not upsold. Just given clean,
honest information and the tools to act on it.

### One Rule That Overrides Everything

**Never make the user feel like something bad happened without their knowledge.**

Every deletion is previewed. Every result is explained. Every number is
accurate. The UI communicates trust through precision — exact byte counts,
real file paths, honest before/after comparisons.

---

## 2. Color System

Define all colors as CSS variables in `renderer/src/styles/tokens.css`.
Never hardcode hex values in components.

```css
:root {
  /* Backgrounds — layered from deepest to highest */
  --bg-base:        #0a0c0b;   /* app background, window fill */
  --bg-surface:     #111413;   /* sidebar, panels */
  --bg-elevated:    #181b1a;   /* cards, module panels */
  --bg-hover:       #1e2220;   /* hover states */
  --bg-active:      #232624;   /* pressed / selected */
  --bg-overlay:     rgba(10, 12, 11, 0.85); /* modal backdrop */

  /* Borders */
  --border-subtle:  rgba(255, 255, 255, 0.05);  /* panel separators */
  --border-default: rgba(255, 255, 255, 0.08);  /* card edges */
  --border-strong:  rgba(255, 255, 255, 0.14);  /* focused inputs */

  /* Text */
  --text-primary:   #e8ede8;   /* headings, values, active labels */
  --text-secondary: #8a9e8a;   /* descriptions, metadata */
  --text-muted:     #4a5c4a;   /* placeholder, disabled */
  --text-inverse:   #0a0c0b;   /* text on light surfaces */

  /* Brand / Accent */
  --accent:         #3ddc84;   /* primary action, active state */
  --accent-dim:     #1a4a30;   /* accent background fills */
  --accent-muted:   #224033;   /* subtle accent tints */
  --accent-glow:    rgba(61, 220, 132, 0.15); /* glow halos */

  /* Semantic */
  --warning:        #f0a500;
  --warning-dim:    #3d2a00;
  --warning-muted:  #2a1d00;

  --danger:         #e05252;
  --danger-dim:     #3d1515;
  --danger-muted:   #2a0e0e;

  --info:           #4a9eff;
  --info-dim:       #0d2a4d;

  --success:        var(--accent);
  --success-dim:    var(--accent-dim);

  /* Module status dots */
  --dot-idle:       #2a3a2a;
  --dot-scanning:   #f0a500;
  --dot-found:      #f0a500;
  --dot-done:       var(--accent);
  --dot-skipped:    #2a3a2a;
  --dot-error:      var(--danger);
}
```

### Color Usage Rules

- `--bg-base` is the window background only. Never use it inside components.
- `--bg-surface` is for persistent chrome (sidebar, titlebar).
- `--bg-elevated` is for cards and content panels.
- Accent color (`--accent`) is used for ONE thing per view — the primary
  action or the active state. Never scatter it everywhere.
- Never use white (`#ffffff`) anywhere. The lightest text is `--text-primary`.
- Danger color is for destructive confirmations only — not for warnings or
  informational states.

---

## 3. Typography

### Font Stack

```css
/* In index.html <head> */
/* Import via @font-face or Google Fonts CDN */

--font-display: 'Geist', 'SF Pro Display', system-ui, sans-serif;
--font-body:    'Geist', 'SF Pro Text', system-ui, sans-serif;
--font-mono:    'Geist Mono', 'JetBrains Mono', 'SF Mono', monospace;
```

Install Geist (by Vercel, free):
```bash
pnpm add geist
```

Import in `renderer/src/styles/globals.css`:
```css
@import 'geist/dist/geist.css';
@import 'geist/dist/geist-mono.css';
```

### Type Scale

Every text element must use one of these exactly. No arbitrary font sizes.

```css
--text-xs:   11px;   /* badges, timestamps, labels on paths */
--text-sm:   12px;   /* secondary metadata, descriptions */
--text-base: 13px;   /* body text, module descriptions */
--text-md:   14px;   /* sidebar labels, form labels */
--text-lg:   16px;   /* section headings, modal titles */
--text-xl:   20px;   /* page headings */
--text-2xl:  28px;   /* stat numbers, scan result totals */
--text-3xl:  40px;   /* hero numbers on home screen */
```

### Line Height and Weight

```css
--leading-tight:  1.2;   /* headings, single-line labels */
--leading-normal: 1.5;   /* body text, descriptions */
--leading-loose:  1.7;   /* explanatory text, onboarding copy */

--weight-normal:  400;
--weight-medium:  500;
--weight-semibold: 600;
```

### Typography Rules

- All numbers showing sizes (GB, MB) use `--font-mono` and `--weight-medium`.
- File paths use `--font-mono`, `--text-xs`, `--text-muted`.
- Module names in the sidebar use `--font-body`, `--text-md`, `--weight-medium`.
- Never use font weight above 600 in the UI — it looks heavy on dark backgrounds.
- All caps is reserved for section labels only (`letter-spacing: 0.08em`).

---

## 4. Spacing System

Use Tailwind's spacing scale. These are the approved increments:

```
2px   → gap-0.5   (icon internal padding)
4px   → gap-1     (tight inline spacing)
6px   → gap-1.5   (between icon and label)
8px   → gap-2     (between related items)
12px  → gap-3     (within a component)
16px  → gap-4     (between components)
20px  → gap-5     (section internal padding)
24px  → gap-6     (card padding)
32px  → gap-8     (between sections)
40px  → gap-10    (major layout gaps)
48px  → gap-12    (page-level padding)
```

### Spacing Rules

- Sidebar padding: `px-4 py-3` for items, `px-4 py-5` for sections.
- Card padding: `p-6` standard, `p-4` compact.
- Modal padding: `p-8` for content, `p-6` for header/footer.
- Between a label and its value: always `gap-1.5` or `gap-2`.
- Between sidebar sections: always a `1px` separator with `my-2`.

---

## 5. Layout Architecture

### Window Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Titlebar (36px)                          [traffic lights]    │
├──────────────┬──────────────────────────────────────────────┤
│              │ Topbar (48px) — disk usage, breadcrumb, menu  │
│ Sidebar      ├──────────────────────────────────────────────┤
│ (220px)      │                                               │
│              │ Main Panel                                    │
│              │                                               │
│              │                                               │
│              ├──────────────────────────────────────────────┤
│              │ Action Bar (56px) — confirm / summary         │
└──────────────┴──────────────────────────────────────────────┘
```

### Component: Titlebar

```tsx
// electron/main.ts — window config
titleBarStyle: 'hiddenInset',
trafficLightPosition: { x: 16, y: 10 }

// renderer/src/components/layout/Titlebar.tsx
// This is a drag region — users can grab anywhere on it to move the window
<div
  className="h-9 flex items-center px-4"
  style={{ WebkitAppRegion: 'drag', backgroundColor: 'var(--bg-surface)' }}
>
  {/* Left: 68px empty space for traffic lights */}
  <div className="w-[68px]" style={{ WebkitAppRegion: 'no-drag' }} />

  {/* Center: app name or current section */}
  <div className="flex-1 flex justify-center">
    <span className="text-[11px] font-medium text-[--text-muted] tracking-wide uppercase">
      MacShine
    </span>
  </div>

  {/* Right: optional actions (no-drag) */}
  <div className="w-[68px] flex justify-end" style={{ WebkitAppRegion: 'no-drag' }}>
    {/* e.g. settings icon */}
  </div>
</div>
```

### Component: Sidebar

```tsx
// renderer/src/components/layout/Sidebar.tsx
<aside className="w-[220px] flex flex-col border-r border-[--border-subtle]"
       style={{ backgroundColor: 'var(--bg-surface)' }}>

  {/* Logo area */}
  <div className="px-5 pt-5 pb-4">
    <MacShineLogo />  {/* SVG wordmark, 20px tall */}
  </div>

  {/* Quick action */}
  <div className="px-3 pb-3">
    <SmartScanButton />
  </div>

  {/* Section: Modules */}
  <SidebarSection label="Modules">
    {MODULES.map(m => <SidebarItem key={m.id} module={m} />)}
  </SidebarSection>

  {/* Section: Tools */}
  <SidebarSection label="Tools">
    <SidebarItem id="app-manager" label="App Manager" icon={AppIcon} />
    <SidebarItem id="space-lens" label="Space Lens" icon={PieIcon} />
    <SidebarItem id="privacy" label="Privacy" icon={ShieldIcon} />
  </SidebarSection>

  {/* Bottom: history + settings */}
  <div className="mt-auto border-t border-[--border-subtle] px-3 py-3 flex flex-col gap-1">
    <SidebarItem id="history" label="History" icon={ClockIcon} />
    <SidebarItem id="settings" label="Settings" icon={GearIcon} />
  </div>
</aside>
```

### Component: SidebarItem

This is the most important sidebar component. Get every pixel right.

```tsx
interface SidebarItemProps {
  id: string
  label: string
  icon: React.FC<{ size: number; color: string }>
  status?: 'idle' | 'scanning' | 'found' | 'done' | 'skipped' | 'error'
  size?: string   // e.g. "4.2 GB"
  isActive?: boolean
}

// Sizing: height 32px, border-radius 6px
// Active: bg-[--bg-active], left border 2px accent color
// Hover: bg-[--bg-hover], transition 120ms
// Icon: 14px, color changes with status
// Label: text-[13px] font-medium
// Status dot: 6px circle, right-aligned, color from --dot-* tokens
// Size badge: text-[11px] font-mono text-[--text-muted]

<button
  className={cn(
    'w-full flex items-center gap-2.5 px-3 h-8 rounded-md',
    'transition-colors duration-100',
    isActive
      ? 'bg-[--bg-active] border-l-2 border-[--accent] pl-[10px]'
      : 'border-l-2 border-transparent hover:bg-[--bg-hover]'
  )}
>
  <Icon size={14} color={isActive ? 'var(--accent)' : 'var(--text-muted)'} />
  <span className={cn(
    'flex-1 text-left text-[13px] font-medium',
    isActive ? 'text-[--text-primary]' : 'text-[--text-secondary]'
  )}>
    {label}
  </span>
  {size && (
    <span className="text-[11px] font-mono text-[--text-muted]">{size}</span>
  )}
  <StatusDot status={status} />
</button>
```

---

## 6. Component Library

### StatusDot

```tsx
const DOT_COLORS = {
  idle:     'var(--dot-idle)',
  scanning: 'var(--dot-found)',    // amber, animated
  found:    'var(--dot-found)',
  done:     'var(--dot-done)',
  skipped:  'var(--dot-skipped)',
  error:    'var(--dot-error)',
}

// 6px circle. When status === 'scanning': pulse animation
<span
  className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0',
    status === 'scanning' && 'animate-pulse')}
  style={{ backgroundColor: DOT_COLORS[status] }}
/>
```

### Button

Four variants. Use the right one for the context.

```tsx
// Primary — one per screen, main action
<button className="
  h-9 px-5 rounded-lg font-medium text-[13px]
  bg-[--accent] text-[--text-inverse]
  hover:brightness-110 active:scale-[0.98]
  transition-all duration-100
">
  Clean Now
</button>

// Secondary — supporting actions
<button className="
  h-9 px-4 rounded-lg font-medium text-[13px]
  bg-[--bg-elevated] border border-[--border-default]
  text-[--text-secondary] hover:text-[--text-primary]
  hover:border-[--border-strong] active:scale-[0.98]
  transition-all duration-100
">
  Skip
</button>

// Danger — destructive confirmations only
<button className="
  h-9 px-5 rounded-lg font-medium text-[13px]
  bg-[--danger-dim] border border-[--danger]
  text-[--danger] hover:bg-[--danger] hover:text-white
  active:scale-[0.98] transition-all duration-150
">
  Delete Permanently
</button>

// Ghost — low-emphasis actions in toolbars
<button className="
  h-8 px-3 rounded-md text-[12px]
  text-[--text-muted] hover:text-[--text-secondary]
  hover:bg-[--bg-hover] transition-colors duration-100
">
  Learn more
</button>
```

### Card

```tsx
// Standard card — wraps module content, scan results, settings sections
<div className="
  rounded-xl border border-[--border-default]
  bg-[--bg-elevated] p-6
">
  {children}
</div>

// Highlighted card — used for the primary stat or "found" state
<div className="
  rounded-xl border border-[--accent-dim]
  bg-[--accent-muted] p-6
  ring-1 ring-[--accent-glow]
">
  {children}
</div>
```

### StatBlock

Used to show sizes found, freed, disk usage. The centrepiece of every module result.

```tsx
interface StatBlockProps {
  label: string      // "found", "freed", "disk free"
  value: string      // "4.2 GB"
  sub?: string       // "across 142 files"
  variant?: 'default' | 'accent' | 'warning' | 'danger'
}

// value: --text-3xl, --font-mono, --weight-semibold
// label: --text-xs, --text-muted, uppercase, tracking-wide
// sub: --text-sm, --text-secondary

<div className="flex flex-col gap-1">
  <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[--text-muted]">
    {label}
  </span>
  <span className={cn(
    'text-[40px] font-semibold font-mono leading-none',
    variant === 'accent'  && 'text-[--accent]',
    variant === 'warning' && 'text-[--warning]',
    variant === 'danger'  && 'text-[--danger]',
    !variant              && 'text-[--text-primary]',
  )}>
    {value}
  </span>
  {sub && (
    <span className="text-[12px] text-[--text-secondary]">{sub}</span>
  )}
</div>
```

### PathList

Shows the list of paths found during a scan. This must be readable but not overwhelming.

```tsx
// Max 8 paths visible before scroll. Each row: 36px tall.
// Path text: --font-mono, --text-xs, --text-secondary
// Size badge: --font-mono, --text-xs, --text-muted, right-aligned
// Alternating row bg: transparent / bg-[--bg-hover] at 40% opacity

<div className="rounded-lg border border-[--border-subtle] overflow-hidden">
  {paths.map((p, i) => (
    <div key={p.path} className={cn(
      'flex items-center gap-3 px-4 h-9',
      i % 2 === 1 && 'bg-[--bg-hover]/40'
    )}>
      <span className="flex-1 font-mono text-[11px] text-[--text-secondary] truncate">
        {p.path.replace(HOME, '~')}
      </span>
      <span className="font-mono text-[11px] text-[--text-muted] flex-shrink-0">
        {formatBytes(p.size)}
      </span>
    </div>
  ))}
</div>
```

### ConfirmBar

The action bar at the bottom of the main panel when a scan has found something.
This is a critical UX moment — the user is deciding whether to delete.
Make it unambiguous.

```tsx
// Height: 64px
// Background: --bg-surface with top border
// Layout: [description text] [Skip button] [Primary action button]
// The primary action text must say exactly what will happen:
//   "Delete 4.2 GB permanently" or "Move 1.2 GB to Trash"
// Never just "Clean" or "OK"

<div className="
  h-16 flex items-center gap-4 px-6
  border-t border-[--border-default]
  bg-[--bg-surface]
">
  <div className="flex-1">
    <p className="text-[13px] text-[--text-secondary]">
      Found{' '}
      <span className="text-[--warning] font-mono font-medium">{total}</span>
      {' '}of {description}
    </p>
    {warn && (
      <p className="text-[11px] text-[--warning] mt-0.5">{warn}</p>
    )}
  </div>
  <Button variant="secondary" onClick={onSkip}>Skip</Button>
  <Button variant={isPermanent ? 'danger' : 'primary'} onClick={onConfirm}>
    {isPermanent ? `Delete ${total} permanently` : `Move ${total} to Trash`}
  </Button>
</div>
```

### Toast

For the 5-second undo window and success messages.

```tsx
// Position: bottom-center, 24px from bottom
// Width: 320px max
// Height: 48px
// Slide up on appear, slide down on dismiss
// Progress bar: thin line at bottom, drains over duration

// Use framer-motion for enter/exit:
// initial: { y: 24, opacity: 0 }
// animate: { y: 0, opacity: 1 }
// exit:    { y: 24, opacity: 0 }
// transition: { duration: 0.2, ease: 'easeOut' }

<motion.div className="
  fixed bottom-6 left-1/2 -translate-x-1/2
  h-12 px-4 flex items-center gap-3
  rounded-xl bg-[--bg-elevated]
  border border-[--border-strong]
  shadow-lg shadow-black/40
">
  <CheckIcon size={14} color="var(--accent)" />
  <span className="text-[13px] text-[--text-primary] flex-1">{message}</span>
  {onUndo && (
    <button
      onClick={onUndo}
      className="text-[12px] font-medium text-[--accent] hover:underline"
    >
      Undo
    </button>
  )}
  {/* Progress drain bar */}
  <div className="absolute bottom-0 left-0 h-[2px] rounded-full bg-[--accent]"
       style={{ width: `${progress}%`, transition: 'width linear' }} />
</motion.div>
```

### Modal

```tsx
// Backdrop: --bg-overlay, blur(8px)
// Panel: --bg-elevated, border --border-strong, rounded-2xl
// Max width: 480px for confirmations, 640px for detail modals
// Enter: scale(0.96) opacity(0) → scale(1) opacity(1), 200ms easeOut
// Padding: p-8 for content, gap-4 between sections

// NEVER use the browser's built-in alert/confirm dialogs.
// Always use this component.

// Structure:
// [Icon or illustration — optional]
// [Title — text-lg, font-semibold]
// [Body — text-sm, text-secondary, leading-loose]
// [Path list — if showing files]
// [Action row — Cancel left, Primary right]
```

---

## 7. Module Panel UX

Each cleaning module follows the same UX flow. Build a reusable
`ModulePanel` component that renders the correct state.

### States and What to Show

```
IDLE
  → Centered illustration (SVG, 120px)
  → Module title (text-xl)
  → One-line description (text-sm, text-secondary)
  → "Scan" button (primary)

SCANNING
  → Animated scan indicator (see Section 8)
  → "Scanning [path]..." updating in real time
  → Progress: paths checked count
  → Cancel button (ghost)

FOUND
  → StatBlock: total size in --accent or --warning color
  → PathList: all found paths
  → ConfirmBar at bottom
  → If warn text: amber inline warning above ConfirmBar

DELETING
  → Progress animation
  → "Deleting..." with spinning indicator
  → Cannot cancel at this point

DONE
  → StatBlock: freed size in --accent
  → "Freed [X] from [module name]" 
  → "Scan again" ghost button
  → Toast: undo window (if Trash-based)

SKIPPED
  → Muted message: "Skipped"
  → "Scan again" ghost button

ERROR
  → Error icon
  → Error message (human-readable, not raw Python exception)
  → If permission error: "Open Privacy Settings" button
  → "Try again" button
```

---

## 8. Motion + Animation

Install framer-motion:
```bash
pnpm add framer-motion
```

### The 4 Animation Principles

1. **Instant feedback** — every click responds in under 100ms
2. **Directed motion** — things enter from where they came from
   (sidebar items slide in from left, modals scale from center)
3. **Proportional duration** — small elements animate faster than large ones
4. **Never block** — animations must not prevent interaction

### Approved Durations

```
80ms   — button press feedback (scale)
120ms  — hover state color change
200ms  — element enter/exit (small: badges, dots)
250ms  — panel transitions, modal open
350ms  — page-level transitions
```

### Scanning Animation

The scan progress indicator — this is the most-seen animation in the app.
It must feel fast and technical, not playful.

```tsx
// A thin horizontal progress bar across the top of the module panel
// Color: --accent
// Motion: slides right continuously (indeterminate) while scanning
// When scan completes: quickly fills to 100%, then fades out

// CSS:
@keyframes scan-sweep {
  from { transform: translateX(-100%); }
  to   { transform: translateX(400%); }
}

.scan-bar {
  height: 1px;
  width: 25%;
  background: linear-gradient(90deg,
    transparent,
    var(--accent),
    var(--accent-glow),
    transparent
  );
  animation: scan-sweep 1.2s ease-in-out infinite;
}
```

### Path List Entry Animation

When scan results appear, paths stagger in:

```tsx
// Each path row:
// initial: { opacity: 0, y: 4 }
// animate: { opacity: 1, y: 0 }
// transition: { delay: index * 0.025, duration: 0.2 }
// Max delay cap: index * 0.025 but never more than 0.4s total

// The stagger makes it feel like the scanner is finding them live
// even though they all arrive at once from the backend
```

### Page Transition

When switching between modules in the sidebar:

```tsx
// Outgoing panel: opacity 1→0, x 0→-8px, duration 150ms
// Incoming panel: opacity 0→1, x 8px→0, duration 200ms
// Gap between out and in: 50ms

// Use AnimatePresence with mode="wait"
<AnimatePresence mode="wait">
  <motion.div
    key={activeModule}
    initial={{ opacity: 0, x: 8 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -8 }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
  >
    {renderModule(activeModule)}
  </motion.div>
</AnimatePresence>
```

### Number Counter Animation

When showing freed bytes, animate the number counting up:

```tsx
// Use a simple useCountUp hook:
// Start: 0
// End: freedBytes
// Duration: 600ms
// Easing: easeOut cubic

function useCountUp(target: number, duration = 600) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3) // cubic easeOut
      setValue(Math.round(target * ease))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return value
}
```

---

## 9. Icons

Use `lucide-react` for all icons. No custom SVGs for functional icons.
Custom SVGs only for the logo and module illustrations.

```bash
pnpm add lucide-react
```

### Approved Icon Map

```ts
// Sidebar
import {
  Zap,           // Smart Scan
  HardDrive,     // disk / storage
  Layers,        // caches
  FileText,      // logs
  Trash2,        // trash
  Code2,         // xcode
  Globe,         // browsers
  FileSearch,    // large files
  Copy,          // duplicates
  Terminal,      // brew / dns
  Rocket,        // startup items
  AppWindow,     // app manager
  PieChart,      // space lens
  Shield,        // privacy
  Clock,         // history
  Settings,      // settings
  // Status
  CheckCircle2,  // done
  AlertCircle,   // error
  AlertTriangle, // warning
  Info,          // info
  X,             // close / skip
  ChevronRight,  // expand
  ChevronDown,   // collapse
} from 'lucide-react'
```

### Icon Sizing Rules

```
12px — inside badges, inline with small text
14px — sidebar items, list rows
16px — topbar actions, card headers
20px — empty state illustrations (use custom SVG here instead)
24px — modal icons, prominent actions
```

Never scale lucide icons to non-standard sizes. Pick the closest approved size.

---

## 10. Home Screen

The home screen is what the user sees on first open and after completing
a session. It must immediately answer: "What should I do?" and
"What is the state of my Mac right now?"

### Layout

```
┌─────────────────────────────────────────┐
│  Disk Usage Ring (200px)                │
│  "112.4 GB free of 500 GB"             │
│                                         │
│  Last cleaned: 3 days ago               │
│                                         │
│  [  Run Smart Scan  ]  (primary btn)    │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Quick stats (3 cards in a row):        │
│  [Caches: ~3.2GB] [Logs: ~400MB] [Dupes]│
│                                         │
└─────────────────────────────────────────┘
```

### Disk Usage Ring

```tsx
// SVG ring chart. Not a library — custom SVG.
// Outer ring: 200px diameter, 12px stroke
// Used: --danger if >85%, --warning if >70%, --accent otherwise
// Free: --border-subtle
// Center text: percentage in --text-2xl --font-mono

const circumference = 2 * Math.PI * (100 - 6) // radius = 94
const used = circumference * (usedPercent / 100)
const free = circumference - used

<svg width="200" height="200" viewBox="0 0 200 200">
  {/* Track */}
  <circle cx="100" cy="100" r="88" fill="none"
    stroke="var(--border-subtle)" strokeWidth="12" />
  {/* Used */}
  <circle cx="100" cy="100" r="88" fill="none"
    stroke={ringColor} strokeWidth="12"
    strokeDasharray={`${used} ${circumference}`}
    strokeLinecap="round"
    transform="rotate(-90 100 100)"
    style={{ transition: 'stroke-dasharray 1s ease' }}
  />
  <text x="100" y="95" textAnchor="middle"
    fontSize="28" fontWeight="600" fontFamily="var(--font-mono)"
    fill="var(--text-primary)">
    {usedPercent}%
  </text>
  <text x="100" y="115" textAnchor="middle"
    fontSize="11" fill="var(--text-muted)">
    used
  </text>
</svg>
```

---

## 11. App Manager Screen

This screen lists all installed apps. UX priority: let users find
unused apps fast and uninstall them confidently.

### Layout

```
[Search input]                    [Sort: Size | Last Used | Name]

App list:
┌──────────────────────────────────────────────────────────┐
│ [icon] App Name         v2.1.4    Last used: Today       │
│        /Applications/App.app     Size: 234 MB     [›]    │
├──────────────────────────────────────────────────────────┤
│ [icon] GarageBand       v10.4     Last used: 8 months    │ ← badge
│        /Applications/GarageBand  Size: 1.8 GB   [Uninstall]│
└──────────────────────────────────────────────────────────┘
```

### "Unused" Badge

```tsx
// Only show on apps unused for threshold+ days
// Badge: text-[10px] font-medium rounded px-2 py-0.5
// Color: --warning-dim background, --warning text
// Text: "90+ days unused"
// Position: inline after app name
```

### Row Expand Animation

When user clicks a row to see leftover files:
- Row height animates from 60px to auto
- A nested PathList appears with all leftover file locations
- `framer-motion` `<AnimatePresence>` handles enter/exit

---

## 12. Onboarding Flow

4 screens. Full-screen overlay on top of the main app.
The app is visible blurred behind the onboarding panels.

```tsx
// Backdrop: bg-[--bg-base]/90 backdrop-blur-md
// Panel: bg-[--bg-elevated], rounded-2xl, max-w-md, p-10
// Progress: 4 dots at the bottom, active dot = --accent

// Screen transitions: slide left (next) / slide right (back)
// initial: { x: 40, opacity: 0 }
// animate: { x: 0, opacity: 1 }
// exit: { x: -40, opacity: 0 }
```

Screen 1 — Welcome:
- MacShine logo (SVG wordmark, 32px)
- Headline: "Your Mac. Cleaner." (text-3xl, font-semibold)
- Sub: "MacShine finds and removes junk safely — you always approve before anything is deleted."
- Button: "Get Started"

Screen 2 — Full Disk Access:
- Icon: HardDrive (32px, --accent)
- Headline: "One permission needed"
- Body: "MacShine needs Full Disk Access to scan system caches and logs. Without it, some modules won't work."
- Button: "Open Privacy Settings" (opens System Settings via shell command)
- Link: "Skip for now"

Screen 3 — Notifications:
- Icon: Bell (32px, --accent)
- Headline: "Stay informed"
- Body: "Get notified when unused apps are taking space or your disk is almost full."
- Button: "Enable Notifications"
- Link: "Skip"

Screen 4 — Ready:
- Disk ring (140px, showing real current disk state)
- "You're all set. Here's where things stand."
- Button: "Run Smart Scan"

---

## 13. Settings Screen

Organised into sections. No tabs — just a single scrollable page
with clear section headers.

```
Section: General
  - Launch at login          [toggle]
  - Show in menu bar         [toggle]
  - Check for updates        [toggle]

Section: Scanning
  - Large file threshold     [slider: 100MB — 1GB]
  - Unused app threshold     [dropdown: 30 / 60 / 90 / 180 days]
  - Scan on launch           [toggle]

Section: Notifications
  - Unused apps              [toggle]
  - Disk space warnings      [toggle]
  - Scheduled clean reminders [toggle]

Section: Privacy
  - Crash reporting (Sentry) [toggle — off by default]
  - [link] Privacy Policy

Section: Account (Phase 3+)
  - License key status
  - Manage subscription

Section: Danger Zone
  - Clear cleaning history   [danger button]
  - Reset all settings       [danger button]
```

### Toggle Component

```tsx
// macOS-style pill toggle
// Width: 36px, height: 20px, radius: 10px
// Off: --bg-active background
// On: --accent background
// Knob: white circle, 16px, transitions left/right with spring
// transition: type 'spring', stiffness 500, damping 30

<button
  role="switch"
  aria-checked={checked}
  onClick={toggle}
  className={cn(
    'relative w-9 h-5 rounded-full transition-colors duration-200',
    checked ? 'bg-[--accent]' : 'bg-[--bg-active]'
  )}
>
  <motion.div
    className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
    animate={{ left: checked ? '18px' : '2px' }}
    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
  />
</button>
```

---

## 14. Accessibility

These are non-optional. Every component must comply.

- All interactive elements have `aria-label` if they have no visible text label
- Focus rings: `outline: 2px solid var(--accent); outline-offset: 2px`
  (remove the default browser outline, replace with this)
- Color is never the ONLY indicator of state — always pair with an icon or text
- Keyboard navigation: Tab through all interactive elements in logical order
- Modals: trap focus inside while open, return focus to trigger on close
- `prefers-reduced-motion`: wrap all framer-motion animations in a check:
  ```tsx
  const prefersReduced = useReducedMotion()
  // Pass duration: 0 and no initial/exit transforms if true
  ```
- Minimum touch/click target: 32px × 32px (even for icon-only buttons)
- Text contrast: all text meets WCAG AA against its background

---

## 15. File + Folder Conventions

```
renderer/src/
├── styles/
│   ├── tokens.css        ← all CSS variables (Section 2)
│   ├── globals.css       ← resets, font imports, base styles
│   └── animations.css    ← keyframes (scan-sweep, etc.)
│
├── components/
│   ├── layout/
│   │   ├── Titlebar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── SidebarItem.tsx
│   │   ├── SidebarSection.tsx
│   │   └── ActionBar.tsx
│   ├── ui/
│   │   ├── Button.tsx        ← all 4 variants
│   │   ├── Card.tsx
│   │   ├── StatBlock.tsx
│   │   ├── PathList.tsx
│   │   ├── StatusDot.tsx
│   │   ├── Toggle.tsx
│   │   ├── Toast.tsx
│   │   └── Modal.tsx
│   └── modules/
│       ├── ModulePanel.tsx   ← renders correct state
│       ├── ScanProgress.tsx
│       └── ConfirmBar.tsx
│
├── modules/
│   ├── caches/
│   │   └── CachesModule.tsx
│   ├── logs/
│   │   └── LogsModule.tsx
│   └── ... (one folder per module)
│
├── store/
│   ├── session.store.ts    ← scan session state
│   ├── settings.store.ts   ← app settings
│   └── ui.store.ts         ← active module, modal state
│
└── hooks/
    ├── useCountUp.ts
    ├── useDiskUsage.ts
    ├── useModuleScan.ts    ← wraps IPC scan/delete/skip
    └── useReducedMotion.ts
```

---

## 16. Do and Do Not

### Do

- Use `cn()` (clsx + tailwind-merge) for all conditional class names
- Use CSS variables for all colors — never raw hex in JSX
- Use `font-mono` for all numbers, paths, and sizes
- Animate numbers counting up when results arrive
- Show exact byte counts (formatted), not approximations
- Keep the sidebar always visible and always accurate
- Write one component per file
- Export a named export AND a default export from every component file

### Do Not

- Do not use any pre-built component library (no shadcn, no MUI, no Radix).
  Build every component from scratch using this skill as the spec.
- Do not use `alert()`, `confirm()`, or `prompt()` — ever
- Do not show loading spinners that spin for more than 3 seconds without
  a progress update
- Do not auto-scroll the user to a different part of the screen unexpectedly
- Do not disable buttons without explaining why they are disabled
- Do not truncate file paths without a tooltip showing the full path
- Do not use animations on text — only on containers, backgrounds, and
  numeric values
- Do not put more than one primary button on a screen at a time

---

## 17. Quick Reference Checklist

Before marking any component or screen as done, check:

- [ ] All colors come from CSS variables, zero hardcoded hex
- [ ] All text uses the approved type scale (Section 3)
- [ ] All spacing uses the approved increments (Section 4)
- [ ] Numbers and paths use `--font-mono`
- [ ] Every interactive element has a visible hover and focus state
- [ ] Every deletion path shows the exact files and size before confirming
- [ ] Animations respect `prefers-reduced-motion`
- [ ] No browser native dialogs used anywhere
- [ ] Sidebar status dot reflects real module state
- [ ] Component is in the correct file location (Section 15)

---

*MacShine UI Skill · v1.0 · Read this before writing any UI code.*