import 'reflect-metadata';

import { server } from './server/Server';
import { AppDataSource } from './server/database';
import { RegrasEPermissoes, UserDefault } from './server/shared/services';

AppDataSource.initialize().then(async () => {

    // eslint-disable-next-line quotes
    console.log(`\nBanco de dados conectado\n`);

    server.listen(process.env.PORT, async () => {
        await RegrasEPermissoes();
        await UserDefault();
        //await ArquivoProfile();
        console.log(`Servidor rodando no endereço: http://${process.env.HOST}:${process.env.PORT}\n`);
    });

}).catch((error) => {

    console.log(error);

    if (error.code == String('3D000')) {
        console.log(error);
    }
});
