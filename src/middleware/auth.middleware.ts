import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// Importamos o "contrato" e a "implementação" do nosso repositório
import { IUsuarioRepository } from '../domain/repositories/IUsuario.repository';
import { MongooseUsuarioRepository } from '../repositories/usuario.repository';

/**
 * Precisamos estender a interface Request do Express
 * para podermos anexar nosso usuário decodificado nela.
 */
export interface IAuthRequest extends Request {
  usuario?: {
    id: string; // O ID do usuário logado
  };
}

// Como este middleware é uma função "solta", não podemos usar
// a injeção de dependência pelo construtor.
// Instanciamos o repositório diretamente aqui.
const usuarioRepo: IUsuarioRepository = new MongooseUsuarioRepository();

/**
 * Middleware para verificar a autenticação via JWT
 */
export const authMiddleware = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction,
) => {
  let token;
  const authHeader = req.headers.authorization;

  // 1. Verificar se o header 'Authorization' existe e começa com 'Bearer'
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      // 2. Extrair o token (ex: "Bearer <token>" -> "<token>")
      token = authHeader.split(' ')[1];

      // 3. Verificar o token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET não definido.');
      }

      // Decodifica o payload. Se o token for inválido (expirado, assinatura errada),
      // o jwt.verify() vai disparar um erro que será pego pelo 'catch'.
      const decodificado = jwt.verify(token, jwtSecret) as { id: string };

      // 4. Verificar se o usuário do token ainda existe no banco
      const usuario = await usuarioRepo.findById(decodificado.id);

      if (!usuario) {
        // Se o usuário foi deletado, o token não é mais válido.
        return res
          .status(401)
          .json({ message: 'Autorização negada, usuário não encontrado.' });
      }

      // 5. Anexar o ID do usuário à requisição (req)
      // Agora, o próximo controlador (ex: 'criarHabito')
      // saberá quem é o usuário em 'req.usuario.id'
      req.usuario = { id: usuario.id! };

      // 6. Passar para o próximo middleware/controlador da rota
      next();
    } catch (error) {
      console.error('Erro na autenticação do token:', error);
      res.status(401).json({ message: 'Autorização negada, token inválido.' });
    }
  }

  // Se não houver 'authHeader' ou não começar com 'Bearer'
  if (!token) {
    res
      .status(401)
      .json({ message: 'Autorização negada, token não fornecido.' });
  }
};
