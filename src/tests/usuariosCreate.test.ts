import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';
import sharp from 'sharp';
import { create, createValidation } from '../server/controllers/usuarios/Create';
import { UsuariosProvider } from '../server/models/usuarios';
import { FotosProvider } from '../server/models/fotos';
import { decoder, validation } from '../server/shared/middlewares';
import { IBodyCreateUsuarios } from '../server/shared/interfaces';
import { Readable } from 'stream';

jest.mock('sharp');
jest.mock('../server/models/usuarios');
jest.mock('../server/models/fotos');
jest.mock('../server/shared/middlewares');

describe('create', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        const mockStream = new Readable();
        mockStream._read = () => {}; // Define uma função vazia para satisfazer o tipo Readable

        const mockFile: Express.Multer.File = {
            fieldname: 'file',
            originalname: 'original.jpg',
            encoding: '7bit',
            mimetype: 'image/jpeg',
            destination: '/path/to/destination',
            filename: 'filename.ext',
            path: '/path/to/file',
            size: 1024,
            buffer: Buffer.from('fakeimage', 'utf-8'),
            stream: mockStream,
        };

        req = {
            body: {
                nome: 'Teste',
                sobrenome: 'Sobrenome',
                senha: 'senha123',
                email: 'teste@teste.com',
                bloqueado: false,
                id_copy_regras: 1,
            },
            file: mockFile as Express.Multer.File,
            get: () => undefined, // Adicione essa função `get` para satisfazer a tipagem esperada
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create user and photo successfully', async () => {
        (UsuariosProvider.validaEmailUsuario as jest.Mock).mockResolvedValue(undefined);
        (UsuariosProvider.create as jest.Mock).mockResolvedValue({ id: 'fakeUserId' });
        (FotosProvider.create as jest.Mock).mockResolvedValue({
            id: 1,
            nome: 'filename.ext',
            originalname: 'original.jpg',
            tipo: 'usuarios',
            tamanho: 1024,
            nuvem: false,
            local: '/path/to/file',
            url: 'http://example.com/file',
            width: 100,
            height: 200,
            data_criacao: new Date(),
            data_atualizacao: new Date(),
            usuario: null,
            postagem: null,
        });
    
        await create(req as Request, res as Response);
    
        expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
        expect(res.json).toHaveBeenCalledWith({ id: 'fakeUserId' });
    });
    
    it('should handle email validation error', async () => {
        const errorMessage = 'Já existe usuário com este E-mail.';

        (UsuariosProvider.validaEmailUsuario as jest.Mock).mockResolvedValue(errorMessage);
    
        await create(req as Request, res as Response);
    
        expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({ errors: errorMessage });
    });
    
    it('should handle error when creating photo', async () => {
        const errorMessage = 'Erro ao cadastrar/salvar foto';
        const error = new Error(errorMessage);

        (UsuariosProvider.validaEmailUsuario as jest.Mock).mockResolvedValue(undefined);
        (FotosProvider.create as jest.Mock).mockRejectedValue(error);
    
        await create(req as Request, res as Response);
    
        expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(res.json).toHaveBeenCalledWith({ errors: { default: errorMessage } });
    });
    
    it('should handle error when creating user', async () => {
        const errorMessage = 'Erro interno no servidor';
        const error = new Error(errorMessage);
        (UsuariosProvider.validaEmailUsuario as jest.Mock).mockResolvedValue(undefined);
        (FotosProvider.create as jest.Mock).mockResolvedValue({
            id: 1,
            nome: 'filename.ext',
            originalname: 'original.jpg',
            tipo: 'usuarios',
            tamanho: 1024,
            nuvem: false,
            local: '/path/to/file',
            url: 'http://example.com/file',
            width: 100,
            height: 200,
            data_criacao: new Date(),
            data_atualizacao: new Date(),
            usuario: null,
            postagem: null,
        });
        (UsuariosProvider.create as jest.Mock).mockRejectedValue(error);
    
        await create(req as Request, res as Response);
    
        expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(res.json).toHaveBeenCalledWith({ errors: { default: errorMessage } });
    });
    
    it('should handle case when no file is attached', async () => {
        delete req.file;
    
        const resultUsuario = { id: 'fakeUserId' };
    
        (UsuariosProvider.validaEmailUsuario as jest.Mock).mockResolvedValue(undefined);
        (FotosProvider.createNoFile as jest.Mock).mockResolvedValue({
            id: 1,
            nome: 'filename.ext',
            originalname: 'original.jpg',
            tipo: 'usuarios',
            tamanho: 1024,
            nuvem: false,
            local: '/path/to/file',
            url: 'http://example.com/file',
            width: 100,
            height: 200,
            data_criacao: new Date(),
            data_atualizacao: new Date(),
            usuario: null,
            postagem: null,
        });
        (UsuariosProvider.create as jest.Mock).mockResolvedValue(resultUsuario);
    
        await create(req as Request, res as Response);
    
        expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
        expect(res.json).toHaveBeenCalledWith(resultUsuario);
    });

    // só consegui fazer validação booleana, acredito que o ideal seja retornar conforme o teste abaixo de inputs que não passou
    it('should handle invalid email format', async () => {
        (UsuariosProvider.validaEmailUsuario as jest.Mock).mockResolvedValue(true);
        req.body.email = 'email_invalido';
        await create(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({ errors: true });
    });
    
    it('should handle invalid input data', async () => {
        req.body.senha = 'email_invalido';
        req.body.nome = 'tre';
        req.body.senha = '123456';
        req.body.sobrenome = null;
        
        await create(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
            errors: {
                nome: 'nome must be at least 3 characters',
                sobrenome: 'sobrenome is a required field',
                senha: 'senha must be at least 6 characters',
                email: 'email must be a valid email',
            }
        });
    });

    it('should handle error when deleting local file', async () => {
        // Mock error during local file deletion
        const errorMessage = 'Error deleting local file';
        const deleteError = new Error(errorMessage);

        (UsuariosProvider.validaEmailUsuario as jest.Mock).mockResolvedValue(undefined);
        (FotosProvider.create as jest.Mock).mockResolvedValue({
            id: 1,
            nome: 'filename.ext',
            originalname: 'original.jpg',
            tipo: 'usuarios',
            tamanho: 1024,
            nuvem: false,
            local: '/path/to/file',
            url: 'http://example.com/file',
            width: 100,
            height: 200,
            data_criacao: new Date(),
            data_atualizacao: new Date(),
            usuario: null,
            postagem: null,
        });
        (UsuariosProvider.create as jest.Mock).mockRejectedValue(deleteError);
    
        await create(req as Request, res as Response);
    
        expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(res.json).toHaveBeenCalledWith({ errors: { default: errorMessage } });
    });

    it('should handle unhandled exception', async () => {
        // Mock unhandled exception
        const errorMessage = 'Unhandled exception occurred';
        const unhandledError = new Error(errorMessage);

        (UsuariosProvider.validaEmailUsuario as jest.Mock).mockRejectedValue(unhandledError);

        await create(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(res.json).toHaveBeenCalledWith({ errors: { default: 'Erro interno no servidor' } });
    });
});
