<script lang="ts">
import CircleAlert from "@lucide/svelte/icons/circle-alert";
import ColorBlindFilters from "../components/ColorBlindFilters.svelte";
import LoadingSpinner from "../components/LoadingSpinner.svelte";
import { getApp } from "../context";
import { COLOR_SETS, loadColorSet } from "../data/color-sets";
import { type ExportFormat, formatColor } from "../utils/formatters";
import { filterAndSortSetColors, processSetColors, type SetSortOrder } from "../utils/palette-sets";
import { exportSource, strategies } from "../utils/strategies";
import { tooltip } from "../utils/tooltip";

const app = getApp();

const SORT_OPTIONS: Array<{ label: string; value: SetSortOrder }> = [
  { label: "Name", value: "name" },
  { label: "Hue", value: "hue" },
  { label: "Lightness", value: "lightness" },
  { label: "Chroma", value: "chroma" },
];

const FORMAT_OPTIONS: Array<{ label: string; value: ExportFormat }> = [
  { label: "HEX", value: "hex" },
  { label: "RGB", value: "rgb" },
  { label: "HSL", value: "hsl" },
  { label: "OKLCH", value: "oklch" },
];

const COLOR_BLIND_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "None", value: "none" },
  { label: "Protanopia", value: "protanopia" },
  { label: "Protanomaly", value: "protanomaly" },
  { label: "Deuteranopia", value: "deuteranopia" },
  { label: "Deuteranomaly", value: "deuteranomaly" },
  { label: "Tritanopia", value: "tritanopia" },
  { label: "Tritanomaly", value: "tritanomaly" },
  { label: "Achromatopsia", value: "achromatopsia" },
  { label: "Achromatomaly", value: "achromatomaly" },
];

const EXPORT_OPTIONS = Object.entries(strategies).map(([id, strategy]) => ({ id, name: strategy.name }));

let selectedId = $state(COLOR_SETS[0]?.id ?? "");
let sortOrder = $state<SetSortOrder>("name");
let exportFormat = $state<ExportFormat>("hex");
let colorBlind = $state("none");
let query = $state("");
let rawData = $state<Record<string, string> | null>(null);
let loading = $state(true);
let loadError = $state(false);

$effect(() => {
  const id = selectedId;
  rawData = null;
  loading = true;
  loadError = false;
  loadColorSet(id)
    .then((data) => {
      if (id !== selectedId) return;
      rawData = data;
      loadError = data === null;
      loading = false;
    })
    .catch(() => {
      if (id !== selectedId) return;
      loadError = true;
      loading = false;
    });
});

const processed = $derived(rawData ? processSetColors(rawData) : []);

const colors = $derived.by(() => {
  return filterAndSortSetColors(processed, { query, order: sortOrder }).map((color) => ({
    ...color,
    value: formatColor(color.css, exportFormat),
  }));
});

function setSource() {
  return {
    colors: colors.map((color) => ({ css: color.css, name: color.name })),
    isSingle: false,
  };
}

function copyAll(event: MouseEvent) {
  app.copy(exportSource(setSource(), "text", exportFormat), event);
}

function handleExport(event: Event) {
  const select = event.target as HTMLSelectElement;
  const id = select.value;
  select.value = "";
  if (id) app.copy(exportSource(setSource(), id, exportFormat));
}
</script>

<section class="panel h-auto overflow-visible">
  <div class="mb-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
    <h2 class="section-heading shrink-0">Color Sets</h2>

    <div class="flex w-full min-w-0 flex-1 flex-wrap items-center gap-2 md:justify-end">
      <select bind:value={selectedId} class="select-control" aria-label="Color set">
        {#each COLOR_SETS as set (set.id)}
          <option value={set.id}>{set.title}</option>
        {/each}
      </select>

      <input
        type="search"
        bind:value={query}
        placeholder="Filter colors..."
        aria-label="Filter colors by name or hex"
        class="text-input min-w-40 flex-1 px-3 py-1.5 text-xs"
      >

      <label class="flex items-center gap-2 text-xs font-bold text-(--ui-text-muted) uppercase">
        Sort
        <select bind:value={sortOrder} class="select-control">
          {#each SORT_OPTIONS as option (option.value)}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </label>

      <label class="flex items-center gap-2 text-xs font-bold text-(--ui-text-muted) uppercase">
        Format
        <select bind:value={exportFormat} class="select-control">
          {#each FORMAT_OPTIONS as option (option.value)}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </label>

      <label class="flex items-center gap-2 text-xs font-bold text-(--ui-text-muted) uppercase">
        Vision
        <select bind:value={colorBlind} class="select-control">
          {#each COLOR_BLIND_OPTIONS as option (option.value)}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </label>

      <button
        type="button"
        onclick={copyAll}
        disabled={colors.length === 0}
        class="small-button border-(--ui-border) hover:bg-(--ui-bg)"
        use:tooltip={"Copy every visible color name and value"}
      >
        Copy All
      </button>

      <select
        onchange={handleExport}
        disabled={colors.length === 0}
        aria-label="Copy the set as"
        class="select-control disabled:cursor-not-allowed disabled:opacity-40"
      >
        <option value="">Copy as...</option>
        {#each EXPORT_OPTIONS as option (option.id)}
          <option value={option.id}>{option.name}</option>
        {/each}
      </select>
    </div>
  </div>

  <ColorBlindFilters />

  {#if loading}
    <div class="flex min-h-40">
      <LoadingSpinner message="Loading color set..." />
    </div>
  {:else if loadError}
    <div class="flex min-h-40 items-center justify-center text-center text-(--ui-text-muted)">
      <div>
        <CircleAlert class="mx-auto mb-3 size-10" />
        <p class="text-sm">Could not load this color set. Try reloading the page.</p>
      </div>
    </div>
  {:else if colors.length === 0}
    <div class="flex min-h-40 items-center justify-center text-sm text-(--ui-text-muted)">No colors found</div>
  {:else}
    <ul
      class="grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-2"
      style:filter={colorBlind === "none" ? "" : `url(#cb-${colorBlind})`}
    >
      {#each colors as color (color.name)}
        <li
          class="
            group relative flex min-w-0 items-center justify-between gap-2 rounded-md
            px-2.5 py-2
            [contain-intrinsic-size:auto_2.5rem] [content-visibility:auto]
            {color.useDarkText ? "text-black" : "text-white"}
          "
          style:background-color={color.css}
        >
          <button
            type="button"
            class="absolute inset-0 cursor-pointer rounded-md"
            onclick={() => app.color.set(color.css)}
            use:tooltip={"Set as current color"}
            aria-label="Set {color.name} as the current color"
          ></button>
          <button
            type="button"
            onclick={(event) => app.copy(color.name, event)}
            class="relative z-10 min-w-0 truncate text-left text-xs font-bold hover:underline"
            use:tooltip={"Copy name"}
          >
            {color.name}
          </button>
          <button
            type="button"
            onclick={(event) => app.copy(color.value, event)}
            class="
              relative z-10 shrink-0 rounded px-1.5 py-0.5 font-mono text-[0.7rem]
              tracking-wider uppercase
              {color.useDarkText ? "hover:bg-black/15" : "hover:bg-white/20"}
            "
            use:tooltip={`Copy ${color.value}`}
            aria-label="Copy {color.value}"
          >
            {color.value}
          </button>
        </li>
      {/each}
    </ul>
    <p class="mt-3 text-xs text-(--ui-text-muted)">{colors.length} colors</p>
  {/if}
</section>
