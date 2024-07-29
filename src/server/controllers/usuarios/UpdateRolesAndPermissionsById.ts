import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';

import { validation } from '../../shared/middlewares';
import { UsuariosProvider } from '../../models/usuarios';
import { IBodyUpdateRolesAndPermissionsByIdUsuarios, IParamsIdGlobal } from '../../shared/interfaces';

export const updateRolesAndPermissionsByIdValidation = validation((getSchema) => ({
    body: getSchema<IBodyUpdateRolesAndPermissionsByIdUsuarios>(yup.object().shape({
        regras: yup.array().of(yup.number().integer().required().moreThan(0)).optional(),
        permissoes: yup.array().of(yup.number().integer().required().moreThan(0)).optional()
    })),
    params: getSchema<IParamsIdGlobal>(yup.object().shape({
        id: yup.number().integer().required().moreThan(0),
    }))
}));

export const updateRolesAndPermissionsById = async (req: Request<IParamsIdGlobal, IBodyUpdateRolesAndPermissionsByIdUsuarios>, res: Response) => {
    if (!req.params.id) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            errors: {
                default: 'O parâmetro "id" precisa ser informado'
            }
        });
    }
    const result = await UsuariosProvider.updateRolesAndPermissionsById(req.params.id, { regras: req.body.regras, permissoes: req.body.permissoes });
    if (result instanceof Error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            errors: {
                default: result.message
            }
        });
    }

    return res.status(StatusCodes.NO_CONTENT).send();

};
