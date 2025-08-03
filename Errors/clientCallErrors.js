// this will hold all of the errors thrown by an invalid request
class ValidationError extends Error {
  constructor(message, details = []) {
    super(message);
    this.name = "ValidationError";
    this.status = 400; // so your error-handler middleware can pick it up
    this.details = details; // optional array of { param, msg }
  }
}

module.exports = ValidationError;
