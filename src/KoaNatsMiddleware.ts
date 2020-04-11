import { Context } from 'koa';
import { NatsConnectionOptions } from 'ts-nats';
import { Nats } from './Nats';

let nats: Nats;

export const KoaNatsMiddleware = (
  natsCredentials: NatsConnectionOptions = {},
) => async (ctx: Context, next: Function) => {
  if (!nats) {
    nats = new Nats(natsCredentials);
    await nats.connect();
  }
  ctx.nats = nats;

  await next();
};
