import { logInSugar } from '@/util/logger';
import type { Sugar, SugarValue } from '.';
import { resetDirty, setDirty } from './dirty';
import { useMountSugar } from '@/util/mount';

export function constant<T>(
  sugar: Sugar<T>,
  value: T,
): void {
  const mountedSugar = sugar as Sugar<T> & { mounted: true };
  setDirty(sugar, sugar.template !== value);
  useMountSugar({
    sugar,
    mountAction: () => {
      resetDirty(mountedSugar);
      mountedSugar.get = (): SugarValue<T> => ({ success: true, value });
      mountedSugar.set = (): void => { logInSugar('WARN', 'Value of constant sugar conflicted by set method.', sugar); };
      mountedSugar.setTemplate = (): void => {
        sugar.template = value;
        setDirty(sugar, sugar.template !== value);
      };
    },
  });

}
