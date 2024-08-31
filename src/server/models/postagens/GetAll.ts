import { Postagem } from '../../database/entities';
import { postagemRepository } from '../../database/repositories';

export const getAll = async (
    page?: number,
    limit?: number,
    filter?: string,
    visivel?: boolean): Promise<Omit<Postagem, 'foto'>[] | Error> => {
    try {

        const result = postagemRepository.createQueryBuilder('postagem')
            .leftJoinAndSelect('postagem.foto', 'foto')
            .orderBy('postagem.titulo', 'DESC');

        if (page && typeof page == 'string' && limit && typeof limit == 'string') {
            result.take(page * limit);
        }

        if (typeof filter === 'string') {
            result.andWhere('LOWER(postagem.titulo) LIKE LOWER(:titulo)', { titulo: `%${filter}%` });
        }

        if (visivel) {
            result.andWhere('postagem.visivel IS :visivel', { visivel: visivel });
        }

        const usuarios = await result.getMany();

        return usuarios;

    } catch (error) {
        console.log(error);
        return new Error('Erro ao consultar os registros');
    }
};