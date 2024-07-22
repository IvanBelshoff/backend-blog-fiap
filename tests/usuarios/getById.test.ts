import { StatusCodes } from 'http-status-codes';
import { testServer } from '../jest.setup';
import { Timestamp } from 'typeorm';
import { Usuario } from '../../src/server/database/entities';

let accessToken: string = '';


describe('GET /usuarios/id/:id', () => {


    beforeAll(async () => {
        
        const loginUserDefault = await testServer.post('/entrar').send({
            senha: process.env.SENHA_USER_DEFAULT,
            email: process.env.EMAIL_USER_DEFAULT,
        });
        accessToken = loginUserDefault.body.accessToken;
    });


    it('should return 404 error when accessing /usuarios/id without ID', async () => {
        const res = await testServer.get('/usuarios/id/')
            .set({ Authorization: `Bearer ${accessToken}` });
        expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    });

    it('should return 500 error when UsuariosProvider.getById throws an error', async () => {
        const invalidId = '999999'; 
        const res = await testServer.get(`/usuarios/id/${invalidId}`)
            .set({ Authorization: `Bearer ${accessToken}` });

        expect(res.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(res.body).toEqual({
            errors: {
                default: expect.any(String)
            }
        });
    });

    it('should return user data when getById returns successfully', async () => {
        const validId = '6';
        const res = await testServer.get(`/usuarios/id/${validId}`)
            .set({ Authorization: `Bearer ${accessToken}` });
        expect(res.status).toEqual(StatusCodes.OK);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('nome');
        expect(res.body).toHaveProperty('sobrenome');
        expect(res.body).toHaveProperty('email');
        expect(res.body).toHaveProperty('bloqueado');
        expect(res.body).toHaveProperty('senha');
        expect(res.body).toHaveProperty('usuario_atualizador');
        expect(res.body).toHaveProperty('usuario_cadastrador');
        expect(res.body).toHaveProperty('ultimo_login');
        expect(res.body).toHaveProperty('data_criacao');
        expect(res.body).toHaveProperty('data_atualizacao');
        expect(res.body).toHaveProperty('foto');
        expect(res.body.foto).toHaveProperty('id');
        expect(res.body.foto).toHaveProperty('nome');
        expect(res.body.foto).toHaveProperty('originalname');
        expect(res.body.foto).toHaveProperty('tipo');
        expect(res.body.foto).toHaveProperty('tamanho');
        expect(res.body.foto).toHaveProperty('nuvem');
        expect(res.body.foto).toHaveProperty('local');
        expect(res.body.foto).toHaveProperty('url');
        expect(res.body.foto).toHaveProperty('width');
        expect(res.body.foto).toHaveProperty('height');
        expect(res.body.foto).toHaveProperty('data_criacao');
        expect(res.body.foto).toHaveProperty('data_atualizacao');
        expect(res.body).toHaveProperty('permissao');
        expect(res.body).toHaveProperty('regra');
    });

    it('should return 400 error when id parameter is less than or equal to 0', async () => {
        const invalidId = 0; 
        console.log(`/usuarios/id/${invalidId}`);
        const res = await testServer.get(`/usuarios/id/${invalidId}`)
            .set({ Authorization: `Bearer ${accessToken}` });
        console.log('res.body.errors: ', res.body);
        let error;
        if (res.body.errors && 'params' in res.body.errors) {
            error = res.body.errors?.params;
        }
        expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
        expect(error).toEqual({'id': 'Deve ser maior que 0'});
    });
});
