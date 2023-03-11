import type { Sugar, SugarUserReshaper, SugarObjectNode } from '.';
import type { SugarObject } from '../../util/object';

export function useSugar<T, U extends SugarObject>(
  sugar: Sugar<T>,
  options: SugarUserReshaper<T, U>,
): SugarObjectNode<U> {
  return {} as SugarObjectNode<U>;
}
