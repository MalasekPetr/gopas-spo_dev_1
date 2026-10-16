import type { IReadonlyTheme } from '@microsoft/sp-component-base';
import type { IEmployeeService } from '../../../services/employeeService';

export interface IEmployeeDirectoryProps {
  service: IEmployeeService;
  showPresence: boolean;
  theme: IReadonlyTheme | undefined;
}
