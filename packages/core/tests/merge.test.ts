import { merge } from '@/util/object';
import { describe, it } from '@jest/globals';

describe('Object/merge', () => {
  it('should merge two objects', () => {
    expect(
      merge({ a: 1 }, { b: 2 }, 'merge'),
    ).toStrictEqual({ a: 1, b: 2 });
    expect(
      merge({ a: 2 }, { a: 1 }, 'merge'),
    ).toStrictEqual({ a: 2 });
    expect(
      merge({ a: 2 }, { a: 1, b: 2 }, 'merge'),
    ).toStrictEqual({ a: 2, b: 2 });
    expect(
      merge({ a: 2 }, { }, 'merge'),
    ).toStrictEqual({ a: 2 });
    expect(
      merge({ }, { a: 2 }, 'merge'),
    ).toStrictEqual({ a: 2 });
  });
  it('should replace two objects', () => {
    expect(
      merge({ a: 1 }, { b: 2 }, 'replace'),
    ).toStrictEqual({ a: 1 });
    expect(
      merge({ a: 2 }, { a: 1 }, 'replace'),
    ).toStrictEqual({ a: 2 });
    expect(
      merge({ a: 2 }, { a: 1, b: 2 }, 'replace'),
    ).toStrictEqual({ a: 2 });
    expect(
      merge({ a:2 }, { }, 'replace'),
    ).toStrictEqual({ a: 2 });
    expect(
      merge({ }, { a: 2 }, 'replace'),
    ).toStrictEqual({ });
  });
  it('take older if newer is null or undefined', () => {
    expect(
      merge({ a: 1 }, null, 'merge'),
    ).toStrictEqual({ a: 1 });
    expect(
      merge({ a: 1 }, undefined, 'merge'),
    ).toStrictEqual({ a: 1 });
    expect(
      merge({ a: 1 }, null, 'replace'),
    ).toStrictEqual({ a: 1 });
    expect(
      merge({ a: 1 }, undefined, 'replace'),
    ).toStrictEqual({ a: 1 });
    expect(
      merge(null, { a: 1 }, 'merge'),
    ).toStrictEqual({ a: 1 });
    expect(
      merge(undefined, { a: 1 }, 'merge'),
    ).toStrictEqual({ a: 1 });
    expect(
      merge(null, { a: 1 }, 'replace'),
    ).toBeNull();
    expect(
      merge(undefined, { a: 1 }, 'replace'),
    ).toBeUndefined();
  });
  it('should not merge two arrays', () => {
    expect(
      merge([ 1, 2 ], [ 3, 4 ], 'merge'),
    ).toStrictEqual([ 1, 2 ]);
    expect(
      merge([ 1, 2 ], [ 3, 4 ], 'replace'),
    ).toStrictEqual([ 1, 2 ]);
  });
  it('should not spread two strings', () => {
    expect(
      merge('hello', 'world', 'merge'),
    ).toBe('hello');
    expect(
      merge('hello', 'world', 'replace'),
    ).toBe('hello');
    expect(
      merge(null, 'world', 'merge'),
    ).toBe('world');
    expect(
      merge(null, 'world', 'replace'),
    ).toBeNull();
  });
});
