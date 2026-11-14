import { PANEL_IDS, PANEL_STORAGE_PREFIX } from "../constants";

export type PanelId = (typeof PANEL_IDS)[keyof typeof PANEL_IDS];

const readStored = (id: PanelId): boolean => {
  try {
    return localStorage.getItem(`${PANEL_STORAGE_PREFIX}${id}`) === "true";
  } catch {
    return false;
  }
};

export class PanelStore {
  #collapsed = $state<Record<PanelId, boolean>>({
    [PANEL_IDS.IMAGE]: readStored(PANEL_IDS.IMAGE),
    [PANEL_IDS.CONTRAST]: readStored(PANEL_IDS.CONTRAST),
    [PANEL_IDS.COLOR_SETS]: readStored(PANEL_IDS.COLOR_SETS),
    [PANEL_IDS.PALETTE]: readStored(PANEL_IDS.PALETTE),
    [PANEL_IDS.PAINTBOX]: readStored(PANEL_IDS.PAINTBOX),
  });

  isCollapsed(id: PanelId): boolean {
    return this.#collapsed[id];
  }

  setCollapsed(id: PanelId, collapsed: boolean): void {
    this.#collapsed[id] = collapsed;
    try {
      localStorage.setItem(`${PANEL_STORAGE_PREFIX}${id}`, String(collapsed));
    } catch {
      /* Storage blocked; the state still applies for this visit. */
    }
  }
}
