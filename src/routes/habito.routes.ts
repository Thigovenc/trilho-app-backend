import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import validate from '../middleware/validate.middleware';
import { criarHabitoSchema } from '../validations/habito.validation';
import { criarHabito, listarHabitos } from '../controllers/habito.controller';

const router = Router();
router.use(authMiddleware);

// @route   POST /api/habitos
router.post('/', validate(criarHabitoSchema), criarHabito);

// @route   GET /api/habitos
router.get('/', listarHabitos);

export default router;
