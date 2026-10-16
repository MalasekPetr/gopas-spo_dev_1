import type { IPortalLink } from '../models';

// One link per line in the format "Title|https://address".
const SEPARATOR: string = '|';

export type LinkErrorReason = 'format' | 'url';

export interface ILinkError {
  line: number;
  reason: LinkErrorReason;
}

function splitLine(line: string): IPortalLink | undefined {
  const index: number = line.indexOf(SEPARATOR);
  if (index < 1) {
    return undefined;
  }
  const title: string = line.substring(0, index).trim();
  const url: string = line.substring(index + 1).trim();
  return title && url ? { title, url } : undefined;
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

/** Returns the first invalid line, or undefined when all lines are valid. */
export function validateLinks(text: string | undefined): ILinkError | undefined {
  const lines: string[] = (text || '').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line: string = lines[i].trim();
    if (!line) {
      continue;
    }
    const link: IPortalLink | undefined = splitLine(line);
    if (!link) {
      return { line: i + 1, reason: 'format' };
    }
    if (!isHttpsUrl(link.url)) {
      return { line: i + 1, reason: 'url' };
    }
  }
  return undefined;
}

/** Parses valid lines into links; invalid lines are skipped. */
export function parseLinks(text: string | undefined): IPortalLink[] {
  const links: IPortalLink[] = [];
  (text || '').split('\n').forEach((raw: string) => {
    const link: IPortalLink | undefined = splitLine(raw.trim());
    if (link && isHttpsUrl(link.url)) {
      links.push(link);
    }
  });
  return links;
}
