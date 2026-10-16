import * as React from 'react';
import type { EquipmentStatus, IEquipmentItem, INewEquipmentItem } from '../models';
import { ListNotFoundError, type IEquipmentService } from '../services/equipmentService';

export interface IUseEquipmentResult {
  items: IEquipmentItem[];
  loading: boolean;
  error: string | undefined;
  listMissing: boolean;
  add: (item: INewEquipmentItem) => Promise<void>;
  setStatus: (ids: number[], status: EquipmentStatus) => Promise<void>;
}

export function useEquipment(service: IEquipmentService, status: EquipmentStatus | undefined): IUseEquipmentResult {
  const [items, setItems] = React.useState<IEquipmentItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [listMissing, setListMissing] = React.useState<boolean>(false);
  const [version, setVersion] = React.useState<number>(0);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    service.getAll(status).then(
      found => {
        if (!cancelled) {
          setItems(found);
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
  }, [service, status, version]);

  const add = React.useCallback(async (item: INewEquipmentItem): Promise<void> => {
    await service.add(item);
    setVersion(v => v + 1);
  }, [service]);

  const setStatusFor = React.useCallback(async (ids: number[], newStatus: EquipmentStatus): Promise<void> => {
    await service.setStatus(ids, newStatus);
    setVersion(v => v + 1);
  }, [service]);

  return { items, loading, error, listMissing, add, setStatus: setStatusFor };
}
