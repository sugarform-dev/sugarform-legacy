/* eslint-disable @typescript-eslint/no-empty-interface */
import type { SugarDownstreamEventEmitter } from '../../util/events/downstreamEvent';
import type { SugarUpstreamEventEmitter } from '../../util/events/upstreamEvent';
import type { SugarObject } from '../../util/object';
import type { MutableRefObject } from 'react';

export type SetTemplateMode = 'replace' | 'merge';
export type Sugar<T> = SugarData<T> & ({
  mounted: false,
} | {
  mounted: true,
  get: () => SugarValue<T>,
  set: (value: T) => void,
  setTemplate: (template: T, mode: SetTemplateMode) => void,
  isDirty: boolean,
});

export interface SugarData<T> {
  path: string,
  template: T,
  upstream: SugarUpstreamEventEmitter,
  downstream: SugarDownstreamEventEmitter,
  useFromRef: (param: { get: () => SugarValue<T>, set: (value: T) => boolean }) => {
    onChange: () => void, onBlur: () => void, defaultValueRef: MutableRefObject<T | undefined>,
  },
  use: <U extends SugarObject>(options: SugarUserReshaper<T, U>) => SugarObjectNode<U>,
  useObject: T extends SugarObject ? (options?: SugarUser<T>) => SugarObjectNode<T> : never;
}
// ) & (
//   T extends Array<infer U> ?
//     { useArray: (options: SugarUserArray<U>) => SugarArrayNode<U> } :
//     Record<string, never>
// );

export type SugarValue<T> = {
  success: true,
  value: T,
} | {
  success: false,
  value: unknown,
};

export interface SugarUser<U extends SugarObject> {
  validation?: Array<{ condition: (value: U) => boolean }>
}

export interface SugarUserReshaper<T, U extends SugarObject> extends SugarUser<U> {
  reshape: {
    transform: (value: U) => T,
    deform: (value: T) => U,
  }
}

export interface SugarObjectNode<U extends SugarObject> {
  fields: { [K in keyof U]: Sugar<U[K]> },
}

// export interface SugarUserArray<T> {
//
// }
//
// export interface SugarArrayNode<T> {
//
// }
