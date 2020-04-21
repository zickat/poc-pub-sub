import { PubSub } from '../PubSub';
import { SQSProvider } from '../SQSProvider';
import { PubSubKoaMiddleware } from '../PubSubKoaMiddleware';
import Koa, { Context } from 'koa';
import { Router } from '@schoolmouv/koa-utils';

const mailSDK = {
  send: (pubSub: PubSub, content: any) => {
    return pubSub.requestAsync(`local-stats.fifo`, content);
  },
};

const mailRouter = Router('/mail', {
  'GET /:id': async (ctx: Context) => {
    mailSDK.send(ctx.pubSub, { id: ctx.params.id, message: 'hello' });
    ctx.status = 200;
    ctx.body = 'Send';
  },
});

const pubSub = new PubSub(new SQSProvider('eu-west-1'));
pubSub.connect();

const app = new Koa();
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

mailRouter.attach(app);

app.listen(4000);
console.log('Test launched on 4000');
