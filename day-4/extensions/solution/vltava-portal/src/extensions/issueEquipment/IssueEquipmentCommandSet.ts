import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  type Command,
  type IListViewCommandSetExecuteEventParameters,
  type ListViewStateChangedEventArgs,
  type RowAccessor
} from '@microsoft/sp-listview-extensibility';
import { Dialog } from '@microsoft/sp-dialog';

import * as strings from 'IssueEquipmentCommandSetStrings';
import { initSP } from '../../services/pnp';
import { createEquipmentService, EQUIPMENT_LIST_URL, type IEquipmentService } from '../../services/equipmentService';

export type IIssueEquipmentCommandSetProperties = Record<string, never>;

const LOG_SOURCE: string = 'IssueEquipmentCommandSet';
const ISSUE_COMMAND: string = 'ISSUE';

export default class IssueEquipmentCommandSet extends BaseListViewCommandSet<IIssueEquipmentCommandSetProperties> {

  private _service: IEquipmentService | undefined;

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized');
    this._service = createEquipmentService(initSP(this.context), this.context.pageContext.web.serverRelativeUrl);
    this._updateVisibility();
    this.context.listView.listViewStateChangedEvent.add(this, this._onListViewStateChanged);
    return Promise.resolve();
  }

  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    if (event.itemId !== ISSUE_COMMAND) {
      throw new Error('Unknown command');
    }
    const row: RowAccessor | undefined = this.context.listView.selectedRows?.[0];
    if (!row || !this._service) {
      return;
    }
    const id: number = Number(row.getValueByName('ID'));
    const title: string = String(row.getValueByName('Title'));
    this._issue(id, title).catch((e: unknown) => Log.error(LOG_SOURCE, e as Error));
  }

  private async _issue(id: number, title: string): Promise<void> {
    const email: string | undefined = await Dialog.prompt(strings.PromptEmail.replace('{0}', title));
    if (!email || !email.trim() || !this._service) {
      return;
    }
    try {
      await this._service.issue(id, email.trim());
      await Dialog.alert(strings.Issued.replace('{0}', title).replace('{1}', email.trim()));
      // The list view has no public refresh API; reload to show the new state.
      window.location.reload();
    } catch (e) {
      await Dialog.alert(`${strings.IssueFailed} ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  private _onListViewStateChanged = (args: ListViewStateChangedEventArgs): void => {
    this._updateVisibility();
    this.raiseOnChange();
  };

  // Visible only in the Equipment list, for exactly one item that is Available.
  private _updateVisibility(): void {
    const command: Command | undefined = this.tryGetCommand(ISSUE_COMMAND);
    if (!command) {
      return;
    }
    const listUrl: string = this.context.listView.list?.serverRelativeUrl || '';
    const isEquipmentList: boolean = listUrl.toLowerCase().endsWith(`/${EQUIPMENT_LIST_URL.toLowerCase()}`);
    const rows: readonly RowAccessor[] = this.context.listView.selectedRows || [];
    command.visible = isEquipmentList
      && rows.length === 1
      && rows[0].getValueByName('Status') === 'Available';
  }
}
