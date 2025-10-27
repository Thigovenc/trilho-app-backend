import { Usuario } from '../domain/entities/usuario.entity';
import { IUsuarioRepository } from '../domain/repositories/IUsuario.repository';
import { gerarToken } from '../utils/jwt.util';
// Importamos os tipos do Zod (Fase 3)
import { RegisterInput, LoginInput } from '../validations/usuario.validation';

/**
 * Esta é a Camada de Serviço (ou "Aplicação").
 * Ela orquestra o fluxo de negócio.
 * Ela depende da INTERFACE do repositório, não da implementação.
 */
export class AuthService {
  // A classe armazena a dependência (o repositório)
  private usuarioRepository: IUsuarioRepository;

  // A dependência é "injetada" via construtor
  constructor(usuarioRepository: IUsuarioRepository) {
    this.usuarioRepository = usuarioRepository;
    console.log('AuthService instanciado com um repositório.'); // Log para debug
  }

  /**
   * Lógica de Negócio para REGISTRO (Create)
   */
  public async register(input: RegisterInput) {
    // 1. Verificar se o e-mail já existe (Lógica do Serviço)
    const emailExistente = await this.usuarioRepository.findByEmail(input.email);
    if (emailExistente) {
      throw new Error('Este e-mail já está em uso');
    }

    // 2. Chamar a ENTIDADE (Domínio) para criar o usuário
    // (A entidade valida as regras de negócio e faz o hash)
    const novoUsuario = await Usuario.create({
      nome: input.nome,
      email: input.email,
      senhaPlana: input.senha,
    });

    // 3. Pedir ao REPOSITÓRIO para salvar
    const usuarioSalvo = await this.usuarioRepository.save(novoUsuario);

    // 4. Gerar o Token JWT
    const token = gerarToken(usuarioSalvo.id!);

    // Retorna a entidade e o token
    return { usuario: usuarioSalvo, token };
  }

  /**
   * Lógica de Negócio para LOGIN (Read)
   */
  public async login(input: LoginInput) {
    const { email, senha } = input;

    // 1. Encontrar o usuário pelo e-mail (via Repositório)
    const usuario = await this.usuarioRepository.findByEmail(email);
    if (!usuario) {
      // Nota de segurança: não diga "usuário não encontrado"
      throw new Error('Credenciais inválidas');
    }

    // 2. Chamar o método da ENTIDADE (Domínio) para comparar a senha
    const senhaCorreta = await usuario.compararSenha(senha);
    if (!senhaCorreta) {
      throw new Error('Credenciais inválidas');
    }

    // 3. Gerar o Token JWT
    const token = gerarToken(usuario.id!);

    return { usuario, token };
  }
}