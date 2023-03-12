import type { Dispatch, SetStateAction } from 'react';
import { useRef, useState } from 'react';
import { SugarFormError } from '../../util/error';
import type { Sugar, SugarValue } from '../sugar';
import { createEmptySugar } from '../sugar/create';

export const useSugarForm = <T,>({ defaultValue }:{ defaultValue: T }): {
  sugar: Sugar<T>,
  render: () => SugarValue<T>,
  useIsDirtyState: () => boolean,
} => {
  const sugar = useRef<Sugar<T>>();
  sugar.current ??= createEmptySugar('', defaultValue);

  const isDirtyStateRef = useRef<undefined | Dispatch<SetStateAction<boolean>>>(undefined);

  if (!sugar.current.mounted) {
    sugar.current.upstream.listen('updateDirty', ({ isDirty }) => {
      isDirtyStateRef.current?.(isDirty);
    });
  }

  return {
    sugar: sugar.current,
    render: (): SugarValue<T> => {
      const sugarValue = sugar.current;
      if (sugarValue === undefined || !sugarValue.mounted) throw new SugarFormError('SF0021', 'Path: <TopLevel>');
      return sugarValue.get();
    },
    useIsDirtyState: (): boolean => {
      const [ isDirtyState, setIsDirtyState ] = useState<boolean>(false);
      if (isDirtyStateRef.current === undefined) {
        isDirtyStateRef.current = setIsDirtyState;
      }
      return isDirtyState;
    },
  };
};
