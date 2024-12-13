import { NextFunction, Request, Response } from 'express';

// Error handler middleware
const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err) {
    const status = err.code ? 200 : 500;
    res.status(status).json({
      code: err.code || 500,
      errMsg: err.errMsg || '',
      msg: err.msg || 'Bad Request',
      link: err?.options?.link || undefined,
    });
  } else next();
};

export default errorHandler;
