import * as React from 'react';
import {
  ChoiceGroup,
  DefaultButton,
  Dropdown,
  type IChoiceGroupOption,
  MessageBar,
  MessageBarType,
  Panel,
  PrimaryButton,
  SearchBox,
  Spinner,
  Stack
} from '@fluentui/react';
import * as strings from 'EquipmentDeskWebPartStrings';
import type { IEquipmentItem } from '../../../models';
import type { IEmployeeService } from '../../../services/employeeService';
import { useDebounce } from '../../../hooks/useDebounce';
import { useEmployees } from '../../../hooks/useEmployees';

export interface IIssuePanelProps {
  isOpen: boolean;
  available: IEquipmentItem[];
  /** Item chosen in the Stock tab, if any. */
  equipmentId: number | undefined;
  employees: IEmployeeService;
  onIssue: (equipmentId: number, email: string) => Promise<void>;
  onDismiss: () => void;
}

export default function IssuePanel(props: IIssuePanelProps): JSX.Element {
  const { isOpen, available, employees, onIssue, onDismiss } = props;
  const [equipmentId, setEquipmentId] = React.useState<number | undefined>(props.equipmentId);
  const [query, setQuery] = React.useState<string>('');
  const [email, setEmail] = React.useState<string | undefined>(undefined);
  const [busy, setBusy] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>(undefined);

  // Every opening starts clean, with the item preselected from the Stock tab.
  React.useEffect(() => {
    if (isOpen) {
      setEquipmentId(props.equipmentId);
      setQuery('');
      setEmail(undefined);
      setError(undefined);
    }
  }, [isOpen, props.equipmentId]);

  const debouncedQuery: string = useDebounce(query, 300);
  const found = useEmployees(employees, debouncedQuery);

  // Only people with a mailbox can be resolved by ensureUser.
  const people: IChoiceGroupOption[] = found.employees
    .filter(e => !!e.mail)
    .slice(0, 8)
    .map(e => ({ key: e.mail as string, text: e.department ? `${e.displayName} (${e.department})` : e.displayName }));

  const issue = (): void => {
    if (!equipmentId || !email) {
      return;
    }
    setBusy(true);
    setError(undefined);
    onIssue(equipmentId, email).then(
      () => {
        setBusy(false);
        onDismiss();
      },
      (e: unknown) => {
        setBusy(false);
        setError(e instanceof Error ? e.message : String(e));
      }
    );
  };

  return (
    <Panel
      isOpen={isOpen}
      headerText={strings.IssuePanelTitle}
      onDismiss={onDismiss}
      closeButtonAriaLabel={strings.Close}
      onRenderFooterContent={() => (
        <Stack horizontal tokens={{ childrenGap: 8 }}>
          <PrimaryButton text={strings.IssueButton} onClick={issue} disabled={busy || !equipmentId || !email} />
          <DefaultButton text={strings.Cancel} onClick={onDismiss} />
        </Stack>
      )}
      isFooterAtBottom={true}
    >
      <Stack tokens={{ childrenGap: 12 }}>
        <Dropdown
          label={strings.EquipmentLabel}
          required
          placeholder={strings.EquipmentPlaceholder}
          options={available.map(item => ({ key: item.Id, text: `${item.Title} (${item.AssetTag})` }))}
          selectedKey={equipmentId}
          onChange={(_event, option) => setEquipmentId(option ? Number(option.key) : undefined)}
        />
        <SearchBox
          placeholder={strings.PersonSearchPlaceholder}
          value={query}
          onChange={(_event, value) => setQuery(value || '')}
        />
        {found.loading ? (
          <Spinner label={strings.Searching} />
        ) : (
          <ChoiceGroup
            label={strings.PersonLabel}
            required
            options={people}
            selectedKey={email}
            onChange={(_event, option) => setEmail(option ? String(option.key) : undefined)}
          />
        )}
        {(error || found.error) && (
          <MessageBar messageBarType={MessageBarType.error}>{error || found.error}</MessageBar>
        )}
      </Stack>
    </Panel>
  );
}
