const SHOW_DELAY_MS = 250;
const GAP_PX = 8;
const EDGE_PX = 4;

// Every mounted tooltip registers here, so the page keeps one pair of viewport
// listeners instead of two per tip (a large color set mounts thousands).
const hiders = new Set<() => void>();
let watchingViewport = false;

const hideAll = () => {
  for (const hide of hiders) hide();
};

const watchViewport = (watch: boolean) => {
  if (watch === watchingViewport) return;
  watchingViewport = watch;

  if (watch) {
    // Capture so a scroll inside any panel also dismisses a stale position.
    window.addEventListener("scroll", hideAll, true);
    window.addEventListener("resize", hideAll);
  } else {
    window.removeEventListener("scroll", hideAll, true);
    window.removeEventListener("resize", hideAll);
  }
};

/**
 * App-styled replacement for the native `title` tooltip. Renders one fixed-position
 * element outside the trigger, so scrolling panels and overflow-hidden swatches
 * cannot clip it.
 */
export function tooltip(node: HTMLElement, text: string) {
  let tip: HTMLDivElement | null = null;
  let current = text;
  let showTimer: number | null = null;

  const ensureTip = (): HTMLDivElement => {
    if (tip) return tip;
    const el = document.createElement("div");
    el.className = "app-tooltip";
    el.setAttribute("aria-hidden", "true");
    el.style.visibility = "hidden";
    document.body.append(el);
    tip = el;
    return el;
  };

  const hide = () => {
    if (showTimer !== null) {
      clearTimeout(showTimer);
      showTimer = null;
    }
    if (tip) tip.style.visibility = "hidden";
  };

  const show = () => {
    if (!current) return;
    const el = ensureTip();
    el.textContent = current;
    el.style.visibility = "hidden";

    // Read first, write after: the text may have changed the box size.
    const rect = node.getBoundingClientRect();
    const width = el.offsetWidth;
    const height = el.offsetHeight;

    let top = rect.top - height - GAP_PX;
    if (top < EDGE_PX) top = rect.bottom + GAP_PX;
    const maxLeft = window.innerWidth - width - EDGE_PX;
    const left = Math.max(EDGE_PX, Math.min(rect.left + rect.width / 2 - width / 2, maxLeft));

    el.style.top = `${Math.round(top)}px`;
    el.style.left = `${Math.round(left)}px`;
    el.style.visibility = "visible";
  };

  const onEnter = () => {
    if (showTimer !== null) clearTimeout(showTimer);
    showTimer = window.setTimeout(() => {
      showTimer = null;
      show();
    }, SHOW_DELAY_MS);
  };

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") hide();
  };

  hiders.add(hide);
  watchViewport(true);

  node.addEventListener("pointerenter", onEnter);
  node.addEventListener("pointerleave", hide);
  node.addEventListener("focus", show);
  node.addEventListener("blur", hide);
  node.addEventListener("pointerdown", hide);
  node.addEventListener("keydown", onKeydown);

  return {
    update(next: string) {
      current = next;
      if (tip?.style.visibility === "visible") show();
    },
    destroy() {
      hide();
      tip?.remove();
      tip = null;
      node.removeEventListener("pointerenter", onEnter);
      node.removeEventListener("pointerleave", hide);
      node.removeEventListener("focus", show);
      node.removeEventListener("blur", hide);
      node.removeEventListener("pointerdown", hide);
      node.removeEventListener("keydown", onKeydown);
      hiders.delete(hide);
      if (hiders.size === 0) watchViewport(false);
    },
  };
}
