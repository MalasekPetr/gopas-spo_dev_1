import * as React from 'react';
import styles from './Portal.module.scss';
import type { IPortalProps } from './IPortalProps';
import { escape } from '@microsoft/sp-lodash-subset';
import * as strings from 'PortalWebPartStrings';

interface IPortalLink {
  title: string;
  url: string;
}

// Hard-coded on purpose: day 2 moves the links to the property pane.
const links: IPortalLink[] = [
  { title: 'HR portal', url: 'https://www.example.com/hr' },
  { title: 'Service desk', url: 'https://www.example.com/servicedesk' },
  { title: 'Canteen menu', url: 'https://www.example.com/canteen' }
];

export default class Portal extends React.Component<IPortalProps> {
  public render(): React.ReactElement<IPortalProps> {
    const { description, environmentMessage, userDisplayName } = this.props;

    return (
      <section className={styles.portal}>
        <h2>{strings.PortalTitle}</h2>
        <p>{strings.Greeting}, {escape(userDisplayName)}!</p>
        <p>{escape(description)}</p>
        <ul className={styles.links}>
          {links.map(link => (
            <li key={link.url}>
              <a href={link.url} target="_blank" rel="noreferrer">{link.title}</a>
            </li>
          ))}
        </ul>
        <p className={styles.environment}>{environmentMessage}</p>
      </section>
    );
  }
}
