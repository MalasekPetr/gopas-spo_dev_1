import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  type PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';

import * as strings from 'PortalBannerApplicationCustomizerStrings';
import styles from './PortalBanner.module.scss';

export type BannerLevel = 'info' | 'warning' | 'error';

export interface IPortalBannerApplicationCustomizerProperties {
  message: string;
  level?: BannerLevel;
}

const LOG_SOURCE: string = 'PortalBannerApplicationCustomizer';
const DISMISS_KEY: string = 'vltava-portal-banner-dismissed';

/**
 * Renders an announcement banner into the Top placeholder of every page.
 * Runs on every page load: deliberately no React and no Fluent UI, only DOM API.
 */
export default class PortalBannerApplicationCustomizer
  extends BaseApplicationCustomizer<IPortalBannerApplicationCustomizerProperties> {

  private _topPlaceholder: PlaceholderContent | undefined;

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized');
    // Placeholders are created and re-created during navigation; react to every change.
    this.context.placeholderProvider.changedEvent.add(this, this._render);
    this._render();
    return Promise.resolve();
  }

  private _render(): void {
    const message: string = (this.properties.message || '').trim();
    if (!message || this._isDismissed(message) || this._topPlaceholder) {
      return;
    }

    // Never assume the placeholder exists (some page types have no Top placeholder).
    this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top);
    if (!this._topPlaceholder) {
      Log.warn(LOG_SOURCE, 'Top placeholder not available');
      return;
    }

    const banner: HTMLDivElement = document.createElement('div');
    banner.className = `${styles.banner} ${styles[this.properties.level || 'info']}`;
    banner.setAttribute('role', 'status');

    const text: HTMLSpanElement = document.createElement('span');
    // textContent, not innerHTML: the message comes from configuration and must not inject HTML.
    text.textContent = message;

    const close: HTMLButtonElement = document.createElement('button');
    close.type = 'button';
    close.className = styles.close;
    close.setAttribute('aria-label', strings.Dismiss);
    close.textContent = '\u00D7'; // multiplication sign as the close glyph
    close.addEventListener('click', () => {
      this._dismiss(message);
      banner.remove();
    });

    banner.appendChild(text);
    banner.appendChild(close);
    this._topPlaceholder.domElement.appendChild(banner);
  }

  private _isDismissed(message: string): boolean {
    try {
      return window.sessionStorage.getItem(DISMISS_KEY) === message;
    } catch {
      return false; // storage can be blocked by browser policy
    }
  }

  private _dismiss(message: string): void {
    try {
      window.sessionStorage.setItem(DISMISS_KEY, message);
    } catch {
      // ignore: the banner just comes back on the next page
    }
  }
}
