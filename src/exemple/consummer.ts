import { PubSub } from '../PubSub';
import { NatsProvider } from '../NatsProvider';
import { Context } from '../Context';
import { Routes } from '../types';

const router: Routes = {
  users: async (msg: Context) => {
    console.log('consummer - user');
    console.log(msg);
  },
};

const app = new PubSub(new NatsProvider());
app.attachRoutes(router);
app.connect();
