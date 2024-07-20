import { fotoRepository } from '../../database/repositories';

export const deleteById = async (id: number): Promise<void | Error> => {

    try {
        const foto = await fotoRepository.findOne({
            where: {
                id: id
            }
        });

        if (!foto) {
            return new Error('foto não localizada');
        }

        const deleteFoto = await fotoRepository.delete({ id: foto.id });

        if (deleteFoto instanceof Error) {
            return new Error(deleteFoto.message);
        }

        return;

    } catch (error) {
        console.log(error);
        return new Error('Erro ao apagar o registro');
    }
};