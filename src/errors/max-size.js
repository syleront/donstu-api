import StuError from "./error";

class MaxSizeError extends StuError {
  constructor() {
    super("Response max size limit reached", "MAX_SIZE_ERROR");
    return this;
  }
}

export default MaxSizeError;
