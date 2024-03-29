import type { MutableRefObject } from 'react';
import { useRef } from 'react';
import type { Sugar, SugarUserReshaper, SugarObjectNode, SugarValue, SetTemplateMode } from '..';
import { SugarFormAssertionError, SugarFormUnmountedSugarError } from '@util/error';
import { log, logInSugar } from '@util/logger';
import type { BetterObjectConstructor, SugarObject } from '@util/object';
import { merge } from '@util/object';
import { createEmptySugar } from '@component/sugar/create';
import { resetDirty, setDirty } from '@component/sugar/dirty';
import { useMountSugarWithInit } from '@/util/mount';

declare const Object: BetterObjectConstructor;

export function mapleSugar<T, U extends SugarObject>(
  sugar: Sugar<T>,
  options: SugarUserReshaper<T, U>,
): SugarObjectNode<U> {

  const madeSugarRef = useRef<MadeSugar<U>>();

  useMountSugarWithInit({
    sugar,
    initialized: madeSugarRef.current !== undefined,
    mountAction: () => {
      if (madeSugarRef.current === undefined) throw new SugarFormAssertionError(sugar.path, 'imperfect initialization of fields in mapleSugar.');
      madeSugarRef.current.mountAction();
    },
  });


  madeSugarRef.current ??= madeSugar(sugar, options, madeSugarRef);

  return {
    fields: madeSugarRef.current.fields,
  };
}

interface MadeSugar<U extends SugarObject> {
  fields: SugarObjectNode<U>['fields'],
  mountAction: () => void,
}

// eslint-disable-next-line max-lines-per-function
export function madeSugar<T, U extends SugarObject>(
  sugar: Sugar<T>,
  options: SugarUserReshaper<T, U>,
  ref: MutableRefObject<MadeSugar<U> | undefined>,
): MadeSugar<U>  {
  const template = options.reshape.deform(sugar.template);
  log('DEBUG', `Template: ${JSON.stringify(template)}`);

  const fields = wrapSugar(sugar.path, template);

  const getter = (): SugarValue<T> => {
    const fields = ref.current?.fields;
    if (fields === undefined) throw new SugarFormUnmountedSugarError(sugar.path);
    const value = get<U>(fields);
    logInSugar('DEBUG', `Getting Value of Sugar: ${JSON.stringify(value)}`, sugar);
    if (!value.success) return value;
    const u: U = value.value;
    const validators: Array<{ condition: (value: U) => boolean }> =
      'validation' in options ? options.validation ?? [] : [];
    if (
      validators.some(({ condition }) => !condition(u))
    ) {
      return {
        success: false,
        value: value.value,
      };
    }
    return {
      success: true,
      value: options.reshape.transform(u),
    };
  };

  const setter = (value: T): void => {
    logInSugar('DEBUG', 'Setting value of sugar.', sugar);
    const fields = ref.current?.fields;
    if (fields === undefined) throw new SugarFormUnmountedSugarError(sugar.path);
    set<U>(fields, options.reshape.deform(value), { type: 'value' });
  };

  const dirtyControl = ({ isDirty }: { isDirty: boolean }) : void => {
    const fields = ref.current?.fields;
    if (!sugar.mounted || fields === undefined) throw new SugarFormUnmountedSugarError(sugar.path);
    if (!isDirty && Object.values(fields).some(s => s.mounted && s.isDirty)) return;
    setDirty(sugar, isDirty);
  };

  return {
    fields,
    mountAction: (): void => {
      Object.values(fields).forEach(sugar => sugar.upstream.listen('updateDirty', dirtyControl));

      const updateSugar = sugar as Sugar<T> & { mounted: true };
      updateSugar.get = getter;
      updateSugar.set = setter;
      updateSugar.setTemplate = (template: T, mode: SetTemplateMode = 'merge'): void => {
        const newTemplate = merge(
          options.reshape.deform(template),
          options.reshape.deform(sugar.template),
          mode,
        );
        sugar.template = mode === 'replace' ? template : options.reshape.transform(newTemplate);
        set<U>(fields, newTemplate, { type: 'template', mode });
      };
      resetDirty(updateSugar);
    },
  };
}


function wrapSugar<T extends SugarObject>(path: string, template: T): SugarObjectNode<T>['fields'] {
  const fields: SugarObjectNode<T>['fields'] = {} as SugarObjectNode<T>['fields'];

  for (const key in template) {
    fields[key] = createEmptySugar(`${path}.${key}`, template[key]);
  }

  return fields;
}

function get<T extends SugarObject>(fields: SugarObjectNode<T>['fields']): SugarValue<T> {
  const result = {} as { [P in keyof T]: unknown };
  let success = true;

  for (const key in fields) {
    const sugar = fields[key];
    if (!sugar.mounted) {
      logInSugar('WARN', 'Sugar is not mounted when tried to get.', sugar);
      result[key] = null;
      success = false;
    } else {
      const value = sugar.get();
      result[key] = value.value;
      success &&= value.success;
    }
  }

  return success ? {
    success,
    value: result as T,
  } : {
    success,
    value: result,
  };
}

function set<T extends SugarObject>(
  fields: SugarObjectNode<T>['fields'],
  value: T,
  type: {
    type: 'value'
  } | {
    type: 'template',
    mode: SetTemplateMode
  },
): void {
  for (const key in fields) {
    const sugar = fields[key];
    if (!sugar.mounted) {
      logInSugar('WARN', 'Sugar is not mounted when tried to set.', sugar);
      continue;
    }
    if (type.type === 'value') {
      sugar.set(value[key]);
    } else {
      sugar.setTemplate(value[key], type.mode);
    }
  }
}
