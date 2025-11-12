import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { MongooseUsuarioRepository } from '../repositories/usuario.repository';

import {
  RegisterInput,
  LoginInput,
  UpdatePerfilInput,
} from '../validations/usuario.validation';
import { PerfilService } from '../services/perfil.service';
import { IAuthRequest } from '../middleware/auth.middleware';

const usuarioRepo = new MongooseUsuarioRepository();

const authService = new AuthService(usuarioRepo);

const perfilService = new PerfilService(usuarioRepo);

export const registerUsuario = async (req: Request, res: Response) => {
  try {
    const input: RegisterInput = req.body;

    const { usuario, token } = await authService.register(input);

    res.status(201).json({
      usuario: {
        id: usuario.id,
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

export const loginUsuario = async (req: Request, res: Response) => {
  try {
    const input: LoginInput = req.body;

    const { usuario, token } = await authService.login(input);

    res.status(200).json({
      usuario: {
        id: usuario.id,
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

export const updatePerfil = async (req: IAuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario!.id;
    const input: UpdatePerfilInput = req.body;

    const usuario = await perfilService.updatePerfil(usuarioId, input);

    res.status(200).json({
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        createdAt: usuario.createdAt,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Um erro desconhecido ocorreu' });
    }
  }
};
