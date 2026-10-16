// Small read-through cache: memory first, then sessionStorage, then the loader.
// sessionStorage lives only for the browser tab: tenant data does not stay on the device
// after the tab is closed (unlike localStorage or IndexedDB).

interface ICacheEntry<T> {
  expires: number;
  value: T;
}

const PREFIX: string = 'vltava-portal:';
const memory: Map<string, ICacheEntry<unknown>> = new Map<string, ICacheEntry<unknown>>();

function readSession<T>(key: string): ICacheEntry<T> | undefined {
  try {
    const raw: string | null = window.sessionStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) as ICacheEntry<T> : undefined;
  } catch {
    return undefined; // storage blocked or corrupted entry
  }
}

function writeSession<T>(key: string, entry: ICacheEntry<T>): void {
  try {
    window.sessionStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // quota exceeded or storage blocked: memory cache still works
  }
}

export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const now: number = Date.now();
  const hit: ICacheEntry<T> | undefined = (memory.get(key) as ICacheEntry<T> | undefined) || readSession<T>(key);
  if (hit && hit.expires > now) {
    memory.set(key, hit);
    return hit.value;
  }
  const value: T = await load();
  const entry: ICacheEntry<T> = { expires: now + ttlMs, value };
  memory.set(key, entry);
  writeSession(key, entry);
  return value;
}
