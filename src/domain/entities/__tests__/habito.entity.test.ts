import { Habito } from '../habito.entity';
import { EnumHabitColor, EnumHabitIcon } from '../../enums/habito.enums';
import { subDays } from 'date-fns';

describe('Habito Entity', () => {
  const usuarioId = '507f1f77bcf86cd799439011';

  describe('create', () => {
    it('deve criar um hábito com valores padrão', () => {
      const habito = Habito.create({
        usuarioId,
        nome: 'Ler livros',
      });

      expect(habito.nome).toBe('Ler livros');
      expect(habito.usuarioId).toBe(usuarioId);
      expect(habito.cor).toBe(EnumHabitColor.BLUE);
      expect(habito.icone).toBe(EnumHabitIcon.SAVE);
      expect(habito.maiorSequencia).toBe(0);
      expect(habito.datasDeConclusao).toEqual([]);
      expect(habito.sequenciaAtual).toBe(0);
      expect(habito.isDeleted).toBe(false);
      expect(habito.ordem).toBe(0);
    });

    it('deve criar um hábito com valores customizados', () => {
      const habito = Habito.create({
        usuarioId,
        nome: 'Exercitar',
        cor: EnumHabitColor.RED,
        icone: EnumHabitIcon.WEIGHTS,
        ordem: 5,
      });

      expect(habito.nome).toBe('Exercitar');
      expect(habito.cor).toBe(EnumHabitColor.RED);
      expect(habito.icone).toBe(EnumHabitIcon.WEIGHTS);
      expect(habito.ordem).toBe(5);
    });

    it('deve lançar erro se o nome estiver vazio', () => {
      expect(() => {
        Habito.create({
          usuarioId,
          nome: '',
        });
      }).toThrow('O nome do hábito é obrigatório.');
    });

    it('deve lançar erro se o nome não for fornecido', () => {
      expect(() => {
        Habito.create({
          usuarioId,
          nome: undefined as any,
        });
      }).toThrow('O nome do hábito é obrigatório.');
    });
  });

  describe('fromPersistence', () => {
    it('deve criar um hábito a partir de dados de persistência', () => {
      const habito = Habito.fromPersistence({
        id: '507f1f77bcf86cd799439012',
        usuarioId,
        nome: 'Meditar',
        cor: EnumHabitColor.GREEN,
        icone: EnumHabitIcon.MEDITATION,
        maiorSequencia: 5,
        datasDeConclusao: [new Date()],
        isDeleted: false,
        ordem: 2,
      });

      expect(habito.id).toBe('507f1f77bcf86cd799439012');
      expect(habito.nome).toBe('Meditar');
      expect(habito.maiorSequencia).toBe(5);
      expect(habito.datasDeConclusao).toHaveLength(1);
    });
  });

  describe('marcarConcluido', () => {
    it('deve marcar um hábito como concluído', () => {
      const habito = Habito.create({
        usuarioId,
        nome: 'Ler livros',
      });

      const data = new Date();
      habito.marcarConcluido(data);

      expect(habito.datasDeConclusao).toHaveLength(1);
      expect(habito.sequenciaAtual).toBe(1);
      expect(habito.maiorSequencia).toBe(1);
    });

    it('deve calcular sequência corretamente para múltiplos dias consecutivos', () => {
      const habito = Habito.create({
        usuarioId,
        nome: 'Exercitar',
      });

      const hoje = new Date();
      const ontem = subDays(hoje, 1);
      const anteontem = subDays(hoje, 2);

      habito.marcarConcluido(anteontem);
      habito.marcarConcluido(ontem);
      habito.marcarConcluido(hoje);

      expect(habito.sequenciaAtual).toBe(3);
      expect(habito.maiorSequencia).toBe(3);
    });

    it('deve resetar sequência se houver intervalo maior que 1 dia', () => {
      const habito = Habito.create({
        usuarioId,
        nome: 'Exercitar',
      });

      const hoje = new Date();
      const tresDiasAtras = subDays(hoje, 3);

      habito.marcarConcluido(tresDiasAtras);
      expect(habito.sequenciaAtual).toBe(0);

      habito.marcarConcluido(hoje);
      expect(habito.sequenciaAtual).toBe(1);
    });

    it('deve lançar erro se tentar marcar como concluído duas vezes no mesmo dia', () => {
      const habito = Habito.create({
        usuarioId,
        nome: 'Ler livros',
      });

      const data = new Date();
      habito.marcarConcluido(data);

      expect(() => {
        habito.marcarConcluido(data);
      }).toThrow('Hábito já concluído nesta data.');
    });

    it('deve atualizar maiorSequencia quando sequenciaAtual for maior', () => {
      const habito = Habito.create({
        usuarioId,
        nome: 'Exercitar',
      });

      const hoje = new Date();
      const ontem = subDays(hoje, 1);

      habito.marcarConcluido(ontem);
      expect(habito.maiorSequencia).toBe(1);

      habito.marcarConcluido(hoje);
      expect(habito.maiorSequencia).toBe(2);
    });
  });

  describe('atualizarHabito', () => {
    it('deve atualizar o nome do hábito', () => {
      const habito = Habito.create({
        usuarioId,
        nome: 'Ler livros',
      });

      habito.atualizarHabito({ nome: 'Ler 30 minutos' });

      expect(habito.nome).toBe('Ler 30 minutos');
    });

    it('deve atualizar a cor do hábito', () => {
      const habito = Habito.create({
        usuarioId,
        nome: 'Exercitar',
      });

      habito.atualizarHabito({ cor: EnumHabitColor.RED });

      expect(habito.cor).toBe(EnumHabitColor.RED);
    });

    it('deve atualizar o ícone do hábito', () => {
      const habito = Habito.create({
        usuarioId,
        nome: 'Meditar',
      });

      habito.atualizarHabito({ icone: EnumHabitIcon.MEDITATION });

      expect(habito.icone).toBe(EnumHabitIcon.MEDITATION);
    });

    it('deve atualizar múltiplas propriedades', () => {
      const habito = Habito.create({
        usuarioId,
        nome: 'Exercitar',
      });

      habito.atualizarHabito({
        nome: 'Correr',
        cor: EnumHabitColor.GREEN,
        icone: EnumHabitIcon.RUNNING,
      });

      expect(habito.nome).toBe('Correr');
      expect(habito.cor).toBe(EnumHabitColor.GREEN);
      expect(habito.icone).toBe(EnumHabitIcon.RUNNING);
    });

    it('deve lançar erro se tentar atualizar com nome vazio', () => {
      const habito = Habito.create({
        usuarioId,
        nome: 'Exercitar',
      });

      expect(() => {
        habito.atualizarHabito({ nome: '' });
      }).toThrow('O nome do hábito é obrigatório.');
    });
  });

  describe('atualizarOrdem', () => {
    it('deve atualizar a ordem do hábito', () => {
      const habito = Habito.create({
        usuarioId,
        nome: 'Exercitar',
        ordem: 0,
      });

      habito.atualizarOrdem(5);

      expect(habito.ordem).toBe(5);
    });

    it('deve permitir ordem zero', () => {
      const habito = Habito.create({
        usuarioId,
        nome: 'Exercitar',
        ordem: 10,
      });

      habito.atualizarOrdem(0);

      expect(habito.ordem).toBe(0);
    });

    it('deve lançar erro se a ordem for negativa', () => {
      const habito = Habito.create({
        usuarioId,
        nome: 'Exercitar',
      });

      expect(() => {
        habito.atualizarOrdem(-1);
      }).toThrow('A ordem deve ser um número não negativo.');
    });
  });

  describe('marcarComoDeletado', () => {
    it('deve marcar o hábito como deletado', () => {
      const habito = Habito.create({
        usuarioId,
        nome: 'Exercitar',
      });

      expect(habito.isDeleted).toBe(false);

      habito.marcarComoDeletado();

      expect(habito.isDeleted).toBe(true);
    });
  });
});
