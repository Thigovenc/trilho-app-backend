import { Habito } from '../domain/entities/habito.entity';
import { IHabitoRepository } from '../domain/repositories/IHabito.repository';
import { IUsuarioRepository } from '../domain/repositories/IUsuario.repository';
import { EnumHabitColor, EnumHabitIcon } from '../domain/enums/habito.enums';
import { EditarHabitoInput } from '../validations/habito.validation';

export interface ICriarHabitoInput {
  nome: string;
  cor?: EnumHabitColor;
  icone?: EnumHabitIcon;
  usuarioId: string;
}

export class HabitoService {
  private habitoRepository: IHabitoRepository;
  private usuarioRepository: IUsuarioRepository;

  constructor(
    habitoRepository: IHabitoRepository,
    usuarioRepository: IUsuarioRepository,
  ) {
    this.habitoRepository = habitoRepository;
    this.usuarioRepository = usuarioRepository;
    console.log('HabitoService instanciado.');
  }

  public async criarHabito(input: ICriarHabitoInput): Promise<Habito> {
    const usuario = await this.usuarioRepository.findById(input.usuarioId);
    if (!usuario) {
      throw new Error('Usuário não encontrado.');
    }
    const novoHabito = Habito.create({
      nome: input.nome,
      cor: input.cor,
      icone: input.icone,
      usuarioId: input.usuarioId,
    });

    const habitoSalvo = await this.habitoRepository.save(novoHabito);

    return habitoSalvo;
  }

  public async listarHabitosPorUsuario(usuarioId: string): Promise<Habito[]> {
    const habitos =
      await this.habitoRepository.findHabitsByUsuarioId(usuarioId);

    return habitos;
  }

  public async marcarComoConcluido(
    habitoId: string,
    usuarioId: string,
  ): Promise<Habito> {
    const habito = await this.habitoRepository.findById(habitoId);

    if (!habito) {
      throw new Error('Hábito não encontrado.');
    }

    if (habito.usuarioId !== usuarioId) {
      throw new Error('Você não tem permissão para editar este hábito.');
    }

    habito.marcarConcluido(new Date());

    const habitoAtualizado = await this.habitoRepository.update(habito);

    return habitoAtualizado;
  }

  public async editarHabito(
    habitoId: string,
    usuarioId: string,
    input: EditarHabitoInput,
  ): Promise<Habito> {
    const habito = await this.habitoRepository.findById(habitoId);

    if (!habito) {
      throw new Error('Hábito não encontrado.');
    }

    if (habito.usuarioId !== usuarioId) {
      throw new Error('Você não tem permissão para editar este hábito.');
    }

    habito.atualizarHabito(input);

    const habitoAtualizado = await this.habitoRepository.update(habito);

    return habitoAtualizado;
  }
}
