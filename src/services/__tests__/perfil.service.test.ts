import { PerfilService } from '../perfil.service';
import { IUsuarioRepository } from '../../domain/repositories/IUsuario.repository';
import { Usuario } from '../../domain/entities/usuario.entity';

describe('PerfilService', () => {
  let perfilService: PerfilService;
  let mockUsuarioRepository: jest.Mocked<IUsuarioRepository>;

  const usuarioId = '507f1f77bcf86cd799439011';
  const outroUsuarioId = '507f1f77bcf86cd799439012';

  beforeEach(() => {
    mockUsuarioRepository = {
      save: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };

    perfilService = new PerfilService(mockUsuarioRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updatePerfil', () => {
    it('deve atualizar apenas o nome do perfil', async () => {
      const usuarioAtual = Usuario.fromPersistence({
        id: usuarioId,
        nome: 'João Silva',
        email: 'joao@example.com',
        senhaHash: 'hash',
        createdAt: new Date(),
      });

      const usuarioAtualizado = Usuario.fromPersistence({
        id: usuarioId,
        nome: 'João Santos',
        email: 'joao@example.com',
        senhaHash: 'hash',
        createdAt: usuarioAtual.createdAt,
      });

      mockUsuarioRepository.update.mockResolvedValue(usuarioAtualizado);

      const resultado = await perfilService.updatePerfil(usuarioId, {
        nome: 'João Santos',
      });

      expect(mockUsuarioRepository.update).toHaveBeenCalledWith(usuarioId, {
        nome: 'João Santos',
      });
      expect(resultado.nome).toBe('João Santos');
      expect(resultado.email).toBe('joao@example.com');
    });

    it('deve atualizar apenas o email do perfil', async () => {
      const usuarioAtualizado = Usuario.fromPersistence({
        id: usuarioId,
        nome: 'João Silva',
        email: 'joao.novo@example.com',
        senhaHash: 'hash',
        createdAt: new Date(),
      });

      mockUsuarioRepository.findByEmail.mockResolvedValue(null);
      mockUsuarioRepository.update.mockResolvedValue(usuarioAtualizado);

      const resultado = await perfilService.updatePerfil(usuarioId, {
        email: 'joao.novo@example.com',
      });

      expect(mockUsuarioRepository.findByEmail).toHaveBeenCalledWith(
        'joao.novo@example.com',
      );
      expect(mockUsuarioRepository.update).toHaveBeenCalledWith(usuarioId, {
        email: 'joao.novo@example.com',
      });
      expect(resultado.email).toBe('joao.novo@example.com');
    });

    it('deve atualizar nome e email simultaneamente', async () => {
      const usuarioAtualizado = Usuario.fromPersistence({
        id: usuarioId,
        nome: 'João Santos',
        email: 'joao.novo@example.com',
        senhaHash: 'hash',
        createdAt: new Date(),
      });

      mockUsuarioRepository.findByEmail.mockResolvedValue(null);
      mockUsuarioRepository.update.mockResolvedValue(usuarioAtualizado);

      const resultado = await perfilService.updatePerfil(usuarioId, {
        nome: 'João Santos',
        email: 'joao.novo@example.com',
      });

      expect(mockUsuarioRepository.findByEmail).toHaveBeenCalledWith(
        'joao.novo@example.com',
      );
      expect(mockUsuarioRepository.update).toHaveBeenCalledWith(usuarioId, {
        nome: 'João Santos',
        email: 'joao.novo@example.com',
      });
      expect(resultado.nome).toBe('João Santos');
      expect(resultado.email).toBe('joao.novo@example.com');
    });

    it('deve permitir atualizar email para o mesmo email do usuário', async () => {
      const usuarioAtual = Usuario.fromPersistence({
        id: usuarioId,
        nome: 'João Silva',
        email: 'joao@example.com',
        senhaHash: 'hash',
        createdAt: new Date(),
      });

      const usuarioAtualizado = Usuario.fromPersistence({
        id: usuarioId,
        nome: 'João Silva',
        email: 'joao@example.com',
        senhaHash: 'hash',
        createdAt: usuarioAtual.createdAt,
      });

      mockUsuarioRepository.findByEmail.mockResolvedValue(usuarioAtual);
      mockUsuarioRepository.update.mockResolvedValue(usuarioAtualizado);

      const resultado = await perfilService.updatePerfil(usuarioId, {
        email: 'joao@example.com',
      });

      expect(mockUsuarioRepository.findByEmail).toHaveBeenCalledWith(
        'joao@example.com',
      );
      expect(mockUsuarioRepository.update).toHaveBeenCalled();
      expect(resultado.email).toBe('joao@example.com');
    });

    it('deve lançar erro se o email já estiver em uso por outro usuário', async () => {
      const outroUsuario = Usuario.fromPersistence({
        id: outroUsuarioId,
        nome: 'Maria Silva',
        email: 'maria@example.com',
        senhaHash: 'hash',
        createdAt: new Date(),
      });

      mockUsuarioRepository.findByEmail.mockResolvedValue(outroUsuario);

      await expect(
        perfilService.updatePerfil(usuarioId, {
          email: 'maria@example.com',
        }),
      ).rejects.toThrow('Este e-mail já está em uso por outra conta.');

      expect(mockUsuarioRepository.update).not.toHaveBeenCalled();
    });

    it('deve lançar erro se o usuário não for encontrado', async () => {
      mockUsuarioRepository.findByEmail.mockResolvedValue(null);
      mockUsuarioRepository.update.mockResolvedValue(null);

      await expect(
        perfilService.updatePerfil(usuarioId, {
          nome: 'Novo Nome',
        }),
      ).rejects.toThrow('Usuário não encontrado.');

      expect(mockUsuarioRepository.update).toHaveBeenCalled();
    });

    it('não deve verificar email se apenas o nome for atualizado', async () => {
      const usuarioAtualizado = Usuario.fromPersistence({
        id: usuarioId,
        nome: 'João Santos',
        email: 'joao@example.com',
        senhaHash: 'hash',
        createdAt: new Date(),
      });

      mockUsuarioRepository.update.mockResolvedValue(usuarioAtualizado);

      await perfilService.updatePerfil(usuarioId, {
        nome: 'João Santos',
      });

      expect(mockUsuarioRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockUsuarioRepository.update).toHaveBeenCalledWith(usuarioId, {
        nome: 'João Santos',
      });
    });
  });
});
