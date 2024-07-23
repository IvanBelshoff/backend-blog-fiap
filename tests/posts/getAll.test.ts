import { StatusCodes } from 'http-status-codes';
import { testServer } from '../jest.setup';
import { IQueryGetAllPostagens } from '../../src/server/shared/interfaces';

let accessToken: string = '';

describe('getAll', () => {

    beforeAll(async () => {
        // Login do usuário default para obter o accessToken
        const loginUserDefault = await testServer.post('/entrar').send({
            senha: process.env.SENHA_USER_DEFAULT,
            email: process.env.EMAIL_USER_DEFAULT,
        });
        accessToken = loginUserDefault.body.accessToken;
    });

    it('should return all posts and count', async () => {
        const query: IQueryGetAllPostagens = {
            page: 1,
            limit: 10,
            filter: undefined
        };

        const queryString = `?page=${query.page || ''}&limit=${query.limit || ''}&filter=${query.filter || ''}`;

        const res = await testServer.get(`/posts${queryString}`)
            .set({ Authorization: `Bearer ${accessToken}` });
    
        expect(res.statusCode).toEqual(StatusCodes.OK);
        expect(Array.isArray(res.body)).toBeTruthy();
    });
    
    it('should return headers access-control-expose-headers and x-total-count', async () => {
        const query = {
            page: '1',
            limit: '10',
            filter: ''
        };
    
        const queryString = `?page=${query.page}&limit=${query.limit}&filter=${query.filter}`;
    
        const res = await testServer.get(`/posts${queryString}`)
            .set({ Authorization: `Bearer ${accessToken}` });
    
        expect(res.status).toEqual(StatusCodes.OK);
        expect(res.headers['access-control-expose-headers']).toEqual('x-total-count');
        expect(res.headers['x-total-count']).toBeDefined();
    });

    it('should return empty array and count 0 when no posts match filter', async () => {
        const query = {
            page: '1',
            limit: '10',
            filter: 'nonexistentfilter'
        };
    
        const queryString = `?page=${query.page}&limit=${query.limit}&filter=${query.filter}`;
    
        const res = await testServer.get(`/posts${queryString}`)
            .set({ Authorization: `Bearer ${accessToken}` });
        
        expect(res.statusCode).toEqual(StatusCodes.OK);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(0);
        expect(Number(res.headers['x-total-count'])).toEqual(0);
    });

    it('should return all posts and count when page and limit are not specified', async () => {
        const query = {
            filter: ''
        };
    
        const queryString = `?filter=${query.filter}`;
    
        const res = await testServer.get(`/posts${queryString}`)
            .set({ Authorization: `Bearer ${accessToken}` });
        
        expect(res.statusCode).toEqual(StatusCodes.OK);
        expect(Array.isArray(res.body)).toBeTruthy();
    });

    it('should return 400 error when page is invalid', async () => {
        const query = {
            page: 'invalid',
            limit: '10',
            filter: ''
        };
    
        const queryString = `?page=${query.page}&limit=${query.limit}&filter=${query.filter}`;
    
        const res = await testServer.get(`/posts${queryString}`)
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
    
        const res = await testServer.get(`/posts${queryString}`)
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
    
        const res = await testServer.get(`/posts${queryString}`)
            .set({ Authorization: `Bearer ${accessToken}` });
        let error;
        if (res.error instanceof Error && 'text' in res.error) {
            error = JSON.parse(res.error?.text);
        }
        expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        expect(JSON.stringify(error.errors.query)).toEqual('{\"page\":\"Formato digitado é invalido\",\"limit\":\"Formato digitado é invalido\"}');
    });
});
