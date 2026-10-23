export type EquipmentStatus = 'Available' | 'Issued' | 'Repair' | 'Retired';

export const EQUIPMENT_STATUSES: EquipmentStatus[] = ['Available', 'Issued', 'Repair', 'Retired'];

export const EQUIPMENT_CATEGORIES: string[] = ['Laptop', 'Phone', 'Monitor', 'Accessory'];

export interface IEquipmentItem {
  Id: number;
  Title: string;
  AssetTag: string;
  Category: string;
  Status: EquipmentStatus;
  AssignedTo?: { Title: string; EMail: string };
}

export interface INewEquipmentItem {
  Title: string;
  AssetTag: string;
  Category: string;
}
