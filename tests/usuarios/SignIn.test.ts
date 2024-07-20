import { StatusCodes } from 'http-status-codes';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { testServer } from '../jest.setup';

import { Usuario } from '../../src/server/database/entities';

describe('Usuários - SignIn', () => {

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
        user.email = faker.internet.email({ firstName: user.nome, lastName: user.sobrenome });
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

        console.log(`Usuário teste criado: ${createUser.body}`);

    });

    it('Faz login', async () => {
        const res1 = await testServer
            .post('/entrar')
            .send({
                senha: plainPassword, // Usando a senha em texto plano aqui
                email: user.email,
            });

        expect(res1.statusCode).toEqual(StatusCodes.OK);
        expect(res1.body).toHaveProperty('accessToken');
    });

    it('Senha errada', async () => {
        const res1 = await testServer
            .post('/entrar')
            .send({
                senha: '1234567',
                email: user.email,
            });
        expect(res1.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
        expect(res1.body).toHaveProperty('errors.default');
    });

    it('Email errado', async () => {
        const res1 = await testServer
            .post('/entrar')
            .send({
                senha: plainPassword,
                email: 'jorgeeeeeee@gmail.com',
            });
        expect(res1.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
        expect(res1.body).toHaveProperty('errors.default');
    });

    it('Formato de email inválido', async () => {
        const res1 = await testServer
            .post('/entrar')
            .send({
                senha: plainPassword,
                email: 'jorge gmail.com',
            });
        expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        expect(res1.body).toHaveProperty('errors.body.email');
    });

    it('Senha muito pequena', async () => {
        const res1 = await testServer
            .post('/entrar')
            .send({
                senha: '12',
                email: user.email,
            });
        expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        expect(res1.body).toHaveProperty('errors.body.senha');
    });

    it('Não informado a senha', async () => {
        const res1 = await testServer
            .post('/entrar')
            .send({
                email: user.email,
            });
        expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        expect(res1.body).toHaveProperty('errors.body.senha');
    });

    it('Não informado email', async () => {
        const res1 = await testServer
            .post('/entrar')
            .send({
                senha: plainPassword,
            });
        expect(res1.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        expect(res1.body).toHaveProperty('errors.body.email');
    });

    it('Apagando usuário', async () => {

        const deleteUser = await testServer
            .delete(`/usuarios/${userId}`)
            .set({ Authorization: `Bearer ${accessToken}` })
            .send();

        expect(deleteUser.statusCode).toEqual(StatusCodes.NO_CONTENT);
    });
});
