import { Middleware } from './types';
import { Context } from './Context';

/**
 * Call all middleware to be called in the right order
 * Inspired by https://github.com/koajs/compose
 * @param middlewares
 */
export const composeMiddlewares = (middlewares: Middleware[]) => {
  return function(context: Context, next: Middleware) {
    // last called middleware #
    let index = -1;
    return dispatch(0);

    async function dispatch(i: number): Promise<any> {
      if (i <= index) throw new Error('next() called multiple times');
      index = i;
      let fn = middlewares[i];
      if (i === middlewares.length) fn = next;
      if (!fn) return;
      try {
        const res = await fn(context, dispatch.bind(null, i + 1));
        if (res) {
          context.body = res;
        }
        return res;
      } catch (err) {
        throw err;
      }
    }
  };
};
