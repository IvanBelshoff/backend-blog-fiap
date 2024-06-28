import { bucket } from './firebase'; // Certifique-se de ajustar o caminho se necessário

export const DeleteArquivoFirebase = async (path: string, filename: string): Promise<void | Error> => {
    try {
        console.log(path);
        console.log(filename);
        // Verifica se o arquivo é 'profile.jpg', caso seja, não permite a exclusão
        if (filename === 'profile.jpg') {
            console.log('\nFoto padrão não pode ser excluída no firebase');
            return;
        }



        // Referência ao arquivo no bucket
        const file = bucket.file(filename);

        // Verifica se o arquivo existe
        const [exists] = await file.exists();

        if (!exists) {
            console.log('\nFoto original não foi localizada');
            return;
        }

        // Tenta excluir o arquivo
        await file.delete();

        console.log('\nFoto original foi excluída do Firebase Storage');

    } catch (error) {
        console.error('Erro ao tentar excluir o arquivo do Firebase Storage:', error);
        return new Error(`Erro ao tentar excluir o arquivo: ${error}`);
    }
};
