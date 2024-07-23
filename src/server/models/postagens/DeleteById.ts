
import { DeleteArquivoFirebase, deleteArquivoLocal } from '../../shared/services';
import { postagemRepository } from '../../database/repositories';
import { FotosProvider } from '../fotos';

export const deleteById = async (id: number): Promise<void | Error> => {

    const fotoLocal = process.env.SALVAR_FOTO_LOCAL as unknown as Boolean;

    try {

        const postagem = await postagemRepository.findOne({
            relations: {
                foto: true,
            },
            where: {
                id: id
            }
        });

        if (!postagem) {
            return new Error('Postagem não localizada');
        }

        if (postagem.foto) {

            const resultDeleteFoto = String(fotoLocal) == 'true' ? await deleteArquivoLocal(postagem.foto.local, postagem.foto.nome) : await DeleteArquivoFirebase(postagem.foto.local, postagem.foto.nome);

            if (resultDeleteFoto instanceof Error) {
                return new Error(resultDeleteFoto.message);
            }

            const foto = await FotosProvider.deleteById(postagem.foto.id);

            if (foto instanceof Error) {
                return new Error(foto.message);
            }

            console.log('foto excluida com sucesso');
        }

        const deleteUsuario = await postagemRepository.delete({ id: id });

        if (deleteUsuario instanceof Error) {
            return new Error(deleteUsuario.message);
        }

        return;

    } catch (error) {
        console.log(error);
        return new Error('Erro ao apagar o registro');
    }
};