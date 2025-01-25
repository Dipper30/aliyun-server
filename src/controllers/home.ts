import { NextFunction, Request, Response } from 'express';
import { HomeService } from '@/services';
import BaseController from './base';
import { formResponse } from '@/utils';

class Home extends BaseController {
  constructor() {
    super();
  }

  async getCurrentActiveUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await HomeService.getCurrentActiveUsers();
      res.json(
        formResponse(200, 'ok', {
          total: users.length,
          users: users,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async getDailyActiveUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const dau = await HomeService.getDailyActiveUsers();
      res.json(
        formResponse(200, 'ok', {
          dau,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyActiveUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const mau = await HomeService.getMonthlyActiveUsers();
      res.json(
        formResponse(200, 'ok', {
          mau,
        }),
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new Home();
