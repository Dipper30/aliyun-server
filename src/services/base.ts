import { Custom } from '@/types';
import {
  UserModel,
  RoleModel,
  AuthModel,
  RoleAuthModel,
  BucketFileDirModel,
  BucketFileModel,
  sequelize,
} from '@/db/models';
import { Op } from 'sequelize';

export default class BaseService {
  pager: Custom.Pagination = { page: 1, size: 20 };

  Op: typeof Op;
  models: {
    user: typeof UserModel;
    role: typeof RoleModel;
    auth: typeof AuthModel;
    roleAuth: typeof RoleAuthModel;
    bucketFileDir: typeof BucketFileDirModel;
    bucketFile: typeof BucketFileModel;
  };
  sequelize;

  constructor() {
    this.models = {
      user: UserModel,
      role: RoleModel,
      auth: AuthModel,
      roleAuth: RoleAuthModel,
      bucketFile: BucketFileModel,
      bucketFileDir: BucketFileDirModel,
    };
    this.sequelize = sequelize;
    this.Op = Op;
  }

  get activeUserModel() {
    return this.models.user.scope('active');
  }

  /**
   * 生成分页参数
   * @param {PagingParams | undefined} p
   * @returns { offset: number, limit: number }
   */
  createPager<T = any>(options?: Custom.Pagination<T>) {
    const pager = { ...this.pager } as { page: number; size: number };
    const p = options?.pagination;
    if (p?.page) pager.page = p.page;
    if (p?.size) pager.size = p.size;
    return {
      offset: (pager.page - 1) * pager.size,
      limit: pager.size,
    };
  }

  /**
   * 生成排序查询语句, 默认为空数组
   */
  createSortClause(sortParams?: Record<string, number>) {
    const sortClause: any = [];
    if (!sortParams) return sortClause;
    for (const key in sortParams) {
      if (sortParams[key] > 0) sortClause.push([key]);
      else sortClause.push([key, 'desc']);
    }
    return sortClause;
  }
}
