import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import type { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'EquipmentWebPartStrings';
import Equipment from './components/Equipment';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import type { IEquipmentProps } from './components/IEquipmentProps';
import { initSP } from '../../services/pnp';
import { createEquipmentService, type IEquipmentService } from '../../services/equipmentService';

// No configurable properties: the list is fixed by URL (Lists/Equipment).
export type IEquipmentWebPartProps = Record<string, never>;

export default class EquipmentWebPart extends BaseClientSideWebPart<IEquipmentWebPartProps> {

  private _service: IEquipmentService | undefined;
  private _theme: IReadonlyTheme | undefined;

  protected async onInit(): Promise<void> {
    await super.onInit();
    this._service = createEquipmentService(initSP(this.context), this.context.pageContext.web.serverRelativeUrl);
  }

  public render(): void {
    if (!this._service) {
      return;
    }
    const component: React.ReactElement<IEquipmentProps> = React.createElement(
      Equipment,
      {
        service: this._service,
        listUrl: `${this.context.pageContext.web.absoluteUrl}/Lists/Equipment`,
        theme: this._theme
      }
    );

    // One failing web part must not break the page: render errors end in a message.
    const element: React.ReactElement = React.createElement(
      ErrorBoundary, { source: 'VltavaEquipment', fallbackText: strings.RenderError }, component);

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
