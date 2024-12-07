/* eslint-disable no-console */
import { Sequelize } from 'sequelize';
import { db as config } from '@/config';

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config,
);

sequelize
  .authenticate()
  .then(() => {
    console.log('database connected ');
  })
  .catch((err: any) => {
    console.error('Unable to connect to database ', err);
  });

export default sequelize;
