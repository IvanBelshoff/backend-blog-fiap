import { StatusCodes } from 'http-status-codes';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { testServer } from '../jest.setup';
import { IQueryGetAllUsuarios } from '../../src/server/shared/interfaces';
import { Usuario } from '../../src/server/database/entities';

describe('getAll', () => {

    const user = new Usuario();
    const plainPassword = '123456'; // Definindo uma senha fixa para os testes
    let accessToken = '';
    let userId = '';

    beforeAll(async () => {

        const loginUserDefault = await testServer.post('/entrar').send({
            senha: process.env.SENHA_USER_DEFAULT,
            email: process.env.EMAIL_USER_DEFAULT,
        });

        accessToken = loginUserDefault.body.accessToken;

        user.nome = faker.person.firstName();
        user.sobrenome = faker.person.lastName();
        user.email = faker.internet.email({ firstName: user.nome, lastName: user.sobrenome, provider: 'hotmail.com.br' });
        user.bloqueado = false;
        user.senha = plainPassword;

        const createUser = await testServer.post('/usuarios')
            .send({
                nome: user.nome,
                sobrenome: user.sobrenome,
                senha: user.senha, // Usando a senha em texto plano aqui
                email: user.email,
                bloqueado: user.bloqueado
            })
            .set({ Authorization: `Bearer ${accessToken}` });

        userId = createUser.body;

    });


    it('should return all users and count', async () => {
        const query: IQueryGetAllUsuarios = {
            page: 1,
            limit: 10,
            filter: undefined
        };

        const queryString = `?page=${query.page || ''}&limit=${query.limit || ''}&filter=${query.filter || ''}`;

        const res = await testServer.get(`/usuarios${queryString}`)
            .set({ Authorization: `Bearer ${accessToken}` });

        expect(res.status).toEqual(StatusCodes.OK);
        expect(res.headers['access-control-expose-headers']).toEqual('x-total-count');
        expect(res.headers['x-total-count']).toBeDefined();
        //const totalCount = res.headers['x-total-count'];

    });

    it('should return 400 error and specific error message when using invalid page', async () => {
        const query = {
            page: 'a',
            limit: 10,
            filter: undefined
        };

        const queryString = `?page=${query.page || ''}&limit=${query.limit || ''}&filter=${query.filter || ''}`;

        const res = await testServer.get(`/usuarios${queryString}`)
            .set({ Authorization: `Bearer ${accessToken}` });

        expect(res.status).toEqual(StatusCodes.BAD_REQUEST);

        expect(res.body).toEqual({
            errors: {
                query: {
                    page: 'Formato digitado é invalido'
                }
            }
        });
    });

    it('should return 400 error and specific error message when using invalid limit', async () => {
        const query = {
            page: 1,
            limit: 'a',
            filter: undefined
        };

        const queryString = `?page=${query.page || ''}&limit=${query.limit || ''}&filter=${query.filter || ''}`;

        const res = await testServer.get(`/usuarios${queryString}`)
            .set({ Authorization: `Bearer ${accessToken}` });

        expect(res.status).toEqual(StatusCodes.BAD_REQUEST);

        expect(res.body).toEqual({
            errors: {
                query: {
                    limit: 'Formato digitado é invalido'
                }
            }
        });
    });

    it('should return 400 error when both page and limit are invalid', async () => {
        const query = {
            page: 'a',
            limit: 'b',
            filter: undefined
        };

        const queryString = `?page=${query.page || ''}&limit=${query.limit || ''}&filter=${query.filter || ''}`;

        const res = await testServer.get(`/usuarios${queryString}`)
            .set({ Authorization: `Bearer ${accessToken}` });

        expect(res.status).toEqual(StatusCodes.BAD_REQUEST);

        expect(res.body).toEqual({
            errors: {
                query: {
                    page: 'Formato digitado é invalido',
                    limit: 'Formato digitado é invalido'
                }
            }
        });
    });

    it('should return empty array and count 0 when no users match filter', async () => {
        const query: IQueryGetAllUsuarios = {
            page: 1,
            limit: 10,
            filter: 'nonexistentfilter'
        };

        const queryString = `?page=${query.page || ''}&limit=${query.limit || ''}&filter=${query.filter || ''}`;

        const res = await testServer.get(`/usuarios${queryString}`)
            .set({ Authorization: `Bearer ${accessToken}` });

        expect(res.statusCode).toEqual(StatusCodes.OK);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(0);
        expect(Number(res.headers['x-total-count'])).toEqual(0);
    });

    it('should return users with specific email domain', async () => {
        const query: IQueryGetAllUsuarios = {
            page: 1,
            limit: 10,
            filter: 'hotmail'
        };

        const queryString = `?page=${query.page || ''}&limit=${query.limit || ''}&filter=${query.filter || ''}`;

        const res = await testServer.get(`/usuarios${queryString}`)
            .set({ Authorization: `Bearer ${accessToken}` });
            
        expect(res.statusCode).toEqual(StatusCodes.OK);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(Number(res.headers['x-total-count'])).toBeGreaterThan(0);
    });

    it('should return all users and count when page and limit are not specified', async () => {
        const query: IQueryGetAllUsuarios = {
            filter: ''
        };

        const queryString = `?filter=${query.filter || ''}`;

        const res = await testServer.get(`/usuarios${queryString}`)
            .set({ Authorization: `Bearer ${accessToken}` });

        expect(res.statusCode).toEqual(StatusCodes.OK);
        expect(Array.isArray(res.body)).toBeTruthy();
    });

    it('Apagando usuário', async () => {

        const deleteUser = await testServer
            .delete(`/usuarios/${userId}`)
            .set({ Authorization: `Bearer ${accessToken}` })
            .send();

        expect(deleteUser.statusCode).toEqual(StatusCodes.NO_CONTENT);
    });
});
