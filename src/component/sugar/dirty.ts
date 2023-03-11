import type { Sugar } from '.';
import { debug } from '../../util/logger';

export function setDirty<T>(sugar: Sugar<T>, isDirty: boolean): void {
  if (!sugar.mounted) {
    debug('WARN', `Sugar is not mounted when tried to set dirty. Path: ${sugar.path}`);
    return;
  }
  if (sugar.isDirty === isDirty) return;
  sugar.isDirty = isDirty;
  sugar.upstream.fire('updateDirty', { isDirty });
}
