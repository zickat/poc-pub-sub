import { Routes } from '../types';
import { Context } from '../Context';
import { PubSub } from '../PubSub';
import { NatsProvider } from '../NatsProvider';
import { SQSProvider } from '../SQSProvider';

const router: Routes = {
  'local-stats.fifo': async (ctx: Context) => {
    console.log('consummer - mail');
    console.log(ctx.request.body);
  },
};

const app = new PubSub(new SQSProvider('eu-west-1'));
app.attachRoutes(router);
app.connect();
