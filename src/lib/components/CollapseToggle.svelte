<script lang="ts">
import ChevronDown from "@lucide/svelte/icons/chevron-down";
import ChevronUp from "@lucide/svelte/icons/chevron-up";
import { tooltip } from "../utils/tooltip";

interface Props {
  collapsed: boolean;
  controls: string;
  label: string;
}

let { collapsed = $bindable(), controls, label }: Props = $props();
</script>

<button
  type="button"
  class="icon-button p-1.5"
  aria-expanded={!collapsed}
  aria-controls={controls}
  aria-label={collapsed ? `Expand ${label}` : `Collapse ${label}`}
  use:tooltip={collapsed ? `Expand ${label}` : `Collapse ${label}`}
  onclick={() => (collapsed = !collapsed)}
>
  {#if collapsed}
    <ChevronDown class="size-4" />
  {:else}
    <ChevronUp class="size-4" />
  {/if}
</button>
