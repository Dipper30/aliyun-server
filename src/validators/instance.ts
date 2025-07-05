import { array, number, object, string } from 'aptx-validator';
import { pagination, paginationProperty } from './helpers';

class Instance {
  private status() {
    return string().oneof([
      'Pending',
      'Running',
      'Starting',
      'Stopping',
      'Stopped',
    ]);
  }

  /**
   * 获取实例列表
   */
  getInstances() {
    return object({
      ...paginationProperty(true),
      status: this.status().optional(),
      regionId: string().optional(),
      instanceName: string().optional(),
    });
  }

  /**
   * 创建实例
   */
  createInstance() {
    return object({
      instanceId: string().errText('实例ID不能为空'),
      instanceName: string().errText('实例名称不能为空'),
      status: this.status().errText('实例状态不能为空'),
      regionId: string().errText('地域ID不能为空'),
      privateIpAddress: string().optional(),
      publicIpAddress: string().optional(),
      cid: number().optional(),
    });
  }

  /**
   * 更新实例
   */
  updateInstance() {
    return object({
      instanceName: string().optional(),
      status: this.status().optional(),
      regionId: string().optional(),
      privateIpAddress: string().optional(),
      publicIpAddress: string().optional(),
      cid: number().optional(),
    });
  }

  /**
   * 搜索实例
   */
  searchInstances() {
    return object({
      keyword: string().errText('搜索关键词不能为空'),
      ...paginationProperty(true),
    });
  }

  /**
   * 根据实例ID同步实例（upsert）
   */
  upsertInstanceById() {
    return object({
      instanceId: string().errText('实例ID不能为空'),
      regionId: string().optional(),
    });
  }

  /**
   * 批量同步实例（upsert）
   */
  upsertInstancesByIds() {
    return object({
      instanceIds: array(string())
        .minLength(1)
        .maxLength(100)
        .errText('实例ID列表不能为空且数量不能超过100个'),
      regionId: string().optional(),
    });
  }

  /**
   * 同步实例状态
   */
  syncInstanceStatus() {
    return object({
      instanceId: string().errText('实例ID不能为空'),
    });
  }
}

export default new Instance();
