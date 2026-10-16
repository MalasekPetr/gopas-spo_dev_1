import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { type IPropertyPaneConfiguration, PropertyPaneToggle } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
import type { MSGraphClientV3 } from '@microsoft/sp-http';

import * as strings from 'EmployeeDirectoryWebPartStrings';
import EmployeeDirectory from './components/EmployeeDirectory';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import type { IEmployeeDirectoryProps } from './components/IEmployeeDirectoryProps';
import { createEmployeeService, type IEmployeeService } from '../../services/employeeService';

export interface IEmployeeDirectoryWebPartProps {
  showPresence: boolean;
}

export default class EmployeeDirectoryWebPart extends BaseClientSideWebPart<IEmployeeDirectoryWebPartProps> {

  private _service: IEmployeeService | undefined;
  private _theme: IReadonlyTheme | undefined;

  protected async onInit(): Promise<void> {
    await super.onInit();
    // The Graph client is created once; the component gets a service, not the SPFx context.
    const client: MSGraphClientV3 = await this.context.msGraphClientFactory.getClient('3');
    this._service = createEmployeeService(client);
  }

  public render(): void {
    if (!this._service) {
      return;
    }
    const component: React.ReactElement<IEmployeeDirectoryProps> = React.createElement(
      EmployeeDirectory,
      {
        service: this._service,
        showPresence: this.properties.showPresence,
        theme: this._theme
      }
    );

    // One failing web part must not break the page: render errors end in a message.
    const element: React.ReactElement = React.createElement(
      ErrorBoundary, { source: 'VltavaDirectory', fallbackText: strings.RenderError }, component);

    ReactDom.render(element, this.domElement);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    this._theme = currentTheme;
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.DisplayGroupName,
              groupFields: [
                PropertyPaneToggle('showPresence', {
                  label: strings.ShowPresenceFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
