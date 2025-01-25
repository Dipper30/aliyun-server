import { Request } from 'express';
import * as $OpenApi from '@alicloud/openapi-client';
import Sts, * as $Sts from '@alicloud/sts20150401';
import * as $Util from '@alicloud/tea-util';
import BaseService from './base';
import { APP_CONFIG } from '@/config';
import { getUnixTS, handleAliyunError } from '@/utils';
import { AliyunError, AliyunParams } from '@/types';
import { AliyunException, CdnException } from '@/exceptions';
import OSS from 'ali-oss';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { appendLog } from '@/utils/log';

// import StsClient from '@alicloud/sts-sdk';

// Aliyun OSS API
// https://help.aliyun.com/zh/oss/developer-reference/installation-7

class AliyunCdn extends BaseService {
  stsClient: Sts;
  ossClient: OSS;
  stsCredentials: Map<string, $Sts.AssumeRoleResponseBodyCredentials>;

  constructor() {
    super();
    let stsConfig = new $OpenApi.Config({
      accessKeyId: APP_CONFIG.ALIYUN.ALIBABA_CLOUD_STS_ACCESS_KEY_ID,
      accessKeySecret: APP_CONFIG.ALIYUN.ALIBABA_CLOUD_STS_ACCESS_KEY_SECRET,
    });
    stsConfig.endpoint = APP_CONFIG.ALIYUN.ALIBABA_CLOUD_STS_ENDPOINT;
    this.stsClient = new Sts(stsConfig);
    this.ossClient = new OSS({
      accessKeyId: APP_CONFIG.ALIYUN.ALIBABA_CLOUD_ACCESS_KEY_ID,
      accessKeySecret: APP_CONFIG.ALIYUN.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
    });
    this.stsCredentials = new Map();
  }

  private getStsRoleSessionNameByUserId(userId: number) {
    return `sts-user:${userId}`;
  }

  private createOssClient(bucketName: string, region: string) {
    return (this.ossClient = new OSS({
      accessKeyId: APP_CONFIG.ALIYUN.ALIBABA_CLOUD_ACCESS_KEY_ID,
      accessKeySecret: APP_CONFIG.ALIYUN.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
      bucket: bucketName,
      region,
    }));
  }

  /**
   * https://help.aliyun.com/zh/oss/developer-reference/authorize-access-6
   */
  async getStsToken(options: {
    user: Request['user'];
    /** token 超时时间，默认 3600 s */ durationSeconds?: number;
  }) {
    const sessionName = this.getStsRoleSessionNameByUserId(options.user.id);
    const cachedCredential = this.stsCredentials.get(sessionName);
    if (cachedCredential) {
      const expireTimestamp = dayjs(cachedCredential.expiration).millisecond();
      const now = Date.now() + 60000; // 预留一分钟
      if (expireTimestamp > now) {
        // 返回未过期的 sts 凭证
        return cachedCredential;
      }
    }

    // sessionName用于自定义角色会话名称，用来区分不同的令牌，例如填写为sessiontest。
    const assumeRoleRequest = new $Sts.AssumeRoleRequest({
      roleArn: 'acs:ram::1337011230211479:role/ramosstest',
      roleSessionName: sessionName,
      durationSeconds: options.durationSeconds || 3600,
    });

    const runtime = new $Util.RuntimeOptions({});
    try {
      // 复制代码运行请自行打印 API 的返回值
      const response = await this.stsClient.assumeRoleWithOptions(
        assumeRoleRequest,
        runtime,
      );
      if (response.statusCode === 200 && response.body?.credentials) {
        const credential = response.body.credentials;
        // {
        //   accessKeyId: response.body.credentials.accessKeyId,
        //   accessKeySecret: response.body.credentials.accessKeySecret,
        //   expiration: response.body.credentials.expiration, // UTC 日期
        //   securityToken: response.body?.credentials.securityToken,
        // };
        this.stsCredentials.set(
          this.getStsRoleSessionNameByUserId(options.user.id),
          credential,
        );
        return credential;
      } else {
        throw new AliyunException(null, `STS Error`);
      }
    } catch (error) {
      // 此处仅做打印展示，请谨慎对待异常处理，在工程项目中切勿直接忽略异常。
      // 错误 message
      console.log(error as AliyunError);
      // 诊断地址
      console.log((error as AliyunError).data?.['Recommend']);
      handleAliyunError(error as AliyunError);
    }
  }

  /**
   * https://help.aliyun.com/zh/oss/developer-reference/list-buckets-8
   */
  async getBuckets() {
    try {
      // 类型有误
      const response: any = await this.ossClient.listBuckets({});
      return {
        buckets: response.buckets,
      };
    } catch (error) {
      handleAliyunError(error as any);
    }
  }

