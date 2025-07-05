import { Request, Response, NextFunction } from 'express';
import { AliyunService, InstanceService } from '@/services';
import { Custom, V1Params } from '@/types';
import { formResponse } from '@/utils';
import { ERROR_CODE } from '@/exceptions';
import BaseController from './base';

class InstanceController extends BaseController {
  constructor() {
    super();
  }

  /**
   * 删除实例
   */
  async deleteInstance(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const success = await InstanceService.deleteInstance(parseInt(id));

      if (!success) {
        return res.status(404).json(formResponse(404, '实例不存在', null));
      }

      res.json(formResponse(200, '删除实例成功', null));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 搜索实例
   */
  async searchInstances(req: Request, res: Response, next: NextFunction) {
    try {
      const { keyword, pagination } = req.body as V1Params.SearchInstances;

      const result = await InstanceService.searchInstances(keyword, {
        pagination,
      });

      res.json(formResponse(200, '搜索实例成功', result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 同步实例状态
   */
  async syncInstanceStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { instanceId, regionId } = req.body as V1Params.SyncInstanceStatus;

      const result = await InstanceService.syncInstanceStatus(
        regionId,
        instanceId,
        req.user,
      );

      res.json(formResponse(200, '实例状态同步成功', result));
    } catch (error) {
      next(error);
    }
  }
}

export default new InstanceController();
