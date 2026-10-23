import * as React from 'react';
import {
  MessageBar,
  MessageBarType,
  Persona,
  PersonaPresence,
  PersonaSize,
  SearchBox,
  Spinner,
  ThemeProvider,
  type PartialTheme
} from '@fluentui/react';
import * as strings from 'EmployeeDirectoryWebPartStrings';
import styles from './EmployeeDirectory.module.scss';
import type { IEmployeeDirectoryProps } from './IEmployeeDirectoryProps';
import type { IEmployee } from '../../../models';
import { useDebounce } from '../../../hooks/useDebounce';
import { useEmployees } from '../../../hooks/useEmployees';

// Graph availability -> Fluent UI persona presence.
function toPersonaPresence(availability: string | undefined): PersonaPresence {
  switch (availability) {
    case 'Available':
    case 'AvailableIdle':
      return PersonaPresence.online;
    case 'Busy':
    case 'BusyIdle':
      return PersonaPresence.busy;
    case 'DoNotDisturb':
      return PersonaPresence.dnd;
    case 'Away':
    case 'BeRightBack':
      return PersonaPresence.away;
    case 'Offline':
      return PersonaPresence.offline;
    default:
      return PersonaPresence.none;
  }
}

export default function EmployeeDirectory(props: IEmployeeDirectoryProps): JSX.Element {
  const { service, showPresence, theme } = props;
  const [query, setQuery] = React.useState<string>('');
  // Wait until the user stops typing; every keystroke would be a Graph request.
  const debouncedQuery: string = useDebounce(query, 400);
  const { employees, presence, presenceAvailable, loading, error } = useEmployees(service, debouncedQuery);

  return (
    <ThemeProvider theme={theme as PartialTheme | undefined} className={styles.employeeDirectory}>
      <h2 className={styles.title}>{strings.Title}</h2>
      <SearchBox
        placeholder={strings.SearchPlaceholder}
        ariaLabel={strings.SearchPlaceholder}
        value={query}
        onChange={(_event, newValue) => setQuery(newValue || '')}
      />

      {showPresence && !presenceAvailable && (
        <MessageBar messageBarType={MessageBarType.info} className={styles.message}>
          {strings.PresenceNotAvailable}
        </MessageBar>
      )}

      {error && (
        <MessageBar messageBarType={MessageBarType.error} className={styles.message}>
          {strings.LoadError} {error}
        </MessageBar>
      )}

      {loading && <Spinner label={strings.Loading} className={styles.message} />}

      {!loading && !error && employees.length === 0 && <p>{strings.NoResults}</p>}

      <ul className={styles.list} aria-busy={loading}>
        {employees.map((employee: IEmployee) => (
          <li key={employee.id} className={styles.item}>
            <Persona
              text={employee.displayName}
              secondaryText={[employee.jobTitle, employee.department].filter(Boolean).join(' | ')}
              tertiaryText={employee.businessPhones[0] || employee.mail}
              size={PersonaSize.size48}
              presence={showPresence && presenceAvailable ? toPersonaPresence(presence[employee.id]) : PersonaPresence.none}
            />
          </li>
        ))}
      </ul>
    </ThemeProvider>
  );
}
