import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';

import { UsuariosProvider } from '../../models/usuarios';
import { validation } from '../../shared/middlewares';
import { IQueryGetAllUsuarios } from '../../shared/interfaces';


export const getAllValidation = validation((getSchema) => ({
    query: getSchema<IQueryGetAllUsuarios>(yup.object().shape({
        page: yup.number().optional().moreThan(0),
        limit: yup.number().optional().moreThan(0),
        filter: yup.string().optional()
    }))
}));

export const getAll = async (req: Request, res: Response) => {
    const { page, limit, filter } = req.query as {
        page?: string | number;
        limit?: string | number;
        filter?: string;
    };

    if (filter && hasInvalidCharacters(filter)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            errors: { default: 'Filtros inválidos' }
        });
    }

    try {
        const result = await UsuariosProvider.getAll(
            typeof page === 'string' ? Number(page) : page,
            typeof limit === 'string' ? Number(limit) : limit,
            filter,
        );
        const count = !(result instanceof Error) ? result?.totalCount : null;

        res.setHeader('access-control-expose-headers', 'x-total-count');
        res.setHeader('x-total-count', String(count));

        return res.status(StatusCodes.OK).json(!(result instanceof Error) ? result?.usuarios : null);
    } catch (error) {
        console.error('Erro ao recuperar os usuários:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            errors: { default: 'Erro ao recuperar os usuários' }
        });
    }
};

function hasInvalidCharacters(input: string): boolean {
    const regex = /^[a-zA-Z0-9@.]*$/;
    return !regex.test(input);
}
