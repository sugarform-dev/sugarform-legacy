import { describe, it } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import type { SugarValue } from '../src/component/sugar';
import { createEmptySugar } from '../src/component/sugar/create';


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
    a.mounted && a.set('def');
    expect(a.mounted && a.isDirty).toBe(true);
    expect(setter).toHaveBeenCalledTimes(1);
    expect(setter).toHaveBeenCalledWith('def');

    if (a.mounted) a.get = (): SugarValue<string> => ({ success: true, value: 'ghi' });
    onChange();
    expect(a.mounted && a.isDirty).toBe(true);
    expect(a.mounted && a.get()).toStrictEqual({ success: true, value: 'ghi' });
    if (a.mounted) a.get = (): SugarValue<string> => ({ success: true, value: 'abc' });
    onBlur();
    expect(a.mounted && a.isDirty).toBe(false);

  });

});
