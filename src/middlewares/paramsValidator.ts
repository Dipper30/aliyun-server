import { Request, Response, NextFunction } from 'express';
import { ParameterException } from '@/exceptions';

const paramsValidator = (keys: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = keys.find((key) => !req.params[key]);
    if (key) {
      next(new ParameterException(null, `Missing Param ${key}`));
    } else {
      next();
    }
  };
};

export default paramsValidator;
