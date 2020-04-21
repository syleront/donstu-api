import StuError from "./error";

class ConnectionError extends StuError {
  constructor(status) {
    super(`Connection error, can't reach the server, status: ${status}`, "CONNECTION_ERROR");
    this.status = status;
    return this;
  }
}

export default ConnectionError;
