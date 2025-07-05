import { ERROR_CODE } from './enums';
import BaseException from './BaseException';

class AppException extends BaseException {
  constructor(code?: ERROR_CODE | null, message?: string) {
    super(code ?? ERROR_CODE.APP_ERROR, message);
  }
}

export default AppException;
