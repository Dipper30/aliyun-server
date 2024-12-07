import { Router } from 'express';
import { bodyValidator, paramsValidator } from '@/validators';
import { UserController } from '@/controllers';
import NoRoute from './NoRoute';
import { postTest } from '@/validators/params';

const router: Router = Router();

router.post('/test', bodyValidator(postTest()), (req, res) => {
  res.json(1);
});

router.get('/user/:id', paramsValidator(['id']), UserController.getUserById);

router.all('*', NoRoute);

export default router;
