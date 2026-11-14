import { describe, expect, it } from "vitest";
import { flattenColor, usesDarkText } from "./text-contrast";

describe("usesDarkText", () => {
  it("asks for dark text on light backgrounds and light text on dark", () => {
    expect(usesDarkText("#ffffff")).toBe(true);
    expect(usesDarkText("#000000")).toBe(false);
  });

  it("falls back to light text for invalid input", () => {
    expect(usesDarkText("not-a-color")).toBe(false);
  });

  it("prefers white on mid-tones where the WCAG ratio barely picks black", () => {
    // WCAG 4.70 vs 4.46, but APCA -32 vs +70.
    expect(usesDarkText("#dd3747")).toBe(false);
    expect(usesDarkText("#6c757d")).toBe(false);
  });

  it("flattens a translucent color over white before choosing text", () => {
    // 10% black over white is nearly white, so black text wins; solid black would not.
    expect(usesDarkText("#0000001a")).toBe(true);
    expect(usesDarkText("#000000")).toBe(false);
  });
});

describe("flattenColor", () => {
  it("returns opaque colors unchanged", () => {
    expect(flattenColor("#dd3747")).toBe("#dd3747");
    expect(flattenColor("#dd3747", "#000000")).toBe("#dd3747");
  });

  it("composites a translucent color over the surface", () => {
    expect(flattenColor("#ff000080", "#ffffff")).toBe("#ff7f7f");
    expect(flattenColor("#0000001a", "#ffffff")).toBe("#e5e5e5");
    expect(flattenColor("#ffffff1a", "#000000")).toBe("#1a1a1a");
    expect(flattenColor("#00000000", "#ffffff")).toBe("#ffffff");
  });

  it("returns invalid input unchanged so callers keep their own validity check", () => {
    expect(flattenColor("not-a-color")).toBe("not-a-color");
  });
});
