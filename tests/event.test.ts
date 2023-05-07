import { describe, it } from '@jest/globals';
import { SugarEventEmitter } from '@util/event';

class TestEventEmitter extends SugarEventEmitter<{
  test: { a: number, b: number },
  sub: { c: string, d: boolean },
}> {}

describe('event/SugarEventEmitter', () => {

  it('should called listener', () => {
    const emitter = new TestEventEmitter();
    const listener = jest.fn();
    emitter.listen('test', listener);
    emitter.fire('test', { a: 1, b: 2 });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ a: 1, b: 2 });
  });

  it('should called listener only once', () => {
    const emitter = new TestEventEmitter();
    const listener = jest.fn();
    emitter.listenOnce('test', listener);
    emitter.fire('test', { a: 1, b: 2 });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ a: 1, b: 2 });
    emitter.fire('test', { a: 1, b: 2 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should work with multiple listener', () => {
    const emitter = new TestEventEmitter();
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    emitter.listen('test', listener1);
    emitter.listen('test', listener2);
    emitter.fire('test', { a: 1, b: 2 });
    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener1).toHaveBeenCalledWith({ a: 1, b: 2 });
    expect(listener2).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledWith({ a: 1, b: 2 });
  });

  it('should work with multiple event', () => {
    const emitter = new TestEventEmitter();
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    emitter.listen('test', listener1);
    emitter.listen('sub', listener2);
    emitter.fire('test', { a: 1, b: 2 });
    emitter.fire('sub', { c: 'foo', d: true });
    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener1).toHaveBeenCalledWith({ a: 1, b: 2 });
    expect(listener2).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledWith({ c: 'foo', d: true });
  });

});
