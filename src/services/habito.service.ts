import { Habito } from '../domain/entities/habito.entity';
import { IHabitoRepository } from '../domain/repositories/IHabito.repository';
import { IUsuarioRepository } from '../domain/repositories/IUsuario.repository';
import { EnumHabitColor, EnumHabitIcon } from '../domain/enums/habito.enums';

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
    const habitos = await this.habitoRepository.findByUsuarioId(usuarioId);

    return habitos;
  }
}
