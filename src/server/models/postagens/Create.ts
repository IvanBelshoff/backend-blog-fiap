import path from 'path';

import { fotoRepository } from '../../database/repositories/fotoRepository';
import { postagemRepository } from '../../database/repositories';
import { IBodyCreatePostagens } from '../../shared/interfaces';
import { DeleteArquivoFirebase, deleteArquivoLocal } from '../../shared/services';

interface IFoto extends IBodyCreatePostagens {
    id_foto: number
    file: boolean
}

export const create = async (postagem: IFoto): Promise<number | Error> => {

    const fotoLocal = process.env.SALVAR_FOTO_LOCAL as unknown as Boolean;

    const local = path.resolve(__dirname, '..', '..', '..', 'shared', 'img', 'default\\profile.jpg');
    const filename = 'profile.jpg';

    try {

        const { id_foto } = postagem;

        const fotoCadastrada = await fotoRepository.findOne({
            where: {
                id: id_foto
            }
        });

        if (!fotoCadastrada) {
            const erro = {
                default: 'Nenhuma foto cadastrada com este ID',
            };

            return new Error(JSON.stringify(erro));
        }

        const newUsuario = postagemRepository.create({
            ...postagem,
            foto: fotoCadastrada
        });

        const result = await postagemRepository.save(newUsuario);

        if (typeof result === 'object') {
            return result.id;
        } else if (typeof result === 'number') {
            return result;
        }

        return new Error('Erro ao cadastrar o registro');

    } catch (error) {

        console.log(error);

        if (postagem.file == false) {

            const deleteFotoLocal = String(fotoLocal) == 'true' ? await deleteArquivoLocal(local, filename) : await DeleteArquivoFirebase(local, filename);

            if (deleteFotoLocal instanceof Error) {
                console.log(deleteFotoLocal.message);
            }

        }

        return new Error('Erro ao cadastrar o registro');
    }
};