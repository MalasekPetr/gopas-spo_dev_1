import type { SPFI } from '@pnp/sp';
import type { HttpRequestError } from '@pnp/queryable';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/batching';
import '@pnp/sp/site-users/web';
import type { IEquipmentItem, ILoan } from '../models';
import { EQUIPMENT_LIST_URL, ListNotFoundError } from './equipmentService';

export const LOANS_LIST_URL: string = 'Lists/EquipmentLoans';

const LOAN_FIELDS: string[] = [
  'Id', 'EquipmentId', 'Equipment/Title', 'Borrower/Title', 'Borrower/EMail', 'IssuedOn', 'ReturnedOn'
];

export class NotAvailableError extends Error {
  public constructor(title: string) {
    super(`${title} is not available`);
  }
}

export interface ILoanService {
  getOpen(): Promise<ILoan[]>;
  getHistory(): Promise<ILoan[]>;
  getAvailable(): Promise<IEquipmentItem[]>;
  issue(equipmentId: number, email: string): Promise<void>;
  giveBack(loan: ILoan): Promise<void>;
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

export function createLoanService(sp: SPFI, webServerRelativeUrl: string): ILoanService {
  const web: string = webServerRelativeUrl.replace(/\/$/, '');
  const loansUrl: string = `${web}/${LOANS_LIST_URL}`;
  const equipmentUrl: string = `${web}/${EQUIPMENT_LIST_URL}`;

  const loans = (): ReturnType<typeof sp.web.getList> => sp.web.getList(loansUrl);

  return {
    getOpen(): Promise<ILoan[]> {
      return translateError(() => loans().items
        .select(...LOAN_FIELDS)
        .expand('Equipment', 'Borrower')
        .filter('ReturnedOn eq null')
        .orderBy('IssuedOn', false)
        .top(500)<ILoan[]>());
    },

    getHistory(): Promise<ILoan[]> {
      return translateError(() => loans().items
        .select(...LOAN_FIELDS)
        .expand('Equipment', 'Borrower')
        .orderBy('IssuedOn', false)
        .top(100)<ILoan[]>());
    },

    getAvailable(): Promise<IEquipmentItem[]> {
      return translateError(() => sp.web.getList(equipmentUrl).items
        .select('Id', 'Title', 'AssetTag', 'Category', 'Status')
        .filter("Status eq 'Available'")
        .orderBy('Title', true)
        .top(500)<IEquipmentItem[]>());
    },

    issue(equipmentId: number, email: string): Promise<void> {
      return translateError(async () => {
        // Read the current state first: the list may have changed since the page loaded.
        const item: IEquipmentItem = await sp.web.getList(equipmentUrl).items.getById(equipmentId)
          .select('Id', 'Title', 'Status')<IEquipmentItem>();
        if (item.Status !== 'Available') {
          throw new NotAvailableError(item.Title);
        }
        const user = await sp.web.ensureUser(email);

        // One HTTP request, but NOT a transaction: each write succeeds or fails on its own.
        const [batchedSP, execute] = sp.batched();
        const writes: Promise<unknown>[] = [
          batchedSP.web.getList(loansUrl).items.add({
            Title: item.Title,
            EquipmentId: equipmentId,
            BorrowerId: user.Id,
            IssuedOn: new Date().toISOString()
          }),
          batchedSP.web.getList(equipmentUrl).items.getById(equipmentId)
            .update({ Status: 'Issued', AssignedToId: user.Id })
        ];
        await execute();
        await Promise.all(writes);
      });
    },

    giveBack(loan: ILoan): Promise<void> {
      return translateError(async () => {
        const [batchedSP, execute] = sp.batched();
        const writes: Promise<unknown>[] = [
          batchedSP.web.getList(loansUrl).items.getById(loan.Id)
            .update({ ReturnedOn: new Date().toISOString() }),
          batchedSP.web.getList(equipmentUrl).items.getById(loan.EquipmentId)
            .update({ Status: 'Available', AssignedToId: null })
        ];
        await execute();
        await Promise.all(writes);
      });
    }
  };
}
