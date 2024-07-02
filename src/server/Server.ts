import 'dotenv/config';
import cors from 'cors';
import 'reflect-metadata';
import morgan from 'morgan';
import express from 'express';
import bodyParser from 'body-parser';
import expressPromBundle from 'express-prom-bundle';
import swaggerUi from 'swagger-ui-express';
import redoc from 'redoc-express';

import './shared/services/TranslationsYup';
import { router } from './routes';
import path from 'path';
import { swaggerSpec } from './shared/middlewares';

const server = express();

const metricsMiddleware = expressPromBundle({
    includeMethod: true,
    includePath: true,
    customLabels: { project_name: 'Backend-Blog-fiap', project_type: 'blog' },
    promClient: { collectDefaultMetrics: {} },
});

const redocOptions = {
    title: 'Backend-Blog-Fiap',
    specUrl: '/api-json'
};

server.use(express.json());
server.use(metricsMiddleware);
server.disable('etag');
server.use(morgan('dev'));
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.use((req, res, next) => {

    server.use(cors());

    /*
    server.use(cors({
        origin:'https://.google.com'
    }));*/

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).send({});
    }
    next();
});

server.use('/profile', express.static(path.resolve(__dirname, 'shared', 'data', 'default')));

server.use('/uploads/fotos/usuarios', express.static(path.resolve(__dirname, '..', '..', 'data', 'fotos-usuarios')));
server.use('/uploads/capas/postagens', express.static(path.resolve(__dirname, '..', '..', 'data', 'capas-postagens')));

// Serve the Swagger spec as JSON
server.get('/api-json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Serve the Swagger UI
server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve the Redoc UI
server.use('/redoc', redoc(redocOptions));

server.use(router);

export { server };
