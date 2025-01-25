import { Request, Response, NextFunction } from 'express';
import { AllValidator } from 'aptx-validator';
import { ParameterException } from '@/exceptions';

const bodyValidator = (v: AllValidator) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const isValid = v.test(req.body);
    if (!isValid) {
      next(new ParameterException(null, v.getErrText()));
    } else {
      next();
    }
  };
};

export default bodyValidator;
