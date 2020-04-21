import { PubSub } from '../PubSub';
import { Context } from '../Context';
import { Routes } from '../types';
import { PubSubError } from '../PubSubError';
import { NatsProvider } from '../NatsProvider';

const router: Routes = {
  '/users/:id/:cid': async (ctx: Context) => {
    console.log({ msg: ctx.data, params: ctx.request.params });
    if (ctx.request.params.cid === '4') {
      throw new PubSubError(404, 'Not found');
    }
    return { message: `${ctx.data} - ${ctx.request.params.id}` };
  },
};

const logger = async (ctx: Context, next: Function) => {
  console.log(`-------- begin ${ctx.request.subject} --------`);
  try {
    await next();
    console.log(`-------- end ${ctx.request.subject} --------`);
  } catch (e) {
    console.log(`-------- Error ${e.status} - ${ctx.request.subject} --------`);
    throw e;
  }
};

const app = new PubSub(new NatsProvider());
app.use(logger);
app.attachRoutes(router);
app.connect();
