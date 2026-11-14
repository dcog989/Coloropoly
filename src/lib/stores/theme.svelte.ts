export type ThemeMode = "light" | "dark";

export class ThemeStore {
  current = $state<ThemeMode>("light");
  #initialized = false;
  #media: MediaQueryList | null = null;

  init() {
    if (this.#initialized) return;
    this.#initialized = true;

    const stored = this.#readStored();
    if (stored) {
      this.current = stored;
      this.#apply();
      return;
    }

    // No saved choice: the CSS prefers-color-scheme rules decide. index.html adds a
    // class before paint to avoid a flash; drop it so those rules can take over.
    document.documentElement.classList.remove("light", "dark");
    this.#media = window.matchMedia("(prefers-color-scheme: dark)");
    this.current = this.#media.matches ? "dark" : "light";
    this.#apply();
    this.#media.addEventListener("change", this.#onMediaChange);
  }

  #readStored(): ThemeMode | null {
    try {
      const stored = localStorage.getItem("theme");
      return stored === "light" || stored === "dark" ? stored : null;
    } catch {
      return null;
    }
  }

  #onMediaChange = (event: MediaQueryListEvent) => {
    if (this.#readStored()) return;
    this.current = event.matches ? "dark" : "light";
    this.#apply();
  };

  toggle() {
    this.current = this.current === "light" ? "dark" : "light";
    this.#apply();
    if (this.#media) {
      this.#media.removeEventListener("change", this.#onMediaChange);
      this.#media = null;
    }
    try {
      localStorage.setItem("theme", this.current);
    } catch {
      /* Storage blocked; the theme still applies for this visit. */
    }
  }

  #apply() {
    if (typeof document === "undefined") return;

    // Remove both to prevent conflicts
    document.documentElement.classList.remove("light", "dark");

    // Explicitly add the current theme class
    // This ensures proper overrides against CSS media queries
    document.documentElement.classList.add(this.current);

    document.documentElement.style.colorScheme = this.current;
  }
}
