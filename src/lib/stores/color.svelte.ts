import type { Colordx } from "@colordx/core";
import { colordx, inGamutSrgb } from "@colordx/core";
import "../utils/color-plugins";
import {
  clampHue,
  decimalsFor,
  formatHsl,
  formatHsv,
  formatHwb,
  formatOkhsl,
  formatOklch,
  formatRgb,
  getMaxSrgbChroma,
} from "../utils/color-format";
import { normalizeColorString } from "../utils/formatters";

const RANDOM_HUE_MAX = 360;
const RANDOM_LIGHTNESS = 0.45;
const RANDOM_CHROMA = 0.08;
const MIN_CHROMA_MAX = 0.001;
const MEANINGFUL_CHROMA = 0.001;
// Black and white carry no chroma or hue, so channels within this distance of
// either end of the lightness scale are treated as the endpoints.
const EDGE_LIGHTNESS = 0.001;

export class ColorStore {
  #current = $state<Colordx>(ColorStore.#getRandomColor());
  #oklch = $derived(this.#current.toOklch());
  #lastMeaningfulHue = 0;
  #lastChroma = 0;
  mode = $state<"okhsl" | "oklch" | "rgb">("okhsl");
  #precisionMode: () => "precise" | "practical" = () => "practical";

  constructor(precisionGetter: () => "precise" | "practical" = () => "practical") {
    this.#precisionMode = precisionGetter;
    // Capture initial hue and chroma if meaningful
    const init = this.#oklch;
    if (init.c > MEANINGFUL_CHROMA) {
      this.#lastMeaningfulHue = init.h;
      this.#lastChroma = init.c;
    }
  }

