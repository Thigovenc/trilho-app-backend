import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import validate from '../middleware/validate.middleware';
import { criarHabitoSchema } from '../validations/habito.validation';
import {
  criarHabito,
  listarHabitos,
  marcarComoConcluido,
} from '../controllers/habito.controller';

const router = Router();
router.use(authMiddleware);

// @route   POST /api/habitos
router.post('/', validate(criarHabitoSchema), criarHabito);

// @route   GET /api/habitos
router.get('/', listarHabitos);

// @route   POST /api/habitos/:id/complete
router.post('/:id/complete', marcarComoConcluido);

export default router;
