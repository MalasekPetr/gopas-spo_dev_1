import * as React from 'react';
import {
  DetailsList,
  DetailsListLayoutMode,
  DefaultButton,
  type IColumn,
  Link,
  MessageBar,
  MessageBarType,
  Pivot,
  PivotItem,
  PrimaryButton,
  SelectionMode,
  Spinner,
  ThemeProvider,
  type PartialTheme
} from '@fluentui/react';
import * as strings from 'EquipmentDeskWebPartStrings';
import styles from './EquipmentDesk.module.scss';
import type { IEquipmentDeskProps } from './IEquipmentDeskProps';
import IssuePanel from './IssuePanel';
import type { IEquipmentItem, ILoan } from '../../../models';
import { useLoans } from '../../../hooks/useLoans';
import { NotAvailableError } from '../../../services/loanService';

function formatDate(value: string | undefined): string {
  return value ? new Date(value).toLocaleDateString() : '';
}

function LoanBadge(props: { loan: ILoan }): JSX.Element {
  const isOpen: boolean = !props.loan.ReturnedOn;
  return (
    <span className={`${styles.badge} ${isOpen ? styles.open : styles.returned}`}>
      {isOpen ? strings.BadgeOpen : strings.BadgeReturned}
    </span>
  );
}

export default function EquipmentDesk(props: IEquipmentDeskProps): JSX.Element {
  const { loans, employees, listUrl, theme } = props;
  const { open, history, available, loading, error, listMissing, issue, giveBack } = useLoans(loans);
  const [panelOpen, setPanelOpen] = React.useState<boolean>(false);
  const [preselected, setPreselected] = React.useState<number | undefined>(undefined);
  const [actionError, setActionError] = React.useState<string | undefined>(undefined);
  const [busyId, setBusyId] = React.useState<number | undefined>(undefined);

  const openPanel = (equipmentId?: number): void => {
    setPreselected(equipmentId);
    setPanelOpen(true);
  };

  const onIssue = async (equipmentId: number, email: string): Promise<void> => {
    try {
      await issue(equipmentId, email);
    } catch (e) {
      // Translate the one business error; everything else is shown as it came.
      throw e instanceof NotAvailableError ? new Error(strings.NotAvailable) : e;
    }
  };

  const onReturn = (loan: ILoan): void => {
    setBusyId(loan.Id);
    setActionError(undefined);
    giveBack(loan).then(
      () => setBusyId(undefined),
      (e: unknown) => {
        setBusyId(undefined);
        setActionError(e instanceof Error ? e.message : String(e));
      }
    );
  };

  const loanColumns: IColumn[] = [
    {
      key: 'equipment', name: strings.ColumnEquipment, minWidth: 160, isResizable: true,
      // Read side of the lookup: the expanded object, not the stored ID.
      onRender: (loan: ILoan) => loan.Equipment ? loan.Equipment.Title : `#${loan.EquipmentId}`
    },
    {
      key: 'borrower', name: strings.ColumnBorrower, minWidth: 140, isResizable: true,
      onRender: (loan: ILoan) => loan.Borrower ? loan.Borrower.Title : ''
    },
    { key: 'issued', name: strings.ColumnIssuedOn, minWidth: 90, onRender: (loan: ILoan) => formatDate(loan.IssuedOn) }
  ];

  const openColumns: IColumn[] = [
    ...loanColumns,
    {
      key: 'action', name: '', minWidth: 100,
      onRender: (loan: ILoan) => (
        <DefaultButton
          text={strings.ReturnButton}
          iconProps={{ iconName: 'Undo' }}
          disabled={busyId !== undefined}
          onClick={() => onReturn(loan)}
        />
      )
    }
  ];

  const historyColumns: IColumn[] = [
    ...loanColumns,
    { key: 'returned', name: strings.ColumnReturnedOn, minWidth: 90, onRender: (loan: ILoan) => formatDate(loan.ReturnedOn) },
    { key: 'state', name: strings.ColumnState, minWidth: 90, onRender: (loan: ILoan) => <LoanBadge loan={loan} /> }
  ];

  const stockColumns: IColumn[] = [
    { key: 'title', name: strings.ColumnEquipment, fieldName: 'Title', minWidth: 160, isResizable: true },
    { key: 'tag', name: strings.ColumnAssetTag, fieldName: 'AssetTag', minWidth: 90 },
    { key: 'category', name: strings.ColumnCategory, fieldName: 'Category', minWidth: 90 },
    {
      key: 'action', name: '', minWidth: 100,
      onRender: (item: IEquipmentItem) => (
        <DefaultButton text={strings.IssueButton} iconProps={{ iconName: 'Handwriting' }} onClick={() => openPanel(item.Id)} />
      )
    }
  ];

  if (listMissing) {
    return (
      <MessageBar messageBarType={MessageBarType.warning}>
        {strings.ListMissing} <Link href={listUrl} target="_blank" rel="noreferrer">{listUrl}</Link>
      </MessageBar>
    );
  }

  const list = (items: unknown[], columns: IColumn[], key: string): JSX.Element => (
    <DetailsList
      items={items}
      columns={columns}
      selectionMode={SelectionMode.none}
      layoutMode={DetailsListLayoutMode.justified}
      setKey={key}
    />
  );

  return (
    <ThemeProvider theme={theme as PartialTheme | undefined} className={styles.desk}>
      <h2 className={styles.title}>{strings.Title}</h2>

      <PrimaryButton text={strings.NewIssueButton} iconProps={{ iconName: 'Add' }} onClick={() => openPanel()} />

      {(error || actionError) && (
        <MessageBar messageBarType={MessageBarType.error} className={styles.message}>
          {actionError || error}
        </MessageBar>
      )}

      {loading ? (
        <Spinner label={strings.Loading} className={styles.message} />
      ) : (
        <Pivot>
          <PivotItem headerText={strings.TabOpen} itemCount={open.length}>
            {open.length ? list(open, openColumns, 'open') : <p>{strings.EmptyOpen}</p>}
          </PivotItem>
          <PivotItem headerText={strings.TabStock} itemCount={available.length}>
            {available.length ? list(available, stockColumns, 'stock') : <p>{strings.EmptyStock}</p>}
          </PivotItem>
          <PivotItem headerText={strings.TabHistory}>
            {list(history, historyColumns, 'history')}
          </PivotItem>
        </Pivot>
      )}

      <IssuePanel
        isOpen={panelOpen}
        available={available}
        equipmentId={preselected}
        employees={employees}
        onIssue={onIssue}
        onDismiss={() => setPanelOpen(false)}
      />
    </ThemeProvider>
  );
}
