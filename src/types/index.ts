/// <reference types="node" />
import { NextFunction, Request, Response } from 'express';

export * from './common';

export type MiddleWare = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
