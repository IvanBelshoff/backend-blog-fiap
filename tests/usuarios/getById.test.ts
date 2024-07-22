import { StatusCodes } from 'http-status-codes';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { testServer } from '../jest.setup';
import { Usuario } from '../../src/server/database/entities';


describe('GET /usuarios/id/:id', () => {

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
    });


    it('should return 404 error when accessing /usuarios/id without ID', async () => {
        const res = await testServer.get('/usuarios/id/')
            .set({ Authorization: `Bearer ${accessToken}` });
        expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
        expect(res.body).toEqual({
            errors: {
                params: {
                    id: 'Formato digitado é invalido'
                }
            }
        });
    });

    it('should return 500 error when UsuariosProvider.getById throws an error', async () => {
        const invalidId = '999999';
        const res = await testServer.get(`/usuarios/${invalidId}`)
            .set({ Authorization: `Bearer ${accessToken}` });

        expect(res.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(res.body).toEqual({
            errors: {
                default: 'Usuario não encontrado'
            }
        });
    });

    it('should return user data when getById returns successfully', async () => {
        const validId = userId;

        const res = await testServer.get(`/usuarios/${validId}`)
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
        const res = await testServer.get(`/usuarios/${invalidId}`)
            .set({ Authorization: `Bearer ${accessToken}` });

        expect(res.status).toEqual(StatusCodes.BAD_REQUEST);

    });

    it('Apagando usuário', async () => {

        const deleteUser = await testServer
            .delete(`/usuarios/${userId}`)
            .set({ Authorization: `Bearer ${accessToken}` })
            .send();

        expect(deleteUser.statusCode).toEqual(StatusCodes.NO_CONTENT);
    });
});
