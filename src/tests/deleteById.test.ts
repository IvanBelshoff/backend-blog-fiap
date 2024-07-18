import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { deleteById } from '../server/controllers/usuarios/DeleteById';
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

jest.mock('../server/models/usuarios');

describe('deleteById', () => {
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

        await deleteById(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(jsonMock).toHaveBeenCalledWith({
            errors: {
                default: 'O parâmetro "id" precisa ser informado'
            }
        });
    });

    it('should return 500 if deleteById returns an error', async () => {
        const errorMessage = 'Erro ao deletar usuário';
        UsuariosProvider.deleteById = jest.fn().mockResolvedValue(new Error(errorMessage));
        req.params = { id: '1' };

        await deleteById(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(jsonMock).toHaveBeenCalledWith({
            errors: {
                default: errorMessage
            }
        });
    });

    it('should return 204 if user is deleted successfully', async () => {
        UsuariosProvider.deleteById = jest.fn().mockResolvedValue(undefined);
        req.params = { id: '1' };

        await deleteById(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
        expect(sendMock).toHaveBeenCalled();
    });
});
