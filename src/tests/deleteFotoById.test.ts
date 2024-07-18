import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { deleteFotoById, deleteFotoByIdValidation } from '../server/controllers/usuarios/DeleteFotoById';
import { FotosProvider } from '../server/models/fotos';

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

// Mock do FotosProvider
jest.mock('../server/models/fotos');

describe('deleteFotoById', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;
    let sendMock: jest.Mock;

    beforeEach(() => {
        req = {};
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn().mockReturnThis();
        sendMock = jest.fn().mockReturnThis();
        res = {
            status: statusMock,
            json: jsonMock,
            send: sendMock,
        };
    });

    it('should return 400 if id is not provided', async () => {
        req.params = {};

        await deleteFotoById(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(jsonMock).toHaveBeenCalledWith({
            errors: {
                default: 'O parâmetro "id" precisa ser informado'
            }
        });
    });

    it('should return 500 if updateById returns an error', async () => {
        const errorMessage = 'Erro ao atualizar a foto';
        (FotosProvider.updateById as jest.Mock).mockResolvedValue(new Error(errorMessage));
        req.params = { id: '1' };

        await deleteFotoById(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(jsonMock).toHaveBeenCalledWith({
            errors: {
                default: errorMessage
            }
        });
    });

    it('should return 204 if foto is deleted successfully', async () => {
        (FotosProvider.updateById as jest.Mock).mockResolvedValue(undefined);
        req.params = { id: '1' };

        await deleteFotoById(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
        expect(sendMock).toHaveBeenCalled();
    });
});

describe('deleteFotoByIdValidation', () => {
    it('should pass validation with valid id', async () => {
        const req = {
            params: {
                id: '1'
            }
        } as unknown as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            sendStatus: jest.fn().mockReturnThis(),
            links: jest.fn().mockReturnThis(),
            jsonp: jest.fn().mockReturnThis(),
            // Add other methods as needed
        } as unknown as Response;
        const next = jest.fn();

        await deleteFotoByIdValidation(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it('should fail validation with invalid id', async () => {
        const req = {
            params: {
                id: 'invalid'
            }
        } as unknown as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            sendStatus: jest.fn().mockReturnThis(),
            links: jest.fn().mockReturnThis(),
            jsonp: jest.fn().mockReturnThis(),
            // Add other methods as needed
        } as unknown as Response;
        const next = jest.fn();

        await deleteFotoByIdValidation(req, res, next);

        expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
            errors: {
                params: {
                    id: 'id must be a `number` type, but the final value was: `NaN` (cast from the value `"invalid"`).',
                },
            },
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should fail validation if id is not provided', async () => {
        const req = {
            params: {}
        } as unknown as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            sendStatus: jest.fn().mockReturnThis(),
            links: jest.fn().mockReturnThis(),
            jsonp: jest.fn().mockReturnThis(),
            // Add other methods as needed
        } as unknown as Response;
        const next = jest.fn();

        await deleteFotoByIdValidation(req, res, next);

        expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
            errors: {
                params: {
                    id: 'id is a required field',
                },
            },
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should fail validation if id is null', async () => {
        const req = {
            params: {
                id: null
            }
        } as unknown as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            sendStatus: jest.fn().mockReturnThis(),
            links: jest.fn().mockReturnThis(),
            jsonp: jest.fn().mockReturnThis(),
            // Add other methods as needed
        } as unknown as Response;
        const next = jest.fn();

        await deleteFotoByIdValidation(req, res, next);

        expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
            errors: {
                params: {
                    id: 'id is a required field',
                },
            },
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should fail validation if id is undefined', async () => {
        const req = {
            params: {
                id: undefined
            }
        } as unknown as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            sendStatus: jest.fn().mockReturnThis(),
            links: jest.fn().mockReturnThis(),
            jsonp: jest.fn().mockReturnThis(),
            // Add other methods as needed
        } as unknown as Response;
        const next = jest.fn();

        await deleteFotoByIdValidation(req, res, next);

        expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
            errors: {
                params: {
                    id: 'id is a required field',
                },
            },
        });
        expect(next).not.toHaveBeenCalled();
    });
});
