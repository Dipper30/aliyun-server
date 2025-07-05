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
  export type AppById = GetType<V1Instance['appById']>;
  export type PostTest = GetType<V1Instance['postTest']>;
  export type CreateApp = GetType<V1Instance['createApp']>;
  export type QueryApps = GetType<V1Instance['queryApps']>;
  export type InsertInstance = GetType<V1Instance['insertInstance']>;

  export type SyncInstanceStatus = GetType<V1Instance['syncInstanceStatus']>;
  export type SearchInstances = GetType<V1Instance['searchInstances']>;

  export type GetGitWorkflows = GetType<V1Instance['getGitWorkflows']>;
  export type TriggerWorkflow = GetType<V1Instance['triggerWorkflow']>;
  export type ListGitWorkflowRuns = GetType<V1Instance['listGitWorkflowRuns']>;
  export type GetGitWorkflowRun = GetType<V1Instance['getGitWorkflowRun']>;
  export type GetGitWorkflowRunJobLogs = GetType<
    V1Instance['getGitWorkflowRunJobLogs']
  >;
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
