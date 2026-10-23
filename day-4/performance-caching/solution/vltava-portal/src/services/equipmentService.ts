import type { SPFI } from '@pnp/sp';
import type { HttpRequestError } from '@pnp/queryable';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/batching';
import '@pnp/sp/site-users/web';
import type { EquipmentStatus, IEquipmentItem, INewEquipmentItem } from '../models';

// The list is addressed by URL, not by title: titles can be renamed or translated.
export const EQUIPMENT_LIST_URL: string = 'Lists/Equipment';

export class ListNotFoundError extends Error {
  public constructor() {
    super('Equipment list not found');
  }
}

export interface IEquipmentService {
  getAll(status?: EquipmentStatus): Promise<IEquipmentItem[]>;
  add(item: INewEquipmentItem): Promise<void>;
  setStatus(ids: number[], status: EquipmentStatus): Promise<void>;
  issue(id: number, email: string): Promise<void>;
}

function isHttpError(error: unknown): error is HttpRequestError {
  return !!error && (error as HttpRequestError).isHttpRequestError === true;
}

async function translateError<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (isHttpError(error) && error.status === 404) {
      throw new ListNotFoundError();
    }
    throw error;
  }
}

export function createEquipmentService(sp: SPFI, webServerRelativeUrl: string): IEquipmentService {
  const listUrl: string = `${webServerRelativeUrl.replace(/\/$/, '')}/${EQUIPMENT_LIST_URL}`;

  return {
    getAll(status?: EquipmentStatus): Promise<IEquipmentItem[]> {
      return translateError(async () => {
        let query = sp.web.getList(listUrl).items
          .select('Id', 'Title', 'AssetTag', 'Category', 'Status', 'AssignedTo/Title', 'AssignedTo/EMail')
          .expand('AssignedTo')
          .orderBy('Title', true)
          .top(500);
        if (status) {
          query = query.filter(`Status eq '${status}'`);
        }
        return await query<IEquipmentItem[]>();
      });
    },

    add(item: INewEquipmentItem): Promise<void> {
      return translateError(async () => {
        await sp.web.getList(listUrl).items.add({ ...item, Status: 'Available' });
      });
    },

    setStatus(ids: number[], status: EquipmentStatus): Promise<void> {
      return translateError(async () => {
        // One HTTP request for all updates instead of one per item.
        const [batchedSP, execute] = sp.batched();
        const list = batchedSP.web.getList(listUrl);
        const fields: Record<string, unknown> = status === 'Available'
          ? { Status: status, AssignedToId: null }
          : { Status: status };
        const updates: Promise<unknown>[] = ids.map(id => list.items.getById(id).update(fields));
        await execute();
        await Promise.all(updates);
      });
    },

    issue(id: number, email: string): Promise<void> {
      return translateError(async () => {
        // ensureUser adds the person to the site's user list if needed and returns its ID.
        const user = await sp.web.ensureUser(email);
        await sp.web.getList(listUrl).items.getById(id).update({ Status: 'Issued', AssignedToId: user.Id });
      });
    }
  };
}
