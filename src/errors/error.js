class StuError extends Error {
  constructor(message, type) {
    super(message);
    this.code = "STU_API_ERROR";
    this.type = type;
    return this;
  }
}

export default StuError;
