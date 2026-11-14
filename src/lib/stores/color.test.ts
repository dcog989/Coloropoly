import { describe, expect, it } from "vitest";
import { ColorStore } from "./color.svelte";

describe("ColorStore", () => {
  it("keeps an explicitly set hue on a neutral color", () => {
    const store = new ColorStore();
    expect(store.set("#808080")).toBe(true);
    expect(store.c).toBeLessThanOrEqual(0.001);

    store.h = 200;

    expect(store.h).toBeCloseTo(200);
    expect(store.c).toBeLessThanOrEqual(0.001);
  });
});
