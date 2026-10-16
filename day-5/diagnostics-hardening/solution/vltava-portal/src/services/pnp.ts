import { spfi, SPFx, type SPFI } from '@pnp/sp';

// One shared PnPjs instance per page, created once from the SPFx context.
let instance: SPFI | undefined;

export function initSP(context: Parameters<typeof SPFx>[0]): SPFI {
  if (!instance) {
    instance = spfi().using(SPFx(context));
  }
  return instance;
}
