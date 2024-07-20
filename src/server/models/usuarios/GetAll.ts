import { Usuario } from '../../database/entities';
import { usuarioRepository } from '../../database/repositories';

export const getAll = async (
    page: number = 1,
    limit: number = 10,
    filter: string = ''
): Promise<{ usuarios: Omit<Usuario, 'senha' | 'foto'>[], totalCount: number } | Error> => {
    try {
        const result = usuarioRepository.createQueryBuilder('usuario')
            .orderBy('usuario.nome', 'ASC'); // Ordenando por nome ascendente por padrão

        // Aplicar paginação
        result.skip((page - 1) * limit).take(limit);

        // Aplicar filtro por nome, sobrenome ou email
        if (filter.trim() !== '') {
            result.andWhere('(LOWER(usuario.nome) LIKE LOWER(:filtro) OR LOWER(usuario.sobrenome) LIKE LOWER(:filtro) OR LOWER(usuario.email) LIKE LOWER(:filtro))', { filtro: `%${filter}%` });
        }

        // Obter usuários e total de registros
        const [usuarios, totalCount] = await result.getManyAndCount();

        // Mapear usuários para remover campos sensíveis
        const newUsers: Omit<Usuario, 'senha' | 'foto'>[] = usuarios.map(user => ({
            id: user.id,
            nome: user.nome,
            bloqueado: user.bloqueado,
            sobrenome: user.sobrenome,
            email: user.email,
            data_criacao: user.data_criacao,
            data_atualizacao: user.data_atualizacao,
            regra: user.regra,
            permissao: user.permissao,
            ultimo_login: user.ultimo_login,
            usuario_atualizador: user.usuario_atualizador,
            usuario_cadastrador: user.usuario_cadastrador
        }));

        return { usuarios: newUsers, totalCount };

    } catch (error) {
        console.error('Erro ao consultar os registros:', error);
        return new Error('Erro ao consultar os registros');
    }
};
