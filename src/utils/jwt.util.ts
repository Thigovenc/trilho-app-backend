import jwt from 'jsonwebtoken';

/**
 * Gera um token JWT para um usuário
 * @param usuarioId O ID do usuário que será embutido no token
 */
export const gerarToken = (usuarioId: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error('Erro fatal: JWT_SECRET não está definido no .env');

    throw new Error('JWT_SECRET não configurado.');
  }

  const payload = { id: usuarioId };

  const token = jwt.sign(payload, secret, { expiresIn: '7d' });

  return token;
};
