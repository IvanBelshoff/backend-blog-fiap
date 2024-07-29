import { StatusCodes } from 'http-status-codes';
import { testServer } from '../jest.setup';
import { Postagem } from '../../src/server/database/entities';

let accessToken: string = '';
let allPosts: Postagem[] = [];
let searchTerm: string = '';

describe('searchPosts', () => {

    beforeAll(async () => {
        const loginUserDefault = await testServer.post('/entrar').send({
            senha: process.env.SENHA_USER_DEFAULT,
            email: process.env.EMAIL_USER_DEFAULT,
        });
        accessToken = loginUserDefault.body.accessToken;

        const query = {
            page: '1',
            limit: '10',
            filter: ''
        };
    
        const queryString = `?page=${query.page}&limit=${query.limit}&filter=${query.filter}`;
    
        const resGetAll = await testServer.get(`/posts${queryString}`)
            .set({ Authorization: `Bearer ${accessToken}` });

        allPosts = resGetAll.body;

        const firstPost = allPosts[0];
        if (firstPost) {
            searchTerm = firstPost.titulo.split(' ')[0] || firstPost.conteudo.split(' ')[0];
        }
    });

    it('should return posts matching the search term in title or content', async () => {
        const query = {
            search: searchTerm
        };

        const queryString = `?search=${query.search}`;

        const res = await testServer.get(`/posts/search${queryString}`)
            .set({ Authorization: `Bearer ${accessToken}` });

        expect(res.statusCode).toEqual(StatusCodes.OK);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
        res.body.forEach((post: Postagem) => {
            const titleContainsSearchTerm = post.titulo.toLowerCase().includes(query.search.toLowerCase());
            const contentContainsSearchTerm = post.conteudo.toLowerCase().includes(query.search.toLowerCase());
            expect(titleContainsSearchTerm || contentContainsSearchTerm).toBeTruthy();
        });
    });

    it('should return empty array when no posts match the search term', async () => {
        const query = {
            search: 'nonexistentterm'
        };

        const queryString = `?search=${query.search}`;

        const res = await testServer.get(`/posts/search${queryString}`)
            .set({ Authorization: `Bearer ${accessToken}` });

        expect(res.statusCode).toEqual(StatusCodes.OK);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(0);
    });

    it('should return 400 error when search term is not provided', async () => {
        const query = {};

        const queryString = '';

        const res = await testServer.get(`/posts/search${queryString}`)
            .set({ Authorization: `Bearer ${accessToken}` });

        let error;
        if (res.error instanceof Error && 'text' in res.error) {
            error = JSON.parse(res.error?.text);
        }

        expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        expect(JSON.stringify(error.errors.query)).toEqual('{"search":"Search term is required"}');
    });

    it('should return 400 error when search term is invalid', async () => {
        const query = {
            search: ''
        };

        const queryString = `?search=${query.search}`;

        const res = await testServer.get(`/posts/search${queryString}`)
            .set({ Authorization: `Bearer ${accessToken}` });

        let error;
        if (res.error instanceof Error && 'text' in res.error) {
            error = JSON.parse(res.error?.text);
        }

        expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        expect(JSON.stringify(error.errors.query)).toEqual('{"search":"Search term is required"}');
    });
});
