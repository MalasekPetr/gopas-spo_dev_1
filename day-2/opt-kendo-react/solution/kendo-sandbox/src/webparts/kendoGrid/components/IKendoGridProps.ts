export interface IPageItem {
  Id: number;
  Title: string;
  FileLeafRef: string;
  Modified: Date;
}

export interface IKendoGridProps {
  loadPages: () => Promise<IPageItem[]>;
}
