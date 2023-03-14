import { wrapSugar } from '../src/component/sugar/use';
import { describe, it } from '@jest/globals';
import type { Sugar, SugarValue } from '../src/component/sugar';
import { SugarDownstreamEventEmitter } from '../src/util/events/downstreamEvent';
import { SugarUpstreamEventEmitter } from '../src/util/events/upstreamEvent';
import { renderHook } from '@testing-library/react';
import { createEmptySugar } from '../src/component/sugar/create';
import { SugarFormError } from '../src/util/error';

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
describe('createEmptySugar', () => {
  it('error call useObject from non-SugarObject sugar', () => {
    const sugar = createEmptySugar('foo', 3);
    expect(sugar.useObject).toThrow(SugarFormError);
  });
});

describe('wrapSugar', () => {
  it('should work', () => {
    const original = {
      a: { b: 'foo', c: 'bar' },
      d: 3,
    };
    const wrapped = wrapSugar('foo', original);
    const expected: {
      a: Sugar<{ b: string, c: string }>,
      d: Sugar<number>,
    } = {
      a: {
        mounted: false,
        path: 'foo.a',
        template: { b: 'foo', c: 'bar' },
        upstream: expect.any(SugarUpstreamEventEmitter),
        downstream: expect.any(SugarDownstreamEventEmitter),
        use: expect.any(Function),
        useObject: expect.any(Function),
        useFromRef: expect.any(Function),
      },
      d: {
        mounted: false,
        path: 'foo.d',
        template: 3,
        upstream: expect.any(SugarUpstreamEventEmitter),
        downstream: expect.any(SugarDownstreamEventEmitter),
        use: expect.any(Function),
        useObject: expect.any(Function) as never,
        useFromRef: expect.any(Function),
      },
    };

    expect(wrapped).toStrictEqual(expected);
  });

});

