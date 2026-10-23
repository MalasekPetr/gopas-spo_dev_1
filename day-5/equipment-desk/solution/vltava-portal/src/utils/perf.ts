import { Log } from '@microsoft/sp-core-library';

/**
 * Runs an async action between two performance marks and logs the duration.
 * The measure is visible in the browser Performance panel (User Timings) and the log line in
 * the SPFx developer dashboard (Ctrl+F12, Trace tab).
 * Log source is truncated by SPFx to 20 characters -- keep it short.
 */
export async function measure<T>(source: string, name: string, action: () => Promise<T>): Promise<T> {
  const start: string = `${name}:start`;
  const end: string = `${name}:end`;
  performance.mark(start);
  try {
    return await action();
  } finally {
    performance.mark(end);
    performance.measure(name, start, end);
    const entries: PerformanceEntryList = performance.getEntriesByName(name, 'measure');
    const duration: number = entries.length > 0 ? entries[entries.length - 1].duration : 0;
    Log.info(source, `${name}: ${Math.round(duration)} ms`);
  }
}
