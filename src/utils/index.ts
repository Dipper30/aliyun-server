import { ERROR_CODE } from '@/exceptions';
import AliyunException from '@/exceptions/AliyunException';
import BaseException from '@/exceptions/BaseException';
import { AliyunError } from '@/types';
import { ENV_VARIABLE, PROCESS_ENV } from '@/utils/constants';
/**
 * 判断参数是否为Error或自定义异常的实例
 * @param {any} p
 * @returns {boolean}
 */
export const isError = (p: any): boolean => {
  return p instanceof BaseException || p instanceof Error;
};

/**
 * 判断node环境
 */
export const isEnv = (env: PROCESS_ENV): boolean => {
  return getEnv() === env;
};

export const getEnv = (): PROCESS_ENV => {
  const env = process.env.NODE_ENV?.trim() || '';
  if (
    env === PROCESS_ENV.DEVELOPMENT ||
    env === PROCESS_ENV.SIMULATION ||
    env === PROCESS_ENV.PRODUCTION
  )
    return env;
  else return PROCESS_ENV.UNKNOWN;
};

export const getConfig = (attribute: ENV_VARIABLE) => {
  return process.env[attribute] || '';
};

/**
 * json 格式返回请求数据
 */
export const formResponse = (
  code: ERROR_CODE | 200 | 201 | 500,
  msg: string,
  data?: any,
) => ({
  code,
  msg,
  data: data ?? null,
});

export const handleAliyunError = (error: AliyunError) => {
  throw new AliyunException(
    null,
    error.code,
    error.data?.Recommend,
    error.data?.Message,
  );
};

// export const pickProperty = <T, K extends keyof T>(obj: T, keys: K[]) => {
//   return keys.reduce((prev, cur) => {
//     return {
//       ...prev,
//       [cur]: obj[cur],
//     };
//   }, {} as Record<K extends Pick<keyof T, tpyeof T>, T>);
// };
