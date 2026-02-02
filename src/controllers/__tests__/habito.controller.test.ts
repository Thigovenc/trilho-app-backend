import request from 'supertest';
import express, { Application } from 'express';
import { Habito } from '../../domain/entities/habito.entity';
import { EnumHabitColor, EnumHabitIcon } from '../../domain/enums/habito.enums';

// Mock dos repositórios e serviços ANTES de importar o controller
const mockCriarHabito = jest.fn();
const mockListarHabitosPorUsuario = jest.fn();
const mockMarcarComoConcluido = jest.fn();
const mockEditarHabito = jest.fn();
const mockReordenarHabitos = jest.fn();
const mockSoftDeleteHabito = jest.fn();

jest.mock('../../repositories/habito.repository');
jest.mock('../../repositories/usuario.repository');
jest.mock('../../services/habito.service', () => {
  return {
    HabitoService: jest.fn().mockImplementation(() => ({
      criarHabito: mockCriarHabito,
      listarHabitosPorUsuario: mockListarHabitosPorUsuario,
      marcarComoConcluido: mockMarcarComoConcluido,
      editarHabito: mockEditarHabito,
      reordenarHabitos: mockReordenarHabitos,
      softDeleteHabito: mockSoftDeleteHabito,
    })),
  };
});

// Importar o controller DEPOIS dos mocks
import * as habitoController from '../habito.controller';

describe('HabitoController', () => {
  let app: Application;

  const usuarioId = '507f1f77bcf86cd799439011';
  const habitoId = '507f1f77bcf86cd799439012';

  // Mock do auth middleware
  const mockAuthMiddleware = (req: any, res: any, next: any) => {
    req.usuario = { id: usuarioId };
    next();
  };

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Rotas
    app.post('/api/habitos', mockAuthMiddleware, habitoController.criarHabito);
    app.get('/api/habitos', mockAuthMiddleware, habitoController.listarHabitos);
    app.post(
      '/api/habitos/:id/complete',
      mockAuthMiddleware,
      habitoController.marcarComoConcluido,
    );
    app.put(
      '/api/habitos/:id',
      mockAuthMiddleware,
      habitoController.editarHabito,
    );
    app.delete(
      '/api/habitos/:id',
      mockAuthMiddleware,
      habitoController.removerHabito,
    );
    app.patch(
      '/api/habitos/reordenar',
      mockAuthMiddleware,
      habitoController.reordenarHabitos,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/habitos', () => {
    it('deve retornar 201 ao criar hábito com sucesso', async () => {
      const novoHabito = Habito.create({
        usuarioId,
        nome: 'Ler livros',
        cor: EnumHabitColor.BLUE,
        icone: EnumHabitIcon.BOOK,
        ordem: 0,
      });

      mockCriarHabito.mockResolvedValue(novoHabito);

      const response = await request(app).post('/api/habitos').send({
        nome: 'Ler livros',
        cor: EnumHabitColor.BLUE,
        icone: EnumHabitIcon.BOOK,
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('habito');
      expect(response.body.habito.nome).toBe('Ler livros');
    });

    it('deve retornar 400 quando há erro na criação', async () => {
      mockCriarHabito.mockRejectedValue(new Error('Usuário não encontrado.'));

      const response = await request(app).post('/api/habitos').send({
        nome: 'Ler livros',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Usuário não encontrado.');
    });
  });

  describe('GET /api/habitos', () => {
    it('deve retornar 200 com lista de hábitos', async () => {
      const habitos = [
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

      mockListarHabitosPorUsuario.mockResolvedValue(habitos);

      const response = await request(app).get('/api/habitos');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('habitos');
      expect(response.body.habitos).toHaveLength(2);
    });

    it('deve retornar 500 quando há erro', async () => {
      mockListarHabitosPorUsuario.mockRejectedValue(new Error('Erro interno'));

      const response = await request(app).get('/api/habitos');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/habitos/:id/complete', () => {
    it('deve retornar 200 ao marcar hábito como concluído', async () => {
      const habito = Habito.create({
        usuarioId,
        nome: 'Ler livros',
        ordem: 0,
      });
      habito.marcarConcluido(new Date());

      mockMarcarComoConcluido.mockResolvedValue(habito);

      const response = await request(app).post(
        `/api/habitos/${habitoId}/complete`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('mensagem');
      expect(response.body).toHaveProperty('sequenciaAtual');
      expect(response.body).toHaveProperty('maiorSequencia');
      expect(response.body).toHaveProperty('habito');
    });

    it('deve retornar 400 quando hábito não encontrado', async () => {
      mockMarcarComoConcluido.mockRejectedValue(
        new Error('Hábito não encontrado.'),
      );

      const response = await request(app).post(
        `/api/habitos/${habitoId}/complete`,
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Hábito não encontrado.');
    });
  });

  describe('PUT /api/habitos/:id', () => {
    it('deve retornar 200 ao editar hábito com sucesso', async () => {
      const habitoAtualizado = Habito.create({
        usuarioId,
        nome: 'Ler 30 minutos',
        cor: EnumHabitColor.RED,
        ordem: 0,
      });

      mockEditarHabito.mockResolvedValue(habitoAtualizado);

      const response = await request(app).put(`/api/habitos/${habitoId}`).send({
        nome: 'Ler 30 minutos',
        cor: EnumHabitColor.RED,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('habito');
      expect(response.body.habito.nome).toBe('Ler 30 minutos');
    });

    it('deve retornar 400 quando há erro na edição', async () => {
      mockEditarHabito.mockRejectedValue(new Error('Hábito não encontrado.'));

      const response = await request(app).put(`/api/habitos/${habitoId}`).send({
        nome: 'Novo nome',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Hábito não encontrado.');
    });
  });

  describe('DELETE /api/habitos/:id', () => {
    it('deve retornar 200 ao remover hábito com sucesso (soft delete)', async () => {
      mockSoftDeleteHabito.mockResolvedValue(undefined);

      const response = await request(app).delete(`/api/habitos/${habitoId}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Hábito removido com sucesso.');
      expect(mockSoftDeleteHabito).toHaveBeenCalledWith(habitoId, usuarioId);
    });

    it('deve retornar 400 quando hábito não encontrado', async () => {
      mockSoftDeleteHabito.mockRejectedValue(
        new Error('Hábito não encontrado.'),
      );

      const response = await request(app).delete(`/api/habitos/${habitoId}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Hábito não encontrado.');
    });
  });

  describe('PATCH /api/habitos/reordenar', () => {
    it('deve retornar 200 ao reordenar hábitos com sucesso', async () => {
      mockReordenarHabitos.mockResolvedValue(undefined);

      const response = await request(app)
        .patch('/api/habitos/reordenar')
        .send({
          ordemHabitos: [habitoId, '507f1f77bcf86cd799439013'],
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Ordem atualizada com sucesso.');
    });

    it('deve retornar 500 quando há erro ao reordenar', async () => {
      mockReordenarHabitos.mockRejectedValue(new Error('Erro ao reordenar'));

      const response = await request(app)
        .patch('/api/habitos/reordenar')
        .send({
          ordemHabitos: [habitoId],
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Erro ao reordenar.');
    });
  });
});
