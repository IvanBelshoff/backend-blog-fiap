import { bucket } from './firebase'; // Importando o bucket do Firebase
import * as fs from 'fs'; // Importando o módulo fs para manipulação de arquivos
import * as path from 'path'; // Importando o módulo path para manipulação de caminhos

export async function ArquivoProfile() {

    const fotoLocal = process.env.SALVAR_FOTO_LOCAL as unknown as Boolean;

    if (String(fotoLocal) == 'false') {
        // Verificando se o arquivo "profile.jpg" existe no storage
        const file = bucket.file('profile.jpg');
        const [exists] = await file.exists();

        if (!exists) {
            // Se o arquivo não existir, vamos enviá-lo para o storage
            try {
                // Caminho completo do arquivo local
                const localFilePath = path.resolve(__dirname, '..', '..', 'shared', 'data', 'default\\profile.jpg');

                // Criar um stream de escrita para o Firebase Storage
                const remoteWriteStream = file.createWriteStream({
                    metadata: {
                        contentType: 'image/jpeg', // Especifique o tipo de conteúdo do arquivo
                    },
                });

                // Lendo o arquivo local e escrevendo-o no stream do Firebase Storage
                const localReadStream = fs.createReadStream(localFilePath);
                localReadStream.pipe(remoteWriteStream);

                // Manipulando eventos de sucesso e erro
                remoteWriteStream.on('error', (error) => {
                    return console.log('Erro ao enviar o arquivo "profile.jpg" para o Firebase Storage:', error);
                });
                remoteWriteStream.on('finish', () => {
                    return console.log('Arquivo "profile.jpg" enviado com sucesso para o Firebase Storage.\n');
                });
            } catch (error) {
                return console.log('Erro ao enviar o arquivo "profile.jpg" para o Firebase Storage:', error);
            }
        } else {
            return console.log('Arquivo "profile.jpg" já existe no Firebase Storage.\n');
        }
    }


}
