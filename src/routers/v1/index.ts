import { Router } from 'express';
import { AuthController, HomeController } from '@/controllers';
import { AuthValidator } from '@/validators';
import { authChecker, bodyValidator, paramsValidator } from '@/middlewares';
import NoRoute from '../NoRoute';
import { AuthCode, RoleCode } from '@/utils/constants';

const router: Router = Router();

// 账号与用户
router.post(
  '/login',
  bodyValidator(AuthValidator.login()),
  AuthController.login,
);
router.post(
  '/autoLogin',
  bodyValidator(AuthValidator.autoLogin()),
  AuthController.autoLogin,
);
router.post('/logout', AuthController.logout);
router.post(
  '/users/query',
  bodyValidator(AuthValidator.getUsers()),
  AuthController.getUsers,
);
router.get('/user/:id', paramsValidator(['id']), AuthController.getUserById);
router.post(
  '/usernameAvailability',
  bodyValidator(AuthValidator.getUsernameAvailability()),
  AuthController.isUsernameAvailable,
);
// 创建管理员账号
router.post(
  '/account',
  authChecker({
    auth: [AuthCode.CREATE_ACCOUNT],
  }),
  bodyValidator(AuthValidator.createAccount()),
  AuthController.createAccount,
);

// 修改用户信息，仅自己修改
router.put(
  '/account',
  authChecker({ auth: [AuthCode.LOGIN_ADMIN] }),
  bodyValidator(AuthValidator.updateUserAccount()),
  AuthController.updateUserAccount,
);

router.post(
  '/authority',
  authChecker({
    auth: [AuthCode.LOGIN_ADMIN, AuthCode.MODIFY_AUTH],
  }),
  bodyValidator(AuthValidator.createAuthority()),
  AuthController.createAuthority,
);
router.get(
  '/authorities',
  authChecker({
    role: [AuthCode.LOGIN_ADMIN, AuthCode.CREATE_ACCOUNT],
  }),
  bodyValidator(AuthValidator.getAuthorities()),
  AuthController.getAuthorities,
);
router.put(
  '/authority',
  authChecker({
    auth: [AuthCode.MODIFY_AUTH],
  }),
  bodyValidator(AuthValidator.updateAuthority()),
  AuthController.updateAuthority,
);

router.post(
  '/role',
  authChecker({
    auth: [AuthCode.LOGIN_ADMIN, AuthCode.MODIFY_AUTH],
  }),
  bodyValidator(AuthValidator.createRole()),
  AuthController.createRole,
);
router.get(
  '/roles',
  authChecker({ auth: [AuthCode.LOGIN_ADMIN] }),
  bodyValidator(AuthValidator.getRoles()),
  AuthController.getRoles,
);
router.put(
  '/role',
  authChecker({
    auth: [AuthCode.LOGIN_ADMIN, AuthCode.MODIFY_AUTH],
  }),
  bodyValidator(AuthValidator.updateRole()),
  AuthController.updateRole,
);

router.put(
  '/user/role',
  authChecker({
    role: [RoleCode.SUPER_ADMIN],
  }),
  bodyValidator(AuthValidator.updateUserRole()),
  AuthController.updateUserRole,
);

router.get(
  '/adminRoles',
  authChecker({ auth: [AuthCode.LOGIN_ADMIN] }),
  AuthController.getAdminRoles,
);

// 首页
// current active users
router.get(
  '/cau',
  authChecker({ role: [RoleCode.SUPER_ADMIN, RoleCode.ADMIN] }),
  HomeController.getCurrentActiveUsers,
);
// daily active users
router.get(
  '/dau',
  authChecker({ role: [RoleCode.SUPER_ADMIN, RoleCode.ADMIN] }),
  HomeController.getDailyActiveUsers,
);
// monthly active users
router.get(
  '/mau',
  authChecker({ role: [RoleCode.SUPER_ADMIN, RoleCode.ADMIN] }),
  HomeController.getMonthlyActiveUsers,
);

router.all('*', NoRoute);

export default router;
