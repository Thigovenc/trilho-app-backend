import { z } from 'zod';
import { EnumHabitColor, EnumHabitIcon } from '../domain/enums/habito.enums';

export const criarHabitoSchema = z.object({
  body: z.object({
    nome: z.string().min(1, { message: 'O nome do hábito é obrigatório' }),

    cor: z
      .enum(EnumHabitColor, {
        message: 'Cor inválida',
      })
      .optional(),

    icone: z
      .enum(EnumHabitIcon, {
        message: 'Ícone inválido',
      })
      .optional(),
  }),
});

export const editarHabitoSchema = z.object({
  body: z.object({
    nome: z
      .string()
      .min(1, { message: 'O nome do hábito é obrigatório' })
      .optional(),

    cor: z
      .enum(EnumHabitColor, {
        message: 'Cor inválida',
      })
      .optional(),

    icone: z
      .enum(EnumHabitIcon, {
        message: 'Ícone inválido',
      })
      .optional(),
  }),
});

export const reordenarHabitosSchema = z.object({
  body: z.object({
    ordemHabitos: z.array(z.string().min(1), {
      message: 'A lista de IDs é obrigatória.',
    }),
  }),
});

export type CriarHabitoInput = z.infer<typeof criarHabitoSchema>['body'];
export type EditarHabitoInput = z.infer<typeof editarHabitoSchema>['body'];
export type ReordenarHabitosInput = z.infer<
  typeof reordenarHabitosSchema
>['body'];
