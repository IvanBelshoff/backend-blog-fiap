import { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';
import { DeleteArquivoFirebase, deleteArquivoLocal } from '../services';

const fotoLocal = process.env.SALVAR_FOTO_LOCAL as unknown as Boolean;

type TProperty = 'body' | 'header' | 'params' | 'query';

type TGetSchema = <T>(schema: yup.Schema<T>) => yup.Schema;

type TAllSchemas = Record<TProperty, yup.Schema>;

type TGetAllSchemas = (getSchema: TGetSchema) => Partial<TAllSchemas>;

type TValidation = (getAllSchemas: TGetAllSchemas) => RequestHandler;

export const validation: TValidation = (getAllSchemas) => async (req, res, next) => {

    const schemas = getAllSchemas(schemas => schemas);

    const errorsResult: Record<string, Record<string, string>> = {};

    Object.entries(schemas).forEach(([key, schema]) => {
        try {
            const property = key as TProperty;
            schema.validateSync(req[property], { abortEarly: false });
        } catch (err) {
            const yupError = err as yup.ValidationError;
            const errors: Record<string, string> = {};
            yupError.inner.forEach(error => {
                if (!error.path) return;
                errors[error.path] = error.message;
            });
            errorsResult[key] = errors;
        }
    });

    if (Object.entries(errorsResult).length === 0) {
        return next();
    } else {
        if (req.file) {
            const deleteFoto = fotoLocal ? await deleteArquivoLocal(req.file.path, req.file.filename) : await DeleteArquivoFirebase(req.file.path, req.file.filename);
            if (deleteFoto instanceof Error) {
                console.log(deleteFoto.message);
            }
        }
        return res.status(StatusCodes.BAD_REQUEST).json({ errors: errorsResult });
    }
};
