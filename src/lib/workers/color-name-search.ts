import { buildColorIndex, type ColorIndex, filterColors, findClosestName, getPage } from "../utils/color-search";

interface WorkerMessage {
  type: "search" | "filter" | "get-page";
  color?: { l: number; c: number; h: number; alpha: number };
  query?: string;
  limit?: number;
  offset?: number;
}

interface WorkerResponse {
  type: "result" | "filterResult" | "pageResult";
  name?: string;
  colors?: Array<{ name: string; hex: string }>;
  total?: number;
}

let index: ColorIndex | null = null;

let isLoading = false;
let loadError: Error | null = null;

const DATA_POLL_INTERVAL_MS = 10;
const DATA_WAIT_TIMEOUT_MS = 15_000;

async function prepareData(): Promise<void> {
  if (index !== null || isLoading) return;

  isLoading = true;

  try {
    const module = await import("../data/colors");
    const list = await module.loadColorNames();
    index = buildColorIndex(list);
  } catch (error) {
    loadError = error instanceof Error ? error : new Error("Failed to load color names");
    console.error("Failed to load color name list:", loadError);
  } finally {
    isLoading = false;
  }
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  if (e.data.type === "search" && e.data.color) {
    if (index === null || isLoading) {
      await waitForData();
    }

    const result = index ? findClosestName(e.data.color, index) : "Custom Color";
    self.postMessage({ type: "result", name: result } as WorkerResponse);
  } else if (e.data.type === "filter") {
    if (index === null || isLoading) {
      await waitForData();
    }

    const results = index ? filterColors(index, e.data.query || "", e.data.limit || 500) : [];
    self.postMessage({ type: "filterResult", colors: results } as WorkerResponse);
  } else if (e.data.type === "get-page") {
    if (index === null || isLoading) {
      await waitForData();
    }

    const results = index ? getPage(index, e.data.offset || 0, e.data.limit || 100) : [];
    self.postMessage({
      type: "pageResult",
      colors: results,
      total: index?.names.length ?? 0,
    } as WorkerResponse);
  }
};

async function waitForData(): Promise<void> {
  const deadline = Date.now() + DATA_WAIT_TIMEOUT_MS;
  while (!loadError && (index === null || isLoading)) {
    if (Date.now() >= deadline) {
      // Give up waiting; callers fall back to empty results instead of hanging.
      console.warn("Color name data did not finish loading in time");
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, DATA_POLL_INTERVAL_MS));
  }
}

prepareData();
