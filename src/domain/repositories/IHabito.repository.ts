import { Habito } from '../entities/habito.entity';

export interface IHabitoRepository {
  save(habito: Habito): Promise<Habito>;
  findHabitsByUsuarioId(usuarioId: string): Promise<Habito[]>;
  findById(id: string): Promise<Habito | null>;
  update(habito: Habito): Promise<Habito>;
  countByUsuarioId(usuarioId: string): Promise<number>;
  updateOrdem(
    habitoId: string,
    usuarioId: string,
    novaOrdem: number,
  ): Promise<void>;
}
