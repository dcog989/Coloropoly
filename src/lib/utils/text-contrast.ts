import { colordx } from "@colordx/core";
import "./color-plugins";

/**
 * True when black text has the stronger APCA contrast against the color.
 * APCA is signed and perceptual, so it beats the WCAG ratio near mid-tones
 * (#dd3747 picks black by a hair on WCAG but reads better with white).
 */
export function usesDarkText(background: string): boolean {
  try {
    const bg = colordx(background);
    if (!bg.isValid()) return false;
    const hex = bg.toHex();
    return Math.abs(colordx("#000").apcaContrast(hex)) >= Math.abs(colordx("#fff").apcaContrast(hex));
  } catch {
    return false;
  }
}
