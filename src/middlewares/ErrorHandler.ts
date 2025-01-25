import { NextFunction, Request, Response } from 'express';
import { ValidationError, BaseError as SequelizeBaseError } from 'sequelize';

// Error handler middleware
const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  if (err) {
    if (err instanceof ValidationError) {
      res.status(200).json({
        success: false,
        code: 500,
        msg: 'Sequelize Validation Error',
        errMsg: err.message,
      });
    } else if (err instanceof SequelizeBaseError) {
      res.status(200).json({
        success: false,
        code: 500,
        msg: 'Sequelize Error',
        errMsg: err.message,
      });
    } else {
      const status = err.code ? 200 : 500;
      if (status === 500) {
        console.error(`uncaught error `, err);
        res.status(500).json({
          success: false,
          code: 500,
          msg: 'Internal Error',
          errMsg: err.message,
        });
      } else {
        res.status(status).json({
          success: false,
          code: err.code || 500,
          msg: err.msg || 'Bad Request',
          errMsg: err.message || err.errMsg,
        });
      }
    }
  }
};

export default errorHandler;
