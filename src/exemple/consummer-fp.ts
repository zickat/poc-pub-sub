import { Routes } from '../types';
import { Context } from '../Context';
import { PubSubError } from '../PubSubError';
import { PubSub } from '../PubSub';
import { NatsProvider } from '../NatsProvider';
import { left, right, TaskEither } from 'fp-ts/lib/TaskEither';
import { createRoute } from '../createRoute';
import { PubSubSdk } from '../PubSubSdk';

// interfaces
interface UserRequest {
  id: string;
  name: string;
}

interface UserResponse {
  id: string;
  name: string;
  token: string;
}

// SDK

class ProfileSdk extends PubSubSdk {
  timeout = 10000;

  getUserToken(id: string, name: string) {
    return this.pubSub.request(
      `users.${id}.${name}`,
      {},
      { timeout: this.timeout },
    );
  }
}

export const profileSdk = new ProfileSdk();

// builder

const builder = (ctx: Context): TaskEither<PubSubError, UserRequest> => {
  if (!ctx.params.id || !ctx.params.name) {
    return left(new PubSubError(422, 'Params missing'));
  }

  if (ctx.params.id === '4') {
    return left(new PubSubError(500, 'id not good'));
  }

  return right({
    id: ctx.params.id,
    name: ctx.params.name,
  });
};

// controller

const userController = (
  request: UserRequest,
): TaskEither<PubSubError, UserResponse> => {
  // do stuff
  return right({
    id: request.id,
    name: request.name,
    token: `${request.id}-${request.name}`,
  });
};

//routes
// (/users/:id/:name <=> users.:id.:name) => users.*.*

const router: Routes = {
  '/users/:id/:name': createRoute(builder, userController),
};

// Middleware

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

// app setup

const app = new PubSub(new NatsProvider());
app.use(logger);
app.attachRoutes(router);
app.connect();
