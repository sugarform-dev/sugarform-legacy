import type { Sugar, SugarValue } from '.';

export function useSugarFromRef<T>(sugar: Sugar<T>, param: { get: () => SugarValue<T>, set: (value: T) => void }): {
  onChange: () => void, onBlur: () => void
} {
  return {
    onChange: () => {

    },
    onBlur: () => {

    },
  };
}
