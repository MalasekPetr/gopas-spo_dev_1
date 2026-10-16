import { parseLinks, validateLinks } from './links';

describe('validateLinks', () => {
  it('accepts valid lines and ignores empty ones', () => {
    expect(validateLinks('HR|https://example.com/hr\n\nWiki|https://example.com/wiki')).toBeUndefined();
  });

  it('reports a line without the separator as a format error', () => {
    expect(validateLinks('HR|https://example.com/hr\nServis https://example.com')).toEqual({ line: 2, reason: 'format' });
  });

  it('rejects http addresses', () => {
    expect(validateLinks('Wiki|http://example.com/wiki')).toEqual({ line: 1, reason: 'url' });
  });

  it('treats undefined as valid (empty property)', () => {
    expect(validateLinks(undefined)).toBeUndefined();
  });
});

describe('parseLinks', () => {
  it('returns only valid links, trimmed', () => {
    expect(parseLinks(' HR | https://example.com/hr \nbroken line\nWiki|http://example.com')).toEqual([
      { title: 'HR', url: 'https://example.com/hr' }
    ]);
  });
});
