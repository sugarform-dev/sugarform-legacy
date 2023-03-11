import { wrapSugar } from '../src/component/sugar/use';
import { describe, it } from '@jest/globals';
import type { Sugar, SugarValue } from '../src/component/sugar';
import { SugarDownstreamEventEmitter } from '../src/util/events/downstreamEvent';
import { SugarUpstreamEventEmitter } from '../src/util/events/upstreamEvent';
import { renderHook } from '@testing-library/react';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

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
      },
      d: {
        mounted: false,
        path: 'foo.d',
        template: 3,
        upstream: expect.any(SugarUpstreamEventEmitter),
        downstream: expect.any(SugarDownstreamEventEmitter),
        use: expect.any(Function),
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
      },
      c: {
        mounted: false,
        path: 'foo.a.c',
        template: 'bar',
        upstream: expect.any(SugarUpstreamEventEmitter),
        downstream: expect.any(SugarDownstreamEventEmitter),
        use: expect.any(Function),
      },
    };

    expect(fields).toStrictEqual(expected);
  });

  it('should get/set work', () => {
    const original = {
      a: { b: 'foo', c: 'bar' },
    };
    const wrapped = wrapSugar('foo', original);
    const { result: { current: { fields } } } = renderHook(() => wrapped.a.useObject({}));

    const setterOfB = jest.fn();
    fields.b = {
      ...fields.b,
      mounted: true,
      get: (): SugarValue<string> => ({ success: true, value: 'foo' }),
      set: setterOfB,
      isDirty: false,
    };

    const setterOfC = jest.fn();
    fields.c = {
      ...fields.c,
      mounted: true,
      get: (): SugarValue<string> => ({ success: true, value: 'bar' }),
      set: setterOfC,
      isDirty: false,
    };

    expect(wrapped.a.mounted).toBe(true);
    expect(wrapped.a.mounted && wrapped.a.get()).toStrictEqual({ success: true, value: { b: 'foo', c: 'bar' } });
    wrapped.a.mounted && wrapped.a.set({ b: 'baz', c: 'qux' });
    expect(setterOfB).toHaveBeenCalledWith('baz');
    expect(setterOfC).toHaveBeenCalledWith('qux');

  });
});
