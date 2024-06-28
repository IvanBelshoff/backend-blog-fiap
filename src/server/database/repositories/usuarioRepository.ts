import { AppDataSource } from '../data-source';
import { Usuario } from '../entities/Usuarios';

export const usuarioRepository = AppDataSource.getRepository(Usuario);