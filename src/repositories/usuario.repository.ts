import UsuarioModel, {
  IUsuario as IUsuarioModel,
} from '../models/usuario.model';
import { Usuario } from '../domain/entities/usuario.entity';
import { IUsuarioRepository } from '../domain/repositories/IUsuario.repository';

const toPersistence = (usuario: Usuario) => {
  return {
    _id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    senha: usuario.senhaHash,
    createdAt: usuario.createdAt,
  };
};

const toDomain = (model: IUsuarioModel): Usuario => {
  return Usuario.fromPersistence({
    id: model._id.toString(),
    nome: model.nome,
    email: model.email,

    senhaHash: model.senha,
    createdAt: model.createdAt,
  });
};

export class MongooseUsuarioRepository implements IUsuarioRepository {
  async save(usuario: Usuario): Promise<Usuario> {
    const dadosPersistencia = toPersistence(usuario);

    const novoUsuarioModel = new UsuarioModel(dadosPersistencia);
    const usuarioSalvo = await novoUsuarioModel.save();

    return toDomain(usuarioSalvo);
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const usuarioModel = await UsuarioModel.findOne({ email }).select('+senha');

    if (!usuarioModel) {
      return null;
    }

    return toDomain(usuarioModel);
  }

  async findById(id: string): Promise<Usuario | null> {
    const usuarioModel = await UsuarioModel.findById(id);

    if (!usuarioModel) {
      return null;
    }

    return toDomain(usuarioModel);
  }

  async update(
    usuarioId: string,
    data: { nome?: string; email?: string },
  ): Promise<Usuario | null> {
    const usuarioModel = await UsuarioModel.findByIdAndUpdate(
      usuarioId,
      { $set: data },
      { new: true },
    );

    if (!usuarioModel) {
      return null;
    }

    return toDomain(usuarioModel);
  }
}
