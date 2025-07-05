import v, { number, object, string } from 'aptx-validator';
import { pagination } from './helpers';

class V1 {
  private appType() {
    return string()
      .oneof(['page', 'server'])
      .errText(`请输入正确的应用类型: 'page', 'server'`);
  }
  private env() {
    return string()
      .oneof(['dev', 'test', 'stg', 'prod'])
      .errText(`请输入正确的环境: 'dev', 'test', 'stg', 'prod'`);
  }

  private port() {
    return number().positive().errText(`请输入正确的端口号`);
  }

  postTest() {
    return object({
      id: number().errText('number required').errText('ID required'),
    });
  }

  appById() {
    return object({
      appId: number().positive().errText('appId is required'),
    });
  }

  createApp() {
    return object({
      name: string().maxLength(50).errText('Invalid Name'),
      code: string().maxLength(30).errText('Invalid Code'),
      type: this.appType(),
      info: object().optional(),
      gitRepo: string(),
      description: string().optional(),
    });
  }

  queryApps() {
    return object({
      type: string()
        .oneof(['page', 'server'])
        .optional()
        .errText('Invalid Code'),
    });
  }

  insertInstance() {
    return object({
      appId: number().errText('应用ID不能为空'),
      instanceId: number().errText('实例ID不能为空'),
      env: this.env(),
      localPort: this.port().optional(),
      port: this.port().optional(),
      testPort: this.port().optional(),
      testPath: string().optional(),
    });
  }

  /**
   * 同步实例状态
   */
  syncInstanceStatus() {
    return object({
      regionId: string().errText('地域ID不能为空'),
      instanceId: string().errText('实例ID不能为空'),
    });
  }

  searchInstances() {
    return object({
      regionId: string().optional(),
      keyword: string().optional(),
      pagination: pagination().optional(),
    });
  }

  getGitWorkflows() {
    return object({
      appId: number(),
    });
  }

  triggerWorkflow() {
    return object({
      appId: number().positive(),
      workflowId: v.or([number(), string()]),
    });
  }

  listGitWorkflowRuns() {
    return object({
      appId: number().positive(),
      workflowId: v.or([number(), string()]),
    });
  }

  getGitWorkflowRun() {
    return object({
      appId: number().positive(),
      runId: v.or([number(), string()]),
    });
  }

  getGitWorkflowRunJobLogs() {
    return object({
      appId: number().positive(),
      jobId: v.or([number(), string()]),
    });
  }

  getGitInfo() {
    return object({
      appId: number(),
    });
  }
}

export default new V1();
