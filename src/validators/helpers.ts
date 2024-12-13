import Ecs20140526, * as $Ecs20140526 from '@alicloud/ecs20140526';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import Util, * as $Util from '@alicloud/tea-util';
import * as $tea from '@alicloud/tea-typescript';
import { NextFunction, Request, Response } from 'express';
import v, { type AllValidator } from 'aptx-validator';
import { ParameterException } from '@/exceptions';

const emailRE = /^[0-9a-zA-Z_.-]+[@][0-9a-zA-Z_.-]+([.][a-zA-Z]+){1,2}$/;
const numericRE = /^\d+$/;

export const isPositiveInteger = (n: any): boolean => {
  return Boolean(n) && typeof n == 'number' && n > 0;
};

/**
 * check if all the attributes in the object are IDs, which are positive integers
 * @param {object} o
 * @param {string[]} attrs
 * @returns boolean
 */
export const attrsAreIDs = (o: any, attrs: string[]): boolean => {
  if (typeof o != 'object') return false;
  for (const a of attrs) {
    // eslint-disable-next-line no-prototype-builtins
    if (o.hasOwnProperty(a) && !isPositiveInteger(o[a])) return false;
  }
  return true;
};

/**
 * timestamp must be 13 digits number
 */
export const isTimeStamp = (ts: number): boolean => {
  return Boolean(ts) && typeof ts == 'number' && ts.toString().length === 13;
};

/**
 * unix timestamp must be 10 digits number
 */
export const isUnixTimeStamp = (ts: number): boolean => {
  return Boolean(ts) && typeof ts == 'number' && ts.toString().length === 10;
};

/**
 * check zip code, 5-digit long
 * @param code
 * @returns
 */
export const isZipCode = (code: any): boolean => {
  return (
    Boolean(code) && typeof code == 'number' && code.toString().length == 5
  );
};

/**
 * check if the length of name is between [3, 15]
 * you can use function isBetween of course, but this is more convenient in particular cases
 */
export const isShortName = (p: any): boolean => {
  return isBetween(p, 3, 15);
};

export const stringIsNumeric = (s: string): boolean => {
  return numericRE.test(s);
};

export const stringIsBoolean = (s: string): boolean => {
  return s == 'false' || s == 'true';
};

/**
 * check if the string is numeric
 */
export const isNumeric = (data: any) => {
  return numericRE.test(data);
};

export const isObject = (obj: any): boolean =>
  Object.prototype.toString.call(obj) == '[object Object]';

export const isArray = (arr: any): boolean =>
  Object.prototype.toString.call(arr) == '[object Array]';

export const isString = (str: any): boolean =>
  Object.prototype.toString.call(str) == '[object String]';

export const isNumber = (num: any): boolean =>
  Object.prototype.toString.call(num) == '[object Number]';

export const isBoolean = (num: any): boolean =>
  Object.prototype.toString.call(num) == '[object Boolean]';

/**
 * 正整数
 */
export const isId = (data: any) => {
  return isInteger(data) && data > 0;
};

/**
 * 字符串类型的正整数
 */
export const isNumericId = (data: any) => {
  return (
    typeof data === 'string' && /^d+$/g.test(data) && parseInt(data, 10) > 0
  );
};

/**
 * 整数
 */
export const isInteger = (data: any) => {
  return typeof data === 'number' && data % 1 === 0;
};

/**
 * if v is null or undefined, return true
 * @param v
 * @returns
 */
export const isEmptyValue = (v: any): boolean => v === null || v === undefined;

/**
 * check if the number is between min and max
 * or check if the length of string is between min and max
 */
export const isBetween = (
  data: any,
  leftBound: number,
  rightBound: number,
  withLeft: boolean = true,
  withRight: boolean = true,
) => {
  try {
    if (typeof data === 'string') {
      return (
        (withLeft ? data.length >= leftBound : data.length > leftBound) &&
        (withRight ? data.length <= rightBound : data.length > rightBound)
      );
    } else if (typeof data === 'number') {
      return (
        (withLeft ? data >= leftBound : data > leftBound) &&
        (withRight ? data <= rightBound : data > rightBound)
      );
    } else return false;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return false;
  }
};

export const isEmail = (email: string) => {
  return emailRE.test(email);
};

export const isPassword = (pwd: string) => /^[0-9a-zA-Z!@]{6,18}$/.test(pwd);

export const isUsername = (username: string) =>
  /^((?!\\|\/|:|\*|\?|<|>|\||'|%|@|#|\^|\(|\)|&|-|`).){1,18}$/.test(username);

/**
 * 混淆明文，返回密文
 * @param pt
 * @returns
 */
export const mixMessage = (pt: string) => {
  const ct = [];
  let initialOffset = 2;
  for (const c of pt) {
    const code = c.charCodeAt(0);
    ct.push(String.fromCharCode(code + initialOffset));
    initialOffset = (initialOffset * 2 + 3) % 33;
  }
  return ct.join('');
};

export const bodyValidator = (v: AllValidator) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const isValid = v.test(req.body);
    if (!isValid) {
      throw new ParameterException(null, v.getErrText());
    } else {
      next();
    }
  };
};

export const paramsValidator = (keys: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = keys.find((key) => !req.params[key]);
    if (key) {
      // 同步方法异常直接抛出
      throw new ParameterException(null, `Missing Param ${key}`);
    } else {
      next();
    }
  };
};

export const paginationProperty = (optional: boolean = false) => {
  if (optional) {
    return {
      page: v.number().int().min(1).optional().errText('页码需要是 >=1 的整数'),
      size: v
        .number()
        .int()
        .min(1)
        .max(50)
        .optional()
        .errText('每页条数需要是大于等于 1 小于等于 50 的整数'),
    };
  } else
    return {
      page: v.number().int().min(1).errText('页码需要是 >=1 的整数'),
      size: v
        .number()
        .int()
        .min(1)
        .max(50)
        .errText('每页条数需要是大于等于 1 小于等于 50 的整数'),
    };
};
export const pagination = (optional: boolean = false) => {
  return v.object(paginationProperty(optional));
};
