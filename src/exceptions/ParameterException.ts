import { ERROR_CODE } from '@/exceptions/enums';
import BaseException from './BaseException';

class ParameterException extends BaseException {
  constructor(code?: ERROR_CODE | null, message?: string) {
    super(code ?? ERROR_CODE.PARAMETER_ERROR, message);
  }
}

export default ParameterException;
