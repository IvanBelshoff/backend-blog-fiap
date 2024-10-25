import { Usuario } from '../../database/entities';
import { usuarioRepository } from '../../database/repositories';


export const getAllMobile = async (
    page?: number,
    limit?: number,
    filter?: string): Promise<Omit<Usuario, 'senha'>[] | Error> => {
    try {

        const result = usuarioRepository.createQueryBuilder('usuario')
            .leftJoinAndSelect('usuario.foto', 'foto')
            .orderBy('usuario.nome', 'DESC');

        if (page && typeof page == 'string' && limit && typeof limit == 'string') {
            result.take(page * limit);
        }

        if (typeof filter === 'string') {
            result.andWhere('(LOWER(usuario.nome) LIKE LOWER(:filter) OR LOWER(usuario.sobrenome) LIKE LOWER(:filter) OR LOWER(usuario.email) LIKE LOWER(:filter))', { filter: `%${filter}%` });
        }

        const usuarios = await result.getMany();


        const newUsers: Omit<Usuario, 'senha'>[] = usuarios.map(user => ({
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
            usuario_cadastrador: user.usuario_cadastrador,
            foto: user.foto
        }));

        return newUsers;

    } catch (error) {
        console.log(error);
        return new Error('Erro ao consultar os registros');
    }
};