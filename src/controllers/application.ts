import { AppService, GitService } from '@/services';
import { NextFunction, Request, Response } from 'express';
import BaseController from './base';
import { formResponse } from '@/utils';
import { V1Params } from '@/types';

class Application extends BaseController {
  constructor() {
    super();
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AppService.create(req.body, req.user);
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }

  async query(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AppService.query(req.body, req.user);
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }

  async insertInstance(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AppService.insertInstance(req.body, req.user);
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }

  async getRepoInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const { appId } = req.body as V1Params.GetGitWorkflows;
      const app = await AppService.findActiveOrThrow(appId);
      const result = await GitService.getRepoInfo(app.gitRepo);
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }

  async listGitWorkflows(req: Request, res: Response, next: NextFunction) {
    try {
      const { appId } = req.body as V1Params.GetGitWorkflows;
      const app = await AppService.findActiveOrThrow(appId);
      const result = await GitService.listWorkflows(app.gitRepo);
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }

  async triggerGitWorkflow(req: Request, res: Response, next: NextFunction) {
    try {
      const { appId, workflowId } = req.body as V1Params.TriggerWorkflow;
      const app = await AppService.findActiveOrThrow(appId);
      const result = await GitService.triggerWorkflow(app.gitRepo, workflowId, {
        inputs: {
          region_id: 'cn-shanghai',
        },
      });
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }

  async listGitWorkflowRuns(req: Request, res: Response, next: NextFunction) {
    try {
      const { appId, workflowId } = req.body as V1Params.ListGitWorkflowRuns;
      const app = await AppService.findActiveOrThrow(appId);
      const result = await GitService.getWorkflowRuns(app.gitRepo, workflowId);
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }

  async getGitWorkflowRun(req: Request, res: Response, next: NextFunction) {
    try {
      const { appId, runId } = req.body as V1Params.GetGitWorkflowRun;
      const app = await AppService.findActiveOrThrow(appId);
      const result = await GitService.getWorkflowRun(app.gitRepo, runId);
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }

  async listGitWorkflowRunJobs(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { appId, runId } = req.body as V1Params.GetGitWorkflowRun;
      const app = await AppService.findActiveOrThrow(appId);
      const result = await GitService.listWorkflowRunJobs(app.gitRepo, runId);
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }

  async getGitWorkflowRunJobDetail(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { appId, jobId } = req.body as V1Params.GetGitWorkflowRunJobLogs;
      const app = await AppService.findActiveOrThrow(appId);
      const result = await GitService.getWorkflowRunJobDetail(
        app.gitRepo,
        jobId,
      );
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }

  async getGitWorkflowRunJobLogs(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { appId, jobId } = req.body as V1Params.GetGitWorkflowRunJobLogs;
      const app = await AppService.findActiveOrThrow(appId);
      const result = await GitService.getWorkflowRunJobLogs(app.gitRepo, jobId);
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }

  async getGitWorkflowRunLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { appId, runId } = req.body as V1Params.GetGitWorkflowRun;
      const app = await AppService.findActiveOrThrow(appId);
      const result = await GitService.getWorkflowRunLogs(app.gitRepo, runId);
      res.json(formResponse(200, 'ok', result));
    } catch (error) {
      next(error);
    }
  }
}

export default new Application();
