import jwt from 'jsonwebtoken';

/**
 * Gera um token JWT para um usuário
 * @param usuarioId O ID do usuário que será embutido no token
 */
export const gerarToken = (usuarioId: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error('Erro fatal: JWT_SECRET não está definido no .env');
    // Em um app real, não deveríamos nem iniciar sem o secret
    throw new Error('JWT_SECRET não configurado.');
  }

  // O 'payload' do token conterá o ID do usuário
  const payload = { id: usuarioId };

  // Definimos a expiração (ex: 7 dias),
  // o que é bom para um aplicativo mobile.
  const token = jwt.sign(
    payload,
    secret,
    { expiresIn: '7d' } 
  );

  return token;
};