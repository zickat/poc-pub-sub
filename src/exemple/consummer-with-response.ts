import { Nats } from '../Nats';
import { Context } from '../Context';
import { NatsError } from '../NatsError';
import { Router } from '../types';

const router: Router = {
  '/users/:id/:cid': async (ctx: Context) => {
    console.log({ msg: ctx.data, params: ctx.request.params });
    if (ctx.request.params.cid === '4') {
      throw new NatsError(404, 'Not found');
    }
    return { message: `${ctx.data} - ${ctx.request.params.id}` };
  },
};

const logger = async (ctx: Context, next: Function) => {
  console.log(`-------- begin ${ctx.request.subject} --------`);
  console.log(ctx.request.headers);
  try {
    await next();
    console.log(`-------- end ${ctx.request.subject} --------`);
  } catch (e) {
    console.log(`-------- Error ${e.status} - ${ctx.request.subject} --------`);
    throw e;
  }
};

(async () => {
  // let nc = await connect({ payload: Payload.JSON });
  //
  // let sub = await nc.subscribe('greeting', (err, msg) => {
  //   if (err) {
  //     console.log(err);
  //   } else if (msg.reply) {
  //     console.log(msg.data);
  //     nc.publish(msg.reply, msg.data);
  //   } else {
  //     console.log('no reply');
  //   }
  // });

  // await connect();
  // await addRouteWithRespone('user', async msg => {
  //   console.log({ msg });
  //   return {
  //     message: msg.data,
  //   };
  // });
  const app = new Nats();
  app.use(logger);
  app.attachRoutes(router);
  app.connect();
})();
