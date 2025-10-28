import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { MongooseUsuarioRepository } from '../repositories/usuario.repository';
// Importamos os tipos do Zod (Fase 3)
import { RegisterInput, LoginInput } from '../validations/usuario.validation';

// --- Ponto de Injeção "Manual" (Composition Root) ---
// 1. Criamos a implementação concreta do Repositório (o "Adaptador")
const usuarioRepo = new MongooseUsuarioRepository();

// 2. Injetamos o repositório concreto no construtor do Serviço
// O authService agora está "pronto", com suas dependências resolvidas.
const authService = new AuthService(usuarioRepo);
// ----------------------------------------------------

/**
 * @route   POST /api/usuarios/register
 * @desc    Cadastra um novo usuário
 * @access  Público
 */
export const registerUsuario = async (req: Request, res: Response) => {
  try {
    // 1. O body já foi validado pelo Zod (Middleware da Fase 3)
    const input: RegisterInput = req.body;

    // 2. Chamar a Camada de Serviço (Fase 6)
    const { usuario, token } = await authService.register(input);

    // 3. Formatar e retornar a resposta HTTP (Conforme Seção 7.1)
    // Omitimos o senhaHash e outros dados sensíveis da resposta
    res.status(201).json({ 
      usuario: {
        _id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        createdAt: usuario.createdAt
      }, 
      token 
    });

  } catch (error: any) {
    // 4. Tratar erros vindos do Serviço (ex: "E-mail já em uso")
    res.status(400).json({ message: error.message });
  }
};

/**
 * @route   POST /api/usuarios/login
 * @desc    Autentica um usuário
 * @access  Público
 */
export const loginUsuario = async (req: Request, res: Response) => {
  try {
    // 1. O body já foi validado pelo Zod
    const input: LoginInput = req.body;

    // 2. Chamar a Camada de Serviço (Fase 6)
    const { usuario, token } = await authService.login(input);

    // 3. Formatar e retornar a resposta HTTP (Conforme Seção 7.1)
    res.status(200).json({ 
      usuario: {
        _id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        createdAt: usuario.createdAt
      }, 
      token 
    });

  } catch (error: any) {
    // 4. Tratar erros vindos do Serviço (ex: "Credenciais inválidas")
    res.status(401).json({ message: error.message });
  }
};