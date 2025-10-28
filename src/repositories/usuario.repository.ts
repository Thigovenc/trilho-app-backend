import UsuarioModel, {
  IUsuario as IUsuarioModel,
} from '../models/usuario.model';
import { Usuario } from '../domain/entities/usuario.entity';
import { IUsuarioRepository } from '../domain/repositories/IUsuario.repository';

// --- Funções de "Mapper" (Tradução) ---

/**
 * Traduz a nossa Entidade de Domínio (classe Usuario) para
 * o formato que o Mongoose Model (IUsuarioModel) espera.
 */
const toPersistence = (usuario: Usuario) => {
  return {
    _id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    senha: usuario.senhaHash, // O model chama de 'senha', a entidade de 'senhaHash'
    createdAt: usuario.createdAt,
  };
};

/**
 * Traduz o Documento Mongoose (IUsuarioModel), vindo do banco,
 * de volta para a nossa Entidade de Domínio (classe Usuario).
 * Usamos o factory 'fromPersistence' da entidade.
 */
const toDomain = (model: IUsuarioModel): Usuario => {
  return Usuario.fromPersistence({
    id: model._id.toString(),
    nome: model.nome,
    email: model.email,
    // Cuidado: 'senha' só vem se pedirmos com .select('+senha')
    senhaHash: model.senha,
    createdAt: model.createdAt,
  });
};

// --- Implementação Concreta (O "Adaptador") ---

/**
 * Esta é a implementação concreta da nossa interface IUsuarioRepository
 * usando Mongoose. Ela sabe como falar com o MongoDB.
 */
export class MongooseUsuarioRepository implements IUsuarioRepository {
  /**
   * Salva uma nova entidade de usuário no banco
   */
  async save(usuario: Usuario): Promise<Usuario> {
    const dadosPersistencia = toPersistence(usuario);

    // Cria um novo documento Mongoose e o salva
    const novoUsuarioModel = new UsuarioModel(dadosPersistencia);
    const usuarioSalvo = await novoUsuarioModel.save();

    // Retorna a entidade de domínio "re-hidratada"
    return toDomain(usuarioSalvo);
  }

  /**
   * Busca um usuário pelo e-mail
   */
  async findByEmail(email: string): Promise<Usuario | null> {
    // Busca o usuário no banco
    // IMPORTANTE: .select('+senha') para forçar o Mongoose
    // a trazer a senha, que está oculta por padrão.
    const usuarioModel = await UsuarioModel.findOne({ email }).select('+senha');

    if (!usuarioModel) {
      return null;
    }

    // Converte o modelo Mongoose para a entidade de domínio
    return toDomain(usuarioModel);
  }

  /**
   * Busca um usuário pelo ID
   */
  async findById(id: string): Promise<Usuario | null> {
    // Busca o usuário no banco pelo ID
    // (Não precisamos de .select('+senha') aqui,
    // pois é usado para autenticação, não para login)
    const usuarioModel = await UsuarioModel.findById(id);

    if (!usuarioModel) {
      return null;
    }

    // Converte o modelo Mongoose para a entidade de domínio
    return toDomain(usuarioModel);
  }
}
