import type { Sugar, SugarValue } from '.';
import { SugarFormError } from '../../util/error';
import { setDirty } from './dirty';

export function useSugarFromRef<T>(
  sugar: Sugar<T>, param: { get: () => SugarValue<T>, set: (value: T) => void },
): {
  onChange: () => void, onBlur: () => void
} {

  const refreshDirty = (): void => {
    if (!sugar.mounted) throw new SugarFormError('SF0021', `Path: ${sugar.path}}`);
    const value = sugar.get();
    setDirty(sugar, !value.success || sugar.template !== value.value);
  };

  const updateSugar = sugar as Sugar<T> & { mounted: true };
  updateSugar.mounted = true;
  updateSugar.get = param.get;
  updateSugar.set = (v): void => {
    param.set(v);
    refreshDirty();
  };
  updateSugar.setTemplate = (v): void => {
    sugar.template = v;
    refreshDirty();
  };
  updateSugar.isDirty = false;

  param.set(sugar.template);
  return {
    onChange: (): void => {
      if (!sugar.mounted) throw new SugarFormError('SF0021', `Path: ${sugar.path}}`);
      if (!sugar.isDirty) setDirty(sugar, true);
    },
    onBlur: () => refreshDirty(),
  };
}
