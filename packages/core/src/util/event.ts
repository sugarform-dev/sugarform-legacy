
export class SugarEventEmitter<EventTable extends Record<string, Record<string, unknown>>> {
  private listeners: Partial<{
    [P in keyof EventTable] : Array<(param: EventTable[P]) => void>
  }> = {};

  private onceListeners: Partial<{
    [P in keyof EventTable] : Array<(param: EventTable[P]) => void>
  }> = {};


  public listen<K extends keyof EventTable>(
    eventName: K, callback: (param: EventTable[K]) => void,
  ): void {
    const arr: Array<(param: EventTable[K]) => void> = this.listeners[eventName] ?? [];
    arr.push(callback);
    this.listeners[eventName] = arr;
  }

  public listenOnce<K extends keyof EventTable>(
    eventName: K, callback: (param: EventTable[K]) => void,
  ): void {
    const arr: Array<(param: EventTable[K]) => void> = this.onceListeners[eventName] ?? [];
    arr.push(callback);
    this.onceListeners[eventName] = arr;
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
