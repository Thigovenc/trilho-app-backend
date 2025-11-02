import { Response } from 'express';
import { IAuthRequest } from '../middleware/auth.middleware';
import { StatsService } from '../services/stats.service';
import { MongooseHabitoRepository } from '../repositories/habito.repository';

const habitoRepo = new MongooseHabitoRepository();
const statsService = new StatsService(habitoRepo);

export const getStatsGlobais = async (req: IAuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario!.id;

    const stats = await statsService.getStats(usuarioId);

    res.status(200).json(stats);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Um erro desconhecido ocorreu' });
    }
  }
};
