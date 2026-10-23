export interface IEmployee {
  id: string;
  displayName: string;
  jobTitle?: string;
  department?: string;
  mail?: string;
  businessPhones: string[];
}

/** Graph presence availability, e.g. Available, Busy, Away, Offline. */
export type PresenceMap = Record<string, string>;
