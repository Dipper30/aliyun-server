import Ecs20140526, * as $Ecs20140526 from '@alicloud/ecs20140526';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import Util, * as $Util from '@alicloud/tea-util';
import * as $tea from '@alicloud/tea-typescript';
import { Router } from 'express';
import { bodyValidator, paramsValidator } from '@/validators/helpers';
import NoRoute from '../NoRoute';
import { AliyunValidator as v } from '@/validators';
import { AliyunController } from '@/controllers';

const router: Router = Router();

router.post('/test', bodyValidator(v.postTest()), (req, res) => {
  res.json(1);
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
  bodyValidator(v.stopInstance()),
  AliyunController.stopInstance,
);

router.post(
  '/agent/runCommand',
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

router.all('*', NoRoute);

export default router;
