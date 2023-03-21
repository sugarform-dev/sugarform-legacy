import { useId, useRef, useState } from 'react';
import type { SetTemplateMode, Sugar, SugarArrayNode, SugarArrayUser, SugarValue } from '.';
import { SugarFormError } from '../../util/error';
import { debug } from '../../util/logger';
import { createEmptySugar } from './create';
import { setDirty } from './dirty';

// eslint-disable-next-line max-lines-per-function
export function useArray<T>(
  sugar: Sugar<T[]>,
  options: SugarArrayUser<T>,
): SugarArrayNode<T> {

  const newId = useCountingId();
  const managedSugars = useRef<Array<{ id: string, sugar: Sugar<T> }>>([]);
  const defaultKeys: string[] = [];

  const getManagedSugar = (id: string, template: T = options.template): Sugar<T> => {
    const managed = managedSugars.current.find(s => s.id === id);
    if (managed === undefined) {
      const newSugar = createEmptySugar(sugar.path, template);
      managedSugars.current.push({ id, sugar: newSugar });
      return newSugar;
    }
    return managed.sugar;
  };

  const dirtyControl = ({ isDirty }: { isDirty: boolean }) : void => {
    if (!sugar.mounted) throw new SugarFormError('SF0021', `Path: ${sugar.path}}`);

    notDirtyCheck:
    if (!isDirty) {
      if (keys.length !== sugar.template.length) break notDirtyCheck;
      if (keys.some(i => {
        const managed = getManagedSugar(i);
        return managed.mounted && managed.isDirty;
      })) return;
    }
    setDirty(sugar, isDirty);
  };

  if (!sugar.mounted) {
    debug('DEBUG', `Mounting sugar. Path: ${sugar.path}`);
    const mountedSugar = sugar as Sugar<T[]> as Sugar<T[]> & { mounted: true };
    mountedSugar.mounted = true;
    mountedSugar.get = (): SugarValue<T[]> => {
      const values = keys.map(id => {
        const managed = getManagedSugar(id);
        if (!managed.mounted) {
          debug('WARN', `Sugar is not mounted when tried to get. Path: ${managed.path}`);
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
        managed.upstream.listenOnce('mounted', () => {
          ( managed as Sugar<T> & { mounted: true } ).set(v);
        });
        managed.upstream.listen('updateDirty', ({ isDirty }) => {
          if (!keys.includes(id)) return;
          dirtyControl({ isDirty });
        });
        return id;
      });
      setKeys(keys);
    };
    mountedSugar.setTemplate = (template: T[], mode: SetTemplateMode = 'merge'): void => {
      sugar.template = template;
      keys.forEach((id, i) => {
        const managed = getManagedSugar(id);
        if (!managed.mounted) {
          debug('WARN', `Sugar is not mounted when tried to set. Path: ${managed.path}`);
          return;
        }
        managed.setTemplate(template[i] ?? options.template, mode);
      });
    };

    mountedSugar.isDirty = false;
    mountedSugar.upstream.fire('mounted', {});
  }

  const [ keys, setKeys ] = useState<string[]>(defaultKeys);

  return {
    useKeys: () => [ keys, (keys: string[]):void => setKeys(keys) ],
    items: keys.map(id => ({ id, sugar: getManagedSugar(id) })),
  };
}

export function useCountingId(): () => string {
  const id = useId();
  const counter = useRef(0);
  return () => `${id}#${counter.current++}`;
}

