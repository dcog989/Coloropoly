import { IMAGE_ANALYSIS } from "../constants";

/** 50 MP is about 200 MB of RGBA once decoded. */
export const MAX_IMAGE_PIXELS = 50_000_000;

export interface ImageSize {
  width: number;
  height: number;
}

const u16be = (bytes: Uint8Array, i: number): number => ((bytes[i] ?? 0) << 8) | (bytes[i + 1] ?? 0);
const u16le = (bytes: Uint8Array, i: number): number => (bytes[i] ?? 0) | ((bytes[i + 1] ?? 0) << 8);
const u24le = (bytes: Uint8Array, i: number): number =>
  (bytes[i] ?? 0) | ((bytes[i + 1] ?? 0) << 8) | ((bytes[i + 2] ?? 0) << 16);
const u32be = (bytes: Uint8Array, i: number): number =>
  (((bytes[i] ?? 0) << 24) | ((bytes[i + 1] ?? 0) << 16) | ((bytes[i + 2] ?? 0) << 8) | (bytes[i + 3] ?? 0)) >>> 0;
const u32le = (bytes: Uint8Array, i: number): number =>
  ((bytes[i] ?? 0) | ((bytes[i + 1] ?? 0) << 8) | ((bytes[i + 2] ?? 0) << 16) | ((bytes[i + 3] ?? 0) << 24)) >>> 0;

const ascii = (bytes: Uint8Array, offset: number, text: string): boolean => {
  for (let i = 0; i < text.length; i++) {
    if (bytes[offset + i] !== text.charCodeAt(i)) return false;
  }
  return true;
};

const jpegSize = (bytes: Uint8Array): ImageSize | null => {
  let i = 2;
  while (i + 9 <= bytes.length) {
    if (bytes[i] !== 0xff) {
      i++;
      continue;
    }

    const marker = bytes[i + 1] ?? 0;
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: u16be(bytes, i + 5), width: u16be(bytes, i + 7) };
    }

    // Standalone markers have no length field.
    if (marker === 0x01 || marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }

    const length = u16be(bytes, i + 2);
    if (length < 2) return null;
    i += 2 + length;
  }
  return null;
};

const webpSize = (bytes: Uint8Array): ImageSize | null => {
  if (bytes.length < 30) return null;
  if (ascii(bytes, 12, "VP8X")) return { width: 1 + u24le(bytes, 24), height: 1 + u24le(bytes, 27) };
  if (ascii(bytes, 12, "VP8L")) {
    const bits = u32le(bytes, 21);
    return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) };
  }
  if (ascii(bytes, 12, "VP8 ")) return { width: u16le(bytes, 26) & 0x3fff, height: u16le(bytes, 28) & 0x3fff };
  return null;
};

const avifSize = (bytes: Uint8Array): ImageSize | null => {
  if (!ascii(bytes, 4, "ftyp")) return null;
  for (let i = 8; i + 15 < bytes.length; i++) {
    if (ascii(bytes, i, "ispe")) return { width: u32be(bytes, i + 8), height: u32be(bytes, i + 12) };
  }
  return null;
};

/** Pixel dimensions from the file header, or null when the format is not recognised. */
export function readImageSize(bytes: Uint8Array): ImageSize | null {
  if (bytes.length >= 24 && ascii(bytes, 1, "PNG")) return { width: u32be(bytes, 16), height: u32be(bytes, 20) };
  if (bytes.length >= 10 && ascii(bytes, 0, "GIF8")) return { width: u16le(bytes, 6), height: u16le(bytes, 8) };
  if (bytes.length >= 26 && ascii(bytes, 0, "BM")) {
    return { width: Math.abs(u32le(bytes, 18) | 0), height: Math.abs(u32le(bytes, 22) | 0) };
  }
  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) return jpegSize(bytes);
  if (bytes.length >= 12 && ascii(bytes, 0, "RIFF") && ascii(bytes, 8, "WEBP")) return webpSize(bytes);
  return avifSize(bytes);
}

export function validateImageFile(file: File): void {
  if (!IMAGE_ANALYSIS.ALLOWED_TYPES.includes(file.type as (typeof IMAGE_ANALYSIS.ALLOWED_TYPES)[number])) {
    throw new Error("Unsupported format. Please use JPEG, PNG, WEBP, AVIF, GIF, BMP, or SVG.");
  }
  if (file.size > IMAGE_ANALYSIS.MAX_FILE_SIZE) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const maxMb = IMAGE_ANALYSIS.MAX_FILE_SIZE / (1024 * 1024);
    throw new Error(`Image too large (${sizeMb}MB). Max size is ${maxMb}MB.`);
  }
}

/**
 * The 10 MB byte cap does not bound pixels: a flat-colour PNG can declare
 * 30000x30000 in a few hundred KB. Read the header first so the browser never
 * allocates the full decoded bitmap. shortcut: SVG is skipped, it rasterises small.
 */
export async function assertImagePixelBudget(file: File): Promise<void> {
  const size = readImageSize(new Uint8Array(await file.arrayBuffer()));
  if (!size) return;

  const pixels = size.width * size.height;
  if (pixels > MAX_IMAGE_PIXELS) {
    throw new Error(
      `Image is ${size.width}x${size.height} (${Math.round(pixels / 1_000_000)}MP). Max size is ${MAX_IMAGE_PIXELS / 1_000_000}MP.`,
    );
  }
}
