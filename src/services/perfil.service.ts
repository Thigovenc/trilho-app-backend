import { IUsuarioRepository } from '../domain/repositories/IUsuario.repository';
import { Usuario } from '../domain/entities/usuario.entity';
import { UpdatePerfilInput } from '../validations/usuario.validation';

export class PerfilService {
  constructor(private usuarioRepository: IUsuarioRepository) {
    console.log('PerfilService instanciado.');
  }

  public async updatePerfil(
    usuarioId: string,
    input: UpdatePerfilInput,
  ): Promise<Usuario> {
    if (input.email) {
      const emailExistente = await this.usuarioRepository.findByEmail(
        input.email,
      );
      if (emailExistente && emailExistente.id !== usuarioId) {
        throw new Error('Este e-mail já está em uso por outra conta.');
      }
    }

    const usuarioAtualizado = await this.usuarioRepository.update(
      usuarioId,
      input,
    );
    if (!usuarioAtualizado) {
      throw new Error('Usuário não encontrado.');
    }
    return usuarioAtualizado;
  }
}
