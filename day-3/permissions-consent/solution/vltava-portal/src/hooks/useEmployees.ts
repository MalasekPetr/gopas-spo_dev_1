import * as React from 'react';
import type { IEmployee, PresenceMap } from '../models';
import type { IEmployeeService } from '../services/employeeService';

export interface IUseEmployeesResult {
  employees: IEmployee[];
  presence: PresenceMap;
  /** false when presence could not be loaded (typically permission not granted). */
  presenceAvailable: boolean;
  loading: boolean;
  error: string | undefined;
}

export function useEmployees(service: IEmployeeService, query: string): IUseEmployeesResult {
  const [employees, setEmployees] = React.useState<IEmployee[]>([]);
  const [presence, setPresence] = React.useState<PresenceMap>({});
  const [presenceAvailable, setPresenceAvailable] = React.useState<boolean>(true);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    // Ignore responses of searches that were superseded by a newer query.
    let cancelled = false;
    setLoading(true);
    setError(undefined);

    const load = async (): Promise<void> => {
      try {
        const found: IEmployee[] = await service.search(query);
        if (cancelled) {
          return;
        }
        setEmployees(found);
        setLoading(false);
        try {
          const map: PresenceMap = await service.getPresence(found.map(e => e.id));
          if (!cancelled) {
            setPresence(map);
            setPresenceAvailable(true);
          }
        } catch {
          // Degrade gracefully: the directory works, presence is just not shown.
          if (!cancelled) {
            setPresenceAvailable(false);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setLoading(false);
        }
      }
    };
    load().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [service, query]);

  return { employees, presence, presenceAvailable, loading, error };
}
