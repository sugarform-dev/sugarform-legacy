import type { Dispatch, SetStateAction } from 'react';
import type { Sugar, SugarArrayNode, SugarArrayUser, SugarObjectNode, SugarUser, SugarUserReshaper, SugarValue } from '.';
import { SugarDownstreamEventEmitter } from '@util/events/downstreamEvent';
import { SugarUpstreamEventEmitter } from '@util/events/upstreamEvent';
import type { SugarObject } from '@util/object';
import { isSugarObject } from '@util/object';
import { mapleArray } from './maple/array';
import { syncState } from './sync/state';
import { syncRef } from './sync/ref';
import { mapleSugar } from './maple';
import { SugarFormUnavailableFunctionError } from '@util/error';

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
      (param: { get: () => SugarValue<T> | undefined, set: (value: T) => boolean }) =>
        syncRef(sugar, param),
    maple:
      <U extends SugarObject>(options: SugarUserReshaper<T, U>) => mapleSugar<T, U>(sugar, options),
    mapleObject: (
      isSugarObject(template) ?
        (options: SugarUser<typeof template> = {}): SugarObjectNode<typeof template> =>
          mapleSugar<typeof template, typeof template>(
            sugar as Sugar<typeof template>,
            {
              ...options,
              reshape: {
                transform: x => x,
                deform: x => x,
              },
            },
          )
        : unavailable(path, 'mapleObject')
    ) as T extends SugarObject ? (options?: SugarUser<T>) => SugarObjectNode<T> : never,
    mapleArray: (
      Array.isArray(template) ? (
        (
          options: SugarArrayUser<unknown>,
        ): SugarArrayNode<unknown> => mapleArray(sugar as unknown as Sugar<unknown[]>, options))
        : unavailable(path, 'mapleArray')
    ) as T extends Array<infer U> ? (options?: SugarArrayUser<U>) => SugarArrayNode<U> : never,
  };

  return sugar;
}

function unavailable(path: string, name: string): never {
  return ((): void => {
    throw new SugarFormUnavailableFunctionError(path, name);
  }) as unknown as never;
}
