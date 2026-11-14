import { IMAGE_ANALYSIS } from "../constants";
import { orderPalette, type PaletteEntry, type PaletteSortMode } from "../utils/image-palette";
import { assertImagePixelBudget, validateImageFile } from "../utils/validate-image";
import { ManagedWorker } from "../utils/worker-manager";
import ColorAnalysisWorker from "../workers/color-analysis.ts?worker";

export type SortMode = PaletteSortMode;

type ImageWorkerMessage = {
  clusters: { color: string; pixels: number }[];
};

const BITMAP_OPTIONS = {
  // Width only: giving both dimensions stretches the bitmap and squashes the preview.
  resizeWidth: IMAGE_ANALYSIS.DOWNSAMPLE_SIZE,
  resizeQuality: "low",
} as const;

async function loadBitmap(file: File): Promise<ImageBitmap> {
  if (file.type !== "image/svg+xml") return createImageBitmap(file, BITMAP_OPTIONS);

  // No browser decodes an SVG blob into an ImageBitmap; an <img> can (Chromium 40269670).
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return await createImageBitmap(image, BITMAP_OPTIONS);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export class ImageStore {
  mosaicData = $state<PaletteEntry[]>([]);

  sortMode = $state<SortMode>("dominant");
  isProcessing = $state(false);
  previewUrl = $state<string>("");

  analysisError = $state<string | null>(null);

  #managedWorker = new ManagedWorker<ImageWorkerMessage>();
  #generation = 0;

  extractedPalette = $derived(orderPalette(this.mosaicData, this.sortMode));

  async analyze(file: File) {
    validateImageFile(file);

    const generation = ++this.#generation;

    this.#managedWorker.terminate();

    this.isProcessing = true;
    this.analysisError = null;
    // Drop the old palette and preview so the new image is never shown next to old colors.
    this.mosaicData = [];
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = "";
    }

    const size = IMAGE_ANALYSIS.DOWNSAMPLE_SIZE;

    try {
      const canvas = new OffscreenCanvas(size, size);
      // Resize during decode: the bitmap keeps its aspect ratio at 256px wide.
      // The pixel budget check above rejects huge rasters before they are decoded.
      await assertImagePixelBudget(file);
      const bitmap = await loadBitmap(file);

      if (generation !== this.#generation) {
        bitmap.close();
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        bitmap.close();
        this.isProcessing = false;
        return;
      }

      // Center-crop the aspect-preserving bitmap instead of stretching it into the square.
      const side = Math.min(bitmap.width, bitmap.height);
      ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);

      const imageData = ctx.getImageData(0, 0, size, size);

      bitmap.close();

      // The thumbnail is 256px, so preview the canvas instead of pinning the source file.
      const preview = await canvas.convertToBlob();
      if (generation !== this.#generation) return;
      this.previewUrl = URL.createObjectURL(preview);

      this.#managedWorker.init(
        () => new ColorAnalysisWorker(),
        {
          onMessage: (data) => {
            if (generation !== this.#generation) return;
            this.isProcessing = false;
            this.#managedWorker.terminate();

            if (!data.clusters.length) {
              this.analysisError = "No visible colors found in this image.";
              URL.revokeObjectURL(this.previewUrl);
              this.previewUrl = "";
              return;
            }

            this.mosaicData = data.clusters;
          },
          onError: () => {
            if (generation !== this.#generation) return;
            this.isProcessing = false;
            this.analysisError = "Image analysis failed. Try again.";
          },
        },
        "Image analysis worker",
      );

      this.#managedWorker.post({ imageData, distance: IMAGE_ANALYSIS.MERGE_DISTANCE }, [imageData.data.buffer]);
    } catch (error) {
      console.error("Image analysis error:", error);
      if (generation !== this.#generation) return;
      this.isProcessing = false;
      if (this.previewUrl) {
        URL.revokeObjectURL(this.previewUrl);
        this.previewUrl = "";
      }
      this.#managedWorker.terminate();
      throw error;
    }
  }

  clear() {
    this.#generation++;
    this.isProcessing = false;
    this.analysisError = null;
    this.mosaicData = [];
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = "";
    }
    this.#managedWorker.terminate();
  }

  destroy() {
    this.clear();
    this.#managedWorker.destroy();
  }
}
