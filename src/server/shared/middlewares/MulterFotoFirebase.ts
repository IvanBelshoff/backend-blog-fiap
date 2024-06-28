
import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { bucket } from '../services';
import { IMulterConfigOptions } from '../interfaces';
import multer from 'multer';


const generateFileName = (originalName: string): string => {
    const hash = crypto.randomBytes(6).toString('hex');
    return `${hash}-${originalName}`;
};

export const uploadToFirebase = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.file) {
        return next();
    }

    const newFileName = generateFileName(req.file.originalname);
    const blob = bucket.file(newFileName);
    const blobStream = blob.createWriteStream({
        metadata: {
            contentType: req.file.mimetype,
        },
    });

    blobStream.on('error', (err) => {
        console.log(err);
        res.status(500).send({ error: err.message });
    });

    blobStream.on('finish', () => {
        
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        if (req.file) {
            req.file.filename = newFileName; // Atualiza o filename no req.file
            req.file.path = publicUrl; // Atualiza o path com a URL pública do Firebase
        }
        next();
    });

    blobStream.end(req.file.buffer);
};

export const createMulterConfigFotoFirebase = (): IMulterConfigOptions => {
    const storage = multer.memoryStorage();

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

    const limits = {
        fileSize: 4 * 1024 * 1024, // Limite de tamanho do arquivo
    };

    return {
        dest: '',
        storage: storage,
        fileFilter: fileFilter,
        limits: limits,
    };
};