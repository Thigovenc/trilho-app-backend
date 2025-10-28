import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface para tipagem do Documento (TypeScript)
export interface IUsuario extends Document<mongoose.Types.ObjectId> {
  nome: string;
  email: string;
  senha: string;
  createdAt: Date;
  updatedAt: Date;
  // Método para comparar senhas
  compararSenha(senhaCandidata: string): Promise<boolean>;
}

// Schema Mongoose [cite: 77]
const UsuarioSchema: Schema = new Schema(
  {
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
  },
  {
    timestamps: true, // Adiciona createdAt e updatedAt
  },
);

// Exportar o modelo
const Usuario = mongoose.model<IUsuario>('Usuario', UsuarioSchema);
export default Usuario;
