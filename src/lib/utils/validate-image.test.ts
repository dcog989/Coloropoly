import { describe, expect, it } from "vitest";
import { IMAGE_ANALYSIS } from "../constants";
import { assertImagePixelBudget, readImageSize, validateImageFile } from "./validate-image";

const fileOf = (type: string, size: number) => ({ type, size }) as File;

const u32be = (value: number) => [value >>> 24, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff];
const u32le = (value: number) => [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, value >>> 24];

const png = (width: number, height: number) => {
  const bytes = new Uint8Array(24);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  bytes.set([0x49, 0x48, 0x44, 0x52], 12);
  bytes.set(u32be(width), 16);
  bytes.set(u32be(height), 20);
  return bytes;
};

const gif = (width: number, height: number) =>
  Uint8Array.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, width & 0xff, width >>> 8, height & 0xff, height >>> 8]);

const jpeg = (width: number, height: number) =>
  Uint8Array.from([0xff, 0xd8, 0xff, 0xc0, 0, 0x11, 8, height >>> 8, height & 0xff, width >>> 8, width & 0xff]);

const bmp = (width: number, height: number) => {
  const bytes = new Uint8Array(26);
  bytes.set([0x42, 0x4d]);
  bytes.set(u32le(width), 18);
  bytes.set(u32le(height), 22);
  return bytes;
};

const webp = (width: number, height: number) => {
  const bytes = new Uint8Array(30);
  bytes.set([0x52, 0x49, 0x46, 0x46], 0);
  bytes.set([0x57, 0x45, 0x42, 0x50], 8);
  bytes.set([0x56, 0x50, 0x38, 0x58], 12);
  const widthMinusOne = width - 1;
  const heightMinusOne = height - 1;
  bytes.set([widthMinusOne & 0xff, (widthMinusOne >>> 8) & 0xff, (widthMinusOne >>> 16) & 0xff], 24);
  bytes.set([heightMinusOne & 0xff, (heightMinusOne >>> 8) & 0xff, (heightMinusOne >>> 16) & 0xff], 27);
  return bytes;
};

const avif = (width: number, height: number) => {
  const bytes = new Uint8Array(32);
  bytes.set([0x66, 0x74, 0x79, 0x70], 4);
  bytes.set([0x69, 0x73, 0x70, 0x65], 12);
  bytes.set(u32be(width), 20);
  bytes.set(u32be(height), 24);
  return bytes;
};

describe("validateImageFile", () => {
  it("accepts an allowed type under the size limit", () => {
    expect(() => validateImageFile(fileOf("image/png", 1024))).not.toThrow();
  });

  it("rejects unsupported types", () => {
    expect(() => validateImageFile(fileOf("text/plain", 1024))).toThrow(/Unsupported format/);
  });

  it("rejects files over the size limit", () => {
    expect(() => validateImageFile(fileOf("image/png", IMAGE_ANALYSIS.MAX_FILE_SIZE + 1))).toThrow(/Image too large/);
  });
});

describe("readImageSize", () => {
  it("reads the header of every raster format the app accepts", () => {
    expect(readImageSize(png(1200, 800))).toEqual({ width: 1200, height: 800 });
    expect(readImageSize(gif(640, 480))).toEqual({ width: 640, height: 480 });
    expect(readImageSize(jpeg(1920, 1080))).toEqual({ width: 1920, height: 1080 });
    expect(readImageSize(bmp(320, 200))).toEqual({ width: 320, height: 200 });
    expect(readImageSize(webp(4000, 3000))).toEqual({ width: 4000, height: 3000 });
    expect(readImageSize(avif(8000, 6000))).toEqual({ width: 8000, height: 6000 });
  });

  it("returns null for an unknown or truncated file", () => {
    expect(readImageSize(new Uint8Array())).toBeNull();
    expect(readImageSize(Uint8Array.from([0x3c, 0x73, 0x76, 0x67]))).toBeNull();
  });
});

describe("assertImagePixelBudget", () => {
  it("rejects a huge raster before it is decoded", async () => {
    const file = new File([png(30_000, 30_000)], "huge.png", { type: "image/png" });

    await expect(assertImagePixelBudget(file)).rejects.toThrow(/Max size is 50MP/);
  });

  it("allows a normal image and a format it cannot inspect", async () => {
    await expect(
      assertImagePixelBudget(new File([png(1920, 1080)], "photo.png", { type: "image/png" })),
    ).resolves.toBeUndefined();
    await expect(
      assertImagePixelBudget(new File(["<svg/>"], "icon.svg", { type: "image/svg+xml" })),
    ).resolves.toBeUndefined();
  });
});
