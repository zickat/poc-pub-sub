import { formatPath } from './utils';
import { Context } from './Context';
import { PubSubError } from './PubSubError';
import * as events from 'events';
import {
  Dictionary,
  Middleware,
  PubSubMessage,
  PubSubProvider,
  Routes,
} from './types';
import { composeMiddlewares } from './composeMiddlewares';
import { Router } from './Router';

/**
 * The PubSub main class
 * Take the provider and allow to do all Pub sub stuff
 */
export class PubSub extends events.EventEmitter {
  /**
   * The pub sub provider used under the hood
   */
  provider: PubSubProvider;

  /**
   * All middlewares to execute on all routes
   */
  middlewares: Middleware[] = [];

  /**
   * All route to listen
   */
  router: Routes = {};

  /**
   * Create Pub Sub instance
   * @param provider
   */
  constructor(provider: PubSubProvider) {
    super();
    this.provider = provider;
  }

  /**
   * Connect to the provider and start listening to routes
   */
  async connect() {
    await this.provider.connect();
    this.listenRoutes();
    this.emit('connected');
  }

  /**
   * Add a Middleware
   * @param middleware
   */
  use(middleware: Middleware) {
    this.middlewares.push(middleware);
  }

  /**
   * Add all routes from a router to current routes
   * @param router
   */
  attachRouter(router: Router) {
    this.router = {
      ...this.router,
      ...router.routes,
    };
  }

  /**
   * Add all routes to current routes
   * @param routes
   */
  attachRoutes(routes: Routes) {
    this.router = {
      ...this.router,
      ...routes,
    };
  }

  /**
   * Start listening to all current routes
   */
  listenRoutes() {
    Object.entries(this.router).forEach(([path, controller]) => {
      const formattedPath = formatPath(path);
      console.log(`Subscribe on ${formattedPath}`);
      this.provider.subscribe(
        formattedPath,
        async (err: Error | null, msg: PubSubMessage | null) => {
          if (err || !msg) {
            console.log(err);
            return;
          }

          const ctx = new Context(msg, path, this);

          try {
            const res = await composeMiddlewares(this.middlewares)(
              ctx,
              controller,
            );
            if (msg.headers.reply) {
              this.provider.publish(msg.headers.reply, {
                data: res || ctx.body,
                headers: {},
              });
            }
          } catch (e) {
            if (msg.headers.reply) {
              this.provider.publish(msg.headers.reply, {
                headers: {},
                data: {
                  error: {
                    status: e.status || 500,
                    message: e.message,
                  },
                },
              });
            }
            // this.emit('error', e, ctx);
          }
        },
      );
    });
  }

  /**
   * Make a request and wait for a response by a listener
   * @param path
   * @param message
   * @param headers
   */
  async request(path: string, message: any, headers: Dictionary<any> = {}) {
    const timeout = headers.timeout || 10000;
    const msg = {
      headers,
      data: message,
    };

    const res = (await this.provider.request(path, msg, timeout)).data;

    if (res.error) {
      throw new PubSubError(res.error.status, res.error.message);
    }

    return res;
  }

  /**
   * Make a request that doesn't wait for any response
   * @param path
   * @param message
   * @param headers
   */
  requestAsync(path: string, message: any, headers: Dictionary<any> = {}) {
    const msg = {
      headers,
      data: message,
    };

    this.provider.publish(path, msg);
  }
}
