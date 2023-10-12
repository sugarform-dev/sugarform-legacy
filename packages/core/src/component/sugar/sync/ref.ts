import type { MutableRefObject } from 'react';
import { useRef } from 'react';
import type { Sugar, SugarValue } from '..';
import { resetDirty, setDirty } from '@component/sugar/dirty';
import { useMountSugar } from '@/util/mount';

export function syncRef<T>(
  sugar: Sugar<T>, param: { get: () => SugarValue<T> | undefined, set: (value: T) => boolean },
): {
  onChange: () => void, onBlur: () => void, defaultValueRef: MutableRefObject<T | undefined>,
} {
  const defaultValue = useRef<T | undefined>(undefined);

  const refreshDirty = (): void => {
    sugar.asMounted(sugar => {
      const value = sugar.get();
      const dirty = !value.success || sugar.template !== value.value;
      setDirty(sugar, dirty);
    });
  };

  const setterWithDefault = (v: T): void => {
    if (!param.set(v)) {
      defaultValue.current = v;
    }
  };

  useMountSugar({
    sugar,
    mountAction: () => {
      const updateSugar = sugar as Sugar<T> & { mounted: true };
      updateSugar.get = (): SugarValue<T> =>
        param.get() ?? { success: true, value: defaultValue.current ?? sugar.template };
      updateSugar.set = (v): void => {
        setterWithDefault(v);
        refreshDirty();
      };
      updateSugar.setTemplate = (v): void => {
        sugar.template = v;
        setterWithDefault(v);
        setTimeout(refreshDirty, 0);
      };
      resetDirty(updateSugar);
      updateSugar.setTemplate(sugar.template);
    },
  });

  return {
    onChange: (): void => {
      sugar.asMounted(sugar => {
        if (!sugar.isDirty) setDirty(sugar, true);
      });
    },
    onBlur: refreshDirty,
    defaultValueRef: defaultValue,
  };
}
