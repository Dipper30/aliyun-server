import sequelize from './sequelize';
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  NonAttribute,
  Association,
} from 'sequelize';
import User from './User';
import { isUnixTimeStamp } from '@/validators';
import { AppInfo, AppType } from '@/types';
import ApplicationInstance from './ApplicationInstance';
import Instance from './Instance';

class Application extends Model<
  InferAttributes<Application>,
  InferCreationAttributes<Application>
> {
  // id can be undefined during creation when using `autoIncrement`
  declare id: CreationOptional<number>;
  declare name: string;
  declare code: string;
  declare gitRepo: string;
  declare type: AppType;
  declare info: AppInfo;

  declare description: CreationOptional<string | null>;

  declare updatedBy: CreationOptional<ForeignKey<User['id']> | null>;
  declare updater?: NonAttribute<User>;
  declare createdBy: CreationOptional<ForeignKey<User['id']> | null>;
  declare creator?: NonAttribute<User>;

  declare updatedAt: CreationOptional<number | null>;
  declare createdAt: number;
  declare deletedAt: CreationOptional<Date | null>;

  declare instances: NonAttribute<Instance[]>;
  declare static associations: {
    instances: Association<Application, Instance>;
  };
}

Application.init(
  {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    info: DataTypes.JSON,
    gitRepo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: DataTypes.STRING,
    updatedBy: {
      type: DataTypes.INTEGER,
    },
    updatedAt: {
      type: DataTypes.INTEGER,
      validate: {
        isUnixTimeStamp,
      },
    },
    createdBy: {
      type: DataTypes.INTEGER,
    },
    createdAt: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isUnixTimeStamp,
      },
    },
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    timestamps: false,
    modelName: 'Application',
    defaultScope: {
      attributes: {
        exclude: ['deletedAt'],
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: {
            exclude: ['password', 'deletedAt', 'createdAt', 'updatedAt'],
          },
        },
        {
          model: Instance,
          as: 'instances',
        },
      ],
    },
    scopes: {
      active: {
        where: {
          deletedAt: null,
        },
        attributes: {
          exclude: ['deletedAt'],
        },
        include: [
          {
            model: User,
            as: 'creator',
            attributes: {
              exclude: ['password', 'deletedAt', 'createdAt', 'updatedAt'],
            },
          },
          {
            model: Instance,
            as: 'instances',
          },
        ],
      },
      fullInfo: {
        where: {
          deletedAt: null,
        },
        include: [
          {
            model: User,
            as: 'creator',
            attributes: {
              exclude: ['password', 'deletedAt', 'createdAt', 'updatedAt'],
            },
          },
          {
            model: Instance,
            as: 'instances',
          },
        ],
      },
    },
  },
);

Application.belongsTo(User, {
  foreignKey: 'createdBy',
  targetKey: 'id',
  as: 'creator',
});

export default Application;
export const AppModel = Application;
