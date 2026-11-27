# Coloropoly

A color picker toolbox with palette generator, image analyser, contrast checker, color set browser, and export options. Author in Okhsl (default, gamut-aware), Oklch (wide gamut), or RGB, then copy or export to whichever format you need.

Visit [Coloropoly](https://dcog989.github.io/Coloropoly/).

![Coloropoly](assets/screen-1.webp)

## Features

- **Perceptual Pickers:** Okhsl (default, gamut-aware), Oklch (wide gamut), or RGB, with nearest-sRGB mapping for out-of-gamut colors.
- **Palette Engine:** Six harmonies (complementary, split-complementary, analogous, triadic, tetradic, rectangle) and variable scales on lightness, chroma, hue, or alpha.
- **Image Analysis:** Extract dominant and vibrant palettes locally with histogram clustering; sort by dominant, vibrant, bright, or dark.
- **Accessibility:** Real-time APCA (Lc) and WCAG 2.1 contrast checking.
- **Smart Paintbox:** Persistent palette, import from DTCG JSON or GIMP `.gpl`, export to CSS, Tailwind, SCSS, Less, JSON, CSV, DTCG, Android XML, GPL, or text in Oklch/HEX/HSL/RGB, plus PNG and SVG images.
- **Library:** Search 30,000+ named colors.
- **Color Sets:** Browse 24 curated palettes (Tailwind, Material, Pantone, Catppuccin, Nord, and more), filter and sort them, copy any swatch or the whole set in any export format, and simulate color-vision deficiencies.
- **Shareable:** The current color mirrors to the URL hash, so any color is linkable.
- **Themes:** Light and dark, persisted.

## Tech Stack

- Svelte / TypeScript / Tailwind / Vite / Biome
- **Color:** colordx

## Getting Started

Required: [bun](https://bun.sh). The git hooks and the release flow also need [cog](https://docs.cocogitto.io/) on your `PATH`; `bun install` installs the hooks, so `cog` must be present before your first commit.

| Command          | Action                                                      |
| ---------------- | ----------------------------------------------------------- |
| `bun install`    | Install dependencies (also installs git hooks via Lefthook) |
| `just dev`       | Start dev server at <http://localhost:5173>                 |
| `just build`     | Production build to `dist/`                                 |
| `just preview`   | Preview build                                               |
| `just check`     | All checks: Biome + typecheck + test with coverage + build  |
| `just audit`     | Dependency advisories (same ignores as CI)                  |
| `just typecheck` | svelte-check + `bun --check`                                |
| `just test`      | Run tests                                                   |
| `just coverage`  | Tests with coverage (80% floor)                             |
| `just format`    | All fixes: Biome auto-fix (format/lint/imports)             |
| `just changelog` | Print the changelog to stdout                               |

## Releasing

1. Commit with [Conventional Commits](https://www.conventionalcommits.org/); Lefthook and CI enforce the format.
2. Run `just release` (`cog bump --auto`).
3. The bump checks the tree is clean and level with `origin/main`, runs `cog check`, `just audit` and `just check`, syncs the version, commits and tags, pushes, then creates the GitHub release with the tag's changelog section as notes and `CHANGELOG.md` attached as an asset. CI checks the tag as well, so a broken release shows red immediately.

Requires `cog` and an authenticated `gh`. `main` deploys to GitHub Pages once CI passes.

## License

[MIT License](LICENSE).
