import { UserService } from '@/services';
import { NextFunction, Request, Response } from 'express';
import BaseController from './base';
import { formResponse } from '@/utils';
import { Custom } from '@/types';

class User extends BaseController {
  private defaultPager: Custom.Pagination = { page: 1, size: 20 };

  constructor() {
    super();
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const user = await UserService.getUserById(id);
      req.user?.id;
      res.json(formResponse(200, 'ok', user));
    } catch (error) {
      next(error);
    }
  }
}

export default new User();
