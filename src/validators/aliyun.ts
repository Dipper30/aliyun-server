import { array, boolean, number, object, string } from 'aptx-validator';
import { pagination, paginationProperty } from './helpers';

class Aliyun {
  private regionId(strictRegion: boolean = false) {
    if (strictRegion) {
      // TODO extend region ids
      return string().oneof(['cn-shanghai', 'cn-hangzhou']);
    } else return string();
  }
  private status() {
    return string().oneof([
      'Pending',
      'Running',
      'Starting',
      'Stopping',
      'Stopped',
    ]);
  }

  postTest() {
    return object({
      id: number().errText('number required').errText('ID required'),
    });
  }

  getInstanceStatuses() {
    return object({
      regionId: this.regionId(),
      zoneId: string().optional(),
      ...paginationProperty(true),
    });
  }

  getInstanceDetails() {
    return object({
      regionId: this.regionId(),
      instanceIds: array(string()).optional().minLength(1).maxLength(100),
      instanceName: string().optional(),
      status: this.status().optional(),
      nextToken: string().optional(),
      maxResults: number().optional().max(100),
    });
  }

  startInstance() {
    return object({
      instanceId: string(),
      dryRun: boolean().optional(),
    });
  }

  stopInstance() {
    return object({
      instanceId: string(),
      dryRun: boolean().optional(),
      stoppedMode: string()
        .optional()
        .oneof(['StopCharging', 'KeepCharging'])
        .errText(`错误的停止模式`),
    });
  }

  runCommand() {
    return object({
      regionId: this.regionId(),
      type: string().oneof([
        'RunBatScript',
        'RunPowerShellScript',
        'RunShellScript',
      ]),
      commandContent: string(),
      instanceId: array(string()).optional(),
      name: string().optional().maxLength(128),
      description: string().optional().maxLength(512),
      workingDir: string().optional().maxLength(200),
      timeout: number().optional(),
      contentEncoding: string().optional().oneof(['PlainText', 'Base64']),
    });
  }

  getInvocationResults() {
    return object({
      regionId: this.regionId(),
      invokeId: string(),
      instanceId: string().optional(),
      nextToken: string().optional(),
      maxResults: number().optional().max(50),
    });
  }

  sendFile() {
    return object({
      regionId: this.regionId(),
      instanceId: array(string()),
      name: string().maxLength(255),
      description: string().optional().maxLength(512),
      targetDir: string().maxLength(255),
      content: string(),
      /** 默认 PlainText */
      contentType: string().optional().oneof(['PlainText', 'Base64']),
      /** 默认 false */
      overwrite: boolean().optional(),
      /** 秒级 */
      timeout: number().optional(),
    });
  }

  getPresignedUrl() {
    return object({
      fileName: string(),
      fileType: string(),
      method: string().oneof(['GET', 'PUT']),
      bucketName: string(),
      bucketRegion: string(),
    });
  }

  // listFilesByDirectory() {
  //   return object({
  //     prefix: string().optional(),
  //     continuationToken: string().optional(),
  //     delimiter: string().optional(),
  //     maxKeys: string().numeric().optional(),
  //     bucketName: string(),
  //     bucketRegion: string(),
  //   });
  // }

  listFilesByDirectory() {
    return object({
      dirId: string().optional(),
      bucketName: string(),
      bucketRegion: string(),
      pagination: pagination(true).optional(),
    });
  }

  getFilePresignedUrl() {
    return object({
      fileUrl: string(),
      bucketName: string(),
      bucketRegion: string(),
    });
  }

  saveBucketFile() {
    return object({
      dirId: string().optional(),
      bucketName: string(),
      bucketRegion: string(),
      fileName: string(),
      fileType: string(),
      fileUrl: string(),
      size: number(),
      cacheControl: number().optional(),
      description: string().optional(),
    });
  }

  deleteBucketFiles() {
    return object({
      ids: array(string()),
    });
  }

  createBucketDirectory() {
    return object({
      name: string().maxLength(50),
      bucketName: string(),
      bucketRegion: string(),
      parentDirId: string().optional(),
      description: string().optional(),
    });
  }

  startTTSTask() {
    return object({
      texts: array(string()),
      voice: string(),
      speed: number().min(0).max(2).optional(),
    });
  }
}

export default new Aliyun();
