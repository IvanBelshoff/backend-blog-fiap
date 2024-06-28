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

    const fotoLocal = process.env.SALVAR_FOTO_LOCAL as unknown as Boolean;

    const usuario = await decoder(req);

    const validaEmail = await UsuariosProvider.validaEmailUsuario(req.body.email);

    if (validaEmail instanceof Error) {

        if (req.file) {

            const deleteFoto = String(fotoLocal) == 'true' ? await deleteArquivoLocal(req.file.path, req.file.filename) : await DeleteArquivoFirebase(req.file.path, req.file.filename);

            if (deleteFoto instanceof Error) {
                console.log(deleteFoto.message);
            }
        }

        return res.status(StatusCodes.BAD_REQUEST).json({
            errors: JSON.parse(validaEmail.message)
        });
    }

    if (req.file) {

        const imageBuffer = String(fotoLocal) == 'true' ? req.file.path : req.file.buffer;
        const metadata = await sharp(imageBuffer).metadata();

        const resultFoto = await FotosProvider.create({
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            originalname: req.file.originalname,
            path: req.file.path,
            size: req.file.size,
            width: metadata.width,
            height: metadata.height,
            nuvem: String(fotoLocal) == 'true' ? false : true,
            tipo_foto: 'usuarios'
        });

        if (resultFoto instanceof Error) {

            const deleteFotolocal = String(fotoLocal) == 'true' ? await deleteArquivoLocal(req.file.path, req.file.filename) : await DeleteArquivoFirebase(req.file.path, req.file.filename);

            if (deleteFotolocal instanceof Error) {
                console.log(deleteFotolocal.message);
            }

            const deleteFoto = await FotosProvider.deleteByFilename(req.file.filename);

            if (deleteFoto instanceof Error) {
                console.log(deleteFoto.message);
            }

            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                errors: {
                    default: resultFoto.message
                }
            });
        }

        const resultUsuario = await UsuariosProvider.create({
            ...req.body,
            usuario_cadastrador: `${usuario?.nome} ${usuario?.sobrenome}` || 'desconhecido',
            usuario_atualizador: `${usuario?.nome} ${usuario?.sobrenome}` || 'desconhecido',
            id_foto: resultFoto,
            file: !!req.file,
            id_copy_regras: req.body.id_copy_regras
        });

        if (resultUsuario instanceof Error) {

            const deleteFotoLocal = String(fotoLocal) == 'true' ? await deleteArquivoLocal(req.file.path, req.file.filename) : await DeleteArquivoFirebase(req.file.path, req.file.filename);

            if (deleteFotoLocal instanceof Error) {
                console.log(deleteFotoLocal.message);
            }

            const deleteFoto = await FotosProvider.deleteByFilename(req.file.filename);

            if (deleteFoto instanceof Error) {
                console.log(deleteFoto.message);
            }

            if (deleteFoto instanceof Error) {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    errors: {
                        default: resultUsuario.message
                    }
                });
            }

            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                errors: {
                    default: resultUsuario.message
                }
            });
        }

        return res.status(StatusCodes.CREATED).json(resultUsuario);

    } else {

        const resultFoto = await FotosProvider.createNoFile();

        if (resultFoto instanceof Error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                errors: {
                    default: resultFoto.message
                }
            });
        }

        const resultUsuario = await UsuariosProvider.create({
            ...req.body,
            usuario_cadastrador: `${usuario?.nome} ${usuario?.sobrenome}` || 'desconhecido',
            usuario_atualizador: `${usuario?.nome} ${usuario?.sobrenome}` || 'desconhecido',
            id_foto: resultFoto,
            file: !!req.file,
            id_copy_regras: req.body.id_copy_regras
        });

        if (resultUsuario instanceof Error) {

            const deleteFoto = await FotosProvider.deleteById(resultFoto);

            if (deleteFoto instanceof Error) {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    errors: {
                        default: resultUsuario.message
                    }
                });
            }

            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                errors: {
                    default: resultUsuario.message
                }
            });
        }

        return res.status(StatusCodes.CREATED).json(resultUsuario);

    }

};

