import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import validate from '../middleware/validate.middleware';
import {
  criarHabitoSchema,
  editarHabitoSchema,
  reordenarHabitosSchema,
} from '../validations/habito.validation';
import {
  criarHabito,
  editarHabito,
  listarHabitos,
  marcarComoConcluido,
  reordenarHabitos,
  removerHabito,
} from '../controllers/habito.controller';

const router = Router();
router.use(authMiddleware);

router.post('/', validate(criarHabitoSchema), criarHabito);
router.get('/', listarHabitos);
router.post('/:id/complete', marcarComoConcluido);
router.put('/:id', validate(editarHabitoSchema), editarHabito);
router.delete('/:id', removerHabito);
router.patch('/reordenar', validate(reordenarHabitosSchema), reordenarHabitos);

export default router;
