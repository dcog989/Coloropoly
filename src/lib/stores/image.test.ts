import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  workers: [] as Array<{
    onmessage: ((event: MessageEvent) => void) | null;
    onerror: ((event: Event) => void) | null;
    postMessage: ReturnType<typeof vi.fn>;
    terminate: ReturnType<typeof vi.fn>;
  }>,
}));

vi.mock("../workers/color-analysis.ts?worker", () => ({
  default: class {
    onmessage: ((event: MessageEvent) => void) | null = null;
    onerror: ((event: Event) => void) | null = null;
    postMessage = vi.fn();
    terminate = vi.fn();

    constructor() {
      state.workers.push(this);
    }
  },
}));

import { ImageStore } from "./image.svelte";

class FakeCanvas {
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  getContext() {
    return {
      drawImage: vi.fn(),
      getImageData: (_x: number, _y: number, width: number, height: number) => ({
        data: new Uint8ClampedArray(width * height * 4),
        width,
        height,
      }),
    };
  }

  async convertToBlob() {
    return new Blob(["preview"], { type: "image/png" });
  }
}

const png = () => new File(["pixels"], "photo.png", { type: "image/png" });

const bitmap = () => ({ width: 256, height: 144, close: vi.fn() });

describe("ImageStore", () => {
  beforeEach(() => {
    state.workers.length = 0;
    vi.stubGlobal("OffscreenCanvas", FakeCanvas);
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn(async () => bitmap()),
    );
    URL.createObjectURL = vi.fn(() => "blob:preview");
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("ignores a result that a newer upload superseded", async () => {
    const store = new ImageStore();

    await store.analyze(png());
    await store.analyze(png());
    expect(state.workers).toHaveLength(2);

    state.workers[0]?.onmessage?.({ data: { clusters: [{ color: "#ff0000", pixels: 10 }] } } as MessageEvent);
    expect(store.mosaicData).toEqual([]);

    state.workers[1]?.onmessage?.({ data: { clusters: [{ color: "#0000ff", pixels: 10 }] } } as MessageEvent);
    expect(store.mosaicData).toEqual([{ color: "#0000ff", pixels: 10 }]);
    expect(store.isProcessing).toBe(false);

    store.destroy();
  });

  it("drops the palette and preview when cleared", async () => {
    const store = new ImageStore();

    await store.analyze(png());
    state.workers[0]?.onmessage?.({ data: { clusters: [{ color: "#ff0000", pixels: 10 }] } } as MessageEvent);
    expect(store.previewUrl).toBe("blob:preview");

    store.clear();

    expect(store.mosaicData).toEqual([]);
    expect(store.previewUrl).toBe("");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");

    store.destroy();
  });

  it("reports an empty analysis as an error and revokes the preview", async () => {
    const store = new ImageStore();

    await store.analyze(png());
    state.workers[0]?.onmessage?.({ data: { clusters: [] } } as MessageEvent);

    expect(store.analysisError).toBe("No visible colors found in this image.");
    expect(store.isProcessing).toBe(false);
    expect(store.previewUrl).toBe("");

    store.destroy();
  });
});
