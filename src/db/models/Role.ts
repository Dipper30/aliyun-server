import Authority from './Authority';
import sequelize from './sequelize';
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
  Association,
} from 'sequelize';

class Role extends Model<InferAttributes<Role>, InferCreationAttributes<Role>> {
  declare id: number;
  declare name: string;
  declare description: CreationOptional<string | null>;

  declare auth: NonAttribute<Authority[]>;
  declare static associations: {
    auth: Association<Role, Authority>;
  };
}

Role.init(
  {
    id: {
      primaryKey: true,
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    description: DataTypes.STRING,
  },
  {
    sequelize,
    timestamps: false,
    modelName: 'Role',
  },
);

export default Role;
export const RoleModel = Role;
