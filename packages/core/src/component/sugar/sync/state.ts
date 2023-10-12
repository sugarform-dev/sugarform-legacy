import type { Dispatch, SetStateAction } from 'react';
import { useEffect } from 'react';
import type { SugarValue , Sugar } from '@component/sugar';
import { isSugarObject } from '@util/object';
import { resetDirty, setDirty } from '@component/sugar/dirty';
import { useMountSugar } from '@/util/mount';
import { logInSugar } from '@/util/logger';

export function syncState<T>(
  sugar: Sugar<T>,
  state: T,
  setState: Dispatch<SetStateAction<T>>,
  comparator: (a: T, b: T) => boolean = (a, b): boolean => a === b,
): void {

  const fixedState = isSugarObject(state) ? { ...state } : state;

  useMountSugar({
    sugar,
    mountAction: () => {
      const mountedSugar = sugar as Sugar<T> & { mounted: true };
      resetDirty(mountedSugar);
      mountedSugar.set = (value: T): void => setState(value);
      mountedSugar.setTemplate = (template: T): void => {
        sugar.template = template;
        setState(template);
      };
      mountedSugar.setTemplate(sugar.template);
    },
  });

  useEffect(() => {
    sugar.asMounted(mountedSugar => {
      mountedSugar.get = (): SugarValue<T> => ({ success: true, value: fixedState });
    });
  }, [ fixedState ]);

  const isDirty = !comparator(sugar.template, fixedState);
  useEffect(() => {
    logInSugar('DEBUG', JSON.stringify({ isDirty }), sugar);
    setDirty(sugar, isDirty);
  }, [ isDirty ]);
}
