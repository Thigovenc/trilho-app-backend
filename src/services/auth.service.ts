import { Usuario } from '../domain/entities/usuario.entity';
import { IUsuarioRepository } from '../domain/repositories/IUsuario.repository';
import { gerarToken } from '../utils/jwt.util';
import { RegisterInput, LoginInput } from '../validations/usuario.validation';

export class AuthService {
  private usuarioRepository: IUsuarioRepository;

  constructor(usuarioRepository: IUsuarioRepository) {
    this.usuarioRepository = usuarioRepository;
    console.log('AuthService instanciado com um repositório.');
  }

  public async register(input: RegisterInput) {
    const emailExistente = await this.usuarioRepository.findByEmail(
      input.email,
    );
    if (emailExistente) {
      throw new Error('Este e-mail já está em uso');
    }

    const novoUsuario = await Usuario.create({
      nome: input.nome,
      email: input.email,
      senhaPlana: input.senha,
    });

    const usuarioSalvo = await this.usuarioRepository.save(novoUsuario);

    const token = gerarToken(usuarioSalvo.id!);

    return { usuario: usuarioSalvo, token };
  }

  public async login(input: LoginInput) {
    const { email, senha } = input;

    const usuario = await this.usuarioRepository.findByEmail(email);
    if (!usuario) {
      throw new Error('Credenciais inválidas');
    }

    const senhaCorreta = await usuario.compararSenha(senha);
    if (!senhaCorreta) {
      throw new Error('Credenciais inválidas');
    }

    const token = gerarToken(usuario.id!);

    return { usuario, token };
  }
}
