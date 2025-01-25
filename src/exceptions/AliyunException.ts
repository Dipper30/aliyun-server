import { ERROR_CODE } from '@/exceptions/enums';
import BaseException from './BaseException';

class AliyunException extends BaseException {
  constructor(
    code?: ERROR_CODE | null,
    message?: string,
    recommend?: string,
    errMsg?: string,
  ) {
    super(code ?? ERROR_CODE.ALIYUN_ERROR, message, {
      link: recommend,
      errMsg,
    });
  }
}

export default AliyunException;
