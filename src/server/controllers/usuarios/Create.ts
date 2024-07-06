import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';
import sharp from 'sharp';
import { UsuariosProvider } from '../../models/usuarios';
import { IBodyCreateUsuarios } from '../../shared/interfaces';
import { decoder, validation } from '../../shared/middlewares';
import { DeleteArquivoFirebase, deleteArquivoLocal } from '../../shared/services';
import { FotosProvider } from '../../models/fotos';

export const createValidation = validation((getSchema) => ({
    body: getSchema<IBodyCreateUsuarios>(yup.object().shape({
        nome: yup.string().required().min(3),
        sobrenome: yup.string().required().min(3),
        senha: yup.string().required().min(6),
        email: yup.string().required().email().min(5),
        bloqueado: yup.boolean().required(),
        id_copy_regras: yup.number().optional().min(1),
    })),
}));

export const create = async (req: Request<{}, {}, IBodyCreateUsuarios>, res: Response) => {
    const fotoLocal = Boolean(process.env.SALVAR_FOTO_LOCAL);
    const usuario = await decoder(req);
    const { email } = req.body;

    try {
        const validaEmail = await UsuariosProvider.validaEmailUsuario(email);

        if (validaEmail) {
            if (req.file) {
                await handleFailedUserCreation(req.file.path, req.file.filename, fotoLocal);
            }
            return res.status(StatusCodes.BAD_REQUEST).json({ errors: validaEmail });
        }

        if (req.file) {
            const imageBuffer = fotoLocal ? req.file.path : req.file.buffer;
            const metadata = await sharp(imageBuffer)?.metadata();
            let resultFoto;
            try {
                resultFoto = await FotosProvider.create({
                    filename: req.file.filename,
                    mimetype: req.file.mimetype,
                    originalname: req.file.originalname,
                    path: req.file.path,
                    size: req.file.size,
                    width: metadata?.width,
                    height: metadata?.height,
                    nuvem: fotoLocal ? false : true,
                    tipo_foto: 'usuarios'
                });
            } catch (error: any) {
                await handleFailedPhotoCreation(req.file.path, req.file.filename, fotoLocal);
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: { default: ( error instanceof Error ? error.message : '') } });
            }

            try {
                const resultUsuario = await UsuariosProvider.create({
                    ...req.body,
                    usuario_cadastrador: `${usuario?.nome} ${usuario?.sobrenome}` || 'desconhecido',
                    usuario_atualizador: `${usuario?.nome} ${usuario?.sobrenome}` || 'desconhecido',
                    id_foto: typeof resultFoto === 'number' ? resultFoto : 0,
                    // file: !!req.file,
                    id_copy_regras: req.body.id_copy_regras
                });
                return res.status(StatusCodes.CREATED).json(resultUsuario);
            } catch (error: any) {
                await handleFailedUserCreation(req.file.path, req.file.filename, fotoLocal);
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: { default: ( error instanceof Error ? error.message : '') } });
            }
        } else {
            const resultFoto = await FotosProvider.createNoFile();

            if (resultFoto instanceof Error) {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: { default: resultFoto.message } });
            }

            const resultUsuario = await UsuariosProvider.create({
                ...req.body,
                usuario_cadastrador: `${usuario?.nome} ${usuario?.sobrenome}` || 'desconhecido',
                usuario_atualizador: `${usuario?.nome} ${usuario?.sobrenome}` || 'desconhecido',
                id_foto: resultFoto,
                id_copy_regras: req.body.id_copy_regras
            });

            if ((resultUsuario instanceof Error)) {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: { default: resultUsuario.message } });
            }

            return res.status(StatusCodes.CREATED).json(resultUsuario);
        }
    } catch (error) {
        console.error('Error in create function:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: { default: 'Erro interno no servidor' } });
    }
};

async function handleFailedUserCreation(filePath: string | undefined, fileName: string | undefined, fotoLocal: boolean): Promise<void> {
    if (filePath && fileName) {
        await handleFailedPhotoCreation(filePath, fileName, fotoLocal);
    }
    // Additional cleanup or actions if needed
}

async function handleFailedPhotoCreation(filePath: string, fileName: string, fotoLocal: boolean): Promise<void> {
    if (filePath && fileName) {
        if (fotoLocal) {
            await deleteArquivoLocal(filePath, fileName);
        } else {
            await DeleteArquivoFirebase(filePath, fileName);
        }
        await FotosProvider.deleteByFilename(fileName);
    }
}
