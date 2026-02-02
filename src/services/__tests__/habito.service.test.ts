import { HabitoService } from '../habito.service';
import { Habito } from '../../domain/entities/habito.entity';
import { IHabitoRepository } from '../../domain/repositories/IHabito.repository';
import { IUsuarioRepository } from '../../domain/repositories/IUsuario.repository';
import { EnumHabitColor, EnumHabitIcon } from '../../domain/enums/habito.enums';
import { Usuario } from '../../domain/entities/usuario.entity';

describe('HabitoService', () => {
  let habitoService: HabitoService;
  let mockHabitoRepository: jest.Mocked<IHabitoRepository>;
  let mockUsuarioRepository: jest.Mocked<IUsuarioRepository>;

  const usuarioId = '507f1f77bcf86cd799439011';
  const habitoId = '507f1f77bcf86cd799439012';

  beforeEach(() => {
    mockHabitoRepository = {
      save: jest.fn(),
      findHabitsByUsuarioId: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      countByUsuarioId: jest.fn(),
      updateOrdem: jest.fn(),
    };

    mockUsuarioRepository = {
      findById: jest.fn(),
    } as any;

    habitoService = new HabitoService(
      mockHabitoRepository,
      mockUsuarioRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('criarHabito', () => {
    it('deve criar um hábito com sucesso', async () => {
      const mockUsuario = {
        id: usuarioId,
        nome: 'João',
        email: 'joao@test.com',
        senhaHash: 'hash',
        createdAt: new Date(),
      } as Usuario;

      const mockHabito = Habito.create({
        usuarioId,
        nome: 'Ler livros',
        ordem: 0,
      });

      mockUsuarioRepository.findById.mockResolvedValue(mockUsuario);
      mockHabitoRepository.countByUsuarioId.mockResolvedValue(0);
      mockHabitoRepository.save.mockResolvedValue(mockHabito);

      const resultado = await habitoService.criarHabito({
        usuarioId,
        nome: 'Ler livros',
      });

      expect(mockUsuarioRepository.findById).toHaveBeenCalledWith(usuarioId);
      expect(mockHabitoRepository.countByUsuarioId).toHaveBeenCalledWith(
        usuarioId,
      );
      expect(mockHabitoRepository.save).toHaveBeenCalled();
      expect(resultado.nome).toBe('Ler livros');
      expect(resultado.usuarioId).toBe(usuarioId);
    });

    it('deve lançar erro se usuário não for encontrado', async () => {
      mockUsuarioRepository.findById.mockResolvedValue(null);

      await expect(
        habitoService.criarHabito({
          usuarioId,
          nome: 'Ler livros',
        }),
      ).rejects.toThrow('Usuário não encontrado.');

      expect(mockHabitoRepository.save).not.toHaveBeenCalled();
    });

    it('deve definir a ordem corretamente baseada no total existente', async () => {
      const mockUsuario = {
        id: usuarioId,
        nome: 'João',
        email: 'joao@test.com',
        senhaHash: 'hash',
        createdAt: new Date(),
      } as Usuario;

      mockUsuarioRepository.findById.mockResolvedValue(mockUsuario);
      mockHabitoRepository.countByUsuarioId.mockResolvedValue(3);

      const mockHabito = Habito.create({
        usuarioId,
        nome: 'Exercitar',
        ordem: 3,
      });

      mockHabitoRepository.save.mockResolvedValue(mockHabito);

      await habitoService.criarHabito({
        usuarioId,
        nome: 'Exercitar',
      });

      expect(mockHabitoRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ordem: 3,
        }),
      );
    });
  });

  describe('listarHabitosPorUsuario', () => {
    it('deve retornar lista de hábitos do usuário', async () => {
      const mockHabitos = [
        Habito.create({
          usuarioId,
          nome: 'Ler livros',
          ordem: 0,
        }),
        Habito.create({
          usuarioId,
          nome: 'Exercitar',
          ordem: 1,
        }),
      ];

      mockHabitoRepository.findHabitsByUsuarioId.mockResolvedValue(mockHabitos);

      const resultado = await habitoService.listarHabitosPorUsuario(usuarioId);

      expect(mockHabitoRepository.findHabitsByUsuarioId).toHaveBeenCalledWith(
        usuarioId,
      );
      expect(resultado).toHaveLength(2);
      expect(resultado[0].nome).toBe('Ler livros');
      expect(resultado[1].nome).toBe('Exercitar');
    });

    it('deve retornar array vazio se não houver hábitos', async () => {
      mockHabitoRepository.findHabitsByUsuarioId.mockResolvedValue([]);

      const resultado = await habitoService.listarHabitosPorUsuario(usuarioId);

      expect(resultado).toEqual([]);
    });
  });

  describe('marcarComoConcluido', () => {
    it('deve marcar hábito como concluído com sucesso', async () => {
      const mockHabito = Habito.create({
        usuarioId,
        nome: 'Ler livros',
        ordem: 0,
      });

      const habitoAtualizado = Habito.create({
        usuarioId,
        nome: 'Ler livros',
        ordem: 0,
      });
      habitoAtualizado.marcarConcluido(new Date());

      mockHabitoRepository.findById.mockResolvedValue(mockHabito);
      mockHabitoRepository.update.mockResolvedValue(habitoAtualizado);

      const resultado = await habitoService.marcarComoConcluido(
        habitoId,
        usuarioId,
      );

      expect(mockHabitoRepository.findById).toHaveBeenCalledWith(habitoId);
      expect(mockHabitoRepository.update).toHaveBeenCalled();
      expect(resultado.sequenciaAtual).toBe(1);
    });

    it('deve lançar erro se hábito não for encontrado', async () => {
      mockHabitoRepository.findById.mockResolvedValue(null);

      await expect(
        habitoService.marcarComoConcluido(habitoId, usuarioId),
      ).rejects.toThrow('Hábito não encontrado.');

      expect(mockHabitoRepository.update).not.toHaveBeenCalled();
    });

    it('deve lançar erro se usuário não tiver permissão', async () => {
      const outroUsuarioId = '507f1f77bcf86cd799439013';
      const mockHabito = Habito.create({
        usuarioId: outroUsuarioId,
        nome: 'Ler livros',
        ordem: 0,
      });

      mockHabitoRepository.findById.mockResolvedValue(mockHabito);

      await expect(
        habitoService.marcarComoConcluido(habitoId, usuarioId),
      ).rejects.toThrow('Você não tem permissão para editar este hábito.');

      expect(mockHabitoRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('editarHabito', () => {
    it('deve editar hábito com sucesso', async () => {
      const mockHabito = Habito.create({
        usuarioId,
        nome: 'Ler livros',
        ordem: 0,
      });

      const habitoAtualizado = Habito.create({
        usuarioId,
        nome: 'Ler 30 minutos',
        cor: EnumHabitColor.RED,
        ordem: 0,
      });

      mockHabitoRepository.findById.mockResolvedValue(mockHabito);
      mockHabitoRepository.update.mockResolvedValue(habitoAtualizado);

      const resultado = await habitoService.editarHabito(habitoId, usuarioId, {
        nome: 'Ler 30 minutos',
        cor: EnumHabitColor.RED,
      });

      expect(mockHabitoRepository.findById).toHaveBeenCalledWith(habitoId);
      expect(mockHabitoRepository.update).toHaveBeenCalled();
      expect(resultado.nome).toBe('Ler 30 minutos');
    });

    it('deve lançar erro se hábito não for encontrado', async () => {
      mockHabitoRepository.findById.mockResolvedValue(null);

      await expect(
        habitoService.editarHabito(habitoId, usuarioId, { nome: 'Novo nome' }),
      ).rejects.toThrow('Hábito não encontrado.');

      expect(mockHabitoRepository.update).not.toHaveBeenCalled();
    });

    it('deve lançar erro se usuário não tiver permissão', async () => {
      const outroUsuarioId = '507f1f77bcf86cd799439013';
      const mockHabito = Habito.create({
        usuarioId: outroUsuarioId,
        nome: 'Ler livros',
        ordem: 0,
      });

      mockHabitoRepository.findById.mockResolvedValue(mockHabito);

      await expect(
        habitoService.editarHabito(habitoId, usuarioId, { nome: 'Novo nome' }),
      ).rejects.toThrow('Você não tem permissão para editar este hábito.');

      expect(mockHabitoRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('softDeleteHabito', () => {
    it('deve remover hábito com sucesso (soft delete)', async () => {
      const mockHabito = Habito.create({
        usuarioId,
        nome: 'Ler livros',
        ordem: 0,
      });

      mockHabitoRepository.findById.mockResolvedValue(mockHabito);
      mockHabitoRepository.softDelete.mockResolvedValue(true);

      await habitoService.softDeleteHabito(habitoId, usuarioId);

      expect(mockHabitoRepository.findById).toHaveBeenCalledWith(habitoId);
      expect(mockHabitoRepository.softDelete).toHaveBeenCalledWith(habitoId);
    });

    it('deve lançar erro se hábito não for encontrado', async () => {
      mockHabitoRepository.findById.mockResolvedValue(null);

      await expect(
        habitoService.softDeleteHabito(habitoId, usuarioId),
      ).rejects.toThrow('Hábito não encontrado.');

      expect(mockHabitoRepository.softDelete).not.toHaveBeenCalled();
    });

    it('deve lançar erro se usuário não for dono do hábito', async () => {
      const outroUsuarioId = '507f1f77bcf86cd799439099';
      const mockHabito = Habito.create({
        usuarioId,
        nome: 'Ler livros',
        ordem: 0,
      });

      mockHabitoRepository.findById.mockResolvedValue(mockHabito);

      await expect(
        habitoService.softDeleteHabito(habitoId, outroUsuarioId),
      ).rejects.toThrow('Você não tem permissão para remover este hábito.');

      expect(mockHabitoRepository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('reordenarHabitos', () => {
    it('deve reordenar hábitos com sucesso', async () => {
      const mockUsuario = {
        id: usuarioId,
        nome: 'João',
        email: 'joao@test.com',
        senhaHash: 'hash',
        createdAt: new Date(),
      } as Usuario;

      const habito1 = Habito.create({
        usuarioId,
        nome: 'Hábito 1',
        ordem: 0,
      });
      const habito2 = Habito.create({
        usuarioId,
        nome: 'Hábito 2',
        ordem: 1,
      });

      mockUsuarioRepository.findById.mockResolvedValue(mockUsuario);
      mockHabitoRepository.findById
        .mockResolvedValueOnce(habito1)
        .mockResolvedValueOnce(habito2);
      mockHabitoRepository.update.mockResolvedValue(habito1);

      await habitoService.reordenarHabitos(usuarioId, [
        habitoId,
        '507f1f77bcf86cd799439013',
      ]);

      expect(mockUsuarioRepository.findById).toHaveBeenCalledWith(usuarioId);
      expect(mockHabitoRepository.findById).toHaveBeenCalledTimes(2);
      expect(mockHabitoRepository.update).toHaveBeenCalledTimes(2);
    });

    it('deve lançar erro se usuário não for encontrado', async () => {
      mockUsuarioRepository.findById.mockResolvedValue(null);

      await expect(
        habitoService.reordenarHabitos(usuarioId, [habitoId]),
      ).rejects.toThrow('Usuário não encontrado.');

      expect(mockHabitoRepository.findById).not.toHaveBeenCalled();
    });

    it('deve lançar erro se hábito não for encontrado', async () => {
      const mockUsuario = {
        id: usuarioId,
        nome: 'João',
        email: 'joao@test.com',
        senhaHash: 'hash',
        createdAt: new Date(),
      } as Usuario;

      mockUsuarioRepository.findById.mockResolvedValue(mockUsuario);
      mockHabitoRepository.findById.mockResolvedValue(null);

      await expect(
        habitoService.reordenarHabitos(usuarioId, [habitoId]),
      ).rejects.toThrow(`Hábito com ID ${habitoId} não encontrado.`);
    });

    it('deve lançar erro se usuário não tiver permissão para reordenar', async () => {
      const outroUsuarioId = '507f1f77bcf86cd799439013';
      const mockUsuario = {
        id: usuarioId,
        nome: 'João',
        email: 'joao@test.com',
        senhaHash: 'hash',
        createdAt: new Date(),
      } as Usuario;

      const mockHabito = Habito.create({
        usuarioId: outroUsuarioId,
        nome: 'Hábito',
        ordem: 0,
      });

      mockUsuarioRepository.findById.mockResolvedValue(mockUsuario);
      mockHabitoRepository.findById.mockResolvedValue(mockHabito);

      await expect(
        habitoService.reordenarHabitos(usuarioId, [habitoId]),
      ).rejects.toThrow('Você não tem permissão para reordenar este hábito.');
    });
  });
});
