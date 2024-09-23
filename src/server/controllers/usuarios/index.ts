import * as Login from './Login';
import * as Create from './Create';
import * as GetAll from './GetAll';
import * as GetById from './GetById';
import * as RecoverPassword from './RecoverPassword';
import * as UpdateById from './UpdateById';
import * as DeleteFotoById from './DeleteFotoById';
import * as UpdateRolesAndPermissionsById from './UpdateRolesAndPermissionsById';
import * as DeleteById from './DeleteById';
import * as CopyRolesAndPermissionsById from './CopyRolesAndPermissionsById';
import * as UpdatePasswordById from './UpdatePasswordById';

export const UsuariosController = {
    ...Login,
    ...Create,
    ...GetAll,
    ...RecoverPassword,
    ...UpdateById,
    ...DeleteFotoById,
    ...UpdateRolesAndPermissionsById,
    ...GetById,
    ...DeleteById,
    ...CopyRolesAndPermissionsById,
    ...UpdatePasswordById
};