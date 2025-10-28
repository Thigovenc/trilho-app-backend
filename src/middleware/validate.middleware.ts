import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Este é um middleware de alta ordem (uma função que retorna outra função).
 * Ele recebe um schema Zod e retorna um middleware Express
 * que valida a requisição contra esse schema.
 */
const validate =
  (schema: z.Schema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // O Zod valida o corpo, query e params da requisição
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Se a validação for bem-sucedida, passa para o próximo middleware
      // (que será o nosso controlador)
      return next();
    } catch (error: any) {
      // Se a validação falhar, o Zod dispara um erro.
      // Retornamos um erro 400 com os detalhes.
      return res.status(400).json({
        message: 'Erro de validação de entrada',
        errors: error.errors, // Lista detalhada de erros do Zod
      });
    }
  };

export default validate;
