import { log } from '@/util/logger';
import type { Sugar, SugarValue } from '.';
import { setDirty } from './dirty';
import { useRef } from 'react';

export function constant<T>(
  sugar: Sugar<T>,
  value: T,
): void {

  const mountedRef = useRef(false);
  const mountedSugar = sugar as Sugar<T> & { mounted: true };

  setDirty(sugar, sugar.template !== value);
  mountedSugar.get = (): SugarValue<T> => ({ success: true, value });
  mountedSugar.set = (): void => { log('WARN', 'Value of constant sugar conflicted by set method. Path: ${Sugar.path}'); };
  mountedSugar.setTemplate = (): void => {
    sugar.template = value;
    setDirty(sugar, sugar.template !== value);
  };

  if (!mountedRef.current && sugar.mounted) {
    log('WARN', `Sugar is already mounted, but refs are not initialized. Remounting... Path: ${sugar.path}`);
    mountedRef.current = false;
  }
  if (!mountedRef.current) {
    mountedSugar.mounted = true;
    mountedSugar.isDirty = false;
    mountedSugar.upstream.fire('mounted', {});
    mountedRef.current = true;
  }

}
