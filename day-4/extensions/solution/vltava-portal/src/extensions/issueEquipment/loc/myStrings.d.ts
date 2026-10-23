declare interface IIssueEquipmentCommandSetStrings {
  PromptEmail: string;
  Issued: string;
  IssueFailed: string;
}

declare module 'IssueEquipmentCommandSetStrings' {
  const strings: IIssueEquipmentCommandSetStrings;
  export = strings;
}
