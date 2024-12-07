import sequelize from './sequelize';
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { isUnixTimeStamp } from '@/validators';

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare username: string;
  declare createdAt: number;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    createdAt: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isUnixTimeStamp,
      },
    },
  },
  {
    sequelize,
    createdAt: false,
    updatedAt: false,
    modelName: 'User',
  },
);

export type UserModel = typeof User;
export { User };
