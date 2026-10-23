import type { IReadonlyTheme } from '@microsoft/sp-component-base';
import type { IPortalLink } from '../../../models';

export interface IPortalProps {
  title: string;
  links: IPortalLink[];
  libraryUrl: string;
  showSearch: boolean;
  environmentMessage: string;
  userDisplayName: string;
  theme: IReadonlyTheme | undefined;
}
