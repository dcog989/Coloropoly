import { describe, expect, it } from "vitest";
import { fromColorHash, toColorHash } from "./url-color";

describe("toColorHash", () => {
  it("encodes the spaces in an oklch string", () => {
    expect(toColorHash("oklch(0.7 0.3 30)")).toBe("#oklch(0.7%200.3%2030)");
  });
});

describe("fromColorHash", () => {
  it("round-trips an oklch string with alpha", () => {
    const css = "oklch(0.7 0.3 30 / 0.5)";
    expect(fromColorHash(toColorHash(css))).toBe(css);
  });

  it("passes a plain hex through", () => {
    expect(fromColorHash("#ff0000")).toBe("#ff0000");
  });

  it("returns null for an empty or bare hash", () => {
    expect(fromColorHash("")).toBeNull();
    expect(fromColorHash("#")).toBeNull();
  });

  it("returns null for malformed percent encoding", () => {
    expect(fromColorHash("#%")).toBeNull();
  });
});
