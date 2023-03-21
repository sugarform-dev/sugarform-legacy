import { SugarFormError } from './error';

export class SugarEventEmitter<EventTable extends Record<string, Record<string, unknown>>> {
  private listeners: Partial<
    Record<keyof EventTable, Array<(param: EventTable[keyof EventTable]) => void>>
  > = {};

  private onceListeners: Partial<
    Record<keyof EventTable, Array<(param: EventTable[keyof EventTable]) => void>>
  > = {};


  public listen<K extends keyof EventTable>(
    eventName: K, callback: (param: EventTable[K]) => void,
  ): void {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    const listener: Array<(param: EventTable[K]) => void> | undefined = this.listeners[eventName];
    if (listener === undefined) {
      throw new SugarFormError('SF0001', 'SugarEventEmitter#listen');
    }
    listener.push(callback);
  }

  public listenOnce<K extends keyof EventTable>(
    eventName: K, callback: (param: EventTable[K]) => void,
  ): void {
    if (!this.onceListeners[eventName]) {
      this.onceListeners[eventName] = [];
    }
    const onceListener: Array<(param: EventTable[K]) => void> | undefined =
      this.onceListeners[eventName];
    if (onceListener === undefined) {
      throw new SugarFormError('SF0002', 'SugarEventEmitter#listenOnce');
    }
    onceListener.push(callback);
  }

  public fire<K extends keyof EventTable>(eventName: K, param: EventTable[K]): void {
    const listener: Array<(param: EventTable[K]) => void> | undefined = this.listeners[eventName];
    const onceListener: Array<(param: EventTable[K]) => void> | undefined =
        this.onceListeners[eventName];

    if (listener !== undefined) {
      listener.forEach(l => l(param));
    }

    if (onceListener !== undefined) {
      onceListener.forEach(l => l(param));
      this.onceListeners[eventName] = [];
    }
  }
}
