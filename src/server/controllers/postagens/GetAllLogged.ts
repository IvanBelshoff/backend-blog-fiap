import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';

import { validation } from '../../shared/middlewares';
import { IQueryGetAllPostagens } from '../../shared/interfaces';
import { PostagensProvider } from '../../models/postagens';

export const getAllValidation = validation((getSchema) => ({
    query: getSchema<IQueryGetAllPostagens>(yup.object().shape({
        page: yup.number().optional().moreThan(0),
        limit: yup.number().optional().moreThan(0),
        filter: yup.string().optional()
    }))
}));

export const getAllLogged = async (req: Request<{}, {}, {}, IQueryGetAllPostagens>, res: Response) => {

    const result = await PostagensProvider.getAll(
        req.query.page,
        req.query.limit,
        req.query.filter,
        req.query.visivel
    );

    const count = await PostagensProvider.count(req.query.filter);

    if (result instanceof Error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            errors: { default: result.message }
        });
    } else if (count instanceof Error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            errors: { default: count.message }
        });
    }
    
    res.setHeader('access-control-expose-headers', 'x-total-count');
    res.setHeader('x-total-count', count);

    return res.status(StatusCodes.OK).json(result);
};
