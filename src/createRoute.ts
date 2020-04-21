import { PubSubError } from './PubSubError';
import { TaskEither, fold, chain } from 'fp-ts/lib/TaskEither';
import { Context } from './Context';
import * as T from 'fp-ts/lib/Task';
import { Route } from './types';
import { pipe } from 'fp-ts/lib/pipeable';

export type RequestBuilder<REQUEST> = (
  ctx: Context,
) => TaskEither<PubSubError, REQUEST>;

export type RouteController<REQUEST, RESPONSE> = (
  request: REQUEST,
) => TaskEither<PubSubError, RESPONSE>;

export type RouteControllerNoEntry<RESPONSE> = () => TaskEither<
  PubSubError,
  RESPONSE
>;

export type KoaRouteController<RESPONSE> = (
  ctx: Context,
) => TaskEither<PubSubError, RESPONSE>;

/**
 * Fold route to create make it a task
 */
const foldRoute = <RESPONSE>() => {
  return fold<PubSubError, RESPONSE, RESPONSE>(
    (errorCase: PubSubError) => {
      throw errorCase;
    },
    successCase => {
      return T.of(successCase);
    },
  );
};

/**
 * Create a route with a builder to deal with route entries, and controller
 * @param builder
 * @param f
 */
export const createRoute = <REQUEST, RESPONSE>(
  builder: RequestBuilder<REQUEST>,
  f: RouteController<REQUEST, RESPONSE>,
): Route => async (ctx: Context) => {
  let res;
  try {
    res = await pipe(builder(ctx), chain(f), foldRoute())();
  } catch (e) {
    throw e;
  }

  return res;
};

/**
 * Create a route without route entry
 * @param f
 */
export const createRouteWithoutEntry = <RESPONSE>(
  f: RouteControllerNoEntry<RESPONSE>,
): Route => async () => {
  let res;
  try {
    res = await pipe(f(), foldRoute())();
  } catch (e) {
    throw e;
  }

  return res;
};
