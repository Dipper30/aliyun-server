import jwt from 'jsonwebtoken';
import BaseService from './base';
import { APP_CONFIG } from '@/config';
import { getUnixTS } from '@/utils';
import { ERROR_CODE } from '@/exceptions/enums';
import { TokenException } from '@/exceptions';
import { Custom } from '@/types';

class Token extends BaseService {
  constructor() {
    super();
  }

  /**
   * 按照用户 id 生成token
   * @returns
   */
  async generateToken(account: { id: number }) {
    const { id } = account;
    try {
      const token = jwt.sign({ id: id }, APP_CONFIG.KEYS.TOKEN_PRIVATE_KEY, {
        expiresIn: APP_CONFIG.KEYS.TOKEN_EXPIRE_IN,
      });
      return token;
    } catch (error) {
      throw new TokenException(ERROR_CODE.TOKEN_ERROR, 'Token Generator Error');
    }
  }

  async verifyToken(token: string) {
    if (!token)
      throw new TokenException(ERROR_CODE.TOKEN_ERROR, 'Missing Token');
    let decode: Custom.TokenDecode | null = null;
    try {
      decode = jwt.verify(
        token,
        APP_CONFIG.KEYS.TOKEN_PRIVATE_KEY,
      ) as Custom.TokenDecode;
    } catch (error) {
      throw new TokenException(ERROR_CODE.TOKEN_PARSE_ERROR);
    }
    const current = getUnixTS();
    const { exp } = decode;
    // check if token has expired
    if (current > exp) throw new TokenException(ERROR_CODE.TOKEN_EXPIRED);
    return decode;
  }
}

export default new Token();
