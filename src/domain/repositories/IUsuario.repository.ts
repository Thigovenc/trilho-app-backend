import { Usuario } from '../entities/usuario.entity';

/**
 * Esta é a "Porta" de Repositório (Princípio da Inversão de Dependência)
 * * Define o CONTRATO que qualquer classe de repositório de usuário
 * DEVE seguir, não importa se é Mongoose, Prisma, ou SQL.
 * * A Camada de Serviço (AuthService) dependerá DESTA interface,
 * e não de uma implementação concreta.
 */
export interface IUsuarioRepository {
  /**
   * Salva uma nova entidade de usuário no banco
   * @param usuario A entidade de domínio Usuario
   */
  save(usuario: Usuario): Promise<Usuario>;

  /**
   * Busca um usuário pelo seu e-mail
   * @param email O e-mail do usuário
   */
  findByEmail(email: string): Promise<Usuario | null>;

  /**
   * Busca um usuário pelo seu ID
   * @param id O ID do usuário
   */
  findById(id: string): Promise<Usuario | null>;
}