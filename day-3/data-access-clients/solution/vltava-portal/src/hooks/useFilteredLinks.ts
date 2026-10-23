import * as React from 'react';
import type { IPortalLink } from '../models';

/** Filters links by title; the result is recomputed only when links or query change. */
export function useFilteredLinks(links: IPortalLink[], query: string): IPortalLink[] {
  return React.useMemo(() => {
    const needle: string = query.trim().toLocaleLowerCase();
    if (!needle) {
      return links;
    }
    return links.filter((link: IPortalLink) => link.title.toLocaleLowerCase().indexOf(needle) >= 0);
  }, [links, query]);
}
