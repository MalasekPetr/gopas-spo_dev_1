import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  type IPropertyPaneDropdownOption,
  PropertyPaneDropdown,
  PropertyPaneLabel,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { SPHttpClient, type SPHttpClientResponse } from '@microsoft/sp-http';

import * as strings from 'PortalWebPartStrings';
import Portal from './components/Portal';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { IPortalProps } from './components/IPortalProps';
import { parseLinks, validateLinks, type ILinkError } from '../../utils';

export interface IPortalWebPartProps {
  title: string;
  links: string;
  libraryUrl: string;
  showSearch: boolean;
  showEnvironment: boolean;
}

interface ILibraryInfo {
  Title: string;
  RootFolder: { ServerRelativeUrl: string };
}

const MAX_TITLE_LENGTH: number = 60;

export default class PortalWebPart extends BaseClientSideWebPart<IPortalWebPartProps> {

  private _environmentMessage: string = '';
  private _theme: IReadonlyTheme | undefined;
  private _libraryOptions: IPropertyPaneDropdownOption[] = [];
  private _librariesLoading: boolean = false;
  private _librariesError: string = '';

  public render(): void {
    const component: React.ReactElement<IPortalProps> = React.createElement(
      Portal,
      {
        title: this.properties.title || strings.PortalTitle,
        links: parseLinks(this.properties.links),
        libraryUrl: this._toAbsoluteUrl(this.properties.libraryUrl),
        showSearch: this.properties.showSearch,
        environmentMessage: this.properties.showEnvironment ? this._environmentMessage : '',
        userDisplayName: this.context.pageContext.user.displayName,
        theme: this._theme
      }
    );

    // One failing web part must not break the page: render errors end in a message.
    const element: React.ReactElement = React.createElement(
      ErrorBoundary, { source: 'VltavaPortal', fallbackText: strings.RenderError }, component);

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    });
  }

  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
            case 'TeamsModern':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    // Section background (theme variant) is passed to Fluent UI via ThemeProvider.
    this._theme = currentTheme;

    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  // Non-reactive: changes are applied only after the Apply button.
  protected get disableReactivePropertyChanges(): boolean {
    return true;
  }

  protected async onPropertyPaneConfigurationStart(): Promise<void> {
    if (this._libraryOptions.length > 0 || this._librariesLoading) {
      return;
    }

    this._librariesLoading = true;
    this.context.propertyPane.refresh();

    try {
      this._libraryOptions = await this._loadLibraries();
      this._librariesError = '';
    } catch {
      this._libraryOptions = [];
      this._librariesError = strings.LibrariesLoadError;
    }

    this._librariesLoading = false;
    this.context.propertyPane.refresh();
  }

  private async _loadLibraries(): Promise<IPropertyPaneDropdownOption[]> {
    const url: string = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists` +
      '?$filter=BaseTemplate eq 101 and Hidden eq false' +
      '&$select=Title,RootFolder/ServerRelativeUrl&$expand=RootFolder';
    const response: SPHttpClientResponse = await this.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    const data: { value: ILibraryInfo[] } = await response.json();
    const options: IPropertyPaneDropdownOption[] = data.value.map((library: ILibraryInfo) => ({
      key: library.RootFolder.ServerRelativeUrl,
      text: library.Title
    }));
    return [{ key: '', text: strings.NoLibraryOption }, ...options];
  }

  private _toAbsoluteUrl(serverRelativeUrl: string): string {
    if (!serverRelativeUrl) {
      return '';
    }
    return new URL(serverRelativeUrl, this.context.pageContext.web.absoluteUrl).toString();
  }

  private _validateTitle(value: string): string {
    return (value || '').length > MAX_TITLE_LENGTH
      ? strings.TitleTooLong.replace('{0}', MAX_TITLE_LENGTH.toString())
      : '';
  }

  private _validateLinks(value: string): string {
    const error: ILinkError | undefined = validateLinks(value);
    if (!error) {
      return '';
    }
    const template: string = error.reason === 'url' ? strings.LinksUrlError : strings.LinksFormatError;
    return template.replace('{0}', error.line.toString());
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      showLoadingIndicator: this._librariesLoading,
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.ContentGroupName,
              groupFields: [
                PropertyPaneTextField('title', {
                  label: strings.TitleFieldLabel,
                  placeholder: strings.PortalTitle,
                  onGetErrorMessage: this._validateTitle.bind(this)
                }),
                PropertyPaneTextField('links', {
                  label: strings.LinksFieldLabel,
                  description: strings.LinksFieldDescription,
                  multiline: true,
                  rows: 6,
                  onGetErrorMessage: this._validateLinks.bind(this)
                })
              ]
            },
            {
              groupName: strings.LibraryGroupName,
              groupFields: [
                PropertyPaneDropdown('libraryUrl', {
                  label: strings.LibraryFieldLabel,
                  options: this._libraryOptions,
                  disabled: this._libraryOptions.length === 0
                }),
                ...(this._librariesError ? [PropertyPaneLabel('libraryError', { text: this._librariesError })] : [])
              ]
            },
            {
              groupName: strings.DisplayGroupName,
              groupFields: [
                PropertyPaneToggle('showSearch', {
                  label: strings.ShowSearchFieldLabel
                }),
                PropertyPaneToggle('showEnvironment', {
                  label: strings.ShowEnvironmentFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
