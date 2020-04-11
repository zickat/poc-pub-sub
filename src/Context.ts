import { Msg } from 'ts-nats';
import { createParams } from './utils';
import { Nats } from './Nats';
import { Dictionary, NatsMessage } from './types';

export class Request implements Msg {
  params: Dictionary<string>;
  headers: Dictionary<string>;
  data: any;
  reply?: string;
  sid: number;
  size: number;
  subject: string;

  constructor(message: NatsMessage, path: string) {
    this.params = createParams(path, message.subject);
    this.data = message.data;
    this.reply = message.reply;
    this.sid = message.sid;
    this.size = message.size;
    this.subject = message.subject;
    this.headers = message.data.headers;
  }
}

export class Context {
  req: Request;
  request: Request;
  nats: Nats;
  body: any = null;
  data: any;

  constructor(message: NatsMessage, path: string, nats: Nats) {
    this.req = this.request = new Request(message, path);
    this.data = message.data.data;
    this.nats = nats;
  }
}
