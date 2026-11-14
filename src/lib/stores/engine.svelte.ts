import { type GenerationMode, generateHarmony, generatePalette, isHarmonyMode } from "../utils/palette";
import { ManagedWorker } from "../utils/worker-manager";
import type { WorkerRequest, WorkerResponse } from "../workers/color-name-search";
import ColorNameSearchWorker from "../workers/color-name-search.ts?worker";
import type { ColorStore } from "./color.svelte";

export class EngineStore {
  closestName = $state("Searching...");
  #managedWorker = new ManagedWorker<WorkerResponse>({ maxRetries: 3, retryDelay: 1000 });
  #debounceHandle: number | null = null;
  #disposeEffect: (() => void) | null = null;
  #initialized = false;
  #nameWorkerStarted = false;
  #searchedOnce = false;
  #pendingSearch: { l: number; c: number; h: number; alpha: number } | null = null;
  #colorStore: ColorStore;

  genSteps = $state(8);
  genAxis = $state<GenerationMode>("l");

  constructor(colorStore: ColorStore) {
    this.#colorStore = colorStore;
  }

  #isHarmonyMode = $derived(isHarmonyMode(this.genAxis));

  get isHarmonyMode(): boolean {
    return this.#isHarmonyMode;
  }

  #generated = $derived.by((): string[] => {
    const axis = this.genAxis;
    if (isHarmonyMode(axis)) {
      return generateHarmony(this.#getBaseColor(), axis);
    }
    return generatePalette(this.#getBaseColor(), axis, this.genSteps);
  });

  get generated(): string[] {
    return this.#generated;
  }

  init() {
    if (this.#initialized) return;
    this.#initialized = true;

    // The worker keeps its index in IndexedDB and only downloads the ~1.1MB name
    // list on a cold start, so it can start right away; it never blocks the main
    // thread, and the title gets its name before the first fade completes.
    this.startNameWorker();

    this.#disposeEffect = $effect.root(() => {
      $effect(() => {
        const current = this.#getBaseColor();

        if (this.#debounceHandle !== null) {
          clearTimeout(this.#debounceHandle);
          this.#debounceHandle = null;
        }

        // The first search is not a drag, so send it now: the title resolves from the
        // restored color before the fade is visible.
        if (!this.#searchedOnce) {
          this.#searchedOnce = true;
          this.#searchColorName(current);
          return;
        }

        this.#debounceHandle = window.setTimeout(() => {
          this.#searchColorName(current);
          this.#debounceHandle = null;
        }, 150);
      });
    });
  }

  startNameWorker() {
    if (this.#nameWorkerStarted) return;
    this.#nameWorkerStarted = true;
    this.#initWorker();
  }

  #initWorker() {
    this.#managedWorker.init(
      () => new ColorNameSearchWorker(),
      {
        onMessage: (data) => {
          if (data.type === "result") {
            this.#pendingSearch = null;
            this.closestName = data.name ?? "Custom Color";
          }
        },
        onError: () => {
          this.closestName = "Custom Color";
          // Subscribers (the color library) would otherwise wait forever for a page.
          this.#managedWorker.notify({ type: "error" });
        },
        onReady: () => {
          if (this.#pendingSearch) {
            this.#managedWorker.post({ type: "search", color: this.#pendingSearch });
          }
        },
      },
      "Color name search worker",
    );
  }

  #searchColorName(color: { l: number; c: number; h: number; alpha: number }) {
    this.#pendingSearch = color;
    // Queued until the first interaction starts the worker; onReady then posts it.
    if (this.#nameWorkerStarted) this.#managedWorker.post({ type: "search", color });
  }

  destroy() {
    if (this.#debounceHandle !== null) {
      clearTimeout(this.#debounceHandle);
      this.#debounceHandle = null;
    }
    this.#disposeEffect?.();
    this.#disposeEffect = null;
    this.#managedWorker.destroy();
  }

  subscribeToWorker(handler: (msg: WorkerResponse) => void): () => void {
    this.startNameWorker();
    return this.#managedWorker.subscribe(handler);
  }

  postToWorker(data: WorkerRequest): void {
    this.startNameWorker();
    if (!this.#managedWorker.post(data)) {
      this.#managedWorker.notify({ type: "error" });
    }
  }

  #getBaseColor(): { l: number; c: number; h: number; alpha: number } {
    return {
      l: this.#colorStore.l,
      c: this.#colorStore.c,
      h: this.#colorStore.h,
      alpha: this.#colorStore.alpha,
    };
  }
}
