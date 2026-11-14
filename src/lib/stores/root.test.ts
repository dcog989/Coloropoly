import { beforeEach, describe, expect, it, vi } from "vitest";
import { PAINTBOX } from "../constants";
import { RootStore } from "./root.svelte";

const palette = (count: number) => Array.from({ length: count }, (_, i) => `#${i.toString(16).padStart(6, "0")}`);

describe("RootStore.addColors", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("adds colors when the paintbox has room", () => {
    const root = new RootStore();

    expect(root.addColors(["#ff0000"])).toBe(0);
    expect(root.paintbox.items).toHaveLength(1);
  });

  it("keeps the saved colors when the user cancels the eviction", () => {
    const root = new RootStore();
    root.addColors(palette(PAINTBOX.MAX_COLORS));
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);

    expect(root.addColors(["#ff0000"])).toBeNull();
    expect(confirm).toHaveBeenCalledOnce();
    expect(root.paintbox.items).toHaveLength(PAINTBOX.MAX_COLORS);
    expect(root.paintbox.items.some((item) => item.css === "#ff0000")).toBe(false);
  });

  it("reports how many colors the cap dropped", () => {
    const root = new RootStore();
    root.addColors(palette(PAINTBOX.MAX_COLORS));
    vi.spyOn(window, "confirm").mockReturnValue(true);

    expect(root.addColors(["#ff0000"])).toBe(1);
    expect(root.paintbox.items.some((item) => item.css === "#ff0000")).toBe(true);
    expect(root.paintbox.items).toHaveLength(PAINTBOX.MAX_COLORS);
  });
});
