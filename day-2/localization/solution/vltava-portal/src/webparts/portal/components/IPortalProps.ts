import type { IPortalLink } from '../../../models';

export interface IPortalProps {
  title: string;
  links: IPortalLink[];
  libraryUrl: string;
  environmentMessage: string;
  userDisplayName: string;
}
