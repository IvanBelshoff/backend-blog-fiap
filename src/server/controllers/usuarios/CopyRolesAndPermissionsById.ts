import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';

import { validation } from '../../shared/middlewares';
import { UsuariosProvider } from '../../models/usuarios';
import { IBodyCopyRolesAndPermissionsByIdUsuarios } from '../../shared/interfaces';

export const copyRolesAndPermissionsByIdValidation = validation((getSchema) => ({
    body: getSchema<IBodyCopyRolesAndPermissionsByIdUsuarios>(yup.object().shape({
        id_usuario: yup.number().required().min(1),
        id_copiado: yup.number().required().min(1),
    })),
}));

export const copyRolesAndPermissionsById = async (req: Request<{}, {}, IBodyCopyRolesAndPermissionsByIdUsuarios>, res: Response) => {

    const result = await UsuariosProvider.copyRolesAndPermissionsById(req.body.id_usuario, req.body.id_copiado);

    if (result instanceof Error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            errors: {
                default: result.message
            }
        });
    }

    return res.status(StatusCodes.NO_CONTENT).send();

};
