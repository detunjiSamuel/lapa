class httpError extends Error {
  constructor(status, message, route = null) {
    super(message);
    this.status = status;
    this.route = route;
  }
}

module.exports = httpError;
