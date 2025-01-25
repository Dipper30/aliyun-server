import sequelize from './sequelize';
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  ForeignKey,
  Association,
  NonAttribute,
} from 'sequelize';
import Authority from './Authority';
import Role from './Role';

class RoleAuthority extends Model<
  InferAttributes<RoleAuthority>,
  InferCreationAttributes<RoleAuthority>
> {
  declare rid: ForeignKey<Role['id']>;
  declare aid: ForeignKey<Authority['id']>;

  declare auth: NonAttribute<Authority>;
  declare role: NonAttribute<Role>;

  static associations: {
    role: Association<RoleAuthority, Role>;
    auth: Association<RoleAuthority, Authority>;
  };
}
RoleAuthority.init(
  {
    rid: {
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    aid: {
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: 'RoleAuthority',
  },
);
Authority.belongsToMany(Role, {
  through: RoleAuthority,
  foreignKey: 'aid',
});
Role.belongsToMany(Authority, {
  through: RoleAuthority,
  foreignKey: 'rid',
  as: 'auth',
});

export default RoleAuthority;
export const RoleAuthModel = RoleAuthority;
