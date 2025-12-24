import request from 'supertest';
import express, { Application } from 'express';
import { Usuario } from '../../domain/entities/usuario.entity';
import bcrypt from 'bcryptjs';

// Mock dos repositórios e serviços ANTES de importar o controller
const mockRegister = jest.fn();
const mockLogin = jest.fn();
const mockUpdatePerfil = jest.fn();

jest.mock('../../repositories/usuario.repository');
jest.mock('../../services/auth.service', () => {
  return {
    AuthService: jest.fn().mockImplementation(() => ({
      register: mockRegister,
      login: mockLogin,
    })),
  };
});
jest.mock('../../services/perfil.service', () => {
  return {
    PerfilService: jest.fn().mockImplementation(() => ({
      updatePerfil: mockUpdatePerfil,
    })),
  };
});
jest.mock('../../utils/jwt.util', () => ({
  gerarToken: jest.fn(() => 'mock-jwt-token'),
}));

// Mock do bcrypt
jest.mock('bcryptjs');

// Importar o controller DEPOIS dos mocks
import * as usuarioController from '../usuario.controller';

describe('UsuarioController', () => {
  let app: Application;

  const usuarioId = '507f1f77bcf86cd799439011';

  // Mock do auth middleware
  const mockAuthMiddleware = (req: any, res: any, next: any) => {
    req.usuario = { id: usuarioId };
    next();
  };

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Rotas
    app.post('/api/usuarios/register', usuarioController.registerUsuario);
    app.post('/api/usuarios/login', usuarioController.loginUsuario);
    app.put(
      '/api/usuarios/perfil',
      mockAuthMiddleware,
      usuarioController.updatePerfil,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/usuarios/register', () => {
    it('deve retornar 201 ao registrar usuário com sucesso', async () => {
      const mockHash = 'hashedPassword123';
      const mockSalt = 'salt123';
      const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

      mockBcrypt.genSalt.mockResolvedValue(mockSalt as never);
      mockBcrypt.hash.mockResolvedValue(mockHash as never);

      const novoUsuario = await Usuario.create({
        nome: 'João Silva',
        email: 'joao@example.com',
        senhaPlana: 'senha123',
      });

      const usuarioSalvo = Usuario.fromPersistence({
        id: usuarioId,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        senhaHash: novoUsuario.senhaHash,
        createdAt: novoUsuario.createdAt,
      });

      mockRegister.mockResolvedValue({
        usuario: usuarioSalvo,
        token: 'mock-jwt-token',
      });

      const response = await request(app).post('/api/usuarios/register').send({
        nome: 'João Silva',
        email: 'joao@example.com',
        senha: 'senha123',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('usuario');
      expect(response.body).toHaveProperty('token');
      expect(response.body.usuario.id).toBe(usuarioId);
      expect(response.body.usuario.nome).toBe('João Silva');
      expect(response.body.usuario.email).toBe('joao@example.com');
      expect(response.body.token).toBe('mock-jwt-token');
    });

    it('deve retornar 400 quando email já está em uso', async () => {
      mockRegister.mockRejectedValue(new Error('Este e-mail já está em uso'));

      const response = await request(app).post('/api/usuarios/register').send({
        nome: 'João Silva',
        email: 'joao@example.com',
        senha: 'senha123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Este e-mail já está em uso');
    });
  });

  describe('POST /api/usuarios/login', () => {
    it('deve retornar 200 ao fazer login com sucesso', async () => {
      const usuario = Usuario.fromPersistence({
        id: usuarioId,
        nome: 'João Silva',
        email: 'joao@example.com',
        senhaHash: 'hashedPassword',
        createdAt: new Date(),
      });

      mockLogin.mockResolvedValue({
        usuario,
        token: 'mock-jwt-token',
      });

      const response = await request(app).post('/api/usuarios/login').send({
        email: 'joao@example.com',
        senha: 'senha123',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('usuario');
      expect(response.body).toHaveProperty('token');
      expect(response.body.usuario.id).toBe(usuarioId);
      expect(response.body.token).toBe('mock-jwt-token');
    });

    it('deve retornar 401 quando credenciais são inválidas', async () => {
      mockLogin.mockRejectedValue(new Error('Credenciais inválidas'));

      const response = await request(app).post('/api/usuarios/login').send({
        email: 'joao@example.com',
        senha: 'senhaErrada',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Credenciais inválidas');
    });
  });

  describe('PUT /api/usuarios/perfil', () => {
    it('deve retornar 200 ao atualizar perfil com sucesso', async () => {
      const usuarioAtualizado = Usuario.fromPersistence({
        id: usuarioId,
        nome: 'João Santos',
        email: 'joao@example.com',
        senhaHash: 'hash',
        createdAt: new Date(),
      });

      mockUpdatePerfil.mockResolvedValue(usuarioAtualizado);

      const response = await request(app).put('/api/usuarios/perfil').send({
        nome: 'João Santos',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('usuario');
      expect(response.body.usuario.nome).toBe('João Santos');
      expect(response.body.usuario.id).toBe(usuarioId);
    });

    it('deve retornar 400 quando há erro na atualização', async () => {
      mockUpdatePerfil.mockRejectedValue(
        new Error('Este e-mail já está em uso por outra conta.'),
      );

      const response = await request(app).put('/api/usuarios/perfil').send({
        email: 'outro@example.com',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe(
        'Este e-mail já está em uso por outra conta.',
      );
    });

    it('deve retornar 500 quando há erro desconhecido', async () => {
      mockUpdatePerfil.mockRejectedValue('Erro desconhecido');

      const response = await request(app).put('/api/usuarios/perfil').send({
        nome: 'Novo Nome',
      });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Um erro desconhecido ocorreu');
    });
  });
});
