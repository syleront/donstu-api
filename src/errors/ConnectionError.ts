import { StuError } from "./StuError";

export class ConnectionError extends StuError {
  private status: number | string;

  constructor(status: number | string) {
    super(`Connection error, can't reach the server, status: ${status}`, "CONNECTION_ERROR");
    this.status = status;
    return this;
  }
}
