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

// @route   POST /api/usuarios/register
router.post('/register', validate(registerSchema), registerUsuario);

// @route   POST /api/usuarios/login
router.post('/login', validate(loginSchema), loginUsuario);

// @route   PUT /api/usuarios/perfil
router.put(
  '/perfil',
  authMiddleware,
  validate(updatePerfilSchema),
  updatePerfil,
);
export default router;
