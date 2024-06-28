import { postagemRepository } from '../../database/repositories';

export const count = async (filter?: string): Promise<number | Error> => {
    try {

        const result = postagemRepository.createQueryBuilder('postagem')
            .select('postagem');

        if (typeof filter === 'string') {
            result.andWhere('LOWER(postagem.titulo) LIKE LOWER(:titulo)', { titulo: `%${filter}%` });
        }

        const count = await result.getCount();

        return count;

    } catch (error) {
        console.log(error);
        return new Error('Erro ao consultar a quantidade total de registros');
    }
};