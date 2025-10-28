import { Usuario } from '../entities/usuario.entity';
export interface IUsuarioRepository {
  save(usuario: Usuario): Promise<Usuario>;
  findByEmail(email: string): Promise<Usuario | null>;
  findById(id: string): Promise<Usuario | null>;
}
