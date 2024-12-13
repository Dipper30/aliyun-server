import { Custom } from '@/types';
import { ERROR_CODE, ERROR_TEXT } from './enums';

class BaseException extends Error implements Custom.Exception {
  code: number;
  errMsg?: string;
  msg: string;
  options?: {
    errMsg?: string;
    link?: string;
    data?: any;
    rawError?: any;
  };

  constructor(
    code?: ERROR_CODE,
    message?: string,
    options?: {
      errMsg?: string;
      link?: string;
      data?: any;
      rawError?: any;
    },
  ) {
    super();
    this.code = code ?? 500;
    this.errMsg = options?.errMsg;
    this.msg = message ?? ERROR_TEXT[this.code as ERROR_CODE];
    this.options = options;
  }
}

export default BaseException;
