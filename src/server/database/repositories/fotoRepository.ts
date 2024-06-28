import { AppDataSource } from '../data-source';
import { Foto } from '../entities/Fotos';

export const fotoRepository = AppDataSource.getRepository(Foto);