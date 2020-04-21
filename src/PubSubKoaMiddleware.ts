import { Context } from 'koa';
import { PubSub } from './PubSub';

/**
 * Koa middleware to bind pub sub instance to ctx
 * @param pubSub
 * @constructor
 */
export const PubSubKoaMiddleware = (pubSub: PubSub) => async (
  ctx: Context,
  next: Function,
) => {
  ctx.pubSub = pubSub;

  await next();
};
