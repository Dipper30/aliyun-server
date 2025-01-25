import { Request, Response, NextFunction } from 'express';
import { AuthException } from '@/exceptions';
import { ERROR_CODE } from '@/exceptions/enums';

/**
 * 返回权限校验中间件，用于判断请求是否满足接口权限要求
 * @param { auth?: number[], role?: number[] } options
 */
const authChecker = (options: { auth?: number[]; role?: number[] }) => {
  return async function (req: Request, res: Response, next: NextFunction) {
    const { auth, role } = options;
    const { user } = req;
    if (!user) {
      next(new AuthException(ERROR_CODE.AUTH_ERROR, 'No User Info'));
    }

    if (auth) {
      // 判断用户权限是否包含全部auth
      for (const authToCheck of auth) {
        if (!user.rid || !user.auth.includes(authToCheck))
          next(new AuthException(ERROR_CODE.AUTH_ERROR, 'Not Authorized'));
      }
    }
    if (role) {
      // 判断用户角色是否满足其中一个角色
      if (!role.includes(user.rid))
        next(new AuthException(ERROR_CODE.AUTH_ERROR, 'Not Authorized'));
    }

    next();
  };
};

export default authChecker;
