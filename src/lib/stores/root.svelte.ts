import { PAINTBOX } from "../constants";
import { evictedCount } from "../utils/paintbox";
import { ColorStore } from "./color.svelte";
import { EngineStore } from "./engine.svelte";
import { ImageStore } from "./image.svelte";
import { PaintboxStore } from "./paintbox.svelte";
import { PanelStore } from "./panels.svelte";
import { ThemeStore } from "./theme.svelte";
import { ToastStore } from "./toast.svelte";
import "../utils/color-plugins";

export class RootStore {
  precision = $state<"precise" | "practical">("practical");
  color: ColorStore;
  toast = new ToastStore();
  paintbox = new PaintboxStore();
  panels = new PanelStore();
  image = new ImageStore();
  theme = new ThemeStore();
  engine: EngineStore;

  constructor() {
    // ColorStore depends on precision getter
    this.color = new ColorStore(() => this.precision);
    // Engine depends on Color
    this.engine = new EngineStore(this.color);
  }

  init() {
    this.theme.init();
    this.paintbox.init();
    this.engine.init();
  }

  destroy() {
    this.engine.destroy();
    this.image.destroy();
    this.paintbox.destroy();
  }

  async copy(text: string, e?: MouseEvent) {
    try {
      await navigator.clipboard.writeText(text);
      this.toast.showAt("Copied", e);
    } catch {
      this.toast.showAt("Copy failed", e);
    }
  }

  /**
   * Add colors, asking first when the paintbox cap would drop saved ones.
   * Returns how many colors the cap dropped, or null when the user cancels.
   */
  addColors(colors: readonly string[]): number | null {
    const dropped = evictedCount(this.paintbox.items, colors, PAINTBOX.MAX_COLORS);
    if (
      dropped > 0 &&
      !confirm(`Adding will remove your ${dropped} oldest saved color${dropped === 1 ? "" : "s"}. Continue?`)
    ) {
      return null;
    }

    for (const css of colors) this.paintbox.add(css);
    return dropped;
  }
}
