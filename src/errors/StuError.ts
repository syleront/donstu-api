export class StuError extends Error {
  public code = "STU_API_ERROR";
  public type: string;

  constructor(message: string, type: string) {
    super(message);
    this.type = type;
    return this;
  }
}
