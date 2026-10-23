import type { IReadonlyTheme } from '@microsoft/sp-component-base';
import type { ILoanService } from '../../../services/loanService';
import type { IEmployeeService } from '../../../services/employeeService';

export interface IEquipmentDeskProps {
  loans: ILoanService;
  employees: IEmployeeService;
  listUrl: string;
  theme: IReadonlyTheme | undefined;
}
