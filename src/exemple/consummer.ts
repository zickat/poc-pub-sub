import { Nats } from '../Nats';
import { Router } from '../types';

const router: Router = {
  users: async (msg: any) => {
    console.log('consummer - user');
    console.log(msg);
  },
};

(async () => {
  // let nc = await connect({ payload: Payload.JSON });

  // let sub = await nc.subscribe('greeting', (err, msg) => {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     // do something with msg.data
  //     console.log(msg);
  //   }
  // });

  // await connect();
  // await addAsyncRoute('user', async msg => {
  //   console.log({
  //     msg,
  //  });
  // });
  const app = new Nats();
  await app.connect();
  app.attachRoutes(router);
})();
