export class TokenExpiredError extends Error {
  constructor() {
    super('The token has expired. Please login again');
  }
}

export class TokenMissingError extends Error {
  constructor() {
    super('No token found. Please login.');
  }
}
