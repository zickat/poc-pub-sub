import { createParams } from './utils';
import { PubSub } from './PubSub';
import { Dictionary, PubSubMessage } from './types';

/**
 * Contain all request info for a controller
 */
export class Request {
  params: Dictionary<string>;
  headers: Dictionary<string>;
  data: any;
  body: any;
  reply?: string;
  subject: string;

  constructor(
    message: PubSubMessage,
    path: string,
    params: Dictionary<string>,
  ) {
    this.data = message.data;
    this.body = message.data;
    this.reply = message.headers.reply;
    this.subject = message.headers.subject || '';
    this.headers = message.headers;
    this.params = params;
  }
}

/**
 * Context contain all data needed for a controller
 */
export class Context {
  req: Request;
  request: Request;
  pubSub: PubSub;
  body: any = null;
  data: any;
  params: Dictionary<string>;

  constructor(message: PubSubMessage, path: string, pubSub: PubSub) {
    this.params = createParams(path, message.headers.subject || '');
    this.req = this.request = new Request(message, path, this.params);
    this.data = message.data;
    this.pubSub = pubSub;
  }
}
