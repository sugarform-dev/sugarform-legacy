import type { SetTemplateMode } from '@/component/sugar';

export type SugarObject = Record<string, unknown>;
export function isSugarObject(obj: unknown): obj is SugarObject {
  return obj?.constructor.name === 'Object';
}

export function merge<T>(newer: T, older: T, mode: SetTemplateMode): T {
  if (mode === 'replace') return newer;
  if (isSugarObject(newer) && isSugarObject(older)) {
    return { ...older, ...newer };
  }
  if (newer === null || newer === undefined) {
    return older;
  }
  return newer;
}

export declare interface BetterObjectConstructor extends ObjectConstructor {
  values<T>(obj: T): Array<T[keyof T]>;
}
