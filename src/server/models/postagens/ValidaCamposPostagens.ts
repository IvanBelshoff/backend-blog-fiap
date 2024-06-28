import { IEmailValidaEmailUsuario } from '../../shared/interfaces';
import { postagemRepository } from '../../database/repositories';

export const validaCamposPostagens = async (titulo: string, id?: number): Promise<void | Error> => {

    try {

        if (id) {

            const postagemUpdate = await postagemRepository.findOne({
                where: {
                    id: id
                }
            });

            const postagemCasdastrada = await postagemRepository.findAndCount({
                where: [
                    { titulo: titulo }
                ]
            });

            const propriedades: IEmailValidaEmailUsuario = {};

            const camposDuplicados = postagemCasdastrada[0].filter(usuario => usuario.titulo == titulo && usuario.titulo != postagemUpdate?.titulo);

            if (camposDuplicados.length > 0) {
                if (camposDuplicados.some(usuario => usuario.titulo === titulo)) {
                    propriedades.email = 'Já existe postagem com este titulo.';
                }
            }

            if (postagemCasdastrada[1] > 0 && postagemCasdastrada[0].filter(usuario => usuario.titulo == titulo && usuario.titulo != postagemUpdate?.titulo).length > 0) {

                const erro = {
                    default: 'Postagem já cadastrada com essas informações.',
                    body: propriedades
                };

                return new Error(JSON.stringify(erro));
            }
        } else {
            const postagemCasdastrada = await postagemRepository.findAndCount({
                where: [
                    { titulo: titulo }
                ]
            });

            const propriedades: IEmailValidaEmailUsuario = {};

            const camposDuplicados = postagemCasdastrada[0].filter(usuario => usuario.titulo == titulo);

            if (camposDuplicados.length > 0) {
                if (camposDuplicados.some(usuario => usuario.titulo === titulo)) {
                    propriedades.email = 'Já existe postagem com este titulo.';
                }
            }

            if (postagemCasdastrada[1] > 0 && postagemCasdastrada[0].filter(usuario => usuario.titulo == titulo).length > 0) {

                const erro = {
                    default: 'Postagem já cadastrada com essas informações.',
                    body: propriedades
                };

                return new Error(JSON.stringify(erro));
            }
        }


    } catch (error) {
        console.log(error);
        return new Error('Erro ao verificar o e-mail');
    }
};