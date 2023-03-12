import { describe, it } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import type { Sugar, SugarValue } from '../src/component/sugar';
import { createEmptySugar } from '../src/component/sugar/create';


const safeSet = <T,>(a: Sugar<T>, value: T): void => {
  if (a.mounted) {
    a.get = (): SugarValue<T> => ({ success: true, value });
    a.set(value);
  }
};

const safeEdit = <T,>(a: Sugar<T>, value: T): void => {
  if (a.mounted) {
    a.get = (): SugarValue<T> => ({ success: true, value });
  }
};

describe('useFromRef', () => {

  it('should work', () => {
    const a = createEmptySugar<string>('', 'abc');
    const setter = jest.fn();

    const { result: { current: { onChange, onBlur } } } = renderHook(() =>
      a.useFromRef({
        get: () => ({ success: true, value: 'abc' }),
        set: setter,
      }),
    );

    expect(a.mounted).toBe(true);
    expect(a.mounted && a.isDirty).toBe(false);
    expect(a.mounted && a.get()).toStrictEqual({ success: true, value: 'abc' });
    expect(setter).toHaveBeenCalledTimes(1);
    expect(setter).toHaveBeenLastCalledWith('abc');
    safeSet(a, 'def');
    expect(a.mounted && a.isDirty).toBe(true);
    expect(setter).toHaveBeenCalledTimes(2);
    expect(setter).toHaveBeenLastCalledWith('def');
    safeEdit(a, 'ghi');
    onChange();
    expect(a.mounted && a.isDirty).toBe(true);
    expect(a.mounted && a.get()).toStrictEqual({ success: true, value: 'ghi' });
    safeEdit(a, 'abc');
    onBlur();
    expect(a.mounted && a.isDirty).toBe(false);

  });

});
