import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';

import { UsuariosProvider } from '../../models/usuarios';
import { validation } from '../../shared/middlewares';
import { JWTService, PasswordCrypto } from '../../shared/services';
import { Permissao, Regra } from '../../database/entities';
import { IBodyLoginUsuarios } from '../../shared/interfaces';

export const loginValidation = validation((getSchema) => ({
    body: getSchema<IBodyLoginUsuarios>(yup.object().shape({
        email: yup.string().required().email().min(13),
        senha: yup.string().required().min(6),
    })),
}));

export const login = async (req: Request<{}, {}, IBodyLoginUsuarios>, res: Response) => {

    const convertRegras = (regras: Regra[]): string[] => {
        return regras.map((regra) => regra.nome);
    };

    const convertPermissoes = (permissoes: Permissao[]): string[] => {
        return permissoes.map((permissao) => permissao.nome);
    };

    const { email, senha } = req.body;

    const usuario = await UsuariosProvider.getByEmail(String(email));

    if (usuario instanceof Error) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            errors: {
                default: 'E-mail ou senha são inválidos'
            }
        });
    }

    if (usuario.bloqueado == true) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            errors: {
                default: 'Usuário bloqueado'
            }
        });
    }

    if (usuario.regra?.length == 0) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            errors: {
                default: 'Usuário sem regra'
            }
        });
    }

    const passwordMatch = await PasswordCrypto.verifyPassword(String(senha), String(usuario.senha));

    if (!passwordMatch) {

        return res.status(StatusCodes.UNAUTHORIZED).json({
            errors: {
                default: 'E-mail ou senha são inválidos'
            }
        });

    } else {

        const accessToken = JWTService.sign({ uid: usuario.id });

        if (accessToken === 'JWT_SECRET_NOT_FOUND') {

            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                errors: {
                    default: 'Erro ao gerar o token de acesso'
                }
            });

        }

        const usuarioLogin = await UsuariosProvider.updateDateLogin(Number(usuario.id));

        if (usuarioLogin instanceof Error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                errors: {
                    default: usuarioLogin.message
                }
            });
        }

        return res.status(StatusCodes.OK).json({
            accessToken: accessToken,
            id: Number(usuario.id),
            regras: convertRegras(usuario.regra),
            permissoes: convertPermissoes(usuario.permissao)
        });
    }
};