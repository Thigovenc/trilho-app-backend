import bcrypt from 'bcryptjs';

// Interface de "props" (Define o que é necessário para CRIAR um usuário)
export interface IUsuarioCreateProps {
  nome: string;
  email: string;
  senhaPlana: string;
}

// A Entidade de Domínio "Rica"
export class Usuario {
  // Propriedades são 'readonly' para garantir a imutabilidade
  public readonly id?: string;
  public readonly nome: string;
  public readonly email: string;
  public readonly senhaHash: string;
  public readonly createdAt: Date;

  // O construtor é PRIVADO
  // Garante que um Usuário só pode ser criado pelo método 'create'
  private constructor(props: {
    id?: string;
    nome: string;
    email: string;
    senhaHash: string;
    createdAt?: Date;
  }) {
    this.id = props.id;
    this.nome = props.nome;
    this.email = props.email;
    this.senhaHash = props.senhaHash;
    this.createdAt = props.createdAt || new Date();
  }

  // O "Construtor Público" (Static Factory Method)
  // É async para lidar com o hashing da senha
  public static async create(props: IUsuarioCreateProps): Promise<Usuario> {
    
    // 1. Chama o método de validação centralizado
    this.validate(props);

    // 2. Derivação de Estado (Hashing da Senha)
    // Regra de negócio executada na criação
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(props.senhaPlana, salt);

    // 3. Cria a instância com o construtor privado
    return new Usuario({
      nome: props.nome,
      email: props.email,
      senhaHash: senhaHash,
    });
  }

  // --- Função de Validação Centralizada (Orquestradora) ---

  /**
   * Orquestra todas as validações de regras de negócio
   * para a criação de um novo usuário.
   */
  private static validate(props: IUsuarioCreateProps): void {
    this.validateNome(props.nome);
    this.validateEmail(props.email);
    // A validação de senha foi removida por sua decisão,
    // confiando na camada de validação do Zod (Fase 3).
  }

  // --- Funções de Validação Específicas ---

  private static validateNome(nome: string): void {
    // (Nota: Zod já checou o 'required' e 'min:3')
    // Aqui poderiam entrar regras de negócio, ex:
    if (nome.toLowerCase() === 'admin') {
       throw new Error('Nome de usuário "admin" não é permitido.');
    }
  }

  private static validateEmail(email: string): void {
    // (Nota: Zod já checou o 'required' e o formato)
    // Aqui poderiam entrar regras de negócio, ex:
    if (email.endsWith('@dominio-proibido.com')) {
       throw new Error('Este domínio de e-mail não é permitido.');
    }
  }

  // --- Métodos de Comportamento ---

  /**
   * Compara uma senha plana com o hash armazenado
   * Esta é uma regra de negócio central do login.
   */
  public async compararSenha(senhaPlana: string): Promise<boolean> {
    return bcrypt.compare(senhaPlana, this.senhaHash);
  }

  /**
   * Método "Factory" para re-hidratar a entidade do banco
   * Ele confia nos dados, pois já foram validados
   */
  public static fromPersistence(props: {
    id: string;
    nome: string;
    email: string;
    senhaHash: string;
    createdAt: Date;
  }): Usuario {
    return new Usuario({
      ...props,
    });
  }
}