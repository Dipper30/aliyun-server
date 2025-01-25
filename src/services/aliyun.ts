import Ecs, * as $Ecs from '@alicloud/ecs20140526';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import Util, * as $Util from '@alicloud/tea-util';
import * as $tea from '@alicloud/tea-typescript';
import BaseService from './base';
import { APP_CONFIG } from '@/config';
import AliyunException from '@/exceptions/AliyunException';
import { handleAliyunError } from '@/utils';
import { AliyunError, AliyunParams } from '@/types';

class Aliyun extends BaseService {
  client: Ecs;
  constructor() {
    super();
    let config = new $OpenApi.Config({
      accessKeyId: APP_CONFIG.ALIYUN.ALIBABA_CLOUD_ACCESS_KEY_ID,
      accessKeySecret: APP_CONFIG.ALIYUN.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
    });
    config.endpoint = APP_CONFIG.ALIYUN.ALIBABA_CLOUD_ENDPOINT;
    this.client = new Ecs(config);
  }

  /**
   * https://next.api.aliyun.com/document/Ecs/2014-05-26/DescribeRegions
   */
  async getRegions() {
    // DescribeRegions
    const request = new $Ecs.DescribeRegionsRequest();
    try {
      const response = await this.client.describeRegions(request);
      return response.body?.regions;
    } catch (error) {
      handleAliyunError(error as any);
    }
  }

  /**
   * 可用区域
   * https://next.api.aliyun.com/document/Ecs/2014-05-26/DescribeZones
   * @returns
   */
  async getZones(
    regionId: string,
    options?: {
      abstract?: boolean;
    },
  ) {
    const request = new $Ecs.DescribeZonesRequest({
      regionId: regionId,
    });

    try {
      const response = await this.client.describeZones(request);
      if (options?.abstract) {
        return response.body?.zones?.zone?.map((z) => ({
          localName: z.localName,
          zoneId: z.zoneId,
          zoneType: z.zoneType,
        }));
      } else return response.body?.zones?.zone;
    } catch (error) {
      handleAliyunError(error as any);
    }
  }

  /**
   * 查询实例状态列表
   * https://next.api.aliyun.com/document/Ecs/2014-05-26/DescribeInstanceStatus
   * @returns
   */
  async getInstanceStatuses(data: AliyunParams.GetInstanceStatuses) {
    const request = new $Ecs.DescribeInstanceStatusRequest({
      regionId: data.regionId,
      zoneId: data.zoneId,
      pageNumber: data.page || 1,
      pageSize: data.size || 20,
    });

    try {
      const response = await this.client.describeInstanceStatus(request);
      return response.body?.instanceStatuses?.instanceStatus;
    } catch (error) {
      handleAliyunError(error as any);
    }
  }

  /**
   * 查询实例详情列表
   * https://next.api.aliyun.com/document/Ecs/2014-05-26/DescribeInstances
   * @returns
   */
  async getInstanceDetails(data: AliyunParams.GetInstanceDetails) {
    const request = new $Ecs.DescribeInstancesRequest({
      ...data,
    });

    try {
      const response = await this.client.describeInstances(request);
      return response.body;
    } catch (error: any) {
      handleAliyunError(error);
    }
  }

  async startInstanceCheck(instanceId: string) {
    const request = new $Ecs.StartInstanceRequest({
      instanceId,
      dryRun: true,
    });

    try {
      await this.client.startInstance(request);
      return {
        result: false,
        msg: '',
      };
    } catch (error: any) {
      if (error.code === 'DryRunOperation') {
        return {
          result: true,
          msg: 'ready',
        };
      }
      return {
        result: false,
        msg: error.message,
      };
    }
  }

  /**
   * 启动实例
   * https://next.api.aliyun.com/document/Ecs/2014-05-26/StartInstance
   * @returns
   */
  async startInstance(instanceId: string) {
    const request = new $Ecs.StartInstanceRequest({
      instanceId,
    });

    try {
      const response = await this.client.startInstance(request);
      return response.body;
    } catch (error: any) {
      handleAliyunError(error);
    }
  }

  async stopInstanceCheck(data: {
    instanceId: string;
    stoppedMode: 'StopCharging' | 'KeepCharging';
  }) {
    const request = new $Ecs.StartInstanceRequest({
      instanceId: data.instanceId,
      dryRun: true,
    });

    try {
      await this.client.stopInstance(request);
      return {
        result: false,
        msg: '',
      };
    } catch (error: any) {
      if (error.code === 'DryRunOperation') {
        return {
          result: true,
          msg: 'ready',
        };
      }
      return {
        result: false,
        msg: error.message,
      };
    }
  }

  /**
   * 停止实例
   * https://next.api.aliyun.com/document/Ecs/2014-05-26/StopInstance
   * @returns
   */
  async stopInstance(data: {
    instanceId: string;
    stoppedMode: 'StopCharging' | 'KeepCharging';
  }) {
    const request = new $Ecs.StartInstanceRequest({
      instanceId: data.instanceId,
      stoppedMode: data.stoppedMode,
    });

    try {
      const response = await this.client.stopInstance(request);
      return response.body;
    } catch (error: any) {
      handleAliyunError(error);
    }
  }

  /**
   * 在实例中执行脚本
   * https://next.api.aliyun.com/document/Ecs/2014-05-26/RunCommand
   */
  async runCommand(data: AliyunParams.RunCommand) {
    const request = new $Ecs.RunCommandRequest({
      ...data,
    });

    try {
      const response = await this.client.runCommand(request);
      return response.body;
    } catch (error: any) {
      handleAliyunError(error);
    }
  }

  /**
   * 查询命令执行结果
   * https://next.api.aliyun.com/document/Ecs/2014-05-26/DescribeInvocationResults
   */
  async getInvocationResults(data: AliyunParams.GetInvocationResults) {
    const request = new $Ecs.DescribeInvocationResultsRequest({
      ...data,
    });

    try {
      const response = await this.client.describeInvocationResults(request);
      return response.body?.invocation;
    } catch (error: any) {
      handleAliyunError(error);
    }
  }

  /**
   * https://next.api.aliyun.com/document/Ecs/2014-05-26/SendFile
   * 发送文件
   */
  async sendFile(data: AliyunParams.SendFile) {
    const request = new $Ecs.SendFileRequest({
      ...data,
    });
    try {
      const response = await this.client.sendFile(request);
      return response.body?.invokeId;
    } catch (error: any) {
      handleAliyunError(error);
    }
  }
}

export default new Aliyun();
