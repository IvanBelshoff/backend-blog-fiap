import { postagemRepository } from '../../database/repositories';

export const count = async (
    filter?: string,
    visivel?: boolean
): Promise<number | Error> => {
    try {

        const result = postagemRepository.createQueryBuilder('postagem')
            .select('postagem');

        if (filter && typeof filter === 'string') {
            result.andWhere('LOWER(postagem.titulo) LIKE LOWER(:titulo)', { titulo: `%${filter}%` });
        }

        if (visivel && typeof visivel === 'boolean') {
            result.where('postagem.visivel = :visivel', { visivel: visivel });
        }

        const count = await result.getCount();

        return count;

    } catch (error) {
        console.log(error);
        return new Error('Erro ao consultar a quantidade total de registros');
    }
};