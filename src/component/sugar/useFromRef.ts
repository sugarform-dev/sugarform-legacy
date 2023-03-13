import type { MutableRefObject } from 'react';
import { useRef } from 'react';
import type { Sugar, SugarValue } from '.';
import { SugarFormError } from '../../util/error';
import { setDirty } from './dirty';

export function useSugarFromRef<T>(
  sugar: Sugar<T>, param: { get: () => SugarValue<T> | undefined, set: (value: T) => boolean },
): {
  onChange: () => void, onBlur: () => void, defaultValueRef: MutableRefObject<T | undefined>,
} {

  const refreshDirty = (): void => {
    if (!sugar.mounted) throw new SugarFormError('SF0021', `Path: ${sugar.path}}`);
    const value = sugar.get();
    const dirty = !value.success || sugar.template !== value.value;
    console.log({ path: sugar.path, template: sugar.template, value: value.success ? value.value : 'failed', dirty });
    setDirty(sugar, dirty);
  };

  const defaultValue = useRef<T | undefined>(undefined);

  const setterWithDefault = (v: T): void => {
    if (!param.set(v)) {
      defaultValue.current = v;
    }
  };

  const updateSugar = sugar as Sugar<T> & { mounted: true };
  updateSugar.mounted = true;
  updateSugar.get = (): SugarValue<T> =>
    param.get() ?? { success: true, value: defaultValue.current ?? sugar.template };
  updateSugar.set = (v): void => {
    setterWithDefault(v);
    setTimeout(() => refreshDirty(), 0);
  };
  updateSugar.setTemplate = (v): void => {
    sugar.template = v;
    updateSugar.set(v);
  };
  updateSugar.isDirty = false;

  return {
    onChange: (): void => {
      if (!sugar.mounted) throw new SugarFormError('SF0021', `Path: ${sugar.path}`);
      if (!sugar.isDirty) setDirty(sugar, true);
    },
    onBlur: refreshDirty,
    defaultValueRef: defaultValue,
  };
}
