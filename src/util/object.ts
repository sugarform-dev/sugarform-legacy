export type SugarObject = Record<string, unknown>;
export function isSugarObject(obj: unknown): obj is SugarObject {
  return obj?.constructor.name === 'Object';
}

export declare interface BetterObjectConstructor extends ObjectConstructor {
  values<T>(obj: T): Array<T[keyof T]>;
}
