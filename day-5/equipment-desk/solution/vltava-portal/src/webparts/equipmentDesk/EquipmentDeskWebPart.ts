import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import type { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
import type { MSGraphClientV3 } from '@microsoft/sp-http';

import * as strings from 'EquipmentDeskWebPartStrings';
import EquipmentDesk from './components/EquipmentDesk';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import type { IEquipmentDeskProps } from './components/IEquipmentDeskProps';
import { initSP } from '../../services/pnp';
import { createLoanService, type ILoanService } from '../../services/loanService';
import { createEmployeeService, type IEmployeeService } from '../../services/employeeService';

// No configurable properties: both lists are fixed by URL.
export type IEquipmentDeskWebPartProps = Record<string, never>;

export default class EquipmentDeskWebPart extends BaseClientSideWebPart<IEquipmentDeskWebPartProps> {

  private _loans: ILoanService | undefined;
  private _employees: IEmployeeService | undefined;
  private _theme: IReadonlyTheme | undefined;

  protected async onInit(): Promise<void> {
    await super.onInit();
    // Two services, two sources: SharePoint lists (PnPjs) and the directory (Graph).
    this._loans = createLoanService(initSP(this.context), this.context.pageContext.web.serverRelativeUrl);
    const client: MSGraphClientV3 = await this.context.msGraphClientFactory.getClient('3');
    this._employees = createEmployeeService(client);
  }

  public render(): void {
    if (!this._loans || !this._employees) {
      return;
    }
    const component: React.ReactElement<IEquipmentDeskProps> = React.createElement(
      EquipmentDesk,
      {
        loans: this._loans,
        employees: this._employees,
        listUrl: `${this.context.pageContext.web.absoluteUrl}/Lists/EquipmentLoans`,
        theme: this._theme
      }
    );

    // One failing web part must not break the page: render errors end in a message.
    const element: React.ReactElement = React.createElement(
      ErrorBoundary, { source: 'VltavaEquipmentDesk', fallbackText: strings.RenderError }, component);

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
          groups: []
        }
      ]
    };
  }
}
