export enum ERROR_CODE {
  REQUEST_NOT_FOUND = 404, // 请求未被正确路由接收
  SERVER_ERROR = 500, // 服务器内部错误

  // common error code
  TOKEN_ERROR = 1000, // token默认错误
  TOKEN_PARSE_ERROR = 1001,
  TOKEN_EXPIRED = 1002,
  MISSING_TOKEN = 1004,
  INCORRECT_PASSWORD = 1020, // 错误密码
  PARAMETER_ERROR = 1025, // 参数错误
  DATABASE_ERROR = 1030,

  USER_ERROR = 2000, // 权限默认错误
  USER_EXISTS = 2001, // 用户已存在
  USER_NOT_FOUND = 2004, // 用户不存在
  AUTH_ERROR = 2020, // 权限错误
  ROLE_ERROR = 2030, // 角色错误

  FILE_ERROR = 9000, // 文件错误
  NO_FILE_UPLOADED = 9004, // 未上传文件
}

export const ERROR_TEXT: Record<ERROR_CODE, string> = {
  [ERROR_CODE.SERVER_ERROR]: 'Server Error',
  [ERROR_CODE.TOKEN_ERROR]: 'Token Error',
  [ERROR_CODE.TOKEN_PARSE_ERROR]: 'Token Parse Error',
  [ERROR_CODE.MISSING_TOKEN]: 'Missing Token',
  [ERROR_CODE.TOKEN_EXPIRED]: 'Token Expired',
  [ERROR_CODE.PARAMETER_ERROR]: 'Parameter Error',
  [ERROR_CODE.DATABASE_ERROR]: 'Database Error',
  [ERROR_CODE.INCORRECT_PASSWORD]: 'Incorrect Password',

  [ERROR_CODE.USER_ERROR]: 'User Error',
  [ERROR_CODE.USER_EXISTS]: 'User Already Exists',
  [ERROR_CODE.USER_NOT_FOUND]: 'User Not Found',
  [ERROR_CODE.AUTH_ERROR]: 'Auth Error',
  [ERROR_CODE.ROLE_ERROR]: 'Role Error',

  [ERROR_CODE.REQUEST_NOT_FOUND]: 'Request Not Responding',

  [ERROR_CODE.FILE_ERROR]: 'File Error',
  [ERROR_CODE.NO_FILE_UPLOADED]: 'No File Uploaded',
};
