import type { Dispatch, SetStateAction } from 'react';
import type { SugarValue , Sugar } from '@component/sugar';
import { isSugarObject } from '@util/object';
import { setDirty } from '@component/sugar/dirty';
import { useMountSugar } from '@/util/mount';

export function syncState<T>(
  sugar: Sugar<T>,
  state: T,
  setState: Dispatch<SetStateAction<T>>,
  comparator: (a: T, b: T) => boolean = (a, b): boolean => a === b,
): void {

  const fixedState = isSugarObject(state) ? { ...state } : state;
  const mountedSugar = sugar as Sugar<T> & { mounted: true };

  mountedSugar.get = (): SugarValue<T> => ({ success: true, value: fixedState });
  mountedSugar.set = (value: T): void => setState(value);
  mountedSugar.setTemplate = (template: T): void => {
    sugar.template = template;
    setState(template);
  };

  useMountSugar({
    sugar,
    mountAction: () => {
      mountedSugar.isDirty = false;
      mountedSugar.setTemplate(sugar.template);
    },
  });

  setDirty(sugar, !comparator(sugar.template, fixedState));
}
