import { postagemRepository } from '../../database/repositories';
import { FotosProvider } from '../fotos';
import { Foto } from '../../database/entities';
import { IBodyUpdatePostagens } from '../../shared/interfaces';

export const updateById = async (id: number, postagem: IBodyUpdatePostagens, foto?: Omit<Foto, 'id' | 'data_atualizacao' | 'data_criacao' | 'usuario' | 'postagem' | 'url'>): Promise<void | Error> => {

    try {

        if (foto) {

            console.log(foto);

            const updateFoto = FotosProvider.updateById(id, 'postagens', 'atualizar', foto);

            if (updateFoto instanceof Error) {
                return new Error(updateFoto.message);
            }
        }

        const postagemCadastrada = await postagemRepository.findOne({
            where: {
                id: id
            }
        });

        if (!postagemCadastrada) {
            return new Error('Funcionario não localizado');
        }

        const {
            titulo = postagem.titulo || postagemCadastrada.titulo,
            conteudo = postagem.conteudo || postagemCadastrada.conteudo,
            usuario_atualizador = postagem.usuario_atualizador || postagemCadastrada.usuario_atualizador,
        } = postagem;

        postagemCadastrada.titulo = titulo,
        postagemCadastrada.conteudo = conteudo,
        postagemCadastrada.usuario_atualizador = usuario_atualizador;

        const atualizaPostagem = await postagemRepository.save(postagemCadastrada);

        if (atualizaPostagem instanceof Error) {
            return new Error(atualizaPostagem.message);
        }

        return;

    } catch (error) {
        console.log(error);
        return new Error('Erro ao atualizar o registro');
    }
};