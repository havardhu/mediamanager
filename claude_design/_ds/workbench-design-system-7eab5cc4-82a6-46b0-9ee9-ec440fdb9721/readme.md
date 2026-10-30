# Workbench Design System

A design system for **vibe-coded creation tools** — dense, desktop-first workbench applications inspired by Visual Studio: a titlebar, a command bar, a solution explorer on the left, a canvas in the middle, a properties dock on the right, a problems panel and a status bar.

The system is extracted from one real product, **Area Database Designer**, and generalised so the same chrome, tokens and components can be reused for other tool-style apps (editors, generators, dataset builders, inspectors).

## Sources

- **Codebase:** `areadbgenerator/` (local folder, read-only mount). Key files:
  - `src/styles.css` — every token and component style (ground truth for all values here)
  - `src/App.tsx` — workbench layout, command bar, explorer, generator panel, map toolbar, problems, status bar, new-project dialog
  - `src/PropertiesPanel.tsx`, `src/NamingDialog.tsx`, `src/PortImport.tsx` — properties dock and dialogs
  - `src/MapView.tsx` — OpenLayers feature palette
  - `README.md` — product copy and behaviour
  - `data/areadb.json`, `public/data/land.geojson`, `public/data/wpi.csv` — sample data used by the UI kit
- No Figma, no slide decks, no logo files were provided.

## Products represented

**Area Database Designer** (`package.json` name `area-database-designer`) — a local-first React + OpenLayers website for building synthetic training datasets of exercise areas (polygons), transit lanes (lines with widths) and ports (points). It edits, validates against NaturalEarth land, generates coastal grids, imports World Port Index ports and exports `areadb.json`. No backend, login or database. It is explicitly **not for navigation**.

---

## CONTENT FUNDAMENTALS

**Voice.** Plain, precise, technical. The UI addresses the user implicitly in the imperative ("Draw a region, choose cell dimensions and heading, then preview."). "You" appears rarely; "I/we" never. The product never talks about itself.

**Casing.**
- Buttons, labels, tabs, menu items: **Sentence case** — "New project", "Import database", "Zoom to selection", "Apply changes".
- Panel headings and eyebrows: **ALL CAPS**, tracked — "PROPERTIES", "COASTAL GRID GENERATOR", "WAYPOINT NAMES", "TRAINING WORKSPACE".
- Data values keep their native casing: feature names are uppercase NATO words ("ZULU FOUR", "KILO ONE").
- Units in parentheses in labels: "Width (NM)", "Lane width (m)", "Island area cutoff (km²)", "Orientation (degrees true)".

**Messages state the outcome, then the consequence or next step.**
- "Exported 173 features as areadb.json. Land-overlap or lane warnings remain; review their suitability."
- "Database export blocked. Repair the errors listed in Problems, then export again."
- "Generated areas added. The boundary is ready for another pass. Undo removes the whole batch."
- "Project created. Draw features or generate your first grid."

**Hints teach in full sentences.** Nearly every control has an 11px muted hint underneath explaining exactly what will and won't change ("Existing features stay unchanged.", "Nothing changes until Import."). Safety and reversibility are repeated deliberately.

**Honesty over polish.** Limitations are stated outright: "Not for navigation", "Code is WPI-<index>, not UN/LOCODE", "This is an estimate, not an ellipsoidal accuracy guarantee." Nothing is marketed.

**Formatting conventions.** Counts use locale separators ("3,630 ports"). Facts are joined with " · " ("171 areas · 2 lanes · 0 ports", "Unsaved changes · Local files only"). Progress and pending states end with "..." ("Validating...", "Loading land data..."). Placeholders end with "..." ("Search areas, lanes, ports..."). Dirty documents show " *". Keyboard hints name the key ("Escape returns to select.", "Ctrl-click to add or remove").

**No emoji. No exclamation marks.** The only "friendly" line is the empty state: "Your training set starts here".

---

## VISUAL FOUNDATIONS

**Overall vibe.** A dark, cool, blue-grey IDE. Flat, dense, quiet; colour is reserved for state (accent = selected/active/primary) and for data on the canvas.

