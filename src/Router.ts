import { Dictionary, Middleware, Routes } from './types';
import { PubSub } from './PubSub';

/**
 * class to create a router and attach it to the app
 */
export class Router {
  routes: Routes = {};

  constructor(routes: Dictionary<Middleware>) {
    this.routes = routes;
  }

  attach(app: PubSub) {
    app.attachRouter(this);
  }
}
