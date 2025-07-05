import { Request } from 'express';
import { AppInfo, AppType, V1Params } from '@/types';
import BaseService from './base';
import { getTS, getUnixTS } from '@/utils';
import { AppException, ERROR_CODE } from '@/exceptions';
import { GitService } from '.';

class Application extends BaseService {
  private excludeSensitiveFields: string[] = [
    'password',
    'deletedAt',
    'createdAt',
    'updatedAt',
  ];

  constructor() {
    super();
  }

  async findActiveOrThrow(appId: number) {
    const app = await this.models.app.scope('active').findByPk(appId);
    if (!app) throw new Error('App Not Found');
    return app;
  }

  async create(data: V1Params.CreateApp, user: Request['user']) {}

  async initGitRepo() {}

  async query(data: V1Params.QueryApps, user: Request['user']) {
    const where = {
      type: data.type,
    };
    const { rows, count } = await this.models.app
      .scope('active')
      .findAndCountAll({
        where: this.whereClause(where),
      });
    // todo
    return rows.map((app) => {
      const instances = app.instances;
      return {
        ...app.dataValues,
        instances: instances
          ? instances.map((instance) => {
              return {
                ...instance.dataValues,
                context: (instance as any).dataValues.ApplicationInstance,
                ApplicationInstance: undefined,
              };
            })
          : undefined,
      };
    });
  }

  async insertInstance(data: V1Params.InsertInstance, user: Request['user']) {
    // 验证应用是否存在
    const app = await this.models.app.findByPk(data.appId);
    if (!app) {
      throw new AppException(
        ERROR_CODE.APP_NOT_FOUND,
        `Application with id ${data.appId} not found.`,
      );
    }

    // 验证实例是否存在
    const instance = await this.models.instance.findByPk(data.instanceId);
    if (!instance) {
      throw new AppException(
        ERROR_CODE.APP_NOT_FOUND,
        `Instance with id ${data.instanceId} not found.`,
      );
    }

    // 检查是否已存在相同的关联
    const existingRelation = await this.models.appInstance.findOne({
      where: {
        appId: data.appId,
        instanceId: data.instanceId,
        // env: data.env, // 仅可绑定一个环境
      },
    });

    if (existingRelation) {
      throw new AppException(
        ERROR_CODE.APP_ERROR,
        `Application instance relation already exists for appId: ${data.appId}, instanceId: ${data.instanceId}, env: ${data.env}`,
      );
    }

    // 创建应用实例关联
    const now = getUnixTS();
    const appInstance = await this.models.appInstance.create({
      appId: data.appId,
      instanceId: data.instanceId,
      env: data.env,
      localPort: data.localPort || 8080,
      port: data.port || 8080,
      testPort: data.testPort || 8080,
      testPath: data.testPath || '/status',
      createdAt: now,
      updatedAt: now,
    });

    return appInstance;
  }

  async triggerCI(appId: number, branchName: string = 'master') {
    const app = await this.findActiveOrThrow(appId);
    const wfs = await GitService.listWorkflows(app.gitRepo);
    const ciWf = wfs.find((w) => w.name.toLowerCase() === 'ci');
    if (!ciWf) {
      throw new AppException(
        null,
        `Failed to trigger CI: cannot find workflow with name 'ci'`,
      );
    }
    const run = await GitService.triggerWorkflow(app.gitRepo, ciWf.id, {
      inputs: {
        app_id: app.dataValues.id.toString(),
      },
      ref: branchName,
    });

    return run;
  }
}

export default new Application();
