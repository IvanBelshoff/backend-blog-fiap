import { IEmailValidaEmailUsuario } from '../../shared/interfaces';
import { usuarioRepository } from '../../database/repositories';

export const validaEmailUsuario = async (email: string, id?: number): Promise<string> => {
    try {
        if (id) {
            const usuarioUpdate = await usuarioRepository.findOne({
                where: {
                    id: id
                }
            });

            const usuarioCadastrado = await usuarioRepository.findAndCount({
                where: [
                    { email: email }
                ]
            });

            const camposDuplicados = usuarioCadastrado[0].filter(usuario => usuario.email == email && usuario.email != usuarioUpdate?.email);

            if (camposDuplicados.length > 0) {
                return 'Já existe usuário com este E-mail.';
            }

            if (usuarioCadastrado[1] > 0 && camposDuplicados.length > 0) {
                return 'Usuário já cadastrado com essas informações.';
            }
        } else {
            const usuarioCadastrado = await usuarioRepository.findAndCount({
                where: [
                    { email: email }
                ]
            });

            const camposDuplicados = usuarioCadastrado[0].filter(usuario => usuario.email == email);

            if (camposDuplicados.length > 0) {
                return 'Já existe usuário com este E-mail.';
            }

            if (usuarioCadastrado[1] > 0 && camposDuplicados.length > 0) {
                return 'Usuário já cadastrado com essas informações.';
            }
        }

        return ''; // Retorna string vazia quando não há erros
    } catch (error) {
        console.log(error);
        return 'Erro ao verificar o e-mail'; // Retorna mensagem de erro genérica
    }
};
