import { AliyunService, CdnService, VoiceService } from '@/services';
import { NextFunction, Request, Response } from 'express';
import BaseController from './base';
import { formResponse } from '@/utils';
import { AliyunParams, Custom } from '@/types';

class AliyunCdn extends BaseController {
  constructor() {
    super();
  }

  async getSts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CdnService.getStsToken({ user: req.user });
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }

  async getBuckets(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CdnService.getBuckets();
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }

  async getBucketDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CdnService.getBucketDetail(req.params.name);
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }

  async getPresignedUrlForOss(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CdnService.getPresignedUrlForOss(req.body);
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }

  async getFiles(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CdnService.getFilesByDir(req.body);
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }

  async getFilePresignedUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CdnService.getFilePresignedUrl(req.body);
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }

  async saveBucketFile(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CdnService.saveFile(req.body, req.user);
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }

  async deleteBucketFiles(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CdnService.deleteFiles(req.body, req.user);
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }

  async createBucketDirectory(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CdnService.createBucketDirectory(req.body, req.user);
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }

  async startTTSTask(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await VoiceService.startTask(req.body);
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }
}

export default new AliyunCdn();
