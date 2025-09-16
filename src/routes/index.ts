import { Router } from 'express';
import usersRoutes from './users';
import { limiter } from '../middleware';

const router = Router();

router.use('/users', usersRoutes);

router.use(limiter);

export default router;
