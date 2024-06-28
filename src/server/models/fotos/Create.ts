import mime from 'mime';
import { fotoRepository } from '../../database/repositories/fotoRepository';
import { IFile } from '../../shared/interfaces';

export const create = async (foto: IFile): Promise<number | Error> => {

    const fotoLocal = process.env.SALVAR_FOTO_LOCAL as unknown as Boolean;

    const { filename, mimetype, originalname, path, size, tipo_foto, width, height, nuvem } = foto;

    try {

        const fotosCadastradas = await fotoRepository.findAndCount({
            where: {
                nome: filename
            }
        });

        if (fotosCadastradas[1] > 0) {
            return new Error('Foto já cadastrada');
        }

        const newFoto = fotoRepository.create({
            local: path,
            nome: filename,
            originalname: originalname,
            tamanho: size,
            width: width,
            nuvem: nuvem,
            height: height,
            url: String(fotoLocal) == 'true' ? `http://${process.env.HOST}:${process.env.PORT}/uploads/${tipo_foto == 'usuarios' ? 'fotos' : 'capas'}/${tipo_foto}/${filename}` : `https://firebasestorage.googleapis.com/v0/b/blog-fiap.appspot.com/o/${filename}?alt=media`,
            tipo: mime.extension(String(mimetype))
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
        return new Error('Erro ao cadastrar ao salvar foto');
    }
};