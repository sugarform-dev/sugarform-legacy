import type { Dispatch, SetStateAction } from 'react';
import { useEffect , useId, useRef, useState } from 'react';
import type { SetTemplateMode, Sugar, SugarArrayNode, SugarArrayUser, SugarValue } from '@component/sugar';
import { logInSugar } from '@util/logger';
import { createEmptySugar } from '@component/sugar/create';
import { resetDirty, setDirty } from '@component/sugar/dirty';
import { useMountSugar } from '@/util/mount';
import { merge } from '@/util/object';

// eslint-disable-next-line max-lines-per-function
export function mapleArray<T>(
  sugar: Sugar<T[]>,
  options: SugarArrayUser<T>,
): SugarArrayNode<T> {
  const newId = useCountingId();
  const keysRef = useRef<string[]>([]);
  const setKeysRef = useRef<Dispatch<SetStateAction<string[]>>| null>(null);

  const managedSugars = useRef<Array<{ id: string, sugar: Sugar<T> }>>([]);


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
      resetDirty(mountedSugar);
      mountedSugar.get = (): SugarValue<T[]> => {
        const values = keysRef.current.map(id => {
          const managed = getManagedSugar(id);
          if (!managed.mounted) {
            logInSugar('WARN', 'Sugar is not mounted when tried to get.', managed);
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
          getManagedSugar(id, merge(v, options.template, mode));
          return id;
        });
        setKeysRef.current?.(keys);
      };
    },
  });


  const [ keys, setKeys ] = useState<string[]>( sugar.template.map(v => {
    const id = newId();
    getManagedSugar(id, v);
    return id;
  }));
  keysRef.current = keys;
  setKeysRef.current = setKeys;


  // refresh dirty for new items or removed items
  const isDirty = ((): boolean => {
    if (keysRef.current.length !== sugar.template.length) return true;
    if (keysRef.current.some(i => {
      const managed = getManagedSugar(i);
      return managed.mounted && managed.isDirty;
    })) return true;
    return false;
  })();
  useEffect(() => {
    setDirty(sugar, isDirty);
  }, [ isDirty ]);

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

