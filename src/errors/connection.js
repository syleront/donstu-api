import StuError from "./error";

class ConnectionError extends StuError {
  constructor(statusCode) {
    super(`Connection error, can't reach the server, statusCode: ${statusCode}`, "CONNECTION_ERROR");
    this.statusCode = statusCode;
    return this;
  }
}

export default ConnectionError;
