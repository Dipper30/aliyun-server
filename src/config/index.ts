import fs from 'fs';
import path from 'path';
import dotEnv from 'dotenv';
import { Config } from '@/types';
import { ENV_VARIABLE, PROCESS_ENV } from '@/utils/constants';
import { Dialect } from 'sequelize';

// Read .env files
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath: string) =>
  path.resolve(appDirectory, relativePath);
const pathsDotenv = resolveApp('.env');
const ENV = process.env.NODE_ENV?.trim() || PROCESS_ENV.DEVELOPMENT;
if (ENV === PROCESS_ENV.DEVELOPMENT) {
  dotEnv.config({ path: `${pathsDotenv}.${PROCESS_ENV.DEVELOPMENT}` });
} else if (ENV === PROCESS_ENV.SIMULATION) {
  dotEnv.config({ path: `${pathsDotenv}.${PROCESS_ENV.SIMULATION}` });
} else if (ENV === PROCESS_ENV.PRODUCTION) {
  dotEnv.config({ path: `${pathsDotenv}.${PROCESS_ENV.PRODUCTION}` });
} else throw new Error('Unrecognized Runtime Environment!');

const getConfig = (attribute: ENV_VARIABLE) => {
  return process.env[attribute]?.trim() || '';
};

const APP_CONFIG = {
  PORT: parseInt(getConfig(ENV_VARIABLE.PORT)),
  DOMAIN: getConfig(ENV_VARIABLE.DOMAIN),

  KEYS: {
    TOKEN_PRIVATE_KEY: getConfig(ENV_VARIABLE.TOKEN_PRIVATE_KEY),
    TOKEN_PUBLIC_KEY: getConfig(ENV_VARIABLE.TOKEN_PUBLIC_KEY),
    TOKEN_EXPIRE_IN: parseInt(getConfig(ENV_VARIABLE.TOKEN_EXPIRE_IN)),
    MD5_PRIVATE_KEY: getConfig(ENV_VARIABLE.MD5_PRIVATE_KEY),
  },

  DB: {
    USERNAME: getConfig(ENV_VARIABLE.USERNAME),
    PASSWORD: getConfig(ENV_VARIABLE.PASSWORD),
    DATABASE: getConfig(ENV_VARIABLE.DATABASE),
    HOST: getConfig(ENV_VARIABLE.HOST),
    DIALECT: getConfig(ENV_VARIABLE.DIALECT),
    DIALECT_OPTION: getConfig(ENV_VARIABLE.DIALECT_OPTION),
  },
};
const db: Config.Database = {
  username: APP_CONFIG.DB.USERNAME,
  password: APP_CONFIG.DB.PASSWORD,
  host: APP_CONFIG.DB.HOST,
  dialect: APP_CONFIG.DB.DIALECT as Dialect,
  database: APP_CONFIG.DB.DATABASE,
};
if (ENV === PROCESS_ENV.DEVELOPMENT) {
  db.dialectOptions = { socketPath: '/tmp/mysql.sock' };
}

export { APP_CONFIG, db };
