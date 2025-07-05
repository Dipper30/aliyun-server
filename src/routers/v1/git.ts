// import { Router } from 'express';
// import GitController from '@/controllers/git';
// import authChecker from '@/middlewares/authChecker';
// import { RoleCode } from '@/utils/constants';

// const router = Router();

// // Repository information
// router.get(
//   '/repo/:gitRepo/info',
//   authChecker({ role: [RoleCode.SUPER_ADMIN, RoleCode.ADMIN] }),
//   GitController.getRepoInfo,
// );

// // Workflow management
// router.get(
//   '/repo/:gitRepo/workflows',
//   authChecker({ role: [RoleCode.SUPER_ADMIN, RoleCode.ADMIN] }),
//   GitController.listWorkflows,
// );

// router.post(
//   '/repo/:gitRepo/workflows/:workflowId/trigger',
//   authChecker({ role: [RoleCode.SUPER_ADMIN, RoleCode.ADMIN] }),
//   GitController.triggerWorkflow,
// );

// router.get(
//   '/repo/:gitRepo/workflows/:workflowId/runs',
//   authChecker({ role: [RoleCode.SUPER_ADMIN, RoleCode.ADMIN] }),
//   GitController.getWorkflowRuns,
// );

// router.get(
//   '/repo/:gitRepo/runs/:runId',
//   authChecker({ role: [RoleCode.SUPER_ADMIN, RoleCode.ADMIN] }),
//   GitController.getWorkflowRun,
// );

// router.post(
//   '/repo/:gitRepo/runs/:runId/cancel',
//   authChecker({ role: [RoleCode.SUPER_ADMIN, RoleCode.ADMIN] }),
//   GitController.cancelWorkflowRun,
// );

// router.get(
//   '/repo/:gitRepo/runs/:runId/logs',
//   authChecker({ role: [RoleCode.SUPER_ADMIN, RoleCode.ADMIN] }),
//   GitController.getWorkflowLogs,
// );

// router.get(
//   '/repo/:gitRepo/runs/:runId/wait',
//   authChecker({ role: [RoleCode.SUPER_ADMIN, RoleCode.ADMIN] }),
//   GitController.waitForWorkflowCompletion,
// );

// // Deployment management
// router.post(
//   '/repo/:gitRepo/deployments',
//   authChecker({ role: [RoleCode.SUPER_ADMIN, RoleCode.ADMIN] }),
//   GitController.createDeployment,
// );

// router.get(
//   '/repo/:gitRepo/deployments/:deploymentId/status',
//   authChecker({ role: [RoleCode.SUPER_ADMIN, RoleCode.ADMIN] }),
//   GitController.getDeploymentStatus,
// );

// // Repository operations
// router.get(
//   '/repo/:gitRepo/branches',
//   authChecker({ role: [RoleCode.SUPER_ADMIN, RoleCode.ADMIN] }),
//   GitController.getBranches,
// );

// router.get(
//   '/repo/:gitRepo/tags',
//   authChecker({ role: [RoleCode.SUPER_ADMIN, RoleCode.ADMIN] }),
//   GitController.getTags,
// );

// router.get(
//   '/repo/:gitRepo/commits/:sha',
//   authChecker({ role: [RoleCode.SUPER_ADMIN, RoleCode.ADMIN] }),
//   GitController.getCommit,
// );

// router.get(
//   '/repo/:gitRepo/commits/:sha/checks',
//   authChecker({ role: [RoleCode.SUPER_ADMIN, RoleCode.ADMIN] }),
//   GitController.getStatusChecks,
// );

// // Application-specific CI/CD
// router.post(
//   '/apps/:appId/deploy',
//   authChecker({ role: [RoleCode.SUPER_ADMIN, RoleCode.ADMIN] }),
//   GitController.triggerAppDeployment,
// );

// router.get(
//   '/apps/:appId/deployment-status',
//   authChecker({ role: [RoleCode.SUPER_ADMIN, RoleCode.ADMIN] }),
//   GitController.getAppDeploymentStatus,
// );

// export default router;
