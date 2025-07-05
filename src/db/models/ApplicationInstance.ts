import sequelize from './sequelize';
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  ForeignKey,
  Association,
  NonAttribute,
  CreationOptional,
} from 'sequelize';
import Instance from './Instance';
import Application from './Application';

class ApplicationInstance extends Model<
  InferAttributes<ApplicationInstance>,
  InferCreationAttributes<ApplicationInstance>
> {
  declare id: CreationOptional<number>;
  declare appId: ForeignKey<Application['id']>;
  declare instanceId: ForeignKey<Instance['id']>;
  declare env: string;
  declare localPort: number; // 本地端口
  declare port: number; // 暴露端口
  declare testPort: number; // 拨测端口
  declare testPath: string; // 拨测路径
  declare createdAt: number;
  declare updatedAt: CreationOptional<number>;

  declare application: NonAttribute<Application>;
  declare instance: NonAttribute<Instance>;

  static associations: {
    application: Association<ApplicationInstance, Application>;
    instance: Association<ApplicationInstance, Instance>;
  };
}

ApplicationInstance.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    appId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    instanceId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    env: {
      type: DataTypes.STRING(16),
      allowNull: false,
    },
    localPort: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: () => 8080,
    },
    port: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: () => 8080,
    },
    testPort: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: () => 8080,
    },
    testPath: {
      type: DataTypes.STRING(100),
      defaultValue: () => '/status',
    },
    createdAt: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: () => Math.floor(Date.now() / 1000),
    },
    updatedAt: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: () => Math.floor(Date.now() / 1000),
    },
  },
  {
    sequelize,
    tableName: 'ApplicationInstances',
    modelName: 'ApplicationInstance',
    timestamps: false,
  },
);

Application.belongsToMany(Instance, {
  through: ApplicationInstance,
  as: 'instances',
  foreignKey: 'appId',
  otherKey: 'instanceId',
});

Instance.belongsToMany(Application, {
  through: ApplicationInstance,
  as: 'application',
  foreignKey: 'instanceId',
  otherKey: 'appId',
});

export default ApplicationInstance;
export const AppInstanceModel = ApplicationInstance;
