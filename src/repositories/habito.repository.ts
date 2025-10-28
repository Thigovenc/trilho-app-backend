import HabitoModel, { IHabito as IHabitoModel } from '../models/habito.model';
import { Habito } from '../domain/entities/habito.entity';
import { IHabitoRepository } from '../domain/repositories/IHabito.repository';
import { EnumHabitColor, EnumHabitIcon } from '../domain/enums/habito.enums';

const toPersistence = (habito: Habito) => {
  return {
    _id: habito.id,
    usuarioId: habito.usuarioId,
    nome: habito.nome,
    cor: habito.cor,
    icone: habito.icone,
    maiorSequencia: habito.maiorSequencia,
    datasDeConclusao: habito.datasDeConclusao,
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
  });
};

export class MongooseHabitoRepository implements IHabitoRepository {
  async save(habito: Habito): Promise<Habito> {
    const dadosPersistencia = toPersistence(habito);

    const novoHabitoModel = new HabitoModel(dadosPersistencia);
    const habitoSalvo = await novoHabitoModel.save();

    return toDomain(habitoSalvo);
  }

  async findByUsuarioId(usuarioId: string): Promise<Habito[]> {
    const habitosModel = await HabitoModel.find({ usuarioId }).sort({
      createdAt: -1,
    });

    return habitosModel.map(toDomain);
  }
}
