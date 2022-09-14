import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import multerS3 from 'multer-s3';
import aws from 'aws-sdk';
const storage_type = process.env.STORAGE_TYPE as "local" | "s3";
const storageTypes = {
    local: multer.diskStorage({
        destination: (req, file, cb) => { cb(null, path.resolve(__dirname, '..', 'tmp', 'uploads')) },
        filename: (req, file: any, cb) => { 
            crypto.randomBytes(16, (err, hash) => {
                if(err) throw new Error('Erro ao gerar hash');
                file.key = `${hash.toString('hex')}-${file.originalname}`
                file.location = `${process.env.APP_URL}/files/${file.key}`
                cb(null, file.key);
            })
        },
    }),
    s3: multerS3({
        s3: new aws.S3() as any,
        bucket: process.env.AWS_BUCKET || "",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        key: (req, file, cb) => {
            crypto.randomBytes(16, (err, hash) => {
                if(err) throw new Error('Erro ao gerar hash');
                const fileName = `${hash.toString('hex')}-${file.originalname}`
                cb(null, fileName);
            })
        }
    })

}

export default {
    dest: path.resolve(__dirname, '..', 'tmp', 'uploads'),
    storage: storageTypes['local'],
    limits: {
        fileSize: 3 * 1024 * 1024,
    },
    fileFilter: (req: any, file: any, cb: any) => {
        const allowedMimes = [
            'image/jpeg',
            'image/pjpeg',
            'image/png',
            'image/gif',
        ];
        if (!allowedMimes.includes(file.mimetype)) {
            cb(new Error('Invalid file type.'));
            //throw new Error('Invalid file type');
        }

        cb(null, true);
    }
}