**Colour.** Dark theme is default. Four stepped surfaces (`--bg #181c24` → `--surface #20252e` → `--surface-2 #272d37` → `--surface-3 #303946`) plus one border (`#363e4b`). Text is cool off-white `#e1e7ef`, muted `#98a5b6`. One accent: sky blue `#72b6eb` with a deep `--accent-soft #273f56` used for selected rows, info notifications and the status bar. Error is a soft pink-red **text** colour (`#f19f9f`), not a fill; error notifications use an 8% error tint. A full light theme (`[data-theme="light"]`) swaps the same roles. The canvas has its own pastel palette (areas `#73afdf`, lanes `#7fd9c5`, ports `#edb7ea`, selection amber `#f3c66c`, generation preview green `#9ce9b4`, boundary `#ffc96b` dashed) on water `#252f3c` and land `#525963`.

**Type.** System `"Segoe UI"` stack at very small, dense sizes: 12px body/controls, 11px hints/tabs/toolbar, 10px section headings/badges/status bar, 9px eyebrows/severity tags, 8px caption sub-labels, 12.5px semibold product name, 17px semibold dialog titles. Weights: 400 / 500 / 600 only. Uppercase labels are tracked .7–1.2px. Consolas monospace for coordinates and CRS. Line-heights 1.5 (notifications), 1.6 (empty/caption), 1.65 (hints).

**Spacing.** Exact, off-grid values from the source: 5, 6, 7, 9, 10, 12px dominate. Controls are 29px tall (27 / 25 / 23 / 22 for denser contexts). Fixed chrome: titlebar 40, tabs 38, map toolbar 38, tree rows 30, problems bar 33, status bar 25, splitter 5, sidebar 330 (260–580), properties dock 340.

**Backgrounds.** Solid colours only. No images, gradients, textures or illustrations anywhere in the chrome. The only "imagery" is the data canvas (vector map).

**Borders.** 1px `--border` everywhere — panels are separated by borders, not shadows or gaps. Bordered sub-cards (position rows, filter groups, preview summary) use 4px radius.

**Corner radii.** Nearly square: 3px (inputs, badges, search), 4px (buttons, cards, rows, captions), 6px (modals). Tabs, tree rows, bars and the problems list are square.

**Shadows / elevation.** None on docked UI. Only floating layers cast shadows: map caption `0 3px 18px #0002`, land notice `0 5px 24px #0003`, modal `0 20px 80px #0005`.

**Transparency & blur.** Modal scrim `#080d15aa` with `backdrop-filter: blur(3px)`. Map caption is a near-opaque `#1b2431ec`; map controls `#202b3b99`. Translucent fills (14–20% alpha) on canvas features only.

**Hover.** One surface step up (`--surface-3`) and border brightens to `--muted`. Primary buttons hover with `filter: brightness(1.1)`. Splitter turns accent on hover/focus. Ghost buttons in command bars/toolbars are transparent until hovered.

**Press / active.** Toggled tools and active buttons: accent text, `--accent-soft` fill, accent border. Active tab: accent text, 2px accent underline, `--surface-2` fill. No shrink, no ripple.

**Focus.** `outline: 2px solid var(--accent); outline-offset: -2px` (inset ring).

**Disabled.** `opacity: .42`, default cursor. Filter chips toggled off: transparent, 60% opacity, line-through.

**Animation.** None. No transitions, no easing curves; state changes are instant. `prefers-reduced-motion` only resets scroll behaviour.

**Layout rules.** Full-viewport app (`overflow: hidden`, min-width 760px). Fixed chrome rows top and bottom; three columns in between (explorer | splitter | canvas | dock). Canvas overlays are absolutely positioned (caption bottom-left at 16/48px, notices top-left). Below 1100px toolbar labels and the coordinate badge hide.

**Docking (proposed — not in source).** Side panes (explorer, generator, properties, layers) can be dragged by their header or tab into the left or right dock column. An empty column collapses to 0 and shows a 26px dashed drop target only while dragging. The column under the pointer gets an accent-soft overlay and a 2px inset accent outline. A column holding two or more panes has a 22px header with a **Split / Tabs** toggle (xs ghost buttons, active = accent-soft). **Split** stacks the panes, each with a 24px `surface-2` header (grip + 9px tracked caps title), divided by 5px row-resize splitters that turn accent on hover. **Tabs** shows one pane at a time with a 26px vertical tab strip on the column's outer edge (labels run vertically, reading bottom-to-top on the left dock and top-to-bottom on the right; active = accent text, `surface-2` fill, 2px accent edge on the pane side). The active pane keeps its 24px header so it can still be dragged. Column widths are resized with the existing 5px column splitter.

