import { Habito } from '../entities/habito.entity';

export interface IHabitoRepository {
  save(habito: Habito): Promise<Habito>;
  findHabitsByUsuarioId(usuarioId: string): Promise<Habito[]>;
  findById(id: string): Promise<Habito | null>;
  update(habito: Habito): Promise<Habito>;
}
