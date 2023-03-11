import { useRef } from 'react';
import { SugarFormError } from '../../util/error';
import type { Sugar, SugarValue } from '../sugar';
import { createEmptySugar } from '../sugar/create';

export const useSugarForm = <T,>({ defaultValue }:{ defaultValue: T }): {
  sugar: Sugar<T>,
  render: () => SugarValue<T>
} => {
  const sugar = useRef<Sugar<T>>();
  sugar.current ??= createEmptySugar('', defaultValue);
  return {
    sugar: sugar.current,
    render: (): SugarValue<T> => {
      const sugarValue = sugar.current;
      if (sugarValue === undefined || !sugarValue.mounted) throw new SugarFormError('SF0021', 'Path: <TopLevel>');
      return sugarValue.get();
    },
  };
};
