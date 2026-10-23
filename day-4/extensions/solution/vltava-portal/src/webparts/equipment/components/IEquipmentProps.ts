import type { IReadonlyTheme } from '@microsoft/sp-component-base';
import type { IEquipmentService } from '../../../services/equipmentService';

export interface IEquipmentProps {
  service: IEquipmentService;
  listUrl: string;
  theme: IReadonlyTheme | undefined;
}
