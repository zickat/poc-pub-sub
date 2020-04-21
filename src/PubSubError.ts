/**
 * Formatted error for pub sub message
 */
export class PubSubError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
