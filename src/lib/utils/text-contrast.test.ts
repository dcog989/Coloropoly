import { describe, expect, it } from "vitest";
import { usesDarkText } from "./text-contrast";

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
});
