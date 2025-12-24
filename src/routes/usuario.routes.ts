import { Router } from 'express';
import {
  registerUsuario,
  loginUsuario,
  updatePerfil,
} from '../controllers/usuario.controller';
import validate from '../middleware/validate.middleware';
import {
  registerSchema,
  loginSchema,
  updatePerfilSchema,
} from '../validations/usuario.validation';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', validate(registerSchema), registerUsuario);
router.post('/login', validate(loginSchema), loginUsuario);
router.put(
  '/perfil',
  authMiddleware,
  validate(updatePerfilSchema),
  updatePerfil,
);

export default router;
