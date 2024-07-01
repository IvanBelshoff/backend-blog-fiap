import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { EnsureAuthenticated, Permissoes, Regras, SalvarFoto, SalvarFotoFirebase, register } from '../shared/middlewares';
import { PermissoesController } from '../controllers/permissoes';
import { RegrasController } from '../controllers/regras';
import { UsuariosController } from '../controllers/usuarios';
import { PostagensController } from '../controllers/postagens';

const router = Router();

const fotoLocal = process.env.SALVAR_FOTO_LOCAL as unknown as Boolean;

router.get('/', (_, res) => {
    return res.status(StatusCodes.OK).send('Tudo certo');
});

router.get('/metrics', async (_, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

//Permissoes
router.post('/permissoes', EnsureAuthenticated, Regras(['REGRA_ADMIN']), PermissoesController.createValidation, PermissoesController.create);
router.get('/permissoes', EnsureAuthenticated, Regras(['REGRA_ADMIN']), PermissoesController.getAllValidation, PermissoesController.getAll);
router.get('/permissoes/:id', EnsureAuthenticated, Regras(['REGRA_ADMIN']), PermissoesController.getAllValidation, PermissoesController.getById);
router.put('/permissoes/:id', EnsureAuthenticated, Regras(['REGRA_ADMIN']), PermissoesController.updataByIdValidation, PermissoesController.updateById);
router.delete('/permissoes/:id', EnsureAuthenticated, Regras(['REGRA_ADMIN']), PermissoesController.deleteByIdValidation, PermissoesController.deleteById);

//Regras
router.post('/regras', EnsureAuthenticated, Regras(['REGRA_ADMIN']), RegrasController.createValidation, RegrasController.create);
router.get('/regras', EnsureAuthenticated, Regras(['REGRA_ADMIN']), RegrasController.getAllValidation, RegrasController.getAll);
router.get('/regras/:id', EnsureAuthenticated, Regras(['REGRA_ADMIN']), RegrasController.getByIdValidation, RegrasController.getById);
router.get('/regras/usuario/:id', EnsureAuthenticated, Regras(['REGRA_ADMIN']), RegrasController.getRegrasByIdUserValidation, RegrasController.getRegrasByIdUser);
router.put('/regras/:id', EnsureAuthenticated, Regras(['REGRA_ADMIN']), RegrasController.updataByIdValidation, RegrasController.updateById);
router.delete('/regras/:id', EnsureAuthenticated, Regras(['REGRA_ADMIN']), RegrasController.deleteByIdValidation, RegrasController.deleteById);

//Usuarios
router.post('/entrar', UsuariosController.loginValidation, UsuariosController.login);
router.post('/usuarios', EnsureAuthenticated, Regras(['REGRA_USUARIO']), Permissoes(['PERMISSAO_CRIAR_USUARIO']), String(fotoLocal) == 'true' ? SalvarFoto('usuarios') : SalvarFotoFirebase(), UsuariosController.createValidation, UsuariosController.create);
router.post('/recuperar', UsuariosController.recoverPasswordValidation, UsuariosController.recoverPassword);
router.get('/usuarios', EnsureAuthenticated, Regras(['REGRA_USUARIO']), UsuariosController.getAllValidation, UsuariosController.getAll);
router.get('/usuarios/:id', EnsureAuthenticated, UsuariosController.getByIdValidation, UsuariosController.getById);
router.put('/usuarios/:id', EnsureAuthenticated, Regras(['REGRA_USUARIO']), Permissoes(['PERMISSAO_ATUALIZAR_USUARIO']), String(fotoLocal) == 'true' ? SalvarFoto('usuarios') : SalvarFotoFirebase(), UsuariosController.updataByIdValidation, UsuariosController.updateById);
router.patch('/usuarios/autenticacao/:id', EnsureAuthenticated, Regras(['REGRA_ADMIN']), UsuariosController.updateRolesAndPermissionsByIdValidation, UsuariosController.updateRolesAndPermissionsById);
router.patch('/usuarios/copy/autenticacao', EnsureAuthenticated, Regras(['REGRA_ADMIN']), UsuariosController.copyRolesAndPermissionsByIdValidation, UsuariosController.copyRolesAndPermissionsById);
router.delete('/usuarios/foto/:id', EnsureAuthenticated, Regras(['REGRA_USUARIO']), Permissoes(['PERMISSAO_ATUALIZAR_USUARIO']), UsuariosController.deleteFotoByIdValidation, UsuariosController.deleteFotoById);
router.delete('/usuarios/:id', EnsureAuthenticated, Regras(['REGRA_USUARIO']), Permissoes(['PERMISSAO_DELETAR_USUARIO']), UsuariosController.deleteByIdValidation, UsuariosController.deleteById);

//Postagens
router.post('/posts', EnsureAuthenticated, Regras(['REGRA_PROFESSOR']), Permissoes(['PERMISSAO_CRIAR_POSTAGEM']), String(fotoLocal) == 'true' ? SalvarFoto('postagens') : SalvarFotoFirebase(), PostagensController.createValidation, PostagensController.create);
router.get('/posts', EnsureAuthenticated, PostagensController.getAllValidation, PostagensController.getAll);
router.get('/posts/:id', EnsureAuthenticated, PostagensController.getByIdValidation, PostagensController.getById);
router.put('/posts/:id', EnsureAuthenticated, Regras(['REGRA_PROFESSOR']), Permissoes(['PERMISSAO_ATUALIZAR_POSTAGEM']),String(fotoLocal) == 'true' ? SalvarFoto('postagens') : SalvarFotoFirebase(), PostagensController.updataByIdValidation, PostagensController.updateById);
router.delete('/posts/:id', EnsureAuthenticated, Regras(['REGRA_PROFESSOR']), Permissoes(['PERMISSAO_DELETAR_POSTAGEM']), PostagensController.deleteByIdValidation, PostagensController.deleteById);

export { router };