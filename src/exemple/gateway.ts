import Koa, { Context } from 'koa';
import { Router } from '@schoolmouv/koa-utils';
import { KoaNatsMiddleware } from '../KoaNatsMiddleware';
import {Nats} from "../Nats";

const app = new Koa();

const userSdk = {
  get: (nats: Nats, id: string) => {
    return nats.request(`users.${id}.toto`, 'Hey')
  },
};

const testRouter = Router('/toto', {
  'GET /:id': async (ctx: Context) => {
    const res = await userSdk.get(ctx.nats, ctx.params.id);
    ctx.status = 200;
    ctx.body = res;
  },
});

app.use(KoaNatsMiddleware());

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
