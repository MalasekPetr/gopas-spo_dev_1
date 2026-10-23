declare interface IEmployeeDirectoryWebPartStrings {
  PropertyPaneDescription: string;
  DisplayGroupName: string;
  ShowPresenceFieldLabel: string;
  Title: string;
  SearchPlaceholder: string;
  Loading: string;
  LoadError: string;
  NoResults: string;
  PresenceNotAvailable: string;
}

declare module 'EmployeeDirectoryWebPartStrings' {
  const strings: IEmployeeDirectoryWebPartStrings;
  export = strings;
}
