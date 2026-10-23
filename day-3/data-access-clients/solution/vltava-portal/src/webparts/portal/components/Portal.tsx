import * as React from 'react';
import { getId, Icon, Link, SearchBox, Text, ThemeProvider, type PartialTheme } from '@fluentui/react';
import * as strings from 'PortalWebPartStrings';
import styles from './Portal.module.scss';
import type { IPortalProps } from './IPortalProps';
import type { IPortalLink } from '../../../models';
import { useFilteredLinks } from '../../../hooks';

export default function Portal(props: IPortalProps): JSX.Element {
  const { title, links, libraryUrl, showSearch, environmentMessage, userDisplayName, theme } = props;

  const [query, setQuery] = React.useState<string>('');
  // Stable id for aria-labelledby; React 17 has no useId.
  const [headingId] = React.useState<string>(() => getId('portalTitle'));

  const allLinks: IPortalLink[] = React.useMemo(
    () => (libraryUrl ? [...links, { title: strings.LibraryLinkTitle, url: libraryUrl }] : links),
    [links, libraryUrl]
  );
  const visibleLinks: IPortalLink[] = useFilteredLinks(allLinks, query);

  return (
    <ThemeProvider theme={theme as PartialTheme | undefined} className={styles.portal}>
      <section aria-labelledby={headingId}>
        <Text as="h2" variant="xLarge" id={headingId} block>{title}</Text>
        <Text as="p" block>{strings.Greeting}, {userDisplayName}!</Text>

        {showSearch && (
          <SearchBox
            className={styles.search}
            placeholder={strings.SearchPlaceholder}
            ariaLabel={strings.SearchPlaceholder}
            value={query}
            onChange={(_event, newValue) => setQuery(newValue || '')}
          />
        )}

        {visibleLinks.length === 0 ? (
          <Text as="p" block>{strings.NoLinks}</Text>
        ) : (
          <ul className={styles.links} aria-label={strings.LinksListLabel}>
            {visibleLinks.map((link: IPortalLink) => (
              <li key={link.url}>
                <Link
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${link.title} (${strings.OpensInNewTab})`}
                >
                  <Icon iconName="Link" aria-hidden={true} className={styles.icon} />
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {environmentMessage && (
          <Text as="p" variant="small" block className={styles.environment}>{environmentMessage}</Text>
        )}
      </section>
    </ThemeProvider>
  );
}
