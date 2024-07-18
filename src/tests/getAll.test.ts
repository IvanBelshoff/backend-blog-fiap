import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';
import { getAll, getAllValidation } from '../server/controllers/usuarios/GetAll';
import { UsuariosProvider } from '../server/models/usuarios';

// Mock do Firebase Admin SDK
jest.mock('firebase-admin', () => {
    const mStorage = {
        bucket: jest.fn(() => ({
            file: jest.fn(() => ({
                delete: jest.fn().mockResolvedValue(undefined),
            })),
        })),
    };
    return {
        initializeApp: jest.fn(),
        credential: {
            cert: jest.fn(),
        },
        storage: jest.fn(() => mStorage),
    };
});

describe('getAll', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;
    let setHeaderMock: jest.Mock;

    beforeEach(() => {
        req = {
            query: {},
        };
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn().mockReturnThis();
        setHeaderMock = jest.fn();
        res = {
            status: statusMock,
            json: jsonMock,
            setHeader: setHeaderMock,
        };
    });

    it('should return all usuarios with valid query parameters', async () => {
        req.query = {
            page: '1',
            limit: '10',
            filter: 'example',
        };

        const mockUsuarios = [{ id: 1, nome: 'Usuario 1' }, { id: 2, nome: 'Usuario 2' }];
        const mockCount = 2;

        // Mock do método getAll e count de UsuariosProvider
        UsuariosProvider.getAll = jest.fn().mockResolvedValue(mockUsuarios);
        UsuariosProvider.count = jest.fn().mockResolvedValue(mockCount);

        await getAll(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
        expect(jsonMock).toHaveBeenCalledWith(mockUsuarios);
        expect(setHeaderMock).toHaveBeenCalledWith('access-control-expose-headers', 'x-total-count');
        expect(setHeaderMock).toHaveBeenCalledWith('x-total-count', mockCount.toString());
    });

    it('should return 500 if getAll throws an error', async () => {
        req.query = {
            page: '1',
            limit: '10',
            filter: 'example',
        };

        const errorMessage = 'Erro ao recuperar os usuários';

        // Mock para simular erro em getAll
        UsuariosProvider.getAll = jest.fn().mockRejectedValue(new Error(errorMessage));
        UsuariosProvider.count = jest.fn().mockResolvedValue(2); // Mock para count retornando um valor válido

        await getAll(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(jsonMock).toHaveBeenCalledWith({
            errors: { default: errorMessage },
        });
    });

    it('should return 500 if count throws an error', async () => {
        req.query = {
            page: '1',
            limit: '10',
            filter: 'example',
        };

        const errorMessage = 'Erro ao recuperar a quantidade de usuários';

        // Mock para simular erro em count
        UsuariosProvider.getAll = jest.fn().mockResolvedValue([{ id: 1, nome: 'Usuario 1' }]);
        UsuariosProvider.count = jest.fn().mockRejectedValue(new Error(errorMessage));

        await getAll(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(jsonMock).toHaveBeenCalledWith({
            errors: { default: errorMessage },
        });
    });
});

describe('getAllValidation', () => {
    it('should pass validation with valid query parameters', async () => {
        const req = {
            query: {
                page: '1',
                limit: '10',
                filter: 'example',
            },
        } as unknown as Request;
        const next = jest.fn();

        await getAllValidation(req, {} as Response, next);

        expect(next).toHaveBeenCalled();
    });

    it('should fail validation if page is not a number', async () => {
        const req = {
            query: {
                page: 'invalid',
                limit: '10',
                filter: 'example',
            },
        } as unknown as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        } as unknown as Response;
        const next = jest.fn();

        await getAllValidation(req, res, next);

        expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
            errors: {
                query: {
                    page: 'page must be a `number` type, but the final value was: `NaN` (cast from the value `"invalid"`).',
                },
            },
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should fail validation if limit is not a number', async () => {
        const req = {
            query: {
                page: '1',
                limit: 'invalid',
                filter: 'example',
            },
        } as unknown as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        } as unknown as Response;
        const next = jest.fn();

        await getAllValidation(req, res, next);

        expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
            errors: {
                query: {
                    limit: 'limit must be a `number` type, but the final value was: `NaN` (cast from the value `"invalid"`).',
                },
            },
        });
        expect(next).not.toHaveBeenCalled();
    });
});
