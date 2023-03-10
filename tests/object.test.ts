import { isSugarObject } from '../src/util/object';
import { describe, it } from '@jest/globals';

describe('object/isSugarObject', () => {

  it('should return true for a plain object', () => {
    expect(isSugarObject({})).toBe(true);
    expect(isSugarObject({ a: 1 })).toBe(true);
    expect(isSugarObject({ a: 1, b: 2 })).toBe(true);
    expect(isSugarObject({
      a: 1,
      b: { c: 3, d: 4 },
    })).toBe(true);
  });

  it('should return false for a non-object', () => {
    expect(isSugarObject(null)).toBe(false);
    expect(isSugarObject(undefined)).toBe(false);
    expect(isSugarObject(1)).toBe(false);
    expect(isSugarObject('hello')).toBe(false);
    expect(isSugarObject(true)).toBe(false);
  });

  it('should return false for a non-plain object', () => {
    expect(isSugarObject(new Date())).toBe(false);
    expect(isSugarObject(new Error())).toBe(false);
    expect(isSugarObject(new Map())).toBe(false);
    expect(isSugarObject(new Set())).toBe(false);
    expect(isSugarObject(new RegExp(''))).toBe(false);
    expect(isSugarObject(new String(''))).toBe(false);
    expect(isSugarObject(new Number(0))).toBe(false);
    expect(isSugarObject(new Boolean(false))).toBe(false);
  });

  it('should return false for an array', () => {
    expect(isSugarObject([])).toBe(false);
    expect(isSugarObject([ 1, 2, 3 ])).toBe(false);
    expect(isSugarObject([ 1, '2', true ])).toBe(false);
  });

});
