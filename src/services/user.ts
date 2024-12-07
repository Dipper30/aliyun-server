import { User as UserModel } from '@/db/models';
import BaseService from './base';

class User extends BaseService {
  constructor() {
    super();
  }

  /**
   * 根据id获取用户信息
   * @param {number} id 用户id
   */
  async getUserById(id: number) {
    const user = await UserModel.findByPk(id, {
      attributes: { exclude: ['createdAt'] },
    });
    return user?.toJSON();
  }
}

export default new User();
