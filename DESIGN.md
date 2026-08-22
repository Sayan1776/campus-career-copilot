# Design System — Instrument Sheet

<!-- impeccable:design-schema 1 -->

Recorded from the built world (ground truth over intention). Direction: seed
`ins-84d2`, user-selected from a four-direction hand (Registry, Placement Cell
Wall, Answer Sheet declined).

## World

Campus placement readiness as **calibrated measurement on engineering workbook
sheets**. Every screen is a numbered sheet: students read instruments, TPOs
watch a bank of gauges, recruiters compare candidates on a measurement table.
The graph-paper ground, hairline ink edges, mono readings, and tick-marked
scales are the product's own material — engineering graph paper, the geometry
box, the plotted chart.

## Color

Restrained strategy: neutrals + one accent + semantic roles.

| Token | Value | Role |
| --- | --- | --- |
| `sheet` | `#FAFBFC` | Ground (graph paper) |
| `sheet.raise` | `#FFFFFF` | Cards / instruments on the sheet |
| `sheet.inset` | `#F0F4F8` | Sunken wells, title-block strips, table heads |
| `ink` | `#16233B` | Primary text, primary buttons, radar strokes |
| `ink.deep` | `#101A2E` | Sidebar spine, dark panels, code output |
| `ink.soft` | `#3D4D68` | Secondary text |
| `ink.faint` | `#5B6B84` | Muted labels (4.5:1 on sheet) |
| `ink.line` / `lineStrong` | `#D7E0EC` / `#C3D0E0` | Hairline edges |
| `instrument` | `#E8501A` | THE red — measurement marks, key CTAs, active states, high severity |
| `instrument.deep` | `#E8501A → #BC3E0E` | Contrast-safe red for small text |
| `pass` | `#1E7A55` | Success, completed, mastered |
| `warn` | `#96660F` | Medium severity |
| `info` | `#2E6E8E` | Chart secondary, neutral highlights |

Severity IS measurement: high = instrument red, medium = amber, low = grey.

## Typography

- **Archivo** (`next/font`, `--font-sans`) — UI voice, weights 400–800.
- **IBM Plex Mono** (`next/font`, `--font-mono`) — readings, serial numbers,
  data labels, scores, dates, code. Mono is for data, never decoration.
- Type floor: 11px (`text-xxs`) for mono micro-labels only; body ≥ 12px.
- Headings: Archivo extrabold, tracking −0.02em. Body measure and hierarchy
  come from the page canvas, not ad-hoc sizes.

## Surfaces & elevation

- Ground: body carries a two-tier grid — 8px minor (rgba ink 2.4%) and 40px
  major (rgba ink 5%) hairlines over `#FAFBFC`.
- **Sheet** (`components/ui/Sheet`): white panel, 1px `ink.line` border,
  radius 12px (16px for large panels), near-invisible `shadow-raise`. Elevation
  is declared once — the border carries the edge; the shadow only grows on
  hover (`shadow-lift`) or for overlays (`shadow-pop`).
- **TitleBlock**: the drawing-sheet header strip (`sheet.inset`) with title,
  sub, and a mono serial on the right rail (e.g. `SHEET SD-01`).
- **graph-inset**: fine-grid white ground for instrument display areas (radar,
  map, gauges).
- Sidebar: `ink.deep` spine, `ink.edge` hairlines, instrument-red active tick
  (3px left marker), mono index numbers (`01…05`).

## Components (`components/ui`)

`Button` (primary=ink / signal=red / outline / ghost / danger; sm-md-lg;
loading spinner), `Sheet` + `TitleBlock`, `Badge` + `SeverityBadge` (mono
uppercase measurement marks), `Field`/`Input`/`Select`/`Textarea` (mono labels,
error slot), `Stat` (calibration square + mono label + large mono reading),
`Progress` (tick-marked scale, sweeps once on mount), `EmptyState`, `Skeleton`
+ `SheetSkeleton`, `Modal` (Escape, focus trap, aria-modal, backdrop click,
scroll lock), `ChipInput`, `PageHeader`, `Providers` (MotionConfig
`reducedMotion="user"` + themed sonner `Toaster`). Toasts replace every
`alert()`; errors are user-language with recovery.

## Motion

One orchestrated entrance per view, never scattered effects:

- Route changes: `app/(dashboard)/template.tsx` settles the page (rise 12px +
  fade, 320ms, cubic-bezier(0.16, 1, 0.3, 1)).
- `Progress` bars sweep to value once (900ms, same easing).
- The landing instrument panel rises as one unit; radar polygon and gauge
  cards stagger behind it.
- Skeletons sweep while sheets stream. `prefers-reduced-motion` freezes all
  of the above.

## Charts

`lib/charts.ts` is the only color source for recharts: ink axis text, `#D7E0EC`
grids, severity fills via `severityColor()`, mono tick fonts, white tooltips
with hairline borders. Radar: instrument-red stroke at 12% fill.

## States & accessibility

- `loading.tsx` (skeleton sheet) and `error.tsx` + `not-found.tsx` boundaries;
  heavy client chunks (radar, journeys console, peer directory, TPO analytics,
  builder) stream in via `next/dynamic` behind skeletons.
- Processing resumes poll (`router.refresh()` every 5s) until the reading
  posts.
- Focus: 2px instrument-red outline, offset 2px, on every interactive element.
- Icons: lucide (`strokeWidth 1.8`), no emoji in UI chrome. Brand glyphs
  (GitHub/LinkedIn) live in `components/BrandIcons.tsx`.
- Tables use `scope="col"`; icon-only buttons carry aria-labels; the modal is a
  real dialog.

## Browser surfaces

Selection: instrument red at 82% with white text. Caret: red. Scrollbars:
ink-tinted with sheet border. Leaflet popups/pins themed (authored `divIcon`
pins — ink circles for companies, red for the campus station; no CDN imagery).

## Do / Don't

- Do set numbers, serials, scores, and labels in mono — it's data.
- Do give every sheet a TitleBlock with a mono serial (`SHEET XX-nn`).
- Don't introduce a second accent color; the red is singular.
- Don't stack border + wide soft shadow (the ghost card); border declares the
  edge.
- Don't ship text below 11px or emoji as icons.
- Don't hard-code hex outside `tailwind.config.js` / `lib/charts.ts`.
