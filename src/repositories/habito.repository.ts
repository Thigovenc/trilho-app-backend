import HabitoModel, { IHabito as IHabitoModel } from '../models/habito.model';
import { Habito } from '../domain/entities/habito.entity';
import { IHabitoRepository } from '../domain/repositories/IHabito.repository';
import { EnumHabitColor, EnumHabitIcon } from '../domain/enums/habito.enums';
import mongoose from 'mongoose';

const toPersistence = (habito: Habito) => {
  return {
    _id: new mongoose.Types.ObjectId(habito.id),
    usuarioId: new mongoose.Types.ObjectId(habito.usuarioId),
    nome: habito.nome,
    cor: habito.cor,
    icone: habito.icone,
    maiorSequencia: habito.maiorSequencia,
    datasDeConclusao: habito.datasDeConclusao,
    isDeleted: habito.isDeleted,
  };
};

const toDomain = (model: IHabitoModel): Habito => {
  return Habito.fromPersistence({
    id: model._id.toString(),
    usuarioId: model.usuarioId.toString(),
    nome: model.nome,
    cor: model.cor as EnumHabitColor,
    icone: model.icone as EnumHabitIcon,
    maiorSequencia: model.maiorSequencia,
    datasDeConclusao: model.datasDeConclusao,
    isDeleted: model.isDeleted,
  });
};

export class MongooseHabitoRepository implements IHabitoRepository {
  async save(habito: Habito): Promise<Habito> {
    const dadosPersistencia = toPersistence(habito);

    const novoHabitoModel = new HabitoModel(dadosPersistencia);
    const habitoSalvo = await novoHabitoModel.save();

    return toDomain(habitoSalvo);
  }

  async findHabitsByUsuarioId(usuarioId: string): Promise<Habito[]> {
    const habitosModel = await HabitoModel.find({
      usuarioId,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    return habitosModel.map(toDomain);
  }

  async findById(id: string): Promise<Habito | null> {
    const habitoModel = await HabitoModel.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!habitoModel) return null;
    return toDomain(habitoModel);
  }

  async update(habito: Habito): Promise<Habito> {
    const dadosPersistencia = toPersistence(habito);

    const habitoModel = await HabitoModel.findByIdAndUpdate(
      habito.id,
      dadosPersistencia,
      { new: true },
    );

    if (!habitoModel) {
      throw new Error('Erro crítico: Hábito não encontrado para atualização.');
    }

    return toDomain(habitoModel);
  }

  async delete(habitoId: string): Promise<boolean> {
    const resultado = await HabitoModel.findByIdAndUpdate(
      habitoId,
      { isDeleted: true },
      { new: true },
    );

    return !!resultado;
  }
}
