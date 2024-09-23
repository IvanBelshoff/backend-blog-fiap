import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';
import { validation } from '../../shared/middlewares';
import { IBodyPropsPasswordUsuarios, IParamsIdGlobal } from '../../shared/interfaces';
import { UsuariosProvider } from '../../models/usuarios';
import sharp from 'sharp';

export const updatePasswordByIdValidation = validation((getSchema) => ({
    body: getSchema<IBodyPropsPasswordUsuarios>(yup.object().shape({
        senha: yup.string().optional().min(6),
    }))
}));

export const updatePasswordById = async (req: Request<IParamsIdGlobal, {}, IBodyPropsPasswordUsuarios>, res: Response) => {
    
    const fotoLocal = process.env.SALVAR_FOTO_LOCAL as unknown as Boolean;

    if (!req.params.id) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            errors: {
                default: 'O parâmetro "id" precisa ser informado'
            }
        });
    }

    const result = await UsuariosProvider.updateById(Number(req.params.id), {
        senha: req.body.senha
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
