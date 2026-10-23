import * as React from 'react';
import styles from './Portal.module.scss';
import type { IPortalProps } from './IPortalProps';
import type { IPortalLink } from '../../../models';
import { escape } from '@microsoft/sp-lodash-subset';
import * as strings from 'PortalWebPartStrings';

export default class Portal extends React.Component<IPortalProps> {
  public render(): React.ReactElement<IPortalProps> {
    const { title, links, libraryUrl, environmentMessage, userDisplayName } = this.props;
    const allLinks: IPortalLink[] = libraryUrl
      ? [...links, { title: strings.LibraryLinkTitle, url: libraryUrl }]
      : links;

    return (
      <section className={styles.portal}>
        <h2>{title}</h2>
        <p>{strings.Greeting}, {escape(userDisplayName)}!</p>
        <ul className={styles.links}>
          {allLinks.map(link => (
            <li key={link.url}>
              <a href={link.url} target="_blank" rel="noreferrer">{link.title}</a>
            </li>
          ))}
        </ul>
        {environmentMessage && <p className={styles.environment}>{environmentMessage}</p>}
      </section>
    );
  }
}
