import * as Create from './Create';
import * as CreateNoFile from './CreateNoFile';
import * as UpdateByid from './UpdateByid';
import * as DeleteById from './DeleteById';
import * as DeleteByFilename from './DeleteByFilename';

export const FotosProvider = {
    ...Create,
    ...CreateNoFile,
    ...UpdateByid,
    ...DeleteById,
    ...DeleteByFilename
};