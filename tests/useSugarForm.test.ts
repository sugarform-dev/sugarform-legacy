import { describe, it } from '@jest/globals';
import { act, renderHook } from '@testing-library/react';
import type { Sugar, SugarValue } from '../src/component/sugar';
import { useSugarForm } from '../src/component/sugarform';

// eslint-disable-next-line max-lines-per-function
describe('useSugarForm', () => {

  it('should work', () => {
    const { result: { current: { sugar, render } } } =
      renderHook(() => useSugarForm<{ a: string }>({ defaultValue: { a: 'foo' } }));

    const { result: { current: { fields: { a } } } } =
      renderHook(() => sugar.useObject({}));

    expect(a.template).toBe('foo');

    a.mounted = true;
    (a as Sugar<string> & { mounted: true }).get = (): SugarValue<string> => ({ success: true, value: 'foo' });

    expect(render()).toStrictEqual({
      success: true,
      value: {
        a: 'foo',
      },
    });
  });

  it('should work with ommited args', () => {
    const { result: { current: { sugar, render } } } =
      renderHook(() => useSugarForm<{ a: string }>({ defaultValue: { a: 'foo' } }));

    const { result: { current: { fields: { a } } } } =
      renderHook(() => sugar.useObject());

    expect(a.template).toBe('foo');

    a.mounted = true;
    (a as Sugar<string> & { mounted: true }).get = (): SugarValue<string> => ({ success: true, value: 'foo' });

    expect(render()).toStrictEqual({
      success: true,
      value: {
        a: 'foo',
      },
    });
  });

  it('should work with isDirtyState', () => {

    const { result: { current: { sugar, useIsDirtyState } } } =
      renderHook(() => useSugarForm<{ a: string }>({ defaultValue: { a: 'foo' } }));

    const { result: { current: { fields: { a } } } } =
      renderHook(() => sugar.useObject({}));

    const { result: { current: { onBlur } } } = renderHook(() => a.useFromRef({
      get: () => ({ success: true, value: 'foo' }),
      set: () => null,
    }));

    const { result: isDirtyResult } = renderHook(() => useIsDirtyState());

    expect(isDirtyResult.current).toBe(false);

    act(() => {
      if (a.mounted) a.get = (): SugarValue<string> => ({ success: true, value: 'bar' });
      onBlur();
    });

    expect(isDirtyResult.current).toBe(true);

  });

});
