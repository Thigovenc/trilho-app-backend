import bcrypt from 'bcryptjs';
export interface IUsuarioCreateProps {
  nome: string;
  email: string;
  senhaPlana: string;
}

export class Usuario {
  public readonly id?: string;
  public readonly nome: string;
  public readonly email: string;
  public readonly senhaHash: string;
  public readonly createdAt: Date;

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

  public static async create(props: IUsuarioCreateProps): Promise<Usuario> {
    this.validate(props);

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(props.senhaPlana, salt);

    return new Usuario({
      nome: props.nome,
      email: props.email,
      senhaHash: senhaHash,
    });
  }

  private static validate(props: IUsuarioCreateProps): void {
    this.validateNome(props.nome);
    this.validateEmail(props.email);
  }

  private static validateNome(nome: string): void {
    if (nome.toLowerCase() === 'admin') {
      throw new Error('Nome de usuário "admin" não é permitido.');
    }
  }

  private static validateEmail(email: string): void {
    if (email.endsWith('@dominio-proibido.com')) {
      throw new Error('Este domínio de e-mail não é permitido.');
    }
  }

  public async compararSenha(senhaPlana: string): Promise<boolean> {
    return bcrypt.compare(senhaPlana, this.senhaHash);
  }

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
