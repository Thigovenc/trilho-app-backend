import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { MongooseUsuarioRepository } from '../repositories/usuario.repository';

import { RegisterInput, LoginInput } from '../validations/usuario.validation';

const usuarioRepo = new MongooseUsuarioRepository();

const authService = new AuthService(usuarioRepo);

/**
 * @route   POST /api/usuarios/register
 * @desc    Cadastra um novo usuário
 * @access  Público
 */
export const registerUsuario = async (req: Request, res: Response) => {
  try {
    const input: RegisterInput = req.body;

    const { usuario, token } = await authService.register(input);

    res.status(201).json({
      usuario: {
        _id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        createdAt: usuario.createdAt,
      },
      token,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: 'Um erro desconhecido ocorreu' });
    }
  }
};

/**
 * @route   POST /api/usuarios/login
 * @desc    Autentica um usuário
 * @access  Público
 */
export const loginUsuario = async (req: Request, res: Response) => {
  try {
    const input: LoginInput = req.body;

    const { usuario, token } = await authService.login(input);

    res.status(200).json({
      usuario: {
        _id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        createdAt: usuario.createdAt,
      },
      token,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(401).json({ message: error.message });
    } else {
      res.status(401).json({ message: 'Um erro desconhecido ocorreu' });
    }
  }
};
