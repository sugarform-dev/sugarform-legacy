import { describe, it, beforeEach } from '@jest/globals';
import { act, cleanup } from '@testing-library/react';
import type { Sugar } from '@';
import { useSugarForm } from '@';
import { renderHookResult, TextBoxMock } from '#/misc';

// eslint-disable-next-line max-lines-per-function
describe('sugar.mapleArray', () => {
  beforeEach(() => {
    cleanup();
  });
  it('should work', () => {
    const { sugar, useIsDirtyState, render } = renderHookResult(() => useSugarForm<string[]>({
      defaultValue: [ 'a', 'b', 'c' ],
    })).current;
    const isDirty = renderHookResult(() => useIsDirtyState());

    const { keys, sugars, items } = componentMock(sugar);

    expect(keys.length).toBe(3);
    expect(items.length).toBe(3);
    expect(render()).toStrictEqual({ success: true, value: [ 'a', 'b', 'c' ] });
    expect(isDirty.current).toBe(false);

    act(() => { if (sugars[2] !== undefined) sugars[2].value = 'd'; });
    expect(isDirty.current).toBe(true);
    expect(render()).toStrictEqual({ success: true, value: [ 'a', 'b', 'd' ] });

  });
});

function componentMock(sugar: Sugar<string[]>): {
  keys: string[];
  setKeys: (newKeys: string[]) => void;
  sugars: TextBoxMock[];
  generateId: () => string;
  items: Array<{ id: string, sugar: Sugar<string> }>;
} {
  const { useKeys, items, generateId } = renderHookResult(() => sugar.mapleArray({
    template: 'foo',
  })).current;
  const [ keys, setKeys ] = renderHookResult(() => useKeys()).current;

  const sugars = items.map(v => new TextBoxMock(v.sugar));
  act(() => sugars.forEach(v => v.mount()));
  return { keys, setKeys, sugars, generateId, items };
}
