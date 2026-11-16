# Agent Directives

## Project Specifics

- Name: coloropoly
- Description: Color picker, palette generator, image extraction, contrast checker, color set browser SPA
- Tech: Svelte 5 (Runes API), Vite, TypeScript 6 (strict), Tailwind CSS v4, colordx, Biome, Vitest
  - TypeScript pinned at `6.0.3` via overrides — `svelte-check` peer deps don't allow TS 7 yet

### Key Files

- `src/main.ts` — entry point, mounts `App.svelte`
- `src/App.svelte` — shell, theme bootstrap, URL hash color sync, Color Sets section mount
- `src/lib/context.ts` — `getApp()` accessor for the root store
- `src/lib/stores/*.svelte.ts` — runes state: `root` (app facade), `color`, `engine`, `image`, `paintbox` (localStorage), `theme` (localStorage), `toast`
- `src/lib/panels/*.svelte` — picker, palette, image, contrast, paintbox panels
- `src/lib/modals/*.svelte` — export, search, info dialogs
- `src/lib/components/*.svelte` — sliders, swatches, grid, title, toast
- `src/lib/utils/strategies.ts` — export strategies (code + visual) with named palette support
- `src/lib/utils/palette-sets.ts` — color set parsing, filtering, sorting, APCA text choice
- `src/lib/data/color-sets.ts` — palette set manifest and lazy loader
- `src/lib/data/sets/*.json` — 24 curated palette sets
- `src/lib/layout/ColorSetsSection.svelte` — color sets browser section
- `src/lib/components/ColorBlindFilters.svelte` — color-vision simulation SVG filters
- `src/lib/utils/import-strategies.ts` — DTCG JSON and GPL palette import
- `src/lib/utils/formatters.ts` — color parsing and value formatting
- `src/lib/utils/palette.ts`, `image-palette.ts`, `color-clusters.ts`, `text-contrast.ts` — pure logic
- `src/lib/utils/format.test.ts` — tests; every logic util has a colocated `.test.ts`
- `src/lib/workers/color-analysis.ts` — image analysis worker (histogram clustering)
- `src/lib/workers/color-name-search.ts` — color name search worker
- `src/lib/data/colors.ts` — 30,000+ named colors

### Architecture

- Static SPA: no backend, no router, no API calls. Everything runs in the browser.
- State lives in runes stores; components read it through `getApp()`.
- Heavy work (image clustering, name search) runs in the two workers; the algorithms live in tested utils, not in the worker.
- Color Sets load one palette JSON at a time through `import.meta.glob`; the section reads state through `getApp()` like the panels.
- The current color mirrors to the URL hash and is restored on load.

### Workflow

| Command                 | Action                                                |
| ----------------------- | ----------------------------------------------------- |
| `just check`            | All checks: Biome + typecheck + test:coverage + build |
| `just dev`              | Start dev server (<http://localhost:5173>)            |
| `just test`             | Vitest                                                |
| `just lint`             | Linter alone (Biome)                                  |
| `just format`           | All fixes: Biome auto-fix (format/lint/imports)       |
| `just build`            | Production build                                      |
| `just clean`            | Remove coverage, dist and node_modules                |
| `bun install`           | Install deps, installs git hooks                      |
| `just preview`          | Preview build                                         |
| `just typecheck`        | svelte-check + `bun --check`                          |
| `just coverage`         | Vitest with coverage (80% floor)                      |
| `just changelog`        | Print changelog to stdout                             |

### Common Patterns

- Add feature: pure logic in `src/lib/utils/` with a test, state in the relevant store, UI in a panel or section.
- New export format: extend `ExportStrategyName` and the strategy map in `src/lib/utils/strategies.ts`; it is picked up by `exportCode`/`exportSource` and the Export Modal.
- Add a color set: drop `{ "colors": { name: hex } }` in `src/lib/data/sets/<id>.json` and add its id and title to `COLOR_SETS` in `src/lib/data/color-sets.ts`.
- Color parsing/formatting: use `safeColor`/`formatColor` from `formatters.ts`; do not re-implement parsing.
- Heavy computation: export a pure function from `src/lib/utils/`, call it from the worker.
- UI state access: `getApp()` from `src/lib/context.ts`, not direct store imports, where a component is involved.

### Verification

- `just check` must pass: Biome, typecheck, tests with coverage, build.
- Coverage floor is 80% (lines, statements, functions, branches). `stores/`, `workers/`, `visual-strategies.ts`, `context.ts`, `constants.ts`, and `data/` are excluded — keep logic in `src/lib/utils/` so it is covered.

### Releasing

- Commits are Conventional Commits; Lefthook `commit-msg` runs `cog verify`, CI runs `cog check`.
- `just release` (`cog bump --auto`) runs pre-bump hooks (`just check`, `scripts/sync_version.sh`), then pushes, pushes the tag, and creates the GitHub release with `cog changelog --at <tag>` as notes and `CHANGELOG.md` as an asset.
- Never run `just release`, `cog bump`, or the push/release hooks unless explicitly instructed.

### File System Access

- Root: `/home/bubba/Projects/Color-Picker-Palette/`
- Allowed: All subdirectories except disallowed
- Read-Only: `.env*`, `.git/`
- Disallowed: `.assets/`, `.context/`, `.docs/`, `.git/`, `.repomix/`, `.repomixignore`, `node_modules/`, `dist/`, `build/`, `.svelte-kit/`, `bun.lock`, `repomix.*.json`
- Require confirmation: adding/removing dependencies, destructive operations, any operation outside project root. Docs and release config (`README.md`, `AGENTS.md`, `cog.toml`, `scripts/`, `.github/`) are editable when the task requires it.

---

## General Guidelines

### Code Changes

- For non-trivial work, propose an approach and confirm before implementing, including architectural changes.
- Keep modifications minimal and scoped; prefer incremental improvements over rewrites.
- Use explicit types and named constants (no magic numbers).
- Return explicit error types; do not suppress exceptions.
- Follow standard repository linting and formatting configs.
- Decompose files over 400 lines if they mix concerns.
- Name things clearly; reserve comments for the non-obvious why (workarounds, edge cases).
- Never run git mutations (commit, push, reset, rebase, amend) unless explicitly instructed.
- Do not create documentation files unless explicitly requested.
- Adhere to <https://develop.kde.org/hig/>.

### Author Environment

- Ryzen 5800X3D, Radeon RX 7900 XT, Display (AW3225QF); CachyOS, KDE, KWin / Wayland, Btrfs.
- fish shell, Ghostty terminal, Fresh TUI editor, yay package manager, bun npm manager, Firefox, Zed code editor.

### Testing

- Add tests only when the logic is genuinely testable and worth guarding. No test files for trivial changes or behavior the environment cannot test reliably (e.g. UI layout/click mapping).

### Definition of Done

- Logic fully implemented.
- Existing docs updated if public interfaces changed.
- Run the corresponding `Workflow` command when `Verification` requires it.

### Commit Messages

- On completion of an update or fix, print a conventional commit message in a fenced code block.
- Add a body only when the "why" isn't obvious.
- Never hard-wrap: one physical line per paragraph, however long.

### Communication Style

- Format: short declarative sentences, one idea per line.
- Instructions: numbered steps, one action each (exact command, path, or code); no prose recap.
- Explanations: essential context only. End question answers with `TL;DR:`, one sentence; omit for status updates and completed work.
- Tone: no preamble, restating, hedging, disclaimers, emotional framing, or closing offers. Keep every fact, command, flag, path, default, caveat.
- Edge Cases: state risks explicitly; ask when requirements are ambiguous.
