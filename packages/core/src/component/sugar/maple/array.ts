import { useId, useRef, useState } from 'react';
import type { SetTemplateMode, Sugar, SugarArrayNode, SugarArrayUser, SugarValue } from '@component/sugar';
import { log } from '@util/logger';
import { createEmptySugar } from '@component/sugar/create';
import { setDirty } from '@component/sugar/dirty';
import { useMountSugar } from '@/util/mount';

// eslint-disable-next-line max-lines-per-function
export function mapleArray<T>(
  sugar: Sugar<T[]>,
  options: SugarArrayUser<T>,
): SugarArrayNode<T> {
  const newId = useCountingId();
  const keysRef = useRef<string[]>([]);

  const managedSugars = useRef<Array<{ id: string, sugar: Sugar<T> }>>([]);
  let defaultKeys: string[] = [];


  const getManagedSugar = (id: string, template: T = options.template): Sugar<T> => {
    const managed = managedSugars.current.find(s => s.id === id);
    if (managed === undefined) {
      const newSugar = createEmptySugar(sugar.path, template);
      managedSugars.current.push({ id, sugar: newSugar });
      newSugar.upstream.listen('updateDirty', ({ isDirty }) => {
        if (!keysRef.current.includes(id)) return;
        dirtyControl({ isDirty });
      });
      return newSugar;
    }
    return managed.sugar;
  };

  const dirtyControl = ({ isDirty }: { isDirty: boolean }) : void => {
    sugar.asMounted(sugar => {
      notDirtyCheck:
      if (!isDirty) {
        if (keysRef.current.length !== sugar.template.length) break notDirtyCheck;
        if (keysRef.current.some(i => {
          const managed = getManagedSugar(i);
          return managed.mounted && managed.isDirty;
        })) return;
      }
      setDirty(sugar, isDirty);
    });
  };

  useMountSugar({
    sugar,
    mountAction: () => {
      const mountedSugar = sugar as Sugar<T[]> & { mounted: true };
      mountedSugar.isDirty = false;
      defaultKeys = sugar.template.map(v => {
        const id = newId();
        getManagedSugar(id, v);
        return id;
      });
    },
  });


  const [ keys, setKeys ] = useState<string[]>(defaultKeys);
  keysRef.current = keys;

  const mountedSugar = sugar as Sugar<T[]> & { mounted: true };
  mountedSugar.get = (): SugarValue<T[]> => {
    const values = keys.map(id => {
      const managed = getManagedSugar(id);
      if (!managed.mounted) {
        log('WARN', `Sugar is not mounted when tried to get. Path: ${managed.path}`);
        return { success: false, value: null };
      }
      return managed.get();
    });

    return {
      success: values.every(v => v.success),
      value: values.map(v => v.value) as T[],
    };
  };
  mountedSugar.set = (value: T[]): void => {
    const keys = value.map((v, i) => {
      const id = newId();
      const managed = getManagedSugar(id, sugar.template[i] ?? options.template);
      managed.asMounted(s => {
        setTimeout(() => s.set(v));
      });
      return id;
    });
    setKeys(keys);
  };
  mountedSugar.setTemplate = (template: T[], mode: SetTemplateMode = 'merge'): void => {
    sugar.template = template;
    const keys = template.map(v => {
      const id = newId();
      getManagedSugar(id, mode === 'merge' ? { ...options.template, ...v } : v);
      return id;
    });
    setKeys(keys);
  };

  // refresh dirty for new items or removed items
  setDirty(
    sugar,
    ((): boolean => {
      if (keysRef.current.length !== sugar.template.length) return true;
      if (keysRef.current.some(i => {
        const managed = getManagedSugar(i);
        return managed.mounted && managed.isDirty;
      })) return true;
      return false;
    })(),
  );

  return {
    generateId: () => newId(),
    useKeys: () => [ keys, (keys: string[]):void => setKeys(keys) ],
    items: keys.map(id => ({ id, sugar: getManagedSugar(id) })),
  };
}

function useCountingId(): () => string {
  const id = useId();
  const counter = useRef(0);
  return () => `${id}#${counter.current++}`;
}

