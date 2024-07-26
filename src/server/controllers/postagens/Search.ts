import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';

import { validation } from '../../shared/middlewares';
import { IQuerySearchPosts } from '../../shared/interfaces';
import { PostagensProvider } from '../../models/postagens';
import { ParsedQs } from 'qs';

export const searchPostsValidation = validation((getSchema) => ({
    query: getSchema<IQuerySearchPosts>(yup.object().shape({
        search: yup.string().required('Search term is required')
    }))
}));

export const search = async (req: Request<{}, {}, {}, ParsedQs>, res: Response) => {
    const searchTerm = req.query.search as string;

    try {
        const result = await PostagensProvider.search(searchTerm);

        if (result instanceof Error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                errors: { default: result.message }
            });
        }

        return res.status(StatusCodes.OK).json(result);
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            errors: { default: 'An unexpected error occurred' }
        });
    }
};
