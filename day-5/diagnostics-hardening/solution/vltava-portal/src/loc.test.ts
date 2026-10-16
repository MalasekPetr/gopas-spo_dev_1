/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';

// Every key declared in a mystrings.d.ts must exist in every locale file next to it.
// TypeScript does not check this; a missing key is `undefined` at runtime (see day 1 and 2).
// The test runs in Node.js (Jest), not in the browser, so it may read files from disk.

const SRC: string = path.join(process.cwd(), 'src');

function findLocFolders(dir: string): string[] {
  const found: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full: string = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'loc') {
        found.push(full);
      } else {
        found.push(...findLocFolders(full));
      }
    }
  }
  return found;
}

function collect(content: string, pattern: RegExp): string[] {
  const keys: string[] = [];
  let match: RegExpExecArray | null = pattern.exec(content);
  while (match) {
    keys.push(match[1]);
    match = pattern.exec(content);
  }
  return keys;
}

describe('localization files', () => {
  for (const folder of findLocFolders(SRC)) {
    const dts: string | undefined = fs.readdirSync(folder).find((f: string) => f.toLowerCase() === 'mystrings.d.ts');
    if (!dts) {
      continue;
    }
    const keys: string[] = collect(fs.readFileSync(path.join(folder, dts), 'utf8'), /^\s+(\w+): string;/gm);
    const locales: string[] = fs.readdirSync(folder).filter((f: string) => /^[a-z]{2}-[a-z]{2}\.js$/.test(f));

    for (const locale of locales) {
      it(`${path.relative(SRC, folder)}/${locale} has all ${keys.length} keys`, () => {
        const present: string[] = collect(fs.readFileSync(path.join(folder, locale), 'utf8'), /^\s+"(\w+)":/gm);
        expect(keys.filter((k: string) => present.indexOf(k) < 0)).toEqual([]);
      });
    }
  }
});
