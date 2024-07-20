import 'reflect-metadata';
import { server } from './server/Server';
import { AppDataSource, initializeDatabase } from './server/database';
import { ArquivoProfile, RegrasEPermissoes, UserDefault } from './server/shared/services';

async function main() {
    console.log("main >>> process.env.REGRAS_PERMISSOES: ", process.env.REGRAS_PERMISSOES)
    try {
        await initializeDatabase();

        console.log(`\nBanco de dados conectado\n`);

        server.listen(process.env.PORT, async () => {
            await RegrasEPermissoes();
            await UserDefault();
            await ArquivoProfile();
            console.log(`Servidor rodando no endereço: http://${process.env.HOST}:${process.env.PORT}\n`);
        });
    } catch (error) {
        console.error('Erro ao inicializar a aplicação:', error);
    }
}

main();