  /**
   * https://help.aliyun.com/zh/oss/developer-reference/query-bucket-information-5
   */
  async getBucketDetail(bucketName: string) {
    try {
      // 类型有误
      const response: any = await this.ossClient.getBucketInfo(bucketName);
      return {
        comment: response.bucket.Comment,
        creationDate: response.bucket.CreationDate,
        blockPublicAccess: response.bucket.BlockPublicAccess,
        location: response.bucket.Location,
        name: response.bucket.Name,
        owner: {
          displayName: response.bucket.Owner?.DisplayName,
          id: response.bucket.Owner?.ID,
        },
      };
    } catch (error) {
      handleAliyunError(error as any);
    }
  }

  /**
   * https://help.aliyun.com/zh/oss/developer-reference/list-objects-5
   */
  // async getFilesByDir(data: AliyunParams.ListFilesByDirectory) {
  //   const client = this.createOssClient(data.bucketName, data.bucketRegion);
  //   const response: any = await client.listV2(
  //     {
  //       'max-keys': data.maxKeys || '100',
  //       prefix: data.prefix || 'fe/',
  //       delimiter: data.delimiter || '/',
  //       'continuation-token': data.continuationToken,
  //     },
  //     {},
  //   );
  //   return {
  //     files: response.objects,
  //     nextMarker: response.nextMarker,
  //     count: response.keyCount,
  //   };
  // }

