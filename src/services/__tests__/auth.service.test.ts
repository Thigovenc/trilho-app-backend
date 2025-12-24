import { AuthService } from '../auth.service';
import { Usuario } from '../../domain/entities/usuario.entity';
import { IUsuarioRepository } from '../../domain/repositories/IUsuario.repository';
import { gerarToken } from '../../utils/jwt.util';
import bcrypt from 'bcryptjs';

// Mock do jwt.util
jest.mock('../../utils/jwt.util', () => ({
  gerarToken: jest.fn(),
}));

// Mock do bcrypt
jest.mock('bcryptjs');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUsuarioRepository: jest.Mocked<IUsuarioRepository>;
  const mockGerarToken = gerarToken as jest.MockedFunction<typeof gerarToken>;
  const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

  const usuarioId = '507f1f77bcf86cd799439011';

  beforeEach(() => {
    jest.clearAllMocks();

    mockUsuarioRepository = {
      save: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };

    authService = new AuthService(mockUsuarioRepository);

    // Configurar variável de ambiente para JWT
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  describe('register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const mockHash = 'hashedPassword123';
      const mockSalt = 'salt123';
      const mockToken = 'mock-jwt-token';

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

      mockUsuarioRepository.findByEmail.mockResolvedValue(null);
      mockUsuarioRepository.save.mockResolvedValue(usuarioSalvo);
      mockGerarToken.mockReturnValue(mockToken);

      const resultado = await authService.register({
        nome: 'João Silva',
        email: 'joao@example.com',
        senha: 'senha123',
      });

      expect(mockUsuarioRepository.findByEmail).toHaveBeenCalledWith(
        'joao@example.com',
      );
      expect(mockUsuarioRepository.save).toHaveBeenCalled();
      expect(mockGerarToken).toHaveBeenCalledWith(usuarioId);
      expect(resultado.usuario).toEqual(usuarioSalvo);
      expect(resultado.token).toBe(mockToken);
    });

    it('deve lançar erro se o email já estiver em uso', async () => {
      const usuarioExistente = Usuario.fromPersistence({
        id: usuarioId,
        nome: 'João',
        email: 'joao@example.com',
        senhaHash: 'hash',
        createdAt: new Date(),
      });

      mockUsuarioRepository.findByEmail.mockResolvedValue(usuarioExistente);

      await expect(
        authService.register({
          nome: 'João Silva',
          email: 'joao@example.com',
          senha: 'senha123',
        }),
      ).rejects.toThrow('Este e-mail já está em uso');

      expect(mockUsuarioRepository.save).not.toHaveBeenCalled();
      expect(mockGerarToken).not.toHaveBeenCalled();
    });

    it('deve lançar erro se o nome for "admin"', async () => {
      mockUsuarioRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authService.register({
          nome: 'admin',
          email: 'admin@example.com',
          senha: 'senha123',
        }),
      ).rejects.toThrow('Nome de usuário "admin" não é permitido.');

      expect(mockUsuarioRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('deve fazer login com sucesso', async () => {
      const mockToken = 'mock-jwt-token';
      const usuario = Usuario.fromPersistence({
        id: usuarioId,
        nome: 'João Silva',
        email: 'joao@example.com',
        senhaHash: 'hashedPassword',
        createdAt: new Date(),
      });

      mockUsuarioRepository.findByEmail.mockResolvedValue(usuario);
      mockBcrypt.compare.mockResolvedValue(true as never);
      mockGerarToken.mockReturnValue(mockToken);

      const resultado = await authService.login({
        email: 'joao@example.com',
        senha: 'senha123',
      });

      expect(mockUsuarioRepository.findByEmail).toHaveBeenCalledWith(
        'joao@example.com',
      );
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        'senha123',
        'hashedPassword',
      );
      expect(mockGerarToken).toHaveBeenCalledWith(usuarioId);
      expect(resultado.usuario).toEqual(usuario);
      expect(resultado.token).toBe(mockToken);
    });

    it('deve lançar erro se o usuário não for encontrado', async () => {
      mockUsuarioRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'naoexiste@example.com',
          senha: 'senha123',
        }),
      ).rejects.toThrow('Credenciais inválidas');

      expect(mockBcrypt.compare).not.toHaveBeenCalled();
      expect(mockGerarToken).not.toHaveBeenCalled();
    });

    it('deve lançar erro se a senha estiver incorreta', async () => {
      const usuario = Usuario.fromPersistence({
        id: usuarioId,
        nome: 'João Silva',
        email: 'joao@example.com',
        senhaHash: 'hashedPassword',
        createdAt: new Date(),
      });

      mockUsuarioRepository.findByEmail.mockResolvedValue(usuario);
      mockBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        authService.login({
          email: 'joao@example.com',
          senha: 'senhaErrada',
        }),
      ).rejects.toThrow('Credenciais inválidas');

      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        'senhaErrada',
        'hashedPassword',
      );
      expect(mockGerarToken).not.toHaveBeenCalled();
    });
  });
});
