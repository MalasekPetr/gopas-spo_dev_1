declare interface IEquipmentDeskWebPartStrings {
  RenderError: string;
  PropertyPaneDescription: string;
  Title: string;
  NewIssueButton: string;
  IssueButton: string;
  ReturnButton: string;
  TabOpen: string;
  TabStock: string;
  TabHistory: string;
  ColumnEquipment: string;
  ColumnAssetTag: string;
  ColumnCategory: string;
  ColumnBorrower: string;
  ColumnIssuedOn: string;
  ColumnReturnedOn: string;
  ColumnState: string;
  BadgeOpen: string;
  BadgeReturned: string;
  EmptyOpen: string;
  EmptyStock: string;
  IssuePanelTitle: string;
  EquipmentLabel: string;
  EquipmentPlaceholder: string;
  PersonLabel: string;
  PersonSearchPlaceholder: string;
  Searching: string;
  NotAvailable: string;
  Cancel: string;
  Close: string;
  Loading: string;
  ListMissing: string;
}

declare module 'EquipmentDeskWebPartStrings' {
  const strings: IEquipmentDeskWebPartStrings;
  export = strings;
}
