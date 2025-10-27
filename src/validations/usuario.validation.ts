import { z } from 'zod';

// Schema para POST /api/usuarios/register
export const registerSchema = z.object({
  body: z.object({
    nome: z.string()
      // .min() usa a sintaxe de objeto, o que está CORRETO
      .min(1, { message: 'O nome é obrigatório' }) 
      .min(3, { message: 'O nome precisa ter no mínimo 3 caracteres' }),
    
    email: z.string()
      .min(1, { message: 'O e-mail é obrigatório' })
      // .email() usa a sintaxe de string direta (NÃO obsoleta)
      .email('O e-mail fornecido não é válido'),
    
    senha: z.string()
      .min(1, { message: 'A senha é obrigatória' })
      .min(6, { message: 'A senha precisa ter no mínimo 6 caracteres' }),
  }),
});

// Schema para POST /api/usuarios/login
export const loginSchema = z.object({
  body: z.object({
    email: z.string()
      .min(1, { message: 'O e-mail é obrigatório' })
      // .email() usa a sintaxe de string direta (NÃO obsoleta)
      .email('O e-mail fornecido não é válido'),
    
    senha: z.string()
      .min(1, { message: 'A senha é obrigatória' }),
  }),
});

// Tipos inferidos do Zod (para usar nos controladores)
export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];