import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getStatsGlobais } from '../controllers/stats.controller';

const router = Router();

router.use(authMiddleware);

router.get('/globais', getStatsGlobais);

export default router;
