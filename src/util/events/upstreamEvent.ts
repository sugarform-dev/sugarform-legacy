import { SugarEventEmitter } from '../event';

export class SugarUpstreamEventEmitter extends SugarEventEmitter<{
  updateDirty: { isDirty: boolean },
  mounted: Record<string, never>,
}> {}
