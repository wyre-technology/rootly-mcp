export class RootlyError extends Error {
  constructor(message: string, public statusCode: number, public response: unknown) {
    super(message);
    this.name = 'RootlyError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
export class AuthenticationError extends RootlyError {}
export class ForbiddenError extends RootlyError {}
export class NotFoundError extends RootlyError {}
export class ValidationError extends RootlyError {}
export class RateLimitError extends RootlyError {
  constructor(message: string, public retryAfter: number, response: unknown) {
    super(message, 429, response);
    this.name = 'RateLimitError';
  }
}
export class ServerError extends RootlyError {}
