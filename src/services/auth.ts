import { Request } from 'express';
import { AuthException, DatabaseException, UserException } from '@/exceptions';
import { encryptMD5, getTS } from '@/utils';
import BaseService from './base';
import { ERROR_CODE } from '@/exceptions/enums';
import { AuthParams } from '@/types';
import { AuthCode } from '@/utils/constants';

class Auth extends BaseService {
  constructor() {
    super();
  }

  /**
   * 查询 username 是否存在
   * @param username
   * @param ignoreCase 是否忽略大小写查询, 默认忽略
   * @returns {boolean}
   */
  async isUsernameExisting(username: string, ignoreCase: boolean = true) {
    // mysql查询默认不区分大小写
    const usernameQuery = ignoreCase
      ? this.sequelize.where(
          this.sequelize.fn('LOWER', this.sequelize.col('username')),
          username.toLowerCase(),
        )
      : { username };
    const user = await this.activeUserModel.findOne({
      where: usernameQuery,
      attributes: ['id', 'username'],
    });
    return !!user;
  }

  async loginAccount(p: AuthParams.Login) {
    const { username, password } = p;
    const encryptedPassword = await encryptMD5(password);
    const user = await this.activeUserModel.findOne({
      where: {
        username,
        // username: this.sequelize.where(
        //   this.sequelize.fn('LOWER', this.sequelize.col('username')),
        //   username.toLowerCase(),
        // ),
        password: encryptedPassword,
      },
      include: [
        {
          model: this.models.role,
          as: 'role',
        },
      ],
      attributes: ['id', 'username'],
    });

    if (!user) throw new AuthException(ERROR_CODE.AUTH_ERROR, 'User Not Found');

    // 附带用户auth字段
    const auth = await this.getAuthByUserId(user.id);
    type PickUser = Pick<typeof user, 'id' | 'username' | 'password'>;
    type RoleAttribute = { role: { id: number; name: string } };
    const data = {
      ...(user.dataValues as unknown as PickUser & RoleAttribute),
      auth,
    };
    return data;
  }

  async getUserById(id: number) {
    const user = await this.activeUserModel.findByPk(id, {
      include: [
        {
          model: this.models.role,
          as: 'role',
          include: [
            {
              model: this.models.auth,
              as: 'auth',
            },
          ],
        },
      ],
      attributes: { exclude: ['password', 'deletedAt', 'updatedAt'] },
    });
    if (!user) throw new UserException(ERROR_CODE.USER_NOT_FOUND);
    return {
      ...user.dataValues,
      role: {
        id: user.role.id,
        name: user.role.name,
        description: user.role.description,
      },
      auth: user.role.auth.map((a) => a.id),
    };
  }

  async getUsers(p: AuthParams.GetUsers) {
    const { id, username, rid, page = 1, size = 20 } = p;
    const where: any = {};
    if (id) where.id = id;
    if (username)
      where.username = {
        [this.Op.like]: '%' + username + '%',
      };
    if (rid) where.rid = rid;

    const criteria = {
      where,
      include: [
        {
          model: this.models.role,
          as: 'role',
        },
        {
          model: this.models.user,
          as: 'creator',
          attributes: ['id', 'username'],
        },
      ],
      attributes: { exclude: ['password'] },
      limit: size,
      offset: (page - 1) * size,
      distinct: true,
    };
    const users = await this.activeUserModel.findAndCountAll(criteria);
    return users;
  }

  async updateUserAccount(
    p: AuthParams.UpdateUserAccount,
    reqUser: Request['user'],
  ) {
    const user = await this.models.user.scope('fullInfo').findByPk(reqUser.id);
    if (!user) throw new AuthException(ERROR_CODE.USER_NOT_FOUND);

    if (p.username && p.username != user.username) {
      const exists = await this.isUsernameExisting(p.username);
      if (exists)
        throw new AuthException(ERROR_CODE.USER_EXISTS, '用户名已存在');
      user.username = p.username;
    }

    if (p.newPassword && p.password) {
      if (encryptMD5(p.password) !== user.dataValues.password)
        throw new AuthException(ERROR_CODE.AUTH_ERROR, '密码不正确');
      user.password = encryptMD5(p.newPassword);
    }

    await user.save();
    const newUser: any = await this.activeUserModel.findByPk(user.id, {
      include: [
        {
          model: this.models.role,
          as: 'role',
        },
      ],
      attributes: ['id', 'username', 'rid'],
    });
    if (!newUser) throw new UserException(ERROR_CODE.USER_NOT_FOUND);

    // 附带用户auth字段
    const auth = await this.getAuthByUserId(user.id);

    const data = {
      ...newUser.dataValues,
      auth,
      role: newUser.role,
    };
    return data;
  }

  async getAuthByUserId(uid: number): Promise<number[]> {
    const user = await this.activeUserModel.scope('active').findByPk(uid);
    if (!user) {
      throw new AuthException(ERROR_CODE.USER_NOT_FOUND);
    }
    const auth = await this.models.roleAuth.findAll({
      where: { rid: user.rid },
    });
    if (!auth) throw new AuthException(ERROR_CODE.AUTH_ERROR, 'Auth Not Found');
    return auth.map((a) => a.dataValues.aid);
  }

