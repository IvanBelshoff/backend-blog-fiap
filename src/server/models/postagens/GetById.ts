import { Postagem } from '../../database/entities';
import { postagemRepository } from '../../database/repositories';

export const getById = async (id: number): Promise<Postagem | Error> => {

    try {
        const result = await postagemRepository.findOne({
            relations: {
                foto: true
            },
            where: {
                id: id
            }
        });

        if (!result) {
            return new Error('Postagem não encontrada');
        }

        return result;

    } catch (error) {
        console.log(error);
        return new Error('Registro não encontrado');
    }
};