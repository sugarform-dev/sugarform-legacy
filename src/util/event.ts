import { SugarFormError } from './error';

export class SugarEventEmitter<EventTable extends Record<string, Record<string, unknown>>> {
  private listeners: Partial<
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

  public fire<K extends keyof EventTable>(eventName: K, param: EventTable[K]): void {
    const listener: Array<(param: EventTable[K]) => void> | undefined = this.listeners[eventName];
    if (listener === undefined) return;
    listener.forEach(l => l(param));
  }
}
