<script lang="ts">
import { COLOR_BLIND_MODES } from "../data/color-blind";
</script>

<!-- Static SVG filter definitions for simulated color-vision deficiencies. Rendered once per page. -->
<svg aria-hidden="true" class="absolute size-0 overflow-hidden">
  <defs>
    {#each COLOR_BLIND_MODES as mode (mode.value)}
      {#if mode.matrix}
        <filter id={`cb-${mode.value}`}>
          <feColorMatrix type="matrix" values={mode.matrix} />
        </filter>
      {/if}
    {/each}
  </defs>
</svg>
