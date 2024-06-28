import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';

import { validation } from '../../shared/middlewares';
import { IBodyUpdatePermissoes, IParamsIdGlobal } from '../../shared/interfaces';
import { PermissoesProvider } from '../../models/permissoes';

export const updataByIdValidation = validation((getSchema) => ({
    body: getSchema<IBodyUpdatePermissoes>(yup.object().shape({
        nome: yup.string().required().min(1).max(50),
        descricao: yup.string().optional().min(1).max(50),
        regra_id: yup.number().integer().optional().moreThan(0),
    }))
}));

export const updateById = async (req: Request<IParamsIdGlobal, {}, IBodyUpdatePermissoes>, res: Response) => {

    if (!req.params.id) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            errors: {
                default: 'O parâmetro "id" precisa ser informado'
            }
        });
    }

    const result = await PermissoesProvider.updateById(req.params.id, req.body);

    if (result instanceof Error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            errors: {
                default: result.message
            }
        });
    }

    return res.status(StatusCodes.NO_CONTENT).send();

};
