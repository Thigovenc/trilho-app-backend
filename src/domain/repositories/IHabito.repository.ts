import { Habito } from '../entities/habito.entity';

export interface IHabitoRepository {
  save(habito: Habito): Promise<Habito>;
  findByUsuarioId(usuarioId: string): Promise<Habito[]>;
}
