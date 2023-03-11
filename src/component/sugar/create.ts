import type { Sugar, SugarObjectNode, SugarUser, SugarUserReshaper } from '.';
import { SugarDownstreamEventEmitter } from '../../util/events/downstreamEvent';
import { SugarUpstreamEventEmitter } from '../../util/events/upstreamEvent';
import type { SugarObject } from '../../util/object';
import { isSugarObject } from '../../util/object';
import { useSugar } from './use';

export function createEmptySugar<T>(path: string, template: T): Sugar<T> {
  const sugar: Sugar<T> = {
    path,
    mounted: false,
    template,
    upstream: new SugarUpstreamEventEmitter(),
    downstream: new SugarDownstreamEventEmitter(),
    use:
      <U extends SugarObject>(options: SugarUserReshaper<T, U>) => useSugar<T, U>(sugar, options),
  };

  if (isSugarObject(template)) {
    sugar.useObject =
      (options: SugarUser): SugarObjectNode<T & SugarObject> =>
        useSugar<T & SugarObject, T & SugarObject>(
          sugar as Sugar<T & SugarObject>,
          {
            ...options,
            reshape: {
              transform: x => x,
              deform: x => x,
            },
          },
        );
  }

  return sugar;
}
