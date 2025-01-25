import { string } from 'aptx-validator';

class BaseValidator {
  constructor() {
    //
  }

  username() {
    return string().useRE(/^[0-9a-zA-Z]{2,18}$/);
  }
  password() {
    return string().useRE(/^[0-9a-zA-Z!@]{6,18}$/);
  }
}

export default BaseValidator;
