import { StatusCodes } from 'http-status-codes';
import { Usuario } from '../../src/server/database/entities';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { testServer } from '../jest.setup';
import path from 'path';

describe('create', () => {
    const user = new Usuario();
    const plainPassword = '123456';
    let accessToken = '';
    let userId = '';

    beforeAll(async () => {
        const loginUserDefault = await testServer.post('/entrar').send({
            senha: process.env.SENHA_USER_DEFAULT,
            email: process.env.EMAIL_USER_DEFAULT,
        });

        accessToken = loginUserDefault.body.accessToken;
    });

    it('criar usuário e foto com sucesso', async () => {

        user.nome = faker.person.firstName();
        user.sobrenome = faker.person.lastName();
        user.email = faker.internet.email({ firstName: user.nome, lastName: user.sobrenome });
        user.bloqueado = false;
        user.senha = plainPassword;
        
        const res1 = await testServer
            .post('/usuarios')
            .field('nome', user.nome)
            .field('sobrenome', user.sobrenome)
            .field('senha', user.senha || '')
            .field('email', user.email)
            .field('bloqueado', user.bloqueado)
            .attach('foto', path.resolve(__dirname, '..', 'assets/profile.jpg'))
            .set({ Authorization: `Bearer ${accessToken}` });

        userId = res1.body;

        expect(res1.statusCode).toEqual(StatusCodes.CREATED);
    });

    it('Apagando usuário', async () => {
        const deleteUser = await testServer
            .delete(`/usuarios/${userId}`)
            .set({ Authorization: `Bearer ${accessToken}` })
            .send();

        expect(deleteUser.statusCode).toEqual(StatusCodes.NO_CONTENT);
    });
});
