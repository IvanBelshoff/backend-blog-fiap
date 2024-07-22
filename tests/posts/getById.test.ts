import { StatusCodes } from 'http-status-codes';
import { testServer } from '../jest.setup';

let accessToken: string = '';


describe('GET /posts/:id', () => {

    beforeAll(async () => {
        
        const loginUserDefault = await testServer.post('/entrar').send({
            senha: process.env.SENHA_USER_DEFAULT,
            email: process.env.EMAIL_USER_DEFAULT,
        });
        accessToken = loginUserDefault.body.accessToken;
    });

    it('should return 500 error when postsProvider.getById throws an error', async () => {
        const invalidId = '999999'; 
        const res = await testServer.get(`/posts/${invalidId}`)
            .set({ Authorization: `Bearer ${accessToken}` });

        expect(res.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(res.body).toEqual({
            errors: {
                default: expect.any(String)
            }
        });
    });

    it('should return 500 error when id is not found', async () => {
        const invalidId = '999999'; 
        const res = await testServer.get(`/posts/${invalidId}`)
            .set({ Authorization: `Bearer ${accessToken}` });

        let error;
        if (res.text) {
            error = res.text;
        }

        expect(res.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(error).toEqual('{\"errors\":{\"default\":\"Postagem não encontrada\"}}');
    });

    it('should return user data when getById returns successfully', async () => {
        const validId = '6';
        const res = await testServer.get(`/posts/${validId}`)
            .set({ Authorization: `Bearer ${accessToken}` });

        expect(res.status).toEqual(StatusCodes.OK);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('conteudo');
        expect(res.body).toHaveProperty('data_atualizacao');
        expect(res.body).toHaveProperty('data_criacao');
        expect(res.body).toHaveProperty('usuario_atualizador');
        expect(res.body).toHaveProperty('usuario_cadastrador');
        expect(res.body).toHaveProperty('visivel');
        expect(res.body).toHaveProperty('foto');
        expect(res.body.foto).toHaveProperty('id');
        expect(res.body.foto).toHaveProperty('local');
        expect(res.body.foto).toHaveProperty('nome');
        expect(res.body.foto).toHaveProperty('nuvem');
        expect(res.body.foto).toHaveProperty('originalname');
        expect(res.body.foto).toHaveProperty('tipo');
        expect(res.body.foto).toHaveProperty('url');
        expect(res.body.foto).toHaveProperty('data_criacao');
        expect(res.body.foto).toHaveProperty('data_atualizacao');
        expect(res.body.foto).toHaveProperty('height');
        expect(res.body.foto).toHaveProperty('width');
    });

    it('should return 500 error when id parameter is less than or equal to 0', async () => {
        const invalidId = 0; 
        const res = await testServer.get(`/posts/${invalidId}`)
            .set({ Authorization: `Bearer ${accessToken}` });
        let error;
        if (res.body.errors && 'params' in res.body.errors) {
            error = res.body.errors?.params;
        }
        expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    });
});
