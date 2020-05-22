import { Request, Response } from "express";
import * as _ from 'lodash';
import * as path from "path";
import * as fs from "fs";
import AWS from 'aws-sdk';
import * as formidable from 'formidable';
import * as imagemin from 'imagemin';
import * as imageminWebp from 'imagemin-webp';
import { IUser } from "../controllers/_interfaces";
import { Fields, Files, IncomingForm } from "formidable";

AWS.config.update({ region: 'asia-northeast-2' });
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


    s3upload = (files: any, key: string) => {
        return new Promise((resolve, reject) => {
            const params = {
                Bucket: 'zemini',
                Key: key,
                Body: fs.createReadStream(files[0].path),
            };
            const upload = new AWS.S3.ManagedUpload({ service: s3, params });
            upload.send((err, data) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                resolve(data);
            })
        })
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

    convertToWebp = async (files: any, quality = 100) => {
        const uploadDir = path.join(__dirname, '..', '..', 'upload', 'webp');
        if( !fs.existsSync(uploadDir) ) {
            fs.mkdirSync(uploadDir);
        }

        return await imagemin(files, {
            destination: uploadDir,
            plugins: [
                imageminWebp({ quality })
            ]
        });
    }
}


export default new FileManager()