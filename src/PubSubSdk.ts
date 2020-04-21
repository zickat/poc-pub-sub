import { PubSub } from './PubSub';

/**
 * A class to wrap all Sdk
 */
export abstract class PubSubSdk {
  pubSub!: PubSub;

  init(pubSub: PubSub) {
    this.pubSub = pubSub;
  }
}
