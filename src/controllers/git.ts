import { Request, Response, NextFunction } from 'express';
import GitService from '@/services/git';
import { AppException, ERROR_CODE } from '@/exceptions';
import { formResponse } from '@/utils';

class GitController {
  /**
   * Get repository information
   */
  static async getRepoInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const { gitRepo } = req.params;
      const repoInfo = await GitService.getRepoInfo(gitRepo);
      res.json(formResponse(200, 'success', repoInfo));
    } catch (error) {
      next(error);
    }
  }

  /**
   * List workflows in a repository
   */
  static async listWorkflows(req: Request, res: Response, next: NextFunction) {
    try {
      const { gitRepo } = req.params;
      const workflows = await GitService.listWorkflows(gitRepo);
      res.json(formResponse(200, 'success', workflows));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Trigger a workflow
   */
  static async triggerWorkflow(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { gitRepo, workflowId } = req.params;
      const { ref, inputs } = req.body;

      const workflowRun = await GitService.triggerWorkflow(
        gitRepo,
        workflowId,
        { ref, inputs },
      );

      res.json(formResponse(200, 'success', workflowRun));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get workflow runs
   */
  static async getWorkflowRuns(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { gitRepo, workflowId } = req.params;
      const { perPage = 10 } = req.query;

      const runs = await GitService.getWorkflowRuns(
        gitRepo,
        workflowId,
        Number(perPage),
      );

      res.json(formResponse(200, 'success', runs));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get specific workflow run
   */
  static async getWorkflowRun(req: Request, res: Response, next: NextFunction) {
    try {
      const { gitRepo, runId } = req.params;
      const run = await GitService.getWorkflowRun(gitRepo, Number(runId));

      res.json(formResponse(200, 'success', run));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel workflow run
   */
  static async cancelWorkflowRun(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { gitRepo, runId } = req.params;
      await GitService.cancelWorkflowRun(gitRepo, Number(runId));

      res.json(formResponse(204, 'cancelled'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get workflow run logs
   */
  static async getWorkflowLogs(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { gitRepo, runId } = req.params;
      const logs = await GitService.getWorkflowRunLogs(gitRepo, Number(runId));

      res.json(formResponse(200, 'success', logs));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get repository branches
   */
  static async getBranches(req: Request, res: Response, next: NextFunction) {
    try {
      const { gitRepo } = req.params;
      const branches = await GitService.getBranches(gitRepo);

      res.json(formResponse(200, 'success', branches));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get commit information
   */
  static async getCommit(req: Request, res: Response, next: NextFunction) {
    try {
      const { gitRepo, sha } = req.params;
      const commit = await GitService.getCommit(gitRepo, sha);

      res.json(formResponse(200, 'success', commit));
    } catch (error) {
      next(error);
    }
  }
}

export default GitController;
