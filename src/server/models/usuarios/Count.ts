import { usuarioRepository } from '../../database/repositories';

export const count = async (filter?: string): Promise<number | Error> => {
    try {
        const result = usuarioRepository.createQueryBuilder('usuario')
            .select('COUNT(usuario.id)');

        if (typeof filter === 'string') {
            result.andWhere('(LOWER(usuario.nome) LIKE LOWER(:filter) OR LOWER(usuario.sobrenome) LIKE LOWER(:filter) OR LOWER(usuario.email) LIKE LOWER(:filter))', { filter: `%${filter}%` });
        }

        const totalCount = await result.getRawOne();

        if (!totalCount) {
            return 0;
        }

        return parseInt(totalCount.count, 10);

    } catch (error) {
        console.error('Erro ao consultar a quantidade total de registros:', error);
        return new Error('Erro ao consultar a quantidade total de registros');
    }
};
