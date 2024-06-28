import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Request } from 'express';
import { IMulterConfigOptions } from '../interfaces';

const getDestination = (tipo_foto: 'postagens' | 'usuarios'): string => {
    if (tipo_foto === 'usuarios') {
        return path.resolve(__dirname, '..', '..', '..', '..', 'data', 'fotos-usuarios');
    } else {
        return path.resolve(__dirname, '..', '..', '..', '..', 'data', 'capas-postagens');
    }
};

export const createMulterConfigFoto = (tipo_foto: 'postagens' | 'usuarios'): IMulterConfigOptions => {

    const storage = multer.diskStorage({
        destination: (request, file, callback) => {
            callback(null, getDestination(tipo_foto));
        },
        filename(request, file, callback) {
            crypto.randomBytes(6, (err, hash) => {
                if (err) { callback(err, 'erro'); }

                const filename = `${hash.toString('hex')}-${file.originalname}`;
                callback(null, filename);
            });
        }
    });

    const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void => {
        const allowedMimes = [
            'image/jpeg',
            'image/pjpeg',
            'image/png',
            'image/gif',
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo inválido'));
        }
    };

    return {
        dest: getDestination(tipo_foto),
        storage: storage,
        fileFilter: fileFilter,
        limits: {
            fileSize: 4 * 1024 * 1024
        }
    };
};


