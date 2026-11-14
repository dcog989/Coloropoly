import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeStore } from "./theme.svelte";

type ChangeListener = (event: MediaQueryListEvent) => void;

const systemListeners = new Set<ChangeListener>();

function stubSystemTheme(dark: boolean) {
  systemListeners.clear();
  window.matchMedia = vi.fn((query: string) => ({
    matches: dark,
    media: query,
    onchange: null,
    addEventListener: (_type: string, listener: ChangeListener) => systemListeners.add(listener),
    removeEventListener: (_type: string, listener: ChangeListener) => systemListeners.delete(listener),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

function emitSystemTheme(dark: boolean) {
  for (const listener of [...systemListeners]) {
    listener({ matches: dark } as unknown as MediaQueryListEvent);
  }
}

const root = () => document.documentElement;

describe("ThemeStore", () => {
  beforeEach(() => {
    localStorage.clear();
    root().removeAttribute("class");
    root().removeAttribute("style");
  });

  it("keeps a saved choice over the system setting", () => {
    localStorage.setItem("theme", "dark");
    stubSystemTheme(false);

    const theme = new ThemeStore();
    theme.init();

    expect(theme.current).toBe("dark");
    expect(root().classList.contains("dark")).toBe(true);
    expect(systemListeners.size).toBe(0);
  });

  it("follows the system setting when nothing is saved", () => {
    stubSystemTheme(true);

    const theme = new ThemeStore();
    theme.init();

    expect(theme.current).toBe("dark");
    expect(root().classList.contains("dark")).toBe(true);
    expect(systemListeners.size).toBe(1);
  });

  it("follows a live system change when nothing is saved", () => {
    stubSystemTheme(false);
    const theme = new ThemeStore();
    theme.init();

    emitSystemTheme(true);

    expect(theme.current).toBe("dark");
    expect(root().classList.contains("dark")).toBe(true);
  });

  it("stops following the system after a toggle and saves the choice", () => {
    stubSystemTheme(false);
    const theme = new ThemeStore();
    theme.init();

    theme.toggle();

    expect(theme.current).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(root().classList.contains("dark")).toBe(true);
    expect(systemListeners.size).toBe(0);
  });
});
