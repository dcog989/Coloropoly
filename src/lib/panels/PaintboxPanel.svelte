<script lang="ts">
import CircleX from "@lucide/svelte/icons/circle-x";
import PaintboxGrid from "../components/PaintboxGrid.svelte";
import { PAINTBOX, PALETTE_FILE } from "../constants";
import { getApp } from "../context";
import type { PaintboxSortMode } from "../stores/paintbox.svelte";
import { parsePaletteFile } from "../utils/import-strategies";
import { evictedCount } from "../utils/paintbox";
import { exportVisual } from "../utils/strategies";
import { tooltip } from "../utils/tooltip";

interface Props {
  onExport: () => void;
}

let { onExport }: Props = $props();

const app = getApp();
const { paintbox, toast } = app;

let fileInput = $state<HTMLInputElement | null>(null);
let exporting = $state<"png" | "svg" | null>(null);

$effect(() => {
  if (paintbox.saveError) toast.show(paintbox.saveError);
});

const handleImport = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;

  if (file.size > PALETTE_FILE.MAX_SIZE) {
    toast.show(`Palette file too large (max ${PALETTE_FILE.MAX_SIZE / (1024 * 1024)}MB)`);
    return;
  }

  try {
    const colors = parsePaletteFile(file.name, await file.text());
    const toAdd = colors.slice(-PAINTBOX.MAX_COLORS);
    const dropped = evictedCount(paintbox.items, toAdd, PAINTBOX.MAX_COLORS);
    for (const css of toAdd) paintbox.add(css);

    const noun = toAdd.length === 1 ? "color" : "colors";
    toast.show(
      dropped > 0
        ? `Imported ${toAdd.length} ${noun}; dropped ${dropped} oldest saved color${dropped === 1 ? "" : "s"}`
        : `Imported ${toAdd.length} ${noun}`,
    );
  } catch (err) {
    toast.show(err instanceof Error ? err.message : "Failed to import palette");
  }
};

const runVisualExport = async (kind: "png" | "svg") => {
  exporting = kind;
  try {
    await exportVisual(app, kind);
  } catch (err) {
    toast.show(err instanceof Error ? err.message : "Export failed");
  } finally {
    exporting = null;
  }
};

const sortOptions: { label: string; value: PaintboxSortMode }[] = [
  { label: "New First", value: "newest" },
  { label: "New Last", value: "oldest" },
  { label: "Hue", value: "hue" },
  { label: "Bright", value: "lightness" },
  { label: "Vivid", value: "chroma" },
];
</script>

<section
  class="
      panel flex flex-col
    "
>
  <div class="space-y-6">
    <div
      class="
              flex flex-col items-start justify-between gap-4
              sm:flex-row sm:items-center
            "
    >
      <h2 class="section-heading shrink-0">Paintbox</h2>

      <div
        class="
                  flex w-full flex-wrap items-center gap-2
                  sm:w-auto
                "
      >
        <select
          id="paintboxSort"
          bind:value={paintbox.sortMode}
          aria-label="Sort paintbox by"
          class="select-control flex-1 sm:flex-none"
        >
          {#each sortOptions as option (option.value)}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>

        <button
          type="button"
          onclick={() => {
            if (confirm("Clear all saved colors?")) paintbox.clear();
          }}
          disabled={paintbox.items.length === 0}
          class="icon-button hover:bg-red-500 hover:text-white"
          use:tooltip={"Clear Paintbox"}
          aria-label="Clear paintbox"
        >
          <CircleX class="size-4" />
        </button>
      </div>
    </div>

    <PaintboxGrid />
  </div>

  <!-- Export Options -->
  <div class="mt-8 space-y-3">
    <h3 class="section-heading">Export</h3>
    <div class="grid grid-cols-3 gap-3">
      <button type="button" onclick={() => runVisualExport("png")} disabled={exporting !== null} class="action-button">
        {exporting === "png" ? "..." : "PNG"}
      </button>
      <button type="button" onclick={() => runVisualExport("svg")} disabled={exporting !== null} class="action-button">
        {exporting === "svg" ? "..." : "SVG"}
      </button>
      <button type="button" onclick={onExport} class="action-button">Code...</button>
    </div>
  </div>

  <!-- Import Options -->
  <div class="mt-4 space-y-3">
    <h3 class="section-heading">Import</h3>
    <input bind:this={fileInput} type="file" accept={PALETTE_FILE.ACCEPT} class="hidden" onchange={handleImport}>
    <button type="button" onclick={() => fileInput?.click()} class="action-button">DTCG JSON / GIMP GPL</button>
  </div>
</section>
