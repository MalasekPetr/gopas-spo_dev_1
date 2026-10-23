import * as React from 'react';
import {
  DefaultButton,
  DetailsList,
  DetailsListLayoutMode,
  Dropdown,
  type IColumn,
  type IDropdownOption,
  Link,
  MessageBar,
  MessageBarType,
  Panel,
  PrimaryButton,
  Selection,
  Spinner,
  Stack,
  TextField,
  ThemeProvider,
  type PartialTheme
} from '@fluentui/react';
import * as strings from 'EquipmentWebPartStrings';
import styles from './Equipment.module.scss';
import type { IEquipmentProps } from './IEquipmentProps';
import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_STATUSES,
  type EquipmentStatus,
  type IEquipmentItem,
  type INewEquipmentItem
} from '../../../models';
import { useEquipment } from '../../../hooks/useEquipment';

// Stored values are English (list data); labels are localized.
const STATUS_LABELS: Record<EquipmentStatus, string> = {
  Available: strings.StatusAvailable,
  Issued: strings.StatusIssued,
  Repair: strings.StatusRepair,
  Retired: strings.StatusRetired
};

const ALL: string = 'all';

const EMPTY_ITEM: INewEquipmentItem = { Title: '', AssetTag: '', Category: EQUIPMENT_CATEGORIES[0] };

export default function Equipment(props: IEquipmentProps): JSX.Element {
  const { service, listUrl, theme } = props;
  const [statusFilter, setStatusFilter] = React.useState<string>(ALL);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [panelOpen, setPanelOpen] = React.useState<boolean>(false);
  const [draft, setDraft] = React.useState<INewEquipmentItem>(EMPTY_ITEM);
  const [actionError, setActionError] = React.useState<string | undefined>(undefined);
  const [busy, setBusy] = React.useState<boolean>(false);

  const status: EquipmentStatus | undefined = statusFilter === ALL ? undefined : statusFilter as EquipmentStatus;
  const { items, loading, error, listMissing, add, setStatus } = useEquipment(service, status);

  const selection: Selection = React.useMemo(() => new Selection({
    onSelectionChanged: () => setSelectedIds(selection.getSelection().map(item => (item as IEquipmentItem).Id))
  }), []);

  const filterOptions: IDropdownOption[] = [
    { key: ALL, text: strings.FilterAll },
    ...EQUIPMENT_STATUSES.map(s => ({ key: s, text: STATUS_LABELS[s] }))
  ];

  const columns: IColumn[] = [
    { key: 'title', name: strings.ColumnTitle, fieldName: 'Title', minWidth: 140, isResizable: true },
    { key: 'tag', name: strings.ColumnAssetTag, fieldName: 'AssetTag', minWidth: 90 },
    { key: 'category', name: strings.ColumnCategory, fieldName: 'Category', minWidth: 90 },
    {
      key: 'status', name: strings.ColumnStatus, minWidth: 90,
      onRender: (item: IEquipmentItem) => STATUS_LABELS[item.Status] || item.Status
    },
    {
      key: 'assigned', name: strings.ColumnAssignedTo, minWidth: 140,
      onRender: (item: IEquipmentItem) => item.AssignedTo ? item.AssignedTo.Title : ''
    }
  ];

  const run = async (action: () => Promise<void>): Promise<void> => {
    setBusy(true);
    setActionError(undefined);
    try {
      await action();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const saveDraft = (): void => {
    run(async () => {
      await add(draft);
      setDraft(EMPTY_ITEM);
      setPanelOpen(false);
    }).catch(() => undefined);
  };

  const returnSelected = (): void => {
    run(() => setStatus(selectedIds, 'Available')).catch(() => undefined);
  };

  if (listMissing) {
    return (
      <MessageBar messageBarType={MessageBarType.warning}>
        {strings.ListMissing} <Link href={listUrl} target="_blank" rel="noreferrer">{listUrl}</Link>
      </MessageBar>
    );
  }

  return (
    <ThemeProvider theme={theme as PartialTheme | undefined} className={styles.equipment}>
      <h2 className={styles.title}>{strings.Title}</h2>

      <Stack horizontal wrap tokens={{ childrenGap: 8 }} verticalAlign="end">
        <Dropdown
          label={strings.FilterLabel}
          options={filterOptions}
          selectedKey={statusFilter}
          onChange={(_event, option) => setStatusFilter(option ? String(option.key) : ALL)}
          className={styles.filter}
        />
        <PrimaryButton text={strings.AddButton} iconProps={{ iconName: 'Add' }} onClick={() => setPanelOpen(true)} />
        <DefaultButton
          text={strings.ReturnButton.replace('{0}', selectedIds.length.toString())}
          iconProps={{ iconName: 'Undo' }}
          disabled={selectedIds.length === 0 || busy}
          onClick={returnSelected}
        />
      </Stack>

      {(error || actionError) && (
        <MessageBar messageBarType={MessageBarType.error} className={styles.message}>
          {actionError || error}
        </MessageBar>
      )}

      {loading ? (
        <Spinner label={strings.Loading} className={styles.message} />
      ) : (
        <DetailsList
          items={items}
          columns={columns}
          selection={selection}
          layoutMode={DetailsListLayoutMode.justified}
          ariaLabelForSelectionColumn={strings.SelectionColumnLabel}
          checkButtonAriaLabel={strings.SelectRowLabel}
          setKey="equipment"
        />
      )}

      <Panel
        isOpen={panelOpen}
        headerText={strings.AddPanelTitle}
        onDismiss={() => setPanelOpen(false)}
        closeButtonAriaLabel={strings.Close}
        onRenderFooterContent={() => (
          <Stack horizontal tokens={{ childrenGap: 8 }}>
            <PrimaryButton text={strings.Save} onClick={saveDraft} disabled={busy || !draft.Title.trim() || !draft.AssetTag.trim()} />
            <DefaultButton text={strings.Cancel} onClick={() => setPanelOpen(false)} />
          </Stack>
        )}
        isFooterAtBottom={true}
      >
        <TextField
          label={strings.ColumnTitle}
          required
          value={draft.Title}
          onChange={(_event, value) => setDraft({ ...draft, Title: value || '' })}
        />
        <TextField
          label={strings.ColumnAssetTag}
          required
          value={draft.AssetTag}
          onChange={(_event, value) => setDraft({ ...draft, AssetTag: value || '' })}
        />
        <Dropdown
          label={strings.ColumnCategory}
          options={EQUIPMENT_CATEGORIES.map(c => ({ key: c, text: c }))}
          selectedKey={draft.Category}
          onChange={(_event, option) => setDraft({ ...draft, Category: option ? String(option.key) : EQUIPMENT_CATEGORIES[0] })}
        />
      </Panel>
    </ThemeProvider>
  );
}
