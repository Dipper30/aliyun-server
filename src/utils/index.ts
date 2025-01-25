import crypto from 'crypto';
import { ERROR_CODE } from '@/exceptions';
import { AliyunException, BaseException } from '@/exceptions';
import { AliyunError } from '@/types';
import { ENV_VARIABLE, PROCESS_ENV } from '@/utils/constants';
import { APP_CONFIG } from '@/config';

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
  success?: boolean,
) => ({
  code,
  msg,
  data: data ?? null,
  success: success ?? true,
});

export const handleAliyunError = (error: AliyunError) => {
  console.error('Aliyun Error: ', error);
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

/**
 * MD5加密
 * @param {string} plainText
 * @returns {string} 密文
 */
export const encryptMD5 = (plainText: string): string => {
  return crypto
    .createHash('md5')
    .update(plainText)
    .update(APP_CONFIG.KEYS.MD5_PRIVATE_KEY)
    .digest('hex');
};

/**
 * 获取当前 UNIX 时间戳
 * @returns 10位时间戳(秒)
 */
export const getUnixTS = (): number => {
  return Math.floor(new Date().getTime() / 1000);
};

/**
 * 获取当前时间戳
 * @returns {number} 13位时间戳(毫秒)
 */
export const getTS = (): number => {
  return new Date().getTime();
};
