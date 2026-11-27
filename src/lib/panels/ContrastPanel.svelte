<script lang="ts">
import CollapseToggle from "../components/CollapseToggle.svelte";
import ContrastChecker from "../components/ContrastChecker.svelte";
import { PANEL_IDS } from "../constants";
import { getApp } from "../context";

const app = getApp();

let collapsed = $state(app.panels.isCollapsed(PANEL_IDS.CONTRAST));
$effect(() => app.panels.setCollapsed(PANEL_IDS.CONTRAST, collapsed));
</script>

<section class="panel flex flex-col" class:h-auto={collapsed}>
  <div class="flex items-center justify-between" class:mb-6={!collapsed}>
    <h2 class="section-heading">Contrast Checker</h2>
    <CollapseToggle bind:collapsed label="Contrast Checker" controls="contrast-panel-body" />
  </div>

  <div id="contrast-panel-body" class="flex-1" class:hidden={collapsed}>
    <ContrastChecker />
  </div>
</section>
