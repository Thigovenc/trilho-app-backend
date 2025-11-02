import { IHabitoRepository } from '../domain/repositories/IHabito.repository';

export interface IGlobalStats {
  totalHabitosCriados: number;
  totalHabitosConcluidos: number;
  diasTotaisEmSequencia: number;
  maiorSequenciaGlobal: number;
}

export class StatsService {
  constructor(private habitoRepository: IHabitoRepository) {
    console.log('StatsService instanciado.');
  }

  public async getStats(usuarioId: string): Promise<IGlobalStats> {
    const habitos = await this.habitoRepository.findByUsuarioId(usuarioId);

    if (habitos.length === 0) {
      return {
        totalHabitosCriados: 0,
        totalHabitosConcluidos: 0,
        diasTotaisEmSequencia: 0,
        maiorSequenciaGlobal: 0,
      };
    }

    const totalHabitosCriados = habitos.length;

    const totalHabitosConcluidos = habitos.reduce((soma, habito) => {
      return soma + habito.datasDeConclusao.length;
    }, 0);

    const diasTotaisEmSequencia = habitos.reduce((soma, habito) => {
      return soma + habito.sequenciaAtual;
    }, 0);

    const maiorSequenciaGlobal = Math.max(
      ...habitos.map((habito) => habito.maiorSequencia),
    );

    return {
      totalHabitosCriados,
      totalHabitosConcluidos,
      diasTotaisEmSequencia,
      maiorSequenciaGlobal,
    };
  }
}
