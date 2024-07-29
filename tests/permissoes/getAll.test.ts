import { StatusCodes } from 'http-status-codes';
import { testServer } from '../jest.setup';
import { Usuario } from '../../src/server/database/entities';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { Permissoes } from '../../src/server/shared/middlewares';
import { IBodyUpdateRolesAndPermissionsByIdUsuarios } from '../../src/server/shared/interfaces';

describe('getAll', () => {

    const userProfessor = new Usuario();
    const userUsuario = new Usuario();
    const plainPassword = '123456'; // Definindo uma senha fixa para os testes
    let accessTokenProfessor = '';
    let accessTokenUsuario = '';
    let accessToken = '';
    let userId = '';

    beforeAll(async () => {
        // Login do usuário default para obter o accessToken
        const loginUserDefault = await testServer.post('/entrar').send({
            senha: process.env.SENHA_USER_DEFAULT,
            email: process.env.EMAIL_USER_DEFAULT,
        });
        accessToken = loginUserDefault.body.accessToken;
        // criacao de usuário professor
        userProfessor.nome = faker.person.firstName();
        userProfessor.sobrenome = faker.person.lastName();
        userProfessor.email = faker.internet.email({ firstName: userProfessor.nome, lastName: userProfessor.sobrenome });
        userProfessor.bloqueado = false;
        userProfessor.senha = plainPassword;

        const createUserProfessor = await testServer.post('/usuarios')
            .send({
                nome: userProfessor.nome,
                sobrenome: userProfessor.sobrenome,
                senha: userProfessor.senha,
                email: userProfessor.email,
                bloqueado: userProfessor.bloqueado                
            })
            .set({ Authorization: `Bearer ${accessToken}` });

        userId = createUserProfessor.body;

        // update das regras e permissões PROFESSOR
        await testServer.patch(`/usuarios/autenticacao/${userId}`)
            .send({
                regras: [2],
                permissoes: [1, 2, 3]            })
            .set({ Authorization: `Bearer ${accessToken}` });

        await testServer.get(`/usuarios/id/${userId}`)
            .set({ Authorization: `Bearer ${accessToken}` });
        const loginUserProfessor = await testServer.post('/entrar').send({
            senha: userProfessor.senha,
            email: userProfessor.email,
        });
        accessTokenProfessor = loginUserProfessor.body.accessToken;

        // criacao de usuário Usuario
        userUsuario.nome = faker.person.firstName();
        userUsuario.sobrenome = faker.person.lastName();
        userUsuario.email = faker.internet.email({ firstName: userUsuario.nome, lastName: userUsuario.sobrenome });
        userUsuario.bloqueado = false;
        userUsuario.senha = plainPassword;

        const createUserUsuario = await testServer.post('/usuarios')
            .send({
                nome: userUsuario.nome,
                sobrenome: userUsuario.sobrenome,
                senha: userUsuario.senha,
                email: userUsuario.email,
                bloqueado: userUsuario.bloqueado                
            })
            .set({ Authorization: `Bearer ${accessToken}` });

        userId = createUserUsuario.body;

        // update das regras e permissões Usuario
        await testServer.patch(`/usuarios/autenticacao/${userId}`)
            .send({
                regras: [3],
                permissoes: [4, 5 ,6]            })
            .set({ Authorization: `Bearer ${accessToken}` });

        const getUsuario = await testServer.get(`/usuarios/id/${userId}`)
            .set({ Authorization: `Bearer ${accessToken}` });
        const loginUserUsuario = await testServer.post('/entrar').send({
            senha: userUsuario.senha,
            email: userUsuario.email,
        });
        accessTokenUsuario = loginUserUsuario.body.accessToken;
    });

    afterAll(async () => {
        await testServer
            .delete(`/usuarios/${userId}`)
            .set({ Authorization: `Bearer ${accessToken}` })
            .send();
    });

    it('should return all permissions and count', async () => {
        const query = {
            page: '1',
            limit: '10',
            filter: ''
        };
    
        const queryString = `?page=${query.page}&limit=${query.limit}&filter=${query.filter}`;
    
        const res = await testServer.get(`/permissoes${queryString}`)
            .set({ Authorization: `Bearer ${accessToken}` });

        expect(res.statusCode).toEqual(StatusCodes.OK);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
    });
    
    it('should return headers access-control-expose-headers and x-total-count', async () => {
        const query = {
            page: '1',
            limit: '10',
            filter: ''
        };
    
        const queryString = `?page=${query.page}&limit=${query.limit}&filter=${query.filter}`;
    
        const res = await testServer.get(`/permissoes${queryString}`)
            .set({ Authorization: `Bearer ${accessToken}` });
    
        expect(res.status).toEqual(StatusCodes.OK);
        expect(res.headers['access-control-expose-headers']).toEqual('x-total-count');
        expect(res.headers['x-total-count']).toBeDefined();
    });

    it('should return empty array and count 0 when no permissions match filter', async () => {
        const query = {
            page: '1',
            limit: '10',
            filter: 'nonexistentfilter'
        };
    
        const queryString = `?page=${query.page}&limit=${query.limit}&filter=${query.filter}`;
    
        const res = await testServer.get(`/permissoes${queryString}`)
            .set({ Authorization: `Bearer ${accessToken}` });
        
        expect(res.statusCode).toEqual(StatusCodes.OK);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(0);
        expect(Number(res.headers['x-total-count'])).toEqual(0);
    });

    it('should return all permissions and count when page and limit are not specified', async () => {
        const query = {
            filter: ''
        };
    
        const queryString = `?filter=${query.filter}`;
    
        const res = await testServer.get(`/permissoes${queryString}`)
            .set({ Authorization: `Bearer ${accessToken}` });
        
        expect(res.statusCode).toEqual(StatusCodes.OK);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
        expect(Number(res.headers['x-total-count'])).toBeGreaterThan(0);
    });

    it('should return 400 error when page is invalid', async () => {
        const query = {
            page: 'invalid',
            limit: '10',
            filter: ''
        };
    
        const queryString = `?page=${query.page}&limit=${query.limit}&filter=${query.filter}`;
    
        const res = await testServer.get(`/permissoes${queryString}`)
            .set({ Authorization: `Bearer ${accessToken}` });
        let error;
        if (res.error instanceof Error && 'text' in res.error) {
            error = JSON.parse(res.error?.text);
        }
        
        expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        expect(JSON.stringify(error.errors.query)).toEqual('{"page":"Formato digitado é invalido"}');
    });

    it('should return 400 error when limit is invalid', async () => {
        const query = {
            page: '1',
            limit: 'invalid',
            filter: ''
        };
    
        const queryString = `?page=${query.page}&limit=${query.limit}&filter=${query.filter}`;
    
        const res = await testServer.get(`/permissoes${queryString}`)
            .set({ Authorization: `Bearer ${accessToken}` });
        let error;
        if (res.error instanceof Error && 'text' in res.error) {
            error = JSON.parse(res.error?.text);
        }
        
        expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        expect(JSON.stringify(error.errors.query)).toEqual('{"limit":"Formato digitado é invalido"}');
    });

    it('should return 400 error when both page and limit are invalid', async () => {
        const query = {
            page: 'invalid',
            limit: 'invalid',
            filter: ''
        };
    
        const queryString = `?page=${query.page}&limit=${query.limit}&filter=${query.filter}`;
    
        const res = await testServer.get(`/permissoes${queryString}`)
            .set({ Authorization: `Bearer ${accessToken}` });
        let error;
        if (res.error instanceof Error && 'text' in res.error) {
            error = JSON.parse(res.error?.text);
        }
        expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        expect(JSON.stringify(error.errors.query)).toEqual('{\"page\":\"Formato digitado é invalido\",\"limit\":\"Formato digitado é invalido\"}');
    });

    it('should return 400 and default error message when user doesn`t have permission PROFESSOR', async () => {
        const query = {
            page: '1',
            limit: '10',
            filter: ''
        };
    
        const queryString = `?page=${query.page}&limit=${query.limit}&filter=${query.filter}`;
    
        const res = await testServer.get(`/permissoes${queryString}`)
            .set({ Authorization: `Bearer ${accessTokenProfessor}` });
        let error;
        if (res.text) {
            error = res.text;
        }
    
        expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        expect(error).toEqual('{\"errors\":{\"default\":\"Permissao não autorizada contate o administrador do sistema\"}}');
    });
    
    it('should return 400 and default error message when user doesn`t have permission USUARIO', async () => {
        const query = {
            page: '1',
            limit: '10',
            filter: ''
        };
    
        const queryString = `?page=${query.page}&limit=${query.limit}&filter=${query.filter}`;
    
        const res = await testServer.get(`/permissoes${queryString}`)
            .set({ Authorization: `Bearer ${accessTokenUsuario}` });

        let error;
        if (res.text) {
            error = res.text;
        }
    
        expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        expect(error).toEqual('{\"errors\":{\"default\":\"Permissao não autorizada contate o administrador do sistema\"}}');
    });
});
