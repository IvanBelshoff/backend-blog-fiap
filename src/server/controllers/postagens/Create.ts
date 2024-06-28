import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';
import sharp from 'sharp';

import { decoder, validation } from '../../shared/middlewares';
import { FotosProvider } from '../../models/fotos';
import { IBodyCreatePostagens } from '../../shared/interfaces';
import { DeleteArquivoFirebase, deleteArquivoLocal } from '../../shared/services';
import { PostagensProvider } from '../../models/postagens';

export const createValidation = validation((getSchema) => ({
    body: getSchema<IBodyCreatePostagens>(yup.object().shape({
        titulo: yup.string().required().min(1).max(50),
        conteudo: yup.string().required().min(1),
        visivel: yup.boolean().optional(),
    }))
}));

export const create = async (req: Request<{}, {}, IBodyCreatePostagens>, res: Response) => {

    const usuario = await decoder(req);

    const fotoLocal = process.env.SALVAR_FOTO_LOCAL as unknown as Boolean;

    const validaCampos = await PostagensProvider.validaCamposPostagens(req.body.titulo);

    if (validaCampos instanceof Error) {

        if (req.file) {

            const deleteFoto = String(fotoLocal) == 'true' ? await deleteArquivoLocal(req.file.path, req.file.filename) : await DeleteArquivoFirebase(req.file.path, req.file.filename);

            if (deleteFoto instanceof Error) {
                console.log(deleteFoto.message);
            }
        }

        return res.status(StatusCodes.BAD_REQUEST).json({
            errors: JSON.parse(validaCampos.message)
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
            tipo_foto: 'postagens'
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

        const resultPostagem = await PostagensProvider.create({
            id_foto: resultFoto,
            titulo: req.body.titulo,
            conteudo: req.body.conteudo,
            visivel: req.body.visivel,
            usuario_cadastrador: `${usuario?.nome} ${usuario?.sobrenome}` || 'desconhecido',
            usuario_atualizador: `${usuario?.nome} ${usuario?.sobrenome}` || 'desconhecido',
            file: !!req.file
        });

        if (resultPostagem instanceof Error) {

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
                        default: resultPostagem.message
                    }
                });
            }

            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                errors: {
                    default: resultPostagem.message
                }
            });
        }

        return res.status(StatusCodes.CREATED).json(resultPostagem);

    } else {

        const resultFoto = await FotosProvider.createNoFile();

        if (resultFoto instanceof Error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                errors: {
                    default: resultFoto.message
                }
            });
        }

        const resultPostagem = await PostagensProvider.create({
            id_foto: resultFoto,
            titulo: req.body.titulo,
            conteudo: req.body.conteudo,
            visivel: req.body.visivel,
            usuario_cadastrador: `${usuario?.nome} ${usuario?.sobrenome}` || 'desconhecido',
            usuario_atualizador: `${usuario?.nome} ${usuario?.sobrenome}` || 'desconhecido',
            file: !!req.file
        });

        if (resultPostagem instanceof Error) {

            const deleteFoto = await FotosProvider.deleteById(resultFoto);

            if (deleteFoto instanceof Error) {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    errors: {
                        default: resultPostagem.message
                    }
                });
            }

            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                errors: {
                    default: resultPostagem.message
                }
            });
        }

        return res.status(StatusCodes.CREATED).json(resultPostagem);

    }

};
