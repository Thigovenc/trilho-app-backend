import mongoose, { Schema, Document } from 'mongoose';
import { EnumHabitColor, EnumHabitIcon } from '../domain/enums/habito.enums';
export interface IHabito extends Document<mongoose.Types.ObjectId> {
  usuarioId: mongoose.Types.ObjectId;
  nome: string;
  cor: EnumHabitColor;
  icone: EnumHabitIcon;
  maiorSequencia: number;
  datasDeConclusao: Date[];
  createdAt: Date;
  updatedAt: Date;
}

const HabitoSchema: Schema = new Schema(
  {
    usuarioId: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
      index: true,
    },
    nome: {
      type: String,
      required: [true, 'O nome do hábito é obrigatório'],
      trim: true,
    },
    cor: {
      // Modificado:
      type: String,
      enum: Object.values(EnumHabitColor),
      default: EnumHabitColor.BLUE, // Default baseado na sua imagem
    },
    icone: {
      // Adicionado:
      type: String,
      enum: Object.values(EnumHabitIcon),
      default: EnumHabitIcon.SAVE, // Default baseado na sua imagem
    },
    maiorSequencia: {
      type: Number,
      default: 0,
      min: 0,
    },
    datasDeConclusao: {
      type: [Date],
      default: [],
    },
  },
  {
    timestamps: true, // Garante createdAt e updatedAt
  },
);

const Habito = mongoose.model<IHabito>('Habito', HabitoSchema);
export default Habito;
