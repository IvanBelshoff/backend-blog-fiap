import mime from 'mime';

import { Foto } from '../../database/entities';
import { fotoRepository } from '../../database/repositories/fotoRepository';
import path from 'path';
import { DeleteArquivoFirebase, deleteArquivoLocal } from '../../shared/services';

export const updateById = async (id: number, tipo_foto: 'postagens' | 'usuarios', metodo: 'excluir' | 'atualizar', foto?: Omit<Foto, 'id' | 'data_atualizacao' | 'data_criacao' | 'usuario' | 'postagem' | 'url'>): Promise<void | Error> => {

    const fotoLocal = process.env.SALVAR_FOTO_LOCAL as unknown as Boolean;

    try {

        const localFotoProfile = String(fotoLocal) == 'true' ? path.resolve(__dirname, '..', '..', '..', 'shared', 'data', 'default\\profile.jpg') : 'https://storage.googleapis.com/blog-fiap.appspot.com/profile.jpg';
        const originalnameProfile = 'profile.jpg';

        if (metodo == 'atualizar' && foto) {

            const { local, nome, originalname, tamanho, tipo, width, height, nuvem } = foto;

            const fotoRecuperada = tipo_foto == 'usuarios' ? await fotoRepository.findOne({
                where: {
                    usuario: {
                        id: id
                    }
                }
            }) : await fotoRepository.findOne({
                where: {
                    postagem: {
                        id: id
                    }
                }
            });

            if (!fotoRecuperada) {
                return new Error('Foto não localizada');
            }

            const deleteFotoOriginal = String(fotoLocal) == 'true' ? await deleteArquivoLocal(fotoRecuperada.local, fotoRecuperada.nome) : await DeleteArquivoFirebase(fotoRecuperada.local, fotoRecuperada.nome);

            if (deleteFotoOriginal instanceof Error) {
                return new Error(deleteFotoOriginal.message);
            } else {

                console.log('foto foi devidamente excluida');
                fotoRecuperada.nome = nome,
                fotoRecuperada.originalname = originalname,
                fotoRecuperada.tamanho = tamanho,
                fotoRecuperada.local = local,
                fotoRecuperada.tipo = mime.extension(tipo) as string,
                fotoRecuperada.url = String(fotoLocal) == 'true' ? `http://${process.env.HOST}:${process.env.PORT}/uploads/fotos/usuarios/${nome}` : `https://firebasestorage.googleapis.com/v0/b/blog-fiap.appspot.com/o/${nome}?alt=media`,
                fotoRecuperada.width = width,
                fotoRecuperada.height = height,
                fotoRecuperada.nuvem = nuvem;

                const atualizaFoto = await fotoRepository.save(fotoRecuperada);

                if (atualizaFoto instanceof Error) {
                    return new Error(atualizaFoto.message);
                }

                return;
            }

        } else {

            const url = String(fotoLocal) == 'true' ? `http://${process.env.HOST}:${process.env.PORT}/profile/profile.jpg` : 'https://firebasestorage.googleapis.com/v0/b/blog-fiap.appspot.com/o/profile.jpg?alt=media';

            const fotoRecuperada = tipo_foto == 'usuarios' ? await fotoRepository.findOne({
                where: {
                    usuario: {
                        id: id
                    }
                }
            }) : await fotoRepository.findOne({
                where: {
                    postagem: {
                        id: id
                    }
                }
            });

            if (!fotoRecuperada) {
                return new Error('Foto não localizada');
            }

            const deleteFotoOriginal = String(fotoLocal) == 'true' ? await deleteArquivoLocal(fotoRecuperada.local, fotoRecuperada.nome) : await DeleteArquivoFirebase(fotoRecuperada.local, fotoRecuperada.nome);

            if (deleteFotoOriginal instanceof Error) {
                return new Error(deleteFotoOriginal.message);
            } else {

                console.log('foto foi devidamente excluida');
                fotoRecuperada.nome = 'profile.jpg',
                fotoRecuperada.originalname = originalnameProfile,
                fotoRecuperada.tamanho = 6758,
                fotoRecuperada.local = localFotoProfile,
                fotoRecuperada.tipo = 'jpg',
                fotoRecuperada.url = url,
                fotoRecuperada.width = 462,
                fotoRecuperada.height = 462,
                fotoRecuperada.nuvem = false;

                const atualizaFoto = await fotoRepository.save(fotoRecuperada);

                if (atualizaFoto instanceof Error) {
                    return new Error(atualizaFoto.message);
                }

                return;
            }

        }

    } catch (error) {
        console.log(error);
        return new Error('Erro ao atualizar o registro');
    }
};