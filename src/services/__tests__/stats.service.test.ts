import { StatsService } from '../stats.service';
import { IHabitoRepository } from '../../domain/repositories/IHabito.repository';
import { Habito } from '../../domain/entities/habito.entity';
import { subDays } from 'date-fns';

describe('StatsService', () => {
  let statsService: StatsService;
  let mockHabitoRepository: jest.Mocked<IHabitoRepository>;

  const usuarioId = '507f1f77bcf86cd799439011';

  beforeEach(() => {
    mockHabitoRepository = {
      save: jest.fn(),
      findHabitsByUsuarioId: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      countByUsuarioId: jest.fn(),
      updateOrdem: jest.fn(),
    };

    statsService = new StatsService(mockHabitoRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    it('deve retornar estatísticas zeradas quando não há hábitos', async () => {
      mockHabitoRepository.findHabitsByUsuarioId.mockResolvedValue([]);

      const resultado = await statsService.getStats(usuarioId);

      expect(resultado).toEqual({
        totalHabitosCriados: 0,
        totalHabitosConcluidos: 0,
        diasTotaisEmSequencia: 0,
        maiorSequenciaGlobal: 0,
      });
    });

    it('deve calcular estatísticas corretamente com um hábito', async () => {
      const hoje = new Date();
      const ontem = subDays(hoje, 1);

      const habito = Habito.create({
        usuarioId,
        nome: 'Ler livros',
        ordem: 0,
      });

      habito.marcarConcluido(ontem);
      habito.marcarConcluido(hoje);

      mockHabitoRepository.findHabitsByUsuarioId.mockResolvedValue([habito]);

      const resultado = await statsService.getStats(usuarioId);

      expect(resultado.totalHabitosCriados).toBe(1);
      expect(resultado.totalHabitosConcluidos).toBe(2);
      expect(resultado.diasTotaisEmSequencia).toBe(2);
      expect(resultado.maiorSequenciaGlobal).toBe(2);
    });

    it('deve calcular estatísticas corretamente com múltiplos hábitos', async () => {
      const hoje = new Date();
      const ontem = subDays(hoje, 1);
      const anteontem = subDays(hoje, 2);

      const habito1 = Habito.create({
        usuarioId,
        nome: 'Ler livros',
        ordem: 0,
      });
      habito1.marcarConcluido(anteontem);
      habito1.marcarConcluido(ontem);
      habito1.marcarConcluido(hoje);

      const habito2 = Habito.create({
        usuarioId,
        nome: 'Exercitar',
        ordem: 1,
      });
      habito2.marcarConcluido(ontem);
      habito2.marcarConcluido(hoje);

      const habito3 = Habito.create({
        usuarioId,
        nome: 'Meditar',
        ordem: 2,
      });
      habito3.marcarConcluido(hoje);

      mockHabitoRepository.findHabitsByUsuarioId.mockResolvedValue([
        habito1,
        habito2,
        habito3,
      ]);

      const resultado = await statsService.getStats(usuarioId);

      expect(resultado.totalHabitosCriados).toBe(3);
      expect(resultado.totalHabitosConcluidos).toBe(6); // 3 + 2 + 1
      expect(resultado.diasTotaisEmSequencia).toBe(6); // 3 + 2 + 1
      expect(resultado.maiorSequenciaGlobal).toBe(3); // maior sequência do habito1
    });

    it('deve calcular maiorSequenciaGlobal corretamente', async () => {
      const hoje = new Date();
      const ontem = subDays(hoje, 1);
      const anteontem = subDays(hoje, 2);
      const tresDiasAtras = subDays(hoje, 3);

      const habito1 = Habito.create({
        usuarioId,
        nome: 'Hábito 1',
        ordem: 0,
      });
      habito1.marcarConcluido(tresDiasAtras);
      habito1.marcarConcluido(anteontem);
      habito1.marcarConcluido(ontem);
      habito1.marcarConcluido(hoje);

      const habito2 = Habito.create({
        usuarioId,
        nome: 'Hábito 2',
        ordem: 1,
      });
      habito2.marcarConcluido(ontem);
      habito2.marcarConcluido(hoje);

      mockHabitoRepository.findHabitsByUsuarioId.mockResolvedValue([
        habito1,
        habito2,
      ]);

      const resultado = await statsService.getStats(usuarioId);

      expect(resultado.maiorSequenciaGlobal).toBe(4); // maior sequência do habito1
    });

    it('deve calcular diasTotaisEmSequencia corretamente', async () => {
      const hoje = new Date();
      const ontem = subDays(hoje, 1);

      const habito1 = Habito.create({
        usuarioId,
        nome: 'Hábito 1',
        ordem: 0,
      });
      habito1.marcarConcluido(ontem);
      habito1.marcarConcluido(hoje);

      const habito2 = Habito.create({
        usuarioId,
        nome: 'Hábito 2',
        ordem: 1,
      });
      habito2.marcarConcluido(hoje);

      mockHabitoRepository.findHabitsByUsuarioId.mockResolvedValue([
        habito1,
        habito2,
      ]);

      const resultado = await statsService.getStats(usuarioId);

      expect(resultado.diasTotaisEmSequencia).toBe(3); // 2 + 1
    });
  });
});
