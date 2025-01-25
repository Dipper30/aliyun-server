import { ERROR_CODE } from '@/exceptions/enums';
import BaseException from './BaseException';

class CdnException extends BaseException {
  constructor(
    code?: ERROR_CODE | null,
    message?: string,
    recommend?: string,
    errMsg?: string,
  ) {
    super(code ?? ERROR_CODE.ALIYUN_CDN_ERROR, message, {
      errMsg,
    });
  }
}

export default CdnException;
