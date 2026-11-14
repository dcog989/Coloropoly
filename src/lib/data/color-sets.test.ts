import { describe, expect, it } from "vitest";
import { loadColorSet } from "./color-sets";

describe("loadColorSet", () => {
  it("loads a set and caches it", async () => {
    const first = await loadColorSet("nord");
    expect(Object.keys(first ?? {})).toHaveLength(16);
    expect(await loadColorSet("nord")).toBe(first);
  });

  it("returns null for an unknown id", async () => {
    expect(await loadColorSet("not-a-color-set")).toBeNull();
  });
});
