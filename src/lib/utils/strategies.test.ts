import { beforeAll, describe, expect, it, vi } from "vitest";
import type { RootStore } from "../stores/root.svelte";
import {
  type ColorSource,
  downloadFile,
  escapeXml,
  exportCode,
  exportCodeFile,
  exportSource,
  exportVisual,
  generateColorLabel,
  generateColorName,
  generateFilename,
  getColorSource,
  strategies,
} from "./strategies";

const source = (colors: string[], name = "Test"): ColorSource => ({
  colors: colors.map((css) => ({ css })),
  isSingle: colors.length === 1,
  name,
});

const rootWith = (items: Array<{ css: string }>, name = "Fuzzy Wuzzy"): RootStore =>
  ({
    paintbox: { items },
    color: { hex: "#abcdef", cssVar: "oklch(75% 0.1 250 / 0.5)" },
    engine: { closestName: name },
  }) as unknown as RootStore;

describe("escapeXml", () => {
  it("escapes the characters that would break an SVG document", () => {
    expect(escapeXml("Dark & Stormy")).toBe("Dark &amp; Stormy");
    expect(escapeXml(`<a href="x">'y'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&apos;y&apos;&lt;/a&gt;");
  });
});

describe("DTCG export", () => {
  it("emits an sRGB color token with hex fallback", () => {
    const parsed = JSON.parse(strategies.dtcg.format(source(["#ff00ff"]), "hex"));

    expect(parsed.color.test.$type).toBe("color");
    expect(parsed.color.test.$value.colorSpace).toBe("srgb");
    expect(parsed.color.test.$value.components).toEqual([1, 0, 1]);
    expect(parsed.color.test.$value.hex).toBe("#ff00ff");
  });

  it("emits OKLCH tokens when requested", () => {
    const parsed = JSON.parse(strategies.dtcg.format(source(["#ff00ff"]), "oklch"));

    expect(parsed.color.test.$value.colorSpace).toBe("oklch");
    expect(parsed.color.test.$value.hex).toBe("#ff00ff");
  });

  it("emits HSL tokens when requested", () => {
    const parsed = JSON.parse(strategies.dtcg.format(source(["#ff00ff"]), "hsl"));

    expect(parsed.color.test.$value.colorSpace).toBe("hsl");
    expect(parsed.color.test.$value.components).toHaveLength(3);
  });

  it("falls back to black for unparseable colors", () => {
    const parsed = JSON.parse(strategies.dtcg.format(source(["not-a-color"]), "hex"));

    expect(parsed.color.test.$value.components).toEqual([0, 0, 0]);
    expect(parsed.color.test.$value.hex).toBe("#000000");
  });

  it("uses its own filename so JSON and DTCG downloads do not collide", () => {
    const root = rootWith([]);
    const jsonName = generateFilename(root, strategies.json.extension ?? "");
    const dtcgName = generateFilename(root, strategies.dtcg.extension ?? "");

    expect(dtcgName).not.toBe(jsonName);
    expect(dtcgName).toBe("Color-Picker-Palette-Fuzzy-Wuzzy.tokens.json");
  });
});

describe("GIMP GPL export", () => {
  it("emits a valid palette header and RGB rows", () => {
    const lines = strategies.gpl.format(source(["#ff0000", "#00ff00"]), "hex").split("\n");

    expect(lines[0]).toBe("GIMP Palette");
    expect(lines[1]).toBe("Name: Color Picker Palette");
    expect(lines[4]).toMatch(/^\s*255\s+0\s+0\s+color-1$/);
    expect(lines[5]).toMatch(/^\s*0\s+255\s+0\s+color-2$/);
  });

  it("falls back to black for unparseable colors", () => {
    const lines = strategies.gpl.format(source(["not-a-color"]), "hex").split("\n");

    expect(lines[4]).toMatch(/^\s*0\s+0\s+0\s+test$/);
  });

  it("keeps the readable color name, not the code slug", () => {
    const named: ColorSource = {
      colors: [{ name: "Breakfast Room Green (No. 81)", css: "#ff0000" }],
      isSingle: false,
    };

    expect(strategies.gpl.format(named, "hex")).toContain("\tBreakfast Room Green (No. 81)");
  });
});

describe("code export strategies", () => {
  it("formats CSS variables", () => {
    const output = strategies.css.format(source(["#ff0000", "#00ff00"]), "hex");

    expect(output).toBe(":root {\n  --color-1: #ff0000;\n  --color-2: #00ff00;\n}");
  });

  it("formats a Tailwind config", () => {
    const output = strategies.tailwind.format(source(["#ff0000", "#00ff00"]), "hex");

    // The whole output must be valid JS, not a bare fragment.
    expect(output.startsWith("export default {")).toBe(true);
    expect(output.endsWith("};")).toBe(true);
    expect(output).toContain("colors: {");
    expect(output).toContain("'color-1': '#ff0000',");
    expect(output).toContain("'color-2': '#00ff00',");
  });

  it("formats Android XML with underscore names", () => {
    const output = strategies.xml.format(source(["#ff0000", "#00ff00"]), "oklch");

    expect(output).toContain('<?xml version="1.0" encoding="utf-8"?>');
    expect(output).toContain('<color name="color_1">#FF0000</color>');
    expect(output).toContain('<color name="color_2">#00FF00</color>');
  });

  it("formats JSON", () => {
    const output = strategies.json.format(source(["#ff0000", "#00ff00"]), "hex");

    expect(JSON.parse(output)).toEqual({ "color-1": "#ff0000", "color-2": "#00ff00" });
  });

  it("formats SCSS variables", () => {
    const output = strategies.scss.format(source(["#ff0000", "#00ff00"]), "hex");

    expect(output).toBe("// Color Variables\n$color-1: #ff0000;\n$color-2: #00ff00;");
  });
});

describe("color source helpers", () => {
  it("uses paintbox items when present", () => {
    const result = getColorSource(rootWith([{ css: "#111111" }, { css: "#222222" }]));

    expect(result.colors).toHaveLength(2);
    expect(result.isSingle).toBe(false);
    expect(result.name).toBe("Fuzzy Wuzzy");
  });

  it("falls back to the single active color, keeping alpha", () => {
    const result = getColorSource(rootWith([]));

    expect(result.colors).toEqual([{ css: "oklch(75% 0.1 250 / 0.5)" }]);
    expect(result.isSingle).toBe(true);
  });

  it("slugifies single-color names and numbers palette colors", () => {
    expect(generateColorName(0, { colors: [], isSingle: true, name: "Fuzzy Wuzzy!" })).toBe("fuzzy-wuzzy");
    expect(generateColorName(2, { colors: [], isSingle: false, name: "Fuzzy Wuzzy!" })).toBe("color-3");
  });

  it("builds a safe filename from the closest name", () => {
    expect(generateFilename(rootWith([], "Fuzzy Wuzzy!"), "css")).toBe("Color-Picker-Palette-Fuzzy-Wuzzy.css");
  });
});

describe("named color sources", () => {
  const named = (entries: Array<[string, string]>): ColorSource => ({
    colors: entries.map(([name, css]) => ({ name, css })),
    isSingle: false,
    name: "Test Set",
  });

  it("slugifies palette names for code formats", () => {
    expect(strategies.css.format(named([["Slate 50", "#f8fafc"]]), "hex")).toBe(":root {\n  --slate-50: #f8fafc;\n}");
    expect(strategies.scss.format(named([["Slate 50", "#f8fafc"]]), "hex")).toBe(
      "// Color Variables\n$slate-50: #f8fafc;",
    );
    expect(strategies.less.format(named([["Slate 50", "#f8fafc"]]), "hex")).toBe("@slate-50: #f8fafc;");
  });

  it("prefixes names that start with a digit", () => {
    const output = strategies.css.format(named([["100 C", "#ffffff"]]), "hex");
    expect(output).toContain("--c-100-c: #ffffff;");
  });

  it("keeps readable names in data formats", () => {
    expect(JSON.parse(strategies.json.format(named([["Slate 50", "#f8fafc"]]), "hex"))).toEqual({
      "Slate 50": "#f8fafc",
    });
    expect(strategies.csv.format(named([["Slate 50", "#f8fafc"]]), "hex")).toBe('name,value\n"Slate 50","#f8fafc"');
    expect(strategies.text.format(named([["Slate 50", "#f8fafc"]]), "hex")).toBe("Slate 50  #f8fafc");
    expect(generateColorLabel(0, named([["Slate 50", "#f8fafc"]]))).toBe("Slate 50");
  });

  it("quotes CSV cells that contain commas or quotes", () => {
    const output = strategies.csv.format(named([['Odd, "name"', "#ff0000"]]), "rgb");
    expect(output).toBe('name,value\n"Odd, ""name""","rgb(255 0 0)"');
  });

  it("exports a prepared source directly", () => {
    expect(exportSource(named([["Red", "#ff0000"]]), "css", "hex")).toContain("--red: #ff0000;");
    expect(() => exportSource(named([["Red", "#ff0000"]]), "nope")).toThrow(/Unknown export strategy/);
  });
});

describe("exportCode", () => {
  const root = rootWith([{ css: "#ff0000" }, { css: "#00ff00" }]);

  it("formats the requested strategy", () => {
    expect(exportCode(root, "css", "hex")).toContain("--color-1: #ff0000;");
  });

  it("throws for an unknown strategy", () => {
    expect(() => exportCode(root, "nope")).toThrow(/Unknown export strategy/);
  });
});

describe("exportCodeFile", () => {
  const root = rootWith([{ css: "#ff0000" }]);

  beforeAll(() => {
    URL.createObjectURL = vi.fn(() => "blob:mock");
    URL.revokeObjectURL = vi.fn();
  });

  it("downloads a file for a strategy with a file format", () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    exportCodeFile(root, "dtcg", "hex");

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    click.mockRestore();
  });

  it("throws for a strategy without a file format", () => {
    expect(() => exportCodeFile(root, "css", "hex")).toThrow(/no file format/);
  });

  it("downloads Android XML now that it has a file format", () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    exportCodeFile(root, "xml", "hex");

    expect(click).toHaveBeenCalled();
    click.mockRestore();
  });

  it("downloads JSON now that it has a file format", () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    exportCodeFile(root, "json", "hex");

    expect(click).toHaveBeenCalled();
    click.mockRestore();
  });

  it("throws for an unknown strategy", () => {
    expect(() => exportCodeFile(root, "nope")).toThrow(/Unknown export strategy/);
  });
});

describe("exportVisual", () => {
  beforeAll(() => {
    URL.createObjectURL = vi.fn(() => "blob:mock");
    URL.revokeObjectURL = vi.fn();
  });

  it("renders the visual strategy and downloads the blob", async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    await exportVisual(rootWith([{ css: "#ff0000" }]), "svg");

    expect(click).toHaveBeenCalled();
    click.mockRestore();
  });

  it("throws for an unknown visual strategy", async () => {
    await expect(exportVisual(rootWith([]), "nope")).rejects.toThrow(/Unknown visual export strategy/);
  });
});

describe("downloadFile", () => {
  beforeAll(() => {
    URL.createObjectURL = vi.fn(() => "blob:mock");
    URL.revokeObjectURL = vi.fn();
  });

  it("downloads string and blob payloads", () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    downloadFile("body", "file.txt");
    downloadFile(new Blob(["body"]), "file.bin", "application/octet-stream");

    expect(click).toHaveBeenCalledTimes(2);
    click.mockRestore();
  });
});
