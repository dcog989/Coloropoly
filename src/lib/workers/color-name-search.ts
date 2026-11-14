import { loadColorNames } from "../data/colors";
import {
  buildColorIndex,
  type ColorIndex,
  FILTER_LIMIT,
  filterColors,
  findClosestName,
  getPage,
} from "../utils/color-search";

export type WorkerRequest =
  | { type: "search"; color: { l: number; c: number; h: number; alpha: number } }
  | { type: "filter"; query?: string; limit?: number }
  | { type: "get-page"; offset?: number; limit?: number };

export interface WorkerResponse {
  type: "result" | "filterResult" | "pageResult" | "error";
  name?: string;
  colors?: Array<{ name: string; hex: string }>;
  total?: number;
  capped?: boolean;
}

let index: ColorIndex | null = null;
let loadPromise: Promise<void> | null = null;

function prepareData(): Promise<void> {
  loadPromise ??= (async () => {
    try {
      index = buildColorIndex(await loadColorNames());
    } catch (error) {
      console.error("Failed to load color name list:", error);
    }
  })();
  return loadPromise;
}

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  await prepareData();

  if (e.data.type === "search" && e.data.color) {
    const result = index ? findClosestName(e.data.color, index) : "Custom Color";
    self.postMessage({ type: "result", name: result } as WorkerResponse);
  } else if (e.data.type === "filter") {
    // Ask for one extra row so the UI can say when the result list is capped.
    const results = index ? filterColors(index, e.data.query || "", FILTER_LIMIT + 1) : [];
    self.postMessage({
      type: "filterResult",
      colors: results.slice(0, FILTER_LIMIT),
      capped: results.length > FILTER_LIMIT,
    } as WorkerResponse);
  } else if (e.data.type === "get-page") {
    const results = index ? getPage(index, e.data.offset || 0, e.data.limit || 100) : [];
    self.postMessage({
      type: "pageResult",
      colors: results,
      total: index?.names.length ?? 0,
    } as WorkerResponse);
  }
};

void prepareData();
