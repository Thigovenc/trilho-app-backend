import { differenceInDays, isSameDay, startOfDay } from 'date-fns';
import { EnumHabitColor, EnumHabitIcon } from '../enums/habito.enums';

export interface IHabitoCreateProps {
  usuarioId: string;
  nome: string;
  cor?: EnumHabitColor;
  icone?: EnumHabitIcon;
}

export class Habito {
  public readonly id?: string;
  public readonly usuarioId: string;
  public nome: string;
  public cor: EnumHabitColor;
  public icone: EnumHabitIcon;
  public maiorSequencia: number;
  public datasDeConclusao: Date[];

  public sequenciaAtual: number;

  private constructor(props: {
    id?: string;
    usuarioId: string;
    nome: string;
    cor: EnumHabitColor;
    icone: EnumHabitIcon;
    maiorSequencia: number;
    datasDeConclusao: Date[];
  }) {
    this.id = props.id;
    this.usuarioId = props.usuarioId;
    this.nome = props.nome;
    this.cor = props.cor;
    this.icone = props.icone;
    this.maiorSequencia = props.maiorSequencia;
    this.datasDeConclusao = props.datasDeConclusao;

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
  }): Habito {
    return new Habito(props);
  }

  private static validateNome(nome: string): void {
    if (!nome || nome.length < 1) {
      throw new Error('O nome do hábito é obrigatório.');
    }
  }

  private calcularSequenciaAtual(): number {
    if (this.datasDeConclusao.length === 0) {
      return 0;
    }
    const datasOrdenadas = [...this.datasDeConclusao].sort(
      (a, b) => b.getTime() - a.getTime(),
    );
    let sequencia = 0;
    const hoje = startOfDay(new Date());
    const dataMaisRecente = startOfDay(datasOrdenadas[0]);

    const diasDesdeUltimaConclusao = differenceInDays(hoje, dataMaisRecente);
    if (diasDesdeUltimaConclusao > 1) {
      return 0;
    }

    sequencia = 1;

    for (let i = 1; i < datasOrdenadas.length; i++) {
      const diaAnterior = startOfDay(datasOrdenadas[i - 1]);
      const diaAtual = startOfDay(datasOrdenadas[i]);

      if (differenceInDays(diaAnterior, diaAtual) === 1) {
        sequencia++;
      } else {
        break;
      }
    }
    return sequencia;
  }

  public marcarConcluido(data: Date): void {
    const dataConclusao = startOfDay(data);

    const jaConcluido = this.datasDeConclusao.some((d) =>
      isSameDay(d, dataConclusao),
    );

    if (jaConcluido) {
      throw new Error('Hábito já concluído nesta data.');
    }

    this.datasDeConclusao.push(dataConclusao);

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
}
