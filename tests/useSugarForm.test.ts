import { describe, it } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import type { Sugar, SugarValue } from '../src/component/sugar';
import { useSugarForm } from '../src/component/sugarform';

describe('useSugarForm', () => {

  it('should work', () => {
    const { result: { current: { sugar, render } } } =
      renderHook(() => useSugarForm<{ a: 'foo' }>({ defaultValue: { a: 'foo' } }));

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

});
