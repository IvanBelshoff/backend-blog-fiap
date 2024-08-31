import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { EnsureAuthenticated, Permissoes, Regras, SalvarFoto, SalvarFotoFirebase, register } from '../shared/middlewares';
import { PermissoesController } from '../controllers/permissoes';
import { RegrasController } from '../controllers/regras';
import { UsuariosController } from '../controllers/usuarios';
import { PostagensController } from '../controllers/postagens';

const router = Router();

const fotoLocal = process.env.SALVAR_FOTO_LOCAL as unknown as Boolean;

/**
 * @swagger
 * tags:
 *   - name: Permissoes
 *     description: Gerenciamento de permissões
 *   - name: Regras
 *     description: Gerenciamento de regras
 *   - name: Usuarios
 *     description: Gerenciamento de usuários
 *   - name: Postagens
 *     description: Gerenciamento de postagens
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Retorna uma mensagem de sucesso
 *     responses:
 *       200:
 *         description: Mensagem de sucesso
 */
router.get('/', (_, res) => {
    return res.status(StatusCodes.OK).send('Tudo certo');
});

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Retorna métricas do Prometheus
 *     responses:
 *       200:
 *         description: Métricas do Prometheus
 */
router.get('/metrics', async (_, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

//Permissoes
/**
 * @swagger
 * /permissoes:
 *   post:
 *     summary: Cria uma nova permissão
 *     tags: [Permissoes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Permissão criada com sucesso
 */
router.post('/permissoes', EnsureAuthenticated, Regras(['REGRA_ADMIN']), PermissoesController.createValidation, PermissoesController.create);

/**
 * @swagger
 * /permissoes:
 *   get:
 *     summary: Retorna todas as permissões
 *     tags: [Permissoes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de permissões
 */
router.get('/permissoes', EnsureAuthenticated, Regras(['REGRA_ADMIN']), PermissoesController.getAllValidation, PermissoesController.getAll);

/**
 * @swagger
 * /permissoes/{id}:
 *   get:
 *     summary: Retorna uma permissão pelo ID
 *     tags: [Permissoes]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detalhes da permissão
 */
router.get('/permissoes/:id', EnsureAuthenticated, Regras(['REGRA_ADMIN']), PermissoesController.getAllValidation, PermissoesController.getById);

/**
 * @swagger
 * /permissoes/{id}:
 *   put:
 *     summary: Atualiza uma permissão pelo ID
 *     tags: [Permissoes]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissão atualizada com sucesso
 */
router.put('/permissoes/:id', EnsureAuthenticated, Regras(['REGRA_ADMIN']), PermissoesController.updataByIdValidation, PermissoesController.updateById);

/**
 * @swagger
 * /permissoes/{id}:
 *   delete:
 *     summary: Deleta uma permissão pelo ID
 *     tags: [Permissoes]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissão deletada com sucesso
 */
router.delete('/permissoes/:id', EnsureAuthenticated, Regras(['REGRA_ADMIN']), PermissoesController.deleteByIdValidation, PermissoesController.deleteById);

//Regras
/**
 * @swagger
 * /regras:
 *   post:
 *     summary: Cria uma nova regra
 *     tags: [Regras]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Regra criada com sucesso
 */
router.post('/regras', EnsureAuthenticated, Regras(['REGRA_ADMIN']), RegrasController.createValidation, RegrasController.create);

/**
 * @swagger
 * /regras:
 *   get:
 *     summary: Retorna todas as regras
 *     tags: [Regras]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de regras
 */
router.get('/regras', EnsureAuthenticated, Regras(['REGRA_ADMIN']), RegrasController.getAllValidation, RegrasController.getAll);

/**
 * @swagger
 * /regras/{id}:
 *   get:
 *     summary: Retorna uma regra pelo ID
 *     tags: [Regras]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detalhes da regra
 */
router.get('/regras/:id', EnsureAuthenticated, Regras(['REGRA_ADMIN']), RegrasController.getByIdValidation, RegrasController.getById);

/**
 * @swagger
 * /regras/usuario/{id}:
 *   get:
 *     summary: Retorna as regras de um usuário pelo ID
 *     tags: [Regras]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Regras do usuário
 */
router.get('/regras/usuario/:id', EnsureAuthenticated, Regras(['REGRA_ADMIN']), RegrasController.getRegrasByIdUserValidation, RegrasController.getRegrasByIdUser);

/**
 * @swagger
 * /regras/{id}:
 *   put:
 *     summary: Atualiza uma regra pelo ID
 *     tags: [Regras]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Regra atualizada com sucesso
 */
router.put('/regras/:id', EnsureAuthenticated, Regras(['REGRA_ADMIN']), RegrasController.updataByIdValidation, RegrasController.updateById);

/**
 * @swagger
 * /regras/{id}:
 *   delete:
 *     summary: Deleta uma regra pelo ID
 *     tags: [Regras]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Regra deletada com sucesso
 */
router.delete('/regras/:id', EnsureAuthenticated, Regras(['REGRA_ADMIN']), RegrasController.deleteByIdValidation, RegrasController.deleteById);

//Usuarios
/**
 * @swagger
 * /entrar:
 *   post:
 *     summary: Autentica um usuário
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Autenticação realizada com sucesso
 */
router.post('/entrar', UsuariosController.loginValidation, UsuariosController.login);

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               senha:
 *                 type: string
 *                 format: password
 *               id_copy_regras:
 *                 type: number
 *             required:
 *               - nome
 *               - email
 *               - senha
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 */
router.post('/usuarios', EnsureAuthenticated, Regras(['REGRA_USUARIO']), Permissoes(['PERMISSAO_CRIAR_USUARIO']), String(fotoLocal) == 'true' ? SalvarFoto('usuarios') : SalvarFotoFirebase(), UsuariosController.createValidation, UsuariosController.create);

/**
 * @swagger
 * /recuperar:
 *   post:
 *     summary: Recupera a senha do usuário
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Solicitação de recuperação de senha realizada com sucesso
 */
router.post('/recuperar', UsuariosController.recoverPasswordValidation, UsuariosController.recoverPassword);

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Retorna todos os usuários
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
router.get('/usuarios', EnsureAuthenticated, Regras(['REGRA_USUARIO']), UsuariosController.getAllValidation, UsuariosController.getAll);

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Retorna um usuário pelo ID
 *     tags: [Usuarios]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detalhes do usuário
 */
router.get('/usuarios/:id', EnsureAuthenticated, UsuariosController.getByIdValidation, UsuariosController.getById);

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Atualiza um usuário pelo ID
 *     tags: [Usuarios]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 */
router.put('/usuarios/:id', EnsureAuthenticated, Regras(['REGRA_USUARIO']), Permissoes(['PERMISSAO_ATUALIZAR_USUARIO']), String(fotoLocal) == 'true' ? SalvarFoto('usuarios') : SalvarFotoFirebase(), UsuariosController.updataByIdValidation, UsuariosController.updateById);

/**
 * @swagger
 * /usuarios/autenticacao/{id}:
 *   patch:
 *     summary: Atualiza as permissões de autenticação do usuário pelo ID
 *     tags: [Usuarios]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissões de autenticação atualizadas com sucesso
 */
router.patch('/usuarios/autenticacao/:id', EnsureAuthenticated, Regras(['REGRA_ADMIN']), UsuariosController.updateRolesAndPermissionsByIdValidation, UsuariosController.updateRolesAndPermissionsById);

/**
 * @swagger
 * /usuarios/copy/autenticacao:
 *   patch:
 *     summary: Copia as permissões de autenticação de um usuário para outro
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissões de autenticação copiadas com sucesso
 */
router.patch('/usuarios/copy/autenticacao', EnsureAuthenticated, Regras(['REGRA_ADMIN']), UsuariosController.copyRolesAndPermissionsByIdValidation, UsuariosController.copyRolesAndPermissionsById);

/**
 * @swagger
 * /usuarios/foto/{id}:
 *   delete:
 *     summary: Deleta a foto de um usuário pelo ID
 *     tags: [Usuarios]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Foto deletada com sucesso
 */
router.delete('/usuarios/foto/:id', EnsureAuthenticated, Regras(['REGRA_USUARIO']), Permissoes(['PERMISSAO_ATUALIZAR_USUARIO']), UsuariosController.deleteFotoByIdValidation, UsuariosController.deleteFotoById);

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Deleta um usuário pelo ID
 *     tags: [Usuarios]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
 */
router.delete('/usuarios/:id', EnsureAuthenticated, Regras(['REGRA_USUARIO']), Permissoes(['PERMISSAO_DELETAR_USUARIO']), UsuariosController.deleteByIdValidation, UsuariosController.deleteById);

//Postagens
/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Cria uma nova postagem
 *     tags: [Postagens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Postagem criada com sucesso
 */
router.post('/posts', EnsureAuthenticated, Regras(['REGRA_PROFESSOR']), Permissoes(['PERMISSAO_CRIAR_POSTAGEM']), String(fotoLocal) == 'true' ? SalvarFoto('postagens') : SalvarFotoFirebase(), PostagensController.createValidation, PostagensController.create);

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Retorna todas as postagens
 *     tags: [Postagens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de postagens
 */
router.get('/posts', PostagensController.getAllValidation, PostagensController.getAll);

/**
 * @swagger
 * /posts/logged:
 *   get:
 *     summary: Retorna todas as postagens
 *     tags: [Postagens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de postagens
 */
router.get('/posts/logged', EnsureAuthenticated, Regras(['REGRA_PROFESSOR']),  PostagensController.getAllValidation, PostagensController.getAllLogged);

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Retorna todas as postagens que contenham o termo enviado via query string em search
 *     tags: [Postagens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de postagens
 */
router.get('/posts/search', PostagensController.searchPostsValidation, PostagensController.search);

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Retorna uma postagem pelo ID
 *     tags: [Postagens]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detalhes da postagem
 */
router.get('/posts/:id', PostagensController.getByIdValidation, PostagensController.getById);

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Atualiza uma postagem pelo ID
 *     tags: [Postagens]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Postagem atualizada com sucesso
 */
router.put('/posts/:id', EnsureAuthenticated, Regras(['REGRA_PROFESSOR']), Permissoes(['PERMISSAO_ATUALIZAR_POSTAGEM']),String(fotoLocal) == 'true' ? SalvarFoto('postagens') : SalvarFotoFirebase(), PostagensController.updataByIdValidation, PostagensController.updateById);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Deleta uma postagem pelo ID
 *     tags: [Postagens]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Postagem deletada com sucesso
 */
router.delete('/posts/:id', EnsureAuthenticated, Regras(['REGRA_PROFESSOR']), Permissoes(['PERMISSAO_DELETAR_POSTAGEM']), PostagensController.deleteByIdValidation, PostagensController.deleteById);

export { router };