  /** 常见 content-type 请参考 https://help.aliyun.com/zh/oss/user-guide/configure-the-content-type-header */
  private getContentTypeByFileName(name: string) {
    const suffix = name.split('.').at(-1);
    if (!suffix) return undefined;
    switch (suffix) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      default:
        return undefined;
    }
  }
  /**
   * https://help.aliyun.com/zh/oss/developer-reference/authorize-access-6
   */
  async getPresignedUrlForOss(options: {
    bucketName: string;
    bucketRegion: string;
    fileName: string;
    fileType: string;
    method: 'GET' | 'PUT';
    /** 超时时间，默认 1800s，不可以超过 sts 超时时间 */
    expires?: number;
    /**  image process params, will send with x-oss-process e.g.: {process: 'image/resize,w_200'} */
    process?: string | undefined;
  }) {
    // const contentType = this.getContentTypeByFileName(options.fileName);
    // if (!contentType) {
    //   throw new AliyunException(
    //     null,
    //     `Unsupported File Type: ${options.fileName}`,
    //   );
    // }
    const client = this.createOssClient(
      options.bucketName,
      options.bucketRegion,
    );
    console.log(
      `
      
      
      get `,
      options.fileName,
      options.method,
      options.fileType,
    );
    const response = await client.signatureUrl(options.fileName, {
      expires: options.expires || 1800,
      method: options.method,
      'Content-Type': options.method === 'PUT' ? options.fileType : undefined,
      process: options.process,
    });
    console.log('response ', response);
    return response;
  }

  private async getDirectoryContext(
    data: {
      id?: string;
      bucketRegion: string;
      bucketName: string;
    },
    options?: { throwIfNotExists?: boolean },
  ) {
    const directory = data.id
      ? await this.models.bucketFileDir.findByPk(data.id, {
          attributes: [
            'id',
            'name',
            'parentDirId',
            'bucketRegion',
            'bucketName',
          ],
          raw: true,
        })
      : null;
    if (
      directory &&
      (directory.bucketRegion !== data.bucketRegion ||
        directory.bucketName !== data.bucketName)
    ) {
      throw new CdnException(null, '当前存储空间信息不匹配');
    }
    const children = await this.models.bucketFileDir.findAll({
      where: {
        bucketRegion: data.bucketRegion,
        bucketName: data.bucketName,
        parentDirId: directory ? directory.id : null,
      },
      attributes: ['id', 'name', 'parentDirId'],
      raw: true,
    });
    const parents = [];
    if (directory) {
      let currentDir: any = directory;
      while (currentDir.parentDirId) {
        const parent = await this.models.bucketFileDir.findByPk(
          currentDir.parentDirId,
          { attributes: ['id', 'name', 'parentDirId'], raw: true },
        );
        currentDir = parent;
        if (parent) {
          parents.push(parent);
        }
      }
    }

    return {
      parents,
      children,
      current: directory,
    };
  }

  /**
   * 创建本地目录
   */
  async createBucketDirectory(
    options: AliyunParams.CreateBucketDirectory,
    user: Request['user'],
  ) {
    if (options.parentDirId) {
      const parent = await this.models.bucketFileDir.findByPk(
        options.parentDirId,
      );
      if (!parent) {
        throw new CdnException(null, 'Directory Not Found');
      }
    }
    await this.models.bucketFileDir.create({
      id: uuidv4(),
      name: options.name,
      parentDirId: options.parentDirId,
      description: options.description,
      bucketName: options.bucketName,
      bucketRegion: options.bucketRegion,
      createdBy: user.id,
      createdAt: getUnixTS(),
    });
  }

  async getFilesByDir(data: AliyunParams.ListFilesByDirectory) {
    const dirContext = await this.getDirectoryContext({
      id: data.dirId,
      bucketName: data.bucketName,
      bucketRegion: data.bucketRegion,
    });

    const files = await this.models.bucketFile.findAndCountAll({
      where: {
        dirId: data.dirId || null,
        bucketName: data.bucketName,
        bucketRegion: data.bucketRegion,
      },
      ...this.createPager(data),
    });
    return {
      directory: dirContext,
      rows: files.rows,
      count: files.count,
    };
  }

  async deleteFiles(
    data: AliyunParams.DeleteBucketFiles,
    user: Request['user'],
  ) {
    const files = await this.models.bucketFile.findAll({
      where: {
        id: {
          [this.Op.in]: data.ids,
        },
      },
    });
    if (!files.length) {
      throw new CdnException(null, '文件不存在');
    }
    let results = files.map((f) => ({
      fileId: f.dataValues.id,
      fullUrl: f.dataValues.fileUrl,
      bucketUrl: f.dataValues.fileUrl.split('aliyuncs.com/')[1],
      success: false,
      errMsg: '',
    }));
    try {
      const deleteResult = await this.deleteOSSFiles(
        results.map((r) => r.bucketUrl).filter(Boolean),
        files[0].dataValues.bucketName,
        files[0].dataValues.bucketRegion,
      );
      appendLog(
        'delete-bucket-file',
        `${JSON.stringify(deleteResult.deleted)}`,
      );
      const deleted =
        deleteResult?.deleted?.map((d: any) => encodeURIComponent(d.Key)) || [];
      results = results.map((r) => {
        const encodedUrl = encodeURIComponent(r.bucketUrl);
        if (!r.bucketUrl) {
          r.success = false;
          r.errMsg = '未查询到合法文件名';
        } else if (deleted.some((d) => d.startsWith(encodedUrl))) {
          r.success = true;
          r.errMsg = '';
        } else {
          r.success = false;
          r.errMsg = `OSS 删除失败: ${deleteResult.res.status}`;
        }
        return r;
      });
    } catch (error: any) {
      results = results.map((r) => {
        if (!r.bucketUrl) {
          r.success = false;
          r.errMsg = '未查询到合法文件名';
        } else {
          r.success = false;
          r.errMsg = `OSS 删除失败: ${error.message}`;
        }
        return r;
      });
    }
    // 删除本地映射关系
    try {
      await this.models.bucketFile.destroy({
        where: {
          id: {
            [this.Op.in]: results
              .filter((r) => r.success === true && r.bucketUrl)
              .map((r) => r.fileId),
          },
        },
      });
    } catch (error) {
      throw new CdnException(null, 'OSS 资源已删除，本地删除失败');
    }

    return results;
  }

  /**
   * 删除真实 oss 资源
   */
  async deleteOSSFiles(
    fileNames: string[],
    bucketName: string,
    bucketRegion: string,
  ) {
    const client = this.createOssClient(bucketName, bucketRegion);
    // 填写需要删除的多个Object完整路径并设置返回模式为简单模式。Object完整路径中不能包含Bucket名称。
    return await client.deleteMulti(fileNames);
  }

  async saveFile(data: AliyunParams.SaveBucketFile, user: Request['user']) {
    const hasOne = await this.models.bucketFile.findOne({
      where: {
        dirId: data.dirId || null,
        fileName: data.fileName,
        fileType: data.fileType,
        bucketName: data.bucketName,
        bucketRegion: data.bucketRegion,
      },
    });
    if (hasOne) {
      hasOne.fileUrl = data.fileUrl;
      hasOne.updatedAt = getUnixTS();
      hasOne.updatedBy = user.id;
      hasOne.size = data.size;
      return await hasOne.save();
    } else {
      return await this.models.bucketFile.create({
        id: uuidv4(),
        dirId: data.dirId || null,
        cacheControl: data.cacheControl,
        fileName: data.fileName,
        fileType: data.fileType,
        fileUrl: data.fileUrl,
        size: data.size,
        description: data.description,
        bucketName: data.bucketName,
        bucketRegion: data.bucketRegion,
        createdAt: getUnixTS(),
        createdBy: user.id,
      });
    }
  }

  async getFilePresignedUrl(data: AliyunParams.GetFilePresignedUrl) {
    //   const client = this.createOssClient(data.bucketName, data.bucketRegion);
    //  client.signatureUrl(data.fileUrl, {
    //   'expires'
    //  })
  }
}

export default new AliyunCdn();
