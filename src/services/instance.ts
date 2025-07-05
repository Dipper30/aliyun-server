import BaseService from './base';
import AliyunService from './aliyun';
import { Custom, AliyunInstanceStatus } from '@/types';
import { Op } from 'sequelize';
import { Request } from 'express';

interface CreateInstanceData {
  instanceId: string;
  instanceName: string;
  status: AliyunInstanceStatus;
  regionId: string;
  privateIpAddress?: string;
  publicIpAddress?: string;
  cid?: number;
}

interface UpdateInstanceData extends Partial<CreateInstanceData> {
  id: number;
}

class InstanceService extends BaseService {
  constructor() {
    super();
  }

  /**
   * 获取实例列表
   */
  async getInstances(
    options?: Custom.Pagination<{
      regionId?: string;
      status?: AliyunInstanceStatus;
      instanceName?: string;
    }>,
  ) {
    const { offset, limit } = this.createPager(options);
    const where = this.whereClause(options);

    const { count, rows } = await this.models.instance.findAndCountAll({
      where: {
        ...where,
        deletedAt: null,
      },
      include: [
        {
          model: this.models.user,
          as: 'creator',
          attributes: ['id', 'username'],
        },
      ],
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    return {
      list: rows,
      total: count,
      page: options?.pagination?.page || this.pager.page,
      size: options?.pagination?.size || this.pager.size,
    };
  }

  /**
   * 根据ID获取实例详情
   */
  async getInstanceById(id: number) {
    return await this.models.instance.findOne({
      where: {
        id,
        deletedAt: null,
      },
      include: [
        {
          model: this.models.user,
          as: 'creator',
          attributes: ['id', 'username'],
        },
      ],
    });
  }

  /**
   * 根据阿里云实例ID获取实例详情
   */
  async getInstanceByInstanceId(instanceId: string) {
    return await this.models.instance.findOne({
      where: {
        instanceId,
        deletedAt: null,
      },
      include: [
        {
          model: this.models.user,
          as: 'creator',
          attributes: ['id', 'username'],
        },
      ],
    });
  }

  /**
   * 创建实例
   */
  async createInstance(data: CreateInstanceData) {
    const now = Math.floor(Date.now() / 1000);

    return await this.models.instance.create({
      ...data,
      createdAt: now,
      updatedAt: now,
      lastSyncTime: now,
    });
  }

  /**
   * 更新实例
   */
  async updateInstance(data: UpdateInstanceData) {
    const { id, ...updateData } = data;
    const now = Math.floor(Date.now() / 1000);

    const [affectedCount] = await this.models.instance.update(
      {
        ...updateData,
        updatedAt: now,
      },
      {
        where: {
          id,
          deletedAt: null,
        },
      },
    );

    if (affectedCount === 0) {
      throw new Error('实例不存在或已被删除');
    }

    return await this.getInstanceById(id);
  }

  /**
   * 删除实例（软删除）
   */
  async deleteInstance(id: number) {
    const [affectedCount] = await this.models.instance.update(
      {
        deletedAt: new Date(),
        updatedAt: Math.floor(Date.now() / 1000),
      },
      {
        where: {
          id,
          deletedAt: null,
        },
      },
    );

    if (affectedCount === 0) {
      throw new Error('实例不存在或已被删除');
    }

    return { success: true };
  }

  /**
   * 同步一个实例至本地
   */
  async syncInstanceStatus(
    regionId: string,
    instanceId: string,
    user: Request['user'],
  ) {
    try {
      // 从阿里云获取实例详情
      const instanceDetails = await AliyunService.getInstanceDetails({
        regionId,
        instanceIds: [instanceId],
      });
      if (!instanceDetails || instanceDetails.length === 0) {
        throw new Error('实例不存在或未启动');
      }
      const aliyunInstance = instanceDetails[0];
      const now = Math.floor(Date.now() / 1000);

      // 验证必需字段
      if (
        !aliyunInstance.instanceId ||
        !aliyunInstance.instanceName ||
        !aliyunInstance.regionId
      ) {
        throw new Error(
          `实例数据不完整: instanceId=${aliyunInstance.instanceId}, instanceName=${aliyunInstance.instanceName}, regionId=${aliyunInstance.regionId}`,
        );
      }

      const findOne = await this.models.instance.findOne({
        where: {
          instanceId,
        },
      });

      const dataToUpdate = {
        instanceId: aliyunInstance.instanceId,
        createdAt: now,
        deletedAt: null,
        updatedAt: now,
        instanceName: aliyunInstance.instanceName,
        lastSyncTime: now,
        cid: user.id,
        regionId: aliyunInstance.regionId,
        privateIpAddress:
          aliyunInstance.vpcAttributes?.privateIpAddress?.ipAddress?.[0],
        publicIpAddress: aliyunInstance.publicIpAddress?.ipAddress?.[0],
        status: aliyunInstance.status as AliyunInstanceStatus,
      };
      if (findOne) {
        // 更新本地数据库中的实例信息
        await this.updateInstance({
          id: findOne.id,
          ...dataToUpdate,
        });
      } else {
        await this.createInstance({
          ...dataToUpdate,
        });
      }

      return await this.getInstanceByInstanceId(instanceId);
    } catch (error) {
      throw new Error(
        `同步实例状态失败: ${error instanceof Error ? error.message : '未知错误'}`,
      );
    }
  }

  /**
   * 从阿里云同步实例列表到本地数据库
   */
  async syncInstancesFromAliyun(
    regionId: string,
    options?: {
      page?: number;
      size?: number;
    },
  ) {
    try {
      const page = options?.page || 1;
      const size = options?.size || 100;

      // 从阿里云获取实例列表
      const aliyunInstances = await AliyunService.getInstanceDetails({
        regionId,
        maxResults: size,
      });
      if (!aliyunInstances || aliyunInstances.length === 0) {
        return { synced: 0, created: 0, updated: 0 };
      }

      let created = 0;
      let updated = 0;
      const now = Math.floor(Date.now() / 1000);

      for (const aliyunInstance of aliyunInstances) {
        if (
          !aliyunInstance.instanceId ||
          !aliyunInstance.instanceName ||
          !aliyunInstance.regionId
        ) {
          continue; // 跳过无效的实例数据
        }

        const instanceData = {
          instanceId: aliyunInstance.instanceId,
          instanceName: aliyunInstance.instanceName,
          status: aliyunInstance.status as AliyunInstanceStatus,
          regionId: aliyunInstance.regionId,
          privateIpAddress:
            aliyunInstance.vpcAttributes?.privateIpAddress?.ipAddress?.[0] ||
            null,
          publicIpAddress:
            aliyunInstance.publicIpAddress?.ipAddress?.[0] || null,
          lastSyncTime: now,
          updatedAt: now,
        };

        // 检查实例是否已存在
        const existingInstance = await this.getInstanceByInstanceId(
          aliyunInstance.instanceId,
        );

        if (existingInstance) {
          // 更新现有实例
          await this.models.instance.update(instanceData, {
            where: { instanceId: aliyunInstance.instanceId },
          });
          updated++;
        } else {
          // 创建新实例
          await this.models.instance.create({
            ...instanceData,
            createdAt: now,
          });
          created++;
        }
      }

      return {
        synced: aliyunInstances.length,
        created,
        updated,
      };
    } catch (error) {
      throw new Error(
        `从阿里云同步实例失败: ${error instanceof Error ? error.message : '未知错误'}`,
      );
    }
  }

  /**
   * 搜索实例
   */
  async searchInstances(keyword?: string, options?: Custom.Pagination) {
    const { offset, limit } = this.createPager(options);

    const where: any = {
      deletedAt: null,
    };
    if (keyword) {
      where[Op.or] = [
        { instanceName: { [Op.like]: `%${keyword}%` } },
        { instanceId: { [Op.like]: `%${keyword}%` } },
      ];
    }
    const { count, rows } = await this.models.instance.findAndCountAll({
      where,
      include: [
        {
          model: this.models.user,
          as: 'creator',
          attributes: ['id', 'username'],
        },
      ],
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    return {
      rows,
      count,
    };
  }
}

export default new InstanceService();
