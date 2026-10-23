import * as React from 'react';
import type { IEquipmentItem, ILoan } from '../models';
import { ListNotFoundError } from '../services/equipmentService';
import type { ILoanService } from '../services/loanService';

export interface IUseLoansResult {
  open: ILoan[];
  history: ILoan[];
  available: IEquipmentItem[];
  loading: boolean;
  error: string | undefined;
  listMissing: boolean;
  issue: (equipmentId: number, email: string) => Promise<void>;
  giveBack: (loan: ILoan) => Promise<void>;
}

export function useLoans(service: ILoanService): IUseLoansResult {
  const [open, setOpen] = React.useState<ILoan[]>([]);
  const [history, setHistory] = React.useState<ILoan[]>([]);
  const [available, setAvailable] = React.useState<IEquipmentItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [listMissing, setListMissing] = React.useState<boolean>(false);
  const [version, setVersion] = React.useState<number>(0);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    // Three independent reads in parallel: all tabs stay consistent after every write.
    Promise.all([service.getOpen(), service.getHistory(), service.getAvailable()]).then(
      ([openLoans, allLoans, availableItems]) => {
        if (!cancelled) {
          setOpen(openLoans);
          setHistory(allLoans);
          setAvailable(availableItems);
          setListMissing(false);
          setLoading(false);
        }
      },
      (e: unknown) => {
        if (!cancelled) {
          setListMissing(e instanceof ListNotFoundError);
          setError(e instanceof Error ? e.message : String(e));
          setLoading(false);
        }
      }
    );
    return () => {
      cancelled = true;
    };
  }, [service, version]);

  const issue = React.useCallback(async (equipmentId: number, email: string): Promise<void> => {
    try {
      await service.issue(equipmentId, email);
    } finally {
      // Reload also after a failure: a half-done batch must be visible, not hidden.
      setVersion(v => v + 1);
    }
  }, [service]);

  const giveBack = React.useCallback(async (loan: ILoan): Promise<void> => {
    try {
      await service.giveBack(loan);
    } finally {
      setVersion(v => v + 1);
    }
  }, [service]);

  return { open, history, available, loading, error, listMissing, issue, giveBack };
}
