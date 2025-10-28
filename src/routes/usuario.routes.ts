import { Router } from 'express';
// O Controlador (Camada 2)
import { registerUsuario, loginUsuario } from '../controllers/usuario.controller';
// O Middleware de Validação (Fase 3)
import validate from '../middleware/validate.middleware';
// Os Schemas de Validação (Fase 3)
import { registerSchema, loginSchema } from '../validations/usuario.validation';

const router = Router();

/**
 * Definição das rotas de Autenticação
 * (Conforme Seção 7.1 do documento)
 */

// @route   POST /api/usuarios/register
router.post(
  '/register', 
  validate(registerSchema), // 1. O "Segurança" (Zod) valida
  registerUsuario          // 2. Se passar, o Controlador é chamado
);

// @route   POST /api/usuarios/login
router.post(
  '/login', 
  validate(loginSchema), // 1. O "Segurança" (Zod) valida
  loginUsuario           // 2. Se passar, o Controlador é chamado
);

export default router;