import { colordx } from "@colordx/core";
import "./color-plugins";

const OPAQUE_WHITE = "#ffffff";

const clampChannel = (value: number) => Math.min(255, Math.max(0, value));

/**
 * Blend a possibly translucent color over an opaque surface and return the
 * opaque hex the browser would paint. Invalid input is returned unchanged so
 * callers can keep their own `isValid` check.
 */
export function flattenColor(color: string, surface = OPAQUE_WHITE): string {
  try {
    const foreground = colordx(color);
    if (!foreground.isValid()) return color;
    if (foreground.alpha() >= 1) return foreground.toHex();

    const parsedSurface = colordx(surface);
    const under = parsedSurface.isValid() ? parsedSurface.toRgb() : { r: 255, g: 255, b: 255 };
    const { r, g, b } = foreground.toRgb();
    const alpha = foreground.alpha();
    const blend = (channel: number, base: number) =>
      Math.round(alpha * clampChannel(channel) + (1 - alpha) * clampChannel(base));

    return colordx({ r: blend(r, under.r), g: blend(g, under.g), b: blend(b, under.b) }).toHex();
  } catch {
    return color;
  }
}

/**
 * True when black text has the stronger APCA contrast against the color.
 * APCA is signed and perceptual, so it beats the WCAG ratio near mid-tones
 * (#dd3747 picks black by a hair on WCAG but reads better with white).
 * Translucent colors are flattened over the light surface first.
 */
export function usesDarkText(background: string): boolean {
  try {
    const bg = colordx(flattenColor(background));
    if (!bg.isValid()) return false;
    return Math.abs(colordx("#000").apcaContrast(bg)) >= Math.abs(colordx("#fff").apcaContrast(bg));
  } catch {
    return false;
  }
}
