import type { Sugar } from '@/component/sugar';
import { useId, useRef } from 'react';
import { logInSugar } from './logger';

interface MountConfig<T> {
  /** Sugar that should be mounted in the component */
  sugar: Sugar<T>,

  /**
   * function executed when the sugar needs to be mounted.
   * Remember that updating `mounted`, `dist` and firing `mounted` event is done by implicit.
   */
  mountAction: () => void,
}

interface MountConfigWithInit<T> extends MountConfig<T> {
  /** whether refs (hooks) are initialized or not */
  initialized: boolean,
}

/**
 * Mount the sugar to the component.
 * @param {MountConfigWithInit} config
 * @return {boolean} whether the sugar is mounted or not
 */
export const useMountSugarWithInit = <T>(
  { sugar, initialized, mountAction }: MountConfigWithInit<T>,
): boolean => {

  const id = useId();
  const debug = (message: string): void => logInSugar('DEBUG', message, sugar);
  const warn = (message: string): void => logInSugar('WARN', message, sugar);

  // When the component is already mounted and re-render occured.
  if (sugar.mounted && initialized) {
    if (sugar.dist === id) {
      debug('Mounting skipped because this is after the second time render and it is already mounted.');
      return false;
    } else {
      warn('Sugar is already attached to another component! Sugar may be mounted in multiple component.');
    }

  // When the Sugar is mounted, but component does not know it.
  } else if (sugar.mounted && !initialized) {
    if (sugar.dist === id) {
      // This should not happen in normal case, but it can happen under strict mode.
      // In strict mode, React may call render twice to detect side effects.
      // It resets the state of the component, but not the state of the Sugar.
      // So, we need to re-mount the Sugar and we should not display warning.
    } else {
      warn('Sugar is already attached to another component! Sugar may be mounted in multiple component.');
    }
  }

  sugar.mounted = true;
  (sugar as Sugar<T> & { mounted: true }).dist = id;
  sugar.upstream.fire('mounted', {});
  mountAction();
  return true;
};


/**
 * Mount the sugar to the component.
 * @param {MountConfig} config
 * @return {boolean} whether the sugar is mounted or not
 */
export const useMountSugar = <T>(
  { sugar, mountAction }: MountConfig<T>,
): boolean => {
  const mountedRef = useRef<boolean>(false);
  return useMountSugarWithInit({
    sugar,
    initialized: mountedRef.current,
    mountAction: (): void => {
      mountAction();
      mountedRef.current = true;
    },
  });
};

