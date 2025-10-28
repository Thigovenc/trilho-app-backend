import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IUsuarioRepository } from '../domain/repositories/IUsuario.repository';
import { MongooseUsuarioRepository } from '../repositories/usuario.repository';

export interface IAuthRequest extends Request {
  usuario?: {
    id: string;
  };
}

const usuarioRepo: IUsuarioRepository = new MongooseUsuarioRepository();

export const authMiddleware = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction,
) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      token = authHeader.split(' ')[1];

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET não definido.');
      }

      const decodificado = jwt.verify(token, jwtSecret) as { id: string };

      const usuario = await usuarioRepo.findById(decodificado.id);

      if (!usuario) {
        return res
          .status(401)
          .json({ message: 'Autorização negada, usuário não encontrado.' });
      }

      req.usuario = { id: usuario.id! };

      next();
    } catch (error) {
      console.error('Erro na autenticação do token:', error);
      res.status(401).json({ message: 'Autorização negada, token inválido.' });
    }
  }

  if (!token) {
    res
      .status(401)
      .json({ message: 'Autorização negada, token não fornecido.' });
  }
};
