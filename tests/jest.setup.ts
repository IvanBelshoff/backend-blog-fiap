import supertest from 'supertest';
import { server } from '../src/server/Server';
import { AppDataSource } from '../src/server/database';

beforeAll(async () =>{
    await AppDataSource.initialize();
});

afterAll(async () =>{
    await AppDataSource.destroy();
});

export const testServer = supertest(server);

