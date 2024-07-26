import * as Create from './Create';
import * as DeleteById from './DeleteById';
import * as GetAll from './GetAll';
import * as GetById from './GetById';
import * as UpdateById from './UpdateById';
import * as Search from './Search';

export const PostagensController = {
    ...Create,
    ...DeleteById,
    ...GetAll,
    ...GetById,
    ...UpdateById,
    ...Search
};