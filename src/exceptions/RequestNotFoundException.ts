import { ERROR_CODE } from './enums';
import BaseException from './BaseException';

class RequestNotFoundException extends BaseException {
  constructor(code?: ERROR_CODE | null, message?: string) {
    super(code ?? ERROR_CODE.REQUEST_NOT_FOUND, message);
  }
}

export default RequestNotFoundException;
