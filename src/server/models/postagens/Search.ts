import { Postagem } from '../../database/entities';
import { postagemRepository } from '../../database/repositories';

export const search = async (searchTerm: string): Promise<Omit<Postagem, 'foto'>[] | Error> => {
    try {
        const result = postagemRepository.createQueryBuilder('postagem')
            .leftJoinAndSelect('postagem.foto', 'foto')
            .where('LOWER(postagem.titulo) LIKE LOWER(:searchTerm)', { searchTerm: `%${searchTerm}%` })
            .orWhere('LOWER(postagem.conteudo) LIKE LOWER(:searchTerm)', { searchTerm: `%${searchTerm}%` })
            .orderBy('postagem.titulo', 'DESC');

        const posts = await result.getMany();

        return posts;
    } catch (error) {
        console.log(error);
        return new Error('Error searching posts');
    }
};