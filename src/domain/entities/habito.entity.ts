import { differenceInDays} from 'date-fns';
import { EnumHabitColor, EnumHabitIcon } from '../enums/habito.enums';

export interface IHabitoCreateProps {
  usuarioId: string;
  nome: string;
  cor?: EnumHabitColor;
  icone?: EnumHabitIcon;
  ordem?: number;
}

export class Habito {
  public readonly id?: string;
  public readonly usuarioId: string;
  public nome: string;
  public cor: EnumHabitColor;
  public icone: EnumHabitIcon;
  public maiorSequencia: number;
  public datasDeConclusao: Date[];
  public isDeleted: boolean;
  public sequenciaAtual: number;
  public ordem: number;

  private constructor(props: {
    id?: string;
    usuarioId: string;
    nome: string;
    cor: EnumHabitColor;
    icone: EnumHabitIcon;
    maiorSequencia: number;
    datasDeConclusao: Date[];
    isDeleted?: boolean;
    ordem: number;
  }) {
    this.id = props.id;
    this.usuarioId = props.usuarioId;
    this.nome = props.nome;
    this.cor = props.cor;
    this.icone = props.icone;
    this.maiorSequencia = props.maiorSequencia;
    this.datasDeConclusao = props.datasDeConclusao;
    this.isDeleted = props.isDeleted || false;
    this.ordem = props.ordem;
    this.sequenciaAtual = this.calcularSequenciaAtual();
  }

  public static create(props: IHabitoCreateProps): Habito {
    this.validateNome(props.nome);

    return new Habito({
      ...props,
      cor: props.cor || EnumHabitColor.BLUE,
      icone: props.icone || EnumHabitIcon.SAVE,
      maiorSequencia: 0,
      datasDeConclusao: [],
      ordem: props.ordem || 0,
    });
  }

  public static fromPersistence(props: {
    id: string;
    usuarioId: string;
    nome: string;
    cor: EnumHabitColor;
    icone: EnumHabitIcon;
    maiorSequencia: number;
    datasDeConclusao: Date[];
    isDeleted: boolean;
    ordem: number;
  }): Habito {
    return new Habito(props);
  }

  private static validateNome(nome: string): void {
    if (!nome || nome.length < 1) {
      throw new Error('O nome do hábito é obrigatório.');
    }
  }

  /**
   * Pega apenas o dia/mês/ano de uma data, ignorando horas
   * Retorna uma string no formato YYYY-MM-DD para comparação
   */
  private static getDateOnly(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private calcularSequenciaAtual(): number {
    if (this.datasDeConclusao.length === 0) {
      return 0;
    }

    const datasOrdenadas = [...this.datasDeConclusao].sort(
      (a, b) => b.getTime() - a.getTime(),
    );

    let sequencia = 0;
    const hoje = new Date();
    const dataMaisRecente = datasOrdenadas[0];

    const diasDesdeUltimaConclusao = differenceInDays(hoje, dataMaisRecente);

    if (diasDesdeUltimaConclusao > 1) {
      return 0;
    }

    sequencia = 1;

    for (let i = 1; i < datasOrdenadas.length; i++) {
      const diaAnterior = datasOrdenadas[i - 1];
      const diaAtual = datasOrdenadas[i];

      if (differenceInDays(diaAnterior, diaAtual) === 1) {
        sequencia++;
      } else {
        break;
      }
    }
    return sequencia;
  }

  public marcarConcluido(data: Date): void {
    // Pega apenas a data (dia/mês/ano) ignorando horas
    const dataHojeStr = Habito.getDateOnly(data);

    // Verifica se já foi concluído nesta data
    const jaConcluido = this.datasDeConclusao.some((d) => {
      const dataExistenteStr = Habito.getDateOnly(d);
      return dataExistenteStr === dataHojeStr;
    });

    if (jaConcluido) {
      throw new Error('Hábito já concluído nesta data.');
    }

    // Salva a data atual (com horário) - será normalizada na hora de comparar
    this.datasDeConclusao.push(data);

    this.sequenciaAtual = this.calcularSequenciaAtual();

    if (this.sequenciaAtual > this.maiorSequencia) {
      this.maiorSequencia = this.sequenciaAtual;
    }
  }

  public atualizarHabito(props: {
    nome?: string;
    cor?: EnumHabitColor;
    icone?: EnumHabitIcon;
  }): void {
    if (props.nome) {
      Habito.validateNome(props.nome);
      this.nome = props.nome;
    }

    if (props.cor) {
      this.cor = props.cor;
    }

    if (props.icone) {
      this.icone = props.icone;
    }
  }

  public marcarComoDeletado(): void {
    this.isDeleted = true;
  }
}
