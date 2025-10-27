import mongoose, { Schema, Document } from 'mongoose';

// Interface para tipagem do Documento (TypeScript)
export interface IHabito extends Document {
  usuarioId: mongoose.Types.ObjectId; // Chave estrangeira [cite: 79]
  nome: string; // [cite: 79]
  cor: string; // [cite: 80]
  maiorSequencia: number; // [cite: 80]
  datasDeConclusao: Date[]; // [cite: 80]
}

// Schema Mongoose [cite: 79, 80]
const HabitoSchema: Schema = new Schema({
  usuarioId: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario', // Referência ao modelo Usuario [cite: 79]
    required: true,
    index: true, // Otimiza consultas por usuário
  },
  nome: {
    type: String,
    required: true,
    trim: true,
  },
  cor: {
    type: String,
    default: '#FFFFFF', // Uma cor padrão
  },
  maiorSequencia: {
    type: Number,
    default: 0, // [cite: 80]
  },
  datasDeConclusao: {
    type: [Date], // Array de Datas [cite: 80]
    default: [],
  },
}, {
  timestamps: true,
});

// Exportar o modelo
const Habito = mongoose.model<IHabito>('Habito', HabitoSchema);
export default Habito;