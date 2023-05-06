import type { Dispatch, SetStateAction } from 'react';
import type { Sugar, SugarArrayNode, SugarArrayUser, SugarObjectNode, SugarUser, SugarUserReshaper, SugarValue } from '.';
import { SugarFormError } from '../../util/error';
import { SugarDownstreamEventEmitter } from '../../util/events/downstreamEvent';
import { SugarUpstreamEventEmitter } from '../../util/events/upstreamEvent';
import type { SugarObject } from '../../util/object';
import { isSugarObject } from '../../util/object';
import {  mapleArray } from './maple/array';
import { syncState } from './sync/state';
import { syncRef } from './sync/ref';
import { mapleSugar } from './maple';

export function createEmptySugar<T>(path: string, template: T): Sugar<T> {
  const sugar: Sugar<T> = {
    path,
    mounted: false,
    template,
    upstream: new SugarUpstreamEventEmitter(),
    downstream: new SugarDownstreamEventEmitter(),
    asMounted: (consumer: (mountedSugar: Sugar<T> & { mounted: true }) => void): void => {
      if (sugar.mounted) {
        consumer(sugar);
      } else {
        sugar.upstream.listenOnce('mounted', () => {
          consumer(sugar as Sugar<T> as Sugar<T> & { mounted: true });
        });
      }
    },
    syncState:
      (
        state: T,
        setState: Dispatch<SetStateAction<T>>,
        comparator?: (a: T, b: T) => boolean,
      ) => syncState(sugar, state, setState, comparator),
    syncRef:
      (param: { get: () => SugarValue<T>, set: (value: T) => void }) =>
        syncRef(sugar, param),
    maple:
      <U extends SugarObject>(options: SugarUserReshaper<T, U>) => mapleSugar<T, U>(sugar, options),
    mapleObject: (
      isSugarObject(template) ?
        (options: SugarUser<SugarObject> = {}): SugarObjectNode<SugarObject> =>
          mapleSugar<SugarObject, SugarObject>(
          sugar as Sugar<SugarObject>,
          {
            ...options,
            reshape: {
              transform: x => x,
              deform: x => x,
            },
          } as SugarUserReshaper<SugarObject, SugarObject>,
          )
        : neverFunction(path, 'mapleObject')
    ) as T extends SugarObject ? (options?: SugarUser<T>) => SugarObjectNode<T> : never,
    mapleArray: (
      Array.isArray(template) ? (
        (
          options: SugarArrayUser<T>,
        ): SugarArrayNode<T> => mapleArray(sugar, options))
        : neverFunction(path, 'mapleArray')
    ) as T extends Array<infer U> ? (options?: SugarArrayUser<T>) => SugarArrayNode<U> : never,
  };

  return sugar;
}

export function neverFunction(path: string, name: string): never {
  const error: never =  ((): void => {
    throw new SugarFormError('SF0002', `This function should not be called. at ${path} of ${name}`);
  }) as unknown as never;

  return error;
}
