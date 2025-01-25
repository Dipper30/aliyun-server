import sequelize from './sequelize';
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

class Authority extends Model<
  InferAttributes<Authority>,
  InferCreationAttributes<Authority>
> {
  // id can be undefined during creation when using `autoIncrement`
  declare id: number;
  declare name: string;
  declare description: CreationOptional<string | null>;
}

Authority.init(
  {
    id: {
      primaryKey: true,
      type: DataTypes.INTEGER,
      unique: true,
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
    modelName: 'Authority',
  },
);

export default Authority;
export const AuthModel = Authority;
