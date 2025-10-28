import { Router } from 'express';
import {
  registerUsuario,
  loginUsuario,
} from '../controllers/usuario.controller';
import validate from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '../validations/usuario.validation';

const router = Router();

// @route   POST /api/usuarios/register
router.post('/register', validate(registerSchema), registerUsuario);

// @route   POST /api/usuarios/login
router.post('/login', validate(loginSchema), loginUsuario);

export default router;
