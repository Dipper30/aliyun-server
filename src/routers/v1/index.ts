import { Router } from 'express';
import {
  AppController,
  AuthController,
  HomeController,
  InstanceController,
} from '@/controllers';
import { AppValidator, AuthValidator, ValidatorV1 } from '@/validators';
import { authChecker, bodyValidator, paramsValidator } from '@/middlewares';
import NoRoute from '../NoRoute';
import { AuthCode, RoleCode } from '@/utils/constants';
// import gitRouter from './git';

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

// #region application
router.post(
  '/application',
  authChecker({ role: [RoleCode.SUPER_ADMIN] }),
  bodyValidator(AppValidator.create()),
  AppController.create,
);

router.post(
  '/application/query',
  bodyValidator(AppValidator.query()),
  AppController.query,
);

router.post(
  '/application/instance/insert',
  // authChecker({ role: [RoleCode.SUPER_ADMIN] }),
  bodyValidator(ValidatorV1.insertInstance()),
  AppController.insertInstance,
);

router.post(
  '/application/instance/insert',
  // authChecker({ role: [RoleCode.SUPER_ADMIN] }),
  bodyValidator(ValidatorV1.insertInstance()),
  AppController.insertInstance,
);

router.get(
  '/application/git/repo',
  // authChecker({ role: [RoleCode.SUPER_ADMIN] }),
  bodyValidator(ValidatorV1.appById()),
  AppController.getRepoInfo,
);

router.post(
  '/application/git/workflow/list',
  // authChecker({ role: [RoleCode.SUPER_ADMIN] }),
  bodyValidator(ValidatorV1.appById()),
  AppController.listGitWorkflows,
);

router.post(
  '/application/git/workflow/trigger',
  // authChecker({ role: [RoleCode.SUPER_ADMIN] }),
  bodyValidator(ValidatorV1.triggerWorkflow()),
  AppController.triggerGitWorkflow,
);

router.post(
  '/application/git/run/list',
  // authChecker({ role: [RoleCode.SUPER_ADMIN] }),
  bodyValidator(ValidatorV1.listGitWorkflowRuns()),
  AppController.listGitWorkflowRuns,
);

router.post(
  '/application/git/run/detail',
  // authChecker({ role: [RoleCode.SUPER_ADMIN] }),
  bodyValidator(ValidatorV1.getGitWorkflowRun()),
  AppController.getGitWorkflowRun,
);

router.post(
  '/application/git/run/job/list',
  // authChecker({ role: [RoleCode.SUPER_ADMIN] }),
  bodyValidator(ValidatorV1.getGitWorkflowRun()),
  AppController.listGitWorkflowRunJobs,
);

router.post(
  '/application/git/run/job/detail',
  // authChecker({ role: [RoleCode.SUPER_ADMIN] }),
  bodyValidator(ValidatorV1.getGitWorkflowRunJobLogs()),
  AppController.getGitWorkflowRunJobDetail,
);

router.post(
  '/application/git/run/job/logs/query',
  // authChecker({ role: [RoleCode.SUPER_ADMIN] }),
  bodyValidator(ValidatorV1.getGitWorkflowRunJobLogs()),
  AppController.getGitWorkflowRunJobLogs,
);

router.post(
  '/application/git/run/logs/query',
  // authChecker({ role: [RoleCode.SUPER_ADMIN] }),
  bodyValidator(ValidatorV1.getGitWorkflowRun()),
  AppController.getGitWorkflowRunLogs,
);
// #endregion

// #region instance
// 同步实例状态
router.post(
  '/instance/sync',
  authChecker({ role: [RoleCode.SUPER_ADMIN] }),
  bodyValidator(ValidatorV1.syncInstanceStatus()),
  InstanceController.syncInstanceStatus,
);

router.post(
  '/instance/query',
  bodyValidator(ValidatorV1.searchInstances()),
  InstanceController.searchInstances,
);

// #endregion

// #region git
// router.use('/git', gitRouter);
// #endregion

// router.use('/server-apps', serverAppRouter);

router.all('*', NoRoute);

export default router;
