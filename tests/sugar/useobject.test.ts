/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { describe, it } from '@jest/globals';
import { act } from '@testing-library/react';
import { useSugarForm } from '../../src';
import { renderHookResult, TextBoxMock } from '../misc';

type Person = {
  name: string;
  age: string;
};

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

// eslint-disable-next-line max-lines-per-function
describe('sugar.useObject', () => {
  it('should work normal render', () => {

    const { sugar, useIsDirtyState, render } = renderHookResult(() => useSugarForm<Person>({
      defaultValue: {
        name: 'John',
        age: '20',
      },
    })).current;

    const { fields } = renderHookResult(() => sugar.useObject({})).current;
    const isDirty = renderHookResult(() => useIsDirtyState());
    const name = new TextBoxMock(fields.name);
    const age = new TextBoxMock(fields.age);

    act(() => { name.mount(); age.mount(); });

    expect(name.value).toBe('John');
    expect(age.value).toBe('20');
    expect(isDirty.current).toBe(false);
    expect(render()).toStrictEqual({
      success: true,
      value: { name: 'John', age: '20' },
    });

    act(() => { name.value = 'Jack'; });
    expect(isDirty.current).toBe(true);
    expect(render()).toStrictEqual({
      success: true,
      value: { name: 'Jack', age: '20' },
    });

    act(() => {
      if (sugar.mounted) sugar.set({ name: 'John', age: '20' });
    });
    expect(name.value).toBe('John');
    expect(age.value).toBe('20');
    expect(isDirty.current).toBe(false);
    expect(render()).toStrictEqual({
      success: true,
      value: { name: 'John', age: '20' },
    });

  });

  it('should work settemplate', () => {

    const { sugar, useIsDirtyState } = renderHookResult(() => useSugarForm<Person>({
      defaultValue: {
        name: 'John',
        age: '20',
      },
    })).current;

    const { fields } = renderHookResult(() => sugar.useObject({})).current;
    const isDirty = renderHookResult(() => useIsDirtyState());
    const name = new TextBoxMock(fields.name);
    const age = new TextBoxMock(fields.age);

    act(() => { name.mount(); age.mount(); });

    expect(isDirty.current).toBe(false);
    act(() => { if (sugar.mounted) sugar.set({ name: 'Jack', age: '21' }); });
    expect(isDirty.current).toBe(true);
    act(() => {
      if (sugar.mounted) sugar.setTemplate({ name: 'Jack', age: '21' });
      jest.runOnlyPendingTimers();
    });
    expect(isDirty.current).toBe(false);
  });
});
