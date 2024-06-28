import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';

import { validation } from '../../shared/middlewares';
import { IParamsIdGlobal } from '../../shared/interfaces';
import * as fs from 'fs';
import { promisify } from 'util';
import { usuarioRepository } from '../../database/repositories';

export const getFotoUsuarioByIdValidation = validation((getSchema) => ({
    params: getSchema<IParamsIdGlobal>(yup.object().shape({
        id: yup.number().integer().required().moreThan(0),
    }))
}));

export const getFotoUsuarioById = async (req: Request<IParamsIdGlobal>, res: Response) => {

    if (!req.params.id) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            errors: {
                default: 'O parâmetro "id" precisa ser informado'
            }
        });
    }

    const funcionario = await usuarioRepository.findOne({
        relations: {
            foto: true
        },
        where: {
            id: req.params.id
        }
    });

    if (!funcionario || !funcionario.foto || !funcionario.foto.local) {
        return res.status(StatusCodes.NOT_FOUND).json({
            errors: {
                default: 'Foto não encontrada'
            }
        });
    }

    const fotoPath = funcionario.foto.local;

    const readFileAsync = promisify(fs.readFile);
    const fotoBuffer = await readFileAsync(fotoPath);
    res.setHeader('Content-Type', 'image/jpeg');

    return res.status(StatusCodes.OK).send(fotoBuffer);
};
