import sequelize from './sequelize';
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Association,
  ForeignKey,
  NonAttribute,
} from 'sequelize';
import User from './User';
import { isUnixTimeStamp } from '@/validators/helpers';
import { AliyunInstanceStatus } from '@/types';

class Instance extends Model<
  InferAttributes<Instance>,
  InferCreationAttributes<Instance>
> {
  declare id: CreationOptional<number>;
  declare instanceId: string; // 阿里云实例ID
  declare instanceName: string; // 实例名称
  declare status: AliyunInstanceStatus; // 实例状态
  declare regionId: string; // 地域ID
  declare privateIpAddress: CreationOptional<string | null>; // 私网IP
  declare publicIpAddress: CreationOptional<string | null>; // 公网IP
  declare lastSyncTime: CreationOptional<number | null>; // 最后同步时间

  // 关联字段
  declare cid: CreationOptional<ForeignKey<User['id']> | null>;
  declare creator?: NonAttribute<User>;

  declare deletedAt: CreationOptional<Date | null>;
  declare updatedAt: CreationOptional<number | null>;
  declare createdAt: number;

  declare static associations: {
    creator: Association<Instance, User>;
  };
}

Instance.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    instanceId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: '阿里云实例ID',
    },
    instanceName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '实例名称',
    },
    status: {
      type: DataTypes.ENUM(
        'Pending',
        'Running',
        'Starting',
        'Stopping',
        'Stopped',
      ),
      allowNull: false,
      defaultValue: 'Pending',
      comment: '实例状态',
    },
    regionId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '地域ID',
    },
    privateIpAddress: {
      type: DataTypes.STRING,
      comment: '私网IP地址',
    },
    publicIpAddress: {
      type: DataTypes.STRING,
      comment: '公网IP地址',
    },
    lastSyncTime: {
      type: DataTypes.INTEGER,
      comment: '最后同步时间',
      validate: {
        isUnixTimeStamp,
      },
    },
    cid: DataTypes.INTEGER,
    deletedAt: DataTypes.DATE,
    updatedAt: {
      type: DataTypes.INTEGER,
      validate: {
        isUnixTimeStamp,
      },
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
    defaultScope: {
      attributes: {
        exclude: ['deletedAt'],
      },
    },
    scopes: {
      active: {
        where: {
          deletedAt: null,
        },
        attributes: {
          exclude: ['deletedAt'],
        },
      },
      fullInfo: {
        where: {
          deletedAt: null,
        },
      },
    },
    modelName: 'Instance',
    tableName: 'instances',
  },
);

Instance.belongsTo(User, { foreignKey: 'cid', targetKey: 'id', as: 'creator' });

export default Instance;
export const InstanceModel = Instance;
