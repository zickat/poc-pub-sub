import Koa, { Context } from 'koa';
import { Router } from '@schoolmouv/koa-utils';
import { PubSubKoaMiddleware } from '../PubSubKoaMiddleware';
import { PubSub } from '../PubSub';
import { NatsProvider } from '../NatsProvider';
import { profileSdk } from './consummer-fp';

const app = new Koa();

const userSdk = {
  get: (pubSub: PubSub, id: string) => {
    return pubSub.request(`users.${id}.toto`, 'Hey');
  },
};

const testRouter = Router('/toto', {
  'GET /:id': async (ctx: Context) => {
    let res;
    try {
      // res = await userSdk.get(ctx.pubSub, ctx.params.id);
      res = await profileSdk.getUserToken(ctx.params.id, 'toto');
    } catch (e) {
      console.error(e);
      ctx.body = { e: e.message };
      return;
    }
    ctx.status = 200;
    ctx.body = res;
  },
});

const pubSub = new PubSub(new NatsProvider());
pubSub.connect();

profileSdk.init(pubSub);
app.use(PubSubKoaMiddleware(pubSub));

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  if (ctx.status != 500) {
    console.log(`${ctx.method} ${ctx.url} ${ctx.status} - ${ms}ms`);
  } else {
    console.error(`${ctx.method} ${ctx.url} ${ctx.status} - ${ms}ms`);
  }
});

testRouter.attach(app);

app.listen(4000);
console.log('Test launched on 4000');
