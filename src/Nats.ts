import {
  Client,
  connect as connectNats,
  NatsConnectionOptions,
  Payload,
} from 'ts-nats';
import { formatPath } from './utils';
import { Context } from './Context';
import { NatsError } from './NatsError';
import * as events from 'events';
import { Dictionary, Middleware, NatsMessage, Router } from './types';
import { composeMiddlewares } from './composeMiddlewares';

export class Nats extends events.EventEmitter {
  nc!: Client;
  middlewares: Middleware[] = [];
  router: Router = {};
  natsCredentials: NatsConnectionOptions;

  constructor(natsCredentials: NatsConnectionOptions = {}) {
    super();
    this.natsCredentials = natsCredentials;
  }

  async connect(natsCredentials: NatsConnectionOptions = {}) {
    this.nc = await connectNats({ payload: Payload.JSON, ...natsCredentials });
    this.listenRoutes();
    this.emit('connected');
  }

  use(middleware: Middleware) {
    this.middlewares.push(middleware);
  }

  attachRoutes(router: Router) {
    this.router = {
      ...this.router,
      ...router,
    };
  }

  listenRoutes() {
    Object.entries(this.router).forEach(([path, controller]) => {
      const natsPath = formatPath(path);
      this.nc.subscribe(natsPath, async (err, msg) => {
        if (err) {
          console.log(err);
          return;
        }

        const ctx = new Context(msg as NatsMessage, path, this);

        try {
          const res = await composeMiddlewares(this.middlewares)(
            ctx,
            controller,
          );
          if (msg.reply) {
            this.nc.publish(msg.reply, { data: res || ctx.body });
          }
        } catch (e) {
          if (msg.reply) {
            this.nc.publish(msg.reply, {
              error: {
                status: e.status || 500,
                message: e.message,
              },
            });
          }
          // this.emit('error', e, ctx);
        }
      });
    });
  }

  async request(path: string, message: any, headers: Dictionary<any> = {}) {
    const timeout = headers.timeout || 10000;
    const msg = {
      headers,
      data: message,
    };

    const res = (await this.nc.request(path, timeout, msg)).data;

    if (res.error) {
      throw new NatsError(res.error.status, res.error.message);
    }

    return res.data;
  }

  requestAsync(path: string, message: any, headers: Dictionary<any> = {}) {
    const msg = {
      headers,
      data: message,
    };

    this.nc.publish(path, msg);
  }
}
