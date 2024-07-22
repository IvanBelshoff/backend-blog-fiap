import { StatusCodes } from 'http-status-codes';
import { testServer } from '../jest.setup';

let accessToken: string = '';


describe('GET /permissoes/:id', () => {


    beforeAll(async () => {
        
        const loginUserDefault = await testServer.post('/entrar').send({
            senha: process.env.SENHA_USER_DEFAULT,
            email: process.env.EMAIL_USER_DEFAULT,
        });
        accessToken = loginUserDefault.body.accessToken;
    });


    it('should return 500 error when permissoesProvider.getById throws an error', async () => {
        const invalidId = '999999'; 
        const res = await testServer.get(`/permissoes/${invalidId}`)
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
        const res = await testServer.get(`/permissoes/${invalidId}`)
            .set({ Authorization: `Bearer ${accessToken}` });

        let error;
        if (res.text) {
            error = res.text;
        }

        expect(res.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(error).toEqual('{\"errors\":{\"default\":\"Permissão não encontrada\"}}');
    });

    it('should return user data when getById returns successfully', async () => {
        const validId = '6';
        const res = await testServer.get(`/permissoes/${validId}`)
            .set({ Authorization: `Bearer ${accessToken}` });
        expect(res.status).toEqual(StatusCodes.OK);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('nome');
        expect(res.body).toHaveProperty('descricao');
        expect(res.body).toHaveProperty('data_atualizacao');
        expect(res.body).toHaveProperty('data_criacao');
        expect(res.body).toHaveProperty('regra');
        expect(res.body.regra).toHaveProperty('id');
        expect(res.body.regra).toHaveProperty('nome');
        expect(res.body.regra).toHaveProperty('descricao');
        expect(res.body.regra).toHaveProperty('data_criacao');
        expect(res.body.regra).toHaveProperty('data_atualizacao');
    });

    it('should return 500 error when id parameter is less than or equal to 0', async () => {
        const invalidId = 0; 
        const res = await testServer.get(`/permissoes/${invalidId}`)
            .set({ Authorization: `Bearer ${accessToken}` });
        let error;
        if (res.body.errors && 'params' in res.body.errors) {
            error = res.body.errors?.params;
        }
        expect(res.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });
});
