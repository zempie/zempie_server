import { Request, Response } from 'express';
import * as _ from 'lodash';
import * as path from 'path';
import * as fs from 'fs';
import * as AWS from 'aws-sdk';
import * as formidable from 'formidable';
import * as imagemin from 'imagemin';
import * as imageminWebp from 'imagemin-webp';
import { IUser } from '../controllers/_interfaces';
import { Fields, Files, IncomingForm } from 'formidable';
import Opt from '../../config/opt';
import {getContentType} from "../commons/utils";

AWS.config.loadFromPath('config/aws/credentials.json');
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

class FileManager {
    uploadImage = async (req: any, res: Response, next: Function) => {
        try {
            const { user } = req;
            const { params, files }: any = await this.formidable(req, user);
            req.params = params;
            req.files = files;
            next();
        }
        catch(e) {
            console.error(e);
        }
    }


    private formidable = (req: Request, user: IUser) => {
        const uploadDir = path.join(__dirname, '..', '..', 'upload');
        if( !fs.existsSync(uploadDir) ) {
            fs.mkdirSync(uploadDir);
        }

        return new Promise((resolve, reject) => {
            const form = new IncomingForm({
                encoding: 'utf-8',
                uploadDir,
                keepExtensions: true,
                maxFileSize: 1024 * 1024 * 10,
                multiples: false,
            } as any);

            form.parse(req, async (err: any, fields: Fields, files: Files) => {
                console.log('fields:', fields);

                // const webps = await this.convertToWebp(_.map(files), 80);

                resolve({
                    params: fields,
                    files
                });
            })
        })
    }

    convertToWebp = async (file: any, quality = 100) => {
        const uploadDir = path.join(__dirname, '..', '..', 'upload');
        if( !fs.existsSync(uploadDir) ) {
            fs.mkdirSync(uploadDir);
        }
        const _filePath = file.path.replace(/\\/gi, '/')
        const webp = await imagemin([_filePath], {
            destination: uploadDir,
            plugins: [
                imageminWebp({ quality })
            ]
        });
        fs.unlink(file.path, (err) => {
            console.log('.jpg 삭제')
        })
        return webp;
    }


    s3upload = (Key: string, filePath: string, uid: string) => {
        return new Promise((resolve, reject) => {
            const params = {
                Bucket: `${Opt.AWS.Bucket}/${uid}/p`,
                Key,
                'ContentType': 'image/*',
                ACL: 'public-read',
                Body: fs.createReadStream(filePath),
            };
            const upload = new AWS.S3.ManagedUpload({ service: s3, params });
            upload.send((err, data) => {
                fs.unlink(filePath, (err) => {
                    console.log('.webp 삭제')
                });

                if (err) {
                    console.error(err);
                    return reject(err);
                }
                resolve(data);
            })
        })
    }

    s3upload2 = (Key: string, filePath: string, uid: string, versionPath : string ) => {
        return new Promise((resolve, reject) => {
            const params = {
                Bucket: `${Opt.AWS.Bucket}/${uid}/p/${versionPath}`,
                Key,
                ContentType: getContentType( filePath ),
                ACL: 'public-read',
                Body: fs.createReadStream(filePath),
            };
            const upload = new AWS.S3.ManagedUpload({ service: s3, params });
            upload.send((err, data) => {
                fs.unlink(filePath, (err) => {
                    console.log('.webp 삭제')
                });

                if (err) {
                    console.error(err);
                    return reject(err);
                }
                resolve(data);
            })
        })
    }
}


export default new FileManager()