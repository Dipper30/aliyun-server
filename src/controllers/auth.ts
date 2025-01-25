import { AuthService, TokenService } from '@/services';
import { formResponse } from '@/utils';
import { NextFunction, Request, Response } from 'express';
import BaseController from './base';
import { Custom } from '@/types';

class Auth extends BaseController {
  constructor() {
    super();
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;
      const user = await AuthService.loginAccount({ username, password });
      const token = await TokenService.generateToken({
        id: user.id,
      });

      res.json(
        formResponse(200, 'signed in', {
          user,
          token,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async autoLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      const result: Custom.TokenDecode = await TokenService.verifyToken(token);
      const user = await AuthService.getUserById(result.id);
      const newToken = await TokenService.generateToken({
        id: user.id,
      });

      res.json(
        formResponse(200, 'ok', {
          user,
          token: newToken,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO
      res.json(formResponse(200, 'ok'));
    } catch (error) {
      next(error);
    }
  }

  async isUsernameAvailable(req: Request, res: Response, next: NextFunction) {
    try {
      const available = await AuthService.isUsernameExisting(req.body.username);

      res.json(formResponse(200, 'ok', !available));
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getUserById(Number(req.params.id));
      res.json(formResponse(200, 'ok', user));
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await AuthService.getUsers(req.body);
      res.json(formResponse(200, 'ok', users));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 由超级管理员创建管理员账号
   * @param req
   * @param res
   * @param next
   */
  async createAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password, rid } = req.body;
      const uid = await AuthService.createAccount({
        username,
        password,
        rid,
        cid: req.user?.id || undefined,
      });

      res.json(formResponse(201, 'account created', { uid }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 修改用户账号信息
   */
  async updateUserAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await AuthService.updateUserAccount(req.body, req.user);
      const token = await TokenService.generateToken({
        id: updated.id,
      });

      res.json(
        formResponse(201, 'user info updated', {
          user: updated,
          token,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async createAuthority(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, name, description } = req.body;
      const auth = await AuthService.createAuthority({ id, name, description });

      res.json(
        formResponse(201, 'auth created', {
          auth,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async getAuthorities(req: Request, res: Response, next: NextFunction) {
    try {
      const auth = await AuthService.getAuthorities(req.query);

      res.json(
        formResponse(200, 'ok', {
          auth,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async updateAuthority(req: Request, res: Response, next: NextFunction) {
    try {
      const auth = await AuthService.updateAuthority(req.body);

      res.json(
        formResponse(201, 'auth updated', {
          auth,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await AuthService.createRole(req.body);

      res.json(
        formResponse(200, 'role created', {
          role,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async getRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await AuthService.getRoles(req.query);

      res.json(
        formResponse(200, 'ok', {
          roles,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async getAdminRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await AuthService.getAdminRoles();

      res.json(
        formResponse(200, 'ok', {
          roles,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await AuthService.updateRole(req.body);

      res.json(
        formResponse(201, 'role updated', {
          role,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await AuthService.updateUserRole(req.body);

      res.json(
        formResponse(201, 'role updated', {
          role,
        }),
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new Auth();
