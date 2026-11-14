import { EXPORT } from "../constants";
import type { RootStore } from "../stores/root.svelte";
import { safeColor } from "./formatters";
import { type ColorSource, escapeXml, resolveClosestName, type VisualExportStrategy } from "./strategies";
import { flattenColor, usesDarkText } from "./text-contrast";

/** Black or white text, by the same rule the on-screen swatches use. */
const readableText = (background: string): string => (usesDarkText(background) ? "#000000" : "#ffffff");

const TEXT_EDGE = 60;
const TITLE_MAX_PX = 80;
const TITLE_MIN_PX = 24;

/** Largest bold font size that keeps the title on one line inside `maxWidth`. */
const fitTitle = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): number => {
  let fontSize = TITLE_MAX_PX;
  ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
  while (fontSize > TITLE_MIN_PX && ctx.measureText(text).width > maxWidth) {
    fontSize -= 2;
    ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
  }
  return fontSize;
};

class PngExportStrategy implements VisualExportStrategy {
  extension = "png";
  mimeType = "image/png";

  async render(source: ColorSource, root: RootStore): Promise<Blob> {
    const { colors, isSingle } = source;
    const canvas = document.createElement("canvas");
    canvas.width = EXPORT.PNG_WIDTH;
    canvas.height = EXPORT.PNG_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas 2d context");

    ctx.textAlign = "left";

    if (isSingle) {
      const fill = flattenColor(colors[0]?.css ?? root.color.hexa);
      ctx.fillStyle = fill;
      ctx.fillRect(0, 0, EXPORT.PNG_WIDTH, EXPORT.PNG_HEIGHT);

      ctx.fillStyle = readableText(fill);
      const title = resolveClosestName(root.engine.closestName, root.color.hex).toUpperCase();
      fitTitle(ctx, title, EXPORT.PNG_WIDTH - TEXT_EDGE * 2);
      ctx.fillText(title, TEXT_EDGE, 150);
      ctx.font = "40px ui-monospace, monospace";
      ctx.fillText(root.color.display, TEXT_EDGE, 230);
      ctx.fillText(`HEX: ${root.color.hex.toUpperCase()}`, TEXT_EDGE, 290);
      ctx.fillText(`RGB: ${root.color.rgb}`, TEXT_EDGE, 350);
      if (root.color.alpha < 1) {
        ctx.fillText(`Alpha: ${(root.color.alpha * 100).toFixed(0)}%`, TEXT_EDGE, 410);
      }
    } else {
      const titleHeight = 60;
      const cols = Math.min(colors.length, 6);
      const rows = Math.ceil(colors.length / cols);
      const swatchWidth = EXPORT.PNG_WIDTH / cols;
      const swatchHeight = (EXPORT.PNG_HEIGHT - titleHeight) / rows;

      colors.forEach((item, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = col * swatchWidth;
        const y = row * swatchHeight;
        if (item) {
          const fill = flattenColor(item.css);
          ctx.fillStyle = fill;
          ctx.fillRect(x, y, swatchWidth, swatchHeight);
          if (swatchHeight > 80) {
            const parsed = safeColor(item.css);
            if (parsed) {
              ctx.fillStyle = readableText(fill);
              ctx.font = `bold ${Math.min(swatchHeight / 4, 32)}px ui-monospace, monospace`;
              ctx.textAlign = "center";
              ctx.fillText(parsed.toHex().toUpperCase(), x + swatchWidth / 2, y + swatchHeight / 2 + 8);
            }
          }
        }
      });

      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(0, EXPORT.PNG_HEIGHT - titleHeight, EXPORT.PNG_WIDTH, titleHeight);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("COLOR PALETTE", EXPORT.PNG_WIDTH / 2, EXPORT.PNG_HEIGHT - titleHeight / 2 + 10);
      ctx.textAlign = "left";
    }

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create PNG blob"));
      }, "image/png");
    });
  }
}

class SvgExportStrategy implements VisualExportStrategy {
  extension = "svg";
  mimeType = "image/svg+xml";

  render(source: ColorSource, root: RootStore): Blob {
    const { colors, isSingle } = source;
    let svg: string;

    if (isSingle) {
      const fill = flattenColor(root.color.hexa);
      const textFill = readableText(fill);
      const title = resolveClosestName(root.engine.closestName, root.color.hex).toUpperCase();
      // Rough sans-serif bold advance width (0.6em), floored so long names stay legible.
      const titleSize = Math.max(10, Math.min(24, Math.floor((EXPORT.SVG_SIZE - 40) / (title.length * 0.6))));
      svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${EXPORT.SVG_SIZE}" height="${EXPORT.SVG_SIZE}" viewBox="0 0 ${EXPORT.SVG_SIZE} ${EXPORT.SVG_SIZE}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${EXPORT.SVG_SIZE}" height="${EXPORT.SVG_SIZE}" fill="${fill}" />
  <text x="20" y="40" font-family="sans-serif" font-weight="bold" font-size="${titleSize}" fill="${textFill}">${escapeXml(title)}</text>
  <text x="20" y="70" font-family="monospace" font-size="14" fill="${textFill}">${root.color.display}</text>
  ${root.color.alpha < 1 ? `<text x="20" y="90" font-family="monospace" font-size="12" fill="${textFill}">Alpha: ${(root.color.alpha * 100).toFixed(0)}%</text>` : ""}
</svg>`;
    } else {
      const cols = Math.min(colors.length, 6);
      const rows = Math.ceil(colors.length / cols);
      const swatchWidth = EXPORT.SVG_SIZE / cols;
      const swatchHeight = (EXPORT.SVG_SIZE - 50) / rows;

      const swatches = colors
        .map((item, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = col * swatchWidth;
          const y = row * swatchHeight;

          const parsed = safeColor(item.css);
          const fill = flattenColor(item.css);
          const label = (parsed ? parsed.toHex() : item.css).toUpperCase();

          let colorText = "";
          if (swatchHeight > 50 && parsed) {
            const textColor = readableText(fill);
            const fontSize = Math.min(swatchHeight / 5, 14);
            colorText = `<text x="${x + swatchWidth / 2}" y="${y + swatchHeight / 2 + fontSize / 3}" font-family="monospace" font-size="${fontSize}" font-weight="bold" fill="${textColor}" text-anchor="middle">${label}</text>`;
          }

          return `  <rect x="${x}" y="${y}" width="${swatchWidth}" height="${swatchHeight}" fill="${fill}" />
${colorText}`;
        })
        .join("\n");

      const titleY = EXPORT.SVG_SIZE - 50;
      svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${EXPORT.SVG_SIZE}" height="${EXPORT.SVG_SIZE}" viewBox="0 0 ${EXPORT.SVG_SIZE} ${EXPORT.SVG_SIZE}" xmlns="http://www.w3.org/2000/svg">
${swatches}
  <rect x="0" y="${titleY}" width="${EXPORT.SVG_SIZE}" height="50" fill="rgba(0, 0, 0, 0.8)" />
  <text x="${EXPORT.SVG_SIZE / 2}" y="${titleY + 32}" font-family="sans-serif" font-weight="bold" font-size="18" fill="#ffffff" text-anchor="middle">COLOR PALETTE</text>
</svg>`;
    }

    return new Blob([svg.trim()], { type: this.mimeType });
  }
}

export const visualStrategies: Record<string, VisualExportStrategy> = {
  png: new PngExportStrategy(),
  svg: new SvgExportStrategy(),
};