**Cards.** There are no decorative cards. "Card" = 1px border, 4px radius, 12px padding, no shadow, no fill change (e.g. preview summary, generation progress).

**Imagery colour vibe.** Cool, desaturated blue-greys; data in soft pastels. No photography.

---

## ICONOGRAPHY

- **System:** [Lucide](https://lucide.dev) via `lucide-react@^0.468.0` — outline icons on a 24px grid, 2px stroke, round caps/joins, `currentColor`.
- **In this project:** 149 glyphs copied programmatically from `lucide@0.468.0` into `assets/icons/*.svg` and embedded in the `Icon` component (`components/core/Icon.jsx`). 26 are used by the source product (`sourceIconNames`); the rest are a curated tool-app set grouped in `iconCategories` (File & project, Edit, Layout & view, Navigation, Run & build, AI & generate, Source control, Status, Search & data, System, Canvas & geometry). Use `<Icon name="PanelLeft" size={16} />`. Need another Lucide glyph? Copy it the same way rather than drawing one.
- **Sizes:** 13 (tree items, chevrons), 14 (tabs, headings, search, layer summary), 15 (command bar, dismiss), 16 (toolbar, icon buttons, project heading), 17 (brand glyph), 26 (empty state).
- **Colour:** icons inherit text colour; tree-item kind icons, the brand glyph, project heading and empty state icons are accent; tree-group icons are muted.
- **Semantic mapping:** Areas = `Pentagon`, Lanes = `Route`, Ports = `Anchor`/`MapPin`, generator = `Grid2X2`, brand/layers = `Layers`, lock = `Lock`/`LockOpen`, theme = `Sun`/`Moon`.
- **No emoji, no icon font, no PNG icons.** Unicode is used only for typographic separators (`·`, `²`, `°`, `–`) and the OpenLayers zoom `+`/`−`.
- **Logo:** none exists in the source. The titlebar shows the accent Lucide `Layers` glyph next to the product name in plain type. Do not draw a logo.

---

## Fonts

Segoe UI and Consolas are system fonts and are **not shipped**. `tokens/fonts.css` loads **Open Sans** and **Inconsolata** from Google Fonts as nearest-match fallbacks for machines without them. Supply licensed files if exact rendering is needed elsewhere.

---

## Index

- `styles.css` — entry point (imports only)
- `tokens/` — `fonts.css`, `colors.css` (dark + light + canvas), `typography.css`, `spacing.css`, `effects.css`, `base.css`
- `guidelines/` — foundation specimen cards (Colors, Type, Spacing, Brand)
- `assets/icons/` — 149 Lucide SVGs (26 from the product + curated tool-app set)
- `components/` — React primitives (see below), one `*.card.html` per folder
- `ui_kits/area-database-designer/` — interactive recreation of the workspace (`index.html`, `README.md`)
- `SKILL.md` — agent skill entry
- `thumbnail.html` — project tile

### Components

- **core/** — Icon, Button, IconButton, Badge, Separator, SectionHeading, Eyebrow, Hint, StatusDot
- **forms/** — Field, FieldPair, TextInput, Select, Checkbox, SearchBox, PositionRow, FilterGroup
- **feedback/** — Notification, Progress, SummaryCard, EmptyState, InlineStatus, MapCaption, MapNotice
- **shell/** — Titlebar, CommandBar, Spacer, Toolbar, ToolButton, CoordinateBadge, StatusBar, StatusItem, Splitter, ProblemsBar, ProblemFilter, ProblemRow
- **explorer/** — SidebarTabs, ProjectHeading, TreeGroup, TreeItem, LayerPanel
- **overlays/** — Modal, ButtonRow, DataTable, Pagination

The source has no separate component library; this inventory maps 1:1 to the CSS class families in `src/styles.css` (`.titlebar`, `.commandbar`, `.tree-item`, `.problems-bar`, `.modal`, …).

### Intentional additions

- **Icon** — wraps the copied Lucide glyph set so components don't depend on `lucide-react`. The set extends beyond the 26 source glyphs with curated Lucide icons for generic tool apps.
- **FieldPair, Spacer, StatusItem, ButtonRow** — named versions of source layout classes (`.field-pair`, `.command-spacer`, `.statusbar > span`, `.button-row`).

### UI kits

- **Area Database Designer** — `ui_kits/area-database-designer/index.html`
