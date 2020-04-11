import { Context } from './Context';
import { Msg } from 'ts-nats';

export type Dictionary<T> = { [path: string]: T };

export type Middleware = (ctx: Context, next: Function) => Promise<any>;

export interface Router {
  [path: string]: Middleware;
}

export interface NatsMessage extends Msg {
  data: {
    data: any;
    headers: Dictionary<any>;
  };
}
