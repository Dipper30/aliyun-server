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
import Role from './Role';
import Authority from './Authority';
import { isUnixTimeStamp } from '@/validators/helpers';

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare username: string;
  declare password: string;
  declare avatar: CreationOptional<string | null>;

  declare rid: ForeignKey<Role['id']>;
  declare role: NonAttribute<Role>;

  declare auth: NonAttribute<Authority[]>;

  declare cid: CreationOptional<ForeignKey<User['id']> | null>;
  declare creator?: NonAttribute<User>;

  declare deletedAt: CreationOptional<Date | null>;
  declare updatedAt: CreationOptional<number | null>;
  declare createdAt: number;

  declare static associations: {
    role: Association<User, Role>;
    creator: Association<User, User>;
    auth: Association<User, Authority>;
  };
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
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      get() {
        return '';
      },
    },
    avatar: {
      type: DataTypes.STRING,
      // get() {
      //   return FileService.getCDNFileUrl(this.getDataValue('avatar'))
      // },
      // set(value: string | null) {
      //   this.setDataValue('avatar', value)
      // },
    },
    rid: DataTypes.INTEGER,
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
        exclude: ['password', 'deletedAt'],
      },
    },
    scopes: {
      active: {
        where: {
          deletedAt: null,
        },
        attributes: {
          exclude: ['password', 'deletedAt'],
        },
      },
      fullInfo: {
        where: {
          deletedAt: null,
        },
      },
    },
    modelName: 'User',
  },
);

User.belongsTo(User, { foreignKey: 'cid', targetKey: 'id', as: 'creator' });
User.belongsTo(Role, { foreignKey: 'rid', targetKey: 'id', as: 'role' });

export default User;
export const UserModel = User;
