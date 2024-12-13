import { AliyunService } from '@/services';
import { NextFunction, Request, Response } from 'express';
import BaseController from './base';
import { formResponse } from '@/utils';
import { AliyunParams, Custom } from '@/types';

class Aliyun extends BaseController {
  private defaultPager: Custom.Pagination = { page: 1, size: 20 };

  constructor() {
    super();
  }

  async getRegions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AliyunService.getRegions();
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }

  async getZones(req: Request, res: Response, next: NextFunction) {
    try {
      const regionId = req.params.region;
      const result = await AliyunService.getZones(regionId, {
        abstract: true,
      });
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }

  async getInstanceStatuses(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as AliyunParams.GetInstanceStatuses;
      const result = await AliyunService.getInstanceStatuses(data);
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }

  async getInstanceDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as AliyunParams.GetInstanceDetails;
      const result = await AliyunService.getInstanceDetails(data);
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }

  async startInstance(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as AliyunParams.StartInstance;
      if (data.dryRun) {
        const { result, msg } = await AliyunService.startInstanceCheck(
          data.instanceId,
        );
        res.json(formResponse(200, msg, result));
      } else {
        const result = await AliyunService.startInstance(data.instanceId);
        res.json(formResponse(200, 'ok', result));
      }
    } catch (error) {
      next(error);
    }
  }

  async stopInstance(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as AliyunParams.StopInstance;
      if (data.dryRun) {
        const { result, msg } = await AliyunService.stopInstanceCheck({
          instanceId: data.instanceId,
          stoppedMode: data.stoppedMode as any,
        });
        res.json(formResponse(200, msg, result));
      } else {
        const result = await AliyunService.stopInstance({
          instanceId: data.instanceId,
          stoppedMode: data.stoppedMode as any,
        });
        res.json(formResponse(200, 'ok', result));
      }
    } catch (error) {
      next(error);
    }
  }

  async runCommand(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as AliyunParams.RunCommand;
      const result = await AliyunService.runCommand(data);
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }

  async getInvocationResults(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as AliyunParams.GetInvocationResults;
      const result = await AliyunService.getInvocationResults(data);
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }

  async sendFile(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as AliyunParams.SendFile;
      const result = await AliyunService.sendFile(data);
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }
}

export default new Aliyun();
