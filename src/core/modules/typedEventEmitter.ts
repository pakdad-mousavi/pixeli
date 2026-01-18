import EventEmitter from 'node:events';

type EventKey<T> = keyof T & string;

export class TypedEventEmitter<TEvents> extends EventEmitter {
  override on<K extends EventKey<TEvents>>(event: K, listener: (payload: TEvents[K]) => void): this {
    return super.on(event, listener);
  }

  override emit<K extends EventKey<TEvents>>(event: K, payload: TEvents[K]): boolean {
    return super.emit(event, payload);
  }
}
