import mongoose, { Schema, Document } from 'mongoose';

export interface IUsuario extends Document<mongoose.Types.ObjectId> {
  nome: string;
  email: string;
  senha: string;
  createdAt: Date;
  updatedAt: Date;

  compararSenha(senhaCandidata: string): Promise<boolean>;
}

const UsuarioSchema: Schema = new Schema(
  {
    nome: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    senha: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Usuario = mongoose.model<IUsuario>('Usuario', UsuarioSchema);
export default Usuario;
