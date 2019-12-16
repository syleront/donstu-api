class StuError {
  constructor(type) {
    this.code = "STU_API_ERROR";
    this.type = type;
    return this;
  }
}

export default StuError;
