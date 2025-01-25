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
import BucketFileDir from './BucketFileDir';

class BucketFile extends Model<
  InferAttributes<BucketFile>,
  InferCreationAttributes<BucketFile>
> {
  // id can be undefined during creation when using `autoIncrement`
  declare id: string;
  declare bucketName: string;
  declare bucketRegion: string;
  declare fileName: string;
  declare fileType: string;
  declare fileUrl: string;

  declare dirId: CreationOptional<string | null>;
  declare directory?: NonAttribute<BucketFileDir>;

  declare cacheControl: CreationOptional<number | null>;
  declare size: CreationOptional<number | null>;
  declare description: CreationOptional<string | null>;

  declare updatedBy: CreationOptional<ForeignKey<User['id']> | null>;
  declare updater?: NonAttribute<User>;
  declare createdBy: CreationOptional<ForeignKey<User['id']> | null>;
  declare creator?: NonAttribute<User>;

  declare updatedAt: CreationOptional<number | null>;
  declare createdAt: number;

  declare static associations: {
    creator: Association<BucketFile, User>;
    updater: Association<BucketFile, User>;
    directory: Association<BucketFile, BucketFileDir>;
  };
}

BucketFile.init(
  {
    id: {
      type: DataTypes.STRING,
      unique: true,
    },
    bucketName: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    bucketRegion: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dirId: DataTypes.STRING,
    size: DataTypes.INTEGER,
    cacheControl: DataTypes.INTEGER,
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
  },
  {
    sequelize,
    timestamps: false,
    modelName: 'BucketFile',
  },
);

export default BucketFile;
export const BucketFileModel = BucketFile;
