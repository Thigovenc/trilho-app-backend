import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    nome: z
      .string()

      .min(1, { message: 'O nome é obrigatório' })
      .min(3, { message: 'O nome precisa ter no mínimo 3 caracteres' }),

    email: z
      .string()
      .min(1, { message: 'O e-mail é obrigatório' })

      .email('O e-mail fornecido não é válido'),

    senha: z
      .string()
      .min(1, { message: 'A senha é obrigatória' })
      .min(6, { message: 'A senha precisa ter no mínimo 6 caracteres' }),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .min(1, { message: 'O e-mail é obrigatório' })

      .email('O e-mail fornecido não é válido'),

    senha: z.string().min(1, { message: 'A senha é obrigatória' }),
  }),
});

export const updatePerfilSchema = z.object({
  body: z
    .object({
      nome: z
        .string()
        .min(3, { message: 'O nome precisa ter no mínimo 3 caracteres' })
        .optional(),

      email: z.string().email('O e-mail fornecido não é válido').optional(),
    })
    .refine((data) => data.nome || data.email, {
      message:
        'Pelo menos um campo (nome ou email) deve ser fornecido para atualização.',
    }),
});

export type UpdatePerfilInput = z.infer<typeof updatePerfilSchema>['body'];
export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
