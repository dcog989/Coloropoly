import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { tooltip } from "./tooltip";

const TOOLTIP_WIDTH = 80;
const TOOLTIP_HEIGHT = 24;

const rect = (top: number, left: number, width = 40, height = 20): DOMRect =>
  ({
    top,
    left,
    right: left + width,
    bottom: top + height,
    width,
    height,
    x: left,
    y: top,
    toJSON: () => ({}),
  }) as DOMRect;

const makeTrigger = (top = 100, left = 100): HTMLButtonElement => {
  const node = document.createElement("button");
  node.getBoundingClientRect = () => rect(top, left);
  document.body.append(node);
  return node;
};

const tip = (): HTMLElement => document.querySelector(".app-tooltip") as HTMLElement;

let offsetWidth: PropertyDescriptor | undefined;
let offsetHeight: PropertyDescriptor | undefined;

beforeEach(() => {
  vi.useFakeTimers();

  // jsdom has no layout, so give only the tooltip element a box to position.
  offsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth");
  offsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight");
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get(this: HTMLElement) {
      return this.classList.contains("app-tooltip") ? TOOLTIP_WIDTH : 0;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get(this: HTMLElement) {
      return this.classList.contains("app-tooltip") ? TOOLTIP_HEIGHT : 0;
    },
  });
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
  if (offsetWidth) Object.defineProperty(HTMLElement.prototype, "offsetWidth", offsetWidth);
  if (offsetHeight) Object.defineProperty(HTMLElement.prototype, "offsetHeight", offsetHeight);
});

describe("tooltip action", () => {
  it("shows after the hover delay and hides on leave", () => {
    const node = makeTrigger();
    const action = tooltip(node, "Copy");

    node.dispatchEvent(new Event("pointerenter"));
    expect(document.querySelector(".app-tooltip")).toBeNull();

    vi.advanceTimersByTime(250);
    expect(tip().textContent).toBe("Copy");
    expect(tip().style.visibility).toBe("visible");
    expect(tip().getAttribute("aria-hidden")).toBe("true");

    node.dispatchEvent(new Event("pointerleave"));
    expect(tip().style.visibility).toBe("hidden");
    action.destroy();
  });

  it("shows immediately on focus and updates live text", () => {
    const node = makeTrigger();
    const action = tooltip(node, "Copy");

    node.focus();
    expect(tip().style.visibility).toBe("visible");

    action.update("Copy hex");
    expect(tip().textContent).toBe("Copy hex");

    node.blur();
    expect(tip().style.visibility).toBe("hidden");
    action.destroy();
  });

  it("places above the trigger and centres it", () => {
    const node = makeTrigger(100, 100);
    const action = tooltip(node, "Copy");

    node.focus();

    expect(tip().style.top).toBe(`${100 - TOOLTIP_HEIGHT - 8}px`);
    expect(tip().style.left).toBe(`${100 + 20 - TOOLTIP_WIDTH / 2}px`);
    action.destroy();
  });

  it("flips below and clamps when there is no room above or at the left edge", () => {
    const node = makeTrigger(10, 0);
    const action = tooltip(node, "Copy");

    node.focus();

    expect(tip().style.top).toBe(`${10 + 20 + 8}px`);
    expect(tip().style.left).toBe("4px");
    action.destroy();
  });

  it("removes the tooltip and its listeners on destroy", () => {
    const node = makeTrigger();
    const action = tooltip(node, "Copy");

    action.destroy();
    expect(document.querySelector(".app-tooltip")).toBeNull();

    node.dispatchEvent(new Event("pointerenter"));
    vi.advanceTimersByTime(250);
    expect(document.querySelector(".app-tooltip")).toBeNull();
  });

  it("hides a visible tip when the window scrolls", () => {
    const node = makeTrigger();
    const action = tooltip(node, "Copy");

    node.focus();
    expect(tip().style.visibility).toBe("visible");

    window.dispatchEvent(new Event("scroll"));
    expect(tip().style.visibility).toBe("hidden");

    action.destroy();
  });
});
