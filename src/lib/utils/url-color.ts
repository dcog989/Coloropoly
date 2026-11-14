// The hash carries the full oklch() string so wide-gamut colors and alpha survive the trip.
export const toColorHash = (css: string): string => `#${encodeURIComponent(css)}`;

export function fromColorHash(hash: string): string | null {
  const payload = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!payload) return null;

  let decoded: string;
  try {
    decoded = decodeURIComponent(payload);
  } catch {
    return null;
  }

  // The fragment delimiter doubles as the hex/name prefix; a color function does not need it.
  return /^[a-z-]+\(/i.test(decoded) ? decoded : `#${decoded}`;
}
