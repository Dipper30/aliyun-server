import BaseService from './base';
import { AppException, ERROR_CODE, GitException } from '@/exceptions';

import { APP_CONFIG } from '@/config';
import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  AxiosRequestConfig,
} from 'axios';
import { Github } from '@/types';
import logger from '@/utils/logger';

export interface WorkflowTriggerParams {
  ref?: string; // branch, tag, or commit SHA
  inputs?: Record<string, string>; // workflow inputs
}

export interface DeploymentParams {
  ref: string;
  environment?: string;
  description?: string;
  payload?: Record<string, any>;
  auto_merge?: boolean;
  required_contexts?: string[];
}

class Git extends BaseService {
  client: AxiosInstance;

  constructor() {
    super();
    this.client = this.wrapClient(
      axios.create({
        baseURL: 'https://api.github.com',
        headers: {
          Authorization: `Bearer ${APP_CONFIG.GIT.GITHUB_APP_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application / vnd.github + json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }),
    );
    // this.client = new Octokit({ auth: APP_CONFIG.GIT.GITHUB_APP_TOKEN });
  }

  private wrapClient(client: AxiosInstance) {
    client.interceptors.request.use((request) => {
      let dataToLog = request.data || {};
      if (request.data) {
        const sensitiveKeys = [
          'password',
          'token',
          'secret',
          'api_key',
          'authorization',
        ];

        // 屏蔽敏感数据
        if (typeof dataToLog === 'object' && dataToLog !== null) {
          dataToLog = { ...dataToLog }; // 浅拷贝，避免修改原始数据
          sensitiveKeys.forEach((key) => {
            if (dataToLog.hasOwnProperty(key)) {
              dataToLog[key] = '***[MASKED]***';
            }
          });
        }
      }
      logger.debug(
        `Github API Request: ${request.method} ${request.url} ${JSON.stringify(dataToLog)}`,
      );
      return request;
    });
    client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          logger.error(
            `GitHub API Error ${error.response.status}:`,
            error.response.data,
          );
        } else if (error.request) {
          logger.error('GitHub API No response received:', error.request);
        } else {
          logger.error('GitHub API Error setting up request:', error.message);
        }
        return Promise.reject(error);
      },
    );
    return client;
  }

  /**
   * Parse GitHub repository URL to extract owner and repo
   */
  private parseRepoUrl(gitRepo: string): { owner: string; repo: string } {
    // Handle different GitHub URL formats
    const patterns = [
      /github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/,
      /^([^/]+)\/([^/]+)$/,
    ];

    for (const pattern of patterns) {
      const match = gitRepo.match(pattern);
      if (match) {
        return {
          owner: match[1],
          repo: match[2].replace('.git', ''),
        };
      }
    }

    throw new AppException(
      ERROR_CODE.PARAMETER_ERROR,
      'Invalid GitHub repository URL format',
    );
  }

  /**
   * Get repository information
   */
  async getRepoInfo(gitRepo: string) {
    try {
      const { owner, repo } = this.parseRepoUrl(gitRepo);
      const response = await this.client.request({
        method: 'get',
        url: `/repos/${owner}/${repo}`,
      });
      return response.data as Github.RepoInfo;
    } catch (error: any) {
      throw new GitException(
        null,
        `Failed to get repository info: ${error.message}`,
        error?.response,
      );
    }
  }

  /**
   * List available workflows in a repository
   */
  async listWorkflows(gitRepo: string) {
    try {
      const { owner, repo } = this.parseRepoUrl(gitRepo);
      const response = await this.client.request({
        method: 'get',
        url: `/repos/${owner}/${repo}/actions/workflows`,
      });
      return response.data.workflows as Github.Workflow[];
    } catch (error: any) {
      throw new GitException(
        null,
        `Failed to list workflows: ${error.message}`,
        error?.response,
      );
    }
  }

  /**
   * Trigger a workflow run
   */
  async triggerWorkflow(
    gitRepo: string,
    workflowId: string | number,
    params: WorkflowTriggerParams = {},
  ): Promise<Github.WorkflowRun> {
    try {
      const { owner, repo } = this.parseRepoUrl(gitRepo);
      await this.client.request({
        method: 'post',
        url: `/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`,
        data: {
          ref: params.ref || 'master',
          inputs: params.inputs || {},
        },
      });

      // Get the triggered workflow run
      const { rows, count } = await this.getWorkflowRuns(gitRepo, workflowId);
      return rows?.[0]; // Return the most recent run
    } catch (error: any) {
      throw new GitException(
        null,
        `Failed to trigger workflow: ${error.message}`,
        error?.response,
      );
    }
  }

  /**
   * Get workflow runs for a specific workflow
   */
  async getWorkflowRuns(
    gitRepo: string,
    workflowId: string | number,
    perPage: number = 10,
  ) {
    try {
      const { owner, repo } = this.parseRepoUrl(gitRepo);
      const response = await this.client.request({
        method: 'get',
        url: `/repos/${owner}/${repo}/actions/workflows/${workflowId}/runs`,
        data: {
          per_page: perPage,
        },
      });
      return {
        count: response.data.total_count as number,
        rows: response.data.workflow_runs as Github.WorkflowRun[],
      };
    } catch (error: any) {
      throw new GitException(
        null,
        `Failed to get workflow runs: ${error.message}`,
        error?.response,
      );
    }
  }

  async listWorkflowRunJobs(gitRepo: string, runId: number) {
    try {
      const { owner, repo } = this.parseRepoUrl(gitRepo);
      const response = await this.client.request({
        method: 'get',
        url: `/repos/${owner}/${repo}/actions/runs/${runId}/jobs`,
      });

      const result = response.data as {
        total_count: number;
        jobs: Github.WorkflowRunJob[];
      };
      return {
        count: result.total_count,
        rows: result.jobs,
      };
    } catch (error: any) {
      throw new GitException(
        null,
        `Failed to get workflow run: ${error.message}`,
        error?.response,
      );
    }
  }

  /**
   * Get a specific workflow run
   */
  async getWorkflowRun(
    gitRepo: string,
    runId: number,
    options?: {
      withJobs?: boolean;
    },
  ): Promise<Github.WorkflowRun> {
    try {
      const { owner, repo } = this.parseRepoUrl(gitRepo);
      const response = await this.client.request({
        method: 'get',
        url: `/repos/${owner}/${repo}/actions/runs/${runId}`,
        data: {
          owner,
          repo,
          run_id: runId,
        },
      });

      return response.data as Github.WorkflowRun;
    } catch (error: any) {
      throw new GitException(
        null,
        `Failed to get workflow run: ${error.message}`,
        error?.response,
      );
    }
  }

  /**
   * Cancel a workflow run
   */
  async cancelWorkflowRun(gitRepo: string, runId: number): Promise<boolean> {
    try {
      const { owner, repo } = this.parseRepoUrl(gitRepo);
      const response = await this.client.request({
        method: 'post',
        url: `/repos/${owner}/${repo}/runs/${runId}/cancel`,
      });
      logger.info(`Cancel Workflow Run Response Status: ${response.status}`);
      return response.status === 204;
    } catch (error: any) {
      throw new GitException(
        null,
        `Failed to cancel workflow run: ${error.message}`,
        error?.response,
      );
    }
  }

  /**
   * Get workflow job detail
   */
  async getWorkflowRunJobDetail(gitRepo: string, jobId: number) {
    try {
      const { owner, repo } = this.parseRepoUrl(gitRepo);
      const response = await this.client.request({
        method: 'get',
        url: `/repos/${owner}/${repo}/actions/jobs/${jobId}`,
      });

      return response.data as Github.WorkflowRunJob;
    } catch (error: any) {
      throw new GitException(
        null,
        `Failed to get workflow job logs: ${error.message}`,
        error?.response,
      );
    }
  }

  /**
   * Get workflow job logs
   */
  async getWorkflowRunJobLogs(gitRepo: string, jobId: number): Promise<string> {
    try {
      const { owner, repo } = this.parseRepoUrl(gitRepo);
      const response = await this.client.request({
        method: 'get',
        url: `/repos/${owner}/${repo}/actions/jobs/${jobId}/logs`,
      });

      return response.data as string;
    } catch (error: any) {
      throw new GitException(
        null,
        `Failed to get workflow job logs: ${error.message}`,
        error?.response,
      );
    }
  }

  /**
   * Get workflow run logs
   */
  async getWorkflowRunLogs(gitRepo: string, runId: number): Promise<string> {
    try {
      const { owner, repo } = this.parseRepoUrl(gitRepo);
      const response = await this.client.request({
        method: 'get',
        url: `/repos/${owner}/${repo}/actions/runs/${runId}/logs`,
      });

      return response.data as string;
    } catch (error: any) {
      throw new GitException(
        null,
        `Failed to get workflow logs: ${error.message}`,
        error?.response,
      );
    }
  }

  //   /**
  //    * Create a deployment
  //    */
  //   async createDeployment(
  //     gitRepo: string,
  //     params: DeploymentParams,
  //   ): Promise<any> {
  //     try {
  //       const { owner, repo } = this.parseRepoUrl(gitRepo);
  //       const response = await this.client.request(
  //         'POST /repos/{owner}/{repo}/deployments',
  //         {
  //           owner,
  //           repo,
  //           ref: params.ref,
  //           environment: params.environment || 'production',
  //           description: params.description || 'Deployment triggered via API',
  //           payload: params.payload || {},
  //           auto_merge: params.auto_merge || false,
  //           required_contexts: params.required_contexts || [],
  //         },
  //       );
  //       return response.data;
  //     } catch (error: any) {
  //       throw new AppException(
  //         ERROR_CODE.PARAMETER_ERROR,
  //         `Failed to create deployment: ${error.message}`,
  //       );
  //     }
  //   }

  //   /**
  //    * Get deployment status
  //    */
  //   async getDeploymentStatus(
  //     gitRepo: string,
  //     deploymentId: number,
  //   ): Promise<any> {
  //     try {
  //       const { owner, repo } = this.parseRepoUrl(gitRepo);
  //       const response = await this.client.request(
  //         'GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses',
  //         {
  //           owner,
  //           repo,
  //           deployment_id: deploymentId,
  //         },
  //       );
  //       return response.data;
  //     } catch (error: any) {
  //       throw new AppException(
  //         ERROR_CODE.PARAMETER_ERROR,
  //         `Failed to get deployment status: ${error.message}`,
  //       );
  //     }
  //   }

  /**
   * Get repository branches
   */
  async getBranches(gitRepo: string): Promise<any[]> {
    try {
      const { owner, repo } = this.parseRepoUrl(gitRepo);
      const response = await this.client.request({
        method: 'get',
        url: `/repos/${owner}/${repo}/branches`,
      });

      return response.data;
    } catch (error: any) {
      throw new GitException(
        null,
        `Failed to get branches: ${error.message}`,
        error?.response,
      );
    }
  }

  //   /**
  //    * Get repository tags
  //    */
  //   async getTags(gitRepo: string): Promise<any[]> {
  //     try {
  //       const { owner, repo } = this.parseRepoUrl(gitRepo);
  //       const response = await this.client.request(
  //         'GET /repos/{owner}/{repo}/tags',
  //         {
  //           owner,
  //           repo,
  //         },
  //       );
  //       return response.data;
  //     } catch (error: any) {
  //       throw new AppException(
  //         ERROR_CODE.PARAMETER_ERROR,
  //         `Failed to get tags: ${error.message}`,
  //       );
  //     }
  //   }

  /**
   * Get commit information
   */
  async getCommit(gitRepo: string, sha: string): Promise<any> {
    try {
      const { owner, repo } = this.parseRepoUrl(gitRepo);
      const response = await this.client.request({
        method: 'get',
        url: `/repos/${owner}/${repo}/commits/${sha}`,
      });
      return response.data;
    } catch (error: any) {
      throw new GitException(
        null,
        `Failed to get commit: ${error.message}`,
        error?.response,
      );
    }
  }

  //   /**
  //    * Get repository status checks for a commit
  //    */
  //   async getStatusChecks(gitRepo: string, sha: string): Promise<any> {
  //     try {
  //       const { owner, repo } = this.parseRepoUrl(gitRepo);
  //       const response = await this.client.request(
  //         'GET /repos/{owner}/{repo}/commits/{sha}/check-runs',
  //         {
  //           owner,
  //           repo,
  //           sha,
  //         },
  //       );
  //       return response.data;
  //     } catch (error: any) {
  //       throw new AppException(
  //         ERROR_CODE.PARAMETER_ERROR,
  //         `Failed to get status checks: ${error.message}`,
  //       );
  //     }
  //   }

  //   /**
  //    * Wait for workflow completion with timeout
  //    */
  //   async waitForWorkflowCompletion(
  //     gitRepo: string,
  //     runId: number,
  //     timeoutMs: number = 300000, // 5 minutes default
  //   ): Promise<WorkflowRun> {
  //     const startTime = Date.now();

  //     while (Date.now() - startTime < timeoutMs) {
  //       const run = await this.getWorkflowRun(gitRepo, runId);

  //       if (run.status === 'completed') {
  //         return run;
  //       }

  //       // Wait 10 seconds before checking again
  //       await new Promise((resolve) => setTimeout(resolve, 10000));
  //     }

  //     throw new AppException(
  //       ERROR_CODE.SERVER_ERROR,
  //       'Workflow execution timeout',
  //     );
  //   }

  //   /**
  //    * Trigger deployment workflow for an application
  //    */
  //   async triggerAppDeployment(
  //     appId: number,
  //     environment: string = 'production',
  //     ref?: string,
  //   ): Promise<WorkflowRun> {
  //     try {
  //       // Get application info
  //       const app = await this.models.app.findByPk(appId);
  //       if (!app) {
  //         throw new AppException(
  //           ERROR_CODE.APP_NOT_FOUND,
  //           'Application not found',
  //         );
  //       }

  //       // Get workflows to find deployment workflow
  //       const workflows = await this.listWorkflows(app.gitRepo);
  //       const deployWorkflow = workflows.find(
  //         (w) =>
  //           w.name.toLowerCase().includes('deploy') ||
  //           w.name.toLowerCase().includes('ci/cd'),
  //       );

  //       if (!deployWorkflow) {
  //         throw new AppException(
  //           ERROR_CODE.APP_ERROR,
  //           'No deployment workflow found',
  //         );
  //       }

  //       // Trigger workflow with environment input
  //       return await this.triggerWorkflow(app.gitRepo, deployWorkflow.id, {
  //         ref: ref || 'main',
  //         inputs: {
  //           environment,
  //           app_id: appId.toString(),
  //         },
  //       });
  //     } catch (error: any) {
  //       throw new AppException(
  //         ERROR_CODE.APP_ERROR,
  //         `Failed to trigger app deployment: ${error.message}`,
  //       );
  //     }
  //   }

  //   /**
  //    * Get deployment status for an application
  //    */
  //   async getAppDeploymentStatus(appId: number): Promise<any> {
  //     try {
  //       const app = await this.models.app.findByPk(appId);
  //       if (!app) {
  //         throw new AppException(
  //           ERROR_CODE.APP_NOT_FOUND,
  //           'Application not found',
  //         );
  //       }

  //       const workflows = await this.listWorkflows(app.gitRepo);
  //       const deployWorkflow = workflows.find(
  //         (w) =>
  //           w.name.toLowerCase().includes('deploy') ||
  //           w.name.toLowerCase().includes('ci/cd'),
  //       );

  //       if (!deployWorkflow) {
  //         throw new AppException(
  //           ERROR_CODE.APP_ERROR,
  //           'No deployment workflow found',
  //         );
  //       }

  //       const runs = await this.getWorkflowRuns(
  //         app.gitRepo,
  //         deployWorkflow.id,
  //         5,
  //       );
  //       return runs;
  //     } catch (error: any) {
  //       throw new AppException(
  //         ERROR_CODE.APP_ERROR,
  //         `Failed to get app deployment status: ${error.message}`,
  //       );
  //     }
  //   }
}

export default new Git();
