import type { Sugar } from '.';

export function setDirty<T>(sugar: Sugar<T>, isDirty: boolean): void {
  sugar.asMounted(sugar => {
    if (sugar.isDirty === isDirty) return;
    sugar.isDirty = isDirty;
    sugar.upstream.fire('updateDirty', { isDirty });
  });
}
