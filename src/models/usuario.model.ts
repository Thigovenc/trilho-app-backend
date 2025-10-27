import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface para tipagem do Documento (TypeScript)
export interface IUsuario extends Document {
  nome: string;
  email: string;
  senha: string;
  // Método para comparar senhas
  compararSenha(senhaCandidata: string): Promise<boolean>;
}

// Schema Mongoose [cite: 77]
const UsuarioSchema: Schema = new Schema({
  nome: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // [cite: 77]
    lowercase: true,
    trim: true,
  },
  senha: {
    type: String,
    required: true,
    select: false, // Para não retornar a senha em queries por padrão
  },
}, {
  timestamps: true, // Adiciona createdAt e updatedAt
});

// Middleware (pre-save hook) para criptografar a senha 
UsuarioSchema.pre<IUsuario>('save', async function (next) {
  // 'this' é o documento do usuário que está sendo salvo
  if (!this.isModified('senha')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Método para comparar a senha fornecida no login com o hash salvo
UsuarioSchema.methods.compararSenha = async function (senhaCandidata: string): Promise<boolean> {
  return bcrypt.compare(senhaCandidata, this.senha);
};

// Exportar o modelo
const Usuario = mongoose.model<IUsuario>('Usuario', UsuarioSchema);
export default Usuario;