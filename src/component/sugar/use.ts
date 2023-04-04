import type { MutableRefObject } from 'react';
import { useRef } from 'react';
import type { Sugar, SugarUserReshaper, SugarObjectNode, SugarValue, SetTemplateMode } from '.';
import { SugarFormError } from '../../util/error';
import { debug } from '../../util/logger';
import type { BetterObjectConstructor, SugarObject } from '../../util/object';
import { createEmptySugar } from './create';
import { setDirty } from './dirty';

declare const Object: BetterObjectConstructor;

export function useSugar<T, U extends SugarObject>(
  sugar: Sugar<T>,
  options: SugarUserReshaper<T, U>,
): SugarObjectNode<U> {

  const fieldsRef = useRef<SugarObjectNode<U>['fields']>();
  let fields = fieldsRef.current;

  if (sugar.mounted && fields === undefined) {
    debug('WARN', `Sugar is already mounted, but fields are not initialized. Remounting... Path: ${sugar.path}`);
  }

  if (sugar.mounted && fields !== undefined) {
    debug('WARN', `Sugar is already mounted. Path: ${sugar.path}`);
  } else {
    debug('DEBUG', `Mounting sugar. Path: ${sugar.path}`);
    const mounted = mountSugar(sugar, options, fieldsRef);
    fields = mounted.fields;
    fieldsRef.current = fields;
  }

  return {
    fields,
  };
}

// eslint-disable-next-line max-lines-per-function
export function mountSugar<T, U extends SugarObject>(
  sugar: Sugar<T>,
  options: SugarUserReshaper<T, U>,
  fieldsRef: MutableRefObject<SugarObjectNode<U>['fields'] | undefined>,
): SugarObjectNode<U> {
  const template = options.reshape.deform(sugar.template);
  debug('DEBUG', `Template: ${JSON.stringify(template)}`);

  const fields = wrapSugar(sugar.path, template);

  const getter = (): SugarValue<T> => {
    const fields = fieldsRef.current;
    if (fields === undefined) throw new SugarFormError('SF0021', `Path: ${sugar.path}`);
    const value = get<U>(fields);
    debug('DEBUG', `Getting Value of Sugar: ${JSON.stringify(value)}, Path: ${sugar.path}`);
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
    debug('DEBUG', `Setting value of sugar. Path: ${sugar.path}`);
    const fields = fieldsRef.current;
    if (fields === undefined) throw new SugarFormError('SF0021', `Path: ${sugar.path}`);
    set<U>(fields, options.reshape.deform(value), { type: 'value' });
  };

  const dirtyControl = ({ isDirty }: { isDirty: boolean }) : void => {
    const fields = fieldsRef.current;
    if (!sugar.mounted || fields === undefined) throw new SugarFormError('SF0021', `Path: ${sugar.path}`);
    if (!isDirty && Object.values(fields).some(s => s.mounted && s.isDirty)) return;
    setDirty(sugar, isDirty);
  };

  Object.values(fields).forEach(sugar => sugar.upstream.listen('updateDirty', dirtyControl));

  const updateSugar = sugar as Sugar<T> & { mounted: true };
  updateSugar.mounted = true;
  updateSugar.get = getter;
  updateSugar.set = setter;
  updateSugar.setTemplate = (template: T, mode: SetTemplateMode = 'merge'): void => {
    const newTemplate = mode === 'replace' ? options.reshape.deform(template) : {
      ...options.reshape.deform(sugar.template),
      ...options.reshape.deform(template),
    };
    sugar.template = mode === 'replace' ? template : options.reshape.transform(newTemplate);
    set<U>(fields, newTemplate, { type: 'template', mode });
  };
  updateSugar.isDirty = false;
  updateSugar.upstream.fire('mounted', {});

  return { fields };
}


export function wrapSugar<T extends SugarObject>(path: string, template: T): SugarObjectNode<T>['fields'] {
  const fields: SugarObjectNode<T>['fields'] = {} as SugarObjectNode<T>['fields'];

  for (const key in template) {
    fields[key] = createEmptySugar(`${path}.${key}`, template[key]);
  }

  return fields;
}

export function get<T extends SugarObject>(fields: SugarObjectNode<T>['fields']): SugarValue<T> {
  const result = {} as { [P in keyof T]: unknown };
  let success = true;

  for (const key in fields) {
    const sugar = fields[key];
    if (!sugar.mounted) {
      debug('WARN', `Sugar is not mounted when tried to get. Path: ${sugar.path}`);
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

export function set<T extends SugarObject>(
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
      debug('WARN', `Sugar is not mounted when tried to set. Path: ${sugar.path}`);
      continue;
    }
    if (type.type === 'value') {
      sugar.set(value[key]);
    } else {
      sugar.setTemplate(value[key], type.mode);
    }
  }
}
