import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Backend-Blog-Fiap',
            version: '1.0.0',
            description: 'Backend para um blog, instituição fiap',
        },
        servers: [
            {
                url: process.env.URL,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: [path.resolve(__dirname, '..', '..', 'routes', 'index.ts')], // Caminho para os arquivos que contêm comentários JSDoc
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec };
