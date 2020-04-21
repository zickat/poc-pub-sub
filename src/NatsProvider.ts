import {
  Client,
  connect as connectNats,
  NatsConnectionOptions,
  Payload,
} from 'ts-nats';
import { MessageCallback, PubSubMessage, PubSubProvider } from './types';

/**
 * The Nats implementation of Pub Sub
 */
export class NatsProvider implements PubSubProvider {
  nc!: Client;
  natsCredentials: NatsConnectionOptions;

  constructor(natsCredentials: NatsConnectionOptions = {}) {
    this.natsCredentials = natsCredentials;
  }

  /**
   * Connect to Nats
   */
  async connect(): Promise<void> {
    this.nc = await connectNats({
      payload: Payload.JSON,
      ...this.natsCredentials,
    });
  }

  /**
   * Publish a message on the channel
   * @param path
   * @param msg
   */
  publish(path: string, msg: PubSubMessage): void {
    this.nc.publish(path, msg);
  }

  /**
   * Make a request on a channel
   * @param path
   * @param msg
   * @param timeout
   */
  async request(
    path: string,
    msg: PubSubMessage,
    timeout: number,
  ): Promise<any> {
    return (await this.nc.request(path, timeout, msg)).data;
  }

  /**
   * Subscribe on a channel and format the message
   * @param path
   * @param callback
   */
  subscribe(path: string, callback: MessageCallback): Promise<any> {
    return this.nc.subscribe(path, (err, msg) => {
      const message: PubSubMessage = {
        headers: {
          ...msg,
          ...msg.data.headers,
        },
        data: msg.data.data,
      };
      delete message.headers.data;
      callback(err, message);
    });
  }
}
