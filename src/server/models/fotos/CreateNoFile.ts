import { DeleteArquivoFirebase, deleteArquivoLocal } from '../../shared/services';
import { fotoRepository } from '../../database/repositories/fotoRepository';
import path from 'path';


export const createNoFile = async (): Promise<number | Error> => {

    const fotoLocal = process.env.SALVAR_FOTO_LOCAL as unknown as Boolean;

    const local = String(fotoLocal) == 'true' ? path.resolve(__dirname, '..', '..', '..', 'shared', 'data', 'default\\profile.jpg') : 'https://storage.googleapis.com/blog-fiap.appspot.com/profile.jpg';
    const filename = 'profile.jpg';
    const url = String(fotoLocal) == 'true' ? `http://${process.env.HOST}:${process.env.PORT}/profile/profile.jpg` : 'https://firebasestorage.googleapis.com/v0/b/blog-fiap.appspot.com/o/profile.jpg?alt=media';

    try {

        const newFoto = fotoRepository.create({
            local: local,
            nome: filename,
            originalname: filename,
            tamanho: 6758,
            nuvem: String(fotoLocal) == 'true' ? false : true,
            width: 462,
            height: 462,
            url: url,
            tipo: 'jpg'
        });

        const result = await fotoRepository.save(newFoto);

        if (typeof result === 'object') {
            return result.id;
        } else if (typeof result === 'number') {
            return result;
        }

        return new Error('Erro ao cadastrar ao salvar foto');

    } catch (error) {
        console.log(error);

        const deleteFotoLocal = String(fotoLocal) == 'true' ? await deleteArquivoLocal(local, filename) : await DeleteArquivoFirebase(local, filename);

        if (deleteFotoLocal instanceof Error) {
            console.log(deleteFotoLocal.message);
        }

        return new Error('Erro ao cadastrar ao salvar foto');
    }

};