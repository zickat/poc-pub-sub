import { Context } from './Context';

/**
 * Useful type to describe a dictionary in Typescript
 */
export type Dictionary<T> = { [path: string]: T };

/**
 * Route and Middleware are the same
 */
export type Middleware = (ctx: Context, next: Function) => Promise<any>;
export type Route = Middleware;
export type Routes = Dictionary<Route>;

/**
 * Formatted message received by pub sub
 */
export interface PubSubMessage {
  data: any;
  headers: {
    subject?: string;
    reply?: string;
    [key: string]: any;
  };
}

/**
 * Callback received on a subscribed
 */
export type MessageCallback = (err: Error | null, msg: PubSubMessage) => void;

/**
 * The interface that a pub sub provider must implement
 */
export interface PubSubProvider {
  /**
   * Connect to the pub sub service
   */
  connect(): Promise<void>;

  /**
   * Subscribe to a pub sub channel
   * @param path
   * @param callback
   */
  subscribe(path: string, callback: MessageCallback): Promise<void>;

  /**
   * Make a request on a channel, this request must await for a response
   * @param path
   * @param msg
   * @param timeout
   */
  request(path: string, msg: PubSubMessage, timeout: number): Promise<any>;

  /**
   * Publish a message on a channel
   * @param path
   * @param msg
   */
  publish(path: string, msg: PubSubMessage): void;
}
