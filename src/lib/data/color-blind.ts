export interface ColorBlindMode {
  /** Also the SVG filter id in ColorBlindFilters, `cb-<value>`. */
  value: string;
  label: string;
  /** feColorMatrix values. Missing for the "none" mode. */
  matrix?: string;
}

export const COLOR_BLIND_MODES: ColorBlindMode[] = [
  { value: "none", label: "None" },
  {
    value: "protanopia",
    label: "Protanopia",
    matrix: `
      0.567, 0.433, 0, 0, 0
      0.558, 0.442, 0, 0, 0
      0, 0.242, 0.758, 0, 0
      0, 0, 0, 1, 0
    `,
  },
  {
    value: "protanomaly",
    label: "Protanomaly",
    matrix: `
      0.817, 0.183, 0, 0, 0
      0.333, 0.667, 0, 0, 0
      0, 0.125, 0.875, 0, 0
      0, 0, 0, 1, 0
    `,
  },
  {
    value: "deuteranopia",
    label: "Deuteranopia",
    matrix: `
      0.625, 0.375, 0, 0, 0
      0.7, 0.3, 0, 0, 0
      0, 0.3, 0.7, 0, 0
      0, 0, 0, 1, 0
    `,
  },
  {
    value: "deuteranomaly",
    label: "Deuteranomaly",
    matrix: `
      0.8, 0.2, 0, 0, 0
      0.258, 0.742, 0, 0, 0
      0, 0.142, 0.858, 0, 0
      0, 0, 0, 1, 0
    `,
  },
  {
    value: "tritanopia",
    label: "Tritanopia",
    matrix: `
      0.95, 0.05, 0, 0, 0
      0, 0.433, 0.567, 0, 0
      0, 0.475, 0.525, 0, 0
      0, 0, 0, 1, 0
    `,
  },
  {
    value: "tritanomaly",
    label: "Tritanomaly",
    matrix: `
      0.967, 0.033, 0, 0, 0
      0, 0.733, 0.267, 0, 0
      0, 0.183, 0.817, 0, 0
      0, 0, 0, 1, 0
    `,
  },
  {
    value: "achromatopsia",
    label: "Achromatopsia",
    matrix: `
      0.299, 0.587, 0.114, 0, 0
      0.299, 0.587, 0.114, 0, 0
      0.299, 0.587, 0.114, 0, 0
      0, 0, 0, 1, 0
    `,
  },
  {
    value: "achromatomaly",
    label: "Achromatomaly",
    matrix: `
      0.618, 0.320, 0.062, 0, 0
      0.163, 0.775, 0.062, 0, 0
      0.163, 0.320, 0.516, 0, 0
      0, 0, 0, 1, 0
    `,
  },
];
