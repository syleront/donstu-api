import StuError from "./error";

class ConnectionError extends StuError {
  constructor(statusCode) {
    super("CONNECTION_ERROR");
    this.statusCode = statusCode;
    return this;
  }
}

export default ConnectionError;
