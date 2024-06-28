import { AppDataSource } from '../data-source';
import { Postagem } from '../entities';

export const postagemRepository = AppDataSource.getRepository(Postagem);