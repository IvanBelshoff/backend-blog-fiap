# Backend Blog Fiap

- [Descrição do Projeto](#descrição-do-projeto)
- [Passos de Instalação](#passos-de-instalação)
- [Instruções de Uso](#instruções-de-uso)
  - [Rotas](#rotas)
    - [Permissões](#permissões)
    - [Regras](#regras)
    - [Usuários](#usuários)
    - [Postagens](#postagens)
- [Observações](#observações)
- [Principais Funcionalidades](#principais-funcionalidades)
- [Autores/Mantenedores](#autoresmantenedores)
- [Licença](#licença)

## Descrição do Projeto

Este backend disponibiliza uma API que permitirá o CRUD de posts, para servir a uma aplicação frontend. A API possui autenticação via JWT.

## Passos de Instalação

1. Crie um arquivo `.env` na raiz do projeto seguindo o exemplo: `env.exemple`.
2. Execute o comando `npm i` para instalar todas as dependências necessárias.
3. Execute o comando `npm migration:generate` para gerar a pasta `migrations` e criar a primeira migração.
4. Execute o comando `npm migration:run` para realizar a migração no banco de dados, criando as tabelas modeladas.
5. Execute o comando `npm run start` para iniciar o backend.

## Instruções de Uso

### Rotas

#### Permissões

**Criar Permissão**

- **Endpoint:** `POST /permissoes`
- **Requer:** `EnsureAuthenticated`, `Regras(['REGRA_ADMIN'])`
- **Validação:** `PermissoesController.createValidation`
- **Controlador:** `PermissoesController.create`

**Listar Todas Permissões**

- **Endpoint:** `GET /permissoes`
- **Requer:** `EnsureAuthenticated`, `Regras(['REGRA_ADMIN'])`
- **Validação:** `PermissoesController.getAllValidation`
- **Controlador:** `PermissoesController.getAll`

**Listar Permissão por ID**

- **Endpoint:** `GET /permissoes/:id`
- **Requer:** `EnsureAuthenticated`, `Regras(['REGRA_ADMIN'])`
- **Validação:** `PermissoesController.getByIdValidation`
- **Controlador:** `PermissoesController.getById`

**Atualizar Permissão por ID**

- **Endpoint:** `PUT /permissoes/:id`
- **Requer:** `EnsureAuthenticated`, `Regras(['REGRA_ADMIN'])`
- **Validação:** `PermissoesController.updateByIdValidation`
- **Controlador:** `PermissoesController.updateById`

**Deletar Permissão por ID**

- **Endpoint:** `DELETE /permissoes/:id`
- **Requer:** `EnsureAuthenticated`, `Regras(['REGRA_ADMIN'])`
- **Validação:** `PermissoesController.deleteByIdValidation`
- **Controlador:** `PermissoesController.deleteById`

#### Regras

**Criar Regra**

- **Endpoint:** `POST /regras`
- **Requer:** `EnsureAuthenticated`, `Regras(['REGRA_ADMIN'])`
- **Validação:** `RegrasController.createValidation`
- **Controlador:** `RegrasController.create`

**Listar Todas Regras**

- **Endpoint:** `GET /regras`
- **Requer:** `EnsureAuthenticated`, `Regras(['REGRA_ADMIN'])`
- **Validação:** `RegrasController.getAllValidation`
- **Controlador:** `RegrasController.getAll`

**Listar Regra por ID**

- **Endpoint:** `GET /regras/:id`
- **Requer:** `EnsureAuthenticated`, `Regras(['REGRA_ADMIN'])`
- **Validação:** `RegrasController.getByIdValidation`
- **Controlador:** `RegrasController.getById`

**Listar Regras por Usuário**

- **Endpoint:** `GET /regras/usuario/:id`
- **Requer:** `EnsureAuthenticated`, `Regras(['REGRA_ADMIN'])`
- **Validação:** `RegrasController.getRegrasByIdUserValidation`
- **Controlador:** `RegrasController.getRegrasByIdUser`

**Atualizar Regra por ID**

- **Endpoint:** `PUT /regras/:id`
- **Requer:** `EnsureAuthenticated`, `Regras(['REGRA_ADMIN'])`
- **Validação:** `RegrasController.updateByIdValidation`
- **Controlador:** `RegrasController.updateById`

**Deletar Regra por ID**

- **Endpoint:** `DELETE /regras/:id`
- **Requer:** `EnsureAuthenticated`, `Regras(['REGRA_ADMIN'])`
- **Validação:** `RegrasController.deleteByIdValidation`
- **Controlador:** `RegrasController.deleteById`

#### Usuários

**Login**

- **Endpoint:** `POST /entrar`
- **Validação:** `UsuariosController.loginValidation`
- **Controlador:** `UsuariosController.login`

**Criar Usuário**

- **Endpoint:** `POST /usuarios`
- **Requer:** `EnsureAuthenticated`, `Regras(['REGRA_USUARIO'])`, `Permissoes(['PERMISSAO_CRIAR_USUARIO'])`
- **Validação:** `UsuariosController.createValidation`
- **Controlador:** `UsuariosController.create`

**Recuperar Senha**

- **Endpoint:** `POST /recuperar`
- **Validação:** `UsuariosController.recoverPasswordValidation`
- **Controlador:** `UsuariosController.recoverPassword`

**Listar Todos Usuários**

- **Endpoint:** `GET /usuarios`
- **Requer:** `EnsureAuthenticated`, `Regras(['REGRA_USUARIO'])`
- **Validação:** `UsuariosController.getAllValidation`
- **Controlador:** `UsuariosController.getAll`

**Listar Usuário por ID**

- **Endpoint:** `GET /usuarios/:id`
- **Requer:** `EnsureAuthenticated`
- **Validação:** `UsuariosController.getByIdValidation`
- **Controlador:** `UsuariosController.getById`

**Atualizar Usuário por ID**

- **Endpoint:** `PUT /usuarios/:id`
- **Requer:** `EnsureAuthenticated`, `Regras(['REGRA_USUARIO'])`, `Permissoes(['PERMISSAO_ATUALIZAR_USUARIO'])`
- **Validação:** `UsuariosController.updateByIdValidation`
- **Controlador:** `UsuariosController.updateById`

**Atualizar Regras e Permissões do Usuário**

- **Endpoint:** `PATCH /usuarios/autenticacao/:id`
- **Requer:** `EnsureAuthenticated`, `Regras(['REGRA_ADMIN'])`
- **Validação:** `UsuariosController.updateRolesAndPermissionsByIdValidation`
- **Controlador:** `UsuariosController.updateRolesAndPermissionsById`

**Copiar Regras e Permissões de Usuário**

- **Endpoint:** `PATCH /usuarios/copy/autenticacao`
- **Requer:** `EnsureAuthenticated`, `Regras(['REGRA_ADMIN'])`
- **Validação:** `UsuariosController.copyRolesAndPermissionsByIdValidation`
- **Controlador:** `UsuariosController.copyRolesAndPermissionsById`

**Deletar Foto do Usuário**

- **Endpoint:** `DELETE /usuarios/foto/:id`
- **Requer:** `EnsureAuthenticated`, `Regras(['REGRA_USUARIO'])`, `Permissoes(['PERMISSAO_ATUALIZAR_USUARIO'])`
- **Validação:** `UsuariosController.deleteFotoByIdValidation`
- **Controlador:** `UsuariosController.deleteFotoById`

**Deletar Usuário por ID**

- **Endpoint:** `DELETE /usuarios/:id`
- **Requer:** `EnsureAuthenticated`, `Regras(['REGRA_USUARIO'])`, `Permissoes(['PERMISSAO_DELETAR_USUARIO'])`
- **Validação:** `UsuariosController.deleteByIdValidation`
- **Controlador:** `UsuariosController.deleteById`

#### Postagens

**Criar Postagem**

- **Endpoint:** `POST /posts`
- **Requer:** `EnsureAuthenticated`, `Regras(['REGRA_PROFESSOR'])`, `Permissoes(['PERMISSAO_CRIAR_POSTAGEM'])`
- **Validação:** `PostagensController.createValidation`
- **Controlador:** `PostagensController.create`

**Listar Todas Postagens**

- **Endpoint:** `GET /posts`
- **Requer:** `EnsureAuthenticated`
- **Validação:** `PostagensController.getAllValidation`
- **Controlador:** `PostagensController.getAll`

**Listar Postagem por ID**

- **Endpoint:** `GET /posts/:id`
- **Requer:** `EnsureAuthenticated`
- **Validação:** `PostagensController.getByIdValidation`
- **Controlador:** `PostagensController.getById`

**Atualizar Postagem por ID**

- **Endpoint:** `PUT /posts/:id`
- **Requer:** `EnsureAuthenticated`, `Regras(['REGRA_PROFESSOR'])`, `Permissoes(['PERMISSAO_ATUALIZAR_POSTAGEM'])`
- **Validação:** `PostagensController.updateByIdValidation`
- **Controlador:** `PostagensController.updateById`

**Deletar Postagem por ID**

- **Endpoint:** `DELETE /posts/:id`
- **Requer:** `EnsureAuthenticated`, `Regras(['REGRA_PROFESSOR'])`, `Permissoes(['PERMISSAO_DELETAR_POSTAGEM'])`
- **Validação:** `PostagensController.deleteByIdValidation`
- **Controlador:** `PostagensController.deleteById`

## Observações

No arquivo .env, atente-se à criação do seguinte termo para garantir que as regras e permissões sejam criadas corretamente:

``REGRAS_PERMISSOES={"REGRA_ADMIN":[],"REGRA_PROFESSOR":["PERMISSAO_DELETAR_POSTAGEM","PERMISSAO_ATUALIZAR_POSTAGEM", "PERMISSAO_CRIAR_POSTAGEM"],"REGRA_USUARIO":["PERMISSAO_DELETAR_USUARIO","PERMISSAO_ATUALIZAR_USUARIO", "PERMISSAO_CRIAR_USUARIO"]}``

Vale ressaltar que precisa ser criado ocupando somente 1 linha (eu sei que a linha ficará gigante, porém é necessário).

## Principais Funcionalidades
- CRUD de usuários
- CRUD de postagens
- CRUD de regras
- CRUD de permissões

## Autores/Mantenedores
- Ivan Belshoff (https://github.com/IvanBelshoff)

## Licença
- ISC

