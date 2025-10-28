import { Response } from 'express';
import { IAuthRequest } from '../middleware/auth.middleware';
import { HabitoService } from '../services/habito.service';
import { MongooseHabitoRepository } from '../repositories/habito.repository';
import { MongooseUsuarioRepository } from '../repositories/usuario.repository';
import { CriarHabitoInput } from '../validations/habito.validation';

const habitoRepo = new MongooseHabitoRepository();
const usuarioRepo = new MongooseUsuarioRepository();
const habitoService = new HabitoService(habitoRepo, usuarioRepo);

/**
 * @route   POST /api/habitos
 * @desc    Cria um novo hábito para o usuário logado
 * @access  Privado
 */
export const criarHabito = async (req: IAuthRequest, res: Response) => {
  try {
    const input: CriarHabitoInput = req.body;

    const usuarioId = req.usuario!.id;

    const novoHabito = await habitoService.criarHabito({
      ...input,
      usuarioId: usuarioId,
    });

    res.status(201).json({ habito: novoHabito });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: 'Um erro desconhecido ocorreu' });
    }
  }
};

/**
 * @route   GET /api/habitos
 * @desc    Lista todos os hábitos do usuário logado
 * @access  Privado
 */
export const listarHabitos = async (req: IAuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario!.id;

    const habitos = await habitoService.listarHabitosPorUsuario(usuarioId);

    res.status(200).json({ habitos: habitos });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Um erro desconhecido ocorreu' });
    }
  }
};
