<script lang="ts">
import LayersPlus from "@lucide/svelte/icons/layers-plus";
import ListMinus from "@lucide/svelte/icons/list-minus";
import ListPlus from "@lucide/svelte/icons/list-plus";
import CollapseToggle from "../components/CollapseToggle.svelte";
import Swatch from "../components/Swatch.svelte";
import { PANEL_IDS } from "../constants";
import { getApp } from "../context";
import { tooltip } from "../utils/tooltip";

const app = getApp();
const { engine, toast } = app;
let collapsed = $state(app.panels.isCollapsed(PANEL_IDS.PALETTE));
$effect(() => app.panels.setCollapsed(PANEL_IDS.PALETTE, collapsed));

const addAll = (e?: MouseEvent) => {
  if (app.addColors(engine.generated) === null) return;
  toast.showAt("Added All to Paintbox", e);
};

const addRow = () => {
  engine.genSteps = Math.min(20, engine.genSteps + 4);
};

const removeRow = () => {
  engine.genSteps = Math.max(4, engine.genSteps - 4);
};
</script>

<section
  class="
      panel
    "
  class:h-auto={collapsed}
>
  <div class="flex flex-col items-center justify-between gap-4 md:flex-row" class:mb-6={!collapsed}>
    <div class="flex w-full items-center justify-between gap-4 md:contents">
      <h2 class="section-heading shrink-0 self-start md:self-center">Palette</h2>
      <div class="md:order-last">
        <CollapseToggle bind:collapsed label="Palette" controls="palette-panel-body" />
      </div>
    </div>

    <div class="flex w-full flex-wrap items-center justify-end gap-2 md:order-2 md:ml-auto md:w-auto">
      <select
        id="paletteVariable"
        bind:value={engine.genAxis}
        aria-label="Palette generation variable"
        class="select-control"
      >
        <optgroup label="Variables">
          <option value="l">Lightness</option>
          <option value="c">Chroma</option>
          <option value="h">Hue</option>
          <option value="a">Alpha</option>
        </optgroup>
        <optgroup label="Harmony">
          <option value="complementary">Complementary</option>
          <option value="split-complementary">Split Complementary</option>
          <option value="analogous">Analogous</option>
          <option value="triadic">Triadic</option>
          <option value="tetradic">Tetradic</option>
          <option value="rectangle">Rectangle</option>
        </optgroup>
      </select>

      {#if !engine.isHarmonyMode}
        <div class="control-group flex items-center gap-1 py-0">
          <button
            type="button"
            onclick={removeRow}
            disabled={engine.genSteps <= 4}
            class="icon-button-inset"
            use:tooltip={"Remove Row"}
            aria-label="Decrease steps"
          >
            <ListMinus class="size-4" />
          </button>
          <button
            type="button"
            onclick={addRow}
            disabled={engine.genSteps >= 20}
            class="icon-button-inset"
            use:tooltip={"Add Row"}
            aria-label="Increase steps"
          >
            <ListPlus class="size-4" />
          </button>
        </div>
      {/if}

      <button
        type="button"
        onclick={(e) => addAll(e)}
        class="icon-button"
        use:tooltip={"Add all to paintbox"}
        aria-label="Add all to paintbox"
      >
        <LayersPlus class="size-4" />
      </button>
    </div>
  </div>

  <div id="palette-panel-body" class="grid grid-cols-4 gap-3" class:hidden={collapsed}>
    {#each engine.generated as swatch, i (swatch + i)}
      <Swatch color={swatch} index={i} />
    {/each}
  </div>
</section>
