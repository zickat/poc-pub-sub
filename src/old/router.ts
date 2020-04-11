import {Payload, connect as connectNats, Client, Msg} from 'ts-nats';

let nc: Client;

export type AsyncController = (msg: Msg) => Promise<void>
export type ControllerWithResponse = (msg: Msg) => Promise<any>

export const connect = async () => {
  nc = await connectNats({ payload: Payload.JSON });
};

export const addAsyncRoute = (path: string, controller: AsyncController) => {
  return nc.subscribe(path, (err, msg) => {
    if (err) {
      console.log(err);
    } else {
      controller(msg);
    }
  });
};

export const sendAsyncMessage = (path: string, message: any) => {
  nc.publish(path, message);
};

export const addRouteWithRespone = (path: string, controller: ControllerWithResponse) => {
  return nc.subscribe(path, async (err, msg) => {
    if (err) {
      console.log(err);
    } else if(msg.reply){
      const res = await controller(msg);
      nc.publish(msg.reply, res);
    } else {
      console.error('no reply provided');
    }
  });
};


export const sendMessageWithResponse = async (path: string, message: any, timeout = 10000) => {
  return await nc.request(path, timeout, message);
};