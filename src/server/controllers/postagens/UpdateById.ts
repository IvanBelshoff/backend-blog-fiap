import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

import { decoder, validation } from '../../shared/middlewares';
import { IBodyUpdatePostagens, IParamsIdGlobal } from '../../shared/interfaces';
import { DeleteArquivoFirebase, deleteArquivoLocal } from '../../shared/services';
import sharp from 'sharp';
import { PostagensProvider } from '../../models/postagens';

export const updataByIdValidation = validation((getSchema) => ({
    body: getSchema<IBodyUpdatePostagens>(yup.object().shape({
        titulo: yup.string().required().min(1).max(50),
        conteudo: yup.string().required().min(1),
        visivel: yup.boolean().optional()
    })),
}));

export const updateById = async (req: Request<IParamsIdGlobal, {}, IBodyUpdatePostagens>, res: Response) => {

    const fotoLocal = process.env.SALVAR_FOTO_LOCAL as unknown as Boolean;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const usuario = await decoder(req as Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>);

    if (!req.params.id) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            errors: {
                default: 'O parâmetro "id" precisa ser informado'
            }
        });
    }

    const validaCampos = await PostagensProvider.validaCamposPostagens(req.body.titulo, req.params.id);

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

    const result = await PostagensProvider.updateById(Number(req.params.id), {
        ...req.body,
        usuario_atualizador: `${usuario?.nome} ${usuario?.sobrenome}` || 'desconhecido'
    }, req.file && {
        local: req.file.path,
        nome: req.file.filename,
        originalname: req.file.originalname,
        tamanho: req.file.size,
        nuvem: String(fotoLocal) == 'true' ? true : false,
        tipo: req.file.mimetype,
        width: String(fotoLocal) == 'true' ? (await sharp(req.file.path).metadata()).width || undefined : (await sharp(req.file.buffer).metadata()).width || undefined,
        height: String(fotoLocal) == 'true' ? (await sharp(req.file.path).metadata()).height || undefined : (await sharp(req.file.buffer).metadata()).height || undefined,
    });

    if (result instanceof Error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            errors: {
                default: result.message
            }
        });
    }

    return res.status(StatusCodes.NO_CONTENT).send();

};
