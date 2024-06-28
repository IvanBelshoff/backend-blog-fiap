import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';


import { UsuariosProvider } from '../../models/usuarios';
import { validation } from '../../shared/middlewares';
import { deliveryMailPassword, generatePassword } from '../../shared/services';
import { IBodyCreateUsuarios, IBodyRecoverPasswordUsuarios, IQueryRecoverPasswordUsuarios } from '../../shared/interfaces';


export const recoverPasswordValidation = validation((getSchema) => ({
    body: getSchema<IBodyRecoverPasswordUsuarios>(yup.object().shape({
        emailRecuperacao: yup.string().required().email().min(5)
    })),
    query: getSchema<IQueryRecoverPasswordUsuarios>(yup.object().shape({
        tipo: yup.string().oneOf(['capitalizado', 'minusculo', 'maiusculo'], 'Tipo invalido').optional(),
        caracteres: yup.number().optional(),
        cumprimento: yup.number().optional(),
        tema: yup.string().oneOf(['aleatorios', 'cidades', 'paises', 'tecnologias'], 'Tema invalido').optional(),
        numeros: yup.number().optional(),
    }))
}));

export const recoverPassword = async (req: Request<{}, {}, IBodyRecoverPasswordUsuarios, IQueryRecoverPasswordUsuarios>, res: Response) => {

    //Verifico se o usuário com o e-mail informado existe na base de dados.
    const usuario = await UsuariosProvider.getByEmail(req.body.emailRecuperacao);

    if (usuario instanceof Error) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            errors: {
                default: usuario.message
            }
        });
    }

    //Verifico se o usuário com o e-mail informado existe na base de dados.
    const bloqueado = await UsuariosProvider.getStatusCount(usuario.email);

    if (bloqueado instanceof Error) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            errors: {
                default: bloqueado.message
            }
        });
    }

    const dataPassword: IQueryRecoverPasswordUsuarios = {
        caracteres: req.query.caracteres,
        cumprimento: req.query.cumprimento,
        numeros: req.query.numeros,
        tema: req.query.tema,
        tipo: req.query.tipo,
    };

    //Chamo a função abaixo, para gerar a senha, passando os parâmetros.
    const senha = await generatePassword(dataPassword);

    if (senha instanceof Error) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            errors: {
                default: senha.message
            }
        });
    }

    const usuarioPassword: IBodyCreateUsuarios = {
        email: usuario.email,
        nome: usuario.nome,
        senha: senha,
        sobrenome: usuario.sobrenome,
        bloqueado: usuario.bloqueado
    };

    //Chamo a função abaixo, realizar a atualização no banco de dados.
    const result = await UsuariosProvider.updateById(usuario.id, usuarioPassword);

    if (result instanceof Error) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            errors: {
                default: result.message
            }
        });
    }

    //Chamo a função abaixo, realizar o envio do e-mail com a nova senha.
    const emailDelivery = await deliveryMailPassword(String(usuario.email), senha);

    if (emailDelivery instanceof Error) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            errors: {
                default: emailDelivery.message
            }
        });
    }

    return res.status(StatusCodes.OK).json();

};