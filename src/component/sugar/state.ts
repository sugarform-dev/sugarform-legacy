import type { Dispatch, SetStateAction } from 'react';
import type { SugarValue } from '.';
import type { Sugar } from '../..';
import { isSugarObject } from '../../util/object';
import { setDirty } from './dirty';

export function useStateFollower<T>(
  sugar: Sugar<T>,
  state: T,
  setState: Dispatch<SetStateAction<T>>,
  comparator: (a: T, b: T) => boolean = (a, b): boolean => a === b,
): void {

  const fixedState = isSugarObject(state) ? { ...state } : state;
  const mountedSugar = sugar as Sugar<T> & { mounted: true };

  if (sugar.mounted) {
    const oldValue = sugar.get();
    if (oldValue.success && !comparator(fixedState, oldValue.value)) {
      setDirty(sugar, comparator(sugar.template, fixedState));
    }
  }

  mountedSugar.get = (): SugarValue<T> => ({ success: true, value: fixedState });
  mountedSugar.set = (value: T): void => setState(value);
  mountedSugar.setTemplate = (template: T): void => {
    sugar.template = template;
    setTimeout(() => setState(template), 0);
  };

  if (!sugar.mounted) {
    mountedSugar.mounted = true;
    mountedSugar.isDirty = false;
    mountedSugar.setTemplate(sugar.template);
    mountedSugar.upstream.fire('mounted', {});
  }

}
