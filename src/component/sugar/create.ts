import type { Sugar, SugarArrayNode, SugarArrayUser, SugarObjectNode, SugarUser, SugarUserReshaper, SugarValue } from '.';
import { SugarFormError } from '../../util/error';
import { SugarDownstreamEventEmitter } from '../../util/events/downstreamEvent';
import { SugarUpstreamEventEmitter } from '../../util/events/upstreamEvent';
import type { SugarObject } from '../../util/object';
import { isSugarObject } from '../../util/object';
import { useArray } from './array';
import { useSugar } from './use';
import { useSugarFromRef } from './useFromRef';

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
    use:
      <U extends SugarObject>(options: SugarUserReshaper<T, U>) => useSugar<T, U>(sugar, options),
    useFromRef:
      (param: { get: () => SugarValue<T>, set: (value: T) => void }) =>
        useSugarFromRef(sugar, param),
    useObject: (
      isSugarObject(template) ?
        (options: SugarUser<SugarObject> = {}): SugarObjectNode<SugarObject> =>
          useSugar<SugarObject, SugarObject>(
          sugar as Sugar<SugarObject>,
          {
            ...options,
            reshape: {
              transform: x => x,
              deform: x => x,
            },
          } as SugarUserReshaper<SugarObject, SugarObject>,
          )
        : neverFunction(path, 'useObject')
    ) as T extends SugarObject ? (options?: SugarUser<T>) => SugarObjectNode<T> : never,
    useArray: (
      Array.isArray(template) ? (
        (
          options: SugarArrayUser<T>,
        ): SugarArrayNode<T> => useArray(sugar, options))
        : neverFunction(path, 'useArray')
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
