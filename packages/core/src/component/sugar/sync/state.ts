import type { Dispatch, SetStateAction } from 'react';
import { useRef } from 'react';
import type { SugarValue , Sugar } from '@component/sugar';
import { log } from '@util/logger';
import { isSugarObject } from '@util/object';
import { setDirty } from '@component/sugar/dirty';

export function syncState<T>(
  sugar: Sugar<T>,
  state: T,
  setState: Dispatch<SetStateAction<T>>,
  comparator: (a: T, b: T) => boolean = (a, b): boolean => a === b,
): void {

  const mountedRef = useRef(false);
  const fixedState = isSugarObject(state) ? { ...state } : state;
  const mountedSugar = sugar as Sugar<T> & { mounted: true };

  if (mountedRef.current && sugar.mounted) {
    setDirty(sugar, !comparator(sugar.template, fixedState));
  }

  mountedSugar.get = (): SugarValue<T> => ({ success: true, value: fixedState });
  mountedSugar.set = (value: T): void => setState(value);
  mountedSugar.setTemplate = (template: T): void => {
    sugar.template = template;
    setState(template);
  };

  if (!mountedRef.current && sugar.mounted) {
    log('WARN', `Sugar is already mounted, but refs are not initialized. Remounting... Path: ${sugar.path}`);
    mountedRef.current = false;
  }
  if (!mountedRef.current) {
    mountedSugar.mounted = true;
    mountedSugar.isDirty = false;
    mountedSugar.setTemplate(sugar.template);
    mountedSugar.upstream.fire('mounted', {});
    mountedRef.current = true;
  }

}
