import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import validate from '../middleware/validate.middleware';
import {
  criarHabitoSchema,
  editarHabitoSchema,
} from '../validations/habito.validation';
import {
  criarHabito,
  editarHabito,
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

// @route   PUT /api/habitos/:id
router.put('/:id', validate(editarHabitoSchema), editarHabito);

export default router;
