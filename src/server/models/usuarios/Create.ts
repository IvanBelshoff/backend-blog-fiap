import { fotoRepository } from '../../database/repositories/fotoRepository';
import { usuarioRepository } from '../../database/repositories';
import { IBodyCreateUsuarios } from '../../shared/interfaces';
import { PasswordCrypto } from '../../shared/services';
import { Permissao, Regra } from '../../database/entities';

interface IFoto extends IBodyCreateUsuarios {
    id_foto?: number; // tornando opcional para tratamento mais flexível
    id_copy_regras?: number;
}

const findPhotoById = async (id?: number) => {
    if (!id) return undefined;

    return await fotoRepository.findOne({
        where: {
            id: id
        }
    });
};

const findUserCopyInfo = async (id?: number) => {
    if (!id) {
        return { regras: [], permissoes: [] };
    }

    const usuarioCopiado = await usuarioRepository.findOne({
        relations: {
            regra: true,
            permissao: true
        },
        where: {
            id: id
        }
    });

    if (!usuarioCopiado) {
        throw new Error('Usuário copiado não localizado');
    }

    return {
        regras: usuarioCopiado.regra || [],
        permissoes: usuarioCopiado.permissao || []
    };
};

export const create = async (usuario: IFoto): Promise<number | Error> => {
    try {
        const { id_foto, id_copy_regras } = usuario;

        const hashedPassword = await PasswordCrypto.hashPassword(String(usuario.senha));
        
        // Encontra a foto cadastrada, se houver
        const fotoCadastrada = await findPhotoById(id_foto);

        // Obtém informações de regras e permissões do usuário copiado, se houver
        const { regras, permissoes } = await findUserCopyInfo(id_copy_regras);

        const newUsuario = usuarioRepository.create({
            ...usuario,
            senha: hashedPassword,
            regra: regras,
            permissao: permissoes,
            usuario_atualizador: usuario.usuario_atualizador,
            usuario_cadastrador: usuario.usuario_cadastrador,
            foto: fotoCadastrada || undefined // evita atribuir null em caso de não encontrar foto
        });

        const result = await usuarioRepository.save(newUsuario);

        if (typeof result === 'object' && result.id) {
            return result.id;
        }

        throw new Error('Erro ao cadastrar o registro');

    } catch (error) {
        console.error(error);
        throw new Error(error instanceof Error ? error.message : '');
    }
};