/* eslint-disable-next-line max-lines-per-function */
describe('useObject', () => {

  it('should make children with useObject', () => {
    const original = {
      a: { b: 'foo', c: 'bar' },
    };
    const wrapped = wrapSugar('foo', original);
    const { result: { current: { fields } } } = renderHook(() => wrapped.a.useObject({}));
    const expected = {
      b: {
        mounted: false,
        path: 'foo.a.b',
        template: 'foo',
        upstream: expect.any(SugarUpstreamEventEmitter),
        downstream: expect.any(SugarDownstreamEventEmitter),
        use: expect.any(Function),
        useFromRef: expect.any(Function),
        useObject: expect.any(Function) as never,
      },
      c: {
        mounted: false,
        path: 'foo.a.c',
        template: 'bar',
        upstream: expect.any(SugarUpstreamEventEmitter),
        downstream: expect.any(SugarDownstreamEventEmitter),
        use: expect.any(Function),
        useFromRef: expect.any(Function),
        useObject: expect.any(Function) as never,
      },
    };

    expect(fields).toStrictEqual(expected);
  });

  it('should work validation', () => {
    const original = {
      a: { b: 'foo', c: 'bar' },
    };
    const wrapped = wrapSugar<{
      a: {
        b: string,
        c: string,
      }
    }>('foo', original);
    const { result: { current: { fields } } } = renderHook(() => wrapped.a.useObject({
      validation: [
        { condition: (x): boolean => x.c !== 'qux' },
      ],
    }));

    renderHook(() => {
      fields.b.useFromRef({ get: () => ({ success: true, value: 'foo' }), set: () => true });
      fields.c.useFromRef({ get: () => ({ success: true, value: 'bar' }), set: () => true });
    });

    expect(wrapped.a.mounted).toBe(true);
    expect(wrapped.a.mounted && wrapped.a.get()).toStrictEqual({
      success: true, value: { b: 'foo', c: 'bar' },
    });

    if (fields.c.mounted) fields.c.get = (): SugarValue<string> => (
      { success: true, value: 'qux' }
    );
    expect(wrapped.a.mounted && wrapped.a.get()).toStrictEqual({
      success: false, value: { b: 'foo', c: 'qux' },
    });
  });

  it('should get/set/isDirty work', () => {
    const original = {
      a: { b: 'foo', c: 'bar' },
    };
    const wrapped = wrapSugar('foo', original);
    const { result: { current: { fields } } } = renderHook(() => wrapped.a.useObject({}));

    const setterOfB = jest.fn(() => true);
    const setterOfC = jest.fn(() => true);

    const valueOfB = { data: 'foo' };
    const valueOfC = { data: 'bar' };
    renderHook(() => {
      fields.b.useFromRef({
        get: (): SugarValue<string> => ({ success: true, value: valueOfB.data }),
        set: setterOfB,
      });

      fields.c.useFromRef({
        get: (): SugarValue<string> => ({ success: true, value: valueOfC.data }),
        set: setterOfC,
      });
    });

    expect(wrapped.a.mounted).toBe(true);
    expect(wrapped.a.mounted && wrapped.a.isDirty).toBe(false);
    expect(wrapped.a.mounted && wrapped.a.get()).toStrictEqual({ success: true, value: { b: 'foo', c: 'bar' } });
    expect(wrapped.a.mounted && wrapped.a.isDirty).toBe(false);
    expect(setterOfB).toHaveBeenCalledWith('foo');
    expect(setterOfC).toHaveBeenCalledWith('bar');
    valueOfB.data = 'baz';
    valueOfC.data = 'qux';
    renderHook(() => wrapped.a.mounted && wrapped.a.set({ b: 'baz', c: 'qux' }));
    expect(setterOfB).toHaveBeenLastCalledWith('baz');
    expect(setterOfC).toHaveBeenLastCalledWith('qux');
    expect(fields.b.mounted && fields.b.isDirty).toBe(true);
    expect(fields.c.mounted && fields.c.isDirty).toBe(true);
    expect(wrapped.a.mounted && wrapped.a.isDirty).toBe(true);
    expect(setterOfB).toHaveBeenCalledTimes(2);
    expect(setterOfC).toHaveBeenCalledTimes(2);
    valueOfB.data = 'foo';
    valueOfC.data = 'bar';
    renderHook(() => wrapped.a.mounted && wrapped.a.set({ b: 'foo', c: 'bar' }));
    expect(wrapped.a.mounted && wrapped.a.isDirty).toBe(false);

  });

  it('should work setTemplate', () => {
    const original = {
      a: { b: 'foo', c: 'bar' },
    };
    const wrapped = wrapSugar('foo', original);
    const { result: { current: { fields } } } = renderHook(() => wrapped.a.useObject({}));

    const setterOfB = jest.fn(() => true);
    const setterOfC = jest.fn(() => true);

    renderHook(() => {
      fields.b.useFromRef({
        get: (): SugarValue<string> => ({ success: true, value: 'foo' }),
        set: setterOfB,
      });
      fields.c.useFromRef({
        get: (): SugarValue<string> => ({ success: true, value: 'bar' }),
        set: setterOfC,
      });
    });

    expect(setterOfB).toHaveBeenCalledTimes(1);
    expect(setterOfC).toHaveBeenCalledTimes(1);

    expect(fields.b.mounted && fields.b.isDirty).toBe(false);
    expect(fields.c.mounted && fields.c.isDirty).toBe(false);

    expect(setterOfB).toHaveBeenCalledWith('foo');
    expect(setterOfC).toHaveBeenCalledWith('bar');

    expect(wrapped.a.mounted).toBe(true);
    expect(wrapped.a.mounted && wrapped.a.isDirty).toBe(false);

    renderHook(() => {
      wrapped.a.mounted && wrapped.a.setTemplate({ b: 'foo', c: 'baz' });
    });

    jest.runOnlyPendingTimers();

    expect(fields.b.mounted && fields.b.isDirty).toBe(false);
    expect(fields.c.mounted && fields.c.isDirty).toBe(true);
    expect(wrapped.a.mounted && wrapped.a.isDirty).toBe(true);

    expect(setterOfB).toHaveBeenCalledTimes(2);
    expect(setterOfC).toHaveBeenCalledTimes(2);

  });

});
