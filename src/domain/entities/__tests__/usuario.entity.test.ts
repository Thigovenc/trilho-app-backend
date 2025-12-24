import { Usuario } from '../usuario.entity';
import bcrypt from 'bcryptjs';

// Mock do bcrypt
jest.mock('bcryptjs');

describe('Usuario Entity', () => {
  const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar um usuário com senha hashada', async () => {
      const mockHash = 'hashedPassword123';
      const mockSalt = 'salt123';

      mockBcrypt.genSalt.mockResolvedValue(mockSalt as never);
      mockBcrypt.hash.mockResolvedValue(mockHash as never);

      const usuario = await Usuario.create({
        nome: 'João Silva',
        email: 'joao@example.com',
        senhaPlana: 'senha123',
      });

      expect(usuario.nome).toBe('João Silva');
      expect(usuario.email).toBe('joao@example.com');
      expect(usuario.senhaHash).toBe(mockHash);
      expect(usuario.createdAt).toBeInstanceOf(Date);
      expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(mockBcrypt.hash).toHaveBeenCalledWith('senha123', mockSalt);
    });

    it('deve lançar erro se o nome for "admin"', async () => {
      mockBcrypt.genSalt.mockResolvedValue('salt' as never);
      mockBcrypt.hash.mockResolvedValue('hash' as never);

      await expect(
        Usuario.create({
          nome: 'admin',
          email: 'admin@example.com',
          senhaPlana: 'senha123',
        }),
      ).rejects.toThrow('Nome de usuário "admin" não é permitido.');

      expect(mockBcrypt.hash).not.toHaveBeenCalled();
    });

    it('deve lançar erro se o nome for "ADMIN" (case insensitive)', async () => {
      mockBcrypt.genSalt.mockResolvedValue('salt' as never);
      mockBcrypt.hash.mockResolvedValue('hash' as never);

      await expect(
        Usuario.create({
          nome: 'ADMIN',
          email: 'admin@example.com',
          senhaPlana: 'senha123',
        }),
      ).rejects.toThrow('Nome de usuário "admin" não é permitido.');
    });

    it('deve lançar erro se o email for de domínio proibido', async () => {
      mockBcrypt.genSalt.mockResolvedValue('salt' as never);
      mockBcrypt.hash.mockResolvedValue('hash' as never);

      await expect(
        Usuario.create({
          nome: 'João',
          email: 'joao@dominio-proibido.com',
          senhaPlana: 'senha123',
        }),
      ).rejects.toThrow('Este domínio de e-mail não é permitido.');

      expect(mockBcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('fromPersistence', () => {
    it('deve criar um usuário a partir de dados de persistência', () => {
      const dataCriacao = new Date('2024-01-01');
      const usuario = Usuario.fromPersistence({
        id: '507f1f77bcf86cd799439011',
        nome: 'Maria Silva',
        email: 'maria@example.com',
        senhaHash: 'hashExistente',
        createdAt: dataCriacao,
      });

      expect(usuario.id).toBe('507f1f77bcf86cd799439011');
      expect(usuario.nome).toBe('Maria Silva');
      expect(usuario.email).toBe('maria@example.com');
      expect(usuario.senhaHash).toBe('hashExistente');
      expect(usuario.createdAt).toEqual(dataCriacao);
    });

    it('deve usar data atual se createdAt não for fornecido', () => {
      const antes = new Date();
      const usuario = Usuario.fromPersistence({
        id: '507f1f77bcf86cd799439011',
        nome: 'Teste',
        email: 'teste@example.com',
        senhaHash: 'hash',
        createdAt: new Date(),
      });
      const depois = new Date();

      expect(usuario.createdAt.getTime()).toBeGreaterThanOrEqual(
        antes.getTime(),
      );
      expect(usuario.createdAt.getTime()).toBeLessThanOrEqual(depois.getTime());
    });
  });

  describe('compararSenha', () => {
    it('deve retornar true se a senha estiver correta', async () => {
      const usuario = Usuario.fromPersistence({
        id: '507f1f77bcf86cd799439011',
        nome: 'João',
        email: 'joao@example.com',
        senhaHash: 'hashExistente',
        createdAt: new Date(),
      });

      mockBcrypt.compare.mockResolvedValue(true as never);

      const resultado = await usuario.compararSenha('senha123');

      expect(resultado).toBe(true);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        'senha123',
        'hashExistente',
      );
    });

    it('deve retornar false se a senha estiver incorreta', async () => {
      const usuario = Usuario.fromPersistence({
        id: '507f1f77bcf86cd799439011',
        nome: 'João',
        email: 'joao@example.com',
        senhaHash: 'hashExistente',
        createdAt: new Date(),
      });

      mockBcrypt.compare.mockResolvedValue(false as never);

      const resultado = await usuario.compararSenha('senhaErrada');

      expect(resultado).toBe(false);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        'senhaErrada',
        'hashExistente',
      );
    });
  });
});
