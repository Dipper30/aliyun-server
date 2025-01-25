import 'module-alias/register';
import express, { Express, NextFunction, Request, Response } from 'express';
import http, { Server } from 'http';
import router from '@/routers';
import { PROCESS_ENV } from '@/utils/constants';
import { getEnv, isEnv } from '@/utils';
import { APP_CONFIG } from '@/config';
import { errorHandler } from './middlewares';

if (isEnv(PROCESS_ENV.UNKNOWN)) {
  throw new Error('Unknown Process Env');
}
const ENV = getEnv();

const fileUpload = require('express-fileupload');
const app: Express = express();

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ limits: { fileSize: 1024 * 1024 * 20 } })); // <= 20MB

const PORT = APP_CONFIG.PORT;

app.all('*', async (req: Request, res: Response, next: NextFunction) => {
  const { origin, Origin, referer, Referer } = req.headers;
  const allowOrigin = origin || Origin || referer || Referer || '*';

  res.header('Access-Control-Allow-Origin', allowOrigin);
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, token',
  ); // with token
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true'); // with cookies
  res.header('X-Powered-By', 'Express');

  if (req.method == 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 设置路由
router(app);

// catch exception and log out error message
app.use(errorHandler);

app.use('*', (req: Request, res: Response) => {
  res.writeHead(404);
  res.end('404 Not Found');
});

const server: Server = http.createServer(app);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Aliyun Server Started Successfully on port ${PORT}!`);
  // eslint-disable-next-line no-console
  console.log(`Current Env: ${ENV}`);
});

export default app;
