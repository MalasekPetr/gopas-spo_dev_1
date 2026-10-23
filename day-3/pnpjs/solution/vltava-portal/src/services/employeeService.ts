import type { MSGraphClientV3 } from '@microsoft/sp-http';
import type { User } from '@microsoft/microsoft-graph-types';
import type { IEmployee, PresenceMap } from '../models';

// Only the fields the directory shows: smaller response, clearer permission story.
const SELECT_FIELDS: string = 'id,displayName,jobTitle,department,mail,businessPhones';
const PAGE_SIZE: number = 25;

export interface IEmployeeService {
  search(query: string): Promise<IEmployee[]>;
  getPresence(ids: string[]): Promise<PresenceMap>;
}

function toEmployee(user: User): IEmployee {
  return {
    id: user.id || '',
    displayName: user.displayName || '',
    jobTitle: user.jobTitle || undefined,
    department: user.department || undefined,
    mail: user.mail || undefined,
    businessPhones: user.businessPhones || []
  };
}

export function createEmployeeService(client: MSGraphClientV3): IEmployeeService {
  return {
    async search(query: string): Promise<IEmployee[]> {
      // $search and $count are "advanced queries": they need the ConsistencyLevel header.
      let request = client
        .api('/users')
        .header('ConsistencyLevel', 'eventual')
        .count(true)
        .select(SELECT_FIELDS)
        .orderby('displayName')
        .top(PAGE_SIZE);

      const needle: string = query.replace(/"/g, '').trim();
      if (needle) {
        request = request.search(`"displayName:${needle}"`);
      }

      const response: { value: User[] } = await request.get();
      return response.value.map(toEmployee);
    },

    async getPresence(ids: string[]): Promise<PresenceMap> {
      if (ids.length === 0) {
        return {};
      }
      // Needs the Presence.Read.All delegated permission; throws 403 when not granted.
      const response: { value: { id: string; availability: string }[] } = await client
        .api('/communications/getPresencesByUserId')
        .post({ ids });
      const presence: PresenceMap = {};
      response.value.forEach(item => {
        presence[item.id] = item.availability;
      });
      return presence;
    }
  };
}
