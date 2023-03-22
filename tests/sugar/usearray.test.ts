import { describe, it } from '@jest/globals';
import { act } from '@testing-library/react';
import type { Sugar } from '../../src';
import { setSugarFormLogLevel, useSugarForm } from '../../src';
import { renderHookResult, TextBoxMock } from '../misc';

// eslint-disable-next-line max-lines-per-function
describe('sugar.useArray', () => {
  it('should work', () => {
    const { sugar, useIsDirtyState, render } = renderHookResult(() => useSugarForm<string[]>({
      defaultValue: [ 'a', 'b', 'c' ],
    })).current;
    const isDirty = renderHookResult(() => useIsDirtyState());

    const { useKeys, items } = renderHookResult(() => sugar.useArray({
      template: 'foo',
    })).current;
    const [ keys ] = renderHookResult(() => useKeys()).current;

    expect(keys.length).toBe(3);
    expect(items.length).toBe(3);

    const sugars = items.map(v => new TextBoxMock(v.sugar));
    act(() => sugars.forEach(v => v.mount()));

    expect(render()).toStrictEqual({ success: true, value: [ 'a', 'b', 'c' ] });
    expect(isDirty.current).toBe(false);

    act(() => { if (sugars[2] !== undefined) sugars[2].value = 'd'; });
    expect(isDirty.current).toBe(true);
    expect(render()).toStrictEqual({ success: true, value: [ 'a', 'b', 'd' ] });

  });
  it('add element', () => {
    setSugarFormLogLevel('DEBUG');
    const { sugar, useIsDirtyState, render } = renderHookResult(() => useSugarForm<string[]>({
      defaultValue: [ 'a', 'b', 'c' ],
    })).current;
    const isDirty = renderHookResult(() => useIsDirtyState());

    const a = componentMock(sugar);
    expect(render()).toStrictEqual({ success: true, value: [ 'a', 'b', 'c' ] });
    expect(isDirty.current).toBe(false);

    act(() => a.setKeys([ ...a.keys,  a.useNewId() ]));
  });
});

function componentMock(sugar: Sugar<string[]>): {
  keys: string[];
  setKeys: (newKeys: string[]) => void;
  sugars: TextBoxMock[];
  useNewId: () => string;
} {
  const { useKeys, items, useNewId } = renderHookResult(() => sugar.useArray({
    template: 'foo',
  })).current;
  const [ keys, setKeys ] = renderHookResult(() => useKeys()).current;

  const sugars = items.map(v => new TextBoxMock(v.sugar));
  act(() => sugars.forEach(v => v.mount()));
  return { keys, setKeys, sugars, useNewId };
}