  /**
   * 创建管理员账号
   */
  async createAccount(p: {
    username: string;
    password: string;
    rid: number;
    cid?: number;
  }) {
    const t = await this.sequelize.transaction();
    try {
      const { username, password, rid, cid } = p;
      // 判断创建账号的角色是否为管理员类型（包含权限1)
      const authOfRole = await this.models.roleAuth.findAll({
        where: { rid: p.rid, aid: 1 },
      });
      if (!authOfRole || authOfRole.length == 0)
        throw new AuthException(ERROR_CODE.AUTH_ERROR, 'Unauthorized Role');

      // 判断用户名是否已被占用
      const usernameExists = await this.isUsernameExisting(username);
      if (usernameExists !== false) {
        throw new AuthException(ERROR_CODE.USER_EXISTS);
      }
      const currentTS = getTS();

      const user = await this.activeUserModel.create(
        {
          username,
          password: encryptMD5(password),
          rid,
          cid,
          createdAt: currentTS,
          updatedAt: currentTS,
        },

        { transaction: t },
      );
      if (!user)
        throw new DatabaseException(
          ERROR_CODE.DATABASE_ERROR,
          'Fail To Create New User',
        );

      await t.commit();
      const result = await this.activeUserModel
        .scope('active')
        .findByPk(user.id, {
          raw: true,
        });
      return result;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getAuthorities(p: { id?: number; name?: string; rid?: number }) {
    const { id, name } = p;

    const criteria: { id?: number; name?: string } = {};
    if (id) criteria.id = Number(id);
    if (name) criteria.name = name;

    const auth =
      (await this.models.auth.findAll({
        where: criteria,
        order: ['id'],
      })) || [];

    return auth;
  }

  async createAuthority(p: { id: number; name: string; description: string }) {
    const { id, name, description } = p;

    const idExists = await this.models.auth.findByPk(id);
    if (idExists)
      throw new AuthException(ERROR_CODE.AUTH_ERROR, 'auth already exists');

    const auth = await this.models.auth.create({
      id,
      name,
      description: description ?? '',
    });

    return auth;
  }

  async updateAuthority(p: {
    id: number;
    name?: string;
    description?: string;
  }) {
    const { id, name, description } = p;

    const auth = await this.models.auth.findByPk(id);
    if (!auth) throw new AuthException(ERROR_CODE.AUTH_ERROR, 'Auth Not Found');

    if (name) auth.name = name;
    if (description) auth.description = description;
    await auth.save();

    return auth;
  }

  async createRole(p: {
    id: number;
    name: string;
    description?: string;
    auth: number[];
  }) {
    const t = await this.sequelize.transaction();
    const { id, name, description, auth } = p;
    const roleExisting = await this.models.role.findByPk(id);
    if (roleExisting)
      throw new AuthException(ERROR_CODE.ROLE_ERROR, 'role exists');

    try {
      const role = await this.models.role.create(
        {
          id,
          name,
          description: description ?? '',
        },
        { transaction: t },
      );
      if (!role) throw new AuthException(ERROR_CODE.ROLE_ERROR);

      // 创建新的role auth映射关系
      const items = auth.map((a) => ({ rid: role.id, aid: a }));
      await this.models.roleAuth.bulkCreate(items, { transaction: t });

      await t.commit();
      return { ...role.dataValues, auth };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  /**
   * 获取角色列表, 在拥有权限3的情况下可以获取角色绑定的所有权限值
   * @param p
   * @returns
   */
  async getRoles(p: { id?: number; name?: string }) {
    const { id, name } = p;

    const criteria: { id?: number; name?: string } = {};
    if (id) criteria.id = Number(id);
    if (name) criteria.name = name;

    const roles = await this.models.role.findAll({
      where: criteria,
      include: [
        {
          model: this.models.auth,
          as: 'auth',
        },
      ],
      order: ['id'],
    });

    return roles.map((r) => ({
      ...r.dataValues,
      auth: r.auth.map((a: any) => {
        delete a.dataValues.RoleAuthority;
        return a.dataValues;
      }),
    }));
  }

  /**
   * 仅获取管理员角色
   */
  async getAdminRoles() {
    const roleAuths = await this.models.roleAuth.findAll({
      where: { aid: AuthCode.LOGIN_ADMIN },
    });
    const rids = roleAuths.map((r: any) => r.rid);
    const roles = await this.models.role.findAll({
      where: {
        id: { [this.Op.in]: rids },
      },
      include: [{ model: this.models.auth, as: 'auth' }],
      order: ['id'],
    });

    return roles;
  }

  async updateRole(p: AuthParams.UpdateRole) {
    const { id, name, description, auth } = p;

    const role = await this.models.role.findByPk(id);
    if (!role) throw new AuthException(ERROR_CODE.AUTH_ERROR, 'Role Not Found');

    if (name) role.name = name;
    if (description) role.description = description;
    if (auth) {
      const items = auth.map((a) => ({ rid: role.id, aid: a }));
      await this.models.roleAuth.destroy({
        where: { rid: role.id },
      });
      await this.models.roleAuth.bulkCreate(items);
      await role.save();
    }
    const newAuth = await this.getAuthByRoleId(role.id);
    return { ...role.dataValues, auth: newAuth };
  }

  async updateUserRole(p: AuthParams.UpdateUserRole) {
    const { id, rid } = p;

    const user = await this.activeUserModel.findByPk(id);
    if (!user) throw new AuthException(ERROR_CODE.USER_NOT_FOUND);
    const role = await this.models.role.findByPk(rid);
    if (!role) throw new AuthException(ERROR_CODE.AUTH_ERROR, 'Role Not Found');

    user.rid = role.id;
    return await user.save();
  }

  async getAuthByRoleId(rid: number) {
    const role = await this.models.role.findByPk(rid, {
      include: [{ model: this.models.auth, as: 'auth' }],
    });
    return role?.auth.map((a) => a.dataValues);
  }
}

export default new Auth();
