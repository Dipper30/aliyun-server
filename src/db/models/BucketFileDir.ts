import { isUnixTimeStamp } from '@/validators';
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

class BucketFileDir extends Model<
  InferAttributes<BucketFileDir>,
  InferCreationAttributes<BucketFileDir>
> {
  declare id: string;
  declare name: string;
  declare bucketName: string;
  declare bucketRegion: string;
  declare parentDirId: CreationOptional<string | null>;
  declare description: CreationOptional<string | null>;

  declare updatedBy: CreationOptional<ForeignKey<User['id']> | null>;
  declare updater?: NonAttribute<User>;
  declare createdBy: CreationOptional<ForeignKey<User['id']> | null>;
  declare creator?: NonAttribute<User>;

  declare updatedAt: CreationOptional<number | null>;
  declare createdAt: number;

  declare static associations: {
    creator: Association<BucketFileDir, User>;
    updater: Association<BucketFileDir, User>;
  };
}

BucketFileDir.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bucketName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bucketRegion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parentDirId: DataTypes.STRING,
    description: DataTypes.STRING,
    updatedBy: DataTypes.INTEGER,
    updatedAt: {
      type: DataTypes.INTEGER,
      validate: {
        isUnixTimeStamp,
      },
    },
    createdBy: DataTypes.INTEGER,
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
    timestamps: false,
    modelName: 'BucketFileDir',
  },
);

export default BucketFileDir;
export const BucketFileDirModel = BucketFileDir;
