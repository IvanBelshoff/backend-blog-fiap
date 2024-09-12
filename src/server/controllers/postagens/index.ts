import * as Create from './Create';
import * as DeleteById from './DeleteById';
import * as GetAll from './GetAll';
import * as GetAllLogged from './GetAllLogged';
import * as GetById from './GetById';
import * as UpdateById from './UpdateById';
import * as Search from './Search';
import * as DeleteCapaById from './DeleteCapaById';

export const PostagensController = {
    ...Create,
    ...DeleteById,
    ...GetAll,
    ...GetAllLogged,
    ...GetById,
    ...UpdateById,
    ...Search,
    ...DeleteCapaById
};