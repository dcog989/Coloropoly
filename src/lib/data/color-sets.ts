export interface ColorSetEntry {
  /** Also the JSON filename in ./sets. */
  id: string;
  title: string;
}

export const COLOR_SETS: ColorSetEntry[] = [
  { id: "bootstrap", title: "Bootstrap" },
  { id: "catppuccin-frappe", title: "Catppuccin Frappé" },
  { id: "catppuccin-latte", title: "Catppuccin Latte" },
  { id: "catppuccin-macchiato", title: "Catppuccin Macchiato" },
  { id: "catppuccin-mocha", title: "Catppuccin Mocha" },
  { id: "css-named-colors", title: "CSS Named Colors" },
  { id: "dracula", title: "Dracula" },
  { id: "farrow-ball", title: "Farrow & Ball" },
  { id: "github-primer", title: "GitHub Primer" },
  { id: "gruvbox", title: "Gruvbox" },
  { id: "material-design", title: "Material Design" },
  { id: "nord", title: "Nord" },
  { id: "one-dark", title: "One Dark" },
  { id: "one-light", title: "One Light" },
  { id: "pantone", title: "Pantone Coated" },
  { id: "pantone-uncoated", title: "Pantone Uncoated" },
  { id: "ral-classic", title: "RAL Classic" },
  { id: "resistor-color-code", title: "Resistor Color Code" },
  { id: "solarized", title: "Solarized" },
  { id: "tableau-20", title: "Tableau 20" },
  { id: "tailwind-v4", title: "Tailwind CSS v4" },
  { id: "tokyo-night", title: "Tokyo Night" },
  { id: "windows-terminal", title: "Windows Terminal" },
  { id: "xterm-256", title: "xterm-256" },
].sort((a, b) => a.title.localeCompare(b.title));

interface ColorSetModule {
  colors: Record<string, string>;
}

const loaders = import.meta.glob<ColorSetModule>("./sets/*.json", {
  eager: false,
  import: "default",
});

const ids = new Set(COLOR_SETS.map((set) => set.id));
const cache = new Map<string, Record<string, string>>();

export async function loadColorSet(id: string): Promise<Record<string, string> | null> {
  const cached = cache.get(id);
  if (cached) return cached;
  if (!ids.has(id)) return null;

  const loader = loaders[`./sets/${id}.json`];
  if (!loader) return null;

  const mod = await loader();
  if (!mod?.colors) return null;

  cache.set(id, mod.colors);
  return mod.colors;
}
