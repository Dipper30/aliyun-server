import { Router } from 'express';
import { bodyValidator, paramsValidator } from '@/validators/helpers';
import { UserController } from '@/controllers';
import NoRoute from '../NoRoute';
import { ValidatorV1 as v1 } from '@/validators';

const router: Router = Router();

router.post('/test', bodyValidator(v1.postTest()), (req, res) => {
  res.json(1);
});

router.get('/user/:id', paramsValidator(['id']), UserController.getUserById);

router.all('*', NoRoute);

export default router;
