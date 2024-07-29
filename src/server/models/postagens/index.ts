import * as Create from './Create';
import * as ValidaEmailUsuario from './ValidaCamposPostagens';
import * as DeleteById from './DeleteById';
import * as GetAll from './GetAll';
import * as Count from './Count';
import * as GetById from './GetById';
import * as UpdateById from './UpdateById';
import * as Search from './Search';

export const PostagensProvider = {
    ...ValidaEmailUsuario,
    ...Create,
    ...DeleteById,
    ...GetAll,
    ...Count,
    ...GetById,
    ...UpdateById,
    ...Search
};