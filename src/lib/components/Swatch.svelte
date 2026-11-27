<script lang="ts">
import Copy from "@lucide/svelte/icons/copy";
import Plus from "@lucide/svelte/icons/plus";
import { getApp } from "../context";
import { usesDarkText } from "../utils/text-contrast";
import { tooltip } from "../utils/tooltip";

const app = getApp();
const { color, toast } = app;

interface Props {
  color: string;
  index: number;
  dynamicClass?: boolean;
}

let { color: swatchColor, index, dynamicClass = true }: Props = $props();

const copy = (e: MouseEvent) => app.copy(color.formatColor(swatchColor), e);

const getActionClass = () => {
  if (!dynamicClass) return "";
  return usesDarkText(swatchColor)
    ? "bg-black/10 hover:bg-black/20 text-black"
    : "bg-white/20 hover:bg-white/30 text-white";
};
</script>

<div
  class="group relative aspect-square overflow-hidden rounded-lg border border-white/10 shadow-md [background:var(--swatch-color)] hover:scale-105"
  style:--swatch-color={swatchColor}
>
  <button
    type="button"
    class="absolute inset-0 cursor-pointer"
    use:tooltip={color.formatColor(swatchColor)}
    onclick={() => color.set(swatchColor)}
    aria-label="Select swatch {index + 1}"
  ></button>
  <div class="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
    <div
      class="pointer-events-auto flex items-center justify-center gap-2 translate-y-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
    >
      <button
        onclick={(e) => {
          e.stopPropagation();
          if (app.addColors([swatchColor]) === null) return;
          toast.showAt("Added", e);
        }}
        class="overlay-button {getActionClass()}"
        use:tooltip={"Add to paintbox"}
        aria-label="Add to paintbox"
        type="button"
      >
        <Plus class="pointer-events-none size-4" />
      </button>
      <button
        onclick={(e) => {
          e.stopPropagation();
          copy(e);
        }}
        class="overlay-button {getActionClass()}"
        use:tooltip={`Copy ${color.formatColor(swatchColor)}`}
        aria-label="Copy {color.formatColor(swatchColor)}"
        type="button"
      >
        <Copy class="pointer-events-none size-4" />
      </button>
    </div>
  </div>
</div>
