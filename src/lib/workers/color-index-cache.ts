import { version } from "../../../package.json";
import type { ColorIndex } from "../utils/color-search";

// Parsing the ~1.1MB name list costs ~65ms and building the index another ~15ms,
// while IndexedDB returns the built index in under 10ms. It is stored per app
// release, which is also when the packaged name list can change.
const DB_NAME = "coloropoly";
const DB_VERSION = 1;
const STORE_NAME = "color-index";
const ENTRY_KEY = "names";

interface StoredIndex {
  version: string;
  index: ColorIndex;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function isColorIndex(value: unknown): value is ColorIndex {
  if (typeof value !== "object" || value === null) return false;
  const { coordinates, names, hexValues, lowerNames } = value as Partial<ColorIndex>;
  return (
    coordinates instanceof Float32Array &&
    Array.isArray(names) &&
    Array.isArray(hexValues) &&
    Array.isArray(lowerNames) &&
    coordinates.length === names.length * 3 &&
    hexValues.length === names.length &&
    lowerNames.length === names.length
  );
}

/** The index cached for this app release, or null when absent or unreadable. */
export async function readColorIndex(): Promise<ColorIndex | null> {
  try {
    const db = await openDb();
    try {
      const stored = await new Promise<StoredIndex | undefined>((resolve, reject) => {
        const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(ENTRY_KEY);
        request.onsuccess = () => resolve(request.result as StoredIndex | undefined);
        request.onerror = () => reject(request.error);
      });
      return stored?.version === version && isColorIndex(stored.index) ? stored.index : null;
    } finally {
      db.close();
    }
  } catch {
    return null;
  }
}

/** Best effort: a blocked or full store only costs the next visit a rebuild. */
export async function writeColorIndex(index: ColorIndex): Promise<void> {
  try {
    const db = await openDb();
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put({ version, index } satisfies StoredIndex, ENTRY_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
    } finally {
      db.close();
    }
  } catch {
    /* The name list still loads without the cache. */
  }
}
