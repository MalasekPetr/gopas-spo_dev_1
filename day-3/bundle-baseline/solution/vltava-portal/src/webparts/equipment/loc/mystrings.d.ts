declare interface IEquipmentWebPartStrings {
  PropertyPaneDescription: string;
  Title: string;
  FilterLabel: string;
  FilterAll: string;
  StatusAvailable: string;
  StatusIssued: string;
  StatusRepair: string;
  StatusRetired: string;
  ColumnTitle: string;
  ColumnAssetTag: string;
  ColumnCategory: string;
  ColumnStatus: string;
  ColumnAssignedTo: string;
  AddButton: string;
  ReturnButton: string;
  AddPanelTitle: string;
  Save: string;
  Cancel: string;
  Close: string;
  Loading: string;
  ListMissing: string;
  SelectionColumnLabel: string;
  SelectRowLabel: string;
}

declare module 'EquipmentWebPartStrings' {
  const strings: IEquipmentWebPartStrings;
  export = strings;
}
