// import { connect, Payload } from 'ts-nats';

import { connect, sendAsyncMessage, sendMessageWithResponse } from '../old/router';
import {Nats} from "../Nats";

(async () => {
  // let nc = await connect({ payload: Payload.JSON });
  // nc.publish('greeting', { data: 'hello world! 1' });
  // const res = await nc.request('greeting', 10000, { data: 'hello world! 1' });
  // console.log(res);

  // await connect();
  // sendAsyncMessage('user', 'Hello 1');
  // const res = await sendMessageWithResponse('user', 'Hello 2');
  // console.log(res);

  const app = new Nats();
  await app.connect();
  app.requestAsync('users.2.5', 'Hello 1');

  try {
    const res = await app.request('users.1.4', 'Hello 2');
    console.log(res);
  } catch (e) {
    console.log(e);
  }
  process.exit(0);
})();
