import { AuthValidator } from '@/validators';
import Aliyun from '@/validators/aliyun';
import V1 from '@/validators/v1';
import { AllValidator, Infer } from 'aptx-validator';
import { Dialect } from 'sequelize';

export namespace Custom {
  export type Pagination<T = any> = T & {
    pagination?: {
      page?: number;
      size?: number;
    };
  };

  export type Exception = {
    code: number;
    msg: string;
  };

  export type TokenDecode = {
    id: number;
    iat: number;
    exp: number;
  };
}

export namespace Config {
  export type Database = {
    username: string;
    password: string;
    host: string;
    dialect: Dialect;
    database: string;
    dialectOptions?: any;
  };
}

export type AliyunError = {
  message: string;
  code: string;
  data?: {
    RequestId: string;
    Message: string;
    HostId: string;
    Code: string;
    statusCode: number;
    // 诊断地址
    Recommend?: string;
  };
};

type GetType<F extends () => AllValidator> = Infer<ReturnType<F>>;
type AliyunInstance = typeof Aliyun;

export namespace AliyunParams {
  export type PostTest = GetType<AliyunInstance['postTest']>;

  export type GetInstanceStatuses = GetType<
    AliyunInstance['getInstanceStatuses']
  >;

  export type GetInstanceDetails = GetType<
    AliyunInstance['getInstanceDetails']
  >;

  export type StartInstance = GetType<AliyunInstance['startInstance']>;

  export type StopInstance = GetType<AliyunInstance['stopInstance']>;

  export type RunCommand = GetType<AliyunInstance['runCommand']>;

  export type GetInvocationResults = GetType<
    AliyunInstance['getInvocationResults']
  >;

  export type SendFile = GetType<AliyunInstance['sendFile']>;

  export type ListFilesByDirectory = GetType<
    AliyunInstance['listFilesByDirectory']
  >;
  export type SaveBucketFile = GetType<AliyunInstance['saveBucketFile']>;
  export type GetFilePresignedUrl = GetType<
    AliyunInstance['getFilePresignedUrl']
  >;
  export type DeleteBucketFiles = GetType<AliyunInstance['deleteBucketFiles']>;

  export type CreateBucketDirectory = GetType<
    AliyunInstance['createBucketDirectory']
  >;
  export type StartTTSTask = GetType<AliyunInstance['startTTSTask']>;
}

type V1Instance = typeof V1;

export namespace V1Params {
  export type PostTest = GetType<V1Instance['postTest']>;
}

type AuthInstance = typeof AuthValidator;
export namespace AuthParams {
  export type AutoLogin = GetType<AuthInstance['autoLogin']>;
  export type Login = GetType<AuthInstance['login']>;
  export type GetUsers = GetType<AuthInstance['getUsers']>;
  export type UpdateUserRole = GetType<AuthInstance['updateUserRole']>;
  export type UpdateRole = GetType<AuthInstance['updateRole']>;
  export type UpdateUserAccount = GetType<AuthInstance['updateUserAccount']>;
}
