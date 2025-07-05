import { ERROR_CODE } from './enums';
import BaseException from './BaseException';

class GitException extends BaseException {
  constructor(code?: ERROR_CODE | null, message?: string, error?: any) {
    super(code ?? ERROR_CODE.GIT_ERROR, message, {
      errMsg: error?.data?.message,
      data: error.data,
    });
  }
}

export default GitException;