  static #getRandomColor(): Colordx {
    const h = Math.random() * RANDOM_HUE_MAX;
    return colordx({ l: RANDOM_LIGHTNESS, c: RANDOM_CHROMA, h }).mapSrgb();
  }

  #setCurrent(color: Colordx) {
    const oklch = color.toOklch();
    if (oklch.c > MEANINGFUL_CHROMA) {
      this.#lastMeaningfulHue = oklch.h;
      this.#lastChroma = oklch.c;
    }
    this.#current = color;
  }

  set(value: string): boolean {
    try {
      const parsed = colordx(normalizeColorString(value));
      if (!parsed.isValid()) return false;
      this.#setCurrent(parsed);
      return true;
    } catch {
      return false;
    }
  }

  get l() {
    return this.#oklch.l;
  }
  set l(v: number) {
    this.#setOklchField("l", v);
  }

  get c() {
    const { l, c } = this.#oklch;
    // The ends of the lightness scale erase chroma; keep the last value so
    // dragging lightness there and back does not wipe it.
    return l <= EDGE_LIGHTNESS || l >= 1 - EDGE_LIGHTNESS ? this.#lastChroma : c;
  }
  set c(v: number) {
    this.#lastChroma = v;
    this.#setOklchField("c", v);
  }

  get h() {
    const { c, h } = this.#oklch;
    return c > MEANINGFUL_CHROMA ? h : this.#lastMeaningfulHue;
  }
  set h(v: number) {
    // Record an explicit hue so a neutral color keeps it when chroma rises later.
    this.#lastMeaningfulHue = clampHue(v);
    this.#setOklchField("h", this.#lastMeaningfulHue);
  }

  #setOklchField(field: "l" | "c" | "h", value: number) {
    const { l, c, alpha } = this.#oklch;
    const h = this.h;
    this.#setCurrent(colordx({ l, c, h, alpha, [field]: value }));
  }

  get alpha() {
    return this.#current.alpha();
  }
  set alpha(v: number) {
    this.#setCurrent(this.#current.alpha(v));
  }

  #isOutOfGamut = $derived.by(() => !inGamutSrgb(this.#oklch));

  get isOutOfGamut() {
    return this.#isOutOfGamut;
  }

  #maxChroma = $derived.by(() => getMaxSrgbChroma(this.l, this.h));

  get maxChroma() {
    return this.#maxChroma;
  }

  #chromaMax = $derived.by(() => Math.max(this.#maxChroma, this.c, MIN_CHROMA_MAX));

  get chromaMax() {
    return this.#chromaMax;
  }

  #displayColor = $derived.by(() => (inGamutSrgb(this.#oklch) ? this.#current : this.#current.clampSrgb()));

  rgbComp = $derived(this.#displayColor.toRgb(this.rgbDecimals));

  mapToSrgb() {
    this.#setCurrent(this.#current.mapSrgb());
  }

  setRgbValues(r: number, g: number, b: number) {
    this.#setCurrent(colordx({ r, g, b, alpha: this.alpha }));
  }

  setOkhslValues(h: number, s: number, l: number) {
    this.#setCurrent(
      colordx({
        h: clampHue(h),
        s: Math.max(0, Math.min(s, 100)),
        l: Math.max(0, Math.min(l, 100)),
        alpha: this.alpha,
        colorSpace: "okhsl",
      }),
    );
  }

  get okhslComp() {
    return this.#displayColor.toOkhsl();
  }

  formatColor(css: string): string {
    let parsed: Colordx;
    try {
      parsed = colordx(css);
    } catch {
      return css;
    }

    if (!parsed.isValid()) {
      return css;
    }

    const precise = this.#precisionMode() === "precise";
    if (this.mode === "rgb") {
      return formatRgb(parsed, precise);
    } else if (this.mode === "okhsl") {
      return formatOkhsl(parsed, precise);
    } else {
      return formatOklch(parsed, precise);
    }
  }

  display = $derived(formatOklch(this.#current, this.#precisionMode() === "precise"));

  get #decimals(): { channel: number; percent: number; hue: number; rgb: number } {
    return decimalsFor(this.#precisionMode() === "precise");
  }

  get channelDecimals(): number {
    return this.#decimals.channel;
  }

  get hueDecimals(): number {
    return this.#decimals.hue;
  }

  // Percent is the 0..100 form of a 0..1 channel, so it needs two fewer places.
  get percentDecimals(): number {
    return this.#decimals.percent;
  }

  // Slider steps must match the printed precision, or dragging changes a digit the
  // readout hides. The step is on the 0..1 scale; okhsl sliders multiply by 100.
  get channelStep(): number {
    return 10 ** -this.channelDecimals;
  }

  get hueStep(): number {
    return 10 ** -this.hueDecimals;
  }

  get rgbDecimals(): number {
    return this.#decimals.rgb;
  }

  get rgbStep(): number {
    return 10 ** -this.rgbDecimals;
  }

  hex = $derived(this.#displayColor.alpha(1).toHex());

  hexa = $derived(this.#displayColor.toHex());

  rgb = $derived(formatRgb(this.#displayColor, this.#precisionMode() === "precise"));

  hsl = $derived(formatHsl(this.#displayColor, this.#precisionMode() === "precise"));

  hsv = $derived(formatHsv(this.#displayColor, this.#precisionMode() === "precise"));

  hwb = $derived(formatHwb(this.#displayColor, this.#precisionMode() === "precise"));

  okhsl = $derived(formatOkhsl(this.#displayColor, this.#precisionMode() === "precise"));

  oklab = $derived(this.#current.toOklabString(this.channelDecimals));

  cmyk = $derived(this.#displayColor.toCmykString(this.percentDecimals));

  // P3 channels are 0..1, so they follow the shared channel precision.
  p3 = $derived(this.#current.toP3String(this.channelDecimals));

  // The shared link mirrors the value the picker shows, in whichever space the user
  // is authoring, so the URL reads the same as the field. It therefore trades the
  // field's precision: a reload can shift by one 8-bit step. Use cssVar instead if
  // exact round-trips matter more than the readable match.
  share = $derived.by(() => {
    switch (this.mode) {
      case "okhsl":
        return this.okhsl;
      case "rgb":
        return this.rgb;
      default:
        return this.display;
    }
  });

  cssVar = $derived.by(() => {
    const oklch = this.#oklch;
    const alphaStr = oklch.alpha < 1 ? ` / ${oklch.alpha}` : "";
    return `oklch(${oklch.l * 100}% ${oklch.c} ${oklch.h}${alphaStr})`;
  });

  randomize() {
    this.#setCurrent(ColorStore.#getRandomColor());
  }
}
