import 'dotenv/config';
import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';


const port = process.env.DB_PORT as unknown as number;
const host = process.env.DB_HOST;

const options_db_nuvem: DataSourceOptions & SeederOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: port,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: true,
    extra: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    entities: [`${__dirname}/**/entities/*.{ts,js}`],
    migrations: [`${__dirname}/**/migrations/*.{ts,js}`],
};

const options_db_local: DataSourceOptions & SeederOptions = {
    type: 'postgres',
    host: process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'localhost' ? 'localhost': process.env.DB_HOST,
    port: process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'localhost' ? 5436 : port,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: true,
    entities: [`${__dirname}/**/entities/*.{ts,js}`],
    migrations: [`${__dirname}/**/migrations/*.{ts,js}`],
    seeds: ['src/server/database/seeds/**/*{.ts,.js}'],
    seedTracking: false,
    factories: ['src/server/database/factories/**/*{.ts,.js}'],
};

const selectedOptions = (host === 'database' || host === 'localhost') ? options_db_local : options_db_nuvem;

export const AppDataSource = new DataSource(selectedOptions);

export const initializeDatabase = async () => {
    try {
        const initialOptions = { ...selectedOptions, database: process.env.DB_NAME };
        const initialDataSource = new DataSource(initialOptions);
        if (process.env.NODE_ENV !== 'test') {
            // Conectar ao banco de dados padrão 'postgres' para verificar/criar o banco de dados
            await initialDataSource.initialize();
            const databaseExists = await checkDatabaseExists(initialDataSource);

            if (!databaseExists) {
                await createDatabase(initialDataSource);
            }
                    
            await initialDataSource.destroy(); // Fechar a conexão inicial
            // Conectar ao banco de dados específico
            await AppDataSource.initialize();
        } else {
            initialDataSource.initialize();
        }
        
    } catch (error) {
        console.error('Erro ao inicializar a conexão com o banco de dados:', error);
        throw error as Error
    }
};

const checkDatabaseExists = async (dataSource: DataSource): Promise<boolean> => {
    const { database } = selectedOptions;

    const checkDatabaseQuery = `
        SELECT 1
        FROM pg_database
        WHERE datname = '${database}'
    `;

    try {
        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();
        const result = await queryRunner.query(checkDatabaseQuery);
        await queryRunner.release();
        console.log("checkDatabaseExists >>> result: ", result)
        return result.length > 0;
    } catch (error) {
        console.error('Erro ao verificar a existência do banco de dados:', error);
        return false;
    }
};

const createDatabase = async (dataSource: DataSource): Promise<void> => {
    const { database } = selectedOptions;

    const createDatabaseQuery = `CREATE DATABASE ${database}`;

    try {
        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.query(createDatabaseQuery);
        await queryRunner.release();
        console.log(`Banco de dados '${database}' criado com sucesso.`);
    } catch (error) {
        console.error('Erro ao criar o banco de dados:', error);
    }
};
