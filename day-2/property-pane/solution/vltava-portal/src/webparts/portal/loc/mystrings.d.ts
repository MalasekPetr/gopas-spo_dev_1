declare interface IPortalWebPartStrings {
  PropertyPaneDescription: string;
  ContentGroupName: string;
  LibraryGroupName: string;
  DisplayGroupName: string;
  TitleFieldLabel: string;
  TitleTooLong: string;
  LinksFieldLabel: string;
  LinksFieldDescription: string;
  LinksFormatError: string;
  LinksUrlError: string;
  LibraryFieldLabel: string;
  NoLibraryOption: string;
  LibrariesLoadError: string;
  LibraryLinkTitle: string;
  ShowEnvironmentFieldLabel: string;
  PortalTitle: string;
  Greeting: string;
  AppLocalEnvironmentSharePoint: string;
  AppLocalEnvironmentTeams: string;
  AppLocalEnvironmentOffice: string;
  AppLocalEnvironmentOutlook: string;
  AppSharePointEnvironment: string;
  AppTeamsTabEnvironment: string;
  AppOfficeEnvironment: string;
  AppOutlookEnvironment: string;
  UnknownEnvironment: string;
}

declare module 'PortalWebPartStrings' {
  const strings: IPortalWebPartStrings;
  export = strings;
}
