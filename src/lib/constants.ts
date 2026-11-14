// Design Tokens and Constants for Coloropoly

// Image Analysis Constants
export const IMAGE_ANALYSIS = {
  DOWNSAMPLE_SIZE: 256, // Optimized: ~65k pixels matches worker sampling target
  MERGE_DISTANCE: 0.05, // Manhattan distance, as a share of the 765 max, under which two colors merge
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/bmp", "image/svg+xml"],
} as const;

// Paintbox Constants
export const PAINTBOX = {
  MAX_COLORS: 24,
  STORAGE_KEY: "paintbox",
} as const;

// Collapsible panel ids and their localStorage key prefix
export const PANEL_IDS = {
  IMAGE: "image",
  CONTRAST: "contrast",
  COLOR_SETS: "color-sets",
  PALETTE: "palette",
  PAINTBOX: "paintbox",
} as const;

export const PANEL_STORAGE_PREFIX = "collapsed-panel:";

// Export dimensions
export const EXPORT = {
  PNG_WIDTH: 1200,
  PNG_HEIGHT: 630,
  SVG_SIZE: 400,
} as const;

// Palette file import/export
export const PALETTE_FILE = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPT: ".json,.gpl,application/json,text/plain",
} as const;
