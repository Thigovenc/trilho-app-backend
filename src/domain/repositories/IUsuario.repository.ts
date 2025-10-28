import { Usuario } from '../entities/usuario.entity';

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
