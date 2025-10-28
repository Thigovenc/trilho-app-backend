import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const validate =
  (schema: z.Schema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      return next();
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Erro de validação de entrada',
          errors: error.issues,
        });
      }
      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  };

export default validate;
