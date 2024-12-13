import { Express } from 'express';
import v1 from './v1';
import aliyunV1 from './v1/aliyun';

export default (app: Express) => {
  app.use('/api/aliyun', aliyunV1);
  app.use('/api/v1', v1);
};
