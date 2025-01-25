import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TokenException } from '@/exceptions';
import { APP_CONFIG } from '@/config';
import { getUnixTS } from '@/utils';
import { ERROR_CODE } from '@/exceptions/enums';
import { AuthService } from '@/services';

const tokenVerifier = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // ignore path
  if (
    [
      '/api/v1/login',
      '/api/v1/autoLogin',
      '/api/v1/usernameAvailability',
    ].includes(req.path)
  ) {
    return next();
  }

  const { token } = req.headers;
  if (!token || typeof token !== 'string')
    return next(new TokenException(ERROR_CODE.TOKEN_ERROR, 'Missing Token'));
  let decode: any = null;
  try {
    decode = jwt.verify(token, APP_CONFIG.KEYS.TOKEN_PRIVATE_KEY) || {};
    if (!decode) new TokenException(ERROR_CODE.TOKEN_PARSE_ERROR);
  } catch (error) {
    return next(new TokenException(ERROR_CODE.TOKEN_PARSE_ERROR));
  }
  const { id, exp } = decode;
  const current = getUnixTS();
  if (current > exp) return next(new TokenException(ERROR_CODE.TOKEN_EXPIRED));

  try {
    const userInfo = await AuthService.getUserById(id);
    // append user data to request
    req.user = {
      id,
      rid: userInfo.rid,
      auth: userInfo.auth || [],
    };
    // console.log('Request User: ', req.user);
    next();
  } catch (error: any) {
    console.error('Auth Error: ', error);
    return next(error);
  }
};

export default tokenVerifier;
