# Instance 模型和服务说明

## 概述

在 `db/models` 文件下添加了 `Instance` 模型，代表阿里云实际的实例，包含 IP、实例名、区域等信息。在 `service` 层增加了同步实例状态以及新增编辑实例的方法。

## 模型结构

### Instance 模型字段

- `id`: 主键，自增
- `instanceId`: 阿里云实例ID（唯一）
- `instanceName`: 实例名称
- `status`: 实例状态（Pending, Running, Starting, Stopping, Stopped）
- `regionId`: 地域ID
- `privateIpAddress`: 私网IP地址
- `publicIpAddress`: 公网IP地址
- `lastSyncTime`: 最后同步时间
- `cid`: 创建人ID（关联User表）
- `deletedAt`: 软删除时间
- `createdAt`: 创建时间戳
- `updatedAt`: 更新时间戳

## 服务方法

### InstanceService 提供的方法

#### 1. 获取实例列表

```typescript
async getInstances(options?: Custom.Pagination<{
  regionId?: string;
  status?: AliyunInstanceStatus;
  instanceName?: string;
}>)
```

#### 2. 根据ID获取实例详情

```typescript
async getInstanceById(id: number)
```

#### 3. 根据阿里云实例ID获取实例详情

```typescript
async getInstanceByInstanceId(instanceId: string)
```

#### 4. 创建实例

```typescript
async createInstance(data: CreateInstanceData)
```

#### 5. 更新实例

```typescript
async updateInstance(data: UpdateInstanceData)
```

#### 6. 删除实例（软删除）

```typescript
async deleteInstance(id: number)
```

#### 7. 同步单个实例状态

```typescript
async syncInstanceStatus(instanceId: string)
```

#### 8. 批量同步实例状态

```typescript
async syncAllInstanceStatuses()
```

#### 9. 从阿里云同步实例列表到本地数据库

```typescript
async syncInstancesFromAliyun(regionId: string, options?: {
  page?: number;
  size?: number;
})
```

#### 10. 搜索实例

```typescript
async searchInstances(keyword: string, options?: Custom.Pagination)
```

#### 11. 根据实例ID同步实例信息（upsert）

```typescript
async upsertInstanceById(instanceId: string, regionId?: string)
```

#### 12. 批量同步指定实例列表

```typescript
async upsertInstancesByIds(instanceIds: string[], regionId?: string)
```

## 使用示例

### 导入服务

```typescript
import { InstanceService } from '@/services';

const instanceService = new InstanceService();
```

### 获取实例列表

```typescript
const instances = await instanceService.getInstances({
  pagination: { page: 1, size: 20 },
  regionId: 'cn-hangzhou',
  status: 'Running',
});
```

### 同步实例状态

```typescript
// 同步单个实例
const updatedInstance = await instanceService.syncInstanceStatus('i-xxx');

// 批量同步所有实例
const result = await instanceService.syncAllInstanceStatuses();
```

### 从阿里云同步实例

```typescript
const syncResult = await instanceService.syncInstancesFromAliyun(
  'cn-hangzhou',
  {
    page: 1,
    size: 100,
  },
);
```

### 搜索实例

```typescript
const searchResult = await instanceService.searchInstances('web-server', {
  pagination: { page: 1, size: 10 },
});
```

### 根据实例ID同步实例（upsert）

```typescript
// 单个实例同步
const result = await instanceService.upsertInstanceById('i-xxx', 'cn-hangzhou');
console.log(`操作类型: ${result.action}`); // 'created' 或 'updated'
console.log(`实例信息:`, result.instance);

// 批量实例同步
const batchResult = await instanceService.upsertInstancesByIds(
  ['i-xxx', 'i-yyy', 'i-zzz'],
  'cn-hangzhou',
);
console.log(`成功: ${batchResult.success}, 失败: ${batchResult.failed}`);
```

## 数据库迁移

已更新 `src/db/sql/init.sql` 文件，添加了简化后的 `instances` 表的创建语句。运行该 SQL 文件即可创建实例表。

## 注意事项

1. 实例状态同步需要先确保本地数据库中存在对应的实例记录
2. 从阿里云同步实例时，会自动处理新增和更新操作
3. 所有删除操作都是软删除，不会真正删除数据
4. 实例ID在数据库中具有唯一性约束
5. 创建实例时需要提供所有必需字段（instanceId, instanceName, status, regionId）
6. 模型已简化，只保留核心字段，减少了存储空间和复杂度

## 数据同步说明

### 同步字段映射

从阿里云同步数据时，会映射以下字段：

- `instanceId` ← `aliyunInstance.instanceId`
- `instanceName` ← `aliyunInstance.instanceName`
- `status` ← `aliyunInstance.status`
- `regionId` ← `aliyunInstance.regionId`
- `privateIpAddress` ← `aliyunInstance.vpcAttributes.privateIpAddress.ipAddress[0]`
- `publicIpAddress` ← `aliyunInstance.publicIpAddress.ipAddress[0]`
- `lastSyncTime` ← 当前时间戳

### 同步策略

1. **新增实例**: 如果阿里云实例不存在于本地数据库，则创建新记录
2. **更新实例**: 如果阿里云实例已存在于本地数据库，则更新状态和IP地址
3. **状态同步**: 定期同步实例状态，确保本地数据与阿里云保持一致

### Upsert 功能

#### 单个实例 Upsert

- **功能**: 根据实例ID从阿里云获取最新信息，在本地数据库中创建或更新实例记录
- **参数**:
  - `instanceId`: 实例ID（必需）
  - `regionId`: 地域ID（可选，如果不提供会尝试从本地数据库获取）
- **返回值**:
  - `action`: 操作类型（'created' 或 'updated'）
  - `instance`: 实例信息
  - `syncTime`: 同步时间戳

#### 批量实例 Upsert

- **功能**: 批量同步多个实例的信息
- **参数**:
  - `instanceIds`: 实例ID数组（必需）
  - `regionId`: 地域ID（可选）
- **返回值**:
  - `total`: 总数量
  - `success`: 成功数量
  - `failed`: 失败数量
  - `results`: 成功结果列表
  - `errors`: 错误信息列表

#### 智能地域ID处理

- 如果提供了 `regionId`，直接使用
- 如果没有提供 `regionId`，会尝试从本地数据库中查找该实例的地域信息
- 如果本地数据库中也找不到，会抛出错误提示用户提供地域ID
