import { Router } from 'express';
import { bodyValidator, paramsValidator } from '@/validators/helpers';
import NoRoute from '../NoRoute';
import { AliyunValidator as v } from '@/validators';
import { AliyunController, CdnController } from '@/controllers';
import { authChecker } from '@/middlewares';
import { RoleCode } from '@/utils/constants';

const router: Router = Router();

router.post('/test', bodyValidator(v.postTest()), (req, res) => {
  res.json(2);
});

router.get('/regions', AliyunController.getRegions);

router.get(
  '/zones/:region',
  paramsValidator(['region']),
  AliyunController.getZones,
);

router.post(
  '/instance/statuses/query',
  bodyValidator(v.getInstanceStatuses()),
  AliyunController.getInstanceStatuses,
);

router.post(
  '/instance/details/query',
  bodyValidator(v.getInstanceDetails()),
  AliyunController.getInstanceDetails,
);

router.post(
  '/instance/start',
  authChecker({ role: [RoleCode.SUPER_ADMIN] }),
  bodyValidator(v.startInstance()),
  AliyunController.startInstance,
);

// router.post(
//   '/instances/start',
//   bodyValidator(v.startInstance()),
//   AliyunController.startInstance,
// );

router.post(
  '/instance/stop',
  authChecker({ role: [RoleCode.SUPER_ADMIN] }),
  bodyValidator(v.stopInstance()),
  AliyunController.stopInstance,
);

router.post(
  '/agent/runCommand',
  authChecker({ role: [RoleCode.SUPER_ADMIN] }),
  bodyValidator(v.runCommand()),
  AliyunController.runCommand,
);

router.post(
  '/agent/invocationResults/query',
  bodyValidator(v.getInvocationResults()),
  AliyunController.getInvocationResults,
);

router.post(
  '/agent/file/send',
  bodyValidator(v.sendFile()),
  AliyunController.sendFile,
);

// #region Cdn
router.post('/cdn/getSts', CdnController.getSts);
router.post('/cdn/bucket/query', CdnController.getBuckets);
router.get(
  '/cdn/bucket/:name',
  paramsValidator(['name']),
  CdnController.getBucketDetail,
);
router.post(
  '/cdn/presignedUrlForOss',
  bodyValidator(v.getPresignedUrl()),
  CdnController.getPresignedUrlForOss,
);

router.post(
  '/cdn/file/query',
  bodyValidator(v.listFilesByDirectory()),
  CdnController.getFiles,
);

router.post(
  '/cdn/file',
  bodyValidator(v.saveBucketFile()),
  CdnController.saveBucketFile,
);

router.post(
  '/cdn/file/getUrl',
  bodyValidator(v.getFilePresignedUrl()),
  CdnController.getFilePresignedUrl,
);

router.delete(
  '/cdn/files',
  authChecker({ role: [RoleCode.SUPER_ADMIN] }),
  bodyValidator(v.deleteBucketFiles()),
  CdnController.deleteBucketFiles,
);

router.post(
  '/cdn/directory',
  bodyValidator(v.createBucketDirectory()),
  CdnController.createBucketDirectory,
);

// #endregion

// #region Voice
router.post(
  '/voice/tts/start',
  bodyValidator(v.startTTSTask()),
  CdnController.startTTSTask,
);

// #endregion

router.all('*', NoRoute);

export default router;
